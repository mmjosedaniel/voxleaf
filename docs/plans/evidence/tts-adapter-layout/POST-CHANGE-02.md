# Validation Report

> **Sanitized publication copy.** Personal paths are redacted; report IDs,
> results and validation hashes retain their historical meaning.
> Original SHA-256: `84d9af040ea9d24d8b7727a75e103e7cd81a922fe464a6037e47d0d7b3296244`.
> See [publication and original retention](../historical-privacy-cleanup/README.md).

Report ID: TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-02
Target ID: TTS-ADAPTER-LAYOUT-01
Mode: POST-CHANGE
Verdict: FAIL
Environment: local PowerShell outside sandbox. All acceptance/supplementary execution used require_escalated. Process-local Corepack shim PATH C:/nvm4w/nodejs/node_modules/corepack/shims; pnpm11.15.1. Spawned Windows children used process-local PSModulePath=C:/Windows/System32/WindowsPowerShell/v1.0/Modules. No global tool/environment/source changes.
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: exact35 parent work-order paths below. Correction changes only six approved existing paths. Branch codex/tts-adapter-layout; empty index before/after.
Validated path identities: every exact porcelain status, worktree SHA256 and filter-aware expected index blob before commands is in before.json and the table below. after.json rechecks source35 and protected260; four old adapter paths are approved DELETED.
Identity recheck: PASS. HEAD/index, source35, protected260,14 previously frozen source/artifact identities and2037 resource records unchanged. All copied artifacts match original preparation receipt. Parent/correction orders, current packet/full35 manifest hashes unchanged; all13 firewall rules unchanged throughout validation. Extra legacy frozen files were present in both before manifests, not validation drift. See identity-recheck.json, before.json/after.json, artifacts-before.json/artifacts-after.json, authority-before.json/authority-after.json, firewall-before.json/firewall-after.json.

Authority: parent WO SHA256 bf7ce6019bfe47fe6ef41d195bb33cae1406b294487c185258b6199aec58b5fb; Correction01 SHA256717d1e31de0e82fb6c69a0158fc2afed219e164dab0741e7d0a6825eced0815b; current raw Change Packet SHA256c0e0a1d104619c2ddc6addbb9e359b45d59cd4759aba78545627bf9c63ba7b9d; full35 worker identities SHA256013eae39910f091387911eae989b375a983fc74081b10c1f060645b2ec0b178d. Earlier report01 FAIL and original baseline/host reports remain immutable.

