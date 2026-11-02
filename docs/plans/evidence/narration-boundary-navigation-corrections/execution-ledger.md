# BNC execution ledger

Task BNC-20261101. Execution authorized on 2026-11-01. Base/HEAD:
`69de1d9e450f6602015175ac38ffeba7ab9d9440`, branch
`codex/narration-boundary-navigation-plan`; initial worktree/index clean.
No commit, push, PR, merge or publication is authorized.

Local immutable receipts are under
`tmp/evidence/narration-boundary-navigation-corrections/run-01/`.
Review correction receipts use the separate sibling `run-02/`. The command table
and initial attempts below describe run-01; the review follow-up section identifies
which successful receipts accept the latest revision. Run-01 does not accept the
changed normalizer by itself.
All gates execute in local PowerShell outside the managed sandbox. Each receipt
records the command, HEAD, start/end, exit, source/config/lock membership hashes,
package exports and installed-input identity. Raw local inventories remain untracked.

## Gate decisions

| Gate | Classification | Reason |
| --- | --- | --- |
| G0 | EJECUTAR | Historical installed entries differ; rebuild pre-edit exports and after U2. Artifact reuse is not a behavioral PASS. |
| G1/G2 | EJECUTAR | New targeted regressions on original production. |
| G3/G4 | EJECUTAR | Changed normalizer/coordinator invalidate historical behavioral results. |
| G5 | EJECUTAR | Three selected Chromium journeys against current renderer. |
| G6 | EJECUTAR | Format, lint and both affected type checks. |
| G7 | EJECUTAR | Check existing Piper core and build current executable. |
| Piper runtime/voices | REUTILIZAR CON PRUEBA | G7-core current; complete staged membership and all 2,023 manifest entries verified. |
| G8 | EJECUTAR | One Piper EN native arm and verified cleanup. |
| G9 | EJECUTAR | Evidence guard, whitespace, links, final identities and independent review. |
| Extra historical matrices/harness aggregate | NO APLICA | Unchanged owners; use the plan's impact exclusions, not historical PASS reuse. |

No historical behavioral PASS is reused. Existing synthetic fixtures, collectors,
selected runner commands and resource-preservation procedure are reused. Historical
VUC/RIA/PSC receipts retain their original scope.

## Commands

| Gate | Exact host command | Final result |
| --- | --- | --- |
| G0 | `pnpm.cmd build:packages` | PASS pre-edit and current-r2 |
| G1 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts -t BNC-` | Expected FAIL before U2 |
| G2 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t BNC-01` | Expected FAIL before U1; both attempts retained |
| G3 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts` | PASS 257/257, r2 |
| G4 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts` | PASS 194/194 |
| G5 | `pnpm.cmd --% test:browser reader-narration-bugfixes.smoke.spec.ts --grep "BNC-01\|VCA-06/09\|RIA-03"` | PASS 3/3, r2; table escapes are not command characters |
| G6-format | `pnpm.cmd format:check:typescript` | PASS |
| G6-lint | `pnpm.cmd lint:typescript` | PASS |
| G6-epub-types | `pnpm.cmd --filter @voxleaf/epub typecheck` | PASS |
| G6-desktop-types | `pnpm.cmd --filter @voxleaf/desktop typecheck` | PASS |
| G7-core | `pnpm.cmd package:piper-core:check` | PASS, current |
| G7-build | `pnpm.cmd build:desktop` | PASS, current executable |
| G8 | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | PASS, one arm; resource cycle exit 0 |
| G9 | `pnpm.cmd check:evidence`; `git diff --check`; local relative-link inspection | PASS; 57 links before closeout |

Preparation additionally applies configured Prettier through
`pnpm.cmd exec prettier --write` to the seven changed TypeScript files only
(`P-format`, `P-format-browser` record their exact allowlists). No repository-wide
format write, root test/build aggregate, full browser sweep or extra model arm ran.

## Attempts and dispositions

- G0-preedit: PASS, package build on original production.
- G1-red: expected FAIL, 20 failed / 4 passed / 224 skipped. All four EPUB
  findings reproduce through the public Piper path, including the BNC-05
  internal thousands split. Positive Celsius punctuation and ambiguous controls
  already pass and remain unchanged. This is executed evidence, replacing only
  the plan's previously static status.
