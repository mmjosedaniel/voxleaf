# Reconciliation of the five logic audits

## Scope and snapshot

- 2026-11-16, `main` at `079c38ece8687b24859db4f64d4f92bba67bdcee`. One independent source and history review per case from VF-0074 through VF-0091. The [registry](../registry.md) and [partial historical import](../history-import.md) guided original-source lookup.
- This covers the [first](2026-11-16-repository-logic-audit.md), [second](2026-11-16-repository-logic-audit-pass-2.md), [third](2026-11-16-repository-logic-audit-pass-3.md), [fourth](2026-11-16-repository-logic-audit-pass-4.md) and [fifth](2026-11-16-repository-logic-audit-pass-5.md) reports. The Git index was empty. Dirty inputs were the registry and index plus the five reports.
- Intake Git blobs were `61ef175516154507d442cd5f04363935cd8a67a9` for `registry.md`, `72ac3153dc13f35a3d001379bd816524d3eb3da2` for `audits/README.md` and `a465eb91b2e9342f8128be58e0334dce88bf0cf2`, `271755f17909ae5f0fc1bf086affed3a6032d9fc`, `3baa39f15d6eddefe189efeeaf514d779fb61987`, `56f8f5fdd91a446d9c14427da4c9594196ae23f1` and `1328a58a4ac34bf99b30a6d2228791af2c884606` for the prior reports in pass order.

## Findings across the passes

- Related ExecPlans often cover the same invariant at a nearby call site or event order. The strongest direct lineage is U3/5.1 versus VF-0074, B06/B07 versus VF-0076 and VF-0080, H13 versus VF-0085, and LCF-03 versus VF-0087. Their existing guards still matter to any correction.
- VF-0076 is a timing regression traceable to the native change that exposed Installed during cleanup. VF-0085's journal dependency dates to the earlier recovery correction itself. Other source origins below are stated only where history identified them.
- VF-0082 is conditional on overlap outside the supported sequential workflow. VF-0089 through VF-0091 affect retained v5 tooling. The historical v5 concurrent arm stopped at its safety gate without an accepted result.

## Coverage

| Responsibility | Source boundary and prior evidence reviewed | Remaining scope |
| --- | --- | --- |
| Reader placement and direction | Real reader save admission, browser event provenance, XHTML projection, DOM direction and caret probe. Compared U3, RPI-01, M003/M004 and VF-0064. | Browser delivery of the changed passive sample and placement effect of nested Auto remain unobserved. |
| Narration normalization | Both public profile paths, raw lexical match, title checkpoint and source spans. Compared space, ordinal, warm/cold and omitted-mark fixes. | Complete mark and window cases and engine pronunciation need separate checks. |
| Chatterbox and Windows release | Native post-commit state and terminal acknowledgement, Settings/client, full and bounded probes, lifecycle journal, compiled-hook fixture and config admission. Reconciled B06/B07, U8, receipt, uninstall and diagnostic evidence. | Current host timing, filesystem error delivery and exact-package behavior remain unobserved. |
| Maintainer benchmark tooling | v14 preflight and derivation, retained v6 quality and CustomVoice setup, v5 admission, cold ownership and cancellation receipt. Compared earlier workflow, containment and frozen authorities. | No live workloads, measured memory, power change or new historical-result validation. Non-repository history was outside the evidence search. |

## Case reviews

### VF-0074 — Passive position after Stop

P2, `inspected-present` for the save predicate given a distinct unmarked canonical sample. Unmarked delivery after an ordinary Stop remains unobserved.

