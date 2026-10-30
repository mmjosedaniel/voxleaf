# Eight revalidated findings: minimal corrections

## Goal

Resolve EFC-01 through EFC-08 with the smallest changes that establish their
specific invariants. This is a cross-milestone bug-fix plan, not a refactor,
new-model integration, broad audit or release campaign.

**Status: planning complete; implementation and implementation validation have
not started.** The 2026-10-30 request authorizes this plan, its documentation
links, a new branch and one local planning commit. It does not authorize
executing the milestones, pushing, publishing, merging or releasing anything.

Planning branch: `codex/eight-finding-minimal-corrections`. Source base:
`0bc34ec3ee8a2601fe2c529bad996081e2ae1462`. Entry worktree/index were clean.

## User-visible outcome

- Repeated navigation within one chapter does not accumulate duplicate visual
  registrations or corrupt their ordering.
- A successful explicit Chatterbox compatibility recheck leaves the obsolete
  acquisition error and exposes the appropriate next explicit action.
- Chatterbox's effective RAM requirement agrees across presentation, native
  admission and current documentation, without weakening existing start safety.
- Malformed internal paths and Python control messages fail through their
  existing bounded, content-free rejection boundaries.
- Development-only Qwen cannot declare an unproven, limit-exhausted waveform a
  completed narration segment. Historical dual-worker tooling cannot restart
  cancelled work or confuse result collection time with completion time.

The last two items do not promote Qwen or dual-worker playback to the supported
MVP. No claim is made that a private book triggered these defects or that frozen
historical benchmark results are invalid.

## Current state

Four static searches were followed by a caller/guard/history revalidation.
No tests or runtime reproductions were executed during those investigations.
Fifteen local correction-branch trees matched their integrations in `main`.
The mechanisms below predate those October correction branches; touching a
nearby responsibility did not establish that an earlier fix caused a defect.

| ID | Revalidated mechanism and scope | Historical origin / nearby correction |
| --- | --- | --- |
| EFC-01 | `active-visual-locator.ts` leaves removed elements in ordered arrays until sampling. Re-registering the same connected node before compaction makes old and new entries survive. `SemanticDocument.tsx` changes destination refs while other chapter blocks remain registered. | `6ca0ead`, 2026-07-23. RAC/#284 repaired stale callbacks, not registration uniqueness. |
| EFC-02 | `ThreadedDualWorkerRuntime.cancel()` drops active bookkeeping without cancelling/draining the submitted future. A delayed `_generate()` can enter `IsolatedBenchmarkAdapter.generate_batch()`, lazily reload after termination, and outlive the first close sweep. Historical tooling only. | `ee8383c`, 2026-07-26. VCA/#283 changed streaming deadlines in `isolation.py`, not this batch path. |
| EFC-03 | `next_completion()` timestamps collection, after choosing among completed futures. That value feeds generation seconds, RTF and ordered waiting. Actual worker completion can precede collection and GPU tie-breaking. | `ee8383c`, 2026-07-26. RAC/SAF playback-accounting fixes left this runtime unchanged. |
| EFC-04 | Qwen's product call caps generation at 250 codec tokens but the high-level pinned API returns waveforms without an EOS/completion flag. The adapter accepts finite in-bound audio and the service emits `endOfSegment` and `completed`. Conditional on exhaustion before completion; development-only. | `a0e9a30`, PR #135, 2026-07-27, introduced the narrower cap to contain oversized output. This is an old corrective-change interaction. |
| EFC-05 | Both path validators compare the following UTF-16 unit with a surrogate range without handling end-of-string. `charCodeAt` returns `NaN`, and a terminal high surrogate passes. Real archive/XML decoding has earlier strict barriers; this is an internal-validator defect. | `868b34e`, 2026-07-21. No recent modification of these predicates. |
| EFC-06 | Renderer fresh-start matching requires `4994 + max(2048, ceil(4994 * 25 / 100)) = 7042` MiB available RAM. Native optional acquisition, snapshot disclosure and support documentation use 4096. **Confirmed policy inconsistency**, not proof that the renderer's arithmetic is wrong. | Registry/formula integration `f8d3442` and native manifest `3cf59f2`, July/August. #280 changed loaded-owner continuation, not the fresh-start formula. |
| EFC-07 | The failed incompatible-host action calls `onRecheck`, which probes hardware and resets narration recovery but never refreshes the optional client. Its returned boolean is ignored; the saved failure continues to select the same action. | `ddd3cbc`, PR #205, 2026-08-04, removed activation from this callback. #278 fixed other retry classes; #282 reconciled narration. Neither cleared this optional-client failure. |
| EFC-08 | A 5000-digit JSON integer fits the 16384-byte control bound but exceeds CPython 3.12's default integer conversion limit. `ValueError` escapes the decoder's JSONDecodeError/RecursionError handling and the service's explicit cleanup/rejection paths. Direct malformed service input, not an established normal-reader route. | `15db9fa`, 2026-07-27. MAF/#286 repaired a separate UnicodeEncodeError in semantic validation. |

