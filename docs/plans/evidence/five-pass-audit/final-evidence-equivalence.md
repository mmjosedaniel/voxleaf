# Current evidence equivalence comparison

Normal-host read-only comparison on2026-11-12 at00:59UTC, unchanged HEAD
`a3241571944530d468e2f4f2d37a0a2394a8df84`, empty index. This is an input
comparison for final independent assessment, not a new test or performance run.

All original before/after pairs are identical and every recorded relative or
absolute file hash matches the current file. Fresh discovery matches original
source membership and all251 emitted EPUB/shared members. Both G6 and Chromium
G10 retain exactly their four Vite output members and hashes.

| Result | Recorded rows | Discovered source members | Original input SHA-256 |
| --- | ---: | ---: | --- |
| G1, G7 controls, G7 Reader | 614 each | 360 each | `F498DA166148C254CBFBE58E660939C0D9AC9AA8E5FE5FA27A898957D2F17905` |
| G2 | 457 | 203 | `D0426E619F16D2E91FE9A23DB7CF7CB19D5D2F0410A9923BAD2D7BB64CD212DB` |
| G6 | 633 | 368 | `757372AE5F036A76F9A0245945B6F65A343994CADD1981C7E9822D357DB2D5A5` |
| G10 Chromium | 640 | 368 | `E0CA1DFBCBC174A88F85C1A75CAD0863E60CAB3A711CEC2005C181D6D3F8070C` |
| G11 TypeScript types | 637 | 368 | `00DBD9D75B21E05B28EEC1BCACB425F26C3057CFAB3D981538904457C9BBA2F2` |

The original basenames and exact commands remain in the combined, G6 and G10
receipts. Their source scopes exclude Python, Rust/release output and native
JavaScript harnesses; U13–U16 changes therefore do not enter these input sets.
TypeScript configuration retains allowJs=false and includes the captured
renderer/tests/configuration TypeScript files.

Current resolution is Node24.18.0, offline Corepack/pnpm11.15.1 through the
repository shim, Vitest5.0.5, TypeScript6.0.3, Vite8.3.4 and Playwright1.64.1.
Selected Chromium/headless revision1248,156.0.8078.4, browser registry and
executable hashes match. Original broad captures of other cached browser
revisions do not imply their use. PowerShell7.6.9 and the executable hash
recorded for G10 also match; no browser or test process was started.

G6/G10/types bind Node directly and omit .nvmrc; the other four captures include
the unchanged .nvmrc. The two G7 leaf logs record Node version and the shared
pinned session, without an executable hash per leaf. Rather than infer that
missing per-leaf identity, final G7 controls and Reader were subsequently rerun
with direct Node and PowerShell executable hashes added to the complete capture.
Those fresh32/32 and68/68 results supersede the two earlier G7 leaves; see
[combined gates](combined-gates.md#g7-renderer-tool-identity-closeout).
G10's original timing log records competing runners paused; this comparison
does not create a new machine-load trace or new resource measurements.

Ignored `final-reuse-host-01.json` SHA-256:
`D8C768C2C674BF0B841A82FD20C2FFD95227DE6CEE21AD23F115697F21E9297C`.
Exact-membership/environment addendum `final-reuse-host-01-membership.json`:
`4AE32A3DCA8ECBC1A0E0B162A904069F51AA9DD87D6A7412EFD9AD249AA5FBB4`.

The29 original U13 scoped static rows also match, but their historical installed
Python module-tree hashes were absent. Three affected Python static checks were
therefore rerun on the current2,642-input G3 environment; see the
[fresh checks](combined-gates.md#g11-root-inventory-python-checks).
The final global JSON formatter and diff checks cover the remaining U13 leaves.
Fresh G5/Rust checks supersede the earlier native unit identities after core
regeneration. Final G4/native/admission/installer checks remain separate.

## Final post-package comparison

After final native and Windows lifecycle execution, normal-host
`final-reuse-host-02.ps1` repeats the seven current comparisons, substituting
the fresh G7 controls/Reader `final-02` receipts for their superseded originals.
Every paired hash, current file hash, discovered source member,251 package
exports and applicable four-file browser bundle matches. No source or output
member was added or lost. The resolved environment equals the first comparison,
including actual Node/pnpm/browser/runtime identities. The desktop-browser
captures bind Node directly and exclude .nvmrc from their original source scope;
that known scope distinction is preserved rather than reported as file drift.

`final-reuse-host-02.json` SHA-256:
`2BC5D443AEA1EC406065BDF9F1F5EA5F81838AAC335251D9A8CD818927968973`.
Its separate summary records zero gaps and environmentMatch=true. This is a
current read-only comparison, not a new execution of those tests; final independent
assessment must name and assess the original attributed results.
