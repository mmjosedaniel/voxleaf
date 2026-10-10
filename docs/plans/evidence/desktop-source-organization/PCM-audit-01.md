# Audit Packet

Target ID: DESKTOP-PCM-01

Decision: CHANGE

Risk: medium

Primary target: `apps/desktop/src/tts/pcm-playback.ts`: six error/backend
contract declarations and WebAudioPcmPlaybackBackend with its private handle
and two factory types. AdaptivePcmPlayer orchestration stays in the facade.

Related context: pcm-playback.test.ts, adaptive-buffer-scheduler.ts,
product-narration-coordinator.ts, both incremental-wsola-v3 sources,
reader-settings-playback-authority-v3.ts, reader-settings-playback-result-v3.test.ts
and bilingual-portfolio-host.mjs. Independent clean_code_auditor GPT-6.1 Sol high
inspected HEAD ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5. All Unit 2 paths clean;
both new paths absent; accepted Unit 1 remains unstaged. Auditor ran no tests.

Concrete evidence: player scheduler/progress/timer/invalidation ownership and
backend AudioContext/gain/PCM/WSOLA ownership coexist despite an existing injected
PcmPlaybackBackend interface. Tests already exercise them independently. Both
consume contracts currently in the facade; a neutral module avoids a circular
backend-to-facade import after extraction. The retained WSOLA controller resolves
its own worker URL, and frozen authority names both existing paths. Existing
tests cover rates, 24-kHz clock, decode, progress, release, cleanup and reuse;
no test edit is needed. No defect, bundle-size or performance claim is made.

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

Allowed files:
- `apps/desktop/src/tts/pcm-playback.ts`
- `apps/desktop/src/tts/pcm-playback-contracts.ts` (new)
- `apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts` (new)

Proposed edits: move PcmPlaybackErrorCode, PcmPlaybackError, PcmPlaybackRequest,
PcmPlaybackHandle, PcmPlaybackCallbacks and PcmPlaybackBackend to the neutral
module, with type-only NarrationPlaybackRatePercentV3 import. Move the backend,
WebAudioPlaybackHandle, AudioContextFactory and IncrementalWsolaV3Factory to the
backend module verbatim with comments. Backend imports errors/types from the
neutral module, authorities from existing modules and WSOLA from its sibling;
never import the facade. Facade imports what the player needs and directly
re-exports all moved public declarations. Consumers/tests stay unchanged.

Forbidden edits: any other path, prior Unit 1, tests, scheduler/coordinator,
WSOLA/authority/results, behavior/bug fixes, callbacks/resource/error changes,
new dependency/configuration/lockfile/CSP/public contract/model policy/dynamic
loading, generated/frozen/historical sources, harness repairs, installs/model
downloads/firewall/persistent environment changes, staging/commits/push/PR.

Diff ceiling: three files; maximum 850 combined added/deleted lines.

Baseline commands: D and H, repository root/local PowerShell outside sandbox:
```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop build
pnpm.cmd test:tts:bilingual-portfolio-exact-host
```

Post-change commands: repeat baseline plus:
```powershell
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```

Validator inspects static imports, constructor identity, unchanged assertions and
production worklet loading. ADR-0051 requires fresh Piper ES/EN (both six-rate
matrices) and Chatterbox ES/EN. Record overall six-arm command exit and every
passed/failed/unrun arm; scoped acceptance never relabels a failed command.
Retain the verified process-local driver override; verify fresh host prerequisites.

Documentation impact: director-owned progress/evidence; no product/architecture
change. Decision required: none; independent D/H baseline required before order.
