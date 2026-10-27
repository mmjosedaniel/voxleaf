# Chatterbox runtime correctness with minimal package churn

Status: **Planned; execution not started.** Created on 2026-10-27.

Planning base: `bd2cbb9f17e104f8c42e2e388219e718aca791fe` on `main`.
Working branch: `codex/chatterbox-runtime-correctness`.

The current authorization covers this ExecPlan, its index entries, branch creation
and one local documentation commit. It does not authorize executing this plan,
running tests, implementation, package construction, downloads, publication, push,
PR creation or merge. A later execution request is required.

## Goal

Resolve the three findings from the focused Chatterbox/CUDA audit with the
smallest behavior change and the fewest necessary checks. Also close its two
release-process risks: a correction can miss the frozen packaged sources, and
file/hash checks alone do not establish that native dependencies can load.

Prefer **zero new optional-runtime versions**: preserve the exact published v7
payload, dependency lock, models, numerical behavior and generation settings.
Correct desktop admission and child startup, and accurately describe the
effective inference precision. A new runtime is a conditional fallback, not the
default deliverable.

## User-visible outcome

Chatterbox is offered only for the architecture its installed service accepts.
Unsupported or unknown architectures are rejected before download or activation;
existing optional data remains removable. On an otherwise supported Windows
computer, startup resolves the packaged Visual C++ dependency without depending
on developer tools or an incidental system redistributable. Existing Spanish and
English narration, cancellation, restart and memory-only audio remain intact.

Documentation distinguishes the legacy profile name and BF16 hardware capability
from the actual model parameter/inference precision. This plan does not optimize
or change the voice by introducing BF16 casts.

## Current state

The static audit inspected current sources and selected files of the local v7
distribution, including PE imports and matching manifest hashes. It did not run
inference or reproduce a failure on a clean Windows computer. Treat the following
as evidence-backed correction targets, not already passing runtime regressions.

| ID | Finding and evidence | Minimal intended disposition |
| --- | --- | --- |
| CRC-01, P1 | Packaged `torch/lib/c10.dll` imports `MSVCP140.dll`. The only exact-name copy in the v7 manifest is under `runtime/Lib/site-packages/sklearn/.libs/`; Torch's initial DLL loader does not register that directory. The installer does not provision the prerequisite. | Resolve the existing verified private DLL in the Chatterbox child before Torch import. Do not change the archive or install a machine-wide redistributable by default. Confirm the complete dependency chain before selecting this solution. |
| CRC-02, P1 | `windows_probe.rs::cuda_precisions_for_compute_capability` reports BF16 for major >= 8; native/renderer admission uses that fact. The frozen adapter requires exactly compute capability `(12, 0)` and `sm_120`. | Keep the adapter and Torch/CUDA versions; restrict both product admission paths to the exact supported architecture of visible CUDA ordinal zero. Unknown facts fail closed for Chatterbox only. |
| CRC-03, P2 | The profile is labeled BF16, but the packaged T3 constructor initializes `LlamaModel(config)` directly, uses ordinary `load_state_dict`, and moves to CUDA without an explicit BF16 conversion or autocast. Static tracing indicates FP32 parameters; no live dtype observation was made. | Observe the effective dtype using the exact package, then correct current explanatory metadata/documentation. Preserve numerical execution and historical profile IDs, receipts and manifests. |
| CRC-04, release risk | `packaging/chatterbox_sources.py::resolve_runtime_sources` deliberately supplies frozen v3 modules for v7. Editing `adapters/chatterbox.py` does not change v7. | Keep the primary fix outside the immutable package. Add/extend the existing source-selection regression and document the next-version boundary. Frozen-source selection is intentional, not itself a defect. |
| CRC-05, coverage gap | `check-local` verifies archive/tree/part identities but not native dependency resolution. Historical exact-local replay launches the Python smoke script directly. | Add a small loader/provenance check and exercise the actual production child-launch path. Do not interpret hash acceptance or the old direct-Python smoke as launcher acceptance. |

The exact existing package has archive SHA-256
`39dc073e01a5f02ce95b44e23b1024c3062ad1394fce3c917ec113fa45881aaf`
and runtime-manifest SHA-256
`48b392d82e9937e369170fd5c816b7a4ad766009f8816739441dddbd076c5d8a`.
Its runtime archive is 5,031,363,541 bytes; acquisition including six separately
distributed models is 8,240,315,465 bytes. CUDA **12.8** is the toolkit/runtime
version in Torch `2.9.1+cu128`; **12.0** is the GPU compute capability, not a
request to downgrade CUDA.

