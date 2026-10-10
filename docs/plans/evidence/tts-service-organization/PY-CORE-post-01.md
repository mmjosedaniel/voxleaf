# PY-CORE-POST-CHANGE-01

Independent `refactor_validator`; mode POST-CHANGE; verdict **FAIL**.
Local PowerShell outside sandbox, existing Corepack shim selected by process-local
PATH as in [baseline](PY-CORE-baseline.md). Starting/ending HEAD:
`a3fa08accbf7752e7638ff24aca73211ec8aeb92`. Identity recheck PASS; index empty.

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/src/voxleaf_tts/release_core.py` | ` M` | `2e402781124dfe8b4c39d5156e8ff5425ef0d1bdad277b529ade329d8c5f4aec` | `6707800a8e1d66169fa692e08331e2963aef6ffe` |
| `services/tts/src/voxleaf_tts/packaging/__init__.py` | `??` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391` |
| `services/tts/src/voxleaf_tts/packaging/core_integrity.py` | `??` | `8d8ac4fc726cb886c6fccc967557f9551fbe8feded89eedb58b143fb8785a343` | `c2a01ac672f39af06b2dd6d7665ae56fc57f6ee1` |
| `services/tts/tests/test_release_core.py` | ` M` | `2eb300602db114f731a62d10bb66603f67ceee243e017033c7a687fd71fbcd29` | `47ab1a75c29f9cbd83949a2a1327e23c3ba0dad5` |

Porcelain lines are the displayed two-character status, space and full path.
Before/after identities matched for every command; 393 protected paths unchanged.

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm.cmd format:check:python` | 0 | 164 files formatted |
| `pnpm.cmd lint:python` | 1 | I001, facade import block |
| `pnpm.cmd typecheck:python` | 0 | 161 files, no issues |
| `pnpm.cmd test:python` | 0 | 409 passed; baseline cache-write warning |
| `pnpm.cmd build:python` | 0 | Maintainer sdist/wheel built |
| `pnpm.cmd package:piper-core:check` | 0 | Cached release current |
| `git diff --cached --quiet`; `git diff --check` | 0 | Clean index/whitespace |

Supplemental host `uv run --project services/tts --locked python -` probe passed:
19 moved definition ASTs and all pre-existing test/helper ASTs match baseline;
wheel facade/initializer/helper bytes equal source; isolated `python -I -S`
wheel imports preserve error identity. Wheel SHA-256:
`e7832509b31f35319702b2377d8c443d7a6ef9ba47aff406ab867670b2a50634`.

Scope, invariants, test integrity and privacy reviews PASS: four files/497 changed
lines, empty initializer, no reverse dependency, preserved lifecycle and CLI,
full-byte synthetic manifest match and copied-tree exclusion. No release rebuild
or model-performance claim. Required correction: separate the 19 same-name
re-export aliases into individual import statements; no suppression/configuration
change. Correction loop 1 was ordered, followed by a new full validation report.
This immutable failed report accepts no patch or Git mutation.
