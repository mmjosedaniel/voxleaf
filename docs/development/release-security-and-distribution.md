# MVP release security and distribution boundary

## Purpose

This document records the security and distribution boundary that roadmap
Milestone 11 must close. It is deliberately proportional to VoxLeaf's first
MVP and portfolio goal. It is not a security certification and does not claim
that the current unsigned installer is ready for general-public distribution.

M011 Milestones 1 through 5 are complete at their documented boundaries. The
result-blind
[`mvp-release-authority-v1`](../architecture/mvp-release-authority-v1.md) and
[ADR-0042](../architecture/decisions/ADR-0042-freeze-mvp-release-authority.md)
now govern the package topology, optional-profile lifecycle, threat model,
dependency/licence/integrity policy, cleanup ownership, and release claims
before implementation or package measurements. Milestone 2 closes the exact
dependency graphs, repeatable advisory checks, bounded update intake, and
content-safe component inventory. Milestone 3 adds the deterministic bilingual
Piper core, full notices/corresponding-source fulfillment, exact payload
measurements, offline process-level smoke, and native fixed-manifest verifier.
Milestone 4A adds the optional lifecycle and UI in a deliberately withheld
state. Milestone 4B accepts additive official-source authority, implements the
closed controller, and publishes the exact runtime parts; clean-host acquisition
evidence must still pass before any Download action is enabled. Milestone 5
builds the versioned unsigned local Windows package and implements the external-
credential signing path; clean-host acceptance and signed public publication
remain separate open gates.

## Current assessment

The current repository is suitable for controlled local development and a
maintainer-operated portfolio demonstration with trusted local runtimes and a
synthetic or public-domain EPUB. It is not yet ready to be presented as a
general public Windows download.

Existing implementation already provides substantial local protections:

- untrusted EPUB bytes pass bounded archive, XML, semantic, raster, and
  processing limits before application-owned rendering;
- publisher scripts, styles, remote resources, raw markup, and URLs do not
  enter the reader DOM;
- the Tauri surface has no plugins or capabilities and retains a restrictive
  content security policy;
- one native supervisor starts only exact profile identifiers through reviewed
  local interpreters and fixed modules, validates bounded framed input and
  audio output, and terminates the child process tree on invalidation or exit;
- narration text and generated PCM remain ephemeral, bounded, content-free in
  diagnostics, and are not persisted;
- tracked files contain no EPUB, generated audio, model weights, signing key,
  certificate, or private user data; and
- GitHub Actions use pinned action revisions, read-only repository content
  permission, and non-persisted checkout credentials.

These protections reduce risk but do not make the Python model process an
operating-system sandbox. An enabled TTS interpreter still runs with the
normal filesystem and network authority of the current Windows user. Offline
environment variables and local-only model APIs are defense in depth, not an
OS network block. Development firewall rules are maintainer setup and must not
become a manual prerequisite for ordinary end users.

## Audit snapshot before M011

The 2026-07-31 planning audit produced the following content-safe baseline:

- the locked production Node graph reported no known vulnerability at the
  selected audit level;
- the base Python service and exact Piper environment reported no known
  vulnerability in packages understood by the audit tool;
- the Qwen candidate environment reported known `transformers` advisories;
- the Chatterbox candidate environment reported known advisories in
  `diffusers`, `gradio`, `starlette`, and `transformers`; the product adapter
  does not start the Gradio or Starlette web surface, but unused vulnerable
  packages must not be shipped merely because they are transitively present;
- CUDA-specific Torch and Torchaudio builds and the local VoxLeaf package were
  not identified by the Python advisory service, so a clean result for those
  entries would not be evidence of absence; and
- the repository does not yet automate RustSec, per-runtime Python advisory
  checks, dependency update intake, or a shipped-component inventory.

