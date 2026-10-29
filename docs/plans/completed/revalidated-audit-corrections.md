# Revalidated audit corrections

## Goal

Correct the nine statically revalidated findings with the smallest changes in
their existing owners. Add only missing regression assertions, reuse existing
fixtures and trustworthy independent evidence, and execute each required final
validation leaf at most once on its final inputs.

**Status: implemented and accepted on 2026-10-29; M0–M3 complete.**
Independent [RAC-R1-20261029](../evidence/revalidated-audit-corrections/review-R1.md)
approves all nine corrections and the attributed host evidence, with no findings.
The separate [RAC-R2-20261029 report](../evidence/revalidated-audit-corrections/review-R2.md)
records the assessment of this archived documentation state; its verdict is
owned by that report.
The current instruction authorizes RAC-01 through RAC-09 and their acceptance
checks. Commit, push, PR and merge remain prohibited. The planning commit is
`618d6af472c7dfe73b123a91c4c7018f4e0d0da9`; execution entered on that exact HEAD
and branch with an empty index and clean worktree. No intervening change
invalidates the statically revalidated findings.

## User-visible outcome

- Replacing a narrated book keeps the new reader's visible location connected to
  narration after delayed shutdown; Resume follows the resumed audible passage.
- Switching narration language reports an available CPU fallback truthfully.
- Public narration preparation uses the same primary book-start recovery as
  public locator resolution, while exact auxiliary locations remain usable.
- English ordinal street addresses preserve ambiguous `St.` rather than
  changing its meaning to `Saint`.
- Maintainer tools preserve completed listening sessions on rejected generation,
  retain backups after uncertain cleanup, observe the smoke's audio-write
  counter, and count all retained completed PCM in the historical simulation.

These are bounded corrections. Tooling findings do not establish that
ordinary playback persists audio, that personal data was corrupted, or that
the current player exceeds its memory limit.

## Current state

Planning base: `f38164da24c9df9d5891050f2b664d2275343688`, initially clean `main`.
The audit used `7a6f28fe3d1d4205d857da5df353a0cae819a0b3`. Both commits have tree
`8b48d8792dd09687d7022b03c22d37af5016919a`; the source comparison is empty.
Planning branch: `codex/revalidated-audit-corrections`.

The nine findings were initially checked by source/contract inspection and
independent readers, then reproduced by directed regression runs during M1.
The execution ledger distinguishes those failures and subsequent acceptance.
IDs below preserve
their order in this audit; they are not the similarly named H/VCA IDs in older
completed plans.

| ID | Established defect and exact scope | Current owner |
| --- | --- | --- |
| RAC-01 / H1 | Long-lived visual/reflow owners capture initial callbacks. A new reader can mount before the prior narration closes, then retain callbacks without its later coordinator. Passive observations remain stale; explicit navigation can repair the state. | `apps/desktop/src/reader/ReaderPublication.tsx`, `apps/desktop/src/App.tsx` |
| RAC-02 / H2 | Reusing a finalized quality-session ID fails staging admission inside the generation cleanup block and deletes the completed session. This is an erroneous repeat invocation in retained v2/v3/v6 tooling. | `services/tts/benchmarks/quality.py` |
| RAC-03 / H3 | The ordinary host harness restores the native-data backup from a nested `finally` even when teardown/uninstallation is unconfirmed. Interference is conditional; failed deletion can instead leave the backup safely apart. The WebView profile is temporary. | `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs` |
| RAC-04 / H4 | Language application derives `fallbackAvailable` from the selected profile, so retained bilingual Chatterbox can hide an available Piper fallback in the message. Piper remains selectable. | `apps/desktop/src/tts/hardware-profile-compatibility.ts` |
| RAC-05 / H5 | Direct smoke `main()` emits literal zero audio writes without installing the file observer. Other supervised tests do use observation. This is a false measurement claim in this smoke, not proof of actual audio persistence. | `scripts/test-chatterbox-runtime-smoke.py` |
| RAC-06 / H6 | Public preparation omits the primary-start resolver argument. A well-shaped same-book locator with unknown spine can recover into leading non-linear content; public `resolveLocator()` recovers into primary content. Canonical UI starts avoid that trigger. | `packages/epub/src/narration/narration-preparation.ts`, `packages/epub/src/resource/opened-publication.ts` |
| RAC-07 / H7 | Pause midway through a unit, passive scroll within the same mounted chapter, then Resume of the existing handle does not refresh follow. The next segment or another refresh may repair visibility. | `apps/desktop/src/reader/segment-highlight-controller.ts` |
| RAC-08 / H8 | `peak_retained_pcm_bytes` omits completed results waiting for ordered release. Reservations already count them; this is a historical v5 metric defect, not demonstrated capacity bypass. | `services/tts/benchmarks/dual_worker_playback.py` |
| RAC-09 / H9 | In English prose, `Walk along 8th St. North.` accepts `th` as the preceding word and expands `St.` to `Saint`. Current Piper/Chatterbox preparation selects this normalizer. | `packages/epub/src/narration/narration-bilingual-normalizer.ts` |

