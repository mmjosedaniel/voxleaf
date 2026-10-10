# Desktop source organization

## Goal

Improve three demonstrated maintenance boundaries in `apps/desktop/src` without
changing product behavior: semantic render planning, the Web Audio playback
backend, and the ordered application stylesheet.

This is a cross-milestone maintenance plan. The 2026-10-10 request authorizes
creating this ExecPlan and a local branch from `main`. Source implementation has
not started. The plan is not an Approved Work Order and does not authorize
staging, commits, pushes, pull requests, model acquisition, or installed-package
changes. A subsequent request to execute the plan starts the workflow below;
Git publication remains a separate action.

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

These are source-inspection findings, not runtime results. No implementation
baseline, browser run, native acceptance, or model-backed acceptance has been
performed for this plan. Other source files are context or outside this bounded
campaign, not implicitly audited and accepted for modification.

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
`tmp/evidence/desktop-source-organization/<run>/`. No acceptance evidence exists
yet; do not create placeholder PASS receipts.

## Milestones

### Milestone 1: confirm execution inventory and unit terms

Status: Not started. Branch and documentation setup are complete separately.

On an instruction to execute, read the required context, confirm actual branch,
HEAD/index/status, role availability, scripts, and the three source allowlists.
Refresh the first audit and independent baseline. Record new findings, changed
line ranges, and any blocker before approving implementation. Preserve the
remaining files as SKIP/context/excluded rather than creating extra units.

### Milestone 2: extract semantic render planning

Status: Not started.

Execute Unit 1 with baseline group D and post-change groups D, B, and N below.
The new nested batching regression must assert actual rendered order and bounded
progress, not the extracted helper's implementation. Accept only with an
independent PASS for the exact three-path patch and all stated invariants.

### Milestone 3: isolate the Web Audio backend

Status: Not started.

Execute Unit 2 with baseline groups D and H and post-change groups D, B, N,
and H. Establish the relevant model-backed baseline before changing the backend;
existing unrelated failures must remain visible. Inspect static runtime imports,
compatible re-exports, unchanged worklet paths, and production asset loading.
Accept only with independent deterministic and applicable packaged evidence.

### Milestone 4: split the ordered stylesheet

Status: Not started.

Execute Unit 3 with baseline groups D and B plus the frozen stylesheet capture,
then post-change groups D, B, N, and the reconstruction equality check. Inspect
the actual built CSS/import expansion and existing browser assertions for themes,
focus, narrow viewports, zoom, reduced motion, and forced colors. Keep the
stylesheet/test migration atomic within this one accepted unit.

### Milestone 5: accept the combined patch and close documentation

Status: Not started.

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

Planning/documentation validation: PASS in local PowerShell outside the sandbox
on 2026-10-10. Structural/reference/script inspection found all 12 required
sections, 22 existing local links, 13 distinct configured commands, balanced
code fences, and five unstarted implementation milestones. Both documentation
indexes link this plan. `git diff --check` and the new-file whitespace inspection
passed. `git diff --cached --quiet` confirmed an empty index; branch/HEAD/main
checks confirmed the setup snapshot. Changed-path inspection found only this
plan, `docs/plans/active/README.md`, and `docs/README.md`, with no source changes.
The independent read-only planning review is not an implementation validation
report. Branch setup passed as recorded above.

Implementation acceptance: NOT RUN. There is no implementation baseline,
Approved Work Order, source patch, regression result, independent post-change
PASS, performance result, or newly accepted model-backed evidence for this plan.
The implementation milestones remain open.
