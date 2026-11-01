# Eight revalidated findings: minimal corrections

## Goal

Correct the seven statically confirmed findings and resolve the conditional PNG
finding from the six-pass code review, using the smallest changes to their
existing owners. This is a correctness batch spanning EPUB ingestion, the reader,
narration admission and maintainer evaluation tools, so its descriptive filename
intentionally spans roadmap milestones 3, 4, 6, 10 and 11.

**Planning only, 2026-11-01.** The user authorized this ExecPlan, a branch and a
local documentation commit, explicitly not implementation or test execution.
Implementation, new tests, builds, host exercises and acceptance below are future
work. No push, PR, merge or publication is authorized by this plan.

## User-visible outcome

- Supported oriented PNGs render under the verified browser/runtime behavior.
- Returning to an already open contents panel focuses it. Settings retains focus
  when an earlier chapter-navigation operation completes behind the dialog.
- Replacing the book during optional Chatterbox removal cannot admit premature
  narration. Removal completion never autoplays the replacement book.
- Restart narration is actionable only when its coordinator can admit recovery.
- An internal/contents link to a supported fallback chain resolves to the accepted
  local XHTML instead of making the whole EPUB fail to open.
- Maintainer quality commands report failed cleanup, and the RAM probe never
  forgets an observed zero. These last two corrections are tooling behavior,
  not a change to the reader's audio-persistence policy or model admission.

## Current state

Planning source: `bc3cc9faade9d1ca7c4dc0c6209aaaeed1fb205d` on clean `main`.
Planning branch: `codex/eight-revalidated-findings-plan`. The working tree and
index were clean before branch creation. All eight findings were re-examined
against this source; none was reproduced by executing code in this review.

| ID | Finding and reachable condition | Current evidence / qualification |
| --- | --- | --- |
| R8-01 | A rectangular PNG with EXIF orientation 5-8 has different raw and presented dimensions. | `raster-image-policy.ts::parsePng` ignores `eXIf`; `raster-image-source.ts::performPrepare` requires exact natural dimensions. Conditional on the actual decoder applying orientation; the installed WebView2 was not tested. |
| R8-02 | Successful synthesis followed by an exception from adapter cleanup still returns quality success/readiness. | Six quality generators suppress `close()` exceptions. MOSS cleanup can raise from `shutil.rmtree`; this does not establish a permanent GPU leak or prove leftover files contain generated audio. |
| R8-03 | Available-RAM samples `8 GiB -> 0 -> 6 GiB` report `6 GiB`. | `WindowsAvailableRamProbe` uses zero as both initialization sentinel and a measured minimum. Downstream memory gates/observations can miss the low point. |
| R8-04 | Activate Back to table of contents while contents are already open. | `focusTableOfContents` sets the same boolean; its focus effect depends only on that boolean. Existing coverage opens the initially closed panel. |
| R8-05 | Piper is selected, Chatterbox removal is pending, Settings closes, another book opens and Play is requested before removal settles. | `removeChatterbox` leases only the old coordinator. `App` replacement waits for its close, which does not join that external operation. The new owner can pass Piper availability while native removal holds admission; native start returns `Busy`. Native exclusion itself is correct. |
| R8-06 | Chapter navigation waits for narration cancellation; the user opens Settings before that wait finishes. | `ReaderPublication` subsequently focuses its destination; the dialog's Tab/Escape handlers are local and it has no guard against programmatic focus escape. |
| R8-07 | The spine accepts scripted `original.xhtml` through `fallback="safe"`, but the TOC links to `original.xhtml` without a fragment. | Package fallback resolution succeeds; navigation admits only directly supported paths and throws `broken-reference`, aborting open. XHTML internal links have the same omission. |
| R8-08 | A recoverable, successfully contained service failure is followed by an automatic hardware recheck that makes narration unavailable. | The recovery controller retains `canRecover`; controls display Restart, but `recover()` returns without action because availability is not `available`. This is an eligibility/presentation defect, not authorization to bypass recovery checks. |

