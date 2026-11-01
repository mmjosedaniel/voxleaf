# ADR-0069: Bounded PNG orientation

## Status

Implemented in the [R8 correction plan](../../plans/completed/eight-revalidated-findings-minimal-corrections.md).
Chromium and current WebView2 gates pass. Independent R8-R1-20261101 approves
the implementation; the plan links its final archival assessment.

## Decision

Extend ADR-0066's bounded IFD0 orientation interpretation to PNG `eXIf`.
Current Chromium presents the repository-authored 3x2 fixture as 2x3 for
orientations 6 and 8; this is measured decoder behavior, not an assumption from
upstream source. The current packaged WebView2 confirms the same behavior.

PNG supplies the TIFF payload directly; JPEG retains its APP1/Exif envelope.
Both use the same bounded parser, both byte orders, a unique SHORT orientation
entry with count one and values 1-8, and no traversal of other IFDs. Duplicate
metadata and malformed/truncated entries fail closed. Orientations 5-8 swap
presented dimensions. Absent orientation keeps the raw dimensions.

Raw and presented width/height, pixel, encoded-byte, frame, concurrency and
live-source limits remain unchanged. Browser natural dimensions must match
exactly; arbitrary axis swapping is not accepted. Sources remain local Blob
URLs with the same cancellation and release owners. No decoder dependency,
CSP permission, persistence, public contract or component boundary is added.

## Validation and historical boundary

The R8 ledger records deterministic metadata/budget/lifecycle tests, current
Chromium evidence and the required packaged runtime result. ADR-0066's
historical JPEG acceptance is unchanged and does not establish PNG support.
The canonical system diagram retains the same topology and ownership.
