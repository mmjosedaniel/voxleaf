# Deep validation of the five audit passes

## Scope and snapshot

The 2026-11-13 review covered the five audit turns, their persisted reports,
the reconciliation, and the reports of all 20 case subagents. Four follow-up
investigations challenged the EPUB, normalization, playback and optional-runtime
cases. The director examined reader authority, persistence and maintainer tools.
Both additional findings received a second independent source inspection.
Earlier context and relevant ExecPlans were compared with the current owners,
public callers, guards and documented policies.

The checkout was `main` at `5fdb2dc835e99e43034e8b40c99817f45236358f`, with an
empty index and product sources matching HEAD. Incoming changes were the
findings registry and audit index, plus the five audit reports and reconciliation.
Their identities at intake were recorded below.

| Input | SHA-256 |
| --- | --- |
| Registry | `ECEE918C93B75725EA0766D2B9D9C82192DCB1228E66942A3173A000E5FBD96F` |
| Audit index | `3327E66806D3C14CF6016BD4B5E87B101F0A635B5996CBD4C6DF11176C53C52D` |
| First pass | `9AC1E667B59BEB5A3F68264583683595A1AAF47625DA0457D72BE00CE16CC277` |
| Second pass | `511ACD8C8C15136E68F6C0D9493318A738F249EB20F2C31E6918A4F0CF75AAB6` |
| Third pass | `95FA4C4A0D794EE7388B28E7DD4FEE8B979FED2A04F880CC471E458543F9B522` |
| Fourth pass | `E1E583E7A6F812F57EC949F524CD13E9DF383D6FACA5B24FFE6A5E8D6A5C3052` |
| Fifth pass | `7F4E48F2D872929BC550C3D09D85604436570FEE0B28021B1482D5B0A513C35F` |
| Reconciliation | `E11493EACFC21EE94928D324F83D59F30E8D4239E433EADDD8DD5F0509C75F5D` |

All behavioral evidence in this report is static. No tests, builds, fault
injections or runtime interactions ran. The listed checks are future
discriminating checks. Historical executions retain their original scope.
The [import manifest](../history-import.md) remains partial. The existing
[reconciliation](2026-11-13-findings-reconciliation.md) supplies detailed lineage
and initial repair proposals. This report qualifies those proposals where the
deeper inspection found additional constraints.

## Coverage and verdicts

| Responsibility | Cases inspected through public consumers | Additional coverage | Remaining limits |
| --- | --- | --- | --- |
| Reader and progress | VF-0034, VF-0035, VF-0044 | Manual admission, terminal follow, repository failure, mounted passive save and ordinary B04 persistence | Native scrollbar delivery, failed geometry frequency and alternate remount order |
| EPUB and locators | VF-0036, VF-0047, VF-0051 | Empty, whitespace and inline inert anchors, publisher IDs, label fallback, event ceilings and canonical continuation | Real EPUB incidence and full conformance |
| Normalization | VF-0037, VF-0039, VF-0052 | Paired quotation handling, other spaces, silent interior/tail/window cases and multi-origin expansions | Acoustic output and omitted-class policy beyond the scoped correction |
| Playback | VF-0041, VF-0045, VF-0048, VF-0050, VF-0053 | Reentrant dispatch, terminal rate preparation, buffered scene timing, Stop receipts and next action | Native timing, metric tolerance and natural race frequency |
| Optional runtime and Settings | VF-0038, VF-0043, VF-0046, VF-0049 | Verification cache, receipt authority, poll failures, real same-profile callbacks and owner replacement | Actual transient filesystem and IPC failures |
| Maintainer tools | VF-0040, VF-0042 | Both subprocess waits, safe restoration gates, exclusive directory creation and later destructive finalization | Disposable Windows containment and filesystem recovery executions |

Nineteen original findings have a source-supported violating sequence. VF-0050
has a source-supported measurement limitation, with the required precision at
interruption unresolved. Two additional findings are indexed as VF-0054 and
VF-0055. A source-supported timing-dependent sequence remains conditional on
that event order. None of these assessments establishes its frequency.

### VF-0034 — Scrollbar recovery

