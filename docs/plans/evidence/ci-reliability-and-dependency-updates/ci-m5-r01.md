# Change Review Report

**Review ID** CI-M5-R01  
**Task ID** CI reliability M5 · hosted build efficiency and failure evidence  
**Verdict** APPROVE  
**Base** `17c74f7b96ec4a2732aa6d1d3be8aa1c37c68f52`  
**Reviewed HEAD** `13e2d583bae2e1aae79e8c9315cfcfee8e6e00c1`

**Identity recheck** PASS. The complete nine-path `tmp/evidence/ci-implementation/m5b.json` manifest, SHA-256 `f976771d68d6205528bc4a4f513f0f50aec01c76a13f69e0adf0cbeede5cec0c`, matched before and after review in `tmp/ci-fast`. The five changed paths, worktree SHA-256s, filtered blobs, statuses and commit range matched. Additional clean supporting inputs were:

| Path | Filtered Git blob | SHA-256 |
|---|---|---|
| `services/tts/release/audit-policy.json` | `3c793d52849975bb0f2c51d21dbadd9621a59621` | `2e02110b3411303106a660d06030e00b8ba1be4605152de498655541572c0a2e` |
| `apps/desktop/scripts/native-startup-smoke.mjs` | `92ea444740eda9030fd589fec2b80d010e08a428` | `ba750fd620f3c04fe0dc1a6ed1b073e8a607194cd5e1761f0907519cf7fa17e0` |
| `apps/desktop/playwright.config.ts` | `e14e28a44dcc92215549dcc1042fa0e26cf422a7` | `8b6b8a163b02a949a4e6cd91fcbeff71cb6053e5a646a87552f75b58be8011b1` |
| `scripts/release-audit.mjs` | `247bf8db7b87d271f0c8be3e44b8aa0840d18ca7` | `2b366e734f12fae0cdee25e103eb020490979d415dedca1a50ad5b24648dc8f0` |

**Acceptance and test evidence**

- **Scanner acquisition.** The script uses the policy version, verifies the archive before execution, and selects the locked source installation when verification fails. I checked publisher asset `439294720` independently. Its SHA-256 matches the committed digest `0a7316540862c13d954f648917ceacca593747baed6eec180fafa590be2710ab`. The coordinator reported local acquisition in 1.71 seconds cold and 0.89 seconds on reuse, plus successful source fallback for a corrupt archive. Production dependency graphs passed on the reviewed HEAD. [RustSec release](https://github.com/rustsec/rustsec/releases/tag/cargo-audit%2Fv0.22.2) · [Release check](https://github.com/mmjosedaniel/voxleaf/actions/runs/45698542696)
- **Windows build and smoke.** The successful hosted job logged one aggregate-built `voxleaf-desktop.exe`, 115 passing Chromium scenarios, and a passing packaged WebView2 smoke on the executable at that same absolute path. Its SHA-256 was `3f5894033a2c2c550867b937d6506ee4f3b8e82095abb43f4de1d2feb2abb70e`. The standalone local build-and-smoke command remains available. The deliberate formatting failure stopped Windows at the aggregate before browser or driver setup. [Windows success](https://github.com/mmjosedaniel/voxleaf/actions/runs/45698542366/job/139502291027) · [Formatting control](https://github.com/mmjosedaniel/voxleaf/actions/runs/45698612672)
- **Ubuntu Rust.** The shallow checkout ran the existing format, locked Clippy and locked test scripts through Node. Both Rust feature configurations passed. Windows and Ubuntu portable retained full history. [Foundation jobs](https://github.com/mmjosedaniel/voxleaf/actions/runs/45698542366)
- **Failure evidence.** The deliberate Chromium mismatch failed the browser step and uploaded artifact `15063947532`. I inspected its ZIP directory and verified it contained exactly `test-failed-1.png` and `trace.zip` under the synthetic test directory. Its SHA-256 was `2781928fd85fad7f739893920318c8f508bf465b243dc6a4579b84dd3982d0bb`. GitHub set expiry to November 28, 2026 at 21:16:12 UTC, three days after creation. The ordinary successful foundation run produced zero artifacts. [Chromium failure control](https://github.com/mmjosedaniel/voxleaf/actions/runs/45698658639/job/139502660012)

**Findings** None.

**Remaining uncertainty** The measured timings describe the observed runners. This approval covers the stated M1-based revision. A later combined revision requires its own identity and integration review.

**Required next action** None for this M5 patch.
