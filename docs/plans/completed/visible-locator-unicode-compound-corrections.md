# Visible locator and Unicode numeric compounds: minimal corrections

Task ID: VUC-20261101.

Status: M0-M3 complete on 2026-11-01; implementation accepted by independent
review VUC-R1-20261101. Final archival assessment is retained in the
[immutable review reports](../evidence/visible-locator-unicode-compound-corrections/review-reports.md).
Planning base: clean `main` at
`f5330909b1a22cd7cb7f91f5a7ff17a731c8b013`.
Plan branch: `codex/visible-locator-unicode-compound-plan`.

The user authorized implementation and the necessary verifications on 2026-11-01.
Execution starts on the expected branch at plan commit
`353d0bf5534b428e716f228795fc84e63e7158d9`, with a clean worktree and index.
No commit, push, PR, merge or publication is authorized.

## Goal

Close two remaining coverage gaps with an expected two production-file changes:
publish the visible locator after audible follow settles, and recognize Unicode
numbers in the existing compound-expression boundary checks. Reuse existing
fixtures and prepared assets, and renew only evidence consumed by the changes.

This spans M005/M010.1 narration preparation and M009/M010.2 reader/playback
synchronization; a descriptive filename avoids assigning a misleading milestone.

## User-visible outcome

- Play passage A, Pause, inspect passage B, then Resume within the same audio
  unit: the reader follows A. After Stop, primary Play starts at that now-visible
  passage without requiring another scroll or a new audio segment.
- Unsupported compounds such as `١,20 °C` and `١/24/07/2026` remain intact in
  current narration. Supported standalone forms still expand. Displayed text
  and exact source locations remain unchanged.

## Current state

The following is the original planning snapshot, preserved to explain the
discriminating reproductions. Both residual cases are now corrected and accepted;
the progress log and final results record execution against the plan commit.

Three static review passes ended with these two P2 findings. The third added no
finding. Both remain static findings, not executed reproductions. Current code,
test assertions, completed plans and original local receipts were read again
at the planning base; no tests or application code were run for this plan.

| ID | Current source and trigger | Missing proof |
| --- | --- | --- |
| VUC-01 / P2 | `apps/desktop/src/reader/ReaderPublication.tsx`, `settleLocator`, around lines 419-434, updates the visual tracker and reader navigation owner but not `narrationSource.updateVisibleLocator`. During Pause, a passive sample sets the product coordinator's visible locator to B. Mid-unit Resume follows A without another `segment-started`; settlement installs A in the tracker, suppressing a duplicate sample. Stop followed by `startAtVisibleLocator()` can therefore prepare B while A is visible. | The exact Resume-follow/Stop/Play composition before a successor segment or another passive sample. |
| VUC-02 / P2 | `packages/epub/src/narration/narration-bilingual-normalizer.ts`, `isExactCelsiusForm` around lines 456-459 and `matchesLexicalForm` around lines 631-644, recognizes only ASCII digits beyond a numeric separator. Unicode numbers immediately adjacent to a form are already guarded. A separator between them still permits partial expansion, for example `١,20 °C`, `١/24/07/2026`, or `24/07/2026/١`. | Unicode numeric context on the far side of an existing compound separator, through both Celsius and lexical matching and the public current-profile preparation path. |

The earlier recovery-target suspicion is withdrawn and excluded. The
[recovery authority](../../architecture/hardware-profile-recovery-authority-v1.md)
requires the latest valid heard checkpoint and containing-segment replay; it
does not authorize advancing recovery to an unheard requested destination.

### Were these already solved by earlier ExecPlans?

The related corrections are present in current code. These are residual cases
outside their exact assertions, not evidence that those accepted fixes were
reverted. Preserve their tests and historical closeout records.

