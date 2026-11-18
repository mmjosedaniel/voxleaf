# Repository logic audit, fifth pass, 2026-11-17

## Scope and snapshot

- Static review of `main` at `50f3b9ec76022efae72c239015bb47080920d7a0`.
  The Git index was empty. At intake, the registry and index were modified and
  the four preceding reports were untracked. Product and tooling matched HEAD.
- Intake blobs from `git hash-object --no-filters` were
  `3d9853b93d1b979270bc7ae5c9b133191dfeaa8f` for the registry,
  `0d23c4c8e1d532fbb06d06ac2254ed58129a0d1f` for the index,
  `d745d087ec34fc6fbbdd25b6126368611e9231e0` for the first report,
  `d590bf9ddce0b6a6ac1b39a5e5f61beb67648e5a` for the second,
  `1c31dc2a3a6ba4f1060289e86503b75b9ac8e45f` for the third, and
  `3beb748ddc8aeb989c0b0dbbfe91f66cf18eb481` for the fourth.
- Four read-only helpers covered EPUB targets, audio ownership, installed package
  Settings, and exact-host measurements. The coordinator inspected dialog focus
  and book opening/replacement and reconciled source with prior findings and
  original controls. History lookup was bounded to the examined paths, including
  NSL-01, R8-06, H7, SAC-13, and RCF-19. [First pass](2026-11-17-repository-logic-audit.md),
  [second pass](2026-11-17-repository-logic-audit-pass-2.md),
  [third pass](2026-11-17-repository-logic-audit-pass-3.md),
  [fourth pass](2026-11-17-repository-logic-audit-pass-4.md),
  [findings registry](../registry.md), [historical import](../history-import.md).

## Coverage

| Journey | Source and sequence examined | Coverage and gaps |
| --- | --- | --- |
| Book opening and modal keyboard focus | Native picker input, file abort, publication open/replacement handoff, Settings boundary, programmatic focus containment, and conditional replacement of a focused Settings control. | Partial. Native picker and WebView2 event delivery remain unobserved. |
| EPUB names and targets | Archive admission and one-time URL decoding, BookV1 projection, `id`/`xml:id` indexing, public target lookup, distinct spine occurrences and same-byte restore. | Inspected the stated paths. No whole-spec or legacy-layout audit. Exact host reading-line placement remains open. |
| Installed Chatterbox and stored profile selection | Compatibility reconciliation, saved-profile admission, App selection identity, activation/save/rollback, and Remove containment across book replacement. | Inspected the stated settings paths. Actual oversized preference incidence, GPU state, rollback timing and live removal remain open. |
| Playback and speed changes | Compact controls, asynchronous rate preparation, direct player and worklet ownership, scheduler refill, Pause, Resume, Stop, and next coordinator tick. | Inspected selected transitions. Real message and device timing, DSP and the frequency of the selection window remain unmeasured. |
| Host and browser evidence | Native adaptive refill and cancellation observations through serialization. Native and Chromium reader reflow timings checked against the realignment budget and their functional controls. | Inspected the current harness acceptance predicates. Recorded historical measurements, exact-host execution, release installer checks and the full benchmark matrix were outside the pass. |

## Product findings

