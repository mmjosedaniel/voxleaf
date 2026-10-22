# Active plans

Store approved implementation ExecPlans here while work or required acceptance
is still pending. Follow [the plan format](../../../.agents/PLANS.md) and keep
each plan's progress and validation results current.

## Current plans

| Plan | Scope | Status |
| --- | --- | --- |
| [Confirmed logic and lifecycle corrections](confirmed-logic-bugfixes.md) | Five bounded corrections for uninstall detection, Pause/completion, TTS error recovery, primary EPUB start, and promotion-backup cleanup. | Planning only; execution and validation have not started. |

Completed work is listed in the [completed-plan index](../completed/README.md).

The [roadmap](../roadmap.md) retains future priorities, deferred work and product
limitations; listing a plan here does not mean its implementation is complete.

## Adding and closing a plan

Use `MNNN-descriptive-name.md` for a milestone-specific plan, or
`MNNN-NNN-descriptive-name.md` when a milestone needs several plans. Keep a
descriptive name for work spanning milestones.

List new active plans under Current plans and remove the empty-list statement.
Once the required work and validation finish, move the plan to `completed/`,
update both plan indexes and the [documentation index](../../README.md), and
update incoming links to the completed path. Preserve historical plan content
apart from those path corrections; do not leave redirects in `active/`.
Keep completed summaries in the completed index rather than duplicating them
as current work here.
