# VoxLeaf Windows package

## Install

VoxLeaf `0.1.0` is packaged for 64-bit Windows as a per-user NSIS installer.
It installs below the current user's Local App Data folder and does not require
administrator access, a repository checkout, Node.js, Rust, system Python, a
firewall rule, or a modification to `PATH`.

The **About** section in Settings reads the installed application version from
the native package metadata. It must therefore show `VoxLeaf 0.1.0` for this
release rather than a development placeholder.

The installer contains the private Piper runtime and the Spanish davefx and
English joe voices. It does not contain Chatterbox, Qwen, benchmark tools,
model-development environments, books, generated audio, or private user data.
If a compatible WebView2 runtime is absent, the embedded Microsoft bootstrapper
requires an internet connection to install that Windows prerequisite. Normal
EPUB reading and Piper narration do not require a network connection.

The current unsigned local build is accepted for controlled local use and as a
portfolio MVP. Piper is a Windows x64 CPU profile with no discrete-GPU
requirement; representative evidence includes successful use on an independent
older Windows computer with 16 GB RAM and a 4-GB-VRAM GPU. This does not promise
identical behavior on every PC. Do not offer the unsigned artifact as a trusted
general-public download. Public distribution requires a trusted signature, successful
signature verification, a matching published SHA-256 checksum, and the release
checks documented by the project.

The current installer is `181,596,357` bytes with SHA-256
`aca8ff0d233d5d996012eb43708765aba77dced3c1924de1d0b8c7f570fc4fdc`.
Generated package evidence records its normal-user lifecycle and ordinary
compatible-host Chatterbox journey as passed. It remains `unsigned-local`;
Defender was not run and SmartScreen was not observed for this exact artifact.
Renewed
Milestone 7 accepts Chatterbox as supported when the published host gate passes.
The ordinary build offers Download only after Settings and native code pass
that live gate; signed public publication remains pending external
authorization. These are separate channel states, not engine failures.

### Historical maintainer-only Chatterbox validation build

`VoxLeaf-Chatterbox-Validation 0.1.0` was a separate unsigned package used only
to test the optional download on the maintainer's compatible computer. It has a
different Windows identity and data root, does not replace ordinary VoxLeaf,
and is not a public installer. Before downloading, Settings discloses an
approximately 7.67-GiB transfer, approximately 7.66-GiB final installation,
approximately 12.35-GiB temporary peak, 20-GB free-space requirement, GPU/RAM/
CPU requirements, licences, and estimated cold start. Native checks may still
reject the computer. The download starts only after explicit confirmation and
every artifact is verified before activation.

In this validation build, an absent compatible package shows **Review
Chatterbox download**. That action performs the native admission check and
opens the measured confirmation; only the separate **Download Chatterbox**
action starts network transfer.

During download or verification, **Cancel download** signals the native
operation and removes that operation's incomplete staging and partial files
when cancellation settles. It returns Chatterbox to not installed, does not
retain a resumable partial download, and never removes a package that had
already completed verified installation.

The validation installer is unsigned and ships with an adjacent SHA-256 file;
verify that checksum before use. The exact local artifact and Defender result
are recorded in the active M011 ExecPlan rather than embedded here, because this
document is itself part of the installer payload. The build repairs the first
installed runtime closure, moves only its exact verified legacy package to a
Windows-safe short application-data path, and converts native verbatim paths to
conventional Windows paths only when starting the embedded Python child.
Reinstalling preserves and reuses an already verified Chatterbox download; it
does not download the optional package again. The first integrity pass and model
cold load can still take tens of seconds.

Download, installation, activation, and first narration are separate steps.
Activation is explicit and does not load the model. On the first Chatterbox
access after each VoxLeaf launch, native code verifies every authority-listed
runtime and model file. It may safely remove only known interpreter-generated
cache files, never an authority file. The successful result is remembered only
in memory for that VoxLeaf process so repeated Settings checks or Play attempts
do not rehash the complete package. Those repeated checks compare package paths,
sizes, and timestamps instead. This catches ordinary package changes but is not
designed to defend against malicious software already running as the same
Windows user. Closing and reopening VoxLeaf discards the temporary receipt and
requires a new complete verification; no durable trust stamp is stored.
Use only one running VoxLeaf validation instance while Chatterbox is being
installed, verified, or removed. Cross-process optional-package coordination is
still a public-release gate, not a completed claim of this unsigned build.

After verified installation, Settings exposes **Activate Chatterbox** and
**Remove Chatterbox** as separate actions. Removal first contains an owned
Chatterbox child and then deletes only the exact optional runtime, model,
removable cache, and staging data. It does not uninstall VoxLeaf, remove Piper,
delete preferences or reading progress, or search for EPUB files.

The exact installed Spanish and English Chatterbox playback arms now pass on the
representative compatible computer. The Milestone 6A rerun measured Quick startup
at about `40.0` seconds in Spanish and `33.9` seconds in English, so the UI can
remain in preparation while integrity verification and cold model load complete.
Both arms recorded zero underruns, generated-audio files, and external requests.
Together with the published Windows x64/CUDA/VRAM/RAM/CPU admission gate, this
is representative evidence for the compatible hardware class; it is not a
guarantee for every GPU or driver combination. The ordinary manifest was
withheld at that historical validation-build checkpoint.
Public signing remains separately pending.

