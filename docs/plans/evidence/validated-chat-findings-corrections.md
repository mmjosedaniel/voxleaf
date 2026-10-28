# Validated chat findings: execution ledger

Execution base/HEAD: `5f67bd69c805a59e0699d5ee103ff84255e0472d` on
`codex/chatterbox-runtime-correctness`. Initial index and worktree: empty/clean.
User authorization: implement and validate; no staging or other Git mutations,
publication, model downloads or new runtime versions. Historical receipts remain
immutable. Raw new captures belong in ignored `tmp/evidence/validated-chat-findings/`.

## Scope declared before implementation

- U1: `packages/epub/src/document/xhtml-projector.ts`, its test,
  `packages/epub/src/public/open-epub-publication.ts`, its test,
  `packages/epub/src/locator/locator-index.ts`, `target-resolver.ts` and existing
  integration/source-projector tests only if their consumed boundary needs it.
- U2: mutable `packages/epub/src/narration/narration-bilingual-normalizer.ts`,
  existing `narration-normalizer.test.ts`, `narration-source-projector.test.ts`
  and `integration/narration-preparation-matrix.test.ts`.
- U3: existing desktop `hardware-profile-compatibility.ts`,
  `hardware-profile-matcher.ts`, `product-narration-coordinator.ts` and their
  existing tests; `ProductNarrationControls.test.tsx` and existing browser
  `reader-narration-bugfixes.smoke.spec.ts`.
- U4: native `host_profile_detection.rs`, `host_profile_detection/windows_probe.rs`,
  `host_profile_detection/tests.rs`, `tts_optional_chatterbox.rs` and affected
  existing tests; desktop hardware authority/registry/matcher, host-profile
  client and existing tests. Shared schema/decoder/fixtures plus generator-owned
  outputs will be enumerated before the coordinated additive contract change.
- U5: `services/tts/src/voxleaf_tts/release_core.py` and
  `services/tts/tests/test_release_core.py`.
- U6: `apps/desktop/src-tauri/src/tts_service_supervisor.rs`, existing supervisor
  tests, `host_diagnostics.rs`, existing smoke diagnostic and `package.json`.
  Any new diagnostic file will be named here before writing it.
- U7: candidate confirmation in existing `process-client.test.ts`, worklet and
  PCM playback tests. Production changes require demonstrated reachable failure.
- Current explanatory docs: this plan/ledger, indexes, support matrix, overview,
  system diagram only if needed, Windows release guide, normalization v2 and one
  new ADR. Frozen sources/authorities/completed plans and package payloads excluded.

## Gate decisions recorded before the first execution

All commands run from the repository root in local PowerShell outside the sandbox.
Every fresh receipt will record command, exit/result, environment, source/test/
runner/configuration identity and artifacts. Full input snapshots conservatively
cover tracked sources, new task files, locks, generated outputs and build inputs;
tested binaries/build feature flags and relevant host conditions are separate.
Documentation edits invalidate only gates that actually consume those documents.

