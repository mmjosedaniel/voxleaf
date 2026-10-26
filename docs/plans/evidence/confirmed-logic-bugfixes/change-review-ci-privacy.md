# Change Review Report

Review ID: `CLB-CI-PRIVACY-R1-ASTRA-20261023T223723Z`

Task: PR #272 NSIS CI prerequisite and authorized publication-privacy follow-up.

Verdict: **APPROVE** for the reviewed local patch. The hosted CI rerun remains pending.

Reviewer: independent `change_reviewer`, GPT-6 Astra high. Read-only source, diff, identity and supplied-evidence inspection; no edits, tests, builds, Git mutations or delegation.

Reviewed HEAD: `33106abd72805769aaad89893496ab4e5e87b358`.

PR base: `26ecd6cd6d678e541f6569d8d45661887942ad6b`.

Branch: `codex/confirmed-logic-bugfixes`. The index was empty before and after review.

## Exact scope and identities

The closed source manifest is `temp/clb-review/ci-privacy-inputs.json`, SHA-256 `306ebc90cd222dfdcfa8e1b7a5e0c6e1634b50017135f2a0d4f1d5932d764825`: eight task paths and 52 supporting paths. The appendices preserve all 60 exact path/status/SHA-256/filter-aware blob identities.

The tracked follow-up diff is `temp/clb-review/ci-privacy-reviewed.diff`, SHA-256 `9837a7f4af62168db79dce41ec041d78cef56f7d74a5ccf91333112c97896e6d`; the cumulative tracked PR diff is `temp/clb-review/ci-privacy-full-pr.diff`, SHA-256 `a25a19af947707fbdfae74dd54e44db6c43de7e45312f6353fb0c1315e689def`. Both were compared with the live Git diffs. The new untracked `ci-nsis-follow-up.md` was inspected separately in full and is bound by the source manifest. Every changed tracked PR path is within the closed set. This report is excluded from its own inputs.

Identity recheck: **PASS**. HEAD, base, reviewed source bytes, filter-aware blobs and statuses matched before and after inspection. Reviewed local command records and the private-original preservation manifest remained unchanged. Their host-specific digests are deliberately not published here.

## CI correction

The existing Windows compiled regression invokes `%LOCALAPPDATA%/tauri/NSIS/makensis.exe`. The failed CI record and isolated local reproduction both reach that invocation with a null process exit status; the workflow previously did not provision the compiler. Native startup builds are not installer-toolchain preparation.

The new workflow step prepares the exact path before the affected checks. It downloads the fixed Tauri NSIS 3.13 release archive, verifies SHA-256 `ba63dffc4410ee89193e1cb5a41989991bd77c61068da17e3156d136b7b0b3d8` before extraction, rejects an existing target/extraction cache, renames the pinned extracted directory and checks compiler execution. The retained downloaded archive independently matches that pin. Existing job permissions and compiler-test assertions/skip conditions are unchanged.

This is a CI prerequisite correction. It does not change production behavior, release artifacts, runtime dependencies or the regression's acceptance criteria. The testing documentation now states the prerequisite explicitly.

## Attributed validation evidence

The coordinator supplied normal local PowerShell results outside the managed sandbox, using new process-local synthetic compiler-cache and runner-temporary directories. The reviewer read the records but did not execute these commands.

| Operation | Recorded result |
| --- | --- |
| `pnpm.cmd --filter @voxleaf/desktop test` with empty compiler cache | Exit 1: 818 Vitest passed; Node 96 passed and one failed at the existing compiled NSIS invocation, matching the CI failure. |
| Exact workflow setup block | Successful pinned-archive verification and compiler output `v3.13`. |
| Same desktop test command after setup | Exit 0: 818 Vitest and 97 Node tests passed; compiled NSIS behavior passed with no skipped Node tests. |
| `pnpm.cmd format:check:typescript` | Exit 0; formatting check passed. |
| `pnpm.cmd check:evidence` | Exit 0; evidence-retention check passed. |
| `git diff --check` | Coordinator reports exit 0 for the follow-up delta. |

The workflow bytes are unchanged since the successful local run. No full model/native/installer matrix was rerun for this setup/documentation delta. Earlier implementation evidence remains applicable only to unchanged runtime/test inputs and its original environment/artifact limits; this report does not turn those historical runs into a fresh hosted workflow result.

## Publication privacy and historical fidelity

