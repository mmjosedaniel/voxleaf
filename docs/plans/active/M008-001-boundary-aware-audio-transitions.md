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

Complete. The pure v1 mapping, scheduler metadata reduction, one-timer player
lifecycle, coordinator projection, content-free metrics, and truthful status
are implemented.

Focused validation passes:

- `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/playback-transition-policy.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts src/tts/AdaptivePreparationControls.test.tsx`
  — 5 files and 61 tests passed.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` — passed.
- `pnpm.cmd --filter @voxleaf/desktop test` — 43 Vitest files/412 tests and
  seven native WebDriver-client Node tests passed.

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

In progress pending replacement required pull-request checks. Metrics and accessible
status are implemented; current product, architecture, diagram, roadmap,
setup, testing, and troubleshooting documentation is reconciled; and full
portable, authoritative Windows, privacy/artifact, relative-link, and diff
validation pass. The merged implementation's Windows smoke exposed a
nondeterministic pre-highlight layout-settlement race in shared test
infrastructure; its bounded correction passes locally.

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
- 2026-07-29: Milestone 2 implemented the semantic projection, bounded numeric
  scheduler metadata, interruptible player timer, audible-start ordering,
  content-free metrics, and accessible status. Focused 61-test validation,
  desktop typechecking, and the complete 412-test desktop suite plus seven
  native client tests pass.
- 2026-07-29: Milestone 3 documentation reconciliation records M008.1 as a
  separate playback-rhythm overlay rather than silently rewriting M008's
  disabled low-buffer throughput wait.
- 2026-07-29: Milestone 3 local closeout passes `pnpm.cmd check:portable`, the
  authoritative Windows `pnpm.cmd check`, relative Markdown-link validation,
  the 28-file task-delta privacy/artifact scan, and `git diff --check`.
  Required pull-request checks remain before archival.
- 2026-07-29: PR #149's Ubuntu check passed, while its clean Windows packaged
  smoke exposed a shared synchronization-probe race unrelated to transition
  scheduling. The proof took its DOM/geometry baseline before a legitimate
  lazy raster/layout update caused by the proof's own reader scroll had
  settled. The bounded correction requires three stable content-free
  observations within 24 animation frames before highlight registration and
  retains all visibility, focus, selection, DOM, URL, and paint assertions.
  The corrected release-packaged smoke passes locally; replacement required
  checks remain before archival. Corrective checkpoint
  `b7a2ea7f9fc8b3beb698b0d467556a1bbcc2c48c` contains only the shared smoke
  proof stabilization.
- 2026-07-29: The corrected shared smoke and the current repository aggregate
  pass again during M010 Milestone 7 closeout: 20 shared files / 209 tests,
  34 EPUB files / 559 tests, 43 desktop files / 415 tests, seven native-client
  tests, 40 Rust tests, 256 Python tests, all builds, relative-link validation,
  the 19-file privacy/artifact scan, and `git diff --check`. Replacement
  required pull-request checks are the only remaining archival gate.

## Discoveries and decisions

1. M008's existing adaptive boundary wait is a low-buffer throughput tool and
   remains disabled; it must not be repurposed for narration rhythm.
2. M005 already supplies the semantic boundary needed by playback, so no
   normalization or public protocol change is necessary.
3. Scheduled time is cheaper and safer than allocating silent PCM.
4. A real buffer wait replaces rather than compounds an intended transition
   pause.
5. Exact audible-progress semantics require no M009 contract change: the
   completed segment remains complete before the pause, and the successor is
   published only when its audio source starts.
6. Player time can be scheduled without allocating PCM, copying payloads, or
   retaining narration text; only the closed numeric delay follows the audio
   unit.

## Final validation results

Local implementation validation passes:

- The focused command passes 5 test files and 61 tests.
- Desktop typechecking passes. The complete desktop command passes 43 Vitest
  files/412 tests plus seven native WebDriver-client Node tests.
- `pnpm.cmd check:portable` passes Prettier, Ruff format/check, ESLint, mypy,
  every workspace typecheck, 20 shared files/209 tests, 34 EPUB files/559
  tests, 43 desktop files/412 tests, seven native client tests, 256 Python
  tests, package/desktop/Python builds, and both Python distributions.
- The authoritative Windows `pnpm.cmd check` passes the same surface plus
  Cargo formatting, Clippy, 40 Rust tests, and the release Tauri build.
- All relative Markdown links under `docs/` resolve.
- The 28-file task delta contains no generated-audio, private-book,
  model-weight, archive, log, private-path, common credential, or personal
  email artifact finding.
- `git diff --check` passes.

The existing Vite CSS Custom Highlight/chunk-size advisories and sandbox-denied
Pytest cache-write warning remained non-failing. No exact model, private EPUB,
network service, or audio device was required for deterministic correctness.
PR #149's Ubuntu portable check passed and its Windows native check exposed the
shared synchronization-probe race recorded above. Replacement Ubuntu portable
and Windows native checks remain before this plan can move to `completed/`.
