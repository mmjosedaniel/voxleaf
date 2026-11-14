# Fourth static logic audit

## Scope and snapshot

- Date and checkout — 2026-11-13, `main` at
  `5fdb2dc835e99e43034e8b40c99817f45236358f`. The index was empty.
- Incoming changes were limited to the registry, audit index and three earlier
  audits. Their respective SHA-256 identities were
  `D44520E37A8F3363E60B496F937C9DC0E0446330A4B74A836A9A3C102E5441D2`,
  `BD0585B731D1AF731A056347646AE2A5CBD8B658A78B9D6068E59483C01AE4DF`,
  `9AC1E667B59BEB5A3F68264583683595A1AAF47625DA0457D72BE00CE16CC277`,
  `511ACD8C8C15136E68F6C0D9493318A738F249EB20F2C31E6918A4F0CF75AAB6` and
  `95FA4C4A0D794EE7388B28E7DD4FEE8B979FED2A04F880CC471E458543F9B522`.
- Continued the repository static review without running tests. Read the
  [previous passes](README.md), [registry](../registry.md) and
  [partial historical import](../history-import.md). The original records
  consulted include M003, M004, CFR-04/08/13, CAF-R3.4/R6.3, DCR-07, RCF-07/15/19,
  R8-07, MAF-10, LCF-01 and CCF-C20. The history search followed the owners and
  triggers below.

## Coverage

| Responsibility | Source and sequence inspected | Coverage | Remaining |
| --- | --- | --- | --- |
| EPUB open and table of contents | EPUB 3 XHTML and EPUB 2 NCX label collection through BookV1, XML events, title/alt, hidden descendants, breaks, OCF paths and shared fallback lookup. | Inspected for the label mismatch and the current package/target controls. | Full EPUB conformance and publication incidence. |
| Fragment placement and semantic rendering | Inline XHTML links and TOC targets through source-ID assignment, occurrence lookup and reader settlement. Also read ordered-list projection and the desktop's `ol`/`li` attributes. | Inspected for the inert-anchor regression and same-document recovery. Partial for DOM placement and list marker rendering. | Wrapped blocks without their own source ID and exact host rendering at ordinal bounds. |
| Narration speed and completion | Settings and compact selection, preference persistence, scheduler activation, backend preparation, natural completion and next Play. | Inspected for last-unit and completed selection. Read Pause and queued-successor controls. | Product and host timing of asynchronous preparation failures across all six rates. |
| Profile changes and metrics | Checked profile selection, healthy continuation, recovery reset and its scalar counters. Also read language selection, recheck and Settings closure guards. | Inspected for the same-profile radio interaction. Partial for cross-book language edits. | Overlapping language and compatibility changes on attached and replaced owners. |
| Slowed playback and Stop | Worklet output reports through backend, player invalidation, final metrics and the native benchmark's DOM observations. Read direct playback alongside Pause and natural-worklet-end controls. | Inspected for partial-unit cancellation and released ownership. | Actual output timing on the packaged host. Python engines, Rust supervision, packaging and CI were outside this pass. |

## Findings and reconciliation

### VF-0047 — A no-break space at a TOC label edge prevents opening