| Validated path | SHA256 or deletion | Expected index blob | Porcelain |
| --- | --- | --- | --- |
| services/tts/src/voxleaf_tts/piper_adapter.py | DELETED | DELETED |  D services/tts/src/voxleaf_tts/piper_adapter.py |
| services/tts/src/voxleaf_tts/chatterbox_adapter.py | DELETED | DELETED |  D services/tts/src/voxleaf_tts/chatterbox_adapter.py |
| services/tts/src/voxleaf_tts/qwen_adapter.py | DELETED | DELETED |  D services/tts/src/voxleaf_tts/qwen_adapter.py |
| services/tts/src/voxleaf_tts/fake_engine.py | DELETED | DELETED |  D services/tts/src/voxleaf_tts/fake_engine.py |
| services/tts/src/voxleaf_tts/adapters/__init__.py | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 | e69de29bb2d1d6434b8b29ae775ad8c2e48c5391 | ?? services/tts/src/voxleaf_tts/adapters/__init__.py |
| services/tts/src/voxleaf_tts/adapters/piper.py | 844d55f64992b620a2f1f708b26a699e6935eff9f8e7c6e9524f98ce45ed209c | 1ba3ffa3352e0a9afde4a23841050e81335f97e1 | ?? services/tts/src/voxleaf_tts/adapters/piper.py |
| services/tts/src/voxleaf_tts/adapters/chatterbox.py | 6896d06cdabcef5f774f9a251f6d5eeb4b2474a8c27b626aac2da43c9555d669 | 159b2b8dff183285efa901c149dd33d9cc5a28b0 | ?? services/tts/src/voxleaf_tts/adapters/chatterbox.py |
| services/tts/src/voxleaf_tts/adapters/qwen.py | 2940be2d31beeeb78d2a718d767a86f48806bca39961795f5be82d47fc2c06d5 | 4f93451abbd7108ac5e225e48ba73ea87bf82785 | ?? services/tts/src/voxleaf_tts/adapters/qwen.py |
| services/tts/src/voxleaf_tts/adapters/fake.py | 1863c0e3e1617b71cd9ca9d647aed05e6384ec71f33ef6e47221983a6fbb8023 | 3c16e17b14792b9c823647541e072495601523bc | ?? services/tts/src/voxleaf_tts/adapters/fake.py |
| services/tts/src/voxleaf_tts/service.py | 528992e393e225475280007f622bd764dd0dc7d89329ddc1ba897bb7c7c06bd0 | 77ed1f9bb7d084b82c7277e4743600233022af9d |  M services/tts/src/voxleaf_tts/service.py |
| services/tts/src/voxleaf_tts/piper_service.py | f5816615cc220661f217f1f5070ea6ff6d6d02d1661f88594de2b60c79949980 | 3e0a12c41f23c11aed4ba5db7eb67277f68f9ebf |  M services/tts/src/voxleaf_tts/piper_service.py |
| services/tts/src/voxleaf_tts/chatterbox_service.py | 81ec218ca9e786af43acae14310c8cf00ae33cd3e776e41958cfd456b6221777 | 02eaa22a6af1d8e043f8bc57794d4ab0d5fe9123 |  M services/tts/src/voxleaf_tts/chatterbox_service.py |
| services/tts/src/voxleaf_tts/qwen_service.py | 64b1ed77e177c9267192154e8f47caae71f67a38cd3d05c854b5c9270e246531 | 4633a66738c1ea4d8a884fdfc012c4737436e542 |  M services/tts/src/voxleaf_tts/qwen_service.py |
| services/tts/src/voxleaf_tts/release_core.py | 765fc7e288b103e006ee660085d86846f258fb77b82b87873b2e900feb688980 | d8c55e2fa7f187a8536e9c1aa9c5bab10e582832 |  M services/tts/src/voxleaf_tts/release_core.py |
| services/tts/src/voxleaf_tts/release_chatterbox.py | 975f459e5295c16483aa9ede24d0fa684a202b3d2ee6e850e25c39f3781d9fea | 8c18de68bdd771ad63ecee079440bf4d789d24e9 |  M services/tts/src/voxleaf_tts/release_chatterbox.py |
| services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py | 1b8b2b885762d0f6159662f96ec955b3f40a0b8c0c81bd027ef0676b38fe9ec0 | 09784d179ea7d7e30713622c5b54f7f063439e3a |  M services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py |
| services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py | 10486a491fab9fa13f6776c8b2e9a8e5412aab69b76daad28821d0a353c43e55 | 4e50216b578a98b5d71ac39ebd13add8ef08de99 |  M services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py |
| services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py | 294d6a53af9af5da947f689c4eaae4e2d41caa036a20d6ac5a15bddab35cf4a6 | f8ddbf3c2a4c45ae3da785b8eafb8bfd77300fbe | ?? services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py |
| services/tts/tests/test_piper_adapter.py | 128fdd5ba6f93b25b971344c6ba68574d4689ea1c72758bbfe64ff5e366cceef | f1421bde1dbe89be21564c8887d807ebe140bd05 |  M services/tts/tests/test_piper_adapter.py |
| services/tts/tests/test_chatterbox_adapter.py | b2524acb6634c291a76b86ef1fe9755eedb723f543ffccb065ca154e5fb8b029 | 5717875d6d8448609518d294004494e5cb79cce6 |  M services/tts/tests/test_chatterbox_adapter.py |
| services/tts/tests/test_qwen_adapter.py | 3fa73106f377915e13baa3cfa3afe9d891c32db89a9408bf1c1882a3f246834e | debee220256d45897a3f52d055859952e23ce5d4 |  M services/tts/tests/test_qwen_adapter.py |
| services/tts/tests/test_service.py | 63a818b727dafe05dc14d1e3b7a2f2670f4279f506bf5510c7f1a517f51bc993 | f7a00fbb36ba9910dc15a4a7f6557e5efb4120e0 |  M services/tts/tests/test_service.py |
| services/tts/tests/test_release_core.py | 0dcec8a5eb182155e947ce0e4a021fda620d53b1abaad28cccba1b6174d839f0 | 898e5b8bcc6dbf49e994481e94ffadd62604e421 |  M services/tts/tests/test_release_core.py |
| services/tts/tests/test_release_chatterbox.py | 207ac9831962ade69f0385b6d3bca2a56d7cebc22c440f71a38a0c7a8654bc81 | d5803ce1408f6e721dd428834c686a8ce9fca6ea |  M services/tts/tests/test_release_chatterbox.py |
| services/tts/tests/test_chatterbox_sources.py | dd706bef238d6bea965d9c1f0d2de7125822613b59ec820a6b36bb07b1f601d6 | 0f98c442a0309896281c711e55c145857529850f | ?? services/tts/tests/test_chatterbox_sources.py |
| services/tts/tests/test_adapter_layout.py | ff870f22736f5b625a3d503b3f957e8e594fb602505b9fcb7ac7ebf49a04d3c2 | 3c8d70f3c5c59c544453827622746850114b6935 | ?? services/tts/tests/test_adapter_layout.py |
| services/tts/release/core/runtime-manifest-v1.json | 3b03502031c188b5aef5c983859a93f506509648a2ddb35dcfec402877398062 | 4d348f5a8aa01caea12afcbb1bbe2385ae534d1e |  M services/tts/release/core/runtime-manifest-v1.json |
| services/tts/release/core/core-package-evidence-v1.json | e46ed9afe2ed06a6c2d847473a6cceb6cc631378289055a4a691357db11a6a8a | 58bab708db7ab389a87fff51534f6fd2abfa08a1 |  M services/tts/release/core/core-package-evidence-v1.json |
| services/tts/release/optional/chatterbox/source-manifest-v4.json | 76741c983f4e7263ffe03ac728eb80cd4cc0bdc13eda4f4dab55aa4996cbb284 | c389c99b2af67e5a2b9f6835887286f1f9b4e1b7 | ?? services/tts/release/optional/chatterbox/source-manifest-v4.json |
| apps/desktop/src-tauri/release/windows-package-evidence-v3.json | a493c565f82ad9c970c9f8d34d580d35f3702bb9b822f66893c4291bed9184e4 | 58d5a48e6111546fbe660fc91c03b685c8e8b3f4 |  M apps/desktop/src-tauri/release/windows-package-evidence-v3.json |
| apps/desktop/scripts/tts-adapter-layout-host.mjs | eb4191d092e4682277bf2712eb4de47d4aaa9b2263abf2e487d72d1f37840b74 | 962fbb3365818666ed03ab475c477dd76207f930 | ?? apps/desktop/scripts/tts-adapter-layout-host.mjs |
| apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs | 571ad8a8d4ae914d615b35a7d429e8e1300813a61b97abeba4f684df41206ba9 | 1de0501977a647f572e0cbb3c538a11319a47184 | ?? apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs |
| apps/desktop/package.json | 52f30bf20748028ff3e9dd97a197c4193cbe6572aea3aea3d4a4bd86a123c3d7 | e0aad3012a5902bb274e0230e47998c43af8d541 |  M apps/desktop/package.json |
| package.json | d56217dc1693231f9bfbd422d30afe228d28564068d32fafe747e06d4fd792eb | fd9e98b5009c9b58386cf886e752c1ab0df775f8 |  M package.json |
| docs/development/tts-service-organization.md | 5d3f109ed597817db99a6e3b044dc01dd1281a5586da669a4e8b957369b8ec73 | fa6b9a7d707eaa959b6b3581f19526aab406e790 |  M docs/development/tts-service-organization.md |

