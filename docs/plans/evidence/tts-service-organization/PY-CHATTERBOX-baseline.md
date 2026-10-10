# PY-CHATTERBOX-BASELINE-01

Independent `refactor_validator`; BASELINE **PASS**. Local PowerShell outside
sandbox, existing Corepack process-local PATH from [CORE baseline](PY-CORE-baseline.md).
Starting/ending HEAD `a3fa08accbf7752e7638ff24aca73211ec8aeb92`.
Index empty; identity recheck PASS. Accepted CORE identities still match
`PY-CORE-POST-CHANGE-02`; all 393 protected paths remain unchanged.

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/src/voxleaf_tts/release_chatterbox.py` | Empty | `9cb1c2f5f41a6032050e88161f19d71fd13da780fc4d46c113cbd4edab58b4ec` | `f330481e2c6844acd99cdb8266cc065b6a1004e9` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` | Empty | ABSENT | ABSENT |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` | Empty | ABSENT | ABSENT |
| `services/tts/tests/test_release_chatterbox.py` | Empty | `b3878ddc5c3ed10d516376f858fad4da15507b1c2727079046efcbd67d6578ff` | `5e3e57d238965b864c1e61b5ee97a123534ca648` |

| Command | Exit | Result |
| --- | ---: | --- |
| `pnpm.cmd format:check:python` | 0 | 164 files formatted |
| `pnpm.cmd lint:python` | 0 | Ruff passed |
| `pnpm.cmd typecheck:python` | 0 | 161 files, no issues |
| `pnpm.cmd test:python` | 0 | 409 passed; baseline cache-write warning |
| `pnpm.cmd build:python` | 0 | Maintainer sdist/wheel built |
| `pnpm.cmd package:chatterbox-optional:check-source` | 0 | Source current |
| `pnpm.cmd package:chatterbox-optional:check-acquisition` | 0 | Acquisition current |
| `pnpm.cmd package:chatterbox-optional:v3:check-source` | 0 | v3 source current |
| `pnpm.cmd package:chatterbox-optional:v3:check-acquisition` | 0 | v3 acquisition current |
| `git diff --cached --quiet`; `git diff --check` | 0 | Empty index; whitespace clean |

Additional host `uv run --project services/tts --locked python -` probe passed.
Temporary synthetic files `runtime/python.exe` = `b'python'` and
`runtime/Lib/site-packages/voxleaf_tts/service.py` = `b'service'` produced complete
rendered manifests of 678 bytes each: v2 SHA-256
`14d0d52e08ef937a9a8ef87d0346cc3ffb8a43fd2ccac25d824ac32d96ec520e`;
v3 SHA-256 `f62cc4bec21707a3444d66aa42f6e638dc8d8a4104335f8bcd4c79b9291c4bd0`.

Scope, baseline invariants, test integrity and privacy/artifact reviews PASS.
The four-path allowlist is clean and disjoint from accepted CORE changes.
Existing tests cover historical/current authority differences, safe loaders,
path and file checks, licence/generated closure and bounded archive parts.
Authority checks do not prove a rebuilt runtime or model performance. Helper
identity/root/non-copy and wheel checks remain post-change obligations.
