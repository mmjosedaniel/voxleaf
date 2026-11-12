# Documentary and integrated-review preparation

The first integrated documentary checkpoint runs in normal local PowerShell on
2026-11-12 UTC with Node24.18.0 and pnpm11.15.1:

| Check | Time | Result |
| --- | --- | --- |
| `pnpm.cmd check:evidence` | 02:50:22.630–02:50:23.336 | Exit0 |
| `git diff --check` | 02:50:23.342–02:50:23.439 | Exit0,no output |
| Local relative-target inspection of changed/new Markdown outside fenced examples | 02:50:23.439–02:50:23.650 | Exit0,86 documents,453 targets,no missing target |

All captured repository/tool inputs match before/after, manifest SHA-256
`E2EF70D60BA9562BCB6426AF4853DEA854D93A8F2E25E521BE4B0D472E952A52`.
The ignored receipts are under `g12-integrated-01/`. Exact arguments, tool
identities, log hashes and discovered Markdown members are recorded there.
The link inspection checks local path existence, not remote URLs or anchors.
The Git command covers the tracked working diff. Issued untracked review reports
remain verbatim, including valid Markdown hard-break spaces; no claim of a
different untracked whitespace aggregate is made.

The evidence checker, its unit tests and consumed synthetic test fixtures have
not changed. `test:evidence` is therefore not rerun; no full repository aggregate
is claimed. Formatting, type and behavior gates are separately attributed in
their receipts.

Current frontend/browser/type input and environment equivalence is documented in
[final equivalence](final-evidence-equivalence.md). Python/Rust evidence was
[renewed](runtime-evidence-renewal.md), and G8's actual Rust dependency projection
is in [native gates](native-gates.md). Final native and installer artifacts are
distinct, explicitly bound executions. Old failures, original captures and issued
reviews remain immutable.

The canonical diagram was rechecked against the final implementation: no new
major component, process, external-data path or persistence owner is introduced.
The v14 benchmark-proof authority remains within the existing benchmark path.
M005 narration preparation and locator mapping retain their implemented boundary;
the real Piper inference checks are separate evidence.

Final freeze and any archival documentary recheck use new ignored attempt
directories and are supplied separately to the independent reviewer. The plan
may be archived only after integrated approval; no Git mutation is authorized.
