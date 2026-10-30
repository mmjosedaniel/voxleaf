# Minimal corrections for six verified audit findings

## Goal

Correct the six findings retained after four static review passes and their
subsequent verification, with the smallest changes to their existing owners.
Use focused regressions and existing evidence to avoid redundant validation.
This is a cross-milestone bug-fix plan, not a refactor campaign.

**Status: implementation complete and independently approved.** On 2026-10-29 the user authorized
SFA-01 through SFA-06 and the selected validation. No commit, push, PR, merge,
installation or tool/dependency update is authorized. The preceding audit ran
no tests; current execution evidence is recorded below.

Planning base: `186f6929e47ee56838cdf746a4b271b3b9ea8ffa`, initially clean `main`.
Plan branch: `codex/six-finding-audit-corrections`.
The planning base is a source reference, not a newly measured test baseline.

## User-visible outcome

- Recognized silent scene separators produce the existing scene-transition
  pause between buffered spoken units, without speaking the ornament.
- English normalization preserves numeric tokens attached to Unicode letters.
- Chatterbox setup discloses the current package's storage measurements and
  identifies old timing observations as historical.
- Adjacent table cells and definition entries remain separate readable and
  narratable text, including in minified XHTML.
- Loaded-audio labels never round an incomplete minute up to the next minute.
- Progress polling cannot hide the latest download action's failure; newer
  user actions still supersede obsolete work.

## Current state

The following are source-verified defects on the planning base. Reproductions
below are deterministic regression specifications, not claims of executed tests.

| ID | Priority | Trigger and current consequence | Owning source |
| --- | --- | --- | --- |
| SFA-01 | P2 | `<p>A.</p><p>***</p><p>B.</p>`: the packer recognizes the silent scene block, but public preparation drops its disposition. A retains a paragraph boundary, selecting 600 ms instead of the existing 1,200 ms scene delay. | `packages/epub/src/narration/narration-preparation.ts`; `narration-segment-packer.ts`; desktop `playback-transition-policy.ts` |
| SFA-02 | P2 | Unannotated English `ø8` can become `øeight`: lexical word boundaries recognize Spanish letters, ASCII digits and combining marks, but miss other Unicode letters. | `packages/epub/src/narration/narration-bilingual-normalizer.ts` |
| SFA-03 | P3 | Setup renders hardcoded package sizes and a current-v5 disclaimer although native ownership selects v7. The dynamic snapshot and static disclosure can disagree. | `apps/desktop/src/tts/OptionalChatterboxControls.tsx` |
| SFA-04 | P2 | `<table><tr><td>10</td><td>20</td></tr></table>` has no source whitespace. Transparent fallback concatenates the cells into `1020`; `dt`/`dd` have the same missing boundary. | `packages/epub/src/document/xhtml-projector.ts` |
| SFA-05 | P3 | At 61,000 ms ready and a 120,000 ms target, upward minute rounding displays two minutes ready even though preparation is incomplete. | `apps/desktop/src/tts/adaptive-preparation-presentation.ts`; `AdaptivePreparationControls.tsx` |
| SFA-06 | P2 | Download starts, a later 250-ms refresh returns `confirming`, and native preflight rejects the download. The common request counter discards that older action's error; the UI ignores its return value and stops polling in `confirming`. | `apps/desktop/src/tts/optional-chatterbox-client.ts`; `OptionalChatterboxControls.tsx` |

For SFA-03, v7 currently reports 8,240,315,465 download bytes, 8,236,757,393
installed bytes, 13,271,679,006 temporary bytes and 20,000,000,000 minimum free
bytes. These numbers explain the discrepancy; they must not become replacement
UI constants. The authoritative snapshot already carries all four fields.

For SFA-06, `tts_optional_chatterbox.rs` performs host admission before starting
the manager download operation. Admission can reject without changing the
manager's confirming state. Fixing only the manager's in-progress failure path
would therefore miss the verified race.

## Scope and non-goals

### SFA-01: retain scene metadata at the public preparation boundary

Use the existing `scene-break` boundary reason. When preparation consumes an
already recognized silent scene block, promote the last retained spoken
candidate's trailing boundary before publishing the immutable batch. The
existing loop already scans through silent leaves to one spoken lookahead or
publication end; use that traversal instead of introducing a second scan,
unbounded queue, extra silent unit or new public field. Replace immutable
metadata rather than mutating an already frozen segment.

