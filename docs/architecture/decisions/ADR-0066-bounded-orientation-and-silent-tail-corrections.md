# ADR-0066: Bounded JPEG orientation and silent narration tails

## Status

Accepted on 2026-10-28 with implementation review `SAC-R3-20261028-01`.
The [completed static-audit correction plan](../../plans/completed/static-audit-corrections.md)
records the passing regression/browser/native evidence and final archive review.

## Decision

The existing desktop JPEG metadata owner reads only EXIF IFD0 orientation.
TIFF reads stay inside the containing APP1 payload and support both byte orders.
The orientation entry must be unique, SHORT, count one and one of the eight
defined values. Duplicate EXIF segments, duplicate orientation entries and
malformed orientation metadata fail closed. Other IFDs and embedded thumbnails
are not traversed. Values 5 through 8 exchange the presented axes; values 1
through 4 retain them. Both raw and presented dimensions satisfy the existing
width/height policy; decoded-pixel accounting is unchanged. The browser must
still report exactly the expected presented dimensions before receiving a
ready source. No general EXIF dependency or arbitrary swapped-dimension
acceptance is introduced. The tag semantics follow the
[CIPA EXIF specification](https://www.cipa.jp/std/documents/e/DC-008-2012_E.pdf).

The mutable narration packer reports completion only after consuming all
normalized units. If a spoken segment reaches its source ceiling before a
silent suffix, its continuation remains at the last emitted range; the existing
unspoken continuation consumes the suffix separately. This preserves the
finalizer's range/continuation equality, the segment ceiling, finite traversal,
and substantive text following the suffix. It emits no empty speech or silent
PCM and changes neither M005's historical authority nor serialized contracts.

## Consequences and validation

The existing component, process, persistence and data-flow topology remains
unchanged; the canonical system diagram and M005 boundary still apply.
Synthetic JPEGs cover both byte orders, rotations/mirrors, malformed/truncated
offsets, exact limits, unexpected decode dimensions and lifecycle release.
Chromium and WebView2 use the same repository-authored fixture family.
Narration tests compare bounded one/many-segment drains, silent-only content,
following substantive paragraphs and cancellation with frozen corpus controls.
