# Deep validation of the five logic audits

## Scope and snapshot

- 2026-11-16, `main` at `079c38ece8687b24859db4f64d4f92bba67bdcee`.
- Read all six completed parent turns (five searches and reconciliation), the 18 individual subagent reports, the [five indexed audits](README.md), [reconciliation](2026-11-16-findings-reconciliation.md), [registry](../registry.md) and [partial history import](../history-import.md). The current review independently traced the owning source and neighboring paths. Prior reports are evidence to question, not acceptance.
- Static review only. No tests, builds, application execution, benchmarks, model runs, filesystem fault injection or Git mutations. Product/source files and earlier reports remain unchanged.
- At intake the Git index was empty. Only audit documents were dirty. Intake Git blobs: registry `2d45fde0dc05ec896b579089926b965e983f7848`, index `8420a166440ad0f60e4f336009c84db3aa87925e`, reconciliation `79381f39235ab93e3d6fad5dda02c0b7cc9ce5b1`. The first through fifth report identities were `a465eb91b2e9342f8128be58e0334dce88bf0cf2`, `271755f17909ae5f0fc1bf086affed3a6032d9fc`, `3baa39f15d6eddefe189efeeaf514d779fb61987`, `56f8f5fdd91a446d9c14427da4c9594196ae23f1` and `1328a58a4ac34bf99b30a6d2228791af2c884606`.
- These are inspections of current supported reader/narration/installer paths and current source of maintainer tools. Retained v2/v3/v5/v6 benchmark paths are not product support claims. A currently dirty checkout would fail official benchmark preflight; conditional command findings concern otherwise eligible clean execution with these source bytes.

## Assessment changes

Sixteen of the 18 original IDs have a statically supported failure or evidence gap at the stated boundary. VF-0074 remains a candidate but the end-to-end product proposition is now `inspected-inconclusive`. VF-0082 becomes `not-confirmed` / `inspected-absent` **as a defect of the supported sequential workflow**. Its conditional two-process overwrite remains a correct source observation.

VF-0080 is narrowed to a P3 busy-Remove presentation defect. Its earlier P2 activation claim is unconfirmed: native commit already establishes a verified package, and explicit activation during cleanup is not shown to violate a current product rule.

One new P3 candidate, VF-0092, has source support for English title expansion across inline-code whitespace. The 17 supported IDs comprise two P2 and fifteen P3 cases, including tooling and evidence defects. No case is newly `reproduced` or `validated`. The earlier wording “18 bugs” was broader than the demonstrated product scope.

## Coverage

| Boundary | Source and sequence examined | Coverage and limits |
| --- | --- | --- |
| Heard, visual and saved position | Persistence bridge, save coordinator, App receiver, tracker sampling/protected geometry and existing checkpoint tests. Stop, passive admission, reflow, manual movement and flush. | Inspected owner predicates; actual changed unmarked post-Stop delivery remains unresolved. No browser or reopened position observed. |
| EPUB direction | XHTML effective-context projection, explicit and implicit paragraphs, shared DOM attribute selection and caret direction consumer. | Inspected supported Auto counterexample; no observed caret/persistence consequence. General publisher formatting fidelity is outside scope. |
| Bilingual normalization | Current normalizer, source projector/window/preparation path, lexical gap, title predecessor and successor, typed omissions and expansion/packing controls. | Inspected short public-input traces, barriers and neighboring tests. Full input, continuation and engine-pronunciation matrices not executed. |
| Chatterbox Settings | Native commit/cleanup, persistent download ownership, remounted controls, both activation entries and busy Remove. | Inspected admission and next-action guards. Exact host timing and inference behavior unobserved. |
| Windows release | Ordinary and bounded probes, native diagnostic order, lifecycle journal/finalizer, strict absence helper, release config consumer and NSIS postcondition. | Inspected selected error and success branches. No installer, NSIS fixture or OS fault executed. |
| Retained benchmark tooling | v14 producer/deriver, quality parent/correction writer, CustomVoice setup/cleanup, v5 prerequisite/worker/trial/result paths. | Inspected original cases and neighboring failure gates. Natural faults, resource use and historical results not revalidated. |

## Individual decisions

### VF-0074 — Heard checkpoint after Stop

