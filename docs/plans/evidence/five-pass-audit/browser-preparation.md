# Directed Chromium batch preparation

Read-only source investigation, not executed evidence. Final G6 remains pending.
Use the configured three-spec command in the active ExecPlan after final product
and EPUB build inputs settle. One implementation writer owns new scenarios.

## Closed initial allowlist

- `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`: U1/U2/U3
  and U6; optional U7 profile-settlement control.
- `apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts`: U4.

Reuse existing `reader-image-lifecycle-fixture.mjs` and reflow spec unchanged.
Expand ownership only for a necessary explicit seam. Synthetic renderer/IPC
controls are distinct from native inference and physical audio evidence.

## Navigation and startup controls

U1/1.1: reuse synthetic service `deferShutdown`, `shutdownPending`,
`releaseShutdown`, R8-06 two-spine fixture and prepared navigation control.
Wait for Quick to have accepted buffers and idle generation: the shim lacks
cancel_tts_generation. Hold real shutdown after old next-passage or hovered leaf,
then request Reader Next chapter before release. Assert one shutdown, final C
mounted and first new-generation prepared range on spine 1. Exercise boundary
playing and leaf paused (explicit Resume before the latter's next service).

U1/3.1: reuse DCR-01 one-shot AudioContext.createBuffer failure. Actually sample
B before first Play; no command-to-audible receipt occurs. Recovery's first new
synthesis must anchor B, even if a later manual inspection moved elsewhere.

U1/4.1: reuse MPA real-worklet playback with confirmed audible A, sample visible
B, inject supported error, then hold recovery prepare_tts_service for service 2
using a test-local invoke wrapper. Cancel start, release warmup, wait for inactive
Play-ready and assert next synthesis B (or C if manually moved while held).

U2/3.2: synthetic naturalCompletion=false holds actual audioWorklet.addModule.
Set Prepared target 60000 (helper defaults to 600000), speed75 and audioFrames
360000. A test-local invoke wrapper gates only synthesis result 4; use at least
five blocks. After three accepted results (1080000 frames), change to100 before
allocation. Assert preparing/45000 effective, fourth pending and no real source
start. Release result4, expect active100 and rendering. Wrap actual source start
for evidence; AudioContext creation is insufficient. Always release addModule and
pending synth barriers in cleanup. Do not use holdAfter, which only rejects.

## Reader and image controls

U3/5.1 already has a controlled real-DOM test and separate RED investigation.
U3/5.2: two consecutive ranges in one long comfortable paragraph A; first short
PCM plus second ~14 seconds can satisfy Quick. Gate actual first onended while
B is hovered/focused. Release it and prove A advances, unchanged scrollTop and
leaf placement still B; activation and leave/blur must retain expected targets.
Existing hardcoded held completion24 can be replaced by an optional index with
unchanged default only if a test-local hook cannot express the control clearly.

U4: existing twelve-raster fixture/live URL counter; case-local observers capture
callback/rootMargin for each occurrence. Real browser Blob/image decoding remains.
Use existing HTMLImageElement.decode barrier: active + seven near, then ninth
visible; release first, hold second and assert ninth ready before near peers.
Same PNG bytes identify occurrence by host/alt. Retain cleanup and real-decode
ownership assertions. For 2.4 deliver coalesced matching entries in both orders,
foreign targets and independent visible/near updates; observe actual acquisition
and release, then no allocation from disposed callbacks. These are controlled
observer batches, separate from existing natural RPI geometry scenarios.

U6: synthetic two-spine/fallback fixture, TOC and inline chapter.xhtml# links.
Assert exact navigation status text versus recovered warning, plus full canonical
saved locator; equal locator alone cannot reveal old false missing-fragment
status. Cover absent/empty/missing nonempty fragments and supported aliases.

Optional U7: DCR-03/23 synthetic development profile, saved Aiden then Spanish,
Reset, final English/Aiden before Play. No real Qwen inference is implied.