| Earlier plan / finding | What was corrected and remains present | Why this plan is still needed |
| --- | --- | --- |
| [Revalidated audit](../completed/revalidated-audit-corrections.md), RAC-07; merged commit `65b19fb` | `SegmentHighlightController` refreshes follow once on paused-to-playing. The browser case proves visibility, focus/selection preservation and subsequent passive inspection. | The case scrolls away again after Resume before Stop, and never plays again. It does not assert that follow updated the product's visible start locator. |
| [Playback state corrections](../completed/minimal-playback-state-corrections.md), PSC-03; merged commit `d4622a1` | Primary Play calls `startAtVisibleLocator()`. Its mounted/browser tests prove Pause, inspect B, Stop, Play starts B. | There is no Resume-follow back to A between inspection and Stop. Keep this B-first control; globally changing `start()` or using the heard checkpoint for every Play would regress it. |
| [Seven-finding corrections](../completed/seven-finding-minimal-corrections.md), R7-04; merged commit `33284dd` | Audible settlement supersedes an older pending preference reflow while sampling is suspended. | It updates the same settlement callback, but its tests concern reflow authority, not the product's visible locator after mid-unit Resume. Preserve its suspension/cancellation ordering. |
| [Narration logic corrections](../completed/narration-logic-corrections.md), NLC-05, and [validated chat findings](../completed/validated-chat-findings-corrections.md), F04 | Celsius, currency, percentage and time compounds gain conservative attached-syntax guards; current Spanish Piper uses the mutable normalizer. | The numeric checks beyond separators still call `isAsciiDigit`. These plans' compound examples use ASCII digits. |
| [Six-finding corrections](../completed/six-finding-audit-corrections.md), SFA-02, and [four-finding corrections](../completed/four-finding-minimal-corrections.md), F4-01/02; latter merged as `bc3cc9f` | Word context now includes Unicode letters, marks and numbers. Dates participate in the compound guard. F4 tests preserve `8١`, `8𝟙`, `1/24/07/2026` and `2026-07-24/1`. | Immediate adjacency and ASCII date compounds are covered separately. Neither changed the numeric predicate two tokens away across punctuation. The new examples combine those conditions. |

The later [R8 plan](../completed/eight-revalidated-findings-minimal-corrections.md),
merged as planning HEAD `f533090`, changed reader focus and EPUB opening but left
these two relevant branches intact. Its accepted results do not cover the new
reproductions.

## Scope and non-goals

Two implementation units form one final acceptance batch:

1. VUC-01: reader settlement wiring and one new real-browser regression. Risk is
   high because the responsibility is synchronization with persistence nearby.
2. VUC-02: the pure bilingual normalizer plus existing unit/public integration
   tables. Risk is medium; mapping, bounded work and current-profile routing
   remain acceptance invariants.

Expected production/test edit allowlist:

- `apps/desktop/src/reader/ReaderPublication.tsx`
- `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`
- `packages/epub/src/narration/narration-bilingual-normalizer.ts`
- `packages/epub/src/narration/narration-normalizer.test.ts`
- `packages/epub/src/integration/narration-preparation-matrix.test.ts`

Do not add a duplicate mounted test merely to assert the new callback call; the
new browser test must prove the complete user outcome. Existing reader,
highlight and persistence suites provide the local controls. If real-browser
reproduction reveals a separate gap requiring another file, record its reason
and amend this allowlist before editing it.

Documentation scope is this plan, its future evidence under
`docs/plans/evidence/visible-locator-unicode-compound-corrections/`, active and
completed indexes, the documentation index at closeout, and a brief coverage
update in `docs/development/testing.md`. An existing requirement clarification
may be added to `docs/product/reader-settings-and-playback-controls.md` or
`docs/architecture/overview.md` only if needed to describe the implemented case.

No new numeric parser, allowlist entry, schema, API, dependency, profile, model,
timing policy or persistence rule. No refactoring of the coordinator, scheduler,
highlight controller, DSP, service, native code or package builders. Do not edit
historical normalizers, frozen corpora, evaluation authorities, completed plans
or prior receipts. No installer/signing, GPU or listening-quality campaign.

## Relevant files and documentation

