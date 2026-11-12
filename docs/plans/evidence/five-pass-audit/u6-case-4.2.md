# U6 case 4.2: empty fragments resolve exactly to document start

Status: unit APPROVE FPA-U6-4.2-CR-R1-20261111; final integration pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty.
Scope: target-resolver.ts/test, open-epub-publication.test.ts and architecture
overview clarification. Canonical diagram inspected: package/process/flow and
public schema boundaries are unchanged, so no diagram edit is warranted.

The resolver now treats fragment empty string like an absent fragment. Parser
behavior remains intact. Tests assert exact/document-start, not merely equal
locators, through EPUB2 NCX, EPUB3 TOC, inline aliases, repeated spine occurrences
and direct references. Nonempty unresolved fragments retain recovered status.

## Retained fixture correction

RED01 (21:36:26–21:36:28 UTC) had one valid direct failure plus public-fixture
failures: an unsupported inline PNG reference without XHTML fallback makes current
ingestion reject with broken-reference/invalid-input. Diagnostic01
(21:37:53–21:37:54 UTC) established this existing policy. Neither public failure
is a case4.2 reproduction. Removed that link from the successful R8 fixture and
added a separate typed rejection control, which passes. Excluded1.2 is unchanged.
Original logs/manifests remain under ignored tmp/evidence/five-pass-audit.

## Host evidence

Normal local PowerShell outside sandbox; Node24.18.0/pnpm11.15.1, actual root
Vitest CLI/package identities captured before and after.

RED02 `u6-4.2-red-02.log`, 21:38:26.316–21:38:27.817 UTC, exit1: three intended
failing cases/39 skipped (17 exact-status/reason assertions across occurrences).
The destination locator is already correct; the old status/reason is not.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/locator/target-resolver.test.ts src/public/open-epub-publication.test.ts -t 'five-pass 4.2'
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/epub exec vitest run src/locator/target-resolver.test.ts src/public/open-epub-publication.test.ts src/navigation/navigation-document.test.ts src/integration/ingestion-matrix.test.ts
pnpm.cmd exec prettier --check packages/epub/src/locator/target-resolver.ts packages/epub/src/locator/target-resolver.test.ts packages/epub/src/public/open-epub-publication.test.ts
pnpm.cmd exec eslint packages/epub/src/locator/target-resolver.ts packages/epub/src/locator/target-resolver.test.ts packages/epub/src/public/open-epub-publication.test.ts
pnpm.cmd --filter @voxleaf/epub run typecheck
```

G0 `u6-4.2-build-packages-01.log`, 21:39:15.383–21:39:17.002 UTC, exit0.
GREEN `u6-4.2-green-01.log`, 21:39:33.676–21:39:36.686 UTC, exit0:99/99.
Scoped static `u6-4.2-static-01.log`, 21:39:35.873–21:39:40.093 UTC: all exit0.
RED02 paired SHA-256 `524C221357BE84325E657728C1A040BBFED18C6539F7381E753E6A5F108AE91C`;
GREEN/static paired SHA-256
`815CD6F7D03CFC71F814048860B1F8E1A6EA5971F3B026F5FD258CB0D6BB526D`.

## Frozen review binding

`u6-4.2-review-inputs.txt` SHA-256
`207285C5D72C9E136D31C6652CB0C200A2D7D5B158ED808BB2DA17A86E98A820`.
Exact four-file patch `u6-4.2-review.diff` SHA-256
`4AE8C8F9DF1F896E54A194AE2F02B297DCF906399CE26894F70CAB55B115AA6F`.
All251 emitted files/membership match GREEN in `u6-4.2-review-built-inputs.txt`,
SHA-256 `A37841A04AA3C673316D43E03276DE7539B58FC0AAC67D1AE99564A306330466`.
Current resolver JS SHA-256
`C09F4269FD6F770FE4EADF0E6E27CF27760281D01788319C0E42082125F32E0B`.

No historical PASS reuse. Directed G6 browser behavior, G7/G11/G12 and final
integrated acceptance remain pending.
