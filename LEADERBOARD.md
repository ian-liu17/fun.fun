# Firebase leaderboard on GitHub Pages

1. Design: each game uses `runs_cat` / `scores_cat` or `runs_pacman` / `scores_pacman`. Runs contain exactly `uid, startedAt, finished, score`; best-score documents contain exactly `name, score, runId, updatedAt`. Score document IDs are Firebase Auth UIDs.
2. Rules: paste the entire `firestore.rules` into Firebase Console > Firestore > Rules > Publish. These rules replace existing Firestore access: every other path and all deletes are denied. No rules have been published by this local edit.
3. Front end: `firebase-config.js` reuses the public web config found in `.validation/firebase-check.html` for `fun-fun-142e6`. Confirm this is your intended project. Enable Anonymous Auth for the automatic signed-in run flow. Google sign-in is optional; enable Google Auth to use the leaderboard's Google button. Add your actual GitHub Pages/custom domain to Auth authorized domains. Sign in with Google before starting a run to keep scores with that identity; switching accounts during a run prevents its submission. Anonymous identities depend on the browser's stored account.
4. Flow: starting a game restores Auth or signs in anonymously, then awaits the server-confirmed run creation. Game over shows a name/submit form. Submitting reads the current best from the server, then commits one batch: finalize the run and, only for a strictly better score, set the best-score document. Lower/equal runs are finalized without changing the best. Submit before restarting. Failed batches leave the run available for retry; if another tab increased the best, retry reads it again. No client clock is trusted by rules.
5. Leaderboards: landing pages and both game overlays have a Leaderboard button with Cat/Pac-Man tabs. Reads use `orderBy('score', 'desc'), limit(10)` and highlight the current UID when present. Names render through `textContent`.
6. Publish these source files through your usual GitHub Pages workflow: `index.html`, `fun.fun.html`, `pacman.html`, `pacman.js`, `leaderboard.js`, `firebase-config.js`. No server or Sites hosting is used.

## Limits selected from the game code

| Game | MAX_PER_SECOND | Hard cap | Reason |
| --- | ---: | ---: | --- |
| Cat Sprint | 6 meters | 100,000 meters | Score is floor(distance/12); distance increases by speed/10 per update, capped at speed 10.5. Fixed 60 updates/second gives a maximum 5.25 meters/second. Six allows margin. The former per-display-frame simulation was made fixed-rate. |
| Pac-Man | 2,000 points | 10,000,000 points | Player moves no faster than one tile per .082 seconds. Dots award 10/50, ghost combos 200/400/800/1,600, fruit up to 5,000. The generous average rate accommodates bursts and repeated ghost captures. |

Both games are endless. Hard caps are leaderboard policy limits, not proven maximum possible scores. Scores above them cannot be submitted. The time bound includes pauses, network delays, and time spent on the submission form. It uses Firestore's server time, including fractional seconds.

## What the rules reject

- Unauthenticated writes, another UID's run updates or score writes, and reads of another UID's run.
- Backdated/future client start timestamps, nonzero starting scores, or already-finished newly created runs.
- Extra/missing fields, wrong score types, negative scores, invalid name types/lengths, or client-selected update timestamps.
- Changes to a run's UID/start time, intermediate score edits, reopening or editing a finished run.
- Scores above either the game cap or the elapsed-time allowance.
- Score submissions referencing missing, unfinished, another player's, or another game's run, or a run with a different score.
- Reusing an already-finished run for another leaderboard write. A best-score write requires a previously existing unfinished run to become finished in the same atomic commit, using both `get()` and `getAfter()`.
- Reducing a personal best, deleting any document, and accessing any unlisted collection.

## What this cannot prove

A modified browser, console script, bot, or direct SDK caller can create a run, wait long enough, and invent any score within its allowance. Pausing/waiting pads that allowance. Rules cannot verify movement, collisions, lives, speed, fruit collection, or actual play. Players can open multiple runs or create many anonymous identities; there is no per-person uniqueness, abuse quota, or reliable protection against database-cost spam. Display names are not verified identities. Existing corrupt score documents are not cleaned up by publishing rules. Trusted Admin SDK access bypasses rules.

The real fix is a trusted authoritative server that calculates or validates the score from game state and writes the leaderboard, with direct client score writes denied. GitHub Pages only serves static files and cannot host that server; it would require a separate service, outside this requested setup. No secret or service-account keys are included; Firebase's public web config is intentionally public.

## Verification

`node --check leaderboard.js`, `node --check firebase-config.js`, `node --check pacman.js`, and `node .validation/leaderboard-test.cjs` passed (Node was run through the installed VS Code executable). The flow tests cover run creation, atomic best-score writes, lower scores, duplicate submission, malformed input, failed-commit retry, and Cat module syntax.

The browser smoke test `.validation/leaderboard-browser.cjs` was attempted but did not pass: the browser returned no page output in this environment, and direct Firebase CDN access was unavailable. No successful browser, emulator, or live Firestore enforcement test is claimed. Before production use, test the rules in the Firebase Emulator Suite or Rules Playground with separate authenticated UIDs, and verify a real run and top-10 read after publishing.
