# Minimal corrections for confirmed chat findings

## Goal

Correct the 18 supported defects retained by the five-pass audit and its
case-by-case historical revalidation, with the smallest changes at their existing
owners. Preserve the dispositions of all 23 cases, including intentional
behavior, policy questions and the resize claim that was not demonstrated.
Reuse existing fixtures, tooling and verified artifacts; rerun only the checks
whose responsibilities or evidence inputs require it.

**Status: planning only, 2026-11-04. Implementation is not authorized by this
plan-creation task and has not started.** The user authorized the plan, its local
branch and a local commit. That authorization does not include implementation,
push, pull request, merge, release or publication.

## User-visible outcome

After implementation and acceptance, initial Play will use the successfully
settled visible fallback, cancellation before service dispatch will not create a
false cleanup failure, and completed highlights will not reclaim the viewport.
Startup labels, Reset feedback and book replacement will reflect the operation
that actually owns them. Playback diagnostics will account for confirmed rendered
audio at unit completion, including units shorter than the sampling interval.

The mutable narration path will preserve unsupported numeric compounds and avoid
repeated expensive language classification. Current contract validators will
agree on explicit identifier rules. Optional-runtime retry, benchmark cancellation
and maintainer release recovery will preserve the right owner, original failure
and actual build-output identity. These are correctness changes, not new model,
format, navigation or playback-speed support.

## Current state

