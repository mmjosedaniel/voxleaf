# Change Review Report

> Privacy redaction authorized on 2026-10-23: internal assistant metadata and
> unnecessary host inventory/capture identities were omitted. Originals are
> retained privately. Technical outcomes are unchanged; historical source
> hashes identify the original reviewed snapshots, not these redacted copies.

**Review ID:** `CLB-R5-ASTRA-20261022T215007Z`  
**Task ID:** Confirmed logic bugfixes, CLB-01 through CLB-05  
**Verdict:** **BLOCKED** — required interactive NSIS and Chatterbox host acceptance evidence remains incomplete. No unresolved actionable code finding was identified.

**Base commit and reviewed HEAD:** `a9f60ed2ef8be53141391260985aeabcd237140c`  
**Branch:** `codex/confirmed-logic-bugfixes`  
**Reviewer:** Independent `change_reviewer`, GPT-6 Astra high. Read-only source, diff, identity and supplied-evidence inspection. The reviewer did not edit files, execute tests/builds, delegate, or mutate Git.

## Reviewed scope and immutable identities

The review covers the five requested behavior changes, their regressions, direct callers, applicable requirements/ADRs, current documentation and supplied host evidence. No unrelated worktree change was identified. The complete 95-path identity table below contains 46 task paths and 49 unchanged supporting paths; it is durable evidence independent of the ignored temporary manifests.

| Input artifact | SHA-256 |
| --- | --- |
| `temp/clb-review/revision5-inputs.json` | `82c75fd1bab02a772fa51122d8095ad00664eb325b3e8970a52e50f9b12b0661` |
| `temp/clb-review/revision5.diff` | `b79d11d5f8434c29f4b82a83cda90ae09892e22c578f85af28861ec27a240df1` |
| `temp/clb-review/revision4-support-supplement.json` | `b99a831d2ad0f9c5ee94467bcbfb24fbac40621c185df42b4d09c31d09984213` |
| `temp/clb-review/revision4-support-supplement2.json` | `ed44886a64366df29b8e8cf4c00cbc33fe6081dc1fc7a75add2537a112b717a9` |
| `temp/clb-review/check6-inputs.json` | `2af5f5396107de72e7443d24633034296afa1f0ba5d1913456cc6e2c40e1a355` |

**Identity recheck: PASS.** Before and after the final R5 assessment, all 95 unique path identities matched their frozen manifests: byte SHA-256, filter-aware blob ID and status. Base/HEAD and branch remained unchanged, and the index remained empty. The tracked diff content matched the R5 diff artifact. New files were read in full. This report is excluded from its own reviewed input list.

R4 was not issued as a final report. The sole R4-to-R5 source/documentation change corrects the active plan's loose-executable label from “NSIS patched” to the verified Tauri `UNK` marker. The installed executable is separately identified by its `NSS` marker. This report does not renew or replace hashes in the immutable R3 report.

## Acceptance review

- **CLB-01 — exact NSIS directory detection:** Explicit branches correctly distinguish directories from files/missing paths. The executable regression uses extracted production NSIS functions and verifies all seven optional roots, default retention, update retention, explicit removal and junction refusal. The new final-installer silent lifecycle supports its six claimed option scenarios. Actual interactive page behavior remains unverified.
- **CLB-02 — Pause/ended race:** The player accounts already-rendered final frames while retaining paused intent, retires the completed unit once, and preserves successor, transition-delay, rate-change, refill and end-of-publication handling. Tests exercise both callback orderings, accounted/unaccounted tails, buffered/pending/final successors, direct/WSOLA callbacks and duplicate completion. Existing invalidation and resource bounds remain intact. Piper ES/EN host evidence supports the controlled real WebView2 timing cases; Chatterbox arms remain missing.
- **CLB-03 — operational error classification and recovery:** Canonical decoding, current service identity, applicable work identity and response-window checks precede the closed engine-error mapping. Invalid messages, wrong identities, non-engine reasons and impossible response windows remain protocol failures. Verified termination retains one bounded service-identity receipt so the actual client can acknowledge shutdown before explicit recovery. Replacement and force-stop invalidate it; missing, foreign and unverified receipts do not establish cleanup. Real-client coordinator tests and supervised-child diagnostics cover the corrected handoff. Zero automatic retries and one explicit recovery attempt remain enforced.
- **CLB-04 — primary default publication start:** The package selects the first addressable primary spine block without filtering or reordering the complete locator index. Reader initialization, restoration, initial saving and narration consume the same authority. Exact auxiliary restoration and explicit auxiliary navigation remain valid. EPUB 2/3, empty-primary and no-addressable-primary regressions cover the intended contract. Serialized schemas and narration preparation are unchanged.
- **CLB-05 — owned promotion residue:** The literal `.previous` path is discoverable and explicitly removable without admitting it as a runtime. Native cleanup preserves busy/runtime-lock boundaries, rejects unsafe trees, bounds recursive validation depth and propagates deletion failures. Source tests cover promotion cleanup failure, locked residue, restart/retry, junctions and unrelated-root preservation. The new installed-app observations establish backup-only discovery, truthful locked-file failure, restart/redetection, successful unlocked retry and preservation of unrelated/preference markers. Interactive NSIS backup-only behavior remains missing.

