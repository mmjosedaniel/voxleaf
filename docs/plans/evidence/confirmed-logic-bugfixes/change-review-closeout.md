# Change Review Report

> Privacy redaction authorized on 2026-10-23: internal assistant metadata and
> unnecessary host inventory/capture identities were omitted. Originals are
> retained privately. Technical outcomes are unchanged; historical source
> hashes identify the original reviewed snapshots, not these redacted copies.

Review ID: `CLB-R8-ASTRA-20261023T030408Z`

Task ID: `confirmed-logic-bugfixes`, CLB-01 through CLB-05, final documentary closeout revision 8.

Verdict: **APPROVE**.

Reviewer: independent `change_reviewer`, GPT-6 Astra high, read-only. No edits, tests, builds, Git mutations or delegation were performed by the reviewer.

Base commit and reviewed HEAD: `a9f60ed2ef8be53141391260985aeabcd237140c`.

Branch: `codex/confirmed-logic-bugfixes`. The index remained empty; changes remain unstaged and uncommitted.

## Exact snapshot and identity recheck

The complete final patch is `temp/clb-review/revision8.diff`, SHA-256 `9104f014f8badea09aae44d4335bd0b163e61651f5ceb845f587455d1d18355d`.

The closed manifest is `temp/clb-review/revision8-inputs.json`, SHA-256 `9af4080c928d94829a37a4a5dbad7d9de1dd901aab60cb49491e08db857fdef6`: 53 task entries and 48 supporting entries. Both the deleted active-plan path and new completed-plan path are included. The appendices preserve all 101 entries with exact status, SHA-256 and filter-aware blob identities; the old plan uses the manifest's `DELETED` representation.

The evidence manifest is `temp/clb-review/revision8-evidence.json` (digest retained privately): 36 files comprising the unchanged 32 R7 evidence/helper files, the new evidence-check log and the three immutable R7 snapshot artifacts. Their exact hashes and lengths are retained in the private original; this public copy omits host-capture identities.

Identity recheck: **PASS**. Before/after comparisons found no reviewed content, blob, status or HEAD drift. All 36 evidence files matched their hashes and lengths. All 70 non-documentation inputs match R7 exactly. The deleted active plan is absent. This report is excluded from its own manifest.

## Acceptance and documentary delta

R7 independently approved the implementation and required behavioral evidence in report `CLB-R7-ASTRA-20261023T025408Z`. Its saved bytes remain unchanged at SHA-256 `c5c0faa10196e888b098f9e10753c70355cc0b5efab4f4f8a242ce50aa7a2e53`.

The reviewer compared the R7 documentary contents with the final files. Changes are confined to the completed-plan move, accurate completion/review statuses, active/completed/documentation indexes, maintained plan links, the host-summary review pointer and addition of the immutable R7 report. The active directory now contains only its index. Maintained documentation no longer points to the deleted active-plan path. Historical report paths and identities remain historical records.

The completed plan accurately records R7 implementation approval, preserves earlier failed/blocked checkpoints as history, and distinguishes this final report from approval of earlier bytes. Current summaries retain the five bounded outcomes: NSIS optional-data detection; Pause/completion accounting; operational TTS error containment and explicit recovery; primary EPUB default start with auxiliary access preserved; and safe, truthful cleanup of the owned promotion backup. ADR-0060/0061 retain their accepted decisions and now link to the completed evidence. No runtime behavior, acceptance criterion, test assertion, serialized contract, production dependency or architectural boundary changed during closeout.

R3 and R5 are also unchanged: SHA-256 `8758dbf19bfcc9c7f3764e83d3d173511f941caf58e098001d74eef0cb802452` and `9b35298d68f631c3490b0ec29da1b35a450061e283c6a1c3c95e13b7f6f7a42b`, respectively. Their historical blocked verdicts were not rewritten.

## Attributed check evidence and explicit reuse

The coordinator reports the post-move normal local PowerShell executions of `pnpm.cmd check:evidence` and `git diff --check` both exited 0. The frozen `revision8-evidence-check.log` contains the evidence-retention pass. These are supplied execution results, not commands run by the reviewer.

The R7 runtime assessment and relevant passing checks are explicitly reused because all 70 runtime/test/configuration/support inputs and the bound host records remain unchanged. No runtime test was rerun solely for this documentary delta. Reuse includes the final-source aggregate format/lint/type/schema/unit/integration/build checks, browser 10/10, native startup and real-child recovery, package/core checks, installer lifecycle and the ordinary post-restoration integrity/four-profile reader results. R7 contains the exact commands, counts, artifacts and execution boundaries.

