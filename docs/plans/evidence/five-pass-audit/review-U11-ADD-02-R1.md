# Change Review Report

Review ID: **FPA-U11-ADD-02-CR-R1-20261111**  
Task ID: U11 / ADD-02  
Verdict: **APPROVE**  
Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

**Reviewed paths and identities**

This report incorporates the complete 20-path closure, including status, SHA-256 and filter-aware blob identities, in:

`tmp/evidence/five-pass-audit/u11-add-02-review-inputs-final.txt`

SHA-256: `9A465218A676C30B2CF65FC0AD06F34D403680DEC05AFFDFB6FB90FB75895F85`

The exact six-file, 1,276-line diff is:

`tmp/evidence/five-pass-audit/u11-add-02-review.diff`

SHA-256: `31D3AEB82535F61BADDA6E1A879C818A2F50BD813F979D76235F4CBD032DEE26`

The manifest separately binds the full new ADR-0072 and preparation document. Earlier U9/U10 README paragraphs are cumulative context; this report does not renew those units.

**Identity recheck: PASS**

Before and after inspection, all 20 path identities and 15 manifested evidence artifacts matched. The final identity snapshot at `2026-11-11T23:37:25.0921605Z` confirmed unchanged HEAD and an empty index. The saved diff matches the current scoped Git diff exactly.

All 449 final test/static input identities match current files. Their four before/after manifests share SHA-256:

`308BA756A71100DF4425695BC62B7CFF152FB74142A3BFAEB7D0C24E77F45F75`

The 107 frozen authority identities match current files and the preserved baseline; both frozen manifests have SHA-256:

`FDA5C5050EA7B7CBFF269AFABDADE5F5234AB94C37887B207A76DFCE73F46680`

**Acceptance review**

ADD-02 passes within its declared unit scope:

- Safety observation starts before the first factory. Latched stops prevent subsequent factory, load and dispatch admission, including later cancellation trials.
- Active loads bind an owner token to the exact connection and attempt. Foreign or retired owners cannot terminate replacement work. Failed cleanup retains exact retry ownership.
- The runner aborts and joins its load receiver before ordinary candidate closure, then shuts down monitoring. The CLI retains outer GPU probes while shutdown remains pending.
- The sample lock serializes the cold-to-measured transition after five cold cleanups. Cold samples cannot contaminate measured accumulators, and resetting measurement does not clear a safety latch.
- Early or incomplete execution fails before session creation. It does not manufacture successful cancellation rows. Existing primary-error and cleanup-error propagation remains intact.

The revised derivability control observes its stop during final measurement after required work. Its existing derivation assertions remain. The separately injected CLI failure verifies the output boundary; actual runner and isolated-child tests establish safety and ownership behavior.

**Test evidence reviewed**

Attributed normal-host PowerShell evidence, not tests executed by this reviewer:

- RED01: four intended failures covering cold, measured and trial loads plus first-factory rejection.
- GREEN03: **69/69 passed** across official batch, isolation, CLI and execution suites, using Python 3.12.10, pytest 9.1.1 and uv 0.11.29.
- Static03: scoped Ruff format/check, mypy and diff check all exited **0**.

Exact commands and UTC intervals are preserved in the receipt and bound logs. Earlier failed fixture/static attempts remain preserved. The pytest cache-write warning did not prevent test execution.

**Findings:** None.

**Remaining uncertainty:** Case 2.3 cancellation-proof semantics and prospective v14 routing remain unaccepted. No model inference, hardware performance or engine-entry claim is established. Final Python and integrated plan gates remain pending.

**Required next action:** No ADD-02 correction required. Complete the remaining declared cases and integration gates before final acceptance. This approval grants no Git authorization.
