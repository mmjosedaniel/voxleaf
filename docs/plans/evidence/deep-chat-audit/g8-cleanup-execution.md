# Supplemental G8 cleanup execution

Receipt ID: DCR-G8-CLEANUP-EXEC-20261110-01  
Base and HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`  
Index: empty

The earlier [diagnostic report](review-G8-DIAG-R1.md) is immutable. The
supplement addresses the independently observed runner failure path. The
retained prior Piper output did not identify its initial failing helper.

The normal-host checkpoint matched the prior source snapshot and process,
data and native scratch inventory. Model-free RED added only a defaulted
termination injection seam to production, with identical default behavior.
In the real disposable Windows driver/app/worker tree the injected
termination failure left the root running after its descendants exited. The
assertion expecting ESRCH failed and the test finally stopped the exact root
and unrelated sentinel.

The correction keeps root stop independent of tree termination and attempts
later verified tree owners even if an earlier owner fails. Tree kills are
issued before waits, under one helper budget, and waits share that budget.
A verified different PID identity is skipped. Identity or completion
uncertainty retains scratch and keeps the aggregate failed. Fixed phase
and category codes preserve the existing ownership/cleanup codes and do not
include raw PowerShell output, private paths or arbitrary error strings.

| Normal-host command | Result |
| --- | --- |
| `node --test '--test-name-pattern=SAF-13 termination-failure' apps/desktop/scripts/native-smoke.node-test.mjs` | RED exit 1, one failure, 0 passed. Before/after hashes match. |
| `pnpm.cmd test:native-smoke-harness` | GREEN exit 0, 53 passed. The configured alias rebuilt workspace packages as its prerequisite. |
| `node --test apps/desktop/scripts/native-webdriver-client.node-test.mjs apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | Exit 0, 125 passed. |
| `pnpm.cmd format:check:typescript` | Exit 0. |
| `pnpm.cmd lint:typescript` | Exit 0. |

All four final executions have matching before/after input identities.
The authoritative normal-host inventory matched after the wrapper settled.
The raw commands, timestamps, logs, environment and per-gate SHA-256 input
lists are in ignored `tmp/evidence/deep-chat-audit/M2/`. The first three
manifest rows are the exact patch. Remaining rows bind directly relevant
unchanged support relative to this supplemental change, including files
already modified by earlier reviewed units. No packaged startup, Piper
inference, installer or lifecycle command ran in this receipt.

## Closed review inputs

| Path | Porcelain status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M` | bafe75554f3045a1ef2a1e086b2cc0c4513cbe0ada4638d92e0a9599b6e85e01 | 25005183ebdd351807862e65f825e2e319e9e2b4 |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | ` M` | ca9bf8c9dc06b3879e14bb74d81e811262158d77e1d5bb5e3babb02d4a6ed692 | 77ec2f890a62d7127fa6b7d4778fb7da41873486 |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | ` M` | b66d95d556cafb868e6f3469b413f92d666aa909caee14e3b1e4197d44db05d7 | 78febbad00c27ffbebc47c1a3873e9a6715c7e16 |
| `apps/desktop/scripts/native-smoke-invariants.mjs` | `clean` | 542a4629152d631ae4d7d2828019f71fbdc5fa94b4558e1f1417d0f9c809a311 | 83e989677f43fcaee682d8345b9f8014b350d7bd |
| `apps/desktop/scripts/native-webdriver-client.mjs` | `clean` | 1e5bb9d331902a09df3540cf5a58ac70c474c2aaf5985fe57d2d4ca0f7beacad | 128398a1cd241b3473eb7348fd75112d83355d13 |
| `apps/desktop/scripts/native-webdriver-client.node-test.mjs` | `clean` | 18a2fdd629b9aeec86c5bc65b76f31906410e7570a20c5f195cd872e118bf490 | 8f517dbc30bad96f317b22dac0d1dc987331beeb |
| `apps/desktop/scripts/bilingual-portfolio-host.mjs` | ` M` | 0101de77cd9719a72e1595088cd4ef01aa597e91e6a054b328ebcba9f94ae2dc | 2d4a4f48f3e82f09383ca9e2efca12a63b476d93 |
| `apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs` | `clean` | 420c8130fd25c3460fc1b3686041f96176a036c4f6a0e3feb9f0df4fdf32618c | e7884955fe5ba4ac57dc416e550c591521e03efa |
| `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs` | ` M` | 985829ef1e5291a23ffd543dc04bdf52277175b5f9c4813d67f83c22945c2526 | efcd31a07c3e7561b572239ef43aafbf20e73355 |
| `apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs` | ` M` | 57846a1b2bc27187fd47efca9165230f470f539408753749979d0480c5aa4bf9 | feafcecddae76e55efa8cff0362672b6786ff091 |
| `apps/desktop/scripts/tts-adapter-layout-host.mjs` | ` M` | e34e6a29991adc405b1e9802e4f3bef276d3180a6f00a763fa405a2a9b080c35 | 0496114a1f7fd02100e71661c57fefe616b71a42 |
| `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | ` M` | f99e606e949cec7ace1642277ddf06cd700917aee70626b04c066a9596c446e8 | dc01509dd49938f7960f1f1b8a906a2e0f50a860 |
| `apps/desktop/scripts/reader-corrections-host.mjs` | `clean` | 666fbc8f43a1b130138c3f14f4ea1a6cd43491f857a57333fd42b30d0d1a4ae3 | 0ba354f4e115754b723aaaa3a63ed2ee967af4a3 |
| `packages/epub/test-support/epub-fixture.ts` | `clean` | 40913ad7819f2da210c9d42e4613af3adcf9a300136136c3c6620a547a945b33 | 08bc02121283468b113ab16aa897bd5984661b72 |
| `package.json` | ` M` | 79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6 | fd94e123a32a6b4a44d5ccb296cd89e25b319232 |
| `pnpm-lock.yaml` | `clean` | e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426 | acf5034202c5933f5c1dff89beff28587c826088 |
| `pnpm-workspace.yaml` | `clean` | efb8ff9911192e80897352cbacccc0cb1d53ef130b64bb98f813c973694f5363 | b6615e1277536c992be3a14cdaa04235a1117330 |
| `.gitattributes` | `clean` | d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4 | 5acf47068be3a84b4e38b502877083e99b5ce0f9 |
| `apps/desktop/scripts/native-smoke/narration-fixture.mjs` | `clean` | 455ec2b329f4c10193f30ec7bc92a8eac4a52982c5f8e2e12d8165bbdf41fbb8 | f92c087ad14961979ec8c50320437d4f97cbb91f |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `clean` | 5300080c8d1ac38f70ae72c0da8ef49ac71256086a8956b5125a4dd101f3b5b3 | ade1f82f70362100673c356f360894fa40cb4566 |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `clean` | b8a9984a47c15b0179d32eaf43877d711b52b5658ba26af42003e63a1b40daa9 | fb6336dd82c5c15370c78df3344f2bd40c81d494 |