The R7 scope limitations remain binding: actual silent lifecycle and installed in-app locked-backup/restart/retry evidence came from the redirected Codex data profile with identical release bytes; ordinary interactive NSIS was user-operated; the fresh ordinary integrity and Piper/Chatterbox ES/EN playback checks ran after original data restoration. No ordinary in-app lock rerun is claimed. Diagnostic-build playback evidence is not transferred to the installed release binary. Controlled race observations and bounded timing/cleanup measurements do not establish universal performance or uncontrolled race frequency.

The completed plan preserves these distinctions, original data/model restoration, zero generated-audio persistence and the unchanged local-only/cancellation/bounded-resource constraints. The closeout introduces no reason to rerun the unaffected runtime gates or change the canonical system diagram.

## Findings and disposition

Findings: **none**.

Remaining uncertainty: no unresolved acceptance blocker for this exact final patch. The bounded evidence limitations recorded in R7 remain unchanged and are not expanded by this approval.

Required next action: save this report with its mechanical identity appendices and verify the saved bytes. Thereafter the coordinator may complete the requested handoff. Any subsequent change to a reviewed path/content set requires a fresh assessment; do not refresh the identities in this immutable report.

This report approves the exact R8 patch, including documentary closeout, under `docs/development/agentic-change-review.md`. It is not a Validation Report or authorization to stage, commit, push, merge, publish or create a pull request.

## Appendix A: Task-path identities

