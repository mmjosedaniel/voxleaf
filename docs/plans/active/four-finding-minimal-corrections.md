# Four verified findings: minimal corrections

Task ID: F4-20261031.

Status: planned; implementation and validation have not started. The current
authorization covers this ExecPlan, its active-index entry, a dedicated branch
and a local documentation commit only. It does not authorize executing the
plan, pushing, publishing or opening a pull request.

## Goal

Correct four statically verified defects with three production-file changes:
two conservative narration-boundary checks, startup failure containment order,
and native cancellation's final result decision. Extend existing test fixtures
and run only the gates that cover these responsibilities after implementation
is separately authorized.

This spans the existing M005/M010.1 narration, M007 native protocol and
M008/M010/M010.2 playback/recovery boundaries, so it uses a descriptive filename
rather than assigning the work to a misleading single roadmap milestone.

## User-visible outcome

- Unsupported numbers containing Unicode digits remain intact in narration.
- A recognized date embedded in a larger unsupported numeric expression is not
  expanded independently of that expression.
- If audio initialization fails while the model is loading, successful bounded
  containment makes the existing explicit recovery available instead of
  manufacturing a terminal cleanup failure by waiting for model preparation.
- If native cancellation wins before synthesis commits its result, the native
  command returns cancellation and publishes no PCM. The TypeScript client's
  existing late-byte rejection remains a second guard. The reported race does
  not establish that cancelled audio currently reaches the speakers.

## Current state

Planning base: clean `main` at
`d4622a1c5abcd19a6c5c26a8cfd242f9591a5f33`, containing PR #291.
Plan branch: `codex/four-finding-minimal-corrections-plan`.
The three affected production files are byte-unchanged in Git since the audit
base `7c1d694155a0e6134c20ad8dc15ba05e78186b9f`. Findings below were reread on
the planning base. They are static findings, not executed reproductions.

| ID / priority | Current evidence and concrete trigger | Bounded correction |
| --- | --- | --- |
| F4-01 / P2 | `packages/epub/src/narration/narration-bilingual-normalizer.ts`, `isWordContextCodePoint`, around line 352: ASCII digits plus Unicode letters/marks exclude other Unicode numbers. In English prose, `8١` allows the `8` allowlist entry to expand alone. | Recognize Unicode numeric code points as lexical adjacency in this existing predicate; preserve supported standalone expansions. |
| F4-02 / P2 | Same file, `matchesLexicalForm`, around line 632: `attachedCompound` applies to currency, percentage and time, but not date. Spanish `1/24/07/2026` allows the `24/07/2026` suffix to expand. | Include dates in the existing compound-expression guard; keep the accepted slash/ISO date forms and ordinary surrounding punctuation. |
| F4-03 / P2 | `apps/desktop/src/tts/product-narration-coordinator.ts`, `#containOperationalFailure`, around lines 2097-2113: without an active synthesis scope it joins `#operation` before `shutdown()`. A non-default rate can start backend preparation during model loading; its rejection triggers this path. Preparation lasting beyond the remaining five-second cleanup budget produces `cleanup-failed` and disables recovery. | Issue shutdown before joining pending startup when there is no cancellable synthesis; retain cancellation-first handling for active synthesis and the existing single cleanup deadline. |
| F4-04 / P3 | `apps/desktop/src-tauri/src/tts_service_supervisor.rs`, `synthesize_measured`, around lines 1580-1615: cancellation can invalidate the identity between the first eligibility check and the final lifecycle lock. `result.map_err` cannot turn an already successful PCM result into `Cancelled`. | Apply the final cancellation decision to both successful and failed results; preserve normal success and non-cancellation failure containment. |

The fourth audit pass produced no additional accepted finding. The previously
reported Piper post-promotion rollback concern is excluded: staging already
verifies package integrity, the normal installer command short-circuits on a
failed core build, and no full-build rollback guarantee was established. Do not
restore that withdrawn P2 or edit `release_core.py` as part of this plan.

## Scope and non-goals

Three implementation units form one acceptance batch:

1. **Narration, F4-01/02:** the bilingual normalizer and existing normalizer/public
   preparation tests. Shared production ownership warrants one combined unit.
2. **Recovery, F4-03:** the coordinator and its existing test harness.
3. **Native result publication, F4-04:** the supervisor and its private tests.

Expected production/test edit allowlist:

