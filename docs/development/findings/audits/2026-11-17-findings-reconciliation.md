# Reconciliation of the five November 17 logic audits

## Scope and evidence

This review answers three questions for each reported case. It identifies the
earlier fix and its verified scope, the failure or uncertainty in current
source, and a bounded correction with the checks that would distinguish it
from a regression. The 33 registered findings all received read-only subagent review. The
platform capped new agent threads after 32 case assignments. The VF-0124
reviewer also covered VF-0125, and the VF-0123 reviewer covered the delayed
end observation. The coordinator directly reviewed the remaining five
unresolved observations and reconciled source with prior acceptance.

The inspected checkout was `main` at
`50f3b9ec76022efae72c239015bb47080920d7a0`. The index was empty. Intake
changes were limited to the registry, audit index and five audit reports.
The tests and results cited below are historical or proposed. This
reconciliation ran no codebase tests, builds, benchmarks, application flows
or installs. Natural timing and prevalence were outside its evidence.

[Pass 1](2026-11-17-repository-logic-audit.md) ·
[Pass 2](2026-11-17-repository-logic-audit-pass-2.md) ·
[Pass 3](2026-11-17-repository-logic-audit-pass-3.md) ·
[Pass 4](2026-11-17-repository-logic-audit-pass-4.md) ·
[Pass 5](2026-11-17-repository-logic-audit-pass-5.md) ·
[Registry](../registry.md) · [Imported history](../history-import.md)

## What the earlier fixes covered

