# F4 execution ledger

Task: F4-20261031. Base and unchanged HEAD:
`3a1f83d395a8c50bc2333136c29d8ef6250d3d8d`.
Branch: `codex/four-finding-minimal-corrections-plan`.
Initial worktree and index were clean. No commit, push or PR is authorized.
Raw receipts: `tmp/evidence/four-finding-minimal-corrections/run-01/`.

## Scope and reproduction

Only the seven production/test paths from the ExecPlan change. The production
patch widens the existing word-boundary predicate to Unicode numbers, adds dates
to the existing numeric-compound guard, shuts down uncancellable pending startup
before joining it, and returns native cancellation regardless of an already
successful result. Contracts, lexical allowlists, legacy normalization, deadlines,
models, Python and packaging source remain unchanged. The canonical diagram and
M005 preparation boundary still match; only the architecture overview is clarified.

All commands ran in normal local PowerShell outside the managed sandbox using
Node 24.18.0, pnpm 11.15.1, Rust/Cargo 1.97.1 and the installed locked dependencies.
Each gate records original command, start/end, exit, source membership/hashes and
package exports. Installed library/tool manifests preserve full membership and
hashes; generated Vitest cache output is excluded explicitly, never treated as a
library. Original failed receipts are retained.

- G-RED-EPUB: 16 intended failures, six passing controls, 183 skipped. Unicode
  adjacency and attached dates expand partially on original normalizer bytes.
- G-RED-DESKTOP: two harness timeouts, not defect evidence. The fake interval was
  not invoked after asynchronous backend rejection. Added the existing explicit
  interval tick; no production edit occurred before the valid reproduction.
- G-RED-DESKTOP-r2: one intended failure (`cleanup-failed`/contained instead of
  recovery-available); failing-shutdown control passed. Virtual time and finally
  cleanup prevent hanging or a real five-second delay.
- G-RED-RUST: cancel-wins returns successful four-byte synthetic PCM instead of
  Cancelled; completion-wins control passes. The test hook calls real `cancel()`
  after result construction and before final lifecycle arbitration. No sleeps.

## Final focused gates

- G-EPUB: 213 passed across normalizer, public preparation and resource bounds.
- G-DESKTOP: 213 passed across coordinator, PCM player and typed client.
- G-DESKTOP-coordinator-final: 148 passed after formatting the new destructuring
  line. Only coordinator evidence is replaced; the other 65 tests remain eligible
  for retention under independent review of unchanged inputs and isolation.
- G-RUST-default: 35 passed, five ignored. G-RUST-locked: 34 passed, five ignored.
  Ignored real-host/subprocess fixtures are not reported as passes.
- Final TypeScript format/lint, EPUB/desktop types, Rust format and two-mode
  Clippy all pass. First TypeScript format failure is retained; one owned test
  line was formatted, followed by affected coordinator/static checks.
- G0-preparation and G-EXPORTS built package prerequisites and final exports;
  preparation is not a behavior test. G-CORE verified the unchanged existing
  Piper core. G-BUILD built current renderer/native bytes through the configured
  Tauri frontend hook. Vite's advisory chunk-size warning is retained.
- G-NATIVE passes once on the new executable. Independent review remains pending.

## Evidence retention decisions

No historical runtime PASS is accepted. Reused fixtures are the existing source
mapping/public locator helpers, fake coordinator/clock/backend and native
CommandFixture. The existing Piper payload and compatible driver are artifact
reuse, subject to fresh integrity/readiness checks; the executable and renderer
are newly built. Compiler caches are preparation only.

Final source/export and installed-input comparisons accompany review. Later
Markdown-only changes do not enter the selected Vitest, TypeScript, Rust or native
runtime inputs. The selected versioned native runner is unchanged. The independently
reviewed manifest will bind the exact patch and identify retained receipts.

## Native preparation and cleanup

Readiness records available disk, writable then removed scratch, compatible
WebDriver/WebView2 156.0.4314 builds, initial empty owned-process surface and the
current core manifest. The temporary-resource journal and complete before/after
inventories are retained privately. The wrapper uses the new F4 namespace and
current binary, calls the existing runner once, and restores the original adjacent
resources in finally. Native exit 0; original full resource membership, sizes and hashes restored; temporary backup absent. No new owned process or scratch root remains. Six AudioContexts created/closed; zero retained/discarded audio units, generated audio files, stale playback or external requests. Pre-existing scratch roots were preserved.

## Commands and immutable receipts

The receipt table below is populated from actual command receipts. Red and failed
format attempts remain separate; no failed aggregate is relabeled as passing.

Current executable: 12,452,864 bytes, SHA-256
`8604f18949af4d842e536807521c8bf9da7638b892019cbcaa6b681316a5461c`.
Verified core manifest SHA-256:
`526447762ae3eb26383dbc095cdc8350b50546ed4259497915cade936f85d324`.
The copied package matched complete discovered source membership and all 2,023
manifest entries before execution. Renderer and executable identities are retained
separately. G-NATIVE observed cancellation at 844 ms and initial rate activation
at 750 ms; these are bounded run observations, not new performance/support claims.
No installer, model, GPU/listening or second-language campaign was run.

