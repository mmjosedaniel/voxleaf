# Change Review Report

Review ID: **DCR-U15-R2-ASTRA-20261109-01**
Task ID: **U15 / DCR-17 / DCR-18**
Verdict: **APPROVE**
Acceptance boundary: **Local unit review only**

Base commit and reviewed HEAD: both `d375ecc84261c404e855c055e0ecc8949a97caaf`.

Reviewed paths and identities: incorporated by reference from the complete 27-row `Closed reviewed inputs` table in `docs/plans/evidence/deep-chat-audit/u15-dcr-17-18-execution-r2.md`, receipt **DCR-U15-EXEC-20261109-02**, at SHA-256 `2d5f3352e7b1d9e043e7662f3c13630150109b2f1f8fb0d45ea0f2e00b4ae5bd`. Preserve those receipt bytes with this immutable report. Its first 12 rows constitute the unit patch; the other rows are supporting inputs, including unchanged U7 source and legacy authorities. The R1 receipt and CHANGES_REQUESTED report remain historical and are not rewritten. Other unit patches and plan/index changes are outside this approval.

Identity recheck: **PASS.** All 27 path statuses, SHA-256 values and filter-aware blobs matched the final R2 GREEN snapshot at initial inspection and final recheck. Base/HEAD remained unchanged; the staged index is empty. The recorded correction RED and final GREEN snapshots are respectively identical before/after execution. The supplied tracked patch equals the current seven-path tracked diff; all five new implementation/test/profile/schema files were inspected separately.

Acceptance review:

- **DCR-17: locally approved.** Candidate cleanup failure stops later trials and yields a failed non-derivable receipt. Complete raw records carrying typed cleanup failure or `cleanup-failed` fail the cleanup audit and both viability conclusions even with zero measured residue. Version selection, separate journals, pinned v13 authority/schema identities, and legacy v4 derivation remain intact.
- **DCR-18: locally approved.** Candidate cleanup precedes monitor shutdown across start, factory, loading, execution and trials. Shutdown uses a bounded join and retains an unjoined handle for retry; measurement validation is separate. Existing real-thread tests retain the normal cancellation window and cover interruption and failed acquisition.
- **U15-F1: resolved.** `_cleanup_scope` now preserves recognized `AdapterOperationError` and `BatchBenchmarkError` codes when adding independent cleanup metadata. The new real-runner-to-CLI regression asserts `load-failed`, `monitor-shutdown`, candidate-before-monitor cleanup ordering, exit 2, and `eligibleForDerivation: false`.
- **U15-F2: resolved.** `load_v13_cpu_admission` validates the complete pinned v13 summary before applying qualifying safety-stop/cleanup conditions. A committed result missing `counts.coldLoads` is rejected. The candidate-side caller delegates schema validation to the base environment through fixed offline/no-sync/locked CLI arguments, with a 15-second subprocess timeout, closed receipt fields, and result-digest checks against both HEAD and current bytes before model/preflight acquisition. The candidate lock is unchanged.
- Legacy v4 authorities/results and U7 implementation identities remain unchanged. Test assertions were strengthened, not weakened. No model, hardware measurement, performance result, public TTS protocol or audio-persistence claim is introduced.

Test evidence reviewed: supplied normal local PowerShell evidence under `tmp/evidence/deep-chat-audit/U15/`, attributed to **DCR-U15-EXEC-20261109-02**. The reviewer ran no tests, builds or formatters.

1. Correction RED: `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_benchmark_v13_authority.py -k "preserves_adapter_primary or cpu_admission_requires_own"` — exit 1; both requested regressions failed on the R1 production patch, 33 deselected.
2. Final GREEN: `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_benchmark_v13_authority.py` — exit 0; 36 passed in 3.48 seconds. Recorded interval: 2026-11-09 20:09:59.6873256–20:10:03.4714335 UTC. Includes actual base-subprocess execution, schema/admission controls and legacy validation/derivation controls.
3. Final scoped Ruff formatting/lint outputs pass on eight files; mypy passes on nine sources. The intermediate mypy failure and repair remain recorded. The three JSON inputs retain their identities from the earlier scoped Prettier result; no new Prettier execution is claimed. These scoped results do not replace final G7.

Recorded environment: Windows NT 10.0.26200.0, PowerShell 7.6.9, Python 3.12.10, pytest 9.1.1, uv 0.11.29.

Findings: **none remaining**.

Remaining uncertainty: Final G4 combined integration, G7 repository-wide static gates and final integration review remain pending. V13 remains unmeasured; this report makes no hardware or model-viability claim.

Required next action: No further U15 correction required. Complete applicable integration gates and obtain final exact-patch review before overall acceptance. This report is not a Validation Report and grants no Git authorization.