- Three adjacent regressions can be traced to specific correction commits.
  `e85837d` introduced the zero-ordinal probe expectation and charges scratch
  nodes for discarded Auto markup. `079c38e` introduced the publication order
  that makes a checksum write fail after build authority has been committed.
  [VF-0094](#vf-0094), [VF-0097](#vf-0097), [VF-0107](#vf-0107).
- Several plans stated a broader invariant than their fixtures exercised.
  H13 checked exact install absence with only a default-path fixture.
  NSL-01 blocked known impossible activation for the tested storage states.
  RCF-19 handled a 100% choice before player failure, leaving the later
  coordinator receipt order open. ADR-0077 specified a retryable busy
  receipt while the process fixture bypassed the public CLI serializer.
  [VF-0100](#vf-0100), [VF-0118](#vf-0118), [VF-0122](#vf-0122), [VF-0116](#vf-0116).
- Earlier acceptance retains its exact scope. For example, forced timeout
  reaping does not prove rollback of already written private staging.
  Explicit New Play admission and native pre-spawn cancellation are
  distinct ownership transitions, and earlier library publication guards
  do not establish a public command receipt.
  [VF-0098](#vf-0098), [VF-0106](#vf-0106), [VF-0093](#vf-0093), [VF-0117](#vf-0117).

## Case reviews

### VF-0093

**Cancel during installed runtime verification**

- CCF-C07 closes the window before IPC. RNB-01 and ADR-0056 bound cancellation after a child is published. The dispatched-start fixture fakes shutdown. During installed Piper verification the native operation lock is held and the child slot is empty. Exact Cancel records no intent there, so the old request can still spawn. The renderer retires its run token, and the client later tries exact containment. If that wait exceeds five seconds, Play can stay gated. The host frequency and duration are unmeasured. [CCF-C07](../../../plans/completed/confirmed-chat-findings-minimal-corrections.md#L262), [fixture](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L1258), [native start](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1504), [empty-slot shutdown](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1835), [typed client settlement](../../../../apps/desktop/src/tts/process-client.ts#L567).
- An unscoped cancellation can stop the successor, and premature acknowledgement can allow two startup owners. One check immediately before spawn prevents an obsolete launch but can still leave verification running past the Stop deadline.
- Bind one admitted pending owner to the existing start request ID before installed verification. Check cancellation during bounded verification work and atomically at spawn/publication. Return no-spawn acknowledgement only when that exact owner cannot spawn. Hold verification at the real native boundary, cancel A, and assert zero spawn and later successful Play B. Preserve uncancelled package validation, release locks, and exact matching for a published child. [Verification loops](../../../../apps/desktop/src-tauri/src/tts_release_core.rs#L237), [lifecycle policy](../../../architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md#decision).

### VF-0094

**First artifact ordinal in the Windows download probe**

- The VF-0088 correction at `e85837d` guards an unrelated failed diagnostic. It also added a zero-ordinal expectation, although ADR-0059 and the pre-existing native producer use one-based indices. Its fixture accepts zero and rejects one. A genuine first-part file-create failure is now rejected before export and the bounded retry. Historical installed diagnostics established file-create failure and cancellation, with no index in the summary. [Prior control](../registry.md#vf-0088), [ADR-0059](../../../architecture/decisions/ADR-0059-optional-download-diagnostics.md), [native ordinal](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2282), [probe](../../../../apps/desktop/scripts/optional-download-probe.mjs#L89), [Node fixture](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs#L232).
- Accepting arbitrary diagnostics or every valid ordinal would break barrier attribution. Changing the producer to zero would break the diagnostic contract and Settings export.
- Require numeric index 1 at this first-part barrier. Use the native field shape in a positive fixture and reject index 0, index 2, a string, or an otherwise valid first-part HTTP failure. Keep the stage, kind, positive OS code, export equality, bounded Cancel, and restart-clear checks. Renew live evidence only on a safely admitted installer journey. [Renderer decoder](../../../../apps/desktop/src/tts/optional-download-diagnostic.ts#L83), [ordinary journey](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1285).

### VF-0095

**Late Cancel after failed Chatterbox cleanup**

- VF-0058 preserves the Download completion event when Cancel returns Installed. VF-0043 preserves the receipt through explicit Check. Here promotion already committed and cleanup put native state in Failed while the UI still shows Verifying. Cancel returns Invalid. Its newer client generation hides the failed-cleanup receipt, so Settings can offer Review and discard that receipt on reselection. A fresh read before Review still offers Check. No current host ordering was observed. [VF-0058](../registry.md#vf-0058), [VF-0043](../registry.md#vf-0043), [native failure and Cancel](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2384), [client generation](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L329), [Settings action](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L511).
- Accepting every stale Cancel could hide unrelated failures, wrongly signal completion, or disturb live cancellation and exact-once installation behavior.
- When Cancel sees an inactive Failed state with the retained current post-commit receipt, return that snapshot under the existing lock as a read-only acknowledgement. Preserve operation identity, verified bytes, and explicit Check. Extend the native post-commit cleanup fault and have the mounted client observe the structured reply while stale Verifying is displayed. Assert Check remains available, followed by successful cleanup retry. Keep precommit Cancel, Installed completion, generic Failed, and no-autoplay controls. [Native cleanup fixture](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L269), [handoff states](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2410).

### VF-0096

**Inline bidi scope split by formatting**

- VF-0064 corrected implicit paragraph direction and reader geometry. VF-0075 made flattened descendants agree on the direction of an authored Auto scope. Its final browser fixture checks computed direction and reopen. Even with agreement, the current renderer can give sibling text and emphasis their own directional boxes, changing visual order within one authored isolate. Exact glyph geometry remains unmeasured. The same mechanism applies to a fixed-direction scope. [VF-0064](../registry.md#vf-0064), [VF-0075](../registry.md#vf-0075), [original U1 fixture](../../../../apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts#L64), [renderer](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L119).
- A prior wrapper attempt changed parser collection and rejected valid nested blocks. Grouping by resolved direction would merge distinct nested or adjacent isolates. New DOM wrappers can displace the 80,000-node ceiling or disturb locator, highlight and narration ranges.
- Preserve authored scope identities and block intersections in rendering metadata without changing parser collectors or source order. Use a single app-owned isolation boundary per retained intersection and count actual rendered nodes. Compare per-glyph positions with an equivalent safe native isolate on one line. Keep exact source and mapping ranges, fixed direction, separate equal-direction scopes, no-direction controls, hidden and block descendants, and near-limit rendering. [Prior scope review](../../../plans/evidence/five-search-findings/scope-review-r02.md#L3), [DOM range mapping](../../../../apps/desktop/src/reader/semantic-dom-range-mapper.ts#L260), [node accounting](../../../../apps/desktop/src/reader/large-chapter-rendering.ts#L106).

### VF-0097

**Hidden Auto adds phantom reader capacity**

- M004 deliberately enforces the projected 80,000-node cap. VF-0075's correction `e85837d` counts declarations before omission and charges two scratch nodes whenever the raw count is positive. The accepted Auto fixture has retained visible text. A discarded declaration can therefore turn 79,999 actual nodes into a rejected 80,001. The resolver creates a probe only for retained eligible text. This regression affects chapter admission after successful EPUB opening. [VF-0075](../registry.md#vf-0075), [capacity rule](../../../architecture/decisions/ADR-0008-visual-reader-architecture.md#L133), [declaration handling](../../../../packages/epub/src/document/xhtml-projector.ts#L802), [capacity assessment](../../../../apps/desktop/src/reader/large-chapter-rendering.ts#L189), [resolver](../../../../apps/desktop/src/reader/semantic-auto-direction.ts#L195).
- Dropping all scratch charges would admit chapters over the actual cap. A second scan adds synchronous work. A retained neutral scope still uses a probe even when there is no strong character.
- Detect the resolver's exact retained-text predicate during the existing capacity walk and use that result to charge scratch and start Auto work. Keep raw declaration identity available. Compare two public 79,999-node books differing only in discarded markup and test real Auto scratch at exactly 80,000 and at 80,001. Preserve ordinary plus-one rejection, progressive replacement, and same-byte reopen. Coordinate actual wrapper accounting with VF-0096. [Visible Auto fixture](../../../../apps/desktop/src/reader/large-chapter-rendering.test.ts#L35).

### VF-0098

**Forced quality-worker timeout leaves owned staging**

- CFR-06 protects existing staging from rejected admission. VF-0083 bounds capture and reaps the worker. Its timeout fixture sleeps without writing, while the worker's ordinary exception fixture runs its own cleanup. A forced exit after a WAV write bypasses that cleanup. The next same-ID generation can fail on the pre-existing candidate directory and try cleanup itself, so an immediate retry is not reliable. Explicit cleanup remains available. [CFR-06](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L251), [VF-0083](../registry.md#vf-0083), [watchdog mapping](../../../../services/tts/benchmarks/quality_cli.py#L123), [worker mutation and cleanup](../../../../services/tts/benchmarks/quality.py#L269), [existing timeout fixture](../../../../services/tts/tests/test_benchmark_quality.py#L114).
- Session ID, directory presence and timeout exception alone prove neither ownership nor successful worker reaping. Unconditional cleanup can erase rejected input's prior bytes, another owner or a newer attempt.
- Keep a verifiable admitted-attempt identity from before the first write through worker containment and rollback. Use exclusive session ownership through cleanup or isolated attempt staging. Require positive process-tree and pipe quiescence and revalidate the owned path before cleanup. With a disposable child held after its first WAV, assert no admitted private residue and an immediate retry. Preserve existing bytes for preflight, duplicate, fingerprint and finalized rejection and for uncertain containment. Check the documented two-candidate rollback and successful staging paths. [Sequential quality policy](../../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#L15), [process containment](../../../../services/tts/benchmarks/cli.py#L505).

### VF-0099

**Invalid v5 execution lineage reaches model work**

- The original v5 authority validates the exact frozen commit and strict ancestry at derivation. VF-0089 later guards failed GPU baseline admission. The prospective official v5 command still checks only SHA shape and current execution checkout before its one-use claim and worker launch. An otherwise clean checkout can reach model work and later fail derivation. The audit checkout's existing documentation changes would fail the clean-tree precondition. The historical cited late ancestry incident was v4. Current v5 evidence is static. [Original v5 authority](../../../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md#L1233), [official dispatch](../../../../services/tts/benchmarks/dual_worker_cli.py#L467), [shape check](../../../../services/tts/benchmarks/dual_worker_command.py#L104), [late authority](../../../../services/tts/benchmarks/v5_authority.py#L460).
- Duplicated lineage predicates can drift. Putting the check in a generic parser or recovery finalizer can block older journal restoration, pilots, or unrelated v14 workflows.
- Reuse one exact authority and ancestry predicate in official v5 preparation and run admission before reservations are used or workers are built. Keep the late validation and allow cleanup/restoration of pre-existing ledgers regardless of result eligibility. Assert wrong frozen authority, missing or non-ancestor commits, and wrong execution refuse before claim or worker creation. Preserve a valid official run, pilot behavior and immutable historical results. [Late validator fixtures](../../../../services/tts/tests/test_benchmark_v5_authority.py#L490), [journal binding](../../../../services/tts/benchmarks/benchmark_safety.py#L143).

### VF-0100

**Windows validation can use a remembered custom install path**

- H13 promises absence at the effective destination and owned cleanup. Its fixture places everything under the default path. VF-0085 fixes journal failure during finalization, and VF-0087 protects optional-data cleanup. Both current runners preflight the default directory, while the pinned NSIS initializer can use a remembered current-user destination. A custom install can be at risk, or a new install can be left beyond the default cleanup after a stale remembered path. No installer was run for this review. [H13](../../../plans/completed/validated-audit-follow-up.md#L258), [default-path fixture](../../../../apps/desktop/scripts/windows-release.node-test.mjs#L438), [standalone admission](../../../../scripts/test-windows-package-lifecycle.ps1#L61), [ordinary admission](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1188), [shared launch](../../../../scripts/windows-package-lifecycle-installer.ps1#L99), [pinned NSIS initialization](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.3/crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi#L474-L493).
- Forcing the default destination alone can still overwrite account-wide uninstall registration and shortcuts. Clearing remembered values or uninstalling based on stale registration can mutate somebody else's install. Custom install and repair are legitimate product behavior.
- Share fail-closed validation admission that checks the effective pinned-installer destination, matching registry view and prior registrations before data backup or child creation. Keep ordinary custom installation behavior. Exercise both runners with a clean default and with harmless existing/custom and stale registration sentinels. Refusal should leave data, registration and files unchanged. Keep partial owned install, repair and failed-uninstall recovery controls. Confirm actual path and restoration only in a disposable authorized Windows context. [Testing authority](../../testing.md#L261), [standalone finalization](../../../../scripts/test-windows-package-lifecycle.ps1#L391).

### VF-0101

**Standalone lifecycle launch identity can differ from its receipt**

- VF-0067 gives the ordinary journey a run-owned installer copy. Standalone still samples the live source before and after multiple launches. Its persistent-drift test verifies final drift rejection. A change confined to a launch phase can escape both samples if the behavior checks pass. VF-0085 changed the journal to use cached identity during cleanup and left this launch behavior intact. No incorrect historical receipt was established. [Ordinary fix](../registry.md#vf-0067), [standalone launch](../../../../scripts/test-windows-package-lifecycle.ps1#L175), [final sample](../../../../scripts/test-windows-package-lifecycle.ps1#L433), [persistent-drift fixture](../../../../apps/desktop/scripts/windows-release.node-test.mjs#L525).
- A failed or partial copy can strand work or affect launcher policy. Re-reading either path as a cleanup prerequisite can recreate VF-0085. Snapshot names and timestamp semantics can break receipt attachment.
- Before backing up data, verify a private stable copy against the admitted source identity and use it for all eight launches. Keep the existing logical artifact identity in the receipt and preserve process containment, verified uninstall and restoration. Instrument controlled launches across repair and reinstallation to compare actual bytes used. Preserve unchanged and persistent-drift cases, unavailable original after launch, no-spawn, timeout and cleanup uncertainty. Verify launch behavior and owned snapshot disposal on the relevant Windows host. [Ordinary snapshot use](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1220), [journal guard](../registry.md#vf-0085).

### VF-0102

**Final audio ends during Pause before the rate-preparation reply**

- VF-0048 clears future speed state after logical completion. Its paused fixture delivers Resume before the late failure. CLB-02 deliberately keeps paused transport after the device ends, even with zero remaining audio. In that interval the player can still process a retired future-rate failure and the coordinator saves fallback 1×. The timing and worklet failure were traced statically. [VF-0048](../registry.md#vf-0048), [CLB-02](../../../plans/completed/confirmed-logic-bugfixes.md#L214), [device end](../../../../apps/desktop/src/tts/pcm-playback.ts#L447), [paused scheduler](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1044), [fallback save](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2252).
- Treating all paused states, rounded zero time or a completed range as exhaustion would cancel genuine successor preparation or interrupt a still-owned final frame. Preserve immutable active rate and one heard completion.
- At the player, retire or skip future-rate work only after actual end released the handle and exact frames, pending segments, active narration preparation and synthesis are exhausted in a complete range. Apply the rule when an existing attempt settles or when a new attempt would be created. Bind both worklet and asynchronous outcomes to the attempt. Hold the failure until the truly exhausted final Pause, assert the slow setting stays saved, and Resume to complete before the next deliberate Play. Preserve a queued, pending or synthesizing successor and the paused final frame awaiting actual end. [Rate-attempt settlement](../../../../apps/desktop/src/tts/pcm-playback.ts#L860), [RCF-19 controls](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L1489).

### VF-0103

**A short underrun vanishes between coordinator ticks**

- VF-0050 deliberately uses the last accepted frame receipt at Stop. It does not govern elapsed buffering between running phase transitions. The existing underrun fixture samples the buffering phase once. When depletion and refill both occur between coordinator samples, the scheduler counts the underrun but the coordinator can record zero elapsed buffering. This is distinct from the native harness clock in VF-0123. [Stop evidence policy](../registry.md#vf-0050), [player end](../../../../apps/desktop/src/tts/pcm-playback.ts#L487), [interval sampling](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2294), [existing fixture](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L2580).
- Counting every gap would include intentional scene pauses, user Pause, rate preparation or initial buffering incorrectly. Dual accumulators could double-credit elapsed time or mix generations.
- Accumulate eligible buffering residency at the existing scheduler transition edges with its monotonic clock. Consume same-owner deltas and capture at closure without adding a Stop wait or new timer. Put a controlled 37 ms depletion/refill interval entirely between two product ticks and assert one underrun, 37 ms buffering and zero intentional wait. Keep rate-aware thresholds, intentional wait, Pause/Resume, complete-tail, stale ended and repeated Stop controls. [Refill transition](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1044), [product receipt window](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2246).

### VF-0104

**A partial journal record prevents same-run restoration retry**

- ADR-0076 promises retry after interrupted restoration and gates derivation on actual restoration. The fixture fails before writing a restoration record, then later fails cleanup before deleting data. The exclusive writer introduced in `e85837d` opens the final path before all bytes are committed. A partial final record is then treated as an existing malformed receipt and blocks retry. The workflow fails closed and no wrong derived summary follows. [ADR-0076](../../../architecture/decisions/ADR-0076-prospective-benchmark-safety-evidence.md), [writer](../../../../services/tts/benchmarks/benchmark_safety.py#L95), [finalization read](../../../../services/tts/benchmarks/benchmark_safety.py#L335), [prior fixture](../../../../services/tts/tests/test_benchmark_safety.py#L228).
- Replacing final records or treating corrupt receipts as absent can reopen a consumed one-use reservation, overwrite provenance or admit an unrestored run. A generic rename is unsafe if it can clobber on the supported host.
- Write the bounded record to an exclusively owned same-directory temporary file, verify full write, flush and close, then publish atomically without replacing an existing final. Preserve a committed record on response failure. Exercise a prefix-write interruption and same-run retry through restored proof and derivation. Include already published records, two claims, unsafe paths, failed settlement, partial raw cleanup and existing malformed targets without automatic deletion. Qualify Windows semantics separately from crash-durability claims. [Workflow contract](../../benchmark-safety-v1.md#L25), [claim and settlement](../../../../services/tts/benchmarks/benchmark_safety.py#L240).

### VF-0105

**Warm-up privacy detection disappears from a v14 audit**

- VF-0073 preserves typed privacy failure during measured synthesis and rejects contradictory evidence. The measured-only condition entered in `079c38e`, and prior code already collapsed adapter failures. An isolated warm-up detection still redacts and reaps the worker, but the controller changes its code to generic generation failure. With independently valid settlement and restoration, the derived privacy field can incorrectly pass while both machine conclusions fail. No release of private data or CPU admission follows from this trace. [VF-0073](../registry.md#vf-0073), [isolated detection](../../../../services/tts/benchmarks/isolation.py#L228), [phase condition](../../../../services/tts/benchmarks/batch_execution.py#L252), [derived field](../../../../services/tts/benchmarks/batch_result.py#L368), [measured fixture](../../../../services/tts/tests/test_benchmark_batch_official.py#L275).
- Extending exception propagation indiscriminately could change generic warm-up outcomes, reveal content, or reinterpret frozen evidence.
- Let the prospective official v14 opt-in preserve the same closed privacy code in both phases. Use a harmless warm-up-only diagnostic marker through the bounded worker, raw serialization and safety derivation. Check reaping and redaction, the false privacy field, failed conclusions and rejection of contradictory evidence. Keep successful and generic-failure warm-up, measured privacy, legacy defaults and cleanup-negative controls. [Official failure handling](../../../../services/tts/benchmarks/batch_official.py#L1234).

### VF-0106

**Pending compatibility recheck before native startup**

- NCC-02 reconciles settled compatibility changes and unchanged loaded profiles. The pre-start fixture denies during the initial check. In the current second-check sequence, Play already passed a fresh check and awaits native package availability. Visibility starts a newer probe whose checking snapshot retains the old IDs. A matching package reply can still reach start IPC before the newer denial. Native checks the package and child ownership, without a fresh resource probe on this path. Actual startup and inference effects remain unmeasured. [NCC-02](../../../plans/completed/narration-chatterbox-correctness.md#L114), [visibility trigger](../../../../apps/desktop/src/tts/hardware-compatibility-check-binding.ts#L22), [checking snapshot](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L370), [dispatch gate](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1969).
- Treating pending observation as denial can create a terminal recovery episode for a compatible user. Applying fresh limits to a loaded continuation can interrupt valid playback. An unguarded observation callback can still dispatch after Stop.
- Rejoin the current probe when admission is unsettled after package availability, keep predispatch ownership alive, and verify consumed current admission plus run/profile/language identity at the actual fresh dispatch. Hold separate detector and package replies using the real compatibility binding. Assert no dispatch while pending or denied, one when admitted, and then prove Stop or replacement can retire the wait. Keep unchanged loaded continuation, explicit recovery, and synchronous publication Stop controls. [Applicable admission query](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L415), [native start](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1496).

### VF-0107

**Checksum validation is missing from Windows evidence attachment**

- VF-0072 protects a fixed installer and binary snapshot during build observations. The accepted write-blocking fixture exercises that handoff. Commit `079c38e` moved checksum output after evidence JSON and authority publication. The build can fail there, and a later attachment checks receipts, artifacts and authority without reading the checksum. A missing or stale checksum can accompany accepted gates. The existing attachment fixture even accepts restored authority with a placeholder checksum. [VF-0072](../registry.md#vf-0072), [publication order](../../../../scripts/build-windows-release.ps1#L291), [attachment](../../../../scripts/build-windows-release.ps1#L169), [fixture](../../../../apps/desktop/scripts/windows-release.node-test.mjs#L1486).
- Reordering writes alone leaves later sidecar absence or mutation unguarded. Regeneration during attachment could manufacture evidence after a failed build. Losing the existing held artifact or Defender guards would revive VF-0072.
- In the writable attachment owner require a canonical readable checksum naming the held installer and matching its digest. Keep it stable across publication on Windows. With valid fixture receipts, fail only the checksum write, then require attachment to refuse absent, stale and malformed checksums while preserving prior JSON. Restore the correct sidecar and check retry, wrong name, observation/artifact drift and unsigned publication controls. Any producer hardening should preserve the Node checks and commit authority only once checksum finalization succeeds. [Evidence writer](../../../../apps/desktop/scripts/windows-release.mjs#L748), [user check](../../../user/windows-release.md#L254).

### VF-0108

**ZIP aggregate declaration check depends on directory order**

- M003 requires declared per-entry and total checks plus separate live inflation accounting. It also requires physical entry order independent of central records. Neither accepted counter nor physical-order fixture exercises a nonmonotone declared ratio across prefixes. Today each central-record prefix is checked before sorting. A prefix can exceed the ratio even though the same full declaration in another order passes and the required payload reads agree. [M003](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L714), [inventory](../../../../packages/epub/src/archive/archive-inventory.ts#L598), [declared budget](../../../../packages/epub/src/security/processing-budget.ts#L150).
- Sorting before the same prefix check still rejects some valid totals. Removing per-entry, absolute or observed stream checks would admit unsafe input. Exact-byte book identities legitimately differ under reordered metadata.
- Apply the declared aggregate ratio once to the bounded complete inventory before any payload read. Keep incremental safe totals and absolute caps, per-entry ratio, zero denominator, cancellation and all live checks. Permute safe bounded declarations that reach the same whole total, then check genuine aggregate and individual violations and the observed read/retry controls. A public fixture should compare semantic results and read order independently of book hashes. [Observed read accounting](../../../../packages/epub/src/security/processing-budget.ts#L215), [ingestion contract](../../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L70).

### VF-0109

**Empty CDATA consumes an XML node at the limit**

- M003 defines the text and CDATA budget in terms of nonempty callbacks. The original adapter in `86926596` skips empty ordinary text yet charges an empty CDATA callback emitted by pinned Saxes. The nonempty emission and exact/max-plus-one fixtures miss that event. An otherwise exactly bounded XHTML can fail with resource exhaustion. [M003 accounting](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L722), [adapter callbacks](../../../../packages/epub/src/xml/xml-event-reader.ts#L448), [existing limits fixture](../../../../packages/epub/src/xml/xml-event-reader.test.ts#L426).
- Trimming whitespace or skipping parser checkpoints changes content or work bounds. An empty section embedded in a text run can also split countable callbacks and obscure this specific test.
- Keep the cancellation/deadline checkpoint and skip only the zero-length CDATA charge and emission. At a markup boundary compare exact-limit inputs with and without that event. Keep nonempty and whitespace CDATA, ignored node types, plus-one, byte limits and all work checkpoints. [Parser bounds](../../../../packages/epub/src/xml/xml-event-reader.ts#L472), [CDATA fixture](../../../../packages/epub/src/xml/xml-event-reader.test.ts#L117).

### VF-0110

**Warm narration loses the ampersand's preceding context**

- VF-0054 prevents cuts inside lexical expansions. SAF-10 gives English titles a bounded continuation summary. A legal cut before an ampersand can still omit the preceding word and space required by the separate symbol matcher. Warm preparation then preserves `&` where a cold seek at the same source offset expands it. The Piper and Chatterbox packing thresholds differ. Actual voice output remains unmeasured. [VF-0054](../registry.md#vf-0054), [symbol predicate](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L647), [warm selection](../../../../packages/epub/src/narration/narration-preparation.ts#L655), [SAF-10 matrix](../../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L1182).
- Carrying arbitrary text widens retention, and letting context cross leaves, code or language changes could expand correct literals or shift ranges.
- Preserve at most two exact preceding-position classifications and effective language on the existing same-leaf continuation. Check ownership and meter the lookup, clear it on retirement, and use it only in ampersand matching. Compare warm, internal re-window and cold prepared output plus ranges for both supported profiles and languages. Keep compact, structural, code and foreign-language restrictions and existing titles. [Continuation storage](../../../../packages/epub/src/narration/narration-preparation.ts#L991).

### VF-0111

**A source window can lose a scene ornament's classification**

- M005 accepts a whole ornamental paragraph as silent. SFA-01 traverses padding in a separate paragraph, and VF-0053 carries an already classified marker through omitted units and into playback. If the padding is inside the ornament's paragraph, a later slice begins at a nonzero offset and cannot pass the whole-paragraph rule. Chatterbox can receive the ornament as text. Piper can omit it with the ordinary transition timing because it lacks scene metadata. [M005](../../../plans/completed/M005-narration-text-preparation.md#L1051), [SFA-01 fixture](../../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L901), [VF-0053](../registry.md#vf-0053), [scene predicate](../../../../packages/epub/src/narration/narration-segment-packer.ts#L768), [Piper handling](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2134).
- Accepting an interior fragment as a complete scene can suppress real prose or break quote, list and raster boundaries. Unbounded lookahead would defeat preparation budgets.
- Keep bounded same-paragraph prefix and suffix proof across source windows and require whole-paragraph evidence before declaring an ornament silent. Reuse existing silence and transition plumbing. Compare both ornaments with leading and trailing padding and multi-window marker splits, cold/warm paths, ordinary surrounding prose, structural barriers, exact ranges and bounded work. Verify the scene, ellipsis and no-successor playback controls. [Window advancement](../../../../packages/epub/src/narration/narration-preparation.ts#L945).

### VF-0112

**Acquisition cleanup and setup miss the staging ancestry guard**

- DCR-19 prevalidates explicit Remove paths, including an absent leaf under invalid ancestry. VF-0005 uses ancestry checks for startup reconciliation and ordinary Check. Shared `clean_staging` still tests root and leaf or accepts absence. Confirmation Cancel and Download setup can therefore reach directories outside the owned staging subtree if the intermediate directory is redirected. Similar shared cleanup is used in post-commit Check. No filesystem action or host incidence was observed. [DCR-19](../../../plans/completed/deep-chat-audit-minimal-corrections.md#L101), [VF-0005](../registry.md#vf-0005), [staging guard](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L823), [Download](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2266), [Cancel](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2440).
- Requiring pre-existing staging can block normal acquisition and cleanup idempotency. Weakening consent or discarding the active install's verification or recovery receipt would change product behavior.
- Reuse the managed ancestry check in shared staging cleanup, including before returning absent. Verify existing owned ancestry before staging creation after legitimate root bootstrap and keep mutation provenance under the current owner. Check refusal before deletion, creation or transfer for both present and missing leaves with invalid ancestry using disposable sentinels. Preserve consent, normal missing-path creation, owned cancellation, verified install and backup, post-commit Check and successful retry. [Existing guard and fixture](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L831), [Remove tests](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L2041).

### VF-0113

**Implicit paragraphs lose the language of a line break**

- M003 promises language inheritance, and M005 tests the accepted Spanish join with correct metadata. VF-0064 fixes nearest-block direction while leaving language on the outer collector. An implicit Spanish paragraph in a French chapter can retain Spanish on the words and give the bare break the paragraph's French. The normalizer sees Spanish, unknown and Spanish and misses the supported join. The explicit paragraph yields the joined word. [M003](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L501), [VF-0064](../registry.md#vf-0064), [paragraph metadata](../../../../packages/epub/src/document/xhtml-projector.ts#L1411), [break token](../../../../packages/epub/src/narration/narration-source-window.ts#L593), [join guard](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1872).
- Truthy defaults can erase the explicit unknown-language value. Guessing from adjacent text can join real language boundaries. Incorrect inherited metadata also affects reader DOM language.
- Capture and reset effective language alongside direction at the existing nearest-block boundary. Preserve explicit empty strings, source text and ranges. Compare implicit and explicit Spanish paragraphs through public preparation, including exact `narración.` and matching break offsets. Keep nested unknown and following sibling, genuine language transition, code and RTL/Auto controls. [Boundary capture](../../../../packages/epub/src/document/xhtml-projector.ts#L1560), [unknown-language control](../../../../packages/epub/src/integration/narration-preparation-matrix.test.ts#L1455).

### VF-0114

**Load-time provider loss gets generic warm-up recovery**

- CLB-03 maps valid generic operational errors instead of rejecting them as malformed protocol. It intentionally shares Prepare recovery for ordinary load and warm failures. The bound v7 adapter can detect CUDA unavailable at load after an eligible host check. Missing artifacts and other failures share its local category. The service collapses them to `engine-failure`, and after verified containment the renderer offers Restart. Policy assigns profile selection or recheck when provider loss is established. [CLB-03](../../../plans/completed/confirmed-logic-bugfixes.md#L236), [v7 source binding](../../../../services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py#L97), [native mapping](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1329), [recovery policy](../../../architecture/tts-support-matrix-v1.md#L61).
- Treating every generic error or local `UNAVAILABLE` as CUDA loss would misclassify genuine model failures and change their retry path. Editing a frozen v7 blob would break artifact provenance.
- After containment, an identity-bound fresh probe can support different recovery only when it confirms actual provider loss. A Torch-only failure with a healthy native probe needs a versioned producer reason and matching protocol support. In a packaged-equivalent fixture, exercise prior admission, CUDA loss, containment and profile/recheck with zero automatic restarts. Keep genuine model and warm restart, unknown or stale observations, invalid protocol and failed cleanup controls. [Native probe](../../../../apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs#L355), [renderer mapping](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L326).

### VF-0115

**A completed v6 scorecard can have an unscorable dimension**

- Scorer fixtures reject missing dimensions after submission. VF-0014 establishes aggregate invalidation for classification corrections and uses fully numeric v6 inputs. The generated form and submission accept all N/A for a dimension. The same single-evaluator card then fails aggregate and cannot be replaced using the workflow. [Frozen v6 requirements](../../../../benchmarks/tts/profile-v6.json#L183), [completed write](../../../../services/tts/benchmarks/quality.py#L524), [scorer](../../../../services/tts/benchmarks/quality_scoring.py#L60), [earlier missing-dimension fixture](../../../../services/tts/tests/test_benchmark_quality.py#L1236).
- A generic per-card requirement could reject valid partial coverage in multi-evaluator pooling. Changing the correction owner to rewrite accepted scores would break first-evaluation immutability.
- After sanitization, under the existing lock, require numeric coverage for each required dimension before publishing the official single-evaluator v6 completed card. In a disposable session prove all-N/A rejection creates no completed record or aggregate, then correct the same first evaluation and aggregate the precise mean. Preserve per-sample N/A, valid multi-evaluator complements, duplicate rejection, existing correction behavior and frozen results. [V6 derivation contract](../../../../services/tts/benchmarks/cpu_fallback_result.py#L392).

### VF-0116

**The CPU fallback CLI loses the retryable busy receipt**

- VF-0082 prevents overlapping writes with real-process tests. Its competing derive worker calls the library and prints the closed code directly. ADR-0077 promises `quality-busy` from derivation, and the library now returns it, but the public CLI allows only `quality-stale` and serializes the busy case as `invalid-request`. The lock still protects the winner. [VF-0082](../registry.md#vf-0082), [ADR-0077](../../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#L36), [public serializer](../../../../services/tts/benchmarks/cpu_fallback_result_cli.py#L100), [library fixture](../../../../services/tts/tests/test_benchmark_quality.py#L791).
- Passing arbitrary exception reasons can leak details or make invalid requests and unsafe lock ownership appear retryable.
- Add the closed busy code to the serializer's explicit allowlist and keep nonzero status and the fixed JSON envelope. Use the actual command dispatch with an admitted fixture and genuinely owned session. Assert the busy receipt, empty error output, unchanged bytes, and retry after release. Keep stale, invalid input, unsafe lock and frozen result controls. [Operator retry](../../../../benchmarks/tts/README.md#L271).

### VF-0117

**Correction CLI can print a raw filesystem error**

- VF-0014 orders aggregate invalidation before correction publication and preserves retry. Its accepted fault fixture expects the raw library `OSError`. VF-0042 sanitizes a separate setup command. The current correction CLI catches typed command/session errors only, so unlink denial can bypass its fixed receipt and print a local path. The old aggregate stays intact in this unlink case. [VF-0014](../registry.md#vf-0014), [VF-0042](../registry.md#vf-0042), [unlink](../../../../services/tts/benchmarks/quality.py#L589), [CLI](../../../../services/tts/benchmarks/quality_cli.py#L192), [library fixture](../../../../services/tts/tests/test_benchmark_quality.py#L654).
- Changing invalidation order can publish a correction over a stale aggregate. Catching broad exceptions across every command can hide logic faults. The aggregate-unchanged guarantee applies to unlink denial, rather than to a later write failure.
- Translate expected correction I/O failure at the command boundary into the existing fixed nonzero receipt. Assert exact output and empty stderr for a denied unlink with a synthetic path, intact aggregate and scorecard, no correction and successful same-ID reaggregate after retry. Keep duplicate and lock controls and library semantics. [Receipt contract](../../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#L36).

### VF-0118

**Known oversized preference stops Piper before activation fails**

- NSL-01 requires known impossible activation to be refused before teardown. The mounted and action fixtures cover future version, unavailable storage and stale admission. The oversized read has separate storage coverage, but compatibility presents that outcome as writable. An otherwise eligible installed Chatterbox activation can stop playing Piper before the save rejects. The origin and prevalence of pre-existing oversized data remain unmeasured. [NSL-01](../../../plans/completed/narration-settings-lifecycle-corrections.md#L47), [fixture matrix](../../../../apps/desktop/src/settings/narration-settings-actions.test.ts#L282), [writable state](../../../../apps/desktop/src/tts/hardware-profile-compatibility.ts#L620), [teardown order](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L98), [write guard](../../../../apps/desktop/src/persistence/hardware-profile-preference.ts#L197).
- Broadly marking all malformed states unwritable would prevent legitimate bounded repair. Existing UI text can incorrectly label a different block as a future version. Moving the stop fence may weaken owner containment.
- Classify the known over-limit state as non-writable on both compatibility result paths and give reason-specific feedback. Keep pre- and post-native admission, protected bytes, rollback and loaded-profile no-ops. Seed an oversized value with Piper playing and require no teardown, native selection or save. Keep valid and bounded-malformed repair, future and unavailable states, ownership changes, and unrelated Reset controls. [Profile controls](../../../../apps/desktop/src/tts/HardwareCompatibilityControls.tsx#L246).

### VF-0119

**A legal archive member with a hash sign fails BookV1**

- M002 preserves a closed local path contract, and M003 projects exact archive metadata through it. SAC-13 proves encoded punctuation in a URL fragment. Here a URL path correctly decodes a permitted filename to an archive key containing `#`. Both BookV1 path fields receive the decoded key and the schema rejects it before locator creation. [EPUB filename rules](https://www.w3.org/TR/epub-33/#sec-container-filenames), [SAC-13](../../../../packages/epub/src/public/open-epub-publication.test.ts#L653), [OCF parser](../../../../packages/epub/src/paths/ocf-reference.ts#L97), [projection](../../../../packages/epub/src/book/book-v1-projection.ts#L101), [schema](../../../../packages/shared/schemas/book/v1.schema.json#L106).
- Changing public path semantics could break consumers and simple escaping collides with existing literal percent-encoded-looking names. Relaxing actual URL or archive admission weakens its separate trust boundary.
- Establish whether BookV1 permits projection-only identifiers. If so, use bounded deterministic collision-checked aliases for unrepresentable paths in both fields and keep actual keys private for archive lookup. If exact spelling is contractual, use the versioned contract process. Check distinct escaped-hash and literal percent names, public opening, fragment routing and same-byte resume. Keep existing plain paths and real query, fragment and encoded-separator rejection. [Contract policy](../../../architecture/decisions/ADR-0006-json-schema-contract-authority.md#L78), [exact join](../../../../packages/shared/src/contracts/book.ts#L109).

### VF-0120

**Padded XML IDs recover to the start of the chapter**

- ADR-0007 admits unique XML IDs. The projector's tests cover unpadded, conflicting and hidden duplicate IDs. SAC-13 covers opaque XHTML fragments. Today the source identity index keeps surrounding spaces in a namespaced `xml:id`, so the normalized fragment misses and takes the document-start recovery. [XML ID rule](https://www.w3.org/TR/xml-id/#processing), [admission policy](../../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L167), [identity comparison](../../../../packages/epub/src/document/xhtml-projector.ts#L256), [fallback](../../../../packages/epub/src/locator/target-resolver.ts#L280).
- Generic string trimming changes characters that the XML rule preserves. Reassigning canonical anchor values can make existing saved locations resolve to a different block when a normalized publisher ID takes a previously generated value.
- Apply XML ID space normalization to namespaced IDs before fragment identity comparisons and uniqueness accounting. Preserve literal XHTML IDs. Keep legacy canonical anchors stable or prove their migration before changing assignment. Test normalized duplicates including omitted elements, direct and referenced whitespace, old padded links under an explicit compatibility decision, and a pre-change same-byte saved locator with a nonzero offset and an anchor collision. [Legacy resolver order](../../../../packages/epub/src/locator/locator-resolver.ts#L233), [anchor assignment](../../../../packages/epub/src/locator/locator-index.ts#L269).

### VF-0121

**A disappearing Settings button can leave focus on the viewport**

- R8-06 handles explicit outside focus and removes its guard on close. H7 checks both Tab directions around a native summary. A focused Review action can instead be disabled or replaced by a confirmation. If the browser resets focus without an element focus-in event, Escape misses the dialog-local handler. Exact WebView2 event order remains unmeasured. [R8-06 fixture](../../../../apps/desktop/src/settings/ReaderSettingsDialog.test.tsx#L725), [H7](../../../plans/completed/validated-audit-follow-up.md#L60), [conditional button](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L399), [focus and keyboard handlers](../../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L295).
- An unconditional focus effect can steal an intentionally moved focus, reopen or affect an already closed dialog, or target a destructive action. A global Escape handler would leave modal focus itself stranded.
- Restore a neutral target locally only when the modal is open and its former focused descendant became unavailable. Drive the existing model-free confirmation via real keyboard, observe focus before, during and after async resolution, and press Escape immediately. Require opener focus and no download or activation. Keep valid internal focus, close-before-resolution, Tab wrapping and late outside focus. [Confirmation fixture](../../../../apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts#L1015), [required behavior](../../../product/reader-settings-and-playback-controls.md#L601).

### VF-0122

**An earlier fallback can overwrite feedback for an explicit 1× choice**

- RCF-19 requires a newer 100% selection to win. Its player fixture selects 100% before the rejection. The product fixture consumes the event before reset. If rejection first changes the player's rate and increments its count, then the user selects 1× before the product tick, numeric equality admits the stale warning and duplicate save. It can supersede the user's save result. [RCF-19](../../../plans/completed/revalidated-chat-findings-minimal-corrections.md#L301), [player control](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L1489), [product control](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L700), [consumer](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2252).
- Retiring every attempt on each speed choice would lose shared slower choices. Consuming a count after a new selection could swallow a genuine synchronous fault.
- Capture the same player's already-settled count immediately before an accepted explicit selection or reset and acknowledge just that count after success. Hold the tick, settle a failure, select 1× and tick. Verify one save, no stale warning, unchanged active playback and the explicit save outcome. Keep shared slow choices, prior 1×, real fallback, and Stop/replacement. [Explicit selection](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L758).

### VF-0123

**The native refill stopwatch starts after resource probes**

- M010.1 records actual depletion and resumption in the retained host results. The closing snapshot already starts the timer late, so elapsed wall figures have that sampling limitation. The current runner awaits working-set and GPU samples after the buffering witness. Resumption during those probes can produce a near-zero time or hide an intervening playing phase. The wall fields share that timer, and the product counter is the separate VF-0103. [M010.1 evidence](../../../plans/completed/M010-001-bilingual-narration-and-candidate-screening.md#L624), [native timer](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1882), [published fields](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L2384).
- Moving only the start earlier can overstate duration if first playing is still sampled after probes. Probe work must stay bounded and owned through teardown. Missing resumption is censored evidence.
- Observe both ends with one monotonic clock while resource probes run, using a bounded same-episode witness. Keep stable/no-depletion and deliberate waits separate and fail closed on missing or replaced evidence. In a fake-clock driver fixture let playing occur during a delayed resource sample and require the same positive measured interval in both wall fields independent of probe delay. Keep later refill, missing or wrong phase, stable tail and probe failure and drain controls. [Depletion observation](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L982).

### VF-0124

**The active-cancellation measurement can cover ordinary Stop**

- M010.1 expressly accepts safe preview or a valid heard checkpoint after Stop. The exact-host runner sees `generating`, dispatches Stop in a separate WebDriver call, then times cleanup. When completion wins the gap, post-Stop checks still pass. The separate model-free lifecycle probe requires a terminal cancellation. Historical proof of actual cancellation status in the active timing arm remains unresolved. [M010.1](../../../plans/completed/M010-001-bilingual-narration-and-candidate-screening.md#L632), [adaptive arm](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1942), [model-free control](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L3365).
- Tightening checkpoint state can wrongly fail a safe audible completion. A frontend cancelled promise can come from token invalidation. It cannot independently distinguish native cancellation from completion first.
- Use an existing verified native cancelled result tied to the same UI Stop for a bounded content-free observation. Report completion-first without active-cancellation timing. Exercise held request, natural completion first and foreign/stale scope in deterministic controls. Keep ordinary Stop and visual cleanup and require a separate exact-host run before publishing a new active timing. [Typed receipt validation](../../../../apps/desktop/src/tts/process-client.ts#L495).

### VF-0125

**Reflow measurements stop before verifying placement**

- M004's functional tests prove locator preservation in separate scenarios. Its exact-host measurements promise the time through realignment. Production Chromium and packaged WebView2 record two and three frames respectively after text-scale dispatch, without checking effective scale or settled placement. An ignored or late change can therefore pass. [Performance budget](../../../architecture/performance-budget.md#L76), [native timer](../../../../apps/desktop/scripts/native-smoke/reader-scenarios.mjs#L1182), [Chromium timer](../../../../apps/desktop/tests/browser/reader-performance.benchmark.spec.ts#L898), [functional geometry control](../../../../apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts#L928).
- A changed selector value, saved locator or early visible intersection can all precede realignment. Scroll clamping and eventual fallback can produce misleading timing. An unbounded wait can strand an evidence run.
- Use a stable nonzero synthetic target away from clamped edges. Time from dispatch through effective scale and settled geometry for that same target with a page-local monotonic clock and bounded wait. Exclude stale samples. Prove an in-budget reflow, ignored preference, delayed placement beyond 250 ms and ordinary fallback separately, without adding production diagnostics. Renew exact-host figures with fresh runs. [Restoration transaction](../../../../apps/desktop/src/reader/reader-reflow-restoration.ts#L424).

## Unresolved observations

### Stop after an unexpectedly exited idle child

- ADR-0056 permits the specific completed-synthesis cancellation race after verified containment and keeps other failed cleanup paths unavailable. An idle child's first shutdown can fail reading or writing its graceful protocol. Native can contain that owner, keep exact termination provenance and acknowledge a later shutdown for that identity. The product retains the first non-completion error even if the retry and local cleanup finish. The first audit correctly left the overall recovery policy open. [Native failure settlement](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1398), [exact contained receipt](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1848), [product cleanup](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1574), [ADR-0056](../../../architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md#L40).
- If product policy accepts ordinary recovery after an idle crash with verified teardown, handle that exact operational outcome with a typed result, owner identity and proof of zero retained work. Keep protocol corruption, foreign IDs and incomplete or late teardown terminal. A settled-dead-child test should distinguish that case from an unverified timeout and prove the next explicit action. General dismissal of earlier errors would weaken the existing contract.

### Global fixed layout with reflowable overrides on every item

- The file can be valid EPUB. M003 explicitly treats a global `pre-paginated` rendition as unsupported and skippable. RCF-03 checks full validation before fallback. The current classifier sets incompatible layout from the global declaration and separately rejects contradictory per-item declarations. This matches the original narrow scope. Treat the all-overridden shape as a support expansion until the authority changes. [M003](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L725), [global classification](../../../../packages/epub/src/package/package-document.ts#L1304), [item check](../../../../packages/epub/src/package/package-document.ts#L1363), [fallback fixture](../../../../packages/epub/src/public/open-epub-publication.test.ts#L450), [EPUB layout overrides](https://www.w3.org/TR/epub-33/#layout-overrides).
- If the profile expands, define effective layout per required occurrence through the existing parser and still validate the entire package. Prove all-overridden admission, one remaining fixed item, malformed metadata, fallback roots and unsupported fixed rendering. Preserve the original deterministic package selection and the distinction between unsupported and malformed inputs.

### Piper eligibility when package and optional data span volumes

- NCC-04 corrected Chatterbox storage admission to use the actual optional-data destination. The matched field is shared among profiles, so Piper uses that same number although its packaged model is found beside the executable. The storage threshold can therefore make a different decision on split-volume hosts. The general authority says application/model volume, and the previous plan names only Chatterbox. Confirm which volume is authoritative for each Piper mode before changing selection. [NCC-04](../../../plans/completed/narration-chatterbox-correctness.md#L20), [native probe](../../../../apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs#L118), [matcher](../../../../apps/desktop/src/tts/hardware-profile-matcher.ts#L455), [Piper discovery](../../../../apps/desktop/src-tauri/src/tts_release_core.rs#L72), [storage requirement](../../../architecture/hardware-profile-recovery-authority-v1.md#L186).
- If profile-specific volumes are intended, collect bounded native quantities tied to their purposes and match the correct fact without exposing paths. A shared-field swap would regress Chatterbox. Prove both directions of a split-volume boundary, unknowns, duplicate-volume cases, missing optional leaf and native Download's independent gate. A current path fixture cannot establish installed incidence.

### Visible preference reflow after an unavailable passage

- PN-R1-F1 and CFR-03 protect the unavailable or offscreen reflow gate and admit a measured manual recovery. A successful visible preference reflow can submit an unattributed settled result that sets Play availability without clearing the earlier navigation feedback. The documented exact/approximate and explicit Play rules leave this combination of visible reflow and old notice open. Public geometry and its occurrence were not verified. [Prior review](../../../plans/evidence/passage-navigation/review-r3.md#L26), [CFR-03](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L403), [preference result](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L384), [gate and feedback](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L973).
- Prove a visible, measured reflow after a real unavailable passage at the App/reader/coordinator boundary. Decide whether that geometry may reopen explicit Play. Tie any corrected receipt and feedback to that provenance. Preserve no autoplay, no heard checkpoint advance, offscreen and automatic-resize gating, and pending/new request fences.

### Native graceful shutdown does not validate final stdout or exit status

- DCR-12 validated terminal framing for the separate Node adapter host. Rust's normal graceful shutdown accepts the expected state pair and waits for exit. The wait reduces exit status to presence and the independent stdout receiver is not checked for a clean final boundary. The protocol says extra or truncated records fail the active request. The pinned ordinary producer normally emits the expected pair. A healthy installed-path failure remains unproven. [DCR-12](../../../plans/completed/deep-chat-audit-minimal-corrections.md#L94), [protocol framing](../../../architecture/tts-service-protocol-v1.md#L76), [native shutdown](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1917), [exit poll](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1097), [ordinary producer](../../../../services/tts/src/voxleaf_tts/service.py#L237).
- If clean graceful protocol is required at this owner, keep bounded terminal frame and status checks within the shared deadline, with process-tree containment proved separately. Verify clean shutdown and synthetic terminal protocol faults without hanging on a pipe or weakening forced shutdown, cancellation and exact-identity retry. Track protocol failure separately from an already-contained child.

### Physical silence before a delayed device-end receipt

- NCC-01 deliberately retains a final frame until the owned end callback to preserve completion and the heard checkpoint. A successor can arrive after physical output ends but before that callback. The current scheduler then sees it at release and may schedule a semantic pause without a logical underrun. Policy defines that pause at owned completion. Whether the earlier silent gap belongs in the MVP budget remains a measurement question. [Final-frame rule](../../../../apps/desktop/src/tts/pcm-playback.ts#L534), [release and transition](../../../../apps/desktop/src/tts/pcm-playback.ts#L447), [pause authority](../../../architecture/decisions/ADR-0021-boundary-aware-audio-transitions.md#L23), [MVP budget](../../../product/mvp.md#L501).
- Compare successor arrival before and after a held owned callback, with deliberate, paused, final and replacement controls. Measure actual output separately on a synthetic exact-host case before assigning physical delay. Preserve completion, playable frame and checkpoint ownership. Neither VF-0103's logical counter nor VF-0123's runner timer proves physical output timing.

## Checks across related fixes

- In the installer journeys, establish destination ownership and launch byte
  identity before starting any validation that mutates host state. Receipt
  attachment and checksum validation still need their own tests.
  [VF-0100](#vf-0100), [VF-0101](#vf-0101), [VF-0107](#vf-0107).
- For inline direction and capacity, measure actual glyph geometry and live
  DOM cost. Preserve logical source ranges and same-byte restore. Repeat a
  pre-change saved locator control when changing fragment matching or
  canonicalization. [VF-0096](#vf-0096), [VF-0097](#vf-0097), [VF-0120](#vf-0120).
- Test both rate cases on their distinct events. The exhausted paused unit
  should retire future work, and a user's 1× choice should supersede already
  settled feedback. Preserve real successor fallback. Test the app's
  buffering counter separately from the native wall stopwatch.
  [VF-0102](#vf-0102), [VF-0122](#vf-0122), [VF-0103](#vf-0103), [VF-0123](#vf-0123).
- Keep recovery and result eligibility independent. A rejected benchmark
  request must preserve prior private state, and an older journal must allow
  restoration even when its result cannot be admitted. Keep frozen approved
  evidence intact and add controls at the public command boundary.
  [VF-0098](#vf-0098), [VF-0099](#vf-0099), [VF-0104](#vf-0104), [VF-0116](#vf-0116).

## Intake identities

The following worktree blobs were recorded with `git hash-object --no-filters`.

| Input | Blob |
| --- | --- |
| Registry | `f4e9fbad22aca8252d9cad5793e220536419e9ff` |
| Audit index | `f4ec4d9d88d93bf9dc623bec4906f0ea731a0df2` |
| [2026-11-17-repository-logic-audit.md](2026-11-17-repository-logic-audit.md) | `d745d087ec34fc6fbbdd25b6126368611e9231e0` |
| [2026-11-17-repository-logic-audit-pass-2.md](2026-11-17-repository-logic-audit-pass-2.md) | `d590bf9ddce0b6a6ac1b39a5e5f61beb67648e5a` |
| [2026-11-17-repository-logic-audit-pass-3.md](2026-11-17-repository-logic-audit-pass-3.md) | `1c31dc2a3a6ba4f1060289e86503b75b9ac8e45f` |
| [2026-11-17-repository-logic-audit-pass-4.md](2026-11-17-repository-logic-audit-pass-4.md) | `3beb748ddc8aeb989c0b0dbbfe91f66cf18eb481` |
| [2026-11-17-repository-logic-audit-pass-5.md](2026-11-17-repository-logic-audit-pass-5.md) | `1b3f5663fe4125c98eff9e2a82f0ee5bb727aa40` |

The final worktree inspection confirmed the same HEAD, empty index, and
identical bytes for the five audit inputs. This pass added the reconciliation
and linked it from the registry and index. The 33 numbered findings remain
source-supported candidates on this snapshot. The six additional observations
remain outside that count.
