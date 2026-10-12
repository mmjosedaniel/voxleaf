# Apps organization follow-up

Status: completed on 2026-10-12; all three source units and combined gates accepted.
Final source acceptance: APPS-ORG-FINAL-01 PASS; final bounded repair review:
APPS-SEEK-RACE-REVIEW-02 APPROVE. Documentary archive verification is recorded
separately in the evidence collection under APPS-ORG-DOCS-01.
Native extraction and the separately authorized observation-race repair pass
POST-04's eleven host commands and independent change review. Historical cause
of the earlier intermittent failures remains unresolved; it is not retroactively
attributed to the deterministically demonstrated race.
Prepared on 2026-10-12. Branch: `codex/apps-organization-follow-up`, created
from clean, up-to-date `main` at
`731bb67f372fed39a9308dad7584bb6517c8f6ba`.

## 1. Goal

Implement three bounded organization improvements in `apps/desktop`:

1. Separate native smoke resource observation, TTS scenarios, and reader
   scenarios from the executable harness while retaining its lifecycle owner.
2. Move the complete reader publication lifecycle and its test beside the
   other publication-opening modules.
3. Group the four raster-image modules and their existing tests under
   `src/reader/images/`.

The benefit is clearer responsibility and file discovery, not fewer lines as
an end in itself. The latter two changes were optional navigation improvements
in the initial review; the maintainer has now requested a plan that includes
them. They are deliverables, not silently omitted SKIPs. A newly discovered
conflict must be documented and resolved before changing this scope.

This is cross-milestone maintenance following the completed
[desktop source organization](../completed/desktop-source-organization.md),
[native Rust module organization](../completed/native-rust-module-organization.md),
[native Rust test layout](../completed/native-rust-test-layout.md), and
[state subscription hooks](../completed/desktop-state-subscription-hooks.md)
plans. It does not reopen their accepted boundaries.

## 2. User-visible outcome

Opening, replacing, closing and restoring a book, rendering images, using
Settings, and generating and playing local narration behave exactly as before.
Existing developer commands, native executable selection, diagnostics and
acceptance criteria retain their meaning. Contributors can locate publication
lifecycle code, raster-image code, and each native test responsibility directly.

This plan adds no product feature, performance guarantee, model support,
dependency, Redux/Zustand store, or public contract. The maintainer authorized
full implementation and section 8 host validation on 2026-10-12, on the existing
branch, with all changes left unstaged and uncommitted. No branch/base change,
commit, push, or PR is authorized by this execution request.

## 3. Current state

The inventory below records the planning baseline and original locations.
Sections 7, 10 and 12 record the implemented moves and current acceptance.

The planning checkout includes PR #238 and the earlier App presentation and
effect extractions. `apps/` contains the desktop application; its `src`,
`src-tauri`, scripts, browser tests and configuration already have useful
boundaries. A new application layer or wholesale folder migration is not needed.

| Target | Verified responsibility and disposition |
| --- | --- |
| `scripts/native-startup-smoke.mjs` | 5,683 physical lines at the planning HEAD. Resource sampling, reader and narration scenarios, assertions and WebDriver/process lifecycle share one executable module. CHANGE: extract three internal responsibilities, retaining the entry and resource owner. |
| `src/reader/reader-lifecycle.ts` and its test | 248 production lines and 290 test lines. Opening, replacement, close, invalidation and App-facing states use `publication/local-publication-open`; they do not implement reader DOM or navigation. CHANGE: move the whole pair to `publication/`. |
| Four raster-image modules and tests | Policy, source lifetime, serialized publication loading and semantic presentation are already separated. CHANGE: group the eight files in `reader/images/`, preserving all four boundaries. |
| `src/tts/`, coordinators and playback backends | SKIP broad regrouping. Ownership and names are meaningful; worklet URLs, fixture roots and frozen authority paths make cosmetic migration costly. |
| `src-tauri/`, `settings/`, `persistence/`, styles and package boundaries | Retain the completed organization. EXCLUDED from this follow-up. |

Read-only planning audit `APPS-ORG-NATIVE` identifies shared resource
observations used by both reader and TTS scenarios. Its extraction proposal
is advisory evidence, not a passing execution baseline. The executable currently
runs through top-level `await run()` and calculates `desktopRoot` from its own
location. Other host runners call that exact script path.

The desktop `test` script explicitly enumerates Node test files after Vitest;
adding a new Node suite without updating that enumeration would omit it from
normal checks. Current reader and image tests are colocated with their owners.
Maintained `docs/development/testing.md` now names the accepted destination
paths and documents the extracted native helper/test responsibilities.

## 4. Scope and non-goals

The following are closed candidate allowlists. A fresh execution audit must
confirm them, commands and ceilings before baseline and an immutable Work
Order. Additional files require a revised order, not implicit scope growth.
Paths below are repository-relative; include both sides of every move in
validation identities.

