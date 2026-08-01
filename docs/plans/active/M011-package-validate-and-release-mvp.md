# M011 — Package, validate, and release the MVP

## Goal

Turn the implemented VoxLeaf reader and local-narration product into a
versioned Windows MVP that can be installed and validated without a repository
checkout, development shell, manual firewall rule, private book, or silent
model download. Keep Piper Spanish/English as the small core narration family
and add Chatterbox Spanish/English only as an explicit, integrity-checked,
removable GPU quality download.

Keep the first distribution proportional to a portfolio MVP. Close the
security, licence, dependency, integrity, packaging, clean-host, privacy, and
support claims that protect an ordinary user. Do not delay the MVP for
enterprise isolation, automatic updates, external certification, every TTS
profile, or additional operating systems.

## User-visible outcome

After the applicable M011 release gate passes:

- a Windows x64 user can install VoxLeaf, open a supported local EPUB, restore
  progress, and use English or Spanish local narration through the included
  Piper profile without installing developer tools;
- a compatible GPU user may choose Chatterbox, review its measured download,
  storage, hardware, licence, and startup implications, and explicitly
  download and enable it without reinstalling the core application;
- normal reading and narration work without an external service, persistent
  generated audio, administrator-created firewall rules, or a background
  listener;
- core installation and optional-profile acquisition are explicit and
  integrity-checked; optional acquisition is cancellable and complete before
  its offline narration is offered;
- installation, repair/reinstall, application restart, and uninstall have
  documented content-safe behavior;
- the product discloses its exact included profiles, requirements, licences,
  source/provenance obligations, known limitations, and measured behavior;
- a portfolio demo uses synthetic, self-authored, or public-domain content and
  can be reproduced on a clean Windows host; and
- a public installer is published only when it is signed and its checksum and
  release evidence are available.

If the optional Chatterbox package fails its independent dependency, licence,
artifact, or clean-host gate, the Piper core MVP may still close. VoxLeaf must
then omit the download action and make no end-user Chatterbox availability
claim.

If signing authority is unavailable, the portfolio-ready local MVP may still
close honestly. The unsigned build must remain a local or maintainer-operated
artifact and public installer publication remains blocked.

## Current state

Roadmap Milestones 1 through 10.2, M008.1, and M009.1 are complete. The current
application implements secure bounded EPUB ingestion, a reflowable synchronized
reader, bounded restoration and preferences, local narration preparation, one
native-supervised TTS child, bounded in-memory audio, English/Spanish selection,
supported Piper and Chatterbox profiles, development-only Qwen profiles,
identity-first recovery, and six boundary-deferred playback rates.

The repository can build a Tauri release executable for validation, but
`apps/desktop/src-tauri/tauri.conf.json` still uses version `0.0.0` and
`bundle.active` is `false`. There is no end-user installer, signed release,
updater policy, runtime/model acquisition flow, third-party notice bundle, or
clean-machine install/uninstall proof.

Milestone 2 now provides the repository release dependency boundary without
claiming packaging: a 15-entry private Piper core lock, a separate 79-package
Chatterbox lock, automated Node/Rust/Python release audits, bounded dependency-
update intake, and a deterministic 363-component inventory. Installer,
acquisition, compliance fulfillment, final artifact measurements, and clean-
host release evidence remain future milestones.

The current TTS runtimes are ignored developer assets selected through
environment variables. Development firewall rules target exact candidate
interpreters, but an ordinary user must not have to reproduce that setup.
The native child has strong identity, framing, allocation, lifecycle, and
process-tree containment, but it runs with the current user's ordinary
filesystem and network authority; it is not an OS sandbox.

The exact local Chatterbox development footprint measured on 2026-07-31 is
approximately 8.02 GiB: 5.03 GiB of isolated environment and 2.99 GiB of model
artifacts. That is installed developer state, not a final package/download
measurement. The passing evaluation also records approximately 0.52-0.54
sustained RTF, greater-than-30-second cold load, about 4.88 GiB peak
process-tree RAM, and about 3.56 GiB dedicated VRAM. M011 must replace the
benchmark graph with a minimal production lock and repeat release-package
size, advisory, startup, and resource evidence.

The content-safe planning audit on 2026-07-31 found:

- no known vulnerability at the selected audit level in the locked production
  Node graph, base Python service, or exact Piper candidate environment;
- known `transformers` advisories in the Qwen candidate environment;
- known advisories across `diffusers`, `gradio`, `starlette`, and
  `transformers` in the Chatterbox candidate environment, including packages
  whose web surfaces are not used by the current local adapter;
- CUDA Torch/Torchaudio and the local VoxLeaf package were not identified by
  the advisory service and therefore need explicit limitation records;
