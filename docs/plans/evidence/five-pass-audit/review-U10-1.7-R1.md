# Change Review Report

Review ID: **FPA-U10-1.7-CR-R1-20261111**  
Task ID: U10 case 1.7 and renewed U9 case 1.5  
Verdict: **APPROVE**  
Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

**Reviewed paths and identities:** Incorporated closed 48-path manifest `tmp/evidence/five-pass-audit/u10-1.7-review-inputs.txt`, including statuses, SHA-256 hashes and filter-aware blob identities.

- Manifest SHA-256: `E9FBC90B5ED78E87F866E4F1049A945A3978CCCFAAB83B4E5D4D01FC4A51FFBC`
- Cumulative patch: `tmp/evidence/five-pass-audit/u10-1.7-review.diff`
- Patch SHA-256: `6CB3EE37E4E09A7F88A7FC23B2EE7A70B39480DCE82F24A7759583BF8D77C09D`

**Identity recheck: PASS.** All 48 path identities and HEAD matched before and after inspection; the index remained empty. The current diff matches the supplied 802-line artifact. All 449 expanded evidence inputs match current files and identical before/after manifests, including top-level authorities/fixtures and base CPython executable/DLL identities.

**Acceptance review:**

- **U10/1.7: APPROVE within declared unit scope.** Successful startup transfers periodic sampling, final sampling and both probe-close attempts to one monitor thread. The handoff event prevents a partially started thread from accessing caller-owned probes after startup failure.
- `finish()` signals and performs a bounded join. A live thread remains retained and produces `cleanup-failed`; the caller neither samples nor closes underneath it. Later successful finalization and repeated `finish()` do not resample or reclose.
- Initial-sample/start failures close both probes in the caller. Periodic, final-sample and close failures remain observable through grouped causes; one close failure does not skip the other close attempt.
- Successful v5 final sampling still precedes runtime closure. Frozen thresholds, authorities, measurement windows and historical results remain unchanged. U11’s different finalization order is not imposed here.
- **U9/1.5: renewed APPROVE.** Its unchanged bounded subprocess capture, exit-status pairing and exact Windows ownership logic remain supported by the fresh 23-test CLI rerun and static checks.

The earlier U9 capture omitted relevant top-level authority inputs. This report uses the expanded capture and fresh rerun to close that evidence gap; it does not modify the original immutable report or substitute its PASS.

**Test evidence reviewed:** Supplied normal-host PowerShell results; this reviewer executed no tests.

- U10 RED01: **four intended failures**.
- GREEN03: **92/92 passed across five suites**, including all 23 U9 CLI tests.
- Scoped Ruff format/check, mypy across four Python paths, and scoped diff check: **all exit 0**.

Evidence input SHA-256: `BE238AF42A16470DEE2DD0F0294EB15362409CC8F653C5662CDD60F3BC46EADB`. GREEN03 log SHA-256: `2904F2C7230258EFAAA2B5EA3E71E892A75782EEC41E377860851E0E103E9E04`.

**Findings:** None.

**Remaining uncertainty:** Final Python/static and integrated acceptance remain pending. Event-gated synthetic threads establish lifecycle behavior, not real-hardware measurement accuracy or model performance.

**Required next action:** None for this scoped review. Complete outstanding plan gates before final acceptance. This report does not authorize Git mutations.
