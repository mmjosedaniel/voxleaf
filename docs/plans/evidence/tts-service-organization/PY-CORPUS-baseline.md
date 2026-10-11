# PY-CORPUS-BASELINE-01

Independent `refactor_validator`; BASELINE **PASS**. Host PowerShell outside
sandbox with existing Corepack PATH. Starting/ending HEAD
`a3fa08accbf7752e7638ff24aca73211ec8aeb92`; identity recheck PASS; index empty.

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/benchmarks/harness.py` | Empty | `136a6a52de184f730469253a2bf9d7052795690b0db8591f4923e16d19519121` | `1978146ac0c62f42aba1002a245435c6ec7af999` |
| `services/tts/benchmarks/harness_corpus.py` | Empty | ABSENT | ABSENT |
| `services/tts/benchmarks/harness_errors.py` | Empty | ABSENT | ABSENT |
| `services/tts/tests/test_benchmark_harness.py` | Empty | `432fa36aa3ecd8e03be4f254a3af28e471d713589217e202a4ff003143c0b0b2` | `ed22e489b11f0f9c04208dfb59629d1fc3250584` |

All five required commands exited 0: `pnpm.cmd format:check:python` (166 files),
`pnpm.cmd lint:python`, `pnpm.cmd typecheck:python` (163 files),
`pnpm.cmd test:python` (**414 passed**, existing cache-write warning), and
`pnpm.cmd build:python` (sdist/wheel). `git diff --cached --quiet` and
`git diff --check` exited 0.

Fresh before/after identities match. Eight accepted packaging paths and 393
protected files remain unchanged. Scope, baseline invariants, test integrity and
privacy reviews PASS. Corpus allowlist is clean and helpers absent.

Inspection confirms repeated-order admission in legacy and bilingual formats,
insertion/projection order, selected-language skipping, global nonmapping
rejection, permissive strings, raw file/Unicode/JSON exceptions and shared
failure code/default/message. Fake-adapter suites preserve protocol counts,
privacy, cancellation, cleanup and resource bounds. New synthetic admission
tests and exact moved/retained AST checks remain post-change requirements.
No real-model evaluation, implementation acceptance or Git mutation authorized.
