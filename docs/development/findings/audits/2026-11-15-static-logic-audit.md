# Static logic audit — 2026-11-15

## Scope and snapshot

- Requested scope: repository-wide logic and bug review by source inspection.
  No tests, builds, model execution, browser sessions, installer runs, or
  network operations were performed. Only cumulative findings records changed.
- Inspected branch: `main`, full HEAD
  `997cddff2a8658440324a87e44178a98018dea77`. Initial index and worktree were
  clean, including untracked inputs. No source or configuration drift was
  observed at closeout.
- Read the [registry](../registry.md), the [partial historical import](../history-import.md),
  the [five-pass reconciliation](2026-11-13-findings-reconciliation.md), and the
  [deep validation](2026-11-13-deep-findings-validation.md). Compared candidate
  owners with the [deep-findings correction plan][deep-plan], ADD-01, RAC-03,
  the landed source, and relevant existing test assertions. History outside
  the consulted owners and aliases was not exhaustively imported.

## Coverage

| Responsibility | Concrete paths and sequences examined | Coverage and remaining limits |
| --- | --- | --- |
| Desktop opening and replacement | `file-ingress/local-epub-file.ts`, `publication/{local-publication-open,publication-session,reader-lifecycle}.ts` and `App.tsx`. Followed selection, reselection, abort, detach, late open, close and narration handoff. | Inspected those transitions; file picker and host timing not observed. |
| Reader, navigation and persistence | `ReaderPublication`, `reader-navigation`, `active-visual-locator`, `reader-reflow-restoration` and the position repository/restore/save coordinators. Followed exact and fallback startup, explicit placement ownership, passive samples, preference reflow, and the audible checkpoint bridge. Traced the raster observer, queue, eviction, read and release. | Partial. Native gestures, DOM geometry/selection, format-specific raster decoding and the full rendering/style matrix remain open. |
| EPUB admission and TOC | `open-epub-publication`, archive lifetime/budgets, container rendition selection, OPF fallback, XHTML projection, both TOC parsers, locator/target resolution and `OpenedPublication`. Followed primary start, repeated fallback occurrences, trimmed labels and public failure propagation. | Partial. No claim over the complete archive/header, OPF/XML grammar, raster or unsupported-publication matrix. |
| Narration preparation | `narration-preparation`, `narration-bilingual-normalizer` and lexical tables. Followed cold and continued locator starts, prose whitespace, article/time matching, segment packing boundaries and Piper's handoff. | Partial. No exhaustive language/segmentation matrix, frozen legacy normalization audit or acoustic observation. |
| Playback and synchronization | `product-narration-coordinator`, scheduler, PCM player, Web Audio and incremental worklet. Followed startup, active-rate commitment, pause/end, refill, reentrant Stop and both backend allocations. | Partial. No native latency, measured working set, DSP quality or full timing-order matrix. |
| Local TTS, contracts and optional runtime | `process-client` and Rust supervisor start/prepare/synthesis/shutdown, shared controls and Python protocol/service, packaged Piper and Chatterbox adapters, host gates and optional transfer/promotion/cancel/removal through Settings. | Partial. Generated validators, all schema alternatives, Qwen, drivers, transfer timeout cases and multi-process acquisition were not fully audited. |
| Distribution, scripts, benchmarks and CI | Ordinary Windows journey, native smoke/driver and portfolio launcher cleanup, selected package promotion, evidence assembly, benchmark preflight/scoring/result derivation and CI entrypoints. | Partial. Historical benchmark versions, most harness leaves, NSIS details and hosted execution were not exhaustively inspected. |

## Findings

