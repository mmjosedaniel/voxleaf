# Validated audit follow-up

Status: **Planning only; implementation and acceptance have not started.**
Created: 2026-10-28. Planning base: `cd4d1603942e73fac51c06df6943d8f0466ed9d0`.
Planning branch: `codex/validated-audit-follow-up`.

The current authorization is to create this plan, its active-index entry, a
branch and one local documentation commit. It does not authorize executing the
plan, tests, builds, installation changes, downloads, push, PR or publication.
The commands below are instructions for a separately authorized execution.

## Goal

Resolve the twelve retained findings from three static audits with changes in
their existing owners. Preserve current contracts, dependencies, frozen
authorities and unrelated behavior. Reuse existing fixtures and independently
eligible evidence, and run each necessary acceptance gate only on the final
inputs it validates.

Keep the original finding numbers H1-H13 so the excluded H5 cannot silently
return to scope. H8 is a valid contract-edge defect; its occurrence with real
models has not been demonstrated. Static confirmation is not runtime acceptance.

## User-visible outcome

- Optional compatibility rechecks reconcile narration consistently, and keyboard
  focus remains in Settings while a compatibility check is pending.
- Changing appearance after narration completes preserves the inspected passage
  without following the retained old highlight.
- Valid nonempty sub-millisecond audio can finish without leaving preparation
  stuck; durations and sample counts remain truthful.
- English address abbreviations are preserved conservatively, and narration
  segments do not split a base character from a following combining mark.
- Cancellation followed by a request failure is reported as cancellation;
  explicitly requested preference deletion reports incomplete cleanup.
- Failed lifecycle validation removes its owned installation before restoring
  original data and reports any cleanup failure.
- Future benchmark output detects fragmented sensitive values, reports truthful
  privacy/cleanup gates, and actually randomizes quality presentation order.

## Current state

The planning base is clean `main`, following the completed SAC-01-SAC-15 work.
The current runtime is Piper core plus optional Chatterbox V7; Qwen remains
development-only. Existing tests and historical receipts were read, not run.
Four read-only investigations rechecked callers, guards, contracts and tests.

| Finding | Evidence in the current implementation | Bounded acceptance criterion |
| --- | --- | --- |
| H1 | `ReaderSettingsDialog.tsx`, `OptionalChatterboxSettings.onRecheck`, calls only `hardwareCompatibility.check`. A persisted Chatterbox preference can become admissible after Piper has started, without coordinator reconciliation. | Reuse the existing explicit-recheck reconciliation path. Changed selection is contained; unchanged selection keeps playback; no automatic start or download. |
| H2 | `tts_optional_chatterbox.rs`, `download_artifact` request `.send().map_err`, does not inspect cancellation, unlike the response-body error path. | Cancellation already requested when the pending request fails wins over a request-failure diagnostic. Ordinary failures remain failures; cleanup remains mandatory. |
| H3 | `benchmarks/diagnostics.py` checks the current write and a fixed first 65,536-byte prefix. Split forbidden values after that prefix are missed. | Detect matches across writes before, across and after the capture limit with bounded state; publish no captured text. |
| H4 | v8/v9/v10/v11 screen payload builders set privacy and cleanup audits to `True` even with matching failure codes. | New reports cannot claim a passed audit after that audit failed or was not established. Global rejection remains intact. |
| H6 | `narration-bilingual-normalizer.ts` applies the English `Dr.`/`St.` replacements without the title context that distinguishes `Oak Dr.`/`Baker St.`. | Preserve ambiguous address forms; retain the exact accepted contextual corpus outputs and source spans. |
| H7 | Settings' focus selector omits `summary`; its trap handles only the selected first/last element. | Real Tab from the last summary during a pending check stays in the modal, including reverse traversal. |
| H8 | `AdaptiveBufferScheduler.acceptCompletedUnit` mutates FIFO/active synthesis before a complete remaining duration of zero is rejected; error handling then fails again. | A sole complete nonempty unit below 1 ms is accepted, played, consumed and released without a throw, unhandled rejection or stuck state. |
| H9 | `nsis-hooks.nsh` checks residual Chatterbox data but not the independently requested preferences subtree. | Failed or unsafe preference cleanup yields a truthful unsuccessful outcome while preserving unsafe/unrelated data and independent Chatterbox handling. |
| H10 | `SegmentHighlightController.reconcile` retains a complete highlight; preference-driven `refresh` can still scroll/settle to it. | Keep the completed decoration, but revoke its follow/navigation/locator-settlement authority. Preserve current reflow location. |
| H11 | `narration-segment-packer.ts` recognizes only five combining-mark ranges, excluding U+3099. | No boundary inside an admitted base-plus-combining sequence; backtrack or return the existing bounded resource error. |
| H12 | Quality generators shuffle sample IDs, then render samples in corpus order. | Shuffle actual presentation records once, preserving case/audio/ID correspondence and generation order. |
| H13 | `test-windows-package-lifecycle.ps1` installs before fallible checks, but its `finally` does not uninstall. | On success/failure/catchable interruption, remove only the owned installation before restoring original data; preserve primary and cleanup failures. |

