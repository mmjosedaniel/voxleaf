# Repository logic audit, fourth pass, 2026-11-17

## Scope and snapshot

- Static source review of `main` at `50f3b9ec76022efae72c239015bb47080920d7a0`.
  The Git index was empty. The prior audit records, index and registry accounted
  for the intake worktree changes. Product, tooling and checked-in tests matched HEAD.
- Intake blobs from `git hash-object --no-filters` were
  `7f3443eedc1309003fc42dca38ddd19987ab169f` for the registry,
  `4d7ba3e57516284f733e0011dd5b4b0963129f95` for the audit index,
  `d745d087ec34fc6fbbdd25b6126368611e9231e0` for the first pass,
  `d590bf9ddce0b6a6ac1b39a5e5f61beb67648e5a` for the second and
  `1c31dc2a3a6ba4f1060289e86503b75b9ac8e45f` for the third.
- Four read-only helpers traced the selected EPUB, service, acquisition and
  benchmark paths. The coordinator inspected reader restoration and save
  ownership and reconciled candidate evidence. History lookup covered the selected
  owners and triggers, including the original DCR-19 and CLB-03 plans and
  benchmark ADR-0077. Unrelated historical cases were outside the pass.
  [First pass](2026-11-17-repository-logic-audit.md),
  [second pass](2026-11-17-repository-logic-audit-pass-2.md),
  [third pass](2026-11-17-repository-logic-audit-pass-3.md),
  [registry](../registry.md), [history import](../history-import.md).

## Coverage

| Journey | Source and sequence examined | Coverage and gaps |
| --- | --- | --- |
| Reader placement and saves | `ReaderPublication` initial and explicit passage settlement, preference reflow, App handoff, coordinator availability, manual recovery, queued and flushed position saves, and book replacement. | Partial. Exact WebView2 geometry, interrupted host saves and the combined preference/failed-placement journey remain open. |
| EPUB semantics and narration | XHTML language inheritance, heading and list construction, implicit paragraphs, line-break source tokens, normalizer joins, rendered range mapping, and named/decorative raster descriptions. | Inspected the stated code paths. Caret geometry immediately after a line break or image, marker saturation and voice output remain open. |
| Local service and renderer | Packaged Piper and pinned Chatterbox v7 source selection, load/warm errors, synthesis response framing and accepted PCM handoff, explicit recovery, and native shutdown. | Inspected the selected source paths. Actual driver loss, installed v7 process behavior and receipt timing remain open. |
| Optional-package acquisition | Startup and Check reconciliation, explicit Remove, Settings retry, consent, pre-transfer staging, failure cleanup and promotion. | Inspected the stated directory-ownership paths. Host junction behavior, changes during live transfer and the full release lifecycle remain open. |
| Retained benchmark workflows | Public v6 quality form, submission, correction, aggregation, per-session ownership and CPU fallback derivation CLI. | Inspected the stated transitions. Actual Windows lock and filesystem faults, browser form execution, other versions and listening quality remain open. |

## Findings

### P2

