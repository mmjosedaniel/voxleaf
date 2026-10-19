# Bounded TypeScript function readability

Status: planned; production implementation and acceptance have not started.
Prepared on 2026-10-19 from clean `main` at
`8f0d156196cd44130b0acf5816df92466c2f8972`.
Implementation branch: `codex/typescript-function-readability`.

## 1. Goal

Implement five focused TypeScript/TSX readability improvements using meaningful
domain names, private functions and existing predicates. Reduce repeated rules
and make orchestration readable without adding generic frameworks or changing
behavior. This maintenance work spans desktop narration, reader synchronization
and secure EPUB ingestion; it does not reopen completed roadmap milestones.

## 2. User-visible outcome

Readers retain the same EPUB admission, profile availability, narration startup,
state notifications, cancellation, highlighting, navigation and cleanup.
Contributors can locate repeated decisions and lifecycle bindings by name.

This is a maintainability change, not a feature or a claimed performance gain.
The planning request authorizes this plan, its two index links, a branch from
main and a local documentation commit. Source implementation and later source
commits require the subsequent execution request's authority; push and PR
creation remain separate actions. No production work is authorized by the
planning commit alone.

## 3. Current state

The review inventoried 281 tracked TypeScript/TSX files and inspected selected
responsibilities and existing tests. It was a static review, not an exhaustive
audit or a runtime baseline. Refresh these observations before implementation.

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

Status: not started.

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

Status: not started.

Extract a pure module-private `hasForeignServiceInstance` predicate accepting
the existing decoded-control type and expected service identity. Replace exactly
the five repeated predicates. Preserve the `"serviceInstanceId" in control`
guard, response ordering/length/state checks, each error classification and
each operation's failure/containment behavior. No lifecycle helper framework.

Cover foreign identities through public client operations, not direct tests of
the private predicate. Complete the unit gates before accepting this change.

### Milestone 3: TFR-02 profile admission predicate

Status: not started.

Keep the requested profile-ID equality and reuse `admittedForLanguage` for that
matched profile and current language. Preserve closed-state and
`canPersistSelection` guards, write count/order, future-version protection and
the saved-result check. Verify that the reused language/profile predicates are
pure before accepting the harmless change in boolean evaluation order.
Do not rename the predicate or extract another wrapper without concrete need.

### Milestone 4: TFR-03 reader narration bindings

Status: not started.

Implement `bindParagraphLeafNarration` and `bindSegmentHighlightNarration` in
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

Status: not started.

Move only the `start-service` and `prepare-service` branch bodies into private
phase methods accepting the captured scheduler and run token as needed.
Keep `#execute` as dispatcher and sole owner of its shared catch classification
and final conditional publication.

The startup branch currently returns from `#execute` when no profile or runtime
configuration is available. Those returns skip the final publication: a naive
`await` of a void helper would add an observable notification. Propagate this
early exit explicitly, for example with a boolean named
`serviceStartCompleted`, and return from the dispatcher when it is false.
No new result framework or action class is needed.

Preserve hardware-before-configuration checks, short circuits, availability and
failure updates, begin/publish/start ordering, captured scheduler identity and
every existing run-token guard. Retain prepare completion/recovery behavior and
error propagation to the original catch. Do not change `#prepareNarration`,
`#synthesize`, cancellation, scheduling or player ownership.

### Milestone 6: TFR-05 package navigation resolution

Status: not started.

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

Status: not started.

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
| TFR-03: subscriptions and synchronization | `ReaderPublication.test.tsx`: cross-chapter audible highlighting without focus theft, boundary navigation, DOM replacement, passive location and StrictMode. | Add focused binding cases for initial observation, progress routing, unsubscribe order, absent-source differences and highlighting clear only where existing assertions do not cover them. Retain component replacement/unmount coverage. |
| TFR-04: startup, notifications, stale work and recovery | `product-narration-coordinator.test.ts`: missing configuration, admitted/unsupported language, profile replacement, containment, abort and delayed cleanup. | Characterize early-exit notification behavior and deferred startup/preparation after invalidation if missing. Observe public subscriptions/client calls, not private methods. |
| TFR-05: secure navigation and package equivalence | `package-document.test.ts`: immutable EPUB 3 model, EPUB 2 metadata/NCX rejection table, missing-NCX guide case, fallback limits, cancellation/deadline and transactional failure. | Preserve all assertions. Add a multi-invalid-input rejection-order case only for an identified uncovered ordering risk. |

### Gate ledger

Production gates are currently PENDING. Record exact original receipt IDs,
durations and reuse decisions in the batch record during execution; no passing
production gate is claimed here. Planning documentation evidence is reported
separately in the planning handoff. Baseline/post below means before editing and after the
affected unit, including high-risk gates before accepting that unit.

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

- 2026-10-19: documented the five static findings, closed unit scopes, meaningful
  naming guidance, explicit exclusions and invariant/test map.
- 2026-10-19: created `codex/typescript-function-readability` from the stated
  clean main revision. No production edits or runtime validation performed.
- Pending: execution audits, independent baselines, approved orders, sequential
  implementation, unit acceptance, combined gates and documentary closeout.
- During execution record concise phase durations, failed-stage classifications
  and immutable report links here; keep raw logs in ignored evidence storage.

## 11. Discoveries and decisions

- One plan covers all five findings; its units retain existing ownership and
  bounded reviewability. No line-count target or general cleanup campaign exists.
- Only TFR-03 adds a production file. The other helpers remain private in their
  current files, and TFR-02 reuses a predicate rather than introducing one.
- Startup early exits must propagate through the extracted method to preserve
  notification count/order; this is an explicit characterization target.
- Similar preference repositories and frozen normalizers remain separate.
- Reuse requires independent proof, not an assumption that a refactor is safe.
  No measured reduction in execution time is claimed.
- Planning checks are documentation-only. The root TypeScript formatting script
  does not include Markdown and cannot be cited as Markdown validation.

## 12. Final validation results

Production implementation: NOT STARTED. No baseline, unit, browser, native,
model-backed or aggregate runtime PASS is claimed by this plan.

The planning handoff reports its documentation checks and local commit
separately; those results do not satisfy the future implementation gates.
At execution closeout replace this pending record with actual command outcomes,
independently justified gate reuse, current immutable report references,
identity rechecks, phase durations, verified host cleanup and any limitations.
Do not mark the plan complete while required gates or cleanup remain pending.
