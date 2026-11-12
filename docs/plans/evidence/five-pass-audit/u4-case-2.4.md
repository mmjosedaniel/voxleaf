# U4 case 2.4: latest matching intersection observation

Status: unit APPROVE FPA-U4-2.4-CR-R1-20261111; final integration pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`.
Allowlist: SemanticRasterImage.tsx and its test; earlier 1.3 bytes unchanged.

The default visible and near observers previously selected the first matching
entry in a batch. Two controlled REDs prove a newer positive-ratio entry is
ignored for each margin. Selection now uses greatest time for the same target,
with the later array entry breaking ties. Both array orders, foreign targets,
ratio-only intersection, independent visible-over-near priority and disposal are
covered. The existing fallback, local image ownership and memory limits remain.

## Host evidence

Normal PowerShell outside sandbox, Node24.18.0/pnpm11.15.1. Logs and paired
manifests are in ignored `tmp/evidence/five-pass-audit/`.

RED `u4-2.4-red-01.log`, 21:11:03.623–21:11:05.835 UTC, exit1: two intended
failures, one precedence/disposal control PASS, ten skipped.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/images/SemanticRasterImage.test.tsx -t 'five-pass 2.4'
```

GREEN `u4-2.4-green-01.log`, 21:11:33.877–21:11:37.695 UTC, exit0:135/135.
The exact five-suite command is the [1.3 receipt](u4-case-1.3.md)'s G1 command.
This refreshes 1.3 and RPI controls after its component dependency changed.

```powershell
pnpm.cmd exec prettier --check apps/desktop/src/reader/images/SemanticRasterImage.tsx apps/desktop/src/reader/images/SemanticRasterImage.test.tsx
pnpm.cmd exec eslint apps/desktop/src/reader/images/SemanticRasterImage.tsx apps/desktop/src/reader/images/SemanticRasterImage.test.tsx
pnpm.cmd --filter @voxleaf/desktop run typecheck
```

Static log `u4-2.4-static-01.log`, 21:11:51.678–21:11:57.447 UTC: all exit0.
RED paired input SHA-256
`4B9145644A2AB4CEA533EE33AA4B607A9D13A3E472CB3C5DA35242919E4C5D4E`;
GREEN/static paired input SHA-256
`439090B3FDD2EB4C3C58CDF89D3DB8F6A7CFC21DDFFAFA3C614C2282D29BE7F7`.

## Frozen review binding

Closed13-path `u4-2.4-review-inputs.txt` SHA-256
`BD3427FEFD5D5F5EE766DD1BEF18122683EC91B03DD7F845C18CD8B41CA8D134`.
Exact four-file U4 patch `u4-2.4-review.diff` SHA-256
`AED32EF388D4D2BEE09F91B33AF6BCD1FFE42486DFBE520CE0C60E38A04FB49F`.
Component SHA-256 `D21D6385D8CC1F0EED562E76B4DF551748BE2A5F938F1AF099039B6336946EA5`,
blob `244def726ccfabe9c7f2f7932780501a989517e5`.
Test SHA-256 `B5196190FF222EA7D5FAB54BC52E8299F5793F624993685DDD4497F689194430`,
blob `537f710d68210a8e987b8131b1a839314179cd1a`.

No historical PASS reuse. Controlled browser and final G6/G7/G10/G11/G12 remain
pending; this receipt does not claim natural observation or integrated acceptance.
