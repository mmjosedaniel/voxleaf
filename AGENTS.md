# VoxLeaf project instructions

## Project

VoxLeaf is a privacy-first desktop EPUB reader that generates speech locally and streams bounded audio from memory during playback.

The repository is pre-alpha. Use the roadmap and canonical system diagram for current implementation status. Never claim that planned components, commands, tests, or features already work unless they exist and have been validated.

## Product constraints

- EPUB contents must remain on the user's device.
- Text-to-speech inference must run locally.
- Generated audio must not be persisted by default.
- Generation must be cancellable when the user pauses, seeks, changes chapters, changes voice settings, closes a book, or replaces the active session.
- Playback must not impose a fixed 15-second wait. Start as soon as approximately 15 seconds of playable audio is buffered; the 15 seconds describes audio lead, not wall-clock startup delay.
- Occasional buffering of up to 5 seconds per minute is acceptable for the MVP, but underruns must be observable and measurable.
- Do not commit copyrighted books, generated audio, model weights, secrets, logs containing book text, or private user data.

## Intended repository areas

- `apps/desktop`: desktop UI and application shell.
- `services/tts`: local TTS inference service.
- `packages/epub`: EPUB extraction, normalization, and chunking.
- `packages/shared`: shared contracts and types.
- `docs`: product, architecture, development, decisions, and plans.

Treat this as intended direction, not proof that every directory already exists.

## Required reading

Before changing code or architecture:

1. Read `docs/README.md`.
2. Read the relevant product requirements under `docs/product/`.
3. Read `docs/architecture/system-diagram.md`, `docs/architecture/overview.md`, and applicable ADRs.
4. Inspect existing code, tests, and scripts before proposing commands or implementation patterns.
5. Create an ExecPlan following `.agents/PLANS.md` for multi-component features, model integration, significant refactors, or public contract changes.
6. For narration-preparation work, read `docs/plans/completed/M005-narration-text-preparation.md` and verify its roadmap status before changing the implemented boundary.

## Engineering rules

- Prefer small, focused changes.
- Keep domain and pipeline logic outside UI components.
- Separate EPUB extraction, normalization, chunk scheduling, inference, buffering, and playback.
- Represent reading progress with a stable EPUB location rather than a rendered page number, because pagination changes with viewport and typography.
- Keep the visible reader location, narration start location, highlighting, and persisted reading position synchronized.
- Use explicit typed contracts between processes.
- Design long-running work to be cancellable.
- Bound queues and buffers; prevent unbounded memory growth.
- Log performance measurements without logging book contents.
- Do not add a production dependency without documenting its purpose and alternatives.
- Do not introduce an abstraction until real use cases justify it.
- Do not modify generated files manually.
- Do not silently change public contracts.
- Do not rewrite unrelated code.

## Systematic refactoring

- Use `$orchestrate-safe-refactor` for a multi-file clean-code, readability, or
  maintainability campaign and `$validate-safe-refactor` for its independent
  acceptance gate.
- Audit every target without forcing a modification. `SKIP` is a valid result
  when no concrete maintainability problem exists.
- Work in cohesive units consisting normally of one production file, its tests,
  and at most two directly coupled support files; do not treat an arbitrary file
  boundary as a behavior boundary.
- Keep the primary task as director, permit exactly one implementation agent to
  write at a time, and require a baseline plus post-change validation outside
  the sandbox before accepting a unit.
- Start the director with workspace-write permission. Treat custom-agent
  sandbox settings as requested defaults, not hard isolation: child agents can
  inherit or be constrained by the primary task's active permission mode.
- Keep the Git index empty between units. Stage only the exact allowlisted
  paths, require those paths to have no pre-existing worktree changes, inspect
  the staged names and diff before committing, and never carry a rejected
  worker patch into the next unit.
- Reuse one auditor, one worker, and one validator task throughout a campaign
  batch. Also reuse one Luna Git-steward task when the current Codex surface
  exposes that model. Do not silently substitute another model: if Luna is
  unavailable, record that fact and let Sol execute the same Git Action Order
  directly. Bind accepted-change orders to the exact HEAD and approved path
  identities. Git may mutate only while source writing and validation are idle.
- Never manually refactor generated sources, frozen evaluation authority,
  historical evidence, or completed ExecPlans.
- Require an ExecPlan before a significant, multi-package, or multi-stage
  refactor campaign.

## Testing expectations

Behavior changes require relevant tests. As implementation is introduced, use the smallest applicable level:

- Unit tests for text normalization, chunking, queue behavior, and buffer calculations.
- Integration tests for EPUB extraction and desktop-to-TTS communication.
- End-to-end tests for opening a book, restoring the visible reading location, starting synchronized playback, pausing, seeking, and resuming.
- Performance tests for startup latency, real-time factor, underruns, memory use, and cancellation latency.

Never invent commands. Use only commands defined by repository configuration. Before declaring work complete, run every relevant available check and report the exact commands and outcomes.

Run every test and validation command from a normal local PowerShell session
outside the managed automation sandbox. This includes unit, integration,
format, lint, type, schema, build, Python, Rust, Playwright/Chromium, packaged
WebView2, GPU/model, firewall, performance, and exact-host commands. A sandbox
run may be exploratory, but it is never final acceptance evidence. Repeat the
unchanged command outside the sandbox before reporting pass, failure, or
candidate rejection. This rule exists because the sandbox can deny required
files, caches, processes, network/package access, drivers, hardware, output,
or teardown even when the same command works locally.

## Definition of done

A task is complete only when:

- The requested behavior is implemented.
- Relevant tests exist and pass.
- Available linting and type checks pass.
- Privacy, bounded-memory, and cancellation constraints remain satisfied.
- Public behavior and architectural decisions are documented.
- The final diff has been reviewed for unrelated changes and regressions.

## Documentation responsibilities

Update documentation when changing:

- Product behavior or acceptance criteria.
- Component boundaries or data flow.
- EPUB parsing and normalization rules.
- TTS model integration or hardware requirements.
- Audio buffering, cancellation, or persistence behavior.
- Developer setup, commands, or testing strategy.

Use ADRs under `docs/architecture/decisions/` for durable choices. Keep temporary implementation work in `docs/plans/active/` and move completed plans to `docs/plans/completed/`.

Review `docs/architecture/system-diagram.md` when a task changes major components; package, module, process, or architectural boundaries; dependencies between major components; important runtime or data flows; persistence responsibility; external-system interactions; or deployment/runtime topology. Update it only when the documented architecture actually changes, not for internal refactors that preserve the model. Before completing a relevant task, verify that the diagram still matches the implementation and approved plans.

Review the completed Milestone 5 plan, narration terminology, and canonical system diagram when changing normalization, semantic segmentation, narration contracts, stable locator-range mapping, or the safe-document-to-narration boundary. Update them only when behavior or architecture changes, and never extend its implementation claims to TTS, audio, or synchronization without corresponding code and validation.