## Scope and non-goals

Use four cohesive implementation groups: reader/profile state (01/04/07), EPUB
preparation (06/09), benchmark bookkeeping (02/08), and host/smoke safeguards
(03/05). This is a bug-fix batch, not a clean-code campaign; do not import the
refactor workflow's per-file commits or whole-suite baselines.

Prefer existing files and local helpers. Do not add dependencies, shared/public
schema fields, a new process manager, a generic observer framework, new model
packages or a new benchmark runner. Preserve runtime versions, locks, inference
adapters, DSP, scheduling limits, acquisition policy and NSIS behavior. Do not
recompute frozen results or edit completed plans to make old evidence look new.

The plan does not authorize a real user-data/installer journey, publication,
commit, push, PR or merge. Current implementation authorization permits the bounded
source work and applicable ordinary test gates; separately assess any newly
required mutation of the user's installed application or personal data.

## Relevant files and documentation

Production owners are in the finding table. Expected test changes are limited
to existing suites where the assertions below are missing:

- Desktop: `src/App.test.tsx`, `src/reader/ReaderPublication.test.tsx`,
  `src/reader/segment-highlight-controller.test.tsx`, and
  `src/tts/hardware-profile-compatibility.test.ts` under `apps/desktop/`.
- Browser: `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`.
- EPUB: `packages/epub/src/public/open-epub-publication.test.ts`,
  `packages/epub/src/narration/narration-normalizer.test.ts`, and the existing
  `packages/epub/src/integration/narration-preparation-matrix.test.ts` only where
  profile-routing assertions are missing.
- Tooling: `apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs`,
  `services/tts/tests/test_benchmark_quality.py`,
  `services/tts/tests/test_benchmark_dual_worker.py`, and
  `services/tts/tests/test_chatterbox_v7_preparation.py`.

Read the existing callers and fixtures before finalizing the mutable path list.
Do not modify every listed test merely because it appears here. Add a new test
file only if an existing owner cannot host the necessary public-boundary proof.

Governing references:

- [MVP](../../product/mvp.md), [overview](../../architecture/overview.md),
  [system diagram](../../architecture/system-diagram.md), and
  [roadmap](../roadmap.md).
- [ADR-0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md),
  [ADR-0018](../../architecture/decisions/ADR-0018-reader-experience-stabilization.md),
  [ADR-0060](../../architecture/decisions/ADR-0060-primary-publication-start.md),
  [ADR-0063](../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md),
  and `apps/desktop/src/reader/synchronization-authority.ts`.
- [Completed M005](../completed/M005-narration-text-preparation.md): roadmap
  status remains complete; its preparation boundary is historical authority,
  not permission to modify frozen normalization or claim new TTS validation.
- [Testing](../../development/testing.md),
  [TTS service ownership](../../development/tts-service-organization.md),
  [evidence retention](../../development/evidence-retention.md), and
  [independent change review](../../development/agentic-change-review.md).
- [VCA ledger](../evidence/verified-chat-audit-corrections/execution-ledger.md),
  [VCA R3](../evidence/verified-chat-audit-corrections/review-R3.md),
  [VAF ledger](../evidence/validated-audit-follow-up/execution-ledger.md), and
  [SAC ledger](../evidence/static-audit-corrections/M3-validation-ledger.md).

