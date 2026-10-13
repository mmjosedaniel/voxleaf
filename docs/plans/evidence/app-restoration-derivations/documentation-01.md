# Validation Report
Report ID: APP-RESTORATION-01-DOCS-FINAL-01
Target ID: APP-RESTORATION-01
Mode: FINAL
Verdict: FAIL
Environment: local PowerShell outside sandbox; every review/check used require_escalated. Documentation-only closure, not a runtime rerun.
Starting HEAD SHA: 6102b72758497b07356d864915502d3dc443a0b5
Ending HEAD SHA: 6102b72758497b07356d864915502d3dc443a0b5
Validated paths: the following closed 13-path document allowlist, including both sides of the plan move.
Validated path identities:

| Path | Exact porcelain before/after | Worktree SHA-256 before/after | Filter-aware expected index blob before/after |
| --- | --- | --- | --- |
| docs/README.md | ` M docs/README.md` | C3FFE904B18A2ADB32ACB83ECEA8266F027CBBDAA9250BA8B01458999E0F6D6A | e413f06d25e856a0027b9bb67a750e8c5ce6f389 |
| docs/development/testing.md | ` M docs/development/testing.md` | 8A784CD885DCD6FC8FB5335B8CEE10979BCFB75DECB19975E4AE9FF24DD92F26 | db42b248c9c7f7642712059a9b327d83df774eec |
| docs/plans/active/README.md | ` M docs/plans/active/README.md` | 9FA065ADDB4626BBCF21EEE32FF44750C9E5E2514CBAC56DEEBB495CD30F1B67 | 8429c40455f42b43ff1ea1faf9e7c25ef904d006 |
| docs/plans/active/app-restoration-derivations.md | ` D docs/plans/active/app-restoration-derivations.md` | DELETED | DELETED |
| docs/plans/completed/README.md | ` M docs/plans/completed/README.md` | 8CB50681CD5412DD65BF6805209DC94D7CDAD74CEBF050AEF18418056286F246 | 86b9146eec01fe76369b249fac46c04a997daea0 |
| docs/plans/completed/app-restoration-derivations.md | `?? docs/plans/completed/app-restoration-derivations.md` | 57E210590A4591BB86CD90F250E4D93C3CD3035FAB526370968D107CE7D8CAD8 | b78c7c2d2ff64c91c264a47262f7973f384606cb |
| docs/plans/evidence/app-restoration-derivations/audit-and-order.md | `?? docs/plans/evidence/app-restoration-derivations/audit-and-order.md` | 5869F11F2F2CAE885B2D3468712386F3DEC28B4D4A7AD9E27FB6DDC9BF0F7224 | 56a871f123cbf61afac2e4d083875c30273f7047 |
| docs/plans/evidence/app-restoration-derivations/baseline-01.md | `?? docs/plans/evidence/app-restoration-derivations/baseline-01.md` | 9719F6DF89AE2A3B8C7049B4401ADBFC91009F57D8B9176EC8437348D359872D | 7bc1003a6c428e4da1b9c4647b864064883ed13a |
| docs/plans/evidence/app-restoration-derivations/characterization-01.md | `?? docs/plans/evidence/app-restoration-derivations/characterization-01.md` | 814F8BE273D4C108FBBAB48F6BC3A8D987BBB081A8C20565CF024FE02056C089 | b58964c7fe648c078cd419797d2199bf77308b46 |
| docs/plans/evidence/app-restoration-derivations/post-change-01.md | `?? docs/plans/evidence/app-restoration-derivations/post-change-01.md` | 7F73CD1ED704D3D203D64FD2F5CE0750ED49F3C6D6071DCBE887F4CA81627500 | a7259bd717f1f9157d3df9353b5cd43e3ec74513 |
| docs/plans/evidence/app-restoration-derivations/post-change-02.md | `?? docs/plans/evidence/app-restoration-derivations/post-change-02.md` | BDBA09AF5DF1E8B37D973384A3B35645B7CCD3456B0A04562F067A84B753C15A | 725025964ea2bc8e042d99a847114d9f843f431a |
| docs/plans/evidence/app-restoration-derivations/package-01.md | `?? docs/plans/evidence/app-restoration-derivations/package-01.md` | 6C5530E04CAEFA49B5DB21F5A869A96BE3B6EFA0B6DC453DE3E81FC29646CC9B | bab037088df8357fcc002caeaed400f094ec4c96 |
| docs/plans/evidence/app-restoration-derivations/final-01.md | `?? docs/plans/evidence/app-restoration-derivations/final-01.md` | DD96597477501EBB6280A7E89FF58D0BF5F26090546F90F205A6114C3472402A | 8c483c876005f4e2a4236146893cfd6e8fc479d9 |

