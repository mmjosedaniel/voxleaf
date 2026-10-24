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

Baseline HEAD `4dab0baea2d462e1b7b84206f7a5f39517f4cdcc` on
`codex/confirmed-logic-bugfixes`; clean index/worktree at entry. The user
authorized preparing v6 in this PR on 2026-10-23; publication authorization is
deferred until artifacts are concrete and reviewed. Existing PR commit/push
authorization persists; no merge or new public VoxLeaf installer is authorized.

The current production audit passes Node, Rust, base Python and Piper but
fails the frozen v5 lock for filelock CVE-2026-112940 and setuptools
GHSA-xmj3-9gf7-h52w. These are package-level findings, not proof that VoxLeaf
exposes the vulnerable APIs. Filelock's advisory concerns POSIX SQLite locks;
setuptools concerns namespace metadata in legacy Windows wheel installation.
The prior CLB plan and v5 acceptance are immutable historical evidence.

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
4. Reviewed publication preparation — candidate approved; documentary closeout
   and publication approval pending. The bypass/regression review and scoped
   Astra review passed. Archive/part/manifest hashes and sizes are frozen below.
   Request publication approval only for concrete reviewed artifacts after the
   documentary follow-up review. Stop before publication if unanswered.
5. Publication and production integration — pending separate authorization.
   Publish only approved assets; generate authority from verified readback,
   update admission and retained-only cleanup, run native/installed acceptance.
6. Closeout — pending. Full production audit and fresh PR CI, exact-patch
   approval, user-data restoration and index updates. Keep this plan active
   until all acceptance requirements pass.

## Testing and benchmark strategy

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

After publication/integration run `pnpm.cmd check`, `test:browser`,
`test:native-startup`, `test:tts:reader-corrections-host`,
`package:windows:verified-core`, `package:windows:check`,
`package:windows:reader-corrections`, installed integrity and lifecycle checks
against the exact candidate. Historical results cannot establish v6 acceptance.

## Risks and rollback

Filelock crosses a major version; preserve its actual local caller behavior
through imports and ES/EN inference. Setuptools legacy APIs may be removed or
reject more inputs; verify the benign control using the real corrected library.
Fresh synchronization and exact runtime manifests prevent relabeling old bytes.
Do not delete previous releases or user data. Failed candidates stay unadmitted;
rollback means abandoning their unpublished outputs, not reverting v5 history.
Any cleanup must verify exact owned absolute roots first.

## Progress log

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

## Discoveries and decisions

- Select v6 as a distinct additive identity. Preserve all existing generators'
  defaults and historical outputs. No new production admission before reviewed
  publication and verified metadata.
- The Tokio correction is already separately approved/committed. It is outside
  this candidate's dependency delta.
- The host has long Windows paths disabled. Use the canonical extended output
  path and direct configured builder invocation; the short alias was rejected
  by containment. System configuration and user-data locations are unchanged.

## Final validation results

Preparation checkpoints below are current local PowerShell results, outside
the managed sandbox. Publication and installed acceptance are still pending;
neither is inferred from v5 or CLB evidence.

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

Unpublished prerelease tag proposed: `chatterbox-runtime-v6`, in the existing
project repository. Publish only the three parts below after explicit approval;
preserve older tags/assets, publish no model files and no VoxLeaf installer.
The preparation commit and independent review must be verified before upload.

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
With unchanged model bytes, future acquisition totals would be 8,240,302,391
download bytes and 8,236,744,319 installed bytes. These measurements do not
admit the package or establish installed/native acceptance.
