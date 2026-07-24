# Performance budget

## User-visible targets

The initial MVP budget is intentionally practical rather than real-time at all moments.

| Metric | MVP target |
|---|---:|
| Initial playable audio lead | Approximately 15 seconds before playback starts |
| Artificial wait after initial lead is ready | 0 seconds |
| Permitted buffering during sustained reading | Up to 5 seconds per minute |
| Cancellation acknowledgment | Target below 500 ms |
| Stale audio after seek or chapter change | 0 seconds played |
| Generated audio persistence | None by default |

Hardware requirements must be documented alongside benchmark results.

## Measurements

### Startup latency

Measure wall-clock time from the accepted play command until the first audio frame is audible. Record model loading, warm-up, and initial generation separately. Fifteen seconds refers to the duration of playable audio accumulated before playback, not an allowed or required wall-clock delay.

Playback should start immediately when the initial lead threshold is satisfied. Benchmarks must report both wall-clock startup latency and playable buffer depth at that moment so a fast model is not made to wait unnecessarily.

### Real-time factor

```text
RTF = generation time / generated audio duration
```

Report warm and cold values. Sustained reading should ideally remain below 1.0.

### Buffer depth

Track seconds of playable audio available, not only the number of chunks.

### Underruns

Count each transition from playing to involuntary buffering and record its duration without recording book text.

### Cancellation latency

Measure from cancellation request until the generator stops producing frames for the cancelled session.

### Memory

Track model memory separately from text queues and audio buffers.

## Visual-reader reference limits

Task 1.6 established implementation acceptance gates for the visual reader from a synthetic Chromium prototype. These are not universal end-user guarantees or minimum-hardware requirements. Task 3.6 remeasures the production React renderer on the same Chromium/reference-host boundary. Task 5.3 supplies the broader native WebView2 interaction and restoration matrix; Task 5.4 adds repeated production lifecycle stress plus packaged WebView2 performance/resource evidence.

The accepted large-chapter policy is one active spine document rendered incrementally in batches of at most 250 semantic blocks, yielding to the browser between batches. Before rendering, the desktop must reject a chapter that contains more than 10,000 semantic blocks or projects to more than 80,000 live DOM nodes. Exact limits are accepted; 10,001 blocks or 80,001 projected nodes produce the recoverable `chapter-too-large` state without a partial chapter and preserve the last valid locator. General window virtualization is deferred because the measured bounded strategy is sufficient and does not create a new accessibility, focus, find-in-page, or restoration boundary.

On the Task 1.6 reference host, the exact-limit incremental fixture must satisfy:

| Reader metric | Accepted maximum | Observed at 10,000 blocks |
| --- | ---: | ---: |
| First useful 250-block batch | 50 ms | 9.7 ms |
| Longest batch script work | 16 ms | 12.8 ms |
| Deep target ready and aligned | 1,000 ms | 587.8 ms |
| Complete incremental append | 1,000 ms | 654.3 ms |
| Preference reflow and realignment | 250 ms | 132.5 ms |
| Live DOM nodes | 80,000 | 78,123 |
| DOM-only Chromium working-set increase | 144 MiB | 111.8 MiB |

Rendering all 10,000 blocks in one operation consumed 124.3 ms of uninterrupted script work, so a complete synchronous commit is rejected even though its total elapsed time was shorter. At 20,000 blocks, incremental rendering reached 156,251 DOM nodes, 20.7 ms maximum batch work, 1,213.4 ms target readiness, 263.8 ms reflow, and 182.7 MiB working-set growth. The 50,000-block stress sample reached 390,623 DOM nodes and 425.9 MiB working-set growth. These measurements support the 10,000/80,000 ceiling; they do not authorize rendering up to the EPUB ingestion package's 200,000-block publication-wide maximum.

ADR-0010's static-raster safety limits remain the reader image limits: one concurrent decode, at most eight live sources, and at most 16,777,216 aggregate decoded pixels. Eight sequential synthetic 1,448 × 1,448 PNG decodes exercised 16,773,632 live pixels in 64.4 ms with an 80.9 MiB Chromium working-set increase. The accepted reference gates are 150 ms total decode time and 112 MiB working-set increase for that near-cap fixture. The combined 10,000-block/eight-image fixture observed 78,132 DOM nodes and a 174.8 MiB increase; its accepted reader-wide working-set increase is 208 MiB.

The reference host was native Windows 11 Home Single Language version `10.0.26200`, build `26200`, with an Intel Core Ultra 7 255HX (20 logical processors), 33,752,997,888 bytes of RAM, NVIDIA GeForce RTX 5060 Laptop GPU plus Intel Graphics, Node.js `24.18.0`, pnpm `11.15.1`, Playwright `1.61.1`, and Chrome for Testing `149.0.7827.55` / Chromium revision `1228`. The benchmark does not claim which display adapter Chromium used.

