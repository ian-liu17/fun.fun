# GitHub Pages leaderboard: rules and web SDK only

This implementation uses Firebase Auth and the Firestore web SDK from the static site. It deploys no application server, Cloud Functions or Vercel backend. The Node/Java tools in `leaderboard-tests/` are local test tools only.

## 1. Design and limits

For each of `cat` and `pacman`:

- `runs_{game}/{runId}` contains exactly `uid`, `startedAt`, `finished`, `score`.
- `scores_{game}/{uid}` contains exactly `name`, `score`, `runId`, `updatedAt`.

| Game | MAX_PER_SECOND | Hard cap | Basis in the current code |
| --- | ---: | ---: | --- |
| Cat Sprint | 6 meters/s | 100,000 meters | `world.distance += world.speed / 10`, speed <= 10.5, score = floor(distance / 12), fixed 60 Hz simulation. The maximum is 60 × 10.5 / 10 / 12 = 5.25 m/s; 6 provides margin. |
| Pac-Man | 2,000 points/s | 10,000,000 points | Movement is no faster than one tile per 0.082 s. Pellets award 10/50, ghost combos 200/400/800/1,600 and fruit up to 5,000. The generous lifetime-average allowance accommodates burst rewards and repeated captures; it is not a claim that 2,000 is the exact maximum achievable rate. |

Both games are endless. These hard caps are ranking-policy limits, not maximum possible legitimate lifetime scores. A result above a cap is not eligible. Elapsed time is Firestore server time from run creation through submission, including pauses and waiting on the game-over screen. Fractional seconds are preserved using Duration.seconds() and Duration.nanos().

## 2. Firestore rules

Paste the **entire root `firestore.rules` file** into **Firebase console > Firestore > Rules > Publish**. Committing or pushing this file to GitHub does not publish Firestore rules. This work does not change production rules automatically.

Only the four named collections are permitted; everything else and all client deletes are denied. Run reads belong to the owner; score reads are public. Extra/missing fields, invalid types, bad ownership, mutable start times, over-cap results, and implausible lifetime rates are rejected.

Best-score writes use both `get()` and `getAfter()` on the matching game's run: it must exist unfinished before the commit and be finished with the same owner and score afterward. Thus a best-score write must atomically finalize that run; an old finished run cannot be replayed. Existing bests cannot decrease. Equal-score writes are allowed by the rules as requested, but the frontend only writes strictly better bests.

Snake multiplayer uses Realtime Database, not Firestore. This file does not alter its separate database rules.

## 3. Frontend flow

`leaderboard-core.js` contains the testable SDK flow; `leaderboard.js` imports the real Firebase web SDK and renders the UI.

1. Restore Auth; if no account exists, sign in anonymously. Anonymous Auth must be enabled. Google sign-in is optional and must be configured if used. Add the actual GitHub Pages/custom domain to Auth authorized domains. Sign in with the desired account before starting; changing accounts prevents submission of an old identity's run.
2. Validate the game name against Cat/Pac-Man; create a random run ID with `uid`, `serverTimestamp()`, `finished: false`, `score: 0`. Gameplay starts only after creation is acknowledged.
3. At game over, require the same signed-in UID, a valid integer score and a 1–20-character trimmed name. Coordinate duplicate submissions locally.
4. Read the current personal best using `getDocFromServer()`. In one `writeBatch()`, update the run with only `{finished: true, score}` and, only for a strictly better best, set the exact score document with a server timestamp.
5. Mark the run submitted only after commit succeeds. Failed writes remain retryable. If another tab raised the best, retry reads it again and can finalize the lower result without changing the best.

Client validation is for UX. Attackers can bypass it; Firestore rules are the enforcement boundary.

## 4. Leaderboard UI and tests

Landing and game-over screens have a Leaderboard button. The dialog has separate Cat/Pac-Man tabs using `orderBy('score', 'desc')`, `limit(10)`. The current Auth UID is highlighted when present in the top ten. Names use `textContent`, so names cannot inject HTML. Stale responses cannot overwrite a newly selected game tab.

Validated November 20, 2026:

- **35 actual Firestore emulator tests passed**, using `demo-funfun-leaderboard`, never the production project. These include legitimate writes as well as denied attacks, owner/private reads, timestamp forgery, both bounds, schema violations, replay, cross-game references, missing runs, monotonic bests, atomic rollback, competing-tab races, default denial and all deletes.
- **14 client-flow tests passed**, including sign-in coordination, exact fields, atomic writes, lower/equal scores, retries, duplicate submissions and account changes.
- **7 browser UI checks passed** with an isolated SDK fixture: top-ten ordering, highlighted row, tab switching, inert hostile names, phone layout, actual Cat game-over submission, and both game-over leaderboard buttons. These browser fixture tests do not substitute for the real emulator rules tests.
- JavaScript syntax checks passed. No production run or score documents were created for testing.

To repeat, install Node.js 22+ and Java 21, then:

```powershell
cd leaderboard-tests
npm ci
npm run test:unit
npm run test:rules
```

The emulator test runner uses only a demo project, copies the current root rules into an ignored local file and records verbose logs in ignored `rules-results.log`. The browser test also needs Playwright installed (or the existing sibling `minecraft-encyclopedia` development dependencies) and Edge, with `BROWSER_PATH` available to override the executable path.

## What is blocked

- Unauthenticated writes and another UID's run/score writes or private run reads.
- Forged historical/future start times, nonzero starting scores and already-finished new runs.
- Extra/missing fields, invalid score/name/run ID types and lengths, and client update timestamps that do not match server time.
- Intermediate run edits, UID/start-time changes, reopening or changing finished runs.
- Negative/fractional scores, results above the hard cap or elapsed-time allowance.
- Missing, unfinished, foreign, other-game or mismatched-score run references.
- Finished-run replay, separate finish-then-score writes and create-and-finish bypasses.
- Decreasing a personal best, racing a lower stale best over a higher one, any client delete, or accessing unlisted/nested collections.

## What cannot be stopped

A modified client, direct web SDK caller or bot can start a run, wait long enough and fabricate any score under the hard/time caps. Waiting, pauses and delayed submission increase the allowance. These rules do not verify actual movement, collisions, lives, pellets, ghosts or game state. They do not prove one human per UID, prevent multiple anonymous accounts, or provide comprehensive spam/cost protection. Names and all score documents are public. Publishing new rules does not repair existing forged or corrupt data; trusted Admin SDK access bypasses rules.

The real fix is a trusted authoritative server that calculates or validates gameplay and writes the score, with direct client score writes denied. GitHub Pages cannot host that server. It would require a separate backend, outside this requested setup.

`firebase-config.js` contains only the existing public Firebase web configuration. No service-account key, private key or secret credential is added to the repository.

References: [atomic write validation](https://firebase.google.com/docs/firestore/manage-data/transactions#data_validation_for_atomic_operations), [rules emulator testing](https://firebase.google.com/docs/firestore/security/test-rules-emulator), [duration precision](https://firebase.google.com/docs/reference/rules/rules.Duration).
