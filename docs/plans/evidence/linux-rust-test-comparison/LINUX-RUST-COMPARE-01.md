# Validation Report
Report ID: LINUX-RUST-COMPARE-01
Target ID: LINUX-RUST-COMPARE
Mode: BASELINE
Verdict: BASELINE-FAIL
Environment: local PowerShell outside sandbox; director-executed WSL Ubuntu 24.04.3 x86_64 gates, independently reviewed by the retained validator. Rust/cargo 1.97.1, Node 24.18.0, pnpm 11.15.1. No validator test reruns or repairs.
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: the 39 explicit paths below; supplementary full Linux input manifests cover all 912 baseline and 923 current files. The missing PNG is an ABSENT observation, not an approved addition.
Validated path identities: current-review before.json and after.json contain exact status, raw SHA256 and filter-aware blobs. Command-time provenance comes from original-worktree.json, the full HEAD archive, pre-command Linux input manifests and both post-command SHA256 rechecks. The review snapshots are explicitly after execution, not fabricated command-time captures. All 26 native hashes match original-worktree.json and every status/hash/blob matches the accepted NRTL-FINAL-01 identities. Repository command metadata/configuration equals HEAD. The complete original porcelain list is unchanged.
Identity recheck: PASS. HEAD, index, path identities and porcelain are stable. Fresh independent Linux reads match both pre-command manifests exactly, including path sets after excluding node_modules and generated Tauri gen directories; no unexplained new input paths. Copied logs are byte-identical to Linux originals. No native or workflow edits.
Commands and outcomes:
1. In each complete-02 snapshot, `pnpm install --frozen-lockfile --ignore-scripts` completed successfully; repository lockfile/input bytes stayed unchanged.
2. In baseline and current, `pnpm format:check:rust` -> 0.
3. In baseline and current, `pnpm lint:rust` -> 101 in default-feature compilation. Its chained release command was skipped by `&&`.
4. In baseline and current, `pnpm test:rust` -> 101 before any tests executed. Its chained release command was skipped by `&&`.
5. In baseline and current, supplemental configured command `cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets --features release-locked-runtime -- -D warnings` -> 101.
6. In baseline and current, supplemental configured command `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime` -> 101 before any tests executed.
7. Both input SHA256 rechecks per snapshot passed for every input; independent full archive/tree, literal-include closure, live path-set/hash checks and `git diff --check` passed. Index remains empty.
Diff scope: PASS. Full archive contains exactly all 912 tracked HEAD files with matching Git blob content and embedded HEAD. Current consists exactly of that archive plus the 26 captured native files (923 total). Only the approved 21 native path changes distinguish snapshots. Original repository status is preserved, including prior accepted unstaged refactor/documentation. Workflow is unchanged; no conditional CI job was added.
Invariant review: PASS for verified source/input preservation; Linux execution acceptance is not established. All 41 baseline and 43 current literal includes resolve, including schemas, generated Python and benchmark locks omitted from the rejected partial attempt. The complete main.rs, Tauri configuration, tracked ICO/SVG icons and the literal configure_supervised_child function body are identical to HEAD. PNG is absent in HEAD and both snapshots. Both configurations produce identical diagnostic tails after normalizing only snapshot root paths; dependency compilation prologues differ due to cache reuse.
Test-integrity review: FAIL for required execution evidence. No Rust test harness, test-name/result line or assertion ran in either feature configuration. Neither `tts_optional_chatterbox::tests::transient_numba_cache_rejects_a_symlink_outside_the_package` nor `tts_optional_chatterbox::tests::installed_package_root_rejects_a_symlink_outside_the_managed_root` has Linux success evidence. The four approved contract namespace changes remain the only permitted mapping for a future successful comparison, but no runtime name comparison is possible here. Do not infer any test or assertion PASS from compilation failure.
Privacy/artifact review: PASS. Only tracked repository inputs and approved source overlays were compared. Bounded toolchains, dependency installations, build caches and logs remain temporary; node_modules/Tauri generated files are disclosed exclusions from final input path sets, while every original input is still hashed. The first partial-archive run was interrupted and is excluded from authoritative evidence because its include closure and package metadata were incomplete. No private books, models, generated narration, source repairs or Git mutations were added.
Action required: A separately authorized minimal Linux build-compatibility follow-up must provide a valid Tauri Linux default PNG icon (or an explicit valid icon configuration) and make configure_supervised_child's parameter use valid under non-Windows cfg without weakening warning policy or Windows behavior. Then rerun both feature configurations and require both Unix symlink tests to report ok before adding CI. These pre-existing blockers do not establish a refactor regression; they also prevent acceptance of the Linux comparison.

