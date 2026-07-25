# Local TTS feasibility profile v2

## Status and authority

This document is the accepted measurement and selection authority for
Milestone 6 reruns. The maintainer approved it on 2026-07-25 after the first
official `v1` Supertonic result and before any Qwen model execution. It
supersedes
[`tts-feasibility-profile-v1`](tts-feasibility-profile-v1.md) for every new
pilot, official measurement, quality evaluation, audit, summary, and profile
decision.

The identifier for this authority is `tts-feasibility-profile-v2`.
`candidates-v1.json` and `corpus-v1.json` remain byte-identical inputs. Every
`v1` raw observation and result is historical evidence only and is not
comparable with or promotable under `v2`. Both admitted candidates must execute
the complete protocol again.

Except for the replacements in this document, all procedure, ordering,
timeouts, arithmetic, gates, listening rules, privacy rules, invalidation
rules, and cleanup requirements from `tts-feasibility-profile-v1` are
incorporated unchanged into this authority.

## Reason for the new version

The frozen `v1` profile required process-attributed VRAM through NVML. The
measured Windows WDDM host returned `unavailable` for an exact allocating CUDA
PID because Windows owns GPU memory management in that driver mode. This
blocked measurement even though the candidate had previously synthesized on
the same machine.

`v2` does not weaken the six-GiB balanced-role ceiling. It replaces the
unavailable measurement mechanism with two independent observations that are
available on the target Windows/PyTorch stack:

1. Windows WDDM dedicated GPU memory attributed to the exact measurement
   worker process tree; and
2. PyTorch caching-allocator peak reserved bytes reported inside the isolated
   candidate worker.

Microsoft documents that WDDM's VidMm observations cover proprietary APIs
including CUDA and expose per-process dedicated/shared video-memory usage:
<https://devblogs.microsoft.com/directx/gpus-in-the-task-manager/>.
Microsoft also states that Windows performance counters are not intended for
collection more often than once per second:
<https://learn.microsoft.com/windows/win32/perfctrs/about-performance-counters>.
PyTorch defines `max_memory_reserved` as the maximum GPU memory managed by its
caching allocator:
<https://docs.pytorch.org/docs/stable/generated/torch.cuda.memory.max_memory_reserved.html>.
These sources were retrieved on 2026-07-25.

## Replacement preconditions

Replace `v1` precondition 1 with:

1. The repository commit, clean tree, candidate manifest, corpus,
   `tts-feasibility-profile-v2`, and `tts-feasibility-summary-v2` schema
   versions are recorded.

Add these preconditions for the balanced role:

- The `GPU Process Memory(*)\Dedicated Usage` WDDM counter must be present and
  return a numeric collection before model load.
- The exact PyTorch runtime must expose `reset_peak_memory_stats` and
  `max_memory_reserved`.
- Failure, absence, malformed counter instances, counter reset, or an
  unavailable PyTorch allocator observation invalidates the run.

All original clean-tree, exact-artifact, offline, power, sleep, headroom,
privacy, and operator preconditions remain unchanged.

## Replacement memory collection

Replace the `v1` memory-collection section with the following rules.

### Process-tree RAM

Sample descendant working-set RAM every 50 milliseconds from before the first
candidate load through final worker exit. Resolve descendants only by numeric
PID/parent-PID relationships. Subtract the pre-start baseline and retain only
the peak byte count.

### WDDM process-dedicated GPU memory

For the balanced role, collect
`GPU Process Memory(*)\Dedicated Usage` at most once per second through the
native Windows performance-counter API. Parse only the numeric PID from each
counter instance, retain only instances belonging to the measurement worker
or its recursively discovered children, sum all physical-adapter instances
for those PIDs, and retain the peak.

The counter must be collected once before candidate load to establish
availability and a baseline. Subtract that baseline from the peak. Counter
instance names, adapter LUIDs, paths, process names, and unrelated process
values must not enter raw or reviewable output.

### PyTorch allocator high-water mark

For the balanced role, reset PyTorch peak memory statistics immediately before
loading the verified local model. After every successful load, warm-up, and
generation command, read `torch.cuda.max_memory_reserved()` inside the
isolated candidate worker and return only the non-negative integer byte count
through the private pipe.

The parent retains the maximum across every normally responding isolated
worker. A forced-cancelled worker may not respond; the WDDM sampler remains
active across forced termination. A CUDA out-of-memory error is a failed
observation regardless of the recorded peaks.

### Authoritative peak and availability

For the balanced role:

```text
authoritative peak VRAM =
    max(peak WDDM process-dedicated bytes above baseline,
        peak PyTorch allocator-reserved bytes)
```

Both component peaks must be present and greater than zero. The WDDM peak
provides operating-system process attribution and includes allocations outside
PyTorch's caching allocator; the PyTorch peak supplies an allocation
high-water mark that cannot be missed between one-second WDDM samples. The
summary records both component peaks, the authoritative maximum, and the two
fixed sampling/method identifiers.

For the compatibility CPU role, every VRAM field is `unavailable`, no PyTorch
allocator observation is requested, and GPU provider allocations remain
exactly zero.

The known limitation is explicit: WDDM process memory includes private and
cross-process-shared allocations visible to the measured process, while
PyTorch covers only memory managed by its CUDA caching allocator. Taking the
maximum is conservative for the product's bounded-memory screen but is not a
driver-independent profiler or a universal hardware claim.

## Replacement summary authority

Use `benchmarks/tts/schemas/summary-v2.schema.json`. Its memory object records:

- `ramSamplingIntervalMilliseconds`;
- `processVramSamplingIntervalMilliseconds`;
- `vramMeasurementMethod`;
- `peakProcessTreeRamBytes`;
- `peakProcessVramBytes`;
- `peakFrameworkVramBytes`;
- `peakVramBytes`; and
- `gpuProviderAllocations`.

No counter instance, PID, process name, path, command line, environment value,
text, audio, exception, or free-form diagnostic is allowed.

## Gates

All `v1` numeric, cancellation, offline, privacy, artifact, licensing,
quality, cleanup, and zero-failure gates remain unchanged. For the balanced
memory gate, all of the following are conjunctive:

- WDDM process-dedicated peak is available and greater than zero;
- PyTorch allocator-reserved peak is available and greater than zero;
- the authoritative maximum is at most 6 GiB;
- at least one measured worker PID owns a GPU allocation; and
- no CUDA out-of-memory or measurement failure occurs.

No online benchmark, previous informal synthesis, total-device VRAM value,
zero, estimate from model size, or single component may replace these
observations.

## Invalidation and reruns

Every `v1` candidate result is invalid for `v2` selection. Run both candidates
from the beginning in the original frozen order. Any later normative change
requires `tts-feasibility-profile-v3` and another complete rerun.

## Frozen-gate declaration

At acceptance of `v2`, the prior Supertonic `v1` run had failed first-audio and
cancellation gates. No Qwen model had been loaded by the VoxLeaf benchmark and
no candidate summary had been promoted. The maintainer selected this
measurement replacement to remove an unavailable-hardware attribution blocker,
not in response to a Qwen performance or quality result. The six-GiB ceiling
and every non-memory gate remain unchanged.
