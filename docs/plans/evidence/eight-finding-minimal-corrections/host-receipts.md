# EFC host receipts

Original receipts remain immutable in ignored local evidence. Exit 1 in directed red gates is the expected pre-fix result; later fixture/tool failures are retained and diagnosed in the ledger. Commands run from repository root in normal local PowerShell with the pinned tool PATH.

| ID | Exact command | Exit | Receipt SHA-256 |
| --- | --- | --- | --- |
| G0-packages-final | `pnpm.cmd build:packages` | 0 | `23ecd0d7e74c8e828f29dc040716244549f3ffb0b44b0bb5bf03fba8f68f283e` |
| G0-packages | `pnpm.cmd build:packages` | 0 | `943cd5d712aee90428f60a72794d4081d52f1b64d2d0fe8c7d3f232181d92171` |
| G0-verified-assets | `uv run --project services/tts --locked python tmp/evidence/eight-finding-minimal-corrections/verify-assets.py` | 0 | `2bb55ae3813c8c0d326c9c4281aa05555cd42c8156fc89a4eb81d65d34f58837` |
| G1-desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/active-visual-locator.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/hardware-profile-matcher.test.ts -t EFC-` | 1 | `1cc0d335e7ee66ac47f64fca6b3e552b8e85a423806e8a823200a70613647d55` |
| G1-epub | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/paths/archive-path.test.ts src/paths/ocf-reference.test.ts -t EFC-` | 1 | `d15c554981e61faa99ff20bd95c698c23726b21a7867e3fab1dfa4f805d74a95` |
| G1-python | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_qwen_adapter.py services/tts/tests/test_protocol.py services/tts/tests/test_service.py -k efc_` | 1 | `fbad6cd132119b9c13e8ff0ac8671139e728bd23048294dcfc14202c87fe48c3` |
| G1-rust-default | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml efc_` | 101 | `d33e4935de876b510c582a53e1e0d93de805bba38f6d621587c37d172729aa1c` |
| G1-rust-locked | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime efc_` | 101 | `ef79c77ce886fe2f37f4375af4bd0a405e4fe50339f01f0d3ed2d328768fd12b` |
| G10-evidence-final | `pnpm.cmd check:evidence` | 0 | `af76a041d56b6c0b764db723ea9136b3cc895be00c05bb70df25db79cacb2cff` |
| G10-evidence | `pnpm.cmd check:evidence` | 0 | `1dca189a6d02f74f7da7b961f8328633a0dabe8320fd477eee6df2d429ceee25` |
| G10-links-final | `uv run --project services/tts --locked python tmp/evidence/eight-finding-minimal-corrections/check-doc-links.py` | 0 | `51c1495702b7165c4a10ea89a996e75e9e9720f105d905d635354f5ee3d48c10` |
| G10-links | `uv run --project services/tts --locked python tmp/evidence/eight-finding-minimal-corrections/check-doc-links.py` | 0 | `f9a06d8423a939913b2714ede81a245902ed34985734c36c81af642e9e25eef2` |
| G10-whitespace-final | `git diff --check` | 0 | `1862589cd2f3ac8973721407e314ae3e1f1dd6dc6f98dd6bdfd1913284a9582c` |
| G10-whitespace | `git diff --check` | 0 | `e98cea6aa86de84f0a9f24d690934d999fe84689fd88da05239aa60b87d613c1` |
| G2-format-browser-fixture | `pnpm.cmd exec prettier --write apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts` | 0 | `b32228637910fd4debc06f2bce020bb1daefbbf95203ccac74024e2162c7227b` |
| G2-format-corrected-tests | `pnpm.cmd exec prettier --write apps/desktop/src/tts/hardware-profile-matcher.test.ts apps/desktop/src/tts/OptionalChatterboxControls.test.tsx` | 0 | `bef6997e08c8c364cb5d08a33e90e305eded99943eea103b87e6fb304d922d18` |
| G2-format-edits | `pnpm.cmd exec prettier --write apps/desktop/src/reader/active-visual-locator.ts apps/desktop/src/reader/active-visual-locator.test.ts apps/desktop/src/tts/OptionalChatterboxControls.tsx apps/desktop/src/tts/optional-chatterbox-client.ts apps/desktop/src/tts/optional-chatterbox-client.test.ts apps/desktop/src/settings/ReaderSettingsDialog.test.tsx apps/desktop/src/tts/hardware-profile-matcher.test.ts packages/epub/src/paths/archive-path.ts packages/epub/src/paths/archive-path.test.ts packages/epub/src/paths/ocf-reference.ts packages/epub/src/paths/ocf-reference.test.ts` | 0 | `ca86377c3de3517771af36ad343cf0c616e90e30e30d842e7ba7f2fcc187bde6` |
| G2-format-final-edits | `pnpm.cmd exec prettier --write apps/desktop/src/reader/active-visual-locator.test.ts apps/desktop/src/tts/optional-chatterbox-client.test.ts apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts` | 0 | `0b5a3a549a3c87df1b78fb191abf72e9ff3ced1472ff328ba632eb9392e0eea4` |
| G2-format-python-edits | `uv run --project services/tts --locked ruff format services/tts/benchmarks/dual_worker_runtime.py services/tts/benchmarks/isolation.py services/tts/src/voxleaf_tts/adapters/qwen.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_qwen_adapter.py services/tts/tests/test_protocol.py services/tts/tests/test_service.py` | 0 | `7d12c890d466b6f5c259297041cb2fdab6e4de825cdeb9c8625e0d2bcd52a3ee` |
| G2-format-python-final-edits | `uv run --project services/tts --locked ruff format services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_qwen_adapter.py` | 0 | `31fdd7d807fc34d27f9c67b6c540b79df6e93c3957c35a058aa52f92294d10f0` |
| G2-format-python-final | `pnpm.cmd format:check:python` | 0 | `b6a8a7a3f703aacaed8ff998e2fc181412a5ab07d315ed0ebf22ef382ba948ca` |
| G2-format-python | `pnpm.cmd format:check:python` | 1 | `065b2a12e2f62ee8a33cba04a60a7ed01b978487336228dbd0e678b15041dda7` |
| G2-format-reflow-correction | `pnpm.cmd exec prettier --write apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts` | 0 | `c3650919b719cd1fc245bb68d71626e227256f19b38949f61a0c55a93f28234e` |
| G2-format-runtime-correction | `uv run --project services/tts --locked ruff format services/tts/tests/test_benchmark_dual_worker_runtime.py` | 0 | `e75bf338c28d7c4a5ea9c5b0cb03970897910e6bcce1cc04a1446dc88e6a4207` |
| G2-format-runtime-test | `uv run --project services/tts --locked ruff check --select I --fix services/tts/tests/test_benchmark_dual_worker_runtime.py` | 0 | `cb444ba0ededa5aea5d7e883c822248231bd9bd8732478d84f5da88edbf2518b` |
| G2-format-rust-edits | `pnpm.cmd format:rust` | 0 | `51c772dbd84f403eb73676515a9e1c38c071e5987c1511408939149ed4cafb67` |
| G2-format-rust | `pnpm.cmd format:check:rust` | 0 | `4b09c12bb96401649d96bc28a28a4527bf8332695839cc27ea401e1d33f220da` |
| G2-format-ts-final | `pnpm.cmd format:check:typescript` | 0 | `cca94194324d58146524d9ddbfc86f8c51262f2520d19f5e459a656d19adeddf` |
| G2-format-ts | `pnpm.cmd format:check:typescript` | 1 | `eac6c0ac45303507e1d6b8576db9015fe663a5eb898ae3d845607e6437cdb8e5` |
| G2-lint-browser-final | `pnpm.cmd exec eslint apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts` | 0 | `e9b8d2dcd7b87ac9603d77790753bf1e55516b3c85154408f92bfb9af4d42280` |
| G2-lint-final | `pnpm.cmd lint:typescript` | 0 | `f3e5f4287a3f38014703456217bf4a90ec1f9ecc39ce9d3a532682d9cb09b59c` |
| G2-lint-python-final | `pnpm.cmd lint:python` | 0 | `6e4da48f8ec424c75f808a4ba6cc6d34a912be9acb94c8e2e593d60a00530ba9` |
| G2-lint-python-last | `pnpm.cmd lint:python` | 0 | `d9ee0a0edf4e8ce291c57fcf5083c23d6f68769a9c5b4563ec21396c1e8c9319` |
| G2-lint-python | `pnpm.cmd lint:python` | 1 | `106f6dcef17ca16da4d9210e933c2899d7f5647c3102b270c9e7f38cfe5074bd` |
| G2-lint-rust | `pnpm.cmd lint:rust` | 0 | `e3f0268d04c958be5d35ab6836ea039b0c7eab76ecad546caec893182cecf5eb` |
| G2-lint-ts | `pnpm.cmd lint:typescript` | 0 | `ede7ead3aba5331866e9db3b6a393f58668a05e4a52ed4f35e7af9a59aad94ec` |
| G2-type-desktop-corrected | `pnpm.cmd --filter @voxleaf/desktop typecheck` | 0 | `9741dd3bcc001d587b6e1ede8a879a6c70c1c747fa52f5cbefba00a49013dae6` |
| G2-type-desktop | `pnpm.cmd --filter @voxleaf/desktop typecheck` | 2 | `e0382112f013a25f36b5b181d5853f3923e997671dc571a45463595730242539` |
| G2-type-epub | `pnpm.cmd --filter @voxleaf/epub typecheck` | 0 | `0802d0e37ee1c225ecdb46825823d310d07a598faf870da65e9b2da3202b30b7` |
| G2-type-python-corrected | `pnpm.cmd typecheck:python` | 0 | `90c43b3dd545997c51987720f6ad7a2e32ad30be5ec2fa71c5a6e77cf9e8f087` |
| G2-type-python-final | `pnpm.cmd typecheck:python` | 0 | `55c6f67952ac0ed86e256a78a84b4ea434c3c721b0459f4628e73cf0ccc96dfc` |
| G2-type-python | `pnpm.cmd typecheck:python` | 1 | `288f4ab7ef86b2b984705d1cda25db64c661d81b0cfdc0d1a4d874f8c63b3dcb` |
| G3-epub | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/paths/archive-path.test.ts src/paths/ocf-reference.test.ts src/integration/ingestion-matrix.test.ts` | 0 | `ca8f3bea1abe0f112a7d753ac93647919bc291d766fd82ae3e1d8a3830030868` |
| G4-corrected-files | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/hardware-profile-matcher.test.ts src/tts/OptionalChatterboxControls.test.tsx` | 0 | `288aa826e7b3121410a740b4513921380c0638c3da805f8deb92ba98559a270c` |
| G4-desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/active-visual-locator.test.ts src/reader/SemanticDocument.test.tsx src/reader/ReaderPublication.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/hardware-profile-matcher.test.ts src/tts/hardware-profile-compatibility.test.ts` | 1 | `65f3d6aee6f4b4a1cc8ddb772644552db9c08664204572f7dbcc237c432c1777` |
| G5-python | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_dual_worker.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_cli.py services/tts/tests/test_benchmark_dual_worker_result_cli.py services/tts/tests/test_qwen_adapter.py services/tts/tests/test_protocol.py services/tts/tests/test_service.py services/tts/tests/test_contract_conformance.py services/tts/tests/test_release_core.py` | 0 | `f044ef94af8bf37d6191f82b0d02d9264ac51d19b88a1fa45322bda989657b0c` |
| G5-runtime-final | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_dual_worker_runtime.py` | 0 | `b728010daaa5d13d3cfe24d0279f155c826c122c4d8eb89a866fd2f5ac563fa1` |
| G6-inventory | `pnpm.cmd inventory:release:check` | 0 | `c5867a4d7d7d26cccdf84fb749785e30fef0386a5644133bf637ca0fc7605f4d` |
| G6-piper-check | `pnpm.cmd package:piper-core:check` | 0 | `f222b8b5d2755e775af4221e133fff9d739c83172f465e1915b7de92ba980713` |
| G6-piper-regenerate | `pnpm.cmd package:piper-core:write-manifest` | 0 | `2498a40bf2e5ce2e2b9f8a4b481d5e5e3c26e33c625af6c3acc4abb5d9858125` |
| G7-default-host | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml host_profile_detection::tests::` | 0 | `6e496f08b7b3d83a9ac6cf0afa177e601090cc632785a474c4dd6b6fc873650f` |
| G7-default-optional | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests::` | 0 | `23b3968a95f249a6234de32217244e4c4a733d2dbb6d495d4a014185aba2a185` |
| G7-locked-host | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime host_profile_detection::tests::` | 0 | `a06d6dbb20fbd3c8eca46b51106576e03dd357f37b3ae477bdee8d46065443db` |
| G7-locked-optional | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests::` | 0 | `f0859f6af79e70e97391afeca248ec45103c466e523bd214178862310eee4a9e` |
| G8-browser | `pnpm.cmd test:browser reader-reflow-restoration.smoke.spec.ts reader-narration-bugfixes.smoke.spec.ts --grep "EFC-|preserves one canonical passage"` | 1 | `c657e81f13ad00e061a4257bfe5662b008f9ca53b2bc9054cbd7f9a05fb362e8` |
| G8-recheck-corrected | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep EFC-07` | 0 | `9173a51ce04a3edaf6ceddabfd7c129b56eced411e42dfbb8f7f16c21d28a942` |
| G9-native | `& ./tmp/evidence/eight-finding-minimal-corrections/native-acceptance.ps1` | 0 | `a16151f5055bdb9cb2c7d53074d91a433707ae316235dfab66758d3f6c20079d` |
| R1-F01-format-check | `pnpm.cmd format:check:python` | 0 | `13a12ef8604acc5643e7560de5807b0c0a25f61399806dbff36fd8abb309ea11` |
| R1-F01-format | `uv run --project services/tts --locked ruff format services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/benchmarks/dual_worker_controller.py` | 0 | `df54ed8906d371c6ee3072618e7bfed26fa54d6d4245ca1097912e1c54229ae4` |
| R1-F01-green | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_dual_worker.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_benchmark_dual_worker_cli.py services/tts/tests/test_benchmark_dual_worker_result_cli.py services/tts/tests/test_benchmark_v5_authority.py` | 0 | `78ad1182be4f8129acb2e4740cb11616cbabd6157b69e4ea2885ece3f0d0ea24` |
| R1-F01-imports | `uv run --project services/tts --locked ruff check --select I --fix services/tts/tests/test_benchmark_dual_worker_runtime.py` | 0 | `5670bbd5b2b0186fa98500452ea1f6a6de2653b518c786451e58686130a0759f` |
| R1-F01-lint | `pnpm.cmd lint:python` | 0 | `e5f4840903e4bcd598a1810edced2cc809862a336d2b0b269d495985927695b8` |
| R1-F01-red | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_dual_worker_runtime.py -k ordered_frontier` | 1 | `41c1f2cba2f4d5c864fc2dcb0e1b1cc6acc4b3d7f1181695a767ad6f714440c9` |
| R1-F01-types | `pnpm.cmd typecheck:python` | 0 | `83fd13748b0f0a18bdceb5e79d54659783a6127a6b255794a9b89614d88167bd` |
| R2-doc-evidence | `pnpm.cmd check:evidence` | 0 | `6a967a41e223bbd601e605425c1fe17965d990e911b1b065c8d64979224810e1` |
| R2-doc-links | `uv run --project services/tts --locked python tmp/evidence/eight-finding-minimal-corrections/check-doc-links.py` | 0 | `fe2af0fc0b1692190826bec6f4799ded31700521738ab5a290090e4960f595da` |
| R2-doc-whitespace | `git diff --check` | 0 | `d7ad9d17c47e03afafb3ee692351d0122a251844fd3126c1516a1d358c55b4e1` |
| R3-doc-evidence | `pnpm.cmd check:evidence` | 0 | `7e7698c1a325ae8bf0b96bc603cb4da4203cabf59321be8765ef82fdfea5c8c7` |
| R3-doc-links | `uv run --project services/tts --locked python tmp/evidence/eight-finding-minimal-corrections/check-doc-links.py` | 0 | `998eafc0cdbb544830d64a09c553da45522789b3662bdd79954191235ba6ab12` |
| R3-doc-whitespace | `git diff --check` | 0 | `17dd75a194102b8ebf4f2ab938c0578d34534ae67bf8c8e4b8356ad515ed68d4` |
