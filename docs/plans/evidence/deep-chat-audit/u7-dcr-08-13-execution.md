# U7 execution evidence

- Receipt: `DCR-U7-EXEC-20261109-01`
- Plan: [Deep Chat Audit Minimal Corrections](../../active/deep-chat-audit-minimal-corrections.md)
- Findings: DCR-08 and DCR-13
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U7/`.

## Scope and cases

The unit owns the batch isolation and controller implementation and the two
existing owner tests. The dual-worker runtime is an unchanged caller and
control. It submits loaded workers and serializes role retirement. The
historical v4 runner also calls this isolation adapter and remains unchanged.

- DCR-08 RED: Hold the original pipe poll, cancel and reap its real spawned
  child, start a replacement, and release the retired timeout. The retired
  receive kills the replacement. The pre-dispatch test also finds that a batch
  already marked cancelled starts and returns output.
- DCR-08 GREEN: A concrete attempt captures its connection. Checks and
  teardown serialize under the same worker lock. Blocking poll and receive
  release the lock. A retired response or receive error cannot affect a
  successor. Exact failed cleanup remains retryable. The final tests cover
  late response and timeout, concurrent EOF with one verified worker close,
  pre-dispatch cancellation, failed-cleanup retry and repeated stale cancel.
- DCR-13 RED: Either a clock or resource-probe exception before generation
  escapes as expected but poisons the next call with `resource-limit`.
- DCR-13 GREEN: The finalizer covers acquisition and initial measurements.
  It releases the controller and the identity it acquired, preserves a
  conflicting identity, and allows successful retry with publication sequence
  starting at zero.

## Host commands

Normal local PowerShell on Windows NT 10.0.26200.0. RED and final GREEN input
snapshots were identical before and after each command. No historical test
result was reused. The RED test file snapshots contain the initial reproducers.
GREEN adds named controls for the same paths. Raw results preserve the
intermediate GREEN on its earlier patch separately from the exact review run.

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_batch_execution.py -k "dcr_08 or dcr_13"
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_batch_execution.py services/tts/tests/test_benchmark_dual_worker_runtime.py
```

| Phase | Outcome |
| --- | --- |
| RED | Exit 1. Four expected behavioral failures, 26 deselected. Both production files matched HEAD. |
| Intermediate GREEN | Exit 0. 43 passed on the earlier patch. |
| Final GREEN | Exit 0. 44 passed in 5.18 seconds on the review patch. |

G4 final integration and G7 Python static gates remain pending. Independent
unit review is pending. No model, hardware, benchmark campaign, or release
artifact was used.

## Closed reviewed inputs

The first four modified entries are the unit patch. Unchanged entries are the
direct callers, supporting test inputs, and configuration recorded in the
receipts. A blank first porcelain column indicates an unstaged modification.
The index had no staged paths.

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `services/tts/benchmarks/isolation.py` | ` M` | `e97fae4e9aa969b0e45f0524e86103c9b88d03a1aaa8031081523dd027a5d4ee` | `221b30cefa2d579e16ecccf5b7ebb4197828b089` |
| `services/tts/benchmarks/batch_execution.py` | ` M` | `3a6737d8cc65615c9fd4a8176d754e98532890dac98a60e2c7fb8c66210bbb25` | `105cc9352420b04f0169194265097ba4aefe1400` |
| `services/tts/tests/test_benchmark_isolation.py` | ` M` | `2ea318901ad23c5e594c3cd425328b57b6098815b636b819e0b6655c1407618a` | `0e9bc498351a8d647a1845c5ce009d0e58632f60` |
| `services/tts/tests/test_benchmark_batch_execution.py` | ` M` | `6204a348362f436470214d16db1706eb7253fe3ae74202f1c999740a448a436d` | `3414a192c8a605ed92c22a996701a7abcb167087` |
| `services/tts/benchmarks/dual_worker_runtime.py` | `clean` | `0034334be7b00ec6eac72756b55ab9fac90b93f9cf169d20db0187fd05bf1c38` | `867e51e8f6d7e8f1b8a6ae0eccfc84bfe027c445` |
| `services/tts/benchmarks/batch_contracts.py` | `clean` | `fa368dd309d4510f1c8ece7dcedb8ee4f59a17c2591b357f4ab91e4ab06577f5` | `b4e0917b288898f864cf97ce0ce6164c8495d062` |
| `services/tts/benchmarks/batch_fake.py` | `clean` | `eab59a69da55bffadbc2c1800bc2f63958498af022eef1c792eb090fe9e9920d` | `85bba81912347f7cd715315fc2b5e314b1463940` |
| `services/tts/benchmarks/batch_official.py` | `clean` | `5c43e2e2f5c26ac0aba083b2f0cd5927dff61767ce0953966d70e2c3c11b75cb` | `d6e45fe05420d91305dd6a9c3b31d41422e8dd1a` |
| `services/tts/benchmarks/contracts.py` | `clean` | `c6543eb56ecca35f8c994fef4b07dbddf9fde4659fc64f929dcce7f8e7dbaaae` | `c0445baa08a2725d544ae4b327bd27d7f3468726` |
| `services/tts/tests/test_benchmark_dual_worker_runtime.py` | `clean` | `4ff9bc4ecc5a4b132653404c45293654cd61ef5f4114c537e6f92fb56992251c` | `2725c48f20d43cdcba14c391f2f994bc422f62d3` |
| `services/tts/pyproject.toml` | `clean` | `f65ca556bd98ac9183c6ce95b05de1873689f22058820f1ff0b16d59fedf3c64` | `45ad2716bb5cbc50662b0f05e22b734fce0542b0` |
| `services/tts/uv.lock` | `clean` | `595916e51b3e3a4a0b1ae58cc7dc4c0a22f6104682be56d13e5d1f82c03259ed` | `bde23dd605da0accfd094b4feae9a3144a1b341d` |
| `package.json` | `clean` | `c034ad183d86e3366988ac7ab1e3d512738b18f1b0c714963fb9f1cbbdc17b36` | `29ff407c2ade383bb10764cd27c763d2689d8ee0` |
| `.gitattributes` | `clean` | `d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4` | `5acf47068be3a84b4e38b502877083e99b5ce0f9` |

Host tools: uv 0.11.29 (901092ee1 2026-07-15 x86_64-pc-windows-msvc), Python 3.12.10, PowerShell 7.6.9, pytest 9.1.1.