- at that time, no automated RustSec/per-profile Python audit, dependency-update
  intake, or versioned shipped-component inventory; Milestone 2 now supplies
  each repository boundary; and
- no tracked EPUB, generated audio, model weight, signing credential, or
  private user data.

The durable boundary and proportional prioritization are recorded in
[`release-security-and-distribution.md`](../../development/release-security-and-distribution.md).
That document is planning input, not proof that a release gate passes.

## Scope and non-goals

### In scope

- Freeze the exact Windows MVP payload, threat model, trust boundaries,
  privileges, network behavior, persistence, artifact acquisition, cleanup,
  licences, claims, and release gates before packaging results.
- Use Piper davefx/Spanish and Piper joe/English as the baseline distributable
  profile family unless the frozen authority records evidence for a narrower
  or equally safe alternative.
- Implement Chatterbox Spanish/English as an optional downloadable GPU quality
  package, separate from the core installer and offered only after its exact
  dependency, advisory, licence, artifact, size, hardware, integrity,
  installation/removal, and clean-host gates pass.
- Keep Qwen in the developer matrix and outside the first distributable
  product.
- Produce a minimal locked production service/profile environment instead of
  copying complete benchmark environments into the installer.
- Implement one native-owned, fixed-manifest artifact acquisition boundary
  with explicit consent, bounded download/staging, digest verification,
  atomic versioned installation, cancellation, failure cleanup, offline use,
  and application-owned removal. The renderer supplies only a closed profile
  ID and never an artifact URL, executable path, archive, or destination.
- Preserve the active working profile and narration until the user explicitly
  activates a successfully installed optional profile. Selecting an absent
  Chatterbox option opens acquisition consent; it does not silently download,
  stop playback, or switch the service identity.
- Audit every shipped JavaScript, Rust, Python, native runtime, voice, and
  model component; remove unused release packages; enable dependency-update
  intake; and generate a versioned content-safe component/licence inventory.
- Fulfill the root MIT terms plus Piper/phonemizer GPL-3.0-or-later mechanics,
  applicable corresponding-source obligations, and davefx/joe voice provenance
  and model-card/CC0 notices.
- Pin and integrity-check every bundled or deliberately acquired artifact.
- Implement versioned Windows packaging, first-run/runtime setup, uninstall,
  and manual update documentation without requiring developer tooling.
- Implement signing automation without committing secrets. Treat a trusted
  signing credential as an external authorization needed only for public
  installer publication.
- Validate the complete product and package on a clean normal-user Windows
  host with synthetic/public-domain content and external connectivity denied
  during ordinary reading/narration.
- Reuse the existing hostile-EPUB, privacy, accessibility, cancellation,
  lifecycle, synchronization, playback, resource, and exact-host suites rather
  than creating a parallel product implementation.
- Publish truthful support, exclusion, limitation, recovery, licence,
  checksum, and vulnerability-audit records for the exact release candidate.
- Report Piper-core and Chatterbox-package readiness independently so an
  optional-profile failure does not become a false core-MVP failure or a false
  Chatterbox support claim.

### Out of scope for this MVP

- Automatic update infrastructure. A documented manual versioned replacement
  is sufficient; adding an updater later requires signed metadata and payloads.
- AppContainer or a third-party Python sandbox, unless M011 discovers a
  release-blocking risk that cannot be closed by the existing exact-profile,
  no-listener, offline, integrity, and least-authority boundaries.
- macOS, Linux, Microsoft Store, and managed-enterprise packaging.
- External penetration testing, formal certification, SLSA/reproducible-build
  guarantees, and a multi-vendor antivirus laboratory.
- Bundling Chatterbox, Qwen, MOSS, or every locally implemented voice inside
  the core installer solely to make the portfolio appear larger.
- Automatic/background model download, automatic optional-profile updates, or
  downloading Chatterbox merely because Settings was opened.
- Cloud inference, telemetry, analytics, account systems, DRM, audiobook
  export, or generated-audio persistence.
- Reopening EPUB semantics, protocol v1, TTS evaluation decisions, buffer
  ceilings, synchronization, reader behavior, or playback-rate authority
  unless packaging exposes a concrete defect.

## Relevant files and documentation

- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/src/`
- `apps/desktop/scripts/`
- `apps/desktop/src/settings/ReaderSettingsDialog.tsx`
- `apps/desktop/src/tts/HardwareCompatibilityControls.tsx`
- `apps/desktop/src/tts/narration-profile-language-registry.ts`
- `apps/desktop/src/tts/hardware-profile-compatibility.ts`
- `services/tts/pyproject.toml`
- `services/tts/uv.lock`
- `services/tts/benchmarks/candidates/piper_1_4_2_cpu/`
- `services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/`
- `services/tts/src/voxleaf_tts/chatterbox_adapter.py`
- `services/tts/src/voxleaf_tts/chatterbox_service.py`
- `package.json`, `pnpm-lock.yaml`, and `rust-toolchain.toml`
- `.github/workflows/`
- `.github/dependabot.yml` once introduced
- `README.md`, `SECURITY.md`, `LICENSE`, and future release notice/inventory
  artifacts
- [`docs/product/mvp.md`](../../product/mvp.md)
- [`docs/product/project-brief.md`](../../product/project-brief.md)
- [`docs/architecture/system-diagram.md`](../../architecture/system-diagram.md)
- [`docs/architecture/overview.md`](../../architecture/overview.md)
- [`docs/architecture/tts-support-matrix-v2.md`](../../architecture/tts-support-matrix-v2.md)
- [`docs/architecture/mvp-release-authority-v1.md`](../../architecture/mvp-release-authority-v1.md)
- [`docs/development/dependencies.md`](../../development/dependencies.md)
- [`docs/development/testing.md`](../../development/testing.md)
- [`docs/development/release-security-and-distribution.md`](../../development/release-security-and-distribution.md)
- [ADR-0023](../../architecture/decisions/ADR-0023-final-m010-support-and-recovery.md)
  and
  [ADR-0031](../../architecture/decisions/ADR-0031-admit-chatterbox-bilingual-and-qwen-language-profiles.md)

## Architecture and constraints

- The EPUB, narration text, generated audio, local paths, raw environment,
  model data, and private host identity remain outside logs, release reports,
  telemetry, and persisted application state.
- A release package may contain fewer profiles than the development registry.
  Packaging exclusion does not rewrite historical support/evaluation evidence.
- Exactly one supervised TTS process tree may exist. The renderer receives no
  shell, filesystem, arbitrary-process, network, or model-path capability.
- Normal reading and narration require no external service. Acquisition is a
  separate explicit setup phase and must fail closed on hash, signature,
  licence, or version mismatch.
- The core installer and optional Chatterbox package have separate identities,
  manifests, readiness states, size disclosures, checksums, and release
  decisions. Installing or removing one optional version cannot mutate the
  desktop binary or Piper runtime.
- Chatterbox acquisition is native-owned and allowlisted. It uses HTTPS plus a
  frozen cryptographic digest, bounded content length and staging space, a
  versioned application-owned destination, and atomic promotion. Partial or
  cancelled artifacts are never executable.
- Opening Settings, checking compatibility, selecting a language, or restoring
  preferences cannot start a download. Only explicit confirmation in the
  acquisition UI may do so.
- Optional-package installation does not automatically start a model or
  replace active narration. The existing identity-first profile switch occurs
  only after installation succeeds and the user explicitly activates the
  profile.
- No model or checkpoint supplied by an EPUB or arbitrary renderer value may
  be deserialized. Release artifacts come only from the frozen manifest.
- The installer and uninstaller must never discover or delete user books.
  Application-owned runtime/cache/configuration paths must be explicit and
  bounded before cleanup is implemented.
- Generated audio remains memory-only and is released through the existing
  ownership/lifecycle path.
- Network denial during normal reading/narration remains acceptance evidence;
  acquisition networking is measured separately and must transmit no EPUB,
  prepared text, locator, audio, preference, or host-identifying payload.
- Signing keys and certificates stay outside Git and ordinary build logs.
- All final validation runs in a normal local PowerShell session outside the
  managed automation sandbox, as required by `AGENTS.md`.

## Milestones

### Milestone 1: Freeze core, optional-profile, security, and release authority

**Status:** Complete as of 2026-08-01. The frozen
[`mvp-release-authority-v1`](../../architecture/mvp-release-authority-v1.md)
and accepted
[ADR-0042](../../architecture/decisions/ADR-0042-freeze-mvp-release-authority.md)
precede dependency, packaging, acquisition, and clean-host results. Authority
checkpoint commit: `a5ec9b1`.

1. Enumerate the exact Windows package topology: desktop binary, local service,
   Python/runtime strategy, Piper engine/phonemizer, davefx/joe voices, core
   storage, application-owned data, acquisition, and uninstall boundaries.
   Separately enumerate the optional Chatterbox production runtime, model,
   default voice/conditioning, temporary staging, versioned install, removal,
   and GPU support boundaries.
2. Record the threat model and trust table for EPUB input, WebView, native
   commands, service standard streams, child process, artifacts, network,
   storage, installer, updater absence, and signing.
3. Freeze portfolio-ready versus public-installer claims and their separate
   signing gates. Record that lack of a certificate blocks public publication,
   not local portfolio validation.
4. Freeze the absent/selecting/confirming/downloading/verifying/installed/
   failed/removing optional-profile states. Confirm that an absent-profile
   selection prompts rather than downloads, decline/cancel preserves the
   working profile, and activation occurs only after verified installation and
   a separate explicit user action.
5. Freeze dependency severity/reachability policy, component inventory fields,
   licence/source/provenance evidence, artifact hashes, normal-user install,
   no-manual-firewall requirement, cleanup ownership, download/install/free-
   space disclosure, and independent Piper-core/Chatterbox release gates.
6. Add an ADR accepting that authority before implementation or packaging
   measurements. Commit this checkpoint separately.

### Milestone 2: Close the core and optional dependency/component graphs

**Status:** Complete (2026-08-01).

1. Build the smallest production Python/Piper graph from actual adapter imports
   and package needs; do not reuse benchmark-only or web-serving dependencies.
2. Derive a separate minimal Chatterbox production lock from the exact adapter
   path. Do not copy its approximately 8.02-GiB development environment.
   Remove Gradio, Starlette, and other dormant web/UI packages unless direct
   runtime evidence proves they are required.
3. Resolve, update, replace, or withhold the optional package for the known
   Chatterbox `diffusers`/`transformers` advisories. A high/critical reachable
   advisory or unexplained audit blind spot blocks that package, not the Piper
   core release.
4. Add repository-owned release audit automation for production Node, Rust,
   base Python, and every included/downloadable profile. Record packages the
   advisory source cannot identify without treating them as clean.
5. Enable bounded automated dependency-update intake for the repository's
   maintained ecosystems without granting write or release authority.
6. Generate one content-safe release component inventory containing exact
   component identity, version/revision, source, integrity hash, licence,
   inclusion reason, and core/optional/not-shipped status. Prefer a standard
   SBOM format when it does not add disproportionate runtime or maintenance
   cost.
7. Remove unused release packages, particularly dormant web-server/UI stacks,
   and rerun focused service and adapter tests before committing this
   checkpoint.

### Milestone 3: Implement compliant Piper core runtime and voice distribution

**Status:** Not started.

1. Derive and package the frozen bundled private Python/Piper runtime and both
   voices from the exact minimal production graph. Measure compressed and
   installed size plus offline behavior. If licence or packaging evidence makes
   this topology impossible, stop and supersede the authority before replacing
   it with acquisition or a narrower core.
2. Implement the fixed manifest, digest verification, atomic staging, partial-
   failure cleanup, exact runtime discovery, and content-free errors. Do not
   accept a renderer-provided executable or model path.
3. Produce the third-party notices, model cards/provenance, GPL source or other
   applicable fulfillment mechanics, and user-visible acquisition disclosure.
4. Prove that failed, truncated, substituted, or stale artifacts cannot start
   narration and that successful setup enables both frozen Piper languages
   without network access during reading.
5. Commit core runtime/acquisition and compliance evidence as a logical
   checkpoint.

### Milestone 4: Implement optional Chatterbox acquisition and removal

**Status:** Not started.

1. Freeze and check in the exact optional-package manifest selected by
   Milestones 1 and 2: closed profile identity, version/revision, allowed HTTPS
   sources, byte ceilings, digests, required free space, application-owned
   staging/install paths, licence/provenance references, and supported host
   facts. No renderer-provided URL or path is accepted.
2. Implement native-owned bounded download, cancellation, restart-safe partial
   cleanup, verification before extraction/use, traversal-safe staging, atomic
   version promotion, exact runtime discovery, and explicit package removal.
3. In Settings/compatibility UI, distinguish compatible-but-not-installed from
   unavailable and installed. Selecting the absent profile opens an accessible
   confirmation with measured size/hardware/startup/licence disclosures and
   Download/Cancel actions. Opening Settings or checking compatibility performs
   no acquisition.
4. Keep the current working profile and narration unchanged when acquisition is
   declined, cancelled, or fails. After verified installation, offer an
   explicit activation action that reuses the existing identity-first profile
   switch; never start a model implicitly.
5. Prove wrong hash, wrong size, truncation, traversal, stale version,
   insufficient disk, network interruption, cancellation, process restart,
   incompatible hardware, and removal behavior. All failures remain
   content-free and leave Piper usable.
6. Measure final download bytes, installed bytes, peak temporary disk use,
   install/remove time, cold load, RTF, RAM, and VRAM. Prove Spanish and English
   installed narration offline and commit implementation plus content-safe
   evidence as a separate checkpoint.

### Milestone 5: Build the versioned Windows package and signing path

**Status:** Not started.

1. Replace development identity/version labels with a deliberate first MVP
   version and enable only the frozen Windows bundle targets.
2. Package the desktop, service, exact minimal private Piper runtime and both
   voices, optional-profile acquisition controller/manifest, licences,
   notices, inventory, and user documentation. Keep Chatterbox weights/runtime,
   benchmark tools, candidate audio, private artifacts, and excluded model
   environments out of the core installer.
3. Validate normal-user installation, first start, repair/reinstall, manual
   version replacement, and uninstall cleanup. Do not require a repository,
   Python, Node, Rust, administrator firewall rule, or development environment.
4. Add signing automation that reads protected external credentials only in
   the authorized release environment, verifies the output signature, and
   emits a checksum. Never weaken the unsigned local development path.
5. Record antivirus/SmartScreen observations without claiming universal
   reputation. Commit the package lifecycle separately.

### Milestone 6: Validate the clean-host portfolio and release matrix

**Status:** Not started.

1. Install the exact candidate on a clean normal-user Windows host and prove
   no hidden developer prerequisite or external runtime mutation is needed.
2. Run a synthetic/public-domain English and Spanish EPUB journey covering
   open, navigation, restoration, Quick/Prepared startup, all six playback
   rates, highlighting/following, paragraph-leaf seek, pause/resume/stop,
   language/profile change, service failure, explicit recovery, close,
   application restart, and uninstall.
3. Reuse the existing deterministic hostile-EPUB, browser, packaged WebView2,
   privacy, accessibility, lifecycle, resource, and exact-host suites against
   the release candidate. Add only package-specific regression cases exposed
   by this topology.
4. Observe network, filesystem, process-tree, RAM/VRAM/CPU, startup,
   buffering/underruns, cancellation, and cleanup without recording book text,
   narration text, PCM, paths, raw process details, or user identity.
5. Verify ordinary reading/narration while external connectivity is denied and
   prove zero generated-audio persistence plus bounded application-owned data.
6. On a separate compatible clean-host arm, prove the full optional-profile
   lifecycle: absent/decline, explicit download, verified install, explicit
   activation, Spanish/English offline narration, application restart,
   optional-package removal, and Piper operation after removal. Add corrupt,
   interrupted, insufficient-space, and incompatible-host arms without
   redownloading unnecessarily.
7. Run install/repair/uninstall twice to expose stale state, locked-file, and
   cleanup failures. Commit content-safe results separately from authority.

### Milestone 7: Record the MVP release decision and close validation

**Status:** Not started.

1. Reconcile product, architecture, setup, testing, troubleshooting,
   dependencies, security, system diagram, roadmap, support matrix, and release
   documentation with measured results.
2. Publish exact core/optional/excluded profiles, supported hardware, core
   installer size, optional download/installed/staging sizes, prerequisites,
   hashes, licences, vulnerability-audit limitations, startup/resource
   measurements, known limitations, removal, and recovery behavior.
3. Decide separately whether evidence closes the Piper portfolio-ready core,
   the downloadable Chatterbox portfolio profile, and signed public installer
   publication. Do not block the Piper core solely because Chatterbox or
   signing authority is unavailable, and do not inherit a core pass into the
   optional package.
4. Run the complete applicable repository and package validation outside the
   sandbox, review the final diff and tracked-artifact/privacy audit, and obtain
   passing required pull-request checks.
5. Archive this ExecPlan only after its actual results, release decision, and
   unresolved external blockers are recorded.

## Testing and validation strategy

Use existing commands until a milestone explicitly implements and documents a
new repository script. Final acceptance must run outside the sandbox.

Current repository baselines:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd test:tts:bilingual-portfolio-exact-host
pnpm.cmd benchmark:reader:native
```

