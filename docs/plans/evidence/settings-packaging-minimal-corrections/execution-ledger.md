# Settings and packaging correction evidence

Task: SPM-01–06. Base and unchanged HEAD:
`599b4cf4a446c006ae3262cfceac0f75e596a50d`.
Branch: `codex/settings-packaging-minimal-corrections-plan`.
Entry index/worktree were clean. No Git mutations are authorized.

All acceptance commands run from repository root in local PowerShell 7.6.5
outside the managed sandbox, with Node 24.20.0, repository-selected pnpm
11.15.1 and uv 0.11.29. Python is 3.12.10. Raw output, UTC start/end, exit
status, source/discovered input SHA-256 lists, exports and build identities
are retained under ignored `tmp/evidence/settings-packaging-minimal-corrections/`.
No private host inventory, book contents or audio are copied into this summary.

## Reproductions and changes

- G1-desktop-red: six directed failures reproduced the circular reset,
  persistence before failed completion cleanup, reset writes despite retained
  failed owners, and missing profile/language/partial-reset feedback.
- G1-packaging-red: 22 failures and two passing controls. Real tiny builders
  reproduced late ZIP/smoke/measurement/promotion loss of old outputs, premature
  authority replacement, rejected metadata reaching output mutation and destructive
  part-count rejection. Acquisition/model work is stubbed; verification and
  filesystem promotion execute normally.
- Startup selection now completes necessary cleanup and checks eligibility before
  persistence. Existing configuration ownership contains Play across the write.
  A contained, ownerless, stopped service may reset startup without prematurely
  clearing its recovery episode. Closed owners ignore publication after writes.
- Controls keep fixed, content-free rejection/partial-reset feedback and clear
  obsolete feedback on retry. Successful fields remain accurately displayed.
  The Chromium case traverses actual Settings actions and the product coordinator.
- Piper prepares folder, archive, both smokes and measurements first, and includes
  staged manifest/evidence only for explicit write-manifest. Chatterbox prepares
  archive, bounded parts and the actual applicable receipt before promotion.
  Partial promotion compensates; failed restoration retains backups. Cleanup
  after the commit point reports failure without claiming the old set survived.
- Piper rejects mismatched language/profile/model-root/voice tuples at recipe
  intake and verification. No model import, native-policy or generic integrity
  schema change was needed. Both exact current tuples remain valid.

## Initial round: commands and results (desktop superseded by F1 below)

| Receipt | Exact command | Result |
| --- | --- | --- |
| G0-exports | `pnpm.cmd build:packages` | PASS; prerequisite preparation, no old PASS claimed |
| G1-desktop-red | G2 command plus `-t 'SPM-'` | 6 intended failures |
| G1-packaging-red | G3 command plus `-k spm` | 22 failures, 2 controls pass |
| G2-desktop-r2 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/hardware-profile-compatibility.test.ts src/App.test.tsx` | PASS, 354 tests |
| G3-packaging-final | `uv run --project services/tts --locked pytest services/tts/tests/test_release_core.py services/tts/tests/test_release_chatterbox.py services/tts/tests/test_chatterbox_sources.py` | PASS, 136 tests |
| G4-ts-format | `pnpm.cmd format:check:typescript` | PASS |
| G4-ts-lint | `pnpm.cmd lint:typescript` | PASS |
| G4-ts-types | `pnpm.cmd --filter @voxleaf/desktop typecheck` | PASS |
| G4-py-format-final | `pnpm.cmd format:check:python` | PASS, 186 files |
| G4-py-lint-final | `pnpm.cmd lint:python` | PASS |
| G4-py-types-final | `pnpm.cmd typecheck:python` | PASS, 182 files |
| G5-browser-r2 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep '"SPM-|MAF-11|EFC-07|SAF-09"'` | PASS, 6 cases; configured build hooks retained |
| G6-core | `pnpm.cmd package:piper-core:check` | PASS, current verification boundary |
| G7-Piper | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | PASS, one current native arm and verified restoration |
| G8-evidence / G8-diff | `pnpm.cmd check:evidence`; `git diff --check` | PASS |
| G6-build | `pnpm.cmd build:desktop` | PASS, one build with Tauri renderer hook |

The G5 receipt contains the actual PowerShell spelling with literal double quotes
inside the single-quoted argument; these preserve the grep expression through
pnpm's Windows shell. This is the same six-case selector specified by the plan.

Retained failed attempts: G2-desktop first pass had 351 passes/3 failures from
old expectations that no status survives a rejected action. G3-packaging first
pass had 131 passes/2 failures because old injections matched staged ZIP renames;
they now target final folder promotion. G4-py-lint/types first passes rejected
a long test line and an overload suppression annotation; both corrected.
G5-browser failed before build/tests because cmd interpreted unquoted pipes;
G5-browser-r2 is its single infrastructure retry with corrected shell quoting.
G3-r2 passed 133 tests before an additional sole-part-backup retry correction;
final G3 and Python static leaves were renewed for that code/test change.
No failed aggregate was relabeled as passing or replaced with a green subset.

## Artifact reuse and evidence scope

Original MAF F-Python-01/F-Core-01 and RIA G2-desktop-final/G6-core/G7-Piper-r2
receipts were retrieved. They provide context and reusable fixtures only.
No historical behavioral PASS, native result, binary or timing accepts this patch.
Shared/EPUB exports were rebuilt because complete preparation reuse was not proven.

The existing Piper payload is reused as an artifact: all 2,024 files including
its manifest match the RIA retained inventory by membership, size and SHA-256.
The runtime source closure, its membership, recipe, authority and locks are
unchanged (26 tracked inputs in `core-artifact-reuse.json` and
`core-source-membership.json`). Builders and the packaging helper tree are excluded
from the runtime; no inference/model payload changes were introduced. Current
G6-core checks archive/evidence/tree against current source and runtime authority.

