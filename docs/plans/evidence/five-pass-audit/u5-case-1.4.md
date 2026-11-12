# U5 case 1.4: preserve shared-unit Celsius ranges

Status: unit APPROVE FPA-U5-1.4-CR-R1-20261111; final integration pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`.
Scope: mutable narration-bilingual-normalizer.ts, narration-normalizer.test.ts,
public narration-preparation-matrix.test.ts and dated ADR-0063 clarification.
The completed M005 boundary and Complete roadmap status were reviewed. No frozen
normalizer, historical corpus, displayed text or public contract changed.

Reverse bounded same-prose/language recognition now admits a bare numeric left
endpoint across the range dash. Attached word digits remain an editorial control.
The existing forward Celsius-range recognition also protects lexical number
matches at the left endpoint. Existing128-code-point lookahead stays bounded;
no general number parser is introduced. Tests include English8 and Spanish21
where both endpoints previously expanded, Unicode numeric context, inline prose,
code/language barriers, signed standalone literals and editorial dashes.

## Host evidence

Normal local PowerShell outside sandbox, Node24.18.0/pnpm11.15.1, Vitest5.0.5.
Exact logs and paired manifests are in ignored tmp/evidence/five-pass-audit.

RED `u5-1.4-red-01.log`, 21:17:35.965–21:17:38.015 UTC, exit1:15 intended
failures, seven controls PASS,309 skipped. Both unit and actual public preparation
show the attributed partial expansion, before production changed.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts -t 'five-pass 1.4'
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-source.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts
pnpm.cmd exec prettier --check packages/epub/src/narration/narration-bilingual-normalizer.ts packages/epub/src/narration/narration-normalizer.test.ts packages/epub/src/integration/narration-preparation-matrix.test.ts
pnpm.cmd exec eslint packages/epub/src/narration/narration-bilingual-normalizer.ts packages/epub/src/narration/narration-normalizer.test.ts packages/epub/src/integration/narration-preparation-matrix.test.ts
pnpm.cmd --filter @voxleaf/epub run typecheck
```

G0 `u5-1.4-build-packages-01.log`, 21:19:04.190–21:19:05.966 UTC, exit0,
before the public GREEN that consumes dist. Only mutable normalizer emitted JS,
declaration map and EPUB build-info changed. Current emitted JS SHA-256
`5D07C67E3D5D442BC57B3D5A7CFD303FB8F4F5522774D3B6867E5F075739FB09`.
The before-build value was
`7ACD9C65783285494DA2DE9C254552AF33526336E5355806FCE4041140BC263A`;
the initial handoff reversed that direction, corrected against original manifests.

GREEN `u5-1.4-green-01.log`, 21:19:21.235–21:20:02.848 UTC, exit0:358/358.
Includes all three mutable profiles, single/multiple batches, exact source ranges,
display/frozen controls and real work/resource/cancellation bounds. Static log
`u5-1.4-static-01.log`, 21:20:25.041–21:20:29.453 UTC, all exit0.

RED paired manifest SHA-256
`EE83231D1592522110FF22703AC7A85018F72DBC4FBF009BA3F40F1B63A8FDBB`.
G0 post/GREEN/static paired manifest SHA-256
`52C88BA6A15BC8C4391DBCD40B1453FCBF2BC93EE32328A97E1102BD7BA5D1E8`.
The generic capture's desktop-local Vitest path is absent; actual root Vitest5.0.5
CLI SHA-256 is `39DB22F579ACF5639BBB17A261408DEBBDE03F4692C0C439E77E7F13AEBA74D6`,
package manifest `D00333F3A13ED44FEDC77184C8675BAE45246534F06684D94CFF5E4F8A9F7C10`.
This capture-path limitation is disclosed for review; it is not an alternate test run.

## Frozen review binding

Closed18-path `u5-1.4-review-inputs.txt` SHA-256
`5C784C670262BA3A464390BF6571ED0117AC66EC6D2075038916BD6E30718A92`.
Exact four-file `u5-1.4-review.diff` SHA-256
`BF9260B47F557C4CDEF6F6A1819CF7850AB8A0F290A769A15762D10CC752F7D7`.
Production SHA-256 `3DEDA84532EB66DCA3D483A0A18001BD33BFAD5254F441001D56A9759982A4BD`,
blob `19ae61f16fcba454c61836b23e918e54ceb4bd31`. Full paths/identities in manifest.

All251 emitted EPUB/shared files in the G2 before/after capture were rehashed
against current bytes: `u5-1.4-review-built-inputs.txt`, SHA-256
`86917962D191E4B2583561CAA7C9C0D9EE9A6D42D6707B7127CDAC959616019F`.

No historical PASS reuse. Later normalization edits invalidate affected G0/G2;
final G7/G11/G12 and integrated acceptance remain pending.
