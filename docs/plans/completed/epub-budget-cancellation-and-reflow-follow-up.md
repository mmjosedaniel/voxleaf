# EPUB text budget, opening cancellation and reflow investigation

## Goal

Correct C13 and C17 from the confirmed chat findings with the smallest cohesive
patch, and investigate C15 without assuming that it is a defect. Keep C05's
remaining frozen Chatterbox compatibility work for the next Chatterbox runtime
update. This plan spans EPUB ingestion and reader integration, so it deliberately
has no single roadmap milestone number.

**Status: implementation validated; host implementation complete; final independent verdict recorded separately, 2026-11-06.** The user initially authorized planning only and subsequently authorized execution on 2026-11-06. C13/C17 implementation, C15 investigation and necessary validation are authorized. No staging, commit, push, PR, merge or publication is authorized. Git delivery remains a
separate authorization even after implementation is authorized.

## User-visible outcome

- C13: image descriptions count toward the existing decoded-publication-text
  limit. An over-budget book fails safely instead of retaining descriptions
  outside that counter. Admitted descriptions remain intact, including empty
  decorative descriptions; narration and reading positions do not change.
- C17: canceling an unfinished open still cancels it. Canceling that same signal
  after a successful open no longer prevents later image reads. Per-read
  cancellation and closing the book retain their existing responsibilities.
- C15: a bounded investigation establishes whether resizing/zoom can actually
  overwrite the saved logical passage. A negative result means "not reproduced
  under the recorded conditions", not "fixed" or universal absence of a race.

## Current state

Planning inspected clean `main` at
`426ec7df2aa5d67d0aacfd2654035547985cdccd`, the merge of PR #306. Recheck HEAD,
branch, index and worktree before execution; preserve unrelated work and reassess
the cases if their inputs have changed. No runtime reproduction was executed
while preparing this plan.

The [completed CCF plan](../completed/confirmed-chat-findings-minimal-corrections.md)
accepted 18 corrections and retained five intentional/deferred/unconfirmed
cases. Its [ledger](../evidence/confirmed-chat-findings/execution-ledger.md),
[commands](../evidence/confirmed-chat-findings/validation-commands.md), and
[R2 review](../evidence/confirmed-chat-findings/review-CCF-R2-20261104.md) preserve
that historical scope. Do not rewrite those records to incorporate this work.

| Case | Revalidated starting point | Disposition in this plan |
| --- | --- | --- |
| C13 | `appendImage` retains normalized `alt`, while XML text/CDATA alone charge the shared decoded-text counter. Other ZIP/document limits still apply; this is not a demonstrated out-of-memory incident. | U1: charge retained normalized descriptions to the existing 64 MiB UTF-8-equivalent budget. |
| C17 | The opener passes the caller signal into the archive. `createResourceOperation` combines that signal with later read cancellation. The desktop drops its opening controller on success, so ordinary UI failure remains unproved. | U2: define the public opening signal as operation-only and detach it at successful handoff. |
| C15 | Reflow already suspends tracking synchronously, cancels its pending sample and resumes without sampling. Ordinary viewport restoration does not itself request a position save. Late-scroll/equal-rounded-size failure remains hypothetical. | I1: investigate actual persistence and reopen behavior; no production correction is authorized for C15. |
| C05, residual only | Current mutable consumers/Piper were corrected; Chatterbox v7 deliberately packages historical v3 protocol/schema bytes. | Deferred to the next separately versioned Chatterbox runtime update. Do not claim universal Unicode parity. |

C01/C03 remain deliberate policies. The other previously accepted corrections
are controls, not a new audit or implementation backlog for this plan.

## Scope and non-goals

U1 and U2 form one integration batch in `@voxleaf/epub`. Keep one code/test writer
at a time, including any delegated work. I1 may add useful assertions to an
existing browser journey, but must not alter reader production behavior. If I1
confirms a defect, record its reproduction and smallest follow-up proposal;
correcting it requires separately expanded scope. Complete independent U1/U2
work even if an investigation environment is unavailable.