## Scope and non-goals

This is one coordinated bug-fix batch for CRC-01 through CRC-05. It covers the
latest focused Chatterbox review, not unrelated EPUB, playback or persistence
findings from earlier audits. No general refactor, new engine, broader GPU
support, automatic fallback, transport repair, voice/rate matrix, new model,
quantization or on-device pip environment is included.

The primary path must leave v7 parts, runtime/model files, frozen source
identities, requirements locks, publication records and historical evidence
unchanged. Do not edit completed plans or generated files manually. Preserve
user installations, reader data and unrelated worktree changes.

If private DLL resolution cannot be made reliable with existing manifest-owned
files, stop that implementation path and record the exact missing dependency.
Revise this plan around one explicit prerequisite policy or one successor runtime
before any expensive build. Do not repeatedly rebuild v7, silently create v8,
publish assets, or add a global redistributable installation as an incidental fix.

## Relevant files and documentation

- Instructions: `AGENTS.md`, `.agents/PLANS.md`,
  `docs/development/agentic-change-review.md`, `docs/development/testing.md`,
  `docs/development/evidence-retention.md` and the evidence-reuse rules in
  `.agents/skills/validate-safe-refactor/references/validation-policy.md`.
  This is behavioral work; the refactor campaign workflow is not adopted.
- Requirements/architecture: `docs/product/mvp.md`,
  `docs/architecture/overview.md`, `docs/architecture/system-diagram.md`,
  `docs/architecture/tts-support-matrix-v2.md`, `docs/user/windows-release.md`,
  ADR-0028, ADR-0046 and ADR-0064.
- Admission: `apps/desktop/src-tauri/src/host_profile_detection.rs`, its
  `windows_probe.rs` and `tests.rs`; `tts_optional_chatterbox.rs` and its tests;
  `apps/desktop/src/tts/hardware-profile-{authority,registry,matcher,compatibility}.ts`,
  `host-profile-client.ts`, `OptionalChatterboxControls.tsx` and affected tests.
- If needed to carry the architecture fact: the existing shared host-report
  schema, decoder and fixtures under `packages/shared`, its generated outputs,
  and the existing contract generator. Do not expand the TTS wire protocol.
- Child startup: `apps/desktop/src-tauri/src/tts_service_supervisor.rs`,
  `tts_service_supervisor/tests.rs` and `host_diagnostics.rs`.
- Packaging safeguards: `services/tts/src/voxleaf_tts/release_chatterbox.py`,
  `packaging/chatterbox_sources.py`, `tests/test_chatterbox_sources.py`,
  `tests/test_release_chatterbox.py`; changes here need a demonstrated gap.
- Diagnostics: existing `scripts/test-chatterbox-runtime-smoke.py`, dependency
  security probes, native supervisor host diagnostic and `package.json`.
  Prefer a narrow extension of an existing owner to a new orchestration layer.
- Historical evidence: [v7 completed plan](../completed/chatterbox-msgpack-security-refresh.md),
  [v6 completed plan](../completed/chatterbox-filelock-setuptools-security-refresh.md)
  and ignored `services/tts/release/optional/chatterbox/dist/v7/evidence/`.

Freeze the actual edited path list at execution start. New helper/test paths must
have a concrete responsibility and be added to that list before writing.

## Architecture and constraints

Keep local inference, one child tree, typed controls, bounded buffers and
identity-bound cancellation. No EPUB text, PCM, private paths or raw logs enter
tracked evidence. The ordinary service's stdout remains exclusively framed
protocol data; diagnostic metadata belongs in the bounded test harness.

For CRC-01, prefer a fixed, native-owned Chatterbox-only bootstrap at the existing
`ExactRuntime::command` boundary. Use absolute, already verified package paths;
register/preload the exact private DLL before importing Torch and retain any DLL
directory handle for the child lifetime. Confirm its transitive dependencies and
actual loaded-module origin. Do not depend on global PATH changes, load a DLL in
the parent and assume inheritance, copy files into the immutable runtime, or let
renderer input select executable Python or arbitrary directories. Keep Piper and
Qwen command construction unchanged. A cold child is essential to avoid a
previously loaded system DLL hiding the defect.

