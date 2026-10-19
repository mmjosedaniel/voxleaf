# Bounded TypeScript function readability

Status: completed on 2026-10-19. TFR-01, TFR-02 and TFR-05 implemented and
independently accepted; TFR-03 and TFR-04 accepted SKIP. Combined gates and
independent host restoration passed. Changes remain unstaged and uncommitted.
Prepared on 2026-10-19 from clean `main` at
`8f0d156196cd44130b0acf5816df92466c2f8972`.
Implementation branch: `codex/typescript-function-readability`.

## 1. Goal

Audit five focused TypeScript/TSX readability proposals using meaningful
domain names, private functions and existing predicates. Reduce repeated rules
and make orchestration readable without adding generic frameworks or changing
behavior. This maintenance work spans desktop narration, reader synchronization
and secure EPUB ingestion; it does not reopen completed roadmap milestones.
Final outcome: three bounded improvements and two evidence-backed SKIPs.

## 2. User-visible outcome

Readers retain the same EPUB admission, profile availability, narration startup,
state notifications, cancellation, highlighting, navigation and cleanup.
Contributors can locate the shared identity/admission rules and package navigation decision by name.

This is a maintainability change, not a feature or a claimed performance gain.
The execution request authorized implementation, validation, minimal environment
recovery and documentary closeout, while expressly excluding staging, commits,
push and PR. Work remained on the existing branch at HEAD
`2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`; the index remained empty.

## 3. Current state

The review inventoried 281 tracked TypeScript/TSX files and inspected selected
responsibilities and existing tests. It was a static review, not an exhaustive
audit or a runtime baseline. These initial observations were refreshed by the five retained audits before implementation.

| Unit | Observed maintainability problem | Proposed bounded change |
| --- | --- | --- |
| TFR-01 | `apps/desktop/src/tts/process-client.ts` repeats the foreign-service predicate in `start`, `prepare`, `health`, `cancel` and `shutdown` (around lines 328, 357, 379, 485 and 515). | One private pure `hasForeignServiceInstance` helper; retain each operation's distinct response checks. |
| TFR-02 | `apps/desktop/src/tts/hardware-profile-compatibility.ts::selectProfile` repeats the compatibility, support-state and language predicate already implemented by `admittedForLanguage`. | Reuse that existing predicate while retaining exact profile identity and persistence guards. |
| TFR-03 | Two effects in `apps/desktop/src/reader/ReaderPublication.tsx` (around lines 648-685) combine subscription wiring, initial reconciliation and cleanup. | Two named internal bindings for paragraph leaves and segment highlighting. |
| TFR-04 | `apps/desktop/src/tts/product-narration-coordinator.ts::#execute` combines action dispatch with service startup and preparation details. | Private `#startService` and `#prepareService` phase methods, consistent with existing narration/synthesis methods. |
| TFR-05 | `packages/epub/src/package/package-document.ts::buildParsedPackage` embeds EPUB 2/3 navigation selection among manifest validation, guide checks and spine assembly. | One private `resolvePackageNavigation` function in the same file. |

Retain deliberate differences. The start/language preference repositories have
different defaults, migrations and validation order. The reader-position save
queues carry different checkpoint policies. Explicit finite message/error
mappings are already readable. The historical narration normalizers are frozen
evaluation authority; their duplication with additive profiles is intentional.
These areas are excluded, not additional cleanup targets.

## 4. Scope and non-goals

The integration batch is `TFR-BATCH`, containing five disjoint implementation
units. Each has high risk because its existing responsibility includes protocol,
profile selection, synchronization or secure parsing; small diffs do not lower
that classification. The documentation-only planning patch is low risk.

Paths below are repository-relative and are closed candidate allowlists.
Existing tests may remain unchanged when their assertions cover the extraction.
A fresh audit and passing baseline must precede each immutable work order.

| Unit | Closed candidate allowlist | Maximum added plus removed lines |
| --- | --- | --- |
| TFR-01 | `apps/desktop/src/tts/process-client.ts`; `apps/desktop/src/tts/process-client.test.ts` | 180 across two files |
| TFR-02 | `apps/desktop/src/tts/hardware-profile-compatibility.ts`; `apps/desktop/src/tts/hardware-profile-compatibility.test.ts` | 60 across two files |
| TFR-03 | `apps/desktop/src/reader/ReaderPublication.tsx`; `apps/desktop/src/reader/ReaderPublication.test.tsx`; proposed `apps/desktop/src/reader/narration-bindings.ts`; proposed `apps/desktop/src/reader/narration-bindings.test.ts` | 320 across four files |
| TFR-04 | `apps/desktop/src/tts/product-narration-coordinator.ts`; `apps/desktop/src/tts/product-narration-coordinator.test.ts` | 320 across two files |
| TFR-05 | `packages/epub/src/package/package-document.ts`; `packages/epub/src/package/package-document.test.ts` | 180 across two files |

No other production, test, configuration, dependency or versioned generated
file is authorized. Before the first baseline, check shared mutable source/test
outputs across units. Unchanged shared imports do not require combining units.
Newly discovered mutable overlap requires replanning before edits; never create
a retrospective baseline on an already modified shared path.

Planning documentation is limited to this file, `docs/plans/active/README.md`
and `docs/README.md`. Implementation closeout also updates
`docs/plans/completed/README.md` and moves this plan to its completed path.
Concise immutable implementation reports belong under
`docs/plans/evidence/typescript-function-readability/`; raw captures belong in
ignored `tmp/evidence/typescript-function-readability/`. Keep report identities
outside their own validated paths and freeze documentation before its report.

