# Chatterbox certifi and Pillow security refresh

Created: 2026-10-20. Completed: 2026-10-21. V5 is published; production
integration, installed gates, repository/browser/native checks, host restoration,
independent acceptance and fresh PR CI pass. PR #266 remains open.

Editorial consolidation: 2026-10-21, under PR266-CLEANUP-WO-20261021-01.
Privacy redaction: 2026-10-21. Personal context and local-data inventory values
are omitted; technical requirements, outcomes, source/artifact identities and
receipt IDs are retained. Full preservation receipts remain local.
The seven PR commits were sanitized on 2026-10-21; source identities quoted
below identify the original technical evidence.
Failures and pending states below belong to their historical checkpoints;
the final acceptance section records their resolution. No tests were rerun
for this editorial consolidation.

## Goal

Resolve PR #266's production dependency audit failure by replacing vulnerable
certifi and Pillow in a verified, additive Chatterbox runtime package. A changed
lock alone is not installed remediation. Keep the eight accepted reader fixes
and their completed plan intact.

## User-visible outcome

Compatible hosts can acquire and execute a corrected local Chatterbox package
in Spanish and English. Piper, stable locations, bounded queues, cancellation,
memory-only audio and user data retain their current behavior. Older vulnerable
packages remain removable but cannot silently satisfy corrected admission.

## Initial state (historical)

Branch `codex/reader-narration-acquisition-bugfixes`, starting HEAD
`0d97b4e36fc32b3e12abd93406d0be298f8409e6`, PR #266 against `main`.
The initial worktree and index are clean. B01–B08 have independent R6 approval.
Both Ubuntu CI foundations pass; Windows foundation was running at diagnosis.

GitHub audit run 39504014194 and ordinary Windows `pnpm run audit:release`
both fail the production optional Chatterbox graph. Node, Rust, base Python
and Piper pass. Current pins are certifi 2026.7.22 and Pillow 12.3.0.
The initial certifi upstream advisory GHSA-6q48-6c7w-9gw2 identified 2026.10.18
as patched; the live audit subsequently requires 2026.10.19 (see progress).
Eight Pillow advisories identify 13.0.0: CVE-2026-112895,
CVE-2026-112400, CVE-2026-112397, CVE-2026-112896, CVE-2026-112897,
CVE-2026-112395, CVE-2026-112404 and CVE-2026-112899. Non-yanked compatible
Windows/Python 3.12 wheels exist. Compatibility remains to be validated.

The approved scope exception supersedes the earlier dependency-upgrade
exclusion only for certifi and Pillow. Existing commit/push/PR authorization
applies to reviewed updates of PR #266; no merge,
overwrite of published artifacts or new public installer is authorized.

## Scope and non-goals

Only certifi and Pillow pins may change. Retain the other 77 package versions,
Torch/CUDA, official model bytes/revision, profiles, languages and protocol.
Keep published v2/v3 locks, source/runtime/acquisition authority and receipts
immutable. Existing v4 is an unpublished, unadmitted current-source build;
do not repurpose it or silently overwrite its evidence. Select a distinct
successor identity after the boundary investigation (v5 is the candidate).

One primary agent writes source. The skill-required investigator and bypass
reviewer are read-only; the repository's independent change_reviewer supplies
acceptance. No Qwen inference, broad dependency refresh, advisory suppression,
capacity increases, model replacement or unrelated refactoring.

## Relevant files and documentation

- `services/tts/release/profiles/chatterbox-v3/requirements.{in,lock}` (read-only baseline), new successor profile and generated lock.
- `services/tts/src/voxleaf_tts/packaging/chatterbox_{integrity,authority,sources}.py`, `release_chatterbox.py`, additive successor helpers as justified.
- `services/tts/tests/test_release_chatterbox*.py`, `test_release_dependency_graphs.py`, existing security probe and relevant release tests.
- `services/tts/release/optional/chatterbox/`, native `tts_optional_chatterbox.rs` and its tests, release Tauri/NSIS configuration.
- `scripts/release-audit.mjs`, `scripts/release_inventory.py`, generated component/license inventory and audit policy.
- Ordinary installed host and Windows release scripts/tests; settings size disclosures; package scripts and Dependabot selectors.
- ADR-0052, dependency/testing/release documentation, canonical system diagram, this plan and indexes. Freeze exact integration paths before edits.

