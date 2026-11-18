# Change Review Report

Review ID: WIN-PRIV-20261118-R01  
Task ID: PRV-R01  
Verdict: CHANGES_REQUESTED  
Base commit and reviewed HEAD: `50f3b9ec76022efae72c239015bb47080920d7a0` at both checkpoints on `main`.

**Findings**

1. **Medium — The Windows build silently discards configured compiler flags.** `Invoke-PrivateWindowsTauriBuild` reads `CARGO_ENCODED_RUSTFLAGS` and `RUSTFLAGS`, then unconditionally sets `CARGO_ENCODED_RUSTFLAGS` at `scripts/build-windows-release.ps1:87`. With both variables initially unset, a valid `.cargo/config.toml` containing `build.rustflags = ["-Coverflow-checks=yes"]` passes the layout preflight. The previous build let Cargo apply that setting. The new wrapper causes Cargo to ignore it, so the release can succeed with the requested overflow checks disabled. Cargo documents the same precedence for matching target-specific flags. The regression fixture at `apps/desktop/scripts/windows-release.node-test.mjs:370` covers both environment variables and restoration after failure, but exercises neither configuration source. **Correction criterion:** retain Cargo’s effective build and target flags when adding the privacy flags. Establish through a Windows regression that a configured flag reaches the compiler alongside the remaps, including the target-specific precedence case.

**Reviewed paths and identities.** The closed manifest is `tmp/evidence/privacy-coordinator/candidate-r01.json`, SHA-256 `a6233af2888b99018cae29493b2d16a6ea81a1beb2900d924f51bc5dc4b7d647`. It binds 1,918 source entries and 40 evidence entries, including the three Windows handoff binaries. The November 17 baseline is identified separately in `tmp/evidence/nov17-followup-coordinator/inputs-r07.json`.

**Identity recheck: PASS.** Manifest reconstruction matched before and after inspection. HEAD, branch, index, source identities and evidence hashes remained stable. Both reserved terminal paths were absent.

**Acceptance review.** All 1,918 source-preview members matched the frozen file bytes. The preview ZIP SHA-256 was `3646237656ac21ac68df6e9b9ceecb654520f84121f72989d2bec85e98b3ecf6`. I compared the redactions against the two private restoration inventories and traced the retained release URLs through native admission and package generation. The supplied scans detected the original disclosure in both old executables and reported zero unapproved builder-identity matches in the replacements, installer, uninstaller and 5,436 inspected payloads. The 34 absolute vendor CodeView references were identified separately.

**Test evidence reviewed.** The coordinator’s Windows host receipts record passing runs of `pnpm run package:windows:verified-core`, `pnpm run build:desktop:chatterbox-v8-candidate` and `pnpm run package:windows:check`. They also record 15 passing Windows layout/signature cases, one flag fixture, 109 Python tests and 84 Rust tests with three opt-in cases ignored. The installed executable matched the extracted identity. The successful lifecycle retry covered first launch, repair, six uninstall policies and data restoration. The candidate WebView2 receipt records a typed CUDA preparation failure and preserved selection on recheck without restarting generation.

**Remaining uncertainty.** The final source ZIP awaits the reserved terminal records and post-persistence verification. Public signing, SmartScreen, Defender and broader hardware support remain outside this review.

**Required next action.** Correct the compiler-flag regression, obtain affected Windows build and privacy evidence, and submit the revised candidate under a new review ID.
