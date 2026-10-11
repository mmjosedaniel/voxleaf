# Validation Report
Report ID: TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-03
Target ID: TTS-ADAPTER-LAYOUT-01
Mode: POST-CHANGE
Verdict: FAIL
Environment: local PowerShell outside sandbox
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: the exact35 closed work-order paths in the identity table below, including both sides of the four moves.
Validated path identities: captured before commands in before.json; complete protected260 identity manifest is also integral to before.json. Every status below is exact porcelain text; hashes are SHA256 and filter-aware git hash-object --path=<path> -- <path> expected index blobs.
Identity recheck: PASS. before.json versus after.json: HEAD, empty index, all35 validated and all260 protected identities unchanged. All25 bound artifact files, new2031 frozen resource records and preserved old2037 resource records unchanged. See identity-after-comparison.json and artifacts-before/after.json.

| Path | Exact porcelain status | Worktree SHA256 | Expected index blob |
|---|---|---|---|
| `services/tts/src/voxleaf_tts/piper_adapter.py` | `[" D services/tts/src/voxleaf_tts/piper_adapter.py"]` | `DELETED` | `DELETED` |
| `services/tts/src/voxleaf_tts/chatterbox_adapter.py` | `[" D services/tts/src/voxleaf_tts/chatterbox_adapter.py"]` | `DELETED` | `DELETED` |
| `services/tts/src/voxleaf_tts/qwen_adapter.py` | `[" D services/tts/src/voxleaf_tts/qwen_adapter.py"]` | `DELETED` | `DELETED` |
| `services/tts/src/voxleaf_tts/fake_engine.py` | `[" D services/tts/src/voxleaf_tts/fake_engine.py"]` | `DELETED` | `DELETED` |
| `services/tts/src/voxleaf_tts/adapters/__init__.py` | `["?? services/tts/src/voxleaf_tts/adapters/__init__.py"]` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391` |
| `services/tts/src/voxleaf_tts/adapters/piper.py` | `["?? services/tts/src/voxleaf_tts/adapters/piper.py"]` | `844d55f64992b620a2f1f708b26a699e6935eff9f8e7c6e9524f98ce45ed209c` | `1ba3ffa3352e0a9afde4a23841050e81335f97e1` |
| `services/tts/src/voxleaf_tts/adapters/chatterbox.py` | `["?? services/tts/src/voxleaf_tts/adapters/chatterbox.py"]` | `6896d06cdabcef5f774f9a251f6d5eeb4b2474a8c27b626aac2da43c9555d669` | `159b2b8dff183285efa901c149dd33d9cc5a28b0` |
| `services/tts/src/voxleaf_tts/adapters/qwen.py` | `["?? services/tts/src/voxleaf_tts/adapters/qwen.py"]` | `2940be2d31beeeb78d2a718d767a86f48806bca39961795f5be82d47fc2c06d5` | `4f93451abbd7108ac5e225e48ba73ea87bf82785` |
| `services/tts/src/voxleaf_tts/adapters/fake.py` | `["?? services/tts/src/voxleaf_tts/adapters/fake.py"]` | `1863c0e3e1617b71cd9ca9d647aed05e6384ec71f33ef6e47221983a6fbb8023` | `3c16e17b14792b9c823647541e072495601523bc` |
| `services/tts/src/voxleaf_tts/service.py` | `[" M services/tts/src/voxleaf_tts/service.py"]` | `528992e393e225475280007f622bd764dd0dc7d89329ddc1ba897bb7c7c06bd0` | `77ed1f9bb7d084b82c7277e4743600233022af9d` |
| `services/tts/src/voxleaf_tts/piper_service.py` | `[" M services/tts/src/voxleaf_tts/piper_service.py"]` | `f5816615cc220661f217f1f5070ea6ff6d6d02d1661f88594de2b60c79949980` | `3e0a12c41f23c11aed4ba5db7eb67277f68f9ebf` |
| `services/tts/src/voxleaf_tts/chatterbox_service.py` | `[" M services/tts/src/voxleaf_tts/chatterbox_service.py"]` | `81ec218ca9e786af43acae14310c8cf00ae33cd3e776e41958cfd456b6221777` | `02eaa22a6af1d8e043f8bc57794d4ab0d5fe9123` |
| `services/tts/src/voxleaf_tts/qwen_service.py` | `[" M services/tts/src/voxleaf_tts/qwen_service.py"]` | `64b1ed77e177c9267192154e8f47caae71f67a38cd3d05c854b5c9270e246531` | `4633a66738c1ea4d8a884fdfc012c4737436e542` |
| `services/tts/src/voxleaf_tts/release_core.py` | `[" M services/tts/src/voxleaf_tts/release_core.py"]` | `765fc7e288b103e006ee660085d86846f258fb77b82b87873b2e900feb688980` | `d8c55e2fa7f187a8536e9c1aa9c5bab10e582832` |
| `services/tts/src/voxleaf_tts/release_chatterbox.py` | `[" M services/tts/src/voxleaf_tts/release_chatterbox.py"]` | `975f459e5295c16483aa9ede24d0fa684a202b3d2ee6e850e25c39f3781d9fea` | `8c18de68bdd771ad63ecee079440bf4d789d24e9` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` | `[" M services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py"]` | `1b8b2b885762d0f6159662f96ec955b3f40a0b8c0c81bd027ef0676b38fe9ec0` | `09784d179ea7d7e30713622c5b54f7f063439e3a` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` | `[" M services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py"]` | `10486a491fab9fa13f6776c8b2e9a8e5412aab69b76daad28821d0a353c43e55` | `4e50216b578a98b5d71ac39ebd13add8ef08de99` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py` | `["?? services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py"]` | `294d6a53af9af5da947f689c4eaae4e2d41caa036a20d6ac5a15bddab35cf4a6` | `f8ddbf3c2a4c45ae3da785b8eafb8bfd77300fbe` |
| `services/tts/tests/test_piper_adapter.py` | `[" M services/tts/tests/test_piper_adapter.py"]` | `128fdd5ba6f93b25b971344c6ba68574d4689ea1c72758bbfe64ff5e366cceef` | `f1421bde1dbe89be21564c8887d807ebe140bd05` |
| `services/tts/tests/test_chatterbox_adapter.py` | `[" M services/tts/tests/test_chatterbox_adapter.py"]` | `b2524acb6634c291a76b86ef1fe9755eedb723f543ffccb065ca154e5fb8b029` | `5717875d6d8448609518d294004494e5cb79cce6` |
| `services/tts/tests/test_qwen_adapter.py` | `[" M services/tts/tests/test_qwen_adapter.py"]` | `3fa73106f377915e13baa3cfa3afe9d891c32db89a9408bf1c1882a3f246834e` | `debee220256d45897a3f52d055859952e23ce5d4` |
| `services/tts/tests/test_service.py` | `[" M services/tts/tests/test_service.py"]` | `63a818b727dafe05dc14d1e3b7a2f2670f4279f506bf5510c7f1a517f51bc993` | `f7a00fbb36ba9910dc15a4a7f6557e5efb4120e0` |
| `services/tts/tests/test_release_core.py` | `[" M services/tts/tests/test_release_core.py"]` | `0dcec8a5eb182155e947ce0e4a021fda620d53b1abaad28cccba1b6174d839f0` | `898e5b8bcc6dbf49e994481e94ffadd62604e421` |
| `services/tts/tests/test_release_chatterbox.py` | `[" M services/tts/tests/test_release_chatterbox.py"]` | `207ac9831962ade69f0385b6d3bca2a56d7cebc22c440f71a38a0c7a8654bc81` | `d5803ce1408f6e721dd428834c686a8ce9fca6ea` |
| `services/tts/tests/test_chatterbox_sources.py` | `["?? services/tts/tests/test_chatterbox_sources.py"]` | `dd706bef238d6bea965d9c1f0d2de7125822613b59ec820a6b36bb07b1f601d6` | `0f98c442a0309896281c711e55c145857529850f` |
| `services/tts/tests/test_adapter_layout.py` | `["?? services/tts/tests/test_adapter_layout.py"]` | `ff870f22736f5b625a3d503b3f957e8e594fb602505b9fcb7ac7ebf49a04d3c2` | `3c8d70f3c5c59c544453827622746850114b6935` |
| `services/tts/release/core/runtime-manifest-v1.json` | `[" M services/tts/release/core/runtime-manifest-v1.json"]` | `3b03502031c188b5aef5c983859a93f506509648a2ddb35dcfec402877398062` | `4d348f5a8aa01caea12afcbb1bbe2385ae534d1e` |
| `services/tts/release/core/core-package-evidence-v1.json` | `[" M services/tts/release/core/core-package-evidence-v1.json"]` | `e46ed9afe2ed06a6c2d847473a6cceb6cc631378289055a4a691357db11a6a8a` | `58bab708db7ab389a87fff51534f6fd2abfa08a1` |
| `services/tts/release/optional/chatterbox/source-manifest-v4.json` | `["?? services/tts/release/optional/chatterbox/source-manifest-v4.json"]` | `76741c983f4e7263ffe03ac728eb80cd4cc0bdc13eda4f4dab55aa4996cbb284` | `c389c99b2af67e5a2b9f6835887286f1f9b4e1b7` |
| `apps/desktop/src-tauri/release/windows-package-evidence-v3.json` | `[" M apps/desktop/src-tauri/release/windows-package-evidence-v3.json"]` | `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad` | `7ccede05fcac4f562720b03c2085fa2bad1084be` |
| `apps/desktop/scripts/tts-adapter-layout-host.mjs` | `["?? apps/desktop/scripts/tts-adapter-layout-host.mjs"]` | `45a995b38eb53a150ec7434d9bdea66fdc3204dc0f7b7c2486c0092cd8254de9` | `930f025649d667e4eec6a94a76bbe3d26bfa9e9c` |
| `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | `["?? apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs"]` | `9c309841d7540ae2eb939c5c0ab73947f74caf9a6a9d1df6606620420ff14f34` | `7e14011a7bbee83caae14849be4109f6c467cf3d` |
| `apps/desktop/package.json` | `[" M apps/desktop/package.json"]` | `52f30bf20748028ff3e9dd97a197c4193cbe6572aea3aea3d4a4bd86a123c3d7` | `e0aad3012a5902bb274e0230e47998c43af8d541` |
| `package.json` | `[" M package.json"]` | `d56217dc1693231f9bfbd422d30afe228d28564068d32fafe747e06d4fd792eb` | `fd9e98b5009c9b58386cf886e752c1ab0df775f8` |
| `docs/development/tts-service-organization.md` | `[" M docs/development/tts-service-organization.md"]` | `5d3f109ed597817db99a6e3b044dc01dd1281a5586da669a4e8b957369b8ec73` | `fa6b9a7d707eaa959b6b3581f19526aab406e790` |

Commands and outcomes:

1. `pnpm.cmd format:check:python` -> exit0. 174 Python files already formatted. Raw `command-01.log`; UTC 2026-10-11T05:21:06.0638475Z through 2026-10-11T05:21:07.0749500Z.
2. `pnpm.cmd lint:python` -> exit0. Configured Python lint passed. Raw `command-02.log`; UTC 2026-10-11T05:21:07.0892152Z through 2026-10-11T05:21:07.5114934Z.
3. `pnpm.cmd typecheck:python` -> exit0. 171 Python source files passed configured type checking. Raw `command-03.log`; UTC 2026-10-11T05:21:07.5140189Z through 2026-10-11T05:21:08.6107351Z.
4. `pnpm.cmd test:python` -> exit0. 485 Python tests passed; existing pytest cache permission warning retained. Raw `command-04.log`; UTC 2026-10-11T05:21:08.6127270Z through 2026-10-11T05:21:32.3143608Z.
5. `pnpm.cmd build:python` -> exit0. Fresh maintainer wheel built; independent isolated-wheel proof below. Raw `command-05.log`; UTC 2026-10-11T05:21:32.3293332Z through 2026-10-11T05:21:32.8421465Z.
6. `pnpm.cmd package:piper-core:check` -> exit0. Actual current Piper package integrity passed. Raw `command-06.log`; UTC 2026-10-11T05:21:32.8436375Z through 2026-10-11T05:21:40.2751590Z.
7. `pnpm.cmd package:chatterbox-optional:check-source` -> exit0. Frozen v2 raw-source authority passed. Raw `command-07.log`; UTC 2026-10-11T05:21:40.2767849Z through 2026-10-11T05:21:40.9039954Z.
8. `pnpm.cmd package:chatterbox-optional:check-acquisition` -> exit0. Frozen v2 acquisition recipe passed. Raw `command-08.log`; UTC 2026-10-11T05:21:40.9061402Z through 2026-10-11T05:21:41.5160726Z.
9. `pnpm.cmd package:chatterbox-optional:v3:check-source` -> exit0. Frozen v3 raw-source authority passed. Raw `command-09.log`; UTC 2026-10-11T05:21:41.5182115Z through 2026-10-11T05:21:42.0736693Z.
10. `pnpm.cmd package:chatterbox-optional:v3:check-acquisition` -> exit0. Frozen v3 acquisition recipe passed. Raw `command-10.log`; UTC 2026-10-11T05:21:42.0750964Z through 2026-10-11T05:21:43.1253853Z.
11. `pnpm.cmd package:chatterbox-optional:v4:check-source` -> exit0. New local-only v4 source authority passed. Raw `command-11.log`; UTC 2026-10-11T05:21:43.1267332Z through 2026-10-11T05:21:43.6876971Z.
12. `pnpm.cmd package:chatterbox-optional:v4:check-local` -> exit0. Actual v4 full local payload/archive/parts passed. Raw `command-12.log`; UTC 2026-10-11T05:21:43.6890780Z through 2026-10-11T05:24:36.2725585Z.
13. `pnpm.cmd test:tts:adapter-layout:preflight --receipt=C:\Users\mmjos\Desktop\workbeanch\voxleaf\tmp\evidence\tts-adapter-layout\validation\TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-03\preflight-receipt.json` -> exit0. Actual Piper/v4/installed-v3 closure, six models, isolated imports, exact firewall and canonical interpreter passed. Raw `command-13.log`; UTC 2026-10-11T05:24:36.2763025Z through 2026-10-11T05:27:43.3784108Z.
14. `pnpm.cmd test:tts:adapter-layout:candidate --receipt=C:\Users\mmjos\Desktop\workbeanch\voxleaf\tmp\evidence\tts-adapter-layout\validation\TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-03\candidate-receipt.json` -> exit1. FAIL: tts-adapter-layout-host:service-lifecycle during Chatterbox candidate. No complete candidate receipt. Raw `command-14.log`; UTC 2026-10-11T05:28:49.0238525Z through 2026-10-11T05:30:06.3592660Z.
15. `pnpm.cmd test:tts:adapter-layout:desktop --executable=C:\Users\mmjos\Desktop\workbeanch\voxleaf\tmp\tts-adapter-layout-desktop-02\voxleaf-desktop.exe --receipt=C:\Users\mmjos\Desktop\workbeanch\voxleaf\tmp\evidence\tts-adapter-layout\validation\TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-03\desktop-receipt.json` -> exit0. See desktop result and content-free raw command-15.log below. Raw `command-15.log`; UTC 2026-10-11T05:30:39.5128588Z through 2026-10-11T05:53:46.3120568Z.
16. `pnpm.cmd check:portable` -> exit0. Portable aggregate passed; desktop 588 Vitest +47 node tests, shared209, EPUB651, Python485. Raw `command-16.log`; UTC 2026-10-11T05:21:18.9452143Z through 2026-10-11T05:23:05.1311577Z.
17. `pnpm.cmd check` -> exit0. Full aggregate passed: formatting/lint/types/schema/build; Rust87 default +88 release-locked tests, both clippy configurations; same JS/Python suites. Raw `command-17.log`; UTC 2026-10-11T05:23:05.1486174Z through 2026-10-11T05:25:30.6486144Z.
18. `pnpm.cmd test:native-startup` -> exit0. Native startup passed with verified signed WebDriver155; fake lifecycle, IPC, reader/synchronization, persistence/privacy assertions passed. Raw `command-18.log`; UTC 2026-10-11T05:25:30.6509660Z through 2026-10-11T05:26:10.5118163Z.
19. `pnpm.cmd package:windows:check` -> exit0. Current Windows package evidence check passed. Raw `command-19.log`; UTC 2026-10-11T05:23:07.9657876Z through 2026-10-11T05:23:08.4307648Z.
20. `pnpm.cmd inventory:release:check` -> exit0. Release inventory passed. Raw `command-20.log`; UTC 2026-10-11T05:23:08.4419206Z through 2026-10-11T05:23:14.9451376Z.
21. `pnpm.cmd audit:release` -> exit0. Release audit passed under existing policy; Rust informational7/windows-reachable5; Chatterbox blind spots chatterbox-tts,resemble-perth,torch,torchaudio retained. Raw `command-21.log`; UTC 2026-10-11T05:23:14.9494867Z through 2026-10-11T05:23:33.5090500Z.
22. `pnpm.cmd test:chatterbox:dependency-security` -> exit0. Exact v4 embedded Python dependency-security seven cases passed with zero network attempts. Raw `command-22.log`; UTC 2026-10-11T05:23:33.5157403Z through 2026-10-11T05:23:46.5955543Z.

Frozen authority SHA256: Approved Work Order01 bf7ce6019bfe47fe6ef41d195bb33cae1406b294487c185258b6199aec58b5fb; Correction Order02 896061391df5c333ac329f2669384039b9a3fef6be34485eaf5eb7f7f9b76685; worker-correction-02 raw Change Packet a142b96b1f99f18141abada2b7335f6766bbdaa7e27041619945762979236b9b; full35 source-identities.json 74dd4c9fe203d68729ad3636bd19498e8cddaa7a75f30cd7d8f1f991a2cffe11. Independently rechecked on host.


All22 configured commands were attempted afresh. No past PASS substitutes for current execution. Process-local environment: pinned C:/nvm4w/nodejs/node_modules/corepack/shims first on PATH (pnpm11.15.1), native System32/WindowsPowerShell/v1.0/Modules PSModulePath, and signed isolated VOXLEAF_EDGE_DRIVER_PATH override. Command22 prepends the exact v4 runtime directory on PATH, enables no-bytecode/offline/no-user-site settings and uses ignored cache locations. Actual host LOCALAPPDATA is used, never the sandbox's package-local value. No writing package builder, installation/acquisition/uninstallation journey or repair was run by validator.

Independent supplementary proofs:

- Validator capture.py before/after: Git HEAD/index and exact35+260 path identities; all25 artifacts, new2031 resources and preserved old2037 records.
- Validator preparation-review.py: 27/27 recovery copies rehashed (original9, retry recovery05 nine, final recovery06 nine). All2031 actual frozen resources exactly equal configured release inputs AND2031 fresh NSIS resource File directives by path/size/SHA; zero missing/extra/duplicate. All4 newly frozen artifacts match successful preparation receipt. Exact source hashes and proof details are retained in preparation-review.json.
- Validator supplementary.py: actual7/9 historical Git-module bytes bound to immutable v2/v3 authorities; old/new failed-copy OSError both expose fixed ReleaseChatterboxError identity; mechanical relocation/accounting; fresh actual wheel extracted and loaded with an isolated Python process. Four stable service imports come only from extracted wheel; no old forwarding modules or eager third-party engine imports. Corrected copier bytes match current source.
- Validator tree-closure-diagnosis.py: current installed-v3+models, core/dist, v4 and frozen desktop02 core have zero extra/missing files. Preflight independently hashes actual bytes.
- Read-only driver verification: Microsoft Edge WebDriver155.0.4283.45, Authenticode Valid/Microsoft Corporation, SHA256 dc99c208c10a5364e61c4e5b1341be492f3224de753adb23e973be97875b1892. Existing unrelated/global driver was not modified.
- Fourteen firewall rules preserved: original8 plus exact task rules0..5. Each task rule has enabled outbound Block/Any at the exact approved interpreter path; installed logical and canonical paths are both covered. All profiles enabled and MpsSvc running. No validator firewall mutation. Final content-free process inspection confirms no relevant model/native/test-driver processes survive.
- `node tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-03/provider-import-diagnostic.mjs` -> diagnostic exit0 with reproduced provider import failure described below. This is diagnosis only, never acceptance. It imports providers without loading a model or inference, using the exact copied v4 interpreter, original exported childEnvironment and candidate-equivalent deny policy. A first temporary diagnostic import-path typo failed ERR_MODULE_NOT_FOUND before spawning Python; only that ignored diagnostic path was corrected. No production harness copy was changed/executed.
- `git diff --check` -> exit0; final status and scoped files retained in final-git-status.txt. No Git mutation.

Fresh wheel SHA256: `3934251aff7e4bc8832dee49082c358a2bc85d9eb0c525ec4783147dcf915e7d`.

Diff scope: PASS. Closed35 unit paths; mechanically equivalent1614 relocated engine lines; 2983/3000 additional rename-aware changed lines, including generated151/300. Director coordination evidence is separate and frozen. No dependency/lock/schema/model/native-admission/engine algorithm/UI/narration changes or unrelated source edits.

Invariant review: FAIL. Candidate runtime acceptance is incomplete because the new audit bootstrap prevents the unchanged Chatterbox provider from importing. This is an executed harness defect, not a proven engine regression. The four moved engines are mechanically unchanged except relative imports; actual public protocol, model/profile/voice settings, service/release entrypoints, historical v2/v3 authority and native v3 admission remain unchanged. No current-source fallback, automatic fetch or eager engine dependency was introduced. Local v4 remains unpublished/unadmitted and uses exact existing requirements/model/safe loader/notices.

Candidate failure and independent diagnosis:

- Required candidate command exits1 with `tts-adapter-layout-host:service-lifecycle`; no complete candidate receipt exists. Content-free process observation establishes it reached the fresh copied Chatterbox v4 interpreter after Piper. Do not treat partial execution as certification of all four candidate arms, cancellation/restart, clean shutdown, audit counts or end-to-end artifact recheck.
- In apps/desktop/scripts/tts-adapter-layout-host.mjs bootstrap, the audit hook rejects every `subprocess.Popen` with `RuntimeError('external-api-denied')` and increments networkDenied. The exact copied NumPy implementation, runtime/Lib/site-packages/numpy/testing/_private/utils.py:1239-1253, performs import-time `subprocess.run('lscpu', capture_output=True, text=True)` at line1247. It handles OSError only. The audit RuntimeError escapes this local CPU-capability probe and aborts chatterbox.mtl_tts import; the unchanged adapter's load exception mapping becomes a protocol lifecycle error.
- The import-only probe independently reproduces torch import success followed by chatterbox.mtl_tts RuntimeError external-api-denied, with an audit stack identifying subprocess.Popen -> subprocess.run -> check_support_sve. No external connection was attempted by this event, and the subprocess is denied before launch. The current label conflates local discovery with network access. No documented process-local bypass was established or applied.
- An exception-type-only adjustment would be insufficient: the same denied local subprocess increments networkDenied, and startService rejects nonzero networkDenied at clean shutdown. A redesign must address classification and acceptance accounting together while preserving unconditional subprocess denial and strict actual-network rejection.
- No third source correction, dependency change, exception relaxation, modified harness acceptance or retry bypass was performed. Earlier candidate identity-order defect is fixed and its missing/mismatched/extra/sorted-wire regression passes; this separate import-audit defect was exposed only after execution progressed further.

Test-integrity review: PASS. Existing behavior assertions remain; added sorted-wire completion test verifies all four exact fields with extra/missing/mismatched rejection. Link tests retain exact logical/canonical environment-derived pair and root/descendant anti-link checks. Frozen historical fixture bytes remain unchanged. Passing unit tests do not cover the import-time audit incompatibility; a redesigned order must add that real-provider boundary regression without weakening network/payload restrictions.

Privacy/artifact review: FAIL for incomplete required candidate privacy/lifecycle evidence, not payload contamination. Fresh complete frozen2031 closure passes, installed model/runtime integrity passes, and no prohibited book/audio/model/secret/private payload enters source diff. Tests use synthetic/public text. No model/audio persistence was introduced by the refactor. Candidate audit/network/filesystem acceptance remains unproved for all required arms due early failure. Firewall protection remains active until director-owned cleanup; existing user installation/data retained.

Preparation history is not retroactively compliant: one CO02 attempt ran the nested Piper core build before four fresh current-core backups existed, then was interrupted during Windows compilation before freeze. The declared timing/ownership violation remains in the original receipt. Independent recovery review confirms unchanged2024 core records/archive/two tracked outputs and original9 backups; director authorized a new bounded retry. Nine fresh captures precede subsequent retries. A whole-resource check caught four additional retired staged optional-v2 copies before freeze; a written narrow addendum authorized backed-up cleanup and a new nine-capture preparation. Final package:windows exit0 and exact2031 resource/NSIS equality are independently verified. Original failed attempts, old desktop01 and artifacts remain preserved. Unsigned-local, antivirus-not-run and installation-lifecycle-not-run limitations remain accurate.

Desktop acceptance command outcome: exit0.

| Desktop profile/language | Quick audible ms | Playable lead ms | Prepared RTF | Cancel ms | Audio files | External requests |
|---|---:|---:|---:|---:|---:|---:|
| piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1/es | 5203 | 16763 | 0.11 | 728 | 0 | 0 |
| piper-1-4-2-onnx-cpu-en-us-joe-medium-v1/en | 5124 | 18481 | 0.11 | 935 | 0 | 0 |
| chatterbox-multilingual-v3-cuda-bf16-default-v4/es | 47952 | 21880 | 1.09 | 296 | 0 | 0 |
| chatterbox-multilingual-v3-cuda-bf16-default-v4/en | 85033 | 18360 | 1.06 | 298 | 0 | 0 |

These are the actual measured bounded fixture outcomes, not a universal latency/performance claim. Chatterbox desktop tests the admitted installed v3; it cannot replace the missing fresh-v4 candidate lifecycle evidence.

Fresh desktop receipt: {"status": "passed", "desktop": {"binary": {"sizeBytes": 11798016, "sha256": "8bce632b3fc9e42904ee90396b9f404575560588e1b3d69d3701e1111ffc35a8"}, "piper": {"root": "C:\\Users\\mmjos\\Desktop\\workbeanch\\voxleaf\\tmp\\tts-adapter-layout-desktop-02\\resources\\tts\\voxleaf-piper-core-v1", "canonicalRoot": "C:\\Users\\mmjos\\Desktop\\workbeanch\\voxleaf\\tmp\\tts-adapter-layout-desktop-02\\resources\\tts\\voxleaf-piper-core-v1", "fileCount": 2023, "bytes": 304582066, "manifestSha256": "3b03502031c188b5aef5c983859a93f506509648a2ddb35dcfec402877398062"}, "arms": [{"profileId": "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1", "language": "es", "python": "C:\\Users\\mmjos\\Desktop\\workbeanch\\voxleaf\\tmp\\tts-adapter-layout-desktop-02\\resources\\tts\\voxleaf-piper-core-v1\\runtime\\python.exe", "observedInterpreters": ["C:\\Users\\mmjos\\Desktop\\workbeanch\\voxleaf\\tmp\\tts-adapter-layout-desktop-02\\resources\\tts\\voxleaf-piper-core-v1\\runtime\\python.exe"], "observedChildren": 6, "status": "passed"}, {"profileId": "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1", "language": "en", "python": "C:\\Users\\mmjos\\Desktop\\workbeanch\\voxleaf\\tmp\\tts-adapter-layout-desktop-02\\resources\\tts\\voxleaf-piper-core-v1\\runtime\\python.exe", "observedInterpreters": ["C:\\Users\\mmjos\\Desktop\\workbeanch\\voxleaf\\tmp\\tts-adapter-layout-desktop-02\\resources\\tts\\voxleaf-piper-core-v1\\runtime\\python.exe"], "observedChildren": 6, "status": "passed"}, {"profileId": "chatterbox-multilingual-v3-cuda-bf16-default-v4", "language": "es", "python": "C:\\Users\\mmjos\\AppData\\Local\\Packages\\OpenAI.Codex_2p2nqsd0c76g0\\LocalCache\\Local\\com.voxleaf.desktop\\tts\\cb\\3\\runtime\\python.exe", "observedInterpreters": ["C:\\Users\\mmjos\\AppData\\Local\\Packages\\OpenAI.Codex_2p2nqsd0c76g0\\LocalCache\\Local\\com.voxleaf.desktop\\tts\\cb\\3\\runtime\\python.exe"], "observedChildren": 6, "status": "passed"}, {"profileId": "chatterbox-multilingual-v3-cuda-bf16-default-v4", "language": "en", "python": "C:\\Users\\mmjos\\AppData\\Local\\Packages\\OpenAI.Codex_2p2nqsd0c76g0\\LocalCache\\Local\\com.voxleaf.desktop\\tts\\cb\\3\\runtime\\python.exe", "observedInterpreters": ["C:\\Users\\mmjos\\AppData\\Local\\Packages\\OpenAI.Codex_2p2nqsd0c76g0\\LocalCache\\Local\\com.voxleaf.desktop\\tts\\cb\\3\\runtime\\python.exe"], "observedChildren": 6, "status": "passed"}], "audioFilesystem": {"before": {"count": 4, "identity": "77905aef9f4451950aae4a5b42c3055b17642e24e6d595654bc45f7686d9d843"}, "after": {"count": 4, "identity": "77905aef9f4451950aae4a5b42c3055b17642e24e6d595654bc45f7686d9d843"}}}}

Action required: STOP; redesign/re-audit the bounded candidate audit boundary before any further source work. Both authorized correction loops are exhausted. The smallest established target is bootstrap's subprocess error classification/compatibility and audit acceptance accounting for the unchanged NumPy local capability probe, with a regression that exercises actual copied-provider imports while preserving unconditional subprocess denial and fail-closed external-network, filesystem and artifact ownership checks. Do not allow subprocesses or suppress lifecycle failures. Any revised patch/order requires a new immutable report and all22 gates again; this FAIL authorizes no staging/commit/publication. Director may now remove only six task-owned firewall rules after reviewing the final runtime-cleanup evidence. Existing eight rules must remain.

Evidence SHA256:

- `after.json`: `0a19e17ef05aad51a115d7786cadb969ed5c5f2ee663a156cbbaff10ee686cdb`
- `artifacts-after.json`: `3d36427b82032aa451063ba445cb55eae42e5f438f4a649ea611e4559f9c4ce9`
- `artifacts-before.json`: `3d36427b82032aa451063ba445cb55eae42e5f438f4a649ea611e4559f9c4ce9`
- `before.json`: `2cc63157498b1fc3901a5722875fc36291c2307cb2523ef166fd4ec2680388f2`
- `capture.py`: `6c05c199a9eced7b66f580b884d3c7896542881e29203aad1b82b21114a82c24`
- `command-01.log`: `0c8b08d94c9d77dfeaea0fe4f7912e070dfb9bda91c99dce655f23ced1449c9a`
- `command-02.log`: `f96c78e2151a13def2352fb3664bcc427f97ba61d14becb9757835eb81de7ba0`
- `command-03.log`: `47a3bbf5712772a7454e41c1c3a0451cdfbf1fc0b7ef0baec432bc7513e4c39e`
- `command-04.log`: `c37666d5ff6e8c8f880c1aaf5fbd018de23c7da932d3229318dd110dda9b2791`
- `command-05.log`: `429cbb6ddb7460d74f6159d59974eb9d23e8b9a9ff8558fae8b835931a479618`
- `command-06.log`: `8a4ccc29a2679e8bcf3845f0e20407a22b29f8326422f59181ff10e0eba9b77f`
- `command-07.log`: `6af7ded49a54a7a053d4802e23972a8400a4eba581f9acda4cd8c69734a59ed7`
- `command-08.log`: `ca5cd8cc34acb7ef2252fb133062127679db9ba6040a57784049c79cc6116059`
- `command-09.log`: `7d1c586237305cd3a958ff9474e7612e218043f11ae1d1439bab3dd8091fc9a7`
- `command-10.log`: `fdcffbdea3eb02331fffd968989d276a026d98f959a907c0944ca32a21b3b1fa`
- `command-11.log`: `422f97fe263f6df353cbf061d79c6db2432e94866dfd4602b19d4332337eb984`
- `command-12.log`: `c758504314e6f704c914ad9fc391698a7d9b3e9b26d6850948d95f5f13a74220`
- `command-13.log`: `af47db12dbf0735157fc9a98d9c0652054fc90e53d538a1b2f11b02ddd5058cd`
- `command-14.json`: `4de06b96448210cacd61215a9bba70efb4178298681562e22f3b0e28207e0d30`
- `command-14.log`: `30ca8b3174e4c043b508e35caeca16b6823eded294fc3624c6bc4db4f3ba36eb`
- `command-15.json`: `da9dea5d7f526e72694339692e42e8046144822bbf434c07e87755a5ccec4513`
- `command-15.log`: `be108ef099afca04c4720baecb5fa7377e87cfeeaff5f076a777caf358023384`
- `command-16.log`: `41590abae8114535a8155ca19105e738c805a95bf9f0a10be94dfbcfcdb9f16a`
- `command-17.log`: `e1b1a600b125fd92955a15ad8f3b6a927306daca238ec4fa9069497c2e1db414`
- `command-18.log`: `791368ffff5f4cdebc2e92bb321b9ebe26591fca7f0d8b038859154c73c189ec`
- `command-19.log`: `ed3aef5471edf6764ac63b4d20c13fc9a4e28f168930d037648f33980bb7ba50`
- `command-20.log`: `54d65ee0091e36b1698554325866fc6dc3e4149e35d765fc07635a5919dea1d5`
- `command-21.log`: `12111cbed1acc983fbce0147eb1d984eda741fb096eae1718ef120ad6c943149`
- `command-22.log`: `387bfac209110dfc5248fa4296c6449be733c8a532a769f5230b90bb58bc7e43`
- `commands-01-13.json`: `2c3f05a81b6346776644ee4e51fcb4d5ce17f4d86373d559695d0e6dc087eba1`
- `commands-16-18.json`: `18b28ffe93f46f2c025b103b2be9e6f0b8f28893afc3fa1281cb5d15ad8582cf`
- `commands-19-22.json`: `8d39b55168af753a0b7f0dec3e83f4f32fe7ca9630cc9cc39a89bf11b5c1ec08`
- `desktop-arm-results.json`: `34e7ebdd21ee2c6dff19965371f62934da00eddba6bd635f28c84679b5036014`
- `desktop-receipt.json`: `b56f7936eee21669b5e12e6eb2dd85d21c2b26d29fca6e397785a1b60317e961`
- `driver-readback.json`: `8adda45ab3a68a8a84b2b7c108d7a8418ff93bbc27b69b2c753f6af2c7ba0ccb`
- `final-git-status.txt`: `1ec3c505696ae50b69f6d39c797480569faf9ff79a35228a8355457173d2604b`
- `final-host-review.json`: `53a8904cc50001f6199adec8b4845e789f954c3ea4df2c572504fd0344c82676`
- `final-host-review.ps1`: `4c74c98b2f51b2a627242466b424e2563f3eac438b5c0ba646008dea8eecd9dc`
- `firewall-after.json`: `406e0066a3a5bd6fa83b8f29aad7ca8b76a37af7f8abd9f828ba0f0d6e259394`
- `firewall-before.json`: `8616009b04b96a77fca1013a4d8c979c3a60e26edacb205a232ea048ac568822`
- `identity-after-comparison.json`: `ef9ad170f70f840f54f462249b1e933cc803fe4ff54b1ed93c0b64d58b04534c`
- `identity-before-comparison.json`: `efc3088cbf86b69127b41ddb62f7731f2b64dd520d922d01be14d8aca9d8d61a`
- `issue-report.py`: `2d2154ceda865fe6387ec1e09c184bbd3eeb8122f5d9ac28005a256f6d201558`
- `preflight-receipt.json`: `e18989e010cd5582a1b0d4fe28e41d51da15bdc662c6adb73436e984c2c3ef2f`
- `preparation-review.json`: `ca9d415eeda842622e7f54c72a8a42c2243076668dbd3b30716ec09d9290a145`
- `preparation-review.py`: `bd7cfe3b9cb7b63bb1acb1654ade08accc2fd4b95d83aef48299488537c92811`
- `provider-import-diagnostic.json`: `017c2f4e8eb405c3efb24f529252c3ef9992b5227008654c37e6a7fc9df49c6a`
- `provider-import-diagnostic.mjs`: `c519d354a39655a593f86eed24a73a1a1580b57cc58e0bc3b576bccc3e480413`
- `provider-import-diagnostic.py`: `a707536f28bef1b0d5ddac3aebfbc93dbbaf518ab7c4a8693e07516e0df8eb6e`
- `supplementary.json`: `e39c0a0803b7c300e00d4923e7e12d4ac2c91a6290a796f81adc1a17262b5062`
- `supplementary.log`: `a83e121496fc989a4d23ae22a9341f8866448cc3dc13aa09557d4ae9862fe224`
- `supplementary.py`: `74b9a3abbed96b1dddc064a75e05ea63e89595f0f9177a2aada42fd76cf1e845`
- `tree-closure-diagnosis.json`: `0479b95138b42c499fb6dbfbb45245bc5fca4b27126bc17b3a16d2e66a8a97b4`
- `tree-closure-diagnosis.py`: `a0f0536085c44fd3affe6817f04e9255cd5b788576904d599c22951f9d2af7b9`
