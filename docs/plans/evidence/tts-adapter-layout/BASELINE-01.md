# Validation Report

> **Sanitized publication copy.** Personal paths are redacted; report IDs,
> results and validation hashes retain their historical meaning.
> Original SHA-256: `91318f776e2dd4258890b8e8746d786c3fac3f98bd42b61f31f0a8aff3680079`.
> See [publication and original retention](../historical-privacy-cleanup/README.md).

Report ID: TTS-ADAPTER-LAYOUT-01-BASELINE-20261011-01
Target ID: TTS-ADAPTER-LAYOUT-01
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: closed 35-path accepted draft allowlist below.
Validated path identities: every before-command identity follows; status [] means exact empty porcelain-v1 output. SHA-256 and filter-aware expected index blobs are lowercase. Planned new paths are ABSENT.

| Path | Exact porcelain status | Worktree SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| services/tts/src/voxleaf_tts/piper_adapter.py | [] | 78c335d25979165213a86c7fb0f4f95d2f2620b8ff7cc56279f1f2b823174020 | d9f468c0953f71ffcaf208e6bfdebfd1a9bf59f3 |
| services/tts/src/voxleaf_tts/chatterbox_adapter.py | [] | f7fd0e9f745954dbe5881a5428972793f619335a643a7d3b768368a6fdca707e | 37bc2d9d23881f98456971a669be38a5e4499d67 |
| services/tts/src/voxleaf_tts/qwen_adapter.py | [] | c2559cac02400ac96f4f17397ca56bbbb787c33cd4c5a1c2d02a3992ae1853c1 | ff5eff7404dfeec544c79a20943ac2a0ab7429c7 |
| services/tts/src/voxleaf_tts/fake_engine.py | [] | 7a79f01a35a74ccdc0a08217e612f7e12c98cfabad58dde5e94ea84486791760 | 69e1ab744e390e1183ad88f29c2bd17e8094ad40 |
| services/tts/src/voxleaf_tts/adapters/__init__.py | [] | ABSENT | ABSENT |
| services/tts/src/voxleaf_tts/adapters/piper.py | [] | ABSENT | ABSENT |
| services/tts/src/voxleaf_tts/adapters/chatterbox.py | [] | ABSENT | ABSENT |
| services/tts/src/voxleaf_tts/adapters/qwen.py | [] | ABSENT | ABSENT |
| services/tts/src/voxleaf_tts/adapters/fake.py | [] | ABSENT | ABSENT |
| services/tts/src/voxleaf_tts/service.py | [] | 5f64cfe8ff6960ec11a704ab44d5ad5a46d51ae32d57a6dff8c08e54d2389d12 | 9ead3cb9b957102262563ff2d2db47da3ba6e799 |
| services/tts/src/voxleaf_tts/piper_service.py | [] | fb2c893f88c0ace04d16d7bcfb81df735746d4ab4e97ba5e5aaf68c9ab67a747 | d7370b4e0dd92c88adbe0e27bc159b694cbdd471 |
| services/tts/src/voxleaf_tts/chatterbox_service.py | [] | feedf00f006699fea7fae2bed1d5192709be2e8b124ac48339bc99b44b284727 | 34138d0195a77d4fb591599cd58cb95dfd21c264 |
| services/tts/src/voxleaf_tts/qwen_service.py | [] | dce03cfae94dbf1e3144527fd3eefd5f9338147449e71989d635cae15f128e61 | d62464ed7fd536f291485df0fabdb1447955e8ae |
| services/tts/src/voxleaf_tts/release_core.py | [] | 5d9e66a7707a9afacec13d65157fc82ca1fe69ec5ab27de2b3addf7d2b1ac8ed | 4840c9933ede7fef5f677e07b8406a1cb25fef1a |
| services/tts/src/voxleaf_tts/release_chatterbox.py | [] | 1ec1469437a0169e091ee1b9194f0ee88339afe902204142302fc18b64f9a292 | 1b3277d79d40c06b6d1a0573784a55eaa6556f03 |
| services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py | [] | b049a1d728e89f8130a2631ec4d4332cc3efeb008b1b83a6b79dbde0efdc8f90 | b110fdeb1ceb0faca89f0c9cfcc7ea38d1c42826 |
| services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py | [] | 3c3c68b0f6e6106b17e561805e338a9713b129bbd4083ba7dc465ffb4e99b131 | 96af00265056df17bc6e5e51046f49f398f793a1 |
| services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py | [] | ABSENT | ABSENT |
| services/tts/tests/test_piper_adapter.py | [] | aecf484e915de54465d23e7fb01d891ad247a8eb2477346b5263aeb36eb62a3c | 8b69d382ca21efa23322c3b57953efb4655762e3 |
| services/tts/tests/test_chatterbox_adapter.py | [] | 2e00790f3c132c4ccf4c5636548e48252cfb8cbf15855853fa14f7eff00a36ba | e0954e5f4f5b446a971a7d4b3b66be59593c0ef8 |
| services/tts/tests/test_qwen_adapter.py | [] | 792240e7bced31754f7e2c517056ec06d1906056dd0a6196d34059a822f347c8 | a35d489a8134517dc9b1d05fc1b5412059132b5e |
| services/tts/tests/test_service.py | [] | 749e489cd3a1e7856a04e588f85539080091dc2cd403935e8d66b82cee7e1165 | 080d3ed06e4104fa156f9fe3dd09c3bdea510fdf |
| services/tts/tests/test_release_core.py | [] | 2eb300602db114f731a62d10bb66603f67ceee243e017033c7a687fd71fbcd29 | 47ab1a75c29f9cbd83949a2a1327e23c3ba0dad5 |
| services/tts/tests/test_release_chatterbox.py | [] | 7c3aec6f05ac6db2474704f78edc98e1b8b523b902efaf95b74c0c9280eadadf | 15a5b1b0b3454b15bee158422aa8f55d09750e6c |
| services/tts/tests/test_chatterbox_sources.py | [] | ABSENT | ABSENT |
| services/tts/tests/test_adapter_layout.py | [] | ABSENT | ABSENT |
| services/tts/release/core/runtime-manifest-v1.json | [] | 3f1a2d311a5f7a857cb95402f3dbc187d42c5878c4208c9ebd12cb3b4dc7a27c | c484dc4b45d0a0f233b45dc54693e7028100af5f |
| services/tts/release/core/core-package-evidence-v1.json | [] | 45728bd5630fed5c35a1eeac0d4de239a1e743f4c304aec694eda0639d975670 | e6a8fab7b1bbf25067f173bb81a6f266aba5a63e |
| services/tts/release/optional/chatterbox/source-manifest-v4.json | [] | ABSENT | ABSENT |
| apps/desktop/src-tauri/release/windows-package-evidence-v3.json | [] | bc186871b522acba69f8a6247281f0f2acf1d761389eb53a8676f68311e7cf5d | b44b7b9a57d78d300ce58cfeec6ea4a3e0940334 |
| apps/desktop/scripts/tts-adapter-layout-host.mjs | [] | ABSENT | ABSENT |
| apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs | [] | ABSENT | ABSENT |
| apps/desktop/package.json | [] | efc75f0428ac8568a4f6dcf80f992d2cba6d4395ecc488b7aa7201867004023c | fc3b67518a37089175bbbade94b22835de350bd4 |
| package.json | [] | 7c015609258627fba048ed79e249582d12fbd64d20bb113a8860f9d1c4a7737f | 695f790d4f30dc17161109b1a51401f1d0ab1e6b |
| docs/development/tts-service-organization.md | [] | e9e0a89ba8fb2911a3291c3c305d165e27bb0445a4faef20eb14ddbcf9f29398 | c6ec5292bebf377d03d49cee6a64dbc5a529cdee |

