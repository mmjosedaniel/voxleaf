# PY-CORPUS-POST-CHANGE-01

Independent `refactor_validator`; POST-CHANGE **FAIL**. Host PowerShell outside
sandbox, existing Corepack PATH. Starting/ending HEAD
`a3fa08accbf7752e7638ff24aca73211ec8aeb92`; identity recheck PASS; index empty.

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/benchmarks/harness.py` | ` M` | `6b06237ab129032615eb25f12082572ae5a2c79385746331d63812d0de70f5d6` | `18c8d3db104f75a90b9fd39e0f7d29f7a37bf5d3` |
| `services/tts/benchmarks/harness_corpus.py` | `??` | `bb81c828c1be5da6efbb473fefa48a6423ae8a835ef1534ab4a13ddbed20fb03` | `da15ad71b63c342c9bf1c8bd55124780f0c21363` |
| `services/tts/benchmarks/harness_errors.py` | `??` | `274572a6cf687a3eff95ce3f576044b01fef249c73281aabf5bae51094d39e78` | `801195ca1c9fe0eb639cc7701da21135a4b048b0` |
| `services/tts/tests/test_benchmark_harness.py` | ` M` | `7aab3f549cda2974ce0b97f5882949682616b44fda4d91e544bfd3a135d33dc8` | `5dbf251181613e9cf52aa7a1ce08cd7a39660d6d` |

All five [baseline commands](PY-CORPUS-baseline.md) ran. `pnpm.cmd lint:python`
exited 1: I001 requires `_fail` before `_HarnessFailure` in facade and test
imports. Other four exited 0: format 168 files; mypy 165 files; **446 tests**
(existing cache-write warning); sdist/wheel. Index/whitespace checks exited 0.

Host inline AST probe initially exited 1 because the validator's Git subprocess
used Windows default decoding on Unicode test source. Explicit UTF-8 decoding
resolved that probe-only error without repository edits: all five moved
definitions, retained production and pre-existing tests match baseline ASTs.

Scope/invariants/assertion integrity/privacy PASS: four paths, 403 changed lines
within 450. Eight accepted packaging paths and 393 protected files unchanged.
Thirty-two added cases characterize permissive corpus rules, order/text/error
behavior. Runners/resources/cancellation/privacy logic unchanged. Correction
order 1 swaps only that import pair in both files; full revalidation required.
No model/performance or implementation acceptance; no Git authorized.
