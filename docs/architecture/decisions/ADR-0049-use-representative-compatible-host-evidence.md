# ADR-0049: Use representative compatible-host evidence for MVP support

## Status

Accepted on 2026-08-03. The accompanying
[`mvp-release-authority-v2`](../mvp-release-authority-v2.md) records the revised
claim boundary and preliminary Milestone 7 result. ADR-0050 later supersedes
only this decision's acquisition-channel state by enabling the ordinary
manifest after the same published live host gate; the representative-evidence
support rule remains current.

## Context

The result-blind M011 authority correctly separated the Piper core, optional
Chatterbox package, unsigned portfolio artifact, and signed public installer.
Its Milestone 7 interpretation nevertheless treated a complete second clean
computer matrix for the exact final hash as a prerequisite for saying that a
working profile or local portfolio build was supported.

That interpretation confuses representative compatibility evidence with an
impossible universal hardware guarantee. There are too many combinations of
CPUs, GPUs, drivers, Windows revisions, memory pressure, and device firmware to
test every computer. Normal software support instead defines compatible
systems through published prerequisites, tests representative systems, and
handles individual failures through admission checks and troubleshooting.

VoxLeaf has stronger evidence than the earlier NO-GO wording acknowledged.
Piper is a CPU profile and the application worked both on the main development
computer and on an independent older Windows computer reported with 16 GB RAM
and a 4-GB-VRAM GPU. Chatterbox passed Spanish and English runtime and installed-
package journeys on the current Windows 11/RTX 5060 Laptop computer with 20
logical processors and 33,752,997,888 bytes RAM, while the application already
enforces measured CUDA, VRAM, RAM, and processor gates.

Signing is different: a trusted public installer cannot be produced without an
authorized external signing identity. That missing authority is not evidence
that Piper or Chatterbox fails to work.

## Decision

Adopt
[`mvp-release-authority-v2`](../mvp-release-authority-v2.md) and supersede only
the independent-claim gates and exhaustive clean-host interpretation in
[`mvp-release-authority-v1`](../mvp-release-authority-v1.md).

- Define support through published compatibility requirements plus
  representative passing evidence, not through testing every possible device.
- Record `piper-core-portfolio-ready` and the unsigned local portfolio build as
  **GO**.
- Record Chatterbox as **GO when the published runtime host gate passes**. A
  host below that gate is incompatible with Chatterbox; it is not evidence that
  the profile fails everywhere.
- At this 2026-08-03 decision checkpoint, keep the ordinary Chatterbox
  manifest's `withheld` state distinct from runtime support. This decision does
  not itself enable the Download action; ADR-0050 later records that bounded
  implementation change.
- Record signed public Windows publication as **pending external
  authorization**, not as a technical NO-GO for either TTS engine.
- Retain every existing licence, provenance, digest, safe-loading, bounded
  acquisition, cancellation, privacy, memory-only audio, lifecycle, cleanup,
  and normal-user installation control.

## Consequences

- The local/portfolio MVP can state that Piper is supported on compatible
  Windows x64 systems and that Chatterbox is supported on compatible systems
  that pass its live gate.
- Documentation must state published requirements and material limitations,
  but must not imply that support is confined to the exact computers already
  tested.
- Performance can vary and a particular compatible-looking computer may still
  expose a driver, resource, or installation defect. Such a result is
  actionable troubleshooting or bug evidence, not an automatic global NO-GO.
- At this decision checkpoint, the ordinary build still hid Chatterbox Download
  pending a separate implementation change. ADR-0050 and M011 Milestone 6B now
  provide that change behind the unchanged renderer and native live gates.
- A general public Windows installer remains unavailable until trusted signing
  is authorized and the resulting signature and checksum are verified.

## Alternatives considered

### Require the exact full matrix on every supported computer

Rejected because the set of possible computers is unbounded and the criterion
could never be completed.

### Support only the two computers already tested

Rejected because the product already has explicit, measurable compatibility
requirements. Representative tests validate that requirements-based class;
they do not define the class by serial number.

### Treat missing signing authority as a runtime failure

Rejected because code signing controls publication identity and reputation,
not local inference correctness.
