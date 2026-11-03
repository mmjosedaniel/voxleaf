# Validation command register

All commands below executed in local PowerShell outside the managed sandbox. Raw immutable receipts, outputs and complete input manifests remain under `tmp/evidence/residual-audit-corrections/20261103-01/`. Failed attempts are preserved; exit 0 alone does not supersede scope/identity decisions in the ledger. The initial PATH engine failure preceded this wrapper and is described in the ledger. Absolute workspace-root executable paths below use the equivalent relative spelling; original commands are preserved in the receipts.

## Command dictionary

### C01

```powershell
pnpm.cmd build:packages
```

### C02

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/publication/reader-lifecycle.test.ts -t RAF-
```

### C03

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/publication/reader-lifecycle.test.ts src/publication/publication-session.test.ts src/publication/local-publication-open.test.ts
```

### C04

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx -t RAF-06
```

### C05

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/publication/reader-lifecycle.test.ts
```

### C06

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/tts/product-narration-coordinator.test.ts -t RAF-
```

### C07

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx -t RAF-09
```

### C08

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/tts/product-narration-coordinator.test.ts
```

### C09

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/ProductNarrationControls.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/tts/product-narration-coordinator.test.ts -t RAF-
```

### C10

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/settings/ReaderSettingsDialog.test.tsx src/tts/product-narration-coordinator.test.ts -t RAF-
```

### C11

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t RAF-05
```

### C12

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/ProductNarrationControls.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/AdaptivePreparationControls.test.tsx
```

### C13

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/OptionalChatterboxControls.test.tsx -t RAF-02
```

### C14

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml raf_16_preflight_cannot_acquire_replacement_confirmation -- --nocapture --test-threads=1
```

### C15

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts
```

### C16

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/process-client.test.ts src/tts/product-narration-coordinator.test.ts -t "RAF-14|RAF-15"
```

### C17

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml raf_15_contained_failed_handshake -- --nocapture --test-threads=1
```

### C18

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/process-client.test.ts src/tts/product-narration-coordinator.test.ts -t RAF-
```

### C19

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t RAF-14
```

### C20

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/process-client.test.ts src/tts/product-narration-coordinator.test.ts
```

### C21

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts -t RAF-
```

### C22

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts -t RAF-01
```

### C23

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts src/locator/locator-index.test.ts src/document/xhtml-projector.test.ts src/package/package-document.test.ts
```

### C24

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts -t RAF-10
```

### C25

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts src/resource/opened-publication.test.ts src/narration/narration-resource-bounds.test.ts src/testing/narration-preparation-limits.test.ts src/integration/narration-preparation-matrix.test.ts
```

### C26

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/integration/narration-preparation-matrix.test.ts -t RAF-
```

### C27

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/integration/narration-preparation-matrix.test.ts src/public/open-epub-publication.test.ts -t RAF-
```

### C28

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_release_chatterbox.py -k raf_11
```

### C29

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts -t RAF-
```

### C30

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml raf_15 -- --nocapture
```

### C31

```powershell
pnpm.cmd --filter @voxleaf/desktop typecheck
```

### C32

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_release_chatterbox.py services/tts/tests/test_chatterbox_sources.py
```

### C33

```powershell
pnpm.cmd lint:typescript
```

### C34

```powershell
pnpm.cmd --filter @voxleaf/epub typecheck
```

### C35

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests
```

### C36

```powershell
& tmp/evidence/residual-audit-corrections/20261103-01/core-proof.ps1
```

### C37

```powershell
node tmp/evidence/residual-audit-corrections/20261103-01/capture-installed.mjs before
```

### C38

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_service_supervisor::tests
```

