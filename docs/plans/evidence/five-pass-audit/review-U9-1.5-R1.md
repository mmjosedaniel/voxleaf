# Change Review Report

Review ID: **FPA-U9-1.5-CR-R1-20261111**  
Task ID: U9 case 1.5  
Verdict: **APPROVE**  
Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

**Reviewed paths and identities:** Incorporated closed 14-path manifest `tmp/evidence/five-pass-audit/u9-1.5-review-inputs.txt`, including statuses, SHA-256 hashes and filter-aware blob identities.

- Manifest SHA-256: `C930239B9706FF1492E6CA3167D1B02600930C87BEF8C9B1D518F39CD0E654C5`
- Exact patch: `tmp/evidence/five-pass-audit/u9-1.5-review.diff`
- Patch SHA-256: `672BE3CB1E62C983C62841E6345FB8D5EF0B0CA1BDBCFA4A45CCA832CCA17BFC`

**Identity recheck: PASS.** All 14 path identities and HEAD matched before and after inspection; the index remained empty. The current three-file diff matches the supplied 457-line artifact. All 358 final test/static input rows match current files and identical before/after manifests.

**Acceptance review:** Case 1.5 satisfies its declared unit scope.

- Binary stdout capture enforces the 16 KiB output limit during reading, with one overflow-probe byte. Stderr is discarded. Encoded stdin is bounded before process creation.
- Concurrent stdin/stdout owners avoid sequential pipe deadlock. Their two completion messages are bounded by construction. I/O and child exit consume one absolute measurement deadline.
- Suspended creation and exact Windows Job assignment remain intact. Teardown terminates the owned tree, reaps the process and joins stream owners within the cleanup deadline. It reports failure rather than closing streams beneath live owners.
- Validated PASS requires exit 0; validated FAIL requires exit 2. Malformed output and mismatched status/exit pairs produce content-safe failure.
- Excluded case 1.6, receipt validation, private-stdin handling and historical benchmark authority remain unchanged.

The test changes retain existing ownership assertions and add meaningful overflow, concurrency, malformed-output and exit-pairing controls. Short parameter IDs and corrected annotations address the preserved test-infrastructure/static failures without weakening behavior assertions.

**Test evidence reviewed:** Supplied normal-host PowerShell results; this reviewer executed no tests.

- Focused RED01: **four intended failures, two passing controls**.
- `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_cli.py`: **23/23 passed**, including real Windows worker/descendant cleanup.
- Scoped Ruff format/check and mypy commands recorded in the receipt: **all exit 0**.

Final evidence input SHA-256: `C464ECFE3843257D7E89B494F9F0A9BCD7082D5216132E3D57199883CFD2F8F6`. GREEN02 log SHA-256: `0E38F4D63E7EA9D8EEE6621E9B2022A627B923EEF17DBF9C6D3773BEAC46F612`.

**Findings:** None.

**Remaining uncertainty:** Final Python/static and integrated acceptance remain pending. Synthetic subprocess evidence does not establish model-inference performance or benchmark eligibility.

**Required next action:** None for this scoped review. Complete outstanding plan gates before final acceptance. This report does not authorize Git mutations.