For CRC-02, retain the selected CUDA device's actual major/minor values rather
than reconstructing them from BF16 support. Carry the smallest necessary fact
through the existing typed host-report path if the renderer needs it; document
any additive contract change, regenerate outputs and cover old/missing-field
behavior explicitly. Keep generic hardware facts truthful: do not claim that an
8.x GPU lacks BF16 just to reject it for this specific profile. The renderer and
native pre-network/start checks must agree; cleanup must remain available.

For CRC-03, distinguish required hardware capability from actual dtype. Preserve
the legacy `...cuda-bf16-default-v4` identifier and persisted selections. Record
effective parameter and relevant activation/autocast observations without
tensors or text. If observation contradicts the static FP32 expectation, correct
the finding and current explanation rather than changing arithmetic to fit it.
Do not rewrite frozen benchmark records. A numerical change is outside this
minimal path and invalidates the quality/performance reuse decision.

Add one small ADR during implementation for the private DLL resolution and
profile-admission clarification if they constitute a durable decision. Review
the system diagram; update only affected labels/contracts or actual dependencies,
without presenting planned behavior as implemented.

## Milestones

### M0 — Freeze scope, baseline and reuse decisions

Status: **Not started.** Inspect drift from the planning base and preserve any
new user changes. Resolve original receipts and their before/after manifests.
Create a gate ledger with input identities, commands, environment, status and
invalidation rules. Select new regressions in existing owners and obtain their
focused red evidence before fixing behavior; do not run a fresh full baseline.

Use cheap PE/source inspection to enumerate the DLL chain and lookup paths. Check
the packaged MSVCP exports/imports against the exact Torch binaries before choosing
the bootstrap. Freeze the narrow architecture-contract design and clarify the
precision terminology. Missing proof is a pending item, never a presumed PASS.

### M1 — Apply the smallest corrections and permanent regressions

Status: **Not started.** Implement CRC-01 in child startup, CRC-02 in detection
and both admission consumers, and CRC-03 through observation/current wording.
Cover CRC-04/05 through existing source-selection tests and a loader/provenance
diagnostic. Register any missing focused command before using it. Do not assemble
an archive to test these desktop changes.

Required regression cases: exact private DLL origin and missing/invalid input;
unchanged non-Chatterbox command paths; CUDA 8.x/9.x rejection, 12.0 acceptance
subject to resources, unknown/unsupported capability rejection, default-device
selection, and rejection before any download callback. Cover renderer/native
agreement, retained-data removal and historical source selection. Test only
new or changed invariants; do not duplicate existing suites under new names.

### M2 — Run fast gates, then freeze executable sources

Status: **Not started.** Run affected format/lint/types and focused regressions
in normal local PowerShell. Generate contracts only through the registered
generator if the schema changes. Freeze production, tests, harness and relevant
documentation before host work; avoid the historical R7-to-R8 rerun caused by a
late test-file annotation. Record the exact source manifest and candidate build.

### M3 — Validate the loader and real startup once

Status: **Not started.** Check short writable scratch paths, tool versions,
existing package/model hashes, driver, GPU capability, free resources and owned
process cleanup before inference. Reuse verified local artifacts; do not download
models or reconstruct the three-part ZIP for a launcher-only change.

First run a fresh-process DLL/import/provenance probe without models or GPU work.
Prove private MSVCP selection even on a developer host with a system copy; include
a controlled negative case. A cleared PATH alone is insufficient because System32
is still searched. Do not rename/remove system DLLs or uninstall host software.

Then run one sequential ES/EN acceptance session through the actual production
launcher and supervisor, using v7 and the exact six models. Cover handshake,
load/warm, bounded finite PCM, health, in-flight cancellation, child termination
and explicit restart. Record effective dtype in this session or a bounded
non-inference probe; do not add an entire voice benchmark merely to observe it.
Require zero unauthorized network attempts and zero persisted audio. Verify
runtime integrity and cleanup afterward. Reuse the prepared tree and build across
the two arms; never run GPU arms or native linking concurrently.

The existing direct-Python smoke and `exact_local.rs` replay do not exercise
`ExactRuntime::command`. Extend the existing native diagnostic/test owner with a
narrow opt-in entry point that does, including release-locked behavior and a
disposable data root. Register its command during M1; it does not exist yet and
must not be represented as a previously passing check. Keep receipt-only dtype
instrumentation out of ordinary product controls and the public service protocol.

### M4 — Integration and independent acceptance