### APPS-NATIVE-01: native smoke responsibilities

Six paths:

1. `apps/desktop/scripts/native-startup-smoke.mjs`.
2. `apps/desktop/scripts/native-smoke/resource-observation.mjs` (new).
3. `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` (new).
4. `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` (new).
5. `apps/desktop/scripts/native-smoke.node-test.mjs` (new).
6. `apps/desktop/package.json`, only to append the new Node suite to `test`.

This is one cohesive exception to the normal small-file unit because all
three extractions modify the same executable wiring and share observations.
Use sequential internal checkpoints under one baseline and one accepted patch;
do not pretend those overlapping edits have independent clean baselines.
Planning ceiling: six paths, 12,000 added-plus-removed lines, predominantly
relocation of approximately 4,500 existing lines. Limit non-relocation wiring,
test and dependency-parameter edits to 700 lines. The auditor must tighten or
explicitly revise these ceilings before freezing the order.

Execution tightened the extraction ceiling to 10,500 total / 700 non-relocation
lines; accepted extraction uses 9,862 / 698. A subsequently authorized separate
seek-observation diagnostic/repair adds 291 lines within its own 400-line order,
limited to the TTS helper and Node suite. This is not counted as relocation.

Existing `native-webdriver-client.mjs`, `native-smoke-invariants.mjs`,
`adaptive-tts-profile-selection.mjs`, portfolio runners and their Node tests
are read-only collaborators. Reuse them; do not duplicate or migrate them.

### APPS-PUBLICATION-02: publication lifecycle placement

Seven paths, comprising two whole-file moves and three import-only consumers:

1. `apps/desktop/src/reader/reader-lifecycle.ts` (old).
2. `apps/desktop/src/reader/reader-lifecycle.test.ts` (old).
3. `apps/desktop/src/publication/reader-lifecycle.ts` (new).
4. `apps/desktop/src/publication/reader-lifecycle.test.ts` (new).
5. `apps/desktop/src/App.tsx`.
6. `apps/desktop/src/AppPresentation.tsx`.
7. `apps/desktop/src/ReadyPublicationSection.tsx`.

Move the pair intact, update their `local-publication-open` imports, and
repair the three consumers. Keep `DesktopReaderLifecycle`, factory/type
names, transition logic and test assertions unchanged. Planning ceiling:
seven path identities, 1,200 added-plus-removed lines including relocation;
at most 30 changed import lines outside the moved bodies.

### APPS-IMAGES-03: colocated raster-image responsibility

Move each file below from `apps/desktop/src/reader/` into
`apps/desktop/src/reader/images/`, keeping its filename:

- `raster-image-policy.ts`.
- `raster-image-policy.test.ts`.
- `raster-image-source.ts`.
- `raster-image-source.test.ts`.
- `publication-raster-image-loader.ts`.
- `publication-raster-image-loader.test.ts`.
- `SemanticRasterImage.tsx`.
- `SemanticRasterImage.test.tsx`.

The sixteen old/new paths and these three import-only consumers form the
nineteen-path allowlist:

- `apps/desktop/src/reader/ReaderPublication.tsx`.
- `apps/desktop/src/reader/SemanticDocument.tsx`.
- `apps/desktop/src/integration/package-reader-matrix.test.tsx`.

Do not split the parsers, merge modules, rename exports, change React keys,
or duplicate fixtures. Keep existing relative imports within the moved group
where they still resolve. Planning ceiling: nineteen path identities, 5,500
added-plus-removed lines including relocation; at most 50 changed import
lines outside moved bodies. This mechanical group keeps its tested resource
lifetime chain together and is another explicit bounded unit-size exception.

### Documentation and exclusions

Current planning changes are this plan, `docs/plans/active/README.md` and
`docs/README.md`. During implementation, update maintained path references
and describe the helper/test map in `docs/development/testing.md`; maintain
this plan and its indexes. On completion, add the completed-plan index entry.
Record concise reviewed receipts under
`docs/plans/evidence/apps-organization-follow-up/` if needed. Keep raw output
and temporary checkers in ignored `tmp/evidence/apps-organization-follow-up/`.

Do not change completed plan bodies or historical evidence to modernize their
old paths. No compatibility redirect files or barrel exports are needed for
these internal imports. Exclude generated files, frozen benchmark/release
authorities, model assets, lockfiles, Rust/Python implementations, CI changes,
package migrations, production dependencies and unrelated cleanup.

## 5. Relevant files and documentation