- `packages/epub/src/narration/narration-bilingual-normalizer.ts`
- `packages/epub/src/narration/narration-normalizer.test.ts`
- `packages/epub/src/integration/narration-preparation-matrix.test.ts`
- `apps/desktop/src/tts/product-narration-coordinator.ts`
- `apps/desktop/src/tts/product-narration-coordinator.test.ts`
- `apps/desktop/src-tauri/src/tts_service_supervisor.rs`
- `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs`

Future documentation is limited to this plan/evidence, plan indexes and a short
current-behavior clarification in `docs/architecture/overview.md`. Update
`docs/README.md` at closeout if needed for the maintained index. No new ADR is
expected: these corrections enforce existing decisions. Amend this plan before
widening the production/test allowlist or changing a public contract.

Do not change the legacy `narration-v1` normalizer, frozen corpora/authorities,
completed plans, lexical allowlists, segmentation limits, source coordinates,
UI layout, DSP, scheduler policy, recovery eligibility/deadlines, Python service,
models, package builders, dependencies or lockfiles. Do not add a general numeric
parser, recovery framework, cancellation API, schema or automatic retry.

## Relevant files and documentation

Read the [documentation index](../../README.md),
[roadmap](../roadmap.md), [MVP](../../product/mvp.md),
[playback requirements](../../product/reader-settings-and-playback-controls.md),
[system diagram](../../architecture/system-diagram.md) and
[architecture overview](../../architecture/overview.md).

Narration authority is the completed
[M005 plan](../completed/M005-narration-text-preparation.md), marked complete in
the roadmap, [ADR-0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md),
[normalization v2](../../architecture/narration-normalization-v2.md), and the
current-profile corrections in
[ADR-0065](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md).
M005 describes preparation and locator mapping; it does not establish new
TTS, playback, quality or hardware acceptance for this task.

Lifecycle authority is
[protocol v1](../../architecture/tts-service-protocol-v1.md),
[ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md),
[ADR-0019](../../architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md),
[ADR-0056](../../architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md)
and [recovery authority](../../architecture/hardware-profile-recovery-authority-v1.md).
The normal Stop path already performs shutdown before joining startup; use it
as the ordering reference without extracting or rewriting both paths.

Inspect the existing `pcm-playback.test.ts`, `process-client.test.ts`, supervisor
`CommandFixture`/thread-local test hooks, `narration-resource-bounds.test.ts`,
package scripts, Cargo features and native runner before executing the gates.
Acceptance follows [independent change review](../../development/agentic-change-review.md).
Use the evidence-reuse principles in the
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md);
this is a behavioral bug-fix batch, not a refactor campaign requiring separate
auditor/worker/validator work orders.

## Architecture and constraints

Keep canonical normalization in `@voxleaf/epub`, cleanup orchestration in the
desktop coordinator, and publication/cancellation arbitration in the existing
native lifecycle lock. No component, process, persistence owner or data-flow
edge changes. The canonical diagram was inspected during planning; review it
again against the final patch and edit it only if that conclusion changes.

The lexical predicate may use the Unicode numeric category together with the
existing letters/marks. It must still operate on one source code point and
must not broaden the separate Spanish dehyphenation alphabet. Add `date` to
the existing compound guard instead of introducing a new scan or allowlist.
Displayed text, half-open source spans, bounded lookahead/work, malformed-input
preservation and code/foreign-language behavior remain authoritative.

For containment, invalidate run identity and release preparation/playback first
as today. If there is an active cancellable scope, retain cancel, operation
settlement and final shutdown. Otherwise initiate and await bounded shutdown
before awaiting the captured operation; avoid an unnecessary second successful
shutdown. Keep the original absolute five-second deadline, two-second termination
limit, fallback/error classification, zero-ownership verification, failed-owner
retention and single explicit recovery. Do not hide a real cleanup failure.

For native synthesis, the final lifecycle lock arbitrates which operation wins.
When it observes invalidation, return `Cancelled` even if `result` is `Ok`, dropping
the owned PCM. When completion wins and clears its active identity, later cancel
may report invalid state as before. Do not add the operation mutex to cancel,
hold lifecycle locks during termination, or remove the client's stale-byte guard.

EPUB text stays local, inference stays local, audio remains bounded in memory,
and no text/audio is logged or persisted. Synthetic repository-owned fixtures
are sufficient. No copyrighted books, private paths, raw book output or model
weights belong in tracked evidence.

## Milestones

### M0: Freeze scope and evidence decisions — not started