- [VF-0118](../registry.md#vf-0118) **P2 · Chatterbox activation can stop working Piper before a predictable save failure.** A compatible host with installed Chatterbox can use Piper while the stored profile value is `over-limit`. Settings marks that preference writable and accepts Activate. The action contains Piper before the reversible store rejects the same oversized value. This leaves playback stopped and the selection unchanged. The existing NSL-01 matrix does not include this storage state. [Compatibility presentation](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L620), [teardown and selection](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L98), [preference guard](../../../../apps/desktop/src/persistence/hardware-profile-preference.ts#L197), [NSL-01 criteria](../../../plans/completed/narration-settings-lifecycle-corrections.md#L47).
- [VF-0119](../registry.md#vf-0119) **P2 · A chapter filename containing `#` can prevent EPUB opening.** EPUB allows the local filename `part#1.xhtml`, referenced as `part%231.xhtml`. The archive and manifest resolve it. Projection sends the decoded path to BookV1, whose path schema rejects the character. The public opener returns a malformed-package failure before locator creation. Existing escaped-path and fragment checks exercise different parts of the URL. [EPUB file-name rules](https://www.w3.org/TR/epub-33/#sec-container-filenames), [reference parsing](../../../../packages/epub/src/paths/ocf-reference.ts#L85), [projection](../../../../packages/epub/src/book/book-v1-projection.ts#L101), [schema](../../../../packages/shared/schemas/book/v1.schema.json#L106).
- [VF-0120](../registry.md#vf-0120) **P3 · A padded `xml:id` can redirect a chapter link to its first block.** VoxLeaf's supported `xml:id` handling uses the untrimmed source value `" note "`. Navigation supplies `note`. Because fragment lookup misses the raw key, the reader recovers to chapter start even though the XML ID should normalize to the requested ID. [XML ID rule](https://www.w3.org/TR/xml-id/#processing), [source identity](../../../../packages/epub/src/document/xhtml-projector.ts#L256), [fragment resolution](../../../../packages/epub/src/locator/target-resolver.ts#L276), [locators contract](../../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L167).
- [VF-0121](../registry.md#vf-0121) **P3 · Settings can miss Escape after its focused control is replaced.** Successful keyboard activation of Review Chatterbox download replaces the focused button with confirmation. When focus resets to the document viewport, the dialog-local Escape handler is outside the key event's path. The `focusin` guard covers focus actively moving to another element. The historical R8-06 fixture exercises that route. [Conditional controls](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L399), [modal guard](../../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L295), [Escape handler](../../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L348), [browser focus behavior](https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event).
- [VF-0122](../registry.md#vf-0122) **P3 · A stale warning can follow a deliberate 1× selection.** Slow-rate preparation can fail and set the player's fallback count before the coordinator sees it. If the listener explicitly selects 1× in between, the later tick uses that same numeric rate to authorize the older fallback. It restores the unwanted warning and writes 1× again. [Control](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L205), [explicit choice](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L758), [fallback handling](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2252), [RCF-19](../../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L301).

## Evidence findings

- [VF-0123](../registry.md#vf-0123) **P3 · The native runner can underreport refill wall time.** After observing depletion, the runner awaits process and GPU probes before creating its timestamp. If playback resumes during those probes, the time-to-playing observation can be close to zero. The runner publishes the truncated interval under both wall-timing fields. The app's separate buffering counters retain their own interpretation. [Sampling and timer](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1882), [report fields](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L2380).
- [VF-0124](../registry.md#vf-0124) **P3 · The native active-cancellation arm can credit an ordinary Stop.** Generation can complete between the `generating` sample and delivery of the WebDriver Stop input. The post-Stop idle, retention and visual assertions still pass if that happens. They observe cleanup but cannot show that Stop cancelled a still-active request. [Adaptive exact-host check](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1942), [model-free terminal control](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L3365), [historical measurement label](../../../plans/completed/M010-001-bilingual-narration-and-candidate-screening.md#L632).
- [VF-0125](../registry.md#vf-0125) **P3 · The reflow benchmark can pass without observing reflow.** After a text-scale event, packaged WebView2 timing stops after three animation frames and the Chromium production timer stops after two. Neither waits for the setting and reading-line placement to settle. An ignored or delayed change can still meet the budget for reflow and realignment. [Native timer](../../../../apps/desktop/scripts/native-smoke/reader-scenarios.mjs#L1182), [Chromium timer](../../../../apps/desktop/tests/browser/reader-performance.benchmark.spec.ts#L898), [budget](../../../architecture/performance-budget.md#L76).

## Reconciliation and closeout

- Source retains canonical occurrence identity across matched spine ID/index and
  locators. The original encoded-fragment control exercises its accepted case.
  Settings still intercepts late programmatic focus, and App and native guards
  contain an owned Remove across book replacement. Retaining selection after
  removal is compatible with explicit profile selection and reinstall. [Locator resolver](../../../../packages/epub/src/locator/locator-resolver.ts#L59),
  [SAC-13](../../../../packages/epub/src/public/open-epub-publication.test.ts#L653),
  [R8-06](../../../../apps/desktop/src/settings/ReaderSettingsDialog.test.tsx#L725),
  [removal replacement control](../../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts#L1146).
- The inspected playback guards still bind genuine future-rate preparation and
  refill admission to their owners. A later warning after an explicit equal-rate
  choice is the adjacent case. Delayed native ended callbacks can also affect
  the boundaries of observed silence. Policy currently defines semantic pause
  eligibility at unit release, leaving physical-gap attribution open.
  [End ownership](../../../../apps/desktop/src/tts/pcm-playback.ts#L487),
  [refill rate guard](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L643).
- Eight new static candidates, two P2 and six P3. Five concern product behavior
  and three concern evidence. Three variants trace directly to earlier fixes
  (NSL-01, R8-06 and RCF-19). No same-ID recurrence or runtime reproduction.
  Actual user incidence and past benchmark outcomes remain unverified.
- Final Git inspection found the same HEAD and empty index. Earlier reports retain
  their intake bytes. This pass updated this report, the index and the registry.
  No codebase tests, builds, app, playback, installations or benchmarks ran.
  [Audit index](README.md)
