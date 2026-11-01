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
