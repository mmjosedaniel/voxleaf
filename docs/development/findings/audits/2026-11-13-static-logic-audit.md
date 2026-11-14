# Static logic audit

## Scope and snapshot

- Date and checkout — 2026-11-13, `main` at
  `5fdb2dc835e99e43034e8b40c99817f45236358f`.
- The worktree and index were clean at intake. The request covered the repository
  without running tests. This pass traced production flows and selected
  maintainer commands. Only the audit documentation was edited.
- The [registry](../registry.md) and [partial import](../history-import.md)
  supplied the case history. The original [CFR](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md),
  [PN](../../../plans/completed/passage-navigation-minimal-corrections.md),
  [RPI](../../../plans/completed/reader-position-and-image-lifecycle.md) and
  [reader/narration/acquisition](../../../plans/completed/reader-narration-acquisition-bugfixes.md)
  plans informed the affected flows. Earlier unimported plans were searched by
  trigger and owner. The history search was bounded to those cases.

## Coverage

| Responsibility | Source and sequence examined | Coverage | Remaining |
| --- | --- | --- | --- |
| Desktop EPUB opening and replacement | FileReader admission and abort, stale selection suppression, publication ownership and close in `file-ingress/`, `publication/` and `App.tsx` | Inspected for selection, replacement and close | Packaged file-dialog behavior and integration fixtures |
| EPUB projection and locators | `open-epub-publication.ts` through archive reads, container and OPF resolution, spine fallbacks, XHTML projection, TOC/NCX and locator resolution | Partial | Full format and malformed-input matrix, parser and budget boundaries outside the traced routes |
| Reader position and rendering | `ReaderPublication.tsx`, visual tracker, DOM mapper, reflow, navigation and save/restore owners. Traced explicit settlement, passive scroll, bounded incremental rendering and image capacity release/reload | Partial | Native input behavior, image format variants and geometry/layout orderings beyond the cases below |
| Narration preparation | Public preparation into bounded source windows, effective language, bilingual lexical forms, punctuation, packing and source locator ranges | Partial | Complete Spanish/English form matrix, window edges across all profiles and the legacy normalizer |
| Audio and synchronization | Product coordinator start/Stop/Resume, passage adjacency, audible progress and saved/visual authority. Read relevant scheduler, PCM player, Web Audio, WSOLA and recovery paths | Partial | All rate/device-event orderings, physical output and real-time performance |
| Local TTS and optional runtime | Desktop process client through native supervisor/framing and Python service; selected Piper and Chatterbox adapter paths, native host admission, optional package promotion, polling, cancellation, retry and removal | Partial | Host/GPU behavior, exhaustive adapter/protocol cases, pinned Chatterbox payload equivalence and experimental Qwen |
| Shared contracts | Locator, narration-segment and TTS control decoding and their consumers | Partial | Remaining contract types, generator, schemas and fixtures in full |
| Benchmarks, packaging and CI | Quality admission and v12 cleanup; purpose-aware preflight; selected result derivations; core and optional package promotion; Windows release evidence and workflow entry points | Partial | Full historical/experimental benchmark matrix, release and native harness internals, live CI and installer behavior |

## Findings and reconciliation

All six cases have source traces at this HEAD. P2 denotes blocked narration or
misdirected reading position in the traced conditions. P3 denotes incorrect
prepared speech text or settings feedback. Natural incidence was not measured.

### VF-0034 — Scrollbar-only movement leaves Play disabled

