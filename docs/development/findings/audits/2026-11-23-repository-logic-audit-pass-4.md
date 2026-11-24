# Static repository logic audit, fourth pass, 2026-11-23

## Scope and snapshot

Reviewed `main` at `d9a0a72db1f5dd8a5dc7553ea0e2358c9cfe497e` with no
product changes and an empty index. Intake worktree changes were the registry,
audit index, and three earlier reports. Their Git blob IDs, in that order,
were `c55f980a66fcd2c600fc67bffefc9d4f1ad78bcc`,
`e7203b0f9a1181f217c319fef3ac1fb69adcd437`,
`4ebeadee2b24685b9a732a9e2512245edc685850`,
`5acaae3810305ef7d9fee33a06fa66a6f995001c`, and
`053536ca0aeb033cb1d15a899ef44dbe350ef5be`. Consulted the [registry](../registry.md),
[import coverage](../history-import.md), [prior pass](2026-11-23-repository-logic-audit-pass-3.md),
related authority, implementation plans and fixture text. Wider history was
sampled. The request continues the restriction against running codebase tests.

## Coverage

| Responsibility | Source paths and sequences inspected | Coverage and limits |
| --- | --- | --- |
| Playback and reader synchronization | First positive audio after Pause → event identity → manual inspection, highlight and follow → Resume and heard save ownership. Sampled Stop/configuration transitions. | Partial. No native input, real device ordering or viewport motion measured. |
| Reader actions and resources | Skip action while Auto direction scans → temporary/ready React article → progressive content. Sampled raster reload/eviction and changes into oversized chapters. | Partial. Actual focus target, decode timing and full layout matrix remain open. |
| EPUB narration | Public cold/warm preparation → bounded windows, mutable classifier and compound lookaround → per-profile packing and locators. | Partial. Full normalization corpus, exact window adjacency matrix and acoustic effects remain open. |
| Native TTS | Model Load and Warm frames → native lifecycle state → exact-host cancellation witness. Compared mutable source and the v7 pinned implementation. Sampled runtime request identity, diagnostic export, and transfer/verification/recovery. | Partial. Actual driver/GPU/warm-up and transfer faults remain unmeasured. |
| Maintainer | Handoff v2 native phase records → observer and cleanup acknowledgements → result counters/schema. Sampled retained bilingual-baseline generation/cancellation and result entry points. | Partial. No network sampling, real benchmark, hardware operation or artifact publication. |

## Product findings

- [VF-0156](../registry.md#vf-0156) **P3 · A late audio receipt can pull the reader away during Pause.** When Pause occurs before the first positive receipt is processed, the reader can scroll elsewhere while paused. The playback owner deliberately accepts a late receipt for already-rendered output. The highlight controller then creates a follow-eligible segment and can move the viewport before Resume. Combine the existing paused-receipt and manual-inspection fixtures through the real follow owner. Keep the heard checkpoint and highlight, suppress motion without Resume, and retain legitimate follow on the next actual audible segment. [Paused receipt](../../../../apps/desktop/src/tts/pcm-playback.ts#L516) · [Follow decision](../../../../apps/desktop/src/reader/segment-highlight-controller.ts#L330) · [Synchronization](../../../architecture/synchronization-authority-v1.md#L45) · [Manual inspection policy](../../../architecture/decisions/ADR-0070-explicit-placement-and-recovery-boundaries.md#L33)
- [VF-0157](../registry.md#vf-0157) **P3 · A chapter becoming ready can drop keyboard focus.** A large admitted Auto-direction chapter yields while scanning. Skip to reader content can focus the temporary article. The ready render adds its progress status ahead of an unkeyed article in a different child slot. The inspected React reconciliation replaces the focused DOM node. Check focus across the pending/ready transition and trusted PageDown, preserving existing focus on other controls when Skip was unused. [Skip](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1068) · [Article transition](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L763) · [Bounded scan](../../../../apps/desktop/src/reader/semantic-auto-direction.ts#L151)
- [VF-0158](../registry.md#vf-0158) **P3 · A spaced Unicode minus can let the normalizer expand one temperature.** In `20 °C − 25 °C`, the whitespace defeats the immediate numeric-continuation check and U+2212 is outside the two accepted range separators. The current ES/EN mutable normalizer can expand the first operand alone. Compare both languages, compact and spaced U+2212, the existing ASCII and en dash guards, standalone forms and exact source ranges. [Adjacency](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L524) · [Range separator](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L705) · [Celsius policy](../../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md#2026-11-04-standalone-celsius-range-clarification)

## Diagnostic and benchmark findings

- [VF-0159](../registry.md#vf-0159) **P3 · The startup witness observes `loading` only after engine Load returns.** The Python handler creates the frame but returns it to the writer only after model loading. Native initially retains `unloaded`, and the exact-host observer polls for `loading` or `warming`. A long Load followed by a fast Warm can go unwitnessed, and a sample labeled `loading` cannot establish that Load was still active. The v7 publication authority binds the v3 child at `998c7b24cda7e969e9ed0344f348506bf38af3b0`; the source blob has the same sequence. Hold the real owned native dispatch/child boundary in a controlled fixture and distinguish Load, Warm, already complete and Cancel. Preserve v7 wire compatibility and the existing containment rules. [Load handler](../../../../services/tts/src/voxleaf_tts/service.py#L184) · [Pinned child source authority](../../../../services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py#L17) · [Observer contract](../../../architecture/tts-service-protocol-v1.md#L235) · [Runner](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L59)
- [VF-0160](../registry.md#vf-0160) **P3 · The handoff benchmark can report zero network activity without sampling.** Listener and connection counters start at zero and only change for a phase that requests observation. After all cleanup acknowledgements, the CLI accepts a result without checking the network phase set. The existing synthetic success fixture omits those phase records. Require positive observation of the intended phases before crediting a zero result. Preserve measured-zero, measured-nonzero, effective firewall and terminal-output controls. [Observer](../../../../services/tts/benchmarks/service_handoff_cli.py#L505) · [Emitted counts](../../../../services/tts/benchmarks/service_handoff_cli.py#L313) · [Synthetic fixture](../../../../services/tts/tests/test_service_handoff_cli.py#L471) · [Measurement requirement](../../../../benchmarks/tts/service-handoff-profile-v1.json#L143)

## Reconciliation and closeout

- The checked VF-0051 route projects only retained leaves for public narration and the VF-0110 warm continuation retains its bounded ampersand context. Inspected raster re-entry still requests fresh read budget and maintains watched visible ownership. The multi-process optional staging concern remains the explicit single-operation policy exclusion in VF-0032. No separate supported multi-instance workflow was established.
- Five new P3 source-supported cases. No same-ID recurrence, fresh reproduction, or regression-introduction claim. Historical cancellation runs and synthetic fixture assertions were read as evidence only.
- Used read-only Git and source inspection. No codebase tests, builds, app runs, installers, downloads, or benchmarks ran. HEAD and the empty index were unchanged. Worktree edits stayed within findings documentation.