Read [AGENTS.md](../../../AGENTS.md), [plan rules](../../../.agents/PLANS.md),
[documentation index](../../README.md), [roadmap](../roadmap.md),
[MVP](../../product/mvp.md),
[playback requirements](../../product/reader-settings-and-playback-controls.md),
[system diagram](../../architecture/system-diagram.md) and
[architecture overview](../../architecture/overview.md).

The completed [M005 plan](../completed/M005-narration-text-preparation.md) is
marked complete in the roadmap. Its source-position, half-open range, immutable
displayed text and bounded preparation definitions remain authoritative. Read
[ADR-0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md),
[normalization v2](../../architecture/narration-normalization-v2.md), and its
later current-profile corrections in
[ADR-0063](../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md)
and [ADR-0065](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md).
Do not interpret historical Spanish-v1 equivalence as permission to change
frozen profiles or revert current product routing.

Inspect these unchanged supporting owners before editing:

- `apps/desktop/src/tts/product-narration-coordinator.ts`:
  `updateVisibleLocator`, `startAtVisibleLocator`, `resume`, `stop`, audible events.
- `apps/desktop/src/reader/segment-highlight-controller.ts`:
  `ReaderNarrationSource`, Resume reconciliation and settled follow callbacks.
- `apps/desktop/src/reader/active-visual-locator.ts`: suspension and duplicate
  suppression; `reader-reflow-restoration.ts`: cancellation/settlement ownership.
- `apps/desktop/src/App.tsx`: `handleActiveLocatorChange` also schedules passive
  persistence; `persistence/narration-position-save-bridge.ts` and
  `reader-position-save-coordinator.ts`: only heard boundaries own narration saves.
- Existing normalizer/public preparation helpers, browser synthetic service,
  root/package scripts, Vite/Playwright configuration and the native smoke runner.

Use [testing strategy](../../development/testing.md),
[evidence retention](../../development/evidence-retention.md),
[independent change review](../../development/agentic-change-review.md) and the
individual-gate reuse rules in the
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md).
This is a behavioral correction batch, not a refactor campaign.

## Architecture and constraints

For VUC-01, prefer forwarding a successfully settled locator directly through
the existing optional `narrationSource.updateVisibleLocator` at the current
settlement boundary. Bind the callback to the current narration source, including
React effect dependencies, and preserve detach/unmount and unavailable-placement
guards. Keep existing reflow cancellation and tracker suspension ordering. No
new tracker, polling, synthetic scroll, fake `segment-started` or unconditional
snapshot effect is necessary. An equal reader locator must not prevent repairing
a stale product locator.

Do not route audible settlement through App's passive-save callback solely to
reach the product coordinator. Visible start state and heard persistence are
separate: follow may update the former, while only real audible checkpoints
update the latter. Preserve active/selected-target Resume and recovery policy,
focus/selection, passive inspection after follow, and no automatic playback.

For VUC-02, replace only the three ASCII numeric-context checks beyond separators
with a Unicode-aware numeric-code-point predicate, for example the existing
category convention `\p{N}` applied to one complete source token. Keep the
separator sets, direction of each existing check and bounded two-token context.
Do not reuse the broader word predicate for numeric context: a letter separated
by ordinary punctuation must not suppress a valid standalone expansion. Leave
the ASCII digit helper's language-tag and other unrelated callers unchanged.
No conversion of unsupported Unicode numerals into accepted numbers is intended.

EPUB data and inference remain local; generated audio stays bounded in memory.
No source text/audio enters logs or retained evidence. Use repository-authored
synthetic inputs. Preserve code/unknown/foreign-language behavior, malformed
expression preservation, source-code-point accounting, cancellation checkpoints,
source windows, segment limits and public locator contracts.

The canonical diagram and M005 boundary were reviewed: no component, process,
data-flow or persistence owner changes are expected. Recheck against the final
diff; do not edit the diagram or introduce an ADR just to document internal
wiring. M005 evidence does not establish new audio, quality or hardware claims.

## Milestones

### M0: Reconfirm scope and prepare only necessary inputs — complete

After execution authorization, record actual HEAD, status, tool identities and
task-owned paths. Preserve unrelated work. Re-read the two source branches and
historical exclusions; if a newer revision already fixes a finding, record the
current code/test proof and omit that correction and its now-unnecessary gates.

