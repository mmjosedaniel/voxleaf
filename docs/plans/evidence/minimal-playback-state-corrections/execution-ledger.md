# Playback state correction execution ledger

Task: PSC-20261031. Planning/base/execution HEAD:
`3cdab0b32e087a135eedf6822f033794295b9af2`.
Branch: `codex/minimal-playback-state-plan`. Initial worktree/index clean.
Implementation and testing are authorized; staging, commit, push, PR, merge and
publication are not. Raw original receipts, logs, full source input manifests,
generated-export manifests and failure artifacts remain in ignored
`tmp/evidence/minimal-playback-state-corrections/`.

All checks run in normal local PowerShell outside the managed sandbox.
PowerShell 7.6.5, Node 24.18.0, pnpm 11.15.1, Vitest 5.0.5, Playwright 1.64.1,
Vite 8.3.4, uv 0.11.29, Cargo 1.97.1. WebView2 and EdgeDriver 156.0.4314.50.
No dependency, runtime or driver was installed or upgraded.

## Behavior and scope

- PSC-01: Resume rejects closed/configuration-changing, navigation, stopping,
  retired-identity and non-operational recovery states before touching a player.
  The primary Resume control is disabled while navigation settles. Ordinary
  loaded-session Resume remains covered.
- PSC-02: ownerless Resume delegates admission to `start()` without first
  changing intent. Checking/unavailable admission preserves paused intent and
  the target; later availability completion never autoplays.
- PSC-03: primary fresh Play and the preparation callback use the existing
  visible-locator action. Internal start/recovery and heard-save authority remain
  separate. Mounted unit and Chromium cases prove distinct A/B targeting.
- PSC-04: rate selection/reset applies to the player only while its run identity
  exists. Retired owners cannot reject preference writes. Both saved and failed
  storage results remain observable; the selected next-run rate is retained.

Only two production files change. No PCM guard, DSP, scheduler limit, schema,
model, package builder, Python, Rust, normalization or dependency changes.
The canonical diagram was reviewed: existing component, process, data-flow,
persistence and local-inference boundaries remain accurate. Latest-heard-save
policy and manual Piper packaging recovery remain excluded.

## Gate decisions and outcomes

| Gate | Classification | Outcome and receipt IDs |
| --- | --- | --- |
| G0 baseline | EJECUTAR | `G0-baseline`: 204/204 in the five selected files before edits. Historical PASS reuse declined. |
| G0 exports | REUTILIZAR CON PRUEBA | 251 generated entries match CI7 by complete membership and SHA-256; package sources/config/locks match. `G0-comparison` and `G5-readiness` retain proof. Configured browser build hooks remain enabled. |
| G1 | EJECUTAR | `G1-regressions-red`: six expected failures on original production; all four findings reproduced. Ordinary Resume and heard-save inline controls passed before failure. |
| G2 | EJECUTAR | Initial `G2-focused`: 209 pass, one obsolete primary-Play method assertion fails. `G2-controls-corrected`: 15 pass. New-test typing corrections require `G2-test-types-corrected`: 161 pass in coordinator/controls. R1 declines retaining 49 partial results; fresh `R2-G2-readers` passes those 49 with complete installed-input capture. Final coverage: 210 pass. The failed aggregate remains failed. |
| G3 | EJECUTAR | Initial format/lint pass; types expose three new-test errors. After corrections and the final browser-only edit, `G3-format-browser-final`, `G3-lint-browser-final`, `G3-types-browser-final` all exit 0. |
| G4 | EJECUTAR | Initial shell attempt exits 255 before Playwright. Quoting retry passes three controls and fails the new case's visibility precondition. Bounded viewport correction passes PSC-03. R1 declines retaining the three partial results; fresh `R2-G4-controls` passes all three with complete installed-input capture. Final coverage: four pass. |
| G5 | EJECUTAR; REUTILIZAR CON PRUEBA for assets | `G5-core` verifies the current Piper package; `G5-build` creates one current renderer/native executable. No package regeneration or installer build. |
| G6 | EJECUTAR | `G6-piper-en`: exit 0; one current Piper EN arm, six rates, synchronization, cancellation and complete verified cleanup. |
| G7 | EJECUTAR | Evidence guard, whitespace and 78 local Markdown file links pass (`G7-evidence`, `G7-diff`, `G7-links`); renewed for the final review snapshot. |
| G8 | EJECUTAR | PSC-R1-20261031 BLOCKED for partial-result evidence; PSC-R2-20261031 APPROVE after requested fresh checks. Final archival assessment PSC-R3-20261031 is retained separately in the immutable reports. |

