# Chatterbox certifi and Pillow security refresh

Created: 2026-10-20. Status: v5 published; production integration, installed
gates, repository/browser/native checks and final host restoration pass.
Independent acceptance and PR validation remain pending.

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
exclusion only for certifi and Pillow. Existing
commit/push/PR authorization applies to reviewed updates of PR #266; no merge,
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
5. **Independent review and PR update — in progress.** Complete required checks,
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
- The reviewed assembly contains 13,083 files, 5,027,548,189 installed runtime bytes and three
  archive parts totaling 5,031,103,825 bytes. No cross-environment reproducibility
  claim is made.

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
  Network-only comparisons across two connections returned six successful HEAD
  responses on one and one timeout/two successes on the other. The B06 retry
  was not started. These HEAD checks do not establish a full acquisition pass.
  All three temporary offline firewall rules were subsequently removed and
  their absence verified; `pnpm run check:evidence` and `git diff --check`
  passed on the ordinary host. Review continued before one final
  installed-acquisition retry without more HEAD probes.
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
  leftover installation. The user accepted removal of both temporary TTS
  firewall rules; removal succeeded at 01:25:13 UTC. No further download
  attempts are planned in this run. Final revision review uses the immutable
  `candidate-integration-r2` snapshot; its report is retained separately.

- Preparation review `CB-V5-PREP-R2-20261020-ASTRA-230616Z` approved the exact
  1,331-file snapshot and three-part artifact, with no findings. The preparation
  commit is `702f80b5b688193e10ef58f9a5cbebb3a42a4090`. This approval does not
  establish production admission or installed acceptance.
- Publication approval covered the three reviewed assets as the
  `chatterbox-runtime-v5` prerelease against that commit, preserving historical
  releases and excluding a public installer. The first SSH and HTTPS attempts
  failed before upload; a subsequent HTTPS push reached the exact commit.
- Integration may change only the versioned authority generator and its tests,
  release CLI/package scripts, native admission/removal and tests, production
  audit/inventory/license selectors and generators, release/installed harnesses
  and tests, Tauri/NSIS resources, current dependency/release/architecture docs,
  this plan/index and an additive ADR. Historical authority and completed plans
  remain immutable. Generate v5 acquisition files only from verified publication
  metadata; no invented publication timestamp or installed receipt is permitted.

- Prior local B01–B08 approval does not make the current live release audit pass.
- V3 lock changes alone would falsify installed remediation. V4 already exists
  for an independent local-only build and is not a free production identity.
- The shipped v3 adapter/runtime sources are frozen historical blobs. Avoid
  pulling current runtime refactors into this dependency-only update.
- Published assets and historical authorities remain immutable. Any successor
  adoption must include old-root cleanup tests, accurate bytes and fresh readback.

## Final validation results

Overall remediation is not complete. Baseline `pnpm run audit:release`: exit 1,
ordinary host identity 15700, 2026-10-20 22:00:37–22:01:08 UTC. Candidate portable
checks, 595 Python regressions, v3/v4 compatibility, v5 source authority,
candidate audit, real-library security probes, ES/EN and final full package
integrity now pass. Persistent Codex Security artifacts retain exact logs,
input hashes and host metadata under their job names above. Preparation review
and publication are complete; production audit and focused authority checks
pass. Full integrated, browser, native startup and adapted local packaging
checks, installed lifecycle/restoration and installed four-arm ES/EN pass;
complete acquisition and final independent review remain pending. The original
B01–B08 acceptance remains historical and
does not substitute for these successor-runtime gates.

The subsequent user-authorized [download diagnostics improvement](../completed/optional-download-diagnostics.md)
is complete and independently approved: one error in memory, manual JSON export
and an installed probe that observed 1,770,496 bytes before cancellation, with
verified user-state restoration. That bounded result does not complete B06/B07
or diagnose the earlier intermittent failure; this security-integration plan
remains open with the same complete-acquisition acceptance requirements.

## Resumed installed validation

B06/B07 validation resumed after the bounded diagnostics probe. `v5-installed-journey-r8` uses the independently
reviewed diagnostics installer, SHA-256
`c8580509978288d207d086c7a97e51899bf625747ffebe2fc4bc85a67e18ea30`,
with the existing full `package:windows:reader-corrections` command and explicit
external receipt. The three complete acquisitions remain required; the bounded
probe does not replace them. The ordinary-host preflight verified the candidate,
392 relevant source identities against the disposable execution copy, sufficient
disk space, an empty index and no conflicting application or recovery state.

Two task-specific outbound firewall rules isolate only the installed Piper and
Chatterbox executables. The preservation wrapper records the original data and
installation fingerprints, registry, shortcuts and startup value before the
journey and restores them in its finalization path. Fresh normal-host
`pnpm run inventory:release:check` and `pnpm run audit:release` passed in
`v5-b06b07-audit-r8`; the seven informational Rust notices and four Python URL
blind spots remain disclosed.

The ordinary-host R8 journey ran on 2026-10-21 from 03:34:21 to 03:55:10 UTC
and exited 1. Its failure receipt preserves passing B06/B07 assertions:
cleanup failure remained terminal, retry was admitted, verification cancellation
took 5 ms, cancellation preceded installation, staging was removed, and late
cancellation preserved the completed installation. Chatterbox ES and EN passed
offline, followed by restart/discovery and optional-package removal. The later
Piper ES arm failed before audible output with `tts-service-failed` and
`model-load-failed`. Piper EN and the third complete acquisition were not reached;
there is no successful receipt for the complete integrated journey.