- G2-red: expected FAIL, 4 failed / 1 passed / 150 skipped. Rejected restart
  never publishes settlement; paused cleanup failure fabricates paused intent.
  Stop control passes. G2-red-r2 adds direct real-persistence evidence: both
  availability cases reject manual saves and retain published playing/settling.
  Its Stop assertion accidentally schedules the same locator twice; the first
  succeeds, the duplicate is rejected as unchanged. Removed only the duplicate;
  retained the failed receipt (5 failed), without treating it as another defect.
- G0-current: FAIL, new lookaround default inferred literal type `128` rather
  than `number`. Added the explicit parameter type. G0-current-r2: PASS.
- G4-desktop: PASS, 194/194 in the four selected groups.
- G3-epub: FAIL, 256 passed / 1 failed. The new boundary fixture expected a
  retained terminal space and ignored the bounded suffix check's uncertainty.
  Replaced that delimiter with punctuation to isolate logical adjacency at the
  exact limit. G3-epub-r2: PASS, 257/257; no separate green subset rerun.
- G5-browser: FAIL, 2 passed / 1 failed. The new test selected a historical
  prefetch entry from the first service, not the second service's explicit start.
  Captured the preparation count before Play and inspected only the new entries.
  Original trace, screenshot and error context retained. G5-browser-r2: PASS,
  exactly 3/3 selected cases, default retries/timeouts. Existing VCA viewport
  remains unchanged; the new BNC case uses the default viewport.
- G6-format, G6-lint, G6-epub-types, G6-desktop-types: PASS, each exit 0.
- G7-core and G7-build: PASS, existing package current and current executable built.
- G8-Piper and G8-resource-cycle: PASS, exit 0. G9 passes; independent review pending.

Original VUC G3, RIA desktop/browser/harness/core/native receipt digests and
their original input/installed-before digests match (`historical-receipts.json`).
The historical-to-current installed delta is only Chromium's `debug.log`;
the initial strict comparison remains false. G0 was rebuilt before that delta
was classified; no historical acceptance result is relabeled or reused.

## Implementation boundary

Production remains confined to the coordinator and mutable bilingual normalizer.
Successful start alone assigns playing. Rejected restart publishes inactive;
failed containment keeps its recovery/failure ownership and settles navigation.
Raw source spans and typed omissions remain intact. Logical context skips only
the three approved removable marks, uses the existing 128-code-point bound,
and preserves uncertain contexts. Numeric punctuation protection remains with
the matcher; scanner/packer, grammar tables, historical normalizers and corpora
are unchanged. New lookaround runs only after a raw form matches and stays
inside the existing per-source-token preparation work envelope.

## Native result and cleanup

The single Piper EN arm used the current 12,454,400-byte executable, SHA-256
`629ef74f9620135ed78868a2618941f03936f8c4d63293b925cca133bd998c5d`.
Quick command-to-audible: 5,754 ms; initial playable lead: 32,670 ms;
stable observation: 60,056 ms; underruns: 0. Prepared mode reached 60,878 ms
of playable audio; cancellation: 621 ms. Sixteen synchronized segment transitions
preserved valid ranges, focus and pause/resume; no stale playback was observed.
These are this host's observations, not general performance guarantees.

Cleanup reports zero retained/discarded units and generated audio files, zero
external requests, and six created/six closed audio contexts. The wrapper verified
unchanged executable bytes, no new owned process identities or scratch roots,
complete original resource membership/hashes restored, and backup absence.
Both pre-existing scratch directories were preserved. Current core bytes were
staged only for this run; no model/package regeneration or user-data cleanup ran.

Installed-before/after strict comparison passes: all 24,009 entries, tools,
libraries, browser bytes, environment and exclusions match. This run-01 candidate
was subsequently corrected under R1; final acceptance is recorded below.

## Current evidence identity and reuse proof

