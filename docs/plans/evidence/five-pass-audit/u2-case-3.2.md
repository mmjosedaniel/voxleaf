# U2 case 3.2: startup lead before first allocation

Status: unit APPROVE FPA-U2-3.2-CR-R1-20261111; fresh integrated assessment pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`.
Allowlist: adaptive-buffer-scheduler.ts, its existing test, and pcm-playback.test.ts
under apps/desktop/src/tts. PCM production remains unchanged. Earlier U1 bytes
are preserved but its scheduler dependency requires current reassessment.

The RED holds three 15-second units with incomplete Prepared-60 preparation.
At 75% they supply 60 effective seconds; selecting 100% before allocation leaves
only 45. The scheduler retained playing and the PCM owner started sequence 0,
both directly and after Pause/Resume, while the old rate preparation was held.

Startup commitment now follows first actual allocation, positive direct sample
consumption or explicit Play available. Before commitment, refresh/Resume checks
the initial lead again. Quick's early production target remains available while
eligible or paused. Added explicit-override control and existing complete tails,
refill, pause, deferred-rate and bound assertions pass. This is controlled
model-free evidence; the real worklet/browser scenario remains a final G6 duty.

## Host commands and outcomes

Normal local PowerShell outside sandbox, repository root; Node 24.18.0,
pnpm 11.15.1, Vitest 5.0.5. Receipts below live under ignored
`tmp/evidence/five-pass-audit/`.

RED `u2-3.2-red-01.log`, 20:23:27.265–20:23:29.482 UTC, exit 1:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts -t 'five-pass 3.2'
```

Three matching failures, 103 skipped. Paired input SHA-256:
`3BD97A53257666E19380D7A60E915CC450A51B43A9AC3B978DBF58666EBF1861`.

GREEN `u2-3.2-green-01.log`, 20:24:34.389–20:24:39.722 UTC, exit 0, 453/453:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts src/reader/ReaderPublication.test.tsx src/App.test.tsx
```

Static `u2-3.2-static-01.log`, all exit 0:

```powershell
pnpm.cmd exec prettier --check apps/desktop/src/tts/adaptive-buffer-scheduler.ts apps/desktop/src/tts/adaptive-buffer-scheduler.test.ts apps/desktop/src/tts/pcm-playback.test.ts
pnpm.cmd exec eslint apps/desktop/src/tts/adaptive-buffer-scheduler.ts apps/desktop/src/tts/adaptive-buffer-scheduler.test.ts apps/desktop/src/tts/pcm-playback.test.ts
pnpm.cmd --filter @voxleaf/desktop run typecheck
```

Intervals: 20:25:04.863–20:25:05.589, 20:25:05.590–20:25:07.068,
20:25:07.069–20:25:10.759 UTC respectively. GREEN/static paired input SHA-256:
`634AC711DADBD431542E8B3EC91471962BAA060B2EA53DBCCDCC9AC2AF0A851C`.

Closed 14-path current manifest `u2-3.2-review-inputs.txt` SHA-256:
`FEF4C86FA7D2F326510DC1DF042C525ECB68515F72192E6ED981F1FFD12FAD3B`.
Full U1/U2 patch `u2-3.2-review.diff` SHA-256:
`34F131D74977060C568BF2EF85A69E7BC3AED9726A65D443A9CE145E94A96713`.

| Changed U2 path | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| adaptive-buffer-scheduler.ts | EDC6CEF8D473B5AEABB3597263E75E9EADFB8D22C3A137894C63D79C6251B3F9 | 8d3c57692986ee0d5eebd386d11ecb5404afc040 |
| adaptive-buffer-scheduler.test.ts | 2853986F9942150FEF1ABB5486BFB0CF55FBFE5847D38008973822B11A651295 | e6c193936b0555cfbb7b4b7527938463246e8b1c |
| pcm-playback.test.ts | E730A11606D0B24BB75AEA8FE19E5A6A09D5A767ACA9AC62052FC3EC9D493C07 | c0c001b2c40e7c00f2772179790824fdd5dad227 |

No historical PASS reused; fresh GREEN includes U1 controls. G6/G7/final G11/G12
and exact integrated review remain pending. No native/installer/GPU/firewall
operation has been started.
