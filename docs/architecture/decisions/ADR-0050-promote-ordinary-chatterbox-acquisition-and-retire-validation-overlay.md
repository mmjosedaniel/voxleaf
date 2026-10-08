# ADR-0050: Promote ordinary Chatterbox acquisition and retire validation overlay

## Status

Accepted on 2026-08-04.

## Context

ADR-0045 authorized a separately identified, unsigned validation build while
the ordinary manifest remained withheld. That limited channel made it possible
to validate acquisition on the only available compatible host, but it was not
the intended ongoing product topology.

The ordinary release path now has hash-bound representative compatible-host
evidence for install, cancellation, complete verified acquisition, Spanish and
English offline Chatterbox narration, restart, removal, Piper Spanish and
English narration, reacquisition, and uninstall.
The ordinary manifest is `downloadable` only after the renderer presents a
compatible profile and native code repeats the published host gate before
confirmation or network activity. The release-locked runtime compiles out
repository and environment fallbacks.

## Decision

Supersede ADR-0045 only for the acquisition channel and validation-only
overlay. Retire that overlay's configuration, script, and distinct build
identity from the active release surface, while retaining its evidence as
history. Do not supersede ADR-0045's historical record or any unrelated
release, trust, lifecycle, or support authority.

The ordinary release may acquire Chatterbox only after both live gates pass.
It must accept only the packaged Piper core or a verified installed Chatterbox
profile. A failed gate must reject before confirmation or network activity.

Runtime evidence v3 is the current reconciliation; v2 remains historical.
The ordinary Windows package evidence remains unsigned-local, with
`publicPublicationAllowed: false`; this decision grants neither a signature nor
general public publication authority.

## Consequences

- The current ordinary acquisition path is a compatible-host feature, not a
  universal hardware or performance claim.
- The optional package remains unbundled, consented, integrity-verified,
  bounded, removable, and locally executed.
- Piper remains usable whenever Chatterbox is absent, declined, cancelled,
  rejected, removed, or otherwise unavailable.
- Future signed public publication still requires separate external
  authorization and signature verification.
