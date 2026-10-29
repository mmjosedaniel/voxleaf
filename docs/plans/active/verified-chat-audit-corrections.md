# Verified chat audit corrections

## Goal

Correct the nine statically validated findings from the four-pass chat audit
with the smallest changes to their existing owners. Preserve the current
product, contracts, model/runtime versions and accepted authorities. Minimize
validation by reusing fixtures and proven unchanged evidence, grouping coupled
regressions, and running combined acceptance once after the final relevant edit.

This is a planning-only document. Implementation, reproduction, tests, lint,
type checks, builds, model execution and host mutations have not started.
The user authorized creation of this plan, its branch and a documentation
commit; implementation and later Git publication require separate authorization.

## User-visible outcome

- Interrupting recovery through Settings leaves narration able to start again
  through an explicit action after successful containment.
- Replacing a book cannot race its narrator against the previous service owner.
- Navigation while paused reports truthful empty preparation state and places
  an interior passage at its actual text offset, while remaining paused.
- A failed compatibility probe preserves the selected language and existing
  unsupported-preference protections in the interface.
- Optional-package removal reports unresolved owned entries rather than success.
- Benchmark RAM failures, request deadlines and outer-watchdog cleanup produce
  trustworthy failure results without requiring real models to test them.

## Current state

Planning base: `main@ab6a609326d4169990207496d1693608e05b285f`, initially clean.
Planning branch: `codex/verified-chat-audit-corrections`.
This cross-milestone correction spans M006 tooling, M009 synchronization,
M010 recovery/settings and M011 optional-package ownership, so it intentionally
uses a descriptive filename under `.agents/PLANS.md`.

The audit and subsequent independent static verification found these defects.
IDs below are local to this plan; similarly numbered findings in older plans
refer to different work. Static validation establishes source paths and trigger
conditions, not observed reproduction frequency or affected historical results.

| ID / original chat finding | Existing cause and reachable consequence | Priority |
| --- | --- | --- |
| VCA-01 / 1 | Settings interrupts `recover()` before preparation completes. Cleanup invalidates its run and removes player/scheduler, but leaves `recovering`; `resetEpisode()` rejects that phase. Start/retry remain blocked for this coordinator. | P2 |
| VCA-02 / 2 | `remove_contained_directory()` treats `exists() == false` as absence before inspecting metadata. Dangling entries and some inspection errors can survive successful removal. Active v7, old v3/v2/legacy, cache and staging reach this helper; v5/v6 and `.previous` already have stronger presence checks. | P2 |
| VCA-03 / 3 | Windows `OpenProcess`/`GetProcessMemoryInfo` failures become zero bytes, bypassing sampling-failed handling and potentially understating RAM. No historical measurement is declared corrupt merely from this finding. | P2 |
| VCA-04 / 4 | Compatibility-probe rejection retains language only if it changed during that probe, otherwise substitutes English and resets persistence flags. Existing storage writers still protect future-version records. | P3 |
| VCA-05 / 5 | `App` starts old narration close and replacement EPUB open concurrently; a fresh coordinator/client can request the shared native supervisor before old containment finishes and receive busy/invalid-state. Timing-dependent race. | P2 |
| VCA-06 / 6 | Paused navigation spreads the previous UI snapshot after releasing its audio/preparation owners. Loaded duration and preparation indicators can describe obsolete work. This is not evidence of stale PCM playback. | P2 |
| VCA-07 / 7 | Each generation `next()` renews the full timeout; warm/sustained elapsed checks occur after a chunk arrives and cancellation preparation has no aggregate deadline. A request can exceed 120 seconds. Output caps and the 7,200-second outer watchdog still exist. | P2 |
| VCA-08 / 8 | The outer CLI watchdog terminates `_measure-worker` without ensuring descendant containment. A model child computing synchronously can outlive it; normal adapter cleanup cannot be relied on after forced parent exit. | P2 |
| VCA-09 / 9 | Reader placement scrolls the containing block to its start and immediately settles an exact locator. A paused next/previous target far inside a multi-screen paragraph can remain offscreen. | P2 |

