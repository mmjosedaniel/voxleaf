# TTS-ADAPTER-LAYOUT-01 Change Packet

> **Sanitized publication copy.** Personal paths are redacted; report IDs,
> results and validation hashes retain their historical meaning.
> Original SHA-256: `c6c934f8521d090f2d54adb8315dbf0211f7e11cfa941ac33c8283a13e427f21`.
> See [publication and original retention](../historical-privacy-cleanup/README.md).

Status: source and writing preparation frozen; independent acceptance pending. No staging, commit, push, PR, publication, installation or acceptance tests by the writer.

HEAD `7bbad9d5bef3a83c913ea5d7b948213a05bb0362`; branch `codex/tts-adapter-layout`; approved work-order SHA256 `bf7ce6019bfe47fe6ef41d195bb33cae1406b294487c185258b6199aec58b5fb`.

Exact scope: 35 paths. Four mechanically equivalent moves relocate 1,614 lines; only their eight relative-import lines change (16 added/deleted lines counted). Additional rename-aware changes: **2805/3000**. Generator-owned changes: **151/300**. See `source-identities.json` and `diff-accounting.json`; deleted paths bind their HEAD blob identities, other paths bind exact physical bytes.

Edits and symbols:

- `adapters/{piper,chatterbox,qwen,fake}.py`: move the existing engine implementations, update only engine/protocol relative imports, and add empty `adapters/__init__.py`. Four stable service entrypoints and their direct adapter/service tests use the owned adapter paths. No forwarders or engine algorithm edits.
- `packaging/chatterbox_sources.py`: `HISTORICAL_COMMITS`, `HISTORICAL_IDENTITIES`, `_read_git_blob`, `historical_sources`, `LOCAL_RUNTIME_MODULES`, `resolve_runtime_sources`. Both historical maintainer consumers use exact verified raw blobs; missing/corrupt history fails before output/environment mutation without fetch or live-source fallback.
- `chatterbox_authority.py`: successor acquisition hashes use verified historical v3 bytes; `local_source_manifest` and `write_local_source_manifest` derive the unpublished/unadmitted v4 recipe; `load_source_manifest` closes the v4 identity.
- `chatterbox_integrity.py`: `PackageVersion`, version validation and `PackageLayout` add isolated v4 names/dist with the unchanged v3 lock.
- `release_chatterbox.py`: `_copy_runtime_modules` consumes pre-resolved bytes; `build_package` resolves before sync/output mutation, keeps require-hashes and exact Tokenizers notice, and emits measured local v4 evidence. `_local_package_receipt`/`check_local_package` close real source/tree/lock/licence/archive/member/ordered-part identities. CLI adds registered v4 build/write-source/check-source/check-local and excludes publication/acquisition/reconciliation for v4.
- `release_core.py`: exact exclusions retain the historical paths and remove relocated dormant Chatterbox/Qwen modules; smoke imports the new Piper path. Existing closure regressions retain their assertions.
- `test_chatterbox_sources.py`, `test_adapter_layout.py`, existing release/adapter/service suites: cover closed provenance, source failures before mutation, local-v4 source/receipt/tree/part drift, require-hashes and isolated lazy origins. Resolver unit fixtures are synthetic and bounded; existing historical authority tests inject exact self-contained compressed old blobs, retaining production fixed expected hashes and historical assertions. Unsupported-version rejection moves from newly authorized4 to still-unsupported5 with its original error assertion.
- `tts-adapter-layout-host.mjs`: exact preflight/candidate/desktop modes and contained argument overrides; complete source/payload/model/firewall binding, embedded isolated imports, bounded framed lifecycle/PCM, malformed input, cancellation/termination/restart, filesystem/network/process observations, and the existing four native portfolio arms. Desktop observes both exact admitted runtime paths during profile switching while requiring the requested runtime and cleanup. Windows child module paths are contained in their own environments; the portable node regression covers this known inherited-module failure.
- Package JSON registers all proposed CLI/runner routes and the node suite. The service map documents actual ownership, history prerequisite, local-v4 limits, recovery and host commands. Canonical architecture was reviewed; no process/topology or admission change warrants a diagram edit.

