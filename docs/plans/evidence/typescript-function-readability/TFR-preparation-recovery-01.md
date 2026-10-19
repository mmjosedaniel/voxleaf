# TFR preparation recovery

Record ID: TFR-PREP-RECOVERY-20261019-01.
Director record of the configured Sol auditor's read-only findings and bounded
preparation decisions. This is not a baseline or runtime acceptance report.
HEAD: `2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`.

## Vitest

pnpm 11.15.1's optimistic repeat-install path returned before repairing stale
executable metadata, including with `--force`. The explicitly revised command
`pnpm.cmd install --frozen-lockfile --ignore-scripts --force --no-optimistic-repeat-install`
reconstructed 290 packages in 6.867 seconds without tracked manifest/lock drift.
Three obsolete desktop-local Vitest launchers, no longer owned by that importer,
were archived with hashes and removed by exact path. The root-owned executable
remained available. No launcher was hand-edited. Receipts are under ignored
`tmp/evidence/typescript-function-readability/TFR-PREP-03/`.

## Chatterbox isolation

The first UAC launch was cancelled before mutation. Following explicit user
approval, the second created the exact installed interpreter's outbound block,
named `VoxLeaf-TFR-20261019-installed-chatterbox`. All eight existing benchmark
rules were preserved. The validator independently checked the effective rule.
The recovery journal and Create/Remove script are in PREP-03. Final removal and
independent restoration verification remain mandatory; this record does not
claim that campaign cleanup has occurred.

## Piper preparation

The baseline's first Piper Spanish arm timed out awaiting native availability,
before inference. The adjacent ignored package still carried ONNX Runtime 1.30
and an obsolete manifest while current frozen authority requires 1.31.
The ordinary configured build `pnpm.cmd package:piper-core` failed after
27.971 seconds with `piper-core-runtime-manifest-stale`. Its atomic staging
preserved the previous output and removed partial staging. The failure and
unchanged authorities are retained in PREP-04; no write-manifest command ran.

The auditor recovered expected RECORD bytes from the accepted archive. The
only differences in 1,941 installed site files were four RECORD files whose
five generated Windows launcher hash fields differed: jsonschema, f2py,
numpy-config, onnxruntime_test and piper. All other RECORD lines matched;
the launchers themselves are not shipped. Installation-location sensitivity
is a hypothesis; the exact metadata-only difference is observed. No RECORD or
frozen authority was repaired manually.

The prior task retained its package at
`tmp/evidence/pr249-integration-20261018/voxleaf-piper-core-v1.zip`:

- SHA-256: `c6204d11d99ce395afece203bdc3f6fb804f394359a332f847b6ad3a48a65eba`.
- Archive bytes: 213,923,103. Installed bytes: 306,740,365.
- Exactly 2,024 expected entries; every size/hash and embedded manifest matches
  current authority, with no duplicates, missing or extra entries.
- Its retained adjacent package tree matches all entries and has no reparse
  members. The auditor separately verified its manifest bytes before restoration.
- Retained source/runtime manifests, package evidence and core lock are identical
  to current authority. All six model files and four downloaded inputs match
  the current source manifest.
- Comparing accepted commit `bd1e9e71d745784b56f140c4ed384eb76d5daf2b` with
  current HEAD finds no changes in LICENSE, TTS source, TTS project/lock, core
  release inputs or component inventory; their working-tree diff is also empty.
  Thirteen relevant retained review identities match current source hashes.

The director's bounded restoration journals and preserves the old ignored dist
directory, ZIP and native adjacent core directory, then copies the complete
retained payload and ZIP without hard links. The retained historical evidence
is untouched. The existing `package:piper-core:check` and Tauri release resource
mapping with `--no-bundle` are the assigned verification/materialization steps.
Raw journals, scripts and receipts reside under ignored
`tmp/evidence/typescript-function-readability/TFR-PREP-04/`.

Only prepared artifact bytes are reused. Historical runtime measurements are
not acceptance evidence. Current native and supported model gates remain
required, with their original retry budgets and independent validation.
