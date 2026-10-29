# SAF execution ledger

## M0: entry, ownership and input closure

Execution and necessary validation authorized on 2026-10-29. Branch
`codex/static-audit-follow-up`, HEAD/base
`5003538f0870f69c67c33e8d79515ccc87e0c702`. Entry index and worktree were
empty. No commit, push, PR, merge, publication or personal installation changes
are authorized. All edits below belong to this task; unrelated work is preserved.

Before production or regression edits, `M0-host-01-before.json` captures all
tracked/nonignored discovered paths, package outputs, Python environment
metadata and existing frontend/native artifacts. Raw evidence is under ignored
`tmp/evidence/static-audit-follow-up/`. Initial manifest SHA-256:
`63c976b0dfd83738b7d5d1655f4fe51f7a3b57c3cf8f3c56a8bed994eaa30167`.
Each gate captures before/after identities and retains its original log/result.
These identities are a reference baseline, not a historical PASS reuse.

The complete ExecPlan, AGENTS, plan rules, relevant product requirements,
architecture overview/system diagram, ADR-0010/0012/0054/0059/0061/0064/0065/0067,
testing/evidence/review policies and completed M005 boundary were inspected.
Roadmap M005 remains complete at preparation only. Read-only research agents
closed U1, U2, U3/U6 and U5; the director closed U4. No production edits or
behavior tests occurred during that research.

### Exact mutable production and test paths

Paths in each directory below are literal filenames, not wildcard authorization.
Existing unchanged imports, fixtures, locks, configuration and suite membership
are also present in the initial manifest and each gate's discovered input set.

- U1, `apps/desktop/src/settings/`: `ReaderSettingsDialog.tsx`,
  `ReaderSettingsDialog.test.tsx`, `narration-settings-actions.ts`,
  `narration-settings-actions.test.ts`.
- U1, `apps/desktop/src/`: `App.tsx`, `App.test.tsx`.
- U1, `apps/desktop/src/tts/`: `product-narration-coordinator.ts`,
  `product-narration-coordinator.test.ts`, `hardware-profile-compatibility.ts`,
  `hardware-profile-compatibility.test.ts`.
- U1 pre-edit amendment: `apps/desktop/src/persistence/hardware-profile-preference.ts`
  and `hardware-profile-preference.test.ts` in that directory. Existing read/write
  alone cannot restore a missing preference after an invalidated asynchronous
  write; persisting an explicit Piper choice would change later automatic
  selection. Bounded internal persistence support must preserve the previous
  state, including absence, without changing its schema or public contracts.
  Both original files are already covered by the M0 identity manifest.
- U2, `packages/epub/src/narration/`: `narration-preparation.ts`,
  `narration-prepared-segment.ts`, `narration-bilingual-normalizer.ts`,
  `bilingual-spanish-normalization.ts`, `narration-normalizer.test.ts`,
  `narration-resource-bounds.test.ts`.
- U2, `packages/epub/src/document/`: `xhtml-projector.ts`, `xhtml-projector.test.ts`.
- U2 support: `packages/epub/src/resource/opened-publication.ts` must clear any
  added bounded checkpoint context on failure, cancellation and close; its
  existing explicit field cleanup otherwise leaves the new context retained.
- U2 integration: `packages/epub/src/integration/narration-preparation-matrix.test.ts`.
- U2 desktop: `apps/desktop/src/reader/images/SemanticRasterImage.tsx`,
  `apps/desktop/src/reader/images/SemanticRasterImage.test.tsx`,
  `apps/desktop/src/reader/SemanticDocument.test.tsx`.
- Shared mounted interaction coverage:
  `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`.
  The director owns this file; unit writers do not edit it concurrently.
- U3: `services/tts/src/voxleaf_tts/adapters/piper.py`,
  `services/tts/src/voxleaf_tts/release_core.py`,
  `services/tts/tests/test_piper_adapter.py`, `services/tts/tests/test_release_core.py`.