Preserve text, measurements, source ranges, segment identities and the public
continuation at the last returned range end. Consecutive separators should
produce one scene transition. A scene before the requested start must not create
an initial pause. A terminal scene must not add a final delay. Keep current
ellipsis precedence, cancellation, real-buffering replacement and pause values.
If the existing bounded lookahead cannot satisfy a case, record the exact
counterexample and revise this design before expanding any contract or bound.

### SFA-02: protect Unicode lexical adjacency

Extend the lexical-boundary predicate to recognize Unicode letters alongside
the existing digit/mark protection. Keep Spanish dehyphenation and other
language-specific predicates separate; do not broaden their grammar merely
because they share a helper. Preserve standalone `8` expansion, explicit
foreign-language/code exclusions, source mapping and existing parser limits.
Add cases beside MAF-08 rather than editing frozen normalization authorities.

### SFA-03: derive disclosure from the existing snapshot

Pass the current snapshot measurements to `ChatterboxDisclosure` and format
them through a single presentation path. Remove the duplicate size constants.
Use version-neutral wording for the current package while retaining the
historical-v2 timing/resource caveat. Preserve disclosure before acquisition,
consent, cancellation wording and hardware eligibility. No manifest generation,
native change, dependency or new IPC field is necessary.

### SFA-04: delimit inert structural containers

Extend the existing block-boundary handling narrowly for `table`, `tr`, `td`,
`th`, `dl`, `dt` and `dd`. Flush pending safe paragraphs on the existing entry/
exit path; do not insert invented whitespace into source strings. Keep order,
inline formatting, inherited language, supported descendants and source IDs.
Handle nested supported paragraphs without empty or duplicate output.

This remains a safe text projection, not a table layout or definition-list
semantic-model feature. Preserve malformed-input rejection, namespace rules,
hidden-content omission, cancellation and aggregate limits. Verify current
canonical locators and internal targets for the newly separated blocks. Existing
stored positions must use the documented resolver behavior; do not claim that
old generated block indices remain identical or add a persistence migration.

### SFA-05: distinguish loaded duration from estimated waiting

Introduce or adapt a small loaded-duration formatter used by both ready-status
call sites. Report whole seconds, or minutes plus remaining whole seconds,
without rounding available audio upward. For example, 61,000 ms is `1 minute
1 second`, not `2 minutes`. Preserve the existing approximate-wait and target
labels. Do not change scheduler thresholds, measured `readyMs`, playback rate,
preparation choices or start behavior.

### SFA-06: separate action ordering from polling

Keep one bounded client owner. Distinguish user-action generations from snapshot
read ordering: refresh may publish current progress but must not supersede the
pending action's terminal success/failure. A newer select/cancel/remove action
must still invalidate older action results. A poll started before terminal
publication must not restore its stale state afterward. Preserve refresh
deduplication, existing busy outcomes, content-free failures and disposal.
Prefer this correction in the client; change the component only if its existing
subscription/finalizer cannot consume the corrected state. Do not solve the race
with retries, disabled polling, sleeps or native download changes.

### Boundaries

Production edits should remain in the seven identified EPUB/desktop owners:
`narration-preparation.ts`, `narration-bilingual-normalizer.ts`,
`xhtml-projector.ts`, `OptionalChatterboxControls.tsx`,
`optional-chatterbox-client.ts`, `adaptive-preparation-presentation.ts` and
`AdaptivePreparationControls.tsx`. Adjacent tests/documentation may change only
to establish these criteria. An additional production path needs a recorded
causal reason, not a cleanup opportunity.

No shared schema/version, Python/Rust source, model profile, acquisition layout,
frozen corpus, dependency/lockfile, reader geometry, PCM algorithm or benchmark
authority change is planned. No copyrighted EPUB, generated audio, model weight,
private content, log dump or machine-specific path belongs in the commit.

## Relevant files and documentation

Read current versions again if implementation starts after source drift:

- [Documentation index](../../README.md), [product requirements](../../product/mvp.md),
  [project brief](../../product/project-brief.md), [roadmap](../roadmap.md),
  [system diagram](../../architecture/system-diagram.md) and
  [architecture overview](../../architecture/overview.md).