Run focused package/service tests while changing those areas, then repeat the
unchanged complete applicable commands after packaging. Milestone 2 adds the
following deterministic release-graph commands:

```powershell
pnpm.cmd audit:release
pnpm.cmd inventory:release:check
```

The optional-acquisition and installer-lifecycle commands do not exist yet;
Milestones 4 and 5 must add them to repository configuration and documentation
before they may become acceptance evidence.

Milestone 4 must add deterministic tests for the optional acquisition state
machine and native manifest boundary before any network-backed host run. Those
tests cover explicit consent, absent versus installed availability, byte/free-
space limits, digest and version rejection, traversal-safe extraction, atomic
promotion, cancellation, restart recovery, package removal, and zero profile
or narration mutation before explicit activation. Host evidence then uses only
the frozen synthetic bilingual corpus and records no URL containing user data,
book text, prepared text, PCM, local path, or raw host identity.

Every result must distinguish:

- deterministic repository evidence;
- browser Chromium evidence;
- packaged Windows WebView2 evidence;
- exact local TTS hardware evidence;
- clean-host installer evidence;
- portfolio-ready unsigned/local evidence; and
- signed public-installer evidence.

A sandbox result is exploratory only. A failed audit, unfulfilled licence,
artifact-integrity failure, private-data leak, destructive cleanup, unsigned
public payload, or known high/critical reachable shipped vulnerability blocks
the corresponding release claim.