| ID | Assessment | Priority | Reachable consequence |
| --- | --- | --- | --- |
| [VF-0058](../registry.md#vf-0058) | Present by source; variant of VF-0046/ADD-01 | P2, product | Installed Chatterbox can leave Play disabled after a late Cancel. |
| [VF-0059](../registry.md#vf-0059) | Present by source; variant of RAC-03, adjacent to VF-0040/VF-0056 | P2, maintainer | A failed smoke can authorize profile restoration with unverified process cleanup. |
| [VF-0060](../registry.md#vf-0060) | Present by source; variant of VF-0047 | P3, product | A label within the retained limit rejects the whole EPUB when padded with a trailing no-break space. |
| [VF-0061](../registry.md#vf-0061) | Present by source; variant of VF-0039/VF-0009 | P3, product | Spanish preparation repeats an article across an en space. |
| [VF-0062](../registry.md#vf-0062) | Present by source; no matching indexed case | P3, product | Direct playback temporarily allocates twice the allowed extra sample storage per unit. |

### VF-0058 — Installed after Cancel

1. A compatible book session has the saved Chatterbox profile selected, but the
   package is absent (for example, after removal). Configuration availability
   requires the [installed runtime](../../../../apps/desktop/src-tauri/src/tts_service_supervisor.rs#L399).
   App tracks the Download generation only for that unavailable profile and
   language in its [installation subscriber](../../../../apps/desktop/src/App.tsx#L449).
2. During verification the user presses Cancel. The native [promotion commits
   Installed](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L1591)
   first. Native [cancellation acknowledges Installed](../../../../apps/desktop/src-tauri/src/tts_optional_chatterbox.rs#L2448);
   the paired Download owns successful staging cleanup.
3. [Client cancellation](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L313)
   supersedes the Download action generation. Its fresh snapshot after the
   paired command settles is a passive read. The [event publisher](../../../../apps/desktop/src/tts/optional-chatterbox-client.ts#L348)
   drops the old Download result and emits no installation completion for
   Cancel or the read. The availability refresh never runs, while
   [Settings](../../../../apps/desktop/src/tts/OptionalChatterboxControls.tsx#L480)
   hides Activate for the selected profile.

The ADD-01 test observes successful post-cancel Installed, and the VF-0046 App
test covers ordinary explicit completion. Neither listed assertion checks the
next Play after their combined order. The required behavior is one attributed
refresh after successful cleanup, with no automatic narration and no effect
on a replaced book, profile or language. Timing frequency is unknown.

### VF-0059 — Smoke cleanup verdict lost

The [ordinary journey](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1166)
moves the existing application data aside, closes its own session, and
[launches the installed narration smoke](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1308).
When the smoke cannot verify process teardown, it exposes a distinct
[cleanup verdict](../../../../apps/desktop/scripts/native-startup-smoke.mjs#L101)
through IPC. Its
process termination/capture errors are explicitly retained by the
[cleanup owner](../../../../apps/desktop/scripts/native-startup-smoke.mjs#L1150).
The [ordinary launcher](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L833)
has no IPC channel and maps either exit to a generic failure. The outer
[finalizer](../../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs#L1088)
does not classify it as prior uncertain cleanup. With no outer session left
and successful uninstall, it proceeds to replace the test data with the
backup. Uninstaller exit and installation-root absence do not certify the
smoke's separately started process tree.

RAC-03's backup-retention rule remains applicable. The installer-specific
wrappers and the separate portfolio launcher preserve a containment or cleanup
verdict. This path does not. A discriminating check would compare a failed
assertion with successful teardown against a failed or missing cleanup receipt
and verify the backup/destination with a disposable profile. No lingering
process or changed data was observed in this audit.

### VF-0060 — TOC label trimmed too late for its length check

With the other publication budgets satisfied, give a valid spine link 1,024
visible code points followed by U+00A0. EPUB 3 [XHTML](../../../../packages/epub/src/navigation/navigation-document.ts#L533)
and EPUB 2 [NCX](../../../../packages/epub/src/navigation/ncx-navigation-parser.ts#L658)
each increment their retained-label counter before trimming the edge on close.
They reject at 1,025 in the parser and [public opening](../../../../packages/epub/src/public/open-epub-publication.ts#L156)
fails with `malformed-package`. The same visible label without padding or with
trailing ASCII space does not hit this branch. A shorter trailing NBSP still
takes the corrected `trimEnd` path. The [prior correction][deep-plan] preserves
the retained-label ceiling and separate raw resource budgets; the discriminating
check combines that ceiling with edge trimming in both public open paths.

### VF-0061 — Spanish article emitted twice

In `Las\u200214:30.`, U+2002 survives [XHTML prose projection](../../../../packages/epub/src/document/xhtml-projector.ts#L402).
The [article matcher](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1004)
admits ASCII, U+00A0, U+202F, U+2007 and U+2009, while the [prose
predicate](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L432)
also admits U+2002. The longer form misses and the [bare time](../../../../packages/epub/src/narration/bilingual-spanish-normalization.ts#L139)
adds its own `las`. Collapsing the space yields `Las las catorce treinta.` in
prepared text. The earlier fixes cover their original characters; their
predicate does not cover this inline separator. The next check should use
public preparation with exact source spans, retaining a bare-time control
and barriers at real breaks or code/language changes.

### VF-0062 — Peak allocation beyond the direct playback budget

[The direct path](../../../../apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts#L195)
allocates one new float array from the FIFO payload and another equal sample
store in `AudioBuffer`. They exist together at `channel.set(input)`. At the
admitted 480,000-frame maximum, the two stores add 3,840,000 bytes during
the copy. The [performance budget](../../../architecture/performance-budget.md#adaptive-buffering-policy)
and [buffer authority](../../../architecture/adaptive-buffer-authority-v1.md#playback-api-implementation)
allow one transient 1,920,000-byte buffer beyond the FIFO. The separate
slower path transfers its input to the worklet; this finding is about the
ordinary 1× path. Source history shows the copy predates the file split.
Origins and actual impact on working set and audible timing are unknown.

## Closeout

- Five recorded candidates have source-supported sequences: four linked
  variants and one case with no match in the consulted history. Zero runtime
  reproductions, zero same-ID recurrences, and no new acceptance verdicts.
  The prior covered arms of VF-0009, VF-0039, VF-0040, VF-0046 and VF-0047
  received narrow source assessments in the registry.
- Other inspected controls: a link to the current shared-fallback XHTML uses its
  own occurrence ID; leading non-linear content does not replace the primary
  start; recovery's last-heard preference remains intentional (VF-0001);
  dispatch checks the run identity after publication before synthesis
  (VF-0055); rate activation commits the first device unit before another
  rate selection can send it back to initial buffering. Multi-process
  acquisition remains deferred (VF-0032); this audit does not resolve it.
- Used `rg`, source reads and read-only Git status, diff and targeted history.
  The index was left empty. The registry, this report and the audit index
  are the only worktree changes. Historical runtime evidence was read for
  lineage and was not reused as current PASS.

[deep-plan]: ../../../plans/completed/deep-findings-minimal-corrections.md
