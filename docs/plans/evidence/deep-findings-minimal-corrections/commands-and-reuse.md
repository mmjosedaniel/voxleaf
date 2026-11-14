# Commands and evidence reuse

All commands below ran in normal local PowerShell outside the managed sandbox.
Base and HEAD: `fab1c9e186552515e828c33ce75e11628dda8300`.
The current patch is identified by the independent review manifest; no new Git mutation is authorized.

## Deterministic acceptance

The original composite command is preserved verbatim below. Only its explicitly named
passing scope is accepted; other leaves from that composite are superseded, not reused.
Original receipts, logs and before/after captures remain immutable under ignored
`tmp/evidence/deep-findings-minimal-corrections/`.

The final proof `reuse-final-01.json` checks original receipt/log/capture integrity,
consumed input membership and bytes, dependency/tool trees, generated exports and
the recorded host environment. All ten scopes match, with zero added, missing,
changed or during-run-drift inputs. It does not infer matching dependencies from
source hashes or a version string alone.

Proof SHA-256: `f01a1b3ffd8357a914624e918272020a7fcdc9fd1ef7d1b3cd93795cf1084716`.

### g-py-final-03

Accepted scope: **58 pytest cases only; static leaves renewed**. Exit 0; complete input/environment match.
Receipt SHA-256: `471d1a3e9e23c1c71df22dceabf072f0fb672f42c1c310104857c1fb97d64bd1`.
Consumed file identities: 8485; installed JavaScript closure, where applicable: 6042 files.

```powershell
pnpm.cmd format:check:python; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd lint:python; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd typecheck:python; if ($LASTEXITCODE) { exit $LASTEXITCODE }; uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py services/tts/tests/test_customvoice_screen.py services/tts/tests/test_customvoice_screen_authority.py
```

### g-rust-green-01

Accepted scope: **80 passed and 3 deliberately ignored per feature mode**. Exit 0; complete input/environment match.
Receipt SHA-256: `ecbaf20b5449b95bb9d8f63aabd6fdb03eb415e540ada02857407821ae769645`.
Consumed file identities: 14238; installed JavaScript closure, where applicable: 6042 files.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests; if ($LASTEXITCODE) { exit $LASTEXITCODE }; cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
```

### g-static-node-final-03

Accepted scope: **86 ordinary wrapper/release cases only**. Exit 0; complete input/environment match.
Receipt SHA-256: `9f89b9826eebd1deeba1d84a84ce32bbd8c4b6b9feaac58beff88be8a112d02a`.
Consumed file identities: 1852; installed JavaScript closure, where applicable: 6042 files.

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd typecheck:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/native-smoke.node-test.mjs
```

### g-native-harness-01

Accepted scope: **23 WebDriver cases only**. Exit 0; complete input/environment match.
Receipt SHA-256: `05d6acb43e86de89db68e3fa428a1e22c2c61ee308e04edf05fd69d97f8e8f0d`.
Consumed file identities: 1852; installed JavaScript closure, where applicable: 6042 files.

```powershell
node --test apps/desktop/scripts/native-webdriver-client.node-test.mjs apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd test:native-smoke-harness
```

### g-native-node-closure-01

Accepted scope: **76 native-smoke/portfolio Node cases**. Exit 0; complete input/environment match.
Receipt SHA-256: `fa8ab7e0ffa2b6d87f0432ff48dbd861d9ecd131f409a6ccb126e893bd5a15dc`.
Consumed file identities: 2746; installed JavaScript closure, where applicable: 6042 files.

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; node --test apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/native-smoke.node-test.mjs
```

### g-js-closure-final-01

Accepted scope: **655 EPUB cases only; desktop/static renewed after R01**. Exit 0; complete input/environment match.
Receipt SHA-256: `3e4c1fe57d853da65fd306a5f8bb9c844817933af793313bd56826f24717ad23`.
Consumed file identities: 2405; installed JavaScript closure, where applicable: 6042 files.

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd typecheck:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/epub exec vitest run src/document/xhtml-projector.test.ts src/navigation/navigation-document.test.ts src/navigation/ncx-navigation-parser.test.ts src/public/open-epub-publication.test.ts src/integration/ingestion-matrix.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-source.test.ts src/narration/narration-source-window.test.ts src/narration/narration-boundary-scanner.test.ts src/narration/narration-segment-packer.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/integration/package-reader-matrix.test.tsx src/reader/ReaderPublication.test.tsx src/reader/active-visual-locator.test.ts src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/persistence/reader-position-restore-coordinator.test.ts src/persistence/reader-position-save-coordinator.test.ts src/persistence/reader-position-repository.test.ts src/persistence/narration-position-save-bridge.test.ts src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/AdaptivePreparationControls.test.tsx src/tts/ProductNarrationControls.test.tsx src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts
```

### g-desktop-closure-final-03

