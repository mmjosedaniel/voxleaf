# Validation Report

Report ID: APPS-NATIVE-01-POST-02

Target ID: APPS-NATIVE-01. Mode: POST-CHANGE. Verdict: FAIL.
Environment: local PowerShell outside sandbox, PowerShell 7.6.5, Node 24.20.0,
existing Corepack pnpm 11.15.1, existing models and process-only offline setup.
All execution used `require_escalated`; no installs, downloads or host/firewall
changes. Commands ran 2026-10-12 19:01:00Z through 19:10:15Z.

Starting and ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.

| Validated path | Exact porcelain output | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566` | `41d1e88909fe5f701058ac1abba2e47b8eb11f48` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `?? apps/desktop/scripts/native-smoke/resource-observation.mjs` | `105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8` | `42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `5695681140C7481AA78EEC8D4602F771C4C56D6975528311B06C1FDFE9E342C3` | `02b39e1a01272d5a2fabe78db2eb045b282ce63c` |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815` | `6d58be6af15cb48f106f89c59dac19da24fb8813` |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `?? apps/desktop/scripts/native-smoke.node-test.mjs` | `ED1585722B2A098A4E835B525916CFA0E01C06E99068F63697DC047CDEE2AEE9` | `ff1f13b2df00e319bd7635b0155db5922f715673` |
| `apps/desktop/package.json` | ` M apps/desktop/package.json` | `10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80` | `d5cdf23c57251449d50cdc5e56c9c324822745cc` |

Identity recheck: PASS; all six identities and HEAD unchanged, index empty.
Removing only the added URL import reproduces POST-01's test hash exactly.

## Commands and outcomes

1. `pnpm.cmd build:packages`: exit 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0.
3. `pnpm.cmd --filter @voxleaf/desktop test`: exit 0; 57 files / 661 Vitest and 62 Node tests, eleven new cases once.
4. `pnpm.cmd format:check:typescript`: exit 0.
5. `pnpm.cmd lint:typescript`: exit 0; missing-import defect corrected.
6. `pnpm.cmd test:native-startup`: exit 0; packaged protocol/supervision, ingress, accessibility/synchronization, images, restart/restoration and cleanup, zero errors/external requests.
7. `pnpm.cmd benchmark:reader:native`: exit 0; 10,000 blocks and six cycles pass. Target 287.5 ms, append 357.3 ms, reflow 112 ms. Final observers/Blob URLs zero; closed DOM delta 0, heap +575,228 bytes, working set +13,963,264 bytes.
8. `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight`: exit 0; 39 Vitest, 17 driver and 5 portfolio tests.
9. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`: exit 0. Quick audible 4,745 ms / 17,007 ms lead; stable 60,204 ms; cancellation 871 ms; prepared 5,976 ms / 63,977 ms lead. Profile/six-rate matrix passed; zero underruns/buffering/stale playback/audio files/external requests/retained cleanup units.
10. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`: exit 1, `Adaptive exact-host TTS matrix failed during adaptive exact-host next-segment seek [webdriver-condition-timeout].` Then `Exact bilingual portfolio packaged matrix failed.`
11. `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4`: NOT RUN after gate 10 failed.
12. `git diff --check`: exit 0.
13. Independent structural comparison: passed all 63 original functions, constants and entry ordering after normalizing only 29 approved clock/timer substitutions.

Diff scope: PASS; six source paths, 9,862 total / conservative 698 non-relocation
lines. Test-integrity and privacy/artifact reviews: PASS. No assertion, deadline,
threshold, retry or existing suite was weakened. Raw evidence remains ignored in
`tmp/evidence/apps-organization-follow-up/APPS-NATIVE-01-POST-02/`.

Invariant review: FAIL for runtime acceptance; static equivalence passes.
English passed its six-rate matrix before failure, returning to 100 with no
failure state, first activation 750 ms and recurring overhead zero. No
`ADAPTIVE_TTS_SEEK_WAIT` diagnostic was emitted. The failing stage has three
preceding waits: next-passage enabled (270 seconds), highlight clearCount
increased (90 seconds), navigation-settling true (90 seconds). Existing logs do
not identify which predicate timed out. The entry-owned wait retains Date.now,
driver.execute and 100-ms polling; the factory receives the same function and
constants. Its default clock remains Date.now and the seek timestamp affects
measurement only. No concrete injection defect was identified.

Baseline English passed; this post-change run failed. Neither refactor causation
nor pre-existing nondeterminism is established. Later English cancellation,
prepared and cleanup criteria and both Chatterbox post-change arms remain
unproven. Qwen model-backed work stays deferred under ADR-0051.

Action required: one unchanged isolated English rerun with fresh identity
capture can test repeatability; it cannot establish root cause, override this
FAIL, or replace fresh complete acceptance. Do not change assertions or deadlines.
Validator is idle at report issuance; no automatic retry was performed.