## Architecture and constraints

Keep each correction in its present owner. EPUB text and inference remain local;
generated product audio remains memory-only. Preserve cancellation, identity
checks, bounded lookahead, resource budgets, stable source ranges and passive
inspection without retargeting active narration. No topology change is expected.
Review the canonical diagram at closeout; update it only if the final patch
actually changes a documented boundary.

RAC-06 supplies an existing authority to an existing resolver; it does not filter
or reorder non-linear spine content. RAC-09 preserves uncertain source text
without inventing an address parser or expanding `St.` to `Street`.

RAC-02/08 affect retained maintainer tools. RAC-03/05 affect diagnostics and host
cleanup, not shipped model code. Chatterbox v7 still uses its frozen v3 service
module payload. Test scratch, receipts and backups must remain separate from
real books and personal data. Never record private recovery paths in Git.

## Milestones

### M0: Freeze scope and select the smallest valid evidence graph

**Status: complete.** See the [execution ledger](../evidence/revalidated-audit-corrections/execution-ledger.md)
for mutable scope, entry identities and every gate decision. No historical PASS
is reused: select the fallback `test:typescript` route, fresh evidence tests,
fresh Rust format, and all other required leaves. Original receipts remain
retrievable, but complete environment/discovery equivalence is not established;
executing the small candidates is cheaper than reconstructing missing proof.

Recheck HEAD/worktree, the nine triggers, command definitions and test discovery.
Capture source/test/configuration membership before edits. Recover the original
receipts described below and decide each reuse candidate before scheduling it.
Record `RUN`, `REUSE WITH PROOF`, or `NOT APPLICABLE`, with rationale. A missing
receipt is not a passing baseline. Do not run a whole pre-change suite: the
directed failing regressions are the necessary new before-change evidence.

### M1: Minimal corrections and focused regressions

**Status: complete.** All nine corrections have directed failure evidence and
passing final source suites. RAC-01 required two small internal callback setters
to register the retained owners during layout without violating React's refs
rule. RAC-03 additionally retains a failed session-close promise across repeated
close and startup cleanup; its affected Node leaves were renewed after that
follow-up. See the ledger for failed attempts, diagnosis and exact receipts.

For each group, add the missing assertions first, establish the intended failure
on unchanged production code, then apply the local correction. Use synthetic
inputs and existing seams; do not call models to test deterministic logic.

