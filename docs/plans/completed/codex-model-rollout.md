# Codex contributor model rollout

## Goal

Move the contributor agents to the requested Sol and Astra generation and verify the assignments a fresh Codex project session loads.

## User-visible outcome

Contributors can choose the primary model by task depth and see which agent owns implementation, host validation and independent approval.

## Current state

Clean local base `e85837ddee68e73ea05a0157e2fa0c79b63b7264`. At baseline the project session exposed one unnamed-helper default and five individually pinned roles from the previous generation.

## Scope and non-goals

Update contributor configuration, skills and workflow guidance. Preserve local EPUB/TTS processing, authorizations, host acceptance, the single campaign writer and the four supporting slots. Historical receipts retain their original identities.

## Relevant files and documentation

Use the [project config](../../../.codex/config.toml), [role map](../../development/agentic-refactoring.md#roles), [change review](../../development/agentic-change-review.md), [task routes](../../README.md#task-reading-routes) and [audit skill](../../../.agents/skills/audit-logic/SKILL.md).

## Architecture and constraints

The configuration serves contributors. Runtime components, protocols, persistence and deployment stay outside this patch. The parent Codex session supplies permissions. Role instructions, host checks and exact patch identities govern the handoffs.

## Milestones

1. Update pins, permission descriptions, implementation handoffs and audit delegation.
2. Check the fresh project configuration and compare the model pairs at equal effort. Record the inputs that can actually be used.
3. Run the applicable host checks and submit the exact candidate to the reviewer loaded under the preceding policy.

## Testing and benchmark strategy

Check TOML, skill structure, changed document links and evidence hygiene on the host. For the comparison, withhold prior verdicts, supply identical historical inputs and record false alarms, misses, corrections, elapsed time and available usage. Record fresh client loading separately from model execution and product validation.

## Risks and rollback

Keep primary selection in the composer. A missing required role blocks its acceptance step. The previously reviewed model pins and instructions are retrievable at the base commit.

## Progress log

- Created `codex/adopt-gpt-6-2-workflow` from the clean base.
- Updated all six model settings and the contributor guidance. Bound the original named reviewer at its baseline pin before freezing the complete migration candidate.

## Discoveries and decisions

The six TOML settings own the operational versions. The approved change reviewer uses its baseline role instructions. The desktop role list refreshed during the edit, so contributors should inspect the active role list and open a fresh project session when it is stale.

## Final validation results

Fresh Codex CLI `0.169.0-alpha.11.1` exposed all five expected named model/effort pairs in its actual tool declaration. A loopback endpoint captured that declaration and stopped the request before inference. A separate fresh app-server `config/read` returned Sol Medium for unnamed helpers, delegation enabled and a four-helper cap.

Four ephemeral CLI runs used an identical synthetic prompt at High effort, with invented ticket-desk and weather-station scenarios. The prompt SHA-256 was `606ea60e2eb87d37427967bceec3e909717a374d1858693994a5206e3ed96af5`. All four identified the stale confirmation, its effect on the next user action and the external intervention required to mix records. Each proposed a distinguishing check. Across the two scored answers per model there were zero misses, false alarms or correction rounds.

| Requested model | Elapsed seconds | Input tokens | Output tokens |
| --- | ---: | ---: | ---: |
| GPT-6.1 Sol | 18.4 | 10,451 | 593 |
| GPT-6.2 Sol | 12.3 | 10,738 | 416 |
| GPT-6.2 Astra | 21.4 | 10,687 | 368 |
| GPT-6 Astra | 26.2 | 9,265 | 549 |

Each row is a single run, including CLI overhead. The proposed replay of [VF-0058 and VF-0071](../../development/findings/audits/2026-11-15-deep-findings-validation.md) at `997cddf` awaits authorization to transmit the bounded historical source to the model service. The synthetic exercise establishes model reachability and the answers to those examples. VoxLeaf-specific comparative performance remains unmeasured.

The local host parsed the TOMLs, compared all other role settings with base, validated both skills and passed the 34 evidence-guard tests. The default Python lacked PyYAML. The same skill validator passed using an already installed interpreter with PyYAML. The [review inputs](../evidence/codex-model-rollout/candidate-r1.md), [independent verdict](../evidence/codex-model-rollout/review-r1.md) and [coordinator closeout](../evidence/codex-model-rollout/closeout.md) bind the final candidate and its host checks.
