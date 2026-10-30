# Seven-finding minimal corrections

## Goal

Correct the seven statically revalidated findings R7-01 through R7-07 with the
smallest cohesive changes and the smallest sufficient set of current checks.
This is a correctness task across M005/M009/M010/M011 and benchmark tooling,
not a behavior-preserving refactor campaign.

**Planning only, 2026-10-30.** The user authorized this ExecPlan, its branch and
its documentation commit, explicitly excluding execution. Implementation,
regression execution, builds, model runs and implementation acceptance have
not started. Later execution requires authorization; this plan does not grant
push, PR, merge, release or publication authority.

## User-visible outcome

- Rechecking compatibility cannot bypass an unverified narration cleanup.
- Cancelling an optional download interrupts a stalled network operation and
  releases its incomplete staging through the existing acquisition owner.
- Audible advancement supersedes an older pending preference restoration.
- Narration segment text and locator ranges remain stable across batch sizes
  and cold/warm continuation inside quotations.
- Flush and close include the last accepted reading-position/preference save.
- A native start uses its own requested profile/language even if another IPC
  start overlaps. This is a native concurrency correction, not a claim that
  the current single frontend client permits simultaneous starts.
- Benchmark teardown failures retain process ownership for a safe retry. This
  last outcome concerns maintainer tooling, not ordinary desktop inference.

## Current state

Planning base: `499338fe84b45eca677b61ebd8e7dc8e76426b3a`, clean `main`.
Planning branch: `codex/seven-finding-minimal-corrections-plan`.
The seven findings were rechecked against source and callers without executing
tests. Six have concrete defective code paths; R7-07 has a permitted native
interleaving whose ordinary-UI occurrence is not established.

| ID | Owning source / mechanism at the planning base | Discriminating trigger and consequence |
| --- | --- | --- |
| R7-01 | `apps/desktop/src/tts/product-narration-coordinator.ts`, `#containOperationalFailure` and `resetRecoveryEpisode` | Containment cleanup fails, but scheduler/player references are cleared unconditionally. Explicit recheck can reset the episode without retrying/verifying those owners. Normal Stop already retains failed owners. |
| R7-02 | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, `send_download_request`, `copy_download_response`, `cancel_at` | Cancel sets an atomic flag while blocking reqwest `send`/`read` cannot observe it. A stalled operation can wait for reqwest 0.13.5's default 30-second timeout before the worker cleans staging. |
| R7-03 | `services/tts/benchmarks/isolation.py`, `IsolatedBenchmarkAdapter._terminate_worker` | `_process` is cleared before termination/join/close. If teardown fails or the worker survives its deadline, another close cannot retry against the retained owner. |
| R7-04 | `apps/desktop/src/reader/ReaderPublication.tsx`, audible `settleLocator` callback; `reader-reflow-restoration.ts`, `#complete` | Preferences preserve locator A; a same-chapter audible segment settles B before restoration finishes; pending A can then scroll/settle backward. The active-narration persistence guard prevents claiming that every such reflow also overwrites durable progress. |
| R7-05 | `packages/epub/src/narration/narration-preparation.ts`, warm cursor/checkpoint; both normalizers' punctuation plans | A warm request starts inside an open quotation without its opening context. Closing punctuation becomes malformed and the scanner may split before it, unlike reconstruction from block start. Existing English-title context does not carry quotation state. |
| R7-06 | `apps/desktop/src/persistence/reader-position-save-coordinator.ts`, both drain starters/finalizers | Between a drain finishing its loop and its `.finally` clearing the owner marker, a microtask can queue a newer value through flush/close. Startup sees the old marker; the finalizer clears it without draining the new value. Close may resolve with that write stranded. |
| R7-07 | `apps/desktop/src-tauri/src/tts_service_supervisor.rs`, `start_tts_service`, `configure_profile`, `start_owned` | A configures ES, B configures EN, then A starts from shared EN configuration. Configuration and start acquire/release admission separately. `TtsProcessClient.start` serializes a single client, but the native command itself is not atomic. Protocol v1 deliberately has no returned profile identity to detect this mismatch. |