| ID | Bounded implementation | Minimum regression and retained controls |
| --- | --- | --- |
| RAC-01 | Keep tracker/restorer instances; consult current external callbacks through refs updated in the layout phase. Make settlement dispatch use current callbacks too. On a newly available narration source, forward the reader's current valid locator once through the coordinator's existing inactive-only start update. A small optional method on internal `ReaderNarrationSource` avoids another position store in App; it is not a shared/IPC change. Do not reset the reader or retarget active narration. | Rerender with new callbacks and verify passive/reflow events reach only the current receiver. Extend deferred App handoff fixture: B restores before A closes, then scroll B and Play uses B's current locator. Cover a location observed during the barrier followed by Play without another locator event, as well as scroll after release. Retain A-to-B-to-C and failed-containment controls. |
| RAC-02 | Admit an existing staging session before entering cleanup that owns generation work; reject ready/invalid sessions without deleting them. Keep removal of genuinely failed partial generation. | Reuse fake audio/finalization helpers: finalize and submit a synthetic scorecard, repeat generation with its ID, assert rejection and unchanged files/bytes with no adapter call. Existing partial-generation-failure deletion test remains the opposite control. No scoring/finalization rewrite. |
| RAC-03 | Gate restoration on successful required cleanup. Still attempt teardown after earlier errors, but retain the backup and surface a recovery failure if cleanup is uncertain. Do not treat a suppressed session-close error as proof of containment. A small local finalization helper called by `runJourney()` may expose this ordering to tests; retain existing path guards. | Parameterized failures for session close, uninstall and stable-absence confirmation: no restoration, backup/sentinels preserved. Include an original journey failure followed by teardown failure; preserve both errors and the local recovery location. Success restores exactly once in order. Restoration failure never reports success. Use disposable filesystem roots and, if needed for containment proof, one owned synthetic Windows process with unconditional test cleanup. Test the actual production helper, not a copied algorithm. |
| RAC-04 | Compute fallback availability from all supported, language-admitted CPU fallback profiles using the existing predicate; leave selected-profile policy unchanged. | Chatterbox stays selected across ES/EN and reset while available Piper keeps the indicator true; unavailable/wrong-language Piper gives false. Existing recheck and selection tests remain controls; no extra hardware probe or browser case is needed. |
| RAC-05 | Reuse a small file-observation helper inside the existing smoke script from both direct `main()` and native observation. Install before adapter import/load, count observed write attempts, require zero, and report success only after cleanup. Preserve native dtype/forwarding instrumentation and receipt field compatibility. | Extend the existing isolated observer subprocess fixture to invoke real `main()` with synthetic adapter/torch/metadata. No-write success plus parameterized writes during load, synthesis and cleanup, including swallowed hook exceptions, must forbid PASS. Retain network, forwarding and content-free controls. The hook's Python events/extensions are its stated scope, not universal OS write auditing. |
| RAC-06 | Pass `#defaultStartBlock ?? null` from `OpenedPublication` through an internal optional preparation argument into the existing resolver. Preserve exact/recovered reason information; avoid pre-canonicalization that erases it. | Extend existing CLB-04 public EPUB 2/3 primary-start matrix: unknown same-book spine yields `book-start` and first primary narration; exact auxiliary start remains valid. No addressable primary plus unknown start yields `invalid-start`, not auxiliary narration. Keep malformed/foreign-book rejection and continuation controls. |
| RAC-07 | Detect the paused-to-playing transition and refresh the current projection once, respecting existing identity/terminal/geometry guards. Do not refresh every playing snapshot or synthesize a fake new segment event. | Pause an active unit, move its geometry offscreen, Resume and assert follow without changing focus/selection. Repeated playing snapshots must permit passive inspection; missing geometry and completion/cleanup retain existing safe behavior. |
| RAC-08 | Compute the retained-byte peak from queued plus completed-pending payloads. Keep playable duration and reservation accounting separate; do not double-count pending bytes in `reserved_bytes()`. | Add one legal four-unit out-of-order timeline: GPU seq0 0-to-1 s/20 s audio, CPU seq1 0-to-30 s/0.1 s audio, GPU seq2 1-to-2 s/20 s, GPU seq3 2-to-3 s/20 s. Assert retained peak 5,760,000 bytes and matching raw metric; old result is 3,849,600. Preserve existing order, invalidation and simultaneous-bound assertions. Do not rewrite frozen result JSON. |
| RAC-09 | Reject title context attached to a numeric prefix when the bounded previous-word scan stops at that prefix. Merely including digits in the scan is insufficient because the old predicate accepts any non-uppercase initial. | Extend conservative English cases with `8th St. North` and `21st St. North`; keep `St. James Station`, `Dr. Morgan`, `Baker St.` and `Oak Dr. North` controls. Check English Piper/Chatterbox prepared text, source immutability and locator spans through an existing public fixture. Do not require unrelated standalone-number normalization to stay unchanged. |

Extend the existing reader browser spec with two independent synthetic scenarios
in the same final invocation: delayed handoff/current visible start (01), and
mid-unit Pause/passive-scroll/Resume follow before another segment (07). Reuse
the real DOM, AudioContext and IPC fixture; no private EPUB, model or download.

### M2: Final integration with deduplicated gates

**Status: complete.** Final
source suites, the complete 17-case browser spec, standalone frontend/default
native builds, both Rust variants, native smoke, resource cleanup and
documentation guard/tests pass.

Finish fast source checks before browser/native preparation. Run the gate graph
below once on the final relevant inputs. Directed intermediate greens are for
diagnosis; avoid a second whole affected suite before the final suite. A changed
input after a PASS renews only its affected gate and downstream consumers.

Record preparation separately from execution. Reuse existing package-build hooks
and the one final native binary. Browser and native host runs are sequential.
Any synthetic process/filesystem cleanup failure blocks that gate's acceptance.
Schedule fast checks/tests first, then B1 (including its builds), then any required
standalone frontend build and the final native build, followed by F-Native and
N1. This avoids a later browser hook changing assets after native acceptance.