Settings stays populated during profile transitions and reports a truthful
content-free applying phase instead of going blank. First Chatterbox Play can
report installed-package verification, combined local service/model startup,
narration preparation, first-audio generation, and buffering before playback.
While no audio owns playback, the existing safe Stop path is labelled
**Cancel start**; once playback begins it returns to **Stop**. No fixed duration
or invented percentage is shown for verification or model loading. This
feedback does not make the validation build public-release evidence.

### Ordinary Chatterbox download

Milestone 6B retired the separate validation identity. The same closed
acquisition path is enabled in ordinary VoxLeaf only after the renderer-facing
compatibility presentation passes and native code repeats the gate before any
network operation.

On a passing computer, Settings will present Chatterbox as the generally more
natural and expressive quality option compared with Piper, while noting that
voice preference varies. Before network access, the confirmation must disclose:

- `8,231,893,387` download bytes (about 8.23 GB/7.67 GiB);
- a corrected installed total of `8,228,503,309` bytes (about 8.23 GB/7.66 GiB);
- a peak temporary requirement of `13,254,834,850` bytes (about 13.25 GB/
  12.35 GiB) and at least 20 GB/18.63 GiB free before transfer;
- 64-bit Windows, CUDA bfloat16, at least 8 logical processors, 24,576 MiB total
  and 4,096 MiB currently available RAM, and 5,632 MiB total and 4,668 MiB
  currently available dedicated VRAM; nominal 7,680-MiB/8-GB-class VRAM remains
  the evaluated recommendation; and
- licence, offline, cancellation, activation, removal, and reacquisition
  consequences.

Initial Chatterbox load can exceed one minute. Representative direct cold runs
were `29.61` and `82.34` seconds; the renewed exact-artifact journey measured
Quick command-to-audible at `49.269` seconds in Spanish and `37.773` seconds in
English. Representative process-tree working-set peaks were
`4,855,865,344`/`4,898,762,752` bytes and dedicated-VRAM peaks were
`3,745`/`3,709` MiB. Those figures describe the tested computer, not a fixed
countdown or guarantee for every compatible computer.

The package occupies disk after installation; it does not permanently reserve
RAM or VRAM. Loading and inference do use GPU, VRAM, RAM, and CPU and may
temporarily make the computer less responsive. Narration/model controls may be
unavailable during a truthful loading phase, but visual reading must remain
usable. **Cancel start** is available while the existing identity-safe startup
path can honor it; **Stop** returns once audio is playing. No fake non-byte
percentage or fixed duration is shown.

The ordinary release must use only its verified application-owned private
runtime. End users do not need system Python, Rust, Cargo, Node.js, `uv`, `pip`,
or CUDA Toolkit. The release test does not uninstall those tools: it compiles
development fallbacks out, launches the installed product under removed or
hostile development/Python variables and a misleading `PATH`, and proves that
the absolute private `runtime/python.exe` and application-owned module/model
roots are used. Windows/WebView2 and the NVIDIA driver/hardware gate above remain
real prerequisites.

## Repair or replace a version

Close VoxLeaf so its local narration child process is stopped. Running the same
installer again repairs the exact version. To replace it manually, run a newer
versioned installer; automatic updates are intentionally absent. The installer
rejects an older version over a newer installed version.

Reader preferences and stable reading locators are stored separately from the
program and are preserved by repair or version replacement. Generated audio is
never retained. Optional Chatterbox data, if separately acquired, also remains
outside the core program directory.

## Uninstall

Use **Installed apps** in Windows. When an exact application-owned Chatterbox
root exists, interactive uninstall first offers a separate Chatterbox choice.
It is selected by default, explains that removal reclaims about 8.23 GB and
requires acquisition again, and can be unchecked independently. The following
preference/recovery choice is not selected by default. Neither choice searches
for or deletes EPUB files, Piper, generated narration, or unrelated Local App
Data entries. This split follows
[ADR-0047](../architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md).

Silent uninstall preserves both data classes unless an exact option authorizes
one of them:

```text
/REMOVE_CHATTERBOX_DATA=1
/REMOVE_PREFERENCES_AND_RECOVERY=1
/REMOVE_APP_DATA=1
```

The first option removes only the exact optional runtime, model, removable
cache, and acquisition staging roots. The second removes only bounded reader
preferences, reading positions, and recovery state. Supplying both composes the
two removals; the legacy third option also selects both. Missing options and
values other than exact `1` preserve data. Repair/version replacement always
preserves both classes.

If Chatterbox is intentionally retained, Windows removes the application UI
that exposes **Remove Chatterbox**. Reinstall the same VoxLeaf product identity
(ordinary VoxLeaf or the separate Chatterbox validation build), remove
Chatterbox from Settings, and uninstall again. Do not guess at or broadly delete
Local App Data paths. Automated lifecycle validation covers repair and all six
silent outcomes for both identities. A future interactive journey remains
useful regression coverage, not a prerequisite for saying that Piper works.

## Verify a release artifact

From PowerShell, compare the installer with its adjacent checksum file:

```powershell
$installer = Resolve-Path ".\VoxLeaf_0.1.0_x64-setup.exe"
$expected = ((Get-Content "$installer.sha256") -split " ")[0].Trim()
$actual = (Get-FileHash -Algorithm SHA256 $installer).Hash.ToLowerInvariant()
if ($actual -ne $expected) { throw "VoxLeaf installer checksum mismatch." }
```

For a public installer, also require `Get-AuthenticodeSignature $installer` to
report `Valid`. A checksum detects changed bytes; it does not replace publisher
identity or code signing.