`current-evidence-comparison.json` binds each original successful receipt and
its input digest to current bytes. Complete package/renderer membership and
hashes, native binary/tool/WebView membership, installed entries and environment
match. The first comparison script falsely rejected ordering differences between
PowerShell dictionaries and objects; its original script is retained, and direct
membership/hash comparison showed no artifact drift. Sorting explicitly by the
path value corrected the inspector; no tested artifact or gate was changed.

G3's later differences are the desktop browser spec and Markdown only: its
explicit EPUB leaves import no desktop tests or Markdown. G4's later differences
are the browser spec, EPUB resource test and Markdown: Vite excludes browser
specs, G4's explicit leaves do not import EPUB test source, and they consume the
identical built package exports. G5/G6 differ only in Markdown, which is outside
the configured renderer imports, test selectors, TypeScript inputs, ESLint and
Prettier globs. G7/G8 differ only in execution documentation. No source, tool,
fixture, configuration, lock, consumed artifact or environment changed for those
successful gates. New file membership consists only of evidence Markdown.
G9 is renewed for documentation changes. No partial result from a failed
aggregate is reused as a PASS.

## Independent review follow-up

[BNC-R1-20261101](review-reports.md) requested changes for two remaining BNC-02
combinations: an immediately adjacent foreign-language removable mark, and a mark
inside fixed `EUR`. Before correcting production, run-01 `R1-red` reproduced both
through eight unit/public cases (8 failed). These are now executed reproductions,
not assertions that the reviewer ran tests.

The normalizer now treats an immediately adjacent removable foreign prose mark
as uncertain without scanning across that language boundary. Fixed EUR suffix
lookahead uses the remaining 128-point budget for U/R, including approved marks;
unknown context preserves the number. Added source-mapping/public profile/batch
controls for both sides and both suffix positions, plus EUR at/over-bound checks.
No additional production owner, parser, grammar entry or resource limit changed.

Run-02 rebuilt EPUB: G0 passes. Renewed G3 passes 265/265, G4 194/194, G5 exactly
3/3; format, lint, EPUB types and desktop build pass. Native integration/cleanup
also pass; G9 is renewed for the current documentation before the next review.

G6 desktop types and G7 core integrity are REUTILIZAR CON PRUEBA from run-01.
`run-02/reuse-proof.json` records complete comparison of installed environment,
desktop source/tests/config and transitive fixture inputs, declaration membership
and bytes, Python/release inputs, full core payload membership/bytes, package ZIP
against the unchanged integrity authority, and native tools. The desktop checker
includes desktop tests but does not import the changed EPUB implementation/tests;
its package interface is the unchanged declarations. The fixed EPUB test-support
fixture imports only the unchanged ZIP dependency. Core integrity has no TypeScript
or narration dependency; its successful original check validates the same retained
ZIP and package bytes against the identical recorded authority. No historical
pre-task behavioral result is reused.

Run-02 native acceptance is bound to executable SHA-256
`c6790abc9b27bae07ab4d56a819a7b17c58cfe25d4ad3921b8fb31c530b7e8a4`
(12,454,400 bytes), superseding the run-01 binary for final acceptance. Quick
command-to-audible was 6,185 ms with 37,060 ms playable lead; stable observation
60,003 ms, zero underruns. Prepared lead was 60,704 ms, cancellation 774 ms,
17 synchronized transitions, no stale playback and valid ranges. Cleanup again
verified zero retained/discarded units/audio files/external requests, six of six
contexts closed, original resource membership/bytes restored, backup absent and
no new owned processes or scratch. Installed-before/after strict comparison
again passes for all 24,009 entries and environment. All attempts remain retained.

## Acceptance and archival

BNC-R2-20261101 independently approves all five findings and both R1 corrections,
including the two reused gates and current native cleanup. No blocking uncertainty
remains in scope. The plan is archived only after that approval; completion indexes
are updated. Documentation-only archival does not alter any consumed runtime,
test, fixture, dependency, artifact or environment input; the recorded individual
gates retain their original identities. G9 is renewed for the final document set
and a fresh immutable archival assessment is retained in [review reports](review-reports.md).
The worktree is intentionally uncommitted with an empty index and unchanged HEAD.
