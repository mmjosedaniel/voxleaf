# Confirmed chat findings execution ledger

Base and current HEAD: `4b10dc0a7cc400b5b3c1a9ac2010ceb1e801afef`.
Branch: `codex/confirmed-chat-findings-plan`. Initial worktree and index clean.
The user authorizes implementation and necessary validation, with no staging,
commit, push, PR, merge or publication. The
[ExecPlan](../../completed/confirmed-chat-findings-minimal-corrections.md) owns the
23-case register, 18 corrections and five no-change dispositions.

Status: all 18 corrections accepted by CCF-R2-20261104; CCF-R1-F1 closed.
The final archival assessment is retained separately as
`review-CCF-R3-20261104.md`, outside its own reviewed manifest.
Private receipts are retained in
`tmp/evidence/confirmed-chat-findings/20261104-01/`.
The [command summary](validation-commands.md) records 35 actual invocations and
their exit statuses/timings; the [changed-file inventory](changed-files.md)
lists the complete task diff. Earlier pending states below are chronological
observations, superseded by the current gate table and closeout.

## Input and reuse decisions

The existing CAF runner/capture structure was copied into the isolated run
directory with only its evidence-root literal changed. Historical receipts are
unchanged. Each gate records its exact command, full source input hashes, package
exports, tool versions, output, exit status and tested build artifacts.

Current host readiness confirms Node 24.20.0, pnpm 11.15.1 from offline Corepack,
uv 0.11.29 and Cargo 1.97.1. No dependency download or update was needed. The
pnpm mismatch observed during planning came from the earlier PATH shim.

No historical behavioral PASS is reused for a changed responsibility. Reuse
existing fixtures, installed locked dependencies and verified model/package
artifacts. Full installed membership/byte identities are captured before gates
and compared after them. Final result reuse within this batch requires complete
input equivalence and the independent review specified by the plan.

| Gate | Decision | Current state |
| --- | --- | --- |
| G0 | RUN for changed exports/schema inputs | U1/U3 exports built; generation and 17-output drift check pass |
| G1 | RUN only new pre-edit regressions | U1-U6 and browser WSOLA follow-up reproduced before corrections |
| G2 | RUN combined affected shared/EPUB suites | Shared 33 and EPUB 309 pass; resource test/type follow-up below |
| G3 | RUN combined affected desktop suites | Final group passes 567; backend/worklet follow-up also passes 77 |
| G4 | RUN selected Python and maintainer Node suites | Python 75 and Node 120 pass using unchanged 78 plus renewed Windows 42; input proof below |
| G5 | RUN Rust default/release-locked after current core authority | Final run passes 176/175, eight ignored each |
| G6 | RUN selected new/current browser journeys | Seven current cases pass; stronger C08 geometry has intended RED and three renewed reflow cases |
| G7 | RUN relevant static checks | Types, format, lint, generated drift and both Rust Clippy modes pass |
| G8 | RUN current core preparation if consumed bytes change, one native build | Current core/check, two generated JSON format checks and one desktop build pass |
| G9 | RUN six-rate Piper plus the required reader-corrections selector | Six rates and reader-corrections retry pass, with complete verified restoration |
| G10 | RUN exact optional local admission with verified local artifacts | One exact local admission test passes; sources, environment and cleanup verified |
| G11 | NOT APPLICABLE to isolated preflight correction | Dispatched client/supervisor ownership unchanged; pending-dispatch controls retained |
| G12 | RUN final documentation/privacy/diff checks and independent review | CCF-R2 approves implementation and reuse; archival assessment recorded separately |

Unrelated model/inference/listening, downloads/firewall, real installer/signing,
image-decoder and full-repository matrices are NOT APPLICABLE under current scope;
they are not reused passes. Any expanded responsibility reopens its relevant gate.

## Execution and case disposition

U1, U3/U4, U2 and U5/U6 handed off sequentially. Browser/compiler follow-ups have
relinquished source writing. The coordinator maintains this ledger and the plan;
no other agent writes production code or tests concurrently.
C01/C03/C13/C15/C17 retain the plan's no-change classifications; C05's frozen
optional-runtime limitation remains explicit.

