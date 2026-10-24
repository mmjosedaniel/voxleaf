# Change Review Report

Review ID: `CLB-TOKIO-AUDIT-R1-ASTRA-20261023T225515Z`

Task: PR #272 bounded Tokio audit correction.

Verdict: **APPROVE for the scoped Tokio/lock/inventory/documentation correction. Overall production-audit and full CI acceptance remain BLOCKED.**

Reviewer: independent `change_reviewer`, GPT-6 Astra high, read-only. No edits, tests, builds, Git mutations or delegation were performed by the reviewer.

Reviewed HEAD: `3e0c37569d2b66b912b30ad2012d3b1cd078fc2f`.

PR base: `26ecd6cd6d678e541f6569d8d45661887942ad6b`.

Branch: `codex/confirmed-logic-bugfixes`. The index remained empty.

## Snapshot and identity recheck

The closed manifest is `temp/clb-review/tokio-inputs.json`, SHA-256 `df86f93f5ca4b20bd1fad1a9820eae895ead9c82e673779c162bc32db59c83b6`: six task paths and 14 supporting paths. Appendix A preserves all 20 exact identities.

The tracked delta is `temp/clb-review/tokio-reviewed.diff`, SHA-256 `db82695ce858556a1c208c76f52ecc2faa903d9243f063428806fd88ae9ad534`. The cumulative tracked PR diff is `temp/clb-review/tokio-full-pr.diff`, SHA-256 `7252109dcd4c2765490299b1bb83bf2b9f4f1e53ec4028e0f4ec3ed2f4141a87`. Both match the live Git diffs. The new untracked `dependency-audit-follow-up.md` was inspected separately in full and is included in the closed manifest. This report is excluded from its own inputs.

Identity recheck: **PASS**. Before/after inspection found no HEAD, base, reviewed-path content, filter-aware blob or status drift. The source-writing freeze was respected. Raw host evidence and its identifying digests remain private.

## Acceptance review

The original audit records contain eight Rust informational notices, including Tokio 1.53.1's RUSTSEC-2026-0386; the unchanged policy expects seven. Tokio 1.53.3 is within the patched range in the [RustSec advisory](https://raw.githubusercontent.com/RustSec/advisory-db/main/crates/tokio/RUSTSEC-2026-0386.md). The affected `AsyncFd` constructors are Unix APIs. Package reachability on Windows is not evidence that this Unix API is exploitable through VoxLeaf.

Independent structural comparison of the lock confirms that Tokio 1.53.1 is replaced by 1.53.3 and its registry checksum changes. The only other lock changes are five dependency edges from dirs-sys, errno, rustix, tempfile and winapi-util to already-present windows-sys 0.59.0 instead of 0.61.2. No other package version changes; the application's explicit windows-sys 0.61.2 dependency remains intact. Cargo generated the lock according to the supplied execution record.

The generated 418-component inventory changes only Tokio's version/source/checksum identity and the Cargo-lock digest. The inventory generator/check and dependency-graph tests remain unchanged. Its dated audit summary remains a historical checkpoint, explicitly identified as such in the follow-up record; inventory regeneration is not represented as a fresh successful production audit.

The audit runner and seven-notice policy are unchanged. The runner still rejects vulnerability results, unexpected warnings/reachability and Python advisory findings. No advisory exception, suppression, weakened assertion or changed acceptance threshold was introduced.

The patch changes dependency resolution rather than application source. Fresh native compilation, both Rust feature-mode checks and the WebView2/lifecycle smoke provide relevant regression coverage. No application contract, cancellation policy, buffer limit, EPUB privacy boundary, persistence responsibility or architecture topology is changed. Existing historical model/installer results are not promoted into acceptance of a newly packaged artifact.

## Supplied host evidence

These are coordinator-attributed normal local PowerShell executions outside the managed sandbox. The reviewer inspected their logs, not reran the commands.