Do not increase the 64 MiB default, add a second alt-text budget, truncate/remove
descriptions, count every XML attribute, change which images are admitted, add
SVG support, narrate image descriptions, change locator offsets, modify shared
serialized schemas, add dependencies, or introduce a generic lifecycle system.
No TTS/model/protocol/installer change, download, signing, listening campaign or
full performance campaign belongs to this batch. No C05 code, frozen Chatterbox
source, package authority or historical evidence may be changed.

For the next Chatterbox update, carry C05 forward as: port only the required
identifier-validation correction into a new versioned runtime, verify current
contract vectors against the actual packaged decoder, and obtain that new
package's required acceptance. Updating current Python alone does not close it.

## Relevant files and documentation

Read `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`, the relevant sections of
`docs/product/mvp.md`, `docs/architecture/overview.md` and
`docs/architecture/system-diagram.md` before execution. Applicable authorities:

- [ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md): ingestion maxima, sensitive alt text, public errors, lazy reads and close.
- [ADR-0008](../../architecture/decisions/ADR-0008-visual-reader-architecture.md), [ADR-0009](../../architecture/decisions/ADR-0009-capability-free-local-file-ingress.md), and [ADR-0010](../../architecture/decisions/ADR-0010-bounded-raster-image-decode.md): desktop ownership, cancellation and native image/open integration.
- [ADR-0006](../../architecture/decisions/ADR-0006-json-schema-contract-authority.md): C05's explicitly retained frozen-runtime limit.
- [M005](../completed/M005-narration-text-preparation.md) and the [roadmap](../roadmap.md): completed narration boundary and one source position per image; no extension of that scope.
- [Change review](../../development/agentic-change-review.md), [testing](../../development/testing.md), [setup](../../development/setup.md), [evidence retention](../../development/evidence-retention.md), and the [validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md): host checks, input equivalence, failure preservation and cleanup. This is a bug/contract change, not a refactor campaign.
- [CAF](../completed/chat-audit-minimal-follow-up.md), case N1: the earlier explicit deferral of C17's signal-lifetime decision.

Expected production edit boundary:

| Owner | Expected files | Supporting files to inspect, not automatically edit |
| --- | --- | --- |
| U1 | `packages/epub/src/document/xhtml-projector.ts`; a narrow reuse/export of the existing UTF-8 counter in `packages/epub/src/xml/xml-event-reader.ts` if needed | `security/ingestion-policy.ts`, `security/processing-budget.ts`, locator indexing and narration source projection |
| U2 | `packages/epub/src/public/open-epub-publication.ts`, `packages/epub/src/public/epub-result.ts` for API documentation | `archive/archive-inventory.ts`, `resource/opened-publication.ts`, `apps/desktop/src/publication/publication-session.ts` |
| I1 | No production files | `apps/desktop/src/reader/reader-reflow-restoration.ts`, `active-visual-locator.ts`, `ReaderPublication.tsx`, persistence/save ownership |

Add regressions to the existing XHTML projection/public opening suites and, only
where coverage is missing, the existing opened-publication suite. Use the existing
`apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts` and synthetic
EPUB builders for I1. Avoid a new fixture framework or duplicate test suite.
Record any necessary allowlist adjustment before editing; architectural or C15
production expansion is outside this authorization.

## Architecture and constraints

### U1 policy: charge what the image projection retains

Keep `maxDecodedPublicationTextBytes` at 64 MiB. Preserve existing XML text/CDATA
accounting and add the UTF-8 byte length of each normalized, admitted image
description before retaining its semantic inline. Charge every retained
occurrence, including repeated resources/spine occurrences. Do not deduplicate
by image ID. Missing and present-empty descriptions add zero bytes but remain
semantically distinct. Omitted/hidden/unsupported images add no retained-alt
charge; their existing XML/archive work budgets still apply.

Reuse the existing code-point-aware UTF-8 counting/checkpoint logic. JavaScript
string length is not a byte count; allocating a complete encoded buffer just
to measure it is unnecessary. Keep any helper reuse package-internal, without
changing root exports or unrelated Unicode validation. Check cancellation/work
limits during counting. The exact combined maximum succeeds; the next byte
fails through `resource-limit-exceeded` / `resource-exhausted`, without returning
a partial publication or leaking its text. The budget is not an exact RAM cap.