- U4: `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`,
  `apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs`,
  `apps/desktop/src/tts/OptionalChatterboxControls.test.tsx`.
  No diagnostic schema/helper change is currently necessary: cancellation can
  be observed immediately before the existing response validator.
- U5, `apps/desktop/scripts/`: `ordinary-chatterbox-release-host.mjs`,
  `ordinary-chatterbox-release-host.node-test.mjs`, `bilingual-portfolio-host.mjs`,
  `bilingual-portfolio-host.node-test.mjs`, `native-startup-smoke.mjs`,
  `native-smoke.node-test.mjs`, `native-webdriver-client.mjs`,
  `native-webdriver-client.node-test.mjs`, `native-smoke/resource-observation.mjs`.
  WebDriver request cancellation and identity-verified process cleanup require
  these existing helpers; scenario modules can use their current injected delay.
  `windows-release.node-test.mjs` remains an unchanged affected consumer.
- U6, `services/tts/benchmarks/`: `incremental_prototype.py`,
  `corrective_v12_quality.py`, `dual_worker_playback.py`.
- U6: `services/tts/src/voxleaf_tts/release_chatterbox.py`.
- U6, `services/tts/tests/`: `test_incremental_prototype.py`,
  `test_benchmark_corrective_v12.py`, `test_benchmark_dual_worker.py`,
  `test_release_chatterbox.py`.

Documentation: active plan, this ledger and new immutable review summaries,
`docs/README.md`, active/completed indexes, `docs/development/testing.md`,
`docs/product/reader-settings-and-playback-controls.md`,
`docs/architecture/overview.md`, `benchmarks/tts/README.md` as needed.
The canonical diagram is reviewed; no topology change is intended. Completed
plans, frozen authorities and historical evidence remain unchanged.

Generator-owned outputs: `services/tts/release/core/runtime-manifest-v1.json`
and `core-package-evidence-v1.json`; conditional inventory output only
`services/tts/release/component-inventory-v1.json`. Their initial identities
are captured. Ignored outputs: core `dist/voxleaf-piper-core-v1` and its ZIP,
staging/backup/cache/private environment, package/frontend dist, Python wheel
and sdist, Tauri target/resources/bundle. Preserve final artifact identities.
Do not regenerate optional Chatterbox v7 for the live Piper adapter change.

### Missing regressions and matrix

| Gate | Decision / inputs and invariants | Execution timing |
| --- | --- | --- |
| D-Desktop | RUN: U1/U2/U4 selected existing Vitest files with `-t SAF`; complete-only settings, A-to-B stale selection at every await including persistence, fresh Stop-to-Play admission, decorative states and residue removal presentation | Add tests before each owner fix, record red/green without full baseline |
| D-EPUB | RUN: public preparation matrix, normalizer, bounds and projection with `-t SAF`; batch 1/8/16, cold offset 117, accepted titles, language/role boundaries, cancellation/retention/work, closed capitalized Spanish articles, alt absence/empty/whitespace | Directed red/green before final suites |
| D-Python | RUN: existing pytest suites with `-k saf`; literal per-voice phonemization + shared espeak serialization, exceptional worker cleanup/primary error, retryable scorecard output, starvation episodes/final-drain invalidation, cache preparation failure | Directed red/green, synthetic data only |
| D-Host | RUN: ordinary/portfolio/native-smoke/native-WebDriver Node suites with `--test-name-pattern=SAF`; preflight and post-preflight spawn failure, benign ready children then cooperative deadline, request settlement, independent cleanup, sentinel survival, cleanup failure | Before native build; no personal installer/model |
| D-Native | RUN: Cargo `saf` selection; cache-only restart after locked deletion, access/reparse safety, real loopback delayed rejected headers after acknowledged cancel plus uncancelled controls | Before full Rust variants |
| F-Static | RUN: all six TS/Python format/lint/typecheck leaves in plan | Final source inputs before costly core generation; renew only changed consumers |
| H-Core | RUN: inventory check, conditional inventory generation, one `package:piper-core:write-manifest`, then `package:piper-core:check` | No duplicate preceding build; generator includes both real offline voice smokes and delimiter route proof |
| F-TS | RUN route B: `pnpm.cmd test:typescript` including shared generation check, package hooks and all seven Node suites | Once on definitive source/generated inputs; no duplicated complete leaves |
| F-Python | RUN: one full `test:python` with task cache, then `build:python` | Definitive Python/core inputs; no repeated v7 subset |
| B1 | RUN: complete existing reader browser spec with mounted A-to-B and real decorative accessibility | Once after final source/core |
| F-Build | RUN: standalone desktop frontend and `build:desktop` with unchanged Tauri hook | After browser/core, identify final binary |
| F-Native | RUN: Rust format, both Clippy variants, both test variants | Final frontend/core/native inputs |
| N1 | RUN: direct `node apps/desktop/scripts/native-startup-smoke.mjs` | Final binary, no wrapper rebuild; real driver/WebView2 cleanup |
| F-Docs | RUN: evidence guard + guard tests + whitespace/link/scope/diagram inspection | Final docs; repeat only guard/whitespace if archive prose changes |
| Historical PASS | NOT APPLICABLE to acceptance: none reused | Original RAC receipts retrieved as reference; 640-file match is insufficient |
| GPU/rate/full download/personal installation/historical quality | NOT APPLICABLE absent plan's concrete triggering boundary change | No new performance/support claims |

