# Passage navigation: minimal corrections and selective validation

## Goal

Make Previous/Next narration passage follow proven consecutive prepared segments,
and prevent reader placement from silently replacing an explicit passage target.
Resolve the related failure/visible-position findings only within the evidence
and boundaries defined below.

Status: **M0–M3 implemented and host-validated**. Final exact-patch acceptance is
recorded in [PN-20261112-R3](../evidence/passage-navigation/review-r3.md).
On 2026-11-12 the user explicitly
authorized M0–M3, corrections, host validation and independent review. Keep all
implementation changes uncommitted; no push or PR is authorized. The planning
commit is `6dd694b815bf52b34e4644487067ec2ba3a8956d`.

Planning baseline: `main`,
`a8a61df1417e476daada7795809b5153965a4a54`, clean worktree/index before planning.
Planning branch: `codex/passage-navigation-execplan`.
This descriptive plan spans existing reader placement, synchronized narration and
position persistence responsibilities; it does not introduce a new milestone.

## User-visible outcome

- Next moves to the immediate known narratable successor; Previous applies the
  same continuity rule in reverse. A distant remembered passage is never used
  as a substitute for an unknown neighbor.
- An unknown neighbor leaves that direction disabled with concise explanation.
  Unknown is not reported as the beginning/end of the book. After paused
  navigation, Resume is the existing way to prepare further passages; this fix
  does not start preparation or inference merely to enable a navigation button.
- A successful explicit passage move selects the requested stable segment. It
  restarts only when playback intent and current admission permit it. A paused
  move remains paused and Resume starts the selected segment.
- Failed or approximate placement does not silently replay an earlier paragraph
  as a successful Next. It releases pending navigation, explains the failure and
  does not autoplay or replace the last admitted checkpoint with an unconfirmed
  target. A subsequent explicit action can recover.
- Initial saved-position fallback, nearest-valid chapter/TOC recovery, passive
  visual inspection and confirmed heard progress retain their distinct policies.

## Current state

The following table records the pre-implementation static investigation. Execution
reproductions and current results are recorded below and in the execution ledger.
The earlier broad report was re-evaluated against code and accepted product policies.

| ID    | Evidence and consequence                                                                                                                                                                                                                                                                                                                                                                 | Disposition for execution                                                                                                                                                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PN-01 | `product-narration-coordinator.ts::#requestBoundaryNavigation` selects `currentIndex +/- 1` in sorted `#knownBoundaries`. Only Previous calls `#hasKnownPredecessor`; `canGoNext` also checks only list position. History survives same-context restarts. Disjoint early/later windows can therefore skip unprepared content, including during preparing or ownerless paused navigation. | Required correction. Prove the missing Next case before editing production. Reuse the recorded preparation/FIFO links in both directions.                                                                                                                                                                             |
| PN-02 | `ReaderPublication.tsx` replaces an unplaceable interior target with the block start, then calls ordinary settlement. `App.handleSettledLocatorChange` forwards that location to `settleExternalNavigation`, which overwrites `pending.target`. The VCA-09 reader test currently expects this fallback callback.                                                                         | Required integrated reproduction and correction for explicit Previous/Next. Preserve truthful visual fallback, but stop treating a different segment as successful relative navigation. Missing geometry is a controlled condition until observed on a real host.                                                     |
| PN-03 | `runProgrammaticNavigation` treats unchanged navigation revision and invalidation rejection as settlement of the old locator. The unavailable-target test uses a fake resolver that throws for a missing spine; production `resolvePublicationLocator` generally recovers that same-book locator instead.                                                                                | Correct result semantics as part of PN-02, with valid no-op/recovery controls. Do not claim that the synthetic missing-spine failure is a naturally reachable Next defect. Record actual production reachability or classify a fault-injection control explicitly.                                                    |
| PN-04 | Audible start assigns `#visibleLocator` before placement; the highlight controller can settle without usable geometry or after exhausting follow corrections. Its consumer publishes that locator as visual. However, completion advancing the internal projection, and visual inspection differing from narration, are intentional.                                                     | Conditional narrow correction. First prove an incorrect ordinary Stop/Play target through real reader/coordinator composition with controlled failed follow. If no user-visible violation remains after PN-02, retain the control and record already-correct/unconfirmed; do not rewrite completion or follow policy. |

### Relevant earlier corrections