Read [AGENTS.md](../../../AGENTS.md), [the plan format](../../../.agents/PLANS.md),
[the documentation index](../../README.md), [MVP requirements](../../product/mvp.md),
[reader settings](../../product/reader-settings-and-playback-controls.md),
[system diagram](../../architecture/system-diagram.md),
[architecture overview](../../architecture/overview.md),
[testing](../../development/testing.md),
[evidence retention](../../development/evidence-retention.md), and
[agentic refactoring](../../development/agentic-refactoring.md).

Applicable decisions:

- [ADR-0008](../../architecture/decisions/ADR-0008-visual-reader-architecture.md):
  publication ownership and reader boundaries.
- [ADR-0010](../../architecture/decisions/ADR-0010-bounded-raster-image-decode.md):
  predecode policy, bounded decode and object-URL ownership.
- [ADR-0011](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md):
  bounded persistence and restoration invariants.
- [ADR-0051](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md):
  current Piper/Chatterbox priority and deferred Qwen runtime acceptance.

Inspect both package manifests, every allowlisted file and its reverse
imports, current desktop/browser tests, and the existing native helper/host
runners before issuing orders. Read the orchestration and validation skills
and their report contracts. Recheck referenced paths if the base changes.

## 6. Architecture and constraints

### Preserve ownership while extracting the harness

| Owner | Responsibility after extraction |
| --- | --- |
| `native-startup-smoke.mjs` | CLI parsing/validation, constants and fixed failure mapping, executable/root resolution, fixture and temporary-profile creation, ports/processes, driver readiness, session creation/restart, mode/scenario ordering, stage reporting, final error/exit handling and cleanup. Initially retain file-ingress scenarios and the selected-executable supervisor-host invocation here. |
| `native-smoke/resource-observation.mjs` | Audio-file counting, memory/working-set/GPU observations, cleanup polling and resource sampler, resource instrumentation, rounding/percentile calculations and performance-log/local-URL classification. |
| `native-smoke/tts-scenarios.mjs` | Adaptive synchronization/highlight observations, playback-rate exercise, exact-host TTS matrix, profile/language interactions and native protocol/service-lifecycle scenarios. The executable-specific supervisor probe remains an entry-owned capability. |
| `native-smoke/reader-scenarios.mjs` | Reader interaction/restore observations, interaction matrix, synchronization feasibility, render instrumentation, publication replacement cleanup and native reader benchmark. |

Retain named entry-owned settings/contents interactions and `waitForCondition`
where shared. Pass narrowly named capabilities and resolved configuration to
their actual consumers; do not pass the whole entry state or create a generic
harness framework. Internal modules may depend on resource observations and
existing helpers; neither scenario module imports the other or the executable
entry. Importing helpers must not launch a driver, parse CLI arguments, create
fixtures, start sampling, inspect hardware or emit a result.

Keep `run()` and `await run()` in the current entry. Retain explicit ownership
of session restarts and final cleanup. Keep scenario-local `try/finally`,
sampler draining and instrumentation disposal with their scenario. Preserve
every assertion, failure mapping, threshold, deadline, retry count, selector,
stage, structured report field, console message and scenario order. Do not
change acceptance criteria merely to make the extracted harness pass.

A separate authorized repair retains a fresh false-to-true settling transition
even if it ends between polls. It requires active, armed, initially-false
instrumentation; historical or stopped evidence cannot pass. A deterministic
regression established the old sampling defect. The 90-second deadline, 100-ms
polling, other predicates and scenario order remain unchanged. See the
[repair review](../evidence/apps-organization-follow-up/APPS-SEEK-RACE-review-01.md).

Nested modules receive resolved paths; they must not recompute `desktopRoot`
using their deeper `import.meta.url`. Preserve `--executable` and every other
existing flag. Existing release/portfolio callers keep calling the same file.
Do not copy the fixed failure-code map or threshold authority into multiple
modules. Pass unchanged values only where needed.

### Preserve application and image invariants

The lifecycle move preserves the same single owner, six immutable view states,
publication sequence, stale-result rejection, replacement/close ordering,
renderer-failure containment and content-free failures. App still creates and
subscribes to that owner. No new singleton or split state machine is introduced.

Images retain predecode type/metadata rejection, static-only rendering, all
byte/dimension/pixel/source/queue limits, one active decode, cancellation,
late-result rejection and exactly-once object-URL release. Safe package bytes
remain separate from desktop Blob/DOM work. Tests stay beside these modules;
integration and browser tests stay at their existing level.

Across all units preserve local EPUB privacy, local inference, generated-audio
non-persistence, cancellability, bounded memory, stable locators, synchronized
visual/audible/persisted position, accessible focus behavior and malformed-EPUB
handling. A roughly fifteen-second audio lead remains audio duration rather
than a fixed wall-clock delay. No product or process boundary changes, so the
canonical diagram is expected to remain valid; review and record that result.

## 7. Milestones

### Milestone 1: Reconfirm scope and establish execution baselines