## Architecture and constraints

The fix is at the shipped-runtime dependency and native-admission boundary.
Pillow vulnerable presence is confirmed by the locked graph; individual image
sink reachability must be distinguished from demonstrated exploitability.
Certifi's root store can affect Python TLS callers; native package acquisition
uses its existing Rust HTTPS boundary. Preserve fail-closed complete hashes,
exact origins, commit/package identities, bounded staging and explicit consent.

Build and probe in an isolated temporary environment, never mutate the user's
installed interpreter. Keep old data intact through an independently verified
backup/restore path during installed gates. Follow the Codex Security artifact
storage policy for plugin evidence; repository plans/source remain normal files.
Generated locks/manifests/inventory must come from their existing or explicitly
added generators. Published package assets require a concrete reviewed artifact
and explicit publication authorization before uploading.

## Milestones

1. **Diagnosis and scope — complete.** Reproduce audit, establish exact pins,
   investigate security/compatibility boundary independently, and freeze successor
   identity plus allowlists. Preserve failure evidence and upstream references.
2. **Candidate graph and local package — complete.** Add two-pin successor
   graph, generated hashes, focused dependency regressions and additive builder.
   Audit the exact candidate; validate imports, security repairs, offline ES/EN,
   runtime integrity and existing package compatibility. Preserve v3/v4 bytes.
3. **Reviewed publication preparation — complete.** Freeze source/artifact
   identities, measured sizes/digests and local evidence; review the patch and
   concrete publication manifest. Publish only after applicable authorization.
4. **Production integration and installed acceptance — complete.** Generate
   acquisition authority from publication readback, admit only the successor,
   retain old versions as cleanup-only, update audit/inventory/disclosures.
   Run ordinary installed B06/B07, ES/EN, lifecycle and restoration gates.
5. **Independent review and PR update — complete.** Complete required checks,
   skill bypass/regression review and exact-patch change review; commit/push the
   authorized update, confirm fresh CI and close this plan only after acceptance.

## Testing and benchmark strategy

Every test/build/audit/validation executes in ordinary Windows PowerShell outside
the sandbox; assert Windows package identity 15700. Record exact commands,
inputs, environment, outputs, exits and restoration. Run fast checks before
expensive builds. Existing commands inspected at plan creation:

| Gate | Command / boundary | Timing |
| --- | --- | --- |
| Baseline live advisories | `pnpm run audit:release` | Before edits; failed as above |
| Python quality and regression | `pnpm run format:check:python`, `lint:python`, `typecheck:python`, `test:python`, `build:python` | After affected edits |
| Frozen compatibility | `pnpm run package:chatterbox-optional:v3:check-source`, `package:chatterbox-optional:v3:check-acquisition`, v4 source/local checks where inputs exist | Before accepting successor builder |
| Successor graph/build/security | Add explicit versioned commands after inspecting existing CLI; use documented `uv pip compile` with no dependency expansion | Candidate preparation |
| Production dependencies | `pnpm run audit:release`, `inventory:release:check` | After corrected production admission |
| Repository | `pnpm run check` | Final runtime candidate |
| Browser/native/audio | `pnpm run test:browser`, `test:native-startup`, `test:tts:reader-corrections-host` | Integrated runtime; four ES/EN arms, no Qwen |
| Installed | `pnpm run package:windows:verified-core`, `package:windows:check`, `package:windows:reader-corrections` with explicit receipt | Exact rebuilt installed candidate |
| Closeout | `pnpm run check:evidence`, `git diff --check`, exact identity review | Final documents |

New successor commands and security probes must be recorded before execution.
Tests must demonstrate the unsafe pins fail and corrected pins satisfy the
boundary while v2/v3/v4 historical generators stay unchanged. Real-library
probes supplement, not replace, the dependency audit. Preserve bounds, all
barriers and deadlines. Reuse results only with a complete input identity proof.

