# Change Review Report

Review ID: **MAF-R1-20261029**  
Task ID: **minimal-audit-findings-corrections, MAF-01–MAF-11**  
Verdict: **APPROVE — implementation acceptance**

Base commit and reviewed HEAD: `2f6a80b7b19be6cc62b7706bd85e9be96a1a2b8e`  
Branch: `codex/minimal-audit-findings-corrections`

Reviewed paths and identities: the closed 1,437-path manifest at `tmp/evidence/minimal-audit-findings-corrections/review-R1-manifest.json`, including 35 modified files, one new execution ledger, and unchanged supporting inputs. No pre-existing changes were included. This report is excluded from its own manifest.

| Immutable artifact | SHA-256 |
| --- | --- |
| `review-R1-manifest.json` | `e0a1f262c7ee81973a8918e7706b70ad9ca30e3c37b17b36ae53a1c086848237` |
| `review-R1.diff` | `303c4b25a280ce87aac0a2c55b645c6275444b6e3bb16a6b3971372176e9d093` |
| `review-R1-new-files.json` | `29d2e700fc94aa8d9ba838cfbe86d818d3eb376878088151cb061d5290bd81ca` |
| `review-R1-gate-comparison.json` | `55be532e2b4ee6d342c109a9792c85542d361a071fa3f045c3aa51fa0163305f` |
| `F-Docs-R1-result.json` | `e24245355473a93624ba114385d40145e9ca6121ed0e2f095a72354342bd2901` |

Identity recheck: **PASS**. Before and after inspection, all 1,437 path SHA-256/filter-aware blob identities and membership matched. Independent porcelain comparisons matched all 36 changed-path statuses; HEAD and branch remained unchanged and the index remained empty. The supplied binary diff matched `git diff --binary HEAD`; supplied new-file contents matched the worktree. All receipt/log/snapshot hashes listed in the gate-comparison artifact matched their files. Current final tool and artifact hashes also matched their recorded identities.

Acceptance review:

| Criterion | Independent assessment |
| --- | --- |
| MAF-01 | The wrapper preserves its four arms and arguments, awaits the existing cooperative runner’s terminal exit and cleanup acknowledgement, and stops on failure or uncertainty. Real-child tests cover normal completion, deadline, cleanup failure and absent acknowledgement. |
| MAF-02 | Generated PowerShell now terminates on enumeration errors and rejects unreadable still-live owned processes. A separately verified exited child can disappear. Actual-query fault tests establish the conditional defect and its correction; existing cleanup identity safeguards remain intact. |
| MAF-03 | Lone-surrogate narration text becomes the existing `INVALID_UTF8` protocol failure. The service’s established rejection/cleanup path handles it without exposing input. Both surrogate halves, valid astral text and exact byte bounds are covered. |
| MAF-04 | Renderer containment spans asynchronous configuration actions. Native admission excludes both configuration and spawning throughout removal; cached configuration is revoked after verified stop. Admission is released before the handshake, preserving interruption. Barrier tests exercise real installed-input verification and owned child/Job teardown in both feature modes, including failed stop, deletion failure and retry. |
| MAF-05 | Cleanup ownership begins immediately after successful spawn and covers partial sampler/thread initialization. Termination and waiting are bounded; acquired resources are independently released. Primary failures survive cleanup failure, which receives a separate fixed diagnostic. |
| MAF-06 | Successful cancellation observations retain their actual language through the harness into v12 serialization. Failed ES followed by successful EN remains correctly labelled and incomplete. External schemas, trial identifiers, failure gates and v9/v11 files remain unchanged. |
| MAF-07 | Absent client rectangles plus all-zero fallback bounds reach the existing block fallback. Meaningful zero-width carets remain accepted. Chromium verifies actual BR geometry and restored alignment; locator identity is unchanged. |
| MAF-08 | Unicode marks participate in existing lexical-boundary protection. Tests cover composed/decomposed and mark-adjacent numeric forms, ordinary expansion, source mapping and equal output across bounded public continuations. No normalization rewrite or increased resource bound was introduced. |
| MAF-09 | PDH statuses 0 and 1 are accepted; invalid status and negative values remain excluded. Consumer tests cover mixed instances, owned aggregation, sampling reuse and unavailable observations. |
| MAF-10 | Healthy same-profile loaded reselection avoids fresh optional-selection admission while retaining existing continuation checks. Absent, failed and changed-language owners retain ordinary admission. Mounted radio coverage verifies owner preservation after reduced free-memory facts. |
| MAF-11 | Completed mode-dependent owners are released before publishing the new selection. A consistent completion projection preserves the final highlight and heard checkpoint without autoplay. Tests cover 1/2/5/10-minute targets, subsequent ticks and explicit restart; the existing completion/navigation control remains asserted. |

