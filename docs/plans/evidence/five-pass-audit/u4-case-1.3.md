# U4 case 1.3: dispatch current visible images first

Status: unit APPROVE FPA-U4-1.3-CR-R1-20261111, header clarified by R1-A1;
final integration pending. See [original report](review-U4-1.3-R1.md) and
[verdict addendum](review-U4-1.3-R1-A1.md).
Base/HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`.
Allowlist: publication-raster-image-loader.ts and its existing test.

Three controlled REDs hold the active decode, then prove visible demand loses to
queued near demand, including visible demand outside a full eight-request queue.
The third changes visibility before dispatch and checks FIFO within each current
tier. Dispatch now selects the first queued visible occurrence, or admits waiting
visible demand into the freed slot before near work. A private weak association
preserves the public load options/signature and existing caller spy seam. No
additional resource queue, active cancellation or memory-budget expansion occurs.

The older RPI queue-drain fixture used read ordinal to choose malformed bytes.
Priority intentionally changes that ordinal, so it now binds malformed bytes to
an explicit resource identity, retaining eight unavailable results and zero live
release/revocation assertions. Existing abort, error, saturation and lifecycle
controls remain in the full selected suites.

## Host evidence

Normal local PowerShell outside sandbox; Node 24.18.0, pnpm 11.15.1. Raw logs and
paired input manifests are in ignored `tmp/evidence/five-pass-audit/`.

RED `u4-1.3-red-01.log`, 21:04:27.599–21:04:30.475 UTC, exit 1: three attributed
dispatch failures, 12 skipped. Production unchanged before this reproduction.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/images/publication-raster-image-loader.test.ts -t 'five-pass 1.3'
```

GREEN `u4-1.3-green-01.log`, 21:05:39.695–21:05:43.422 UTC, exit 0: 132/132.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/images/publication-raster-image-loader.test.ts src/reader/images/SemanticRasterImage.test.tsx src/reader/images/raster-image-source.test.ts src/reader/SemanticDocument.test.tsx src/reader/ReaderPublication.test.tsx
pnpm.cmd exec prettier --check apps/desktop/src/reader/images/publication-raster-image-loader.ts apps/desktop/src/reader/images/publication-raster-image-loader.test.ts
pnpm.cmd exec eslint apps/desktop/src/reader/images/publication-raster-image-loader.ts apps/desktop/src/reader/images/publication-raster-image-loader.test.ts
pnpm.cmd --filter @voxleaf/desktop run typecheck
```

Static commands: `u4-1.3-static-01.log`, 21:06:22.515–21:06:28.317 UTC, all exit 0.
RED input SHA-256 `258AA693BE1B2122D1FD540CCFA5531AF637CCDB87A6EF936F4495F25ADCC5A5`;
GREEN/static paired input SHA-256
`E467B3466447315548140AD1C9A1F9DEF5E579E7EBD48080CD37B65D3F6C80CD`.

## Review binding

Closed 13-path `u4-1.3-review-inputs.txt`, SHA-256
`05CF383E9EAEB33534802676F8654DBA356F8417CB218AE5AD3DA1760BFD3D56`.
Exact two-file `u4-1.3-review.diff`, SHA-256
`BA702223BCF0728DF5D45047A1C5B650087BEF569BDEC37296DBE7ECCBB5D996`.
Loader SHA-256 `2CDB4AC8E08E070EDE6DD34EF3F41F1D9CC4C95CA0F0F034A05244ED2C750981`,
blob `a685cccead78aaeb35fcd0ff47efa0781202f958`.
Test SHA-256 `B27F2A50BD71D92AE4E42BE40D7CF5E40F6C7562EAAA0D15DF6E2F747CB5E249`,
blob `c006717133e21d0fc0d4b3189e94fde93657b7ef`.

No historical PASS reused. G6/G7/G10/G11/G12 and final integrated review remain
pending. One decode, eight outstanding/retained sources and aggregate pixel
limits remain acceptance invariants.
