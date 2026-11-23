# Reconciliation of the five November 23 logic audits

## Scope and evidence

Reviewed the 35 numbered cases reported across the five passes on `main` at
`d9a0a72db1f5dd8a5dc7553ea0e2358c9cfe497e`. Each case received its own
read-only subagent investigation. The coordinator reconciled the recommendations
against current owners and earlier acceptance. This is source review. The
verification steps below are proposals. No codebase tests, builds, app runs,
downloads or benchmarks were executed.

The index was empty at intake. The only working changes were findings
documentation. The registry and audit-index intake blob IDs were
`1f7fe696c586c61dba2faf52281aa01f62722820` and
`c27e73a65b5408a7f6a0bbec777915d48946c4bb`.
The five report blobs were `4ebeadee2b24685b9a732a9e2512245edc685850`,
`5acaae3810305ef7d9fee33a06fa66a6f995001c`,
`053536ca0aeb033cb1d15a899ef44dbe350ef5be`,
`4088c8cfca9951da38503229a4632f0bad2e9c4e` and
`69bd4ca7cc1532995e01b1d3edcb972274861160` in pass order.

[Registry](../registry.md) · [Imported history](../history-import.md) ·
[Pass 1](2026-11-23-repository-logic-audit.md) ·
[Pass 2](2026-11-23-repository-logic-audit-pass-2.md) ·
[Pass 3](2026-11-23-repository-logic-audit-pass-3.md) ·
[Pass 4](2026-11-23-repository-logic-audit-pass-4.md) ·
[Pass 5](2026-11-23-repository-logic-audit-pass-5.md)


## What the earlier fixes covered

