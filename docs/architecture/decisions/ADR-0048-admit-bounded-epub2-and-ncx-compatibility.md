# ADR-0048: Admit bounded EPUB 2 and NCX compatibility

## Status

Accepted on 2026-08-03 for Milestone 3.1 implementation. VoxLeaf remains
EPUB 3-only until that ExecPlan passes its final validation; this decision is
not implementation evidence by itself.

## Context

[ADR-0007](ADR-0007-secure-epub-ingestion-boundary.md) deliberately limited
the first secure-ingestion implementation to reflowable EPUB 3 packages with
an XHTML Navigation Document. It deferred EPUB 2 package documents, NCX-only
navigation, EPUB 2 `guide` semantics, and compatibility recovery until the
EPUB 3 path and the downstream reader/narration boundaries were proven.

Those boundaries are now implemented. The user has chosen to add a bounded
EPUB 2 compatibility profile before M011 records the final MVP release
decision. This is a parser and security-boundary expansion, not a request for
full EPUB 2 reading-system conformance.

The historical
[Open Packaging Format 2.0.1](https://idpf.org/epub/20/spec/OPF_2.0.1_draft.htm)
uses `version="2.0"`, requires title, language, and a package identifier, and
identifies the NCX through `spine@toc`. The NCX is a manifest resource with
media type `application/x-dtbncx+xml`; its `navMap` carries the hierarchical
reading navigation. EPUB 2 can also contain a `guide`, optional NCX page/list
navigation, deprecated resource types, DTBook, SVG, scripting, DTDs, and other
behavior outside VoxLeaf's safe semantic model. The
[EPUBCheck message authority](https://www.w3.org/publishing/epubcheck/docs/messages/)
confirms the package/NCX relationship but does not replace VoxLeaf's narrower
privacy and security profile.

## Decision

### Additive support profile

Milestone 3.1 may add exactly one new accepted package family:

- an OCF container using the existing bounded ZIP and `container.xml` path;
- one selected OPF package with exact `version="2.0"`, the canonical OPF
  namespace, and a valid `unique-identifier` reference;
- at least one nonempty Dublin Core `title`, `language`, and `identifier`;
- local reflowable `application/xhtml+xml` content documents in the existing
  safe semantic subset;
- at least one supported linear spine item; and
- one local NCX selected by `spine@toc` and projected into the existing
  internal navigation tree.

The current EPUB 3 profile remains accepted and unchanged. Rootfile selection
keeps the existing deterministic first-supported policy: malformed, unsafe,
cancelled, or over-budget work fails closed, while a valid unsupported
rendition may be skipped. EPUB 2 does not invent or require
`dcterms:modified`; that value remains required for EPUB 3 and absent from the
EPUB 2 internal profile. OPF 2 `dc:date` values are bounded and ignored rather
than reinterpreted as the EPUB 3 property. No shared serialized contract or
persisted reading-state version changes.

EPUB 2 support remains limited to XML XHTML with media type
`application/xhtml+xml`. Deprecated `text/x-oeb1-document`, DTBook,
out-of-line XML islands, SVG spine documents, fixed layout, scripting, forms,
remote dependencies, media overlays, DRM/protection, obfuscated-font
processing, CSS execution, and publisher-defined fallback behavior outside
ADR-0007 remain unsupported.

### OPF 2 metadata compatibility

The profile admits both OPF 2 metadata forms, but never a mixture of them:

- the modern form places Dublin Core elements and supplemental metadata
  directly under `metadata`; or
- the deprecated form contains exactly one `dc-metadata` wrapper for all
  Dublin Core elements and, optionally, exactly one `x-metadata` wrapper for
  supplemental metadata.

When the deprecated form is used, Dublin Core elements outside
`dc-metadata`, supplemental elements outside `x-metadata`, duplicate
wrappers, or nested/mixed wrapper forms are malformed. In either form,
`title`, `language`, `identifier`, and the `unique-identifier` relationship
have the same nonempty and duplicate-ID checks. Supported creators project
through the existing metadata model. Other Dublin Core values, OPF 2
`meta name/content` entries, and foreign supplemental metadata are bounded,
structurally validated, and ignored; they do not enter the public model.
Their element, attribute, text, depth, ID, cancellation, and deadline work
still consumes the existing ingestion budgets. No OPF 2 metadata value is
logged or used to synthesize `dcterms:modified`.

### NCX navigation

For an accepted EPUB 2 package:

- `spine@toc` is required and must identify exactly one manifest item with
  media type `application/x-dtbncx+xml`, a local path, and no fallback chain;
- the NCX root uses namespace `http://www.daisy.org/z3986/2005/ncx/` and exact
  version `2005-1`;
- exactly one nonempty `navMap` is required;
- each projected `navPoint` contains one bounded nonempty
  `navLabel/text`, one local `content@src`, and optional nested `navPoint`
  children;
- document order, not `playOrder`, is navigation order. Optional `id`,
  `class`, and `playOrder` values are bounded and validated but are not
  exposed or used to reorder nodes;
- `head`, `docTitle`, and `docAuthor` are bounded and structurally validated
  but do not replace OPF metadata or enter the public model; and
- optional `pageList` and `navList` are bounded, their content targets must
  satisfy the same local-reference rules, and they are not projected into the
  primary table of contents in this milestone.

The existing detailed-navigation budgets apply to the complete NCX, including
data that is validated and ignored. Every `navPoint`, `pageTarget`, and
`navTarget` consumes one of the aggregate 10,000 navigation nodes; the deepest
`navPoint` path cannot exceed 32 navigation levels; every `navLabel/text` is
limited to the existing 1,024 Unicode code points; and all NCX elements,
attributes, and text also consume the general XML and processing budgets.
Discarding `pageList`, `navList`, `head`, `docTitle`, or `docAuthor` does not
exempt their parsing from any limit.

Every projected NCX target must resolve through the existing case-sensitive
in-container resolver to a supported local manifest XHTML document. Fragments
remain opaque publisher-controlled matching values and never become renderer
DOM IDs. A target may retain the existing internal spine/non-spine
classification, but it cannot expose a path or URL publicly. Remote, queried,
undeclared, non-content, malformed, or over-budget targets fail through the
existing closed content-free error families.

The parser may admit either no NCX doctype or an `ncx` declaration whose
public identifier is exactly `-//NISO//DTD ncx 2005-1//EN` and whose system
identifier is exactly
`http://www.daisy.org/z3986/2005/ncx-2005-1.dtd`. XML-permitted declaration
whitespace may vary; the root name and both identifiers may not. The
declaration is inert compatibility data. The parser never
loads the DTD, registers a resolver, expands custom entities, changes the
entity table, or performs network/filesystem access. Internal subsets,
alternate external identifiers, and custom entity declarations/references
remain invalid. Presence of the inert declaration does not make VoxLeaf a DTD
validator and does not change the source-order policy above.

### XHTML and guide compatibility

EPUB 2 XHTML may contain no doctype or an `html` declaration whose public
identifier is exactly `-//W3C//DTD XHTML 1.1//EN` and whose system identifier
is exactly `http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd`. XML-permitted
declaration whitespace may vary; the root name and both identifiers may not.
When present, that declaration is counted, validated, and discarded without
resolving the DTD. Internal subsets, alternate identifiers, and DTD-defined
entity references remain invalid. The existing inert HTML doctype policy for
EPUB 3 is unchanged.

One optional OPF 2 `guide` after the spine is admitted. Every `reference`
must have bounded nonempty `type` and local `href` values and must resolve to
a declared supported XHTML content document, with an optional fragment. Its
optional `title` is bounded and must be nonempty when present. The guide is
validated and ignored: it is not a fallback for a missing or invalid NCX, is
not projected into navigation, and cannot affect reading order. Deprecated
OPF `tours` remain outside the admitted profile.

### Preserved security, identity, and lifecycle authority

EPUB 2 uses the same immutable ADR-0007 maxima for archive bytes, paths,
entries, decompression, XML depth/attributes/nodes/text, manifest/spine size,
navigation depth/nodes, semantic blocks, raster reads, and processing time.
It uses the same deterministic checkpoints, injectable clock, cancellation,
no-partial-publication cleanup, lazy raster lifecycle, exact-byte SHA-256 book
identity, locator assignment/resolution, closed errors, and content-free
privacy rules. Callers cannot select a looser policy.

The implementation must project OPF 2/NCX into the same immutable
`OpenedPublication`/`BookV1`/semantic/navigation/locator shapes consumed by
the reader and narration preparation. The reader, M005 narration
normalization/segmentation, shared contracts, persistence, TTS protocol,
audio, and package topology do not branch on EPUB version. Synthetic
equivalent EPUB 2 and EPUB 3 fixtures must prove that downstream behavior is
format-neutral. Their exact archives necessarily produce different SHA-256
book identities. Equivalence tests therefore compare semantic structure,
relative navigation, locator spine/anchor/offset behavior, restoration, and
narration after substituting each fixture's expected identity; they never
assert equal `bookId` values or byte-equal identity-bearing locators.

Milestone 3 remains historical evidence for the original EPUB 3 boundary.
The additive work belongs to the active Milestone 3.1 ExecPlan and must close
before M011 Milestone 7 can make the final MVP support claim.

## Consequences

- After Milestone 3.1 passes, VoxLeaf will be able to open a useful,
  explicitly bounded class of reflowable EPUB 2 books without trusting
  publisher markup or introducing a second reader.
- OPF and navigation parsing will become version-aware internally, but the
  public publication, locator, reader, and narration contracts will stay
  stable.
- The exact NCX/XHTML doctype exceptions enlarge the XML attack surface and
  therefore require exact-positive plus near-miss, external-identifier,
  internal-subset, entity, cancellation, and maximum-plus-one regressions.
- Once implemented, EPUB 2 files outside this profile will receive honest
  recoverable invalid or unsupported outcomes. VoxLeaf does not claim
  EPUBCheck or full EPUB 2 reading-system conformance.
- M011 release closeout waits for Milestone 3.1 and the affected packaged
  reader regression, but M011's installer, Piper, Chatterbox, and signing
  authorities remain otherwise unchanged.
- No copyrighted EPUB, private book, generated audio, model artifact, path,
  or publisher text may be added as evidence. Fixtures remain small,
  repository-authored, synthetic, and in memory.

## Alternatives considered

- **Defer EPUB 2 until after M011.** Rejected by the product decision to cover
  common legacy EPUBs before recording the MVP release outcome.
- **Claim full EPUB 2/EPUBCheck conformance.** Rejected because DTBook, SVG,
  CSS fidelity, scripts, deprecated OEB content, DTD entity semantics, page
  lists, tours, media, and protected publications exceed the safe MVP reader.
- **Use `guide` when NCX is absent.** Rejected because it creates an ambiguous
  fallback navigation policy and accepts packages that omit the EPUB 2 table
  of contents authority.
- **Convert NCX into publisher XHTML and feed the EPUB 3 navigation parser.**
  Rejected because synthesizing markup adds another transformation and trust
  surface; both formats can project directly into the same internal tree.
- **Adopt a renderer-oriented EPUB framework.** Rejected for the same reasons
  as ADR-0007: it would blur archive, URL, DOM, resource-loading, and
  application-renderer trust boundaries.
- **Permit arbitrary external DTD identifiers while disabling network.**
  Rejected because exact inert declarations cover the bounded compatibility
  need and are easier to audit than an open external-identifier grammar.
