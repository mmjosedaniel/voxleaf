# Troubleshooting

## Native development loop

### Tauri development exits with an `EBUSY` watcher error

On Windows, the native executable under
`apps/desktop/src-tauri/target/debug/deps` is locked while Cargo runs it. Vite
must not watch that native tree. The committed Vite configuration ignores
`apps/desktop/src-tauri/**`; Tauri and Cargo watch Rust sources independently.

Run the native loop from the repository root:

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop tauri dev
```

If the error still appears, stop every older VoxLeaf/Vite development session
with `Ctrl+C` and start one fresh session. Do not delete the native target tree
while an application or compiler process owns it.

### An opened EPUB remains on “Preparing the saved reader state”

React StrictMode intentionally performs an extra setup/cleanup probe in
development. Closing application-owned narration, position, restoration, or
publication resources during that probe leaves the second setup with closed
state and can strand restoration.

The application defers final ownership cleanup by one microtask and lets the
matching StrictMode setup supersede the probe cleanup. A real unmount has no
replacement setup, so resources are still closed promptly. If the reader
remains stuck with the current implementation, restart the development session
and run:

```powershell
pnpm.cmd --filter @voxleaf/desktop test
```

Treat another persistent restoration stall as a regression; do not bypass
restoration or clear private reader data merely to make the UI advance.

## Exact local narration profiles

The M008 narration path and M009 synchronized reader integration form a
constrained local path, not a production or general-hardware claim. Qwen
remains a development-only GPU profile. M010 admits and integrates
Piper/davefx as the sole supported CPU fallback. The final
[`tts-support-matrix-v1`](../architecture/tts-support-matrix-v1.md) records
the exact support states, host margins, and recovery limitations, while M011
still owns release packaging and license fulfillment. Both exact local
configurations are documented in [`setup.md`](setup.md).

### Narration controls are unavailable

Confirm all three native-only development variables are set in the PowerShell
process that launches or tests the application:

```powershell
$env:VOXLEAF_TTS_DEV_ENABLED = "1"
$env:VOXLEAF_TTS_DEV_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
$env:VOXLEAF_TTS_DEV_MODEL_ROOT = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
```

For Piper, set its separate exact keys instead:

```powershell
$env:VOXLEAF_TTS_PIPER_ENABLED = "1"
$env:VOXLEAF_TTS_PIPER_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/piper_1_4_2_cpu/.venv/Scripts/python.exe").Path
$env:VOXLEAF_TTS_PIPER_MODEL_ROOT = (Resolve-Path "models/tts/piper-1.4.2-es_ES-davefx-medium-0d907f1").Path
```

Run the application from that same PowerShell terminal. These values are
process-local; opening a new terminal or launching VoxLeaf elsewhere loses
them. The compatibility panel may still truthfully say that Piper fits the
hardware while product narration says the selected profile is not configured.
After the corrective M010 Milestone 6 gate, missing configuration disables
Play before child start instead of entering a misleading model-load restart
episode.

Each Python executable, verified ignored model root, outbound-blocking firewall
rule, `tauri-driver`, and matching EdgeDriver must already exist. The
model-free child is test infrastructure and must never be exposed as a
user-facing voice.

Run the focused host diagnostic before the full playback matrix:

```powershell
pnpm.cmd test:tts:exact-host
pnpm.cmd test:tts:adaptive-exact-host
pnpm.cmd test:tts:resilience-exact-host
```

These commands are Windows exact-host tests, excluded from normal checks and
CI, and must remain offline after artifact preparation. The combined
resilience command requires both exact profile configurations and firewall
rules.

### Compatibility is unavailable, unknown, or failed

The compact `Local narration compatibility` disclosure checks bounded local
host facts at application start, after an explicit recheck, after OS resume,
and immediately before the model child starts. `Unknown` means one or more
required facts could not be established; `failed` means the bounded probe
itself failed; `unavailable` means no admitted measured profile matches. None
of these states is a support claim.

Hardware matching and executable runtime configuration are separate checks.
After a profile matches the host, the desktop asks native supervision for one
boolean stating whether that exact profile can be constructed from its
verified local configuration. The renderer receives no paths, environment
values, or raw error. This check runs when product narration availability is
resolved and again immediately before child start.

For the exact development demo, the Qwen/Serena profile also requires the
native variables above and the frozen RAM, VRAM, storage, provider, precision,
and device-class margins. Closing unrelated GPU/RAM-heavy applications may
change available capacity; use `Check compatibility again` afterward. Rejected
Qwen/Aiden and Supertonic records are intentionally listed as unavailable and
cannot be selected. A compatible complete CPU report may recommend the
supported Piper/davefx fallback. If it remains unavailable, verify the Piper
native configuration, exact artifact hashes, CPU provider, and frozen RAM and
storage margins; do not force the preference.

Fallback is not automatic failover. Selecting another compatible profile first
invalidates and releases the current narration and then permits one new
service tree. After an operational failure, use only the one explicit recovery
action the UI offers for that closed episode; repeated recovery, protocol,
cancellation-timeout, or cleanup failures remain contained.

Do not edit local storage or bypass preflight to force a profile. VoxLeaf
persists only one bounded profile ID and revalidates it; it never stores the raw
host report. A changed or incompatible host must prevent the child from
starting.

An 8-GB NVIDIA device can report substantial free memory in `nvidia-smi` while
Windows exposes a smaller allocatable dedicated-memory budget to the
application. Qwen/Serena requires `7,196` MiB total dedicated VRAM and, only
for this explicitly gated development profile, `6,508` MiB currently
available: its measured `5,996`-MiB peak plus the frozen `512`-MiB engineering
reserve. If the UI says that the current free budget is below the safety
reserve, close unrelated GPU applications and select `Check compatibility
again`; otherwise use Piper. Do not substitute the vendor number or bypass
the matcher. This rule means only that VoxLeaf will or will not admit the
constrained development profile under the current observation—it does not
prove that Qwen is technically impossible on the GPU.

### Quick start takes longer than expected

Quick start means playback begins when approximately 15 playable seconds are
ready; it is not a 15-second wall-clock promise. For Qwen, the final M008 policy rerun
took 41.312 seconds from command to audible playback, while the later M009
synchronized matrix took 42.621 seconds with 16.240 playable seconds at start.
Cold load, complete-unit generation, navigation/restart work, and the need for
a second unit can all increase wall time.

Do not replace the playable-audio threshold with a timer. Use explicit prepared
playback when a longer initial wait is acceptable. Its initial selection is one
minute; the other admitted choices are 2, 5, and 10 minutes.

### Playback reaches the generation frontier

The exact Qwen worker is slower than real time. The final M008 policy rerun observed
one underrun and 19.49 buffering seconds per playback minute. The longer M009
synchronized matrix also observed one natural underrun/refill and measured
378.46 buffering seconds per playback minute. Both exceed the MVP target of at
most 5 seconds. VoxLeaf must warn below 10 playable seconds and show buffering
when audio reaches zero.

Prepared playback and playback-only pause may build more lead, but they do not
improve model throughput. The M008 adaptive low-buffer wait remains disabled
at `0` ms. M008.1's shorter semantic transition pauses are a separate
playback-rhythm feature and must not be counted as generated lead or improved
throughput.
The admitted Piper CPU fallback has separately passing faster-than-real-time
evidence and must be selected as its own profile, never as a simultaneous
second worker. Do not hide buffering or generalize either exact-host result.

### Adjacent generated passages sound joined

VoxLeaf sends bounded prepared segments to the selected engine and receives
one complete waveform per request. If punctuation sounds correct inside each
waveform but the last word of one unit runs directly into the next, the defect
is at playback transition rather than text normalization.

M008.1 schedules a frozen boundary-specific delay only when the next unit is
already buffered. Sentence, dialogue, paragraph, heading, scene, and terminal
ellipsis boundaries receive bounded separation; artificial hard/token splits
remain continuous. The player creates no silent PCM and applies no fade. If
the queue is empty, the observed buffering interval replaces the intended
transition delay, so a second pause must not occur when audio becomes ready.

The compact status reads “Brief pause between narration passages.” during the
scheduled interval. If joins remain gapless after rebuilding, confirm that the
completed prepared segment carries a nonzero semantic transition value. If
playback waits twice after an underrun, treat that as a scheduler defect.
Capture only fixed state, duration, sequence counts, and content-free metrics.

### Preparation stops after one or more playable units

For Piper, this used to occur when generic `narration-v1` preparation emitted
a long segment whose complete waveform exceeded protocol v1's 480,000-sample
(20-second at 24 kHz) unit maximum. The first `narration-piper-v1` correction
bounded ordinary prose by code points, bytes, and sentence count, but compact
numbers, currencies, acronyms, Roman numerals, ordinals, and letter sequences
could still expand into more than 20 seconds of speech below those limits.
Compatibility could still show Piper as available because host matching and
per-unit synthesis limits are separate checks.

The product now selects `narration-piper-v2` for Piper only. V2 preserves the
complete normalized text and locator ranges while applying a deterministic
spoken-expansion budget before inference. Rebuild and restart an older running
application before retesting. The fix does not rewrite text, truncate audio,
retry synthesis, or increase the protocol ceiling; an unusual output can
still fail closed.

If failure occurs exactly when the next bounded preparation batch begins, do
not assume Piper rejected the text. A valid non-empty fragment without a
recognized terminal sentence boundary has `sentenceCount: 0`. Older scheduler
code incorrectly rejected that non-negative M005 measurement after the first
16 prepared units. The corrected scheduler still requires positive narration
code-point and UTF-8-byte counts, but accepts zero sentence boundaries. Rebuild
and restart the application; no reader-state reset or EPUB change is required.

One bounded cause is an exact Qwen call that does not emit its codec stop token.
Its historical benchmark authority retains `maxNewTokens: 2048` so that
evaluation record remains unchanged, but that allowance can decode far beyond
protocol v1's 20-second unit ceiling. The product adapter therefore clamps
generation to 250 codec tokens: the pinned tokenizer expands each token to
1,920 samples, so the call cannot produce more than 480,000 samples at 24 kHz.

This clamp prevents a runaway call from continuing toward the native synthesis
timeout or returning an oversized waveform. It does not add automatic retry,
change the frozen benchmark result, or make the exact development profile a
production profile. A genuine engine failure still invalidates the active
identity and requires a fresh narration start; bounded explicit recovery is
owned by M010.

### Stop, navigation, or close interrupts narration

Explicit stop, locator changes, publication replacement/close, and application
exit intentionally invalidate old work before cancellation. Start a fresh
narration session after the new visual locator is settled. The service has no
automatic retry or queued synthesis; a failed or terminated worker requires an
explicit fresh start and prepare cycle.

If stale audio is heard, stop testing and treat it as a correctness defect.
Capture only content-free state, timing, counts, and fixed error codes. Never
attach book text, prepared narration, audio, model paths, process command lines,
or private raw logs to an issue.

### Narration restarts while scrolling or automatic following moves the reader

M009's exact-host diagnosis found that WebView2 could publish a late visual-
locator sample after automatic following. M009.1 exact-host use then confirmed
that treating intentional scrolling as automatic narration navigation was
also disruptive: inspecting another passage cancelled active work and restarted
preparation. The implemented reader now ignores background follow samples and
keeps ordinary wheel, touch, pointer, keyboard, and scrollbar inspection
separate from narration. Only an explicit paragraph leaf, visible-passage,
previous/next passage, or chapter action replaces narration.

If narration still restarts without user input, run the focused desktop
regressions before repeating the expensive exact-host matrix. Record only the
content-free phase, play intent, navigation-settling flag, service state,
retained/discarded counts, and fixed failure code. Identity-first cancellation
must still occur for every explicit narration target.

### Packaged synchronization smoke reports DOM or follow failure

The packaged synchronization proof must use a text-only synthetic narration
target. The comprehensive fixture's final paragraph also owns a deferred local
raster; scrolling that paragraph into view can legitimately mount the image,
change DOM geometry, and make `publicationDomUnchanged`, `followed`, and
`insideReaderViewport` fail together even when highlight registration works.

Run the current release smoke before diagnosing production highlighting:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:native-startup
```

