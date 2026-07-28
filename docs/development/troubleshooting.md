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

## Exact one-GPU narration demo

The M008 narration path and M009 synchronized reader integration form a
constrained development demo, not a production or general-hardware profile.
They are intentionally absent unless the native process starts with the exact
verified Qwen3-TTS 12Hz 1.7B CustomVoice/Serena configuration documented in
[`setup.md`](setup.md).

### Narration controls are unavailable

Confirm all three native-only development variables are set in the PowerShell
process that launches or tests the application:

```powershell
$env:VOXLEAF_TTS_DEV_ENABLED = "1"
$env:VOXLEAF_TTS_DEV_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
$env:VOXLEAF_TTS_DEV_MODEL_ROOT = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
```

The Python executable, verified ignored model root, outbound-blocking firewall
rule, `tauri-driver`, and matching EdgeDriver must already exist. The
model-free child is test infrastructure and must never be exposed as a
user-facing voice.

Run the focused host diagnostic before the full playback matrix:

```powershell
pnpm.cmd test:tts:exact-host
pnpm.cmd test:tts:adaptive-exact-host
```

Both commands are Windows/CUDA-only, excluded from normal checks and CI, and
must remain offline after artifact preparation.

### Quick start takes longer than expected

Quick start means playback begins when approximately 15 playable seconds are
ready; it is not a 15-second wall-clock promise. The final M008 policy rerun
took 41.312 seconds from command to audible playback, while the later M009
synchronized matrix took 42.621 seconds with 16.240 playable seconds at start.
Cold load, complete-unit generation, navigation/restart work, and the need for
a second unit can all increase wall time.

Do not replace the playable-audio threshold with a timer. Use explicit prepared
playback when a longer initial wait is acceptable. Its initial selection is one
minute; the other admitted choices are 2, 5, and 10 minutes.

### Playback reaches the generation frontier

The exact worker is slower than real time. The final M008 policy rerun observed
one underrun and 19.49 buffering seconds per playback minute. The longer M009
synchronized matrix also observed one natural underrun/refill and measured
378.46 buffering seconds per playback minute. Both exceed the MVP target of at
most 5 seconds. VoxLeaf must warn below 10 playable seconds and show buffering
when audio reaches zero.

Prepared playback and playback-only pause may build more lead, but they do not
improve model throughput. Semantic-boundary waits remain disabled at `0` ms.
Do not hide buffering, claim continuous playback, or enable a second CPU/GPU
model worker.

### Preparation stops after one or more playable units

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
