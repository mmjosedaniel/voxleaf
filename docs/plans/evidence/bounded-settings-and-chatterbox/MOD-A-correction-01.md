# CORRECTION ORDER

Target ID: MOD-A
Order ID: MOD-A-CORRECTION-01 (correction loop 1 of at most 2)
Failed criterion: new direct tests must typecheck under existing desktop config.
Evidence: [MOD-A-POST-CHANGE-01-20261006](MOD-A-post-change-01.md), TS2345 at
test line 171; deferred<void> incompatible with inferred Promise<undefined> mock.
Required correction: align the refresh deferred/mock return type with the existing
fixture; use deferred<undefined> or an equivalently narrow void-return typing fix.
Preserve every assertion and production source.
Allowed files: apps/desktop/src/settings/narration-settings-actions.test.ts only.
Forbidden changes: all original work-order boundaries, production edits, assertion
weakening, unrelated formatting, source beyond allowlist, Git mutations/delegation.
Revalidation: all MOD-A-WORK-01 commands under new report/identities; portfolio
remains separately blocked. Worker validation none; return Change Packet.
