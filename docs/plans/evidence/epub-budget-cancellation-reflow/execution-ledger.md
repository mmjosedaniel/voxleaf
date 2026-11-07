# EPUB budget and cancellation execution ledger

Base/HEAD: `426ec7df2aa5d67d0aacfd2654035547985cdccd`, branch `main`.
Execution authorized on 2026-11-06. No Git delivery is authorized. Initial work
consisted only of the new active plan and its index entry; both are preserved.
One worker owns source/test/documentation edits. Independent review is pending.

Raw immutable per-attempt inputs, commands, outcomes and logs are retained in
`tmp/evidence/epub-budget-cancellation-reflow/20261106-01/`. The runner captures
all tracked/nonignored task source SHA-256 identities before every command.
Tools: Node 24.18.0 via process-local PATH and offline Corepack pnpm 11.15.1.
No dependency/lock/model changes or downloads were needed.

## Reproductions and corrections

- C13 initial RED used a too-small budget while retaining the fixture's ignored
  title/style character data. It failed at XML text admission, the wrong cause;
  it is preserved as a fixture failure, not the intended reproduction.
- Head-free corrected C13 RED fails three assertions: the old counter reports
  one byte rather than seven/thirteen, and fails to reject excess retained alt.
  Exact/over-limit multibyte descriptions and repeated resources/projections
  demonstrate the missing charge. The shared counter helper is reused unchanged.
- C17 RED fails with `cancelled` when reading a raster after aborting the already
  completed opening signal. The opener now forwards cancellation only until
  handoff, retaining per-read/close cancellation and the final budget checkpoint.
- Focused GREEN passes all four new cases. Initial G2 passes 171 EPUB cases and
  G3 passes 115 desktop cases. Final reruns follow preserving options access
  inside the public error boundary; they supersede earlier acceptance inputs.

## C15 investigation

The initial canonical-passage journey passes with new per-resize saved-offset
assertions and existing exact reopen verification. No reader production changes
were made. Expanded diagnostics ran against exact HEAD production files restored
temporarily from Git; all four current production files were restored byte-for-
byte in `finally`, with a restoration receipt.

The first fractional-width fixture did not change the flex-constrained rectangle;
that failure is a fixture failure. With a 0.125px smaller max-width, the rectangle
changes while integer client width stays constant. An explicitly injected late
`scroll` notification, after two animation frames and with no manual scroll,
changes the stored full locator's offset from 129 to 100 after the 500ms save
window. The failing spec and diff are preserved as `C15-reproduction.spec.ts`
and `C15-reproduction.patch` in ignored evidence.

Disposition: **REPRODUCED IN MODELED ORDERING**. This establishes a persistence
vulnerability to that diagnostic sequence, not that normal resizing naturally
emits the same event ordering. A separate completion diagnostic records the
129-to-100 observation, confirms genuine wheel scrolling saves another locator,
and verifies its full saved tuple and visible offset after reopening. It is not
a GREEN correction of the failed invariant. Temporary diagnostic assertions are
removed from the permanent suite; useful per-resize assertions remain.

Smallest follow-up proposal: establish whether an actual layout-induced delayed
scroll can occur on supported hosts, then distinguish restoration-generated
observations from actual user movement within the existing tracking owner. Avoid
arbitrary debouncing or suppressing real manual progress. No C15 fix is included.

## Evidence policy and gates

No historical behavioral PASS accepts changed inputs. Existing fixtures and
installed locked dependencies are reused; CCF/CAF results are historical context.
Python/Rust matrices, model/inference/quality, installers, Chatterbox updates and
performance campaigns are outside this patch, not reused successes. C05 remains
deferred to the next separately versioned Chatterbox runtime update.

G0 current exports, G1 focused RED/GREEN, G2/G3 combined controls, G4 final browser,
G5 static checks, G6 model-free native startup and G7 evidence/docs/review are
tracked by result JSONs. Initial native/browser builds overlapped; the later strictly sequential review-fix run supersedes that artifact evidence. Final native/browser/static outcomes and
independent acceptance are pending; do not infer completion from earlier PASS.