The original RAC `F-TS-tests-01` and `F-Python-tests-build-01` receipts and
source manifests are retrievable and inspected. Their inputs/environment are
not rebound to this patch. Reusing existing fixtures and integrity-verified
download/model assets is distinct from reusing a test PASS.

## Host readiness and resource journal

`M0-host-01` ran in local PowerShell outside the sandbox: Node 24.20.0,
repository-selected Corepack pnpm 11.15.1 (network disabled), uv 0.11.29,
service Python 3.12.10, Cargo/rustc 1.97.1, EdgeDriver 155.0.4283.45.
No tools were installed or updated. `tauri-driver --version` is unsupported;
the receipt retains that diagnostic despite the shell's final zero exit. This
is incomplete driver readiness, not a full readiness PASS; inspect its installed
Cargo metadata and WebView2 compatibility before N1. Disk/scratch are available.

Task-owned resources are ignored receipt/cache directories, synthetic temporary
fixture roots, test-created child handles/identified descendants and loopback
listeners. Each test must await teardown after success/error/cancel and preserve
unrelated sentinels. No personal data, installation or firewall changes are
scheduled. Core generation may replace only its declared generated outputs via
the existing recovery-aware builder. Record uncertain cleanup as BLOCKED.

## Execution results

M0, M1 and M2 implementation/directed regressions are complete. All six units
are frozen for combined validation.
M3 combined checks and the bounded U5 correction requested by independent R1
pass. Independent R2 approves implementation and scoped current-task evidence
reuse. The separate R3 report covers the authorized documentary archive.

### Directed diagnosis and corrections

- U1: `D-U1-red-01` retained 17 intended behavior failures and five controls,
  plus an App fixture status error. `D-U1-App-fixture-red-02` corrected only the
  fixture and confirmed stale acceptance. `D-U1-green-01` passed 24 but exposed
  three App fixtures that deferred an optional await bypassed by DEV mode;
  the fixtures now defer the real containment boundary. `D-U1-App-green-02`
  passed three. `D-U1-directed-final-03` passed 30 selected cases; subsequent
  post-refresh guard red/green receipts retain its expected failure and four
  passing action cases. The production browser fixture separately exercises
  the packaged optional-selection await. Scoped format/ESLint passed.
- U2: `D-U2-epub-red-01` retained five expected failures and three controls;
  `D-U2-desktop-red-01` retained two expected failures. Source-level green
  passed 12 cases; two public matrix cases still consumed the previous EPUB
  dist. After the necessary `D-U2-epub-build-01` prerequisite, public matrix
  green passed two; desktop green passed three; extra normalizer/bounds controls
  passed 16. The stale-dist attempt is retained as preparation failure, not a
  failed corrected product assertion or a PASS.
