# TTS organization evidence

Campaign source HEAD: `a3fa08accbf7752e7638ff24aca73211ec8aeb92` on
`codex/tts-service-organization`. Initial worktree/index clean. The user explicitly
requires unstaged changes, no commits, push or PR. The same configured Sol high
auditor/worker and Astra high validator were reused; supporting agents did not
delegate. Exactly one source writer worked at a time; all writers and Git
mutations stayed idle during validation. No Git mutation was performed.

## Audit and approved-order record

Every audit returned CHANGE for a demonstrated responsibility boundary. The
director froze each closed four-file order only after its independent baseline
PASS. Exact allowlists and immutable status/SHA-256/blob identities are in the
reports below; no source path was reused across units.

| Unit | Audited boundary and approved narrowing | Ceiling / actual changed lines | Baseline | Accepted post-change |
| --- | --- | --- | --- | --- |
| PY-CORE | Leaf integrity, compatible facade/error identity, whole maintainer-subtree exclusion from first helper | 550 / 495 | [BASELINE-02](PY-CORE-baseline.md) | [POST-02](PY-CORE-post-02.md) |
| PY-CHATTERBOX | Versioned authority and integrity; retain safe-loader AST check with its sole build consumer to fit the audited scope | 2,050 / 1,973 | [BASELINE-01](PY-CHATTERBOX-baseline.md) | [POST-03](PY-CHATTERBOX-post-03.md) |
| PY-CORPUS | Independent input loaders and one failure identity; preserve permissive admission and all runners | 450 / 403 | [BASELINE-01](PY-CORPUS-baseline.md) | [POST-02](PY-CORPUS-post-02.md) |
| PY-QUALITY | HTML and pure per-candidate scoring; preserve outer session owner and per-candidate corpus-read order | 650 / 624 | [BASELINE-01](PY-QUALITY-baseline.md) | [POST-01](PY-QUALITY-post-01.md) |

Each order forbade outside paths, runtime/contracts/dependencies/locks/generated
sources/frozen authority/history changes, weakened assertions, lifecycle or CLI
changes, authority regeneration and Git mutation. Orders required the unchanged
section-8 Python gates, applicable packaging gates, and synthetic baseline
characterization. Workers supplied Change Packets and did not run acceptance
gates under their configured role; independent host validation owned acceptance.

No implementation unit was skipped or blocked at unit acceptance. Deferred
runner splitting, test-directory moves, provider unification, additional release
stage extraction, runtime work and historical-authority cleanup stay deferred.

Failures are retained separately: first CORE baseline selected wrong pnpm;
[CORE POST-01](PY-CORE-post-01.md) required import organization;
[Chatterbox POST-01](PY-CHATTERBOX-post-01.md) and
[POST-02](PY-CHATTERBOX-post-02.md) required two equivalent new-test expression
corrections; [CORPUS POST-01](PY-CORPUS-post-01.md) required import ordering.
Each correction stayed within its allowlist; full gates reran under a fresh ID.
No suppression, assertion removal or configuration change was used.

## Inventory and preservation

`git ls-files -- services/tts` captured 205 tracked service files, of which 159
were Python (15 source, 89 benchmarks, 55 tests). Two generated Python files
were excluded from editing. The campaign adds eight Python files without staging;
the initial tracked inventory is not rewritten to pretend they are committed.
Installed environments/caches/distributions/model trees were not inventoried as
source. Full raw inventory and protected hashes are in ignored
`tmp/evidence/tts-service-organization/preparation/`.

Four production owners and their four existing test files form the changed
inventory. Other runtime sources and entrypoints remain unchanged; generated
files, release metadata/locks/receipts, frozen authorities and fixtures are
protected; other benchmark tools and tests are outside scope. This is not a
claim that every unchanged file has a maintainability defect or was rewritten.

The validator independently captured all 1,035 initially tracked files; a
393-file protected subset under services/tts, benchmarks/tts and packages/shared
was checked throughout. Its ignored JSON manifest SHA-256 is
`6b54384509a06a82003770e8dfd982f86d46496dda5b6a02d8f06ad8f67f9310`.
Markdown receipts hold concise reviewed results/identities; no raw logs, model
weights, audio or private book text enter this collection.

## Combined evidence

[PHASE-A-PACKAGE-01](PHASE-A-package.md) passed the required packaging-group
`pnpm.cmd check:portable`. [FINAL-01](FINAL-01.md) passed final portable/native
gates, all 16 source identities, protected-file comparisons and aggregate review.
Documentation closure is recorded separately after plan archival. Source
acceptance does not claim rebuilt runtime payloads or new model performance.
