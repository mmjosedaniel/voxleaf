# Change Review Report

Review ID: **EFC-R2-20261030**  
Task ID: **EFC**  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `f4e3b585114a1fda0e3bd9e72b8c31a007121d5a`  
Branch: `codex/eight-finding-minimal-corrections`

Reviewed paths and identities: the closed 77-path manifest at `docs/plans/evidence/eight-finding-minimal-corrections/review-R2-identities.md`.

| Artifact | SHA-256 |
| --- | --- |
| Public R2 identity manifest | `13bd443f4ba8f2693c17e9727770c2000440e68437097d22fcdd07b205128ac9` |
| `tmp/evidence/eight-finding-minimal-corrections/R2-identities.json` | `90437d3791720c206d7713b88e79a811104202d2709dc837b9d2c8fe7bffeeaee` |
| `tmp/evidence/eight-finding-minimal-corrections/R2-complete.diff` | `f0bbc51c39582114993c4206fc2b6663eb8d0f91a6ec363df48d34eeeb64e420` |

**Identity recheck: PASS.** Before and after review, HEAD and branch remained unchanged and the index was empty. All 77 SHA-256/filter-aware blob pairs matched. Final raw porcelain statuses matched the corrected manifest. The stored tracked diff matched the current patch. The only changed path outside the manifest was the manifest itself, intentionally excluded from its own closure.

R1's original identity manifest and reviewed source identities were compared with R2. The only subsequent production change is the bounded historical controller correction; the remaining differences are its regression and review/progress documentation. R1 evidence was not renewed by replacing its hashes.

## Findings

**None remain.**

**EFC-R1-F01: resolved.** `BoundedDualWorkerController.run` now retains its release frontier across collection iterations and advances it only while releasing source-ordered items. This accounts for a predecessor that completed later without incorrectly charging an earlier source for a later item collected first.

The new regression exercises the actual threaded runtime, controller and export serializer. It establishes collection order `0,2,1`, source-indexed completion times `300,200,1500`, ordered waits `0,100,0`, unchanged source publication order, and exact generation-duration/RTF values. The retained red receipt demonstrates the original incorrect waits `0,0,0`; the green receipt covers the correction.

## Acceptance review

| Criterion | Result |
| --- | --- |
| EFC-01 | Accepted. Reinsertion compacts stale registrations before making the element current again. Direct, mounted and browser measurements cover duplicate growth while preserving append/teardown bounds and locator ordering. |
| EFC-02 | Accepted. Pending cancellation, started-work ownership, prevention of lazy reload, startup/close containment and repeated close are covered by deterministic tests with benign isolated children. Cleanup failure remains observable. |
| EFC-03 | Accepted after F01 correction. Worker success/failure timestamps survive delayed collection and GPU tie-breaking; ordered-release and exported timing consumers now have discriminating coverage. |
| EFC-04 | Accepted within development-adapter scope. The inspected pinned API supports observing final sampled EOS before information is discarded. No duration heuristic is used. Exhaustion/missing evidence fails through the existing service boundary without successful audio or segment completion. |
| EFC-05 | Accepted. Both validators reject terminal high surrogates while retaining valid pairs and existing public-ingestion behavior. |
| EFC-06 | Accepted. Native acquisition, snapshot disclosure and renderer fallback agree on derived 7,042-MiB available RAM. Frozen package bytes and their 4,096-MiB floor remain intact; other gates and loaded-owner continuation are preserved. |
| EFC-07 | Accepted. Successful explicit compatibility recheck refreshes optional state with action/request identity protection. Continued incompatibility and superseding actions remain safe; download and activation stay explicit. |
| EFC-08 | Accepted for mutable service source and regenerated Piper. Oversized integer conversion is translated at the decoder boundary, and loaded-service rejection cleans up without exposing input contents. Frozen Chatterbox is explicitly excluded. |
| M0–M3 | Implementation, selected host validation and this exact-patch independent review satisfy the submitted behavioral acceptance scope. Documentary archival remains a subsequent step requiring review of its actual patch. |

Privacy, bounded-memory, cancellation, stable-location and persistence constraints remain satisfied within the reviewed scope. No new process, network or persistence owner is introduced; the canonical diagram remains applicable.

## Test evidence reviewed

All execution is **attributed to the coordinator's normal local PowerShell session outside the managed sandbox**. I inspected source, receipts, input identities and output; I did not execute tests, builds, linters or formatters.

Fresh correction evidence:

- `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_dual_worker.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_benchmark_dual_worker_cli.py services/tts/tests/test_benchmark_dual_worker_result_cli.py services/tts/tests/test_benchmark_v5_authority.py` — **57 passed**, exit 0.
- `pnpm.cmd lint:python` — passed.
- `pnpm.cmd typecheck:python` — passed; 181 source files.
- `pnpm.cmd format:check:python` — passed; 184 files.
- R2 evidence, local-link and whitespace checks — passing receipts; link output reports 354 checked targets and no missing targets.

Receipt and input-manifest hashes matched. After the fresh Python checks, their recorded source inputs differ only in review/progress documentation. The existing pytest cache warning is retained and does not conceal a failed test.

## Explicit unchanged-evidence retention decision

**Retain the unaffected current-task evidence accepted in R1.** No earlier-task runtime PASS is substituted.

- G3: 97 EPUB passes.
- G4: six unchanged files' original passes plus the corrected two-file run's 40 passes; the original command remains recorded as failed.
- G5: unaffected isolation, Qwen, protocol, service, conformance and release-core results. The new 57-test run supplies fresh evidence for the changed historical controller and its consumers.
- G6: the single regenerated Piper artifact, offline ES/EN smokes, package check and inventory check.
- G7: both Rust modes' 25 host-profile passes and 60 optional-profile passes, preserving two ignored diagnostics per mode.
- G8: original passing churn/restoration scenarios and the corrected Recheck-only pass, preserving the original fixture failure.
- G9: final native build/smoke and recorded clean ownership teardown.
- Unchanged TypeScript/Rust format, lint and type evidence.

The R1-to-R2 identity comparison establishes that service/core, EPUB/shared, desktop/native, browser, dependency and configuration inputs were not changed by this correction. Historical benchmark modules are excluded from the Piper payload. Repackaging or repeating unrelated runtime gates is therefore unnecessary for R2.

## Remaining uncertainty and required next action

No blocking uncertainty remains for this exact reviewed scope. Real Qwen/dual-worker model benchmarks, support promotion, Qwen post-seek repair, frozen Chatterbox decoder repair, hosted CI, installer lifecycle and live acquisition remain outside the established acceptance claims.

Required correction: **none**. Persist this immutable report, perform the intended documentary closeout, and request a new review of that exact resulting patch. This approval does not cover an unseen archive.

This is a Change Review Report, not a Validation Report or authorization to commit, push, create a PR, merge or publish.
