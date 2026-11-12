# U5 case 2.5: incremental structural language validation

Status: unit APPROVE FPA-U5-2.5-CR-R1-20261111; final integration pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`.
Scope: current bilingual normalizer, existing normalizer/public matrix tests,
resource-bound test, MVP requirement and cumulative ADR-0063 from1.4.

The old scanner admitted malformed tags based largely on subtag length and
singleton payload. Current scanning enforces the ordered extlang/script/region/
variant/extension/private-use structure for supported English/Spanish prefixes.
Casefolded short keys reject duplicate variants and extension singletons; private
payload stays opaque. The exact case-insensitive en-GB-oed exception remains.
This is structural validation per [RFC5646](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1),
not an IANA registry-validity assertion. No network/dependency or frozen v1 change.

Work remains incremental at the existing512 checkpoint cadence, with at most
eight-character casefolded subtag keys, transient state per scanned tag and the
existing admitted-document/work bounds. A long distinct-variant test proves
yield/abort then successful retry with a late duplicate remaining literal.
Public tests preserve displayed language attributes and exact source ranges.

## Host evidence

Normal PowerShell outside sandbox, Node24.18.0/pnpm11.15.1/Vitest5.0.5.
Raw logs and paired manifests are in ignored tmp/evidence/five-pass-audit.

RED `u5-2.5-red-01.log`, 21:27:46.103–21:27:47.792 UTC, exit1:16 intended
failures, nine controls PASS,342 skipped. Long-variant cancellation itself passed;
the old scanner incorrectly expanded on retry despite a duplicate variant.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts -t 'five-pass 2.5'
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-source.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
pnpm.cmd exec prettier --check packages/epub/src/narration/narration-bilingual-normalizer.ts packages/epub/src/narration/narration-normalizer.test.ts packages/epub/src/narration/narration-resource-bounds.test.ts packages/epub/src/integration/narration-preparation-matrix.test.ts
pnpm.cmd exec eslint packages/epub/src/narration/narration-bilingual-normalizer.ts packages/epub/src/narration/narration-normalizer.test.ts packages/epub/src/narration/narration-resource-bounds.test.ts packages/epub/src/integration/narration-preparation-matrix.test.ts
pnpm.cmd --filter @voxleaf/epub run typecheck
```

G0 `u5-2.5-build-packages-01.log`, 21:29:18.364–21:29:20.106 UTC, exit0.
Only mutable emitted JS/declaration map and EPUB build-info changed.
GREEN `u5-2.5-green-01.log`, 21:29:29.828–21:30:11.371 UTC, exit0:383/383,
including renewed1.4 and public/source/resource controls. Scoped static log
`u5-2.5-static-01.log`, 21:30:47.420–21:30:51.989 UTC, all exit0.

RED paired SHA-256 `4494B1AC282B74E1F11EE6AD36DA4428DE4383D4E247B255F92127A5CB2231FA`.
G0 post/GREEN/static paired SHA-256
`7C922A26B036198CBD1CBFF35C6595F8B5D9329E0D4DBF9AE46B2F7C078F55F5`.
The capture now includes actual root Vitest CLI/package hashes before and after;
original earlier receipts remain unchanged.

## Frozen review binding

Closed19-path `u5-2.5-review-inputs.txt` SHA-256
`ECB452D2550D5F12AC90F0DB3FE08F8C5EB925CE87E325B2534ED8CD0710F04E`.
Exact six-file cumulative U5 `u5-2.5-review.diff` SHA-256
`990468F08DABCED89AD347A89E7917418AB9EB776D726B7360C89887F31CBC34`.
Current source SHA-256 `0726182E97889C3C47438B903863C60D8463C008197A9ED4973A0325D90BDECB`,
blob `581a946538ba98cc60c16268ceb08750c0cfbc3b`.
All251 emitted file identities and membership were rechecked in
`u5-2.5-review-built-inputs.txt`, SHA-256
`DCD08CD77955FF4CEFC30D13B39E28FA379076EA5328E4CCD202C85631839A85`.
Emitted normalizer JS SHA-256
`3A0DD2C0EB352D706D478EB15AB6FE80B24D154FE1445CA5E6C8F202FDE94D59`.

No historical PASS reuse. Later EPUB source drift requires affected G0 evidence;
G7/G11/G12 and final integrated acceptance remain pending.