NO APLICA: full repository/desktop sweeps, Python/Rust matrices, normalization
corpus, new DSP/listening benchmarks, installers and additional model/language
arms. Unchanged boundaries do not establish fresh PASS for those exclusions.

## Preserved failures and bounded corrections

G1 fails at the intended behavioral assertions: retired `resume()` call,
lost paused intent after rejected admission, A locator instead of B, retired
rate application (saved/unavailable storage variants), and enabled early Resume.
Production remained unchanged for this receipt. Later test typing corrections
decode the public unknown locator and remove unsupported Testing Library `exact`
options; the expected behavior is unchanged.

G2's existing controls test still required primary Play to call internal
`start()`. Its expectation now checks visible-start routing and verifies internal
start is untouched. G3 initially rejects the new unknown-locator access and two
Testing Library options; those test-only errors are corrected and retained.

G4 initially loses regex quotes through the Windows `.cmd` shim. Its single
infrastructure retry uses PowerShell `--%`, preserving the exact planned regex
argument. The resulting browser invocation passes MPA-01/03, RAC-07 and VCA-06/09.
The new PSC fixture's copied 640x480 viewport places the paragraph outside the
screen; screenshot/trace retain the failed precondition. Bounded replanning
removes only that new case's viewport override, uses configured 1280x720 and
keeps both actual visibility and first-B-preparation assertions. Only PSC-03 is
rerun. No production layout change, weakened assertion, automatic retry or
retry-budget reset occurs.

## Evidence reuse proof

MPA G3/CI3/CI4/CI7 original result and input digests match their recorded values;
the original logs are present. CI3's recorded sources/config/locks match the
pre-edit workspace, but metadata alone does not establish installed-library and
environment identity. Therefore no historical runtime PASS is accepted. R7's
217-test original R1-G4 result is older and remains historical; its cleanup
lessons and existing regression coverage inform scope only.

The initial proposal to retain three untouched reader/persistence files was
rejected by R1 for missing execution-time installed-library bytes.
Vitest executes explicit selected files in isolated environments; these files
do not import the changed coordinator/control test modules. Production modules,
transitive imports, fixtures, Vitest setup/configuration, lockfiles, installed
metadata and generated exports remain identical. Browser tests are explicitly
excluded by Vite's Vitest configuration and are not imported by those suites.
Documentation is not consumed by these tests.

For G4, the failed trace contains the full original browser source with SHA-256
`7a2ae068c221e737b9d62792f904018f286129f30a1eb20af0cb51ce2f2a6d75`, matching
the execution-time manifest. Removing only PSC-03 from original/current source
leaves exactly identical cases and helpers (`G4-case-equivalence.json`). The
renderer, packages, locks and Playwright/Vite configuration are unchanged.
A fresh context is configured per case. The three original passing cases prove
the same navigation, Resume/follow and rate invariants, but R1 rejects their
proposed reuse because installed-browser bytes were not captured.
The failed four-case invocation is never relabelled as passing.

Current-task static/build/native results may survive later documentation-only
edits only with full input and artifact comparison in the review manifest.
All original receipts remain immutable and retrievable. No old executable or
historical native measurement establishes PSC acceptance.

Independent [PSC-R1-20261031](review-reports.md) is preserved as BLOCKED, with no
production finding. Its requested renewal runs exactly the three reader/save
files (49/49) and three browser controls (3/3). No production or test source
changes follow R1. `R2-installed-before.json`/`after.json` inventory 24,050
entries, including 20,123 files, across installed workspace libraries, junction
targets, Node/Corepack, pnpm and browser payloads. Source/config membership and
hashes (1,489 entries) plus all 251 exports match before/after each renewal.