### C39

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/locator/locator-index.test.ts src/public/open-epub-publication.test.ts src/document/xhtml-projector.test.ts src/package/package-document.test.ts src/resource/opened-publication.test.ts src/security/processing-budget.test.ts src/narration/narration-normalizer.test.ts src/narration/narration-boundary-scanner.test.ts src/narration/narration-segment-packer.test.ts src/narration/narration-resource-bounds.test.ts src/testing/narration-preparation-limits.test.ts src/integration/narration-preparation-matrix.test.ts
```

### C40

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/publication/publication-session.test.ts src/publication/reader-lifecycle.test.ts src/reader/ReaderPublication.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/tts/OptionalChatterboxControls.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/AdaptivePreparationControls.test.tsx src/tts/HardwareCompatibilityControls.test.tsx src/tts/hardware-profile-compatibility.test.ts src/tts/product-narration-coordinator.test.ts src/tts/process-client.test.ts src/tts/pcm-playback.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts
```

### C41

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
```

### C42

```powershell
pnpm.cmd format:check:python; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:python; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd typecheck:python
```

### C43

```powershell
pnpm.cmd package:piper-core:check
```

### C44

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/epub typecheck; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/desktop typecheck
```

### C45

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
```

### C46

```powershell
pnpm.cmd format:check:rust; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:rust
```

### C47

```powershell
pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep '"RAF-|NSL-|SPM-01/02|VCA-06/09"'
```

### C48

```powershell
& tmp/evidence/residual-audit-corrections/20261103-01/native-readiness.ps1
```

### C49

```powershell
pnpm.cmd build:desktop
```

### C50

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en
```

### C51

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/desktop typecheck
```

### C52

```powershell
pnpm.cmd check:evidence; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; git diff --check
```

### C53

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement --no-run
```

### C54

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement -- --exact --ignored --nocapture --test-threads=1
```

### C55

```powershell
node tmp/evidence/residual-audit-corrections/20261103-01/capture-installed.mjs after
```

### C56

```powershell
& '.\apps\desktop\src-tauri\target\debug\deps\voxleaf_desktop-cf81b41a9ebc5347.exe' tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement --exact --ignored --nocapture --test-threads=1
```

### C57

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml raf_r1 -- --nocapture
```

### C58

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml raf_ -- --nocapture
```

### C59

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
```