## Risks and rollback

Pillow is a major-version update: import/API and model execution compatibility
must be measured. A clean audit does not prove every vulnerability unreachable
or every caller compatible. Do not weaken checks to bypass installation or CI.
Failures retain original receipts and require a bounded, evidence-backed retry.
No automatic repair or execution of old installed packages. Temporary firewall
rules, helper processes, registry/shortcuts and data backups must be restored.
Preserve the current accepted commit; never reset/stash/clean unrelated work.

## Preparation evidence and decisions

The immutable preparation report
`CB-V5-PREP-R2-20261020-ASTRA-230616Z` approves commit
`702f80b5b688193e10ef58f9a5cbebb3a42a4090` and the exact v5 assembly.
Full commands, input hashes, failed attempts and successful retries remain in
the persistent Codex Security artifact collection under the job names below.

- The boundary investigation selected additive v5, freezing v3 service/model
  bytes and changing only certifi/Pillow among 79 locked packages. The initial
  certifi 2026.10.18 candidate failed the updated advisory feed; 2026.10.19 passed.
- The independent bypass review exposed inherited `--no-sync` accepting a
  stale environment. CLI/API regressions reproduced it; v5 now requires sync,
  while historical v2–v4 behavior remains unchanged.
- Windows long-path failures required an absolute, version-separated
  `--output-root` and temporary drive alias. Existing containment/integrity
  checks and Windows settings were preserved. Superseded no-sync builds and
  interrupted runs are not acceptance evidence.
- `prep-resumed-gates` passed ordinary-host portable checks, 595 Python tests,
  frozen v3/v4 compatibility, v5 source checks and the candidate audit.
- `probe-v5-isolated-cache-b` passed real-library security probes, ES/EN and
  full package integrity at 22:56:28–22:59:55 UTC on 2026-10-20. Spanish/English
  produced 4.12/3.84 seconds of bounded PCM; cancellation after begin and before
  settle took 344/328 ms. These are preparation observations, not installed
  desktop cancellation results. An earlier probe had added 46 Numba caches;
  only those isolated files were removed, and the successful probe required
  an external cache directory. User runtime files were never changed.
- The reviewed assembly contains 13,083 files, 5,027,548,189 installed runtime
  bytes and three archive parts totaling 5,031,103,825 bytes. No
  cross-environment reproducibility claim is made.

## Discoveries and decisions

- V5 was published at `2026-10-20T23:35:15Z`, release ID `418976062`.
  Independent GitHub readback confirms the exact preparation commit and three
  part sizes/digests, non-draft prerelease state and final URLs. The latest
  release remains v2. No installer or model was uploaded. Intermittent endpoint
  failures required bounded retries; temporary draft URLs were checked before
  publication and final URLs afterward. No DNS, hosts or firewall setting was
  changed for publication.
- `integration-red` reproduced two Python selector/inventory failures and two
  Rust admission/retained-root failures before implementation (593 Python and
  36 focused Rust cases passed). `security-authority-fast-r3` passed formatting,
  lint, mypy and 97 focused Python tests. Earlier import-order and pnpm argument
  errors are retained, not counted as passing test runs.
- `integration-inventory-audit` passed on the ordinary host at
  23:31:55–23:32:34 UTC. Licenses were generated from the exact core/v5 runtime
  metadata; inventory check and the complete production audit passed, retaining
  seven informational Rust notices and the four unchanged Python URL blind
  spots. Only then was the policy audit date advanced to 2026-10-20.
- `integration-generate` passed at 23:36:30–23:36:51 UTC: generated v5
  publication/acquisition/runtime authority from actual readback, preserved the
  v3 authority, regenerated inventory, and applied repository formatters.
  The copied Piper core initially failed its complete integrity check because
  Windows long-path handling hid files. Full extended-path comparisons found
  zero missing, changed or extra files in the original core, copied core and
  fresh v5 trees. The unchanged core check passed with an extended Python import
  root and a temporary drive alias; neither runtime needed modification.
