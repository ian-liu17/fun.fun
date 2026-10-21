# Snake Arena: Rival Respawn Requirements

Updated: October 18, 2026
Status: Implemented in local source on October 18, 2026. Validation results are reported separately.

## 1. Goal

Keep Snake Arena populated with opponents as players grow and explore. Eating all rival snakes must never produce a victory. Whenever players eat two rival snakes, generate a random batch of one, two, or three new rivals somewhere else in the arena.

Interpretation of the request: every pair of player-eaten rivals triggers one batch, with each batch size chosen independently and with equal probability from 1, 2, and 3. The current exploration objective remains in place because the requested change concerns rival replenishment rather than a replacement objective.

## 2. Current files and behavior

| File | Current role and relevant behavior |
| --- | --- |
| `prd.md` | Empty before this update. This document establishes the detailed requirements. |
| `snakes.html` | Contains the Snake Arena UI, styles, configuration, movement, AI, collisions, spawning, HUD, exploration victory, XP, and revive logic. Main implementation target for this feature. |
| `fun.fun.html` | Arcade selector and Cat Sprint game. Snake Arena is embedded using an iframe pointing to the deployed `snakes.html` URL, with a direct link alongside it. Local Snake Arena changes will only appear in that iframe after deployment. |
| `index.html` | Landing page linking to the arcade and directly to Snake Arena. No respawn logic lives here. |
| `online.js` | Referenced by `snakes.html`, but absent from the current workspace. Online behavior cannot be verified from the supplied files. |

Relevant implementation details in `snakes.html`:

- `CONFIG` defines a 2000 x 1280 world, 15 starting rivals, and 300 pearls.
- `reset()` creates one or two human players and 15 named AI rivals. Initial rivals have sizes 1 through 15; players begin at size 1.
- A larger snake eats a smaller snake on body contact and gains its size. Equal-size snakes do not eat each other, and human teammates cannot eat each other.
- `step()` currently increments a temporary `replacements` count for every AI rival eaten, including rivals eaten by other AI snakes. It immediately calls `spawnRival()` once per replacement. This is one-for-one replacement, not the requested two-eaten batch rule.
- `spawnRival()` creates a size-1 AI rival, attempts placement inside the current camera view, and checks distance from living snake heads. It does not check clearance against every body segment, and it can accept an unsafe final candidate after its attempt limit.
- Exploration uses 80-unit cells: 25 columns x 16 rows = 400 cells. Living human players contribute to shared coverage; visiting every cell is the current victory condition.
- The HUD displays live rival count, pearls, exploration percentage, player stats, XP, and a top-five ranking. Pause, restart, player revive, and local two-player controls already exist in the source.

Source issues to account for during implementation: the current `spawnRival()` contains malformed doubled quotes in its rival-name expressions. The referenced `online.js` file is missing, although the game calls `net` methods. These are existing blockers to reliable runtime verification, not changes completed by this PRD.

## 3. Scope

Change rival replacement rules, spawn placement, and the instructions/feedback needed to explain them. Preserve existing movement, growth, pearls, controls, team collision rules, XP, revive costs, leaderboard rules, and exploration victory.

Cat Sprint and the arcade navigation are outside the feature scope. Arcade copy may be refreshed to explain recurring rivals, but it must remain consistent with the actual deployed game.

## 4. Pair-based respawn rules

### 4.1 Qualifying eats

1. Count an eat only when a living human-controlled snake consumes a living AI rival through the existing collision rules.
2. Increment the eater's existing personal kill statistic once and increment a separate shared respawn-progress counter once.
3. In local two-player mode, both players contribute to the same counter. One eat by each player completes a pair.
4. AI-on-AI eating, AI eating a player, pearl collection, border deaths, and player revivals do not increment the pair counter.
5. Resolve each consumed rival once. Its dead object must not contribute another event later in the same update.

### 4.2 Trigger and batch size

- Begin each new game with progress 0 of 2.
- After the first qualifying eat, show progress 1 of 2; do not create a normal batch yet.
- After the second qualifying eat, subtract two from progress and enqueue exactly one batch.
- Choose an integer batch size from 1, 2, or 3, with a one-third probability for each. Choose once per batch and retain that result through placement retries.
- Process every completed pair even when several rivals are consumed in the same simulation update. Five qualifying eats produce two independently chosen batches and leave progress at 1 of 2.
- Spawned rivals can later be eaten and count toward future pairs.
- Remove the existing immediate one-for-one replacement path so it cannot run alongside this feature.
- Resolve collisions against the existing snakes before inserting new rivals, preventing newborn rivals from being eaten during the update that created them.

