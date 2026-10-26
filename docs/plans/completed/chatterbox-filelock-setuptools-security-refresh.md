# Chatterbox v6 filelock and setuptools security refresh

## Goal

Prepare and validate an additive Chatterbox v6 runtime for PR #272, replacing
filelock 3.32.0 and setuptools 83.0.0 with patched 4.2.1 and 84.1.0. Complete
publication and runtime admission only after the user approves the exact
reviewed publication artifacts. Do not claim the production audit is repaired
while admitted v5 still fails it.

## User-visible outcome

After separately authorized publication and installed acceptance, an explicit
optional acquisition can select v6 with the existing local ES/EN inference,
cancellation, bounded buffering and memory-only audio behavior. Existing user
data and older packages are preserved until explicit guarded removal. During
preparation there is no change to the installed application or admission.

## Current state

Integration is committed at `9073ad4b1a54b9dc86e811526cbcdb6dea2ee56d` on
`codex/confirmed-logic-bugfixes`; the index is empty. Publication/integration
authorization persists. Native/installed inference and lifecycle gates passed;
full live acquisition failed twice. On 2026-10-25 the user explicitly requested
reuse-based acceptance without unjustified repeat downloads. Independent review
approved the revised coverage matrix below. Exact local artifact admission R18
passed, and `CB-V6-LOCAL-REPLAY-R18-RESULT-R1-ASTRA-20261026` approved functional
acceptance with no findings. This completed-plan documentary patch requires its
own exact final review before acceptance. The three reviewed
assets are now published as the non-latest `chatterbox-runtime-v6` prerelease
(release ID `422467861`, published `2026-10-24T21:32:28Z`). GitHub confirms all
sizes and SHA-256 digests. The v6 authority was generated from that actual public
readback and its check passed. No complete current-host live acquisition pass is
claimed by the revised integration boundary.

Historical preparation baseline: HEAD `4dab0baea2d462e1b7b84206f7a5f39517f4cdcc` on
`codex/confirmed-logic-bugfixes`; clean index/worktree at entry. The user
authorized preparing v6 in this PR on 2026-10-23; publication authorization was
then deferred until artifacts were concrete and reviewed. Existing PR commit/push
authorization persists; no merge or new public VoxLeaf installer is authorized.

At that baseline, the production audit passed Node, Rust, base Python and Piper
but failed the frozen v5 lock for filelock CVE-2026-112940 and setuptools
GHSA-xmj3-9gf7-h52w. These are package-level findings, not proof that VoxLeaf
exposes the vulnerable APIs. Filelock's advisory concerns POSIX SQLite locks;
setuptools concerns namespace metadata in legacy Windows wheel installation.
The prior CLB plan and v5 acceptance are immutable historical evidence. The
integrated v6 selector's local and hosted production audits pass. Ubuntu
portable/Rust and Windows CI passed on the integration head.

## Scope and non-goals

Change exactly the two affected package pins; preserve the other 77 packages,
Torch/CUDA, six model identities, frozen v3 service modules, languages and
protocol. Add version-specific recipe/lock, builder dispatch, tests, security
probes and preparation commands. Preserve v2/v3/v4/v5 manifests, locks,
published artifacts and generator output. V4 remains local/unadmitted.

No advisory suppression, automatic acquisition/migration, model replacement,
Qwen inference, broad dependency refresh or unrelated refactor. One source
writer; independent investigator and bypass reviewer are read-only. The
repository's change_reviewer provides a distinct acceptance gate.

## Relevant files and documentation

- `.agents/PLANS.md`, `AGENTS.md`, repository investigate-bug skill and Codex Security fix-finding skill.
- `docs/architecture/decisions/ADR-0058-admit-certifi-pillow-chatterbox-v5.md`, release/dependency/testing documentation and canonical system diagram.
- `services/tts/src/voxleaf_tts/release_chatterbox.py` and `packaging/chatterbox_{integrity,authority,sources,security_authority}.py`.
- `services/tts/release/profiles/chatterbox-v5/` and new `chatterbox-v6/`; optional source/publication/runtime authority under `services/tts/release/optional/chatterbox/`.
- `services/tts/tests/test_chatterbox_security_refresh.py`, release tests, `scripts/test-chatterbox-runtime-{security,smoke}.py`, dependency-security probe and `package.json`.
- Post-publication integration: native optional-runtime admission/cleanup, release resources/disclosures, audit/inventory selectors and existing installed harnesses. Freeze that exact allowlist before integration.

## Architecture and constraints

Use the existing exact hashed-lock builder and frozen raw-Git service closure.
V6 must reject `--no-sync` before source/output access, remain unpublished and
unadmitted during preparation, and reject acquisition/reconciliation commands
until its distinct published authority exists. Never silently fall through to
v2/v5 authority. Models remain local; probes use synthetic text and ephemeral
PCM. Use isolated build/probe environments, never modify an installed runtime.

Retain content-safe technical evidence only. Plugin-produced probe artifacts
use its managed temporary/persistent storage. Source, plan and configuration
remain repository files; logs and host details are not committed. Check the
system diagram; preparation changes no runtime topology.

## Milestones

1. Diagnosis and patch boundary — complete. Reconfirm advisories, independent
   read-only investigation, immutable baseline and smallest additive design.
2. Candidate graph and package — complete. Add failing regressions, implement
   v6 preparation, generate hashes, audit the candidate, build and verify its
   full runtime closure. Keep prior versions byte-identical.
3. Security and legitimate controls — complete. Exercise real dependency
   boundaries, alternate unsafe input, benign controls, offline ES/EN and
   cancellation with the assembled package. Run focused then repository checks.
4. Reviewed publication preparation — complete. R2 approved the final
   documentary patch, committed as `e46eb99c542b27a891aae6ee20d68c525d79f5f1`.
   The user explicitly authorized the three reviewed prerelease assets and
   subsequent integration/local validation, preserving user data and old versions.
5. Publication and production integration — complete under the explicitly revised
   acceptance boundary. Published authority, exact local artifact admission,
   native/installed runtime, retained-only cleanup and lifecycle gates passed.
6. Closeout — revised functional criteria approved; plan archived and maintained
   indexes reconciled in this documentary patch. Production audit, implementation
   CI and host restoration passed. Final exact-patch review is a separate gate
   on this closeout; its verdict does not imply complete live-download success.

## Testing and benchmark strategy

Integration write allowlist (frozen before implementation):