### U2 policy: opening owns only its pending operation

Document `OpenEpubPublicationOptions.signal` as controlling the open operation
until handoff. Prefer a small opener-owned controller that forwards caller abort
only while opening; detach forwarding on success and every failure path. Handle
an already-aborted signal and check cancellation immediately before returning a
successful handle. Do not publish a handle after cancellation wins handoff.

Keep archive cancellation/deadlines and low-level direct-caller behavior intact.
Do not globally remove the inherited signal from `createResourceOperation`.
Later public reads retain their request signal plus the publication's close
controller. `close()` must still cancel and await active work, release the
archive once, and reject post-close operations. Preserve fixed content-free error
mapping; caller abort reasons must not enter errors or logs. No timeout, alternate
public mode, lifecycle flag or desktop ownership rewrite is required.

Record these two durable policy decisions in a dated ADR-0007 amendment and API
documentation during implementation, clearly separating them from historical
behavior. Review the canonical diagram and M005 boundary at closeout; update the
diagram only if its topology actually changes. No topology change is expected.

## Milestones

### M0: Capture current inputs and select the missing coverage

**Status: complete; see the execution ledger.** Recheck current sources/callers and record HEAD, dirty
paths and tool versions. Capture identities before any relevant source edit.
Create an execution ledger and immutable per-attempt receipts under ignored
`tmp/evidence/epub-budget-cancellation-reflow/<run-id>/`; keep only content-safe
summaries/review identities under `docs/plans/evidence/epub-budget-cancellation-reflow/`.
Those directories are future execution outputs, not required planning artifacts.

Map existing assertions to the invariants below. Prefer extending a parameterized
case over another harness. Build current package exports once before any consumer
that imports `dist`; stale exports cannot establish an intended regression.
No full-repository baseline is needed. New tests must first run against the
uncorrected relevant behavior, failing for the intended assertion rather than
tooling, fixture, import or unrelated resource-limit failures.

### M1: Run the bounded C15 investigation before production edits

**Status: complete; see the execution ledger.** Reuse the canonical-passage browser journey. Establish
an actual saved locator, resize/reflow, wait for observable restoration and the
existing save/flush boundary, and inspect both the saved locator and the passage
restored after reopening the same bytes. Cover the two unresolved hypotheses:
late layout-induced scroll after restoration, and fractional geometry/zoom
changes with unchanged rounded client dimensions. Record actual observed event
order/geometry; an artificially dispatched callback alone does not prove a
normal-user browser race. Preserve focus and a positive control showing that
genuine manual scrolling still saves its new location.

Use one bounded selected journey with those variants, not an open-ended fuzzing,
cross-browser or full benchmark campaign. Existing final-only persistence checks
do not substitute for observing the saved locator after the relevant resize.

Classify the result as `REPRODUCED`, `NOT REPRODUCED IN TESTED CONDITIONS`, or
`BLOCKED BY ENVIRONMENT`, with exact code/browser identities and limitations.
If reproduced, preserve the failing receipt and a content-safe reproduction
patch/procedure, propose the smallest follow-up, and make no C15 production edit.
Do not leave a known-failing permanent default test or mark it green by weakening
the assertion. Restore temporary diagnostic edits byte-for-byte after preserving
them; retain useful passing assertions only if they establish real coverage.
If no failure appears, do not manufacture a correction or a RED result.

### M2: Reproduce and implement U1 and U2 sequentially

**Status: complete; see the execution ledger.** For each unit, add its focused regression first, capture
the intended RED, apply the minimal correction, and run the same selection GREEN.

U1's minimal new parameterized coverage must establish:

1. Combined text/alt exact limit and one-byte excess, including normalized
   whitespace and multibyte/supplementary characters.
2. Shared accumulation across two projected documents and repeated admitted
   image occurrences; charging is not reset or resource-deduplicated.
3. Existing SAF-15 missing/empty/decorative semantics and omitted-image controls
   remain intact. Add assertions to those controls only where necessary.

Use the existing projector fixture's stricter policy seam, not a new public
policy override or a large 64-MiB fixture. Reuse public error-mapping/failed-open
cleanup tests and locator/narration image-position controls; add another public
case only if an actual coverage gap remains. Do not write tests for the helper's
implementation structure.

