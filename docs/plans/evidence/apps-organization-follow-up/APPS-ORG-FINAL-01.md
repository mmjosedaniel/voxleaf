# Validation Report

Report ID: APPS-ORG-FINAL-01
Target ID: APPS-ORG combined source
Mode: FINAL
Verdict: PASS
Environment: local PowerShell outside sandbox; PowerShell 7.6.5, Node 24.20.0, pnpm 11.15.1 via existing Corepack shim; existing offline Piper/Chatterbox assets and host configuration. No downloads, installs, firewall or machine changes.
Starting HEAD SHA: 520a8d074b7ddf7dc198fe99ecba38a47c6eeb40
Ending HEAD SHA: 520a8d074b7ddf7dc198fe99ecba38a47c6eeb40
Validated paths: exactly the following 32 source paths; evolving documentation excluded.
Validated path identities: same before and after. Exact porcelain strings are shown in quotes (leading spaces significant).

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| apps/desktop/scripts/native-startup-smoke.mjs | " M apps/desktop/scripts/native-startup-smoke.mjs" | B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566 | 41d1e88909fe5f701058ac1abba2e47b8eb11f48 |
| apps/desktop/scripts/native-smoke/resource-observation.mjs | "?? apps/desktop/scripts/native-smoke/resource-observation.mjs" | 105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8 | 42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8 |
| apps/desktop/scripts/native-smoke/tts-scenarios.mjs | "?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs" | D2ED9AEEDE9DA8B6380BF9F8EED5C9DD954D6BE608B96CC268DAC4ED5CBE528F | 5a34ac52db1d7d8f0a06b4ebc9f49f42544755b3 |
| apps/desktop/scripts/native-smoke/reader-scenarios.mjs | "?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs" | E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815 | 6d58be6af15cb48f106f89c59dac19da24fb8813 |
| apps/desktop/scripts/native-smoke.node-test.mjs | "?? apps/desktop/scripts/native-smoke.node-test.mjs" | 200401EDE116542BEA35752A3ED92D30FBEE318D7860D1BFAF66F685CBEA96AA | 20ca00da5b3e3f138233a4228ec6dcfbac37cf6d |
| apps/desktop/package.json | " M apps/desktop/package.json" | 10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80 | d5cdf23c57251449d50cdc5e56c9c324822745cc |
| apps/desktop/src/reader/reader-lifecycle.ts | " D apps/desktop/src/reader/reader-lifecycle.ts" | DELETED | DELETED |
| apps/desktop/src/reader/reader-lifecycle.test.ts | " D apps/desktop/src/reader/reader-lifecycle.test.ts" | DELETED | DELETED |
| apps/desktop/src/publication/reader-lifecycle.ts | "?? apps/desktop/src/publication/reader-lifecycle.ts" | D1E2BF072E4513303754EBEC3E83610AC397B39E598184A2E315484B645E2CE6 | d3a46fd7b51c13e8b849dc1edb3ec3aa5c90f6cf |
| apps/desktop/src/publication/reader-lifecycle.test.ts | "?? apps/desktop/src/publication/reader-lifecycle.test.ts" | 6E6B479FDE73D1E09D1C31A315F908DD2695DE004F22776B3F0DB203AFDC5B60 | 618eaef88cf2365f2f9b0530678d5673074cd379 |
| apps/desktop/src/App.tsx | " M apps/desktop/src/App.tsx" | 0ED155C4C60CA6DA33BF34E0385B555D9680ECA9B84AA63F2156E101BF4843D8 | 7f2c9aa65c5fed437ccc91967cca88a7f673228e |
| apps/desktop/src/AppPresentation.tsx | " M apps/desktop/src/AppPresentation.tsx" | FACE9BCA664C89A75E4C8F48469F7F85EE43850759FAC0E79ABF00DDF93C550A | 22114706304be032204167406d718f345d790cdc |
| apps/desktop/src/ReadyPublicationSection.tsx | " M apps/desktop/src/ReadyPublicationSection.tsx" | 65CE125FA765B1F8FF8796BF91D87F3B91291A27572BDD71C0B7194B22D28922 | 1a674ef9461f54c9c5cff74a6226a49b8d0eef20 |
| apps/desktop/src/reader/raster-image-policy.ts | " D apps/desktop/src/reader/raster-image-policy.ts" | DELETED | DELETED |
| apps/desktop/src/reader/images/raster-image-policy.ts | "?? apps/desktop/src/reader/images/raster-image-policy.ts" | 0A730D598EDC1BD14EB9E2530B71975F398EAAB8F13351540301DC05B7F9F28A | 2f14e03a5f34c12d796d7bff65a605dded99de1e |
| apps/desktop/src/reader/raster-image-policy.test.ts | " D apps/desktop/src/reader/raster-image-policy.test.ts" | DELETED | DELETED |
| apps/desktop/src/reader/images/raster-image-policy.test.ts | "?? apps/desktop/src/reader/images/raster-image-policy.test.ts" | 719C00715E816EEE980992E766A744EDF7F15AC1AC20117F638EBC768520752A | 3b7b19209a1d4961dcf2a08e0d2c4bde850ba024 |
| apps/desktop/src/reader/raster-image-source.ts | " D apps/desktop/src/reader/raster-image-source.ts" | DELETED | DELETED |
| apps/desktop/src/reader/images/raster-image-source.ts | "?? apps/desktop/src/reader/images/raster-image-source.ts" | 068771CD8AD17F4C1080AFA17A8BCE38D133B0964BA8DA548630DC8D28FECE4F | 6806322d0696ce6e1a9aaff560efe4c045bb50c5 |
| apps/desktop/src/reader/raster-image-source.test.ts | " D apps/desktop/src/reader/raster-image-source.test.ts" | DELETED | DELETED |
| apps/desktop/src/reader/images/raster-image-source.test.ts | "?? apps/desktop/src/reader/images/raster-image-source.test.ts" | 33E8E404E526A64E5C4EFFFC36F932F0D7AA988449FFC9056328C04D140CBD66 | ccd5147a690ab389212c9ba493e590f3a04fda9d |
| apps/desktop/src/reader/publication-raster-image-loader.ts | " D apps/desktop/src/reader/publication-raster-image-loader.ts" | DELETED | DELETED |
| apps/desktop/src/reader/images/publication-raster-image-loader.ts | "?? apps/desktop/src/reader/images/publication-raster-image-loader.ts" | C316A06D3D11DCE67290D90AA2431CB8E2E82894AFCDE79786029C552AD3B0B3 | 7e76f8ecd4c1cf9f190b6be84bb3a6ec5b5408d9 |
| apps/desktop/src/reader/publication-raster-image-loader.test.ts | " D apps/desktop/src/reader/publication-raster-image-loader.test.ts" | DELETED | DELETED |
| apps/desktop/src/reader/images/publication-raster-image-loader.test.ts | "?? apps/desktop/src/reader/images/publication-raster-image-loader.test.ts" | 992BB48FCE244E4A962FEC444444F6F12544020E487255E0A2724513E370FE99 | b1f29ee353cb05ae6cdf1f0821b5e1e00387e44a |
| apps/desktop/src/reader/SemanticRasterImage.tsx | " D apps/desktop/src/reader/SemanticRasterImage.tsx" | DELETED | DELETED |
| apps/desktop/src/reader/images/SemanticRasterImage.tsx | "?? apps/desktop/src/reader/images/SemanticRasterImage.tsx" | 01DEDCCF7376D4B2F5D03FB948F3403BC210456D6053E744243D92374C435C53 | 420e539eafe60239e4581b6870dc2121cacbda8f |
| apps/desktop/src/reader/SemanticRasterImage.test.tsx | " D apps/desktop/src/reader/SemanticRasterImage.test.tsx" | DELETED | DELETED |
| apps/desktop/src/reader/images/SemanticRasterImage.test.tsx | "?? apps/desktop/src/reader/images/SemanticRasterImage.test.tsx" | ECB27ECF4D4989B26CBB0741E0B58B45238A53422EB9C1E64E16468E70562B37 | d9c763837b19220c0f7f768989a84bb2f3ac53ec |
| apps/desktop/src/reader/ReaderPublication.tsx | " M apps/desktop/src/reader/ReaderPublication.tsx" | 25B15E04479662CA491AC5DC67CD378E354B775153E298640CE9239F3EB68C86 | d7f4ea3b06815e93677afb5710b5d497bee07cfd |
| apps/desktop/src/reader/SemanticDocument.tsx | " M apps/desktop/src/reader/SemanticDocument.tsx" | 9FB1BAD6818DB66007A63785C4320332F4042982DBDCC8EF506127599377EAD6 | 916c8740a9da772050e1ea768cc9e3a9d9c0de3e |
| apps/desktop/src/integration/package-reader-matrix.test.tsx | " M apps/desktop/src/integration/package-reader-matrix.test.tsx" | 8E197ED228C63FCFF7C1920A14E2761FB682B5E239AF8C0AF982E6C39404D2E9 | 964342d46c08fb38499df3bfe798faeaf2a5c9dc |

