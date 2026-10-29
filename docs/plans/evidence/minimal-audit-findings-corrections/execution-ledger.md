# MAF execution ledger

## Entry, ownership and scope

Execution authorized 2026-10-29. Branch `codex/minimal-audit-findings-corrections`,
HEAD/base `2f6a80b7b19be6cc62b7706bd85e9be96a1a2b8e`; clean worktree and empty
index at entry. No drift from the plan commit. No commit, push, PR, merge,
publication, downloads, tool installation/update or personal-state changes.
The director is the sole source writer. Three read-only investigators examine
native ownership, Python and host observation; independent acceptance uses the
required `change_reviewer` role.

Raw receipts, before/after discovered input hashes and resource records live in
ignored `tmp/evidence/minimal-audit-findings-corrections/`. The capture wrapper
and snapshot helper reuse the SAF mechanism with the new evidence destination
and offline uv resolution. Failed receipts remain immutable. Every test and
validation command runs in local PowerShell outside the managed sandbox.

### Frozen mutable path allowlist before source/test edits

Paths below are literal filenames within their named directory. Conditional
paths are allowed only when the stated responsibility requires them; listing
them does not require an edit. Existing transitive inputs and discovered suite
membership are captured in each gate snapshot.

- `apps/desktop/scripts/`: `reader-corrections-host.mjs`,
  `bilingual-portfolio-host.mjs`, `bilingual-portfolio-host.node-test.mjs`,
  `native-smoke.node-test.mjs`, `native-smoke/resource-observation.mjs`.
- `services/tts/src/voxleaf_tts/`: `protocol.py`, conditional `service.py`.
- `services/tts/benchmarks/`: `service_handoff_cli.py`, `memory.py`,
  `corrective_v12.py`, `harness.py`, `contracts.py`.
- `services/tts/tests/`: `test_protocol.py`, `test_service.py`,
  `test_service_handoff_cli.py`, `test_benchmark_memory.py`,
  `test_benchmark_corrective_v12.py`.
- `apps/desktop/src/settings/`: `narration-settings-actions.ts`,
  `narration-settings-actions.test.ts`, conditional `ReaderSettingsDialog.tsx`
  and `ReaderSettingsDialog.test.tsx`.
- `apps/desktop/src/tts/`: `product-narration-coordinator.ts`,
  `product-narration-coordinator.test.ts`, conditional
  `HardwareCompatibilityControls.tsx`, `HardwareCompatibilityControls.test.tsx`,
  `optional-chatterbox-client.ts`, `optional-chatterbox-client.test.ts`.
- Conditional renderer wiring: `apps/desktop/src/App.tsx`,
  `apps/desktop/src/App.test.tsx`.
- `apps/desktop/src-tauri/src/`: `tts_optional_chatterbox.rs`,
  `tts_optional_chatterbox/tests.rs`, `tts_service_supervisor.rs`,
  `tts_service_supervisor/tests.rs`.
- `apps/desktop/src/reader/`: `reader-reflow-restoration.ts`,
  `reader-reflow-restoration.test.ts`, conditional `semantic-dom-range-mapper.ts`
  and `semantic-dom-range-mapper.test.tsx`.
- `packages/epub/src/narration/`: `narration-bilingual-normalizer.ts`,
  `narration-normalizer.test.ts`, `narration-resource-bounds.test.ts`.
- `packages/epub/src/integration/narration-preparation-matrix.test.ts`.
- `apps/desktop/tests/browser/`: `reader-reflow-restoration.smoke.spec.ts`,
  `reader-narration-bugfixes.smoke.spec.ts`.
- Generator-owned only: `services/tts/release/core/runtime-manifest-v1.json`,
  `services/tts/release/core/core-package-evidence-v1.json`; conditional
  `services/tts/release/component-inventory-v1.json`.
- Documentation: active plan (move to completed only after acceptance), this
  ledger and new immutable review summaries; `docs/README.md`, active/completed
  indexes, `docs/development/testing.md`, maintained product settings and
  architecture overview only where behavior clarification is warranted.