The strict installed comparison reports two generated output differences:
Vitest's results cache and Chromium's diagnostic `debug.log`. The separate
`R2-host-identity-assessment.json` retains both identities and classifies them;
no library, executable, environment or membership differs. Vitest's installed
`ResultsCache.update/write` records current test duration/status after execution.
The original strict mismatch is not overwritten. An initial PowerShell
OrderedDictionary comparison falsely reported export drift; the corrected
PSCustomObject property comparison proves identical exports. Neither diagnostic
changes a test outcome. Browser processes and the preview listener are absent.
R1 accepts the final-revision G3/G5/G6 evidence; those gates are not rerun.

## Native preparation and cleanup

Readiness captures matching WebView2/driver identities, writable scratch,
sufficient disk, initial process identities and existing firewall rules.
The temporary resource wrapper uses a new PSC receipt/backup namespace and
G5's current binary identity; original MPA wrappers/receipts are not rerun or
overwritten. The versioned native runner owns the actual test/lifecycle logic.

Before resource mutation, the journal records source, target, backup, intended
operation and restoration. The complete original resource tree is inventoried;
the current verified package is copied temporarily. Complete source/discovered
membership and hashes plus all runtime-manifest entries are checked. `finally`
restores the original tree and verifies all file paths, sizes and SHA-256 values.
Native process identities include PID, creation time and executable; scratch
membership and executable identity are compared before/after.

G6 passes on the 12,452,864-byte G5 executable, SHA-256
`09e69a0f47531c2df9952b1a92a2bf09ae814bafca376c84c3b1e6162ed48932`.
The verified runtime manifest is
`526447762ae3eb26383dbc095cdc8350b50546ed4259497915cade936f85d324`;
all 2,023 entries and complete copied-source membership match. Six rates pass,
ordinary Pause retains highlight and resumes at the same boundary, and seek,
chapter and paragraph-leaf replacement pass. Six AudioContexts are created and
closed; cleanup reports zero retained/discarded units, generated audio files,
stale playback and external requests. Observed cancellation is 286 ms and first
slow-rate activation 750 ms; these are run observations, not new support claims.

The original adjacent resource tree is restored byte-for-byte, with identical
membership, sizes and SHA-256 values; the temporary backup is absent. No new owned
process or native scratch root remains. Pre-existing scratch roots are preserved.
Post-run checks confirm unchanged binary/renderer/wrapper bytes and firewall
rules, and no listener on the configured Chromium preview port. The restored
adjacent Piper resources remain old; the task verifies a temporary current-package
copy and does not silently upgrade the user's restored host resources.

## Exact executed commands and receipt identities

Each JSON receipt also records UTC start/end, HEAD, environment and input-manifest digest. Logs and export manifests share its ID. G7/review receipts are linked by the independent report after documentation freezes.