### U1: Mutable narration

C06/C18/C21/C22 have focused green coverage; combined acceptance remains pending.
The operation-local classifier charges and yields during distinct eligible
language-tag scans and is reused by token and title-context classification.
Source ranges, mutable profile selection and frozen v1 sources are preserved.

- `U1-red` and `U1-red-corrected-fixtures`: exit 1. The latter has 18 failed,
  four passed and 285 skipped cases: 17 intended failures and one mistaken
  expectation that existing compact `25%` expanded. That control was corrected
  to the existing verbatim behavior; `25 %` retains its accepted expansion.
- `U1-format`: exit 0, focused formatting only.
- `U1-green`: 17 source cases pass; five public matrix cases fail because their
  package import still resolves the old compiled EPUB exports. This is retained
  as a preparation failure, not an accepted aggregate result.
- `U1-build-exports`: `pnpm.cmd build:packages`, exit 0.
- `U1-green-public`: five public cases pass, 57 skipped. Exact source ranges and
  output agree across batch sizes. All 22 selected cases now have passing receipts.

The final G2 EPUB group adds the existing work-controller suite because C21
extends its observations to bounded batches of charged work.

### U3/U4: Current contracts and optional cleanup retry

Focused red/green coverage passes; final package/native acceptance is pending.

- `U3-red-ts` and `U3-red-python`: each reproduces the whitespace disagreement
  through the real validators (one failed case each).
- `U3-U4-red-rust`: two intended failures and one passing receipt/root control.
- `U3-generate`: configured generator succeeds. It enumerates 17 outputs; only
  current TS standalone validators and current Python protocol schema bytes
  change. No generated file is edited manually or frozen authority rewritten.
- `U3-green-ts`: one pass, two skipped; `U3-green-python`: one pass, 29 deselected;
  `U3-U4-green-rust`: three pass, 181 filtered. A common 26-vector fixture proves
  the explicit whitespace/control policy for Unicode scalar identifiers and
  existing code-point/UTF-8-byte limits. Existing parser behavior for invalid
  unpaired surrogate escapes is outside this whitespace correction.
- `U3-U4-format` and `U3-build-exports`: exit 0. Current shared/EPUB exports are
  ready for subsequent consumers. Ordinary ASCII optional-runtime identities
  remain compatible; frozen optional v7 Unicode parity is not claimed.

U4 preserves the installed-runtime/operation lock order. Only an inactive failed
operation with a cleanup receipt requires root canonicalization; absent,
unrelated-failed and active-worker cases return their ordinary owned snapshots.
Qualifying receipts still require matching root/authority and safe paths.

### Combined checks started on settled owners

`G2-shared` passes all 33 tests in its three selected suites. `G2-epub` passes all
309 tests in its four selected suites. `G0-generated-check` verifies all 17
generator outputs, and `G7-shared-types` passes.

`G7-epub-types` failed because the new C21 measurement helper returned the optional
`workUnitsCharged` field without a type guard. The U2 sole writer made only that
explicitly assigned test correction; no EPUB production code changed. Renew the
resource-bounds suite and EPUB type check. The other three G2 EPUB suites retain
their original result only with unchanged source/test/export input proof.

These checks consume the settled shared/EPUB owners; concurrent U2 desktop
source changes are outside those package test/type closures. Source manifests
retain the broader workspace state rather than overwriting earlier identities.
`G7-epub-types-r2` and `G2-epub-resource-r2` now pass (11 resource tests).

### U2 and combined desktop controls

U2 added focused regressions for all eight retained desktop cases. Its final
focused receipt passes 19 cases across eight files; earlier setup/filter failures
and subsequent red/green receipts remain distinct. C07 does not change native
dispatch or process ownership. C20 uses a bounded cumulative confirmed output-
frame count, including natural completion and periodic/paused WSOLA receipts;
source-frame position remains separate. Browser/native assertions are pending.

