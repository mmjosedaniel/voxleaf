# Repository logic audit, third pass, 2026-11-17

## Scope and snapshot

- Static review of `main` at `50f3b9ec76022efae72c239015bb47080920d7a0`.
  The Git index was empty at intake. The only worktree changes were the prior
  audit documentation. Product, tooling and checked-in test source matched HEAD.
- Intake blobs from `git hash-object --no-filters` were
  `fe76a0b5ef59408ab204c853ee3b6d74874b1703` for the registry,
  `a34616542ee950bb3d865ab5f7171e803fdc601b` for the index,
  `d745d087ec34fc6fbbdd25b6126368611e9231e0` for the first report and
  `d590bf9ddce0b6a6ac1b39a5e5f61beb67648e5a` for the second report.
- Four read-only helpers covered distinct paths. The coordinator traced raster
  ownership and reconciled findings against prior source and test definitions.
  History lookup was bounded to the selected owners and triggers.
  [First pass](2026-11-17-repository-logic-audit.md),
  [second pass](2026-11-17-repository-logic-audit-pass-2.md),
  [registry](../registry.md), [historical import](../history-import.md).

## Coverage

| Responsibility | Source and event order examined | Coverage and gaps |
| --- | --- | --- |
| EPUB archive and XML | Central enumeration, declared and observed compression limits, physical local order, CRC and read-scoped lazy operations. Followed text/CDATA emission from the pinned parser and XML budget to public opening. | Inspected the stated admission and accounting paths. Full ZIP/XML grammar and actual stream timing or cancellation remain open. |
| Narration | Public `OpenedPublication.prepareNarration` and desktop batch caller, Piper/Chatterbox language context, protected lexical interiors, source windows, scene classification, warm/cold continuation and synthesis handoff. | Inspected the selected triggers across current profiles. The full lexical matrix, voice pronunciation and actual transition timing remain open. |
| Renderer image ownership | Viewport observer to occurrence queue, serialized archive read, predecode raster budgets, browser dimension agreement, re-entry, capacity release and cleanup. Rechecked selected PNG/GIF/JPEG/WebP controls. | Partial. The reviewed source supports the original capacity guard. Exact WebView2 decoder and observer behavior and complete format coverage remain open. |
| Hardware and startup admission | Native normalized hardware report and volume selection, persisted language/profile in Settings, visibility-triggered refresh and the desktop's package availability wait before native Play. | Inspected the selected asynchronous order. Natural timing, split volumes, CUDA runtime behavior and late hardware denial incidence remain open. |
| Release evidence | Windows build locking, artifact hashes, authority and JSON publication, checksum write and subsequent attachment. Sampled v7 artifact/part authority and matched tracked dependency lock and model identities. | Inspected this failure ordering. Actual checksum write failures, signed release, installed attachment and live acquisition remain open. |

## Findings

### P2