Status: complete; all three fresh audits and sequential host baselines PASS.

Use the existing implementation branch; do not create another branch merely
to execute this plan. Verify the planning commit and current HEAD, clean
allowlisted paths and empty index. Preserve unrelated user work. Confirm
custom auditor/worker/validator/Git roles are available; supporting roles do
not delegate. Follow the four-role concurrency limit and use one source writer.

Refresh the three target inventories and reverse imports with the auditor.
Include both old/new move paths, direct consumers and test discovery. For each
unit, the independent validator records a local PowerShell baseline before
source edits; freeze the Work Order only after PASS. Fresh evidence may refine
implementation details within this scope, not silently remove a deliverable.

Source units have disjoint allowlists. Without later source-commit authority,
keep accepted earlier units unstaged outside the next unit's clean allowlist;
do not claim a new repository-wide clean state or start over a rejected patch.
Overlapping changes need a combined order/baseline, not refreshed approval
hashes. Keep progress documentation outside source validation identities.

Validation: baseline commands from section 8, exact source/test inventory and
immutable identity manifests. Actual result: `APPS-NATIVE-01-BASELINE-01` PASS
on all eleven native-unit commands outside sandbox, with unchanged identities
and empty index. See the [immutable native order and baseline receipt](../evidence/apps-organization-follow-up/APPS-NATIVE-01-order-01.md).
Publication and images each then passed their own seven-command baselines;
see the [publication order](../evidence/apps-organization-follow-up/APPS-PUBLICATION-02-order-01.md)
and [image order](../evidence/apps-organization-follow-up/APPS-IMAGES-03-order-01.md).

### Milestone 2: Extract and independently accept the native harness

Status: complete; POST-04 PASS and APPS-SEEK-RACE-REVIEW-01 APPROVE.
Target: `APPS-NATIVE-01`.

First extract resource observations, then TTS and reader scenarios, retaining
the owner and dependencies described in section 6. These are checkpoints of
one unit. Add the focused Node suite and wire it into the desktop `test`
enumeration without removing existing suites. Retain all existing driver and
portfolio assertions. Do not test by importing the executable entry.

Add meaningful controlled-dependency tests for observation calculations,
malformed performance logs and local/external URL classification, sampler
draining/failure propagation, representative polling/retry failures, and helper
imports without runtime work. Avoid tests that merely count exports or lines.
Keep dependency injection limited to boundaries needed by these tests.

Validation: deterministic desktop gates, native startup, native reader
benchmark and the four supported portfolio arms before/after extraction.
Independently compare assertions, reports, cleanup and module dependencies.
Actual result: `APPS-NATIVE-01-POST-04` PASS on all eleven commands including
both Piper and both Chatterbox languages, and independent repair review APPROVE.
Historical POST-02/03 failures remain recorded without claiming their cause was
proven. All identities stable, index empty; no performance improvement claimed.

### Milestone 3: Move the publication lifecycle as one tested unit

Status: complete; APPS-PUBLICATION-02-POST-01 PASS.
Target: `APPS-PUBLICATION-02`.

Move the source/test pair to `publication/` and update exactly the three
consumers. Confirm the old files are absent and only one implementation and
one test suite remain. Review a rename-aware diff to prove unchanged bodies
apart from imports. Preserve the existing lifecycle, App and restoration tests;
do not add tests solely to prove that an import path changed.

Validation: desktop type/test, format/lint, browser and native startup gates,
including open/replace/close, stale results and restoration. Actual result:
`APPS-PUBLICATION-02-POST-01` PASS on all seven commands; reverse-import byte
proof confirms intact bodies: 1,082 total / 10 import-edit lines within 1,150/12.

### Milestone 4: Group the raster-image modules with their tests

Status: complete; APPS-IMAGES-03-POST-01 PASS.
Target: `APPS-IMAGES-03`.

Move the eight files intact and repair imports in the two reader components
and package-reader integration test. Confirm all four test suites are still
discovered once, and no old production import or compatibility facade remains.
Review the moves separately from import repairs; keep all safety and lifecycle
assertions unchanged.

Validation: desktop type/test, format/lint, browser and native startup gates,
including malformed/over-limit images, Blob/CSP rendering and replacement/
unmount resource release. Actual result: `APPS-IMAGES-03-POST-01` PASS on all
seven commands. Eight byte-identical moves and six import replacements use
5,152 total / 12 import-edit lines within 5,400/20.

### Milestone 5: Validate the combined result and close documentation

Status: complete; combined source PASS, final repair review APPROVE, maintained
documentation updated and plan archived. Post-move documentary review is separate.

Update the maintained test map only after the moves are accepted. Reconcile
live path references without rewriting historical plans, evidence or frozen
authority. Review the system diagram and record whether it still matches.
Run package and final gates with source writers and Git idle. Required runtime
evidence must describe the final combined source state; a receipt bound only
to an earlier patch is not automatically current.

