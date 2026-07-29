# Narration normalization v2

## Status and authority

This document freezes the planned `narration-bilingual-v2` authority before
implementation or v7 result audio. The machine-readable synthetic corpus is
[`normalization-corpus-v2.json`](../../benchmarks/tts/normalization-corpus-v2.json).

Historical `narration-v1` bytes, tests, behavior, and claims remain immutable.
This profile is a new package-owned authority; it does not edit
[`narration-normalization-v1.md`](narration-normalization-v1.md) or the
Piper-specific spoken-unit sizing profile.

## Product language boundary

The caller supplies exactly one explicit language, `es` or `en`. There is no
statistical or heuristic language detection and no translation. A semantic
language annotation does not switch the active product language within one
narration unit; unsupported mixed input is preserved conservatively.

For Spanish, `narration-bilingual-v2` delegates to the existing accepted
`narration-v1` Spanish rules and must produce byte-identical narration text,
locator ranges, boundaries, measurements, and failures for the same request.

For English, the new closed rules may expand only the accepted corpus forms:

- contextual titles and abbreviations;
- bounded cardinals and ordinals;
- unambiguous ISO dates and 24-hour times;
- exact U.S. dollar and cent forms;
- percentages, context-safe ampersands, and exact Celsius forms; and
- closed dotted initialisms.

Ambiguous slash dates, unsupported magnitudes, version-like tokens, code,
foreign names, malformed punctuation, quotations, dialogue punctuation, and
ellipses remain unchanged unless a later versioned corpus explicitly accepts
another behavior.

## Locator preservation

Displayed text never changes. Each emitted or omitted narration unit keeps the
existing block-local source span and produces the same half-open stable
locator-range convention as M005. Expansion cannot invent a source location or
widen across a semantic block.

The M005 source-window, segment, UTF-8, work, checkpoint, yield, batching,
retention, cancellation, close, and no-partial-result bounds remain binding.
English implementation must add bounded tables and scanners rather than
unbounded locale services or regular expressions.

## Engine boundary

Canonical normalization belongs only to `@voxleaf/epub`. An engine adapter may
perform a proven, exact request-format or token-budget operation, but it may
not repeat or replace number, punctuation, whitespace, abbreviation, date,
currency, or symbol normalization.

Candidate-specific normalization supplied by Chatterbox, MOSS, or another
engine is disabled when possible. If an unavoidable candidate transformation
changes canonical meaning, locators, or accepted punctuation behavior, that
candidate fails the v7 screen.

## Validation

Milestone 2 must add table-driven tests for every frozen corpus case,
max-plus-one resource cases, idempotence, Spanish byte regression, source
immutability, exact locator resolution, deterministic batching, cancellation,
and content-free failures. Passing normalization tests are necessary but do
not establish audible quality or product support.