Frozen authorities, completed plans (including M005), optional Chatterbox v7,
v9/v11 evaluation code, public schemas, dependencies and versions stay outside
the mutation scope. The canonical diagram and M005 remain preparation/owner
authority; the intended patch changes no topology.

## Gate decisions before execution

| Gate | Classification | Invariant / timing |
| --- | --- | --- |
| M0-host | EJECUTAR | Capture source/discovery, tool/runtime readiness, existing package inputs and owned-resource baseline before source edits. |
| D-Desktop | EJECUTAR | Directed MAF settings/coordinator/reflow regressions before each production correction, then focused green. |
| D-EPUB | EJECUTAR | Mark adjacency, exact source spans, bounded public continuation; preserve package pretest. |
| D-Python | EJECUTAR | Malformed protocol cleanup, actual benign post-spawn setup failure, v12 trial provenance, valid PDH statuses. |
| D-Node | EJECUTAR | Actual generated PowerShell failure/success and benign child cancellation/acknowledged cleanup. |
| D-Native | EJECUTAR | Barrier-controlled real manager/supervisor ordering, same-owner selection and failed-stop/removal controls in both feature modes. |
| F-Static | EJECUTAR | Final format/lint/typecheck with package hooks and both Rust Clippy variants, before costly preparation. |
| H-Core | EJECUTAR | Inventory check; conditional generator; one corrected Piper core build including both offline voice smokes, then package check. |
| F-Tests | EJECUTAR | One final TS aggregate including shared hooks and seven Node suites, Python suite and both Rust test variants. |
| B1 | EJECUTAR | Single selected browser invocation from the plan; actual DOM geometry and mounted settings/completion routes plus named controls. |
| F-Build | EJECUTAR | Corrected native and Python artifacts; frontend leaf counted from B1 only with identical build-input/environment proof. |
| N1 | EJECUTAR | One direct model-free native smoke on the final identified binary; current observation and cleanup. |
| F-Docs | EJECUTAR | Current evidence guard, isolated guard tests, diff/link/scope review; repeat affected documentation leaves after archive. |
| Historical test results | NO APLICA for reuse | Original SAF/RAC/VCA receipts inspected; complete current input/environment equivalence is not established. Fresh cheap affected leaves avoid an elaborate partial proof. |
| Source archives / voices | REUTILIZAR con prueba | P-Core-inputs-01 verified all ten files and the lock before the one generator-owned core build. These are artifacts; the old assembled core result is invalidated by MAF-03. |
| Reader benchmarks | NO APLICA, subject to independent review | Geometry acceptance adds no traversal/batching/layout complexity or steady-state work; driver/runtime versions are unchanged during execution. The actual fallback is tested in Chromium and N1 exercises current observation. No new resource-budget claim. |
| Chatterbox v7, GPU/listening/quality/speed matrices, downloads, installer journeys | NO APLICA | Frozen model/adapter/loader/DSP and personal installations outside scope; reassess any boundary expansion. |

Original references: SAF `F-TS-tests-01`, replacement `F-U5-R1-final-01` and
`N1-native-R1-02`, `F-Python-tests-build-01`, static/build/core receipts and
[R2](../static-audit-follow-up/review-R2.md); RAC and VCA execution ledgers.
The SAF aggregate predates its observer replacement and cannot cover that leaf.
None of these historical PASSes is current acceptance. Existing fixtures and
the receipt capture mechanism are reusable independently of test outcomes.

No new complete baseline, per-finding full suites, or duplicate `check` and
`check:portable` aggregates. Final closeout maps every aggregate leaf/hook to
current receipts. Missing indispensable capability becomes BLOQUEADO and does
not stop independent work. At most one infrastructure retry per stage after a
recorded changed condition; source corrections require diagnosis.

## Resource journal

Run prefix: `MAF-20261029`. Task-owned resources are ignored receipts, bounded
synthetic child processes/temp roots, build outputs and generator staging.
Record PID with creation/executable identity before cleanup; use existing
ownership-aware runners and fixture finalizers. Preserve unrelated sentinels.
No personal data root, installation, firewall rule or model download is owned.
Core generation retains the previous verified package until safe promotion.
Unknown cleanup blocks the affected gate. Final success, error and cancellation
cleanup evidence is recorded below, including the recovered first fixture error.

