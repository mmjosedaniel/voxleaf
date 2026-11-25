# Desktop responsibility refactors

Completed on the `c292f5c` worktree. All five units and their combined runtime checks passed independent validation. The [package ledger](../evidence/desktop-responsibility-refactors/package-01.md) records the executed commands, reuse decisions and the original foundation wrapper's lint failure. The [final report](../evidence/desktop-responsibility-refactors/final-01.md) covers archival and final source identities.

## Goal

Give each of five existing desktop responsibilities one identifiable owner. Use the current regression cases and the smallest host checks that can observe each change. This plan spans reader, playback, native supervision and maintainer tooling.

## User-visible outcome

Changing appearance during a book replacement still saves the latest choice. Reading a playback metric still shows current progress. Scrolling still distinguishes a gesture from actual movement. Cancelling an old start still leaves the next narrator usable. Maintainers can see which four scenarios the adapter-layout runner exercises without knowing the order of another list.

## Current state

Planning base is `c292f5c5b117b3ec599da96b6617a2b3663c3daf` on `main`. The index and worktree were clean at intake. On that exact commit, GitHub Actions Foundation run `45310930174` passed Windows native, Ubuntu portable and Ubuntu Rust. The Windows job ran Chromium, packaged WebView2 and foundation checks. Release dependency run `45310930120` passed its production graph and inventory checks. Use these results as the committed starting record. The implementation units below still need local evidence against their own inputs. [CI workflow](../../../.github/workflows/foundation-checks.yml)

| Unit | Current evidence and reason to change |
| --- | --- |
| A · Appearance | App has a revision counter, one in-flight write and one queued choice. Its hydration and restoration paths consult the same counter. The per-book position coordinator also exposes a preference queue. A repository-wide caller search found only its own tests invoking `savePreferences` and `setOnPreferencesWritten`. [App](../../../apps/desktop/src/App.tsx) · [Position saves](../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts) |
| M · Metrics | `#updateMetrics` commits four player-counter deltas. `#createSnapshot` repeats the arithmetic to display progress since the last sample. [Narration coordinator](../../../apps/desktop/src/tts/product-narration-coordinator.ts) |
| V · Viewport | Trusted wheel handling, scrollbar capture/release, listener attachment, touch, keyboard and root scroll are spread across `ReaderPublicationContent`. The tracker already determines whether a manual movement occurred. [Reader](../../../apps/desktop/src/reader/ReaderPublication.tsx) · [Tracker](../../../apps/desktop/src/reader/active-visual-locator.ts) |
| R · Rust startup | `Lifecycle.pending_start` stores two IDs and `pending_start_cancellation` stores the matching flag. Registration and teardown maintain both options. [Native supervisor](../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs) |
| H · Host scenario selection | `BILINGUAL_PORTFOLIO_ARMS.slice(0, 4)` gives a historical adapter-layout runner its two Piper and two Chatterbox cases. A portfolio reorder can change which engines run. [Adapter-layout runner](../../../apps/desktop/scripts/tts-adapter-layout-host.mjs) · [Portfolio source](../../../apps/desktop/scripts/bilingual-portfolio-host.mjs) |

## Scope and non-goals

One integration batch, five separately reviewable units. Proposed writable paths below are relative to `apps/desktop/`; all other files are read-only context. The auditor and validator freeze each unit's paths, size limit, tests and schedule before editing. These five sets are disjoint, including the proposed new files. Scope excludes shared schemas, storage keys, EPUB parsing, DSP, model packages, dependency upgrades, runner modes and public support claims. H uses the existing portfolio arms and runner arguments. Consolidating every smoke CLI profile definition would be a separate change.

## Relevant files and documentation

