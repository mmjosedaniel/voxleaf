# Desktop presentation rules, action handlers, and render comparisons

Status: completed on 2026-10-13. All four units independently accepted;
combined portable/full/native gates pass. Changes remain unstaged/uncommitted.
Prepared on 2026-10-12. Implementation branch:
`codex/desktop-ui-logic-readability`, created from clean, up-to-date `main` at
`fc2f3ace3d07bf9c3ad1fa73503e01b8986754ec`.

## 1. Goal

Implement the focused readability recommendations from the desktop source
review while preserving observable behavior:

1. Extract pure narration-message rules from the React controls.
2. Share the repeated pending/operation/recovery/finally sequence in the
   three hardware-settings handlers through one local function.
3. Use one local predicate for the identical semantic block/list memo
   comparisons.
4. Give the repeated Reading/Appearance disabled condition one local name.

Only the first item needs a new production module. The others retain their
current owner and file. This is cross-milestone maintenance following the
completed [App restoration extraction](../completed/app-restoration-derivations.md)
and [desktop source organization](../completed/desktop-source-organization.md).
It does not reopen either plan or target a particular line count.

## 2. User-visible outcome

Messages, controls, enabled states, selection outcomes, recovery, focus,
rendered semantic content and incremental rendering remain unchanged.
Contributors can read named decisions and test message precedence without
mounting a component. Shared handler and comparison rules have one definition.

No feature, performance improvement, new state owner, hook, store, singleton,
dependency or public contract is promised. The accepted reader model, local
TTS, privacy, bounded audio and identity-first cancellation remain in force.

The original planning delivery authorized this plan, its links, the branch and
one local documentation commit. The 2026-10-12 execution request authorizes the
four source units and their documentation. Staging, commits, push and PR creation
are explicitly prohibited; accepted disjoint units remain unstaged.

## 3. Current state

The planning checkout includes the merged App restoration work from PR #240.
Its new predicates and mapper are already implemented and excluded here.
The preceding inventory found 134 tracked TypeScript/TSX files under
`apps/desktop/src`: 75 production modules, 58 tests and one test configuration.
Inventory/AST triage is not an exhaustive correctness review of all modules.

The three refactor units below received individual read-only audit packets at
the planning HEAD. The small Settings item received a separate SKIP judgment
as a standalone abstraction; the director's narrower decision is explicit.
None of these planning audits is a runtime baseline or implementation approval.
Line numbers identify the current source and may move during execution.

| Target | Observed evidence | Planning disposition |
| --- | --- | --- |
| `SRC-NARRATION-PRESENTATION-01` | `ProductNarrationControls.tsx`: `availabilityMessage` at 24, `phaseMessage` at 58 and nested failure guidance at 234-248. Recovery, failure, service and playback precedence is embedded in the React module. | CHANGE, low risk: pure message module and direct cases; keep UI actions in place. |
| `SRC-HARDWARE-CONTROLS-02` | `HardwareCompatibilityControls.tsx`: profile, language and reset handlers at 134-184 repeat pending, await, success-only recovery reset and finally. Recheck at 166 follows different rules. | CHANGE, low risk in the source diff; profile-selection host acceptance is required. |
| `SRC-SEMANTIC-COMPARISON-03` | `SemanticDocument.tsx`: comparator bodies at 262-285 and 342-365 are identical; only the group prop types differ. | CHANGE, medium risk: one private local comparator, with render/performance characterization. |
| `SRC-SETTINGS-CONDITION-04` | `ReaderSettingsDialog.tsx`: Reading and Appearance repeat the same two-operand disabled condition at 319-334. | Auditor SKIP for a separate abstraction; retain only the explicitly requested minor local naming adjustment, as explained below. |

The director accepts the fourth audit's finding that no new abstraction or
test seam is justified. The user requested implementation planning for the
preceding recommendations, which included this minor naming improvement.
Retain exactly that change as a small cleanup item, not as evidence that the
auditor approved another refactor. Do not broaden it or invent tests solely
to justify it.

The review retained the snapshot hooks, narration-settings actions, preference
validation and current App restoration module. Whole-method extraction from
`ReaderPublication.runProgrammaticNavigation` or the product coordinator's
`#createSnapshot` is deferred: those operations carry ordered side effects,
refs and resource ownership. In particular, `#createSnapshot` synchronizes
the player before deriving its presentation.

