# Deep validation of the four static audits — 2026-11-15

## Scope and snapshot

- Request: review this conversation and its subagent investigations, challenge every finding against current source, and inspect neighboring logic. The original no-tests restriction remains in force. No tests, validation suites, builds, browser sessions, installers, inference, or product changes were performed.
- Branch `main`, HEAD `997cddff2a8658440324a87e44178a98018dea77`, empty index. Product and test source match HEAD. The only initial tracked changes were the findings registry and audit index, with SHA-256 `40bdbd29e3d7e3d588a58adad3737bc41c98a1ff31ffaa5ef05862e90af78a9e` and `1ac7128c4f87cfe335d538cddaf77187832481e49b9d3c593ad762df06b7046c`.
- Initial untracked inputs were the [first audit](2026-11-15-static-logic-audit.md), [second audit](2026-11-15-static-logic-audit-pass-2.md), [third audit](2026-11-15-static-logic-audit-pass-3.md), [fourth audit](2026-11-15-static-logic-audit-pass-4.md), and [reconciliation](2026-11-15-findings-reconciliation.md). Their SHA-256 values, in that order, were `db379547b7381a86c154c50cd173d0b36d0ca006138bf3febfe92d0269c3d086`, `2ad10575b6e5869645bfe02478ea52272b98854f3607a86f9b1d3183d8719edf`, `8eec8d15a3ee5d9786144a70f861e4c30c748306cec4e489630b87c34a05f309`, `d4bba0a23736668dbfa96abb5864d44ae9881cfe965512ac4515ec2006e47a98`, and `29b0f7160cee2a87e5551abdfe67ba9760ad9d022e3dba7b0f6ad42ccd654d07`.
- Read the substantive messages from all completed turns of this chat, all 14 original individual subagent reports, the four audits and reconciliation. Reused the existing VF-0068 through VF-0071 agents for adversarial source review. Compared their conclusions with callers, validators, policies and existing test assertions. The coordinator alone maintains findings documentation.
- The [history import](../history-import.md) remains partial. The relevant prior plans and the newly consulted H3/H4 source are cited below. Historical PASS is provenance only. Static support does not establish natural frequency, runtime reproduction or successful remediation.

## Coverage

| Responsibility | Concrete sequence inspected | Coverage and limits |
| --- | --- | --- |
| Optional Chatterbox ownership | Native promotion/Cancel/cleanup → client generations and polls → App refresh → selected profile and Settings actions. | Inspected these transitions and original controls. No native timing or model startup observation. |
| EPUB labels and narration | XHTML/NCX append counters → edge trim → public opening. XHTML prose spaces → lexical article/time matching → bare-time replacement and bounded continuation guards. | Inspected exact limits, retained attributes, Unicode gaps, code/language/break guards and existing public matrices. No exhaustive language corpus or XML audit. |
| Reader semantics and input | Block frames → implicit paragraph → semantic renderer → caret edge. Trusted key modifiers → actual scroll admission → unavailable-placement recovery. | Inspected source and upstream Blink keyboard handlers. Actual WebView2 focus, geometry and input delivery remain unobserved. |
| PCM and refill | FIFO → direct copy/device channel → release. Underrun → effective lead at 0.75× → pending worklet → selection or failure fallback to 1× → allocation. | Inspected direct backend, scheduler and player, with initial-start, pause, tail, stale-worklet and release controls. No RSS, audible timing or DSP measurements. |
| Windows release evidence | Profile backup → installed smoke teardown → finalizer. Installer execution → receipt hash → consumer. Build/attach → signature/scan observations → artifact and authority digests → atomic JSON write. | Inspected these boundaries and earlier recovery/attachment decisions. No installation, Defender, signing or publication. |
| Prospective v14 benchmark | Isolated measured call → failure code → raw matrix and final monitor sample → replay → two-file session → derivation/cleanup → summary validator → committed GPU result/CPU admission. | Inspected targeted source and inherited schema gates. No hardware result, new official run or full legacy-version audit. |

## Dispositions

Twelve earlier cases have a source-supported failing sequence under their stated product or maintainer conditions. VF-0063 has source support conditional on the actual host scrolling. VF-0071 is retained as an externally mixed-input limitation, and is **not confirmed as a defect produced by the ordinary documented session workflow**. Two additional tooling candidates are recorded. None has a new runtime reproduction.

