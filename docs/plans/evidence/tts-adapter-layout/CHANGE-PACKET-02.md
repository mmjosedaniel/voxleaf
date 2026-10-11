# TTS-ADAPTER-LAYOUT-01 Correction Change Packet 01

Status: corrected source frozen; writer idle; new independent acceptance pending. Correction loop 1 of 2. No acceptance tests, writing generators/builders, inference, installation, publication or Git mutations occurred during this correction.

HEAD `7bbad9d5bef3a83c913ea5d7b948213a05bb0362`; branch `codex/tts-adapter-layout`.
Parent approved work-order SHA256 `bf7ce6019bfe47fe6ef41d195bb33cae1406b294487c185258b6199aec58b5fb`.
Correction order `TTS-ADAPTER-LAYOUT-01-CO-01`, SHA256 `717d1e31de0e82fb6c69a0158fc2afed219e164dab0741e7d0a6825eced0815b`.
Independent FAIL report `TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-01`, SHA256 `a5f2d92a58744b642008abb7b2af47b995c87e7390ebf06559cd58c446a5565c`. That report and all partial PASS results remain unchanged; they do not accept this patch.

Combined full35 scope: **2,948/3,000** rename-aware additional changed lines, **151/300** generator-owned lines. Four mechanically equivalent moves retain 1,614 relocated lines and count 16 import added/deleted lines. Correction consumes 143 of the prior195-line headroom; 52 remain. Complete identities and accounting below bind physical bytes, with HEAD blobs for deleted paths.

The six correction files and exact reasons/symbols:

- `services/tts/tests/test_release_chatterbox.py`: import-block spacing resolves reported Ruff I001; `historical_blob_fixture` explicitly checks decoded dict/key/value types and returns a typed bytes mapping. Exact compressed historical fixture bytes, fixed hashes and existing assertions are preserved.
- `services/tts/tests/test_adapter_layout.py`: explicit `jsonschema` import plus checked `__file__` string narrowing in the isolated-copy fixture resolves its mypy error. All isolated-import assertions remain.
- `services/tts/tests/test_chatterbox_sources.py`: three existing monkeypatch sites reference the explicitly imported shared `subprocess` module instead of implementation-private exports. Adds parametrized directory/write OSError regression with exact content-free error and suppressed context assertions.
- `services/tts/src/voxleaf_tts/release_chatterbox.py`: `_copy_runtime_modules` resolves the complete source map before mutation, then translates only directory/write `OSError` into `ReleaseChatterboxError("chatterbox-package-staging-failed") from None`. Provenance errors remain unchanged with no live-source fallback.
- `apps/desktop/scripts/tts-adapter-layout-host.mjs`: `verifyRootBinding`, `samePath`, `collectFiles`, `verifyTree`, `preflight`, `desktop` and its caller bind the report's observed Windows virtualization mapping. The logical root uses host/supplied `LOCALAPPDATA` plus `com.voxleaf.desktop/tts/cb/3`; the canonical root uses the same prefix plus fixed `Packages/OpenAI.Codex_2p2nqsd0c76g0/LocalCache/Local/com.voxleaf.desktop/tts/cb/3`. No personal username is embedded in source. Only that exact environment-derived pair or identical root is permitted; symbolic roots and arbitrary aliases remain rejected. Physical root must resolve to itself. Every descendant must resolve to its exact expected physical path inside the canonical root and remain free of symbolic links. Full manifest/model verification remains. Logical/canonical interpreter paths and sizes/SHA256 are recorded and compared; canonical exact-program firewall coverage is required before inference. Desktop observation accepts only the verified path pair for each exact service module, records actual observed paths, requires the requested arm and retains independent network/process-cleanup observations.
- `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`: existing verifier fixture adds root and descendant junction rejection; a synthetic user prefix checks the permitted virtualization pair and rejects linked/arbitrary root mappings. Existing closure/tamper assertions are preserved.

Preserved invariants: public service/protocol/engine entrypoints, protocol v1, historical fixed authorities/fixtures, native v3 admission, complete runtime/model closure, no development-source fallback, exact firewall rules, link/descendant rejection, local inference, memory-only audio, cancellation/bounds, locator/narration/synchronization/persistence, dependencies/locks/voices. No scope deviation. All other29 batch identities match the prior packet, and director coordination edits were preserved. Before-correction bytes for all six files are captured under `before/` and match the prior full35 packet.