These are planning observations, not permanent verdicts. M011 must repeat the
audits against the exact shipped graphs and record tool limitations. A package
may be retained only when it is required, its release use is understood, and
no known high or critical reachable vulnerability remains. Exceptions require
a narrow written reachability rationale, owner, and review date; silently
ignoring an advisory is not acceptable.

## Milestone 2 dependency closure

The 2026-08-01 production-graph checkpoint establishes:

- a 15-entry private core lock (14 installed distributions plus its virtual
  root) containing the VoxLeaf service, Piper 1.4.2, ONNX Runtime 1.27.0, and
  only their required protocol/runtime dependencies;
- a separate 79-package Chatterbox Windows/Python 3.12 lock derived from the
  exact bilingual local adapter path, with commit-pinned Chatterbox and PerTh
  archives plus exact CUDA 12.8 Torch/Torchaudio wheels;
- removal of Gradio, Starlette, FastAPI, Uvicorn, pre-commit, Matplotlib,
  TensorBoard, pandas, pykakasi, pyloudnorm, and other unused web/training/UI
  edges from the optional graph;
- `diffusers` 0.38.0 and `transformers` 5.5.0, both proven by exact local model
  load and bounded English/Spanish generation before admission to the lock;
- repository-owned `pnpm audit`, RustSec, and `pip-audit` orchestration against
  production Node, Windows-target Rust, base Python, Piper core, and optional
  Chatterbox identities;
- zero known vulnerabilities in components understood by those tools, 17
  frozen RustSec informational notices (five Windows-build-reachable
  unmaintained Unicode crates), and four explicitly recorded optional Python
  audit blind spots for URL-pinned Chatterbox, PerTh, Torch, and Torchaudio;
- bounded weekly dependency-update proposals with no automatic merge, signing,
  or publication authority; and
- a deterministic 400-record component/licence inventory covering production
  Node, Windows-target Rust, both Python graphs, exact voice/model artifacts,
  and excluded Qwen status.

The approximately 107.53-MiB Piper-core and 4.83-GiB Chatterbox virtual
environments are content-safe graph-smoke measurements, not release download,
installed, staging, or free-space promises. Final packaged artifacts and
licence/source fulfillment remain Milestone 4B work. The optional profile is
still unavailable to end users until those independent gates and acquisition
implementation pass.

## Minimum distributable MVP

The M011 release candidate separates a small core product from one optional
quality profile:

- Windows x64 is the only initial distribution target.
- Piper davefx/Spanish and Piper joe/English are the baseline distributable
  narration profiles because they are measured, CPU-compatible, comparatively
  small, and their candidate environments passed the planning audit.
- Chatterbox Spanish/English is the planned optional downloadable GPU quality
  profile. It is never silently downloaded or embedded in the core installer,
  and it becomes an end-user option only after its exact minimal dependency,
  advisory, licence, provenance, artifact, size, hardware, integrity,
  install/remove, and clean-host gates pass.
- Qwen remains available only through the documented development setup and is
  outside the first distributable product.
- The application starts with English as the product fallback while retaining
  explicit Spanish selection.
- Normal reading and installed-profile narration make no external request.
  Bundled Piper installation and optional Chatterbox acquisition must be explicit,
  reviewable, integrity-checked, and complete before the corresponding offline
  narration is offered. Silent model download is prohibited.
- The installer must not require the user to create firewall rules. Runtime
  processes run as the ordinary user, use no listener, accept no arbitrary
  interpreter/model path from the renderer, and retain the existing exact
  profile and process-tree containment.

The currently evaluated Chatterbox developer assets occupy approximately
8.02 GiB on disk: 5.03 GiB for the isolated environment and 2.99 GiB for the
model artifacts. More than 4.3 GiB of that environment is PyTorch. These are
local development measurements, not a promised download or installed-package
size. M011 must measure and disclose the final compressed download size,
installed size, temporary staging allowance, and required free-space margin
for the exact production package.