## Findings and execution receipts

All eleven causes have intended-red receipts and implemented corrections.
All applicable host gates pass. Independent implementation acceptance is
APPROVE in [MAF-R1-20261029](review-R1.md), with no findings. The distinct
MAF-R2-20261029 report records the final archival verdict and identity recheck.

| Finding | Implemented correction | Reproduction / regression coverage |
| --- | --- | --- |
| MAF-01 | Reader wrapper reuses cooperative arm ownership and stops on failed/unconfirmed cleanup. | Real benign wrapper deadline, cleanup failure, missing acknowledgement and normal control. |
| MAF-02 | Generated PowerShell rejects enumeration errors and unreadable live owned processes; verified exits remain valid. | Actual generated query with controlled faults and live/exited children; condition demonstrated. |
| MAF-03 | Lone surrogate text gets existing invalid-utf8 rejection and service cleanup. | Both surrogate halves, surrounding astral text and valid astral/byte-bound controls. |
| MAF-04 | Renderer admission spans configuration actions; native admission excludes removal and revokes cached runtime after verified stop. | Real installed-input verification, permitted stop/spawn barrier, physical benign child/Job, both feature modes, failed stop/delete/retry and mounted Close/Play. |
| MAF-05 | Cleanup begins immediately after successful spawn; acquired readers/samplers are independently released. | Six setup/cleanup faults with real owned process handles, primary-error preservation and fixed CLI cleanup diagnostic. |
| MAF-06 | Cancellation observations carry actual language into v12 serialization. | Failed ES cancellation followed by successful EN trials retains labels and incomplete gates. v9/v11 remain excluded. |
| MAF-07 | No-client-rectangle/all-zero range geometry uses existing block fallback. | Unit controls retain meaningful zero-width carets; Chromium BR range verifies actual restored alignment. |
| MAF-08 | Unicode marks protect numeric lexical boundaries without normalizing source text. | Decomposed/composed and mark-adjacent tokens, expansion control and public bounded continuation/source-span equivalence. |
| MAF-09 | PDH VALID_DATA and NEW_DATA are accepted; invalid/negative samples stay excluded. | Mixed instances, owner aggregation, cached sampling and unavailable consumer result. |
| MAF-10 | Healthy same-profile loaded Chatterbox reselection preserves admitted continuation. | Real coordinator healthy/absent/failed/language-change controls and checked radio with reduced free capacity. |
| MAF-11 | Completed mode-dependent owners are released while a consistent completion projection preserves final highlight/checkpoint. | Completed 1/2/5/10-minute unit cases, 2/5/10-minute Chromium cases, no autoplay, explicit restart and existing final-highlight control. |

Independent implementation review: APPROVE. Index remains empty; HEAD remains
the plan commit. Final implementation acceptance and archive review are separate;
the latter does not infer approval from the earlier report.

### Directed attempts

- M0-host-01: PASS. PowerShell 7.6.5, Node 24.20.0, pnpm 11.15.1,
  uv 0.11.29, Cargo/Rust 1.97.1 and locked Python 3.12.10 available; native
  drivers present. No source drift or staged files.
- D-Python-red-01: 13 intended failures, one passing astral/byte-bound control.
  MAF-03 escapes UnicodeEncodeError; MAF-05 leaves the real child alive on five
  setup faults (each fixture subsequently reaps its own child); MAF-06 mislabels
  the first surviving EN trial; MAF-09 discards updated PDH data. An unwritable
  pre-existing pytest cache emitted warnings; subsequent runs use task scratch.
- D-Python-green-01: 14 passed after bounded fixes, 790 deselected. No models.
- D-EPUB-red-01: five intended failures and two controls passed; package pretest
  build executed. MAF-08 changes decomposed/mark-adjacent numeric tokens and
  therefore public continuation output before the correction.