The review inspected the cumulative PR's changed paths and added text, the new follow-up summary, and the redaction delta. No remaining credential, personal home path, private book text, generated audio, model weight, raw log, screenshot or unnecessary original-data inventory was identified in that scope. New EPUB/text/marker material is synthetic test content. Technical fixture and source/distributable identities remain appropriate public evidence. This is a scoped inspection, not an exhaustive secret scan of unrelated repository history or external copies.

The user explicitly authorized privacy redaction and branch-history replacement. All five originals were preserved in ignored local storage and independently matched their preservation manifest. Each public redacted copy is marked. Removed material consists of internal assistant metadata, capture identifiers/digests and unnecessary retained-data inventory; technical outcomes, requirements, original review verdicts, failure history, source identities and distributable-artifact identities remain intact. The public notices correctly state that historical hashes identify the original snapshots, not the edited public copies. No approval hash was silently refreshed.

The evidence-retention policy permits this explicitly authorized, marked redaction with private original preservation. The edited historical records therefore do not falsify their original BLOCKED/APPROVE outcomes or the distinction between redirected-profile evidence, ordinary interactive observations and diagnostic-build playback.

The current worktree redaction does not by itself remove the superseded commit from branch ancestry. The separately authorized branch rewrite remains the coordinator's responsibility. Even after replacement, deletion from hosting caches, old references or external copies is not established. The new summary states this limitation without exposing private originals as a public evidence shortcut.

## Findings and next action

Findings: **none**.

Remaining uncertainty: the hosted workflow has not yet rerun with this patch. The local reproduction/repair establishes the compiler-prerequisite fix, not a green final GitHub run. Private preservation does not guarantee erasure of previously published copies.

Required next action: save and verify this report, preserve the reviewed source identities during the separately authorized publication/history operation, and inspect the resulting hosted CI run before reporting CI success or merge readiness. Any new source change requires fresh review. No merge is approved by this report.

This APPROVE is an independent assessment of the exact reviewed patch; it is not a claim that the reviewer executed validation, a Validation Report, or an additional grant of Git/publication authority.

## Appendix A: Task-path identities

Status (empty) denotes an empty Git porcelain result at review time.

| Path | Status | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `.github/workflows/foundation-checks.yml` | ` M .github/workflows/foundation-checks.yml` | `dae116f90e7a703f0959680ee9fe5d2bd34b7fa62b68b43dd5060a3b82784f85` | `0ddef04e6390a01dbbc7290cbc446071b73a7925` |
| `docs/development/testing.md` | ` M docs/development/testing.md` | `b37bde624b5949a69681f2408b16e4a16b827c5002d243c6b70068ed03577188` | `64e7cda1847caf34ea7d82df326a11289af030db` |
| `docs/plans/completed/confirmed-logic-bugfixes.md` | ` M docs/plans/completed/confirmed-logic-bugfixes.md` | `82780fa34d91678f775cc2b696b269f868dccf49b25085c6608b0a097972ea67` | `2d2fe3705d11bb90d6a0fcbb3a061865d273e7b3` |
| `docs/plans/evidence/confirmed-logic-bugfixes/change-review-closeout.md` | ` M docs/plans/evidence/confirmed-logic-bugfixes/change-review-closeout.md` | `14a419d327d9698e799dafa7a69a6701df83573de41300c91cb57d85d4d621ce` | `5d49dba3954f275fc189113e143f3ac95b774423` |
| `docs/plans/evidence/confirmed-logic-bugfixes/change-review-follow-up.md` | ` M docs/plans/evidence/confirmed-logic-bugfixes/change-review-follow-up.md` | `925935a4bdc344b48df898ed67e39cd688d5bc100f69409660bc8597c461c407` | `7f7db91d54c03325d7c85defd09a3e7ea02674da` |
| `docs/plans/evidence/confirmed-logic-bugfixes/change-review-ordinary-host.md` | ` M docs/plans/evidence/confirmed-logic-bugfixes/change-review-ordinary-host.md` | `f5ff06a1bfe32a1f826e9d4894da6abd05c8537a7cf851536cdf1fbba466d71a` | `69f138008ac14e7c991ca36769e960e083562575` |
| `docs/plans/evidence/confirmed-logic-bugfixes/ordinary-host-validation.md` | ` M docs/plans/evidence/confirmed-logic-bugfixes/ordinary-host-validation.md` | `4db774b7317b5e37080dd4f034d2c50908a4f962d13bd5a101b144c91a650773` | `5bf37a175990417803c60d048ad68bd39f450ec1` |
| `docs/plans/evidence/confirmed-logic-bugfixes/ci-nsis-follow-up.md` | `?? docs/plans/evidence/confirmed-logic-bugfixes/ci-nsis-follow-up.md` | `9c80ef6d7f3bf1f2a802c69dd97f2656f96257b14541a6996353e0989997dc7d` | `8c4e02c4dd7ef2195597228da19af7973d5fc621` |