The unconfirmed large `push(...blocks)` suspicion is excluded. Do not silently
add it or new audit findings to this batch.

## Scope and non-goals

### Minimal correction boundaries

**EFC-01.** Reuse existing stale-entry compaction before an absent registration
is inserted, or an equally small uniqueness-preserving correction. Maintain
source ordering and current-registration identity checks. Do not introduce a
second registry, change React keys, recreate the tracker on navigation or add
an unconditional full-array scan to every append. Avoid quadratic chapter
teardown. Test at least three mounted blocks so the empty-map reset cannot hide
the defect; the public `registrationCount` alone does not measure duplicates.

**EFC-02/03.** Keep the existing executor, role limits and isolated adapters.
Invalidate work before cancellation; cancel queued futures and retain ownership
of started work until it is drained/contained. Prevent a cancelled submission
from triggering lazy model reload. If needed, add one private adapter option
for already-loaded batch work; preserve lazy loading for other callers. Never
hold a lifecycle lock over blocking inference such that cancellation waits for
the full generation deadline. Final cleanup must cover workers that were in a
startup handoff, and a second `close()` must be safe. Do not hide cleanup failure.

Capture completion time inside the worker on success and failure and carry it
in private work/result metadata. Retain the existing GPU tie-break for equally
available results without replacing their actual timestamps. Keep public
benchmark schemas, source order, no-retry policy and frozen result files intact.

**EFC-04.** Preserve the 250-token generation cap, 480000-sample transport bound,
sampling configuration, identities and explicit recovery. Fail through the
existing `EngineFailure` boundary when completion cannot be established; do
not send successful segment completion or advance its source range.

Before selecting the guard, inspect the pinned qwen-tts 0.1.1 code and establish
the relationship among generation steps, prefill, codec tokens and decoded
length. Its `model.generate()` strips EOS and `generate_custom_voice()` returns
only decoded audio; **do not assume that exhaustion always yields exactly
480000 samples**. Prefer a conservative adapter-local exhaustion guard only if
that mapping is demonstrated. Otherwise capture completion through the
smallest existing model-call seam before the flag is discarded. No installed
SDK patch, dependency update, generic adapter redesign or altered public
`EngineResult` contract. Record the chosen seam and ambiguity policy before
editing; an unprovable heuristic blocks EFC-04 acceptance rather than silently
accepting truncated audio. Complete short output remains accepted; ambiguous
boundary output may fail closed with the existing content-free failure.

This plan scopes the requested correction to development adapter correctness.
It does not reopen ADR-0051's unrelated post-seek failure, quality portfolio or
support promotion. Deterministic pinned-API doubles establish this boundary;
real Qwen inference is not selected unless that boundary cannot be proved.

**EFC-05.** Add the missing following-unit/end-of-string check in both existing
validators. Preserve valid surrogate pairs, path canonicalization, error codes,
budgets and strict archive/XML decoding. No Unicode utility extraction or
normalization/narration change is needed.