U2's decisive new public regression opens a synthetic book with a raster, aborts
the original opening signal after success, and still reads that raster. Preserve
or extend controls for abort before/during open with cleanup, request-scoped
abort followed by a successful new read, and close during an active read. Existing
close-linked narration cancellation must remain green. Test the observable
handoff and cleanup behavior, not a required count of listener API calls.

Rebuild exports after production changes before public-import/desktop/browser
consumers. When units share changed helpers or suites, keep earlier GREEN results
attributed to their original inputs and rerun their affected assertions in M3.

### M3: Combined acceptance and independent review

**Status: host implementation complete; final independent verdict is recorded separately.** Run the final selected gates once after the last relevant
edit; a unit GREEN is not combined acceptance. Complete cheap checks before the
single native build/startup smoke. Finish the ADR/API and concise testing/status
documentation without rewriting completed plans or frozen authorities.

Delegate to independent read-only `change_reviewer` (GPT-6 Astra high) under the
repository policy. Pause source writing and Git mutation during review. Supply
the exact base/HEAD, full diff/new-file contents, closed path identities,
red/green and investigation receipts, gate decisions, reuse proofs and cleanup.
Resolve actionable findings, rerun invalidated gates, and obtain APPROVE for the
exact current patch. Missing review/evidence blocks acceptance.

Freeze final documentation before its review; a later plan move or content edit
requires a fresh assessment of that patch, with eligible unchanged runtime gates
reused explicitly. On completion, archive this plan and update maintained indexes.
An adequately completed C15 investigation can finish with an unconfirmed or
confirmed-pending-fix disposition. An environment-blocked investigation must
remain visibly incomplete even if U1/U2 can be accepted independently.

## Testing and benchmark strategy

### Historical evidence and reuse decisions

CCF recorded EPUB 309 and selected desktop 567 passing tests, seven selected
Chromium journeys, and CCF-R2 approval followed by archival CCF-R3 approval. Its
EPUB selection primarily concerned narration; these counts do not prove C13/C17.
Its C08 review also demonstrated why visible geometry must be asserted rather
than inferred. CAF N1 explicitly left the opening-signal contract undecided.

Reuse existing synthetic fixtures, stricter-policy seams, resource cancellation
fakes, SAF-15 controls and the canonical reflow journey. The CCF raw evidence
directory was found locally during planning; availability is not equivalence.
Old PASS summaries are context, not current acceptance. Before each gate classify
it as RUN, REUSE WITH PROOF, or NOT APPLICABLE.

A reused result requires its retrievable immutable original receipt plus matching
invariant, all source/transitive inputs, tests/fixtures and discovered membership,
configuration/locks/tool versions, generated/build/runtime bytes and relevant host
conditions. Record that comparison for independent review. Unknown or changed
inputs require execution. New test assertions invalidate the old test result.
Caches/artifacts may be reused after their own identity checks without implying
reuse of measurements. An unrelated omitted gate is not a reused PASS.

### Commands and execution order

All commands below are **future**, from the repository root in normal local
PowerShell outside the managed sandbox. They use existing package scripts or
their configured Vitest/Playwright runners. No command in this section has been
run for this plan. Use `.nvmrc` (currently Node 24.18.0) and pinned pnpm 11.15.1;
record the actual executable/version. CCF used Node 24.20.0 and a Corepack pnpm
shim after a PATH discrepancy; those historical versions do not prove current
readiness or environment equivalence. Select the repository-pinned pnpm through
the available Corepack installation, preferably offline; do not change locks or
run an install/download by default.