Task 3.6's production React case opens a repository-authored exact-limit EPUB, holds the scheduler after its synchronous first 250-block commit, then observes all 39 remaining callback-to-DOM commits. On the same reference boundary, the final accepted run measured 7.2 ms maximum batch work, 795.1 ms deep-target readiness, 761.2 ms incremental append, 101.3 ms preference reflow, 50,167 additional Chromium DOM-counter nodes, 127.5 MiB post-first-batch incremental renderer working-set growth, and 160.6 MiB full open-publication/application growth. The incremental measurement remains below the 144-MiB DOM-work ceiling, while the complete application delta remains below the 208-MiB reader-wide envelope. File selection to first content measured 128.5 ms but includes browser file transfer, identity hashing, EPUB ingestion, capacity preflight, render-plan creation, and the first React commit; it is recorded rather than compared with the 50-ms renderer-only prototype gate. No title, prose, identifier, path, URL, bytes, or source fragment enters the report.

Task 5.4 extends the production Chromium benchmark with six open/navigation/image/close cycles and one over-limit-to-valid recovery. On the reference host, every close left zero active application-created Blob URLs, `ResizeObserver` instances, or `IntersectionObserver` instances; closed DOM count stayed constant; first-to-last closed heap growth was 1,044,824 bytes and working-set growth was 7,667,712 bytes. Namespace inspection retained only the two approved bounded keys, and storage writes stopped after lifecycle settlement.

The packaged WebView2 companion benchmark measures the same exact-limit reader plus six restart-free open/restore/chapter/image/close cycles in one isolated application session. The accepted run measured 10.6 ms maximum scheduler callback, 8.8 ms maximum batch commit, 282.6 ms deep-target readiness, 303.4 ms incremental append, 102.4 ms preference reflow, 50,165 additional DOM nodes, and 155,119,616 bytes of complete application/driver-tree working-set growth. Selection to first content was 159.9 ms and is recorded rather than compared with the renderer-only 50-ms prototype gate. Restored representative opens measured 74.9-201.3 ms and chapter navigation measured 35.0-63.4 ms. Every close retained zero reader DOM nodes, observers, and Blob URLs; first-to-last closed heap growth was 555,152 bytes and working-set growth was 6,418,432 bytes.

Native DOM and heap values come from the page-scoped WebView2 DevTools protocol. Working set sums only the known `tauri-driver` process and its recursively discovered children by numeric PID/parent-PID relationship; the query does not read or emit command lines, executable paths, window titles, or unrelated process data. Both benchmark reports remain content-free.

Run the hardware-specific benchmark from native Windows PowerShell after the explicit Playwright browser installation:

```powershell
pnpm.cmd test:browser:install
pnpm.cmd benchmark:reader
pnpm.cmd benchmark:reader:native
```

Both commands are intentionally outside `pnpm.cmd check` and CI. The Chromium command builds the shared/EPUB packages, starts the production Vite application, launches fresh browsers for standalone fixtures, and runs production exact-limit and lifecycle cases. The native command builds the release executable and launches it with the same isolated WebView2/driver boundary used by the native startup smoke. They use only repository-authored synthetic text and generated local PNGs, record counts/timings/heap/working-set values, disable browser artifacts, and log no publication content, paths, URLs, bytes, or private data. Task 3.6 records selection-to-first-content and production commit/target/append/reflow/memory evidence. Task 5.3 supplies real locator restoration and native WebView2 interaction evidence; Task 5.4 supplies browser and native lifecycle/resource stress. These hardware-specific commands are not universal end-to-end guarantees.

## Narration-preparation limits

No Milestone 5 text-preparation limit or performance result is accepted yet, and production implementation has not started. The approved [Milestone 5 ExecPlan](../plans/active/M005-narration-text-preparation.md) assigns Task 1.3 to accept a versioned profile for source work, segment size, batch size, parser lookahead, retained intermediate state, and cancellation-checkpoint distance using deterministic synthetic evidence.

Those gates must use explicit Unicode-code-point, UTF-8-byte, segment, sentence, and bounded-work measurements rather than JavaScript UTF-16 length or a hardware-dependent timing claim. Optional wall-clock observations remain informational. The approximately 15-second initial audio lead is an audio-playback policy and must not be converted into a narration-text size target.

## Initial buffering policy

A starting implementation may use:

- Initial playable buffer: approximately 15 seconds.
- Low-water mark: approximately 8 seconds.
- Target buffer: approximately 30 seconds.
- Maximum buffer: approximately 60 seconds.

These are hypotheses. Benchmarks should determine final values.

The initial threshold may eventually adapt to measured inference speed, but the MVP must not implement a fixed 15-second timer or confuse generated audio duration with elapsed generation time.

## Benchmark reporting

Store summarized, reproducible benchmark reports in Git. Do not commit:

- Proprietary book text.
- Raw generated audio.
- Model weights.
- Machine-specific traces containing private paths.
- Very large raw profiling artifacts.
