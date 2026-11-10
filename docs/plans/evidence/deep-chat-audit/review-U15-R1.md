# Change Review Report

Review ID: **DCR-U15-R1-ASTRA-20261109-01**
Task ID: **U15 / DCR-17 / DCR-18**
Verdict: **CHANGES_REQUESTED**
Acceptance boundary: **Local unit review only**

Base commit and reviewed HEAD: both `d375ecc84261c404e855c055e0ecc8949a97caaf`.

Reviewed paths and identities: the closed 27-row table under `Closed reviewed inputs` in `docs/plans/evidence/deep-chat-audit/u15-dcr-17-18-execution.md`, receipt **DCR-U15-EXEC-20261109-01**, is incorporated by reference. Its reviewed document SHA-256 is `c53ebd91a26032a287d4e9fe32e468065b1249915b448a4c771e8897c7b35f4f`. Preserve these receipt bytes with this report. The first 12 rows are the unit patch: five implementation modules (`batch_official.py`, `batch_cli.py`, `batch_result.py`, `batch_result_cli.py`, `v13_authority.py`), three owner test files, the v13 profile, two v13 schemas, and `docs/development/testing.md`. Remaining rows identify the U7 supporting implementation and unchanged legacy authority/configuration/test inputs. Other unit patches and plan/index edits are excluded.

Identity recheck: **PASS.** All 27 current SHA-256 values, filter-aware blobs and statuses matched the final GREEN snapshot at initial inspection and final recheck. Base/HEAD remained unchanged and the staged index remained empty. Supplied RED and final GREEN snapshots are respectively identical before/after execution. New files were inspected in full.

Acceptance review:

- **DCR-17: correction substantially implemented; local acceptance withheld.** Candidate close failures stop later trials and produce typed non-derivable outcomes. Complete raw cleanup failures invalidate the cleanup audit and both viability conclusions even with zero resource residue. Explicit v13 execution, separate journals, legacy derivation routing, and pinned successor profile/schema identities are present. Finding U15-F2 leaves the CPU admission boundary incomplete.
- **DCR-18: monitor ownership substantially implemented; local acceptance withheld.** The outer cleanup scope covers start/factory/load/execution/trials; candidate cleanup precedes monitor shutdown. Shutdown is bounded, retains an unjoined thread, and is separated from metric validation. Real-thread tests cover startup interruption, retained-handle retry, factory/load failure and the normal cancellation window. Finding U15-F1 violates preservation of the real primary failure.
- U7 isolation/controller source identities remain unchanged. The official caller uses their batch cancellation and identity behavior. Historical v4 profile, corpus, schemas, result files and authority module remain unchanged; v4 derivation remains available. The reviewed tests do not establish any new hardware result.

Test evidence reviewed, attributed to the implementer's normal local PowerShell receipt:

1. RED: `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_batch_official.py -k "dcr_17 or dcr_18"` — exit 1; three intended failures, four deselected, using unchanged production.
2. Final GREEN: `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_benchmark_v13_authority.py` — exit 0; 34 passed in 3.17 seconds. Final run interval: 2026-11-09 20:01:43.2229236–20:01:46.6900836 UTC.
3. Scoped Ruff, mypy and Prettier results were inspected, including retained initial lint failures and repair. These do not replace pending G7. The earlier 33-test GREEN is not substituted for the final run. No historical test result is reused.

Environment recorded: Windows NT 10.0.26200.0, PowerShell 7.6.9, Python 3.12.10, pytest 9.1.1, uv 0.11.29. The reviewer ran no tests, builds or formatters.

Findings:

**U15-F1 — P2: Simultaneous cleanup failure erases the real adapter's primary diagnostic.**

- File/symbol: `services/tts/benchmarks/batch_official.py:95`, `_cleanup_scope`; callers `_run_measured_batch` and `execute_official_v13`.
- Trigger: the real isolated candidate raises `AdapterOperationError("load-failed")` during measured loading, then monitor shutdown fails or times out. The primary is not an `OfficialBatchError`, so the secondary-cleanup branch replaces it with `OfficialBatchError("internal", ...)`.
- Consequence: the failed receipt retains cleanup information but loses the original content-safe failure code, contrary to the plan's explicit primary-plus-cleanup requirement. The same branch loses other recognized adapter/batch primary codes.
- Evidence: lines 95–99 preserve only `OfficialBatchError`; `IsolatedBenchmarkAdapter` uses `AdapterOperationError`. The factory/load test at `test_benchmark_batch_official.py:339` instead injects `OfficialBatchError("synthetic-primary")`, leaving this boundary uncovered. This is a confirmed static control-flow defect, not a reviewer-executed reproduction.
- Bounded correction: retain the recognized content-safe primary diagnostic when attaching candidate/monitor cleanup failures, without exposing arbitrary exception text. Add a regression through the actual runner using the adapter exception type plus failing monitor shutdown; assert original code, cleanup code, non-derivable receipt and shutdown attempt.

**U15-F2 — P2: A schema-invalid committed v13 GPU result can authorize CPU execution.**

- File/symbol: `services/tts/benchmarks/v13_authority.py:100`, `load_v13_cpu_admission`.
- Trigger: start from the qualifying committed GPU fixture, remove a required nested measurement such as `counts.coldLoads` (or replace `host` with an empty object), and commit those modified bytes while keeping the checked safety-stop/admission fields intact.
- Consequence: admission succeeds although the record is not a valid complete v13 result. Matching HEAD proves the bytes are committed, not that the GPU evaluation qualifies under the pinned schema. This differs from legacy v4's fixed known-result digest.
- Evidence: lines 120–149 check top-level key membership and selected nested fields only; line 150 calls `_verify_cpu_admission`, which checks placement/admission fields and returns immediately for GPU placement. Neither invokes complete schema validation. The v13 schema requires the v4 `counts` definition, including `coldLoads == 5`. The existing positive CPU test validates its fixture separately before committing, so it does not test this rejection path.
- Bounded correction: require complete v13 result validity and the existing qualifying safety-stop/cleanup conditions before issuing CPU admission, while preserving the candidate-lock dependency boundary. Add a committed malformed-result negative control and retain valid committed, uncommitted, legacy-version and mismatched-admission controls.

Remaining uncertainty: Findings are established by source inspection and still require host regression reproduction. Final G4 integration, G7 global static checks, and final integration review remain pending. V13 remains unmeasured.

Required next action: Correct U15-F1 and U15-F2 within the affected owners, preserve the current failed/green evidence, run the new regressions and affected host checks, then request a new immutable review for the revised patch. This report grants no Git authorization.