- [ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md),
  [completed M005](../completed/M005-narration-text-preparation.md),
  [ADR-0021](../../architecture/decisions/ADR-0021-boundary-aware-audio-transitions.md),
  [pause policy](../../architecture/playback-transition-pause-policy-v1.md) and
  [reader experience authority](../../architecture/reader-experience-authority-v1.md).
- [Testing](../../development/testing.md),
  [evidence retention](../../development/evidence-retention.md),
  [change review](../../development/agentic-change-review.md) and
  [Git workflow](../../development/git-workflow.md).
- Existing EPUB test owners: `src/document/xhtml-projector.test.ts`,
  `src/narration/narration-normalizer.test.ts`,
  `src/integration/narration-preparation-matrix.test.ts`,
  `src/narration/narration-resource-bounds.test.ts`,
  `src/testing/narration-preparation-limits.test.ts` and
  `src/resource/opened-publication.test.ts`, under `packages/epub`.
- Existing desktop test owners: coordinator, transition policy, PCM playback,
  optional client and both preparation/control surfaces under
  `apps/desktop/src/tts`; browser cases under `apps/desktop/tests/browser`.
- Read-only cross-boundary references: `product-narration-coordinator.ts`,
  `playback-transition-policy.ts`, `pcm-playback.ts`,
  `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` and
  `services/tts/release/optional/chatterbox/optional-package-manifest-v7.json`.

Update current documentation only where the correction changes an expressed
behavior: safe table/definition projection, delivery of recognized scene
metadata, Unicode lexical protection and truthful loaded/disclosure wording.
Keep policy timings and frozen authorities unchanged. The completed M005 plan
and previous evidence remain historical; record the correction here and in
current documentation instead of rewriting their acceptance claims.

## Architecture and constraints

M005 is complete and owns bounded safe-document-to-narration preparation. Scene
recognition remains its existing top-level exact `***`/U+2042 rule, excluding
quotes, lists and raster placeholders. The desktop alone converts boundary
metadata to transition milliseconds and owns interruptible playback.

The system diagram's component, process, persistence and runtime topology remain
applicable. Review it at closeout; update it only if the eventual patch actually
changes an architectural boundary. No such change is proposed.

EPUB and inference stay local. Audio stays memory-only. Preparation/lookahead,
queues and audio remain bounded. Pause, seek, chapter/voice changes, book close
and session replacement must continue to invalidate active work. Intentional
scene delay is neither generated PCM nor an underrun; it cannot introduce a
wall-clock startup wait. Visible position, highlighting and narration ranges
must continue to resolve through canonical EPUB locations.

## Milestones

### M0 — Freeze scope and evidence decisions

**Status: complete.** Entry HEAD is the plan commit
`200144dd29709536b189cb593fe53e927a991dc4`, on the named branch, with a clean
worktree and empty index. No pre-existing work was present.

Record implementation HEAD, clean/index status, any pre-existing work and the
actual changed-path allowlist. Read the receipts below, inspect current tools
and existing artifacts, and classify each gate before running it. Do not infer
an execution-time identity from the present filesystem. No full baseline suite
is required merely to repeat the historical audit.

### M1 — Establish regressions and make the bounded corrections

**Status: complete.**

Add compact synthetic cases to existing suites, labelled `SFA-01` through
`SFA-06`. Run just the new cases against unchanged production once per package
to establish their failure. Distinguish fixture failure from a product failure.
Then implement the seven-owner patch and run the two selected suite groups once
on the consolidated result. During debugging, rerun only a failing case and its
needed controls; do not repeat every package after each edit.

Required regression assertions:

