# ADR-0051: Defer Qwen3 and prioritize Piper and Chatterbox

## Status

Accepted on 2026-10-06 by explicit maintainer direction.

## Context

VoxLeaf already contains development-only Qwen3-TTS integrations and historical
evaluation evidence. Piper and Chatterbox are the supported model families for
the current Windows portfolio, subject to their existing exact configuration and
host requirements.

During the bounded settings modularization, all four Piper/Chatterbox Spanish
and English host journeys passed. The same six-arm command later failed Qwen
Spanish post-seek resumption and did not reach Qwen English. The maintainer
explicitly chose to leave Qwen3 for later and prioritize the two lighter models.
This is a sequencing decision, not evidence that Qwen is unimplemented or that
its failure has been resolved.

## Decision

Prioritize working Piper and Chatterbox narration in Spanish and English for
current delivery and the bounded modularization's model-backed acceptance.
Defer Qwen3 production completion, promotion and unresolved runtime investigation
to a separate future ExecPlan. No date or delivery commitment is assigned.

Retain existing Qwen development-only code, deterministic tests, profiles,
admission constraints and historical evidence. This decision does not promote,
remove or silently change those implementations, frozen authorities or contracts.
Existing repository checks remain required; only the current model-backed
acceptance scope excludes Qwen.

Report each command truthfully. The recorded six-arm command remains failed;
its four successful Piper/Chatterbox journeys can support the explicitly narrowed
scope on the same validated source identities. Qwen Spanish remains failed and
Qwen English untested in that run, rather than passed or repaired.

## Consequences

- Current work can complete with the two prioritized model families and their
  relevant safety, synchronization, cancellation, privacy and cleanup checks.
- Chatterbox retains its existing optional-package and compatible-host gates;
  this priority grants no universal hardware or performance claim.
- Future Qwen work needs an explicit plan, fresh reproduction of outstanding
  failures and applicable exact-host evidence before any support promotion.
- Completed plans and frozen evaluation/release records remain unchanged. The
  six-arm runner still exists and must not be described as a four-arm pass.
- There is no component, process, persistence or trust-boundary change; the
  canonical system diagram remains applicable.

## Alternatives considered

Continuing Qwen investigation in this maintenance task would delay the selected
Piper/Chatterbox priority and expand its scope. Deleting Qwen integration or
rewriting old results would discard useful work and misstate history. Both are
rejected in favor of explicit deferral with preserved evidence.

## References

- [Task acceptance scope and explicit user direction](../../plans/evidence/bounded-settings-and-chatterbox/MOD-A-acceptance-scope-02.md).
- [Uninstrumented host results, including the Qwen failure](../../plans/evidence/bounded-settings-and-chatterbox/MOD-A-harness-repair-post-01.md).
- [Current roadmap](../../plans/roadmap.md).
