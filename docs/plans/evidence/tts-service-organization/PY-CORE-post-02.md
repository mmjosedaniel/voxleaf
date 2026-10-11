# PY-CORE-POST-CHANGE-02

Independent `refactor_validator`; mode POST-CHANGE; verdict **PASS**, accepted by
director. Local PowerShell outside sandbox with the process-local Corepack PATH
from [baseline](PY-CORE-baseline.md). Starting/ending HEAD:
`a3fa08accbf7752e7638ff24aca73211ec8aeb92`. Identity recheck PASS; index empty.

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/src/voxleaf_tts/release_core.py` | ` M` | `5d9e66a7707a9afacec13d65157fc82ca1fe69ec5ab27de2b3addf7d2b1ac8ed` | `4840c9933ede7fef5f677e07b8406a1cb25fef1a` |
| `services/tts/src/voxleaf_tts/packaging/__init__.py` | `??` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391` |
| `services/tts/src/voxleaf_tts/packaging/core_integrity.py` | `??` | `8d8ac4fc726cb886c6fccc967557f9551fbe8feded89eedb58b143fb8785a343` | `c2a01ac672f39af06b2dd6d7665ae56fc57f6ee1` |
| `services/tts/tests/test_release_core.py` | ` M` | `2eb300602db114f731a62d10bb66603f67ceee243e017033c7a687fd71fbcd29` | `47ab1a75c29f9cbd83949a2a1327e23c3ba0dad5` |

Exact porcelain lines comprise status, space, full path. Fresh before/after
identities matched; all 393 protected files match the original capture.

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm.cmd format:check:python` | 0 | 164 files formatted |
| `pnpm.cmd lint:python` | 0 | Ruff passed |
| `pnpm.cmd typecheck:python` | 0 | 161 files, no issues |
| `pnpm.cmd test:python` | 0 | 409 passed; existing cache-write warning |
| `pnpm.cmd build:python` | 0 | Maintainer sdist/wheel built |
| `pnpm.cmd package:piper-core:check` | 0 | Existing cached release current |
| `git diff --cached --quiet`; `git diff --check` | 0 | Empty index; no whitespace errors |

Host `uv run --project services/tts --locked python -` AST/wheel probe passed:
all 19 moved definitions and existing test/helper definitions match baseline ASTs;
wheel entries equal source bytes; isolated `python -I -S` wheel imports preserve
error identity. Wheel SHA-256:
`a255f343c9bd5e59e1476e2de57c7e7a5697d802b7dd3df6a1103c8fd1cc8158`.

Scope, invariants, test integrity and privacy/artifact reviews PASS. Four paths,
495 changed lines within ceiling 550; correction affected import organization
only. Three synthetic tests preserve 19 facade bindings, exception identity,
exact helper-tree exclusion and retained siblings, and the 1,207-byte baseline
manifest. Lifecycle, CLI, root, sync, ZIP, smoke and evidence owners unchanged.
No protected runtime, authority, lock, fixture or generated-source change.

Cached Piper verification is not a fresh runtime rebuild. Maintainer-wheel
inclusion/importability is established separately. No model/performance claim or
Git mutation is authorized. The earlier failed report remains immutable.
