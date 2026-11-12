# U9 case 1.5: bounded measurement subprocess results

Status: unit APPROVE [FPA-U9-1.5-CR-R1-20261111](review-U9-1.5-R1.md);
combined acceptance pending. HEAD
`a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty.
Scope: `services/tts/benchmarks/cli.py`, its existing test suite and the current
tooling contract paragraph in `benchmarks/tts/README.md`.

The parent uses bounded binary stdin/stdout owners and discards stderr.
The admitted output limit remains 16 KiB, with one overflow-probe byte.
One absolute measurement deadline covers I/O and exit. Existing suspended
Windows Job admission and separate bounded teardown remain; the main thread
does not close a stream beneath a live owner. Validated PASS pairs with exit 0;
typed FAIL pairs with exit 2. Malformed/mismatched output becomes a content-safe
failure. Excluded pilot-preflight case 1.6 is unchanged. No model inference ran.

## Normal-host evidence

PowerShell outside the managed sandbox, uv 0.11.29, Python 3.12.10,
pytest 9.1.1. Raw logs and paired manifests are in ignored
`tmp/evidence/five-pass-audit/`.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_cli.py -k five_pass_1_5
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_cli.py
uv run --project services/tts --locked ruff format --check services/tts/benchmarks/cli.py services/tts/tests/test_benchmark_cli.py
uv run --project services/tts --locked ruff check services/tts/benchmarks/cli.py services/tts/tests/test_benchmark_cli.py
uv run --directory services/tts --locked mypy benchmarks/cli.py tests/test_benchmark_cli.py
```

RED01, 22:50:57.322–22:51:03.132 UTC, exit 1: four intended failures,
two controls pass, nine deselected. PASS/1 incorrectly returned success;
FAIL/0 retained a typed result; a real cap+1 child waited for its two-second
deadline instead of immediate output rejection; stderr capture retained
262,144 synthetic bytes. Both actual children were reaped. PASS/0 and FAIL/2
controls passed. Paired input SHA-256
`52762BD316C9480268E47EA4670E4838A76C29C1D64FBED0C0CD65E545473572`.

GREEN02, 22:55:09.049–22:55:14.782 UTC, exit 0: **23/23 pass**. Controls cover
exact cap and cap+1, stderr-before-stdin, blocked stdin, oversized encoded input
before spawn, malformed JSON/UTF-8, live stream ownership, worker/descendant
reaping and error/interruption/cleanup outcomes. Log SHA-256
`0E38F4D63E7EA9D8EEE6621E9B2022A627B923EEF17DBF9C6D3773BEAC46F612`.
Static02, 22:55:09.383–22:55:09.925 UTC: all three checks exit 0.
All 358 final captured input rows match before/after, SHA-256
`C464ECFE3843257D7E89B494F9F0A9BCD7082D5216132E3D57199883CFD2F8F6`.

GREEN01's 22 passing tests and two pytest setup/teardown errors remain preserved:
an automatically generated Unicode parameter ID exceeded Windows' environment
variable length. Explicit short IDs fixed the fixture. Static01's three
IO[Any]/BinaryIO annotation errors are also retained; final annotations use
IO[bytes]. Neither is an additional product RED. Existing pytest cache-write
warnings are non-behavioral; no preexisting cache was deleted.

## Frozen review binding

Closed 14-path `u9-1.5-review-inputs.txt` SHA-256
`C930239B9706FF1492E6CA3167D1B02600930C87BEF8C9B1D518F39CD0E654C5`.
`u9-1.5-review.diff` SHA-256
`672BE3CB1E62C983C62841E6345FB8D5EF0B0CA1BDBCFA4A45CCA832CCA17BFC`.
No historical PASS reuse. Final Python/static/integrated gates remain pending.

## Subsequent capture correction

U10 inspection found that the original capture omitted top-level benchmark
authority files used by manifest loading. The original run and issued review
remain immutable. [U10 GREEN03](u10-case-1.7.md) reruns all 23 U9 tests and its
static checks with the expanded 449-row capture, alongside 69 v5 tests.
[FPA-U10-1.7-CR-R1-20261111](review-U10-1.7-R1.md) renews U9 approval on that
expanded current evidence; no production change to U9 occurred.
