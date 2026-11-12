# U3 case 5.2: pointer and focus placement ownership

Status: unit APPROVE FPA-U3-5.2-CR-R1-20261111; final integration pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`.
Only ReaderPublication.tsx and its existing test change for this case. Earlier
5.1 browser fixture and other production bytes remain intact.

Both controlled DOM regressions advance the real reader locator within A while
the paragraph action previews B, with no follow movement. The old layout effect
replaces B with audible A for pointer and focus ownership. Reader now retains
bounded hovered/focused paragraph references for the current occurrence; projection
prefers explicit placement while the actual visible locator continues advancing.
Leave/blur returns to current A; chapter replacement/remount retires old ownership.
No persistence, follow, public locator or narration contract is changed.

## Host evidence

Normal local PowerShell outside sandbox, root cwd; Node 24.18.0 and pnpm 11.15.1.
Raw receipts/manifests are under ignored `tmp/evidence/five-pass-audit/`.

RED `u3-5.2-red-01.log`, 20:55:47.678–20:55:50.137 UTC, exit 1,
two attributed failures/65 skipped:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx -t 'five-pass 5.2'
```

Visible A advancement and zero follow movement pass before the failing assertion:
expected B preview, received audible A. Paired input SHA-256:
`5FFBEAF6F55773917B2221A1575F4DA30B3C6459F327611203D0609195642EAC`.

GREEN `u3-5.2-green-01.log`, 20:57:13.257–20:57:18.676 UTC, exit 0, 411/411.
Uses the exact eight-suite G1 command documented in [5.1](u3-case-5.1.md), covering
Reader/highlight/tracker/reflow/both persistence owners/App/coordinator.
Paired input SHA-256:
`5E2354F8FD30F5364B678568ACA48D629C28F73AA8E1E9E907B9484822C5BE97`.

Fresh Chromium 5.1 recheck `u3-5.2-browser-5.1-recheck-01.log`,
20:57:32.447–20:57:39.669 UTC, exit 0, 1/1. Same configured command selecting
`reader-narration-bugfixes.smoke.spec.ts --grep 'five-pass 5.1'`, with the exact
per-run ignored output directory retained in the receipt. Fixture SHA remains
`B3F5E30BA64225DA35CCD72CABB6A43C10082B81AD605FB7F8EFE6E663119F0B`.
Input SHA-256:
`DB5030BAE0B141B89848A8E437F3AEC094044AF96278CE6B57B0E5E53EBCF2D9`;
built manifest:
`5BBD337065A67B4876B1A07486A180526F0810E33BEAB8D854288506E1FBEEE8`.
This is renewed 5.1 evidence, not the still-pending real-browser 5.2 scenario.

`u3-5.2-static-01.log`: scoped Prettier/ESLint over the two changed files and
`pnpm.cmd --filter @voxleaf/desktop run typecheck`, all exit 0. Exact commands
and UTC intervals are retained. Paired input SHA-256:
`D752BD75DBD149A95DA75384607DE020066E0377CAD70B5EA73CA8E96F154250`.

## Current review binding

Closed 25-path manifest `u3-5.2-review-inputs.txt`, SHA-256:
`75740A8DB1D4682C6AA8B77578BB58B06C020FD4E5502380132996816304D7FF`.
Full patch `u3-5.2-review.diff`, SHA-256:
`BD9907B96AD35324948D05CDED68FC154AB08C49661EAE29C3FC3E39F535AB59`.
Cumulative U3 patch `u3-5.2-u3-only.diff`, SHA-256:
`717E4EE345F266176C05192BE1E529C9E69B03BD1D7D4A1552AA02506C4CA728`.

Reader SHA-256:
`F186B54E992CE2248BD04446AFA5B7EF6C6FCC7532BCBFD6AB922F334997D36F`;
blob `f08d97a25caae1741cd31aebb1f426fc4019c6c2`.
Reader test SHA-256:
`7F242EF4F8568FAA9B29615D795EB5FF8C0DDAF55BE50A084784BBA87DA6D6EC`;
blob `421340973eab0667e41fa485176027f53f91001f`.

No historical PASS reused. Case 5.2's directed browser scenario, final G6/G7/G10,
full static/documentary checks and integrated review remain pending.
