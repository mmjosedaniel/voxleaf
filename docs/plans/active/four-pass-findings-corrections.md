# Correct the four-pass findings with bounded validation

## Goal

Resolve the supported cases from the four 2026-11-15 audits, using the smallest
causal corrections and the minimum sufficient validation. Preserve each finding's
history, reproduce its distinguishing failure before fixing it, and reuse existing
tests, fixtures and eligible evidence instead of repeating unrelated campaigns.

**Status: planning only; implementation and behavioral validation have not started.**
The current authorization is to create this plan, create its branch and commit the
planning/audit documents. It does not authorize executing the milestones below.

## User-visible outcome

After execution and acceptance, supported EPUB labels and horizontal time spacing
remain usable at their boundaries; implicit paragraphs retain their correct base
direction; a completed optional installation recovers the same narrator on the next
explicit Play; direct playback respects its allocation limit; and automatic refill
uses the rate that will actually play. Keyboard recovery is corrected only if the
reported native gesture is reproduced. Maintainer tools preserve recoverable raw
inputs, contain their children before restoring data, and bind release/benchmark
claims to the work and bytes actually observed.

This work does not claim new hardware support, better synthesis quality, a new
benchmark result, public signing, or complete v7 live-download acceptance.

## Current state

- Source baseline: `997cddff2a8658440324a87e44178a98018dea77`, originally on `main`.
  Planning branch: `codex/four-pass-findings-corrections-plan`. Product and test
  files matched HEAD before planning; the index was empty.
- Initial task inputs: modified findings registry and audit index, plus six
  untracked 2026-11-15 audit/reconciliation reports. They are deliverables of the
  preceding authorized review and belong in this planning commit. Preserve their
  dated observations; the deep validation supersedes earlier assessments where
  they differ. No unrelated changes were present.
- Canonical starting analysis: [deep validation](../../development/findings/audits/2026-11-15-deep-findings-validation.md),
  [prior reconciliation](../../development/findings/audits/2026-11-15-findings-reconciliation.md),
  [registry](../../development/findings/registry.md), and
  [partial historical import](../../development/findings/history-import.md).
  The deep report contains the original snapshot/file identities, causal paths,
  all 14 individual investigations and subsequent adversarial review. Its findings
  are static, not runtime reproductions.
- Fourteen cases have source-supported failures under their stated conditions;
  VF-0063 remains host-conditional; VF-0071 is not confirmed in the ordinary writer
  workflow. These are 16 records, with 15 actionable or conditional cases below.

