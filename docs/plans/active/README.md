# Active plans

Store approved implementation ExecPlans here while work or required acceptance
is still pending. Follow [the plan format](../../../.agents/PLANS.md) and keep
each plan's progress and validation results current.

## Current plans

- [Desktop state subscription hooks](desktop-state-subscription-hooks.md):
  planned reusable narration and hardware snapshot hooks with focused lifecycle
  tests; preserve current state owners and local UI state without Redux,
  Zustand, or additional dependencies. Implementation and acceptance pending.

The App conditional-presentation, preference-effects and organization/refactor plans are
archived in the [completed-plan index](../completed/README.md).

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
