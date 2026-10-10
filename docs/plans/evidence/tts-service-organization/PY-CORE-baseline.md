# PY-CORE independent baselines

Validator: configured `refactor_validator` (GPT-6 Astra high). Environment:
local PowerShell outside the sandbox (`require_escalated`). Starting and ending
HEAD for both reports: `a3fa08accbf7752e7638ff24aca73211ec8aeb92`.
Both reports are immutable; the second does not erase the first failure.

## PY-CORE-BASELINE-01: BASELINE-FAIL

The six commands listed below each exited 1 with
`ERR_PNPM_UNSUPPORTED_ENGINE`: inherited PATH resolved pnpm 11.25.0, while the
repository requires 11.15.1. None reached its underlying check. Source identities
below remained unchanged; index empty, `git diff --check` exit 0. No source edits
were authorized. Director verified the already installed Corepack shim, without
installing packages or changing repository configuration.

## PY-CORE-BASELINE-02: PASS

Every host session used this process-local tool selection:

```powershell
$env:PATH = 'C:\nvm4w\nodejs\node_modules\corepack\shims;' + $env:PATH
```

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm.cmd format:check:python` | 0 | 162 files already formatted |
| `pnpm.cmd lint:python` | 0 | Ruff passed |
| `pnpm.cmd typecheck:python` | 0 | 159 files, no issues |
| `pnpm.cmd test:python` | 0 | 406 passed; one cache-write permission warning |
| `pnpm.cmd build:python` | 0 | Maintainer sdist and wheel built |
| `pnpm.cmd package:piper-core:check` | 0 | `piper-core-release:current` |
| `git diff --cached --quiet`; `git diff --check` | 0 | Empty index; no whitespace errors |

## Closed path identities (both reports)

Porcelain output is empty for every path. New paths were absent before and after.

| Exact path | Worktree SHA-256 | Filter-aware index blob |
| --- | --- | --- |
| `services/tts/src/voxleaf_tts/release_core.py` | `5220cd9ce6bdf32354b5e4129328ac0b053890e97de6ac7c88a23f27b11cae07` | `8e71ddc08eca57fe51e4aeb6d5ce887dfc8e3738` |
| `services/tts/src/voxleaf_tts/packaging/__init__.py` | ABSENT | ABSENT |
| `services/tts/src/voxleaf_tts/packaging/core_integrity.py` | ABSENT | ABSENT |
| `services/tts/tests/test_release_core.py` | `ed58814a90985d4a2973f6a1531bad23151c89259a9b77d68a962b1eb14386e5` | `e4ec6bf4b8a61e7993f10ecd97024c1497af11c9` |

Identity recheck: PASS before/after each gate. All 393 director-protected paths
match the initial ignored manifest (SHA-256
`6b54384509a06a82003770e8dfd982f86d46496dda5b6a02d8f06ad8f67f9310`).
Validator independently retained all 1,035 tracked-file hashes. Scope, static
invariants, test integrity and privacy/artifact reviews passed. Existing source
and tests were untouched; only the director's active plan changed outside scope.

An additional host `uv run --project services/tts --locked python -` probe
characterized the existing manifest implementation using a temporary synthetic
tree: `runtime/python.exe` = `b'python'`, Spanish/English `MODEL_CARD` =
`b'spanish'`/`b'english'`; core lock hash = 64 `a` characters; voices in Spanish,
English order with target directories `voices/es`, `voices/en` and matching
`synthetic-es`/`synthetic-en` profile/runtime voice IDs. Result: 1,207 bytes,
SHA-256 `9c2a643d081a6f7f32d7d137815960dd86281a45cd3ee54dfc9619fb2b83af63`.

The cached Piper check verifies existing artifacts, not a newly built release.
This PASS authorizes freezing the source order only; no implementation, runtime
performance, helper packaging or Git mutation is accepted by a baseline.