Status: **Not started.** Complete the applicable foundation graph once. Prefer
an explicitly recorded equivalent set of existing `pnpm.cmd check` leaves:
credit M2's passing gates whose complete inputs still match, then execute only
uncovered or invalidated leaves. Use the aggregate when establishing equivalence
would cost more than running it; do not repeat all fast gates merely because
this is the final milestone. Preserve both Rust feature configurations and all
affected generated contract consumers. Reuse an already built binary only for
the identical build configuration and inputs; a default executable is not a
release-locked build. Do not run both full `check` and `check:portable` by default.

Delegate the exact final patch and gate ledger to `change_reviewer` (GPT-6 Astra
high) under `docs/development/agentic-change-review.md`. The reviewer does not
execute tests. Require a new APPROVE report that explicitly accepts each reuse
decision; historical approvals do not transfer. Missing evidence/reviewer remains
BLOCKED. Correct only actionable issues and rerun affected gates. Archive the plan
only after all required outcomes, cleanup and independent review are complete.
Later implementation commits/push/publication require their own user authorization.

## Testing and benchmark strategy

All future tests and validation commands run in normal local PowerShell outside
the managed sandbox. The current turn only read code and retained receipts and
compared selected file identities; it executed none of the tests below.

### Previous execution evidence inspected during planning

The receipt directory is `services/tts/release/optional/chatterbox/dist/v7/evidence`.
Each named result has accompanying logs, environment and before/after source
manifests. Public summaries omit their machine-specific paths.

| Original evidence | Recorded result | What it actually establishes |
| --- | --- | --- |
| `C1-retained-package` | `package:chatterbox-optional:v7:check-local`, exit 0; about 227 s | Retained runtime, ZIP, parts and receipt matched at that checkpoint. |
| `S3-packaged` | msgpack 1.2.3 probe, exit 0; six security arms and four legitimate controls | The exact packaged msgpack behavior exercised, not all advisory variants. |
| `S4-runtime`, `S5-previous` | Exit 0; 3 security + 2 legitimate controls, and 5 rejected namespaces + 4 legitimate controls respectively | The specific existing certifi/Pillow and filelock/setuptools controls. |
| `S6-short-path` | Dependency probe exit 0, seven cases, zero network | Same bytes passed under a short path. Its original long-path failure remains recorded. |
| `P1-es`, `P2-en` | Exit 0; 3.96/3.24 s PCM; cancellation 406/297 ms; load/warm 31.032/20.594 s | Direct adapter smoke on that host. No full quality/performance or clean-host DLL claim. |
| `R8-exact-final-admission` | Exit 0, 1 test, 766.58 s; ES/EN 4.20/3.28 s PCM, cancellation 407/344 ms, zero network/audio files | Nine local artifacts, reassembly/extraction, rediscovery, direct Python smoke, integrity and removal. Supersedes R7's earlier test identity. |
| `N2-native-startup`, `R9-windows-consumer` | Exit 0; native startup and 22 Windows consumer tests | Original native reader/fake-service path and compiled NSIS/lifecycle controls. |
| `I14-release-rust` | Exit 0, 125 passed, 3 intentional opt-ins ignored | Original release-feature Rust suite; ignored tests were not passes. |
| `CI-final-ad9d5b0.json` and v7 closeout | Four hosted checks recorded as successful | Historical complete foundation/audit acceptance. Planning HEAD and `ad9d5b0991d04a56b12e6957346c893b114a5ff2` have identical Git tree `de50bf782cdf3933d206e8e28f1aeb348f10f96e`; this does not pre-approve later code. |

Planning compared the five security/smoke script hashes, v7 source manifest and
lock against S3/S4/S5/S6/R8 execution-time snapshots. The selected files match
before, after and the planning worktree; R8's test source also matches. This is
partial input proof, not a complete environment/transitive-dependency reuse grant.
The recorded environment was PowerShell 7.6.5, Node 24.20.0, pnpm 11.15.1,
uv 0.11.29 and Python 3.12.10. Refresh relevant environment evidence at execution.

### Reuse and rerun matrix