Example: starting with 15 rivals, two player eats leave 13 survivors. A batch of 1, 2, or 3 produces 14, 15, or 16 living rivals respectively, assuming no other deaths. The population is allowed to vary; 15 is the starting count, not a required steady count.

### 4.3 Preventing an empty arena

A random batch can contain only one rival, and AI snakes can also consume rivals. Pair-based spawning alone therefore cannot guarantee that opponents remain available.

If no living AI rivals remain during an active game, and no normal batch is pending, queue one recovery rival. This recovery does not consume or reset pair progress. If progress was 1 of 2, eating the recovery rival completes the pair normally. Do not enqueue repeated recovery rivals while one is awaiting safe placement. Zero rivals must never invoke victory or end the game.

This recovery rule is a supporting design decision to keep the requested recurring-opponent loop playable.

## 5. Spawn location and rival properties

- Sample locations across the full world, including areas outside the current viewport. Do not restrict replacement rivals to the camera rectangle.
- Every new rival begins at size 1 and uses the existing AI, movement speed, palette, and naming style.
- Assign a distinct in-session identity and name suffix as needed. Do not reuse a consumed snake object with stale score, shield, trail, or AI state.
- Keep the entire initial body inside the arena, with at least 40 world units between its center and each border.
- Require at least 140 world units between a candidate center and every living snake body segment, including human players, AI rivals, and rivals already placed from the same batch.
- Require at least 140 world units from the consumption locations that triggered that batch. This makes the new rivals appear elsewhere rather than on top of the eaten snakes.
- For a recovery rival, apply the same living-body clearance and avoid the most recent rival-consumption location when available.
- Select an initial heading whose initial body remains within the arena and satisfies clearance. Build its trail and body before validating the candidate.
- Try at most 100 random candidates for each pending rival per simulation update. If none is safe, keep the rival queued for a later active update. Never accept an unsafe final candidate solely because attempts ran out.
- Spread later retries over active updates to keep rendering responsive. Each queued rival must be inserted exactly once when a valid position becomes available.

## 6. Lifecycle and game outcome

- Clear pair progress, pending batches, recovery requests, and consumed-location history on restart or a new game.
- Preserve progress and pending batches through pause and player revival. Do not spawn while paused, on the setup screen, during the revive overlay, or after a game has ended.
- Preserve existing loss handling when all human players are out and revival is skipped or unavailable.
- Keep exploration of all 400 cells as the victory condition. A living player reaching full shared exploration may win even when rivals remain.
- Becoming the largest snake or earning king XP must not become a new victory trigger.
- Stop processing queued spawns when victory or loss occurs. A new game starts with a fresh queue and the normal 15 initial rivals.

## 7. Player-facing feedback

- Update setup instructions: "Eat smaller rivals to grow. Every two rivals you eat bring 1-3 new snakes somewhere else. Explore the whole arena to win!"
- Add a compact progress indicator such as "Next respawn: 0/2 eaten" or "Next respawn: 1/2 eaten". Explain that progress is shared in two-player mode.
- After a batch is placed, show brief feedback such as "2 new rivals appeared!" Use the number actually placed; delayed placements must not claim rivals appeared before insertion.
- Keep the existing Rivals HUD tied to living AI snakes only, excluding dead objects and queued spawns.
- Add spawned rivals to ranking immediately after insertion. Preserve pearl scores and existing personal kill totals independently of pair progress.
- Never display "you win" or equivalent messaging because the rival count reaches zero.

## 8. Implementation guidance

In `snakes.html`, keep configuration values for the pair threshold (2), allowed batch sizes (1-3), safe clearance (140), and candidate-attempt limit (100) together. Add explicit session state for shared pair progress and pending spawns rather than overloading personal `kills` or the per-update `replacements` variable.

Update `step()` to record qualifying player eats and their world coordinates, enqueue batches after collision resolution, and process safe placements before updating the HUD. Preserve the existing pearl replenishment and exploration logic. Refactor `spawnRival()` into a safe-placement operation that reports success or deferral, and fix the malformed name literals as part of making that path executable.

Account for dead rival objects accumulating in `snakes`. Retire dead AI objects after event processing when no pending references require them; preserve human player objects needed for revival. Avoid unbounded repeated scans over dead rivals during long games.

If online play is restored, only the authoritative host may choose batch sizes, advance counters, and create rivals. Guests must receive authoritative rival identities, positions, progress, and feedback without generating their own batches. Inspect the restored networking implementation before defining its message format; the missing file prevents specifying verified integration details now.

