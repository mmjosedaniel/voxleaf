# M011 — Package, validate, and release the MVP

## Goal

Turn the implemented VoxLeaf reader and local-narration product into a
versioned Windows MVP that can be installed and validated without a repository
checkout, development shell, manual firewall rule, private book, or silent
model download. Keep Piper Spanish/English as the small core narration family
and add Chatterbox Spanish/English only as an explicit, integrity-checked,
removable GPU quality download.

Acquire the six approved Chatterbox model-data files directly from their
official, revision-pinned Hugging Face repository instead of republishing the
weights in a VoxLeaf archive. Keep the reviewed Chatterbox runtime a separate,
closed release input: Hugging Face model acquisition must not execute repository
code, depend on system Python, or silently resolve unpinned packages.

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

The repository now has deliberate application version `0.1.0` and a separate
release-only Tauri configuration that builds a per-user Windows x64 NSIS
installer while leaving ordinary development builds unbundled. The current
measured unsigned local installer contains the deterministic, manifest-verified
Piper core and both voices. Its installed Spanish/English portfolio matrix, two
install/first-start/same-version-repair/uninstall cycles, and exact-artifact
Defender scan pass on the development host. It is not signed, is not a general-
public release, and is not clean-host acceptance evidence.

Milestones 2 and 3 now provide the release dependency and Piper payload
boundaries: a 15-entry private core lock, a separate 79-package Chatterbox
lock, automated Node/Rust/Python release audits, bounded dependency-update
intake, a deterministic 400-component inventory, and a verified bilingual
Piper payload with its runtime, notices, model cards, and exact GPL source.
Milestone 4A adds the native-owned optional-package lifecycle and its withheld
manifest/source-build boundary. Milestone 4B now replaces the single
republished model/archive assumption with a split, verified acquisition:
six exact model-data files come from the official revision-pinned Hugging Face
repository, while the reviewed runtime is independently locked, reproducibly
split, verified, and published as `chatterbox-runtime-v2`. Milestone 5
integrates only the acquisition authority into the core installer; Chatterbox
runtime and model bytes remain excluded. The validation-only package has now
completed the explicit download and verified installation on the compatible
development host. Its exact installed Spanish Chatterbox supervisor and
WebView2 narration arms now pass, but English narration, restart, removal/
reinstall, independent clean-host acquisition, and public signing remain open.

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
  with explicit consent, bounded download/staging, per-artifact digest
  verification, atomic versioned installation, cancellation, failure cleanup,
  offline use, and application-owned removal. The six model-data files come
  only from the exact official Hugging Face repository revision. The runtime
  comes only from its separately frozen release graph and approved origin. The
  renderer supplies only a closed profile ID and never a repository, revision,
  URL, executable path, archive, digest, or destination.
- Preserve the active working profile and narration until the user explicitly
  activates a successfully installed optional profile. Selecting an absent
  Chatterbox option opens acquisition consent; it does not silently download,
  stop playback, or switch the service identity.
- Close the release-facing optional-package lifecycle feedback exposed by the
  installed validation journey: stable Settings transitions, truthful first-
  Play startup phases, explicit incomplete-download cleanup copy, discoverable
  Chatterbox removal, and independently understandable optional-package versus
  preference retention during uninstall.
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
- A residual standalone model manager or cleanup executable left behind after
  VoxLeaf is uninstalled. Intentional optional-data retention uses a documented
  reinstall-and-remove route for the same product identity.
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
- `apps/desktop/src/tts/OptionalChatterboxControls.tsx`
- `apps/desktop/src/tts/ProductNarrationControls.tsx`
- `apps/desktop/src/tts/narration-profile-language-registry.ts`
- `apps/desktop/src/tts/hardware-profile-compatibility.ts`
- `apps/desktop/src-tauri/windows/nsis-hooks.nsh`
- `apps/desktop/src-tauri/windows/nsis-chatterbox-validation-hooks.nsh`
- `services/tts/pyproject.toml`
- `services/tts/uv.lock`
- `services/tts/benchmarks/candidates/piper_1_4_2_cpu/`
- `services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/`
- `services/tts/src/voxleaf_tts/chatterbox_adapter.py`
- `services/tts/src/voxleaf_tts/chatterbox_service.py`
- `services/tts/release/optional/chatterbox/optional-package-manifest-v1.json`
- `services/tts/release/optional/chatterbox/source-manifest-v1.json`
- `package.json`, `pnpm-lock.yaml`, and `rust-toolchain.toml`
- `.github/workflows/`
- `.github/dependabot.yml` once introduced
- `README.md`, `SECURITY.md`, `LICENSE`, and future release notice/inventory
  artifacts