| Command / attempt | Recorded result |
| --- | --- |
| `pnpm.cmd audit:release`, original lock | Exit 1 at the unexpected Rust warning set. |
| `pnpm.cmd audit:release`, patched lock, first attempt | Exit 1 because the RustSec database fetch failed; no Rust audit conclusion. |
| Same audit, unchanged retry | Exit 1 overall. Node, Rust (7 informational notices, 5 Windows-reachable), base Python and Piper pass. Chatterbox fails the two advisories below. |
| `pnpm.cmd test:rust` | Exit 0; 117 and 116 passing tests, two ignored diagnostic helpers in each feature mode. |
| `pnpm.cmd lint:rust` | Exit 0 in both configured feature modes. |
| `pnpm.cmd test:python` | Exit 0; 619 passed with one non-fatal cache-write warning. |
| `pnpm.cmd test:native-startup` | Exit 0; release rebuild and WebView2 startup, protocol/lifecycle, cancellation/crash recovery, reader/synchronization and restoration checks passed; no external requests. |
| `pnpm.cmd inventory:release` and `pnpm.cmd inventory:release:check` | Exit 0; generated inventory is current. |
| `pnpm.cmd format:check:typescript` and `pnpm.cmd check:evidence` | Exit 0. |
| `git diff --check` | Coordinator reports exit 0. |

The existing audit is adequate regression evidence for this dependency correction: its Rust stage fails with the original lock and passes with the patched lock without policy edits. Fresh dependency-sensitive Rust/native gates replace reliance on the old executable for this delta. A complete hosted run of this exact patch, new installer acceptance and optional-runtime remediation are not established by these results.

## Independent remaining blocker

`pnpm.cmd audit:release` is still failing against the unchanged published Chatterbox v5 lock: filelock CVE-2026-112940 and setuptools GHSA-xmj3-9gf7-h52w remain unsuppressed.

