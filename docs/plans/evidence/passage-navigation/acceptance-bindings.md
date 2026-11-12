# Passage navigation acceptance bindings

Environment: normal local PowerShell 7.6.9 outside the sandbox, Node 24.18.0, pnpm 11.15.1. HEAD: `6dd694b815bf52b34e4644487067ec2ba3a8956d`; index empty. Raw immutable receipts and their complete before/after input rows are under ignored `tmp/evidence/passage-navigation/`. SHA-256 values below bind recorded evidence; they are not refreshed historical approvals.

## desktop-final-07

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/integration/package-reader-matrix.test.tsx src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/reader/active-visual-locator.test.ts src/persistence/narration-position-save-bridge.test.ts src/persistence/reader-position-save-coordinator.test.ts src/App.test.tsx
```

UTC: 2026-11-12T16:44:39.1963261+00:00 to 2026-11-12T16:44:48.7466804+00:00. Exit: 0.

Input manifest SHA-256 (before = after): `87863820B8AFE7B3DF2A86819301DE73DF06C278B67E8003B7CDB6F625C79AAD`.
Log SHA-256: `FBD1EECBA47B96CE5A891716B5DFF82681F6922BDB10D170A4A394A2C9F28B48`.

## desktop-affected-final-08

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/integration/package-reader-matrix.test.tsx src/reader/ReaderPublication.test.tsx src/App.test.tsx
```

UTC: 2026-11-12T16:45:44.1209101+00:00 to 2026-11-12T16:45:53.1137158+00:00. Exit: 0.

Input manifest SHA-256 (before = after): `022965D47D57D245543541B807DF29E2F12D36E12344E4B59EE239161D2F0F8D`.
Log SHA-256: `5BD1445C4195197361D451944CA81C03197368D0A535EA14C8917B1AF1413276`.

## epub-final-01

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-source.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/locator/target-resolver.test.ts src/public/open-epub-publication.test.ts src/navigation/navigation-document.test.ts src/integration/ingestion-matrix.test.ts
```

UTC: 2026-11-12T16:27:32.2124774+00:00 to 2026-11-12T16:28:15.0129583+00:00. Exit: 0.

Input manifest SHA-256 (before = after): `0D8B45786779D64C0D303BB97D19BDD858C6F7543F9BE0171CF127FC1867A537`.
Log SHA-256: `48D0C12D1613CA041D6425B5D21D9918F6B9908DEA8E68CE52C8073D06ECD992`.

## harness-final-02

```powershell
pnpm.cmd test:native-smoke-harness
```

UTC: 2026-11-12T16:52:01.2507958+00:00 to 2026-11-12T16:52:59.2083866+00:00. Exit: 0.

Input manifest SHA-256 (before = after): `9E61C738EB9772B5A3A774EFCC4D8614CAC7CAAD48B9C9DFF1AA8A91F621FEE5`.
Log SHA-256: `E490C83CED33368BC3FDC4EA3CF7895B773E97AF79C067099E88B32E5372B52F`.

## types-final-09

```powershell
pnpm.cmd --filter @voxleaf/desktop run typecheck
```

UTC: 2026-11-12T16:46:29.9317255+00:00 to 2026-11-12T16:46:33.1235177+00:00. Exit: 0.

Input manifest SHA-256 (before = after): `C089FC9A17FD2B402D762CAB8053D6D7D76BC63BFDFCB99C07F1424855565C6B`.
Log SHA-256: `014A891360E8BF3C856C604E13BA0DEE2EEAF7AA4121C9CB1A2EF4796A223B4C`.

## lint-final-09

```powershell
pnpm.cmd exec eslint apps/desktop/src/App.tsx apps/desktop/src/reader/ReaderPublication.tsx apps/desktop/src/reader/ReaderPublication.test.tsx apps/desktop/src/reader/reader-navigation.ts apps/desktop/src/reader/segment-highlight-controller.ts apps/desktop/src/reader/segment-highlight-controller.test.tsx apps/desktop/src/tts/ProductNarrationControls.tsx apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts apps/desktop/scripts/native-smoke/tts-scenarios.mjs
```

UTC: 2026-11-12T16:46:30.6602425+00:00 to 2026-11-12T16:46:34.4757884+00:00. Exit: 0.

Input manifest SHA-256 (before = after): `C089FC9A17FD2B402D762CAB8053D6D7D76BC63BFDFCB99C07F1424855565C6B`.
Log SHA-256: `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`.

## format-final-09

```powershell
pnpm.cmd exec prettier --check apps/desktop/src/App.tsx apps/desktop/src/reader/ReaderPublication.tsx apps/desktop/src/reader/ReaderPublication.test.tsx apps/desktop/src/reader/reader-navigation.ts apps/desktop/src/reader/segment-highlight-controller.ts apps/desktop/src/reader/segment-highlight-controller.test.tsx apps/desktop/src/tts/ProductNarrationControls.tsx apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts apps/desktop/scripts/native-smoke/tts-scenarios.mjs
```

UTC: 2026-11-12T16:46:30.7038466+00:00 to 2026-11-12T16:46:33.3406164+00:00. Exit: 0.

Input manifest SHA-256 (before = after): `C089FC9A17FD2B402D762CAB8053D6D7D76BC63BFDFCB99C07F1424855565C6B`.
Log SHA-256: `F20510A9DA4717C51C4CFFEE6D0DD88D6C9A723D0A83711D01216F5B48961283`.

## browser-final-09

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts reader-image-lifecycle.smoke.spec.ts --grep 'PN-|five-pass 1[.]1|five-pass 5[.]1|VCA-06/09|BNC-01|RCF-17|final RCF-16|DCR-03/23|RPI-01/C1'
```