- [`docs/product/mvp.md`](../../product/mvp.md)
- [`docs/product/project-brief.md`](../../product/project-brief.md)
- [`docs/product/reader-settings-and-playback-controls.md`](../../product/reader-settings-and-playback-controls.md)
- [`docs/architecture/system-diagram.md`](../../architecture/system-diagram.md)
- [`docs/architecture/overview.md`](../../architecture/overview.md)
- [`docs/architecture/tts-support-matrix-v2.md`](../../architecture/tts-support-matrix-v2.md)
- [`docs/architecture/mvp-release-authority-v1.md`](../../architecture/mvp-release-authority-v1.md)
- [Hugging Face Hub download guidance](https://huggingface.co/docs/huggingface_hub/guides/download)
- [Hugging Face pickle-scanning guidance](https://huggingface.co/docs/hub/security-pickle)
- [PyTorch `torch.load` security guidance](https://docs.pytorch.org/docs/stable/generated/torch.load.html)
- [`docs/development/dependencies.md`](../../development/dependencies.md)
- [`docs/development/testing.md`](../../development/testing.md)
- [`docs/development/release-security-and-distribution.md`](../../development/release-security-and-distribution.md)
- [`docs/user/windows-release.md`](../../user/windows-release.md)
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
- Chatterbox acquisition is native-owned and manifest-closed. It uses HTTPS,
  full revision identity, an exact six-file model allowlist, frozen per-file
  cryptographic digests and byte sizes, bounded staging space, a versioned
  application-owned destination, and atomic promotion. Partial or cancelled
  artifacts are never eligible for deserialization or execution.
- Hugging Face supplies model data only. VoxLeaf does not download or execute
  Python, configuration scripts, plugins, or arbitrary repository contents
  from the model repository. The exact Chatterbox runtime remains a separate
  reviewed graph with a frozen three-part delivery identity. Publishing and
  clean-host validation must still pass before enabling acquisition.
- The application never resolves `main`, a mutable tag, the latest snapshot,
  or an arbitrary repository. It requests only the full frozen commit and six
  filenames, controls any cache beneath its staging root, and verifies the
  frozen expected SHA-256 and size after transfer regardless of transport
  metadata or Hugging Face scanning status.
- Opening Settings, checking compatibility, selecting a language, or restoring
  preferences cannot start a download. Only explicit confirmation in the
  acquisition UI may do so.
- Settings and narration startup feedback may expose only product-defined,
  content-free phases and bounded aggregate byte progress. They must not expose
  paths, URLs, raw host facts, book text, narration text, PCM, or a fabricated
  non-byte percentage or fixed cold-load duration.
- Optional-package installation does not automatically start a model or
  replace active narration. The existing identity-first profile switch occurs
  only after installation succeeds and the user explicitly activates the
  profile.
- No model or checkpoint supplied by an EPUB or arbitrary renderer value may
  be deserialized. Release artifacts come only from the frozen manifest.
- The installer and uninstaller must never discover or delete user books.
  Application-owned runtime/cache/configuration paths must be explicit and
  bounded before cleanup is implemented.
- Download cancellation removes only the current incomplete acquisition
  staging operation and never a verified installed package. Profile-selection
  cancellation remains absent until a rollback contract can restore preference,
  narration identity, service ownership, and recovery state safely.
- Splitting optional-package and preference choices in uninstall must preserve
  the exact owned cleanup roots.
  [ADR-0047](../../architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md)
  authorizes default interactive Chatterbox removal, default
  preference/recovery retention, and non-destructive silent uninstall without
  explicit bounded options. Any further destructive default or deletion-scope
  change requires new authority before implementation or measurement.
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

**Status:** Complete (2026-08-01). Checkpoints `16981cc` and `98a2971`
implement the deterministic payload and native verifier. The final
documentation/validation checkpoint is recorded with this plan update.

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

### Milestone 4A: Implement the withheld optional Chatterbox lifecycle

**Status:** Complete as a fail-closed foundation on 2026-08-01. The repository
contains one native-owned, content-safe lifecycle for the closed Chatterbox
profile, but no end-user acquisition has been authorized. The compiled manifest
is deliberately `withheld`: it has no downloadable URL, archive digest, or byte
claim, and opening Settings cannot create staging state or make a network
request. Milestone 4B owns the superseding official-source acquisition and all
real download/install evidence.

1. Freeze and check in the exact withheld optional-package and source manifests
   selected by Milestones 1 and 2: closed profile identity, version/revision,
   application-owned staging/install paths, licence/provenance references,
   supported host facts, exact runtime identities, and six model-file
   sizes/digests. No renderer-provided URL or path is accepted, and the
   withheld product manifest carries no downloadable artifact.
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
5. Prove the closed manifest, wrong hash, wrong size, truncation, traversal,
   stale version, insufficient disk, cancellation, process restart,
   incompatible hardware, and removal behavior without enabling a real network
   source. All failures remain content-free and leave Piper usable.
6. Commit the fail-closed implementation and content-safe deterministic
   evidence as a separate checkpoint. Carry real acquisition, package-size,
   installed bilingual, performance, and clean-host evidence into Milestone 4B.

**Actual results (2026-08-01):**

- `optional-package-manifest-v1.json` freezes the one profile identity,
  versions, languages, license/provenance references, app-owned layout,
  native hardware facts, service/adapter/lock identities, and a truthful
  `release-artifact-not-published` withholding state. A separate source
  manifest freezes six exact model artifacts and the minimal package contents;
  ignored `dist/` output prevents model, runtime, archive, or generated-audio
  leakage into Git.
- The native profile manager accepts only that compiled manifest and a closed
  profile ID. It owns confirmation, bounded HTTPS download, cancellation,
  exact size/SHA-256 verification, traversal/link-safe extraction, atomic
  promotion, verified runtime discovery, removal, and content-free errors. It
  independently rechecks the closed CUDA/BF16 host facts before acquisition;
  the renderer never provides a URL, executable, archive, digest, or path.
- Settings has a non-acquiring withheld state plus the confirmation, progress,
  cancel, explicit activation, and removal states needed after a real artifact
  exists. Current Piper narration is not switched by selection or acquisition.
- `pnpm.cmd package:chatterbox-optional:check-source`, focused Python builder
  tests, native integrity/cancellation/hardware-gate tests, and desktop client
  tests pass outside the automation sandbox. These tests prove the withheld and
  hostile-artifact boundaries; they are not installed-package or performance
  evidence.

The former requirement to build and publish one archive containing both runtime
and weights is not carried forward as the selected plan. Its hostile-archive,
state-machine, cancellation, cleanup, and fixed-identity tests remain useful
foundation evidence. Milestone 4B must supersede the transport/manifest shape
before enabling Download; until then Piper remains the only release-core
narration claim.

### Milestone 4B: Freeze and implement verified official Chatterbox acquisition

**Status:** Deterministic authority, implementation, and authorized runtime
publication complete on 2026-08-01; clean-host validation remains open. The
product manifest truthfully records the three published assets while remaining
`withheld`. Running a clean-user online/offline GPU matrix and closing the
remaining lifecycle/audit gates are required before Download may be enabled.
This milestone changes
distribution authority, not the evaluated Chatterbox profile or its bilingual
narration behavior.

ADR-0044 subsequently corrects product admission without rewriting evaluation
history: `5,632` MiB total and `4,668` MiB available dedicated VRAM are the
technical gates, and `7,680` MiB reported total (nominal 8 GB) remains the
recommended/evaluated class. Consent must disclose that distinction together
with measured peak, RAM/CPU, transfer, installed/staging, cold-load, and
licence facts.

1. Before changing acquisition code or producing results, accept an additive
   ADR and immutable authority that supersede only the single-archive portion
   of `mvp-release-authority-v1`. Preserve v1 and Milestone 4A as historical
   evidence. Freeze the trust, redirect/cache, cancellation, cleanup, runtime,
   model-deserialization, and result-lineage boundaries.
2. Freeze `ResembleAI/chatterbox` at full revision
   `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18` and exactly these six model-data
   files: `t3_mtl23ls_v3.safetensors`, `s3gen.pt`, `ve.pt`, `conds.pt`,
   `grapheme_mtl_merged_expanded_v1.json`, and `Cangjie5_TC.json`. Retain the
   existing per-file byte sizes and SHA-256 values. Reject mutable revisions,
   repository-wide snapshots, unexpected files, and renderer-supplied source
   data.
3. Freeze the separate runtime-delivery topology before implementation. The
   exact 79-package Windows/Python 3.12 graph, VoxLeaf service/adapter, CPython,
   Chatterbox, PerTh, and CUDA/PyTorch inputs must come from reviewed immutable
   origins and pass the existing lock/inventory/audit policy. The user must not
   need system Python, `pip`, Git, a development shell, or administrator rights.
   If no safe bounded runtime origin can be authorized, keep Chatterbox withheld
   and allow the Piper MVP to continue.
4. Replace the one-archive manifest with a closed multi-artifact manifest that
   separately identifies runtime and model data. Implement explicit consent,
   total and per-file byte ceilings, bounded concurrency, progress,
   cancellation, restart cleanup, app-owned cache/staging, and retry without
   sending EPUB text, narration text, audio, local paths, host identity, or
   credentials. A public model must not require or discover a user Hugging Face
   token.
5. Verify every downloaded file's name, byte size, and SHA-256 before it can be
   promoted. Load the principal T3 file through `safetensors` and retain
   `weights_only=True` for every approved `.pt` load site. Treat Hub malware and
   pickle scans as defense-in-depth, never as a replacement for VoxLeaf's frozen
   hashes or safe loader settings. Downloaded model repositories may supply no
   executable code.
6. Promote the complete verified runtime/model set atomically to the versioned
   application-owned profile root. Preserve separate explicit activation,
   existing narration identity, offline use, removal, and cleanup of all
   acquisition cache/staging state. An absent, declined, partial, corrupt,
   interrupted, stale, or removed profile must leave Piper usable.
7. Add deterministic tests for mutable-revision rejection, unexpected files,
   redirect/source substitution, wrong size/hash, truncated and oversized
   files, unavailable source, cancellation at each file boundary, restart,
   insufficient disk, duplicate cache state, atomic promotion, safe `.pt`
   loading, removal, and zero profile mutation before explicit activation.
8. From normal local PowerShell outside the sandbox, perform a real clean-user
   installation on a compatible Windows GPU host. Record total download,
   runtime/model installed bytes, peak staging/cache/free-space requirement,
   acquisition/remove time, offline restart, cold load, RTF, RAM, and VRAM;
   prove Spanish and English narration with external connectivity denied after
   installation.
9. Review licences, model card/provenance, notices, component inventory, and
   security/audit evidence for the exact acquired graph. Enable Download and
   change `withheld` only after all deterministic, exact-host, and clean-host
   gates pass; otherwise retain the fail-closed state and truthful limitation.
   Commit authority, implementation, and final evidence at separate logical
   checkpoints.

**Actual result:** Steps 1 through 7 are implemented and pass deterministic
validation. The v2 builder creates a runtime-only Windows/Python 3.12 payload
from the frozen 79-package graph, proves the approved safe model-load sites,
configures the private embedded runtime, excludes development/test material,
and reproducibly emits three parts beneath the frozen 1.9-billion-byte
per-part ceiling. Two builds produced identical archive, manifest, part, size,
and file-count evidence. The native controller downloads those parts and the
six exact official model files sequentially, closes redirect hosts/counts,
streams exact size/hash verification, reassembles and extracts with bounds,
discards verified parts before extraction, and atomically promotes only the
complete runtime/model set. The calculated peak staging use is
13,254,834,850 bytes, below the frozen 15,000,000,000-byte ceiling.

The publication portion of Steps 8 and 9 is complete. An authorized maintainer
published the three measured parts under
[`chatterbox-runtime-v2`](https://github.com/mmjosedaniel/voxleaf/releases/tag/chatterbox-runtime-v2),
and the checked-in manifest freezes their exact URLs, sizes, SHA-256 values,
archive identity, installed size, and runtime-manifest identity. Clean-user
acquisition and installed offline bilingual/runtime/resource evidence still
cannot be produced on this development host. The content-safe
[`runtime-package-evidence-v2.json`](../../../services/tts/release/optional/chatterbox/runtime-package-evidence-v2.json)
records the reproducible local result, successful public release, and explicit
remaining gates. This is now a clean-host blocker for optional Chatterbox only;
Piper core and the rest of M011 may continue independently.

### Milestone 5: Build the versioned Windows package and signing path

**Status:** Complete for the unsigned local package and signing automation.
Public signed publication remains externally blocked by the absence of an
authorized trusted certificate; clean-host acceptance remains Milestone 6.

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

Actual result on 2026-08-01:

- VoxLeaf now uses deliberate version `0.1.0`. Ordinary Tauri builds remain
  unbundled, while `tauri.release.conf.json` enables only a per-user Windows
  x64 NSIS target, embeds the WebView2 bootstrapper, disables automatic update
  and downgrade behavior, and uses the release title `VoxLeaf`.
- The exact installer resource map contains the desktop/service, verified
  `voxleaf-piper-core-v1` runtime, davefx/Spanish and joe/English voices,
  optional-acquisition authority, inventory, notices, licence, and user guide.
  Chatterbox runtime/weights, Qwen, benchmark tools, candidate environments,
  books, generated audio, and private artifacts are excluded.
- The first package build correctly stopped on a stale Piper manifest. Review
  found that release-builder modules and mutable installation metadata had
  entered the payload. The builder now excludes those non-product files, a
  regression test protects the boundary, and the regenerated deterministic
  core archive is `191,239,969` bytes with SHA-256
  `d8dffd398908b136e54009143a9e30d23af9f36dd1389198599be62a059bca81`.
- The unsigned installer
  `VoxLeaf_0.1.0_x64-setup.exe` is `181,654,713` bytes with SHA-256
  `9dcc7fea72dd3d4eefd3ae79c8045f968328e5fde0a29d25c244a12b8169473c`.
  Its application binary is `12,190,720` bytes with SHA-256
  `be44c22f10f0c31ef463e6e2b2a67177cd5cd0de1900561922fb7b5e67b27aee`.
- Local outside-sandbox lifecycle validation passed per-user installation,
  first start, same-version repair, uninstall, and preservation of an unrelated
  synthetic file. Silent uninstall preserves application data; interactive
  uninstall offers removal only for the exact VoxLeaf-owned data root. Cross-
  version replacement and clean-user application-data removal remain in the
  Milestone 6 clean-host matrix.
- The release script emits an adjacent SHA-256 file. Its signed mode accepts
  only an external certificate thumbprint and HTTPS timestamp URL, verifies
  Authenticode on both executable and installer, and never weakens the unsigned
  local path. No signing credential exists in the repository or current
  environment, so the measured package is explicitly `unsigned-local` and
  `publicPublicationAllowed: false`.
- Microsoft Defender reported no threats for the exact installer. SmartScreen
  was not observed, and no universal antivirus or reputation claim is made.
  The content-safe result is recorded in
  `apps/desktop/src-tauri/release/windows-package-evidence-v1.json`.
- Pull request #190 exposed two clean-runner closure defects after the local
  package result: the ordinary repository test still required the ignored,
  generated Piper `dist` directory, and the component inventory still recorded
  desktop version `0.0.0`. Static release validation now checks only tracked
  resources, while package construction separately requires and verifies the
  generated core. The regenerated inventory records version `0.1.0` and the
  current Cargo lock. Focused release/inventory checks plus complete portable
  and Windows repository gates pass outside the sandbox; the pull-request
  rerun remains the final CI confirmation.

### Milestone 6: Validate the clean-host portfolio and release matrix

**Status:** In progress. The exact-package rehearsal and deterministic release
matrix pass on the development host. An independent normal-user Windows host is
now available and its first run exposed the console-window defect fixed below;
the corrected core rerun is pending. A clean compatible-GPU host remains
unavailable. The separately identified validation installer completed explicit
Chatterbox download and verified installation on the maintainer's compatible
computer. Direct content-safe runtime and framed-service probes now reach model
load, warmup, and synthetic synthesis. The installed supervisor and exact
WebView2 Spanish matrix now also pass after the child-process path correction
described below. English narration, application restart, removal/reinstall,
Piper-after-removal, independent clean-host evidence, and public signing remain
open; optional clean-host readiness and public support are not inferred from
the development-host Spanish result.

The maintainer has no second compatible-GPU computer. ADR-0045 therefore
authorizes a separately identified, unsigned, local-validation-only installer
for the current compatible host. It must use a native compile-time feature and
the exact checked-in validation overlay, preserve every URL/hash/hardware/disk
gate, and keep the ordinary installer manifest `withheld`. Its results may fix
the acquisition flow and record development-host measurements, but they do not
become clean-host or public-release evidence.

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
8. Build the ADR-0045 validation-only package with a distinct Windows identity,
   prove that it alone exposes explicit Chatterbox consent, and execute the real
   installed lifecycle on the current compatible host. Keep its artifact local
   and unsigned, and preserve the independent clean-host blocker.

Actual result on 2026-08-01:

- Added a closed `--executable=<absolute installed executable>` input to the
  packaged WebView2 harness so release acceptance targets the installed binary
  rather than silently rebuilding or exercising the repository executable.
- The first installed run exposed four package-only defects. Native manifest
  hashing allocated a 1-MiB buffer on the stack and overflowed the application
  thread; the packaged interpreter wrote `.pyc` files into its verified tree;
  Windows returned the interpreter through a canonical `\\?\` path that did not
  compare equal to its ordinary runtime root; and the core builder could reuse
  an already installed stale local `voxleaf-tts` package. Hashing now uses heap
  storage, the supervisor disables bytecode writes, the Piper boundary safely
  normalizes only Windows verbatim prefixes for containment, and the builder
  explicitly reinstalls the current local package. Focused regressions protect
  all four behaviors.
- Regeneration after those fixes produced a 2,009-file Piper core measuring
  `281,213,569` installed bytes and `191,240,146` compressed bytes, with archive
  SHA-256
  `17fe3456bd7fca519b3e3b0c3b0bbf2579c733e13b660d740c5a56a0781f0843`.
  A later clean-host console-window correction produced an unsigned predecessor
  at `181,654,077` bytes with SHA-256
  `d207fec2cc29de31f86eab67dc4b3cd17c27ef6175cecf4b2ef3d4292b5ed895`.
  Correcting the stale Settings version label produced the current exact
  unsigned installer at `181,658,228` bytes with SHA-256
  `f167dacdb4221cdd989ed5ed92d070b5fd5d9ecab89a9af6e54feec5be3a6b12`.
- The exact installed Piper service completed first and repeated synthesis in
  both languages with zero generated `.pyc` files. The complete installed
  WebView2 portfolio matrix then passed for davefx/Spanish and joe/English:
  Quick start reached audible playback in `5,152` ms and `4,718` ms,
  respectively; warm prepared RTF was `0.12` and `0.11`; neither arm observed
  an underrun; all six `1.00x` through `0.75x` rates, Quick/Prepared modes,
  highlighting, leaf replacement, pause/resume, seek, chapter replacement,
  bounded cleanup, reduced motion, and forced colors passed. The arms recorded
  zero external requests, zero generated-audio files, zero dedicated-GPU use,
  and peak process-tree working sets of `1,120,894,976` and `1,142,972,416`
  bytes. Cancellation completed in `369` ms and `1,421` ms.
- Two consecutive exact installer cycles passed current-user installation,
  first start, same-version repair, uninstall, install-root removal, and
  preservation of an unrelated synthetic file. Microsoft Defender was enabled
  and reported zero detections for the exact installer; SmartScreen was not
  observed. The committed package evidence remains `unsigned-local` and keeps
  `cleanHostStillRequired: true`.
- The first independent Windows-host attempt installed and opened a public-
  domain book, but exposed a blank console whenever the packaged Piper child
  started. The GUI application was correctly built with the Windows subsystem;
  its private console-subsystem `python.exe` child lacked `CREATE_NO_WINDOW`.
  The supervisor now applies that flag to every supervised child while
  preserving piped protocol streams and Job Object cancellation. A Windows-only
  regression freezes the exact flag. The rebuilt installed Spanish Piper matrix
  passes with Quick start in `4,200` ms, warm prepared RTF `0.09`, zero
  underruns, zero external requests, zero generated-audio files, and cleanup in
  `694` ms. Its install/repair/uninstall lifecycle and exact Defender scan also
  pass locally. Visual absence of the console still requires confirmation by
  rerunning this rebuilt installer on the independent host.
- The independent-host Settings review also exposed a stale hard-coded
  `0.0.0 development build` label even though the package, Tauri configuration,
  and native crate are versioned `0.1.0`. Settings now reads the native package
  version through Tauri, bounds the displayed value, fails closed to a generic
  unavailable label, and has a focused regression proving `0.1.0` replaces the
  stale placeholder. The rebuilt installer and static package gate pass; this
  exact new hash still requires an independent-host UI recheck.
- `package:piper-core:check`, `package:windows:check`, both optional Chatterbox
  authority checks, the exact release audit, component-inventory check, and 12
  native optional-package hostile/integrity/cancellation/removal tests pass
  outside the sandbox. The audit retains the four already disclosed optional-
  graph blind spots instead of representing them as clean.
- Complete outside-sandbox repository validation passes: `check:portable` and
  `check` cover formatting, linting, generated contracts, type checks, 20 shared
  files/209 tests, 34 EPUB files/580 tests, 53 desktop files/518 tests, 16
  native-runner Node tests, 61 Rust tests, 384 Python tests, portable artifacts,
  the Tauri release executable, and Python source/wheel builds. The six Chromium
  reader/accessibility/reflow/synchronization smokes also pass. Existing non-
  failing Custom Highlight, JavaScript chunk-size, and pytest cache-write
  warnings remain. The final content-safe scan found no pending secret/private-
  path pattern, tracked prohibited book/audio/model artifact, or generated audio
  in application-owned roots. The canonical system diagram was reviewed and
  remains accurate because these fixes preserve the frozen runtime topology.
- This machine contains prior VoxLeaf development/application state and cannot
  prove absence of hidden prerequisites, first-ever user-data behavior, cross-
  version replacement, or explicit application-data removal. Windows Sandbox/
  Hyper-V are unavailable. The separate normal-user Windows arm is now underway,
  but its 4-GB-class GPU is below the Chatterbox gate. No compatible clean-GPU
  host is available, so no real Chatterbox download, bilingual offline
  narration, restart/removal, or Piper-after-removal result is admitted. The
  optional manifest therefore remains withheld with
  `clean-host-validation-pending`.
- Because that 4-GB host cannot run Chatterbox and no other compatible computer
  is available, ADR-0045 freezes a non-public validation route rather than
  weakening the ordinary package. The implementation adds a closed Cargo
  feature, exact additive overlay, separate Windows product/identifier/data
  root, separate NSIS uninstall boundary, static package checker, and focused
  default/feature-native tests. The canonical manifest remains `withheld`.
- `pnpm.cmd package:windows:chatterbox-validation` passed outside the sandbox,
  rebuilt the exact Piper core, compiled only the validation feature, produced
  `VoxLeaf-Chatterbox-Validation_0.1.0_x64-setup.exe` at `181,658,209` bytes,
  wrote SHA-256
  `91d48f2cf586a68048bb6520cde735ec271c580a4d3af58707c4ca19e945eb39`,
  confirmed it is unsigned, and completed a Windows Defender scan with no
  threats. The installer includes neither Chatterbox runtime nor weights. The
  real consent/download/activation/offline narration/restart/removal journey is
  now ready for maintainer execution on the current compatible computer; no
  result from that journey is recorded yet.
- The first installed UI inspection found that the native validation manifest
  correctly reported `absent`, but the renderer displayed only “not installed.”
  The confirmation and Download controls were reachable only from `confirming`,
  while no absent-state action invoked the already implemented native
  `select_optional_chatterbox` boundary. A focused regression reproduced the
  missing button. The minimal fix adds **Review Chatterbox download** for
  `absent`; it performs native hardware admission and reaches the existing
  disclosure without starting a network transfer. The corrected installer is
  `181,652,666` bytes with SHA-256
  `6b4d59a0f8a8dd53f5177efe034a3851cd14150bd3a4a67568a6811a00f22e26`;
  it remains unsigned and its exact Windows Defender scan reports no threats.
  The maintainer must reinstall this corrected artifact before continuing the
  real lifecycle.
- The next installed attempt reached explicit consent, but displayed neither
  transfer progress nor a progress bar and then terminated. The Windows
  Application log recorded `APPCRASH` with exception `c00000fd`, proving a
  native stack overflow rather than a model, GPU, or renderer failure. The
  optional controller still allocated five 1-MiB copy buffers on worker-thread
  stacks during hashing, download, extraction, and runtime reassembly even
  though the packaged Piper path had already moved its equivalent buffer to the
  heap. One shared heap-backed buffer factory now closes every optional-package
  copy path. A 256-KiB-stack regression proves hashing no longer overflows.
- The renderer also waited for the long-running native download command to
  return before it could observe `downloading`, so its existing polling loop
  never began during a real transfer. The explicit Download action now starts
  polling immediately, shows a bounded accessible `<progress>` element from the
  native byte counters, preserves verifying/cancel states, and does not expose
  URLs, paths, or payload content. The corrected local validation installer is
  `181,637,194` bytes with SHA-256
  `a22219872d96684725011acb90bfa6185bd8da80775182f9dec39224db789054`;
  it remains unsigned and Microsoft Defender reports no threats. The real
  download/install/activation/offline/removal journey still requires maintainer
  rerun and is not inferred from these focused fixes.
- Final implementation validation ran outside the sandbox. The normal and
  feature-enabled Rust suites each pass 63 tests; feature-enabled Clippy passes
  with warnings denied; the static validation-package and ordinary-package
  closure checks pass; and `check:portable` passes formatting, TypeScript/
  Python lint and types, 20 shared files/209 tests, 34 EPUB files/580 tests, 53
  desktop files/521 tests, 17 Node tests, 384 Python tests, and portable builds.
- The maintainer then completed the explicit Chatterbox download and verified
  installation on the compatible development host. The first narration attempt
  did not load Chatterbox: process observation showed that the supervised child
  still used Piper, while the UI retained a prior `recovery-available` episode.
  Installation and activation are intentionally separate, but the optional
  activation path did not clear recovery as the ordinary profile selector does.
  A focused failing regression reproduced the stale episode. Successful
  Chatterbox activation now resets it exactly once; rejected activation leaves
  recovery intact. Installed-state copy now explicitly instructs the user to
  activate the profile before narration. Nine focused renderer tests, the
  desktop typecheck, and the complete 53-file/523-test desktop plus 17-test
  native-runner suite pass outside the sandbox. The rebuilt unsigned validation
  installer is `181,628,621` bytes with SHA-256
  `c9de20363a329dd0f7e0bc8d66f8e795246f8c180dca5e32718d767cfc73971b`;
  Microsoft Defender reports no threats. This fixes activation handoff only;
  bilingual offline narration, restart, removal, and Piper-after-removal remain
  pending validation and are not inferred from installation.
  The existing Custom Highlight, bundle-size, and pytest cache-write warnings
  remain non-failing. The system diagram now distinguishes the validation
  package without changing the runtime trust boundary.
- The following installed UI attempts retained the Chatterbox selection but
  still returned the generic contained-recovery message before audible output.
  Direct framed service execution passed when given conventional Windows paths
  and failed during model load with `engine-failure` when given the canonical
  verbatim `\\?\` paths used by the native supervisor. Rust canonicalization
  was therefore correct for trust and containment but incompatible with the
  embedded Python/model-library child boundary. The fix retains canonical paths
  for native verification and strips only a Windows verbatim prefix when
  constructing the child command, including correct `\\?\UNC\` to `\\server\`
  conversion. A focused Windows regression passes, and the exact installed
  supervisor completes load, warmup, synthetic synthesis, and shutdown. Two
  unchanged cold runs took `29.61` and `82.34` seconds, demonstrating observed
  cold-run variability rather than a fixed startup duration.
- Native review found that snapshot, selection, availability, configuration,
  and service-start paths could each repeat complete verification of the same
  approximately 8.23-GB installed tree. The correction permits removal only of
  allowlisted interpreter-generated cache entries that are outside manifest
  authority, then performs complete hash verification of every authority file.
  A successful verification creates an exact-package receipt held only in the
  current native process. The receipt is never persisted, is invalidated by
  install/repair/removal, and is not reused when the authority key or observed
  path/size/modification-time stamp differs. It cannot outlive application restart; the first access in every new
  application process therefore performs the complete verification again. This
  avoids repeated content hashing under the MVP assumption that no hostile
  same-user process mutates the application-owned package during that run. The
  receipt does not replace the initial full hash authority and is not a
  boundary against a compromised current-user account.
- The final unsigned validation installer is `181,694,782` bytes with
  SHA-256
  `289c93e63d07e0001b667d964396ea5a611a5bf38f411f9158e92e829d35f148`;
  Microsoft Defender reports no threats for that exact file. Its exact installed
  WebView2 Spanish matrix passes: Quick command-to-audible is `45.990` seconds;
  Prepared startup is `82.096` seconds with `66.48` seconds retained; warm
  Prepared RTF is `1.23`; peak dedicated VRAM is `3,808` MiB; peak process-tree
  working set is `4,865,605,632` bytes; cancellation is `469` ms; cleanup is
  `756` ms; and the arm records zero generated files and zero external requests.
  This closes the Spanish development-host arm only. English narration,
  application restart, removal/reinstall, Piper-after-removal, independent
  clean-host evidence, and public signing remain pending.

### Milestone 6A: Close Chatterbox lifecycle feedback and uninstall behavior

**Status:** Planned. This corrective submilestone records requirements
discovered during installed-product review. It does not close or weaken any
Milestone 6 clean-host, optional-support, or public-signing gate, and this plan
update is not implementation evidence.

The objective is to let a user understand every long-running Chatterbox state,
interrupt work only where the underlying lifecycle can safely honor
cancellation, remove the optional package independently, and make an informed
Windows uninstall choice without confusing application-owned model data with
preferences or EPUBs. Preserve the native-owned manifest, integrity,
containment, atomic installation, one-child, protocol v1, and identity-first
cleanup boundaries.

1. Keep Settings structurally populated while a language/profile selection is
   pending. Preserve the current values and optional-package management surface,
   disable only conflicting actions, and announce a bounded content-free phase
   such as stopping narration, checking installed package state, or applying
   the profile. Use an indeterminate treatment for non-byte work and never
   fabricate a percentage or fixed duration.
2. Do not add a profile-selection Cancel action in this closeout. A selection
   may already have invalidated narration identity or begun preference/recovery
   changes. Cancellation becomes eligible only after additive authority and a
   rollback contract prove restoration of the prior profile, persisted
   preference, identities, service ownership, and recovery episode.
3. Keep Chatterbox package state distinct from profile selection. Whenever
   application-owned optional-package data exists, expose installed state,
   measured storage, active/inactive status, and a discoverable
   **Remove Chatterbox** action. Removal must first contain an owned service and
   then delete only the exact optional runtime, model, removable cache, and
   staging roots; it must leave Piper, preferences, reading progress, and EPUBs
   untouched.
4. Make the acquisition cancellation outcome explicit before download:
   cancelling download or verification removes the current operation's
   incomplete staging and partial files, retains no unsupported resumable state,
   and never removes a verified installed package. Determinate progress remains
   limited to bounded byte transfer; verification and removal use truthful
   indeterminate phases.
5. Distinguish first-Play startup from ordinary playback. Expose the most
   specific phase the current desktop/client boundary can prove: installed-
   package verification, combined local service/model startup where necessary,
   narration preparation, first-audio generation, buffering, then playing. If a
   separate model-load phase would require changing protocol v1, combine the
   phase instead of inferring it or silently widening this submilestone.
6. Before audible ownership, present the existing safe Stop path as
   **Cancel start** (or equivalent). Prove that it makes pending work stale
   before teardown, terminates or contains the child as applicable, releases
   retained audio/work, and cannot emit stale playback. Return to **Stop** once
   playback begins.
7. Separate the interactive NSIS choice for optional Chatterbox runtime/model/
   cache/staging from ordinary preferences and recovery state. Per accepted
   [ADR-0047](../../architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md),
   select Chatterbox removal by default and preference/recovery retention by
   default. State the consequence of each independent choice and preserve non-
   destructive silent uninstall unless `/REMOVE_CHATTERBOX_DATA=1` or
   `/REMOVE_PREFERENCES_AND_RECOVERY=1` selects its exact data class. The two
   options compose, and `/REMOVE_APP_DATA=1` remains the explicit compatibility
   option that selects both exact classes. Do not leave a residual model-manager
   executable; document same-product reinstall and removal when optional data is
   intentionally retained.
8. Keep the supported Windows uninstall route discoverable through
   **Installed apps** and the About/user guidance. Extend the existing package
   lifecycle validation rather than inventing a parallel uninstaller.
Validation is split by authority and every final command runs in a normal local
PowerShell session outside the managed sandbox:

```powershell
pnpm.cmd --filter @voxleaf/desktop test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features chatterbox-acquisition-validation tts_optional_chatterbox
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd package:windows:check
pnpm.cmd package:windows:chatterbox-validation:check
pnpm.cmd package:windows:lifecycle
pnpm.cmd test:tts:bilingual-portfolio-exact-host
```

Focused desktop tests must cover pending selection with stable content,
selection failure, generic versus Chatterbox startup phases, accessible live-
region behavior, **Cancel start**, installed/failed removal discovery, and copy
that matches native cancellation cleanup. Native tests retain cancel,
verification, promotion, busy-operation, exact-root removal, symlink/reparse,
and unrelated-data containment coverage. Extend the existing
`package:windows:lifecycle` implementation under that same command to exercise
both new silent data-class options independently and together, plus the legacy
full-data option; retain a manual interactive clean-host arm for the actual NSIS
choices and displayed consequences.

The compatible development-host and eventual clean-host arms repeat startup
cancellation, Spanish/English offline narration, restart, removal/reinstall,
Piper-after-removal, and application uninstall outcomes. Keep deterministic,
packaged, development-host, clean-host, and signed-public results separate.

Acceptance requires all of the following:

- Settings never becomes an unexplained blank region solely because a profile
  transition is pending, and assistive technology receives restrained phase
  updates.
- Every long Chatterbox start exposes a truthful content-free phase; supported
  cancellation leaves no stale playback, orphan process, generated-audio file,
  leaked path/content, or unbounded retained work.
- Visible download-cancellation copy and native behavior agree exactly: only
  the current incomplete staging operation is deleted.
- Installed or failed optional state gives the user a discoverable, contained
  removal route without making Piper or reader data unavailable.
- Installer/uninstaller UI and documentation distinguish optional-package data
  from preferences/recovery, apply the ADR-0047 defaults exactly, and prove
  install, repair, uninstall, reinstall, unrelated-file preservation, and each
  optional-data outcome.
- The affected Milestone 6 host/package arms are rerun after implementation;
  development-host UI evidence does not close clean-host or public readiness.

### Milestone 7: Record the MVP release decision and close validation

**Status:** Not started.

1. Reconcile product, architecture, setup, testing, troubleshooting,
   dependencies, security, system diagram, roadmap, support matrix, and release
   documentation with measured results.
2. Publish exact core/optional/excluded profiles, supported hardware, core
   installer size, optional download/installed/staging sizes, prerequisites,
   hashes, licences, vulnerability-audit limitations, startup/resource
   measurements, known limitations, lifecycle phase/cancellation semantics,
   optional-data uninstall choices, removal, and recovery behavior.
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

The Milestone 4A source check exists as
`pnpm.cmd package:chatterbox-optional:check-source`; its archive builder and
focused state-machine tests remain foundation evidence only. Milestone 4B must
add a distinct official-source acquisition validation command before a real
network-backed result may become acceptance evidence. Installer-lifecycle
commands remain Milestone 5 work.

Milestone 4A supplies deterministic tests for the withheld optional-acquisition
state machine and archive boundary. Milestone 4B must extend or replace them
before any network-backed host run with the exact-revision, six-file,
multi-artifact, cache, redirect, per-file integrity, safe-loading, and runtime/
model atomic-install cases above. Host evidence then uses only the frozen
synthetic bilingual corpus and records no URL containing user data, book text,
prepared text, PCM, local path, token, or raw host identity.

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
- **The official Hub changes transport/CDN behavior or becomes unavailable.**
  Freeze repository/revision/file identity rather than mutable delivery URLs,
  bound and review the necessary official transport path, and still require the
  repository SHA-256 and size after download. Fail closed and leave Piper usable
  instead of accepting an unreviewed redirect, mirror, or latest snapshot.
- **Official model hosting does not provide the complete runtime.** Keep model
  and runtime authority separate. If the locked runtime cannot be delivered
  without system tooling, an unaudited installer, or an unapproved origin,
  retain `withheld`; do not treat successful weight download as installation.
- **An approved `.pt` file remains a risky serialization surface.** Require the
  exact reviewed loader with `weights_only=True`, fixed hashes, and bounded
  resources. Prefer a future upstream `safetensors` replacement when compatible,
  but do not convert or substitute evaluated weights silently.
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
- **Profile-transition cancellation cannot restore a coherent prior state.**
  Omit the action unless a separately approved rollback contract restores the
  preference, active identities, service ownership, and recovery episode. A
  visible indeterminate phase and actionable failure are safer than partial
  rollback.
- **Progress copy overpromises cold startup.** Chatterbox cold load varies and
  existing boundaries may combine service and model startup. Expose only phases
  that the desktop can prove, never infer package paths or raw errors, and never
  present a fake non-byte percentage or fixed countdown.
- **Separating uninstall choices broadens deletion or creates orphaned data.**
  Preserve the exact current VoxLeaf-owned roots, require additive authority for
  any destructive default/scope change, test every silent flag and interactive
  choice, and document same-product reinstall-and-remove when data is retained.
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
- **2026-08-01:** Built `voxleaf-piper-core-v1` from the exact 15-entry lock,
  official CPython 3.12.10 embeddable runtime, Piper 1.4.2, and exact davefx/
  Spanish plus joe/English artifacts. The final deterministic payload contains
  2,011 files, measures 281,215,331 installed bytes and 191,241,682 compressed
  bytes, and records its ZIP SHA-256 as
  `b1438ded5e39bea518714f09af018ee558db9505bde285c9e90991c59f7e1497`.
- **2026-08-01:** Added fixed source/runtime manifests, safe bounded download
  for build inputs, traversal-safe extraction, atomic staging, partial cleanup,
  deterministic ZIP output, bilingual offline smoke, content-free failures,
  and self-checking package evidence. Removed dormant Piper server/download/
  training helpers and unused Qwen/Chatterbox service modules from the core.
- **2026-08-01:** Bundled the root/Python/Piper/espeak/voice/dependency notices,
  both exact voice model cards, and complete exact Piper plus espeak-ng source
  archives. The PyPI sdist alone was not treated as sufficient corresponding-
  source evidence because it does not carry the complete native/espeak build
  tree.
- **2026-08-01:** Added native fixed-path discovery relative to the installed
  executable. The trusted native binary embeds the exact runtime manifest and
  verifies its bytes, complete file set, sizes, SHA-256 values, path containment,
  and closed profile mapping before starting Piper. A missing payload may use
  the separately gated development environment; a present invalid payload
  fails closed and never accepts a renderer path.
- **2026-08-01:** Repeated the unchanged package build from normal local
  PowerShell and reproduced ZIP SHA-256
  `b1438ded5e39bea518714f09af018ee558db9505bde285c9e90991c59f7e1497`
  with identical compressed and installed bytes. The two offline smoke payload
  lengths varied, as audio synthesis output is not the archive authority; both
  remained positive 24-kHz payloads and no audio was persisted.
- **2026-08-01:** Closed Milestone 3 validation outside the sandbox.
  `pnpm.cmd audit:release`, `pnpm.cmd inventory:release:check`,
  `pnpm.cmd package:piper-core:check`, `pnpm.cmd check:portable`, and
  `pnpm.cmd check` passed. The complete gates include 20 shared files/209
  tests, 34 EPUB files/580 tests, 51 desktop files/515 tests, 12 Node native-
  runner tests, 46 Rust tests, and 365 Python tests plus formatting, lint,
  types, generated contracts, portable builds, the Tauri Windows release
  executable, and Python artifacts. The known non-failing Custom Highlight,
  bundle-size, and pytest cache-write warnings remain. Installer, optional-
  acquisition, signing, OS-level offline observation, and clean-host lifecycle
  commands remain inapplicable until later M011 milestones implement them.
- **2026-08-01:** Milestone 4A implemented the fail-closed native optional
  lifecycle, Settings controls, closed source manifest, hostile-archive checks,
  cancellation, atomic promotion, verified discovery, and owned removal. Its
  public manifest remains `withheld`, so no end-user network request is enabled.
- **2026-08-01:** After reviewing GitHub Release, object-storage, Google Drive,
  and official model-source options, selected a planned Milestone 4B that
  acquires only the six exact model-data files from the official revision-pinned
  `ResembleAI/chatterbox` Hugging Face repository. Runtime delivery remains a
  separate unresolved release input and must be frozen before code; this
  planning decision does not enable Download or claim installation evidence.
- **2026-08-01:** Reconciled the roadmap, product MVP/brief, architecture
  overview/system diagram, documentation index, and release-security boundary
  around the split official-model/separate-runtime plan. From normal local
  PowerShell outside the sandbox, `git diff --check`, relative Markdown-link
  resolution for all eight changed documents, and pending-diff private-pattern
  scanning passed. No code, manifest, dependency, runtime, download, model, GPU,
  installer, or clean-host test is applicable to this planning-only change.
- **2026-08-01:** Began Milestone 4B from merged Milestone 4A and accepted
  [ADR-0043](../../architecture/decisions/ADR-0043-freeze-verified-official-chatterbox-acquisition.md)
  plus immutable
  [Chatterbox acquisition authority v2](../../architecture/chatterbox-official-acquisition-authority-v2.md)
  before code or results. The authority selects a runtime-only deterministic
  archive split into sub-2-GiB assets under versioned VoxLeaf GitHub Release
  `chatterbox-runtime-v2`, plus the exact six files from the frozen official
  Hugging Face commit. It fixes sequential transfer, redirect, hash/size,
  staging, cancellation, safe-loading, atomicity, cleanup, lineage, and
  fail-closed publication gates. The checked-in product remains withheld until
  implementation and real release evidence pass.
- **2026-08-01:** Completed the deterministic Milestone 4B implementation. The
  v2 source/product manifests freeze the exact split topology; Python builds a
  runtime-only package from the frozen graph, verifies safe Chatterbox load
  sites, and emits a deterministic ZIP split into three bounded parts. Rust
  implements native-only sequential download, closed redirects, exact size and
  SHA-256 checks, cancellation, bounded reassembly/extraction, verified-part
  cleanup, complete-tree verification, atomic promotion, and owned removal.
  Fifteen focused Python tests and twelve focused Rust tests pass outside the
  sandbox, as do Ruff, mypy, Clippy, source authority, and acquisition authority
  checks.
- **2026-08-01:** Rebuilt the committed runtime twice with identical evidence:
  archive SHA-256
  `af6b4f46f6b21df02d30cdfe992f77f9bda68111edd9042cd32a619c6376aee6`,
  5,022,941,463 compressed bytes, 5,019,513,881 installed runtime bytes,
  12,669 files, and runtime-manifest SHA-256
  `cb5055580a28a0c97e50535a8317ea506081230b70e0099d8fe0194591e1c635`.
  With the six official model files, total transfer is 8,231,893,387 bytes,
  total installation is 8,228,465,805 bytes, and calculated peak staging is
  13,254,834,850 bytes. The initial measured flow would have retained runtime
  parts during extraction and exceeded the 15-billion-byte authority; verified
  parts are now removed before extraction, bringing the peak inside the frozen
  bound.
- **2026-08-01:** Published the three exact runtime parts after explicit user
  authorization under
  [`chatterbox-runtime-v2`](https://github.com/mmjosedaniel/voxleaf/releases/tag/chatterbox-runtime-v2).
  GitHub reports all three assets uploaded with the frozen byte sizes and
  SHA-256 digests. The repository records their immutable URLs and identities
  but retains `withheld` with `clean-host-validation-pending`; no clean-user
  online acquisition/offline bilingual matrix has run. No model weights,
  runtime archives, generated audio, book content, local paths, secrets, or
  user data enter Git.
- **2026-08-01:** Final deterministic validation passed from normal local
  PowerShell outside the automation sandbox. `pnpm.cmd audit:release` reported
  pass with the four already disclosed optional-graph advisory blind spots;
  `pnpm.cmd inventory:release:check`, both optional-manifest checks,
  `pnpm.cmd check:portable`, and `pnpm.cmd check` passed. The full gates include
  20 shared files/209 tests, 34 EPUB files/580 tests, 53 desktop files/518
  tests, 12 Node tests, 59 Rust tests, and 380 Python tests plus format, lint,
  type, generated-contract, portable, Tauri release, and Python package builds.
  The existing Custom Highlight, bundle-size, and pytest cache-write warnings
  remain non-failing.
- **2026-08-01:** The first portable run exposed that repository `mypy .`
  traversed the ignored 5-GB maintainer build output and type-checked embedded
  third-party Python. `services/tts/pyproject.toml` now excludes only the two
  application-owned release `dist` roots; the unchanged command then passed on
  159 VoxLeaf source files, and both complete gates passed afterward.
- **2026-08-01:** Accepted ADR-0044 after reviewing the already accepted v12
  capacity evidence. The current product registry and optional-package
  preflight now admit Chatterbox at `5,632` MiB total and `4,668` MiB free
  dedicated VRAM, retain `7,680` MiB as the recommended/evaluated class, and
  expose measured/minimum/recommended GPU plus CPU/RAM/storage facts in the
  explicit confirmation. Historical benchmark manifests and results remain
  unchanged.
- **2026-08-01:** Verified the public release through `gh release view`: it is
  neither a draft nor prerelease, all three assets report `uploaded`, and their
  byte sizes and SHA-256 digests match the frozen manifest. Outside-sandbox
  focused validation passed 24 TypeScript tests, 16 Python tests, 12 optional-
  controller Rust tests, 12 host-detection Rust tests, and both Chatterbox
  authority checks. `pnpm.cmd check:portable` and `pnpm.cmd check` then passed
  format, lint, type, 20 shared files/209 tests, 34 EPUB files/580 tests, 53
  desktop files/518 tests, 12 Node tests, 59 Rust tests, 381 Python tests,
  portable builds, the Tauri release build, and the Python package build.
  `pnpm.cmd audit:release` and `pnpm.cmd inventory:release:check` also passed;
  the four already disclosed optional-graph advisory blind spots remain.
- **2026-08-01:** Milestone 5 set the first package identity to `0.1.0` and
  added a release-only, current-user NSIS configuration. The exact resource map
  includes the bilingual Piper core plus release notices, inventory, optional-
  acquisition authority, and user documentation while excluding all
  Chatterbox/Qwen/model/benchmark/private content.
- **2026-08-01:** The first build stopped safely on a stale Piper manifest.
  Inspection found release-builder modules and mutable distribution metadata in
  the staged runtime. The production-closure builder and regression tests now
  exclude them; the regenerated deterministic core and verifier pass.
- **2026-08-01:** `pnpm.cmd package:windows` produced the unsigned
  `181,654,713`-byte `VoxLeaf_0.1.0_x64-setup.exe` with SHA-256
  `9dcc7fea72dd3d4eefd3ae79c8045f968328e5fde0a29d25c244a12b8169473c`.
  Outside-sandbox install, first-start, repair, uninstall, unrelated-file
  preservation, package closure, and Defender checks passed. SmartScreen was
  not observed. Clean-host and cross-version evidence remain Milestone 6.
- **2026-08-01:** Implemented a fail-closed signing path that consumes only a
  protected external certificate and timestamp URL, verifies both signatures,
  and emits the checksum/evidence. No credential is available locally, so the
  exact artifact remains an unsigned local/portfolio candidate and public
  publication stays externally blocked without blocking Milestone 6 work.
- **2026-08-01:** The first complete repository gate found that the new Node
  scripts relied on unconfigured `process` and `structuredClone` globals. The
  release script now imports `node:process` explicitly and the JSON-only test
  uses a JSON clone; this changes no package bytes or runtime behavior.
- **2026-08-01:** Final outside-sandbox `pnpm.cmd check` passed formatting,
  ESLint, Clippy, Ruff, TypeScript/Python type checks, 20 shared test files/209
  tests, 34 EPUB files/580 tests, 53 desktop files/518 tests, 15 native-runner
  Node tests, 59 Rust tests, 382 Python tests, Tauri release build, and Python
  source/wheel builds. `pnpm.cmd package:windows:check` and
  `pnpm.cmd package:piper-core:check` also passed. The signed command failed
  closed with `windows-release-signing-thumbprint-unavailable` after external
  signing variables were deliberately absent. Existing non-failing Custom
  Highlight, JavaScript chunk-size, and pytest cache-write warnings remain.
- **2026-08-01:** A final release rebuild exposed that native Defender status
  text was being captured alongside the function's fixed status token. The
  script now suppresses only that informational output and still treats the
  scanner exit code as authoritative. The final exact installer is
  `181,654,713` bytes with SHA-256
  `9dcc7fea72dd3d4eefd3ae79c8045f968328e5fde0a29d25c244a12b8169473c`;
  its Defender scan and exact-artifact lifecycle both pass. The final
  PowerShell parse, three focused Node tests, JSON/JavaScript format check, and
  package authority check also pass outside the sandbox.
- **2026-08-01:** Began Milestone 6 from the merged Milestone 5 release. Extended
  the native harness to accept one absolute installed executable and confirmed
  its model-free packaged WebView2/service lifecycle before exercising a real
  profile.
- **2026-08-01:** Installed-package validation exposed and fixed a native hash
  stack overflow, Python bytecode mutation of the verified package, Windows
  verbatim-path containment mismatch, and stale local-package reuse during core
  regeneration. The regenerated core and Windows installer identities are
  recorded in the Milestone 6 actual result and committed release evidence.
- **2026-08-01:** The installed Spanish and English Piper portfolio matrices
  passed outside the sandbox with all six rates, zero external requests, zero
  generated-audio files, bounded cleanup, and content-safe performance/resource
  measurements. Two consecutive installer/repair/uninstall cycles and the exact
  Defender scan also passed.
- **2026-08-01:** Deterministic Piper/core/Windows/optional authority, release
  audit, component inventory, and hostile optional-package gates pass. The
  development host is not clean; an independent normal-user Windows core arm is
  now underway, but no compatible clean-GPU host is available. Milestone 6
  therefore remains in progress and the Chatterbox manifest remains withheld;
  no local result is relabeled as clean-host acceptance.
- **2026-08-01:** Complete portable and Windows repository gates plus all six
  Chromium smokes passed outside the sandbox. A final content-safe privacy and
  tracked-artifact scan reported zero findings. The system diagram was reviewed
  and needs no topology change for the package-integrity fixes.
- **2026-08-01:** The first independent Windows-host run installed the unsigned
  candidate and opened a public-domain EPUB, then exposed a blank console for
  packaged Piper. Root cause was the missing Windows `CREATE_NO_WINDOW` child-
  creation flag. The minimal native fix, seven focused supervisor tests,
  rebuilt-package lifecycle, Defender scan, and complete installed Spanish
  Piper matrix pass outside the sandbox. Independent visual confirmation remains
  pending against installer SHA-256
  `d207fec2cc29de31f86eab67dc4b3cd17c27ef6175cecf4b2ef3d4292b5ed895`.
- **2026-08-02:** The first real validation-build Download attempt exposed two
  independent defects: the UI did not poll while the native command remained
  active, and native optional-package I/O retained five 1-MiB stack buffers.
  Windows recorded `c00000fd` for the resulting process termination. Progress
  is now visible and byte-bounded while the command runs; all optional copy
  paths use heap storage. Focused UI/native tests, the full 521-test desktop
  suite, the 63-test feature-enabled Rust suite, types, format, and feature
  Clippy pass outside the sandbox. The rebuilt unsigned validation installer is
  `181,637,194` bytes, SHA-256
  `a22219872d96684725011acb90bfa6185bd8da80775182f9dec39224db789054`,
  and its exact Defender scan reports no threats. Maintainer lifecycle rerun is
  still required.
- **2026-08-02:** The verified optional package then failed before synthesis for
  two independent packaging reasons. The published runtime omitted the two
  generated VoxLeaf protocol modules imported by the service, and the legacy
  profile root produced a 261-character Transformers path that existed through
  the Windows verbatim API but was invisible to the conventional file API used
  by embedded Python. Runtime/model hashes, CUDA availability, BF16 support,
  and the selected GPU capability passed, so this is not a model or hardware
  rejection. ADR-0046 retains the immutable published v2 parts, freezes a
  37,101-byte repository-owned two-file correction, migrates only the exact
  legacy manifest to `app-local-data/tts/cb/2`, and re-verifies the complete
  corrected tree. The failed probe had also written six Librosa/Numba cache
  files into the verified package; the migration removes only that known cache
  class and all future Numba cache writes go to the removable
  `app-local-data/tts/cb/cache` root. The longest measured final path is 218 characters. Focused
  Python and feature-enabled Rust regressions pass outside the sandbox. The
  rebuilt unsigned validation installer is `181,673,215` bytes with SHA-256
  `0bcd54de8881f855ea8a707c91a8b73554425699b7223ce9c33144149268c449`,
  and Defender reports no threats. Maintainer narration/lifecycle rerun remains
  required before this Milestone 6 arm can close.
- **2026-08-02:** A later installed-product rerun still returned contained
  recovery after explicit Chatterbox activation. The exact installed runtime
  separately passed content-safe Python, CUDA/BF16, model load/warmup, protocol
  handshake, synthetic synthesis, and shutdown probes, so the result does not
  reject Chatterbox or the host. Investigation found redundant complete-tree
  verification at several product coordination boundaries. The corrective
  design repairs only allowlisted generated bytecode/compilation cache entries,
  preserves complete SHA-256 verification for every authority-listed file, and
  reuses that successful result only through an in-memory process-lifetime
  receipt. No receipt is written to disk, and application restart requires a
  new complete verification. The rebuilt installed UI and lifecycle matrix have
  not yet run, so this is implementation/diagnostic evidence rather than a pass.
- **2026-08-02:** The remaining installed failure was a child-process path
  representation defect. Native verification correctly retained canonical
  Windows verbatim paths, but embedded Python/model loading failed with
  `engine-failure` when those `\\?\` paths crossed the child boundary; the same
  framed service passed with conventional paths. The supervisor now removes
  only the verbatim prefix for child program/current-directory/environment
  values, including UNC conversion, without weakening native containment. The
  focused Windows regression and exact installed supervisor lifecycle pass; the
  final unsigned `181,694,782`-byte installer (SHA-256
  `289c93e63d07e0001b667d964396ea5a611a5bf38f411f9158e92e829d35f148`)
  passes Defender, and its exact Spanish WebView2 arm passes with `45.990`-
  second Quick command-to-audible, `1.23` warm Prepared RTF, `3,808`-MiB peak
  VRAM, `4,865,605,632`-byte peak process-tree working set, `469`-ms
  cancellation, `756`-ms cleanup, and zero generated files/external requests.
  Milestone 6 stays in progress for English, restart, removal/reinstall,
  Piper-after-removal, clean-host, and public-signing gates.
- **2026-08-02:** Final review found that Settings refresh, explicit activation,
  and service discovery could overlap package cache repair and verification.
  Native package preparation/verification/promotion/removal is now serialized;
  renderer refreshes are deduplicated and stale asynchronous completions cannot
  overwrite newer profile state. Cache cleanup also rejects symlinks and Windows
  reparse points before deleting only allowlisted `.nbi`/`.nbc` files. The final
  installed Spanish matrix passes after a Piper-to-Chatterbox transition without
  a second activation or recovery state. This closes the reported activation/
  Play defect but does not close the remaining Milestone 6 arms. The native
  removal boundary also rejects an active download/verifier, and every recursive
  package cleanup rejects out-of-root junction/reparse targets. The package lock
  remains process-local; cross-process locking or single-instance enforcement is
  retained as release-hardening work before public optional-profile readiness.
- **2026-08-03:** Pre-push validation of a later maintainability branch exposed
  a deterministic default-feature Rust regression already present in `main`.
  `snapshot_at` had correctly stopped deleting staging during a read-only status
  refresh when package operations were serialized, but the explicit withheld
  `select_at` path had not inherited that cleanup. The existing test created an
  incomplete application-owned staging file and failed because it remained
  after selection. The bounded correction keeps snapshots read-only and moves
  cleanup to explicit selection under the existing installed-runtime lock. It
  removes only the exact contained Chatterbox staging root, leaves profiles and
  user EPUBs untouched, and does not enable acquisition or change release
  authority. Default and validation-feature focused tests each pass 20 cases;
  the complete gate passes with 72 Rust tests, and the six-case browser suite
  passes. Static package checks, the rebuilt Windows package, install/first-
  start/repair/uninstall lifecycle, final reinstall, and visible installed-app
  startup also pass. The exact rebuilt unsigned installer is `181,685,408`
  bytes with SHA-256
  `355226cfb390ee9e1a080e6ff04d1f8d1232813a2fa495eb3600ab6867284f82`.
  Defender was not run against this hash, SmartScreen was not observed, and
  clean-host plus public-signing acceptance remain open.
- **2026-08-03:** Product review identified release-facing gaps in Chatterbox
  removal discoverability, Settings transition feedback, first-Play cold-start
  feedback, download-cancellation explanation, and the combined application-
  data uninstall choice. Milestone 6A is added as planned work inside M011
  because these findings directly affect optional-package release readiness.
  The documentation records no implementation or acceptance result: the current
  controller behavior, one combined uninstall data choice, remaining Milestone 6
  arms, withheld manifest, clean-host blocker, and public-signing blocker remain
  unchanged. The canonical system diagram and architecture overview were
  reviewed and remain accurate because this planning change preserves process,
  protocol, storage-ownership, and runtime topology; implementation that changes
  one of those boundaries must update architecture and accept the required
  additive authority first.
- **2026-08-03:** The product owner approved the destructive-default decision
  before Milestone 6A implementation. ADR-0047 now additively supersedes only the
  combined uninstall data choice: interactive uninstall selects Chatterbox
  removal and reader-state retention by default, silent uninstall preserves both
  without an explicit bounded option, and the existing explicit full-data option
  remains compatible. This is accepted authority, not implementation evidence.

## Discoveries and decisions

- **Decision:** M011 absorbs the security audit; a separate M010.3 is not
  required because the findings concern packaging, distribution, licences,
  dependency closure, signing, and complete-MVP validation.
- **Decision:** M011 also absorbs the corrective lifecycle-feedback and uninstall
  closeout as Milestone 6A. A second ExecPlan or M012 would incorrectly defer
  release-readiness gaps discovered while M011 is still active.
- **Decision:** Milestone 6A does not expose profile-selection cancellation.
  Visible progress is required, but cancellation waits for explicit rollback
  authority that can restore preference, identity, service, and recovery state.
- **Decision:** ADR-0047 separates optional-package and preference choices in
  the NSIS journey only within the existing owned roots. Interactive uninstall
  selects Chatterbox removal and preference/recovery retention by default;
  silent uninstall preserves both classes without explicit bounded options.
  Any further destructive default or deletion-scope change requires new
  additive authority before implementation.
- **Decision:** The minimum distributable MVP is intentionally smaller than the
  local development matrix. This lowers installer, vulnerability, licence,
  GPU, and support risk without removing implemented engines from source.
- **Decision:** Chatterbox's portfolio value justifies one optional package,
  not an approximately 8-GiB expansion of the core installer. It is acquired
  only after explicit consent and activated only through a separate explicit
  action after verification.
- **Decision:** M011 does not republish the six Chatterbox model files inside
  one VoxLeaf-hosted archive. Milestone 4B acquires those exact files
  from the official Hugging Face repository at a full frozen commit and verify
  frozen expected size/SHA-256 values. This changes distribution provenance,
  not model identity or evaluation evidence.
- **Decision:** Direct official model acquisition does not authorize remote
  code. Runtime delivery, dependency execution, and model-data loading remain
  separate authorities; model repository content is data-only, principal
  weights use `safetensors`, and approved `.pt` inputs retain
  `weights_only=True`.
- **Decision:** The separately reviewed runtime is one deterministic runtime-
  only ZIP split into at most four sub-2-GB GitHub Release assets. The exact
  model files remain official Hugging Face downloads, so VoxLeaf neither
  republishes weights nor executes repository code.
- **Discovery:** The initial package build exposed Windows path-length risk and
  an incomplete embedded-Python search path. Short application-owned staging,
  removal of test/development-only payloads, and an explicit
  `Lib\\site-packages` entry in `python312._pth` make the private runtime
  executable without system Python while preserving the frozen graph.
- **Decision:** Published runtime-v2 release parts remain immutable. An exact
  legacy runtime may receive only the native-embedded correction frozen in the
  acquisition manifest, and only after complete legacy verification. The
  corrected package is fully re-verified at the shorter `cb/2` root; no unknown
  package is migrated or repaired, and no multi-gigabyte redownload is required
  for an already verified installation.
- **Decision:** Python bytecode suppression is insufficient for libraries that
  own separate compilation caches. Packaged Chatterbox redirects Numba cache
  writes outside the verified runtime into a profile-owned removable cache that
  removal deletes; migration cleans only the exact known `.nbi`/`.nbc` cache
  class before complete legacy verification.
- **Decision:** Interpreter-generated bytecode and compilation caches are
  derived transient data, never installed-package authority. Repair may remove
  only the frozen cache file classes under exact application-owned cache roots;
  it may not modify or excuse any manifest-listed runtime/model file, and the
  complete authority tree must still pass hashes before use.
- **Decision:** A successful corrected-package verification may be represented
  by one native in-memory receipt keyed to the exact package/manifest identity.
  The receipt is scoped to one application process, is never serialized, and is
  invalidated by installation, repair, or removal. An authority-key or observed
  tree-metadata mismatch prevents its reuse. It prevents repeated
  multi-gigabyte hashing during snapshot/activation/start in one run; it does
  not authorize trust across an application restart and does not claim
  protection from deliberate metadata-preserving tampering by another process
  running as the current Windows user.
- **Decision:** Canonical/verbatim Windows paths remain mandatory inside native
  trust and containment checks. Only when constructing the already-approved
  child process may the supervisor convert `\\?\C:\...` to `C:\...` and
  `\\?\UNC\server\share\...` to `\\server\share\...`, because the embedded
  Python/model stack does not reliably accept verbatim paths. No renderer input,
  path discovery, package authority, or containment comparison uses the
  converted representation.
- **Discovery:** Download, reassembled archive, extracted runtime, and model
  files cannot all coexist with the source parts under the 15-GB staging
  ceiling. Removing the verified runtime parts immediately after successful
  archive verification yields a calculated 13,254,834,850-byte peak without
  weakening retry cleanup or atomic promotion.
- **Decision:** Piper-core, optional-Chatterbox, and signed-public readiness are
  independent decisions. Failure of one narrows its claim without rewriting
  historical support evidence or automatically failing the others.
- **Decision:** Chatterbox's evaluated nominal 8-GB host is a recommendation,
  not its technical minimum. Product admission uses the `3,644`-MiB measured
  peak plus the frozen `1,024`-MiB reserve (`4,668` MiB available), together
  with a `5,632`-MiB total floor for 6-GB-class hardware. A passing gate does
  not invent separate lower-capacity clean-host evidence.
- **Decision:** Code signing is a public-publication gate, not a prerequisite
  for a private local build or recorded portfolio demonstration.
- **Decision:** Ordinary `pnpm build` remains unbundled. Only the explicit
  Windows release command merges the reviewed release configuration, limiting
  accidental installer creation and keeping development iteration unchanged.
- **Decision:** The first package is version `0.1.0`, Windows x64, current-user
  NSIS only. It embeds the Microsoft WebView2 bootstrapper, uses no updater,
  rejects downgrades, and documents manual signed version replacement.
- **Discovery:** Release assembly code and volatile package-manager metadata
  can enter an embedded Python payload unless the production closure excludes
  them explicitly. The Piper builder and tests now enforce that exclusion.
- **Decision:** Milestone 5 local lifecycle evidence is useful but does not
  substitute for Milestone 6. Clean-user prerequisites, cross-version
  replacement, full reader/narration behavior, optional acquisition, and
  application-data removal remain clean-host release gates.
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
- **Discovery:** The Piper PyPI sdist is not by itself the complete
  corresponding source for the shipped native phonemizer. The compliant core
  therefore carries the exact full Piper Git archive and the exact espeak-ng
  revision named by Piper's build configuration.
- **Decision:** Core discovery is native and fixed below the installed
  executable at `resources/tts/voxleaf-piper-core-v1`. The installed manifest
  must be byte-identical to native authority and every declared file must pass
  set, size, SHA-256, symlink, and root-containment verification before use.
- **Decision:** M011 Milestone 3 measures the standalone core payload, not the
  final installer. OS-level offline observation, per-user install/repair/
  uninstall, and full clean-host reader proof remain Milestones 5 and 6.
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
- **Discovery:** A repository build can pass while an installed immutable
  Python payload fails because Windows canonicalizes executable paths and the
  interpreter normally writes bytecode beside imported modules. Installed-
  artifact verification must therefore exercise the actual executable, disable
  runtime mutation, and retain exact tree verification across repeat runs.
- **Decision:** Current-host install and portfolio rehearsals are necessary
  package evidence but never substitute for a fresh normal-user OS state. Prior
  application data, developer tooling, caches, drivers, and WebView state make
  this host unsuitable for the clean-host claim even when every measured arm
  passes.
- **Discovery:** Redirecting a console-subsystem child's standard streams does
  not suppress its window when a Windows GUI parent has no console. Every
  packaged TTS child must additionally use `CREATE_NO_WINDOW`; switching to
  `pythonw.exe` is unnecessary and would complicate the frozen standard-stream
  protocol.

## Final validation

M011 is complete only when:

- every included artifact, runtime, voice, dependency, licence, source, and
  hash is identified and its obligations are fulfilled;
- every optional Chatterbox runtime artifact and each of the six official
  Hugging Face model-data files has the same evidence plus exact revision,
  consent, bounded download/cache, per-file verification, atomic installation,
  safe loading, process-receipt invalidation, offline-use, and removal lifecycle,
  or the download action and availability claim are absent;
- Settings and first-Play startup expose truthful accessible lifecycle phases,
  acquisition cancellation states its incomplete-staging cleanup, and supported
  startup cancellation leaves no stale audio or orphan service;
- installed optional-package removal remains independently discoverable, and
  Windows uninstall distinguishes optional-package data from preferences/
  recovery while preserving exact cleanup roots and unrelated files;
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
