# U2 / DCR-03 execution receipt

Receipt DCR-U2-EXEC-20261109-01. Base and HEAD
`d375ecc84261c404e855c055e0ecc8949a97caaf`, index empty.
Normal local PowerShell outside automation sandbox. Node v24.20.0,
pinned offline Corepack pnpm 11.15.1, Vitest 5.0.5. Private raw evidence
and matching before/after snapshots are in `tmp/evidence/deep-chat-audit/U2/`.

- RED: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx -t DCR-03`, exit 1. The real React development StrictMode replay installed the viewport twice; initial settlement was never published. Two supersession/unmount controls passed. The earlier fixture run incorrectly expected an interior offset from its simple mock; it is separately retained and the unchanged production was rerun after correcting the expectation.
- Same selection GREEN: exit 0, three passed, 54 skipped. One exact interior settlement releases initial Play and actual narration preparation uses that locator. Unmount and navigation cannot revive the initial placement.
- Owner GREEN: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts`, exit 0, 67 passed. Existing CAF-R4.1/CCF-C02 fallback and focus controls stay active. No replacement of a precise persisted checkpoint by the visual fallback was introduced.
- Scoped `pnpm.cmd exec prettier --write` and `pnpm.cmd exec eslint` exited zero over the first two paths below. Combined current Chromium restore/language journey remains in U3/G6.

## Closed reviewed inputs

First two paths comprise the U2 patch. Remaining paths are supporting inputs.

| Path | Status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| apps/desktop/src/reader/ReaderPublication.tsx | ` M` | 086208cb9e6465fae489c6b540a3b8a90f8dee2ec659f67068db760a18224ca4 | 706a3e7f0634c545ab1fd96b3a3d2c71d176a109 |
| apps/desktop/src/reader/ReaderPublication.test.tsx | ` M` | 1c1322c1e33396085e4d5950d88de72b38abf5b3c71f7a8fe6cdbfd2eb7d386e | 94950e61247c914fa5b534162aa1fdf1ff0afe3b |
| apps/desktop/src/reader/reader-reflow-restoration.ts | `clean` | b172851bb56633762a0a9b2ac913894ebd9b036ed89696c094ca871d7e5a4e8b | f79392438ac4b7ddff5b1e5ea5ef8403205ae787 |
| apps/desktop/src/reader/reader-reflow-restoration.test.ts | `clean` | 6e39dc96441f54af8ff42ffef7a2ef2373d8b45cbd77308d2aa482eb038b8fee | c30c318d9ac02b62868c056a38fa2d8f63f5f816 |
| apps/desktop/src/strict-mode-resource-cleanup.ts | `clean` | 25891d3bccf6c3924eaa9613db4f535447a5967c49cd6a7f98ca00f1221938ad | 3b4fecac583c4b88524e2f95aa35e5a0f58e4725 |
| apps/desktop/src/tts/product-narration-coordinator.ts | `clean` | da1321aa46ccc50876ed257331873faab9c13c483d277716962f5c728f9c84a1 | 86118847f003df244fe8e17ffb70ce0c41db0f12 |
| apps/desktop/package.json | `clean` | 7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa | 46b13978c4094f004349ba762f31bddeb104cb9f |
| apps/desktop/vite.config.ts | `clean` | cf32693193b978e9d290f7cddf99538c7973622ba408005bfceec857e1ec9f31 | 1df2541f9aa8a463a0d076c8059dc07855762f0d |
| package.json | ` M` | 79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6 | fd94e123a32a6b4a44d5ccb296cd89e25b319232 |
| pnpm-lock.yaml | `clean` | e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426 | acf5034202c5933f5c1dff89beff28587c826088 |
| pnpm-workspace.yaml | `clean` | efb8ff9911192e80897352cbacccc0cb1d53ef130b64bb98f813c973694f5363 | b6615e1277536c992be3a14cdaa04235a1117330 |
| .gitattributes | `clean` | d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4 | 5acf47068be3a84b4e38b502877083e99b5ce0f9 |
| packages/epub/dist/index.js | `ignored export` | 3f5c07c947cf141c0e0630d1615db8bcab24cf29fef860be2f8bc692907a70dc | fb2836bcc35df29a554310fed3735cb5f59d7a7e |
