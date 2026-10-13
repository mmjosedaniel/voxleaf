# Diagnostic Validation Report

Report ID: APPS-SEEK-DIAG-04-VALIDATION. Target: APPS-SEEK-DIAG-01.
Mode: POST-CHANGE, diagnostic only. Verdict: **BLOCKED for refactor acceptance**;
all diagnostic commands passed, reproduction inconclusive.
Environment: local PowerShell outside sandbox; PowerShell 7.6.5, Node 24.20.0,
pnpm 11.15.1; existing models/interpreters and process-only offline settings.

Starting/ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`. Empty index; all six before/after
identities identical. Identity recheck PASS.

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566` | `41d1e88909fe5f701058ac1abba2e47b8eb11f48` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `?? apps/desktop/scripts/native-smoke/resource-observation.mjs` | `105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8` | `42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `02A051F7ED14F4759504DA77E9F8D93734F55E5EEEDED782D377C37B866ED545` | `8a3c9c4f10e155f98167ca0b7578293e2a06ab9b` |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815` | `6d58be6af15cb48f106f89c59dac19da24fb8813` |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `?? apps/desktop/scripts/native-smoke.node-test.mjs` | `8C3BBAB04257F56D73794B62EE87FC1B8F35F6F7BFC422A6B328EB2B3D76C3C9` | `ec8b59800a2c829f1758a90f1915531f7e6434df` |
| `apps/desktop/package.json` | ` M apps/desktop/package.json` | `10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80` | `d5cdf23c57251449d50cdc5e56c9c324822745cc` |

Commands:

1. `pnpm.cmd build:packages`: exit 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0.
3. `pnpm.cmd --filter @voxleaf/desktop test`: exit 0; 661 Vitest + 63 Node tests.
4. `pnpm.cmd format:check:typescript`: exit 0.
5. `pnpm.cmd lint:typescript`: exit 0.
6. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`: exit 0;
   one invocation, 2026-10-12 19:58:17.589–20:02:34.508 UTC.
7. `git diff --check`: exit 0.

Seek restart 9,937 ms; cancellation 480 ms; stable playback 60,244 ms.
Quick audible 5,022 ms with 23,451 ms lead; prepared startup 5,821 ms with
61,295 ms playable audio. Six-rate matrix passes. Zero reported underruns,
buffering, stale playback, persisted audio, external requests and retained/
discarded cleanup units.

No failure diagnostic was emitted. Because the logging is failure-only, this
success supplies neither a failed predicate nor latch values. It is not a
repair or an explanation of POST-02/03.

Scope, diagnostic invariants, test integrity and privacy PASS: 190 incremental
lines in the two approved files, within 240. All five original predicates,
timeouts and order remain intact. Observer is bounded, reset before action,
disconnected on stop and unused by acceptance. Existing assertions remain.
Raw captures are ignored under this Report ID.

Action: preserve all outcomes; root cause unresolved. The subsequent director
order authorizes one separate Spanish-then-English comparative diagnostic on
these unchanged files to reproduce the preceding-model context of the full-run
failures. No source unit is accepted by this report.
