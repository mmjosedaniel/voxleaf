# Repository logic audit, fifth pass

## Scope and snapshot

- 2026-11-16, `main` at `079c38ece8687b24859db4f64d4f92bba67bdcee`.
  Continued the [first](2026-11-16-repository-logic-audit.md),
  [second](2026-11-16-repository-logic-audit-pass-2.md),
  [third](2026-11-16-repository-logic-audit-pass-3.md) and
  [fourth](2026-11-16-repository-logic-audit-pass-4.md) source-only passes.
- The Git index was empty. Intake Git blobs for the only dirty inputs were
  `938855cdb6a12ab0a85008d2f170e8a0f90d4b7f` for `registry.md`,
  `1707005f67f73a56ab0917e72c8503ae5a63073a` for `audits/README.md`,
  and `a465eb91b2e9342f8128be58e0334dce88bf0cf2`,
  `271755f17909ae5f0fc1bf086affed3a6032d9fc`,
  `3baa39f15d6eddefe189efeeaf514d779fb61987` and
  `56f8f5fdd91a446d9c14427da4c9594196ae23f1` for the four earlier reports
  in pass order.
- Compared the [registry](../registry.md), its
  [partial import](../history-import.md) and the original v5 authority,
  work order and validators for the observed triggers. The history
  search was limited to those owners.

## Coverage

| Responsibility | Source path and sequence | Coverage and limits |
| --- | --- | --- |
| Hardware compatibility and Settings | Visibility recheck, saved profile and language reconciliation, configuration stop and native default CUDA probe through the PyTorch default device. | Partial. Traced default-device identity and the current preference and probe handoffs. No hardware or multi-adapter incidence measured. |
| EPUB and reader restoration | ZIP structural inspection, mimetype and lazy read ownership, OCF resolution, package-backed TOC targets, canonical visual placement and versioned position envelope writes. | Partial. Examined selected normal and failure routes. Full ZIP/XML grammar, image decode, WebView2 event delivery and OS storage behavior remain open. |
| Local speech protocol | Python load, warm, synthesis result and error records through native typed control receipt, deadline and containment. Sampled the renderer's failure and Settings action consumers. | Partial. No model execution, exact-host audio or full protocol state matrix. |
| Release inventory and repository evidence | Lock-to-artifact choice in the Python inventory, explicit source provenance rule, production audit flow and staged versus working-tree evidence reading. | Partial. No new dependency audit, package build or installed proof. |
| Retained v5 benchmark | Closed CLI admission, GPU-solo summary derivation and consumption, cold-worker load/observation/close, cancellation trial events and receipt checks. | Inspected the selected input-to-result paths. Host timing, actual resource release, other retained benchmark versions and historical results were outside the findings. |

## Findings

All three are P3 `candidate` and `inspected-present` on the stated source
sequences. They affect the retained v5 maintainer workflow.

### VF-0089 — A failed GPU-solo baseline can admit concurrent execution

The frozen baseline requires two passed cancellation trials and at least
300 measured seconds before a concurrent arm can run. If a trial misses
its termination budget while cleanup still succeeds, the producer records
`passed: false` and derivation includes it in `passedTrialCount`. A GPU-solo
summary with those facts can pass schema and consistency validation. With
an otherwise eligible concurrent request and the exact SHA-256 of that
summary, `_summary_hash` verifies the digest, schema version, profile,
corpus and arm. Only the CPU prerequisite checks its conclusion. The GPU
path can therefore start concurrent work with that failed trial or other
unmet baseline conditions. Compare correctly hashed, valid summaries
with a failed trial, insufficient duration and full admission.
[Baseline rule](../../../architecture/tts-feasibility-profile-v5.md#L129),
[trial status](../../../../services/tts/benchmarks/dual_worker_cli.py#L352),
[summary validation](../../../../services/tts/benchmarks/v5_authority.py#L724),
[prerequisite gate](../../../../services/tts/benchmarks/dual_worker_cli.py#L118).

### VF-0090 — Rejected cold-load observation skips explicit worker close

On the official solo branch, `current` owns a loaded worker while
`_load_runtime` reads GPU memory and checks placement. A missing memory
counter can raise before the CLI either closes that cold runtime or
transfers its ownership to `runtime`. The outer `finally` only closes
`runtime`. The adapter has destructor cleanup that suppresses exceptions,
so the error path loses verified close. The source supports skipped close
and lost cleanup-error reporting. It establishes no leaked worker.
Compare a post-load observation failure with a successful cold load and
an explicit cleanup failure.
[Load and observation](../../../../services/tts/benchmarks/dual_worker_cli.py#L218),
[ownership branch](../../../../services/tts/benchmarks/dual_worker_cli.py#L467),
[finalizer](../../../../services/tts/benchmarks/dual_worker_cli.py#L682),
[adapter disposal](../../../../services/tts/benchmarks/isolation.py#L877).

### VF-0091 — The queued cancellation trial can pass without queued work

The concurrent arm requires distinct `complete-before-ordered-release`
and `queued-after-invalidation` trials. Both supply two requests to two
workers and invoke the same hook before ordered release. The controller
claims both at startup. Its invalidation branch cancels the outstanding
work and exits before another dispatch. The trial marks success from
invalidation and cleanup timing plus worker absence, with fixed zero
stale publication and playback values. A pass supplies no observation
about a request still waiting for dispatch. Use a queued request and
observe its fate across invalidation separately from a completed result
waiting for release.
[Required trial order](../../../../benchmarks/tts/profile-v5.json#L279),
[trial setup and receipt](../../../../services/tts/benchmarks/dual_worker_cli.py#L324),
[controller invalidation](../../../../services/tts/benchmarks/dual_worker_controller.py#L293).

## Reconciliation and closeout

- Default CUDA admission still describes visible ordinal zero, with a
  matching default device in Chatterbox. The historical multi-adapter
  mismatch was absent in the examined source path.
  [ADR-0063](../../../architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md),
  [native selection](../../../../apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs#L414),
  [model device](../../../../services/tts/src/voxleaf_tts/adapters/chatterbox.py#L277).
- Core inventory deliberately prefers an available source distribution
  for source provenance. The Windows-target wheel ranking applies when
  the record only has wheels. [Inventory policy](../../dependencies.md#L162),
  [selection](../../../../scripts/release_inventory.py#L327).
- Three unique source-supported findings, including distinct v5 variants
  of prerequisite and cancellation evidence gaps. No same-ID recurrence
  was identified, and no tests, builds, benchmarks or installed journeys
  ran. The fifth pass adds this report and updates the audit index and
  registry. At closeout, HEAD, the empty Git index, product source and
  the four earlier reports matched intake.
