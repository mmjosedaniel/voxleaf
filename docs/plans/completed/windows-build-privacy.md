# Windows build privacy

## Goal

Prepare a current source snapshot and Windows artifacts that can be shared without disclosing the builder's account, home directory or checkout path.

## User-visible outcome

The ordinary Windows application, its installer and the local Chatterbox v8 candidate retain their respective behavior. The handoff identifies the verified bytes individually.

## Current state

At intake, both application executables contained absolute dependency paths and debug metadata from the build machine. Documentation included identifying links. The starting tree contains the approved November 17 corrections on main at `50f3b9ec76022efae72c239015bb47080920d7a0`.

## Scope and non-goals

Inspect the present source tree and generated shareable artifacts. Preserve existing copyright and working download URLs, including the five historical source-manifest fields bound to the approved public repository. Keep confidential originals, raw logs, symbols, working directories, chat and Git metadata outside the handoff.

## Relevant files and documentation

The Windows build entry points are in [package.json](../../../package.json) and the [Windows release builder](../../../scripts/build-windows-release.ps1). Follow [evidence retention](../../development/evidence-retention.md), [release guidance](../../development/release-security-and-distribution.md) and [independent change review](../../development/agentic-change-review.md).

## Architecture and constraints

Preserve the release-locked production runtime and the separate local candidate configuration. Preserve exact download origin checks. Keep historical evidence identifiable by its run and artifact identities after a privacy redaction. Do not change earlier commits.

## Milestones

1. Verify the old leak, retain private originals and redact unnecessary identifying references in the current source.
2. Remap compiler inputs and debugger paths, rebuild both binaries through their configured entry points and package the release.
3. Validate the source snapshot, executable and installer payloads, behavior and checksums. Obtain independent review of the final changes.

## Testing and benchmark strategy

Use normal Windows PowerShell. Preserve the original detections as positive controls. Inspect ASCII and wide strings and CodeView records, and inspect the installed payload. Exercise the relevant native admission, release, installer and candidate reader paths. Use the prior behavior evidence only where consumed inputs still match.

## Risks and rollback

Keep the trusted package identities and original app data intact. Preserve failed gate output in ignored local evidence. A build containing a private path is ineligible for the handoff.

## Progress log

Both original executables reproduced the private path disclosure. The release builder now remaps Rust source roots and limits the executable's debug reference to a filename. The release and local v8 candidate use the same scoped helper. The former paths and unredacted records were preserved privately. The shareable source snapshot omits Git metadata, raw evidence and local build output.

## Discoveries and decisions

The public download repository name and copyright identify attribution. Neither grants access. The historical manifests retain their original bytes and hashes. Changes to the current tree do not remove material from earlier commits, filenames in a private checkout or Git authorship records.

## Final validation results

### Artifact identities

| Windows x64 artifact | SHA-256 |
| --- | --- |
| Release application | `8b57196dc440d218208bd6a3c55d6419f0dc288bd51f209cf37fa42ccb1bcef6` |
| Local v8 candidate application | `d7fc5131327444e00eeea8960cb60a8d435f79a153510878349e16eb5b22a410` |
| Unsigned NSIS installer | `d7b0f32d6fa058d1fc579a0873c97b21d16e16793f700f68dfc246dc6429a39c` |
| Application extracted from NSIS | `4cc8b2c29b36365e3216f7d84a3bcb9c6fd13bf5fc9fad1469ccee463e559a85` |

The two build outputs had filename-only CodeView references. The installed application differs from the release executable only in Tauri's three-byte bundle marker. The independent inspection checked the raw installer and 5,436 unpacked payloads, including nested archives. All 2,024 bundled Piper files matched their existing upstream bytes. Vendor libraries retain 34 absolute vendor debug paths. A five-byte mixed-case match appeared inside the compressed stream. Decoding all 321,729,415 bytes and checking the matching contexts confirmed a compression coincidence. The scan found no unapproved identifiers or paths from the VoxLeaf builder in decoded data.

The release package check passed. The Windows release fixtures passed 15 layout and signing cases and a focused regression for remap precedence and environment restoration after success and failure. The focused release-locked Rust tests passed 84 cases, with three opt-in cases ignored. The Python selection passed 109 cases. The v8 WebView2 run selected the installed candidate, observed a typed CUDA failure during preparation and preserved that selection on recheck without restarting generation. That run establishes recovery behavior on the tested host.

The source inventory uses tracked and nonignored untracked working files. ZIP verification compares member names and bytes against that inventory and checks archive integrity and metadata. The public copyright, asset download URLs, and five hash-bound historical source repository fields are retained. Earlier commits and diff deletions can still reveal identifying information. The current package is unsigned. SmartScreen, Defender and public distribution approval are separate from these privacy and local behavior checks.

The corrected installer passed first launch, same-version repair and six uninstall policies. The lifecycle restored preexisting application data, preserved an unrelated sentinel and observed the installed executable at the extracted hash above. The receipt SHA-256 is `7bc96e2d0d87e9fcbf2ee6896c8ce1e8395e2d53b0996bfbfa4853b1dbff8aab`. The generated uninstaller and decoded NSIS metadata passed the privacy check. During the first revision's lifecycle validation, PowerShell module lookup failed before install and a subsequent run encountered a transient WebView2 file during traversal. Recovery checks confirmed that the original data was present, the installation was absent and no test process or lifecycle backup remained before the successful unchanged retry.

The [first independent review](../evidence/windows-build-privacy/change-review-r01.md) identified a case in which setting encoded compiler flags hid Cargo's configured flags. The corrected builder queries Cargo for its effective flags in the Tauri working directory before adding remaps. The Windows compiler regression reproduced the original loss and then passed with both build defaults and matching target-specific settings. All 17 selected Windows build tests passed. Both executable builds and the installer package check ran again. The [corrected-candidate review](../evidence/windows-build-privacy/change-review-r02.md) and [closeout checks](../evidence/windows-build-privacy/closeout-r02.md) govern the final handoff.
