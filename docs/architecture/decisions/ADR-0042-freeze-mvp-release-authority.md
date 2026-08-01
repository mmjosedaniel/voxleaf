# ADR-0042: Freeze MVP release authority

## Status

Accepted on 2026-08-01.

## Context

VoxLeaf has an implemented reader and several exact local narration profiles,
but the repository is still a development topology: the Tauri version is
`0.0.0`, bundling is disabled, and TTS runtimes are ignored repository-relative
environments selected through environment variables. Successful local model
evaluation does not establish redistribution permission, a minimal production
dependency graph, installer safety, artifact integrity, clean-host behavior,
or a truthful public-release claim.

Packaging results could otherwise pressure the project to move dependency,
licence, size, cleanup, or signing gates after the fact. The large Chatterbox
developer environment also must not silently become the core installer merely
because it already works on the exact host.

## Decision

Accept [`mvp-release-authority-v1`](../mvp-release-authority-v1.md) as the
result-blind M011 release authority.

The Windows x64 per-user core contains a private embedded production
Python/Piper runtime and the exact davefx/Spanish and joe/English voices. It
does not depend on system Python, a repository checkout, developer tooling, a
first-run core download, or a user-created firewall rule.

Chatterbox is absent from the core. It may become a separately downloaded,
versioned, verified, removable Spanish/English GPU quality package only through
the closed native manifest and explicit consent/state machine defined by the
authority. Installation and activation remain separate. Qwen and all other
profiles remain outside the first distributable product.

Freeze the threat/trust table, optional-profile states, app-owned storage and
cleanup, dependency severity/reachability policy, inventory/licence/provenance
fields, artifact integrity and disk disclosures, normal-user privilege rule,
offline/no-firewall behavior, and independent Piper-core, optional-Chatterbox,
unsigned-local, and signed-public claims before implementation.

## Consequences

- M011 Milestone 2 can derive minimal production graphs without inheriting
  benchmark-only dependencies or rewriting release gates after audit results.
- The first core is larger than a shell-only downloader, but it works offline
  without a hidden first-run runtime dependency and remains much smaller than
  a Chatterbox-inclusive installer.
- Piper distribution must satisfy GPL-3.0-or-later, phonemizer,
  corresponding-source, notice, and exact CC0 voice-provenance obligations;
  the repository MIT licence is not sufficient by itself.
- Chatterbox evaluation evidence is not redistribution clearance. Any
  unresolved production advisory, licence/provenance gap, integrity failure,
  or unsafe acquisition/removal behavior withholds its end-user package and
  claim without failing an independently passing Piper core.
- The child remains an ordinary-user process, not an OS sandbox. Documentation
  must preserve that limitation.
- A signing certificate remains required for general public installer
  publication, but not for a truthfully labelled local portfolio build.
- Final package sizes, locks, hashes, and clean-host measurements remain future
  evidence because the production artifacts do not exist yet.

## Alternatives considered

- **Copy the current benchmark environments into the installer.** Rejected
  because they include development and dormant dependencies, unresolved audit
  surface, and non-release size evidence.
- **Put Chatterbox in the core installer.** Rejected because the measured
  developer state is approximately 8.02 GiB and its dependency, licence,
  integrity, and lifecycle gates are independently unresolved.
- **Download Piper silently on first use.** Rejected because the MVP core must
  work offline without surprising network activity. A future change requires
  a superseding authority.
- **Let the renderer provide model URLs or paths.** Rejected because it would
  widen an untrusted surface into arbitrary download, filesystem, and
  executable selection authority.
- **Require all optional and signing gates before closing any portfolio work.**
  Rejected because Piper-core, optional-Chatterbox, and public publication have
  different evidence and external-authorization boundaries.
- **Claim that process supervision is an OS sandbox.** Rejected because the
  child retains the ordinary user's filesystem and network authority.