| Gate | Purpose and exact command/selection | Original result | Consumed closure/artifacts/configuration/environment | Initial decision |
| --- | --- | --- | --- | --- |
| D1 | EPUB projection/locators: plan D1 Vitest selection | NLC/CLB historical only | EPUB/shared sources, fixtures, parser/ZIP dependencies, package/TS/Vitest config, generated shared outputs | RUN focused new red, then current group |
| D2 | Narration: plan D2 Vitest selection | Historical Celsius controls only | D1 plus mutable/frozen normalization, preparation and budgets; no model | RUN new red and current group |
| D3 | Session/UI: plan D3 Vitest selection | Historical coordinator differs | Desktop/shared/EPUB dependency closure, refreshed dist, Vitest/jsdom config, controls and fixtures | RUN red and current group |
| D4 | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` selected detector/supervisor/optional tests, both default and `--features release-locked-runtime` | V7 I14: 125 passed/3 opt-in ignored (historical) | Rust sources/tests/build.rs, Cargo locks/toolchain, embedded schemas/manifests/resources, exact feature flags | RUN focused red in one configuration; final full suites satisfy both variants once |
| D5 | `uv run --project services/tts --locked pytest services/tts/tests/test_release_core.py` | No new retry reproduction | Python packager/core_integrity, fixture filesystem, pytest, uv/project locks | RUN focused red, then credit into final Python suite if unchanged |
| D6 | Plan D6 desktop Vitest selection and native lock-order tests if needed | Candidates unconfirmed | Real IPC locking and worklet MessagePort lifecycle/order; actual production implementation | RUN reachable-order controls; do not manufacture forbidden orders |
| B1 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep CHAT-AUDIT` | New cases pending | Desktop browser bundle, shared/EPUB dist, Playwright config/Chromium, actual worklet | RUN once after executable freeze |
| H-CPU | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | NLC H1 six-rate historical only | Final app binary/build flags/resources, WebView2/harness, verified Piper runtime/model, host and isolation | REUSE payload; RUN one current EN arm, no rate sweep |
| H-LOAD | New registered native diagnostic, before models | Historical direct Python import does not prove launcher | ExactRuntime command, manifest-owned private DLL imports/exports/origin, cold child, controlled negative | RUN after cheap PE inspection and harness freeze |
| H-GPU | New native production-launcher ES/EN diagnostic sequentially | V7 P1/P2/R8 direct Python: historical | Same final native binary/harness; v7 tree + six models; driver/default capability/free memory, firewall, dtype, cancellation/restart/integrity | REUSE payload; RUN current sequential ES/EN once |
| S3/S4/S5/S6 | Existing library-specific security probes | V7 original PASS receipts | Exact probe/library/interpreter inputs, dependencies and relevant environment | REUSE only if full proof is cheaper; otherwise rerun small controls; H-LOAD may cover imports |
| R01 | `pnpm.cmd test:chatterbox:v7:preparation` / `pnpm.cmd package:chatterbox-optional:v7:check-source` | V7 original guards pass | Frozen v3 source selection, v7 manifest/lock, packager tests and recipe | RUN small guards; no runtime rebuild |
| Foundation | Existing leaves of `pnpm.cmd check`: evidence guard/tests; all format/lint/types; TypeScript+Node, both Rust, Python suites; package/native/Python build | V7 CI historical baseline only | Each runner's full discovered input closure and environment, generated outputs, build flags/resources | RUN each final required leaf once, credit identical earlier leaves; never claim aggregate execution |
| Package replay / installer / rates | Existing R8, NSIS/lifecycle and broad portfolios | Retained historical acceptance | Unchanged acquisition/layout/payload/installer/DSP inputs | NOT REQUIRED unless a concrete relevant input changes; retain limitations |

## Current disposition (implementation APPROVE: CHAT-FINDINGS-R3-ASTRA-20261027)

| ID | Implemented result | Current passing coverage |
| --- | --- | --- |
| F01 | Exact default CUDA capability 12.0, missing/unknown rejected only for Chatterbox | Detector/matcher/contract suites; actual native host and ES/EN capability observation |
| F02 | CUDA driver free memory for the same default device; unknown free memory stays provider-local | Both native suites, unknown/threshold controls, Piper admission/continuation and native host's bounded report |
| F03 | Per-spine-occurrence fallback projections and stable distinct locators | EPUB projection/open/integration suites; mounted shared-fallback browser case |
| F04 | Whole ambiguous percentage/time expressions remain literal | Mutable normalizer/profile/source-range matrix; mounted reader case |
| F05 | Recover/retain sole Piper backup across blocked retries | Real tiny filesystem retry/failure/recovery tests in Python suite |
| F06 | Healthy loaded-owner continuation separated from fresh allocation | Matcher/compatibility/coordinator, window recheck browser, Piper reader lifecycle |
| F07 | Empty/ASCII-case-equivalent language contexts accepted | EPUB/narration and browser unknown-language case |
| F08 | Confirmed real native race; pending start bound to its request identity | Deferred client/unit coverage; R1-D6-F08 on frozen final default test/app |
| F09 | Confirmed real FIFO race; failed worklet messages bound to unit sequence | Real worker/MessageChannel successor and current-failure controls; bundled browser successor assertion |
| F10 | Bounded episode totals, read without advancing playback during cleanup | Failure/recovery/Stop/Play/reset, expired Stop/containment and failed-observation tests |
| F11 | Hidden root omitted while structure/budgets remain enforced | Projector malformed/hidden controls and mounted hidden-spine case |
| F12 | Failed owners expose executable actions only | Playing/paused coordinator and browser recovery cases |
| F13 | Child resolves verified private MSVCP/VCRUNTIME with origin checks | H-LOAD cold positive/missing/invalid controls; H-GPU production command |
| F14 | Current documentation describes observed FP32; legacy ID and arithmetic retained | ES/EN parameter/forward-input/autocast receipts; model-free observer forwarding control |
| R01 | Frozen v3 selection preserved; v7 guards pass; v2 validation bound to original digests | Source-selection guards in Python; native historical-package tests |
| R02 | Real native command and supervisor acceptance added | H-LOAD, sequential H-GPU, cancellation/restart and integrity/cleanup |