Preserved invariants: stable service/protocol/engine/release entrypoints and error identities; protocol v1; lazy optional imports; one active operation; bounded PCM/queues; cancellation/stale suppression and tree cleanup; local inference and memory-only audio; locator, narration, synchronization and persistence behavior; unchanged dependencies/models/voices/locks; all historical v2/v3 authority/evidence and native v3 admission; read-only existing user installation/models. No claims about a fresh model/desktop gate have been transferred from older package bytes.

Preparation and recovery:

- Original tracked Piper outputs, Windows evidence, verified core runtime/archive and relevant native artifacts were copied and hash-verified before writing: **9 captures**, `tmp/tts-adapter-layout-recovery-02`. Exact original paths/bytes are in attempt02's receipt. Initial PS5 long-path recovery capture failed before any generator; partial capture remains preserved under `worker-preparation-01/recovery` with `capture-failure.json`.
- Attempt02 successfully ran v4 write-source/build and Piper write-manifest/build. Its Windows command built executable/installer, then failed at native Security module autoload. The failure receipt/log remain unchanged. The same pnpm-to-PS5 diagnostic proves inherited PS7 Security v7 precedence and the native-module environment correction: `native-module-diagnosis-inherited.json` and `native-module-diagnosis-corrected.json`.
- Attempt03 reran only registered `package:windows` with process-local native PS5 module path; exit0. It accurately records unsigned-local, antivirus-not-run and lifecycle-not-run. Builder sources/global module settings were not edited. No Piper partial-writer failure occurred; original recovery remains available and the retry wrapper restores captured original outputs/payload/archive if such a failure occurs.
- All five intended writing preparation routes completed; no independent acceptance command ran. Restricted formatters left22 Python paths and runner/package JSON formatted;22 Python AST parses, both node syntax parsers and `git diff --check` completed from host PowerShell. The index remains empty.
- Verified frozen artifacts: `tmp/tts-adapter-layout-desktop-01/voxleaf-desktop.exe`, sibling `resources`, installer and checksum. Attempt03 receipt contains every copied resource path/size/hash and the file identities. Frozen resource count **2037**, record-set SHA256 `32413c648007d15130ba9ddfa51b6b46522925adc834b9e54628caed0077c158` (encoding documented in `frozen-resources-identity.json`). The exact embedded interpreter is `tmp/tts-adapter-layout-desktop-01/resources/tts/voxleaf-piper-core-v1/runtime/python.exe`; director owns its already-prepared firewall rule and cleanup.
- Fresh v4 archive SHA256 `e2f68d53eb15e24328a565669a11c02fcf82cbaa6ac7e7f2cf3717648ce2bb95`, compressed bytes 5030982155; exact three parts/tree/source/lock/licence/archive members are recorded in `services/tts/release/optional/chatterbox/dist/v4/local-build-evidence-v4.json`. It remains unpublished/unadmitted with no inherited execution observations.
- Fresh core archive SHA256 `51c62ffa173376c85d55b0f05a5a86d3577f5fe192439357e16cf6c9fcdd4ac2`, compressed bytes 213352542; generated current core/Windows identities are included below. Old package evidence stays with captured old bytes.

Artifact/receipt identities (SHA256):

| Path | SHA256 |
| --- | --- |
| `tmp/evidence/tts-adapter-layout/worker-preparation-02/preparation-receipt.json` | `6650862bf512a9de2095ff207f41e4c3e0a15cc6767363372c6a9f1e701b1a14` |
| `tmp/evidence/tts-adapter-layout/worker-preparation-03/preparation-receipt.json` | `c24d29e8bf689ac872ce9df26569b84dfa099e56c2b6b9530d4aa32378c68e87` |
| `services/tts/release/optional/chatterbox/dist/v4/local-build-evidence-v4.json` | `4ca805e757e5da4c136b63dbc35caa7501faaa7d8391d806f19b350e3ca2c11e` |
| `services/tts/release/optional/chatterbox/dist/v4/voxleaf-chatterbox-v4/runtime-manifest-v4.json` | `3845010a4198f81e4517e8d5338d07220a53fb77d9aeb2a9e58faf4e0957b4ca` |
| `tmp/tts-adapter-layout-desktop-01/voxleaf-desktop.exe` | `b8a94bea359135f5eb4e158e4b670f204a328f81c0c27ab3de2c1ac2325a67e9` |
| `tmp/evidence/tts-adapter-layout/worker-preparation-02/source-identities.json` | `b0ea2c7b0072bbbb347868c08cffc4227ef3eb828828cdbef16295edfc4146a9` |
| `tmp/evidence/tts-adapter-layout/worker-preparation-02/diff-accounting.json` | `ddc3262d24d2d1ea6888b2652f926af3a4835c1dd196e914c8b6c6bd6f3d324b` |