Artifact reuse is proven by `artifact-reuse.json` and `reused-artifact-identities.json`, without a builder. Actual core, fresh v4 and frozen core manifests each contain exactly ten copied VoxLeaf modules, no correction-file intersection; every copied module hash matches both its actual bytes and current source bytes. The maintainer copier, tests and runner are absent. All four generated authorities remain byte-identical. All14 immutable validator artifact identities were rehashed, including core archive and fresh v4 archive/three parts. Frozen executable, installer/checksum and exact2037 resources were rehashed; record-set SHA256 remains `32413c648007d15130ba9ddfa51b6b46522925adc834b9e54628caed0077c158`. Thus current packages/frozen desktop are reusable, with no copied runtime or generated-authority changes. The old wheel is not reused: fresh `build:python` and isolated-wheel inspection remain necessary because wheels include maintainer tooling.

Preparation/recovery remain the original immutable attempt02/03 records. `tmp/evidence/tts-adapter-layout/worker-preparation-03/preparation-receipt.json` SHA256 `c24d29e8bf689ac872ce9df26569b84dfa099e56c2b6b9530d4aa32378c68e87`; all9 original captures remain under `tmp/tts-adapter-layout-recovery-02`. No prior receipt was overwritten. Frozen executable `tmp/tts-adapter-layout-desktop-01/voxleaf-desktop.exe` SHA256 `b8a94bea359135f5eb4e158e4b670f204a328f81c0c27ab3de2c1ac2325a67e9`,11798016bytes, sibling resources2037files305628049bytes. Original unsigned-local/antivirus-not-run/lifecycle-not-run observations remain truthful. The director prepared canonical exact-program rule `VoxLeaf-Adapter-Layout-Test-4`; its receipt is `tmp/evidence/tts-adapter-layout/firewall-setup-04/result.json`. Validator must independently recheck it. No inference or installed-user-data mutation by the writer.

Writer-only host checks: restricted `uv run --project services/tts --locked ruff format` on the four correction Python files, `pnpm.cmd exec prettier --write` on the two correction runner files, Python AST parses, both `node --check` parses, and `git diff --check`. All completed normally outside the sandbox with pinned Corepack shim PATH. Artifact hashing/manifest inspection and full35 scope/ceiling capture are preparation proof, not acceptance results. No lint/type/test/model/desktop acceptance command was consumed as a repair. Index remains empty.

New immutable correction evidence identities:

| File | SHA256 |
| --- | --- |
| `source-identities.json` | `013eae39910f091387911eae989b375a983fc74081b10c1f060645b2ec0b178d` |
| `diff-accounting.json` | `34a44fc7c764646862027f671883b60ecf7181346a29dc44ce50dbac015a01d3` |
| `correction.diff` | `a6b248d8bb491f79574862ddd3ec51bef85d235b1323d1d02af8769d6ddcc464` |
| `artifact-reuse.json` | `ebd02b1fceb40fa9595e70b632503ba6018a356fb8ca1bda3d6063b380115719` |
| `reused-artifact-identities.json` | `834589b1d8df604d51d0ebe9fad6a88a234b4691dea49fb94a860b3101bea790` |
| `artifact-identities.json` | `5fcb4b7a29e88863dd1e0e7a26c3986b0dccbf6e40fbc64c1cbf8e89cffb4443` |

All35 corrected batch path identities:

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
| `apps/desktop/src-tauri/release/windows-package-evidence-v3.json` | modified | `a493c565f82ad9c970c9f8d34d580d35f3702bb9b822f66893c4291bed9184e4` |
| `apps/desktop/scripts/tts-adapter-layout-host.mjs` | added | `eb4191d092e4682277bf2712eb4de47d4aaa9b2263abf2e487d72d1f37840b74` |
| `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | added | `571ad8a8d4ae914d615b35a7d429e8e1300813a61b97abeba4f684df41206ba9` |
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
pnpm.cmd test:tts:adapter-layout:desktop --executable=C:\Users\mmjos\Desktop\workbeanch\voxleaf\tmp\tts-adapter-layout-desktop-01\voxleaf-desktop.exe
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:native-startup
pnpm.cmd package:windows:check
pnpm.cmd inventory:release:check
pnpm.cmd audit:release
pnpm.cmd test:chatterbox:dependency-security
```

Also inspect the actual freshly built isolated wheel/copied closure, fixed historical raw Git bindings, generated source bindings and real artifact hashes/parts. The desktop layout route must use the frozen executable override shown above; aggregate builds may replace ordinary target artifacts. Do not run writing package:windows as a validator repair, install/uninstall, or ordinary acquisition journeys. Director coordination docs/evidence are separate and preserved.

The next immutable independent report must bind this correction packet and all35 current path identities. Source writing is idle and remains frozen for validation.