| ID / unit | Original trigger and owner | Prior work and present disposition |
| --- | --- | --- |
| VF-0058 / U4 | Late Cancel after native Installed commit but before Download cleanup; client action generation suppresses the completion needed by App. | ADD-01 checked the fresh snapshot; CAF R3.1/VF-0046 checked ordinary explicit completion. Their assertions do not reach this ordering's next Play. Static present. |
| VF-0059 / U2 | Ordinary release smoke fails without verified containment; its exit-only launcher loses the cleanup receipt before profile restoration. | RAC-03, VF-0040/VF-0056 and the separate portfolio IPC consumer protect adjacent paths. Static present; no observed data loss or orphan. |
| VF-0060 / U3 | A 1,024-point XHTML/NCX label followed by trim-eligible Unicode padding is rejected before trimming. | VF-0047 covered short Unicode labels and attribute budgets. Static present; limit-plus-padding is missing. |
| VF-0061 / U3 | Spanish article/time separated by U+2002, U+2003 or equivalent admitted horizontal prose spacing produces a second article. | SAF-12, CFR-09 and VF-0039 progressively covered five separators. Static present; the character-class mismatch remains. |
| VF-0062 / U5 | Direct 1x playback holds both a full intermediate Float32Array and the device channel. | `bc4c1a8` introduced the extra store; the later backend extraction preserved it. Existing tests count device buffers only. Static present, with Git-supported regression provenance; no RSS or audible-failure claim. |
| VF-0063 / U6 | After unavailable placement, a focused reader scrolls with Shift+Space or a supported Ctrl+Home/End chord, but the modifier guard records no manual intent. | CFR-03 covered ordinary PageDown; VF-0034 covered a scrollbar gesture. Conditional on real host input, focus and displacement; not reproduced. |
| VF-0064 / U3 | Direct text in an RTL block becomes an implicit LTR paragraph in an LTR chapter. | M003 inheritance, SFA-04 boundaries and VF-0036 inert-anchor stability are adjacent protections. Static semantic mismatch; actual caret/save corruption is unproved. |
| VF-0065 / U1 | v14 raw/load read or authority validation fails after the session is deleted in finally. | DCR-17 and U11 inherited the destructive order. No reviewed requirement mandates deletion after rejected validation. Static present. |
| VF-0066 / U5 | Following a real underrun, 45 source seconds qualify at 0.75x; pending worklet preparation then changes or falls back to 1x before allocation. | U2/3.2 covers initial start only. Historical initial commitment bypasses refill admission. Both explicit selection and worklet-failure fallback are same-ID variants. Static present. |
| VF-0067 / U2 | Installer path is replaced between ordinary execution and receipt hashing. | CFR-15/CFR-23 validate consumers, not producer byte ownership. Static present under concurrent replacement; no published incident claimed. |
| VF-0068 / U2 | Attach receipts to existing binaries after authority manifests change; new hashes describe inputs not packaged in those bytes. | CFR-19 protects signature/scan observations. Static present under authority drift; even a prior record is untrustworthy unless its build-input binding is established. |
| VF-0069 / U1 | Complete v14 matrix exceeds the 40-second replay capacity; playback-invalid becomes zeros and can still pass both dependent conclusions. | v4 inherited replay/derivation logic and U11 cancellation checks do not prove replay validity. Static present; ordinary incomplete playback is not the same false-PASS example. |
| VF-0070 / U1 | A final-only memory stop and unrelated failed attempt qualify CPU admission without proving a stop in the required first batch-two attempt. | U11 proves cancellation, version and committed bytes; ADD-02 stops active unsafe work before a derivable session. Static present; no legitimate positive v14 route was established. |
| VF-0071 / excluded | Externally mix independently valid raw/load files from different sessions. | The exclusive ordinary writer produces a matched pair. Not confirmed as an ordinary workflow defect; private pairing-manifest hardening needs a separate policy. |
| VF-0072 / U2 | Replace fresh-build artifacts after signature/Defender/checksum observation but before the Node writer first hashes them. | Distinct fresh-build caller of VF-0019/CFR-19's attachment family. Static present; no real signing or publication incident observed. |
| VF-0073 / U1 | Measured worker detects forbidden output; isolation redacts it, generic failure loses its privacy code, and derivation sets audits.privacy=true. | H3 detection and H4's older v8-v11 screen fix do not cover this batch path. Static false privacy claim; no demonstrated disclosure or overall PASS. |

Only VF-0062 currently has the introduction evidence needed to call it a regression.
Retain the more specific evidence limits in the deep report. A prior completed plan
or a later audit is not by itself a reproduction or proof of a failed fix.

## Scope and non-goals

Implement U1-U5 for the 14 supported cases after discriminating reproduction.
Investigate U6 on the real installed WebView2 runtime before deciding its patch.
If its supported gesture cannot be reproduced, preserve the exact negative result
and leave the case inconclusive or not-confirmed with independent assessment; do
not manufacture a recovery flag to force acceptance.

VF-0071 receives no automatic implementation. VF-0070 is bounded to rejecting
unproved v14 CPU admission. Designing a positive successor with causal stop records
and unrun-work representation is deferred, not silently counted as implemented.
Existing v4/v13 interpretation, frozen profiles/schemas/results, narration-v1,
model/corpus locks and accepted historical receipts remain unchanged. Shared helpers
may change only with explicit version routing and unchanged legacy assertions.

No broad refactor, new production dependency, model download/evaluation, privacy
policy change, new signing, publication, or expansion of product support is included.
This planning commit does not authorize later implementation commits, push, PR or
merge. Preserve unrelated work if the checkout changes before execution.

## Relevant files and documentation

