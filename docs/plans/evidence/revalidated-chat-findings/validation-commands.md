# RCF validation command register

All commands ran in local PowerShell outside the managed sandbox, from the repository root.
Base/HEAD: `887c5898d0712cf4053e845bbf286e8dadd3cf80`.
Raw immutable receipts, input manifests, logs and timing: `tmp/evidence/revalidated-chat-findings/20261103-01/`.
See the [execution ledger](execution-ledger.md) for counts, failures, coverage and artifact reuse.
G6-browser-current intentionally retains exit 1: nine journeys passed; only its corrected list assertion required G6-placement-final.

| Receipt | Command | Exit | UTC interval |
| --- | --- | ---: | --- |
| G1-exports-final | `pnpm.cmd build:packages` | 0 | 11/03/2026 17:49:10 — 11/03/2026 17:49:12 |
| G1-epub-types | `pnpm.cmd --filter @voxleaf/epub typecheck` | 0 | 11/03/2026 17:49:28 — 11/03/2026 17:49:32 |
| G1-current-format-check-typescript | `pnpm.cmd format:check:typescript` | 0 | 11/03/2026 18:01:32 — 11/03/2026 18:01:45 |
| G1-current-lint-typescript | `pnpm.cmd lint:typescript` | 0 | 11/03/2026 18:01:47 — 11/03/2026 18:01:54 |
| G1-current-desktop-types | `pnpm.cmd --filter @voxleaf/desktop typecheck` | 0 | 11/03/2026 18:02:11 — 11/03/2026 18:02:15 |
| G1-current-format-check-python | `pnpm.cmd format:check:python` | 0 | 11/03/2026 18:01:55 — 11/03/2026 18:01:56 |
| G1-current-lint-python | `pnpm.cmd lint:python` | 0 | 11/03/2026 18:01:58 — 11/03/2026 18:01:58 |
| G1-current-typecheck-python | `pnpm.cmd typecheck:python` | 0 | 11/03/2026 18:01:59 — 11/03/2026 18:02:00 |
| G1-current-format-check-rust | `pnpm.cmd format:check:rust` | 0 | 11/03/2026 18:02:02 — 11/03/2026 18:02:03 |
| G1-current-lint-rust | `pnpm.cmd lint:rust` | 0 | 11/03/2026 18:02:04 — 11/03/2026 18:02:10 |
| G2-epub-final | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/document/document-model.test.ts src/container/container-resolver.test.ts src/package/package-document.test.ts src/navigation/navigation-document.test.ts src/public/open-epub-publication.test.ts src/locator/locator-index.test.ts src/narration/narration-source-projector.test.ts src/narration/narration-source-window.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-resource-bounds.test.ts src/testing/narration-preparation-limits.test.ts src/integration/narration-preparation-matrix.test.ts` | 0 | 11/03/2026 17:51:32 — 11/03/2026 17:52:17 |
| G3-desktop-current | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/SemanticDocument.test.tsx src/reader/large-chapter-rendering.test.ts src/reader/segment-highlight-controller.test.tsx src/reader/semantic-dom-range-mapper.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/pcm-playback.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/product-narration-presentation.test.ts src/persistence/narration-playback-preference.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts src/tts/optional-chatterbox-client.test.ts` | 0 | 11/03/2026 18:01:33 — 11/03/2026 18:01:40 |
| G4-native-current | `pnpm.cmd test:rust` | 0 | 11/03/2026 18:01:31 — 11/03/2026 18:01:52 |
| G5-python-final | `uv run --project services/tts --locked pytest services/tts/tests/test_release_chatterbox.py services/tts/tests/test_chatterbox_sources.py services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_runtime.py` | 0 | 11/03/2026 17:51:33 — 11/03/2026 17:51:59 |
| G6-browser-current | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "RCF-\|RAF-02\|RAF-04\|NSL-03\|SPM-01/02\|MPA-01/03\|MPA-02\|NCC final"` | 1 | 11/03/2026 18:01:06 — 11/03/2026 18:02:32 |
| G6-placement-final | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep RCF-02/07/09` | 0 | 11/03/2026 18:03:20 — 11/03/2026 18:03:26 |
| G8-core-check | `pnpm.cmd package:piper-core:check` | 0 | 11/03/2026 18:02:03 — 11/03/2026 18:02:12 |
| G8-build | `pnpm.cmd build:desktop` | 0 | 11/03/2026 18:03:20 — 11/03/2026 18:03:56 |
| G8-Piper | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-playback-speeds` | 0 | 11/03/2026 18:04:54 — 11/03/2026 18:06:48 |
| G9-local-admission | `pnpm.cmd test:chatterbox:v7:local-admission` | 0 | 11/03/2026 18:07:12 — 11/03/2026 18:19:15 |
| G10-browser-static | `pnpm.cmd exec prettier --check apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts; if ($LASTEXITCODE -eq 0) { pnpm.cmd exec eslint apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts }` | 0 | 11/03/2026 18:07:19 — 11/03/2026 18:07:22 |
| G10-pre-review-evidence | `pnpm.cmd check:evidence` | 0 | 11/03/2026 18:13:04 — 11/03/2026 18:13:05 |
| G10-pre-review-diff | `git diff --check` | 0 | 11/03/2026 18:13:06 — 11/03/2026 18:13:06 |

Additional host inspections: `core-proof.ps1`, `native-readiness.ps1`, `piper-resources.ps1`,
`optional-admission.ps1`, `capture-installed.mjs`, `verify-evidence.ps1` and
`check-closeout.ps1` under the same ignored evidence root. Their commands, complete input
manifests and before/after cleanup journals are retained. Full installed comparison
initially rejected metadata/output differences; the consumed-input proof explains them.
The first source-equivalence comparison omitted the separately captured Python
`pyvenv.cfg` from current membership. Including it on both sides produced exact equality;
there was no changed Python source, fixture or environment file.

## R2 correction of RCF-R1-F1

All commands below ran outside sandbox in local PowerShell on the corrected playback inputs.
Unchanged G2/G4/G5/G9 results are retained only with the complete R2 equivalence proof.

| Receipt | Command | Exit | UTC interval |
| --- | --- | ---: | --- |
| R2-F1-focused | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts -t RCF-19` | 0 | 11/03/2026 18:30:03 — 11/03/2026 18:30:07 |
| R2-G1-typescript | `pnpm.cmd exec prettier --check apps/desktop/src/tts/pcm-playback.ts apps/desktop/src/tts/pcm-playback.test.ts apps/desktop/src/tts/product-narration-coordinator.test.ts; if($LASTEXITCODE -eq 0){pnpm.cmd lint:typescript}; if($LASTEXITCODE -eq 0){pnpm.cmd --filter @voxleaf/desktop typecheck}` | 0 | 11/03/2026 18:30:53 — 11/03/2026 18:31:12 |
| R2-G3-desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/SemanticDocument.test.tsx src/reader/large-chapter-rendering.test.ts src/reader/segment-highlight-controller.test.tsx src/reader/semantic-dom-range-mapper.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/pcm-playback.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/product-narration-presentation.test.ts src/persistence/narration-playback-preference.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts src/tts/optional-chatterbox-client.test.ts` | 0 | 11/03/2026 18:30:55 — 11/03/2026 18:31:00 |
| R2-G6-browser | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "RCF-\|RAF-02\|RAF-04\|NSL-03\|SPM-01/02\|MPA-01/03\|MPA-02\|NCC final"` | 0 | 11/03/2026 18:30:53 — 11/03/2026 18:32:14 |
| R2-G8-build | `pnpm.cmd build:desktop` | 0 | 11/03/2026 18:31:37 — 11/03/2026 18:32:18 |
| R2-G8-Piper | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-playback-speeds` | 0 | 11/03/2026 18:33:08 — 11/03/2026 18:35:00 |

## R3 correction of RCF-R2-F2

The real WebAudio backend is corrected; all affected playback gates are renewed outside sandbox.

| Receipt | Command | Exit | UTC interval |
| --- | --- | ---: | --- |
| R3-F2-focused | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/pcm-playback.test.ts -t RCF-19` | 0 | 11/03/2026 18:40:10 — 11/03/2026 18:40:12 |
| R3-G1-typescript | `pnpm.cmd exec prettier --check apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts apps/desktop/src/tts/pcm-playback.test.ts; if($LASTEXITCODE -eq 0){pnpm.cmd lint:typescript}; if($LASTEXITCODE -eq 0){pnpm.cmd --filter @voxleaf/desktop typecheck}` | 0 | 11/03/2026 18:41:08 — 11/03/2026 18:41:23 |
| R3-G3-desktop | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/SemanticDocument.test.tsx src/reader/large-chapter-rendering.test.ts src/reader/segment-highlight-controller.test.tsx src/reader/semantic-dom-range-mapper.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/pcm-playback.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/product-narration-presentation.test.ts src/persistence/narration-playback-preference.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts src/tts/optional-chatterbox-client.test.ts` | 0 | 11/03/2026 18:41:07 — 11/03/2026 18:41:13 |
| R3-G6-browser | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "RCF-\|RAF-02\|RAF-04\|NSL-03\|SPM-01/02\|MPA-01/03\|MPA-02\|NCC final"` | 0 | 11/03/2026 18:41:09 — 11/03/2026 18:42:30 |
| R3-G8-build | `pnpm.cmd build:desktop` | 0 | 11/03/2026 18:41:48 — 11/03/2026 18:42:21 |
| R3-G8-Piper | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-playback-speeds` | 0 | 11/03/2026 18:43:06 — 11/03/2026 18:45:01 |