Non-goals: Redux/Zustand, a generic repository/subscription/state-machine
framework, new dependencies, public APIs, barrels, broad renames, splitting
classes by size, extracting every expression, moving existing test suites,
changing model support, repairing unrelated defects, or rewriting historical
evidence. Do not add a second spine-construction extraction to TFR-05.

## 5. Relevant files and documentation

Read [project instructions](../../../AGENTS.md), [plan requirements](../../../.agents/PLANS.md),
[documentation status](../../README.md), [MVP requirements](../../product/mvp.md),
[architecture overview](../../architecture/overview.md), [system diagram](../../architecture/system-diagram.md)
and [testing guidance](../../development/testing.md).

Use [orchestrate-safe-refactor](../../../.agents/skills/orchestrate-safe-refactor/SKILL.md),
[validate-safe-refactor](../../../.agents/skills/validate-safe-refactor/SKILL.md),
the [contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md),
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md),
[matrix](../../../.agents/skills/validate-safe-refactor/references/validation-matrix.md)
and [compact batch record](../../../.agents/skills/validate-safe-refactor/references/validation-record.md).

Relevant decisions are [local stdio ownership](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md),
[reader synchronization](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md),
[hardware admission](../../architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md),
[secure EPUB ingestion](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md),
[bounded EPUB 2/NCX](../../architecture/decisions/ADR-0048-admit-bounded-epub2-and-ncx-compatibility.md)
and [current model priority](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md).
Retain the [completed M005](../completed/M005-narration-text-preparation.md)
invariants and roadmap status when validating downstream EPUB equivalence;
do not edit its frozen normalization boundary.

Inspect root, desktop and EPUB `package.json` files and the existing
`apps/desktop/scripts/bilingual-portfolio-host.mjs` runner before using the
commands below. Inspect existing controller/source types and direct callers
before choosing binding signatures; no duplicate public contract is needed.

## 6. Architecture and constraints

Keep ownership in the existing component, coordinator, client and package
parser. Preserve local EPUB contents/inference, content-free errors, bounded
queues/audio, cancellation, stale-result rejection, stable locators and zero
default audio persistence. Keep current playback-pause versus invalidating-stop
semantics; do not alter scheduling or interpret audio lead as a fixed delay.

Apply clean-code choices only where they explain an existing responsibility:

- Use domain names such as `expectedServiceInstanceId`, `selectedProfileId`,
  `narrationLanguage`, `unsubscribeAudibleProgress` and `navigationItem`.
  Preserve already meaningful names; avoid `data`, `value`, `flag`, or `result`
  when their role would otherwise be unclear.
- Use verbs for operations and predicates that read as conditions. Name local
  variables only when they explain a decision, identity or lifecycle stage.
  Do not introduce aliases for every property access.
- Prefer private helpers in the current file. Only the reader binding unit
  needs a new internal module. Its two concrete bindings remain distinct;
  a configurable subscription framework would hide their different cleanup.
- Reuse existing types. Add a private type only when it expresses a meaningful
  narrowed result or dependency. No `any`, non-null assertions or casts added
  to bypass safe navigation narrowing, and no public exports just for tests.
- Preserve evaluation, awaiting, state-notification and cleanup order.
  Extracting repeated pure predicates is not authority to reorder effects.
  Do not change error codes, rejection precedence or promise handling.

Review the system diagram at closeout. These private extractions preserve its
component/process/trust boundaries, so no diagram or ADR rewrite is expected.
A discovered architectural or behavior change leaves this plan's scope.

## 7. Milestones

### Milestone 1: Freeze execution scope and establish readiness

Status: complete. Scope, roles, environment recovery and independent shared
baseline03 passed; historical failures remain recorded below.

Confirm branch/HEAD, empty index and clean allowlisted paths; preserve unrelated
work. Reuse one auditor, one worker and one independent validator with the
configured Sol/Astra roles, plus the Git steward when available. Keep exactly
one source writer active, no supporting-agent delegation, and Git idle while
writing or validation runs.

Refresh each unit's audit without forcing a change. Convert accepted findings
to draft orders with the coverage map, closed paths and gates below. Approve
the gate ledger before edits. Run cheap host/tool/model readiness and fast
checks before costly preparation. The validator establishes a focused baseline
on the unit's actual starting state. Any shared expensive baseline must precede
all relevant batch edits and capture complete dependency/environment identities.
Only after a passing baseline issue the frozen work order. SKIP remains valid
if fresh evidence removes the maintainability problem.

### Milestone 2: TFR-01 service identity predicate

Status: implemented and independently accepted; TFR-01-POST-20261019-01 PASS.

Extract a pure module-private `hasForeignServiceInstance` predicate accepting
the existing decoded-control type and expected service identity. Replace exactly
the five repeated predicates. Preserve the `"serviceInstanceId" in control`
guard, response ordering/length/state checks, each error classification and
each operation's failure/containment behavior. No lifecycle helper framework.

Cover foreign identities through public client operations, not direct tests of
the private predicate. Complete the unit gates before accepting this change.

### Milestone 3: TFR-02 profile admission predicate

Status: implemented and independently accepted; TFR-02-POST-20261019-02 PASS.

Keep the requested profile-ID equality and reuse `admittedForLanguage` for that
matched profile and current language. Preserve closed-state and
`canPersistSelection` guards, write count/order, future-version protection and
the saved-result check. Verify that the reused language/profile predicates are
pure before accepting the harmless change in boolean evaluation order.
Do not rename the predicate or extract another wrapper without concrete need.