## Equivalent foundation graph and evidence reuse

The aggregate `pnpm.cmd check` and `check:portable` were **not** executed. Its
required leaves are covered as follows. All executions were normal local
PowerShell, with pinned pnpm 11.15.1/Corepack, Node 24.20.0, Python 3.12.10,
uv 0.11.29 and Rust/Cargo 1.97.1. Exact commands/cwd/timestamps/exits and source,
generated, package-dist and native-binary hashes are in each ignored receipt.

| Obligation | Exact existing command / receipt | Outcome and reuse boundary |
| --- | --- | --- |
| Evidence policy | `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence` / Q-foundation-remaining | Pass; 13 tests. Final index/path check still required at closeout. |
| TypeScript formatting | `pnpm.cmd format:check:typescript` / Q-format-final, plus scoped fixture/matcher/browser checks and R1-Q-format-current for four R1 files | Pass. Only subsequently changed TS/JSON files were rechecked. Markdown does not enter this formatter. |
| Rust formatting/lint/tests | `pnpm.cmd format:check:rust` / R1-Q-rust; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust` / R1-Q-native-final | Pass: 132 default, 131 release-locked; six opt-in ignores each. Final test executables are pinned after final UI/app build; host opt-ins use those exact bytes without relinking. |
| Python formatting/lint | `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`, extra scoped Ruff check/format of bootstrap/observer / completed leading leaves in Q-python-final.log | Pass. All Python/ruff/config/lock inputs unchanged since capture; later Rust, TS and maintained-document changes are not consumed by these leaves. The later pytest aggregate failed and is retained separately. |
| TypeScript types | `pnpm.cmd typecheck:typescript` / Q-typescript-after-fixture, then `pnpm.cmd --filter @voxleaf/desktop typecheck` / Q-typescript-remainder and B1-worklet-harness-repair | Pass. Shared/EPUB and their dist unchanged; changed desktop tests rechecked. |
| Python types | `pnpm.cmd typecheck:python` / Q-python-authority-repair | Pass, 180 files. Python source/config/locks unchanged afterward. |
| Shared/EPUB tests | `pnpm.cmd test:typescript` / completed passing leaves in Q-typescript-after-fixture | 210 shared + 688 EPUB pass; contract generator check verifies 17 files. Later native/test/browser/document changes do not enter these Vitest projects; legacy fixture already restored for this execution. |
| Desktop tests | `pnpm.cmd --filter @voxleaf/desktop exec vitest run` / R1-Q-desktop | All 867 pass after the four R1 controls and corrected owners. The earlier 863-case composition is retained as prior evidence, superseded for desktop by this complete current run. |
| Node tests | Exact seven configured desktop `node --test` files / Q-typescript-remainder | 101 pass. Same scripts/dependencies/configuration; later browser code and explanatory precision text do not alter the tested source/configuration/NSIS behavior. |
| Python tests | `pnpm.cmd test:python` / completed passing cases in Q-python-final.log; three focused continuations below | All 678 covered: 597 unchanged passes + 66 cases in twelve authority modules + 13 cases in four additional transitive modules + two contract-conformance cases. Original 42-failure aggregate is never relabeled passing. |
| Authority continuation | `uv run --project services/tts --locked pytest $cases` / Q-python-authority-repair; Q-python-transitive-remainder | 66 + 13 pass. Full sixteen-module import closure and exact selections retained in python-authority-closure.json; frozen normalization document is restored, not amended. |
| Contract continuation | `uv run --project services/tts --locked pytest services/tts/tests/test_contract_conformance.py` / Q-python-conformance-current | Two pass using restored legacy fixture and current generated schemas. Other changed native/desktop/doc paths are not Python test inputs. |
| Builds | `pnpm.cmd build:packages`; `pnpm.cmd build:desktop` / R1-Q-native-build; `pnpm.cmd build:python` / Q-foundation-remaining | Pass. Current UI/package/Rust/Python inputs match their outputs. Final host uses the pinned default app and release-locked native test executable as appropriate. Python build inputs remain unchanged. |

No historical test result is proposed as current launcher acceptance. All four
library-security probe groups ran freshly (S345-current and S6-and-host-cleanup).
Immutable v7 payload/models are reused as artifacts after full runtime hashes
before/after and six-model hashes before/after. Acquisition/extraction/layout,
HTTP delivery, installer behavior and DSP arithmetic were not changed; no full
R8 transfer/reassembly, installer lifecycle or six-rate portfolio was warranted.
Historical results describe only their original scope.

Reuse proof includes the full gate snapshots, `input-reuse-comparison.txt`, Python
transitive closure, unchanged tool/dependency identities and exact current build
artifacts. Broad snapshots deliberately include unrelated paths; each reuse row
states why those changed paths are outside its consumed closure. Early failed
wrapper exits lacking after/result files remain incomplete failed attempts, not
acceptance evidence. Their completed passing leaves have before identities and
unaltered safe logs; R3 explicitly accepts their limited use for the current
patch. Failed aggregates are retained and never relabeled passing.

## Progress and results

- CHAT-FINDINGS-R3-ASTRA-20261027 APPROVE: all F01-F14/R01/R02 accepted, both R1
  regressions resolved, final host byte identities/cleanup accepted and each
  documented reused group explicitly accepted. Identity recheck PASS; index
  empty. Report/manifests remain in ignored evidence. The [completed plan](../completed/validated-chat-findings-corrections.md)
  records closeout. The exact documentary archive/link review is retained as
  `tmp/evidence/validated-chat-findings/review-R4.txt`, outside its own manifest;
  the final response uses that report's current verdict. No runtime/test/build
  change is part of the archive step and no model/check suite is repeated.

- Final R1-H-cleanup passes: all six post-model hashes unchanged, runtime has no
  extras/audio files, no candidate child/app remains, exact owned scratch removed,
  no alias/firewall mutation. All three frozen executable hashes remain identical
  before/after. Scoped final R1-Q-format-current passes. Current full patch is
  ready for final independent acceptance; only maintained-plan/ledger reporting
  changed after the bounded R2 source review. No source/test/harness/build change
  followed the final model session.

- Final R1 host results use the frozen identities: R1-D6-F08 and R1-H-LOAD pass;
  R1-H-CPU passes with 5,717 ms to audio, 23,359 ms playable lead, zero underruns,
  557 ms cancellation, all five contexts closed and zero external requests/audio.
  Native host presentation admits Chatterbox on the actual supported device.
  R1-H-GPU passes ES/EN sequentially with the same release-locked executable hash
  as the loader: ES 487,680 bytes/cancel 240 ms; EN 533,760 bytes/cancel 219 ms;
  both FP32 observations/autocast disabled, zero guarded network/audio writes,
  explicit restart and all 13,091 post-runtime hashes verified. Final owned
  cleanup/post-model identity check is completing separately.
- Closeout commands registered before execution: scoped Prettier `--check` for
  the four R1 TS files after formatting preparation; final `git diff --check`,
  `pnpm.cmd check:evidence`, identity/index rechecks and `check-closeout-links.py`
  for current maintained Markdown links. These small checks do not repeat
  runtime/model or unchanged foundation suites. Archive only after full review.

- CHAT-FINDINGS-R2-ASTRA-20261027: identity recheck PASS, both R1 findings resolved,
  no actionable code/coverage issues. BLOCKED only for final host receipts, not
  for implementation. It accepts direct execution of the same libtest entries
  from the pinned binaries and preserves scoped Python/shared/EPUB/Node/library
  evidence reuse. Final F08 already passes on pinned bytes; final loader/Piper
  run without further native compilation. Source remains frozen before GPU.

- R1-Q-native-final completes after the final UI/app build: Clippy and both suites
  pass, 132/131 cases. `r1-frozen-binaries.json` pins the final default app, default
  test and release-locked test executable hashes. No further native linking is
  needed between loader and bilingual gates. Current code is frozen for the
  bounded R2 review; final host receipts remain pending. Original Python/shared/
  EPUB/Node/library-security and unchanged build/tool inputs retain the R1 reuse
  assessment, subject to final current-patch approval.

- R1-Q-desktop passes: scoped format/lint, desktop types and all 867 Vitest cases.
  R1-Q-rust passes both variants/Clippy/format (132 default, 131 release-locked,
  six opt-ins ignored each). R1-B1-browser passes all four current cases.
- To bind the final host gates to identical executable bytes, complete the
  default UI/app build first, then run the existing final Rust lint/test leaves
  once against that final embedded UI. Freeze the two produced test executable
  paths/hashes. Run the same existing F08, loader and bilingual libtest entries
  directly from those frozen executables with their existing exact/ignored/
  nocapture/test-threads arguments; do not let a second Cargo invocation relink
  between loader and GPU. This is the registered leaf of the same Cargo tests,
  not another runtime/harness implementation. Stop before GPU if loader fails.
  Register fresh `r1-host` ownership/receipt storage and short scratch so no
  original host metadata/result is overwritten. Final host gates use the final
  native feature configuration and retain a byte-identity check before/after.

- R1-cleanup-red reproduces both expired-transition cleanup paths with the real
  player/manual clock; Stop throws before cleanup and operational failure starts
  the successor. R1-cuda-red initially has a new-test signature error; the single
  corrected harness invocation R1-cuda-red-boundary reproduces Partial versus
  expected Complete. Preserve both attempts. Corrections add read-only player
  observation/guarded final metrics and keep optional unknown free CUDA memory
  provider-local. Terminal projection also reads without advancing playback.
- R1-cleanup-cuda-green: four focused desktop controls and native unknown-memory
  control pass. Added controls include metric-observation failure, real expired
  Stop/containment, and Piper admission/continuation with Chatterbox acquisition
  rejected. Run final affected fast gates and code review before host repeats.

- Independent review CHAT-FINDINGS-R1-ASTRA-20261027: CHANGES_REQUESTED, identity
  recheck PASS. It accepts the documented R1 evidence composition/reuse but finds
  two P2 regressions: mutating metrics capture can skip Stop/containment cleanup;
  optional unknown CUDA free memory can globally disable Piper. Reopen those
  bounded F10/F02 units. Add real-player pending-transition Stop/containment and
  native/renderer/continuation controls before repairing production.
- Additional allowlist: `apps/desktop/src/tts/pcm-playback.ts` for a read-only
  existing observation projection, its existing tests, existing coordinator,
  native detector and compatibility/matcher tests. No unrelated refactor.
  Register focused red Vitest/Cargo controls, then desktop Vitest/type/lint/format,
  both Rust configurations/Clippy/fmt, all four affected browser cases, default
  build and current Piper EN. Native detector/test changes invalidate the linked
  opt-in test executable under complete-input policy: the same reviewer requires
  a fresh final H-LOAD/H-GPU, not automatic reuse. Preserve original receipts and
  executable; retain v7/models unchanged. A bounded code review precedes the next
  GPU use to avoid another late source invalidation.

- S6 seven dependency security controls pass freshly. Final cleanup verifies the
  six model hashes again, no runtime extras, no audio files or remaining candidate
  child/app, and removes the exact owned scratch. The four metadata-only native
  receipts are retained under this execution's ignored evidence directory.
- Final input audit identifies the restored legacy host fixture as a consumed
  input of Python's two cross-language conformance checks. Register a final
  `uv run --project services/tts --locked pytest services/tts/tests/test_contract_conformance.py`
  (only that module). The equivalent Python coverage is then 597 unchanged
  original passing cases + 66 authority-group cases + 13 transitive cases + two
  conformance cases = all 678 cases, subject to independent reuse approval.
- Correct the native totals from the actual final log: default **131 passed**,
  release-locked **130 passed**; six explicit opt-in ignores in each. The three
  applicable opt-ins (F08, private loader, sequential bilingual) have separate
  current passing receipts. Other opt-ins remain outside this task's scope.

- H-GPU now passes fully: both languages, fresh supervised restart, matching
  in-flight cancellation and the full 13,091-file post-runtime identity check.
  Before cleanup, register `cleanup-host.ps1`: preserve only the four bounded
  diagnostic JSON receipts, verify six post-model hashes/no extra runtime files,
  verify no candidate child/audio files, then remove only the exact freshly owned
  short scratch after path/link containment checks. No drive/firewall mutation
  was needed. The diagnostic connection hooks cover the Python service's network
  attempts; the CPU WebView2 arm separately observes external requests.

- H-CPU passes on the final default Tauri executable with admitted packaged
  Piper EN: quick command-to-audible 5,546 ms with 18,284 ms playable lead;
  60,089 ms observation, zero underruns; prepared start 6,343 ms; cancellation
  260 ms; all five AudioContexts closed; synchronized seek/chapter replacement,
  focus, locator/persistence and cleanup pass; zero external requests/audio files.
  No six-rate sweep or installer replay was run.
- H-GPU language arms have completed through the production command/supervisor:
  ES load/warm 22,147/8,569 ms, 552,960 PCM bytes, cancel 295 ms;
  EN load/warm 17,920/2,617 ms, 549,120 PCM bytes, cancel 228 ms. Both observe
  default capability 12.0, FP32 T3/S3Gen/voice-encoder parameters, FP32 floating
  T3 forward inputs and disabled CUDA autocast. Both report zero guarded network
  attempts/audio writes, current private DLL origins and terminated children.
  The sequential test is still completing its mandatory full post-runtime hash;
  these partial arm results alone do not establish final host acceptance.
- F14 changes only current explanatory metadata/documentation. Keep the stable
  legacy ID, BF16 hardware gate and all numerical behavior. Parameter/input
  observations do not characterize every internal GPU operation.
- S6 dependency controls will also run once on the current retained interpreter
  after the model gate, using existing `pnpm.cmd test:chatterbox:dependency-security`
  with private runtime on PATH and disposable TEMP. This avoids incomplete reuse
  proof for the removed historical interpreter tree; no inference is repeated.

- Reuse closure audit found four further Python test modules transitively
  importing v8 authority, even though they passed the original failed aggregate.
  Do not credit them solely because they were green. Register a single pytest
  run of the four `notYetRerun` modules in `python-authority-closure.json`;
  the sixteen-module import closure is computed from tracked Python sources
  (including constant importlib imports), with the frozen document's reader as
  seed. This preserves the full dependency rule and avoids a full-suite repeat.
- D6-F08-green passes using the final default app's real model-free child:
  old pending-start shutdown cannot kill its successor. Artifact preflight
  verifies all six original model sizes/digests, exact v7 manifest identity,
  no extra runtime files, and fresh journaled scratch. S3/S4/S5 controls pass
  freshly on that existing packaged interpreter, with no model loading.

- B1-worklet-harness-repair passes, including explicit proof that the real old
  failure was delivered to a successor handler. Browser coverage is the three
  unchanged passing cases from B1 plus this corrected arm. Its scoped format,
  lint and desktop type check pass too.
- Q-foundation-remaining: evidence guard passes, 13 evidence-policy tests pass,
  Python source/wheel build passes. Q-native-build is building the final default
  Tauri executable; do not substitute it for release-locked test artifacts.
- Before host execution, current retained paths have maximum consumed
  Torch/transformers/sklearn path length 240, below the prior long-path failure;
  use a fresh short Temp scratch, with explicit ownership/cleanup journal. No
  drive alias, runtime copy or model download is needed. Existing system MSVCP
  is present, so the positive origin/negative loader controls are meaningful.
- Historical S3/S4/S5's temporary interpreter tree has been removed. Establishing
  its full execution closure now costs more than their small controls. Register
  one current execution of existing `test:chatterbox:v7:security`,
  `test:chatterbox:runtime-security`, `test:chatterbox:v6:security` using the
  retained interpreter on PATH, isolated `-I -B` and disposable temporary root.
  No model/GPU or acquisition replay is involved. Keep historical results as
  historical rather than renewing their identities.
- Capture-wrapper correction: `exit` inside the first wrapper's in-process
  ScriptBlock could bypass its result/after snapshot on an early failed leaf.
  Preserve `run-gate-v1.ps1`, logs and available before snapshots; missing
  receipts are explicitly failed/incomplete, never green evidence. New gates
  execute the exact command in a child normal local PowerShell so exit status,
  after snapshot and immutable result are always captured. This changes only
  ignored receipt plumbing, not a tested production/test input.

- B1: first three mounted-reader cases pass. The real-worklet arm exposed an
  infinite loop in the diagnostic queue: optional invocation skipped `shift()`
  when the backend cleared its handler. Shift unconditionally; use token-packed
  synthetic text (zero intentional boundary pause) and assert that the real old
  failed event reaches a successor's handler. Keep all messages in actual FIFO.
  The sole browser infrastructure retry is restricted to that worklet case;
  the other three cases and their unchanged helper branches retain their receipt.
  Register file-scoped Prettier/ESLint and desktop typecheck before that retry.
- Q-typescript-remainder passes: matcher 17/17, desktop types and all seven
  configured Node test files. Combined with the matching-input passing shared,
  EPUB and unaffected desktop Vitest results, all TypeScript obligations are
  covered without repeating the complete graph.

- Q-rust-current: formatting, Clippy and both complete Rust configurations pass
  (130 passed, six explicit opt-in ignores per configuration). Historical v2
  validation now consumes its original fixed size/digest identities.
- Q-python-authority-repair: all 66 tests in the twelve authority-dependent
  modules pass; Python types (180 files) and v7 source-selection check pass.
  The unchanged passing remainder of Q-python-final is proposed for reuse;
  the original aggregate failure remains recorded and is not relabeled green.
- Q-typescript-after-fixture: shared and EPUB suites pass; desktop has 862
  passing tests and one malformed negative fixture (CUDA unavailable while its
  new capability was still known). Correct that fixture to unknown capability.
  Before the next execution, register the existing Vitest leaf restricted to
  `src/tts/hardware-profile-matcher.test.ts`, desktop `typecheck`, ESLint/Prettier
  for that file, and the seven Node test files from desktop's configured `test`
  script, whose execution the Vitest failure prevented. Reuse the unaffected
  passing TypeScript suites after proving matching source/build/config inputs.

- Integration failure retained: Python 636 passed/42 failed, all failed paths
  rejected frozen v8 normalization authority drift. Removed the accidental note
  from frozen `narration-normalization-v2.md`; the new ADR/maintained overview
  carry the amendment instead. The document is restored byte-for-byte. Also
  retain the original legacy synthetic host fixture; additive facts are tested
  using explicit current fixtures in code, with old/missing behavior covered.
- Native default suite: 130 passed/1 failed/6 explicit ignores. Its failure exposed
  R01's related historical validation gap: v2 correction validation hashed the
  mutable current generated schema. The existing published v2 sizes/digests are
  now frozen constants (identical to the original manifest), replacing those
  mutable include-bytes dependencies. No historical bytes or hashes are renewed.
  Only historical v2 validation consumes that correction; v7 extraction/promotion
  and every current payload/layout remain unchanged, so R8 is not invalidated.
  Both Rust variants will rerun after this native source correction. Python
  reruns are limited to the frozen-authority dependency group plus consumers
  invalidated by these restored/fixed inputs; unaffected passing tests retain
  their original receipt and matching input closure for independent review.

- Before GPU use, extend existing mutable
  `services/tts/tests/test_chatterbox_v7_preparation.py` with an isolated subprocess
  control for the new observer. It verifies forwarding/return preservation,
  content-free dtype receipts and negative network/audio guards without a model.
  It is covered by the final existing Python suite; no inference run is needed
  to debug diagnostic bookkeeping.

- F08 is CONFIRMED by D6-F08-red-native-child: the old shutdown terminated
  `service:native-2`. Minimal coordinated fix: an additive bounded
  `startRequestId` on native start/pending-start shutdown IPC, allocated by the
  typed client before dispatch and retained in the native session. A shutdown
  must match the original request before touching the child. Acknowledged service
  shutdown remains identity-bound as before. TTS wire protocol v1 is unchanged;
  legacy native/internal optional arguments remain supported. This is an explicit
  IPC contract addition, not a silent protocol/schema change. The two candidates
  are now confirmed, so the final batch owns fourteen unique corrections.
- U7 now also includes `apps/desktop/src/tts/process-client.ts`, its existing tests
  and the native supervisor tests. No general lifecycle refactor is authorized.

- F08 first native confirmation attempt stopped on a harness prerequisite:
  a Cargo test executable does not dispatch the ordinary binary's fake-child
  CLI. The single infrastructure retry uses the already present native binary's
  unchanged model-free child entry point; the supervisor/locks under evaluation
  are current test code. The gate is explicit/ignored in the ordinary suite.
  Exact command: set `VOXLEAF_NATIVE_MODEL_FREE_BINARY` to the existing repository
  executable, then the configured Cargo leaf filtered to
  `tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement`
  with `--exact --ignored --nocapture`. The final green uses the final build.
  Retained N2 PASS is not claimed as a fresh result. Binary identities are now
  included in every new input snapshot.

- F08: the client-local guard is counterevidence only for reuse of one client.
  App replacement constructs a different coordinator/client and does not await
  old narration close. Therefore that guard alone cannot close F08. A bounded
  native confirmation now pauses the real start after publishing its real framed
  child and pauses shutdown immediately after observing Busy, before reading the
  session. Child failure and a new book's start then occur while the older
  shutdown thread is preempted. This order preserves IPC request order and every
  production lock. Existing fake child and test-only barriers model the exact
  thread preemption points; no arbitrary port response order is assumed.

- Formatting/preparation commands registered before execution: existing Prettier
  `--write` leaf restricted to task-owned changed TS/TSX/JSON paths excluding
  generated outputs; `pnpm.cmd format:rust`; existing Ruff `format` leaf restricted
  to the Piper source/test, native bootstrap and smoke observer. Generated files
  are changed only by `@voxleaf/shared generate`.
- New outcomes: D12-red-pinned reproduced F03/F04/F07/F11 (six failures);
  D5-red reproduced destruction on the second blocked retry. D4-red reproduced
  missing architecture provenance and DXGI budget reuse. D3-red reproduced F06
  and F10; D3-F12-red reproduced dead actions for both playing and paused owners.
  D6-F09-red-file-url reproduced the real FIFO successor failure. D4-F13-red
  established the missing child bootstrap boundary. These are expected red
  evidence, not acceptance passes.
- First grouped green runs retained their failures. Remaining failures were
  newly added fixture assertions (text-node fragmentation, correct Spanish time
  wording, source offset 10, required preparation profile, normal teardown count)
  and legacy synthetic reports lacking the newly required exact CUDA fact.
  They were corrected without weakening the product assertions. D5-green passed
  19/19; a pre-existing pytest cache permission warning remains recorded.

- U6 additional paths declared before writing: native-owned
  `apps/desktop/src-tauri/src/tts_service_supervisor/chatterbox_child_bootstrap.py`
  (included by `ExactRuntime::command`, Chatterbox-only) and
  `tts_service_supervisor/tests/packaged_chatterbox.rs` (explicit opt-in diagnostics).
  Register `test:chatterbox:v7:native-loader` and
  `test:chatterbox:v7:native-startup` in package.json before use. They run the
  release-locked native launcher against verified existing artifacts and models;
  they do not acquire, rebuild or alter runtime payloads. Child-only diagnostic
  arguments observe library origin, dtype and network denial outside ordinary
  service controls/protocol. No ordinary stdout metadata is permitted.
- Fresh dumpbin inspection confirmed c10 -> MSVCP140 -> VCRUNTIME140/140_1 plus
  Windows API-set dependencies. The verified runtime already contains both
  VCRUNTIME DLLs beside private Python and MSVCP140 in sklearn/.libs. Cold imports
  must establish ABI/export closure and private selection before model work.

- F09 confirmation harness first attempt stopped before exercising the race:
  jsdom's URL resolved the module to HTTP, which Node's worker cannot import.
  The single infrastructure retry supplies a `pathToFileURL` of the source in
  the configured desktop cwd. No product correction was applied to F09 yet.

- U4 contract design: add optional, bounded `cudaComputeCapability` to the existing
  host report (known major/minor or unknown). Old/missing fields remain decodable
  and cannot admit Chatterbox. Generic BF16 capability remains truthful. The native
  default ordinal owns this fact; CUDA free memory comes from `cuMemGetInfo_v2`
  in a temporary retained/pushed primary context of that device, with verified
  pop/release. DXGI budget headroom becomes unknown. This observation is an OS
  snapshot, not an allocation guarantee or a different GPU selector.
- Additional exact U4 paths authorized before editing: shared
  `schemas/host-profile-compatibility-report/v1.schema.json`,
  `src/contracts/host-profile-compatibility-report.ts` and its test,
  `fixtures/contracts/host-profile-compatibility-report/v1/valid-synthetic.json`;
  generator-owned `src/generated/contracts/host-profile-compatibility-report-v1.ts`,
  `src/generated/validators/standalone.ts` and `services/tts/src/voxleaf_tts/generated/protocol_schemas.py`
  (actual generator delta will be checked). Existing renderer test fixtures/harness
  reports may need the additive field where they intentionally assert admission.
- F09 reachable ordering identified for confirmation: worklet ends unit A and
  queues `ended`; a Pause sent before main-thread receipt reaches the already
  ended worklet and queues `failed` after `ended`. FIFO delivers `ended`, whose
  callback starts B, then the A failure reaches B's new handler. This preserves
  FIFO in both directions. Use the real processor and MessageChannel to verify.
  Conditional production paths now include the existing worklet and Web Audio
  backend, with their existing tests and the grouped browser spec.

- First D12-red launch stopped before tests: inherited `pnpm.cmd` was 11.25.0,
  while the repository requires 11.15.1. The existing Corepack shim is present;
  the single infrastructure retry uses that shim ahead of PATH, without any
  dependency/package installation. The failed command/receipt is retained.

- M0 started. Required local scope and evidence policy inspected. No tests, model
  operations or package builds have run in this execution yet.
- F01-F07/F10-F14: correction targets. F08/F09: confirmation pending. R01/R02:
  guard/startup coverage required. All integration and independent-review gates
  remain pending; no acceptance is claimed.
