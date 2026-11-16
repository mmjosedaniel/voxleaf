# Repository logic audit, second pass

## Scope and snapshot

- 2026-11-16, `main` at `079c38ece8687b24859db4f64d4f92bba67bdcee`.
  The second pass used the same product source as the [first pass](2026-11-16-repository-logic-audit.md).
  The index was empty. The only dirty inputs were first-pass audit records.
  Their intake Git blob identities were `a126382f665e86cd9431c71f207c7ea6d548d439`
  for `audits/README.md`, `a465eb91b2e9342f8128be58e0334dce88bf0cf2` for the
  first report, and `db308d988eaaf953b6ccc87c460312c9bbae5959` for `registry.md`.
- Static follow-up across the repository, including previously partial
  and adjacent paths. Settings uses the supported packaged product path.
  The Windows journey and retained listening-quality commands are maintainer tooling.
- Read the [registry](../registry.md) and its [partial import](../history-import.md).
  Compared relevant source and original evidence for five-pass U8 and U9,
  M010 v6 scoring, the first audit, and the current controls cited below.
  Historical lookup was bounded by owner and trigger.

## Coverage

| Responsibility | Sequence and owners examined | Coverage and remaining questions |
| --- | --- | --- |
| Chatterbox Settings and native install | `ReaderSettingsDialog`, `OptionalChatterboxControls`, `HardwareCompatibilityControls`, `narration-settings-actions`, client snapshots and native promotion. Followed ordinary Download, dialog remount, visible Installed, Activate, Remove and the late Cancel control. | Inspected these admission paths. Host timing, actual inference and package cleanup incidence remain unmeasured. |
| Installed Windows evidence | `ordinary-chatterbox-release-host.mjs` cancellation, retry and receipt creation against `windows-release.mjs`. Compared the ordinary staging check with the bounded probe and explicit cleanup checks. | Inspected those branches. Other installer scenarios and exact host behavior remain outside this pass. |
| Retained listening quality | `quality_cli.py`, `quality.py`, `quality_scoring.py` and `cpu_fallback_result.py`. Followed worker exit/output, finalization setup, immutable correction, aggregation and derivation. Sampled the v2 service-handoff authority and observer. | Partial. Other benchmark families, hardware, scoring outcomes and historical artifacts remain open. |
| EPUB and raster | `xml-event-reader.ts` encoding/declaration and document budgets, `container-resolver.ts` rendition admission, selected `package-document.ts` checks, then PNG/JPEG/GIF/WebP metadata, URL ownership, observation and visible/preload queue arbitration. | Partial. Exact decoder behavior for other metadata and geometry, full ZIP grammar and EPUB path combinations remain open. |
| Shared contracts | `generate-contracts.mjs` canonical-to-JS/Python output, locator range and narration semantic checks, Rust control validators and selected Python and TS boundary decoders. | Partial. Compared source and representative vectors. Generated artifacts were not regenerated and equivalence for the full frame/contract matrix is unmeasured. |
| Reader placement and focus | Settings focus containment and remount, `ActiveVisualLocatorTracker` viewport sampling and `ReaderReflowRestorer` geometry. | Partial. Fitness of sampled geometry on WebView2, actual input ordering and the full persistence matrix remain open. |
| Narration and playback | Profile-change admission and its Stop/refresh boundary. | Partial. The first pass remains the coverage record for playback buffering, lexical preparation and audio output. |

## Findings

All four are `candidate` with latest check `inspected-present`. The scope of
each assessment is the source sequence described here. Natural incidence and
effects on an installed or benchmark host were not measured.

### VF-0080 — Settings admits actions during post-commit download cleanup

