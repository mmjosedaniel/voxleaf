# CORRECTION ORDER

Target ID: APP-PREFERENCE-EFFECTS-01

Failed criterion: characterization format/lint gates.

Evidence: CHARACTERIZATION-001, Prettier App.test.tsx and unused `_props`
at 617:29 and 683:29; typecheck and all tests passed.

Required correction: replace unused typed parameters with explicit typed vi.fn
signatures preserving mock.calls typing and every assertion. Apply configured
Prettier to the exact test file only, in local PowerShell outside sandbox:
`pnpm.cmd exec prettier --write apps/desktop/src/App.test.tsx`.
This is a bounded editing operation, not acceptance evidence. Use session-only
Corepack PATH selecting verified pnpm 11.15.1. No repository-wide formatting.

Allowed files: `apps/desktop/src/App.test.tsx` only.

Forbidden changes: production, other tests, assertion weakening, docs,
dependencies, Git mutations and delegation. Preserve all unrelated edits.

Revalidation: the four unchanged characterization commands, independently,
with new before/after identities and Report ID. Worker stops after correction.

Correction loop: 1 of at most 2 for this unit.
