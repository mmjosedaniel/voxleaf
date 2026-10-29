# Verified chat audit corrections

## Goal

Correct the nine statically validated findings from the four-pass chat audit
with the smallest changes to their existing owners. Preserve the current
product, contracts, model/runtime versions and accepted authorities. Minimize
validation by reusing fixtures and proven unchanged evidence, grouping coupled
regressions, and running combined acceptance once after the final relevant edit.

Implementation is authorized in this chat. Entry branch/HEAD are
`codex/verified-chat-audit-corrections` / `61b9f32c2360f8eb27c1822aa4c94768c465a9ed`;
the index and worktree were clean. All changes remain uncommitted: staging,
commit, push, PR and merge are prohibited. Implementation acceptance is approved
by [VCA-R2-20261029](../evidence/verified-chat-audit-corrections/review-R2.md).
The separate [archive report](../evidence/verified-chat-audit-corrections/review-R3.md)
records the final documentation-state assessment.

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

Status: complete; current execution identities captured. Historical PASS reuse declined.

Before production edits, inspect clean/changed paths, capture baseline HEAD,
complete test/source/config membership and tool/host identities outside the
sandbox. Map new assertions to the existing cases; preserve relevant old tests.
Inspect the historical receipts in the next section before claiming reuse.
Record gate dispositions as RUN, REUSE-with-proof, NOT-APPLICABLE or BLOCKED.
No broad baseline run is required merely to reproduce an old PASS: new focused
regressions must fail for the intended reason before their production fix.

### M1 — Desktop state and placement corrections

Status: implemented; intended-red evidence captured; combined acceptance pending.

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

Status: implemented; intended-red evidence captured; combined acceptance pending.

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

Status: implemented; intended-red evidence captured; combined acceptance pending.

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

Status: in progress; host static and combined acceptance next.

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

Commands below are the selected matrix, derived from current package configuration,
existing pytest/Cargo runners and existing harnesses. Default cwd is repository
root; `--filter ... exec` executes inside the desktop package. Filter focused
tests to the actual edited group. Do not create an unlisted test command from
memory. A new fixture belongs to an existing runner unless separately justified.
Actual attempts and current results are distinguished in the
[execution ledger](../evidence/verified-chat-audit-corrections/execution-ledger.md).

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

- 2026-10-29 R2 APPROVE: all nine acceptance criteria, R1-F1 resolution,
  current combined/browser/native evidence and scoped Python carry-forward pass
  independent review. The director rechecked all 412 reviewed SHA-256/blob/status
  identities before closeout; branch/HEAD remain unchanged and index empty.
  Archive this plan and update only maintained navigation/testing/ledger prose.
  No production/test/build input changes follow R2. Request separate immutable
  VCA-R3-20261029 for that final documentation state; preserve R1/R2 unchanged.
  Final archive evidence guard/diff/identity checks run in local PowerShell.

- 2026-10-29 current combined gates after R1-F1: F-TS-R2-04 passed all static
  leaves and shared 210 / EPUB 720 / desktop 929 / Node 110 with package hooks.
  F-Desktop-R2-build-02 built the corrected default executable and standalone
  frontend. F-Rust-R2-02 passed format, both Clippy variants and 141/140 tests
  after those assets, seven explicit ignores each. B1-browser-R2-04 passed all
  15 cases (172.82 seconds including hooks), with identical built assets.
  N1-native-01 passed on that exact binary (13.41 seconds), including native
  supervisor, isolated WebView2 profile, replacement/persistence and cleanup;
  no errors/external requests. No extra build via the native wrapper was needed.
  F-Host-R2-01 confirms unchanged tool versions. Current Python receipts retain
  zero changed Python inputs (309 recorded identities); submit the complete
  source/membership/artifact/environment comparison to R2 for scoped carry-forward.
  F-Docs-R2-02 renews guard plus 31 guard tests; final exact-patch approval remains
  pending. No historical PASS, model run, download or installation is reused.

- 2026-10-29 F-TS-R2-03 passed format/lint and stopped before runtime tests on
  two new regression fixture typings: the helper lacked paused state and the
  assertion used playback instead of state. Add the existing paused contract to
  that test helper and correct the assertion; no production change. Renew the
  same combined gate once after formatting; preserve the failed receipt.