P2, high confidence in the stated ordering on an admitted host. Native
promotion publishes Installed with an active worker before staging cleanup.
A poll can observe it while the original Download is pending. Closing Settings
unmounts the controls. On reopening, their local `pending` is false and both
installed buttons ignore the retained `downloadPending` flag. Remove rejects
as busy before stopping narration, while its click shows a request to Stop
narration and retry. For a ready publication with a compatible Chatterbox
profile, Activate can pass `selectProfile` because the pending client returns
the cached Installed state. The shared path used by the profile radio can also
reach Stop and preference persistence in that state. The earlier U8 tests
cover remount during preflight, rejection before Stop and pending Cancel. Test
the remount at ordinary promotion with the Download response held, followed by
success and cleanup failure. Require the next action to agree with terminal
state and preserve removal rejection before Stop.
[Native commit](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591),
[unmount](../../../../apps/desktop/src/settings/ReaderSettingsDialog.tsx#L336),
[controls](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L480),
[client Select](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L277),
[shared action](../../../../apps/desktop/src/settings/narration-settings-actions.ts#L101),
[VoxLeaf finding](../registry.md#vf-0080).

### VF-0081 — Release cancellation cleanup treats a failed lookup as absence

P3, high confidence in the error branch. The ordinary journey checks the staging
path with `access()` after Cancel and suppresses every rejected lookup. It only
rethrows the marker generated by a successful lookup. A lookup failure other
than `ENOENT` therefore cannot stop a passed receipt if the retry and remaining
steps succeed. The same runner already owns an `assertAbsent` that requires an
`ENOENT` and propagates other lookup errors. A focused fault check should
distinguish absent, present and failed lookup through the ordinary receipt path.
[Cancellation journey](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1320),
[absence check](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L679),
[receipt field](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L361),
[VoxLeaf finding](../registry.md#vf-0081).

### VF-0082 — Concurrent evaluator corrections can replace an accepted correction

P3, high confidence when two retained v6 `correct` invocations for the same
evaluator both pass the missing-file guard. A scorecard can have two cases
marked true. If one invocation completes its replacement before the other
writes its temporary file, both return success for different cases. Only the
second remains in the one-time correction record. A fresh aggregate applies
the remaining correction and silently loses the other successful result.
The submission path uses the same check-then-replace pattern. Start with the
correction path and verify that concurrent submissions preserve the first
successful record, aggregation invalidation and sequential duplicate rejection.
[Correction admission](../../../../services/tts/benchmarks/quality.py#L574),
[JSON writer](../../../../services/tts/benchmarks/quality.py#L83),
[retained v6 decision](../../../plans/completed/M010-hardware-profiles-fallback-and-operational-resilience.md#L1211),
[VoxLeaf finding](../registry.md#vf-0082).

### VF-0083 — Quality generation bounds output after retaining both pipes

P3, high confidence in the parent capture behavior. `benchmark:tts:quality:generate`
uses `subprocess.run(capture_output=True)` and only checks the 16 KiB stdout
limit after the subprocess returns. Stderr is also retained and has no length
check. The inner `DiagnosticCapture` wraps adapter work at the Python stream
level. It does not bound the worker's OS pipes. A sufficiently noisy worker
can increase the parent process's memory use before it can report generation
failure. The five-pass U9 correction limits capture for the measurement CLI.
Use a disposable worker to exercise both pipes, a valid small result, nonzero
exit and deadline behavior for this quality entry point.
[Quality parent](../../../../services/tts/benchmarks/quality_cli.py#L118),
[inner capture](../../../../services/tts/benchmarks/quality.py#L279),
[measurement parent](../../../../services/tts/benchmarks/cli.py#L530),
[VoxLeaf finding](../registry.md#vf-0083).

## Reconciliation and limits

- [VF-0014](../registry.md#vf-0014) remains `inspected-absent` for aggregate
  deletion failure during a sequential correction. The unlink precedes the
  correction write, and CPU fallback derivation recomputes and rejects a stale
  aggregate. VF-0082 concerns two accepted writes to the correction itself.
- [VF-0042](../registry.md#vf-0042) remains `inspected-absent` for failure
  limited to the second directory creation. The empty owned first directory
  is removed before any WAV move. Concurrent contents or simultaneous removal
  failure are outside that proposition.
- [VF-0058](../registry.md#vf-0058) and [VF-0076](../registry.md#vf-0076)
  supplied the native commit comparison. The paired late-Cancel publication
  still protects the original VF-0058 sequence. VF-0076 concerns receipt
  admission on successful install/reinstall and remains `inspected-present`.
  VF-0080 concerns renderer actions without a pending Cancel. VF-0081 occurs
  in the cancellation evidence phase before retry.
- Decoder metadata differences beyond the admitted fixtures remain
  `inspected-inconclusive`. No new raster or XML case was attributed to
  unobserved host decoder behavior.

Four unique candidates, three variants of earlier correction families and one
new tooling case. No case was reproduced in this pass and no historical run
was reused as current acceptance. Tests, builds, benchmark runs and installed
journeys were not executed. At closeout the index and production source matched
intake. The second report, audit index and registry are the only second-pass
writes. The first report retains its intake identity.
