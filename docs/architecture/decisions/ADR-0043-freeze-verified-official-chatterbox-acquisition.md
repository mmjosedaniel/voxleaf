# ADR-0043: Freeze verified official Chatterbox acquisition

## Status

Accepted on 2026-08-01.

## Context

M011 Milestone 4A proved a native-owned optional-profile lifecycle while
deliberately withholding end-user acquisition. Its historical manifest assumed
one VoxLeaf-hosted archive containing runtime and model weights. Republishing
the approximately 3.21 GB approved model set is unnecessary because the public
official Hugging Face repository exposes the exact revision-pinned files.

Direct model download alone is insufficient. VoxLeaf still needs a reviewed,
bounded runtime that does not require system Python, `pip`, Git, administrator
rights, or remote code from the model repository. GitHub Releases permits
multiple assets below 2 GiB while local hashes can remain the integrity
authority.

## Decision

Accept
[`chatterbox-official-acquisition-authority-v2`](../chatterbox-official-acquisition-authority-v2.md)
before Milestone 4B implementation or results.

VoxLeaf will acquire exactly six model-data files from
`ResembleAI/chatterbox` at commit
`5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18`. It will separately acquire a
VoxLeaf-built, audited, runtime-only archive as bounded consecutive assets from
the versioned GitHub Release `chatterbox-runtime-v2`. All initial URLs,
filenames, sizes, SHA-256 values, ceilings, redirects, staging paths, and the
complete installed identity are native-owned and manifest-closed.

The schema-v1 archive authority and Milestone 4A remain historical. The v2
manifest stays `withheld` until exact runtime assets exist and deterministic,
clean-host, offline bilingual, resource, removal, licence, and audit gates pass.
Piper remains independently releasable.

## Consequences

- VoxLeaf does not need to republish official Chatterbox model weights.
- Model provenance and runtime execution authority remain separate.
- The native implementation must support a verified runtime archive composed
  of bounded parts plus six independently verified model files.
- Signed CDN redirects are permitted only through a strict HTTPS host/count
  policy and never become integrity authority or persisted data.
- Runtime publication requires maintainer authorization and is a real release
  gate. Absence of published assets truthfully withholds Chatterbox rather than
  weakening the installer or requiring developer tools.
- Optional Chatterbox failure cannot block, replace, or mutate Piper core.

## Alternatives considered

- **Retain one VoxLeaf archive with model weights.** Rejected because it
  duplicates the official public model data and creates a needlessly large
  hosted artifact.
- **Install the runtime from PyPI on the user's computer.** Rejected because it
  would require installer-like package resolution/execution, broaden network
  trust, and risk depending on system tooling.
- **Download a Hugging Face repository snapshot.** Rejected because it admits
  unexpected and potentially executable repository content.
- **Use a mutable branch, tag, or latest release.** Rejected because it breaks
  result lineage and makes later substitution indistinguishable from the
  evaluated package.
- **Enable model download before a runtime exists.** Rejected because partial
  model data has no product value and creates storage/network behavior without
  an installable profile.