Record each target's actual result, commands, failures, corrections, identity
manifests and remaining limits. Close only when all three deliverables and
their required acceptance have passed. Move this plan to `completed/`, update
the active/completed/documentation indexes and incoming maintained links, and
leave no redirect in `active/`. Revalidate documentation after that move.

Source commits, if subsequently authorized, use separate exact-path Git
Action Orders bound to immutable POST-CHANGE PASS reports. Git remains idle
during writing/validation. Push and PR creation are separate permissions.
Actual result: `APPS-ORG-FINAL-01` PASS and `APPS-SEEK-RACE-REVIEW-02` APPROVE.
All 32 source identities remain exact; maintained test paths/helper map and
indexes updated. The canonical system diagram still matches unchanged product,
process and persistence boundaries. Plan moved to completed without a redirect;
no other historical plan was edited. Closing documentation is independently
checked after the move, without rerunning unaffected source gates.

## 8. Testing and benchmark strategy

All checks run from the repository root in a normal local PowerShell session
outside the managed sandbox. This includes deterministic tests, formatting,
lint, type checks, builds, native/browser checks and documentation acceptance.
Exploratory sandbox output is never final pass/failure evidence. Record actual
outcomes rather than copying historical counts or results.

### Deterministic source gates

For each unit's baseline and post-change acceptance:

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
```

The new Node suite is registered once in the existing desktop `test` command.
It reports 19 cases (13 top-level tests and six subtests), including the separate
seek-observation regression. POST-04 passes 661 Vitest and 70 total Node tests.
The two file-move units retain their assertions and collection counts. Document any
unexpected discovery or collection change as a failure to investigate.

For `APPS-PUBLICATION-02` and `APPS-IMAGES-03`, baseline and post-change also run:

```powershell
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```

### Native harness and supported exact-host gates

For `APPS-NATIVE-01`, use the same commands before and after extraction:

```powershell
pnpm.cmd test:native-startup
pnpm.cmd benchmark:reader:native
pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4
```

These are the existing portfolio runner and its already implemented selection
flags, not a new CLI. The last call runs both Chatterbox languages. The native
startup/benchmark commands build the release executable before these model
arms. Each selected portfolio call retains configuration, offline/firewall and
process-cleanup preconditions and exercises profile switching; both Piper arms
also exercise the existing playback-speed matrix. Preserve the current exact
profile IDs even when their names contain historical dependency versions.

The unfiltered `test:tts:bilingual-portfolio-exact-host` command includes Qwen;
the adaptive/resilience commands also include deferred Qwen paths. Do not call
a failed six-arm run a four-arm pass or change those runners to hide a failure.
ADR-0051 permits this explicit Piper/Chatterbox model-backed scope. Retain Qwen
code, deterministic tests, flags, admission rules and frozen evidence; describe
its model-backed branches as unrun/deferred, not fixed or supported.

Use existing documented host setup and disposable synthetic fixtures. Missing
drivers, matching WebView2, models, compatible hardware or offline prerequisites
block the corresponding acceptance. Do not bypass assertions, install/download
assets or change machine/firewall configuration merely to turn a failed gate
green without the applicable authorization. Preserve actual benchmark samples,
resource cleanup, no-external-request and no-generated-audio observations.

### Combined acceptance and evidence

After the accepted desktop group, run:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
```

The final independent report must cover all source moves, native helper wiring,
test enumeration and documentation. Include browser, native startup, reader
benchmark and the four supported model arms on the combined implementation.
Avoid redundant expensive runs only when the validator can explicitly bind
existing evidence to the same relevant source/environment identities; otherwise
run the affected gate again. No fixed performance improvement is claimed.

Use the validation contract's unique Report ID, before/after HEAD, exact closed
allowlist, porcelain status, SHA-256 and filter-aware index blob for each path,
including DELETED old locations and initially ABSENT additions. PASS requires
stable identities, empty index and all required checks. Drift requires a new
report; neither director nor Git steward may refresh an old approval's hashes.

Documentation-only preparation checks this plan's twelve sections, source and
command references, local links/anchors, exact three-document scope, evidence
retention and whitespace. It runs no application tests and establishes no
source baseline. Record that review separately from future implementation.

## 9. Risks and rollback

- Extracting evidence-producing code can weaken a gate without breaking product
  tests. Review every moved assertion/threshold and run all affected modes.
- A deeper module location can break roots, fixtures or executable overrides.
  Resolve paths in the existing entry and pass them explicitly.
- Moving asynchronous observations can change resource lifetimes. Keep sampler
  draining, instrumentation cleanup, cancellation and `finally` ownership exact.