Five-pass U3/5.1 fixed canceled automatic follow followed by an event at unchanged geometry. RPI-01 protected restoration and preference reflow. VF-0028 and VF-0035 preserved the visible location for the next Play and the distinct heard position. The current save owner can still replace the exact heard checkpoint when a different passive sample reaches it after Stop. [U3 review](../../../plans/evidence/five-pass-audit/review-U3-5.1-R1.md#L15), [RPI-01](../../../plans/completed/reader-position-and-image-lifecycle.md#L136), [current save admission](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L225).

Applying the rule to all passive observations would block ordinary reading saves. Freezing visual tracking would break visible position and the next Play. An unheard start should preserve any checkpoint already protected by earlier narration.

At passive save admission, require a validated measured-manual signal only while the heard checkpoint is protected. Preserve explicit navigation, lifecycle flush and visual tracking. First witness a distinct unmarked canonical sample after real audible start and Stop, then prove exact reopen and later save after a measured gesture. Include new sessions with no heard audio and natural completion. [Heard authority](../../../architecture/synchronization-authority-v1.md#L140), [tracker guard](../../../../apps/desktop/src/reader/active-visual-locator.ts#L605).

### VF-0075 — Explicit nested Auto direction

P3, `inspected-present` for the dropped DOM declaration and resulting direction. A changed saved offset remains unverified.

M003/M004 retained effective direction and VF-0064 U3 corrected nearest block direction for synthesized paragraphs. U3 named nested Auto as adjacent coverage. Its preserved cases use fixed LTR/RTL, and the renderer fixture uses Auto under RTL. The equal-direction elision dates to M004 (`91108d15860600974e2b1ce1eb380bbbe87a5021`). [U3 scope](../../../plans/completed/four-pass-findings-corrections.md#L174), [Chromium case](../../../../apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts#L13), [renderer](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L100).

Adding `dir="auto"` to all inherited Auto paragraphs or inline leaves changes the browser's first-strong search and can change both chapter direction and caret geometry.

Carry explicit local Auto provenance to the retained paragraph and emit `dir="auto"` there. Leave inherited values, locators and narration context independent. Open public EPUB fixtures with explicit and inherited sibling paragraphs in both directions. Assert DOM declarations, computed direction and measured caret side, then exercise canonical offsets and reopen if placement changes. [Projector](../../../../packages/epub/src/document/xhtml-projector.ts#L334), [caret sampling](../../../../apps/desktop/src/reader/active-visual-locator.ts#L661), [HTML directionality](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute).

### VF-0076 — Provisional Installed in the ordinary journey

P2, `inspected-present` in both retry and reinstall. A false installed-host receipt remains unobserved.

The runner in `ddd3cbc` polled the snapshot while native state stayed Verifying through cleanup. `d9b2ea051d1caa5041bec5cce912bb535ae9e5af` introduced provisional Installed while the worker still owns cleanup. B06/B07 addressed commit versus cancellation and cleanup failure after acknowledged cancellation. VF-0058 joined terminal Download for renderer availability. VF-0059 joined smoke containment and restoration. The runner still drops the successful-attempt Download result. [B06/B07](../../../plans/completed/reader-narration-acquisition-bugfixes.md#L353), [VF-0058/VF-0059 evidence](../../../plans/evidence/four-pass-findings-corrections/execution-ledger.md#L156), [runner](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1407), [native ordering](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591).

A long awaited WebDriver call would time out before allowed slow acquisitions. Treating early Installed or late Cancel as terminal would keep the gap. A late failure must still allow owned teardown and restoration.

Track the attempt's bounded terminal result through short polls. Require successful Download acknowledgement, fresh Installed and strictly verified staging absence for both stages. Keep concurrent cancellation and deadline behavior. Hold promotion after Installed and exercise successful, failed and expired settlement before any downstream stage or receipt. [Bounded polling precedent](../../../../apps/desktop/scripts/optional-download-probe.mjs#L22).

### VF-0077 — Sleep-setting cleanup in v14

P3, `inspected-present` for a cleanup audit with no observation of restoration.

The v4 runner introduced the unconditional restoration value on main in `32e18fb7` and v14 inherited it. M006 measured/recorded manual host restoration separately where stated. U11 changed cancellation and monitored execution. VF-0065 and VF-0073 secure raw cleanup and privacy evidence. The documented v14 input attests to sleep disabled before the run, and the result treats a literal `true` as restoration of the prior setting. [Run entry](../../../../benchmarks/tts/README.md#L539), [literal](../../../../services/tts/benchmarks/batch_official.py#L1188), [summary gate](../../../../services/tts/benchmarks/batch_result.py#L363), [historical operator record](../../../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md#L1159).

Automatic power-setting edits would change host ownership. A post-run check alone loses the original value or can check a different scheme. Changing frozen schemas or historical artifacts would invalidate attributed comparisons.

Keep settings operator-managed. In a prospective proof path capture the affected scheme and original AC timeout before any temporary change, then require a matching post-restore readback before crediting cleanup. Treat missing and mismatched evidence as incomplete or failed. Check matching, still-disabled and different-scheme results with the same otherwise qualifying execution, and preserve raw cleanup and privacy gates. [Frozen restoration rule](../../../../benchmarks/tts/profile-v4.json#L245).

### VF-0078 — Formatting mark in the Spanish article/time gap

P3, `inspected-present` at prepared text for both Piper and Chatterbox.

SAF-12 and VF-0009, VF-0039 and VF-0061 progressively covered ordinary, no-break, thin/figure and horizontal `Zs` spacing. BNC-02 handled removable marks in lookaround and VF-0052 handled progress through silent runs. The combined article matcher still stops at the mark within the gap, while the later bare-time matcher sees the real space and supplies a second article. [Earlier check](../../../plans/completed/four-pass-findings-corrections.md#L174), [mark lookaround](../../../plans/completed/narration-boundary-navigation-corrections.md#L171), [combined matcher](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1004).

Global stripping or allowing a mark to stand in for a space changes source positions and lexical boundaries. Widening recognition alone can assign generated characters to an omitted position or leave a packer split inside the match.

Confine transparency to already-omitted marks inside the bounded same-language prose gap, which must contain a real horizontal separator. Keep typed silent source slots protected by the same expansion identity. Compare both public profiles, mark-only and mixed-language/code controls, raw code-point ranges, packing cuts, warm continuation and cold interior seek. [Expansion planner](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1122), [packer](../../../../packages/epub/src/narration/narration-segment-packer.ts#L536).

### VF-0079 — Object key order in the NSIS configuration

P3, `inspected-present` at the fresh build/check entry.

The comparison entered main in `b7f75fe4f9ec59ac5e949cb6986d07755a828834`. VF-0015 corrected record comparison in ordinary receipts. Five-pass 4.4 characterized the already order-independent lifecycle validator. NSIS language follow-up addressed hook declarations. The current build entry still compares serialized language-map keys in order. [Prior receipt check](../../../plans/evidence/five-pass-audit/u12-case-4.4.md#L1), [config gate](../../../../apps/desktop/scripts/windows-release.mjs#L320), [build caller](../../../../scripts/build-windows-release.ps1#L203).

Making the separate fallback language array unordered would change selection. Canonicalizing the raw config digest would weaken evidence attachment to already-built artifacts.

Use the existing exact-record comparator for `customLanguageFiles`. Retain literal key/value checks, the separate ordered array and raw-byte attachment digest. Accept reversed map order on fresh preflight, reject missing or changed entries and malformed maps, reject a reordered language array, and preserve refusal to attach evidence with a different recorded digest. [Record comparator](../../../../apps/desktop/scripts/windows-release.mjs#L463), [bundle authority](../../../../apps/desktop/scripts/windows-release.mjs#L774).

### VF-0080 — Settings during post-commit Chatterbox cleanup

P2, `inspected-present` for an owned Download after remount and eligible packaged selection. No deletion or autoplay effect established.

B06/B07 and U8 deliberately preserve native Installed after commit while cleanup owns the worker. RCF-13 protects explicit cleanup recovery, and VF-0058 handles paired late-Cancel completion and next Play. Existing remount cases cover preflight and pending Cancel. In the ordinary post-commit window the remounted buttons and compatible Chatterbox radio miss persistent Download ownership. Busy Remove rejects before Stop and gives misleading guidance. Eligible activation can use cached Installed and stop or change the current selection. [U8](../../../plans/completed/five-pass-audit-revalidation-and-corrections.md#L337), [controls](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L480), [shared selection](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L98).

Moving native Installed later changes the existing Cancel/commit contract. Removing cached Select or replaying deferred Activate can lose paired completion or use stale intent. Blocking all Settings overreaches.

Gate the two buttons, Chatterbox radio and shared packaged activation on current client ownership. Recheck after selection awaits and before Stop or preference write. Preserve healthy no-ops, Cancel and explicit cleanup recovery. Hold an ordinary Download after Installed, remount with an eligible Piper session, and assert no Stop or write on either activation route. Exercise the next explicit action after success and after cleanup failure. [Cached select](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L277), [profile radio](../../../../apps/desktop/src/tts/HardwareCompatibilityControls.tsx#L246).

### VF-0081 — Absence verification after ordinary Cancel

P3, `inspected-present` for a non-ENOENT lookup error. A false final receipt additionally depends on successful retry and later gates.

The marker-only catch was present in the initial runner in `ddd3cbc3b4f337f04ebb9dbdbb17f74ad42a5898`. The ordinary installed evidence covered nominal cancellation. B06/B07 and the bounded probe use strict absence checks in separate paths. VF-0059 protects process containment and restoration. Ordinary retry can clear the old staging after a transient error and mask the missed observation. [Ordinary lookup](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1320), [native retry cleanup](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2266), [prior containment](../../../plans/evidence/four-pass-findings-corrections/execution-ledger.md#L159).

Broadening deletion or weakening finalization could lose the original data backup. Testing only the receipt shape or an obstruction that persists into retry would miss the false intermediate admission.

Call the existing `assertAbsent` at the full journey's cancellation checkpoint. Verify that only genuine absence advances, while retained entries, dangling leaf links and access or I/O errors stop before retry. Check fresh receipt suppression, successful owned restore and backup retention on uncertain teardown. [Strict helper](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L679), [receipt consumer](../../../../apps/desktop/scripts/windows-release.mjs#L571).

### VF-0082 — Overlapping v6 evaluator corrections

P3, `inspected-present` for the stated cross-process overlap. Sequential correction is the supported workflow.

M010 introduced absent-check followed by replacing publication (`f3163ca`). CFR-14/VF-0014 moved aggregate invalidation before publication and added derivation freshness for sequential ownership. CFR U7 explicitly reserved concurrency. Two callers that both pass the initial absence check can still report success while one replaces the other. [M010](../../../plans/completed/M010-hardware-profiles-fallback-and-operational-resilience.md#L1211), [CFR sequential contract](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L260), [current correction](../../../../services/tts/benchmarks/quality.py#L564).

Writing exclusively at the final path can publish partial JSON. A no-replace commit alone can let the losing caller remove an aggregate rebuilt after the winner. Freshness validates the evidence that survives and cannot recover a replaced correction.

Keep the sequential workflow. If overlap needs to be tolerated, admit one writer before the final existence check and aggregate invalidation, then publish a fully staged record without replacement. A mixed correction/aggregation workflow would also need coordinated ownership of the shared aggregate. In a disposable two-process test, let the winner publish and rebuild the aggregate before the loser resumes. Require one success, preserved winning bytes and aggregate, and sequential retry after failed invalidation. [Writer](../../../../services/tts/benchmarks/quality.py#L83), [sequential control](../../../../services/tts/tests/test_benchmark_quality.py#L522).

### VF-0083 — Unbounded parent capture in quality generation

P3, `inspected-present` for unusually noisy child output. Actual parent memory use in ordinary runs remains unmeasured.

Five-pass U9/1.5 bounded stdout and discarded stderr in the measurement launcher. Quality's `capture_output=True` dates to `9d35899e` and still accumulates both pipes before the 16 KiB stdout check. Inner `DiagnosticCapture` covers Python adapter streams during its own scope. The quality parent already rejects nonzero exits. [U9 proof](../../../plans/evidence/five-pass-audit/u9-case-1.5.md#L6), [quality command](../../../../services/tts/benchmarks/quality_cli.py#L118), [adapter capture](../../../../services/tts/benchmarks/quality.py#L279).

Waiting before draining the pipe, cutting off the reader and then waiting, or copying a different timeout can stall valid runs. Forced termination can bypass disposable-session cleanup.

Discard stderr and cap binary stdout during reading, with one overflow byte and the existing quality deadline across input, output and exit. Keep fixed errors, bounded owned reaping, nonzero rejection and explicit session cleanup. Check exact-cap success, excess stdout and noisy stderr, stalled child, malformed payload and valid-looking output from a failing child. [Measurement lifecycle reference](../../../../services/tts/benchmarks/cli.py#L459).

### VF-0084 — Formatting mark in the English title predecessor

P3, `inspected-present` at prepared text. Pronunciation and natural incidence were outside the assessment.

VAF H6 and ADR-0067 preserve plain ambiguous `Baker St.`. RAC-09 covers attached ordinal prefixes and SAF-10 covers warm/cold plain predecessor reconstruction. BNC-02 makes approved marks transparent for raw-form lexical adjacency. The distinct title context summary still clears the preceding capitalized word on the omitted mark. [ADR-0067](../../../architecture/decisions/ADR-0067-conservative-english-titles-and-unicode-marks.md#L8), [RAC-09](../../../plans/completed/revalidated-audit-corrections.md#L186), [title context](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1253).

Unbounded skipping or global normalization can erase code/language/punctuation barriers, allow numeric street prefixes, lose the abbreviation period or make a resumed preparation disagree with a cold start.

Make only already-omitted marks transparent to the shared English prose predecessor summary. Charge their raw positions against the existing bound and preserve typed omissions and title protections. Compare marked and plain prepared text, exact ranges, legitimate titles, numeric prefixes and code/language barriers in both profiles. Force a warm/cold cut at the mark and check limit boundaries. [Checkpoint accounting](../../../../packages/epub/src/narration/narration-preparation.ts#L600), [public controls](../../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L1388).

### VF-0085 — Journal read blocks owned uninstall

P2, `inspected-present` if the original installer becomes unreadable after successful test install.

H13 commit `ab6a609326d4169990207496d1693608e05b285f` introduced recovery journaling and the retry guard along with owned uninstall before restore. U15 bounded descendant cleanup. VF-0056/#316 covers proven no-spawn in the Node runner. DCR-05 checks installer drift at receipt time, with readable drift in the fixture. In the PowerShell route, rereading the installer while journaling can throw after the attempted flag and before launching the installed uninstaller. [H13](../../../plans/completed/validated-audit-follow-up.md#L258), [journal](../../../../scripts/test-windows-package-lifecycle.ps1#L134), [uninstall](../../../../scripts/test-windows-package-lifecycle.ps1#L191), [drift control](../../../../apps/desktop/scripts/windows-release.node-test.mjs#L496).

Dropping the journal or final identity comparison could lose recovery provenance or allow a mismatched receipt. Blind retry or restoration could affect a still-owned process or test installation.

Populate journal identity from the captured entry hash and keep final identity reread for accepting the receipt. Preserve prelaunch journaling and containment and absence guards before restoration. Use a disposable fixture with an unreadable source after install, require owned uninstall and restored marker, and retain terminal failure and no passing receipt. Keep readable drift and failed-containment controls. [Entry identity](../../../../scripts/test-windows-package-lifecycle.ps1#L58), [finalizer](../../../../scripts/test-windows-package-lifecycle.ps1#L391), [receipt gate](../../../../scripts/test-windows-package-lifecycle.ps1#L433).

### VF-0086 — CustomVoice session stranded by staging creation

P3, `inspected-present` in v2 and v3 when staging creation fails after exclusive session creation.

The staging order dates to the module introduction `de2c2dcf856e4eb44de5cf249a4a7d8c256b19b6`. VF-0021 covers v12 temporary publication. VF-0042 cleans an empty output directory after a later quality finalization failure. CustomVoice U9 covers version isolation and scoring. The current staging creation is still before rollback. Explicit same-version cleanup can remove the surviving session. [U9](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L299), [session creation](../../../../services/tts/benchmarks/customvoice_screen.py#L466), [explicit cleanup](../../../../services/tts/benchmarks/customvoice_screen.py#L749).

Putting rejected admissions in a broad recursive rollback can delete an existing, competing or redirected session. Treating a coincidentally empty session as owned would bypass the exclusive creation proof.

After exclusive session creation, handle staging creation failure with empty-only rollback of that new directory. Preserve the original failure and the explicit recovery path if rollback itself fails. Fault only staging creation, then complete the same ID after clearing the fault in both versions. Preserve prior, competing, redirected and cross-version entries and existing generation cleanup. [Path ownership](../../../../services/tts/benchmarks/customvoice_screen.py#L114), [fixture](../../../../services/tts/tests/test_customvoice_screen.py#L72).

### VF-0087 — Unsafe ancestry in optional uninstall reporting

P3, `inspected-present` when removal is requested and redirected descendant probes report missing. No observed Windows run or retained bytes.

LCF-03 generalized retained-data reporting to all listed optional roots. Compiled controls cover a junction at an exact leaf and an ancestor with error 5. H9 protects preference ancestry. Current optional cleanup skips an unsafe intermediate, then checks descendants directly. Error 2 or 3 can leave the aggregate clear. This reaches explicit cleanup modes. The ordinary interactive page is skipped if all initial probes miss. [LCF-03 requirement](../../../plans/completed/lifecycle-correctness-follow-up.md#L74), [leaf fixture](../../../../apps/desktop/scripts/windows-release.node-test.mjs#L1000), [aggregate](../../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L400).

Recursion through a redirected ancestor or deleting the ancestor expands the owned roots. Stopping on one branch can prevent safe sibling cleanup or the independent preference choice.

Check each branch's literal ancestors in order before accepting a leaf result. An ordinary missing ancestor proves absence. An unsafe or uninspectable existing ancestor contributes to incomplete status while safe siblings continue. Extend the compiled fixture to distinguish an absent ordinary intermediate from an unsafe intermediate returning missing descendant results. Assert the status, retained unsafe tree, safe sibling deletion and independent preferences. [Preference precedent](../../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L229), [denied-ancestor control](../../../../apps/desktop/scripts/windows-release.node-test.mjs#L1073).

### VF-0088 — The bounded download probe credits a different fault

P3, `inspected-present` for an unrelated failed first transfer after barrier placement plus a successful second phase.

The capture predicate entered main in `d9b2ea051d1caa5041bec5cce912bb535ae9e5af`. The completed diagnostic plan records a genuine HTTP 200 followed by `create-file`/`io` and an OS error. That historical observation meets its claim. The current predicate accepts a non-null response-stage failure after barrier creation, then uses equality of that diagnostic for export and cancellation retention. VF-0076 and VF-0081 concern full-journey steps. [Original exact-host evidence](../../../plans/completed/optional-download-diagnostics.md#L144), [capture gate](../../../../apps/desktop/scripts/optional-download-probe.mjs#L108), [native order](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1757).

Requiring a particular Windows error number would reject other genuine local I/O failures. Globally narrowing diagnostic export would hide other valid errors.

At this probe step, require first GitHub runtime part, `create-file`/`io` and present integer `osError`. Keep the general export decoder. Compare the intended barrier diagnostic with response failure, wrong artifact and missing OS cause. Keep export equality, read-only restart, cancellation and strict staging absence controls. [Diagnostic fields](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/download_diagnostic.rs#L35), [bounded cleanup](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1261).

### VF-0089 — GPU-solo qualification before v5 concurrency

P3, `inspected-present` at the retained command gate, given otherwise eligible inputs. The historical GPU baseline qualified.

M006-002 required a valid GPU baseline and enforced progression manually. Its committed baseline recorded 446.24 media seconds and two passed trials. The historical concurrent arm stopped at `resource-limit` before a result. VF-0070 concerns v14 CPU stop attribution. The current GPU derivation can truthfully publish a failed trial or insufficient duration, while official and diagnostic admission verify identity and digest but only apply a prior conclusion check to CPU solo. [Historical results](../../../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md#L1694), [frozen baseline gates](../../../../benchmarks/tts/profile-v5.json#L351), [current admission](../../../../services/tts/benchmarks/dual_worker_cli.py#L118).

Rejecting failed summaries at serialization loses legitimate failure evidence. Importing base schema tooling in the candidate environment changes its frozen dependencies. Claiming facts absent from the summary would recreate an evidence gap.

If v5 is revisited, qualify the bytes already verified by digest before either concurrent purpose creates workers. Check only represented gates with frozen thresholds and preserve derivation of failures. Compare genuinely derived insufficient-duration and failed-trial baselines with a qualifying one, all with matching digests. Check no worker creation, wrong-digest and CPU controls. A stronger cross-stage or host identity proof requires a separate authority decision. [Candidate isolation](../../../../services/tts/tests/test_benchmark_v5_authority.py#L511), [summary derivation](../../../../services/tts/benchmarks/dual_worker_result.py#L406).

### VF-0090 — Solo cold runtime without explicit close

P3, `inspected-present` for missing explicit close. No surviving process or destructor error was observed.

The solo branch in `dbd4bb09b62ed648fd74dde513975f03d85b562b` assigns the finalizer variable after load and placement observation. EFC-02 covers runtime closure after invocation, CCF-C10 covers cancellation ownership, and U10 covers memory-sampler shutdown. A counter or placement failure after successful load bypasses close in both early and final slots, leaving best-effort destructor termination. [Cold loop](../../../../services/tts/benchmarks/dual_worker_cli.py#L455), [finalizer](../../../../services/tts/benchmarks/dual_worker_cli.py#L682), [close fixture](../../../../services/tts/tests/test_benchmark_dual_worker_runtime.py#L532), [destructor](../../../../services/tts/benchmarks/isolation.py#L892).

Closing every slot early would discard the correctly loaded runtime used for warm-up. Treating failed close as successful could admit another worker. Overwriting the original observation failure with an unstructured cleanup error loses useful evidence.

Assign the solo runtime to the existing finalizer before load observation. Clear ownership only after successful early-slot close and retain the third runtime for warm-up. Force observation failure in early and final slots, require explicit close before returning and no successor or raw publication. Check combined observation/cleanup failure and the successful three-slot ordering. [Load observation](../../../../services/tts/benchmarks/dual_worker_cli.py#L218).

### VF-0091 — Official v5 queued cancellation trial duplicates another case

P3, `inspected-present` as an evidence gap. The frozen authority names distinct trials and leaves the precise queue layer open.

The duplicate setup entered the official runner in `dbd4bb09b62ed648fd74dde513975f03d85b562b`. EFC-02 really held a pending runtime future and verified no adapter entry. Separate replay tests cover stale buffered PCM. U11 required witnessed v13/v14 batch cancellation. v5 passes both configured inputs to the two roles before invalidating at the first completed result. The two named scenarios take the same hook, and the receipt uses timings and fixed stale counts. The historic concurrent run stopped before raw result publication. [Trial order](../../../../benchmarks/tts/profile-v5.json#L279), [trial hook](../../../../services/tts/benchmarks/dual_worker_cli.py#L324), [pending-future fixture](../../../../services/tts/tests/test_benchmark_dual_worker_runtime.py#L508), [historical stop](../../../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md#L1702).

Treating identical hooks or hardcoded stale zeros as distinct evidence overstates coverage. Changing scheduler or replay behavior just to make the scenario pass can move the race being measured.

If this evidence path is revived, witness a distinct still-unclaimed occurrence and prove the same occurrence would dispatch without invalidation. After invalidation, assert no adapter entry or release for it. Separately witness completed-but-unpublished work and keep teardown bounds. Any new serialized proof belongs to a successor authority with the frozen history preserved. [Controller exit](../../../../services/tts/benchmarks/dual_worker_controller.py#L293), [timing predicate](../../../../services/tts/benchmarks/dual_worker_cli.py#L352).

## Closeout

All 18 candidates retain source support for the specified conditions. Four have P2 impact and fourteen have P3 impact. The review found no further occurrence of a prior fixed trigger in its original form. VF-0082 remains a conditional concurrency case outside the supported workflow. Evidence is static, and historical execution stays attributed to its original scope.

The registry has one dated assessment per case. At closeout, HEAD, source, the empty Git index and all five earlier reports matched intake. No tests, builds, benchmarks, installed journeys or model runs were performed. The correction and regression checks above are prospective.

