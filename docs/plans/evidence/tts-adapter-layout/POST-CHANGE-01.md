# Validation Report

> **Sanitized publication copy.** Personal paths are redacted; report IDs,
> results and validation hashes retain their historical meaning.
> Original SHA-256: `c1e78f4f28dba3d640f0a562cbff3000a1461669b60c1d131ff167b10d8de909`.
> See [publication and original retention](../historical-privacy-cleanup/README.md).

Report ID: TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-01
Target ID: TTS-ADAPTER-LAYOUT-01
Mode: POST-CHANGE
Verdict: FAIL
Environment: local PowerShell outside sandbox; every executed acceptance command used require_escalated. Process-local PATH prepended C:/nvm4w/nodejs/node_modules/corepack/shims (pnpm11.15.1). Native child compatibility used process-local PSModulePath=C:/Windows/System32/WindowsPowerShell/v1.0/Modules. No global environment changes.
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: exact35 closed work-order paths, enumerated below. Branch codex/tts-adapter-layout; index empty before and after.
Validated path identities: before.json contains every exact porcelain status, worktree SHA256 and filter-aware expected index blob ID; after.json repeats the same closed35 plus protected260. Four approved old adapter paths are DELETED. These files form an integral part of this immutable report.
Identity recheck: PASS. Source35, protected260, HEAD/index, artifact files14 and frozen resource files2037 are unchanged. Independently rehashed artifacts match all four frozen entries in worker preparation receipt. Details identity-recheck.json, artifacts-before.json, artifacts-after.json.

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
| services/tts/src/voxleaf_tts/release_chatterbox.py | 9b704fdd0e4b78dd5b3a1c39f6806b5d58e0547291e09a5e424f0c5007fe589f | eba17c42946e12a4c5bd4c409635f1afa985325d |  M services/tts/src/voxleaf_tts/release_chatterbox.py |
| services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py | 1b8b2b885762d0f6159662f96ec955b3f40a0b8c0c81bd027ef0676b38fe9ec0 | 09784d179ea7d7e30713622c5b54f7f063439e3a |  M services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py |
| services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py | 10486a491fab9fa13f6776c8b2e9a8e5412aab69b76daad28821d0a353c43e55 | 4e50216b578a98b5d71ac39ebd13add8ef08de99 |  M services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py |
| services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py | 294d6a53af9af5da947f689c4eaae4e2d41caa036a20d6ac5a15bddab35cf4a6 | f8ddbf3c2a4c45ae3da785b8eafb8bfd77300fbe | ?? services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py |
| services/tts/tests/test_piper_adapter.py | 128fdd5ba6f93b25b971344c6ba68574d4689ea1c72758bbfe64ff5e366cceef | f1421bde1dbe89be21564c8887d807ebe140bd05 |  M services/tts/tests/test_piper_adapter.py |
| services/tts/tests/test_chatterbox_adapter.py | b2524acb6634c291a76b86ef1fe9755eedb723f543ffccb065ca154e5fb8b029 | 5717875d6d8448609518d294004494e5cb79cce6 |  M services/tts/tests/test_chatterbox_adapter.py |
| services/tts/tests/test_qwen_adapter.py | 3fa73106f377915e13baa3cfa3afe9d891c32db89a9408bf1c1882a3f246834e | debee220256d45897a3f52d055859952e23ce5d4 |  M services/tts/tests/test_qwen_adapter.py |
| services/tts/tests/test_service.py | 63a818b727dafe05dc14d1e3b7a2f2670f4279f506bf5510c7f1a517f51bc993 | f7a00fbb36ba9910dc15a4a7f6557e5efb4120e0 |  M services/tts/tests/test_service.py |
| services/tts/tests/test_release_core.py | 0dcec8a5eb182155e947ce0e4a021fda620d53b1abaad28cccba1b6174d839f0 | 898e5b8bcc6dbf49e994481e94ffadd62604e421 |  M services/tts/tests/test_release_core.py |
| services/tts/tests/test_release_chatterbox.py | a183946b87a746639024b6d832b0e139f83d141b5b514ec329c0bb293cf71a84 | 057f51b148ae951aefee45eabfe1bfd027ba0e6b |  M services/tts/tests/test_release_chatterbox.py |
| services/tts/tests/test_chatterbox_sources.py | a56b4ec08707bce5f0f09630ff85e8b4d6da7810b90250855fe8afd327ff8d46 | ad1991cd5c2d16279540b762fd605983eba9b3fa | ?? services/tts/tests/test_chatterbox_sources.py |
| services/tts/tests/test_adapter_layout.py | 86786d7e804fbd87192073dc874114095dcb58d13f903f7d0e64fb0eda84a21e | 2bb4c802fd3347e9118df635291871d7aa788320 | ?? services/tts/tests/test_adapter_layout.py |
| services/tts/release/core/runtime-manifest-v1.json | 3b03502031c188b5aef5c983859a93f506509648a2ddb35dcfec402877398062 | 4d348f5a8aa01caea12afcbb1bbe2385ae534d1e |  M services/tts/release/core/runtime-manifest-v1.json |
| services/tts/release/core/core-package-evidence-v1.json | e46ed9afe2ed06a6c2d847473a6cceb6cc631378289055a4a691357db11a6a8a | 58bab708db7ab389a87fff51534f6fd2abfa08a1 |  M services/tts/release/core/core-package-evidence-v1.json |
| services/tts/release/optional/chatterbox/source-manifest-v4.json | 76741c983f4e7263ffe03ac728eb80cd4cc0bdc13eda4f4dab55aa4996cbb284 | c389c99b2af67e5a2b9f6835887286f1f9b4e1b7 | ?? services/tts/release/optional/chatterbox/source-manifest-v4.json |
| apps/desktop/src-tauri/release/windows-package-evidence-v3.json | a493c565f82ad9c970c9f8d34d580d35f3702bb9b822f66893c4291bed9184e4 | 58d5a48e6111546fbe660fc91c03b685c8e8b3f4 |  M apps/desktop/src-tauri/release/windows-package-evidence-v3.json |
| apps/desktop/scripts/tts-adapter-layout-host.mjs | 7102999787954ee167878df91a69cf72ab409c1e696267a7c449995a759a2299 | dd5f43db307ced729f4d68b68b574eae130ceef0 | ?? apps/desktop/scripts/tts-adapter-layout-host.mjs |
| apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs | b03a9b087b055517b3c99b5446fb0f3c8851ec7966c8afd4f21c0f781e13853d | 7418ee6e5d7aff038d00c540e4e76d99f30324ae | ?? apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs |
| apps/desktop/package.json | 52f30bf20748028ff3e9dd97a197c4193cbe6572aea3aea3d4a4bd86a123c3d7 | e0aad3012a5902bb274e0230e47998c43af8d541 |  M apps/desktop/package.json |
| package.json | d56217dc1693231f9bfbd422d30afe228d28564068d32fafe747e06d4fd792eb | fd9e98b5009c9b58386cf886e752c1ab0df775f8 |  M package.json |
| docs/development/tts-service-organization.md | 5d3f109ed597817db99a6e3b044dc01dd1281a5586da669a4e8b957369b8ec73 | fa6b9a7d707eaa959b6b3581f19526aab406e790 |  M docs/development/tts-service-organization.md |