| Gate or asset | Decision for the primary path | Invalidation / required action |
| --- | --- | --- |
| Published v7 runtime, three parts and six models | **Reuse artifacts.** Keep immutable identities; one integrity pass over the inputs actually consumed is sufficient for preparation. | Changed/missing bytes require diagnosis. A filename, mtime or size alone is insufficient. Do not repeatedly hash unrelated archives when testing an already verified tree. |
| S3/S4/S5 security receipts | **Reuse candidates**, only for their unchanged library-specific invariants. | Require original receipts, full consumed input/runner/library identity and relevant environment proof. Changed probe/library or unknown assumptions require only the affected small probe again. |
| S6 dependency-import receipt | **Conditional reuse for unchanged library controls.** Rerun only affected cases when their actual consumed inputs or environment change. | It imports Transformers/Torch directly and does not run the native bootstrap. Old success with a system DLL cannot prove the new private loading environment; the fresh production-loader probe must supply that evidence. Do not add another standalone import run if the new probe covers the same invariant. |
| P1/P2 and R8 inference/cancellation timings | **Historical only.** Fresh production-launcher ES/EN evidence is mandatory. | Do not report old timings as current measurements or use direct Python smoke to accept native startup. |
| R8's complete 13-minute acquisition replay | **Do not rerun by default; do not claim its whole PASS for the new native binary.** Its immutable artifact evidence and historical extraction coverage remain references. | Rerun the configured replay once if acquisition, reassembly, extraction, promotion, removal, runtime layout or artifact identity changes, or if focused replacement coverage cannot establish independence. Admission-before-network changes receive focused current tests. |
| Old broad voice, all-rate, quality, throughput and physical multi-GPU matrices | **Not required by the primary change boundary.** Retain original claims and limitations. | Any model, arithmetic/dtype, Torch/CUDA, generation, narration preparation or audio pipeline change requires a revised affected benchmark/quality matrix. Never label synthetic GPU cases as physical GPU evidence. |
| Native startup, host-report contracts and affected renderer/native tests | **Run current affected checks.** | Their implementation or process environment changes. Historical CI cannot replace these. |
| Installer lifecycle/NSIS campaign | **Not required if installer and ownership behavior stay unchanged.** Existing deterministic consumer tests remain in foundation coverage. | Adding a redistributable installer, new prerequisite flow, NSIS change or installed layout change requires fresh relevant installer acceptance. |
| Full live HTTP acquisition | **Not required for these fixes.** | V6 read timeouts remain unresolved; no V7 complete-delivery claim. Run only under separately scoped transport work, not to diagnose DLL/GPU errors. |
| Historical foundation/CI | **Baseline only for edited dependency closures.** | Execute final relevant leaves once after freeze. Required future hosted checks are not waived; current authorization includes no push. |

Reuse requires the original command/outcome/input snapshot, unchanged transitive
inputs and tested artifact bytes, matching relevant environment and the same
invariant. Record dependency comparisons and the original gate IDs in the new
independent report. Never regenerate old identities to renew a prior approval.
When proving reuse would cost more than rerunning a small deterministic probe,
run that probe once instead. Artifact reuse does not imply measurement reuse.

### Commands and execution order

The following commands already exist in repository configuration; none ran during
planning. Working directory is the repository root unless stated otherwise.