- [RNB-04 / PR #264](../completed/reader-narration-bugfixes.md): retains the
  current/next window beyond 64 prepared segments; does not prove adjacency.
- [B03/B04 / PR #266](../completed/reader-narration-acquisition-bugfixes.md):
  segmentation-context invalidation and unavailable oversized-chapter handling.
- [VCA-06/09 / PR #283](../completed/verified-chat-audit-corrections.md): paused
  navigation releases old owners; interior placement uses actual range geometry.
- [PSC / PR #291](../completed/minimal-playback-state-corrections.md),
  [VUC-01 / PR #294](../completed/visible-locator-unicode-compound-corrections.md)
  and [BNC-01 / PR #296](../completed/narration-boundary-navigation-corrections.md):
  early/rejected Resume, settled follow before fresh Play, rejected automatic
  restart and failed containment.
- [RCF-06/16/17 / PR #304](../completed/revalidated-chat-findings-minimal-corrections.md):
  explicit predecessor links and preservation of newer manual inspection. The
  actual `7820db6` diff adds the adjacency guard only for Previous; later
  corrections did not revert it.
- [CAF R4.1](../completed/chat-audit-minimal-follow-up.md),
  [CCF C02](../completed/confirmed-chat-findings-minimal-corrections.md) and
  [RPI-01](../completed/reader-position-and-image-lifecycle.md): initial visual
  fallback and its narration handoff must not destroy the precise checkpoint.
- [Five-pass 1.1/5.1 / PR #312](../completed/five-pass-audit-revalidation-and-corrections.md):
  superseding chapter identity before delayed request delivery, and provenance
  of automatic scrolls arriving after Stop. Preserve these regressions.

## Scope and non-goals

Use two sequential implementation units in one integration batch. They share
the coordinator and tests; do not accept or commit a partial behavioral patch
while required combined gates remain pending.

1. **Neighbor selection:** coordinator and existing tests; compact narration
   controls and their test only for the unknown-neighbor explanation.
2. **Placement result and target ownership:** reader navigation/result types,
   ReaderPublication, App and coordinator, with their existing tests. PN-03 is
   part of this same outcome contract. PN-04 adds the highlight owner only if
   the bounded reproduction establishes a remaining defect.

Keep these changes inside the current desktop owners. Reuse the bounded edge
list, current navigation revisions and cancellation mechanism. No general graph
library, second navigation coordinator, parallel preparation queue or new
position store is needed. Do not refactor unrelated large methods.

Out of scope: forward discovery while paused, reverse preparation, a whole-book
segment index, larger cache limits, changed segmentation/normalization, shared
locator or IPC schemas, Rust/Python runtime changes, DSP/rate changes, model or
dependency updates, installer/acquisition work, image lifecycle repairs and
historical C15 geometry claims. A newly demonstrated need to change one of these
boundaries requires a revised scope and gate selection before its production edit.

## Relevant files and documentation

Read the current files, callers and named tests before implementation:

- `apps/desktop/src/tts/product-narration-coordinator.ts` and `.test.ts`:
  retained ranges/edges, segmentation context, navigation, admission and restart.
- `apps/desktop/src/tts/ProductNarrationControls.tsx` and `.test.tsx`:
  disabled directions and accessible status.
- `apps/desktop/src/reader/reader-navigation.ts`, exercised by ReaderPublication
  tests and `apps/desktop/src/integration/package-reader-matrix.test.tsx`:
  canonical resolution, chapter recovery and desktop-local settlement types.
- `apps/desktop/src/reader/ReaderPublication.tsx` and `.test.tsx`,
  `apps/desktop/src/App.tsx` and `.test.tsx`: request/placement/result wiring,
  initial fallback and persistence callers. Inspect/update the existing manual
  test narration source only when the local callback type changes.
- `apps/desktop/src/reader/reader-reflow-restoration.ts` and `.test.ts`,
  `segment-highlight-controller.ts` and `.test.tsx`,
  `active-visual-locator.ts` and `.test.ts`: supporting placement/follow owners.
  Production edits to these are conditional on an attributed gap; do not replace
  their existing bounded scheduling and cancellation mechanisms.
- `apps/desktop/src/persistence/narration-position-save-bridge.ts`,
  `reader-position-save-coordinator.ts` and their tests: observe real admitted
  writes through existing APIs; production edits require evidence that correcting
  the caller cannot satisfy the invariant.
- Existing browser specs `reader-narration-bugfixes.smoke.spec.ts`,
  `reader-reflow-restoration.smoke.spec.ts`, `reader-image-lifecycle.smoke.spec.ts`
  and fixtures under `apps/desktop/tests/`.
- Existing native scenarios under `apps/desktop/scripts/native-smoke/`,
  `native-smoke.node-test.mjs` and `bilingual-portfolio-host.mjs`. Extend an
  existing scenario only where its observations cannot cover the new invariant.
- `packages/epub/src/locator/locator-resolver.ts`,
  `packages/epub/src/narration/narration-preparation.ts` and
  `packages/epub/src/resource/opened-publication.ts`: read-only sources of stable
  canonical ranges and genuine recovery behavior.

Authorities: [documentation index](../../README.md), [roadmap](../roadmap.md),
[product controls](../../product/reader-settings-and-playback-controls.md),
[system diagram](../../architecture/system-diagram.md),
[overview](../../architecture/overview.md),
[synchronization authority](../../architecture/synchronization-authority-v1.md),
[ADR-0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
[ADR-0070](../../architecture/decisions/ADR-0070-explicit-placement-and-recovery-boundaries.md),
[ADR-0071](../../architecture/decisions/ADR-0071-reader-checkpoint-and-image-lifetime.md),
[change review](../../development/agentic-change-review.md) and
[evidence retention](../../development/evidence-retention.md).
If preparation itself must change, first read the completed
[M005 plan](../completed/M005-narration-text-preparation.md), recheck its roadmap
status and expand the plan before editing that boundary.

## Architecture and constraints

### One neighbor decision

Have one small internal resolver supply both button eligibility and the action's
target. Use the audible range when owned, otherwise the settled explicit/current
canonical target. Resolve a predecessor/successor only through links witnessed
in a continuous preparation chain or the existing FIFO for the same publication
and segmentation context. Preserve the 64-range bound and retire unusable edges
with their ranges/context. Do not infer links across restarts or from matching
endpoint offsets: legitimately skipped non-narrable content can separate them.

Distinguish a known neighbor, unknown continuity and a proven terminal boundary
where the existing preparation result actually supplies that knowledge. Lack of
cache evidence alone cannot establish end-of-book. Do not retain book text or
prepare/synthesize new content just to discover a neighbor in this patch.

### One attributable outcome per request

Preserve this sequence: admit explicit intent, invalidate old audio identity,
contain old work, place the canonical target, settle the matching request, then
restart only under its still-valid intent and admission. Reuse an existing
revision tied to the publication lifetime through request and response; do not
assume the reader's and narrator's separate counters already have equal values.

The local result must distinguish success, approximate visual placement,
unavailable/rejected placement and supersession. Keep the requested canonical
passage separate from the actual visual fallback. A relative passage succeeds
only at its requested stable segment; initial restore and chapter recovery may
use their documented canonical recovery policies. A duplicate/obsolete response
cannot consume a newer request, release its busy state, start audio or save a
location. Route completion once through the existing owners rather than adding
another callback that duplicates the two current settlement publications.

Successful placement does not require perfect scroll alignment. An exact target
already visible near the document bottom is valid despite clamped scrolling.
For a failed relative placement, finish bounded cleanup, release busy/sampling
ownership, make narration inactive and show concise feedback. Preserve the last
admitted checkpoint. A measured visual fallback may support a later explicit
Play, but does not automatically satisfy or restart the failed Next/Previous.
When no readable placement is confirmed, Play remains unavailable until a valid
placement. Never leave a permanent busy state or automatically retry indefinitely.

### Preserve established authorities

Stop, book replacement, configuration invalidation and a newer explicit request
supersede older restart eligibility. Preserve paused intent on successful moves;
failed containment stays failed and cannot masquerade as a successful move.
Keep initial fallback, actual passive inspection and latest-heard persistence
separate. Do not remove segment-completion projection or claim word-level timing.
For PN-04, a failed follow may retain audible/highlight projection without claiming
an unmeasured new visual location; verify the actual subsequent Play target.

All EPUB content stays local, inference stays local, PCM remains ephemeral,
queues/history remain bounded and cancellation remains identity-first. Add no
book text/audio to logs. These are internal desktop changes; verify the system
diagram at closeout and update it only if an actual architectural boundary changes.

## Milestones

### M0: Freeze scope, baseline reuse and discriminating reproductions

Status: complete; current evidence and independent review are linked below.

Before any test/source edit, capture current HEAD, clean/dirty paths, source and
tool identities. Reassess the original evidence below and record accepted reuse
or a precise missing input. An unchanged prior baseline need not be rerun merely
to produce a new green log. Add only missing regressions and run their focused
RED once on unmodified production; existing already-correct controls need no
manufactured RED.

- PN-01: construct separated early/later preparation windows with a genuine
  unprepared middle, revisit the early tail in paused/preparing states and request
  Next. Preserve valid `batch`/continuation semantics; do not fake end-of-book to
  create the gap. Include an ordinary continuous chain and the previous-direction
  control, eviction beyond 64, profile/language replacement and a real terminal
  boundary. Reuse RNB/B03/RCF fixtures and existing cases instead of duplicating them.
- PN-02: use mounted ReaderPublication with the real coordinator/App handoff and
  save owner. Target an interior segment, control failed range placement, then
  inspect the actual next preparation/confirmed segment and admitted writes.
  Cover playing/paused, exact-visible but clamped, unavailable, initial fallback
  and reflow during placement. The last cases preserve VCA/RPI behavior.
- PN-03: distinguish real nearest-valid resolution, a valid no-op and a genuine
  rejected outcome. Any injected resolver/cleanup failure is labeled as such.
  A synthetic callback expectation alone is insufficient to claim production
  reachability. Fold its outcome checks into PN-02's composition scenario.
- PN-04: one composition control for failed follow followed by Stop/ordinary Play,
  alongside successful Resume-follow and final-completion/manual-inspection
  controls. Record confirmed defect, covered by PN-02, or unconfirmed with reason.

Use new test names prefixed `PN-` only for the identified missing assertions.
Existing synthetic EPUB opening/preparation can provide real canonical ranges;
mock local audio timing, not the reader's successful navigation acknowledgement.
Do not execute a whole-repository baseline.

### M1: Correct neighbor selection and unknown-direction feedback

Status: complete; combined host evidence and final review are linked below.

Implement PN-01 in the existing coordinator and compact controls. One resolver
must govern both eligibility and execution, with bounded retained links. Keep
unknown directions disabled and explain that the neighboring passage is unavailable;
do not promise background progress after paused navigation. Preserve the
documented Resume path and separate actual completion from missing history.

Run focused new cases after the edit; if M2 immediately follows, the final union
can supply the full existing regression green for both units. M1 requires combined
integration acceptance in M3, because M2 touches the same source.

### M2: Correct placement outcomes and conditional visual handoff

Status: complete; PN-04 was confirmed and narrowly corrected.

Implement the local matching outcome contract for PN-02/03 through the existing
reader/App/coordinator boundary. Avoid replacing a relative target with an
approximate position. Release rejected/superseded work exactly once, preserve
containment failures and ensure a later valid explicit action recovers.

Apply PN-04 only for an attributed remaining violation from M0; keep its existing
intentional completion/manual-inspection cases. Use the least changed ownership
boundary that makes the user-visible composition correct. Do not add a general
state-machine framework or rewrite highlighting/segmentation.

Update relevant product/synchronization documentation and add the next available
ADR for the durable symmetric-neighbor and explicit-placement policy. Do not
rewrite completed plans or broaden the implementation claims of M005. Update
the system diagram only if its ownership/data-flow description actually changes.

### M3: Combined acceptance and independent review

Status: host gates and restoration complete; the separate R3 report records
final exact-patch acceptance after R2's documentation-only correction.

Run the final selected gates once after the last relevant edit. Extend existing
browser/native journeys only for uncovered observations; keep synthetic controlled
failures distinct from actual WebView2 geometry and real Piper rendering.
Reuse final deterministic receipts for overlapping preflight leaves only with
the same complete inputs and independently assessed scope.

Delegate one independent `change_reviewer` (GPT-6 Astra high), per the project
workflow, with exact current patch identities, requirements, attributed RED/GREEN,
reuse decisions and host cleanup. The reviewer does not run tests or edit source.
Missing evidence/reviewer blocks acceptance. Resolve actionable findings and
obtain APPROVE for the exact current patch, rerunning only invalidated gates.
This documentation-only planning commit does not require that behavioral review.

## Testing and benchmark strategy

### Evidence already inspected and planning-only comparison

The original [FPA integrated review](../evidence/five-pass-audit/review-INTEGRATED-R1.md)
is `FPA-INTEGRATED-CR-R1-20261111`. The
[combined receipts](../evidence/five-pass-audit/combined-gates.md),
[browser receipt](../evidence/five-pass-audit/g6-browser.md) and
[final equivalence record](../evidence/five-pass-audit/final-evidence-equivalence.md)
name original normal-host results and ignored execution-time manifests.

On 2026-11-12, a read-only local PowerShell comparison against the planning base
found all recorded rows identical, before/after pairs identical, no discovered
source membership changes and the same 251 EPUB/shared output files. It did not
run a test, rebuild outputs, start a browser or change a historical receipt.

| Original gate / local receipt stem      | Historical result                | Matching recorded inputs | Source members | Use for this plan                                                                                       |
| --------------------------------------- | -------------------------------- | ------------------------ | -------------- | ------------------------------------------------------------------------------------------------------- |
| G1 `g1-final-01.log`                    | 746 tests, 19 suites             | 614/614                  | 360            | Candidate pre-change baseline. Planned desktop/test edits invalidate its final behavioral acceptance.   |
| G2 `g2-final-01.log`                    | 482 tests, 9 suites              | 457/457                  | 203            | Candidate unchanged EPUB/shared result; desktop-only changes do not enter this recorded source closure. |
| G6 `g6-final-02.log`                    | 71 Chromium cases                | 633/633                  | 368            | Existing scenarios/earlier baseline only. Re-run selected affected journeys on the changed renderer.    |
| G11 `g11-typescript-types-final-01.log` | shared/EPUB/desktop types passed | 637/637                  | 368            | Earlier baseline only; changed local result types require current desktop type checks.                  |

Stems above are under ignored `tmp/evidence/five-pass-audit/`; input files append
`.inputs.before` and `.inputs.after` to the log stem. Original manifest SHA-256:

| Gate | Manifest SHA-256                                                   |
| ---- | ------------------------------------------------------------------ |
| G1   | `F498DA166148C254CBFBE58E660939C0D9AC9AA8E5FE5FA27A898957D2F17905` |
| G2   | `D0426E619F16D2E91FE9A23DB7CF7CB19D5D2F0410A9923BAD2D7BB64CD212DB` |
| G6   | `757372AE5F036A76F9A0245945B6F65A343994CADD1981C7E9822D357DB2D5A5` |
| G11  | `00DBD9D75B21E05B28EEC1BCACB425F26C3057CFAB3D981538904457C9BBA2F2` |

The retrievable G2 log hash is
`C9128B3568396BBC5A1661B747A73CE7AD2FCE31E7F9D599D1C6C7B9DCAB300D`.
Recorded environment: PowerShell 7.6.9, Node 24.18.0, pnpm 11.15.1,
Vitest 5.0.5; G6 used Playwright 1.64.1/Chromium 156.0.8078.4.
Matching recorded files does not by itself requalify the currently resolved
toolchain, every transitive dependency or browser/host state. Before claiming
reuse, the executor and independent reviewer must verify the original complete
input closure, source/output membership and relevant environment, including the
actual selected executables. Unknown/missing proof requires the affected gate.
This plan accepts no historical PASS as proof of its unimplemented corrections.

### What to reuse, rerun or omit

- Reuse existing regression cases, fixtures, fault-injection seams and attribution
  from RCF/VCA/B03/B04/PSC/VUC/BNC/FPA/RPI. Extend their missing observable assertions.
  A previously passing test with the old fallback expectation is not the oracle
  for the new explicit-passage policy; revise only that expectation and retain
  initial restore, valid recovery and terminal-projection controls.
- Reuse G1 as the unchanged baseline only after its original identities and
  environment are established before edits. Run new PN RED cases, not the old
  746-test baseline again. Run the smaller final desktop union below on new code.
- G2 is the strongest behavioral reuse candidate: no planned EPUB/shared source,
  test, fixture, config or lock change consumes it. If the proof holds, do not
  rerun its nine suites. If independence cannot be proved, run its exact original
  nine-suite command from `combined-gates.md`; do not claim inferred equivalence.
- The 251 matching package outputs are artifact-reuse candidates separately from
  G2's test result. Verify build inputs/tool identity and output membership before
  omitting `build:packages`; rebuild once if that proof is unavailable.
- Historical desktop bundles and native executables cannot validate the changed
  renderer. Build the current desktop once for packaged acceptance. Reuse verified
  installed Piper/model payloads and build caches; do not reacquire dependencies
  or models solely for this desktop patch.
- [FPA native A05](../evidence/five-pass-audit/native-gates.md) passed startup,
  ES/EN Piper and native resource checks. The later
  [PR #312 follow-up](../evidence/five-pass-audit/ci-follow-up.md) changed the image
  harness and passed local startup/57 harness tests. Use the current harness;
  neither older executable nor receipt is acceptance for the new navigation.
- Python/Rust suites, optional Chatterbox admission, ES/GPU portfolios, installer
  lifecycle and full performance matrices are outside this bounded change. Their
  omission is scope selection, not a claim of reused current PASS. Reopen the
  relevant gate if runtime, preparation, packaging, retention or scheduling scope
  expands. Do not run `check`/`check:portable` in addition to selected local leaves;
  CI requirements remain independently applicable when later delivery is authorized.

### Gate selection and exact existing commands

The selected commands run from repository root in normal local PowerShell
outside the managed sandbox. Select the repository's Node version (`.nvmrc`) and
pnpm 11.15.1 using installed tools; verify nested resolution before running gates.
Do not copy a stale ignored PATH helper without checking its contents. Capture
source/transitive inputs, tests, fixture membership, config, locks, selected
tool/runtime binaries and generated outputs before and after each gate.

| Gate   | Invariant / timing                                           | Execution and invalidation                                                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G0     | Baseline/result/artifact reuse, before edits                 | Read original receipts and compare the complete closures above. Any relevant source, membership, output or environment drift invalidates that reuse. If needed, `pnpm.cmd build:packages` once before consumers.                                     |
| G1-RED | Attributed missing behavior, M0                              | Focused `PN-` cases on original production, command below. Record intentional failure and its cause; tests that confirm intentional behavior may pass.                                                                                               |
| G1     | Final desktop state, cancellation, placement and persistence | One selected ten-suite Vitest union below. M1/M2 and test/harness changes invalidate it. It also supplies overlapping controls/Reader preflight coverage, with attributable suite results.                                                           |
| G2     | Current format/lint/types, before expensive gates            | Scoped Prettier/ESLint on the closed changed TS/TSX/MJS list; one desktop typecheck. Expand to other packages only if their inputs/contracts change.                                                                                                 |
| G3     | Real Chromium placement and integrated navigation            | One selected browser invocation below, including new PN cases and coupled controls. Browser/source/fixture changes invalidate it. Vite is built by the existing Playwright webServer.                                                                |
| G4     | Current packaged WebView2 geometry/lifecycle                 | One `pnpm.cmd test:native-startup` after cheap gates. It performs the current Tauri build and model-free smoke. Extend the existing relevant scenario only if it lacks an assertion for the new target/placement outcome; no standalone new harness. |
| G5     | Real-engine passage restart, containment and cleanup         | One existing Piper EN portfolio arm below using the same G4 build. Its existing speed checks remain intact; do not add another language/model matrix. Renderer/artifact/profile/driver drift requires renewed affected native evidence.              |
| G6     | Documents, scoped diff, independent current-patch acceptance | `pnpm.cmd check:evidence`, `git diff --check`, local-link/manual policy review, then the exact change-review workflow. Gate results and immutable reuse decisions must be attributable; incomplete host restoration blocks acceptance.               |

Focused new regressions, with paths limited further when a case has one owner:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/reader/ReaderPublication.test.tsx src/App.test.tsx -t 'PN-'
```

Final desktop union, once after both units:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/integration/package-reader-matrix.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/reader/active-visual-locator.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts src/App.test.tsx
pnpm.cmd --filter @voxleaf/desktop run typecheck
```

Use the existing `pnpm.cmd exec prettier --check` and `pnpm.cmd exec eslint`
with the exact changed source/test file list captured in M0, including conditional
files and native MJS if edited. Record expanded commands, not a placeholder or a
claim that global lint/format ran. Markdown may be checked with the same configured
Prettier tool on its explicit list. No whole-tree format mutation is authorized.

Final Chromium selection uses existing test names plus planned `PN-` additions:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts reader-image-lifecycle.smoke.spec.ts --grep 'PN-|five-pass 1[.]1|five-pass 5[.]1|VCA-06/09|BNC-01|RCF-17|final RCF-16|DCR-03/23|RPI-01/C1'
```

Confirm the matched case list and retain its output; no-test selection is failure.
Prefer adding assertions to an existing PN journey over multiple duplicate browser
cases. One fixture must use real EPUB preparation and real reader callbacks to
verify the selected/first confirmed source range. A separate controlled geometry
arm may reproduce unavailability; it does not prove natural failure frequency.

Before costly native preparation, verify available exact Piper EN payloads,
matching WebView2/EdgeDriver, disk space and owned process/firewall readiness.
The existing selected preflight is:

```powershell
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en --preflight-only
pnpm.cmd test:native-startup
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en
```

The portfolio command is a configured wrapper leaf already used in prior host
receipts, not the four-arm `test:tts:reader-corrections-host` aggregate. Its present
native scenario already performs a Next seek and cancellation. Confirm the first
new range/visible target observation is sufficient for this patch; if not, add the
smallest assertion to that existing scenario before the final run. If a native
harness changes, run its existing focused Node regressions before G4; use
`pnpm.cmd test:native-smoke-harness` once for a changed shared native-smoke helper.
Do not additionally run that suite when the harness is unchanged and its current
receipt is independently reusable.

No separate performance benchmark is selected while history, scheduling and
allocation bounds stay unchanged and current deterministic/native assertions
cover them. New loops, scheduling behavior or retention beyond the specified
owners require a revised gate decision, including `pnpm.cmd benchmark:reader`
and/or `pnpm.cmd benchmark:reader:native` when their invariant is affected.

### Acceptance assertions and execution economy

- With a stable context, each enabled relative action uses a witnessed immediate
  edge. A-to-C across unknown B is rejected in both UI and action; bounded window
  eviction never fabricates adjacency. Continuous within/cross-chapter controls
  include non-narrable gaps and exact book ends.
- A successful requested segment equals the first prepared/confirmed segment of
  its new run; a paused move produces no new audio and Resume uses that target.
- Exact-visible/clamped placement succeeds. Approximate/unavailable/rejected
  placement cannot claim success, start earlier audio or overwrite admitted
  progress. Initial restoration and valid chapter recovery retain their behavior.
- Late responses, Stop, replacement and failed containment cannot restart old
  intent. Match identities through the actual reader handoff; a test that merely
  calls `settleExternalNavigation` with a chosen success is not enough.
- Preserve manual inspection, final heard completion, initial fallback checkpoint,
  visual/Resume separation and the FPA delayed-scroll/delayed-request controls.

Do not repeat a gate after a pass without changed inputs, an unresolved concern
or a new failure. Share the final union across both units and reuse attributable
preflight leaves rather than rerunning the same suites under another wrapper.
Keep RED, corrections, final GREEN and reused results explicitly separate.

Before any host mutation, journal owned processes (PID, creation time, executable),
firewall rules and held/restored resources. Verify cleanup on success, failure and
interruption. Preserve failures with a classification. Permit one infrastructure
retry per failed stage only after identifying a concrete changed condition; a
second failure requires diagnosis/replanning. Do not increase timeouts or repeat
until green. Keep raw captures in ignored `tmp/evidence/passage-navigation/` and
concise immutable receipts under `docs/plans/evidence/passage-navigation/` during
execution, without user paths, book text, audio or private resource inventories.

## Risks and rollback

- A symmetric guard can make a formerly enabled but unsafe direction unavailable.
  Explain unknown continuity honestly; do not add an unrequested preparation
  mechanism or promise it will become ready while paused.
- A global exact-placement rule would regress initial fallback, chapter recovery
  and valid bottom-of-document placement. Scope strict segment matching to
  relative passage navigation and retain controls for each existing policy.
- Two existing navigation revisions have different owners. Propagate and check
  the originating request explicitly; matching coincidental counter values is
  not proof. Rejecting stale results must not leave the newest request busy.
- Changing callback contracts can affect late narrator attachment, reflow and
  save admission. Keep changes local and exercise the existing App/reader/save
  composition before accepting them.
- Broadly deleting audible-to-visual updates can regress Resume follow or final
  projection. PN-04 requires its narrow observable reproduction first.
- Historical input matches do not validate newly edited code or new host timing.
  Renew the affected gate; missing evidence remains unresolved.

Rollback a rejected implementation by reverting only its identified task-owned
changes under the then-current authorization; preserve unrelated work and the
original evidence. Keep both units reviewable in one integration batch. The later execution instruction authorizes implementation and validation, but
no commit, push, PR or merge.

## Progress log

- 2026-11-12: rechecked clean `main` at the planning baseline and inspected the
  applicable plan, product, architecture, review and evidence instructions.
- 2026-11-12: inspected prior regression suites, configured commands and host
  receipts. Compared the four recorded input sets and source/output membership
  in normal local PowerShell: all matched. This was read-only evidence inspection,
  not a test run or acceptance of new behavior.
- 2026-11-12: created `codex/passage-navigation-execplan` for the requested
  documentation-only commit. Implementation milestones were unstarted at that time.
- [x] M0: independently assessed baseline reuse and discriminating reproductions.
- [x] M1: symmetric neighbor selection and unknown-direction feedback.
- [x] M2: attributable placement outcomes and disposition of PN-04.
- [x] M3: current combined gates, restoration and documentation; the linked R3
      report is the final independent acceptance authority.

- 2026-11-12 execution: RED confirms PN-01 (ownerless paused gap), PN-02
  (four approximate/unavailable intent combinations), PN-03 (injected resolver
  rejection and superseding cleanup rejection) and PN-04 (failed follow after
  measured manual inspection, Resume and next audible segment). The prepared
  state arm and exact/clamped controls pass without manufacturing failures.
- Final desktop selection currently covers 458 tests: 381 renewed in four
  affected suites, 68 unchanged in five suites from the ten-suite union, and nine
  highlight controls renewed after removing an unused import. See the ledger
  for exact identities, diagnostics and independent acceptance.
- PN-20261112-R1 found one remaining recovery defect: failed preference reflow
  could enable Play without placement. The integrated reproduction failed in
  both intents; the correction now requires aligned or measured visible reflow.
  Renewed desktop/static/Chromium/native gates pass. R2 accepted the runtime and
  complete evidence; its sole UTC-label correction is fixed in the final
  documentation revision. Earlier unbracketed reuse was declined.

## Discoveries and decisions

- The current Next defect is an uncovered counterpart of RCF-06, not evidence
  that the Previous correction was reverted. Cache ordering and adjacency are
  different properties.
- Paused navigation intentionally releases preparation. Selected minimal policy:
  disable unknown neighbors, explain, and preserve explicit Resume. New forward
  discovery while paused is a separate behavior change outside this plan.
- The fake missing-spine failure differs from real nearest-valid resolution.
  Correct the outcome contract without overstating the trigger's reachability.
- Approximate visual placement can be truthful and still fail a relative passage
  request. Preserve the original request and report its outcome explicitly.
- Internal completion projection is deliberate. Do not treat all divergence
  between heard and visible positions as a defect.
- Existing EPUB/shared outputs and the unchanged G2 result offer concrete reuse
  candidates. Changed desktop/browser/type/native acceptance requires current
  evidence; unrelated language/model/installer matrices are omitted by scope.
- Review the system diagram at implementation closeout; the proposed internal
  desktop correction does not currently require changing its component topology.

## Final validation results

Implementation status: **M0–M3 implemented and host-validated**. Current commands,
failures, corrections and immutable receipts are recorded in the
[execution ledger](../evidence/passage-navigation/execution-ledger.md).
PN-04 was confirmed in controlled integrated geometry and corrected narrowly.
The request identity uses the reader revision plus publication identity and the
originating narration revision, never equality between the two counters.
PN-20261112-R1's recovery defect and dependency-evidence gaps are resolved.
PN-20261112-R2 found no remaining runtime gap and requested only the corrected
UTC label. Final current-patch acceptance is recorded in the separate
[PN-20261112-R3 report](../evidence/passage-navigation/review-r3.md).
The selected gates cover458 desktop checks,482 EPUB checks,57 native-harness
checks,13 Chromium cases, current static/document checks, and current packaged
WebView2 plus Piper EN. A03 and the post-harness comparison verify host restoration.
No commit, push or PR was made; the implementation remains in the worktree.

Planning evidence inspection: four historical manifest pairs and their recorded
inputs/source/output membership match the stated baseline. Environment/dependency
qualification and acceptance of reuse were resolved during execution as recorded
in the ledger; incomplete historical dependency evidence was declined.

Planning-document checks ran in normal local PowerShell with installed Node
24.18.0/pnpm 11.15.1:

- `pnpm.cmd exec prettier --write docs/plans/active/passage-navigation-minimal-corrections.md`:
  formatted only this new plan.
- `pnpm.cmd exec prettier --check docs/plans/active/passage-navigation-minimal-corrections.md docs/plans/active/README.md`:
  passed.
- `pnpm.cmd check:evidence`: passed the repository documentation/evidence guard.
- `git diff --check`: passed for the planning diff; the staged diff is checked
  again before the requested documentation-only commit.

These are documentation checks, not execution of M0-M3 or behavioral gate
acceptance. The plan and its two index entries are the complete planning change;
the commit identity belongs in Git history and the handoff, not a self-referential
document hash. They remain historical planning checks; current G0-G6 results,
restoration and independent review are recorded in the execution ledger and final
review, rather than being inferred from the planning checks.
