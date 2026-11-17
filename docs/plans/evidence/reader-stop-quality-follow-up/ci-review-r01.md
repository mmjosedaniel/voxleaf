# Change Review Report

Review ID: **PR325-CI-CR-R01-20261116**

Task ID: `PR325-CI-R01`

Verdict: **APPROVE**

Base commit and reviewed HEAD: `d912f20fcca7e993ccdf47b78d118c3ef019a4de`

Branch: `codex/revalidated-findings-execplan`

Reviewed paths and identities: Inherited the complete 1,874-path set from `tmp/evidence/pr325-ci/inputs-r01.json`, record `PR325-CI-INPUTS-R01-20261116`, including all five candidate paths and retained logs. This assessment does not inherit earlier approval.

Manifest SHA-256: `2c8dfe8270d204c904f3404e7ae45ed0c53ebe4a23b568b4e06375bb9e35716c`

Tracked patch SHA-256: `54136911721f04dabe91b2f7d6a74abe3e7df17670490654cb23a098122df87b`

One additional read-only support path was inspected to establish Vitest discovery:

| Path | Status | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `node_modules/vitest/dist/config.cjs` | Ignored, `!!`; absent from ordinary porcelain | `1f2504b35ea70c2b248b27daec09e470c4ace58fecc295910d5109cedbceadb4` | `d9b61cab0209274a52a10fc831b9fa2e85ffc322` |

No inherited entries were replaced or removed.

Identity recheck: **PASS**. Independent read-only Git/hash comparisons before and after inspection verified closed membership, statuses, hashes, blobs, HEAD, branch, empty index and exact tracked patch. The additional support identity remained unchanged. Reserved outputs are absent:

- `docs/plans/evidence/reader-stop-quality-follow-up/ci-review-r01.md`
- `docs/plans/evidence/reader-stop-quality-follow-up/ci-closeout-r01.md`

Acceptance review:

The six coordinator failures are obsolete test inputs, not demonstrated regressions in the approved persistence behavior. BNC-01’s three variants, NLC-02 and NCC-01’s two playback-rate variants describe deliberate reading but supplied an unmarked passive sample after a heard checkpoint. The actual tracker → ReaderPublication → App path carries measured manual intent to the save coordinator.

The corrected tests first require rejection of the unmarked sample, then require acceptance with measured intent. Persisted-locator, exact restoration, completion, ownership and next-Play assertions remain. No test is skipped, no expected stored position is weakened, and no production guard is relaxed. These remain modeled coordinator/storage controls, not new browser gesture evidence.

The Node fixture correction resolves the repository root relative to the test module using `fileURLToPath(new URL("../../../", import.meta.url))`. That identifies the same repository from both checkout-root and package-directory invocations. It fixes the import of the EPUB fixture without changing the production probe. Matching diagnostics, incorrect source/artifact/kind/OS-error rejection, exported evidence and post-Cancel retention assertions remain intact.

Documentation accurately records the omitted coordinator consumer and the previous root-only fixture execution, while retaining uncertainty about the earlier review omission. The patch changes only tests and documentation. Runtime behavior, workflows, frozen authorities, package contents, privacy, cancellation and memory bounds are unchanged.

Test evidence reviewed:

All local execution is attributed to the coordinator’s normal PowerShell 7.6.9 session outside the sandbox, with Node 24.18.0, pnpm 11.15.1 and unchanged locked dependencies. I inspected retained logs, configured commands and discovery/type boundaries without executing tests or validation suites.

| Evidence | Evaluated result |
| --- | --- |
| Initial filtered invocation | Shell interpretation failure before selected tests ran; not behavioral RED. |
| `red-full-file.log` | Six failures and 229 passes reproduce the reported coordinator assertions. |
| `desktop-green.log` | All 62 Vitest files and 1,373 tests pass. The subsequent Node phase has 268 passes and three fixture-root failures; the combined command is not credited as PASS. |
| `node-green.log` | Exact configured seven-file Node phase rerun from `apps/desktop`: 271 PASS, zero failures or skips. |
| `node-root-green.log` | Focused VF-0088 invocation from repository root: eight PASS, zero failures or skips. |
| Static checks | TypeScript formatting, lint and types pass; formatting/lint repeat after the Node edit. |
| Evidence/whitespace checks | Coordinator records passing evidence retention and `git diff --check`. |

Within-task reuse of the successful Vitest and type-check phases is accepted. The coordinator attests that their relevant inputs, tools, dependencies and environment did not change. The only subsequent code edit is the Node test file: its `.node-test.mjs` name is outside Vitest’s configured/default discovery, and it is outside TypeScript’s explicit includes. It is not imported by the affected application test graph. The renewed Node phase covers that edit. This does not reuse the failed aggregate as a success.

The retained original Windows log shows HTTP 504 during download of the pinned NSIS archive, before the native checks. The workflow’s SHA-256 gate remains unchanged. The retained Ubuntu failure matches the locally reproduced assertions. Prior remote jobs do not establish success for the corrected revision.

Findings: **None.**

Remaining uncertainty:

Replacement remote CI has not yet established success for this patch. The Windows download may fail again for an external reason and would require fresh diagnosis. Controlled Node probes do not establish live acquisition or installed-journey acceptance. No package/lifecycle, browser, Python/Rust, GPU or acoustic evidence is renewed by this test-only change.

Required next action:

Save this report unchanged and complete the reserved closeout and exact-identity checks. Any authorized Git handoff must preserve the reviewed contents. Inspect the replacement CI and diagnose any new failure before claiming PR validation complete.

This approval passes the independent change-review gate for the current candidate. It is not a Validation Report or Git authorization. I performed no edits, tests, builds, delegation or Git mutations.
