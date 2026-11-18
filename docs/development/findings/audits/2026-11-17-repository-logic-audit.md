# Repository logic audit, 2026-11-17

## Scope and snapshot

- Static source audit of `main` at `50f3b9ec76022efae72c239015bb47080920d7a0`.
  The worktree and index were clean at intake. The pass focused on ordinary
  reader, narration and optional-package paths and on the recent Windows
  release and benchmark changes. Four read-only helpers traced distinct owners.
- Prior evidence was used to match triggers and select neighboring cases. The
  historical import covers a subset of completed work. Additional plan lookup
  followed the relevant owner and failure, with no new runtime acceptance
  inferred from earlier results. [Registry](../registry.md),
  [import manifest](../history-import.md), [previous passes](README.md),
  [five-search case results](../../../plans/evidence/five-search-findings/case-results.md),
  [reader Stop and quality follow-up](../../../plans/completed/reader-stop-quality-follow-up.md).

## Coverage

| Responsibility | Source and event order examined | Coverage and gaps |
| --- | --- | --- |
| Reader and durable position | App restoration and publication handoff, reflow and relative placement, manual measurement, heard checkpoints, Stop, passive layout and the next save. Followed `ReaderPublication` → `App` → `ReaderPositionSaveCoordinator` and the narration position bridge. | Partial. Original Stop guard and explicit recovery target were inspected. Browser geometry and exact WebView2 event and storage ordering remain open. |
| EPUB and reader rendering | Public opening → XHTML projection → retained scope resolution → React inline attributes and 80,000-node admission. Compared nested Auto, flattened inline formatting, hidden nodes and a boundary-sized chapter. | Inspected the selected direction and capacity paths. ZIP/XML grammar, other document shapes, browser glyph geometry and probe timing remain open. |
| Narration and playback | Current Piper and Chatterbox preparation profiles through the mutable Spanish article/time and English title rules. Examined scheduler refill after rate change, terminal playback and the coordinator's deliberate recovery target. | Partial. Broader language and continuation combinations, DSP, device rendering and model pronunciation remain open. |
| Local service | Coordinator → typed process client → Rust admission and packaged Piper verification → child publication. Followed interrupt, exact start and termination receipts, and sampled Python load, warm, framed synthesis and typed engine failures. | Inspected the selected startup window and published-child controls. Process-tree timing, model runtime, platform coverage and development Qwen remain open. |
| Chatterbox acquisition and Windows evidence | Settings polling, Cancel ownership, native commit and cleanup, fresh read/retry, installed release runner terminal admission, staging absence, recovery journal, NSIS ancestor checks and the first-file fault diagnostic. | Inspected the selected positive, rejection and cancellation paths. Live v7 transfer, platform timing, installed cleanup, signing and Defender remain open. |
| Maintainer benchmarks | Quality parent deadline → worker staging → retry, ready-session ownership, v14 prospective power restoration, and v5 prerequisites, authority, claim, worker ownership, trial witnesses and result derivation. | Inspected the selected failure and admission paths. Actual host/power/GPU execution, historical outputs and other benchmark families remain open. |

## Findings

Each case below is `inspected-present` for its stated ordering or input. Test
definitions were read as evidence of coverage. Candidate and evidence status
apply to the snapshot above.

### P2