The selected Milestone 4B planning direction does not republish the six model
files in a VoxLeaf-hosted archive. VoxLeaf will request them from the official
`ResembleAI/chatterbox` Hugging Face repository at full revision
`5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18`. The separate approximately
4.83-GiB measured minimal runtime graph is not provided by that model
repository. Its exact delivery origin remains a required pre-implementation
authority decision; direct weight acquisition alone is not an installed
profile.

Selecting an available-but-uninstalled Chatterbox profile may open an
accessible acquisition confirmation. The confirmation must state that the
download is optional, identify the profile and languages, disclose measured
download/storage and hardware requirements, link the applicable notices, and
offer explicit Download and Cancel actions. Declining or cancelling must not
change the selected working profile, stop valid narration, or contact the
network. After a successful verified install, the user explicitly activates
Chatterbox; installation alone must not replace an active narration identity.

This profile is a scope decision for M011, not a change to the implemented
M010.1 support matrix. Development-only and supported local profiles remain
truthfully documented; the release payload may intentionally contain fewer
profiles than the development repository.

## Mandatory M011 gates

The following work is required before the corresponding release claim:

1. **Frozen payload and threat model — complete.**
   [`mvp-release-authority-v1`](../architecture/mvp-release-authority-v1.md)
   records the exact application, service, runtime, voice, model, acquisition,
   network, persistence, cleanup, and privilege boundaries before packaging.
2. **Shipped dependency closure — complete for the core; optional package
   remains separately gated.** Audit the locked Node, Rust, base Python,
   and every included or downloadable profile graph; remove unused runtime/web
   packages;
   enable automated dependency-update intake; and produce a content-safe
   shipped-component and licence inventory. A formal enterprise-grade SBOM is
   desirable but is not a blocker if the versioned inventory contains the
   same release-relevant identity, version, source, licence, and hash data.
3. **Licence and provenance fulfillment — complete for Piper core; optional
   package remains separately gated.** Preserve the repository MIT notice
   and satisfy Piper GPL-3.0-or-later and bundled phonemizer obligations,
   corresponding-source or other applicable GPL mechanics, voice model-card
   and CC0 provenance, and every runtime notice. The root MIT licence does not
   replace third-party terms. Profiles excluded from the payload must not be
   represented as redistributed.
4. **Integrity and offline behavior — core payload mechanics complete;
   OS-level release observation remains open.** Pin every shipped or deliberately
   acquired artifact, verify its digest before use, prevent path substitution,
   retain zero silent runtime download, and prove normal reading/narration with
   external connectivity unavailable.
5. **Windows package lifecycle — local path complete; clean-host replacement
   remains open.** The versioned per-user package documents size and
   prerequisites and passed local install, first start, same-version repair,
   uninstall, exact-root cleanup behavior, and unrelated-file preservation
   without a development shell, administrator-created firewall rule, or
   repository checkout. Cross-version replacement and destructive application-
   data removal remain isolated to Milestone 6's clean host.
6. **Clean-host product validation.** On a normal Windows host, exercise
   installation, first start, synthetic/public-domain EPUB open, English and
   Spanish narration, restoration, all admitted playback rates, cancellation,
   profile/language changes, failure containment, application restart,
   uninstall, privacy, accessibility, resource bounds, and the existing
   hostile-EPUB regression boundary.
7. **Truthful release decision.** Publish supported hardware, exclusions,
   startup/resource measurements, known limitations, dependency-audit status,
   hashes, licences, troubleshooting, and recovery behavior. A failed gate
   narrows or blocks the claim instead of being relabeled as support.

## Implemented Windows package and signing path

VoxLeaf `0.1.0` has a release-only Windows x64 NSIS configuration. It installs
for the current user, includes the exact verified Piper Spanish/English core,
embeds Microsoft's WebView2 bootstrapper, rejects downgrades, and includes no
automatic updater. Ordinary development and repository builds remain
unbundled. The exact resource allowlist excludes Chatterbox runtime/weights,
Qwen, benchmark tools, candidate environments, books, audio, and private data.