### Milestone 4: TFR-03 reader narration bindings

Status: audited/SKIP, accepted by the director and independent validator. The current short effects
already expose subscription/reconciliation/cleanup order while controllers own
domain logic. Moving them would add a module boundary without a demonstrated
ownership or verification benefit. Missing characterization assertions are not
defects and do not require extraction. The proposed files remain absent; the
original candidate description below is retained as the evaluated proposal.

Evaluated proposal only (not implemented): introduce `bindParagraphLeafNarration` and `bindSegmentHighlightNarration` in
the proposed `reader/narration-bindings.ts`. Return the existing cleanup
function where applicable, using existing source/controller contracts.

Keep effects and their dependency arrays visible in `ReaderPublication`.
Keep controller creation, DOM mapping, navigation requests, layout refresh,
restoration, focus and disposal owned by their existing code. Subscribe to
state, then audible progress, then reconcile the current observation. Cleanup
unsubscribes progress before state. Only highlighting clears on absent source
and after cleanup; paragraph binding preserves its no-source no-op behavior.
Preserve method receivers and StrictMode/source-replacement behavior.

### Milestone 5: TFR-04 service execution phases

Status: revised audit/SKIP, independently confirmed ordering concern.

The original proposal below is superseded by
[TFR-04-AUDIT-20261019-02](../evidence/typescript-function-readability/TFR-04-audit-skip-02.md).
Awaiting async phase helpers would insert a Promise reaction before final
publication/shared catch, allowing a competing reaction or stop to change
observable ordering. Keeping the original awaits in the dispatcher permits
only small synchronous extractions without enough readability benefit.
No implementation or added tests are authorized for this skipped unit.
This is source-derived reasoning, not a reproduced product defect.

Original proposal retained for decision context:

Move only the `start-service` and `prepare-service` branch bodies into private
phase methods accepting the captured scheduler and run token as needed.
Keep `#execute` as dispatcher and sole owner of its shared catch classification
and final conditional publication.

The startup branch currently returns from `#execute` when no profile or runtime
configuration is available. Those returns skip the final publication. Audit
found that ordinary failure containment also advances `runToken`, so an extra
notification from a naive void extraction has not been demonstrated. Preserve
the existing control-flow boundary regardless: propagate this
early exit explicitly, for example with a boolean named
`serviceStartCompleted`, and return from the dispatcher when it is false.
No new result framework or action class is needed.

Preserve hardware-before-configuration checks, short circuits, availability and
failure updates, begin/publish/start ordering, captured scheduler identity and
every existing run-token guard. Retain prepare completion/recovery behavior and
error propagation to the original catch. Do not change `#prepareNarration`,
`#synthesize`, cancellation, scheduling or player ownership.

### Milestone 6: TFR-05 package navigation resolution

Status: implemented and independently accepted; TFR-05-POST-20261019-01 PASS.

Extract only the navigation decision into `resolvePackageNavigation`, private
to `package-document.ts`. Reuse current raw manifest/navigation types and
return enough narrowed information to construct the same immutable result.

Call it after fallback/media-overlay validation and before guide/spine checks,
at the current decision point. Preserve EPUB 3's exactly-one local supported
XHTML navigation resource and EPUB 2's required `spine@toc`, existing NCX
reference, exact media type, local location and absence of fallback.
Preserve rejection codes/precedence, budget checkpoints, archive reads, spine
ordering, object freezing and transactional failure. Do not add guide fallback
or broaden the accepted EPUB profile.

### Milestone 7: Combined acceptance and documentary closeout

Status: complete. Combined PACKAGE gates and independent host restoration passed.
This plan moved to completed; final documentary binding is recorded in section 12.

Resolve every unit and combined gate with independent current evidence. Review
the complete diff for equivalence, unnecessary indirection, unrelated changes
and prohibited artifacts. Record elapsed phases and remaining limitations.
Move the plan to completed only after implementation and required acceptance;
update incoming links and indexes without leaving a redirect in active.
Use exact-path identity-bound Git orders only within current authorization.

## 8. Testing and benchmark strategy

All acceptance runs use normal local PowerShell outside the managed sandbox,
from the repository root. Static planning observations and historical passing
counts are not current test evidence. Map assertions before adding tests.

| Unit / invariant | Existing coverage to inspect | Concrete test decision |
| --- | --- | --- |
| TFR-01: response identity, ordering, cleanup and cancellation races | `process-client.test.ts`: foreign/reordered startup, invalid binary, one-active request, late-byte zeroing, completion/cancel race and failed shutdown containment. | Add focused foreign-service cases for prepare, health and ordinary cancel if still absent. Assert unchanged public rejection/containment; avoid a private-helper suite. |
| TFR-02: admission and persistence | `hardware-profile-compatibility.test.ts`: admitted selection, rejected profile, wrong language, future preference and capacity re-probe. | No new test solely for predicate reuse when existing assertions cover both callers. |
| TFR-03: subscriptions and synchronization | `ReaderPublication.test.tsx`: cross-chapter audible highlighting without focus theft, boundary navigation, DOM replacement, passive location and StrictMode. | Accepted SKIP: no extraction or new tests. Existing component replacement/unmount and synchronization coverage retained. |
| TFR-04: startup, notifications, stale work and recovery | `product-narration-coordinator.test.ts`: missing configuration, admitted/unsupported language, profile replacement, containment, abort and delayed cleanup. | Accepted revised SKIP: preserve original awaits/publication/catch ordering; no new tests for untouched code. Audit discloses unasserted competing-reaction timing. |
| TFR-05: secure navigation and package equivalence | `package-document.test.ts`: immutable EPUB 3 model, EPUB 2 metadata/NCX rejection table, missing-NCX guide case, fallback limits, cancellation/deadline and transactional failure. | Preserve all assertions. Add a multi-invalid-input rejection-order case only for an identified uncovered ordering risk. |

