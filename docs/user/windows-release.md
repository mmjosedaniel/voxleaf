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

An unsigned local build is suitable only for maintainer-operated validation or
a portfolio demonstration. Do not offer it as a trusted general-public
download. Public distribution requires a trusted signature, successful
signature verification, a matching published SHA-256 checksum, and the release
checks documented by the project.

### Maintainer-only Chatterbox validation build

`VoxLeaf-Chatterbox-Validation 0.1.0` is a separate unsigned package used only
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

The final `181,694,782`-byte validation installer has SHA-256
`289c93e63d07e0001b667d964396ea5a611a5bf38f411f9158e92e829d35f148`.
It repairs the first installed runtime closure, moves only its exact verified
legacy package to a Windows-safe short application-data path, and converts
native verbatim paths to conventional Windows paths only when starting the
embedded Python child. Microsoft Defender reports no threats for that exact
unsigned file. Reinstalling this build preserves and reuses an already verified
Chatterbox download; it does not download the optional package again. The first
integrity pass and model cold load can still take tens of seconds.

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

The exact installed Spanish Chatterbox playback matrix now passes on the
maintainer's compatible computer. Quick startup took `45.990` seconds in that
validation run, so the UI can remain in preparation while integrity verification
and cold model load complete. This is development-host evidence, not general
hardware or public-release proof. English narration, application restart,
removal/reinstall, Piper-after-removal, independent clean-host validation, and
public signing remain open.

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

Use **Installed apps** in Windows. Interactive uninstall asks whether to remove
VoxLeaf preferences, recovery state, staging data, and optional profiles. The
default and silent uninstall preserve that application data. Either choice is
limited to VoxLeaf-owned roots and never searches for or deletes EPUB files.

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