Commands and outcomes:

- `pnpm.cmd format:check:python` -> exit 0. 174 Python files formatted. Raw command-01.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd lint:python` -> exit 1. REGRESSION: Ruff I001 import ordering at services/tts/tests/test_release_chatterbox.py:1. Raw command-02.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd typecheck:python` -> exit 1. REGRESSION: five mypy errors in three changed tests; see findings below. Raw command-03.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd test:python` -> exit 0. 483 passed; pre-existing PytestCacheWarning for cache/nodeids retained, not a new failure. Raw command-04.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd build:python` -> exit 0. Fresh wheel and sdist built successfully. Raw command-05.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd package:piper-core:check` -> exit 0. Current copied Piper tree/archive matches authority. Raw command-06.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd package:chatterbox-optional:check-source` -> exit 0. Historical v2 source recipe current. Raw command-07.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd package:chatterbox-optional:check-acquisition` -> exit 0. Historical v2 acquisition authority current. Raw command-08.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd package:chatterbox-optional:v3:check-source` -> exit 0. Historical v3 source recipe current. Raw command-09.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd package:chatterbox-optional:v3:check-acquisition` -> exit 0. Historical v3 acquisition authority current. Raw command-10.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd package:chatterbox-optional:v4:check-source` -> exit 0. Local v4 source recipe current. Raw command-11.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd package:chatterbox-optional:v4:check-local` -> exit 0. Fresh measured v4 tree/recipe/lock/license/archive contents/ordered split parts current, unpublished and unadmitted. Raw command-12.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd test:tts:adapter-layout:preflight` -> exit 1. FAIL: tts-adapter-layout-host:artifact-link before model inference; installed logical root differs from native canonical root. Raw command-13.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0. 54 Vitest files /588 tests and45 Node tests pass, including7 new runner tests. Raw command-23.log; exact UTC timing in commands-01-12.json or commands-extra.json.
- `pnpm.cmd test:tts:adapter-layout:candidate` -> NOT RUN. Director deferred remaining model/desktop/aggregate/final gates after concrete deterministic regressions; required on corrected patch before acceptance. No substituted PASS.
- `pnpm.cmd test:tts:adapter-layout:desktop --executable=<REPO_ROOT>\tmp\tts-adapter-layout-desktop-01\voxleaf-desktop.exe` -> NOT RUN. Director deferred remaining model/desktop/aggregate/final gates after concrete deterministic regressions; required on corrected patch before acceptance. No substituted PASS.
- `pnpm.cmd check:portable` -> NOT RUN. Director deferred remaining model/desktop/aggregate/final gates after concrete deterministic regressions; required on corrected patch before acceptance. No substituted PASS.
- `pnpm.cmd check` -> NOT RUN. Director deferred remaining model/desktop/aggregate/final gates after concrete deterministic regressions; required on corrected patch before acceptance. No substituted PASS.
- `pnpm.cmd test:native-startup` -> NOT RUN. Director deferred remaining model/desktop/aggregate/final gates after concrete deterministic regressions; required on corrected patch before acceptance. No substituted PASS.
- `pnpm.cmd package:windows:check` -> NOT RUN. Director deferred remaining model/desktop/aggregate/final gates after concrete deterministic regressions; required on corrected patch before acceptance. No substituted PASS.
- `pnpm.cmd inventory:release:check` -> NOT RUN. Director deferred remaining model/desktop/aggregate/final gates after concrete deterministic regressions; required on corrected patch before acceptance. No substituted PASS.
- `pnpm.cmd audit:release` -> NOT RUN. Director deferred remaining model/desktop/aggregate/final gates after concrete deterministic regressions; required on corrected patch before acceptance. No substituted PASS.
- `pnpm.cmd test:chatterbox:dependency-security` -> NOT RUN. Director deferred remaining model/desktop/aggregate/final gates after concrete deterministic regressions; required on corrected patch before acceptance. No substituted PASS.

