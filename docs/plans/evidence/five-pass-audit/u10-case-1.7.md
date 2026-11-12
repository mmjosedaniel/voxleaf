# U10 case 1.7: v5 monitor ownership at finalization

Status: unit APPROVE [FPA-U10-1.7-CR-R1-20261111](review-U10-1.7-R1.md);
combined acceptance pending. HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty.
U10 edits only `dual_worker_official.py` and
`test_benchmark_dual_worker_runtime.py`, plus the README contract.
Review also renews unchanged U9 source/tests against the expanded input capture.

After successful startup handoff, the monitor thread owns periodic sampling,
one final sample and both probe close attempts. A handoff event prevents a
thread that started before start() failed from touching caller-owned probes.
finish() signals and joins for at most one second. A live owner remains retained
and produces cleanup-failed; the caller does not sample or close underneath it.
Initial/start failure cleanup stays with the caller. Sampling and close failures
remain attached as grouped causes; repeated finish does not resample/reclose.
The existing v5 final sample still precedes runtime.close, retaining worker PIDs.
U11/v13's candidate-before-monitor rule does not apply. Frozen windows,
thresholds, v5 authority and historical results are unchanged.

## Normal-host evidence

PowerShell outside the sandbox, uv 0.11.29, Python 3.12.10, pytest 9.1.1.
Raw logs and paired manifests remain in ignored `tmp/evidence/five-pass-audit`.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_dual_worker_runtime.py -k five_pass_1_7
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_dual_worker.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_benchmark_dual_worker_cli.py services/tts/tests/test_benchmark_memory.py services/tts/tests/test_benchmark_cli.py
uv run --project services/tts --locked ruff format --check services/tts/benchmarks/dual_worker_official.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/benchmarks/cli.py services/tts/tests/test_benchmark_cli.py
uv run --project services/tts --locked ruff check services/tts/benchmarks/dual_worker_official.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/benchmarks/cli.py services/tts/tests/test_benchmark_cli.py
uv run --directory services/tts --locked mypy benchmarks/dual_worker_official.py tests/test_benchmark_dual_worker_runtime.py benchmarks/cli.py tests/test_benchmark_cli.py
git diff --check -- services/tts/benchmarks/dual_worker_official.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/benchmarks/cli.py services/tts/tests/test_benchmark_cli.py benchmarks/tts/README.md
```

RED01, 23:02:00.968–23:02:04.854 UTC, exit 1: four intended failures,
ten deselected. Real event-gated threads show premature success during a blocked
periodic sample, caller-owned blocked final sampling exceeding the proof bound,
and zero closes after initial sample/start failures. Paired input SHA-256
`582E1F531E829ADEF8312B583E2D9316A4A006452B4A0E0F94BEBA2320A68E23`.

GREEN03, 23:07:24.008–23:07:30.728 UTC, exit 0: **92/92 pass** across five
U9/U10 suites. Log SHA-256
`2904F2C7230258EFAAA2B5EA3E71E892A75782EEC41E377860851E0E103E9E04`.
Static03 including normal-host scoped diff check, 23:07:25.057–23:07:25.559 UTC:
all exit 0. Expanded 449-row before/after SHA-256
`BE238AF42A16470DEE2DD0F0294EB15362409CC8F653C5662CDD60F3BC46EADB`.
It adds 89 top-level benchmark authority/fixture inputs and actual base CPython
executable/DLL identities to the existing uv, environment, pytest and source
capture. Current README is captured as well.

Earlier GREEN01/02 each passed 69 v5 tests under a smaller 358-row capture;
they are preserved, not used as complete current acceptance evidence. Static01
failed a strict re-export annotation; importing the type from its owning memory
module fixed it, with static02 then passing. The final command explicitly adds
U9's CLI tests and static paths to close its related capture gap. Existing
pytest cache warnings remain non-behavioral; no cache was deleted.

## Frozen review binding

`u10-1.7-review-inputs.txt`: 48 path identities plus two headers, SHA-256
`E9FBC90B5ED78E87F866E4F1049A945A3978CCCFAAB83B4E5D4D01FC4A51FFBC`.
`u10-1.7-review.diff` SHA-256
`6CB3EE37E4E09A7F88A7FC23B2EE7A70B39480DCE82F24A7759583BF8D77C09D`.
No historical PASS is substituted. Final Python/static/integrated gates remain
pending, with no real-hardware v5 measurement claim.