**Candidate, P2 conditional impact; product reachability inconclusive.** The [bridge](../../../../apps/desktop/src/persistence/narration-position-save-bridge.ts#L64) ends narration ownership, and [passive admission](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.ts#L225) checks `#requireIntentBeforePassiveSave` but not `#protectHeardCheckpoint`. A different exact locator supplied with `measuredManual=false` can replace the heard locator. This proves the sink predicate, not the arrival of that input in normal use.

The [tracker](../../../../apps/desktop/src/reader/active-visual-locator.ts#L605) suppresses unchanged automatic-follow geometry, preserves a settled placement, and suppresses duplicate locators. Dedicated reflow also has protection. The existing [checkpoint test](../../../../apps/desktop/src/persistence/reader-position-save-coordinator.test.ts#L563) calls unmarked `schedulePassive` directly as its “user movement”; it cannot distinguish manual movement from the alleged automatic sample. The [heard-position contract](../../../architecture/synchronization-authority-v1.md#L140) forbids passive inspection from replacing heard progress, but the review has no mounted counterexample to the upstream guards. Earlier U3/5.1 therefore remains a valid narrower fix.

Before a product fix, establish a distinct unmarked sample from the mounted tracker through App after audible start and Stop. Verify exact reopen and then a genuine manual successor. A sink-level test alone cannot close the missing reachability evidence. Natural completion, no-audio attempts and ordinary passive reading remain separate controls. This assessment replaces the earlier unconditional product-defect wording, not the conditional source trace.

### VF-0075 — Nested explicit Auto

**Supported, P3 rendering.** [Projection](../../../../packages/epub/src/document/xhtml-projector.ts#L334) retains effective `auto` without declaration provenance; [rendering](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L100) omits an equal inherited value. An Auto chapter with ordinary initial English text and a later explicitly Auto Hebrew paragraph produces an inherited LTR paragraph instead of element-local RTL. The [HTML direction algorithm](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute) distinguishes these cases.

Fixed LTR/RTL equality is safe; equality of the Auto token is not equivalent to equality of resolved direction. The same attribute helper serves other retained semantic nodes, so a correction must distinguish declaration from inheritance rather than forcing Auto everywhere. VF-0064's implicit-paragraph fix remains intact. Computed direction is the supported consequence; a wrong saved offset is still unproved. Preserve inherited siblings, inline context, stable locators and the earlier caret/reopen controls.

### VF-0076 — Ordinary release admission before terminal Download

**Supported, P2 maintainer evidence.** [Native promotion](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591) publishes Installed while cleanup still owns work. [Both successful-attempt phases](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1335) detach Download with a swallowed rejection and wait only for the snapshot. [Reinstall](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1407) constructs the receipt before observing the terminal attempt.

The native error path can retry staging cleanup successfully while retaining the original error; subsequent process close or uninstall does not recover that discarded result. A failed acknowledgement can therefore coexist with successful later teardown. B06/B07 and the corrected renderer handoff do not repair this independent consumer. The claim is a possible false success receipt, not a corrupt installation. Require bounded per-attempt terminal polling plus fresh state and strict staging absence before advancing either phase.

### VF-0077 — Sleep restoration evidence

**Supported, P3 benchmark evidence.** The [v14 producer](../../../../services/tts/benchmarks/batch_official.py#L1188) sets `sleepSettingRestored: true`; [derivation](../../../../services/tts/benchmarks/batch_result.py#L363) consumes it. Preflight supplies only the earlier `sleepDisabled` assertion. Worker closure, zero resources and raw deletion establish different cleanup obligations.

The runner does not itself change the power setting. The defect is a positive restoration claim without observation, not demonstrated unwanted power reconfiguration. Earlier manual restoration records do not establish future restoration. A prospective evidence path needs the original scheme/value and a matching post-restore observation while retaining operator ownership and frozen artifacts.

### VF-0078 — Spanish article plus omitted mark

**Supported, P3 prepared text.** In same-language prose `Las \u200B14:30.`, the [combined matcher](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1004) accepts only real horizontal separators in the internal gap, then fails on the mark. [Bare-time lookbehind](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L484) skips the mark and accepts the space. The bare form adds its own article, and subsequent omission leaves `Las las catorce treinta.`.

This reaches both current public profiles; no engine pronunciation is needed to establish the prepared-text discrepancy. Other already-omitted marks in the same gap follow the same predicate and remain variants of this ID. Keep real-space, code/language and numeric-compound controls. A correction must preserve typed omitted positions and expansion/packing protection, not merely widen the raw matcher.

### VF-0079 — NSIS map key order

**Supported, P3 build preflight.** [Configuration validation](../../../../apps/desktop/scripts/windows-release.mjs#L326) compares serialized maps, so two valid entries in the opposite insertion order fail fresh preflight. [Tauri](https://v2.tauri.app/reference/config/#customlanguagefiles) defines a language-to-file mapping and separately uses array order for fallback.

The checked-in current map passes; the failure requires an equivalent reordered configuration. Keep exact paths, keys and ordered `languages`. The independent raw-byte release-config digest should still reject attachment to a differently identified build. Earlier receipt comparison fixes do not close this prebuild comparison.

### VF-0080 — Settings action while cleanup is owned

**Partially supported, narrowed to P3 product feedback; P2 activation defect unconfirmed.** Native Installed is intentional during post-commit cleanup. After remount, [controls](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L480) consult local pending/Cancel but omit persistent Download ownership. Remove is exposed, the [shared guard](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L143) rejects busy before Stop or native removal, and the click displays a Stop-and-retry instruction that does not resolve the actual busy condition. That is the supported defect.

[Cached Select](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L277) can also let an explicit eligible activation reach Stop and preference selection. However, [promotion](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591) has already verified and committed the package. [Native discovery](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2580) verifies the installed runtime independently of the operation snapshot, and native Select also admits Installed. No inspected rule establishes that this explicit activation must wait for staging cleanup. Earlier U8/2.2 concerns destructive Remove, which has the needed guard. The preceding reports correctly traced activation but did not establish its claimed P2 violation.

Keep the Remove button consistent with current Download ownership and report the actual busy condition. Do not turn the earlier proposal to block both activation routes into a required fix without first establishing an activation contract or a concrete adverse outcome. Preserve native commit timing, healthy no-ops, eligible explicit selection, late-Cancel completion and cleanup recovery. No deletion, autoplay or inference failure is established.

### VF-0081 — Unknown staging state treated as absence

**Supported, P3 release evidence.** The [ordinary cancellation check](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1320) ignores all lookup rejections except its own retained-path marker. A non-ENOENT failure can advance to retry. Retry may remove the old staging, so later success cannot prove the earlier observation.

The same file's [strict helper](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L679) and bounded probe propagate inspection errors. A dangling leaf also distinguishes `access` from `lstat`, subject to native acceptance of that filesystem state; it is not claimed as an observed product route. Reuse strict absence admission and preserve teardown/backup retention. No existing release receipt was shown false.

### VF-0082 — Two concurrent evaluator corrections

**Not confirmed as a supported-workflow defect; inspected-absent for that proposition.** The two-process overwrite is real at [check-then-replace publication](../../../../services/tts/benchmarks/quality.py#L574). However, [CFR U7](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L260) explicitly retains sequential ownership. Sequential duplicate rejection, invalidation-before-publication and the [unlink-failure regression](../../../../services/tts/tests/test_benchmark_quality.py#L522) still match that contract.

Do not count this as a regression in the accepted sequential fix or automatically schedule concurrency work. If concurrent tooling becomes supported, it needs ownership before aggregate invalidation and complete no-replace publication. Submission overlap and correction/aggregation overlap belong to that prospective scope. Historical evidence is not silently amended.

### VF-0083 — Parent pipe capture

**Supported, P3 retained-tool resource bound.** [Quality generation](../../../../services/tts/benchmarks/quality_cli.py#L118) captures both pipes in memory and checks stdout size only after process completion. Its deadline bounds time, not bytes. Adapter-level Python stream capture cannot bound OS output outside that scope.

The parent already rejects nonzero exit, so the old measurement-launcher exit-status defect does not recur here. No ordinary excessive-memory run or leak is established. Cap binary output while reading and discard unneeded stderr under the quality deadline with bounded reaping. Decoding, malformed receipt, descendants holding pipes and cleanup after forced termination are adjacent failure controls, not additional proved natural incidents.

### VF-0084 — Omitted mark resets English predecessor

**Supported, P3 prepared text.** [The summary](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1253) treats U+200B after `Baker` as punctuation, resets capitalization and sets a complete context. The later uppercase `Then` passes the title guard. `Meet at Baker\u200B St. Then turn.` therefore expands the title and loses the abbreviation period, while the plain control is preserved.

This is separate from the Spanish internal gap. The same left-context problem applies to the already-omitted U+2060/U+00AD and can affect `Dr.`; these are variants, not new IDs. H6/RAC-09/SAF-10 protect plain ambiguity, numeric context and continuation. Preserve their barriers and raw 128-point accounting when making approved omissions transparent. Right-context code traversal is the distinct VF-0092 below.

### VF-0085 — Recovery journal prevents owned uninstall

**Supported, P2 maintainer recovery.** [Invoke-Uninstaller](../../../../scripts/test-windows-package-lifecycle.ps1#L191) sets the attempted flag before [journal hashing](../../../../scripts/test-windows-package-lifecycle.ps1#L134). If the source installer becomes unreadable, the installed uninstaller never launches. [The finalizer](../../../../scripts/test-windows-package-lifecycle.ps1#L391) refuses another attempt and correctly withholds restoration while the installation remains.

This strands the preserved backup and requires recovery; it is not demonstrated deletion of original data. The source installer is unnecessary for executing the installed owned uninstaller. Use the entry identity in the journal, keep final receipt identity checks, and preserve prelaunch ownership, containment and restore gates. Readable-byte drift is a different existing test.

### VF-0086 — Staging setup outside rollback

**Supported, P3 retained-tool retry.** [Session creation](../../../../services/tts/benchmarks/customvoice_screen.py#L466) succeeds before `staging.mkdir()`; that second operation is outside the cleanup scope. Its failure leaves an empty session, so the next same-ID request rejects before preflight.

Both v2 and v3 share this owner. Explicit same-version cleanup remains available; permanent loss is not established. Adapter construction and diagnostic setup also precede rollback and need attention if widening the repair interval. Do not include rejected existing/competing/redirected sessions in destructive rollback. Empty-only rollback after proven exclusive creation addresses the original fault.

### VF-0087 — Unsafe ancestor and optional-data status

**Supported, P3 installer reporting, conditional on the OS lookup results.** [Deletion](../../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L245) refuses unsafe ancestors. The [final macro](../../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L217) probes descendants directly and accepts errors 2/3. If an unsafe intermediate is present but all descendant probes report missing, no aggregate failure is reported.

The safety guard still preserves the unsafe tree. This is neither unsafe recursive deletion nor proof that Chatterbox bytes remain. The [Windows API](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfileattributesw) documents attributes/error observation; no Windows execution here proves a particular junction's returned code. LCF-03 requires safe-inspection evidence and the preferences path already checks ancestry. Preserve absent ordinary ancestors, safe sibling removal, independent preferences, default retention and update mode.

### VF-0088 — Wrong fault can satisfy the probe

**Supported only as a P3 assertion/coverage gap.** The [barrier predicate](../../../../apps/desktop/scripts/optional-download-probe.mjs#L108) requires a created barrier, failed state and any diagnostic. Native response failure can occur before file creation. Export equality and later cancellation preserve that unrelated diagnostic without proving the intended create-file fault.

The receipt retains the actual diagnostic, and the original exact-host evidence explicitly recorded create-file/I/O. Neither the generic export capability nor that historical observation is disproved. Tighten the probe-specific predicate if it is to claim file-create fault coverage; retain the general diagnostic decoder and later cleanup gates.

### VF-0089 — Unqualified GPU baseline

**Supported, P3 retained v5 admission.** A failed cancellation trial may be serialized after successful eventual reaping, and GPU-solo derivation retains its failed count. [Admission](../../../../services/tts/benchmarks/dual_worker_cli.py#L118) checks bytes/identity but no GPU qualification. The [frozen gate](../../../../benchmarks/tts/profile-v5.json#L351) explicitly requires two passed trials, duration and audits before concurrency.

Correct hash does not imply qualifying content. Both official and diagnostic concurrency use this gate before worker construction. Manual prerequisite enforcement prevents the bad run; the historical baseline qualified and the historical concurrent attempt produced no accepted result. Preserve failure-summary derivation and the locked dependency environment if adding automatic qualification.

### VF-0090 — Runtime misses finalizer ownership

**Supported, P3 retained v5 cleanup.** In [the solo loop](../../../../services/tts/benchmarks/dual_worker_cli.py#L467), runtime creation/load precede the assignment used by [the finalizer](../../../../services/tts/benchmarks/dual_worker_cli.py#L682). A failed post-load memory/placement observation bypasses explicit close. The [destructor](../../../../services/tts/benchmarks/isolation.py#L892) attempts termination and suppresses errors.

No leaked live worker is demonstrated. Pilot/concurrent ownership starts earlier and is a useful control. Transfer ownership before observation, release it only after successful early-slot close and retain the final worker for warm-up. Test observation and cleanup failures together before crediting containment.

### VF-0091 — Repeated cancellation scenarios

**Supported only as a P3 retained v5 evidence gap.** [The runner](../../../../services/tts/benchmarks/dual_worker_cli.py#L324) submits two requests to two roles and uses the same before-release callback for queued-after-invalidation and complete-before-release. [The controller](../../../../services/tts/benchmarks/dual_worker_controller.py#L293) invalidates before further dispatch. The authority does not specify which queue layer “queued” means, so the precise confirmed claim is duplicate setup without a distinct witness, not broken production cancellation.

Adjacent inspection also shows concurrent `gpu-active`, `cpu-active` and `both-active` using the same initial-dispatch callback and request set. Submission does not independently witness each model's active phase. Keep these observations under the same ID and require explicit phase witnesses if revived. The separate runtime pending-future test remains useful and no accepted historical concurrent result is invalidated.

## Additional candidate

### VF-0092 — English title lookahead crosses inline code

**New candidate, P3, inspected-present at prepared text.** In an English paragraph with `St.<code> </code>James`, the [XHTML projector](../../../../packages/epub/src/document/xhtml-projector.ts#L475) preserves the code space. The [narration projector](../../../../packages/epub/src/narration/narration-source-projector.ts#L270) carries its code context within the same leaf. Both current public preparation profiles pass that leaf to the mutable normalizer.

The abbreviation's own characters are prose. Its immediate trailing code space still supplies a lexical boundary at [lexicalContext](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L506). Then [hasEnglishTitleContext](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1339) skips whitespace without checking its code/language context and validates only the later uppercase `J`. Start-of-leaf predecessor state is complete. Consequently the abbreviation expands to `Saint`, giving `Saint James`, even though the name context was reached across a code boundary. The code byte itself is unchanged; the defect is using it to establish prose context. `Dr.<code> </code>Morgan` follows the same branch. There is no host or pronunciation claim.

[ADR-0067](../../../architecture/decisions/ADR-0067-conservative-english-titles-and-unicode-marks.md) requires conservative English title context. [The boundary correction](../../../plans/completed/narration-boundary-navigation-corrections.md#L171) preserves prose/code and effective-language boundaries. Existing tests protect an abbreviation entirely in code, a foreign title/name, and left-side barriers; none of those stops this whitespace-only right-side traversal. This is a distinct trigger/owner predicate from VF-0084's lost preceding word. Source lineage `git log -L` shows the right-side loop already in H6's `ab6a609326d4169990207496d1693608e05b285f`; RAC-09, SAF-10 and the later classifier change retained it. No new regression caused by those later changes is claimed.

The bounded correction is to require every skipped gap token to be same-language prose. Preserve the original abbreviation and period when the gap crosses a barrier. Keep ordinary prose `St. James`/`Dr. Morgan`, no-space, terminal, long-gap and capitalized/numeric-predecessor behavior. Prospective checks should use public EPUB inputs for both profiles, including retained foreign whitespace, exact source endpoints, unchanged displayed code, and warm/cold/window-boundary consistency. Do not flatten code into prose or extend lookahead.

## Boundaries not promoted to new findings

- VF-0074 needs mounted event provenance before counting an end-to-end reader defect. VF-0080's explicit activation sequence needs a violating contract or adverse outcome before counting it beyond the supported busy-Remove presentation defect.
- Concurrent quality submission/aggregation overlap is outside the same sequential contract as VF-0082.
- v5 result derivation rereads the GPU baseline from its current summary path. This warrants a future provenance check, but this pass did not establish a supported normal workflow that replaces the baseline between the qualified execution and derivation. No additional ID or historical-result claim is assigned.
- The queued-trial ambiguity, repeated active labels, additional omitted marks and pre-rollback setup calls are recorded with their owning IDs, not counted again.
- No claim of complete repository coverage, physical audio failure, permanent data loss, uncontained live worker, actual false release receipt or changed historical benchmark conclusion follows from this static review.

## Closeout

The registry records a new dated assessment for each VF-0074–VF-0091 and the additional VF-0092. Earlier reports remain immutable. The final source HEAD and empty Git index match intake; writes are limited to this report, registry and audit index.

Evidence consists of source/test/document reads, read-only Git status/hash/history inspection, parent/subagent report retrieval, and official HTML/Tauri/Windows reference lookup. Proposed runtime checks were not executed or reused as current acceptance. There are 16 supported original IDs, one unresolved original product candidate, one unsupported-workflow original report and one new supported candidate. These categories must not be conflated with a count of reproduced product defects.