Planning starts from clean `main` at
`78db4f8b5e06587f98c4ab97827c1e77e80b9069` (PR #305), after
`7820db6` (PR #304) and `5e4c44b` (PR #303). The planning branch is
`codex/confirmed-chat-findings-plan`. Recheck HEAD and the worktree before later
execution; this record is not proof that a future checkout is equivalent.

The investigation was static: it traced callers, completion and failure paths,
existing tests, prior ExecPlans and earlier case reports. No new runtime
reproduction or test PASS is claimed. Fifteen of the original 20 cases remain
supported defects; C21-C23 are three additional supported cases. C01/C03 preserve
intentional behavior, C13/C17 need a policy decision, and C15 remains unconfirmed.
Prior fixes often covered a neighboring trigger rather than the retained one.

Historical references used below:

- **CAF**: [chat audit follow-up](../completed/chat-audit-minimal-follow-up.md),
  its [execution ledger](../evidence/chat-audit-minimal-follow-up/execution-ledger.md)
  and [CI follow-up](../evidence/chat-audit-minimal-follow-up/ci-follow-up.md).
- **RCF**: [revalidated chat findings](../completed/revalidated-chat-findings-minimal-corrections.md)
  and [execution ledger](../evidence/revalidated-chat-findings/execution-ledger.md).
- **RAF**: [residual audit corrections](../completed/residual-audit-corrections.md).
- **NSL**: [settings lifecycle corrections](../completed/narration-settings-lifecycle-corrections.md)
  and [execution ledger](../evidence/narration-settings-lifecycle-corrections/execution-ledger.md).
- **BNC**: [narration boundary/navigation corrections](../completed/narration-boundary-navigation-corrections.md)
  and [execution ledger](../evidence/narration-boundary-navigation-corrections/execution-ledger.md).
- **RIA**: [reader/image/audibility corrections](../completed/reader-image-audibility-minimal-corrections.md)
  and [execution ledger](../evidence/reader-image-audibility-corrections/execution-ledger.md).
- **RAC**: [revalidated audit corrections](../completed/revalidated-audit-corrections.md).
- **RNB**: [reader/narration bugfixes](../completed/reader-narration-bugfixes.md).

### Complete case register

P2 means a supported product or maintainer correctness defect; P3 describes a
narrower API, presentation, normalization or diagnostic defect. These priorities
do not assert runtime reproduction in this planning task.

| Case | Disposition | Exact retained claim and historical boundary | Unit |
| --- | --- | --- | --- |
| C01 | Preserve policy | Next uses known prepared boundaries and may skip unprepared gaps. CAF R4b.1 deliberately retains that policy; RCF-06 changes adjacent Previous, not Next. | None |
| C02 | P2, correct | Successful initial reader fallback can settle a different visible start while the coordinator retains the earlier narration start. CAF R4.1 and RIA late attachment do not prove the exact preparation request after fallback. | U2 |
| C03 | Preserve restriction | A local SVG used by `img` is not an admitted raster. M003's implemented raster boundary is narrower than ADR-0007's broader fallback wording; this is not authority to add SVG rendering. | None |
| C04 | P2, correct narrowly | The ordinary release harness backs up user data, marks installation attempted, then may fail to spawn the installer. Uninstall failure prevents safe restoration even when no installation began. RAC-03's backup retention remains correct for uncertain partial installation. | U6 |
| C05 | P3, current-contract correction | JS `trim`/schema regex and Rust/Python whitespace semantics disagree for identifiers, including edge U+0085 and U+FEFF. CAF R4.2 fixed the generic C1-control issue, not all whitespace parity. Frozen optional runtime compatibility is a separate retained limit. | U3 |
| C06 | P3, correct | `120 EURASIAN birds` can suppress an otherwise accepted English number because the fixed `EUR` lookahead does not establish a lexical end. BNC-R1 added removable-mark EUR protection. | U1 |
| C07 | P2, correct | Stop can time out while waiting for an invalidated hardware/config preflight that has not dispatched service start, then report cleanup failure. RNB-01 protected a pending dispatched IPC start; that obligation remains. | U2 |
| C08 | P2, correct | A completed audible segment remains follow-eligible; a later refresh can settle its start and cancel a current typography reflow before the next audible segment. H10 and RCF-16/17 covered adjacent completion/inspection cases. | U2 |
| C09 | P3, correct | The controls can show Playing/Stop while a slow-speed backend is still preparing and no audio has rendered. M011's Cancel start requirement concerns actual first rendering, not scheduler phase alone. | U2 |
| C10 | P3, correct | In the reusable dual-worker benchmark API, canceling completed occurrence A can remove/cancel replacement B of the same role. RCF-22 and failed-cleanup ownership fixes did not close every occurrence/dispatch race. No ordinary CLI failure is asserted. | U5 |
| C11 | P3, correct | A successful reset can leave an obsolete speed-fallback warning/revision, unlike an explicit successful speed selection. RCF-19, SPM feedback and NSL lifetime changes cover related paths. | U2 |
| C12 | P2, correct | Replacing a book during Reset may close narrator A after the global language write but before its mode/speed reset, leaving partial settings on B. NSL-04 guards Settings remount, not the book-replacement handler. | U2 |
| C13 | Policy decision deferred | Retained image `alt` text is outside the shared decoded text/CDATA accounting; admitted inputs can retain more than that text budget. Other ZIP/document limits still apply. Decide the intended budget scope before changing accessibility text. | None |
| C14 | P3, correct | Cleanup retry on a failed state without a qualifying cleanup receipt may canonicalize an absent managed root and return VerificationFailed instead of the normal Absent snapshot. RCF-13's committed-cleanup retry remains valid. | U4 |
| C15 | Unconfirmed; no fix | The resize report overlooked synchronous tracker suspension, cancellation of a pending sample and resumption without sampling. Existing viewport callbacks do not persist this reflow. A late-scroll/equal-rounded-size hypothesis has no demonstrated erroneous persisted locator. | None |
| C16 | P2, correct | The Windows builder can build into an alternate effective Cargo target directory/triple but inspect stale canonical release outputs. CAF R1.5 verifies signature policy, not whether those outputs belong to this build. | U6 |
| C17 | API decision deferred | Resource reads inherit the signal passed to open. CAF N1 retained the question of whether that signal owns only opening or the publication lifetime; desktop ownership does not establish a current user failure. | None |
| C18 | P2, correct | `20 °C–25 °C`, `20 °C – 25 °C` and spaced ASCII ranges can expand partially. Compact ASCII `20 °C-20 °C` is already protected; the earlier contrary claim is withdrawn. BNC-04 does not cover the retained separators. | U1 |
| C19 | P3, correct | An ellipsis before U+203A in `‹Espera…›` can receive the ordinary paragraph pause when a successor is buffered. The boundary scanner recognizes that closer, but transition policy does not. | U2 |
| C20 | P3, correct | Rendered duration can be zero for a complete unit between ticks, or overcount the last interval after completion. RIA-03 proves start/end ordering and device-wait exclusion, not exact duration accounting at completion. | U2 |
| C21 | P2, correct | Repeated full classification of a very long admitted language tag per source token creates excessive synchronous preparation work not represented by the existing token charge. CAF R8.3 bounded source singleton work, not this multiplicative cost. | U1 |
| C22 | P2, correct | Whitespace-separated `%` after an otherwise recognized time/currency can allow partial expansion, e.g. `14:30 %` or `$12.50 %`. CAF R3.2 protects adjacent percent suffixes, not this combination. | U1 |
| C23 | P3, correct | A rejected failure-diagnostic write in the ordinary release harness can replace the original journey error even if final cleanup succeeds. This additional failure composition was not covered by the earlier recovery fix. | U6 |

## Scope and non-goals

Implement U1-U6 sequentially at existing owners. This is one integration batch,
not 18 separate release cycles. Shared-file changes in U2 must be coordinated;
keep exactly one source writer at a time if implementation is delegated. Add
focused regressions to existing suites and preserve their earlier controls.
Do not introduce a generic lifecycle framework, parser, scheduler, metrics
platform, replacement test harness or production dependency.

C01, C03, C13, C15 and C17 receive no behavior change in this plan. C13 would need
an explicit rule for charging actually retained normalized alt text; never clip
it silently or charge all attributes indiscriminately. C15 may be reopened only
with a failing mounted/browser sequence that proves an incorrect location save.
C17 needs an explicit public signal-lifetime decision before an API change.

Keep frozen narration-v1/Piper-v1 normalizers, evaluation corpora, completed
ExecPlans, immutable receipts and Chatterbox runtime source authorities unchanged.
C05 repairs current mutable contract consumers; it does not secretly upgrade the
frozen optional v7 Python runtime. Do not claim Unicode parity for that frozen
runtime at closeout. If full historical-runtime parity becomes a requirement,
record it as pending a separately versioned runtime/compatibility decision.

Do not broaden to new SVG support, gap-aware Next, a new model release, voice
quality, physical speaker audibility, public signing or another full audit.
Minimum changes must still preserve privacy, cancellation and bounded resources.

## Relevant files and documentation

Read these maintained authorities before execution:

- [documentation index](../../README.md), [roadmap](../roadmap.md),
  [MVP](../../product/mvp.md),
  [reader settings/playback requirements](../../product/reader-settings-and-playback-controls.md),
  [glossary](../../product/glossary.md).
- [system diagram](../../architecture/system-diagram.md),
  [architecture overview](../../architecture/overview.md),
  [ADR-0006](../../architecture/decisions/ADR-0006-json-schema-contract-authority.md),
  [ADR-0063](../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md),
  and the applicable normalization/playback/optional-runtime ADRs linked there.
- [completed M005](../completed/M005-narration-text-preparation.md), especially
  preparation bounds, cancellation, opaque language context and locator mapping.
- [testing](../../development/testing.md),
  [independent change review](../../development/agentic-change-review.md),
  [evidence retention](../../development/evidence-retention.md),
  [Git workflow](../../development/git-workflow.md), and
  [validation-policy evidence rules](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md).
  The last reference supplies evidence/retry discipline, not a refactor workflow.

| Unit | Primary production owners | Existing regression owners |
| --- | --- | --- |
| U1 | `packages/epub/src/narration/narration-bilingual-normalizer.ts`, `narration-preparation.ts`, `narration-prepared-segment.ts`; source-window/work-controller only if required for real cost accounting | `narration-normalizer.test.ts`, `narration-resource-bounds.test.ts`, `integration/narration-preparation-matrix.test.ts`; current source/boundary invariants |
| U2 | `apps/desktop/src/tts/product-narration-coordinator.ts`, `ProductNarrationControls.tsx`, `product-narration-presentation.ts`, `playback-transition-policy.ts`, `pcm-playback.ts`, `pcm-playback-contracts.ts`, affected `playback-backends/`; `reader/ReaderPublication.tsx`, `segment-highlight-controller.ts`, `App.tsx`, `settings/narration-settings-actions.ts` | Their existing tests, `App.test.tsx`, reader reflow tests, persistence bridge/coordinator tests and existing browser smoke files |
| U3 | `packages/shared/schemas/primitives/v1.schema.json`, `src/primitives/identifiers.ts`, generator-owned current TS/Python output, `apps/desktop/src-tauri/src/tts_protocol_contract.rs`, current `services/tts/src/voxleaf_tts/protocol.py` only if needed | Shared identifier/serialized/control-contract tests, Rust protocol tests, Python protocol/service tests |
| U4 | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`; retain existing UI retry dispatch unless the correction requires changing it | Existing optional-runtime Rust tests and exact local admission; `OptionalChatterboxControls.test.tsx` only if its behavior changes |
| U5 | `services/tts/benchmarks/dual_worker_runtime.py`; `isolation.py` only for a demonstrated coupled ownership need | `test_benchmark_dual_worker_runtime.py`, `test_benchmark_isolation.py` |
| U6 | `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs`, `scripts/build-windows-release.ps1` | `ordinary-chatterbox-release-host.node-test.mjs`, `windows-release.node-test.mjs`; existing disposable filesystem/PowerShell seams |

These are responsibility boundaries, not permission to edit every named file.
Inspect the exact callers and narrow the final file set before each change.
Update maintained product/development documentation where behavior is clarified.
Document C05's explicit portable semantics and frozen-runtime limit in the
applicable contract decision. Review M005, terminology and the system diagram;
update maintained architecture only if its represented behavior/boundary changes.
Do not rewrite M005's historical execution record or imply new TTS scope there.

## Architecture and constraints

EPUB text and inference stay local; generated playback audio remains in memory.
Use only repository-authored synthetic fixtures and fixed content-free errors.
Do not commit raw host logs, private paths, user data, books, audio or models.

Keep visible, requested, heard and persisted locations distinct where their
owners require it. Never repair visible fallback by overwriting an exact saved
heard checkpoint. Preserve stable EPUB locators, zero-based source offsets,
unchanged displayed text and the current containing-segment preparation contract.

Cancellation invalidates identity before teardown. The C07 exception applies
only to preflight that can no longer dispatch; it must not release a dispatched
start, native process, PCM handle or unverified cleanup. C10 likewise must keep
the occurrence's role reserved until both cancellation dispatch and draining are
complete; failed cleanup must retain an owner for retry.

Keep the fixed limits and bounded lookahead of current normalization. C21 must
account for actual language-classification work instead of charging only token
count. Use operation-local bounded state; no global book-language cache or new
admission restriction on the visible EPUB language attribute.

C20 may extend an internal playback observation contract with a minimal bounded
completion receipt. It must not change the external TTS protocol, DSP algorithm,
speed policy or audio persistence. Render confirmation is not proof of sound
leaving a physical speaker. Metrics must not fabricate first-render timestamps
by subtracting nominal duration from a late completion callback.

## Milestones

### M0: Freeze the execution inputs and regression baseline

**Status: not started.**

On later authorization, record starting HEAD, clean/dirty paths, target file
identities and gate dependency closures in ignored
`tmp/evidence/confirmed-chat-findings/<run-id>/`. Keep a concise tracked ledger
under `docs/plans/evidence/confirmed-chat-findings/` only during execution. Include
tool versions, configuration, lockfiles, generated export membership and the
environment needed by each gate. Never replace previous receipts.

Reconfirm each retained trigger against that checkout. A case already fixed or
disproved becomes a documented no-change disposition, not a forced edit. Add
only the new failing assertions and necessary controls to the existing suites;
run their selected pre-edit regressions before changing that production owner.
Do not run the whole repository merely to establish a baseline. A fixture/setup
error is not a valid red reproduction. Reuse built exports only after checking
their complete inputs; otherwise build packages once before dependent tests.

### M1: Make the bounded owner corrections

**Status: not started.** Execute the following six units without running a native
build or full integration matrix after every case.

#### U1: Mutable narration boundaries and classification cost

- **C06:** Establish whether `EUR` is a complete lexical suffix within the
  existing remaining lookahead. A proven continuation such as `EURASIAN` must
  not block the accepted bare number. Preserve true `120 EUR`, approved marks
  inside `EUR`, foreign-language/code barriers and conservative behavior when
  bounded context is insufficient. Do not add a general currency grammar.
- **C18:** Protect the whole unsupported range, on both sides, for en dash and
  spaced ASCII forms. Adding one dash character to a generic guard alone is
  insufficient: the second Celsius value must also stay unexpanded. Preserve
  already protected compact ASCII ranges, isolated accepted Celsius, ordinary
  prose punctuation, source spans, ES/EN behavior and frozen v1 output.
- **C21:** Classify an effective language context once per preparation operation
  and reuse it across token normalization and English-title summarization.
  Cover both the normalizer and preparation callers of title-context analysis.
  Charge distinct-tag work before expensive processing and use the existing
  bounded work/yield/cancellation mechanism for work that cannot fit one step.
  Memoization alone is insufficient for many distinct long tags. Keep retained
  cache entries bounded by the operation and release them on cancel/close.
- **C22:** Extend the existing compound guard across allowed whitespace/removable
  marks after a complete lexical time/currency form before `%`. Do not consume
  another semantic language or code span. Preserve valid `25%` and `25 %`, current
  lookahead ceilings and uncertain-boundary conservatism.

Use table-driven normalizer cases plus the existing public preparation matrix
to prove unchanged display/source ranges and batch independence. For C21 use a
bounded moderate long-tag fixture, repeated/mixed contexts, many distinct tags
and existing cancellation/work-limit seams. Do not run the multi-billion-step
adversarial example or add a fragile wall-clock assertion/test-only production
API. Acceptance requires evidence of bounded work through the public preparation
path, not just a faster private helper.

#### U2: Reader placement, operation ownership and confirmed rendering

- **C02:** Carry the successful initial settlement's actual locator to the
  current narrator before fresh Play becomes available, including late narrator
  attachment. Restrict the update to initial restoration/current ownership;
  preserve explicit navigation, paused Resume and the precise saved checkpoint.
  Assert the exact `prepareNarration.startLocator` across a segment boundary;
  asserting only the synthesized segment start can hide the defect because an
  interior request returns its containing segment. Preserve the CAF CI empty
  range/aligned block and bottom-clamping controls.
- **C07:** Track whether each start attempt is still preflight or has crossed the
  dispatch boundary. After invalidation, release only preflight that cannot
  create a service; check its token immediately before dispatch, including after
  any synchronous publish/reentrant callback. A late hardware/config result must
  not start audio or alter a newer attempt. Keep the existing bounded wait and
  cleanup receipt for dispatched starts. Cover slow preflight, Stop/new Play,
  late resolution, and a truly dispatched pending start. Do not promise that a
  shared still-pending capability query can immediately serve another Play.
- **C08:** After a segment has completed its one valid end settlement, retain
  decoration if required but remove its authority to follow again. Resume must
  not make a completed segment active. A genuinely new audible segment must
  still supersede reflow. Test typography between A completion and B first
  render, manual inspection, final heard position and paused reflow.
- **C09:** Derive startup wording from confirmed first rendering, with terminal
  failure/completion taking priority. Keep the existing cancellation handler and
  scheduler capabilities. Zero latency is valid; do not use truthiness. A later
  pause, resume or underrun must not reset the session to Cancel start. Coordinate
  this with C20: unknown latency cannot mean that rendering never occurred.
- **C11:** Clear fallback feedback and advance its ownership/revision only when
  the applicable reset succeeds. Failed or superseded writes retain truthful
  feedback and cannot overwrite a newer explicit speed choice. Do not make Stop
  erase a legitimate fallback warning. Cover successful/failed reset and the
  existing explicit-selection race at the real persistence boundary.
- **C12:** Add the pending Reset to the App-level book-replacement barrier before
  closing narrator A. Disable the relevant open control and guard its handler;
  do not rely only on disabled rendering. Complete or reject Reset before B owns
  narration. Preserve Settings closure/remount, failed-Stop no-write semantics
  and existing best-effort feedback for real storage failures. Do not remove
  closed-coordinator guards to let an old owner write into the new book.
- **C19:** Add the missing U+203A closer to the existing terminal ellipsis policy.
  Cover Unicode ellipsis and `...`, a buffered successor, nonterminal text and
  no buffered successor. Keep existing paragraph/ellipsis durations and insert
  no PCM silence. Two short paragraphs exercise this boundary; an arbitrary
  intra-paragraph split is not a sufficient reproduction.
- **C20:** Account for confirmed rendered output exactly once at completion as
  well as during active observation. Prefer a small per-active-unit duration or
  interval receipt with explicit consumed ownership; retain no unbounded history.
  Derive WSOLA duration from actual output frames/render intervals, not source
  PCM duration. Exclude pause, device wait, semantic pause, buffering and the tail
  after completion; ignore stale callbacks after Stop/replacement. Cover a short
  unit entirely between 250 ms ticks, completion immediately after a tick,
  pause/resume, slow speed, delayed ended delivery and consecutive units. Preserve
  truthful unknown/bounded first-render timing when exact correlation is absent;
  never backdate by nominal duration. Document any diagnostic meaning change.

Keep reader placement, persistence, highlight ownership, PCM rendering and
scheduler decisions at their current owners. Extend the existing browser journeys
for mounted timing; do not duplicate every unit branch in Chromium.

#### U3: Explicit identifier semantics in current consumers

Make canonical JSON Schema express a portable edge-whitespace set instead of
engine-dependent `\s`/dot behavior; preserve the intended current ECMAScript
edge-whitespace policy, C0/DEL exclusion, interior valid characters and existing
code-point limits. Current TS constructors/compiled validators, Python validators
and Rust checks must agree. Include U+0085, U+FEFF, U+2028/U+2029 with trailing
whitespace, non-whitespace C1, internal spaces, astral characters and the applicable
128-code-point/512-UTF-8-byte boundaries through actual decoder entry points. Do not restrict
all identifiers to ASCII or silently broaden another contract.

Edit the canonical schema and handwritten owning checks, then run the existing
shared generator. Review its complete output list and commit only its necessary
derived current TS/Python changes; never manually modify generated files.
Document the exact accepted set and whether any previously inconsistent input
is now rejected. If reconciliation requires a public contract version change,
resolve that compatibility decision before implementation rather than hiding it.

The optional v7 packager deliberately resolves `protocol.py` and
`generated/protocol_schemas.py` from frozen historical v3 source identities in
`packaging/chatterbox_sources.py`. Current generation does not update that binary.
Preserve these authorities and actual ASCII-produced request identities. Prove
current mutable parity and unchanged ordinary optional request compatibility;
retain the wide-Unicode frozen-runtime limitation explicitly. A claim that every
deployed Python runtime is now equivalent would be false. Current Piper payload
regeneration/checking is required when its consumed generated schema bytes change.

#### U4: Retry only a qualifying cleanup obligation

For C14, inspect the inactive failed state and its post-commit cleanup receipt
under the existing lock order before requiring a canonical managed root. With
no qualifying receipt, return the ordinary read-only snapshot, including Absent
when the root does not exist; do not create a directory to make retry succeed.
With a receipt, retain exact root/authority/reparse checks before deletion.
Cover absent root, unrelated failure, active worker, successful eligible retry,
and mismatched or unsafe receipt targets. A benign absent root must not weaken
post-commit cleanup ownership or expand filesystem deletion authority.

#### U5: Cancel the requested benchmark occurrence

For C10, compare the caller's occurrence with the role's current owner under the
existing lock before removing it or dispatching adapter cancellation. Reserve
the role through both cancellation dispatch and future drain, even when a queued
future has already become done. Preserve failed-cleanup ownership and retry;
otherwise a new occurrence can still race with `cancel_idle`. Test collect A /
submit B / cancel A, queued completion before adapter cancellation, late output,
idempotent cancellation and failed cleanup. Use fake adapters/events, not model
inference, and do not change benchmark result interpretation or corpus authority.

#### U6: Maintainer recovery and output identity

- **C04:** Distinguish an unequivocal process-spawn failure from an installer
  that started and then failed. Only restore the backup immediately when no
  installer process began, installation/session state remains absent, and the
  destination still has the controlled expected identity. Preserve the primary
  error. Once execution or partial state is uncertain, retain RAC-03's protected
  backup and recovery failure; never call uncertain partial install harmless.
- **C16:** Before invoking the builder or writing evidence, resolve the effective
  Cargo target directory and target/triple, including environment and Cargo
  configuration. Require the layout expected by all current release consumers;
  fail early on alternate/unknown layouts instead of reading stale canonical
  files. Use authoritative resolved configuration/metadata rather than checking
  only `CARGO_TARGET_DIR`. Do not use timestamp freshness or require changed
  hashes: a valid reproducible rebuild may have identical bytes. Test the actual
  PowerShell entry through existing disposable fake-builder seams with stale
  outputs and matching signature mode. Do not generalize all release tools to
  support arbitrary layouts in this patch.
- **C23:** Treat writing the failure diagnostic as a bounded secondary operation.
  Its rejection must not replace the original journey error; cleanup/recovery
  failure must still report that primary cause. Emit only fixed content-free
  supplemental information. Combine fault-injected diagnostic write failure with
  successful and failed cleanup in the same harness suite as C04.

No real installer, uninstall, signing operation, published evidence refresh or
mutation of actual user data is needed for these deterministic regressions.

### M2: Run the minimum combined acceptance gates

**Status: not started.** Use the gate table below after the relevant last edit.
Run cheap deterministic/static checks before package preparation and native
execution. Rebuild exports only when consumed inputs changed; make one final
native executable and share it between applicable host arms. Do not run the root
aggregate and then repeat its constituent commands for this local acceptance.
Required CI on a later authorized PR remains a separate obligation.

### M3: Independent review, documentation and closeout

**Status: not started.** Delegate an independent read-only `change_reviewer`
(GPT-6 Astra high) under the repository review policy after the complete patch
and host evidence exist. The reviewer does not run tests or edit code. Give it
the exact HEAD/diff/path identities, all dispositions, red/green records,
invariant-to-gate mapping, reuse proofs and cleanup receipts. Resolve actionable
findings and obtain approval for the exact current patch. Missing reviewer or
required evidence blocks acceptance; it does not authorize speculative success.

Publish a concise execution ledger with actual commands, results, timing, input
identities, review ID and material limits. Explicitly retain the five no-change
cases and C05's frozen-runtime boundary. Move the plan to completed only when its
in-scope corrections and applicable gates are accepted. Update indexes and
maintained behavior docs without rewriting historical evidence. Future Git
mutations require the user's authorization at that time; this planning commit
does not authorize implementation commits or publication.

## Testing and benchmark strategy

### What previous evidence can and cannot supply

The following are historical successful outcomes read during planning, not fresh
results on this branch. Raw CAF receipts and its R2/R3 input-equivalence records
were also found locally; availability is not equivalence to a future patch.

| Historical evidence | Recorded result relevant here | Reuse decision for this batch |
| --- | --- | --- |
| CAF final ledger, 2026-11-03 | Shared 56; EPUB 455; selected desktop 595; Python 147; Node 52; Rust 173 default/172 release, eight ignored each; three CAF browser journeys; CAF-R2 approved | Reuse fixtures, failure seams, commands and dependency records. Affected behavioral groups must run with the new triggers. Do not carry these aggregate PASS labels forward. |
| CAF CI follow-up, 2026-11-04 | Reader/reflow/App 152; full Chromium 60; static checks passed after correcting the empty-range block-alignment regression | Reuse MAF-07 and alignment controls as fixtures. C02/C08 touch their responsibility, so select those controls again; do not repeat all 60 merely because that was the old command. |
| RCF final correction round | EPUB 516; desktop 632; Python 126; Rust 165/164, eight ignored each; ten selected browser journeys; current six-rate Piper and optional local admission passed after RCF-R1/R2 findings were fixed | Reuse ownership/inspection/reset fixtures and six-rate collector. Earlier R1/R2 failures remain historical. Current changes invalidate the related behavioral results. |
| BNC final run-02 | EPUB 265, desktop 194, three selected browser journeys; one renewed Piper EN arm; BNC-R2 approved | Reuse removable-mark EUR, numeric-boundary, profile and source-mapping controls. The earlier 257 count was run-01, not final acceptance. |
| RIA final round | Desktop 439, browser 11, native-harness 50; one binary used for image and six-rate Piper routes; RIA-R1 approved | Reuse device-start, ordering, speed and cleanup fixtures. The short-unit test does not establish C20 duration correctness. Renew affected rendering checks. |
| NSL final round | Desktop 407, six browser journeys; static checks and one Piper EN arm; NSL-R1 approved | Reuse Settings remount/Stop/reset controls and fault seams. C12 adds book-replacement ownership; no additional lifecycle campaign is needed. |
| CAF packaged artifacts | Current Piper core regenerated and checked: 2,024 files; offline ES/EN smoke; exact optional local admission passed with restoration and no inference | Reuse installed models/downloads only after hash/authority verification. U3 changes the current Python schema payload, so the old Piper package PASS cannot accept those new bytes. Frozen optional artifacts remain candidates for reuse. |

Useful local evidence roots are
`tmp/evidence/chat-audit-minimal-follow-up/20261103-01/`,
`tmp/evidence/chat-audit-ci/20261104-01/`,
`tmp/evidence/revalidated-chat-findings/20261103-01/` and the run directories
referenced by the BNC/RIA/NSL ledgers. They are ignored private evidence, not
permanent public artifacts. Locate the original command/input manifests through
those ledgers; if unavailable at execution time, do not claim reuse.

Two locally read CAF receipt identities illustrate the retained anchors:

- `G7-core-check-result.json`, SHA-256
  `0168c98e5af4fd3656b90351dd8357bc6f50621a5e130a0cee76abdf1e654d83`.
- `G9-local-admission-result.json`, SHA-256
  `14c025a15dd8fb4d9c58d0135925b893c0886851bd8a45c4fe5fc03143f8140a`.

These identify command receipts, not artifact digests or proof of current
equivalence. Their full source/environment records must accompany any reuse.

For each gate choose **RUN**, **REUSE WITH PROOF** or **NOT APPLICABLE** before
execution. A previous behavioral PASS is reusable only if the original raw
receipt remains retrievable and its exact invariant, source/transitive tests,
fixtures, generated bytes and directory membership, config/locks, tool versions,
build/runtime artifacts and relevant host conditions still match. Record that
comparison and have the independent reviewer assess it. Matching a filename,
HEAD label, model name or top-level source file is insufficient. A non-equivalent
input requires the affected gate to run; do not refresh old receipt hashes.

An omitted unrelated gate is NOT APPLICABLE, not a reused PASS. Reusing a verified
download, model, installed dependency environment or compiled dependency cache is
artifact reuse, not reuse of latency/cancellation/rendering measurements. A
within-batch result can be retained after later edits only when its complete
consumed inputs are unchanged; do not rerun identical leaves for a different
command label.

### Planned gates and commands

All commands below are **future execution instructions, not commands run while
creating this plan**. Cwd is the repository root unless stated otherwise. Every
test and validation command must run in a normal local PowerShell session outside
the managed automation sandbox. Capture the exact expanded command, exit code,
tested input identities and outcome. No acceptance result may come only from a
sandbox execution.

| Gate | Invariant and timing | Existing command surface | Decision / invalidation |
| --- | --- | --- | --- |
| G0 | Current generated contracts and package exports before consumers | `pnpm.cmd --filter @voxleaf/shared generate` during U3; `pnpm.cmd --filter @voxleaf/shared generate:check`; `pnpm.cmd build:packages` | RUN for changed inputs; generator is implementation, not planning. Build once per changed shared/EPUB export set, not per downstream suite. |
| G1 | New regressions fail for the intended reason before each owner's edit | The G2-G5 runner with the new case-name/node-id filter | RUN only new cases/necessary controls; no whole-suite baseline. Record skipped tests separately. |
| G2 | U1 source mapping/bounds and U3 current schema/identifier parity | Filtered shared/EPUB Vitest commands below | RUN after final relevant edits. Changing shared exports invalidates consuming checks. |
| G3 | U2 mounted controls, placement, persistence, cancellation and render accounting | Filtered desktop Vitest command below | RUN once as a combined owner group; preserve existing regression controls. |
| G4 | U3 current Python protocol, U5 occurrence ownership and U6 host recovery/build layout | Selected pytest and Node commands below | RUN; fake adapters and disposable paths, no model or real installer. |
| G5 | U3/U4 native validation, receipt/root and lock-order paths in both build modes | `pnpm.cmd test:rust` | RUN once after final Rust edits. Do not additionally rerun the same default/release suites under another wrapper. Ignored host tests are not passes. |
| G6 | Few mounted Chromium sequences for browser-only ordering/geometry | Selected Playwright command below, after G0 | RUN new integrated journeys plus named existing controls; no full browser matrix by default. |
| G7 | Relevant formatting, lint, type and generated drift | Static commands below | RUN once per final consumed closure. Later unrelated docs do not invalidate runtime gates. |
| G8 | Current distributable core and one native executable | `pnpm.cmd package:piper-core:write-manifest`, `pnpm.cmd package:piper-core:check`, `pnpm.cmd build:desktop` | Regenerate core when U3 changes its consumed current Python bytes. Reuse verified model/locked payload inputs; one final native build after cheap gates. |
| G9 | WebView2 direct/WSOLA integration, confirmed render, cancellation and cleanup on the built binary | Piper EN command below with `--exercise-playback-speeds` | RUN once. The existing flag selects its fixed six-rate series; do not claim a narrower flag exists or create a new runner merely to reduce count. No separate repeated one-rate arm. |
| G10 | U4 exact installed-root admission/retry/removal/restoration | `pnpm.cmd test:chatterbox:v7:local-admission` | RUN once using verified local artifacts. No model inference/download/quality campaign. Prior CAF duration was about 12 minutes; avoid repeated preparation. |
| G11 | Native pending-start replacement containment if its dispatch/ownership boundary changes | Exact F08 command below | CONDITIONAL: run if U2 changes the dispatched-start/client/supervisor boundary or preflight proof cannot isolate it. Otherwise document unchanged closure and rely on retained unit controls plus current normal Piper cancellation. |
| G12 | Current documentation, privacy, diff, evidence and independent acceptance | `pnpm.cmd check:evidence`; `git diff --check`; link inspection; `change_reviewer` | RUN on final documentation/patch. Planning-only docs are exempt from behavioral independent review. |

G2 uses existing suite locations:

```powershell
pnpm.cmd --filter @voxleaf/shared exec vitest run src/primitives/identifiers.test.ts src/contracts/serialized-conformance.test.ts src/contracts/tts-protocol-control.test.ts
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
```

Add another existing source/work-controller/boundary suite only if U1 actually
changes that owner's behavior or the listed public tests cannot establish its
invariant. Do not replace a missing public bounded-work assertion with a private
helper-only check.

G3 combines existing relevant tests; remove a genuinely unrelated suite only
with a recorded responsibility argument, not solely because another suite passed:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/settings/narration-settings-actions.test.ts src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/product-narration-presentation.test.ts src/tts/playback-transition-policy.test.ts src/tts/pcm-playback.test.ts src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts
```

G4:

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_protocol.py services/tts/tests/test_service.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_benchmark_isolation.py
node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs
```

If the native smoke collector changes for C20, add its existing
`apps/desktop/scripts/native-smoke.node-test.mjs` to the same Node invocation
after package exports are current. If U4 changes UI behavior, add the existing
optional controls suite to G3. Changed packaging builder logic requires its
existing Python release-core/source tests; a generated protocol payload change
alone uses protocol tests plus current core preparation/checking.

G6 will add tests prefixed `CCF-` to the existing bugfix smoke file. This is a
planned selection, not a claim those tests already exist. Use three cohesive
journeys: initial fallback/late attachment and completed-highlight typography;
preflight Stop plus direct/WSOLA first-render/completion; Reset with attempted
book replacement. Keep deterministic timing branches in unit tests. Select the
existing alignment, waiting-render and remount controls in that same invocation:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep 'CCF-|CAF-1 |MAF-07|RIA-03|NSL-04'
```

Check that the collection includes every intended named test and no empty
selection. If changed browser geometry or ownership invalidates another explicit
existing control, add that test rather than automatically repeating all 60.

G7 uses repository-configured checks after G0 has built current exports:

```powershell
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
```

The configured Rust lint checks both default and `release-locked-runtime`.
Do not add the root `typecheck` wrapper after these leaf checks: it would repeat
exports/types. Reuse package manager/build caches under unchanged lock/tool
identities; do not refresh dependencies to perform this correction campaign.

G9 consumes the final binary, without calling another build wrapper:

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-playback-speeds
```

Bind its result to the executable and relevant core/model hashes, rendered
first-start/completion assertions, cancellation, stale-output suppression and
cleanup. This is integration evidence, not new DSP or physical-audibility
qualification. G11, if triggered:

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement -- --exact --ignored --nocapture --test-threads=1
```

No new GPU/model benchmark, Chatterbox inference/listening matrix, downloads,
firewall campaign, real installer lifecycle, signing scan, image decoder matrix
or full repository aggregate is selected. Those owners are unchanged. Reopen the
affected gate only if implementation/review expands that responsibility; missing
required evidence must be reported as pending, not waived to minimize test count.

### Host preparation, retries and cleanup

Verify cheap readiness and local artifact availability before any expensive
preparation. The optional exact-local test must have verified offline source
artifacts; absence blocks that gate without automatically downloading/releasing
another runtime. Confirm current core input changes before regenerating it.
Reuse a single verified final native build across host gates unless its actual
inputs change. Record preparation separately from test duration.

Use existing resource backup/restoration tooling with a private before/after
journal. Track owned processes by PID, creation time and executable, and only
clean the task's resources. Verify restoration, scratch removal, no retained
audio, no stale process/session and no unexpected network request. Do not infer
success from a command exiting if cleanup/restoration is still pending.

Allow one evidence-driven retry per failed gate after classifying the failure
and correcting its specific cause. Keep the first receipt and the hypothesis.
Do not repeat an unchanged expensive command, increase a timeout speculatively
or reset retry history through a new plan. A remaining failure requires diagnosis
or a documented blocker. Later source changes invalidate only their actual
consumed gate closures; they do not require unrelated stable gates to repeat.

## Risks and rollback

The main regression risks are granting a stale owner access to a current book,
releasing preflight that can still dispatch, following a completed segment,
double-crediting render duration, weakening cleanup deletion authority and
changing numeric/protocol semantics beyond the exact boundary. The per-case
controls above are acceptance requirements, not optional extra tests.

U3's cross-language rule and frozen optional consumer must not be conflated.
If current compatibility cannot be corrected without a new public version or
runtime authority, stop that unit at the decision boundary and report its exact
remaining limitation while completing independent units. Do not mark the entire
case universally solved.

Keep each unit's diff reviewable and avoid unrelated refactoring. Before later
commits are authorized, rollback means reverting only this task's identified
patches, preserving pre-existing work and failed evidence. With authorized
implementation commits, prefer a targeted revert of the affected unit. Do not
rewrite prior history or delete retained recovery backups. Restore host
resources before accepting or abandoning a native attempt.

## Progress log

- 2026-11-04: Consolidated the 23-case static register and historical treatment;
  retained 18 bounded corrections and five no-change dispositions.
- 2026-11-04: Inspected prior CAF/CI, RCF, BNC, RIA and NSL validation records,
  current command configuration, schema generation and frozen optional source
  selection. Distinguished artifact reuse, behavioral equivalence and omission.
- 2026-11-04: Created `codex/confirmed-chat-findings-plan` from the clean starting
  HEAD. Prepared this plan and active/documentation index entries only.
- Implementation M0-M3, regression execution, runtime preparation, native runs
  and behavioral independent review: **not started**.

## Discoveries and decisions

- Earlier completed plans are evidence of specific triggers and versions, not
  proof that every adjacent path is fixed. Preserve their controls and receipts.
- C15's ordinary resize premise is contradicted by existing suspension behavior;
  no speculative resize correction or separate full browser campaign is planned.
- C18's compact ASCII control is already protected. C06/C22 extend bounded
  boundary decisions rather than introducing a general numeric grammar.
- C21's issue is multiplicative language classification and missing real cost
  accounting, including title-context work; adding a token-count check alone is
  insufficient. A bounded preparation failure may be valid where the existing
  work authority requires it, without corrupting the displayed EPUB language.
- C02 must inspect the requested preparation locator, and C20 must inspect actual
  rendered duration. Existing segment/output ordering assertions can pass while
  these defects remain.
- C04 applies only to demonstrable no-spawn. Uncertain partial installation still
  requires protected recovery state. C23 preserves the primary error through a
  second failure rather than hiding cleanup failure.
- C05 changes current mutable consumers and current Piper payload, while frozen
  optional v7 retains historical Python bytes. No in-place authority refresh is
  planned; full frozen Unicode parity remains explicitly outside acceptance.
- No historical behavioral PASS is pre-approved for a changed responsibility.
  Most savings come from reusing fixtures/artifacts, selected combined suites,
  one final build and omitting unrelated campaigns. Within-batch reuse still
  requires complete input equivalence and independent review.

## Final validation results

Planning-only checks on 2026-11-04 ran in local PowerShell outside the managed
sandbox:

- Relative-link inspection resolved all 247 local links across this plan and
  the two updated indexes; no missing target was found.
- `git diff --check`: PASS.
- `pnpm.cmd check:evidence`: did not reach the guard because the available shim
  selected pnpm 11.25.0 while the repository requires 11.15.1. No dependency or
  configuration was changed to bypass that version policy.
- `node scripts/check-evidence.mjs`: PASS. This directly executes the same
  repository-configured documentation/privacy guard without the incompatible
  package-manager wrapper. Future implementation gates must use the required
  tool versions; this result is not a pnpm/toolchain acceptance claim.

The authorized planning diff contains only this new plan,
`docs/plans/active/README.md` and `docs/README.md`. Review the complete staged diff
and repeat the documentation guard/whitespace check before its local commit.

No tests, application builds, model inference or implementation gates have been
run for this task. No runtime PASS, completed correction, accepted implementation
or publication is claimed. The planning-only documentation change is exempt from
the behavioral `change_reviewer` requirement; future U1-U6 acceptance is not.