Within this task, later Python-only changes do not consume or invalidate the
accepted desktop/Chromium renderer or native binary. Receipts bind full source
inventories and exports; final comparisons must enumerate differences and confirm
that they lie outside each retained gate's consumed closure. The installed-input
capture binds 24,009 entries across dependencies, toolchain and browser assets.
Independent review must assess any retained gate against these original receipts.
No Rust, GPU, full EPUB, full Python/TS aggregate, six-rate campaign or new
installer matrix is claimed. Those are excluded by unchanged responsibilities.

## Cleanup, review and limits

G7-Piper passes with the new binary SHA-256
`6c768facc28063fe639fd481fafa16153b89faf6f93e9ca5defc4c4fa7c38a06`.
Quick/Prepared, pause/resume, seeking, chapter changes, settings and cancellation
pass; six created audio contexts close, retained/discarded units settle to zero,
external requests and generated audio files are zero. This is one Piper EN arm,
without the optional six-rate sweep or a broader performance/support claim.

The pre-mutation journal binds the exact original resource tree and recovery
sibling. It temporarily copies the verified core, verifies every payload entry,
and restores the original complete tree in finally. Before/after resource
inventories are identical and the recovery sibling is absent. PID, creation time
and executable observations show no newly owned processes; the scratch inventory
shows no new native roots. Pre-existing scratch remains untouched. The harness
uses an isolated WebView profile; no personal installation or firewall change
was performed. Raw restoration proof is `native-restoration.log` and
`G6-resources-before.json`/`G6-resources-after.json`.

G8 evidence retention and diff-whitespace checks pass. Installed dependency,
toolchain and browser inventories match before/after across all 24,009 entries.
Independent review remains pending at this ledger revision.
The canonical system topology, M005 boundary, runtime profiles, cancellation,
buffer limits and default ephemeral audio remain unchanged.

Pytest emits a pre-existing cache-write permission warning; tests execute and
pass. Vite emits its existing large-chunk advisory. Neither is a passing claim
for an omitted check. Multi-output promotion compensates ordinary reported errors;
it does not promise power-loss atomicity or support concurrent builds. A retained
backup alongside a target requires explicit inspection before retry.


## Independent R1 finding and final correction

[SPM-R1-20261101](review-R1.md) requests F1, a silent fallback startup rejection
while a replacement publication is ready but narration handoff remains pending.
G1-F1-red reproduces it with mounted App/Settings, a deferred old-owner close and
an unavailable write. The callback now returns its boolean result and both
startup routes use the same local pending/error presentation. The test verifies
preserved Quick after failure and successful Prepared retry clearing feedback.
No shared or persisted contract was changed. The pre-approved conditional App
implementation/test allowance is activated.

This renderer change invalidates the first desktop, browser, binary and native
results for final acceptance. The one-build condition therefore no longer holds:
the original build and native arm remain preserved, and one replacement build
and native arm validate F1. Python/core responsibilities are unchanged.

| Current receipt | Command | Result |
| --- | --- | --- |
| G2-desktop-F1-formatted | Same six-suite G2 command above | PASS, 355 tests |
| G4-ts-format-R2 | `pnpm.cmd format:check:typescript` | PASS |
| G4-ts-lint-R2 | `pnpm.cmd lint:typescript` | PASS |
| G4-ts-types-R2 | `pnpm.cmd --filter @voxleaf/desktop typecheck` | PASS |
| G5-browser-F1 | Same quoted six-case G5 command above | PASS, 6 cases |
| G6-build-F1 | `pnpm.cmd build:desktop` | PASS, replacement binary |

Development failures remain retained: the first F1 typecheck found an unsupported
Testing Library `exact` option, and the subsequent formatting check requested
its one-line call layout. Both were corrected before the final successful G2/G4.
A receipt ID differing only by case collided on Windows and was rejected before
execution; its input snapshot was restored byte-for-byte from the same-revision
parallel receipt, verified against the original result's recorded SHA-256. No
result/output was overwritten or treated as new acceptance. Final gates use
unique IDs.

`R2-retained-evidence.json` compares the original G3-final, Python G4-final and
G6-core input manifests with current files. All differences are F1 desktop code,
Markdown, and (for G6-core only) Chatterbox maintainer code/tests that Piper does
not consume. Every original result/input hash is preserved. Installed entries
and relevant environment match between the initial and F1 capture; the new
`installed-F1-*` pair brackets renewed validation. The first native evidence
remains historical to R1; the F1 restoration record will supersede it below.


Final G7-Piper-F1 passes with binary SHA-256
`86aee8fcd5aa92db9a496efd8bbee8dd6bd6178821748bccf69fbe890a3db679`.
The final arm records zero external requests/generated audio files, five created
and closed audio contexts, zero retained/discarded units after cleanup, and no
stale playback. `native-F1-restoration.log` verifies no newly owned processes or
scratch roots. `G6-F1-resources-before.json` and `G6-F1-resources-after.json` match;
the original resource tree is restored and the exact recovery sibling is absent.
The installed F1 comparison also passes with 24,009 identical entries. In total,
two builds/two native arms ran; the second pair was required by R1's renderer fix.
G8-evidence-R2 and G8-diff-R2 pass. Independent
[SPM-R2-20261102](review-R2.md) approves the exact behavioral patch, resolves F1
and accepts the retained Python/core evidence. The separate
[archival assessment](review-R3.md) covers the final plan/index/report additions.
No acceptance blocker remains; no Git/publication action was performed.