| Receipt | Exact command | Exit | SHA-256 |
| --- | --- | --- | --- |
| G-BUILD | pnpm.cmd build:desktop | 0 | b1d29a07c9bdb9ca5f86a190587423fc3afaa33507836e16ad687faa6d62b29a |
| G-CORE | pnpm.cmd package:piper-core:check | 0 | 849bdbbaa61064d9b47a879b0dc58189aa3a7a15e697338629a95791fcb8003b |
| G-DESKTOP-coordinator-final | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts | 0 | 9cdcd5460d1be2cd2ee18227ad938cc662b74ca71662daf01bcce5eacd9c23c1 |
| G-DESKTOP | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/pcm-playback.test.ts src/tts/process-client.test.ts | 0 | 22be12770f70e9b4fe7cab22a29c9b55a4f5bdd6e3c97c8b9e355bafd4cebce1 |
| G-EPUB | pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts | 0 | 8780d2b398dee01a135fbffc95f948e0e96965216bd6baab5e9d8bb4d205d735 |
| G-EXPORTS | pnpm.cmd build:packages | 0 | 27793ec27abfdb7ae60f4c7b2e7e399069d478e44ffc8e23acaf0eb8323d69e5 |
| G-IDENTITY-installed-after | node tmp/evidence/four-finding-minimal-corrections/run-01/capture-installed.mjs after | 0 | 587b35c653146ba190905b1907d13c7d4cba5adb2d2a4dbc4500845516967820 |
| G-IDENTITY-native-after | & ./tmp/evidence/four-finding-minimal-corrections/run-01/capture-native-inputs.ps1 after | 0 | 65323606a694dfdc2e7ff052b5ed1f4e9a1b30a55d0cdf7ac21f1bbb0ef31aa9 |
| G-NATIVE-readiness | & ./tmp/evidence/four-finding-minimal-corrections/run-01/native-readiness.ps1 | 0 | 8734a712a4f07d03ea15c0f4b9a414a6057fefa8504e575dcbbf24d495de2030 |
| G-NATIVE | & ./tmp/evidence/four-finding-minimal-corrections/run-01/piper-resources.ps1 | 0 | 0204a6e31e8b2a7b78c838ae13e36e9072d10830ffb40cb8e577e1d84ebeba11 |
| G-RED-DESKTOP-r2 | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t F4-03 | 1 | 089c9ece312c13d9d505f679e20527b9b44d94df3f0c87d36b53d2c68c8438f2 |
| G-RED-DESKTOP | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t F4-03 | 1 | 76bcaf68dbcbdfd62ffaf02448a44c2e6c409b05e33dc89a0d9b7c6291df24d7 |
| G-RED-EPUB | pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts -t F4- | 1 | fa36308c24d70d8fe8cdeb94d6e1f74d89bd5043045cc6678210b4e0ee62c84c |
| G-RED-RUST | cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::f4_ | 101 | f1e7579004680df020c03c06a044218f4ef82a1f71ac89acf5e51205f7f9dc73 |
| G-RUST-default | cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests:: | 0 | e4e204cdaf97cc83a0afbd8c0491fb59dac633514f0d3597181262c065d4014a |
| G-RUST-locked | cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests:: --features release-locked-runtime | 0 | 7222de734e35f1d5062f194e83ed96aef7420df9fabbdeab5abb60d290ef8c70 |
| G-STATIC-format-rust | pnpm.cmd format:check:rust | 0 | 4766a530767c6c70a807df995b8e434d90c66eecb8c8eec7df9f7f8be1406ec3 |
| G-STATIC-format-ts-final | pnpm.cmd format:check:typescript | 0 | fcaf3ef583a1dfeb315d36ea3b0e64c87657c612e0189bdf49606bae3068a182 |
| G-STATIC-format-ts | pnpm.cmd format:check:typescript | 1 | 78cbeab6a2aeca2bf6bce7c605166b429b58533b50487d8a09e00303bc0fc9ee |
| G-STATIC-lint-rust | pnpm.cmd lint:rust | 0 | 4bbc071e0e7bd2bf76775228597fad288750a1722f697e189e91554c0558d9fc |
| G-STATIC-lint-ts-final | pnpm.cmd lint:typescript | 0 | 0bd31fc66c4b59ffa369520e20dbb0b2b0463db3621dc3bd569fa382c21e8381 |
| G-STATIC-lint-ts | pnpm.cmd lint:typescript | 0 | 0a665e0c516df155fb51a23afb737e08a44ee7448f75a3a8dd7efac52443c3b8 |
| G-STATIC-types-desktop-final | pnpm.cmd --filter @voxleaf/desktop typecheck | 0 | b55b46336fd5ea8340bac84fa392b1a52aef5e94423f45f2beeba2690240ff51 |
| G-STATIC-types-desktop | pnpm.cmd --filter @voxleaf/desktop typecheck | 0 | a8d9ed61d7304479576d2d2f9353888793600fe477e01766ff065711b26c4aa0 |
| G-STATIC-types-epub | pnpm.cmd --filter @voxleaf/epub typecheck | 0 | 62dcc11edfdac2bda513309efbf009a2d7600106807a64810be77f5f22edffb9 |
| G0-format-tests | pnpm.cmd exec prettier --write packages/epub/src/narration/narration-normalizer.test.ts packages/epub/src/integration/narration-preparation-matrix.test.ts apps/desktop/src/tts/product-narration-coordinator.test.ts; cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml | 0 | cb7baa42472747551a41dbc2480e81684e0ce271b7f7b3ff47cca922b96af5a2 |
| G0-native-inputs | & ./tmp/evidence/four-finding-minimal-corrections/run-01/capture-native-inputs.ps1 before | 0 | d1841f624157c0f75df1469ccd892572e38b96978f533cead37746551de08190 |
| G0-preparation | node tmp/evidence/four-finding-minimal-corrections/run-01/capture-installed.mjs before; pnpm.cmd build:packages | 0 | 512b16990860eeac3a14748d691d2394314f1a5bf08cfc0e0b4336dd7ec09181 |
| G1-format-coordinator | pnpm.cmd exec prettier --write apps/desktop/src/tts/product-narration-coordinator.test.ts | 0 | 0b2f64120821ea896b5bd183f1e544d2d25f7a28689480f2ad82d134f4e30d53 |

