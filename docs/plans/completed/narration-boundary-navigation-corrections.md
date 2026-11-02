# Narration boundaries and navigation: minimal corrections

Date: 2026-11-01. Task ID: BNC-20261101.

Status: **M0–M3 complete; independently approved by BNC-R2-20261101.**
The final archival assessment is retained separately in the
[immutable review records](../evidence/narration-boundary-navigation-corrections/review-reports.md).
Planning base: `c5617ad80945d2f11b96a58c5acf27f16f0184ea` on clean `main`.
Plan branch: `codex/narration-boundary-navigation-plan`.

The 2026-11-01 execution instruction supersedes the earlier planning-only
restriction and authorizes M0–M3 implementation, tests, builds and native execution.
Commit, push, PR, merge and publication remain unauthorized. Execution started
at `69de1d9e450f6602015175ac38ffeba7ab9d9440` on the expected plan branch with
a clean worktree and empty index. No unrelated changes were present.

## Goal

Correct the five findings revalidated in the chat, preserving the existing
owners and closed normalization grammar. Prefer changes in exactly two production
files: the product narration coordinator and the mutable bilingual normalizer.
Use existing test fixtures and runners, renew only affected evidence, and retain
historical authorities unchanged.

## User-visible outcome

- A navigation restart rejected by current admission ends in a settled,
  actionable state. It cannot claim active playback without a run or silently
  keep manual reading-position saves disabled. A later compatibility refresh
  does not start narration; an explicit Play uses the current visible target.
- Unsupported numeric expressions remain whole, including the identified signs,
  nonbreaking spacing and Celsius continuations.
- Removing approved invisible formatting cannot turn part of a larger number
  or word into an independently expanded lexical form.
- Ordinary sentence punctuation does not remove protection from accepted
  numbers or allow a segment boundary inside them. Displayed EPUB text and
  canonical source locations remain unchanged.

## Current state

These are **statically established paths, not executed reproductions**. All
examples are short synthetic inputs. Before production edits, obtain a failing
regression for each finding. A setup failure is not a reproduction; if a case
does not reproduce, retain the evidence and reassess that row instead of forcing
a fix. Do not silently drop any of the five findings.

| ID / priority | Trigger, current path and consequence | Minimal correction boundary |
| --- | --- | --- |
| BNC-01 / P2 | `apps/desktop/src/tts/product-narration-coordinator.ts`, `#finishNavigation` around lines 1519-1543, clears the pending navigation and assigns `playing` before `start()` can reject admission. A compatibility refresh can still be `checking` after navigation has released its old owners. The later refresh only publishes availability. The persistence bridge treats every non-inactive intent as narration authority, so manual positions remain unsaved. Cleanup failure is a related branch: the stop promise resolves with retained failed owners, yet navigation completion still attempts restart and can leave settlement unpublished. | Make completion reflect actual admission and cleanup, publish settlement on rejection, and preserve failure containment. Keep ownership in the coordinator. |
| BNC-02 / P2 | `narration-bilingual-normalizer.ts`, replacement planning around 1683 and formatting omission around 1467, matches raw adjacency before removing U+2060, U+200B and U+00AD. English `1\u20608` can become `1eight`; the projector retains the mark until narration. | Check logical lexical adjacency across approved removable marks with bounded work and source provenance. Keep original token spans and typed omissions. |
| BNC-03 / P2 | The same file's `hasAttachedNumericSyntax` and `matchesLexicalForm` omit U+2212 in simple-number context and `+`/U+2212 in the right compound guard. ES `−21` can become `−veintiuno`; EN `8−8` can become `eight−eight`; EN `14:30+02:00` and `14:30−15:30` can expand only their accepted prefix. The suffix guard also sees only one space: `21\u00A0\u00A0%` can become `veintiuno %`. | Complete the affected context checks without adding numeric forms, a general parser or new resource limits. |
| BNC-04 / P2 | `isExactCelsiusForm`, around 456-467, protects numeric syntax only on the left. ES `20 °C-25 °C` and `20 °C/8` can expand the first temperature inside an unsupported compound. Symbol matching runs before lexical protection. | Apply the bounded numeric-continuation guard to the right of the existing Celsius form, retaining standalone and punctuation-delimited positives. |
| BNC-05 / P2 | `hasAttachedNumericSyntax` treats any adjacent period/comma as numeric syntax. Rejecting `1.234` in `Hola. Tengo 1.234.` removes its thousands-token protection. `findPunctuationPlan` marks the internal period as sentence-end; scanner/packer then count three sentences. The current Piper two-sentence target selects `Hola. Tengo 1.` and `234.`. | Distinguish ordinary punctuation from an attached numeric continuation at matching time, preserving token protection and the current scanner/packer policy. |