### M3: Independent review, documentation and closeout

**Status: complete.** RAC-R1-20261029 approves the exact implementation and
current-task evidence continuation, with no actionable findings. Documentation,
indexes and archive are maintained. The separate R2 report binds the final
archival state and renewed documentation guard to current identities.

Request `change_reviewer` on the exact final patch and attributed host receipts
under the existing review workflow. Include reused leaves and their complete
dependency proof; old VCA/VAF/SAC approval cannot approve this patch. Resolve
actionable findings and obtain a new identity-bound APPROVE. Missing required
evidence remains blocked.

Update maintained testing guidance for the new selections, the benchmark README
for ready-session rejection/retained-byte semantics, and current narration
guidance in the maintained architecture overview only where clarification is
needed. Preserve frozen authorities, corpora and completed M005. Review the final
diff, privacy, diagram and source/receipt identities. Archive this plan and update
indexes only after
implementation and every required gate are complete. Git publication remains
separately authorized.

## Testing and benchmark strategy

All validation commands run in normal local PowerShell outside the
managed sandbox, from repository-root cwd unless a filter changes it. The
planning step runs none of them. Commands below are configured scripts or scoped
invocations of their already configured runners; re-read configuration at M0.

### Existing results inspected

The most recent evidence is VCA R3, recorded on base/HEAD `61b9f32c...` with an
uncommitted final patch, not a test execution on this plan's HEAD. Its exact
415-path manifest, receipt/artifact maps and before/after snapshots are retained
under ignored `tmp/evidence/verified-chat-audit-corrections/`. The original raw
receipts are currently retrievable. Source hashes inspected in captured shared,
EPUB, Python, native and Node groups match the current pre-edit tree. This is
useful comparison evidence, not full discovery/environment proof or future reuse.

| Original receipt | Historical execution/result | Decision for this batch |
| --- | --- | --- |
| VCA `F-TS-R2-04` | TS format/lint/types; shared 210, EPUB 720, desktop 929, Node 110 pass; 91.57 s for the receipt | Changed EPUB/desktop/ordinary leaves need fresh results. Shared and independent Node leaves are reuse candidates only. |
| VCA `F-Python-renewed-02` | Format/lint, mypy 180 files, pytest 735 pass; 57.59 s | Changed benchmark/observer tests invalidate aggregate reuse. Run once fresh; use existing tests and fixtures. |
| VCA `F-Python-build-01` | Wheel and sdist pass; 0.79 s | Prefer one fresh build to a costly incomplete sdist-independence proof. |
| VCA `F-Rust-R2-02` | Format, default/release-locked Clippy and 141/140 passing tests, seven ignores each; 17.56 s | Do not infer reuse from no Rust source edit: generated frontend and diagnostic scripts are consumed. Renew affected native leaves after final assets; pure format may reuse with proof. |
| VCA `F-Desktop-R2-build-02` | Default native and standalone frontend builds pass; 26.38 s | New frontend/EPUB require a fresh build. Old executable cannot accept this patch. |
| VCA `B1-browser-R2-04` | Complete reader spec, 15 cases pass; 172.82 s | Run entire affected spec once after its final change. Do not compose old cases with a filtered new run. |
| VCA `N1-native-01` | Model-free WebView2/native-supervisor smoke and cleanup pass; 13.41 s | Fresh smoke on the newly built binary; avoid rebuilding via the wrapper. |
| VCA `F-Docs-R2-02`, `F-Docs-R3-03` | Guard and 31 guard tests pass; archive guard renewed | Current Markdown requires fresh guard. Unchanged guard test leaf is a reuse candidate. |
| VAF `F-Windows-tests-03` | Windows Node/compiled NSIS/lifecycle controls: 31 pass; 56.52 s | Renew: `windows-release.node-test.mjs` imports the changed ordinary module's `createJourneyReceipt`. Unchanged NSIS/PowerShell bytes alone do not prove the whole leaf independent. This is a synthetic fixture run, not a personal installation. |
| VAF `L1-lifecycle-authorized-01` | Installed lifecycle/restoration pass; 146.54 s | Historical fixture/behavior evidence only. Does not prove the new ordinary cleanup branch; no default real installation journey. |
| SAC `H-CPU-01`, `H-GPU-01` | Piper EN and supervised Chatterbox ES/EN passed on their identified artifacts | Unchanged model/DSP background. Never reuse the direct smoke's literal zero as an observed measurement. No default listening/model matrix. |

