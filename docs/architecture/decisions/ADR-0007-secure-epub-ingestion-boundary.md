# ADR-0007: Bound secure EPUB ingestion and its document model

## Status

Accepted

## Context

An EPUB is an untrusted ZIP container whose package and content documents can reference archive entries, remote resources, active content, styles, fonts, media, and encrypted data. Archive metadata, XML declarations, fallback graphs, and publisher markup can also consume excessive CPU or memory or attempt to escape the virtual container.

VoxLeaf needs a deterministic document representation for later visual reading and narration without extracting a book to disk, executing publisher code, fetching remote data, or copying sensitive content into errors or logs. The supported subset, resource budgets, identity, locator rules, errors, and ownership boundary must be fixed before archive/XML dependencies or public EPUB APIs are selected.

[EPUB 3.3](https://www.w3.org/TR/epub-33/) defines EPUB 3 package documents with the package `version` value `3.0`, case-sensitive virtual OCF paths, EPUB navigation documents, reflowable and fixed layouts, fallbacks, and core media types. [EPUB Reading Systems 3.3](https://www.w3.org/TR/epub-rs-33/) describes broader rendering behavior, but VoxLeaf does not claim full reading-system conformance in this milestone. Its privacy-first MVP intentionally supports a narrower, non-active, local subset.

## Decision

### Support profile

Milestone 3 accepts an EPUB only when all content needed for the default reading experience can be represented by the supported profile below:

- The selected package document declares EPUB `version="3.0"` and uses EPUB 3 metadata, manifest, spine, and an EPUB navigation document.
- `META-INF/container.xml` is processed in document order. VoxLeaf selects the first rootfile with media type `application/oebps-package+xml` whose well-formed package satisfies this profile. A valid but unsupported rendition may be skipped; malformed, unsafe, cancelled, or over-budget rootfile processing fails instead of falling through. A publication with no supported rootfile is unsupported.
- EPUB 2 package documents, NCX-only navigation, deprecated EPUB 2 guide semantics, and EPUB 2 compatibility recovery are deferred. They require a separate bounded compatibility spike and an amendment or superseding ADR.
- The default rendition is reflowable. A missing global `rendition:layout` is treated as reflowable. A fixed-layout-only publication is unsupported.
- A spine item is accepted only when it is supported reflowable XHTML or reaches supported reflowable XHTML through a finite manifest fallback chain. A required foreign, SVG, scripted, remotely hosted, protected, or pre-paginated spine item without that fallback makes the publication unsupported.
- Non-linear spine items may be represented when supported, but they do not replace the ordered linear reading path. At least one supported linear spine item is required.
- Multiple-rendition selection has no user interface in this milestone. Deterministic first-supported selection is the complete MVP policy.
- DRM circumvention, password handling, encrypted-resource decryption, obfuscated-font decoding, media overlays, audio/video playback, interactive content, and fixed-layout rendering are unsupported.

This is a documented VoxLeaf support profile, not a statement that rejected features are invalid EPUB.

### Input, archive, and processing boundary

`@voxleaf/epub` accepts one `Uint8Array` containing the complete candidate EPUB. It never accepts or returns a host path, extracts to disk, opens nested archives, creates network requests, or follows operating-system links.

The archive is inventoried before package or content interpretation. Implementations must:

- require valid ZIP/OCF signatures and the first, stored, unencrypted `mimetype` entry containing exactly `application/epub+zip` in US-ASCII;
- reject split/spanned archives, ZIP encryption, unsupported compression, ambiguous or inconsistent headers, overlaps, invalid signatures or CRCs, unsafe integers, prepended data, and unapproved appended data;
- allow ZIP64 only when every size and offset is a safe integer and all budgets pass;
- retain case-sensitive virtual paths and reject duplicate paths plus Unicode-normalized or case-folded collisions;
- reject absolute, drive-letter, UNC, backslash, empty-component, control/NUL, dot-segment, encoded traversal/separator, invalid UTF-8, over-budget, or special-file entry names;
- permit only regular files and directory entries, and reject symbolic links, hard links, devices, FIFOs, sockets, and other special entries; and
- preflight declared sizes, count observed decompressed bytes, stop at the first exceeded budget, and discard partial output.

Archive entry paths and document references are separate types. A reference is parsed as a scheme-less in-container URL relative to its validated base document. Query components, credentials, hosts, ports, backslashes, and non-local schemes are rejected. Fragment identifiers may identify structure but are never part of an archive lookup key. Resolution cannot produce a host path or network URL.

XML processing is namespace-aware and non-validating. It rejects every `DOCTYPE`, entity declaration, external identifier, XInclude, and external-resource request. Browser `DOMParser` is not an ingestion security boundary. The implementation uses bounded events and does not expose parser exceptions or source text.

### Authoritative security budgets

The following table is the single authority for Milestone 3 ingestion maxima. An exact maximum is allowed; the next representable count or byte fails. `MiB` means 1,048,576 bytes. Byte limits apply to declared values before work and observed values during work.

| Budget | Maximum |
| --- | ---: |
| Compressed EPUB input | 100 MiB |
| Archive entries, including directories | 4,096 |
| Total declared or observed uncompressed bytes | 512 MiB |
| One uncompressed archive entry | 64 MiB |
| `container.xml` or selected OPF document | 2 MiB |
| One navigation or XHTML document | 8 MiB |
| One raster image resource | 32 MiB |
| Archive path | 2,048 UTF-8 bytes |
| One path component | 255 UTF-8 bytes |
| Path components | 32 |
| Manifest items | 4,096 |
| Manifest fallback chain | 32 items |
| XML element depth | 128 |
| Attributes on one XML element | 256 |
| XML nodes in one XML document | 250,000 |
| Detailed navigation depth | 32 |
| Detailed navigation nodes | 10,000 |
| Spine items | 4,096 |
| Semantic blocks in one publication | 200,000 |
| Decoded publication text | 64 MiB UTF-8 equivalent |
| Processing time from ingestion start | 30,000 ms |

A compression ratio maximum of `100:1` applies independently to each file entry and to aggregate decompression after the first 1 MiB of observed uncompressed output in that scope. A zero compressed size with nonzero output fails. Absolute and ratio budgets both apply.

All archive, XML, graph, semantic, and resource work shares one immutable default policy. Callers and tests may supply only values equal to or stricter than these maxima; they cannot increase support. Declared values are never trusted as proof of observed use. The implementation must not materialize the full uncompressed archive or all image bytes together.

An `AbortSignal` and an injectable monotonic clock are checked at deterministic processing boundaries. Counters are the primary defense; elapsed time is secondary. Processing through exactly 30,000 ms is permitted, and the first observed value above it fails. Cancellation and budget failure return no partial publication.

### Content handling matrix

XHTML is projected into a new immutable semantic model through a closed allowlist. Publisher HTML, live DOM nodes, executable SVG, CSS, and trusted markup are never returned.

| Content | Policy |
| --- | --- |
| XHTML headings, paragraphs, block quotes, lists, emphasis, strong text, code, and line breaks | Project supported structure and text in source order |
| Unknown inert XHTML containers | Traverse safe descendants; do not preserve the element itself |
| Scripts and event handlers | Remove; never execute |
| Forms, `iframe`, `object`, `embed`, and `canvas` | Remove; retain only safe fallback text or an inert placeholder when meaningful |
| Remote publication resources and images | Never fetch; omit when nonessential, otherwise return unsupported input |
| External links | Preserve only an inert label; do not expose an activatable URL from ingestion |
| Internal links | Resolve only through the validated case-sensitive in-container map |
| `data:`, `file:`, `javascript:`, `blob:`, and custom schemes | Reject for resource loading |
| Style elements/attributes, stylesheets, and fonts | Drop |
| Explicit `hidden` or `aria-hidden="true"` content | Omit |
| CSS-derived visibility | Not evaluated; document as a rendering limitation until Milestone 4 |
| SVG markup or SVG spine documents | Never return executable markup; use safe alternative text/placeholder or return unsupported input when essential |
| MathML or other unsupported embedded vocabularies | Use safe alternative text when present; otherwise omit or return unsupported input when essential |
| Audio, video, and media overlays | Ignore when nonessential; otherwise return unsupported input |
| Raster images | Accept local `image/gif`, `image/jpeg`, `image/png`, and `image/webp` only when declared type, signature, locality, and byte budgets agree |
| DTDs, entity declarations, external entities, and XInclude | Reject the XML document |
| ZIP or EPUB encryption/protection | Reject; never decrypt |
| Obfuscated fonts | Ignore because fonts are not loaded |

This milestone validates and exposes bounded raster bytes lazily but does not decode or render them. Pixel, animation, and renderer-specific safety limits must be resolved before Milestone 4 decodes those resources.

The opened-publication implementation derives raster descriptors from validated manifest order and retains archive paths only in a private binding. It preflights each declared uncompressed size against the raster limit, permits one resource read at a time, and validates the GIF, JPEG, PNG, or WebP leading signature only after the bounded CRC-checked archive read completes. Each successful read returns that read's new caller-owned allocation; the handle does not cache resource bytes, create object URLs, or access a filesystem or network. Per-read abort cancels only that operation. Closing marks the handle closed immediately, cancels and awaits any active read, releases the archive exactly once, and makes later reads fail through a fixed content-free error. Signature validation is not image decoding and does not establish pixel or animation safety.

The semantic projector reads one bounded XHTML document through the namespace-aware event stream and publishes a document only after the complete XML input succeeds. The XHTML `html`/`body` grammar and semantic block nesting must be valid. Direct safe inline runs inside inert block containers become paragraphs; empty semantic blocks are omitted. Each emitted heading, paragraph, block quote, or list consumes the publication-wide semantic-block budget.

`xml:lang` and XHTML `lang` are inherited as opaque language context and must agree when both occur on one element. `dir` is inherited from the closed `auto`, `ltr`, or `rtl` set. Ordinary ASCII XML whitespace is collapsed to one separator across inline boundaries and trimmed at block edges. Code text retains its exact XML character data; adjacent ordinary whitespace is not duplicated when that code text already supplies boundary whitespace. CSS `white-space`, generated content, and CSS-derived visibility are not evaluated because publisher CSS never crosses the ingestion boundary.

Local content and raster references become deterministic opaque IDs derived from validated manifest order. Internal link fragments remain branded publisher-controlled matching data, not renderer DOM IDs. External or unsafe links retain only projected descendants, remote images are omitted, and neither publisher paths nor URLs appear in semantic output.

### Identity, document-model ownership, and privacy

Book identity is SHA-256 over the exact input bytes before decompression:

- `scheme` is `sha256`;
- `schemeVersion` is `1`; and
- `value` is the 64-character lowercase hexadecimal digest.

OPF identifiers, title, author, filename, and host path are metadata and never define identity.

`@voxleaf/shared` remains the authority for serialized `BookV1`, `ReadingLocatorV1`, `LocatorRangeV1`, and `OperationalErrorV1` contracts. This ADR does not change a published shared schema.

`@voxleaf/epub` owns the framework-independent, immutable semantic document, detailed navigation, package relationships, resource descriptors and handles, locator indexes, EPUB detail errors, and explicit close/release lifecycle. These types do not depend on React, Tauri, the DOM, Python, TTS, audio, persistence, or filesystem APIs.

Metadata, alternative text, markup, prose, URLs, and bytes are sensitive in-memory content. They are not automatically serialized or persisted and must never enter logs, metrics, error values, stack text returned to callers, or debug snapshots. The EPUB package performs no logging.

### Locator policy

Every addressable semantic block receives one deterministic locator anchor in final source order:

- preserve a source element ID only when it is unique, satisfies the shared v1 anchor grammar, and fits its bound;
- otherwise generate a collision-free ID from the spine item identity and zero-based anchor order, never from prose, metadata, randomness, layout, or a host path;
- store `anchorIndex` as structural order and interpret `textOffsetCodePoints` as a Unicode code-point offset;
- treat progression as recovery/display metadata, never position authority; and
- validate every emitted locator through the existing shared decoder.

Exact resolution requires matching book identity, spine ID and index, anchor ID and index, and a legal text offset. Recovery never searches prose: it tries the matching spine and nearest legal structural position, then the nearest supported spine, then book start. It returns exact/recovered state plus a fixed content-free reason. A wrong book identity never resolves.

The concrete generated-anchor spelling and recovery reason enum remain internal implementation details and follow this policy deterministically before publication.

The Task 5.1 implementation defines every final `SemanticBlock` as addressable and orders nested structures by source-start preorder: a block quote or list precedes its addressable descendants. The XHTML projector retains source IDs only in a package-internal sidecar; an `id` or `xml:id` is eligible only when it identifies exactly one source element and one resulting block, and conflicting values on one element fall back without rejecting the document. The shared v1 locator decoder is the grammar and length authority. Ineligible IDs receive `voxleaf-s<spine-index>-a<anchor-index>` replacements with deterministic numeric collision suffixes, while the locator itself carries the exact-byte book identity plus spine ID/index.

Every block start has offset zero. Heading and paragraph offsets count the final semantic inline representation by Unicode code point: nested inline containers contribute their children, line breaks contribute one newline position, and raster images contribute one object-replacement position rather than alternative-text length. Structural block quotes and lists expose only offset zero because their child blocks own descendant text offsets. Optional progression remains non-authoritative recovery/display metadata and is omitted from canonical index-derived results. Assignment and validation run under the ingestion processing budget and publish no partial index on failure.

The Task 5.2 resolver validates untrusted locator structure through the shared v1 decoder before consulting the immutable index. Exact results require the complete book, spine, anchor, and offset tuple. In a matching non-empty spine, recovery first prefers the unique anchor value, otherwise clamps structural anchor order, and clamps the offset to the selected block's legal Unicode-code-point range. A matching empty spine moves to the nearest non-empty spine by absolute spine distance with the earlier spine winning a tie. An inconsistent spine ID/index pair falls back to the first addressable block; a wrong book or publication without any addressable block fails with `locator-unresolved`. Spine and book fallback restart at offset zero, all results carry fixed `exact`, `nearest-offset`, `nearest-anchor`, `nearest-spine`, or `book-start` reasons, and no step searches prose, pages, layout, metadata, paths, or URLs. Index construction and matching details remain package-internal; the public opened-publication handle exposes immutable start locators and synchronous exact/recovery resolution with optional operation cancellation.

### Error boundary

Expected ingestion failures use a discriminated result containing a closed EPUB detail code and the existing `OperationalErrorV1` value:

| Failure family | `OperationalErrorV1` code |
| --- | --- |
| Invalid ZIP, OCF, mimetype, XML, package, navigation, XHTML, relationship, path, signature, or locator input | `invalid-input` |
| Unsupported EPUB version, rendition, spine content, protection, media, or fallback | `unsupported-input` |
| Caller abort | `operation-cancelled` |
| Processing deadline exceeded | `operation-cancelled` |
| Any byte, count, ratio, depth, graph, node, or text budget exceeded | `resource-exhausted` |
| Unexpected invariant or dependency failure | `internal-failure` |

The initial closed EPUB detail codes are `invalid-container`, `unsafe-entry`, `malformed-xml`, `malformed-package`, `broken-reference`, `unsupported-version`, `unsupported-layout`, `unsupported-resource`, `unsupported-protection`, `locator-unresolved`, `resource-limit-exceeded`, `cancelled`, and `internal-failure`.

No error includes a filename, path, metadata value, URL, markup, prose, bytes, dependency message, parser message, stack, or raw rejected value. Presentation layers map fixed codes to safe user-facing text.

The Task 6.1 implementation exposes one runtime entry point, `openEpubPublication(bytes, { signal? })`. It executes the complete bounded ingestion pipeline and catches every stage before returning either `{ ok: true, publication }` or `{ ok: false, detail, error }`. `detail` is one of the closed EPUB codes above and `error` is created by the existing `OperationalErrorV1` factory. Unknown exceptions become `internal-failure`; neither dependency exceptions nor their message, stack, cause, or rejected input are retained. If any stage fails after the archive opens, the archive is closed before the failure value is returned, so no partial publication or resource handle escapes.

Successful publications expose immutable manifest-order semantic documents and detailed navigation, path-free lazy raster descriptors, deterministic start locators for every addressable spine block, structural exact/recovery resolution, and explicit close. Locator resolution uses a fresh bounded operation budget so a long-lived opened publication does not inherit the ingestion deadline. This adds no serialized shared-contract field and no filesystem, network, worker, renderer, persistence, or logging capability.

The Milestone 4 Task 2.1 implementation adds synchronous `OpenedPublication.resolveTarget(input, { signal? })` without changing the shared schemas. A package-private index joins each supported document and its unique addressable XHTML source IDs to canonical located blocks. Fragmentless spine targets and unique addressable fragments resolve exactly; missing, duplicate, and non-addressable fragments recover only to the same document start. Malformed, unknown, non-spine, and empty-document targets return frozen content-free unavailable outcomes. Source fragments never become renderer IDs or result fields, and cancellation, post-close access, and internal invariant failures continue through fixed EPUB errors.

### Dependency decision boundary

This ADR did not preselect a ZIP or XML package. Task 1.2 subsequently selected exactly pinned `@zip.js/zip.js@2.8.30` and `saxes@6.0.0` after package-internal executable probes established the required ESM/build behavior, strict ZIP controls, external-entity rejection, cancellation, content-free error mapping, absence of runtime network/filesystem/worker behavior, acceptable licenses and transitive graphs, and reviewed package impact. Production ingestion uses those same narrow adapters; dependency details and replacement criteria are recorded in [`../../development/dependencies.md`](../../development/dependencies.md).

A renderer-oriented EPUB framework remains prohibited in the ingestion core. The selected low-level packages are implementation details rather than public API, so either can be replaced behind the established archive/XML boundary if future security or maintenance evidence requires it.

## Consequences

- Implemented ingestion has one exact support and budget authority, with every maximum and maximum-plus-one boundary tied to focused regression evidence.
- Normal reading remains local: archive bytes, resources, publisher markup, and prose are not sent to a network service or extracted to disk.
- A closed semantic projection prevents publisher markup from becoming trusted application UI.
- EPUB 2, fixed-layout, active, protected, remotely dependent, SVG-dependent, and media-dependent publications produce explicit recoverable unsupported outcomes instead of partial or unsafe rendering.
- Strict limits may reject unusually large but valid EPUBs. Increasing a limit requires benchmark and security evidence plus an ADR amendment; callers cannot opt out.
- Dropping CSS can include text that publishers hide only through the cascade. Milestone 4 must preserve this documented limitation or introduce a separately reviewed safe-style policy.
- Byte-valid raster images are not yet proven safe to decode. Renderer-specific limits remain a required gate for Milestone 4.
- Deterministic byte identity changes whenever any EPUB byte changes, even if visible content does not. This is intentional because a changed container must not inherit trust or exact locator assumptions silently.
- Narrow low-level dependency adapters remain replaceable and do not become public APIs.

## Alternatives considered

- **Support EPUB 2 and NCX immediately:** rejected for the MVP boundary because it adds legacy parsing and fallback behavior before the EPUB 3 path is proven. A bounded later spike may add it explicitly.
- **Use a renderer-oriented EPUB framework for ingestion:** rejected because URL creation, DOM ownership, rendering, and resource loading blur the trust boundary and add capabilities this milestone must exclude.
- **Sanitize and return publisher HTML:** rejected because a sanitizer configuration would become a broad executable-content boundary and could leak active or remotely coupled behavior. Constructing closed semantic values is easier to audit and test.
- **Extract the archive to a temporary directory:** rejected because host filesystem paths, cleanup, symlinks, races, permissions, and persistent book data would enlarge the attack and privacy surface.
- **Allow remote resources with HTTPS:** rejected because normal reading must not disclose book access or require network connectivity.
- **Use OPF publication identifiers for book identity:** rejected because they are publisher-controlled, optional in quality, and not guaranteed unique or content-free.
- **Make budgets caller-configurable in both directions:** rejected because a permissive caller could bypass the security boundary. Only equal or stricter policies are allowed.
- **Use only a wall-clock timeout:** rejected because it is nondeterministic and does not bound memory. Explicit counters remain primary.