Earlier chat qualifications remain binding:

- The bare fact that `21.` remains digits does not prove incorrect pronunciation.
  BNC-05 is based on the concrete segmentation path and supersedes its earlier
  provisional P3 classification. Reproduce the public segment result before editing.
- U+2212 is retained in the defective output; loss of the spoken sign is not proven.
- Two ASCII spaces are collapsed by XHTML projection, so they are not the public
  reproduction for BNC-03. Use two U+00A0 characters or numeric XML references.
- No permanent application deadlock, stale PCM playback, locator corruption or
  general model-pronunciation defect was demonstrated. Do not claim these effects.

### Earlier treatment and residual coverage

The earlier fixes are still present; these are remaining combinations, not
demonstrated reversions of those patches.

| Previous correction | Verified implementation | Remaining combination |
| --- | --- | --- |
| [PSC-02](../completed/minimal-playback-state-corrections.md), `d4622a1` | `resume()` no longer assigns playing before an ownerless start is admitted. Its regression pauses, finishes navigation, then defers availability. | BNC-01 starts with playing intent and rejects the automatic restart in `#finishNavigation`. NLC-03's interrupted-recheck test instead calls explicit Stop. |
| [NLC-05](../completed/narration-logic-corrections.md), `2f0ff21`, and [ADR-0063](../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md) | Celsius prefix compounds are preserved; current Spanish Piper uses the mutable normalizer. | BNC-04 adds right continuations; BNC-02/03 cover interactions outside that prefix correction. |
| [CHAT F04](../completed/validated-chat-findings-corrections.md), `4942ac7` | Percentages and times gain attached-compound protection. | Right-side `+`/U+2212 remain absent. |
| [F4-01/02](../completed/four-finding-minimal-corrections.md), `bc3cc9f` | Immediate Unicode numeric adjacency and dates in compound matching are protected. | Formatting removal, omitted operators and repeated nonbreaking spacing remain. |
| [VUC-02](../completed/visible-locator-unicode-compound-corrections.md), `f2870ff` | Numeric context beyond existing separators recognizes Unicode numbers. | It does not add separators or logical adjacency through omitted formatting. |

No specific correction for BNC-02 or BNC-05 was found in the inspected normalizer
history and relevant plans. Existing corpus cases cover formatting removal,
standalone numbers and protection separately. Reuse those controls without
altering their historical expected output.

## Scope and non-goals

One integration batch has two implementation units; shared integration acceptance
remains pending until both pass. This is a bug-fix task, not a refactor campaign.

| Unit | Expected production edits | Test edits and risk |
| --- | --- | --- |
| U1: navigation settlement, BNC-01 | `apps/desktop/src/tts/product-narration-coordinator.ts` | Existing coordinator tests and `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`. High: cancellation, synchronization and persistence consequences. Exercise actual save ownership in the coordinator harness. |
| U2: numeric/lexical boundaries, BNC-02-05 | `packages/epub/src/narration/narration-bilingual-normalizer.ts` | Existing `narration-normalizer.test.ts`, `integration/narration-preparation-matrix.test.ts`; add only missing resource-limit assertions to `narration-resource-bounds.test.ts`. High for the combined source-mapping/bounded-preparation path. |

Tests may reuse current helpers and small tables. Do not create a new framework,
parallel parser, normalization engine, general registry or broad fuzz campaign.
Do not rewrite the scanner, packer, XHTML projector, save coordinator, PCM player,
scheduler, recovery controller or UI to compensate for a bad producer state.
If a focused reproduction proves a necessary edit outside the two owners,
record the reason, update the allowlist and affected gates before that edit.

No dependency, model, voice, profile ID, public signature/schema, persisted data
format, TTS protocol, DSP/rate policy, resource ceiling or architecture topology
change. No broad cleanup, performance optimization, installers, release or
optional-package work. Keep the historical normalizer/tables, frozen evaluation
sources, corpus authorities, hashes and completed plans unchanged.

