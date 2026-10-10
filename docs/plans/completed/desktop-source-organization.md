# Desktop source organization

## Goal

Improve three demonstrated maintenance boundaries in `apps/desktop/src` without
changing product behavior: semantic render planning, the Web Audio playback
backend, and the ordered application stylesheet.

This is a cross-milestone maintenance plan. The initial 2026-10-10 request
authorized the plan and local branch. The subsequent execution request authorized
all three units, required host validation and evidence/documentation updates,
while prohibiting staging, commits, pushes, pull requests, model acquisition,
installed-package changes and firewall changes. Subsequent explicit authorization
permitted one normal-flow Chatterbox v3 installation and one temporary exact
interpreter outbound block, with removal afterward. All three source units are
now independently accepted and combined F passed. The temporary rule is removed;
this plan is complete and archived, with final documentation closure checked
separately. No Git mutation is authorized; accepted changes remain unstaged.

## User-visible outcome

The reader should look and behave exactly as before. Rendering order, keyboard
focus, restoration, highlighting, narration, playback speed, cancellation,
settings, and responsive/accessibility presentation remain unchanged.

Developers will be able to inspect the pure render plan independently of React,
find Web Audio resource ownership in the existing playback-backends area, and
navigate smaller stylesheets with an explicit cascade order. File length alone
is not an acceptance criterion.

## Current state

Planning snapshot: local `main` and HEAD were
`a9a84ffa973073dad4240b246f8d9df72fccf275`. Git setup order
`DESKTOP-ORG-SETUP-01` created `codex/desktop-source-organization` from that exact
commit, leaving `main` unchanged and the index/worktree clean before the
documentation edits. No remote update was performed. Reinspect the checkout
before execution; this snapshot is not an implementation baseline.

Execution HEAD is `ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5`, the committed
planning document, on the existing `codex/desktop-source-organization` branch.
Initial index/worktree were clean. Fresh evidence is indexed
[here](../evidence/desktop-source-organization/README.md). All thirteen source/test
paths are accepted at the three immutable POST-CHANGE-02 reports and remain
unstaged. Semantic extraction uses501 combined lines, PCM801, CSS3349. CSS required
one formatter-only correction; other units required no source correction.

Historical blockers and their resolutions remain recorded: existing driver
mismatch; absent current optional Chatterbox package; missing isolation for its
installed interpreter; standalone N inheriting real-model environment flags.
Authorized normal-flow installation retained v2. The exact temporary rule was
removed and its absence verified after final tests. Fresh PCM baseline03 and post-change02 both
passed the complete six-arm H command; both Piper six-rate matrices passed.
Qwen's measured buffering exceeds MVP goals despite harness PASS; ADR-0051 remains.
No source/harness repair, threshold relaxation or additional host change occurred.

CSS source reconstructs exactly and fresh compiled JS/CSS/worklet bytes match PCM
post02. That report's model observations remain applicable to unchanged affected
runtime inputs; fresh CSS D/B/N passed. Rebuilt executable binary equality is not
claimed. Independent FINAL-01 passed the combined scope and evidence checks.

The review inventoried 121 files: 66 non-test TypeScript/TSX files, 54 separate
test files, and one stylesheet. The first count includes test setup and frozen
authority modules; it is not a count of eligible production refactors. Existing
`reader`, `publication`, `persistence`, `settings`, `file-ingress`, and `tts`
boundaries already express useful ownership. Tests are already separate and
normally colocated with the behavior they protect.

| Target / planning audit ID | Current size | Decision and evidence |
| --- | --- | --- |
| `reader/SemanticDocument.tsx` / `DESKTOP-SEMANTIC-DOCUMENT-01` | 955 lines | CHANGE, medium risk. Pure preorder indexing/group planning is embedded among React projection, batching, and DOM/ref registration. An existing memoized plan provides a narrow extraction boundary. |
| `tts/pcm-playback.ts` / `DESKTOP-PCM-01` | 1,115 lines | CHANGE, medium risk. `AdaptivePcmPlayer` and the concrete Web Audio backend share one file despite an existing backend interface. Resource/device work can move without moving player state. |
| `styles.css` / `DESKTOP-STYLES-01` | 1,659 lines | CHANGE, medium risk. Base, reader, narration, media rules, and later shell/Settings overrides share one stylesheet. The override sequence must survive the split. |
| `App.tsx` | 1,039 lines | SKIP for this campaign. Settings actions already delegate to `settings/narration-settings-actions.ts`; the remaining restoration, persistence, replacement, and locator routing share publication lifetime. |
| `reader/ReaderPublication.tsx` | 921 lines | SKIP. Navigation policy and semantic projection already have separate owners; DOM restoration, focus, and ref cleanup must stay coordinated. |
| `tts/product-narration-coordinator.ts` | 1,909 lines | SKIP. Scheduling, playback, and recovery already delegate; further splitting cancellation/session identity would add ownership handoffs. |
| `tts/adaptive-buffer-scheduler.ts` | 1,005 lines | SKIP. Bounded FIFO, reservations, and readiness belong to one state machine. |

The table records planning source-inspection findings, not runtime results.
Fresh execution results below supersede its implementation-status snapshot.
Other source files remain context or outside this bounded campaign, not
implicitly audited and accepted for modification.

## Scope and non-goals

Execute the following three units sequentially. Paths below are proposed closed
source allowlists; the auditor must refresh each packet against the actual
checkout before the director freezes an order. New files must not already exist
with user changes. Documentation and concise evidence have separate ownership.

### Unit 1: semantic render planning

Allowlist:

- `apps/desktop/src/reader/SemanticDocument.tsx`
- new `apps/desktop/src/reader/semantic-document-render-plan.ts`
- `apps/desktop/src/reader/SemanticDocument.test.tsx`

