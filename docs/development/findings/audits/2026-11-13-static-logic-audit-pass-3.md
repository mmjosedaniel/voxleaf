# Third static logic audit

## Scope and snapshot

- Date and checkout — 2026-11-13, `main` at
  `5fdb2dc835e99e43034e8b40c99817f45236358f`.
- The index was empty. The only worktree changes at intake were the audit files
  from passes one and two. Incoming SHA-256 identities were
  `FD8A2F1AE8ED052647D96624F21ECC7AE21F089C449FEC59C58A64E6CE5BDA3A` (registry),
  `287BD8982DC1AB75CA32A674FCC7B749CBB4B4A168402BAF19BBD0049D08F82B` (index),
  `9AC1E667B59BEB5A3F68264583683595A1AAF47625DA0457D72BE00CE16CC277` (first report)
  and `511ACD8C8C15136E68F6C0D9493318A738F249EB20F2C31E6918A4F0CF75AAB6` (second report).
- The request continued the static review without running tests. This pass
  used the [first report](2026-11-13-static-logic-audit.md),
  [second report](2026-11-13-static-logic-audit-pass-2.md),
  [registry](../registry.md) and [partial history import](../history-import.md).
  Original records consulted include M004 storage, RPI-01, B04, RIA-01/03,
  DCR-06, F4-04, CCF-C07, RCF-13, CAF-R3.1/R6.2 and NCC-01/02.
  History lookup was bounded by the examined owners and triggers.

## Coverage

| Responsibility | Source and sequence examined | Coverage | Remaining |
| --- | --- | --- | --- |
| Opening, replacement and persistence | App selection and save-owner close, restoration request revisions, position repository admission and rewrite, passive/reflow/heard checkpoint scheduling and lifecycle flush. | Inspected for the read-failure-to-replacement sequence and exact/geometry-fallback controls. | Frequency of transient storage failures in packaged WebView2 and the full lifecycle timing matrix. |
| Automatic chapter transition and Pause | PCM confirmation and callback dispatch through highlight follow, desktop chapter admission, narration Stop, failure arbitration, and persistence. | Inspected for the positive direct-render observation during Pause. Partial for automatic boundaries. | Joined hardware/audio timing and the saved position during an ordinary automatic transition. |
| TTS cancellation and runtime | Desktop start, prepare, synthesize, cancel, and shutdown ownership through Rust supervision, response arbitration, Python framed service and Piper/Chatterbox settle. | Inspected for active cancellation and late PCM rejection. Partial for native cleanup. | Host timing, device/driver faults, termination errors and development adapters. |
| Chatterbox repair and Settings | Installed verification through packaged profile availability, recovery button, client publication, App event filter and compact Play. Also read hardware rechecks and profile and preference actions. | Inspected for an explicit installed-integrity recheck and for reinstall as a control. | Packaged host frequency and remaining overlapping settings operations. |
| EPUB and local maintainer tooling | Opening-signal handoff, bounded narration windows, English title lookbehind, selected language controls and the timing of audio pauses. Read selected Windows release and evidence entry points. | Partial | Full format/grammar matrices, experimental TTS adapters, benchmark runners and CI execution. |

## Findings and reconciliation

### VF-0044 — A restoration read failure can turn book start into saved progress