Planning edits are limited to this file and `docs/plans/active/README.md`.
Future implementation documentation is limited to concise current-behavior notes
in `docs/product/mvp.md` and `docs/product/reader-settings-and-playback-controls.md`,
this plan, its eventual content-safe evidence directory, and completion indexes.
Do not change historical v1 normalization claims to describe current mutable
profile behavior. No new ADR is expected for enforcing these existing boundaries;
reassess that decision if implementation needs a new contract or policy.

## Relevant files and documentation

Read [AGENTS.md](../../../AGENTS.md), [documentation index](../../README.md),
[MVP](../../product/mvp.md), [reader controls](../../product/reader-settings-and-playback-controls.md),
[overview](../../architecture/overview.md), [system diagram](../../architecture/system-diagram.md),
[normalization authority](../../architecture/narration-normalization-v1.md),
[ADR-0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md),
[ADR-0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
[ADR-0065](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md),
and the earlier plans above. Review the completed [M005 plan](../completed/M005-narration-text-preparation.md)
against its [roadmap status](../roadmap.md): preparation is complete and separate
from later audio/synchronization ownership. Neither historical text nor PASS
records establish acceptance for this patch.

Inspect these unchanged collaborators before editing:

- Desktop: `App.tsx`, `tts/hardware-compatibility-check-binding.ts`,
  `tts/ProductNarrationControls.tsx`, `reader/ReaderPublication.tsx`,
  `persistence/narration-position-save-bridge.ts` and
  `persistence/reader-position-save-coordinator.ts`, with their existing tests.
- EPUB: `document/xhtml-projector.ts`, `narration/narration-source-projector.ts`,
  `narration/narration-preparation.ts`, `narration/narration-prepared-segment.ts`,
  `narration/narration-boundary-scanner.ts`, `narration/narration-segment-packer.ts`,
  policies and the existing English/Spanish form tables. Paths are under
  `packages/epub/src/`. Existing synthetic corpora/helpers are under test-support.
- Gate owners: root/package `package.json`, desktop Vite/Playwright/Tauri config,
  `apps/desktop/scripts/native-startup-smoke.mjs` and its `native-smoke/` imports.
- [Bug workflow](../../../.agents/skills/investigate-bug/SKILL.md),
  [independent review](../../development/agentic-change-review.md),
  [evidence policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
  for input/environment reuse discipline, and [Git workflow](../../development/git-workflow.md).
  Refactor-specific work orders/roles are not imposed on these behavior fixes.

## Architecture and constraints

### U1: settle rejected starts at the existing owner

Keep `start()`'s existing public signature and admission guards. `#startRun()`
already owns the successful transition to playing; do not publish a fictional
successful transition merely because `start()` was called.

After the current navigation's stop joins, retain the existing identity/revision
checks and target assignment. For a requested restart that cannot create a run,
clear pending/paused navigation bookkeeping, settle to **inactive** and publish.
This returns persistence authority to manual reading and exposes explicit Play
when admission permits. Preserve the target until a later genuine visible move.
Do not publish a transient inactive state on a successfully admitted restart.
Never make a generic compatibility refresh autoplay or add a background retry.

If cleanup failed, preserve its failure/terminal state and retained ownership;
settle navigation without overriding containment with playing or a fabricated
paused state. Paused navigation with successful cleanup must retain its existing
paused semantics. Stop, close, configuration change, unavailable placement and
superseding navigation must still win over pending completion. No save-bridge
special case or artificial audible checkpoint is needed.

### U2: correct bounded context, not the accepted numeric grammar

Keep the raw source-token array and one normalized origin unit per token. Derive
context locally across only the already removable U+00AD/U+200B/U+2060 marks.
Do not build a flattened replacement string with new offsets. Respect prose/code
and effective-language boundaries. Use the existing 128-code-point bound for any
new lookaround; if context cannot be proven within it, preserve rather than guess.
No unbounded repeated scans, extra retained source buffers or work-budget bypass.

Complete simple-number/operator and right-compound checks for the identified
`+`, ASCII `-` and U+2212 cases. A bounded whitespace lookahead must recognize the
existing `%`, euro, degree and `EUR` suffixes after repeated nonbreaking spacing.
Whitespace still collapses under the existing policy; unsupported numeric text
does not expand. Do not add new literal entries to the form tables or silently
broaden the numeric-lookahead resource classifier just to reuse its predicate.

Apply equivalent numeric-continuation protection to Celsius before symbol
replacement claims the span. Keep `(20 °C),` valid and preserve numeric compounds
on either side, including Unicode numeric neighbors already covered by VUC-02.

For BNC-05, freeze positive ordinary-punctuation examples in the new regressions
before changing the matcher: ES `21.`, `3,14.` and `(1.234),` retain their punctuation
and expand their already accepted numeric form. Preserve attached compounds such
as `1.234.56`, `0.21`, unsupported signed/currency/percentage forms and existing
ambiguous controls. Change only the context predicate needed to distinguish a
sentence period/comma from numeric attachment. Do not change sentence targets or
teach the packer to reconstruct numbers after an unsafe split.

Current `narration-bilingual-v2`, `narration-piper-v2` and
`narration-chatterbox-v1` use the mutable path. Historical `narration-v1` and
`narration-piper-v1` remain unchanged. No general pronunciation guarantee follows
from correcting prepared text. EPUB contents stay local, PCM stays ephemeral,
and all new diagnostics/receipts remain content-free except synthetic assertions.

The canonical diagram was reviewed during planning: the two existing producers,
reader/persistence consumers and process boundaries remain accurate. Review it
again at closeout; update only if the actual architecture changes. Do not extend
M005's preparation-only implementation claims to audio or synchronization.

## Milestones

### M0: authorized execution, identity and preparation decision

**Status: complete.** Separate execution authorization received. Inspect
HEAD, branch, worktree/index, exact production/test paths and any existing running
gate. Preserve unrelated changes; do not reset, stash or overwrite them. Capture
original source and relevant installed/tool/config/export identities before tests.
Resolve the conditional evidence decisions below; do not reconstruct missing
execution-time identities or label an old green run current acceptance.

Reuse current package exports before red tests only with complete input/output
membership proof. Otherwise run the existing package build once. Check cheap
readiness first; do not prepare models/native builds at this stage. A broad
pre-change green suite or model baseline is unnecessary for these targeted fixes.

### M1: focused failing regressions on unchanged production

**Status: complete.** Added `BNC-` cases in the existing unit/public suites and
run G1/G2 once before their respective production edits.

- BNC-01: hold configuration availability pending while playing, finish chapter
  navigation/cleanup first, and then resolve available or unavailable. Assert
  settled inactive intent, no hidden run, manual save acceptance and correct
  target on later explicit Play, with no refresh-triggered start. Use an actual
  save coordinator/repository in the harness for the persistence consequence.
  Include failed cleanup and a stop/supersession control; retain PSC-01/02 and
  SAC-06 expectations. Await state/service conditions, not arbitrary delays.
- BNC-02: `1\u20608`, a compact table for the other approved removable marks,
  and a letter-adjacency control. Assert expected normalized spelling, original
  source-span coverage, code preservation and no lexical expansion in an
  unsupported language. Neutral whitespace/formatting transformations still apply
  outside code; do not demand byte-identical foreign prose where policy removes marks.
- BNC-03: ES `−21`, EN `8−8`, `14:30+02:00`, `14:30−15:30` and ES
  `21\u00A0\u00A0%`. Keep existing ASCII, single-space, supported standalone and
  Unicode-adjacency controls. The expected last output is `21 %`.
- BNC-04: ES/EN right continuations, e.g. `20 °C-25 °C`, `20 °C/8` and a Unicode
  numeric neighbor; retain existing left-compound and standalone positives.
- BNC-05: exact positive punctuation output and public Piper ES preparation of
  `Hola. Tengo 1.234.`. Require the whole accepted number in one segment, with
  `Hola. Tengo mil doscientos treinta y cuatro.` and valid source endpoints.

Extend the existing public preparation matrix with a small representative fixture
covering each normalization cause. Compare current profile routes, displayed-source
immutability, exact locator resolution and `maximumSegments: 1` continuations
against multi-segment requests. Reuse collectors and legacy controls. Use selected
representatives for profile/context/boundary controls rather than a Cartesian
product of every spelling, language and batch size. Add only missing at/over-bound
assertions for new lookaround to the resource suite.

### M2: minimal implementation and combined deterministic/browser proof

**Status: complete.** Applied U1 and U2 in their existing owners; do not execute
the independent implementation units simultaneously against mutable shared exports.
Rebuild package exports after U2 before desktop consumers. Run G3/G4 once on the
combined final patch and G5 once after its browser regression is ready.

Add one `BNC-01` browser journey to the existing synthetic bridge: defer the
`tts_profile_configuration_available` response (deferring only the earlier host
probe is insufficient), navigate while checking, verify settlement/manual saving,
release the response and require a fresh explicit Play from the chosen position.
Reuse existing hooks with the smallest test-only addition; do not expose production
debug APIs. Run the existing paused-navigation and confirmed-audibility controls
in the same invocation. Default viewport, retries and timeouts remain unchanged.

The new red cases are already included in the final green suites. Do not rerun
them separately merely to collect another green receipt. Finish G6 static checks
before expensive native preparation. Update the current-behavior documentation.

### M3: current native integration, independent review and closeout

**Status: complete.** After fast gates, verify existing Piper payload integrity,
build one current executable and run one existing Piper EN native arm. ES and all
numeric edge cases are proved deterministically through public preparation, not by
duplicating real-model arms. Keep current native assertions and verified cleanup.

Freeze the complete source/test/documentation diff and evidence. Delegate one
read-only review to `change_reviewer` (GPT-6 Astra high), following the required
workflow and concurrency limit. The reviewer does not edit or run tests. Supply
exact base/HEAD, closed path identities, full new-file contents, commands, original
receipts, input/environment comparisons, failure dispositions and cleanup evidence.
Resolve findings and obtain APPROVE for the exact final patch; missing required
evidence or reviewer availability blocks acceptance, not a permission to bypass it.

After acceptance, archive this plan and update indexes. Reuse unaffected individual
gate receipts across documentation-only closeout only with documented dependency
proof and a new immutable assessment for the final reviewed patch. Implementation
Git mutations require their own authorization.

## Testing and benchmark strategy

### Historical evidence inspected and reusable material

Planning inspected original result/input JSONs and the relevant original log
summaries. A read-only PowerShell inspection outside the sandbox matched each
listed receipt's input-manifest and installed-before digests. **This verifies
historical receipt consistency, not today's complete environment or future code.**
No behavioral result is pre-approved for reuse as final acceptance.

| Historical evidence | Recorded result and planning inspection | Decision for execution |
| --- | --- | --- |
| [VUC ledger](../evidence/visible-locator-unicode-compound-corrections/execution-ledger.md), `G3-epub`, VUC-R1-20261101 | 232/232 in the three selected EPUB suites; exit 0, 43.76 s. Receipt SHA-256 `3c9c8be5286c4bbd79072b054060385e220206a4ab3c1fb240119a8852add5ba`; original 1,504-entry input digest and installed-before digest match. | Reuse existing tables/fixtures/collectors and commands. EJECUTAR affected EPUB suites after U2; the changed normalizer invalidates behavioral acceptance. No separate full EPUB sweep. |
| [RIA ledger](../evidence/reader-image-audibility-corrections/execution-ledger.md), `G2-desktop-final`, RIA-R1-20261101 | 439/439 in eleven suites; exit 0, 3.67 s. Receipt `1845b6fd2b87719940ec2f352d47db28db6c2066c84af4b49f4b9246688fa42f`; both original digests match, 1,514 recorded source inputs. | Reuse harnesses and assertion coverage. EJECUTAR only the four affected coordinator/controls/save suites, not all eleven. Changed coordinator/EPUB exports prevent reusing old results for the joined behavior. |
| [RIA CI follow-up](../evidence/reader-image-audibility-corrections/ci-follow-up.md), `browser-final` | 47/47 Chromium cases; exit 0, 3.6 min. Receipt `8a61a6a5b9cc489fd1f5e6c4e83ec4fe6bbf6760e982ce93677db24c5e51a30d`; both original digests match, 1,508 recorded inputs. Corrected RIA-03 observes settled `idle`, not transient `stopped`. | EJECUTAR the three selected cases against the new renderer. Preserve the corrected Stop observation. Do not repeat all 47 or claim the old renderer accepts this patch. |
| RIA `G5-harness-r2` | 50/50 native-harness unit tests; exit 0. Receipt `90fde0f6b01f76b1ccde310a0d8c98f7b7579964660d1edd900c8cbe8a1714da`; original digests match. The suite imports `@voxleaf/epub` and calls `prepareNarration`. | Do not recycle the aggregate based only on unchanged native script bytes. NO APLICA as an extra harness-development gate while its code is unchanged; G8 executes the current native integration. If the runner/fixture is edited, run its 50-case leaf freshly and renew affected integration evidence. |
| RIA `G0-reuse`, VUC package inputs/exports | Historical proof records 203 package/config/build inputs and all 251 output files, with equal membership and installed identities. Git inspection found no tracked package/shared/root-package/lock changes between `f2870ff` and planning HEAD. Current output bytes and complete environment have not been revalidated by this plan. | REUTILIZAR CON PRUEBA, conditional: pre-edit exports only, after checking complete consumed input/output membership and current installed tools. Rebuild after U2. Configured browser/Tauri hooks remain enabled. Artifact reuse is not a behavior PASS. |
| RIA `G6-core`, `G7-Piper-r2` and resource records | Core integrity exit 0; core receipt `0fd15465670db3d4efdb58c9d3be4c6ed600f267de0e39db6e8410db3206ee87` has matching original digests. The ledger records one six-rate Piper EN run, 60,303 ms quick observation, zero underruns, 719 ms cancellation and complete restoration. | Reuse installed core/voice files after current integrity proof, avoiding package/model regeneration. EJECUTAR one new current-renderer native arm without the six-rate matrix. Old timing/runtime results cannot accept changed narration. |
| [PSC ledger](../evidence/minimal-playback-state-corrections/execution-ledger.md), PSC-R2 | Final recorded coverage 210 unit cases and four browser controls; R1 rejected partial-result reuse with incomplete installed-library evidence. Later distinct reader/control receipts supplied acceptance. | Reuse the regression scenarios and evidence lessons. Never turn green subtests from a failed aggregate into a PASS or reconstruct missing original environment identities. |

Original local evidence roots, to inspect again at execution:

- `tmp/evidence/visible-locator-unicode-compound-corrections/run-01/`
- `tmp/evidence/reader-image-audibility-corrections/run-01/`
- `tmp/evidence/ria-ci-follow-up/`
- `tmp/evidence/minimal-playback-state-corrections/`

Use a distinct `tmp/evidence/narration-boundary-navigation-corrections/run-01/`
for new execution, or the next unused attempt ID. Do not overwrite old receipts.
Only after execution begins, create a concise tracked ledger/review record under
`docs/plans/evidence/narration-boundary-navigation-corrections/`. Keep private
paths, installed inventories, raw logs, book text and audio out of tracked files.

Any reuse requires the original immutable successful host receipt, full consumed
source/transitive imports, tests/fixtures, configuration/lock, generated artifacts,
glob membership, installed libraries/tools and relevant environment to match.
HEAD is an input if the runner consumes it. Explain every difference and the same
invariant proved; the independent reviewer assesses the proof. Missing proof means
rerun the affected gate. Preserve failed receipts, including RIA's diagnostic-log
environment delta; never relabel a failed strict comparison as a clean match.

### Minimum gate set

All future test/validation/build commands run from the repository root in a normal
local PowerShell session **outside the managed automation sandbox**. The commands
below are existing configured runners or their established selected leaves.
`BNC-` selectors refer to regressions to be added, not tests already present.

| Gate / timing | Existing command | Invariant, input scope and invalidation |
| --- | --- | --- |
| G0 preparation, before red if needed; after U2 | `pnpm.cmd build:packages` | Preparation only. Reuse pre-edit artifacts only by the proof above. U2 invalidates EPUB JS/declarations; renew before desktop consumers. Package sources, shared contracts, TS config, locks/compiler and complete exports matter. |
| G1 EPUB red, before U2 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts -t BNC-` | Reproduce BNC-02-05 on original production with actual public projection/segmentation. Require nonzero selection and the intended assertions, not setup failures. |
| G2 desktop red, before U1 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t BNC-01` | Deferred-admission/cleanup sequencing and actual persistence ownership. Include source, dependencies, fixtures, test setup, installed Vitest/jsdom and current package exports. |
| G3 final EPUB | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts` | Exact outputs, unchanged accepted corpus, code/language controls, all current profile routes, single/multiple-batch equality, source mapping, bounds/cancellation and legacy controls. Any changed consumed source/test/helper/config/export input invalidates the result. |
| G4 final desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts` | Admission, failure containment, existing paused navigation, usable controls, exact audible checkpoints and return to manual saves. Current coordinator and generated EPUB/shared outputs are consumed inputs. |
| G5 final Chromium | Exact PowerShell command below | One new BNC-01 journey plus VCA-06/09 paused placement and RIA-03 confirmed rendering. Current full browser spec, helpers, App/reader/coordinator, package/renderer output, Playwright/Vite/config and browser bytes. Keep three selected cases, no repeat-each/full sweep. |
| G6 static, before native preparation | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/desktop typecheck` | Execute and record each separately after final TS edits. Glob membership, installed tools, config and generated declarations count. Do not repeat root build/type/test aggregates. |
| G7 native preparation, after G3-G6 | `pnpm.cmd package:piper-core:check`, then `pnpm.cmd build:desktop` | Current core integrity; one current executable with changed renderer/normalizer. Reuse unchanged payload bytes, not an old binary. Capture complete resource and renderer/native artifact identities. No installer/package regeneration. |
| G8 combined native integration | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | Existing complete quick/prepared, synchronization, active cancellation and cleanup assertions on the G7 executable. Not a new model benchmark or proof of the deferred-availability race; G2/G5 own that proof. Include runner, renderer, EPUB, native, Python, runtime/voice, WebView/driver and environment identities. |
| G9 final documentation and independent review | `pnpm.cmd check:evidence`; `git diff --check`; local relative-link/consistency inspection; then `change_reviewer` | Content-safe evidence, current docs, closed reviewed paths and exact host receipts/cleanup. New code/test edits invalidate consumed gates; documentation-only changes still require final current-patch review. |

G5 uses the established PowerShell quoting form so the Windows `.cmd` shim does
not split the regex:

```powershell
pnpm.cmd --% test:browser reader-narration-bugfixes.smoke.spec.ts --grep "BNC-01|VCA-06/09|RIA-03"
```

Do not run a separate browser red: the deterministic G2 reproduction establishes
the race, while G5 validates the actual product wiring. If that reproduction
cannot establish reachability, diagnose the missing boundary and justify a focused
browser red before production edits. Do not broaden the matrix automatically.

NO APLICA under this allowlist: root `check`/`check:portable`, full desktop/browser
sweeps, direct scanner/packer suites already covered by the public segment proof,
Rust/Python suite matrices, optional models, all languages/speeds, DSP/listening,
installer/signing, firewall/model-performance and image-decoder arms. This is an
impact-based exclusion, not reuse of historical PASS. Editing those owners or
finding a relevant failure requires a documented gate adjustment. Later authorized
publication still must satisfy applicable CI; this plan does not waive it.

Native readiness must verify existing driver/WebView compatibility, exact runtime
and voice identities, writable short scratch paths, disk and ownership permissions
before a build/run. Retain configured hooks; inspect stale resources rather than
regenerating packages indiscriminately. If adjacent resources must be staged,
snapshot complete membership/hashes, use task-owned backup paths and restore in
`finally`. Verify restoration, backup absence, created-process PID/creation-time/
executable identities, scratch roots, retained PCM, audio files and closed contexts.
Do not kill unrelated processes or delete pre-existing scratch. Failed cleanup
blocks acceptance even if behavioral assertions passed.

Capture each gate's command, HEAD, inputs, start/end/duration, environment, exit,
result and failure stage at execution time. Freeze the patch before expensive
gates. Run the new red subset once and each final affected group once; renew only
invalidated gates after a fix/review. No automatic retries: diagnose first, retain
the first receipt and allow at most one infrastructure retry per unchanged gate
with a concrete cause. A code/test correction is a new input revision, not a way
to erase failure history or reset an unresolved infrastructure retry budget.

## Risks and rollback

- Overbroad punctuation acceptance could expand a component of a larger expression.
  Pair ordinary-punctuation positives with existing decimal/date/time/currency/sign
  negatives. Preserve source provenance and code/language separation.
- Scanning across invisible marks or spacing could exceed bounded work or cross
  semantic barriers. Keep fixed lookaround, conservative uncertainty and the
  current work-accounting envelope; run the focused resource suite.
- A navigation fix could resume after Stop/close, erase cleanup failure or change
  paused semantics. Keep revision/ownership guards and verify those interleavings.
- A false acceptance could come from stale exports, a historical binary or partial
  green results. Bind every gate to its actual consumed inputs and current artifacts.
- A failed native run can leave resources/processes. Verified cleanup is required
  before a retry or final acceptance; retain failed restoration evidence.

Keep a reviewable diff for each owner. If a change violates the closed grammar,
mapping or lifecycle contract, stop that unit, preserve evidence and correct only
task-owned edits. Do not use destructive Git cleanup or touch unrelated work.
Any later rollback commit requires authorization; no legacy authority or receipt
is rewritten to make a candidate pass.

## Progress log

- 2026-11-01 closeout: BNC-R2-20261101 independently approves the corrected
  patch, both R1 dispositions and the two proven reused gates without findings.
  Archived this plan after host/native/cleanup acceptance and updated indexes.
  Only documentation changes follow that approval; final archival assessment
  is retained in the immutable review record. No Git/publication action performed.
- 2026-11-01 review: BNC-R1-20261101 returned CHANGES_REQUESTED for two BNC-02
  combinations at mixed-language marks and within EUR. Eight additional red
  cases reproduced both before production correction. Bounded fixes stay in
  U2; run-02 renews invalidated gates, with run-01 and the original review retained.
- 2026-11-01 review correction: run-02 passes 265 EPUB, 194 desktop and three
  Chromium cases; renewed format/lint/EPUB types, build and Piper EN native arm
  pass. Desktop types/core integrity are reused from run-01 with complete proof.
  Final native cancellation is 774 ms with zero underruns/audio persistence;
  resources/processes/scratch/context cleanup and installed identities pass.
- 2026-11-01 execution: exact plan branch/HEAD verified; clean worktree/index.
  User authorization supersedes planning-only scope. G0 rebuilt exports after
  strict historical installed-identity comparison differed. No historical PASS
  reused. New immutable receipts and failure dispositions are in the
  [execution ledger](../evidence/narration-boundary-navigation-corrections/execution-ledger.md).
- 2026-11-01 execution: all five findings reproduced before their production
  edits. U1/U2 implemented in exactly the two expected owners. Final selected
  deterministic groups pass (257 EPUB, 194 desktop); three Chromium journeys
  and all four static gates pass. Failed attempts remain retained.
- 2026-11-01 execution: canonical system diagram and M005/roadmap boundary
  reviewed; no architecture, process, persistence, schema or preparation limits
  change. No completed plan, historical normalizer, corpus or hash is edited.
- 2026-11-01 execution: G7/G8 pass on the current executable and integrity-checked
  existing core. Original resources restored; no new owned process/scratch,
  retained PCM or generated audio files remain. G9 passes; exact current-patch
  review and subsequent archival assessment remain pending.

- 2026-11-01: Revalidated all five chat findings at planning HEAD using source,
  callers, tests and historical patches; no test/model execution or production edit.
- 2026-11-01: Read planning/review requirements and inspected original VUC/RIA
  result/input records and log summaries. Historical receipt digests match;
  complete current environment/artifact reuse remains conditional.
- 2026-11-01: Created the requested local plan branch from clean `main`. Added
  this plan and active-index entry only. Implementation milestones remain pending.

## Discoveries and decisions

- Keep five findings; operator/spacing/cleanup variants belong to their existing
  root cause, not extra work items. BNC-05's concrete segment split replaces the
  earlier unsupported inference about pronunciation of unchanged digits.
- BNC-01 uses inactive, explicitly restartable settlement after rejected automatic
  start. This releases manual persistence without adding autoplay/retry semantics.
- Prefer two production owners. The normalizer must supply correct protected
  units, and the coordinator must supply truthful intent; consumers keep their roles.
- Minimize execution by reusing fixtures, current payloads and provable pre-edit
  exports, batching final affected checks and running one native language arm.
  Do not recycle changed-behavior results or repeat full historical matrices.
- The current native-harness unit aggregate consumes EPUB, despite its unchanged
  script name. Its old 50/50 is not a valid blanket reuse claim after U2.
- Planning-only documentation does not change runtime/contracts/acceptance tests;
  independent behavioral review is exempt for this plan commit. M3 explicitly
  requires `change_reviewer` approval for the eventual implementation.

## Final validation results

Implementation and independent acceptance complete. G0–G9 pass within the
selected scope, including freshly reproduced BNC-01–05 and final combined groups.
The [execution ledger](../evidence/narration-boundary-navigation-corrections/execution-ledger.md)
records original commands, counts and all failed-attempt dispositions. Native
integration and cleanup verification pass. BNC-R2-20261101 approves the exact
implementation. No historical behavioral PASS or implementation Git action is claimed.
The final code revision is the BNC-R1 correction in run-02; the ledger distinguishes
renewed results from the two proven reused gates. Final documentation-only archival
assessment is retained separately without rewriting earlier reports.