Commands and outcomes:

1. `pnpm.cmd format:check:python` -> exit0. 174 files formatted. Raw command-01.log; exact UTC timing in corresponding command JSON.
2. `pnpm.cmd lint:python` -> exit0. Python lint passes; prior Ruff failure resolved. Raw command-02.log; exact UTC timing in corresponding command JSON.
3. `pnpm.cmd typecheck:python` -> exit0. No issues in171 source files; prior five mypy failures resolved. Raw command-03.log; exact UTC timing in corresponding command JSON.
4. `pnpm.cmd test:python` -> exit0. 485 passed; one same pre-existing pytest cache permission warning. Raw command-04.log; exact UTC timing in corresponding command JSON.
5. `pnpm.cmd build:python` -> exit0. Fresh wheel/sdist built; exact corrected maintainer copier included. Raw command-05.log; exact UTC timing in corresponding command JSON.
6. `pnpm.cmd package:piper-core:check` -> exit0. Current core tree/archive pass. Raw command-06.log; exact UTC timing in corresponding command JSON.
7. `pnpm.cmd package:chatterbox-optional:check-source` -> exit0. Historical v2 source recipe current. Raw command-07.log; exact UTC timing in corresponding command JSON.
8. `pnpm.cmd package:chatterbox-optional:check-acquisition` -> exit0. Historical v2 acquisition authority current. Raw command-08.log; exact UTC timing in corresponding command JSON.
9. `pnpm.cmd package:chatterbox-optional:v3:check-source` -> exit0. Historical v3 source recipe current. Raw command-09.log; exact UTC timing in corresponding command JSON.
10. `pnpm.cmd package:chatterbox-optional:v3:check-acquisition` -> exit0. Historical v3 acquisition authority current. Raw command-10.log; exact UTC timing in corresponding command JSON.
11. `pnpm.cmd package:chatterbox-optional:v4:check-source` -> exit0. Local v4 source recipe current. Raw command-11.log; exact UTC timing in corresponding command JSON.
12. `pnpm.cmd package:chatterbox-optional:v4:check-local` -> exit0. Fresh v4 real tree/source/lock/notices/archive/member/ordered-part checks pass, unpublished/unadmitted. Raw command-12.log; exact UTC timing in corresponding command JSON.
13. `pnpm.cmd test:tts:adapter-layout:preflight` -> exit0. Full host preflight PASS: actual installed v3+six models, current core/v4 tree and source closure, logical/canonical interpreter identities/firewall, isolated imports. Raw command-13.log; exact UTC timing in corresponding command JSON.
14. `pnpm.cmd test:tts:adapter-layout:candidate` -> exit1. FAIL completed-identity after first Piper generation. Actual sorted protocol wire keys trigger order-sensitive JSON string comparison. Remaining candidate language/provider/restart/cancellation branches not reached. Raw command-14.log; exact UTC timing in corresponding command JSON.
15. `pnpm.cmd test:tts:adapter-layout:desktop --executable=<REPO_ROOT>\tmp\tts-adapter-layout-desktop-01\voxleaf-desktop.exe` -> exit1. FAIL tree-closure: frozen desktop resource tree contains two legacy adapter files absent from manifest. No desktop inference/portfolio arm ran. Raw command-15.log; exact UTC timing in corresponding command JSON.
16. `pnpm.cmd check:portable` -> exit1. FAIL ESLint no-undef for setTimeout/clearTimeout at runner666,672,676; subsequent aggregate stages did not execute. Raw command-16.log; exact UTC timing in corresponding command JSON.
17. `pnpm.cmd check` -> exit1. FAIL same three ESLint diagnostics; format including Rust passed, later aggregate lint/type/test/build stages did not execute. Raw command-17.log; exact UTC timing in corresponding command JSON.
18. `pnpm.cmd test:native-startup` -> exit1. Initial FAIL webdriver-session-not-created after successful build. Read-only underlying diagnostic confirms driver150 versus browser155; same command with signed matching override later PASS. Raw command-18.log; exact UTC timing in corresponding command JSON.
19. `pnpm.cmd package:windows:check` -> exit0. Windows current release configuration/core requirements check passes; this does not prove frozen copied-resource closure. Raw command-19.log; exact UTC timing in corresponding command JSON.
20. `pnpm.cmd inventory:release:check` -> exit0. Release component inventory current. Raw command-20.log; exact UTC timing in corresponding command JSON.
21. `pnpm.cmd audit:release` -> exit0. Release audit PASS. Rust informational7/windows-reachable5; optional Python audit retains blind spots chatterbox-tts,resemble-perth,torch,torchaudio; not represented as zero blind spots. Raw command-21.log; exact UTC timing in corresponding command JSON.
22. `pnpm.cmd test:chatterbox:dependency-security` -> exit1. Initial FAIL global PATH Python lacks tokenizers. Same command on exact documented fresh embedded v4 interpreter later PASS7 synthetic security cases/0 socket attempts. Raw command-22.log; exact UTC timing in corresponding command JSON.