Identity recheck: PASS, all 13 document identities, HEAD and whole-worktree status identical before/after; index empty. Four source identities were independently rechecked against FINAL-01 and remain exact: App.tsx SHA256 42CE5052CC0764BE433EE198E2575DA525B0219FF36942890A1A0A891A1B8684/blob dcde5c04d6ad012545af44e34dfc132115d2984f; App.test.tsx D4CF0419C571C47D0F9BD80F4DF4A71270B8EDECD57CD64A635638E8469B566D/c405672a1c1d003bdb0698d56fd755338ec466ef; app-reader-restoration.ts 813A4E05661A9C8AF345F0DFE7486DEEB4DA681C6FCF3F4C5BA0756D32F8CEB7/a224767dcbe0e303fb6220436140317af59ab2a7; app-reader-restoration.test.ts E7E84DFDCE1FC192BDF2D289068D119B50E16A15D9A0770444A7C9928C155200/da36a73875db67c6b820912d40847ca44ad68920. Their porcelain states still match FINAL-01.
Commands and outcomes:
1. `node tmp/evidence/app-restoration-derivations/docs-final-check.mjs` -> exit 1 solely for the two untracked-document whitespace findings below. Temporary checker reads files/Git only; 12 numbered sections, three complete milestones, 24 maintained/new local links, zero broken links or incoming active-plan links, four byte-identical copied reports, unchanged source identities, 490 source changed lines, 17 exact overall source/document paths and zero historical-body/diagram edits all pass.
2. `git diff --no-index --check -- NUL docs/plans/evidence/app-restoration-derivations/baseline-01.md` -> exit 3, trailing whitespace on lines 3, 4, 5, 6.
3. `git diff --no-index --check -- NUL docs/plans/evidence/app-restoration-derivations/characterization-01.md` -> exit 3, trailing whitespace on lines 3, 4, 5, 6.
4. Same no-index whitespace check for each other new document -> exit 1 for expected differing contents, no whitespace errors. Copied CRLF receipts emit normalization warnings consistent with .gitattributes; raw bytes intentionally remain identical to immutable originals.
5. `git diff --check` -> exit 0 for tracked changes.
6. `git diff --cached --quiet` -> exit 0 before and after.
7. Manual full moved-plan, index/testing-map diff and baseline/characterization/audit receipt review -> content accurate and complete. No runtime commands rerun because accepted source identities are unchanged.
Diff scope: PASS, exact four accepted source/test paths plus 13 authorized document paths; source change remains 490 lines. Active plan is DELETED, completed plan exists with no redirect, indexes point to completed plan, other historical plan bodies and canonical system diagram remain unchanged.
Invariant review: PASS, plan records all three extractions, retained owner/effects/lifecycle, tests, complete host outcomes and separate prior TS2322 failure/correction. It preserves no-staging/no-commit/no-push/no-PR boundaries, limited model/performance claims and nonfatal warnings. Testing map reflects actual pure and integration cases. Diagram review accurately records no new architectural boundary.
Test-integrity review: PASS, unchanged source/test identities preserve FINAL-01 acceptance. Copied post-change-01, post-change-02, package-01 and final-01 receipts are byte-identical to ignored immutable originals; baseline/characterization director transcriptions faithfully preserve report IDs, commands, outcomes, identities, limits and chronology.
Privacy/artifact review: PASS, concise Markdown receipts only; no raw logs, private data, books, audio, generated sources, model files or unrelated artifacts added. Temporary checker/raw captures remain under ignored tmp/evidence/app-restoration-derivations/.
Action required: Remove only trailing hard-break spaces from lines 3-6 in director-transcribed baseline-01.md and characterization-01.md. Preserve their content and all copied immutable validator receipt bytes. Freeze documents and rerun this complete document closure with new Report ID; preserve this FAIL report. No source/runtime revalidation required if source identities remain unchanged.
