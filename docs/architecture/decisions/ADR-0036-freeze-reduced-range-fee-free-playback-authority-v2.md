# ADR-0036: Freeze reduced-range fee-free playback authority v2

## Status

Accepted on 2026-07-30.

## Context

M010.2's immutable v1 comparison selected no pitch-preserving playback
backend. The repository WSOLA prototype exceeded the frozen CPU gate, and the
media-element candidate could not run in packaged WebView2 under the unchanged
CSP. ADR-0035 authorized a new, result-blind comparison with a smaller minimum
rate and only fee-free candidates, but implementation and measurement still
required an exact authority frozen in a prior commit.

Changing the v1 rate range or its result would destroy provenance. Installing
a package or implementing a candidate before fixing its identity, licence,
resource, lifecycle, CSP, and acceptance rules would allow results to influence
the benchmark.

## Decision

Accept
[`reader-settings-playback-authority-v2.md`](../reader-settings-playback-authority-v2.md)
and its matching executable desktop constants/tests as the sole M010.2 v2
comparison authority.

V2:

- admits exactly `1.00x`, `0.95x`, `0.90x`, `0.85x`, `0.80x`, and `0.75x`;
- compares only the host media-element path, exact
  `signalsmith-stretch@1.3.2`, and a new incremental repository WSOLA v2;
- permits only host, repository-owned MIT, or exact reviewed fee-free
  permissive code;
- requires the complete Signalsmith package/source/transitive/shipped-artifact
  audit before installation;
- limits the media candidate CSP delta to exactly
  `media-src 'self' blob:` while preserving `connect-src`;
- retains all v1 performance, quality, host, resource, cancellation, privacy,
  and result-lineage gates; and
- keeps production at `1.00x` unless one candidate passes every frozen gate.

The authority commit must precede every candidate implementation and result
commit. V1 authority and evidence remain unchanged.

## Consequences

Milestone 2B can compare a smaller useful range without weakening proven
resource and correctness limits. Candidate identity and legal stop conditions
are reviewable before code or results exist.

No package is installed, no CSP is changed, and no speed control is enabled by
this decision. Signalsmith's published MIT metadata is not final distribution
clearance; M011 still owns distribution review.

If no candidate passes on both required hosts, the valid result is to retain
`1.00x` and continue the reader/Settings work without a speed selector.

## Alternatives considered

- **Rewrite v1.** Rejected because v1 is historical benchmark evidence.
- **Relax the v1 CPU or packaged-host gates.** Rejected because the approved
  change is the useful speed range and candidate set, not post-result gate
  tuning.
- **Admit paid or copyleft backends.** Rejected because the MVP requires a
  fee-free path with unambiguous future distribution obligations.
- **Install Signalsmith before the authority commit.** Rejected because
  package contents and observed behavior must not influence the frozen
  comparison rules.
- **Enable browser pitch-shifting rate control.** Rejected because pitch
  preservation remains a product requirement.
