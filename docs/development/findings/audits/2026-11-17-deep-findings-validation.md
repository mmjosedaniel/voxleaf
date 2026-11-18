# Deep validation of the November 17 logic findings

## Results

On `main` at `50f3b9ec76022efae72c239015bb47080920d7a0`, 32 of the 33 original reports have a source-supported failure or evidence gap under the stated trigger. Eighteen affect product or EPUB behavior and fourteen affect maintainer tooling or its measurements. For VF-0121, the handler gap is visible in source. Whether an installed Settings user loses Escape remains `inspected-inconclusive`.

This review adds seven source-supported candidates, VF-0126 through VF-0132. Six came from tracing adjacent paths and one came from resolving the earlier shutdown observation. No codebase tests, installers, applications, model runs or benchmarks ran. No case received a new runtime reproduction. The registry keeps the historical dispositions and adds this dated assessment.

## Scope and evidence

Reviewed the five completed audit turns, their 20 exploration reports, and the reconciliation turn with 32 individual reviewers' reports covering all 33 cases. Four read-only follow-up reviews checked the desktop, EPUB, native, release and measurement paths. The benchmark and cross-component conclusions also trace through current command boundaries, contracts and fixtures. The previous reconciliation retains the per-case plan history, proposed fixes and regression controls. [Five audits and index](README.md) · [Prior reconciliation](2026-11-17-findings-reconciliation.md) · [Registry](../registry.md) · [Import coverage](../history-import.md)

Source, test files and the Git index matched HEAD at intake. Eight audit documents carried local changes. The following are intake blob identities from `git hash-object --no-filters`. No previous report was edited.

| Input | Git blob |
| --- | --- |
| Registry | `ee292e2930eb9cebf33197b00ff724f95974f310` |
| Audit index | `96a937170744fa236b6060de25aae16861ba8232` |
| Reconciliation | `038aa9fb20b760cad4500e5f20329bef39b916a7` |
| [2026-11-17-repository-logic-audit.md](2026-11-17-repository-logic-audit.md) | `d745d087ec34fc6fbbdd25b6126368611e9231e0` |
| [2026-11-17-repository-logic-audit-pass-2.md](2026-11-17-repository-logic-audit-pass-2.md) | `d590bf9ddce0b6a6ac1b39a5e5f61beb67648e5a` |
| [2026-11-17-repository-logic-audit-pass-3.md](2026-11-17-repository-logic-audit-pass-3.md) | `1c31dc2a3a6ba4f1060289e86503b75b9ac8e45f` |
| [2026-11-17-repository-logic-audit-pass-4.md](2026-11-17-repository-logic-audit-pass-4.md) | `3beb748ddc8aeb989c0b0dbbfe91f66cf18eb481` |
| [2026-11-17-repository-logic-audit-pass-5.md](2026-11-17-repository-logic-audit-pass-5.md) | `1b3f5663fe4125c98eff9e2a82f0ee5bb727aa40` |

| Reviewed journey | Coverage and limits |
| --- | --- |
| File open through render, locator resolution and narration preparation | Inspected OCF and ZIP admission, XML callbacks, projection, direction scopes, node limits, location matching and bounded narration packing for the specified inputs. Pixel geometry, installed placement and pronunciation were unmeasured. |
| Settings and narration lifecycle | Inspected consent, package verification and staging, profile/language writes, fresh Play admission, shutdown, device-end callbacks, rate settlement, buffering and reflow. External filesystem state, scheduling incidence and speaker output were unmeasured. |
| Windows validation and measurements | Inspected both installer runners, backup and restore, checksum publication and attachment, quick-start, refill, Stop and reflow observers. No live user data, installer, historical timing or release result was exercised. |
| Retained benchmark commands | Inspected v5 lineage, prospective restoration, v14 warm-up and measured failure propagation, v6 submission/aggregation/derivation and shared preflight exception handling. A clean eligible host is a precondition for official work. The current dirty audit checkout would not qualify. |

## Earlier ExecPlans