`G3-desktop` passes 563 tests but fails four existing coordinator controls: final
intentional-wait accounting on Stop/synthesis failure, and the 112-segment
navigation loop in Quick/Prepared mode. The combined gate is not accepted. The
U2 writer is diagnosing/correcting these after the U5/U6 handoff, with exclusive
source-write ownership. `G7-desktop-types` passes on its initial U2 inputs and
will be renewed if the correction changes its consumed sources.

### U5/U6 and Python/native controls

U5's four new occurrence/dispatch/drain/cleanup regressions fail before the fix
and pass afterward. U6 has eleven focused passing cases across the real
PowerShell layout seam and disposable journey failures. Early U6 fixtures needed
local hashing and recursive cleanup corrections; their failed receipts are
retained as fixture failures. A later real Windows invalid-executable launch
exposed synchronous spawn rejection, which is now classified at the direct
spawn boundary; the C04/C23 focused retry passes. No real installer, signing,
user-data mutation or model inference was performed.

`G4-python` passes all 75 selected cases. `G7-python-format` passes, but lint
finds an unbound loop variable in the new C05 test lambda and mypy finds an
overly narrow inferred local variable in the U5 cancellation branch. These are
assigned to the sole writer for minimal correction, then only the affected
protocol/runtime suites and static gates need renewal.

Initial `G5-rust` passes 176 default and 175 release-locked tests, with eight
ignored in each. These are current pre-package results, not final acceptance:
Rust embeds the core runtime manifest via `include_bytes!`, so G8's planned
authority regeneration invalidates the compiled test artifacts. Renew G5 after
current core generation and before the single final desktop build; do not reuse
the old binary result. Earlier focused native regressions already supply the
cheap pre-preparation check. The initial full run was premature and is retained.

### Combined gate follow-up

`G3-desktop-r2` passes all 567 selected tests in 14 suites after the four unchanged
controls pass. The pump keeps immediate asynchronous invocation after reserving
operation ownership, avoiding an unnecessary refill microtask. Stop captures
intentional transition-wait elapsed time before clearing it. Assertions/timeouts
were not weakened. `G7-desktop-types-r2` also passes.

`G4-python-r2` passes the 40 protocol/runtime tests after static corrections.
The bound C05 lambda still failed mypy inference, so it was replaced by direct
`pytest.raises`; `G4-protocol-r3` passes its 30 cases. This last invocation omitted
the earlier `-p no:cacheprovider` flag and reports a cache-write permission warning;
all test assertions pass outside the sandbox, and no cache repair is needed.
`G7-python-final` passes Ruff formatting (186 files), Ruff lint and mypy (182).
Service/isolation and runtime results are retained only with unchanged closure
proof. No Python production change followed those passing tests.

`G4-node` passes all 117 selected tests. The subsequent C16 compiler follow-up
has three genuine pre-edit failures and four passing post-edit tests (including
the canonical control) in `U6-compiler-red`/`U6-compiler-green`. The Windows suite
is being renewed; ordinary-journey and native-harness results need unchanged
closure proof instead of automatic repetition.

`G6-browser` passes five cases and fails two. Both original trace/screenshot/error
sets plus the runner summary were copied to `G6-browser-failure-artifacts/` and
all seven file hashes matched their originals. C02's Range fixture omitted
`getClientRects`; the WSOLA case reveals premature activation before device
resume settles. Neither failing case is accepted or silently retried.

`U2-WSOLA-device-red` reproduces premature start while its direct control passes.
WSOLA now sends start/resume only after the current device-resume promise settles;
Stop/Pause invalidate obsolete activations. The FIFO test worker must yield that
already-resolved promise before blocking on its Atomics wait; its existing
behavioral assertions remain intact. `U2-WSOLA-device-green-retry` passes all 77
PCM/worklet tests. `G6-browser-correction` passes the three corrected/direct
control cases. Because the transitive backend and browser build bytes changed,
the other four browser cases were renewed in `G6-browser-remainder` and all pass.
`G3-desktop-final` renews all 567 selected tests, including their re-exported
backend dependency. The old four browser passes are not reused for acceptance.

`G4-windows-r2` passes all 42 cases after the compiler-override guard.
`G7-typescript-final` passes repository formatting, ESLint and desktop types.
`G7-rust-format` passes; `G5-G7-rust-final` passes both complete native test modes
and both configured Clippy modes after current core authority generation.

