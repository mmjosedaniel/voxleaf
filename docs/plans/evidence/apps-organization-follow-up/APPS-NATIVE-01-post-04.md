# Validation Report

Report ID: APPS-NATIVE-01-POST-04. Target: APPS-NATIVE-01 including separately
authorized APPS-SEEK-RACE. Mode: POST-CHANGE. Verdict: **PASS**, independent
validation gate. Environment: local PowerShell outside sandbox; PowerShell
7.6.5, Node 24.20.0, existing Corepack pnpm 11.15.1 and local offline models.

Starting/ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`. Empty index, before/after all six
identities unchanged. Identity recheck PASS.

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566` | `41d1e88909fe5f701058ac1abba2e47b8eb11f48` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `?? apps/desktop/scripts/native-smoke/resource-observation.mjs` | `105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8` | `42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `D2ED9AEEDE9DA8B6380BF9F8EED5C9DD954D6BE608B96CC268DAC4ED5CBE528F` | `5a34ac52db1d7d8f0a06b4ebc9f49f42544755b3` |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815` | `6d58be6af15cb48f106f89c59dac19da24fb8813` |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `?? apps/desktop/scripts/native-smoke.node-test.mjs` | `200401EDE116542BEA35752A3ED92D30FBEE318D7860D1BFAF66F685CBEA96AA` | `20ca00da5b3e3f138233a4228ec6dcfbac37cf6d` |
| `apps/desktop/package.json` | ` M apps/desktop/package.json` | `10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80` | `d5cdf23c57251449d50cdc5e56c9c324822745cc` |

## Fresh commands and outcomes

All eleven commands ran in order on 2026-10-12, 20:16:26–20:37:22 UTC.

1. `pnpm.cmd build:packages`: exit 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0.
3. `pnpm.cmd --filter @voxleaf/desktop test`: exit 0; 57 files/661 Vitest and 70 Node.
4. `pnpm.cmd format:check:typescript`: exit 0.
5. `pnpm.cmd lint:typescript`: exit 0.
6. `pnpm.cmd test:native-startup`: exit 0; protocol/lifecycle, ingress,
   accessibility, synchronization, images, restoration and cleanup.
7. `pnpm.cmd benchmark:reader:native`: exit 0; 10,000 blocks, six cycles.
   Positioning 390.2 ms, append 362.2 ms, reflow 109.7 ms. Final observers/URLs
   zero; closed DOM delta zero, heap +562,456 B, working set +8,974,336 B.
8. `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight`:
   exit 0; 39 Vitest + 17 driver + 5 portfolio.
9. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`: exit 0.
10. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`: exit 0.
11. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4`: exit 0, Spanish and English.
12. `git diff --check`: exit 0.
13. Independent structural comparison: exit 0; only the three authorized
    instrumentation/marker/matrix functions differ beyond approved extraction.

| Arm | Quick audible ms | Seek ms | Cancellation ms | Stable ms | Prepared startup ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Piper ES | 4588 | 10139 | 875 | 60107 | 6006 |
| Piper EN | 4404 | 9885 | 979 | 60068 | 5901 |
| Chatterbox ES | 41085 | 37128 | 297 | 60106 | 63423 |
| Chatterbox EN | 38565 | 35911 | 297 | 60223 | 62741 |

All four arms: zero underruns, buffering, stale playback, generated audio,
external requests and retained/discarded cleanup units. Chatterbox GPU returns
to 69 MiB. Piper exercises six rates; Chatterbox retains its rate presentation.

## Review

Scope/invariants/test integrity/privacy PASS. All 63 original functions accounted
for, 45 relocated (14 resource, 22 TTS, nine reader); entry retains ownership.
Original extraction: 9,862 total / 698 non-relocation lines. Separate authorized
diagnostic/repair increment: 291 lines, within 400, two files. No other source,
dependency, Rust/Python, CI, authority or historical changes.

All six unchanged RED cases now pass. Settling requires active, armed,
initially false observation with actual true-transition evidence. Other waits,
timeouts, polling, retries, assertions, old-key/new-highlight and cleanup proof
remain intact. This repair is separately authorized, not pure relocation.
Historical POST-02/03 cause remains unproven. Qwen runtime remains deferred.

No action within this validation gate. Independent change-review approval is
additionally required before director acceptance. Later units and final combined
gates remain pending. Raw captures are ignored under this Report ID. No Git
mutation occurred or is authorized.