- Publication/image moves can omit a consumer or duplicate test discovery.
  Inventory reverse imports and compare collected tests and rename-aware diffs.
- Hardware evidence is host-specific. Record missing prerequisites as blockers;
  never infer a universal model/performance claim from a local pass.

Each source unit is independently reviewable. Correct at most two bounded
failed attempts before redesigning the order. A rejected patch must be corrected
or its verified worker-owned changes removed before another unit starts.
Restore moved files/imports together when reverting a unit; preserve unrelated
user work. Never use broad reset/clean/restore operations. Any rollback or new
edit invalidates prior acceptance identities and requires applicable revalidation.

## 10. Progress log

- 2026-10-12: final combined source accepted under `APPS-ORG-FINAL-01` PASS
  and the new `APPS-SEEK-RACE-REVIEW-02` APPROVE. Portable/full, native benchmark,
  preflight and all four model arms pass; browser/native evidence explicitly
  reused only after exact final-source/environment comparison. Rebuilt PE hash
  differs and is recorded; no exact-final-PE startup execution is claimed.
  All 32 source identities and HEAD stable, index empty. Maintained documentation
  reconciled, diagram reviewed unchanged, plan archived with indexes/links updated.
  Closing documentary review is recorded separately as `APPS-ORG-DOCS-01`.
- 2026-10-12: images accepted under `APPS-IMAGES-03-POST-01` PASS after fresh
  audit, baseline and immutable order. Eight byte-identical moves and six import
  replacements pass all seven gates, with stable identities and earlier unit
  guards. Source writers are idle. The director updates maintained documentation;
  the validator runs aggregate, benchmark and four-model combined acceptance.
- 2026-10-12: publication lifecycle unit accepted under
  `APPS-PUBLICATION-02-POST-01` PASS after fresh baseline and immutable order.
  Whole source/test pair moved; five import replacements only, proven by
  reverse-import byte identities. All seven required commands pass, including
  seven browser scenarios and native startup. HEAD and seven identities are
  stable, index empty, accepted native files unchanged. Images audit is being
  refreshed before its independent baseline.
- 2026-10-12: native unit accepted against immutable
  `APPS-NATIVE-01-POST-04` PASS and `APPS-SEEK-RACE-REVIEW-01` APPROVE,
  HEAD `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40` and their exact identities.
  All eleven commands pass, including Chatterbox Spanish/English, with unchanged
  before/after source identities and empty index. The independent reviewer
  reports no findings. Auditor is refreshing the publication unit before a
  fresh baseline and immutable order; accepted native changes remain unstaged.
- 2026-10-12: POST-04 deterministic gates pass with 661 Vitest and 70 Node
  tests, including the unchanged previously failing regression. Native startup,
  reader benchmark and preflight pass. Both Piper Spanish and English full
  journeys pass; English seek restart is 9,885 ms with zero reported underruns,
  buffering, stale audio, generated-audio files, external requests and retained
  cleanup units. Chatterbox's two arms and final identity/review completion are
  still pending; this progress entry is not yet unit acceptance.
- 2026-10-12: comparative DIAG-05 Spanish and English both passed unchanged
  original predicates. Rather than retrying model runs or injecting scheduling
  delays, the auditor and validator required a source-bound deterministic
  regression. `APPS-SEEK-RACE-RED-01` fails exactly three cases using the actual
  old predicate: a completed brief transition is missed, while pre-arm true
  and stopped observation are incorrectly accepted. The three other freshness
  controls pass; 661 Vitest tests also pass. The user-authorized separate bug
  order changes only settling observation to require active, armed, initially
  false instrumentation with a recorded true transition. All deadlines and
  other synchronization/stale-audio gates remain unchanged. The original
  extraction ceiling stays separate from the bounded diagnostic/repair
  allowance. Full native acceptance `APPS-NATIVE-01-POST-04` and independent
  change review are in progress. No historical failure causation is claimed.
- 2026-10-12: diagnostic order `APPS-SEEK-DIAG-01` adds only bounded,
  content-free observation and a deterministic observer test, preserving all
  five seek predicates/deadlines. Three pre-runtime formatting/lint failures
  were corrected and retained as separate receipts; no model retry occurred
  in those attempts. `APPS-SEEK-DIAG-04-VALIDATION` passes deterministic checks
  and one isolated instrumented English journey (9,937 ms seek restart), but
  emits no failing-predicate diagnostic and therefore does not identify or fix
  the cause. A distinct comparative diagnostic is authorized: run Spanish then
  English sequentially on the same unchanged instrumented files, matching the
  model order of the two historical full-run failures. This is not acceptance
  and must stop at a failure; preserve every result.