### Native preparation

`G8-core-generate` runs the configured authority generator with `UV_OFFLINE=1`,
reusing the verified cached inputs and locked core environment. It refreshes the
current local service package and both built-in ES/EN offline smokes; no separate
duplicate smoke is needed. It changes only the planned tracked
`services/tts/release/core/runtime-manifest-v1.json` and
`services/tts/release/core/core-package-evidence-v1.json` (2,024 files in the
ignored payload). `G8-core-check` reports `piper-core-release:current`.
`G8-generated-format` passes for those two new JSON outputs, supplementing the
earlier complete formatting check. No frozen optional authority changes.

`G8-readiness` records the full WebView2 tree, matching driver major, tools,
writable scratch and capacity. Two pre-existing scratch directories are retained;
no pre-existing owned native driver/application process was present.
`G8-desktop-build` builds one final application. Its SHA-256 is
`71bca3d04029aa86549d67e0fb841b40d4e681066f764d34da6ee4839d21adb0`.
Renderer membership/hashes are captured in `G8-renderer-artifacts.json`.

`G9-resource-lifecycle` uses the existing CAF preservation/acceptance helpers with
the private run paths and G9 receipt updated. It journals an exact sibling backup,
verifies the current copied core, runs the existing six-rate Piper mode and
restores the original resource tree in `finally`. Native acceptance/restoration
remain pending until both the inner gate and wrapper finish successfully.

The six-rate `G9-Piper` run and its wrapper pass: 18 synchronized transitions,
zero observed underruns/external requests/generated audio files, six created and
six closed audio contexts, and no new owned process or scratch root. The exact
original resource membership/bytes are restored and the backup is absent.

Coverage inspection then identified a missing selector: the new C09/C20 native
assertions run only under `--exercise-reader-corrections`. The plan now records
that necessary follow-up without the six-rate selector, using the same binary,
renderer and verified core. Its existing base adaptive matrix cannot be omitted
without introducing a new runner, so this limited duplicate is recorded openly.

`G9-reader-corrections` passes `READER_RATE_CORRECTION`, both
`CLB02_PAUSED_ENDED` cases (100/75, within one rendered frame) and its base
adaptive assertions, but the aggregate run fails during harness cleanup with
`native-process-ownership-unverified`. This is a failed gate, not accepted runtime
evidence. The fixed error surface discards the inner PowerShell error, so the
precise cause is unknown. The post-failure diagnostic retains the driver/child
identity chain and one new isolated root; the application/WebView processes have
already exited. A teardown identity race is the bounded hypothesis.

Recovery first refused an imprecise DateTime conversion; the saved diagnostic
shows CIM microsecond ticks and full process ticks still identify the same
executable. Using the existing process helper after exact identity verification
captures and terminates only that driver tree, then verifies exit. The original
wrapper finishes with exit 1 and restores the complete Piper resource tree.
After verified process exit, the one owned scratch root is moved (not deleted)
into ignored failure evidence. Both pre-existing scratch roots are preserved.
Private `G9-R2-*` journals retain these steps and the failure material.

One infrastructure retry, `G9-reader-corrections-r3`, runs the unchanged command
and binary from the now verified clean host state, with unique R3 preservation
receipts. A second cleanup failure must stop this stage for a new diagnosis; no
unbounded retry or weakening of process-identity checks is authorized by this
ledger. No production/harness source was changed for this retry.

The sole infrastructure retry and its wrapper pass. Both completion receipts,
saved-speed startup pause, the adaptive matrix, no-new-process/root checks and
full original-resource restoration succeed. The executable hash is unchanged.
The earlier cleanup failure and recovery remain recorded; they are not converted
into a passing receipt. `G10-local-admission` is now running with nine verified
read-only local artifact sources and an isolated test root.

### Input equivalence and selective renewal

`reuse-proof-R2.json` compares the original execution-time input hashes with the
current patch, including membership of selected source closures, transitive
Python imports, fixtures, configs/locks, package exports and browser artifacts.
All 21 responsibility groups match. The proof is an input comparison for the
independent reviewer, not a substitute for that review. Original receipts retain
their original hashes and exit statuses. The initial proof helper refused relative
Python imports, then its first inventory omitted ignored environment config
files; the corrected AST/import and inventory comparison retains the unsuccessful
R1 report and script instead of treating missing entries as product drift.

