# Troubleshooting

## Exact one-GPU narration demo

The M008 narration path is a constrained development demo, not a production or
general-hardware profile. It is intentionally absent unless the native process
starts with the exact verified Qwen3-TTS 12Hz 1.7B CustomVoice/Serena
configuration documented in [`setup.md`](setup.md).

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
ready; it is not a 15-second wall-clock promise. The accepted exact-host run
took 39.238 seconds from command to audible playback. Cold load, complete-unit
generation, and the need for a second unit can all increase wall time.

Do not replace the playable-audio threshold with a timer. Use explicit prepared
playback when a longer initial wait is acceptable. Its initial selection is one
minute; the other admitted choices are 2, 5, and 10 minutes.

### Playback reaches the generation frontier

The exact worker is slower than real time. The accepted run observed one
underrun and 20.91 buffering seconds per playback minute, above the MVP target
of at most 5 seconds. VoxLeaf must warn below 10 playable seconds and show
buffering when audio reaches zero.

Prepared playback and playback-only pause may build more lead, but they do not
improve model throughput. Semantic-boundary waits remain disabled at `0` ms.
Do not hide buffering, claim continuous playback, or enable a second CPU/GPU
model worker.

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

### Memory, temperature, or cleanup looks abnormal

The accepted matrix peaked at 2,828,034,048 process-tree working-set bytes,
4,882 MiB dedicated GPU memory, 70 degrees Celsius, and 40.13 watts on the
reference PC. These are observations, not universal limits.

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