## 4. Scope and non-goals

Use three cohesive refactor units and one bounded naming item, sequentially.
The following candidate allowlists are closed until a fresh execution audit
and director decision explicitly revise them.

| Target | Candidate paths | Planning ceiling, added plus removed lines |
| --- | --- | --- |
| `SRC-NARRATION-PRESENTATION-01` | `apps/desktop/src/tts/ProductNarrationControls.tsx`; `apps/desktop/src/tts/ProductNarrationControls.test.tsx`; new `apps/desktop/src/tts/product-narration-presentation.ts`; new `apps/desktop/src/tts/product-narration-presentation.test.ts` | Four paths, 500 lines. |
| `SRC-HARDWARE-CONTROLS-02` | `apps/desktop/src/tts/HardwareCompatibilityControls.tsx`; `apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx` | Two paths, 260 lines. |
| `SRC-SEMANTIC-COMPARISON-03` | `apps/desktop/src/reader/SemanticDocument.tsx`; `apps/desktop/src/reader/SemanticDocument.test.tsx` | Two paths, 400 lines. |
| `SRC-SETTINGS-CONDITION-04` | `apps/desktop/src/settings/ReaderSettingsDialog.tsx`; unchanged `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx` as a validated supporting path | Two validated paths, one edited path, 30 lines. |

Keep existing component suites in place. Colocate only the new pure-message
tests with their new module. Preserve existing assertions and synthetic
fixtures; there is no general test-directory reorganization.

Documentation scope: this plan, active/completed indexes, `docs/README.md` and
the maintained desktop test-coverage map in `docs/development/testing.md`.
Concise reviewed receipts may use
`docs/plans/evidence/desktop-ui-logic-readability/`; temporary checkers and raw
outputs belong in ignored `tmp/evidence/desktop-ui-logic-readability/`.

Exclude App and its extracted helpers, coordinator implementations, schedulers,
players, profile selection policy, recovery policy, persistence, DOM ownership,
navigation/reflow, component structure and keys, CSS, dependencies, manifests,
runner changes, benchmark thresholds, generated code, the seven source authority
modules, measured registries, frozen evidence and other completed plans.

## 5. Relevant files and documentation

Read [AGENTS.md](../../../AGENTS.md), [the ExecPlan format](../../../.agents/PLANS.md),
[docs index](../../README.md), [MVP requirements](../../product/mvp.md),
[reader/settings requirements](../../product/reader-settings-and-playback-controls.md),
[system diagram](../../architecture/system-diagram.md),
[architecture overview](../../architecture/overview.md),
[testing guidance](../../development/testing.md),
[refactor workflow](../../development/agentic-refactoring.md) and
[evidence retention](../../development/evidence-retention.md).

Applicable decisions include
[ADR-0008](../../architecture/decisions/ADR-0008-visual-reader-architecture.md),
[ADR-0018](../../architecture/decisions/ADR-0018-reader-experience-stabilization.md),
[ADR-0041](../../architecture/decisions/ADR-0041-simplify-empty-and-ready-reader-chrome.md)
and [ADR-0051](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md).
The last decision retains Qwen code and deterministic tests while deferring
its model-backed acceptance; it does not relax Piper/Chatterbox requirements.

Read both refactor skills, the complete agent contracts and validation matrix.
Inspect the four owners and their tests, the existing snapshot hooks,
`adaptive-preparation-presentation.ts`, `ProductNarrationSnapshot`, the recovery
snapshot, hardware compatibility methods, semantic render-plan group types,
and the production reader benchmark. Verify the root/desktop package scripts
and the existing filtered bilingual portfolio runner before executing them.

## 6. Architecture and constraints

### Pure narration-message rules

Introduce `productNarrationAvailabilityMessage`,
`productNarrationPhaseMessage` and `productNarrationFailureMessage` in the new
module. Preserve the exact strings, profile-specific copy, fallbacks and
precedence. Use existing snapshot/contract types with type-only imports;
do not import the React component or create a runtime cycle. The availability
helper needs only availability and profile identity; other signatures should
take only existing snapshot data required by their decisions.