Supplementary commands and outcomes:

- `services/tts/.venv/Scripts/python.exe -B tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-01/supplementary.py` -> exit0. Real historical v2/v3 Git resolution verified7/9 module size/SHA256 records against fixed commits. Fresh wheel SHA256 d71f9d7eaf4d9fa65798664b6c34b3f0f0c1c003adc2f1ea27ef5cd4a5213388, extracted only into ignored evidence, passed a separate `python -I -B -c <script recorded in supplementary.py> <extracted-wheel>` process: all four stable service imports came exclusively from extracted wheel; no torch/numpy/piper/chatterbox/qwen_tts eager import, no old adapter forwarding paths. Includes exact original/helper versus changed/runtime-copy error reproduction and independent rename accounting.
- `node tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-01/artifact-link-probe.mjs` -> exit0. Native realpath diagnostic identifies installed logical/canonical path mismatch with lstat symlink=false; both repo payload roots resolve to themselves. Exact script/log retained.
- `node tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-01/interpreter-path.mjs` -> exit0. Read-only installed interpreter logical/canonical binding in interpreter-path.json. No inference child spawned.
- `services/tts/.venv/Scripts/python.exe -B tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-01/recheck.py` -> exit0, full closed identities/artifacts unchanged.
- `Get-NetFirewallRule -DisplayName 'VoxLeaf TTS Benchmark Offline'` with application filters and `Get-NetFirewallProfile` / `Get-Service MpsSvc` -> read-only exit0. Four unique task rules -0/-1/-2/-3 retain Enabled=True, Outbound, Block, Any and the exact requested logical programs; existing eight program rules retained. All profiles enabled and service Running. Raw firewall.json; interpretation firewall-review.json.
- `git diff --check` -> exit0; `git status --porcelain=v1 -uall` captured in status-after.txt. No staging or Git mutation.