- Shared tests/types and all unchanged EPUB tests keep their original current-
  batch receipts. Only the resource-bounds suite/type check needed renewal after
  its new optional-field guard. All 251 package-export entries match.
- Python service/isolation retain `G4-python`, runtime retains `G4-python-r2`,
  and protocol uses `G4-protocol-r3`. AST import closure plus fixture/config
  membership shows that later test-only changes do not affect the other suites.
- Ordinary journey/native-harness tests retain `G4-node`; the Windows suite is
  renewed after C16's compiler change. Core generation later changes an input to
  one Windows evidence test, so `G4-windows-manifest-r3` renews that exact test
  (one pass); the other 41 use unchanged fixture/configuration inputs.
- Browser and desktop results predating the WSOLA backend change are replaced by
  final passing results. Current renderer bytes match both final browser receipts.
- TypeScript formatting/lint/types retain matching inputs; generated core JSON
  formatting is supplied separately by `G8-generated-format`. Python/Rust static
  checks and final native tests match their complete selected current closures.

The full installed-input captures each contain 24,009 entries. Raw comparison
correctly reports one difference: Chromium appended 135 bytes to its existing
`debug.log`. The original prefix hash is unchanged; this file is browser output,
not an executable/library/configuration/fixture. `installed-equivalence.json`
retains that explicit exception and the original failed raw comparison. All
other 24,008 entries, directory membership, tool identities and recorded
environment values match. No dependency/configuration refresh or blanket
historical runtime PASS is used.

G11 is not applicable: C07 changes only undispatched coordinator preflight.
The native client/supervisor pending-start ownership boundary is unchanged, its
existing dispatched-start unit controls pass in the final G3/G5 groups, and G9
proves current ordinary Piper cancellation. Frozen optional admission in G10
does not claim new Chatterbox inference or Unicode-protocol compatibility.

## Review and host restoration

`G10-local-admission` passes its one explicitly selected host test (182 filtered)
in 717.54 seconds. Admission, rediscovery, repeated full integrity verification
and owned removal pass with `inference=false`. The outer lifecycle wrapper also
passes: all nine source hashes remain unchanged, environment values are restored
and no new test root or process remains. No Chatterbox inference/download ran.

All 18 planned corrections have passing relevant current evidence. C01/C03
preserve intentional behavior; C13/C17 remain policy decisions; C15 remains
unconfirmed. C05 is closed only for current consumers and current Piper payload;
frozen Chatterbox Unicode compatibility is not claimed. No unplanned production
dependency, broad refactor or public serialized-shape change was introduced.

The canonical system diagram, overview and completed M005 boundary were reviewed.
No component, process, network or persistence owner changes, so the diagram and
historical M005 plan remain unchanged. Maintained product/testing/setup docs and
the two applicable ADR clarifications describe the changed behavior.

Independent change review and final reviewed input identities are pending.
The worktree remains on the planning branch/HEAD with an empty index; no commit,
push, PR, merge or publication has occurred during execution.

`G12-pre-review` passes `pnpm.cmd check:evidence`, `git diff --check` and the
changed-document link check (365 local links across 12 documents, none missing).
`G12-host-state.json` verifies all native tool hashes, all 918 WebView entries,
the unchanged test binary and the restored 2,024-file original resource tree.
No recovery backup or native application/driver remains. The deliberately
retained failed-run evidence stays ignored and separate from both preserved
pre-existing temporary roots.

## Independent review follow-up

[CCF-R1-20261104](review-CCF-R1-20261104.md) returns CHANGES_REQUESTED for one
P2 acceptance gap, CCF-R1-F1. No additional production defect is confirmed. The
new C08 browser branch checks typography/highlight/successor state but does not
assert that the visible logical location survives completed-segment reflow.