The current measured unsigned local installer is `181,685,408` bytes with
SHA-256
`355226cfb390ee9e1a080e6ff04d1f8d1232813a2fa495eb3600ab6867284f82`.
The current hash passes the static release-package gate, local install/first-
start/repair/uninstall lifecycle, final reinstall, and visible installed-start
smoke outside the automation sandbox. An exact predecessor passed the installed
bilingual portfolio matrix and Microsoft Defender, but Defender was not run
against the current hash. SmartScreen was not observed, so no reputation claim
is made. Independent clean-host checks and signing remain required. This is
content-safe development-host evidence, not clean-host or public-release
acceptance.
The optional Chatterbox manifest remains withheld until a separate compatible
clean-GPU host passes download, offline bilingual narration, restart, removal,
and Piper-after-removal validation.

An independent Windows-host attempt exposed a visible blank console for the
private Piper child. The rebuilt candidate now starts every supervised child
with Windows `CREATE_NO_WINDOW` while retaining the same pipe protocol and Job
Object termination boundary. Local installed narration, lifecycle, and Defender
validation pass for the corrected artifact; independent visual confirmation is
still required before the clean-host core gate closes.

The signing command accepts only an externally protected certificate
thumbprint and HTTPS timestamp URL. It emits the release configuration outside
Git, verifies Authenticode on the executable and installer, and writes the
adjacent checksum. No credential is committed or logged. Because no trusted
certificate is currently authorized, the exact measured artifact remains
`unsigned-local` and public publication is blocked. See the
[Windows package guide](../user/windows-release.md) for installation,
replacement, removal, and verification behavior and the
[official Tauri Windows installer documentation](https://v2.tauri.app/distribute/windows-installer/)
and [code-signing documentation](https://v2.tauri.app/distribute/sign/windows/)
for the upstream platform mechanisms.

## Optional Chatterbox acquisition boundary

Chatterbox is part of the M011 portfolio direction only as a separately gated
optional package. The Piper core release does not inherit a failure in this
package, and a passing local Chatterbox evaluation does not by itself authorize
redistribution.

Before the application may offer **Download and enable Chatterbox**, M011 must:

1. derive a production lock from the exact adapter imports and runtime behavior
   rather than copy the 8.02-GiB benchmark environment;
2. exclude dormant Gradio and Starlette web surfaces unless direct production
   evidence proves they are indispensable, and resolve, replace, or explicitly
   block publication for relevant `diffusers` and `transformers` advisories;
3. verify the Chatterbox code, model, tokenizer/codec, conditioning/default
   voice, watermarking/runtime components, and every redistributed artifact's
   licence, source revision, model card, provenance, and commercial-use terms;
4. accept an additive authority before implementation that supersedes only the
   historical single-archive acquisition shape. Freeze the official model
   repository, full commit, six filenames, per-file sizes/SHA-256 values,
   transport/cache boundary, safe loader behavior, and the separate immutable
   runtime-delivery origin;
5. download only `t3_mtl23ls_v3.safetensors`, `s3gen.pt`, `ve.pt`, `conds.pt`,
   `grapheme_mtl_merged_expanded_v1.json`, and `Cangjie5_TC.json` from that
   frozen official revision. Never resolve `main`, accept renderer-provided
   source data, download a repository-wide snapshot, execute Hub code, or
   require a user Hugging Face token for the public model;
6. download runtime and model artifacts through the native acquisition boundary
   into bounded application-owned cache/staging, verify every name, size, and
   cryptographic digest before use, reject source/redirect substitution, and
   install only the complete set by atomic versioned promotion. Cancellation
   removes the current operation's entire incomplete-staging tree and partial
   files, returns to absent, retains no unsupported resumable state, and never
   mutates a verified installed package, books, preferences, or other user files;
7. retain `safetensors` loading for the principal T3 weights and
   `torch.load(..., weights_only=True)` for each approved `.pt` load site.
   Treat Hugging Face malware/pickle scanning as defense-in-depth, not local
   integrity or safe-deserialization authority;
8. expose bounded byte progress, truthful indeterminate verification/removal
   phases, cancellation outcome, retry, failure, installed version, storage use,
   notices, and discoverable profile removal in accessible product UI. Keep
   Settings populated during transitions and do not fabricate a non-byte
   percentage or fixed cold-load duration;
9. prove that normal EPUB reading and both Piper voices remain usable while the
   package is absent, declined, cancelled, corrupt, incompatible, or removed;
10. prove installed Chatterbox Spanish/English narration offline on a compatible
    clean Windows GPU host, with one service tree, existing cancellation and
    memory bounds, no generated-audio persistence, and truthful cold-load and
    resource disclosure; and
11. remove the optional package and its application-owned staging/cache state
    without deleting the desktop application, preferences, reading progress, or
    user EPUBs; and
12. follow accepted
    [ADR-0047](../architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md),
    which preserves the exact owned cleanup roots and separates optional-package
    retention from ordinary preferences/recovery.
    Interactive uninstall selects Chatterbox removal and reader-state retention
    by default; silent uninstall preserves both classes without an explicit
    bounded option. The separate silent options are
    `/REMOVE_CHATTERBOX_DATA=1` and
    `/REMOVE_PREFERENCES_AND_RECOVERY=1`; `/REMOVE_APP_DATA=1` remains the
    explicit composition of both. Any further destructive default or deletion-
    scope change requires new authority before implementation or measurement.

**Current M011 Milestone 4B status:** the repository implements the native-owned
state machine and v2 closed multi-artifact controller. It fixes the exact six
official model URLs at one full revision, separately identifies three bounded
runtime parts, closes redirect hosts/counts, streams exact size/SHA-256
verification, cancels and cleans partial state, safely reassembles/extracts,
verifies approved model-load sites and the complete installed tree, and promotes
only a complete versioned profile. It never executes model-repository code or
accepts renderer-supplied network/path authority.

The deterministic runtime-only builder produces the same 5,022,941,463-byte
archive and three part hashes across two builds. Those published v2 assets stay
immutable. Aggregate download is 8,231,893,387 bytes. After the exact local
closure correction in ADR-0046, aggregate installation is 8,228,503,309 bytes;
calculated peak staging remains bounded by 13,254,834,850 bytes after verified
parts are discarded before extraction. These are local package facts, not
end-user availability evidence.
The checked-in v2 manifest remains `withheld` even though the exact three
runtime parts are published under `chatterbox-runtime-v2`: clean-user online
acquisition, offline bilingual narration, removal, reinstall, licence/audit,
and resource gates have not run. This is a fail-closed clean-host blocker for
optional Chatterbox, not a failure of the Piper core or an authorization to
claim Download works.

### Implemented M011 Milestone 6A lifecycle closeout

The native controller already owns bounded transfer progress, cancellation,
partial-staging cleanup, atomic promotion, verification, and contained package
removal. Milestone 6A does not reopen those authorities. It makes their user-
visible consequences complete before the affected Milestone 6 host evidence is
repeated:

- Settings must retain its structure and announce a real content-free phase
  while profile selection or installed-package inspection is pending. The first
  closeout omits selection cancellation until a rollback contract exists.
- First Chatterbox Play must distinguish installed-package verification,
  combined service/model startup where that is the truthful boundary, first-
  audio generation, buffering, and playback. Before audible ownership, the
  identity-safe Stop action is presented as startup cancellation and must leave
  no stale audio or orphan service.
- Acquisition copy must say that cancelling download/verification removes the
  current incomplete staging operation and does not remove a completed package.
- Installed optional-package state and **Remove Chatterbox** must remain
  discoverable independently of the selected profile. Removal still targets
  only the exact runtime/model/cache/staging roots and leaves Piper plus reader
  data intact.
- The NSIS journey must distinguish optional-package data from preferences and
  recovery state.
  [ADR-0047](../architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md)
  selects optional Chatterbox removal and reader-state retention by default,
  retains non-destructive silent uninstall without an explicit bounded option,
  and requires the consequence of each independent choice to be shown. Users
  who intentionally retain optional data receive a supported reinstall-and-
  remove route. VoxLeaf does not leave a residual model-manager executable.

The user-visible behavior, split NSIS authority, and focused regressions are now
implemented. Both unsigned local product identities build and pass static
package checks plus a development-host lifecycle matrix covering first start,
repair-time data preservation, default preservation, each data class alone,
both explicit classes, the legacy combined option, invalid-value preservation,
and unrelated-file containment. Chatterbox remains withheld: interactive NSIS
confirmation on a normal-user clean host, the independent optional-support
matrix, and public-signing gates have not been closed by that local automation.

ADR-0045 permits one compile-time, separately identified validation build on
the maintainer's only compatible computer. Its exact overlay supplies the
measured disclosure fields and `downloadable` state without changing the
canonical manifest, URLs, hashes, limits, hardware gate, or normal package.
This path remains unsigned and local-only, uses a distinct application-data
root, and cannot be attached to a public release or counted as clean-host
evidence. No renderer flag, environment override, arbitrary URL, or bundled
Chatterbox payload is introduced.

The first real Download attempts on that local validation build exposed two
package-only defects rather than a Chatterbox model failure. The renderer did
not poll native progress until the long-running command returned, and the
native optional-package path allocated 1-MiB buffers on worker-thread stacks;
Windows recorded stack-overflow exception `c00000fd`. The corrected build polls
as soon as explicit consent starts the operation, displays an accessible
byte-based progress bar, and uses heap-backed buffers for hashing, transfer,
extraction, and runtime reassembly. The current unsigned local validation
installer is `181,637,194` bytes with SHA-256
`a22219872d96684725011acb90bfa6185bd8da80775182f9dec39224db789054`;
Microsoft Defender reports no threats for that exact file. This correction does
not relax the validation-only boundary: a maintainer rerun of the complete
download, activation, offline narration, restart, removal, and Piper fallback
journey is still required before any optional-profile readiness decision.

The subsequent explicit download completed and installed the verified package,
but installation did not itself select Chatterbox, as required by the frozen
identity boundary. A separate UI defect made that distinction harder to recover
from: optional activation selected the profile but did not reset an existing
narration recovery episode, so the compact bar could remain on **Restart local
narration** while Piper was still the supervised child. Successful optional
activation now performs the same recovery reset as ordinary profile selection,
failed activation preserves the existing failure, and Settings states clearly
that an installed package must still be activated. This correction neither
auto-activates downloaded code nor weakens the explicit-consent boundary. The
resulting unsigned local validation installer is `181,628,621` bytes with
SHA-256
`c9de20363a329dd0f7e0bc8d66f8e795246f8c180dca5e32718d767cfc73971b`;
its exact Microsoft Defender scan reports no threats.

The next installed narration attempt proved that download verification and
hardware admission were not the failing boundary. The installed runtime and
model artifacts passed their hashes; Torch reported CUDA and BF16 available on
the selected GPU. Service import then failed because the published runtime had
omitted two generated VoxLeaf protocol modules. Supplying those modules exposed
a second independent Windows issue: a required Transformers file existed but
its historical installed path was 261 characters, beyond the conventional API
limit used by the embedded Python stack. [ADR-0046](../architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md)
keeps every published runtime-v2 part immutable, moves an exact legacy package
to `app-local-data/tts/cb/2`, adds only the two hash-frozen repository modules,
and fully verifies the corrected tree. The longest measured final path is 218
characters. Existing verified downloads are repaired locally without another
network transfer; unknown manifests or files fail closed. Model cold load and
the initial multi-gigabyte integrity pass can still take tens of seconds and
must remain visible rather than being described as an instant activation.
The same failed probe created six Librosa/Numba `.nbi`/`.nbc` cache files inside
the verified runtime despite Python bytecode suppression. Migration removes
only that known cache class before legacy verification, and subsequent service
children receive `NUMBA_CACHE_DIR=app-local-data/tts/cb/cache`. Chatterbox
removal owns that transient cache; it never contains EPUB text or generated
audio.
The corrected unsigned validation installer is `181,673,215` bytes with
SHA-256
`0bcd54de8881f855ea8a707c91a8b73554425699b7223ce9c33144149268c449`;
Microsoft Defender reports no threats for that exact file. Installed narration
and the remaining lifecycle arms still require maintainer confirmation.

The next installed-product attempt kept the Chatterbox profile selected but
still returned contained recovery before audible narration. Direct framed
service execution passed with conventional Windows paths but failed model load
with `engine-failure` when given the canonical verbatim `\\?\` paths supplied
by the native supervisor. Canonicalization remains correct for native trust and
containment. The corrected supervisor strips only the verbatim prefix at the
child-process construction boundary, including `\\?\UNC\` conversion, and
retains canonical paths everywhere authority is discovered or checked. A
focused Windows regression passes, and the exact installed supervisor completes
load, warmup, synthetic synthesis, and shutdown. Two unchanged cold runs took
`29.61` and `82.34` seconds, which records cold-run variability rather than a
fixed initialization duration.

The correction preserves the immutable package authority while separating it
from derived runtime caches. Only allowlisted interpreter-generated bytecode or
compilation cache entries under exact application-owned cache locations may be
removed; no authority-listed runtime/model file may be modified, skipped, or
accepted by path alone. The complete corrected manifest and every listed file
are size/SHA-256 verified before the process receipt is created. A successful complete verification may then be
represented by one receipt in native process memory, keyed to the exact package
and manifest identity. That receipt is never persisted, is invalidated by
install/repair/removal, is not reused when its authority key or observed tree
metadata differs, and disappears when VoxLeaf exits.
Consequently, every application process performs one full integrity pass before
first Chatterbox use, while repeated Settings snapshots, activation, and start
checks in the same run need not hash the approximately 8.23-GB tree again.
Later checks compare the exact authority key and tree metadata rather than
rehashing every file byte. This detects ordinary additions, removals, size or
timestamp changes, and containment violations, but is not tamper-evident
protection against malicious same-user mutation or a time-of-check/time-of-use
race. VoxLeaf does not claim protection once another process running as the
current Windows user is compromised.

Activation remains a separate explicit action and does not start or preload the
model. The first narration start in an application process may therefore still
include the disclosed cold model load after integrity verification. The rebuilt
final unsigned validation installer is `181,694,782` bytes with
SHA-256
`289c93e63d07e0001b667d964396ea5a611a5bf38f411f9158e92e829d35f148`;
Microsoft Defender reports no threats for that exact file. Its exact installed
Spanish WebView2 matrix passes with `45.990`-second Quick command-to-audible,
`82.096`-second Prepared startup with `66.48` seconds retained, `1.23` warm
Prepared RTF, `3,808` MiB peak VRAM, `4,865,605,632` bytes peak process-tree
working set, `469`-ms cancellation, `756`-ms cleanup, and zero generated files
or external requests. English narration, application restart (including fresh
verification), removal/reinstall, Piper operation after removal, independent
clean-host evidence, and public signing remain open before optional-profile
readiness can be claimed.

Hugging Face documents full-commit downloads, per-file downloads, filtered
snapshots, and application-selected cache/local directories. VoxLeaf uses the
full-commit and exact-file concepts but retains its own post-download
size/SHA-256 verification and application-owned cleanup. Hugging Face also
warns that Pickle deserialization can execute code and that its scanning is not
complete trust authority; PyTorch similarly warns against untrusted
`torch.load` inputs. These upstream controls justify defense in depth, not
blind trust:

- [Hugging Face Hub download guidance](https://huggingface.co/docs/huggingface_hub/guides/download)
- [Hugging Face pickle-scanning guidance](https://huggingface.co/docs/hub/security-pickle)
- [PyTorch `torch.load` documentation](https://docs.pytorch.org/docs/stable/generated/torch.load.html)

The current exact-host evidence remains useful capacity input: approximately
0.52-0.54 sustained RTF, greater-than-30-second cold load, about 4.88 GiB peak
process-tree RAM, and about 3.56 GiB dedicated VRAM. M011 must repeat the
applicable measurements against the exact production package; it must not
present the benchmark environment's figures as release-package proof.
ADR-0044 uses the existing result-blind capacity reserve rather than treating
the evaluated GPU size as model consumption. Optional acquisition now requires
`5,632` MiB total and `4,668` MiB available dedicated VRAM, recommends the
evaluated nominal 8-GB class, and discloses the `3,644`-MiB measured peak. A
passing lower-class gate is an admission result, not a claim that every 6-GB
GPU/driver combination completed clean-host validation.

Authoritative licence inputs for the current baseline include the exact
[`piper-tts` 1.4.2 package record](https://pypi.org/project/piper-tts/1.4.2/),
the
[`OHF-Voice/piper1-gpl` source repository](https://github.com/OHF-Voice/piper1-gpl),
and the exact
[`davefx`](https://huggingface.co/rhasspy/piper-voices/blob/0d907f158acc877ddeebcbf827659ee13bea8bcd/es/es_ES/davefx/medium/MODEL_CARD)
and
[`joe`](https://huggingface.co/rhasspy/piper-voices/blob/0d907f158acc877ddeebcbf827659ee13bea8bcd/en/en_US/joe/medium/MODEL_CARD)
voice model cards. Milestone 3 pins and bundles these exact revisions plus the
repository licence declaration. This record is not legal advice; newly
ambiguous redistribution terms require maintainer or qualified legal review
before publication.

## Portfolio and public-distribution gates

M011 has two honest completion levels:

### Portfolio-ready local MVP

A locally built package or maintainer-operated demo may be used in a portfolio
after the mandatory functional, privacy, dependency, licence, and clean-host
checks pass. If it is unsigned, it must be described as a local development or
portfolio build and must not be offered as a trusted general-public installer.
A video, screenshots, and sample flow must use synthetic, self-authored, or
public-domain content rather than copyrighted private books.

Portfolio readiness has two separately reportable profile levels: the Piper
core MVP and the optional Chatterbox quality package. If Chatterbox's gates do
not pass, the core MVP may still close, but the portfolio and product must not
claim that end users can download or install Chatterbox.

### Public Windows installer

A general download additionally requires trusted code signing, protected
signing credentials outside the repository, signature verification in the
release procedure, checksum publication, and documented antivirus/SmartScreen
observation. If no signing certificate or external authorization is available,
M011 may still close the portfolio-ready level, but public installer
publication remains explicitly blocked.

Automatic updating is not required for the first MVP. A manual, versioned,
signed replacement procedure is acceptable. If an updater is introduced, its
metadata and payload signature verification become mandatory before enabling
it.

## Deliberately deferred after the MVP

The first portfolio MVP does not require:

- an enterprise AppContainer or third-party Python sandbox;
- an automatic update service;
- macOS, Linux, Microsoft Store, or managed-enterprise packaging;
- an external penetration test or formal security certification;
- reproducible-build or SLSA-level supply-chain guarantees;
- a multi-vendor antivirus laboratory; or
- bundling every supported/development TTS profile; or
- automatic background acquisition or update of optional TTS profiles.

These remain useful future hardening. Any evidence of arbitrary-code
execution, local-file disclosure, book-text transmission, signature failure,
unsafe model deserialization, or destructive uninstall behavior overrides
this prioritization and blocks release immediately.
