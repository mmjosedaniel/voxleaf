# Reconciliation of the five static logic passes

## Scope and snapshot

On 2026-11-13, one independent subagent investigated each of the 20 distinct
findings from the five passes, VF-0034 through VF-0053. VF-0036 includes both
the saved-position and TOC consequences of the same projection change. The
review compared the inspected source, earlier ExecPlans, and the cases their
tests and review records actually covered. The imported VF-0001 through
VF-0033 were consulted for lineage. The import is partial and the review covers
repository evidence available for these triggers. See the [audit index](README.md),
[registry](../registry.md) and [historical import](../history-import.md).

The inspected branch was `main` at `5fdb2dc835e99e43034e8b40c99817f45236358f` with
an empty index. Incoming changes were limited to the findings registry SHA-256
`9FE9D8295E7BC40CFD4442B6D7A4C23E790F62A74A33D1BF4B1A8297E032551C`,
audit index SHA-256
`AF63300E7EF2BCACB77D0FDE9DC83A8551F26EB56FC8923040C2D57FD573E29F`
and the five untracked reports. Their SHA-256 values in pass order were
`9AC1E667B59BEB5A3F68264583683595A1AAF47625DA0457D72BE00CE16CC277`,
`511ACD8C8C15136E68F6C0D9493318A738F249EB20F2C31E6918A4F0CF75AAB6`,
`95FA4C4A0D794EE7388B28E7DD4FEE8B979FED2A04F880CC471E458543F9B522`,
`E1E583E7A6F812F57EC949F524CD13E9DF383D6FACA5B24FFE6A5E8D6A5C3052` and
`7F4E48F2D872929BC550C3D09D85604436570FEE0B28021B1482D5B0A513C35F`.
No tests, builds or runtime reproductions were performed. All proposed checks
below remain pending.

## Coverage

| Responsibility | Inspected sequence | Remaining evidence |
| --- | --- | --- |
| Reader authority | Scrollbar recovery, failed follow and terminal completion, restore read failure, and synchronous audible callbacks during Pause | Input provenance on native scrollbars, visibility before intentional navigation, and mounted callback order |
| EPUB projection and navigation | Empty inert anchor and its generated locators, fragment uniqueness, and EPUB 3 and NCX labels through BookV1 | Cross-version saved positions and actual opening of both navigation formats |
| Narration preparation and playback | Quoted ordinal, thin-space time, list traversal, silent packing, automatic refill, pending speed and skipped Piper scene markers | End-to-end prepared ranges, engine dispatch and playback timing |
| Optional runtime and settings | Retained cleanup after integrity failure, explicit installed-state refresh and same-profile selection | Native and mounted state transitions after transient failures |
| Maintainer tooling and diagnostics | Ordinary installer and uninstaller ownership, quality finalization retry and slow-playback receipts | Disposable Windows process containment, filesystem fault injection and the required accuracy of Stop diagnostics |

## Findings and reconciliation

Earlier work addressed the same responsibilities in most cases. The review
found no earlier correction that covers any of the 20 observed sequences
through the current entry point. The #314 integration introduced the paragraph
split in VF-0036. It also created the clear-then-resurface sequence in VF-0038
while addressing an existing broad storage reporting problem. VF-0038 and
VF-0043 share a native receipt and produce different observable failures.
VF-0050 requires a decision about metrics accuracy before a playback lifecycle
change.

### VF-0034 — Scrollbar drag after unavailable placement

