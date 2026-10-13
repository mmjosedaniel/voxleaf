# Validation Report

Report ID: APPS-NATIVE-01-POST-03

Target ID: APPS-NATIVE-01. Mode: POST-CHANGE. Verdict: FAIL.
Environment: local PowerShell outside sandbox; PowerShell 7.6.5, Node 24.20.0,
existing Corepack pnpm 11.15.1. Existing models/interpreters and process-only
offline setup; no installations, downloads or machine/firewall changes.

Starting and ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.

| Validated path | Exact porcelain output | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566` | `41d1e88909fe5f701058ac1abba2e47b8eb11f48` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `?? apps/desktop/scripts/native-smoke/resource-observation.mjs` | `105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8` | `42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `5695681140C7481AA78EEC8D4602F771C4C56D6975528311B06C1FDFE9E342C3` | `02b39e1a01272d5a2fabe78db2eb045b282ce63c` |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815` | `6d58be6af15cb48f106f89c59dac19da24fb8813` |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `?? apps/desktop/scripts/native-smoke.node-test.mjs` | `ED1585722B2A098A4E835B525916CFA0E01C06E99068F63697DC047CDEE2AEE9` | `ff1f13b2df00e319bd7635b0155db5922f715673` |
| `apps/desktop/package.json` | ` M apps/desktop/package.json` | `10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80` | `d5cdf23c57251449d50cdc5e56c9c324822745cc` |

Identity recheck: PASS; before/after identities match, HEAD unchanged, index
empty. Raw evidence is ignored under
`tmp/evidence/apps-organization-follow-up/APPS-NATIVE-01-POST-03/`.

## Commands and outcomes

1. `pnpm.cmd build:packages`: exit 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0.
3. `pnpm.cmd --filter @voxleaf/desktop test`: exit 0; 57 files / 661 Vitest tests and 62 Node tests, including all eleven new cases.
4. `pnpm.cmd format:check:typescript`: exit 0.
5. `pnpm.cmd lint:typescript`: exit 0.
6. `pnpm.cmd test:native-startup`: exit 0; packaged protocol/service, reader, restoration and cleanup gates passed.
7. `pnpm.cmd benchmark:reader:native`: exit 0; target positioning 404.1 ms, append 366.4 ms, reflow 110.2 ms. Six cycles ended with zero observers/object URLs; closed DOM delta 0, heap +562,488 bytes, working set +925,696 bytes.
8. `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight`: exit 0; 39 Vitest, 17 driver and 5 portfolio tests.
9. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`: exit 0. Quick 4,403 ms / 27,305 ms lead; stable 60,181 ms; cancellation 412 ms; prepared 5,983 ms / 64,071 ms lead; seek restart 10,391 ms. Zero underruns, buffering, stale audio, persisted audio, external requests and cleanup units.
10. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`: exit 1 after 174.75 seconds, 2026-10-12 19:24:58Z through 19:27:52Z. Failure: `Adaptive exact-host TTS matrix failed during adaptive exact-host next-segment seek [webdriver-condition-timeout].` Then `Exact bilingual portfolio packaged matrix failed.`
11. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4`: NOT RUN after recurring runtime failure, as directed.
12. `git diff --check`: exit 0.
13. Independent structural/scope comparison: passed all 63 original functions and constants, 45 moved, unchanged literal scripts after only approved clock/timer normalization.

Diff scope: PASS; six allowed paths, 9,862 total / conservative 698 non-relocation
lines. Test-integrity and privacy/artifact review: PASS. No dependency, Rust,
Python, CI, generated/frozen authority or unrelated source change; all existing
assertions, commands, deadlines, retries and thresholds remain intact.

Invariant review: FAIL for complete runtime acceptance, static review passes.
English selected a compatible profile and completed the six-rate matrix with
final playing/100%/failure-none state, first activation 750 ms and zero recurring
overhead. It failed at next-segment seek without `ADAPTIVE_TTS_SEEK_WAIT`.
Existing output cannot distinguish next-button, cleared-highlight state or
navigation-settling as the failed early predicate. The failed path, shared wait
callback and constants remain equivalent to baseline; default clock wraps
Date.now. No concrete injection defect was found.

Baseline passed, POST-02 failed, the isolated diagnostic passed and POST-03
failed again on identical patch identities. This proves intermittent outcomes
on this patch, not their cause or a repair. Later English and both Chatterbox
post-change gates remain unaccepted. Failed English execution does not provide
complete final cleanup/performance evidence. Qwen stays deferred.

Action required: withhold unit acceptance and preserve all failures. A bounded
investigation must identify the failed English seek predicate and cause before
selecting a correction; current evidence does not justify a speculative edit.
No further retry, Chatterbox execution, source change or Git mutation occurred.
Any correction needs a new immutable report and complete acceptance run.
