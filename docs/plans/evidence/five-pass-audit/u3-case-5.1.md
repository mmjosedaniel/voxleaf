# U3 case 5.1: automatic follow provenance before settlement

Status: unit APPROVE, renewed by FPA-U3-5.2-CR-R1-20261111;
combined acceptance pending. Base/HEAD:
`a3241571944530d468e2f4f2d37a0a2394a8df84`.

The [investigation record](u3-case-5.1-investigation.md) preserves four preceding
fixture/contrary attempts. Wide-layout attempt05 established an actual late
caret sample and saved-offset regression on unchanged reader production. The
same browser fixture passes after the three-file production correction.

The highlight owner reports actual initial/corrective automatic displacement
before settlement. The tracker retains one measured placement and scrollTop
without changing its current locator or admitting a save. Unchanged late samples
are suppressed; genuine movement, explicit placement, root/document replacement
and disposal retire the protection. Missing geometry and no movement introduce
no guard. ReaderPublication connects the existing owners. ADR-0071 documents this
extension, with combined acceptance explicitly pending; no system topology changed.

Case allowlist: `apps/desktop/src/reader/segment-highlight-controller.ts`,
`active-visual-locator.ts`, `ReaderPublication.tsx`, the existing tracker/Reader
tests, `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`, and
the ADR-0071 amendment. Persistence production remains unchanged.

## Attributed host evidence

Normal local PowerShell outside sandbox; root invocation; Node 24.18.0,
pnpm 11.15.1, configured Vitest/Playwright. Raw logs/input and build manifests
are under ignored `tmp/evidence/five-pass-audit/`.

Browser command, with per-attempt ignored `--output` directories retained in
each exact raw receipt:

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep 'five-pass 5.1'
```

- `u3-5.1-browser-red-05.log`, 20:42:23.305–20:42:29.688 UTC, exit 1:
  exact heard offset 1958 was overwritten by actual caret offset 1894.
- `u3-5.1-browser-green-01.log`, 20:44:48.756–20:44:56.027 UTC, exit 0, 1/1:
  same stable 1472x542 viewport, actual movement and differing potential caret;
  delivered late event produces no new sample/save. Exact heard locator and
  subsequent genuine wheel locator both survive reopen.

Browser spec SHA-256 identical RED/GREEN:
`B3F5E30BA64225DA35CCD72CABB6A43C10082B81AD605FB7F8EFE6E663119F0B`.
Source/input manifests differ only in the three approved production files.
RED paired manifest:
`35D220361B984276AA432E57AC1FB3A713745138043085FF0238F3381A671358`;
GREEN paired manifest:
`7EEC1F6BA62C8370902F4909CD4B30A1C633F261C393118645128B747DE02942`.
Built manifests RED/GREEN respectively:
`228596A60F68256CA1A5BA3512749C9CC8215B7D659E1A18774B4B9F5BFED215`,
`C82383DD5E533B77B287F56B8987AC9AC53D995BC3766DC35FD49E90C6CC2772`.
Later unit-test-only additions are not Playwright/Vite runtime inputs; independent
review must assess that scoped browser evidence on the final patch.

G1 `u3-5.1-green-02.log`, 20:47:22.982–20:47:28.437 UTC, exit 0, 408/408:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/reader/active-visual-locator.test.ts src/reader/reader-reflow-restoration.test.ts src/persistence/reader-position-save-coordinator.test.ts src/persistence/narration-position-save-bridge.test.ts src/App.test.tsx src/tts/product-narration-coordinator.test.ts
```

Paired manifest:
`1A2C674C2EE6640CE79BD4D21ABEF9566C357D5C950A96835624D21FCAEFECC9`.
Model controls cover initial/corrective scroll, missing geometry/no movement,
manual 1px displacement, root/document/explicit placement and disposal. Earlier
`green-01` failed one new fixture because moving its text node retargeted the live
Range to 0. Recreating the Range fixed the fixture; production stayed unchanged.
That failure is retained separately, not hidden or counted as product RED.

`u3-5.1-static-01.log`, 20:47:25.491–20:47:33.919 UTC, all exit 0:
scoped `pnpm.cmd exec prettier --check` and `pnpm.cmd exec eslint` over the six
source/test paths, followed by `pnpm.cmd --filter @voxleaf/desktop run typecheck`.
Exact path lists/times are retained in the receipt. Paired manifest:
`BC87554E7AF85C781BA769E333E43B9D07F4685813899405ED0545B7FFE4416D`.

## Review binding and limits

Combined closed 25-path manifest `u3-5.1-review-inputs.txt`, SHA-256:
`9CF8B4718DE2CD1DB0B6344304FD2BEBAE964E8C36156E4A6DCFC02EA421666E`.
Full combined diff `u3-5.1-review.diff`, SHA-256:
`94A1CCDAF197CA1383447ACF9E22E2BF513003B200E42CF56FDBA7277D3CC853`.
Case-only diff `u3-5.1-case-only.diff`, SHA-256:
`36EB55F2089A2759FAA5695927BD23705E3804CAA2C69758F887F9AD173D0BC2`.

No historical campaign PASS reused. Controlled DOM scheduling is not a claim of
natural Windows timing; modeled controls are separately identified. Final
G6/G7/G10/G11/G12 and integrated review remain pending.