- [VF-0093](../registry.md#vf-0093) — **Cancel start can miss in-flight native package verification.** On packaged Piper, native startup holds the operation lock while it enumerates and verifies the installed runtime. The session slot is still empty. If Cancel reaches shutdown there, the busy path can return without recording cancellation for that start request. The client waits for the original start, and native code can still spawn and handshake the obsolete child. If verification and containment exceed five seconds, the coordinator reports `cleanup-failed` and blocks ordinary Play. The renderer run-token check still guards speech dispatch. The existing pre-dispatch and fake dispatched-start tests cover different boundaries. Host incidence remains unmeasured. A discriminating check would hold installed verification before publication, issue exact Cancel, then verify spawn ownership and the next Play. [Installed verification](../../../../apps/desktop/src-tauri/src/tts_release_core.rs#L119), [native start](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1504), [empty-slot shutdown](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1835), [typed client](../../../../apps/desktop/src/tts/process-client.ts#L567), [coordinator](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1568), [CCF-C07 test](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L1258).
- [VF-0094](../registry.md#vf-0094) — **The bounded Windows download probe rejects its intended error.** The first runtime artifact reports `artifactIndex: 1` from native code. The `package:windows:download-probe` gate expects `0` and throws `download-probe-error-not-captured` before diagnostic export and the follow-up cancellation checks. The predicate entered in `e85837d` with a fixture that accepts zero and rejects one. This is a false-rejection variant of VF-0088. The focused next check is to use the one-based native response and a later-part negative control. [Command](../../../../package.json#L47), [one-based contract](../../../architecture/decisions/ADR-0059-optional-download-diagnostics.md#decision), [native producer](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2301), [probe gate](../../../../apps/desktop/scripts/optional-download-probe.mjs#L114), [fixture](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs#L297).

### P3

- [VF-0095](../registry.md#vf-0095) — **Late Cancel can hide the Chatterbox cleanup action.** The UI still shows Verifying when native promotion commits and post-commit cleanup fails. Cancel reaches the recorded Failed operation, receives `tts-optional-profile-invalid` and supersedes the original Download response. With acquisition still eligible and no later fresh read, Settings shows **Review Chatterbox download again**. Choosing it can replace the retained cleanup receipt with confirmation. An additional Download still requires consent. Earlier Cancel controls use a native Installed reply. The distinguishing check holds native Failed before Cancel and continues through the **Check Chatterbox again** action. [Native failure and Cancel](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2384), [client Cancel](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L329), [Settings actions](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L511), [native reselection](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2180), [late-Cancel test](../../../../apps/desktop/src/tts/optional-chatterbox-client.test.ts#L47).
- [VF-0096](../registry.md#vf-0096) — **Inline formatting can reorder text within an RTL phrase.** In synthetic `<p dir="ltr">A<span dir="auto">א<strong>ב</strong>ג</span>Z</p>`, the projector flattens the span while carrying its scope to the surviving runs. The renderer resolves their direction correctly and emits three sibling RTL isolates. Under the HTML and Unicode bidi rules, the first source glyph can then occupy the leftmost position of the phrase, where the source's single isolate would place the third glyph. Existing direction assertions can still pass. Compare glyph rectangles against a native HTML reference while preserving logical offsets. [Projection](../../../../packages/epub/src/document/xhtml-projector.ts#L967), [inline rendering](../../../../apps/desktop/src/reader/SemanticDocument.tsx#L244), [direction assertions](../../../../apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts#L64), [HTML rendering](https://html.spec.whatwg.org/multipage/rendering.html#bidirectional-text), [Unicode bidi isolates](https://www.unicode.org/reports/tr9/#Explicit_Directional_Isolates).
- [VF-0097](../registry.md#vf-0097) — **Hidden Auto markup can make a large chapter unavailable.** A paragraph with 39,998 `<strong>x</strong>` runs and one plain text node projects 79,999 live nodes including the article and paragraph. An appended hidden span with `dir="auto"` increments the document scope count before omission. No surviving text can use the probe. Admission still charges its two nodes and returns chapter-too-large at 80,001. The constructed input fits ingestion's XML caps. `e85837d` introduced this interaction. Compare the hidden-only and real-probe cases through public EPUB opening at the boundary. [XML limits](../../../../packages/epub/src/security/ingestion-policy.ts#L49), [scope allocation](../../../../packages/epub/src/document/xhtml-projector.ts#L802), [node cap](../../../../apps/desktop/src/reader/large-chapter-rendering.ts#L195), [navigation consumer](../../../../apps/desktop/src/reader/reader-navigation.ts#L413).
- [VF-0098](../registry.md#vf-0098) — **A forced quality-generation timeout can strand private audio.** The worker can stall after writing a WAV but before recording candidate completion. At the deadline the parent terminates it and returns a generation failure. The worker's exception cleanup cannot execute after forced termination. Reusing the ID hits the existing staging directory and fails before clearing it, although explicit cleanup is available. Current timeout coverage uses a bare sleeping process. The discriminating check holds a disposable worker after its first WAV and checks private cleanup and same-ID retry. [Generation contract](../../../../benchmarks/tts/README.md#L704), [parent](../../../../services/tts/benchmarks/quality_cli.py#L123), [termination](../../../../services/tts/benchmarks/cli.py#L560), [staging](../../../../services/tts/benchmarks/quality.py#L242), [worker exception cleanup](../../../../services/tts/benchmarks/quality.py#L329), [timeout fixture](../../../../services/tts/tests/test_benchmark_quality.py#L114).
- [VF-0099](../registry.md#vf-0099) — **A stale v5 authority commit can waste an official run.** Official admission checks SHA shape and the baseline summaries before claiming the one-use session. It can accept an obsolete `authorityCommitSha`, reuse that value in raw evidence and report restoration eligibility once the run settles. Derivation then rejects the SHA under its exact authority and strict ancestry rule. The valid frozen commit is a strict ancestor of the audited HEAD. Check wrong and non-ancestral inputs before reservation consumption while retaining the valid lineage control. [Request validation](../../../../services/tts/benchmarks/dual_worker_command.py#L104), [claim](../../../../services/tts/benchmarks/dual_worker_cli.py#L467), [restoration receipt](../../../../services/tts/benchmarks/benchmark_safety.py#L375), [derivation authority](../../../../services/tts/benchmarks/v5_authority.py#L470), [prior ancestry failure](../../../plans/completed/M006-002-qwen-short-segment-batch-feasibility.md#L1307).

## Reconciliation and closeout

- Original routes inspected as guarded on this HEAD include Stop/passive save
  (VF-0074), automatic refill (VF-0066), nested Auto classification (VF-0075),
  the affected normalization rules (VF-0078, VF-0084, VF-0092), acquisition and
  release gates (VF-0076, VF-0080, VF-0081, VF-0085, VF-0087, VF-0088), and the
  benchmark controls (VF-0077, VF-0082, VF-0083, VF-0089, VF-0090, VF-0091).
  The registry links each bounded source check and preserves earlier evidence.
  [Registry](../registry.md)
- Intentional policies retained include explicit recovery from the last heard
  locator (VF-0001) and fail-closed v14 CPU admission (VF-0070). The Stop route
  after an idle child unexpectedly exits remains provisional. The coordinator
  can retain the initial shutdown error after successful exact termination
  retry, but policy on this crash-recovery outcome needs clarification before
  treating it as a defect. [Recovery decision](../registry.md#vf-0001),
  [v14 decision](../registry.md#vf-0070),
  [shutdown retry](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L1574),
  [containment policy](../../../architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md#decision).
- Seven unique source-supported candidates (VF-0093–VF-0099), including six
  linked variants, and one provisional route. Zero same-ID recurrences or new
  runtime reproductions. Severity is based on consequence and the stated
  reachable path. Natural frequency remains unmeasured.
- `git rev-parse HEAD` and `git --no-optional-locks status` identified the
  checkout. `git merge-base --is-ancestor` verified the v5 ancestry control
  against the frozen authority commit. The final source and index comparison
  found only this audit's registry, report and audit-index edits. No tests,
  builds, benchmarks, application processes or installer journeys ran.
  [Audit index](README.md)
