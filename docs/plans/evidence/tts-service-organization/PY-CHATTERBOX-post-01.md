# PY-CHATTERBOX-POST-CHANGE-01

Independent `refactor_validator`; POST-CHANGE **FAIL**. Local PowerShell outside
sandbox with the existing Corepack process-local PATH. Starting/ending HEAD
`a3fa08accbf7752e7638ff24aca73211ec8aeb92`; identity recheck PASS; index empty.
CORE accepted identities and all 393 protected paths unchanged.

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/src/voxleaf_tts/release_chatterbox.py` | ` M` | `1ec1469437a0169e091ee1b9194f0ee88339afe902204142302fc18b64f9a292` | `1b3277d79d40c06b6d1a0573784a55eaa6556f03` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` | `??` | `3c3c68b0f6e6106b17e561805e338a9713b129bbd4083ba7dc465ffb4e99b131` | `96af00265056df17bc6e5e51046f49f398f793a1` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` | `??` | `b049a1d728e89f8130a2631ec4d4332cc3efeb008b1b83a6b79dbde0efdc8f90` | `b110fdeb1ceb0faca89f0c9cfcc7ea38d1c42826` |
| `services/tts/tests/test_release_chatterbox.py` | ` M` | `4ba32e0462a630228e06753860035b8af2888e61ca6a5ee93b090da194b1e034` | `abbeb2233aee97a6f74b0ef3067f9380cde66f30` |

Porcelain lines are status, space and full path. Fresh before/after identities
matched across all commands. No deviations from the four-path order; 1,974
changed lines within ceiling 2,050. AST verification stayed in the facade.

All nine commands from [baseline](PY-CHATTERBOX-baseline.md) ran unchanged.
`pnpm.cmd typecheck:python` exited 1: two `attr-defined` errors at test lines
304/305 for implicit authority exports `ReleaseChatterboxError` and `PackageLayout`.
The other eight commands exited 0: format 166 files, Ruff, 414 pytest cases,
maintainer sdist/wheel, and all four source/acquisition checks. Existing pytest
cache-write warning remains. `git diff --cached --quiet` and `git diff --check`
exited 0.

Supplemental host `uv run --project services/tts --locked python -` passed:
53 moved definitions match baseline except approved root depth 4 to 5; retained
production and old test ASTs match; four wheel entries equal source; isolated
imports preserve class/function identities. Wheel SHA-256
`a560c1fe0030651b81d1354f0e37183446a2d859b9028eb96229a9c539cddfc0`.

Scope, runtime invariants, behavioral assertions and privacy reviews PASS. Both
678-byte manifest digests match baseline; v2/v3 differences and runtime lists
remain intact. Required correction: use literal-name `getattr` for those two
new identity assertions, retaining `is`; no export expansion, assertion removal,
or type suppression. Then rerun all nine gates and supplemental probe under a
new report. This report accepts no implementation or Git mutation; authority
checks do not establish rebuilt runtime bytes or model performance.