- D-Desktop-red-01: MAF-07 reproduced. MAF-11 reproduced invalid UI state,
  but its disposal masked that error and its one-minute control called the
  internal start instead of the explicit Play route. This receipt is retained.
  Corrected only fixture cleanup/explicit restart before production edits.
- D-Desktop-red-02: eight intended failures, six controls passed. MAF-04
  admits Play throughout pending removal; MAF-10 rejects the healthy loaded
  reselection; MAF-11 fails for 2/5/10-minute targets while one minute passes.
- D-Node-red-01: fixture/preparation failure, not product evidence. Windows
  ESM preload requires a file URL, and a benign Node process can own a console
  child, invalidating an exact-one-process fixture assumption. The assertion
  preceded its finalizer, leaving four identified synthetic Node roots alive.
  Each was then terminated using its verified executable and creation ticks;
  D-Node-red-01-fixture-cleanup.json retains that recovery. The fixtures now
  enter cleanup immediately, capture the entire owned tree and use the existing
  identity-aware termination helper. The CIM module qualification is corrected.
  One infrastructure retry is selected after these concrete fixture changes.
- D-Node-red-02: MAF-01 reproduced three failures (deadline, cleanup failure,
  missing acknowledgement); normal completion passed. MAF-02 reproduced both
  partial-enumeration and unreadable-live-child faults using actual PowerShell.
  The verified-exit control also failed in the old observer; healthy control
  passed. All fixture children were reaped by their finalizers.
- D-Browser-reflow-red-01: fixture failure before geometry; the saved synthetic
  position omitted required preferences. Add the empty preferences object and
  EJECUTAR D-Browser-reflow-red-02, the one infrastructure retry for this stage.
- EJECUTAR D-Node-green-01 after cooperative wrapper/strict observation fixes.
- D-Node-green-01: 8 passed. Correction to red receipt interpretation: exited
  used a shim forcing Stop instead of respecting SilentlyContinue; its red
  failure is fixture evidence only. The two conditional fault reproductions
  are unaffected. Correct that shim for final validation.
- D-Browser-reflow-red-02: intended MAF-07 failure, real collapsed BR range
  has no client rectangles/all-zero bounds; restored block is 1855.5px from
  reading line. Position schema now valid; no production geometry edit yet.
- EJECUTAR D-Rust-red-01: default and release-locked-runtime filtered maf_04
  tests, with test-only verified-installation inputs and benign command seam.
  A barrier holds removal after verified stop while package files still exist;
  actual ServiceChild::Exact, process handle, Job and session ownership remain.
- D-Rust-red-01 and D-Rust-red-release-01: both intended failures in each
  variant. Removal admitted configuration and actual benign processes
  (23212/14664), contained through their owned handles/Jobs before assertions;
  cached configuration survived deletion. Conditional MAF-04 is established.
- EJECUTAR D-Desktop-green-01, D-EPUB-green-01 and D-Rust-green-01 after the
  bounded corrections; native controls cover interrupted published start,
  failed termination and Windows deletion failure/retry. No model loading.
- D-Desktop-green-01: 14 passed, 124 deselected. D-EPUB-green-01: 7 passed,
  154 deselected. D-Rust-green-01: 5 passed in each feature variant; real
  published benign children reaped (43132/50844). The caught synthetic mutex
  poison panic is the existing failed-termination control, not a gate failure.
- EJECUTAR P-Format-01 using repository format scripts, then F-Type-01,
  F-TS-01 and F-Python-01 on the consolidated sources. B1-browser-01 adds
  the existing SAC-01 completed-materialized-navigation control because the
  corrected preference transition exercises its final-highlight assertion.
  Browser fixture selection/removal uses synthetic native replies only;
  native exclusion is proved separately by the real owned-process tests.
- P-Format-01: PASS. F-Type-01: TS passed; Python rejected test references to
  non-exported module imports. F-Lint-fast-01: TS passed; Python test import
  order failed. Both are corrected using direct standard-library imports;
  affected Python leaves require renewal, not repeated unchanged TS leaves.