If it still fails, preserve only the fixed content-safe observation booleans
and failure code. Do not attach the generated fixture, a private EPUB, rendered
text, screenshots containing book content, or raw WebDriver logs.

Run packaged WebView2 commands from a normal local PowerShell session. A nested
automation sandbox can produce `webdriver-session-not-created` or
`chrome not reachable` before the application mounts even when the release
binary and local driver can create a session normally. Confirm the same command
outside that sandbox before treating the result as a product failure.

### Memory, temperature, or cleanup looks abnormal

The accepted M008 matrix peaked at 2,828,034,048 process-tree working-set bytes,
4,882 MiB dedicated GPU memory, 70 degrees Celsius, and 40.13 watts on the
reference PC. The later synchronized M009 matrix peaked at 3,398,922,240 bytes
and 5,178 MiB dedicated GPU memory. These are observations, not universal
limits.

Stop the application and verify the supervised process tree and GPU allocation
return to zero. Do not run a second model instance, persist generated audio, or
weaken the 43,200,000-frame, 172,800,000-byte, 256-unit simultaneous ceiling to
work around resource pressure.

### Safe diagnostic boundaries

- Keep the interpreter-bound outbound firewall rule enabled.
- Use only synthetic repository fixtures for repeatable diagnostics.
- Do not persist or export generated audio.
- Do not log narration text, book metadata, paths, identities, or PCM.
- Do not add automatic retry: it can duplicate expensive work and obscure the
  original failure.
- Do not promote a passing local diagnostic to standard or general-hardware
  support. ADR-0013's blocker remains until separate evidence and a durable
  decision supersede it.