Use the [reader and audio flows](../../architecture/system-diagram.md), [persistence boundary](../../architecture/overview.md#reading-state-persistence-boundary), [playback requirements](../../product/mvp.md#playback), [metrics and cleanup decision](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md), [host test guidance](../../development/testing.md) and [native module ownership](../../development/agentic-refactoring.md). The [earlier desktop audit](../completed/desktop-source-organization.md) kept cancellation, navigation and restoration under their original owners. The extractions below preserve those decisions.

## Architecture and constraints

Appearance has application lifetime. Position and heard checkpoints have publication lifetime. The reader owns explicit navigation, focus, locator tracking and reflow settlement. The narration coordinator owns player calls, cancellation, bounded buffers and publication of snapshots. Rust owns the child, its locks, cancellation token and bounded retirement receipts. Use synthetic publications, ephemeral audio and content-free observations. Product behavior, trust boundaries and the system diagram stay as documented.

## Milestones

Each unchecked item is pending. Implement one unit at a time. H can go first as a small isolated change. A, V, R and M can then run independently in that order. Capture any shared expensive baseline before the first change that can affect it. Run affected high-risk checks before accepting each unit.

- [x] **H · Name the four host scenarios (low).** Change `scripts/tts-adapter-layout-host.mjs` and `scripts/tts-adapter-layout-host.node-test.mjs`. Resolve the four explicit profile/language pairs against the existing portfolio in the current launch order. Require one match per requested pair and pass the original objects through to preserve flags and environment. Add one table-driven selector test with Qwen moved to the front, a missing pair and a duplicate. Independently assert the four literal pairs and their order. The existing [portfolio tests](../../../apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs) already cover the CLI arguments. Keep the adapter's real loop calling the tested selector.
- [x] **A · Give appearance writes one application owner (high, persistence).** Change `src/App.tsx`, new `src/persistence/reader-appearance-writer.ts`, `src/persistence/reader-position-save-coordinator.ts` and its colocated test. Allow `src/App.test.tsx` for migrated assertions. Create the writer once per App, retain one in-flight write and coalesce queued edits to the latest choice. Keep the visible preference update synchronous, late hydration/restoration guarded by the current revision, and result publication suppressed on real app teardown. Replacing the book must allow a current write result to reach the new view. Keep the StrictMode cleanup ordering. After checking callers again, remove the per-book preference API and drain. Keep its independent position flush, close, microtask-gap, heard-checkpoint and content-free record assertions. Move applicable coalescing/failure assertions to the live App boundary. The obsolete “book close suppresses the appearance result” assertion gives way to the existing opposite requirement across replacement. Test the book and app lifetimes distinctly. [App coverage](../../../apps/desktop/src/App.test.tsx) · [Mixed position and preference cases](../../../apps/desktop/src/persistence/reader-position-save-coordinator.test.ts)
- [x] **V · Gather manual viewport input (high, synchronization).** Change `src/reader/ReaderPublication.tsx` and new `src/reader/use-reader-viewport-input.ts`. Gather gesture classification, event binding and pointer lifetime. Distinguish intent from confirmed movement using the existing tracker. Preserve modifier/target/trust checks, PageDown on a publication link, wheel direction at a hard boundary, held-thumb release, pointer cancellation, blur and root detach. Keep listener options, order, focus capture, restoration and follow decisions at their established boundaries. Use the existing browser and WebView2 cases below. Direct touch and cancel/blur-on-detach coverage was not identified. Compare those paths structurally. If setup/teardown ordering changes, add one focused lifetime control to the existing reader test and re-freeze that allowlist before editing. [Reader tests](../../../apps/desktop/src/reader/ReaderPublication.test.tsx) · [Native scrollbar journey](../../../apps/desktop/scripts/native-smoke/reader-scenarios.mjs)
- [x] **R · Represent one pending native start (high, cancellation).** Change only `src-tauri/src/tts_service_supervisor.rs`. Introduce a private `Option<PendingStart>` with named request ID, service instance ID and cancellation flag. Update registration, observation, matching shutdown, cleanup and process exit. Keep the same locks, atomic ordering, two-ID comparisons, retirement cap, anonymous-start behavior and exact receipt retention. Reuse the held-verifier, pre-registration, foreign-request, exit and successor tests. [Supervisor tests](../../../apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs)
- [x] **M · Share one calculation for playback metrics (high, playback diagnostics).** Change `src/tts/product-narration-coordinator.ts`, new `src/tts/playback-episode-metrics.ts` and its caller's existing `src/tts/product-narration-coordinator.test.ts`. Operate on numeric observations for buffering, intentional wait, rendered frames and underruns. Preview leaves totals and baselines untouched. Recording advances them exactly once. The coordinator retains all player calls, per-run counters and episode boundaries, including the current close-then-observe order on Stop/failure. Extend an existing public snapshot test with two publications after 2,400 fresh frames at 24 kHz and before the next tick. Each preview, the tick and Stop should report the same extra 100 ms. Reuse current reset, retry and diagnostic-failure controls. [Coordinator tests](../../../apps/desktop/src/tts/product-narration-coordinator.test.ts)
- [x] **Close the batch.** Reconcile the ledger below against the actual patch, run remaining final leaves once, review the complete diff and verify host cleanup. Archive the plan and update both indexes after acceptance.

## Testing and benchmark strategy

### Previously executed evidence

GitHub Actions push runs `45310930174` (Foundation checks) and `45310930120` (release dependency audit) succeeded on the exact planning SHA. Windows native, Ubuntu portable and Ubuntu Rust jobs all succeeded, as did the release dependency graph and inventory steps. This covers the committed checkout in CI. The planning task needs only document checks. A future unit baseline needs local evidence as described below.

| Evidence inspected | What it establishes and how to use it |
| --- | --- |
| [November reader execution](../evidence/november-23-findings/reader-execution.md) and [PR 332 follow-up](../evidence/november-23-findings/ci-follow-up.md) | The final reader Vitest selection passed 59 with 433 filtered out. It includes VF-0168 write serialization and VF-0150 recovery. The later hydration/order and presentation selection passed 104. VF-0136 passed in Chromium after correcting its fixture. A separate packaged run witnessed trusted PageDown movement and preservation of the exact offset after a boundary wheel. Reuse these assertions with their distinct scopes. |
| [Native November execution](../evidence/november-23-findings/native-execution.md) and [real-child evidence](../evidence/residual-audit-corrections/execution-ledger.md) | The focused start-retirement selection passed six in each Rust configuration. One real-executable case was ignored in those commands. Independent F08 execution covered the living successor. Explicit exit fencing has its own test. CI follow-up reports full local Rust at 208/207 passed with 9/10 ignored. |
| [Cleanup and single-profile results](../evidence/validated-chat-findings-corrections.md) and [November integrated gates](../evidence/november-23-findings/integrated-gates.md) | R1 verified expired-transition cleanup, observation failure and one packaged English Piper arm. November R02 measured 60,136.42 ms of fresh playback in its installed Piper run. Use that history to select the arithmetic and cleanup assertions. No new speed, quality or hardware benchmark is proposed. |
| [Adapter-layout closeout](../evidence/tts-adapter-layout/CLOSEOUT-04.md) and [tooling checks](../completed/documentation-consistency-and-historical-tooling.md) | Four native arms ran against historical artifacts. The existing Node runner suite previously passed 19 cases on its then-current revision. Its portfolio order assertions do not exercise selection after reordering the inputs. H closes that specific gap with a deterministic fixture. |

The private R02 build manifest at `tmp/evidence/nov23-execution-r02/build-inputs.json` is retrievable on the planning host. Comparing its 208 recorded source/configuration digests to this checkout yielded **206 matches and two differences**: `apps/desktop/src-tauri/Cargo.lock` and `packages/epub/src/navigation/navigation-document.ts`. The old executable (`c4839aea…`) cannot serve as the current runtime baseline. Matching source hashes alone also omit the host and measurement conditions. No historical local runtime gate has been credited as a current PASS.

### Minimum local run ledger

Run in ordinary local Windows PowerShell from the repository root, with the checkout's pinned tools. Before each unit, the validator records a current focused baseline and after it checks the same invariants on the candidate. Select only the associated rows. H uses deterministic Node selection only. Other units use the relevant TS or Rust checks and the specific integration observers below. Exact command arguments follow the ledger.

| Unit | Focused checks | Runtime evidence required before unit acceptance |
| --- | --- | --- |
| H | Node selector and portfolio controls. The baseline runs the existing controls and inspects the current loop. Run the new reorder/cardinality fixture after it exists. | No model or adapter-layout campaign launch for changing list selection alone. |
| A | App appearance/hydration selection and the entire small position-save test file, including its remaining position-only close and flush paths. | A Chromium selection exercises actual Settings writes, four appearance tokens, future stored data and reload. Ordinary packaged startup covers persistence through actual process restart. |
| V | Existing reader component and tracker tests. | V Chromium selection covers real link, boundary wheel, modifier keys and next Play after a scrollbar gesture. Native thumb drag and native link/wheel need distinct observer paths. If ordinary native startup already ran on equivalent inputs, use its thumb assertion. Otherwise use scrollbar-only plus the November reader mode on one build. |
| R | Focused Cargo supervisor selection on default and release-locked runtime. Ordinary Windows F08 runs explicitly against the model-free child executable. | Ordinary packaged native startup covers typed-client lifecycle and cleanup. The injected held verifier plus F08 prove exact cancellation and a live successor. Extra real-model arms require a change to an engine-specific verifier or runtime path, which would reopen this work order. |
| M | One coordinator file including the preview/commit assertion, explicit reset, Stop/Play, failed observation and cleanup. | RIA-03 in Chromium checks the completed playback metric through direct Web Audio at 100% and the WSOLA worklet at 75%. One English Piper packaged run exercises the shared product metrics on actual audio generation. Keep the six-speed sweep for a change in DSP, scheduling, rate-specific measurement or a new performance claim. [Playback backend](../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts) · [Single-arm precedent](../completed/validated-chat-findings-corrections.md) |

Use existing runner leaves. The desktop `test` script chains Vitest and Node. Use `exec vitest run` for a filtered selection. Build shared/EPUB exports once with `pnpm.cmd build:packages` on matching inputs. On Windows the inner quotes below keep regex alternatives in one argument. Confirm the expected case names actually ran, especially after modifying a fixture name.

```powershell
# H. Existing controls before editing. The new case name starts with "adapter layout arm selection".
node --test --test-name-pattern="freezes the six exact bilingual portfolio arms|builds .*Piper runner arguments|adapter layout arm selection" apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs

# A. Separate the filtered App cases from the unfiltered position-save file.
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx -t '"VF-0168|VF-0150|CAF-R6.2|SAC-15|keeps the reader edit after hydration|flushes validated position"'
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/persistence/reader-position-save-coordinator.test.ts
pnpm.cmd --filter @voxleaf/desktop exec playwright test tests/browser/reader-reflow-restoration.smoke.spec.ts tests/browser/reader-narration-bugfixes.smoke.spec.ts --grep '"CFR-12|preserves one canonical passage|CAF-3|SAC-15"'

# V. The tracker owns intent expiry and movement admission.
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/active-visual-locator.test.ts
pnpm.cmd --filter @voxleaf/desktop exec playwright test tests/browser/reader-reflow-restoration.smoke.spec.ts tests/browser/reader-narration-bugfixes.smoke.spec.ts --grep '"VF-0136|VF-0143|VF-0034|VF-0063"'

# R. The two feature builds exercise different compiled paths.
cargo test --locked --manifest-path apps/desktop/src-tauri/Cargo.toml -- nov23_busy_start_drains nov23_bounded_dispatch nov23_shutdown_before_start nov23_shutdown_fences nov23_application_exit_prevents_spawn nov17_cancel_retires_matching_start
cargo test --locked --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime -- nov23_busy_start_drains nov23_bounded_dispatch nov23_shutdown_before_start nov23_shutdown_fences nov23_application_exit_prevents_spawn nov17_cancel_retires_matching_start

# M
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts
pnpm.cmd --filter @voxleaf/desktop exec playwright test tests/browser/reader-narration-bugfixes.smoke.spec.ts --grep RIA-03
```

For packaged checks, `pnpm.cmd test:native-startup` builds the ordinary executable and runs the model-free matrix. Its restart and thumb assertions can satisfy A and V on the **same covered inputs**. The two focused V modes cannot be combined. When that matrix is unnecessary on a given candidate, use `pnpm.cmd build:desktop` once for its ordinary artifact. Record the digest and use the matching WebView2/EdgeDriver. Bind `$releaseFile` to the verified absolute path of that build's `voxleaf-desktop.exe`. For R, set `VOXLEAF_NATIVE_MODEL_FREE_BINARY` to that path for the isolated F08 command. For M, use the existing verified English Piper configuration and host preflight in [testing guidance](../../development/testing.md). Keep model-free and Piper process environments separate.

```powershell
# V. First line only when the ordinary startup thumb witness is outstanding.
node apps/desktop/scripts/native-startup-smoke.mjs --scrollbar-probe-only "--executable=$releaseFile"
node apps/desktop/scripts/native-startup-smoke.mjs --exercise-nov23-reader --operation-timeout-ms=120000 "--executable=$releaseFile"
# R. This exact case is ignored by the normal Rust suite.
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement -- --exact --ignored --nocapture --test-threads=1
# M. Run against the exact candidate, with the admitted profile configured.
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en "--executable=$releaseFile"
```

### Reuse decisions at execution time

For touched TS/JS files use the configured Prettier and ESLint leaves scoped to their paths. For renderer TypeScript add `pnpm.cmd --filter @voxleaf/desktop typecheck`. Use the full TS format/lint scripts at batch close. A baseline shared across units can run one union of their existing Vitest or Playwright cases and record the case-level results. If later changes affect the built renderer or a test's other inputs, renew that unit's affected gate. A shared result is usable only inside the coverage and identities it actually recorded.

1. Before editing, map planned mutable paths, source imports, fixtures, test discovery, scripts, generated exports, build inputs and locks to each gate. Capture command, runtime/tool versions, host conditions, executable identity, result, case names and elapsed time in an immutable local receipt. Use a shared pre-edit Chromium selection or ordinary native baseline for multiple units where it covers their assertions. Each later unit still needs a focused baseline against its actual starting state.
2. Use scoped Prettier/ESLint on touched TS/JS and `pnpm.cmd --filter @voxleaf/desktop typecheck` where TypeScript changes. For R use `pnpm.cmd format:check:rust` and `pnpm.cmd lint:rust`. Run fast checks before native builds. The independent validator can credit a worker's identical passing host command after comparing its complete inputs. A changed runner, fixture, source, build, driver, profile, unknown input or changed host condition invalidates the affected evidence. Rebuild only affected artifacts. An unchanged test file alone cannot establish equivalent behavior.
3. At batch close retain desktop package checks, including the full desktop test wrapper, repo-wide TS format/lint and the complete applicable portable/native foundation. Map each leaf from both [root](../../../package.json) and [desktop](../../../apps/desktop/package.json) scripts. A low-duplication schedule is `pnpm.cmd check` once on the final tree plus `pnpm.cmd --filter @voxleaf/desktop build` for portable Vite output, with shared prerequisites and every identical leaf credited by receipt. The native aggregate includes both Rust feature sets and Tauri. The portable-only Vite invocation needs its own evidence. Record that portable coverage was assembled from leaves. Run `pnpm.cmd check:portable` if the graph changes or equivalence cannot be proven. Neither aggregate covers the Playwright/packaged journeys above. A matching broader final execution can also supply its exact package leaves. Preserve protected CI.
4. Run the full Chromium gate `pnpm.cmd test:browser` once on the combined candidate after the last relevant edit, unless the validator can bind an equivalent complete run to identical inputs. For the last browser-affecting unit, move this run to its post-change check and credit its named cases there and at batch close. This avoids rerunning that unit's filtered Playwright command. Earlier high-risk units still need their own affected cases before acceptance. Native WebView2 witnesses remain separate.
5. Keep unit reports and fresh post-change identities per the [validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md). Only the independent validator assigns runtime reuse. Record each gate as executed, reused with its original ID, or still pending. CI, skipped tests, preflight, an old binary and a new artifact have distinct evidentiary value. No installer release, live download, historical v3/v4 model campaign or new benchmark is needed for these scoped changes.

## Risks and rollback

Book replacement versus app teardown, preview versus commit, and intent versus movement are the most likely behavior regressions. R additionally risks acknowledging the wrong start. Use the indicated next action on each boundary. Stop on a failing relevant baseline or changed contract. Use the [role workflow](../../development/agentic-refactoring.md) with one writer and independent host validation. Isolate temporary profiles, environment overrides and outputs per run, preserve existing installations and verify cleanup. Record failures and revert only verified unit-owned changes under the workflow. Git publication is a separate decision.

## Progress log

- 2026-11-24 — Inspected the five owners and their tests, checked the exact-commit CI jobs, compared the retained R02 build inventory and selected focused gates. All five implementation milestones are pending.
- Execution started on the planning HEAD with an empty index and only the five planning documents present as worktree changes. The approved plan and active index matched their recorded identities. H's two source paths were clean. [H baseline](../evidence/desktop-responsibility-refactors/H-baseline-01.md)
- H work order `DRR-H-ORDER-01` covers its two listed files, at most 105 added/removed lines, the four explicit ordered pairs, original arm object identity and one reorder/missing/duplicate fixture. The validator recorded three existing named Node assertions and scoped style/lint results. Host preflight identified the ordinary native startup journey as the shared A/V/R baseline, the separate V link/wheel observer, the focused Chromium selections and one English Piper M run. H has no runtime dependency on those artifacts.

- The auditor and validator reviewed all five scopes in order. M passed on the combined candidate. All 13 implementation and test paths were checked against their unit receipts. The full Chromium suite ran once after M.

## Discoveries and decisions

M order `DRR-M-ORDER-01` covers the coordinator, its colocated test and the new numeric helper, up to 240 changed lines. The [M baseline](../evidence/desktop-responsibility-refactors/M-baseline-01.md) passed static checks, types and all 246 coordinator cases. The final full Chromium run supplies M's two browser cases; the ordinary desktop build in the final foundation check can supply M's Piper executable when its inputs match.

R order `DRR-R-ORDER-01` covers the native supervisor only, up to 90 changed lines. Its [baseline](../evidence/desktop-responsibility-refactors/R-baseline-01.md) checked formatting, both Clippy configurations and six specific lifecycle controls in each Rust configuration. The shared ordinary and live-child runs remain pre-edit evidence.

V began on the accepted H+A tree. `DRR-V-ORDER-01` covers the two viewport source paths and 320 changed lines. The [V baseline](../evidence/desktop-responsibility-refactors/V-baseline-01.md) qualified A's typecheck, shared browser/November observations and A's packaged scrollbar result. Scoped formatting, lint and the 87 reader/tracker cases ran on V's actual starting tree.

Before A, the validator recorded one 13-case Chromium selection, ordinary WebView2 restart/scrolling, the separate native link/wheel observer, executed opt-in F08 and offline English Piper on the pre-edit program. The A baseline also passed nine selected App cases and all 24 position-save cases. [Shared baseline and identities](../evidence/desktop-responsibility-refactors/A-shared-baseline-01.md)

A order `DRR-A-ORDER-01` includes exactly its five milestone paths. Amendment 1 permits up to 510 changed lines to remove the obsolete test parameterization and exercise true app teardown. The behavior and gate selections are unchanged.

The first A candidate passed formatting and stopped at ESLint's React refs rule. Its lazy writer initializer captured the App's current-preferences ref. Correction `DRR-A-CORRECTION-01` keeps the result callback at the App event boundary and supplies it with an accepted edit. Failed worker receipt SHA-256 `e979c91b25a884f0669f09ee2987dca495d2bdb1a69ae90466f8dca750139c01`.

The current App already has the correct cross-book save behavior. Removing duplicate infrastructure must preserve that later correction. Chromium's link case proves save/reopen, while the native link observer proves trusted movement and focus. The default Rust suite discovers the F08 opt-in control but cannot provide its executed result. H's selector fixture and M's preview assertion address two different gaps in existing coverage. An additional large fixture suite would add little evidence.

## Final validation results

H passed independent unit acceptance in [DRR-H-POST-01](../evidence/desktop-responsibility-refactors/H-post-01.md). Four named Node assertions passed, and the validator credited all three matching worker checks. A passed in [DRR-A-POST-01](../evidence/desktop-responsibility-refactors/A-post-01.md). On the corrected A patch the validator credited five worker gates (10 App cases, 22 position cases) and the unchanged package build, then ran five Chromium cases and ordinary packaged WebView2 including restart and persistence.

V passed in [DRR-V-POST-01](../evidence/desktop-responsibility-refactors/V-post-01.md). The validator credited four current worker checks, including 87 reader/tracker cases. Six Chromium cases and two separate WebView2 probes passed on the V candidate. Touch, pointer cancel and blur on detach were compared structurally.

R passed in [DRR-R-POST-01](../evidence/desktop-responsibility-refactors/R-post-01.md). The validator credited the four Rust worker gates, then ran ordinary packaged startup and the explicit live-successor control on the new R executable. One F08 case actually ran and passed.

The [plan review](../evidence/desktop-responsibility-refactors/plan-review.md) and [document checks](../evidence/desktop-responsibility-refactors/plan-closeout.md) cover plan authoring.

M passed in [DRR-M-POST-01](../evidence/desktop-responsibility-refactors/M-post-01.md). The validator credited four worker checks, including 246 coordinator cases. The new public assertion reads the same extra 100 ms after each preview, the next tick and Stop. The full Chromium run passed 115/115, including direct playback at 100% and WSOLA at 75%. The ordinary executable from the package build also passed the offline English Piper case.

At batch close, the original `pnpm.cmd check` stopped at ESLint on three pre-existing, ignored Nov 23 artifacts. The identical installed lint command passed on a source view with all 1,970 candidate files verified. The validator credited the successful evidence and format leaves, executed the remaining native lint, typecheck, test and build leaves, and ran the portable-only desktop Vite build. Both aggregate graphs are accounted for in the [package ledger](../evidence/desktop-responsibility-refactors/package-01.md). There was no second Chromium run, portable wrapper run, or separate Piper build. The immutable A baseline still cites this plan's original active location.
