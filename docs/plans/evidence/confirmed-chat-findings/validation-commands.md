# Confirmed chat findings: executed command summary

All commands below ran from the repository root in local PowerShell outside the
managed automation sandbox, with Node 24.20.0 and pnpm 11.15.1 selected through
offline Corepack. Exit 0 is a successful command; acceptance, exact selected test
counts, failed attempts, input equivalence and restoration are explained in the
[execution ledger](execution-ledger.md). The root aggregate was not executed.

Each ID names immutable `-result.json`, `-inputs.json`, `-output.log` and artifact
receipts under ignored `tmp/evidence/confirmed-chat-findings/20261104-01/`.
Focused RED/fixture-correction receipts are retained separately under the U1-U6
prefixes referenced by the ledger. This table records actual invocations rather
than presenting planned commands as runs.

## U1-build-exports

Exit 0; 1.64 seconds.

```powershell
pnpm.cmd build:packages
```

## U3-generate

Exit 0; 0.84 seconds.

```powershell
pnpm.cmd --filter @voxleaf/shared generate
```

## U3-build-exports

Exit 0; 1.39 seconds.

```powershell
pnpm.cmd build:packages
```

## G0-generated-check

Exit 0; 0.89 seconds.

```powershell
pnpm.cmd --filter @voxleaf/shared generate:check
```

## G2-shared

Exit 0; 1.08 seconds.

```powershell
pnpm.cmd --filter @voxleaf/shared exec vitest run src/primitives/identifiers.test.ts src/contracts/serialized-conformance.test.ts src/contracts/tts-protocol-control.test.ts
```

## G2-epub

Exit 0; 41.52 seconds.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-work-controller.test.ts
```

## G2-epub-resource-r2

Exit 0; 2.04 seconds.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-resource-bounds.test.ts
```

## G3-desktop-final

Exit 0; 5.34 seconds.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/settings/narration-settings-actions.test.ts src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/product-narration-presentation.test.ts src/tts/playback-transition-policy.test.ts src/tts/pcm-playback.test.ts src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/tts/snapshot-subscription-hooks.test.tsx src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts
```

## G4-python

Exit 0; 7.18 seconds.

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_protocol.py services/tts/tests/test_service.py services/tts/tests/test_benchmark_dual_worker_runtime.py services/tts/tests/test_benchmark_isolation.py
```

## G4-python-r2

Exit 0; 2.53 seconds.

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_protocol.py services/tts/tests/test_benchmark_dual_worker_runtime.py
```

## G4-protocol-r3

Exit 0; 0.79 seconds.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_protocol.py
```

## G4-node

Exit 0; 62.28 seconds.

```powershell
node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/native-smoke.node-test.mjs
```

## G4-windows-r2

Exit 0; 60.79 seconds.

```powershell
node --test apps/desktop/scripts/windows-release.node-test.mjs
```

## G4-windows-manifest-r3

Exit 0; 0.22 seconds.

```powershell
node --test --test-name-pattern "content-safe evidence distinguishes unsigned local and signed public gates" apps/desktop/scripts/windows-release.node-test.mjs
```

## G6-browser-correction

Exit 0; 10.13 seconds.

```powershell
pnpm.cmd --% --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep "CCF-C02|CCF-C07/C09/C20"
```

## G6-browser-remainder

Exit 0; 6.72 seconds.

```powershell
pnpm.cmd --% --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep "CCF-C12|CCF-C08|R7-04|MAF-07"
```

## G7-shared-types

Exit 0; 1.75 seconds.

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
```

## G7-epub-types-r2

Exit 0; 2.47 seconds.

```powershell
pnpm.cmd --filter @voxleaf/epub typecheck
```

## G7-typescript-final

Exit 0; 31.72 seconds.

```powershell
pnpm.cmd format:check:typescript && pnpm.cmd lint:typescript && pnpm.cmd --filter @voxleaf/desktop typecheck
```

## G7-python-final

Exit 0; 1.72 seconds.

```powershell
pnpm.cmd run format:check:python && pnpm.cmd run lint:python && pnpm.cmd run typecheck:python
```

## G7-rust-format

Exit 0; 0.79 seconds.

```powershell
pnpm.cmd format:check:rust
```

## G5-G7-rust-final

Exit 0; 28.41 seconds.

```powershell
pnpm.cmd test:rust && pnpm.cmd lint:rust
```

## G8-core-generate

Exit 0; 60.99 seconds.

```powershell
$env:UV_OFFLINE = "1"; pnpm.cmd package:piper-core:write-manifest
```

## G8-core-check

Exit 0; 7.29 seconds.

```powershell
pnpm.cmd package:piper-core:check
```

## G8-generated-format

Exit 0; 0.68 seconds.

```powershell
pnpm.cmd exec prettier --check services/tts/release/core/runtime-manifest-v1.json services/tts/release/core/core-package-evidence-v1.json
```

## G8-desktop-build

Exit 0; 33.22 seconds.

```powershell
pnpm.cmd build:desktop
```

## G9-Piper

Exit 0; 111.87 seconds.

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-playback-speeds
```

## G9-reader-corrections

Exit 1; 330.74 seconds.

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-reader-corrections
```

## G9-reader-corrections-r3

Exit 0; 144.36 seconds.

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-reader-corrections
```

## G10-local-admission

Exit 0; 726.71 seconds.

```powershell
pnpm.cmd test:chatterbox:v7:local-admission
```

## C08-review-red-reading-line

Exit 1; 4.69 seconds.

```powershell
pnpm.cmd --% --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "CCF-C08"
```

## C08-review-green

Exit 0; 5.63 seconds.

```powershell
pnpm.cmd --% --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "CCF-C08|R7-04|MAF-07"
```

## C08-review-format

Exit 0; 0.71 seconds.

```powershell
pnpm.cmd exec prettier --check apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts
```

## C08-review-lint

Exit 0; 6.64 seconds.

```powershell
pnpm.cmd exec eslint apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts
```

## C08-review-types

Exit 0; 5.57 seconds.

```powershell
pnpm.cmd --filter @voxleaf/desktop typecheck --tsBuildInfoFile ../../tmp/evidence/confirmed-chat-findings/20261104-01/C08-review-types.tsbuildinfo
```
