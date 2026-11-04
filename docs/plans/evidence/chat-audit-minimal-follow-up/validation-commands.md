# CAF literal validation commands

Every entry below was executed in local PowerShell outside the managed sandbox. Exit 0 is command success, not an independent acceptance verdict. Expected red reproductions and superseded failures remain immutable. Source, export, tool-version and output receipts use the same ID in the ignored execution root. No historical runtime result is represented as a fresh run.

Tool versions: Node 24.20.0, pnpm 11.15.1 (offline Corepack), uv 0.11.29, Python 3.12.10 and Rust/Cargo 1.97.1. See the [ledger](execution-ledger.md) for outcomes, failures, input-equivalence decisions, native journals and scope omissions.

## U7-red

UTC: 11/03/2026 22:42:17 to 11/03/2026 22:42:20. Exit: **1**.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/pcm-playback.test.ts -t CAF-R7.3
```

## U7-green

UTC: 11/03/2026 22:42:50 to 11/03/2026 22:42:50. Exit: **255**.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/pcm-playback.test.ts -t "CAF-R7.3|RIA-03"
```

## U7-green-selector-retry

UTC: 11/03/2026 22:43:02 to 11/03/2026 22:43:04. Exit: **0**.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/pcm-playback.test.ts -t CAF-R7.3
```

## U1-red

UTC: 11/03/2026 22:44:15 to 11/03/2026 22:44:17. Exit: **1**.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts src/navigation/navigation-document.test.ts src/narration/narration-normalizer.test.ts -t CAF-
```

## U1-green

UTC: 11/03/2026 22:44:52 to 11/03/2026 22:44:53. Exit: **0**.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts src/navigation/navigation-document.test.ts src/narration/narration-normalizer.test.ts -t CAF-
```

## U1-close-red

UTC: 11/03/2026 22:45:26 to 11/03/2026 22:45:27. Exit: **1**.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/archive/archive-inventory.test.ts -t CAF-
```

## U5-piper-red

UTC: 11/03/2026 22:46:03 to 11/03/2026 22:46:04. Exit: **1**.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_piper_adapter.py -k caf_r1_1
```

## U5-protocol-python-red

UTC: 11/03/2026 22:47:14 to 11/03/2026 22:47:15. Exit: **1**.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_protocol.py -k caf_r4_2
```

## U5-protocol-rust-red

UTC: 11/03/2026 22:47:19 to 11/03/2026 22:47:39. Exit: **101**.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml caf_r4_2 -- --nocapture
```

## U2-client-red

UTC: 11/03/2026 22:48:23 to 11/03/2026 22:48:24. Exit: **1**.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/process-client.test.ts -t CAF-
```

## U2-native-red

UTC: 11/03/2026 22:49:37 to 11/03/2026 22:49:43. Exit: **101**.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml caf_r5 -- --nocapture
```

## U4-red

UTC: 11/03/2026 22:51:03 to 11/03/2026 22:51:10. Exit: **101**.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests::caf_ -- --nocapture
```

## U6-driver-red

UTC: 11/03/2026 22:52:05 to 11/03/2026 22:52:06. Exit: **1**.

```powershell
node --test --test-name-pattern=CAF- apps/desktop/scripts/native-webdriver-client.node-test.mjs
```

## U6-recovery-red

UTC: 11/03/2026 22:52:06 to 11/03/2026 22:52:07. Exit: **1**.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_release_core.py -k caf_r4_3
```

## U6-firewall-red

UTC: 11/03/2026 22:53:06 to 11/03/2026 22:53:10. Exit: **1**.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_preflight.py -k caf_r3_5
```

## U6-signature-red

UTC: 11/03/2026 22:53:58 to 11/03/2026 22:53:59. Exit: **1**.

```powershell
node --test --test-name-pattern=CAF- apps/desktop/scripts/windows-release.node-test.mjs
```

## U3-preferences-red

UTC: 11/03/2026 22:54:57 to 11/03/2026 22:54:58. Exit: **1**.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/persistence/narration-language-preference.test.ts src/persistence/narration-start-preference.test.ts src/persistence/narration-playback-preference.test.ts -t CAF-
```

## U3-removal-red

UTC: 11/03/2026 22:55:23 to 11/03/2026 22:55:25. Exit: **1**.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/OptionalChatterboxControls.test.tsx -t CAF-
```

