# Validated audit follow-up execution ledger

Execution base/HEAD: `beb1093447a9bd75ee3eee9c28575e4a902b55d7`.
Branch: `codex/validated-audit-follow-up`. Entry index and worktree are clean.
Only H1-H4 and H6-H13 are authorized; H5 stays excluded. No Git mutation is
authorized. All validation commands use normal local PowerShell outside the
managed sandbox. Raw receipts: `tmp/evidence/validated-audit-follow-up/`.

## M0 scope, inputs and scheduling

Owned production paths are the exact owners in the ExecPlan. Tests extend the
existing named test files and the reader browser fixture only where needed.
Maintained documentation comprises this plan/ledger, an additive ADR-0067,
the product settings/testing guidance and their indexes at accepted closeout.
The canonical diagram and completed M005 were reviewed: component boundaries
and the historical prepared-text boundary remain unchanged. Frozen authorities,
corpora, generated tracked outputs, results and completed plans are read-only.

| Gate | Inputs and dependency closure | Decision / invalidation |
| --- | --- | --- |
| D-Desktop / D-EPUB | New VAF cases, production owners and transitive package imports; Vitest/jsdom/config; shared and EPUB dist; package discovery and pnpm lock | Capture intended red before each production correction. Final green comes from F1, without a duplicate focused green. |
| D-Python | New vaf cases, all benchmark consumers, schemas/corpus, test discovery, pyproject, uv lock, interpreter | Capture intended red; final full Python suite once. |
| D-Native | Request path, real loopback fixture, Rust modules, Cargo lock/build script/resources/toolchain | Default focused red; both final Rust configurations supply green. |
| D-Windows | Real NSIS hook, lifecycle/data scripts, Node/PowerShell fixtures, NSIS template/compiler | Focused red; final Node leaf is included in F1. Temporary synthetic roots only. |
| B1 | Complete reader spec, synthetic-service fixture, final frontend/shared/EPUB build, Playwright/Chromium/config | Fresh final affected reader spec. No foundation/raster campaign. |
| N1 | Fresh default binary/frontend/native harness/resources, WebView2/driver, model-free fixture | Fresh post-build smoke. No model gate unless actual scope triggers the plan's condition. |
| L1 | Corrected harness/data companion, retained installer bytes, clean authorized install state, OS/user-data restoration | Initially blocked by personal installation; later separate authorization permits the successful continuation below. |
| F1 TS | All shared/EPUB/desktop sources, fixtures, discovered tests, seven Node suites, generator/config/locks, generated dist, toolchain | Fresh format/lint/types/test leaves. TS test aggregate includes D-Windows. |
| F1 Python | All Python sources/tests/benchmarks, schemas/authorities, pyproject/lock, interpreter/build backend | Fresh format/lint/types/tests/build. Build is inexpensive; complete historical backend equality is not yet proven, so no historical result is assumed. |
| F1 Rust/build | All native modules/resources/build configuration, Cargo lock/toolchain; final Vite inputs and package dist | Fresh format, both Clippy/test variants and one default desktop build. Embedded Vite supplies portable build coverage when inputs match. |
| Evidence | Guard/config/fixtures for tests; current Markdown/index for check | Fresh test:evidence and check:evidence. Cheap fresh run avoids uncertain historical environment proof. |

Snapshots capture full tracked/nonignored source membership and hashes, runner,
pnpm install metadata, generated package dist and native binary identities
before/after each gate. Host versions are captured separately. Changes invalidate
their consumed gates, not independent leaves. Failed receipts are immutable;
infrastructure retry requires a diagnosed changed condition. Current approval
must come from a new exact-patch change_reviewer report.

## Historical evidence and assets

SAC R3/R4, its M3 ledger and raw before/after/result receipts are recoverable in
the original ignored directory. The historical R3 manifest identity is recorded
in the ExecPlan. No historical result or approval is reused for this patch.
Shared/evidence/Python-build receipts remain candidates only; fresh inexpensive
leaves are selected instead of claiming incomplete input/environment equality.
Existing fixtures are reused as test inputs. Retained installer/Piper payloads
are assets, subject to fresh hash/readiness checks before use; they are not
current runtime PASS evidence. No model download/runtime rebuild is planned.

## Host preflight and recovery

Read-only host preflight: PowerShell 7.6.5, Node 24.20.0, pnpm 11.15.1 through
the existing process-local Corepack shim, Python 3.12.10, uv 0.11.29, Rust/Cargo
1.97.1, Windows 26200. NSIS and retained installer exist. No global tool changes
or engine bypass. Both personal installation and personal data exist.