## Appendix B: Supporting-path identities

Status (empty) denotes an empty Git porcelain result at review time.

| Path | Status | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `.gitignore` | (empty) | `9e601c0421914252a949656b79092e3a1049c325c8d6218ba158801e37241392` | `2afcbb78c8a55861916e5ccd14455c598c132beb` |
| `AGENTS.md` | (empty) | `b2c6b7baca13b2345265410fe3947b4c20f2fc3064ba00e83e10c64895b0b424` | `c06bfb24454caf9e9a7af6820425f627d9ff3b4e` |
| `apps/desktop/package.json` | (empty) | `7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa` | `46b13978c4094f004349ba762f31bddeb104cb9f` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | (empty) | `69e03969b2e7501a37f2130a592b450f648955bd83ae0215fa31cc911ed468b7` | `4af6c8bc0b8d0ba8a35d5dedf2d5830d5f5235f7` |
| `apps/desktop/scripts/windows-release.mjs` | (empty) | `85d675cf41325e0b69d653e56b0fb8e4ff717ea6f2b9c8413f30813161494682` | `5911778c19bc4609d481a0261e8939e8444e35eb` |
| `apps/desktop/scripts/windows-release.node-test.mjs` | (empty) | `a8004e7e89280d10984df7242983bab30616b7c7927722745a0bd5ab03b6c9d7` | `2469e09a1cd1b79f6fa2acc1b798270704130c77` |
| `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` | (empty) | `b7fca43bd5a60e7d030abb41c10688257efa218be4f6b7be74a0b2776ef79424` | `4b8f0503d1f5d606704722ecbe403c24ec59c4d6` |
| `apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs` | (empty) | `30f8061d04834c85f2add3c06b4285d982b821939348f220c1cb8a505a327ff3` | `d3a3a1c45acf14aaf06954cf544a12c4936da8ff` |
| `apps/desktop/src-tauri/src/tts_service_fake_child.rs` | (empty) | `b2d06b4bd8a12e17ef4ea1cec74b2ba3b0237c17e827c84b91f4cd0f087fe203` | `ff0fe20d65511f54a1e09b2613c229741c3e83f5` |
| `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | (empty) | `984e930c222c8ae107022d5e7a44780feb3b892c1342213fa810ccf178616806` | `a8cdcfd4697bd016f992286226eb3dd740869ca4` |
| `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` | (empty) | `359da6c1dee76fc96ea55e1da53a676e22224b6f9407068b48dc7e36353c90cf` | `d9fcada37abb002fbcccc7c3a98de6e7d06b6b94` |
| `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | (empty) | `c0dec8e0c958f6cdff9ce3be3f31c06a01562d39e947cff9df1022a6e5e96ad2` | `372ef934237fefdbda072fbf4e659fc59907e7c9` |
| `apps/desktop/src-tauri/windows/nsis-hooks.nsh` | (empty) | `3b1fdead98921bfb9457d4423b3a7a9b08e1e7ed290497db8c92bf5cc8a8ac25` | `741607337d9e41feed81fb4ba8ddd39d805a4b64` |
| `apps/desktop/src/app-reader-restoration.test.ts` | (empty) | `a88d0bbfe7b5503f5305880f25c9b63326bcf8ea5c894d9c306ce79c826f1970` | `be9b4fc31b483e8377924e7c6f1dabdf0672c301` |
| `apps/desktop/src/App.test.tsx` | (empty) | `99ad1ee363be9dc9c4d88ce0c64389e35a8c1662cea80ffbf1e5324f39745b3a` | `ac6a71d3a58d34571a128ddc36afabdc3bb89535` |
| `apps/desktop/src/integration/package-reader-matrix.test.tsx` | (empty) | `4f5a7548ad45224250b7a5698538e899a441bf62ec573a05def8f90b5d45f2e0` | `7122b5b8317dd12bcd04a941b5dfca341af46488` |
| `apps/desktop/src/persistence/reader-position-restore-coordinator.test.ts` | (empty) | `641f518ea2415fc05462055e5e7846a3be2051477dbc9a07c3bf81ebda039eaf` | `aac076224a74c460f29b65b4ce8bcca7ddd44ccd` |
| `apps/desktop/src/persistence/reader-position-restore-coordinator.ts` | (empty) | `2c5cc771966fc09b81498fe936160ba1505500471d4873528115a551312bbc09` | `9097e07ff061568ecc3869408c61f07712fd4329` |
| `apps/desktop/src/persistence/reader-position-save-coordinator.test.ts` | (empty) | `883ccdc2ca0221ca7bf9eb35f7161cfbc12309710c58852a29af599168e851bc` | `96638f81d029f924f292f553e589eec8d0484053` |
| `apps/desktop/src/persistence/reader-position-save-coordinator.ts` | (empty) | `6952179543d4581e7bdfaee7b195dd5744673bb8b43bed47c4f8725c76c7e952` | `32d7c5831a2fbf513c4093f618a140b07f1d5189` |
| `apps/desktop/src/publication/local-publication-open.test.ts` | (empty) | `395051572241773a1ef5e53269ce7624d67f0a6e42cd08ba1f2155b2968069c6` | `438669e4560164634f9d984de57c15327af3f02b` |
| `apps/desktop/src/publication/publication-session.test.ts` | (empty) | `d383615748c164333b3ede7c390b0031fa3caf7158ada7d56adde95cd8c190d1` | `0b5df1d092b7d41f9f53081ff4154d7cf2ecb91c` |
| `apps/desktop/src/publication/reader-lifecycle.test.ts` | (empty) | `1efb33259108a8e07f56deca008fe149f6d10cdb809e0b57074102ee507efdac` | `462ea5dcfd08ff6ebd39fc2229375f37292b6c19` |
| `apps/desktop/src/publication/reader-lifecycle.ts` | (empty) | `85e38e1d9cdc98612439f41aa0a3be03c33fe062a34805bdfa4a289d3327b6e1` | `2c454bbfbd499d5a8ac3c94cf3d2afd15136042c` |
| `apps/desktop/src/reader/active-visual-locator.test.ts` | (empty) | `65c706b2a4ecec59068b474bda4bb8597cb6775d360ca8b92f664473202a5d42` | `e74bc09d244b4b7cf87853d808eb540ccc7c368a` |
| `apps/desktop/src/reader/images/publication-raster-image-loader.test.ts` | (empty) | `a9d9819ce2c0a7c6bd1a32fbe8b2ced2cef3588f1e00e5aa883ce200e6af5b46` | `c2cb79361a5a5f72fec569b9e07d6f3dfa36cd64` |
| `apps/desktop/src/reader/reader-navigation.ts` | (empty) | `edece532b8d9afd3162e6ace9167c20f3a17f2fa45220f4d0198a1fb527e77f2` | `e0d6c1495cab6dd7f49c4868ab40c47118955ed6` |
| `apps/desktop/src/reader/reader-reflow-restoration.test.ts` | (empty) | `a02e94d0dfe2649e28319686c9e16dfb1be0c83f6c814765b37d4eb331be68ba` | `aed1eb5f7491205a1e72cf5dd1f4bd2f66992d10` |
| `apps/desktop/src/reader/ReaderPublication.test.tsx` | (empty) | `71033acbbf0f267d224719eba401c7c1fce5531ce40b7773066e6998477e5781` | `d84a583e5a7c4f792a56ddec6467e87f2c7be0da` |
| `apps/desktop/src/tts/adaptive-buffer-scheduler.ts` | (empty) | `c722e4f548a8a1d5d67010ae8dcc4f0c6998c9033add82e1c9b2e72dc3654fa6` | `f0b727f255247a345ea083ea218910d71985aa40` |
| `apps/desktop/src/tts/pcm-playback.test.ts` | (empty) | `670121928c59a6cc6cead28c674a265bff72c4d8406cdbefd5da94178d132971` | `5535915d72281c6b11401bf005b5fe53204a1daa` |
| `apps/desktop/src/tts/pcm-playback.ts` | (empty) | `cf03d9fcb59590cf116a0e3740960eef9009895f0e91c34b85dff94e487a5070` | `a53131d781ad39ea4c912555d6d690e5eb24b073` |
| `apps/desktop/src/tts/product-narration-coordinator.test.ts` | (empty) | `a95dfebacf32e41933f5170d4cbe9a4256e2bb011d305dd905543da08d4a5cc1` | `3a3e81a913204f22f087cddfdab99b24521784d0` |
| `apps/desktop/tests/browser/foundation.smoke.spec.ts` | (empty) | `da2959a98df7993a27f39582b3e4352accbe83bf77ca6d34ca01c227007781d7` | `41f513149bf70e25c1fdce8b2ce1b928fdfd7cd1` |
| `docs/architecture/decisions/ADR-0060-primary-publication-start.md` | (empty) | `7b70b0869e670083b157ec1dd4f226f124f8fda8b288e829c500e6cf05ebafd8` | `047dbae9cb238479f2e87310c7825ad56d5832f8` |
| `docs/architecture/decisions/ADR-0061-owned-promotion-backup.md` | (empty) | `ba5b4fbedd38c4c067cfd56ca35d380e7fc9f169d31a37cf5fe98c94b190a2eb` | `e3e8dbc36d14249579978f4e6fa19803a00a840a` |
| `docs/architecture/decisions/README.md` | (empty) | `3d3f0713f56ba7676dbdc059250083953832824870eae9ebc1984a8785c1325b` | `e1378193c05fceb8b6ff966493dbf448c6f87472` |
| `docs/architecture/overview.md` | (empty) | `39806607f89e157b6767d2f8def40a7eb15ff918e6aeaa1105e0e0109801081f` | `e994bc6385e3e33e5679ec586dcd642cd2dd4dc9` |
| `docs/development/agentic-change-review.md` | (empty) | `de4c430a5de120d9c900d6bad0bebbfeec81673614b30f242f3154efbedcfc39` | `373443e17547185e2294d906bdc9cb489daca67c` |
| `docs/development/evidence-retention.md` | (empty) | `7da81e559e026de62e5df48b6ba3d02741841f60ceca14d194b7d79e9c9d6a82` | `2b06a3a434e9edf5e7fe9a492202f2f41af5e133` |
| `docs/plans/completed/README.md` | (empty) | `b6f65c63d3f1d0fcbc96412918d744429264d58df430037117a66820217efd20` | `eafe2b797e4dff5a4a98b6177e569fc525212d94` |
| `docs/plans/evidence/confirmed-logic-bugfixes/change-review.md` | (empty) | `8758dbf19bfcc9c7f3764e83d3d173511f941caf58e098001d74eef0cb802452` | `d31bb10fbaf5a0be1e5cf485b11ecfa2249b0379` |
| `docs/product/mvp.md` | (empty) | `b54a841333a9cd2dce9a72e9c9422ec5c126f8935ef7e5ee8743f4280e6221f2` | `0487937f5c0bc4f5b0967053d2b1c282975e4c8c` |
| `docs/README.md` | (empty) | `5d20e4c27d7943e94f8b216059e61def7833febe5830b709396c9f37654cbe18` | `69897ad14047e127fb00777f8e5f160ffcac83c2` |
| `package.json` | (empty) | `1f338a627cb8733b823e9c434c7e18647cf771cd63043e83a4a87ad587f5ad6e` | `b09ae26aa241b8026c3a0e25078018f29b26df0e` |
| `packages/epub/src/document/document-model.ts` | (empty) | `8888482a3d7c6aff55f2c6c322c2a6d0ac02e09359e17564bbe2c24e8ef4c10c` | `2985e855d7c30cb61920f2ab7460f01da95dd5a1` |
| `packages/epub/src/locator/locator-resolver.ts` | (empty) | `171bd177366298f9fd8559ba270b7933c84c52acf8c9eb61f08830127407f21d` | `3afd2fbf6052e3f03e8debb68285625247375197` |
| `packages/epub/src/public/open-epub-publication.test.ts` | (empty) | `e9b025185014d405b84ed9e620865cfb59d9e3833f95f84d604b4bf9fe356e24` | `61720e6c682f2c8caa9480b090c8df6092211882` |
| `packages/epub/src/resource/opened-publication.ts` | (empty) | `138df675c66e7df59e2df1c13ef9e857a09b00d9759119e8d63892e83575e2e0` | `bf135ea7f538ce908d632b61befc83d9368559fb` |
| `packages/epub/test-support/epub-fixture.ts` | (empty) | `40913ad7819f2da210c9d42e4613af3adcf9a300136136c3c6620a547a945b33` | `08bc02121283468b113ab16aa897bd5984661b72` |
| `scripts/test-windows-package-lifecycle.ps1` | (empty) | `d7d3003cbd824dbecba97a2e37161c21891823f3ae99355c4642b82cb9007e00` | `aef0e47571ae3c4b41d5da843716c7896e64893a` |
| `services/tts/tests/test_service.py` | (empty) | `7e16c7f6e454f615e73eb23dfeb573857e975c4fe0074d75299908958c8a6a8d` | `e39dc9bdef25eadfcedf46f0fe4e6fc2f057e392` |