- EJECUTAR P-Core-inputs-01: hash/size-check all four existing source artifacts
  and six voice files, frozen lock, previous assembled package and inventory.
  This verifies artifact reuse only. Generator's locked offline private-core
  environment rebuild installs the current local VoxLeaf package; it does not
  update tooling, dependency versions, applications or personal installations.
- P-Core-inputs-01: PASS; ten exact artifacts and lock verified, previous core
  and inventory current. Artifact paths/sizes/SHA-256 are captured in
  core-reused-artifacts.json. EJECUTAR F-Core-01: one write-manifest generation,
  including both offline voice smokes, followed by current package verification.
- B1-browser-01: five passed; four fixture timing failures at synchronous
  Playwright check() after completed-player teardown became asynchronous.
  Screenshot confirms Quick applied. Use click() plus the existing retrying
  toBeChecked() assertion; no expectation is removed. EJECUTAR B1-browser-02
  after this concrete correction (one fixture retry); retain failed traces.
- EJECUTAR F-Python-static-02 for corrected Python test imports. Unchanged TS
  static results from F-Type-01/F-Lint-fast-01 will be renewed if later TS edits
  invalidate their full discovery/input closure. Shared package builders are
  serialized from here onward; no overlapping source writer is used.
- F-Core-01: PASS, one generation. 2024 files / 306742586 installed bytes;
  archive SHA-256 403e150cad08440a7c0007c8f1d7806c6d9bb7b80e82b08c48cfe8f8fab42089.
  Included offline payloads: ES 237400 bytes, EN 224028 bytes; not persisted.
  Current package verification passed. No source/voice artifact was downloaded.
- F-Python-static-02: Ruff and mypy passed (180 source files).
- EJECUTAR F-Python-01 and F-Rust-01 on final Python/native/generated inputs.
  The latter preserves both Clippy and cargo-test feature variants; B1 and
  TypeScript source corrections cannot invalidate these dependency closures.
- B1-browser-02 diagnosis: new MAF-11 behavior/restart assertions passed, but
  teardown used a nonexistent Close book button. The existing SAC-01 control
  exposed a genuine regression: releasing completed owners cleared the final
  highlight via an undefined phase. Replan this stage before another attempt:
  retain a consistent content-free completion projection during/after teardown,
  and use the existing Settings preference action for fixture teardown. This
  is a diagnosed source correction plus fixture correction, not a blind retry.
- F-Rust-01: both Clippy variants passed; cargo test default 148 passed/7
  intentionally ignored, release-locked-runtime 147 passed/7 ignored. Excluded
  exact-model tests remain explicit, not claimed as executed. No native edits
  after this receipt. Final Piper manifests were already generated.
- EJECUTAR F-TS-01: renewed TS typecheck and the single recursive final suite
  after completion-projection correction, preserving shared generation/build,
  EPUB pretest and all discovered desktop Node suites. EJECUTAR F-Static-02:
  final format checks plus renewed TS lint; Python/Rust lint leaves already
  passed on unchanged respective inputs. B1-browser-03 follows the TS builder
  sequentially on the corrected completion/teardown inputs.
- F-Python-01: 806 passed. F-TS-01: TS typecheck passed; shared 210,
  EPUB 749, desktop 984 and seven discovered Node suites/151 tests passed.
  F-Static-02: all format checks and TS lint passed. No test assertion was
  weakened to obtain these results.
- EJECUTAR B1-browser-03 after the documented completion-projection correction;
  EJECUTAR F-Build-Python-01. Native build waits for the browser frontend build
  to finish, preserving one writer for generated frontend output.
- N1 preparation: installed WebView2 is 156.0.4314.50; global EdgeDriver is
  155.0.4283.45. Reuse the existing SAF scratch EdgeDriver 156.0.4314.50 artifact
  (no installation/download), verify its hash, and pass its path explicitly.
  No old N1 PASS is reused.
