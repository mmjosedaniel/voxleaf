# APPROVED WORK ORDER

Order ID: DESKTOP-PCM-WORK-01
Target ID: DESKTOP-PCM-01
Goal: Separate existing Web Audio backend and shared contracts from player
orchestration without changing behavior or compatible imports.
Risk: medium

Allowed files:
- apps/desktop/src/tts/pcm-playback.ts
- apps/desktop/src/tts/pcm-playback-contracts.ts (new)
- apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts (new)

Required edits:
1. Move exactly PcmPlaybackErrorCode, PcmPlaybackError, PcmPlaybackRequest,
   PcmPlaybackHandle, PcmPlaybackCallbacks and PcmPlaybackBackend to the neutral
   contracts module, preserving definitions/comments and using a type-only
   NarrationPlaybackRatePercentV3 import.
2. Move WebAudioPcmPlaybackBackend, WebAudioPlaybackHandle, AudioContextFactory
   and IncrementalWsolaV3Factory verbatim with comments into the backend module.
   Import contracts/error from the neutral module, never the facade; preserve
   authority imports and import WSOLA from its existing sibling path.
3. Keep AdaptivePcmPlayer and its logic in the facade. Import its needed shared
   contracts and directly re-export every moved public declaration/constructor.
   Retain a single PcmPlaybackError definition and identical constructor identity.

Behavior invariants:
1. Preserve all facade exports/import paths and direct constructor identity;
   one PcmPlaybackError definition with identical name/message/codes.
2. Preserve player logic, request construction, observation/state types, timers,
   tokens, callbacks, catches and cleanup ordering.
3. Preserve lazy audio graph and default 24,000-Hz authority-bound context.
4. Preserve mono float32 little-endian decode, byte offset/length, remaining
   allocation, finite rejection, device copy and WSOLA transfer list.
5. Preserve source-frame progress, pause/resume and volume; source/effective
   duration responsibilities remain distinct.
6. Preserve one handle/context/gain/WSOLA node, preparation reuse/stale disposal,
   default-rate release and close ordering.
7. Preserve callback eligibility/sequence checks, handlers and stop/complete.
8. Preserve six rates, next-complete-unit activation and queued PCM/TTS identity.
9. Preserve release-once, four-unit cleanup turns and waitForCleanup semantics.
10. Preserve locators/synchronization/cancellation, privacy, local inference,
    bounded resources, content-free diagnostics and no audio persistence.
11. Preserve frozen WSOLA paths, processor/messages/algorithm/buffers and URL.

Forbidden changes:
1. Every path outside the three-file allowlist, including accepted Unit1, tests,
   scheduler/coordinator, frozen WSOLA/authority/results, historical/generated
   files and completed plans.
2. Behavior/bug fixes, callback/resource/error changes, dependencies, config,
   lockfile, CSP, public contracts, model policy, wrappers or dynamic loading.
3. Harness repairs, installations/downloads, firewall or persistent environment
   changes. Separately authorized director host preparation does not enlarge
   worker authority.
4. All Git mutations: no staging, commits, push, PR, branch changes or main update.

Diff ceiling: maximum three files and 850 combined added/deleted lines.
Stop and report if any transformation exceeds this boundary.

Baseline evidence: DESKTOP-PCM-01-BASELINE-03, BASELINE PASS, independent
refactor_validator GPT-6 Astra high. Immutable full report [PCM-baseline-03](PCM-baseline-03.md);
[audit](PCM-audit-01.md) refreshed by [PCM-audit-refresh-02](PCM-audit-refresh-02.md).
HEAD: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5.
Branch: codex/desktop-source-organization. Empty index.
pcm-playback.ts: clean, SHA256
2731139D1F6BB7C0BA936BEC426710ADC03CFFAD7A3A35381AC70FBC31F2C1BD,
filter-aware blob bcbea041a9a5bfdf0d5acf47927c6b91f2b496db.
Both new paths ABSENT. All seven D/H commands exit0, complete six-arm H PASS,
required four Piper/Chatterbox arms and both Piper six-rate matrices PASS.
Qwen harness PASS does not imply MVP performance suitability; ADR-0051 unchanged.

Worker validation: none; implementation-only, Change Packet with exact diff tally.
Acceptance commands: local PowerShell outside sandbox, independent validator:
```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop build
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd test:tts:bilingual-portfolio-exact-host
```
Capture exact before/after HEAD, statuses, SHA256 and filter-aware blobs for all
three paths; index must remain empty. Preserve all existing accepted work.
Verify current host isolation/install/driver identities before and after.
Use the baseline03 process-local environment recipe, no diagnostic preload.
Report overall six-arm command exit and each journey, both Piper rate matrices,
static imports, constructor identity and unchanged production worklet loading.
Maximum two correction cycles. No later unit on a rejected patch.
Completion output: Change Packet only; no commit or push.