- `integration-check` passed at 23:38:20–23:42:30 UTC on the ordinary host:
  full `pnpm run check`, v5/v3 acquisition, v4 source and inventory checks.
  Results include 611 Python, 209 shared, 672 EPUB and 786 desktop tests;
  Rust variants passed 107/106 tests with two explicit host tests ignored each.
  `integration-browser-native-package` subsequently passed nine browser tests
  and native WebView2 startup, bounded delivery/cancellation/recovery, local
  file boundaries, reader accessibility and restart/position restoration.
- Stock Windows packaging failed at NSIS because the disposable security
  workspace's long source paths exceeded its file lookup limit. A drive alias
  alone did not fix Tauri's canonicalized paths; absolute resource overrides
  also failed because Tauri strips Windows drive prefixes. These failed jobs
  remain retained and are not reported as successful stock package builds.
  `integration-package-flat-resources` passed at 23:55:35–23:58:20 UTC using
  temporary short relative resource inputs. Every copied resource was hashed,
  and its original installed destination preserved in
  `v5-resource-map-equivalence.json`. The repository release config is unchanged
  by this build adaptation. The local unsigned installer is 203,863,163 bytes,
  SHA-256 `4b58be7a1b9ee748de88623876ede1b4d8f92b51a6c982c0784f11b91d89895c`;
  its binary SHA-256 is
  `7a02675199c248adb3cf45cd9bf74774e52e710afb9217a5d5ce4c1287f5c873`.
  The effective temporary config and resource equivalence supplement the
  generated package receipt, whose release-config hash identifies the original
  repository config. This is local validation only, not installer publication.
- `v5-installed-lifecycle-r2` passed all six uninstall-policy scenarios on
  2026-10-21 at 00:01:40–00:04:22 UTC. Its outer receipt confirms identical
  original data and installation hashes, registry, shortcuts and startup value.
  The first attempt failed on a missing PowerShell module; restoration passed.
  The installed B06/B07 journey reached B07 cleanup/retry but stopped before
  B06 verification on a download error. Independent public-URL HEAD requests
  reproduced intermittent GitHub connection timeouts; successful responses and
  the failed journey/restoration receipt are retained separately. Retry remains
  required; this is not a complete installed acquisition pass.
- `v5-installed-four-arm-r5` passed installed Piper and Chatterbox ES/EN,
  playback-rate transitions and reader corrections, followed by the installed
  integrity diagnostic (143.99 seconds). Its host receipt finished at
  2026-10-21 00:49:57 UTC; cancellation measurements were 242/244/297/298 ms.
  The preservation receipt confirms unchanged original data and installation,
  restored registry, shortcuts and startup value, with no leftover installation.
  Network-only HEAD comparisons across two connections found six successes
  on one and one timeout/two successes on the other; they did not establish
  acquisition or identify the cause of the connection failure.
  All three temporary offline firewall rules were removed and absence verified;
  ordinary-host `check:evidence`/`git diff --check` passed before later retries.
- Review `CB-V5-INTEGRATION-R1-ASTRA-20261021T010551Z` is BLOCKED on the
  incomplete acquisition journey and identified one P2 inventory defect:
  all 79 Chatterbox component lock references still named v3. The generator
  now derives both component and top-level paths from its selected lock;
  the inventory was regenerated. The added consistency assertion failed on
  the old inventory, then all 611 Python tests, Python format/lint/types and
  repository Prettier checks passed on the ordinary host. A replacement local
  installer was subsequently built and its installed resources verified below.
- The replacement installer SHA-256 is
  `e9aa652df75e3acce8a6f59a2aa97662a7e9cc8fa4c61d5ce7e8f0f22d097fee`.
  All 2,031 resource destinations are unchanged; only the regenerated inventory
  resource differs. Its 79 corrected lock references are the only inventory
  value changes. The build wrapper retained exit 1 because raw executable
  equality failed. A separate ordinary-host PE comparison passed: all bytes
  outside parsed timestamp and CodeView identity fields match. Bounded review
  `CB-V5-R2-EVIDENCE-ASSESSMENT-20261021-01` supports proposing reuse of earlier
  lifecycle/four-arm observations, subject to final input matching; it is not
  final acceptance or a claim that those tests ran against the new installer.