**Present, P2, conditional on native scrollbar-only movement.** The reader
records intent for wheel, single-touch movement and admitted keys. A scrollbar
drag has no handler that records the required baseline. Scroll sampling can
update the visible locator while the narration recovery gate waits for
`measuredManual`. Wheel and PageDown take the admitted route. A stale or
motionless gesture is deliberately rejected by the tracker.
[Reader inputs](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1268),
[admission](../../../../apps/desktop/src/reader/active-visual-locator.ts#L414),
[recovery consumer](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L908).

The stated case requires an earlier unavailable placement, readable content
after real movement and no newly admitted wheel or key event. Verify that
gesture on both browser hosts before choosing event provenance for the fix.
The same omission also matters when a follow correction is pending. Treat that
as adjacent coverage under the existing input-admission case.

### VF-0035 — Completion after failed follow

**Present, P2, conditional on failed placement geometry.** Audible start or
Resume sets `followEligible`. Failed highlight or geometry cancels pending
follow without clearing that eligibility. A matching completion then calls
`settleLocator(end)`, which changes the visual tracker and next Play target
even though placement was never confirmed. A user inspection after that start
clears eligibility and prevents the write. A navigation failure that clears the
active projection also prevents it. The failure witness must retain the active
segment while its measurement fails.
[Controller](../../../../apps/desktop/src/reader/segment-highlight-controller.ts#L315),
[failed measurement](../../../../apps/desktop/src/reader/segment-highlight-controller.ts#L425),
[visual consumer](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L546).

The corrective evidence must belong to the particular segment and follow
attempt. Preserve independent heard-end persistence, normal measured completion,
and release of pending sampling even if completion precedes the scheduled frame.
The PN-04 control needs to continue through segment completion.

### VF-0036 — Inert-anchor structural split

**Present, P2, direct projection witness.** In
`<p>Intro</p><div id="target">Alpha <a id="empty"></a>Beta</div><p>Gamma</p>`,
the #314 flush produces two blocks claiming `target`. The sidecar removes
the ambiguous ID, so its TOC target falls back to Intro. The generated anchor
previously addressing Gamma can resolve exactly to Beta for offsets up to four.
A surviving unique publisher ID instead permits recovery by value.
[Flush](../../../../packages/epub/src/document/xhtml-projector.ts#L1203),
[ID uniqueness](../../../../packages/epub/src/document/xhtml-projector.ts#L762),
[saved-locator resolution](../../../../packages/epub/src/locator/locator-resolver.ts#L234).

Whitespace-only and direct inline-text inert wrappers also split implicit
prose. Therefore the earlier suggestion to wait for any admitted flow content
needs narrowing to genuine semantic block boundaries. A wrapper around a real
identified paragraph retains that child's exact target. Its own wrapper ID
need not create an addressable block under the existing policy. One extra
wrongly projected block can also take a chapter past the reader's 10,000-block
ceiling. These are consequences and controls of the same ID.

### VF-0037 — Quoted terminal ordinal

**Present, P3, direct prepared-text witness.** With effective Spanish,
`Dijo «Llegó 1.º».` prepares `Dijo «Llegó primer».`. The lexical matcher
accepts the quote boundary, the terminal check sees the closer, and punctuation
processing runs after the replacement was selected. Direct terminal punctuation
or true leaf completion takes the corrected CFR-18 route. Code and unsupported
language contexts bypass this lexical expansion.
[Terminal decision](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1345),
[replacement](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1422).

The previous repair suggestion requires explicit closing-pair evidence. The
current generic quotation role also represents opening marks, and the straight
double-quote handling toggles a state. Reusing that role alone would admit
malformed or opening quotations. Check before-noun forms and warm/cold context
with the original spans and bounded look-ahead.

### VF-0038 — Installed size after failed verification

**Present, P3, conditional on the recorded postcommit state.** Promotion followed
by cleanup failure retains the authorized root/manifest receipt. A later
verification error changes the failure field and leaves that receipt. The
client clears the amount immediately, but a cached native snapshot projects
the full manifest amount solely because the receipt remains. Removing a
required active file invalidates the verification-cache tree stamp, so cached
successful verification does not defeat this witness.
[Snapshot and retry](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1909),
[verification cache](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1229),
[client error](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L359).

Preserve the historical case where active verification still succeeds and
cleanup alone fails. The receipt remains necessary for authorized cleanup.
CFR-22 partially corrected an older broad size-reporting problem, and introduced
the specific disappearance and reappearance sequence.

### VF-0039 — Thin-space time article

**Present, P3, direct prepared-text witness.** U+2009 survives EPUB projection.
The article/time matcher excludes it, while the standalone time matcher
accepts the time. Later whitespace normalization yields
`Las las catorce treinta.`. The ASCII, U+00A0 and U+202F controls already
consume the article. U+2007 follows the same omitted-separator mechanism.
[Article matcher](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L987),
[bare-time text](../../../../packages/epub/src/narration/bilingual-spanish-normalization.ts#L138).

Keep lexical recognition bounded and within the same prose context. Reusing
all Unicode whitespace would broaden recognition across semantic boundaries.
The defect concerns prepared text. Acoustic output was not inspected.

### VF-0040 — Unbounded installer or uninstaller wait

**Present, P2, conditional on a child that does not exit.** The ordinary Node
journey moves existing app data to a backup before awaiting the installer.
Both child promises await only error or exit. The bounded check for an absent
installation root runs after uninstaller exit, so it cannot bound that wait.
The finalizer preserves the backup on a returned cleanup error, but cannot
report or restore while the awaited child remains pending.
[Waits and backup](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L865),
[cleanup gate](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L995).

The separate PowerShell FPA-5.3 harness supplies a precedent for owned process
containment. A timeout without descendant termination would make restoring
the backup unsafe. Current evidence establishes indefinite profile displacement
under the specified process behavior. It does not establish loss of the backup.

### VF-0041 — Refill label

**Present, P3, presentation witness.** For Prepared two-, five- or ten-minute
production after a real underrun, expanded details report readiness toward one
minute while the shared label calls the selected production goal the active
target. Compact controls use that same label. The selected production goal is
legitimate and remains the scheduler's goal. One-minute Prepared hides the
discrepancy. A final completed tail or capacity escape can resume earlier.
[Label](../../../../apps/desktop/src/tts/adaptive-preparation-presentation.ts#L38),
[resume threshold](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1067),
[details](../../../../apps/desktop/src/tts/AdaptivePreparationControls.tsx#L37).

Present the automatic resumption threshold with its purpose and retain the
production goal. Check the two text fields through depletion and resumption.
The estimate before an unfinished final synthesis lacks its eventual exact
duration, so that circumstance does not establish an additional threshold bug.

### VF-0042 — Quality-finalization directory failure

**Present, P3, conditional on second-directory creation failure.** Both exclusive
mkdir calls precede the try block and the first WAV move. If creating
`scorecards` fails after `audio` succeeds, metadata and staging survive but
the next same-ID attempt fails at the existing `audio` directory. The CLI
catches typed quality failures, so the filesystem exception also bypasses its
usual content-safe result.
[Finalizer](../../../../services/tts/benchmarks/quality.py#L376),
[CLI boundary](../../../../services/tts/benchmarks/quality_cli.py#L247).

Scope rollback to the newly created empty directory and preserve conflicts.
Moving the mkdir calls under the existing later destructive handler would
erase the staging session on this recoverable failure. The later path
intentionally discards a failed partially finalized session. Recovery after
WAV moves is a separate design decision.

### VF-0043 — Cleanup retry becomes acquisition

**Present, P3, conditional on failed installed verification and subsequent host
admission.** The native check emits the generic invalid-package code, and
Settings selects the acquisition action. After file access recovers,
`select_at` still sees the cached Failed operation and replaces it with
Confirming, dropping the cleanup receipt. A separate consent action starts
the download. A host that cannot acquire takes its compatibility route.
[Native error](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L375),
[selection](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2139),
[Settings action](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L505).

Share the retained-receipt setup with VF-0038, then test the next explicit
action independently of the displayed amount. Genuine precommit acquisition
errors retain their confirmation path. A corrected error origin must survive
both the direct rejection and a subsequent cached snapshot.

### VF-0044 — Failed restoration admits a replacement checkpoint

**Present, P2, conditional on a failed read followed by a successful write.**
Restoration maps unavailable or malformed state to book start. App requests
initial persistence for every book-start reason. Close or lifecycle flush
then rereads the repository and replaces the same book's valid saved offset,
or replaces malformed v1 data before intentional navigation. Persistent
storage failure prevents the write. Future-version and oversized envelopes
retain their rejection guards.
[Restoration](../../../../apps/desktop/src/persistence/reader-position-restore-coordinator.ts#L163),
[admission](../../../../apps/desktop/src/App.tsx#L487),
[flush](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L332),
[repository](../../../../apps/desktop/src/persistence/reader-position-repository.ts#L388).

After narrowing initial eligibility to missing data, also observe mounted
passive sampling before user navigation. A changed initial canonical locator
can independently reach `schedulePassive`. Restrict any additional guard to
the failed-restore state and keep actual navigation, heard checkpoints and
retryable intentional saves. RPI-01's successfully read checkpoint has a
different initial condition.

### VF-0045 — Reentrant Pause misclassifies a contained stop

**Present, P2, conditional on first direct-render confirmation during Pause.**
Pause synchronizes the player. Its first segment-start event can synchronously
make the reader reject a new chapter beyond its presentation limit and call
Stop. The original Pause resumes against a stopped scheduler and fails. Its
catch uses the new current token, so the stale error passes failure admission.
The normal ticker carries its original token and suppresses that stale error.
The accepted EPUB chapter and reader display ceilings differ, allowing this
consumer path.
[Pause](../../../../apps/desktop/src/tts/pcm-playback.ts#L237),
[inline reader settlement](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L527),
[wrong failure token](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1345).

Keep the original owner for both success and failure continuation and recheck
after audible callbacks. The future check must continue through returning to a
readable chapter and ordinary Play. Natural frequency is unknown. The separate
ordinary B04 persistence question is resolved below.

### VF-0046 — Installed state leaves the selected narrator unavailable

**Present, P3, direct state-transition witness given a transient verification
failure.** With Chatterbox selected and the current narrator unavailable,
successful local Check can publish Failed directly to Installed. App requires
the immediately preceding state to be Confirming, Downloading or Verifying.
The installed card's active profile ID hides Activate. Visibility recheck,
explicit compatibility recheck or reopening can independently restore Play.
[App filter](../../../../apps/desktop/src/App.tsx#L446),
[native observation](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2111),
[Activate condition](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L480).

An additional sequence reaches the same defect during genuine acquisition.
A current periodic read can fail immediately before the still-current Download
publishes Installed. The poll's Failed snapshot clears App's acquisition flag,
and the successful action is ignored if no intervening poll restores Verifying.
The client allows that terminal action to settle in the same action generation.
Preserve initiating-owner identity when correcting either path.
[Client ordering](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L339),
[polling](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L265).

### VF-0047 — Navigation-label edges violate the coarse schema

**Present, P2, direct public-opening witness.** Both EPUB 3 XHTML and EPUB 2 NCX
retain leading or trailing U+00A0 inside a substantive label. When its target
belongs to the spine, the coarse projection copies the label into BookV1,
whose edge-whitespace rule rejects it. Opening fails before chapter projection.
Groups and non-spine targets are omitted from the coarse projection and do
not establish this particular opening failure.
[Collectors](../../../../packages/epub/src/navigation/navigation-document.ts#L516),
[NCX](../../../../packages/epub/src/navigation/ncx-navigation-parser.ts#L649),
[projection](../../../../packages/epub/src/book/book-v1-projection.ts#L70),
[schema](../../../../packages/shared/schemas/book/v1.schema.json#L58).

The same mismatch lets an NBSP-only visible label suppress a usable EPUB 3
title fallback. Preserve interior nonbreaking spaces, normalize before choosing
fallback, and retain the current raw XML and retained-attribute accounting.
Literal U+00A0 or numeric `&#160;` provides a valid XML witness.

### VF-0048 — Completed rate state and unnecessary preparation

**Present, P3, direct terminal-state witness.** Final drain leaves active and
pending rate values. A change during the last unit, or a new change after
completion, can therefore promise application after a section that has ended.
The latter also calls rate preparation against the retained completed player.
The real successor control requires those values to survive until activation,
so a blanket boundary reset would regress it.
[Terminal drain](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1030),
[selection](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L757),
[message](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L162).

A failed late preparation can also set that retained player's selected rate
to 100% after the coordinator ticker stops, while the saved preference still
says 75%. This is conditional adjacent behavior of the same completed owner.
Retire obsolete work as well as the fields. The UI's completion journey is
Stop followed by Play, which should initialize the new scheduler from the
saved selection. Check resets, delayed preparation and persistence failures.
[Rate preparation](../../../../apps/desktop/src/tts/pcm-playback.ts#L798).

### VF-0049 — Healthy checked-radio selection resets diagnostics

**Present, P3, direct mounted-handler witness.** The checked radio runs its click
handler. Only the healthy saved Piper case has a UI no-op guard. Healthy
Chatterbox selection returns true before mutation, and the handler invokes
the recovery reset callback. It clears four accumulators and resets their
baseline even when playback keeps the same service and generation.
[Radio](../../../../apps/desktop/src/tts/HardwareCompatibilityControls.tsx#L134),
[action](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L77),
[episode reset](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1215).

The visible loss requires an enabled checked radio, the same effective language,
a healthy loaded owner and positive prior counters. Unavailable-owner selection,
a real profile change and explicit compatibility recheck must continue working.
Sample immediately after the click so newly accumulated time cannot hide a reset.

### VF-0050 — Interrupted WSOLA measurement

**Measurement limitation present, P3 diagnostic candidate. The need for a code
correction remains inconclusive.** The worklet can produce frames beyond its
last accepted report, then Stop removes the receiving listener and freezes the
last count. A first interrupted unit can report zero. The terminal Stop message
does not contain a count. Periodic cadence does not bound main-thread delivery
lag or accumulated error across interruptions.
[Worklet](../../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts#L321),
[receipt shutdown](../../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L420),
[frozen metric](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1545).

CCF-C20 and the available exact-output controls cover confirmed receipts and
completion. The inspected policy does not specify exact interrupted totals.
Decide whether the accepted-receipt lower bound meets diagnostic requirements
before changing shutdown. A bounded final metrics receipt would need retired
unit and episode identity and must preserve immediate cutoff. Physical output,
highlighting and durable position have separate authorities.
[Metric semantics](../../../development/testing.md#L2171),
[CCF-C20](../../../plans/completed/confirmed-chat-findings-minimal-corrections.md#L296).

### VF-0051 — Structural events exhaust a token window

**Present, P2, direct arithmetic and public-consumer witness.** A list of 1,365
one-character items has 1,365 source tokens and 4,097 events from its list
anchor. The event guard rejects the closing event before public batching can
return its first segment. Starting at the first leaf skips two openings and
leaves 4,095 events, providing a useful passing control.
[Traversal and guard](../../../../packages/epub/src/narration/narration-source-window.ts#L335),
[consumer](../../../../packages/epub/src/narration/narration-preparation.ts#L721).

A quote around 1,364 items reaches exactly 4,096 events. If two nested quotes
follow that list, their first leaf can be the overflowing event. Those
controls require a correction to preserve pending leaf work and continuation.
The XML depth ceiling already rejects excessive nesting. The supported failure
uses breadth and differs from the historical empty-list pressure fixture.

### VF-0052 — Silent prefix and interior run

**Present, P2, direct packing witness.** At 320 U+200B positions followed by
`A`, every candidate within the source ceiling is silent and including the
letter exceeds that ceiling. The fallback only drains collapsed whitespace.
The same cause affects `A` plus 639 marks plus `B`, after the first segment
consumes `A` and 319 marks.
[Omission](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1964),
[fallback](../../../../packages/epub/src/narration/narration-segment-packer.ts#L973).

An entirely silent suffix and a whole silent source window already have
progress paths. Consequently 4,096 marks followed by `A` does not establish
the same failure as 320 marks. U+2060 shares the formatting category. Soft
hyphens and semantic breaks use other categories. Any correction must define
their intended scope and preserve source positions, protected groups and
bounded cancellation.

### VF-0053 — Scene boundary discarded with punctuation

**Present, P3, conditional on a buffered audible successor.** With separate
paragraphs `First.`, `—`, `***`, `Second.`, preparation attaches the scene
boundary to the em dash. Piper omits that unit before computing delays.
The remaining transition uses the ordinary 600 ms instead of 1,200 ms. With
`First.` eighth, the previous batch may already have fixed the predecessor's
delay before the next batch finds the marker.
[Scene assignment](../../../../packages/epub/src/narration/narration-preparation.ts#L889),
[Piper filter](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2131),
[buffered handoff](../../../../apps/desktop/src/tts/pcm-playback.ts#L480).

An audible terminal ellipsis retains the 900-ms override. An omitted ellipsis
must not transfer that override. No successor or a real underrun avoids a
semantic timer. Carry semantic scene evidence with the incoming audible unit
and clear it with its run. A change confined to the already-published
predecessor misses the cross-batch case.

## Additional findings

### VF-0054 — A split lexical expansion loses text on warm continuation

**Present by independent static inspections, P2.** Use supported XHTML with a
paragraph containing 156 lowercase `a` characters followed by `#1.º.`, an
effective Spanish default, no explicit inline language override, and the active
`narration-piper-v2` preparation profile. Request one segment. The source
trace gives these outputs and canonical offsets.

| Preparation | Output suffix | Source range |
| --- | --- | --- |
| First batch | `#pri` after the 156-letter prefix | `[0,158)` |
| Next batch on the same preparation checkpoint | `.º.` | `[158,161)` |
| Fresh publication prepared from offset 158 | `mero.` | `[158,161)` |
| One call admitting both segments | Second segment `mero.` | `[158,161)` |

The terminal ordinal expands to `primero`, distributed as `pri`, `me`,
`ro` across three source positions. Its protection array is empty. The
hash is retained with role `preserved`, so it supplies no preferred token
boundary. The prefix weighs 157 Piper speech units and `pri` reaches 160.
The next chunk exceeds the limit. The hard fallback permits the internal cut.
Warm preparation begins at the saved offset and has no lexical-expansion
context. Cold preparation rewinds to the paragraph start and filters the first
segment after reconstructing the original expansion.
[Ordinal form](../../../../packages/epub/src/narration/bilingual-spanish-normalization.ts#L144),
[source distribution](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1142),
[protection groups](../../../../packages/epub/src/narration/narration-boundary-scanner.ts#L350),
[hard cut](../../../../packages/epub/src/narration/narration-segment-packer.ts#L584),
[warm/cold entry](../../../../packages/epub/src/narration/narration-preparation.ts#L654).

Seven earlier short spoken paragraphs place the cut in the desktop's eighth
segment, making its ordinary next-batch request reach the same problem.
The desktop considers ordinal indicators speakable, so the corrupted suffix
survives Piper's punctuation filter. The feminine ordinal and table expansions
for 42 and 2026 share the unprotected multi-origin mechanism. An ordinary
space before the ordinal supplies an earlier preferred boundary and avoids
this particular witness.
[Desktop batch and filter](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L76),
[public continuation](../../../../packages/epub/src/narration/narration-preparation.ts#L985).

M005 requires independence from batch size and preserves a normalization
expansion unless that expansion itself exceeds the maximum. Here the expansion
fits comfortably in a fresh segment. CFR-18 addressed grammatical form and
R7-05 retained quotation context. Neither covers the internal lexical cut.
The current Piper v2 policy retains determinism and source traceability.
The historical lookup found no correction for this exact sequence.
[M005 rule](../../../plans/completed/M005-narration-text-preparation.md#L286),
[Piper v2](../../../architecture/piper-narration-preparation-profile-v2.md#L130).

A bounded correction should make the source positions of one lexical match
atomic for segmentation while retaining its mapping. Equal generic tags must
not accidentally merge independent adjacent matches. Compare one- and
eight-segment draining, cold seek from the returned locator, boundaries on
either side of the limit, and an actual oversized-token rejection. No speech
was generated and natural occurrence of the synthetic boundary is unknown.

### VF-0055 — Inline Stop can precede a stale synthesis dispatch

**Present for a source-supported event order, P3, timing-dependent.** This
establishes a production caller for the pre-dispatch question left open in the
fifth pass. During direct playback, a next-chapter unit can be allocated before
its first render confirmation. More synthesis can be due below the continuing
production goal. The synthesis action reserves scheduler work and records a
scope, then publishes a snapshot before calling the client.
[Reservation and dispatch](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2187),
[continuing goal](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L917).

Snapshot construction synchronizes playback. If the device clock has advanced
since the preceding observation, the reader's first audible callback can
synchronously report that the next chapter is too large and invoke Stop.
Stop increments the run token and closes the player. Its attempted client
cancel rejects before mutating the still-ready client, because the reserved
scope has not been dispatched yet. Stop awaits that rejection. If the outer
publication returns, the original action calls `synthesize_tts_segment`
without checking its now-obsolete run token.
[Snapshot synchronization](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2590),
[reader callback](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L527),
[Stop ordering](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1537),
[client cancel and dispatch](../../../../apps/desktop/src/tts/process-client.ts#L438).

The return condition matters. The nested audible publication can account the
current quantum before Stop. If the outer refresh then sees zero additional
frames, it reaches dispatch. A further positive delta can instead throw
against the stopped scheduler and prevent that particular send. The active
follow, buffered chapter transition and pending production are also necessary.
This order received a second independent code review. Host incidence remains
unmeasured.
[Render confirmation and delta](../../../../apps/desktop/src/tts/pcm-playback.ts#L492),
[direct clock](../../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L260).

The established consequence is one obsolete local IPC dispatch after identity
invalidation. Native execution depends on its race with shutdown. The fallback
shutdown invalidates the client, waits for containment and suppresses late
audio and results. The source trace provides no evidence of subsequent
playback or text leaving the device. CCF-C07 supplied the equivalent
post-publication guard for service start. The synthesis path lacks it.
[Fallback containment](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1554),
[startup guard](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2034),
[invalidation policy](../../../architecture/synchronization-authority-v1.md#L64).

Recheck the original run and scheduler immediately after synchronous
publication and before dispatch. The discriminating check must assert that
the mounted reader's Stop is followed by zero obsolete synthesis invocations,
then verify cleanup and a subsequent explicit Play. Final idle state alone
would miss the dispatch. Late EPUB preparation has an analogous controller
installation after publication and belongs in adjacent guard coverage.

## Withdrawn implications and unresolved questions

- Ordinary B04 automatic navigation preserves the prior stored position in the
  mounted effect order. The reader subscriber triggers Stop before the save
  bridge handles the original audible event. Inactive persistence rejects that
  checkpoint. This agrees with ADR-0057's explicit protection of the prior valid
  position. The earlier unresolved observation is closed for that mounted
  sequence. Partial-remount ordering remains unverified.
  [Reader subscription](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1065),
  [save bridge](../../../../apps/desktop/src/persistence/narration-position-save-bridge.ts#L57),
  [B04 policy](../../../architecture/decisions/ADR-0057-reader-acquisition-correctness.md#L82).
- An inert wrapper whose own ID has no addressable projected block can recover
  to chapter start under the existing policy. Its identified paragraph child
  remains addressable. That behavior alone adds no new finding.
- Silent tails and whole silent windows can progress through their existing
  continuation paths. Their control results must be preserved while fixing
  VF-0052.
- VF-0050's count difference is established. Exact interrupted-frame accounting
  has no inspected acceptance threshold, so the report does not classify every
  discrepancy as a required playback correction.
- Publication during synchronization can also construct an outer snapshot
  from scheduler state captured before an inline Stop. Late local preparation
  can install an abort controller after that Stop. Their mounted UI consequence
  and exact order require focused checks. They are adjacent questions for
  VF-0055, without additional IDs or a claim of stale audible output.

## Closeout

All 20 original IDs received a scoped assessment. Nineteen retain a
source-supported defect sequence, and VF-0050 retains the measurement
observation with its policy qualification. VF-0054 and VF-0055 add two distinct
static candidates. Additional conditions of VF-0036, VF-0046, VF-0047,
VF-0048 and VF-0052 remain on their existing IDs.

The work used read-only Git status and source history, file and test inspection,
and retrieval of the relevant chat and subagent reports. No runtime acceptance
evidence was generated or reused as a fresh result. Edits are limited to this
report, the [audit index](README.md) and the [registry](../registry.md). The five
prior reports and reconciliation retain their intake identities. Product-code
changes, acoustic validation, natural incidence, and the remaining host and
timing checks are pending.