The active plan accurately keeps combined acceptance blocked, distinguishes historical and reused evidence from new observations, and records the failed download without claiming Chatterbox installation, integrity or playback success. The canonical diagram still describes the affected ownership and data-flow boundaries. No broader EPUB, performance, clean-host, signing or release claim is established by this review.

## Findings

**None unresolved.** No bounded source correction is requested.

The earlier R1 F01 containment/shutdown defect remains resolved: the native failure path now supplies the identity-bound acknowledgement required by the actual `TtsProcessClient` after verified termination. Its correction and negative identity/termination tests were independently traced in this review; the earlier review's conclusion was not treated as a substitute for source inspection.

The missing host gates below are evidence limitations, not confirmed implementation defects.

## Test and host evidence reviewed

All executions in this section are attributed to the coordinator's supplied normal local PowerShell results outside the managed sandbox. Installed UI observations are attributed to the coordinator's native Windows Computer Use session. The reviewer executed none of these checks.

| Command or procedure | Evidence and result |
| --- | --- |
| `pnpm.cmd check` | Reused final-source attempt 6, reported exit 0, `temp/clb-check6.log`: shared 209, EPUB 674, desktop 818 Vitest plus 97 Node, Rust 117/116 passing with two ignored helpers per configuration, Python 619; configured evidence, formatting, lint, type and build gates passed. |
| `pnpm.cmd test:browser` | Reused exit 0, 10/10, `temp/clb-browser1.log`, including primary opening, auxiliary navigation and saved auxiliary restoration. |
| `pnpm.cmd test:native-startup` | Reused attempt 2, exit 0, `temp/clb-native2.log`, including supervised-child operational failures and identity-bound shutdown/replacement, native reader/persistence/cancellation smoke and zero external requests. |
| `pnpm.cmd test:tts:reader-corrections-host` | Reused attempt 2, exit 1 overall, `temp/clb-profiles2.log`. Piper ES and EN passed, including controlled direct/WSOLA completion after Pause at 100%/75%, synchronization and cleanup. Both Chatterbox arms failed before audio because installed v5 was unavailable. |
| `pnpm.cmd test:chatterbox:installed-integrity` | Earlier exit 101, `temp/clb-chatterbox-integrity1.log`; no successful replacement evidence. |
| `pnpm.cmd package:piper-core:check` | Reused exit 0, `temp/clb-core1.log`. |
| `pnpm.cmd package:windows:verified-core` | Reused attempt 2, exit 0, `temp/clb-package2.log`; the earlier PowerShell module-environment failure remains recorded. |
| `pnpm.cmd package:windows:check` | Reused exit 0, `temp/clb-package-check.log`. |
| `pnpm.cmd package:windows:lifecycle` | New attempt 2, reported exit 0, `temp/clb-lifecycle2.log`: install, first start, repair and all six silent option scenarios passed against seven optional roots, including `.previous`, with independent preferences and unrelated markers preserved. |
| Installed in-app residue procedure | `installed-residue-locked-ui.txt`, `installed-residue-restart-ui.txt`, `installed-residue-retry-ui.txt` and the corresponding locked/retry file JSON under `temp/clb-review/` support actual cleanup failure, retained residue, restart discovery, successful retry and unrelated/preference preservation. |
| Original-data restoration | `temp/clb-review/follow-up-restoration.json` reports original data restored, retained older optional-package data preserved, synthetic backup removed, backup/quarantine absent and the reviewed application left installed. `ordinary-install-data-state.json` agrees with completed ownership-helper semantics. |
| `pnpm.cmd check:evidence`; `git diff --check` | Coordinator reports exit 0 after the final R5 label correction; `temp/clb-follow-up-evidence-check2.log` records the evidence check passing. |