After a passage placement becomes unavailable, move the native reader scrollbar
to readable text in the current chapter without a preceding wheel, touch or
accepted key gesture. The generic observer still samples the new viewport, but
the scrollbar route does not record manual intent. The tracker only sets
`measuredManual` after admitting movement against a recorded intent, and the
coordinator only lifts the placement gate on that measured update. The normal
visible-locator callback carries the locator without the flag. Play stays
disabled even when the viewport reaches readable text.
[Reader input](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1268),
[wheel input](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L363),
[tracker](../../../../apps/desktop/src/reader/active-visual-locator.ts#L414),
[Play gate](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L908),
[App callback](../../../../apps/desktop/src/App.tsx#L708),
[navigation authority](../../../architecture/synchronization-authority-v1.md#L116).

P2. Variant of [VF-0003](../registry.md#vf-0003), with related manual-follow
admission in [VF-0017](../registry.md#vf-0017). The original recovery cases
use wheel or PageDown and verify the enabled control. The differentiating check
is a native scrollbar drag followed by Play and its first prepared locator.
Keep programmatic scroll and unchanged-location recovery as controls.
[Existing browser case](../../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts#L5031).

### VF-0035 — Completion of an unplaced segment replaces visual position

Assume the reader has measured passage B. The last audible segment A in the
same chapter starts or resumes following, but its follow attempt has no usable
geometry and never settles. `refresh` cancels pending follow while
`followEligible` stays true. With no intervening movement, completion passes
that flag and sends A's end to the reader's `settleLocator`, which updates the
visual locator without moving the viewport. The PCM player emits the completion
before the coordinator reports the run complete. After Stop, ordinary Play can
prepare from A's end while B is still in view.
[Failed follow](../../../../apps/desktop/src/reader/segment-highlight-controller.ts#L425),
[completion](../../../../apps/desktop/src/reader/segment-highlight-controller.ts#L315),
[reader callback](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L546),
[audible completion](../../../../apps/desktop/src/tts/pcm-playback.ts#L441),
[Play target](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1049),
[product policy](../../../product/reader-settings-and-playback-controls.md#L286).

P2. Variant of [VF-0028](../registry.md#vf-0028). The controlled PN-04 scenario
stops before the affected segment completes. The source supports the later
event path given unavailable geometry. A useful check extends that scenario
through completion and compares the next Play target with the measured visual
position. Successful follow completion, heard-end persistence and manual
inspection retain separate controls.
[PN-04 scenario](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L4857),
[missing-geometry control](../../../../apps/desktop/src/reader/segment-highlight-controller.test.tsx#L690),
[synchronization authority](../../../architecture/synchronization-authority-v1.md#L76).

### VF-0036 — Empty inert anchor splits a paragraph and shifts locators

Consider the same chapter bytes across an upgrade, with the synthetic content
`<div>Antes <a id="marca"></a>después.</div><p>Parte B.</p><p>Parte C.</p>`.
Before `403eb279`, the empty inert anchor contributed zero inlines to the
surrounding run. The commit now flushes the pending paragraph before any
inert anchor with an ID at the block destination. The empty anchor creates no
block itself, but the remaining run becomes a second paragraph. The desktop
renders two paragraphs and narration projects separate leaves. Generated
anchors for later paragraphs use their new index. In this example, the old
generated anchor at index 2 and offset 0 for Parte C now resolves exactly to
Parte B. The same input bytes retain the same book identity.
[Projection](../../../../packages/epub/src/document/xhtml-projector.ts#L1188),
[block flush](../../../../packages/epub/src/document/xhtml-projector.ts#L1404),
[renderer](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L546),
[narration source](../../../../packages/epub/src/narration/narration-source-window.ts#L875),
[anchor assignment](../../../../packages/epub/src/locator/locator-index.ts#L280),
[exact resolution](../../../../packages/epub/src/locator/locator-resolver.ts#L233),
[restore consumer](../../../../apps/desktop/src/persistence/reader-position-restore-coordinator.ts#L125).

P2. Regression from `403eb27916afe26d4794a7e36aeb97e6d1529bf1` (#314) and
variant of [VF-0004](../registry.md#vf-0004), established by comparing that
commit with its parent for `beginLink`. ADR-0007 admits direct safe inline
runs and inert link descendants. The existing regression covers genuine
block descendants and supplies no wrapper ID. The differentiating check is
public opening with the empty anchor and reopening at a pre-change saved
locator for the same bytes. Keep the genuine block and explicit paragraph
controls. The restore example is a source trace.
[Projection contract](../../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L129),
[existing control](../../../../packages/epub/src/document/xhtml-projector.test.ts#L547).

### VF-0037 — Quoted terminal Spanish ordinal takes the before-noun form

In Spanish `Dijo «Llegó 1.º».`, the lexical matcher admits `1.º`, but the
terminal check sees the closing guillemet and never reaches the period. The
separate quotation pass recognizes the paired quote. The prepared replacement
already selected `primer` where the closed utterance calls for `primero`.
The desktop's Piper and Chatterbox preparation profiles use this normalizer.
[Terminal check](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1345),
[replacement selection](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1422),
[quotation handling](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1651),
[public preparation](../../../../packages/epub/src/narration/narration-preparation.ts#L703).

P3. Variant of [VF-0018](../registry.md#vf-0018). The prior terminal-period,
end-of-leaf and before-noun controls miss this boundary. Compare public
prepared text and stable ranges for a paired closing quote followed by a
period, a before-noun ordinal and an incomplete lookahead. The assertion is
about text sent to the engine.
[Normalizer controls](../../../../packages/epub/src/narration/narration-normalizer.test.ts#L149).

### VF-0038 — Chatterbox storage returns after failed re-verification

Promotion commits a verified active package and records cleanup ownership.
If backup or staging cleanup fails, the manager retains that receipt in
Failed. If an active file is subsequently missing, explicit Check can fail
re-verification. `retry_cleanup` stores the new failure but leaves the
receipt. On a later ordinary snapshot, such as opening Settings again,
`snapshot_operation` supplies the manifest's full installed size. The client
had removed the field on the original IPC error. Settings shows the stale
amount again after the successful refresh of native state.
[Promotion](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1590),
[cleanup retry](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1970),
[snapshot projection](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1909),
[client error handling](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L359),
[settings display](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L391).

P3. Variant of [VF-0022](../registry.md#vf-0022). The existing failed-transfer
control has no receipt. The cleanup-retry control has a valid active package.
The discriminating case holds the real postcommit cleanup state, removes an
active artifact in a disposable root, then checks and refreshes. Verify
storage is omitted after integrity failure and remains known when verification
still succeeds and only cleanup fails.
[CFR-22 control](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L20),
[RCF-13 control](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L273),
[retained-byte policy](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L465).

### VF-0039 — U+2009 causes Spanish time expansion to repeat its article

In Spanish `Las\u200914:30.`, where the escape represents a thin space, the
combined article/time pattern rejects the separator. The bare-time pattern
still expands to `las catorce treinta`. The ordinary Unicode whitespace path
collapses U+2009 to one space, yielding `Las las catorce treinta.`.
[Article matcher](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L987),
[bare time expansion](../../../../packages/epub/src/narration/bilingual-spanish-normalization.ts#L138),
[whitespace classification](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L414),
[whitespace emission](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1972).

P3. Variant of [VF-0009](../registry.md#vf-0009) for a different supported
prose whitespace character. CFR-09 targeted U+00A0 and U+202F. Compare
public prepared text and source spans for U+2009, the existing spacing
controls and a bare time. Retain the time grammar and numeric-compound guards.
[Existing controls](../../../../packages/epub/src/narration/narration-normalizer.test.ts#L144),
[normalization policy](../../../architecture/narration-normalization-v1.md#L51).

## Closeout

- Six source-supported candidate IDs, [VF-0034](../registry.md#vf-0034)
  through [VF-0039](../registry.md#vf-0039). All are linked variants. VF-0036
  also has an identified regression commit. Three P2 and three P3. Zero
  current runtime reproductions and zero same-ID recurrences established.
- The examined original routes for VF-0003, VF-0004, VF-0009, VF-0018, VF-0022
  and VF-0028 have bounded `inspected-absent` assessments. VF-0001 remains
  intentional. Explicit recovery still selects the latest heard locator with
  the attempted start as fallback. [Registry](../registry.md#vf-0001),
  [recovery selection](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1155).
- The natural boundary from a readable chapter into a chapter over the desktop
  rendering limit was inspected. The audio callback can reach visual rejection
  after it observes a segment start. The existing B04 correction addresses
  explicit chapter navigation. The audible, saved and recoverable outcome at
  automatic transition remains inconclusive in this pass. It has no candidate ID.
  [Visual rejection](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L527),
  [B04](../../../plans/completed/reader-narration-acquisition-bugfixes.md#L58).
- Final source snapshot remains the intake HEAD. Worktree changes are limited to
  the [registry](../registry.md), [audit index](README.md) and this report.
  Source and existing tests were read using `Get-Content`, `rg` and read-only
  Git inspection. No tests, builds or product runtime commands were run.
  Historical evidence was consulted for case scope. The coverage table records
  remaining source and execution gaps.
