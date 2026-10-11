# TTS-ADAPTER-LAYOUT-01 Correction Change Packet 02

Status: final correction source and clean writing preparation frozen; sole writer idle; independent acceptance pending. Correction loop 2 of 2. No acceptance tests, inference, installation, publication or Git mutations by the writer.

HEAD `7bbad9d5bef3a83c913ea5d7b948213a05bb0362`; branch `codex/tts-adapter-layout`.
Parent WO-01 SHA256 `bf7ce6019bfe47fe6ef41d195bb33cae1406b294487c185258b6199aec58b5fb`.
CO-02 SHA256 `896061391df5c333ac329f2669384039b9a3fef6be34485eaf5eb7f7f9b76685`.
Authority FAIL report `TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-02`, SHA256 `4b15721b6beb0c76d89d8a207a962b358e482dc3ce428b7ad2ddf80d43a120e7`. Both prior FAIL reports, their partial PASS results and all prior packets/receipts remain immutable; they do not accept this patch.

Combined ceiling: **2983/3000** additional rename-aware changed lines; **151/300** generated lines. Four moves preserve1614 relocated lines and count16 import added/deleted lines. The full35 identity manifest is below; deleted paths bind HEAD blobs, all other paths exact physical bytes. All32 paths outside this correction remain identical to Correction01.

Changes within this final order:

- `apps/desktop/scripts/tts-adapter-layout-host.mjs`: explicitly imports `clearTimeout` and `setTimeout` from `node:timers`; existing deadlines and cleanup calls are unchanged. New bounded `assertWorkIdentity` checks the exact four own keys requestId/sessionId/generationId/segmentId and strict value equality, independent of key order. `completeGeneration` keeps its completed-kind check, invokes that equality boundary, retains exact `completed-identity` failure and ready-state deadline.
- `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`: imports the helper; focused regression builds the sorted JSON wire-key order, checks the exact order and acceptance, then rejects each missing/mismatched field and an extra field. All existing assertions are retained. No protocol, provider algorithm or lifecycle-source changes.
- `apps/desktop/src-tauri/release/windows-package-evidence-v3.json`: updated only by the registered `pnpm.cmd package:windows` generator; exact current binary/installer identities remain unsigned-local, antivirus-not-run and lifecycle-not-run. No manual generated-file edit or new admission/publication claim.

Preparation, recovery and accurately recorded deviation:

1. Initial recovery03 capture failed with Windows long-path destination errors before any cleanup or writer. Two file captures and its partial resources remain preserved under `tmp/tts-adapter-layout-recovery-03`; original `preparation-receipt.json`, `capture-failure-01.json` and associated diagnostic outputs remain intact.
2. Short recovery04 then captured/hash-verified five current Windows outputs at `tmp/tal-recovery-04`: generated evidence, executable, whole resources, installer and checksum. `capture-receipt-02.json` proves full actual core/v4 file sets and the staged core's exact two extras. Native PowerShell7 rechecked absolute workspace containment, parent reparse rejection and exact whole-subtree backup before removing only `apps/desktop/src-tauri/target/release/resources/tts/voxleaf-piper-core-v1`. Old desktop-01 was untouched.
3. The first prescribed package command also invokes nested `package:piper-core`. This dependency was discovered after it had completed and Windows Rust compilation had begun. The current fresh-core payload/archive and two tracked outputs had not been separately copied before that nested writer. This is a preparation timing/ownership violation; no racing capture is described as prior recovery. The owned pipeline was interrupted with Ctrl+C, exit1; no builder/core child remained and no desktop02 freeze had occurred. `interrupted-attempt-receipt.json` and its immutable log preserve the stopped attempt.
4. Read-only `interrupted-attempt-identities.json` establishes the nested core step succeeded and all2024 complete current core files exactly equal the pre-writer full closure records. Archive and both tracked outputs also retain the exact report02 identities. All nine original captures in `tmp/tts-adapter-layout-recovery-02` were rehashed and remain exact. Original diagnostic logs are preserved; extended-path readback resolved the long-path probe limitation. No original core drift or partial failure was found, and no arbitrary restoration occurred.
5. The director authorized a preparation retry after that proof. A new complete nine-output capture at **`tmp/tal-recovery-05`** was verified **after interruption and before the retry**: four core artifacts (two tracked outputs, complete payload and archive) plus the five Windows artifacts. `capture-receipt-03.json` binds the precise timing and all bytes. The staged core was already complete/clean; exact containment/backup recheck proved it, so no further subtree deletion occurred. Only the existing `pnpm.cmd package:windows` command was retried with pinned Corepack shim PATH and process-local native `PSModulePath`. No global settings or lifecycle/builder sources changed.
6. Recovered retry03 exited0, but strict whole-resource comparison rejected four additional retired optional copied files outside the first authorized core subtree. Resources had2035 files against2031 configured inputs, with no missing files; fresh core itself was complete. No desktop02 copy was created. `whole-resource-integrity-stop-01.json`, `freeze-03.log` and the successful-but-unfrozen receipt remain separate. No broader cleanup was performed before a written decision.
7. Written `PREPARATION-ADDENDUM-01.md` SHA256 `3ff4b516b1598604b495179747c2920c74faa628f2ec6038ab404ac70e96d02e` authorized only those four exact staged files. A first addendum precheck rejected the generated Windows evidence's legitimate drift from CO-01 before any copy/mutation; its zero-capture receipt04/log remain preserved. The corrected preparation precheck binds that generated evidence to the actual just-built binary/installer, with all other source identities unchanged. A new complete nine-output capture at **`tmp/tal-recovery-06`**, `capture-receipt-05.json`, preserves the just-built/current core and Windows outputs before cleanup or another writer. Each of the four absolute targets was checked inside the release resources tree, including parent-link rejection, against its observed identity and exact recovery copy. Only those four staged files were removed; historical source authority was untouched. Pre-writer full resource and current generated NSIS directive sets then both equaled2031 exact inputs, without missing/extra files (`addendum-pre-writer-integrity.json`).
8. Final addendum preparation ran only registered `pnpm.cmd package:windows` with all nine current backups already verified and native module precedence. Exit0; complete final resources and fresh installer input directives were independently checked by the preparation integrity helper before freezing desktop02. Its necessary nested Piper rebuild is prescribed by that command, and current core outputs/tree/archive remain byte-identical. V4 was not rebuilt and retains complete actual closure/bytes. `preparation-receipt-05.json` records exact generated evidence and all four frozen copies. All previous attempts, recovery copies, old desktop01 and failure receipts remain preserved. This is a preparation retry within CO-02 and its narrow addendum, not another source correction or acceptance bypass.

Complete fresh package integrity proof:

- Actual core/v4 and fresh staged/frozen core file sets equal the full runtime manifests plus manifest files; no missing, extra or legacy root adapters. Each contains exactly ten actual owned Python modules whose bytes match source. This compares all actual files, not just listed modules.
- The entire fresh resource set equals every resolved `tauri.release.conf.json` input and destination, with exact path/size/hash equality. Fresh generated NSIS `File /a /oname` directives match that same complete resource set and source identities; no duplicate/missing/extra/legacy directives. `fresh-installer.nsi` preserves this generated recipe, with its identity in the receipt. The installer was regenerated by NSIS from these inputs; it was not executed or installed.
- Frozen desktop02 resources: **2031files/305591138bytes**, canonical-record SHA256 **`e4ce21d7d943f63e8f77be5206af0fb319d74999f7d79fd86228db970b1c2b1c`**. Every record is in `preparation-receipt-05.json`; all four copies match actual build outputs and generated evidence, and checksum binds the installer. No filtering of a copied tree occurred.
- Old desktop01 complete records and all14 report02 artifact identities were rehashed unchanged, including core archive and v4 archive/three parts. The new clean artifact does not borrow old model/desktop execution evidence. Original recovery/receipt identities remain preserved.