- [VF-0112](../registry.md#vf-0112) — **Chatterbox acquisition can follow a redirected staging directory.** Startup records a cleanup failure for an invalid staging ancestor. Explicit Remove checks the same ancestor and refuses the operation. With an eligible host, Settings can then offer **Review Chatterbox download again**. The confirmation's Cancel and Download setup use a helper that checks an existing leaf and whether it resolves under the broad managed root. They do not check the intermediate staging directory. Cancel can delete a redirected leaf inside that root. With an absent leaf and an exterior redirect, Download can create staging outside the owned root before promotion checks it. Both outcomes require pre-existing redirected directory state. [Settings retry](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L511), [cleanup guard](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L823), [Download setup](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2266), [confirmation Cancel](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2440), [DCR-19 Remove coverage](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L2041), [staging ownership](../../../architecture/chatterbox-official-acquisition-authority-v2.md#L92).

### P3

- [VF-0113](../registry.md#vf-0113) — **An implicit paragraph can lose the language of its line break.** Spanish direct text inside a `div` in a French-language chapter retains its language. The synthesized paragraph inherits the outer collector's French, and the bare line-break token inherits from that paragraph. With Spanish normalization the three relevant tokens are classified as Spanish, unknown and Spanish. The line-end join requires one language across all three and leaves the hyphen and a speech separator in `narra-<br/>ción.`. The explicit Spanish paragraph supplies the expected `narración.`. [Projection](../../../../packages/epub/src/document/xhtml-projector.ts#L1411), [source token](../../../../packages/epub/src/narration/narration-source-window.ts#L593), [normalizer](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1857), [language contract](../../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#L131).
- [VF-0114](../registry.md#vf-0114) — **Chatterbox provider loss during load is reported as a warm-up failure.** In the v7 source bound to `998c7b24cda7e969e9ed0344f348506bf38af3b0`, `chatterbox_adapter.py` lines 259–275 raise `UNAVAILABLE` when CUDA is unavailable at load. The bound `service.py` lines 173–181 collapse the result to a generic engine failure. After an earlier eligible host check and successful containment of the failed child, the renderer offers the combined Prepare operation's Restart action. The support matrix prescribes profile selection or recheck for provider loss. This is a conditional recovery result. [Source binding](../../../../services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py#L97), [native mapping](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1329), [renderer classification](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L326), [recovery authority](../../../architecture/tts-support-matrix-v1.md#L61).
- [VF-0115](../registry.md#vf-0115) — **An accepted v6 quality scorecard can be impossible to aggregate.** The generated form allows `not-applicable` on every sample for a required dimension. The only v6 evaluator can submit that otherwise valid card and receive success. The write prevents resubmission, and aggregation requires at least one numeric result per dimension. The documented correction only edits a defect classification. The accepted card therefore blocks the same session's supported completion. [Evaluator form](../../../../services/tts/benchmarks/quality_presentation.py#L45), [submission](../../../../services/tts/benchmarks/quality.py#L524), [scoring](../../../../services/tts/benchmarks/quality_scoring.py#L75), [v6 contract](../../../../benchmarks/tts/profile-v6.json#L183).
- [VF-0116](../registry.md#vf-0116) — **CPU fallback CLI loses the retryable `quality-busy` result.** The lock rejects a second operation and the library translates the reason to `quality-busy`. The public derive command maps it to `invalid-request`. Operators lose the distinction that tells them to wait and retry. The existing overlap fixture exercises derivation through the library. [Library mapping](../../../../services/tts/benchmarks/cpu_fallback_result.py#L452), [CLI mapping](../../../../services/tts/benchmarks/cpu_fallback_result_cli.py#L100), [overlap fixture](../../../../services/tts/tests/test_benchmark_quality.py#L815), [documented retry](../../../../benchmarks/tts/README.md#L274).
- [VF-0117](../registry.md#vf-0117) — **A failed quality correction can print a filesystem traceback.** If aggregate unlink fails during a valid correction, the failed call leaves the previous aggregate and writes no correction. The command lets the raw `OSError` escape, so it can print a local path in a traceback and omit the fixed failure receipt. The existing library fault fixture verifies that retry remains possible. [Correction order](../../../../services/tts/benchmarks/quality.py#L589), [CLI boundary](../../../../services/tts/benchmarks/quality_cli.py#L244), [fault fixture](../../../../services/tts/tests/test_benchmark_quality.py#L654), [receipt contract](../../../architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md#L36).

## Reconciliation and closeout

- DCR-19's explicit Remove and VF-0005 startup/Check guards cover the original
  triggers. VF-0064's direction handling reaches the nearest block. VF-0014's
  unlink-before-publication order and VF-0082's exclusive lock guard the earlier
  benchmark cases. VF-0042's second-directory failure cleans up before retry.
  [Registry](../registry.md), [finalization setup](../../../../services/tts/benchmarks/quality.py#L387).
- Measured preference reflow can restore Play availability with earlier placement
  feedback still present. Existing policy explicitly guards unavailable and
  offscreen reflow. The end-to-end trigger and expected feedback after a visible
  reflow need further evidence. [Preference settlement](../../../../apps/desktop/src/reader/ReaderPublication.tsx#L384),
  [availability and feedback](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L973),
  [original recovery guard](../../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#L403).
- Native shutdown checks the expected control pair and child exit. Inspection found
  no shutdown-side validation of trailing stdout or exit code. The pinned services'
  normal shutdown produces the expected pair and exits successfully. The effect of
  trailing output on installed shutdown requires separate evidence. [Native shutdown](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L1917),
  [service shutdown](../../../../services/tts/src/voxleaf_tts/service.py#L237),
  [DCR-12 adapter host scope](../../../plans/completed/deep-chat-audit-minimal-corrections.md#L94).
- Six new static candidates, one P2 and five P3. Four are variants adjacent to
  earlier corrections, including DCR-19's Remove guard. No same-ID recurrence
  or runtime reproduction. The reader-reflow and shutdown observations above
  remain unresolved. The registry records discriminating checks for the six IDs.
- Final Git inspection found the same HEAD and empty index. The preceding reports
  retain their intake bytes. Changes are limited to this report, the audit index
  and the findings registry. No codebase tests, builds, benchmarks, hardware probes,
  downloads or installed journeys ran. [Audit index](README.md)