- U3/U6: `D-U6-red-01` retained 22 failures/35 controls, including a temporary
  validator-authority fixture error and invalid simultaneous-event fixture.
  Corrected fixtures retained six expected v12 failures and one control.
  Piper literal and executable-smoke reds respectively proved nine and four
  missing behaviors, then passed those cases. A separate ownership red proves
  that unconfirmed termination cannot release the worker. Combined
  `D-U3U6-green-02` passed 71 selected cases, including existing `safe` controls.
  The final destination-preflight amendment retained two failures then six
  passes. Scoped mypy first rejected three fixture imports; corrected mypy
  passed all 12 files. Final scoped formatting changed no files.
- U4: `D-U4-native-red-01` reproduced five defects with four controls passing:
  cache-only/locked/access-denied/dangling residue disappeared from discovery,
  and cancelled rejected headers became DownloadFailed. The two production
  corrections are the literal cache discovery entry and cancellation check
  before response validation. `D-U4-native-green-01` passed all nine selected
  native cases plus the one UI removal-route control. Both HTTP status and
  content-length cases include uncancelled diagnostic controls. Temporary locks,
  junctions, server threads and staging were released by the exercised paths.
- U5: `D-U5-red-01` retained missing cooperative argument and ignored request
  cancellation failures, plus ordinary lifecycle-seam setup failures. The
  first green passes five directed cases, including real post-preflight ENOENT
  with synthetic backup and preserved backup/both errors on uncertain cleanup.
  `D-U5-lifecycle-01/02` exposed the new process-observer's PowerShell 5.1
  JSON-array parsing defect. Those attempts remain failed. Direct assignment of
  `ConvertFrom-Json` output corrected the array handling; `D-U5-recovery-01`
  passed four real-tree cases after identity-bounded orphan recovery/audit.
  `D-U5-parent-01` passed five parent confirmation/error controls.
  `D-U5-final-01` passed scoped Prettier/ESLint and 14 SAF cases (13.87 s),
  including timeout during unknown session creation and real benign driver/app/
  worker exit with an unrelated sentinel surviving. The isolated
  `D-U5-spawn-counterfactual-01` removes only the new listener/await from current
  source while retaining test seams: it reproduces the asynchronous crash, not a
  pristine-base run. `D-U5-counterfactual-cleanup-01` verifies removal of its
  exact synthetic roots and retained sentinel. No personal installer ran.

### Combined preparation/static results

- `M0-assets-drivers-02`: all ten existing Piper source/voice assets matched
  their source-manifest size and SHA-256 before generation. Scratch create/remove
  succeeded. No download or installation occurred. The mixed table rendering
  does not establish a readable driver-version receipt; N1 readiness must still
  record exact driver/WebView2 versions.
- `F-Python-static-01`: PASS, `format:check:python` (183 files), `lint:python`,
  `typecheck:python` (180 files), and `inventory:release:check` (current).
  Inventory regeneration is therefore NOT APPLICABLE.
- `F-TS-typecheck-01`: PASS, `typecheck:typescript`, including package builds.
- `F-TS-format-lint-01`: PASS, repository TypeScript/JS/JSON formatting and
  ESLint. U5's final formatter changed no source before this check.
- `H-Core-generation-01`: PASS (72.49 s). The single
  `package:piper-core:write-manifest` builds, verifies, archives and runs both
  real offline voice smokes; `package:piper-core:check` reports current.
  Both delimiter/literal and ordinary-text route assertions execute in the
  packaged runtime. Spanish/English in-memory payloads are 249660/213996 bytes;
  audio is not persisted. The expected uv notice selects the core's own locked
  environment rather than the inherited service VIRTUAL_ENV.