## U3-reader-red

UTC: 11/03/2026 22:59:19 to 11/03/2026 22:59:23. Exit: **1**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/tts/product-narration-coordinator.test.ts src/App.test.tsx -t CAF-
```

## U3-reinstall-red

UTC: 11/03/2026 23:00:59 to 11/03/2026 23:01:01. Exit: **1**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx -t CAF-R3.1
```

## G1-ts-lint

UTC: 11/03/2026 23:02:07 to 11/03/2026 23:02:18. Exit: **1**.

```powershell
pnpm lint:typescript
```

## G1-python-lint

UTC: 11/03/2026 23:02:20 to 11/03/2026 23:02:20. Exit: **1**.

```powershell
pnpm lint:python
```

## G1-python-types

UTC: 11/03/2026 23:02:22 to 11/03/2026 23:02:23. Exit: **0**.

```powershell
pnpm typecheck:python
```

## G4-python

UTC: 11/03/2026 23:02:27 to 11/03/2026 23:02:33. Exit: **0**.

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_piper_adapter.py services/tts/tests/test_protocol.py services/tts/tests/test_service.py services/tts/tests/test_benchmark_preflight.py services/tts/tests/test_release_core.py
```

## G4-node

UTC: 11/03/2026 23:02:37 to 11/03/2026 23:03:34. Exit: **1**.

```powershell
node --test apps/desktop/scripts/native-webdriver-client.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs
```

## G0-exports

UTC: 11/03/2026 23:03:41 to 11/03/2026 23:03:42. Exit: **0**.

```powershell
pnpm build:packages
```

## G1-desktop-types

UTC: 11/03/2026 23:03:58 to 11/03/2026 23:04:01. Exit: **2**.

```powershell
pnpm --filter @voxleaf/desktop typecheck
```

## G5-native

UTC: 11/03/2026 23:04:06 to 11/03/2026 23:04:16. Exit: **101**.

```powershell
pnpm test:rust
```

## G3-desktop

UTC: 11/03/2026 23:04:19 to 11/03/2026 23:04:25. Exit: **1**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/HardwareCompatibilityControls.test.tsx src/tts/process-client.test.ts src/tts/product-narration-coordinator.test.ts src/persistence/narration-language-preference.test.ts src/persistence/narration-start-preference.test.ts src/persistence/narration-playback-preference.test.ts src/persistence/reader-position-save-coordinator.test.ts src/persistence/reader-position-restore-coordinator.test.ts src/tts/pcm-playback.test.ts
```

## G3-corrections

UTC: 11/03/2026 23:05:03 to 11/03/2026 23:05:07. Exit: **0**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/tts/process-client.test.ts src/tts/OptionalChatterboxControls.test.tsx src/settings/ReaderSettingsDialog.test.tsx
```

## G2-shared

UTC: 11/03/2026 23:05:12 to 11/03/2026 23:05:13. Exit: **0**.

```powershell
pnpm --filter @voxleaf/shared exec vitest run src/primitives/identifiers.test.ts src/contracts/locator.test.ts src/contracts/narration-segment.test.ts src/contracts/tts-protocol-control.test.ts src/contracts/serialized-conformance.test.ts
```

## G2-epub

UTC: 11/03/2026 23:05:14 to 11/03/2026 23:05:56. Exit: **0**.

```powershell
pnpm --filter @voxleaf/epub exec vitest run src/archive/archive-inventory.test.ts src/public/open-epub-publication.test.ts src/resource/opened-publication.test.ts src/navigation/navigation-document.test.ts src/document/xhtml-projector.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source-projector.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
```

## G6-browser

UTC: 11/03/2026 23:09:07 to 11/03/2026 23:09:20. Exit: **1**.

```powershell
pnpm --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep CAF-
```

## G5-native-corrected

UTC: 11/03/2026 23:09:20 to 11/03/2026 23:09:44. Exit: **0**.

```powershell
pnpm test:rust
```

## U2-coordinator-race

UTC: 11/03/2026 23:10:56 to 11/03/2026 23:10:58. Exit: **0**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t CAF-R2.1
```

## G4-signature-corrected

UTC: 11/03/2026 23:11:00 to 11/03/2026 23:11:00. Exit: **0**.