- `integration-package-r2-check` and `v5-installed-resources-r2` passed on the
  ordinary host. The fresh installation verified all 2,031 resources and the
  actual installed executable SHA-256
  `f12ce770ad4d0a05a49a87a78a1f2843cd06628a55d7517c97e747e9c0d9fe9c`.
  `v5-lifecycle-r4-preservation.json` confirms restoration of the original
  installation, data, registry, shortcuts and startup value. This was a fresh
  resource verification, not a repetition of the six lifecycle policies.
  The final ordinary-host `v5-installed-journey-final` attempt ran from
  2026-10-21 01:22:51 to 01:24:25 UTC and exited 1 at
  `verification-download-tts-optional-profile-download-failed`, before B06
  verification cancellation could complete. It reached the cleanup-failure
  recovery stage, but this is not a complete B06/B07 pass. The final failure
  snapshot contains no remaining managed acquisition paths.
  `v5-journey-r6-preservation.json` verifies unchanged original data and
  installation, restored registry, shortcuts and startup value, with no
  leftover installation. Both temporary TTS rules were removed at 01:25:13 UTC.
  Revision review used immutable `candidate-integration-r2`; the separate
  report and failed journey remain retained. Later continuations are below.

- Publication required explicit authorization for only the three reviewed v5
  assets against `702f80b5b688193e10ef58f9a5cbebb3a42a4090`, preserving historical
  releases and excluding an installer. Initial SSH/HTTPS pushes failed before
  upload; the successful HTTPS push reached that exact commit.
  Preparation approval covered a 1,331-file snapshot, not production admission.
  Integration generated authority only from verified readback and retained
  historical source/runtime/model bytes and authorities.

- Prior local B01–B08 approval does not make the current live release audit pass.
- V3 lock changes alone would falsify installed remediation. V4 already exists
  for an independent local-only build and is not a free production identity.
- The shipped v3 adapter/runtime sources are frozen historical blobs. Avoid
  pulling current runtime refactors into this dependency-only update.
- Published assets and historical authorities remain immutable. Any successor
  adoption must include old-root cleanup tests, accurate bytes and fresh readback.

## Historical validation failures and native-path correction

Baseline `pnpm run audit:release` failed, exit 1, on ordinary host 15700 at
2026-10-20 22:00:37–22:01:08 UTC. Preparation, publication and intermediate
integrated gates above did not establish complete installed acceptance.
The separately approved [download diagnostics improvement](optional-download-diagnostics.md)
observed 1,770,496 bytes before cancellation; its bounded probe neither
completed B06/B07 nor diagnosed the old intermittent error.

- The resumed R8 journey used diagnostics installer SHA-256
  `c8580509978288d207d086c7a97e51899bf625747ffebe2fc4bc85a67e18ea30`.
  Ordinary-host preflight matched 392 execution-source identities, candidate,
  disk, empty index and absence of conflicting app/recovery state.
  `v5-b06b07-audit-r8` passed `inventory:release:check` and `audit:release`,
  with seven informational Rust notices/four Python URL blind spots unchanged.
- `v5-installed-journey-r8` ran at 03:34:21–03:55:10 UTC on 2026-10-21, exit 1.
  Its narrower B06/B07 assertions passed: terminal cleanup failure, admitted
  retry, verification cancellation in 5 ms before commit, removed staging and
  preserved installation after late cancellation. Chatterbox ES/EN,
  restart/discovery and removal ran, but Piper ES failed before sound with
  `tts-service-failed`/`model-load-failed`; Piper EN and acquisition three
  were not reached. R8 was not a complete integrated pass.
