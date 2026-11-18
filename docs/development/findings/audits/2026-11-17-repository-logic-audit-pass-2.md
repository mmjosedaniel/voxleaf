# Repository logic audit, second pass, 2026-11-17

## Scope and snapshot

- Static second review of `main` at `50f3b9ec76022efae72c239015bb47080920d7a0`.
  The Git index was empty. Product, tooling and checked-in test source matched
  HEAD. The only intake changes were the prior audit's three documentation files.
- Intake Git blob IDs from `git hash-object --no-filters` were
  `fffce533a3d145f4387a3c76a7a7208c03715dd1` for the registry,
  `caff66bffe4ddf923f6f868daa0870e0a3de0f00` for the index and
  `d745d087ec34fc6fbbdd25b6126368611e9231e0` for the first report.
- Rechecked the first pass's two P2 cases and inspected new ownership
  boundaries with four read-only helpers. Matching history was drawn from the
  registry, the partial import and the specific completed plans. [First pass](2026-11-17-repository-logic-audit.md),
  [registry](../registry.md), [historical import](../history-import.md),
  [earlier installer reconciliation](2026-11-15-findings-reconciliation.md),
  [four-pass corrections](../../../plans/completed/four-pass-findings-corrections.md).

## Coverage

| Responsibility | Source and event order examined | Coverage and gaps |
| --- | --- | --- |
| EPUB rendition, references and reader navigation | Container selection, full package preflight, global/per-item layout, aliased fallback ordinals, auxiliary targets and reader default/explicit placement. Sampled chapter navigation, placement settlement and lazy raster provenance. | Partial. OCF and XML grammar matrices, actual DOM geometry and browser decode remain open. |
| Playback and observed duration | Pause, device end, final tail, future-rate retirement and persistence across PCM, the scheduler, direct/WSOLA backends and the product coordinator. Followed reported buffering and underruns into native smoke evidence. | Inspected these transitions. Real device/Worklet callback ordering, exact host timing, and other rate/transition combinations remain open. |
| Windows release evidence | Standalone lifecycle preflight, shared Job launch, repair/matrix and final cleanup. Compared actual installer bytes and destination with ordinary acquisition, build evidence attachment and receipt validation. Sampled WebDriver teardown. | Inspected both runners for the stated paths. Actual installer/registry behavior, process cleanup, signed release and live acquisition remain open. |
| Safety-v1 benchmarks | Reservation, claim, settlement, restoration retry and derive-before-delete. Followed v14 warm-up through isolated privacy detection, controller error mapping and evidence publication. | Inspected current prospective routes. Physical power observations, fault-injected file I/O, real model execution and historical benchmark families remain open. |
| First-pass P2 checks | Packaged Piper pending-start identity through the native empty-slot shutdown path, and diagnostic serialization through the bounded Windows probe gate. | Static reassessment of the original triggers. |

## Findings

### P2