```powershell
node --test --test-name-pattern=CAF-R1.5 apps/desktop/scripts/windows-release.node-test.mjs
```

## G1-ts-final

UTC: 11/03/2026 23:11:38 to 11/03/2026 23:11:44. Exit: **0**.

```powershell
pnpm lint:typescript
```

## G1-desktop-types-final

UTC: 11/03/2026 23:11:46 to 11/03/2026 23:11:49. Exit: **0**.

```powershell
pnpm --filter @voxleaf/desktop typecheck
```

## G6-reinstall-policy

UTC: 11/03/2026 23:11:49 to 11/03/2026 23:11:55. Exit: **0**.

```powershell
pnpm --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep CAF-2
```

## G1-rust-lint

UTC: 11/03/2026 23:12:22 to 11/03/2026 23:12:29. Exit: **101**.

```powershell
pnpm lint:rust
```

## G1-other-leaves

UTC: 11/03/2026 23:12:23 to 11/03/2026 23:12:40. Exit: **0**.

```powershell
pnpm --filter @voxleaf/shared generate:check; if ($LASTEXITCODE -eq 0) { pnpm --filter @voxleaf/shared typecheck }; if ($LASTEXITCODE -eq 0) { pnpm --filter @voxleaf/epub typecheck }; if ($LASTEXITCODE -eq 0) { pnpm format:check:python }; if ($LASTEXITCODE -eq 0) { pnpm lint:python }; if ($LASTEXITCODE -eq 0) { pnpm typecheck:python }; if ($LASTEXITCODE -eq 0) { pnpm format:check:rust }; if ($LASTEXITCODE -eq 0) { pnpm format:check:typescript }
```

## G1-rust-lint-final

UTC: 11/03/2026 23:12:55 to 11/03/2026 23:13:02. Exit: **0**.

```powershell
pnpm lint:rust
```

## G5-native-final

UTC: 11/03/2026 23:13:03 to 11/03/2026 23:13:21. Exit: **0**.

```powershell
pnpm test:rust
```

## G3-final

UTC: 11/03/2026 23:13:08 to 11/03/2026 23:13:15. Exit: **1**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/HardwareCompatibilityControls.test.tsx src/tts/process-client.test.ts src/tts/product-narration-coordinator.test.ts src/persistence/narration-language-preference.test.ts src/persistence/narration-start-preference.test.ts src/persistence/narration-playback-preference.test.ts src/persistence/reader-position-save-coordinator.test.ts src/persistence/reader-position-restore-coordinator.test.ts src/tts/pcm-playback.test.ts
```

## G4-python-final

UTC: 11/03/2026 23:13:19 to 11/03/2026 23:13:25. Exit: **0**.

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_piper_adapter.py services/tts/tests/test_protocol.py services/tts/tests/test_service.py services/tts/tests/test_benchmark_preflight.py services/tts/tests/test_release_core.py
```

## G3-App-owner-final

UTC: 11/03/2026 23:13:37 to 11/03/2026 23:13:41. Exit: **1**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx
```

## G3-App-stable-snapshot

UTC: 11/03/2026 23:14:21 to 11/03/2026 23:14:25. Exit: **0**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx
```

## G7-core-build

UTC: 11/03/2026 23:14:55 to 11/03/2026 23:15:55. Exit: **0**.

```powershell
pnpm package:piper-core:write-manifest
```

## G7-core-check

UTC: 11/03/2026 23:15:56 to 11/03/2026 23:16:03. Exit: **0**.

```powershell
pnpm package:piper-core:check
```

## G1-App-static

UTC: 11/03/2026 23:16:03 to 11/03/2026 23:16:09. Exit: **0**.

```powershell
pnpm exec eslint apps/desktop/src/App.test.tsx; if ($LASTEXITCODE -eq 0) { pnpm --filter @voxleaf/desktop typecheck }; if ($LASTEXITCODE -eq 0) { pnpm exec prettier --check apps/desktop/src/App.test.tsx }
```

## G4-node-final

UTC: 11/03/2026 23:16:10 to 11/03/2026 23:17:04. Exit: **0**.

```powershell
node --test apps/desktop/scripts/native-webdriver-client.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs
```

## G2-final