If reading a book's position returns `unavailable`, restoration falls back to
the default locator. App makes every `book-start` result eligible for the next
lifecycle flush, including failure results. The saver can write when a
replacement book is selected or the document is hidden, without a navigation or
heard event. If storage is accessible at that point, the repository reads the
old envelope, replaces the matching book's saved position with book start,
and stores the result. Reselecting the same EPUB can then show the beginning as
an exact saved position. A malformed v1 envelope is also rewritten on this
path before a user-generated save. Unsupported and oversized records retain
their separate write guards.
[Fallback](../../../../apps/desktop/src/persistence/reader-position-restore-coordinator.ts#L163),
[App admission](../../../../apps/desktop/src/App.tsx#L487),
[replacement](../../../../apps/desktop/src/App.tsx#L623),
[lifecycle flush](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L332),
[identity replacement](../../../../apps/desktop/src/persistence/reader-position-repository.ts#L320),
[storage write](../../../../apps/desktop/src/persistence/reader-position-repository.ts#L388).

P2, product persistence. [VF-0029](../registry.md#vf-0029) concerns a
successful storage read followed by a visual fallback and appearance
change. Here the failed read itself selects a locator that App admits for
later persistence. The malformed-read matrix reaches the restore coordinator
without running App's save owner. Check a one-time failed position read
over a valid mid-book record, then a successful write opportunity on
replacement without moving or playing. Verify the original record and exact
same-byte restoration. Use a malformed v1 envelope and an explicit validated
navigation as a separate repair control.
[Storage authority](../../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md#L114),
[existing restore matrix](../../../../apps/desktop/src/integration/package-reader-matrix.test.tsx#L546),
[recovered-location control](../../../../apps/desktop/src/App.test.tsx#L3076).

### VF-0045 — Pause can turn an unavailable chapter into a playback error

Consider a playing publication with a following chapter that EPUB opening
accepts but the desktop cannot render within its chapter limit. The player
allocates the next unit from the prepared audio queue. With direct Web Audio,
the clock can advance after the new unit starts and before the next coordinator
tick confirms it. If the user presses Pause in that interval, `pause()`
synchronizes the player and emits the first audible observation for that unit.
The current reader listener follows synchronously. It has no range for the
next chapter, requests navigation and immediately reports unavailable. The
coordinator clears the play intent and stops the same player during the
callback.

The original Pause then continues against the stopped scheduler. It can
throw while accounting frames or when its phase check sees `stopped`.
The coordinator's Pause handler uses the *current* run token in its catch,
so it treats the obsolete command as a playback failure on the just-stopped
run. This can enter failure recovery and disable ordinary Play even after
returning to a readable chapter. The tick path instead carries its original
token and rejects an obsolete failure.
[Direct rendering signal](../../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L240),
[Pause](../../../../apps/desktop/src/tts/pcm-playback.ts#L237),
[audible publication](../../../../apps/desktop/src/tts/pcm-playback.ts#L425),
[reader follow](../../../../apps/desktop/src/reader/segment-highlight-controller.ts#L399),
[chapter admission](../../../../apps/desktop/src/reader/reader-navigation.ts#L412),
[unavailable settlement](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L995),
[Pause failure token](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1345),
[tick and failure guard](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2224),
[failure guard](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2318).

P2, product playback. This is a B04 variant at the active Pause call site.
The B04 automatic test supplies an audible observation through a manual
source. Its coordinator counterpart settles an explicit navigation. Use the
real player, coordinator and reader with a controlled positive device
observation first seen by Pause. Check that the fallback appears, containment
stops the old run, and ordinary Play works after returning to a readable
chapter without an error or unwanted restart. Preserve genuine playback
failure handling and the ordinary tick-first transition.
[B04 policy](../../../architecture/decisions/ADR-0057-reader-acquisition-correctness.md#L82),
[automatic reader control](../../../../apps/desktop/src/reader/ReaderPublication.test.tsx#L2672),
[explicit coordinator control](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L4392),
[Play recovery gate](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1049).

### VF-0046 — An installed Chatterbox recheck can leave Play disabled

On a compatible packaged host with Chatterbox already selected, temporarily
make the installed package unavailable to verification when opening a book.
The hardware preference still chooses Chatterbox. The native configuration
probe rejects the local runtime and the current narrator settles as
`unavailable`. Settings reports the installed-integrity failure and offers
**Check Chatterbox again**. When the obstruction clears, this action publishes
`Installed`. App refreshes the current narrator only after a remembered
acquisition transition from Confirming, Downloading or Verifying. A successful
integrity check goes directly from Failed to Installed, leaving the narrator
unavailable. Settings still identifies the profile as active and hides its
Activate button. Ordinary Play stays disabled until a separate refresh such as
a device-compatibility recheck or reopening supplies a fresh observation.
[Hardware selection](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L222),
[native availability](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L399),
[narration availability](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L597),
[installed snapshot](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2111),
[Settings check](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L505),
[App transition filter](../../../../apps/desktop/src/App.tsx#L446),
[Activate visibility](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L480),
[Play availability](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L229).

P3, product recovery. CAF-R3.1 covers same-book reinstall through Verifying.
RCF-13 covers native cleanup and Installed publication. The recheck here
succeeds and exposes the stale App state after publication. [VF-0043](../registry.md#vf-0043)
covers an unsuccessful recheck that offers download confirmation. Check a
mounted selected narrator and an installed-integrity failure that resolves
in the same book. Require Installed, re-enabled Play and no automatic
narration or download. Preserve stale-owner rejection and one refresh after
ordinary acquisition.
[CAF-R3.1](../../../plans/completed/chat-audit-minimal-follow-up.md#L94),
[same-book reinstall control](../../../../apps/desktop/src/App.test.tsx#L994),
[Settings recovery policy](../../../product/reader-settings-and-playback-controls.md#L205).

## Closeout

- Three unique source-supported candidates. One P2 concerns stored reading
  progress, one P2 concerns Pause and subsequent playback availability,
  and one P3 concerns package recheck. Each has a linked historical family.
  No new runtime reproduction or same-ID recurrence was established.
- App and the saver still prevent a successful exact or canonical-recovered
  restore's temporary geometry fallback from becoming a saved offset
  through appearance-only reflow. This is the scoped `inspected-absent`
  assessment for [VF-0029](../registry.md#vf-0029). The reflow method can
  expedite only a pending admitted save.
  [Reflow caller](../../../../apps/desktop/src/App.tsx#L722),
  [save guard](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L241).
- The wrong active target from [VF-0041](../registry.md#vf-0041) also appears
  in the compact player. Both surfaces use the same formatter.
  [Compact label](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L126).
- B04's ordinary automatic transition dispatches the new segment start after
  confirmed rendering. The reader asks for Stop inline; publishing inactive
  synchronously ends save ownership before later audible callbacks. The bridge
  saves the same start if it receives it before that stop, because it verifies
  EPUB identity and locator canonicality. The expected packaged subscriber
  order and resulting saved locator remain inconclusive. VF-0045 depends only
  on inline Stop during Pause.
  [Progress dispatch](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1280),
  [save bridge](../../../../apps/desktop/src/persistence/narration-position-save-bridge.ts#L57),
  [checkpoint guard](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L271).
- The examined F4-04 race remains guarded. Rust rejects the result when native
  cancellation won the final check. If completed bytes arrive after the
  renderer invalidates its generation, the renderer zeroes them and refuses
  handoff. Python settles synchronous adapter work within its service loop.
  Rust owns process termination when cancellation interrupts inference.
  [Native arbitration](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1703),
  [native cancellation](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1748),
  [desktop response gate](../../../../apps/desktop/src/tts/process-client.ts#L460),
  [Python service loop](../../../../services/tts/src/voxleaf_tts/service.py#L377),
  [existing F4 controls](../../../../apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs#L445).
- The final source snapshot remains the intake HEAD. Source, policy and existing
  checks were read using `Get-Content`, `rg` and read-only Git inspection.
  No test, build, benchmark or product command ran. This report,
  the [registry](../registry.md) and [audit index](README.md) were updated.
