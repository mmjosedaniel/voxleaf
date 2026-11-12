# U11 ADD-02: safety observation and active load containment

Status: unit APPROVE [FPA-U11-ADD-02-CR-R1-20261111](review-U11-ADD-02-R1.md);
combined acceptance pending. HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`. No Git mutations authorized.

The five-file correction changes batch_official.py and isolation.py plus their
official/isolation/CLI tests. Safety observation starts before the first cold
factory. A latched stop is checked at factory, load and dispatch boundaries.
The exact load token and connection own abort/reap, and the receiver finishes
before candidate closure. A separate sampling lock serializes the fifth-cold
cleanup measurement transition while preserving the safety latch. Candidate
cleanup precedes monitor shutdown; outer probes remain owned until shutdown.

Incomplete required work fails before raw session creation. The old test that
injected a stop from startup formerly accepted five fabricated cancellation rows;
its derivability control now injects a genuine final measurement stop after all
required work. Separate real runner early-stop tests and a CLI-boundary injected
runner error prove their respective no-further-work and no-output contracts.
The CLI control does not claim to execute the real stopped runner end to end.
Case 2.3's proof semantics remain pending under ADR-0072; frozen v13 derivation
is not reinterpreted by this execution fix.

## Normal-host checks

All commands ran in local PowerShell outside the managed sandbox, uv 0.11.29,
Python 3.12.10 and pytest 9.1.1. Logs and paired expanded input manifests are
retained under ignored `tmp/evidence/five-pass-audit/`.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_batch_official.py -k five_pass_add_02
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_batch_execution.py
uv run --project services/tts --locked ruff format --check services/tts/benchmarks/batch_official.py services/tts/benchmarks/isolation.py services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_batch_cli.py
uv run --project services/tts --locked ruff check services/tts/benchmarks/batch_official.py services/tts/benchmarks/isolation.py services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_batch_cli.py
uv run --directory services/tts --locked mypy benchmarks/batch_official.py benchmarks/isolation.py tests/test_benchmark_batch_official.py tests/test_benchmark_isolation.py tests/test_benchmark_batch_cli.py
git diff --check -- services/tts/benchmarks/batch_official.py services/tts/benchmarks/isolation.py services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_batch_cli.py benchmarks/tts/README.md
```

RED01: four intended failures, eleven deselected. Real Event-held first cold,
measured and cancellation-trial loads are not aborted/reaped on the old code;
a known stop also permits a factory. Fixtures safely release held work. RED
before/after input SHA-256 is
`2ABE1D18FD9C72B5DFC2AA48444F4492ED21DB0A9F4D374B0978CBBD20966559`.

GREEN03, 23:32:14.113–23:32:23.128 UTC: **69/69 pass**, exit 0.
Static03, 23:32:26.690–23:32:27.620 UTC: all four commands exit 0.
Coverage includes real spawned child ownership, stale reply, stop between
launch/send, monitor transition with a cold sample in flight, measured dispatch,
between-trial stop and the successful/failing CLI output boundary.

Preserved diagnostics: GREEN01 passed 68/69; the new fixture assumed batch-1
instead of the actual frozen call index 0. Static01 also rejected an invalid
public error-code sentinel, now replaced by an internal safety interruption.
GREEN02/static02 exposed a nonexistent request_id in that fixture; the final
assertion derives the exact batch request ID from the observed call_index.
These are fixture/static corrections, not additional product reproductions.
Existing pytest cache-write warnings remain explicit and no cache was deleted.

Normal-host frozen comparison at 23:32:31.061–23:32:31.197 UTC matched all 107
pre-change paths, membership and SHA-256, with no additions in frozen trees.
The manifest remains
`FDA5C5050EA7B7CBFF269AFABDADE5F5234AB94C37887B207A76DFCE73F46680`.
No model/GPU performance result is claimed. Final Python/static and integrated
acceptance remain pending.

## Frozen review binding

Final GREEN03/static03 share identical 449-row before/after input SHA-256
`308BA756A71100DF4425695BC62B7CFF152FB74142A3BFAEB7D0C24E77F45F75`.
GREEN03 log SHA-256:
`40CC1F96D7080A29FDF3E162F25E2489111CA99B1AFC9AFF58B31D573A61BF97`.
Static03 log SHA-256:
`CDEE8539BCEA43ABF9FD83208F7087B09EED359C237728D1C54B53B30DC6E32C`.

Closed 20-path `u11-add-02-review-inputs-final.txt` SHA-256:
`9A465218A676C30B2CF65FC0AD06F34D403680DEC05AFFDFB6FB90FB75895F85`.
It includes source/tests, README, ADR-0072, preparation and supporting authority,
contracts, execution, CLI and lock/configuration paths. The five-code/test plus
README diff `u11-add-02-review.diff` SHA-256 is
`31D3AEB82535F61BADDA6E1A879C818A2F50BD813F979D76235F4CBD032DEE26`.
The new ADR/preparation full contents are separately bound in the manifest.