Recovery phases precede product failure, preparation/service state and playback
phase in the phase message. In failure guidance, preparation failure takes
priority, then contained/unavailable recovery, permitted recovery and its action,
then profile-unavailable and the cleanup fallback. Keep the component's
`failure === undefined` guard and its paragraph. Use explicit returns for the
existing decision sequence rather than replacing it with a generic rule engine.

Keep the availability-check effect, subscriptions, action booleans, stop label,
startup cancellation, callbacks, disclosure state, JSX and accessibility in
the component. No helper may read EPUB text, PCM, storage, clocks or mutable
coordinator state, or perform an action.

### Local hardware-settings operation

Inside `HardwareCompatibilityControls`, add
`runNarrationSettingsChange(operation: () => Promise<boolean>): Promise<void>`.
It owns only the sequence already shared by the profile, language and reset
handlers: pending true, invoke/await inside try, recovery reset only on true,
and pending false in finally. Keep the three handlers as explicit adapters.

Each adapter retains its supplied-callback/fallback choice and argument.
Invoke fallback methods through their coordinator receiver; never extract an
unbound method. Preserve rejection propagation from both the operation and
recovery callback. Do not add catches, retries, error normalization or logging.
Preserve pending notifications before invocation and after settlement.

Keep `handleRecheck` separate: it awaits a snapshot-producing check, does not
use selection-pending, and then resets recovery. Keep mount/unmount notification,
profile/language filters, separate persistence permissions, disabled rules,
focus, markup and copy unchanged. Although the diff is local, it touches the
profile-selection execution path, so section 8 requires supported exact-host
coverage rather than inferring safety from unchanged delegation.

### Shared semantic-group comparison

Use a private union of the existing block-group and list-item-group prop types.
Keep one existing body as `semanticGroupPropsEqual` and pass it directly to
both existing memo calls. Retain `effectiveContextEqual` and
`destinationAffectsRange` as they are. A local union is sufficient; do not
introduce a general equality framework, new module or test-only exports.

Preserve reference comparison for group and services, value comparison for
language/direction, and destination identity changes affecting either the old
or new group range. Membership remains `startIndex <= blockIndex < endIndex`;
an absent block index is outside. Counts compare equal when identical or when
both have reached `endIndex`. Keep decision order, short-circuiting and constant
work without new allocation, traversal or cache. Preserve all memoized
components, props, keys, DOM refs, batching and render-plan identities.

### Minor Settings naming item

Inside `ReaderSettingsDialog`, name the existing expression
`readerControlsDisabled = readerPreferencesStatus === "loading" || !canPersistReaderPreferences`
and use it for the Reading and Appearance controls. Keep the expression exact;
do not combine it with narration-pending or other permissions. The change adds
no hook, helper file, state, effect or test. Keep its existing test file unchanged.
Record the audit SKIP and this limited director decision in execution evidence.

### Retained boundaries

Preserve local EPUB handling, local inference, zero generated-audio persistence,
bounded memory, cancellation, stable locators and visible/audible/saved-position
synchronization. No package, process, storage or trust boundary changes. Review
the canonical diagram at closeout and record continued applicability; ordinary
local functions do not require a new architectural component or ADR.

## 7. Milestones

### Milestone 1: Refresh scope and establish independent baselines

Status: complete. Fresh execution audits and passing baselines for all units;
the original hardware BASELINE-FAIL is retained with its diagnosed recovery.

Use the existing branch. Inspect current HEAD, planning commit, index and
worktree. Preserve unrelated work and stop on overlap with a target allowlist.
Refresh the three refactor audits and confirm the minor naming-only item;
record CHANGE, SKIP, excluded and deferred targets truthfully. Confirm ceilings,
test seams and exact commands before implementation.

Use the configured auditor, worker and independent validator roles with the
primary task as director. Reuse roles within the batch, retain the prescribed
models/concurrency limit, permit one source writer and no supporting-agent
delegation. The named skills define the full contracts. Do not silently replace
an unavailable auditor, worker or validator.

Before each unit, require an empty index, clean target paths and a passing
independent baseline for that exact allowlist. Freeze its bounded execution
order only after baseline PASS. For the naming item, record that the authority
is the user-requested small cleanup and director decision, not an auditor CHANGE.
Relevant existing failures are BASELINE-FAIL and do not authorize repair.
Actual results: fresh execution audits returned CHANGE for narration, hardware
and comparison; Settings retained SKIP for an abstraction with the explicit
user-authorized naming-only exception. All unit paths were initially clean;
index remains empty. All four approved orders followed passing baselines;
hardware's order followed its corrected second baseline. The seven frozen
authority modules, generated sources, App and its
helpers, coordinators, domain policies, dependencies, runners and historical
plans remain excluded. The deferred large-method recommendations remain deferred.