Preparation failures include PS5 stderr handling in the first receipt runner
and a PSModulePath mismatch in the diagnostic launcher. The runner was corrected;
the diagnostic always restored source before retry. Original failures remain.
No production failure is inferred from these setup attempts.

## Final host outcomes

- G2-final: 171 cases across seven EPUB suites passed.
- G3-final: 115 cases across six desktop suites passed.
- G4-final: the selected Chromium journey passed with retained per-resize saved
  offset assertions and existing exact/recovered reopen controls.
- G5-final: TypeScript format, lint, EPUB types and desktop types passed.
- G6: one model-free native startup run passed, including current binary build,
  file cancellation/replacement, raster decoding, position restoration, fake
  service cancellation/recovery, zero errors/external requests and cleanup.
- Final review-fix G7 and independent exact-patch acceptance are recorded below.

The second G2/G3 runs followed moving caller-options access back inside the public
error boundary; earlier receipt source identities therefore cannot accept that
final input. Earlier static checks also overlapped a browser-spec edit; final
checks supersede them. Exports were rebuilt after deliberate original-production
C15 diagnostics and verified byte restoration. The initial G4-final/G6 timestamps overlap (15:32:02-15:32:10 versus 15:31:23-15:32:25); the earlier serialization statement is withdrawn. No renderer-consumption proof was captured for that overlap. No model package regeneration was performed. The system diagram and
completed M005 topology/source-position boundary remain applicable unchanged.

G7 evidence retention and all 31 evidence-harness tests passed; the aggregate
then failed only because `git diff --check` found a trailing blank line in the
active-plan index. Final documentation EOFs were normalized. G7-fixed reruns
retention and whitespace successfully. The 31-test component result is retained
from the original immutable G7 output: only Markdown EOFs changed afterwards,
while its checker/test scripts, configuration, lockfiles, tools and isolated
fixture-generation inputs are unchanged. A non-Markdown input comparison is
retained with the review handoff; this is component reuse, not relabeling the
original failed aggregate. Changed-document link inspection verified 27 targets.
No native app or driver process was retained by the successful startup smoke.
Independent review remains pending.

## Independent review R1 and bounded correction

EBC-R1-20261106 returned BLOCKED with three P2 findings: uncontained caller
listener cleanup, missing real pending-open cancellation evidence, and inaccurate
serialization/current-documentation claims. The original report and receipts
remain immutable. The reviewer did not run tests.

New public tests reproduce throwing cleanup on both successful and failed opens.
Successful-path detach now occurs while archive ownership remains inside the
public error boundary; its failure closes the archive and returns fixed internal
failure. Failure-path cleanup is guarded so it cannot replace the primary fixed
outcome. A real pending open is paused at the ZIP entries generator and aborted;
it returns cancelled without publication or abort reason and closes the archive.
The existing post-success raster-read control remains intact.

R1-RED preserves two raw cleanup exceptions plus a timed-out fixture that paused
the unused getEntries method. The corrected generator seam and cleanup fix pass
four selected C17 cases. A typing preflight then caught the generator's boolean
return and explicit this annotation; both were corrected before combined gates.
These preparation failures are not accepted as product failures.

R2-G0/G2/G3/G4/G5/G6 execute in one sequential host process: G4's entire browser
command finishes before G6's build begins. They supersede earlier runtime inputs
and overlapping artifact evidence. No old receipt is edited or relabelled.

## Final review-fix acceptance inputs

R2-G2 passes 174 EPUB cases; R2-G3 passes 115 desktop cases; R2-G4 passes the
selected Chromium journey; R2-G5 passes format/lint and both package type checks.
R2-G6 passes the model-free native matrix with cleanup and no external requests.
R2-G4 runs 15:44:10-15:44:17; R2-G6 runs 15:44:42-15:45:25, as recorded by their
immutable result receipts. These runs are serialized and use the final production
sources. No artifact-consumption claim relies on the earlier overlapping runs.

The plan is archived with its closure documents before the final independent
assessment. The final report in this evidence directory determines exact-patch
acceptance. R2-G7 runs retention, its 31 isolated harness tests, whitespace and
local links against these final documentation bytes; its result is retained in
the run directory. No completion verdict is inferred before that receipt/review.
C15 modeled ordering and C05 deferred runtime parity remain explicit limits.