All22 configured gates were attempted. Failed aggregates were not bypassed or described as fully passed. Same-command environmental retries and focused additional checks:

- `pnpm.cmd test:native-startup` -> exit0. Repository-prescribed VOXLEAF_EDGE_DRIVER_PATH override points to isolated signed155.0.4283.45 driver. Full native startup/supervised fake lifecycle/reader/synchronization/persistence/privacy assertions PASS. Raw command-18-retry.log, command-18-retry.json.
- `pnpm.cmd test:chatterbox:dependency-security` -> exit0. Prepared v4 build-environment Python selected by process-local PATH:7/0 PASS. Supplemental only; exact embedded runtime is the authoritative retry below. Raw command-22-retry.log, command-22-retry.json.
- `pnpm.cmd test:chatterbox:dependency-security` -> exit0. Documented exact fresh v4 runtime/python.exe selected by process-local PATH; HF_HUB_OFFLINE=1, TRANSFORMERS_OFFLINE=1, PYTHONDONTWRITEBYTECODE=1, no PYTHONPATH, ignored caches:7 security cases pass,0 socket attempts. Runtime flags independently confirm dont_write_bytecode=1. Raw command-22-runtime.log, command-22-runtime.json.
- `pnpm.cmd --filter @voxleaf/desktop test` -> exit0. Focused desktop suite:588 Vitest tests across54 files and46 Node tests pass; includes new root/descendant junction rejection and verified virtualization pair tests. Raw command-23.log, command-23.json.
- `pnpm.cmd typecheck:typescript` -> exit0. Configured cross-package TypeScript typecheck PASS, including built packages/shared, packages/epub and desktop. Raw command-24.log, command-24.json.

