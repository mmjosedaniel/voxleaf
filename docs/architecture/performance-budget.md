# Performance budget

## User-visible targets

The initial MVP budget is intentionally practical rather than real-time at all moments.

| Metric                                       |                                      MVP target |
| -------------------------------------------- | ----------------------------------------------: |
| Quick-start playable audio lead              | Approximately 15 seconds before playback starts |
| Low-water warning                            |                     10 playable seconds or less |
| Automatic refill/resume target               |                               1 playable minute |
| Explicit prepared-playback targets           |                 1, 2, 5, or 10 playable minutes |
| Constrained-demo simultaneous audio ceiling  |    Exactly 43,200,000 24-kHz mono sample frames |
| Artificial wait after initial lead is ready  |                                       0 seconds |
| Permitted buffering during sustained reading |                      Up to 5 seconds per minute |
| Cancellation acknowledgment                  |                             Target below 500 ms |
| Stale audio after seek or chapter change     |                                0 seconds played |
| Generated audio persistence                  |                                 None by default |

Hardware requirements must be documented alongside benchmark results.

## Measurements

### Startup latency

Measure wall-clock time from the accepted play command until the first audio frame is audible. Record model loading, warm-up, and initial generation separately. Fifteen seconds refers to the duration of playable audio accumulated before playback, not an allowed or required wall-clock delay.

Quick-start playback should begin immediately when the initial lead threshold
is satisfied. Prepared playback is a separate explicit choice and may wait for
1, 2, 5, or 10 playable minutes. Benchmarks must report wall-clock preparation
time and playable buffer depth so a fast model is not made to wait
unnecessarily and a slow model's preparation cost remains visible.

### Real-time factor

```text
RTF = generation time / generated audio duration
```

Report warm and cold values. Sustained reading should ideally remain below 1.0.

### Buffer depth

Track seconds of playable audio available, not only the number of chunks.

### Underruns

Count each transition from playing to involuntary buffering and record its duration without recording book text.

Record intentional adaptive paragraph/chapter waits separately. They are
listening-policy time, not underruns and not evidence that generation is real
time.

### Cancellation latency

Measure from cancellation request until the generator stops producing frames for the cancelled session.

### Memory

Track model memory separately from text queues and audio buffers.

## Visual-reader reference limits

Task 1.6 established implementation acceptance gates for the visual reader from a synthetic Chromium prototype. These are not universal end-user guarantees or minimum-hardware requirements. Task 3.6 remeasures the production React renderer on the same Chromium/reference-host boundary. Task 5.3 supplies the broader native WebView2 interaction and restoration matrix; Task 5.4 adds repeated production lifecycle stress plus packaged WebView2 performance/resource evidence.

The accepted large-chapter policy is one active spine document rendered incrementally in batches of at most 250 semantic blocks, yielding to the browser between batches. Before rendering, the desktop must reject a chapter that contains more than 10,000 semantic blocks or projects to more than 80,000 live DOM nodes. Exact limits are accepted; 10,001 blocks or 80,001 projected nodes produce the recoverable `chapter-too-large` state without a partial chapter and preserve the last valid locator. General window virtualization is deferred because the measured bounded strategy is sufficient and does not create a new accessibility, focus, find-in-page, or restoration boundary.

On the Task 1.6 reference host, the exact-limit incremental fixture must satisfy:

| Reader metric                          | Accepted maximum | Observed at 10,000 blocks |
| -------------------------------------- | ---------------: | ------------------------: |
| First useful 250-block batch           |            50 ms |                    9.7 ms |
| Longest batch script work              |            16 ms |                   12.8 ms |
| Deep target ready and aligned          |         1,000 ms |                  587.8 ms |
| Complete incremental append            |         1,000 ms |                  654.3 ms |
| Preference reflow and realignment      |           250 ms |                  132.5 ms |
| Live DOM nodes                         |           80,000 |                    78,123 |
| DOM-only Chromium working-set increase |          144 MiB |                 111.8 MiB |

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

