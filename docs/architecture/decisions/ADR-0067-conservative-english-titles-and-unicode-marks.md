# ADR-0067: Conservative English titles and Unicode marks

## Status

Accepted and validated on 2026-10-28 in the
[completed audit follow-up](../../plans/completed/validated-audit-follow-up.md).

## Decision

The mutable bilingual normalizer preserves ambiguous English `Dr.` and `St.`
forms, including their abbreviation-period protection and source spans. Expansion
requires whitespace followed by a same-language prose uppercase letter. A
preceding capitalized word makes the context ambiguous and preserves the form;
context beyond the existing scanner lookahead also preserves it. This bounded,
conservative guard does not recognize arbitrary names or expand addresses to
Street/Drive. `Baker St.`, `Oak Dr.`, `Oak Dr. North`, terminal/lowercase-followed
forms stay unchanged. `Dr. Morgan`, `Mr. Reed`, `St. James Station` and accepted
contextual corpus outputs remain identical.

The existing packer classifies combining marks with the runtime Unicode `M`
property rather than five enumerated ranges. A boundary cannot separate a base
from a following admitted mark, including U+3099, Hebrew marks, spacing marks
and enclosing marks. It backtracks or returns the existing resource-limit
failure for an indivisible sequence. No general grapheme/ZWJ algorithm, enlarged
limit, public contract, dependency or component boundary is introduced.

## Consequences

Displayed text and code-point locator mapping remain immutable. Existing work,
cancellation and source/output bounds apply. Frozen normalizers, corpora,
normalization/limits authorities, completed M005 and historical evaluations stay
unchanged. Tests cover preserved contexts/source spans, accepted outputs, exact
limits, overflow, public one/many-batch equality and current cancellation controls.
