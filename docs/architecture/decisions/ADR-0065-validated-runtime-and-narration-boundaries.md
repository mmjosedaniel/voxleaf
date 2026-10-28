# ADR-0065: Correct runtime admission, ownership and narration boundaries

## Status

Accepted on 2026-10-27. Implementation and independent acceptance
are tracked in the [correction plan](../../plans/completed/validated-chat-findings-corrections.md)
and [gate ledger](../../plans/evidence/validated-chat-findings-corrections.md).
Historical authorities and completed plans retain their original bytes and claims.

## Decision

Keep existing component/process owners, local inference, memory-only PCM, stable
source locations, bounded work and cancellation. No runtime/model/dependency
version, generation setting or numerical behavior changes.

### Admission and continuation

Chatterbox v7's frozen adapter accepts exactly default visible CUDA compute
capability **12.0**, with `sm_120`. CUDA **12.8** identifies its Torch runtime.
BF16 hardware capability remains truthful and distinct from effective dtype.

Host report v1 gains optional `cudaComputeCapability`: known major/minor or
unknown. Known integers are bounded to 0-255 with major at least 2. Legacy
missing fields remain decodable and cannot admit Chatterbox; CPU availability
does not depend on this addition. Native emits the same default ordinal/LUID
fact used by `providers.cuda`. Renderer and native pre-network admission require
12.0 without changing capacity thresholds or retained-data removal. This is an
explicit coordinated additive host-report amendment; TTS protocol v1 is intact.

DXGI `Budget - CurrentUsage` is the calling application's headroom, not free
VRAM for a child. Discrete-adapter free memory is unknown from DXGI. For default
CUDA, query `cuMemGetInfo_v2` in a temporarily retained/pushed primary context,
then pop and release it. Missing functions, failed measurement/cleanup or
inconsistent quantities yield unknown. This is OS-reported free memory, subject
to competing allocations, not an allocation guarantee. Unknown optional DirectML
free memory does not poison otherwise known CUDA/CPU facts; profiles needing it
still fail closed.

New starts and explicit recovery retain full allocation requirements. Only an
already admitted, healthy loaded owner with the same profile/language can use
continuation matching. Positive known remaining RAM/VRAM is required; total
capacity, provider, precision, architecture, storage and configuration checks
remain. An explicit changed selection, unknown/fatal resources or service/config
failure contains the owner. Continuation grants no download/replacement admission.

### Ownership, metrics and actions

The typed client creates bounded opaque `startRequestId` before native start
dispatch. Additive optional native start/shutdown IPC arguments bind pending
shutdown to that request, retained in the session before acknowledgement. A
different request cannot terminate the current child. Acknowledged shutdown
still uses its service identity. Legacy internal/native calls remain compatible;
no TTS wire or persisted reading-state schema changes. IDs are transient and
contain no publication text or paths.

Worklet `failed` messages carry their unit sequence; the backend checks it.
FIFO permits `ended(A)` followed by a late Pause failure for A to cross the
callback starting B. Current-unit failures must still be delivered.

Buffering/playback/intentional-wait milliseconds and underruns are scalar totals
owned by the recovery episode. Accumulate deltas and freeze them before release.
Stop/Play, navigation and recovery replace owners without clearing totals; only
the existing explicit episode reset clears them. Command-to-audible and accepted
unit metrics stay per run. Failed terminal state has no Pause, Resume or
Play-available capability after playback release. Existing dismissal/recovery
actions retain their policy.

### EPUB and numeric boundaries

Each accepted shared-fallback spine occurrence receives its own opaque document
identity/location and locator index. The first retains the canonical resource
target; later occurrences preserve order and local self links. Reprojection
consumes existing archive/semantic/work budgets and cancellation checkpoints.

Empty language is explicitly unknown (`language:""`) throughout projection and
narration. Missing language still inherits. Paired tags compare ASCII
case-insensitively; conflicts, whitespace and controls remain rejected. Hidden
roots omit descendants while root structure, well-formedness, budgets and
cancellation remain validated.

Current mutable ES/EN profiles preserve whole `0.25 %`, `0,25 %`, `1/25 %`, signed
percentages, `12:14:30` and `14:30:12`. Standalone percentages/times and ordinary
sentence punctuation retain accepted expansions. Displayed text and exact source
ranges remain unchanged. Historical v1 normalizers/corpora are frozen; completed
M005 remains preparation-only authority without new TTS/audio claims.

### Private startup and package retry

Installed Chatterbox's existing native command runs a child bootstrap before
service/Torch import. Load the verified runtime's VCRUNTIME140/140_1 and
`sklearn/.libs/msvcp140.dll` by explicit path, check the loaded basename's actual
origin and keep handles alive. Missing/invalid files or competing preloaded
modules fail closed. Piper, Qwen and development command paths stay unchanged.
No parent-only DLL change, machine prerequisite, v7 mutation or new runtime.

Preserve the legacy `...cuda-bf16-default-v4` ID. BF16 in that ID and hardware
gate does not declare parameter/activation precision. Native opt-in diagnostics
observe dtype without casts, autocast changes, tensors/text or ordinary protocol
metadata. The native v7 Spanish and English arms observed T3/S3Gen/voice-encoder
parameters and T3 floating forward inputs as `torch.float32`, with CUDA autocast
disabled at load and observed forward. This is bounded evidence for those paths,
not a claim about every intermediate operation or GPU kernel's internal math.
The current ledger records the exact receipts; arithmetic remains unchanged.

Piper `atomic_stage` recovers/retains the sole `.previous` package before retry
cleanup. Blocked restoration preserves it. Successful recovery/promotion keeps
atomic replacement and unrelated siblings; no inference payload is rebuilt.

## Alternatives and validation boundary

Optional unknown provider free memory stays local to that provider: CUDA
allocation still requires a known sufficient quantity, while complete CPU/RAM/
storage facts remain usable by Piper. Missing total/core facts retain their
existing incomplete-report behavior.

Cleanup samples the player's read-only observation before invalidation. Metrics
capture cannot settle an expired transition, start a successor, or prevent
playback/service cleanup if observation fails. Terminal-state projection also
uses the read-only observation.

Reject spoofing BF16 facts, lowering start thresholds, casting to BF16, rebuilding
v7, installing a global prerequisite, rejecting supported fallback input and
general lifecycle/package rewrites. Current focused/browser/native/host evidence
and exact independent review are required; historical Python/hash receipts do
not accept the changed production launcher.

Primary semantics: [DXGI fields](https://learn.microsoft.com/en-us/windows/win32/api/dxgi1_4/ns-dxgi1_4-dxgi_query_video_memory_info),
[CUDA free memory](https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__MEM.html),
[Windows DLL lookup](https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-search-order)
and [HTML language](https://html.spec.whatwg.org/multipage/dom.html#attr-lang).