Create a gate ledger before running anything. Reuse current exports only after
matching their complete input/output membership and hashes; otherwise use the
configured package build. Do not run a full green baseline. The discriminating
red cases in M1 establish the missing behavior before either production edit.

### M1: Reproduce the missing cases — complete

- Add one `VUC-01` browser case using the existing synthetic service, long audio
  unit and distinct A/B paragraphs. Let the initial follow settle, Pause and
  sample B, then Resume the same handle. Wait for follow's existing frame
  settlement; Stop before a successor segment and do not scroll again. Clear
  the fixture's preparation records and assert primary Play's first preparation
  starts at the visible A range. Also assert Stop kept the last heard checkpoint,
  not inspected B, and close all owned audio contexts. Use source locators where
  available; synthetic text is only a test-local discriminator, not log output.
- Retain RAC-07's later passive-inspection assertion and PSC-03's B-first flow as
  separate existing controls. A fix that always forces Play to A is incorrect.
- Extend existing numeric tables with `VUC-02` rows for Celsius prefixes and
  currency/percentage/time/date compounds on the applicable side of separators.
  Cover Arabic-Indic, fullwidth, supplementary-plane and non-decimal numeric
  code points without a Cartesian product. Include both existing matcher
  branches and lexical prefix/suffix checks. Keep supported standalone and
  punctuation-wrapped forms, ASCII compounds, immediate Unicode adjacency,
  code and unsupported-language controls.
- Extend the existing public preparation table with representative ES/EN inputs
  using `narration-bilingual-v2`, `narration-piper-v2` and
  `narration-chatterbox-v1`. Reuse endpoint-resolution/source-immutability helpers;
  compare one/many batches using the existing collector rather than a new harness.

Run only the new EPUB rows and new browser case against unchanged production.
Require failures at the intended preservation/start-location assertions.
Harness/setup/timeout failures are not reproduction evidence. If a case already
passes, investigate the premise before modifying production or widening scope.

### M2: Apply the two bounded corrections — complete

Implement only the settlement forwarding and numeric-context checks described
above. Rebuild changed EPUB exports before desktop consumers. Run the selected
final deterministic/static/browser gates once on the combined patch; do not also
repeat every individual red command after the full applicable suites pass.

### M3: Native integration, independent review and closeout — complete

After fast gates pass, verify existing Piper assets and native host readiness,
build one current executable and run one existing Piper EN integration arm.
This complements the exact deterministic/browser reproductions; it does not
claim to reproduce the new Unicode cases or Resume composition by itself.

Verify cleanup, freeze final source/docs and receipts, then delegate the required
independent assessment to `change_reviewer` (GPT-6 Astra high). The reviewer must
inspect the exact current patch and host evidence without running tests or
editing. Renew only checks invalidated by corrections. Missing evidence or an
unavailable reviewer leaves acceptance BLOCKED. No bug is accepted separately
while its required integration or cleanup remains pending.

Record a new immutable Review ID, reviewed identities, outcome and reuse
decisions. Only after approval move this plan to completed and reconcile indexes;
any later archival changes need current documentation review and an assessment
binding that final state, retaining unaffected runtime evidence with proof.
Future code commits/publication require their own authorization.

## Testing and benchmark strategy

### Historical evidence inspected and reuse decisions

These are recorded past outcomes, not runs performed for this plan. Original
receipts and their input digests were inspected locally; matching hashes alone
do not supply missing environment, membership or invariant proof.