| Gate | Responsibility and timing | Command / selection | Invalidation and decision |
| --- | --- | --- | --- |
| G0 | Current exports before consuming tests | `pnpm.cmd build:packages` | RUN when shared/EPUB inputs changed or output identity is unknown; reuse unchanged verified outputs between consumers. |
| G1 | Intended RED then focused GREEN for U1/U2 | Commands below with the new case prefixes | RUN before each production correction and after it; preserve all failures and selected/skipped counts. |
| G2 | Final EPUB security, lifetime, source-position and public-boundary controls | Combined EPUB command below | RUN after final U1/U2/helper/test edits. Whole EPUB suite is unnecessary unless dependency mapping reveals uncovered effects. |
| G3 | Existing desktop ownership, tracking, restoration and saving controls | Combined desktop command below | RUN once against current exports; no unrelated TTS/settings/packaging suites. |
| G4 | C15 investigation and final renderer integration | One selected canonical-passage Playwright journey below | RUN before production edits for investigation and once after final EPUB exports/assertions. The earlier run cannot accept changed exports. |
| G5 | Types, lint and format | Static commands below | RUN once on the final consumed closure; repeat only affected checks after later edits. |
| G6 | Packaged WebView2 open/replacement/cancellation, lazy raster and close integration | `pnpm.cmd test:native-startup` with no TTS/performance selectors | RUN once after cheap gates because public EPUB lifetime/admission code changes. Includes its own native build; do not precede it with another native build. |
| G7 | Documentation, evidence hygiene and current exact-patch review | `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence`; `git diff --check`; changed-link inspection; `change_reviewer` | RUN at final closeout. Documentation-only movement may retain runtime results only with an explicit unchanged-input proof. |

G1 uses new test names prefixed `EBC-C13` and `EBC-C17`:

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts -t EBC-C13
pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts -t EBC-C17
```

If a missing U2 control is added to `opened-publication.test.ts`, include that
file in the same filtered invocation instead of creating another command family.

G2 and G3 use existing suites, with no new tests required where their assertions
already establish the invariant:

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/xml/xml-event-reader.test.ts src/security/processing-budget.test.ts src/public/open-epub-publication.test.ts src/resource/opened-publication.test.ts src/locator/locator-index.test.ts src/narration/narration-source-projector.test.ts
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/publication/publication-session.test.ts src/publication/local-publication-open.test.ts src/reader/active-visual-locator.test.ts src/reader/reader-reflow-restoration.test.ts src/reader/ReaderPublication.test.tsx src/persistence/reader-position-save-coordinator.test.ts
```

