# PY-CHATTERBOX-POST-CHANGE-03

Independent `refactor_validator`; POST-CHANGE **PASS**, accepted by director.
Local PowerShell outside sandbox with existing Corepack process-local PATH.
Starting/ending HEAD `a3fa08accbf7752e7638ff24aca73211ec8aeb92`.
Fresh identity recheck PASS; index empty; accepted CORE identities and all 393
protected paths unchanged.

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/src/voxleaf_tts/release_chatterbox.py` | ` M` | `1ec1469437a0169e091ee1b9194f0ee88339afe902204142302fc18b64f9a292` | `1b3277d79d40c06b6d1a0573784a55eaa6556f03` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` | `??` | `3c3c68b0f6e6106b17e561805e338a9713b129bbd4083ba7dc465ffb4e99b131` | `96af00265056df17bc6e5e51046f49f398f793a1` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` | `??` | `b049a1d728e89f8130a2631ec4d4332cc3efeb008b1b83a6b79dbde0efdc8f90` | `b110fdeb1ceb0faca89f0c9cfcc7ea38d1c42826` |
| `services/tts/tests/test_release_chatterbox.py` | ` M` | `7c3aec6f05ac6db2474704f78edc98e1b8b523b902efaf95b74c0c9280eadadf` | `15a5b1b0b3454b15bee158422aa8f55d09750e6c` |

All nine exact commands from [baseline](PY-CHATTERBOX-baseline.md) exited 0:
format 166 files; Ruff; mypy 163 files; **414 tests** (existing cache-write warning);
maintainer sdist/wheel; four v2/v3 source/acquisition authorities current.
`git diff --cached --quiet` and `git diff --check` exited 0.

Host inline AST/wheel probe passed: 53 extracted definitions match baseline
except root depth 4 to 5; retained production and old tests match; four wheel
entries equal source bytes; isolated imports preserve shared identities. Wheel
SHA-256 `a560c1fe0030651b81d1354f0e37183446a2d859b9028eb96229a9c539cddfc0`.

Scope, invariants, test integrity and privacy/artifact reviews PASS: four files,
1,973 changed lines within ceiling 2,050. Five added cases cover actual root,
shared identities, exact runtime-module copying without helpers and full v2/v3
manifest digests. Two corrections affected new test expressions only; old
assertions retained. Safe-loader verification stays with the build facade.

V2 defaults/correction, v3 generated closure, provenance, authority, error/path
rules, serialization, licence/lifecycle/ZIP/split behavior and acyclic dependency
direction remain unchanged. The four authority checks do not establish a newly
assembled optional runtime or model performance. Wheel inclusion/importability
is separate evidence. Prior failed reports remain immutable; no Git authorized.