- B1-browser-03: six passed, including the preserved final-highlight control;
  three fixture failures waited for the idle-only Play selector while the
  corrected state deliberately remains complete. Source inspection confirms
  completed playback exposes Start narration at visible passage in Details.
  Replan the fixture to use that existing explicit restart route; keep all
  completion/checkpoint/cleanup assertions. No production change follows.
  EJECUTAR B1-browser-04 and F-Browser-static-01. Retain F-TS-01 unit/Node
  results: browser specs are excluded by the unchanged Vitest config and are
  absent from the seven explicit Node entries and their import closures.
  Renew desktop typecheck (its include covers tests), and formatter/lint only
  for this changed browser file; unchanged paths retain F-Static-02 evidence.
- Existing matching EdgeDriver SHA-256 equals original SAF F-Identity-01:
  dd728c934e491abe7e8a07fa366aad135ea15d934cbba99192ad872da59c39d3,
  23956864 bytes. This is verified artifact reuse only.
- B1-browser-04: all nine selected cases passed. F-Browser-static-01: scoped
  Prettier/ESLint and the complete desktop typecheck passed. No production
  source changed after F-TS-01. F-Build-Python-01 built wheel and sdist.
- EJECUTAR F-Build-Desktop-01, preserving Tauri's frontend build hook, then
  N1-native-01 with the current executable and matching retained driver.
- F-Build-Desktop-01: PASS. N1-native-01: PASS on binary SHA-256
  7f5c1aa67c9278f5874bef54479f646415c09909ccafe90906f8de81f9da7dc8,
  12525056 bytes. Native protocol/delivery/cancellation/crash recovery, local
  reader/reselection/restart and synchronization checks passed with zero
  external requests. Binary unchanged; no new matching processes or temp roots.
  The two pre-existing native-startup temp roots were preserved.
- EJECUTAR F-Identity-01: final tool/artifact hashes, recovered fixture process
  identities, core staging/backup and index. PASS; original four recovered
  identities absent, no core staging/backup, index empty and HEAD unchanged.
- EJECUTAR F-Docs-01: current evidence guard, isolated guard tests, relative
  Markdown targets and diff whitespace. No additional runtime gate is selected
  for documentary edits; final archive will renew the repository guard/links.

## Final aggregate-to-leaf map

The commands below executed outside the sandbox in local PowerShell 7.6.5,
repository root. Each named receipt has immutable `-result.json`, `.log`,
`-before.json` and `-after.json` files in the task scratch directory. The wrapper
sets `COREPACK_ENABLE_NETWORK=0`, `UV_OFFLINE=1` and the existing Corepack shim;
it does not install tools. Sequenced commands stop on a nonzero exit.

| Obligation | Exact command / receipt | Result |
| --- | --- | --- |
| All configured format leaves | `pnpm.cmd format:check` in F-Static-02 | PASS: TypeScript/JSON, Rust and Python. |
| TS lint | `pnpm.cmd lint:typescript` in F-Static-02 | PASS; later browser-only edit renewed below. |
| Python lint/type | `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python` in F-Python-static-02 | PASS: Ruff and mypy, 180 sources. |
| Rust lint/tests | `pnpm.cmd lint:rust`; `pnpm.cmd test:rust` in F-Rust-01 | Both Clippy variants pass; default 148 passed/7 ignored, release-locked 147 passed/7 ignored. |
| TS type/tests | `pnpm.cmd typecheck:typescript`; `pnpm.cmd test:typescript` in F-TS-01 | PASS: shared 210, EPUB 749, desktop 984, seven Node entries/151 tests. Package generation/build and pretest hooks executed. |
| Final browser-file static renewal | `pnpm.cmd exec prettier --check apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`; `pnpm.cmd exec eslint apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`; `pnpm.cmd --filter @voxleaf/desktop typecheck` in F-Browser-static-01 | PASS. |
| Python suite | `pnpm.cmd test:python -o cache_dir=../../tmp/evidence/minimal-audit-findings-corrections/pytest-cache` in F-Python-01 | 806 passed. Only cache destination differs from the configured test leaf. |
| Core input/inventory check | `./tmp/evidence/minimal-audit-findings-corrections/core-inputs.ps1` in P-Core-inputs-01 | Ten hashes/sizes and lock verified; existing package and `pnpm.cmd inventory:release:check` passed. Inventory did not require generation. |
| Corrected core | `pnpm.cmd package:piper-core:write-manifest`; `pnpm.cmd package:piper-core:check` in F-Core-01 | PASS: one generation with ES/EN offline smokes. |
| Browser integration | `pnpm.cmd test:browser reader-reflow-restoration.smoke.spec.ts reader-narration-bugfixes.smoke.spec.ts --grep "MAF\|preserves one canonical passage\|LCF completed narration restarts\|SAC-01 completed"` in B1-browser-04 | Nine passed. Package and frontend hooks executed. |
| Python distribution | `pnpm.cmd build:python` in F-Build-Python-01 | Wheel and sdist built. |
| Native/frontend build | `pnpm.cmd build:desktop` in F-Build-Desktop-01 | PASS; Tauri frontend build hook retained; bundle inactive. |
| Native integration | `./tmp/evidence/minimal-audit-findings-corrections/native-acceptance.ps1` in N1-native-01, invoking `node apps/desktop/scripts/native-startup-smoke.mjs` | PASS on the identified current binary and retained matching driver. |
| Documentary validation | `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence`; `./services/tts/.venv/Scripts/python.exe tmp/evidence/minimal-audit-findings-corrections/check-doc-links.py`; `git diff --check` in F-Docs-01 | PASS: guard, 31 guard tests, 76 local targets and whitespace. Final archive renews affected checks. |

