# Validation Report
Report ID: TTS-ADAPTER-LAYOUT-01-HOST-PREREQUISITES-20261011-03
Target ID: TTS-ADAPTER-LAYOUT-01
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: closed 35-path accepted draft allowlist below; additionally rechecked 260 protected paths enumerated in both snapshots.
Validated path identities: before.json records every exact porcelain-v1 status, worktree SHA-256 and filter-aware expected index blob before commands. [] is empty exact status; ABSENT identifies a planned addition.

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

Identity recheck: PASS, all 35 validated and 260 protected identities unchanged before/after, HEAD unchanged, index empty. Before snapshot SHA-256
70ca1ea34a21a3826f591e8a510f99e4d1a63fcd40ac84c2c48ecc09fd0151b2
; after snapshot SHA-256
05fbf299c425bf9e0dbf6fda6af623664d8318cbb94264566254bf13af02784b
.
Commands and outcomes:
1. Get-NetFirewallRule -DisplayName 'VoxLeaf TTS Benchmark Offline' -ErrorAction Stop; each result passed to Get-NetFirewallApplicationFilter -> exit 0. Independently verified exactly one enabled Outbound Block rule for each of the three exact Program paths, with Profile Any and expected unique Name. Query results and explicit comparison fields are in host-checks.json.
2. Get-Service -Name mpssvc -ErrorAction Stop -> Running; Get-NetFirewallProfile -ErrorAction Stop | Select-Object Name,Enabled -> Domain, Private and Public enabled. PowerShell exit 0.
3. Get-FileHash -Algorithm SHA256 -LiteralPath tmp/evidence/tts-adapter-layout/firewall-setup-02/prepare-firewall.ps1 -> aa8aac12efd4f6529760729a9e938d8c4fa06f4ed09b0f6715e34668a00be583, matches supplied preparation identity. Preparation itself was director-owned and was not repeated by validator.
4. Get-FileHash -Algorithm SHA256 for installed cb/3/runtime-manifest-v3.json -> 470ec7e8a6fa1e91f9831e42de7988249220b51d4ecd4352452f3c70b2b6084a, unchanged from prior successful full-tree probe. No new runtime/model mutation or concern was reported or observed, so the 13,083-runtime-file plus six-model-file hash traversal was not repeated. Its earlier exact outcome remains in report 02 and is not represented as new execution.
5. git rev-parse HEAD; git diff --cached --quiet; git status --porcelain=v1 --untracked-files=all -- <each closed path>; Get-FileHash -Algorithm SHA256 -LiteralPath <each present path>; git hash-object --path=<path> -- <path> -> successful before/after capture; 35 validated and 260 protected paths unchanged. Absent paths were not hashed.
6. git diff --check -> exit 0.
7. Original baseline report hash and all its source identities compared unchanged: report SHA-256 8f31b3ba7ae976e3757c1ac677d483c0bd560a94d1b5ea55a51b2bc083307372; baseline reuse=true. The original ten-command PASS is consumed unchanged; those commands were not rerun or falsely reissued by this host-prerequisite report.
Diff scope: PASS, no source-unit changes; only separately owned docs/README.md, docs/plans/active/README.md, active plan and campaign evidence coordination appear dirty.
Invariant review: PASS for pre-migration host readiness. Missing exact-interpreter firewall prerequisite is resolved by independent live inspection; prior rules preserved. This is not model execution, v4 artifact admission, post-change acceptance or a complete desktop/runtime guarantee.
Test-integrity review: PASS, no test/gate/threshold changed; old development rules or offline environment flags were not used as substitutes. Previous test outcomes and the previous BLOCKED report remain immutable.
Privacy/artifact review: PASS, validator performed read-only host/source inspections and ignored evidence writes only; no source, generated authority, model, application data, Git or firewall mutations.
Action required: none for this bounded pre-migration prerequisite check. Director may evaluate work-order readiness using this report and the unchanged deterministic baseline. During later preparation, bind fresh artifacts and actual child interpreters, set required process-local offline flags, and run every frozen post-change gate.

Verified task-owned rules:
- VoxLeaf-Adapter-Layout-Test-0 -> C:/Users/mmjos/Desktop/workbeanch/voxleaf/services/tts/release/core/dist/voxleaf-piper-core-v1/runtime/python.exe; file exists.
- VoxLeaf-Adapter-Layout-Test-1 -> C:/Users/mmjos/AppData/Local/com.voxleaf.desktop/tts/cb/3/runtime/python.exe; file exists.
- VoxLeaf-Adapter-Layout-Test-2 -> C:/Users/mmjos/Desktop/workbeanch/voxleaf/services/tts/release/optional/chatterbox/dist/v4/voxleaf-chatterbox-v4/runtime/python.exe; planned file is still absent, as expected before implementation.
All have DisplayName VoxLeaf TTS Benchmark Offline, Enabled True, Direction Outbound, Action Block, Profile Any, and matching count exactly one. Each of the eight previously observed interpreter blocks remains present exactly once.

Lifecycle of host preparation: Keep task-owned rules during required runtime validation. After testing, cleanup must remove only the three exact recorded task-owned Names, plus any separately recorded later additions; never remove by shared DisplayName. A frozen-copy Piper child at another path needs its own verified exact-interpreter rule before executing that arm. Existing application installation remains untouched.

Report scope and freshness: This new report resolves the earlier firewall BLOCKED finding using newly executed host checks; it does not edit or replace hashes in either prior report. Deterministic baseline TTS-ADAPTER-LAYOUT-01-BASELINE-20261011-01 remains reusable solely because its exact HEAD and closed identities still match. Any future source/allowlist/artifact drift requires applicable new acceptance evidence. No post-change PASS or staging/commit/publication authority is granted.