- 2026-10-29 R1 returned CHANGES_REQUESTED for one P2 overlap: changing a
  reader preference replaced pending interior navigation with a reflow-only
  completion, retaining its sampling suspension. R1-overlap-red-01 reproduced
  the wrong settlement reason before correction. Preserve the original
  restoration reason while navigation is pending; the same regression checks
  paused intent, no automatic start, one settlement and subsequent passive
  observations. No new production owner or contract is needed. Renew affected
  TS static/suites, final frontend/native build and full browser spec; renew
  Rust leaves after final frontend assets because generate_context consumes
  those inputs. N1 will use that corrected binary. Preserve R1 and all receipts.
  B1-browser-final-03 had passed all 15 cases on R1; it is superseded for current
  acceptance by this production correction, not discarded. Python inputs remain
  unchanged; complete identity proof is required to retain its current receipts.

- 2026-10-29 B1-vca-diagnostic-05 passed navigation, empty controls, focus and
  selection, then exposed the fixture's existing sixteen-entry observation cap
  at Resume. Clear only that synthetic observation list before Resume and assert
  its first new exact offset. Strengthen the same case's multi-screen precondition
  and traverse twelve next boundaries plus two previous boundaries, so geometry
  cannot pass merely because nearby targets are visible at block start. One
  focused diagnosis follows; no product/source/build input changes are needed.

- 2026-10-29 B1-vca-diagnostic-04 reached the focus assertion. The fixture
  focused the action button that production deliberately disables during
  settlement; Chromium blurs disabled controls. Use the stable contents button
  as the existing-focus subject and dispatch the navigation action without
  moving it, matching the unit case and the preserved focus-policy criterion.
  Retain all focus and selection assertions, then diagnose this single case;
  full-spec acceptance still requires one current all-case PASS.

- 2026-10-29 B1-vca-diagnostic-03 passed geometry but failed the added immediate
  persistence assertion. Caller inspection confirms `scheduleImmediate` refuses
  visual saves while narration owns the heard checkpoint, including Pause.
  Preserve that authority as required by this plan: assert checkpoint equality
  during paused navigation and exact new generation offset on explicit Resume.
  Replan one focused diagnosis of these corrected assertions before the full
  spec. Also correct the earlier fixture explanation: multiple paragraph text
  nodes are observed; the failing trace alone does not establish that highlighting
  created them. No persistence or DOM-mapper production change is justified.

- 2026-10-29 B1-browser-02 exposed a second test-fixture assumption: the
  highlight/selection boundary splits paragraph text nodes, so measuring an
  absolute code-point offset against only `firstChild` raised IndexSizeError.
  Explicit bounded replan: map the expected offset across all paragraph text
  nodes with a DOM TreeWalker, retain the same visible-range/persisted-offset
  assertions, diagnose the single VCA case once, then renew the full spec.
  The fixture change does not weaken geometry or change production owners.

- 2026-10-29 B1-browser-01: 14 existing cases passed; the new case timed out
  before navigation because it did not open the details panel that contains
  passage controls. Preserved the entire failure trace/screenshot/context.
  Correct only test setup by opening the existing details panel, then run the
  full 15-case spec again. No production source or binary changed; browser-spec
  format/lint/type checks renew without repeating unaffected runtime suites.

- 2026-10-29 VCA-08 diagnostic: the child was in the exact Job (five owned
  launcher/worker processes); Job accounting reached zero while the child's
  handle was briefly unsignalled, then signalled within the diagnostic's bounded
  wait. Thus the two previous immediate-exit failures do not prove an escaped
  child under the Job implementation. Correct the assertion to observe actual
  handle exit within the existing 2-second test watchdog plus 5-second cleanup,
  preserving live-child readiness, identity, parent exit and finally containment.
  A 60-second surviving child still fails. Keep suspended launch because code
  inspection establishes the pre-assignment launcher race; the observed failures
  did not independently prove that race. No timeout or production limit increases.

