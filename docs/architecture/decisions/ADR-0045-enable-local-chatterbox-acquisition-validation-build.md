# ADR-0045: Enable a local Chatterbox acquisition validation build

## Status

Accepted

## Context

The ordinary VoxLeaf `0.1.0` installer intentionally embeds a Chatterbox
manifest whose availability is `withheld` until the optional package passes a
compatible-host lifecycle. The available independent Windows test computer has
only a 4-GB-class GPU and cannot exercise that path. The development computer
is compatible and is the only available machine on which the maintainer can
test a real installed download, verified activation, bilingual narration,
restart, removal, and Piper-after-removal sequence.

Changing the ordinary manifest to `downloadable` would incorrectly turn local
development-host evidence into a public release decision. A renderer or
environment-variable override would also weaken the native-owned closed
manifest boundary.

## Decision

VoxLeaf will provide a separately identified, unsigned, local-validation-only
Windows build for the maintainer's current compatible computer.

- The ordinary `VoxLeaf` package continues to compile the checked-in
  `withheld` manifest unchanged.
- The validation build uses an explicit Cargo feature plus the exact checked-in
  `optional-package-validation-overlay-v1.json`. The native process, not the
  renderer, combines that overlay with the frozen v2 manifest.
- The overlay may change only availability, the measured download/install/
  staging/free-space disclosures, and the conservative cold-start disclosure.
  It cannot change URLs, revisions, hashes, profile identity, licences,
  hardware requirements, limits, or install paths.
- The validation application has a distinct product name, Windows identifier,
  install location, and application-data root so it can coexist with and not
  mutate the ordinary VoxLeaf installation.
- Native hardware admission and the 20-GB free-space gate remain mandatory.
  The user must review the approximately 7.67-GiB download and explicitly
  confirm it before any network request.
- The installer contains neither Chatterbox weights nor the Chatterbox runtime.
  Downloaded files remain revision/URL/size/SHA-256 closed, use bounded staging,
  are atomically promoted only after verification, and can be explicitly
  removed.
- This unsigned validation artifact is not a public release, must not be
  attached to a public GitHub Release, and cannot close the independent
  clean-host or trusted-signing gates.

## Consequences

The maintainer can test the real installed acquisition flow on the only
compatible computer without weakening the normal installer or misrepresenting
release readiness. The result can expose functional defects and provide
development-host measurements, but it cannot prove absence of hidden developer
prerequisites or authorize public Chatterbox availability.

The repository gains a second release configuration and build command that
must remain structurally isolated from the ordinary package. Any future public
enablement still requires an explicit decision that updates the canonical
manifest after the outstanding clean-host, security, lifecycle, and signing
gates are resolved.

## Alternatives considered

- Enabling the canonical manifest immediately was rejected because the clean
  compatible-host gate has not passed.
- Using a renderer flag, command-line URL, or environment override was rejected
  because it would make acquisition authority mutable at runtime.
- Bundling the approximately 7.67 GiB of runtime and model transfers in the
  installer was rejected because Chatterbox is optional and its verified
  acquisition lifecycle is the behavior under test.
- Treating the current development computer as a clean host was rejected
  because it contains prior VoxLeaf and model-development state.