- **VF-0093 was explicitly addressed and remains partially closed.** The old
  Piper start now checks cancellation before spawning. The regression fixture
  released verification before checking the next Play, leaving exact cleanup
  under a held verification path unresolved. [Case](#vf-0093)
- **VF-0133 predates the adjacent consent fix.** RAF-16 protected a Download
  after confirmation identity capture. The old request can still reach capture
  after Cancel and a new Review. Source history shows that route existed when
  the protection landed. [Case](#vf-0133)
- **VF-0138 changes the meaning of a newer measurement.** VF-0066 protected
  playable-audio readiness. The later refill receipt can close before that
  audio reaches the rate-preparation backend. [Case](#vf-0138)
- **VF-0149 had already failed on Windows.** Earlier work recorded the
  disappearing WebView2 entry and a passing unchanged retry. The vulnerable
  traversal remains. [Case](#vf-0149)
- **VF-0165 traces to a specific metric change.** F10 made playback totals
  cumulative across a recovery episode. The smoke harness kept the one-minute
  threshold that had used a per-Play counter. A harness-local fix preserves
  the intended product totals. [Case](#vf-0165)
- **Three cases require a scope decision before editing.** Decide how to handle
  local links that wrap blocks, whether to omit a hidden TOC label root, and
  which payloads the standalone Windows check promises to verify.
  [VF-0135](#vf-0135) · [VF-0145](#vf-0145) · [VF-0148](#vf-0148)

## Coverage

| Responsibility | Source sequences checked | Coverage and gaps |
| --- | --- | --- |
| EPUB and narration preparation | Archive admission → BookV1 path → resource lookup. XHTML/OPF syntax → projection → public opening. TOC labels → limits. Scene and Celsius boundaries → mapped narration units. | Inspected for the listed IDs. EPUB corpus frequency and broader parser conformance are outside this review. |
| Reader and accessibility | Initial restore, TOC jumps, reflow and pending placement → focus, viewport state, checkpoint, and next Play. Appearance persistence → reader notice. Direction → list/article rendering. | Inspected for these event orders. Browser geometry, forced colors, and real keyboard or wheel timing were unmeasured. |
| Playback and local TTS | Pending start/exit, Download/Cancel and cleanup/retry, local v8 Remove, rate preparation, pause/follow, and native playback receipts. | Inspected across renderer and native owners. Windows timing, device audio, GPU/model behavior, and live transfers were unmeasured. |
| Maintainer tools | Quality reservations and rollback, Windows package and inventory checks, WebView2 traversal, native phase evidence, network sampling, and playback-duration acceptance. | Inspected in current tooling and relevant frozen or historical sources. No new host, release, or benchmark evidence. |

History lookup was bounded to relevant plans, Git lineage, the registry, and
existing fixture text. Source presence establishes the scoped sequence and its
conditional consequence. Natural incidence and broader history remain open where
the case does not cite stronger evidence.

## How the cases interact

- **Keep consent and cancellation identities separate.** A host compatibility
  observation, a Chatterbox confirmation, a pending native start and an owned
  child each prove a different stage. Exercise A → Cancel → B → late A, plus
  same-owner retry after a transient denial. Include application exit at the
  pre-spawn boundary so an interactive Cancel fix cannot stand in for exit.
- **Treat EPUB syntax and stable location separately.** Accept equivalent
  values at the owning parser or the BookV1 projection. Keep the exact
  ZIP member key, reader offsets, collision protection, content filtering
  and resource budgets. Pair a newly accepted book with a genuinely rejected
  reference and same-byte close/reopen.
- **Assert reader behavior through the next action.** An available logical
  locator can precede actual placement. Use the actual destination, keyboard
  focus, scroll provenance, saved checkpoint and next Play as separate
  assertions. Compare trusted movement with application-owned scrolling and
  an unchanged viewport.
- **Observe the event behind each metric.** Scheduler readiness, device start,
  acknowledged loading, actual network sampling and accumulated episode time
  are distinct signals. For any changed claim, include an otherwise-successful
  run missing the exact witness and confirm it cannot get credit.
- **Make error recovery observable before and after the attempted write.**
  Fault-inject one owned write or unlink, assert whether the state remains
  retryable, and then perform the next operation. Preserve private data only
  according to its existing ownership rule and keep errors content-free.

For implementation, use the repository's configured host commands, prove the
original trigger fails for the intended reason before the correction, and
obtain the required independent review for the exact patch. Broad CI results
and a historical fixture for a neighboring transition cannot close these cases.
[Change review](../../agentic-change-review.md) · [Testing guidance](../../testing.md)


## Case reviews

### VF-0093

**Cancel during Piper package verification**

**Earlier fix and current state.** The November 17 ExecPlan covered this exact case. It registered and retired the pending request before spawn. The fixture held a barrier after profile selection and released it before trying another start. The verifier still has no cancellation input, and the client and coordinator still join the original startup within five seconds. Slow verification can therefore leave Play gated. Diagnostics can retry cleanup after the read settles. [Plan](../../../plans/completed/november-17-findings-corrections.md#L68) · [Fixture](../../../../apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs#L5) · [Client join](../../../../apps/desktop/src/tts/process-client.ts#L575)

**Regression risk.** Returning before the native owner relinquishes startup can admit competing work or misreport cleanup. A broad cancel can retire the replacement. Polling cannot interrupt one blocked OS call.

**Bounded correction and check.** Attach cancellation to the admitted start ID, check it between directory and hash operations and immediately before publication, and preserve ownership until the verifier exits. Hold that specific verifier through Cancel, assert zero old spawn and a successful next Play, and deliver a late Cancel for the old ID. Include a tampered-file control, cancellation after publication, and a genuinely uninterruptible read that still reports cleanup failure.

### VF-0133

**A cancelled Download can borrow later consent**

**Earlier fix and current state.** RAF-16 tested replacement of consent after the old Download had captured its confirmation and entered the host probe. U8/2.1 covered reselection in the same operation. A renderer request still carries only the profile ID and native capture occurs inside the blocking closure. The earlier request can therefore bind a later confirmation if it was delayed before capture. That pre-capture ordering already existed when RAF-16 landed in `5e4c44b`. [RAF-16](../../../plans/completed/residual-audit-corrections.md#L230) · [Fixture](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L485) · [Native entry](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2793)

**Regression risk.** Changing the identity on a harmless refresh can invalidate genuine consent. Moving capture before the blocking closure still leaves queued IPC unbound. A partial caller migration could break the renderer or release runner.

**Bounded correction and check.** Bind Download to the opaque identity of the native confirmation actually presented. Preserve it through same-confirmation refresh and enforce identity at admission and after the host probe. Update the renderer and maintained probes together. Hold A before capture, Cancel A, Review B and release A. Require zero transfer from A and one transfer after explicit B consent. Keep host denial/retry, duplicate submission and late postcommit Cancel controls.

### VF-0134

**Leading whitespace in an admitted chapter filename**

**Earlier fix and current state.** VF-0119 aliased an admitted filename containing a decoded hash in BookV1. The alias condition still excludes leading nonbreaking space, even though the archive and percent-decoded manifest path admit it. BookV1 rejects the unchanged edge-whitespace string. [Prior plan](../../../plans/completed/november-17-findings-corrections.md#L45) · [Projection](../../../../packages/epub/src/book/book-v1-projection.ts#L119) · [Schema](../../../../packages/shared/schemas/book/v1.schema.json#L106)

**Regression risk.** Trimming or normalizing the actual archive path can collide two real members, break resource reads or redirect a locator. Broad schema relaxation changes the shared wire contract.

**Bounded correction and check.** Reuse collision-checked projection aliases for the admitted edge-whitespace case in both resources and spine. Keep raw archive keys and exact-byte book identity for reads and locators. Exercise public open, same-byte resume, fragment navigation and an adjacent unvisited resource. Include ordinary paths, hash paths, alias collisions and prohibited separators as controls.

### VF-0135

**A valid internal anchor that wraps a paragraph**

**Earlier fix and current state.** CFR-04/U4 explicitly scoped its fix to inert external and no-href anchors, leaving arbitrary internal block links outside the accepted change. The active in-book link creates an inline collector; the admitted paragraph requires a block collector and the publication fails. [Prior scope](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L334) · [Link projection](../../../../packages/epub/src/document/xhtml-projector.ts#L1310) · [Block requirement](../../../../packages/epub/src/document/xhtml-projector.ts#L1609)

**Regression risk.** Treating every anchor opened in block context as inert would break valid inline links in implicit prose, potentially splitting paragraphs and changing generated locator identities. Whole-block activation would change the semantic/UI contract.

**Bounded correction and check.** Decide whether preserving readable content with an inert wrapper satisfies the intended scope. If so, make that choice only when the local anchor has a verified direct block child and preserve ordering, IDs and filtering. Verify public opening, exact offsets, a normal body-level clickable inline link, inert wrappers, invalid nested links, undeclared targets and budget limits.


### VF-0136

**PageDown from a focused in-book link**

**Earlier fix and current state.** CFR-03 and the VF-0063 correction used a focused article for PageDown and related keyboard chords. The in-book link renders as a button and its PageDown is excluded with other interactive controls. If WebView2 scrolls the viewport, the old heard checkpoint can survive the move because the save gate sees no measured manual intent. [Prior fixture](../../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts#L5308) · [Key filter](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1341) · [Save gate](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L225)

**Regression risk.** Dropping the interactive-control filter broadly can misattribute Space/Enter activation, selection, editing or later programmatic reflow as reading.

**Bounded correction and check.** First confirm trusted unmodified PageDown moves the actual reading viewport from the reader-owned link. Admit only that gesture with measured movement from the right source. Verify Stop, focus link, PageDown without link activation, reopen at the new checkpoint and explicitly Play there. Include Space/Enter, no movement, delayed owned reflow, and ordinary article keys.


### VF-0137

**Scene break preceded by a formatting omission**

**Earlier fix and current state.** VF-0111 implemented whole-paragraph recognition for a marker beyond the source window. Its fixture uses NBSP padding. The raw scanner skips whitespace but rejects U+200B, which both normalizers omit. After advancing, the nonzero-offset suffix is no longer eligible for scene classification. [Plan](../../../plans/completed/november-17-findings-corrections.md#L57) · [Fixture](../../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L1466) · [Scanner](../../../../packages/epub/src/narration/narration-preparation.ts#L636)

**Regression risk.** Skipping arbitrary invisible characters can swallow preserved content or turn ordinary prose into a scene pause. Normalizing the full leaf up front can exceed bounded work.

**Bounded correction and check.** Handle U+200B as an established prose omission in the existing bounded scan and preserve the original source offsets. On both live profiles, compare short, long and NBSP-only ornaments. Assert the previous scene boundary, no spoken ornament, exact continuation and batch-size parity. Keep prose, code, raster, quote and list controls.

### VF-0138

**Refill reports completion before rate preparation finishes**

**Earlier fix and current state.** VF-0066 protects successor allocation after a rate change. VF-0103 and VF-0123 address different measurement windows. The current delayed-rate fixture asserts no early device start but advances no time during the wait. The indexed receipt landed in `d9a0a72` and closes at the watermark, so continued silence can be omitted or counted as two intervals. [Prior plan](../../../plans/completed/november-17-findings-corrections.md#L86) · [Scheduler](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1077) · [Fixture](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L2137)

**Regression risk.** Timing at rate activation can still credit a failed backend start. Waiting for device proof must preserve current-rate admission, complete short tails, explicit playback overrides and Pause semantics.

**Bounded correction and check.** Keep one interval owned by the current run until the matching successor backend successfully starts. If reporting rendered sound, use its render receipt instead. Extend the held-worklet test with an advancing clock, rate change and fallback. Assert one index and the complete wait. Cover failed allocation, Pause, Stop, stale replacement and short tails.

### VF-0139

**An immutable quality panel can be unscorable**

**Earlier fix and current state.** VF-0115 and VF-0129 solved the one-evaluator v6 case and evaluator-count admission. The retained v2 panel can still lock all its cards with a candidate dimension unscored. The scorer discovers the gap only after submission. [Acceptance](../../../plans/evidence/november-17-findings/implementation-cases.md#L79) · [Submission](../../../../services/tts/benchmarks/quality.py#L499) · [Panel assembly](../../../../services/tts/benchmarks/quality.py#L662)

**Regression risk.** Requiring coverage on each card rejects valid complementary scores. Counting across candidates hides a missing candidate dimension. Rewriting accepted cards compromises evaluation evidence.

**Bounded correction and check.** Under the existing lock, validate coverage across accepted cards plus the incoming card only when it would complete the panel. Keep candidate identity private and reject before committing the final card. Exercise one missing dimension for only one candidate, corrected retry, complementary coverage, duplicate submission and v6 controls. An already committed, unscorable panel needs a fresh blinded session under existing rules.

### VF-0140

**Quality cleanup can omit its error response**

**Earlier fix and current state.** VF-0117 translated a correction-command unlink failure. VF-0082 protected cleanup ownership and overlap. A recursive deletion error still escapes the independent cleanup CLI route with a traceback and without its JSON failure. [Prior plan](../../../plans/completed/november-17-findings-corrections.md#L115) · [Cleanup](../../../../services/tts/benchmarks/quality.py#L733) · [CLI](../../../../services/tts/benchmarks/quality_cli.py#L273)

**Regression risk.** Suppressing deletion errors can claim success while private files remain. Removing the sibling lock can split ownership. Partial deletion may already have occurred.

**Bounded correction and check.** Translate the cleanup command's own filesystem error to the existing content-free failure and preserve the lock. Inject denial before and during removal, check one JSON error with no path, and retry the same ID after clearing it. Cover neighboring sessions, busy admission and normal cleanup.


### VF-0141

**Staging-guard failure sends Settings to download review**

**Earlier fix and current state.** VF-0043 handles failure verifying the installed package. VF-0112 added the staging guard and verified direct native retry after the blocker clears. That fixture bypasses Settings. On the current path a verified installation plus a staging failure returns generic invalid, and Review can replace the retained cleanup receipt. [Native retry](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2048) · [Direct retry fixture](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L2114) · [Settings](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L524)

**Regression risk.** A broad renderer remap would route genuinely invalid or precommit packages into cleanup. Relaxing ancestry checks can operate on unrelated storage.

**Bounded correction and check.** Keep the guard and publish cleanup-specific status only while the same verified installation and receipt own cleanup. Use mounted Settings to Check with the blocker, confirm no mutations and the same retry action, then repair staging and Check successfully. Preserve true installed-package failure and explicit download consent.

### VF-0142

**Appearance can settle an unmounted TOC target**

**Earlier fix and current state.** M004 requires materialization before alignment. PN-02 validates explicit narration placement, and VCA-R1 covers reflow of an already mounted paused target. Appearance can instead start a 12-frame timer before a deep target mounts. Ordinary TOC settlement defaults the unavailable outcome to success, opening the Play and save gates too early. [M004](../../../plans/completed/M004-reflowable-visual-reader-and-position-restoration.md#L982) · [Mounted fixture](../../../../apps/desktop/src/reader/ReaderPublication.test.tsx#L1485) · [Appearance effect](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1046)

**Regression risk.** Extending the deadline only moves the failure. Skipping every pending reflow can regress mounted placement or leave the gate stalled. A stale mount can settle a newer jump.

**Bounded correction and check.** Apply appearance immediately, but let the matching destination-ref path own alignment until the target exists. Exercise a section that takes more than 12 frames to mount, verify no early save or Play, and observe exactly one settlement when ready. Include a superseding jump, the mounted VCA-R1 case and genuinely unavailable geometry.

### VF-0143

**Restorer scroll can consume unrelated wheel intent**

**Earlier fix and current state.** RPI-01 preserves canonical positions and VF-0074 requires measured manual movement. Neither exercises wheel from a hard scroll boundary while an explicit reflow owns the viewport. The wheel can arm intent without moving. The later restorer delta is credited as manual and can bypass exact placement protection. Host timing remains to be demonstrated. [Wheel intent](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L367) · [Restorer](../../../../apps/desktop/src/reader/reader-reflow-restoration.ts#L440) · [Movement gate](../../../../apps/desktop/src/reader/active-visual-locator.ts#L429)

**Regression risk.** Clearing all intent or suspending all admission can lose genuine movement and a valid pending save. A direction-only check still credits a same-direction owned scroll.

**Bounded correction and check.** Prevent the matching programmatic scroll from consuming unproven manual intent, preserving already measured movement and new input. With a real trusted wheel and held restore, prove zero wheel displacement, a subsequent restorer delta, an unchanged saved offset after reopening and a later genuine wheel save. Cover same-direction owned movement, passive resize and ref/revision replacement.

### VF-0144

**WSOLA can omit the source tail**

**Earlier fix and current state.** NLC-01 corrected cumulative backwards drift. Its late-signal fixture leaves the final 1,000 source frames silent. For 24,038 input frames at 0.95×, source frames 23,903–24,037 cannot contribute to the 25,304-frame output, yet the end receipt credits them. Speech impact is unmeasured. [NLC-01](../../../plans/completed/narration-logic-corrections.md#L94) · [Fixture](../../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts#L200) · [Grain bounds](../../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts#L245)

**Regression risk.** Forcing a final grain can repeat audio, click, alter pitch or exceed realtime work limits. Extending output would break duration and accounting.

**Bounded correction and check.** Align and weight the terminal overlap inside the existing output budget. Test a tail-only signal in the exact failing case, sweep lengths around hop boundaries on the five slow rates, and retain silence, short units, join continuity, pitch, ownership, Pause/Stop and direct 1× controls. Use focused WebView2 listening before making a speech-quality claim.


### VF-0145

**Hidden text at the root of a TOC label**

**Earlier fix and current state.** RCF-15 excluded hidden descendants from label collection. Its fixture uses nested spans/images, and the root initializer still counts text in a hidden label. The current result therefore depends on whether the same concealed text sits on the label or inside it. EPUB 3.3 allows dedicated navigation UI to ignore `hidden`, so adopting root suppression is a VoxLeaf policy decision. [RCF-15](../../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L257) · [Root initializer](../../../../packages/epub/src/navigation/navigation-document.ts#L303) · [EPUB navigation rule](https://www.w3.org/TR/epub-33/#sec-nav-def-hidden)

**Regression risk.** Dropping the whole list item can discard child entries or its target. Skipping markup validation under a hidden root can alter rejection policy.

**Bounded correction and check.** If the existing descendant suppression policy is meant to extend to the root, initialize hidden-depth state there while preserving target checks and title fallback. Cover root anchor/span, visible over-cap content, hidden descendants, hidden top-level navigation, ARIA behavior and forbidden markup. If the dedicated UI intentionally includes root labels, document and test that decision.

### VF-0146

**Native Chatterbox accepts an incomplete host report**

**Earlier fix and current state.** M011 called for native to repeat the renderer gate. Its acceptance tested hardware thresholds and missing required values. The renderer requires a complete report and the native predicate omits that check. A DirectML fault can leave CUDA facts intact in an incomplete report. [M011 closeout](../../../plans/completed/M011-package-validate-and-release-mvp.md#L2075) · [Native predicate](../../../../apps/desktop/src-tauri/src/host_profile_detection.rs#L708) · [Published policy](../../../architecture/hardware-profile-recovery-authority-v1.md#L119)

**Regression risk.** A completeness requirement affects native Download and ordinary and local-v8 Select, including hosts whose relevant CUDA facts remain known. Tolerating unrelated provider failures would change published policy and requires both gates to agree.

**Bounded correction and check.** Under the current policy, require Complete in that native predicate while preserving thresholds, default CUDA identity and consent. Feed both gates reports differing only in status. Let a successful renderer check precede a fresh incomplete native report and require zero staging or transfer. Cover complete reports with DirectML explicitly unavailable, successful selection and retry.

### VF-0147

**Incomplete benchmark preparation reserves the ID**

**Earlier fix and current state.** VF-0104 made publication atomic and exercised consumed, settled and restored records. Initial prepare still creates its final directory before writing the reservation, leaving no claimable record and no same-ID retry after failure. [Plan](../../../plans/completed/november-17-findings-corrections.md#L111) · [Prepare](../../../../services/tts/benchmarks/benchmark_safety.py#L208)

**Regression risk.** Reusing or recursively deleting a preexisting final directory can replace another owner's reservation. Recapturing a committed observation would corrupt evidence.

**Bounded correction and check.** Publish the full observation and reservation from an exclusively owned sibling staging directory with a supported no-replace primitive. Inject record-write and final-publication faults independently and retry the same ID. Keep an existing winner and its bytes intact, ignore abandoned owned staging for admission, and exercise claim/finalize after successful prepare.

### VF-0148

**Windows package-check scope overstates payload verification**

**Earlier fix and current state.** The full Piper check and verified-core build validate the staged tree. M011 lists the Windows static/configuration gate separately, but testing guidance also credits the standalone check with the verified payload. That route only checks existence and manifest equality and can pass changed payload files. VF-0068 and VF-0107 cover different evidence inputs. [Commands](../../../../package.json#L91) · [Standalone check](../../../../apps/desktop/scripts/windows-release.mjs#L351) · [Testing guidance](../../testing.md#L1620)

**Regression risk.** Making every static or no-core caller require a full local distribution can break portable checks. Validating a staged tree cannot certify installer contents.

**Bounded correction and check.** Match the documented promise to the separate gates. If standalone payload verification is intended, delegate only that core-enabled command to the existing exact tree verifier. Preserve configuration, stale manifest and no-core controls. Hold the manifest fixed while changing, adding or removing one file and assert the intended gate outcome.

### VF-0149

**A disappearing WebView2 entry aborts traversal**

**Earlier fix and current state.** Two lifecycle runs observed this exact race and passed on unchanged retry. The earlier ledger explicitly retained the source. The handle-lock fixture covers deletion-time sharing violations, while the failing attribute read is outside that retry. [First failure](../../../plans/evidence/five-search-findings/execution-ledger.md#L52) · [Later failure](../../../plans/completed/windows-build-privacy.md#L66) · [Traversal](../../../../scripts/windows-package-lifecycle-data.ps1#L37)

**Regression risk.** Treating denial or uncertain parent state as a missing child can certify incomplete ownership before backup, deletion or restore.

**Bounded correction and check.** Handle confirmed absence of the exact enumerated descendant with a bounded rescan when parent state changes. Retain reparse, denial and uncertain-parent failure. In disposable Windows storage, remove a file between enumeration and attribute read and verify cleanup, original data and unrelated sentinel. Keep missing-parent and persistent-lock controls.

### VF-0150

**The reader says defaults are active after an appearance save fails**

**Earlier fix and current state.** CAF-R6.2 retained the in-memory preference, propagated write failures and suppressed stale completions. The replacement fixture asserts the Settings warning. The separate reader notice still interprets cached storage status as the effective appearance, and it can stay stale after a later successful write. [Prior plan](../../../plans/completed/chat-audit-minimal-follow-up.md#L107) · [Fixture](../../../../apps/desktop/src/App.test.tsx#L3521) · [Notice](../../../../apps/desktop/src/AppPresentation.tsx#L95)

**Regression risk.** Changing storage or restore admission can undo owner isolation, newer schema protection or recovery notices.

**Bounded correction and check.** Use the same effective live preference and persistence status as the reader. Show defaults only when actually in use and session-only feedback when custom values are active. Fail a custom write, replace the book, assert visual appearance and copy, then allow the same owner's retry and verify it clears without reopening. Keep actual read fallback and stale-owner controls.

### VF-0151

**Forced-colors Contents can obscure keyboard focus**

**Earlier fix and current state.** M004 and R8-04 cover TOC entry. Settings containment and Escape have their own fixes. The browser fixture closes Contents before its forced-colors arm. The current TOC leaves covered reader descendants in sequence and Skip focuses the covered article. [DOM order](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1294) · [Backdrop](../../../../apps/desktop/src/styles/reader-shell-and-settings.css#L405) · [Prior fixture](../../../../apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts#L1606)

**Regression risk.** A nested focus trap, blanket key interception or unmounting the reader can break traversal, restoration and assistive technology. A CSS-only opacity change leaves occlusion by the panel.

**Bounded correction and check.** Dismiss Contents without returning focus to its trigger when focus intentionally enters the covered reader. Coordinate Skip with a focus-safe handoff to the article. Use trusted Tab and Enter under forced colors, assert unobscured focus and no new navigation/save, and preserve explicit Close, TOC target focus, backward traversal and normal contrast.

### VF-0152

**List-item markers lose their own writing direction**

**Earlier fix and current state.** RCF-07 preserves ordinals. VF-0064 preserves direction in an implicit paragraph and VF-0096 preserves inline isolates. The projector's list-item collector knows the context but the item model and render plan drop it. The resulting `li` inherits the list direction. [RCF-07](../../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L179) · [Projection](../../../../packages/epub/src/document/xhtml-projector.ts#L1432) · [Renderer](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L397)

**Regression risk.** Inferring direction from the first child loses an explicit item direction or Auto scope. Extra wrappers or block IDs can affect ordinals, capacity and saved locators.

**Bounded correction and check.** Carry bounded item direction and relevant Auto identity through the existing item model and render plan. Apply the effective direction to the actual `li` and preserve descendant overrides. Compare ordered and unordered mixed-direction lists in Chromium and WebView2, including computed direction, marker placement, hidden and empty items, explicit values, nested Auto and exact same-byte locators.

### VF-0153

**Speed copy refers to an ended section during refill**

**Earlier fix and current state.** VF-0048 handles natural completion, VF-0102 handles late fallback after paused final audio, and VF-0066 protects allocation after a rate change. Nonterminal underrun leaves the former active rate in scheduler state, and the control uses it to describe a nonexistent current section. [Rate authority](../../../architecture/reader-settings-playback-authority-v3.md#L65) · [Scheduler](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1107) · [Control](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L188)

**Regression risk.** Clearing logical rate state can break successor activation or fallback. A paused unfinished unit still owns its rate.

**Bounded correction and check.** Derive visible current-section status and active-rate projection from live unfinished unit ownership while retaining private fallback state. Exhaust 1×, select 0.75× during refill, hold readiness and verify the first actual successor activates once. Cover paused unfinished audio, preparation failure, natural completion and explicit next Play.

### VF-0154

**App exit can leave a startup eligible to spawn**

**Earlier fix and current state.** LCF-04 retained checked termination and explicitly left app exit best effort. VF-0093 retires a matching interactive Cancel. Exit calls the reusable force-stop path, which can finish with an empty child slot during package verification and leave both owned and unowned startup admission open. Host incidence and orphaning remain unestablished. [Exit policy](../../../plans/completed/lifecycle-correctness-follow-up.md#L176) · [Exit callback](../../../../apps/desktop/src-tauri/src/main.rs#L58) · [Force stop](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L2105)

**Regression risk.** Closing ordinary force-stop admission would break optional removal, handoff and legitimate next Play. Waiting on verification during exit can hang the process. A terminal latch alone does not prove active-child termination.

**Bounded correction and check.** Set an exit-only terminal latch under the lock that serializes spawn/publication, checking it before preparation and again before spawn. Preserve checked active containment. Hold pre-spawn verification through exit, release it and assert zero new child or publication. Cover publish-first termination, termination failure retaining ownership, repeated exit and ordinary Cancel/Stop/Remove allowing legitimate reuse.

### VF-0155

**The inventory labels a lock-only crate required on Windows**

**Earlier fix and current state.** The Model Rollout review correctly classified Chrono outside the Windows normal/build graph for RustSec. Inventory acceptance checked counts, uniqueness and selected versions. Its generator still calls every Cargo metadata package required, and the Chrono row contradicts the policy. [Earlier graph review](../../../plans/evidence/codex-model-rollout/ci-audit-review.md#L49) · [Inventory generator](../../../../scripts/release_inventory.py#L471) · [Tracked row](../../../../services/tts/release/component-inventory-v1.json#L1415)

**Regression risk.** Dropping lock-only rows can erase licensing/provenance and confuse whole-lock auditing. Comparing by name/version alone can merge different sources. Dependency-graph membership cannot establish binary contents.

**Bounded correction and check.** Classify from the locked target, release features and normal/build graph used by the audit. Preserve full identities, lock digests and license evidence, with explicit lock-only labels. Test direct/transitive runtime and build edges, dev-only and foreign edges, Chrono versus a reachable ZIP crate, counts and failure when graph evidence is unavailable.

### VF-0156

**A late audio receipt moves the paused viewport**

**Earlier fix and current state.** DCR-06 deliberately credits the first positive paused receipt. VF-0017/RAC-07 restore follow on intentional Resume, and VF-0028 handles geometry. The late receipt can create a fresh follow-eligible segment after measured paused inspection, scrolling or navigating before Resume. [Receipt fixture](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L1033) · [Follow owner](../../../../apps/desktop/src/reader/segment-highlight-controller.ts#L330) · [Pause policy](../../../architecture/synchronization-authority-v1.md#L45)

**Regression risk.** Dropping receipts loses heard progress. A global suppression flag or React-effect-only phase check can affect valid next segments or stale sessions.

**Bounded correction and check.** Gate the reader's motion with the matching run's current Pause and inspection state while still applying the audible highlight and checkpoint. Combine Start, held receipt, Pause, measured move and late receipt. Assert no motion and one follow on deliberate Resume. Keep duplicate and stale receipts, next running start, completion while paused and Stop.

### VF-0157

**Finishing Auto direction can remove the focused article**

**Earlier fix and current state.** M004 covers Skip and stable progressive append. VF-0075 verifies bounded Auto preparation and retirement but omits focus during the transition. The temporary unkeyed article is replaced when the ready fragment places its article after the status slot. Host focus landing and PageDown remain unmeasured. [M004](../../../plans/completed/M004-reflowable-visual-reader-and-position-restoration.md#L882) · [Auto fixture](../../../../apps/desktop/src/reader/SemanticDocument.test.tsx#L71) · [Render transition](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L763)

**Regression risk.** Unconditional focus transfer can steal focus that moved elsewhere. Changing only the ready node's key does not preserve its identity. Removing status or Skip regresses accessibility.

**Bounded correction and check.** Keep one stable article identity and the progress status sibling throughout preparation and ready states. Use a held Auto scan and trusted Tab/Enter onto Skip, verify the same DOM node and PageDown movement, then cover no Skip, user focus moved elsewhere, superseded chapter and normal ready behavior.

### VF-0158

**A spaced binary Unicode minus permits partial Celsius expansion**

**Earlier fix and current state.** BNC-04 and DCR-09 guarded right continuation, ASCII and en dash ranges, decimal endpoints and allowed unary signs. U+2212 is accepted as an endpoint sign but omitted as a binary separator between two Celsius forms. The spaced case still partially expands. [Celsius decisions](../../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md#L50) · [Range guard](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L705)

**Regression risk.** Treating every minus as a separator can hide legitimate negative temperatures or confuse a bare preceding number with a Celsius operand.

**Bounded correction and check.** Recognize binary U+2212 only between complete eligible Celsius operands in bounded same-language prose. Test public ES/EN spaced and compact forms, standalone negative, existing signed/decimal and shared-unit ranges, code and language boundaries, and exact source and locator mapping.

### VF-0159

**Chatterbox cancel-during-load smoke phase evidence**

**Earlier fix and current state.** RN B-01 implemented cancellation and restart. Its smoke proof uses a status observation and bounded cleanup. The v7 child constructs its loading frame before blocking on model loading, then publishes it after the call returns. The smoke runner may label that delayed frame as the phase interrupted by Cancel. [Completed plan](../../../plans/completed/reader-narration-bugfixes.md#L200) · [Worker publication](../../../../services/tts/src/voxleaf_tts/service.py#L184) · [Smoke sampling](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L74)

**Regression risk.** Tightening a polling delay can miss brief phases or credit a retired instance. Changing worker publication would affect a frozen release and its lifecycle contract.

**Bounded correction and check.** Require evidence that the same instance and phase remain active at cancellation before crediting phase coverage. For stronger evidence, correlate native dispatch and completion by request and describe the result as a command in flight. Reserve physical engine-phase claims for a barrier or versioned adapter instrumentation. Check held Load and Warm, completion before Cancel, stale instance, failure, cleanup, and next Play.

### VF-0160

**Unsampled phases counted as zero network connections**

**Earlier fix and current state.** DCR-11 addressed effective firewall admission, and DCR-22 addressed ordered shutdown and final process counts. The handoff CLI initializes network counters to zero and accepts a result with no phase samples. An existing success fixture omits every sampling phase. The native producer normally emits phases, so this establishes an acceptance gap. [Handoff CLI](../../../../services/tts/benchmarks/service_handoff_cli.py#L435) · [Existing fixture](../../../../services/tts/tests/test_service_handoff_cli.py#L459)

**Regression risk.** A stricter gate can reject incomplete but otherwise successful smoke runs. Sampling at discrete boundaries cannot establish continuous network inactivity.

**Bounded correction and check.** Require successful samples at explicitly defined existing phase boundaries for the owned process tree before publishing observed zero counts. Preserve firewall and shutdown checks. Check observed zero and nonzero counts, missing and duplicate phases, an absent process tree, and sampler failure.

### VF-0161

**Valid mixed-case XHTML direction keywords rejected**

**Earlier fix and current state.** VF-0064 fixed inherited direction and VF-0075 corrected nested explicit Auto scopes after values enter the projector. The projector still rejects valid mixed-case enumerated keywords and rereads raw values for Auto scopes and inline isolation. [Projector admission](../../../../packages/epub/src/document/xhtml-projector.ts#L379) · [Auto scopes](../../../../packages/epub/src/document/xhtml-projector.ts#L859) · [HTML keyword rules](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#keywords-and-enumerated-attributes)

**Regression risk.** Changing admission alone can accept content while dropping direction isolation or allocating incorrect Auto scopes.

**Bounded correction and check.** Decode ASCII case-insensitive keywords once in the projector and use canonical values for every consumer. Preserve missing versus explicit direction and rejection of malformed values. Open paired synthetic EPUBs with lowercase and mixed-case keywords and compare isolation, nested scopes, text, and locators. Check omitted and invalid values and same-byte reopening.

### VF-0162

**Equivalent OPF modification vocabulary rejected**

**Earlier fix and current state.** M003 shipped expanded XML QName handling and required EPUB 3 metadata validation. OPF vocabulary declarations expand strings inside attribute values. The package parser ignores the package vocabulary declarations and captures the timestamp only for the literal `dcterms:modified` spelling. [M003 completion](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L686) · [Package parsing](../../../../packages/epub/src/package/package-document.ts#L775) · [EPUB property expansion](https://www.w3.org/TR/epub-rs-33/#sec-property-processing)

**Regression risk.** Comparing local names or ignoring explicit bindings can accept unrelated metadata. Broadening layout vocabulary handling in one parser can change rootfile choice or fixed-layout rejection.

**Bounded correction and check.** Use a bounded package-local resolver for the exact modification property IRI, honoring explicit mappings before reserved ones and performing no fetches. Retain singleton, refinement, UTC, and EPUB 2 behavior. Check literal and alias equivalence, duplicates, wrong and unbound vocabularies, and malformed timestamps. If layout expansion enters scope later, align preselection with full parsing and retain malformed-first and fallback controls.

### VF-0163

**Initial flush saves an oversized chapter that never displayed**

**Earlier fix and current state.** M004 gated stored-position restoration on settlement, but the same implementation armed a default flush for book-start. The current App narrows that to missing storage. B04 and RIA-01 prevent failed navigation and late materialization from generating a new save. An oversized first chapter still shows fallback after the initial flush is armed, so replacement or close can save a never-displayed position and evict another entry. [VF-0044](../registry.md#vf-0044) · [M004](../../../plans/completed/M004-reflowable-visual-reader-and-position-restoration.md#L982) · [App admission](../../../../apps/desktop/src/App.tsx#L492) · [Lifecycle flush](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L351)

**Regression risk.** Dropping default flushes entirely would lose progress for a normal first opening with no movement. A late callback could arm a checkpoint for the wrong publication or overwrite a newer position.

**Bounded correction and check.** Arm the initial flush once after the mounted reader confirms the readable default for that exact open. Keep the fallback locator usable for recovery and give accepted manual or heard saves precedence. Check oversized open, pagehide or replacement, same-byte reopen, a full store with no eviction, Next to readable content, and a normal first opening that saves on close.

### VF-0164

**Paragraph Play appears available while a jump is pending**

**Earlier fix and current state.** M009-001 routed paragraph Play through placement admission. CFR-02 and CFR-03 covered rejected and recovered placement through toolbar Play. The coordinator still refuses unsafe starts as intended. A mounted paragraph button exposes Start and silently ignores the rejection when a deep TOC jump remains pending. [M009-001](../../../plans/completed/M009-001-reader-experience-stabilization.md#L420) · [Paragraph action](../../../../apps/desktop/src/reader/ParagraphLeaf.tsx#L119) · [Click handler](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L977) · [Placement guard](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1096)

**Regression risk.** Removing the guard or queuing the click could start narration at a stale paragraph. Hiding the control or using native disabled without checking focus can disrupt keyboard use.

**Bounded correction and check.** Project the existing placement admission into the leaf controller as a separate actionability state. Preserve the authoritative guard and chosen paragraph identity. Verify pointer and keyboard behavior in a mounted deep jump with an earlier paragraph visible, then settle and confirm the same paragraph can start. Include unavailable placement, supersession, and Stop.

### VF-0165

**Stable playback can count audio from earlier runs**

**Earlier fix and current state.** The original smoke threshold used a counter that reset on each Play. F10 correctly made the product counter cumulative across a recovery episode in `4942ac7`, leaving the smoke threshold unchanged. VF-0123 later paired refill observations by playback identity. The stable branch still accepts aggregate audio across runs. The July M010 results predate the metric change. [F10](../../../plans/completed/validated-chat-findings-corrections.md#L95) · [M010 evidence](../../../plans/completed/M010-hardware-profiles-fallback-and-operational-resilience.md#L1470) · [Stability poll](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1042) · [Rendered-audio accumulation](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2358) · [November 17 correction](../../../plans/completed/november-17-findings-corrections.md#L155)

**Regression risk.** Resetting the product metric breaks legitimate episode totals. A late baseline can discard real audio, while a missing or replaced identity can mix runs.

**Bounded correction and check.** In the harness, capture the playback index and rendered counter together at a defined baseline and require a fresh rendered minute from that identity for stable credit and reporting. Keep same-run depletion and terminal completion distinct. Check prior aggregate above threshold, a fresh minute, depletion between polls, short completion, and lost or replaced identity.

### VF-0166

**Unknown local v8 removal support allows Remove to stop Piper**

**Earlier fix and current state.** VF-0114 and the R05 review prevented removal when a local v8 snapshot had already supplied `removalSupported: false`. The first refresh can fail, or a failed Select can supersede an older refresh before any native capability is accepted. The synthetic Failed snapshot then has unknown support. The renderer can stop Piper before native refuses removal. This ordering was already possible in the commit that added the known-false guard. [VF-0114](../registry.md#vf-0114) · [Synthetic failure handling](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L417) · [Settings removal](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L127)

**Regression risk.** Requiring a literal true on existing responses would hide ordinary v7 removal because its wire snapshot omits the field. Moving native removal before containment risks active-runtime deletion.

**Bounded correction and check.** Normalize accepted native snapshots to known support on the client, preserving the ordinary omitted-field convention, known false, and unknown synthetic state. Require affirmative support in the UI, action and direct client before admission or Stop. Check failed first observation, late false after failed Select with Piper playing, known false after failure, and the ordinary v7 Stop → Remove → refresh and retry sequence.

## Closeout

All 35 reported case IDs received a dedicated investigation. This pass assigns
no new IDs and records no new runtime reproductions or implementation
acceptance. The registry retains earlier dispositions and links to these
assessments. HEAD and the empty index were unchanged. Writes were limited to
the findings documentation.