Task 1.3 accepts the model-independent, test-only
[`narration-v1` preparation profile](narration-preparation-limits-v1.md).
Tasks 2.1-2.2 implement pure exhaustive source traversal and code-point
source-span tokens. Task 2.3 enforces the source-window subset in production:
canonical structural start resolution, at most 16,384 inspected source code
points, at most 4,096 retained token/event entries, depth 128, cancellation
checks at the 512-work-unit target, and injected deterministic yields at the
4,096-work-unit target. Tasks 3.1-3.4 retain exactly one nonempty text or typed
omission unit per bounded source token. Tasks 3.2-3.3 add bounded punctuation,
symbol, abbreviation, and numeric scanners and enforce the accepted hard
maximum of 16 output code points per source code point for closed Spanish
expansions. Task 3.3 also admits at most 128 code points of numeric parser
lookahead before returning the fixed resource-limit failure. Task 3.4 adds
composed-stream and content-free failure assertions. Task 4.1 visits each
normalized unit exactly twice while enforcing the 256-code-point protected-token
hard maximum. Tasks 4.2-4.3 use bounded prefix accounting and source-order scans
to enforce the 768-source-code-point, 640-narration-code-point, 2,048-byte, and
8-sentence per-segment maxima plus the 17-entry, 8,832-code-point, 26,624-byte,
and 4,096-unit retained ceilings. Packing uses the same deterministic
checkpoint/yield controller as source-window preparation and either splits an
oversized unprotected token at a legal Unicode-safe hard boundary or fails
content-free when an indivisible unit cannot fit. Task 4.4 validates a complete
packed block before publishing at most 17 deeply frozen locator-linked
segments and constructs one canonical source continuation without widening
the accepted retention bounds. Task 5.1 exposes the production
`OpenedPublication.prepareNarration` operation, enforces a caller request of
1-16 segments plus independent 8,192-code-point, 24,576-byte, and 64-sentence
batch ceilings, and retains at most one non-returnable stable lookahead.
Task 5.3 additionally caps each internal pack by the remaining aggregate
17-entry, 8,832-code-point, and 26,624-byte retained capacity and proves
numeric-only high-water bounds across repeated requests, cancellation, and
publication close.

The profile targets 320 narration code points / 1,024 UTF-8 bytes per segment,
eight segments per batch, cancellation checks every 512 work units, and a
deterministic yield every 4,096 work units. Its corresponding hard ceilings are
640 code points / 2,048 bytes per segment, 16 segments, 8,192 code points /
24,576 bytes per batch, 1,024 work units between checks, and 8,192 work units
between yields. Source inspection, sentence counts, parser lookahead, traversal
depth, protected tokens, normalization expansion, and retained intermediate
state have separate target and hard ceilings in the authoritative profile.

Focused tests use explicit Unicode-code-point, UTF-8-byte, segment, sentence,
retention, and bounded-work measurements. Exact maxima pass and max-plus-one
values produce one fixed content-free result. A 300-code-point astral sample
contains 600 JavaScript UTF-16 code units and 1,200 UTF-8 bytes, proving UTF-16
length is not the admission authority. Optional wall-clock observations remain
informational. The approximately 15-second initial audio lead is an
audio-playback policy and is not a narration-text size target.

These are deterministic algorithmic preparation limits, not model throughput,
speech-quality, wall-clock latency, heap-size, or hardware claims. A later
model-specific profile requires explicit local TTS evidence and a new
versioned decision; it must not silently change `narration-v1`, source-range
semantics, or privacy rules.

## Adaptive buffering policy

ADR-0015 approves these product-level boundaries for the constrained demo
plan:

- Quick-start threshold: approximately 15 playable seconds, or a complete
  shorter remaining range.
- Explicit prepared-playback targets: 1, 2, 5, or 10 playable minutes.
- Simultaneous maximum: approximately 30 playable minutes, additionally
  bounded by complete units, payload bytes, prepared text, and active work.
- Playback-only pause: generation may continue for the same active identity
  until backpressure or the maximum applies.
- Frontier behavior: warn at the frozen low-buffer threshold, then represent
  exhaustion as buffering rather than freezing or playing stale audio.
- Optional adaptive waits: one to three seconds only at eligible paragraph or
  chapter boundaries, measured separately from involuntary buffering.

M008 Milestone 1 freezes the exact values in
[`adaptive-buffer-authority-v1.md`](adaptive-buffer-authority-v1.md): 10-second
low water, 15-second quick start, one-minute refill, explicit 1/2/5/10-minute
prepared targets, and a 43,200,000-frame/172,800,000-byte/256-unit maximum
alongside prepared-text and active-work bounds. The initial threshold never
becomes a fixed 15-second timer. A prepared target or the 30-minute ceiling
cannot be described as a required default wait or proof of sustainable
generation. Milestone 2 adds a model-free scheduler proof: the frozen RTF
`1.467080448861599` depletes an exact 15-second synthetic lead after 47
playback seconds, while an RTF `0.5` trace remains supplied for 120 seconds
under the one-minute target. These deterministic traces do not load a model or
establish a real-time claim. The payload-owning buffer and player do not exist.

## Benchmark reporting

Store summarized, reproducible benchmark reports in Git. Do not commit:

- Proprietary book text.
- Raw generated audio.
- Model weights.
- Machine-specific traces containing private paths.
- Very large raw profiling artifacts.