After separate execution authorization, record actual HEAD, worktree ownership,
closed changed paths and relevant tool/environment identities. Recheck the
four defect sites if the base has moved. Do not overwrite unrelated changes.
Create a new ignored receipt root under
`tmp/evidence/four-finding-minimal-corrections/`; never overwrite old receipts.
Capture consumed source/test/config membership, dependency/library identities,
generated exports and applicable host artifacts before the first gate.

No complete baseline suite is required. Use the targeted failing regressions
below on the original production bytes as the defect baseline. An unrelated
baseline failure needs diagnosis, not blanket reruns or an assumed old PASS.

### M1: Correct the two narration boundaries — not started

Extend the existing source-mapping fixture, preferably one table per invariant:

- Preserve `8١`, `١8`, fullwidth and astral numeric adjacency; retain letters,
  combining marks, code/foreign text and the standalone `8` -> `eight` control.
- Preserve `1/24/07/2026`, `24/07/2026/1` and attached ISO-date extensions in the
  appropriate language. Retain standalone accepted dates with punctuation.
  Existing compound time/percentage/currency cases must continue passing.
- Add a small public `prepareNarration` table for both defects, exercising the
  current Piper/Chatterbox profiles and the underlying bilingual profile. Assert
  unchanged semantic text and exact code-point source endpoints; extend existing
  public helpers instead of adding a fixture framework or snapshots.

Run only the new `F4-` cases before the two local predicate changes. Then run
G-EPUB once on the completed unit. Keep frozen legacy behavior unchanged.

### M2: Correct startup failure containment — not started

Use the coordinator's fake client, deferred promises, backend and clock. Hold
`prepare()` in loading, select a non-default rate through the public coordinator,
and reject backend preparation. Make shutdown settle the held preparation.
Assert shutdown occurs before that settlement, successful cleanup leads to
`recovery-available`, there is no autoplay, and all old ownership is released.
An explicit retry may start one fresh identity; stale completion cannot mutate it.

Include a failing-shutdown or over-deadline control that remains contained with
recovery disabled. Reuse SAC-10's existing shared-deadline and active-synthesis
coverage, plus the existing normal Stop/startup cases; do not duplicate those
fixtures. Use virtual time, not a real five-second wait or an unbounded promise.
Register cleanup in `finally` so the deliberately failing pre-fix run also ends.

Run the new `F4-03` subset on original coordinator bytes, apply only the ordering
change, then run G-DESKTOP once after the batch's EPUB exports are current.

### M3: Correct native cancellation result arbitration — not started

Use `CommandFixture`'s valid synthetic completed waveform. Add, only if needed,
one `#[cfg(test)]` hook after `result` is constructed and before the final
lifecycle lock. Follow the existing thread-local hook pattern and clear it via
fixture teardown. The hook must call the real `cancel()` path in the exact race
window; merely assigning `active = None` or testing a new helper is insufficient.

Prove two orders: cancellation wins and synthesis returns `Cancelled` with no
successful payload; completion wins and ordinary synthesis still succeeds.
Existing protocol/timeout tests preserve non-cancellation error containment.
Avoid sleeps, probabilistic stress loops, a new synchronization dependency or
production-only test behavior. The regression must fail on the old `map_err`
logic before changing that decision. Run G-RUST in both configured feature modes.

### M4: Combined acceptance and documentation — not started

Finish fast gates before native preparation. Build one current desktop artifact
and run one existing Piper EN native arm. Record exact results and cleanup.
Document the corrected current boundaries in the overview, update this plan,
then request one `change_reviewer` (GPT-6 Astra high) assessment of the frozen
patch and host receipts. The reviewer reads evidence and runs no tests.

Resolve actionable findings with affected-gate reruns only. Missing receipts,
unavailable reviewer or failed cleanup block acceptance. Final approval must
match the exact patch; documentation-only follow-ups require a new assessment
but may retain demonstrably unaffected runtime results. Archive the plan and
update indexes only after all required work is accepted. Any later commit,
push or PR requires its own applicable authorization.

## Testing and benchmark strategy

### Reviewed historical evidence and reuse decisions

The following tracked records and selected original ignored JSON receipts were
read during planning. Original receipt/log existence is not equivalent to a
complete current input/environment comparison. No historical runtime PASS is
accepted for the future patch at this stage.