- [VF-0100](../registry.md#vf-0100) — **Windows validation can install in a remembered nondefault location.** Both runners check the default root and launch the pinned current-user NSIS installer with `/S`. The template can substitute the saved registry location at startup. The installer can overwrite a stopped existing installation there. A stale saved location can also redirect a new install after a prior uninstall. In the standalone journey, the missing files at the expected root cause failure, while the same absent root lets finalization proceed to user-data restoration. The ordinary journey also looks for the uninstaller in the default root. Source establishes the destination mismatch. No existing install was touched in this audit. [Lifecycle preflight](../../../../scripts/test-windows-package-lifecycle.ps1#L61), [ordinary preflight](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1188), [silent launch](../../../../scripts/windows-package-lifecycle-installer.ps1#L99), [lifecycle cleanup](../../../../scripts/test-windows-package-lifecycle.ps1#L391), [Tauri destination](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.3/crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi#L474-L493), [saved-path lookup](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.3/crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi#L851-L855).
- [VF-0101](../registry.md#vf-0101) — **The standalone lifecycle receipt can credit the wrong installer.** The producer samples the installer at entry and exit while launching the installer available at the original path for each phase. A temporary alternate installer with the same supported install layout can exercise a phase, after which the original file can pass the exit comparison and receipt admission. The existing fixture changes the file persistently, and VF-0067's owned copy belongs to the ordinary runner. [Entry identity](../../../../scripts/test-windows-package-lifecycle.ps1#L23), [launch](../../../../scripts/test-windows-package-lifecycle.ps1#L175), [receipt writer](../../../../scripts/test-windows-package-lifecycle.ps1#L433), [receipt validator](../../../../apps/desktop/scripts/windows-release.mjs#L487), [drift fixture](../../../../apps/desktop/scripts/windows-release.node-test.mjs#L525).

### P3

- [VF-0102](../registry.md#vf-0102) — **A late speed-preparation failure can replace a saved preference after the last unit ends.** Select a slow speed during a final 1× unit, Pause before the end callback and let it finish while paused. The scheduler leaves logical completion pending until Resume. A worklet preparation failure in that window falls back to 1×, and the coordinator saves the fallback despite having no following unit. Current completion coverage rejects the worklet after Resume. [Device end](../../../../apps/desktop/src/tts/pcm-playback.ts#L447), [paused scheduler](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1044), [fallback retirement](../../../../apps/desktop/src/tts/pcm-playback.ts#L860), [preference write](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2252), [test order](../../../../apps/desktop/src/tts/product-narration-coordinator.test.ts#L544).
- [VF-0103](../registry.md#vf-0103) — **A short underrun can count as zero buffering time.** A device-end callback can leave the player buffering and increment its underrun count. If a final short successor arrives before the next coordinator sample, playback resumes before the duration accumulator observes buffering. This can omit the entire interruption from the reported buffering allowance while the count remains one. [Device-end accounting](../../../../apps/desktop/src/tts/pcm-playback.ts#L487), [short-tail admission](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1084), [sampled duration](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2294), [native evidence consumer](../../../../apps/desktop/scripts/native-smoke/tts-scenarios.mjs#L1908).
- [VF-0104](../registry.md#vf-0104) — **An interrupted safety-v1 journal write can block restoration retry.** A short write or interruption after exclusive creation can leave a partial `restored.json`. The next finalization treats the destination as an existing receipt and fails to decode it even when the original power settings are restored and the run inputs are intact. Earlier claim and settlement use the same writer. Current retry coverage fails before publication, leaving this distinct write boundary untested. [Writer](../../../../services/tts/benchmarks/benchmark_safety.py#L95), [retry branch](../../../../services/tts/benchmarks/benchmark_safety.py#L359), [retry contract](../../../architecture/decisions/ADR-0076-prospective-benchmark-safety-evidence.md#decision), [fixture](../../../../services/tts/tests/test_benchmark_safety.py#L228).
- [VF-0105](../registry.md#vf-0105) — **A warm-up privacy detection can leave a passing v14 privacy audit.** The isolated worker redacts diagnostics and reports `privacy`, but the controller keeps that code only during measured work. A warm-up detection instead becomes `generation-failed`. If the remaining evidence is sufficient to derive the failed run, the privacy audit can be `true` while the machine conclusions fail. [Warm-up requests](../../../../services/tts/benchmarks/batch_matrix.py#L90), [worker detection](../../../../services/tts/benchmarks/isolation.py#L228), [phase filter](../../../../services/tts/benchmarks/batch_execution.py#L252), [audit projection](../../../../services/tts/benchmarks/batch_result.py#L368), [measured-only fixture](../../../../services/tts/tests/test_benchmark_batch_official.py#L275).

## Reconciliation and closeout

- VF-0093 and VF-0094 remain `inspected-present` on the same inputs. Native
  cancellation still misses the pre-publication verification window. The
  diagnostic producer still sends `1` while the probe requires `0`.
  [Startup case](../registry.md#vf-0093), [probe case](../registry.md#vf-0094).
- The source still guards VF-0048 after logical completion, VF-0065 in
  prospective derivation, VF-0067 in the ordinary runner and VF-0073 during
  measured work. Precise auxiliary EPUB targets, occurrence-specific fallback
  aliases and primary default start also retain their selected guards.
  [Registry](../registry.md), [fallback fixture](../../../../packages/epub/src/public/open-epub-publication.test.ts#L831),
  [primary start](../../../../packages/epub/src/resource/opened-publication.ts#L377).
- One provisional EPUB compatibility case remains. A global `pre-paginated`
  default marks even a rendition with explicit reflowable overrides on every
  spine item unsupported. The EPUB standard defines the per-item overrides.
  The current ADR describes a reflowable-content profile, while the original
  milestone expressly skipped a global fixed declaration. The supported scope
  of this combination needs resolution before calling it a product defect.
  [Package classifier](../../../../packages/epub/src/package/package-document.ts#L1309),
  [EPUB layout overrides](https://www.w3.org/TR/epub-33/#layout-overrides),
  [support profile](../../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md#support-profile),
  [original milestone](../../../plans/completed/M003-secure-epub-ingestion-and-document-model.md#L725).
- Six new source-supported candidates, including three variants of prior IDs.
  Two previously reported candidates remained present, with zero reopened
  cases and zero new runtime reproductions. Findings depend on their specified
  inputs or event order. Incidence remains unmeasured. The registry holds the
  discriminating follow-up check for each new case.
- Read-only Git inspection identified the exact checkout and intake docs.
  Final comparison found the same source and index, with edits limited to the
  audit registry, index, and two audit reports in the worktree. The first report
  retained its intake bytes. No tests, builds, benchmarks, installer runs or
  application playback ran. [Audit index](README.md)
