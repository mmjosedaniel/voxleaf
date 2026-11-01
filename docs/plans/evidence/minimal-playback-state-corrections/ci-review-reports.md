# CI follow-up independent review reports

## PSC-CI-R1-20261101

Task ID: PSC-CI-20261101

Reviewer: `change_reviewer` (GPT-6 Astra high), read-only; no tests or edits.

Verdict: **APPROVE — bounded App-test and native-diagnostic patch only.**

Base commit and reviewed HEAD: `91f17ab6e393f61d4bd97815c9ad1baa14b6b751`.
Branch: `codex/minimal-playback-state-plan`.

Closed manifest: `tmp/evidence/psc-ci-follow-up/review-manifest.json`, SHA-256
`6b43de71c08bba62373ac01b62c71baf8a1cfe362efac4640286de858c795180`:
six task paths, fourteen supporting paths and 48 receipt artifacts.
Complete tracked diff: `tmp/evidence/psc-ci-follow-up/patch.diff`, SHA-256
`1e96e5d853e81150645ca42385a3a49284f1c0f1c923efd827a189af1c1b1c9b`.
The new `ci-follow-up.md` was read directly. This report is outside its manifest.

Identity recheck: **PASS**. Base/HEAD, path statuses, SHA-256 hashes,
filter-aware blobs and receipt identities matched before/after inspection.
The saved diff matches the actual patch. All 251 generated exports match;
the index remains empty. No pre-existing changes were included.

Acceptance review:

- The three failing App cases now observe `startAtVisibleLocator()`, matching
  the approved primary-Play contract. Exact offsets 7/13, delayed ownership
  handoff, latest-publication selection and rejected/uncontained shutdown
  assertions remain. Added assertions reject unintended internal `start()`.
- Native diagnostics retain fixed codes from nested cleanup failures.
  Traversal inspects at most eight entries, deduplicates output and terminates
  with cyclic causes. Unknown error text remains suppressed. Initial process
  ownership capture receives a distinct stage.
- Failure exits, deadlines, ownership verification, cleanup attempts and
  scratch-retention behavior remain unchanged. No acceptance assertion or
  cleanup safeguard is bypassed.
- Documentation distinguishes repaired diagnostics from the unresolved
  original hosted Windows failure. Application runtime, privacy, persistence
  and playback behavior are unchanged by this incremental patch.

Supplied normal-local-PowerShell evidence reviewed:

| Receipt | Evidence |
| --- | --- |
| `app-before` | Exactly three App failures reproduced; 75 passed |
| `diagnostic-before` | Two intended diagnostic failures reproduced |
| `final-directed` | 93 App/control tests and 65 native/client tests passed |
| `static-final` | TypeScript formatting, lint and desktop typecheck passed |
| `native-before`, `native-after` | Ordinary WebView2 smoke passed; zero new owned processes or scratch roots |
| `evidence-final` | Evidence guard and `git diff --check` passed |

Final directed commands:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/tts/ProductNarrationControls.test.tsx
pnpm.cmd --filter @voxleaf/desktop exec node --test scripts/native-smoke.node-test.mjs scripts/native-webdriver-client.node-test.mjs
```

The final directed receipt matches current source/tests; subsequent differences
are documentation only. Static and native receipts likewise match their
consumed code. No partial-result retention is required. The native executable
remains SHA-256
`09e69a0f47531c2df9952b1a92a2bf09ae814bafca376c84c3b1e6162ed48932`;
the wrapper verifies it before/after execution and checks process/scratch cleanup.

Findings: **None**.

Remaining uncertainty: the original hosted Windows startup cause and cleanup
outcome remain unproven. Local success does not establish that it was transient
or repaired. No result from the ongoing hosted retry is assumed.

Required next action: no correction required for this exact patch. Complete
required hosted checks on the subsequent candidate and investigate any remaining
Windows failure before declaring the user's CI task complete. Approval does not
establish green CI or grant Git/publication permissions.

## PSC-CI-R2-20261101

Task ID: PSC-CI-20261101. Reviewer: `change_reviewer` (GPT-6 Astra high),
read-only, no tests or edits. Verdict: **APPROVE — bounded native-restart
harness patch only**.

Base commit and reviewed HEAD: `6e338eb29fb15783ba0ec7a10eeb787b57898266`.
Branch: `codex/minimal-playback-state-plan`.

Closed manifest: `tmp/evidence/psc-ci-follow-up/review-manifest-r2.json`, SHA-256
`6850efb9f02d5ae56d6a0fadd2e8d7515f97a72dde52d1d48ac784888e2c4bc6`:
16 task/support paths and 97 receipt artifacts. Tracked diff `patch-r2.diff`,
SHA-256 `5163e0381ba9604b9202096342a807cbefac761e2790313363e4279b48d5b5da`.
The new `ci-restart-follow-up.md` was read in full.

Identity recheck: **PASS**. Base/HEAD, statuses, content hashes, filter-aware
blobs and receipts matched before/after review. Saved and actual diffs match;
all 251 generated exports match. Index empty; no pre-existing changes included.

Acceptance review:

- Application subtree captured before deletion; root verified against prior
  PID, creation time and executable. Newly captured children enter final-cleanup
  ownership before deletion. Persistent driver/bridge processes are excluded.
- Session deletion precedes waiting; replacement follows verified exit and
  an abort check. Exact identities and held handles share one ten-second waiting
  budget. No process is terminated by the wait. Missing/replaced identities do
  not cause waiting on unrelated processes; inspection error or timeout blocks
  restart.
- Existing cleanup, failure exits, persistence assertions and privacy checks
  remain. No retry, profile deletion or application-runtime change is added.
- Microsoft's browser-process lifecycle guidance supports the boundary but
  does not establish the hosted failure's cause.

Reviewed normal-local-PowerShell receipts:

| Receipt | Outcome |
| --- | --- |
| `restart-before` | Two intended restart failures; existing diagnostic controls passed |
| `restart-final` | 68 native/client tests passed; format, lint and desktop typecheck passed |
| `restart-native-final` | Complete ordinary WebView2 smoke passed, including same-profile restart and exact persistence |
| `restart-evidence` | Evidence guard and whitespace check passed |

Command: `pnpm.cmd --filter @voxleaf/desktop exec node --test scripts/native-smoke.node-test.mjs scripts/native-webdriver-client.node-test.mjs`.
Coverage includes deferred exit, propagated verification failure, an actual
Windows process remaining alive after timeout, identity mismatch, delayed exit
and already-exited handling. Final receipts match reviewed code/tests;
subsequent differences are documentation only. Earlier candidate/probe failures
remain preserved and are not acceptance evidence.

The native binary remains SHA-256
`09e69a0f47531c2df9952b1a92a2bf09ae814bafca376c84c3b1e6162ed48932`.
The final wrapper checks before/after identity and zero new owned processes or
scratch roots. Existing scratch/resources remain preserved.

Findings: **None**. Remaining uncertainty: the generic hosted session-creation
error does not prove that the missing barrier caused it; the earlier initial
startup/unknown-error remains unexplained. Local success does not prove green CI.
Required next action: complete hosted checks on the next candidate and
investigate remaining failures. Approval grants no Git/merge/publication rights.

### Coordinator observation after R2 review

Foundation run `41258964766` on `6e338eb` completed: Ubuntu portable and Rust
passed; Windows again failed at native restart session creation with
`webdriver-session-not-created`. Its original log is retained locally as
`tmp/evidence/psc-ci-follow-up/6e338eb-windows.log`. This does not alter the R2
report or claim a result for the subsequent restart correction.