The existing browser journey will gain that locator/reading-line assertion and
retain R7-04. Its RED run will temporarily use only the original C08 controller
behavior; the exact current controller is backed up and restored before GREEN.
No new production redesign is requested. Source writing belongs to one worker;
unaffected package/native evidence remains eligible only after renewed input
comparison and independent review of the revised patch.

The correction changes only `reader-reflow-restoration.smoke.spec.ts`. The test
proves the completed highlight's first and last source points occupy different
lines, then verifies that the same final source point remains within one pixel
of the reading line after typography restoration, while its old start is above
that line and the successor has not started. Existing held-frame, highlight,
typography and R7-04 controls remain.

- `C08-review-red` fails on an invalid fixture preference envelope, not the bug.
  `C08-review-red-geometry` reaches the old pending-frame failure first. Both
  diagnostic attempts and their traces/screenshots are preserved separately.
- `C08-review-red-reading-line` fails the new geometry assertion for the intended
  reason: the original controller leaves the endpoint 318 pixels from the reading
  line. Every temporary original-controller run restores the exact current bytes
  in `finally`; restoration receipts retain both hashes and the exit status.
- `C08-review-green` passes C08, R7-04 and MAF-07. Scoped Prettier and ESLint pass.
  `C08-review-types` runs the complete configured desktop type check with only
  its compiler-cache output relocated to ignored evidence; it passes. The cache
  relocation avoids changing the renderer directory or rebuilding it again.

`C08-unchanged-other-source.json` compares all 798 non-documentation paths except
the intended browser spec with the R1 manifest and finds no drift. The controller,
all four renderer artifacts and native executable retain their exact hashes.
`reuse-proof-R3.json` matches 25 current responsibility groups. Vitest explicitly
excludes browser specs; the bugfix smoke file does not import the reflow spec.
Its three prior cases and the independent C12 case therefore retain their
unchanged current receipts, while the three reflow cases use the new GREEN run.
The earlier desktop type result is superseded; global format/lint results retain
only unchanged files and are supplemented by the scoped new checks.

The final installed-input capture still differs from the original only by the
same 135-byte Chromium debug-log append; `installed-final-equivalence.json`
preserves that output exception. Original installed captures, R1/R2 reuse proofs,
and the R1 review report remain immutable. Native gates need no repetition because
their entire production/script/artifact responsibility is unchanged. Review of
this amended evidence and exact current patch remains required.

## Accepted implementation and archival handoff

[CCF-R2-20261104](review-CCF-R2-20261104.md) approves the exact 941-path manifest
and 63-path patch, with identities unchanged before and after inspection. It
closes CCF-R1-F1 and accepts all 18 intended corrections, the five preserved
dispositions and C05's current-only boundary. The reviewer independently checks
the 25 input-equivalence groups and the RED/GREEN controller/spec identities.
No actionable finding or acceptance-blocking uncertainty remains. The original
native cleanup failure's precise cause is still unknown; the verified recovery,
complete restoration and successful unchanged-command retry remain recorded.

Only documentation changes follow R2: preserve its full report, close and move
this plan to completed, update maintained indexes/status and refresh the changed
path inventory. Runtime sources, test definitions, installed inputs, renderer
artifacts and the native binary are unchanged. Final document/evidence/link
checks use a new receipt; the immutable CCF-R3-20261104 assessment covers the
exact archive patch without renewing equivalent runtime gates.

The archival checks are recorded under `G12-archive-ready`, with this command
run in local PowerShell outside the sandbox using the same pinned toolchain:

```powershell
pnpm.cmd check:evidence && git diff --check && node tmp/evidence/confirmed-chat-findings/20261104-01/check-doc-links.mjs
```

The final report is retained outside its own manifest; the same documentation
guard is applied once more after adding that report. Its result does not renew
or relabel any runtime receipt.

All 18 planned cases are corrected within scope. C01/C03 remain intentional,
C13/C17 await policy decisions and C15 remains unconfirmed. No frozen optional
authority, historical ExecPlan, production dependency, public serialized shape
or architecture topology is broadened. Physical audibility and optional model
inference are not claimed. Git remains at the planning HEAD with an empty index;
all task changes are uncommitted and no push, PR, merge or publication occurred.