### C60

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_service_supervisor::tests; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
```

### C61

```powershell
node tmp/evidence/residual-audit-corrections/20261103-01/capture-installed-R2.mjs after-r2
```

### C62

```powershell
pnpm.cmd check:evidence; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; git diff --check; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; & tmp/evidence/residual-audit-corrections/20261103-01/check-links.ps1 -Id R3
```

## Immutable attempts

| Receipt ID | Command | Exit | Input manifest SHA-256 |
| --- | --- | --- | --- |
| G0-exports | C01 | 0 | `20ae8e4b0bf91f0afa5cd66ddc5a301c3c45d8648f6e35d60a736df2716cb914` |
| G1-U1-red | C02 | 1 | `6f9f671456bbe614f50ed7d77c1ee8f590dcc103cab854cabd014c332e21e633` |
| G1-U1-lifecycle-green | C03 | 0 | `7ae1dcb98136500b80ccfcbbac8b2d95ee69fcf3a8f14a05ec6a646ac54e264e` |
| G1-U1-restoration-red | C04 | 1 | `de2d4beec7d53bbd63ebf42eda052c1e35e7c1b310048dbf2c4d775ab0554f22` |
| G1-U1-restoration-red-corrected | C04 | 1 | `4c17256af250cdfc42fa1a184fefebf4db3a2b0d958ff38cbcaf9193e4a8505a` |
| G1-U1-App-green | C05 | 0 | `393767cc6f02f50ac05c298aa76734475b9d56c6438ee6244e5dee1448219afd` |
| G1-U2-red | C06 | 1 | `c2b4c7024418012c5cc7cd483986783a085d561dab041598094ea8b324fd1ea8` |
| G1-U2-scale-red-corrected | C07 | 1 | `70f73634b9c263a784bc08ce9f8ef11d78795632aa87d36109ff3164338d5094` |
| G1-U2-green | C08 | 0 | `099d4700a33ea7754eebc50864b8bd676179b61a92105df956e36de8e826a33b` |
| G1-U3-red | C09 | 1 | `72661c98352513a8c88653385433a9abd47bdcd421fa871132ae08c12620911f` |
| G1-U3-red-fixtures-corrected | C10 | 1 | `71a3d8f953564e9aafb8b22f8755ff3fb2e2c16803291948052311997926ff82` |
| G1-U3-ETA-red-admitted | C11 | 1 | `f77bd459dbef3851c0ff54f5ba9d57aa6d6e4a36d99514599446d7074826fd2a` |
| G1-U3-green | C12 | 1 | `23ca76f64f648fb2fe027fdcc1d256d9c9efb759589ea1da62080feb55bcc40d` |
| G1-U3-green-current | C12 | 0 | `b835ac917c2c2f37aa22c839b9f94d388612ca0f06a0ded759ab3985e11c4bb5` |
| G1-U4-ui-red | C13 | 1 | `9a2c653e1295b3e4bd8141de36c7d71d6aa628079ac43ea646a2ea30d6e44df9` |
| G1-U4-native-red | C14 | 101 | `9a2c653e1295b3e4bd8141de36c7d71d6aa628079ac43ea646a2ea30d6e44df9` |
| G1-U4-ui-green | C15 | 0 | `dd4ed5be02fdf11d026a5edd126d4af623446b5b8f7ef21f2778082a81c42135` |
| G1-U4-native-green | C14 | 0 | `dd4ed5be02fdf11d026a5edd126d4af623446b5b8f7ef21f2778082a81c42135` |
| G1-U5-client-red | C16 | 255 | `4f42ce88c652a8e438fdd61b1d493fae26827182cfceed9d5070f53e57cd8b08` |
| G1-U5-native-red | C17 | 101 | `4f42ce88c652a8e438fdd61b1d493fae26827182cfceed9d5070f53e57cd8b08` |
| G1-U5-client-red-filter-corrected | C18 | 1 | `4f42ce88c652a8e438fdd61b1d493fae26827182cfceed9d5070f53e57cd8b08` |
| G1-U5-recovery-red-observed | C19 | 1 | `45ded8c51a62491c4676fe5e9c1937b690d7c0d8a02c841f1ba630572ec561d3` |
| G1-U5-recovery-red-joined | C19 | 1 | `e3780cb5837c435689cf39b1c670d8d352261a47d9f0b106388348bf513dfae6` |
| G1-U5-recovery-red-terminal | C19 | 1 | `bd2e13f0bac45d8b96749ab6fb1eb146ed4ce5b937a4136c82315be20ab44e9b` |
| G1-U5-client-green | C20 | 0 | `2beebfdd97dbdaa11e5b6913572d65b0c061f8245e76d67384de9d9c585bf20d` |
| G1-U5-native-green | C17 | 0 | `2beebfdd97dbdaa11e5b6913572d65b0c061f8245e76d67384de9d9c585bf20d` |
| G1-U6-red | C21 | 1 | `f6d1155e2932979515c8d6f471235e508afcfb2bb525da45d197aed40400177c` |
| G1-U6-capacity-red-bounded | C22 | 1 | `341c26bab5c70f5c5f74cf50d8a3603cbd25da26d291d5890df82ae26cdf5f79` |
| G1-U6-capacity-red-owner | C22 | 1 | `357caf04302ea9167b04c309312ab257fc554c78197c94f433d02c95b7f5e500` |
| G1-U6-green | C23 | 0 | `41a7bbe92aea9c2bdc7b5007086de51980f0f6691e42fe9f0afe876c0c39189d` |
| G1-U7-red | C24 | 1 | `5211b1e33fcc4929a12158f86370bd98e502ab83d9f67c95b6e7a01f1ff93c18` |
| G1-U7-red-request-corrected | C24 | 1 | `f74e607f5b1f81c82e9bdc2358c48963d652a79bdf6480aec7a36fb4c079722f` |
| G1-U7-red-identity-preserved | C24 | 1 | `4a2510b09a2bd27549fb3f57ae5ea273637fd5fb82b565506d623ad01da868ba` |
| G1-U7-green | C25 | 1 | `af8da0e9de50ffe391f04a16c9a3433fe545427bcaa69f596e121ea5c67b11c9` |
| G0-epub-U7 | C01 | 1 | `f2184920c1fc2110f3f44ea5d3f07e67f9535b821a002c458694fd806b61908f` |
| G1-U8-red | C26 | 1 | `f2184920c1fc2110f3f44ea5d3f07e67f9535b821a002c458694fd806b61908f` |
| G0-epub-U8 | C01 | 0 | `ce496ad375f7860cbff3a8ff1b0e80f6b1339cd6aaea4d56b93cc14bdfe4c488` |
| G1-U8-green | C27 | 1 | `ce496ad375f7860cbff3a8ff1b0e80f6b1339cd6aaea4d56b93cc14bdfe4c488` |
| G1-U9-red | C28 | 1 | `c1bd6b80ce123f44e2c68e76cae1b4f9f49dafaaeba08b03f60641c827bcfd25` |
| G1-U9-green | C28 | 0 | `425597d081b24796c2dc0409ae04d1314681002e74b8b8ee601483b5451f8f63` |
| G1-U4-remount-controls-red | C29 | 1 | `ab41919dbd454e082677f8e7c5ff4dc1f42ab0d437b8e2954f0576316e4842f8` |
| G1-U5-native-controls | C30 | 101 | `acc9625792fa4a73cc8e72ba28045df0c0d2a6e86742e3f907cdd1cb138cb975` |
| G6-types-desktop | C31 | 2 | `6927f5a4f19f9428ef4684635bfbc49a841cf304eaf9a35323ed58386a1bface` |
| G5-packaging | C32 | 0 | `6927f5a4f19f9428ef4684635bfbc49a841cf304eaf9a35323ed58386a1bface` |
| G6-lint-ts | C33 | 0 | `6927f5a4f19f9428ef4684635bfbc49a841cf304eaf9a35323ed58386a1bface` |
| G6-types-epub | C34 | 0 | `6927f5a4f19f9428ef4684635bfbc49a841cf304eaf9a35323ed58386a1bface` |
| G4-supervisor-default | C35 | 0 | `9eaadd4ddc14b7e97d0963538fd7ee53a3395c463b92f431de0d6c93939363be` |
| G8-core-proof | C36 | 0 | `9eaadd4ddc14b7e97d0963538fd7ee53a3395c463b92f431de0d6c93939363be` |
| G0-final-exports | C01 | 0 | `9eaadd4ddc14b7e97d0963538fd7ee53a3395c463b92f431de0d6c93939363be` |
| G6-installed-before | C37 | 0 | `9eaadd4ddc14b7e97d0963538fd7ee53a3395c463b92f431de0d6c93939363be` |
| G4-supervisor-locked | C38 | 0 | `9eaadd4ddc14b7e97d0963538fd7ee53a3395c463b92f431de0d6c93939363be` |
| G2-epub | C39 | 1 | `9eaadd4ddc14b7e97d0963538fd7ee53a3395c463b92f431de0d6c93939363be` |
| G3-desktop | C40 | 1 | `9eaadd4ddc14b7e97d0963538fd7ee53a3395c463b92f431de0d6c93939363be` |
| G6-types-desktop-corrected | C31 | 0 | `863c30323e6fca1f6cb90bf7cfc7d4fd86b83b627e0e8bb0fc4a843ae67e655f` |
| G4-optional-default | C41 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G0-corrected-exports | C01 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G6-python | C42 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G8-core-check | C43 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G2-epub-corrected | C39 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G6-ts-final | C44 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G4-optional-locked | C45 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G3-desktop-corrected | C40 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G6-rust | C46 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G7-browser | C47 | 1 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G9-readiness | C48 | 0 | `fcbe9030051f804da280f7f5161f6559fce82bb4c23b8448d997f93991907e60` |
| G7-browser-corrected | C47 | 0 | `61670e1be1e911172b0e75578f590309340d2ddd1ed641ac982697d83a6bd851` |
| G9-build | C49 | 0 | `61670e1be1e911172b0e75578f590309340d2ddd1ed641ac982697d83a6bd851` |
| G9-Piper | C50 | 0 | `fa04a6aa3fcd51c627bc5106ba07c9a4e48809e082577bf1e46b7037bf581f97` |
| G6-ts-browser-final | C51 | 0 | `aa9c948846bcc1e41dcc63d36ba9adea93cb6128f719df92ec6e5f6a71a879a9` |
| G10-pre-review-check | C52 | 0 | `aa9c948846bcc1e41dcc63d36ba9adea93cb6128f719df92ec6e5f6a71a879a9` |
| G4-F08-link | C53 | 0 | `aa9c948846bcc1e41dcc63d36ba9adea93cb6128f719df92ec6e5f6a71a879a9` |
| G4-F08 | C54 | 0 | `aa9c948846bcc1e41dcc63d36ba9adea93cb6128f719df92ec6e5f6a71a879a9` |
| G10-installed-after | C55 | 1 | `aa9c948846bcc1e41dcc63d36ba9adea93cb6128f719df92ec6e5f6a71a879a9` |
| G4-F08-frozen | C56 | 0 | `aa9c948846bcc1e41dcc63d36ba9adea93cb6128f719df92ec6e5f6a71a879a9` |
| R2-native-red | C57 | 101 | `6764e1778b49aa75b58e46db6423d9e6227a0080359237a9246ab5658acb14f0` |
| R2-native-green | C58 | 101 | `69bdb4d182d42adeb24e0f49ab8790352a6e80f2f209dbff59b71819be1d90c2` |
| R2-native-green-initialized | C58 | 0 | `b51454607407fbc34ca6e947419bdc3076ec8e5c1f3db826cfb4e35b15966f27` |
| R2-client-controls | C18 | 0 | `b51454607407fbc34ca6e947419bdc3076ec8e5c1f3db826cfb4e35b15966f27` |
| R2-static-ts | C51 | 0 | `ec39a79e0a4027519cd65e4b84a259cc67d5c5f58d8545240d5194727f8b7371` |
| R2-native-default | C59 | 0 | `ec39a79e0a4027519cd65e4b84a259cc67d5c5f58d8545240d5194727f8b7371` |
| R2-desktop | C40 | 0 | `ec39a79e0a4027519cd65e4b84a259cc67d5c5f58d8545240d5194727f8b7371` |
| R2-native-locked | C60 | 0 | `ec39a79e0a4027519cd65e4b84a259cc67d5c5f58d8545240d5194727f8b7371` |
| R2-static-rust | C46 | 0 | `75b21c15cb993911abd0121b7d95cfe9fb0d3747c162dc28b26751fd4dd9d374` |
| R2-G9-build | C49 | 0 | `75b21c15cb993911abd0121b7d95cfe9fb0d3747c162dc28b26751fd4dd9d374` |
| R2-G9-Piper | C50 | 0 | `65ac5395d474fecc2916e4dff96bc4443b97cab163a54182f52ab89b8b11445d` |
| R2-F08-link | C53 | 0 | `65ac5395d474fecc2916e4dff96bc4443b97cab163a54182f52ab89b8b11445d` |
| R2-installed-after | C61 | 1 | `65ac5395d474fecc2916e4dff96bc4443b97cab163a54182f52ab89b8b11445d` |
| R2-F08-frozen | C56 | 0 | `65ac5395d474fecc2916e4dff96bc4443b97cab163a54182f52ab89b8b11445d` |
| R2-evidence-check | C52 | 0 | `589ac7626ecdcc76e428bf1695d4837083b0f2353631b3b5710e10e2ef5e79ac` |
| R3-doc-check | C62 | 0 | `2bd595c28e5b6f95883bf5e138262ae902911cfb70bf6e1c6da3f50dd01b95d5` |

G4-F08 passed its test but the surrounding identity guard detected a Cargo relink; its frozen repeat is accepted only for that revision. R2 renews affected native/app evidence. Strict installed comparisons retain the appended Chromium debug.log output difference; separate consumed-input comparisons prove complete membership, consumed files and environment match. Original records were not rewritten. See the execution ledger for current accepted gate IDs and review decisions.