Identity recheck: PASS. All 32 identities equal accepted native POST-04, publication POST-01 and images POST-01. HEAD unchanged; index empty before/after.

Commands and outcomes:
1. pnpm.cmd check:portable -> exit 0; 2026-10-12T21:03:24.5746497Z to 2026-10-12T21:04:28.5512084Z.
2. pnpm.cmd check -> exit 0; 2026-10-12T21:04:43.9115474Z to 2026-10-12T21:06:33.8822097Z.
3. pnpm.cmd benchmark:reader:native -> exit 0; 2026-10-12T21:06:40.1802055Z to 2026-10-12T21:07:28.8518704Z.
4. pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight -> exit 0; 2026-10-12T21:07:37.2847166Z to 2026-10-12T21:07:41.2694471Z.
5. node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es -> exit 0; 2026-10-12T21:07:53.3863141Z to 2026-10-12T21:11:04.3454411Z.
6. node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en -> exit 0; 2026-10-12T21:11:15.6900333Z to 2026-10-12T21:14:13.1111439Z.
7. node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 -> exit 0; 2026-10-12T21:14:23.9576291Z to 2026-10-12T21:26:14.8426336Z.
8. git diff --check -> exit 0.
9. Reused pnpm.cmd test:browser and pnpm.cmd test:native-startup from APPS-IMAGES-03-POST-01, both exit 0, after comparing exact final 32 source identities, unchanged toolchain/host configuration and starting executable SHA. Browser seven scenarios; native lifecycle, ingress, cancellation, synchronization, images, restoration, replacement cleanup, no external requests. No redundant executions claimed.

