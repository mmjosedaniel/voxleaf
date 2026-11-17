# Change Review Report

**Review ID** CMR-CI-CR-R1-20261117  
**Task ID** CMR-CI  
**Verdict** APPROVE  
**Base commit and reviewed HEAD** `865d85b42a0a5507cc46a17d7eaf6fa6721c73bb` for both, on `codex/adopt-gpt-6-2-workflow`.

## Reviewed paths and identities

The report inherits all 23 records of `CMR-CI-INPUT-R1` in `tmp/evidence/pr326-audit/inputs.json`, SHA-256 `c56b2a4248e118ba4b649ef0eb3f2d75ea2ee4d9681cbc5076e6f867911b2a7f`, Git blob `dddcf447784bee8d4ec682b304bc1f15e05a5d0a`. The manifest itself is ignored. Six records are unstaged modifications and one is an ignored review helper.

| Path | Status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| apps/desktop/src-tauri/Cargo.lock | ` M` | 53a484b4c30210e07fe8f56e7708d1064e06450f16fb78c177c7070e69e12ad9 | 71de1ef1ca19ec22beda97ae31ba19b07da660f1 |
| apps/desktop/src-tauri/Cargo.toml | ` M` | dbce44d7fe2f1f3b7020505d1b2e1fc5ca38933f5f26d876ee2d6e8f286bc723 | 3036473d4dd7159a79ddb9faccf876f1cd975419 |
| docs/development/dependencies.md | ` M` | 07b618e09b2ab4605fa013915e11d2a301d7cc11a729ff9d4e91fd3f4c922386 | 1ac6bf5dad8c7671ad88b576ee7f80a27c1e6fcd |
| services/tts/release/audit-policy.json | ` M` | 2e02110b3411303106a660d06030e00b8ba1be4605152de498655541572c0a2e | 3c793d52849975bb0f2c51d21dbadd9621a59621 |
| services/tts/release/component-inventory-v1.json | ` M` | b1fa64d1bba10a24351e6e0f3f7429ef699d61485361fcd059da7d2e29578a4a | ca254cf5215feee62979ba5d4905f3ed33653211 |
| services/tts/tests/test_release_dependency_graphs.py | ` M` | e815c5e418552e2770b01fff9522a7e862ef9b3eb9dedeb925ec2cf8152f1bfa | 4f59199dc600a90deed3ecc54e485b0bba17edac |
| tmp/evidence/pr326-audit/verify.py | `!!` | b40611880bcb9af94f0eb6122d1c2e06ec053bfb52ed55c70f89eccfcbf270f0 | df42834ce069d9c4c13fd13f61efc8a383da8968 |

The 16 clean supporting records use the base commit's blob at each path and SHA-256 of its LF blob bytes. Their paths are:

```text
.github/workflows/foundation-checks.yml
.github/workflows/release-audit.yml
.nvmrc
AGENTS.md
apps/desktop/src-tauri/src/tts_optional_chatterbox.rs
apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs
docs/development/agentic-change-review.md
package.json
pnpm-lock.yaml
rust-toolchain.toml
scripts/release-audit.mjs
scripts/release_inventory.py
services/tts/release/core/uv.lock
services/tts/release/profiles/chatterbox-v7/requirements.lock
services/tts/src/voxleaf_tts/release_core.py
services/tts/uv.lock
```

**Identity recheck** PASS. Before and after inspection, all 23 statuses, file digests and filter-aware blobs matched the frozen manifest. HEAD and the manifest digest matched both times. The six tracked modifications constituted the complete diff, the index was empty, and both reserved terminal paths were absent.

## Acceptance review

