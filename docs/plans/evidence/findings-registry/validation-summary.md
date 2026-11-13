# Findings registry validation summary

Date: 2026-11-13. Base/HEAD:
`403eb27916afe26d4794a7e36aeb97e6d1529bf1`.
Branch: `codex/findings-registry-and-audit-workflow`.
Scope: contributor Markdown, three skill entry points and a 33-record historical
index. No runtime implementation, test, dependency, CI or product contract changes.

## Historical seed

The [import manifest](../../../development/findings/history-import.md) binds all
24 CFR, four PN, two RPI and three selected FPA dispositions to stable IDs and
their source records. Every seed assessment is `not-revalidated`. This task checks
the integrity and usability of that history, not the current product behavior.
Original plans, source tests and review receipts remain unchanged.

## Host commands and outcomes

All commands below ran from the repository in normal local PowerShell outside
the managed sandbox. Raw captures and exact reviewed input identities are kept
in ignored `tmp/evidence/findings-registry/`.

| Check | Outcome and limits |
| --- | --- |
| `pnpm.cmd check:evidence` | Passed after selecting the existing offline Corepack shim and repository-pinned pnpm 11.15.1. Includes current tracked and nonignored untracked Markdown. |
| Installed `skill-creator/scripts/quick_validate.py` for `.agents/skills/audit-logic`, `.agents/skills/investigate-bug`, `.agents/skills/implement-feature` | All three passed using an existing interpreter with PyYAML, invoked with `-I -B`. No dependency was installed or changed. Validates skill syntax, not behavioral correctness. |
| `python -I -B tmp/evidence/findings-registry/check-docs.py` | Passed initial 14-document check: 461 local links/anchors, 33 unique ordered/indexed IDs, eight existing historical commits, and expected historical disposition counts. The temporary read-only checker is retained privately; final renewal includes later documentation. |
| `git diff --check` | Passed; new files are separately inspected because ordinary diff omits untracked content. |

The first skill-validator invocation failed because the default Python lacked
PyYAML. The first evidence guard invocation was stopped by the pnpm engine
requirement: the app supplied 11.25.0 instead of 11.15.1. These are preserved
tool-selection failures, not passing checks. Corrected tool selection renewed
the affected commands without changing global or repository configuration.

Repository formatting/lint/type/build and product test suites do not consume
these Markdown-only changes. The configured formatter excludes Markdown. No
product runtime result or earlier runtime PASS is used as acceptance for this task.

## Independent workflow exercise

An independent read-only evaluator used the skill, workflow and relevant original
sources, without a prescribed verdict or an implementation patch. It inspected
the current checkout and the specified historical commits without tests or edits.

| Request | Observed decision |
| --- | --- |
| Recovery after an attempted start with existing heard progress | Reused VF-0001; intentional policy, source-assessed defect absent for this trigger. |
| Ordinary receipt key order at `a8a61df` after an earlier ALREADY CORRECT report | Reused VF-0015; the old ordinary validator still failed by source trace, while the earlier lifecycle result covered a different validator. Kept the later correction distinct from retrospective assessment. |
| Pause, request, Stop, settlement, Play at `693b0fc` | Reused VF-0002, linked VF-0026; source comparison supported #313 regression origin without claiming a new execution. |
| Direct manual-intent call offered as real wheel proof | Identified VF-0003 evidence limitation; direct coordinator coverage does not prove gesture propagation. Attributed the historical Chromium evidence separately. |
| Deferred pilot exit followed by CFR correction | Reused VF-0007 with both historical transitions; no duplicate case or fresh PASS. |
| Repeated whole-code audit without tests or edit permission | Proposed anchored, bounded coverage/gaps and record changes in the answer; no tests, writes or Git mutation. |

The exercise identified wording ambiguities concerning scratch writes, ID
allocation, incomplete history lookup, inconclusive source inspection, assessment
date versus target commit, and read-only completion. The workflow now explicitly
allows in-memory/read-only reporting, reserves IDs only on authorized writes,
bounds history lookup, supports `inspected-inconclusive`, and keeps retrospective
and current-checkout assessments distinct. A narrow renewal confirmed the
identified ambiguities were resolved with no blocker. Its optional candidate-label wording
alignment was also applied to the template and metrics guidance.

## Acceptance boundary

[FREG-CR-R1-20261113](review-r1.md) approved the implementation and its exact
15-path patch without findings. Documentation archival follows that approval
with a separate final identity/closeout assessment. The examples establish workflow
decisions for these scenarios; they do not demonstrate automatic enforcement,
future agent compliance, whole-history completeness, or fewer product bugs.
