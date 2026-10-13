# Diagnostic Validation Report

Report ID: APPS-SEEK-DIAG-01-VALIDATION. Target: APPS-SEEK-DIAG-01.
Mode: POST-CHANGE, diagnostic only. Verdict: **FAIL**, formatting only.
Environment: local PowerShell outside sandbox; PowerShell 7.6.5, Node 24.20.0,
pinned Corepack pnpm 11.15.1. Independent refactor validator, no source writes.

Starting/ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`. Index empty; before/after identities
unchanged. Identity recheck PASS.

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566` | `41d1e88909fe5f701058ac1abba2e47b8eb11f48` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `?? apps/desktop/scripts/native-smoke/resource-observation.mjs` | `105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8` | `42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `A2385755CAC35A865021538CF88FA611CC864797C6BCD8ED45109694BEE99F74` | `e0115b259ceb9b9e97a130cf1c6878410e75f14c` |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815` | `6d58be6af15cb48f106f89c59dac19da24fb8813` |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `?? apps/desktop/scripts/native-smoke.node-test.mjs` | `CAF6F89D02569881B6DABFE573EC27ED31BC70FE5A572AE9340E4ECEE9917887` | `166bea249871a4891abf1429d8542cce89e731ae` |
| `apps/desktop/package.json` | ` M apps/desktop/package.json` | `10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80` | `d5cdf23c57251449d50cdc5e56c9c324822745cc` |

Commands:

1. `pnpm.cmd build:packages`: exit 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0.
3. `pnpm.cmd --filter @voxleaf/desktop test`: exit 0; 661 Vitest + 63 Node tests.
4. `pnpm.cmd format:check:typescript`: exit 1, only the new Node test file.
5. `pnpm.cmd lint:typescript`: NOT RUN after formatting failure.
6. English Piper instrumented portfolio command from the diagnostic order:
   NOT RUN.
7. `git diff --check`: exit 0.

Scope, static invariants, test integrity and privacy PASS. The incremental
two-file patch is 184 added/removed lines, within 240. All five original wait
predicates, deadlines and ordering are unchanged. The observer test exercises
coalesced mutations, pre-arm history reset, no transition, capped counts and
stopped callbacks. Raw captures remain ignored under this Report ID.

Action: exact-file Prettier correction only, then fresh diagnostic validation.
This report provides no model-backed evidence and no source-unit acceptance.
