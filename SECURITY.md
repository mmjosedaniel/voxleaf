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