The focused ordinary-host `v5-piper-r9` diagnostic exited 0 at 03:58:55 UTC.
It verified all 2,031 freshly installed resource hashes and generated synthetic
Piper audio in memory under both the minimal builder environment and the
ordinary installed-child environment. Direct model loading also passed. These
controls do not reproduce the failed native application path, so the cause of
the R8 failure remains unknown. No product source change followed this failure.

## Cleanup checkpoint

At the cleanup checkpoint, R8 and R9
preservation receipts verify unchanged original user data and installation
state, with registry, shortcuts and startup value restored. Both temporary
firewall rules were removed at 04:00:52 UTC. The normal-host
`v5-pause-r8-r9-safety` check exited 0 at 04:04:01 UTC: zero task firewall rules,
zero active task processes, no outstanding data/installation backup moves,
original data present, and the installation root absent as it was before the
tests. HEAD remains `702f80b5b688193e10ef58f9a5cbebb3a42a4090`, with an empty
index; no commits or pushes were made during this continuation. No R10 test was
started, and no download or test remains running.

Persistent local evidence is retained under `artifacts/b06b07-20261020`, including
the R8 failure/log and preservation receipts, R9 diagnostic/log and preservation
receipts, firewall removal receipt, and pause safety receipt. Resume first with
a focused installed native Piper reproduction without reacquiring Chatterbox.
Then resolve the demonstrated cause, complete the remaining integrated journey,
and obtain independent review of the exact final patch and evidence. This plan
remains open; the passing B06/B07 assertions do not establish full acceptance.

## Resumed native-path investigation

On 2026-10-21 the user resumed the task. Normal-host R10 preflight confirmed
the same installer and 392 execution-source identities. The isolated Piper
reproduction repeated the failure and restored all original user state. A
normal-host process-tree observation exposed a harness defect: the ordinary
journey passes `--executable <installed-path>`, while
`resolveNativeSmokeExecutable` recognizes only `--executable=<installed-path>`.
The native smoke process therefore launched the disposable repository binary.
The R8 Chatterbox narration results and R10 Piper failure do not establish
installed-executable acceptance. The acquisition corrections use the ordinary
session's explicit executable and retain their narrower B06/B07 observations.

Correct the parser to accept both explicit forms, rejecting missing, relative
or duplicate values instead of falling back. Add a host-run regression before
the fix, then repeat the focused installed Piper arm and the complete journey
with verified process identity. This changes the test harness only; the
reviewed installer and product runtime remain unchanged. Do not rebuild or
redownload a runtime to address this argument-selection defect.

`v5-native-path-red` reproduced the wrong fallback on the normal host (16 passes,
one expected failure). `v5-native-path-green` passed TypeScript formatting/lint
and the complete desktop suite after the parser correction. `v5-piper-r11`
then passed the focused installed Piper ES matrix at 14:25:50 UTC: first audible
output in 4,988 ms, cancellation in 230 ms, zero underruns, external requests
or persisted audio. The process observer verified the actual installed path
and SHA-256 `7734f9a955d7d8207d420487b9feed9bbdfa252f92d5898c367dbfc075ade5b4`.
The preservation receipt confirms unchanged original data/installation and
restored registry, shortcuts and startup value. The complete corrected journey
is recorded separately as `v5-installed-journey-r12`; its result and final
independent review remain required.

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
It uses the verified local test runtime without further acquisition. Final
host cleanup, repository/browser checks and exact-patch review remain pending.

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
post-playback installed integrity test passed in 146.23 seconds. Installer
lifecycle, final preservation and the enclosing job result are recorded below
when complete; individual passing arms do not imply those remaining gates passed.

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
preservation verifies unchanged original data by aggregate SHA-256 comparison,
with installation, registry, shortcuts and startup value restored and no
leftover installation. R17 uses the verified local runtime without downloads.
The R18 repository/browser/default-development-native suite runs separately;
firewall removal and final host-state verification remain required before
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

### Host-cleanup handoff

Both firewall-removal attempts on 2026-10-21 (`v5-r10-firewall-remove` and
`v5-r10-firewall-remove-r2`) exited 1 after Windows closed the UAC request
without elevation. No removal receipt was produced. The two exact test rules
`VoxLeaf.B06B07.20261021.R10.Chatterbox` and
`VoxLeaf.B06B07.20261021.R10.InstalledPiper` therefore remain pending removal.
Do not infer removal from the successful playback or user-data restoration.
No download, narration, lifecycle or repository test remains running.

Resume by launching the existing bounded removal helper when the user can
accept Windows UAC, then verify its receipt and run
`v5-final-host-restoration`. The prepared `v5-final-review-r19` requires both
R18 and that restoration gate to pass before checking the final documents and
capturing the acceptance snapshot. Final independent approval, authorized
commit/push, fresh PR #266 CI and completed-plan move remain outstanding.

The user returned and accepted the third UAC request. Removal succeeded at
16:02:38 UTC. `v5-final-host-restoration` then passed at 16:03:15 UTC on ordinary
host 15700: zero temporary rules, zero task processes, zero outstanding backup
moves, original data present and the installation absent as before. Both R12
and R17 preservation receipts match the unchanged original fingerprint. The
index is empty and `git diff --check` passes. The earlier UAC handoff is now
resolved; only final independent acceptance and the authorized Git/CI closeout
remain. No public installer was published and no merge is authorized.
