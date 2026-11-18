# Change Review Report PR327-CI-R01

**Task ID** PR327-CI  
**Verdict** APPROVE  
**Base commit and reviewed HEAD** `f465225199f27a80323bcdd9f068f294d2ecac9c`

**Reviewed paths and identities.** The closed manifest `tmp/evidence/pr327-ci/review-r01.json` has SHA-256 `7083610a79fc42632753b3bdca1d4357d457d6fb28df82059cbce105cf2e9033`. It includes three modified files and eight unchanged supporting files.

**Identity recheck.** PASS. Before and after inspection, HEAD, all 11 path statuses, SHA-256 hashes and filter-aware blob IDs matched. The index was empty, the diff contained exactly the three declared modifications, and the reserved report path was absent.

**Acceptance review.** On non-Windows targets, release-locked tests now omit the packaged admission helper and its re-export. The only caller belongs to the Windows-only `packaged_chatterbox` test module. The independent `local-chatterbox-v8-candidate` feature still compiles its candidate admission code. On Windows, the release-locked diagnostic still resolves the helper.

The Piper builder now excludes `chatterbox_service_v2.py` when copying installed modules into a fresh core payload. The existing test exercises that copy and requires equality with the exact ten-module set. The separate Chatterbox v8 source list still includes its v2 entry point. The patch touches neither the Windows build privacy checks nor the installer handoff.

**Test evidence reviewed.** The coordinator reported that hosted run `44358955715` produced 11 Ubuntu Clippy diagnostics and one portable pytest failure. The focused Piper copy test also failed locally before the edit with the extra v2 file. On the reviewed patch, the coordinator ran the following commands in normal Windows PowerShell. Each exited 0.

| Command | Result |
| --- | --- |
| `uv run --project services/tts --locked pytest -p no:cacheprovider -q services/tts/tests/test_adapter_layout.py services/tts/tests/test_release_core.py services/tts/tests/test_chatterbox_v8_preparation.py` | 54 passed |
| `cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets --features release-locked-runtime -- -D warnings` | Passed |
| `cargo fmt --check --manifest-path apps/desktop/src-tauri/Cargo.toml` | Passed |
| `uv run --project services/tts --locked ruff check services/tts/src/voxleaf_tts/release_core.py` | Passed |
| `uv run --project services/tts --locked ruff format --check services/tts/src/voxleaf_tts/release_core.py` | Passed |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --locked --features release-locked-runtime vf0114_packaged_v8_distinguishes_torch_cuda_loss_during_owned_prepare -- --list` | One matching Windows diagnostic listed. Discovery only. |
| `git diff --check` | Passed |

**Findings.** None.

**Remaining uncertainty.** The hosted Ubuntu rerun is pending. Windows Clippy and test discovery establish the Windows build and registration results only.

**Required next action.** Verify the Ubuntu Rust and portable jobs on the pushed correction before reporting PR CI success.