The affected production paths, tests, direct settings/native callers, highlight consumer and heard-position persistence bridge were inspected. The changes preserve local inference, content-free diagnostics, memory-only generated audio, bounded preparation/playback ownership, cancellation, stable locators and serialized public contracts. Dependencies, versions and frozen evaluation/runtime authorities remain unchanged. The architectural owners and completed M005 boundary remain applicable.

Test evidence reviewed: **supplied executor evidence**, recorded from local PowerShell outside the managed sandbox. I executed no tests, builds, formatters or implementation changes.

| Receipt | Command and observed result |
| --- | --- |
| `F-TS-01` | `pnpm.cmd typecheck:typescript`; `pnpm.cmd test:typescript` — PASS; shared 210, EPUB 749, desktop 984 and Node 151 tests. |
| `F-Python-01` | `pnpm.cmd test:python -o cache_dir=../../tmp/evidence/minimal-audit-findings-corrections/pytest-cache` — 806 passed. |
| `F-Rust-01` | `pnpm.cmd lint:rust`; `pnpm.cmd test:rust` — both Clippy variants pass; tests 148/147 passed, seven explicitly ignored per variant. |
| `F-Static-02` | `pnpm.cmd format:check`; `pnpm.cmd lint:typescript` — PASS. |
| `F-Python-static-02` | `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python` — PASS; mypy checked 180 sources. |
| `F-Browser-static-01` | Scoped `pnpm.cmd exec prettier --check` and `pnpm.cmd exec eslint` for `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`; `pnpm.cmd --filter @voxleaf/desktop typecheck` — PASS. |
| `B1-browser-04` | `pnpm.cmd test:browser reader-reflow-restoration.smoke.spec.ts reader-narration-bugfixes.smoke.spec.ts --grep "MAF\|preserves one canonical passage\|LCF completed narration restarts\|SAC-01 completed"` — nine passed. |
| `P-Core-inputs-01`, `F-Core-01` | Existing-input verification; `pnpm.cmd package:piper-core:write-manifest`; `pnpm.cmd package:piper-core:check` — PASS. One generation includes both offline voice smokes. |
| `F-Build-Python-01`, `F-Build-Desktop-01` | `pnpm.cmd build:python`; `pnpm.cmd build:desktop` — PASS, including the configured frontend hook. |
| `N1-native-01` | `./tmp/evidence/minimal-audit-findings-corrections/native-acceptance.ps1`, invoking `node apps/desktop/scripts/native-startup-smoke.mjs` — PASS; zero external requests and no new matching processes or scratch roots. |
| `F-Docs-01`, `F-Docs-R1` | Evidence guard, 31 guard tests, link inspection and `git diff --check`; final guard/link/whitespace renewal — PASS, 76 local links. |

The native executable reviewed and exercised by N1 has SHA-256 `7f5c1aa67c9278f5874bef54479f646415c09909ccafe90906f8de81f9da7dc8`.

Evidence retention is accepted for the stated scopes. Snapshot differences were inspected against actual discovery/configuration/import boundaries. Later renderer changes do not enter Python test execution; later browser selector edits are excluded from Vitest and the seven Node entries and received renewed static/type/browser checks. Rust ownership tests retain unchanged native inputs and test binaries; the final frontend/native integration was rebuilt and exercised separately. Documentary edits received final guard/link renewal. No historical SAF/RAC/VCA test PASS establishes this approval.

The directed failure records support the reproduced causes, including conditional MAF-02/04. Fixture failures and subsequent corrections remain distinguished from product failures. Cleanup evidence accounts for the initial Node fixture leak through identified recovery and final absence checks, core staging/backup removal, and preservation of two pre-existing native scratch roots.

Reader performance benchmarks are **not applicable to this bounded patch**: the geometry predicate adds no traversal, scheduling, batching or steady-state layout work. No new performance-budget claim is accepted. Model, GPU, listening, speed, installer and clean-host matrices remain outside the affected responsibilities.

Findings: **none**.

Remaining uncertainty: no blocking uncertainty within the reviewed acceptance scope. The evidence does not establish natural host emission of PDH status 1, new real-model performance/quality results, installer behavior or clean-host compatibility. Browser service simulations complement, rather than replace, the separately supplied native ownership tests.

Required next action: record this immutable report, complete the authorized documentary archival, renew affected documentation checks, and obtain the separately required M4 review with a new Review ID. Any reviewed-path change invalidates this report for the changed patch. This approval is neither a Validation Report nor authorization to commit, push, create a PR, merge or publish.