### Milestone 2: Extract narration presentation and its tests

Status: complete; accepted unstaged. Target: `SRC-NARRATION-PRESENTATION-01`.

Move the two existing message functions and extract the failure-guidance
expression. Add direct precedence/profile cases, preserve the component's
render guard and its existing integration assertions, and inspect type-only
dependency direction. Obtain the worker Change Packet and independent
post-change acceptance. Actual result: independent baseline and post-change
PASS; see [frozen order](../evidence/desktop-ui-logic-readability/narration-order.md)
and [immutable acceptance](../evidence/desktop-ui-logic-readability/narration-post.md).

### Milestone 3: Consolidate the three selection handlers

Status: complete; accepted unstaged.
Target: `SRC-HARDWARE-CONTROLS-02`.

Characterize missing deferred true/false outcomes before production changes.
Introduce the local operation helper and reduce each handler to its original
callback/fallback adapter. Keep recheck and cleanup separate. Validate the
pending/recovery sequence, receiver preservation, unchanged error behavior and
the four supported model/language host arms. Actual result: common checks,
native startup and preflight passed, but both Piper profile-switch arms timed
out and Chatterbox Spanish reported optional-profile failure; English was not
reached. No implementation order was issued for that failed attempt. See the
[independent baseline receipt](../evidence/desktop-ui-logic-readability/hardware-baseline.md).
The authorized continuation isolated inherited AppData redirection, preserved
native containment and established a passing baseline from the corrected host
context. See [diagnosis](../evidence/desktop-ui-logic-readability/host-context-recovery.md)
and [fresh baseline/frozen order](../evidence/desktop-ui-logic-readability/hardware-order.md).
The worker characterized the original handlers before refactoring. The
200-line patch then passed all twelve commands and all four supported model
arms independently; see [post-change acceptance](../evidence/desktop-ui-logic-readability/hardware-post.md).

### Milestone 4: Share semantic comparison with render characterization

Status: complete; accepted unstaged. Target: `SRC-SEMANTIC-COMPARISON-03`.

Characterize completed/partial block and list groups through existing public
component seams before replacing either comparator. Add the private union,
reuse one unchanged predicate body and connect both memo calls. Review static
equivalence and run browser/performance checks without changing limits.
Actual result: independent baseline and post-change PASS, including six
benchmark cases before and after. The 225-line patch preserves the comparator
body exactly. See [order/baseline](../evidence/desktop-ui-logic-readability/semantic-order.md)
and [acceptance](../evidence/desktop-ui-logic-readability/semantic-post.md).

### Milestone 5: Name the repeated Settings condition

Status: complete; accepted unstaged. Target: `SRC-SETTINGS-CONDITION-04`.

Apply only the local constant and its two uses after the bounded baseline/order.
Keep existing tests unchanged; review exact expression equivalence and run
the applicable existing checks. Do not turn the standalone-abstraction SKIP
into a broader Settings refactor. Actual result: exact constant and two uses,
13 changed lines, unchanged supporting test; independent baseline and post-change
PASS. See [order/baseline](../evidence/desktop-ui-logic-readability/settings-order.md)
and [acceptance](../evidence/desktop-ui-logic-readability/settings-post.md).

### Milestone 6: Complete combined acceptance and documentation

Status: complete. All four units and refreshed combined acceptance pass.

Allow at most two bounded correction loops per refactor order; then redesign
the order if necessary. Do not carry a rejected patch into the next unit.
Earlier accepted, disjoint unstaged units may remain when execution forbids
commits: identify them separately from the current unit delta, keep the index
empty and validate the combined ten-path manifest at final acceptance.

Run the package/final gates, review the complete diff, update the maintained
testing map and record actual results and limitations. Source writing and Git
remain idle during validation. Source commits, if later authorized, require
separate exact-path Git Action Orders bound to current immutable acceptance;
this planning commit is not that authorization.

