# U3 / DCR-23 execution receipt

Receipt DCR-U3-EXEC-20261109-01. Base and HEAD
`d375ecc84261c404e855c055e0ecc8949a97caaf`, index empty.
Normal local PowerShell outside the automation sandbox. Node v24.20.0,
pinned offline Corepack pnpm 11.15.1, Vitest 5.0.5.
Private logs, traces and matching before/after snapshots are in
`tmp/evidence/deep-chat-audit/U3/`.

- Chromium RED: `pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep DCR-03/23`, exit 1. Initially saved Aiden and the Spanish Piper control passed. On return to English, Aiden remained unchecked. The Settings action and hardware coordinator matched HEAD.
- Same Chromium selection GREEN, exit 0, one passed. The checkpoint/focus controls remain; EN→ES→EN selects saved Aiden before Play, no auto-start occurs, and the first actual synthetic native start receives Aiden. Explicit English Piper then remains selected after the language round trip. Failed hardware detection keeps Play unavailable. The fresh failure control was added after the original RED and initial GREEN.
- Owner GREEN: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/settings/narration-settings-actions.test.ts src/tts/hardware-profile-compatibility.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/tts/product-narration-coordinator.test.ts`, exit 0, 280 passed, including deferred recheck before refresh, stale probe language reconciliation, unsupported-version handling and unavailable native development gate. The owner run preceded the final browser-only failure control and documentation; consumed owner inputs stayed unchanged.
- Scoped `pnpm.cmd exec prettier --write` and `pnpm.cmd exec eslint` exited zero over the first four paths. Final G3/G6/G7 still pending. No real model, installer, or release-locked binary was run for local U3.

## Closed reviewed inputs

First five rows are U3 patch paths. The browser file carries the unchanged
earlier U5 raster assertion, as well as the reviewed U3 changes. The raw
tracked diff contains both for that file. All other paths are supporting inputs.

| Path | Status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| apps/desktop/src/settings/narration-settings-actions.ts | ` M` | b762eaa9f3b36355a96893ca76e9b88101ed7ac95666efa4466c2147f78fbf3b | 354f446606df46f3200da85a73f4d3ca949592a3 |
| apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts | ` M` | 75b029bd29e8153ae288b0254c8022237aa5e0156b009975b3c869d3c6b355a6 | c3a3f982ee36eccb126db771ee4b9071f88e5e78 |
| apps/desktop/src/settings/narration-settings-actions.test.ts | ` M` | c81df8efa6befbc609a599409185a0e43c73a5db406755b9d22cb2aa196740fb | 411854ed630a1c6bf871b2281534b67cc81adc00 |
| apps/desktop/src/tts/product-narration-coordinator.test.ts | ` M` | 95e59e86131bf59c33cc7adf7949806f610ac2643e0103d3610efda5fb4628af | 2e357495f93ae13bf283f5995ed8d59178f1391f |
| docs/product/reader-settings-and-playback-controls.md | ` M` | 882f9a981c2ccdaad08205bd2b23d95d7cdbce7454dd22f6485752940944041f | 6be26966da05b5873a6049de206c641e2a395db8 |
| apps/desktop/src/tts/hardware-profile-compatibility.ts | `clean` | a49ff74398d322f6cbc0d1d9652b83f6695f24d0a644aa9fa47305503c67e388 | c0a53ed715d01c7a08b3363b619d3d9adbda2219 |
| apps/desktop/src/tts/hardware-profile-compatibility.test.ts | `clean` | 83e35080eba0053259ca3e5fef50259ce04f432450841313821868daa1abf5bd | 3374091ca842ac29a4e847124c3d9de4254cd68e |
| apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx | `clean` | 19a994885f2f099f33cafd33c5a43b7ee79a9c917d5f2b8e2a00297266afbb35 | 340915a029bee669bf4762837795df4743dc7ea4 |
| apps/desktop/src/tts/product-narration-coordinator.ts | `clean` | da1321aa46ccc50876ed257331873faab9c13c483d277716962f5c728f9c84a1 | 86118847f003df244fe8e17ffb70ce0c41db0f12 |
| apps/desktop/src/reader/ReaderPublication.tsx | ` M` | 086208cb9e6465fae489c6b540a3b8a90f8dee2ec659f67068db760a18224ca4 | 706a3e7f0634c545ab1fd96b3a3d2c71d176a109 |
| apps/desktop/src/App.tsx | `clean` | 7ea4d71efcd24435b446b697383f3d29a1e8dbf27f224fd5a778214b9097a637 | dd11f41c75a722af7156889ad985201143244584 |
| apps/desktop/package.json | `clean` | 7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa | 46b13978c4094f004349ba762f31bddeb104cb9f |
| apps/desktop/playwright.config.ts | `clean` | 8b6b8a163b02a949a4e6cd91fcbeff71cb6053e5a646a87552f75b58be8011b1 | e14e28a44dcc92215549dcc1042fa0e26cf422a7 |
| apps/desktop/vite.config.ts | `clean` | cf32693193b978e9d290f7cddf99538c7973622ba408005bfceec857e1ec9f31 | 1df2541f9aa8a463a0d076c8059dc07855762f0d |
| apps/desktop/tests/browser/settings-helpers.ts | `clean` | ac9f8f4c28efca8fc83cb2fea14389216921405e477a71c2ea20f03bb5eb1607 | 56015c203ff523b8b514ab227acc3fe71a869a51 |
| packages/shared/fixtures/contracts/host-profile-compatibility-report/v1/valid-synthetic.json | `clean` | f732e43fb9d7088dd41ad1258104a654dfadf432ebd7a5da49967e1eb2bd97f3 | f2b43bbb35e13c35bb58410bf2e1ed07420b822c |
| package.json | ` M` | 79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6 | fd94e123a32a6b4a44d5ccb296cd89e25b319232 |
| pnpm-lock.yaml | `clean` | e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426 | acf5034202c5933f5c1dff89beff28587c826088 |
| pnpm-workspace.yaml | `clean` | efb8ff9911192e80897352cbacccc0cb1d53ef130b64bb98f813c973694f5363 | b6615e1277536c992be3a14cdaa04235a1117330 |
| .gitattributes | `clean` | d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4 | 5acf47068be3a84b4e38b502877083e99b5ce0f9 |
| packages/epub/dist/index.js | `ignored export` | 3f5c07c947cf141c0e0630d1615db8bcab24cf29fef860be2f8bc692907a70dc | fb2836bcc35df29a554310fed3735cb5f59d7a7e |