| Existing evidence | Recorded outcome | Reuse decision for F4 |
| --- | --- | --- |
| [SFA ledger](../evidence/six-finding-audit-corrections/execution-ledger.md), `G4-epub` / `G4-matrix-final`; base `200144dd29709536b189cb593fe53e927a991dc4` | First six-file invocation exited 1: 241 passes and one new matrix failure. Separate matrix renewal exited 0, 18/18; ledger accepted 242 selected tests in combination. | Reuse fixtures, SFA-02 Unicode assertions and public locator helpers. Do not call the failed aggregate a PASS. The normalizer changes and missing new cases require fresh affected suites; no need to rerun unrelated XHTML/raster suites. |
| [MPA ledger](../evidence/minimal-playback-audit-corrections/execution-ledger.md), `G3-combined`; base `f2936b76b181ad748c7096ef1184961e242b6487` | Exit 0, 214 tests across worklet/player/coordinator/controls. Original receipt read. | Reuse backend-failure and cleanup test infrastructure. Coordinator changes invalidate its old result; player/client controls run in G-DESKTOP. No worklet/DSP implementation changes justify a fresh full DSP campaign. |
| [R7 ledger](../evidence/seven-finding-minimal-corrections/execution-ledger.md), `G6-supervisor-default-r2` / `G6-supervisor-locked-r2`; base `79bcb814d57c3b8016c1c1315684c1eb158e2a59` | Original receipts exit 0. Ledger records 33 default / 32 release-locked supervisor passes, five ignored per mode. | Reuse synthetic sessions, deterministic hooks and both exact module commands. The native result-path edit requires both module runs again; ignored real-model tests are not passes. |
| [PSC ledger](../evidence/minimal-playback-state-corrections/execution-ledger.md), `R2-G2-readers` and `R2-G4-controls`; base `3cdab0b32e087a135eedf6822f033794295b9af2` | 49 reader/save tests and three browser controls freshly renewed after PSC-R1 rejected incomplete installed-input evidence. `R2-G2-readers` original receipt read. | Historical boundary coverage only. Reader layout/persistence are outside this patch; exclude their suites by impact analysis, not by pretending to reuse a current PASS. Do not reconstruct missing execution-time dependency proof. |
| Same PSC ledger, `G5-core` and `G6-piper-en` | Original receipts exit 0. Core manifest `526447762ae3eb26383dbc095cdc8350b50546ed4259497915cade936f85d324`; one Piper EN six-rate arm with cancellation and verified restoration. | Existing runtime/voice payload and matching driver are artifact-reuse candidates, subject to fresh integrity/readiness. Native executable and renderer consume changed inputs, so build and run them once anew. No package regeneration or model download is planned. |
| [PSC native restart follow-up](../evidence/minimal-playback-state-corrections/ci-restart-follow-up.md) | 68 Node harness tests and ordinary native smoke passed; startup/restart failures and bounded corrections are preserved. | Use the current versioned runner, including verified process exit. Old binary/runtime measurements cannot accept F4. No harness-source change means no new Node harness suite by default. |

The old ignored roots are `tmp/evidence/six-finding-audit-corrections/`,
`tmp/evidence/minimal-playback-audit-corrections/`,
`tmp/evidence/seven-finding-minimal-corrections/`, and
`tmp/evidence/minimal-playback-state-corrections/`; selected receipt basenames
above use `-result.json`. The tracked ledgers remain usable when local raw
files are unavailable, but their summaries cannot substitute for missing proof.

**What can actually be recycled:** existing tests/fixtures, unchanged verified
Piper/voice/driver assets, ordinary compiler caches, and individual successful
gates from the future F4 execution after their final consumed inputs stop changing.
**What cannot:** old affected test PASSes, old renderer/native binaries, incomplete
or failed receipts, and former model/performance measurements as current results.
Regenerate EPUB exports after the normalizer change; retain configured native
frontend build hooks. Do not copy stale `dist` output to avoid a build.

For any proposed result retention, record the original receipt, command, code and
artifact identity, complete consumed source/config/fixture membership, locks,
installed libraries/toolchain and relevant host/isolation conditions. Explain
why subsequent edits are not consumed and have the independent reviewer assess
that proof. Documentation-only edits can preserve runtime gates; a test/harness
edit invalidates the gates that consume it. An old base SHA alone cannot identify
uncommitted tested bytes. If proof costs more than a small affected run, rerun
that gate instead. Never rerun an already valid gate merely to rename its receipt.

### Required gates after execution authorization