| Finding | Minimum evidence and retained controls |
| --- | --- |
| SFA-01 | Public preparation of A/scene/B produces scene metadata on A for both recognized ornaments, consecutive separators, one/many segment batches and cold/warm continuation across a source window. Leading/trailing scenes, non-scene quoted/list content and ellipsis remain correct. Feed real prepared output into the actual coordinator/player seam to observe the existing 1,200-ms buffered transition. Reuse existing pause/cancel, stale callback, final completion and buffering controls rather than duplicating them. |
| SFA-02 | Table-driven `ø8`, `8ø` and a non-Latin-letter case remain unchanged; standalone `8` still expands. Retain MAF-08 mark/code/language controls. Public one/many batches preserve text and exact source ranges. |
| SFA-03 | Update the existing mounted disclosure test to assert exact snapshot bytes and the historical caveat. Use differing synthetic measurements so hardcoding v7 cannot pass. Keep existing consent and disabled-state assertions. |
| SFA-04 | Minified table cells and `dt`/`dd` produce distinct ordered paragraphs; whitespace variants, inline formatting and supported nested paragraphs do not concatenate, duplicate or invent text. Through the public opener, resolve source ranges/internal targets, narrate the separate values and preserve no-partial-result failure under stricter budgets. |
| SFA-05 | Existing mounted controls cover ready durations just below, at and above 60/120 seconds, including 61,000 ms. Assert both primary and compact loaded labels, unchanged target/ETA semantics and no ready/start claim before the actual threshold. |
| SFA-06 | Deferred promises establish download -> confirming poll -> rejected preflight; the final snapshot and mounted UI show failure. A stale poll after terminal failure cannot restore confirming. Newer cancel/remove/select and disposal suppress obsolete action publication; existing refresh deduplication remains. Use fake timers, not real downloads or timing sleeps. |

### M2 — Consolidated integration and documentation

**Status: complete.**

Run selected static/type and deterministic gates, then one focused Chromium
invocation and one packaged model-free native smoke. Add one browser scenario
named `SFA-EPUB` in `reader-narration-bugfixes.smoke.spec.ts`, using the existing
synthetic EPUB and service seams to establish the corrected table/definition
text reaches the rendered reader and narration in order. Keep exact pause
timing in the deterministic player seam. Pair it with the existing canonical
passage/restoration scenario; do not duplicate that test's full interaction
matrix in the new case. Document the actual limited coverage.

Preserve production build hooks. Record retained tool/artifact identities and
cleanup of owned browser/native processes and scratch profiles. Reconcile the
current documentation and system diagram with the final patch.

### M3 — Independent acceptance and closeout

**Status: implementation APPROVE in SFA-R1-20261029; archival assessment
recorded separately in SFA-R2-20261029.**

After implementation is authorized, delegate the exact patch and host receipts
to `change_reviewer` (GPT-6 Astra high) under the change-review policy. The
reviewer does not edit or run tests. Supply complete diff/new files, base/HEAD,
closed path identities, gate outcomes and justified reuse. Obtain APPROVE on
the exact final patch; missing evidence or reviewer availability is BLOCKED.
Resolve findings and renew only invalidated gates. Freeze final documentation
before requesting review. If later archival/index changes alter reviewed paths,
obtain a fresh assessment with a new report ID while retaining unaffected
runtime evidence; never refresh an old approval's hashes.

Archive this plan and update indexes only when implementation and all required
acceptance are complete. A review does not authorize Git mutations. The current
implementation authorization prohibits commit, push, PR and merge.

## Testing and benchmark strategy

### Previous evidence inspected during planning

The [MAF execution ledger](../evidence/minimal-audit-findings-corrections/execution-ledger.md),
[MAF-R1 review](../evidence/minimal-audit-findings-corrections/review-R1.md),
[CI follow-up](../evidence/minimal-audit-findings-corrections/ci-follow-up.md) and
[MAF-CI-R1 review](../evidence/minimal-audit-findings-corrections/review-CI-R1.md)
were read. Original result files, identity manifests and gate comparisons are
still available under ignored `tmp/evidence/minimal-audit-findings-corrections/`.
Their presence is not a new identity/environment equivalence check.

MAF-R1 reviewed working-tree identities based on
`2f6a80b7b19be6cc62b7706bd85e9be96a1a2b8e`; the CI follow-up reviewed a patch
based on `af852ee81f593998bd14f1a25d0877a9610e6bcf`. Neither bare HEAD alone
identifies the tested patch. Use their closed manifests and before/after gate
snapshots. The recorded local environment was PowerShell 7.6.5, Node 24.20.0 and
pnpm 11.15.1; future execution must establish its own relevant environment.