### Gate ledger

Current acceptance and pending gates are recorded in section 12; original receipt
IDs, durations and reuse decisions are in the linked immutable reports.
Baseline/post below means before editing and after the affected implementation
unit, including high-risk gates before accepting that unit. Accepted SKIPs do
not require edits or additional unit runs and do not waive integration gates.

| Gate / invariant | Existing command or command block, repository-root cwd | Timing | Inputs/environment and invalidation |
| --- | --- | --- | --- |
| G-FAST: format and lint | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript` | Baseline/post every unit; worker fast checks | Discovered source/config membership, formatter/linter config, lockfile, Node/pnpm/tool versions. Any consumed change invalidates. |
| G-BUILD: workspace dependency preparation | `pnpm.cmd build:packages` | After fast checks, before dependent type/test/browser/native work | EPUB/shared source, transitive imports, TS config, package manifests, locks and generated artifacts. Capture artifact hashes; build success is not runtime acceptance. |
| G-DESKTOP: desktop contracts and behavior | `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd --filter @voxleaf/desktop test` | Baseline/post TFR-01 through TFR-04 | Source/transitive dependencies, test/fixture membership, package outputs, Vitest/Node runners, config and tools. Source/test/harness/build drift invalidates affected receipts. |
| G-EPUB: secure parsing and downstream preparation | `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test` | Baseline/post TFR-05 | EPUB/shared source, full synthetic corpus, fixture discovery, budgets, parser dependencies/config/tools and built outputs. Preserve M005 equivalence assertions. |
| G-BROWSER: reader/UI integration | `pnpm.cmd test:browser` | Baseline/post TFR-03 and TFR-05; final combined batch | Desktop plus EPUB/shared build graph, browser tests/config, installed Chromium revision, fonts/viewport where consumed. Source/artifact/browser drift invalidates. |
| G-NATIVE: invocation and packaged startup | `pnpm.cmd test:native-startup` | Baseline/post every unit; prepares current executable before G-HOST | Complete native/frontend build graph, Cargo/JS locks, executable bytes, Windows/WebView2/driver configuration and runner. Capture preparation separately. |
| G-HOST: supported narration lifecycle and synchronization | Filtered portfolio block below, with readiness/preflight first | Baseline/post TFR-01 through TFR-04 | Current executable/frontend artifacts, runners, all transitive source, exact model/runtime manifests, selected profiles, GPU/driver/load/cache and offline/process/firewall state. Unknown or changed conditions require rerun. |
| G-CROSS: combined TypeScript acceptance | `pnpm.cmd typecheck:typescript`; `pnpm.cmd test:typescript` | Combined batch after all source edits | Entire discovered workspace graph, tests/config/locks/tools and built packages. New files invalidate discovery-dependent evidence. |
| G-FINAL: portable and native repository acceptance | `pnpm.cmd check:portable`; `pnpm.cmd check` | Final combined production state | Full script graphs and every consumed source/config/test/artifact/environment identity; retain exclusive portable/native/Rust/Python leaves. |
| G-DOCS: plan/index/evidence consistency | `pnpm.cmd check:evidence`; `git diff --check`; manual links, commands and status review | Planning baseline/post; implementation closeout after docs freeze | Current plan/index paths, Git/index state, evidence guard/discovered paths and linked requirements. Documentation changes require a new review/report. |

G-HOST readiness first runs the existing configured preflight and the three
filtered configuration checks below before expensive native preparation:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es --preflight-only
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en --preflight-only
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --preflight-only
```

After fast checks and G-NATIVE prepare the current executable, run sequentially:

```powershell
node apps/desktop/scripts/bilingual-portfolio-host.mjs --lifecycle-only
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4
```

The final call selects both Chatterbox languages: four supported model/language
arms in total. These are existing runner options, not new commands to implement.
Preserve exact registry IDs despite historical version text. ADR-0051 defers
Qwen model-backed investigation; retain its deterministic tests and existing
code. Do not run or describe the unfiltered six-arm suite as this four-arm gate.

TFR-05 does not change normalization or model/runtime selection; its EPUB,
browser and native gates cover the affected boundary without a new model
benchmark. No new timing benchmark is planned for private predicate/binding
extraction. If audit finds a changed rendering hot path or scheduler behavior,
stop and revise scope/gates; do not assert performance equivalence without proof.

Do not rerun expensive checks simply because another report is needed.
Only the independent validator can reuse a gate with a retrievable immutable
receipt proving identical consumed inputs, discovery membership, artifact bytes
and relevant environment. New HEAD/path identities require a new report, never
an edited old PASS. Shared baselines must predate relevant edits. All high-risk
unit gates remain mandatory; pending integration gates block final acceptance.

Expand the final aggregate script graphs and deduplicate only identical leaves
with satisfied build dependencies and complete reuse proof. Preserve exclusive
leaves and protected-branch CI. When uncertain, execute the original commands;
never report an aggregate as run when only its leaves were executed.