- 2026-10-29 VCA-08 correction still failed the immediate descendant-exit
  assertion. Explicit replan before further execution: run one instrumented
  synthetic diagnostic to observe Job membership/accounting and process-handle
  signalling around termination; do not guess another fix or repeat a suite.
  The suspended-launch correction remains provisional pending that evidence.
  TS combined run passed shared 210/EPUB 720 and 926 desktop cases; two existing
  opening-state tests found a spurious second busy status on the first book.
  Avoid starting a replacement barrier when there is no narrator to close;
  an already pending/failed barrier remains unchanged across rapid replacements.

- 2026-10-29 combined suites: Rust passed 141 default / 140 release-locked,
  seven explicit ignores per variant. Python first combined run: 734 passed,
  one failed; the real VCA-08 descendant still survived initial Job assignment.
  Diagnosed startup race: a Python venv launcher can create its interpreter child
  before Popen returns, earlier than stdin dispatch. Correction stays in CLI:
  create suspended, assign the exact process handle to the Job, then locate and
  verify the suspended primary thread's live process ownership before resuming.
  No name-based termination or unverified PID authority. Rerun the affected CLI
  file first to diagnose this failure, then renew Python's combined gate only
  after that correction passes; retain both original red and combined failure.
  TS static replanned-03 reached all green commands but its final snapshot raced
  Rust executable linking and failed with PermissionError. The one unchanged
  infrastructure retry after Rust became idle passed as host-retry-04. The
  failed capture is not reconstructed or treated as a complete receipt.

- 2026-10-29 TS static attempts: 01 found React ref-capture constraints; moved
  restoration settlement into the existing layout-effect boundary using its
  captured navigation revision. Attempt 02 passed lint and reached types,
  exposing three Testing Library queries using Playwright's `exact` option.
  Bounded replan: use exact name regexes and rerun current TS static leaves.
  Added an exact persisted-offset assertion to the combined browser case before
  its first execution. Python static replanned-03 passed all leaves (180 mypy
  source files). No runtime suite has been rerun for these static corrections.

- 2026-10-29 F1 static: Rust format/Clippy passed in both variants. Evidence
  guard and 31 guard tests passed. Python static attempt 01 stopped at Ruff B009
  on constant getattr; attempt 02 reached mypy and exposed the private Windows
  Popen handle missing from portable stubs plus two non-exported module-mock
  references. Explicit bounded replan after this second static failure: type
  only the Windows handle capability through a private Protocol and patch the
  imported subprocess module in tests, then rerun affected Python static leaves.
  These are code/type corrections, not infrastructure retries; original receipts
  remain immutable. No assertion, runtime limit or acceptance criterion relaxed.

- 2026-10-29 M1-M3: implemented the nine corrections in their allowlisted owners.
  D1-state-red-01 failed six intended assertions, with two controls passing;
  D1-handoff-red-02 failed all three premature-replacement cases;
  D1-placement-red-02 failed both immediate interior-settlement assertions.
  First handoff/placement attempts exposed fixture errors (unstable external
  snapshot / incorrect accessible name); fixed the fixtures, retained those
  failed receipts, then obtained the intended reds. No production workaround
  was used to obtain those reproductions.
  D2-red-01 failed both dangling active-root and denied-metadata regressions.
  D3-red-01 failed nine expected assertions (RAM, request/cancellation deadline,
  actual surviving descendant); one proven-exit memory control passed. Its
  exact-handle finally cleanup verified the synthetic descendant's exit.
- 2026-10-29 implementation decisions: Settings uses existing stop/reset calls;
  interrupted recovery settles only after verified teardown without refunding
  its retry budget. App chains close/observed-containment before creating a new
  narrator. Reader reuses bounded code-point reflow placement and suppresses
  immediate passive resampling; unavailable/offscreen placement recovers to
  block start. Paused presentation reflects released ownership. Compatibility
  failures retain known language and future-version persistence protections.
  Rust reuses owned-path metadata semantics and a test-only denied-access seam.
  Benchmark memory requires successful inspection or proven handle exit;
  generation/cancellation use one deadline. Outer measurement owns a Windows
  Job Object attached before private stdin dispatch, with kill-on-close and
  bounded active-process verification. Existing Python adapter taskkill depends
  on a live parent and cannot establish this guarantee; native supervisor Job
  ownership was inspected but is not a Python-callable owner. No dependency,
  public contract, frozen benchmark or model change is introduced.