Move the existing plan types, block index, `buildBlockPlan`, `groupBlockPlans`,
`buildBlockSequencePlan`, `buildDocumentRenderPlan`, and `groupListItemPlans`
into the focused internal module. Expose only what the renderer needs; helper
types/functions can remain private. Keep JSX, hooks, memo comparators, React
keys, DOM/ref registration, and resource ownership in `SemanticDocument.tsx`.
Do not create a generic tree visitor or a new rendering abstraction.

Preserve preorder traversal of nested quotes/lists, locator index ranges,
original block identities used by WeakMaps, grouping, freezing, memoization,
and the existing 250-block yielding boundary. Leave capacity policy and the
render scheduler in `large-chapter-rendering.ts` unchanged. Add one meaningful
renderer regression covering nested quote/list content crossing that boundary;
retain the existing flat batching, source-order, safety, and rejection tests.

Planning ceiling: three files and approximately 700 added/deleted lines,
predominantly relocation. The fresh work order freezes an exact ceiling before
writing; an exceeded ceiling requires a revised audit/order, not silent growth.

### Unit 2: Web Audio backend ownership

Allowlist:

- `apps/desktop/src/tts/pcm-playback.ts`
- new `apps/desktop/src/tts/pcm-playback-contracts.ts`
- new `apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts`

Move the existing `PcmPlaybackError`, `PcmPlaybackErrorCode`, and shared
request/handle/callback/backend contracts to the neutral contracts module.
Move `WebAudioPcmPlaybackBackend`
and its private Web Audio handle/factory types into the backend module. Retain
`AdaptivePcmPlayer` orchestration in `pcm-playback.ts`, with compatible re-exports
for existing callers and tests. This introduces no new interface or policy.

The backend must import runtime errors and types from the neutral module, not
from the player facade. Preserve constructor/error identity, source and gain
ownership, little-endian PCM decoding, 24 kHz clock behavior, buffer bounds,
deferred rate changes, stale-callback suppression, and one-time resource release.
Keep the existing tests in `tts/pcm-playback.test.ts` unchanged unless a fresh
audit identifies a necessary regression and explicitly revises the allowlist.

Do not relocate or edit `playback-backends/incremental-wsola-v3.ts` or
`playback-backends/incremental-wsola-v3-worklet.ts`. Their URL/path identities
participate in frozen playback authority. Inspect
`reader-settings-playback-authority-v3.ts` and
`reader-settings-playback-result-v3.test.ts` as read-only context. A shorter
player file does not imply a smaller bundle or new lazy loading.

Planning ceiling: three files and approximately 850 added/deleted lines.

### Unit 3: preserve the global CSS cascade while splitting the source

Keep the single `main.tsx` import of `styles.css`. Replace the entry stylesheet
with five unconditional local imports in exactly the order below. Source line
ranges describe the planning snapshot; refresh them by rule boundaries if the
baseline changes. Each slice contains complete rules and media blocks.

| Proposed destination under `apps/desktop/src/` | Baseline slice | Ownership |
| --- | --- | --- |
| `styles/shell-and-publication.css` | 1-246 | Foundation, initial shell, hardware summary, publication metadata/restoration |
| `styles/reader.css` | 247-807 | Reader variables, viewport, navigation, leaf, semantic content and images |
| `styles/narration-and-publication-states.css` | 808-1062 | Empty/failure surfaces and narration/preparation controls |
| `styles/accessibility-and-responsive.css` | 1063-1243 | Intact theme, reduced-motion, forced-color and responsive blocks |
| `styles/reader-shell-and-settings.css` | 1244-1659 | Later shell, Settings and workspace overrides, including their media blocks |

The closed allowlist is those five new files, `apps/desktop/src/styles.css`,
and `apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx`: seven files.
This is one explicit exception to the normal unit size because it has one
global cascade and one stylesheet-loading/test boundary. Do not distribute the
entry/test migration across successive units.

Preserve selectors, specificity, declarations, `!important`, custom properties,
vendor rules, comments, duplicate rules, and media context in original order.
For example, the later `.reader-toc`, `.reader-preference-grid`, and
`.visually-hidden` rules deliberately override earlier rules. Do not deduplicate,
regroup all occurrences by component, introduce layers or CSS Modules, change
markup, or add a preprocessor/dependency.

Adapt the existing accessibility CSS-reading test to read the entry's actual
ordered import list and assemble those local files. Assert the exact five
imports, their order/uniqueness, and absence of conditional import qualifiers.
Retain the reduced-motion, forced-color and focus assertions on the assembled
CSS. Filenames alone or dummy declarations do not establish accessibility.

The validator captures the baseline stylesheet before editing and compares it
with the reconstructed leaf contents. Require exact equality after CRLF-to-LF
normalization and the explicitly recorded slice-boundary separator handling:
each leaf ends with one newline; concatenate leaves with one additional newline
between them to reconstruct the original blank separator lines. Do not normalize
selectors, declarations, interior whitespace, comments, or media blocks to make
the comparison pass. Keep this temporary comparison script/capture in ignored
evidence storage, not production code or permanent raw evidence.

Planning ceiling: seven files and approximately 3,400 added/deleted lines,
almost entirely the 1,659-line relocation. Reassess before editing if the actual
baseline invalidates this bound or the proposed complete-rule slices.

### Exclusions

- No broad `tts` folder migration or new catch-all `utils`, `services`, or
  `hooks` hierarchy. These proposals need a later concrete ownership problem.
- No forced splitting of the four SKIP owners, coherent mapper/image-policy
  modules, or large test suites solely because of line count.
- No central test-directory migration. Preserve current colocated `.test.ts`
  and `.test.tsx` conventions and existing integration/browser boundaries.
- No Rust, EPUB extraction/normalization, shared protocol, Python TTS, dependency,
  lockfile, configuration, or generated-source changes.
- No frozen evaluation/release authority, benchmark evidence, completed plan,
  model policy, timeout, or assertion weakening.