| Receipt ID | Command | Exit | Receipt SHA-256 |
| --- | --- | --- | --- |
| G0-baseline | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/persistence/narration-position-save-bridge.test.ts | 0 | 1ee9d39e09e5052550c8d325b8809a723650a9c81490611befe6d86fdba1f87f |
| G1-regressions-red | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx -t "PSC-" | 1 | 7a3b5f308d98203710c28d725463286335914a2055d0f0c34ee1c34bfd1f942e |
| G2-focused | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/persistence/narration-position-save-bridge.test.ts | 1 | 17ad98005139dc174f52fc4a56fd5d3c7f52befd6d48b211eb7ac6cc7ce9de68 |
| G2-controls-corrected | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/ProductNarrationControls.test.tsx | 0 | dc5afc946efb155480aeeace0f037c68c159c3019d3c0f919eb875d804f8cc8d |
| G2-test-types-corrected | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx | 0 | 03fb2351b2908f607bcd23d97df9faf34ddfa8e7d62ddaaab77d71de744ad153 |
| G3-format | pnpm.cmd format:check:typescript | 0 | fdbb6944402741ca7c708d95ace9a16795c14dd8ec64cad68f4452cab75f0f3d |
| G3-lint | pnpm.cmd lint:typescript | 0 | 4043189fffac2997f0efc015b46a2f1efbf509b48a8d9c47915ed500913398d1 |
| G3-types | pnpm.cmd --filter @voxleaf/desktop typecheck | 2 | bb0c5a85a0b5989a8d68ab9bf8518676487a1258627fb4e5519a9baa6f7ab470 |
| G3-format-corrected | pnpm.cmd format:check:typescript | 0 | 62fda98d51ce700d865279f3282e761dd0525edbfedce98df95120c0f08ff6e3 |
| G3-lint-corrected | pnpm.cmd lint:typescript | 0 | 0b0341b3629f912a1e9cae23d84a03dd69369acfb36cd50e7043667369d720ac |
| G3-types-corrected | pnpm.cmd --filter @voxleaf/desktop typecheck | 0 | 8a3b078ad4f7e0936938f026c288127d9e8b348b7e119aac0a966fb45b71aab0 |
| G4-browser | pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "PSC-&#124;VCA-06/09&#124;RAC-07&#124;MPA-01/03" | 255 | f2e13152dcb8596a2d074859abc38e1d8d63ea7513d99c0d57a6d206f430b436 |
| G4-browser-quoted | pnpm.cmd --% test:browser reader-narration-bugfixes.smoke.spec.ts --grep "PSC-&#124;VCA-06/09&#124;RAC-07&#124;MPA-01/03" | 1 | 906f641daa2d3526741747bd7148cbc3f89264e8a144c64c17fd71793d40ebbe |
| G4-psc-viewport-corrected | pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "PSC-03" | 0 | 0fa534125e886bc47dba9848b193576dcc44d93f263b49db70b416dbed301998 |
| G3-format-browser-final | pnpm.cmd format:check:typescript | 0 | 95b44e18d592e23b4d99c57caa1ce4909d6564253ae951f04e11fd991fdedde4 |
| G3-lint-browser-final | pnpm.cmd lint:typescript | 0 | 9110b343fff52a62d1a1ca1cb103a160a97fccd1033dd7baefa5dce9603feaac |
| G3-types-browser-final | pnpm.cmd --filter @voxleaf/desktop typecheck | 0 | 14146baacae3e20efb50435c927aa2c4bb0f82c882bfb4ae2ad635428e0128ff |
| G5-core | pnpm.cmd package:piper-core:check | 0 | 8615ec29c7e1f27fefeb62c544efa7cf3f0491c791e54cdf9842c794141ce130 |
| G5-build | pnpm.cmd build:desktop | 0 | 692020d1e1d4396d5f67ce1813e2855c6af75c0d3f774d5ea93531177c87da97 |
| G6-piper-en | & ./tmp/evidence/minimal-playback-state-corrections/piper-resources.ps1 | 0 | ece95dc06bddc82e7608dad65d2d8e0842d71ec0be83d89c6321d42e64b2d2fb |

G6 invokes the unchanged versioned runner exactly:

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en
```

G7 commands: `pnpm.cmd check:evidence`; `git diff --check`; the local PowerShell relative-link inspection in `check-links.ps1`. Formatting preparation used the configured `pnpm.cmd exec prettier --write` executable only on the five owned TypeScript/TSX files, then the two corrected test files; both formatter receipts remain in the same raw evidence root.

## R1-requested renewal receipts

| Receipt | Exact command | Exit | Receipt SHA-256 |
| --- | --- | --- | --- |
| R2-G2-readers | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/persistence/narration-position-save-bridge.test.ts | 0 | c39119be8ad8b1d1977a8e23ef483d13af1c917a0afe1ae69bc9429722bca2a2 |
| R2-G4-controls | pnpm.cmd --% test:browser reader-narration-bugfixes.smoke.spec.ts --grep "VCA-06/09&#124;RAC-07&#124;MPA-01/03" | 0 | 787834c262012ca1e3c6a757036c453cf950442fee88ffc86737e0520fb4d3c5 |
| R2-identity-assessment | & ./tmp/evidence/minimal-playback-state-corrections/assess-r2-identities.ps1 | 0 | eb866c83e3e88c4974d2404ea3c032a2ec94bed7065755c34950658e62fe810f |