Supplementary evidence:

- `services/tts/.venv/Scripts/python.exe -B tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-02/supplementary.py` -> exit0. Actual historical7/9 Git blobs validated; corrected copied-module error produces same content-free ReleaseChatterboxError as old helper. Fresh wheel SHA2563934251aff7e4bc8832dee49082c358a2bc85d9eb0c525ec4783147dcf915e7d: extracted exact corrected release_chatterbox bytes, separate python -I -B import process passes all four stable service entrypoints from isolated wheel only, no optional provider eager imports or old forwarding paths. Independent accounting confirms1614 mechanically relocated,2797 nongenerated+151 generated=2948 additional changed lines.
- `services/tts/.venv/Scripts/python.exe -B tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-02/precheck.py` -> exit0. Full35 supplied identities match, exact correction six paths, existing8+task4 preserved plus canonical task4 rule. Three manifests list10 service modules, all matching current source and payload bytes and excluding correction files. This manifest-record comparison did not establish complete frozen on-disk closure: later gate correctly finds two unlisted frozen files.
- `services/tts/.venv/Scripts/python.exe -B tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-02/completed-proof.py` followed by `node tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-02/completed-proof.mjs` -> exit0, deterministic failure proof. Existing valid-completed fixture through actual encode_control_message sorts keys [generationId,requestId,segmentId,sessionId]; expected object construction is [requestId,sessionId,generationId,segmentId]. All four values equal, runner string comparison false. No modified harness or inference bypass was executed.
- `node tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-02/native-session-diagnostic.mjs` -> exit0. Frozen executable session response HTTP500/session not created; driver supported150/current browser155.0.4283.45. No session created; owned driver-tree cleanup exit0. Only content-free code/version fields retained.
- `services/tts/.venv/Scripts/python.exe -B tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-02/tree-closure-diagnosis.py` -> exit0. Installed-v3/core-dist/v4 file sets have no missing/extra records. Frozen core has exactly two extras, no missing files. No bytecode/cache/marker extras found.
- `services/tts/.venv/Scripts/python.exe -B tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-02/recheck.py` -> exit0, complete unchanged identities/artifacts.
- Read-only firewall inspection ->13 exact benchmark rules: original8 and task5 retained. Task -0/-1/-2/-3/-4 each Enabled=True/Outbound/Block/Any; canonical installed interpreter rule present. Firewall service Running, all profiles enabled. No validator mutation.
- Independently verified driver receipt SHA2564919b22c6663342845771316fa0d856133eebc49aed6d8a38e4d7c10a2f4b2fc, driver SHA256dc99c208c10a5364e61c4e5b1341be492f3224de753adb23e973be97875b1892, version155.0.4283.45, Authenticode Valid/Microsoft Corporation. Original PATHdriver hash unchanged ef6911bf210fc89a9c595998dd8bc2b89ea3104d8bbfd0361319d0c06d2d847c. Override process-local only.
- `git diff --check` -> exit0; final status recorded; no Git mutation. Final runtime process readback finds no relevant surviving Python service.