- No bug fix, UI redesign, performance optimization, model support expansion,
  or test-harness repair hidden inside a relocation.

## Relevant files and documentation

Read before execution:

- [Project instructions](../../../AGENTS.md), [plan rules](../../../.agents/PLANS.md),
  [documentation index](../../README.md), and [roadmap](../roadmap.md).
- [MVP requirements](../../product/mvp.md) and
  [reader settings/playback requirements](../../product/reader-settings-and-playback-controls.md).
- [System diagram](../../architecture/system-diagram.md),
  [architecture overview](../../architecture/overview.md),
  [ADR-0017 synchronization](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
  [ADR-0040 WSOLA](../../architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md),
  [ADR-0041 shell](../../architecture/decisions/ADR-0041-simplify-empty-and-ready-reader-chrome.md),
  and [ADR-0051 delivery priority](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md).
- [Agentic refactoring](../../development/agentic-refactoring.md),
  [testing](../../development/testing.md), [Git workflow](../../development/git-workflow.md),
  and [evidence retention](../../development/evidence-retention.md).
- [Orchestration skill](../../../.agents/skills/orchestrate-safe-refactor/SKILL.md),
  its complete [contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md),
  [validation skill](../../../.agents/skills/validate-safe-refactor/SKILL.md),
  and complete [validation matrix](../../../.agents/skills/validate-safe-refactor/references/validation-matrix.md).
- The completed [settings modularization](../completed/bounded-settings-and-chatterbox-modularization.md)
  and [native test layout](../completed/native-rust-test-layout.md) as historical
  context, not reusable acceptance for new source identities.

Direct source/test context includes the allowlists above,
`reader/large-chapter-rendering.ts` and its tests,
`reader/ReaderPublication.test.tsx`, `tts/pcm-playback.test.ts`,
`tts/product-narration-coordinator.test.ts`, the playback backend/authority
files, `main.tsx`, and the browser foundation, reader-reflow/restoration,
active-locator, large-chapter, and synchronization suites. Resolve these under
`apps/desktop/src` or `apps/desktop/tests/browser` as applicable. Inspect root
and desktop `package.json` and the native/portfolio scripts before running gates.

## Architecture and constraints

This plan preserves process, package, persistence, and trust boundaries. Review
the canonical system diagram at closeout; no change is expected for these
internal extractions. Update current developer documentation only if an existing
statement becomes inaccurate. Do not rewrite historical/completed documents.

Keep EPUB contents local, inference local, generated audio in bounded memory,
and diagnostics free of book contents/private paths. Preserve cancellation on
pause, seek, chapter/voice change, close, and session replacement. Keep stable
EPUB locators synchronized with visible location, narration, highlighting, and
persisted progress. The approximately 15-second start threshold is playable
audio lead, never a fixed wall-clock delay; underrun observation remains intact.
Malformed/oversized documents must retain existing rejection and resource limits.

The director owns documentation and decisions. Reuse one `clean_code_auditor`
and one `clean_code_worker` on GPT-6.1 Sol high, plus one `refactor_validator` on
GPT-6 Astra high. Reuse a GPT-6.1 Sol medium `git_steward` only for separately
authorized Git work. Keep the four-supporting-agent limit and exactly one source
writer. Supporting agents do not delegate. An unavailable auditor/worker/validator
is a blocker, not permission to substitute a model or self-validate. The existing
Git-steward fallback applies only after recording its unavailability.

For each unit: refresh the audit, draft terms, obtain a passing independent host
baseline, freeze an Approved Work Order with its baseline Report ID, implement,
inspect the Change Packet, and obtain independent post-change validation. The
CSS unit follows the same safety/identity process; its seven-file exception is
explicit rather than a pretext to broaden the TypeScript campaign. This refactor
uses the validator, without adding the separate feature/bug reviewer role.

Every report records HEAD and closed path identities before and after commands.
Changes or drift require a new report, not replacement hashes in an old PASS.
The baseline index is empty and each new unit's allowlisted paths must be free
of pre-existing worktree changes. Preserve unrelated work and stop on overlap.
With no commit authorization, accepted units remain unstaged; their disjoint
allowlists allow the next unit to start without editing previously accepted
paths. Final validation covers the combined patch. Do not carry a rejected unit
forward. Git remains idle during writing and validation; documentation updates
also wait until the active writer or validator is idle.

Store concise Audit Packets, Orders, and immutable Validation Reports under
`docs/plans/evidence/desktop-source-organization/` when execution begins. Include
identities, invariants, exact commands/outcomes, environment, and limitations.
Keep raw logs, CSS snapshots, temporary scripts, and captures in ignored
`tmp/evidence/desktop-source-organization/<run>/`. Preserve actual immutable
acceptance and failed-baseline reports; do not create placeholder PASS receipts.

## Milestones

### Milestone 1: confirm execution inventory and unit terms

Status: Complete. Execution inventory, refreshed first audit and independent
group D baseline PASS are recorded; first work order frozen.

On an instruction to execute, read the required context, confirm actual branch,
HEAD/index/status, role availability, scripts, and the three source allowlists.
Refresh the first audit and independent baseline. Record new findings, changed
line ranges, and any blocker before approving implementation. Preserve the
remaining files as SKIP/context/excluded rather than creating extra units.

### Milestone 2: extract semantic render planning

Status: Complete. Unit 1 accepted at immutable POST-CHANGE-02 source identities;
changes remain unstaged.

Execute Unit 1 with baseline group D and post-change groups D, B, and N below.
The new nested batching regression must assert actual rendered order and bounded
progress, not the extracted helper's implementation. Accept only with an
independent PASS for the exact three-path patch and all stated invariants.

### Milestone 3: isolate the Web Audio backend

Status: Complete. Three paths/801 lines accepted at immutable
DESKTOP-PCM-01-POST-CHANGE-02 identities; all D/B/N/H commands PASS.

Execute Unit 2 with baseline groups D and H and post-change groups D, B, N,
and H. Establish the relevant model-backed baseline before changing the backend;
existing unrelated failures must remain visible. Inspect static runtime imports,
compatible re-exports, unchanged worklet paths, and production asset loading.
Accept only with independent deterministic and applicable packaged evidence.

### Milestone 4: split the ordered stylesheet

Status: Complete. Seven paths/3349 lines accepted at DESKTOP-STYLES-01-POST-CHANGE-02;
exact reconstruction and fresh compiled CSS equality, all D/B/N commands PASS.

Execute Unit 3 with baseline groups D and B plus the frozen stylesheet capture,
then post-change groups D, B, N, and the reconstruction equality check. Inspect
the actual built CSS/import expansion and existing browser assertions for themes,
focus, narrow viewports, zoom, reduced motion, and forced colors. Keep the
stylesheet/test migration atomic within this one accepted unit.

### Milestone 5: accept the combined patch and close documentation

Status: Complete. Independent FINAL-01 PASS on all thirteen accepted source/test
paths; temporary rule removed, plan archived and indexes updated. Separate final
documentation closure verifies those follow-up records without changing code.

Have the independent validator run group F against the complete frozen patch,
review source/test integrity, privacy/artifacts, unchanged frozen authorities,
and evidence identities. Reuse prior expensive host evidence only when its full
affected source/configuration/environment identity remains applicable. A later
unit changing relevant inputs requires fresh affected host validation; record the
reason for reuse or repetition. Do not replay unchanged matrices without a concern.

Review the canonical system diagram and current documentation. Record each
CHANGE/SKIP/BLOCKED outcome, actual command results, report IDs, and the final Git
state. Move this plan to `docs/plans/completed/` and update both indexes only
after all required implementation acceptance is complete. Commit/push/PR status
must be stated separately; technical completion does not authorize those actions.

## Testing and benchmark strategy

All tests and validation run in normal local PowerShell outside the managed
sandbox, from the repository root. A sandbox result is exploratory only.
Commands below exist in the inspected package configuration; recheck them if
the execution checkout differs. Do not add scripts merely to support this move.

### D: deterministic desktop and source checks

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop build
```

Expected: exit zero with existing assertions intact. The desktop test command
includes Vitest and configured Node script tests; do not replace it with a
narrow Vitest invocation and claim the whole command passed. TypeScript format
checking also covers CSS, but does not validate this Markdown plan.

Unit 1 relies on semantic source-order/language/inert-markup/target/batching/
capacity tests, large-chapter scheduling/cancellation, and reader restoration,
focus, and cleanup coverage. Unit 2 relies on FIFO/progress, release-once,
stale-callback, bounded cleanup, deferred speed, PCM clock/copy, and WSOLA reuse
coverage. Unit 3 retains the existing hardware accessibility assertions and
adds only the assembly checks necessary for its new loading structure.

### B: rendered browser behavior

```powershell
pnpm.cmd test:browser
```

Expected: configured browser suite passes, including reader scrolling,
appearance/system theme, Settings focus, forced-color treatment, narrow
viewport/zoom restoration, active locators, and synchronization. Preserve
assertions and timeouts. CSS source equality supplements computed-style and
interaction evidence; it does not replace a build/browser check.

### N: packaged model-free behavior

```powershell
pnpm.cmd test:native-startup
```

Expected: native build and packaged WebView2 smoke pass. This gate is not a
model-backed or six-playback-rate acceptance claim.

### H: model-backed playback acceptance

```powershell
pnpm.cmd test:tts:bilingual-portfolio-exact-host
```

Use existing configured local runtimes and documented isolation prerequisites.
Under ADR-0051, required delivery evidence is fresh Piper Spanish/English and
Chatterbox Spanish/English, including cancellation, synchronization, cleanup,
bounded playback, and both Piper six-rate matrices. The current script still
preflights and sequences six arms. Record its actual overall exit and every
completed, failed, or unrun arm. A scoped independent PASS for the four required
arms must never be described as a passing six-arm command. Retain Qwen code,
deterministic coverage, constraints, and any observed failure unchanged.

If the script's preflight, missing hardware/runtime/isolation, or another failure
prevents the required arms from completing, record BLOCKED or BASELINE-FAIL as
appropriate. Do not invent package-script flags, silently skip checks, change
the runner, download models, install packages, or alter firewall rules in this
source-layout unit. Historical model results are not fresh evidence for this
branch. Any required environment preparation or harness repair needs its own
bounded scope before this unit can resume.

### F: package and final acceptance

```powershell
pnpm.cmd check:portable
pnpm.cmd check
git diff --check
```

Expected: all required gates pass with exact outcomes recorded. Inspect untracked
new files as well as the tracked diff, empty index, complete source allowlists,
and unchanged prohibited paths. `check:portable` does not replace native
acceptance. Existing evidence-index checks remain required; do not add raw
captures to the Git index to preserve a local report.

Reader benchmarks are risk-triggered, not proof needed for unchanged physical
relocation. If an extraction would change memoization, traversal complexity,
batching, capacity, DOM geometry, or yield behavior, stop and re-audit first.
Any separately approved expansion must compare fresh baseline/post results with
the existing `pnpm.cmd benchmark:reader` and `pnpm.cmd benchmark:reader:native`
commands. Do not infer performance improvement from smaller files.

## Risks and rollback

| Risk | Control / rollback boundary |
| --- | --- |
| Nested planning extraction changes block indices, identity, or yields | Preserve algorithms/WeakMaps, exercise nested boundary rendering, and return only Unit 1 worker hunks if validation rejects them. |
| Neutral contracts create runtime cycles or duplicate error classes | Keep one error definition, one-way backend imports, compatible facade exports, and build plus PCM regression evidence. |
| Worklet asset resolution changes after a parent import moves | Freeze actual worklet files/URLs and inspect browser/native/model-backed loading; do not repair frozen authority to fit a move. |
| CSS regrouping changes the cascade or loses media context | Ordered contiguous slices, exact reconstruction, retained accessibility assertions, and production/browser/native gates. |
| Baseline or host prerequisites fail | Record the actual failure separately; do not broaden the refactor or treat it as a new regression. |
| Concurrent edits invalidate acceptance | Stop on overlap/drift, preserve user work, and obtain a new immutable validation report. |

Allow at most two bounded correction loops per work order. After that, stop and
redesign the order. Remove only verified worker-authored hunks when abandoning
a unit; never use broad reset/clean/restore over unrelated work. For a CSS
rollback, restore the original entry/test and remove only this unit's five new
leaf files together. If a later authorized commit exists, propose a focused
revert rather than rewriting history. Git actions still require their own order.

## Progress log

- 2026-10-10: [Combined FINAL-01](../evidence/desktop-source-organization/FINAL-validation-01.md)
  independent PASS: check:portable, check and git diff --check exit0;1448 Vitest,
  51 Node,406 Python and87+88 Rust tests. All thirteen source identities unchanged,
  compiled assets/exact CSS reconstruction PASS,248 local links resolved. Prior
  full H applicability independently accepted for unchanged runtime inputs;
  no fresh H or executable byte-equality claim. Nonfatal cache/bundle warnings
  retained. [Temporary rule cleanup](../evidence/desktop-source-organization/CHATTERBOX-firewall-cleanup-01.md)
  completed and absence verified outside sandbox. Reviewed canonical diagram:
  unchanged architecture, no edit warranted. Archived plan and updated indexes;
  independent documentation closure follows. No staging/commit/push/PR.

- 2026-10-10: Accepted [CSS post-change02](../evidence/desktop-source-organization/STYLES-post-change-02.md)
  PASS, all eight D/B/N commands, exact source reconstruction and fresh compiled
  JS/CSS/worklet byte equality with PCM post02. Director rechecked seven hashes
  and HEAD; index empty, prior units preserved. One formatter correction cycle.
  Canonical diagram still matches unchanged owners/processes/trust/persistence.
  Proceed to independent F on the complete thirteen-path source patch, explicitly
  evaluating continued H applicability. No replay of unaffected model matrices.

- 2026-10-10: Worker applied [CSS formatting correction](../evidence/desktop-source-organization/STYLES-change-02.md),
  +3/-1 in the single test call; exact regex/assertions/CSS unchanged. Combined
  unit3349 lines. Director inspected; new full independent validation pending.

- 2026-10-10: [CSS post-change01](../evidence/desktop-source-organization/STYLES-post-change-01.md)
  FAIL at required formatting, one test .exec call wrap. Exact reconstruction,
  package build/typecheck and588 Vitest/38 Node PASS; lint/build/B/N unrun.
  Issued [correction01](../evidence/desktop-source-organization/STYLES-correction-01.md)
  for only formatter layout in the permitted test. First of two correction
  cycles; no CSS or assertion change. Full fresh post-change remains required.

- 2026-10-10: Sole worker delivered [CSS change](../evidence/desktop-source-organization/STYLES-change-01.md),
  seven paths/3347 combined lines, within3400. Director inspected ordered entry
  and actual-import test adaptation with all original assertions retained.
  Independent D/B/N, exact reconstruction and compiled CSS proof pending.

- 2026-10-10: [CSS baseline01](../evidence/desktop-source-organization/STYLES-baseline-01.md)
  independent PASS, seven D/B commands, exact original and compiled CSS frozen,
  accepted Units1/2 unchanged. Built JS/CSS/worklet match PCM post02. Froze
  [DESKTOP-STYLES-WORK-01](../evidence/desktop-source-organization/STYLES-order-01.md)
  with seven paths/3400 lines; sole worker may implement exact contiguous split.

- 2026-10-10: Accepted refreshed [CSS audit](../evidence/desktop-source-organization/STYLES-audit-01.md)
  and [draft](../evidence/desktop-source-organization/STYLES-draft-01.md). Original
  CSS/test clean, five leaves absent, exact complete-rule boundaries confirmed.
  Independent D/B baseline and frozen original/built CSS capture pending.

- 2026-10-10: Accepted [PCM post-change02](../evidence/desktop-source-organization/PCM-post-change-02.md)
  PASS after fresh D/B/N/H: all nine commands exit0, complete six-arm H PASS,
  both Piper six-rate matrices PASS. Standalone N uses the existing model-free
  environment policy; H retains full real profiles. Source/install/isolation
  identities unchanged, index empty, zero runtime processes. Director rechecked
  exact three source hashes and HEAD; zero source correction cycles. Qwen
  buffering exceeds MVP goals despite harness PASS; ADR-0051 unchanged.
  Begin refreshed CSS audit. Temporary rule retained until final evidence reuse
  is decided, then remove it through the existing helper.

- 2026-10-10: [PCM post-change01](../evidence/desktop-source-organization/PCM-post-change-01.md)
  FAIL: D/B PASS, N exit1 at service lifecycle probe, H unrun. Exact source and
  installed/isolation identities remain unchanged, index empty, processes cleared.
  [Read-only environment diagnosis](../evidence/desktop-source-organization/PCM-native-environment-diagnosis-01.md)
  confirms N inherited real-runtime flags while its deterministic lifecycle
  expects the fake; H explicitly sanitizes these flags. The inner failed operation
  is not exposed. Authorize a new full D/B/N/H report with unchanged N command in
  its model-free environment, H in its real-profile environment. No source edit
  or correction loop; the failed report remains immutable and no next unit starts.

- 2026-10-10: Sole worker returned [PCM change packet](../evidence/desktop-source-organization/PCM-change-01.md),
  three paths/801 combined lines, unchanged tests and no deviations. Director
  inspected the actual extraction and imports; independent post-change D/B/N/H
  is pending. No acceptance or next-unit work yet; zero correction cycles.

- 2026-10-10: Accepted independent
  [DESKTOP-PCM-01-BASELINE-03](../evidence/desktop-source-organization/PCM-baseline-03.md)
  PASS: six D commands and full H exit0, all six journeys and both Piper
  six-rate matrices PASS. Source/install/isolation identities unchanged, empty
  index and zero remaining task runtime processes. Qwen harness PASS retains
  observed buffering beyond MVP targets; no changed product-performance claim.
  Froze [DESKTOP-PCM-WORK-01](../evidence/desktop-source-organization/PCM-order-01.md)
  against that exact report and refreshed audit, three paths/850 lines.
  Temporary interpreter block remains enabled for post-change validation;
  task-owned removal remains required afterward. Prior failures remain historical.

- 2026-10-10 14:15 America/Bogota: User requested the Windows elevation prompt
  again and it completed. Host verification confirms the unique temporary rule
  `VoxLeaf-DesktopOrg-ChatterboxV3-01a126fa-Temporary`: enabled, Outbound, Block,
  Any profile, exact current installed `cb/3/runtime/python.exe`. Helper receipt
  records creation at 19:15:44Z. No existing rule changed. The four-hour safety
  cleanup deadline is 23:15:44Z; director must request earlier removal after
  required tests or a new blocker. HEAD/index/source scope remains unchanged.
  Proceed to fresh uninstrumented DESKTOP-PCM-01-BASELINE-03 D/H.

- 2026-10-10: Windows rejected the helper launch with `El usuario ha cancelado
  la operacion` (the returned message used Spanish accents). No helper receipt
  exists and host inspection confirms zero rules with the reserved exact name.
  The PowerShell wrapper's exit 0 is not a successful launch: Start-Process
  reported an error before returning a process. No D/H/model run began.
  User was asked whether to reopen the native elevation prompt when available
  to accept it. The chat authorization remains distinct from Windows elevation.

- 2026-10-10: User authorized one temporary outbound Block rule for installed
  `cb/3/runtime/python.exe` and removal after the tests. Prepared a task-local
  fixed-action helper under ignored
  `tmp/evidence/desktop-source-organization/CHATTERBOX-FIREWALL-01/temporary-rule.ps1`.
  It checks interpreter identity and rule-name absence, creates only
  `VoxLeaf-DesktopOrg-ChatterboxV3-01a126fa-Temporary`, and removes that exact
  unchanged rule when `remove-requested` appears beside the script or after a
  four-hour safety deadline. No broader firewall change is authorized.
  The normal host token is not administrator; the Windows elevation request is
  pending. No created-rule or resumed-baseline evidence exists yet.

- 2026-10-10: [Fresh baseline 02 prerequisite check](../evidence/desktop-source-organization/PCM-baseline-02.md)
  returned BLOCKED before D/H: verified installed v3 selects its private
  `cb/3/runtime/python.exe`, but host inspection found zero enabled outbound
  Block rules for that exact executable. Developer-interpreter isolation does
  not cover this newly installed path. No model arm or test command ran and no
  firewall mutation occurred. Source/install identities are stable; index empty.
  Asked the user to authorize one exact temporary outbound block for the installed
  interpreter and removal of only that rule after the required tests. Until an
  actual reply, the original firewall prohibition remains in force.

- 2026-10-10: [Authorized Chatterbox preparation](../evidence/desktop-source-organization/CHATTERBOX-preparation-01.md)
  completed through normal VoxLeaf Settings. The UI reported verified local
  installation; host inspection confirms current `cb/3` present and `cb/2`
  retained. No model journey is claimed. Refreshed
  [PCM audit](../evidence/desktop-source-organization/PCM-audit-refresh-02.md)
  retains the original three paths, invariants, tests and 850-line ceiling.
  Next gate is a fresh uninstrumented independent D/H baseline; no PCM order yet.

- 2026-10-10: User explicitly authorized current Chatterbox v3 acquisition and
  installation through VoxLeaf, followed by fresh baseline and plan continuation.
  This is separate host preparation, not a source-work allowlist expansion.
  Director verified approximately 452 GB free on C: against the manifest's
  20 GB requirement, launched the existing packaged executable, opened a
  repository-authored synthetic EPUB, and used normal Settings profile selection
  plus Download Chatterbox. The UI reported download startup. Preparation is
  in progress; no installed-state, model acceptance, or plan completion yet.
  Existing v2 data is retained; no Remove action or firewall/Git mutation.

- 2026-10-10: User authorized a bounded diagnosis of the Piper Spanish timeout,
  retaining no-download/no-installation/no-firewall and no-Git-mutation limits.
  Reused the read-only auditor and independent validator. Report
  [PIPER-ES-PROFILE-DIAG-01](../evidence/desktop-source-organization/PIPER-ES-profile-diagnosis-01.md)
  records one existing filtered runner invocation outside sandbox, exit 1.
  Temporary content-free instrumentation preserved original actions, assertions,
  and deadline: Chatterbox became enabled, received the original alternate click,
  entered `confirming`, and never replaced active Piper. Host checks confirm
  `cb/3` absent and retained `cb/2` present; no inference/rate matrix was reached.
  This is diagnostic evidence, not a replacement baseline or model acceptance.
  All source/executable identities stayed unchanged, index empty, and no task
  runtime processes remained. No install, download, firewall or harness change.
  The [bounded recovery assessment](../evidence/desktop-source-organization/profile-prerequisite-recovery-01.md)
  found no supported alternate-root/offline-import mechanism. Keep Unit 2/3
  and F blocked until separately authorized package preparation and fresh D/H.

- 2026-10-10: Independent [bounded closure review](../evidence/desktop-source-organization/closure-01.md)
  confirmed accepted source identities, untouched PCM/CSS/frozen paths, empty
  index, 301 resolved local links and no matching task runtime processes.
  `git diff --check` passed outside sandbox. Corrected its one documentation
  finding (obsolete claim that no acceptance evidence existed); no source edit.
  Group F remains unrun and the campaign remains blocked, not complete.

- 2026-10-10: [DESKTOP-PCM-01-BASELINE-01](../evidence/desktop-source-organization/PCM-baseline-01.md)
  returned BASELINE-FAIL outside sandbox. All six D commands passed (588 Vitest,
  38 Node). Complete H command exited 1: preflights and model-free native
  lifecycle passed, then Piper Spanish failed during profile selection with
  `webdriver-condition-timeout`. No model arm or Piper rate matrix completed;
  all remaining five arms are unrun. ADR-0051 scoped acceptance is unavailable.
  HEAD/path/index and prior Unit 1 identities remain unchanged. No PCM work
  order or edit was issued; CSS and group F remain pending. No retries, harness
  repairs, installs/downloads or firewall changes were made to bypass the failure.
- 2026-10-10: Reviewed canonical system diagram against the accepted render-plan
  extraction: same React-reader owner, process/package/trust/persistence and
  narration flow; no diagram edit needed. Retained all four planning SKIPs,
  colocated tests, frozen WSOLA/authority paths and completed plans. Updated
  current plan/index/evidence status while source worker and validator were idle.
  Resumption requires a separately bounded diagnosis of the baseline timeout,
  then fresh D/H baseline before Unit 2; no root cause or repair is claimed here.

- 2026-10-10: Accepted refreshed [PCM audit](../evidence/desktop-source-organization/PCM-audit-01.md)
  and [draft terms](../evidence/desktop-source-organization/PCM-draft-01.md):
  three paths/850-line ceiling, unchanged tests and frozen WSOLA paths. Existing
  model/interpreter locations and outbound blocks are present; process-local
  documented environment assignments are authorized, with no installation or
  firewall changes. Independent D/H baseline must complete before extraction.

- 2026-10-10: Unit 1 accepted after
  [DESKTOP-SEMANTIC-DOCUMENT-01-POST-CHANGE-02](../evidence/desktop-source-organization/SEMANTIC-post-change-02.md)
  PASS: all eight D/B/N commands reran outside sandbox using the existing
  matching driver; 588 Vitest, 38 Node and 7 browser tests plus complete
  model-free native smoke passed. Director rechecked the exact three SHA-256
  identities and HEAD against the immutable report; index remains empty.
  No source correction loops used. Next: refreshed Unit 2 audit and D/H baseline.

- 2026-10-10: [SEMANTIC post-change 01](../evidence/desktop-source-organization/SEMANTIC-post-change-01.md)
  is BLOCKED: all D commands and 7 browser tests passed (588 Vitest / 38 Node),
  but native startup exited 1 at WebView session creation after a successful
  release build. Identity/index recheck passed. Read-only
  [driver diagnosis](../evidence/desktop-source-organization/driver-diagnosis-01.md)
  found inherited EdgeDriver 150 against WebView2 155. An already-installed,
  valid Microsoft-signed 155.0.4283.45 driver matches exactly. Director approved
  its process-local override and a new full D/B/N validation report; no download,
  installation, harness/source edit or correction loop was needed. Original
  failed command remains recorded unchanged.

- 2026-10-10: Sole worker returned [SEMANTIC change](../evidence/desktop-source-organization/SEMANTIC-change-01.md),
  501 added/deleted lines in the three permitted paths. Director reviewed the
  extraction and additive nested-yield regression; independent post-change
  groups D/B/N are pending. No unit acceptance or next-unit implementation yet.

- 2026-10-10: Independent [SEMANTIC baseline](../evidence/desktop-source-organization/SEMANTIC-baseline-01.md)
  PASS: all six group D commands outside sandbox, 54 files/587 Vitest plus
  38 Node tests, unchanged HEAD/path identities and empty index. Froze
  [DESKTOP-SEMANTIC-WORK-01](../evidence/desktop-source-organization/SEMANTIC-order-01.md)
  for three paths/700 changed lines; one source worker may now implement.

- 2026-10-10 execution: User authorized all three units and required host checks,
  with no staging, commits, push, PR, branch recreation or main update. Actual
  branch is `codex/desktop-source-organization`, HEAD
  `ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5` (the plan commit); initial worktree
  and index are clean. Named auditor/worker GPT-6.1 Sol high and independent
  validator GPT-6 Astra high are available and reused. No Git steward is needed
  because every Git mutation is prohibited. Accepted the refreshed
  [first audit](../evidence/desktop-source-organization/SEMANTIC-audit-01.md) and
  prepared [draft terms](../evidence/desktop-source-organization/SEMANTIC-draft-01.md).
  Source implementation has not begun. Host preparation found an existing
  Corepack shim for pinned pnpm 11.15.1; process-local PATH selects it offline
  instead of fallback pnpm 11.25.0, without installation changes.

- 2026-10-10: Reviewed the current frontend inventory and existing test layout.
  Independent planning audits identified the three bounded CHANGE units and
  retained the large lifecycle owners as SKIP. No source or runtime acceptance.
- 2026-10-10: Git setup `DESKTOP-ORG-SETUP-01` passed in local PowerShell outside
  the sandbox. Created `codex/desktop-source-organization` from local `main` at
  `a9a84ffa973073dad4240b246f8d9df72fccf275`; `main` and HEAD remained unchanged.
- 2026-10-10: Authored this plan and its documentation index entries. All five
  implementation milestones remain Not started.
- 2026-10-10: Independent read-only planning review found one wrapped filename;
  corrected it. No other actionable planning findings. Host documentation checks
  passed for required sections, links, configured commands, scope, and Git state.

## Discoveries and decisions

- The authorized live diagnosis identifies the alternate Chatterbox activation
  prerequisite, before Piper inference. Hardware compatibility and configured
  development runtimes are insufficient when packaged selection requires a
  verified current optional installation. Do not skip the alternate switch,
  use retained v2, bypass verification, extend timeouts, or claim installing
  v3 alone guarantees the later model matrices. The supported preparation
  workflow requires separate download/installation authorization.
- Existing EdgeDriver 150 did not match WebView2 155. Selecting the already
  installed signed matching driver process-locally resolved native session
  creation; the initial failed command and subsequent full PASS are both retained.
- The model-backed baseline failed before any PCM extraction. Compatible/active
  profile diagnostics do not prove successful profile-selection completion or
  any model journey. Preserve the exact failed stage without inferring its cause.
- A failed required Piper arm prevents current ADR-0051 acceptance; Qwen's
  exclusion cannot excuse missing Piper/Chatterbox evidence. Keep later units
  pending without discarding the independently accepted Unit 1 patch.

- Large files do not automatically need division. Preserve existing publication
  and narration lifetimes where splitting would increase coordination cost.
- Tests already live in separate files. This frontend plan does not repeat the
  native Rust test-layout campaign or centralize test suites.
- Reuse the existing backend interface; a neutral module avoids a backend-to-
  facade runtime cycle while preserving existing import paths.
- The stylesheet is ordered behavior. Use five contiguous sections and retain
  the final override section; a wholesale feature regrouping is outside scope.
- The stylesheet unit's seven-file bound is justified by one global cascade.
  Its larger diff is relocation, with equality evidence in addition to tests.
- ADR-0051 scopes model-backed delivery to Piper/Chatterbox, not a claim that
  the existing six-arm command or Qwen journeys pass.
- Keep branch setup, documentation validation, implementation acceptance, and
  Git publication as distinct recorded states.

## Final validation results

Historical planning/documentation validation: PASS in local PowerShell outside the sandbox
on 2026-10-10. Structural/reference/script inspection found all 12 required
sections, 22 existing local links, 13 distinct configured commands, balanced
code fences, and five unstarted implementation milestones. Both documentation
indexes link this plan. `git diff --check` and the new-file whitespace inspection
passed. `git diff --cached --quiet` confirmed an empty index; branch/HEAD/main
checks confirmed the setup snapshot. Changed-path inspection found only this
plan, `docs/plans/active/README.md`, and `docs/README.md`, with no source changes.
The independent read-only planning review is not an implementation validation
report. Branch setup passed as recorded above.

Current execution acceptance: **PASS: all three units and combined F; plan archived.**

| Area | Actual result |
| --- | --- |
| Unit 1 baseline | PASS, DESKTOP-SEMANTIC-DOCUMENT-01-BASELINE-01, six D commands |
| Unit 1 first post-change | BLOCKED, POST-CHANGE-01: D/B passed; N exited 1 before session creation |
| Unit 1 accepted post-change | PASS, DESKTOP-SEMANTIC-DOCUMENT-01-POST-CHANGE-02: fresh D/B/N, 588 Vitest + 38 Node + 7 browser tests and packaged model-free smoke |
| Unit 1 exact patch | Three files, 501 added/deleted lines; nested DOM regression; identity recheck PASS; zero source correction loops |
| Unit 2 audit/order | CHANGE, DESKTOP-PCM-WORK-01 frozen, three source paths/850 lines |
| Unit 2 accepted patch | POST-CHANGE-02 PASS, all nine D/B/N/H commands, 801 combined lines, zero source correction cycles |
| Historical Unit 2 baseline01 | BASELINE-FAIL: D PASS; H exit1 at Piper Spanish profile selection |
| Historical host preparation / baseline02 | Authorized v3 installation; baseline02 BLOCKED before D/H without installed-interpreter isolation. Later renewed elevation created the authorized exact temporary rule |
| Authorized blocker diagnosis | PIPER-ES-PROFILE-DIAG-01: filtered instrumented host run exit 1; alternate Chatterbox click enters confirming while cb/3 is absent; original 90-second activation wait expires; no source change or replacement baseline |
| Fresh baseline 03 | PASS D/H, global H exit0, all six journeys and both Piper six-rate matrices PASS |
| Model limits | Qwen harness PASS exceeds MVP buffering targets; ADR-0051 deferral unchanged |
| Unit 3 / CSS equality | POST-CHANGE-02 PASS, all eight D/B/N commands,3349 lines; exact source reconstruction and compiled JS/CSS/worklet equality; one formatting correction |
| Group F / archive | FINAL-01 PASS: check:portable, check, git diff --check; plan archived after acceptance |
| Combined test totals | 1448 Vitest,51 Node,406 Python; Rust87 default +88 release-locked; all passed |
| Host cleanup | Authorized exact temporary rule removed and absence verified; current Chatterbox v3 retained |
| Architecture | Canonical system diagram reviewed; same runtime ownership and topology |
| Git | Existing branch and execution HEAD unchanged, index empty, all thirteen accepted source/test paths plus docs unstaged; no staging/commit/push/PR |

See the [evidence index](../evidence/desktop-source-organization/README.md) for
immutable reports and exact commands/identities. Raw post-change/baseline logs
remain in ignored `tmp/evidence/desktop-source-organization/`. Initial Unit 1
baseline output was reported through the validator and summarized in its receipt;
no retrospective raw-log capture is claimed. Fresh model-backed baseline and
post-change PCM evidence both pass; no performance improvement is claimed.

The current [combined final report](../evidence/desktop-source-organization/FINAL-validation-01.md)
binds all thirteen accepted paths. Expensive H observations are reused only after
independent source/config/runtime-input and fresh frontend-byte equivalence
review; H was not rerun after CSS. N did run freshly for the completed CSS state.
Nonfatal pytest cache-write and bundle-size warnings remain disclosed. Finite
test evidence does not establish arbitrary EPUBs, hardware or subjective audio
quality. The temporary rule is gone; no further model run is part of this closeout.
