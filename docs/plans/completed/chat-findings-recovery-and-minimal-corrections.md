# Chat findings: minimal recovery and contract corrections

Status: **complete**. See the [execution ledger](../evidence/chat-findings-recovery/execution-ledger.md).
Prepared on 2026-11-12 from clean `main` at
`693b0fc3650de45244c035b13e05de38a0067c9a` (passage-navigation PR #313).
Planning branch: `codex/chat-findings-20261112-plan`.

The planning delivery established the branch and documented the case 7
decision. The user subsequently authorized M0–M6 implementation and validation
from `95eb4887121f2696beabade407d04afa6441e881`. Git delivery remains outside
the current execution scope.

## Goal

Correct the still-supported findings from the five searches and their subsequent
case-by-case investigations, preserving the protections established by earlier
ExecPlans. Prefer changes in existing owners and the smallest relevant validation
selection. Another developer must be able to continue using this document without
the chat or its subagents.

There are 24 dispositions: 22 statically supported defects, the now-resolved
preflight contract decision (7), and one intentional recovery policy (1).
Twenty-one defects can be corrected within their existing execution contracts;
case 11 requires a separately versioned screening correction. Static support
is not a claim that a reproduction test ran or that every fault occurred on the
user's machine. The implementation and selected host validation are complete.

## User-visible outcome

- Reader placement, subsequent explicit Play, manual inspection and appearance
  changes retain the intended location without advancing heard progress or
  reviving cancelled playback.
- Re-selecting the same healthy Piper profile preserves playback. Optional
  package recovery reports native state and known storage truthfully, preserves
  cancellation, and can remove owned abandoned staging without deleting a valid
  installation or its recovery copy.
- Supported inert EPUB link wrappers and navigation line breaks retain readable
  content. Current narration profiles avoid duplicate Spanish articles, partial
  range expansion, inappropriate terminal ordinal apocope and silent-prefix stalls.
- Maintainer tools reject invalid requests before destructive work, recover from
  interrupted publication/cleanup, preserve exact-artifact release observations,
  and apply the preflight exit contract selected below.
- A future explicitly selected CustomVoice screen uses exact comparisons for ties;
  historical v2 results and the current selected voices remain unchanged.

## Current state

The investigation read the five original reports, the 22 case investigations,
their historical plan/commit references, related production code and existing
tests. It then reviewed the two additional defects numbered 23 and 24. No tests
or application execution were used to produce those findings. This plan preserves
the original numbering, even where several cases share one implementation unit.

### Finding and history register

Line references describe the planning base; locate the named symbols again if
the execution base changes. Abbreviations below identify historical plans, not
new acceptance evidence.

| Case | Supported trigger and consequence | Prior work and current disposition |
| --- | --- | --- |
| 1 | Recovery prefers the latest heard locator over an attempted later start. | **Exclude as intentional.** VUC withdrew this same proposed change; FPA corrected only first-start/no-heard and cancelled-recovery cases. Preserve `latestHeard ?? attemptedStart` and its controls. |
| 2 | Pause at A, request passage B, Stop before placement settles, then Play without another scroll: the coordinator can still start A. A stopped unavailable placement can also leave the old availability flag true. | **Correct in U1.** The blanket supersession path was introduced by PN/#313. PN tests stop before settlement but do not exercise the later explicit Play. Preserve cancellation and checkpoint suppression. |
| 3 | After unavailable placement disables Play, a later valid manual viewport measurement does not release the gate; an equal locator can also be deduplicated before availability changes. | **Correct in U1.** PN-R1-F1 correctly prevented unavailable/offscreen preference reflow from reopening Play. Add measured manual recovery without weakening that protection. |
| 4 | A supported EPUB 3 inert external anchor wrapping paragraphs/other supported blocks enters an inline collector and opening fails. | **Correct in U4.** M003/ADR-0007 preserve safe descendants of inert links; existing inline-link cases do not cover flow descendants. Keep URLs inert and internal-link rules bounded. |
| 5 | A fresh optional-package manager has no in-memory postcommit receipt for abandoned staging. Check cannot repair it; with a valid active package the residue can be hidden by Installed. | **Correct in U3.** LCF-02 closed snapshot/download deletion races; RCF-13 made polling read-only; CAF R1.3 detects residue; C14 requires exact postcommit provenance. Reconcile startup staging in a distinct owned phase, with explicit retry, never in ordinary polling. |
| 6 | Generating an already-present quality candidate, or rejecting candidate/fingerprint admission, raises inside a cleanup block that deletes the existing session. | **Correct in U7.** RAC-02 protected finalized sessions; R8-02 protected adapter-close failure. Complete admission before cleanup ownership; retain cleanup after an actually admitted generation failure. |
| 7 | A passing pilot receipt says pass and has no failures, but standalone preflight exits 2 because official eligibility is false. | **Decision accepted in U8.** FPA case 1.6 deliberately left this contract unresolved. The planned exit reports success for the requested purpose; pilot official/promotion eligibility stays false. |
| 8 | Clicking the already-checked healthy Piper radio still enters the configuration barrier, stops audio and can reset the recovery episode. | **Correct in U2.** MAF-10 protected healthy Chatterbox; NLC-03 protected same-profile rechecks. Extend the no-op to the same saved healthy Piper profile/language at both action and callback boundaries. |
| 9 | `Las\u00a014:30.` is normalized with another article because article recognition precedes whitespace collapse and accepts only ASCII spacing. Narrow no-break space has the same gap. | **Correct in U5.** SAF-12 fixed capitalized ASCII articles. Match the bounded supported spacing without broadening time grammar or changing source spans. |
| 10 | An en dash is missing from numeric-continuation protection: a time/date/percentage range can be expanded on only one side. | **Correct in U5.** BNC-03, VUC-02 and later Celsius fixes protect different compounds. Cover both endpoints of unsupported numeric ranges; keep editorial dashes and supported standalone forms distinct. |
| 11 | Two eligible voices with exact overall mean `13/3` can compare as different binary floats, bypassing pronunciation and later tie breakers. | **Versioned correction in U9.** No exact previous fix found. The v1-to-v2 scoring precedent requires a new authority. Serena's recorded v2 lead is not this tie; do not revise its winner or results. |
| 12 | Multiple appearance edits during initial restoration are reduced to the first differing field, then echoed to App as a whole partial preference object. | **Correct in U1.** Initial reflow handling, RPI-01 and PN placement corrections did not cover the real App/Reader callback interaction. Apply the complete latest controlled preference snapshot once. |
| 13 | Visible `<br/>` inside an EPUB 3 TOC label disappears, joining words in the title. | **Correct in U4.** RCF-15 hidden labels, CAF alt text and DCR-07 retained-attribute accounting remain controls. Insert a collapsed separator only for admitted visible XHTML breaks. |
| 14 | Publishing a defect correction succeeds but unlinking the old aggregate fails. A retry is then rejected as a duplicate; CPU-fallback derivation can consume the stale aggregate. | **Correct in U7.** M010's correction/aggregate workflow and SAF-05 output recovery do not cover this window. Invalidate before publishing and reject stale aggregates at derivation. The known correction direction can cause false rejection, not an established false admission. |
| 15 | Ordinary Chatterbox receipt validation compares three objects with `JSON.stringify`, rejecting equivalent key orders. | **Correct in U11.** FPA U12/4.4 accepted the already-correct **lifecycle** comparison; its reordered-object test does not cover the ordinary journey objects. Preserve strict fields and ordered step arrays. |
| 16 | Native host denial leaves the original confirmation token in Confirming, but the client projects Failed; Cancel disappears and Remove becomes offered. | **Correct in U3.** SFA-06 late-error retention and EFC-07 recheck recovery used other states. Preserve real Confirming plus attempt feedback and original token ownership. |
| 17 | A real manual scroll during follow suspension is not admitted before the pending correction scroll runs, so it can be undone. | **Correct in U1.** RAC-07's CI follow-up added settling waits; RCF-16/17 and FPA 5.1 protect already-admitted inspection/late events. Add bounded manual-intent arbitration during follow, retaining those controls. Natural incidence remains unmeasured. |
| 18 | Standalone masculine `1.º` becomes `primer`, including a terminal phrase such as `Terminó 1.º.` | **Correct in U5.** Existing `1.º puesto` corpus coverage requires the apocopated form. Use proven terminal context for `primero`; do not globally replace it. |
| 19 | The ordinary-evidence alias omits signature/antivirus arguments; defaults replace earlier verified signed or unsigned-scanned observations. | **Correct in U11.** M011 introduced the alias; CAF R1.5, DCR-05 and FPA U12 hardened other signature/receipt boundaries. Preserve only verified observations bound to the same bytes, or fail before overwrite. Current tracked evidence is unsigned/unscanned; no historical signed-release failure is claimed. |
| 20 | A Piper source window beginning with at least 320 NBSPs cannot pack the following substantive character. Long interior gaps and the 4095-space provisional-window edge expose related stalls. | **Correct in U6.** SAC-08/ADR-0066 fixed silent **suffix** traversal, including related existing tests. Skip only proven collapsed-whitespace prefixes when no legal candidate exists; preserve substantive text and bounded progress. |
| 21 | v12 quality generation creates its directory before adapter/corpus setup and publishes map/HTML after its cleanup scope. Failures leave unusable quality state that blocks retry. | **Correct in U10.** R8-02 handles close failure and SAF-05 handles summary write failure, not these setup/publication paths. Exclusively stage all newly owned quality output before publishing it. |
| 22 | Failed native/client states can display the full expected 8,236,757,393-byte package size after cleanup, partial removal or invalid installation. | **Correct in U3.** CAF removed one staging-only estimate; RCF-13/C14 retain valid postcommit proof. Expected download size is not measured retained storage. Keep unknown retained bytes absent. |
| 23 | Ordinary receipt validation coerces `applicationBinary.sha256` through RegExp and accepts extra nested fields; the entire object is later copied into evidence. | **New, correct in U11.** A one-element array of a valid hash can pass, as can extra fields. Require a closed three-field object with primitive types and reconstruct the allowlisted output. No actual private-data disclosure was observed. |
| 24 | v12 derivation deletes the scorecard before final session cleanup. If cleanup fails, retry needs a scorecard that is already gone, although an output summary exists. | **New, correct in U10.** SAF-05 moved deletion after summary writing but did not make final cleanup resumable. Preserve validated retry material and publish a cleanup-success claim only after verified cleanup. CLI already reports failure on the exception. |

The hypothetical slow asynchronous preferences-read variant of case 12 is
excluded: the production localStorage read is synchronous at that boundary.
Do not turn a mock-only ordering into another production fix.

## Scope and non-goals

Implement the 23 actionable dispositions through the 11 cohesive units below.
Units are ownership and review boundaries; they do not mandate a full repository
test run, build or commit each. Shared consumer files belong to the explicitly
declared desktop integration batch and are edited sequentially by one writer.
Record any required scope expansion before editing it.

Do not change model payloads, dependencies, supported hardware, runtime selection,
audio protocol, public locator schemas, historical results, frozen normalizer
corpora or completed ExecPlans. No full model-quality evaluation, speaker
selection campaign, automatic narration restart, multi-instance acquisition
support, generic transaction framework or broad refactor is requested.
The versioned screen in U9 is an explicit exception for **new** authority/schema
files; its historical v2 inputs/results are immutable.

## Relevant files and documentation

Read the current [documentation index](../../README.md),
[MVP requirements](../../product/mvp.md),
[reader/settings requirements](../../product/reader-settings-and-playback-controls.md),
[overview](../../architecture/overview.md),
[system diagram](../../architecture/system-diagram.md),
[roadmap](../roadmap.md) and [.agents/PLANS.md](../../../.agents/PLANS.md).
M005 remains complete at its safe-document-to-narration boundary; read its
[completed plan](M005-narration-text-preparation.md) before U5/U6.
That evidence does not establish current playback or new normalization acceptance.

Durable constraints include ADR-0007/0012 (EPUB/preparation), ADR-0046 (native
single-instance boundary), ADR-0066 (silent tails), ADR-0070 (placement/recovery),
ADR-0071 (checkpoint/image lifetime) and ADR-0073 (passage placement). The
[release authority v2](../../architecture/mvp-release-authority-v2.md) retains
v1's cleanup and exact-artifact requirements. Add a bounded ADR during execution
where the startup-reconciliation or versioned-screen decision needs durable
documentation; reserve the next available ADR number then. Keep historical
authorities unchanged and state precisely which policy the new decision extends.

Historical plan map:

- PN: [passage navigation](passage-navigation-minimal-corrections.md),
  #313, `693b0fc`; [acceptance bindings](../evidence/passage-navigation/acceptance-bindings.md).
- FPA: [five-pass audit](five-pass-audit-revalidation-and-corrections.md),
  #312, `a8a61df`; [ledger](../evidence/five-pass-audit/execution-ledger.md).
- RPI: [reader position/image lifecycle](reader-position-and-image-lifecycle.md), #311.
- DCR: [deep chat audit](deep-chat-audit-minimal-corrections.md),
  #310, `2e464da`.
- CCF/C14: [confirmed chat findings](confirmed-chat-findings-minimal-corrections.md),
  #306, `426ec7d`.
- CAF: [chat audit follow-up](chat-audit-minimal-follow-up.md),
  #305, `78db4f8`.
- RCF: [revalidated chat findings](revalidated-chat-findings-minimal-corrections.md),
  #304, `7820db6`.
- BNC: [narration boundaries/navigation](narration-boundary-navigation-corrections.md),
  #296, `85dd916`; VUC: [visible locator/Unicode compounds](visible-locator-unicode-compound-corrections.md),
  #294, `f2870ff`.
- R8: [eight revalidated findings](eight-revalidated-findings-minimal-corrections.md),
  #293, `f533090`; EFC: [eight findings](eight-finding-minimal-corrections.md), #288.
- SFA: [seven findings](seven-finding-minimal-corrections.md), #287;
  MAF: [minimal audit](minimal-audit-findings-corrections.md), #286;
  SAF: [static audit follow-up](static-audit-follow-up.md), #285.
- RAC: [revalidated audit corrections](revalidated-audit-corrections.md), #284;
  SAC: [static audit](static-audit-corrections.md), #281;
  LCF: [lifecycle correctness](lifecycle-correctness-follow-up.md), #277;
  NLC: [narration logic](narration-logic-corrections.md), #276.

These are ancestry/control references. In particular, a prior plan saying
"complete" does not close a different trigger in the same file.

## Architecture and constraints

Keep the existing extraction, safe semantic model, preparation, coordinator,
player, native package manager and maintainer-tool owners. Domain logic stays
outside controls. Existing typed identities fence publication, placement,
narration, configuration and acquisition lifetimes; do not equate counters with
different owners. Visible position and heard checkpoint remain distinct evidence.

EPUB text and inference remain local, ordinary generated audio stays ephemeral,
all new work remains bounded/cancellable, and performance diagnostics contain no
book text. Synthetic fixtures may exercise real public boundaries. Benchmark
quality audio remains only in its existing explicit opt-in ignored session.
Recovery must never delete unowned files, a live worker's staging, a replacement
session or the sole rollback copy. Retain the native `runtime -> operation`
lock order and validate directory ancestry before destructive work.

The plan expects no new process, network edge, dependency or persistence owner.
Review the system diagram after implementation; update it only if actual
ownership/data flow changes. U10's bounded private cleanup journal, if needed,
belongs to the existing ignored benchmark-session owner, never product state.

### Accepted decision for case 7

The standalone `benchmarks.cli preflight` exit code reports whether the requested
checks succeeded. It uses the existing `_preflight_passed(receipt)` predicate,
already consumed by both measurement parent and worker, instead of testing only
`eligible_for_official_run`.

| Request/receipt | Exit | `status` | Official eligibility | Promotion eligibility |
| --- | ---: | --- | --- | --- |
| Pilot, no failures | 0 | pass | false | false |
| Pilot, any failure | 2 | fail | false | false |
| Official, all current official checks pass | 0 | pass | true | Existing receipt semantics unchanged |
| Official, any failure/ineligible | 2 | fail for a normally constructed failed receipt | false | false |
| Invalid request or exception | 2 | fail | No affirmative eligibility claim | No affirmative eligibility claim |

The preflight is readiness evidence, not a completed evaluation or an authority
to promote a result. Do not make the predicate simply `not failures`: official
requests must retain official eligibility. Even an inconsistent supplied receipt
with failures and an eligibility flag must fail. Normal `run_preflight` constructs
consistent flags from purpose and failures.

This choice makes standalone preflight consistent with its existing JSON status
and both measurement entry points, with one predicate substitution. Keeping
exit 0 reserved for official purpose would retain a successful pilot that shell
automation must treat as failure. Official-only consumers already have explicit
eligibility fields, so changing those gates is unnecessary and out of scope.

Deep inspection at the planning base found the contradiction in
`services/tts/benchmarks/cli.py:648`; `_preflight_passed` is at 275 and is used at
567/611. `preflight.py:495-507` intentionally leaves both flags false for pilot.
`test_benchmark_preflight.py` already asserts that pilot may pass without either
eligibility; it does not exercise the standalone CLI exit. `cpu_fallback_result`,
`customvoice_screen`, `dual_worker_cli`, `incremental_prototype` and `quality_cli`
check official eligibility independently. Repository shell/CI search found no
additional standalone caller that promotes merely from this command's exit;
the setup/benchmark README examples request official purpose. Recheck callers
at execution. Document exit and payload semantics in those two guides, without
changing measurement execution, frozen gates or promotion schemas.

## Milestones

### M0: Admit execution and capture only necessary baseline evidence

Status: **complete**. The starting tree and index were clean. Selected
Python regressions used fresh focused host captures because the existing
receipts do not cover the new inputs.

- Recheck HEAD, dirty/index state, changed consumers and original finding
  validity. Preserve unrelated work. Record an execution ledger under
  `docs/plans/evidence/chat-findings-recovery/`; private captures go to a new
  ignored `tmp/evidence/chat-findings-recovery/` directory.
- Resolve original receipts first. Decide reuse per the evidence table below,
  before running a baseline. Do not rerun broad historical suites just to create
  a new baseline label. A missing proof requires only the affected gate.
- Freeze unit path lists and focused regression gaps. When a fault depends on
  timing/ownership, capture a discriminating public-boundary reproduction; test
  collection zero, fixture errors and infrastructure errors are not product RED.
- Use normal local PowerShell outside the managed sandbox for every test and
  validation command. Capture original command, cwd, exit, environment, inputs,
  membership and artifacts at execution time. Start with cheap checks.

### M1: Maintainer benchmark corrections (U7-U10)

Status: **complete**. G3, Python static checks and independent review passed.

**U8 — case 7.** Change only the standalone exit predicate, add a parameterized
CLI purpose/pass/fail matrix including malformed input and inconsistent failure
receipt controls, and document the decision. Reuse the existing receipt factory
and official/pilot assertions. Do not launch a host preflight or real benchmark
to test this Boolean contract.

**U7 — cases 6 and 14.** Owners are `services/tts/benchmarks/quality.py`
(`generate_candidate_audio`, `correct_meaning_changing_defect`, `aggregate_scores`) and
`cpu_fallback_result.py`, with `test_benchmark_quality.py`.
The derivation consumer is `cpu_fallback_result.derive_result` via `_load_quality`.

- Complete session/candidate/fingerprint/duplicate admission before entering a
  destructive failure scope. Exclusively acquire newly created paths. Rejected
  requests leave prior samples, metadata and completed candidates byte-identical;
  genuine admitted synthesis failure retains the documented cleanup contract.
- Validate a correction, invalidate the old aggregate, then atomically publish
  the correction. An invalidation failure must leave a retryable uncorrected
  state. Do not permit a successful duplicate correction to mutate its evidence.
- At CPU-fallback derivation, verify aggregate freshness against the actual
  scorecards/corrections before destructive finalization. Reject already-stale
  legacy sessions with an actionable regeneration path. Use current private
  evidence; do not silently revise frozen public summaries. Sequential ownership
  remains the supported contract; reordering alone is not concurrency safety.
- Add a focused `services/tts/tests/test_benchmark_cpu_fallback_result.py` only
  for the uncovered public derive path; no direct tests importing that owner
  were found at the planning base. Use synthetic filesystem faults and existing
  quality fixtures, not model generation.

**U10 — cases 21 and 24.** Owners are
`services/tts/benchmarks/corrective_v12_quality.py`, its CLI only if required,
`test_benchmark_corrective_v12.py` and the existing v12 authority tests.

- Stage the complete new quality directory under an exclusively owned sibling.
  Include adapter/corpus setup, generation, close, privacy/size checks, map and
  evaluator publication in one ownership scope. Publish only the complete set
  without overwriting an existing quality directory. On failure delete only the
  newly owned staging; preserve Chatterbox `machine.raw.json`, existing quality
  output and the primary error. Windows rename/conflict behavior needs explicit
  controls; do not assume POSIX replacement behavior.
- Make derivation cleanup resumable after partial deletion. Retain a bounded,
  private, identity-bound pending result/cleanup record **outside the subtree
  being deleted**, before destroying raw inputs. Bind candidate/session, reviewed
  content-safe payload, scorecard and output identity. Retry validates this record
  and remaining ownership instead of requiring a scorecard already deleted.
  Delete the external scorecard only at the owned cleanup phase; verify all
  required cleanup before atomically publishing the success summary. Preserve
  pending material if cleanup or final publication fails. Never expose a final
  `cleanup: true` claim while deletion is unverified, trust arbitrary existing
  summaries as recovery receipts, or overwrite another result/session.
- Keep public v12 result schemas and historical results unchanged. Test failures
  before generation, in both publication writes, adapter close, unlink, partial
  rmtree and final output replacement; verify retry and unrelated-file sentinels.
  This is bounded local recovery, not a general crash-atomic transaction system.

**U9 — case 11, isolated versioned substage.** Owners are
`customvoice_screen.py`, `customvoice_screen_cli.py`, their two existing test
files, and **new** CustomVoice screen authority/result-schema files. Recheck
availability of `customvoice-spanish-screen-v3`; this version series is separate
from the general TTS v14 benchmark authority.

- Freeze a successor authority before any new screen generation. Preserve v2
  authority, corpus, raw-root interpretation, result schema and recorded winner.
  Add explicit closed version selection to the existing tool; absent selection
  retains the old v2 contract. Isolate v3 raw sessions and reject version mixing.
- For v3 only, derive ranking and threshold comparisons from integer scores and
  applicability counts using exact rational arithmetic (standard-library
  `Fraction`, or equivalent bounded integer scaling). Preserve the seven ordered
  tie breakers and speaker-order fallback. Convert to JSON numbers only at the
  existing presentation boundary. Do not use an arbitrary epsilon/rounding rule.
- The exact witness is A=(5,5,3,4,13/3,13/3,14/3) and
  B=(14/3,14/3,3,4,14/3,14/3,14/3), in dimension order
  intelligibility, Spanish pronunciation, punctuation/dialogue, numbers,
  naturalness, audiobook suitability, artifact freedom. Counts are
  (3,3,2,1,3,3,3), realizable with integer 1-5 ratings; both have zero defects
  and overall 13/3. A must win on pronunciation. Also retain non-ties, threshold
  boundaries, all tie breakers and rejected-speaker controls.
- Add only the version plumbing necessary for this rule, not a new evaluation
  framework. No audio, new winner, measured quality result or model-support
  decision is needed for this model-free correction. Record v3 evaluation as
  unexecuted, not as an accepted replacement for the historical v2 result.

Validation: focused G3 and affected G11 leaves, with subsequent independent
review. Historical v2/v12 authority controls remain part of G3. No GPU gate.

### M2: EPUB projection and narration (U4-U6)

Status: **complete**. G2 passed on the rebuilt package exports. Final
input reconciliation is recorded in the ledger.

**U4 — cases 4 and 13.** Owners are
`packages/epub/src/document/xhtml-projector.ts` and
`src/navigation/navigation-document.ts`, with their existing tests and
`src/public/open-epub-publication.test.ts` / `src/integration/ingestion-matrix.test.ts`.

- In block context, project safe flow descendants of inert external/no-href
  anchors transparently, preserving order, language, IDs and budgets. Keep inline
  behavior and local-link resolution controls; do not admit network navigation,
  arbitrary internal block links, interactive descendants or invalid structure.
- After hidden/forbidden/namespace filtering, a visible XHTML TOC break contributes
  one collapsible separator. Apply the 1,024-character label limit correctly;
  do not falsely charge it as retained attribute text. Preserve image-alt/title
  fallback, XML text accounting, NCX behavior and destination identity.

**U5 — cases 9, 10 and 18.** Owners are the current mutable Spanish/bilingual
normalization tables and `src/narration/narration-normalizer.ts`. Determine which
table is active for each profile before editing; legacy `narration-v1` stays frozen.

- Recognize an existing Spanish article across supported bounded NBSP/narrow-NBSP
  spacing before expansion. Retain standalone-time behavior, case handling and
  exact source-span accounting.
- Protect both endpoints of unsupported en-dash time, date and percent ranges in
  the shared numeric-continuation boundary. Keep Celsius-specific controls,
  existing minus/timezone rules, editorial punctuation and bounded lookahead.
  This does not add a general range grammar or promise indivisible segmentation.
- Use `primero` only where actual punctuation or true leaf completion proves the
  terminal ordinal case. Artificial source-window ends and language/code barriers
  are not terminal evidence. Preserve `primer` in `1.º puesto`, feminine forms
  and conservative ambiguous cases.
- Use the existing public preparation matrix for cold/warm equivalence, legal
  locators, segmentation context and active profile coverage. New examples belong
  in mutable regression tests, not frozen evaluation fixtures.

**U6 — case 20.** Owners are `src/narration/narration-segment-packer.ts`,
`narration-preparation.ts` and directly coupled source/window continuation logic
only if the public 4,095-space boundary requires it.

- When initial packing cannot produce a legal candidate, advance over only a
  proven collapsed-whitespace prefix under the existing work/cancellation budget.
  If a legal range already exists, preserve it: 319 NBSPs plus A can retain
  [0,320); 320 NBSPs plus A needs the substantive [320,321) range.
- Cover long interior gaps as well as starts. At 4,095 spaces followed by A and
  additional prose, reopen/continue from a safe substantive boundary so the
  provisional-window handling does not drop A or stall. Preserve the working
  all-silent-window path, source context, suffix behavior and stable continuation.
- Do not skip arbitrary omissions, code or protected tokens; emit no empty speech,
  increase no ceilings and add no whole-chapter copy. Prove finite progress,
  one/many-segment drain equivalence, cancellation and batch retention bounds.

Validation: G2, package build/type leaves, then the affected desktop G1/G6 and
G7 Piper ES/EN once the integration batch is ready. Existing deterministic
resource assertions are mandatory; they cannot be replaced by historical PASS.

### M3: Reader placement, preferences and healthy profile selection (U1-U2)

Status: **complete**. Focused desktop/browser and native validation are
tracked in the ledger.

**U1 — cases 2, 3, 12 and 17.** Owners are
`apps/desktop/src/tts/product-narration-coordinator.ts`,
`src/reader/ReaderPublication.tsx`, `active-visual-locator.ts`,
`segment-highlight-controller.ts`, and App's existing integration callbacks.
Use their existing tests and real App/EPUB/Reader integration fixtures.

- Split admission of the latest publication-matching **visual** settlement from
  permission to resume audio. Stop revokes restart/persistence intent but must
  not discard a valid B measurement or retain A's availability after B is
  unavailable. A later explicit Play uses B. Do not return blanket success through
  the save bridge or allow stale/duplicate/new-book results to settle a newer request.
- Admit a real, current, measured manual locator after failed placement, including
  unchanged locator coordinates with newly valid geometry. Track bounded provenance
  through existing callbacks. No newer request may be pending. Automatic resize,
  restore, follow and offscreen reflow must not unlock Play or advance heard state.
- Apply the complete latest controlled preference snapshot after pending initial
  placement. Do not echo partial controlled props into App persistence. Capture
  one canonical position and schedule one bounded reflow for that snapshot;
  preserve save revisions, book lifetime and placement gating.
- Admit manual gesture intent during pending automatic follow using current
  viewport/generation ownership and measured movement. Cancel only that follow's
  pending corrections and release its suspension. Preserve keyboard selection,
  interactive controls, zoom, programmatic scrolling and FPA late-event protections;
  `isTrusted` on scroll alone does not distinguish user scrolling. Resume or a new
  audible segment can rearm following. Manual inspection never rewrites heard progress.
- Regression gaps: stopped exact/approximate/unavailable outcomes followed by
  explicit Play; valid manual recovery with same/different locators and rejected
  synthetic reflows; two appearance edits in both orders through real callbacks
  plus reopen; a gesture before the second follow frame and non-gesture controls.
  Reuse PN's outcome matrix instead of building a second mocked reader stack.

**U2 — case 8.** Owners are `src/tts/HardwareCompatibilityControls.tsx`,
`src/settings/narration-settings-actions.ts` and the recovery-reset callback in
App only as needed. A same saved healthy Piper profile/language selection returns
a true no-op before the configuration barrier **and** recovery reset. Do not skip
needed preference persistence for a merely recommended selection, bypass failed
owner recovery, or weaken changed-language/book-replacement containment.
Exercise real checked-radio label clicks for ES/EN; do not claim that keyboard
Space necessarily produces the same click on an already checked radio.

Validation: relevant G1/G6, affected G11, then one shared G7 native build and both
Piper arms after U3. Keep case 1 and PN-R1-F1 as explicit negative controls.

### M4: Optional acquisition and truthful storage (U3)

Status: **complete**. G5 passed in both feature modes,
and the G8 admission and scratch recovery receipts are recorded.

**U3 — cases 5, 16 and 22.** These cases share the native/client lifecycle.

Owners: `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` and its tests,
the existing native initialization hook if needed,
`apps/desktop/src/tts/optional-chatterbox-client.ts`,
`OptionalChatterboxControls.tsx`, and existing settings action guards.

- Add one explicit startup reconciliation phase, before another operation can
  acquire the configured root, for abandoned **staging only**. The release
  authority retains restart cleanup; ADR-0070's read-only snapshots remain
  unchanged. Startup reconciliation must be a separate bounded owned operation,
  not deletion triggered by `snapshot()` or repeated expensive verification.
  Permit explicit Check to retry a failed reconciliation without requiring a
  vanished in-memory postcommit receipt. Keep the existing exact-receipt path
  for postcommit backup cleanup separate.
- Under `runtime -> operation` locking, recheck idle ownership at deletion time
  and validate the complete managed path chain. Preserve active files, versions,
  cache and `.previous`, including the sole recoverable copy. Ambiguity or locked
  files leave explicit recoverable feedback; reader/Piper remain usable. Detect
  staging alongside a valid active installation without misreporting corruption
  of that active package. Do not add cross-process support under this fix.
- On a known pre-network host denial, retain Confirming and its original token,
  expose attempt feedback, keep Cancel/Recheck available and disallow Remove.
  Ambiguous IPC failures require a fenced fresh read; never guess whether a
  download committed. Newer attempts, cancellation and late polls remain authoritative.
- Separate expected install/download amounts from verified retained storage.
  Failed snapshots contain installed bytes only with still-valid exact active or
  postcommit proof; otherwise omit the value, including optimistic client errors.
  Do not hash the full package per poll or preserve cached proof through an
  ambiguous partial removal. Keep confirmation's expected-size disclosure.

Validation: G1 client/controls/settings and G5 in both feature modes; G8 exact
local admission/recovery once on final native inputs; G7/G9 cover initialization
in the native/installed application. Use synthetic roots/locks/barriers for fault
paths, with old active/backup/version sentinels, rather than repeated downloads.

### M5: Exact-artifact release evidence (U11)

Status: **complete**. G4 passed, and G9 verified
the current unsigned package and exact lifecycle evidence.

**U11 — cases 15, 19 and 23.** These cases belong to one evidence owner.

Owners: `apps/desktop/scripts/windows-release.mjs`, its Node tests,
`scripts/build-windows-release.ps1` and `package.json` only as required by the
existing evidence invocation. The ordinary journey producer is a consumer/control.

- Use the existing strict record comparison for ordinary `application`, `outcomes`
  and installer identity; compare array order as before. For installed binary,
  require exactly `fileName`, `sizeBytes`, `sha256`, correct primitive types and
  bounded valid values. Construct the public object field by field. Preserve
  the distinction between build executable and installed executable hashes.
- Attaching journey evidence must not downgrade measured signing/scan observations.
  Reverify Authenticode on the exact existing installer/build pair. Reuse a
  Defender observation only from a validated hash-bound receipt, or request an
  explicit actual scan through the existing wrapper. Never infer it from an
  unbound old JSON value or a free Boolean argument. If a same-artifact prior
  claim cannot be preserved truthfully, fail before replacing the evidence.
- Recheck artifact identity before atomic evidence replacement. A new artifact
  cannot inherit an old observation. Signature and antivirus status are independent,
  including unsigned-but-scanned builds. Keep existing output on invalid receipts,
  mixed/indeterminate signatures, scan errors, hash drift and write failures.
- Parameterize reordered keys, array-shaped hashes, missing/extra fields, wrong
  primitive types, canonical valid receipts, distinct installed/build hashes,
  signed/unsigned metadata combinations and exact-byte drift. These are new
  ordinary-journey assertions, not a repeat of the lifecycle-only FPA test.

Validation: G4 and affected static leaves; G9 once for current unsigned packaging
and exact-byte evidence attachment, reusing its built pair. Signing credentials,
new certificates, public publication and a new signed-release claim are outside
scope. Controlled signature/scan results test branching; report honestly if no
real signed artifact is available. Do not rerun a successful installer lifecycle
merely because a later metadata-only edit leaves its full input closure identical.

### M6: Combined acceptance and closeout

Status: **complete**. Final independent review approved the integrated patch.

- Freeze final runtime/test/documentation edits. Rebuild only invalidated artifacts.
  Renew the affected combined integration checks; reuse unchanged fresh unit gates
  only with recorded complete equivalence. No unconditional second execution of
  every focused suite is required.
- Obtain independent exact-patch `change_reviewer` approval (GPT-6 Astra high)
  under [agentic change review](../../development/agentic-change-review.md).
  The reviewer reads code and supplied host evidence without editing/running tests.
  Stop writing/Git mutations during review. Corrections renew affected gates and
  require a new immutable review ID; unavailable review/evidence blocks acceptance.
- Update behavior/developer documentation and necessary ADRs, verify the system
  diagram and M005 boundary, review the entire diff for unrelated changes and
  private data, and verify host restoration. Archive the plan only after every
  required gate and independent approval is complete. Later Git delivery requires
  its own execution-session authorization; this planning commit does not authorize it.

## Testing and benchmark strategy

### Evidence inspected and realistic reuse

These are **historical** results, not tests run for this plan. Original PN desktop,
EPUB, browser and harness JSON receipts and FPA final-02 Python/Rust receipts plus
the expanded runtime-closure record are present under their ignored evidence roots.
Their availability was inspected during planning. Full current source/environment
equivalence has not been established and is not inferred from availability.

A read-only Git comparison from PN's base
`6dd694b815bf52b34e4644487067ec2ba3a8956d` to the planning HEAD found no changes
under `packages`, `services`, native Rust, root scripts or root package/lock files.
This supports investigating those receipts as pre-edit baseline candidates;
it does **not** prove installed dependency/environment equivalence or validate
the forthcoming edits. PN renderer sources did change in that interval.

| Original evidence | Recorded result and identity | Reuse decision for this plan |
| --- | --- | --- |
| PN `desktop-final-07` plus `desktop-affected-final-08`, independently accepted by `PN-20261112-R3` | 458 desktop checks; final 381 reader/App/coordinator/integration checks renewed. [Bindings](../evidence/passage-navigation/acceptance-bindings.md). | Good control/baseline candidates. U1-U3 and new EPUB outputs invalidate their consuming tests. Do not carry the 458 total forward as current acceptance. |
| PN `epub-final-01` | 482 checks in nine suites; input hash `0D8B45786779D64C0D303BB97D19BDD858C6F7543F9BE0171CF127FC1867A537`; full 6,042-row JS dependency bracket. | Candidate pre-edit baseline only; U4-U6 invalidate affected results. Reuse fixtures and boundary assertions, then run the smaller appropriate selection including packer/projector gaps. |
| PN `browser-final-09` | 13 Chromium cases, exit 0. | U1-U3 plus EPUB outputs invalidate affected browser paths. Preserve selected PN/FPA/RCF controls; add only the new interaction gaps. |
| PN `harness-final-02` | 57 Node harness checks with complete dependency bracket. | Conditional reuse if harness, test/fixture/package imports, tools and environment are all independent and identical. New EPUB generated outputs are an explicit invalidation risk; rerun this small gate if independence is not provable. |
| PN `native-final-passage-a03` | Startup/WebView2 and Piper EN pass; restored host. Piper observed 17 transitions, 201 ms cancellation, no external requests or retained generated audio. | Historical baseline only. Changed renderer/preparation/native code invalidates current runtime acceptance. Reuse verified model payloads and build caches separately. No physical-audibility claim. |
| FPA `g3-final-02` / final Python static leaves; `FPA-INTEGRATED-CR-R1-20261111` | 333 tests in 18 suites; [renewed runtime capture](../evidence/five-pass-audit/runtime-evidence-renewal.md), G3 input hash `43CC633213DC42E660A1123B5744B5B56CA902BC479446B5B0D3DB98A90FB5C7`. | Prefer this over final-01, which lacked base Python standard-library identities. Reuse only unchanged independent leaves with full proof. The new quality/derive/screen gaps were not covered by this 333-test selection; run G3's targeted set, not the unrelated full old union. |
| FPA `g5-default-final-02`, `g5-locked-final-02`, final Rust static leaves | 78 pass in each feature mode, three special tests ignored per mode; full Cargo/tool/cache capture. Input hash `3F7B933F57E3710B3A2462A1AFAFE73D4CD7356E3BFA09ECA44A4A50F7962C4D`. | Baseline candidates only. U3 invalidates these gates. An ignored test is not a passing exact-local admission result. Use final-02, not incomplete earlier capture. |
| FPA G8 admission/recovery and final input projection | Exact v7 local admission passed; a separate outer-cleanup failure was diagnosed and restoration later verified. [Native ledger](../evidence/five-pass-audit/native-gates.md). | Reuse verified immutable nine-asset package/model inputs, not the runtime PASS after U3. Keep original failure and recovery records distinct. No fresh GPU inference or redownload follows just from this gate. |
| FPA G9 exact unsigned build/lifecycle | Build, lifecycle, restoration and package check pass; [package ledger](../evidence/five-pass-audit/package-gates.md). | The old installer is not this future source. Reuse verified core/dependency payloads and build caches. Bind lifecycle to the newly built bytes once; subsequent evidence attachment can reuse those same receipts without rebuilding/reinstalling if their inputs remain identical. |
| Earlier RAC/R8/SAF/CAF/DCR quality, recovery and release controls | Historical regression coverage described by the register. | Reuse test design/fixtures; no blanket behavioral PASS reuse. Case 15 specifically cannot reuse a lifecycle-key-order test as proof of ordinary-receipt behavior. |
| Frozen model-quality authorities/results and current Piper/v7 payload identities | Existing model-selection/support and artifact evidence, unchanged by this plan. | Preserve as historical authority and reverify payload hashes before use. Do not repeat listening evaluations, download weights or rerun Qwen/Chatterbox inference merely for maintainer arithmetic/IO fixes. They do not validate new normalization output or claim a new winner. |

Reuse an individual result only if its original immutable command/outcome and
execution-time inputs are retrievable and all consumed source, transitive imports,
tests, fixtures, configuration, locks, installed tools/dependencies, discovered
directory membership, generated bytes and relevant environment still match.
Treat Git HEAD as an input when a runner stamps/reads it. A matching manifest
filename or test count is insufficient. Record old receipt ID, compared closure,
excluded changed paths and justification in a new exact-patch review. Never edit
old hashes or supply missing execution-time identities retrospectively.

The feature/bug review policy governs acceptance; this is not a behavior-preserving
refactor campaign. Apply the complete-input proof from the
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
for reuse, without importing per-refactor-unit baseline bureaucracy. If proving
independence costs more than a short focused run, run that gate once. Missing
evidence means rerun the affected gate, not every historical gate.

### Selected gates and invalidation

All commands below run from repository root in **normal local PowerShell outside
the managed sandbox**. `pnpm.cmd` uses the pinned repository-compatible Node/pnpm
versions; use configured uv/Cargo environments. Commands are existing configured
scripts or their actual runner leaves with focused arguments. A new test pathname
is used only after its planned file is created; it is not a new invented command.

| Gate | Invariant / selection | When and reuse boundary |
| --- | --- | --- |
| G0 | `pnpm.cmd build:packages` | After EPUB edits before consumers; skip a duplicate when the already-required typecheck/native-harness command produces and verifies the same outputs. Outputs are preparation, not behavioral PASS. |
| G1 | Desktop Vitest files below | Run the relevant unit subset with new regressions and neighboring controls. Reuse final unchanged subsets; run affected integrated App/package-reader coverage after the last shared change. |
| G2 | EPUB Vitest files below | U4-U6 after edits; one union can cover their final state. Includes public APIs, frozen controls, work/cancellation/retention bounds. Changed normalizer/source/packer inputs invalidate all dependent results. |
| G3 | Model-free pytest files below | U7-U10; use per-unit selection, then only renew shared consumers invalidated later. No candidate interpreter/model launch. |
| G4 | `node --test apps/desktop/scripts/windows-release.node-test.mjs` | U11 after final release-owner edits. Old lifecycle-only key-order coverage is insufficient. Add wrapper/producer Node tests only if those owners change. |
| G5 | Both optional-package Rust commands below | U3 final native source, both default/release-locked behavior. Source, Cargo/features/build-script/core identity or tool drift invalidates. |
| G6 | Focused Chromium command below | New manual gestures, held placement, appearance callbacks, checked-profile click and confirmation recovery plus adjacent PN/RCF/FPA controls. Real input/geometry complements deterministic timing tests. |
| G7 | Native startup and Piper ES/EN commands below | One final default native build, two sequential language arms. Changed source/frontend/harness/core/host conditions invalidate; generated binary identities must match the arm. Include new normalization/preparation fixtures through existing scenario owners if current assertions cannot observe them. |
| G8 | `pnpm.cmd test:chatterbox:v7:local-admission` | Once after U3; exact installed manifest and native startup/recovery path. Reuse local verified assets. Admission is not inference or live-download reliability. |
| G9 | `pnpm.cmd package:windows:verified-core`; `pnpm.cmd package:windows:check`; `pnpm.cmd package:windows:lifecycle -Installer <absolute-new-installer> -LifecycleReceipt <new-run-directory/windows-lifecycle-receipt-v1.json>` | One final release-locked artifact and lifecycle for U3/U11. Record concrete arguments before launch. Use its existing exact pair/receipts for attachment; never rewrite historical tracked package evidence. |
| G10 | Existing `pnpm.cmd test:native-smoke-harness` and portfolio preflight test leaves | Conditional reuse under complete proof; run only invalidated harness leaves, including any new scenario coverage. Complete the existing configured portfolio preflight requirements before G7. |
| G11 | `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript`; Python `format:check:python`, `lint:python`, `typecheck:python`; Rust `format:check:rust`, `lint:rust` | Each affected language once on final inputs; scoped configured tool leaves can catch errors earlier and be reused only for identical scope. Rust Clippy includes both configured modes. No broad aggregate that repeats identical leaves by default. |
| G12 | `pnpm.cmd check:evidence`; documentation/link/scope inspection and independent change review | Final docs/evidence/diff, restoration and exact-patch acceptance. Record all commands actually executed and any explicitly reused receipts. No remote checks or Git publication is implied. |

G1 selectable final affected files (use only the unit subset until integration):

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/integration/package-reader-matrix.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/reader/active-visual-locator.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts src/settings/narration-settings-actions.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/OptionalChatterboxControls.test.tsx src/App.test.tsx
```

G2 selectable affected union:

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/navigation/navigation-document.test.ts src/public/open-epub-publication.test.ts src/integration/ingestion-matrix.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source.test.ts src/narration/narration-segment-packer.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
```

G3 selectable affected union. The existing quality suite exercises the
CPU-fallback derivation boundary:

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_cli.py services/tts/tests/test_benchmark_preflight.py services/tts/tests/test_benchmark_quality.py services/tts/tests/test_benchmark_corrective_v12.py services/tts/tests/test_benchmark_v12_authority.py services/tts/tests/test_customvoice_screen.py services/tts/tests/test_customvoice_screen_authority.py
```

G5:

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
```

G6 uses `CFR-02`, `CFR-03`, `CFR-08`, `CFR-12`, `CFR-16`, `CFR-17` prefixes
for the planned browser regressions. Record collected case names so no empty
filter is treated as success. Extend existing fixtures and these files:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep 'CFR-|PN-|RCF-17|final RCF-16|BNC-01|DCR-03/23|EFC-07|CAF-2|five-pass 5[.]1|preserves one canonical passage'
```

G7, after the existing portfolio's selected deterministic preflight leaves and
cheap host/model/firewall/resource checks:

```powershell
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es --preflight-only
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en --preflight-only
pnpm.cmd test:native-startup
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en
```

The configured G7 preflight includes existing Product/Adaptive controls, Reader,
native-WebDriver and portfolio Node suites. Reuse an identical already-executed
leaf only with complete proof; run the exclusive `AdaptivePreparationControls`
and Node leaves when absent. Do not bypass preflight or change its assertions to
save a run. Native, package, filesystem-fault and model stages have one host owner.

No automatic full `check` plus `check:portable`, six-profile GPU portfolio,
speaker listening evaluation or broad performance campaign is selected. Existing
deterministic bounds plus the selected native measurements cover the proposed
bounded changes. If implementation changes an engine/runtime, resource ceiling,
protocol, installer topology, or the bounded work/geometry model beyond this
plan, expand the affected gate explicitly before accepting it. Required CI remains
required if a later authorized PR is created; local evidence does not replace it.

### Avoiding duplicate work

Use parameterized regressions for related cases and reuse the existing real
integration harnesses. Prefer one final test invocation per shared owner over
one complete suite per finding. Do not run the historical 18-file Python union
when only the eight selected current files are affected. Do not repeat a gate
after documentation-only edits unless documentation is one of its inputs.
Prepared package/model/cache reuse is separate from reusing a runtime result.

Before costly work, verify pinned tools, offline assets, disk space, writable
scratch paths, drivers and required permissions. Capture process IDs with creation
time/executable identity and original resource/firewall state before mutation.
Use existing repository runners; record cleanup separately from behavior. A
successful canonical gate with a failed wrapper cleanup needs recovery, not an
automatic rerun of the successful workload.

Retain failures with classification: product, pre-existing, environment or
harness/cleanup. Allow at most one infrastructure retry per failed stage after
a concrete changed condition; a second failure requires diagnosis/replanning.
Do not retry until green or broaden test scope without a reason.

## Risks and rollback

- Reader fixes can resurrect playback, save unheard locations or accept stale
  placement if visual settlement is conflated with restart permission. Keep
  publication/revision controls and case 1's deliberate recovery authority.
- Optional startup cleanup can delete live or recoverable content. Its ownership,
  lock ordering, path-chain checks and staging-only target are acceptance criteria;
  preserve ambiguous residue and surface a retry instead of guessing.
- Normalization can change meaning or offsets. Conservative context, unchanged
  frozen controls, both endpoint protection and public source-range tests bound
  the change. U6 must prove progress without enlarging work or memory ceilings.
- Moving cleanup boundaries can retain private benchmark files or remove prior
  work. Use exclusive ownership, synthetic sentinels and explicit retry records;
  pending cleanup is a failure, not a success claim. Do not promise power-loss or
  concurrent-session guarantees beyond the implemented contract.
- Screen rounding fixes can reinterpret frozen authority. Only the successor
  path uses exact comparisons; no historical winner is replaced.
- Release metadata can overstate signing/scan/lifecycle status. Accept only
  exact-byte evidence, preserve failures atomically, keep build/installed hashes
  distinct and leave public-release authorization external.

Keep patches small by unit and avoid unrelated refactors. If a unit's approach
cannot satisfy its controls, revise that unit before continuing; do not weaken
the controls. Roll back only task-owned changes with explicit path/identity
review, never blanket reset/clean or deletion of user sessions. Restore declared
host resources after every outcome. Unverified restoration blocks acceptance.

## Progress log

- 2026-11-12: Reviewed the prior five searches, 22 case investigations and deeper
  code/history analysis; retained 24 numbered dispositions including two additions.
- 2026-11-12: Inspected case 7's producer, both measurement consumers, official-only
  consumers, existing tests and prior FPA exclusion. Selected purpose-based exit
  success, keeping official/promotion eligibility unchanged.
- 2026-11-12: Inspected current PN/FPA evidence and original receipt availability.
  Distinguished fresh final-02 runtime captures from incomplete earlier captures;
  recorded conditional reuse, required renewal and artifact-only reuse.
- 2026-11-12: Created the planning branch from clean `693b0fc` and prepared this
  plan and maintained index entries. Documentation commit is the only delivery.
- Execution started from the clean planning commit. U7–U10 have implementation
  and host regression evidence. See the execution ledger for exact outcomes and
  open checks.
- U1–U6 and U11 are implemented. The reader and benchmark authority boundaries
  remain local. The canonical system diagram and M005 boundary still describe
  the implemented architecture.

## Discoveries and decisions

1. Case 7 implements the user's delegated decision. Exit status follows the
   requested purpose, and official eligibility remains a separate receipt field.
2. Case 1 is intentional and excluded. Case 15's earlier apparent closure belongs
   to a different receipt validator. Case 2 is a residual regression in the recent
   PN settlement change; fixing it must preserve PN's other protections.
3. Case 5 requires separate startup ownership; ordinary polling remains read-only.
   A Check-only fix would leave the release authority's restart-cleanup requirement
   unresolved. Recovery of `.previous` is separate from orphan staging cleanup.
4. Case 11 uses an explicit successor screen authority, not an epsilon or rewrite
   of historical v2. No new model-quality evaluation is part of implementing it.
5. Cases 23 and 24 are included with their actual impact and controls. No unobserved
   leak, signed-release incident or false CLI success is claimed.
6. Many previous fixes protect adjacent triggers. Reuse their assertions and
   fixtures; do not remove them to make a new regression pass.
7. Minimize repeated work through shared final-input test selections and verified
   artifact reuse. This planning analysis grants no blanket current PASS and
   cannot manufacture missing original input/environment evidence.

## Final validation results

Independent review **APPROVE**, `CFR-CR-FINAL-R03-20261113`, covers the
integrated implementation and selected host validation. The
[review report](../evidence/chat-findings-recovery/review-final-r03.md)
records the exact reviewed identities. The execution ledger records commands,
run receipts, affected inputs and restoration. The
[native and package summary](../evidence/chat-findings-recovery/native-package-summary.md)
records the current G7–G9 evidence and the separate G8 scratch recovery.
Case 1 retains its intentional behavior. The other 23 cases are implemented.