Diff scope: PASS. Source unit exactly35, six correction paths only; director coordination documents separate and preserved. Four moves are mechanically identical to HEAD except engine/protocol relative imports. Additional2948/3000, generated151/300;52-line total headroom remains. No model/dependency/lock/public-schema/native-admission changes. No engine algorithm, locator/narration/synchronization/persistence changes.

Invariant review: FAIL because candidate completion comparison rejects valid unchanged protocol output and frozen desktop payload violates exact closure. Corrected runtime-copy error identity now preserved, lazy service imports verified, protocol/engine algorithms unchanged.

- Historical v2/v3 exact raw-source binding and no-fallback/pre-mutation resolution reviewed; real7/9 module hashes and all historical source/acquisition checks pass. Protected260 authority paths unchanged.
- Local v4 exact10 listed service modules, source/lock/models/require-hashes/safe loader/notices and measured archive/part identity checks pass; unpublished/unadmitted. No URLs or inherited execution claims introduced.
- Current copied Piper and isolated wheel import closure pass. Frozen desktop core FAILS complete tree closure despite its valid10 manifest-listed modules; no proof of artifact acceptance can be borrowed from current core/dist.
- Corrected logical/canonical Windows mapping keeps exact environment-derived pair, symbolic-root rejection and exact descendant canonical paths. Real preflight PASS: installed-v3 runtime+models13089 files/8233717375bytes; core2023files/304582066bytes; v4 runtime13084files/5024765458bytes. Installed logical/canonical interpreter hashes match4d6f5f81a4bca11191c4c7c6b43632694d0a4ce74e068619d8fdc161d469859a.
- Candidate first Piper ES generation reaches valid metadata/finite bounded PCM, then fails completed-identity. No complete candidate arm receipt, cancellation/restart certification, Piper EN, or Chatterbox v4 ES/EN execution can be claimed. Remaining branches were statically reviewed against actual stopping/stopped states, child exit/audit records, cancellation/termination and restart; no additional established defect found. Static review does not replace fresh execution.
- Desktop runner fails frozen-tree verification before portfolio/native inference arms; all four real desktop ES/EN arms and their latency/network/filesystem/cancellation observations remain unproved. Generic native startup with correct driver passes its independent model-free lifecycle/reader/synchronization/privacy matrix.