H5 is excluded: compact tables/definition lists can concatenate their text, but
[ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md)
does not promise those structures. Its earlier P2 classification was withdrawn.
No table renderer or new XHTML boundary policy belongs in this plan.

The scope does not claim a privacy leak (H3), acceptance of a rejected candidate
(H4), a specific final persisted winner in the H10 race, or invalid historical
quality scores (H12). H8 requires the complete available tail to round to zero;
it is not triggered by every small final unit when sufficient prior audio remains.

## Scope and non-goals

One integration batch contains four cohesive implementation groups:

1. Desktop state/focus/playback: H1, H7, H8, H10.
2. Narration preparation: H6, H11.
3. Benchmark helpers: H3, H4, H12, including the same confirmed helper defect
   across existing v8-v12 callers, without changing historical results.
4. Download and Windows lifecycle: H2, H9, H13.

Prefer local guards, reuse of existing callbacks, and existing test fixtures.
Do not create new coordinators, services, frameworks, dependencies, broad
refactors or production fault-injection options. Tests may use narrowly scoped
existing seams or a small test-only seam when the production path cannot
otherwise be exercised. Unrelated fixes require a separate disposition.

No protocol/profile/schema/version change, model/runtime rebuild, model download,
voice evaluation, all-rate campaign, full online acquisition, public signing or
release is intended. Do not edit generated files, completed plans, prior
receipts, benchmark results, frozen corpus/profile/authority files or their
hashes. Future acceptance does not itself authorize commits or external writes.

## Relevant files and documentation

Production/helper ownership, relative to the repository root:

- Desktop: `apps/desktop/src/settings/ReaderSettingsDialog.tsx`,
  `apps/desktop/src/tts/adaptive-buffer-scheduler.ts`,
  `apps/desktop/src/reader/segment-highlight-controller.ts`. Inspect existing
  `App.tsx`, `HardwareCompatibilityControls.tsx`, `hardware-profile-compatibility.ts`,
  `product-narration-coordinator.ts` and `ReaderPublication.tsx` as callers;
  edit a caller only when the bounded correction requires it.
- EPUB: `packages/epub/src/narration/narration-bilingual-normalizer.ts` and
  `narration-segment-packer.ts`; inspect scanner, preparation and finalizer.
- Python, under `services/tts/benchmarks/`: `diagnostics.py`;
  `bilingual_screen.py`, `corrective_v9_screen.py`, `chatterbox_v10_screen.py`,
  `chatterbox_v11_screen.py`; `bilingual_quality.py`, `corrective_v9_quality.py`,
  `chatterbox_v10_quality.py`, `chatterbox_v11_quality.py`,
  `corrective_v12_quality.py`. The v12 machine builder already derives these
  audit failures; do not modify it by analogy.