Read [task routes](../../README.md#task-reading-routes),
[MVP playback](../../product/mvp.md#playback),
[canonical component/flow boundaries](../../architecture/system-diagram.md),
[overview invariants](../../architecture/overview.md#required-invariants),
[findings workflow](../../development/findings/README.md),
[testing guidance](../../development/testing.md),
[evidence retention](../../development/evidence-retention.md) and
[independent review](../../development/agentic-change-review.md).
Use [investigate-bug](../../../.agents/skills/investigate-bug/SKILL.md) during execution.

| Unit | Owning production paths and existing regression homes |
| --- | --- |
| U1 | `services/tts/benchmarks/{batch_result_cli,batch_result,batch_official,batch_execution,isolation,v14_authority}.py`; `services/tts/tests/test_benchmark_{batch_cli,batch_matrix,batch_official,batch_execution,isolation,v14_authority,v4_authority,v13_authority}.py`. Inspect candidate-adapter and other versioned consumers if a shared helper changes. |
| U2 | `apps/desktop/scripts/{ordinary-chatterbox-release-host,windows-release,native-startup-smoke,bilingual-portfolio-host}.mjs`; `scripts/build-windows-release.ps1`; owning `*.node-test.mjs`, native-smoke helpers and lifecycle companion as callers. |
| U3 | `packages/epub/src/navigation/{navigation-document,ncx-navigation-parser}.ts`, `document/xhtml-projector.ts`, `narration/narration-bilingual-normalizer.ts`; their tests, public opening and narration-preparation matrix; desktop package-reader/locator integration for direction. |
| U4 | `apps/desktop/src/tts/optional-chatterbox-client.ts`, `App.tsx`, optional controls and their tests; read native `tts_optional_chatterbox.rs` promotion/cleanup without assuming it needs modification. |
| U5 | `apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts`, `pcm-playback.ts`, `adaptive-buffer-scheduler.ts`; PCM/scheduler/coordinator tests and real worklet browser controls. |
| U6 | `apps/desktop/src/reader/ReaderPublication.tsx`, manual-gesture tracker, `active-visual-locator.ts`, coordinator; ReaderPublication tests, browser reader-narration cases and `scripts/reader-corrections-host.mjs`. |

For U3 read [M005](../completed/M005-narration-text-preparation.md),
[glossary](../../product/glossary.md), bilingual normalization v2, ADR-0012 and
ADR-0048. For U5 read the [buffer authority](../../architecture/adaptive-buffer-authority-v1.md)
and reader-settings playback v3. For U1 read
[ADR-0072](../../architecture/decisions/ADR-0072-versioned-batch-cancellation-proof-and-safety.md),
`benchmarks/tts/README.md` and v14/v4 profiles. For U2 read ADR-0050 and
[release security](../../development/release-security-and-distribution.md).
Do not edit authority documents merely to make a failing check pass.

## Architecture and constraints

Keep EPUB preparation independent of UI, inference and playback. Preserve stable
source IDs, half-open locator ranges, displayed text, cancellation checkpoints,
raw XML/UTF-8 budgets and bounded pending whitespace. Preserve the sole FIFO release
owner, finite little-endian PCM, one bounded active device copy, identity-first
invalidation, effective-duration admission, and the distinction between passive
inspection and narration navigation. Settings/install recovery never starts audio
automatically. Real books, generated audio and sensitive diagnostics never enter
fixtures or committed evidence.

Maintainer release work needs distinct functional outcome and process containment,
owned temporary roots, absent destinations before restoration, exact artifact
identity and atomic evidence publication. A positive scan cannot follow different
bytes by association. A build authority record must bind the inputs at the build
boundary, not just sample mutable files after bundling. Installed and loose build
executables remain separate identities.

Benchmark summaries must not replace unavailable proof with successful zeros.
Preserve real privacy detection while redacting its contents, explicit cleanup
outcomes, safety-stop ownership and no further work after a stop. Keep official
hardware execution separate from synthetic controller/validator checks. Record a
canonical-diagram assessment during implementation; update it only for an actual
boundary or flow change. Completed M005 does not certify TTS or synchronization.

## Milestones

### M0 — Freeze the execution baseline and gate selection — Not started

After separate execution authorization, recheck branch/HEAD/index and all task
inputs. Record any drift from this plan. Capture the exact affected source, test,
configuration, authority, dependency/tool and generated-input closure before tests.
Retrieve the historical receipts below; independently decide each reuse claim.
Prepare synthetic fixtures, bounded owned child processes and host prerequisites.
Keep one implementation writer; an independent `change_reviewer` stays read-only.
No full-suite baseline is required just to start: select original-trigger REDs and
the adjacent controls named below. Reserve real native/model runners serially.

### M1 — Reproduce and correct six bounded units — Not started

Run each new discriminating assertion on its unchanged production owner before
editing that owner. Combine related REDs in one runner invocation where practical.
An assertion that merely checks for a new API is insufficient. Preserve failures,
fixture corrections, actual versus injected ordering, and next-action observations.
If an earlier unit changes a later unit's inputs, explain the dependency before
claiming an original-baseline result. Apply only the causal correction described
below, then run its focused GREEN once. Do not rerun package-wide gates per finding.

| Unit / order | Minimal correction and required distinguishing evidence | Bounded controls and next action |
| --- | --- | --- |
| U1 — v14 derivation and admission | **0065:** prepare, validate and serialize in memory before deleting the owned session; verify absence before success output. **0069:** preserve replay failure and fail dependent viability/sustainability; reject contradictory direct summaries. **0073:** retain the privacy failure code across isolation/controller/derivation and reject a contradictory privacy audit. **0070:** reject CPU admission when the required stop cannot be causally proved; v14 aggregate fields alone are insufficient. | Real deriver read/authority failure retains both inputs and permits retry of that same session; successful cleanup precedes stdout; failed deletion cannot report retryable intact inputs. A complete otherwise-valid 12-pair replay with 15-second units/2-second generation rejects capacity overflow without yielding either PASS; valid zero-underrun control still works. A harmless measured-child canary yields redacted failure and verified cleanup through the real controller. Late-only memory sample plus unrelated batch-one failure, privacy failure, earlier phase, wrong call and unverified cleanup all reject before acquisition; no dispatch after an active stop. Preserve v4/v13 and intentional failed-row behavior. |
| U2 — ordinary release and evidence ownership | **0059:** consume the existing native cleanup IPC receipt and terminal child outcome before restoration. **0067:** identify a run-owned installer copy with canonical filename before backup, launch those bytes and retain ownership through containment. **0068:** bind build authority to the exact packaged pair from the build boundary; attachment uses or verifies that trusted baseline and rejects missing/drifted provenance atomically. **0072:** signature, scan, checksum and final JSON refer to one fixed artifact snapshot; reject replacement at every crossing into the Node writer. | Real harmless child controls cover positive, negative and missing cleanup receipts, verified no-start, assertion failure with proved containment, restoration/retry, and an unrelated process sentinel. Replace the public installer path, including swap-and-return around launch; receipt must name only executed bytes. Mutate manifests after bundling and before attachment, and replace artifacts between PowerShell observations and Node hashing: reject without overwriting prior evidence/sidecars. Preserve unsigned/no-scan and failed-signature behavior, installed-exe distinction, atomic publication and source-cache ownership. Use fixture roots, never live user data for faults. |
| U3 — EPUB boundary semantics | **0060:** bounded pending Unicode suffix that is discarded only at label close and charged if it becomes interior. **0061:** define the local horizontal article/time gap consistently for admitted prose spaces; retain bounded lookahead. **0064:** capture the nearest block's effective direction for a pending implicit paragraph and clear it at the existing flush. | EPUB2/EPUB3 public opening with literal/entity padding, 1,024/1,025 retained points, astral points, interior whitespace across events and retained alt/title UTF-8 controls. Public preparation checks one article, exact source ranges, cold/continued batches, earlier five spaces plus U+2002/U+2003, line/paragraph separators, code/other languages/compounds and seconds. Compare implicit versus explicit RTL through opening, computed DOM direction, caret position and save/reopen; retain nested/auto direction, one-word inline override, language, anchors and unchanged block/locator identity. |
| U4 — committed installation cancellation | **0058:** emit exactly one original-download completion only after paired cleanup settles successfully and a fresh Installed snapshot is accepted by the still-current Cancel owner. | Use the real client with controlled IPC and mounted App, both response orders, the same unavailable selected narrator and the next explicit Play. Assert no autoplay. Preserve early Cancel, cleanup failure, held passive poll, remount, and replaced book/profile/language/newer action. A late focus/visibility refresh must not hide the failure. Change native code only if reproduction establishes a native cause. |
| U5 — direct audio and automatic refill | **0062:** decode little-endian DataView samples directly into the device channel at 1x, validating before activation. **0066:** keep automatic refill admission provisional until its first device allocation; re-evaluate current effective lead after selection or worklet fallback. | Account for full auxiliary arrays and device stores at 480,000 frames, not only AudioBuffer count. Preserve offset/unaligned views, partial start, finite rejection, release-once, Pause/Stop and separate WSOLA. Deplete a prior real player run through backend end callbacks; 45 seconds at 0.75x becomes insufficient at 1x while preparation is held. Assert zero premature allocations, exactly one start at sufficient lead, unchanged underrun count, stale-worklet disposal, normal successors, explicit Resume/Play available and complete short tail. Include real-browser worklet settlement; no new DSP or model-quality benchmark. |
| U6 — host-conditional keyboard recovery | **0063:** first reproduce using actual trusted keys, article focus and measured scroll on installed WebView2. If supported, admit only the particular scrolling chords with the existing target/selection guards. | Start from settled unavailable placement with no prior gesture; require actual upward/edge displacement and verify the first prepared locator on next explicit Play. Check Shift+Space and supported Ctrl+Home/End independently. Preserve PageUp/PageDown, no-motion edge, programmatic movement, selection and control/editable focus. A synthetic measuredManual flag cannot prove this case. Retain negative host evidence if it does not reproduce. |

U1 and U2 are internally coupled and must converge before their final suite. U3
must stabilize before the final desktop/browser union consumes rebuilt exports.
U4/U5/U6 share desktop integration tests: combine their final selected cases after
all relevant writes stop. U6's pre-edit host reproduction can be prepared earlier;
do not rebuild once per keyboard variant. After each unit record the actual owner,
discriminating test, adjacent protection and evidence-backed escape reason (or unknown).

### M2 — Validate the final dependency groups once — Not started

Execute the selected gates below on frozen inputs. Reuse a just-completed GREEN as
the final gate when its entire consumed input set still matches and it covers the
required union. A later change invalidates only consuming gates, not every result.
Run the final browser/native scenarios after frontend export/build preparation;
combine compatible scenarios on one current build. Do not overlap native lifecycle,
audio, model, installer or hardware runs. No mandatory full GPU/Chatterbox download,
quality corpus, reader performance campaign or complete installer lifecycle matrix
is selected for these narrow corrections. Expand only for a demonstrated changed
boundary or unresolved failure, and record that reason before execution.

### M3 — Independent acceptance and findings closure — Not started

Prepare final documentation, finding assessments and the intended final plan
location/indexes before one integrated `change_reviewer` review of the exact patch.
Supply the closed path manifest, immutable RED/GREEN evidence, evidence-reuse
decisions, host commands/results and limitations. Pause writes during review.
Address actionable findings, rerun only invalidated gates, and obtain a new verdict
for changed identities. A plan review is not implementation approval.

Update every included VF ID with its real trigger, test, current snapshot, review
and scoped disposition. Preserve VF-0071 and any inconclusive U6 observation.
Move this plan to completed only when the declared implementation and acceptance
scope is satisfied; otherwise report precisely what remains. An explicit bounded
VF-0070 rejection does not certify a positive CPU fallback route. No Git delivery
is implied by completing these milestones.

## Testing and benchmark strategy

### Reviewed historical evidence and reuse decisions

The review inspected original assertions and retained results, not just completion
labels. Historical commands, scope and receipt hashes are centralized in
[DFM commands and reuse](../evidence/deep-findings-minimal-corrections/commands-and-reuse.md)
and [DFM results](../evidence/deep-findings-minimal-corrections/results.md).
Their exact-patch approval belongs to the old candidate and does not transfer here.

| Existing evidence | What can be recycled | What cannot be credited to the new corrections |
| --- | --- | --- |
| [ADD-01](../evidence/five-pass-audit/u8-case-add-01.md): four REDs, 415-test GREEN; [VF-0046](../evidence/deep-findings-minimal-corrections/results.md) mounted real-client recovery | Deferred IPC fixtures, both completion orders, cleanup/remount/stale-owner controls and installed snapshot setup. | These assertions stop before late-Cancel next Play or cover ordinary completion. New U4 reproduction and continuation evidence are mandatory. |
| DFM `g-js-closure-final-01`: 655 EPUB tests in 13 files | Existing public fixture builders, budgets, Unicode/source-range and anchor assertions. Reuse test definitions rather than duplicating the old matrices. | Changed navigation, normalization and projection invalidate affected results. U3 adds boundary-specific cases; its final focused union is fresh. |
| DFM `g-desktop-closure-final-03`: 819 tests; `g-browser-closure-final-01`: 16 cases | Existing integration, mounted App, unavailable-placement, real worklet and persistence fixtures. | App/client, player/scheduler, reader or EPUB-export changes invalidate their consuming cases. Old Chromium cannot establish the missing WebView2 gesture. |
| [U2/3.2](../evidence/five-pass-audit/u2-case-3.2.md): initial admission REDs and 453-test GREEN | Delayed-worklet, rate, explicit-override and tail assertions. | A pre-initial-start result does not cover automatic refill after underrun or fallback. Old PCM allocation tests do not count the second store. |
| [U11/2.3](../evidence/five-pass-audit/u11-case-2.3.md), [ADD-02](../evidence/five-pass-audit/u11-case-ADD-02.md), ADR-0072 | Synthetic isolated workers, causal phase/cancellation controls, early-stop fixtures and legacy-version controls. Retain failures and corrected fixtures exactly as recorded. | Existing cancellation/memory assertions do not prove replay validity, measured privacy propagation, retry-safe derivation or a required-call memory stop. All affected v14/producer/controller results need fresh U1 evidence. |
| DFM `g-py-final-03`: 58 quality/screen tests | Unchanged unrelated quality/screen results are candidates for narrowly justified reuse only if their full import/authority/tool closure matches. | This is not a batch/v14 test result and cannot close any U1 case. Do not rerun it merely to populate a plan table. |
| DFM `g-rust-green-01`: 80 pass/3 deliberately ignored per feature mode; `g-rust-static-closure-01` | Candidate reuse for unchanged native promotion/cleanup behavior and Rust static checks, after complete input/environment comparison. Native source need not change for U4. | Ignored tests are not passes; local admission is separate. Any change to native code, build-consumed resources, authority or toolchain invalidates the affected scope. No old native result proves new renderer behavior. |
| [Installer CI follow-up](../evidence/deep-findings-ci-follow-up/acceptance.md): 39 ordinary-host tests, zero skips on Windows | Real harmless installer/helper children, containment and no-spawn retry controls. | U2 changes this launcher and evidence path. Run its current Node tests, including Windows branches; old green does not prove the new IPC or copy boundary. |
| DFM Node receipts: 86 ordinary/release, 23 WebDriver, 76 native/portfolio | Unchanged WebDriver or independent helpers may qualify for scoped reuse; retain useful fixture implementations. | Shared native-smoke imports can invalidate portfolio consumers. U2 needs current ordinary/release results and the real PowerShell handoff, not only a mocked Node writer. |
| Prior native/model/package and performance receipts | Verified cached model/core assets, installed tool dependencies and build caches as inputs. | Runtime acceptance cannot be transferred to a different executable, frontend, package, host or artifact. Historical resource timings do not prove new logical allocation or keyboard behavior. |

Planning verification recovered seven original DFM receipts: the Rust behavioral
and static receipts, EPUB, desktop, Python quality/screen, ordinary/release Node,
and selected Chromium receipts named above. All seven receipt SHA-256 identities
match the published command record; all 28 referenced before/after, log and
environment files match their receipt digests. This verifies retained evidence
integrity, not its current applicability. A read-only comparison also found current
source differences in the ordinary release owner/tests, root `package.json` and
native `tts_service_supervisor/tests.rs`; older snapshots additionally differ in
player/coordinator inputs. Consequently, none of those broad captures is an
unchanged whole-checkout baseline. Declared absent Cargo configuration paths remain
absent, not missing evidence. Changes to capture helpers or Git configuration are
not automatically production dependency changes.

The comparison did not establish fresh consumed-set membership, command resolution
or host-state equivalence, so it does not approve even an apparently unchanged
leaf. The next execution should first omit genuinely unaffected gates, then decide
whether proving a necessary narrow reuse is cheaper than rerunning that check.
For example, the 58 quality/screen cases are outside U1's batch acceptance; their
old PASS is neither needed nor a substitute. Rust results are only useful if the
final implementation actually needs an unchanged native-behavior claim.

No historical behavioral result is pre-approved for final execution by this plan.
At M0, verify receipt/log integrity and original before/after equality, then compare
the complete consumed source/test/configuration/authority/fixture membership, generated
exports, dependencies, command options and relevant host/runtime identities. A
matching owner file, old aggregate PASS or refreshed manifest alone is insufficient.
If that proof is missing or more expensive than the focused check, rerun only that
check. Do not execute an old comparison script against its original output path or
reuse its cached environment description as a new host observation.

Record each final decision as **executed**, **reused with original receipt and
equivalence proof**, **not selected because unaffected**, or **pending/blocked**.
The reviewer must accept each claimed reuse. Unaffected checks can be out of scope
without inventing a historical PASS. There is no fixed test-count promise before
the actual patch/dependency closure is known.

### Minimum execution gates

All commands below are prospective, from the repository root in normal local
PowerShell outside the managed sandbox. Select pinned Node `.nvmrc` and offline
Corepack pnpm `11.15.1`; use the existing locked uv environment. Verify command
availability from configuration at execution. Do not install or upgrade tools just
to refresh provenance. Raw output belongs in ignored
`tmp/evidence/four-pass-findings-corrections/`; commit only concise safe summaries.

| Gate | Selected scope and timing | Expansion trigger |
| --- | --- | --- |
| G-RED/G-GREEN | New original-trigger cases and named controls per unit, using existing runners/fixtures. One RED and one GREEN for each distinguishing assertion; combine shared harness invocations. | New failure, fixture invalidity or changed prerequisite, with the original result retained. |
| G-PY | One final model-free union for U1: batch CLI/matrix/official/execution/isolation/v14 plus v4/v13 compatibility. Include candidate adapters or other consumers only if a shared import changes. | Any changed shared benchmark helper requires its actual downstream consumers; no automatic official model run. |
| G-NODE | One ordinary-host/windows-release union with real Windows synthetic PowerShell children and replacement seams. Include native-smoke/portfolio tests when their consumed helpers change. | Changed cleanup/driver helper requires its callers. A literal script assertion alone cannot accept VF-0072. |
| G-EPUB | One final union for navigation, NCX, public opening, projector and public narration matrix; selected normalizer/source/window/resource controls for the changed predicate/counter. | New parser/locator/range behavior requires the relevant ingestion/preparation consumers, not unrelated corpus expansion. |
| G-DESKTOP | One final union for real client/App, optional controls, PCM/scheduler/coordinator and reader/package/locator/persistence controls touched by U3-U6. | Changed state or persistence boundary adds its exact consumers. Avoid repeating the same App suite per VF ID. |
| G-BROWSER | One selected current Chromium run for the new public direction/save-reopen, real worklet/refill and keyboard paths plus bounded controls. | New renderer/layout/worklet changes need corresponding interaction assertions; Chromium cannot replace G-NATIVE for VF-0063. |
| G-NATIVE | One selected Piper ES native-startup route on a current build and installed WebView2, extended with actual U6 keys and direction/recovery continuation assertions. Preserve direct-runner timeout, cleanup failure, process ownership and fresh restoration evidence. Exclude the four-arm reader-corrections wrapper. | A native install/cleanup contract change needs focused native proof; model/adapter changes would require their own gate, outside the intended minimal patch. The existing scenario flag alone does not prove the new assertions. |
| G-RELEASE | Production PowerShell-to-Node handoff in disposable synthetic roots and run-owned children; one final unsigned package/build check if packaging inputs or build orchestration change. Use package:windows:verified-core after its current verification and relevant core-input comparison; regenerate only a missing/invalid core or changed consumed inputs. | If a new run-owned installer path changes real NSIS launch behavior, one bounded actual install/launch/uninstall/restoration journey is required. It is not the full optional-download or multi-choice matrix. Preserve any pre-existing installation; do not remove it without separate authorization. |
| G-STATIC | Final affected TypeScript format/lint/types and package exports; Python format/lint/types once; Rust only if changed or necessary reuse cannot be proved. Evidence/privacy and diff checks at final documentation/staging. | Lock, schema, generator, shared contract, tool or build-input changes invalidate the dependent checks and require the configured generation/build checks. |
| G-REVIEW | One integrated exact-patch correctness review after final gates and documents. Review corrective revisions only when required. | Missing evidence or identity drift blocks acceptance; no repeated review just to copy its verdict. |

These existing command forms define the runner boundaries; file selection is narrowed
to the final reviewed closure. Do not run both a full command and all of its unchanged
subcommands merely for a second green result.

```powershell
# G-PY (the listed union shares the U1 helpers)
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_batch_matrix.py services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_batch_execution.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_v14_authority.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_benchmark_v13_authority.py

# G-NODE; append actual shared-helper consumers when required
node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs

# G-EPUB; build exports once before dependent desktop/browser checks
pnpm.cmd run build:packages
pnpm.cmd --filter @voxleaf/epub exec vitest run src/navigation/navigation-document.test.ts src/navigation/ncx-navigation-parser.test.ts src/public/open-epub-publication.test.ts src/document/xhtml-projector.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source-window.test.ts src/narration/narration-resource-bounds.test.ts

# G-DESKTOP, one combined final invocation
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/OptionalChatterboxControls.test.tsx src/tts/pcm-playback.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/product-narration-coordinator.test.ts src/reader/ReaderPublication.test.tsx src/reader/active-visual-locator.test.ts src/integration/package-reader-matrix.test.tsx src/persistence/reader-position-save-coordinator.test.ts src/persistence/reader-position-restore-coordinator.test.ts

# G-BROWSER: the bounded owning files; use an exact case selector after test names exist
pnpm.cmd --filter @voxleaf/desktop exec playwright test tests/browser/reader-narration-bugfixes.smoke.spec.ts tests/browser/reader-reflow-restoration.smoke.spec.ts

# G-NATIVE: one existing selectable route, with task assertions added during implementation
pnpm.cmd --filter @voxleaf/desktop tauri build
node apps/desktop/scripts/bilingual-portfolio-host.mjs --preflight-only --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-reader-corrections --tts-profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --tts-language=es

# G-RELEASE, only at the risk-triggered boundary described above
pnpm.cmd package:windows:verified-core
pnpm.cmd package:windows:check

# G-STATIC: select these once for affected languages on the final source
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd typecheck:typescript
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd check:evidence
git diff --check
```

The native command selects exactly Piper ES, without the optional profile-switch
or six-rate matrix flags. Its current scenario must be extended with the actual
case assertions before it can accept this work. Capture the executable/frontend,
runtime, cleanup and restored state for both original reproduction and corrected
execution. A release build can replace the separate native build only if its
feature/runtime configuration and consumed artifacts are appropriate and identical;
never equate the default and release-locked binaries by name. Core regeneration
uses the existing package:windows route only when verification/input drift requires it.

`pnpm.cmd check` remains the repository's foundation command and CI obligations
remain unchanged. It is not a mandatory repeated local gate per unit. Use the
affected component gates above for this campaign; select an aggregate check only
when a demonstrated integration gap cannot be covered by the focused union.
If native Rust changes, run its applicable configured tests and both feature-mode
static gates. If it stays outside the acceptance scope, omit its unaffected gates;
if a native-behavior claim is needed, assess the specific evidence candidates above
or run the smallest current native check.
No Markdown-specific formatter/link validator is configured: inspect links and
document structure and run the configured evidence guard/diff checks for planning.

## Risks and rollback

- Overbroad whitespace or modifier admission can corrupt semantics or convert
  selection/passive movement into navigation. Keep narrowly defined predicates and
  the stated public/host negative controls.
- Refill guards applied to every successor can stall healthy playback. Restrict
  them to pending automatic admission and preserve explicit overrides and tails.
- The release fixes share snapshot ownership. Design U2 together; endpoint rehashes
  alone cannot prove the bytes executed or inspected. A missing trusted historical
  baseline must reject attachment rather than be reconstructed from today's files.
- Derivation must not promise retry after partial deletion or successful output
  before removal. Stdout failure after verified deletion is a separate existing
  contract limit; moving deletion after publication is not this fix.
- Shared benchmark modules serve frozen versions. Scope new conclusion/privacy and
  cleanup behavior to v14; keep legacy tests and authority identities. Fail-closed
  CPU admission intentionally leaves positive successor support deferred.
- Host preparation or runtime failures may expose real blockers. Keep failed
  receipts, preserve owned backups, stop the affected action, and continue independent
  work. Never infer a safe restore from uninstall success alone.

Use small task-owned patches and preserve the prior source snapshot. Roll back only
the current unit's owned changes if necessary, retaining failed evidence and other
work. Never reset/clean/stash unrelated files, rewrite completed reports, regenerate
frozen authorities, alter admission thresholds, or suppress failures to close the plan.

## Progress log

- 2026-11-15: prepared this plan from the completed four-pass audit and deep
  validation; read prior correction receipts and current test assertions/configuration.
  Created `codex/four-pass-findings-corrections-plan` from the source baseline.
- Planning review and documentary validation are recorded by the reserved
  [plan review](../evidence/four-pass-findings-corrections/plan-review-r02.md) and
  [planning closeout](../evidence/four-pass-findings-corrections/plan-closeout.md).
  These records assess the plan, not its future implementation.
- Planning [R01](../evidence/four-pass-findings-corrections/plan-review-r01.md)
  requested three bounded documentary corrections: select one existing native
  profile route, verify/reuse unchanged Piper core inputs, and align the registry
  summary. This candidate includes those changes; the immutable R01 is retained.
- M0-M3 and U1-U6: **Not started**. No product code, regression tests, installer,
  browser, model or benchmark execution belongs to this planning task.

## Discoveries and decisions

1. The earlier turn produced audit documents, not an ExecPlan for VF-0058-VF-0073.
   Older similarly named plans concern different cases and remain historical.
2. Existing tests often protect the correct neighboring invariant but stop before
   the new failure. Recycle fixtures and controls; add the missing discriminating
   assertion/continuation instead of creating parallel test frameworks.
3. Minimize executions by dependency group, not by dropping acceptance. Reuse
   unchanged GREEN gates and assets when eligible, avoid full-suite baselines and
   repeated hardware campaigns, and invalidate only actual consumers after edits.
4. VF-0071 stays excluded. VF-0063 requires real host proof. VF-0070 has a bounded
   fail-closed correction; a successful successor benchmark is a separate project.
5. Source inspection, receipt inspection, test execution, evidence reuse and reviewer
   approval are different evidence levels and will remain separately attributed.

## Final validation results

**Implementation: not executed.** No original-trigger RED/GREEN, new behavioral
PASS, runtime acceptance or finding closure is claimed by this plan. Historical
counts above describe their original receipts only.

The reserved planning review/closeout above own the exact document identities,
document checks and planning verdict. At implementation closeout, replace this
pending statement with links per unit to the actual owner/test, original failure,
executed or independently justified reused gates, remaining limits and the authentic
implementation review ID. Keep inconclusive/excluded/deferred cases explicit.