- `H-Core-identities-01`: PASS. The two regenerated JSON files pass formatting;
  core staging/backup/partial residue is absent. Archive: 213923698 bytes,
  2024 installed files totaling 306742429 bytes, SHA-256
  `b453ef151efd72b730bb2122c047f86d4bdc2e338d4baf9f3b0104e5a29e85ac`.
  Runtime manifest SHA-256:
  `5bb45a7f375b0f0193438140e1e78326961e936dee9a5bf95d12fc3e5cc873bf`;
  generated core evidence SHA-256:
  `480fc29a5569ed24e15852c8a00af508c6bba2f0850248197ca70393d5b8eee9`.
  Existing source/voice assets were reused by identity, not as old test PASSes.
- `F-TS-tests-01`: PASS (85.64 s), the single complete Route B. Shared 210,
  EPUB 742, desktop 970, and seven Node suites totaling 132 tests passed;
  shared `generate:check` verified 17 generated contracts and package hooks ran.
  No complete component suite is repeated after this aggregate.
- `F-Python-tests-build-01`: PASS (64.85 s), 791 tests plus wheel and sdist.
  This includes optional-v7 preparation controls; that subset is not repeated.
- `B1-browser-01`: PASS, all 19 cases in the existing Chromium spec (2.9 min).
  New mounted A-to-B optional selection and decorative image cases pass, as do
  complete-mode edits, old locator/focus, worklet, natural completion and
  AudioContext cleanup controls. Package and frontend hooks ran as configured.
- `F-Build-01`: PASS (36.09 s), standalone desktop frontend and
  `build:desktop`. Tauri's required frontend hook remains intact. This builds
  the default executable with bundling disabled; it does not install a product.
- `F-Native-01`: PASS, Rust formatting, both Clippy variants with warnings
  denied, and both Cargo suites: 145 default / 144 release-locked tests passed.
  Each variant reports seven explicit ignored cases; those are not executed
  PASS evidence. The real model-free supervisor is exercised separately by N1.
- `N1-native-01`: PASS. Direct `node apps/desktop/scripts/native-startup-smoke.mjs`
  uses F-Build's unchanged 12517888-byte executable, SHA-256
  `6ae59ed0269bef3a66faca8d50c9ff7a317881ecc5fa9a388b57526146d608aa`.
  The ignored capture wrapper sets only the process-local driver override and
  records pre/post identities. Real WebView2 startup, supervised fake-service
  protocol/cancellation/recovery, local EPUB/raster/locator/accessibility and
  zero external request assertions pass. Final exit is zero after cleanup;
  no new matching processes or `voxleaf-native-startup-*` roots remain.
  Two pre-existing temporary roots are preserved and are not claimed as task
  cleanup. The executable is unchanged after the run. No wrapper rebuild ran.
- `F-Docs-R1-01`: PASS, `check:evidence`, all 31 `test:evidence` cases,
  `git diff --check`, and an empty index. The final status/receipt prose is
  followed by a guard/whitespace/link recheck; unchanged guard tests are not
  duplicated for Markdown-only changes.

### Cleanup and evidence boundaries

Directed U4/U5/U6 cases establish success, error and deliberate-cancellation
cleanup with synthetic files, loopback listeners and identified benign children.
They exercise failed restoration/teardown too: uncertainty fails and retains
recovery material. N1 verifies the real driver/WebView2 success path. The core
builder removes its staging/backup; its verified package, cached sources/voices,
driver and ignored original receipts remain intentional acceptance artifacts.
No personal installation, original user data or firewall rules were changed.

No historical test PASS is reused. The final guard tests also run fresh.
Same-task static/runtime evidence remains applicable only where the recorded
inputs match: later Markdown status/ledger edits do not affect runtime gates;
the two generated JSON files receive a fresh scoped format check, and their
consumers run after generation. No product application source changed after final
suites; the later R1 U5 correction below invalidates its host-script leaves and N1.
The review manifest and gate comparison enumerate every current source mismatch
against original before/after receipts rather than replacing their identities.