All35 path identities:

| Path | State | SHA256 or HEAD blob for deletion |
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
| `services/tts/src/voxleaf_tts/release_chatterbox.py` | modified | `9b704fdd0e4b78dd5b3a1c39f6806b5d58e0547291e09a5e424f0c5007fe589f` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` | modified | `1b8b2b885762d0f6159662f96ec955b3f40a0b8c0c81bd027ef0676b38fe9ec0` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` | modified | `10486a491fab9fa13f6776c8b2e9a8e5412aab69b76daad28821d0a353c43e55` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py` | added | `294d6a53af9af5da947f689c4eaae4e2d41caa036a20d6ac5a15bddab35cf4a6` |
| `services/tts/tests/test_piper_adapter.py` | modified | `128fdd5ba6f93b25b971344c6ba68574d4689ea1c72758bbfe64ff5e366cceef` |
| `services/tts/tests/test_chatterbox_adapter.py` | modified | `b2524acb6634c291a76b86ef1fe9755eedb723f543ffccb065ca154e5fb8b029` |
| `services/tts/tests/test_qwen_adapter.py` | modified | `3fa73106f377915e13baa3cfa3afe9d891c32db89a9408bf1c1882a3f246834e` |
| `services/tts/tests/test_service.py` | modified | `63a818b727dafe05dc14d1e3b7a2f2670f4279f506bf5510c7f1a517f51bc993` |
| `services/tts/tests/test_release_core.py` | modified | `0dcec8a5eb182155e947ce0e4a021fda620d53b1abaad28cccba1b6174d839f0` |
| `services/tts/tests/test_release_chatterbox.py` | modified | `a183946b87a746639024b6d832b0e139f83d141b5b514ec329c0bb293cf71a84` |
| `services/tts/tests/test_chatterbox_sources.py` | added | `a56b4ec08707bce5f0f09630ff85e8b4d6da7810b90250855fe8afd327ff8d46` |
| `services/tts/tests/test_adapter_layout.py` | added | `86786d7e804fbd87192073dc874114095dcb58d13f903f7d0e64fb0eda84a21e` |
| `services/tts/release/core/runtime-manifest-v1.json` | modified | `3b03502031c188b5aef5c983859a93f506509648a2ddb35dcfec402877398062` |
| `services/tts/release/core/core-package-evidence-v1.json` | modified | `e46ed9afe2ed06a6c2d847473a6cceb6cc631378289055a4a691357db11a6a8a` |
| `services/tts/release/optional/chatterbox/source-manifest-v4.json` | added | `76741c983f4e7263ffe03ac728eb80cd4cc0bdc13eda4f4dab55aa4996cbb284` |
| `apps/desktop/src-tauri/release/windows-package-evidence-v3.json` | modified | `a493c565f82ad9c970c9f8d34d580d35f3702bb9b822f66893c4291bed9184e4` |
| `apps/desktop/scripts/tts-adapter-layout-host.mjs` | added | `7102999787954ee167878df91a69cf72ab409c1e696267a7c449995a759a2299` |
| `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | added | `b03a9b087b055517b3c99b5446fb0f3c8851ec7966c8afd4f21c0f781e13853d` |
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
pnpm.cmd test:tts:adapter-layout:desktop --executable=<REPO_ROOT>\tmp\tts-adapter-layout-desktop-01\voxleaf-desktop.exe
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:native-startup
pnpm.cmd package:windows:check
pnpm.cmd inventory:release:check
pnpm.cmd audit:release
pnpm.cmd test:chatterbox:dependency-security
```

Also inspect the actual freshly built isolated wheel/copied closure, fixed historical raw Git bindings, generated source bindings and real artifact hashes/parts. The desktop layout route must use the frozen executable override shown above; aggregate builds may replace ordinary target artifacts. Do not run writing package:windows as a validator repair, install/uninstall, or ordinary acquisition journeys. Director coordination docs/evidence are separate and preserved.
