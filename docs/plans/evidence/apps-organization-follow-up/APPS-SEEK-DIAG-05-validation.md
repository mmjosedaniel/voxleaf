# Comparative diagnostic Validation Report

Report ID: APPS-SEEK-DIAG-05. Target: APPS-SEEK-DIAG-01.
Mode: POST-CHANGE, comparative diagnostic only.
Verdict: **BLOCKED for refactor acceptance**; both model commands passed but the
failure was not reproduced. Independent refactor validator.
Environment: local PowerShell outside sandbox; PowerShell 7.6.5, Node 24.20.0,
pnpm 11.15.1; unchanged local models/interpreters and process-only offline setup.

Starting/ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`. Index empty. Before/after identities
unchanged and equal DIAG-04. Identity recheck PASS.

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566` | `41d1e88909fe5f701058ac1abba2e47b8eb11f48` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `?? apps/desktop/scripts/native-smoke/resource-observation.mjs` | `105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8` | `42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `02A051F7ED14F4759504DA77E9F8D93734F55E5EEEDED782D377C37B866ED545` | `8a3c9c4f10e155f98167ca0b7578293e2a06ab9b` |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815` | `6d58be6af15cb48f106f89c59dac19da24fb8813` |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `?? apps/desktop/scripts/native-smoke.node-test.mjs` | `8C3BBAB04257F56D73794B62EE87FC1B8F35F6F7BFC422A6B328EB2B3D76C3C9` | `ec8b59800a2c829f1758a90f1915531f7e6434df` |
| `apps/desktop/package.json` | ` M apps/desktop/package.json` | `10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80` | `d5cdf23c57251449d50cdc5e56c9c324822745cc` |

1. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`: exit 0,
   2026-10-12 20:03:35.591–20:06:28.827 UTC.
2. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`: exit 0,
   20:06:41.232–20:09:38.389 UTC.
3. `git diff --check`: exit 0.

Exactly two invocations, Spanish then English. DIAG-04 deterministic evidence
was explicitly reused for identical source inputs. Spanish/English seek
restart: 10,007/10,344 ms; cancellation: 940/536 ms; stable playback:
60,015/60,205 ms; quick audible: 4,566/4,794 ms; prepared startup:
6,015/5,829 ms. Both six-rate matrices pass, with zero reported underruns,
buffering, stale playback, generated audio, external requests and retained/
discarded cleanup units.

Neither emitted a failure diagnostic, so there are no failed-predicate or
latch values. Prior Spanish is insufficient to reproduce the failure in this
instrumented run. This does not identify historical cause, prove repair or
eliminate instrumentation timing effects.

Scope, diagnostic invariants, test integrity and privacy PASS. Same two-file
190-line diagnostic delta, all original predicates/deadlines retained.
Raw evidence remains ignored under the Report ID. No further calls or Git
mutations. Further investigation requires a distinct bounded director order.