The canonical system diagram still matches the implementation. No public wire
contract, dependency/version, resource ceiling, model selection, deletion root
or runtime topology changes. The current preparation boundary remains M005's;
historical reports and frozen authorities remain untouched. GPU/rate/listening,
full optional download and personal-install campaigns are NOT APPLICABLE to
these bounded changes. Seven ignored Rust cases per variant remain explicitly
unexecuted; N1 supplies the separately selected model-free host coverage.
There are no new support, quality, speed or arbitrary-crash recovery claims.

### Independent R1 and bounded correction order

[SAF-R1-20261029](review-R1.md) is CHANGES_REQUESTED, with matching identities
before/after inspection. Its sole P1 finding is stale numeric parent ancestry:
the native observer could adopt a surviving unrelated child after parent PID
reuse, then terminate that newly recorded identity. No U1/U2/U3/U4/U6 finding
was identified. The original report and receipts remain immutable.

Correction stays in the already authorized `native-smoke/resource-observation.mjs`,
`native-smoke.node-test.mjs` and the directly coupled `native-startup-smoke.mjs`.
The runner amendment is recorded before its edit: bind the first/current capture
to the still-running original ChildProcess before and after the await, assigning
new identities only after that check. A snapshot/open match alone cannot prove
the original child still owns a PID reused before enumeration.
Before granting ownership, retain enumeration
creation identity, compare child/parent chronology and recheck opened-handle
identity; uncertain nodes never authorize termination. Add deterministic
stale-parent/recycled-child and child-exit regressions before the correction, then
retain the real benign-tree/sentinel cases. No product code or package changes.

Renew scoped host format/ESLint, every Node leaf importing the changed helper
or native runner, and direct N1 on the unchanged binary. Preserve Route B's
unaffected leaves and all Python/core/browser/build/Rust results only with the
original input/environment/artifact equality proof and a fresh independent R2
assessment. Do not repeat the full TS/Python aggregates or rebuild artifacts.
Renew the documentation guard after the new evidence; archive remains pending.

The affected complete Node leaves are `native-smoke.node-test.mjs` (direct
resource-observer and native-runner imports) and
`bilingual-portfolio-host.node-test.mjs` (its synthetic runner imports the native
module). The other five Route-B Node leaves do not load the changed helper in
their exercised paths; ordinary/adapter-layout production launchers reference
the runner as a command path, with those model/install branches unexecuted in
these suites. `apps/desktop/tsconfig.json` includes source/browser TypeScript,
not the host `.mjs` directory. Browser/frontend/native/Python build closures do
not consume the observer. R2 must verify this closure and the original receipts;
filename independence alone is not reuse proof.

R1 correction results:

- `D-U5-R1-red-01`: four intended failures on the R1 ownership logic with only
  an optional inspection seam. `U5-R1-red-seam-and-tests.patch` preserves this
  exact test/seam delta; it is not described as a pristine-base checkout.
- `D-U5-R1-green-01`: initial nine-case PASS established non-adoption but did
  not yet establish failure for an incomplete capture; it is superseded by
  the following stronger observable checks, not silently relabelled.
- `D-U5-R1-incomplete-red-01`: five expected failures: four uncertain captures
  returned success and a real uncertain-root cleanup removed scratch.
  `D-U5-R1-incomplete-green-01` fixed real scratch retention but retained five
  deterministic fixture errors because its injected executor exposed raw
  PowerShell errors instead of the production inspector's fixed classification.
  The fixture now mirrors that classifier; the failed receipt is preserved.
- `D-U5-R1-child-red-01`: two expected failures when the original ChildProcess
  exits before/during capture. Both call sites now adopt a capture only after
  checking the same live ChildProcess again; prior identities remain on failure.
- `D-U5-R1-final-green-01`: PASS, 16 directed cases and formatting (22.17 s).
  Actual generated PowerShell runs against local inspection fixtures for stale,
  replaced, missing, duplicate and unknown identities. Microsecond CIM intervals
  are compared with exact handle ticks; overlap has both earlier/valid controls.
  Five real benign-tree controls retain an unrelated sentinel and verify
  normal/error/deadline/unknown-session/uncertain-ownership cleanup outcomes.