| Prior receipt / recorded result | Decision for this plan |
| --- | --- |
| `F-TS-01`: shared 210, EPUB 749, desktop 984 and Node 151 passed | Historical reference. Planned EPUB/desktop production changes invalidate dependent test results. Run selected affected suites; do not claim their old package-wide PASS for the new patch. Shared schema tests and seven unrelated Node harness suites need no new execution while their responsibilities/inputs remain unaffected. |
| `CI-Desktop-01`: 61 files / 984 passed | More recent desktop fixture evidence, not coverage of the new fixes. Preserve the corrected App readiness synchronization; no whole-desktop rerun solely to repeat this receipt. |
| `CI-Desktop-01`: unchanged transition-policy and PCM-player test subsets | Candidates for result reuse, not automatic reruns. The policy's EPUB imports are type-only; player tests consume shared contracts, scheduler/backend/worklet code and synthetic inputs rather than the modified EPUB preparation or optional UI/client. Prove their complete runtime/discovery/environment closure unchanged, including worker-loaded files and shared `dist`, and obtain reviewer acceptance. Otherwise execute just the two files through G5R. New public-preparation-to-player integration still runs in G5. |
| `CI-Browser-01`: all 34 passed; earlier `B1-browser-04`: nine passed | Product bundle changes invalidate reuse for current browser acceptance. Run the two selected scenarios once. Keep the corrected RAC-07 frame settlement if that fixture is touched; no automatic repeat-each or full browser matrix. |
| `F-Static-02`, `F-Browser-static-01`, `CI-Static-01` | New TS/TSX and fixture inputs require current applicable formatting, lint and type checks. Unaffected Python/Rust static checks are outside scope. |
| `F-Docs-01`: 31 isolated evidence-guard tests passed; MAF-CI-R1 explicitly accepted their retention | Candidate for result reuse if a guard-test obligation arises. Tests create disposable Git repositories and do not consume this ExecPlan. Confirm original receipts, discovery, guard/test source, configuration, Node/Git and environment equivalence. Never substitute this result for `check:evidence`, which must inspect the current documents. |
| `F-Rust-01`: 148/147 passed, seven ignored per feature variant; `F-Python-01`: 806 passed | No new execution for this TS-only responsibility set, and no new Rust/Python PASS claim. Changes to native/service/contracts/fixtures consumed by these suites would invalidate that exclusion and require replanning the affected gate. |
| `F-Core-01`, `F-Build-Python-01`, native driver/model/source identities | Candidate artifact reuse, separate from test-result reuse. Keep verified core/model/voice files and matching cached tools if exact bytes and admission inputs remain valid. No regeneration, inference or package acquisition is selected. |
| `F-Build-Desktop-01`, `N1-native-01` | Old executable embeds the old frontend; it cannot validate this patch. Run the configured native build/smoke once. Unchanged Rust compilation inputs may benefit from normal incremental build caching. |

Accept result reuse only with retrievable original host receipt plus equal
source/transitive imports, tests, fixtures, discovery membership, configuration,
lock/tool identities, generated inputs and relevant host/environment conditions.
Record the old gate/report ID, the invariant retained and why intervening paths
are not consumed. Have the independent reviewer assess that proof. Missing
proof requires executing the affected required gate, not repeating unrelated
suites. Do not fabricate old hashes, convert artifact reuse into a runtime PASS,
or interpret NO APLICA as REUTILIZAR.

### Selected future gates

This table is the selected execution contract; actual outcomes are recorded
in Final validation results and the execution ledger. Run from the repository root in normal local
PowerShell outside the managed automation sandbox. Stop on a nonzero exit;
record the command, code identities, environment and actual result. No package
installation, tool update, driver download or model acquisition is assumed.

