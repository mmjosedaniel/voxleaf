# Repository logic audit

## Scope and snapshot

- Date and target — 2026-11-16, `main` at `079c38ece8687b24859db4f64d4f92bba67bdcee`
  (the integrated four-pass corrections). The working tree and index were
  clean at intake.
- Requested scope — repository-wide static review for logic defects. Reviewed
  production entry points and selected adjacent failure paths, tests and
  maintainer workflows. Product evidence here concerns the supported local
  reader, Piper and gated Chatterbox. The v14 benchmark is a development tool.
- History consulted — [registry](../registry.md), [partial historical import](../history-import.md),
  [recent audit coverage](README.md), [four-pass corrections](../../../plans/completed/four-pass-findings-corrections.md),
  [position and image corrections](../../../plans/completed/reader-position-and-image-lifecycle.md)
  and the individual cases cited below. Older unimported plans were searched
  by trigger. The full historical corpus was outside this pass.

## Coverage

| Responsibility | Source path and ordering examined | Coverage and limits |
| --- | --- | --- |
| Open, replace and close | `file-ingress/local-epub-file.ts`, `local-publication-open.ts`, `publication-session.ts`, `reader-lifecycle.ts` and `App.tsx`. Followed selection, stale open cancellation, prior publication cleanup, empty admission, restoration and narration handoff. | Inspected those transitions. File-picker and native exit timing remain unobserved. |
| EPUB and raster | `archive-inventory.ts`, `open-epub-publication.ts`, `container-resolver.ts`, `package-document.ts`, XHTML and NCX navigation, target/locator resolution and `opened-publication.ts`. Traced compatible rendition choice, first primary location, fallback occurrence identity, edge-label limits, close and lazy image reads. Followed the React image observer, queue and URL ownership. | Partial. ZIP/XML grammar, all raster formats and browser decoder behavior remain open. |
| Reader and persistence | `ReaderPublication.tsx`, `SemanticDocument.tsx`, navigation, DOM range mapping, visual locator/reflow and position coordinators. Traced explicit versus passive placement, restoration, effective direction, heard ownership and next save after Stop. | Inspected those handoffs. Host geometry, focus orders and exact WebView storage behavior remain unobserved. |
| Preparation and playback | `narration-preparation.ts`, source windows, lexical context, segment packing, `product-narration-coordinator.ts`, scheduler, PCM player and direct/WSOLA backends. Followed omitted marks and source ranges, initial and refill rate selection, first device confirmation, pause, completion and retirement. | Partial. Full lexical and continuation matrices, DSP quality, hardware performance and audio-device timing remain open. |
| Local TTS and shared contracts | Renderer process client, Rust start/prepare/cancel/shutdown and optional-transfer operations, Windows GPU probe, shared control/audio/locator decoders, Python service and Piper/Chatterbox adapter branches. Followed identity checks, stale completions, containment and the optional promotion/cleanup barrier. | Partial. Generated validators, complete frame matrix, driver/model behavior and historical/development profiles remain open. |
| Release and CI | `build-windows-release.ps1`, `windows-release.mjs`, ordinary installed journey and evidence attachment, NSIS settings, selected Chatterbox package promotion and both main CI workflows. Compared build-byte identity, configuration keys, post-commit download cleanup and driver/session teardown. | Partial. Exact signed and Defender routes, hosted execution, all installer/packaging branches and live v7 download remain unverified. |
| v14 benchmark | `batch_cli.py`, `batch_official.py`, `batch_result_cli.py`, `batch_result.py` and `v14_authority.py`. Followed host admission, monitored execution, raw/loads ownership, safe derivation and the cleanup field consumed by the summary. | Partial. Legacy benchmark families, scorecards and full v14 hardware execution remain open. |

## Findings

Each case has source evidence on the identified snapshot. Trigger prevalence and
runtime consequences have no new measurement. Proposed checks are in the
individual registry records.