| Path | Status | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | ` M apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `69e03969b2e7501a37f2130a592b450f648955bd83ae0215fa31cc911ed468b7` | `4af6c8bc0b8d0ba8a35d5dedf2d5830d5f5235f7` |
| `apps/desktop/scripts/windows-release.mjs` | ` M apps/desktop/scripts/windows-release.mjs` | `85d675cf41325e0b69d653e56b0fb8e4ff717ea6f2b9c8413f30813161494682` | `5911778c19bc4609d481a0261e8939e8444e35eb` |
| `apps/desktop/scripts/windows-release.node-test.mjs` | ` M apps/desktop/scripts/windows-release.node-test.mjs` | `a8004e7e89280d10984df7242983bab30616b7c7927722745a0bd5ab03b6c9d7` | `2469e09a1cd1b79f6fa2acc1b798270704130c77` |
| `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` | ` M apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` | `b7fca43bd5a60e7d030abb41c10688257efa218be4f6b7be74a0b2776ef79424` | `4b8f0503d1f5d606704722ecbe403c24ec59c4d6` |
| `apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs` | ` M apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs` | `30f8061d04834c85f2add3c06b4285d982b821939348f220c1cb8a505a327ff3` | `d3a3a1c45acf14aaf06954cf544a12c4936da8ff` |
| `apps/desktop/src-tauri/src/tts_service_fake_child.rs` | ` M apps/desktop/src-tauri/src/tts_service_fake_child.rs` | `b2d06b4bd8a12e17ef4ea1cec74b2ba3b0237c17e827c84b91f4cd0f087fe203` | `ff0fe20d65511f54a1e09b2613c229741c3e83f5` |
| `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor.rs` | `984e930c222c8ae107022d5e7a44780feb3b892c1342213fa810ccf178616806` | `a8cdcfd4697bd016f992286226eb3dd740869ca4` |
| `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` | `359da6c1dee76fc96ea55e1da53a676e22224b6f9407068b48dc7e36353c90cf` | `d9fcada37abb002fbcccc7c3a98de6e7d06b6b94` |
| `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | ` M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | `c0dec8e0c958f6cdff9ce3be3f31c06a01562d39e947cff9df1022a6e5e96ad2` | `372ef934237fefdbda072fbf4e659fc59907e7c9` |
| `apps/desktop/src-tauri/windows/nsis-hooks.nsh` | ` M apps/desktop/src-tauri/windows/nsis-hooks.nsh` | `3b1fdead98921bfb9457d4423b3a7a9b08e1e7ed290497db8c92bf5cc8a8ac25` | `741607337d9e41feed81fb4ba8ddd39d805a4b64` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `99ad1ee363be9dc9c4d88ce0c64389e35a8c1662cea80ffbf1e5324f39745b3a` | `ac6a71d3a58d34571a128ddc36afabdc3bb89535` |
| `apps/desktop/src/app-reader-restoration.test.ts` | ` M apps/desktop/src/app-reader-restoration.test.ts` | `a88d0bbfe7b5503f5305880f25c9b63326bcf8ea5c894d9c306ce79c826f1970` | `be9b4fc31b483e8377924e7c6f1dabdf0672c301` |
| `apps/desktop/src/integration/package-reader-matrix.test.tsx` | ` M apps/desktop/src/integration/package-reader-matrix.test.tsx` | `4f5a7548ad45224250b7a5698538e899a441bf62ec573a05def8f90b5d45f2e0` | `7122b5b8317dd12bcd04a941b5dfca341af46488` |
| `apps/desktop/src/persistence/reader-position-restore-coordinator.test.ts` | ` M apps/desktop/src/persistence/reader-position-restore-coordinator.test.ts` | `641f518ea2415fc05462055e5e7846a3be2051477dbc9a07c3bf81ebda039eaf` | `aac076224a74c460f29b65b4ce8bcca7ddd44ccd` |
| `apps/desktop/src/persistence/reader-position-restore-coordinator.ts` | ` M apps/desktop/src/persistence/reader-position-restore-coordinator.ts` | `2c5cc771966fc09b81498fe936160ba1505500471d4873528115a551312bbc09` | `9097e07ff061568ecc3869408c61f07712fd4329` |
| `apps/desktop/src/persistence/reader-position-save-coordinator.test.ts` | ` M apps/desktop/src/persistence/reader-position-save-coordinator.test.ts` | `883ccdc2ca0221ca7bf9eb35f7161cfbc12309710c58852a29af599168e851bc` | `96638f81d029f924f292f553e589eec8d0484053` |
| `apps/desktop/src/persistence/reader-position-save-coordinator.ts` | ` M apps/desktop/src/persistence/reader-position-save-coordinator.ts` | `6952179543d4581e7bdfaee7b195dd5744673bb8b43bed47c4f8725c76c7e952` | `32d7c5831a2fbf513c4093f618a140b07f1d5189` |
| `apps/desktop/src/publication/local-publication-open.test.ts` | ` M apps/desktop/src/publication/local-publication-open.test.ts` | `395051572241773a1ef5e53269ce7624d67f0a6e42cd08ba1f2155b2968069c6` | `438669e4560164634f9d984de57c15327af3f02b` |
| `apps/desktop/src/publication/publication-session.test.ts` | ` M apps/desktop/src/publication/publication-session.test.ts` | `d383615748c164333b3ede7c390b0031fa3caf7158ada7d56adde95cd8c190d1` | `0b5df1d092b7d41f9f53081ff4154d7cf2ecb91c` |
| `apps/desktop/src/publication/reader-lifecycle.test.ts` | ` M apps/desktop/src/publication/reader-lifecycle.test.ts` | `1efb33259108a8e07f56deca008fe149f6d10cdb809e0b57074102ee507efdac` | `462ea5dcfd08ff6ebd39fc2229375f37292b6c19` |
| `apps/desktop/src/publication/reader-lifecycle.ts` | ` M apps/desktop/src/publication/reader-lifecycle.ts` | `85e38e1d9cdc98612439f41aa0a3be03c33fe062a34805bdfa4a289d3327b6e1` | `2c454bbfbd499d5a8ac3c94cf3d2afd15136042c` |
| `apps/desktop/src/reader/ReaderPublication.test.tsx` | ` M apps/desktop/src/reader/ReaderPublication.test.tsx` | `71033acbbf0f267d224719eba401c7c1fce5531ce40b7773066e6998477e5781` | `d84a583e5a7c4f792a56ddec6467e87f2c7be0da` |
| `apps/desktop/src/reader/active-visual-locator.test.ts` | ` M apps/desktop/src/reader/active-visual-locator.test.ts` | `65c706b2a4ecec59068b474bda4bb8597cb6775d360ca8b92f664473202a5d42` | `e74bc09d244b4b7cf87853d808eb540ccc7c368a` |
| `apps/desktop/src/reader/images/publication-raster-image-loader.test.ts` | ` M apps/desktop/src/reader/images/publication-raster-image-loader.test.ts` | `a9d9819ce2c0a7c6bd1a32fbe8b2ced2cef3588f1e00e5aa883ce200e6af5b46` | `c2cb79361a5a5f72fec569b9e07d6f3dfa36cd64` |
| `apps/desktop/src/reader/reader-navigation.ts` | ` M apps/desktop/src/reader/reader-navigation.ts` | `edece532b8d9afd3162e6ace9167c20f3a17f2fa45220f4d0198a1fb527e77f2` | `e0d6c1495cab6dd7f49c4868ab40c47118955ed6` |
| `apps/desktop/src/reader/reader-reflow-restoration.test.ts` | ` M apps/desktop/src/reader/reader-reflow-restoration.test.ts` | `a02e94d0dfe2649e28319686c9e16dfb1be0c83f6c814765b37d4eb331be68ba` | `aed1eb5f7491205a1e72cf5dd1f4bd2f66992d10` |
| `apps/desktop/src/tts/adaptive-buffer-scheduler.ts` | ` M apps/desktop/src/tts/adaptive-buffer-scheduler.ts` | `c722e4f548a8a1d5d67010ae8dcc4f0c6998c9033add82e1c9b2e72dc3654fa6` | `f0b727f255247a345ea083ea218910d71985aa40` |
| `apps/desktop/src/tts/pcm-playback.test.ts` | ` M apps/desktop/src/tts/pcm-playback.test.ts` | `670121928c59a6cc6cead28c674a265bff72c4d8406cdbefd5da94178d132971` | `5535915d72281c6b11401bf005b5fe53204a1daa` |
| `apps/desktop/src/tts/pcm-playback.ts` | ` M apps/desktop/src/tts/pcm-playback.ts` | `cf03d9fcb59590cf116a0e3740960eef9009895f0e91c34b85dff94e487a5070` | `a53131d781ad39ea4c912555d6d690e5eb24b073` |
| `apps/desktop/src/tts/product-narration-coordinator.test.ts` | ` M apps/desktop/src/tts/product-narration-coordinator.test.ts` | `a95dfebacf32e41933f5170d4cbe9a4256e2bb011d305dd905543da08d4a5cc1` | `3a3e81a913204f22f087cddfdab99b24521784d0` |
| `apps/desktop/tests/browser/foundation.smoke.spec.ts` | ` M apps/desktop/tests/browser/foundation.smoke.spec.ts` | `da2959a98df7993a27f39582b3e4352accbe83bf77ca6d34ca01c227007781d7` | `41f513149bf70e25c1fdce8b2ce1b928fdfd7cd1` |
| `docs/README.md` | ` M docs/README.md` | `5d20e4c27d7943e94f8b216059e61def7833febe5830b709396c9f37654cbe18` | `69897ad14047e127fb00777f8e5f160ffcac83c2` |
| `docs/architecture/decisions/README.md` | ` M docs/architecture/decisions/README.md` | `3d3f0713f56ba7676dbdc059250083953832824870eae9ebc1984a8785c1325b` | `e1378193c05fceb8b6ff966493dbf448c6f87472` |
| `docs/architecture/overview.md` | ` M docs/architecture/overview.md` | `39806607f89e157b6767d2f8def40a7eb15ff918e6aeaa1105e0e0109801081f` | `e994bc6385e3e33e5679ec586dcd642cd2dd4dc9` |
| `docs/development/testing.md` | ` M docs/development/testing.md` | `0d1c1342be7ded0cf9754522a97692998a6f576d0ccb680a3b483f0562c878df` | `4a92d28df4b12d4996261737009b5153e95da739` |
| `docs/plans/active/README.md` | ` M docs/plans/active/README.md` | `6a4a7a4bc68e3acc7c34e35749b325c383101765ebe2d9bacfa293ff1a20e6c2` | `6259db5e4172d52ea02a336be5dbd16a1313d38b` |
| `docs/plans/active/confirmed-logic-bugfixes.md` | ` D docs/plans/active/confirmed-logic-bugfixes.md` | `DELETED` | `DELETED` |
| `docs/plans/completed/README.md` | ` M docs/plans/completed/README.md` | `b6f65c63d3f1d0fcbc96412918d744429264d58df430037117a66820217efd20` | `eafe2b797e4dff5a4a98b6177e569fc525212d94` |
| `docs/product/mvp.md` | ` M docs/product/mvp.md` | `b54a841333a9cd2dce9a72e9c9422ec5c126f8935ef7e5ee8743f4280e6221f2` | `0487937f5c0bc4f5b0967053d2b1c282975e4c8c` |
| `packages/epub/src/document/document-model.ts` | ` M packages/epub/src/document/document-model.ts` | `8888482a3d7c6aff55f2c6c322c2a6d0ac02e09359e17564bbe2c24e8ef4c10c` | `2985e855d7c30cb61920f2ab7460f01da95dd5a1` |
| `packages/epub/src/locator/locator-resolver.ts` | ` M packages/epub/src/locator/locator-resolver.ts` | `171bd177366298f9fd8559ba270b7933c84c52acf8c9eb61f08830127407f21d` | `3afd2fbf6052e3f03e8debb68285625247375197` |
| `packages/epub/src/public/open-epub-publication.test.ts` | ` M packages/epub/src/public/open-epub-publication.test.ts` | `e9b025185014d405b84ed9e620865cfb59d9e3833f95f84d604b4bf9fe356e24` | `61720e6c682f2c8caa9480b090c8df6092211882` |
| `packages/epub/src/resource/opened-publication.ts` | ` M packages/epub/src/resource/opened-publication.ts` | `138df675c66e7df59e2df1c13ef9e857a09b00d9759119e8d63892e83575e2e0` | `bf135ea7f538ce908d632b61befc83d9368559fb` |
| `packages/epub/test-support/epub-fixture.ts` | ` M packages/epub/test-support/epub-fixture.ts` | `40913ad7819f2da210c9d42e4613af3adcf9a300136136c3c6620a547a945b33` | `08bc02121283468b113ab16aa897bd5984661b72` |
| `scripts/test-windows-package-lifecycle.ps1` | ` M scripts/test-windows-package-lifecycle.ps1` | `d7d3003cbd824dbecba97a2e37161c21891823f3ae99355c4642b82cb9007e00` | `aef0e47571ae3c4b41d5da843716c7896e64893a` |
| `services/tts/tests/test_service.py` | ` M services/tts/tests/test_service.py` | `7e16c7f6e454f615e73eb23dfeb573857e975c4fe0074d75299908958c8a6a8d` | `e39dc9bdef25eadfcedf46f0fe4e6fc2f057e392` |
| `docs/architecture/decisions/ADR-0060-primary-publication-start.md` | `?? docs/architecture/decisions/ADR-0060-primary-publication-start.md` | `7b70b0869e670083b157ec1dd4f226f124f8fda8b288e829c500e6cf05ebafd8` | `047dbae9cb238479f2e87310c7825ad56d5832f8` |
| `docs/architecture/decisions/ADR-0061-owned-promotion-backup.md` | `?? docs/architecture/decisions/ADR-0061-owned-promotion-backup.md` | `ba5b4fbedd38c4c067cfd56ca35d380e7fc9f169d31a37cf5fe98c94b190a2eb` | `e3e8dbc36d14249579978f4e6fa19803a00a840a` |
| `docs/plans/completed/confirmed-logic-bugfixes.md` | `?? docs/plans/completed/confirmed-logic-bugfixes.md` | `9f81cadb995ab25f57a68f1266c7763502cc394aa3f47b55b0a1b25bcddbbad0` | `3453302c49eed67c3f999fc390d04ddb0687b79a` |
| `docs/plans/evidence/confirmed-logic-bugfixes/change-review-follow-up.md` | `?? docs/plans/evidence/confirmed-logic-bugfixes/change-review-follow-up.md` | `9b35298d68f631c3490b0ec29da1b35a450061e283c6a1c3c95e13b7f6f7a42b` | `de113dda03c7f1e531f059136ed5340ab4b3c362` |
| `docs/plans/evidence/confirmed-logic-bugfixes/change-review-ordinary-host.md` | `?? docs/plans/evidence/confirmed-logic-bugfixes/change-review-ordinary-host.md` | `c5c0faa10196e888b098f9e10753c70355cc0b5efab4f4f8a242ce50aa7a2e53` | `d8c0f75177147a09c1c0dcfcb1d83cabe5c36cde` |
| `docs/plans/evidence/confirmed-logic-bugfixes/change-review.md` | `?? docs/plans/evidence/confirmed-logic-bugfixes/change-review.md` | `8758dbf19bfcc9c7f3764e83d3d173511f941caf58e098001d74eef0cb802452` | `d31bb10fbaf5a0be1e5cf485b11ecfa2249b0379` |
| `docs/plans/evidence/confirmed-logic-bugfixes/ordinary-host-validation.md` | `?? docs/plans/evidence/confirmed-logic-bugfixes/ordinary-host-validation.md` | `d8f6741dc57bfc08e4271369b3ac68e027295bebe160c2772c919176febe934c` | `47763e50835da14714eb62c89dc625a234d0506f` |

## Appendix B: Supporting-path identities

| Path | Status | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `.agents/PLANS.md` | `UNCHANGED` | `f54345a6ee7dd2eeccd56a2c05a854da9178758b7e4adbf21f025122676fa00c` | `960ef8eb5000901a8a945c69ea6386179add517c` |
| `.agents/skills/investigate-bug/SKILL.md` | `UNCHANGED` | `38f462e6d65782abae02fc8f4cff338b2fe1361f829b03b956663efe4840dec5` | `794c4ae3a9e91e7bc3850a9b4309a3ec8ebbf648` |
| `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` | `UNCHANGED` | `a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae` | `16ba1a7002366ad9312223d51dace7902d6ae751` |
| `AGENTS.md` | `UNCHANGED` | `b2c6b7baca13b2345265410fe3947b4c20f2fc3064ba00e83e10c64895b0b424` | `c06bfb24454caf9e9a7af6820425f627d9ff3b4e` |
| `apps/desktop/package.json` | `UNCHANGED` | `7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa` | `46b13978c4094f004349ba762f31bddeb104cb9f` |
| `apps/desktop/scripts/acquisition-file-barrier.mjs` | `UNCHANGED` | `f4026c2949a053767577dd6f0cbe6a3523647ae715f5c9b31f1920a5a50d27e6` | `38874640864314241655b7a5251d480add8955f8` |
| `apps/desktop/scripts/acquisition-file-barrier.ps1` | `UNCHANGED` | `427aa65c78efcddc5123bf537d0deed73afede40af175f8333f5e456c8bd84d9` | `88e63c036356231ec97556433d7a5b184e92cf03` |
| `apps/desktop/scripts/reader-corrections-host.mjs` | `UNCHANGED` | `ddc11f62f11f0d93344ac706285b40b0b329c59a82b42807f6b917dba2f5bbee` | `b394092abe6790c31780b3e38d0688058c24486f` |
| `apps/desktop/src-tauri/Cargo.lock` | `UNCHANGED` | `8b1a08b28ba0ef4dc9440066fec0ffe43d0fa9bc1e68309968d5f69b6b51e08a` | `02e89caf48140bb58052dcc67cd22eb86d643124` |
| `apps/desktop/src-tauri/Cargo.toml` | `UNCHANGED` | `f7589af14b344c827c746e5741a3a5f6d274e8b0643a829ec5a0b3d6971dde09` | `2d119b08ff5c815f3f4926cb2ae6892fddd5bf3b` |
| `apps/desktop/src-tauri/src/tts_service_protocol.rs` | `UNCHANGED` | `a8895ec9f5c569569c5cc37de451d37304822731e565c94a1665d080ce426617` | `d3fac47c4985d6cc6ac0e5663fc971d506a2cc49` |
| `apps/desktop/src-tauri/tauri.conf.json` | `UNCHANGED` | `b76a7342c6ce9918bb499ddd50f4910667d50cf5dda564e3103ab8d56a99191a` | `086ffec207c95af2fef00c7726a3728d94279bbf` |
| `apps/desktop/src-tauri/tauri.release.conf.json` | `UNCHANGED` | `aac957a44c8524043241ac3e10b4f589ccdc6b34dd2c111bc26b0e7d437bdc34` | `715f72d19313cfd169a4b08d85c2af928243c48b` |
| `apps/desktop/src/app-reader-restoration.ts` | `UNCHANGED` | `813a4e05661a9c8af345f0dfe7486deeb4da681c6fcf3f4c5ba0756d32f8ceb7` | `a224767dcbe0e303fb6220436140317af59ab2a7` |
| `apps/desktop/src/App.tsx` | `UNCHANGED` | `f4f2c61e55aa212d999b9d56ecfbeb7dc5cc7992e844f98842f36c54db36e17e` | `ddf10a4b143c53aeac16230dfb2f8163c6c11146` |
| `apps/desktop/src/reader/ReaderPublication.tsx` | `UNCHANGED` | `92554e30d67e062aaf8508ca3e709e5074565fb74417d7d9901cbe828efcd987` | `6fe5a0eab3cf07dace73f7c307625d6d127e9bbd` |
| `apps/desktop/src/settings/narration-settings-actions.ts` | `UNCHANGED` | `8782470007e32e81af7f6b04bd3cd51f878635e410ab9c70664371e327517db5` | `d49281f8ad9c336568cc6e56f6d596cd25458ac7` |
| `apps/desktop/src/tts/operational-recovery.ts` | `UNCHANGED` | `409e6a4303e7fc6dc180fa62cae06be3e1e978040d8d322f81bd08c31a508ef8` | `5310ee2cd333fc0035ffff53f427d451ca63924a` |
| `apps/desktop/src/tts/optional-chatterbox-client.ts` | `UNCHANGED` | `e3f9de15fff2e1b104eaed604528aed96f7175560762e5290b0eb081d14c60df` | `56d8fe34de239c8ec5aaebf59c7221106253740a` |
| `apps/desktop/src/tts/OptionalChatterboxControls.tsx` | `UNCHANGED` | `fc19f43063ae96aefb0dbbcaa459e5d62625475e7dec97024551f47cec5aaba3` | `dcbff79992fe37758d72ff4ca96c264061e24856` |
| `apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts` | `UNCHANGED` | `dec06428c22f8f7196f77a69eadd902b1891a3ab34d54ce0c2a894205ff47b45` | `e0f6cb7ee4bb30016be9137c5a6ef0fa79ee0fe5` |
| `apps/desktop/src/tts/process-client.ts` | `UNCHANGED` | `47cf286af9741e7772c9ea5950f2ce9b578ca336ae791e5f7fbee555ea084231` | `679960693726a7c3bbe952d1a8c94bfebd22b984` |
| `apps/desktop/src/tts/product-narration-coordinator.ts` | `UNCHANGED` | `cde1590fa6953e2419ac30a9c6fc6d189f418147768387b2c3c4a73a20049ac1` | `34e83f523ff44f1c55951b3b599d4e31ef8b78d2` |
| `docs/architecture/adaptive-buffer-authority-v1.md` | `UNCHANGED` | `684290262997b0446bf155ddb1b5967e71f7ef839936b68e5c2b8b2ca958a919` | `dd5a2bc183329bb67f26f779fe9a82857114ccfd` |
| `docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md` | `UNCHANGED` | `1ebf7d4ab35bee3eb2ccd9c4ae46c8dbbcd107058f4cfeb54dd4d4d152e06175` | `d27c851220b4a22ca3a896fcbce2fa154033387d` |
| `docs/architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md` | `UNCHANGED` | `7253af0bbb1103ee7ca57bdb19b61de53c3b7e558806fa5a6f2dad7e59c4b699` | `2d9c6d70e7a656c0f9426cef320040c9722ab1dc` |
| `docs/architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md` | `UNCHANGED` | `96e6fc2df076d52193f2a806b1c039cd10842dce67f79738a87d1c7c2d16f628` | `b04b0986041284e2508974d6cb19ad3d1a53e3db` |
| `docs/architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md` | `UNCHANGED` | `3d5ac04867ca300e599055c30e62ae65fd1af1b0785325ffebfebb3e693a723a` | `40e4ccb76b45a94b84431b66bd30615adb4b9ea8` |
| `docs/architecture/decisions/ADR-0048-admit-bounded-epub2-and-ncx-compatibility.md` | `UNCHANGED` | `966c8015776e8b7bcac366fc6378d29b3a9f9229b685c452c2fcecf0e593e3d2` | `6dd41a516907b67a3b212b453d193dbaf684c879` |
| `docs/architecture/decisions/ADR-0058-admit-certifi-pillow-chatterbox-v5.md` | `UNCHANGED` | `948676c090549045f26d0583fc9a2cce067ff9af15474535bd12e8f8dffa6241` | `dbe6649400c5b7c24a67baee79e6e0d108b420aa` |
| `docs/architecture/hardware-profile-recovery-authority-v1.md` | `UNCHANGED` | `df147c308d737375d2450a660b10b2f82b64c307ee5e4b9de7f280ee407b1518` | `2eb2215ae4a8602e1c46472b76f072125939a8cc` |
| `docs/architecture/playback-transition-pause-policy-v1.md` | `UNCHANGED` | `41afaf8df9e6a1273586e14c091a3bd56e0c5f64d13b9c09c1502cd0768dd441` | `282796f452655e7f2b2d7fa63211f3017be3c8e7` |
| `docs/architecture/reader-settings-playback-authority-v3.md` | `UNCHANGED` | `b2d443fd081c7280a95a36b707891ccd8bf08904e8816b1a30c4353a1f17d42d` | `77a1693642648df828b5314ecefb9dbb852470d3` |
| `docs/architecture/synchronization-authority-v1.md` | `UNCHANGED` | `244d2fb8cbf381d43c67259093f20fef8f01ad1acca1de0e1128f6b3a13b9592` | `5917a5bef22fd0034dd512d900468fdc53772074` |
| `docs/architecture/system-diagram.md` | `UNCHANGED` | `e12b79b8beb6b12d948d7e9795dbd92f23ad73793d52e76502525f3e7ef4f537` | `0a918fc1719ebf85877c1d4494d8f4c0fd383dd1` |
| `docs/architecture/tts-service-protocol-v1.md` | `UNCHANGED` | `44f53337611c0a861c8b10e021b5676d9a6523dbea40b526d165f7f17b856223` | `3466b3f003eb0acefbad98dd4c6120d071c107b1` |
| `docs/development/agentic-change-review.md` | `UNCHANGED` | `de4c430a5de120d9c900d6bad0bebbfeec81673614b30f242f3154efbedcfc39` | `373443e17547185e2294d906bdc9cb489daca67c` |
| `docs/plans/completed/M005-narration-text-preparation.md` | `UNCHANGED` | `a20136c18ee476bfad5a7a8d6e12c40beae7db3180bbbe38f62e4019e69ed7d6` | `219ae4fe16b4c740b1fbbbafb867f4071c0be7f8` |
| `docs/plans/roadmap.md` | `UNCHANGED` | `664a0323d2b20e055ac64b104479aa11e751ef45ce71ed8a607ab27584f34428` | `21f8bc4a2e4898f2ed6518b527e9e9c8cb50c6f5` |
| `package.json` | `UNCHANGED` | `1f338a627cb8733b823e9c434c7e18647cf771cd63043e83a4a87ad587f5ad6e` | `b09ae26aa241b8026c3a0e25078018f29b26df0e` |
| `packages/epub/src/locator/locator-index.ts` | `UNCHANGED` | `3b0fec45c88ddbaa4c0e221a87dc5dce2ebe2b184a2241252517bfc340082a2b` | `2bdfad299dde5bd187664a8d62db4959d9841d71` |
| `packages/shared/schemas/operational-error/v1.schema.json` | `UNCHANGED` | `556cfc6dd26b7ce9b8e480435c3d8709dee6de69cbc627ad5e3c4cee0fc4ab59` | `33a01a7ecf642cb9a55b085115f2749ee8772961` |
| `packages/shared/schemas/tts-protocol-control/v1.schema.json` | `UNCHANGED` | `2ad914d3d8dd2a3fac581e8f49b6cd28456671cecdefa25bcf02fa79c08b4e3b` | `663cf17befd69f4e09cd777d54e6ad27208316ce` |
| `pnpm-lock.yaml` | `UNCHANGED` | `e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426` | `acf5034202c5933f5c1dff89beff28587c826088` |
| `scripts/build-windows-release.ps1` | `UNCHANGED` | `1183b8a483ecdb243ec75d962729446face6ac938284b3f66616f5673ae8b0ce` | `9577102d19bede044f4ce21d62a2f5fc489a215c` |
| `scripts/windows-package-lifecycle-data.ps1` | `UNCHANGED` | `4716828987233bb7543b14fb0a75ea6f30217fc574a6341eff36d3798bc2e566` | `d81a643d5d2f728318c10f9241a4246e52f39326` |
| `services/tts/release/optional/chatterbox/optional-package-manifest-v5.json` | `UNCHANGED` | `52eb229074b35dd597e1b8568ca4c046bdf999cab2272d8400458dd3280b6761` | `7a05354fc40f5a4804347abe5d8aa21dd8158830` |
| `services/tts/src/voxleaf_tts/service.py` | `UNCHANGED` | `f8a10d5420f21d8f12f3acd7eb1d925d18452afdfa182a344d35e2bf9f5f8f70` | `1cdc2734ee05f33d309f4f642fc91a6b6c3e20ad` |

## Private host evidence

Host-specific captures, screenshot identifiers and their digests are retained locally. The technical outcomes and source/distributable identities above remain public.