**EFC-06: proposed policy resolution, not enacted by this planning commit.**
Preserve the existing effective renderer fresh-start requirement of **7042 MiB**.
Apply that effective requirement to native select/download admission and the
existing snapshot's disclosed available-RAM requirement. Calculate it from the
existing measured peak and reserve, bounded below by the manifest's minimum;
avoid unexplained copies of a new magic threshold. Keep the implementation local
to the current optional-profile owner, with a cross-layer parity assertion
against renderer authority rather than a new configuration framework.

The immutable v7 acquisition manifest's 4096 MiB remains a package-declared
floor; it must not be rewritten as if republished. Document the stronger current
application policy separately, using one additive ADR and updates to the current
support matrix/relevant requirements. Snapshot field names, IPC schemas, total
RAM, CPU/CUDA/VRAM/storage gates and ADR-0065's healthy-loaded-owner continuation
stay unchanged. Never apply continuation allowances to downloads/new starts.
If source inspection shows this cannot be represented without altering a frozen
artifact or public contract, revise this bounded design before implementation;
do not lower the renderer requirement merely to make the numbers agree.

**EFC-07.** After an explicit compatibility check succeeds, reconcile the optional
client through its existing refresh/select responsibilities. Prefer refreshing
the native snapshot to expose absent/confirming/installed state and leave
activation/download as explicit actions. Await and identity-guard the result;
preserve newer select/cancel/remove actions and SFA-06 action/poll ordering.
Continued incompatibility or probe failure retains actionable failure. Do not
globally clear manager failures, remove packages or automatically start speech.

**EFC-08.** Translate the relevant `json.loads` conversion `ValueError` at the
decoder boundary into the existing malformed-JSON `ProtocolFailure`. Preserve
specific `ProtocolFailure` handling and do not add a broad service-loop catch
that masks arbitrary programming errors. Verify loaded-service rejection and
cleanup plus valid numeric/Unicode controls and existing size limits.

This correction covers mutable service source and the regenerated Piper core
that consumes it. Published Chatterbox v7 uses frozen v3 service sources: do not
edit/repackage those bytes or claim their direct-input decoder was patched.
Ordinary native transport already bounds/validates its controls. A separately
versioned optional-runtime refresh, if desired, is outside this finding's stated
mutable-service scope and this minimal batch.

### Non-goals

No refactor campaign, production dependency, schema/version change, model
download, public release, acquisition-network experiment, user-library mutation,
installer/uninstaller journey, broad GPU benchmark, all-speed/listening matrix,
or remeasurement/rewrite of frozen historical evidence. Preserve unrelated work.

## Relevant files and documentation

