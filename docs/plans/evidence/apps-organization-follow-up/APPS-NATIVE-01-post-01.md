# Validation Report

Report ID: APPS-NATIVE-01-POST-01

Target ID: APPS-NATIVE-01. Mode: POST-CHANGE. Verdict: FAIL.
Environment: local PowerShell outside sandbox; PowerShell 7.6.5,
Node 24.20.0, existing Corepack pnpm 11.15.1. All acceptance execution used
`require_escalated`. Validator made no source, test, documentation or Git edits.

Starting and ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.

| Validated path | Exact porcelain output | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566` | `41d1e88909fe5f701058ac1abba2e47b8eb11f48` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `?? apps/desktop/scripts/native-smoke/resource-observation.mjs` | `105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8` | `42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `5695681140C7481AA78EEC8D4602F771C4C56D6975528311B06C1FDFE9E342C3` | `02b39e1a01272d5a2fabe78db2eb045b282ce63c` |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815` | `6d58be6af15cb48f106f89c59dac19da24fb8813` |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `?? apps/desktop/scripts/native-smoke.node-test.mjs` | `3F259E3796BCE23912E6419D3FB968D51D375B1E2035270A57C7B68F1702A1FD` | `e6ecf11c8ea692236eed30980cc82ae50f29a18f` |
| `apps/desktop/package.json` | ` M apps/desktop/package.json` | `10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80` | `d5cdf23c57251449d50cdc5e56c9c324822745cc` |

Identity recheck: PASS; identities and HEAD unchanged, index empty.

## Commands and outcomes

1. `pnpm.cmd build:packages`: exit 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0.
3. `pnpm.cmd --filter @voxleaf/desktop test`: exit 0; unchanged 57 Vitest files / 661 tests and 62 Node tests. Eleven new tests discovered once.
4. `pnpm.cmd format:check:typescript`: exit 0.
5. `pnpm.cmd lint:typescript`: exit 1; `native-smoke.node-test.mjs:368:23`, `'URL' is not defined`, `no-undef`. This is a patch regression against the passing baseline.
6. Commands 6-11 of the [approved order](APPS-NATIVE-01-order-01.md#commands-and-outcomes): NOT RUN after lint failure. Native startup, benchmark, preflight and all four post-change model arms remain unvalidated.
7. `git diff --check`: exit 0.

Diff scope: PASS, six source paths / 9,861 total changed lines / conservative
697 non-relocation lines. Only acknowledged director documentation outside scope.

Invariant review: static PASS, runtime acceptance pending. All 63 original
functions occur once; 45 moved as 14 resource / 22 TTS / 9 reader functions.
Structural AST comparison preserves original functions and literal scripts
after restoring only 29 approved clock/timer references. Four printer-text
differences were reviewed as wrapping only. Constants, assertions, failure map,
scenario/report structure, entry ordering and cleanup remain equivalent.
Factories have explicit consumed dependencies, declarations and returns only;
no scenario cross-import, executable import, generic state bag or deeper-root
calculation. Existing tests/assertions unchanged and new coverage meaningful.

Test-integrity review: FAIL for required lint readiness, not weakened assertions.
Privacy/artifact review: PASS. Raw captures/comparison scripts are ignored under
`tmp/evidence/apps-organization-follow-up/APPS-NATIVE-01-POST-01/`.

Action required: add an explicit `URL` import from `node:url` in the new Node
suite, keep the ceiling, then rerun all eleven commands under a fresh report.
This FAIL report is immutable and cannot accept a corrected patch.

## CORRECTION ORDER 1

Target ID: APPS-NATIVE-01. Failed criterion: required lint gate.
Allowed file: `apps/desktop/scripts/native-smoke.node-test.mjs` only.
Required correction: add `import { URL } from "node:url";` alongside the existing
Node imports. No other source, assertion, threshold, dependency or behavior edit.
Preserve user/director work and empty index. The original ceiling remains binding.
Revalidation: all eleven commands and static/identity review from the approved
order, plus `git diff --check`, outside sandbox with a new Report ID.