Diff scope: PASS. Exactly35 source-unit paths. Director coordination docs are separate declared changes in docs/README.md, docs/plans/active/README.md, docs/plans/active/tts-adapter-layout.md and docs/plans/evidence/tts-adapter-layout/. All four moves independently equal HEAD content after exactly the two engine/protocol relative-import substitutions per file:1614 relocated lines. Additional rename-aware total2805/3000, comprising2654 nongenerated plus151 generated; generated151/300. Empty adapters/__init__.py, no forwarders. Full accounting per path in supplementary.json. No dependency/lock/engine algorithm/public schema/model/native admission changes.

Invariant review: FAIL. Preserved production algorithms and contracts are mechanically supported, but the staging error identity regressed and the host acceptance runner rejects this real Windows path mapping. Required fresh execution invariants remain unproven because candidate/desktop gates are deferred.

- Stable four service entrypoints and lazy imports: reviewed import-only diffs, fresh isolated wheel PASS, copied package checks PASS. Public engine/protocol source unchanged among protected260.
- Historical v2/v3 provenance: fixed two commits/raw Git bytes with no replace objects/fetch/fallback; both real7/9 closures PASS. Resolver executes before package output/environment mutation. Source/acquisition checks PASS and frozen authority260 unchanged.
- Local v4: distinct version/directory/archive and exact10 runtime modules; same v3 lock/model/require-hashes, safe-load checks, notices, measured real archive and parts. Registered source/local checks PASS. No admission, URLs, publication or inherited execution claims.
- Piper: exact old/new Chatterbox/Qwen exclusions retain similarly named paths; smoke imports moved Piper; actual refreshed core check PASS.
- Protocol v1, one active operation, bounded PCM/queues, stale suppression, cancellation, local inference and memory-only audio: engine/service behavior diffs are import-only, existing483 Python and633 desktop tests pass. Runner framing/handshake/load/warm/synthesize/complete/cancel/terminate/restart mapping inspected against actual service; no additional established framing mismatch found. Real candidate/desktop latency, network/filesystem observations and child cleanup have NOT been executed on fresh artifacts.
- Locator/narration/synchronization/persistence and native v3 admission: affected production code unchanged, protected identities preserved. Installed user data not written or removed by validator. Logical/canonical binding and firewall proof still require correction before host inference.

Test-integrity review: PASS. Existing behavior assertions retained; moved imports only for adapter/service suites. Unsupported version rejection updated4 to5 because v4 is authorized. New historical fixtures inject exact compressed frozen byte records while production fixed hashes remain intact; synthetic resolver fixtures separately cover missing/corrupt history, path closure, pre-mutation failure and no fallback. Core tests add exact relocated exclusions with retained similarly named modules. New runner tests assert actual framing/PCM identities, limits, environment containment, path admission and cleanup, but do not yet cover the observed Windows virtualization mapping or preserved module-copy I/O error. Lint and typing regressions in these tests prevent acceptance.

Privacy/artifact review: FAIL for preserved content-free packaging failure behavior; raw FileExistsError includes a filesystem path. No books/audio/weights/secrets/private payloads entered the reviewed source diff. All actual large artifacts remain ignored. Generator outputs bind fresh core/v4/frozen resources and legitimate preparation receipts; attempt02 Windows failure is retained as failure, attempt03 is successful preparation only. Unsigned-local, antivirus-not-run, lifecycle-not-run remain accurate. No inference, audio capture, install/uninstall, package publication or firewall mutation by validator.

Action required: one consolidated bounded correction order, then NEW immutable post-change report and required acceptance execution. No source repairs performed by validator.