At initial preflight, no installation/data mutation was authorized or performed.
The separately authorized L1 continuation and measured restoration are recorded
below. Synthetic
Node/NSIS/PowerShell fixtures use uniquely named canonical temporary roots with
exact ownership, reparse rejection and awaited cleanup. Native/browser harness
resources retain their existing journals/cleanup. Receipt roots are retained
for recovery, not deleted. No personal-data inventory enters public evidence.

## Results

M0-M3 complete. Corrections, applicable execution gates and the authorized
operation's measured restoration pass. R4 independently approves implementation
and evidence reuse, with the earlier historical metadata limitation explicit.
The completed plan and maintained links have a separate archive identity review.

### Corrections

- H1/H7 reuse the awaited optional recheck and existing recovery callback;
  native summaries and effectively enabled/visible controls define focus bounds.
- H8 uses nonempty sample-frame truth for a completed tail whose duration rounds
  to zero. Synthetic 1/23/24 frames at 100% and 1/17/18 at 75% finish and release.
- H10 revokes completed highlighting's follow/navigation/settlement permission,
  cancels pending follow and retains decoration. Public browser reflow retains
  the manually selected location after final end settlement.
- H6/H11 add ADR-0067's conservative title context and Unicode Mark classification
  in existing owners. Display text, spans, public schemas and frozen corpus stay
  unchanged; exact limits/overflow and public one/many-batch equality are covered.
- H2 shares the actual request-send error boundary with a real local socket
  regression. Cancellation wins before a new diagnostic; production URL/origin
  restrictions remain intact and staging is cleaned.
- H3 retains only a bounded suffix for fragmented matching independently of the
  diagnostic prefix. H4 grants privacy/cleanup PASS only for an observed run with
  no failure code. H12 shuffles presentation records once after synthesis in all
  five quality builders, preserving sample IDs, audio and case associations.
- H9 checks the exact preference subtree independently after removal; unsafe
  ancestors are checked before descending. Locks, denied parents, junctions and
  successful retry are tested using compiled NSIS.