Test-integrity review: PASS. Existing assertions and exact historical compressed fixture bytes retained; corrected type narrowing is explicit, no suppressions. New directory/write OSError tests require fixed message and suppressed cause. New link tests reject arbitrary/symbolic root mappings and descendant junctions. Sorted-wire completion coverage is missing and must be added; current unit passes do not imply candidate execution passes.

Privacy/artifact review: FAIL for frozen package closure. No books/audio/weights/secrets/private payload files enter source diff. Native/model work uses synthetic fixtures; no audio artifacts retained by validator. No installed user data removal/modification, acquisition journey, publication or firewall change. Source35/protected260 and all frozen2037 records remain identical. Initial source/history/artifact hashes are evidence of identity, not evidence of correct complete runtime contents. Original preparation attempt02 failure and attempt03 success remain unchanged, with unsigned-local/antivirus-not-run/lifecycle-not-run boundaries preserved.

Frozen-resource finding (pre-existing preparation contamination, not validation drift):

- Extra `tts/voxleaf-piper-core-v1/runtime/Lib/site-packages/voxleaf_tts/fake_engine.py`:6915 bytes, SHA2567a79f01a35a74ccdc0a08217e612f7e12c98cfabad58dde5e94ea84486791760.
- Extra `tts/voxleaf-piper-core-v1/runtime/Lib/site-packages/voxleaf_tts/piper_adapter.py`:18017 bytes, SHA25678c335d25979165213a86c7fb0f4f95d2f2620b8ff7cc56279f1f2b823174020.
- Both exact records appear in report01 and report02 artifacts-before.json; current hashes unchanged. Creation2026-10-11T04:10:43Z and older last-write2026-10-09T19:47:36Z precede validation. Original preparation receipt copies this resources tree from apps/desktop/src-tauri/target/release/resources. This supports stale preparation/staging content; the exact producing copy/build operation was not independently established. Do not attribute it to candidate/native/security probe bytecode writes.

Action required: consolidated final bounded correction, then a NEW immutable report and full required acceptance execution. Validator made no repairs.

1. In apps/desktop/scripts/tts-adapter-layout-host.mjs import setTimeout/clearTimeout explicitly from node:timers to satisfy configured no-undef rule; preserve existing deadlines/cleanup.
2. At completeGeneration (line898; comparison906), replace JSON serialization ordering comparison with order-independent exact four-field/key-set work identity validation. Do not relax request/session/generation/segment equality or permit extra/missing fields. Add a focused regression using actual sorted wire order and mismatched/extra/missing identity rejection. No production protocol changes.
3. Worker/director-owned preparation must produce a clean, complete packaged desktop resource closure containing only manifest-defined files, then freeze it under a new explicit artifact identity/receipt with original recovery preserved. The two obsolete files may not be exempted or manually hidden by validator. Preserve this failed frozen artifact and all logs. Confirm exact on-disk resource sets, not only manifest-listed records; regenerate authorized current evidence/installer if required by the selected preparation route. Any new frozen interpreter path needs its exact director-owned firewall rule before inference. No unlisted builder/source changes without revised scope.
4. Retain documented environment choices: correct signed test-driver override and exact embedded runtime PATH for dependency-security; initial failed outcomes remain immutable. Source/package corrections require new identity capture and all22 gates again. Combined ceiling remains3000; current2948 leaves52 lines, so stop/re-audit before exceeding scope.

