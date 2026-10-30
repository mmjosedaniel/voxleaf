# Change Review Report

Review ID: **EFC-R1-20261030**  
Task ID: **EFC**  
Verdict: **CHANGES_REQUESTED**

Base commit and reviewed HEAD: `f4e3b585114a1fda0e3bd9e72b8c31a007121d5a`  
Branch: `codex/eight-finding-minimal-corrections`

Reviewer: independent `change_reviewer`, GPT-6 Astra high. This report was
returned read-only and persisted by the coordinator; the reviewer ran no tests.

Reviewed paths and identities: the 60-path `review-R1-identities.md`, plus the
unchanged supporting paths below.

Manifest SHA-256: `951d0613ae0c719fbbc6c8ec90a55b37d414302b9e58d7c095fa3e12dad6833f`  
Complete tracked diff SHA-256: `a83279bf23b781c2fcadd5fc93954e2f13d19a3a9c80c9d662e6b4ed6c02fa4a`

**Identity recheck: PASS.** Before/after inspection, HEAD and branch remained
unchanged, the index remained empty, all 60 supplied SHA-256/filter-aware blob
pairs matched, and the stored diff matched the current tracked patch.
Supplementary paths remained identical to HEAD and retained the identities below.

The supplied manifest incorrectly displays tracked modifications as `M ` because
its generator strips leading whitespace. Independently captured canonical
porcelain status is **` M` for every modified tracked path**, `??` for the five
untracked files, and unchanged for supporting paths. This is a representation
error, not staging or source drift. Correct the generator for the next report
without modifying R1's immutable evidence.

## Findings

**EFC-R1-F01 — P2, confirmed: true completion timestamps produce incorrect
ordered-wait metrics.**

- Location: `services/tts/benchmarks/dual_worker_controller.py`,
  `BoundedDualWorkerController.run`, particularly the reset of `release_time`
  at line 311 and the head-of-line calculation at line 334.
- Trigger: source 0 on GPU finishes at 300; source 1 on CPU finishes at 200.
  Both futures are complete when collected. The preserved GPU tie-break returns
  sequence 0 first, then sequence 1.
- Consequence: the controller releases source 0 at 300, then resets
  `release_time` to 200. It records source 1's head-of-line wait as zero,
  although source ordering required waiting until at least 300.
- Evidence: the new runtime timestamp test explicitly produces `(300, 200)`,
  but stops before controller assertions. The release frontier exists only
  within one collection iteration. `dual_worker_official.py` exports the value;
  `dual_worker_result.py` derives its maximum; `dual_worker_playback.py`
  accumulates it into stall seconds.
- Correction: preserve an ordered-release completion frontier across collection
  iterations, based on released source predecessors rather than arbitrary
  collection order. Add deterministic runtime/controller coverage for unchanged
  finish times, generation duration/RTF inputs, source order and nonzero wait.
  Also cover a later source collected before its predecessor to avoid
  collection-order overcount. Preserve GPU tie-break, schemas, no-retry policy
  and frozen results.

No other actionable runtime finding was established.

## Acceptance review

| Criterion | Assessment |
| --- | --- |
| EFC-01 | Satisfied. Guarded compaction precedes reinsertion; direct/mounted three-block geometry tests and browser/native controls pass. Append/teardown bounds remain. |
| EFC-02 | Satisfied in historical-tool scope. Invalidates/cancels pending work, retains started ownership, prohibits lazy reload, drains and sweeps startup handoff. Benign-child/barrier/repeated-close tests pass; cleanup failures surface. |
| EFC-03 | Not satisfied: F01 prevents acceptance of ordered-wait consumer behavior. |
| EFC-04 | Satisfied for development-adapter correctness. Pinned SDK evidence substantiates the final sampled-token seam. Missing completion fails closed; equal-length exhausted/EOS cases and service cleanup/no-success are tested. |
| EFC-05 | Satisfied. Terminal high surrogates reject; valid pairs and public ingestion retain coverage. |
| EFC-06 | Satisfied. Derived 7042 MiB native admission/disclosure matches renderer. Frozen 4096 floor, other gates, Piper and loaded continuation remain unchanged. ADR-0068 records policy. |
| EFC-07 | Satisfied. Fresh snapshot follows successful explicit probe; action/request guards preserve superseding actions. Mounted and browser coverage pass without automatic acquisition/activation/speech. |
| EFC-08 | Satisfied for mutable service and regenerated Piper. Conversion ValueError maps to malformed JSON with separate ProtocolFailure handling and cleanup. Frozen Chatterbox is explicitly excluded. |
| M0–M3 | Scope/evidence present; M1/M3 acceptance incomplete because of F01. Archive requires a new exact-patch review. |

Local EPUB processing/inference, memory-only audio, stable locators and current
process/persistence boundaries remain preserved. No diagram change is required.

## Test evidence reviewed and retention decision

The coordinator ran tests in normal local PowerShell outside the managed
sandbox. The reviewer inspected receipts, snapshots and output, without running
tests/builds/linters/formatters. Receipt hashes in `host-receipts.md` and inspected
input-manifest hashes matched originals.

- G3: 97 EPUB tests passed.
- G4: original 162 passes/3 fixture failures retained; corrected two-file run
  40 passed. Retain the six unchanged files' results; the original command
  remains failed.