- Windows: `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, its
  `tts_optional_chatterbox/tests.rs`,
  `apps/desktop/src-tauri/windows/nsis-hooks.nsh`,
  `scripts/test-windows-package-lifecycle.ps1`; inspect
  `scripts/windows-package-lifecycle-data.ps1` without duplicating its ownership
  and restoration logic.
- Tests: existing files selected below, plus
  `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts` and
  `apps/desktop/scripts/windows-release.node-test.mjs`.

Read [product requirements](../../product/mvp.md),
[reader settings requirements](../../product/reader-settings-and-playback-controls.md),
[system diagram](../../architecture/system-diagram.md),
[overview](../../architecture/overview.md),
[synchronization authority](../../architecture/synchronization-authority-v1.md),
[narration normalization](../../architecture/narration-normalization-v2.md),
[preparation limits](../../architecture/narration-preparation-limits-v1.md),
[ADR-0047](../../architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md),
[ADR-0063](../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md),
[ADR-0066](../../architecture/decisions/ADR-0066-bounded-orientation-and-silent-tail-corrections.md),
[completed M005](../completed/M005-narration-text-preparation.md),
[testing](../../development/testing.md),
[evidence retention](../../development/evidence-retention.md) and
[independent change review](../../development/agentic-change-review.md).

During implementation, document the bounded narration correction in one
additive ADR (next available number; 0067 at planning), rather than altering
frozen normalization/limits authorities. Update maintained behavior/testing
documentation for the actual changes, and record benchmark corrections as
prospective. Review M005's completed boundary and the diagram; change the
maintained diagram only if an actual architectural boundary changes. Do not
rewrite M005's historical implementation claims.

## Architecture and constraints

Keep EPUB text and inference local, audio transient, locators source-mapped,
queues bounded and cancellation identity-safe. Preserve the existing component,
process and persistence topology, protocol v1, profile IDs, model inputs outside
the explicitly corrected English contexts, and default uninstall retention.

Keep `english-normalization.ts`, Spanish tables, `narration-v1`, frozen corpora,
normalization/limit authorities and accepted evaluation artifacts unchanged.
The English matcher and segment packer are mutable implementations; accepted
corpus cases must remain byte-identical. If a proposed rule requires changing a
frozen accepted output or contract, stop that part and revise the plan instead
of refreshing authority hashes.

All future execution/validation commands run in normal local PowerShell outside
the managed sandbox. The director owns scope; one writer works at a time on
coupled files. One independent `change_reviewer` reviews the final behavior
patch and matching host evidence. This is a bug-fix batch, not a refactor
campaign; use its evidence-reuse principles without imposing refactor roles.

## Milestones

### M0: Freeze scope, recovery and evidence choices — not started

After execution authorization, recheck HEAD, branch, dirty/index state and the
twelve triggers. Record exact owned paths and consumed dependencies, including
test discovery membership, locks, configuration and generated/build inputs.
Keep raw receipts under ignored `tmp/evidence/validated-audit-follow-up/` and
concise later records under `docs/plans/evidence/validated-audit-follow-up/`.

Retrieve the historical receipts listed below. Record each gate as fresh-run,
reuse-candidate, reused with proof, or not applicable with a reason. No result
has been approved for reuse during planning. Do not rerun a complete old suite
merely to create a baseline: add the missing regressions and capture their
intended failure before each corresponding production correction. A fixture
failure is not a reproduced product defect.

For host-mutating checks, record owned paths/process identities, original state,
restoration and verification before mutation. A pre-existing user installation
blocks lifecycle execution unless removal/reinstallation is explicitly
authorized; a suitable disposable account is an alternative. This planning
request gives no such permission. Verify existing tool/runtime prerequisites
before expensive preparation; do not install or download them by default.

### M1: Implement bounded corrections and regressions — not started

**Desktop.** H1 connects the optional awaited recheck to the existing explicit
recovery/reconciliation callback; do not duplicate stop/start logic. Test the
persisted Chatterbox preference initially rejected for available resources,
Piper already playing, recovery of those resources, and optional recheck without
an intervening visibility refresh. Preserve no-change playback and no auto-start.
H7 includes native `summary` focus targets in the existing trap. Adjust hidden
or effectively disabled filtering only as required to identify the actual first
and last focusable control; do not broaden into an accessibility redesign.

H8 makes final nonempty PCM playable using sample-frame truth even when the
displayed whole-millisecond duration is zero. Do not invent a 1-ms duration,
raise protocol minimums or alter frozen thresholds. Cover 1/23/24 frames at
100% and 1/17/18 at 75%, consumption/release/completion, and the coordinator's
error path. H10 separates retained highlight painting from eligibility to
follow, navigate or settle locators after completion. Cancel obsolete pending
follow work; keep the final end settlement and playing/paused behavior. Test
complete A, passive scroll B in the same spine, then theme/text-scale change;
assert B remains authoritative and no old-start settlement is emitted.

Extend the existing Settings, App/coordinator, scheduler, ReaderPublication and
highlight-controller tests. One browser scenario can combine H1/H7/H10 using
the existing synthetic service. Add only the missing optional-package/deferred
probe controls to that fixture. Use real keyboard Tab and real layout; a jsdom
keyboard event alone cannot prove focus containment.

**EPUB.** H6 first freezes an additive context matrix: preserve `Baker St.` and
`Oak Dr.`, retain `Dr. Morgan`, `Mr. Reed`, `St. James Station` and the complete
accepted corpus. Prefer a bounded conservative contextual guard; do not infer
arbitrary names or expand ambiguous addresses to Street/Drive. Preserve source
spans and any needed abbreviation-period protection. H11 uses complete Unicode
mark classification in the existing owner (for example the runtime's `M`
property), without a new dependency or a general grapheme/ZWJ implementation.
Cover U+3099 and marks outside the old ranges, existing U+0301 controls, exact
limits, backtracking, indivisible overflow, one/many-batch equality, bounded
work/cancellation and unchanged display text through public preparation.

**Benchmark helpers.** H3 retains bounded incremental matching state across
writes, independently of the fixed diagnostic prefix. Define the bound against
the existing forbidden values; do not retain the output stream or grow a new
unbounded buffer. Test Unicode, split matches before/at/after the cap, negatives,
discard and propagation through the existing harness/isolation boundary.
H4 corrects all four confirmed screen builders using available execution/failure
evidence. Unknown audit success must not become `True`; use existing schema
representations conservatively. Test privacy/cleanup failures, positive controls
and v8 summary derivation; preserve global rejection and quality admission rules.
H12 shuffles actual sample records once before rendering/writing maps in all
five affected generators. Keep synthesis order and the audio/case/ID mapping
unchanged. Use an injected deterministic permutation in tests, not a probabilistic
assertion that random output must differ. Preserve old private maps and results.

**Native and lifecycle.** H2 inspects the cancellation flag on request failure
before recording a new failure diagnostic. Extend SAC-02's real loopback test
to withhold headers, then cancel and release with an error. Exercise the same
request/error path as production, plus the uncancelled control and staging/
diagnostic preservation. A hook returning `Cancelled` directly is insufficient;
do not relax the production origin/URL policy for this test.
H9 adds an independent postcondition for the exact preferences subtree. Missing
is success; remaining, inaccessible or unsafe requested data is reported without
following a reparse point. Extend the existing compiled NSIS fixture's locked
file, junction, denied-parent and successful-retry cases, retaining default,
update, independent Chatterbox and unrelated-data controls.
H13 journals the exact destination's verified absence and intended ownership
before invoking the installer. Track the effects of that owned attempt even
if installation returns nonzero after partial creation. Attempt bounded
uninstall before data restoration and preserve primary plus cleanup errors.
Cover partial installation followed by a nonzero exit, failure after install/
first start, missing/failing uninstaller, and cleanup ordering through the real
script with temporary roots and PowerShell mocks. Interruption coverage means
interruptions that allow `finally` to run; retain the recovery journal for a
forced process termination or power loss, without promising automatic teardown.
Do not delete arbitrary install trees or use a failed cleanup as permission to
overwrite original data. Reuse the data companion's recovery invariants.

### M2: Final combined checks and minimum host preparation — not started

Run the relevant fast leaves once after final source/test changes. Use them as
the group's final green evidence; do not automatically rerun every focused
selection and then the same full suite. Renew only invalidated leaves after
corrections. One Python suite is the conservative default: the diagnostic helper
has many consumers and the last complete run took about 50 seconds, making a
large per-test dependency exclusion exercise a poor default.

Build the default desktop once for fresh WebView2 acceptance. Reuse verified
Piper/V7 payloads; never rebuild them just because app source changed. The NSIS
hook has an existing real compiled synthetic fixture, so a complete product
installer rebuild is not required solely for H9. A retained installer can be
the fixture for the corrected H13 harness, with a fresh lifecycle result.
That does not validate the new hook inside that old installer.

If actual changes reach installer integration/resources/template or acceptance
requires a newly packaged deliverable, build one final release-locked installer
and use it for all applicable lifecycle checks. The existing release wrapper
writes a historical tracked receipt: use its documented equivalent leaves and
capture new evidence separately, as the SAC ledger did. Never overwrite that
historical receipt to save a build.

### M3: Independent acceptance and closeout — not started

Finish the gate/reuse ledger and restoration checks, then freeze source, tests
and maintained documentation. Supply the exact diff, closed path identities,
base/HEAD, fresh and reused receipts, remaining limits and the criteria above to
one `change_reviewer`. Pause writing and Git while review runs. Resolve actionable
findings, renew only affected checks and obtain a new immutable review for the
exact resulting patch. Missing evidence or reviewer availability blocks acceptance.

After approval, record the Report ID and final outcomes, review the diagram and
M005 boundary, and archive this plan through the existing index workflow. Any
future commit/push/PR needs its own current authorization. Planning completion
must never be marked as implementation completion.

## Testing and benchmark strategy

### Existing evidence inspected and reuse decisions

Primary record: [SAC validation ledger](../evidence/static-audit-corrections/M3-validation-ledger.md),
[R3](../evidence/static-audit-corrections/review-R3.md) and
[archive R4](../evidence/static-audit-corrections/review-final.md).
Their recorded base/HEAD is `7c00f2f633ffd0c79043ab694f29b7defb46941a` with a
then-uncommitted patch, not this planning base. R3 is `SAC-R3-20261028-01`;
its manifest SHA-256 is
`55c9502516a6dc38057678686565c46f0ca4c9d693704f0d00fbcbbe31c3930d`.
The reviewed manifest, before/after/result receipts and `final-reuse-proof.json`
were located under ignored `tmp/evidence/static-audit-corrections/`. Receipt
existence and a historical PASS do not establish current input/environment equality.

| Historical receipt or asset | Recorded result / existing coverage | Decision for this batch |
| --- | --- | --- |
| `Q-ts-tests-01`, `A-owner-green-01` | Shared 210, EPUB 702, desktop 899, seven Node suites 102; owner green about 4.1 s | Reuse regression design. EPUB/desktop/Windows Node gates are invalidated by planned source/test edits. Shared-only gate is a candidate if its whole closure stays identical; do not label the old aggregate current. |
| `B1-reader-browser-03`, `N1-native-02` | Thirteen reader browser cases passed, about 171 s; final WebView2 smoke passed | Changed owners/bundle invalidate runtime results. Reuse synthetic fixtures and combine new browser scenarios. Renew affected reader coverage; no unrelated foundation/raster campaign by habit. |
| `Q-python-tests-01` and format/lint/types receipts | 678 tests passed in 50.25 s; Ruff and mypy passed | H3/H4/H12 invalidate consumed helper/test inputs and global checks. Run one final suite, not v8-v12 model evaluations. |
| `Q-python-build-01`, its artifact receipt and retained archives | Wheel/sdist passed; archive membership was inspected during planning | Neither archive includes `benchmarks/**` or `tests/**`: wheel has runtime module/metadata, sdist has `pyproject.toml` and runtime sources/metadata. Strong reuse candidate when those complete inputs, backend/environment and artifact bytes match. Helpers alone do not require a rebuild. |
| `Q-rust-tests-01`, `Q-rust-lint-02` | 139 default / 138 release-locked tests passed; seven explicitly ignored cases per configuration | H2 invalidates Rust results. Run both configurations once on final source. Existing ignored GPU/loader diagnostics are not silently counted as executed. |
| `L1-lifecycle-02` | Install/first start/repair and six silent scenarios passed; original data restored | New H13 script and H9 hook require fresh respective evidence. Old installer can be an identified harness fixture only. Old lifecycle PASS cannot validate the new script. |
| `Q-evidence-tests-01` | 31 evidence-guard tests passed | Strong result-reuse candidate: script/config/fixture membership and tools must remain identical. `check:evidence` itself reads current Markdown/index and must be renewed. |
| `P-core-check-01`, V7 runtime/model manifests | Retained Piper core and V7/official model payloads verified | Reuse bytes after fresh identity/readiness checks where needed, not old execution claims. No download or runtime reconstruction by default. |
| `H-CPU-01`, `H-GPU-01`, prior NLC/listening evidence | Piper EN and V7 ES/EN lifecycle passed on their exact binaries; DSP/listening decisions retained | Background for unchanged models/DSP. Do not repeat quality/all-rate/GPU matrices merely for UI or benchmark tooling. These receipts do not approve the newly built app. Conditional model gates below remain explicit. |

The retained SAC installer SHA-256 is
`445af623e2e1cade3ca62823e3ffabf7f98523ad5a6ad3dfd40b215f2172ee52`.
This is an identity to verify if used, not proof that its bytes still exist or
that it includes these future corrections. Planning did not hash model payloads
or run model/OS preflight. The documentation-command launch exposed the pnpm
version mismatch recorded below; historical toolchain equality is not assumed.

The Python artifact receipt records wheel SHA-256
`aa64cff5f00c405eea7fe44ab0957734150e43422ecbd59c82f62da783c3fc7f` and sdist
`f36b49fe7174416556fc7353a7841af00cd43a54624b0cbd672a52f27c9b7255`.
`pyproject.toml` has no custom build inclusions or build script. At M0 verify
the complete `src/voxleaf_tts/**` membership/bytes, packaging metadata and
`uv_build` version/environment against that receipt before reusing this leaf.

Apply the [canonical reuse proof](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md):
retrieve an immutable host receipt; prove identical source/transitive imports,
fixtures, discovered membership, configuration, locks, toolchain, build inputs,
artifact bytes and relevant host conditions; account for HEAD if consumed;
show the same invariant and the changed paths that are independent of it.
The new independent reviewer records the comparison and original receipt ID.
Unknown inputs or drift require the affected leaf, not fabricated approval
hashes. Never reuse R3/R4 as approval of this new patch. No old pass is accepted
for reuse in this planning commit.

### Regression selections and commands

All commands use repository-root cwd unless stated. These are existing package
scripts or scoped invocations of their configured Vitest/pytest/Cargo/Node
runners. Read current configuration again at execution. Planning-only document
checks are recorded separately below and are not implementation acceptance.
New regression titles use `VAF` (Python names `vaf_`) so the
same scoped selection can establish the intended red/green boundary.

| Gate | Existing command / selection | Timing, inputs, invalidation and minimum obligation |
| --- | --- | --- |
| D-Desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/settings/ReaderSettingsDialog.test.tsx src/App.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx` | Directed red/diagnosis; final green controls come from F1, not a second full direct invocation. JS/React/jsdom, shared/EPUB dist, fixtures/config/locks. Use `-t VAF` for focused reproduction; do not send Vitest filters through desktop `test`, which chains Node commands. |
| D-EPUB | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-boundary-scanner.test.ts src/narration/narration-segment-packer.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts` | Directed red/diagnosis; final green controls come from F1. Use `pnpm.cmd build:packages` only if current required dist is unavailable. Preserve frozen corpus and limits; current source/fixture/Unicode runtime inputs invalidate old results. Add assertions only for actual gaps, not one new test in every listed file. |
| D-Python | `pnpm.cmd test:python -k vaf` | New missing cases before production corrections; the configured pytest suite accepts `-k`. Final unfiltered `pnpm.cmd test:python` covers these plus all consumers once. All helpers, schemas, corpus/authorities, tests and their discovered inputs belong to the closure. |
| D-Native | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests` | Real loopback blocked-before-headers regression and controls. Run default for the focused red; final two-configuration Rust gate supplies complete green coverage. Preserve origin policy and test cleanup. |
| D-Windows | `node --test apps/desktop/scripts/windows-release.node-test.mjs` | Directed red/diagnosis of the real compiled NSIS hook and temporary-root PowerShell fixtures. Final green coverage comes from F1's same Node leaf, unless F1 is explicitly decomposed to credit this already-passing leaf. Missing NSIS/Windows is blocked, not a passing skip. Fresh hook/script/fixture and NSIS/PowerShell identities required. |
| B1 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` | One final reader-spec run, including the new combined VAF case and existing SAC/NLC/NCC/LCF controls. Wrapper already builds required packages/frontend. Use `--grep VAF` only for directed failure diagnosis, not as a substitute for affected existing controls. Changed bundle invalidates prior browser results. |
| N1 | `node apps/desktop/scripts/native-startup-smoke.mjs` after the current default desktop build | One fresh WebView2 smoke on the current binary; reuse build, not prior runtime PASS. Browser-specific focus/layout assertions remain B1; extend the existing native fixture only if browser/native divergence or an uncovered native-specific behavior demands it. |
| L1 | `pnpm.cmd package:windows:lifecycle` | One fresh real lifecycle invocation with an identified installer and authorized clean entry state. Node fault cases establish failure cleanup; L1 establishes real process/install/data restoration integration. Reuse retained installer only as the H13 fixture; new H9 behavior is proved by compiled NSIS cases. No model inference. |
| F1 | Applicable `check` / `check:portable` leaves in the next table | Once on final relevant inputs. Attribute reused gates individually and keep pending obligations visible; neither aggregate is claimed executed when only leaves ran. |

Python regressions extend `test_benchmark_harness.py`,
`test_benchmark_isolation.py`, `test_benchmark_bilingual_screen.py`,
`test_benchmark_corrective_v9_screen.py`,
`test_benchmark_chatterbox_v10_screen.py`,
`test_benchmark_chatterbox_v11_screen.py`,
`test_benchmark_bilingual_baseline.py`, `test_benchmark_corrective_v9_quality.py`,
`test_benchmark_chatterbox_v10_quality.py`,
`test_benchmark_chatterbox_v11_quality.py` and `test_benchmark_corrective_v12.py`.
Use parameterized cases for shared invariants. Do not create model-backed tests
for deterministic diagnostic, metadata or sample-order behavior.

### Final graph and conditional expensive gates

| Obligation | Minimum scheduling |
| --- | --- |
| Evidence/documentation | Fresh `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence` may reuse its proven independent receipt. Manually inspect plan/ADR/local links and final diff; no Markdown-specific validator is configured. |
| TypeScript | `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript`, and final `pnpm.cmd test:typescript`. The last includes shared generator/package preparation, EPUB, desktop Vitest and seven Node suites. Count final D-Windows inside this graph when inputs/environment match; do not repeat it afterward. A proven shared-only receipt may replace only that leaf, with an explicit graph mapping. |
| Python | `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`, `pnpm.cmd typecheck:python`, `pnpm.cmd test:python`, and `pnpm.cmd build:python` unless complete build-input independence is proved. Run once on final Python inputs; no full before-edit baseline. |
| Rust | `pnpm.cmd format:check:rust`, `pnpm.cmd lint:rust`, `pnpm.cmd test:rust`; keep default and release-locked variants. No unchanged ignored GPU diagnostic is implied by this test result. |
| Builds | `pnpm.cmd build:desktop` after required package preparation; its Tauri build includes Vite. Credit that Vite leaf to portable coverage only with equal inputs/config/environment. Typecheck/browser pre-builds can supply package preparation if identities match. Preserve Python packaging coverage separately. |

Do not execute both broad aggregates and every constituent again. If precise
leaf equivalence/reuse cannot be proved, execute the original applicable
aggregate once rather than silently omitting coverage. A focused green result
may supply final coverage only for the exact selected tests and unchanged
inputs; it never substitutes for the rest of a required suite. CI obligations
are not waived by local deduplication.

Fresh model inference is **conditional**, not a default gate for these findings.
The intended patch leaves adapters, models, DSP, native supervision and runtime
bootstrap unchanged. H8 is proved with legal synthetic PCM; H6/H11 with exact
prepared text/ranges. If the actual patch changes inference/process boundaries,
audible handoff/DSP behavior, or leaves a regression unresolved, add the
applicable existing gate before acceptance: the Piper EN post-build native
adaptive arm, and/or `pnpm.cmd test:chatterbox:v7:native-startup`. The Piper arm is
`node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en`.
Do not invoke unfiltered Qwen/resilience/all-profile aliases.

A new packaged deliverable, if required under M2, uses the existing leaves
`pnpm.cmd package:piper-core:check`, `pnpm.cmd package:windows:check`, and
`pnpm.cmd --filter @voxleaf/desktop tauri build --config src-tauri/tauri.release.conf.json --features release-locked-runtime`.
Capture new hash/signature/evidence observations separately through the existing
release tooling without its historical-receipt `--write`. Then L1 uses those
exact bytes. Check core bytes; do not reconstruct an unchanged Piper payload.
No live HTTP artifact download or multi-gigabyte acquisition replay is required
to prove H2's local request/cancellation race.

## Risks and rollback

- Ambiguous English expansion can change meaning: preserve uncertain forms and
  accepted corpus outputs; no broad heuristic or retrospective authority edit.
- Mark handling must not increase source/work limits or create nonprogressing
  packing. Retain rejection and cancellation controls.
- Focus and completed-highlight fixes can change active/paused behavior: retain
  existing controls and one real browser integration run.
- Tiny PCM may expose downstream assumptions: exercise coordinator/player
  consumption and release, not just a private arithmetic helper.
- Benchmark changes must not recalculate old results or claim new model quality.
  All prospective audit fields stay within existing schemas.
- Uninstall cleanup can affect user state: bounded exact ownership, no reparse
  traversal, journaled recovery, uninstall before restoration, and fresh cleanup
  verification are mandatory. A failed uninstall never authorizes recursive
  deletion of an unverified tree or overwriting recovered original data.
- The historical L1 pnpm/Windows PowerShell module mismatch and NSIS executable
  stamping are documented in the SAC ledger. Inspect current conditions first;
  use only a process-local proven environment correction if needed. Installed
  and unbundled executable hashes are different identities.
- Classify failures as regression, baseline, environment, or harness/cleanup.
  Preserve receipts; allow one infrastructure retry only after a concrete
  diagnosis and changed condition. Further failure requires replanning; do not
  retry until green or substitute a sandbox result.
- Roll back only task-owned changes after checking for user edits. Preserve
  original evidence and data; do not reset/clean the worktree or use a rollback
  to erase a failed acceptance attempt.

## Progress log

- [x] 2026-10-28: Revalidated findings statically; retained H1-H4 and H6-H13;
  excluded H5 and recorded H8's model-occurrence uncertainty.
- [x] 2026-10-28: Read existing tests, command definitions, SAC receipts and
  reuse policy. Separated historical PASS, fixture reuse, payload reuse and
  future acceptance. No tests, builds, model runs or installer actions executed.
- [x] 2026-10-28: Created the dedicated planning branch and this ExecPlan.
- [x] 2026-10-28: Cross-reviewed the plan and corrected partial-install ownership
  and duplicate-gate ambiguity. The document guard's pnpm wrapper stopped before
  execution on an engine mismatch; its existing Node leaf passed. No toolchain
  changes or implementation execution followed.
- [ ] M0 execution authorization, exact scope/reuse ledger and recovery setup.
- [ ] M1 bounded regressions and corrections.
- [ ] M2 final combined checks and required host work.
- [ ] M3 independent exact-patch approval, documentation and archive.

## Discoveries and decisions

- The twelve retained IDs are deliberately nonconsecutive; H5 remains outside
  the implementation batch rather than being silently renumbered or included.
- Reuse tests and fixtures aggressively, but do not reuse acceptance across
  changed inputs. Recent complete Python coverage was about 50 seconds; one
  current run is preferable to an uncertain elaborate partial-suite proof.
- Most historical aggregate results are invalidated because this batch touches
  every production language plus benchmark helpers. The strongest result-reuse
  candidates are isolated unchanged shared/evidence leaves; prepared model
  payloads are reusable assets, not proof of the new executable's behavior.
- The real synthetic NSIS fixture already exercises hook semantics without a
  product reinstall. It and a retained-installer H13 run have different claims;
  neither is mislabeled as acceptance of a new packaged release.
- Frozen authorities and historical evidence remain unchanged. New benchmark
  correctness does not rewrite previous model-selection or listening decisions.
- Planning documentation has no runtime/contract effect and is exempt from
  feature/bug change review. The future behavior patch is not exempt.

## Final validation results

**Implementation: NOT STARTED. Runtime acceptance: NOT RUN.**
No test, lint, format, type, schema, build, browser, native, model, installer or
benchmark command was executed for this planning task. Historical outcomes
above are attributed to their original receipts; no result reuse is approved.
The planning diff is limited to this file and the active-plan index, for a
single authorized local documentation commit. Future results, cleanup evidence
and independent Review ID must be recorded here before implementation closeout.

Planning-only document checks ran in normal local PowerShell outside the sandbox:

- `pnpm.cmd check:evidence`: stopped before the guard, exit 1. Repository expects
  pnpm 11.15.1; the current launcher reports 11.25.0. This is environment evidence,
  not a document or implementation failure, and invalidates any assumption that
  the prior pnpm environment is still identical.
- `node scripts/check-evidence.mjs`: PASS, exit 0, using the exact existing leaf
  of `check:evidence`. No package installation or engine bypass setting was used.
- `git diff --check`: PASS, exit 0 for the tracked planning diff. The staged
  handoff separately checks both exact documentation paths before commit.

These documentation results do not discharge any future implementation gate.