- **Earlier work.** CFR-03 in #314 recovered Play after measured manual movement, including same-locator recovery. Its browser case used wheel and focused PageDown. The product's manual movement policy includes the scrollbar. Current admission requires an earlier wheel, touch or key event. [CFR-03](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L403), [browser control](../../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts#L5032), [policy](../../../architecture/synchronization-authority-v1.md#L116), [reader handlers](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1268).
- **Regression risk.** Classifying ordinary scroll events by `isTrusted` or pointer proximity can admit a programmatic scroll or reflow as user recovery, interfere with pending follow, and change the next Play target.
- **Proposed correction and check.** First establish whether real scrollbar dragging exposes reliable intent in Chromium and packaged WebView2. Feed demonstrated intent through the existing measured-displacement and readable-locator admission. If the host lacks reliable provenance, address the input boundary with an explicitly controlled or accessible equivalent. Verify the first prepared locator after a real drag, same-locator recovery, wheel and PageDown. Confirm passive movement and no-displacement actions leave Play gated and recovery never starts playback by itself. [Measured movement](../../../../apps/desktop/src/reader/active-visual-locator.ts#L414).

### VF-0035 — Completion after unmeasured visual follow

- **Earlier work.** RCF-16 addressed terminal locator ownership when the user remained at a manually chosen passage. PN-04 covered missing geometry after follow was armed, then stopped before the affected segment finished. The completion branch still uses the follow flag which may have been rearmed despite missing geometry. [RCF-16](../../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L270), [PN-04 review](../../../plans/evidence/passage-navigation/review-r3.md#L25), [terminal handler](../../../../apps/desktop/src/reader/segment-highlight-controller.ts#L543).
- **Regression risk.** Suppressing all terminal updates would lose normal final placement. Blocking the independently tracked audible completion would lose the canonical checkpoint. A stale queued callback could restore either error after the guard fires.
- **Proposed correction and check.** Track successful measured placement separately for the segment and playback generation, clear that evidence when a new follow attempt or manual movement invalidates it, and release queued geometry work on completion. Exercise missing geometry through the segment end, assert the next ordinary Play uses the retained visible locator, and separately verify the saved heard end. Retain normal completion, recovered geometry, reflow and late-frame coverage. [Audible settlement](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1311).

### VF-0036 — Empty inert anchor shifts positions and redirects a TOC link

- **Earlier work.** CFR-04 in #314 restored real block children of inert anchors. Its fixture lacked an ID on the wrapping anchor. The new boundary flush for an ID-bearing inert anchor also splits an implicit paragraph when the anchor projects nothing. Both runs can claim the enclosing ID, causing an otherwise exact TOC target to fall back. [CFR-04](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L334), [existing fixture](../../../../packages/epub/src/document/xhtml-projector.test.ts#L547), [inert anchor](../../../../packages/epub/src/document/xhtml-projector.ts#L1203), [fragment fallback](../../../../packages/epub/src/locator/target-resolver.ts#L280).
- **Regression risk.** A broad revert would lose real block descendants. Even a targeted return to the original paragraph layout may shift positions already saved by the split version. The same EPUB identity and persisted locator tuple can have a different interpretation across those projections.
- **Proposed correction and check.** Defer the boundary until the anchor produces admitted flow content. Compare the same EPUB bytes before #314, on the split version, and with the correction. Include exact TOC resolution, nonzero saved offsets around the split, fresh save/reopen, and real nested blocks with wrapper and child IDs. Preserve inline whitespace, language and inert-link behavior. Resolve ambiguous existing checkpoints with an explicit compatibility decision before promising migration. [Locator resolution](../../../../packages/epub/src/locator/locator-resolver.ts#L233), [stored contract](../../../../packages/shared/src/contracts/persisted-reading-state.ts#L43).

### VF-0037 — Spanish terminal ordinal before a closing quote

- **Earlier work.** CFR-18 fixed true leaf end and terminal punctuation following the ordinal, alongside the before-noun control. Quotation pairing already existed, while the terminal ordinal check still stops at a paired closer. [CFR-18](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L359), [terminal check](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1345), [quotation handling](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1651).
- **Regression risk.** Skipping arbitrary quotes would change before-noun forms and malformed punctuation. An unbounded look-ahead or prefix replay would defeat long-window budgets.
- **Proposed correction and check.** Reuse the evidence of a paired closing quote in the same Spanish prose stream and the existing 128-position look-ahead. Require a terminal mark or a true leaf end. Assert `Dijo «Llegó primero».` in prepared text for both active profiles and retain original source spans. Cover straight and curved quotes, a following noun, malformed pairs, foreign or protected content, and actual or artificial window ends. [Existing ordinal controls](../../../../packages/epub/src/narration/narration-normalizer.test.ts#L149).

### VF-0038 — Stale installed size after a failed Chatterbox check

- **Earlier work.** Failed native snapshots could already report the manifest size before #314. CFR-22 added size suppression on client errors and proof requirements for native snapshots. Its regression exercised the precommit path without a receipt. The new receipt exception lets the size reappear on the next refresh after re-verification fails. RCF-13 used a valid installation with cleanup blocked. [CFR-22](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L465), [native controls](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L20), [projection and check](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1909).
- **Regression risk.** Erasing the receipt to hide the amount would lose cleanup authority. Hiding the size on every cleanup error would misstate a still-verified installation. Polling should not need to repeat full verification.
- **Proposed correction and check.** Maintain installed verification and cleanup authority separately at the native owner. In a disposable committed installation with cleanup pending, fail an active-file check and poll or reopen Settings. The size must stay absent until successful verification. With active bytes still valid and only cleanup blocked, keep the known size, authorized retry and unrelated data. Exercise the next action in VF-0043 using the same setup. [Cleanup retry](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1970), [client projection](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L359).

### VF-0039 — Thin space duplicates a Spanish time article

- **Earlier work.** SAF-12 addressed capitalization and CFR-09 added U+00A0 and U+202F to the preceding article gap. U+2009 is ordinary supported prose whitespace but is missing from that recognizer. The standalone time still emits the article. [SAF-12](../../../plans/completed/static-audit-follow-up.md#L78), [CFR-09](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L70), [matcher](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L987).
- **Regression risk.** Accepting all whitespace in the lexical pattern can move recognition across markup breaks and change compounds, language boundaries or ordinary bare times.
- **Proposed correction and check.** Admit U+2009 in the existing article gap. Check `Las\u200914:30.` expands with a single article, including capitalization, source ranges and cold and resumed preparation. Keep bare time, prior spaces, numerical boundaries, protected text and a real break as controls. [Time expansion](../../../../packages/epub/src/narration/bilingual-spanish-normalization.ts#L138).

### VF-0040 — Ordinary Windows lifecycle waits indefinitely after backing up app data

- **Earlier work.** FPA-5.3 implemented timeouts and owned process-tree cleanup in the separate lifecycle installer harness. CCF-C04 covered a failed launch and RAC-03 covered an already-failed cleanup. The ordinary release evidence script still has an unbounded exit wait after the backup move. [Package evidence](../../../plans/evidence/five-pass-audit/package-gates.md#L87), [bounded harness](../../../../scripts/windows-package-lifecycle-installer.ps1#L197), [ordinary runner](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L865).
- **Regression risk.** Rejecting a promise or cancelling only the parent allows a descendant to mutate restored profile data. Restoring over partial work or reporting successful evidence after an uncertain exit can hide data loss.
- **Proposed correction and check.** Bound both waits with Windows process-tree ownership established before execution. Distinguish failed launch, verified clean exit, and partial or uncertain cleanup. Restore automatically only after all owned descendants have stopped and the destination is safe. Otherwise preserve and report the backup. Exercise both branches with controlled descendants and an unrelated sentinel, then check the exact installer and uninstaller on a disposable host. [Lifecycle cleanup](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1338).

### VF-0041 — Prepared playback displays the wrong refill target

- **Earlier work.** B01 retained the production target and a shorter ordinary underrun recovery threshold. DCR-24 covered duration calculations and later wording corrections touched the same presenter. The combined Prepared depletion and expanded details state was outside those controls. [B01](../../../architecture/decisions/ADR-0057-reader-acquisition-correctness.md#L13), [DCR-24](../../../plans/completed/deep-chat-audit-minimal-corrections.md#L106), [current label](../../../../apps/desktop/src/tts/adaptive-preparation-presentation.ts#L38).
- **Regression risk.** Changing the scheduler's target to correct the label would alter how much audio it queues and what Prepared startup or voluntary Pause means.
- **Proposed correction and check.** Present the shared one-minute resumption threshold as such during automatic refill while preserving the selected preparation goal. Check compact and expanded status under actual depletion at a five-minute setting, below and at the one-minute boundary. Keep shorter completed tails, capacity escape, voluntary Pause, startup and different playback rates. [Scheduler](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1067), [estimated wait](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2603).

### VF-0042 — Failure creating the second quality directory blocks retry

- **Earlier work.** M006 introduced this retained finalizer and generation cleanup. RAC-02 and CFR-06 protected rejected generation, and CFR-21 fixed retry in the separate v12 publication layout. Ordinary finalization creates both directories before its guarded mutation region. [RAC-02](../../../plans/completed/revalidated-audit-corrections.md#L179), [CFR-21](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L273), [finalizer](../../../../services/tts/benchmarks/quality.py#L376).
- **Regression risk.** Broad cleanup or `exist_ok` would allow an old or competing output to be deleted or mistaken for this session. Rolling back through the existing later-stage path can delete material before that path has any authority over it.
- **Proposed correction and check.** Before moving samples, narrowly roll back only the empty directory created by this attempt with `rmdir`. Map the failure to the content-safe quality CLI error, retaining the primary cause if rollback also fails. Inject only the second mkdir failure, then retry the same ID and confirm unchanged staged bytes, successful blinded output and preserved pre-existing conflicts. [CLI error boundary](../../../../services/tts/benchmarks/quality_cli.py#L247).

### VF-0043 — A Chatterbox integrity failure sends the next Check into acquisition

- **Earlier work.** RCF-13 preserved retries when the active package remained valid and cleanup alone failed. CCF-C14 guarded missing or mismatched receipts, and NCC-03 remapped genuine acquisition failures to confirmation. After a failed integrity check of an installed package with a retained receipt, the same generic error wrongly selects acquisition. [RCF-13](../../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L233), [CCF-C14](../../../plans/completed/confirmed-chat-findings-minimal-corrections.md#L338), [NCC-03](../../../plans/completed/narration-chatterbox-correctness.md#L120), [Settings action](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L505).
- **Regression risk.** Treating every invalid package as eligible for cleanup would weaken root ownership and bypass the proper path for a fresh acquisition. Download must continue to require explicit consent.
- **Proposed correction and check.** Preserve the native origin of an installed-package check failure in the direct result and cached snapshot. Use it to route the explicit action back to the local check for the same owned receipt. Temporarily block and restore access, reopen Settings and verify a second `retryCleanup` check, owned cleanup and Installed. Verify persistent invalidity, unrelated roots and genuine acquisition failure independently. Keep the storage proof assertion in VF-0038. [Native retry](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1970), [selection](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2139).

### VF-0044 — A read failure can save the book's beginning

- **Earlier work.** M004 introduced initial-save eligibility. RPI-01 in #311 protected a successfully loaded checkpoint when later visual placement and reflow fell back. The malformed-restore controls did not mount App's save owner. App still admits a book-start result from a failed read, which can replace a valid checkpoint when access returns. [RPI-01](../../../plans/evidence/reader-position-and-image-lifecycle/review-report-01.md#L23), [storage policy](../../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md#L114), [App admission](../../../../apps/desktop/src/App.tsx#L487).
- **Regression risk.** Blocking the first actual user save would prevent recovery from malformed storage. A passive initial visible-locator change on a mounted reader could still enqueue book start after an initial-flush-only change. Its natural geometry and timing remain unverified.
- **Proposed correction and check.** Admit an automatic book-start save only on a proven missing record. Inspect and guard any passive pre-intent save after a failed read while retaining validated navigation, heard checkpoints and save retries. Fail one read of a valid mid-book record and verify hide, close or reselect leaves it intact, then reopen the same EPUB at the original offset. Cover malformed storage before and after intentional navigation, successful recovery and original write guards. [Passive callback](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L509), [repository write](../../../../apps/desktop/src/persistence/reader-position-repository.ts#L388).

### VF-0045 — Pause can incorrectly enter playback failure recovery

- **Earlier work.** B04 covered an unavailable chapter with an injected audible event and separately verified explicit unavailable placement. RIA-03 and DCR-06 addressed different rendering receipts. The remaining order is a direct PCM observation first emitted inside Pause, followed by synchronous unavailable settlement and Stop before Pause returns. [B04](../../../architecture/decisions/ADR-0057-reader-acquisition-correctness.md#L82), [reader control](../../../../apps/desktop/src/reader/ReaderPublication.test.tsx#L2672), [Pause implementation](../../../../apps/desktop/src/tts/pcm-playback.ts#L237).
- **Regression risk.** Ignoring every Pause error hides a genuine current-player failure. Allowing stale Pause to apply after Stop can also start a tick or change the replacement owner's phase.
- **Proposed correction and check.** Capture the original player and run generation and recheck ownership after synchronous notifications in the player and coordinator. Exercise real Pause with a first positive direct-audio observation before the periodic tick. Require one containment, no stale error or auto-restart, and a usable ordinary Play from the next readable locator. Keep current-run errors, tick-first order and slow-worklet Pause controls. [Unavailable settlement](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L995), [Pause error handler](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1345).

### VF-0046 — A successful local Chatterbox check leaves the current narrator unavailable

- **Earlier work.** CAF-R3.1 refreshed the same book after reinstall transitioned through Verifying. NCC-02 settled the selected profile after a visibility check. Native verification can publish Failed to Installed directly, bypassing App's remembered acquisition states. [CAF-R3.1](../../../plans/completed/chat-audit-minimal-follow-up.md#L94), [NCC-02](../../../plans/completed/narration-chatterbox-correctness.md#L114), [App filter](../../../../apps/desktop/src/App.tsx#L446), [native installed observation](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2111).
- **Regression risk.** Refreshing on every Installed snapshot can probe repeatedly or affect an admitted running narrator. An old result can affect a new book or profile if ownership is implicit.
- **Proposed correction and check.** Consume the successful explicit local check once for the initiating, still-current unavailable narrator with the same Chatterbox profile and language. Reuse the existing profile refresh without resetting recovery or starting playback. Verify Installed and usable Play after a direct retry on the same mounted book, then cover ordinary reinstall, a stale result after replacement, an already healthy owner, and a still-unavailable package. [Play availability](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L229).

### VF-0047 — A no-break space at a TOC label edge prevents opening

- **Earlier work.** M003 established coarse BookV1 navigation and ASCII whitespace collapsing. CFR-13 added visible break handling. RCF-15 and CAF-R3.4 addressed hidden or alternate text. These controls did not cover edge U+00A0 inside a substantive label that reaches the strict BookV1 schema. XHTML navigation and NCX can both retain it. [M003](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L732), [XHTML label](../../../../packages/epub/src/navigation/navigation-document.ts#L516), [NCX label](../../../../packages/epub/src/navigation/ncx-navigation-parser.ts#L649), [BookV1 schema](../../../../packages/shared/schemas/book/v1.schema.json#L58).
- **Regression risk.** Trimming internal spacing or changing the schema broadly would alter label text and other callers. Normalizing after fallback or outside the established length and byte accounting can retain empty labels or change rejection boundaries.
- **Proposed correction and check.** Normalize label edges in both collectors before detailed and coarse projection and choose title fallback after testing the normalized visible label. Preserve interior U+00A0, retained metadata accounting and existing source caps. Verify both file formats open and resolve the destination, with blank labels, hidden and alternate text, visible breaks and size-limit controls. [BookV1 projection](../../../../packages/epub/src/book/book-v1-projection.ts#L84), [counting policy](../../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L225).

### VF-0048 — Completed narration promises a speed change with no successor

- **Earlier work.** LCF-01 addressed restart with completed owners, RCF-19 exercised a real speed-change successor, and MAF-11 reconciled changed preparation settings after completion. Final drain retains rate fields, and a later selection can update that completed scheduler. [LCF-01](../../../plans/completed/lifecycle-correctness-follow-up.md#L84), [RCF-19](../../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L301), [MAF-11](../../../plans/completed/minimal-audit-findings-corrections.md#L88), [scheduler drain](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1030).
- **Regression risk.** Clearing speed state on every boundary can break a legitimate deferred change or fallback. Simply hiding the completed badge leaves old rate work active against a finished owner.
- **Proposed correction and check.** Retire active and pending rate state and any obsolete rate work at natural drain. While complete, save the preference without queuing work on the finished player. Exercise selection just before the last unit ends and after it ends, then verify the next explicit Play uses 75%. Preserve the last highlight and heard checkpoint, a buffered successor, Pause and genuine fallback or save errors. [Selection](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L757), [completed ticker](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2267).

### VF-0049 — Reselecting healthy Chatterbox resets narration metrics

- **Earlier work.** MAF-10 made radio reselection reuse an admitted healthy Chatterbox engine and its mounted test checks the owner and mutation counts. CFR-08's checked-radio guard covers Piper. Successful no-op Chatterbox selection still triggers the recovery reset callback and clears the metrics. [MAF-10](../../../plans/completed/minimal-audit-findings-corrections.md#L87), [mounted control](../../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts#L1244), [CFR-08](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L423), [radio callback](../../../../apps/desktop/src/tts/HardwareCompatibilityControls.tsx#L134).
- **Regression risk.** A guard based only on the checked profile ID would suppress real actions for an unavailable or unhealthy engine. Removing the reset generally would change explicit compatibility checks and actual profile changes.
- **Proposed correction and check.** Reuse the existing healthy-loaded predicate at the checked-radio action boundary, including current profile and language. Assert nonzero episode playback time immediately before and after a redundant click and continued accumulation under the same owner. Keep actual profile changes, unhealthy owner status and explicit rechecks as controls. [Selection guard](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L77), [episode reset](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1215).

### VF-0050 — Slow playback can undercount rendered frames at Stop

- **Earlier work.** CCF-C20 accumulated confirmed frames on completion and DCR-06 handled a positive Pause receipt. Stop detaches the current listener before final render accounting, so pending output is missing from the frozen diagnostic. A periodic 6,000-frame report cadence does not bound main-thread delivery lag. The reviewed contract provides no exact count requirement for an interrupted unit. [CCF-C20](../../../plans/completed/confirmed-chat-findings-minimal-corrections.md#L296), [episode policy](../../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md#L60), [worklet reports](../../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts#L321), [backend shutdown](../../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L420).
- **Regression risk.** Waiting for an unbounded final report would delay Stop. Allowing late normal callbacks to complete the count can also amend a retired checkpoint or attribute frames to the next run.
- **Proposed correction and check.** If confirmed receipts meet diagnostic needs, document the interrupted count as a lower bound. If fuller accounting is required, accept one bounded, metrics-only receipt for the stopping unit and episode while cutting audio and invalidating normal callbacks immediately. Define the measurement through worklet Stop processing. Check Stop before the first report, queued and duplicate reports, a suspended backend, a new run and unchanged position settlement. [Final metrics capture](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1545).

### VF-0051 — Short list items exhaust source-window events before narration

- **Earlier work.** M005 established the 4,096-event cap and synthetically tested empty-list pressure. B02 handled deep starts and long source windows. The supported 1,365 short-item case uses only 1,365 tokens but tries to retain its 4,097th event. Public batching discards the structural entries after collecting them. [M005](../../../plans/completed/M005-narration-text-preparation.md), [B02](../../../architecture/decisions/ADR-0057-reader-acquisition-correctness.md#L20), [prior limit test](../../../../packages/epub/src/narration/narration-source-window.test.ts#L329), [batch consumer](../../../../packages/epub/src/narration/narration-preparation.ts#L721).
- **Regression risk.** Raising the event cap weakens retention bounds. Cutting the walk at the last possible event can return without a next cursor or replay a partial structural tail. Discarding all structure unconditionally would break consumers expecting the full event contract.
- **Proposed correction and check.** Give public batching a private mode that retains leaves and cursor context while still charging and limiting structural visits. Keep the full-event behavior for its existing callers. Verify 1,364 and 1,365 items at the list anchor, quote nesting at the boundary and entry from the first leaf. Drain both one- and eight-segment batches through the next spine, exercise cancellation and check actual initial synthesis dispatch. [Event accounting](../../../../packages/epub/src/narration/narration-source-window.ts#L426).

### VF-0052 — A silent formatting prefix can block Piper preparation

- **Earlier work.** CFR-20 specifically allowed collapsed whitespace to drain when no legal Piper segment fit. SAC-08 addressed the silent suffix. The existing normalizer maps U+200B and U+2060 to formatting omissions in permitted prose, but the packing fallback only accepts collapsed whitespace. [CFR-20](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L367), [SAC-08 policy](../../../architecture/decisions/ADR-0066-bounded-orientation-and-silent-tail-corrections.md#L24), [normalizer classification](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1964), [packer fallback](../../../../packages/epub/src/narration/narration-segment-packer.ts#L973).
- **Regression risk.** Treating all omissions as interchangeable could consume meaningful or protected source positions. Stripping the marks before locator mapping would change saved and highlighted ranges.
- **Proposed correction and check.** If no legal candidate fits, advance only through already-classified, unprotected formatting omissions approved for this Piper fallback. Keep source positions and work bounds. Verify 319 marks then `A` yields the existing range `[0,320)` and 320 marks then `A` reaches `[320,321)`. Cover long or mixed windows and keep code, protected runs, combining characters, all-silent spans and cancellation as controls.

### VF-0053 — Piper loses a scene pause when a punctuation unit is skipped

- **Earlier work.** SFA-01 fixed the direct spoken paragraph, scene marker and spoken successor. The separate Piper omission fixture only covers leading punctuation. In the remaining sequence the em dash receives the scene marker and is skipped before transition selection. [SFA-01](../../../plans/completed/six-finding-audit-corrections.md#L58), [scene control](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L3512), [Piper omission control](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L3972), [boundary assignment](../../../../packages/epub/src/narration/narration-preparation.ts#L889).
- **Regression risk.** Copying the skipped unit's numeric delay would overwrite the audible ellipsis rule. Changing a predecessor after scheduling can lose the fix across batches. Carrying the marker beyond seek or Stop could add a pause unrelated to the next run.
- **Proposed correction and check.** Carry scene evidence through skipped units to the incoming speakable successor within the same run. Resolve the transition where both audible units are known and preserve the audible ellipsis override. Check 1,200 ms with a buffered successor, including where the predecessor is the eighth unit. Cover repeated skips, 900 ms for the audible ellipsis, a skipped ellipsis without that override, no predecessor or successor, buffering and seek. Assert synthesis order and ranges are unchanged. [Piper filter](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2131), [buffered transition](../../../../apps/desktop/src/tts/pcm-playback.ts#L480).

## Closeout

- The five passes supplied 20 unique candidate IDs, all reconciled at the
  inspected commit. The linked earlier checks provide historical coverage.
  Every proposed reproduction and correction remains pending. The recorded
  dispositions and severities are unchanged.
- Scope was limited to the indexed findings. Possible Stop interleavings
  before dispatch, ordinary B04 persisted ordering, host list rendering and
  inert wrapper-ID resolution outside the documented split remain separate
  hypotheses. Their absence here supplies no validation.
- Git inspection and source, test and evidence reads were static. No runtime
  validation was executed. The five prior reports remain intact. The new
  report is linked from the [audit index](README.md) and the
  [findings registry](../registry.md).