Identity recheck: PASS, all 35 validated identities and 260 protected tracked identities match before/after; HEAD unchanged and index empty. Protected closure is explicit in protected-paths.json and both snapshots. Before snapshot SHA-256 21245c5c50fc48f678894ddb83f2b56396968e36058a9e7731a8d4ef6121ea01; after snapshot SHA-256 17a91938f4d0d4293be69b242849afeea657c9592d8adf0ebacc145634a670dc.
Commands and outcomes:
1. pnpm.cmd format:check:python -> exit 0; 170 files already formatted. Proves Python formatter compliance.
2. pnpm.cmd lint:python -> exit 0; all checks passed. Proves configured Ruff lint rules.
3. pnpm.cmd typecheck:python -> exit 0; no issues in 167 source files. Proves configured strict Python static types.
4. pnpm.cmd test:python -> exit 0; 457 passed in 15.51s, one PytestCacheWarning: cache/nodeids could not be written (permission denied). Proves executed deterministic assertions; no assertion failure.
5. pnpm.cmd build:python -> exit 0; built source distribution and voxleaf_tts-0.0.0-py3-none-any.whl. Proves maintainer package build only, not isolated runtime execution.
6. pnpm.cmd package:piper-core:check -> exit 0; piper-core-release:current. Existing cached runtime tree, tracked manifest, archive hash, sizes/counts and evidence match. Does not rebuild or run the model.
7. pnpm.cmd package:chatterbox-optional:check-source -> exit 0; chatterbox-optional-source:current. Historical v2 source recipe accepted.
8. pnpm.cmd package:chatterbox-optional:check-acquisition -> exit 0; chatterbox-official-acquisition:current. Historical v2 acquisition/evidence authority consistent.
9. pnpm.cmd package:chatterbox-optional:v3:check-source -> exit 0; chatterbox-optional-source:current. Current v3 source recipe accepted.
10. pnpm.cmd package:chatterbox-optional:v3:check-acquisition -> exit 0; chatterbox-v3-acquisition:current. Current v3 source/publication/acquisition/evidence authority consistent. Does not hash installed runtime or run the model.
11. git diff --check -> exit 0; no whitespace errors. git diff --cached --quiet -> exit 0 at start and end; exact allowlisted status empty at start.
Diff scope: PASS, zero source-unit changes; all 35 paths begin and end clean (24 present, 11 ABSENT). Only separately owned active-plan/evidence coordination changes are visible.
Invariant review: PASS for unchanged baseline and reviewed deterministic coverage. Adapter suites assert frozen versions, voice/generation settings, provider/admission failures, bounded 24-kHz mono output, identity-bound cancellation, content-free failures and lazy optional imports. Service suite asserts ordered single-unit output, busy rejection, zero retained audio, cancellation/late suppression, malformed-message rejection and stable subprocess entrypoint. Release suites assert exact closure/tamper rejection, canonical manifest hashes, fixed v2/v3 authorities, helper exclusion and staging failure preservation. No proposed move/resolver/v4 behavior exists yet.
Test-integrity review: PASS, six related suites are unchanged and behavioral assertions remain active; 457 complete Python tests passed. No snapshots or tests edited.
Privacy/artifact review: PASS, no prohibited or unrelated file entered the source-unit diff; only ignored maintainer distributions/test caches/raw evidence were written by allowed commands. Historical authority, generated contracts, selected locks and completed-plan identities are unchanged.
Action required: none for deterministic baseline. This PASS does not authorize implementation until the separately required host prerequisites are resolved and the director freezes the work order; it does not authorize Git mutations.

Evidence limits: no real-model load/audio, installed-v3 full-tree check, network/firewall enforcement, package-isolated service run, desktop lifecycle/playback/synchronization or performance claim is established by these ten commands. Existing cached Piper is verified, not freshly assembled. Fresh v4 does not exist. Host prerequisite findings are recorded separately; in particular exact packaged interpreter firewall blocks are missing and this host token is not Administrator.
Execution detail: repository root <REPO_ROOT>; PowerShell commands were launched with require_escalated (outside managed sandbox); process-local PATH prefixed C:/nvm4w/nodejs/node_modules/corepack/shims, selecting pnpm 11.15.1. Commands ran sequentially with no source writer active. Raw output command-01.log through command-10.log and UTC timings in commands.json.