Use configured builders only. During each order, declare exact ignored outputs
for package `dist`/`tsbuildinfo`, desktop `dist`, Rust `target`, test results
and receipts before execution; isolate/capture candidate artifacts before reuse.
No tracked generated output is planned. Unexpected tracked changes or undeclared
mutable output paths stop handoff for scope review; never hand-edit them.
Final aggregate Python/native outputs follow their existing builders and policy.

## 9. Risks and rollback

Primary risks are accepting foreign responses, changing profile admission or
persistence, losing subscription cleanup, publishing an extra startup state,
accepting stale asynchronous work, and changing which malformed-EPUB failure
wins. The coverage map and exact phase ordering address those concrete risks.

Keep failures classified as regression, pre-existing baseline, environment or
harness/cleanup failure. A relevant failing baseline stops source work.
Infrastructure retries require a hypothesis and a changed condition, at most
one retry per failed stage; two source-correction loops maximum before redesign.
Do not reset budgets by renaming a run or expand this task to repair unrelated
model, runner, packaging or dependency problems.

Record run/session/attempt identities and unique receipt paths. Resume a
verified RUNNING gate rather than duplicating it. For long stages record the
runner timeout (portfolio currently 30 minutes per arm), last observable
progress and a diagnostic checkpoint; inspect stalled work without assuming a
live process means progress or automatically restarting it.

Before host mutations, journal owned processes with PID, creation time and
executable identity, task firewall rules and original host state. Verify cleanup
after success, failure or interruption; missing restoration blocks acceptance.
Preserve immutable prepared payloads, isolate mutable baseline/candidate output
and retain failures without book text, audio, private paths or secrets.

Reject out-of-scope changes. Correct or remove only verified task-authored hunks;
never reset, clean or discard user work. Stop before starting another unit with
a rejected patch present. An accepted unit can remain unstaged when source
commits are not authorized; subsequent units must have disjoint clean paths.
Reverting committed implementation requires a separately authorized operation.

## 10. Progress log

Newest entries first. Older pending/blocked statements record their historical
execution state; section 12 is the final result.

- 2026-10-19 closeout: all three implementation units accepted independently;
  two SKIPs retained. [Combined PACKAGE PASS](../evidence/typescript-function-readability/TFR-BATCH-PACKAGE-20261019-01.md)
  resolves the current script graphs, cross-package tests and final native smoke.
  The aggregate builder changed executable bytes, so native startup ran once more
  after all builders (38.476 s PASS); no failed-stage retry or models repeated.
- [Independent cleanup PASS](../evidence/typescript-function-readability/TFR-CLEANUP-20261019-01.md)
  confirms the authorized UAC removal of the exact owned rule, eight original
  rules preserved, no task processes/new profiles/listener, and unchanged tested
  executable/runtime identities. Active plan removed and incoming indexes updated;
  final source diff is five files/260 changed lines with no unrelated work.
- TFR-05 [POST-CHANGE PASS](../evidence/typescript-function-readability/TFR-05-POST-20261019-01.md):
  private navigation resolver, four public precedence cases; 655 EPUB tests,
  seven browser cases and native startup (50.501 s) passed. No correction loop
  or retry; 129 changed lines remain within the approved 180-line ceiling.

- TFR-05 implemented under [TFR-05-WO-20261019-01](../evidence/typescript-function-readability/TFR-05-approved-work-order-01.md)
  after [focused baseline PASS](../evidence/typescript-function-readability/TFR-05-BASELINE-20261019-01.md).
  Same-file navigation resolver and four mixed-invalid precedence cases total
  129 changed lines. Six worker gates passed, including 655 EPUB tests; only
  three declared ignored build outputs changed and public declaration bytes
  remain identical. Director reviewed the exact diff and packet; independent
  browser/native and combined validation are next, with all source frozen.
- TFR-02 accepted under authoritative [POST-CHANGE report 02](../evidence/typescript-function-readability/TFR-02-POST-20261019-02.md).
  Current native (39.113 s), lifecycle (14.734 s), Piper ES (174.284 s), Piper EN
  (175.606 s) and Chatterbox ES/EN (622.393 s) passed without retries. All arms
  had zero external requests/generated audio/retained audio at cleanup. Original
  report 01 is preserved; report 02 corrects the final identity-capture ordering
  with complete gate reuse proof, without repeating runtime measurements.

- TFR-02 implemented under [TFR-02-WO-20261019-01](../evidence/typescript-function-readability/TFR-02-approved-work-order-01.md)
  after [focused baseline PASS](../evidence/typescript-function-readability/TFR-02-BASELINE-20261019-01.md).
  One addition/seven removals reuse the existing admission helper; tests and all
  identity/persistence guards remain unchanged. All six worker checks passed
  (730 Vitest plus 76 Node tests). Director reviewed the patch; independent
  native/lifecycle/model validation is running with source frozen.
- TFR-01 accepted after [TFR-01-POST-20261019-01 PASS](../evidence/typescript-function-readability/TFR-01-POST-20261019-01.md).
  User-released memory was independently confirmed at 13,591/13,598/13,493 MiB
  across three samples. The single revised recovery passed Piper ES (252.089 s),
  Piper EN (173.666 s) and Chatterbox ES/EN (624.979 s). Native/lifecycle and fast
  gates also passed, with explicit unchanged-evidence proof. This recovery is
  consumed; it does not reset retry budgets. No task processes/new profiles remain;
  the owned firewall rule is retained only until final campaign cleanup.

