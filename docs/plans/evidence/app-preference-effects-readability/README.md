# App preference effects acceptance evidence

Completed [ExecPlan](../../completed/app-preference-effects-readability.md),
unit `APP-PREFERENCE-EFFECTS-01`. Execution HEAD remains
`02259dea3be33202a01ea09ca6609c728536bf0b` on
`codex/app-preference-effects-readability`. No staging, commit, push, PR, merge
or main mutation. All acceptance commands ran in local PowerShell outside the
managed sandbox. Auditor/worker: Sol high; independent validator: Astra high.

Both required connections and presentation types now live in
`apps/desktop/src/settings/app-preference-effects.ts`. App retains state,
defaults, repositories, coordinators, refs, handlers and remaining effect order.
The system diagram was reviewed and still matches that ownership and data flow.

## Immutable reports

Each report below records exact commands/results, starting/ending HEAD,
closed source paths with porcelain/SHA-256/filter-aware blob identities,
identity recheck, scope/invariant/test/privacy reviews and limitations.
Full Report IDs use prefix `APP-PREFERENCE-EFFECTS-01-`.

| Report | Verdict | Evidence |
| --- | --- | --- |
| [BASELINE-001](baseline-001.md) | BLOCKED | Session pnpm version mismatch before compilation. |
| [BASELINE-002](baseline-002.md) | PASS | Six baseline commands; clean source and new modules absent. |
| [CHARACTERIZATION-001](characterization-001.md) | FAIL | Tests/types pass; format and two unused mock parameters fail. |
| [CHARACTERIZATION-002](characterization-002.md) | PASS | Four checkpoint commands; production byte-identical. |
| [POST-CHANGE-001](post-change-001.md) | BLOCKED | Six gates pass, native session cannot start with stale PATH driver. |
| [POST-CHANGE-002](post-change-002.md) | PASS | Seven gates including Chromium and packaged native restart/restoration. |
| [PACKAGE-001](package-001.md) | PASS | Full portable aggregate. |
| [FINAL-001](final-001.md) | FAIL | Unchanged release-locked Rust child-reaping assertion; later stages not reached. |
| [FINAL-002](final-002.md) | PASS | Full unchanged aggregate rerun, both Rust suites, Python and native builds. |

## Orders and phase evidence

- [Refreshed audit and draft terms](audit-and-orders.md).
- [Frozen characterization order](characterization-order.md) and
  [test-only Change Packet](characterization-change.md).
- [Mechanical correction order](correction-01.md), the only source correction
  loop used; all assertions retained.
- [Characterization ceiling refresh](ceiling-refresh.md).
- [Frozen extraction order](extraction-order.md) and
  [final measured ceiling addendum / Change Packet](extraction-ceiling-addendum.md).
- [Verified driver prerequisite diagnosis](host-driver-prerequisite.md).

The same source passed POST-CHANGE-002, PACKAGE-001 and FINAL-002. The full
patch is 1,419 added/deleted lines across four code/test paths, below the audited
1,500 ceiling. App.test remains exactly the accepted checkpoint bytes. New
coverage: 28 App cases plus 16 colocated hook/binding cases. No prior report
was edited to refresh approval hashes after a source change.

## Final command results

| Exact command | Final result |
| --- | --- |
| `pnpm.cmd build:packages` | PASS |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | PASS |
| `pnpm.cmd --filter @voxleaf/desktop test` | PASS: 56 files / 646 Vitest and 51 Node tests |
| `pnpm.cmd format:check:typescript` | PASS |
| `pnpm.cmd lint:typescript` | PASS |
| `pnpm.cmd test:browser` | PASS: seven Chromium scenarios |
| `pnpm.cmd test:native-startup` | PASS: packaged startup/restart/restoration, cleanup, zero errors/external requests |
| `pnpm.cmd check:portable` | PASS: shared 209, EPUB 651, desktop 646, Node 51, Python 485; types/lint/builds |
| `pnpm.cmd check` | PASS on full unchanged repeat: above suites plus Rust 87 default / 88 release-locked and native build |

## Limitations retained

The final aggregate initially failed the unchanged Rust child-reaping assertion;
the same complete command passed on the next run without source edits or test/
environment relaxation. The intermittent cause was not established or repaired.
Nonfatal pytest nodeids-cache permission and existing Vite chunk-size warnings
remain. Verified pnpm 11.15.1 and matching Microsoft-signed EdgeDriver were
selected through process/session-only settings, not global configuration.

Observed late active hydration can replace earlier presentation updates and
is preserved; callback characterization does not establish a new product policy
or confirmed reachable user defect. No model-backed benchmark or performance
claim is added. Raw outputs and temporary artifacts belong under ignored
`tmp/evidence/`; this collection contains concise reports and source identities.
