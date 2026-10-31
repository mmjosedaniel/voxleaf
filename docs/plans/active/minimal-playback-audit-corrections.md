# Minimal playback audit corrections

## Goal

Resolve the three retained playback findings from the static chat audit with
small changes to the existing desktop owners. Reuse existing regression
fixtures, select the smallest meaningful acceptance set, and distinguish
historical results from evidence for the eventual patch.

**Status: planning only; implementation and validation are not started.**
The user authorized this ExecPlan, a new branch and its documentation commit.
The user explicitly prohibited executing the plan now. No production/test
change, test, build, model run, installation, push or PR is authorized by this
planning step.

Task ID: `MPA-20261030`. Inspected source:
`33284dd534467e2b3845624a3748c0c495d7018e`, initially clean `main`.
Planning branch: `codex/minimal-playback-audit-plan`.

## User-visible outcome

- Returning to 1.00x releases the retired time-stretch processor, including
  when slow/direct playback is selected repeatedly within one AudioContext.
- An AudioWorklet processor failure reaches the existing playback-failure and
  explicit recovery flow instead of leaving silent playback apparently active.
- After navigating while paused, changing or resetting speed immediately
  updates both the selector and the loaded-audio description. Playback stays
  paused until Resume and uses the selected rate afterward.

## Current state

The findings below were traced statically; none was reproduced by executing
code during this audit or planning task.

| ID | Evidence and consequence | Qualification |
| --- | --- | --- |
| MPA-01 | `incremental-wsola-v3.ts:createIncrementalWsolaV3Node.close` only disconnects the node and closes its port. The registered processor's `process` returns true on every path, including idle and stopped states. `releasePlaybackRatePreparation` discards that node without closing the reusable AudioContext. Repeated slow/direct transitions can retain processors in that context. | Valid source-level lifecycle defect. The demonstrated scope is an open AudioContext; no measured heap/CPU growth or retention after context closure is claimed. |
| MPA-02 | `web-audio-pcm-playback.ts:#startWsola` listens for port messages `failed` and `ended`, but no production owner handles native `processorerror`. The player retains the final source frame until the ended callback, so a permanently silent failed processor can leave the current unit active. | Valid conditional failure-handling gap. No ordinary PCM input causing the underlying exception was identified. Tests must inject the platform event and label that evidence honestly. |
| MPA-03 | `#finishNavigation` retains a frozen paused snapshot after releasing player/scheduler ownership. `setPlaybackRatePercent` and `resetPlaybackPreference` update the selected preference but not that snapshot. `loadedAudioStatusText` reads its old selected rate. | Valid presentation defect. For example, the selector changes to 0.75x while the zero-ready-audio description still says 1.00x. Resume already starts with the new rate. |

