# Independent F4 change review reports

Reports are immutable and excluded from their own reviewed-path manifests.
The reviewer reads code and host receipts without editing or executing tests.
Implementation and archival assessments are recorded separately below.

## F4-R1-20261031 — CHANGES_REQUESTED

Task ID: F4-20261031. Base and reviewed HEAD:
`3a1f83d395a8c50bc2333136c29d8ef6250d3d8d`.
Reviewer: independent `change_reviewer`, GPT-6 Astra high; read-only, no tests run.

Closed 66-path manifest:
`tmp/evidence/four-finding-minimal-corrections/run-01/F4-R1-20261031-manifest.json`,
SHA-256 `c7a93713dee9ef877ba9418d49c519582944db381a4b90ba8dde01b7b334219b`.
All 149 receipt identities match. Diff SHA-256:
`c8a758f6a100fdcb9c91d9988242fc710e127e2d24d80a2a3893e523186cde53`.
Additional supporting path examined: `docs/README.md`, unchanged, SHA-256
`2a88fbea692012f8e602e0d95ebdcc186da50d013ae3c41097183c7eac34ab8d`,
filter-aware blob `d816706a1c3bd755a7780acd6c7eff43f11b1bd8`; matches the
source-input receipt. Reports remain excluded from their own manifest.
Identity recheck: PASS; HEAD, file hashes/blobs/statuses and receipt hashes
unchanged; index empty.

Acceptance review: F4-01/02 implement Unicode-number adjacency and date-compound
guards with accepted controls, all current profiles and exact source endpoints.
Legacy normalization, allowlists and resource limits remain unchanged. F4-03's
production ordering preserves cancellation-first active synthesis, shared deadline,
cleanup verification and failed-owner retention; initial containment regression
is effective, but explicit recovery coverage has the defect below. F4-04's final
arbitration cancels successful PCM, the hook calls real cancellation in the intended
window, completion-wins succeeds, and frontend stale-byte rejection remains intact.
No contract, persistence, topology or packaging change was found.

Test evidence reviewed (host receipts, not reviewer execution): intended red
failures EPUB 16, corrected desktop one, native one; original desktop harness
timeouts excluded. EPUB 213 passed; desktop 213 passed with 148 coordinator
renewed; Rust 35/34 passed with five ignored each. Required static, exports,
core-integrity, build and docs exit 0. Current native Piper EN exit 0, original
resources restored, no new owned processes/scratch, six closed AudioContexts,
zero retained audio and external requests. Input comparisons justify retaining
unaffected results, including the isolated player/client suites' 65 cases.
These passes do not repair the coverage defect.

Finding F4-R1-01, P2: recovery regression passes despite failed recovered synthesis.
At `product-narration-coordinator.test.ts` lines 2209 and 2283-2295, the getter-only
`clock.nowMs` makes `ManualClock.advance` (line 74) throw inside fake synthesis
(lines 232-239), after recording the segment but before PCM construction.
Assertions observe dispatch/identity only; the coordinator catches the thrown
exception as synthesis failure. Adjacent SAC-10 stubs advance consistently.
Correction criterion: fix the clock fixture, await actual playback/accepted PCM,
and assert operational recovery with no failure, one replacement start and fresh
identity. Preserve no-autoplay and failed-shutdown assertions; renew affected
host gates and request a new immutable review.

Remaining uncertainty: no confirmed production defect; healthy explicit recovery
for this injected loading failure is insufficiently demonstrated. Required next
action: correct F4-R1-01 and renew affected test/static/document evidence.
No Git action is authorized by this report.

## F4-R2-20261031 — APPROVE

Task ID: F4-20261031. Base/reviewed HEAD:
`3a1f83d395a8c50bc2333136c29d8ef6250d3d8d`. Independent change_reviewer,
GPT-6 Astra high; read-only, no tests executed.