**Reuse boundary:** All 45 paths in the final `check6` input manifest were compared with the current task snapshot. Only the active plan differs. Runtime, regression, harness, lock and relevant configuration inputs remain unchanged. Browser results are reused only for unchanged browser/renderer/EPUB inputs; native/profile results retain their original diagnostic-binary scope. None is represented as rerun during this follow-up. The new installed procedures are bound to the final installed artifact and do not inherit Chatterbox or interactive NSIS success from older receipts.

The new lifecycle result's `preexistingApplicationDataRestored: false` is consistent with its isolated inner test root: original user data had already been protected by the outer verified ownership helper. The user's later explicit ordinary uninstall/reinstall authorization superseded the earlier installation-preservation restriction. The helper's checked sibling rename/restoration logic and supplied final restoration proof support the documented preservation claim. The lifecycle output still explicitly requires manual interactive validation and does not claim a clean-host release gate.

The authorized Chatterbox acquisition failed naturally during a GitHub-release artifact read: HTTP 200, IO failure after 485,984 ms, with 1,896,430,272 of 1,900,000,000 bytes received. `temp/clb-review/follow-up-download-error.json` is failure evidence only. The coordinator reports operation staging removed and v5 absent; no successful integrity or audio result follows from this attempt.

## Final package identities

The reviewer independently read these artifact hashes:

| Artifact | SHA-256 |
| --- | --- |
| Loose release-locked executable, Tauri `UNK` marker | `ba5dca615375255763e249f9e6a6b4f415130efc2b1e856ef15d4fbb2f171ac8` |
| Final NSIS installer | `53be8afdafc6b40d434b49b31e64f58d0049ba2edf9d4d0ef8a4caefb44e7434` |
| Installed executable, Tauri `NSS` marker | `3be12a8e0cee3141297827734450bbb15c6faa97a24f52bc6aa681a7e6aa19f3` |

The coordinator's byte comparison attributes the installed/loose difference to exactly three marker bytes at offsets 9,128,866–9,128,868. The reviewer verified the separate hashes; the byte-difference explanation is attributed evidence. Installed residue observations apply to the installed hash above. These remain unsigned local artifacts.

## Remaining uncertainty and required next action

1. Obtain actual interactive NSIS observations for the exact final installer/uninstaller: optional-data and backup-only page visibility, page omission when optional data is absent, optional removal selected by default, preferences removal unchecked by default, and independent retention/removal choices with marker preservation. Computer Use rejected launching the exact uninstaller with `product policy blocks this app`; the procedure was not run. Compiled fixtures and silent flags do not replace it.
2. Establish a valid installed Chatterbox v5 prerequisite, obtain successful `pnpm.cmd test:chatterbox:installed-integrity` evidence, and complete the required Chatterbox Spanish and English arms of `pnpm.cmd test:tts:reader-corrections-host`. Bind results to applicable current inputs and artifacts while preserving user data. The failed acquisition and historical v5 release evidence do not satisfy these gates.

Keep the plan active and the patch unaccepted until both evidence groups are complete and a fresh immutable review is issued. Later source, reviewed-path or artifact drift requires reassessment; old approval hashes must not be refreshed.

This Change Review Report is not a Validation Report and grants no permission to commit, push, create a pull request, publish or mutate Git.

## Closed reviewed-path identity manifest

The following 95 rows are the closed reviewed source/documentation set. Status is the exact recorded porcelain string, or clean for an unchanged path. SHA-256 hashes file bytes; Blob is the filter-aware Git object identity. No path is deleted or renamed.