Git history assigns three related regressions to earlier correction commits. `e85837d` introduced the first-part ordinal mismatch (VF-0094) and the hidden Auto node charge (VF-0097). `079c38e` introduced the build-authority/checksum publication order (VF-0107). The original unrelated-diagnostic, visible direction and artifact-identity protections still have their own evidence. [Release probe](../../../../apps/desktop/scripts/optional-download-probe.mjs#L113) · [Node accounting](../../../../apps/desktop/src/reader/large-chapter-rendering.ts#L195) · [Publication](../../../../scripts/build-windows-release.ps1#L279)

Several other cases are gaps in the fixtures or scope of a previous fix. H13 tested only the default install location. NSL-01 covered other known profile-selection blockers. RCF-19 covered a newer speed choice before the failure settled. CFR-20 explicitly selected Piper for the whitespace fix. These histories establish exactly what was protected. The time of introduction for the additional cases remains unknown. [H13](../../../plans/completed/validated-audit-follow-up.md#L258) · [NSL-01](2026-11-17-findings-reconciliation.md#vf-0118) · [RCF-19](2026-11-17-findings-reconciliation.md#vf-0122) · [CFR-20](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L81)

## Original findings

Each entry gives the trigger, actual consequence and evidence limit. The verdict applies to that specific proposition.

### VF-0093

**Cancel during packaged verification.** P2 · Product · `inspected-present`. Installed Piper can hold the native operation lock while it hashes the package and the child slot is empty. Cancel finds neither a child nor a terminal record for that start ID. Verification can finish and spawn the retired request before the typed client contains it. The renderer token blocks stale synthesis. An unavailable next Play additionally requires the five-second cleanup deadline to expire. [native start](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1504) · [empty-slot shutdown](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1835) · [typed client settlement](../../../../apps/desktop/src/tts/process-client.ts#L567)

### VF-0094

**First download artifact rejected by probe.** P2 · Release · `inspected-present`. The producer labels the first part 1. The probe requires 0 with otherwise matching stage, failure and OS fields. The fixture codifies the mismatch. The ordinary runner therefore drops the genuine first-part failure before it can check export and cancellation. [ADR-0059](../../../architecture/decisions/ADR-0059-optional-download-diagnostics.md) · [native ordinal](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2282) · [probe](../../../../apps/desktop/scripts/optional-download-probe.mjs#L89) · [Node fixture](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs#L232)

### VF-0095

**Cancel hides committed cleanup failure.** P3 · Product · `inspected-present`. Promotion has already committed when cleanup fails. While Settings still shows Verifying, Cancel can reach native Failed and return Invalid. Its newer client generation hides the Download reply and offers another Review. Reading the authoritative state first still offers Check. This ordering affects the recovery action and leaves the verified install in place. [native failure and Cancel](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2384) · [client generation](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L329) · [Settings action](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L511)

### VF-0096

**One inline direction scope becomes multiple isolates.** P3 · Product · `inspected-present`. In an LTR paragraph, strong formatting inside an explicitly RTL or resolved-RTL span can split one authored direction scope into sibling isolates. The correct direction on each sibling does not preserve their ordering inside one outer isolate. Check single-line visual order across the formatting boundary and preserve DOM-to-locator mapping. No glyph coordinates were measured. [renderer](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L119) · [original U1 fixture](../../../../apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts#L64) · [DOM range mapping](../../../../apps/desktop/src/reader/semantic-dom-range-mapper.ts#L260)

### VF-0097

**Discarded Auto markup can exclude a chapter.** P3 · Product · `inspected-present`. The projector allocates a direction scope before it omits hidden markup. A chapter with an estimated 79,999 live nodes then incurs two scratch nodes, exceeds 80,000, and falls back even though no retained text needs the probe. Below the cap, the same hidden declaration can start a needless pre-display scan. Visible Auto can legitimately need the scratch space. [declaration handling](../../../../packages/epub/src/document/xhtml-projector.ts#L802) · [capacity assessment](../../../../apps/desktop/src/reader/large-chapter-rendering.ts#L189) · [resolver](../../../../apps/desktop/src/reader/semantic-auto-direction.ts#L195)

### VF-0098

**Watchdog can strand private audio.** P3 · Benchmark · `inspected-present`. The worker writes WAV data before it commits candidate metadata. Forced exit skips its exception cleanup. The parent maps the watchdog to generation failure and does no rollback. A same-ID retry can fail creating the existing candidate directory and delete the session on that failed retry. The timeout fixture checks process exit, and explicit operator cleanup remains available. [watchdog mapping](../../../../services/tts/benchmarks/quality_cli.py#L123) · [worker mutation and cleanup](../../../../services/tts/benchmarks/quality.py#L269) · [existing timeout fixture](../../../../services/tts/tests/test_benchmark_quality.py#L114)

### VF-0099

**Official v5 work precedes the lineage check.** P3 · Benchmark · `inspected-present`. A syntactically valid, wrong authority SHA can enter the binding, pass otherwise eligible execution preflight and consume the reservation. The strict frozen-commit and ancestry checks run at derivation, after worker acquisition. The wrong summary still fails. This requires an otherwise eligible clean checkout. The earlier documented wasted run involved v4. [official dispatch](../../../../services/tts/benchmarks/dual_worker_cli.py#L467) · [shape check](../../../../services/tts/benchmarks/dual_worker_command.py#L104) · [late authority](../../../../services/tts/benchmarks/v5_authority.py#L460)

### VF-0100

**Remembered installer destination escapes preflight.** P2 · Release · `inspected-present`. Both Windows validators check the default destination and pass only `/S`. The pinned current-user installer can restore a previously chosen custom directory. A stopped installation there can be modified. With only a remembered path, standalone cleanup can restore the user's data while the validation install survives elsewhere. The ordinary runner can instead retain a backup when its expected uninstaller is missing. [standalone admission](../../../../scripts/test-windows-package-lifecycle.ps1#L61) · [ordinary admission](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1188) · [shared launch](../../../../scripts/windows-package-lifecycle-installer.ps1#L99) · [pinned NSIS initialization](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.3/crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi#L474-L493) · [standalone finalization](../../../../scripts/test-windows-package-lifecycle.ps1#L391)

### VF-0101

**Standalone receipt can credit an unexercised installer.** P2 · Release · `inspected-present`. The standalone runner hashes the source file before and after the lifecycle, but launches each phase via that mutable path. Temporary substitution followed by restoration can pass both comparisons if the intervening installer satisfies the other checks. Persistent drift is detected. The ordinary validator uses its own artifact copy. [standalone launch](../../../../scripts/test-windows-package-lifecycle.ps1#L175) · [final sample](../../../../scripts/test-windows-package-lifecycle.ps1#L433) · [persistent-drift fixture](../../../../apps/desktop/scripts/windows-release.node-test.mjs#L525) · [Ordinary snapshot use](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1220)

### VF-0102

**Obsolete rate fallback after paused final audio.** P3 · Product · `inspected-present`. If device end retires the final unit while paused, the scheduler can still report Paused when pending slow-rate preparation rejects. The fallback count can trigger a persisted 100% choice without a successor. Resuming to completion before rejection takes the protected branch. Retiring work on every Pause would also discard legitimate successor preparation. [device end](../../../../apps/desktop/src/tts/pcm-playback.ts#L447) · [paused scheduler](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1044) · [fallback save](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2252) · [Rate-attempt settlement](../../../../apps/desktop/src/tts/pcm-playback.ts#L860)

### VF-0103

**Buffered time can be undercounted or overcounted.** P3 · Product · `inspected-present`. A short refill can begin and finish between two playing samples while the underrun counter increments. Conversely, sampling buffering and resuming early in the next interval can charge the whole interval. The metric integrates the previous sampled phase. Positive process-side time, device silence and the external runner's stopwatch are separate measurements. [player end](../../../../apps/desktop/src/tts/pcm-playback.ts#L487) · [interval sampling](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2294) · [Refill transition](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1044)

### VF-0104

**Interrupted journal publication blocks retry.** P3 · Benchmark · `inspected-present`. The writer creates the final record exclusively, then writes its bytes. An interruption can leave `restored.json` empty or partial. A same-request retry sees the file, decodes it and fails even if power settings match the original. A partial consumed or settled record can obstruct the earlier journal checks as well. The derivation guard still fails closed. [ADR-0076](../../../architecture/decisions/ADR-0076-prospective-benchmark-safety-evidence.md) · [writer](../../../../services/tts/benchmarks/benchmark_safety.py#L95) · [finalization read](../../../../services/tts/benchmarks/benchmark_safety.py#L335) · [claim and settlement](../../../../services/tts/benchmarks/benchmark_safety.py#L240)

### VF-0105

**v14 loses a warm-up privacy failure.** P3 · Benchmark · `inspected-present`. The isolated adapter redacts the diagnostic and reports a typed privacy error. The controller preserves that code only for a measured call. A warm-up-only detection becomes generic generation failure, and with valid settlement/restoration the derived privacy audit can say pass. The overall machine evaluations still fail. The worker retains its diagnostic redaction. [isolated detection](../../../../services/tts/benchmarks/isolation.py#L228) · [phase condition](../../../../services/tts/benchmarks/batch_execution.py#L252) · [Official failure handling](../../../../services/tts/benchmarks/batch_official.py#L1234) · [derived field](../../../../services/tts/benchmarks/batch_result.py#L368)

### VF-0106

**Fresh Play can use superseded hardware admission.** P2 · Product · `inspected-present`. Play passes its initial compatibility check, then awaits runtime availability. A visibility-triggered check can publish Checking while retaining the previous IDs. The final dispatch compares those IDs and can start the native child before the new result arrives. Runtime package verification and later reconciliation still operate. No inference, device exhaustion or late audio follows necessarily. [visibility trigger](../../../../apps/desktop/src/tts/hardware-compatibility-check-binding.ts#L22) · [checking snapshot](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L370) · [dispatch gate](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1969) · [Applicable admission query](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L415)

### VF-0107

**Attachment can certify a missing checksum.** P2 · Release · `inspected-present`. The fresh build writes JSON and promotes authority before writing the checksum. If the last write fails, the original command fails. With otherwise valid receipts, later attachment can validate the executable, installer, and authority yet claim the gates passed with a missing or stale checksum. It only records the checksum filename. [publication order](../../../../scripts/build-windows-release.ps1#L291) · [attachment](../../../../scripts/build-windows-release.ps1#L169) · [Evidence writer](../../../../apps/desktop/scripts/windows-release.mjs#L748)

### VF-0108

**Central directory order changes admission.** P3 · EPUB · `inspected-present`. A running declared compression ratio can exceed its limit for a prefix even when the complete archive satisfies it. Reordering central-directory entries alone changes the opening decision. The separate live read and size limits still apply. Compare equivalent physical contents with unused entries so actual decompression work is equal. [inventory](../../../../packages/epub/src/archive/archive-inventory.ts#L598) · [declared budget](../../../../packages/epub/src/security/processing-budget.ts#L150) · [Observed read accounting](../../../../packages/epub/src/security/processing-budget.ts#L215) · [ingestion contract](../../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L70)

### VF-0109

**Empty CDATA costs an extra XML node.** P3 · EPUB · `inspected-present`. Pinned Saxes 6.0.0 calls its CDATA handler for an empty section. VoxLeaf filters empty text callbacks and charges every CDATA callback, contrary to M003's nonempty rule. At the exact node cap an empty section can make the same otherwise admissible document fail. Place the comparison at an existing markup boundary to isolate adjacent text callbacks. [M003 accounting](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L722) · [adapter callbacks](../../../../packages/epub/src/xml/xml-event-reader.ts#L448) · [existing limits fixture](../../../../packages/epub/src/xml/xml-event-reader.test.ts#L426)

### VF-0110

**Warm continuation loses an ampersand's left context.** P3 · Product · `inspected-present`. An eight-segment preparation batch can cut after whitespace immediately before a prose ampersand. Starting the next warm window there removes the preceding word and separator required by the bilingual rule. Cold preparation reconstructs that context from the same leaf. The differing prepared text is supported independently of how a given voice pronounces it. [symbol predicate](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L647) · [warm selection](../../../../packages/epub/src/narration/narration-preparation.ts#L655) · [Continuation storage](../../../../packages/epub/src/narration/narration-preparation.ts#L991)

### VF-0111

**A padded scene ornament loses its silence.** P3 · Product · `inspected-present`. A supported ornament can follow a full 4,096-token slice of nonbreaking spaces. The next slice begins mid-paragraph, so whole-paragraph scene recognition fails. Chatterbox can receive punctuation and Piper can skip the material without the scene boundary flag. A wholly recognized scene keeps the existing behavior. Acoustic effects remain unmeasured. [M005](../../../plans/completed/M005-narration-text-preparation.md#L1051) · [scene predicate](../../../../packages/epub/src/narration/narration-segment-packer.ts#L768) · [Piper handling](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2134) · [Window advancement](../../../../packages/epub/src/narration/narration-preparation.ts#L945)

### VF-0112

**Acquisition has weaker staging ownership checks.** P2 · Product · `inspected-present`. Ordinary reconciliation and explicit Remove validate managed ancestry. Confirmation Cancel, Download setup and postcommit Check share a weaker staging helper. With pre-existing invalid intermediate ancestry, those actions cannot establish ownership of the intended staging location before cleanup or creation. Preserve consent, normal missing directories, the verified installation and refusal before mutation. [DCR-19](../../../plans/completed/deep-chat-audit-minimal-corrections.md#L101) · [staging guard](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L823) · [Download](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2266) · [Cancel](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2440)

### VF-0113

**Implicit paragraph loses break language.** P3 · Product · `inspected-present`. Text under a Spanish inert block keeps Spanish, while the synthesized paragraph can inherit French from its outer collector. Its line break then becomes unknown to normalization and a supported Spanish discretionary-hyphen join fails. An explicit Spanish paragraph with an ordinary break is a positive control. An authored language change on the break has a separate projection issue in VF-0128. [paragraph metadata](../../../../packages/epub/src/document/xhtml-projector.ts#L1411) · [break token](../../../../packages/epub/src/narration/narration-source-window.ts#L593) · [join guard](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1872) · [Boundary capture](../../../../packages/epub/src/document/xhtml-projector.ts#L1560)

### VF-0114

**Load-time provider loss receives warm-up recovery.** P3 · Product · `inspected-present`. The v7-bound child can detect actual CUDA unavailability after admission. Its local error also covers unrelated load failures. The generic wire code becomes InternalFailure and the combined Prepare action offers Restart after verified containment. Confirmed provider loss calls for selection or recheck. A generic model-load failure still legitimately takes the existing recovery path. [v7 source binding](../../../../services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py#L97) · [native mapping](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1329) · [recovery policy](../../../architecture/tts-support-matrix-v1.md#L61) · [renderer mapping](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L326)

### VF-0115

**First completed scorecard can be unusable.** P3 · Benchmark · `inspected-present`. The v6 form and submit command permit an entire required dimension to be N/A across all samples. The immutable completed card then exists, but aggregation requires a numeric value for every dimension. Resubmission is blocked and the supported classification correction cannot supply scores. Per-sample N/A remains valid. [Frozen v6 requirements](../../../../benchmarks/tts/profile-v6.json#L183) · [completed write](../../../../services/tts/benchmarks/quality.py#L524) · [scorer](../../../../services/tts/benchmarks/quality_scoring.py#L60) · [V6 derivation contract](../../../../services/tts/benchmarks/cpu_fallback_result.py#L392)

### VF-0116

**CPU derive drops its retryable busy result.** P3 · Benchmark · `inspected-present`. A held quality-session lock is rejected before mutation. The v6 library reports `quality-busy`, while the public derive CLI only preserves `quality-stale` and prints `invalid-request` for busy. The overlap fixture prints the library code directly. The separate generic envelope for the quality CLI is intentional under ADR-0077. [ADR-0077](../../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#L36) · [public serializer](../../../../services/tts/benchmarks/cpu_fallback_result_cli.py#L100) · [library fixture](../../../../services/tts/tests/test_benchmark_quality.py#L791)

### VF-0117

**Denied correction can escape the CLI receipt.** P3 · Benchmark · `inspected-present`. On an admitted correction, aggregate unlink precedes publication. If unlink raises an OS error, the library leaves the old aggregate intact, but the public command catches only its two local typed errors. A traceback can replace the fixed JSON receipt and include local path information. The existing fixture tests the library exception and successful retry. [unlink](../../../../services/tts/benchmarks/quality.py#L589) · [CLI](../../../../services/tts/benchmarks/quality_cli.py#L192) · [library fixture](../../../../services/tts/tests/test_benchmark_quality.py#L654) · [Receipt contract](../../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#L36)

### VF-0118

**Known unwritable profile can stop Piper.** P2 · Product · `inspected-present`. An existing oversized profile preference is recognized at read time. The compatibility snapshot and optional activation UI still admit the choice. With Chatterbox installed, activation can stop healthy Piper and then lose the reversible write to the same size check. The old preference survives. This assumes oversized persisted data, whose natural origin was not established. [writable state](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L620) · [teardown order](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L98) · [write guard](../../../../apps/desktop/src/persistence/hardware-profile-preference.ts#L197) · [fixture matrix](../../../../apps/desktop/src/settings/narration-settings-actions.test.ts#L282)

### VF-0119

**A valid escaped filename can prevent opening.** P2 · EPUB · `inspected-present`. OCF resolves a percent-escaped hash sign to a legal archive member. The BookV1 projection copies the decoded key into path fields that reject `#`, before locator construction. A supported auxiliary or raster manifest item can trigger this even if the reader never visits it. Preserve literal percent-looking names and fragment separation when choosing the representation. [EPUB filename rules](https://www.w3.org/TR/epub-33/#sec-container-filenames) · [OCF parser](../../../../packages/epub/src/paths/ocf-reference.ts#L97) · [projection](../../../../packages/epub/src/book/book-v1-projection.ts#L101) · [schema](../../../../packages/shared/schemas/book/v1.schema.json#L106)

### VF-0120

**Padded XML ID points navigation to chapter start.** P3 · EPUB · `inspected-present`. XML ID processing normalizes surrounding spaces. The projector retains the raw namespaced value, counts its uniqueness using that spelling, and the resolver misses the normalized fragment. A noninitial target can fall back to chapter start. Different raw spellings can also conceal a normalized duplicate. Keep literal XHTML `id` and existing saved locator identity distinct. [XML ID rule](https://www.w3.org/TR/xml-id/#processing) · [identity comparison](../../../../packages/epub/src/document/xhtml-projector.ts#L256) · [fallback](../../../../packages/epub/src/locator/target-resolver.ts#L280) · [anchor assignment](../../../../packages/epub/src/locator/locator-index.ts#L269)

### VF-0121

**Escape after a focused Settings button disappears.** P3 · Product · `inspected-inconclusive`. The button can be disabled and replaced during keyboard activation. Escape is handled on the dialog section, while the document guard acts only on an outside `focusin` target. A viewport reset without that event would bypass both. The fixtures do not establish where the installed WebView2 routes the next key. The handler gap is real. The end-to-end accessibility failure remains inconclusive pending a keyboard-only host witness. [conditional button](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L399) · [focus and keyboard handlers](../../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L295) · [R8-06 fixture](../../../../apps/desktop/src/settings/ReaderSettingsDialog.test.tsx#L725) · [Confirmation fixture](../../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts#L1015)

### VF-0122

**Settled rate failure can publish stale feedback.** P3 · Product · `inspected-present`. A future slower-rate preparation can reject before the coordinator consumes the counter. An explicit 100% choice between rejection and the next tick clears the warning and saves. That tick consumes the older count, restores the warning, and saves 100% again. The numeric choice and current audio survive. Existing fixtures exercise different event orders. [player control](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L1489) · [product control](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L700) · [consumer](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2252) · [Explicit selection](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L758)

### VF-0123

**Refill timing can miss or mispair an interval.** P3 · Benchmark · `inspected-present`. After observing depletion the runner awaits two resource probes and only then starts the refill stopwatch. A resumption during the probes can nearly disappear. If another depletion follows, the subsequent playing observation can close the wrong interval. The stable arm checks counters. Historical Qwen durations and the size of any error remain unverified. [native timer](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1882) · [published fields](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L2384) · [Depletion observation](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L982)

### VF-0124

**Cleanup can pass the active-cancellation meter.** P3 · Benchmark · `inspected-present`. Generating is observed in one driver call and Stop is issued in another. Normal completion between them can still satisfy idle, zero retention, highlight and checkpoint checks. Those are valid cleanup witnesses. A timed active cancellation needs the terminal native cancellation receipt for the same request and Stop. [adaptive arm](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1942) · [model-free control](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L3365) · [Typed receipt validation](../../../../apps/desktop/src/tts/process-client.ts#L495)

### VF-0125

**Reflow timers do not witness realignment.** P3 · Benchmark · `inspected-present`. The native timer stops after three animation frames and Chromium after two. Neither checks that the scale changed or that the same locator settled at the reading line. A no-op or late placement can meet the measured 250 ms gate. Separate functional geometry coverage cannot supply the timestamp for this run. [Performance budget](../../../architecture/performance-budget.md#L76) · [native timer](../../../../apps/desktop/scripts/native-smoke/reader-scenarios.mjs#L1182) · [Chromium timer](../../../../apps/desktop/tests/browser/reader-performance.benchmark.spec.ts#L898) · [functional geometry control](../../../../apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts#L928)

## Additional findings

### VF-0126

**Chatterbox can fail before speech after a long silent prefix.** P2 · Narration · `inspected-present`. A supported current Chatterbox passage can begin with 320 nonbreaking spaces followed by one spoken character. The first candidate that contains speech spans 321 source positions. All the earlier candidates are silent and the profile's hard bound is 320. When no candidate fits, the packer drains safe leading omissions only for the Piper v2 policy. Public Chatterbox preparation therefore returns a resource-limit failure before synthesis.

CFR-20 fixed this trigger for Piper in VF-0020. VF-0052 covers Piper formatting marks. Preserve both earlier controls and both profiles' hard limits. Compare 319 and 320 spaces before the same character, an entirely silent leaf, a substantive protected unit, and the returned source offset after draining. [Chatterbox limit](../../../../packages/epub/src/narration/narration-chatterbox-policy.ts#L8) · [candidate selection](../../../../packages/epub/src/narration/narration-segment-packer.ts#L597) · [Piper-only drain](../../../../packages/epub/src/narration/narration-segment-packer.ts#L987) · [desktop preparation](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2110) · [CFR-20](../../../../docs/plans/completed/chat-findings-recovery-and-minimal-corrections.md#L81)

### VF-0127

**A known oversized language preference can interrupt narration.** P3 · Settings · `inspected-present`. The language repository recognizes an over-limit value and supplies the default language. The hardware snapshot still calls language persistence available and the Settings fieldset remains enabled. Selecting another language stops active Piper before the writer rejects the same bytes. The old language survives and the user has to start narration again.

This is a different key, control and action from VF-0118. The source proves avoidable teardown under an already-known rejection. Preserve the default language and existing stored bytes, valid language changes, contained teardown on a real change and the documented best-effort cross-key Reset. [stored state](../../../../apps/desktop/src/persistence/narration-language-preference.ts#L102) · [capability](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L637) · [language fieldset](../../../../apps/desktop/src/tts/HardwareCompatibilityControls.tsx#L209) · [action order](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L153) · [write refusal](../../../../apps/desktop/src/persistence/narration-language-preference.ts#L158)

### VF-0128

**An explicitly foreign line break can permit a Spanish word join.** P3 · Narration · `inspected-present`. In an explicit Spanish paragraph an author can put a different language on the break or on a flattened span surrounding just the break. The projector computes the new context but emits a contextless break. Narration gives that break the paragraph language. Two Spanish word fragments on either side can now pass the same-language guard and be incorrectly joined.

VF-0113 suppresses a valid join through the synthesized paragraph. This variant can create an invalid join even with an explicit paragraph. Preserve the break's effective language through projection and source traversal, its one-position width and locator ranges. Compare a break with inherited Spanish, an explicit foreign break and a flattened foreign span. [inheritance contract](../../../../docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L133) · [break construction](../../../../packages/epub/src/document/xhtml-projector.ts#L959) · [semantic break type](../../../../packages/epub/src/document/document-model.ts#L74) · [source token](../../../../packages/epub/src/narration/narration-source-window.ts#L593) · [language guard](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1872)

### VF-0129

**v6 calls a multi-evaluator quality session eligible.** P3 · Benchmarks · `inspected-present`. The public finalizer accepts one through eight evaluators for a staged v6 session. It consumes staging, makes the session ready and reports promotion eligibility for any count of at least one. With two complete numeric cards the aggregator repeats that eligibility. The frozen v6 derivation requires exactly one and rejects the result. An operator who follows the documented one-evaluator instruction avoids the discrepancy.

Distinct from VF-0115's score coverage. The mistaken input can be detected before moving any staged audio. Check a v6 count of two at finalization, a subsequent one-evaluator submission using the same staging, and a legitimate multi-evaluator legacy session. Existing frozen results are outside this trigger. [v6 authority](../../../../benchmarks/tts/profile-v6.json#L185) · [finalizer](../../../../services/tts/benchmarks/quality.py#L372) · [eligibility receipt](../../../../services/tts/benchmarks/quality.py#L458) · [aggregate](../../../../services/tts/benchmarks/quality.py#L693) · [derivation](../../../../services/tts/benchmarks/cpu_fallback_result.py#L398) · [operator instructions](../../../../benchmarks/tts/README.md#L261)

### VF-0130

**Malformed preflight fields can bypass the CLI failure receipt.** P3 · Benchmarks · `inspected-present`. In an otherwise correctly shaped v6 assess or derive request, a non-string candidate ID raises the shared preflight parser's `CommandError` before host observation. The CPU CLI catches its own command/result error types and misses this one. Quality generate likewise calls the shared parser before its worker error boundary. These configured commands can emit a Python traceback and omit their fixed JSON error receipt.

VF-0116 concerns a valid busy result after admission. VF-0117 concerns filesystem denial during an admitted correction. This case needs neither a retained session nor a working model. Translate the known parser error at each public boundary, preserve `quality-stale` and busy semantics, and check the JSON, exit code and stderr for both valid outer shapes with the wrong inner type. [configured entry points](../../../../package.json#L51) · [shared exception](../../../../services/tts/benchmarks/cli.py#L94) · [parse and type check](../../../../services/tts/benchmarks/cli.py#L122) · [CPU caller](../../../../services/tts/benchmarks/cpu_fallback_result_cli.py#L54) · [CPU handler](../../../../services/tts/benchmarks/cpu_fallback_result_cli.py#L100) · [generation caller](../../../../services/tts/benchmarks/quality_cli.py#L125) · [quality handler](../../../../services/tts/benchmarks/quality_cli.py#L261)

### VF-0131

**Quick-start lead is sampled after playback starts.** P3 · Benchmarks · `inspected-present`. The host runner waits for Playing, separately waits for a highlight transition, then reads `data-narration-playable-ms`. The attribute exposes the scheduler's current effective listening duration. Consumption can lower it and newly accepted generation can raise it before the sample. The output labels that value `playableLeadAtStartMs`. A positive-value assertion cannot demonstrate the lead at start.

VF-0103 and VF-0123 measure refill duration. Define the intended start event, capture the same run's lead at that event or label the sample with its actual timing. Vary consumption and intervening generation independently. The existing start command-to-audible observation has a different owner. [live duration](../../../../apps/desktop/src/tts/adaptive-preparation.ts#L315) · [DOM value](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L88) · [WebDriver reads](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1358) · [reported field](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L2386) · [historical use](../../../../docs/plans/completed/M008-bounded-adaptive-prebuffering.md#L458)

### VF-0132

**Graceful shutdown can accept invalid trailing protocol output.** P3 · Runtime · `inspected-present`. Protocol v1 requires a whole active request to fail on extra or truncated records. Native graceful shutdown accepts the expected two state records, waits for process exit and returns those records without establishing that stdout ended cleanly. A faulty producer can therefore receive a successful graceful-shutdown result at the consumer. The ordinary pinned service produces the expected ending.

Promoted from one of the six observations. DCR-12 checked the separate Node host. Keep graceful frame validation bounded by the shutdown deadline and record process containment independently. Compare clean EOF with a faulty terminal stream after the expected pair. Whether every nonzero exit must itself invalidate a valid pair is a separate contract question. [protocol rule](../../../../docs/architecture/tts-service-protocol-v1.md#L76) · [shutdown command](../../../../docs/architecture/tts-service-protocol-v1.md#L93) · [native receipt](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1923) · [exit wait](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1097) · [ordinary producer](../../../../services/tts/src/voxleaf_tts/service.py#L237) · [prior Node scope](../../../../docs/plans/completed/deep-chat-audit-minimal-corrections.md#L94)

## Earlier unnumbered observations

| Observation | Current verdict and discriminator |
| --- | --- |
| Stop after an idle child has exited | **Consistent with current recovery policy.** A later exact-owner receipt can establish containment. ADR-0056 permits recovery of the particular completed-synthesis cancellation race and treats other failed cleanup paths conservatively. A general recovery change for idle crashes would need its own decision. [ADR-0056](../../../architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md#L43) · [Coordinator](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1574) |
| Globally fixed rendition with every item overridden to reflowable | **Intentional under M003.** Package classification follows its documented global fixed-layout exclusion. Effective-layout support for this case would expand the profile. Malformed package validation still precedes fallback. [M003](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L725) · [Classifier](../../../../packages/epub/src/package/package-document.ts#L1304) |
| Piper model and optional data on different volumes | **Contract unresolved.** The matcher uses the optional-data volume for both, and packaged Piper resolves its model beside the executable. Opposite free-space results can change admission in either direction. The original Piper matrix refers to application-volume space, while the later change explicitly defines the Chatterbox destination. The intended authoritative volume for Piper needs a decision. [Piper requirement](../../../architecture/tts-support-matrix-v1.md#L36) · [NCC-04](../../../plans/completed/narration-chatterbox-correctness.md#L20) · [Probe](../../../../apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs#L118) |
| Visible preference reflow following an unavailable passage | **State mismatch supported when visible settlement reaches the coordinator.** The callback can re-enable Play and retain the instruction to choose another passage. Offscreen and pending guards exclude other paths. Whether this geometry should unlock Play, which locator the next Play uses, and the actual mounted sequence remain open. [Reader](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L384) · [Coordinator](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L973) |
| Graceful shutdown accepts output after its terminal pair | **Framing gap registered as VF-0132.** The current normal producer returns cleanly. The separate observation about a nonzero exit code does not have an equally explicit rejection rule. [Current assessment](#vf-0132) |
| Physical silence before a delayed device-end callback | **Measurement open.** The player keeps the last frame until owned completion and evaluates successor availability at release as specified. Establish physical output timing separately before changing underrun accounting, transition timing or the heard checkpoint. [Player](../../../../apps/desktop/src/tts/pcm-playback.ts#L534) · [Pause policy](../../../architecture/playback-transition-pause-policy-v1.md#L44) |

## Other adjacent paths checked

- **Two installer validators on one Windows account.** The runners can independently claim the same temporarily absent data path. If one restores the original profile before the other's final cleanup, deletion authority can refer to the wrong directory. The completed validation plans specify single-owner sequential installer runs. This is a conditional host data-loss exposure under overlap. There is no evidence of loss in a sequential validation or on a real machine. If overlap must be tolerated, both entry points would need shared ownership through restoration. [Standalone claim](../../../../scripts/windows-package-lifecycle-data.ps1#L116) · [Restoration](../../../../scripts/windows-package-lifecycle-data.ps1#L175) · [Ordinary cleanup](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1091) · [Sequential workflow](../../../plans/completed/five-pass-audit-revalidation-and-corrections.md#L556)
- **Explicit Settings selection during an automatic probe.** Fresh Play has its own admission rule (VF-0106). Product guidance explicitly allows a successful settings choice during an outstanding probe, then applies fresh facts to that choice. A fixture also accepts that order. The difference between the radio group and the inactive package's Activate button remains a UI consistency question. [Product policy](../../../product/reader-settings-and-playback-controls.md#L152) · [Held-probe fixture](../../../../apps/desktop/src/tts/hardware-profile-compatibility.test.ts#L747)
- **Quality input negative controls.** A Boolean evaluator count is rejected by the library, and nonnumeric score entries other than the explicit N/A sentinel fail sanitation. These paths cannot establish the two-evaluator or all-N/A findings. [Finalizer validation](../../../../services/tts/benchmarks/quality.py#L372) · [Score decoder](../../../../services/tts/benchmarks/quality_scoring.py#L32)

## Closeout

The 33 original IDs were assessed individually. This pass adds seven registered candidates and records no same-ID reopening of a previously fixed trigger. VF-0126 specifically identifies a different active profile. None of the findings constitutes newly executed runtime evidence. Snapshot and change inspection used read-only Git and source reads. Verification of this report was limited to document structure, local source links, prior report identities and worktree scope. Only the findings registry, audit index and this report were updated.
