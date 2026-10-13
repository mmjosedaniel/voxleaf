# APPS-IMAGES-03 post-change validation

Report ID: APPS-IMAGES-03-POST-01. Target: APPS-IMAGES-03. Mode: POST-CHANGE.
Verdict: **PASS**. Independent refactor_validator; accepted by director.
Starting and ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.
Branch: `codex/apps-organization-follow-up`. Index empty; no Git mutations.

## Validated identities

Before/after identities are identical. These are copied from the immutable
validation manifest, not refreshed after approval.

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/reader/raster-image-policy.ts` | ` D apps/desktop/src/reader/raster-image-policy.ts` | `DELETED` | `DELETED` |
| `apps/desktop/src/reader/images/raster-image-policy.ts` | `?? apps/desktop/src/reader/images/raster-image-policy.ts` | `0A730D598EDC1BD14EB9E2530B71975F398EAAB8F13351540301DC05B7F9F28A` | `2f14e03a5f34c12d796d7bff65a605dded99de1e` |
| `apps/desktop/src/reader/raster-image-policy.test.ts` | ` D apps/desktop/src/reader/raster-image-policy.test.ts` | `DELETED` | `DELETED` |
| `apps/desktop/src/reader/images/raster-image-policy.test.ts` | `?? apps/desktop/src/reader/images/raster-image-policy.test.ts` | `719C00715E816EEE980992E766A744EDF7F15AC1AC20117F638EBC768520752A` | `3b7b19209a1d4961dcf2a08e0d2c4bde850ba024` |
| `apps/desktop/src/reader/raster-image-source.ts` | ` D apps/desktop/src/reader/raster-image-source.ts` | `DELETED` | `DELETED` |
| `apps/desktop/src/reader/images/raster-image-source.ts` | `?? apps/desktop/src/reader/images/raster-image-source.ts` | `068771CD8AD17F4C1080AFA17A8BCE38D133B0964BA8DA548630DC8D28FECE4F` | `6806322d0696ce6e1a9aaff560efe4c045bb50c5` |
| `apps/desktop/src/reader/raster-image-source.test.ts` | ` D apps/desktop/src/reader/raster-image-source.test.ts` | `DELETED` | `DELETED` |
| `apps/desktop/src/reader/images/raster-image-source.test.ts` | `?? apps/desktop/src/reader/images/raster-image-source.test.ts` | `33E8E404E526A64E5C4EFFFC36F932F0D7AA988449FFC9056328C04D140CBD66` | `ccd5147a690ab389212c9ba493e590f3a04fda9d` |
| `apps/desktop/src/reader/publication-raster-image-loader.ts` | ` D apps/desktop/src/reader/publication-raster-image-loader.ts` | `DELETED` | `DELETED` |
| `apps/desktop/src/reader/images/publication-raster-image-loader.ts` | `?? apps/desktop/src/reader/images/publication-raster-image-loader.ts` | `C316A06D3D11DCE67290D90AA2431CB8E2E82894AFCDE79786029C552AD3B0B3` | `7e76f8ecd4c1cf9f190b6be84bb3a6ec5b5408d9` |
| `apps/desktop/src/reader/publication-raster-image-loader.test.ts` | ` D apps/desktop/src/reader/publication-raster-image-loader.test.ts` | `DELETED` | `DELETED` |
| `apps/desktop/src/reader/images/publication-raster-image-loader.test.ts` | `?? apps/desktop/src/reader/images/publication-raster-image-loader.test.ts` | `992BB48FCE244E4A962FEC444444F6F12544020E487255E0A2724513E370FE99` | `b1f29ee353cb05ae6cdf1f0821b5e1e00387e44a` |
| `apps/desktop/src/reader/SemanticRasterImage.tsx` | ` D apps/desktop/src/reader/SemanticRasterImage.tsx` | `DELETED` | `DELETED` |
| `apps/desktop/src/reader/images/SemanticRasterImage.tsx` | `?? apps/desktop/src/reader/images/SemanticRasterImage.tsx` | `01DEDCCF7376D4B2F5D03FB948F3403BC210456D6053E744243D92374C435C53` | `420e539eafe60239e4581b6870dc2121cacbda8f` |
| `apps/desktop/src/reader/SemanticRasterImage.test.tsx` | ` D apps/desktop/src/reader/SemanticRasterImage.test.tsx` | `DELETED` | `DELETED` |
| `apps/desktop/src/reader/images/SemanticRasterImage.test.tsx` | `?? apps/desktop/src/reader/images/SemanticRasterImage.test.tsx` | `ECB27ECF4D4989B26CBB0741E0B58B45238A53422EB9C1E64E16468E70562B37` | `d9c763837b19220c0f7f768989a84bb2f3ac53ec` |
| `apps/desktop/src/reader/ReaderPublication.tsx` | ` M apps/desktop/src/reader/ReaderPublication.tsx` | `25B15E04479662CA491AC5DC67CD378E354B775153E298640CE9239F3EB68C86` | `d7f4ea3b06815e93677afb5710b5d497bee07cfd` |
| `apps/desktop/src/reader/SemanticDocument.tsx` | ` M apps/desktop/src/reader/SemanticDocument.tsx` | `9FB1BAD6818DB66007A63785C4320332F4042982DBDCC8EF506127599377EAD6` | `916c8740a9da772050e1ea768cc9e3a9d9c0de3e` |
| `apps/desktop/src/integration/package-reader-matrix.test.tsx` | ` M apps/desktop/src/integration/package-reader-matrix.test.tsx` | `8E197ED228C63FCFF7C1920A14E2761FB682B5E239AF8C0AF982E6C39404D2E9` | `964342d46c08fb38499df3bfe798faeaf2a5c9dc` |

Accepted guards also remained identical to [native POST-04](APPS-NATIVE-01-post-04.md)
and [publication POST-01](APPS-PUBLICATION-02-post-01.md).

## Commands and results

Fresh local PowerShell outside sandbox, 2026-10-12 20:57:15–20:59:21 UTC.
PowerShell 7.6.5, Node 24.20.0, pinned pnpm 11.15.1. All commands exit 0:

1. `pnpm.cmd build:packages`.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`.
3. `pnpm.cmd --filter @voxleaf/desktop test`: 57 Vitest files, 661 Vitest and 70 Node tests.
4. `pnpm.cmd format:check:typescript`.
5. `pnpm.cmd lint:typescript`.
6. `pnpm.cmd test:browser`: seven scenarios.
7. `pnpm.cmd test:native-startup`: decode, lifecycle, cancellation, synchronization,
   restoration and replacement cleanup; no errors or external requests.
8. `git diff --check`.

Independent byte/import proof passes: all eight destinations equal baseline
bytes; old paths absent; reversing six import substitutions reproduces all
three consumers' baseline bytes. Exactly 19 paths, 5,152 added/removed lines,
12 import-edit lines, below 5,400/20 ceilings. No obsolete imports remain.

Invariant, test-integrity, scope and privacy reviews PASS. Limits include one
active decode, eight total active-plus-queued loads and eight live sources;
cancellation, byte clearing, late release and exactly-once URL release remain
byte-identical. Four complete suites moved unchanged; collection counts stable.
No private data, dependency changes or generated artifacts enter the patch.

Raw logs, checker, complete manifests and executable provenance stay ignored
under `tmp/evidence/apps-organization-follow-up/APPS-IMAGES-03-POST-01/`.
Combined benchmark/model and aggregate acceptance are separate and pending.
