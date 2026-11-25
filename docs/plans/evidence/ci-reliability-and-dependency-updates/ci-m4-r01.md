# Change Review Report

**Review ID** CI-M4-R01  
**Task ID** CI reliability M4 · VF-0181, VF-0182, VF-0183  
**Verdict** CHANGES_REQUESTED  
**Base** `28e157cd2dc08ab974cf3478ea730e8cef801661`  
**Reviewed HEAD** `96baaa5da1cfadd541a06bb43e63ba8f1a5221b1`

**Reviewed identities and recheck** PASS. The complete 11-path `tmp/evidence/ci-implementation/m4.json` manifest, SHA-256 `718f0eb7727f0f6823435db477b29b47109c837d0c199376d11dcbfb064102f7`, matched twice in `tmp/ci-release`, including the seven changed paths, worktree SHA-256s, filtered blobs and statuses. Additional clean inputs were `services/tts/release/audit-policy.json` (blob `3c793d52849975bb0f2c51d21dbadd9621a59621`, SHA-256 `2e02110b3411303106a660d06030e00b8ba1be4605152de498655541572c0a2e`) and `services/tts/tests/test_release_dependency_graphs.py` (blob `5ed348dc02ef6de3dd6e243a9dbffff80976b8dd`, SHA-256 `0b0e4496f4045c2c415183152dc02d9a8d8fd056a06fd5adec6db870a0c642f7`).

**Acceptance and evidence** The graph loop continues after a scanner failure and preserves the failed exit. Deep equality preserves field types, multiplicity, and key sets across property reorderings. The new inventory statement correctly scopes Node severity and advisory blind spots. The coordinator reported normal Windows host results on this revision. `node --test scripts/release-audit-report.test.mjs` passed 2/2. `pnpm.cmd audit:release` passed five graphs with nine Rust notices, five Windows-reachable notices and four optional Python blind spots. `pnpm.cmd inventory:release` changed the summary alone, `pnpm.cmd inventory:release:check` exited 0, and `pnpm.cmd test:python` passed 1,298 with two skips. The supplied `ComSpec` fault made `node scripts/release-audit.mjs` exit 1 while the other four graph checks passed. PR #336’s ordinary release check passed according to the coordinator.

**Findings**

1. **P2 · VF-0181 · `.github/workflows/release-audit.yml`, Install pinned RustSec scanner.** A failed `cargo install cargo-audit` skips the entire graph step. The inventory condition explicitly excludes a skipped graph step. Node, Python and inventory therefore receive no result even when only RustSec acquisition failed. Preserve the failed job while running the independent checks after a scanner-specific acquisition failure. Show that exact workflow path with a controlled failure.
2. **P3 · VF-0181 · `scripts/release-audit-report.mjs`, `checkNodeReport` (line 17).** Pinned pnpm 11.15.1 returns `github_advisory_id: ""` when the registry URL contains no GHSA. Its normalizer still supplies `id` and can supply `url`. The nullish fallback selects the empty string, so the diagnostic drops both available identifiers. A positive count with absent advisory records also becomes a vulnerability diagnostic with no details. Select a nonempty available identity, classify malformed or inconsistent detail as scanner output failure, and cover both cases alongside the existing GHSA test.
3. **P3 · VF-0181 · `scripts/release-audit.mjs`, `auditPythonGraph` (line 173).** For a vulnerable dependency, the mapping retains only `name` and advisory `id`. A version supplied in the pip-audit record never reaches the diagnostic. Preserve the affected version when available and assert that a synthetic Python finding reports the ecosystem, package, version and advisory.
4. **P3 · VF-0182 · `scripts/release-audit.mjs`, `reachablePackages` (lines 97–110).** A Cargo `{p}` row with a source suffix, such as a local-path package, is stored as the entire line. The warning lookup compares only `name vversion`, so a reachable warned package can remain classified as lock-only. The inventory parser at `scripts/release_inventory.py` line 527 explicitly accepts and removes that suffix. Make both interpretations agree for a source-qualified reachable row and retain a genuine lock-only control.

**Remaining uncertainty** The separate hosted deliberate warning-mismatch run `45698798729` was still installing the scanner at recheck. Its outcome does not cover scanner acquisition failure.

**Required next action** Address the four bounded cases, supply focused host and workflow evidence, and submit the corrected identities for a new change review.