## Verified pre-existing diagnostics

- `src/main.rs:54:16`: `tauri::generate_context!()` panics because `icons/icon.png` does not exist. This is the blocking error for cargo test in both feature configurations and snapshots.
- `src/tts_service_supervisor.rs:89:31`: `configure_supervised_child(command: &mut Command)` uses `command` only under `#[cfg(windows)]`. Linux reports an unused variable; Clippy's existing `-D warnings` makes it an error. Cargo test reports the same condition as a warning alongside the missing-icon error.

## Exact validated path identities

- `.github/workflows/foundation-checks.yml` | status `clean` | SHA256 `9c0f51980c092804eb4ca7a33c68908e841cd943a0d13835eb0957c0c7c63bbd` | blob `fa44fe423f78d4ff5a6187a6630bd64bd864ba0c`
- `.nvmrc` | status `clean` | SHA256 `55075b5ec4e8b31936cbbc282b8829116d1fd48f2f2f1856dee592a6650700ce` | blob `ca5c350055ccb6dacb495a786f60c8232abed8f2`
- `apps/desktop/src-tauri/Cargo.lock` | status `clean` | SHA256 `7646582545047fea31396692fa800ebcbacb12efef3b727b75a6c301d4dae1e2` | blob `4d94615954d88098822983c3ed55d9d949a3c046`
- `apps/desktop/src-tauri/Cargo.toml` | status `clean` | SHA256 `98076653b33d485837aa7ce81b62f650ec12f48b83342f0d7c8d399577333f51` | blob `f06da800939c1867e0d69b6ec6d55b9a13206587`
- `apps/desktop/src-tauri/build.rs` | status `clean` | SHA256 `6aeeab41bc35efde4e3c2b644a6248f7fc06d24ae30b75c0d33491cbb0c1fa31` | blob `261851f6b60e0ae6f244b5469289870facc8c997`
- `apps/desktop/src-tauri/icons/icon.ico` | status `clean` | SHA256 `d2fdf6e9b1f1c4f5f594cacfefc40c487b9818b77a94a4773c481a999febffa4` | blob `bff52e072605b5a3dd87fda407bf97dbac54a56f`
- `apps/desktop/src-tauri/icons/icon.png` | status `clean` | SHA256 `ABSENT` | blob `ABSENT`
- `apps/desktop/src-tauri/icons/icon.svg` | status `clean` | SHA256 `9338aaa934f51da89d8cd981829a007b42799e37e37a3276a6d8860f873253e3` | blob `4322a82a580d124301aa68f66d04c45171e9fc93`
- `apps/desktop/src-tauri/src/diagnostics/cli.rs` | status `clean` | SHA256 `38281c0ffec327ff94b0bac8b03d4996dcc53c8db87dc105b2cf75a1ac572a4a` | blob `b12c4ebe1f05e8b8d743b37d53447e75e29c1426`
- `apps/desktop/src-tauri/src/diagnostics/mod.rs` | status `clean` | SHA256 `ec71a68d0320ab467b16b2955ee63b621a2d1bcb7d40b53303cf9439b02fae52` | blob `42e8dd69f38410ba80a99da5b42acfe9a9439e2e`
- `apps/desktop/src-tauri/src/hardware_profile_authority.rs` | status `clean` | SHA256 `9bab30b92ca1ffa7be9acd59ad55328846d4a2da40480f91a234fcfce8b4b069` | blob `14b798efe3bb36e6b1d16d96a19f4468150413b7`
- `apps/desktop/src-tauri/src/host_profile_detection.rs` | status ` M apps/desktop/src-tauri/src/host_profile_detection.rs` | SHA256 `dea38d7bcd326cecd10061fff371c95513bebca4e518c3cd438c476997589551` | blob `a4c264a24f60ac1384d32366e445b02958cc358f`
- `apps/desktop/src-tauri/src/host_profile_detection/tests.rs` | status `?? apps/desktop/src-tauri/src/host_profile_detection/tests.rs` | SHA256 `9b7c555b379fd00699ae93ed218395b16797022b73a1a850f85139422fa3318f` | blob `aaebd07b3dd9c7700bfe3c90cfd86396eaaa3884`
- `apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs` | status `?? apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs` | SHA256 `6c8edee5637c864caa31a54ef813845d26e080e6387907ff4df72b136eb8d60e` | blob `466c6c5658c1af8cb9c84eeefa1b204256250830`
- `apps/desktop/src-tauri/src/main.rs` | status `clean` | SHA256 `0005ae37462873acd98477c22d525920c52b9f7d4f9013734c665d6566596682` | blob `8a055c4ff4454f186210903b1493bff35b7ce19a`
- `apps/desktop/src-tauri/src/sha256_hex.rs` | status ` M apps/desktop/src-tauri/src/sha256_hex.rs` | SHA256 `6d78277864124209819a3038c675238652e1ebe8a4497ee09b02c18849d1b060` | blob `6d5493ebf6414cfd9c11fb8cd908915f1a08feee`
- `apps/desktop/src-tauri/src/sha256_hex/tests.rs` | status `?? apps/desktop/src-tauri/src/sha256_hex/tests.rs` | SHA256 `ebb0c5f415220af07b2144e092b2482f2c770149ce101242a690b80265e148f0` | blob `38da5d9f870d3999a1109c1899a70f112d40000b`
- `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` | status ` M apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` | SHA256 `e525734297ce7cf8b437e5fc50b75a9f6d680ca6fc56707ee36acae5caf45ecf` | blob `8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513`
- `apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs` | status `?? apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs` | SHA256 `e0c1dad918fe95b11ed38d8739a16650ee27fefe3c7beaa6d0212b9e2059d8df` | blob `2cf45dc8c74b27a4a68b12dd2c0cc904045df7b2`
- `apps/desktop/src-tauri/src/tts_protocol_contract.rs` | status ` M apps/desktop/src-tauri/src/tts_protocol_contract.rs` | SHA256 `83045e9cbec1143045c05e73694befde77d4cc46c4f94eeaca458d0e0e9b5a8b` | blob `44cf4923acd0dc7d6adeb921506d2198c292fd8f`
- `apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs` | status `?? apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs` | SHA256 `bb2685f787aedad277f7221c7fe10effdf7221240ef6e34ef3f29ef8ab18ac74` | blob `576cb3627466ba3848aab1850e8a9823325ae0f7`
- `apps/desktop/src-tauri/src/tts_protocol_probe.rs` | status ` M apps/desktop/src-tauri/src/tts_protocol_probe.rs` | SHA256 `34d4ef0d6aa747da044610511b7b3520d6f213b28107efd4c8f45976e1414e5c` | blob `4338baa436e10a40388b440e52140c634dd126eb`
- `apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs` | status `?? apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs` | SHA256 `91fff29d071c9e271e991c7abfa0e62ccb7b30a0393e22e68508d5e85e9368bc` | blob `6c3b777880b4e79f17537ebb8581cc4d28bec2f9`
- `apps/desktop/src-tauri/src/tts_release_core.rs` | status ` M apps/desktop/src-tauri/src/tts_release_core.rs` | SHA256 `d7d7a341729c67343c316a7d36f78ba0dc7fba522af9031e3a89b118b685e1ad` | blob `f9ef9cfea3ec7afe3c4a999da5d5a0e42a990756`
- `apps/desktop/src-tauri/src/tts_release_core/tests.rs` | status `?? apps/desktop/src-tauri/src/tts_release_core/tests.rs` | SHA256 `b4d7f0f79cb08c81b0127bba034946048cf3a1164135e47e36a7b3ecaa62318a` | blob `9d6485ee26632f7e91b04640748089b04b9509f0`
- `apps/desktop/src-tauri/src/tts_service_fake_child.rs` | status ` M apps/desktop/src-tauri/src/tts_service_fake_child.rs` | SHA256 `59656ca25b6a061f0722eb01ed956028d80b8ff4f2aa3ea3ea05f51394a65448` | blob `223971a920f818f3b84390ce2a3cf39cd520863f`
- `apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs` | status `?? apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs` | SHA256 `0819bbfb4eb4aa6092ad75556eec77270af84650f8dfffc15a40f7a9f67d0c03` | blob `7b757f57abfccffec3d0631ad4da90accd81343c`
- `apps/desktop/src-tauri/src/tts_service_handoff.rs` | status ` M apps/desktop/src-tauri/src/tts_service_handoff.rs` | SHA256 `e76299179970234f314d2329149c75e251c3d24750f11aabaad27e1b12a8dbc7` | blob `b1f113330b9e10e829aa1af71c610d61e47415e5`
- `apps/desktop/src-tauri/src/tts_service_handoff/tests.rs` | status `?? apps/desktop/src-tauri/src/tts_service_handoff/tests.rs` | SHA256 `0fd5e6ebdd3b5ed2b84272ff844db119d9c9d420a872ee2d6bb030ab81a279a6` | blob `41f743fb886449e3488062b330e26d9d5f38e0fd`
- `apps/desktop/src-tauri/src/tts_service_protocol.rs` | status ` M apps/desktop/src-tauri/src/tts_service_protocol.rs` | SHA256 `a8895ec9f5c569569c5cc37de451d37304822731e565c94a1665d080ce426617` | blob `d3fac47c4985d6cc6ac0e5663fc971d506a2cc49`
- `apps/desktop/src-tauri/src/tts_service_protocol/tests.rs` | status `?? apps/desktop/src-tauri/src/tts_service_protocol/tests.rs` | SHA256 `245872478d849a4084e4005a75f60203df8b18b3cca23c06148d0f733ec046c1` | blob `52c719dc1dae467c8dd68398ecb2154946079d42`
- `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | status ` M apps/desktop/src-tauri/src/tts_service_supervisor.rs` | SHA256 `c153948b3681d2f5538053c62e247c221ecbe8d3950b0132924f6ce51d53c5dd` | blob `aed2d4cc6544428b5e76d80e7465d5549fc6a2d6`
- `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` | status `clean` | SHA256 `3ecfd77675db84bd9a1f98738a43bb095a9a54ad1dbd22ef928fbc12d2edea5d` | blob `86f0a71a3f392eb0874798cd17f0f2ca94f84fac`
- `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | status `?? apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` | SHA256 `853e06deec2013d72696f893d15aba86f2baeedb08236130b85e2c5e0d62754b` | blob `1099ae86295ff062b4574c5845701dcd1d6e1ad4`
- `apps/desktop/src-tauri/tauri.conf.json` | status `clean` | SHA256 `b76a7342c6ce9918bb499ddd50f4910667d50cf5dda564e3103ab8d56a99191a` | blob `086ffec207c95af2fef00c7726a3728d94279bbf`
- `package.json` | status `clean` | SHA256 `e6379f70af6253a0336a526db74444ee476171573bd7a4efa391f582df476135` | blob `017134a0eda40c9ac98ee70b398f7671eafb1553`
- `pnpm-lock.yaml` | status `clean` | SHA256 `62fe4936057df421e7264705be1941b60cc7a6513022a163285bae777f311701` | blob `5c737dc60edadb2d5ae0a8d8acf345bb943db9a3`
- `pnpm-workspace.yaml` | status `clean` | SHA256 `efb8ff9911192e80897352cbacccc0cb1d53ef130b64bb98f813c973694f5363` | blob `b6615e1277536c992be3a14cdaa04235a1117330`
- `rust-toolchain.toml` | status `clean` | SHA256 `dafae8f49387948ae1527c41c6b846acc184b10205eb41719dc5835e38d0f9d1` | blob `a791afad1d99f9b6411e2409008fa21ee8189034`

## Evidence files

This immutable receipt is accompanied by before.json, after.json, checks.json and diff-check.log. checks.json retains all ten gate exit records, normalized diagnostic tails, full snapshot input hashes/path sets, 41/43 resolved includes and copied-log hashes. Raw command logs and both TSV files remain in ../complete-02-evidence/. No Linux success, CI execution, distribution support, staging, commit, push or PR is claimed.