| Unit | Intended production owners | Regression/support owners |
| --- | --- | --- |
| Reader (01) | `apps/desktop/src/reader/active-visual-locator.ts` | Its test; `SemanticDocument.test.tsx`, `ReaderPublication.test.tsx`; existing reflow browser spec. Read callers rather than changing them by default. |
| Historical runtime (02/03) | `services/tts/benchmarks/dual_worker_runtime.py`; `isolation.py` only if its loaded-call boundary requires it | Existing dual-worker/controller/CLI/result and isolation tests. A small `test_benchmark_dual_worker_runtime.py` is allowed if concrete-runtime tests do not fit the existing file. |
| Development Qwen (04) | `services/tts/src/voxleaf_tts/adapters/qwen.py` | `services/tts/tests/test_qwen_adapter.py`; service failure controls and pinned SDK source inspection. |
| Paths (05) | `packages/epub/src/paths/{archive-path,ocf-reference}.ts` | Their tests and `src/integration/ingestion-matrix.test.ts`. |
| Admission/recovery (06/07) | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`; `apps/desktop/src/settings/ReaderSettingsDialog.tsx`; `apps/desktop/src/tts/OptionalChatterboxControls.tsx` and `optional-chatterbox-client.ts` only as needed for recovery or fallback disclosure | Native optional/host-profile tests; renderer matcher/compatibility/client/settings tests; `hardware-profile-matcher.ts`/registry/authority remain sources to preserve unless a necessary narrow correction is proved. |
| Protocol (08) | `services/tts/src/voxleaf_tts/protocol.py` | `test_protocol.py`, `test_service.py`, `test_contract_conformance.py`, `test_release_core.py`; service loop need not change. |

Generator-owned deliverables after EFC-08: current
`services/tts/release/core/runtime-manifest-v1.json` and
`core-package-evidence-v1.json`. Verify the release inventory, but regenerate it
only if its existing checker identifies a consumed change. Never manually edit
generated manifests, freeze new hashes over an old package, or modify locks.

Required authorities: [MVP](../../product/mvp.md),
[overview](../../architecture/overview.md),
[canonical diagram](../../architecture/system-diagram.md),
[capacity policy](../../architecture/hardware-profile-recovery-authority-v1.md),
[support matrix](../../architecture/tts-support-matrix-v2.md),
[historical v5](../../architecture/tts-feasibility-profile-v5.md),
[ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md),
[ADR-0044](../../architecture/decisions/ADR-0044-use-measured-capacity-for-chatterbox-vram-admission.md),
[ADR-0051](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md),
[ADR-0065](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md),
[testing](../../development/testing.md),
[evidence retention](../../development/evidence-retention.md) and
[independent change review](../../development/agentic-change-review.md).

## Architecture and constraints

Keep the same reader, preparation, native supervision, isolated inference and
memory-only playback owners. EPUB text/audio remain local and absent from logs.
No new process, persistence owner, network path, queue or automatic retry.
Use synthetic repository-authored fixtures only. Cancellation and teardown must
be observable and bounded; no sleep-based race test or model-dependent timing.

The canonical diagram's topology remains applicable. Review it at closeout and
change it only if actual boundaries/data flow changed. EFC-05 does not modify
the implemented M005 narration-preparation boundary; do not rewrite its completed
plan. A correction that expands into normalization/segmentation requires first
reading M005 and replanning that responsibility.

## Milestones

### M0: Freeze decisions and selected checks

**Status: not started; requires implementation authorization.** Recheck HEAD,
worktree, tools and original receipt availability. Freeze exact mutable paths,
EFC-04 exhaustion mechanism and EFC-06 policy implementation. Map each selected
test to its assertion and transitive inputs. Record `EJECUTAR`, `REUTILIZAR con
prueba`, `NO APLICA` or `BLOQUEADO` for every gate. Existing evidence supplies
baseline context; do not repeat a whole-repository baseline.

### M1: Add discriminating regressions, then make the bounded corrections

**Status: not started.** Group new failing cases by runtime rather than running
one full suite per finding. Use names containing `EFC-` (Vitest) or `efc_`
(pytest/Rust) for directed red execution on unmodified production owners.
Preserve each intended failure; repair fixture/environment faults separately.

| IDs | Minimum discriminating assertions |
| --- | --- |
| 01 | Same DOM node unregister/register before the queued sample, with other registered nodes; destination A/B switches repeated without array/measurement growth; correct visual order; empty-map, detach and close controls. One mounted caller case proves ref churn, not merely direct class calls. |
| 02 | Controlled pending and already-entered future cancelled before lazy load; startup/close overlap; no later reload/spawn/publication, bounded drain and no live child after close; repeated close. Use deterministic barriers and a benign isolated child for the lifecycle integration. |
| 03 | Injected monotonic clock; both futures complete before collection, reverse worker order and delayed collection. Recorded finish times remain unchanged, RTF/ordered waiting use them, and failure timing/GPU tie-break still work. |
| 04 | Pinned-API-faithful exhausted output without EOS, successful shorter completion, ambiguous boundary and existing finite/over-limit controls; rejected work emits no successful end-of-segment/completed record and releases retained output. Cover the prefill/token accounting, not just a fabricated 480000-sample return. |
| 05 | Terminal high surrogate in both APIs rejects; lone low/interior high still reject; valid astral pair and ordinary path/fragment still succeed; strict raw-byte/public-ingestion controls remain unchanged. |
| 06 | Same synthetic host at 4095, 4096, 7041 and 7042 MiB; renderer/native/disclosed effective policy agrees. Unknown RAM, other gates, unchanged Piper and same-profile loaded continuation controls remain intact. Frozen manifest still validates unchanged. |
| 07 | Native select/download preflight error leaves cached client failed; resources recover; mounted Settings Recheck clears the obsolete failure and offers the appropriate next action. No automatic download/activation; persistent incompatibility and a superseding action remain safe. |
| 08 | A 5000-digit integer below the frame-size cap rejects with the existing reason; the loaded service cleans up and emits content-free protocol rejection. Valid ordinary integer/astral and over-limit framing controls remain. |

Run the relevant directed red filters once per group; then implement only the
necessary owners. One final combined affected-set run below establishes green.
Do not manufacture a red result if source inspection disproves a case: record
the counterexample and resolve its disposition without silently removing scope.

### M2: Validate final source and regenerate only the invalidated artifact

**Status: not started.** Run fast affected lint/types before package preparation.
Run final selected deterministic gates once after their last relevant edit.
EFC-08 invalidates the assembled Piper core: reuse verified downloads/voices,
then run `package:piper-core:write-manifest` once, including its built-in ES/EN
offline smokes, followed by `package:piper-core:check`. Do not precede it with a
duplicate `package:piper-core` build. Freeze generator output before native
acceptance. Run one selected browser invocation and one final native smoke/build.

### M3: Independent acceptance and documentary closeout

**Status: not started.** After source writing stops, delegate the exact patch,
requirements, input identities and host receipts to one `change_reviewer`
(GPT-6 Astra high), following the existing workflow. The reviewer neither edits
nor runs tests. Resolve concrete findings and obtain a new immutable APPROVE for
the actual final patch; missing evidence/reviewer is blocked acceptance.

Update current behavior/testing documentation and the one RAM-policy ADR. Save
concise receipts under `docs/plans/evidence/eight-finding-minimal-corrections/`
and raw captures only in ignored `tmp/evidence/eight-finding-minimal-corrections/`.
Recheck identities, cleanup, current documentation links and scope. All eight
findings need an explicit final disposition; seven completed items do not close
the batch. Archive only after acceptance. Further Git/publication actions require
their own authorization; this planning commit does not grant it.

## Testing and benchmark strategy

### Previously executed evidence inspected during planning

These are historical host results, **not executions or accepted result reuse in
this planning task**. Reports were checked against available local receipts.

| Evidence | Recorded result | Reuse disposition for this plan |
| --- | --- | --- |
| [SFA ledger](../evidence/six-finding-audit-corrections/execution-ledger.md), [SFA-R2](../evidence/six-finding-audit-corrections/review-R2.md), source HEAD `200144dd29709536b189cb593fe53e927a991dc4` | 242 selected EPUB, 186 desktop, 40 playback and 31 evidence-guard tests; two browser scenarios and rebuilt model-free native smoke passed. R2 accepted documentary-only retention. | EFC changes invalidate relevant path/reader/settings/browser/native results. Preserve their fixtures/controls. Unchanged playback/guard results are only conditional candidates if a corresponding obligation arises; otherwise those suites are `NO APLICA`. |
| SFA `G8-guard-tests-result.json`, `G5R-playback-result.json`, `G5-desktop-result.json`, `G7-native-result.json` | Readable receipts record exit 0, normal local PowerShell and respectively 7.87 s, 2.51 s, 4.65 s and 46.65 s. | Cheap affected execution is preferable to a longer incomplete reuse investigation. Times are historical, not a promised speedup. |
| [MAF ledger](../evidence/minimal-audit-findings-corrections/execution-ledger.md), `F-Python-01`, `F-Core-01`, `F-Rust-01`, `F-TS-01` | Python 806; Rust 148/147 with seven ignores per variant; shared 210, EPUB 749, desktop 984, Node 151 passed. Core regenerated once with both offline voices. | Baseline/context only. New protocol/Qwen/runtime/native-policy changes invalidate consumed inputs; select affected files/modules instead of repeating all these suites. Old core package PASS cannot validate the modified protocol. |
| [VCA ledger](../evidence/verified-chat-audit-corrections/execution-ledger.md), [RAC ledger](../evidence/revalidated-audit-corrections/execution-ledger.md) | VCA's final Python 735 and Rust 141/140 passed; RAC records reader callback and historical bookkeeping regressions. | Useful existing controls and provenance, not evidence that the eight newly identified scenarios were covered. Do not renew old report hashes. |
| [SFA CI follow-up](../evidence/six-finding-audit-corrections/ci-follow-up.md), [review](../evidence/six-finding-audit-corrections/review-CI-R1.md) | Retains initial WebDriver failure, successful unchanged-source retry, then Windows loopback WouldBlock failure. Test-only correction: optional native module 59 passed/two ignored in each feature mode. | Preserve the corrected blocking-socket fixture. Coordinator-attributed tool outputs lack independently retrievable raw receipts in that report; do not use them as cross-task result-reuse proof or claim current hosted CI is green. |

Planning verified the SFA R2 manifest hash:
`836b75f3c0bfbc8a8da6676e25748107c15177facfc7f0cb3d5119101fa48456`.
It also compared eight selected current files with SFA G8's original snapshot:
guard source/test, root package/lock, `.nvmrc`, `.gitattributes` and the two
playback production owners all match. **This is partial input equality only**,
not complete dependency/discovery/tool/environment equivalence. SFA explicitly
declined older MAF result reuse for missing proof; do not reverse that conclusion
using these eight hashes. No historical runtime result is pre-approved here.

### Reuse rules and ways to avoid unnecessary execution

Apply the [evidence-reuse proof](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md#revalidate-changed-evidence-not-everything-by-default)
without importing refactor-specific per-unit baselines/agents/commits.

- **REUTILIZAR con prueba:** existing source archives, Piper voices, model assets,
  cached pinned tools and matching driver, after their existing manifest/lock
  verification. Artifact reuse is not a retained runtime PASS. Do not reacquire
  models or update environments to perform these corrections.
- **Conditional result reuse:** original immutable receipt and gate-time input
  closure must match current transitive source, fixtures/discovery, config/locks,
  installed tools, generated artifacts and relevant host conditions. New files
  or Git/version-stamping inputs can invalidate discovery. The independent change
  reviewer records the current comparison; missing proof selects the smallest
  affected rerun, not speculative blanket reuse.
- **NO APLICA by default:** unrelated shared/Node suites, full Python/Rust/desktop
  suites, aggregate `check`/`check:portable`, isolated evidence-guard tests when
  the guard is unchanged, full reader performance matrix, Qwen/GPU/listening/speed
  portfolios, historical real dual-worker benchmarks, network acquisition,
  Chatterbox repackaging, firewall and installer lifecycle. No PASS is claimed
  for omitted gates. Required CI checks remain required if later publishing.
- Retain same-task gates only across changes outside their proven consumed
  closure. A fresh whole-suite baseline, per-finding full suites, a duplicate
  frontend build already performed by a selected wrapper, and repeat-until-green
  runs are not part of this plan. New failures or expanded responsibilities can
  justify additional gates; record that justification first.

### Selected command matrix

Run every command from normal local PowerShell **outside the managed sandbox**.
Repository-root cwd applies unless the command selects a package. Commands use
existing scripts or their configured Vitest/pytest/Cargo leaf with explicit
selection; no new script alias is required. Exact selections are frozen in M0.

| Gate | Decision, invariant and timing | Existing command / bounded selection |
| --- | --- | --- |
| G0 | EJECUTAR: inspect pinned tools, source/receipt identity and artifact prerequisites; no full baseline. Build package prerequisites before directed tests only if missing/stale; always refresh them after final EPUB edits before desktop acceptance. | `pnpm.cmd build:packages` when required; existing manifest/hash checks. Retain pnpm 11.15.1 via the existing Corepack shim if PATH differs; no tool install. |
| G1 | EJECUTAR: new directed red cases before production edits, one selected invocation per runtime group. | The G3/G4/G5 Vitest/pytest leaf with `-t EFC-` / `-k efc_`; relevant Cargo filter `efc_` in both feature modes. Preserve failures as expected-red, not acceptance failures hidden by retries. |
| G2 | EJECUTAR: current fast format/lint/types on final touched responsibility set, before costly packaging. | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/epub typecheck` and `pnpm.cmd --filter @voxleaf/desktop typecheck` after `build:packages`; `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`; `pnpm.cmd format:check:rust`. `pnpm.cmd lint:rust` once after final native/generated inputs are frozen. |
| G3 | EJECUTAR: internal malformed-path boundaries plus unchanged public ingestion. One final unfiltered selected-file run. | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/paths/archive-path.test.ts src/paths/ocf-reference.test.ts src/integration/ingestion-matrix.test.ts` |
| G4 | EJECUTAR: real mounted registration/recheck and matched fresh/continuing admission; preserve action/poll controls. One final selected-file run. | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/active-visual-locator.test.ts src/reader/SemanticDocument.test.tsx src/reader/ReaderPublication.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/hardware-profile-matcher.test.ts src/tts/hardware-profile-compatibility.test.ts` |
| G5 | EJECUTAR: concrete threaded runtime, benign child containment, timestamp consumers, Qwen completion, closed protocol/service cleanup and packaging contracts. One final selected-file run. | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_dual_worker.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_cli.py services/tts/tests/test_benchmark_dual_worker_result_cli.py services/tts/tests/test_qwen_adapter.py services/tts/tests/test_protocol.py services/tts/tests/test_service.py services/tts/tests/test_contract_conformance.py services/tts/tests/test_release_core.py` Add the explicitly allowed concrete-runtime test file if created. |
| G6 | EJECUTAR: regenerate the protocol-consuming Piper artifact once; fresh offline ES/EN smokes are included. Preserve optional frozen artifacts. | `pnpm.cmd package:piper-core:write-manifest`, then `pnpm.cmd package:piper-core:check`; `pnpm.cmd inventory:release:check`. Record generator output hashes. No separate preceding core build or duplicate voice smoke. |
| G7 | EJECUTAR: effective native requirement, snapshots and select/download preflight under both configurations. One final module run per module/variant after G6. | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml host_profile_detection::tests::`; `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests::`; repeat each with `--features release-locked-runtime`. Preserve ignored exact-host cases as ignored. |
| G8 | EJECUTAR: one browser invocation for EFC-01 mounted ref churn and EFC-07 recovery with controlled native responses, plus the existing canonical-passage restoration control. | `pnpm.cmd test:browser reader-reflow-restoration.smoke.spec.ts reader-narration-bugfixes.smoke.spec.ts --grep "EFC-\|preserves one canonical passage"` Keep configured package/frontend hooks. No live download or model. |
| G9 | EJECUTAR: one final native build and model-free WebView2/protocol/reader smoke after G6/current frontend. Old executable embeds different inputs. | `pnpm.cmd test:native-startup`. Use existing matching driver and the runner's owned-process/scratch cleanup. Do not also run a separate identical native build first. |
| G10 | EJECUTAR: inspect current documentation/index/scope, freeze final identities and perform exact-patch independent review. | `pnpm.cmd check:evidence`; `git diff --check`; inspect local link targets and changed/staged allowlist. Guard tests are not a substitute for checking current documents. |

