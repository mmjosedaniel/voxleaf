# G6 directed browser integration

Status: 71/71 passes; [FPA-G6-CR-R1-20261111](review-G6-R1.md) APPROVE for
the manifested product/browser scope. Full plan acceptance remains pending. Product production
code is unchanged by this test-only block. The closed implementation scope is
`reader-narration-bugfixes.smoke.spec.ts` and
`reader-image-lifecycle.smoke.spec.ts` under desktop browser tests.

Eleven directed cases cover U1 latest chapter and first-start/canceled recovery,
U2 playback-rate lead before first allocation, U3 pointer/focus placement,
U4 visible image dispatch/coalesced observations and U6 empty fragment navigation.
The previously accepted 5.1 controlled browser test remains unchanged. These use
real DOM, browser decoding and audio-node/worklet behavior with synthetic books
and service results; they do not establish natural race frequency or physical
audio audibility.

## Preserved diagnostics

Ignored `tmp/evidence/five-pass-audit/` retains each log, before/after manifest,
trace and screenshot. None of the following is treated as product RED:

- `g6-focused-01`: overescaped selection expression found no tests. Corrected
  the expression; this is a command-selection failure.
- `g6-focused-02`: seven passed, four failed. Paused navigation assumed exactly
  three accepted segments; Prepared audio expected the fourth synthesis before
  changing speed; pointer/focus setup scrolled an oversized paragraph.
- `g6-focused-03`: three corrected cases passed; paused navigation still assumed
  Quick must generate the whole book. Quick legitimately stops at its lead.
- `g6-focused-04`: both navigation variants passed after observing accepted
  audio and zero actual in-flight synthesis, retaining new-generation spine proof.
- `g6-static-01`: the local dynamic-import type omitted existing fixture helpers
  used by the new cases. Added only declarations; static02 passed.
- `g6-final-01`: 70/71 passed. Case 3.1 proved the first failed attempt at B,
  but its later inspection of C raced recovery-notice reflow and returned to B.
  The fixture now waits for the enabled recovery action, the existing bounded
  restoration frames and stable reader geometry before scrolling to C. C's leaf
  observation and recovery from B remain asserted.
- `g6-focused-05`: the corrected 3.1 case passed twice in one repeated selection;
  static03 passed. Failed final01 artifacts were copied into a distinct retained
  directory before the second canonical batch could replace default outputs.

## Final host checks and review binding

Normal-host PowerShell outside the sandbox; Node 24.18.0, pnpm 11.15.1,
Playwright 1.64.1 and Chromium 156.0.8078.4 (revision 1248). HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty.

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts reader-image-lifecycle.smoke.spec.ts
pnpm.cmd exec prettier --check apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts
pnpm.cmd exec eslint apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts
pnpm.cmd --filter @voxleaf/desktop run typecheck
```

Final G6 ran 22:40:50.074–22:45:32.691 UTC, exit 0, **71/71 passed**.
`g6-final-02.log` SHA-256
`4C1E0FDDCC179AEECD0519C48E1D578864847EC7B0886156AD852A5452D967B1`.
All 633 before/after input rows match, SHA-256
`757372AE5F036A76F9A0245945B6F65A343994CADD1981C7E9822D357DB2D5A5`.
The closure includes current source, tests, fixtures, configuration, locks,
actual browser/runner and package build identities. All 251 U6 G0 artifacts
remain identical. The four current Vite outputs match the final artifact list,
whose SHA-256 is
`86EB9D300054099D66435D9C719FBF724788B5171D156DC2E573F40967FCABE2`.

Final scoped static03 ran 22:40:34.161–22:40:40.192 UTC, all exit 0. Its identical
before/after closure SHA-256 is
`62374E2073FC655E8630D838D3A43E6EC157F338687358811F119E1ECAFA494D`.
Scoped diff whitespace check passes. The existing 5.1 body's 329 added lines
also match its approved earlier patch exactly; its current browser result is
fresh in this batch.

`g6-review-inputs.txt` closes 78 reviewed paths and identities, SHA-256
`051860D9C6C43A9F80DAC720DBEE19712BDCC634931AAB78D9B3A8224104785F`.
`g6-review.diff` SHA-256
`9A5FE66A4C1E65A6D81D482488FADE7C23D19EBE90684870DC3B889B8FA1B9CD`.
Review includes current affected U1–U4/U6 sources and relevant settings callers,
the unchanged reflow/fixture sources and the fresh [G1/G2 selections](combined-gates.md).
G7/G8/G10, final language-wide checks and the full integrated review remain pending.

The initial handoff counted six header lines as paths. Independent review
established the actual 78-path closure; the immutable manifest is unchanged.
The review renews manifested U1–U4/U6 and renderer consumers, without extending
its scope to U5 or native sources. G2 remains verified current evidence.