UTC: 2026-11-12T16:46:30.8714049+00:00 to 2026-11-12T16:47:53.9359654+00:00. Exit: 0.

Input manifest SHA-256 (before = after): `C089FC9A17FD2B402D762CAB8053D6D7D76BC63BFDFCB99C07F1424855565C6B`.
Log SHA-256: `7A5D04614823FA77D98199B5CE797EEE16A016BB216E3B6F50DF12924D2DF3A2`.

## Current changed source identities

These are the final source/test bytes after PN-R1-F1. Documentation and unchanged supporting paths are additionally bound by the independent closed review manifest.

| Path                                                                 | Worktree SHA-256                                                   | Filter-aware blob ID                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs`                | `2729E193295DE7414F34B2BCD621FBCC593E34B8DD2B98BBFABD5E5B83EE4369` | `046ab90658a4bb0d41ed70a20437da9f8f0ccbb4` |
| `apps/desktop/src/App.tsx`                                           | `5BD928217E99B07A611763960003497B6B2772915080920F852830D9DA4071C1` | `13680b62bc4b84afb48deeabef0f2f1a3c5e11a0` |
| `apps/desktop/src/reader/ReaderPublication.test.tsx`                 | `983C3EEDE09B08E19116948CDF9F0073AC8C9D972EC0FE03F2D8805F64B6830E` | `15e5de3df411ec1f534484bb5fd80c844fd5ec10` |
| `apps/desktop/src/reader/ReaderPublication.tsx`                      | `B8A30825586D7C7BD0B5127976201FE0E330D7450C026EDB320807D948F5B2DC` | `cd93a7e1ab04991d85b635429e40dcb18e66ef85` |
| `apps/desktop/src/reader/reader-navigation.ts`                       | `5A9AC270DB45CEFF6466106CDD5FF604C7047F40E6067829A2B4791017893EC3` | `e83f99b45013815cc51d53b11a8c17618e035af1` |
| `apps/desktop/src/reader/segment-highlight-controller.test.tsx`      | `30A03E9E0F50F94691E6B3392A594D5643BED5E9C8D7C1D1944A2D617C96D1C1` | `74326e7e7c05e46a5a2c5a3205b1e4893e68b2d5` |
| `apps/desktop/src/reader/segment-highlight-controller.ts`            | `3E71721968D136E201A56A292D76337921B0ADC73AFE2CBCB27B0038A8D05E30` | `a884ce0f1668f54e10add3376c4700df1d99e443` |
| `apps/desktop/src/tts/ProductNarrationControls.tsx`                  | `03CC9C22AD68BD6199DE4F5C1E834C161576290D1E210117C014B29E9C8EB9B7` | `b811ac9b0072819e3d93129ad7bca87de9f0dc2a` |
| `apps/desktop/src/tts/product-narration-coordinator.test.ts`         | `71AC9F6B9A282E7C62AD1DC77FB04A595659160431DBC816C5714EFFAED2BB9D` | `4e781fc361381ebb7829e3498bd6e6c95572d114` |
| `apps/desktop/src/tts/product-narration-coordinator.ts`              | `9F4C595DC10CA4A233A91146350114C3B214171D6B71B32793C64DB471CBFD28` | `42c06ef135da00cbf8b8b61ba5dacdacf8e0b3eb` |
| `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts` | `3ED737EC766D5623D88C77BDF3E6504FEB19D2A68A7D24B86B07B1E093AA0A51` | `726a42ba46d08ad65a66aa925a7ccd7a677fed9a` |

## Native commands

The selected native wrapper journals resources before holding the adjacent core, checks source/tool/model/build identities, and verifies restoration in finally. It invokes these repository commands:

```powershell
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en --preflight-only
pnpm.cmd test:native-startup
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en
```

## Final native A03 binding

### g7-native-startup

UTC: 2026-11-12T16:48:24.8120766+00:00 to 2026-11-12T16:49:16.1704590+00:00. Exit: 0. Source/tool/output identities and owned cleanup verified; host restored.

Log SHA-256: `5DA81914AE9C33DC0FEBF701D3D996344C27F058B7261CF50EAB187A73ED943C`.
Source manifest SHA-256: `B0E909F24F42F1CCF2E3BEADCBB9E4F7BCAE2BB915AB9035877D300BD14B27A0`.

### g7-piper-en

UTC: 2026-11-12T16:49:27.2281684+00:00 to 2026-11-12T16:51:15.2273803+00:00. Exit: 0. Source/tool/output identities and owned cleanup verified; host restored.

Log SHA-256: `59EA90E4EC77B2C4B9C91AB0068FD4EF140B4B5C427DCA31790560A983F8B448`.
Source manifest SHA-256: `B0E909F24F42F1CCF2E3BEADCBB9E4F7BCAE2BB915AB9035877D300BD14B27A0`.

Both gates use executable SHA-256 `AEE860FEB28A5A9319868208DCFE5974A9D1C188B12C98D394AFFDCCCDA09692` and frontend manifest SHA-256 `627841147D6F9DD0933C2A83433F36EBD6EB883BDC43C499BA56D29630D5DB03`. Runtime/build dependency closure:1,494 files; package outputs:251 unchanged files. The private original-resource inventory is intentionally omitted. Final restoration is verified, no temporary hold remains, and the later harness leaves host state identical to the A03 preflight.

Piper observed17 segment transitions, valid source ranges, no stale playback, no external requests and201 ms cancellation. Cleanup reported zero retained/discarded units and zero generated audio files. The new native first-transition assertion passed for synthetic contiguous narration. These observations concern software playback/rendering, not independently measured physical audibility.
