# U12 case 4.4: receipt object key order is already accepted

Disposition: ALREADY CORRECT, independently
[approved](review-U12-4.4-R1.md). No production fix or fabricated RED. HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`, index empty.

Current windows-release.mjs uses exact field sets and values through hasFields
and matchesRecord, independent of object insertion order. Its lifecycle receipt
validator already satisfies the retained requirement. The owning DCR-05 fixture
now verifies identical accepted evidence after reversing root, installer, checks
and every uninstall-matrix record's keys, while preserving array order.

Seventeen negative variants still reject: extra/missing fields at the relevant
root/nested levels, changed values, artifact size/hash drift and reordered steps.
This establishes the specific already-correct behavior while protecting strict
validation. It does not infer that every receipt-related path is correct.
Only windows-release.node-test.mjs changes after approved case 1.8.

## Normal-host checks

Node 24.18.0 and child PowerShell 5.1.26100.9711, pinned pnpm/tool identities,
normal local PowerShell outside the sandbox:

```powershell
node --test --test-name-pattern 'five-pass 4\.4' apps/desktop/scripts/windows-release.node-test.mjs
node --test --test-name-pattern 'CCF-C16|CAF-R1\.5|DCR-05' apps/desktop/scripts/windows-release.node-test.mjs
pnpm.CMD exec prettier --check apps/desktop/scripts/windows-release.node-test.mjs
pnpm.CMD exec eslint apps/desktop/scripts/windows-release.node-test.mjs
```

The unchanged PowerShell AST and scoped diff commands from
[case 1.8](u12-case-1.8.md) also ran again; all four static checks exit 0.

2026-11-12 UTC focused run 00:18:41.461–00:18:42.070: 1/1 pass, exit 0.
Cumulative run 00:18:46.188–00:18:55.192: **14/14 pass**, exit 0, including
the current 1.8 rejection and both supported wrapper paths. Both 84-row input
pairs match SHA-256:
`FD95F4CF49A8AB3C14C9F157EDDC2B9381178BD48E19B8B48991958127E7C689`.

Ignored `tmp/evidence/five-pass-audit/u12-4.4-focused-01.log` SHA-256:
`88E81242D79692112EE6EC566D7E220C8A2CE5967E55C2DF313C60FE37626F09`.
`u12-4.4-green-01.log` SHA-256:
`BFE914F41FEE820A1C1DBCC731E06A57E47D236697F58F1112EBE51F38D0DCDD`.
Static 00:18:58.346–00:19:00.663, 27-row input SHA-256:
`39C6A89EEB02F73B56A37011249F356A33E163932CAC4C785F7BB70A54C5157A`;
log SHA-256 `8511547CFDBE38C65D62F7D4E827A74CCDD0E188A186893AFFC0377ACD3807C3`.

## Exact review binding

Closed 77-path `u12-4.4-review-inputs.txt` SHA-256:
`F3DC8B0FBCAEB1FE1DF924964D2DAAF3FDEBB4253022A14DB3580B893D21678E`.
Cumulative `u12-4.4-review.diff` SHA-256:
`73DAE6EE2A734600BE0BC5C0F00251572569D0F8C4BD61C38CBED343DB775BA4`.
Comparison to 1.8 confirms 76 unchanged paths and only the owning test changed.
Full G4, G9 and final integrated acceptance remain pending.