- The native manifest pins `zip =9.5.1` with default features disabled and only `deflate` enabled. The lock records the exact release and checksum. The pinned RustSec database identifies 9.0.5 as the fix for the streaming-reader advisory that failed CI. The separate upstream advisory identifies 9.1.0 as the fix affecting the indexed reader's constructor. The linked sources resolve and distinguish the two APIs. [RustSec advisory](https://rustsec.org/advisories/RUSTSEC-2026-0548.html) · [Upstream reader advisory](https://github.com/zip-rs/zip2/security/advisories/GHSA-wjr6-mhvj-cjvm)
- The ordinary native download binds the confirmation attempt, checks host admission, verifies each part and reassembles the digest-checked runtime archive. Extraction uses `ZipArchive::new` and `by_index`, checks paths, rejects file symlinks, bounds declared and copied bytes, and checks cancellation between entries and reads. Promotion verifies the installed file set and checks cancellation under the operation lock. Neither the acquisition manifest nor package identities changed.
- The Windows inventory moves from 418 to 421 unique components. It replaces the ZIP and typed-path versions and adds `constant_time_eq@0.6.1`, `rustversion@1.0.23` and `zeroize_derive@1.5.0`. The updated test independently requires the exact total, unique IDs and exact versions of all six selected Rust components, including the retained `zlib-rs@0.6.7`. The inventory records the new Cargo lock digest and audit date. Piper's notice builder selects only `core` records with the `piper-core` audit reference, outside the changed records.
- The policy dates the completed audit and adds only the exact informational tuple for `chrono@0.4.45`. The release runner rejects a nonzero scanner exit or any Rust vulnerability before comparing informational IDs, package versions, kinds and Windows reachability. The locked Windows normal/build tree excludes chrono. The documentation's relative review link resolves to the reserved report destination. [Chrono advisory](https://rustsec.org/advisories/RUSTSEC-2026-0543.html)

## Test evidence reviewed

The coordinator supplied these normal Windows PowerShell results, using Node 24.18.0, pnpm 11.15.1 and cargo-audit 0.22.2. Final results apply to the frozen candidate above.

- CI run `44169474362` reported one Rust vulnerability. Baseline `cargo audit --file apps/desktop/src-tauri/Cargo.lock --json` exited 1 on ZIP 9.0.4 with RustSec database `233155b4025b854c68a4b199c0e32d7fd53291a2`. After `cargo update --manifest-path apps/desktop/src-tauri/Cargo.toml -p zip --precise 9.5.1`, the scan reported zero vulnerabilities. The new lock blob matches Dependabot PR #323 from the same starting lock.
- `pnpm.cmd inventory:release` generated the updated inventory. The focused test first rejected 421 against the former expected 418. On the final candidate, `pnpm.cmd inventory:release:check` reported current and `uv run --directory services/tts --locked python -m pytest tests/test_release_dependency_graphs.py -q -p no:cacheprovider` passed all 26 tests.
- `cargo tree --locked --manifest-path apps/desktop/src-tauri/Cargo.toml --target x86_64-pc-windows-msvc --edges normal,build --invert chrono@0.4.45` exited 0 with nothing to print. Final `pnpm.cmd audit:release` passed Node, Rust and all three Python graphs, with nine Rust informational notices, five Windows-reachable and four documented optional Python blind spots.
- `pnpm.cmd test:rust` passed 191 tests in the default configuration and 190 with the release-locked runtime, with nine ignored in each. Both runs included the five extraction regressions covering exact bytes and bounds for stored and deflated files, unsafe paths, symlinks, corrupt and truncated input, and pre-extraction cancellation. `pnpm.cmd test:python` passed 1,232 tests with two skipped and one warning.
- `pnpm.cmd format:check:python`, `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:python`, `pnpm.cmd typecheck:python`, `pnpm.cmd check:evidence`, `git diff --check` and `python tmp/evidence/pr326-audit/verify.py freeze` exited 0. The initial inventory command under ambient pnpm 11.25.0 stopped at the engine check. The pinned rerun supplied the inventory evidence.

**Findings** None.

**Remaining uncertainty** Remote CI for this candidate and post-persistence verification of the reserved report link belong to closeout. The host evidence covers the release graphs and native extraction regressions. A new installer or live Chatterbox download was outside this correction.

**Required next action** None for independent review.
