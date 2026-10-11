# Validation Report
Report ID: TTS-ADAPTER-LAYOUT-01-HOST-PREREQUISITES-20261011-02
Target ID: TTS-ADAPTER-LAYOUT-01
Mode: BASELINE
Verdict: BLOCKED
Environment: local PowerShell outside sandbox
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: same closed 35-path accepted draft scope below; 260 protected authority paths are additionally rechecked.
Validated path identities: pre-command closed snapshot is ../TTS-ADAPTER-LAYOUT-01-BASELINE-20261011-01/after.json, captured before these supplemental commands; SHA-256 17a91938f4d0d4293be69b242849afeea657c9592d8adf0ebacc145634a670dc. Supplemental before.json fixes command/script/helper/authority identity before the probe. No old PASS identity was refreshed.

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

Identity recheck: PASS, HEAD, 35 validated and 260 protected identities unchanged; index empty. Final closed-paths-after.json SHA-256
d3eb06208505afd94a7c3a190493d34d16fbfd460e9a1dc27bde469704bce2e7
. Script/helper/authority identities also unchanged; installed manifest bytes rechecked by probe.
Commands and outcomes:
1. services/tts/.venv/Scripts/python.exe -B tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-HOST-PREREQUISITES-20261011-02/inspect-installed-v3.py -> exit 0, PASS. Existing verify_package_tree verifies the exact frozen v3 manifest records plus six frozen official model records; 13,083 runtime files and all six model files pass size/SHA-256/exact closure and containment checks. Installed manifest SHA-256 470ec7e8a6fa1e91f9831e42de7988249220b51d4ecd4352452f3c70b2b6084a. This is a read-only explicit supplemental inspection, not a configured model test.
2. Get-NetFirewallRule -DisplayName 'VoxLeaf TTS Benchmark Offline' -ErrorAction SilentlyContinue | Where-Object { $_.Enabled -eq 'True' -and $_.Direction -eq 'Outbound' -and $_.Action -eq 'Block' } | Get-NetFirewallApplicationFilter | Select-Object -ExpandProperty Program -> PowerShell exit 0; 8 existing exact-interpreter programs. No matching named block for core/dist runtime/python.exe, installed cb/3 runtime/python.exe or proposed dist/v4 runtime/python.exe. Full results firewall-prerequisites.json.
3. Current WindowsPrincipal.IsInRole(Administrator) -> false. Get-Service -Name mpssvc -> Running. Get-NetFirewallProfile -> Domain, Private and Public enabled. Read-only inspection exit 0; no firewall mutation by validator.
4. Director-issued narrow New-NetFirewallRule capability attempt -> separately supplied receipt ../firewall-preparation-capability.json at campaign root reports BLOCKED, Windows System Error 5, Acceso denegado; created=false and removed=false. This is reviewed external execution evidence, not a command personally executed by validator.
5. git diff --cached --quiet -> exit 0 before and after; closed path/status/SHA-256/filter-aware Git-blob comparisons PASS.
Diff scope: PASS, source-unit unchanged; separately owned active plan and evidence coordination only. No source order, moves, staging or commits occurred.
Invariant review: FAIL for host readiness: established exact-interpreter outbound firewall prerequisite cannot currently be satisfied. Cached Piper integrity passed in separate immutable deterministic baseline; installed Chatterbox v3 and model closure now pass read-only verification. Hardware/runtime execution, fresh candidate v4 and desktop matrix remain untested, not failed or replaced by historical evidence.
Test-integrity review: PASS, no tests or gates weakened. Offline variables, old development interpreters and a differently located Piper firewall rule were not accepted as substitutes.
Privacy/artifact review: PASS, no installed-user-data, runtime authority, model, source or firewall mutation performed by validator; probe hashes existing files only and records content-free metadata in ignored evidence.
Action required: Before source migration, provide an administrator-capable PowerShell host or have an authorized administrator create narrowly scoped enabled Outbound Block rules for each exact actual interpreter under display name VoxLeaf TTS Benchmark Offline. Use unique rule Name values, preserve all existing rules, verify exact Program bindings and clean up only newly created names. Include future v4 and frozen-copy Piper paths when they exist; do not remove the user installation. Recheck host prerequisites under a new immutable report. No Approved Work Order may be issued while this prerequisite remains blocked.

Evidence distinction: TTS-ADAPTER-LAYOUT-01-BASELINE-20261011-01 remains PASS for its ten deterministic commands and original identities. This separate host-prerequisite BLOCKED does not change those outcomes or authorize edits. New source/artifact changes require applicable new validation.