- `services/tts/src/voxleaf_tts/packaging/chatterbox_v6_authority.py` (new additive authority), `services/tts/src/voxleaf_tts/release_chatterbox.py`.
- `services/tts/tests/test_chatterbox_v6_authority.py` (new), `test_chatterbox_v6_preparation.py`, `test_release_dependency_graphs.py` in the same tests directory.
- Generated `services/tts/release/optional/chatterbox/{publication,optional-package-manifest,runtime-package-evidence}-v6.json`; `services/tts/release/audit-policy.json`, generated `component-inventory-v1.json` and `python-license-evidence.json`.
- `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, its `tts_optional_chatterbox/tests.rs`, `tauri.release.conf.json`, `windows/nsis-hooks.nsh`.
- `apps/desktop/scripts/windows-release.mjs`, `windows-release.node-test.mjs`, `ordinary-chatterbox-release-host.mjs`, `ordinary-chatterbox-release-host.node-test.mjs`, `optional-download-probe.mjs`.
- `scripts/release_inventory.py`, `scripts/test-windows-package-lifecycle.ps1`, `package.json`, `.github/dependabot.yml`.
- Maintained dependency/testing/setup/release/service-organization documentation, architecture overview/system diagram/support matrix, new ADR and index, this plan and its companion evidence. Historical authorities/plans/reports remain unchanged.
- Documentation expansion after inspection: `docs/README.md`, `docs/product/{mvp,project-brief}.md`, `docs/user/windows-release.md` and the active-plan index. These maintained entry points still selected v5, and the bundled user guide disclosed v5 byte totals. Update them for the v6 candidate without claiming installed acceptance; rebuild the installer after the guide changes.

Add current-selector and retained-v5 regressions first, then require red results
against the pre-integration source. Preserve full publication readback privately;
the generator may retain only public verified metadata. Commit/publication
authorization does not permit weakening failed checks or deleting older data.

All validation runs in local PowerShell outside the managed sandbox. Existing
commands: `pnpm.cmd test:python`, `format:check:python`, `lint:python`,
`typecheck:python`, `build:python`, `check:portable`, `check:evidence`,
`audit:release`; v3/v4/v5 source checks, v3/v5 acquisition checks, v5 local check;
`test:chatterbox:runtime-security`, `test:chatterbox:runtime-smoke` and
`test:chatterbox:dependency-security` with the isolated runtime on process PATH.
Add explicit v6 lock/source/build/local/audit/probe commands before execution.

First demonstrate absent v6 support and required synchronization/authority
guards with failing tests. Then verify exact two-pin delta and hashes, frozen
versions, malformed source/lock rejection, CLI/API guards and generated package
integrity. Run candidate audit with four existing URL/CUDA blind spots clearly
reported. Dependency probes must demonstrate the corrected behavior plus
legitimate controls; do not substitute text inspection for feasible execution.
Document any platform-specific proof gap.

The original post-publication strategy ran `pnpm.cmd check`, `test:browser`,
`test:native-startup`, `test:tts:reader-corrections-host`,
`package:windows:verified-core`, `package:windows:check`, installed integrity
and lifecycle checks successfully. `package:windows:reader-corrections` failed
twice during live download. Those failures remain recorded below. The following
user-authorized revision supersedes the requirement to pass that entire live
journey merely to accept this dependency refresh.

### Revised acceptance and evidence reuse — 2026-10-25

`CB-V6-RISK-BASED-REUSE-PLAN-R1-ASTRA-20261025` approves this strategy, subject
to one reviewed offline replay and final acceptance. It does not relabel v5
results or failed v6 attempts as current passing live downloads.

| Responsibility | Evidence to retain or reuse | Remaining work |
| --- | --- | --- |
| V5 ordinary acquisition/recovery | Actual historical 17-step journey and B06/B07 receipts; behavioral history only. Tokio, installer and authority differ from the current candidate. | No wholesale v5 transport/performance gate reuse. |
| Current transport | R16/R17 bounded transfers through current code; real timeout and cleanup tests in current Rust suite. | No further body transfer for this acceptance; live-delivery reliability remains unresolved. |
| Published runtime identity | Exact GitHub release metadata/digests, ordered three-part archive and local-build member verification. | Reverify the local artifacts supplied to replay with the checked-in authority. |
| Six models and frozen modules | Identity-matched local bytes; artifact reuse rather than reuse of historical measurements. | Verify all supplied model copies by complete size/hash. |
| Exact v6 native admission | Synthetic current tests and R12 installed-tree integrity do not alone prove Rust handled the exact archive. | One offline `download_at` replay through actual verification, reassembly, extraction and promotion. |
| B06/B07 cancellation/recovery | Current host `test:rust`, both default and `release-locked-runtime`: `b06_cancellation_accepted_during_final_hashing_prevents_promotion`, `b06_cancellation_and_commit_have_one_winner`, `b06_cancel_does_not_wait_for_installed_runtime_lock`, `b07_cancelled_worker_settles_even_when_staging_cleanup_fails` and cleanup/reselection guards. | Reuse matching passing inputs; no second full-payload cancellation replay. |
| Retained-v5 ownership | Current observation/cancellation, dangling-link, containment and removal regressions. | Add retained-v5 and unrelated sentinels to the one replay. |
| Native/installed inference and playback | R12 four bilingual arms, before/after integrity, cancellation/privacy/memory checks and exact environment/executable identities. | Reuse independently approved R12 gates. |
| NSIS/lifecycle | Repaired R6 lifecycle and scoped byte-identical candidate-uninstaller interactive reuse. | No installation/uninstallation cycle for an isolated replay. |
| Foundation/browser/audit/CI | Passing current-source host gates and implementation-head CI. | Final documentation checks and independent exact-patch review. |

The private ignored replay uses an exact copy of the 797 current execution
inputs and the existing Cargo test entrypoint with `release-locked-runtime`.
It retains the unmodified checked-in authority. Its existing test-only download
hook supplies the three exact local parts and six models into a fresh owned
scratch root, explicitly invoking unchanged `verify_downloaded_artifact` for
each copy. Unknown/duplicate/missing requests fail closed; an exhausted hook
must not fall through to HTTP. Production `download_at` then performs archive
verification, extraction, model placement, full runtime verification, promotion
and cleanup. Assert nine verified artifacts, Installed state, absent staging,
preserved retained-v5/unrelated sentinels, fresh-manager rediscovery, successful
explicit owned removal and preserved unrelated sentinels.

No production code, network policy, user installation or original model file
is modified. The reviewed helper bounds execution to 20 minutes, retains typed
progress and exit status, verifies process closure before scratch cleanup, and
rechecks primary source identities. Ordinary host readiness found 126.68 GiB
free and the required local parts/models present. This is local artifact
admission evidence, not a complete live acquisition or an offline-inference test.
Keep the installed read-timeout cause and live-delivery limitations explicit.

## Risks and rollback

Filelock crosses a major version; preserve its actual local caller behavior
through imports and ES/EN inference. Setuptools legacy APIs may be removed or
reject more inputs; verify the benign control using the real corrected library.
Fresh synchronization and exact runtime manifests prevent relabeling old bytes.
Do not delete previous releases or user data. Failed candidates stay unadmitted;
rollback means abandoning their unpublished outputs, not reverting v5 history.
Any cleanup must verify exact owned absolute roots first.

## Progress log

Earlier progress and validation entries below are chronological snapshots. Their
pending/blocked labels describe the state then; the revised closeout below is
the current acceptance boundary and preserves every historical failed result.

- 2026-10-23: User approved v6 preparation in PR #272. Baseline clean; published
  v5 remains active and audit-blocked. Started required independent investigation.
- 2026-10-23: Independent investigation confirms vulnerable distributions, not
  a demonstrated first-party exploit chain. Added ten preparation regressions:
  first run 10 failed / 98 passed; after implementation 108 passed. Updated the
  old invalid-version sentinel from 6 to 7 now that 6 has explicit support.
- 2026-10-23: Generated lock and source with configured v6 commands. V5 audit
  reproduced two vulnerable packages; v6 audit found zero in its 75 understood
  packages, with the same four URL/CUDA blind spots. Historical source and
  v3/v5 acquisition checks all pass; prior locks/manifests remain unchanged.
- 2026-10-23: Real setuptools baseline reproduced the unsafe outside-destination
  write in a disposable synthetic tree, with a passing legitimate control and
  no network requests. The v6 build environment rejected five invalid namespace
  forms and passed four legitimate wheel/exclusive/read-write-lock controls.
- 2026-10-23: Bypass/regression reviewer found no concrete bypass or regression
  in the preparation candidate. Full `check:portable` passed: shared 209, EPUB
  674, desktop 818 Vitest + 97 Node, Python 629; quality and portable builds pass.
  One pytest cache-write warning and the existing Vite bundle-size warning are
  non-fatal. A test monkeypatch typing issue was fixed; mypy now passes all 175
  source files.
- 2026-10-23: The first full build failed canonical containment with a short
  Windows alias. A second invocation through pnpm doubled the extended path's
  prefix and failed before creating output. The unchanged configured builder
  invoked directly through `uv run` with an extended canonical path succeeded.
  No integrity check, dependency or system setting was changed to obtain pass.
- 2026-10-23: Exact assembled-runtime security checks passed: v6 rejected five
  namespace forms and passed four legitimate controls; prior certifi/Pillow
  probes passed 3 security cases / 2 controls; prior dependency probes passed
  7 cases. The six reused local model files match the frozen recipe by size and
  SHA-256. ES/EN speech and cancellation passed with zero socket attempts and
  zero audio files. Post-probe full archive/tree/parts verification passed,
  confirming the tested bytes match the publication candidate.
- 2026-10-23: Candidate privacy inspection found only expected public project
  ownership strings in the source recipe and MIT notice. Targeted home-path,
  internal-session/capture and credential patterns had zero matches. Logs and
  private host data stay outside Git.
- 2026-10-23: The security plugin retained the generated receipt and smaller
  evidence files. Importing the large release parts closed its transport; no
  persistent-copy success is claimed. Original parts remain in managed temporary
  storage and must be rehashed before any publication.
- 2026-10-23: Independent GPT-6 Astra high review
  `CB-V6-PREPARATION-R1-ASTRA-20261024T022023Z` returned **APPROVE for preparation
  only**, with no findings. The [immutable report](../evidence/chatterbox-v6-preparation/change-review-preparation-r1.md)
  preserves all 48 reviewed source identities and verified distributable hashes.
  Publication, admission, installed/native validation and the global release
  audit remain pending. Subsequent documentary decisions are recorded alongside
  that report; this plan remains active.
- 2026-10-23: R2 `CB-V6-PREPARATION-R2-ASTRA-20261024T022500Z` approved final
  preparation documentation. All 49 reviewed inputs and staged blobs matched;
  the 18-file preparation commit was pushed to the draft PR from local PowerShell.
  The user then authorized exact-asset publication and continued integration.
  All three local part hashes were reverified; an empty draft prerelease was
  created at the preparation commit and upload started. No public-release
  completion is claimed until exact GitHub readback succeeds.
- 2026-10-23: Integration regressions reproduced the old selection before
  implementation: Python 2 failed / 627 passed; Rust 3 failed / 114 passed
  with 2 ignored helpers; desktop 818 Vitest passed and the Node NSIS test
  rejected 7 owned roots where v6 requires 8. Added exact v6 publication
  validation, retained-v5 handling and consistent audit/resource selectors.
- 2026-10-24 UTC: `pnpm.cmd test:python` passed 645 tests. Initial lint/type
  checks exposed import ordering and a test import/export annotation issue;
  both were corrected and the unchanged commands passed. Python license
  capture from exact core/v6 interpreters changed only the two patched versions.
  Generated inventory and `inventory:release:check` passed. Full `audit:release`
  passed Node, Rust, base Python, Piper and v6, retaining seven Rust notices
  and four explicit URL/CUDA blind spots; only then was its audit date advanced.
- 2026-10-23 local / 2026-10-24 UTC: User requested a safe pause. Stopped only
  the task-owned GitHub upload process. Readback confirms release ID `422467861`
  remains a **draft prerelease with zero assets**, targeting preparation commit
  `e46eb99c542b27a891aae6ee20d68c525d79f5f1`; it is not published. Older releases,
  the current installation and user data are unchanged. No task upload, audit,
  build or test process remains active.
- Safe-pause integrity: license metadata inspection created two untracked
  bytecode caches in the isolated v6 tree and one in the local core build tree.
  Every manifest-listed file still matched its size/hash. Removed only those
  exact generated caches after containment checks. Full v6 `check-local` then
  passed with unchanged archive/part identities; the core's only extra file was
  removed after its complete manifest comparison found no missing/changed files.
  Earlier failed integrity checks remain recorded, not counted as passes.
- Resume from the 32 uncommitted integration paths with an empty index.
  Preparation is committed/pushed and approved; integration is not reviewed or
  accepted. The v6 publication/acquisition/runtime metadata files have not been
  generated because valid public readback does not yet exist. Native compilation
  and package checks depending on them are pending. Recheck artifact hashes and
  draft state, resume exact-asset upload, publish/read back, generate authority,
  and then complete fast, native, installed, lifecycle and independent gates.
  Fresh CI for the preparation commit passes all three foundation jobs but the
  release audit still selects historical v5 there and fails. The uncommitted
  production selector's local passing audit is not that hosted result.

## Discoveries and decisions

- 2026-10-24 resume: normal host identity returned Windows status 15700
  (unpackaged PowerShell). No VoxLeaf process was active; the original
  installation remains present. No installed validation has run on v6 yet.
- `package:piper-core:check`, TypeScript/Python formatting and evidence checks
  passed. Rust formatting first rejected a newly wrapped assertion; the
  configured formatter repaired it and the unchanged check passed. Python lint
  and type checks passed. Browser execution reports all 10 scenarios passing,
  including primary EPUB navigation and native-browser audio-context cleanup.
  Full logs are retained privately under the v6 integration evidence collection.
- Resumed privacy inspection covered all 32 changed/new integration files:
  zero targeted private-path, local-network or credential matches; no historical
  authority or completed plan changed. Corrected current dependency guidance
  that had mixed the v6 generator command with historical v5 filenames.
- GitHub readback confirms part 001 is uploaded with the approved size and
  digest. A connection timeout prevented the initial part-002 command from
  reaching upload; retry starts at that missing part without replacing part 001.
- Part 002 subsequently completed; part 003 is uploading. No draft publication
  or generated admission authority is inferred from an incomplete upload.
- All three uploads subsequently completed. Exact GitHub name/size/digest/state,
  release/tag/commit and prerelease readback passed before publication. Published
  at `2026-10-24T21:32:28Z`, with `--draft=false --prerelease --latest=false`.
  `package:chatterbox-optional:v6:write-acquisition --publication <readback>`
  and `:check-acquisition` both exited 0. Only the three reviewed runtime parts
  were published; no models or VoxLeaf installer were uploaded.
- The ordinary host token is not administrative. Windows reported cancellation
  of the requested elevation for three narrowly scoped temporary outbound
  Python blocks. No rule/monitor was created. Firewall-enforced installed
  offline validation is pending; unrelated foundation/package work can proceed.
- The configured Windows builder writes a tracked historical package receipt.
  Preserve its original bytes, retain the newly generated candidate receipt
  privately, and restore the original immediately after the build. Compare
  hashes and source identities; do not overwrite historical acceptance evidence.
- Public final-asset HEAD requests returned HTTP 200 and exact expected lengths
  for all three parts. The first integrated `pnpm.cmd check` passed quality,
  shared 209, EPUB 674 and desktop 818 Vitest cases, then failed one of 97 Node
  tests: a package-evidence assertion still expected the v5 download total.
  Corrected that assertion to the independently measured/published v6 total
  (8,240,302,391 bytes). Preserved the failed log/results/input identities as
  foundation R1 before repeating the unchanged complete command.
- Foundation R2: `pnpm.cmd check` exited 0 (shared 209, EPUB 674, desktop 818
  Vitest + 97 Node, Rust 117/116 with two ignored diagnostics in each mode,
  Python 645; quality and builds pass). V6/v5/v3 acquisition checks exited 0.
  Fresh post-publication `audit:release` exited 0 with unchanged explicit notices
  and blind spots. The Windows package command built an NSIS bundle but then
  failed loading `Microsoft.PowerShell.Security` for `Get-AuthenticodeSignature`:
  its Windows PowerShell child inherited incompatible PowerShell 7 module paths.
  Treat this as a failed packaging gate, preserve its log, set the child module
  path to the standard Windows PowerShell modules and rerun the same command.
- Packaging R3 passed the unchanged `package:windows:verified-core` command
  with the corrected Windows PowerShell module environment; `package:windows:check`
  also passed, runtime input identities matched, and the historical receipt was
  restored byte-for-byte. A subsequent guide-only edit replaces the temporary
  active-plan link with durable ADR-0062. Repackage that final guide before
  selecting an installer for installed validation; R3 is not the final artifact.
- Independent GPT-6 Astra high report
  `CB-V6-INTEGRATION-R1-ASTRA-20261024` is **BLOCKED**, with source identities
  unchanged before/after inspection. It confirms the available foundation,
  publication, audit and browser evidence but requires remaining installed gates.
  F1 identifies a retained-v5 dangling-link mismatch: discovery uses
  `symlink_metadata`, while removal's `Path::exists` can return success without
  removing the link. Added a real Windows junction / Unix symlink regression
  before changing production. The [immutable report](../evidence/chatterbox-v6-integration/change-review-integration-r1.md)
  is not approval for integration or Git actions.
- F1 host reproduction: `pnpm.cmd test:rust` exited 101, with 117 passed,
  one failed and two ignored in the first mode. The real dangling Windows
  junction remained present while removal returned `Ok(Absent)`. Corrected
  only retained-v5 removal to use the same presence semantics as discovery,
  require contained non-reparse identity and propagate deletion errors.
  After `format:rust`, the unchanged `test:rust` command exited 0: 118/117
  passed with two ignored helpers per mode. The fixture verifies the rejected
  link remains observable, an external marker survives, and retry succeeds
  after the synthetic link is repaired. The Unix variant uses an equivalent
  symlink; it has not been executed locally on this Windows host.
- The pre-F1 native startup command exited 0 and original user-data fingerprints
  matched after restoration; no VoxLeaf process remains from that run. This is
  a recorded earlier checkpoint, not validation of the subsequently changed
  native binary. Final native execution must use the corrected source.
- Post-F1 `pnpm.cmd check` exited 0 with 118/117 Rust tests (two ignored per
  mode); the other counts remain shared 209, EPUB 674, desktop 818 + 97 and
  Python 645. Package R4 then passed `package:windows:verified-core` and
  `package:windows:check`, with all 797 recorded source/guide inputs unchanged
  and the historical package receipt restored exactly. The unsigned installer
  is 203,962,549 bytes, SHA-256
  `34e90ffad5a1990807753f2f7b9eaa8db13584ab5a0854d36efa80a1e05b1f09`;
  its application is 11,946,496 bytes, SHA-256
  `1d85038c023e4756b0e48a76ceff84effa737fe94737b53dc9d83758089ee67c`.
  Immutable private copies are retained before any development rebuild. A fresh
  post-F1 native-startup run with original-data preservation is in progress.
- Independent [R2 report](../evidence/chatterbox-v6-integration/change-review-integration-r2.md),
  `CB-V6-INTEGRATION-R2-ASTRA-20261024`, closes F1 with no outstanding code
  finding and verifies all 79 reviewed identities, 797 package inputs and
  immutable R4 artifacts. Overall verdict remains **BLOCKED** for missing
  current native/installed/offline/lifecycle and integrated-head CI evidence.
  No final approval, commit or push follows from this intermediate report.
- Corrected-source `pnpm.cmd test:native-startup` subsequently exited 0. The
  host exercised mounted UI, bounded binary TTS, cancellation/crash recovery,
  local file replacement, exact/max-plus-one boundaries, accessible reader
  synchronization, and persisted synthetic position/preferences. It reported
  no external requests or runtime errors. The preservation wrapper completed
  with byte-for-byte original user-data restoration verified. Full logs and
  restoration identities are retained privately; this does not establish
  installed v6 inference or firewall-enforced offline acceptance.
- Started the independent R4 `package:windows:lifecycle -Installer <R4>` gate
  with the exact immutable installer above. Its wrapper protects the original
  installation, registry, shortcuts and user data. This gate does not require
  firewall changes and makes no inference/offline claim. Final result and
  restoration verification are pending; current interactive NSIS validation
  is a separate requirement.
- The R4 lifecycle attempt exited 1 at `windows-release-lifecycle-preexisting-install`
  before its scenarios. Original installation, registry, shortcuts and full
  user-data contents were restored and verified without errors. Two bounded,
  reversible diagnostics subsequently confirmed that the moved installation
  is absent in both parent PowerShell and its ordinary PowerShell/pnpm children,
  including after metadata isolation. Both restored the original state; neither
  ran an installer or changed model data. The transient detection is not yet
  explained and is not counted as a product regression or a passing gate.
- Renewed elevation succeeded. Readback now confirms the three exact temporary
  outbound Python blocks. Installed offline
  tests may proceed; retain the monitor until they finish, then verify removal.
- Retry the lifecycle using the exact PowerShell command configured by
  `package:windows:lifecycle`, invoked directly, with explicit path-absence
  assertions before execution and the same immutable R4 installer. Preserve
  the failed attempt; do not alter its pre-existing-install guard or claim
  success until execution and restoration both complete.
- The direct configured lifecycle command completed successfully against R4:
  installation, first start, repair and six silent option scenarios passed
  (default preservation, optional-only removal, preferences-only removal,
  both explicit, legacy both, invalid-value preservation). All eight optional
  roots and unrelated synthetic markers behaved as expected. Original
  installation and metadata restoration passed; final full user-data fingerprint
  verification is still running. Manual interactive and clean-host checks
  remain distinct; this execution does not establish either.
- R4 lifecycle restoration subsequently completed: overall exit 0, original
  installation/metadata restored, full user-data fingerprint unchanged, no
  restoration errors. Private immutable evidence is `lifecycle-r5.log` and its
  preservation receipt. The earlier pnpm-wrapped failure remains recorded.
- Started the remaining installed acceptance in one protected batch: verified
  v6 runtime/model fixture, installed integrity, ordinary preflight, native
  reader corrections, four installed bilingual reader/speed arms, and the
  configured acquisition/recovery journey. The original installation and data
  are preserved; exact R4 artifacts and temporary firewall readback are required.
  This batch is in progress, not yet passing. Interactive NSIS remains pending.
- That batch stopped before its first test at the private wrapper's
  `native-installed-binary-mismatch` assertion. Original installation, metadata
  and complete user-data contents were restored and verified; no installed
  acceptance is claimed. The R4 reference is the unpatched build binary, whose
  bundle token is `UNK`. Inspection of the exact [Tauri CLI 2.12.3 bundler](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.3/crates/tauri-bundler/src/bundle.rs)
  shows that NSIS replaces that token with `NSS`, then restores the build
  output. The repository already records build and installed binary identities
  separately; the private wrapper had incorrectly equated them.
- Correct the private comparison only: compute the expected full installed
  hash in memory from the pinned build binary and the unique documented token
  replacement. Expected NSIS SHA-256 is
  `ce180df5d00db29f1f3da7bf192c786c7cda4902305f6818f9917d24b426c9f4`.
  Require the actual installed size/hash to match exactly and preserve both
  identities. No executable or repository source is patched. The prepared
  synthetic v6 tree can be reused after fresh model and installed-integrity
  validation; this does not reuse a historical passing test. Retry remains
  pending until that exact comparison and all required gates finish.
- The retry confirmed the hypothesis with the actual installed binary: size
  11,946,496 and SHA-256
  `ce180df5d00db29f1f3da7bf192c786c7cda4902305f6818f9917d24b426c9f4`
  exactly match the in-memory NSIS expectation. There are no other byte
  differences, and the probe modified neither executable. R4's installer and
  build-output identities are unchanged. Installed-integrity testing has begun;
  the complete installed batch and restoration remain pending.
- In the current protected batch, installed integrity exited 0 (complete
  runtime/model verification), ordinary release preflight exited 0, and native
  startup exited 0. The native reader matrix has passed Piper ES/EN and
  Chatterbox ES; its remaining arm and subsequent installed gates are running.
- Prepared, but did not execute, the manual NSIS matrix. Independent helper
  review `CB-V6-MANUAL-NSIS-HELPER-R1-ASTRA-20261024` requested a process-tree
  closure barrier before cleanup/restoration (H1). Replaced that preparation
  with a one-shot human-run launcher using Windows PowerShell `Start-Process
  -Wait`, an identity-bound process-completion receipt, atomic revocation of
  unused launch gates, and fail-closed restoration in both wrappers. A local
  synthetic host diagnostic passed: child lifetime was awaited, revoked launch
  rejected, incomplete/wrong-identity completion blocked, and correct completion
  accepted. It touched no real installation or data. Fresh independent helper
  review remains required before human-operated interactive execution.
- The helper's R2 review found H2: cancellation before launch waited for a
  process receipt that could never exist. A synthetic execution of the actual
  flow first reproduced the timeout; R3 reads cancellation before that wait
  and passes the same regression, including launch revocation and restoration
  eligibility. No real installation or user data was touched by these probes.
  `CB-V6-MANUAL-NSIS-HELPER-R3-ASTRA-20261024` approves the exact helper after
  closing H1/H2, with no remaining helper findings. This is not global patch
  approval or proof of interactive NSIS execution; both remain pending.
- The native reader matrix subsequently completed all four Piper/Chatterbox
  ES/EN arms with exit 0. Installed Piper ES/EN also passed against the exact
  R4 NSIS binary. Installed Chatterbox arms, integrity after execution, the
  acquisition/recovery journey and final restoration verification are pending.
- Removed personal-availability details from this active execution log under
  the existing privacy-redaction authorization. The prior text is retained
  privately; technical commands, outcomes and acceptance criteria are unchanged.
- All four installed reader/speed arms subsequently exited 0 against R4:
  Piper ES/EN and Chatterbox ES/EN. Chatterbox cancellation measured 295/297 ms;
  each arm completed resource cleanup with no generated audio files or external
  requests. Integrity after playback and the acquisition/recovery journey are
  still pending. A fresh comparison of all 797 R4 source/guide inputs found
  zero hash mismatches; index remains empty. A targeted privacy scan of all 42
  changed/new files found no private paths, email addresses, credentials or
  local-data fingerprint fields.
- Installed integrity after playback exited 0. The subsequent acquisition
  journey passed cleanup-failure/retry handling, then failed during transfer
  with `verification-download-tts-optional-profile-download-failed`; the
  underlying transfer/integrity cause is not established. This failed attempt
  is retained separately. Original installation/metadata and full user-data
  restoration were verified with no restoration errors; overall batch exit 1.
- Retry only the unchanged configured acquisition/recovery command once with
  the same R4 installer. `CB-V6-JOURNEYONLY-HELPER-R8-ASTRA-20261024` approved
  the bounded private wrapper delta that skips already-passing native and
  lifecycle gates while retaining all preservation checks. The retry started
  only after the preceding process closed and restoration was verified.
- The bounded retry also failed with the same generic acquisition error before
  verification. The failed-receipt path did not capture the already-existing
  content-free native download diagnostic before closing its session. Add that
  read-only capture to the test runner's failure receipt, preserving the
  original error, acceptance checks and finally-based restoration. This changes
  no application binary, network policy, transfer limits or download behavior.
  Validate the runner and review this exact delta before a diagnostic rerun.
- The second failed journey's original data, installation and metadata were
  restored and verified without errors. Runner validation passed in local
  PowerShell: desktop 818 Vitest + 97 Node, TypeScript formatting and lint.
  `CB-V6-DIAGNOSTIC-CAPTURE-R1-ASTRA-20261025` approves only the observational
  delta and one diagnostic rerun with R4. The reviewer confirmed that removing
  this capture in memory reproduces the runner's prior exact hash. All actual
  application inputs remain unchanged, but the full 797-input manifest now
  differs at this test runner; do not claim full manifest equality. The new
  journey is in progress. Global review, acquisition acceptance and interactive
  NSIS remain pending.
- The diagnostic run again failed during acquisition. Its content-free native
  record identifies GitHub runtime artifact 2, HTTP 200 and expected content
  length 1,900,000,000, followed by an I/O error at the response-read stage after
  1,022,867,369 bytes and 572,286 ms; no OS error number was available. This is
  not a hash-verification failure. Fresh GitHub readback still matches all
  three approved asset sizes/digests. Do not repeat blind acquisition attempts
  or weaken integrity checks; retain this concrete transfer blocker. Original
  installation/metadata restoration completed; full data verification is still
  running before any further installer work.
- The diagnostic run's final full-data comparison passed; original installation
  and metadata are restored with no errors. Its overall exit remains 1 for the
  acquisition failure. The firewall monitor removed its three exact temporary
  rules, reported no cleanup errors, and independent readback confirmed their
  absence. Started the separately reviewed human-operated NSIS fixture only
  after that completed restoration; interactive results remain pending.
- Direct Computer Use observation of R4's Spanish optional-data page found a
  checked checkbox with empty title, explanation and label. Cancelled before
  uninstalling; this interactive attempt is not a pass. The launcher then
  failed to persist its process-completion receipt after `Start-Process -Wait`
  returned: its temporary filename exceeded the host's legacy path limit.
  Both wrappers failed closed and preserved the original backups. Independent
  recovery review `CB-V6-MANUAL-RECOVERY-R1-ASTRA-20261025` requires a separate,
  identity-bound recovery helper and fresh closure/backup verification; it
  does not permit fabricating the missing receipt or declaring restoration.
- Added a compiled NSIS regression with Tauri's actual hook-before-language
  ordering. Before the correction, desktop tests passed 818 Vitest cases but
  failed 1 of 98 Node cases: English resolved the Spanish title. The hook used
  language macros before `MUI_LANGUAGE` defined them. Binding its eight strings
  to the explicit English/Spanish language IDs makes all 818 + 98 cases pass
  in local PowerShell. This changes no removal policy. A rebuilt installer,
  direct visual verification and independent exact-patch review remain required.
- `CB-V6-MANUAL-RECOVERY-HELPER-R1-ASTRA-20261025` approved the separate
  recovery helper after its read-only host preflight. Recovery exited 0:
  original data, installation and metadata were restored and verified with no
  errors. The cancelled interactive attempt remains failed; its missing original
  receipt was not recreated. A revised launcher passes actual Windows
  PowerShell 5.1 read/write/rename probes at all four phase path lengths.
  The observed-fixture helpers attribute subsequent UI evidence to Computer Use.
- Final desktop regression rerun passes 818 Vitest + 98 Node cases; TypeScript
  format and lint pass. R5 `package:windows:verified-core` and
  `package:windows:check` exit 0, with the historical package receipt restored
  byte-for-byte. R5 installer SHA-256 is
  `b9069e837ba8198f9ac016b3668589fc1c444f33edef1d8cc3ee2a6c945cb440`.
  Its build binary differs from R4, so R4 installed-binary evidence is not
  silently relabeled as R5 acceptance. Direct installed identity and visual
  checks remain pending.
- The R5 installed identity was then verified before each of four actual
  interactive executions. Computer Use observed legible Spanish and English
  text, optional-data removal checked initially, and preferences unchecked
  initially. All four scenarios passed: backup retention, backup removal,
  current-package retention with preferences removal, and combined current/
  backup/preferences removal. Unrelated and external synthetic markers were
  preserved throughout. The full wrapper exited 0; original data, installation
  and metadata were restored and verified with no errors. The
  [NSIS follow-up](../evidence/chatterbox-v6-integration/nsis-language-follow-up.md)
  records the regression and exact artifact. Independent Astra review
  [CB-V6-NSIS-LANGUAGE-R1-ASTRA-20261025](../evidence/chatterbox-v6-integration/change-review-nsis-language-r1.md)
  approves the NSIS text correction, regression and follow-up documentation with
  no findings. This is scoped approval: acquisition acceptance, fresh PR CI and
  final integration approval remain pending. The plan stays active.

- Select v6 as a distinct additive identity. Preserve all existing generators'
  defaults and historical outputs. No new production admission before reviewed
  publication and verified metadata.
- The Tokio correction is already separately approved/committed. It is outside
  this candidate's dependency delta.
- The host has long Windows paths disabled. Use the canonical extended output
  path and direct configured builder invocation; the short alias was rejected
  by containment. System configuration and user-data locations are unchanged.

## Final validation results

### Revised closeout — 2026-10-25 local / 2026-10-26 UTC

The user explicitly requested reviewer-led reuse and only necessary validation.
`CB-V6-RISK-BASED-REUSE-PLAN-R1-ASTRA-20261025` approved the matrix above.
V5 full acquisition remains historical evidence, not a current-v6 pass. Unchanged
models and frozen modules are reused by exact identity. Current v6 publication,
security, B06/B07 regressions, native/installed ES/EN, integrity, cancellation,
Lifecycle and scoped interactive evidence are reused under their recorded
input/environment proofs. No new complete download, GPU run or installer cycle
was required. All 797 execution inputs remained unchanged.

The one missing archive-specific check ran in normal host PowerShell using an
isolated exact source copy and a private ignored test, approved by
`CB-V6-LOCAL-REPLAY-R18-R1-ASTRA-20261026`. It built with:

```powershell
cargo test --offline --manifest-path <isolated-copy>/apps/desktop/src-tauri/Cargo.toml --bin voxleaf-desktop --features release-locked-runtime --no-run --message-format=json
<discovered-test-executable> tts_optional_chatterbox::tests::optional_v6_exact_local_acquisition_replay --exact --ignored --nocapture --test-threads=1
```

Build, test and wrapper exited 0: one passed, zero failed, 120 filtered in
750.98 seconds. The unchanged verifier checked all nine exact local artifacts;
current Rust code reassembled, extracted, verified and promoted v6. A fresh
manager in the same test process rediscovered it and full runtime/model
verification passed. Retained-v5 and unrelated sentinels survived acquisition;
explicit removal removed owned packages and preserved the unrelated sentinel.
The process closed, scratch cleanup passed, watchdog did not fire and source
drift was empty. Original user installation/data were untouched. HTTP was
replaced by a fail-closed local hook; this is not a live-delivery test or a new
installed-process restart. No package or model body was downloaded.

R18 state SHA-256: `7e833ff3cd97cf3579060aad7311e38a58a3b83e12dc225ef619d80070f08270`.
Stdout: `cc138c8096c82bd90f13eb7c4e7718bb158aed7bdd3c7f88b8771fd9acfa206d`.
Assertion receipt: `a4966a618a30acea8a6bad2534356b6d9f6eeb2d9c03bd93350fcbe9acb9c4ba`.
Fresh GitHub metadata readback matched all three published asset identities
without downloading their bodies; receipt
`f379fd538d0079e24e3b27378c81a7ed78f820c6014f5df6cc3953065fdf90d1`.
Private raw receipts and helpers are retained outside the repository.

`CB-V6-LOCAL-REPLAY-R18-RESULT-R1-ASTRA-20261026` independently approved the
revised functional acceptance with no findings. The exact documentary closeout
is submitted separately as `CB-V6-REUSE-CLOSEOUT-R1-ASTRA-20261026`; acceptance
of that patch depends on its actual verdict, not this planned report identifier.
The final host documentation gates `pnpm.cmd check:evidence` and
`git diff --check` both exited 0; their execution receipts accompany that review.

Implementation HEAD `9073ad4` has passing Foundation run `40238341429` and
production-audit run `40238341460`. Those runs apply to that implementation
commit, not to an unpushed documentation commit. The final documentation patch
is unstaged at this checkpoint; no merge or public installer is authorized.

**Known limitation:** R12/R13 remain failed full live acquisitions and their
read-timeout cause remains unknown. R16/R17 bounded success and R18 local
admission do not establish a full live-download pass or a transport fix. The
revised security-refresh integration closes with complementary exact-artifact,
recovery and runtime evidence; live-delivery reliability remains unresolved.

### Historical validation chronology

### Response-read diagnostic follow-up

The next investigation reproduced a diagnostic defect using a tiny loopback
HTTP response that sends one byte and then stalls. Reqwest wraps its timeout in
`io::Error`; traversing only `Error::source()` skips the wrapped reqwest error
and loses its typed timeout classification. The regression failed with `Io`
instead of `Timeout` (118 passed, 1 failed, 2 ignored), then passed after the
bounded walker inspected `io::Error::get_ref()` first. Local PowerShell
`pnpm.cmd test:rust` passes both configurations (119/118 passed, 2 ignored each).
Initial test-authoring compilation/header-capture errors were corrected before
the behavioral red result; they are not evidence of a product defect.
The first `pnpm.cmd check` then stopped at Clippy because the new loopback
fixture discarded a socket-read count. Asserting that at least one request
byte was read resolved that test-only warning; the full command was rerun
successfully. Its initial log is retained separately from the final pass.

This expands the integration allowlist to
`apps/desktop/src-tauri/src/tts_optional_chatterbox/download_diagnostic.rs`
and its existing tests. It preserves schema, privacy, transfer policy, memory
limits and integrity checks. It does not establish that the earlier live
transfer failed from timeout: that historical cause remains unknown. Build a
new exact candidate and capture its next failure classification before choosing
any transport correction. Acquisition, final candidate gates, CI and final
independent approval remain pending.

Independent review `CB-V6-DOWNLOAD-DIAGNOSTIC-R1-ASTRA-20261025` approved
the diagnostic correction, regression and documentary delta with no findings.
Fresh local PowerShell `pnpm.cmd check` passed shared 209, EPUB 674, desktop
818 + 98, Rust 119/118 (two ignored in each configuration), Python 645, and
format/lint/types/build. `pnpm.cmd test:browser` passed all ten scenarios;
`pnpm.cmd audit:release` passed with the existing seven Rust notices and four
explicit Python blind spots. A targeted privacy scan of all 45 changed/new
files found no matching private host paths, local-data fingerprints or
credential patterns. The index remains empty.

R6 `package:windows:verified-core` and `package:windows:check` exited 0;
the historical package receipt was restored byte-for-byte. The installer is
203,949,336 bytes, SHA-256
`e7afec29fd561912a9155c9f7bc4070f6ac7833175f7f6cd7b91097163fdf6d7`.
`CB-V6-INSTALLED-HELPERS-R10-ASTRA-20261025` approved one preserved
acceptance execution with this artifact and the identity-bound helpers.
The three interpreter-only firewall rules were activated and independently
read back. Native/installed/acquisition checks are now in progress; no result
or restoration is inferred before their final receipts. The remote PR still
targets the preparation commit and its previous v5 audit failure; no new push
or CI acceptance has occurred.

R10 observed the exact installed R6 binary identity and passed installed
integrity-before, ordinary preflight and native startup. Reader correction
matrices remain in progress. Its uninstaller SHA-256 equals the four observed
R5 executables:
`31b208eff8050cb33340175ad1046b45063818da1976c1503174df52af7c8fc3`.
`CB-V6-NSIS-EVIDENCE-REUSE-R1-ASTRA-20261025` explicitly approves reuse of
those historical UI/default-checkbox/synthetic-marker observations only.
Both 797-input manifests differ solely at the Rust diagnostic and tests;
NSIS inputs, normal installation roots and metadata destinations match.
This does not claim a new interactive execution or identity of the complete
installer/generated template/toolchain. Application, acquisition, installation
and restoration evidence is not reused. A fresh R6 Lifecycle execution is
approved only after Acceptance closes and restoration is verified.

The complete native reader matrix subsequently passed all four arms, with
cancellation at 238–411 ms, no external requests or generated audio files,
and all audio contexts/retained units released. Installed R6 Piper ES/EN and
Chatterbox ES also passed. Execution was then paused: the installed English
Chatterbox scenario was deliberately interrupted by a normal application close
during its 75% Pause/ended case. Its exit 1 is an interruption, not a new product
regression or passing acceptance result. Integrity-after and acquisition were
not started. The preservation helpers restored the original installation and
data, and the final fingerprint comparison confirmed unchanged data, restored
installation and no restoration errors. The outer execution closed with exit 1
solely for the deliberately interrupted English scenario. All three
temporary firewall rules were removed with no cleanup errors and their absence
was independently verified. No Lifecycle run, commit or push followed the pause.
The PR description was updated to distinguish the published runtime from the
still-local integration work and the remote head's existing v5 audit failure.
The plan remained active at this safe pause checkpoint; the new documentary
updates, remaining installed checks, acquisition diagnosis, Lifecycle, fresh CI
and final integration review await resumption.

Execution resumed on 2026-10-25. A fresh normal-host comparison found all 797
R6 inputs unchanged, the exact installer intact and no active test processes.
`CB-V6-RESUME-HELPERS-R11-ASTRA-20261025` found no helper defect but blocked
reuse of the completed R10 runtime gates: their execution-time tool/environment
and rebuilt-native-binary identities were not fully captured. Those historical
passes remain historical. Restore the full native/installed gate selection and
capture contemporaneous identities before and after each gate in R12; do not
reconstruct missing R10 evidence. The first elevation request did not activate
the firewall monitor; readback confirmed zero temporary rules. Lifecycle can
proceed independently using its previously reviewed R6 artifact and preservation
wrapper. The remote PR still points to the preparation commit with its v5 audit
failure; there is no fresh integrated CI result yet.

The fresh Lifecycle execution failed during synthetic-data cleanup: a WebView2
temporary file still held a Windows sharing lock after the application process
closed. Cleanup and quarantine failed, so the harness preserved the original
backup and reported failed data restoration. Its outer wrapper restored the
original installation and metadata; this is not a passing Lifecycle result.
After the remaining WebView2 processes exited, a read-only full comparison
confirmed the backup matched the original data. Independent review
`CB-V6-LIFECYCLE-R6-RECOVERY-R1-ASTRA-20261025` approved a separate recovery
helper with no deletions. Recovery exited 0: the synthetic remainder was retained
in quarantine, the original directory was renamed back, and complete original
data and installed-file comparisons passed. Failed receipts remain unchanged.

Extend the bounded integration scope to `scripts/windows-package-lifecycle-data.ps1`
and its existing desktop Node tests for this observed harness defect. Reproduce
an actual Windows sharing lock before changing cleanup. Allow only a bounded
wait for a transient sharing/lock violation on the already-owned synthetic root;
retain immediate failure for other errors and the existing quarantine/backup
preservation when cleanup cannot finish. Do not terminate unrelated processes,
expand deletion ownership, or change product acquisition/recovery policy.
The initial new regression had a test-only cleanup error from disposing its
release event too early; correct that fixture before recording behavioral red.

The corrected regression reproduced the actual sharing violation: desktop
818 Vitest cases passed and Node reported 98 passed / 1 failed. Cleanup now
waits at most ten seconds for typed Windows sharing/lock errors (32/33), retaining
containment checks and checking reparse points on every attempt. A transient real file handle now
passes; an additional persistent-handle case verifies bounded failure and
original-data preservation. Final desktop validation passes 818 Vitest + 100
Node cases; TypeScript formatting and lint also pass. Only the lifecycle helper
and its Node tests differ from the 797 R6 package inputs; they are test tooling,
not bundled application resources. Independent review and a fresh actual
Lifecycle execution remain required before acceptance.

`CB-V6-LIFECYCLE-HANDLE-REPAIR-R1-ASTRA-20261025` approves the bounded
cleanup patch, its regressions and documentation, and verifies that the exact
R6 prepared artifact remains valid. It approves one fresh Lifecycle followed by
the full R12 Acceptance sequence only after restoration closes. The repaired
Lifecycle then exited 0: installation, first start, repair, its following default
uninstall and all six retention/removal scenarios passed; unrelated synthetic data was preserved.
The outer full-data comparison and installation/metadata restoration passed with
no errors. This is fresh automated Lifecycle evidence; the separately approved
historical interactive UI reuse remains explicitly separate.

Fresh `pnpm.cmd check` exited 0 with shared 209, EPUB 674, desktop 818 + 100,
Rust 119/118 (two ignored per configuration), Python 645 and all quality/build
checks. `pnpm.cmd test:browser` passed ten scenarios and `pnpm.cmd audit:release`
exited 0 with the seven existing Rust notices and four explicit Python blind
spots. All 797 current source-input identities still matched after the check.
The full R12 native/installed/acquisition execution is now running against R6,
with before/after environment and executable identities captured for each inner
gate. Results, final restoration, fresh integrated CI and global review remain
pending; no acceptance is inferred from an active process.

R12 subsequently passed installed integrity-before, ordinary preflight, native
startup and the complete four-arm native reader matrix. Native cancellation
measured 248/452 ms for Piper ES/EN and 295/294 ms for Chatterbox ES/EN. Every
arm reported zero external requests, generated-audio files, retained units and
discarded units after cleanup, with all created audio contexts closed. The
separate installed-executable matrix is running; integrity-after, acquisition
and final restoration still await their own receipts.

Both installed Piper arms subsequently exited 0. Their actual speed matrices,
Pause/ended at 100% and 75%, navigation and cleanup passed with zero external
requests or generated-audio files. All six audio contexts closed in each arm.
The installed Chatterbox arms remain pending. A host privacy preflight over
current diff additions and all ten untracked files found no personal host paths
or credential-pattern matches; its seven generic path matches were NSIS
`$LOCALAPPDATA` variables. This targeted scan supplements final manual review.

The installed Chatterbox ES/EN arms then both exited 0. R12's full installed
matrix is now complete, with cancellation at 675/563 ms for Piper ES/EN and
300/297 ms for Chatterbox ES/EN. Each arm passed both Pause/ended rates and
all six playback speeds, reported zero external requests and audio files,
released retained/discarded units and closed every created audio context.
All 797 source identities still matched at installed-matrix completion.
Integrity-after is running; acquisition and outer restoration remain pending.

R12 integrity-after exited 0. The following full acquisition reached the real
cleanup-failure/retry scenario, then failed while downloading for verification
cancellation. The corrected diagnostic reports `stage=read`, `kind=timeout`,
GitHub runtime artifact 1, HTTP 200, expected/content length 1,900,000,000 bytes,
received 78,836,178 bytes and elapsed 50,244 ms; no numeric OS error is exposed.
This is fresh timeout evidence, not an integrity or installed-inference failure.
Inspection of the pinned reqwest 0.13.5 blocking implementation confirms a
30-second timeout per read; it does not identify the underlying source of the
transfer stall. Do not increase timeouts, add automatic retries or resume,
weaken hashes, or infer a particular network cause from this report.
The acquisition cleaned its staging paths. The complete outer run exited 1
for acquisition only; final original-data comparison and installation/metadata
restoration passed with no restoration errors. Preserve all failed receipts.
Request independent assessment of R12 gate evidence and exact-artifact reuse
before one separate explicit `JourneyOnly` retry with the same full corrections.
Native/installed results are completed gates, not a passing acquisition or CI.

`CB-V6-R12-GATE-REUSE-JOURNEY-RETRY-R1-ASTRA-20261025` approved reuse of
the nine completed R12 gates after checking all 85 review paths, 797 execution
inputs, 18 environment snapshots and exact executable identities. It approved
one explicit full `JourneyOnly` retry after a bounded network observation:
HTTP 206 delivered 134,217,728 bytes of the same first part in 38.394213 seconds.
This observation used curl with no proxy and discarded the response body; it
was connectivity evidence, not application acceptance or package verification.

The approved retry also failed: `read` / `timeout`, runtime artifact 1,
HTTP 200, expected/content length 1,900,000,000 bytes, received 30,962,525 bytes
and elapsed 46,767 ms. No further acquisition retry is scheduled. The run closed
with exit 1; full original-data and installation/metadata restoration passed
without errors. The three temporary firewall rules were removed, their absence
was independently verified, and the monitor exited. A separate bounded curl
HTTP 200 observation received 170,180,169 bytes before its intentional 90-second
deadline (exit 28); it was neither a complete download nor an application pass.
The range/full-response comparison does not identify the cause of the installed
client's stalls. Preserve both failures and all successful independent gates.

Revised execution order: finish privacy/exact-patch review and the authorized
draft-PR CI handoff independently, keeping acquisition and global acceptance
explicitly pending. Continue diagnosis only with a bounded, discriminating
experiment; do not repeat full acquisition or change transport policy merely
to obtain a passing result. Moving this plan to completed remains prohibited
until the missing acquisition/recovery and final acceptance criteria pass.

Draft handoff review `CB-V6-DRAFT-CI-HANDOFF-R2-ASTRA-20261025` approved
the exact incomplete candidate without waiving acquisition/global acceptance.
Commit `9073ad4b1a54b9dc86e811526cbcdb6dea2ee56d` was pushed normally to
PR #272; fresh Windows, Ubuntu portable, Ubuntu Rust and production-audit CI
started on that head. The PR remains a draft. Staged evidence and whitespace
checks passed after retaining immutable originals and removing only redundant
final blank lines from two public report copies.

Next diagnostic is limited to one isolated copy of the current source inputs:
invoke the unchanged `download_artifact` with its pinned client and public v6
part 001 from a test process, record only typed diagnostics and bounded progress,
and cancel after 128 MiB plus at most one copy buffer. An external watchdog must
terminate the owned test process at 120 seconds and verify its exit before
removing its owned partial file. No installer, inference, user-data access,
production timeout/retry/resume change or full acquisition retry is included.
Compile/run the filtered diagnostic through the existing Cargo test entrypoint
in that private copy, using normal host PowerShell. Review exact helper/input
identities before execution. A successful small transfer narrows hypotheses;
it cannot establish an installed-context defect or package acceptance.

The bounded R14 transport probe built and recorded its outcome successfully,
but the transfer failed before HTTP: request/connection, OS 11001
(`HostNotFound`), zero bytes, 11,077 ms. The process closed, its owned partial
was absent and all 797 primary inputs remained unchanged. This differs from
the two installed response-read timeouts. A later .NET observation resolved
all three allowed public hosts; it cannot establish contemporaneous Rust DNS
behavior or identify the failed redirect host. No production defect or fix is
inferred. The immutable R14 receipts remain private.

Independent read-only analysis recommends one DNS-only Rust experiment before
another body transfer. In a private exact-source copy, use the pinned resolver's
same `ToSocketAddrs` operation once for each of the three allowed hosts. Retain
only fixed host labels, address-family counts, timings and typed/numeric errors;
no addresses or error strings. Use the reviewed external watchdog and closure
checks, with no network-setting changes. No full acquisition retry is included.
Only a successful DNS observation can justify proposing one separately reviewed
bounded response-read experiment; it is not package acceptance.

R15 completed under `CB-V6-DNS-PROBE-R15-R1-ASTRA-20261025`: all three Rust
lookups succeeded without errors, at 27/0/0 ms. The process closed with no
cleanup errors or source drift. This does not reproduce the earlier DNS failure
or explain the read stalls. Fresh CI is now entirely successful on `9073ad4`:
Windows native, Ubuntu portable, Ubuntu Rust and production dependency graphs.

Revised R16 diagnostic: one bounded 128 MiB transfer through unchanged
`download_artifact`, with the same three count-only Rust DNS observations before
and after in that process. R15's success justifies trying to reach the body-read
stage that R14 never reached. Keep the existing 120-second external watchdog,
byte cap, typed progress/diagnostics and owned-file cleanup. Any result ends this
experiment; it neither authorizes repeated attempts nor establishes acquisition.
Review the exact private helper/probe before its single host execution.

R16 ended at its intended limit: 134,233,617 bytes in 18,770 ms, no download
diagnostic and successful DNS observations before/after. Closure, owned-partial
removal and all source identities passed. This exceeds both failed byte positions
but does not test their observed transfer duration. Independent analysis does
not approve renewing full acquisition merely from this successful small probe.

Final bounded diagnostic R17 asks whether the unchanged native-client path
reproduces a read stall over the duration of the installed failures. Cancel on
progress after 90 seconds or 512 MiB, whichever occurs first; retain the external
120-second watchdog for a blocked read or resolver. Add maximum time between
progress callbacks, explicitly including read/write/callback work, without
throttling or sleeps. Preserve typed failures and cleanup. If the byte cap comes
first, any longer duration remains untested; do not increase the cap or repeat.
No full-acquisition retry is authorized by this probe. After its result, close
independent CI/documentation/review work and record any unresolved acceptance
blocker rather than inventing a transport fix or retrying until success.

R17 completed under `CB-V6-TRANSPORT-PROBE-R17-R1-ASTRA-20261025` with
536,883,638 bytes in 82,143 ms and intentional cancellation at the byte cap.
The maximum interval between progress callbacks was 177 ms (not pure network
latency); the final callback was one millisecond before the result. DNS succeeded
before/after, no download diagnostic was recorded, and teardown/source checks
passed. The 90-second threshold was not reached; longer transfers remain
untested. The two installed read timeouts were not reproduced in this isolated
process. This is evidence of a successful bounded transfer, not a root-cause
finding, an installed-context defect or full acquisition acceptance.

The current blocker is a missing passing full installed acquisition/recovery
journey after two actual read timeouts. No source fix is justified by the bounded
observations alone. Further diagnosis must distinguish the installed
process/callback context from time-varying transport behavior before another
full attempt; the completed experiment does not renew that retry budget.
No validation process remains active, the original installation/data are
restored, and the temporary offline rules remain removed. Keep this plan active
and PR #272 in draft; request final independent assessment of the exact current
patch and these evidence limits without waiving the missing gate.

The final documentation check initially stopped before execution because the
default shell resolved pnpm 11.25.0 instead of the pinned 11.15.1. Selecting the
existing Corepack shims for that host process restored the required toolchain;
`pnpm.cmd check:evidence` and `git diff --check` then exited 0. No global tool
installation or source change was made to bypass the engine guard.

`CB-V6-FINAL-DIAGNOSTIC-R1-ASTRA-20261025` verified the current 86-path
patch, all 797 execution inputs, fresh passing CI and diagnostic receipts. It
approved the two-document status update while keeping global acceptance
BLOCKED on the missing installed journey. Its F1 found an overstatement in the
proposed PR body: restoration did not succeed at every historical closure; one
earlier Lifecycle failure required separately reviewed recovery. The corrected
PR text acknowledges that failure/recovery and the final restored condition.
Request re-review of this documentary addition and corrected publication text
before the authorized handoff; no production code or test input changed.

Preparation checkpoints below are local PowerShell results, outside the managed
sandbox. Publication subsequently passed as recorded above; installed acceptance
is still pending and is not inferred from v5 or CLB evidence.

| Command | Result |
| --- | --- |
| `pnpm.cmd audit:chatterbox:v5` | Exit 1; two vulnerable packages in the published graph. |
| `pnpm.cmd package:chatterbox-optional:v6:lock` and `:write-source` | Exit 0; generated exact two-pin 79-package successor. |
| `pnpm.cmd test:chatterbox:v6:preparation` | Red 10 failed / 98 passed; final green 108 passed. |
| `pnpm.cmd audit:chatterbox:v6` | Exit 0; zero known findings in 75 understood packages; chatterbox-tts, resemble-perth and the two CUDA wheels remain four explicit blind spots. |
| `pnpm.cmd test:chatterbox:v6:security:baseline --temporary-root <isolated-root>` | Expected exit 1 after actual synthetic outside-destination write; legitimate control passed. |
| `pnpm.cmd package:chatterbox-optional:v6 --output-root <short-root>` | Exit 1; containment rejected canonical/alias mismatch. |
| Same build with extended prefix through pnpm | Exit 1; argument prefix doubled before the builder could create output. |
| `uv run --directory services/tts --locked python -m voxleaf_tts.release_chatterbox build --package-version 6 --output-root <extended-root>` | Exit 0; same configured builder, exact canonical argument. |
| Same configured command with `check-local` after all probes | Exit 0; source, lock, tree, ZIP, manifests and ordered parts match the generated receipt. |
| `pnpm.cmd test:chatterbox:v6:security --temporary-root <isolated-root>` | Exit 0 on the exact assembled runtime: 5 rejected namespaces / 4 legitimate controls. POSIX filelock exploit is not executed on Windows. |
| `pnpm.cmd test:chatterbox:runtime-security` and `test:chatterbox:dependency-security` | Exit 0 on the assembled runtime; 3 security + 2 legitimate controls, and 7 previous dependency-security cases. |
| `pnpm.cmd test:chatterbox:runtime-smoke --package-version 6 --models <verified-local-models> --language es` | Exit 0; 4.12 seconds finite nonzero bounded PCM; cancellation 422 ms; no network/audio-file output. |
| Same runtime smoke with `--language en` | Exit 0; 3.64 seconds finite nonzero bounded PCM; cancellation 484 ms; no network/audio-file output. |
| `pnpm.cmd check:portable` | Exit 0; shared 209, EPUB 674, desktop 818 + 97, Python 629, format/lint/types/schema and portable builds pass. |
| Historical v2/v3/v4/v5 source and v3/v5 acquisition checks | All exit 0; historical authority unchanged. |

## Concrete publication candidate

Published prerelease: [`chatterbox-runtime-v6`](https://github.com/mmjosedaniel/voxleaf/releases/tag/chatterbox-runtime-v6).
The user approved the exact three parts below after independent preparation
review. Older tags/assets are preserved; no model files or VoxLeaf installer
were published. Upload and publication readback matched the approved identities.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `voxleaf-chatterbox-runtime-v6.zip.part-001` | 1,900,000,000 | `3963d4091e1c5baeb7485589251330e69af0dd06ff9a4c0f0561fcde993ab73a` |
| `voxleaf-chatterbox-runtime-v6.zip.part-002` | 1,900,000,000 | `f99c82953ea5bce559b1e00efcee09d264ff2ce369eb0ee622b6595706cd3676` |
| `voxleaf-chatterbox-runtime-v6.zip.part-003` | 1,231,350,467 | `5312398ef84a43d4c0dd8eec30d878e52bbf4390108b13eb7a52e4de38aca56e` |

Combined archive: 5,031,350,467 bytes, SHA-256
`2567feb51cfe7816281b0eb936c4358dd980458def8ddd5508ee603930aecafb`.
Runtime tree: 13,092 files / 5,027,792,395 bytes; runtime manifest SHA-256
`bb902682e366e119e3a7cdc992440b017bd6bd96cf328c3b0863a4eb1eb024e0`.
Source recipe SHA-256 `ebc26b77617350b504e2b9691cf54f0a7c32d0148d0c3e19dcbf8a7677ea9864`;
lock SHA-256 `2b0b51a5f8374aec007e3f3b9a758dff4e46611ba1f19169c96da179c8f086b8`.
With unchanged model bytes, generated acquisition totals are 8,240,302,391
download bytes and 8,236,744,319 installed bytes. These measurements do not
admit the package or establish installed/native acceptance.