This FAIL contains actual executed regressions/preparation defects with passing identity recheck. Environmental driver/Python failures were characterized and resolved through unchanged-command process-local selection, not source repair. Fresh real-model and desktop acceptance remain incomplete; generic native/unit PASSs cannot replace them.

Evidence SHA256:

- before.json: a25e57d69dce79ac9e735564cae64208651c4536f2bbbd6c0a08c51ee529c842
- after.json: 4643751486c889c66d97c74b7f0ddbf1670c46c9b5ef19b4c844c68c5a6ca1aa
- artifacts-before.json: fd9e6e97064aee9d6f63a28e0cfa27d4e72cc7909ffdb61a689362e961879e41
- artifacts-after.json: fd9e6e97064aee9d6f63a28e0cfa27d4e72cc7909ffdb61a689362e961879e41
- identity-recheck.json: 30d3ec31df8da01bd1b1dde21dd7fd01e128b2470596c9ffdbab1b723af1db73
- authority-before.json: bfcea9ceb29ac5143bb504e9b1da6fe6a4ad89dc90f5162e2dec57a9260a27a7
- authority-after.json: bfcea9ceb29ac5143bb504e9b1da6fe6a4ad89dc90f5162e2dec57a9260a27a7
- firewall-before.json: 5b85da91dddb39c180fe024afb8269b96202db0e126b69b350b7421477432544
- firewall-after.json: 5b85da91dddb39c180fe024afb8269b96202db0e126b69b350b7421477432544
- precheck.json: 0b237dcf22fd2f66bab8a4d650c14ba5f55d1bb6f879c80a890d4cf7a2ca30d4
- supplementary.py: 29f1083cc328f4268b4173450d876c5044067114f77668d6775e6abd060095ef
- supplementary.json: 117248badb6c8d3d5eab289af74e164fba85bffa295b4daad23bdd5eac6a4583
- completed-proof.json: 464e28a7adbf3f6d9c682e97a30c03f56507c528c17fc3fafbf10c8640b7ffc3
- native-session-diagnostic.json: 223b3e03ce7726b3bb458ff2b7f015e548f8dfd1b52fb9019cda5a7efee91a44
- driver-readback.json: e245bd7ba258c96436999a98950d127012bf157c3feb108a3811f06aade57f39
- tree-closure-diagnosis.json: 36f86d083a738d4212cbe966e1bd21701fecc037bcd7a01f59ee5062379cac5a
- preflight-receipt.json: 77bed221a59710872c365f6403481fffbcb1af574fe8bb3a0b42935889b0cb9b
- commands-01-13.json: 5901f59f1ad4bcb773c1ec7ada5ddead047a871a11fdfeb83e7d64eb55df22f5
- command-14.json: cc867d1621eab323003218e5d37f8786eb51c2a7f1c367f545a6dbd65ebf64a4
- command-15.json: 8fc1fba358d12fd9835df5f8495dd3acbae46aeadf40cf618ad543db161719ff
- commands-16-18.json: eb5bf31707e615128e9f8c023e71c1f04ffb5235d94cc511089a301cc839b8e9
- commands-19-22.json: 52bd0f1d497adaf60e64ffb58ee82dbbcd22bdd2228df021113da628a9215c01
- command-18-retry.json: 57a183105fa27079775d0ab6b0b58cb3523c1601eefeb9fbc64f59d10c122ab8
- command-22-runtime.json: 22cb365c86ead184e605a0e2e71ba38f0d5a0c69b613eda497d975c6d4506d97