Durations are observed reference costs, not estimates or guaranteed run times.
Older failures remain failures, ignored cases remain ignored, and a historical
PASS count does not imply that these nine missing regressions already exist.

### Reuse rule and scheduling choice

Apply the complete input proof in the
[validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
as an evidence rule, without converting this bug-fix batch into a refactor
campaign. A reused leaf needs its original immutable receipt plus identical
source/transitive imports, tests/fixtures and discovered membership, config,
locks, runner/tool/library versions, relevant environment, generated inputs and
tested artifacts. Account for HEAD/branch if consumed. The new reviewer must
record the original receipt ID and why each changed path is independent. Never
invent missing execution-time identities or rebind old approval hashes.

At M0 choose one final test route, and record it:

1. **Proven leaf reuse:** reuse unchanged shared, evidence-test and independent
   Node leaves only when the proof above is complete. Run affected EPUB,
   desktop Vitest, ordinary, native-smoke and Windows-release Node leaves
   directly. Native-smoke consumes EPUB; Windows-release imports ordinary.
   Neither qualifies merely because its own file is unchanged. Shared's roughly
   half-second test run does not justify prolonged forensic work by itself.
2. **Fallback:** if that proof is incomplete or costs more than execution, run
   `pnpm.cmd test:typescript` once, including its package hooks and all seven
   Node suites. Do not also run its complete constituent suites afterward.

The four Node reuse candidates are `native-webdriver-client.node-test.mjs`,
`bilingual-portfolio-host.node-test.mjs`, `tts-adapter-layout-host.node-test.mjs`
and `acquisition-file-barrier.node-test.mjs`, all under `apps/desktop/scripts/`.
Their transitive modules, subprocess fixtures and host conditions must still be
proved unchanged. Do not split production modules solely to avoid a test run.

Neither route executes both `check` and `check:portable` plus their leaves.
Record leaf coverage honestly; do not claim an aggregate command ran. Required
CI is not waived. No historical PASS is accepted for reuse during planning.
Retain shared's `generate:check` obligation: either reuse its specific unchanged
pretest evidence with proof or execute
`pnpm.cmd --filter @voxleaf/shared generate:check`. Package build/typecheck alone
does not execute that check.

### Gate table

| Gate / invariant | Command or existing leaf selection | Timing and invalidation |
| --- | --- | --- |
| D-Desktop: callback freshness, Resume follow, fallback fact | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/tts/hardware-profile-compatibility.test.ts -t RAC` | Directed red after adding regressions. Use `RAC` in new titles; when extending an existing unlabelled table, select that actual title/file and record counts. Do not mistake zero selected tests for evidence. |
| D-EPUB: public primary recovery and conservative English | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts src/narration/narration-normalizer.test.ts -t RAC` | Directed red with the same selection rule. Include the actual existing preparation-matrix file if routing assertions are added there. Current shared/dist preparation must exist; run `build:packages` only when missing/stale. |
| D-Python: session admission, retained PCM and observed smoke | `pnpm.cmd test:python -k rac` | Directed red; extend existing helper fixtures. Final unfiltered Python suite supplies full controls once. |
| D-Host: preserve backup on uncertain cleanup | `node --test --test-name-pattern=RAC apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs` | Directed red with real temporary filesystem/process controls, no personal installation. Final ordinary leaf supplies all controls. |
| F-Docs | `pnpm.cmd check:evidence`; `pnpm.cmd test:evidence` unless reused | After final docs; worktree/index discovery invalidates the guard result. Manual links/scope review remains required. |
| F-TS-static | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd typecheck:typescript` | Once on final inputs. Typecheck builds packages; preserve package preparation/generate-check obligations. Source, discovered membership, config, locks, Node/TS/React and dist inputs matter. |
| F-TS-tests | Proven-reuse route: `pnpm.cmd --filter @voxleaf/epub test`, `pnpm.cmd --filter @voxleaf/desktop exec vitest run`, and `node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/native-smoke.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs`. Otherwise `pnpm.cmd test:typescript`. | Exactly one route. Every omitted shared/Node leaf needs explicit reuse proof, including its existing hooks; otherwise use fallback. Add any further Node leaf whose closure proves affected. New tests/fixtures and their transitive dependencies invalidate old evidence. |
| F-Python | `pnpm.cmd format:check:python`; `pnpm.cmd lint:python`; `pnpm.cmd typecheck:python`; `pnpm.cmd test:python`; `pnpm.cmd build:python` | Once on final Python inputs. No second `test:chatterbox:v7:preparation` is needed when the full suite discovers and runs those files. Capture suite membership and locked Python/tool inputs. |
| F-Smoke-script | `uv run --project services/tts --locked ruff format --check --config services/tts/pyproject.toml scripts/test-chatterbox-runtime-smoke.py`; `uv run --project services/tts --locked ruff check --config services/tts/pyproject.toml scripts/test-chatterbox-runtime-smoke.py` | Required because configured service-only Ruff scripts omit this external script. Real-main synthetic subprocess cases are already in F-Python. Preserve existing typing policy; do not add a new type/tool configuration. |
| F-Build | After B1: `pnpm.cmd --filter @voxleaf/desktop build` unless identical browser-build leaf equivalence is proved, then `pnpm.cmd build:desktop` | One current default native binary, plus the portable frontend obligation. Reuse package preparation already supplied by hooks. Do not rebuild just to enter N1. |
| F-Native | `pnpm.cmd format:check:rust` unless reused; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust` | After final frontend assets. Preserve both default/release-locked variants. Artifact/context/script consumers invalidate apparent source-only reuse; seven historical ignores are not claimed executed. |
| B1: real mounted handoff and Resume geometry | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` | One full final spec. It already prepares packages/frontend; changed bundle/spec/helper/browser inputs require renewal. Directed filtered runs are only diagnosis. |
| N1: packaged renderer/native integration | `node apps/desktop/scripts/native-startup-smoke.mjs` | One run on F-Build's identified binary with synthetic profile and verified cleanup. No wrapper-induced second build or later browser build between F-Native and N1. |

### Expensive gates that are not automatic requirements

RAC-03's corrected failure ordering can be accepted with the actual finalization
path, owned synthetic filesystem/process tests and independent review. Do not
reinstall the user's application merely to test a rejected cleanup. If the
implementation changes process containment, uninstall arguments, stable-absence
semantics or installer hooks, stop and amend scope with applicable native/host
acceptance and a recovery journal before that mutation.

RAC-05's counter/negative controls are model-free. This batch may claim correction
of the measurement mechanism; it cannot claim a new observed zero during real
inference without a fresh direct smoke. If a new real runtime receipt is required,
use the configured smoke's underlying command with the verified packaged
interpreter explicitly; the package script resolves plain `python` and does not
by itself prove interpreter identity. After M0 supplies the verified paths, the
existing leaf is `& $verifiedPackagedPython -I -B scripts/test-chatterbox-runtime-smoke.py --package-version 7 --language en --models $verifiedModels`.
Retain required offline flags and an owned `NUMBA_CACHE_DIR`; record the actual
expanded invocation privately. Do not use the base interpreter or
redownload/rebuild immutable payloads. Changes to the supervised observer's
runtime behavior beyond shared bookkeeping may require the existing
`pnpm.cmd test:chatterbox:v7:native-startup` gate instead; select the specific
invariant and avoid both by default. Capture runtime/model identity, host/GPU
readiness and cleanup before claiming such new evidence.

Fresh model quality/listening, speed matrices, frozen-result regeneration,
complete optional downloads and installer publication are outside the intended
patch. Reuse verified payloads as assets if a conditional gate needs them;
asset reuse is not reuse of a runtime PASS.

## Risks and rollback

- Callback refresh must not reset visual state or overwrite active heard
  position. Replaying a visible position is scoped to the current publication
  and inactive newly available coordinator; preserve failed handoff barriers.
- Resume follow must happen once, without preventing later passive inspection,
  stealing focus/selection or reviving terminal/completed projection state.
- Keep the primary-null distinction: no addressable primary cannot silently
  fall back to auxiliary content. Do not change exact auxiliary navigation.
- Retained bytes and playable bytes differ. Repair only the reported retained
  peak; keep reservation ceilings and frozen historical conclusions intact.
- A Python audit hook is process-global and cannot be removed. Observer tests
  use isolated subprocesses; no sensitive filenames/text enter public receipts.
- Cleanup failure deliberately leaves recovery material. Preserve both original
  error and cleanup failure, expose the local recovery location, and never
  restore/delete an unverified personal path automatically to make a test pass.
- Classify a failed gate as regression, baseline, environment or cleanup. Keep
  receipts. Permit one infrastructure retry only after a concrete diagnosis and
  changed condition; a second failure needs a bounded replan, not repeat-until-green.
- Roll back only task-owned edits after inspecting current work. Do not reset,
  clean, overwrite concurrent changes, or delete backups/evidence as rollback.

## Progress log

- [x] 2026-10-29: Revalidated all nine findings statically with scope limits.
- [x] 2026-10-29: Verified audit/current Git tree equivalence and clean entry.
- [x] 2026-10-29: Inspected existing tests, configured commands, VCA/VAF/SAC
  summaries and retrievable VCA receipts; separated fixtures/assets from PASS reuse.
- [x] 2026-10-29: Created planning branch and this nonexecuted ExecPlan.
- [x] 2026-10-29: Independent planning reviews checked reader/EPUB scope,
  cleanup/privacy safeguards and the evidence graph. Corrected the Node reuse
  candidates after tracing imports, retained shared generation checking, and
  ordered browser builds before final native acceptance. This is plan review,
  not runtime acceptance.
- [x] M0: Execution authorization, exact mutable scope and reuse ledger.
- [x] M1: Intended failures, minimal corrections and preserved controls.
- [x] M2: Final deduplicated host validation and verified cleanup.
- [x] M3: Implementation APPROVE, maintained docs and archive; final archival
  assessment is recorded separately in RAC-R2-20261029.

## Discoveries and decisions

- The new `main` commit has the same source tree as the audit; no finding was
  silently assumed fixed by the branch change.
- Recent suites are relatively cheap compared with proving incomplete historic
  identity. Prioritize reusing fixtures and avoiding duplicate runs, then consider
  independent expensive leaves. Unknown evidence requires the affected check.
- Shared, guard-test and unchanged Node leaves are candidates, not preapproved
  savings. Changed EPUB/desktop/Python/browser/native artifacts need new proof.
- Keep this plan's RAC IDs distinct from unrelated historical H/VCA IDs.
- The original planning-only documentation was exempt from runtime change review.
  The implemented behavior patch requires the named independent reviewer and
  host evidence before acceptance.

## Final validation results

**Implementation accepted by RAC-R1-20261029.** The [execution ledger](../evidence/revalidated-audit-corrections/execution-ledger.md)
records the original failures and fresh local PowerShell receipts. Current source
results include shared 210, EPUB 723, desktop 935, Python 749, all seven Node
suites, and Chromium 17 passing cases. The ordinary/Windows-release Node leaves
were renewed after the RAC-03 follow-up: 52 pass. Type/lint/format checks,
wheel/sdist, frontend/default native builds and Rust 141/140 tests pass; seven
explicit ignores remain in each Rust variant. Direct native WebView2 smoke and
its resource cleanup pass on the final binary. Documentation guard and 31 guard
tests pass. Independent R1 finds no actionable issue and explicitly approves
unchanged current-task receipt continuation. No historical PASS is reused, and neither
aggregate `check` nor `check:portable` has run. No new real-model, installer or
benchmark result is claimed. Exact commands, retained failures and the bounded
current-task continuation proof are in the execution ledger. The separate R2
report records current archive/index identities and the renewed guard.

The canonical diagram remains accurate without a topology change. Completed
M005, frozen authorities/results, locks, models, DSP, public contracts and
resource limits are preserved. No app/driver/synthetic-child process, new native
scratch directory or preview listener remains. All edits stay unstaged and
uncommitted on the planning HEAD; no push, PR or merge was performed.