G3-G5 can run before G6 when they consume source/synthetic artifacts only. If a
selected test consumes the generated core, schedule that case after G6 instead
of running it against stale artifacts and repeating the whole suite. G7/G9 must
see final core/native identities. A package/runtime/schema change beyond the
listed owners invalidates these exclusions and requires a revised affected-set
map, not a silently broader execution campaign.

EFC-06 changes admission policy, not hardware probing or inference. Synthetic
exact-boundary native/renderer tests plus current native integration discriminate
it; no real Chatterbox synthesis is selected for this arithmetic/disclosure fix.
If implementation instead changes launch/loading/bootstrap/ownership, add the
existing `pnpm.cmd test:chatterbox:v7:native-startup` gate once after verified
assets, and state why. Likewise, an unprovable Qwen seam remains explicitly
blocked pending a separately defined bounded check; no full portfolio by default.

## Risks and rollback

- EFC-01 can exchange a leak for quadratic work. Preserve append/teardown bounds
  and use counted measurements plus the existing large-chapter controls. Run the
  existing reader benchmark only if traversal/batching complexity changes.
- EFC-02 can deadlock cancellation or lose an in-flight child. Use barriers,
  bounded waits, cleanup in failure paths and actual benign process ownership;
  never accept a fake-only lifecycle result.