| Path | Status | SHA-256 | Blob |
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
| `docs/architecture/decisions/README.md` | ` M docs/architecture/decisions/README.md` | `3d3f0713f56ba7676dbdc059250083953832824870eae9ebc1984a8785c1325b` | `e1378193c05fceb8b6ff966493dbf448c6f87472` |
| `docs/architecture/overview.md` | ` M docs/architecture/overview.md` | `1ef6654713998757bcb29deae73feb667b09267a3a7758ba96b95bb9e3f7fa38` | `6d32bf28e19688363047f2ccd6038ab226ae8ce7` |
| `docs/development/testing.md` | ` M docs/development/testing.md` | `4f44d3deb9623503542969937b7a36a68a9ad9b80cf2fbc5bb142cdc3bda6eb9` | `eda9036f1d4d3dc6d240a8c6c49932b87bba2a45` |
| `docs/plans/active/confirmed-logic-bugfixes.md` | ` M docs/plans/active/confirmed-logic-bugfixes.md` | `6cb29c7e7887e32dcbdaf7726f90585e00f93381037c08af62dc74a0e833e0a3` | `6f81eb29896de6cfe7190a4b0cbcf407fa903724` |
| `docs/product/mvp.md` | ` M docs/product/mvp.md` | `b54a841333a9cd2dce9a72e9c9422ec5c126f8935ef7e5ee8743f4280e6221f2` | `0487937f5c0bc4f5b0967053d2b1c282975e4c8c` |
| `packages/epub/src/document/document-model.ts` | ` M packages/epub/src/document/document-model.ts` | `8888482a3d7c6aff55f2c6c322c2a6d0ac02e09359e17564bbe2c24e8ef4c10c` | `2985e855d7c30cb61920f2ab7460f01da95dd5a1` |
| `packages/epub/src/locator/locator-resolver.ts` | ` M packages/epub/src/locator/locator-resolver.ts` | `171bd177366298f9fd8559ba270b7933c84c52acf8c9eb61f08830127407f21d` | `3afd2fbf6052e3f03e8debb68285625247375197` |
| `packages/epub/src/public/open-epub-publication.test.ts` | ` M packages/epub/src/public/open-epub-publication.test.ts` | `e9b025185014d405b84ed9e620865cfb59d9e3833f95f84d604b4bf9fe356e24` | `61720e6c682f2c8caa9480b090c8df6092211882` |
| `packages/epub/src/resource/opened-publication.ts` | ` M packages/epub/src/resource/opened-publication.ts` | `138df675c66e7df59e2df1c13ef9e857a09b00d9759119e8d63892e83575e2e0` | `bf135ea7f538ce908d632b61befc83d9368559fb` |
| `packages/epub/test-support/epub-fixture.ts` | ` M packages/epub/test-support/epub-fixture.ts` | `40913ad7819f2da210c9d42e4613af3adcf9a300136136c3c6620a547a945b33` | `08bc02121283468b113ab16aa897bd5984661b72` |
| `scripts/test-windows-package-lifecycle.ps1` | ` M scripts/test-windows-package-lifecycle.ps1` | `d7d3003cbd824dbecba97a2e37161c21891823f3ae99355c4642b82cb9007e00` | `aef0e47571ae3c4b41d5da843716c7896e64893a` |
| `services/tts/tests/test_service.py` | ` M services/tts/tests/test_service.py` | `7e16c7f6e454f615e73eb23dfeb573857e975c4fe0074d75299908958c8a6a8d` | `e39dc9bdef25eadfcedf46f0fe4e6fc2f057e392` |
| `docs/architecture/decisions/ADR-0060-primary-publication-start.md` | `?? docs/architecture/decisions/ADR-0060-primary-publication-start.md` | `4b5b87520ce650be8d2ce5fac95738e6daa451c8724aa6163198225a7b45a09e` | `f19892b9c132922ae24527ac4837bd8ab7a75671` |
| `docs/architecture/decisions/ADR-0061-owned-promotion-backup.md` | `?? docs/architecture/decisions/ADR-0061-owned-promotion-backup.md` | `2dd2f3aa065efd9e06e7bedd289bf141225c15cf9a230ee247a6d26c2203e971` | `d0c61c876af87d8c9b4a73165e58753a8b4d7232` |
| `docs/plans/evidence/confirmed-logic-bugfixes/change-review.md` | `?? docs/plans/evidence/confirmed-logic-bugfixes/change-review.md` | `8758dbf19bfcc9c7f3764e83d3d173511f941caf58e098001d74eef0cb802452` | `d31bb10fbaf5a0be1e5cf485b11ecfa2249b0379` |
| `.agents/PLANS.md` | `clean` | `f54345a6ee7dd2eeccd56a2c05a854da9178758b7e4adbf21f025122676fa00c` | `960ef8eb5000901a8a945c69ea6386179add517c` |
| `.agents/skills/investigate-bug/SKILL.md` | `clean` | `38f462e6d65782abae02fc8f4cff338b2fe1361f829b03b956663efe4840dec5` | `794c4ae3a9e91e7bc3850a9b4309a3ec8ebbf648` |
| `AGENTS.md` | `clean` | `b2c6b7baca13b2345265410fe3947b4c20f2fc3064ba00e83e10c64895b0b424` | `c06bfb24454caf9e9a7af6820425f627d9ff3b4e` |
| `apps/desktop/package.json` | `clean` | `7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa` | `46b13978c4094f004349ba762f31bddeb104cb9f` |
| `apps/desktop/scripts/acquisition-file-barrier.mjs` | `clean` | `f4026c2949a053767577dd6f0cbe6a3523647ae715f5c9b31f1920a5a50d27e6` | `38874640864314241655b7a5251d480add8955f8` |
| `apps/desktop/scripts/acquisition-file-barrier.ps1` | `clean` | `427aa65c78efcddc5123bf537d0deed73afede40af175f8333f5e456c8bd84d9` | `88e63c036356231ec97556433d7a5b184e92cf03` |
| `apps/desktop/scripts/reader-corrections-host.mjs` | `clean` | `ddc11f62f11f0d93344ac706285b40b0b329c59a82b42807f6b917dba2f5bbee` | `b394092abe6790c31780b3e38d0688058c24486f` |
| `apps/desktop/src-tauri/Cargo.lock` | `clean` | `8b1a08b28ba0ef4dc9440066fec0ffe43d0fa9bc1e68309968d5f69b6b51e08a` | `02e89caf48140bb58052dcc67cd22eb86d643124` |
| `apps/desktop/src-tauri/Cargo.toml` | `clean` | `f7589af14b344c827c746e5741a3a5f6d274e8b0643a829ec5a0b3d6971dde09` | `2d119b08ff5c815f3f4926cb2ae6892fddd5bf3b` |
| `apps/desktop/src-tauri/tauri.conf.json` | `clean` | `b76a7342c6ce9918bb499ddd50f4910667d50cf5dda564e3103ab8d56a99191a` | `086ffec207c95af2fef00c7726a3728d94279bbf` |
| `apps/desktop/src-tauri/tauri.release.conf.json` | `clean` | `aac957a44c8524043241ac3e10b4f589ccdc6b34dd2c111bc26b0e7d437bdc34` | `715f72d19313cfd169a4b08d85c2af928243c48b` |
| `apps/desktop/src/settings/narration-settings-actions.ts` | `clean` | `8782470007e32e81af7f6b04bd3cd51f878635e410ab9c70664371e327517db5` | `d49281f8ad9c336568cc6e56f6d596cd25458ac7` |
| `apps/desktop/src/tts/OptionalChatterboxControls.tsx` | `clean` | `fc19f43063ae96aefb0dbbcaa459e5d62625475e7dec97024551f47cec5aaba3` | `dcbff79992fe37758d72ff4ca96c264061e24856` |
| `apps/desktop/src/tts/operational-recovery.ts` | `clean` | `409e6a4303e7fc6dc180fa62cae06be3e1e978040d8d322f81bd08c31a508ef8` | `5310ee2cd333fc0035ffff53f427d451ca63924a` |
| `apps/desktop/src/tts/optional-chatterbox-client.ts` | `clean` | `e3f9de15fff2e1b104eaed604528aed96f7175560762e5290b0eb081d14c60df` | `56d8fe34de239c8ec5aaebf59c7221106253740a` |
| `apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts` | `clean` | `dec06428c22f8f7196f77a69eadd902b1891a3ab34d54ce0c2a894205ff47b45` | `e0f6cb7ee4bb30016be9137c5a6ef0fa79ee0fe5` |
| `apps/desktop/src/tts/process-client.ts` | `clean` | `47cf286af9741e7772c9ea5950f2ce9b578ca336ae791e5f7fbee555ea084231` | `679960693726a7c3bbe952d1a8c94bfebd22b984` |
| `apps/desktop/src/tts/product-narration-coordinator.ts` | `clean` | `cde1590fa6953e2419ac30a9c6fc6d189f418147768387b2c3c4a73a20049ac1` | `34e83f523ff44f1c55951b3b599d4e31ef8b78d2` |
| `docs/architecture/adaptive-buffer-authority-v1.md` | `clean` | `684290262997b0446bf155ddb1b5967e71f7ef839936b68e5c2b8b2ca958a919` | `dd5a2bc183329bb67f26f779fe9a82857114ccfd` |
| `docs/architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md` | `clean` | `3d5ac04867ca300e599055c30e62ae65fd1af1b0785325ffebfebb3e693a723a` | `40e4ccb76b45a94b84431b66bd30615adb4b9ea8` |
| `docs/architecture/decisions/ADR-0058-admit-certifi-pillow-chatterbox-v5.md` | `clean` | `948676c090549045f26d0583fc9a2cce067ff9af15474535bd12e8f8dffa6241` | `dbe6649400c5b7c24a67baee79e6e0d108b420aa` |
| `docs/architecture/hardware-profile-recovery-authority-v1.md` | `clean` | `df147c308d737375d2450a660b10b2f82b64c307ee5e4b9de7f280ee407b1518` | `2eb2215ae4a8602e1c46472b76f072125939a8cc` |
| `docs/architecture/playback-transition-pause-policy-v1.md` | `clean` | `41afaf8df9e6a1273586e14c091a3bd56e0c5f64d13b9c09c1502cd0768dd441` | `282796f452655e7f2b2d7fa63211f3017be3c8e7` |
| `docs/architecture/reader-settings-playback-authority-v3.md` | `clean` | `b2d443fd081c7280a95a36b707891ccd8bf08904e8816b1a30c4353a1f17d42d` | `77a1693642648df828b5314ecefb9dbb852470d3` |
| `docs/architecture/synchronization-authority-v1.md` | `clean` | `244d2fb8cbf381d43c67259093f20fef8f01ad1acca1de0e1128f6b3a13b9592` | `5917a5bef22fd0034dd512d900468fdc53772074` |
| `docs/architecture/system-diagram.md` | `clean` | `e12b79b8beb6b12d948d7e9795dbd92f23ad73793d52e76502525f3e7ef4f537` | `0a918fc1719ebf85877c1d4494d8f4c0fd383dd1` |
| `docs/architecture/tts-service-protocol-v1.md` | `clean` | `44f53337611c0a861c8b10e021b5676d9a6523dbea40b526d165f7f17b856223` | `3466b3f003eb0acefbad98dd4c6120d071c107b1` |
| `docs/development/agentic-change-review.md` | `clean` | `de4c430a5de120d9c900d6bad0bebbfeec81673614b30f242f3154efbedcfc39` | `373443e17547185e2294d906bdc9cb489daca67c` |
| `package.json` | `clean` | `1f338a627cb8733b823e9c434c7e18647cf771cd63043e83a4a87ad587f5ad6e` | `b09ae26aa241b8026c3a0e25078018f29b26df0e` |
| `packages/epub/src/locator/locator-index.ts` | `clean` | `3b0fec45c88ddbaa4c0e221a87dc5dce2ebe2b184a2241252517bfc340082a2b` | `2bdfad299dde5bd187664a8d62db4959d9841d71` |
| `pnpm-lock.yaml` | `clean` | `e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426` | `acf5034202c5933f5c1dff89beff28587c826088` |
| `scripts/build-windows-release.ps1` | `clean` | `1183b8a483ecdb243ec75d962729446face6ac938284b3f66616f5673ae8b0ce` | `9577102d19bede044f4ce21d62a2f5fc489a215c` |
| `scripts/windows-package-lifecycle-data.ps1` | `clean` | `4716828987233bb7543b14fb0a75ea6f30217fc574a6341eff36d3798bc2e566` | `d81a643d5d2f728318c10f9241a4246e52f39326` |
| `services/tts/release/optional/chatterbox/optional-package-manifest-v5.json` | `clean` | `52eb229074b35dd597e1b8568ca4c046bdf999cab2272d8400458dd3280b6761` | `7a05354fc40f5a4804347abe5d8aa21dd8158830` |
| `services/tts/src/voxleaf_tts/service.py` | `clean` | `f8a10d5420f21d8f12f3acd7eb1d925d18452afdfa182a344d35e2bf9f5f8f70` | `1cdc2734ee05f33d309f4f642fc91a6b6c3e20ad` |
| `docs/README.md` | `clean` | `e1542b51cfe0be87c76ff37717314fa3c6db4ac125776239a9f5d2b795f4ef29` | `517ea2bec359c932785bdfabd0b37bc92ec13214` |
| `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` | `clean` | `a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae` | `16ba1a7002366ad9312223d51dace7902d6ae751` |
| `apps/desktop/src-tauri/src/tts_service_protocol.rs` | `clean` | `a8895ec9f5c569569c5cc37de451d37304822731e565c94a1665d080ce426617` | `d3fac47c4985d6cc6ac0e5663fc971d506a2cc49` |
| `packages/shared/schemas/tts-protocol-control/v1.schema.json` | `clean` | `2ad914d3d8dd2a3fac581e8f49b6cd28456671cecdefa25bcf02fa79c08b4e3b` | `663cf17befd69f4e09cd777d54e6ad27208316ce` |
| `docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md` | `clean` | `1ebf7d4ab35bee3eb2ccd9c4ae46c8dbbcd107058f4cfeb54dd4d4d152e06175` | `d27c851220b4a22ca3a896fcbce2fa154033387d` |
| `docs/architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md` | `clean` | `7253af0bbb1103ee7ca57bdb19b61de53c3b7e558806fa5a6f2dad7e59c4b699` | `2d9c6d70e7a656c0f9426cef320040c9722ab1dc` |
| `docs/architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md` | `clean` | `96e6fc2df076d52193f2a806b1c039cd10842dce67f79738a87d1c7c2d16f628` | `b04b0986041284e2508974d6cb19ad3d1a53e3db` |
| `docs/architecture/decisions/ADR-0048-admit-bounded-epub2-and-ncx-compatibility.md` | `clean` | `966c8015776e8b7bcac366fc6378d29b3a9f9229b685c452c2fcecf0e593e3d2` | `6dd41a516907b67a3b212b453d193dbaf684c879` |
| `docs/plans/completed/M005-narration-text-preparation.md` | `clean` | `a20136c18ee476bfad5a7a8d6e12c40beae7db3180bbbe38f62e4019e69ed7d6` | `219ae4fe16b4c740b1fbbbafb867f4071c0be7f8` |
| `docs/plans/roadmap.md` | `clean` | `664a0323d2b20e055ac64b104479aa11e751ef45ce71ed8a607ab27584f34428` | `21f8bc4a2e4898f2ed6518b527e9e9c8cb50c6f5` |
| `apps/desktop/src/App.tsx` | `clean` | `f4f2c61e55aa212d999b9d56ecfbeb7dc5cc7992e844f98842f36c54db36e17e` | `ddf10a4b143c53aeac16230dfb2f8163c6c11146` |
| `apps/desktop/src/app-reader-restoration.ts` | `clean` | `813a4e05661a9c8af345f0dfe7486deeb4da681c6fcf3f4c5ba0756d32f8ceb7` | `a224767dcbe0e303fb6220436140317af59ab2a7` |
| `apps/desktop/src/reader/ReaderPublication.tsx` | `clean` | `92554e30d67e062aaf8508ca3e709e5074565fb74417d7d9901cbe828efcd987` | `6fe5a0eab3cf07dace73f7c307625d6d127e9bbd` |
| `packages/shared/schemas/operational-error/v1.schema.json` | `clean` | `556cfc6dd26b7ce9b8e480435c3d8709dee6de69cbc627ad5e3c4cee0fc4ab59` | `33a01a7ecf642cb9a55b085115f2749ee8772961` |