## Risks and rollback strategy

- **Piper GPL/phonemizer obligations are larger than expected.** Prefer explicit
  compliant fulfillment for the frozen bundled core. If that cannot pass, stop
  for qualified review and a superseding ADR; never silently switch to network
  acquisition, narrow the core after results, or repair notices later.
- **Embedded Python makes the installer too large or fragile.** Compare one
  minimal embedded runtime against the frozen dependency graph and remove
  non-product packages. If it still cannot pass, stop for a superseding ADR
  rather than requiring developer/system Python or silently adding a core
  download.
- **A release audit finds a vulnerable package.** Update, remove, or replace it;
  if unreachable and unavoidable, document a time-bounded exception. Exclude
  the affected optional profile rather than blocking the entire Piper MVP.
- **Chatterbox's minimal graph cannot remove dormant web dependencies or close
  relevant advisories.** Do not publish its manifest or download action. Keep
  the implemented development profile and release the independently passing
  Piper core without implying end-user Chatterbox availability.
- **The optional package is too large or staging doubles disk unexpectedly.**
  Measure compressed, installed, temporary, and free-space requirements before
  UI copy is frozen. Fail before download when space is insufficient and never
  move the weights into the core installer to hide the problem.
- **Acquisition creates a broader network or filesystem capability.** Keep URL,
  hash, size, version, and destination native-owned and manifest-closed. Roll
  back the optional acquisition path rather than expose arbitrary renderer
  download or path selection.