After all four requested items and all required gates pass, move this plan to
`docs/plans/completed/`, update both indexes and `docs/README.md`, repair
maintained incoming links and leave no active redirect. Preserve other
historical plan bodies. Independently validate documentation after the move.
Actual result: `pnpm.cmd check:portable`, `pnpm.cmd check` and
`pnpm.cmd test:native-startup` all exit 0 on the final four-unit source.
The [current ten-path final report](../evidence/desktop-ui-logic-readability/final-source-02.md)
records PASS and matching identities; the earlier three-unit BLOCKED report
remains historical. Its identity snapshots bracket the complete sequential
command set, not each individual command; see the
[documentation clarification](../evidence/desktop-ui-logic-readability/documentation-corrections.md).
The testing map and maintained indexes reflect completion.
This plan is archived without an active redirect; documentation verification
is recorded separately in the campaign evidence. No other historical plan
body, source authority or prior immutable receipt was edited.

## 8. Testing and benchmark strategy

Run every test and validation in normal local PowerShell outside the managed
sandbox, from the repository root. Record exact commands, exits and evidence;
exploratory sandbox runs and historical counts are not acceptance. No runtime
tests are run merely to prepare this documentation.

### Common baseline and post-change commands

Use these for each bounded item; the fresh validator may select a smaller
authoritative existing target only when the matrix permits it and the order
records the reason. Do not invent commands or silently omit a required gate.

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop build
pnpm.cmd test:browser
```

The browser gate covers the affected controls, Settings and reader. Desktop
`build` above is the Vite build; it is not root `build:desktop`, which invokes
Tauri. Keep relevant type/test/assertion checks even for the minor condition.

### Required characterization

- Narration messages: all availability/profile variants; recovery taking
  precedence over overlapping failure/service/playback states; each service
  preparation and playback phase; all failure-guidance branches. Preserve
  exact copy and absence of the error paragraph without a failure. Existing
  integration tests retain subscriptions, actions, cancellation and disclosure.
- Hardware handlers: parameterize profile, language and reset with deferred
  promises and true/false results. Observe pending and notifications, retained
  controls, recovery only on true, supplied callbacks bypassing fallbacks,
  correct receivers/arguments and independent recheck behavior. Preserve
  rejection semantics by exact try/finally review; do not export handlers,
  suppress Vitest errors or alter production rejection behavior for a test.
- Semantic comparison: observe reuse of completed block/list groups during
  later yields; partial groups advancing; changed services; destinations
  entering/leaving ranges, absent destinations and the next-range boundary;
  document/context replacement and stable output/order. Use stable existing
  callbacks to observe work without replacing React.memo or exposing private
  comparators. Component coverage cannot isolate every private branch because
  changing document context also changes its plan; include static equivalence
  review instead of claiming unsupported branch coverage.
- Settings condition: retain the existing component suite and inspect both
  consumers. Add no test that merely restates the boolean expression.

### Semantic comparison performance gate

Before and after `SRC-SEMANTIC-COMPARISON-03`, also run:

```powershell
pnpm.cmd benchmark:reader
```

This existing Chromium suite includes the production renderer near its chapter
limit. Preserve time, DOM, batch and memory assertions, fixtures and thresholds.
No performance improvement is claimed; the purpose is to detect regression.

### Profile-selection host gates

Before and after `SRC-HARDWARE-CONTROLS-02`, run the following sequentially in
addition to the common checks:

```powershell
pnpm.cmd test:native-startup
pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4
```

These are the existing manifest script and portfolio entrypoint with verified
selection flags. Native startup builds the current executable before the host
arms. The last call runs both Chatterbox languages, for four supported arms in
total. The runner exercises profile switching and preserves configuration,
offline/firewall, process cleanup and existing playback/synchronization checks.
Keep the exact registry profile IDs even when their names contain older version
numbers. The same filtered pattern is documented by the completed apps
organization plan; its past results are not reused as this plan's evidence.

Do not invoke the unfiltered six-arm portfolio or the Qwen-dependent adaptive/
resilience commands as a substitute. Preserve ADR-0051's deferred Qwen branches
and deterministic checks. Missing host configuration, supported models,
compatible hardware, matching WebView2/driver or offline prerequisites block
the corresponding gate. Report the real blocker; do not weaken assertions or
change machine/network configuration without applicable authorization.

No separate model-backed run is triggered by message-only extraction, identical
memo comparison or local naming. If a later order expands into other runtime,
selection, scheduling or playback behavior, revise the scope and validation
before proceeding; do not hide a behavior change inside this refactor.

### Combined acceptance and report identity

After the coherent desktop batch, run:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:native-startup
```

