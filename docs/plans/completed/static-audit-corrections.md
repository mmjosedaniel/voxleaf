# Static-audit corrections: reader, narration and runtime

Planning date: 2026-10-28. Planning base: `4942ac74cbba70fc32711b1c86c024998c05b757`
(`main`, PR #280). Branch: `codex/static-audit-corrections`.
Status: all fifteen corrections and required execution gates accepted in
`SAC-R3-20261028-01`. The separate exact archive review and its identity recheck
are recorded in the [final report](../evidence/static-audit-corrections/review-final.md).

## Goal

Correct the fifteen statically revalidated findings below with the smallest
cohesive changes to their existing owners. Preserve current public contracts,
runtime/model versions and product constraints. Minimize validation by extending
existing regression tests, sharing integration runs and reusing only evidence
whose complete inputs and environment remain applicable.

Implementation was authorized after planning on the dedicated branch at
`7c00f2f633ffd0c79043ab694f29b7defb46941a`. All fifteen corrections and their
required acceptance are in scope. Commit, push, PR and merge remain prohibited.
Subsequent authorization also permits uninstall/reinstall of the existing host
installation for L1, with user-data preservation and verified restoration.

## User-visible outcome

Manual chapter navigation remains where the reader placed it after narration
completes. Pause/Resume, failure recovery and timing measurements reflect actual
audio ownership and bounded cleanup. Malformed current preferences can recover;
future preferences remain protected. Supported decimal currency text, silent
source tails, local fragment links and oriented JPEGs work without weakening
source mapping, input validation or memory bounds. Cancellation remains a
cancelled operation, native commands have real cumulative deadlines, and the
Windows validation tools report truthful results.

## Current state

The working tree and index were clean at the planning base. Three read-only
searches produced fifteen findings; a second adversarial static review retained
all fifteen, with fourteen P2 findings and one P3. No reproduction, test, build
or benchmark was executed for those searches or this planning task. Static
confirmation is not a claim that every scenario occurs in normal use.

The identifiers below follow the order of the three searches and are independent
of F01-F14 in the already completed PR #280 plan.

| ID | Confirmed trigger and consequence | Minimum correction and acceptance criterion |
| --- | --- | --- |
| SAC-01, P2 | After completion, `beginExternalNavigation` returns for inactive intent while the last highlight remains. If its range was already materialized and `navigationRequested` is false, unmounting it can make `refresh` navigate back. | Revoke obsolete highlight/follow authority on explicit navigation even after completion. Preserve the stationary completed highlight, legitimate materialization while narrating, heard checkpoint and passive scrolling. |
| SAC-02, P2 | A blocked `response.read` can fail after cancellation was requested. Its error mapper records a new diagnostic and returns `DownloadFailed` without checking cancellation again. | Classify cancellation before recording the transport failure. Preserve the previous diagnostic, staging cleanup and real non-cancelled failure reporting. No retry/resume/HTTP transport redesign. |
| SAC-03, P2 | Hardware preference `write` parses existing malformed JSON inside its storage exception handler. A value such as `{` prevents saving/applying every explicit selection. Automatic selection can still work. | Permit a validated explicit save to replace malformed data, while retaining rejection of unsupported versions and genuine storage failures. Do not clear unrelated preferences. |
| SAC-04, P2 | At a persisted 75-95% rate, player state can be `playing` while worklet preparation is pending and no unit has started. Coordinator metrics already record command-to-audible and playback time. | Anchor first-audible and elapsed playback accounting to existing actual playback observations/events. Pending preparation and failed initialization cannot count as audible playback; preserve episode totals and intentional-pause accounting. |
| SAC-05, P2 | The Windows lifecycle script defines nine optional roots and eight markers. Its first fixture initialization reaches a missing mandatory path. | Keep the marker set complete for the declared roots, preferably derive it locally from that list. Exercise the repaired script; do not change installer options, hooks or deletion boundaries. |
| SAC-06, P2 | An ordinary Stop/preparation-failure cleanup can retain closed player/scheduler owners. Same-profile Recheck clears the terminal explanation without releasing them; the resulting `stopped` state has no Play/Stop action. | Recheck must settle/retry the existing teardown before clearing containment, or retain a truthful blocked state and executable recovery action. Do not enable start over retained owners. This is not all cleanup failures and does not require an app restart in every case. |
| SAC-07, P2 | Spanish `0,20 EUR` can become `0,veinte euros`: currency matching lacks the adjacent numeric-expression guard. | Preserve the whole unsupported amount and retain accepted standalone currency expansions. Extend the mutable normalizer's existing bounded guard, not the lexical tables or historical v1 authority. |
| SAC-08, P2 | Piper preparation of `A` followed by 320 NBSP consumes 321 source points but ends its last segment at 320. The finalizer rejects the inconsistent completion as `internal-failure`. | Represent/consume the nonspoken suffix consistently with continuation and source ranges. Never exceed the segment ceiling, emit empty speech, skip substantive text or weaken the finalizer's general invariants. Prefer the packer owner; change finalization only if explicitly needed for silent-tail semantics. |
| SAC-09, P2 | JPEG metadata uses raw SOF dimensions; the browser reports oriented natural dimensions. A non-square JPEG with EXIF orientation 6/8 is rejected as `decode-mismatch`. | Interpret only the bounded EXIF orientation needed for equivalent dimensions, preserving raw and presented limits and decoded-pixel accounting. Keep unexpected dimension mismatches rejected; do not accept every swapped pair or add a general EXIF library. |
| SAC-10, P2 | Operational-failure containment allocates new five-second waits after earlier cancellation/operation work. Backend close starts concurrently, but cleanup can still finish beyond the total bound and be accepted. | Use one monotonic final-cleanup deadline across containment, retaining the separate termination maximum and existing ownership checks. Reuse the ordinary Stop deadline mechanism where possible. |
| SAC-11, P2 | Pause can cross a transition deadline between clock reads and freeze a zero remainder with no start time. Resume rejects that retained transition and becomes `audio-playback-failed`. | Settle an exhausted transition coherently while remaining paused; Resume starts a successor at most once. Preserve positive remaining delay, cancellation and the absence of inserted silent PCM. |
| SAC-12, P2 | The supervisor grants a fresh 120-second timeout to every synthesis response. No cumulative watchdog enforces the protocol's per-command maximum. | Establish one absolute deadline at dispatch and pass remaining time through the response chain. The same helper should cover the already identical renewal pattern in handshake, health, load, warm and graceful shutdown without changing their respective budgets. Load and warm remain separate commands. Preserve identity checks, inclusive boundary semantics and process containment. |
| SAC-13, P2 | `isNonLocalReference` rejects `?` anywhere, so `#note?1` loses its local link although the existing OCF parser accepts that fragment. `#note%3F1` works. | Distinguish the path/query from the opaque fragment using existing parsing. Keep real queries before `#`, external URLs and unsafe references rejected; preserve exact target resolution. |
| SAC-14, P2 | Ordinary Chatterbox preflight omits CUDA compute capability and can report success on an unsupported GPU. Native installation/runtime gates still reject it. | Match the published requirement of known default-device capability exactly 12.0 in the existing harness gate; reject other, missing and unknown values. No physical multi-GPU campaign or acquisition journey is needed to prove this predicate. |
| SAC-15, P3 | Future-version reader preferences hydrate defaults through `setPreferences`, which caches `ready`; opening a book then enables controls whose writes the repository correctly rejects. | Preserve hydration status across restoration and keep persistence controls truthful. Future bytes must remain untouched; do not describe this as stored-data corruption. |

## Scope and non-goals

One integration batch with five implementation groups, not fifteen independently
accepted releases. Sharing coordinator, parser, bundle and native inputs makes
separate full validation campaigns wasteful. A group being coded does not mean
it is accepted before the final applicable gates and independent review.

| Group | Findings | Primary production owners |
| --- | --- | --- |
| A: narration lifecycle | 01, 04, 06, 10, 11 | `apps/desktop/src/tts/product-narration-coordinator.ts`, `pcm-playback.ts`, `reader/segment-highlight-controller.ts`; `ReaderPublication.tsx`/controls only if owner fixes require wiring |
| B: preference state | 03, 15 | `apps/desktop/src/persistence/hardware-profile-preference.ts`, `reader-position-restore-coordinator.ts`, `settings/app-preference-effects.ts`; compatibility/App only if needed |
| C: EPUB preparation/references | 07, 08, 13 | `packages/epub/src/narration/narration-bilingual-normalizer.ts`, `narration-segment-packer.ts`, conditional `narration-prepared-segment.ts`, `document/xhtml-projector.ts` |
| D: bounded raster interpretation | 09 | `apps/desktop/src/reader/images/raster-image-policy.ts`, `raster-image-source.ts` |
| E: native/tools | 02, 05, 12, 14 | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, `tts_service_supervisor.rs`, `scripts/test-windows-package-lifecycle.ps1`, `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs` |

Use existing adjacent tests and the existing browser/native harnesses. Freeze
the actual path allowlist before implementation; add a helper only for a concrete
bounded responsibility. Avoid unrelated formatting, extraction or renaming.
Use one source writer at a time for shared owners. No production dependency,
schema/version, model/voice, runtime package, arithmetic DSP, buffer threshold,
automatic recovery policy, CSP or native capability change is planned.

Do not edit frozen normalizers, corpora, authorities, generated sources or
completed plans. Do not rebuild/publish Chatterbox v7 or create v8. Python
inference and packagers are outside the intended changes. No Qwen, all-speed,
listening-quality, signing, full network-delivery or general performance campaign
is included solely because these fixes touch narration. A demonstrated expansion
of affected inputs requires a recorded plan/gate adjustment before costly work.

## Relevant files and documentation

Read [AGENTS.md](../../../AGENTS.md), [plan rules](../../../.agents/PLANS.md),
[documentation index](../../README.md), [MVP](../../product/mvp.md),
[settings/playback requirements](../../product/reader-settings-and-playback-controls.md),
[roadmap](../roadmap.md), [system diagram](../../architecture/system-diagram.md)
and [overview](../../architecture/overview.md).

Applicable authorities are [EPUB ingestion ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md),
[raster ADR-0010](../../architecture/decisions/ADR-0010-bounded-raster-image-decode.md),
[storage ADR-0011](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md),
[lifecycle ADR-0056](../../architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md),
[diagnostics ADR-0059](../../architecture/decisions/ADR-0059-optional-download-diagnostics.md),
[current boundaries ADR-0065](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md),
[protocol v1](../../architecture/tts-service-protocol-v1.md),
[recovery](../../architecture/hardware-profile-recovery-authority-v1.md),
[synchronization](../../architecture/synchronization-authority-v1.md),
[transition pauses](../../architecture/playback-transition-pause-policy-v1.md)
and the [completed M005 plan](../completed/M005-narration-text-preparation.md).
M005 is complete and remains a preparation boundary, not new TTS/audio evidence.

Commands come from root/workspace `package.json`, Cargo configuration,
`apps/desktop/playwright.config.ts` and the existing host scripts. Acceptance
follows [testing](../../development/testing.md),
[independent bug review](../../development/agentic-change-review.md) and
[evidence retention](../../development/evidence-retention.md). Apply the
[validation policy's input-identity/reuse rules](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
as evidence discipline; this behavior-changing batch is not a refactor campaign.

## Architecture and constraints

Keep EPUB text on device, inference local and generated audio memory-only by
default. Use synthetic, repository-authored fixtures. Do not persist book text,
PCM, models, private paths or raw logs in Git. Keep one service tree, bounded
preparation/PCM queues, stable source-code-point locators and identity-first
cancellation across Pause, seek, chapter/profile/language changes and close.

No new component, process, data store or external flow is expected. Review the
system diagram at closeout; update it only if the implemented architecture
actually changes. Record corrected behavior in maintained documentation and this
plan. A small new ADR may record the EXIF/silent-tail interpretation if necessary;
do not rewrite frozen M005/normalization authority or historical acceptance.

SAC-08 must retain exact source coverage and finite continuation even when the
last spoken range precedes a consumed silent suffix. SAC-09 must bound TIFF/APP1
offset reads and reject ambiguous/malformed orientation safely; raw dimensions,
oriented dimensions and pixel totals must satisfy their applicable limits before
decode. Neither fix justifies relaxing all mismatches or resource checks.

SAC-12 is one per-command deadline correction in the existing supervisor, not a
transport rewrite. Confirm dispatch/write and final-response timing against the
same monotonic deadline; already queued records must not make an expired command
successful. Preserve the existing terminal timeout/containment result and do not
grant retries or additional time. Tests must use short controlled budgets rather
than sleeping through production 120-second timeouts.

## Milestones

### M0: Freeze scope and evidence decisions — complete

At implementation start recheck HEAD, worktree/index, owners, existing assertions
and current commands. Record the allowlist, full input/environment identities
and selected gates in a new immutable ledger under
`docs/plans/evidence/static-audit-corrections/`; raw receipts belong in ignored
`tmp/evidence/static-audit-corrections/`. Preserve other work.

Retrieve the receipts below before scheduling expensive work. Decide reuse per
leaf, not per directory or old approval. A short read-only evidence comparison
should not become a reconstruction project: missing/uncertain proof means rerun
that affected gate. Do not run a fresh full baseline by default; add focused
regressions demonstrating the specific old behavior. Historical passing controls
are useful baseline context but do not pretend the new regressions already ran.

### M1: Correct the five groups — complete and accepted

Extend existing tests at public/owner boundaries before each corresponding fix.
Collect the new failing cases by package/owner in as few focused invocations as
practical. A failure must be the intended assertion, not missing dist, malformed
fixtures or harness setup. Apply the minimum owner change, then run the affected
focused green selection. If the final full suite immediately covers unchanged
green cases, use that execution rather than repeating a redundant focused run.

Keep all fifteen dispositions explicit. No silent skip, weakened assertion or
threshold increase counts as a fix. Preserve nonaffected negative controls.
Group A's coordinator edits are one cohesive unit to avoid repeatedly modifying
and validating the same lifecycle logic.

### M2: Cheap combined validation and artifact preparation — complete

Run affected formatting, lint, types and deterministic tests before builds,
models or installer mutation. Get an independent read-only review of the
proposed scope, regression coverage and reuse decisions before costly gates.
This interim review does not replace the final evidence-backed approval.

Check installed tool/driver/Chromium/WebView2/NSIS availability, free space,
short writable scratch and existing runtime/model identities. Reuse verified
payloads. Build each required final configuration once after the last relevant
source/harness edit; default Tauri and `release-locked-runtime` are distinct
artifacts. Keep their identities and installer bytes separate. A build does not
prove installation, native startup, playback or cleanup.

### M3: One combined acceptance and review — implementation accepted

Run the selected browser, native, host and lifecycle gates below. Freeze and
hash app/test executables before each artifact's host session; no relinking
during it. Preserve receipts if another configuration later overwrites a shared
output path. Use the already compiled test binary for opt-in diagnostics when
the existing receipt procedure proves equivalence; otherwise use its registered
Cargo command and freeze the resulting artifact before the session.

Verify restoration/cleanup after success, failure and interruption. Submit the
complete exact patch, identities, commands, reused receipts and remaining limits
to `change_reviewer` and obtain APPROVE before implementation acceptance. Missing
required host evidence/reviewer remains blocked, not an inferred pass. Freeze
final docs before the final report; move the plan to completed and update indexes
only after all required acceptance is resolved. Future commits/pushes/PRs remain
subject to that implementation session's user authorization.

## Testing and benchmark strategy

### Existing evidence inspected and reuse disposition

Primary historical reference: [PR #280 execution ledger](../evidence/validated-chat-findings-corrections.md)
and [completed plan](../completed/validated-chat-findings-corrections.md).
The recorded approval is `CHAT-FINDINGS-R3-ASTRA-20261027`; it belongs to its
original inputs. Original result/log/before/after files were found under ignored
`tmp/evidence/validated-chat-findings/`. These local files are not guaranteed to
exist in another checkout and must be retrieved or the relevant gate rerun.

| Evidence inspected | Historical result | Decision for this future patch |
| --- | --- | --- |
| `R1-Q-desktop-*`, `R1-B1-browser-*` | 867 desktop tests/61 files; four CHAT-AUDIT browser cases passed | Baseline/reference only. Coordinator, PCM, preferences, raster and their bundle/tests change: rerun affected acceptance. |
| `Q-typescript-after-fixture*`, `Q-typescript-remainder*` | 210 shared + 688 EPUB tests; generator check of 17 files; 101 tests across seven Node files passed | EPUB and changed harness results invalidated. Shared-only result may be reused if its complete closure is identical; new package inputs can invalidate broad tools. Do not repeat old suites just to establish a baseline. |
| `R1-Q-native-final-*`, `r1-frozen-binaries.json` | 132 default + 131 release-locked Rust tests, six opt-in ignores each; Clippy passed | Native changes invalidate both variants and their binaries. Ignored host tests are not implied passes. |
| `Q-python-final.log`, `Q-python-authority-repair*`, `Q-python-transitive-remainder*`, `Q-python-conformance-current*`, `python-authority-closure.json`, `input-reuse-comparison.txt` | Final historical composition: 597 + 66 + 13 + 2 = 678 covered cases; mypy 180 files; Ruff passed | Strongest result-reuse candidate, not yet approved here. Python tests also read docs, schemas, native/packaging inputs and Git history: inspect their transitive closures. Rerun only invalidated modules if independence is proved; otherwise the suite. The original aggregate had 42 failures and must never be renamed PASS. |
| `Q-foundation-remaining*` | Python wheel build and evidence-policy leaves passed | Python build may be reused after complete input/artifact/tool proof. Evidence guard consumes current index/Markdown: run on final state. |
| `R1-H-CPU-*`, `R1-H-GPU-*`, `R1-H-LOAD-*`, `r1-host/host-cleanup.json` | Piper EN and production Chatterbox ES/EN, cancellation/restart, loader controls and cleanup passed | Reuse verified runtime/model payloads; not the changed supervisor/app's runtime results. Fresh bounded CPU/GPU gates are selected below. No unconditional repetition of loader-negative probes when bootstrap is intact. |
| [PR #278 plan](../completed/narration-chatterbox-correctness.md), `tmp/evidence/narration-chatterbox-correctness/run-01/B1-final-*` | NCC browser case at 1.00x/0.75x passed | Retain old regression/fixture and result context; changed bundle needs a fresh browser result. |
| [PR #277 plan](../completed/lifecycle-correctness-follow-up.md), `tmp/evidence/lifecycle-correctness-follow-up/B1-final-*`, `I1-continuation-results.json` | LCF browser and continuation leaves passed; original `check` stopped on formatting | Do not claim aggregate PASS. Unchanged installer policy evidence is background; it cannot validate the repaired nine-root script. |
| [PR #276 plan](../completed/narration-logic-corrections.md), `tmp/evidence/narration-logic-corrections/H2-R03-result.json` | Prior browser/integration/Piper and Chatterbox ES acceptance | H2 used historical v6, not v7. Existing DSP/listening decisions remain intact; no fresh all-rate/quality campaign unless that closure changes. |
| [V7 plan](../completed/chatterbox-msgpack-security-refresh.md), `services/tts/release/optional/chatterbox/dist/v7/evidence/C1-retained-package-*`, `R8-exact-final-admission-*`, `R9-windows-consumer-*` | Retained package, local acquisition replay and Windows consumer gates passed | Reuse verified payloads; omit replay if extraction/promotion/layout closure is unchanged. R8 used local copies, not live HTTP. R9 consumes the changed ordinary-host script and must be rerun through current Node coverage. |

Historical #280 app SHA-256 is
`0e7e6eeb1daf7893eb0459bbf20a19a4dede2f0ba02576266570f82cca3c0e5e`;
its release-locked test executable is
`9320f66bd88bebc07d70d3d2b33bf71f32780b6bf53863d95df3d252d0c7e0f6`.
Neither is a future-patch identity. Retained V7 runtime-manifest SHA-256 is
`48b392d82e9937e369170fd5c816b7a4ad766009f8816739441dddbd076c5d8a`;
runtime ZIP SHA-256 is
`39dc073e01a5f02ce95b44e23b1024c3062ad1394fce3c917ec113fa45881aaf`.
Planning read these identities; it did not hash current payloads or approve reuse.
There is no accepted complete V7 live-delivery PASS to recycle. Historical V6
timeouts remain unresolved, and SAC-02 does not claim to fix network reliability.

For each reused leaf record original receipt/gate ID, exact command/outcome,
execution-time hashes, full source/import/fixture/config/lock/runner/build closure,
glob membership, tool versions and relevant environment. Explain why every
changed path is outside that closure. Compare actual bytes and host assumptions;
do not reconstruct missing execution-time identities, renew an old approval or
substitute current HEAD alone for this proof. A fresh independent report must
explicitly accept each reuse. Prepared artifact reuse is a separate decision
from runtime/performance-result reuse.

### Regression selection

Extend an existing assertion where it already proves the invariant; add only
the missing scenario. Table entries describe coverage, not one new test per
phrase or mandatory edits to every listed test file.

| IDs | Existing test owners and minimum missing coverage |
| --- | --- |
| 01, 04, 06, 10 | `product-narration-coordinator.test.ts`, `ProductNarrationControls.test.tsx`, `reader/segment-highlight-controller.test.tsx`, `ReaderPublication.test.tsx`: completed/materialized range then explicit chapter navigation; deferred first 0.75x preparation with no premature metrics; transient failed Stop then same-profile recheck, plus persistent failure remains blocked; combined cancellation/backend cleanup at deadline and deadline+1. Preserve old heard-position/episode-total assertions. |
| 11 | `tts/pcm-playback.test.ts`: controllable clock crosses the boundary between Pause reads; no successor while paused, Resume once; existing positive-delay and pending-worklet cases remain. No probabilistic timing loop. |
| 03, 15 | `persistence/hardware-profile-preference.test.ts`, `tts/hardware-profile-compatibility.test.ts`, `settings/app-preference-effects.test.tsx`, `persistence/reader-position-restore-coordinator.test.ts`, `App.test.tsx`: malformed-save-select; future envelope hydrate then open, status/control persistence and byte preservation; retain storage-denied/future-write negative controls. |
| 07, 08 | `packages/epub/src/narration/narration-normalizer.test.ts`, `narration-segment-packer.test.ts`, `narration-prepared-segment.test.ts`, `narration-resource-bounds.test.ts`, `integration/narration-preparation-matrix.test.ts`: unsupported decimal currency stays whole and `20 EUR` still expands; silent suffix at maximum/+1, all-silent input, following substantive paragraph, one-vs-many segment drain, exact ranges, unchanged bounds and cancellation. Run frozen corpora unchanged as regression controls. |
| 13 | `packages/epub/src/document/xhtml-projector.test.ts`, `paths/ocf-reference.test.ts`, `public/open-epub-publication.test.ts`/existing integration matrix: literal and encoded fragment equivalence through the public target; real query/external links remain inert; duplicate/unresolved target behavior unchanged. |
| 09 | Existing `raster-image-policy.test.ts`/`raster-image-source.test.ts`: non-square orientation 6/8 and identity/mirror controls; bounded TIFF byte order/offset/type/count handling, truncation/ambiguity; exact/+1 dimension and pixel limits; arbitrary mismatch still rejected; revoke/release/cancel once. One synthetic JPEG fixture family, no copyrighted image. |
| 02 | Existing optional-manager HTTP tests under `tts_optional_chatterbox/tests`: real loopback response read blocks, cancel is signalled, then timeout/reset occurs; old diagnostic retained, state cancelled, staging cleaned; uncancelled read error still fails. The existing copy hook bypasses the HTTP read loop and cannot establish this regression. |
| 12 | Existing supervisor tests/fake child: partial responses individually within budget but cumulatively late; exact bound/+1, already queued late data, genuine success, cancellation and identity isolation. Cover each affected command chain with short controllable budgets, not 120-second sleeps. |
| 05, 14 | Existing `ordinary-chatterbox-release-host.node-test.mjs` and `windows-release.node-test.mjs`: 12.0 vs other/unknown/missing; root/marker coverage if a small structural assertion adds useful prevention. Real lifecycle execution below proves the repaired loop beyond a source-string check. |

### Minimal gate ledger

All future commands run from repository root in normal local PowerShell outside
the managed sandbox. No commands in this section ran during planning. Record
actual timing and outcomes later; no estimated test-count reduction is claimed.

| Gate | Existing command / selection | Timing, inputs and reuse boundary |
| --- | --- | --- |
| D-EPUB | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-segment-packer.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/paths/ocf-reference.test.ts src/document/xhtml-projector.test.ts src/public/open-epub-publication.test.ts` | New red cases/affected green controls; build packages first when dist is needed. EPUB/shared, corpus, fixtures, TS/Vitest/dependencies. Final complete EPUB acceptance remains once, not once per bug. |
| D-Desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/pcm-playback.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/hardware-profile-compatibility.test.ts src/reader/segment-highlight-controller.test.tsx src/reader/ReaderPublication.test.tsx src/persistence/hardware-profile-preference.test.ts src/settings/app-preference-effects.test.tsx src/persistence/reader-position-restore-coordinator.test.ts src/App.test.tsx src/reader/images/raster-image-policy.test.ts src/reader/images/raster-image-source.test.ts` | One combined selection for touched desktop owners, narrowed for red reproduction as justified. Includes current shared/EPUB dist, React/jsdom and runner. Do not pass Vitest selections through desktop `test`, which chains Node commands. |
| D-Native | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests` and `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests` | Focused reproduction in default configuration. Final `pnpm.cmd test:rust` covers both complete feature configurations; no automatic repeat of all focused selections in both beforehand. Cargo/build.rs/embedded fixtures/manifests/toolchain are inputs. |
| D-Tools | `node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs` | Harness regression and compiled NSIS controls; requires existing NSIS setup. Final seven Node suites cover these once after final changes. |
| B1 | `pnpm.cmd test:browser foundation.smoke.spec.ts reader-narration-bugfixes.smoke.spec.ts` | One combined browser invocation after integration: add EXIF/local-fragment coverage to foundation and completed-navigation/preferences/recovery coverage to the narration spec; reuse existing LCF/NCC/CHAT-AUDIT controls. Real Chromium/Image/worklet; new bundle invalidates old browser PASS. Timing races stay deterministic unit tests. |
| N1 | `pnpm.cmd test:native-startup`, or its existing post-build leaf `node apps/desktop/scripts/native-startup-smoke.mjs` | Once on final default app/WebView2. Extend its existing raster fixture to cover oriented JPEG under actual CSP and release. Reuse prior build only with exact artifact/configuration proof. |
| H-CPU | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | One current Piper arm for supervisor/coordinator lifecycle, synchronization and cleanup. New decimal text/ranges are proved deterministically; no pronunciation/quality claim. Current app/harness, verified core/voice, WebView2 and host are inputs. |
| H-GPU | `pnpm.cmd test:chatterbox:v7:native-startup` | Existing bounded production-launcher diagnostic, sequential ES/EN in one invocation, cancellation/restart/cleanup. Use verified V7 runtime/models and documented `VOXLEAF_V7_RUNTIME`, `VOXLEAF_V7_MODELS`, owned scratch. No Qwen or model download. Both native owners change, so historical H-GPU is not sufficient. |
| P1 | `pnpm.cmd package:windows:ordinary-chatterbox:preflight` | Once with a verified release-locked executable and compatible host after the JS gate fix. Node negatives prove other architectures; actual host report proves positive path. Does not establish download/runtime acceptance. |
| L1 | `pnpm.cmd package:windows:lifecycle` | Execute the repaired script with no installation at entry. Updated authorization permits uninstall/reinstall on this host; its fixture data are isolated by the existing backup/restore safeguards. Uses verified installer, NSIS behavior and PowerShell; no TTS/model generation or clean-new-Windows claim. See preparation decision below. |
| F1 | Equivalent applicable leaves of `check`/`check:portable`, below | Once on final relevant inputs, with explicit receipt reuse; no aggregate claim when only leaves ran. Current CI obligations are unchanged. |

For L1, the minimum is a verified retained installer when its unchanged
hook/options/layout make it a valid **harness test fixture**. That does not prove
installation of the newly corrected product. At M0 inspect the retained artifact
and P1's release-binary requirements: if a matching prerequisite is unavailable,
or current packaged-product acceptance is required by the actual patch, run
`pnpm.cmd package:windows:verified-core` once after source freeze and use that
final installer for both relevant checks. Its existing leaves may instead be
executed with the evidence output captured separately to preserve the historical
tracked package receipt; see the [current ledger](../evidence/static-audit-corrections/M3-validation-ledger.md).
`pnpm.cmd package:windows:check` checks the package inputs. The user's subsequent
authorization permits uninstall/reinstall on this host with verified data
restoration. Do not rebuild unchanged Piper payloads instead of checking them
or claim old installer acceptance for new bytes.

Additional loader-negative probes, installed acquisition probes, full replay,
interactive installer choices or all-rate listening are conditional only on a
changed consumed boundary or unresolved regression evidence. If bootstrap changes,
add `pnpm.cmd test:chatterbox:v7:native-loader`; if extraction/promotion changes,
reconsider `pnpm.cmd test:chatterbox:v7:local-admission`. Neither is a substitute
for SAC-02's real read-error race. Do not run the unfiltered adaptive/resilience
aliases, which also select deferred Qwen work.

### Final graph without duplicate campaigns

Preserve applicable `check` and `check:portable` coverage through this mapping.
The final reviewer accepts the actual leaf ledger, not a blanket exclusion of
Python or a historical aggregate. If equivalence cannot be established, execute
the original applicable aggregate instead.

| Obligation | Existing leaves and minimum scheduling |
| --- | --- |
| Current evidence/privacy | `pnpm.cmd check:evidence`, `pnpm.cmd test:evidence`; the former consumes current Markdown/index. Reuse the latter only with its full script/fixture/environment proof. |
| TS checks | `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript`, `pnpm.cmd test:typescript` once on final inputs. The test graph includes shared generator/pretest builds, EPUB, desktop Vitest and seven Node suites. Prefer one final full graph over an expensive proof excluding a handful of cheap tests. |
| Rust checks | `pnpm.cmd format:check:rust`, `pnpm.cmd lint:rust`, `pnpm.cmd test:rust`; retain default and release-locked variants. Schedule final test executable generation after app/build changes that can relink it. |
| Python checks | `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`, `pnpm.cmd typecheck:python`, `pnpm.cmd test:python`, `pnpm.cmd build:python`: reuse proven independent receipts/module groups above; execute affected/unknown leaves. Unchanged `.py` files alone do not prove independence from docs/native/package inputs. |
| Builds | `pnpm.cmd build:packages`, `pnpm.cmd build:desktop`, Python build/reuse; portable Vite leaf is `pnpm.cmd --filter @voxleaf/desktop build`. Tauri already runs Vite via `beforeBuildCommand`, and Playwright runs its own Vite web server build. Credit identical successful leaves only with matching inputs/config/environment; keep necessary wrapper builds unless equivalence is proved. |

Do not run both broad aggregates, each focused full suite and all host wrappers
by habit. Do not introduce a new runner or change Playwright/Tauri build semantics
solely to avoid a cheap rebuild. Hashing a prepared runtime once per immutable
session and verifying it after host mutation is different from reconstructing it.
No second download, model-package build or all-engine portfolio is the default.

## Risks and rollback

- Deadline and recovery fixes are high risk: a superficially enabled control
  must not hide retained ownership, and a timeout must not kill a replacement.
  Preserve identity, real failure, zero-retention and pending-start controls.
- EXIF is untrusted input; retain predecode limits and bounded parsing, including
  policies whose width/height maxima differ. A malformed image fails locally.
- Silent-tail repair must not widen a segment beyond the source limit or skip
  substantive text after omitted tokens. Preserve frozen corpus expectations.
- Receipt drift can make apparent savings invalid. Missing proof triggers the
  affected rerun; historical failed/incomplete attempts remain visible.
- Before host mutation record task-owned processes by PID, creation time and
  executable identity, scratch, temporary rules and original data restoration.
  Use existing safe cleanup; no broad process kills or destructive data reset.
- Permit at most one infrastructure retry per failed stage with a concrete
  changed condition. A second failure stops that stage for diagnosis/replanning.
  No repeat-until-green loops or repeated expensive baseline campaigns.
- Roll back only this task's owned source changes/commits when authorized;
  preserve user work and old receipts. A failed implementation leaves the plan
  active. No schema migration, runtime replacement or irreversible user-data
  operation is needed for the intended fixes.

## Progress log

- 2026-10-28: Revalidated fifteen findings statically on the planning base;
  precise triggers and defensive boundaries retained above.
- 2026-10-28: Inspected existing regression suites, command graph, original local
  receipts and historical ledgers. Separated reusable artifact candidates,
  independently reusable leaf candidates and invalidated runtime results.
- 2026-10-28: Created the dedicated planning branch and this ExecPlan/index entry.
  No implementation, tests, builds, benchmarks or model execution performed.
- 2026-10-28: Two independent read-only document reviews found no actionable
  scope, command, reuse or acceptance gaps; cited owner/test/authority paths were
  checked. This is document consistency evidence, not future patch approval.
- [x] M0 scope/identity/reuse ledger after implementation authorization.
- [x] M1 minimal corrections and focused regressions.
- [x] M2 cheap checks, review and final artifact preparation.
- [x] M3 current combined acceptance, verified cleanup and independent approval.

- 2026-10-28 implementation: branch/HEAD match the planning commit; initial
  index/worktree clean. Independent investigations revalidated all fifteen
  findings with no contradictory disposition. Scope/evidence frozen in
  [M0](../evidence/static-audit-corrections/M0-scope.md), with fixture/host
  [amendments](../evidence/static-audit-corrections/M1-scope-amendments.md).
  Source snapshots and tool versions were captured before production edits in
  ignored `tmp/evidence/static-audit-corrections/M0-*`.
- Regression-first host receipts preserve A-red-01 (7 intended failures/1
  passing boundary control), B-red-01 (4 intended failures), C-red-01 (7 intended
  failures/3 controls), D-red-01 (15 intended failures/4 controls),
  E-tools-red-01 (2 intended failures), E-download-red-01 and E-deadline-red-01.
- Focused current results: A-owner-green-01 168 PASS, C-green-02 15 PASS,
  E-rust-green-02 5 PASS, E-tools-green-01 2 PASS. These do not replace final
  integration/native/hardware gates. Early green attempts with fixture/ticker
  assumptions are retained under their original IDs. BD-green-01 has 164 PASS
  and two stale mock-signature assertions, corrected before final acceptance.
- M2: complete TS graph passed (210 shared, 702 EPUB, 899 desktop, 102 Node);
  Python leaves passed (678 tests, mypy 180, Ruff, wheel/sdist), evidence tests
  passed 31. B1 first attempt had 16 PASS/1 fixture failure; affected-spec
  continuation had 12 PASS/1 selector failure. The directed corrected SAC-15
  case now passes. Stage diagnosis/replanning is recorded in
  [M2 adjustment](../evidence/static-audit-corrections/M2-review-adjustment.md).
- Independent [R1 review](../evidence/static-audit-corrections/review-R1.md)
  returned BLOCKED, confirming a real SAC-12 blocked-write hole plus the B1
  selector gap. Source writing paused during review. The private writer-owner
  correction and real pipe regression precede expensive native preparation;
  final exact-patch approval remains pending.
- B1-reader-browser-03 passed all 13 reader cases. The four unchanged foundation
  cases retain their B1-browser-01 evidence. Final TS format/lint and affected
  desktop types passed; independent closure analysis supports retaining this
  run's Python and Vitest/Node results. Exact commands and reuse conditions are
  tracked in the [current validation ledger](../evidence/static-audit-corrections/M3-validation-ledger.md).
- SAC-12's real pipe regression reached its intended RED after two preserved
  fixture setup failures and explicit replanning. The original writer required
  the captured-process rescue watchdog. The private bounded writer correction
  now passes all 32 supervisor cases, including real blocked dispatch and
  cancellation without rescue. Earlier cumulative-clock tests remain controls.
  Full Rust validation and renewed review remain pending.
- [R2 review](../evidence/static-audit-corrections/review-R2.md) closed both R1
  findings with no actionable defect; BLOCKED only by remaining acceptance.
  Subsequently the final Rust matrix passed 139 default and 138 release-locked
  tests, and the default Tauri build passed. Native/host gates are in progress.
- N1's new image test initially waited on lazy images outside the retained
  narrow viewport. A focused native diagnosis confirmed correct 2x3 decode
  after scrolling; the harness now makes the images visible before asserting
  dimensions. Full N1-native-02 passes with the same binary. H-CPU-01 passes
  real Piper playback, synchronization and cancellation with zero retained
  audio/units/external requests at cleanup. H-GPU is running.
- H-GPU-01 passed supervised V7 ES/EN, cancellation/restart and complete runtime
  post-verification; its owned scratch and processes are cleared. Because Cargo
  relinked the release-locked libtest, its 138-test leaf was renewed directly on
  the exact tested executable; no hardware rerun or new compile was needed.
- Final NSIS build and artifact evidence passed using the existing packaging
  leaves, preserving the historical package receipt. L1-lifecycle-01 stopped
  before data ownership initialization because pnpm inherited PowerShell 7
  module paths into PowerShell 5.1. The original data remain protected and the
  wrapper reinstalls in `finally`. A process-only Windows module precedence
  correction was reproduced successfully; one bounded infrastructure retry is
  pending the first restoration verification.
- First restoration verified every original data byte. The installed app's
  three-byte Tauri NSIS stamp was independently tied to its exact build and
  cached crate authority; build and installed identities are recorded separately.
  L1-lifecycle-02 then passed installation, first start, repair and all six
  option scenarios, followed by final reinstall and P1-preflight-01 PASS in
  ordinary/hostile environments. Final original-data comparison is running.
- H-install-restore-02 completed with verified final installation and every
  original data byte/directory restored after L1/P1. Final inspection found no
  task-owned temporary roots or native/driver/model processes; pre-existing
  unrelated roots were preserved. No firewall/drive-alias mutation occurred.
- Current evidence/privacy guard, local Markdown targets and diff checks pass;
  final conservative reuse manifests confirm unchanged consumed inputs and
  Python artifacts. Toolchain/environment versions match the initial capture.
  Final exact-patch review was the remaining acceptance gate at that checkpoint.
- Independent [R3 review](../evidence/static-audit-corrections/review-R3.md),
  `SAC-R3-20261028-01`, returned APPROVE for all fifteen findings and their
  mandatory execution evidence, with no actionable findings or blocking gaps.
  The 94 manifest paths plus nine unchanged supporting paths matched before
  and after review. Branch/HEAD are unchanged and the index remains empty.
- Documentary closeout moves this accepted plan to completed, updates its
  indexes and ADR status, and renews only the evidence/privacy guard, local
  links and exact archive review. Runtime sources, fixtures, tools and artifacts
  remain unchanged. The [final report](../evidence/static-audit-corrections/review-final.md)
  records that separate review's ID, verdict and final identity check. No commit,
  push, PR or merge is authorized or performed.

All fifteen dispositions below are accepted by R3. Focused receipts identify
the original regressions; the final passing package and integration gates in
the validation ledger establish acceptance after subsequent corrections.

| Finding | Accepted disposition and regression evidence |
| --- | --- |
| SAC-01 | Explicit chapter navigation clears obsolete completed highlighting; stationary completion preserved. A-red-01/A-owner-green-01; B1 PASS. |
| SAC-02 | Real HTTP read failure rechecks cancellation before replacing diagnostic; loopback manager state/staging regression. E-download-red-01/E-rust-green-02. |
| SAC-03 | Explicit valid hardware preference replaces malformed JSON; storage/future guards retained. B-red-01/BD-green-01. |
| SAC-04 | Actual started unit anchors audible metrics; pending/failed worklet initialization excluded. A-red-01/A-owner-green-01. |
| SAC-05 | Marker array derives from all nine optional roots. E-tools-red-01/E-tools-green-01; real L1 PASS. |
| SAC-06 | Recheck retries retained-owner cleanup once and preserves persistent blocking. A-red-01/A-owner-green-01; B1 PASS. |
| SAC-07 | Existing adjacent-number guard includes currency without changing lexical authority. C-red-01/C-green-02. |
| SAC-08 | Packer completion requires actual unit consumption; silent suffix follows existing unspoken continuation. Finalizer unchanged. C-red-01/C-green-02. |
| SAC-09 | Bounded IFD0 EXIF orientation determines presented dimensions; raw/presented/pixel limits retained. D-red-01/BD-green-01; B1 and N1 PASS. |
| SAC-10 | Operational containment shares one final cleanup deadline and separate termination maximum. A-red-01/A-owner-green-01. |
| SAC-11 | Exhausted transition settles during Pause; successor starts once on Resume. A-red-01/A-owner-green-01. |
| SAC-12 | Dispatch/write/response chains share absolute deadlines, load/warm separate; one bounded writer permits independent termination. Real blocked-write RED, final Rust/N1/H-CPU/H-GPU PASS; R3 APPROVE. |
| SAC-13 | Existing OCF parser handles opaque fragments and rejects actual queries. C-red-01/C-green-02; B1 PASS. |
| SAC-14 | Ordinary preflight requires known CUDA 12.0 exactly. E-tools-red-01/E-tools-green-01; real P1 PASS. |
| SAC-15 | Hydration retains preference status through book restoration; future bytes/disabled controls protected. B-red-01/BD-green-01; B1 PASS. |

## Discoveries and decisions

- Recent historical receipts are locally retrievable, but no old PASS has been
  approved for the future patch. In particular, changing frontend/Rust invalidates
  their dependent browser/native/model acceptance even with identical weights.
- Python evidence is composed from passing subsets after retained failures;
  its existing transitive-closure proof is useful input, not permission to say
  `check` or the failed original pytest aggregate passed.
- SAC-12's renewal is also present in the same supervisor's other multi-response
  commands. A single command-deadline helper with unchanged separate budgets is
  the bounded correction; no new protocol or general scheduling abstraction.
- The lifecycle script defect is outside what source-string/compiled-hook tests
  exercise. One real script invocation is necessary; a fresh installer build is
  conditional on the inspected artifact/acceptance requirements, not automatic.
- Separate timing/publication-state bugs from model quality: no change to DSP,
  weights, voices or arithmetic warrants rerunning their full old evaluations.
- Review the canonical diagram and M005 terminology at implementation closeout;
  current topology remains appropriate for this plan's owner-local corrections.

## Final validation results

**Implementation accepted: `SAC-R3-20261028-01`, APPROVE.** All selected
execution and evidence/privacy checks passed, including the required native,
CPU/GPU, installer and verified host-restoration gates. All fifteen corrections
are accepted with no pending implementation or mandatory execution criterion.
No historical runtime PASS is reused. Python leaves ran currently because
complete historical proof was unavailable. B1 passes through the explicitly
identified leaf composition; no failed aggregate is reported as passing.
R1/R2 remain historical BLOCKED checkpoints whose findings and evidence gaps
were resolved before R3. The [validation ledger](../evidence/static-audit-corrections/M3-validation-ledger.md)
records commands, binary identities, reuse proofs and preserved failures; the
[final archive report](../evidence/static-audit-corrections/review-final.md)
records the review of this documentary closeout.

The canonical diagram and M005 boundary still match the implementation. No
production dependency, public contract, runtime/model version or frozen
authority changed. Original application-data bytes and directory membership
were verified after reinstalling the final package. This local Windows
acceptance does not establish public signing/distribution, antivirus clearance,
an interactive clean-new-Windows installation or full ordinary Chatterbox
online acquisition; those remain outside this plan's bounded scope.
