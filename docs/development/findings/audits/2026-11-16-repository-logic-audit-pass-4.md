# Repository logic audit, fourth pass

## Scope and snapshot

- 2026-11-16, `main` at `079c38ece8687b24859db4f64d4f92bba67bdcee`.
  Continued the [first](2026-11-16-repository-logic-audit.md),
  [second](2026-11-16-repository-logic-audit-pass-2.md) and
  [third](2026-11-16-repository-logic-audit-pass-3.md) passes by source
  inspection. The index was empty.
- Intake changes were confined to the registry, index and prior reports.
  The intake Git blobs were `d63d085e2c2cd27417f7b23a284391132fd5450a`
  for `registry.md`, `f2a073d3b3279c5bd7c8728d8c348b048a948d0f` for
  `audits/README.md` and `a465eb91b2e9342f8128be58e0334dce88bf0cf2`,
  `271755f17909ae5f0fc1bf086affed3a6032d9fc` and
  `3baa39f15d6eddefe189efeeaf514d779fb61987` for the three earlier reports
  in pass order.
- Reconciled the [registry](../registry.md) and its
  [partial historical import](../history-import.md) with the original
  uninstall and diagnostic criteria. Historical execution informs lineage.
  The assessments below are static.

## Coverage

| Responsibility | Source path and sequence | Coverage and open questions |
| --- | --- | --- |
| Desktop reader and EPUB | Reader settings focus, relocation and startup placement through the opened publication's preparation and close, including canonical fallback and language selection. Sampled the native reader interaction retries. | Partial. Actual scroll geometry, focus delivery, storage and EPUB sample coverage remain open. |
| Playback and local inference | Scheduler admission, speed changes before automatic refill, explicit Resume, short tails, PCM completion and native process start/cancel/shutdown ownership through renderer and supervisor. | Partial. Queue order at these handoffs was traced. Host teardown, synthesis timing, device rendering and model behavior remain open. |
| Windows optional-data uninstall | Silent and interactive opt-in, literal-root deletion guards, aggregate absence in `nsis-hooks.nsh`, independent preference cleanup and the release fixture's junction and access-denied cases. | Inspected removal and status for the selected paths. Compiled behavior and actual descendant lookup errors under a redirected path remain open. |
| Windows download evidence | Bounded first-attempt fault setup, native request/response/file stages, manual export, second attempt cancellation, absence and restart in the installed runner. Compared the full journey's separate cancellation check. | Inspected acceptance of the first diagnostic and its use downstream. Host timing, observed transfer size and installed behavior remain open. |
| Retained benchmarks | Sampled the v4 playback timeline simulation and its exception path into the result gates. | Partial. Other retained benchmark families, shared contract coverage and the full EPUB input matrix were outside this pass. |

## Findings

Both findings are `candidate` and `inspected-present` for the ordered inputs
below. No fresh host observation or historical-result impact was established.

### VF-0087 — Optional-data absence can be accepted through an unsafe ancestor

P3, Windows uninstall reporting. The explicit Chatterbox removal route
skips each affected removal when a literal ancestor such as `tts\cb` is an
existing reparse point. The final aggregate starts clean and queries the
full descendant paths. If these queries return file/path not found, for
example when a junction leads to a directory without the listed names, they
leave the aggregate clean. With the other roots absent or removed, no
optional-cleanup warning or error status follows. This is a loss of evidence
about the owned directory tree. Safe deletion still skips the unsafe
ancestor. The independent preferences path first checks each existing
ancestor, and the compiled controls cover a reparse point at the leaf and
an ancestor lookup returning access denied. Check the distinction between
an absent ordinary ancestor and an existing unsafe ancestor with missing
descendants, while preserving independent cleanup.
[Removal guard](../../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L245),
[postcondition](../../../../apps/desktop/src-tauri/windows/nsis-hooks.nsh#L400),
[LCF-03](../../../plans/completed/lifecycle-correctness-follow-up.md#L100),
[Windows junction behavior](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/fsutil-reparsepoint),
[attribute lookup](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfileattributesw).

### VF-0088 — Bounded download probe accepts a different failure

P3, maintainer evidence. The probe starts a real download and makes a
directory at the first runtime part's partial-file path to provoke a local
file creation error. An HTTP response error can occur after that directory
is created and before the native file operation. The first gate requires
a created barrier, failed state and non-null diagnostic. It ignores the
diagnostic stage, kind and artifact. The same unexpected
diagnostic can satisfy export comparison and retention after a subsequent
successful cancellation. The runner can then issue a passing bounded
probe receipt. The original installed observation recorded a real
`create-file` I/O failure. Compare that intended fault with a response
failure in the same sequence and require the right stage and artifact
before recording the injected check as passed.
[Probe gate](../../../../apps/desktop/scripts/optional-download-probe.mjs#L108),
[native order](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1757),
[result](../../../../apps/desktop/scripts/optional-download-probe.mjs#L190),
[original evidence](../../../plans/completed/optional-download-diagnostics.md#L144).

## Reconciliation and closeout

- The [VF-0066](../registry.md#vf-0066) refill check still recomputes the
  effective buffered lead when the rate changes before automatic successor
  start. Explicit Resume and Play available have separate admission rules.
  [Scheduler](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L642),
  [refill decision](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1044).
- The bounded probe uses the runner's strict absence helper after
  cancellation. [VF-0081](../registry.md#vf-0081) covers the separate
  full-journey lookup.
  [Bounded path](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1253),
  [absence helper](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L679).
- Two new source-supported findings and no new same-ID recurrence in the
  inspected cases. No tests, builds, benchmarks or installed journeys ran.
  The fourth pass adds this report and updates the audit index and registry.
  At closeout, HEAD, the empty Git index, product source and all three
  earlier reports matched intake.
