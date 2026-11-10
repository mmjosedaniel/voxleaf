# U13 execution evidence

- Receipt: `DCR-U13-EXEC-20261109-01`
- Plan: [Deep Chat Audit Minimal Corrections](../../active/deep-chat-audit-minimal-corrections.md)
- Finding: DCR-07
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U13/`.

The TOC builder now counts only normalized attribute-derived UTF-8 retained in
visible EPUB 3 labels. Used fallback titles and emitted attribute-only
separators count. XML participation wins a mixed collapsed whitespace run,
including across parser events. XML text is already counted by the reader.
Unretained alt, eclipsed titles, leading/trailing whitespace and NCX do not
add a separate charge. The same archive budget is used before the label is
published. Independent label/node limits and existing semantic image charges
remain in place.

The public regression opens a fallback and selected rendition sharing one
archive budget. The navigation document also appears in the spine. With
two-byte alt, the old total was 542 of the expected 546 bytes, showing both
semantic projections counted their bytes and both TOC projections omitted
theirs. The corrected exact ceiling succeeds and one byte less fails
without a publication. The test changes only the policy ceiling in the real
archive opener and preserves the actual public call, signal, projection and
cleanup path.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/navigation/navigation-document.test.ts src/public/open-epub-publication.test.ts -t DCR-07
pnpm.cmd --filter @voxleaf/epub exec vitest run src/navigation/navigation-document.test.ts src/security/processing-budget.test.ts
pnpm.cmd --filter @voxleaf/epub run typecheck
```

| Phase | Result |
| --- | --- |
| RED, focused | Exit 1. Six intended undercount failures and the unchanged NCX control passed, 61 skipped. |
| GREEN, focused | Exit 0. All seven passed, 61 skipped. |
| GREEN, navigation/budget owners | Exit 0. All 50 passed. |
| Scoped static | Prettier applied on the three owned TypeScript files, ESLint passed, and the configured EPUB typecheck passed. |

Normal local PowerShell 7.6.9, Node v24.20.0, pinned offline pnpm 11.15.1
and Vitest 5.0.5. The RED and both GREEN before/after snapshots matched.
No historical result was reused. U13's public unit test imports source;
it did not consume the package's previous compiled EPUB export. Final
G0/G2/G7 remain pending after this production edit.

## Closed reviewed inputs

The first four paths comprise the unit patch. Supporting inputs identify
the direct budget, parser, fixture and configuration. The final semantic
projection support row was captured at handoff and matches HEAD. The staged
index is empty.

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `packages/epub/src/navigation/navigation-document.ts` | ` M` | `41d01f9de16500fc2c74413d1a1c3a033c619d2b89339f1c8be3652f9d44b877` | `9213ec39fdc590c27ff89012fc2e17a7091b0b51` |
| `packages/epub/src/navigation/navigation-document.test.ts` | ` M` | `a37e22e7b716089b99b395eea49492a148c1eff1023a61cb665eddb795c194b4` | `a18fa5ea71af9e515897b1f4385e7e651e3ecf85` |
| `packages/epub/src/public/open-epub-publication.test.ts` | ` M` | `ee5340f9e1956eb4f3016acc8d688f676f486352cf121b1d77b51b174dbc3060` | `9996fbf5ac192c0e7d19c295787532a1bc410ff8` |
| `docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md` | ` M` | `ea3b9467cbad1b97b89c19576a66821080313895338fdb6ec37eeab4cf970166` | `779c6d0a1cebb28de26bd36a54c97ec0f6e121d4` |
| `packages/epub/src/public/open-epub-publication.ts` | `clean` | `b74cd1ea09d0fd09cbf831e867f43dd5d73b092fc1ef49a48614102776dad1f0` | `28d8d636527b74c01ff1176f3929468a4c8f3df7` |
| `packages/epub/src/navigation/ncx-navigation-parser.ts` | `clean` | `9df64ce9a35e199af09b01d93adc94ae815f1ab550b6d4b7ea9a281413cc6306` | `70cb7583fc1eaab3f5c3740fbeae96c3d9bc4ed7` |
| `packages/epub/src/security/processing-budget.ts` | `clean` | `b8f3dba8693a70238f25ededba9ebc3c298ca466cc04b1cbebdbb828c21b5394` | `5fb9f80abf340fe820303f2b8974d61798b0d0d5` |
| `packages/epub/src/xml/xml-event-reader.ts` | `clean` | `7433a702a709f21882a8ec47e409c6de51f821a1530e08db56ff3ec380fa570e` | `a9227acb64954c4ef089bd9c81913a7f152ed00a` |
| `packages/epub/src/security/processing-budget.test.ts` | `clean` | `d3a85616949b22510085d6015417119ee2946b5522c2f908a960fefcfde97c64` | `b78d460793f65a23a1ea5a15d814a466310e3dc0` |
| `packages/epub/test-support/epub-fixture.ts` | `clean` | `40913ad7819f2da210c9d42e4613af3adcf9a300136136c3c6620a547a945b33` | `08bc02121283468b113ab16aa897bd5984661b72` |
| `packages/epub/package.json` | `clean` | `c2af38f62b794a205398d5ffd6634407ddb8ff0b6065a83de337928b2aaed644` | `a67b753fb528b9287620b12b6155a6a76f1d5eb7` |
| `packages/shared/package.json` | `clean` | `6c4589dab226a7203f67f46c6a448b3a6e7e4514ccfcb40366a25c176aff7c17` | `fb9a2fd5f32db7faac432f595fa5dd5e92062179` |
| `package.json` | ` M` | `79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6` | `fd94e123a32a6b4a44d5ccb296cd89e25b319232` |
| `pnpm-lock.yaml` | `clean` | `e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426` | `acf5034202c5933f5c1dff89beff28587c826088` |
| `pnpm-workspace.yaml` | `clean` | `efb8ff9911192e80897352cbacccc0cb1d53ef130b64bb98f813c973694f5363` | `b6615e1277536c992be3a14cdaa04235a1117330` |
| `.gitattributes` | `clean` | `d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4` | `5acf47068be3a84b4e38b502877083e99b5ce0f9` |
| `packages/epub/src/document/xhtml-projector.ts` | `clean` | `3552f8d5bf94c7ceb0ecee3462af9c94da4807dfeb80ce85085b8309937ce010` | `93811835108f055644fa437a6b664d64ca5e1e14` |
