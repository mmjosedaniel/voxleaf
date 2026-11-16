# Repository logic audit, third pass

## Scope and snapshot

- 2026-11-16, `main` at `079c38ece8687b24859db4f64d4f92bba67bdcee`.
  Continued the [first](2026-11-16-repository-logic-audit.md) and
  [second](2026-11-16-repository-logic-audit-pass-2.md) static passes on the
  same product source. The index was empty.
- The only dirty inputs were earlier audit records. Intake Git blob identities
  were `a3da66ac44377f0288caf41ea0adef6166a83e42` for `registry.md`,
  `46963a37dfb6260ba547f4180dd59097c5586d14` for `audits/README.md`,
  `a465eb91b2e9342f8128be58e0334dce88bf0cf2` for the first report and
  `271755f17909ae5f0fc1bf086affed3a6032d9fc` for the second.
- Read the [registry](../registry.md), [partial import](../history-import.md),
  and original evidence for English titles, owner-safe Windows lifecycle
  cleanup and retained quality sessions. History lookup was bounded by
  trigger and owner.

## Coverage

| Responsibility | Source and ordering examined | Coverage and limits |
| --- | --- | --- |
| Narration preparation | M005 preparation and current bilingual policy, source tokens, removable marks, the left and right English title checks, abbreviation replacement, and the published preparation path for Piper and Chatterbox. | Inspected the title and mark interaction. Full grammar, continuation cases and engine pronunciation remain partial. |
| Reader placement, chapters and persistence | Chapter render budget and group rendering, canonical targets, reflow reason ownership, DOM range mapping, paragraph leaf on Pause/Resume and the heard-checkpoint bridge. | Partial. Sampled source handoffs and existing controls. Actual geometry, event delivery and storage behavior in WebView2 remain open. |
| EPUB archive and links | `archive-inventory.ts` admission, first mimetype check and read/close ownership. OCF staged decoding and XHTML links through manifest fallbacks to package-owned fragments. | Partial. No full ZIP header, path, XML or raster matrix. Scope for link targets outside XHTML remains narrow. |
| Local inference and playback | Service control, Piper collection/resampling and Chatterbox waveform shape, profile availability and Stop/cleanup, PCM pause/resume and end, and Web Audio budget and Worklet receipts. | Partial. Static owner and payload comparisons. No host, memory, device or model validation. |
| Windows release tools | Standalone lifecycle receipt, recovery journal, uninstall and backup restoration sequence, compared with the ordinary journey and Piper package promotion/check. Sampled the Windows probe's path and GPU admission. | Inspected the selected ownership paths. No install, recovery, hash drift or driver behavior was exercised. |
| Retained benchmark tools | The CustomVoice `generate` CLI, preflight, session creation, staging, failure ownership, bounded selection and explicit cleanup. Compared v12 temporary quality publication. | Inspected setup and retry for the defined versions. Other legacy benchmark families, actual filesystem errors, scores and generation remain partial. |

## Findings

Each case is a `candidate` and `inspected-present` for the stated sequence.
No incidence, host execution or historical-result impact was measured.

### VF-0084 — An omitted mark changes Street into Saint

P3, high confidence at the prepared-text boundary. The existing English
control preserves `Meet at Baker St. Then turn.`. In the synthetic case
`Meet at Baker\u200B St. Then turn.`, the zero-width mark resets the preceding
word in the title detector. The following capital `T` then permits the
`Saint` expansion. The normalizer omits the mark and produces
`Meet at Baker Saint Then turn.`. It also loses the period in the abbreviation.
The case reaches current Piper and Chatterbox bilingual preparation.
Compare the public prepared text and source ranges with the plain control,
including a legitimate `St. James` title and the guarded numeric-prefix cases.
[Title context](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1262),
[expansion](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L1497),
[mark omission](../../../../packages/epub/src/narration/narration-bilingual-normalizer.ts#L2010),
[ADR-0067](../../../architecture/decisions/ADR-0067-conservative-english-titles-and-unicode-marks.md#decision).

### VF-0085 — The lifecycle journal can block uninstall and profile restoration

P2, high confidence when the already-identified installer becomes temporarily
unreadable after a test installation. Before using the installed package's
uninstaller, `Invoke-Uninstaller` sets the attempted flag and rewrites the
recovery journal. The journal reads and hashes the original installer path
again. A read failure prevents the uninstall launch. The finalizer then
treats the attempted flag as grounds to refuse an uninstall retry, and skips
restoring the backed-up profile because the test installation remains.
The final receipt already performs a separate installer identity check.
Exercise this with disposable stage paths, a verified backup and an
unreadable source installer. Require owned cleanup when the uninstaller is
still available, retain the backup on unconfirmed containment, and reject
the run's evidence on installer drift.
[Initial identity](../../../../scripts/test-windows-package-lifecycle.ps1#L58),
[journal hash](../../../../scripts/test-windows-package-lifecycle.ps1#L149),
[uninstall admission](../../../../scripts/test-windows-package-lifecycle.ps1#L191),
[finalizer](../../../../scripts/test-windows-package-lifecycle.ps1#L391).

### VF-0086 — Failed screen setup leaves a session that rejects retry

P3, high confidence following a fault limited to creating `staging`.
The retained CustomVoice v2 and v3 generation route creates the session
directory and then creates staging before entering the cleanup block. If
the first succeeds and the second fails, the CLI returns failure and the
empty session survives. A subsequent invocation with the same ID reports
`session-state` before preflight, even after the filesystem fault clears.
The published historical results were outside this assessment.
Fail only the staging creation in a disposable session and retry the ID
after clearing that fault. Preserve an earlier admitted session and the
cleanup of a failure in audio generation.
[CLI dispatch](../../../../services/tts/benchmarks/customvoice_screen_cli.py#L55),
[session ownership](../../../../services/tts/benchmarks/customvoice_screen.py#L466),
[existing fixture](../../../../services/tts/tests/test_customvoice_screen.py#L81).

## Reconciliation and limits

- [VF-0021](../registry.md#vf-0021) is `inspected-absent` for a failure in v12
  quality file preparation. It writes to a temporary directory under the
  admitted machine session and renames only after generation, which differs
  from the pre-cleanup staging step in VF-0086.
- [VF-0056](../registry.md#vf-0056) is `inspected-absent` for a proven missing
  installer-helper spawn in the Node ordinary runner. That path distinguishes
  no child PID and verifies absence before restoration. VF-0085 starts with a
  test installation already present and uses the standalone PowerShell owner.
- [VF-0078](../registry.md#vf-0078) shares removable marks with VF-0084.
  The English case loses a preceding capitalized word in a title guard.
  The Spanish case concerns recognition of a time article.
- The active title case is reachable on the admitted, mutable bilingual
  path. The historical fixed corpora and unknown natural incidence make
  this a source assessment only.
- The apparent Piper bytecode concern from the embedded `._pth` file was
  withdrawn. The pinned CPython config reads the environment's bytecode flag
  before it computes the import path for this invocation. Installed behavior
  was outside this pass. [CPython 3.12.10 bytecode flag](https://github.com/python/cpython/blob/v3.12.10/Python/initconfig.c#L1531-L1546),
  [configuration order](https://github.com/python/cpython/blob/v3.12.10/Python/initconfig.c#L1988-L2057).

Three unique source-supported candidates. No tests, builds, benchmarks or
installed journeys ran, and no historical run was reused as current
acceptance. At closeout the index was empty and product source matched
intake. Only the audit index, registry and this report changed in the third
pass. Both earlier reports keep their intake identities.