## 9. Acceptance criteria

| Scenario | Expected result |
| --- | --- |
| Start a game | 15 initial rivals, pair progress 0/2, no pending replacements. |
| Eat one rival while others remain | Progress becomes 1/2; no normal spawn batch. |
| Eat a second rival | Exactly one batch of 1-3 rivals is chosen; progress returns to 0/2. |
| Eat five rivals in one update | Two independent batches are queued; progress remains 1/2. |
| Two players eat one rival each | Their shared pair triggers one batch. |
| AI consumes another AI | No pair-progress increment and no one-for-one replacement. |
| Consume the final rival at progress 1/2 | A normal batch is queued; no redundant recovery spawn. |
| Arena becomes empty without a normal batch | One recovery rival is queued, progress is preserved, and play continues. |
| Equal-size contact or pearl collection | No rival-eat event and no pair progress. |
| Safe spawn position is found | New size-1 rival appears elsewhere with a valid body, unique identity, and normal AI. |
| No safe position exists | Spawn remains queued; no overlap, invalid border placement, or forced unsafe fallback. |
| Spawn completes | Rivals HUD and leaderboard reflect actual living snakes. |
| Pause or revive overlay opens | Pair progress survives; pending placements wait until active play resumes. |
| Restart | Progress and pending requests clear; normal initial population is restored. |
| Rival count reaches zero | No victory overlay; recovery or queued spawning maintains the loop. |
| Human players explore all 400 cells | Existing exploration victory occurs regardless of rival count. |
| All players die and do not revive | Existing loss flow remains intact. |

Validate all three batch sizes with controlled random choices rather than relying on chance. Exercise multiple consumption events in one update, shared two-player progress, delayed placement, and the empty-arena fallback. Run browser checks for setup, play, pause, revival, restart, and exploration outcome after the existing script blockers are addressed. Verify both the direct Snake Arena page and the arcade iframe against the intended deployed version.

## 10. Completion boundary

The respawn feature and local startup fixes are implemented in snakes.html. game.html forwards to that game; index.html provides an updated title screen, and the arcade loads its local game file. Online play is implemented in online.js using direct WebRTC and manual code exchange; see section 12. Deployment is separate. The requested core rule is fixed at two player-eaten rivals per random batch of one to three new rivals; the recovery rule, safe-placement distances, and equal batch probabilities are explicit implementation defaults documented here.


## 11. Easier difficulty update

The player now starts at size 5. The 15 initial rivals cycle through sizes 1-4, making every initial rival smaller than the player. Replacement rivals still start at size 1. Players retain speed 87; rival speed is reduced to 60 world units per second. Rival hunting begins after 20 seconds instead of 5, and its detection range is reduced from 190 to 110 units. These values supersede the original starting-size and shared-speed descriptions above. Two-player mode receives the same starting advantage. Pearl growth, exploration victory, and the two-eaten / 1-3 respawn rule remain in place.

### Starting-size correction
The player starts at the original size 1. All initial rivals now start at size 1, replacing the earlier player size 5 and rival size 1-4 settings. Replacement rivals remain size 1. Collecting one pearl lets the player eat an ungrown rival. Slower rivals and delayed hunting remain enabled.

## 12. Online play without a database

Implemented with browser WebRTC data channels in online.js. No database, account, game server, room directory, or hosted signaling service is required. Each connection supports a host and one friend. Both open Snake Arena. The host chooses Play Online > Host Game and shares the host code. The friend chooses Join Game, pastes that code, creates a reply code, and sends it back. The host pastes the reply and chooses Connect friend, then Start together. Every connection uses fresh codes. Public STUN services assist network discovery; game state travels directly between browsers.

The host simulates both players, AI, collisions, pearls, shared exploration, XP, revives, and random respawn batches. Guests send steering only and render snapshots up to 20 times per second with interpolation. Each device follows its own living snake or the surviving teammate. Both players and all initial rivals start at size 1. Slower AI and the two-eaten / 1-3 respawn rule remain enabled.

The host controls pause/resume, restart, and shared-wallet revives. Guests see the corresponding pause, revive, win, and loss screens. Leaving or losing the connection stops the session and offers reconnection with new codes or local play. Guest snapshots never persist host XP or scores to guest local storage. Large snapshots use bounded chunking and send backpressure.

Limitations: networks requiring a TURN relay are not supported by this direct configuration. Failed connections display retry instructions. There is no automatic matchmaking, persistent online leaderboard, or host migration. HTTPS static hosting is recommended to share the game. Source changes require deployment before they appear on a published website.