- `v5-piper-r9` passed at 03:58:55 UTC: all 2,031 resource hashes, in-memory
  synthetic Piper audio under minimal/ordinary-child environments and direct
  model loading. It did not reproduce the native application failure.
  R8/R9 preserved original data/installation, registry, shortcuts and startup.
  At the cleanup checkpoint, both firewall rules were removed (04:00:52 UTC);
  `v5-pause-r8-r9-safety` passed at 04:04:01 UTC: zero rules/processes/backup
  moves, original data present and installation absent as initially.
  HEAD was `702f80b5b688193e10ef58f9a5cbebb3a42a4090`, empty index, no
  commits/pushes or active jobs. Local `artifacts/b06b07-20261020` retains receipts.
- R10 resumed on 2026-10-21 with the same installer/392 inputs, reproduced the
  failure and restored user state. Process observation found a harness error:
  the journey supplied `--executable <path>`, but
  `resolveNativeSmokeExecutable` accepted only `--executable=<path>`,
  silently choosing the disposable binary. R8 Chatterbox/R10 Piper narration
  therefore did not prove installed-executable behavior. Acquisition retained
  its explicit-executable, narrower B06/B07 observations.
- The parser now accepts both explicit forms and rejects missing, relative
  or duplicate arguments. `v5-native-path-red` reproduced fallback (16 passes,
  one expected failure); `v5-native-path-green` passed TS format/lint and
  the full desktop suite. Product/runtime/installer bytes were unchanged.
  `v5-piper-r11` passed installed Piper ES at 14:25:50 UTC: audible 4,988 ms,
  cancellation 230 ms, zero underruns/external requests/persisted audio.
  The observer verified installed path and SHA-256
  `7734f9a955d7d8207d420487b9feed9bbdfa252f92d5898c367dbfc075ade5b4`;
  preservation verified unchanged data/installation and restored registry,
  shortcuts and startup value. R12 below completed the corrected full journey.

### Corrected complete acquisition result

`v5-installed-journey-r12` passed on the ordinary host, identity 15700, from
14:26:18 to 14:52:10 UTC on 2026-10-21. All 17 installed journey steps passed,
including three complete acquisitions, offline Chatterbox/Piper ES/EN,
restart/discovery, removal, reinstallation and uninstall. The corrections
receipt records a terminal cleanup failure with retry admitted, verification
cancellation in 4 ms before commit, staging removed, and late cancellation
preserving the completed installation. The executable observer passed against
the exact diagnostics installer and installed binary identities recorded above.
The preservation receipt confirms unchanged original data and installation,
restored registry/shortcuts/startup value and no leftover installation.

Preliminary review `CB-V5-INTEGRATION-R3-PRELIM-ASTRA-20261021T143258Z` found
no source defect, but withheld acceptance pending completed installed gates,
cleanup and final documentation. Its subsequent bounded assessment
`CB-V5-R5-REUSE-ASSESSMENT-ASTRA-20261021T143631Z` confirms R5 used the valid
equals-form executable argument, yet its reader/speed results belong to an
older installer. Changed diagnostic controls and artifact bytes prevent reuse
as current-installer acceptance. R13 therefore runs the existing generic native
scenario, four reader/speed arms with both exercise flags, before/after runtime
integrity and six installer lifecycle policies against the diagnostics installer.
It used the verified local test runtime without further acquisition; later
sections record repository checks, cleanup and exact-patch acceptance.

R13's installed integrity check passed in 222.57 seconds, but the generic native
smoke was incorrectly applied to the release-locked installer. Its unprofiled
`TtsProcessClient.start()` requires the development fake; release builds
deliberately configure that default as unavailable. The recorded lifecycle-probe
failure is therefore a test-configuration mismatch, not a product correction.
R13 restored all original state at 15:00:44 UTC. R15 reuses its verified local
test runtime for the four real-profile reader/speed arms, post-run integrity and
six installer policies. The separate R16 gate uses the unchanged stock
`pnpm run test:native-startup` command, which builds the default development
configuration with TTS environment overrides cleared. No assertion or release
guard is weakened, and no additional acquisition is required.

R15 passed both flagged Piper arms, then the Chatterbox ES seek observation
timed out after 90 seconds despite playing state, a cleared old highlight and
six subsequent transitions. Its marker remained `1:1:1:1:1`: the instrumentation
omits range-container identity, so distinct text nodes within one leaf can have
identical offsets. Investigate that collision with a real-DOM regression before
changing the harness. The bounded additional allowlist is
`apps/desktop/scripts/native-smoke/tts-scenarios.mjs` and
`apps/desktop/scripts/native-smoke.node-test.mjs`. Preserve all deadlines,
assertions and product code. R15 restored all user state at 15:15:08 UTC.