- **Licence or default-voice/model provenance remains ambiguous.** Withhold the
  optional package and stop for qualified review; local evaluation is not
  redistribution authority.
- **Signing credentials are unavailable.** Close only the portfolio-ready
  local level and keep public installer publication blocked.
- **SmartScreen or antivirus reputation is poor.** Preserve the signed package,
  checksums, and evidence; do not disable security tools or instruct users to
  create broad exclusions.
- **Installer cleanup risks user data.** Stop and redesign around explicit
  application-owned paths. Rollback/uninstall must never glob for EPUBs or
  model-like files outside that ownership boundary.
- **Clean-host performance regresses.** Narrow supported hardware or initial
  prepared policy truthfully; do not weaken resource/cancellation/privacy
  bounds merely to pass.
- **Optional GPU profiles expand the scope.** Implement only the separately
  gated Chatterbox package; retain Qwen and every other GPU profile as
  development/post-MVP evidence.

Rollback is branch/commit based. Preserve frozen authority and content-safe
results as history, revert only the failed package/acquisition implementation,
and never edit prior benchmark authority to make a release pass.

## Progress log

- **2026-07-31:** Reviewed the completed M001-M010.2 boundary, current Tauri
  packaging configuration, dependency inventory, security policy, support
  decisions, and roadmap. Confirmed that M011 had no detailed ExecPlan.
- **2026-07-31:** Recorded the pre-M011 content-safe dependency/security audit
  baseline and separated existing defenses from outstanding distribution
  claims.
- **2026-07-31:** Scoped the first MVP around Windows x64 and the two measured
  Piper CPU voices in the core package. Chatterbox is now a separately gated
  optional downloadable GPU quality package; Qwen does not enter the first
  distributable product.
- **2026-07-31:** Split completion into portfolio-ready local and signed public
  installer gates so unavailable signing authority does not force unsafe
  publication or indefinitely block a truthful portfolio demo.
- **2026-07-31:** Measured the current Chatterbox developer footprint at about
  5.03 GiB of environment plus 2.99 GiB of model artifacts. Recorded that
  8.02 GiB as planning input only and added explicit minimal-graph,
  acquisition-consent, integrity, lifecycle, offline, and independent-release
  gates before end-user availability.
- **2026-08-01:** Inspected the actual Tauri and supervisor topology before
  freezing M011: application version `0.0.0`, `bundle.active: false`, no Tauri
  capabilities/plugins, a restrictive CSP, and repository-relative Python,
  Piper, Chatterbox, and model roots configured through development-only
  environment variables. Confirmed that none is a production package path.
- **2026-08-01:** Froze
  [`mvp-release-authority-v1`](../../architecture/mvp-release-authority-v1.md)
  and accepted
  [ADR-0042](../../architecture/decisions/ADR-0042-freeze-mvp-release-authority.md)
  in separate authority checkpoint `a5ec9b1`. The authority fixes a per-user
  Windows x64 core with a private embedded production Python/Piper runtime and
  both voices, plus a separate native-owned optional Chatterbox state machine,
  threat table, cleanup roots, dependency/licence/integrity policy, and
  independent release claims.