UTC: 11/03/2026 23:16:15 to 11/03/2026 23:16:57. Exit: **0**.

```powershell
pnpm --filter @voxleaf/shared exec vitest run src/primitives/identifiers.test.ts src/contracts/locator.test.ts src/contracts/narration-segment.test.ts src/contracts/tts-protocol-control.test.ts src/contracts/serialized-conformance.test.ts; if ($LASTEXITCODE -eq 0) { pnpm --filter @voxleaf/epub exec vitest run src/archive/archive-inventory.test.ts src/public/open-epub-publication.test.ts src/resource/opened-publication.test.ts src/navigation/navigation-document.test.ts src/document/xhtml-projector.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source-projector.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts }
```

## G5-current-core

UTC: 11/03/2026 23:16:54 to 11/03/2026 23:17:09. Exit: **0**.

```powershell
pnpm test:rust
```

## G8-build

UTC: 11/03/2026 23:17:10 to 11/03/2026 23:17:43. Exit: **0**.

```powershell
pnpm build:desktop
```

## G8-Piper

UTC: 11/03/2026 23:18:29 to 11/03/2026 23:20:25. Exit: **0**.

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en
```

## G3-App-exact

UTC: 11/03/2026 23:19:37 to 11/03/2026 23:19:42. Exit: **0**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx
```

## G6-exact

UTC: 11/03/2026 23:19:43 to 11/03/2026 23:19:50. Exit: **0**.

```powershell
pnpm --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep CAF-
```

## G5-staging-controls

UTC: 11/03/2026 23:20:46 to 11/03/2026 23:21:02. Exit: **0**.

```powershell
pnpm test:rust
```

## G1-rust-exact

UTC: 11/03/2026 23:21:03 to 11/03/2026 23:21:09. Exit: **0**.

```powershell
pnpm lint:rust; if ($LASTEXITCODE -eq 0) { pnpm format:check:rust }
```

## G8-F08

UTC: 11/03/2026 23:23:48 to 11/03/2026 23:23:52. Exit: **0**.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement -- --exact --ignored --nocapture --test-threads=1
```

## G9-local-admission

UTC: 11/03/2026 23:24:11 to 11/03/2026 23:36:10. Exit: **0**.

```powershell
pnpm.cmd test:chatterbox:v7:local-admission
```

## G9-format

UTC: 11/03/2026 23:27:29 to 11/03/2026 23:27:36. Exit: **0**.

```powershell
pnpm format:check:typescript
```

## G9-review-guards

UTC: 11/03/2026 23:28:03 to 11/03/2026 23:28:04. Exit: **0**.

```powershell
pnpm.cmd check:evidence; if ($LASTEXITCODE -eq 0) { git diff --check }
```

## G3-App-review-R1

UTC: 11/03/2026 23:33:59 to 11/03/2026 23:34:04. Exit: **0**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx
```

## G1-App-review-R1

UTC: 11/03/2026 23:34:17 to 11/03/2026 23:34:28. Exit: **0**.

```powershell
pnpm exec prettier --write apps/desktop/src/App.test.tsx; if ($LASTEXITCODE -eq 0) { pnpm exec eslint apps/desktop/src/App.test.tsx }; if ($LASTEXITCODE -eq 0) { pnpm --filter @voxleaf/desktop typecheck }; if ($LASTEXITCODE -eq 0) { pnpm exec prettier --check apps/desktop/src/App.test.tsx }
```

## G3-App-review-exact

UTC: 11/03/2026 23:35:17 to 11/03/2026 23:35:22. Exit: **0**.

```powershell
pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx
```

## G1-App-review-exact

UTC: 11/03/2026 23:35:44 to 11/03/2026 23:35:47. Exit: **0**.

```powershell
pnpm exec eslint apps/desktop/src/App.test.tsx; if ($LASTEXITCODE -eq 0) { pnpm --filter @voxleaf/desktop typecheck }; if ($LASTEXITCODE -eq 0) { pnpm exec prettier --check apps/desktop/src/App.test.tsx }
```

## G9-R2-guards

UTC: 11/03/2026 23:37:40 to 11/03/2026 23:37:40. Exit: **0**.

```powershell
pnpm.cmd check:evidence; if ($LASTEXITCODE -eq 0) { git diff --check }
```
