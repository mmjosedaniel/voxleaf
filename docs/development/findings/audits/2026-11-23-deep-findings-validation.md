# Deep validation of the five November 23 logic audits

Of the 35 original findings, **34 have a source-supported defect, including conditional failures, tooling errors and inaccurate documentation**. VF-0145’s label-limit behavior is real, but the proposed defect is policy-dependent. VF-0093 is included among the 34 for its remaining cleanup failure. The registered-start cancellation guard still prevents the previously observed obsolete spawn under its specific ordering. Seven additional findings are recorded below, including a fixed-layout EPUB being selected and a speed-measurement gate that times the wrong event.

## Evidence and coverage

Reviewed `main` at `d9a0a72db1f5dd8a5dc7553ea0e2358c9cfe497e`. This review used the five original passes, the 35 prior case investigations preserved in the reconciliation, four new source reviews across independent ownership areas, and a coordinator review of playback, the candidate findings and the previous unnumbered observations. The scope was each reported trigger, its reachable caller, neighboring code, and the relevant prior fixture or contract. Historical tests were read as text. No codebase tests, builds, application sessions, benchmark runs or model downloads were executed. [Five-pass reconciliation and original reports](2026-11-23-findings-reconciliation.md) · [Registry](../registry.md) · [History import coverage](../history-import.md)

| Responsibility | Sequences inspected | Limit |
| --- | --- | --- |
| EPUB and narration | ZIP path to BookV1, XHTML and OPF parsing through public opening, short/long ornament preparation, bounded Celsius context | Compared public routes and existing fixtures. No EPUB corpus run, synthesized speech or general conformance claim. |
| Reader | Input to measured scroll, save and reopen, Auto materialization and focus, Settings persistence, paused follow, and paragraph admission | Code supports the specified interleavings. Host focus landing, browser geometry, event incidence and storage faults were unmeasured. |
| Native, Settings and playback | Queued Start through registration, retirement and containment, consent capture, post-promotion cleanup, host admission, device rendering, rate preparation and episode metrics | No current native scheduling, hardware, physical audio, or transfer evidence. The WSOLA tail example follows from integer bounds. |
| Maintainer tooling | Windows release and traversal, retained benchmark state, evidence publication, handoff phase sampling, and smoke timing | Reviewed ordinary producers, public commands and fixtures. Static defects in acceptance logic do not reclassify historical host runs. |

The index was empty. Intake changes comprised the registry, audit index, five original reports and reconciliation. Their Git blob IDs were `816d549cf3ce5b826cc6644bfa815ad7fbfe882a` (registry), `51f1be336f800d65b553c210837cfabf831f0b45` (index), `38ff5c22b807fec2642df20eb882d5c46ee320a5` (reconciliation), and, in pass order, `4ebeadee2b24685b9a732a9e2512245edc685850`, `5acaae3810305ef7d9fee33a06fa66a6f995001c`, `053536ca0aeb033cb1d15a899ef44dbe350ef5be`, `4088c8cfca9951da38503229a4632f0bad2e9c4e`, `69bd4ca7cc1532995e01b1d3edcb972274861160`. The checkout and inputs were inspected with read-only Git and source reads. Wider repository history and unrelated journeys were outside this pass.

## Additional findings

### VF-0167

**An OPF vocabulary alias can admit a fixed-layout rendition · P2.** In a valid EPUB 3 with a canonical modification timestamp, declare a package-local alias for the rendition vocabulary. Use it for global pre-paginated layout or a pre-paginated spine override. Preselection and full package parsing compare the literal rendition prefix. They can leave the first rootfile classified as reflowable, even when a later rootfile is the supported one.

