# R8 execution ledger

Task: R8-20261101. Base and unchanged HEAD:
`46616e8be197023625d0fd8ff94556fc1478189b`.
Branch: `codex/eight-revalidated-findings-plan`. Initial index and worktree were
clean. All changes are task-owned. No Git mutation is authorized or performed.
Raw receipts: `tmp/evidence/eight-revalidated-findings/run-01/`.

## Scope and outcome

- R8-01: current Chromium confirms 3x2 PNG eXIf is presented as 2x3 in both
  byte orders. The bounded shared IFD0 parser now handles PNG metadata, with
  exact raw/presented budgets and decoder agreement. WebView2 confirms both orientations on the current executable.
- R8-02: six quality generators report cleanup-only failures through their
  fixed error path, close once, preserve generation-error precedence and remove
  owned disposable outputs. Success retention and runtime adapters are unchanged.
- R8-03: minimum RAM uses None for uninitialized state; observed zero remains
  visible to the existing memory-unavailable stop result.
- R8-04: return-to-contents focuses the already mounted navigation element.
- R8-05: App owns one pending removal promise across book lifetimes, joined by
  the existing containment barrier even without an old coordinator. Replacement
  reading continues; later playback requires explicit Play and normal admission.
- R8-06: Settings contains late programmatic focus, yields before close restores
  trigger focus, and removes its listener on close/unmount.
- R8-07: local original references reuse bounded package fallback resolution.
  Alias source occurrences, direct first occurrence, self-links, fragments,
  NCX, XHTML and negative ingestion controls retain their intended semantics.
- R8-08: Restart follows current compatibility and reader-placement eligibility;
  automatic refresh consumes no retry and starts no service.

No finding is discarded. M005 normalization, schemas, runtime adapters, native
production, locks, models and audio limits remain unchanged. The canonical
system diagram still matches; no component/process/persistence boundary changed.

## Environment and reuse

All execution uses normal local PowerShell 7.6.5 outside the managed sandbox,
Node 24.20.0 and Corepack's repository-pinned pnpm 11.15.1. The PATH fallback
pnpm 11.25.0 is not used for acceptance. uv is 0.11.29; Python is 3.12.10.
Installed dependency/tool/browser membership is captured in ignored manifests.
No installation or dependency update was performed.

No historical PASS or partial failed aggregate is reused. F4's historical Node
version differs, and changed source invalidates prior acceptance. Reused inputs
are the existing synthetic EPUB/JPEG fixture family, deferred promises, service
transport doubles, five-generator parameterization, quality fake adapter, native
runner and verified Piper core. The only new fixture helper creates a tiny
repository-authored PNG. Raw host identities and private inventories stay local.

## Reproductions and corrections

- G1-Python: seven expected failures, 13 controls pass. G4-Python initially
  passes 63; later formatting and added owned-session coverage invalidate it.
- G1-Desktop: eight expected failures, one initially-closed TOC control passes.
- G1-Epub had a wrong relative fixture path and is insufficient reproduction.
  G1-Epub-r2 fixes the fixture on unchanged production; both public opens fail.
- G1-Png-browser confirms actual decoder orientation. G1-Png-unit reproduces
  six metadata/source failures with four decode-mismatch controls passing.
- G2-Epub: 203 pass, two incorrect new expectations fail. Existing missing
  fragments recover with fragment-unresolved; corrected assertions preserve that.
- G3-Desktop: 398 pass, one existing App restoration assertion fails. The new
  focus guard now yields before onClose; affected leaves pass on renewal.
- Python static attempts retain one import-order and four test-seam typing
  errors, corrected without production scope expansion. Final checks pass.
- TypeScript format identified one browser file needing a second formatting
  pass. Lint identified a render-time ref read; the redundant read was removed
  because handoff state already gates owner creation. Final checks pass.
- Self-review added direct-link ordering and v12 owned-session controls.
  Final EPUB/export changes invalidate their consumers; only selected groups,
  browser journeys and importing runner were renewed. No full repository sweep.

## Final selected gates

Each command below ran in host PowerShell outside the sandbox and exited 0.
Input manifests capture the complete source membership; all non-Markdown inputs
still match current bytes. Documentation-only closeout does not invalidate these
runtime gates. The independent reviewer assesses this retention explicitly.

| Receipt ID | Exact command | Outcome |
| --- | --- | --- |
| G0-Exports-final | `pnpm.cmd build:packages` | PASS; exit 0 |
| G2-Epub-final | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/package/package-document.test.ts src/navigation/navigation-document.test.ts src/navigation/ncx-navigation-parser.test.ts src/document/xhtml-projector.test.ts src/public/open-epub-publication.test.ts src/locator/target-resolver.test.ts src/integration/ingestion-matrix.test.ts` | PASS; 205 tests |
| G3-Desktop-final | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/reader/images/raster-image-policy.test.ts src/reader/images/raster-image-source.test.ts src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/tts/ProductNarrationControls.test.tsx src/tts/product-narration-coordinator.test.ts` | PASS; 399 tests |
| G4-Python-final2 | `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py services/tts/tests/test_benchmark_bilingual_baseline.py` | PASS; 66 tests |
| G5-Final-source | `pnpm.cmd format:check:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/epub typecheck; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/desktop typecheck; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd format:check:python; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:python; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd typecheck:python` | PASS; exit 0 |
| G9-Harness-final | `pnpm.cmd test:native-smoke-harness` | PASS; 50 tests |
| G6-Browser-final | `pnpm.cmd --% --filter @voxleaf/desktop test:browser --grep "R8-\|SAC-09\|MAF-04\|RAC-01\|CHAT-AUDIT shared fallback\|operates reader landmarks"` | PASS; 10 intended tests |
| G7-Core | `pnpm.cmd package:piper-core:check` | PASS; exit 0 |
| G7-Build | `pnpm.cmd build:desktop` | PASS; exit 0 |
| G8-ModelFree | `node apps/desktop/scripts/native-startup-smoke.mjs` | PASS; exit 0 |
| G8-Piper | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | PASS; exit 0 |
| G8-Resource-cycle | `& ./tmp/evidence/eight-revalidated-findings/run-01/piper-resources.ps1` | PASS; exit 0 |