Closed 68-path manifest `F4-R2-20261031-manifest.json` in the raw receipt root,
SHA-256 `8bbbb9daa973f300f6ab528530016d3a81dafc8aac561e770e0accbce9e11487`;
all 189 receipt hashes match. Diff SHA-256:
`328095cb367c106a9016836ff2adb36fadd99983a50e3af4aaf323ae33586a84`.
Additional unchanged support: `docs/README.md`, SHA-256
`2a88fbea692012f8e602e0d95ebdcc186da50d013ae3c41097183c7eac34ab8d`,
blob `d816706a1c3bd755a7780acd6c7eff43f11b1bd8`.
Identity recheck PASS: before/after HEAD, hashes/blobs/status and receipts match;
index empty; renderer/executable match G-BUILD. Reports excluded from manifest.

Acceptance: all four corrections preserve controls, exact source endpoints,
legacy behavior, active-synthesis cancellation order, absolute deadlines,
cleanup/failure containment and frontend stale-byte rejection. F4-R1-01 resolved:
consistent clock, actual active playback, playing/operational/no-failure assertions,
one replacement and fresh identity; no-autoplay and failed-shutdown controls remain.
Public contracts, local inference, ephemeral bounded audio, persistence and topology
are unchanged; withdrawn packaging work excluded.

Evidence reviewed: R2 coordinator 148 pass; R2 TS format/lint/desktop types exit 0;
R2 docs exit 0 (86 links); retained EPUB 213, isolated player/client 65, Rust 35/34
with five ignored each; retained exports/EPUB types/Rust static/core/build exit 0;
current Piper EN native exit 0 with cleanup/restoration. Exact commands and hashes
are in the ledger and manifest. Independent input comparison justifies retention:
production/exports unchanged, installed membership/hashes/environment match, test
isolated from retained suites/artifacts, renewed docs match. Failed receipts/R1 kept.

Findings: none. Remaining uncertainty: no unresolved issue in scope; native evidence
is bounded Piper EN and makes no new quality/hardware/broad performance claims.
Required next action: none for implementation acceptance. Archival edits require
new immutable assessment. No commit, push or PR authorization is granted.

## F4-R3-20261031 — APPROVE

Task ID: F4-20261031. Base commit and reviewed HEAD:
`3a1f83d395a8c50bc2333136c29d8ef6250d3d8d`.
Reviewer: independent change_reviewer, GPT-6 Astra high.

Reviewed paths and identities: closed 72-path manifest
`tmp/evidence/four-finding-minimal-corrections/run-01/F4-R3-20261031-manifest.json`,
SHA-256 `5a1fe93c6d99d11a875e2b855ee1e5949595902b7c32622ca1253eca059c32db`.
Both sides of the plan move are represented, old path DELETED. All 207 receipt
hashes match. Reports remain excluded from their own manifest.
Reviewed diff SHA-256:
`fb66092428cb693ee67452f3a7ec75cbb82fcb94e3ec600a18b8268044bad6e4`.

Identity recheck: PASS. Before/after base, HEAD, reviewed hashes/blob IDs/statuses
and receipts match; index empty. Production/test files match R2. Built renderer
and native executable match G-BUILD.

Acceptance review: archival changes correctly move the accepted plan to completed,
update navigation and record R2 approval and F4-R1-01 resolution. Scope, acceptance
criteria, failed evidence and limitations remain preserved. No runtime, contract,
dependency, persistence or architectural change follows R2.

Test evidence reviewed: supplied host PowerShell receipts; no tests executed by
reviewer. R3-DOCS-evidence (`pnpm.cmd check:evidence`), R3-DOCS-diff
(`git diff --check`) and R3-DOCS-links (recorded check-links.ps1 invocation) exit 0;
375 relative links present. Current document identities match receipts.
R2 runtime/static acceptance retained: 213 EPUB, 148 renewed coordinator plus 65
isolated player/client cases, Rust 35/34 with five ignored each; required static,
exports, core-integrity, build and Piper EN native evidence.

Retention is justified by unchanged production/test identities since R2, matching
exports and built artifacts, and the reviewed installed-input/environment proof.
Archival Markdown is outside runtime inputs. Native cleanup and resource-restoration
evidence remains applicable; no new runtime execution is claimed.

Findings: none. Remaining uncertainty: none within approved scope; recorded native,
model and performance limitations remain. Required next action: none.
This approves the exact final patch and archival assessment. It is not a refactor
Validation Report or authority to commit, push or create a PR.