- TFR-01 post-change host gate stopped before inference: Piper was selectable
  but the required alternate Chatterbox profile lacked available RAM. Exact
  requirement is 7,042 MiB; observed post-failure capacity was about 6,420 MiB,
  with sufficient GPU memory. Native/lifecycle and independent diff/fast-gate
  review passed. No task processes/new profiles remain; source is frozen.
  [TFR-HOST-MEMORY-20261019-01](../evidence/typescript-function-readability/TFR-host-memory-replan-01.md)
  records the explicitly revised single recovery path, conditional on user
  memory release and three stable capacity samples. No blind retry, threshold
  change or next-unit implementation is permitted while that condition is pending.
- TFR-01 implemented under
  [TFR-01-WO-20261019-01](../evidence/typescript-function-readability/TFR-01-approved-work-order-01.md):
  private identity predicate at exactly five sites, three new public cases and
  stronger startup observation; 123 changed lines in two files. Worker format,
  lint, build, desktop types and 730 Vitest plus 76 Node tests passed. Complete
  immutable Change Packet/receipts are in ignored
  `tmp/evidence/typescript-function-readability/TFR-01-worker-01/`.
  Director reviewed diff/scope; independent post-change native/model gates are
  in progress. Unit acceptance is not yet claimed.
- [TFR-BATCH-BASELINE-20261019-03](../evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-03.md)
  independently passed all declared pre-edit gates, including current native,
  lifecycle, Piper ES/EN and Chatterbox ES/EN. All twelve audited identities and
  HEAD/index stayed unchanged. It accepts both SKIP decisions and records
  failures, consumed retry budgets, artifact-only reuse and pending final
  firewall restoration. Historical runtime results were not reused.
- Revised TFR-04 audit and independent validator review found that full async
  phase extraction changes Promise-reaction ordering before final publication
  and shared catch. Accepted SKIP; smaller synchronous extractions do not
  resolve the identified responsibility mix without added indirection. Both
  source/test paths remain unchanged. Original audit remains immutable.
- TFR-PREP-04 outcome: normal package regeneration failed safely on four
  RECORD metadata files whose generated launcher hashes differ. The auditor
  and validator verified the retained current archive (all 2,024 entries) and
  source authorities; the director restored its immutable payload into ignored
  dist, preserving old artifacts. `package:piper-core:check` and the configured
  Tauri resource build with `--no-bundle` passed. Current native/lifecycle/model
  validation resumes; no historical runtime result is reused. See
  [preparation recovery](../evidence/typescript-function-readability/TFR-preparation-recovery-01.md).
- 2026-10-19 continuation: the user explicitly authorized minimal repair of the
  Vitest dependency environment and installed Chatterbox isolation, followed by
  completion of this plan. This revises the previous preparation boundary, not
  the required runtime gates or retry history. Branch/HEAD and empty index were
  reconfirmed; only this campaign's documentary changes exist. Reused auditor
  and validator are diagnosing supported dependency relinking and exact-runtime
  firewall ownership/restoration before any new attempt. No dependency version,
  public contract, model selection, staging, commit, push or PR is authorized.
- Revised bounded preparation TFR-PREP-03: the auditor found pnpm 11.15.1's
  default optimistic-repeat-install fast path returns before installation even
  with `--force`. Approve one locked, scripts-disabled install with
  `--force --no-optimistic-repeat-install`, using exact Node/pnpm, to regenerate
  ignored workspace dependency metadata. Preserve tracked manifest/lock hashes;
  verify the regenerated Vitest target before retrying tests. Earlier failed
  preparation attempts remain retained. Stop for diagnosis if this changed
  condition fails; do not edit generated launchers manually.
- TFR-PREP-03 outcome: the real locked install passed in 6.867 seconds without
  manifest/lock changes. Three verified stale ignored desktop Vitest launchers
  were archived byte-for-byte and removed so scripts use the root-owned binary.
  Independent desktop (727 Vitest plus 76 Node tests), EPUB (651 tests), types,
  format, lint and model-free preflight passed. Browser passed 7/7 on its sole
  retry in ordinary PowerShell; retain the first pre-assertion
  `ERR_NO_BUFFER_SPACE` result without claiming a proven root cause.
- Host preparation: ordinary WMI-created PowerShell resolves installed
  Chatterbox files inside the real package tree; inherited tool context did not.
  After one OS-cancelled elevation and explicit user-requested re-prompt, a
  task-owned exact-interpreter outbound block was created and independently
  verified in ActiveStore. Eight existing rules were preserved. The rule is
  retained across this bounded batch; final or blocking handoff must remove
  only that rule and verify restoration. Journal: ignored
  `tmp/evidence/typescript-function-readability/TFR-PREP-03/`.
- Native baseline and model-free lifecycle passed. First Piper Spanish arm
  timed out at availability before inference. Both auditor and validator found
  the ignored packaged Piper resource shadows development configuration and
  has an obsolete manifest/ONNX Runtime 1.30 payload versus current authority's
  1.31. This is an environment/artifact-preparation failure on unchanged source;
  no product repair or gate weakening is approved. Prepare current resources
  only through existing builders, then revalidate native artifacts before the
  single condition-changed model retry. All original receipts remain retained.
- Revised artifact preparation TFR-PREP-04 authorizes the existing
  `pnpm.cmd package:piper-core` builder (no write-manifest mode) to synchronize
  the locked core environment and regenerate only ignored
  `services/tts/release/core/.venv`, its `dist` payload/downloads/archive and
  existing uv caches. Frozen source/runtime manifests, evidence and locks must
  remain unchanged. Materialize current resources only through the existing
  Tauri release configuration, preserving its resource mapping; verify that
  mapping and exact generated outputs before the affected native/model gates.
