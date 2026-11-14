# Second static logic audit

## Scope and snapshot

- Date and checkout — 2026-11-13, `main` at
  `5fdb2dc835e99e43034e8b40c99817f45236358f`.
- The second pass continues the repository audit without running tests.
  At intake the index was empty and the only worktree changes were the
  previous pass's registry, index and new report. Their SHA-256 identities
  before this pass's edits were
  `6AAC29434366E247A626EB15A1F05EFC44E942AD1855FB165D742A818B0310A9` (registry),
  `6ED11E5DF8604B48B40A0748D067074633978147792A76AD5F6E170F6799ED73` (index), and
  `9AC1E667B59BEB5A3F68264583683595A1AAF47625DA0457D72BE00CE16CC277` (first report).
- The [first audit](2026-11-13-static-logic-audit.md), [registry](../registry.md)
  and [partial import](../history-import.md) guided the new paths. The history
  lookup also covered the original FPA 5.3, RAC-02/03, CCF-C04, B01/B04, DCR-24,
  RCF-13 and NCC-03 scopes. The linked source and existing checks below establish
  each distinction. Other unimported history remains outside the lookup.

## Coverage

| Responsibility | Source and sequence examined | Coverage | Remaining |
| --- | --- | --- | --- |
| Reader image lifecycle | `SemanticRasterImage` visibility, `PublicationRasterImageLoader` queueing, eviction, stale-result rejection and release. Inspected raster metadata, orientation/dimensions, source admission and decoder-result checks. | Inspected for the observer-to-release path. Partial for formats. | Packaged WebView2 visibility ordering and decoder behavior across supported formats. |
| Narration and audio | Prepared startup through underrun, refill, pause and resume in the scheduler, PCM player, coordinator and controls. Reviewed direct Web Audio and incremental WSOLA paths. Traced automatic chapter fallback through reader settlement and the position-save bridge. | Inspected for target and settings projection. Partial for playback and chapter transitions. | Native audio timing, persistence at an automatic oversized-chapter boundary and the remaining device/rate/cancellation orderings. |
| Optional Chatterbox and host admission | Native Windows capacity probe, desktop profile admission and Settings recovery. Followed optional promotion, verification failure, retained cleanup receipt, refresh and the next explicit action. | Inspected for the retry sequences below. Partial for host-dependent behavior. | Live hardware/transfer, packaged verification, and the remaining native adapter and driver combinations. |
| EPUB and shared contracts | Public opening through OPF fallback, reflow projection, XHTML TOC/NCX and locator assembly. Read selected book, host and control schemas and cross-language consumers, plus generator output grouping. | Partial | Full archive, malformed-document and per-contract compatibility matrix, remaining preparation grammar and unused contracts. |
| Windows release tooling | Ordinary journey's installer, uninstaller, backup, finalizer and receipt ordering. Compared the separate PowerShell lifecycle launcher. Read native startup/WebDriver deadlines and cleanup, and selected package promotion and evidence handling. | Inspected for owned waits in the ordinary journey. Partial for packaging and automation. | Live installer behavior, exact-host/CI execution and remaining release scripts. |
| Benchmark tooling | Retained quality generation admission and directory ownership through finalization, scorecard submission and cleanup. Compared v12 quality publication. | Inspected for the finalization setup and retry path. Partial for benchmarks. | Other benchmark runners, the experimental Qwen pipeline, and filesystem fault execution. |

## Findings and reconciliation

All four sequences are supported by the inspected source. P2 reflects the
potentially indefinite loss of access to app data at its ordinary location
during a maintainer command. P3 reflects misleading product state or a blocked
retry under a bounded condition. Frequency and natural incidence are unknown.

### VF-0040 — Ordinary Windows journey can wait indefinitely after moving app data