| ID | Severity and affected path | Source trace |
| --- | --- | --- |
| [VF-0074](../registry.md#vf-0074) | P2, reader progress | After mid-segment Stop, a different canonical locator from an unmarked viewport sample can replace the heard checkpoint on save and reopen. The [bridge](../../../../apps/desktop/src/persistence/narration-position-save-bridge.ts#L64) finishes narration ownership, the [tracker](../../../../apps/desktop/src/reader/active-visual-locator.ts#L696) can emit a passive sample, and [save admission](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L225) accepts it despite checkpoint protection. The exact browser event order remains open. |
| [VF-0075](../registry.md#vf-0075) | P3, visual EPUB rendering | A later explicit Auto paragraph loses its attribute under an Auto chapter. In a mixed-direction chapter it inherits the direction of the earlier text. The [projector](../../../../packages/epub/src/document/xhtml-projector.ts#L334) retains effective Auto and the [renderer](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L100) removes the equal value, preventing the [HTML element-local direction calculation](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute). |
| [VF-0076](../registry.md#vf-0076) | P2, ordinary Windows journey | [Promotion](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591) exposes Installed before [staging cleanup](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2381). The [reinstall journey](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1407) ignores the terminal Download result and can certify reacquisition on the provisional snapshot if later teardown and other gates succeed. |
| [VF-0077](../registry.md#vf-0077) | P3, v14 evidence | [Preflight](../../../../services/tts/benchmarks/batch_cli.py#L235) takes the caller's `sleepDisabled` assertion. The [journal](../../../../services/tts/benchmarks/batch_official.py#L1188) supplies restoration unconditionally and the [summary](../../../../services/tts/benchmarks/batch_result.py#L363) uses it for cleanup. The documented route has no restoration observation. |
| [VF-0078](../registry.md#vf-0078) | P3, Spanish prepared text | In synthetic `Las \u200B14:30.`, [combined recognition](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1004) misses the article/time pair. [Logical lookbehind](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L484) permits the bare time and [subsequent formatting omission](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L2010) leaves two articles. |
| [VF-0079](../registry.md#vf-0079) | P3, Windows build validation | [Release configuration](../../../../apps/desktop/scripts/windows-release.mjs#L326) compares serialized `customLanguageFiles` to one insertion order. Reordering its valid entries causes prebuild failure. [Tauri's field](https://github.com/tauri-apps/tauri/blob/tauri-utils-v2.9.3/crates/tauri-utils/src/config.rs#L838-L844) is a map. |

## Reassessment of previous cases

- [VF-0001](../registry.md#vf-0001) remains intentional. Explicit recovery
  uses the most recent heard location when present. [Recovery owner](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1155).
- [VF-0058](../registry.md#vf-0058) remains absent for late Cancel in the
  renderer. The client joins the paired download and requires fresh Installed
  evidence before notifying App. VF-0076 is the ordinary release script's
  independent consumer. [Client](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L327).
- [VF-0060](../registry.md#vf-0060) and [VF-0061](../registry.md#vf-0061)
  remain absent for the exact-limit TOC suffix and the reported horizontal
  separators. VF-0078 follows the formatting-mark branch.
  [EPUB 3 trim](../../../../packages/epub/src/navigation/navigation-document.ts#L545),
  [NCX trim](../../../../packages/epub/src/navigation/ncx-navigation-parser.ts#L667),
  [article gap](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1010).
- [VF-0062](../registry.md#vf-0062) and [VF-0066](../registry.md#vf-0066)
  remain absent for the reported extra direct allocations and speed change
  while refill allocation is pending. [Direct allocation](../../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L198),
  [refill state](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1067).
- [VF-0064](../registry.md#vf-0064) remains absent for implicit RTL paragraphs
  under an LTR chapter. The projector captures the nearest block direction.
  VF-0075 is downstream attribute selection. [Implicit paragraph](../../../../packages/epub/src/document/xhtml-projector.ts#L1392).
- [VF-0072](../registry.md#vf-0072) remains absent for replacement of the
  locked artifacts during observation and handoff. [Read-share lock](../../../../scripts/build-windows-release.ps1#L22),
  [evidence publication](../../../../apps/desktop/scripts/windows-release.mjs#L802).
- [ADR-0060](../../../architecture/decisions/ADR-0060-primary-publication-start.md)
  limits the primary-item rule to default start and book-start recovery.
  Later traversal through the original spine order follows that decision.
  [VF-0071](../registry.md#vf-0071) remains an unconfirmed ordinary-writer
  defect. External mixing of v14 input files has its earlier separate limits.

## Closeout

- Six new registry candidates with `inspected-present` assessments, including
  five linked variants. Zero executed reproductions and zero same-ID
  recurrences established. The prior checks above are static.
- The final source HEAD matches intake. Audit documentation is the only
  worktree change. No tests, builds, model runs, device checks or historical
  runtime evidence reuse. Git inspection used status, rev-parse and show.
- The [registry](../registry.md) and [audit index](README.md) retain the
  cases and coverage limits. Production files and existing tests were read
  without modification.
