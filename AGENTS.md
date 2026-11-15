# VoxLeaf project instructions

## Project

VoxLeaf is a pre-alpha privacy-first desktop EPUB reader with local speech generation and bounded in-memory audio playback. Use the roadmap and canonical system diagram for status; never present planned or unvalidated work as implemented.

## Product constraints

- EPUB contents stay on the user's device; TTS inference runs locally. Generated audio is not persisted by default.
- Generation must remain cancellable. Cancel start/Stop, invalidating seeks, chapter/voice changes, book closure and session replacement cancel obsolete work. Playback-only pause may continue bounded generation for the same active identity; passive viewport inspection is not narration navigation. Follow the [MVP playback rules](docs/product/mvp.md#playback).
- Start when approximately 15 seconds of playable audio is buffered, never after a fixed 15-second timer. Up to 5 seconds of buffering per minute is acceptable for the MVP; underruns must be observable and measurable.
- Never commit books under copyright, generated audio, model weights, secrets, private user data or logs containing book text.

## Intended repository areas

`apps/desktop` owns UI/shell, `services/tts` local inference, `packages/epub` extraction/normalization/chunking, `packages/shared` contracts, and `docs` project guidance. Inspect the actual implementation before inferring capability from these areas.

## Required reading

Before changing code or architecture:

1. Start at [docs/README.md](docs/README.md#task-reading-routes) and the relevant product requirements.
2. Read relevant component, trust-boundary, flow and invariant sections of [system-diagram.md](docs/architecture/system-diagram.md) and [overview.md](docs/architecture/overview.md), plus applicable ADRs. Changes to components, contracts or data flows require the complete affected boundaries and callers. The compact diagram is orientation only, not acceptance authority.
3. Inspect existing code, tests and scripts before choosing commands or patterns. Consult history for a specific decision or claim, not as default reading.
4. Apply [ExecPlan rules](.agents/PLANS.md) for multi-component features, model integration, significant refactors or public contracts; small isolated documentation edits and obvious one-file fixes are exempt from planning, not from applicable checks or behavioral review.
5. For narration preparation, read [M005](docs/plans/completed/M005-narration-text-preparation.md) and verify its roadmap status. Normalization, semantic segmentation, narration contracts, stable locator-range mapping and the safe-document boundary also require the narration terminology and canonical diagram. Never extend M005's claims to TTS, audio or synchronization without corresponding code and validation.

## Engineering rules

- Make focused changes; do not rewrite unrelated code, manually edit generated files or silently change public contracts.
- Keep domain/pipeline logic outside UI. Separate extraction, normalization, scheduling, inference, buffering and playback; use explicit typed contracts between processes.
- Use stable EPUB locations, not rendered page numbers. Keep visible reading location, narration start, highlighting and persisted position synchronized.
- Make long-running work cancellable and bound queues/buffers. Log performance without book contents.
- Document purpose and alternatives before adding a production dependency. Add abstractions only for demonstrated use cases.

## Cumulative logic audits and findings

Follow the [findings workflow](docs/development/findings/README.md): inspect the identified checkout, registry, import coverage and relevant original sources before classifying findings. Match trigger, invariant and owner; preserve stable recurrence IDs and distinct variants. Historical acceptance is not current proof and cannot suppress counterexamples.

Ordinary logic audits maintain affected registry entries and a concise indexed audit record only under `docs/development/findings/`, including audits without tests. Broad/repeated audits also record concrete coverage and gaps, including zero findings. Explicit read-only/no-change requests permit proposed updates in the answer only. Audit bookkeeping does not authorize product edits, tests, plans or Git mutations. During authorized fixes, record evidence for the original trigger, adjacent protections and next user action, plus the evidence-backed escape cause or unknown.

## Feature and bug review

Use [independent change review](docs/development/agentic-change-review.md) for runtime behavior, public contracts, cross-component changes and acceptance/coverage changes, including one-file fixes. Commands, support or privacy claims and acceptance documentation require substantive review; trivial nonbehavioral editorial changes are exempt.

`change_reviewer` remains GPT-6 Astra high, read-only, with no tests or delegation. Supply local-host evidence and the exact patch; resolve actionable findings and obtain approval of the current identities. Missing evidence or reviewer blocks acceptance. Review does not authorize Git actions or replace checks. Refactor campaigns retain their validator instead of adding this role.

## Systematic refactoring

Use [$orchestrate-safe-refactor](.agents/skills/orchestrate-safe-refactor/SKILL.md) and [$validate-safe-refactor](.agents/skills/validate-safe-refactor/SKILL.md) for multi-file maintainability campaigns. Their [contracts](.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md) and [validation policy](.agents/skills/validate-safe-refactor/references/validation-policy.md) are mandatory; the [workflow guide](docs/development/agentic-refactoring.md) routes roles and native ownership.

Audit every target and accept `SKIP`; use cohesive units, normally one production file, tests and at most two coupled support files. The primary task directs one implementation writer and independent host baseline/post-change validation. Select unit/batch gates before edits; pending integration prevents final acceptance. Preserve frozen authorities, historical evidence and completed plans.

Keep the existing Sol auditor/worker/Git steward and Astra validator roles, four supporting slots, role reuse and no silent model substitution. Only an unavailable Git steward may fall back to the director under the same Git Action Order. Start with workspace-write; child sandbox defaults are not hard isolation. Keep the index empty between units and paths initially clean; bind exact-path staging to immutable accepted report identities. No rejected patch may carry into another unit, no hash refresh renews approval, and only the validator may justify gate reuse. Git mutations require current user authorization and idle writers/validation.

## Testing expectations

Behavior changes require relevant tests. Use the smallest applicable level: unit for normalization/chunking/queues/buffers, integration for EPUB and desktop/TTS, end-to-end for reading/restoration/playback/navigation, and performance for latency, real-time factor, underruns, memory and cancellation. [Testing guidance](docs/development/testing.md) owns commands and boundaries.

Use only existing configured commands. Run every test and validation command in normal local PowerShell outside the managed sandbox, including format/lint/types, schema/build, Python/Rust, browser/WebView2, GPU/model, firewall and exact-host checks. Sandbox results are exploratory: repeat the unchanged command locally before reporting acceptance PASS, failure or candidate rejection. This preserves the known filesystem, cache, process, network, hardware and teardown environment requirements.

Satisfy all relevant available checks; report exact commands/outcomes and distinguish execution from explicitly reused immutable evidence. Unknown equivalence requires rerunning the affected check.

## Definition of done

Requested behavior is implemented; relevant tests, lint and types pass; privacy, bounded memory and cancellation remain intact; public behavior/decisions are documented; and the final diff is reviewed for regressions and unrelated changes. Required independent acceptance and Git authorization remain separate.

## Documentation responsibilities

Update guidance when changing behavior/acceptance, component/data-flow boundaries, EPUB rules, models/hardware, audio buffering/cancellation/persistence, or setup/commands/testing. Use ADRs for durable decisions and [ExecPlans](.agents/PLANS.md) for temporary implementation work, moving completed plans to the completed directory.

Review the canonical diagram for changes to major components, package/module/process boundaries, major dependencies, runtime/data flows, persistence, external systems or deployment topology. Update it only when architecture changes and verify relevant implementation/approved-plan alignment before completion. Internal refactors preserving the model do not require a diagram edit. Review M005/terminology/diagram for the narration changes listed above; preserve its narrower implementation claims.
