# Security policy

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could expose local files, book contents, generated audio, user preferences, or arbitrary code execution.

Report security concerns privately to the repository owner through GitHub's private vulnerability reporting feature when it is enabled. If that feature is unavailable, use the contact method listed on the owner's GitHub profile.

Include:

- A clear description.
- Reproduction steps.
- Affected versions or commits.
- Expected impact.
- Any suggested mitigation.

## Security boundaries

VoxLeaf is designed to process untrusted EPUB files locally. Implementations must assume that an EPUB may contain malformed or hostile content.

Relevant risks include:

- Path traversal during archive extraction.
- Excessive decompression or memory consumption.
- Malicious HTML, SVG, scripts, or external references.
- Active content, remote resources, or unsafe styling escaping the EPUB renderer's isolation boundary.
- Unsafe native-process invocation.
- Local service exposure beyond the loopback interface.
- Logs accidentally containing book contents.
- Normalization, segmentation, errors, snapshots, or benchmarks exposing derived narration text.
- Loading untrusted model or checkpoint files.

Security fixes should include regression tests when practical.

The visual reader must render only sanitized local EPUB resources. Restored reading locators are untrusted persisted input and must be validated against the currently opened book before use.

Derived narration text has the same sensitive-content boundary as source book text. It must remain local and ephemeral, must not be persisted or logged, and must be produced only from the already-sanitized semantic model rather than by reopening publisher markup or URLs.

## Current release readiness

VoxLeaf is pre-alpha. The exact unsigned candidate is approved as a local or
portfolio Windows x64 MVP with Piper. It is not a trusted general-public
Windows installer because no signing identity is currently authorized.

The native supervisor provides strict profile selection, framed protocol
bounds, identity-first cancellation, and process-tree cleanup. It does not
turn the Python TTS child into an operating-system sandbox: an enabled
interpreter still has the ordinary filesystem and network authority of the
current Windows user. Development firewall rules and offline environment
variables are additional local controls, not end-user installation or sandbox
evidence.

Roadmap Milestone 11 through Milestone 6B implements exact shipped dependency audits,
runtime/model/voice integrity and acquisition, third-party licence and
provenance fulfillment, the unsigned local package, bounded uninstall choices,
and an external-credential signing path. Its intended core contains Piper
Spanish/English; Chatterbox Spanish/English is a separate optional GPU download
only after explicit consent, both live compatibility gates, documented
dependency/advisory review, fixed-manifest integrity checks, bounded atomic
installation, offline proof, and application-owned removal. Qwen is not part of
the first distributable product.
The renewed Milestone 7 record accepts Piper-core portfolio readiness as
**GO**, the optional Chatterbox package as **GO on a compatible host**, and
Chatterbox runtime support as
**supported when its published host gate passes**, using representative
compatible-host evidence under
[`mvp-release-authority-v2`](docs/architecture/mvp-release-authority-v2.md).

Completed M011 Milestone 6B enables ordinary Chatterbox acquisition only after
the renderer compatibility gate passes, while native code repeats the gate
before any network access. It reconciles exact package measurements and user
resource warnings, compiles repository-development fallbacks out of release
binaries, and passes the representative private-runtime journey under hostile
environment inputs without requiring Python or Rust to be uninstalled.

The post-6B basic code, logic, and security audit includes Standard Codex
Security scan `6db53928-14cd-4825-bd80-2680f7d5eac1`, which reviewed all 825
tracked items in its worktree inventory and recorded zero reportable findings.
This was a static source review and does not replace runtime,
dependency/advisory, package, fuzzing, penetration, or external security
testing. Manual review also ensured that failed narration preparation completes
active shutdown before availability recovery restarts and that failed Windows
Job Object assignment terminates and reaps the just-spawned child.

The exact audit-fix package now passes its renewed normal-user lifecycle and
ordinary Chatterbox journey. Generated evidence binds those passes to installer
SHA-256
`aca8ff0d233d5d996012eb43708765aba77dced3c1924de1d0b8c7f570fc4fdc`
while retaining `unsigned-local` and `publicPublicationAllowed: false`.

Signed public publication is **pending external authorization** because a
trusted signing identity is unavailable. All integrity, privacy, cancellation,
bounded acquisition, and cleanup controls remain required.

See
[`docs/development/release-security-and-distribution.md`](docs/development/release-security-and-distribution.md)
for the proportional MVP boundary and
[`docs/plans/active/M011-package-validate-and-release-mvp.md`](docs/plans/active/M011-package-validate-and-release-mvp.md)
for the implementation and validation plan.