Milestone 6's
[`tts-feasibility-profile-v2`](tts-feasibility-profile-v2.md) remains the
completed first-cycle authority for local TTS timing boundaries, process-cold and warm sample
counts, sample-derived duration/RTF arithmetic, nearest-rank percentiles,
cross-checked Windows/PyTorch memory observations, cancellation, blinded
Spanish quality scoring, and balanced/CPU numeric gates. It measures how
quickly 15 seconds of media is produced; it does not add a fixed wait or
implement playback. Its benchmark-local summary schema permits only
content-free allowlisted fields. The superseded `v1` authority remains
historical and cannot promote a `v2` result.

[`ADR-0013`](decisions/ADR-0013-no-viable-local-tts-engine-profile.md) and the
content-free [`selection-v2`](../../benchmarks/tts/selection-v2.md) matrix
record the first completed selection outcome. Qwen's measured balanced profile
failed warm first audio at 69.3758902 seconds, time to produce 15 seconds of
media at 92.8405388 seconds, shorter-complete latency, warm and sustained RTF,
zero-failure, cancellation, and complete-quality gates. Supertonic's measured
CPU profile failed warm first audio at 12.1658585 seconds, zero-failure,
cancellation, and complete-quality gates, although it produced 15 seconds of
media in 12.952202 seconds and passed the frozen RTF and memory ceilings. These
are exact-host feasibility observations, not new user-visible targets or
general hardware requirements. The initial playable-audio-lead, buffering, and
cancellation targets above remain unchanged and unimplemented.

The completed
[Milestone 6.1 blocker-resolution plan](../plans/completed/M006-001-local-tts-profile-blocker-resolution.md)
now has a content-safe Serena intake result and frozen
[`tts-feasibility-profile-v3`](tts-feasibility-profile-v3.md). `v3` inherits
the unchanged balanced timing/memory gates and WDDM/PyTorch method from `v2`,
adds the exact candidate identity and a mandatory incremental/cancellation
prototype stop gate, and remains evaluation-only. Qwen's
upstream family claim of
best-case latency as low as 97 ms is candidate-intake information only: it
does not establish VoxLeaf first audio, time to 15 seconds of media, sustained
RTF, cancellation, memory, or command-to-audible performance on the reference
host.

The later frozen development
[prototype result](../../benchmarks/tts/incremental-cancellation-prototype-result-v1.json)
passed the topology stop gate on the exact host. It delivered and released two
bounded complete-segment waveforms with one queued unit, published zero stale
units across all five cancellation races, terminated workers within 330.301
milliseconds, and completed cleanup within 1.030 seconds. Peak process-tree
RAM was 4,689,559,552 bytes and authoritative PyTorch peak-reserved VRAM was
5,440,012,288 bytes. Cold load was 8.367 seconds and the first complete
segment waveform after dispatch took 5.210 seconds. These are development
topology observations, not official warm-performance results: the 5.210-second
observation does not pass or replace the unchanged 3-second warm first-audio
gate, and complete-segment publication is not native frame streaming.

The subsequent official `v3` matrix confirmed that limitation. Warm first
audio p95 was 67.6685348 seconds, sustained-request RTF p95 was
1.5041296794871795, total sustained RTF was 1.4521558253532183, and three
mid-generation cancellation races failed. Cold start p95
(26.6606755 seconds), process-tree RAM (4,640,518,144 bytes), and authoritative
dual-source VRAM (6,286,802,944 bytes) passed their frozen ceilings. At the
measured total RTF, producing one minute of speech takes approximately 87
seconds, so an indefinitely long bounded buffer loses approximately 27 seconds
per minute. ADR-0014 originally permitted this exact profile only for a bounded
development demo. ADR-0015 now supersedes its scheduling and buffering details
without changing the normal startup, sustained-throughput, underrun, or
cancellation targets above.
The content-free
[`selection-v3`](../../benchmarks/tts/selection-v3.md) record applies those
failed gates and keeps the constrained demo exception separate from standard
profile promotion.

The `1.7B` model label is a parameter count, not a 1.7-GB VRAM requirement. The
frozen main model safetensors occupy 3,833,402,552 bytes and the speech
tokenizer safetensors occupy 682,293,092 bytes, for 4,515,695,644 bytes of
model artifacts. Runtime VRAM additionally includes loaded precision/layout,
activations, autoregressive state, decoder work, CUDA libraries and kernels,
temporary workspaces, allocator reserve, and host/driver accounting. The
official 6,286,802,944-byte peak is therefore the relevant measured capacity
observation. It is the maximum of baseline-adjusted WDDM dedicated memory and
PyTorch peak-reserved memory, not a claim that every byte was a live tensor.