1. Fix Ruff I001 in services/tts/tests/test_release_chatterbox.py. Correct five mypy errors without weakening assertions: test_adapter_layout.py:33 validate/narrow dependency __file__ before Path; test_release_chatterbox.py:339 type/narrow decoded fixture bytes; test_chatterbox_sources.py:102,116,205 use explicit subprocess exception references rather than non-exported implementation imports.
2. Restore the original `_copy_runtime_modules` I/O-error boundary at services/tts/src/voxleaf_tts/release_chatterbox.py:265-266: raw mkdir/write_bytes OSError must become ReleaseChatterboxError("chatterbox-package-staging-failed") from None. Preserve pre-resolved historical bytes/no fallback. Add bounded regression assertions for directory/write failures. The ignored probe makes runtime a regular file: prior unchanged `_copy_file` produces the fixed error, changed `_copy_runtime_modules` produces FileExistsError with the path. (The diagnostic substring boolean in supplementary.json is false because exception repr escapes Windows backslashes; its recorded message independently exposes the path.)
3. Correct host runner binding at apps/desktop/scripts/tts-adapter-layout-host.mjs:193-195 and dependent descendant checks/desktop child identities. Logical installed root is <LOCAL_APP_DATA>/com.voxleaf.desktop/tts/cb/3; native canonical root is <CODEX_PRIVATE_LOCAL_APP_DATA>/com.voxleaf.desktop/tts/cb/3. Record and verify this exact Windows package logical/canonical pair. Do not drop anti-link checks or permit arbitrary escaping aliases; validate roots and every descendant against the verified physical root, with exact manifests/models and no exemptions. Keep both logical and canonical identities when binding observed installed-v3 child paths. Add focused regression coverage of this mapping plus rejected arbitrary root/descendant links.
4. Canonical installed interpreter path has ZERO exact firewall rules; only logical installed interpreter path has one. Existing host reports did not observe an actual installed-v3 process ExecutablePath and cannot prove logical-rule coverage of the physical image. Before executing the corrected physical path, director must prepare/verify its exact canonical-program outbound block (if selected) and bind observed children to the verified pair. Preserve existing8 and task4 rules; task cleanup by exact names only. Validator does not mutate firewall.

This is a FAIL based on executed regressions, not a PASS with omitted gates. Source/artifact identity recheck itself passed. Earlier baseline PASS remains immutable historical evidence: current lint/type failures were absent there. Current preflight fails before inference; its host-path finding does not invalidate earlier read-only installed-tree byte verification. Required model/desktop/final gates remain explicitly unrun pending correction.

Evidence SHA256:

- before.json: a9c0304dff724c96cc37b12ab1fac4a536c65d4509741ac9185ee53764c49e92
- after.json: 18f8c29260e78341b5c16f4971d3221626e83e87eeff106f98c8eb832b341af7
- artifacts-before.json: 07e11daf0222247880a0975a5d47f1268e4430c00f4892a2f3daf6f57bd4999e
- artifacts-after.json: fd9e6e97064aee9d6f63a28e0cfa27d4e72cc7909ffdb61a689362e961879e41
- identity-recheck.json: 30d3ec31df8da01bd1b1dde21dd7fd01e128b2470596c9ffdbab1b723af1db73
- commands-01-12.json: df747b5cebc35e82a951dfc3966111ea056b5aaa7b321a4838030be2f55c4a99
- commands-extra.json: 24c6c1239624d1a5214cc6c9a4f90688bc747a5201e666b3a335f14965db4874
- supplementary.py: ef94180baddbb56476fb06d0e7067fad4c5f505c2d8b446ed1f919fc429d65f5
- supplementary.json: db200e980ba20c42ed7974feb97275d47d738bc7250ab1e99312cff4b31bebfa
- artifact-link-probe.mjs: c37c4a3bb75fbff4e4b9ce47c5ce3ee77dcfef655dc127f29ffec2e76cbd4022
- artifact-link-probe.log: cadfd59b1a4f01d050460126ba32676662959ff487df9fa73959816db04a1e99
- interpreter-path.json: 782aaf07b8b6f49ca2b412846ad769c499ce597038e746c6d81be80c241c6fc5
- firewall.json: f8287a94bf999960ccb208dcbc077670d6ca2d16d3cef293a55eedec743bc71d
- firewall-review.json: 66a8152dcae62b4fe3cc93c3d73b34b4fc4cef0e1638a28bd4b762c6a3f6ef5c