| Evidence | Recorded result and planning inspection | Decision for execution |
| --- | --- | --- |
| [F4 ledger](../evidence/four-finding-minimal-corrections/execution-ledger.md), `G-EPUB`, F4-R2-20261031 | 213 tests passed. Original receipt SHA-256 `8780d2b398dee01a135fbffc95f948e0e96965216bd6baab5e9d8bb4d205d735` and input digest match; log exists. Of 1,493 recorded entries, 39 differ now: 31 non-Markdown and eight Markdown. Several changed EPUB opening/projection inputs are consumed by public preparation. Recorded Node is 24.18.0. | Reuse tables, source-map helpers and frozen controls. **EJECUTAR** the three affected EPUB suites. Neither this older public-integration result nor its old environment is a current baseline/final PASS. |
| [PSC ledger](../evidence/minimal-playback-state-corrections/execution-ledger.md), `R2-G2-readers`, `R2-G4-controls`, `G4-psc-viewport-corrected`; PSC-R2-20261031 | 49 reader/save cases and three browser controls were renewed after R1 rejected incomplete installed-input evidence; corrected PSC-03 separately passed. Original receipts, input digests and logs are retrievable. Receipt hashes respectively: `c39119be8ad8b1d1977a8e23ef483d13af1c917a0afe1ae69bc9429722bca2a2`, `787834c262012ca1e3c6a757036c453cf950442fee88ffc86737e0520fb4d3c5`, `0fa534125e886bc47dba9848b193576dcc44d93f263b49db70b416dbed301998`. | Reuse fixtures and the corrected frame/viewport handling. **EJECUTAR** affected local controls and four selected browser cases. Earlier failed aggregates remain failed; do not reconstruct their missing execution-time identities. |
| [R8 ledger](../evidence/eight-revalidated-findings/execution-ledger.md), `G3-Desktop-final`, R8-R1-20261101 | 399 tests passed; original receipt hash `45238d0693f80a0f259828eac754e64341d0eb99b84196331c46202648f2c948` and input digest match; log exists. Comparing its 1,497 recorded inputs finds nine later Python-tool/test changes and eight Markdown changes, with no difference in its recorded TS/TSX/config/lock inputs. Recorded Node is 24.20.0. | Useful pre-edit source baseline candidate, conditional on complete consumed-input membership, installed-library and environment proof. Not acceptance after the reader/normalizer edit. No full 399-test repeat: select only the three reader/highlight/persistence suites below. |
| R8 `G3-Desktop-final-exports.json` | All 251 recorded shared/EPUB generated files match current hashes and complete `dist` membership. | **REUTILIZAR CON PRUEBA** for pre-edit preparation if source/config/tool inputs still match at execution. VUC-02 invalidates EPUB outputs: rebuild after that edit. This is artifact reuse, not a behavior PASS. |
| R8 `G6-Browser-final` | Original receipt exit 0, hash `994e034309818f5e1c65f97658df077f6f3907410916d4b6c8bf4e9095891254`; ten selected cases passed under its recorded environment. | Its selection does not contain the new Resume/Stop/Play chain. Renderer changes also invalidate the old artifact. Do not run all ten R8 cases merely to reuse their test list. |
| R8 `G7-Core`, `G7-Build`, `G8-Piper`, resource-cycle record | Core integrity and one current Piper EN native arm passed; all 2,023 staged files and original adjacent resources were accounted for, with verified cleanup. The recorded executable is `18e5be1ed0d4e5d97797f102f52e8273e49f1c0c05de3fbd01bde64bc4adaac5`. | Reuse verified core/voice payloads, installed tools and caches as preparation, subject to current integrity/readiness. **EJECUTAR** one new executable build and one native arm. Do not reuse that executable's result for a changed renderer or regenerate models/core by default. |
| F4 native/Rust and R8 Python, image, focus and harness results | Historical accepted results concern unchanged responsibilities outside these two fixes. | **NO APLICA**, rather than a fresh or recycled PASS. No Rust/Python, image-decoder, installer, optional-model or harness suite unless the corresponding inputs/responsibilities actually change. |

Original roots are `tmp/evidence/four-finding-minimal-corrections/run-01/`,
`tmp/evidence/minimal-playback-state-corrections/` and
`tmp/evidence/eight-revalidated-findings/run-01/`. Raw originals remain ignored;
do not copy private paths, inventories or unfiltered logs into tracked documents.