G-NATIVE wrapper invokes exactly:

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en
```

## Final identity assessment

G-IDENTITY-assessment passes in host PowerShell. Complete installed Node/package/
browser membership is unchanged (24,014 entries, 20,098 files); the native
registry/toolchain snapshot is unchanged (13,663 files). Relevant environment
values and binary/renderer bytes match. Exports match every final gate.
The initial exploratory native-environment JSON comparison reported false because
unordered keys serialized differently; property-wise comparison confirms all five
values remain null. That diagnostic and both original manifests are preserved.
No test result is replaced by this diagnostic.

R1-gate-input-comparison.json names all later source changes. They are Markdown,
plus the coordinator test's formatting change for earlier G-EPUB/G-DESKTOP/EPUB
types receipts. EPUB's configured source/test inputs exclude the desktop test.
The coordinator was rerun after formatting. The unchanged PCM/player and client
suites have no imports of the coordinator test, and Vitest's default per-file
isolation remains configured; retain their 65 passing cases from G-DESKTOP.
All other final runtime/static inputs match. No runtime PASS is inferred from
failed red, format or harness attempts. Review must assess these retention claims.

G-DOCS runs the evidence guard, diff whitespace check and relative Markdown-link
inspection on the frozen document set; its receipts and subsequent review manifest
remain outside the evaluated documents to avoid self-referential hashes.

## Independent correction F4-R1-01

[F4-R1-20261031](review-reports.md) requested stronger explicit recovery coverage:
the fake clock getter made advance throw after the synthesis dispatch record.
The correction stubs advance consistently with SAC-10 and waits for active audio,
then asserts playing, operational recovery, no failure, one new start and the
fresh identity. No production or runtime artifact changes follow native acceptance.

R2-G-DESKTOP-coordinator passes all 148 cases; R2 TypeScript format/lint and desktop
types pass. Preserve the initial R1 report and earlier receipts. The EPUB, isolated
player/client, Rust, core and native gates do not consume this test-only change;
retain them subject to the new review. The current executable/renderer remain the
G-BUILD bytes. All future archival edits are Markdown only.

| Correction receipt | Command | Exit | Receipt SHA-256 |
| --- | --- | --- | --- |
| R2-G-DESKTOP-coordinator | pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts | 0 | 5c27422226b9fe7e32e91a294495f3e283c32976f957d80605a004c318062055 |
| R2-G-STATIC-format-ts | pnpm.cmd format:check:typescript | 0 | 60752b27d6b4657a2f2db795ee0de0c3a66050d7e5c90af995ada7cb0f75021f |
| R2-G-STATIC-lint-ts | pnpm.cmd lint:typescript | 0 | 693542a4a1e60c5a78717f747b3b9e08777616538abfdbea0cf047aabf0bb1db |
| R2-G-STATIC-types-desktop | pnpm.cmd --filter @voxleaf/desktop typecheck | 0 | 3f5d2f070f5b6fcf42d7ee5944e64858193ca9b2c179ddbc11ec5eb6170dd2d0 |

## Accepted implementation and archival

Independent [F4-R2-20261031](review-reports.md) APPROVE resolves F4-R1-01 and
accepts all four corrections and the scoped retention decisions with no remaining
finding. Only then was the ExecPlan moved to completed and navigation updated.
Final archival assessment is recorded separately in the same immutable report
collection. No source, test, dependency, export or built artifact changes follow R2.
Final documentation receipts cover the archived plan, indexes, overview and ledger.
No commit, push, PR, dependency/model upgrade or package regeneration occurred.
The initial branch/HEAD and empty index are preserved.
