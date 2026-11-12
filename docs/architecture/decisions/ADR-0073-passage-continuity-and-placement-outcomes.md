# ADR-0073: Proven passage continuity and attributable placement

## Status

Implemented and host-validated in the
[completed passage navigation plan](../../plans/completed/passage-navigation-minimal-corrections.md);
its final independent review records acceptance of the exact patch.

## Decision

Previous and Next use the same bounded neighbor resolver for eligibility and
execution. Sorted remembered ranges do not establish adjacency. Only consecutive
preparation or the current audio FIFO supplies an edge. Unknown neighbors remain
disabled with an explanation. Paused navigation does not prepare more content;
explicit Resume retains that responsibility. History remains capped at 64 ranges
and is retired with its segmentation context.

An explicit reader placement carries its existing reader request revision and
publication identity. Narration-originated actions additionally carry the existing
narration revision. These counters have different owners and are not compared
with each other. One matching result is consumed through the existing App/reader/
narrator boundary. Superseded and duplicate results cannot release a newer request,
restart audio or admit a saved position.

A relative passage succeeds at its requested canonical locator. An exact target
already visible under clamped scrolling succeeds without perfect alignment.
Approximate placement, unavailable geometry and rejection release bounded pending
work without autoplay or checkpoint replacement. A measured block fallback can
support a subsequent explicit Play; missing readable placement keeps Play gated.
Initial restoration and chapter/TOC canonical recovery preserve their separate
policies. Configuration and Stop still invalidate restart intent, and verified
containment remains necessary for a new run.

An audible start establishes heard progress, not visual placement. Failed following
retains the last measured visual locator. Highlighting may remain without usable
geometry; exhausting the bounded correction does not invent visual success.
Segment-completion projection and manual-inspection protection are unchanged.

## Consequences and verification

These are local desktop contracts using existing owners. No shared schema,
preparation rule, process, dependency, persistence store or system-diagram edge
changes. EPUB content and inference remain local, PCM ephemeral and history bounded.

The plan records discriminating RED cases, exact current host results, historical
evidence reuse and independent review. Controlled missing geometry and injected
resolver rejection are not claims about natural WebView2 failure frequency.
