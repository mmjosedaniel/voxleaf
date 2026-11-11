# Five-pass audit: revalidation and minimal corrections

Status: planned; implementation and runtime validation have not started.
Prepared: 2026-11-11.
Planning base: `4baeddb66e2831a00c97625fcdbeffe538072cdb`.
Branch: `codex/five-pass-audit-plan`.

## Goal

Resolve the retained findings from the five static audit passes and their
subsequent historical and independent reviews, using the smallest correction
that satisfies each existing contract. Reproduce a retained case on the current
implementation before changing production code. Preserve earlier fixes, their
regression coverage, and the distinction between historical results and new
acceptance evidence.

This request authorizes preparing this plan, creating its branch and committing
the planning documents locally. It does not authorize executing the milestones,
changing runtime code, running product tests, pushing, opening a PR or publishing
artifacts. A later instruction to execute the plan starts implementation; the
planning commit is not authorization for subsequent Git mutations.

## User-visible outcome

After implementation and acceptance, newer navigation wins over delayed older
requests, recovery starts from the appropriate position, Stop preserves the
audible checkpoint, and pointer placement survives unrelated narration updates.
Images prioritize the current viewport, narration respects the existing literal
range and language policies, and settings/package actions preserve their actual
operation ownership. Maintainer tools report bounded, truthful benchmark,
dependency, release and installer outcomes.

These are intended outcomes, not claims about work already completed. The
campaign closes every register entry with evidence, including withdrawals when
the current behavior does not reproduce the proposed defect. It does not promise
that the rest of the repository is free of bugs.

## Current state

The preceding chat review covered the five audit passes, the investigation
reports for the original 27 cases, deeper reviews of related paths, and relevant
earlier chats/ExecPlans. Two related cases, ADD-01 and ADD-02, survived further
independent review. The resulting register has **29 dispositions: 25 retained
candidates and four excluded or conditional cases**. Static evidence is not a
runtime reproduction. No retained case has a new RED/GREEN receipt from this
campaign.

The starting worktree and index were clean. The current baseline already
contains PRs #304, #305, #306, #307, #310 and #311. Several findings are adjacent
variants of those corrections, not proof that the earlier correction failed.
In particular, the completed DCR plan is not being reopened; its old active-path
notice remains a historical link target.

### Historical sources and case lineage

Use the canonical completed plan and its evidence, rather than an earlier chat
summary, to determine what an older case actually accepted:

| Reference | Canonical source and relevance |
| --- | --- |
| DCR | [Deep chat audit](../completed/deep-chat-audit-minimal-corrections.md), [execution ledger](../evidence/deep-chat-audit/execution-ledger.md) and [integrated review](../evidence/deep-chat-audit/review-G12-R2.md): recovery, Celsius, settings, optional packages, benchmark ownership and release tooling. |
| RPI | [Reader position and image lifecycle](../completed/reader-position-and-image-lifecycle.md), [ledger](../evidence/reader-position-and-image-lifecycle/execution-ledger.md), [closeout review](../evidence/reader-position-and-image-lifecycle/closeout.md) and [CI diagnostic review](../evidence/reader-position-and-image-lifecycle/ci-diagnostic-review.md): settled geometry, resource capacity and later harness corrections. |
| CAF | [Chat audit follow-up](../completed/chat-audit-minimal-follow-up.md), [ledger](../evidence/chat-audit-minimal-follow-up/execution-ledger.md) and [commands](../evidence/chat-audit-minimal-follow-up/validation-commands.md): ownership, normalization grammar, failed-stop handling and explicit deferred cases. |
| EBC | [EPUB budget/cancellation/reflow evidence](../evidence/epub-budget-cancellation-reflow/execution-ledger.md) and [commands](../evidence/epub-budget-cancellation-reflow/validation-commands.md): independent opening/budget corrections and the limits of modeled geometry evidence. |
| Earlier navigation and playback | [Verified chat audit](../completed/verified-chat-audit-corrections.md), [lifecycle follow-up](../completed/lifecycle-correctness-follow-up.md), [boundary/navigation corrections](../completed/narration-boundary-navigation-corrections.md), [confirmed logic bugs](../completed/confirmed-logic-bugfixes.md), [minimal playback state](../completed/minimal-playback-state-corrections.md) and [reader image/audibility corrections](../completed/reader-image-audibility-minimal-corrections.md). |
| Earlier settings and packaging | [Settings lifecycle](../completed/narration-settings-lifecycle-corrections.md), [residual audit](../completed/residual-audit-corrections.md), [revalidated chat findings](../completed/revalidated-chat-findings-minimal-corrections.md), [eight revalidated findings](../completed/eight-revalidated-findings-minimal-corrections.md) and [settings/packaging](../completed/settings-packaging-minimal-corrections.md). |

The case numbers below retain the chat's pass/case numbering. ADD-01 and ADD-02
are separately tracked related cases; their variants are not additional findings.

## Scope and non-goals

### Retained register

Every row begins as `REPRODUCTION PENDING`. The implementation units below define
its smallest proposed fix, controls and acceptance boundary.