Neither `check` nor `check:portable` was executed or claimed as an aggregate PASS.
Their applicable leaves are mapped above. `build:packages` ran in the configured
TS type, test and B1 hooks. B1's webServer runs `pnpm run build` in
`apps/desktop`, whose script is exactly `vite build`, followed by preview. This
is the same leaf/cwd/configuration/toolchain as portable's desktop build. The
required Tauri `beforeBuildCommand` independently ran that leaf again. B1 and
native-build snapshots have identical emitted frontend path membership and
SHA-256 values; only the TypeScript incremental metadata differs after the
separate typecheck. That metadata is not an emitted app asset. No extra portable
frontend or aggregate build is needed.

## Evidence retention and final input closure

No SAF/RAC/VCA test result is reused. Original receipts informed gate selection,
not acceptance. Source/voice files and EdgeDriver are artifact reuse, with hashes
captured before use. Generator output is newly validated. Current-session passes
are retained only across independently irrelevant later edits:

- F-Python-01: Python source, tests, frozen authorities, shared schemas, lock,
  discovered file membership and venv metadata/records are unchanged. Later
  changes are renderer code/browser fixtures, frontend/native build outputs and
  documentation; these do not enter the Python test discovery/import closure.
- F-Rust-01: all native source, tests, Cargo manifests/lock, shared contracts,
  core manifests and native test binaries remain identical. Later renderer and
  frontend build changes do not enter Rust unit-test behavior; the current
  embedded frontend is separately rebuilt and exercised by N1.
- F-TS-01: all unit/Node source, fixtures, configuration, package outputs and
  discovered suite membership remain identical. The later browser-spec selector
  edit is excluded by desktop's unchanged Vite/Vitest `tests/browser/**` rule
  and absent from all seven explicit Node entries and imports. Desktop typecheck
  includes the spec and therefore ran again in F-Browser-static-01.
- F-Static-02: only the subsequent browser file belongs to its lint/format
  discovery, so that exact file was renewed. Documentation Markdown is outside
  the configured formatter/ESLint paths. Python static inputs are unchanged;
  later generated core JSON is outside Ruff/mypy source discovery and was
  covered by the final JSON formatter/package verification.
- B1-browser-04 and all final build/N1 results: no source, fixture, schema,
  tool/configuration or discovery changes follow. Output identity comparisons
  distinguish frontend assets from incremental type metadata. Native executable,
  wheel/sdist, drivers and tool identities are in
  `final-tool-artifact-identities.json`.

