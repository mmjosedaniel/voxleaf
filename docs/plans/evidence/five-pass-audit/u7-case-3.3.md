# U7 case 3.3: Reset awaits current compatibility

Status: unit APPROVE FPA-U7-3.3-CR-R1-20261111; final integration pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty.
Scope: narration-settings-actions.ts/test, App.test.tsx and the SPM-01 hardware
fake in product-narration-coordinator.test.ts, plus product settings documentation.
Product coordinator production is unchanged from its earlier campaign patch.

Reset now awaits explicit-recheck after a successful language reset and before
refreshing the narrator, retaining its configuration barrier. The real hardware
coordinator, full registry and synthetic supported development-host facts expose
the old behavior: English/Piper recommendation reached the consumer before the
saved Aiden preference was restored; held detection did not prevent completion.
Tests also verify actual Aiden authorization/Piper denial, newer explicit Piper
selection winning a pending probe, failed Stop, false/partial reset and rejection
releasing the barrier. No real Qwen inference or new selection policy is claimed.

## Host evidence and fixture adaptation

Normal PowerShell outside sandbox; Node24.18.0/pnpm11.15.1; actual root Vitest
identities captured. Logs/paired manifests: ignored tmp/evidence/five-pass-audit.

RED01 `u7-3.3-red-01.log`, 21:45:03.225–21:45:05.347 UTC, exit1: two intended
failures,48 skipped. Prior production is bound by its before/after manifest.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/settings/narration-settings-actions.test.ts -t 'five-pass 3.3'
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/settings/narration-settings-actions.test.ts src/tts/hardware-profile-compatibility.test.ts src/settings/ReaderSettingsDialog.test.tsx src/App.test.tsx src/tts/product-narration-coordinator.test.ts
pnpm.cmd exec prettier --check apps/desktop/src/settings/narration-settings-actions.ts apps/desktop/src/settings/narration-settings-actions.test.ts apps/desktop/src/App.test.tsx apps/desktop/src/tts/product-narration-coordinator.test.ts
pnpm.cmd exec eslint apps/desktop/src/settings/narration-settings-actions.ts apps/desktop/src/settings/narration-settings-actions.test.ts apps/desktop/src/App.test.tsx apps/desktop/src/tts/product-narration-coordinator.test.ts
pnpm.cmd --filter @voxleaf/desktop run typecheck
```

GREEN01 retained393 PASS/three failures because existing App read/reset fixtures
and coordinator SPM-01 fake lacked the newly required check method; static01
retains TS2741. Work-order expansion added only that method to those two test
files, preserving original assertions. No runtime scope expansion occurred.

The unchanged G1 command in `u7-3.3-green-02.log`,
21:46:56.332–21:47:01.934 UTC, passes396/396, exit0. Static02,
21:46:58.118–21:47:04.749 UTC, all exit0.
RED paired SHA-256 `0B913105702A509FF57B4A43959C6C161467561275FF05F718FA70055DABFF40`.
GREEN02/static02 paired SHA-256
`C5B5F2EFB05F0B60BF5A9D4CF8EDC2B7F64A206D78B58E128E3EE6C4E026F783`.

## Frozen review binding

`u7-3.3-review-inputs.txt` SHA-256
`BA99281AA45345D04469AD2394448B763BE7F23C8C3214BF473A30E08A0AB698`.
Exact current scoped diff `u7-3.3-review.diff` SHA-256
`659D1772BAA618AE03010C2A5DA63B8C00152FAB5B1B16E3D772FA117E0B0770`.
Earlier U1 test changes are included in that same current test file; review must
reassess relevant U1 behavior against the fresh run and unchanged coordinator.

No historical PASS reuse. All251 current built files/membership match U6's G0
artifact manifest `A37841A04AA3C673316D43E03276DE7539B58FC0AAC67D1AE99564A306330466`;
this reuses verified build bytes, not a behavioral result. Directed browser Play
identity and G7/G11/G12/final integrated acceptance remain pending.