Accepted scope: **TS static and 819 desktop cases after R01**. Exit 0; complete input/environment match.
Receipt SHA-256: `a5b5b15fd55359e7b5ee1b8840a9f02962ff92aad400163bda7fca66cd390b91`.
Consumed file identities: 2902; installed JavaScript closure, where applicable: 6042 files.

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd typecheck:typescript; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/integration/package-reader-matrix.test.tsx src/reader/ReaderPublication.test.tsx src/reader/active-visual-locator.test.ts src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/persistence/reader-position-restore-coordinator.test.ts src/persistence/reader-position-save-coordinator.test.ts src/persistence/reader-position-repository.test.ts src/persistence/narration-position-save-bridge.test.ts src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/AdaptivePreparationControls.test.tsx src/tts/ProductNarrationControls.test.tsx src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts
```

### g-browser-closure-final-01

Accepted scope: **16 selected Chromium cases**. Exit 0; complete input/environment match.
Receipt SHA-256: `09f19dc79e2eb069e75b31a863f4331b7f024809997221b904af7ad6f114a298`.
Consumed file identities: 3499; installed JavaScript closure, where applicable: 6042 files.

```powershell
node apps/desktop/node_modules/@playwright/test/cli.js test --config apps/desktop/playwright.config.ts reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep 'VF-00(34|35|36|44|45|46|48|49|53|55)|CFR-02|CFR-03|PN-|RCF-16|RCF-17|LCF completed|NLC real worklet|CCF-C07/C09/C20|preserves one canonical passage'
```

### g-python-static-closure-01

Accepted scope: **Python format/lint/type checks**. Exit 0; complete input/environment match.
Receipt SHA-256: `c321e29f3a7441a06590536606e05e8a1254c4759ab75ead31de34fedf46e87c`.
Consumed file identities: 9377; installed JavaScript closure, where applicable: 6042 files.

```powershell
pnpm.cmd format:check:python; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd lint:python; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd typecheck:python
```

### g-rust-static-closure-01

Accepted scope: **Rust fmt and both Clippy modes**. Exit 0; complete input/environment match.
Receipt SHA-256: `b887c8d0a570bdbec1b9092934cd058786f469e7e8905693a66582eae6c17310`.
Consumed file identities: 15130; installed JavaScript closure, where applicable: 6042 files.

```powershell
pnpm.cmd format:check:rust; if ($LASTEXITCODE) { exit $LASTEXITCODE }; pnpm.cmd lint:rust
```

## Dependency decisions

- Early composite receipts did not capture the full installed pnpm runtime. Their direct
  pytest, Cargo and Node leaves have independently complete tool/dependency evidence;
  no pnpm-invoked static or test result is reused from those receipts. The pnpm-invoked
  final leaves were executed again with its entire 892-file runtime captured.
- EPUB acceptance excludes unrelated desktop/Python source and task documentation.
  It includes package/root configuration, test helpers, normalization authorities,
  package exports and the complete installed JS closure.
- Desktop/browser acceptance includes current TS owners, test fixtures, shared/EPUB
  inputs and exports, root tooling and installed JS. Browser identity additionally
  includes Chromium and headless resources. Only its generated `debug.log` is excluded.
- Python acceptance includes every quality consumer, benchmark/quality authority,
  project/lock configuration, uv, base Python and installed virtual environment.
  The independent v12 publisher and CLI/preflight owners do not import quality.py;
  their historical PASS is not claimed as reused evidence.
- Cargo acceptance includes native sources/tests, release authorities, build inputs,
  Cargo metadata, crates, Rust and MSVC tools. Desktop TypeScript source and browser
  test files are outside those unit commands; exact-local admission is separate.
- Ordinary/release and WebDriver Node leaves do not import the changed native startup
  scenario. Their code/configuration/helpers and Node remain bound. The portfolio
  leaf does import that scenario and was renewed together with native-smoke tests.
- Only task documentation and ignored receipt instrumentation are excluded globally.
  They are not imported by these selected commands. Other documentation/authority
  inputs remain bound. No production dependency, lockfile or tool installation changed.

## Native and package acceptance

The results table and execution ledger attribute actual native commands, artifact
identities, bounded restoration and failures separately. Native/core/model caches
are reused as verified inputs; prior playback/installer PASS does not certify a new
artifact. The selected Piper arm is ES; deterministic English/profile controls remain.

Local V7 admission uses nine verified artifacts, including installed integrity failure,
Check, repair, retry, rediscovery and owned removal. It performs no inference.
Its actual command passed. The original outer wrapper failure remains intact:
a concurrent noEmit typecheck added only the declared frontend tsbuildinfo output.
The separate `g8-closure.json` binds the actual Cargo log/result and compiled-test
dependency file, excludes that unconsumed output with evidence, and verifies restored
host/TEMP and unchanged consumed source/crates/assets. Subsequent R01 changes are
confined to TS owners/tests outside that compiled native test graph.

No historical receipt has been edited or promoted from failure to PASS. Failed
attempts and the reason for each limited renewal remain in the execution ledger.

### G7: current native artifact and selected Piper arm

Receipt group: `native-final-deep-g7-07`. Both commands exit 0; source, JS,
exports, core environment and Piper model identities match before/after. Native
host/profile state and original adjacent-core identity are restored.

```powershell
pnpm.cmd test:native-startup
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es
```

The ordinary current-build executable SHA-256 is
`7dc35459ce21297563ad1e027e0356bb13e7b0fbc7a521e253368c688c2e4ff2`.
The full frontend manifest SHA-256 is
`c439509ece50b0b47c715f303df801b74599c4b3f7babe5a941e77fdcc37ae70`.
The host uses Edge/WebView2 157 and Tauri driver 2.0.6, with verified local Piper
Python/core/model inputs and offline configuration. English model preflight is
not an executed English playback arm.

### G8: actual local admission, fault, repair and removal

Receipt group: `native-final-deep-g8-01`; actual command exit 0, one exact-local
test passed in 918.13 s. `g8-closure.json` supplies the bounded reconciliation
described above and confirms host/disposable TEMP restoration.

```powershell
pnpm.cmd test:chatterbox:v7:local-admission
```

Compiled native test executable SHA-256:
`f96c5d8b81ab7b34b8b87e1ec55d2381f35d2341f62262ddea8ae13ac9609b7a`.
Dependency-info SHA-256:
`bbf485851dd5fdd54cda28c0a3ba4ce767a61eef16e5aa88cd8b86310d21cab6`.

### G9: current release-locked artifact and actual ordinary wrappers

Receipt group: `g9-final-build-deep-01`; canonical build and package check exit 0.
`check02-result.json`, `restoration.json` and `g-ordinary-deep-02.smoke.json`
record the passing bounded journey and verified original host/core restoration.

```powershell
pnpm.cmd package:windows:verified-core
pnpm.cmd package:windows:check
& tmp/evidence/deep-findings-minimal-corrections/run-ordinary-smoke.ps1 -Installer apps/desktop/src-tauri/target/release/bundle/nsis/VoxLeaf_0.1.0_x64-setup.exe -RunId g-ordinary-deep-02
```

The smoke invokes real `runJourney`, `runInstaller`, `runOwnedInstaller`,
`runUninstaller` and `restoreApplicationData`. Its injected preflight stops only
after validating the actual installed artifact, before download or inference;
the existing production finalizer owns the actual uninstall and profile restore.
The installed binary is compared byte for byte with the loose binary transformed
only at its unique Tauri bundle marker, UNK to NSS (offset 9200930).
The original first smoke's incorrect raw/installed identity assertion remains failed.

| Artifact | SHA-256 |
| --- | --- |
| Current unsigned NSIS installer | `7d1e6c065e9f4eafe89d4244478831ab8c5d04b551b819e0b49eda6fb4e5aa0e` |
| Loose release-locked executable, UNK | `d8c7fd39e998a584335ef36a54fe13b0bdf7da58442217a1330b64f434b855c4` |
| Installed executable, NSS | `a9055a9c47a332caa015a0e8ea0dd0d9a8427524c54f4c6ac9b16a9bc85a3a8a` |

The current generated package receipt is retained privately and the tracked
historical receipt is restored byte for byte with its original metadata/status.
The generated adjacent core is retained under ignored evidence; the original
directory is restored by identity. No required runtime data or installation is
left behind. G7's default-feature playback is a separately identified actual
execution, not claimed as playback of the G9 release-locked installed binary.

### Final equivalence and documentation

`native-closure-01.json` verifies current native consumed source/tool/crate bytes,
all 15 model/runtime assets, the G8 compiled executable/dependency file, identical
frontend resources and the full pnpm-runtime acceptance interval. Its only later
G8 source changes are the three R01 TS owner/test paths proven outside that
compiled test's dependencies. Proof SHA-256:
`b0eb22f16dd2f8d09e744272c93cd301a3d5d467223c63b601432a3d1516ddb5`.

`g-evidence-r02-01` and `g-evidence-r03-01` pass the following exact command with
matching captures. The documentation-final receipt is supplied to R04 after the
plan move and index/disposition updates. These changes do not invalidate runtime
inputs, as confirmed by the independent review's exact manifest comparisons.

```powershell
pnpm.cmd check:evidence; if ($LASTEXITCODE) { exit $LASTEXITCODE }; git diff --check
```

All task diagnostics are under ignored evidence. The R02 root diagnostic was
relocated byte for byte and removed from the deliverable; no raw inventory or
model/audio asset is added to the repository. Every original review and command
receipt retains its own outcome. Implementation approval is R03; R04 provides
the immutable review of the final archived patch. No Git mutation is authorized.