Preserved constraints: stable public service/protocol/engine/release entrypoints, protocol v1, exact four-field identity, lazy optional imports, historical fixed authorities and exact compressed test bytes, native v3 admission, logical/canonical host mapping and exact canonical firewall requirement, full model/manifest closure and link rejection, no development fallback, local inference, memory-only audio, cancellation/bounds, stable locator/narration/synchronization/persistence, dependencies/models/voices/locks. Director coordination edits are preserved. Source scope is unchanged; the explicit timing deviation above is not hidden as a source/acceptance success.

Writer-only host checks: restricted Prettier on the two runner files, both Node syntax parses, `git diff --check`, complete artifact/manifest/NSIS-input hashing and ceiling capture. No lint/type/test/model/desktop acceptance command was consumed as a repair. Index remains empty. Director-owned exact interpreter rule5 receipt is `tmp/evidence/tts-adapter-layout/firewall-setup-05/result.json`; the validator must independently recheck it before inference.

Frozen artifacts (exact copy paths and SHA256):

| Path | SHA256 or record-set identity |
| --- | --- |
| `tmp/tts-adapter-layout-desktop-02/voxleaf-desktop.exe` | `8bce632b3fc9e42904ee90396b9f404575560588e1b3d69d3701e1111ffc35a8` |
| `tmp/tts-adapter-layout-desktop-02/resources` | `e4ce21d7d943f63e8f77be5206af0fb319d74999f7d79fd86228db970b1c2b1c` |
| `tmp/tts-adapter-layout-desktop-02/bundle/nsis/VoxLeaf_0.1.0_x64-setup.exe` | `7e93ee7ac826f8af950b53f517dc238f6b8e878dc47afde8addb7846ff69ae56` |
| `tmp/tts-adapter-layout-desktop-02/bundle/nsis/VoxLeaf_0.1.0_x64-setup.exe.sha256` | `852f0d236d8aa328d2b087aace9f4f5c6a29e25453f5925ce586b5158fa78667` |

New correction evidence identities:

| File | SHA256 |
| --- | --- |
| `source-identities.json` | `74dd4c9fe203d68729ad3636bd19498e8cddaa7a75f30cd7d8f1f991a2cffe11` |
| `diff-accounting.json` | `425201cc13ed365297a94d6f012ae21449d68815568c93ddaae7418a15841199` |
| `correction.diff` | `5c269257669cfdc32e6a3478f38397cc157c2b632d988210d38a1675891e6c4f` |
| `preparation-receipt-05.json` | `e081bd094fb24794e46a78907b51ec9acfd60949fb5e9fbd294960d8bba3f4c1` |
| `capture-receipt-05.json` | `dd280dcafe69abb4598c2ab0569e58888b37187edf93b6ceeaf5196a69f7f7e7` |
| `addendum-pre-writer-integrity.json` | `35454becc9d1ee862b22a1af3047c1a21d7a2f382938e2000df2c9140a1f329a` |
| `frozen-resources-identity.json` | `844b34ac6646aa5b0ccbd0e897fddf60346fe710d0dbcaa601b39b5455abf30f` |
| `fresh-installer.nsi` | `8c4021b65aea22dffa2737b735a996e54146bcdf0ae7b87841c1887d1bdda5a8` |
| `preserved-artifact-identities.json` | `11bdd7d5159ba81c34e839bc1c5a70d8b7f2688cf3b696805e7f1c79c691c5c9` |
| `whole-resource-integrity-stop-01.json` | `bef321a023b09c8b024bd1a8106d7db487f15c98689913240c5377ec079e70d2` |
| `preparation-receipt-03.json` | `2b3341a0a0f4ca055d30b022bb7c286b12dd8a5e74dcf20e0d05eed205c67333` |
| `capture-receipt-03.json` | `8b7ed918729496d2fdceab31cf6fcb66712ee4ee4d0b5a012dc9ab8315b41b26` |
| `interrupted-attempt-receipt.json` | `6e40d24d8fc7d74de5667591d8c8d84cd023ba9b0cd292f6cc89c16c6d986de7` |
| `interrupted-attempt-identities.json` | `c54e4ac6228849f53a2bcb1d8150a2f398574c6a61fcfc147937ebe9acabdd04` |
| `capture-receipt-02.json` | `6a7f663bd7afe3a2bc139188d1e5dcfafe4ebd615812b71dcadca1e02755c1a4` |
| `capture-failure-01.json` | `a83bc9134e779b4a1bb0b472202b5767ec9e79686b211550f5e98ecbf6b82b3b` |