The [roadmap](../roadmap.md#milestone-5-prepare-text-for-natural-narration)
marks M005 complete. Its completed plan and frozen authorities are historical
evidence, not mutable implementation documents. Current profiles are Piper
CPU and compatibility-gated optional Chatterbox v7; Qwen remains development-only.

## Scope and non-goals

### Minimal correction boundaries

**R7-01 — retain failed cleanup ownership.** Change the coordinator's failure
path to release owners only after verified cleanup, using its existing Stop/
recovery machinery. Explicit reset must join ongoing containment or retry the
retained owners; failed recovery as well as initial failure must stay blocked
until verified. Preserve identity invalidation, the existing cleanup deadlines,
single recovery attempt and no automatic playback restart. A failed backend
close is not cured by deleting its owner. Prefer no changes to the player,
scheduler, recovery authority or typed client.

Extend `product-narration-coordinator.test.ts`: operational failure followed
by transient/persistent service cleanup failure and explicit recheck; backend
cleanup rejection or delayed settlement; failed recovery followed by recheck.
Assert start remains blocked until all old ownership is verified, then requires
explicit Play. Retain the existing SAC-06 normal-Stop controls.

**R7-02 — make only the active network transfer abortable.** Keep the native
optional-package manager, admission, hashing, staging and promotion owners.
Use the existing reqwest asynchronous client and Tauri async runtime for one
owned request/body task; register its cancellation handle with the active
acquisition, abort it on accepted cancellation, and join its settlement before
reporting cleanup complete or clearing worker ownership. The existing Tauri
runtime exposes abortable task handles; no new production dependency is planned.
Keep disk work and lifecycle orchestration in their current owner where practical.

Cover cancellation before handle publication, stalled headers, stalled body,
normal completion and cancellation-versus-promotion. Preserve HTTPS/redirect
allowlists, no-proxy behavior, bounded streaming, size/hash checks, retained
installed packages and content-free diagnostics. Retain bounded header/idle-read
deadlines; do not turn the current per-operation 30-second timeout into a total
30-second limit for a multi-gigabyte transfer. Do not collect a whole body,
detach a blocking worker, retry downloads automatically, or merely shorten the
network timeout. The controlled stalled-network fixture must settle cancellation
and owned staging cleanup within two seconds; this is a fixture acceptance
budget, not a universal disk/network performance promise.

Extend `tts_optional_chatterbox/tests.rs` with barrier-controlled loopback
server cases through the real transfer helpers and manager ownership. Retain
the existing Windows accepted-socket `set_nonblocking(false)` correction, and
keep loopback allowances test-only. At most one private transfer helper module
may be introduced if needed; do not reorganize the manager or its manifest.

**R7-03 — retain the benchmark process until verified termination.** Keep the
captured process reference until termination/join and handle release succeed.
Close the connection idempotently, invalidate generation eligibility immediately,
and prevent a replacement worker while cleanup is unresolved. Preserve bounded
termination and existing content-free failure classification. No controller,
adapter or benchmark-policy redesign is needed.

Extend `test_benchmark_isolation.py` with a recoverable teardown failure, a
surviving-worker outcome and a repeated-close success, including zero replacement
workers while blocked. Use existing process/context seams and benign children;
restore injected failures and clean owned children in `finally`. Existing
`test_benchmark_dual_worker_runtime.py` covers the directly coupled consumer's
startup/cancel/close ownership and must run with the changed adapter.

**R7-04 — supersede pending reflow on authoritative audible settlement.** At
the ReaderPublication callback boundary, invalidate the older preference
restoration before applying the new audible locator. Use existing cancellation
and tracker suspension/resumption operations; preserve initial restoration,
explicit navigation settlement, focus and selection. Do not cancel reflow for
ordinary passive inspection or add a second locator owner.

Extend `ReaderPublication.test.tsx` with A-preserved/B-audible/pending-A-finished
ordering while the next range is already mounted; exercise start and completion
observations and retain paused/initial/navigation controls. Add one production
browser case to `reader-reflow-restoration.smoke.spec.ts` with deterministic
audible/layout ordering. Prefer no production edit outside ReaderPublication.

**R7-05 — retain bounded punctuation context at exact continuations.** Extend
the private preparation checkpoint/options with the smallest content-free
quotation state needed by the existing normalizers. Carry it at the exact
returned segment end and internal source-window continuation, not the end of
lookahead. Reset it at block/context changes and invalidated checkpoints; cold
reconstruction must derive the same state. Preserve the existing English-title
summary. Do not retain prior text/tokens, replay the whole block on every warm
request, increase hard bounds, or introduce a public schema/profile version.

Expected production edits are `narration-preparation.ts`,
`narration-prepared-segment.ts`, `narration-normalizer.ts` and
`narration-bilingual-normalizer.ts`. One directly shared private context helper
is allowed only if both normalizers need it. No source traversal, scanner or
packer change is planned unless the new public regression demonstrates necessity.
Record any such expansion before editing.

Extend the existing public `narration-preparation-matrix.test.ts`: compare
complete output/text/ranges at batch sizes 1, 8 and 16 and from a fresh
publication at the same continuation. Include paired straight/curly/guillemet
quotes spanning a returned batch and a source-window cut, genuinely unmatched
quotes, code/language boundaries and existing title-context controls. Cover
neutral/Spanish and bilingual/Piper/Chatterbox policy branches with a compact
parameterized fixture. Extend resource-bound coverage only for the added
checkpoint state; preserve work accounting, cancellation and close behavior.
Do not edit the frozen corpus, limits authority or completed M005 plan.

**R7-06 — make drain completion and owner release coherent.** In the two
existing save drains, make the empty-queue/owner-release transition synchronous
and ensure flush/close waits for all accepted latest values until quiescent.
Merely starting a replacement drain from `.finally` is insufficient if close
still awaits only the old promise. Preserve one in-flight write, latest-only
coalescing, narration authority, nonfatal storage failures and idempotent close.
Do not introduce a generic persistence queue or change storage envelopes.

Extend `reader-position-save-coordinator.test.ts` with explicit microtask
ordering: begin A's flush, settle A, then queue B and close before the old
finalizer clears its marker. Test positions and preferences, immediate resolved
repository promises, failure settlement, concurrent flush/close and no overlapping
writes. Keep the existing queued-during-pending-write test; it does not exercise
this completion gap. Use real promises/manual scheduling, not wall-clock sleeps.

**R7-07 — make selected configuration and spawn one admitted operation.**
Move command-selected configuration and child spawn under one admission/operation
scope, using private locked helpers to avoid recursive locking. Preserve the
model-free `start` entry, unprofiled development semantics, start-request identity,
fail-closed profile/language validation and release-locked restrictions. Publish
the child before releasing admission, as today; busy-start interruption must
remain possible during handshake/load. Preserve optional removal's admission
guard. No frontend change or protocol-v1 profile field is needed.

Extend `tts_service_supervisor/tests.rs` with two barrier-controlled starts using
distinct synthetic profile configurations through the same command-level helper.
Accept one correctly bound winner and a bounded Busy/InvalidState loser, never
a mixed profile/language. Retain pending-start shutdown, stale identity, removal
and both feature-mode controls. First demonstrate the permitted interleaving;
do not assume two ordinary UI clicks can create it.

### Non-goals

No unrelated cleanup/refactoring, dependency upgrades, new engines, model or
voice changes, audio persistence, network TTS, installer/uninstaller changes,
optional-package republication, benchmark-policy changes or support/performance
promotion. No changes to generated sources, frozen evidence or completed plans.
No new script alias or recurring validation runner is expected.

## Relevant files and documentation

The exact production/test owners are named above. Directly coupled read-only
controls include `pcm-playback.ts`, `operational-recovery.ts`, `process-client.ts`,
`segment-highlight-controller.ts`, `reader-reflow-restoration.ts`,
`reader-position-repository.ts`, `narration-position-save-bridge.ts`,
`narration-source-window.ts`, `narration-boundary-scanner.ts`,
`narration-segment-packer.ts` and the existing native host runners.

Read these authorities before execution and reconcile only current documentation
actually affected by the final behavior:

- [MVP](../../product/mvp.md), [reader settings](../../product/reader-settings-and-playback-controls.md).
- [System diagram](../../architecture/system-diagram.md), [overview](../../architecture/overview.md).
- [M005 completed plan](../completed/M005-narration-text-preparation.md),
  [ADR-0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md),
  [narration limits](../../architecture/narration-preparation-limits-v1.md).
- [ADR-0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
  [ADR-0056](../../architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md),
  [TTS protocol](../../architecture/tts-service-protocol-v1.md).
- [Testing](../../development/testing.md), [independent change review](../../development/agentic-change-review.md),
  [evidence retention](../../development/evidence-retention.md).
- [Evidence-reuse rules](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md#revalidate-changed-evidence-not-everything-by-default).
  Apply their proof requirements, not the refactor-only agents/per-unit baselines.

## Architecture and constraints

Existing owners remain responsible for EPUB preparation, reader placement,
reading-state persistence, narration, native acquisition and one local TTS child.
The async download task remains a bounded implementation detail of the native
acquisition owner; it creates no new network destination or independent service.
EPUB/text never leaves the device. Generated PCM remains memory-only. Retain
existing queue, source/work, payload and cleanup limits. No fixed startup wait.

Review the canonical diagram at closeout; update it only if the actual topology,
ownership or important flow changes. M005's historical implementation scope must
not be expanded to claim TTS or synchronization. Document the private continuation
correction in current narration documentation if needed; leave frozen examples
and historical receipts intact. No new ADR is expected for restoring existing
contracts; a new durable policy or dependency requires a recorded decision.

## Milestones

### M0: Freeze the bounded execution order — not started

After execution authorization, verify HEAD/worktree/index and exact mutable paths;
preserve unrelated changes. Inspect tools and original receipt availability,
freeze the gate selections below and capture execution-time input/environment
identities. Confirm the seven regression mechanisms, including native-only R7-07.
No whole-repository baseline or model run is required to begin.

### M1: Add discriminating regressions and minimal fixes — not started

Group new red cases by EPUB, desktop, Python and native feature mode before
changing their production owners. Use `R7-` / `r7_` test names to select only
the added cases for red execution. Preserve expected failures and distinguish
fixture errors from defect reproductions. Implement the seven bounded corrections;
if a claimed trigger cannot be demonstrated, resolve the evidence before editing
that owner. No implementation unit is individually claimed accepted before M3.

### M2: Validate the consolidated patch — not started

Run each selected final file/module suite once after its last relevant edit.
Refresh EPUB/shared exports before desktop consumers. Fast checks precede
browser/native/model work. Build the current native application once through
G7, reuse that exact binary for G8, and reuse verified runtime/model assets.
Run only invalidated gates again after a correction; preserve all failures.

### M3: Independent acceptance and documentary closeout — not started

Freeze source/tests/docs and supply the exact patch, closed input identities,
requirements, command outcomes and any proposed reuse to one `change_reviewer`
(GPT-6 Astra high), following the independent-review document. The reviewer
edits nothing and runs no tests. Resolve actionable findings and obtain APPROVE
for the exact patch. Missing host evidence or unavailable review is BLOCKED.
Verify owned-process/staging/scratch cleanup and current documentation; then
archive the completed plan and update indexes after implementation acceptance.
Git/publication authority remains separate from that approval.

## Testing and benchmark strategy

### Earlier evidence inspected during planning

These are historical host results, not newly executed tests or automatic
acceptance of a future patch. Original EFC result/input JSON files are available
under ignored `tmp/evidence/eight-finding-minimal-corrections/`. Planning checked
six receipt digests against the published table and verified each referenced
input-manifest digest: G5-python, G6-piper-regenerate, G6-piper-check,
G6-inventory, G7-default-optional and G9-native. All six matched.

| Evidence | Previously recorded result | Decision for this plan |
| --- | --- | --- |
| [EFC host receipts](../evidence/eight-finding-minimal-corrections/host-receipts.md), [ledger](../evidence/eight-finding-minimal-corrections/execution-ledger.md), [EFC-R2](../evidence/eight-finding-minimal-corrections/review-R2.md) | G5: 151 Python passes; G7: 60 optional-profile passes/two ignored per mode; G9: current-at-execution native smoke. Original receipts record normal local PowerShell; G5/G7-default/G9 took about 7.10/6.65/46.87 seconds. | R7-03 invalidates isolation/consumer results; R7-02/07 invalidate the relevant native results; frontend/native changes invalidate the executable. Run selected affected gates. Historical durations inform selection, not a promised speedup. |
| EFC G6-piper-regenerate, G6-piper-check, G6-inventory | One core generation including offline ES/EN smokes and successful package/inventory checks. Archive SHA-256 `81dd4a376e2d4cb3117a2c56a9a3f94edf23cb542fa19a32af76fdcc79229336`; runtime manifest `526447762ae3eb26383dbc095cdc8350b50546ed4259497915cade936f85d324`. | Candidate artifact/preparation reuse. R7 changes benchmark isolation, not shipped Python service/model bytes. No core regeneration or model redownload is selected. Reverify current package integrity before native use; do not relabel old voice smokes as current supervisor/coordinator acceptance. |
| [SFA ledger](../evidence/six-finding-audit-corrections/execution-ledger.md), [SFA-R2](../evidence/six-finding-audit-corrections/review-R2.md) | 242 selected EPUB, 186 desktop, 40 playback and 31 guard passes, two browser scenarios and model-free native smoke. G5R-playback's original host receipt is readable. | EPUB/reader/coordinator results are invalidated. The unchanged standalone player/transition suite is a conditional result-reuse candidate only if such a gate is required; it is not automatically rerun. Preserve existing fixtures. |
| [MAF ledger](../evidence/minimal-audit-findings-corrections/execution-ledger.md), [CI follow-up](../evidence/minimal-audit-findings-corrections/ci-follow-up.md) | Python 806; shared 210, EPUB 749, desktop 984 and Node 151; later 34 browser passes. | Historical baseline/context only. Do not repeat these whole suites solely to reproduce their counts. MAF/SFA already rejected older cross-task reuse lacking complete environment/dependency proof; this plan does not reverse that decision. |
| [SFA CI follow-up](../evidence/six-finding-audit-corrections/ci-follow-up.md) | Preserved Windows loopback WouldBlock failure and corrected blocking-socket fixture; earlier WebDriver failure and unchanged-source retry retained. | Reuse the corrected fixture and failure diagnosis, not the old native PASS. No retry-until-green policy or current hosted-CI claim. |

Planning additionally compared 30 recorded EFC G6-piper-check inputs under
`services/tts/src/voxleaf_tts/`, root core manifests/locks, `pyproject.toml` and
`uv.lock` with current file bytes: no differences. This is **partial source
equality**, not proof of current archive integrity, installed dependencies,
environment equality or a complete reusable runtime result. EFC's public
receipt table retains exact digests; no historical hashes are rewritten here.

### Reuse decisions and execution reduction

- **REUTILIZAR con verificacion:** cached verified Piper/Chatterbox packages,
  voices/models, pinned tools and matching WebDriver; existing synthetic fixtures
  and regression harnesses. Reuse is subject to the current manifests and host
  prerequisites. Prepared assets and historical test outcomes are different.
- **RESULTADO REUTILIZABLE SOLO CON PRUEBA:** an unchanged isolated leaf such
  as SFA G5R-playback or guard tests, or an unchanged EFC package/inventory check,
  only if its original receipt, complete transitive inputs/discovery, tools,
  artifact bytes and relevant environment match. The independent reviewer must
  record the comparison. Do not spend more work constructing partial proof than
  rerunning a small required leaf. No prior runtime result is pre-approved now.
- **EJECUTAR:** each changed owner's discriminating regressions and selected
  current integration gates below. No old result covers a test that did not
  exist. Same-task passing gates can be retained across demonstrably unrelated
  changes; a final docs edit alone does not rerun runtime checks.
- **NO APLICA by default:** aggregate `check`/`check:portable`, whole desktop/
  Python/Rust/shared suites, all browser scenarios, evidence-guard unit tests
  when that guard is unchanged, full reader performance/speed/listening/model
  portfolios, Qwen, real historical dual-worker benchmarks, full live optional
  acquisition, installer/uninstaller/firewall journeys, package regeneration.
  These exclusions are task-specific, not a new repository policy or PASS.
  Required CI checks still apply if publication is later authorized.

A changed runner, dependency, public contract, model/bootstrap, package payload
or additional production owner invalidates this gate selection: record the
affected invariant and smallest added gate before continuing. Never manufacture
execution-time identities afterwards or refresh an old report's hashes.

### Selected future commands

All execution below is **future work** in normal local PowerShell outside the
managed sandbox, from repository root unless the command selects a package.
These use current scripts or their configured Vitest/pytest/Cargo/Node leaves;
no new command alias is proposed. Pin existing supported Node and pnpm 11.15.1;
do not install/upgrade tooling merely to execute this plan.

| Gate | Invariant, timing and disposition | Command / selection |
| --- | --- | --- |
| G0 | Host/source/artifact readiness; no whole baseline. Build workspace exports only when missing/stale, and after final EPUB changes before desktop acceptance. | `pnpm.cmd build:packages`; `pnpm.cmd package:piper-core:check` once if the existing check cannot be retained with complete proof. Verify Chatterbox assets with the existing exact-host gate's verifier. |
| G1 | Directed pre-fix evidence, grouped once per runtime/feature variant. | G3/G4 commands with `-t R7-`; G5 with `-k r7_`; `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml r7_` and the same command with `--features release-locked-runtime`. |
| G2 | Current format/lint/type correctness before expensive preparation. | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`; `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust` (both configured modes). |
| G3 | R7-05 public continuation, normalization and finite resource invariants, one final selected-file run. | EPUB command below. Add only the new private helper test if one is actually introduced. |
| G4 | R7-01/04/06 failure/reflow/save races and their callers, one final selected-file run. | Desktop command below. |
| G5 | R7-03 isolated worker and directly coupled threaded runtime, model-free. | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_runtime.py` |
| G6 | R7-02/07 real network fixture/manager and supervisor module controls in both feature modes, after final native inputs. | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests::`; `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::`; repeat each with `--features release-locked-runtime`. Ignored exact-host cases remain ignored here. |
| G7 | Final real Chromium geometry plus model-free packaged WebView2/lifecycle/persistence. | `pnpm.cmd test:browser reader-reflow-restoration.smoke.spec.ts --grep "R7-04\|preserves one canonical passage"`; then `pnpm.cmd test:native-startup`. Keep configured build hooks; no separate duplicate native build. |
| G8 | One current Piper EN product-path run for coordinator cleanup, real prepared text, reflow/navigation and selected native profile. Use G7's unchanged native binary. | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-reader-corrections --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` |
| G9 | Shared spawn/containment also serves the optional runtime: one existing bounded supervised bilingual Chatterbox check, using verified retained assets. | `pnpm.cmd test:chatterbox:v7:native-startup`. Verify the fixture's existing `VOXLEAF_V7_RUNTIME`, `VOXLEAF_V7_MODELS` and short disposable `VOXLEAF_V7_SCRATCH` prerequisites. No model acquisition or repackaging. |
| G10 | Current documentation/evidence/scope, exact reviewed identities and cleanup. | `pnpm.cmd check:evidence`; `git diff --check`; local-link and allowlist inspection; independent `change_reviewer` report. These checks are renewed after relevant documentary changes, not substituted with old reports. |

G3:

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-boundary-scanner.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/resource/opened-publication.test.ts
```

G4:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/operational-recovery.test.ts src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/persistence/reader-position-save-coordinator.test.ts src/persistence/narration-position-save-bridge.test.ts
```

G8/G9 are deliberately narrower than the four-arm reader-corrections wrapper
with its all-speed matrix or the six-arm historical portfolio. Model-free tests
prove the exceptional interleavings; the bounded real-runtime checks prove
continued integration/containment, not new quality or performance claims.
Do not run the same binary/build preparation twice for equivalent consumers.
If the existing host harness lacks an indispensable assertion, document that
gap and prefer its existing synthetic seam; any necessary runner change gets
its own focused harness tests before use. Missing exact-host prerequisites
block the affected acceptance gate, not an excuse to claim a synthetic substitute.
The existing `narration-normalizer.test.ts` covers both normalizers; no separate
bilingual-normalizer test file or duplicate run is needed. G9 calls the shared
supervisor startup with a preverified runtime; R7-07's command-level synthetic
race regression and G8's selected-profile IPC route separately cover binding.

## Risks and rollback

- R7-01 must not lose recovery-attempt accounting or reopen narration during
  pending cleanup. Persistent failure remains unavailable, with retained ownership.
- R7-02 can accidentally move cancellation outside the promotion boundary or
  leave an async task/file alive. Keep a single worker, join cancellation and
  preserve installed/previous-package sentinels in tests.
- R7-03 must not spawn a second worker or clear a handle merely because an
  attempted termination returned. Preserve PID/creation/executable attribution
  for any real child cleanup; never terminate unrelated processes.
- R7-04 must preserve initial/explicit placement and passive-scroll policy.
  Assert the final authoritative locator and viewport rather than callback counts.
- R7-05 risks changed malformed-quote semantics, unbounded checkpoint state or
  quadratic replay. Public cold/warm equality and resource controls are mandatory.
- R7-06 needs completion semantics as well as eventual queue restart; failures
  remain nonfatal and must not create a tight retry loop.
- R7-07 must not hold admission through handshake or recursively acquire locks;
  cancellation/removal and stale-start protections remain discriminating controls.
- Retain immutable failed receipts and diagnostic classifications. Allow one
  infrastructure retry only after a concrete corrected condition; a second
  failure stops that stage for diagnosis/replanning. No automatic flaky retries.

During execution keep a resource journal for task-owned processes, scratch and
staging; preserve user packages/settings and unrelated files. A failed gate
does not permit deleting user state. Roll back only the cohesive task-owned
source/test change under current authorization; keep its failure evidence.
This planning commit has no runtime rollback requirement.

## Progress log

- 2026-10-30: Revalidated seven findings statically on `499338f`; documented
  R7-07's native-only concurrency condition and the limits of R7-03/R7-04.
- 2026-10-30: Inspected project/planning/review instructions, relevant product,
  topology/M005 authorities, owning code/tests, configured commands and earlier
  EFC/SFA/MAF evidence. Six original EFC receipt/input digests matched; 30 selected
  current core-source/configuration inputs match their earlier snapshot.
- 2026-10-30: Created the planning branch and authored this plan plus the two
  documentation indexes. All implementation milestones and future gates remain
  not started; no test, application, build or model execution occurred.
- 2026-10-30: Planning-only inspection in normal local PowerShell resolved 222
  local Markdown targets, all 12 required sections and every selected Vitest
  file. Compared command names/options with current configuration and runners;
  corrected the native fixture prerequisites and used the existing combined
  normalizer test file. No repository test or implementation gate was invoked.

## Discoveries and decisions

- Earlier green suites did not cover these precise failure/interleaving cases.
  Most affected results cannot be recycled; reuse verified preparation and
  fixtures, retain provably unaffected leaves, and avoid unrelated suites.
- Core-source equality does not prove current model/environment or runtime
  acceptance. No historical PASS is accepted solely from a summary or file list.
- Both normalizers have local punctuation state, so R7-05 must cover both
  rather than correcting only the bilingual consumer. The added state stays private.
- R7-07 is included as a small native correctness repair with a deterministic
  race test, without asserting that ordinary UI actions reproduce it.
- No shared schema, profile ID, dependency, frozen package or system-topology
  change is planned. Expand scope only from new concrete evidence.

## Final validation results

**Planning only; implementation not executed.** Source/caller/test and historical
receipt inspection support this work order. Runtime tests, regression runs,
format/lint/type commands and browser/native/model runs: **not run**. Future
implementation gates G0-G10 remain pending. Historical outcomes remain
historical; no complete cross-task runtime-result reuse is approved.

Planning documentation inspection, normal local PowerShell outside the sandbox:
222 local targets resolved, 12 required sections present and selected Vitest
files present. `git diff --check` passed for the tracked documentation changes;
the staged whitespace check must also include the new plan before commit.

The present patch contains this ExecPlan and its two index links only. It is
exempt from feature/bug `change_reviewer` acceptance as planning documentation;
the eventual behavioral patch requires the independent review in M3. The
authorized commit contains only the reviewed planning documents; no
implementation success is claimed.