[Milestone 6.2](../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md)
has frozen the separate
[`v4` authority](tts-feasibility-profile-v4.md) before testing whether one
resident model can generate two ordered 8–20-second semantic units in a shared
batch quickly enough to keep a bounded playback simulation supplied. The
simulation retains at most one active batch, two queued complete units, and
40 playable seconds; it starts at approximately 15 playable seconds or when a
shorter remaining range is complete. Shorter complete units may reduce
first-result latency but do not improve sustained RTF by themselves. The
evaluation must report aggregate batch RTF, startup lead, buffer drift,
underruns, RAM, VRAM, failures, order, cancellation, and cleanup. The unchanged
standard target remains sustained RTF at or below 0.8; a focused scheduling
result additionally requires aggregate RTF strictly below 1.0 and no more than
the existing five seconds of buffering per minute.

Full-GPU batch two is the primary experiment. CPU placement may be tested only
as a separately identified contingency after the frozen full-GPU memory stop.
The authority reserves 536,870,912 dedicated-VRAM bytes from the accepted
8,174,698,496-byte preflight observation, caps the engineering peak at
7,637,827,584 bytes, and forbids shared-GPU-memory use. Hugging Face documents
CPU offload as a capacity technique that transfers
layers to the accelerator when needed; it is expected to trade speed for
capacity rather than improve throughput. Generic layer offload is therefore
not the first contingency. A narrowly targeted speech-tokenizer/audio-decoder
placement still requires device-map, RAM, VRAM, transfer, failure, and timing
evidence before it can be considered viable.

The official full-GPU `v4` run stopped on that frozen rule after observing
79,691,776 bytes of shared GPU memory. Before the stop it observed a
4,432,904,192-byte authoritative VRAM peak, 4,633,399,296 bytes of process-tree
RAM, and 3,757,047,808 bytes of minimum free dedicated VRAM. Because all 36
measured first attempts were then recorded as failed and no media was admitted,
the result provides no aggregate RTF, startup, buffer, or short-unit duration
measurement. It admits the separate targeted-CPU contingency; it does not show
that offload is faster or viable.

The admitted targeted-CPU arm then moved only
`model.speech_tokenizer.model` and its wrapper device to CPU after the exact
CUDA load. Its schema-valid result reproduced the full-GPU
4,432,904,192-byte authoritative VRAM peak, 4,311,744,512-byte framework
reserve, 79,691,776-byte shared-GPU-memory observation, and
3,757,047,808-byte minimum free dedicated VRAM. It stopped before usable media
with all 36 measured first attempts failed and zero retries. This exact
placement therefore provides no capacity, throughput, startup, playback, or
quality evidence on the reference host and does not admit the listening arm.

The same Milestone 6.2 ExecPlan froze and executed a separate `v5` authority
rather than rewriting `v4`. CPU solo completed at aggregate RTF
`2.999443394476504`, while the same-authority GPU-solo baseline completed
446.24 seconds of media at aggregate RTF `1.467080448861599`. The official
concurrent arm stopped at the frozen `resource-limit` boundary before a
promotable result. A closed 256-token diagnostic identified the exact category
as `commit-headroom`.

After unrelated applications were closed, a second non-promotable diagnostic
completed all 40 units. It measured aggregate RTF `1.4291263397435898`,
GPU-worker RTF `2.3290592090374167`, CPU-worker RTF
`3.4522421854976506`, minimum commit headroom 7,641,972,736 bytes, minimum
available RAM 9,301,962,752 bytes, and peak combined process RAM
12,961,947,648 bytes. The approximately 2.6% aggregate improvement over GPU
solo remains slower than real time and substantially slows the GPU worker.
Accepted `selection-v5` therefore rejects CPU-only and dual-worker scheduling.

ADR-0015 retains one exact GPU worker only for a constrained adaptive demo.
Using GPU-solo RTF 1.467 as a planning estimate, not a user guarantee:

| Playable lead | Approximate preparation time | Approximate playback before frontier |
| ------------: | ---------------------------: | -----------------------------------: |
|    15 seconds |                   22 seconds |                           47 seconds |
|      1 minute |                 1.47 minutes |                          3.1 minutes |
|     2 minutes |                 2.93 minutes |                          6.3 minutes |
|     5 minutes |                 7.34 minutes |                         15.7 minutes |
|    10 minutes |                14.67 minutes |                         31.4 minutes |

At this RTF, sustained generation loses about 28 seconds of lead per minute of
playback. Short segments, a larger buffer, playback-only pauses, or occasional
one- to three-second boundary waits can improve startup or delay frontier
exhaustion; none makes the model real time. Thirty minutes of 24 kHz mono
float32 PCM is 172,800,000 payload bytes. M008 must freeze the complete
simultaneous duration, unit-count, byte, prepared-text, and active-work bounds
before implementation.