| Phase | Existing command / configured leaf | Selection and acceptance |
| --- | --- | --- |
| New regression red/green | The two Cargo leaves of `pnpm.cmd test:rust`; the `vitest run` leaf in `packages/shared/package.json` and `apps/desktop/package.json` | These are existing configured runners, not a new named command. Freeze exact supported test filters and working directories in M0. Cover the changed boundary in both Rust configurations; desktop's wrapper appends Node tests and must not be assumed to forward Vitest filters correctly. |
| Contract generation, if needed | `pnpm.cmd --filter @voxleaf/shared generate`; `pnpm.cmd --filter @voxleaf/shared generate:check` | Generated output matches the coordinated host-report change; frozen packaged modules stay byte-identical. |
| Fast quality | `pnpm.cmd format:check:rust`, `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:rust`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript` | Run applicable leaves before costly preparation. Include Python format/lint/types if governed Python sources change. |
| Existing source guards | `pnpm.cmd test:chatterbox:v7:preparation` with a supported focused pytest selection; `pnpm.cmd package:chatterbox-optional:v7:check-source` | Current source-selection regression preserves v7 and historical authority. No lock generation/build. |
| Conditional dependency-security probe | `pnpm.cmd test:chatterbox:dependency-security` | Only for affected controls that cannot be reused or covered by the new loader probe. Use the exact verified interpreter and short scratch root; this command alone does not exercise the native bootstrap. |
| Fresh loader/native ES/EN | Existing `ExactRuntime::command` / supervisor diagnostic extended with a narrow registered opt-in command in M1 | Command is **pending implementation/registration**, not an available command today. Capture DLL origin, dtype, native protocol, cancellation/restart, privacy and cleanup on frozen inputs. |
| Final foundation | Existing leaves of `pnpm.cmd check`, or the aggregate if more economical | Map every required leaf to a current or independently approved reused receipt, preserving arguments, build dependencies and both Rust variants. Credit unchanged M2 gates; execute only remaining/invalidated leaves. Do not claim the aggregate ran if only leaves ran. |
| Conditional artifact replay | `pnpm.cmd test:chatterbox:v7:local-admission` | Only on the explicit invalidation conditions above; local verified inputs, no HTTP. |

One fresh loader probe and one sequential ES/EN session are the minimum host
acceptance targets, not promises that an unexpected failure may be ignored.
Avoid separate direct-adapter, full replay and broad portfolio runs proving the
same invariant. Reuse the final build across host gates; skip a second build only
when its arguments/features/resources and input identities truly match. Pure
documentation edits after freezing require documentation checks/review, not
another GPU session when they are not consumed inputs.

## Risks and rollback

- An existing MSVCP file may have an incompatible export/version or another
  unresolved dependency. Resolve this in the cheap closure/import stage. Do not
  patch binaries, use an arbitrary machine copy or weaken hash verification.
- A new CUDA fact can affect generated contracts and callers. Missing/unknown
  values must conservatively block only Chatterbox; preserve CPU availability,
  default ordinal behavior and removal. Review contract changes explicitly.
- Correcting a precision label must not become a numerical optimization. A real
  BF16 change requires replanning and new quality/memory evidence.
- Historical receipt environment coverage may be insufficient. Mark that reuse
  candidate unresolved and rerun its affected gate; do not discard other valid
  receipts or restart an entire campaign automatically.
- Long-path failures already occurred. Use short isolated host paths; if a drive
  alias is necessary, journal ownership and remove it in verified cleanup.
- Preserve processes, firewall rules, caches and user installations. Journal any
  owned host mutation and verify restoration after success, failure or interruption.

Keep pre-change sources and untouched v7 artifacts as rollback points. Revert
only task-owned source changes if the minimal approach is rejected. A failed
stage gets at most one infrastructure retry with a concrete changed condition;
a second failure stops that stage for diagnosis/replanning. Preserve failed
receipts. Do not reset retry counts by changing a run name or rebuilding blindly.

## Progress log

- 2026-10-27: Planning-only request received. Clean `main`/index observed at the
  recorded base; branch `codex/chatterbox-runtime-correctness` created.
- 2026-10-27: Read v7 closeout and original C1/S3/S4/S5/S6/P1/P2/R8/N2/R9/I14
  receipts, selected logs and before/after input manifests. Compared selected
  source hashes and confirmed the final-CI tree equals the planning base tree.
  No tests, runtime imports, GPU work or package builds executed.
- 2026-10-27: ExecPlan and indexes prepared. All implementation and execution
  milestones remain not started. The planning commit is the commit introducing
  this file; record a future execution base separately instead of inventing a
  self-referential commit hash.

## Discoveries and decisions

- Prefer resolving an already distributed DLL in the existing child boundary
  over changing a 5-GB archive. This is a planned solution, not validated yet.
- Prefer accurately describing existing arithmetic over silently applying BF16.
  Keep CUDA 12.8 and the exact `(12, 0)` architecture requirement distinct.
- R8 executes `python.exe` plus the smoke script directly at
  `tts_optional_chatterbox/tests/exact_local.rs:106`; its success cannot establish
  behavior of a modified native launcher. Its direct adapter cancellation also
  does not replace a current in-flight supervised cancellation check.
- S3/S4/S5 probe inputs inspected during planning match their old manifests;
  complete reuse remains subject to the execution ledger and independent review.
- The original final integration review was
  `CB-V7-INTEGRATION-R2-ASTRA-20261027`; it approved its own exact patch only.
  R1 required a second expensive replay after a late test change. Freeze test and
  harness sources before the costly stage to avoid repeating that pattern.
- The primary path has zero optional package builds, zero model downloads and
  no full HTTP transfer. A fallback that changes payload or installer behavior
  must revise both the implementation boundary and required gates first.

## Final validation results

**Execution pending.** Historical results above are attributed to their original
receipts. No implementation, test, benchmark, loader, clean-host or new package
acceptance is claimed by this plan. Planning inspection and selected hash/tree
comparisons are not runtime acceptance.

The planning-only documentation patch is exempt from behavioral change review.
Execution must supply the exact changed paths and identities, every fresh and
reused gate with its scope, retained failures, host cleanup evidence, and the new
independent APPROVE report. Current Git authorization ends with the requested
local planning commit.