The final native startup covers the combined packaged reader and Settings.
Previously completed required gates may be referenced only when their scope,
source identities and applicable validation contract remain valid; rerun after
relevant drift. Never relabel a failed or unrun arm as passed.

Every report records a fresh ID, mode, starting/ending HEAD, closed allowlist,
exact porcelain status, worktree SHA-256 and filter-aware blob identities
before and after commands. New helper paths are ABSENT at baseline. PASS
requires unchanged HEAD/identities, an empty index and completed checks.
Reports are immutable; changes require revalidation, not refreshed hashes on
an old approval. Keep identity receipts outside their validated paths.

Planning-document acceptance checks the twelve required sections, six
milestones, script/runner references, local links/anchors, whitespace, evidence
retention and exact plan-plus-two-index scope. It establishes no source baseline,
model availability or runtime acceptance.

## 9. Risks and rollback

- Message extraction can change precedence despite preserving individual strings.
  Test overlapping states and retain component guards and integration assertions.
- A shared handler can detach a receiver, reset recovery on false or swallow a
  rejection. Preserve closures and try/finally; characterize the observable order.
- Incorrect memo equality can leave stale destinations/services or re-render
  every completed group. Keep exact reference/range/count rules and benchmark.
- Minor naming can accidentally couple unrelated settings permissions. Keep
  the exact expression and only its two original consumers.
- Broad host failures can tempt unrelated repairs. Separate baseline/setup
  blockers from regressions and rescope explicitly rather than changing policy.

On rejection, correct or remove only verified worker-authored changes. Preserve
unrelated work; avoid broad reset, clean, restore or stash. Remove a new helper
and its call-site changes together. Any correction receives a new independent
report before acceptance or authorized staging.

## 10. Progress log

- 2026-10-12 execution: confirmed existing branch
  `codex/desktop-ui-logic-readability`, HEAD
  `5be831c23135ca00f94b2b3374f0330de2b658ce`, empty index and clean worktree.
  The planning commit follows the original branch base; no Git setup mutation
  is needed or authorized. Configured auditor (Sol high), worker (Sol high)
  and validator (Astra high) roles are exposed. The director will reuse these
  roles and omit Git stewardship because all Git writes are forbidden.
  Fresh narration audit started; no source edit or acceptance is claimed yet.
- 2026-10-12: reviewed the current source inventory and completed three focused
  read-only audits. No runtime baseline or source edits were performed.
- 2026-10-12: recorded the Settings standalone-abstraction SKIP and retained
  only the requested local naming item as a bounded director decision.
- 2026-10-12: independent planning consultation required supported exact-host
  acceptance for the profile-selection handler unit; included it in section 8.
- 2026-10-12: fast-forward-only refresh confirmed main was current; created the
  implementation branch at the HEAD recorded above and prepared plan/index links.
- [x] Milestone 1: execution scope/audits and all passing baselines established;
  original hardware failure diagnosed and recovered before its order.
- [x] Milestone 2: pure messages and tests accepted (499-line patch; seven host
  checks passed, 719 Vitest / 70 Node / seven browser cases; one ceiling-only
  correction before validation). No Git mutation.
- [x] Milestone 3: shared handlers and supported host gates accepted.
  Fresh baseline and post-change PASS, including Piper/Chatterbox ES/EN.
- [x] Milestone 4: shared comparator, characterization and benchmark accepted.
- [x] Milestone 5: exact Settings naming cleanup accepted, supporting tests unchanged.
- [x] Milestone 6: combined checks, documentation and archival complete.
  Refreshed four-unit portable/full/native acceptance PASS with ten matching
  identities. Testing map updated, diagram reviewed and maintained links repaired.

## 11. Discoveries and decisions