- 2026-10-19: the first independent documentary review rejected oversized
  baseline-report formatting (1,536 accidental empty rows). Preserved the
  original byte-for-byte in ignored local evidence with verified digest and
  [archive provenance](../evidence/typescript-function-readability/TFR-evidence-archive-01.md).
  The corrected baseline report retains every meaningful outcome. This is a
  documentary correction only, not a dependency retry or production PASS.
- 2026-10-19: independent baseline
  [TFR-BATCH-BASELINE-20261019-02](../evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-02.md)
  returned BLOCKED. Format, lint, workspace package builds and desktop types
  passed, but desktop tests failed before discovery because a stale workspace
  Vitest launcher targets an absent store entry. Ordinary and forced documented
  locked installs exited zero without changing that launcher. Bounded repair
  stopped; no unchanged test retry or source implementation was attempted.
- 2026-10-19: three filtered model configuration preflights passed for existing
  developer interpreters. Current native selection instead prefers verified
  installed Chatterbox, whose interpreter has no enabled outbound block rule.
  No supported alternate installed-root override exists. No native/model run,
  installed-package mutation, firewall change or UAC request occurred; opening
  elevation was unnecessary while the independent test-launcher blocker remained.
- 2026-10-19: completed all five static audits. TFR-01, TFR-02, TFR-04 and TFR-05
  are CHANGE candidates awaiting independent baseline; TFR-03 is SKIP. No
  approved implementation order was issued and no worker was started. The
  configured worker role remains available for continuation. Source/test
  identities and HEAD are unchanged and the index remains empty.
- 2026-10-19: execution authorized for all five units and documentary closeout,
  with no staging, commits, push or PR. Verified existing branch
  `codex/typescript-function-readability` at
  `2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`; initial index and worktree were
  clean. The five closed source/test scopes are disjoint; both proposed TFR-03
  files are absent. No source or test has been edited.
- 2026-10-19: confirmed the exposed configured roles: reusable
  `clean_code_auditor` and `clean_code_worker` use GPT-6.1 Sol high;
  `refactor_validator` uses GPT-6 Astra high. Audit and validation preparation
  are delegated without supporting-agent delegation. Git stewardship is
  available but no Git mutation is authorized. This entry records initial
  preparation; all five subsequent audit outcomes appear above.
- 2026-10-19: reviewed current plan, skills, contracts, canonical validation
  policy, product/architecture/ADR and test guidance. M005 remains complete
  and its frozen boundary remains excluded. Host preparation found the
  default pnpm shim did not match required 11.15.1; the baseline subsequently
  selected exact tools per command and inspected model readiness.
- 2026-10-19: documented the five static findings, closed unit scopes, meaningful
  naming guidance, explicit exclusions and invariant/test map.
- 2026-10-19: created `codex/typescript-function-readability` from the stated
  clean main revision. No production edits or runtime validation performed.
- All execution, combined-validation and restoration obligations are resolved below.
- During execution record concise phase durations, failed-stage classifications
  and immutable report links here; keep raw logs in ignored evidence storage.

## 11. Discoveries and decisions

- One plan covers all five findings; its units retain existing ownership and
  bounded reviewability. No line-count target or general cleanup campaign exists.
- The original TFR-03 proposal was the only new production file; its accepted
  SKIP leaves both proposed paths absent. Other planned helpers remain private
  in current files, and TFR-02 reuses the existing predicate.
- TFR-04 remains unchanged: async extraction would alter Promise-reaction order;
  preserving the original awaits leaves insufficient benefit for smaller helpers.
- Similar preference repositories and frozen normalizers remain separate.
- Reuse requires independent proof, not an assumption that a refactor is safe.
  No measured reduction in execution time is claimed.
- Planning checks are documentation-only. The root TypeScript formatting script
  does not include Markdown and cannot be cited as Markdown validation.

## 12. Final validation results

Campaign complete: three implemented units, two justified SKIPs, independent
baselines/post-change acceptance, combined repository gates and host restoration.
No source/config/dependency changes outside the approved five changed files;
260 added plus removed lines. No staging, commits, push or PR. Original branch
and HEAD remain unchanged, index empty. The active path is removed, with this
completed plan linked from the maintained documentation indexes.

| Unit | Final outcome | Independent evidence |
| --- | --- | --- |
| TFR-01 | Private `hasForeignServiceInstance` reused at exactly five sites; operation checks retained; three public cases and stronger startup assertion; 123 lines | [POST PASS](../evidence/typescript-function-readability/TFR-01-POST-20261019-01.md) |
| TFR-02 | `selectProfile` reuses `admittedForLanguage`; exact identity/state/persistence guards and tests unchanged; 8 lines | [Authoritative POST PASS](../evidence/typescript-function-readability/TFR-02-POST-20261019-02.md) |
| TFR-03 | SKIP: short effects already expose cohesive subscription/reconciliation/cleanup; extraction adds an unjustified boundary; proposed files absent | [Audit](../evidence/typescript-function-readability/TFR-03-audit-skip-01.md), [independent baseline acceptance](../evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-03.md) |
| TFR-04 | SKIP: async phase helpers would insert Promise reactions before publication/shared catch; synchronous alternatives add indirection without enough benefit; unchanged | [Revised audit](../evidence/typescript-function-readability/TFR-04-audit-skip-02.md), [independent acceptance](../evidence/typescript-function-readability/TFR-BATCH-BASELINE-20261019-03.md) |
| TFR-05 | Private same-file `resolvePackageNavigation`; original EPUB 2/3 decisions and final freezing; four mixed-invalid precedence cases; 129 lines | [POST PASS](../evidence/typescript-function-readability/TFR-05-POST-20261019-01.md) |

