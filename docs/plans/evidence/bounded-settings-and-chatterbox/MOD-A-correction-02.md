# CORRECTION ORDER

Target ID: MOD-A
Order ID: MOD-A-CORRECTION-02 (correction loop 2 of at most 2)
Failed criterion: configured TypeScript format check must pass.
Evidence: [MOD-A-POST-CHANGE-02-20261006](MOD-A-post-change-02.md) flags both new files.
Required correction: apply repository-installed Prettier to only these two files.
Allowed files:

- apps/desktop/src/settings/narration-settings-actions.ts
- apps/desktop/src/settings/narration-settings-actions.test.ts

Forbidden changes: all original work-order boundaries, assertion/behavior changes,
other paths, broad formatting, dependencies, Git mutations or delegation.
Worker command: `pnpm.cmd exec prettier --write apps/desktop/src/settings/narration-settings-actions.ts apps/desktop/src/settings/narration-settings-actions.test.ts`
Run in local PowerShell outside sandbox, require_escalated, with process-local
Corepack shim PATH for pnpm 11.15.1. This is the exact-path application of the same
Prettier configured in format:typescript, not a new dependency or broad rewrite.
Report changed-line count; if formatting exceeds 550, stop and report to director
for re-audit/redesign rather than compressing tests or expanding scope silently.
Revalidation: all original acceptance commands under new identities/report;
portfolio prerequisite remains blocked. Return Change Packet then idle.
