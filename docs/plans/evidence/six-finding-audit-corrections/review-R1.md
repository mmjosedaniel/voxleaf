# Change Review Report

Review ID: **SFA-R1-20261029**  
Task ID: **SFA-01–SFA-06**  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `200144dd29709536b189cb593fe53e927a991dc4`  
Branch: `codex/six-finding-audit-corrections`

Reviewed paths and identities: The closed manifest contains **1,443 paths**, including **22 changed paths**, with porcelain status, SHA-256 and filter-aware Git blob identities. Seven production owners changed; the remaining changes are tests and documentation. No pre-existing user changes were included.

Immutable dossier under `tmp/evidence/six-finding-audit-corrections/`:

| Artifact | SHA-256 |
| --- | --- |
| `review-R1-manifest.json` | `8cab425bc2c01bd87d26539b919a767ff2297881899a547798b0b0c8cfab828c` |
| `review-R1.diff` | `ecf432a7ed37daf71e5eec8780271f1a89659c708fdcc1add183c1771c16db87` |
| `review-R1-new-files.json` | `9b4784e890e03ad32ba9fdecca2076c3a094891b4f45342481ded56193ad80ef` |
| `review-R1-gate-comparison.json` | `42115d92232f508032760b9df82e7a08d58621cc37306c55a4fa572dc123d276` |

The report destination, `docs/plans/evidence/six-finding-audit-corrections/review-R1.md`, is excluded from its own manifest.

Identity recheck: **PASS.** Before and after inspection, the read-only host comparison matched all 1,443 path identities and membership, branch and HEAD, with no errors. Final HEAD remained unchanged and the index was empty. Dossier hashes remained unchanged. Original receipt, log and before/after snapshot hashes matched the comparison artifact.

Acceptance review:

| Criterion | Assessment |
| --- | --- |
| SFA-01: scene metadata | Approved. Preparation replaces only the last unpublished candidate’s boundary metadata during existing lookahead. Text, measurements, ranges and continuation remain intact. Public tests cover both ornaments, repeated/leading/trailing separators, source-window traversal, cold continuation and one/many batches. The real preparation/coordinator/player seam observes 1,200 ms, preserves the 900-ms ellipsis override and adds no initial/final pause. Existing bounds, cancellation, buffering and stale-timer assertions remain effective. |
| SFA-02: Unicode adjacency | Approved. Unicode letters and marks protect numeric lexical boundaries. Spanish dehyphenation retains its separate predicate. Tests cover both adjacency directions, non-Latin and astral letters, standalone expansion, existing mark/code/language controls, and public Piper/Chatterbox ranges. |
| SFA-03: storage disclosure | Approved. All four storage values come from the decoded snapshot. Synthetic measurements prevent replacement hardcoding from passing. Historical-v2 wording, explicit consent and compatibility controls remain covered. |
| SFA-04: structural boundaries | Approved. Exactly seven tags join the existing entry/exit flush path. Tests establish ordered paragraphs, formatting, hidden/empty handling, nested supported paragraphs, public ranges and fragment targets, and exact/over-limit block admission. Browser evidence checks rendered and synthesized order. Documentation accurately describes recovery limits for old generated positions. |
| SFA-05: loaded duration | Approved. Both presentation paths use floored whole seconds while target and approximate-wait formatting retain their existing semantics. Mounted tests cover below/at/above minute boundaries without changing scheduler or start ownership. |
| SFA-06: action/poll ordering | Approved. Action generations survive intervening polls; terminal publication invalidates earlier polls. Newer select/cancel/remove actions suppress obsolete results. Deferred-promise tests cover terminal success/failure, stale polls and existing refresh deduplication; mounted tests cover failure presentation and timer/subscription cleanup. |

The public opener has no stricter-policy option; using the existing projector seam for budget rejection is appropriate alongside separate public locator/integration coverage. The optional client is App-scoped and has no disposal API. Preserving current action completion after Settings unmount, while releasing its subscription and polling, respects the existing ownership boundary.

The patch adds no network, persistence, audio-storage, model, dependency or shared-contract capability. The canonical diagram remains consistent with component ownership. Completed M005 and frozen authorities retain their bytes.

Test evidence reviewed: **implementer-supplied host evidence; I did not execute tests, builds or formatters.** Receipts identify local PowerShell 7.6.5 outside the managed sandbox, Node 24.20.0 and pnpm 11.15.1.

| Receipt | Command/scope | Accepted outcome |
| --- | --- | --- |
| G1-final | `pnpm.cmd build:packages` | PASS |
| G3-static, G3-desktop-final, G3-final-fixtures | `format:check:typescript`, `lint:typescript`, scoped Prettier/ESLint and EPUB/desktop `typecheck` | Relevant final inputs covered. Earlier fixture/type failures remain recorded. |
| G4-epub, G4-matrix-final | Six explicit EPUB files listed in the plan; fresh complete matrix-file rerun | 242 selected tests covered by passing results. Original combined command failed one corrected expectation and is not represented as a passing command. |
| G5-desktop | Five explicit coordinator/client/control files listed in the plan | 186 passed |
| G5R-playback | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/playback-transition-policy.test.ts src/tts/pcm-playback.test.ts` | 40 passed |
| G6-browser | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep "SFA-EPUB\|preserves one canonical passage"` | Two selected Chromium cases passed |
| G7-native | `pnpm.cmd test:native-startup`, through the recorded wrapper | Current native rebuild and model-free smoke passed; zero external requests/errors and no new owned processes or scratch roots |
| G8-guard-tests | `pnpm.cmd test:evidence` | 31 passed |
| G8-docs-R1 | `pnpm.cmd check:evidence`, `git diff --check`, recorded local-link inspection | PASS; 131 links, none missing |

Evidence retention assessment: **Accepted within this task.** Original receipts are retrievable and hash-verified. Source/discovery/configuration comparisons show that later matrix/browser/document edits do not affect the retained G4 files or G5/G5R consumers. Independent comparison found no drift across 250 captured shared/EPUB generated and installed-lock inputs for G4, G5, G5R, browser and native receipts. G3’s earlier generated-output differences do not invalidate retained formatting/lint results because their configuration excludes generated `dist`; final type checks were renewed. Changed test files received applicable fresh checks. No historical test result is accepted as current evidence.

Current native binary SHA-256: `b28b2923a22c22153187041b1a18260832ddee60f73a8bcb75e0b2fe19a3478c`.

Findings: **None.**

Remaining uncertainty: No acceptance-blocking uncertainty within the selected scope. This review does not establish real-model quality, acquisition, GPU/performance, installer, clean-Windows, full-suite or hosted-CI results.

Required next action: No implementation correction. Archival and index edits change the reviewed patch and require the planned fresh R2 assessment with renewed documentary evidence. Preserve this report unchanged.

This approval passes the independent change-review gate only. It is not a Validation Report and grants no permission to commit, push, create a pull request or merge.