[Combined PACKAGE report](../evidence/typescript-function-readability/TFR-BATCH-PACKAGE-20261019-01.md)
contains every command, UTC interval, duration, exact twelve-path manifest,
input/artifact proof and aggregate mapping. [Cleanup report](../evidence/typescript-function-readability/TFR-CLEANUP-20261019-01.md)
binds independent effective-policy/resource restoration. The final documentary
and full-scope identity binding is [TFR-BATCH-FINAL-20261019-01](../evidence/typescript-function-readability/TFR-BATCH-FINAL-20261019-01.md).
Raw receipts remain in ignored `tmp/evidence/typescript-function-readability/`;
concise reports are retained beside the audits/orders, outside evaluated paths.

All acceptance commands ran in normal local PowerShell outside the sandbox,
with Node 24.18.0, pnpm 11.15.1, Rust 1.97.1 and uv 0.11.29 selected explicitly.
Native/browser/model runs used ordinary WMI PowerShell to avoid inherited AppData
redirection. No global tool selection or tracked dependency version changed.

| Executed command group | Outcome |
| --- | --- |
| `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd build:packages`; focused desktop/EPUB `typecheck` and `test` | PASS per unit; final focused EPUB 655; desktop 730 Vitest + 76 Node |
| `pnpm.cmd typecheck:typescript`; `pnpm.cmd test:typescript` | PASS combined; shared 209, EPUB 655, desktop 730 Vitest + 76 Node; generated shared contracts checked |
| `pnpm.cmd test:browser` | PASS, seven cases on combined source state, 13.525 s |
| `pnpm.cmd test:native-startup` | PASS per required boundary; final smoke after all builders 38.476 s |
| Configured portfolio preflight, three filtered preflights and section 8 lifecycle/model commands | PASS for TFR-01/02; final affected unit02 lifecycle 14.734 s, Piper ES 174.284 s, Piper EN 175.606 s, Chatterbox ES/EN 622.393 s |
| `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence` | PASS; 13 evidence tests |
| `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`; `pnpm.cmd test:python` | PASS; mypy 171 files, pytest 571 cases |
| `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust` | PASS both default/release variants; 94/93 tests, existing child fixture invoked by parent assertion |
| `pnpm.cmd build:python`; `pnpm.cmd build:desktop`; `pnpm.cmd --filter @voxleaf/desktop build` | PASS wheel/sdist, exact default Tauri build and portable frontend |
| `git diff --check`; manual full diff, architecture, evidence and link review | PASS at each accepted boundary; final documentary report binds closure |

The root `check` and `check:portable` aggregate commands were not executed as
aggregates. Their current graphs were expanded and all unique required leaves
resolved with their build dependencies, retaining Rust feature variants and
native/portable-exclusive builds. The PACKAGE report maps each leaf; no CI or
protected-branch requirement is waived.

Reuse was validator-owned and per gate: complete worker fast-check receipts;
unchanged native evidence for the clean TFR-05 baseline; combined browser evidence
with identical source/runtime/frontend; and equivalent aggregate leaves. Full
source/discovery, library, config, lock, tool, artifact and environment manifests
were compared. Changed native executable bytes invalidated its old receipt and
triggered a fresh final smoke. Model results retain their actual TFR-01/02 inputs;
no new model measurement is claimed after the EPUB-only unit, whose section 8
gates do not include G-HOST. Qwen inference remains deferred under ADR-0051.

Environment recovery and limitations:

- Supported locked install with `--ignore-scripts --force --no-optimistic-repeat-install`
  restored the dependency environment; three verified stale desktop Vitest
  launchers were archived and removed. No tracked lock/manifest changed.
- Installed Chatterbox received one exact-interpreter temporary outbound block
  after the user accepted UAC. It was removed after validation, and independent
  ActiveStore verification preserved all eight original rules and host resources.
- The normal Piper builder failed safely on generated launcher metadata. A
  verified current immutable payload was reused only after full 2,024-entry and
  source-authority comparison, followed by the official package check and current
  native/model gates. Historical runtime measurements were not reused.
- Original browser availability, Piper artifact and RAM failures remain retained.
  User-released RAM enabled the single documented recovery; thresholds were not
  lowered. Retry budgets were not reset; no source correction loop was needed.
- Metadata-only capture/report corrections are recorded separately from tests;
  immutable earlier reports were preserved. The original malformed report is
  byte-preserved through [archive provenance](../evidence/typescript-function-readability/TFR-evidence-archive-01.md).
- Existing pytest-cache permission and frontend bundle-size warnings were
  non-failing; no unrelated repair was added. Results cover the bounded synthetic
  corpus and stated host, not a new performance improvement or universal guarantee.

See [preparation recovery](../evidence/typescript-function-readability/TFR-preparation-recovery-01.md)
and [memory replan](../evidence/typescript-function-readability/TFR-host-memory-replan-01.md)
for failed-stage details, timings, receipts and exact restoration ownership.
The system diagram and completed M005 remain accurate and unchanged: no public
contract, component/process boundary, normalization or persistence policy changed.