Both table-of-contents parsers collapse ASCII whitespace. A short label with
substantive text and a leading or trailing U+00A0 survives label parsing. For
example, an ordinary spine link can contain `&#160;Chapter One`. The NCX
equivalent places the same text inside `navLabel/text`. The shared XML reader
passes the decoded Unicode text to both. BookV1 copies the label of each
spine-target navigation entry verbatim and its bounded-text pattern excludes
edge whitespace with `\s`. The public decoder throws a fixed contract error.
`projectBookV1` maps it to `malformed-package`, so the otherwise readable EPUB
fails to open. This trace requires a spine target because the coarse BookV1
projection omits groups and non-spine targets.
[XHTML normalization](../../../../packages/epub/src/navigation/navigation-document.ts#L516),
[NCX normalization](../../../../packages/epub/src/navigation/ncx-navigation-parser.ts#L649),
[XML events](../../../../packages/epub/src/xml/xml-event-reader.ts#L448),
[BookV1 navigation projection](../../../../packages/epub/src/book/book-v1-projection.ts#L70),
[book schema](../../../../packages/shared/schemas/book/v1.schema.json#L58),
[error mapping](../../../../packages/epub/src/book/book-v1-projection.ts#L126),
[public open](../../../../packages/epub/src/public/open-epub-publication.ts#L156).

P2. The M003 normalization policy addresses ASCII label spacing. The uncovered
mismatch is between the parser and the shared validator. The present malformed
control has a no-break space
**between list items**. RCF-15 covers hidden labels and DCR-07 retained
attribute bytes. Use otherwise valid EPUB 2 and EPUB 3 books with substantive
labels and a leading or trailing U+00A0. Assert public open, the exact
normalized label and the selected destination. Preserve internal no-break
spaces, blank-label rejection and existing resource limits.
[M003](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L734),
[grammar control](../../../../packages/epub/src/navigation/navigation-document.test.ts#L310),
[retained-byte controls](../../../../packages/epub/src/navigation/navigation-document.test.ts#L75).

### VF-0048 — Completed narration still promises a pending speed change

At 100%, change to 75% during the final audio unit. The scheduler's active
rate stays 100 and its pending rate becomes 75. Completing the unit drains
the queue and sets the phase to `complete`. The coordinator stops its ticker
and retains the finished owners. The UI copies the pending and active rates
and promises that 75% will apply after the current section. There is no
successor to activate the selection. Changing the speed for the first time
after natural completion also reaches the retained player and creates this
presentation under successful preparation. A fresh run seeds its own
scheduler from the saved choice.
[Rate selection](../../../../apps/desktop/src/tts/reader-settings-playback-authority-v3.ts#L308),
[scheduler completion](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1030),
[completed owner](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2267),
[selection entry](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L757),
[UI projection](../../../../apps/desktop/src/tts/adaptive-preparation.ts#L373),
[compact message](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L162),
[next run](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1271).

P3. The active rate describes an audible unit under the
[v3 authority](../../../architecture/reader-settings-playback-authority-v3.md#L65).
RCF-19 preloads a successor, LCF-01 restarts after natural completion, and the
compact completed-state control has no pending rate. Check both last-unit and
post-completion selection, the message and stored preference after completion,
and the rate of the next explicit Play. Preserve ordinary boundary-deferred
activation and failed-save feedback.
[Successor test](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L1491),
[restart test](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L2328),
[completion UI test](../../../../apps/desktop/src/tts/ProductNarrationControls.test.tsx#L585).

### VF-0049 — Reselecting healthy Chatterbox resets narration metrics

While an admitted Chatterbox service is playing, click its already checked and
enabled profile radio after accumulating playback time. The click handler runs
for the checked radio. The dialog supplies a no-op guard for saved healthy Piper
profiles. For Chatterbox the settings action returns success from
`isHealthyLoadedProfile` before entering configuration. The radio handler
treats success as a change and calls App's recovery-reset callback. The
coordinator clears four episode totals and uses the current player counters as
the new baseline. Playback can continue under the same owner with its previous
rendering, buffering, intentional wait and underruns removed from the diagnostics.
[Radio](../../../../apps/desktop/src/tts/HardwareCompatibilityControls.tsx#L258),
[dialog guard](../../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L453),
[healthy selection](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L68),
[success callback](../../../../apps/desktop/src/tts/HardwareCompatibilityControls.tsx#L134),
[App wiring](../../../../apps/desktop/src/App.tsx#L979),
[metrics reset](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1215).

P3, variant of [VF-0008](../registry.md#vf-0008). MAF-10 protected Chatterbox's
admitted owner from a fresh VRAM check. Its mounted test compares service and
generation, shutdowns, optional mutations and playback phase without asserting
monotonic counters. CFR-08's saved Piper no-op still returns before the reset.
Extend the existing Chatterbox checked-radio test to record nonzero playback
before the click and sample the retained counter afterward. Keep a real profile
change and explicit compatibility recheck as controls for the intended reset.
[MAF-10 review](../../../plans/evidence/minimal-audit-findings-corrections/review-R1.md#L35),
[mounted control](../../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts#L1244),
[episode authority](../../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md#L60).

### VF-0050 — Stop drops rendered slow-playback frames between receipts

The slow-speed worklet reports actual accumulated frames at periodic 6,000-frame
intervals and on Pause or natural completion. Its first rendering notification
carries source position and clock information, without a rendered-frame count.
Stop can arrive after actual output and before any periodic, Pause or end report.
The backend detaches the current receipt listener and sends Stop. The worklet
releases the unit and the stopped message provides no rendered count. The player
captures the last accepted count and the coordinator freezes it into the
episode's `playbackMs`. With a fresh episode and no earlier receipt this can be
zero. The direct path samples elapsed rendering before stopping.
[Worklet reports](../../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts#L321),
[worklet stop](../../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts#L151),
[backend stop and receipt filter](../../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L420),
[player invalidation](../../../../apps/desktop/src/tts/pcm-playback.ts#L547),
[final metric snapshot](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1545),
[direct stop](../../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L286).

P3, diagnostic variant of CCF-C20. The episode authority requires accumulating
rendered output and freezing it across owner release. The existing backend
control exercises Pause and natural end, and the recommendation to ignore
stale callbacks after Stop still applies. Compare the current owned unit's
frozen metric with output through the Stop boundary. Preserve immediate
invalidation, bounded cleanup and separation from source progress or
physical audibility. Runtime timing and the size of the discrepancy are unmeasured.
[CCF-C20](../../../plans/completed/confirmed-chat-findings-minimal-corrections.md#L296),
[backend control](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L917),
[episode authority](../../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md#L60).

### VF-0036 — The existing empty-anchor split can redirect a TOC link

Use a preceding paragraph and an implicit paragraph such as
`<div id="destination">Before<a id="marker"></a>after</div>`. Before #314 the
transparent inline left the implicit paragraph intact. The current inert branch
flushes before opening the empty ID-bearing anchor. Its contents produce no
block. Both substantive runs belong to the same surrounding `div` and receive
its ID as their candidate. The source has one such ID, but the sidecar drops it
because two blocks claim it. A link to `#destination` now resolves as
`fragment-unresolved` at the first paragraph of the chapter. This is the
existing split and its additional effect on navigation. Add exact fragment
resolution to the reopen/locator check.
[Inert anchor](../../../../packages/epub/src/document/xhtml-projector.ts#L1203),
[source for each run](../../../../packages/epub/src/document/xhtml-projector.ts#L1017),
[sidecar uniqueness](../../../../packages/epub/src/document/xhtml-projector.ts#L762),
[target recovery](../../../../packages/epub/src/locator/target-resolver.ts#L280),
[existing report](2026-11-13-static-logic-audit.md#vf-0036--empty-inert-anchor-splits-a-paragraph-and-shifts-locators).

## Closeout

- Four newly indexed, static-only candidates, VF-0047 through VF-0050. No
  runtime reproduction or fault injection. VF-0036 retains one ID with an
  additional consequence. VF-0008 and VF-0013 retained their scoped fixes.
- Direct and fallback occurrence lookup keep the separation exercised by the
  R8-07 controls. Empty fragments resolve as document start. The design
  intentionally recovers missing or non-addressable fragments in the same
  document. An ID on an inert wrapper containing an explicit block remains
  conditional on what should count as addressable for that construct.
  [Target controls](../../../../packages/epub/src/public/open-epub-publication.test.ts#L599),
  [addressability policy](../../../architecture/decisions/ADR-0008-visual-reader-architecture.md#L67).
- Reversed lists and arbitrary internal links wrapping block content are
  explicit exclusions. The projector saturates its ordinal at the signed
  maximum. Current Chromium also saturates its native ordinal arithmetic.
  A distinct visible defect at that boundary was unverified in WebView2.
  [List scope](../../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L179),
  [link scope](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L334),
  [Chromium list ordinal implementation](https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/blink/renderer/core/html/list_item_ordinal.cc).
- No tests or builds ran. Source, local Git history and existing controls were
  read. The registry and index were updated alongside this report. HEAD and
  the three earlier audit reports retained their intake identities.
