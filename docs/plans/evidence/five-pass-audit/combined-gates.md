# Combined acceptance gates

These receipts record executed checks on their stated inputs. Final acceptance
and exact integrated review remain pending. Any later relevant drift requires
fresh testing or independently reviewed complete equivalence proof.

Final G4 release/WebDriver71/71, native-smoke harness54/54, G7 portfolio Node14/14
and global G11 JavaScript format/lint pass on frozen U16 sources. Exact commands,
complete captures, times and logs are in the [U16 receipt](u16-case-5.4.md).
The configured harness rebuild preserves all251 package exports. Actual native
startup and inference remain separate pending gates.

## G3: final Python union

Normal local PowerShell outside the sandbox, pinned Node24.18.0/pnpm11.15.1,
uv0.11.29/Python3.12.10. The exact18-suite command is recorded in
[final gate selection](final-gates-preparation.md#g3-python-union) and the ignored
`g3-final-01.result.json` command array. On2026-11-12 UTC,
00:54:50.791–00:55:28.343, **333/333 pass**, exit0. The existing pytest cache
permission warning remains recorded; it did not prevent test execution.

Before/after discovery captures2,642 identical source, test, authority, lock,
configuration and installed tool/runtime rows, including explicit absence of a real
v14 result. It includes the root inventory script, regenerated core authorities,
benchmark roots and actual Python environment; native U15 preparation is outside
this input closure. Input SHA-256:
`32C8BC6EB5F24C39E72383E6982A5BE81DA5F89ECC1DE870DA71980F38F1A3A5`.
`g3-final-01.log` SHA-256:
`8C5F8AD2D48D09F021F999797A2CBBEAA54F94BF0FB09CAB9301D677D17402C3`.
The receipt binds HEAD, empty index, cwd, command array and tool environment.

## G11: final Python checks

```powershell
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
```

Same normal-host pinned environment and2,642-row input identity as G3:

| Check | 2026-11-12 UTC | Result | Log SHA-256 |
| --- | --- | --- | --- |
| Format | 00:55:44.993–00:55:45.408 | 192 files formatted; exit0 | `6F63BCD13DBAC2F9B4F58704D0104D07518C9B58E9566581FBED328B25A606A4` |
| Lint | 00:55:47.802–00:55:48.204 | all checks pass; exit0 | `F96C78E2151A13DEF2352FB3664BCC427F97BA61D14BECB9757835EB81DE7BA0` |
| Types | 00:55:50.088–00:55:51.074 | 188 source files; exit0 | `A239F33917F7D4F509015F31428DDC7F9399CC66CA0A822E1F15E9ACF68285EF` |

Ignored basenames are `g11-python-format-final-01`,
`g11-python-lint-final-01` and `g11-python-types-final-01`, each with log,
result JSON and before/after input manifests. The root inventory script remains
outside these configured Python check scopes; its U13 explicit checks still
require final unchanged-input assessment. Final integrated review is pending.

[FPA-G6-CR-R1-20261111](review-G6-R1.md) independently verified the current G1,
G2 and G6 input closures. Its renewed source approval is limited to the actual
78-path product/browser manifest; it is not the full integrated plan review.
The [G6 receipt](g6-browser.md) records 71 passing browser cases and preserved
diagnostics.

## G1: combined desktop selection

Normal local PowerShell 7.6.9 outside the sandbox, Node 24.18.0, pnpm 11.15.1,
Vitest 5.0.5. HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`.
2026-11-11 22:27:41.379–22:27:49.184 UTC, exit 0:
**746/746 tests in 19 suites**.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/reader/active-visual-locator.test.ts src/reader/reader-reflow-restoration.test.ts src/persistence/reader-position-save-coordinator.test.ts src/persistence/narration-position-save-bridge.test.ts src/reader/images/publication-raster-image-loader.test.ts src/reader/images/SemanticRasterImage.test.tsx src/reader/images/raster-image-source.test.ts src/reader/SemanticDocument.test.tsx src/settings/narration-settings-actions.test.ts src/tts/hardware-profile-compatibility.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/optional-chatterbox-client.test.ts src/tts/OptionalChatterboxControls.test.tsx src/App.test.tsx
```

Raw `tmp/evidence/five-pass-audit/g1-final-01.log` records command, tools, UTC,
executable identity and result. All 614 before/after rows are identical, SHA-256
`F498DA166148C254CBFBE58E660939C0D9AC9AA8E5FE5FA27A898957D2F17905`.
The closure includes desktop source/tests/configuration, EPUB/shared inputs and
emitted assets, root configuration/locks, actual Vitest CLI/package and pnpm
shim. Browser specs and native/script-only inputs are excluded from this Vitest
command's closure. This combines the affected U1–U4 and U7–U8 controls; it does
not replace G6/G7/G8/G10 or final review. No source or build changed during it.

## G2: combined EPUB selection

Normal local PowerShell 7.6.9 outside the sandbox, Node 24.18.0, pnpm 11.15.1,
Vitest 5.0.5. HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`.
2026-11-11 22:23:42.983–22:24:24.810 UTC, exit 0: **482/482 tests in nine suites**.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-source.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/locator/target-resolver.test.ts src/public/open-epub-publication.test.ts src/navigation/navigation-document.test.ts src/integration/ingestion-matrix.test.ts
```

Raw `tmp/evidence/five-pass-audit/g2-final-01.log` includes command, UTC, tools,
Node executable identity and result. The 457-row before/after input manifests
are identical, SHA-256
`D0426E619F16D2E91FE9A23DB7CF7CB19D5D2F0410A9923BAD2D7BB64CD212DB`.
They capture EPUB/shared tracked and newly discovered inputs, fixtures, package
and root configuration/locks, emitted package artifacts, actual Vitest CLI and
package files, and the pnpm shim. Concurrent browser-spec authoring does not
affect this isolated package command. No source or build was changed by this run.

This combines current U5 normalization/resource/public-mapping controls with U6
navigation and ingestion controls. It does not replace directed browser or
native inference acceptance. No historical behavioral PASS was reused.

## G7 renderer preflight leaves

Normal-host PowerShell, pinned Node24.18.0/pnpm11.15.1/Vitest5.0.5:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/ProductNarrationControls.test.tsx src/tts/AdaptivePreparationControls.test.tsx
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx
```

2026-11-11 23:48:07.829–23:48:11.152 UTC: 32/32 controls pass, exit0.
Reader leaf ends at23:48:41.982 UTC: 68/68 pass, exit0. Both pairs of614 input
identities equal G1's `F498DA166148C254CBFBE58E660939C0D9AC9AA8E5FE5FA27A898957D2F17905`.
Reader was rerun because the earlier G1 log reports only its broad aggregate;
this new leaf is separately attributable. No historical PASS is substituted.

Ignored `g7-controls-final-01.log` SHA-256:
`98DB2BE13F2608EAB0D003F2439A8B9EED44C8FEB05618D2B22E8813CB000E39`.
`g7-reader-final-01.log` SHA-256:
`FF89E2777E8779182F876C0B5AF5D16E053063BF65D1CFBB22E2D11F781627A0`.
Before the controls command, a capture parser assumed spaces in a pipe-delimited
manifest; it failed before launching tests. The correction is preserved in
`g7-controls-preparation-01.log`. Native WebDriver/portfolio leaves and actual
Piper/native runs remain pending; these UI checks do not replace them.

## G11 TypeScript types

```powershell
pnpm.cmd typecheck:typescript
```

Normal-host pinned tools, 2026-11-11 23:49:21.424–23:49:30.310 UTC, exit0.
All configured shared, EPUB and desktop checks pass, including browser tests.
The command rebuilds packages; the637 captured source/configuration/tool and
emitted-input identities remain equal before/after, as does discovered membership.
Python edits running separately are outside this TypeScript input closure.

`g11-typescript-types-final-01.log` SHA-256:
`73DB3AD2036DD0363E130B74A2F6BEE108E69D13086962DE7AE55837841C89B4`.
Paired input SHA-256:
`00DBD9D75B21E05B28EEC1BCACB425F26C3057CFAB3D981538904457C9BBA2F2`.
Formatting/linting remain pending after the remaining JSON/JavaScript changes;
this is only the types leaf, subject to final independent assessment.

## G11: root inventory Python checks

The final comparison matched all29 originally captured U13 static inputs, but
historical installed Python module-tree hashes were unavailable. Accordingly,
the three Python checks were executed freshly instead of inferring that proof:

```powershell
uv.exe run --project services/tts --locked ruff format --check scripts/release_inventory.py services/tts/tests/test_release_dependency_graphs.py
uv.exe run --project services/tts --locked ruff check --target-version py312 scripts/release_inventory.py services/tts/tests/test_release_dependency_graphs.py
uv.exe run --project services/tts --locked mypy --config-file services/tts/pyproject.toml scripts/release_inventory.py services/tts/tests/test_release_dependency_graphs.py
```

2026-11-12 UTC01:02:07.606–01:02:08.731, all exit0; both files pass.
The2,642 current G3 identities, including the installed tool environment, match
before/after. `g11-inventory-python-final-01.log` SHA-256:
`D49472F7761A06760000356B290C98883452F586B2CB8577F219A91E4C963564`.
Final global JSON formatting and diff checks remain separately required.

## G5 and G11: fresh Rust checks after core generation

```powershell
pnpm.cmd format:check:rust
cargo.exe test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
cargo.exe test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
pnpm.cmd lint:rust
```

Normal-host pinned Rust/Cargo1.97.1,2026-11-12 UTC. Format passes
01:00:29.495–01:00:30.170. Default tests01:00:31.339–01:00:50.541 and locked
tests01:00:51.391–01:00:59.304 each pass78, with3 special tests ignored and
117/116 unrelated filtered. Clippy checks all targets in both configured modes
at01:01:00.112–01:01:08.403 and passes. Every command exits0.

All866 discovered source/configuration/authority/tool/emitted-input rows match
before/after, including the newly embedded core manifest. SHA-256:
`1C8DFD6C93560DC17F0EEB181CF18E97A2DE1E98A55C5E712723203FEA375019`.
Actual toolchain paths/versions are in `rust-final-environment.json`; generated
test executable identities are in `g5-final-test-artifacts.txt`.

| Ignored log basename | SHA-256 |
| --- | --- |
| `g11-rust-format-final-01.log` | `709F090C04253BE00FFD67ED8B3772DDB8589DA29932B204033FEECC01EA3B8F` |
| `g5-default-final-01.log` | `B2963C845EA1B6641D3B38AB5E91B0D78D122A8DD36684EACECC4952BB5571F8` |
| `g5-locked-final-01.log` | `542E18F2CE047F14BF3E5DB2E2AF65F2B0E07886EE406211C6D50A477E280FE2` |
| `g11-rust-lint-final-01.log` | `ABB31818C82F3EBDDF748FB70F8BFA059365DD870079FCDB63B942ACDE89FA87` |

These fresh checks supersede the prior unit input identities for final Rust
acceptance. Ignored real-asset admission and native product/resource runs remain
pending and are not counted by the78-test results.

## G7: refreshed Piper configuration

```powershell
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es --preflight-only
node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en --preflight-only
```

Normal-host2026-11-12 UTC00:58:57.171–00:59:00.938, both exit0. The refreshed
core interpreter, model roots, offline flags and existing exact-program effective
firewall policy satisfy the runner. No firewall mutation, model inference or
browser launch occurred. Process-local PSModulePath admits the Windows PowerShell
modules used by that read-only firewall probe.
`g7-piper-config-final-01.log` and its identical before/after inputs bind these
commands; input SHA-256:
`3C247A83895379B600973634F6BC12E0948DF17BC6C85D36B824129119789081`.
Actual native arms remain mandatory after U16.

## G7 renderer tool identity closeout

The original two leaves recorded the Node version and shared pinned session,
but lacked a direct executable hash per leaf. To close that evidence gap, the
same two commands shown above were rerun in normal local PowerShell with the
resolved Node and PowerShell executable hashes added to the614 existing rows.
No product source or test changed. Fresh source discovery and all616 before/after
input identities match.

On2026-11-12 UTC, controls01:28:42.443–01:28:49.321 pass32/32; Reader
01:28:50.004–01:28:53.877 passes68/68. Both commands exit0.
Current input SHA-256:
`1CDF8125FB026E0807408536A849F27442959CD8377364701530DCB564170329`.
Ignored `g7-controls-final-02.log` SHA-256:
`CEFCB7B340F85A7DC0F7403124C5B8E47F55F270A142C5F39DB2DAEE2870B34B`.
`g7-reader-final-02.log`:
`2CE4E554CAF4703EFE3CD0BB9C650F36C0E30D0B57ABF0280FDDDC21E79F84CF`.
Each result JSON contains exact arguments, cwd, HEAD/index, versions and times.
`g7-renderer-final-02.membership.before/after` preserve the matching discovered
source set. These supersede the original G7 renderer results for final review.

## G7 harness and global JavaScript refresh

The later [portfolio fixture correction](g7-portfolio-harness.md) has independent
[approval](review-G7-HARNESS-R1.md). Its17/17 portfolio and54/54 native-harness
checks, plus `g11-javascript-*-final-02` global format/lint results, supersede
the corresponding earlier receipts after the two JavaScript files changed.
Both selected configuration preflights and the dependent native startup/Piper/
resource gates are refreshed in [native gates](native-gates.md). The source
change does not enter the renderer/type/Chromium or Python/Rust runtime closures;
final independent reuse assessment remains required.

## Final Python/Rust provenance renewal

The [runtime evidence renewal](runtime-evidence-renewal.md) supersedes the
earlier G3/G5 and Python/Rust static receipts after capturing missing base-runtime
and Cargo/toolchain/cache inputs. The same333 Python and78+78 Rust tests pass;
all affected static leaves pass. No product edit or broader suite was added.