- 2026-10-13 continuation: the maintainer explicitly authorizes investigation
  and repair of the Chatterbox/profile-selection blocker before resuming B.
  Preserve accepted A/C/D and the empty index. This adds a bounded bug-fix
  prerequisite; its final source allowlist follows demonstrated root cause,
  with regression evidence and independent change review for any behavioral
  repair. Temporary content-safe probes live under ignored `tmp/evidence/`;
  a temporary native diagnostic test may inspect the existing verifier and
  must be removed before the final patch. Frozen package authorities, hashes,
  thresholds and existing acceptance requirements remain unchanged.
  Initial host inspection confirmed the installed v3 runtime manifest, all
  13,083 manifested runtime files and six model files match their authorities.
  A read-only WebDriver observation reproduced the integrity-error UI before
  profile selection; the later findings below resolve that investigation.
- Execution: the hardware baseline passed deterministic/browser/native startup
  and preflight but failed supported profile switching before any handler edit.
  Both Piper arms timed out; Chatterbox Spanish reported optional-profile failure
  and English was not reached. The precise root cause was unproven at that point. No gate
  was weakened and no unrelated runtime or machine configuration repair made.
- Continuation: the cause was proven as inherited AppData redirection into
  Codex's MSIX LocalCache tree. Canonical containment correctly rejected those
  paths. The identical read-only native probe passed in a WMI-launched ordinary
  PowerShell context with matching actual root/file paths. No production fix,
  package reinstall or containment relaxation was needed. The temporary native
  probe was removed. A generic-native setup error from real-model variables was
  separately preserved and corrected with the existing model-free environment.
  Fresh baseline and post-change reports passed all twelve commands; the
  post-change run needed no retries. This environment-only recovery requires
  no behavioral change review; the independent refactor gate remains in force.
- Execution: narration's first formatted patch exceeded 500 lines; one bounded
  test-fixture correction retained all assertions and brought it to 499 before
  acceptance. Comparator characterization passed against the original production
  SHA before its 225-line refactor. Settings changed 13 lines without test edits.
- Architecture closeout review: the canonical system diagram still matches the
  delivered changes. Pure message rules, one local predicate and a boolean name
  do not change process/package, data-flow, persistence or trust boundaries.
  No diagram or ADR edit is required; hardware/domain owners remain unchanged.
- Two of the substantive recommendations need only a local function. New
  files are justified for directly testable presentation rules, not for each
  condition, handler or comparator.
- The Settings audit remains SKIP as an abstraction recommendation. The
  retained naming-only item follows the user's request for the earlier small
  improvement and adds neither another layer nor redundant test work.
- Handler refactoring touches profile selection even if its intended semantics
  remain identical. Its required host validation is stronger than the initial
  static audit's proposed deterministic-only gate.
- Sharing memo comparisons must preserve render reuse as well as output.
  DOM equality alone cannot show that completed groups avoided repeated work.
- A/C/D do not independently require a model run. B does; the existing
  Piper/Chatterbox filtered runner respects current Qwen deferral.
- No code was found to be functionally incorrect by these audits. This plan
  addresses duplication, decision visibility and message testability.

## 12. Final validation results

The original planning receipt remains historical. The execution receipts above
record fresh host commands and identities; all source changes remain unstaged.

| Requirement | Current result |
| --- | --- |
| Fresh execution orders and source baselines | All four baseline PASS/orders; original hardware failure and recovery retained. |
| Pure narration messages and direct cases | Implemented and independently accepted; 42 direct cases plus retained component suite. |
| Shared selection handler and characterization | Implemented and accepted; 200-line patch, twelve deferred combinations plus separate recheck. |
| Shared semantic comparator and render cases | Implemented and accepted; four public-seam cases, static equivalence, benchmark before/after. |
| Minor Settings naming adjustment | Implemented and accepted; exact expression, two uses, test unchanged. |
| Browser, benchmark and supported exact-host gates | Seven browser cases pass per accepted unit; six benchmark cases pass before/after C; all Piper/Chatterbox ES/EN gates pass before/after B. |
| Combined portable/full/native checks and identity review | Fresh four-unit PASS: all three commands exit 0, ten-path/HEAD recheck PASS, index empty. |
| Testing-map update, diagram review and archival | Map updated for all units, diagram remains applicable; completed plan and maintained links updated. |

Closure retains the original failed baseline, environmental diagnosis, corrected
baseline setup and subsequent first-attempt post-change passes. Nothing remains
blocked in this plan. Qwen model-backed acceptance remains deferred under
ADR-0051; no broader acquisition, hardware or latency claim is added. The
repository is left on the existing branch and HEAD with an empty index; no
staging, commit, push or PR is authorized or performed.