Before/after snapshots capture repository path discovery, hashes, package dist,
Node installation metadata/lock, Python distribution METADATA/RECORD/WHEEL,
frontend files and native test/binary artifacts. No dependency, version, tool,
driver or environment mutation occurred between these gates; all use the same
host and wrapper. M0/final tool versions agree. Final hash/size/timestamp records
and gate-specific drift lists accompany each review manifest; unproved identity
would require renewing the affected leaf, not borrowing a historical PASS.

## Cleanup and limits

MAF-01 fixtures cover success, cooperative cancellation, cleanup failure and
missing acknowledgement; finalizers verify owned identities gone. MAF-02 query
fixtures reap live/exited benign children. MAF-05 fault injection terminates and
waits for identified host children, closes acquired samplers/streams and retains
primary failures when cleanup also fails. MAF-04 covers owned process/Job and
stdin-worker release, interruptible published start, failed stop and locked
deletion/retry in both modes. The initial Node fixture leak was recovered by
PID/creation/executable identity, recorded separately and rechecked at closeout.

Core promotion left no staging or previous-package backup. N1 recorded no new
process or scratch root after success and preserved two old roots. Browser
fixtures release their scheduler/player and Playwright terminates its server.
No personal installation, firewall setting, model download or unrelated process
was changed. Failed logs and input snapshots remain available; B1-02 and B1-03
traces were copied before the next attempt. Earlier trace directories were
runner-overwritten, so only their original logs/snapshots are claimed retained.

The seven intentionally ignored exact-model Rust tests per variant, published
Chatterbox v7 and GPU/listening/quality/speed matrices are NO APLICA: no affected
model/adapter/loader/DSP responsibility changed. F6 changes v12 only; v9/v11 are
excluded. Reader performance budgets, clean Windows, public signing, antivirus
and installer journeys are not claimed. No indispensable gate is currently
BLOQUEADO. Independent implementation acceptance is APPROVE; final archival
acceptance is governed by the separate MAF-R2-20261029 report.

## M4 review and documentary closeout

`MAF-R1-20261029` independently approved the exact 1437-path implementation
manifest, all eleven corrections, receipt retention and exclusions. Its manifest
SHA-256 is e0a1f262c7ee81973a8918e7706b70ad9ca30e3c37b17b36ae53a1c086848237.
The immutable [R1 report](review-R1.md) records identity rechecks before/after,
the complete evidence assessment and no actionable findings.

After R1, only documentation changes: save R1 outside its own manifest, finalize
this ledger and the plan, move the plan from active to completed, and update the
active/completed/documentation indexes. Both sides of the move enter the new
identity manifest (old path DELETED, new path with full content). No production,
test, fixture, configuration, generated runtime, dependency or tool changes.

Classification before final closure:

- EJECUTAR F-Docs-R2: current `pnpm.cmd check:evidence`, relative-link check,
  `git diff --check`, then freeze the distinct R2 identities/diff/new files and
  receipt comparisons. This inspects the actual archived documentation.
- REUTILIZAR con prueba: F-Docs-01's 31 guard tests. The guard and its isolated
  test file, Node executable, package metadata/configuration and temporary-fixture
  discovery are identical; repository Markdown is input to check:evidence, not
  to the isolated guard-test fixtures. That actual repository guard runs again.
- REUTILIZAR con prueba: current-session runtime/static/build/core/N1 receipts
  accepted by R1. R2 compares the complete old/new source identities and ignored
  dependency/artifact snapshots; only documentation drift is permitted. No
  historical PASS or new model/performance assertion is added by archival.
- EJECUTAR final guard/link/whitespace and full identity recheck after saving the
  R2 report, which is deliberately excluded from its own manifest. No source or
  other reviewed-document changes are permitted after R2 approval.

The final report is `review-R2.md` in this evidence directory, Review ID
`MAF-R2-20261029`; it supplies the final verdict without mutating this closed
manifest to retroactively refresh approval. The branch/HEAD remain the original
plan checkout with an empty index and all task changes unstaged/uncommitted.
No commit, push, PR, merge, publication, download or personal-state mutation was
performed. The complete raw attempt ledger remains in ignored task scratch.