- 2026-10-29 validation selection remains **EJECUTAR** F1/B1/N1 and current
  independent review; **REUTILIZAR** historical PASS: none. Supplemental tests
  cover the actual TTS client's deferred supervisor acknowledgement, bounded
  geometry fallback and outer cleanup on success/error/interruption. Final
  green will come from the combined suites, not another focused green run.

- 2026-10-28 execution M0: verified branch/HEAD and clean entry state; read the
  complete plan, AGENTS, bug skill, review/reuse policies and relevant authorities.
  VAF R4/R5 and SAC reports are historical; VAF R5 manifest/receipt-map hashes
  match their recorded identities. Inspected original F-TS-tests-01 (exit 1,
  shared 210 / EPUB 720 pass) and F-Python-tests-01 (exit 0, 722 tests).
  **EJECUTAR** all selected fast leaves: partial old identities do not prove the
  complete install/discovery/environment closure, and fresh package tests are
  cheaper than proving reuse. No historical runtime PASS is reused.
  **NO APLICA** model/GPU/download/installer/quality gates for the stated scope.
  D1/D2/D3 intended reds, final F1/B1/N1 and review remain **EJECUTAR/pending**.
  Captures use ignored `tmp/evidence/verified-chat-audit-corrections/` with
  distinct immutable before/after/log/result receipts; M0-host records normal
  local PowerShell 7.6.5, Node 24.20.0, pnpm 11.15.1, uv 0.11.29,
  Rust/Cargo 1.97.1 and Windows build 26200. The shell Python is 3.14.6;
  project commands continue to use the locked uv project interpreter.

- 2026-10-28: Revalidated nine findings on `ab6a609`; excluded engine-dependent
  indexing risk. Read repository plan/validation/testing authorities and current
  command definitions. Inspected VAF/SAC reports and retained receipts; performed
  read-only source/hash comparisons for reuse candidates. No tests executed.
- 2026-10-28: Created the dedicated planning branch and this ExecPlan with the
  active-index entry. Documentation commit is authorized; production execution
  and acceptance remain pending.
- [x] M0 execution identity/readiness and final reuse dispositions.
- [x] M1 desktop regressions and minimal corrections.
- [x] M2 native removal regressions and correction.
- [x] M3 benchmark regressions and corrections.
- [x] M4 combined gates, R2 implementation approval and documented archive;
  the separate R3 report records the final archive assessment.

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

VCA-01–09 are implemented and accepted by independent **VCA-R2-20261029 APPROVE**.
R1-F1 was reproduced, minimally corrected and covered by the current full suite.
The [execution ledger](../evidence/verified-chat-audit-corrections/execution-ledger.md)
records exact commands, failed attempts, current receipts and omissions.

- **EJECUTAR / PASS:** current TypeScript format/lint/types and tests (shared 210,
  EPUB 720, desktop 929, Node 110); Rust format, both Clippy/test variants
  (141/140 pass, seven ignores each); default native and portable frontend
  builds; affected browser spec (15); model-free WebView2/native supervisor
  smoke and cleanup; evidence guard plus 31 tests.
- **REUTILIZAR con prueba / R2-approved:** only this task's immutable
  F-Python-renewed-02 (format/lint, mypy 180, pytest 735) and F-Python-build-01
  (wheel/sdist). Original input snapshots, complete current deltas, independently
  inspected consumers/discovery and unchanged host/dependency records establish
  their independence from the later frontend correction. These are executed
  task results retained into R2, not fresh R2 Python runs or VAF/SAC acceptance.
- **NO APLICA:** models/GPU, real downloads, installation/uninstallation,
  quality/listening benchmarks and frozen-result regeneration; their
  responsibilities remain unchanged. No ignored test is claimed PASS. VCA-10
  remains excluded. The check/check:portable leaves are covered without claiming
  that either aggregate ran.
- **BLOQUEADO:** no remaining implementation acceptance blocker in R2. The
  archive-state verdict and final identity recheck are recorded separately in
  [R3](../evidence/verified-chat-audit-corrections/review-R3.md).

Canonical architecture, public contracts, local-only EPUB/TTS, memory-only audio,
bounded cancellation and frozen authorities remain unchanged. Existing large
frontend-chunk and pytest cache-write warnings remain recorded; they did not
fail the selected gates. All task changes remain unstaged and uncommitted.