The [filelock maintainer advisory](https://github.com/tox-dev/filelock/security/advisories/GHSA-v4x8-3wr5-3wq8) identifies a POSIX SQLite-backed reader/writer-lock issue and excludes Windows from that path; the [setuptools advisory](https://github.com/pypa/setuptools/security/advisories/GHSA-xmj3-9gf7-h52w) concerns fixed-content file creation outside the destination during legacy Windows wheel installation. These package-level findings do not independently establish exploitability through VoxLeaf, but they still fail the repository's current audit policy.

The current documentation reports that distinction correctly. This review grants no exception and does not accept the overall production audit, merge readiness, or a successor optional-runtime release. The published v5 lock/artifacts/admission remain unchanged. Any separately authorized successor must follow the existing ADR-0058 publication, hashed-lock, compatibility/security and installed/native acceptance requirements; editing a lock or relabeling v5 alone would not establish remediation.

## Findings and required next action

Findings introduced by the reviewed bounded patch: **none**.

Remaining blocker: the existing optional-runtime audit failures prevent full CI/production-audit acceptance. This scoped approval must not be reported as a green global audit.

Required next action: save and verify this immutable report before any separately authorized Git handoff, preserve the reviewed identities, and retain the global audit blocker until an authorized remediation passes the required checks. Any new source/content change requires fresh review. No merge, new optional-runtime publication or migration is authorized by this report.

## Appendix A: Reviewed source identities

Status (empty) denotes an empty Git porcelain result at review time.

| Path | Role | Status | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- | --- |
| `apps/desktop/src-tauri/Cargo.lock` | `task` | ` M apps/desktop/src-tauri/Cargo.lock` | `9336f463f36e88f35a81605348387deb063a396177c5369d3f5836b5a8790975` | `ef3f7f1bbc9b1c93e3684e2877c09e89e1b8214e` |
| `services/tts/release/component-inventory-v1.json` | `task` | ` M services/tts/release/component-inventory-v1.json` | `58c73c716015d01bb96c1720c79211ddc299e3e117650046e34d080c4da6e5ff` | `c647b25dd4fc461bfb7e2f57355016fb72cc739c` |
| `docs/README.md` | `task` | ` M docs/README.md` | `3c7bba96e11e209dcb457b53c8109b3aa618a6e8be11e2421fd1712313c1aa63` | `dd262a7d7c8f972117facf3383d171f7c68eb996` |
| `docs/development/release-security-and-distribution.md` | `task` | ` M docs/development/release-security-and-distribution.md` | `c9c094f80a70e1b2de24e45756e3b20f930309b134223296fa6ff62afdb74423` | `3a2c1b73741d0702b2412cd155380a5731b9db7f` |
| `docs/plans/completed/README.md` | `task` | ` M docs/plans/completed/README.md` | `391e8213316a74868705c609cab19f8112c9b977e82fdf7bd25b9510269947d3` | `2d757a428b4c0200e9c0b9ee6c0b62bc621444f2` |
| `docs/plans/evidence/confirmed-logic-bugfixes/dependency-audit-follow-up.md` | `task` | `?? docs/plans/evidence/confirmed-logic-bugfixes/dependency-audit-follow-up.md` | `5c36f0ed44c3d19edac04f96b3ab5b3b9737b620359bd9cbc363cf503d7e47e2` | `d76707e29e0ecb326903344209c138f956a89552` |
| `scripts/release-audit.mjs` | `support` | (empty) | `2b366e734f12fae0cdee25e103eb020490979d415dedca1a50ad5b24648dc8f0` | `247bf8db7b87d271f0c8be3e44b8aa0840d18ca7` |
| `scripts/release_inventory.py` | `support` | (empty) | `13602d68a819ea3c83816f8446996bdc434eba7cfe3cca5fa2f4c7015260cf7e` | `9cd6c281451856f74f944b6a2236866fe0a474bc` |
| `services/tts/release/audit-policy.json` | `support` | (empty) | `367e8a3e0c33138c23f2fb89e85a467e6675f672fe5273a1b3b76efe958e11d1` | `a6a65cfefa233fd3da8507245d803e0b1cffb9a6` |
| `services/tts/tests/test_release_dependency_graphs.py` | `support` | (empty) | `10ab76df7fd6cee6b10581bdc2f0da4e56f508b5a839498d7cfbc373050dc420` | `4ecedf31f2afde5d9f65dec17f82a59229c3d424` |
| `apps/desktop/src-tauri/Cargo.toml` | `support` | (empty) | `f7589af14b344c827c746e5741a3a5f6d274e8b0643a829ec5a0b3d6971dde09` | `2d119b08ff5c815f3f4926cb2ae6892fddd5bf3b` |
| `package.json` | `support` | (empty) | `1f338a627cb8733b823e9c434c7e18647cf771cd63043e83a4a87ad587f5ad6e` | `b09ae26aa241b8026c3a0e25078018f29b26df0e` |
| `apps/desktop/package.json` | `support` | (empty) | `7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa` | `46b13978c4094f004349ba762f31bddeb104cb9f` |
| `apps/desktop/scripts/native-startup-smoke.mjs` | `support` | (empty) | `cf8b9917f5c227b81c8d9f82fcb9f9b2c57bf38652d51a2d8001aae587fd4f77` | `cfc1946cba2b49114e216973c136f8019fb90a1e` |
| `docs/architecture/decisions/ADR-0058-admit-certifi-pillow-chatterbox-v5.md` | `support` | (empty) | `948676c090549045f26d0583fc9a2cce067ff9af15474535bd12e8f8dffa6241` | `dbe6649400c5b7c24a67baee79e6e0d108b420aa` |
| `docs/architecture/system-diagram.md` | `support` | (empty) | `e12b79b8beb6b12d948d7e9795dbd92f23ad73793d52e76502525f3e7ef4f537` | `0a918fc1719ebf85877c1d4494d8f4c0fd383dd1` |
| `docs/development/agentic-change-review.md` | `support` | (empty) | `de4c430a5de120d9c900d6bad0bebbfeec81673614b30f242f3154efbedcfc39` | `373443e17547185e2294d906bdc9cb489daca67c` |
| `services/tts/release/profiles/chatterbox-v5/requirements.lock` | `support` | (empty) | `b46f7291150378ee5f3b12812174ddabe34be03558e57b49b516629159df0217` | `086f5622d2b785c3d9f03cd723620dad0d017c5e` |
| `.github/workflows/foundation-checks.yml` | `support` | (empty) | `dae116f90e7a703f0959680ee9fe5d2bd34b7fa62b68b43dd5060a3b82784f85` | `0ddef04e6390a01dbbc7290cbc446071b73a7925` |
| `docs/plans/evidence/confirmed-logic-bugfixes/change-review-ci-privacy.md` | `support` | (empty) | `68d883eda22e735d0672df164c2c60412556ab0351c2067ee159b3f005addaa8` | `9956f7927eb463e0d9a68c6fd68630f5ee2e67e9` |
