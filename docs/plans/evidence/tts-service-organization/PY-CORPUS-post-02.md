# PY-CORPUS-POST-CHANGE-02

Independent `refactor_validator`; POST-CHANGE **PASS**, accepted by director.
Host PowerShell outside sandbox with existing Corepack PATH, Python 3.12.10.
Starting/ending HEAD `a3fa08accbf7752e7638ff24aca73211ec8aeb92`.
Identity recheck PASS; index empty; eight accepted packaging paths and 393
protected paths unchanged.

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/benchmarks/harness.py` | ` M` | `2c098e17f0c34c7e1bd5f483545d52b599db6a1e256dd8e29158052acd007f00` | `96014943adb03c4112d81de55cf1305048e40a02` |
| `services/tts/benchmarks/harness_corpus.py` | `??` | `bb81c828c1be5da6efbb473fefa48a6423ae8a835ef1534ab4a13ddbed20fb03` | `da15ad71b63c342c9bf1c8bd55124780f0c21363` |
| `services/tts/benchmarks/harness_errors.py` | `??` | `274572a6cf687a3eff95ce3f576044b01fef249c73281aabf5bae51094d39e78` | `801195ca1c9fe0eb639cc7701da21135a4b048b0` |
| `services/tts/tests/test_benchmark_harness.py` | ` M` | `64b6d93ef6f404c07cb891124c2c0437e8dda1f8e367355794e227f9359f5eb7` | `aa673b041b0dcb5ad55ce98ec278939aff9a92af` |

All five exact [baseline commands](PY-CORPUS-baseline.md) exited 0: format 168
files, Ruff, mypy 165 files, **446 tests**, sdist/wheel. Existing cache-write
warning only. Host explicit-UTF8 AST comparison against HEAD exited 0: all five
moved definitions, all retained production and all pre-existing tests identical.
`git diff --check` and `git diff --cached --quiet` exited 0.

Scope, invariants, test integrity and privacy/artifact reviews PASS. Four files,
403 changed lines within 450. One import-order correction; no assertion weakening.
Thirty-two new synthetic cases preserve permissive admission, duplicate/order
rules, selected-language projection, raw text/file/Unicode/JSON failures and
canonical error fields/identity. Runners, resource/observation/cancellation and
privacy owners are unchanged. Builds produced ignored outputs only. No GPU/model
performance claim or Git mutation. Earlier failed report remains immutable.
