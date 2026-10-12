# Documentation-only Validation Report

Report ID: APPS-ORG-BLOCKED-DOCS-01. Target ID: APPS-ORG-BLOCKED-DOCS.
Mode: FINAL, documentation-only stop-state review; no campaign acceptance.
Verdict: FAIL. Environment: normal local PowerShell outside sandbox.
Starting/ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.

Validated paths, in exact table order:

1. `docs/plans/active/apps-organization-follow-up.md`
2. `docs/plans/active/README.md`
3. `docs/README.md`
4. `docs/plans/evidence/apps-organization-follow-up/README.md`
5. `docs/plans/evidence/apps-organization-follow-up/APPS-NATIVE-01-order-01.md`
6. `docs/plans/evidence/apps-organization-follow-up/APPS-NATIVE-01-post-01.md`
7. `docs/plans/evidence/apps-organization-follow-up/APPS-NATIVE-01-post-02.md`
8. `docs/plans/evidence/apps-organization-follow-up/APPS-NATIVE-01-diagnostic-01.md`
9. `docs/plans/evidence/apps-organization-follow-up/APPS-NATIVE-01-post-03.md`

Exact porcelain output is the prefix below, one space, then the full path above.

| Path | Prefix | SHA-256 | Filter-aware index blob |
| --- | --- | --- | --- |
| 1 | ` M` | `C89547FB46B1C223FDDB34E756569675E45A1D01037D690729CBF7F4514E5F47` | `8440513d038d5adfa1e77b668a09676e285bbdac` |
| 2 | ` M` | `26F3BDC7A05B4FDB91E8B4ADCC9FE1D928DCD6D1FFAEB672F1BDB9B4C440C904` | `bc52c612b80d3d36a07050a611c95eb7dedb71ba` |
| 3 | ` M` | `CA51EE45E44F45AE09E9E9B77FE552B120FEE7C507D43ED525A478D23605B1B8` | `5030063508727ba19a770591c386e88dc087a2b5` |
| 4 | `??` | `140285CB27FF228A288A5074C86FE4D1F7C54D08D5C2C1D361B7C96623C3E078` | `6317872f0a1d584cc79603cc10bf2cba38198fdc` |
| 5 | `??` | `33A9339A0780CCDC06984F27ECA05055351FB3D54D25F0B53B08D5EC9930E92E` | `23eda0187d7b3081dfc7357a2a99e7363c000583` |
| 6 | `??` | `7D334C68C8816854FAE45CF41EF591E902DD525BB638799C09B18136C28112BA` | `e1bf72566026ef85784069f685f4e89a4fbfc254` |
| 7 | `??` | `86F15A99021C935498684B8E585E5A710D9970C2CF79E00B5103627D80E5F24C` | `9363c16fdce2374e1eaf4d7cd2e38defa090fbf2` |
| 8 | `??` | `8DC75121F86522B844370D2E678C3030D2EC6528655442ED422B5E6841B60177` | `d56c6dcb9296b5cad60a0d6274a89b42c200a3be` |
| 9 | `??` | `22BFB971B6E59B3D42F01FC47C0195BA1BF3C53EFF231BC09FF93B5AB05A44AB` | `d8ae8bcea6bae7b4552bb4ee6d0d279c80287149` |

Identity recheck: PASS; all nine docs stable, all six source identities equal
POST-03, HEAD unchanged and index empty. Captures are ignored under
`tmp/evidence/apps-organization-follow-up/APPS-ORG-BLOCKED-DOCS-01/`.

Commands, all exit 0:

- `& tmp/evidence/apps-organization-follow-up/APPS-ORG-BLOCKED-DOCS-01/identity.ps1 before`
- `node tmp/evidence/apps-organization-follow-up/APPS-ORG-BLOCKED-DOCS-01/check-docs.mjs`: 194 local links, one anchor, twelve sections and twelve configured pnpm references pass; exactly six source plus nine doc paths changed.
- `git diff --check`
- `git check-ignore tmp/evidence/apps-organization-follow-up/APPS-ORG-BLOCKED-DOCS-01/check-docs.mjs`
- `pnpm.cmd check:evidence`: index guard only; unstaged receipts were reviewed directly.
- `& tmp/evidence/apps-organization-follow-up/APPS-ORG-BLOCKED-DOCS-01/identity.ps1 after`
- `git diff --name-only -- docs/plans/completed docs/plans/evidence ':!docs/plans/evidence/apps-organization-follow-up'`: empty output.

Diff scope, test-integrity and privacy/artifact review: PASS. No application
tests rerun. Publication/images and historical/completed files unchanged; plan
active, no archived copy or redirect.

Invariant review: FAIL only because section 8 still said the Node suite was
proposed/not yet present, contradicting authored/registered/passing-test status.
Other baseline/post-change failure/diagnostic/unaccepted/pending/Qwen distinctions
were accurate. Action required: correct that paragraph only and issue a fresh
documentation-only report. Runtime acceptance remains blocked independently.

The director subsequently made the exact wording correction; this receipt
preserves the original FAIL and does not approve the revised document.