`v5-highlight-identity-red` reproduced the alias using real DOM ranges: two
distinct passages had key `1:0:1:0:1` (801 renderer tests passed; 83 Node tests
passed and the new regression failed). The harness now includes each endpoint's
structural path inside its semantic leaf. It does not read or report text, and
recreated nodes at the same structural positions retain the same identity.
The regression also checks that replay after node replacement remains stale.
After a formatting-only retry, `v5-highlight-identity-green-r2` passed formatting,
lint, 801 renderer and 84 Node tests at 15:20:36 UTC. All deadlines and existing
assertions remain unchanged. R17 repeats the four installed flagged arms,
beginning with Chatterbox, followed by integrity/lifecycle/restoration; R18 owns
the full repository, browser and stock development-native checks. B06/B07's
acquisition code and the installer bytes remain unchanged from the passing R12.

Review `CB-V5-INTEGRATION-R4-DELTA-ASTRA-20261021T154516Z` independently checked
the two harness corrections and found no defect. Its full before/after identity
check passed for 1,343 paths. R12 evidence is reusable specifically for B06/B07
acquisition, terminal cleanup/retry, cancellation, restart/discovery, removal,
reacquisition and uninstall: their complete inputs and installed artifact are
unchanged. The ordinary acquisition session does not import the changed
highlight observer. Narration, highlight and speed assertions instead consume
fresh R17 evidence. This phase-specific decision avoids repeating downloads;
it does not confer final acceptance while R17/R18, host cleanup and final
documentation remain outstanding.

R17's four installed arms passed with both reader-correction and playback-speed
exercise flags on the diagnostics installer. All six rates (100, 95, 90, 85, 80
and 75 percent) passed in every arm. Each recorded zero underruns, external
requests and generated audio files, with pause/resume, chapter/seek restart,
bounded cleanup and no stale playback. Measured values on this host:

| Installed arm | First audible (ms) | Cancellation (ms) | Seek restart (ms) | Chapter restart (ms) |
| --- | --- | --- | --- | --- |
| Chatterbox ES | 37,431 | 389 | 36,586 | 38,021 |
| Chatterbox EN | 35,740 | 303 | 34,820 | 36,527 |
| Piper ES | 5,677 | 231 | 5,665 | 6,027 |
| Piper EN | 5,537 | 288 | 5,645 | 5,729 |

These are host observations, not startup guarantees or fixed waits. The R17
post-playback installed integrity test passed in 146.23 seconds; enclosing
lifecycle and preservation evidence follows.

R17 completed with exit 0 at 15:50:56 UTC (ordinary host 15700; started
15:21:18 UTC). Its runner invokes the existing `native-startup-smoke.mjs`
with explicit installed `--executable`, `--adaptive-tts-exact-host`,
`--exercise-reader-corrections`, `--exercise-playback-speeds` and each exact
profile/language under the ordinary harness's hostile release environment.
It then runs `pnpm run test:chatterbox:installed-integrity` and
`pnpm run package:windows:lifecycle -Installer <diagnostics-installer>`.
The six uninstall policies pass: default preserve, Chatterbox only,
preferences only, both explicit, legacy both and invalid-value preservation.
Synthetic unrelated data is preserved in every policy. These local automated
results do not claim a new clean-machine or interactive public-release gate.

The executable observer passes for every observed installed process. Final
preservation receipts verify unchanged original data by aggregate SHA-256,
with installation, registry, shortcuts and startup value restored and no
leftover installation. The inventory and aggregate digest remain in the local
R15/R17 preservation receipts. R17 uses the verified local runtime without
downloads.
R18 and final host cleanup were separate requirements, completed below before
acceptance.

### Final combined repository gates