VF-0162 concerns rejection for missing metadata. This path accepts the wrong layout and changes public rootfile selection. The literal fixed-layout fallback correction still runs for its original spelling. [container-resolver.ts L294](../../../../packages/epub/src/container/container-resolver.ts#L294) · [package-document.ts L811](../../../../packages/epub/src/package/package-document.ts#L811) · [package-document.ts L1364](../../../../packages/epub/src/package/package-document.ts#L1364) · [open-epub-publication.ts L140](../../../../packages/epub/src/public/open-epub-publication.ts#L140) · [EPUB rendering vocabulary](https://www.w3.org/TR/epub-33/#sec-package-rendering-vocab) · [Property processing](https://www.w3.org/TR/epub-rs-33/#sec-property-processing)

**Discriminating check.** Resolve layout property IRIs consistently in preselection, full metadata and spine processing. Compare canonical and aliased global and per-item declarations, with a later readable rootfile, only a fixed-layout rootfile, malformed-first control, and a foreign vocabulary.

### VF-0168

**Replacing the book can suppress an appearance-save failure · P3.** Change the appearance, then replace the book before its pending preference write reports failure. The old save owner flushes during close and suppresses its completion callback after close. App also drops callbacks from the old book owner. The new book reuses the custom in-memory preference with the earlier ready status, so the user can lose the persistence warning.

VF-0150 needs a failure that has already reached the cache. Here the global appearance result never reaches it. The prior App fixture waits for the warning before selecting the new book. The default storage write is synchronous within an async API, so the production window includes a change still pending in the zero-delay save schedule at replacement. [App.tsx L524](../../../../apps/desktop/src/App.tsx#L524) · [reader-position-save-coordinator.ts L344](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L344) · [reader-position-save-coordinator.ts L566](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L566) · [reader-position-restore-coordinator.ts L244](../../../../apps/desktop/src/persistence/reader-position-restore-coordinator.ts#L244)

**Discriminating check.** Propagate the current app-wide preference receipt through replacement while protecting newer choices. Exercise close flushing an unscheduled write, a held failure across replacement, a later successful write, and a newer choice superseding an old failure.

### VF-0169

**Playback-speed timing gates measure intentional pauses · P3.** In the exact-host speed matrix, first activation uses the change in intentionalWaitMs. Recurring handoff uses the same change minus a fixed synthetic sentence pause. That counter measures scheduled semantic pauses. Holding asynchronous worklet preparation or delaying device activation after the intentional pause can increase the actual wait without increasing this counter. The harness can still report a passing timing check once the selected rate becomes active within the larger polling timeout.

VF-0165 concerns which run contributed rendered audio. This timing gate uses the wrong quantity even with one run and no navigation. The separately frozen historical candidate measurement is outside this finding. [tts-scenarios.mjs L960](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L960) · [product-narration-coordinator.ts L2348](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2348) · [pcm-playback.ts L735](../../../../apps/desktop/src/tts/pcm-playback.ts#L735) · [reader-settings-playback-authority-v3.md L177](../../../../docs/architecture/reader-settings-playback-authority-v3.md#L177)

**Discriminating check.** Bind timestamps to the preparation or handoff events named by the timing authority. Keep the pending part of the currently audible unit and scheduled semantic pause separate. With a constant sentence pause, compare prompt and delayed backend activation across the threshold and check the exported duration. A click-to-state poll includes unrelated wait and is insufficient.

### VF-0170

**Successful network sampling omits IPv6 protocols · P3.** The Windows handoff observer invokes netstat with only the tcp and udp protocol filters. Windows provides separate tcpv6 and udpv6 filters. An owned IPv6-only listener or external connection can therefore be absent even in a phase that was actually sampled. No real traffic or false historical result was observed.

VF-0160 concerns missing samples. This failure can occur with a nonempty owned process tree and a successful sample. The effective firewall and process cleanup are separate checks. [service_handoff_cli.py L187](../../../../services/tts/benchmarks/service_handoff_cli.py#L187) · [service_handoff_cli.py L211](../../../../services/tts/benchmarks/service_handoff_cli.py#L211) · [test_service_handoff_cli.py L199](../../../../services/tts/tests/test_service_handoff_cli.py#L199) · [Windows netstat protocol filters](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netstat)

**Discriminating check.** Include both address families in the sampling contract and decode owned listener and remote endpoints. Model an owned IPv6 listener and external peer, other PIDs, loopback, no endpoints, and a failed query. Keep the claim bounded to observed instants.

### VF-0171

**Scorecard or aggregate publication can bypass the CLI error response · P3.** Submit a valid scorecard for a ready session or aggregate a complete one. A filesystem denial writing or replacing the destination propagates from the shared JSON writer as OSError. Neither route translates it at the CLI boundary, so the operator can receive a traceback with a local path instead of the structured failure response. The temporary file can remain after a failed replace.

VF-0117 handles correction-time unlink and VF-0140 concerns recursive cleanup. Submit and aggregate perform publication through a different writer, and may leave a retryable temporary file beside an intact final file. [quality.py L84](../../../../services/tts/benchmarks/quality.py#L84) · [quality.py L544](../../../../services/tts/benchmarks/quality.py#L544) · [quality.py L722](../../../../services/tts/benchmarks/quality.py#L722) · [quality_cli.py L311](../../../../services/tts/benchmarks/quality_cli.py#L311)

**Discriminating check.** Translate publication failures at the owning boundary and preserve atomic replacement. Exercise failed write and failed replace separately, check the stable JSON envelope and intact committed file, and retry the original command after the fault clears.

### VF-0172

**A dotted identifier can suppress a standalone Celsius expansion · P3.** In the bilingual normalizer, `Firmware R8.5 – 20 °C` reaches the backward shared-unit range guard. It consumes the final 5 and stops at the period. That punctuation satisfies its non-word boundary test, so it mistakes the identifier suffix for a numeric left endpoint and suppresses expansion of 20 °C. The existing `R8 – 20 °C` control takes the attached-letter branch.

VF-0158 misses a real binary separator and expands too much. This case recognizes an en dash but invents a numeric endpoint and expands too little. The bounded same-prose rule already distinguishes editorial dashes from numeric ranges. [narration-bilingual-normalizer.ts L743](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L743) · [narration-normalizer.test.ts L422](../../../../packages/epub/src/narration/narration-normalizer.test.ts#L422) · [ADR-0063-default-cuda-and-celsius-boundaries.md L86](../../../../docs/architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md#L86)

**Discriminating check.** Recognize the bounded full endpoint and attachment on the left. Compare a dotted identifier, a plain attached identifier, a genuine decimal range, and an ordinary standalone temperature in both supported prose languages. Preserve source spans and the existing lookahead limit.

### VF-0173

**Inline code markers get different scene classification across source windows · P3.** A short top-level paragraph containing an inline code span of three asterisks can be consumed as a silent scene marker. The normalized short classifier counts code-role text. With enough neutral padding outside the same code span to cross the source window, the long classifier explicitly rejects code. Later slices cannot classify the whole paragraph. The same visible marker can produce different segment and boundary metadata.

VF-0137 concerns omission handling. Here two owners disagree about code itself. M005 specifies the top-level normalized ornament rule and literal code treatment makes the intended behavior worth pinning down. The discrepancy is established either way. No missed audible word is claimed. [narration-preparation.ts L655](../../../../packages/epub/src/narration/narration-preparation.ts#L655) · [narration-segment-packer.ts L783](../../../../packages/epub/src/narration/narration-segment-packer.ts#L783) · [narration-bilingual-normalizer.ts L2018](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L2018) · [ADR-0012-bounded-narration-preparation.md L355](../../../../docs/architecture/decisions/ADR-0012-bounded-narration-preparation.md#L355)

**Discriminating check.** Choose the intended code-marker policy and share its eligibility rules across short and long paths. Compare paired code-marker paragraphs across the window boundary, ordinary prose ornaments, raster content, surrounding spoken paragraphs, and continuation offsets.

## Original findings

### VF-0093

**Piper startup cancellation · Partial closure.** After native registration, retirement and child publication share a lock, so the old child cannot spawn. The client still joins the original Start promise. Verification running for longer than five seconds can put cleanup into recovery and gate the next Play. A second ordering before registration is described below. [tts_service_supervisor.rs L1637](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1637) · [process-client.ts L595](../../../../apps/desktop/src/tts/process-client.ts#L595)

### VF-0133

**Chatterbox Download consent · Present under an ordering.** The Settings UI permits Cancel during pending Download, then Review again. Download sends a profile ID. If its native task first reads confirmation after Review B, it can bind B and transfer without the second Download click. The pointer comparison guards changes after capture. A compatible v7 host is required. [OptionalChatterboxControls.tsx L477](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L477) · [tts_optional_chatterbox.rs L2282](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2282)

### VF-0134

**Leading NBSP in a ZIP member name · Present.** An encoded leading NBSP survives href trimming and decodes to an admitted member name. BookV1 aliases hash-bearing names but passes this name through. Edge-whitespace validation then rejects the book. The existing collision fixture exercises the hash case. [book-v1-projection.ts L119](../../../../packages/epub/src/book/book-v1-projection.ts#L119) · [v1.schema.json L111](../../../../packages/shared/schemas/book/v1.schema.json#L111)

### VF-0135

**Local anchor wrapping a paragraph · Present, repair policy open.** A resolvable local link installs an inline collector. Its paragraph child requires a block collector, so the public opener rejects the book. The inert external/no-href fixture takes another branch. Preserving readable text and providing an interactive block link are different product decisions. [xhtml-projector.ts L1310](../../../../packages/epub/src/document/xhtml-projector.ts#L1310) · [xhtml-projector.test.ts L567](../../../../packages/epub/src/document/xhtml-projector.test.ts#L567)

### VF-0136

**PageDown from a focused link · Conditional on viewport movement.** The link is a button, which the keyboard-intent handler excludes. If native PageDown scrolls that viewport and no other intent is armed, the save gate retains the old heard checkpoint. A gesture that does not move the viewport cannot establish the failure. [ReaderPublication.tsx L1341](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1341) · [reader-position-save-coordinator.ts L225](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L225)

### VF-0137

**Formatting omissions in a long scene marker · Present.** The whole-leaf scan rejects U+200B before a window-spanning marker. Both normalizers omit it. The next window starts at a nonzero offset and cannot recover the scene classification. U+2060 and soft hyphen take the same guard. The fixture with plain NBSP padding remains a valid control. [narration-preparation.ts L641](../../../../packages/epub/src/narration/narration-preparation.ts#L641) · [narration-segment-packer.ts L768](../../../../packages/epub/src/narration/narration-segment-packer.ts#L768)

### VF-0138

**Refill timing during speed preparation · Present.** After depletion, 45 seconds of source audio can satisfy a 60-second listening threshold at 0.75× while the worklet is still preparing. The scheduler closes the refill and the player correctly withholds allocation. Returning to 1× can start a second index during one uninterrupted wait. The fixture checks allocation without advancing the wait clock. [adaptive-buffer-scheduler.ts L1077](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1077) · [pcm-playback.ts L220](../../../../apps/desktop/src/tts/pcm-playback.ts#L220) · [pcm-playback.test.ts L2137](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L2137)

### VF-0139

**Immutable quality panel missing a dimension · Present in retained v2 and v3.** A panel can submit its final card with every sample for one candidate and required dimension marked not applicable. Scoring needs a number for that dimension and the committed card cannot be replaced. Different evaluators can legitimately supply complementary coverage. The single-evaluator v6 guard does not extend to these versions. [quality.py L525](../../../../services/tts/benchmarks/quality.py#L525) · [quality_scoring.py L40](../../../../services/tts/benchmarks/quality_scoring.py#L40)

### VF-0140

**Cleanup CLI fails without a JSON response · Present on filesystem error.** After admission, recursive removal can raise OSError. The handler catches typed quality exceptions only. An operator can receive a traceback after some files have already been deleted. The earlier correction handler translates its own unlink errors separately. [quality.py L733](../../../../services/tts/benchmarks/quality.py#L733) · [quality_cli.py L273](../../../../services/tts/benchmarks/quality_cli.py#L273)

### VF-0141

**Retry after failed Chatterbox staging cleanup · Present under a recovery sequence.** After promotion leaves a cleanup receipt, installed verification on Check can succeed while the staging guard fails. Its generic invalid error causes Settings to offer Review. Acting on it can replace the receipt. Final-package verification and staging-unlink failures expose different recovery actions. [tts_optional_chatterbox.rs L2077](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2077) · [optional-chatterbox-client.ts L417](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L417) · [OptionalChatterboxControls.tsx L524](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L524)

### VF-0142

**Appearance during a deep TOC jump · Present under an ordering.** Reflow can exhaust its frame budget while the target is still unmounted. Ordinary TOC completion drops the unavailable result and defaults to settled for renderable content. Play and save can then proceed before actual target placement. Explicit narration placement preserves its result. [reader-reflow-restoration.ts L424](../../../../apps/desktop/src/reader/reader-reflow-restoration.ts#L424) · [ReaderPublication.tsx L785](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L785)

### VF-0143

**Restoration scroll credited to a wheel gesture · Conditional on two movements.** A trusted wheel at the hard scroll boundary can arm manual intent without changing scrollTop. Explicit restoration remains active and can later change scrollTop. The tracker can consume that delta as manual and relax the exact-position safeguard. The replacement caret and native timing remain unmeasured. [ReaderPublication.tsx L367](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L367) · [active-visual-locator.ts L429](../../../../apps/desktop/src/reader/active-visual-locator.ts#L429)

### VF-0144

**Slowed PCM loses its tail · Present by arithmetic.** For 24,038 frames at 95%, output has 25,304 frames. The grain at output 24,000 can contribute at most input 22,944 + 958 = 23,902 with positive weight. The one at 24,480 can contribute at most 23,078 + 823 = 23,901. Earlier and later grains reach less. The last 135 input frames cannot contribute, yet end reports the full input length. The existing late-signal fixture leaves its last 1,000 frames silent. No word-level loss was measured. [incremental-wsola-v3-worklet.ts L245](../../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts#L245) · [incremental-wsola-v3-worklet.test.ts L200](../../../../apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts#L200)

### VF-0145

**Hidden root of a TOC label · Behavior present, defect unconfirmed.** The label initializer skips the descendant-hidden bookkeeping. A long root label reaches the size limit before title fallback. The reading-system rules allow dedicated navigation to ignore hidden, and EPUB author guidance describes hidden as a content-flow hint. The bounded rejection alone does not establish incorrect handling. Confirm VoxLeaf’s root/descendant policy before editing. [navigation-document.ts L303](../../../../packages/epub/src/navigation/navigation-document.ts#L303) · [navigation-document.ts L548](../../../../packages/epub/src/navigation/navigation-document.ts#L548) · [EPUB navigation](https://www.w3.org/TR/epub-33/#sec-nav-def-hidden) · [Reading-system processing](https://www.w3.org/TR/epub-rs-33/#sec-nav)

### VF-0146

**Native and renderer Chatterbox admission differ · Present under probe failure.** The renderer requires a complete report. A later native probe can retain qualifying CUDA, CPU and RAM after DirectML fails, leaving an incomplete report that native accepts. Explicit consent is still required. The discrepancy concerns eligibility at the fresh native check. [windows_probe.rs L307](../../../../apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs#L307) · [host_profile_detection.rs L708](../../../../apps/desktop/src-tauri/src/host_profile_detection.rs#L708) · [hardware-profile-matcher.ts L372](../../../../apps/desktop/src/tts/hardware-profile-matcher.ts#L372)

### VF-0147

**Failed prepare reserves a benchmark ID · Present after directory creation.** Prepare creates the exclusive final directory before publishing the reservation. A file write/link failure leaves no claimable reservation, and retry of the same ID collides with the directory. A failure during earlier observation cannot strand it. [benchmark_safety.py L218](../../../../services/tts/benchmarks/benchmark_safety.py#L218) · [benchmark_safety.py L311](../../../../services/tts/benchmarks/benchmark_safety.py#L311)

### VF-0148

**Standalone Windows package-check claim · Documentation mismatch present.** With the manifest unchanged, a modified payload file can pass the standalone Windows configuration gate. The separate verified-core flow checks the staged tree. The unsupported claim concerns the standalone command. A damaged distributed installer was not established. [windows-release.mjs L351](../../../../apps/desktop/scripts/windows-release.mjs#L351) · [testing.md L1620](../../../../docs/development/testing.md#L1620)

### VF-0149

**WebView2 entry disappears during traversal · Present, historically observed.** The root has missing-entry handling. Both an enumerated file and a queued directory receive later attribute reads outside that handler and the cleanup retry. Earlier Windows runs recorded this failure and then passed on retry. Those runs are historical. [windows-package-lifecycle-data.ps1 L49](../../../../scripts/windows-package-lifecycle-data.ps1#L49) · [execution-ledger.md L52](../../../../docs/plans/evidence/five-search-findings/execution-ledger.md#L52)

### VF-0150

**Custom appearance described as defaults · Present.** When a failed write has already been reported, the next book can use the remembered custom preference while the reader notice interprets the storage error as active defaults. A missing or exact position exposes the notice because higher-priority position feedback does not mask it. [App.tsx L661](../../../../apps/desktop/src/App.tsx#L661) · [AppPresentation.tsx L95](../../../../apps/desktop/src/AppPresentation.tsx#L95)

### VF-0151

**Contents obscures keyboard focus · Present for covered focus.** The forced-colors backdrop is opaque, and covered reader controls remain focusable. Skip can explicitly focus the covered article. Native Tab order and visible focus on a particular WebView2 host are unmeasured. A blanket modal-focus requirement is unnecessary to establish the covered-focus path. [ReaderPublication.tsx L1068](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1068) · [reader-shell-and-settings.css L405](../../../../apps/desktop/src/styles/reader-shell-and-settings.css#L405)

### VF-0152

**List items lose their own text direction · Present.** The projector has item context, then emits children and value without the item’s direction. Rendering the li therefore inherits list direction even if descendant text retains its own. Attribute loss is deterministic. Actual marker placement depends on layout. [xhtml-projector.ts L1432](../../../../packages/epub/src/document/xhtml-projector.ts#L1432) · [SemanticDocument.tsx L397](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L397)

### VF-0153

**Speed message during a nonterminal underrun · Present.** Device end clears the active handle. The nonterminal empty-queue branch enters buffering while retaining the old active rate. Selecting an unprepared speed supplies a pending rate, and the control claims it applies after a current section that already ended. A paused unfinished unit still has a genuine owner. [pcm-playback.ts L477](../../../../apps/desktop/src/tts/pcm-playback.ts#L477) · [adaptive-buffer-scheduler.ts L1107](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1107) · [ProductNarrationControls.tsx L188](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L188)

### VF-0154

**Application exit during native startup · Conditional on native task ordering.** Exit calls reusable force_stop. It may observe an empty slot during startup verification and return with startup still admitted. That operation can reach spawn after cleanup if the process is still running. Windows job containment and eventual process exit limit the claim. Orphaned children were not established. [main.rs L58](../../../../apps/desktop/src-tauri/src/main.rs#L58) · [tts_service_supervisor.rs L2105](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L2105)

### VF-0155

**Chrono labelled required on Windows · Inventory defect present.** The generator emits packages from Cargo metadata with default required reachability. The committed Chrono row conflicts with the recorded locked Windows normal/build graph. This establishes a classification mismatch. The shipped binary and current advisory status were not assessed. [release_inventory.py L471](../../../../scripts/release_inventory.py#L471) · [component-inventory-v1.json L1418](../../../../services/tts/release/component-inventory-v1.json#L1418) · [ci-audit-review.md L50](../../../../docs/plans/evidence/codex-model-rollout/ci-audit-review.md#L50)

### VF-0156

**Late audio receipt moves paused viewport · Present under receipt ordering.** Pause and manual inspection can precede the first positive receipt for a still-owned unit. The receipt publishes a new segment-started projection with follow eligible, undoing the earlier inspection before Resume. A receipt already processed during Pause entry cannot exercise this order. [pcm-playback.ts L516](../../../../apps/desktop/src/tts/pcm-playback.ts#L516) · [segment-highlight-controller.ts L330](../../../../apps/desktop/src/reader/segment-highlight-controller.ts#L330)

### VF-0157

**Auto direction replaces the focused article · DOM loss present.** If Skip focused the temporary article, the ready fragment places the new article at a different React child position. The focused element is removed and no handoff restores it. Subsequent focus landing and PageDown behavior have not been observed on WebView2. [SemanticDocument.tsx L763](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L763) · [ReaderPublication.tsx L1068](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1068)

### VF-0158

**Spaced binary Unicode minus in a Celsius range · Present.** The binary guard admits ASCII hyphen and en dash only. A spaced U+2212 therefore lets allowlisted operands expand inside a compound, including the shared-unit form `18 − 20 °C`. A unary U+2212 on an endpoint is handled elsewhere. [narration-bilingual-normalizer.ts L733](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L733) · [narration-bilingual-normalizer.ts L788](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L788)

### VF-0159

**Smoke evidence for cancelling Chatterbox Load · Measurement defect present.** The child builds the loading frame, blocks in engine load, then flushes the frame afterward. The smoke runner also accepts a change from loading to warming between samples and reports the first sample. Genuine in-flight Warm is possible. The probe cannot establish which engine phase Cancel interrupted. [service.py L185](../../../../services/tts/src/voxleaf_tts/service.py#L185) · [tts-scenarios.mjs L74](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L74)

### VF-0160

**Handoff reports zero with no network samples · Measurement defect present.** The observer accepts ordered cleanup acknowledgements and a final native result even when no network phases were sampled. A success fixture has this exact shape. An empty PID set also yields zero. Normal production emits phase events, but repeated phase names are sampled only once and sampling is not synchronized with each occurrence. [service_handoff_cli.py L187](../../../../services/tts/benchmarks/service_handoff_cli.py#L187) · [service_handoff_cli.py L511](../../../../services/tts/benchmarks/service_handoff_cli.py#L511) · [test_service_handoff_cli.py L488](../../../../services/tts/tests/test_service_handoff_cli.py#L488)

### VF-0161

**Mixed-case XHTML direction keywords · Present.** The public projector rejects valid mixed-case RTL or AuTo at admission. Later scope allocation and inline handling also inspect raw spellings. Changing the admission predicate alone would still produce wrong direction semantics. [xhtml-projector.ts L379](../../../../packages/epub/src/document/xhtml-projector.ts#L379) · [xhtml-projector.ts L859](../../../../packages/epub/src/document/xhtml-projector.ts#L859) · [xhtml-projector.ts L1068](../../../../packages/epub/src/document/xhtml-projector.ts#L1068) · [HTML enumerated attributes](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#keywords-and-enumerated-attributes)

### VF-0162

**OPF modification property aliases · Present.** An explicitly declared alias for the Dublin Core Terms vocabulary gives the same modification IRI. The literal dispatch ignores it, then EPUB 3 required-metadata validation rejects the book. Conversely, a foreign explicit mapping can be mistaken for the reserved IRI by spelling. EPUB 2 uses a different requirement. [package-document.ts L516](../../../../packages/epub/src/package/package-document.ts#L516) · [package-document.ts L809](../../../../packages/epub/src/package/package-document.ts#L809) · [EPUB property processing](https://www.w3.org/TR/epub-rs-33/#sec-property-processing)

### VF-0163

**First-open checkpoint for an undisplayed chapter · Present on successful write.** Confirmed missing storage arms the default flush before reader placement. If the first chapter is oversized, close or replacement can persist its locator even though only fallback appeared. Evicting another checkpoint additionally requires a full 128-entry store. Healthy first-open default saves remain an important control. [App.tsx L492](../../../../apps/desktop/src/App.tsx#L492) · [reader-position-save-coordinator.ts L361](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L361) · [reader-position-repository.ts L320](../../../../apps/desktop/src/persistence/reader-position-repository.ts#L320)

### VF-0164

**Paragraph Play during a pending jump · UI defect present.** An earlier mounted paragraph offers Start while its deep TOC destination is pending. Leaf actionability ignores placement and the click handler discards the coordinator’s refusal. This produces an enabled no-op. The backend continues to block an unsafe start. [ParagraphLeaf.tsx L124](../../../../apps/desktop/src/reader/ParagraphLeaf.tsx#L124) · [ReaderPublication.tsx L977](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L977) · [product-narration-coordinator.ts L1096](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1096)

### VF-0165

**Stable playback credits earlier runs · Measurement regression present.** The harness waits for a new chapter and then tests 60 seconds against an episode-wide rendered counter. For example, 55 prior seconds and five new seconds can earn stable credit with zero underruns. The refill branch checks playback identity. Git history ties the mismatch to the intentional change to episode totals at 4942ac7. The earlier July M010 values predate it. [tts-scenarios.mjs L1042](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1042) · [product-narration-coordinator.ts L2775](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2775)

### VF-0166

**Unsupported local v8 Remove can stop Piper · Present before first authoritative snapshot.** A failed first refresh or a failed Select that supersedes it can synthesize a Failed snapshot with unknown capability. Settings accepts anything except known false, so Remove can stop Piper before native refuses. Ordinary v7 omits the wire field on a valid response, and the existing v8 fixture first establishes known false. [optional-chatterbox-client.ts L417](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L417) · [narration-settings-actions.ts L135](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L135) · [tts_optional_chatterbox.rs L2841](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2841)

## Additional sequences and limits

- **Cancel after IPC dispatch but before native registration.** The registered-start conclusion in VF-0093 has an earlier boundary. Exact Shutdown can run after renderer dispatch and before the blocking Start task records its pending owner. With an empty session and no matching receipt, Shutdown can return invalid state. After it releases the operation, the queued Start may register, verify and spawn. The client rejects the stale result and attempts exact containment. This is a scheduling-dependent variant of VF-0093. A barrier before native registration would distinguish it from both pre-IPC cancellation and the existing post-registration barrier. No stale speech or host occurrence was established. [tts_service_supervisor.rs L2264](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L2264) · [tts_service_supervisor.rs L1990](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1990) · [process-client.ts L575](../../../../apps/desktop/src/tts/process-client.ts#L575)
- **Terminal Auto-direction failure.** A throwing direction probe leaves a failed placeholder without the destination ref needed to start saved-position restoration. The reader handles an oversized chapter separately. The admission budget already covers the normal resolver walk, and the review found no ordinary supported-book trigger for a throwing host probe. On a first open, capacity can admit narration while Auto is pending, but a user-observable failure before readiness still needs a mounted timing check and a defined initial-placement contract. Both observations remain inconclusive. [semantic-auto-direction.ts L210](../../../../apps/desktop/src/reader/semantic-auto-direction.ts#L210) · [SemanticDocument.tsx L763](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L763) · [ReaderPublication.tsx L643](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L643)
- **Focus after replacement of a Settings action, raster cancellation, and the portfolio wrapper.** The Settings focusin handler leaves the old VF-0121 question about the next native Tab open. The desktop image loader rechecks cancellation after awaiting the public resource read. The microtask between a completed inner read and public return has no established stale desktop delivery. The portfolio wrapper inspects its IPC receipt at process exit, but no late delivery that changes its verdict was established. [ReaderSettingsDialog.tsx L315](../../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L315) · [opened-publication.ts L204](../../../../packages/epub/src/resource/opened-publication.ts#L204) · [publication-raster-image-loader.ts L443](../../../../apps/desktop/src/reader/images/publication-raster-image-loader.ts#L443) · [bilingual-portfolio-host.mjs L248](../../../../apps/desktop/scripts/bilingual-portfolio-host.mjs#L248)
- **Other previously noted boundaries.** Graceful shutdown rejects trailing stdout under the deadline. The contract for clean EOF plus a nonzero exit remains open. A persistently incomplete renderer host report still blocks selection even if enumeration omitted a later adapter. Retained v13 derivation preserves the documented historical deletion order, and optional package management across concurrent app processes remains outside the single-instance workflow. No separate defect was established in these routes. [tts_service_supervisor.rs L2080](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L2080) · [hardware-profile-matcher.ts L372](../../../../apps/desktop/src/tts/hardware-profile-matcher.ts#L372) · [batch_result_cli.py L100](../../../../services/tts/benchmarks/batch_result_cli.py#L100) · [VF-0032](../registry.md#vf-0032)

## Closeout

The review covers 35 prior IDs and adds VF-0167 through VF-0173. Each new entry is a source-supported candidate. VF-0149 retains its historical host reproduction. No fresh runtime reproduction or fix acceptance is claimed. Audit writes are limited to this report, its index and the findings registry.