### Native artifact and cleanup

One executable, 12,453,376 bytes, SHA-256
`18e5be1ed0d4e5d97797f102f52e8273e49f1c0c05de3fbd01bde64bc4adaac5`,
was built and consumed by both arms with identity checked before and after.
WebDriver 156.0.4314.50 and WebView2 156.0.4314.58 were observed locally.
The existing Piper core passed its configured integrity check; no package
regeneration, download, installer build or optional-model campaign was needed.

The existing resource-preservation procedure journaled and moved the original
adjacent tree, verified all 2,023 staged files, and restored the original complete
membership and hashes in finally. Backup absent; pre-existing scratch roots
preserved; no new roots or owned processes survived. Raw paths stay local.

Piper EN observed 18,330 ms playable lead, zero underruns during its 60,290 ms
steady observation, 239 ms cancellation, six AudioContexts created/closed,
zero generated-audio files and zero external requests. These are exact-host
observations, not broader hardware or support claims. The selected arm validates
rate options; a six-rate playback portfolio was not selected or claimed.

### Installed identity delta

Environment-after exited 1 on strict comparison. Its sole delta is 135 appended
bytes in Chromium debug.log. Environment-delta-proof exited 0: the original
9,530-byte prefix hash matches, the new complete hash matches the after capture,
and all other 24,008 entries plus tool/environment metadata match exactly.
This is generated diagnostic output, not a changed dependency. Both original
failed receipt and bounded proof are retained for independent assessment.

### Receipt digests

These SHA-256 values bind the immutable local command/result records; associated
`-inputs.json`, `-exports.json` and `-output.log` files retain source/export
identities and complete content-safe output.

| Receipt | SHA-256 |
| --- | --- |
| G0-Exports-final-result.json | `ade86fe772d5146060b7ded49ccf2b172a523266e8f5b285f8bdf08b19429108` |
| G2-Epub-final-result.json | `7797579b6da09c09ff444b6f5e3ec8dc039b96a47ec49172cc78413c3f184686` |
| G3-Desktop-final-result.json | `45238d0693f80a0f259828eac754e64341d0eb99b84196331c46202648f2c948` |
| G4-Python-final2-result.json | `bf87417b2c09024b2065a1201dfcc85c839ab5d4ef611aabd1ef762136f7561b` |
| G5-Final-source-result.json | `1854d0270e88210def1d5d8a67a6e4e536316a64cbb64a7601b3d83dc15d90f3` |
| G9-Harness-final-result.json | `0d96fc991358bfde1130556d751f81bea5e11a8baacc1d4c862aafb737612a96` |
| G6-Browser-final-result.json | `994e034309818f5e1c65f97658df077f6f3907410916d4b6c8bf4e9095891254` |
| G7-Core-result.json | `38967b735500dbf109e65be9204b2c7c1da20d0da3f5c7e60838bddfb1d6aa55` |
| G7-Build-result.json | `67fef93ea574833e2cbfc8d3bfde11ebddf4df5389f0a0542fa2f39473b43182` |
| G8-ModelFree-result.json | `4f87fc487a08013e14b74918652e024bbde8ab285bdcba4d91610200b4baff27` |
| G8-Piper-result.json | `481b9bfb6957060923c0cad6fff575da96680656cccedc0a88ccf9776ff69eee` |
| G8-Resource-cycle-result.json | `eaff33da8f398c4c97a3d2f2cbaee256c093fce9c0ed584e2d70175087a342f0` |
| Environment-before-result.json | `666bf28b0a1115eb53ae04150e3a971564082a037d12a49f1db4183ffae1cf8f` |
| Environment-after-result.json | `f64eb982bd19ab3eb90357f95a6415a98d552131541fec26acee18a7a2d86d7d` |
| Environment-delta-proof-result.json | `fdf1a3f58aab1ddb06b11955bfe1e99bb483c89f75977a4e5479a4ad0860851c` |

## Documentation checks

G10-Documents: `pnpm.cmd check:evidence`, `git diff --check`, then the local
Markdown-link inspection all pass; 414 existing local links resolve. No schema,
frozen authority or generated file was edited.

## Independent acceptance

R8-R1-20261101: **APPROVE**, no findings. The reviewer independently checked
all 384 identities, the complete task scope, selected source inputs, 251 exports
and the sole output-only environment delta. Current-task evidence retention is
approved; historical PASS remains excluded. G10-Documents-r2 renewed the final
ledger-byte check and passes all 1,499 inputs and 414 links.

Final archival assessment: **R8-R2-20261101**, recorded with its final document
gates and exact identity recheck in [immutable review reports](review-reports.md).
No runtime inputs changed during archival; only document/link checks require
renewal. All eight findings are resolved; none discarded or left pending.
No commit, push, PR, merge or publication was performed.
