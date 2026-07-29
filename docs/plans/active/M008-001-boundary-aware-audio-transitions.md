# M008.1 boundary-aware audio transitions

## Goal

Preserve natural separation between independently generated local narration
units without changing model input, creating silent audio, or weakening
bounded playback and cancellation.

## User-visible outcome

When buffered narration crosses a semantic segment boundary, VoxLeaf briefly
waits before starting the next audio unit. Artificial size splits remain
continuous, sentence/paragraph boundaries receive progressively longer
separation, and a terminal ellipsis receives a bounded near-one-second pause.
The pause remains responsive to Pause, Resume, Stop, navigation, recovery, and
close.

## Current state

Completed M005 supplies canonical source-mapped text and one closed
`boundaryReason` per prepared segment. Completed M008 plays complete PCM units
FIFO with no inter-unit delay and retains an unused, separate low-buffer
boundary-wait coordinator whose default is frozen at zero. M009 synchronizes
reader progress to actual segment start/completion. Exact reader use confirmed
that punctuation within model-produced audio is acceptable but adjacent
generated units can sound joined.

## Scope and non-goals

In scope:

- freeze a desktop-local semantic transition-pause policy;
- reduce prepared boundary information to a bounded numeric delay;
- carry the delay with internal scheduler/audio-unit metadata;
- schedule at most one interruptible delay between buffered units;
- preserve accurate audible progress, metrics, and controls;
- add deterministic regression coverage and reconcile documentation.

Out of scope:

- text normalization, segmentation, locator, or TTS protocol changes;
- inserting silence inside generated PCM;
- audio trimming, crossfading, or speech analysis;
- model-specific punctuation rewriting or generation-setting changes;
- using intentional pauses to claim improved RTF or hide buffering.

## Relevant files and documentation

- `apps/desktop/src/tts/playback-transition-policy.ts`
- `apps/desktop/src/tts/adaptive-buffer-scheduler.ts`
- `apps/desktop/src/tts/pcm-playback.ts`
- `apps/desktop/src/tts/product-narration-coordinator.ts`
- focused tests beside those modules
- `docs/architecture/playback-transition-pause-policy-v1.md`
- `docs/architecture/decisions/ADR-0021-boundary-aware-audio-transitions.md`
- completed M005/M008 plans and current product/architecture/testing docs

## Architecture and constraints

The EPUB package remains the canonical normalization and stable-range owner.
The coordinator may inspect only the already prepared in-memory segment long
enough to select one numeric pause. The scheduler/player retain no narration
text. The service and native process remain unaware of pause policy.

Playable lead continues to count only sample frames. One pending timer adds no
audio payload or queue entry. It must be cancelled before stale work can
start, and a real underrun must not be followed by an additional intentional
pause. No private text or audio may enter logs, snapshots, metrics, tests, or
committed artifacts.

## Milestone 1: Freeze transition authority

### Work

- Record exact delays, eligibility, lifecycle, measurement, and non-goals.
- Accept the durable playback-only decision before runtime changes.

### Validation

- Run `git diff --check`.
- Verify all new relative documentation links resolve.

### Status

Complete. The policy and ADR were accepted before runtime source changes.

## Milestone 2: Implement deterministic scheduling

### Work

- Add the pure boundary/ellipsis-to-delay projection.
- Carry only the numeric delay through prepared and playable desktop metadata.
- Schedule, pause, resume, cancel, and settle one transition delay in the
  low-level player.
- Keep audible start/completion and FIFO release ordering exact.

### Validation

- Run focused policy, scheduler, player, and coordinator tests.
- Run desktop typechecking and linting.

### Status

Not started.

## Milestone 3: Integrate metrics and close validation

### Work

- Report intentional transition time separately from playback and buffering.
- Use truthful accessible narration status during the brief pause.
- Reconcile MVP, architecture, roadmap, testing, and troubleshooting docs.
- Review privacy, resources, cancellation, stale callbacks, and the final diff.

### Validation

- Run `pnpm.cmd check:portable`.
- Run the authoritative Windows `pnpm.cmd check`.
- Run `git diff --check` and a tracked privacy/artifact scan.

### Status

Not started.

## Testing and benchmark strategy

Pure tests freeze every mapping and ellipsis case. Scheduler tests prove the
numeric field is bounded and survives only into its matching audio unit. Player
tests use manual time and callbacks to prove exact order, timing,
pause/resume, underrun substitution, completion, and invalidation. Coordinator
tests prove ephemeral text reduction, content-free metrics, and UI projection.
No model or private EPUB is needed for deterministic correctness. Optional
human listening may tune a future version but cannot silently alter v1.

## Risks and rollback

- Excessive pauses can sound theatrical. Roll back by selecting the all-zero
  policy in a versioned decision, not by changing v1 values silently.
- A late timer could start stale audio. Cancel it during identity-first
  invalidation and reject callbacks by exact pending-pause identity.
- Counting delay as playable lead could hide underruns. Keep sample-frame
  accounting unchanged and measure intentional time separately.
- Pausing during a transition could restart the full wait. Retain only the
  bounded remaining duration and resume it once.

## Progress log

- 2026-07-29: User listening established the missing behavior: punctuation
  inside generated audio is acceptable, while direct FIFO joins can merge
  independently generated sentences. Frozen policy and ADR were drafted before
  runtime implementation.
- 2026-07-29: Milestone 1 froze exact transition delays, buffering
  substitution, lifecycle behavior, content-free measurement, and explicit
  non-goals. All new relative links resolve and `git diff --check` passes.

## Discoveries and decisions

1. M008's existing adaptive boundary wait is a low-buffer throughput tool and
   remains disabled; it must not be repurposed for narration rhythm.
2. M005 already supplies the semantic boundary needed by playback, so no
   normalization or public protocol change is necessary.
3. Scheduled time is cheaper and safer than allocating silent PCM.
4. A real buffer wait replaces rather than compounds an intended transition
   pause.

## Final validation results

Pending.