G4 consumes G0's current exports. The existing Playwright configuration builds
the renderer, owns an isolated Chromium context and loopback preview server, and
has zero retries; do not separately build the renderer immediately before it:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "preserves one canonical passage"
```

G5 uses the configured package checks. The broad TypeScript format/lint commands
are cheap configured checks; they do not imply running all behavioral suites:

```powershell
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/desktop typecheck
```

Do not run root `check`/`check:portable` and then their constituent gates again.
Python, Rust unit matrices, shared schema generation, TTS inference/quality,
Piper regeneration, Chatterbox admission/acquisition, real installation and
performance matrices are NOT APPLICABLE to this closed patch. G6 is a native
startup integration check, not a model benchmark or installer journey. If
dependencies, native/file ingress, image decoding, reader rendering/reflow
production code or model authority expand, stop to re-scope the affected gates;
do not silently omit their existing required acceptance. Required CI belongs to
a separately authorized future PR, not a claim made by local selected checks.

### Preparation, receipts and cleanup

Capture source/input identities, exact command, cwd, host/tool versions, start/end
and elapsed time, exit status, assertion outcome and artifact identity per attempt.
Keep tests failing for the wrong reason as failed preparation/fixture attempts;
correct them and preserve both records. Do not convert an aggregate failure to
PASS because its intended cases passed.

Before G4/G6 check the already-installed matching browser/drivers and writable
scratch paths. Use synthetic data and isolated profiles; do not run against
personal application data or install/uninstall the product. Verify generated
export/artifact freshness, not merely filenames. Leave models/runtime authorities
unchanged. Retain ownership of any started process and verify browser/server/app
cleanup; retain failure evidence and protected backups on uncertain cleanup.
Restore temporary fixture/spec/environment changes to captured identities.

Diagnose before retrying. Permit one unchanged-command infrastructure retry only
after recording a concrete cause and verified cleanup; do not busy-loop a
blocked browser/native gate. Source/fixture corrections invalidate the affected
receipt and require a new attributed attempt. No claim of zero regression risk,
exact RAM use, physical audibility or universal absence of C15 is made.

## Risks and rollback

- C13 deliberately rejects some books previously admitted with large descriptions.
  Document the shared budget; do not hide rejection by clipping accessibility
  text or raising the limit. Any later increase needs separate measurements and
  the ADR amendment required by the existing security policy.
- Counting bytes can change CPU work and cancellation timing. Reuse the bounded
  loop and checkpoints; preserve XML validation, semantic positions and errors.
- Detaching too early in C17 can publish canceled work; detaching too late leaves
  the old problem. Cover the handoff and preserve error/close cleanup on every exit.
- C15 may depend on platform/event ordering. A modelled sequence and a browser
  observation are different evidence; record both honestly. A confirmed defect
  remains pending a separately authorized correction.
- A missing native/browser prerequisite blocks that gate, not unrelated U1/U2
  progress. Do not fetch tools or broaden changes silently to obtain a green run.

Rollback only task-owned hunks to their captured pre-edit contents, preserving
unrelated work, immutable receipts and the index. Never reset the whole worktree,
rewrite completed plans, delete shared caches, or restore personal profiles by
guessing ownership. Any generated artifacts remain ignored and identity-bound.

## Progress log

- 2026-11-06: Read repository planning/review guidance, relevant architecture,
  current code/tests/scripts and CCF/CAF historical evidence. Confirmed clean
  `main` at `426ec7df2aa5d67d0aacfd2654035547985cdccd`. Created this planning-only
  follow-up; implementation and behavioral checks remain unstarted.
- [x] M0: Record execution inputs and invariant-to-test mapping.
- [x] M1: Complete and classify the bounded C15 investigation.
- [x] M2/U1: Capture C13 RED, implement retained-alt accounting, obtain GREEN.
- [x] M2/U2: Capture C17 RED, implement opening-only cancellation, obtain GREEN.
- M3: host gates and closure documents prepared; final independent verdict is retained separately.

## Discoveries and decisions

- C13 shares the existing 64 MiB budget; a capacity increase is not its correction.
  The public opener has no policy override, while the projector fixtures already
  support stricter policies suitable for small exact-boundary tests.
- C17 adopts operation-only public opening cancellation. Existing per-operation
  and publication-close ownership makes a new lifetime mode unnecessary. CAF N1
  and the historical CCF deferral remain accurate records of earlier decisions.
- C15 is investigation-only. Existing suspension/resumption behavior contradicts
  the original ordinary-resize premise; only an actual wrong saved/restored
  locator can establish the retained claim.
- C05 belongs to the next Chatterbox update; neither this plan nor CCF acceptance
  establishes Unicode equivalence for the frozen runtime.
- Existing fixtures and artifacts are reusable resources; old behavioral PASS
  labels are not a substitute for new regression evidence or current review.

## Final validation results

C13 and C17 are implemented with intended RED and focused GREEN evidence.
R2-G2 passes 174 EPUB cases; R2-G3 passes 115 desktop cases; R2-G4 passes one
Chromium journey. R2-G5 checks TypeScript format/lint and both package types.
R2-G6 reruns model-free native startup after the browser command finishes;
its receipt and the ledger record its outcome. Earlier overlapping runtime
receipts are preserved and superseded.

C15 is reproduced only in an explicitly modeled late-scroll/fractional-geometry
ordering (saved offset 129 -> 100); natural resize event ordering remains unproved.
No C15 production correction is included. C05 remains deferred.

The [execution ledger](../evidence/epub-budget-cancellation-reflow/execution-ledger.md)
records fixture/setup failures, source restoration, review corrections and limits.
The [command summary](../evidence/epub-budget-cancellation-reflow/validation-commands.md)
attributes exact commands and exit statuses. Historical PASS results are not
reused to accept changed behavior. Existing fixtures and installed dependencies
are reused, with current execution on pinned Node 24.18.0 / pnpm 11.15.1.

[R1](../evidence/epub-budget-cancellation-reflow/review-EBC-R1-20261106.md) returned
BLOCKED; its three findings were addressed with public regressions, contained
cleanup and serial runtime checks. The final exact-patch report is stored
separately in the evidence directory; its verdict determines acceptance. Archival
documentation is prepared before that assessment. No Git staging or delivery
occurred.
