> The reviewer withdrew this report due to a transcription error and
> superseded it with [R2](review-U7-R2.md). R1 supplies no approval.

# Change Review Report

Review ID: **DCR-U7-R1-ASTRA-20261109-01**  
Task ID: **U7 / DCR-08 / DCR-13**  
Verdict: **APPROVE**  
Acceptance boundary: **Local unit review only**

Base commit and reviewed HEAD: both `d375ecc84261c404e855c055e0ecc8949a97caaf`.

Reviewed paths and identities:

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
|---|---|---|---|
| `services/tts/benchmarks/isolation.py` | ` M` | `e97fae4e9aa969b0e45f0524e86103c9b88d03a1aaa8031081523dd027a5d4ee` | `221b30cefa2d579e16ecccf5b7ebb4197828b089` |
| `services/tts/benchmarks/batch_execution.py` | ` M` | `3a6737d8cc65615c9fd4a8176d754e98532890dac98a60e2c7fb8c66210bbb25` | `105cc9352420b04f0169194265097ba4aefe1400` |
| `services/tts/tests/test_benchmark_isolation.py` | ` M` | `2ea318901ad23c5e594c3cd425328b57b6098815b636b819e0b6655c1407618a` | `0e9bc498351a8d647a1845c5ce009d0e58632f60` |
| `services/tts/tests/test_benchmark_batch_execution.py` | ` M` | `6204a348362f436470214d16db1706eb7253fe3ae74202f1c999740a448a436d` | `3414a192c8a605ed92c22a996701a7abcb167087` |
| `services/tts/benchmarks/dual_worker_runtime.py` | clean | `0034334be7b00ec6eac72756b55ab9fac90b93f9cf169d20db0187fd05bf1c38` | `867e51e8f6d7e8f1b8a6ae0eccfc84bfe027c445` |
| `services/tts/benchmarks/batch_contracts.py` | clean | `fa368dd309d4510f1c8ece7dcedb8ee4f59a17c2591b357f4ab91e4ab06577f5` | `b4e0917b288898f864cf97ce0ce6164c8495d062` |
| `services/tts/benchmarks/batch_fake.py` | clean | `eab59a69da55bffadbc2c1800bc2f63958498af022eef1c792eb090fe9e9920d` | `85bba81912347f7cd715315fc2b5e314b1463940` |
| `services/tts/benchmarks/batch_official.py` | clean | `5c43e2e2f5c26ac0aba083b2f0cd5927dff61767ce0953966d70e2c3c11b75cb` | `d6e45fe05420d91305dd6a9c3b31d41422e8dd1a` |
| `services/tts/benchmarks/contracts.py` | clean | `c6543eb56ecca35f8c994fef4b07dbddf9fde4659fc64f929dcce7f8e7dbaaae` | `c0445baa08a2725d544ae4b327bd27d7f3468726` |
| `services/tts/tests/test_benchmark_dual_worker_runtime.py` | clean | `4ff9bc4ecc5a4b132653404c45293654cd61ef5f4114c537e6f92fb56992251c` | `2725c48f20d43cdcba14c391f2f994bc422f62d3` |
| `services/tts/pyproject.toml` | clean | `f65ca556bd98ac9183c6ce95b05de1873689f22058820f1ff0b16d59fedf3c64` | `45ad2716bb5cbc50662b0f05e22b734fce0542b0` |
| `services/tts/uv.lock` | clean | `595916e51b3e3a4a0b1ae58cc7dc4c0a22f6104682be56d13e5d1f82c03259ed` | `bde23dd605da0accfd094b4feae9a3144a1b341d` |
| `package.json` | clean | `c034ad183d86e3366988ac7ab1e3d512738b18f1b0c714963fb9f1cbbdc17b36` | `29ff407c2ade383bb10764cd27c763d2689d8ee0` |
| `.gitattributes` | clean | `d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4` | `5acf47068be3a84b4e38b502877083e99b5ce0f9` |

The first four paths form the approved patch. Other entries are unchanged supporting inputs. U11, plan/index edits and execution documentation are outside this unit approval.

Identity recheck: **PASS.** Start/end HEAD and all 14 path identities match the final GREEN snapshot. The staged index remains empty. Supplied RED and final GREEN before/after snapshots are respectively identical. The saved `review-patch.diff` equals the live four-path diff. No approval hashes were refreshed.

Acceptance review:

- **DCR-08: locally approved.** The batch attempt captures its connection. Ownership checks, dispatch and teardown serialize under the worker lock; blocking poll/receive occur outside that lock. A retired timeout, EOF or returned response cannot abort or publish into a replacement. The finalizer releases only its own attempt. Pre-dispatch cancellation rejects the cancelled batch, repeated old cancellation preserves a successor, and a failed teardown retains its process/request owner for exact retry while blocking replacement.
- **DCR-13: locally approved.** The controller's finalizer now includes identity acquisition and initial clock/resource reads. It restores controller availability after an exception and invalidates only an identity it acquired that is still current. Failed acquisition preserves an unrelated identity. Regression assertions preserve the original exception object and prove retry publishes sequences zero and one.
- Direct caller review covered the dual-worker runtime's role retirement/dispatch serialization and the official batch runner's concurrent cancellation. Existing streaming identity, timeout, failed-cleanup, bounded output and privacy controls remain present and passed in the supplied owner suites. No historical authority, result schema, model artifact, application protocol or audio-persistence policy changed.
- Tests add deterministic event-controlled races around real spawned children. Existing assertions were not weakened. These results establish model-free tool behavior, not new hardware measurements or a rerun of historical v4 evaluation.

Test evidence reviewed: **DCR-U7-EXEC-20261109-01**, with raw RED and final `review-green-*` logs/snapshots under `tmp/evidence/deep-chat-audit/U7/`. Supplied as normal local PowerShell execution; the reviewer executed no tests.

1. RED: `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_batch_execution.py -k "dcr_08 or dcr_13"` — exit 1; four intended behavioral failures, 26 deselected; both production files matched HEAD.
2. Final GREEN: `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_batch_execution.py services/tts/tests/test_benchmark_dual_worker_runtime.py` — exit 0; 44 passed in 5.18 seconds. Recorded command interval: 2026-11-09 19:44:15.8198618–19:44:21.2881054 UTC.
3. The intermediate 43-test GREEN belongs to an earlier patch and is not substituted for the final run. No historical test result was reused.

Recorded environment: Windows NT 10.0.26200.0, PowerShell 7.6.9, Python 3.12.10, pytest 9.1.1, uv 0.11.29.

Findings: **none**.

Remaining uncertainty: Final G4 integration and G7 Python static gates remain pending. No hardware/model/performance acceptance is claimed. Other units and overall integration are not accepted by this report.

Required next action: No U7 correction required. Complete applicable integration gates and obtain final exact-patch review before overall acceptance. This report is not a Validation Report and grants no Git authorization.
