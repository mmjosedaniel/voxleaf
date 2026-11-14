# Fifth static logic audit

## Scope and snapshot

- Date and checkout — 2026-11-13, `main` at
  `5fdb2dc835e99e43034e8b40c99817f45236358f`. The index was empty.
- Incoming changes were limited to the registry and index, with four prior
  reports present. Intake SHA-256 values were
  `4344686B1D4E8C5EEDCFCBD302255919CA52EB30D7343644992C5E1C63F3FB47` (registry),
  `9CFF80315ABCAEEBB78C75857A2D91E74EB675FB8F14B16D83D67E4F745132B5` (index),
  `9AC1E667B59BEB5A3F68264583683595A1AAF47625DA0457D72BE00CE16CC277` (first report),
  `511ACD8C8C15136E68F6C0D9493318A738F249EB20F2C31E6918A4F0CF75AAB6` (second),
  `95FA4C4A0D794EE7388B28E7DD4FEE8B979FED2A04F880CC471E458543F9B522` (third) and
  `E1E583E7A6F812F57EC949F524CD13E9DF383D6FACA5B24FFE6A5E8D6A5C3052` (fourth).
- Continued static review without tests. Consulted the
  [preceding passes](README.md), [registry](../registry.md) and
  [partial historical import](../history-import.md). Original sources include
  M005, M007, B02, SAC-08, CFR-20, SFA-01, CCF-C07 and F4-04. History review
  followed the production paths and triggers below.

## Coverage

| Responsibility | Paths and sequences examined | Coverage | Remaining |
| --- | --- | --- | --- |
| Narratable source traversal | XHTML list projection and desktop rendering limits through source windows, structural cursors and public batch admission. | Inspected for short list items and the event/token limits. | Mixed structural quotas with multiple nested containers and all-silent spans. |
| Text normalization and packing | Source positions through approved formatting omissions, protected boundaries, Piper packing limits and canonical continuation. Compared the historical NBSP prefix and suffix controls. | Inspected for the U+200B prefix and the CFR-20 NBSP control. | Full omission matrix, other languages and profile-specific edge combinations. |
| Scene timing | Recognized ornaments through public scene metadata, Piper's punctuation filter, queued delay and the PCM player's buffered handoff. | Inspected for a plain spoken paragraph, discarded punctuation and buffered successor. | Exact host timing and scene markers across a discarded batch. |
| Stop and service containment | Publication abort and active-slot release, coordinator dispatch and invalidation, typed TTS client, Rust load/synthesis/shutdown, and Python framed settle with Piper and Chatterbox. | Inspected for dispatched startup and synthesis controls. Partial for synchronous callbacks preceding continuation or dispatch. | Natural incidence of observer interleavings, host cleanup timing and frozen optional runtime behavior. |

## Findings and reconciliation

### VF-0051 — Short list items exhaust a source window before the first batch

