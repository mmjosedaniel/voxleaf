# Observation race regression baseline

Report ID: APPS-SEEK-RACE-RED-01. Target: APPS-SEEK-RACE.
Mode: BASELINE, deliberate regression RED. Verdict: **BASELINE-FAIL**, expected
failures independently confirmed before repair.
Environment: local PowerShell outside sandbox; Node 24.20.0, pnpm 11.15.1.

Starting/ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`; empty index and unchanged before/after
identities. Identity recheck PASS.

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566` | `41d1e88909fe5f701058ac1abba2e47b8eb11f48` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `?? apps/desktop/scripts/native-smoke/resource-observation.mjs` | `105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8` | `42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `02A051F7ED14F4759504DA77E9F8D93734F55E5EEEDED782D377C37B866ED545` | `8a3c9c4f10e155f98167ca0b7578293e2a06ab9b` |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815` | `6d58be6af15cb48f106f89c59dac19da24fb8813` |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `?? apps/desktop/scripts/native-smoke.node-test.mjs` | `200401EDE116542BEA35752A3ED92D30FBEE318D7860D1BFAF66F685CBEA96AA` | `20ca00da5b3e3f138233a4228ec6dcfbac37cf6d` |
| `apps/desktop/package.json` | ` M apps/desktop/package.json` | `10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80` | `d5cdf23c57251449d50cdc5e56c9c324822745cc` |

1. `pnpm.cmd --filter @voxleaf/desktop test`: exit 1. All 661 Vitest pass;
   Node 70 reported tests, 66 pass and four failures (three subtests and parent).
2. `git diff --check`: exit 0.

| Exact production predicate case | Actual | Expected | Outcome |
| --- | --- | --- | --- |
| Coalesced post-action false/true/false | false | true | Expected failure |
| True before arming | true | false | Expected failure |
| Stopped after transition, attribute still true | true | false | Expected failure |
| No transition | false | false | Pass |
| Queued pre-arm history | false | false | Pass |
| Earlier seek then reset | false | false | Pass |

Scope, test integrity and privacy PASS. Only the approved regression test
changed from DIAG-05; the old runtime predicate stayed unchanged. Tests execute
the actual installation, marker and acceptance scripts with synthetic state.
Production pending navigation is cleared after containment and reader placement;
there is no required minimum duration. This establishes a harness observation
defect, not the unknown cause of historical POST-02/03.

## Conditional repair instruction, now approved

Order APPS-SEEK-RACE-FIX-01 changes only the next-seek settling predicate in
`tts-scenarios.mjs`, at most twelve lines. Require active instrumentation,
armed observation, initial false and observed true. Preserve regression tests,
the same 90-second deadline and every other predicate/action/assertion/stage.
No product source change or scheduling delay. Format the exact allowed file and
run host lint preflight. Independent full eleven-command native-unit acceptance
and conservative independent change review are required before proceeding.