- [VF-0106](../registry.md#vf-0106) — **Chatterbox can start while a newer compatibility check is pending.** An initial fresh Play check admits Chatterbox and the coordinator awaits installed configuration availability. A visibility recheck sets the compatibility snapshot to `checking` while retaining the old selection identifiers. A package reply during that window can still trigger native start because the final guard compares those identifiers. The newer result can later deny fresh startup. A loaded-session continuation has a separate rule. No hardware failure or model execution was observed. [Play admission](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1969), [post-configuration guard](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2011), [checking state](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L381), [visibility event](../../../../apps/desktop/src/tts/hardware-compatibility-check-binding.ts#L22), [native start](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L2104).
- [VF-0107](../registry.md#vf-0107) — **Windows evidence attachment can accept a missing or stale checksum.** A fresh build writes the new evidence JSON and build-authority sidecar before attempting the adjacent checksum. If that final write fails, the build reports failure. A subsequent attachment with valid exact-artifact receipts can still name the old or missing checksum because attachment does not read it. A user comparing the distributed checksum with the installer would fail validation. This is a failure after publication of JSON, separate from VF-0072's observed-artifact drift. [Fresh-build write order](../../../../scripts/build-windows-release.ps1#L291), [attachment](../../../../scripts/build-windows-release.ps1#L169), [checksum metadata](../../../../apps/desktop/scripts/windows-release.mjs#L649), [attachment fixture](../../../../apps/desktop/scripts/windows-release.node-test.mjs#L1486), [user verification](../../../user/windows-release.md#L254).

### P3

- [VF-0108](../registry.md#vf-0108) — **ZIP admission can depend on central-directory order.** Two highly compressible unused entries below the 1 MiB per-entry grace can put the aggregate prefix above the grace and the 100:1 limit. A later stored asset can bring the complete declaration under the limit, but the first ordering is already rejected. Listing the stored asset earlier avoids that prefix with the same entry contents, physical order, and decompression work during opening. The current physical-order fixture is below the ratio boundary. [Enumeration](../../../../packages/epub/src/archive/archive-inventory.ts#L598), [running declared check](../../../../packages/epub/src/security/processing-budget.ts#L150), [ratio rule](../../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#authoritative-security-budgets), [fixture](../../../../packages/epub/src/archive/archive-inventory.test.ts#L171).
- [VF-0109](../registry.md#vf-0109) — **Empty CDATA can cause a false node-limit rejection.** The pinned `saxes` 6.0.0 `sCDataEnding2` invokes the CDATA handler even when the buffer is empty. The ordinary text handler drops empty input but the CDATA handler charges one node. A valid XHTML file at the exact 250,000-node limit can therefore fail after adding `<![CDATA[]]>` with the same rendered and prepared prose. The milestone describes counting nonempty text and CDATA callbacks. [Callback and budget](../../../../packages/epub/src/xml/xml-event-reader.ts#L448), [exact count fixture](../../../../packages/epub/src/xml/xml-event-reader.test.ts#L426), [counting rule](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L722).
- [VF-0110](../registry.md#vf-0110) — **Warm continuation can drop an ampersand expansion.** Seven short paragraphs followed by a paragraph with 116 `a` characters, ` x & b `, and further lowercase prose can put Piper's eighth segment boundary at the ampersand. The symbol needs two left tokens to normalize to “and”. The next warm request only sees source from the ampersand. A cold start at the same raw offset reconstructs the needed paragraph context. Chatterbox has the same source mechanism with its own packing threshold. [Boundary selection](../../../../packages/epub/src/narration/narration-segment-packer.ts#L659), [symbol matcher](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L647), [warm and cold selection](../../../../packages/epub/src/narration/narration-preparation.ts#L656), [product request](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2110), [title-context control](../../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L1182).
- [VF-0111](../registry.md#vf-0111) — **A padded scene ornament can become synthesis text or lose its scene pause.** Put 4,200 nonbreaking spaces before `***` in the same top-level scene paragraph between two spoken paragraphs. Preparation advances beyond the first window as unspoken. The later slice starts inside the paragraph and fails the scene recognition rule, which requires the complete source range at offset zero. Chatterbox can receive `***` as text. Piper elides it without carrying the scene pause to the next buffered spoken unit. The existing source-window case places the silent padding in a separate paragraph. [Scene predicate](../../../../packages/epub/src/narration/narration-segment-packer.ts#L768), [source-window progress](../../../../packages/epub/src/narration/narration-preparation.ts#L945), [Piper handoff](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2134), [existing test](../../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L901).

## Reconciliation and closeout

- The examined source guards the original VF-0030 image capacity issue, the
  VF-0053 already-classified scene route, the VF-0054 lexical interior split
  and VF-0072's artifact drift before JSON publication. Lazy raster reads use
  independent budgets and the public opener detaches its input signal after
  success. Current source observations do not renew installed or runtime
  acceptance. [Registry](../registry.md), [resource read](../../../../packages/epub/src/archive/archive-inventory.ts#L546),
  [open ownership](../../../../packages/epub/src/public/open-epub-publication.ts#L123).
- The upstream Blink WebP decoder inspected uses its canvas dimensions.
  No current decoder evidence supported a separate EXIF orientation mismatch
  in the reader's `HTMLImageElement` path. Exact WebView2 behavior remains open.
  [Blink WebP decoder](https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/blink/renderer/platform/image-decoders/webp/webp_image_decoder.cc),
  [image adapter](../../../../apps/desktop/src/reader/images/raster-image-source.ts#L70).
- One provisional split-volume storage case remains. Native compatibility
  measures the optional Chatterbox destination and the shared matcher also
  applies that fact to Piper. Packaged Piper resolves its model beside the
  executable. This can affect Piper eligibility when the free-space results
  would differ. NCC-04 expressly chose the native optional-data volume for
  Chatterbox. Existing application/model volume wording leaves Piper's intended
  storage authority on split-volume installations open. [Native probe](../../../../apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs#L118),
  [matcher](../../../../apps/desktop/src/tts/hardware-profile-matcher.ts#L455),
  [Piper model path](../../../../apps/desktop/src-tauri/src/tts_release_core.rs#L72),
  [NCC-04 decision](../../../plans/completed/narration-chatterbox-correctness.md#L32).
- Six new source-supported candidates, including four variants of earlier
  cases or corrections, and one provisional compatibility case. No same-ID
  recurrence or runtime reproduction. The registry records a discriminating
  next check for each finding.
- Final Git inspection found the same HEAD and empty index. Both earlier
  reports retained their intake bytes. The worktree changes are confined to the
  three audit reports, the index and registry. No codebase tests, builds,
  benchmarks, hardware probes or installed journeys ran. One helper's shell
  read accidentally invoked PowerShell `Show-Command`. No visible PowerShell
  window was found afterward and completion of that shell call was unverified.
  [Audit index](README.md)
