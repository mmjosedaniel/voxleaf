# PHASE-A-PACKAGE-01

Independent `refactor_validator`; PACKAGE **PASS**, accepted by director.
Local PowerShell outside sandbox, existing Corepack process-local PATH.
Starting/ending HEAD `a3fa08accbf7752e7638ff24aca73211ec8aeb92`.

Closed validated allowlist and exact status/SHA-256/filter-aware blob identities
are the union of the four entries in [CORE POST-02](PY-CORE-post-02.md) and the
four entries in [Chatterbox POST-03](PY-CHATTERBOX-post-03.md). Validator captured
all eight afresh before and after commands: they exactly matched those immutable
reports both times. Identity recheck PASS; index empty; all 393 protected files
match the original capture. Director documentation is outside this source scope.

`pnpm.cmd check:portable` exited **0**:

- Evidence guard and 13 evidence tests.
- TypeScript/Python format, lint and types; 17 generated contract files verified.
- Shared 20 files/209 tests; EPUB 33/651; desktop 54/588 plus 38 Node tests.
- Python 414 tests; shared/EPUB, desktop production and Python distribution builds.

`git diff --cached --quiet` and `git diff --check` exited 0 before/after.
Nonfatal diagnostics: existing pytest cache-write warning and Vite warning for
the approximately 1,025-kB main bundle.

Scope, invariants, test integrity and privacy/artifact reviews PASS. Aggregate
source diff contains only eight accepted paths (CORE 495 and Chatterbox 1,973
changed lines). Existing assertions and protected runtime/generated/authority/
lock/fixture/history bytes remain unchanged. No prohibited artifacts entered
the diff. This package gate adds portable cross-package regression/build proof;
it does not replace final native `pnpm.cmd check`, establish a rebuilt runtime
distribution, or make model/hardware claims. No Git mutation authorized.