For R8-01, upstream [Skia's PNG codec](https://raw.githubusercontent.com/google/skia/main/src/codec/SkPngRustCodec.cpp)
reads EXIF origin and [Chromium's image loader](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/loader/image_loader.cc)
respects orientation for natural size. These sources explain the hypothesis;
they do not establish which bytes/behavior the installed runtime uses.

## Scope and non-goals

### Minimal correction decisions

**R8-01 — conditional, bounded metadata correction.** First add one valid,
repository-authored rectangular PNG to the existing raster fixture family and
observe its decoded dimensions in the current browser. Establish the packaged
WebView2 behavior as well before accepting a new orientation policy. If the
condition is absent, record the result and defer this finding without a
speculative production change. If present, reuse the existing bounded IFD0
orientation logic for PNG `eXIf`, separating only the JPEG-specific envelope
where necessary. Keep both byte orders, exact metadata/decoded-dimension
agreement, width/height/pixel caps and malformed/duplicate-tag rejection. Do not
permit arbitrary swapped dimensions or add an EXIF dependency. If supported
engines disagree, resolve that compatibility policy before accepting a patch;
do not fix one engine by breaking images on the other.

**R8-02 — expose cleanup failure at the six existing entry points.** Cover
`quality.py`, `bilingual_quality.py`, `corrective_v9_quality.py`,
`chatterbox_v10_quality.py`, `chatterbox_v11_quality.py` and
`corrective_v12_quality.py`. A cleanup-only failure must prevent a success/ready
return and use the existing content-free error/CLI failure path. Close once;
preserve an existing generation failure if cleanup also fails. Reuse each
workflow's owned-session failure cleanup, leaving approved/private quality
audio retention unchanged on success. Prefer a small local control-flow change
at each caller; introduce a shared helper only if it actually reduces these six
equivalent cleanup responsibilities without changing their error contracts.
Do not alter adapters, frozen evaluation authorities, historical decisions or
the result schema merely to report this failure.

**R8-03 — remove sentinel ambiguity.** Initialize the minimum to `None` and
accumulate all integer readings, including zero. Preserve the existing stop
policy for unavailable/nonpositive results and probe failures, thread join and
sampling interval. No new memory threshold, audit policy or hardware probe is
needed. The zero observation must remain visible to that existing failure path.

**R8-04 — focus an already mounted TOC immediately.** In the current click
handler, focus the existing navigation element when open; use the existing
post-open effect only for the closed-to-open transition. Keep default-anchor
prevention, URL/history stability and the reader locator unchanged.

**R8-05 — keep removal admission owned by App across book replacement.** Track
the pending removal in the existing application lifetime, synchronously before
its first asynchronous step. Make narration creation/admission and replacement
handoff respect this pending operation, including when no old coordinator is
present. Prefer extending the existing close/handoff barrier and a bounded
pending owner over adding a global state framework. Retain the current
coordinator configuration lease and native exclusion. Release pending ownership
on success or failure, retain the existing removal diagnostic, and require
ordinary availability/containment before explicit Play. Book opening and visual
reading may continue. Do not add automatic retries, change native `Busy`
semantics, lose the replacement's visible locator, or revive an old owner.

**R8-06 — enforce modal focus ownership in Settings.** Extend the existing
open-dialog effect with a scoped focus-containment listener/guard. A focus
attempt outside the open dialog returns to a valid dialog control. Remove the
listener on close/unmount and preserve Escape, Tab, pointer dismissal and focus
restoration. This lets the already authorized navigation settle its locator
without taking modal focus. Do not cancel navigation, stop narration merely for
opening Settings, add a UI dependency or introduce a second TOC focus trap.

**R8-07 — resolve references through the already validated fallback relation.**
Use package-internal manifest/spine data to translate a local original path to
its accepted local XHTML target before navigation or inline-link projection.
Share only the small resolution responsibility needed by those two consumers;
do not duplicate or rewrite package parsing. Preserve first-occurrence behavior
for direct links, and the correct source spine occurrence when distinct
originals share one fallback. Keep fragment matching and unavailable-fragment
behavior; never invent an anchor. Carry existing spine identity through public
navigation projection if needed. Preserve external-link rejection, finite chain
limits, cancellation budgets and missing/cyclic/unsupported-chain failures.
No public type/schema change or network lookup is required.

**R8-08 — match Restart eligibility to admission.** Restrict the existing
presentation predicate using current availability and reader/admission state
already exposed by the snapshot; preserve the coordinator's guard. Show the
existing appropriate availability/recovery explanation when disabled. Do not
reset the failure episode, consume a recovery attempt or restart automatically
on an automatic compatibility refresh. Add a snapshot field only if inspection
proves existing fields cannot express a necessary guard, with explicit scope
review rather than a silent contract change.

### Exclusions

No unrelated refactor, new dependency, shared protocol/schema, normalization or
segmentation policy, DSP, buffer limit, TTS adapter, model/voice version,
installer/uninstaller, real download, firewall change, user-data mutation or
release publication. Python changes belong only to maintainer benchmarks.
Do not regenerate the Piper core or published Chatterbox v7 for these changes.
Preserve historical evidence, completed plans and frozen authorities.

## Relevant files and documentation

This is a prospective path scope, not an instruction to edit every listed
file. Freeze exact chosen paths before implementation; expand only for a
demonstrated dependency and record the reason.

| Unit | Production owners | Existing regression/support owners |
| --- | --- | --- |
| Raster / 01 | `apps/desktop/src/reader/images/raster-image-policy.ts`; `raster-image-source.ts` only if decoder reconciliation requires it | Their two tests; `apps/desktop/tests/fixtures/oriented-raster-epub-fixture.mjs`, `jpeg-fixture.ts` and a small PNG fixture helper if necessary; `foundation.smoke.spec.ts`; native startup smoke |
| Tooling / 02-03 | The six `services/tts/benchmarks/*quality.py` files above; `bilingual_baseline.py` | `services/tts/tests/test_benchmark_quality.py` and `test_benchmark_bilingual_baseline.py`; the latter already parameterizes all five versioned generators. No new harness is needed. |
| Desktop / 04-06,08 | `apps/desktop/src/reader/ReaderPublication.tsx`, `App.tsx`, `settings/ReaderSettingsDialog.tsx`, `tts/ProductNarrationControls.tsx`; `settings/narration-settings-actions.ts` only if its call boundary needs adjustment | Corresponding tests; `tts/product-narration-coordinator.test.ts` for recovery/lease controls; existing browser mock transport and Settings helpers |
| EPUB / 07 | `packages/epub/src/navigation/navigation-target-resolver.ts`, `document/xhtml-projector.ts`; `package/package-document.ts` and `public/open-epub-publication.ts` only for bounded shared resolution/occurrence projection | Existing package, navigation, NCX, projector, public-open, target-resolution and ingestion-matrix tests; `packages/epub/test-support/epub-fixture.ts` |
| Browser/native acceptance | No native production change selected | `apps/desktop/tests/browser/{foundation,reader-reflow-restoration,reader-narration-bugfixes}.smoke.spec.ts`; `apps/desktop/scripts/native-startup-smoke.mjs`; configured Node harness tests only if their consumed runner/helper changes |

Authorities read for this plan: [MVP](../../product/mvp.md),
[Settings/accessibility requirements](../../product/reader-settings-and-playback-controls.md),
[overview](../../architecture/overview.md), [system diagram](../../architecture/system-diagram.md),
[roadmap](../roadmap.md), [EPUB boundary ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md),
[raster ADR-0010](../../architecture/decisions/ADR-0010-bounded-raster-image-decode.md),
[bounded JPEG ADR-0066](../../architecture/decisions/ADR-0066-bounded-orientation-and-silent-tail-corrections.md),
[recovery ADR-0019](../../architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md),
[testing](../../development/testing.md), [evidence retention](../../development/evidence-retention.md)
and [independent change review](../../development/agentic-change-review.md).
Update maintained behavior/testing documentation only for implemented changes.
If PNG is admitted, record its bounded extension separately from the historical
JPEG validation claim. Review the diagram at closeout; its topology should remain
unchanged. M005 preparation is outside scope; read its completed plan and replan
before expanding into that boundary.

## Architecture and constraints

Keep EPUB parsing framework-independent and browser focus in the desktop owner.
Keep native removal exclusion intact and application admission above it. The
visible locator, narration start, highlighting and persisted position must remain
consistent across a replacement. Do not weaken verified cleanup or permit stale
PCM. EPUB text/audio remain local; diagnostics contain fixed codes, not content,
paths or raw exceptions. Use synthetic fixtures, deterministic deferred promises
and model-free adapters for regressions. No sleep-based race or real RAM
exhaustion is necessary. Parser work and resources remain bounded.

This is a behavioral correction plan, not a refactor campaign. Its future
acceptance uses `change_reviewer`, not a refactor worker/validator workflow.
Evidence-reuse principles below follow the repository's
[canonical validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
without imposing unrelated refactor unit ceremonies.

## Milestones

### M0 — Scope, evidence and conditional reproduction

**Status: not started.** Obtain implementation authorization; check current HEAD
and preserve unrelated work. Capture actual input membership, dependencies,
installed tools and host state before any gate. Freeze chosen paths and test
filters. Establish R8-01's Chromium condition with the bounded fixture; retain
WebView2 confirmation for G8 on the one final executable, before acceptance.
Add the new regressions to existing harnesses and run only those discriminating cases on
unchanged production, grouped by runner. Existing passing controls can share
these invocations. No full-repository or per-finding baseline campaign.

### M1 — Minimal production corrections and combined fast gates

**Status: not started.** Apply the bounded changes above. Run the selected EPUB,
desktop and Python groups once on the combined relevant edits, followed by
their affected format/lint/type checks. Fix only actionable failures, preserve
original receipts and rerun only invalidated groups. A shared helper/test change
invalidates all consumers of that helper, not merely the last edited case.

### M2 — One integration/host cycle

**Status: not started.** Run the selected Chromium journeys on final source.
After fast gates pass, verify existing Piper payload integrity, build one current
desktop executable, run the model-free WebView2 smoke and one Piper EN arm using
those same executable bytes. Integrate PNG/focus checks into existing native
smoke ownership; keep its existing cleanup. No GPU/listening/second-language or
installer campaign is selected. A required blocked gate remains pending; do not
replace it with an old artifact's PASS.

### M3 — Independent acceptance and closeout

**Status: not started.** Freeze final code, tests and maintained documentation;
send exact scope, diff, identities and host receipts to `change_reviewer`
(GPT-6 Astra high). The reviewer reads without editing/running tests. Require
APPROVE for the exact current patch, including any retained-gate decisions;
resolve findings with only affected reruns. Missing evidence/reviewer blocks
implementation acceptance. Move the plan and update indexes only after required
gates and cleanup pass. Future implementation Git actions require their own
authorization; this planning commit does not grant it.

## Testing and benchmark strategy

### Prior evidence inspected and what can be recycled

The following are recorded historical results, not executions for R8. Original
local receipts are available for the latest F4 run. Reusing fixtures, prepared
artifacts and test outcomes are three different decisions.

| Prior evidence | Recorded result | Decision for this batch |
| --- | --- | --- |
| [SAC ledger](../evidence/static-audit-corrections/M3-validation-ledger.md), `N1-native-02` and browser raster coverage; SAC-R3-20261028-01 | Oriented JPEG decode/release passed in Chromium and WebView2. | Reuse the fixture family and assertions. Renew selected image tests and native decode when parser/fixture/renderer inputs change. JPEG PASS proves nothing about PNG `eXIf`. |
| [MAF ledger](../evidence/minimal-audit-findings-corrections/execution-ledger.md), MAF-04; MAF-R1-20261029 | Same-owner removal admission and native stop/delete/start exclusion passed, including failure/retry controls. | Extend the existing deferred-removal browser/App harness to two books. The old same-owner result does not cover R8-05 and is not a fresh acceptance result. Preserve native guards and existing same-owner controls. |
| [PSC ledger](../evidence/minimal-playback-state-corrections/execution-ledger.md), `G2`/`R2-G2-readers`, `G4`/`R2-G4-controls`; PSC-R2-20261031 | Final 210 selected unit tests and four browser cases passed; one Piper EN native arm passed. | Reuse admission, recovery, reader-focus and transport doubles. Changed App/reader/control/browser inputs require their selected new runs. Do not rerun unrelated DSP or the whole desktop suite just because it was used historically. |
| [F4 ledger](../evidence/four-finding-minimal-corrections/execution-ledger.md), `G-RUST-default`, `G-RUST-locked`, Rust static gates; F4-R2-20261031 | Supervisor 35/34 passed, five ignored in each mode; Rust format/two-mode Clippy passed. | Candidate unchanged-boundary results, subject to full input/environment proof and independent review. Native production is outside the proposed patch. No blanket Rust matrix is selected solely for frontend/Python-tool edits. If the result becomes necessary and independence cannot be proved, run the affected native module, not every unrelated suite. |
| F4 `G-DESKTOP`/`R2-G-DESKTOP-coordinator` and `G-EPUB` | Selected desktop and EPUB suites passed; final coordinator renewal passed 148 cases. | Test source is reusable. No old result can validate changed admission/presentation/navigation or the new fallback path. Normalizer/DSP/control-protocol campaigns are outside this correction scope. |
| F4 `G-CORE`, `G-BUILD`, `G-NATIVE` | Existing core integrity and one rebuilt Piper EN arm passed with original resources restored. | Reuse the current core/voices as prepared artifacts after integrity/readiness verification. Do not regenerate core: runtime Python and builders do not change. Renderer/executable results are invalidated; build once and run one current arm. The restored adjacent resource directory may be stale and must not be assumed valid. |
| [R7 ledger](../evidence/seven-finding-minimal-corrections/execution-ledger.md), `G5-python`, `G6`, `G9` | 17 isolation/dual-worker tests; optional-module 64 per mode; supervised Chatterbox ES/EN and integrity passed. | Reuse fixture/cleanup lessons only where relevant. These results cover different defects and older shared inputs. They do not validate R8-02/03; no repeat GPU/model evaluation or broad Python/Rust suite is selected. |

Read-only planning inspection verified F4's original result digests:

- `G-RUST-default-result.json`: `e4e204cdaf97cc83a0afbd8c0491fb59dac633514f0d3597181262c065d4014a`.
- `G-RUST-locked-result.json`: `7222de734e35f1d5062f194e83ed96aef7420df9fabbdeab5abb60d290ef8c70`.
- `G-CORE-result.json`: `849bdbbaa61064d9b47a879b0dc58189aa3a7a15e697338629a95791fcb8003b`.

They are under `tmp/evidence/four-finding-minimal-corrections/run-01/` with
original input manifests and logs. The default Rust input manifest digest is
`c98cd6f06aea4c9317b479bc9f16674a293f9eae1ff6e6baae6fb6b641b38f03`.
All 51 recorded entries selected by `apps/desktop/src-tauri/**` plus recorded
root package/lock/toolchain paths match the planning workspace. This is a
partial source comparison, not complete dependency or host acceptance. The
initial native comparison has `environmentEqual: false`; F4's later R2/R3
reports record an approved environment/input proof. Retrieve that final proof
rather than treating the initial file as either complete reuse evidence or a
retraction of historical acceptance. Current R8 environment equivalence still
needs verification. No historical PASS is pre-approved for R8 by this plan.

Before any actual result reuse, retrieve the immutable receipt and prove the
complete consumed source/import closure, discovered membership, fixtures,
config/locks, generated exports, installed tools/libraries and relevant host
conditions match. Bind original report/gate IDs in a new review. Treat HEAD as
an input when consumed. A summary/count, matching filename, source-only hash
comparison, failed aggregate or old review approval is insufficient. PSC's
prior review rejected partial-result reuse for missing installed-library/browser
identity; do not repeat that mistake. When proof costs more than a cheap focused
run, run that small group. Preserve all failed/superseded receipts.

### Minimal new regression coverage

- **01:** Valid non-square PNG, both TIFF byte orders, orientation/no-orientation
  controls, malformed/duplicate metadata, exact budgets and unexpected decoder
  dimensions; retain JPEG controls if its parser is shared. One browser fixture
  establishes actual decode and release; native verifies the supported runtime.
- **02:** Reuse `test_benchmark_bilingual_baseline.py`'s existing five-version
  parameterization plus `test_benchmark_quality.py`'s adapter injection. Cover
  cleanup-only failure, generation plus cleanup failure, exactly-once close and
  successful output. Assert public result/error and owned-file effects, not just
  that a mock was called. No real model or generated speech is needed.
- **03:** Controlled Windows API readings, including `8 -> 0 -> 6`, normal
  decreasing/increasing values and probe failure. Assert the public stop result
  or existing failure code; never exhaust real RAM or depend on timing.
- **04/06:** Already-open and closed TOC; pending chapter navigation followed by
  Settings open, settled locator, retained modal focus, Tab/Escape and restored
  trigger focus. Reuse existing normal-navigation and lifecycle-neutral controls.
- **05:** Mounted App/browser with deferred removal, book A replaced by B,
  attempted start while pending, successful/failed settlement, explicit later
  Play at B, and stale A completion. Include the no-old-coordinator case. Observe
  zero premature start dispatch, rather than only a disabled-looking button.
- **07:** Public EPUB open and target resolution for a scripted original with a
  safe fallback and TOC/inline links; direct supported links, fragments, shared
  fallback occurrences and NCX consumers. Reuse missing/cycle/budget/external
  negative fixtures. Assert locator identity and no exposed publisher paths.
- **08:** Recoverable failure then automatic unavailable/checking observation;
  control is disabled/absent with a useful existing explanation, no recovery
  attempt/start. Available recovery and later explicit retry remain controls.

### Selected future commands

Run from `<repo-root>` in **normal local PowerShell outside the managed
automation sandbox**. These are existing configured commands or their existing
runner leaves. `R8-` / `r8_` are labels for future regressions, not claims that
tests already exist. Keep package/browser build hooks and record preparation
separately. Do not execute this table during the planning-only task.

| Gate | Command / timing | Invariant and invalidation |
| --- | --- | --- |
| G0 — inspect/preparation | Before edits, compare retained inputs and current tool/host state. `pnpm.cmd build:packages` only when current exports cannot be proved; rebuild exports after R8-07 before desktop consumers. | Fresh exports are prerequisites, not behavior PASS. Changed package sources/configuration invalidate them. No broad baseline is required. |
| G1 — discriminating regressions | Before production edits, use the G2/G3/G4 file lists with `-t R8-` for Vitest or `-k r8_` for pytest; run the new PNG browser case with the existing browser command and `--grep R8-01`. | One grouped red invocation per runner/unit timing; setup failures do not establish a bug. Capture unchanged production plus new tests. Do not repeat full green suites before every fix. |
| G2 — EPUB | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/package/package-document.test.ts src/navigation/navigation-document.test.ts src/navigation/ncx-navigation-parser.test.ts src/document/xhtml-projector.test.ts src/public/open-epub-publication.test.ts src/locator/target-resolver.test.ts src/integration/ingestion-matrix.test.ts` once after EPUB edits. | Fallback/open/locator correctness plus negative ingestion controls. Consumes package/shared sources, tests, fixtures, configuration and exports. No normalizer corpus selected unless that boundary changes. |
| G3 — desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/images/raster-image-policy.test.ts src/reader/images/raster-image-source.test.ts src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/product-narration-coordinator.test.ts` once on combined desktop/EPUB inputs. | New mounted races and existing admission/recovery/focus/image controls. If R8-01 is deferred and image inputs remain unchanged, omit its two files. Consumed test/helper/export changes invalidate affected leaves. |
| G4 — Python | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py services/tts/tests/test_benchmark_bilingual_baseline.py` once after tooling edits. | Six quality entry points and the RAM probe through the existing shared parameterization; model-free. Add another existing test file only if an actual changed dependency requires it. |
| G5 — fast static checks | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`, each once after its final edits. | Existing inexpensive checks, including desktop browser-test typing. Globbed input membership/config/locks/tools are inputs. Renew affected checks only after later edits; no Rust static sweep if Rust/build inputs are untouched and no relevant gap exists. |
| G6 — Chromium | The filtered command below, once on the combined patch. | Current renderer, PNG/TOC/modal/replacement/recovery/fallback journeys plus selected existing controls. Consumes bundle, fixtures, mocks, configuration and installed Chromium. No full browser/performance matrix. |
| G7 — native preparation | `pnpm.cmd package:piper-core:check`, then `pnpm.cmd build:desktop` once after fast gates. | Reuse verified core payload; create current renderer/executable. Record discovered adjacent resources and executable identity. No core regeneration, NSIS bundle or download. |
| G8 — WebView2 | `node apps/desktop/scripts/native-startup-smoke.mjs`, then `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` on the same executable. | Model-free raster/focus/open/resource checks, then one existing Piper EN integration arm for current App admission/recovery wiring. Its existing rate/cancellation assertions remain enabled. No second build or full bilingual portfolio. Changed executable, consumed runner or environment invalidates the applicable arm. |
| G9 — runner tests, conditional | `pnpm.cmd test:native-smoke-harness` before G7 when the native startup runner or its helpers change; other existing configured Node leaves only for their changed runner responsibilities. | The current suite imports `native-startup-smoke.mjs`, so the planned PNG/focus extension requires this leaf once. Preserve cleanup/failure behavior; inspect actual imports if choosing a different implementation path. |
| G10 — documents/review | `pnpm.cmd check:evidence`, `git diff --check`, local-link/contract consistency inspection and independent exact-patch review after documentation is final. | Content-safe scope, current links, exact review identities and cleanup. These are future implementation closeout checks, not executed planning results. |

```powershell
pnpm.cmd --% --filter @voxleaf/desktop test:browser --grep "R8-|SAC-09|MAF-04|RAC-01|CHAT-AUDIT shared fallback|operates reader landmarks"
```

Preserve the literal regex with PowerShell's stop-parsing marker; PSC recorded
a prior quoting failure. The G6 selection extends existing fixture/control
journeys rather than duplicating their whole matrices. If an existing selected
case is extended instead of adding an R8 case, retain its name in the filter.
Assert each intended case was selected; an empty selection is not acceptance.

Do not run `pnpm check`, `check:portable`, the full monorepo test aggregate,
full Python/Rust sweeps or model portfolios in addition to these gates without
a concrete uncovered dependency/failure. CI, if separately requested later,
retains its configured requirements. Future approval may narrow redundant
leaves with proof, but cannot silently drop a required invariant.

## Risks and rollback

- PNG behavior is engine-dependent. Keep the conditional outcome explicit;
  require both supported surfaces before accepting changed metadata semantics.
- Fallback aliases can select the wrong occurrence or invent a fragment. Public
  locator assertions and existing shared-fallback controls are acceptance gates.
- Removal state must survive replacement without stranding admission on failure.
  Keep an App-owned bounded lifetime and verified handoff; do not weaken native
  safety to make a frontend test pass.
- A modal focus guard can loop or survive unmount. Test inside/outside focus,
  close/unmount and restoration while preserving navigation settlement.
- A cleanup correction can mask the original generation error or remove
  legitimate quality outputs. Preserve error precedence and exact owned roots.
- Historical tool/library/browser identity may be incomplete. Missing proof
  requires a fresh affected check, not reconstructed acceptance evidence.

Before native host mutation, journal exact owned scratch, process identities
(PID plus creation time/executable) and any temporarily staged adjacent resources.
Preserve and restore pre-existing directories with complete membership/hash
verification. Use existing versioned runners; do not grow an untested temporary
orchestrator or delete personal installations. At most one infrastructure retry
per stage after a recorded corrected condition; inspect unresolved stalls and
preserve the failure. Product/test fixes justify only affected reruns. Unverified
cleanup blocks host acceptance.

Rollback a correction by reverting its own focused source/test change, preserving
other work. No data migration, package replacement or schema rollback is expected.
If native production, runtime packages, normalization or public contracts become
necessary, stop that unit for explicit replanning of scope and gates.

## Progress log

- 2026-11-01: Revalidated the eight findings statically on `bc3cc9f`: seven
  supported by current local paths; PNG conditional on decoder behavior.
- 2026-11-01: Inspected current owners, requirements, configured runners,
  existing regression harnesses, SAC/MAF/R7/PSC/F4 ledgers and F4 original
  receipts. Recorded partial unchanged native-source evidence and its limits.
- 2026-11-01: Created `codex/eight-revalidated-findings-plan` from clean main.
  Authored this prospective plan and indexed it. No implementation/test/build
  command executed; all implementation milestones remain not started.

## Discoveries and decisions

- Quality suppression occurs in six mutable tooling entry points. Existing
  bilingual-baseline tests already parameterize the five versioned generators;
  extend that harness plus the original quality test rather than add six suites.
- Native removal exclusion is already correct. The bounded correction belongs
  to application admission across publication lifetimes, not native locks.
- Inline XHTML links share the fallback omission. Correct that same resolution
  boundary with TOC handling instead of leaving the public opener vulnerable to
  the next link in the accepted publication.
- F4 native input hashes partly match, but current environment equivalence is
  not established. Historical approval cannot serve as new R8 acceptance.
- Reusing model payloads and omitting unrelated model/installer campaigns avoids
  the largest unnecessary preparation cost. Changed browser/native application
  behavior still needs the selected current-artifact evidence once.
- The existing diagram remains the intended topology. This planning change
  documents proposed work only and makes no new implemented-feature claim.

## Final validation results

**Planning deliverable only.** Source, policy, receipts and Git state were
inspected read-only; branch creation is the authorized Git mutation. The
documentation commit is limited to this plan, `docs/plans/active/README.md` and
`docs/README.md`. No product source, tests, manifests or historical evidence are
changed. No tests, builds, lint/type checks, hardware probes or benchmarks ran.
No historical result is declared a fresh PASS or finally approved reuse.
Documentary inspection found all 12 required sections and no missing local
links. `git diff --check` found no whitespace issues in the tracked document
updates; the complete staged documentation is reviewed before committing.

Implementation status: **not started**. R8-01 runtime confirmation, all new
regressions, current-artifact checks, cleanup evidence and independent behavioral
acceptance remain pending. The planning-only documentation does not itself
require the behavioral change-review gate. Record eventual exact commands,
outcomes, retained-gate proof and review ID here during authorized execution.