- H13 journals intended installation ownership before launch, retains original
  process handles, cleans owned installation before restoring original data,
  and preserves backups/journals on missing or failed uninstallation. Real
  PowerShell fault fixtures cover partial/nonzero installation, post-install and
  first-start failure, catchable interruption, cleanup failure and success.
  Review R1 identified the missing uninstall deadline. The correction runs a
  hash-verified uninstaller copy inside the owned recovery directory, with
  `_?=<exact installRoot>` last, and waits at most 120 seconds. It then stops the
  owned process with a ten-second termination bound, retains recovery material,
  and does not retry a failed uninstallation or restore unverified data. This
  follows the [NSIS process/exit-code documentation](https://nsis.sourceforge.io/Docs/AppendixD.html#D.1),
  avoiding the self-relocating stub's misleading lifetime/exit status.

### Executed commands and receipts

Every row below ran in local PowerShell outside the managed sandbox. The runner
sets only process-local PATH to the existing Corepack shim (pnpm 11.15.1).
Each ID has an immutable `-result.json`, `.log`, `-before.json`, `-after.json`
under the raw receipt root. No result from the planning/SAC execution is reused.

| Receipt | Exact command / result |
| --- | --- |
| D-Python-red-01 | `pnpm.cmd test:python -k vaf`: 34 failed, 11 passed, the new privacy/audit/presentation regressions. |
| D-EPUB-red-01 / D-EPUB-public-red-02 | Three existing Vitest files filtered by `VAF` failed at title/mark assertions. One initial public fixture used `en` for narration-v1; after correcting it to `und`, its dedicated public case failed at the intended split-mark assertion. Exact commands are in receipts. |
| D-Desktop-red-01 | Four existing Vitest files filtered by `VAF`: 11 failed, 4 passed, 4 unhandled rejections from the old H8 path. Exact command in receipt. |
| D-Native-red-01 | Existing Cargo test command filtered to the new exact loopback test: failed on cancelled request reported as download failure; uncancelled control reached the same real request path. |
| D-Windows-red-01 / 02 | `node --test --test-name-pattern=VAF apps/desktop/scripts/windows-release.node-test.mjs`: initial fixture escaping/variable errors corrected; second receipt reproduces all eight intended lifecycle/preference failures. |
| F-Python-tests-01 | `pnpm.cmd test:python`: 722 passed, one cache-write permission warning; exit 0. |
| F-Python-static-01 | `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`: PASS (183 formatted files; Ruff; mypy 180 files). |
| F-Python-build-01 | `pnpm.cmd build:python`: PASS, wheel and sdist. |
| F-Rust-static-tests-01 | `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust`: PASS; default 140 passed/7 ignored, release-locked 139 passed/7 ignored. Ignored exact-host/model/child-entry cases retain their explicit requirements. |
| F-TS-static-01 | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd typecheck:typescript`: PASS, including fresh shared/EPUB build. |
| F-TS-tests-01 | `pnpm.cmd test:typescript`: shared 210 and EPUB 720 PASS; desktop 912 passed/1 failed. The old focus test copied a selector that focused a disabled-fieldset radio; the new real focus regression passed. Node leaves did not run after this failure. |
| F-Desktop-tests-02 | `pnpm.cmd --filter @voxleaf/desktop test`: 913 Vitest + 109 Node PASS after removing the obsolete selector assertion. The same test still verifies initial Close focus, Escape and lifecycle neutrality; new H7 verifies both wrap directions. Shared/EPUB were not repeated. |
| TS-format-02 | Scoped Prettier/ESLint for the two subsequently changed test files and `pnpm.cmd --filter @voxleaf/desktop typecheck`: PASS. Exact command in receipt. |
| B1-browser-01 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts`: 13 PASS, 1 VAF fixture failure. The optional fixture lacked required CUDA 12.0 capability, so restoring memory did not admit Chatterbox. Trace/screenshot/source retained in `B1-browser-01-artifacts`. |
| B1-browser-VAF-02 | Same command with `--grep VAF`: PASS. Added the required synthetic capability only inside the opt-in fixture branch, plus an assertion of actual selected hardware profile. Unchanged-selection playback, changed-selection containment, no auto-start/download and both real Tab directions pass. The other 13 cases' fixture branches and product inputs are unchanged. |
| F-Desktop-build-01 | `pnpm.cmd build:desktop`: PASS, fresh default executable and Vite build. Existing chunk-size advisory retained. No installer/runtime/model rebuild. |
| N1-native-01 / 02 | `node apps/desktop/scripts/native-startup-smoke.mjs`: FAIL at `synchronization-feasibility-failed`; all reported proof fields pass except `followed=false`. No cleanup failure reported. |
| D-N1-geometry-01 | Ignored diagnostic wrapper logs only numeric synthetic geometry and calls the unchanged native script: PASS. It observes an offscreen initial target at 800x400; this is diagnostic evidence, not a substitute N1 green. |
| Host-inventory-before/after-native-01 | Read-only metadata summaries, executable/installer hashes and named temporary-root inventory. Comparison and process inventory recorded before review. |
| F-evidence-01 | `pnpm.cmd test:evidence` (31 PASS), `pnpm.cmd check:evidence` (PASS), `git diff --check` (PASS). Final report/document additions require only the document guard again. |
| Host-restoration-check-01 | Installed executable and uninstaller hashes and both entry counts unchanged; tracked temporary-root inventory unchanged; zero VoxLeaf/tauri-driver/msedgedriver processes. Full metadata digests differ, so complete host equality is NOT established. |
| D-H13-timeout-red-01 | `node --test --test-name-pattern=hanging-uninstaller apps/desktop/scripts/windows-release.node-test.mjs`: failed at `synthetic-unbounded-uninstall` before correcting R1-F1. |
| F-Windows-static-02 | Scoped Prettier and ESLint on `apps/desktop/scripts/windows-release.node-test.mjs`: PASS. |
| F-Windows-tests-03 | `node --test apps/desktop/scripts/windows-release.node-test.mjs`: 31 PASS, including the new deterministic timeout case and all compiled NSIS/data-ownership cases. Replaces only the invalidated Windows leaf in the previous 109-test Node graph (now 110 total). |
| B1-browser-final-03 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts`: all 14 PASS on the final spec, replacing the incomplete B1 composition identified by R1. |
| F-Native-fixture-03 | Scoped Prettier/ESLint plus `node --test apps/desktop/scripts/native-smoke.node-test.mjs`: 23 PASS. Replaces this leaf's earlier evidence after the fixture readiness edit. |
| N1-native-replanned-03 | `node apps/desktop/scripts/native-startup-smoke.mjs`: PASS (15.22 seconds), uninstrumented, following the recorded bounded replan. All existing synchronization/reader/service/privacy assertions retained; no new application build. |
| Host-N1-replan-before/after-01 | Detailed local per-entry metadata with hashed names: zero changed entries in both personal roots across the final N1 run; no named native processes reported. Does not reconstruct the earlier missing detailed baseline. |

Formatting commands (`Python-format-01`, `Rust-format-01`, `TS-format-01/02`)
were scoped to task files except the configured Rust formatter, whose resulting
diff remained limited to the two intended native files. The detailed commands
and actual environment are retained in their receipts.

### Reuse, omissions and remaining gates

Current-run green leaves are retained only where their consumed input closure
is unchanged: Python, Rust, shared/EPUB, and desktop deterministic tests. The
later changes are documented test-only corrections or Markdown; the two changed
TS test paths received fresh format/lint/type evidence. R1 rejected composing
the 13 earlier B1 passes with a later VAF-only pass: the shared spec identity
changed even though only its opt-in branch differed. B1 was therefore renewed
in full in `B1-browser-final-03` (14 PASS). Review inputs retain hashes, snapshots and the earlier executed source
inside the trace. No old review approval or historical aggregate PASS applies.

The retained installer is only a potential L1 fixture: SHA-256
`445af623e2e1cade3ca62823e3ffabf7f98523ad5a6ad3dfd40b215f2172ee52`.
No model assets were downloaded, executed or rebuilt. GPU/model, six-rate
listening, real-voice quality and release-package matrices do not apply: adapter,
DSP, bootstrap and locked runtime code are unchanged; H8 is synthetic protocol
coverage only. No fresh release deliverable is requested. H9's hook behavior is
proved by the real compiled fixture, not by the old installer.

N1 was first concurrent with B1. After an instrumented serialized diagnosis,
one unchanged serialized retry still failed its offscreen-target precondition.
R2 retained this blocker and permitted a narrow fixture-readiness replan. The
plan then recorded the hypothesis, exact correction, bounded waits and one
further invocation before editing: wait for the requested 800x400 viewport and
two rendering opportunities, retaining every original assertion. The renewed
Node leaf and uninstrumented N1 now pass. No assertion was relaxed and no model
or app build was repeated. The result supports the fixture correction without
claiming the earlier timing hypothesis was independently proven. The original
failures did not establish a defect in the changed highlight owner:
the failing feasibility probe manually creates its own DOM Range/highlight and
does not call that owner. Its required green is now `N1-native-replanned-03`.

At R3, L1 was blocked by the pre-existing personal installation and missing
permission. No installation had then been removed. Separate authorization and
verified recovery subsequently permitted the continuation below; the initial
blocked status is retained in the immutable R3 report.

The native harness used its disposable WebView profile and reported no cleanup
failure. Read-only postflight found no files/directories with LastWriteTime after
the pre-native boundary in either personal root. Nevertheless, the coarse full
metadata digest changed in both roots (entry counts and executable bytes did
not); the original summary did not retain per-entry records, so its cause is
unresolved. Do not claim complete restoration/equality from these summaries.
The three pre-existing named native/lifecycle temporary roots are unchanged and
were not removed. No authorization to delete historical remnants is inferred.
The later replanned N1 has its own detailed before/after receipts: all per-entry
size, modification-time and attribute values match in both personal roots.
This verifies that last run's measured metadata, not the earlier coarse-digest
transition. Before the authorized L1 continuation, no original data had been
restored or installation removed by this task.

Independent review R1: [VAF-R1-20261028](review-R1.md), BLOCKED, identity recheck
PASS. Its actionable H13 finding is addressed above; its original report and
receipts remain immutable. [R2](review-R2.md) confirmed no outstanding code
findings and complete B1; it remained BLOCKED by N1/L1/host uncertainty. N1 is
now renewed after the documented fixture replan. [R3](review-final.md) confirmed
no outstanding code findings and complete N1 while L1 remained blocked.
Its report and identities remain immutable. [VAF-R4-20261028](review-R4.md)
approves the authorized continuation and complete implementation. The plan was
then archived; the exact closing verdict is recorded in
[VAF-R5-20261028](review-R5.md).

### Authorized L1 continuation

Separate permission now covers uninstalling and reinstalling the personal
VoxLeaf installation on this PC. It does not extend Git or publication scope.
`Host-L1-preflight-01` rechecks the retained installer identity, available space,
absence of native processes and absence of reparse points. No package rebuild,
model acquisition or changed release claim is needed. `Host-L1-environment-01`
confirms that the existing process-only Windows PowerShell module prefix selects
Utility 3.1 under pnpm; no global tool or module configuration changes.

Before uninstalling, retain a verified program-file backup and content/metadata
inventories. Move the personal data directory to an exact sibling recovery path
on the same volume, recording ownership and recovery paths before mutation.
Use a separate synthetic pre-existing data root for L1's real rename/restoration
integration; the large personal model/data tree stays outside the test's deletion
scope. The corrected harness runs through the registered command once with the
identified retained installer. A failed gate retains its own receipts and recovery
journal; it must not expose personal data to an unverified residual installation.

Reinstall the identified package, verify all installed program-file bytes,
restore the original shortcuts/registration where needed, then restore the
personal data directory only into a verified absent destination. Compare its
complete membership/file bytes and recorded metadata against the fresh baseline.
Retain recovery material on any mismatch; clean only exact run-owned paths after
verification. This new boundary cannot retroactively explain the earlier coarse
metadata discrepancy. Final acceptance requires a fresh independent review of
the current evidence and exact patch.

A preparatory read-only inspection caught a process-lifetime gap in the ignored
host orchestration, before any uninstall or data relocation. Revision 02 places
handle capture and journal writes within protected cleanup, retains primary
errors and blocks restoration until owned-process exit is verified. Four
outside-sandbox mocked failure cases pass in `Host-L1-orchestration-check-02`;
the independent recheck resolves the finding. Revision 01 and both inspection
reports are retained locally. This does not change the product harness or replace
the forthcoming L1 and final patch review.

The authorized continuation completed successfully:

| Receipt | Exact command / result |
| --- | --- |
| `Host-L1-prepare-01` | Ignored wrapper `host-l1-authorized-01.ps1 -Stage Prepare`: PASS; no uninstall or data relocation. Program backup verified and fresh private content/metadata baseline captured. |
| `Host-L1-authorized-01` | Hash-checked reviewed wrapper `host-l1-authorized-02.ps1 -Stage Run`: PASS; personal uninstall, one L1 invocation, same-package reinstall and measured restoration. |
| `L1-lifecycle-authorized-01` | Process-local module prefix below, then `pnpm.cmd package:windows:lifecycle`: PASS, exit 0, 146.54 seconds. Install, first start, repair, six silent choices, unrelated sentinel preservation and synthetic pre-existing data restoration pass. |
| `Host-L1-cleanup-01` | Reviewed wrapper `-Stage Cleanup`: PASS; only its exact owned recovery root removed after restoration verification. |
| `Host-L1-final-inspection-01` | Ignored inspection helper: PASS; program bytes, application registration, shortcuts and original data restored; owned process exit verified; no owned recovery roots/native processes remain; historical named temporary-root inventory unchanged. |

The exact L1 environment adjustment is local to its child process:

```powershell
$env:PSModulePath = (Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\Modules') + ';' + $env:PSModulePath; pnpm.cmd package:windows:lifecycle
```

Personal data restoration compares complete membership, main-stream file bytes,
sizes, last-write times and attributes against the fresh pre-uninstall baseline.
It does not inspect all Windows metadata fields or alternate streams. Program
file bytes, original application registry values and original shortcut bytes
match. Raw inventories and recovery paths remain private and ignored. The
program backup was deleted only after all checks; original data was moved back,
not deleted. The earlier coarse-metadata discrepancy remains unexplained and
is not relabeled as a verified historical equality. Current before/after evidence
establishes the resumed operation's restoration boundary.

L1 used the previously identified installer only as a harness fixture and for
reinstating the original installation. It does not package this working-tree
patch, validate H9 inside that old installer, or create a new release. H9 retains
its fresh compiled-NSIS coverage. No model/runtime rebuild, model execution,
acquisition or quality reevaluation was needed. Release-specific clean-host and
manual interactive obligations remain separate from this plan's development-host
L1 gate. No source/test/build inputs changed during the authorized continuation;
previously reviewed unaffected green leaves remain eligible for exact-input reuse.

R4 independently accepted the complete patch and the justified reuse, finding
no outstanding code defect or required execution gate. Archiving changes only
the completed plan, its maintained incoming links/indexes, ADR status and this
ledger, while preserving every earlier report. Renewed documentation/link checks
and R5 bind the closing state; no runtime/test/build repetition is justified by
these navigation and status changes. Git staging and publication remain outside
the authorization.