The processor lifetime and failure semantics were also checked against the
[Web Audio specification](https://www.w3.org/TR/webaudio-1.1/) and
[Chromium's AudioWorklet handler](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/modules/webaudio/audio_worklet_handler.cc).
Disconnect counts or port closure alone do not establish processor termination.

## Scope and non-goals

One desktop integration batch contains two small implementation units:

1. MPA-01/02: worklet terminal disposal and backend failure ownership. Keep
   these together because they share node creation, release and stale events.
2. MPA-03: coordinator-owned selected-rate presentation after paused navigation.

Expected production edits are limited to:

- `apps/desktop/src/tts/playback-backends/incremental-wsola-v3.ts`
- `apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts`
- `apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts`
- `apps/desktop/src/tts/product-narration-coordinator.ts`

Extend these existing tests, without a new framework or production probe:

- `apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts`
- `apps/desktop/src/tts/pcm-playback.test.ts`
- `apps/desktop/src/tts/product-narration-coordinator.test.ts`
- `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`

Keep UI components, scheduler, persistence, native code, Python services,
packages, lockfiles and generated contracts unchanged unless a concrete
implementation blocker requires a recorded scope/gate revision first.
The existing controls tests are a selected consumer gate, not an instruction
to edit the controls or add redundant presentation assertions.

Explicit exclusions:

- Recovery returning to the last heard checkpoint: this follows
  [recovery authority](../../architecture/hardware-profile-recovery-authority-v1.md).
  The ambiguous pre-first-audio fallback is not an accepted bug in this batch.
- Eight live image sources and capacity placeholders: documented by
  [ADR-0010](../../architecture/decisions/ADR-0010-bounded-raster-image-decode.md).
- The discarded Settings-before-book candidate: that UI route is unavailable.
- DSP/window/hop/rate arithmetic, PCM conversion, six-rate choices, TTS
  inference, profile selection, model support, installation and acquisition.
- A new recovery policy, automatic retries, a second audio queue, dependencies,
  telemetry, public schema changes, or a broad refactor.

## Relevant files and documentation

Read the four production owners and their tests before implementation. Important
unchanged consumers are `pcm-playback.ts`, `pcm-playback-contracts.ts`,
`adaptive-preparation-presentation.ts`, `ProductNarrationControls.tsx`,
`operational-recovery.ts` and the current coordinator failure/cleanup path.

Requirements and acceptance references:

- [Documentation index](../../README.md), [MVP](../../product/mvp.md),
  [reader/settings/playback requirements](../../product/reader-settings-and-playback-controls.md).
- [System diagram](../../architecture/system-diagram.md),
  [overview](../../architecture/overview.md),
  [playback authority v3](../../architecture/reader-settings-playback-authority-v3.md),
  [WSOLA selection ADR](../../architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md).
- [Testing strategy](../../development/testing.md),
  [independent change review](../../development/agentic-change-review.md),
  [evidence retention](../../development/evidence-retention.md), and the
  [input-equivalence rules](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md#revalidate-changed-evidence-not-everything-by-default).

Command owners are root/desktop `package.json`,
`apps/desktop/vite.config.ts`, `apps/desktop/playwright.config.ts`,
`apps/desktop/src-tauri/tauri.conf.json` and the existing
`apps/desktop/scripts/native-startup-smoke.mjs` runner.

During implementation, add only short applicable notes to the maintained
playback requirements and testing strategy. Review the system diagram at
closeout; the planned internal corrections do not change its component,
process, trust or persistence boundaries. Do not edit frozen authorities,
historical receipts or completed plans.

## Architecture and constraints

MPA-01 needs a terminal disposal signal distinct from the reusable per-unit
`stop`. Send it before disconnect/port closure; the processor must release
its unit, reject subsequent work and return false on every later process call,
including calls without an output channel. Keep ordinary end/Stop reusable
for the next unit on the same admitted node. Preserve idempotent close and
the existing preparation-token guard for nodes created after cancellation.
Verify actual message delivery through paired ports; do not assume that an
observed postMessage call alone proves terminal disposal. Avoid polling,
arbitrary delays and AudioContext replacement as a disposal workaround.

MPA-02 attaches failure handling when a node is admitted/prepared, rather than
only after its first audio unit starts. A processor error permanently invalidates
that node. During an active unit, notify the existing failed callback exactly
once, release ownership, and let the existing coordinator contain the service.
If failure arrives before start or between units, latch it and prevent that
node being reported ready or reused; propagate through the existing preparation/
start failure route. Late events from a retired node cannot fail its successor.
Detach handlers on disposal, preserve the ended/failed FIFO guards, and do not
silently retry or create an alternative recovery policy.

MPA-03 follows the coordinator's existing volume-snapshot pattern. Synchronize
the selected-rate fields in retained terminal and pending paused-navigation
snapshots whenever the in-memory selection changes, including a successful
reset. Preserve the existing storage-failure semantics: a failed preference
write must not leave the label behind an already applied selection. Cover
selection while navigation cleanup is still pending as well as after settlement.
Preserve zero ready audio,
paused intent and truthful active/pending rate fields; do not overwrite an
active player's boundary-deferred state with the selected preference. Any small
shared private update belongs in this coordinator, not in a new abstraction.

All fixes retain 24,000 Hz source accounting, memory-only PCM, bounded queues,
same-session speed selection, identity-first cancellation, stable locators,
explicit recovery and content-free diagnostics. Error objects must not become
logs containing source text or private paths. EPUB parsing and malformed-input
handling are unchanged; use existing repository-authored synthetic fixtures.

## Milestones

### 1. Establish directed regressions

Status: **not started**.

After execution is separately authorized, capture the actual HEAD, clean/dirty
paths, index, tools and gate input identities. Preserve unrelated user work.
Recheck the retained findings and current scripts. Add the minimal `MPA-`
regressions to the existing three unit/integration files, then run only those
new cases against unchanged production code once.

- MPA-01: terminal disposal while idle, active and paused; false after disposal,
  no re-arm or later audio; ordinary end/Stop can still serve another unit.
  Exercise the real factory with paired-port delivery, repeated close and a
  cancelled pending creation, using existing PCM test seams.
- MPA-02: native error before first start and during playback; one failure,
  released current ownership, no false completion or stale-node effect.
  Retain healthy completion and the existing ended/Pause FIFO control.
- MPA-03: pause, navigate, select/reset speed before/after settlement, inspect
  the public snapshot and real loaded-label formatter, then Resume. Assert no
  unsolicited start and the correct rate on the next run.

An unexpected pass or fixture failure requires diagnosis, not weakening an
assertion to manufacture the desired red result.

### 2. Apply the bounded corrections

Status: **not started**.

Implement MPA-01/02 together in the three backend files, then MPA-03 in the
coordinator. Leave DSP and policy unchanged. Run the combined static and selected
four-file regression gates once on the completed patch; do not repeat the full
desktop suite after each edit. A failure renews only its affected gate.

### 3. Verify browser and packaged integration

Status: **not started**.

Extend the existing browser seam with at most two cohesive `MPA-` scenarios:
slow/direct/slow reuse plus paused-navigation labels, and injected processor
failure reaching product recovery. Use the real bundled production worklet.
An injected error proves handling, not natural occurrence of that exception.
Retain the existing NLC tail/completion and ended/Pause FIFO scenarios in
the same selected browser invocation.

After cheap gates pass, prepare one current native build and run one existing
Piper EN playback-speed arm in packaged WebView2. Reuse verified local core/model/
driver artifacts, not an old frontend executable. This is the single real-model
arm selected because the existing native speed exercise requires adaptive TTS;
adding a separate native synthetic-worklet runner would broaden this small fix.

### 4. Document and obtain independent acceptance

Status: **not started**.

Freeze the final patch and concise evidence, then delegate one independent
`change_reviewer` (GPT-6 Astra high), as required by project instructions.
Supply exact base/HEAD, path/SHA-256/blob identities, current host results,
coverage limits and any proposed reuse. The reviewer neither edits nor runs
tests. Resolve actionable findings and obtain a new exact-patch APPROVE;
missing evidence or reviewer remains blocked.

Retain passing current-task gates across documentation-only or independent
edits only with an explicit dependency comparison and reviewer assessment.
Archive the plan and update indexes after acceptance. Future implementation
commits, push, PR or merge require their own applicable authorization.

## Testing and benchmark strategy

### What earlier evidence actually establishes

Read-only inspection on 2026-10-30 included the original SFA G5R and R7 R1-G4
JSON receipts and their input manifests, not just summary counts. No receipt
was executed, rewritten or rebound to the current branch.

| Prior evidence | Recorded result | Decision for this plan |
| --- | --- | --- |
| [NLC plan](../completed/narration-logic-corrections.md), F1 and B1; [independent reviews](../evidence/narration-logic-corrections-review.md) | F1: 47 passing worklet/player cases after five directed failures. B1: one real bundled-worklet tail/manual-save scenario passed after correcting its restoration-text expectation. | Reuse the real registered-processor fixture, signal controls and browser scenario. Changing the worklet/backend invalidates the old result for this patch; execute the small selected group anew. |
| [SFA ledger](../evidence/six-finding-audit-corrections/execution-ledger.md), G5R-playback | `pcm-playback.test.ts` plus transition-policy tests: 40 passed, exit 0, 2.5085 seconds; original receipt HEAD `200144dd29709536b189cb593fe53e927a991dc4`. | The three backend source files, PCM test, Vite config and lockfile match that original manifest today. The planned backend edits invalidate this gate. Reuse assertions and fixtures, not its PASS. The unrelated pure transition-policy suite is not separately selected. |
| [R7 host receipts](../evidence/seven-finding-minimal-corrections/host-receipts.md), R1-G4 | Seven selected desktop files, exit 0 in about 5.11 seconds; the completed plan records 217 passing tests. Original receipt HEAD `79bcb814d57c3b8016c1c1315684c1eb158e2a59`. | Coordinator source/test, three backend sources, PCM test, Vite config and lockfile match the inspected original entries. MPA-03 invalidates coordinator acceptance. Rerun its full file and immediate controls, not the entire old seven-file reader/persistence group. |
| NLC H1-R02 and R7 R1-G7-native/R1-G8 | Packaged playback/native checks passed on their identified executables; NLC H1 covered all six rates. R7 required temporary corrected Piper resources. | Historical platform/coverage context. New renderer bytes require a new native build and one fresh selected arm. Old native results, timing measurements and listening do not validate the new executable. |
| SFA/MAF/R7 broader suites and CI follow-ups | Existing records include much larger TS/Python/Rust suites and repaired initial failures. SFA explicitly declined historical runtime PASS reuse without complete input/environment proof. | Do not repeat these suites to reproduce their counts. No old aggregate PASS is claimed. Existing CI/protected-branch requirements still apply before any later integration. |

Original local evidence pointers:
`tmp/evidence/six-finding-audit-corrections/G5R-playback-{result,before,after}.json`
and `tmp/evidence/seven-finding-minimal-corrections/R1-G4-{result,inputs}.json`.
These are ignored evidence, not files to stage. The eight-entry comparison above
is deliberately limited: it is not complete transitive/environment equivalence.
The older SFA coordinator entries no longer match current code.

**No historical runtime test result is pre-approved for reuse as acceptance.**
That is not a reason to rerun every old suite. Select affected responsibilities
only. Reuse unchanged fixtures immediately; verify artifact integrity before
using cached preparation. Reuse a passing current-task gate after later edits
only when its exact inputs, discovery membership, installed tools/dependencies,
environment and tested artifact remain equivalent, with an immutable receipt
and independent review. Otherwise rerun that affected gate.

### Minimal execution set

All commands below are future work from the repository root in normal local
PowerShell **outside the managed sandbox**. Record start/end, exit, command,
source/config/lock/runner/fixture identities and relevant host state for every
gate. No full-repository baseline is selected.

| Gate | Existing command and timing | Invariant / invalidation |
| --- | --- | --- |
| G0 | Inspect locks, installed tool/browser/driver versions and original evidence. Use `pnpm.cmd build:packages` once if existing generated workspace exports lack proven current inputs. | Preparation only. Never hand-edit generated outputs or silently install/download prerequisites. Root browser and Tauri hooks retain their configured builds. |
| G1 | Directed Vitest command below with `-t "MPA-"`, once before production edits. | Establish the three failures. Fixture/setup failures do not count as reproduction. Preserve failed receipts. |
| G2 | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/desktop typecheck`, once after the combined edits. | TS/config/type safety. Renew affected checks after source/test/config edits; no Python/Rust static leaves are selected for unchanged owners. |
| G3 | Combined four-file Vitest command below, once after all corrections. | Real processor lifecycle/signal controls, backend callback ownership, coordinator state and controls contract. Backend/worklet/coordinator, transitive imports, fixtures/config/exports/lock/tool changes invalidate affected results. |
| G4 | Selected browser command below, once after G3. | One selected Chromium invocation, real bundled worklet and product wiring. Includes package/frontend build hooks. Any consumed source/spec/config/browser change invalidates the run. This is not a full browser-suite PASS. |
| G5 | `pnpm.cmd package:piper-core:check`, then `pnpm.cmd build:desktop` once after G2-G4. | Verify existing core and build the final packaged renderer. The old executable cannot be recycled after frontend changes. Preserve normal Tauri hooks and identify the resulting executable. |
| G6 | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | One packaged WebView2 speed/lifecycle/cleanup arm using G5's exact executable. Runner, executable, runtime/voice, driver/browser or relevant host changes invalidate it. No redundant `test:native-startup` rebuild or second language/model arm. |
| G7 | `pnpm.cmd check:evidence` and `git diff --check`, plus manual relative-link/diff review after final documentation. | Content-safe evidence and bounded documentation scope. The unchanged evidence-guard test suite is not separately rerun. Any guard implementation change requires revisiting that decision. |
| R1 | Independent change review after all selected gates and cleanup. | New immutable report for exact final identities. A prior review is not inherited approval. |

G1, directed reproduction:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts -t "MPA-"
```

G3, combined regression and existing controls:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx
```

G4, selected browser integration:

```powershell
pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "MPA-|NLC real worklet|CHAT-AUDIT real bundled worklet"
```

These use the configured Vitest/Playwright executables and existing package
scripts. Do not append file filters to the desktop `test` script: it chains
Vitest with unrelated Node harness suites. Direct Vitest selection avoids
running those unrelated processes. The `MPA-` cases do not exist yet.

### Omitted and conditional work

No local aggregate `check`/`check:portable`, full desktop/browser suite,
Rust/Python/EPUB/shared test sweep, six-profile portfolio, GPU benchmark,
installer/uninstaller, acquisition test or core/model regeneration is selected
for these four renderer source files. This follows the bounded frontend gate
selection documented in SFA; it does not claim those aggregates were run or
waive later required CI. Expand only when the actual diff changes those
responsibilities, the selected evidence exposes a concrete gap, or independent
review identifies an unmet requirement.

Do not rerun the historical backend selection, contention or listening campaign:
the DSP algorithm, rates, clocks, voices and runtime dependencies are preserved.
The existing small signal suite runs fresh; G4/G6 renew browser/native behavior.
No new pitch-quality, p95 latency, heap-size or platform-support claim is made.
If the fix changes samples, scheduling arithmetic or admission limits, stop and
revise the plan to include the relevant measurement/listening acceptance.

The R7 evidence preserves a real host-preparation caveat: stale Piper resources
adjacent to the executable were restored after validation. G5 must check the
actual resources G6 will discover, not just a separately valid archive.
If they mismatch, reuse the existing verified package through bounded temporary
staging and an ownership/restoration journal, following the recorded R7 method.
Preserve originals and verify restoration in finally. Do not regenerate models,
overwrite personal installation state or treat the historical temporary fix
as current readiness. Missing safe preparation leaves G6 pending.

## Risks and rollback

- Treating ordinary Stop/end as permanent disposal would break node reuse.
  Terminal disposal must be explicit and independently exercised.
- Closing a message port too early can undermine disposal delivery; paired-port
  and browser coverage must verify the chosen ordering. Avoid async-close API
  expansion unless evidence shows it is necessary.
- An error can arrive during preparation, after unit completion or after node
  replacement. Bind handling to the node's current owner and preserve FIFO
  protections, with no unbounded retries or late failure of a healthy successor.
- Refreshing every snapshot blindly could misreport an active unit's immutable
  rate. Update retained inactive/paused presentation without changing active
  player authority.
- A source change invalidates historical PASSes even when the old test file
  still exists. Unknown dependencies/environment are not evidence equivalence.
- Do not expand acceptance into a host-maintenance campaign to hide a setup
  failure. Record stage/command/owned PID, creation time and executable identity,
  and clean only task-owned processes, scratch and temporary resources.

Use one justified infrastructure retry after a documented changed condition;
a second failure stops that stage for diagnosis and plan revision. Keep real
assertion failures distinct from environment/harness failures. Preserve all
failed receipts. Roll back only task-owned edits or an explicitly authorized
implementation commit; never reset unrelated work, delete user data or remove
models. Current planning authorizes no runtime rollback or host mutation.

## Progress log

- 2026-10-30: Rechecked clean source HEAD, retained findings, owning code/tests,
  product/architecture decisions, configured commands and prior NLC/SFA/R7
  evidence. Read the original SFA/R7 receipts and compared the eight named input
  entries. No test, build, benchmark or model was executed.
- 2026-10-30: Created `codex/minimal-playback-audit-plan` from the stated main
  checkpoint and prepared this plan plus its active-index entry for the
  user-requested documentation commit. Execution remains explicitly deferred.

## Discoveries and decisions

- The original five findings reduce to two unconditional source-level defects
  and one conditional platform-error gap. Recovery/image policies and the
  unreachable Settings candidate are excluded.
- Existing worklet tests cover real processing and bounded signal behavior;
  the PCM suite already has paired-port/FIFO seams. Extend them instead of
  building another audio test framework.
- Current selected source hashes can match old receipts while future edits
  invalidate those results. The cheapest defensible path is one fresh small
  regression group, not a broad historical-evidence reconstruction.
- Keep one native Piper arm because the existing speed option explicitly
  requires adaptive TTS. Reuse its verified assets and the one current build;
  add no native runner or cross-engine matrix.
- Planning-only documentation has no runtime or contract effect and is exempt
  from independent behavioral change review. Actual implementation requires R1.

## Final validation results

| Item | Result at planning closeout |
| --- | --- |
| Finding verification | Static only, qualified above; not runtime reproduction. |
| Historical review | Original SFA/R7 receipts and selected hashes inspected; no historical runtime PASS accepted for the future patch. |
| Production/test edits | None. |
| G0-G7 and implementation milestones | Not executed. |
| New implementation acceptance/review | Not requested or claimed; pending future execution. |
| Planning scope | This ExecPlan and active-index entry only; branch/commit authorized, push/PR/implementation deferred. |

At actual execution closeout, replace pending entries with exact host commands,
outcomes, immutable receipt references, reuse decisions, tested identities,
cleanup/restoration results and the current independent review ID. An omitted
or pending gate is never a PASS.