No historical runtime PASS is pre-approved for the future patch. Record each
gate as **EJECUTAR**, **REUTILIZAR CON PRUEBA**, **NO APLICA**, or **BLOQUEADO**.
Reuse a passing result only with its retrievable immutable host receipt, full
consumed source/transitive import/test/fixture/config/lock/runner membership,
tool and installed-library identities, tested artifact bytes, relevant host
conditions and identical invariant. The independent reviewer must record the
original gate/report and current comparison in a new report. Unknown inputs or
drift require the affected gate, not a blanket rerun. Prepared-asset reuse and
historical performance measurements are separate decisions.

### Minimal gate set after execution authorization

All commands run from the repository root in normal local PowerShell **outside
the managed automation sandbox**. Inspect current script definitions again if
HEAD moves. Every row is pending. Do not install/update dependencies or browser
payloads when current prerequisites suffice.

| Gate / timing | Existing command | Invariant, inputs and invalidation |
| --- | --- | --- |
| G0 preparation, before tests and after package changes | `pnpm.cmd build:packages` only when prerequisite exports cannot be proven current; required after VUC-02, before desktop consumers. | Shared/EPUB sources, TS projects, lock/toolchain and complete exports. Preparation only, never a behavior PASS. Keep configured browser/Tauri build hooks; do not manually edit outputs. |
| G1 numeric red, before production edits | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts -t VUC-02` | New table rows fail on unchanged production for partial expansion. Bind new tests, current source/fixtures, transitive imports, config, libraries and exports. Nonzero selected count is required. |
| G2 reader red, before production edits | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep VUC-01` | Exact A/B Resume-follow/Stop/Play journey fails at first prepared locator, after its sampling/follow preconditions pass. Uses current renderer, synthetic service and installed Chromium. |
| G3 EPUB, once after final production/test edits | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts` | Unicode/ASCII preservation, accepted corpus, code/language controls, current profile routes, exact mapping, cancellation and bounds. Consumed source/test/helper/config/lock/export changes invalidate the affected result. |
| G4 reader, once on combined inputs | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/persistence/narration-position-save-bridge.test.ts` | Existing mounted callbacks, replacement/reflow, Resume follow and heard-save controls. No entire coordinator/App/desktop suite by default because their source is unchanged and G5 proves the joined fresh-Play path. Widen if actual implementation changes those owners. |
| G5 Chromium, once on combined patch | Use the exact four-case command below. | New journey plus RAC-07 passive inspection, PSC-03 B-first Play, and R7-04 reflow authority. Renderer/packages, tests/fixtures, configuration, Chromium and toolchain are inputs. Do not add repeat-each or a full browser sweep. |
| G6 static, after final TS/TSX edits and before native preparation | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/desktop typecheck`. Execute and record each separately. | Formatting, hook dependencies, package/consumer/browser-test types. Include glob membership, config, locked installed tools and generated declarations. Later affected edits require renewal. |
| G7 native preparation, after fast gates | `pnpm.cmd package:piper-core:check`, then `pnpm.cmd build:desktop` once. | Verify existing payload, build current renderer/native executable and record exact identities/discovered resources. No old renderer result, package regeneration or separate installer lifecycle command. |
| G8 native integration, same G7 executable | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | One existing Piper EN WebView2 arm for integrated playback, synchronization, cancellation and cleanup. Retain all runner assertions. Renderer/native/runtime/voice/runner/browser/driver and relevant environment are inputs. No six-rate playback exercise or second model/language arm: DSP/rate policy is unchanged. |
| G9 documents and independent review, final | `pnpm.cmd check:evidence`, `git diff --check`, local Markdown-link/consistency inspection; then `change_reviewer`. | Current safe evidence, documentation, exact patch identities, passing host receipts and verified cleanup. Any changed reviewed input needs a new immutable assessment; preserve eligible individual receipts rather than renewing everything. |

Exact G5 command, using PowerShell stop-parsing to preserve the regex through
the Windows `.cmd` shim:

```powershell
pnpm.cmd --% test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep "VUC-01|RAC-07|PSC-03|R7-04"
```

Require exactly the four intended cases at execution time; selection drift or
zero cases is not acceptance. The red browser run occurs only before the fix;
the final invocation includes that case, so no separate green VUC-01 rerun is
needed. Numeric red rows are likewise covered by G3. Retain existing assertions
instead of adding copies, and avoid an extra full pre-edit green baseline.

**NO APLICA:** root `check`/`check:portable`, full package/browser matrices,
Rust/Python tests/static sweeps, fresh DSP/performance/listening benchmarks,
additional GPU/model/language arms, model-free native raster smoke and installer
journeys. They cover responsibilities unchanged by this allowlist. Exclusion is
impact analysis, not reuse of a historical PASS. Any later required publication
CI remains separate and cannot be waived by this plan.

### Native preparation and cleanup

Use current versioned runners. Before expensive work, verify tool/driver/browser
compatibility, core/voice identities, disk capacity and writable short scratch.
Record a recovery journal before touching adjacent resources: full original
membership/hashes, owned locations, intended staging and verified restoration.
Prior plans restored an older adjacent resource tree; its presence alone does
not prove readiness. Prefer the already verified core payload over regeneration.

Run the single native arm on the current binary and restore only task-owned
changes in `finally`. Retain before/after evidence for resources, scratch,
generated-audio absence and processes identified by PID, creation time and
executable. Preserve unrelated roots/processes and user data. Unverified cleanup
blocks acceptance. Capture receipt inputs at execution time, including installed
libraries and browser/driver bytes; do not repeat PSC's missing-identity mistake.

## Risks and rollback

- A visible-locator update must not become a passive persistence write, a new
  playback start or a stale-source callback. Preserve current source identity,
  successful-placement and teardown guards; retain heard-save and reflow controls.
- A broader numeric guard could suppress ordinary punctuation or accidentally
  change unrelated ASCII parsing. Use a numeric-only complete-code-point check
  at the existing three sites; keep accepted-form and language/code controls.
- Browser timing can hide the defect if a successor starts or another scroll
  repairs the locator. Establish B sampling, long-unit playback and settled
  Resume follow explicitly, then assert first fresh preparation before cleanup.
- Missing proof does not authorize rerunning every old matrix. Classify the
  affected gate and state what identity or invariant cannot be established.
- Preserve every failed receipt. Distinguish expected red, product regression,
  baseline failure, environment and harness/cleanup failure. One infrastructure
  retry per failed stage requires a concrete hypothesis and changed condition;
  a second failure blocks that stage for diagnosis/replanning. Never weaken
  assertions or relabel a failed aggregate as PASS to reduce test count.
- Roll back only task-owned changes if abandoned, preserving unrelated work and
  all evidence. Do not reset/clean the workspace or overwrite historical records.
  Native recovery must restore and verify the journaled original state before
  any further acceptance attempt.

## Progress log

- 2026-11-01: Independent VUC-R1-20261101 APPROVE, no findings. The reviewer
  verified 418 path identities and 124 receipt digests before/after, approved
  current-task evidence retention and prepared-asset reuse, and confirmed native
  cleanup. Archived this plan and updated documentation/testing indexes after
  approval. Archival changes require renewed document checks and a separate
  current-state assessment, retained in the linked immutable review reports.
  No commit, push, PR, merge or publication was performed.
- 2026-11-01: G8 passes the single Piper EN arm with zero generated-audio files,
  retained units, external requests or stale playback. All six audio contexts
  close; no new process/scratch remains. Full original adjacent resources are
  restored byte-for-byte and the task backup is absent. Installed before/after
  snapshots match all 24,009 entries. M3 awaits document gates and independent
  review of the frozen current patch; no archive or Git mutation yet. G9 evidence,
  whitespace and Markdown-link checks pass (82 links before ledger closeout).
- 2026-11-01: M2 complete: G3 passes 232 EPUB cases; G4 passes 50 reader/save
  cases; G5 passes exactly four Chromium cases. Format, lint and both typechecks
  pass. Retained the initial desktop type failure, corrected only the fixture's
  source-range type and renewed its affected static gates. Public VUC rows now
  also force multiple segments and compare one/many batching and source bytes.
  The runtime patch remains two production files, with no grammar/owner changes.
- 2026-11-01: Piper core integrity passes; built one current native executable.
  Renewed only core integrity and G5 to add missing tool/renderer-byte capture;
  original receipts remain separate, without retrospective identity claims.
  G8 is running with 2,023 verified staged files, a full restoration journal,
  original adjacent resources preserved, and one Piper EN arm. Native operation
  retains the versioned 30-minute limit; inspect progress at five minutes and
  preserve the active session rather than relaunching. Cleanup/review pending.
- 2026-11-01: M0-M1 complete. G0 built current exports; G1 selected 19 new rows
  and reproduced 16 preservation failures. G2's first fixture attempt failed
  at viewport setup and is retained. Its one bounded retry used PSC-03 viewport
  handling and failed at the intended first prepared range (B anchor 25 rather
  than visible A anchor 0), after sampling/follow/heard-save controls passed.
  Both production files were still unchanged for these runs. Applied only the
  planned locator forwarding/effect dependency and three numeric-context guards.
- 2026-11-01: Execution authorized separately from the planning commit. Branch,
  full HEAD and clean worktree/index match the request. Current settlement still
  omits the product visible-locator update, and all three numeric checks across
  separators still use ASCII digits. RAC-07/PSC-03/R7-04 and NLC/CHAT/SFA/F4
  controls remain present; neither residual finding is already fixed.
  Gate decisions and current receipts will be recorded in the
  [execution ledger](../evidence/visible-locator-unicode-compound-corrections/execution-ledger.md).
- 2026-11-01: Re-read current code and existing tests at `f5330909b1a22cd7cb7f91f5a7ff17a731c8b013`;
  confirmed the two static cases and excluded the withdrawn recovery suspicion.
- 2026-11-01: Compared RAC/PSC/R7 and NLC/CHAT/SFA/F4 corrections with their exact
  assertions; documented residual coverage gaps rather than reopening fixed cases.
- 2026-11-01: Read original F4, PSC and R8 receipts; checked receipt/input digests
  and recorded-source deltas. Compared all 251 R8 generated exports and their
  directory membership. No runtime/environment reuse approval was inferred.
- 2026-11-01: Created the requested plan branch and this documentation-only plan.
  No implementation, tests, builds, model runs or host mutations were performed.
  M0-M3 remain not started.

## Discoveries and decisions

- The smallest reader correction is at the existing settlement-to-product
  connection. PSC-03's primary action and RAC-07's once-only follow stay intact.
- VUC-02 is the intersection missing from earlier fixes: Unicode numbers plus
  separators. Its fix should widen only numeric context, not accepted grammar.
- Existing source fixtures and package/voice preparation are reusable; no old
  runtime result can validate newly changed reader/normalizer behavior. Baseline
  candidates and final acceptance are deliberately distinct.
- Four selected browser cases and one native integration arm cover the affected
  synchronization responsibilities. The prior six-rate portfolio, R8 raster
  native arm and model matrices add no required proof for this bounded patch.
- Independent review is required for this implementation. The original planning
  commit qualified for the documentation exemption; it is not implementation
  acceptance. Current execution evidence must receive its own review.

## Final validation results

The [execution ledger](../evidence/visible-locator-unicode-compound-corrections/execution-ledger.md)
records exact commands, results, original failures and bounded renewals. G0-G9
pass at their defined boundaries: both red reproductions discriminate unchanged
production; 232 EPUB and 50 reader/persistence cases, exactly four Chromium cases,
format/lint/two typechecks, current core integrity, one executable build and one
Piper EN native arm pass. Native resources are restored and cleanup verified.
All executions used normal local PowerShell outside the managed sandbox.
Independent VUC-R1-20261101 APPROVE has no findings and accepts evidence retention
and artifact reuse; no historical runtime PASS supplies acceptance. Final
archival document checks and assessment are retained in the linked review record.
Both findings are resolved; no blocked gate, unrelated change or Git/publication
action remains. Native timing evidence is limited to the recorded host/arm.