All commands below run from the repository root in normal local PowerShell
outside the managed automation sandbox. They use configured scripts or the
existing Vitest/Cargo/native runner with supported selection arguments. Record
start/end, exit, counts, artifact identity and cleanup separately. All are
currently **NOT RUN**.

| Gate | Command / invariant | Timing and invalidation |
| --- | --- | --- |
| G-RED-EPUB | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts -t F4-` | Once with new tests and original normalizer; only intended F4-01/02 assertion failures count as reproduction. Ensure current package prerequisites first. |
| G-RED-DESKTOP | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t F4-03` | Once before coordinator correction; deterministic failure/cleanup, not a hung test. |
| G-RED-RUST | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::f4_` | New tests/hook with old result decision, default mode only; cancel-wins fails and success control passes. |
| G-EXPORTS | `pnpm.cmd build:packages` | Before dependent checks when outputs are missing/stale, and after final EPUB edits. Build preparation, not a behavior PASS; unchanged exports may be retained only with input/output proof. |
| G-EPUB | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts` | One completed-unit run: frozen/accepted normalization controls, public profiles/locators, cancellation/work/retention bounds. Normalizer, transitive sources, fixtures, config, exports or runner drift invalidate it. |
| G-DESKTOP | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/pcm-playback.test.ts src/tts/process-client.test.ts` | One combined run after final TS/EPUB inputs: startup containment, ordinary cancellation/recovery, backend cleanup and frontend late-byte rejection. Source, exports, test or installed-input drift requires the affected suite again. |
| G-RUST | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::` and `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests:: --features release-locked-runtime` | Once each after final Rust edits. Covers both supported compile branches and supervisor error/lifecycle controls. Rust sources, fixtures, Cargo inputs/toolchain or environment drift invalidate it. |
| G-STATIC | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/desktop typecheck`; `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust` | Once for final relevant bytes, before costly preparation. Rust lint script already covers both modes. Renew only affected leaves; no Python checks for this patch. |
| G-CORE | `pnpm.cmd package:piper-core:check` | After fast gates, verify existing source/runtime/voice package before reuse. A failed check blocks preparation; it is not permission for a new manifest, download or package regeneration. |
| G-BUILD | `pnpm.cmd build:desktop` | One current native/renderer build after final sources and exports. Keep Tauri's configured frontend hook. Capture executable/renderer identities; do not rebuild between native execution and review without invalidating runtime evidence. |
| G-NATIVE | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | One current Piper EN arm, using the existing runner. Native handoff/cancellation, real WebView2/audio, rates and resource cleanup complement the deterministic race/failure tests. It does not claim to reproduce the narrow injected race naturally or validate a new model-quality/performance claim. |
| G-DOCS | `pnpm.cmd check:evidence`; `git diff --check`; read-only review of changed relative Markdown targets and scope | Final documents/evidence. These do not require rerunning runtime suites when their inputs remain identical. |
| G-REVIEW | Independent `change_reviewer` with exact diff/identities and all gate receipts | Required final APPROVE for implementation; unavailable evidence/reviewer or drift blocks acceptance. No independent runtime review is required for this planning-only commit. |

The minimum post-fix behavioral selection is three EPUB files, three desktop
files, the supervisor module in two feature modes and one native Piper arm.
The red subsets establish new behavior before correction; they do not require a
second complete pre-change suite. Execute selected files once after all their
edits rather than repeating a whole suite per finding. Existing native speed
coverage is reused as one supported runner mode, not a new six-profile portfolio.

No standalone Chromium sweep is selected: no UI, renderer integration or worklet
code changes, coordinator failure is deterministic in G-DESKTOP, and G-NATIVE
covers the real renderer/audio path. No full `check`/`check:portable`, entire
workspace test matrix, unrelated shared/Python/optional-download suites, frozen
corpus rewrite, GPU/listening/RTF benchmark, second language/model arm, installer
or firewall campaign is required by this bounded patch. These are impact-based
exclusions, not reused PASS claims. Widen the gates if implementation changes
those boundaries or the reviewer identifies a concrete uncovered invariant.

### Native preparation, cleanup and failure handling

Inspect current versions/locks, WebView2/driver compatibility, available scratch
and disk, resource manifest and initial process/resource identities before
G-BUILD/G-NATIVE. PSC restored an older adjacent resource tree after its temporary
current-package run; do not assume the executable's adjacent resources are ready.

Use the versioned runner for execution and cleanup. If the same temporary
verified-core placement is necessary, reuse the documented PSC resource-swap
procedure with a new F4 journal/receipt namespace and the new executable identity;
never rerun its old hard-coded binary wrapper as current evidence. Before any
mutation record exact target, original membership/size/hash inventory, backup,
intended operation and restoration. Verify the copied manifest and complete tree;
restore the original resources in `finally` on every outcome. Do not delete
pre-existing scratch roots, overwrite the user's installed app or upgrade models.

Verify zero new owned processes/scratch, released audio, no generated audio files
and restored original resource membership/bytes. Process ownership uses PID,
creation time and executable identity. Cleanup failure blocks acceptance even if
assertions pass. Retain failed receipts, distinguish product/harness/environment
failures, and allow at most one infrastructure retry with a concrete changed
condition. A repeated failure requires diagnosis and a revised plan, not an
until-green loop or disabled assertion. Keep long-running gate/process identity
so an interrupted coordinator resumes observation rather than duplicating work.

## Risks and rollback

- A wider lexical category could affect other predicate callers. Keep the change
  to Unicode numeric adjacency and run existing abbreviation, punctuation,
  hyphenation and source-mapping controls in the selected normalizer file.
- A date guard could suppress valid punctuation-delimited dates. Positive
  standalone/punctuation controls must pass in both applicable languages.
- Shutdown ordering could weaken real failure containment. Preserve deadlines,
  cancellation-first synthesis, identity checks and retained failed owners;
  require both successful and failed cleanup outcomes.
- A cancellation regression could serialize away the real race. Inject precisely
  before final result arbitration, call real cancellation and test both winners;
  do not lock the whole operation or rely on timing probability.
- Old package/executable evidence is easy to misattribute. Reuse only verified
  immutable assets, build the changed artifact once, bind all receipts to it,
  and verify restoration separately.

If a unit fails, stop and preserve evidence; adjust only its bounded patch.
Any authorized rollback should revert the affected unit and its new regressions
together, preserving unrelated user work. There is no persistence migration,
package upgrade or schema change to undo. Do not reset the repository or delete
historical evidence. Host resource restoration remains mandatory independently
of code rollback.

## Progress log

- 2026-10-31: Revalidated the four accepted sites on clean planning base
  `d4622a1c5abcd19a6c5c26a8cfd242f9591a5f33`; excluded the withdrawn packaging
  concern. Read relevant product/architecture/plan rules and existing fixtures.
- 2026-10-31: Read SFA, MPA, R7 and PSC ledgers plus selected original receipts;
  separated historical coverage, artifact reuse and fresh affected gates.
- 2026-10-31: Prepared this unexecuted plan and active-index entry on
  `codex/four-finding-minimal-corrections-plan` for the authorized local
  documentation commit. No implementation, tests, builds, lint or host mutation
  performed. Git branch creation is the only non-document setup mutation.
- M0-M4 implementation/acceptance: not started; require separate authorization.

## Discoveries and decisions

- Group F4-01/02 because they share one normalizer and public preparation path.
  Preserve frozen historical v1 behavior and add current-profile regression cases.
- Reuse the already-correct Stop ordering for F4-03 without a shared-helper
  refactor. The trigger is failed audio preparation during loading, not every
  speed change or ordinary startup.
- Keep F4-04 at P3: native publication violates its cancellation contract, while
  the current TypeScript client independently invalidates and discards late PCM.
- No old affected test result can accept a changed owner. Historical tests guide
  selection; fresh narrow gates are cheaper and clearer than reconstructing
  incomplete proof. Retain valid new gate results through unrelated later edits.
- Existing package contents may be reused after checking them; existing final
  executable measurements may not. No package-generation fix is part of F4.
- Planning-only documentation is exempt from behavioral change review. Future
  implementation still requires the named independent reviewer and host gates.

## Final validation results

Planning: source, existing tests, scripts and historical receipts inspected
read-only; scope and proposed commands reviewed against repository configuration.
No test, build, lint, type, package, browser/native or automated documentation
validation command has been executed for this plan. No new PASS is asserted.

Implementation: **NOT STARTED**. G-RED through G-REVIEW: **NOT RUN**.
Historical runtime results accepted as current F4 evidence: **none**.
Asset reuse: **candidate only**, pending fresh integrity and host readiness.
Independent implementation review: **not requested; pending execution**.
Runtime/contract/architecture files changed by this planning task: **none**.