- EFC-04's decoded duration is not an EOS flag. An incorrect exact-cap heuristic
  is a failed design; preserve the bounded service and report a blocked item.
- EFC-06 deliberately preserves the stronger existing start gate. Do not update
  a frozen manifest, rewrite historical requirements or weaken continuation
  identity controls. Current policy disclosure requires its additive ADR.
- Reuse proof can cost more than a cheap targeted rerun. Stop the proof effort
  when original identities are missing; select the smallest authoritative leaf.
- Preserve failed receipts and classify product, fixture, environment and cleanup
  failures separately. Permit one infrastructure retry only with a concrete
  changed condition. Repeated failure stops that stage for diagnosis/replanning.
- Rollback means reverting only this batch's owned changes after checking later
  work, including generator-produced core identities as a coherent set. Do not
  mix old manifests with new package bytes or discard user data. No destructive
  rollback/Git action is authorized by this document alone.

## Progress log

- 2026-10-30: Revalidated eight findings against source/callers and historical
  changes; recorded the RAM policy correction and restricted scopes. No tests.
- 2026-10-30: Inspected previous SFA/MAF/VCA/RAC plans/reports and selected raw
  receipts, verified the SFA R2 manifest and eight partial input matches. No
  current runtime acceptance or complete result-reuse proof is claimed.