- `F-U5-R1-final-01`: PASS, scoped Prettier/ESLint on all three changed scripts
  and the two complete affected Node suites, 49 cases. Their old aggregate
  results are superseded by this receipt; the other five Node leaves remain
  eligible under the unchanged-input proof. No whole TS/Python suite is repeated.
- `N1-native-R1-02`: PASS, direct current runner on the identical final binary
  and standalone driver. Zero new matching processes/scratch roots and unchanged
  executable after cleanup. This replaces N1-native-01 for current runner
  acceptance; no core/frontend/native rebuild occurred.

`F-Docs-R2-01` passed the current guard, whitespace, 334 relative destinations
and empty-index check. [SAF-R2-20261029](review-R2.md) approves the exact corrected
patch and scoped current-task evidence reuse. Its 1433-path manifest SHA-256 is
`84842cce9213aaf3dee944fad378aafaaf7633930f6b9518abab7b3eee49cdfc`.
Before/after identities, 68 original receipt/log/snapshot hashes, ten recorded
tool/artifact identities and 347 ignored inputs matched. R1 remains permanently
CHANGES_REQUESTED; its finding is resolved by the distinct R2 assessment.

### Archive and final documentary assessment

After R2 APPROVE, the plan moves from `active/` to `completed/`, and maintained
indexes identify the accepted boundary. Only this task's plan, ledger, new
reports and indexes change after R2. Runtime/source/test/artifact bytes stay
frozen. [SAF-R3-20261029](review-R3.md) records the separate archive assessment
outside its own manifest. The final guard/whitespace/link/index checks are
renewed for these prose changes; application suites and isolated guard tests
are not duplicated. Original failed and superseded receipts remain available.

`F-Docs-R3-01` passed guard/whitespace but failed link inspection on one stale
incoming architecture-overview link after relocation. That link now targets
the completed plan. The unsubmitted R3 draft manifests/diff are preserved with
the `unsubmitted-before-link-fix-` prefix; they never received an approval.
`F-Docs-R3-02` renews the documentary checks after this correction, before the
final R3 dossier is submitted. R1/R2 reports and runtime evidence are unchanged.

All authorized requirements are fulfilled under the reviewed scope. The index
remains empty and HEAD unchanged. No commit, push, PR, merge or publication.

Storage rollback failure is explicit: if the storage provider denies restoration
of an invalidated selection, the action returns false and marks profile
persistence unavailable instead of claiming success or changing B's active
profile. The failed-restore case is tested. Physical storage recovery cannot be
promised after the storage provider rejects it.

### Driver readiness amendment before N1

`M3-driver-readiness-01` records installed tauri-driver 2.0.6, WebView2
156.0.4314.50, and PATH EdgeDriver 155.0.4283.45. Existing scoped cached drivers
are also older. This is a concrete N1 prerequisite mismatch, not a product test
failure. The [official Microsoft driver page](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver?form=M0002P)
lists the exact 156.0.4314.50 release. Acquire its standalone x64 ZIP only in
task-owned ignored `tmp/evidence/static-audit-follow-up/webdriver-156/`, record
ZIP/executable identities and verify its Microsoft signature before execution.
Select it through the runner's existing `VOXLEAF_EDGE_DRIVER_PATH` override for
this process. No global tool/dependency installation, PATH persistence, personal
data or product version change is authorized or needed. Existing drivers remain
untouched; preserve the downloaded test artifact with the acceptance receipts.

`M3-driver-preparation-01` obtained that standalone driver with a valid Microsoft
Corporation Authenticode signature. ZIP SHA-256:
`dfb627983fcdaa076266619e5cfda0c654093ce1b320165574c4a08d5fdca357`.
Executable SHA-256:
`dd728c934e491abe7e8a07fa366aad135ea15d934cbba99192ad872da59c39d3`.
The ZIP identity is recorded verbatim in the original receipt; only the task
process override selects this executable. No global installation changed.