Start narration from the opening of an otherwise supported chapter containing
one list with 1,365 items such as `<li>x</li>`. XHTML projection produces one
list block and 1,365 paragraph leaves, comfortably within the reader's 10,000
block and 80,000 projected-node limits. The source window starts at the list
anchor. It retains one list-start event, three events per item (start, leaf
and end), and attempts the list-end event as number 4,097. The window only marks
itself full when it reaches 4,096 **source tokens**. The 1,365 tokens in this
example leave it collecting events until `retainEvent` rejects. Public batching
awaits that entire window before picking segments, so even a one-segment request
fails. The desktop starts its preparation through this same entry point and
shows a passage-preparation error before any synthesis for the requested list.
[List projection](../../../../packages/epub/src/document/xhtml-projector.ts#L1331),
[reader limits](../../../../apps/desktop/src/reader/large-chapter-rendering.ts#L9),
[list traversal](../../../../packages/epub/src/narration/narration-source-window.ts#L335),
[event and token limits](../../../../packages/epub/src/narration/narration-source-window.ts#L426),
[public batching](../../../../packages/epub/src/narration/narration-preparation.ts#L721),
[desktop error](../../../../apps/desktop/src/tts/product-narration-presentation.ts#L138).

P2. The bounded cursor work in B02 handles nesting and text-heavy windows.
Its existing event-limit failure fixture uses empty synthetic lists. Here each
item has a narratable leaf and the full structure fits the reader. Exercise
1,364 items (4,094 events) and 1,365 items (4,097 events) through public open,
then drain the one-segment and ordinary eight-segment requests. Assert all
items, stable ordered ranges and the normal desktop start. Preserve the
retention ceilings and cancellation during a structural window boundary.
[B02 cursor policy](../../../architecture/decisions/ADR-0057-reader-acquisition-correctness.md#L29),
[structural-pressure control](../../../../packages/epub/src/narration/narration-source-window.test.ts#L329).

### VF-0052 — A silent formatting prefix can block Piper preparation

Use one plain paragraph beginning with 320 U+200B characters followed by
ordinary prose. The projector preserves those source positions and the
normalizer maps them to `formatting-mark` omissions. They emit no speech and
still occupy individual source spans. Piper allows 320 source positions per
segment. Every candidate ending within the prefix has no substantive text.
Including the next letter needs at least 321 positions, so the scan finds no
candidate. The fallback checks only collapsed whitespace and rejects this
already classified formatting omission. Opening the book still succeeds.
Starting narration at the affected paragraph returns `resource-limit-exceeded`
and the desktop reports a preparation failure.
[Preserved positions](../../../../packages/epub/src/document/xhtml-projector.ts#L402),
[approved omission](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1964),
[Piper bound](../../../../packages/epub/src/narration/narration-piper-policy.ts#L22),
[candidate scan](../../../../packages/epub/src/narration/narration-segment-packer.ts#L584),
[fallback](../../../../packages/epub/src/narration/narration-segment-packer.ts#L973).

P2 for the affected passage. [VF-0020](../registry.md#vf-0020) covers collapsed
NBSP and still has its dedicated drain path. CFR-20 deliberately restricted
that correction to collapsed whitespace. The normalizer's existing formatting
rule establishes silence for this particular mark. Compare 319 and 320 U+200B
positions followed by the single letter `A` through public Piper preparation.
Assert the exact spoken text and source range. Keep all-silent ranges, code
and oversized protected substantive tokens as controls.
[Accepted formatting policy](../../../architecture/narration-normalization-v1.md#L51),
[CFR-20 scope](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L367),
[NBSP regression](../../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L848).

### VF-0053 — Piper drops the scene pause when it skips punctuation

In consecutive top-level paragraphs containing `First.`, `—`, `***` and
`Second.`, the generic packer returns a segment for the em dash and consumes
`***` as a silent scene. Public preparation assigns `scene-break` to the last
retained segment, the em dash. Piper drops that segment before computing the
playback transition. The scheduled boundary after `First.` therefore remains
`paragraph` (600 ms). With `Second.` already buffered, the player waits 600 ms
instead of the scene's 1,200 ms. Neither punctuation nor the ornament needs
synthesis to preserve that transition.
[Substantive units](../../../../packages/epub/src/narration/narration-segment-packer.ts#L272),
[scene recognition](../../../../packages/epub/src/narration/narration-segment-packer.ts#L761),
[boundary assignment](../../../../packages/epub/src/narration/narration-preparation.ts#L889),
[Piper filter](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2131),
[delay mapping](../../../../apps/desktop/src/tts/playback-transition-policy.ts#L6),
[buffered handoff](../../../../apps/desktop/src/tts/pcm-playback.ts#L480).

P3. SFA-01 preserves the transition for a recognized scene immediately after an
audible paragraph. The existing Piper omission control skips a leading
punctuation unit. The joined case needs the real preparation path, Piper
selection and two buffered audible units. Assert 1,200 ms, the actual order of
synthesis and unchanged source ranges. Retain the 900-ms override for a
terminal audible ellipsis and the no-successor and underrun controls.
[SFA-01 scope](../../../plans/completed/six-finding-audit-corrections.md#L58),
[scene playback control](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L3512),
[Piper omission control](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L3972).

## Closeout

- Three newly indexed static candidates, including two variants. No case was
  reproduced at runtime or reopened under an existing ID. VF-0020 received a
  scoped source reassessment. Actual frequency and host outcomes are unknown.
- Same-identity playback Pause intentionally permits bounded preparation.
  Dispatched Stop still aborts the registered EPUB preparation, suppresses its
  result and joins containment. CCF-C07 checks current ownership again after
  publishing service startup. The coordinator publishes before installing the
  EPUB preparation abort controller and before dispatching prepare/synthesis.
  A synchronous subscriber can make those orderings distinguishable. A
  production trigger with an attributable user effect was not established in
  this pass. Review that interaction through the actual reader callback before
  classifying it further.
  [Pause policy](../../../product/project-brief.md#L202),
  [startup guard](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2034),
  [preparation publication](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2102),
  [synthesis publication](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2197),
  [publication result guard](../../../../packages/epub/src/resource/opened-publication.ts#L300).
- Full EPUB conformance, non-narration reader journeys, packaging, benchmarks
  and CI remain outside this pass. No tests or builds ran. Only the audit
  report, index and registry were written. HEAD, the empty index and the hashes
  of all four earlier reports matched intake.
