# Executed validation commands

All listed commands ran from local PowerShell outside the sandbox. Node 24.18.0 and pnpm 11.15.1 were selected through process-local PATH/offline Corepack. Full input identities and logs reside under the run root named in the ledger. Final R2-G7 is recorded separately in that root after freezing this document.

| Attempt | Exit | Command |
| --- | --- | --- |
| C13-corrected-RED | 1 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts -t EBC-C13` |
| C13-shared-RED | 1 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts -t EBC-C13` |
| C15-before | 0 | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "preserves one canonical passage"` |
| C15-format | 0 | `pnpm.cmd exec prettier --write apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts` |
| C15-original-build-completion | 0 | `pnpm.cmd build:packages` |
| C15-original-build-geometry2 | 0 | `pnpm.cmd build:packages` |
| C15-original-build | 0 | `pnpm.cmd build:packages` |
| C15-original-expanded-completion | 0 | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "preserves one canonical passage"` |
| C15-original-expanded-geometry2 | 1 | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "preserves one canonical passage"` |
| C15-original-expanded | 1 | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "preserves one canonical passage"` |
| final-format | 0 | `pnpm.cmd exec prettier --write packages/epub/src/public/open-epub-publication.ts apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts` |
| format | 0 | `pnpm.cmd exec prettier --write packages/epub/src/document/xhtml-projector.ts packages/epub/src/document/xhtml-projector.test.ts packages/epub/src/xml/xml-event-reader.ts packages/epub/src/public/open-epub-publication.ts packages/epub/src/public/open-epub-publication.test.ts packages/epub/src/public/epub-result.ts apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts` |
| G0-final | 0 | `pnpm.cmd build:packages` |
| G0-ready | 0 | `pnpm.cmd build:packages` |
| G0-restored | 0 | `pnpm.cmd build:packages` |
| G2-final | 0 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/xml/xml-event-reader.test.ts src/security/processing-budget.test.ts src/public/open-epub-publication.test.ts src/resource/opened-publication.test.ts src/locator/locator-index.test.ts src/narration/narration-source-projector.test.ts` |
| G2 | 0 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/xml/xml-event-reader.test.ts src/security/processing-budget.test.ts src/public/open-epub-publication.test.ts src/resource/opened-publication.test.ts src/locator/locator-index.test.ts src/narration/narration-source-projector.test.ts` |
| G3-final | 0 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/publication/publication-session.test.ts src/publication/local-publication-open.test.ts src/reader/active-visual-locator.test.ts src/reader/reader-reflow-restoration.test.ts src/reader/ReaderPublication.test.tsx src/persistence/reader-position-save-coordinator.test.ts` |
| G3 | 0 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/publication/publication-session.test.ts src/publication/local-publication-open.test.ts src/reader/active-visual-locator.test.ts src/reader/reader-reflow-restoration.test.ts src/reader/ReaderPublication.test.tsx src/persistence/reader-position-save-coordinator.test.ts` |
| G4-final | 0 | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "preserves one canonical passage"` |
| G5-final | 0 | `pnpm.cmd format:check:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/epub typecheck; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/desktop typecheck` |
| G5 | 0 | `pnpm.cmd format:check:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/epub typecheck; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/desktop typecheck` |
| G6 | 0 | `pnpm.cmd test:native-startup` |
| G7-fixed | 0 | `pnpm.cmd check:evidence; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; git diff --check` |
| G7 | 1 | `pnpm.cmd check:evidence; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd test:evidence; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; git diff --check` |
| GREEN | 0 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/public/open-epub-publication.test.ts -t EBC-` |
| R1-GREEN | 0 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts -t EBC-C17` |
| R1-RED | 1 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts -t EBC-C17` |
| R2-format-fixed | 0 | `pnpm.cmd exec prettier --write packages/epub/src/public/open-epub-publication.test.ts` |
| R2-format | 0 | `pnpm.cmd exec prettier --write packages/epub/src/public/open-epub-publication.ts packages/epub/src/public/open-epub-publication.test.ts` |
| R2-G0 | 0 | `pnpm.cmd build:packages` |
| R2-G2 | 0 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/xml/xml-event-reader.test.ts src/security/processing-budget.test.ts src/public/open-epub-publication.test.ts src/resource/opened-publication.test.ts src/locator/locator-index.test.ts src/narration/narration-source-projector.test.ts` |
| R2-G3 | 0 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/publication/publication-session.test.ts src/publication/local-publication-open.test.ts src/reader/active-visual-locator.test.ts src/reader/reader-reflow-restoration.test.ts src/reader/ReaderPublication.test.tsx src/persistence/reader-position-save-coordinator.test.ts` |
| R2-G4 | 0 | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "preserves one canonical passage"` |
| R2-G5 | 0 | `pnpm.cmd format:check:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/epub typecheck; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/desktop typecheck` |
| R2-G6 | 0 | `pnpm.cmd test:native-startup` |
| R2-types-fixed | 0 | `pnpm.cmd --filter @voxleaf/epub typecheck` |
| R2-types-preflight | 1 | `pnpm.cmd --filter @voxleaf/epub typecheck` |
| RED | 1 | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/public/open-epub-publication.test.ts -t EBC-` |