All35 final batch path identities:

| Path | State | SHA256 or HEAD blob |
| --- | --- | --- |
| `services/tts/src/voxleaf_tts/piper_adapter.py` | deleted | `d9f468c0953f71ffcaf208e6bfdebfd1a9bf59f3` |
| `services/tts/src/voxleaf_tts/chatterbox_adapter.py` | deleted | `37bc2d9d23881f98456971a669be38a5e4499d67` |
| `services/tts/src/voxleaf_tts/qwen_adapter.py` | deleted | `ff5eff7404dfeec544c79a20943ac2a0ab7429c7` |
| `services/tts/src/voxleaf_tts/fake_engine.py` | deleted | `69e1ab744e390e1183ad88f29c2bd17e8094ad40` |
| `services/tts/src/voxleaf_tts/adapters/__init__.py` | added | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `services/tts/src/voxleaf_tts/adapters/piper.py` | added | `844d55f64992b620a2f1f708b26a699e6935eff9f8e7c6e9524f98ce45ed209c` |
| `services/tts/src/voxleaf_tts/adapters/chatterbox.py` | added | `6896d06cdabcef5f774f9a251f6d5eeb4b2474a8c27b626aac2da43c9555d669` |
| `services/tts/src/voxleaf_tts/adapters/qwen.py` | added | `2940be2d31beeeb78d2a718d767a86f48806bca39961795f5be82d47fc2c06d5` |
| `services/tts/src/voxleaf_tts/adapters/fake.py` | added | `1863c0e3e1617b71cd9ca9d647aed05e6384ec71f33ef6e47221983a6fbb8023` |
| `services/tts/src/voxleaf_tts/service.py` | modified | `528992e393e225475280007f622bd764dd0dc7d89329ddc1ba897bb7c7c06bd0` |
| `services/tts/src/voxleaf_tts/piper_service.py` | modified | `f5816615cc220661f217f1f5070ea6ff6d6d02d1661f88594de2b60c79949980` |
| `services/tts/src/voxleaf_tts/chatterbox_service.py` | modified | `81ec218ca9e786af43acae14310c8cf00ae33cd3e776e41958cfd456b6221777` |
| `services/tts/src/voxleaf_tts/qwen_service.py` | modified | `64b1ed77e177c9267192154e8f47caae71f67a38cd3d05c854b5c9270e246531` |
| `services/tts/src/voxleaf_tts/release_core.py` | modified | `765fc7e288b103e006ee660085d86846f258fb77b82b87873b2e900feb688980` |
| `services/tts/src/voxleaf_tts/release_chatterbox.py` | modified | `975f459e5295c16483aa9ede24d0fa684a202b3d2ee6e850e25c39f3781d9fea` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` | modified | `1b8b2b885762d0f6159662f96ec955b3f40a0b8c0c81bd027ef0676b38fe9ec0` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` | modified | `10486a491fab9fa13f6776c8b2e9a8e5412aab69b76daad28821d0a353c43e55` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py` | added | `294d6a53af9af5da947f689c4eaae4e2d41caa036a20d6ac5a15bddab35cf4a6` |
| `services/tts/tests/test_piper_adapter.py` | modified | `128fdd5ba6f93b25b971344c6ba68574d4689ea1c72758bbfe64ff5e366cceef` |
| `services/tts/tests/test_chatterbox_adapter.py` | modified | `b2524acb6634c291a76b86ef1fe9755eedb723f543ffccb065ca154e5fb8b029` |
| `services/tts/tests/test_qwen_adapter.py` | modified | `3fa73106f377915e13baa3cfa3afe9d891c32db89a9408bf1c1882a3f246834e` |
| `services/tts/tests/test_service.py` | modified | `63a818b727dafe05dc14d1e3b7a2f2670f4279f506bf5510c7f1a517f51bc993` |
| `services/tts/tests/test_release_core.py` | modified | `0dcec8a5eb182155e947ce0e4a021fda620d53b1abaad28cccba1b6174d839f0` |
| `services/tts/tests/test_release_chatterbox.py` | modified | `207ac9831962ade69f0385b6d3bca2a56d7cebc22c440f71a38a0c7a8654bc81` |
| `services/tts/tests/test_chatterbox_sources.py` | added | `dd706bef238d6bea965d9c1f0d2de7125822613b59ec820a6b36bb07b1f601d6` |
| `services/tts/tests/test_adapter_layout.py` | added | `ff870f22736f5b625a3d503b3f957e8e594fb602505b9fcb7ac7ebf49a04d3c2` |
| `services/tts/release/core/runtime-manifest-v1.json` | modified | `3b03502031c188b5aef5c983859a93f506509648a2ddb35dcfec402877398062` |
| `services/tts/release/core/core-package-evidence-v1.json` | modified | `e46ed9afe2ed06a6c2d847473a6cceb6cc631378289055a4a691357db11a6a8a` |
| `services/tts/release/optional/chatterbox/source-manifest-v4.json` | added | `76741c983f4e7263ffe03ac728eb80cd4cc0bdc13eda4f4dab55aa4996cbb284` |
| `apps/desktop/src-tauri/release/windows-package-evidence-v3.json` | modified | `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad` |
| `apps/desktop/scripts/tts-adapter-layout-host.mjs` | added | `45a995b38eb53a150ec7434d9bdea66fdc3204dc0f7b7c2486c0092cd8254de9` |
| `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | added | `9c309841d7540ae2eb939c5c0ab73947f74caf9a6a9d1df6606620420ff14f34` |
| `apps/desktop/package.json` | modified | `52f30bf20748028ff3e9dd97a197c4193cbe6572aea3aea3d4a4bd86a123c3d7` |
| `package.json` | modified | `d56217dc1693231f9bfbd422d30afe228d28564068d32fafe747e06d4fd792eb` |
| `docs/development/tts-service-organization.md` | modified | `5d3f109ed597817db99a6e3b044dc01dd1281a5586da669a4e8b957369b8ec73` |