check:portable and check independently passed evidence13, shared209, EPUB651, desktop661 Vitest plus70 Node, Python485, all configured formatting/lint/types/builds; shared generated-contract check17, mypy171 source files. Full check additionally passed Rust87 and release-locked88 tests. Both Rust configurations intentionally ignored tts_service_supervisor::tests::assignment_failure_child_fixture: 'subprocess fixture selected only by the assignment-failure test'. These ignored entries are not standalone passing tests.

Portfolio preflight:39 Vitest,17 WebDriver Node,5 portfolio Node passed. Reader benchmark:10,000 blocks; firstcontent160.8ms,targetready405.3ms,append373ms,reflow115.5ms; six-cycle final active intersection/resize observers and objectURLs0, closedDOMdelta0, heapdelta563212B, working-setdelta14110720B, bounded storage3positions/1468chars/preferences110chars/unexpectedkeys0.

| Model arm | Quick audible ms | Initial lead ms | Stable observation ms | Seek ms | Cancellation ms | Prepared audible/playable ms |
| --- | --- | --- | --- | --- | --- | --- |
| Piper ES | 4967 | 17030 | 60414 | 10181 | 704 | 5954 / 64295 |
| Piper EN | 4530 | 27742 | 60057 | 10143 | 349 | 5683 / 60797 |
| Chatterbox ES | 41780 | 22720 | 60005 | 38035 | 296 | 63437 / 64400 |
| Chatterbox EN | 38585 | 18040 | 60003 | 36873 | 297 | 63368 / 66240 |

All four arms:zero observed underruns, buffering, stale playback, generated audio files, external requests and retained/discarded cleanup units. GPU cleanup69MiB. Piper six-rate transition matrices passed; Chatterbox verifies control presentation, with exactMatrix:null (six-rate transition matrix not exercised). Qwen model-backed paths explicitly deferred under ADR0051, not passed. Deterministic Qwen tests remain included. These are host-specific samples, not performance guarantees; no universal startup target is inferred.

Diff scope: PASS. Closed union32 exactly: native6, publication7, images19; accepted source patches unchanged. Native extraction9862 total/698 nonrelocation, separate diagnostic and proved harness-race correction291 incremental within400; publication1082/10 within1150/12; images5152/12 within5400/20. Documentation changed by director outside this source manifest and awaits separate closure validation.
Invariant review: PASS. Accepted static proofs remain bound to exact identities: extracted helper/lifecycle ownership, cleanup/failure mapping/constants; separately corrected next-seek observation requires active/armed/initiallyfalse/sawTrue, preserving90s and other predicates; whole-file relocation and reverse-import byte proofs preserve publication and image logic/limits. Fresh combined runtime evidence validates integration, cancellation, synchronization, cleanup and privacy. Earlier POST-02/03 intermittent Piper failures remain immutable; deterministic observation race is independently demonstrated, but historical failure cause remains unknown and is not retroactively attributed.
Test-integrity review: PASS. Original assertions/fixtures preserved by exact move proofs, new meaningful harness tests registered once, unchanged RED regression now passes. Required commands unchanged; no snapshots, retries, timeouts or thresholds altered during this report.
Privacy/artifact review: PASS. No generated/private/book/audio/model/secret/unrelated source files entered the patch. Evidence guard covers tracked/index files; direct source status review supplements it and does not claim coverage of evolving unstaged documentation. Raw outputs/temp scripts stay ignored in this directory. Generated outputs from configured builds are not source identities. Starting executable SHA 3E1C0A3FF82F0CCB02E3CBA5E782C4B8EDF8114C693DE49945A96C67A2EC9DD4; ending 4A02D9EB85CE35E456327BCA976962E309F962CF48D995F9BC1887517BE17095. Rebuilt PE bytes differ; reuse asserts identical source/environment, not identical rebuilt artifact. Fresh benchmark/model arms used the rebuilt executable.
Nonfatal warnings retained: pytest could not write services/tts/.pytest_cache/v/cache/nodeids (Errno13 Permission denied), both Python runs still485 passed; Vite bundle chunk exceeds500kB; reused browser NO_COLOR ignored because FORCE_COLOR set. No repairs or config changes made.
Action required: none for combined source acceptance. Documentation closure and director's final reviewer/acceptance remain separate. No Git mutations; validator idle.