| Gate | Decision, timing and invariant | Command |
| --- | --- | --- |
| G0 | Readiness/identity inspection before expensive preparation. Existing dependency cache, admitted core and matching WebView2 driver must be available; record gaps rather than starting downloads. | Inspect configuration and existing recorded artifacts; no test command. |
| G1 | Build current workspace exports before desktop consumers. Preserve package build hooks; repeat only when inputs change or a required configured hook invokes it. | `pnpm.cmd build:packages` |
| G2 | New regressions only, before production edits. Two filtered invocations using the G4/G5 file lists with `-t SFA-`; these are new planned test names. | G4 and G5 commands with `-t SFA-` appended. |
| G3 | Once on consolidated code: TS formatting, lint, EPUB test/source types and desktop types. These checks are inexpensive and precede browser/native preparation. | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/desktop typecheck` |
| G4 | Focused EPUB regressions plus public preparation, resource bounds, cancellation and immutable continuation controls. | EPUB command below. |
| G5 | Focused desktop regressions plus existing timing, stale-owner, polling and mounted presentation controls. | Desktop command below. |
| G5R | Retain the two unchanged playback suites from `CI-Desktop-01` only with the complete proof above. If proof is missing, or their inputs change, run them once; do not also claim reuse. | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/playback-transition-policy.test.ts src/tts/pcm-playback.test.ts` |
| G6 | Current production-preview integration, two scenarios in one run; retains package/frontend build hooks. | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep "SFA-EPUB\|preserves one canonical passage"` |
| G7 | One current packaged native/CSP/file-open model-free matrix. The projector changes publication-open output, so existing native rerun policy applies. Includes the release/frontend build; do not precede it with a duplicate `build:desktop`. | `pnpm.cmd test:native-startup` |
| G8 | Inspect the final documentation/evidence, relative links, changed paths and whitespace. Renew after documentary drift; no repeated runtime checks for Markdown-only changes. | `pnpm.cmd check:evidence`; `git diff --check`; inspect local Markdown targets. |
| G9 | Independent exact-patch acceptance including any retained evidence. | `change_reviewer` under the linked review policy; no reviewer test execution. |

G4 uses the existing Vitest entry with explicit files. Rebuild exports after
production edits through G1 before either dependent group; `exec` intentionally
does not invoke the package's `pretest` hook, so G1 is not optional.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts src/testing/narration-preparation-limits.test.ts src/resource/opened-publication.test.ts
```