- 2026-10-12: maintainer authorized bounded investigation/correction of the
  English Piper seek blocker and continuation after acceptance, still without
  staging or commits. Live branch, HEAD, empty index and six source identities
  match POST-03. Reused auditor and validator inspect source and retained logs.
  A separate bug writer is idle pending a precise diagnostic order; the
  refactor writer remains idle. No acceptance retry is authorized as a substitute
  for identifying the failed predicate and cause. The historical reports stay
  immutable. Forensics adds a fourth early wait: `forbidAdaptiveHighlightKey`
  itself waits before the existing seek catch; earlier summaries omitted it.
- 2026-10-12: reviewed current tracked organization and concrete consumers;
  confirmed completed source/Rust/App plans remain historical and closed.
- 2026-10-12: refreshed `main` by fast-forward-only update (already current)
  and created `codex/apps-organization-follow-up` at the HEAD recorded above.
- 2026-10-12: read-only native audit confirmed the three helper responsibilities,
  retained executable owner, explicit Node test wiring and supported model gates.
- 2026-10-12: prepared this plan and its maintained index entries. Source changes,
  execution baselines and implementation acceptance remain pending.
- 2026-10-12: execution began on existing `codex/apps-organization-follow-up`
  at planning commit `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`; initial worktree
  and index were clean. The director read the execution plan and workflow
  contracts and started the named read-only auditor and independent validator.
  All four custom supporting role definitions are exposed with the required
  models; Git stewardship remains unused because the maintainer explicitly
  forbids staging, commits and branch/base changes. One source writer is the
  maximum, and source work waits for a fresh passing baseline.
- 2026-10-12: current audits accepted CHANGE for all three targets. Native
  ceiling tightened to 10,500 total / 700 non-relocation lines; publication to
  1,150 total / 12 import-edit lines; images to 5,400 total / 20 outside-import
  lines. Source allowlists remain exactly those in section 4. No additional
  behavior or architecture change was authorized.
- 2026-10-12: native baseline `APPS-NATIVE-01-BASELINE-01` passed all eleven
  section 8 commands in local PowerShell outside sandbox, including the reader
  benchmark and four Piper/Chatterbox arms. HEAD and all six path identities
  remained unchanged; index empty. The receipt above freezes the Approved Work
  Order. Qwen model-backed branches remain deferred, not passed.
- 2026-10-12: the sole worker authored the six-file native extraction and eleven
  controlled Node tests, appending the new suite once to the existing command.
  Reported ceiling: 9,861 added-plus-removed lines including relocation; 697
  non-relocation lines. Director inspected entry/factory wiring and the new
  tests. Source writer is idle; independent post-change acceptance is next.
- 2026-10-12: `APPS-NATIVE-01-POST-01` passed static equivalence, build,
  typecheck, all 661 Vitest / 62 Node tests and formatting, but failed lint
  because the new suite lacked an explicit `URL` import. Runtime gates were
  not run on that failed patch. The [immutable failure and Correction Order 1](../evidence/apps-organization-follow-up/APPS-NATIVE-01-post-01.md)
  preserve this result. The same worker added only `import { URL } from "node:url";`;
  totals are now 9,862 / 698 lines. A fresh complete post-change report is required.
- 2026-10-12: [APPS-NATIVE-01-POST-02](../evidence/apps-organization-follow-up/APPS-NATIVE-01-post-02.md)
  passed all deterministic gates, native startup, reader benchmark, preflight
  and Piper Spanish, but Piper English timed out during next-segment seek after
  passing its six-rate matrix. Chatterbox was not run. Static equivalence and
  identity recheck pass; the existing logs do not distinguish the three early
  wait predicates. No refactor cause or pre-existing intermittency is proven.
  A single unchanged isolated rerun is authorized to check repeatability;
  it cannot replace complete acceptance. Later units remain untouched.
- 2026-10-12: [isolated English diagnostic](../evidence/apps-organization-follow-up/APPS-NATIVE-01-diagnostic-01.md)
  exited zero on identical source identities, completing seek and cleanup.
  This proves an intermittent outcome on the patch, not a cause or repair.
  The director authorized one fresh complete acceptance attempt with unchanged
  criteria; another native failure stops this attempt as an unresolved blocker.
- 2026-10-12: [APPS-NATIVE-01-POST-03](../evidence/apps-organization-follow-up/APPS-NATIVE-01-post-03.md)
  again passed commands 1-9 and failed Piper English next-segment seek after its
  six-rate matrix. Chatterbox was not run; no further retry or speculative
  correction was attempted. Six source identities and HEAD stayed unchanged,
  index empty. All 63 original functions and constants remain structurally
  equivalent after the approved dependency substitutions. No cause is proven.
  The campaign stops with the native candidate preserved for diagnosis; no
  later source unit, browser gate, portable/full check or archival was performed.
  See the [evidence index](../evidence/apps-organization-follow-up/README.md).