| Case | Retained behavior to reproduce | Unit |
| --- | --- | --- |
| 1.1 | Delayed boundary or paragraph navigation emits after a newer chapter request. | U1 |
| 1.3 | A visible raster waits behind already queued near-viewport work. | U4 |
| 1.4 | A shared-unit Celsius range is partially normalized. | U5 |
| 1.5 | Benchmark parent capture is unbounded and can accept a PASS payload from a nonzero child exit. | U9 |
| 1.7 | v5 memory finalization samples/closes while its monitoring thread can still own the probe. | U10 |
| 1.8 | The PowerShell release wrapper accepts a legacy lifecycle flag rejected only after expensive work. | U12 |
| 2.1 | Selecting during acquisition can replace preflight identity or detach the active download's terminal result. | U8 |
| 2.2 | Remove can Stop playback before discovering that post-commit package cleanup is still busy. | U8 |
| 2.3 | v13 cancellation can satisfy PASS criteria without proving accepted work was invalidated and prevented from publishing. | U11 |
| 2.4 | A batch of image intersection entries is reduced using its first matching entry. | U4 |
| 2.5 | Malformed language tags can reach English/Spanish normalization through incomplete structural validation. | U5 |
| 3.1 | Recovery after a first failed start can use the book-opening locator instead of that start attempt's locator. | U1 |
| 3.2 | A playback-rate change can retain an initial-start latch before the first unit is allocated. | U2 |
| 3.3 | Reset can settle against an obsolete hardware/profile result and later disagree with the refreshed selection. | U7 |
| 3.4 | The release inventory can identify a foreign-platform wheel for the Windows CPython core. | U13 |
| 4.1 | Canceling recovery can leave its proposed locator as the next ordinary Play location. | U1 |
| 4.2 | An empty fragment is treated as a missing fragment instead of the document start. | U6 |
| 4.3 | A catchable failure between three v7 authority writes leaves a partially replaced set. | U14 |
| 4.4 | Lifecycle receipt validation rejects semantically identical object keys in a different order. | U12 |
| 5.1 | Stop before automatic-follow settlement permits a late geometry event to replace the audible saved checkpoint. | U3 |
| 5.2 | An unrelated narration-boundary render replaces the hovered paragraph placement preview. | U3 |
| 5.3 | Installer waiting has no deadline and can prevent profile restoration indefinitely. | U15 |
| 5.4 | A deadline while reading a WebDriver response body is classified as invalid JSON instead of timeout. | U16 |
| ADD-01 | Cancel returning Installed after commit can hide a subsequent cleanup failure from the acquisition UI. | U8 |
| ADD-02 | v13 memory-stop observation/enforcement misses cold loads and some later load/cancellation phases. | U11 |

### Excluded or conditional register

| Case | Disposition and evidence boundary |
| --- | --- |
| 1.2 | Withdrawn: a PNG target without an admitted XHTML spine fallback does not establish a supported navigation defect. Preserve CAF R6.1 and R8-07 fallback policy; do not add image-document navigation. |
| 1.6 | Contract unresolved, no fix planned: pilot preflight can describe successful checks while CLI exit 2 denies official eligibility. Existing pilot/official paths distinguish these meanings. A new zero-exit contract requires an explicit decision; it is not part of 1.5. |
| 1.9 | Deferred: cross-process optional-package ownership is outside ADR-0046's supported single-instance operation. Do not introduce an interprocess lock or new multi-instance support under this plan. |
| 4.5 | Deferred: CAF R2.2 already identified caller mutation of retained EPUB bytes as an API-ownership decision. The current desktop hands over a dedicated buffer. Do not introduce an additional book-sized copy or transfer contract. |

Do not change frozen corpora, historical benchmark results, installed v7 payload
identity, public locator/IPC schemas, model selection policy or product support
claims merely to make a test pass. No dependency upgrades, general refactoring,
new framework, new telemetry, quality rebenchmark, model download campaign,
signing, antivirus certification or publication is planned.

## Relevant files and documentation

Read [repository guidance](../../../AGENTS.md), [documentation index](../../README.md),
[MVP requirements](../../product/mvp.md), [settings/playback requirements](../../product/reader-settings-and-playback-controls.md),
[architecture overview](../../architecture/overview.md), [system diagram](../../architecture/system-diagram.md),
[roadmap](../roadmap.md), [change-review policy](../../development/agentic-change-review.md)
and [.agents/PLANS.md](../../../.agents/PLANS.md) before execution.

