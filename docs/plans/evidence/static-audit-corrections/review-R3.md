# SAC independent change review R3

Review ID: `SAC-R3-20261028-01`.
Task: static-audit-corrections, SAC-01 through SAC-15.
Reviewer: independent `change_reviewer`, GPT-6 Astra high; read-only, no tests,
edits or delegation.
Verdict: **APPROVE**.
Base/HEAD: `7c00f2f633ffd0c79043ab694f29b7defb46941a`.
Branch: `codex/static-audit-corrections`; index empty.

## Exact reviewed patch

The closed manifest contains 94 paths, including 50 task paths, plus the nine
unchanged supports listed below. Identity recheck: PASS before and after review
for SHA-256, filter-aware Git blobs, task membership, branch/HEAD and empty
index. No pre-existing work or outside-manifest change was found. The director
rechecked the same 94 identities before making documentary closeout edits.

| Private review artifact | SHA-256 |
| --- | --- |
| `review-R3-manifest.json` | `55c9502516a6dc38057678686565c46f0ca4c9d693704f0d00fbcbbe31c3930d` |
| `review-R3-tracked.patch` | `65a9585a5e0a8021af04a51642c8e9eeb905397e4b0fe78574d5e2f116573500` |
| `review-R3-new-files.json` | `5843ec07c022166e9171f151acb2166e656c25c6d3396553f19b5ac939e2e40a` |

Exact artifacts are retained under ignored
`tmp/evidence/static-audit-corrections/`. This report records the original R3
checkpoint and is not retroactively updated to describe later documentation.

## Acceptance and findings

All fifteen criteria are covered by current code, concrete regressions and
applicable execution gates. Both R1 findings remain closed: bounded blocked
stdin dispatch/cancellation in SAC-12 and the browser SAC-15 selector. There
are no actionable findings or remaining gaps that block this scope.

The final native harness moves each synthetic image or placeholder into the
viewport before waiting for lazy decode. It preserves the oriented dimensions
and release assertions; it does not weaken the failed case. The review also
verified distinct default-app, release-libtest, unbundled-app, NSIS-installer
and installed-app identities. The installed byte difference is limited to the
Tauri NSIS marker, supported by the crate source matched against Cargo.lock.

## Host evidence reviewed

The reviewer inspected attributed receipts from normal local PowerShell
outside the sandbox and did not execute tests, builds or product validation.
The [validation ledger](M3-validation-ledger.md) retains exact commands,
attempts, artifact identities, failures and cleanup.

| Area | Accepted evidence |
| --- | --- |
| TypeScript | Format, lint, types and package graph PASS: 210 shared, 702 EPUB, 899 desktop, 102 Node tests. |
| Python | Format, lint, types, tests and build PASS: 678 tests, types over 180 files; wheel/sdist identities verified. |
| Rust | Format, both Clippy configurations and both test configurations PASS: 139 default/138 release-locked. After H-GPU relink, the exact new release libtest passed 138 tests; seven configured ignored diagnostics per variant. |
| Browser | Four unchanged foundation cases reused from B1-browser-01; all 13 reader cases passed B1-reader-browser-03. Earlier failures retained; no failed aggregate claimed as PASS. |
| Native/CPU | Default build and complete WebView2 gate PASS. Piper EN: 60 seconds stable, 349 ms cancellation, zero underruns/external requests/audio persistence. |
| GPU | Supervised V7 ES/EN PASS, cancellation 262/236 ms, restart, complete runtime post-verification and cleanup. |
| Package/host | Verified Piper core/configuration, final release-locked NSIS build, L1 install/first start/repair/six removal options and installed P1 ordinary/hostile environment preflight PASS. |
| Evidence/cleanup | Evidence tests 31 PASS; final R3 privacy guard and 98 local Markdown targets PASS. Original data files/directories restored, installed identity verified, no new task-owned processes or temporary roots. |

The private final host journal reports `dataRestored: true`, verified installed
identity and `errors: []`. A preserved unrelated residual root predates M0.
Private user-data inventory values and paths are excluded from this report.

## Accepted reuse and limits

R3 accepts this execution's results for 626 TypeScript inputs, 676 Python
inputs, 599 foundation inputs and four evidence-test inputs after comparing
their full relevant membership/hashes, artifact identities and environment.
The full snapshot difference contained only the plan/M3 documentary updates
already reviewed. No historical PASS is reused. No `check` or `check:portable`
aggregate is claimed as executed. Verified core/runtime/model payload reuse
does not stand in for fresh acceptance of a newly built executable.

No blocking uncertainty remains. Approval does not establish public package
distribution, signing/antivirus clearance, interactive installation on clean
Windows or complete ordinary Chatterbox online acquisition. Those are outside
the accepted bounded scope. The required next action is a new exact archive
review after documentary closeout; this report grants no Git authorization.

## Closed unchanged support supplement

All paths below are UNCHANGED. SHA-256 and filter-aware blobs were checked
against the pre-review snapshot and again at review completion.

| Path | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `1e4e3de93ba5cc496f35407cb7abe4ba1259f7976b7b429a40dad418c0352b9c` | `8058d276cdf695edbf8a63c54bef753102f602fe` |
| `scripts/build-windows-release.ps1` | `1183b8a483ecdb243ec75d962729446face6ac938284b3f66616f5673ae8b0ce` | `9577102d19bede044f4ce21d62a2f5fc489a215c` |
| `scripts/check-evidence.test.mjs` | `06f00dbafbe56af7f97e5b7b43665279d65020bdc3e78b7bcd47143d5030e790` | `d776abcaf68655ef72b19fccc57ecc16f9227b7a` |
| `apps/desktop/src-tauri/tauri.release.conf.json` | `6e9694a63e5a1d9c06379803fd5da573bb474b6beee24e48990937edb0da451d` | `59361d1e47c6204fb922b68ffdcf36de8fb0d878` |
| `apps/desktop/vite.config.ts` | `cf32693193b978e9d290f7cddf99538c7973622ba408005bfceec857e1ec9f31` | `1df2541f9aa8a463a0d076c8059dc07855762f0d` |
| `services/tts/tests/test_benchmark_corpus_authority.py` | `838349d6b39fccd5cc1a3cdcd0a4dbe4077daf7c37214fefb0952ea6258be98f` | `671ba5df2f342857d8aeecac55a18f1282d587b1` |
| `services/tts/tests/test_contract_conformance.py` | `a3f6f5608367e7a3cb7351b65c9d91a45dce4143f44cc9a2bcca5028664ac48b` | `bb637b500c93a068ae9dad25ed515c96c05a5975` |
| `services/tts/tests/test_release_chatterbox.py` | `e9e42c697f8c63e01a8116477205f2e9ce27bac680cd3edc933166227b80ac0f` | `27941d5eb39ae08da7e1cd5dd8d0a6f6c6d83070` |
| `services/tts/tests/test_release_core.py` | `bd77bd5adab23c9e39701429eff14d97bef7dbe95ab0370b3cc42c78bd2a1666` | `bd96f482f92bf321275240b385b44abf99215387` |