Chat finding 10 (`located.push(...blocks)` in EPUB indexing) is excluded. Its
large argument expansion is real, but failure on the supported WebView2/V8
before the processing deadline was not demonstrated. Do not quietly fix it,
expand ingestion limits, or add a stress campaign as part of these nine fixes.

## Scope and non-goals

Implement three cohesive groups, held pending until combined acceptance:

1. Desktop state and placement: VCA-01/04/05/06/09. Coordinate shared edits to
   the narration owner and reader; avoid repeated independent rewrites.
2. Native owned-path removal: VCA-02.
3. Benchmark measurement and process ownership: VCA-03/07/08.

No general refactor, new production dependency, model/voice integration,
normalization/segmentation change, public schema/IPC change, buffer-policy
change, installer redesign or benchmark-result regeneration. Do not edit
generated sources, frozen authorities/corpora, historical receipts or completed
plans. No real user installation/data removal, download, firewall mutation or
model rebuild is authorized by this planning task.

The planning commit owns exactly this file and `docs/plans/active/README.md`.
Future implementation may change only the owners/tests described below plus
directly necessary maintained documentation. Record a concrete reason and
validation impact before adding another owner; an exploratory possibility is
not an allowlist for broad changes.

## Relevant files and documentation

| Group | Production owners | Existing regression homes |
| --- | --- | --- |
| Recovery / replacement / paused state | `apps/desktop/src/App.tsx`, `apps/desktop/src/tts/product-narration-coordinator.ts`, `apps/desktop/src/tts/operational-recovery.ts`; use `settings/narration-settings-actions.ts` only if caller coordination needs it | `App.test.tsx`, `tts/product-narration-coordinator.test.ts`, `tts/operational-recovery.test.ts`, `settings/narration-settings-actions.test.ts`, `tts/ProductNarrationControls.test.tsx` |
| Compatibility failure | `apps/desktop/src/tts/hardware-profile-compatibility.ts` | `tts/hardware-profile-compatibility.test.ts`, `tts/HardwareCompatibilityControls.test.tsx` |
| Exact reader placement | `apps/desktop/src/reader/ReaderPublication.tsx`; reuse `reader-reflow-restoration.ts` / `semantic-dom-range-mapper.ts` through their existing boundaries if possible | `reader/ReaderPublication.test.tsx`, `reader/reader-reflow-restoration.test.ts` only if that owner changes; existing `tests/browser/reader-narration-bugfixes.smoke.spec.ts` |
| Optional removal | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` | `apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs` |
| Benchmark correctness | `services/tts/benchmarks/memory.py`, `isolation.py`, `harness.py`, `cli.py` | `services/tts/tests/test_benchmark_memory.py`, `test_benchmark_isolation.py`, `test_benchmark_harness.py`, `test_benchmark_cli.py`; extend existing `benchmarks/process_fake.py` only when a spawn-safe fixture needs it |

Test paths abbreviated in the desktop column are relative to
`apps/desktop/src/`, except the browser spec under `apps/desktop/`.
Inspect process-client/supervisor and persistence callers as dependencies; do
not change those production modules merely to make a test easier. Reuse an
existing safe process-tree owner where its actual guarantees match VCA-08.

Authorities and contributor guidance:

- [MVP](../../product/mvp.md), [Settings/playback](../../product/reader-settings-and-playback-controls.md).
- [System diagram](../../architecture/system-diagram.md), [overview](../../architecture/overview.md).
- [Synchronization authority](../../architecture/synchronization-authority-v1.md),
  [ADR-0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
  [ADR-0023 recovery](../../architecture/decisions/ADR-0023-final-m010-support-and-recovery.md).
- [Benchmark timeouts](../../architecture/tts-feasibility-profile-v1.md),
  [current support matrix](../../architecture/tts-support-matrix-v2.md).
- [Testing](../../development/testing.md), [evidence retention](../../development/evidence-retention.md),
  [independent change review](../../development/agentic-change-review.md).
- [Validation reuse policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md).
  Apply its input-equality, gate-selection and retry principles. This is a
  behavioral fix plan, not a refactor campaign; its auditor/worker/validator
  machinery is not an additional required workflow.

## Architecture and constraints

Retain local-only EPUB/TTS, memory-only generated audio, bounded queues, one
service tree, identity-first invalidation and explicit recovery without
automatic replay/failover. Pause may continue bounded same-session preparation;
navigation invalidates obsolete work. Preserve stable locator, heard-position
persistence, focus/selection and passive-scroll semantics.

VCA-05 needs a bounded ownership handoff, not a fixed startup delay or a second
supervisor. Failure to contain the old owner must block the new start visibly.
VCA-08 may terminate only the exact owned worker tree; a recycled PID alone is
not authority. VCA-02 must distinguish absence from inspection failure without
following or deleting suspect reparse targets.

No topology or public-contract change is expected. Review the canonical diagram
at closeout; update it only if the implemented boundaries actually change.
M005 text preparation and its roadmap status remain outside the change. If a
proposed solution reaches that boundary, stop that expansion and replan after
reading its completed authority. Update maintained testing/behavior guidance
only for changes actually delivered; add an ADR only for a new durable decision.

## Milestones

### M0 — Freeze scope and economical validation

Status: planning complete; execution preparation pending.

Before production edits, inspect clean/changed paths, capture baseline HEAD,
complete test/source/config membership and tool/host identities outside the
sandbox. Map new assertions to the existing cases; preserve relevant old tests.
Inspect the historical receipts in the next section before claiming reuse.
Record gate dispositions as RUN, REUSE-with-proof, NOT-APPLICABLE or BLOCKED.
No broad baseline run is required merely to reproduce an old PASS: new focused
regressions must fail for the intended reason before their production fix.

### M1 — Desktop state and placement corrections

Status: not started.

- **VCA-01:** explicitly settle an interrupted recovery only after successful
  containment, permitting a new explicit episode/action. Reject late completion
  from the old run. Do not simply allow `resetEpisode()` during live recovery or
  reset its retry budget on every stop. Test language/profile interruption,
  late success/failure, successful explicit restart, and failed-cleanup blocking.
- **VCA-04:** preserve the last known language and future-version protections
  across rejected probes, including a selection made during the probe. Keep
  availability conservative when hardware facts are unavailable. Test restored
  Spanish, prior explicit selection, overlapping probes, future-version flags
  and a successful later recheck. No storage migration is needed.
- **VCA-05:** connect new narration eligibility to completion of the previous
  owner close/containment, across rapid A-to-B-to-C book replacement and failure.
  File reading may remain concurrent; new playback cannot overtake cleanup.
  Use deferred fake teardown and the real client/supervisor contract, not timing
  sleeps. Cover late/stale close completion, close rejection and explicit Play.
- **VCA-06:** construct paused-after-navigation presentation from current empty
  ownership; preserve paused intent, applicable user volume/rate preferences and
  the new target. Reset obsolete loaded duration, preparation/progress/estimate,
  all-ready/memory indicators and unusable actions. Resume creates fresh work.
  Assert observable controls and zero retained audio, not a copied object shape.
- **VCA-09:** use existing code-point DOM-range placement for interior targets.
  Hold passive sampling until the target settles and resume without immediately
  replacing it with a block-start sample. Preserve focus policy, same/cross-
  chapter and incremental materialization, cancellation and unavailable geometry
  handling. Never claim exact placement merely because the block was mounted.
  Test both directions while paused in a multi-screen paragraph, exact offsets,
  unchanged focus/selection, no automatic audio and superseded navigation.

Add the fewest browser cases needed to observe the mounted controls and actual
range geometry, extending the existing synthetic reader fixture. A jsdom
`scrollIntoView` spy cannot prove VCA-09. Reuse one final reader-spec invocation
for the coupled desktop outcomes; do not create a separate browser campaign per
finding. Keep real native handoff proof distinct from Chromium service mocks.

### M2 — Fail-closed optional removal

Status: not started.

**VCA-02:** replace the permissive presence check with the existing
`owned_path_present` semantics; retain canonical containment, reparse rejection
and error mapping. Apply the same presence rule to active/v3/v2/legacy discovery
only where required to keep unresolved installed entries discoverable. Do not
invent installation-state semantics for arbitrary cache/staging contents.

Extend `retained_v5_and_v6_dangling_links_cannot_be_reported_as_removed` across
the affected exact owned roots. Use disposable junction/symlink targets and an
outside sentinel; assert failure/no false absence, intact outside data, normal
missing-root success, regular-tree deletion and successful retry after repairing
the test-owned entry. Preserve Windows sharing-violation coverage. Metadata
access-denial coverage must use a controlled seam or an owned temporary ACL
fixture with restoration; a sharing violation is not proof of denied metadata.
Both configured Rust feature variants remain required. No personal package
removal, installer cycle or GPU is needed for this predicate change.

### M3 — Trustworthy benchmark failures and containment

Status: not started.

- **VCA-03:** propagate failed live-process memory inspection as unavailable/
  sampling failure through the existing result boundary. Distinguish proven
  process exit from denied/unknown inspection, preserve a legitimate empty
  baseline and always close opened handles. Tests mock the Windows API seam
  and exercise failure propagation to the consumer; zero must not become PASS.
- **VCA-07:** establish one monotonic deadline at generation dispatch and pass
  only remaining time to each receive. Apply it while accumulating cancellation
  trial audio; retain sustained-phase and cleanup deadlines. Cover individually
  timely chunks exceeding the total bound, a blocked later chunk, insufficient
  media progress, normal completion and no retry within an official run.
- **VCA-08:** keep termination authority with the outer measurement owner, so
  timeout, error and interruption cannot bypass descendant cleanup. Reuse an
  existing containment mechanism only after inspecting its parent-death and
  platform guarantees. Use bounded verified cleanup, preserve sanitized errors
  and normal result delivery, and never kill unrelated processes by name/PID.
  Add one short real-process regression: a synthetic measurement worker starts
  a blocked descendant, the outer deadline expires, and both verified processes
  must exit. Always retain a `finally` cleanup. Mocking a kill command or checking
  that a Python PID field is cleared is insufficient. No model/GPU or two-hour
  wait is needed; use the existing timeout injection seam or a minimal private
  seam without changing the production 7,200-second value.

Preserve frozen measurement/quality results. These changes establish future
failure handling, not retrospective validity or invalidity of older RAM/RTF
observations. Do not regenerate benchmarks to obtain new numbers for this plan.

### M4 — One combined acceptance and independent review

Status: not started.

Run the selected foundation leaves once on the final relevant sources. Their
passing regression coverage can supply the final green for M1-M3; do not add a
duplicate focused green unless an edit/failure makes it useful. Run the complete
affected reader browser spec and the bounded native smoke sequentially, using
one freshly identified final native build. Keep every group pending until its
required proof and the combined gate are resolved.

Delegate exact-patch acceptance to `change_reviewer` with identities, full diff,
scope, host receipts, reuse decisions and remaining limitations. Resolve findings
and obtain a new current APPROVE after any relevant change. A previous VAF/SAC
approval cannot approve this patch. No implementation commit/push/PR/merge is
authorized by the present documentation-commit request.

## Testing and benchmark strategy

### Evidence already inspected

The newest relevant source is [VAF execution ledger](../evidence/validated-audit-follow-up/execution-ledger.md),
with [R4 implementation approval](../evidence/validated-audit-follow-up/review-R4.md)
and [R5 archive approval](../evidence/validated-audit-follow-up/review-R5.md).
Its `review-final.md` is an older BLOCKED report, not the latest verdict.
Raw receipts and before/after snapshots remain in ignored
`tmp/evidence/validated-audit-follow-up/`. Source SHA-256 and receipt identities
are recorded in R5: manifest
`04dfd596bec0f8ae9217415c32259279f757006221acf2ed635e34cd4759478c`,
receipt map `7990d246e0d81b270f3fdade1dcc78ecc1984affd25c5908885974c2b4012394`.
These historical reports concern their own base/patch, not this plan's fixes.

| Retained receipt / historical result | Decision for this implementation |
| --- | --- |
| `F-TS-tests-01`: shared 210, EPUB 720 passed; desktop had a failure. `F-Desktop-tests-02`: 913 Vitest passed; later replaced Node leaves compose to 110 | Shared/EPUB are reuse candidates only. Desktop results need renewal after M1. Never relabel the originally failing whole command PASS. |
| `F-TS-static-01`, `TS-format-02`, `F-Desktop-build-01`: passed | M1 invalidates affected static/frontend build evidence. One current native build remains selected. |
| `B1-browser-final-03`: all 14 reader-spec cases passed | Fresh whole affected spec after edits. Earlier 13-pass plus filtered-pass composition was rejected in VAF; do not repeat that shortcut. |
| `F-Python-tests-01`: 722 passed, one cache-write warning; exit 0. `F-Python-static-01` and `F-Python-build-01`: passed | M3 invalidates the consumed Python suite/static/build closure. These are baseline references, not acceptance for corrected measurement/cleanup. |
| `F-Rust-static-tests-01`: 140 default / 139 release-locked passed, seven ignored in each | M2 invalidates it; renew both feature variants. Ignored exact-host/model cases do not become implicitly passed. |
| `N1-native-replanned-03`: model-free WebView2 smoke passed, 15.22 seconds | Changed frontend/native binary requires a new current smoke. Preserve earlier N1 failures and fixture-readiness limitations. |
| `L1-lifecycle-authorized-01`: historical authorized installer lifecycle passed, 146.54 seconds | Separate installer/harness responsibility; no full installer repeat selected for these fixes. It is not acceptance for the changed Rust helper or a newly built binary. |
| Earlier [SAC ledger](../evidence/static-audit-corrections/M3-validation-ledger.md), [R3](../evidence/static-audit-corrections/review-R3.md), including 678 Python tests | Older reference superseded for these owners by VAF's 722; do not sum them or reuse stale acceptance. |
| Frozen `benchmarks/tts/cpu-fallback-result-v6.json` quality/performance; retained Piper/Chatterbox payloads | Preserve historical observations. Model/DSP quality is outside this patch; cached assets require exact integrity before use and are not runtime PASS evidence. No remeasurement selected. |

Planning-time read-only SHA-256 comparison against VAF's
`F-TS-tests-01-after.json` found **443/443 shared/EPUB entries**, **7/7 root
TS/workspace/lock/config entries**, **13/13 selected DSP/playback entries**, and
**17/17 selected model-adapter/engine/protocol/release-profile entries** equal
to the current files, with no new tracked shared/EPUB membership. The latter
subset also matches `F-Python-tests-01-after.json`. This is partial equality
evidence, not a reusable PASS: complete consumed closure, untracked discovery,
toolchain/install metadata and relevant current host conditions remain unproved.
Model weights were not inspected. No prior runtime gate is approved for reuse
at planning time; the source equality narrows the later proof needed.

### Reuse and minimum-execution rules

1. Reuse existing synthetic fixtures and verified build/model inputs first.
   Do not reinstall dependencies, rebuild unchanged runtimes or redownload models
   without an actual missing/invalidated prerequisite.
2. A result is reusable only with its original retrievable immutable command,
   outcome and execution-time input identities, plus equality of source and
   transitive imports, tests/fixtures/discovered membership, configs/locks,
   runner/tool versions, generated artifacts and relevant environment. Include
   HEAD where stamping or Git discovery consumes it. Never create missing old
   identities retrospectively or replace hashes in an old approval.
3. Only genuinely independent leaves may carry forward in a new exact-patch
   review. Shared/EPUB are the strongest candidates; changing their inputs, test
   discovery, hooks or toolchain invalidates them. If proof is incomplete, the
   cheap fresh leaf is preferable to an expensive reuse investigation.
4. Changes to benchmark tests/harness invalidate their results even if model
   bytes match. Historical listening, frozen decisions and cached artifacts are
   distinct from a new corrected-harness measurement.
5. Run new intended-red selections before their fixes. Group coupled desktop
   cases, native cases and Python cases; no repeated whole-repository baseline.
   Use the combined final suite as final green. Later unrelated Markdown edits
   require current documentation review, not repetition of runtime gates.
6. Keep all validation in normal local PowerShell outside the managed sandbox.
   Run cheap readiness/static work before expensive preparation. Serialize
   browser and native runs; VAF recorded concurrent-layout timing failures.

### Gate matrix and exact commands

All commands below are **future**, derived from current package configuration,
existing pytest/Cargo runners and existing harnesses. Default cwd is repository
root; `--filter ... exec` executes inside the desktop package. Filter focused
tests to the actual edited group. Do not create an unlisted test command from
memory. A new fixture belongs to an existing runner unless separately justified.

| Gate / invariant | Existing command(s) | Timing, inputs and invalidation |
| --- | --- | --- |
| D1 desktop state/placement | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/App.test.tsx src/settings/narration-settings-actions.test.ts src/tts/operational-recovery.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/hardware-profile-compatibility.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/reader/ReaderPublication.test.tsx` | Intended-red new cases via `-t VCA` before each affected correction. Add reflow test file only if its owner changes. Consumes frontend imports, jsdom/Vitest, package dist/config/locks. Final green may come from F1. |
| D2 native ownership | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests::` | Focused new-regression red; actual temp-root/junction controls. Windows is required for Windows path semantics. Final default/locked green comes from F1. |
| D3 benchmark failure handling | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_memory.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_harness.py services/tts/tests/test_benchmark_cli.py` | New `-k vca` red selection. Fake clocks/API seams and one real bounded fake process tree; no models. Consumes Python imports, schemas/config/locks and OS cleanup semantics. Final green from F1. |
| F1 evidence/static | `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence`; `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd typecheck:typescript`; `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`; `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust` | Once on combined relevant sources, before expensive builds. TS typecheck builds packages. Rust lint includes both feature variants. Current Markdown/index invalidates the evidence guard; input changes invalidate their corresponding static leaves. |
| F1 behavioral suites | `pnpm.cmd test:typescript`; `pnpm.cmd test:python`; `pnpm.cmd test:rust` | Once after final relevant edits. TS includes shared/EPUB hooks, desktop Vitest and seven Node suites. Rust includes default/locked. If complete proof admits shared/EPUB reuse, record their receipts and run current desktop leaf instead; otherwise run original recursive command. |
| F1 build | `pnpm.cmd build:packages`; `pnpm.cmd build:desktop`; `pnpm.cmd build:python` | Build native once after fast green; record exact binary/frontend identities. Reuse package build output from preceding typecheck only with identical inputs/output proof. Native Tauri invokes desktop Vite; see aggregate rule below for portable coverage. |
| B1 rendered passage/state | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` | Final full affected spec, production Vite/Chromium; includes real geometry and new VCA cases. Root script builds packages. A changed shared spec invalidates the full spec result. Other browser specs run only for a concrete affected invariant. |
| N1 native integration | `node apps/desktop/scripts/native-startup-smoke.mjs` | Existing model-free runner on the single final default binary, after B1, with WebView2/driver/host readiness. Equivalent configured build-plus-run route is `pnpm.cmd test:native-startup`; do not invoke both and rebuild twice. |
| Review / closeout | Exact-patch `change_reviewer` report; source/doc/index inspection | Current identities, all selected receipts/reuse dispositions, cleanup and no unrelated changes. Missing relevant proof blocks acceptance. |

Map these leaves to the existing `pnpm.cmd check` obligation in an execution
ledger. Do not run both `check` and `check:portable` wholesale after already
executing identical leaves. Preserve Rust/native-exclusive leaves and package
pretest hooks (`generate:check` and builds). Portable's explicit
`pnpm.cmd --filter @voxleaf/desktop build` may be satisfied by Tauri's nested
Vite invocation only when exact arguments, inputs, environment and output
identity are shown equivalent; otherwise run that inexpensive leaf separately.
Deduplication must never silently discard an exclusive gate, and the report must
say which leaves ran rather than claiming an aggregate command ran. CI/protected
branch requirements remain unchanged. If equivalence cannot be established,
use the original aggregate instead of an improvised partial substitute.

N1 is general native integration, not proof of every new race. D1 must establish
the actual cleanup barrier using deferred ownership; D2 exercises the real
filesystem predicate; D3 must observe actual fake descendant exit. Extend an
existing narrow native diagnostic only if a concrete uncovered native invariant
remains, and record that scope/gate before changing it.

No full model/quality/six-rate/listening, real download, package rebuild or
installation/uninstallation campaign is selected: model adapters, DSP,
bootstrap, dependency locks and NSIS ownership policy are outside scope. If
implementation changes any of those responsibilities or the reviewer finds
deterministic/native proof insufficient, replan the affected gate rather than
claiming exemption. A helper shared with staging invalidates that helper's
behavioral evidence; the existing native synthetic acquisition/removal controls
must pass. Retained v7 acquisition replay is not automatically reusable simply
because archive bytes match.

## Risks and rollback

- Recovery resets can accidentally permit concurrent retry; preserve identity
  guards and require successful containment before new eligibility.
- A replacement barrier can outlive a stale book; revision/owner identity must
  prevent late completion from enabling a newer coordinator incorrectly.
- Exact placement can race reflow or registration. Use bounded existing
  scheduling, cancel superseded requests and retain truthful fallback outcomes.
- Fail-closed memory/path inspection can expose real unavailable states. Do not
  suppress them to preserve historical success counts or delete outside roots.
- Tree cleanup can affect unrelated processes if ownership is weak. Track an
  owned handle/job or verified process identity and require actual exit proof;
  use disposable children and scratch with reliable teardown.
- One diagnosed infrastructure retry per failed stage; preserve the original
  result, hypothesis and changed condition. A second failure requires explicit
  replanning. No repeat-until-green loop or relaxed assertion.
- Retain separate failed and passing receipts under ignored
  `tmp/evidence/verified-chat-audit-corrections/`. Commit only concise sanitized
  Markdown evidence with needed source/artifact identities; no private home
  paths, book text, audio, model weights or personal-data inventory.
- Keep the three groups separable in the diff. If a correction fails acceptance,
  revise or revert only that task-owned change after preserving evidence; never
  discard pre-existing work or rewrite completed-plan history.

## Progress log

- 2026-10-28: Revalidated nine findings on `ab6a609`; excluded engine-dependent
  indexing risk. Read repository plan/validation/testing authorities and current
  command definitions. Inspected VAF/SAC reports and retained receipts; performed
  read-only source/hash comparisons for reuse candidates. No tests executed.
- 2026-10-28: Created the dedicated planning branch and this ExecPlan with the
  active-index entry. Documentation commit is authorized; production execution
  and acceptance remain pending.
- [ ] M0 execution identity/readiness and final reuse dispositions.
- [ ] M1 desktop regressions and minimal corrections.
- [ ] M2 native removal regressions and correction.
- [ ] M3 benchmark regressions and corrections.
- [ ] M4 combined gates, exact-patch review and documentation closeout.

## Discoveries and decisions

- Static truth and runtime reproduction are separate. Conditional book-switch
  and watchdog races are included; the unproven V8 argument-limit case is not.
- Recent VAF evidence is stronger than SAC for this baseline. Existing source
  equality supports targeted reuse investigation but does not establish current
  host/toolchain equality or acceptance of future edits.
- Existing fixtures, cached build/model inputs and historical observations can
  be retained without claiming that corrected code was tested by old results.
- One combined acceptance batch is cheaper and clearer than nine full campaigns.
  No per-finding model or installer exercise is justified by this scope.
- A documentation-only planning commit is exempt from behavioral change review;
  future implementation requires the exact-patch review and applicable host gates.

## Final validation results

Planning only: source, configuration, documentation, historical receipt and
selected SHA-256 reads were performed. No tests, validation scripts, formatting,
lint, type checking, builds, GPU/model work or application behavior were run.
No historical gate is claimed as a fresh or fully approved reused PASS for the
future implementation. The current plan's contents/links and exact Git diff are
reviewed as text before the authorized documentation commit.

All nine corrections, intended-red reproductions, current acceptance results,
cleanup proof and independent implementation approval are **pending**. The final
implementation report must list executed commands/results separately from each
approved reused receipt, record omissions and limits, and archive this plan only
after the stated acceptance criteria are satisfied.