`v5-full-check-r18` passed on ordinary host 15700 from 15:51:44 to 15:56:56 UTC
on 2026-10-21, exit 0. It copied and hash-verified the complete current source
snapshot into the disposable checkout, then cleared development/model/Python
environment overrides before running these unchanged repository commands:

- `pnpm run check`: evidence checks, formatting, lint, types, tests and builds
  pass. Test results include 672 EPUB, 801 renderer, 84 desktop Node, 611 Python,
  and 110 default / 109 release-locked Rust passes (two explicit diagnostics
  remain ignored in each general Rust suite; installed integrity ran separately).
- `pnpm run test:browser`: all nine Chromium scenarios pass.
- `pnpm run test:native-startup`: the stock development build passes the complete
  WebView2 shell/protocol/fake-service, file-boundary, accessible reader,
  restoration and cleanup matrix with zero errors or external requests. Its
  isolated WebView profile does not replace the installed-artifact evidence.

The build reports its existing large JavaScript chunk warning; no check fails.
R18 establishes fresh current-input evidence for the corrected highlight test,
including its final formatting. Subsequent documentation-only edits are checked
again at the final review freeze. The production inventory and audit separately
passed in `v5-integration-r3-snapshot-audit` on the same day. Their seven
informational Rust notices and four direct-URL Python audit blind spots remain
disclosed; no advisory suppression or audit-policy weakening was added.

### Host cleanup

Two removal attempts (`v5-r10-firewall-remove` and `-r2`) exited 1 after
Windows closed UAC without elevation; they produced no removal receipt.
The third authorized attempt removed only
`VoxLeaf.B06B07.20261021.R10.Chatterbox` and
`VoxLeaf.B06B07.20261021.R10.InstalledPiper` at 16:02:38 UTC.
`v5-final-host-restoration` passed at 16:03:15 UTC on ordinary host 15700:
zero temporary rules/task processes/outstanding backup moves, original data
present and installation absent as initially. R12/R17 matched the original
fingerprint; the index was empty and `git diff --check` passed.
The historical cleanup blocker was resolved before final acceptance.

## Final acceptance and outcome

Independent review `CB-V5-INTEGRATION-R5-FINAL-ASTRA-20261021T160903Z` returned
**APPROVE**, with no actionable findings or remaining local acceptance gaps.
Its before/after check matched all 1,343 reviewed paths, statuses, SHA-256 and
filter-aware Git blobs. Manifest SHA-256 is
`f12467b7c15450a86bcd692b4f88969567dee0e1e55ef5346359edb6ef1753c0`;
diff SHA-256 is
`f5fe4c69034716038f5cc1514b2631d481ba2062374253cb8f42323967f1a14d`.
The immutable report and content-safe receipts are retained outside the repo
under `artifacts/b06b07-20261021` in the task's persistent evidence store.

The exact 48-path reviewed integration was staged with matching Git blobs,
rechecked and committed as `194846add1770388edb725425f1a5b685796de30`, then
pushed normally to PR #266. GitHub readback confirmed the same head. Fresh CI
for that commit passes all four jobs: Windows native foundation, Ubuntu
portable foundation, Ubuntu Rust foundation and production dependency graphs.
The successful runs are [Foundation checks 39632594632](https://github.com/mmjosedaniel/voxleaf/actions/runs/39632594632)
and [Release dependency audit 39632594985](https://github.com/mmjosedaniel/voxleaf/actions/runs/39632594985),
observed complete on 2026-10-21 after the push. The PR title and description
include the final reader, security-runtime, diagnostic and harness scope.

B06/B07 and the security refresh are complete within the authorized local and
portfolio boundary. All original user data and host configuration are restored;
no temporary firewall rules remain. The last download diagnostic stays in
process memory and writes only on manual export, as recorded separately in
ADR-0059. The two discovered harness defects have permanent regressions;
neither correction weakens product checks or acceptance deadlines. Earlier
failed attempts above remain historical evidence, not current failures or
substitutes for the successful exact-artifact gates.

This closeout changes documentation and plan navigation only. Final documentary
review and any later CI receipts are kept outside this completed historical
record. No installer publication or merge occurred.