- **2026-08-01:** Rechecked primary upstream licence inputs. Piper 1.4.2 is
  GPL-3.0 and both selected voice model cards identify CC0 datasets;
  Chatterbox's source/model card identify MIT and its official path retains
  PerTh watermarking. These remain intake evidence: Milestones 2-4 must pin
  exact production revisions and fulfill every transitive/runtime obligation
  before distribution.
- **2026-08-01:** Validated Milestone 1 from normal local PowerShell outside the
  sandbox. Prettier passed for all nine touched authority/canonical Markdown
  files; relative-link, pending-diff private-pattern, tracked EPUB/audio/model-
  artifact, and `git diff --check` validation passed. `pnpm.cmd check:portable`
  passed: 20 shared test files/209 tests, 34 EPUB files/580 tests, 51 desktop
  files/515 tests, 12 native-runner Node tests, and 347 Python tests, plus
  linting, type checking, contract generation checks, and portable builds. It
  retained pre-existing non-failing Vite highlight/chunk-size warnings and one
  pytest cache-write warning. No installer, acquisition, model, GPU, signing,
  or clean-host command is applicable yet because Milestone 1 adds authority,
  not those future implementations.
- **2026-08-01:** Derived the private Piper core directly from production
  imports and locked 15 entries, including the local service root. An isolated
  Windows smoke environment measured 107.53 MiB and produced content-free
  Spanish and English audio through the exact adapter without network access.
- **2026-08-01:** Replaced the approximately 5.03-GiB Chatterbox developer
  environment graph with an explicit 79-package optional lock. The graph omits
  dormant Gradio, Starlette, FastAPI, Uvicorn, pre-commit, Matplotlib,
  TensorBoard, pandas, pykakasi, and pyloudnorm surfaces; pins exact source
  archive revisions and CUDA wheels; and updates `diffusers` and `transformers`.
  Isolated load, warm-up, English, and Spanish adapter smoke evidence passed.
  The 4.83-GiB isolated graph footprint is not a compressed download or final
  installed package measurement.
- **2026-08-01:** Added `pnpm.cmd audit:release`. The frozen Node, base Python,
  Piper-core, and Chatterbox registry graphs report no known vulnerability at
  the selected audit level. Rust reports zero vulnerabilities and 17 exact
  informational notices, of which five unmaintained Unicode crates are
  reachable from the Windows target graph. Four exact source/CUDA packages
  remain recorded audit blind spots rather than being represented as clean.
- **2026-08-01:** Added weekly bounded Dependabot intake for npm, Cargo, the
  base/core/optional Python locks, and GitHub Actions without automatic merge
  or release authority. Added a deterministic 363-component inventory with
  exact lock identities, scope, purpose, provenance, licence evidence,
  integrity, audit reference, process/cleanup ownership, and artifact state.
- **2026-08-01:** Validated Milestone 2 from normal local PowerShell outside the
  sandbox. `pnpm.cmd audit:release` and `pnpm.cmd inventory:release:check`
  passed. Exact offline adapter smoke produced 177,216 Spanish and 197,276
  English Piper payload bytes through the locked core, and 222,720 English
  Chatterbox payload bytes through the optional lock; an earlier Spanish
  Chatterbox smoke passed from the same graph. The release/Piper/Chatterbox/
  service coverage contains 43 passing tests. `pnpm.cmd check:portable` and
  `pnpm.cmd check` passed formatting, lint, types, 20 shared files/209 tests,
  34 EPUB files/580 tests, 51 desktop files/515 tests, 12 Node native-runner
  tests, 41 Rust tests, 353 Python tests, portable builds, the Tauri Windows
  release build, and Python artifacts. Existing non-failing Custom Highlight,
  bundle-size, Diffusers deprecation, offline Cangjie-map, and pytest cache-
  write warnings remain. No network acquisition, installer lifecycle, signing,
  or clean-host command is applicable until later M011 milestones implement it.

## Discoveries and decisions

- **Decision:** M011 absorbs the security audit; a separate M010.3 is not
  required because the findings concern packaging, distribution, licences,
  dependency closure, signing, and complete-MVP validation.
- **Decision:** The minimum distributable MVP is intentionally smaller than the
  local development matrix. This lowers installer, vulnerability, licence,
  GPU, and support risk without removing implemented engines from source.
- **Decision:** Chatterbox's portfolio value justifies one optional package,
  not an approximately 8-GiB expansion of the core installer. It is acquired
  only after explicit consent and activated only through a separate explicit
  action after verification.