| ID | Priority / owner | Current assessment |
| --- | --- | --- |
| VF-0058 | P2 product | Present. Cancel supersedes the completion event needed by the same unavailable narrator. |
| VF-0059 | P2 maintainer | Present. The ordinary smoke launcher loses containment information before restoration. |
| VF-0060 | P3 product | Present. The retained-label limit runs before Unicode suffix trimming. |
| VF-0061 | P3 product | Present. The article/time gap excludes spaces later normalized as prose whitespace. |
| VF-0062 | P3 product | Present. Two full auxiliary stores coexist on the direct 1× path. |
| VF-0063 | P2 product | Conditional source support. The event guard is wrong for admitted scrolling chords; installed-host delivery remains open. |
| VF-0064 | P3 product | Present. The implicit paragraph takes the collector's context instead of its block boundary's direction. |
| VF-0065 | P2 maintainer | Present. Recoverable read/validation errors consume the raw session. |
| VF-0066 | P2 product | Present. A pending automatic refill keeps admission after its effective lead shrinks. |
| VF-0067 | P2 maintainer | Present under concurrent artifact replacement. The ordinary receipt can hash an installer other than the one exercised. |
| VF-0068 | P2 maintainer | Present under authority-input drift. Attachment can relabel unchanged package bytes. |
| VF-0069 | P2 maintainer | Present. Both standard viability and sustainability can pass after rejected playback simulation. |
| VF-0070 | P2 maintainer | Present. Aggregate failure and memory facts do not prove the required batch-specific stop. |
| VF-0071 | Conditional hardening | Not confirmed as an ordinary workflow defect. Independently valid files can be externally mixed, but the normal writer produces a matched pair. |
| VF-0072 | P2 maintainer, new | Present under artifact replacement during build finalization. Signature/scan/checksum observations can refer to earlier bytes. |
| VF-0073 | P2 maintainer, new | Present after a measured worker's privacy detection. The summary can still claim its privacy audit passed. |

### VF-0058 — completion ownership

The [native commit](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591) marks Installed before post-commit cleanup. [Cancel](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L313) increments the client generation, waits for the paired Download, then performs a passive read. The Download's old completion is rejected by the generation guard. [App](../../../../apps/desktop/src/App.tsx#L449) only refreshes after a matching started/completed pair. [Settings](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L480) hides Activate for the already selected profile. Installed therefore does not by itself restore the same narrator's availability.