Remaining independent acceptance (normal local host PowerShell with pinned Corepack shim, native PS5 module environment for Node-launched Windows observations, immutable source/artifact receipts):

```powershell
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd test:python
pnpm.cmd build:python
pnpm.cmd package:piper-core:check
pnpm.cmd package:chatterbox-optional:check-source
pnpm.cmd package:chatterbox-optional:check-acquisition
pnpm.cmd package:chatterbox-optional:v3:check-source
pnpm.cmd package:chatterbox-optional:v3:check-acquisition
pnpm.cmd package:chatterbox-optional:v4:check-source
pnpm.cmd package:chatterbox-optional:v4:check-local
pnpm.cmd test:tts:adapter-layout:preflight
pnpm.cmd test:tts:adapter-layout:candidate
pnpm.cmd test:tts:adapter-layout:desktop --executable=C:\Users\mmjos\Desktop\workbeanch\voxleaf\tmp\tts-adapter-layout-desktop-02\voxleaf-desktop.exe
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:native-startup
pnpm.cmd package:windows:check
pnpm.cmd inventory:release:check
pnpm.cmd audit:release
pnpm.cmd test:chatterbox:dependency-security
```

Also inspect the actual freshly built isolated wheel/copied closure, fixed historical raw Git bindings, generated source bindings and real artifact hashes/parts. The desktop layout route must use the frozen executable override shown above; aggregate builds may replace ordinary target artifacts. Do not run writing package:windows as a validator repair, install/uninstall, or ordinary acquisition journeys. Director coordination docs/evidence are separate and preserved.

All22 gates require a new immutable independent report against these final identities. Use the documented signed matching155 Edge driver override for native commands and the exact fresh v4 embedded runtime PATH for dependency-security; prior environmental failures remain recorded. This is the last source correction loop. Any further source defect requires stopping and redesigning the order. Source writing is idle.