The completed [M005 plan](../completed/M005-narration-text-preparation.md) and its
roadmap status establish the implemented safe-document-to-narration boundary.
Normalization changes must preserve locator ranges, source spans, cancellation
and bounded work. They do not expand M005's claims into inference or playback.
ADRs [0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
[0063](../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md),
[0070](../../architecture/decisions/ADR-0070-explicit-placement-and-recovery-boundaries.md)
and [0071](../../architecture/decisions/ADR-0071-reader-checkpoint-and-image-lifetime.md)
are particularly relevant.

Production ownership is confined initially to the files named in U1-U16 and
their directly coupled tests. Before each edit, record the exact allowlist and
justify any additional support file. Existing test locations include desktop
Vitest suites beside their modules, EPUB narration/locator/integration suites,
`services/tts/tests/`, the optional-package Rust tests, desktop Node harness tests
and `apps/desktop/tests/browser/`. New cases should extend these seams rather than
create a competing test framework.

## Architecture and constraints

Keep EPUB text and TTS local; do not persist generated audio or include private
book data in receipts. Preserve bounded queues/buffers, cancellation, explicit
ownership, stable EPUB locators, audible versus visible position authority,
approximately 15 seconds of playable startup lead rather than a fixed delay,
and observable underruns. No planned unit requires a new process or IPC contract.

Use one implementation writer at a time. The coordinator owns scope, execution,
evidence and acceptance. Reuse one independent `change_reviewer` configured as
**GPT-6 Astra, high reasoning** after each implemented case, including cases
sharing a unit. Supply the exact patch, immutable file identities, related older
fixes, RED/GREEN receipts, selected controls and the risk questions in this plan.
The reviewer must inspect possible regressions, omitted branches and weakened
tests, without editing, running tests or delegating. This implements the user's
proposed review step and the repository's required feature/bug review policy.

Pause source writing and Git mutations during review. Resolve actionable findings
and obtain approval for the exact revised patch. Reuse the task, not an approval
after its inputs drift. Missing required evidence or an unavailable reviewer
blocks that case's acceptance. A case may receive approval within its stated
unit scope while batch integration remains explicitly pending; that is not final
campaign acceptance. Finish with one independent review of the combined patch.
Keep at most five active agents including the coordinator; do not replace this
behavior-change workflow with the refactor validator roles.

Preserve all historical plans, raw failures and issued review reports. Store
new public-safe receipts under a new `docs/plans/evidence/five-pass-audit/`
directory during execution; keep raw logs, host paths and process details in
ignored local evidence. Do not create those execution receipts as if work had
already run.

## Milestones

### M0: Planning and historical evidence inventory

Prepare this closed register, inspect available historical receipts, identify
reuse candidates and invalidation rules, create the planning branch, review and
commit only this plan and its indexes. No runtime edits or product tests.

Status: planning and documentary checks complete. The local planning commit is
recorded in Git history; implementation remains not started.

### M1: Revalidate each case and freeze its smallest work order

On a later execution request, record HEAD, worktree/index state, tool versions
and any unrelated changes. Recheck each case at the named functions and existing
contracts. For each unit, add only the regression cases needed to discriminate
the failure, then obtain an attributed RED on the current implementation before
production changes. Infrastructure or fixture failures do not count as RED.

Reuse older fixture construction and synchronization barriers where applicable.
Prefer explicit deferred operations/events over timing sleeps. Document natural,
controlled and modeled observations separately. If a case does not reproduce,
record its actual disposition and rationale; do not force a patch. If a different
defect is discovered, first determine whether it is necessary to resolve the
retained case; otherwise record a follow-up outside this scope.

### M2: Apply bounded corrections with per-case independent review

The following units group shared implementation and test preparation. They do
not authorize one broad rewrite or allow acceptance of an unreviewed case.
Execute U1-U8 as the product batch and U9-U16 as the tooling batch, sequentially;
run U16 before any final native acceptance because the driver is a harness input.

#### U1: Navigation and recovery identity — 1.1, 3.1, 4.1

- Files: `apps/desktop/src/tts/product-narration-coordinator.ts`; inspect its
  `ReaderPublication.tsx`/`App.tsx` consumers before changing emitted events.
- Earlier navigation fixes covered already delivered requests and restart
  completion/rejection. DCR-01 covered Stop during recovery, not the canceled
  recovery's next ordinary Play location; opening-position warm-failure tests
  do not cover a first attempt at a later locator.
- 1.1: give a superseding chapter navigation a new identity/revision while
  preserving shared containment and play/pause intent. Invalidate both delayed
  boundary and paragraph-leaf emissions. Do not duplicate Stop/close work.
- 3.1: distinguish no audible checkpoint from a real checkpoint; capture the
  attempted start as recovery fallback without overwriting actual heard progress.
- 4.1: publish visible-location authority only at genuine navigation settlement.
  Canceling recovery must not leave its proposed location as visible; restoring
  an old snapshot must not overwrite a newer manual location.
- Controls: delayed Stop, old boundary/leaf then new chapter, paused/playing and
  session replacement; open A/start B/fail before audio/recover B; heard A/view B/
  recover/Stop/Play B, including later manual C. Use coordinator and Reader tests.

#### U2: Initial playback admission — 3.2

- Files: `apps/desktop/src/tts/adaptive-buffer-scheduler.ts`, with
  `pcm-playback.ts` inspected as its consumer. Earlier paused-backend and DCR-24
  arithmetic corrections did not cover a rate change before first allocation.
- Re-evaluate the initial lead until a unit is actually allocated. A preallocation
  state refresh must not permanently commit startup. Do not delay commitment to
  a later audible receipt or rewrite the active-unit speed contract.
- Reproduce Prepared with 45 source seconds at 0.75x, then 1x before allocation.
  Preserve Quick, short completed tails, explicit Play available, refill, Pause
  and rate changes after allocation. Use scheduler/PCM tests and one controlled
  worklet/browser integration case in the final product batch.

#### U3: Reader event provenance and placement — 5.1, 5.2

- Files: `reader/segment-highlight-controller.ts`, `reader/active-visual-locator.ts`,
  `reader/ReaderPublication.tsx`, and inspect both persistence save coordinators
  under `apps/desktop/src/` before choosing the minimal subset to edit.
- 5.1 is before follow settlement: RPI-01 and earlier Stop tests protect settled
  geometry, while EBC's modeled resize order is a different observation.
  Track the origin of the automatic scroll at initiation so its delayed event
  cannot erase heard progress after Stop. Do not restore stale geometry after a
  real manual scroll or globally suppress passive reading updates.
- 5.2: preserve explicit pointer/focus placement ownership across an unrelated
  narration-boundary render. Clear it on leave, document replacement and disposal;
  do not freeze the actual reader location.
- Require controlled real-DOM late-scroll/Stop/reopen and manual-scroll controls;
  test hover B while audible/visible A advances, with no actual viewport motion.
  Reuse the RPI synthetic image fixture and existing Reader/persistence tests.

#### U4: Image queue ordering and observations — 1.3, 2.4

- Files: `apps/desktop/src/reader/images/publication-raster-image-loader.ts` and
  `SemanticRasterImage.tsx`. RPI-02 recycled ready near-viewport capacity; it did
  not establish visible priority when a populated FIFO queue is dispatched.
- 1.3: select current visible demand at dispatch, including visible work waiting
  outside a full queue. Preserve FIFO among equal priorities, the existing single
  decode owner, eight pending/eight retained sources and 16,777,216 aggregate
  pixels. Do not introduce starvation loops, duplicate work or needless aborts.
- 2.4: consume the latest matching entry separately for each observer, then
  combine visible/near state. Do not add geometry polling or a second cache.
- Test a held decode plus queued prefetch followed by visible demand, viewport
  changes before dispatch, full-queue capacity, coalesced entry orders and stale
  callbacks after disposal. Keep RPI disposal/error/eviction assertions intact.

#### U5: Current narration normalization — 1.4, 2.5

- File: `packages/epub/src/narration/narration-bilingual-normalizer.ts`, with
  public narration preparation/source mapping tests. Leave frozen normalization
  v1 and historical corpus authority unchanged.
- 1.4: extend bounded range-neighbor recognition to `18–20 °C` and `18 - 20 °C`
  under ADR-0063. Earlier DCR-09 and related corrections protected different
  numeric continuations/two-unit ranges. Preserve the whole ambiguous range;
  distinguish a real negative Celsius value in prose from a range.
- 2.5: enforce structural language/script/region/variant ordering and duplication
  rules for supported primary languages. CAF R8.3's singleton handling does not
  reject `en-12`, `en-US-US` or `en-ab12`. Avoid an IANA/network dependency.
- Preserve `es-419`, admitted grandfathered tags such as `en-GB-oed`, extensions,
  private use, code-point offsets, locator ranges and cancellation budgets. Use
  normalizer controls plus existing integration preparation cases; do not copy
  every frozen corpus test into a new suite.

#### U6: Empty fragment resolution — 4.2

- File: `packages/epub/src/locator/target-resolver.ts`. R8-07 fallback and query
  handling fixes do not establish equivalence of absent and empty fragments.
- Resolve an empty fragment to the admitted document start without a false
  missing-target warning. Preserve missing nonempty target recovery, repeated
  spine occurrences, aliases and unsupported-resource policy from excluded 1.2.
- Extend resolver and existing publication/navigation integration tests with
  synthetic `chapter.xhtml#` references; no external EPUB is needed.

#### U7: Reset/profile settlement — 3.3

- File: `apps/desktop/src/settings/narration-settings-actions.ts`; inspect
  `tts/hardware-profile-compatibility.ts` and existing settings controls.
- DCR-23 refreshed explicit language changes; Reset can still select against the
  previous check. Refresh compatibility before settling the reset coordinator,
  using the existing language-change ownership pattern where compatible.
- Test a supported development host changing language back to English with a
  saved Aiden preference, subsequent refresh and Play identity; also failed Stop,
  stale reset completion and explicit user preferences. Do not admit a new host
  or require a real Qwen load for this profile-selection regression.

#### U8: Optional-package action ownership — 2.1, 2.2, ADD-01

- Files: `tts/optional-chatterbox-client.ts`, `tts/OptionalChatterboxControls.tsx`,
  `settings/narration-settings-actions.ts` under `apps/desktop/src/`, and
  `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` as needed.
- Preserve earlier action-generation protections, the installed commit point,
  explicit cleanup recovery and Stop-rejection behavior. Installed with
  `worker_active` during backup/staging cleanup is an intentional native state.
- 2.1: keep acquisition ownership across selection and settings remount. Prevent
  identity replacement during Confirming/downloading; do not republish stale
  results after a newer action merely to repair the UI.
- 2.2: reject a busy Remove before frontend Stop. For native callers, reserve
  removal ownership before stopping the supervisor, release the operation mutex
  before awaiting, respect lock order and roll back reservation if Stop fails.
  Do not move the install commit point or delete files before successful Stop.
- ADD-01: if Cancel races after commit and returns Installed, retain the paired
  acquisition completion. After both settle, obtain one fresh read-only snapshot
  if that action is still current. Do not reuse a stale coalesced poll. This
  exposes later cleanup failure without converting committed installation into
  cancellation or reviving an obsolete terminal result.
- Use preflight/promotion/cleanup barriers, both Cancel/download completion
  orders, precommit cancellation, a newer action, remount, and Stop-failure
  controls. Verify installed bytes survive cleanup failure. Existing TypeScript
  client/settings tests and Rust package tests supply the principal evidence.

#### U9: Benchmark subprocess result containment — 1.5

- File: `services/tts/benchmarks/cli.py`; extend `test_benchmark_cli.py`.
  Earlier child Job/deadline containment did not bound `communicate` capture or
  require a successful process exit when a parsed payload says PASS.
- Bound stdout while reading, discard or bound stderr without retaining private
  content, and retain one absolute deadline plus owned process-tree cleanup.
  Accept PASS only with the expected child exit; preserve a legitimate FAIL
  receipt and its exit semantics. Leave excluded pilot-preflight case 1.6 alone.
- Use synthetic child processes for oversized output, concurrent streams,
  timeout, malformed output and PASS/nonzero exit. No inference/model benchmark.

#### U10: v5 monitor finalization — 1.7

- Files: `services/tts/benchmarks/dual_worker_official.py` and inspect `memory.py`.
  DCR-18 corrected related v13 ownership, not this v5 monitor.
- Give final sampling and probe closure one owner; a bounded join timeout must
  preserve/report live ownership instead of closing a probe under that thread.
  Keep errors observable and prevent concurrent handle-cache mutation.
- Test blocked sample, timeout, late release, failed final sampling and exactly
  once closure through the existing dual-worker/memory test families. Do not
  claim a historical v5 measurement was invalidated without evidence.

#### U11: v13 cancellation proof and memory stop — 2.3, ADD-02

- Files: `services/tts/benchmarks/batch_official.py`, its batch result/CLI
  consumers, and adapter load containment only if required by the work order.
  DCR-08/17/18 addressed cleanup and monitor ownership; they do not prove
  cancellation phase admission or monitor all cold/load phases.
- 2.3: require an observable accepted-work identity/phase, actual invalidation
  and the publication gate. Distinguish expected cancellation from unexpected
  exceptions; a thread start, elapsed interval or idle acknowledgment is not
  proof. Exercise before-dispatch, in-flight and after-first-output boundaries
  without manufacturing successful outcomes from empty output collections.
- ADD-02: activate the safety observer before cold loading, enforce stop before
  every new factory/load/dispatch, and contain/reap active loads even without a
  generation request ID. Retain candidate-before-monitor cleanup order and all
  failures. Separate the safety window from the frozen measurement window.
- Before editing, distinguish mutable execution fixes from changes to frozen
  derivation/measurement authority. If proof fields, windows or acceptance
  semantics require a successor, record that decision and create the next
  available version; do not rewrite v4/v13 historical authority or results.
  Early stop with missing cold trials is explicitly non-derivable, not fabricated
  completion or automatic CPU admission.
- Model-free batch/adapter/monitor tests must prove stop during cold load,
  measured load and successive cancellation trials, no next work, unexpected
  exceptions rejecting PASS, publication suppression and exactly once cleanup.
  This unit does not recertify real-hardware v13 performance.

#### U12: Release entrypoint and receipt equivalence — 1.8, 4.4

- Files: `scripts/build-windows-release.ps1` and
  `apps/desktop/scripts/windows-release.mjs`; extend its Node test suite.
- DCR-05 rejected the legacy lifecycle claim in Node but left the wrapper's
  argument boundary. Reject that option before build/checksum/evidence work;
  only a genuine lifecycle receipt can establish the lifecycle result.
- Compare receipt objects by exact key sets and values independent of insertion
  order. Keep step arrays ordered, field strictness, numeric values and artifact
  hashes intact. Test reordered objects, extra/missing fields and changed steps.
- Exercise the PowerShell argument boundary with a synthetic invocation that
  proves no expensive child work starts. Do not build an installer per case.

#### U13: Target-specific release inventory — 3.4

- Files: `scripts/release_inventory.py`, its release dependency graph tests,
  and generated inventory/notices only through their established generators.
- Current inventory identifies an ONNX Runtime macOS arm64 wheel although the
  core lock admits Windows x64 CPython 3.12. Earlier core upgrades established
  correct installed runtime behavior, not correct wheel selection in this writer.
- Select the artifact using the declared target, interpreter/ABI and compatible
  universal tags; fail explicitly on unresolved ambiguity. Preserve any explicit
  source-distribution identity meaning instead of silently relabeling it.
- Test Windows-specific, universal, source and unsupported/ambiguous choices.
  Regenerate and check inventory. Changed notices can change core/package
  identity: rebuild only the affected core and final installer once, then bind
  later evidence to those new bytes. Never hand-edit generated JSON.

#### U14: Authority-file transaction — 4.3

- File: `services/tts/src/voxleaf_tts/packaging/chatterbox_v7_authority.py`;
  extend `services/tts/tests/test_chatterbox_v7_authority.py`.
- Existing builder directory transactions do not cover this receipt/manifest/
  evidence three-file write. Stage the closed set, validate before replacement
  and restore originals after a catchable partial-write failure. Retain recovery
  material and report rollback failure truthfully.
- Inject failures at each replacement and rollback, using temporary fixtures;
  verify original bytes and unchanged successful generated content. Do not
  claim multi-file power-loss atomicity or concurrent publication support. Do
  not regenerate accepted v7 authority merely to exercise the writer.

#### U15: Bounded installer ownership — 5.3

- File: `scripts/test-windows-package-lifecycle.ps1`, with its existing Node
  harness coverage. The earlier lifecycle journal/uninstaller deadline does not
  bound the installer's descendant wait.
- Bound the owned installer tree, including descendants; a parent-only wait is
  insufficient. Keep process handles/identities and the restoration journal,
  terminate/reap only owned work, and verify restoration after failure. Never
  destroy a preexisting backup to make cleanup appear successful.
- Synthetic installer descendants prove timeout and restoration without hanging
  the actual installer. Perform one final canonical lifecycle run on the final
  installer; retain separate command and outer-restoration outcomes.

#### U16: WebDriver body timeout classification — 5.4

- File: `apps/desktop/scripts/native-webdriver-client.mjs` and its Node tests.
- Apply deadline classification to body-read rejection as well as `fetch`, with
  user cancellation retaining precedence and cleanup using its independent
  signal. Both existing paths already abort; do not describe this as a new
  process-containment defect.
- Test received headers plus pending body at deadline, user cancellation and
  malformed JSON. Unit evidence is sufficient for this isolated classification;
  changing this shared harness invalidates dependent native receipts and must
  precede the final native batch.

### M3: Combined acceptance and documentation closure

Run the selected combined gates after the last relevant source/harness edit.
Assess evidence reuse explicitly, obtain independent review of the exact
combined patch and satisfy every retained case's final disposition. Update
affected behavior/developer documentation and verify the canonical diagram;
change it only if actual boundaries or flows changed. Any durable new contract
requires an ADR and its corresponding tests.

The coordinator, not a worker/reviewer, decides closure. Pending batch gates,
unproven host restoration, missing reviewer evidence or a retained unresolved
case prevent completion. Archive this plan and update indexes only after
acceptance. Further Git actions remain subject to the execution request's
authorization; this plan does not grant push, PR, merge or publication rights.

## Testing and benchmark strategy

### Historical results inspected and reuse assessment

No product tests were run to prepare this plan. Historical PASS means PASS for
its recorded snapshot, command and environment. The following evidence is
useful without rerunning each predecessor's entire campaign:

| Evidence | Recorded result | What can be recycled; what cannot |
| --- | --- | --- |
| RPI implementation and closeout | 1,246 Vitest + 223 Node tests; 68 Chromium cases; native startup, Chromium/native resource checks and TypeScript checks. Closeout independently matched 446 input identities. | Reuse fixtures, test structure and baseline observations. The old aggregate is not a current combined PASS: the planning hash comparison found three changed inputs, listed below, and planned U1-U4/U7/U8/U16 changes invalidate affected gates. |
| RPI CI diagnostic review, `RPI-CI-CR-R1-20261110` | Native harness 54/54 after retained RED 53/54; five directed image cases on pinned Chromium and temporary Chrome 131; local WebView2 157 startup and static checks. | Use the later harness baseline instead of attributing these changes to the older aggregate. The report explicitly does not establish the cause or repair of the remote WebView2 131 timeout. Do not repeat the temporary Chrome 131 experiment without a new need. |
| DCR integrated acceptance, `DCR-G12-R2-ASTRA-20261110-01` | Focused EPUB 406, desktop 648, Python 171 and Node 148; later affected Node/harness gate 125. Rust default 187 and release 186, with nine ignored in each. Directed browser, native/Piper, optional admission, installer and static gates are separately attributed in its ledger. | Reuse existing regressions and immutable package/model assets after verification. Each result stays bound to its own input set; the later 125-test gate does not replace unrelated earlier Node coverage. Changed coordinator, normalizer, package ownership, benchmark and release paths require affected new evidence. |
| DCR G9/G10 and documentary closeout | Canonical optional admission/lifecycle commands exit 0; outer wrappers exit 1, with separately verified host recovery. No new v13/handoff hardware measurement and no inference in G9. | Reuse the journal, capture methods and unchanged assets. Preserve wrapper failures and restoration evidence; never flatten the record to an unconditional PASS or treat admission as inference. |
| CAF and EBC | Attributed focused RED/GREEN and later reviews are recorded in their ledgers/command lists. CAF `G3-final` aggregate exit 1 is not accepted: only its attributed 14 passing suites/505 tests and separately reviewed App evidence have their stated scope. | Reuse regression cases, fixture seams and historical explanations. Their older inputs do not grant acceptance for this campaign's adjacent variants. Modeled geometry evidence remains modeled. |

During planning, the retained local RPI snapshot
`tmp/evidence/rpi/final-test-inputs-r2.json` was readable and retained SHA-256
`07fdea9d54a99226937dfd11e69a7f6e7d4dc621234bbace8b7cf60998545376`.
A normal-host read-only comparison found **443 matching file hashes out of 446**.
The three changed paths were:

- `apps/desktop/scripts/native-smoke.node-test.mjs`;
- `apps/desktop/scripts/native-smoke/reader-scenarios.mjs`;
- `apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts`.

Those paths are covered by the later RPI CI diagnostic identity manifest; this
planning observation does not itself establish equality with that later
manifest, glob membership or current environment equivalence. The older desktop
log, later native log and DCR closeout manifest were also present locally.
Availability is not permission to reconstruct missing original input proofs.

### Rules that minimize execution without weakening evidence

1. Apply the complete input/environment proof in the canonical
   [validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
   to evidence reuse, without importing a refactor campaign or its role workflow.
   Identify the original immutable receipt, exact command, outcome and covered
   invariant. Compare the original captured source/transitive imports, tests,
   fixtures, configuration, locks, runner/build artifacts, directory/glob
   membership and relevant environment. Include HEAD where the command stamps it.
2. A matching individual leaf gate can be reused only with this proof and a new
   independent assessment naming the original receipt. Do not infer a narrower
   execution from a broader aggregate when no separately attributable result
   exists. Missing evidence, changed consumed input, harness drift or relevant
   host drift requires rerunning that affected gate, not every unrelated gate.
3. Reuse immutable fixtures, model weights, verified runtime downloads and
   package caches separately from test-result reuse. Recheck their required
   manifests; do not reacquire them merely because a new unit starts. U13 can
   invalidate the generated Piper core and installer while leaving upstream
   downloaded assets and the optional v7 package reusable.
4. Each reproduced case needs focused RED then GREEN plus neighboring controls.
   Cases sharing a module share setup and integration preparation, not invented
   REDs. Keep one current gate ledger; rerun a previous case only when a later
   change affects its dependency closure or leaves a concrete concern.
5. Run the final union of affected tests once per unchanged input set. Expand
   aggregate scripts and deduplicate only identical leaf commands, arguments,
   inputs, environment and build requirements. Report the leaves actually run;
   never claim `check`, `check:portable` or a full suite ran when it did not.
6. Run all tests/checks in normal local PowerShell outside the managed sandbox,
   using repository-pinned Corepack pnpm **11.15.1** and locked Python tools.
   Verify nested processes resolve the same pnpm. Sandbox exploration never
   supplies acceptance. Record exact commands, UTC times, exits and identities.
7. Run inexpensive focused/static checks before expensive host preparation.
   Native, audio/GPU and installer operations have one owner and run sequentially.
   Use bounded waits and restoration journals. Permit at most one diagnosed
   infrastructure retry per failed stage; keep failures and successful recovery
   distinct. Do not retry until green or kill processes by a broad name match.

### Gate selection and existing command entrypoints

These are planned commands, not execution receipts. Before invoking them,
reconfirm the repository definitions and expand each selected test-file list in
the ledger. Prefer configured runners with specific existing suites/test filters
over repeating complete package suites after every case. Added regression files
or harness scenarios must exist and be reviewed before they are used.

| Gate | Selection and command entrypoint | When required |
| --- | --- | --- |
| G0: generated package readiness | `pnpm.cmd build:packages` | Once after the latest EPUB/shared source change before consumers use generated exports; rebuild only after relevant drift. |
| G1: focused desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run` with the selected module suites | U1-U4/U7/U8: coordinator, scheduler/PCM, Reader/locator/highlight/persistence, image loader/component, settings/profile and optional client/controls. Select a case filter for RED; run the affected suite controls for GREEN. |
| G2: focused EPUB | `pnpm.cmd --filter @voxleaf/epub exec vitest run` with selected normalizer, preparation, source/range, resolver and publication suites | U5/U6. Include bounded normalization/source mapping and public navigation controls; do not repeat all EPUB extraction suites without a dependency reason. |
| G3: focused Python | `uv run --project services/tts --locked pytest` with selected `services/tts/tests/` paths | U9-U11/U13/U14: CLI, memory/dual-worker, batch execution/official/authority, release dependency graph/core and v7 authority as consumed. Use synthetic children/threads and temporary artifacts. |
| G4: harness/wrapper tests | `node --test apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/native-webdriver-client.node-test.mjs`; `pnpm.cmd test:native-smoke-harness` only if its consumed inputs change | U12/U15/U16; include new synthetic PowerShell timeout/argument tests. Do not run this node list again through the desktop aggregate on identical inputs. |
| G5: native package logic | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests` and the same command with `--features release-locked-runtime` before the test filter | U8, focused under both relevant feature sets. Expand to `pnpm.cmd test:rust` only if shared supervisor/protocol changes invalidate broader coverage. No ignored GPU test is silently counted here. |
| G6: directed Chromium | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts reader-image-lifecycle.smoke.spec.ts` | One final product batch after G0, including the new controlled U1-U4/U6 scenarios. Narrow with existing test selection if it still covers every affected invariant; do not add the full 68-case browser suite by default. |
| G7: native reader and inference | `pnpm.cmd test:native-startup`; the two selected Piper portfolio leaf commands below | Fresh final native evidence for rendering/event order and shared coordinator/normalization behavior. Keep the existing portfolio preflight and process/firewall cleanup assertions. Use `pnpm.cmd test:tts:reader-corrections-host` only if its four Piper/Chatterbox language arms cover an otherwise unproven engine-dependent responsibility; avoid running overlapping arms twice. |
| G8: optional admission | `pnpm.cmd test:chatterbox:v7:local-admission` | Once after final U8 native changes, using verified existing assets. Admission/cleanup assertions do not claim successful inference. Add an existing packaged acquisition journey only if unit/native admission cannot cover a retained runtime ownership boundary. |
| G9: release artifacts | `pnpm.cmd inventory:release`, `pnpm.cmd inventory:release:check`, `pnpm.cmd package:piper-core`, `pnpm.cmd package:piper-core:check`, `pnpm.cmd package:windows:verified-core`, `pnpm.cmd package:windows:lifecycle`, `pnpm.cmd package:windows:check` | Regenerate only when U13 changes output, build/check one final core, then one final installer and lifecycle receipt after U12/U13/U15. Reuse exact checked core bytes in verified-core packaging. Preserve original user state and inspect outer cleanup separately. |
| G10: resource regression | `pnpm.cmd benchmark:reader`; `pnpm.cmd benchmark:reader:native` | One final run of each after U3/U4/U16, following the setup/testing policy for reader restoration, image lifecycle and native driver changes. Reuse verified preparation and earlier unchanged leaf evidence where eligible; do not repeat these benchmarks per finding. Omit only if revalidation withdraws every case affecting this gate. No model performance/quality matrix. |
| G11: static checks | `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript`; Python `format:check:python`, `lint:python`, `typecheck:python`; Rust `format:check:rust`, `lint:rust` through `pnpm.cmd` | Once per final affected language/configuration; reuse earlier unit leaf evidence only with complete unchanged-input proof. TypeScript type checks already prepare package builds; deduplicate G0 only when inputs match. |
| G12: documentation/evidence and review | `pnpm.cmd check:evidence`; `git diff --check`; relative-link inspection; independent exact-patch review | Planning documentation and final closure. Run `pnpm.cmd test:evidence` only if the checker/tests/consumed fixtures changed or no eligible receipt covers a required gate. Never rewrite old evidence to pass whitespace/link checks. |

For G7, the service-only `test:tts:bilingual-profiles-exact-host` is insufficient
for reader/coordinator behavior. The existing portfolio runner supports
`--profile`/`--language` selection and retains per-arm process/firewall cleanup.
After the relevant configured preflight checks and one current native build,
execute these existing runner leaves from the repository root:

```powershell
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en
```

The same selected arguments with `--preflight-only` check each arm's required
environment. Expand and record the configured portfolio preflight's applicable
leaf checks, including its harness tests, rather than running its six-profile
wrapper blindly. Its model-free lifecycle leaf can replace an otherwise
identical startup invocation only with the complete command/input/environment
proof; otherwise retain G7's canonical startup command. Report selected arms,
not the full six-arm portfolio. The existing `reader-corrections-host.mjs` runs
four arms and has no equivalent profile filter. Neither service-only tests nor
optional admission prove reader behavior. If the native/browser harness cannot
observe a retained behavior, add one bounded scenario there and run it; do not
report an unrelated smoke as proof.

Independent gates may share an unchanged build but must record its exact
identity. The default native build and release-locked installer are distinct
artifacts unless proven otherwise. A successful metadata/package check cannot
replace runtime behavior evidence. Actual installer bytes may force fresh
lifecycle evidence even when most upstream model assets remain unchanged.

## Risks and rollback

- Navigation, recovery and persistence share temporal authority. An apparent
  simplification can revive stale work or overwrite a real manual move. Preserve
  generation/identity checks and the heard/visible/attempted-start distinctions.
- Optional-package cleanup intentionally continues after Installed. Do not
  change the commit point to hide busy-state or stale-client symptoms; preserve
  both committed data and explicit failure visibility.
- Resource safety fixes must not introduce blocking waits, queue growth or
  another cache. Benchmark PASS must remain a statement supported by observed
  work, not merely a timer or a successfully parsed payload.
- U11 may require a versioned authority decision. Record it before implementing
  changed meaning; leaving that work pending is more accurate than silently
  modifying accepted historical authority.
- Stage multi-file authority writes and installer operations with verified
  recovery material. A rollback failure is a failure with preserved recovery
  information, not a reason to delete the only original copy.
- Keep each unit's patch and predecessor identities. To reject a patch, restore
  only that writer's allowlisted changes while preserving unrelated user work;
  never use a blanket reset/clean. Reassess dependent accepted units after any
  rollback or shared-file edit.
- Host time and model/package preparation are the dominant avoidable costs.
  Reserve expensive gates for the final relevant patch and reuse verified assets;
  do not trade away necessary behavioral evidence to reduce the test count.

## Progress log

- 2026-11-11: Reconciled the chat's original 27 cases and two related cases into
  25 retained candidates and four excluded/conditional dispositions. No product
  tests executed; all runtime findings remain subject to reproduction.
- 2026-11-11: Inspected historical plans, attributed command/review records,
  current configured runners and local evidence availability. Compared the 446
  captured RPI file hashes; found the three later harness/test changes above.
  This is an evidence inventory, not new runtime acceptance.
- 2026-11-11: Created `codex/five-pass-audit-plan` from the clean planning base.
  Prepared this plan and the active/documentation indexes. Implementation has
  not started.
- 2026-11-11: Normal-host documentary checks passed: evidence retention, working
  diff whitespace, 262 relative links, all 12 required sections and the unique
  25-retained/four-excluded case register. No product test command was run.

## Discoveries and decisions

- Many cases share a module or vocabulary with earlier corrections but exercise
  a different ordering or boundary. Keep the exact predecessor controls and
  reproduce the new trigger instead of assuming either automatic duplication
  or automatic validity.
- Accepted the proposed Astra High reviewer after each applied correction,
  plus combined final review. Reusing one reviewer avoids unnecessary agent
  setup while retaining independent code/evidence assessment.
- Historical result reuse is conditional on original input/environment proof.
  The RPI snapshot's three changed inputs demonstrate why whole-campaign PASS
  reuse would be unsound. Fixture/asset reuse is available independently.
- Cases 1.2, 1.6, 1.9 and 4.5 receive explicit dispositions rather than silent
  compatibility, CLI or memory-ownership expansion. A later contract decision
  can reopen them through a separately justified change.
- No full repository suite after every case, no repeated native/model matrix,
  and no benchmark publication is planned. Selected combined checks remain
  mandatory where the affected responsibility requires them.

## Final validation results

Planning only. No runtime source, test, dependency, generated artifact,
architecture contract or historical receipt has been changed. No product tests
or implementation milestones have been executed.

The normal-host historical hash inspection completed successfully and found
443 matches/three differences; it is not a test PASS. Planning validation in
normal local PowerShell:

- `.\tmp\rpi-tools\pnpm.cmd --version`: `11.15.1`, confirming the existing local
  pinned shim used for the following command.
- `.\tmp\rpi-tools\pnpm.cmd check:evidence`: exit 0, evidence retention passed.
- `git diff --check`: exit 0 for the working diff; the new file is additionally
  included in the staged whitespace check before the authorized commit.
- Read-only document inspection: 262 relative links, zero missing targets;
  12 required sections, 25 retained cases, four excluded cases and 29 unique IDs.

The commit scope is exactly this plan, `docs/plans/active/README.md` and
`docs/README.md`. Git history supplies the planning commit identity. No push or
PR is requested. None of these documentary results accepts runtime behavior.

Future execution must replace this pending implementation status with actual
case dispositions, attributed executed/reused gate results, artifact identities,
host restoration status and immutable independent review IDs. Do not mark the
plan complete while any required case, evidence or integration gate is pending.