The [ADD-01 client assertion](../../../../apps/desktop/src/tts/optional-chatterbox-client.test.ts#L42) proves only the final snapshot; [VF-0046's App assertion](../../../../apps/desktop/src/App.test.tsx#L1096) covers ordinary explicit completion. Neither combines them through the next Play. Visibility-triggered compatibility checking can provide a later recovery, so this is not permanent installation corruption. Preserve early Cancel, failed cleanup, passive-poll and replacement ownership. A future correction must emit one attributed completion only after successful settlement/fresh Installed, then verify the next explicit Play with no automatic synthesis.

### VF-0059 — restoration requires the smoke's containment

[runCommand](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L833) inherits stdio without IPC and reduces native smoke failure to a generic error. [runNativeOperation](../../../../apps/desktop/scripts/native-startup-smoke.mjs#L101) has an independent cleanup receipt, and [cleanupNativeRun](../../../../apps/desktop/scripts/native-startup-smoke.mjs#L1150) preserves uncertain process capture/termination. The ordinary journey closes its own session before starting these smokes, so the [finalizer](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1088) cannot recover their ownership from its session reference. Successful uninstall can therefore allow restoration despite unverified smoke containment.

RAC-03, VF-0040 and VF-0056 retain their separate protections. The inspected verified-no-spawn branch requires the actual private spawn marker and absent installation/destination; it is not a second current defect. Preserve functional failure separately from verified containment: an assertion failure with positive cleanup and terminal child exit can still permit restoration, while missing/negative cleanup cannot. Future disposable-child checks must exercise the real launcher/finalizer and preserve an unrelated process sentinel. No orphan or data loss is claimed.

### VF-0060 — trim and retained length

Both [XHTML](../../../../packages/epub/src/navigation/navigation-document.ts#L521) and [NCX](../../../../packages/epub/src/navigation/ncx-navigation-parser.ts#L652) count a trailing NBSP before close-time trim. At 1,024 retained points, the extra point rejects the publication. This also applies to other accepted non-ASCII edge whitespace, such as U+202F, under the same counter/trim mismatch. Leading Unicode padding and trailing ASCII padding take different paths and do not establish this failure.

The [VF-0047 public controls](../../../../packages/epub/src/public/open-epub-publication.test.ts#L111) and [retained attribute budget controls](../../../../packages/epub/src/navigation/navigation-document.test.ts#L41) preserve short-label trimming and UTF-8 charging. Keep those rules. A bounded pending suffix must distinguish true end padding from spaces that become interior across XML events; per-event trim or unbounded accumulation would introduce defects. Future checks combine public opening, literal/entity padding, 1,024 versus 1,025 retained points, astral points and attribute origins.

### VF-0061 — the gap is wider than U+2002

The [article/time predicate](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1004) accepts five gap characters. [Prose whitespace](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L432) accepts more. XHTML retains U+2002, the combined form misses, and the [bare-time rule](../../../../packages/epub/src/narration/bilingual-spanish-normalization.ts#L139) supplies another article. The same source reasoning applies to horizontal examples such as U+2003. These are variants of the same predicate defect, not separate findings for each Unicode character.

SAF-12, CFR-09 and U4 successively addressed five characters; the [public matrix](../../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L44) reflects that limited set. Replacing this with unrestricted whitespace would also admit line/paragraph separators. A future correction should deliberately define the local horizontal gap while preserving language, code, semantic boundaries, numeric-compound guards and the 128-point lookahead. Check exact ranges and cold/continued preparation, rather than only the final spoken string. Frozen v1 is separate.

### VF-0062 — allocation, not a measured leak

The [direct backend](../../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L170) creates a full Float32Array and then a full AudioBuffer channel. Both exist at `channel.set(input)`. With 480,000 remaining frames this is 3,840,000 auxiliary logical sample bytes, against one 1,920,000-byte active-device copy in the [canonical invariant](../../../architecture/system-diagram.md#privacy-persistence-cancellation-and-bounds). The separate v3 non-default work-memory allowance does not authorize another direct-path copy.

Git identifies `bc4c1a8` (#169) as the change from direct channel decode; the later file split retained it. The [existing test](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L2424) counts device buffers, not the intermediate array. Direct DataView decode into the device channel can preserve byte order, view offset, partial start and finiteness. Future allocation assertions must observe both storage classes and keep FIFO release-once and WSOLA controls. No RSS increase, leak, crash or audible underrun has been measured.

### VF-0063 — modified scrolling keys

The [keydown guard](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L1341) rejects Shift and Ctrl. The [movement tracker](../../../../apps/desktop/src/reader/active-visual-locator.ts#L429) requires a prior admitted gesture, and the [narration recovery gate](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L921) requires a measured-manual sample. Upstream Blink maps Shift+Space to backward page scrolling and also permits Ctrl+Home/End on Windows. Thus Ctrl+Home/End are additional conditional variants of the same modifier filter. [Chromium keyboard owner, inspected 2026-11-15](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/input/keyboard_event_manager.cc).

This proves a source mismatch, not the exact installed WebView2 outcome. It requires real viewport movement, a readable destination, focus in the article, no earlier admitted intent and settled unavailable placement. A Shift+Space-only repair would leave the Ctrl variants. Use explicit chord admission, preserving selection/control/editable-target exclusions and native defaults. Future host checks must observe scrollTop and the first locator prepared by Play, with no-movement, selection, programmatic movement and plain PageDown controls.

### VF-0064 — implicit block direction

The [block-boundary frame](../../../../packages/epub/src/document/xhtml-projector.ts#L948) records the div's effective RTL context, while [text](../../../../packages/epub/src/document/xhtml-projector.ts#L1013) takes that context and [flushPendingParagraph](../../../../packages/epub/src/document/xhtml-projector.ts#L1392) takes the older collector's LTR context. The renderer preserves those distinct block/inline values, and the [caret sampler](../../../../apps/desktop/src/reader/active-visual-locator.ts#L662) reads the block direction. An explicit p obtains its own effective context and is a discriminating control.

The semantic direction error is supported; a particular caret offset or lost saved position is not demonstrated. Nested block boundaries and dir=auto belong in the same correction coverage. Capturing the first inline's direction is unsafe because an inline override need not establish paragraph direction. Preserve current flush boundaries, IDs, links and source spans. Future public-opening/rendering checks should compare equivalent implicit/explicit paragraphs and follow the selected locator through save/reopen.

### VF-0065 — validation before consumption

[The successor CLI](../../../../services/tts/benchmarks/batch_result_cli.py#L100) deletes the directory in finally after reads, then invokes the real deriver. A read failure and a later recoverable authority/schema mismatch both consume the inputs. DCR-17/U11's [routing assertion](../../../../services/tts/tests/test_benchmark_batch_cli.py#L251) substitutes the deriver and requires this early absence, so it cannot establish retry preservation.

The [documented policy](../../../../benchmarks/tts/README.md#L581) requires deletion before emitting a successful summary; it does not require deleting rejected input. Prepare, validate and serialize in memory before consuming the scoped v14 session, then require successful cleanup before stdout. Partial deletion can still defeat retry and must remain an error. A broken output pipe after successful deletion needs a separate delivery/recovery contract, not moving deletion after stdout. Running derive before the producer's completion receipt can also expose the partly written directory; that is outside the documented sequential workflow and is an adjacent rejection/preservation control, not a new normal-flow finding.

### VF-0066 — both explicit and automatic rate fallback

After an underrun, `initialPlaybackCommitted` remains true. Forty-five source seconds qualify at 0.75×, but the next unit waits for cold worklet preparation. Returning to 1× shrinks effective lead to 45 seconds; the [scheduler's early return](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1067) leaves playing and the [player](../../../../apps/desktop/src/tts/pcm-playback.ts#L219) can allocate. U2's [45-second control](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L1400) is before the first allocation and does not cover this already-committed refill.

A related reachable variant needs no second user selection: if the pending worklet fails while the retained active rate is 100, [fallbackFutureRate](../../../../apps/desktop/src/tts/pcm-playback.ts#L812) selects 100 through the same scheduler gate. A future correction must keep automatic refill provisional until its first device allocation, including this fallback. Do not reapply the minute threshold between ordinary units, on explicit Resume/Play available, or after a complete shorter tail. Retain the same underrun count and reject late preparation after Stop/replacement.

### VF-0067 — the exercised installer identity

[runJourney](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1178) executes the live installer path and only [constructs its receipt](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1373) much later. A replacement in between is hashed as the exercised artifact. The [consumer](../../../../apps/desktop/scripts/windows-release.mjs#L416) correctly compares the supplied identity, but cannot recover the earlier executed bytes. This is a conditional maintainer concurrency failure, not an observed incorrectly published release.

CFR-15/CFR-23 fixed consumer validation. A run-owned copy identified before moving application data can bind launch and receipt, with containment ownership retained for that copy. Comparing only two reads of the original path cannot exclude a temporary substitution. Do not equate installed and build executables: that distinction is intentional. Preserve unchanged-input success, permanent/temporary source replacement and VF-0059/VF-0056 cleanup behavior.

### VF-0068 — attachment cannot establish build provenance

[Attachment](../../../../scripts/build-windows-release.ps1#L152) reuses artifacts, but [evidence construction](../../../../apps/desktop/scripts/windows-release.mjs#L593) hashes current authority documents. Changing both current Piper manifest copies by whitespace can pass their equality check while disagreeing with the packaged resource. The historical [packaged-manifest consumer](../../../../apps/desktop/scripts/tts-adapter-layout-host.mjs#L1450) establishes that this digest identifies packaged bytes. Tauri's field identifies base configuration, and optional-package manifests do not certify locally downloaded weights.

CFR-19 covers artifact observation preservation, not this input attribution. A trusted baseline for the same artifact pair must preserve authority or reject unverifiable drift before writing. Also inspect build-time capture: changing manifests after bundling but before the first evidence write can create an incorrect baseline from the outset. Blindly preserving any prior JSON is therefore insufficient. VF-0072 records a distinct artifact-observation gap in that build path. Preserve signature, scan, lifecycle and ordinary receipt checks and atomic replacement.

### VF-0069 — rejected playback cannot prove a passing gate

Two complete pairs of 15-second units generated two seconds apart cause the simulated buffer to rise from 28 to 43 seconds. [The simulator](../../../../services/tts/benchmarks/batch_playback.py#L121) rejects capacity; [the producer](../../../../services/tts/benchmarks/batch_official.py#L676) substitutes zero measurements and `playback-invalid`. Twelve such measured pairs provide 360 seconds and aggregate RTF about 0.067. With the other timing, memory, cancellation and audit gates satisfied, [derivation](../../../../services/tts/benchmarks/batch_result.py#L348) and [summary validation](../../../../services/tts/benchmarks/v4_authority.py#L580) can approve **both** standard viability and sustainability. Demo usefulness remains not-evaluated.

The defect is a false inference from placeholder zeros, not an instruction to relax the 40-second limit. Require valid replay evidence in current derivation and direct v14 validation. Preserve genuine zero-underrun results. Ordinary `playback-incomplete` already brings a failed-attempt count that blocks both conclusions; cover it defensively without claiming the same natural false PASS. Modeling capacity waits changes measurement semantics and needs a separate versioned decision. Extra failed conclusions must not become qualifying memory-stop proof under VF-0070.

### VF-0070 — row counts are not causal stop proof

The [contract](../../../../benchmarks/tts/profile-v4.json#L283) requires a full-GPU batch-two first-attempt memory stop. A measured generation failure, even on batch one, plus a reserve breach at [the final sample](../../../../services/tts/benchmarks/batch_official.py#L1145) can supply the independent predicates used by [CPU admission](../../../../services/tts/benchmarks/v14_authority.py#L279). Completed cancellation trials, cleanup, exact commit ownership and summary identity can still pass. Committing the exact result is a necessary precondition to admission, not evidence linking the stop to a call.

The [original plan](../../../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md#L893) intentionally fills remaining measured rows as failed after an ordinary terminal failure. Therefore 12 calls/24 units prove matrix structure, not that all calls were dispatched; this is not separately reported as a new bug. An active safety stop correctly prevents publishing a derivable session under ADD-02. Positive CPU admission consequently needs versioned attributable stop/phase/attempt and cleanup evidence, including unrun work. Fail closed when that proof is absent; do not restart GPU work to manufacture a complete matrix.

### VF-0071 — revise the actionable classification

[The writer](../../../../services/tts/benchmarks/batch_cli.py#L298) creates a fresh directory for the selected ID/version, obtains raw and loads from one execution, writes both, and emits the completion receipt afterward. Existing sessions are rejected. No ordinary internal route that mixes two executions was found. The prior counterexample remains technically true **after externally substituting one input**, because [load validation](../../../../services/tts/benchmarks/batch_result.py#L74) checks shape rather than common origin.

The original candidate is now `not-confirmed` as an ordinary workflow defect, with `inspected-inconclusive` actionability. Preserve its mixed-input evidence as conditional hardening. A last-published completion manifest can bind exact bytes, ID and version if that stronger contract is adopted; it cannot prove authenticity against coordinated edits to all inputs. Old unbound sessions need an explicit version policy. The identified normal-flow data-loss issue remains VF-0065, not this case.

## Additional findings

### VF-0072 — build observations can refer to replaced bytes

**P2, maintainer tooling, candidate / inspected-present.** During ordinary or signed package finalization, [PowerShell](../../../../scripts/build-windows-release.ps1#L223) reads Authenticode, optionally scans with Defender and writes the installer's checksum. It then calls Node without passing the verified artifact digests. If a concurrent build replaces installer A with B after these observations but before [Node's first identity read](../../../../apps/desktop/scripts/windows-release.mjs#L551), the new JSON can identify B while declaring the signature/scan observations of A. The checksum sidecar can still identify A.

[writePackageEvidence](../../../../apps/desktop/scripts/windows-release.mjs#L738) enforces observation-bound hashes only for attachment. The fresh-build rehash compares B with B and succeeds. This differs from VF-0067's executed-journey producer and VF-0068's authority documents. It is a linked variant of VF-0019/CFR-19 with the fresh-build caller, not evidence that the corrected attachment path regressed. No release, signing incident, malicious input or natural occurrence is claimed; local release gates remain not-run on an ordinary new build.

Bind signature, scan, checksum and evidence to one run-owned artifact snapshot, or reject drift before publishing any corresponding success. Merely copying metadata from a previous record cannot establish those observations. Future disposable-artifact checks should replace A after signature/scan/checksum and before Node identity capture, keep B stable, and require rejection or evidence for the actually inspected bytes. Keep signed/unsigned, optional Defender, stable input, attachment and mid-write drift controls. The consulted prior tests exercise attachment binding and later Node drift; the build-to-writer identity boundary is missing.

### VF-0073 — measured privacy detection is reported as a passing audit

**P2, maintainer tooling, candidate / inspected-present.** During a measured batch, [the isolated worker](../../../../services/tts/benchmarks/isolation.py#L173) captures diagnostics with forbidden values. A detection discards captured text and sends only `privacy` at [line 228](../../../../services/tts/benchmarks/isolation.py#L228). The parent contains the worker and raises `AdapterOperationError`. [Batch execution](../../../../services/tts/benchmarks/batch_execution.py#L237) preserves `BatchBenchmarkError` but turns this other exception into `generation-failed`. The official runner can preserve the failed matrix and complete independent cancellation trials and cleanup.

[Summary derivation](../../../../services/tts/benchmarks/batch_result.py#L348) unconditionally sets `audits.privacy = True`. Its content scanner does not invalidate that flag because the sensitive diagnostic was discarded. [The v14 validator](../../../../services/tts/benchmarks/v14_authority.py#L263) checks cleanup/cancellation consistency but not privacy consistency. Thus a privacy detection can yield a passing privacy field in an otherwise failed result. Together with VF-0070's conditions, that flag can also satisfy CPU admission's privacy requirement. This is false audit evidence, **not demonstrated disclosure or a global viability PASS**.

[H4](../../../plans/completed/validated-audit-follow-up.md#L238) already corrected the same unconditional-audit pattern in v8–v11 screen builders; H3 improved the detector. This is a distinct measured-batch/summary owner, absent from that correction scope. Preserve the fixed error code through the measured boundary and derive/validate a failed or unproved privacy audit, or stop without a derivable result. Keep safe redaction and verified process cleanup. A future harmless isolated worker should print a synthetic canary only during a measured call; assert the fixed code, no private output, no false privacy PASS, rejection of a contradictory direct summary and no qualifying CPU admission. Keep generic generation failures and clean diagnostics distinct.

## Neighboring concerns not promoted to additional bugs

- `minimumBufferSeconds` includes the terminal drain, making it zero in successful playback simulations. [Implementation](../../../../services/tts/benchmarks/batch_playback.py#L128). Whether the intended diagnostic excludes normal end-of-range is unresolved; no new defect ID or changed acceptance meaning is inferred.
- Nonfinite JSON values in externally altered raw playback fields merit strict parsing/serialization controls, but the ordinary producer was not shown to generate them. This remains conditional input hardening, not another natural-run finding.
- Failed-row placeholders follow the historical benchmark policy. Failed/incomplete calls already block viability. Strict cancellation proof, active memory-stop latching and content-free cleanup failures remain necessary controls.
- Existing optional-package replacement guards, direct-path byte order/partial offsets, explicit paragraph direction, leading label trim and ordinary fresh-session pairing prevent several broader allegations. None of those controls closes the distinct sequences above.

## Closeout

- Twelve earlier source-supported cases retained, one earlier host-conditional case retained, one earlier case narrowed to unconfirmed ordinary-flow actionability, and two new source-supported tooling candidates. Fifteen unique actionable/conditional candidate IDs, one separate hardening record, zero new runtime reproductions and zero remediation acceptance claims.
- Additional Unicode, modified-key and automatic-rate-fallback variants remain on their causal IDs with explicit conditions. Only VF-0062 has established regression introduction evidence in this set; adjacent failures are not called regressions merely because an earlier plan passed.
- Final review is limited to these owners, callers and cases. Installed WebView2 behavior, host timing/incidence, actual memory impact, model results, concurrent release executions and the broader repository remain unvalidated.
- This report, affected registry entries and the audit index are the only new edits in this turn. Earlier reports are preserved. Read-only Git/source/history inspection was used; no configured test or acceptance command ran and the index remains empty.

