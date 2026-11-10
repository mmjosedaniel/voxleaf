# U5 / DCR-15 execution receipt

Receipt DCR-U5-EXEC-20261109-01. Base and HEAD
`d375ecc84261c404e855c055e0ecc8949a97caaf`, index empty.
Normal local PowerShell outside the automation sandbox. Node v24.20.0,
pinned offline Corepack pnpm 11.15.1, Vitest 5.0.5. Raw evidence is private
under `tmp/evidence/deep-chat-audit/U5/`.

- RED: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/images/raster-image-policy.test.ts src/reader/images/raster-image-source.test.ts -t DCR-15`, exit 1, four intended failures, 54 skipped. Policy and source manager accepted early ANIM and ANMF. Production matched HEAD. Snapshots match.
- GREEN: same command without the selector, exit 0, 58 passed. Static, animated-flag, truncated and bounded controls passed. Scope: animation evidence remains sticky across VP8X; no decoder vulnerability claim.
- Scoped `pnpm.cmd exec prettier --write` and `pnpm.cmd exec eslint` exited zero over the first five paths below.
- `pnpm.cmd build:packages` exited zero after U4/U13; tracked EPUB/shared/build input digests agree before and after. Complete workspace export file digests are in `g0-exports.txt`. Final G0 attribution requires a current-input comparison.
- `pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep DCR-15` exited zero, one actual Chromium journey passed. The unsupported WebP fallback appeared and the count of WebP object URLs stayed zero. Configured fresh preview built current desktop sources. Browser source identities agree before and after. Final G6 remains pending.

## Closed reviewed inputs

First five paths comprise the U5 patch. Remaining rows are supporting inputs.

| Path | Status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| apps/desktop/src/reader/images/raster-image-policy.ts | $s | e76f99e6ce74732389248c8c6962a628b7d290b594614aa801a95f1531533dc3 | 735e3c873e170fc71cc9d9d02f4d2ccdd0526111 |
| apps/desktop/src/reader/images/raster-image-policy.test.ts | $s | a76f21eb70d229623f76744dd94710594ba4777c904adc1cdd4c73cc61d012db | fd6378d96ef687bbc35fcd287eb0d659d3f7925c |
| apps/desktop/src/reader/images/raster-image-source.test.ts | $s | f3b2fb1e6411bed94d85731ec75888860971f4a159fffe612e3296c14b81c912 | b030466100fc498d320e773cd934405bb885981c |
| apps/desktop/tests/fixtures/webp-fixture.ts | $s | 20b07a414815677a0c12be8bfee55e5370bd209a8b12ff91d3a6b1ead5ba277e | a58d8a3d3a14b9cc3f0f2b6904dc813d0c048011 |
| apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts | $s | 6baff79d9949972928839e2eb10dd213e86041f6d80730fd96ca77b3694d7c8d | 46e0b6a7cb14434e26c2ee2c28db901180005680 |
| apps/desktop/src/reader/images/raster-image-source.ts | $s | bc6ac39865b922172ce5212158f9e3c585c53efa35eb182b246a54c98d2c611f | d8727fddd5aff26466166e43e0de68d070b73f7d |
| apps/desktop/package.json | $s | 7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa | 46b13978c4094f004349ba762f31bddeb104cb9f |
| apps/desktop/vite.config.ts | $s | cf32693193b978e9d290f7cddf99538c7973622ba408005bfceec857e1ec9f31 | 1df2541f9aa8a463a0d076c8059dc07855762f0d |
| apps/desktop/playwright.config.ts | $s | 8b6b8a163b02a949a4e6cd91fcbeff71cb6053e5a646a87552f75b58be8011b1 | e14e28a44dcc92215549dcc1042fa0e26cf422a7 |
| package.json | $s | 79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6 | fd94e123a32a6b4a44d5ccb296cd89e25b319232 |
| pnpm-lock.yaml | $s | e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426 | acf5034202c5933f5c1dff89beff28587c826088 |
| pnpm-workspace.yaml | $s | efb8ff9911192e80897352cbacccc0cb1d53ef130b64bb98f813c973694f5363 | b6615e1277536c992be3a14cdaa04235a1117330 |
| .gitattributes | $s | d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4 | 5acf47068be3a84b4e38b502877083e99b5ce0f9 |
