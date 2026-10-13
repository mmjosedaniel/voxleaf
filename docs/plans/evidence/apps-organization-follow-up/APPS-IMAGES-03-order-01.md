# Image grouping audit, baseline and approved order

Fresh audit: APPS-IMAGES-03 CHANGE, medium risk. Four coherent boundaries and
their four tests already preserve policy, source ownership, serialized loading
and semantic presentation. Requested grouping improves discovery; no logic
defect or abstraction is proposed. Eight files/2,570 lines and six external
import strings across three consumers; internal imports remain valid.

## Baseline Validation Report

Report ID: APPS-IMAGES-03-BASELINE-01. Mode BASELINE. Verdict **PASS**.
Environment: local PowerShell outside sandbox; 7.6.5 / Node 24.20.0 / pnpm 11.15.1.
Starting/ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`. Empty index.
Exact porcelain output empty for all nineteen paths.

| Closed path | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| `apps/desktop/src/reader/raster-image-policy.ts` | `0A730D598EDC1BD14EB9E2530B71975F398EAAB8F13351540301DC05B7F9F28A` | `2f14e03a5f34c12d796d7bff65a605dded99de1e` |
| `apps/desktop/src/reader/images/raster-image-policy.ts` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/raster-image-policy.test.ts` | `719C00715E816EEE980992E766A744EDF7F15AC1AC20117F638EBC768520752A` | `3b7b19209a1d4961dcf2a08e0d2c4bde850ba024` |
| `apps/desktop/src/reader/images/raster-image-policy.test.ts` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/raster-image-source.ts` | `068771CD8AD17F4C1080AFA17A8BCE38D133B0964BA8DA548630DC8D28FECE4F` | `6806322d0696ce6e1a9aaff560efe4c045bb50c5` |
| `apps/desktop/src/reader/images/raster-image-source.ts` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/raster-image-source.test.ts` | `33E8E404E526A64E5C4EFFFC36F932F0D7AA988449FFC9056328C04D140CBD66` | `ccd5147a690ab389212c9ba493e590f3a04fda9d` |
| `apps/desktop/src/reader/images/raster-image-source.test.ts` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/publication-raster-image-loader.ts` | `C316A06D3D11DCE67290D90AA2431CB8E2E82894AFCDE79786029C552AD3B0B3` | `7e76f8ecd4c1cf9f190b6be84bb3a6ec5b5408d9` |
| `apps/desktop/src/reader/images/publication-raster-image-loader.ts` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/publication-raster-image-loader.test.ts` | `992BB48FCE244E4A962FEC444444F6F12544020E487255E0A2724513E370FE99` | `b1f29ee353cb05ae6cdf1f0821b5e1e00387e44a` |
| `apps/desktop/src/reader/images/publication-raster-image-loader.test.ts` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/SemanticRasterImage.tsx` | `01DEDCCF7376D4B2F5D03FB948F3403BC210456D6053E744243D92374C435C53` | `420e539eafe60239e4581b6870dc2121cacbda8f` |
| `apps/desktop/src/reader/images/SemanticRasterImage.tsx` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/SemanticRasterImage.test.tsx` | `ECB27ECF4D4989B26CBB0741E0B58B45238A53422EB9C1E64E16468E70562B37` | `d9c763837b19220c0f7f768989a84bb2f3ac53ec` |
| `apps/desktop/src/reader/images/SemanticRasterImage.test.tsx` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/reader/ReaderPublication.tsx` | `FD8D4EA774ADE14EC57A66E851BEFB386629E02A79E898019A21DD037D450D73` | `aaf5193cd44bc5f5f0d51141847191ca1adf81a4` |
| `apps/desktop/src/reader/SemanticDocument.tsx` | `6559C258CE1A2247897DCB131D6D5D4A5B79AED6F0CE8F94D6700189151FE8E2` | `2461f6208cc6e1b082b1c7977143f37903d2e041` |
| `apps/desktop/src/integration/package-reader-matrix.test.tsx` | `A9D7E1E84258DF0662E9527C5AA43FAF3809CE46E908FA7E0BDEDB777F0A2C75` | `88a02070a947a1ae81c0afb6629851a58467e2d5` |

Identity recheck PASS: all nineteen paths unchanged, eight destinations ABSENT.
Accepted native six identities equal POST-04; publication seven equal POST-01,
before/after. Scope, baseline invariants, test integrity and privacy PASS.

Fresh commands, 2026-10-12 20:51:50–20:54:07 UTC, all exit 0:

1. `pnpm.cmd build:packages`.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`.
3. `pnpm.cmd --filter @voxleaf/desktop test`: 57 files/661 Vitest, 70 Node.
4. `pnpm.cmd format:check:typescript`.
5. `pnpm.cmd lint:typescript`.
6. `pnpm.cmd test:browser`: seven scenarios.
7. `pnpm.cmd test:native-startup`: image decode, lifecycle, cancellation,
   synchronization, restoration and replacement cleanup; no external requests.
8. `git diff --check`.

Raw manifests/logs are ignored under the Report ID. No source or Git mutation.

## APPROVED WORK ORDER

Order ID: APPS-IMAGES-03-ORDER-01. Target APPS-IMAGES-03, risk medium.
Baseline evidence above: PASS. Closed nineteen-path allowlist above.

Move eight whole source/test files from reader into reader/images, unchanged
filenames and bytes. ReaderPublication imports loader through ./images;
SemanticDocument imports loader and SemanticRasterImage through ./images;
integration/package-reader-matrix imports loader, SemanticRasterImage and
raster-image-source through ../reader/images. Exactly six module-string
replacements; internal moved imports unchanged.

Ceiling: 5,400 added-plus-removed lines including 5,140 exact relocated lines;
20 outside import-edit lines maximum. Preserve every assertion, fixture, symbol,
React key/prop and body. Old files absent, new files/suites unique. Preserve
static-media/predecode limits, one decode, eight live sources, eight total
active-plus-queued loads, metadata agreement, cancellation/late-result release,
caller byte clearing, exactly-once URL revocation, close/drain and safe fallback.
No dependency, facade, barrel, configuration, product or unrelated change.

Reused worker is sole writer, must check baseline identities/guards and preserve
accepted native/publication/documentation changes. No tests or formatting
assigned; independent validator repeats the seven baseline commands plus exact
eight-file byte and three-consumer inverse-import proof, identities and guards.
No staging, commits, push, PR or branch/base changes.