- [x] Milestone 1: execution audit, clean identities and passing baselines.
- [x] Milestone 2: native harness extraction independently accepted.
- [x] Milestone 3: publication lifecycle move independently accepted.
- [x] Milestone 4: image module/test grouping independently accepted.
- [x] Milestone 5: combined acceptance, documentation and archival complete.

## 11. Discoveries and decisions

- Retain the current `apps/desktop` application boundary. The improvement is
  within three concrete responsibilities, not a new generic directory scheme.
- Keep native process/session/fixture ownership in the executable entry. The
  extraction is justified by shared observation/scenario responsibilities,
  not an arbitrary maximum file length.
- Treat the native work as one larger bounded unit because its three stages
  share entry wiring. Publication and image moves form separate disjoint units.
- Keep colocated unit tests; their directory moves do not change the test
  architecture. Keep integration/browser tests at their current level.
- Retain coordinator ownership, worklet URLs, Rust layout, dependencies and
  completed evidence. The system diagram needs no new component for internal
  helper modules; final diagram review confirms the same architecture.
- Use the existing portfolio selection flags for Piper/Chatterbox acceptance
  and preserve ADR-0051's explicit Qwen deferral.
- Historical English seek failures were intermittent and the exact failed
  predicate is unknown. The separately authorized investigation demonstrated
  an observation race with actual injected scripts and three expected failing
  regressions. Repair and content-free diagnostics passed native POST-04 and
  independent change review. Do not retroactively attribute the old failures.
- All three source units and final combined acceptance are approved and remain
  unstaged. The plan is archived with maintained navigation and test maps updated;
  the post-move documentation report preserves the final documentary identities.

## 12. Final validation results

Planning-document review and the requested local planning commit are separate
from execution. Their receipts/report belong to this preparation task; they
must not be interpreted as runtime acceptance.

| Execution gate | Result |
| --- | --- |
| Fresh unit audits and host baselines | All three CHANGE audits and baselines PASS; immutable orders and identities retained. |
| Native extraction and Node suite | POST-04 PASS, final repair review REVIEW-02 APPROVE; 9,862/698 extraction lines plus separately authorized 291-line repair/diagnostics. |
| Publication lifecycle move | POST-01 PASS, seven commands and reverse-import byte proof. |
| Image/test grouping | POST-01 PASS, seven commands and exact byte/import proof. |
| Combined deterministic, browser/native | 661 desktop Vitest + 70 Node; seven browser scenarios and native startup PASS on final source in images POST-01, explicitly reused by FINAL-01 after exact source/environment checks. |
| Native reader benchmark | Fresh FINAL-01 PASS: 10,000 blocks, target 405.3 ms, append 373 ms, reflow 115.5 ms; six-cycle final active observers/URLs and closed-DOM delta zero. |
| Four supported TTS arms | Fresh Piper ES/EN and Chatterbox ES/EN PASS. English Piper seek 10,143 ms. All arms zero observed underruns, buffering, stale playback, persisted audio, external requests and retained/discarded cleanup units. |
| Portable/full and identities | Both exit 0 in FINAL-01. Shared 209, EPUB 651, desktop 661 + 70 Node, Python 485, evidence 13; Rust 87/88. Exact 32-path before/after identities and HEAD unchanged; index empty. |
| Maintained documentation and archive | Testing map/helper ownership documented; diagram reviewed unchanged; completed path and indexes updated, no active redirect or edits to other historical plans. Separate post-move documentary report APPS-ORG-DOCS-01. |

The [final combined report](../evidence/apps-organization-follow-up/APPS-ORG-FINAL-01.md)
and [final repair review](../evidence/apps-organization-follow-up/APPS-SEEK-RACE-review-02.md)
retain commands, UTCs, outcomes, exact identities and provenance. All acceptance
commands ran in local PowerShell outside sandbox. Raw captures remain ignored.

Qwen model-backed branches remain deferred under ADR-0051, not passed.
Chatterbox verifies rate-control presentation; its six-rate transition matrix
was not exercised. Each Rust configuration intentionally ignores the subprocess
fixture selected only by its assignment-failure test; it is not reported as an
independently passing test. Nonfatal pytest cache-write, Vite chunk-size and
browser color-environment warnings are retained. Rebuilt executable bytes differ;
fresh benchmark/model runs use that rebuild, while browser/native reuse is bound
to identical source and environment. No universal performance claim is made.

Historical POST-02/03 failure causation remains unknown. The independently
reproduced observation race is repaired and validated; earlier failed reports
remain immutable in the [evidence collection](../evidence/apps-organization-follow-up/README.md).

Source and documentation remain unstaged/uncommitted on
`codex/apps-organization-follow-up`, HEAD
`520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`; no push or PR.
Earlier dated progress entries describe historical states, not current blockers.