- **Decision:** Piper-core, optional-Chatterbox, and signed-public readiness are
  independent decisions. Failure of one narrows its claim without rewriting
  historical support evidence or automatically failing the others.
- **Decision:** Code signing is a public-publication gate, not a prerequisite
  for a private local build or recorded portfolio demonstration.
- **Decision:** Automatic updates, enterprise process isolation, formal SBOM
  certification, external pentesting, and cross-platform packaging are
  post-MVP unless new evidence makes one release-critical.
- **Decision:** The core uses a private embedded Windows Python/Piper runtime
  and bundles davefx plus joe. It does not depend on system Python or a silent
  first-run core download. Changing that topology requires a superseding ADR.
- **Decision:** Release-owned roots are resolved natively from Windows Known
  Folders. The renderer supplies no install, staging, archive, URL, executable,
  hash, or destination path. Uninstall/repair can touch only exact
  installer/application-owned roots and never discovers EPUBs.
- **Decision:** A known critical finding blocks its executable graph. A known
  high reachable finding also blocks; a proven-unreachable high finding needs
  a written owner, evidence, compensating control, and expiry within 30 days or
  the next release. Audit blind spots are recorded rather than treated clean.
- **Discovery:** The current offline/process containment is strong application
  discipline but not an OS sandbox. Documentation and release claims must not
  describe it as one.
- **Discovery:** Candidate environments contain more packages than their exact
  adapters use. The shipped graph must be derived from production needs rather
  than copied from benchmark environments.
- **Discovery:** The exact Chatterbox developer environment hard-declares
  Gradio even though VoxLeaf does not start its UI/server path. The production
  lock therefore needs deliberate minimal dependency construction and cannot
  inherit the benchmark lock unchanged.
- **Decision:** The optional graph is compiled from an explicit complete
  `--no-deps` input because the upstream Chatterbox metadata hard-declares
  unused web, UI, training, and developer surfaces. Every retained transitive
  package is nevertheless exact and hash locked.
- **Decision:** One repository-owned cross-ecosystem inventory is proportional
  for this MVP because it must preserve release scope, runtime reachability,
  process/cleanup ownership, profile status, and audit blind spots that would
  otherwise require several new SBOM generators. A standards export may be
  added later without changing the recorded component identity.
- **Discovery:** Registry advisory services cannot identify the exact
  Chatterbox/PerTh source archives or CUDA Torch/Torchaudio wheels. Those four
  artifacts are frozen as explicit blind spots with provenance and hashes;
  their absence from an advisory database is never presented as a clean result.
- **Discovery:** Cargo's cross-platform lock reports informational notices that
  do not all reach the Windows product. Release automation freezes the complete
  notice set and separately verifies the five notices reachable from the
  Windows target graph so either kind of change requires review.
- **Decision:** Environment directory sizes are graph-smoke observations only.
  Compressed download, installed, staging, and free-space requirements remain
  Milestones 3 and 4 measurements and are not inferred from developer or smoke
  environments.
- **Discovery:** Python's default Windows text writer converted generated JSON
  line endings to CRLF while the repository format gate requires LF. The
  generator now writes and byte-checks canonical LF output so inventory
  regeneration and global formatting remain the same authority.
- **Discovery:** Historical benchmark hashes identify evaluated inputs but are
  not release-manifest hashes. Final core and optional filenames, byte sizes,
  SHA-256 values, compressed/install/staging sizes, and free-space requirements
  remain unavailable until Milestones 2-4 create the minimal production
  graphs. Recording that absence avoids inventing release evidence.

## Final validation

M011 is complete only when:

- every included artifact, runtime, voice, dependency, licence, source, and
  hash is identified and its obligations are fulfilled;
- every optional Chatterbox artifact has the same evidence plus an exact
  consent, download, verification, installation, offline-use, and removal
  lifecycle, or the download action and availability claim are absent;
- the package installs and uninstalls safely on a clean normal-user Windows
  host without developer tooling or manual firewall configuration;
- normal English/Spanish reading and narration remain local, bounded,
  cancellable, accessible, synchronized, recoverable, and free of generated-
  audio persistence;
- exact release dependency audits have no undisclosed high/critical reachable
  shipped vulnerability and clearly record audit blind spots;
- complete applicable repository, packaged, exact-host, clean-host, privacy,
  performance, and pull-request validation passes outside the sandbox;
- public documentation distinguishes included, supported, development-only,
  downloadable, installed, excluded, unsigned/local, and signed/public states;
  and
- the final release decision records Piper-core portfolio readiness,
  Chatterbox-package readiness, and public-installer publication independently.
