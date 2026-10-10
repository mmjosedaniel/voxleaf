# PY-CHATTERBOX-POST-CHANGE-02

Independent `refactor_validator`; POST-CHANGE **FAIL**. Host PowerShell outside
sandbox, same Corepack PATH. Starting/ending HEAD
`a3fa08accbf7752e7638ff24aca73211ec8aeb92`; before/after identity recheck PASS;
index empty. Same closed four paths as [POST-01](PY-CHATTERBOX-post-01.md).

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/src/voxleaf_tts/release_chatterbox.py` | ` M` | `1ec1469437a0169e091ee1b9194f0ee88339afe902204142302fc18b64f9a292` | `1b3277d79d40c06b6d1a0573784a55eaa6556f03` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` | `??` | `3c3c68b0f6e6106b17e561805e338a9713b129bbd4083ba7dc465ffb4e99b131` | `96af00265056df17bc6e5e51046f49f398f793a1` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` | `??` | `b049a1d728e89f8130a2631ec4d4332cc3efeb008b1b83a6b79dbde0efdc8f90` | `b110fdeb1ceb0faca89f0c9cfcc7ea38d1c42826` |
| `services/tts/tests/test_release_chatterbox.py` | ` M` | `7845be8855983e8953da8f8ec759669756276fd67aec51157d498691baf32c2f` | `a2c551fd3a762db3f8709f2b9d156f8960d402fe` |

All nine [baseline commands](PY-CHATTERBOX-baseline.md) ran unchanged.
`pnpm.cmd lint:python` exited 1: B009 rejected the two literal-name `getattr`
expressions. All other eight exited 0: format 166 files; mypy 163 files;
414 tests (same cache-write warning); build; four v2/v3 authority checks.
`git diff --cached --quiet` and `git diff --check` exited 0.

Host inline AST/wheel probe passed again: 53 moved definitions, retained
production/old tests, source-byte equality and isolated wheel imports. Wheel hash
remains `a560c1fe0030651b81d1354f0e37183446a2d859b9028eb96229a9c539cddfc0`.
CORE identities and 393 protected paths unchanged. Scope/invariants/assertion
integrity/privacy PASS; 1,974 lines within four paths. No runtime rebuild claim.

The first prescribed correction missed Ruff B009. Second/final correction order:
put `assert getattr(chatterbox_authority, cls.__name__) is cls` inside the existing
two-class loop, removing the literal accesses. Both identity assertions remain.
No export expansion or suppression. Full revalidation requires a new report;
another source correction would require work-order redesign. No Git authorized.