G5 invokes the Vitest leaf already configured in desktop `test`, avoiding its
seven unrelated Node harness suites:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/optional-chatterbox-client.test.ts src/tts/OptionalChatterboxControls.test.tsx src/tts/AdaptivePreparationControls.test.tsx src/tts/ProductNarrationControls.test.tsx
```

This is the initial smallest sufficient gate set, subject to the actual diff
and independent review. Add a gate only for a concrete uncovered responsibility,
new failure or invalidated input. Do not run `check`, `check:portable`, the full
browser suite, the full desktop test wrapper and their leaves redundantly, or
claim an aggregate PASS when only selected leaves ran. Required hosted checks,
if a PR is later authorized, retain their configured policy; local selection
does not waive them.

No real-model listening, GPU/speed sweep, acquisition, firewall, installer or
clean-Windows matrix is needed for these changes. SFA-01 preserves the existing
pause policy and tests its delivery; it does not re-evaluate model quality.
Use deterministic resource-bound tests for the added metadata handling and
paragraph boundaries. Reader performance benchmarks become required if the
implementation changes traversal complexity, batching, geometry, restoration,
rendering strategy or other triggers in the testing policy; do not make a new
latency/memory performance claim from unit tests.

## Risks and rollback

- Scene promotion can be lost at batch/window boundaries or accidentally alter
  already published data. Public one/many, cold/warm and resource-bound cases
  are required; retain existing limits and cancellation checkpoints.
- Unicode classification can unintentionally broaden unrelated normalization.
  Keep the lexical fix local and preserve MAF-08 and language/code controls.
- New projected paragraph boundaries change source-derived block topology.
  Resolve current IDs/ranges and exercise canonical restoration; document the
  existing recovery limits for previously stored generated positions.
- Client ordering can trade a lost error for stale progress or stale success.
  Use controlled interleavings for both action and poll completion orders.
- Unavailable original receipts or changed tools can prevent evidence reuse.
  Re-run only the affected required gate. A missing required native driver or
  review remains a named acceptance gap, not an inferred pass.
- Preserve failed receipts. Retry an environmental/fixture failure only after
  a specific diagnosis and correction; stop repeated unchanged attempts.

Rollback is path-scoped restoration of the affected correction and its tests,
preserving unrelated user work and earlier evidence. There is no data migration
or package-install rollback in this plan. Never use a whole-tree reset. Clean
only task-owned scratch/profiles and verified owned processes after future
execution, retaining content-safe receipts outside tracked documentation.

## Progress log

- 2026-10-29: Re-read the six owning paths and relevant tests/contracts against
  the planning base. Confirmed M005's completed status and the existing scene
  and pause-policy boundary. No runtime test was executed.
- 2026-10-29: Inspected MAF and CI follow-up reports, original result files and
  available identity/comparison artifacts. Classified old dependent results,
  conditional guard-test retention, reusable artifacts and unaffected suites.
- 2026-10-29: Created the dedicated planning branch and this ExecPlan; listed
  it in the active-plan index. Implementation milestones remain pending.
- 2026-10-29: The first documentation-guard attempt stopped before execution:
  PATH selected pnpm 11.25.0, while this repository requires 11.15.1. Repeated
  the documentary checks with the existing pinned Corepack shim and networking
  disabled; no installation or tool update was performed.

## Discoveries and decisions

- The public preparation loop already has bounded spoken lookahead. SFA-01
  should retain metadata there, keeping the packer's silent-block behavior.
- MAF-08 fixed combining-mark adjacency; it did not cover all Unicode letters.
  Preserve that regression and add the missing letter cases.
- Current v7 measurements already cross the native boundary. SFA-03 needs
  presentation deduplication, not a package rebuild or contract addition.
- SFA-06 is a client ordering defect even when native preflight correctly
  rejects a host. A real download or GPU is unnecessary to establish the race.
- Previous CI found two test-readiness races. Preserve the corrected effect/
  frame synchronization and avoid sleeps or blanket retry increases.
- No historical aggregate PASS establishes the future patch. Test-result
  reuse is conditional; artifact reuse and omitted unrelated gates provide
  most of the safe reduction in work.
- This documentation-only planning change changes no runtime or contract;
  independent behavioral review is reserved for M3's implementation patch.

## Historical planning validation

**Implementation: not started. Tests, builds, benchmarks and model execution:
not run for this planning task.** G0-G9 are future work and have no current PASS.

Planning review covers the six source-backed findings, required plan sections,
existing commands, scope and historical evidence classification. Only
documentation checks run for this stage, in local PowerShell outside the sandbox:

- `pnpm.cmd check:evidence`: PASS using the existing pinned Corepack shim with
  `COREPACK_ENABLE_NETWORK=0`; the initial PATH-version failure is retained above.
- `git diff --check` and inspection of the new plan's trailing whitespace: PASS.
- Local Markdown target inspection: all 19 plan links resolve.
- Diff/scope review: only this file and `docs/plans/active/README.md` belong to
  the planning commit. No product, fixture, dependency or historical evidence
  file is modified.

Renew these documentation checks after the final status update and inspect the
exact staged patch before the authorized commit. No test result is newly claimed
or accepted for reuse at planning time; that decision belongs to the eventual
implementation's exact inputs and independent review.

## Execution decisions and results

- 2026-10-29: M0 confirmed the exact planning HEAD, clean worktree and empty
  index. Applied `investigate-bug`; source writing remains with the director.
  Seven production owners and adjacent tests are the closed implementation
  scope. Documentation is limited to this plan, current overview/product/testing
  guidance, indexes and concise evidence/review records.
- G0-host passed outside the sandbox: PowerShell 7.6.5, Node 24.20.0 (within
  declared engines; the `.nvmrc` CI pin remains 24.18.0), pnpm 11.15.1 through
  the existing offline Corepack shim, Rust/Cargo 1.97.1, uv 0.11.29, and matching
  WebView2/EdgeDriver 156.0.4314.50. `package:piper-core:check` passed without
  regeneration or acquisition. No dependencies or tools were installed.
- Read MAF execution/review and CI follow-up receipts and original local result
  files. Do not reuse historical test results: the receipts do not establish
  complete gate-time installed dependency/worker/environment closure for this
  execution. G5R runs only the two affected retention candidates; the isolated
  guard suite will run once. Other Python/Rust/shared/Node/model suites are
  outside scope, not reused PASSes. Existing core and driver are artifact reuse
  only; the current frontend/native executable will be rebuilt by G7.
- G2-epub-red: 12 intended failures and one control passed. G2-desktop-red:
  reproduced disclosure, loaded-duration and action/poll ordering failures.
  Its coordinator fixture mismatched publication identity and its ETA input
  used a nonexistent property. Directed repairs, still against unchanged
  production, yielded G2-scene-fixture-red (600 ms instead of 1,200 ms; ellipsis
  control passes) and G2-desktop-fixture-red (five rounding failures, two exact
  minute controls pass). Original receipts remain retained.
- The public opener accepts only cancellation options, not stricter policy
  overrides. Budget coverage uses the existing internal projector boundary:
  exact four-block admission and three-block no-partial-result rejection.
  Public opener coverage separately verifies ordered text, exact source ranges
  and internal fragment targets. No public testing option was added.
- Consolidated G5 passed 186 tests; G5R passed 40 playback-policy/PCM tests.
  G4 passed five files and 241 tests but one new matrix expectation incorrectly
  assumed 10/20 expand to words. Existing normalization deliberately preserves
  these tokens. Corrected that fixture and the browser expectation, retaining
  separate ordered values. G4-matrix-final passed all 18 matrix tests. One
  intervening matrix run was redundant because an edit script failed on UTF-8
  decoding before writing; retain G4-matrix-repair as failed evidence.
- G3 formatting/lint passed. Type checking found the invalid budget option and
  test-only Promise.withResolvers unavailable in the configured ES library.
  Corrected tests to the existing promise-constructor pattern and budget seam;
  EPUB and desktop type checks pass. A scoped formatter attempt detected the
  two rewritten files; G3-desktop-final formats them and passes lint/types.
  Renew the two final matrix/browser fixture inputs before browser execution.
- All raw receipts, before/after input hashes and failure output are retained
  under ignored `tmp/evidence/six-finding-audit-corrections/`. No raw evidence,
  EPUB, audio, private paths or model payload enters tracked documentation.

## Final validation results

Implementation is present in the seven authorized owners. G1/G3/G4/G5/G5R,
G6 and G7 pass; 31 isolated evidence-guard tests also pass. G8-docs-R1 passed
the current evidence guard, whitespace and all 131 local links; G8 is renewed
after archival. G9 implementation acceptance is **APPROVE**, no findings, in
[SFA-R1-20261029](../evidence/six-finding-audit-corrections/review-R1.md).
The final archived patch has a distinct
[SFA-R2-20261029 assessment](../evidence/six-finding-audit-corrections/review-R2.md);
that report records its exact verdict and identity recheck. Full commands, failed attempts,
input identities, result retention and limitations are in the
[execution ledger](../evidence/six-finding-audit-corrections/execution-ledger.md).

G6 passed both selected Chromium scenarios. G7 rebuilt the native executable
once with its configured frontend hook and passed the model-free WebView2
matrix. Current binary SHA-256 is
`b28b2923a22c22153187041b1a18260832ddee60f73a8bcb75e0b2fe19a3478c`.
No errors/external requests or new owned processes/scratch roots remained;
pre-existing roots were preserved. Final tool/artifact inspection verified the
matching retained driver and no preview listener, with the Git index empty.
Historical test results were not reused. Core/driver artifact reuse and
unchanged current-task gate retention are separate, explicit ledger decisions.

The App-scoped optional client has no disposal API. Preserve its existing
ownership: Settings unmount removes subscription/polling, including while an
action is pending; it does not cancel an otherwise current App action. Newer
user actions invalidate obsolete publication. No public disposal method or
App lifecycle redesign is added to satisfy an assumed boundary.
The current system diagram was reviewed: component/process/persistence topology
and public contracts remain unchanged. Completed M005 and frozen authorities
retain their original bytes. The new scene metadata uses existing bounded
lookahead, and the seven inert structural tags use the existing entry/exit
flush path; traversal complexity, reader rendering/batching/geometry and
restoration algorithms are unchanged. Reader performance suites are outside
scope, with no new performance claim.


### Independent acceptance and archival

- 2026-10-29: `change_reviewer` (GPT-6 Astra high) issued SFA-R1-20261029
  APPROVE with no findings. Its before/after comparison matched all 1,443
  paths, and the director independently rechecked that closure before archival.
  The reviewer accepted the existing public budget and App-scoped lifecycle
  boundaries, bounded metadata/structural changes and scoped current-task result
  retention. It compared 250 generated dependency/installed-lock inputs without
  drift. Historical test results remain excluded from reuse.
- Archived this plan only after implementation acceptance. Updated active,
  completed and documentation indexes; saved R1 unchanged. These documentary
  changes require fresh R2 assessment, not altered R1 hashes. Final R2's linked
  report is the authority for the archived patch, with renewed G8 evidence.
- No runtime or test input changes during archival; no runtime suite/build is
  repeated for Markdown-only drift. HEAD and empty index remain unchanged.
  No commit, push, PR or merge is performed. No acceptance-blocking limitation
  remains in the implemented scope; the ledger retains unexecuted model,
  acquisition, installer, full-suite, performance and hosted-CI limits.
