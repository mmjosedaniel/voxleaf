# U4 execution evidence

- Receipt: `DCR-U4-EXEC-20261109-01`
- Plan: [Deep Chat Audit Minimal Corrections](../../active/deep-chat-audit-minimal-corrections.md)
- Finding: DCR-09
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U4/`.

The mutable Celsius guard now recognizes an attached sign and comma/dot decimal
in the bounded right-neighbor check. Both endpoints remain literal in the
unsupported range. Existing backward checks, prose dashes, standalone Celsius
expansion, same-language/code barriers, and source-map rules remain in place.
The tests exercise ES and EN, both separator spacings, both endpoint directions,
and all three mutable profiles through public preparation. The legacy v1
normalizer is unchanged. M005's locator/source contract still applies.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts -t DCR-09
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts
pnpm.cmd --filter @voxleaf/epub run build
```

| Phase | Result |
| --- | --- |
| RED, first command | Exit 1. Nine intended expansion failures and four passing inverse controls, 296 skipped. The direct mutable normalizer matched HEAD. |
| First candidate, second command | Exit 1. Direct normalizer and resource-bound files passed. Four public cases failed because the test imports the existing package dist and direct `exec vitest` skips its pretest build. The stale output still has the integer-only branch. This is not an overall passing run. |
| Scoped export refresh, third command | Exit 0. The configured EPUB build updated the compiled normalizer without changing source. |
| Exact final GREEN, first command | Exit 0. All 13 regression/control cases passed against rebuilt public exports, 296 skipped. An earlier shell selector using pipe characters returned exit 255 before Vitest and is retained separately. |

Scoped `pnpm.cmd exec prettier --check` and `pnpm.cmd exec eslint` passed on
the three owned TypeScript files. Host was normal local PowerShell 7.6.9,
Node v24.20.0, pnpm 11.15.1 via offline Corepack and Vitest v5.0.5.
Before/after exact input snapshots matched. U13 will invalidate the EPUB
export; final G0/G2/G7 remain pending. No historical PASS was reused.

## Public export identity

| Artifact | Before scoped build SHA-256 | After scoped build SHA-256 |
| --- | --- | --- |
| `packages/epub/dist/narration/narration-bilingual-normalizer.js` | `751ddecde5978b994a8d94cd3cedbccadb3673a73cb0f616290e031e24f59fdf` | `7acd9c65783285494da2de9c254552af33526336e5355806fce4041140bc263a` |
| `packages/epub/dist/index.js` | `3f5c07c947cf141c0e0630d1615db8bcab24cf29fef860be2f8bc692907a70dc` | same |
| `packages/shared/dist/index.js` | `a4b9362ba3885a729948ee1671d9f07cacf2794966392ad0c76979eb20a938fd` | same |

## Closed reviewed inputs

The first four paths comprise the unit patch. Supporting inputs include the
unchanged v1 normalizer and package build configuration captured at review
handoff and matching HEAD. The root package already includes U8. The staged
index is empty.

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `packages/epub/src/narration/narration-bilingual-normalizer.ts` | ` M` | `fa248b84ccba2f2d49fc8a62b893980e0c76266cd3488e282e3bf4bedc593455` | `6569f4b74bb875ae14c354b7f93d440952f52552` |
| `packages/epub/src/narration/narration-normalizer.test.ts` | ` M` | `8d37c971b4fa65bc42538a6eaaca346ec7c8c04ece5979bda7f695d0d0077c7f` | `4c75ecc8736680c0e96c8565558d347b0383784b` |
| `packages/epub/src/integration/narration-preparation-matrix.test.ts` | ` M` | `83fb83426d4cc81c0df394937d200916a7aee03585075b7bbebe83520ef30d31` | `ac9731344d727cdc7f214092392f7889dad6e3b0` |
| `docs/architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md` | ` M` | `2e7e071ce84898c79a1dcfe6e2b245b3c34c983da0842af17a685c7daacb47db` | `c7ee0d5b03b1088843537566c1334fb27d576125` |
| `packages/epub/src/narration/narration-resource-bounds.test.ts` | `clean` | `a0825f6bd4d6cb80e03fdd343c1d889b09a5cec6f155b39e72d1efcf1da8448c` | `d9c99331bc1aadc761bf8156a6fd93f90ce44863` |
| `packages/epub/package.json` | `clean` | `c2af38f62b794a205398d5ffd6634407ddb8ff0b6065a83de337928b2aaed644` | `a67b753fb528b9287620b12b6155a6a76f1d5eb7` |
| `packages/shared/package.json` | `clean` | `6c4589dab226a7203f67f46c6a448b3a6e7e4514ccfcb40366a25c176aff7c17` | `fb9a2fd5f32db7faac432f595fa5dd5e92062179` |
| `package.json` | ` M` | `79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6` | `fd94e123a32a6b4a44d5ccb296cd89e25b319232` |
| `pnpm-lock.yaml` | `clean` | `e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426` | `acf5034202c5933f5c1dff89beff28587c826088` |
| `pnpm-workspace.yaml` | `clean` | `efb8ff9911192e80897352cbacccc0cb1d53ef130b64bb98f813c973694f5363` | `b6615e1277536c992be3a14cdaa04235a1117330` |
| `.gitattributes` | `clean` | `d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4` | `5acf47068be3a84b4e38b502877083e99b5ce0f9` |
| `packages/epub/src/narration/narration-normalizer.ts` | `clean` | `ee21d38776fd10ad1b2a6325cca722e4a10bc9c4d217faffccec7668858396e1` | `c14853b4b96b28569de2a7beefcff08baf5bd4dd` |
| `packages/epub/tsconfig.json` | `clean` | `3c09f28a5b34bfb2b4dc1f290f70b7a85e1832eaed908cf6bcf31ac25c1c1510` | `595fbd13ac13de377bc4082054f0d3f94eeb700a` |