- G5: 151 Python passed; concrete-runtime five cases passed again after its
  annotation/import/format correction. Cache warning does not invalidate tests.
- G6: one Piper regeneration with offline ES/EN smokes; package/inventory checks
  passed; generated differences limited to protocol entry/aggregate identities.
- G7: 25 host and 60 optional passes/2 ignored in each Rust feature mode.
- G8: retain original EFC-01/canonical-restoration passes and Recheck fixture
  failure. Corrected Recheck-only run passed.
- G9: wrapper-owned native build/smoke passed, final binary
  `27cb0659c3d1228844f0518a652749e01b3a96cdf0976e8581f3998f6edd8e34`;
  no new owned processes/scratch roots.
- Final supplied format, lint, type, evidence and whitespace results pass for
  their recorded scope.

**Same-task retention is accepted for the reviewed unchanged closures.**
Original inventories confirm the disclosed test-only corrections, generated-core
and documentation changes. No EPUB inputs changed after G3. G4's other six files
and production inputs remained unchanged. No Python production changed after G5.
G7/G9 consumed regenerated core; passing G8 restoration spec remained unchanged.
Newly discovered files were documentation/evidence only.

Retention does not establish F01. After correction, rerun the smallest affected
historical-worker/controller/result checks. Unrelated gates need not repeat
without a consumed-input change.

## Remaining uncertainty and required next action

No real Qwen/dual-worker model benchmark was performed or required. No support
promotion, Qwen post-seek repair, frozen Chatterbox decoder repair, hosted CI,
installer journey or live acquisition is established.

Correct F01, obtain fresh affected host evidence and submit a new immutable
review. Include canonical statuses and supplementary paths. Preserve this report
and original hashes. This report grants no Git/publication authorization and
does not approve an unseen plan archive.

## Supplementary unchanged supporting identities

All are `UNCHANGED`; filter-aware blobs equal reviewed HEAD.

| Path | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| `docs/architecture/overview.md` | `bf7dbdaf24c890e879cd4393d2539cc696347f7b30960793be9af992bdc24e0e` | `fbb2d4e4d6ccf062356852d6e314566d60f438a1` |
| `docs/development/evidence-retention.md` | `97c4cfedd3165c9229c49ebf25dc1f09e9a72271685e73e0ac9e40b7fe38cdb0` | `b4079c65206801bdbc5fc1608ecee49f86205fb4` |
| `docs/architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md` | `7253af0bbb1103ee7ca57bdb19b61de53c3b7e558806fa5a6f2dad7e59c4b699` | `2d9c6d70e7a656c0f9426cef320040c9722ab1dc` |
| `docs/architecture/decisions/ADR-0044-use-measured-capacity-for-chatterbox-vram-admission.md` | `50aee0d2cc8ae6b1e54a404544a25a171323738cf30ac02b3b63344e1fab9b32` | `4834096cd05bd0eeb9f9c02f9ae8ecc8157e0323` |
| `docs/architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md` | `fcb60ff743e7d8500c13ad003e7b9a12ac90862f7be75827f6dc22d3665d4a68` | `0a6cc045930bc8973a73a91c088e21555fc23467` |
| `docs/architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md` | `ef525b8e59fd7c98d83a6aeddcd70ec3ecb81b3a04d565cd3e58a121a80b31fa` | `424f0082e6fff6c6a9b34e8173c360239664f9ef` |
| `docs/architecture/tts-feasibility-profile-v5.md` | `c60306a876784de9f730870b05d75c1ffa1b6e5f63f24fb35a014e53e7854bb3` | `2f4b8f6762e18ac7bc81fd8c1f97b15e868e8cd0` |
| `services/tts/tests/test_benchmark_dual_worker.py` | `a45af6cbc13c6a1d509d9726c24aefb73ddea6a0762971290c3fecd2158e0acc` | `a14ff525ca769d3400a1906e9fefe939cb85c277` |
| `services/tts/tests/test_benchmark_isolation.py` | `1caff92d36294240cd526c3f054e2f4db0f3f49ad44f5e88a961486268018fcd` | `2e06e75cd192904c9ff830a2c6dc2257f9755a4e` |
| `services/tts/tests/test_release_core.py` | `aa5dc0526b62b576b657c6d80c97d8d2fba9720f5198ac879f7d2445f39a35ea` | `9aee8e32714237637842046d3c9b9154f127d99f` |
| `services/tts/tests/test_contract_conformance.py` | `a3f6f5608367e7a3cb7351b65c9d91a45dce4143f44cc9a2bcca5028664ac48b` | `bb637b500c93a068ae9dad25ed515c96c05a5975` |
| `services/tts/benchmarks/dual_worker_official.py` | `a79e50f1bd7cdb3a622965bed65fb114271c8825e7f3ef32c76f41157747732c` | `93fcdd688410f3b5c78f3bd9c0681b6dbe221715` |
| `services/tts/benchmarks/dual_worker_result.py` | `fc7aefd6b3f3ce318c56926989a3666067744b6c43f60bd8eb96086fcefcc16a` | `c967bbcae999dffcb9721eee6a14917a874cb87b` |
| `apps/desktop/src/tts/hardware-profile-compatibility.test.ts` | `83e35080eba0053259ca3e5fef50259ce04f432450841313821868daa1abf5bd` | `3374091ca842ac29a4e847124c3d9de4254cd68e` |