`package:windows:ordinary-chatterbox` invokes `runJourney` directly. With
existing app data, the journey renames that directory to its backup before it
awaits the installer. Both spawn wrappers await `error` or `exit` without a
deadline. The stable-install-root check starts after the uninstaller exits.
If the installer stalls, execution never reaches the finalizer. If the
uninstaller stalls, the finalizer never reaches restoration or its
recovery-required error. The existing data stays in the backup.
[Command](../../../../package.json#L80), [backup](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L918),
[install ordering](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1073),
[spawn wrappers](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L865),
[finalizer](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L995).

P2, maintainer tooling. [FPA 5.3](../../../plans/completed/five-pass-audit-revalidation-and-corrections.md#L452)
added an owned-tree deadline to the separate
[PowerShell lifecycle launcher](../../../../scripts/windows-package-lifecycle-installer.ps1#L204).
[CCF-C04](../../../plans/completed/confirmed-chat-findings-minimal-corrections.md#L362)
covers spawn failure. [RAC-03](../../../plans/completed/revalidated-audit-corrections.md#L180)
covers cleanup after a settled failure. The discriminating check uses disposable
owned processes that stay alive in each wrapper. Verify bounded completion,
restoration after proved teardown and an explicit retained-backup outcome when
teardown is uncertain. [Existing finalization controls](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs#L388).

### VF-0041 — Prepared playback displays the wrong active refill target

Select five-minute Prepared playback, get past the initial start, then
exhaust playable audio with more narration still expected. The scheduler
continues producing toward the selected target. Ordinary resumption and the
wait estimate use 60 seconds of playable audio. In expanded narration details,
the live status says how much of one minute is ready while the loaded-audio
line says “Active target: 5 minutes.” The presentation projects the continuing
production target into the label for the current readiness threshold.
[Production target](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L917),
[resumption](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.ts#L1067),
[wait estimate](../../../../apps/desktop/src/tts/product-narration-coordinator.ts#L2603),
[expanded details](../../../../apps/desktop/src/tts/ProductNarrationControls.tsx#L300),
[readiness status](../../../../apps/desktop/src/tts/AdaptivePreparationControls.tsx#L37),
[loaded-audio label](../../../../apps/desktop/src/tts/adaptive-preparation-presentation.ts#L38),
[refill authority](../../../architecture/adaptive-buffer-authority-v1.md#L293).

P3, product presentation. The B01 control deliberately keeps the scheduler's
selected target. DCR-24 and the scheduler boundary tests cover threshold
arithmetic. The controls exercise Quick underrun and Prepared voluntary pause
in separate states. Check both visible fields on a five-minute Prepared
underrun and keep ordinary resumption at one minute. Keep the five-minute
startup target and voluntary-pause preparation goal as controls.
[B01](../../../../apps/desktop/src/tts/adaptive-buffer-scheduler.test.ts#L332),
[DCR-24](../../../plans/completed/deep-chat-audit-minimal-corrections.md#L106),
[controls](../../../../apps/desktop/src/tts/AdaptivePreparationControls.test.tsx#L273).

### VF-0042 — Partial directory creation strands a quality finalization

For a complete staging session admitted by the retained blinded-quality CLI,
`finalize_session` creates `audio`, then `scorecards`, before the protected
block. If the second creation fails transiently, the first directory remains.
No sample has moved and the session is still marked staging. After the original
fault clears, the same session ID fails at `audio.mkdir()` because `audio`
already exists. Finalization cannot use the staged samples through its ordinary
retry. [Command](../../../../package.json#L59),
[CLI](../../../../services/tts/benchmarks/quality_cli.py#L171),
[finalizer](../../../../services/tts/benchmarks/quality.py#L376),
[workflow](../../../../benchmarks/tts/README.md#L691).

P3, maintainer tooling. The same retry obstruction was addressed in v12
quality publication ([VF-0021](../registry.md#vf-0021)). The retained finalizer
has a separate output layout. [VF-0006](../registry.md#vf-0006) and RAC-02
protect rejected generation. Check a disposable complete staging session,
fail only the second directory creation, then retry the same ID after clearing
the fault. Preserve the ordinary finalized-session and failed-generation
controls. [Existing successful finalization](../../../../services/tts/tests/test_benchmark_quality.py#L144),
[generation rejection control](../../../../services/tts/tests/test_benchmark_quality.py#L242).

### VF-0043 — A failed post-commit check displaces the cleanup retry

First commit a verified optional install and leave its recorded post-commit
cleanup pending after a filesystem failure. If **Check Chatterbox again**
temporarily cannot verify the installed package, `retry_cleanup` records the
generic invalid-package error and leaves the cleanup receipt. Settings treats
that code as an acquisition failure and invokes `select` on the next click
when the host is admitted. Even if the filesystem obstruction has cleared,
`select_at` reads the cached Failed operation, skips installed re-verification
and overwrites the operation with Confirming. The user is offered a new
download despite the recovered installed bytes. Download still requires a
separate click.
[Native retry](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1970),
[error mapping](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L375),
[cached observation](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2063),
[explicit selection](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2139),
[failure classification](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L238),
[Settings action](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L505).

P3, product recovery. [VF-0038](../registry.md#vf-0038) covers the retained-size
claim in this state. This variant concerns loss of the cleanup retry on the
next action. RCF-13 exercises still-valid installed bytes with a retained
cleanup failure. NCC-03 exercises acquisition errors without a post-commit
receipt. Check a transient failed integrity read followed by access recovery
and another Settings action. Verify cleanup and the Installed transition, with
a true pre-commit acquisition failure as the confirmation-path control.
[Policy](../../../product/reader-settings-and-playback-controls.md#L205),
[RCF-13 control](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs#L273),
[NCC-03 control](../../../../apps/desktop/src/tts/OptionalChatterboxControls.test.tsx#L441).

## Closeout

- Four unique source-supported candidates, [VF-0040](../registry.md#vf-0040)
  through [VF-0043](../registry.md#vf-0043). Three are linked variants (FPA 5.3,
  VF-0021 and VF-0038), and one has no matching case in the consulted history.
  No current runtime reproduction, regression introduction or same-ID
  recurrence was established.
- Bounded `inspected-absent` assessments were added for rejected generation
  admission ([VF-0006](../registry.md#vf-0006)), failed preparation before v12
  quality publication ([VF-0021](../registry.md#vf-0021)) and live image capacity
  reuse after observed visibility changes ([VF-0030](../registry.md#vf-0030)).
  The source still supports [VF-0038](../registry.md#vf-0038). Image policy
  makes a preempted near image eligible again after a visibility change and
  specifies bounded fallback when observers are unavailable.
  [Image policy](../../../architecture/decisions/ADR-0071-reader-checkpoint-and-image-lifetime.md#L36),
  [release and retry](../../../../apps/desktop/src/reader/images/publication-raster-image-loader.ts#L274),
  [generation guard](../../../../services/tts/benchmarks/quality.py#L246),
  [v12 publication](../../../../services/tts/benchmarks/corrective_v12_quality.py#L419).
- The first report mentioned explicit navigation coverage for B04. The original
  correction also covers automatic follow and has a reader test that delivers
  an already-audible segment from a manual source and stops via the settlement
  callback. PCM reports the start after rendering is confirmed. The joined
  PCM, reader and persistence outcome remains inconclusive for an automatic
  transition into an oversized chapter. No additional ID was assigned.
  [B04 history](../../../plans/completed/reader-narration-acquisition-bugfixes.md#L589),
  [automatic reader test](../../../../apps/desktop/src/reader/ReaderPublication.test.tsx#L2672),
  [audible receipt](../../../../apps/desktop/src/tts/pcm-playback.ts#L425),
  [persistence bridge](../../../../apps/desktop/src/persistence/narration-position-save-bridge.ts#L50).
- A queued end arrives while playback is voluntarily paused in the CLB-02
  control. The resulting Resume with valid audio is permitted and distinct
  from involuntary refill. [Pause authority](../../../architecture/adaptive-buffer-authority-v1.md#L133),
  [CLB-02](../../../../apps/desktop/src/tts/pcm-playback.test.ts#L1327).
- The final source snapshot remains the intake HEAD. Source and existing checks
  were read using `Get-Content`, `rg` and read-only Git inspection. No test,
  build, product or benchmark command ran. Changes are limited to this report,
  the [registry](../registry.md) and [audit index](README.md).