- 2026-10-30: Created `codex/eight-finding-minimal-corrections` from the clean
  source base. Authored this plan and documentation links only. M0-M3 pending.
- 2026-10-30: Planning-only checks passed in normal local PowerShell outside
  the managed sandbox: evidence retention, whitespace and 218 local link targets.
  No runtime tests or implementation gates ran.

## Discoveries and decisions

- Recent similarly named audit fixes are not evidence of causation. The eight
  mechanisms predate the inspected October branches; Qwen's cap does trace to
  an older July correction, and the Recheck callback changed in August.
- All eight remain explicit scope. EFC-06 is a policy disagreement; this plan
  proposes preserving 7042 MiB rather than silently treating 4096 as sufficient.
- Scope exclusions and artifact reuse provide the principal test reduction.
  Historical green summaries alone cannot approve new code. Small selected
  suites are preferable to constructing incomplete cross-task reuse claims.
- Piper embeds the mutable protocol, so that artifact must be regenerated once.
  Qwen and historical benchmarks are excluded from the Piper runtime payload;
  optional Chatterbox's frozen service closure is not a live-source copy.
- No topology change is proposed. The canonical diagram and roadmap retain
  current implementation/support status; this plan adds no completed feature.

## Final validation results

**Implementation: NOT STARTED.** No production/test files changed, no new
regression or acceptance gate executed, no runtime result accepted for reuse,
no package/model acquisition or regeneration, and no deployment/publication.

Planning-only validation, 2026-10-30, normal local PowerShell outside the managed
sandbox:

- `pnpm.cmd check:evidence`: PASS; evidence retention check passed.
- `git diff --check`: PASS.
- Local Markdown-target inspection for the three planning documents: 218
  targets resolved; no trailing-whitespace findings.
- Runtime tests executed: zero. Historical results remain historical, with no
  new runtime acceptance or result reuse claimed.

The requested local planning commit must contain only this file,
`docs/plans/active/README.md` and `docs/README.md`. Planning review/commit does
not constitute future exact-patch `change_reviewer` approval.
