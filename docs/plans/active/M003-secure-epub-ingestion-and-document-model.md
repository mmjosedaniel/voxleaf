# Build secure EPUB ingestion and the document model

## Goal

Complete roadmap Milestone 3 by converting untrusted local EPUB bytes into a bounded, deterministic, framework-independent document representation that later reader and narration milestones can consume safely.

The milestone validates the container before interpreting publication data, prevents archive and markup attacks, extracts ordered metadata/navigation/content without network or script execution, creates stable logical locators, and exposes content-free failures. It does not render content, persist extracted text, start TTS, or add native file permissions.

## User-visible outcome

There is no complete reader yet. Contributors gain a tested EPUB package that can ingest safe synthetic EPUB bytes and return validated metadata, spine order, navigation, semantic content, local image references, stable locators, and bounded resource access. Milestone 4 will connect a reviewed file-selection boundary and renderer.

## Background and current state

- Milestone 1 established the reproducible pnpm/TypeScript/Python/Rust/Tauri workspace, root quality commands, and Windows/Ubuntu CI.
- Milestone 2 established versioned BookV1, ReadingLocatorV1, LocatorRangeV1, OperationalErrorV1, deterministic fakes, shared fixtures, and cross-language conformance.
- The implementation base is `main` at `c8a1c77`, which contains PR #18 merge commit `86db4c4` and the accepted Milestone 3 plan. Task 1.1 is completed on the focused `docs/m3-secure-ingestion-adr` branch.
- Milestone 2 validation passed 175 shared tests, 2 EPUB tests, 1 desktop test, 3 Python tests, the Rust harness, builds, and both CI jobs.
- @voxleaf/epub has an empty production export and one public-boundary test using @voxleaf/shared. It has no archive/XML/DOM/sanitizer/hash/locator implementation.
- The synthetic document fixture models multiple spine items, headings, paragraphs, dialogue, a scene boundary, navigation, and local image metadata, but never opens an archive.
- The desktop/Tauri shell has no EPUB consumer, file command, plugin, or native capability. The Python/TTS/audio areas are unrelated.

The older synchronized-reader plan remains requirement context, not the implementation authority for this milestone.

## Relationship to the roadmap

This plan implements only Milestone 3:

- validate malformed, unsupported, path-traversing, ambiguous, encrypted, and resource-exhausting EPUB input;
- extract metadata, manifest, spine, navigation, readable XHTML, local image metadata, and structural boundaries;
- remove or isolate scripts, remote resources, hidden noise, unsafe markup/SVG/styling, and irrelevant navigation;
- create and resolve stable locators with deterministic fallback;
- prove behavior with synthetic fixtures.

It prepares Milestone 4 rendering/restoration and Milestone 5 narration preparation without starting either.

## Readiness assessment

Milestone 3 is ready at the repository level because PR #18 is merged and no unresolved Milestone 1 or 2 prerequisite remains. The branch is based on updated `main`, and Task 1.1 accepts the support/security boundary in ADR-0007. Task 1.2 is the next task and must prove archive/XML candidates before any production dependency or ingestion API is adopted. No ingestion implementation exists yet.

## Scope

- Decide the supported EPUB subset and explicit unsupported-content policy.
- Define immutable archive, XML, document, resource, and processing budgets.
- Select narrowly scoped ZIP/XML dependencies after executable security probes.
- Accept bounded Uint8Array input, never a host path.
- Validate ZIP/OCF structure and virtual paths without disk extraction.
- Parse container.xml and the selected OPF package with namespace-aware, external-entity-free XML.
- Parse metadata, manifest/fallbacks, spine order, navigation, and reflowability.
- Compute an opaque SHA-256 identity from exact EPUB bytes.
- Project supported metadata/resources/spine/navigation into existing shared contracts.
- Export an immutable @voxleaf/epub semantic document model.
- Project supported XHTML through an allowlist instead of returning publisher markup.
- Provide bounded cancellable access to supported local images without eager extraction.
- Assign deterministic anchors and implement exact/recovery locator resolution.
- Return stable, content-free EPUB result codes mapped to OperationalErrorV1.
- Add deterministic synthetic valid, malformed, adversarial, and boundary fixtures.
- Document actual dependencies, support, security rules, tests, and limitations.

## Non-goals

- File picker, filesystem access, Tauri commands/plugins/capabilities, or IPC.
- Rendering HTML/CSS/SVG/images, pagination, scrolling, themes, or typography.
- Returning trusted HTML or live publisher DOM nodes.
- Executing scripts, event handlers, forms, media, SVG animation, or publisher code.
- Fetching remote resources or following external links.
- DRM circumvention, password handling, encrypted-resource decryption, or obfuscated-font support.
- Extracting to disk or persisting book text/resources.
- Full EPUBCheck conformance or recovery of every invalid publication.
- Fixed-layout, comics, media overlays, interactive publications, or multiple-rendition UI.
- Publisher CSS rendering; Milestone 4 owns rendering and any safe-style subset.
- Narration normalization/chunking, TTS, audio, persistence, or hardware work.
- Silently changing a published shared schema. Any proven need requires a plan amendment and explicit new contract version.

## Definitions

- **Archive entry path:** case-sensitive virtual path inside the ZIP; never an OS path.
- **Package document:** OPF XML carrying metadata, manifest, and spine.
- **Content document:** supported reflowable XHTML selected by spine/fallback.
- **Semantic model:** immutable allowlisted blocks/inlines, not publisher DOM or shared wire schema.
- **Structural anchor:** deterministic element ID plus zero-based order used by ReadingLocatorV1.
- **Exact resolution:** same book, spine, anchor, and legal code-point offset.
- **Recovery resolution:** documented nearest structural position when exact resolution fails.
- **Resource budget:** immutable byte/count/depth/time maximum enforced before and during work.
- **Unsupported content:** structurally valid behavior outside the accepted MVP subset.
- **Sensitive content:** metadata, text, markup, URLs, and bytes that may exist only in bounded memory and must not enter logs/errors/persistence.

## Dependencies and prerequisites

Completed prerequisites:

- pnpm lock/install, strict TypeScript, Vitest, root checks, and CI.
- ADR-0003 stable locator rules and ADR-0006 contract/version rules.
- BookV1, ReadingLocatorV1, LocatorRangeV1, and OperationalErrorV1.
- Synthetic document/fake-source support.
- One-way @voxleaf/epub to @voxleaf/shared dependency.

PR #18 merge commit `86db4c4` is in the implementation branch history. Task 1.1 was completed from `main` at `c8a1c77`; subsequent tasks must continue on focused branches based on an updated main and must not use a Milestone 2 branch.

Task ordering:

- All implementation depends on Task 1.1.
- Archive/XML adapters depend on Task 1.2.
- Package parsing depends on safe inventory/path/XML layers.
- XHTML/navigation/resources depend on validated package relationships.
- Locators depend on final semantic order and SHA-256 identity.
- Integration tests depend on the deterministic archive builder.
- Closeout depends on every focused task.

## Relevant files and documentation

- AGENTS.md and .agents/PLANS.md
- README.md and docs/README.md
- docs/plans/roadmap.md
- completed Milestone 1 and Milestone 2 ExecPlans
- active synchronized-reader-and-startup-buffer plan
- docs/product/vision.md, project-brief.md, mvp.md, and glossary.md
- docs/architecture/overview.md, performance-budget.md, ADR-0003, ADR-0005, ADR-0006, and ADR-0007
- docs/development/setup.md, testing.md, dependencies.md, and git-workflow.md
- packages/epub manifest, source, tests, and TypeScript configuration
- shared book, locator, error, schema, and synthetic-document areas
- root package.json, pnpm-lock.yaml, and foundation CI workflow

## Technical decisions already made

- EPUB content remains local and untrusted.
- @voxleaf/epub owns ingestion and stays independent of React, Tauri, Python, TTS, audio, and persistence.
- @voxleaf/shared owns cross-component serialized contracts and has no reverse EPUB dependency.
- Locators, not page numbers, paths, or prose quotations, are position authority.
- Book identity contains no private path or prose.
- Untyped/shared inputs fail closed; operational failures are content-free.
- Tests use synthetic content.
- Windows is authoritative; Ubuntu CI validates portable TypeScript behavior.
- New dependencies require purpose, alternatives, classification, lock update, and documentation.

## Accepted Task 1.1 decisions

[ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md) is the authority for the support profile, security budgets, content matrix, identity, model ownership, locator policy, error boundary, and deferred cases. It accepts the recommended EPUB 3 reflowable baseline, bytes-only local ingestion, closed semantic projection, SHA-256 byte identity, shared/internal model split, deterministic content-free locators and errors, counters plus cancellation/deadline, and no network/filesystem execution boundary.

EPUB 2/NCX, fixed layout, active/remote/protected content, renderer frameworks, publisher HTML, and permissive caller-controlled limits are explicitly unsupported or deferred with rationale. ZIP and XML package selection remains intentionally deferred to Task 1.2, which must prove candidate behavior against ADR-0007 before adding a production dependency.

## Security model and trust boundaries

Boundary sequence:

1. A future desktop boundary supplies bytes; this milestone does not read a path.
2. @voxleaf/epub caps input before parsing and computes byte identity.
3. The archive adapter inventories entries without disk extraction.
4. Canonical path/reference logic rejects unsafe or ambiguous names.
5. Declared sizes are preflighted and observed output is counted during decompression.
6. The XML adapter parses only bounded bytes, with namespaces and no DTD/entities.
7. Package relationships resolve only against the validated in-container map.
8. XHTML becomes immutable allowlisted nodes; publisher markup is never trusted.
9. Resource reads expose only supported local bounded bytes.
10. Failures become fixed content-free codes; raw dependency exceptions are not exposed or logged.

Archive rules:

- Require ZIP signatures and first, stored, unencrypted mimetype containing exactly application/epub+zip in US-ASCII.
- Reject spanning/splitting, encryption, unsupported compression, ambiguous headers, overlaps, failed CRC/signature, unsafe sizes, prepended data, and unapproved appended data.
- Allow ZIP64 only when sizes are safe integers and budgets pass.
- Reject duplicate/canonical-collision names, absolute/drive/UNC/backslash paths, controls/NUL, dot segments, encoded traversal/separators, invalid UTF-8, overlong/deep paths, symlinks, devices, FIFOs, sockets, and other special entries.
- Keep paths virtual and case-sensitive; allow only directories and regular files.
- Never recursively open an archive resource; nesting depth is zero.

### Authoritative limits

ADR-0007 is the single authority for every exact Milestone 3 byte, count, ratio, path, graph, XML, navigation, semantic, and processing-time maximum. Implementations and tests may only use the accepted policy or a stricter override. Declared metadata is not trusted; stop at the first observed excess, discard partial output, and never materialize the full uncompressed archive or all images together.

### Content handling

ADR-0007's closed content matrix governs projection and unsupported outcomes. In summary: scripts never execute, network resources never load, publisher CSS/fonts and executable SVG never cross the boundary, only validated local bounded raster formats are exposed lazily, DTD/entity/XInclude input is rejected, protected content is never decrypted, and publisher XHTML is rebuilt as immutable semantic values rather than returned as trusted markup.

## EPUB ingestion strategy

1. Validate type and compressed size.
2. Compute SHA-256 of exact bytes.
3. Open strict archive and inventory entries.
4. Validate mimetype, ZIP features, entry kinds, paths, sizes, ratios, and totals.
5. Parse META-INF/container.xml under XML budgets.
6. Resolve the first supported package rootfile through the canonical map.
7. Parse OPF metadata, manifest, fallbacks, spine, and rendition properties.
8. Parse supported navigation through the same resolver.
9. Resolve each spine item to supported reflowable XHTML through a finite fallback chain.
10. Parse XHTML one document at a time into semantic nodes.
11. Build lazy local resource descriptors.
12. Assign deterministic anchors and construct shared locators.
13. Validate BookV1 and all locators against the final model.
14. Return immutable document/resource access with explicit close/release.

Archive, XML, package, content, resource, locator, and error layers remain separate for focused tests.

## Parsing libraries and abstractions

Use two narrow internal interfaces:

- ArchiveReader: validated metadata and bounded cancellable entry reads from Uint8Array.
- XmlEventReader: namespace-aware start/end/text events under budgets.

@zip.js/zip.js and saxes are candidates. Task 1.2 must prove ESM/build support, strict ZIP controls, no external entity behavior, cancellation, safe error mapping, no worker/network/filesystem requirement, license compatibility, and acceptable transitive/bundle impact. If either fails, record the evidence and compare a narrow replacement. Do not adopt a complete renderer framework.

## Document-model design

Shared authority remains:

- BookV1 for identity, title/authors, supported resources, ordered spine, and coarse navigation.
- ReadingLocatorV1/LocatorRangeV1 for positions.
- OperationalErrorV1 for cross-component failure semantics.

@voxleaf/epub owns immutable:

- OpenedEpubPublication: document, bounded resource reader, close/release.
- EpubDocument: BookV1 projection, package profile, spine documents, detailed navigation, resources, locator index.
- EpubPackageProfile: accepted EPUB version, languages, reflowability, content-free support flags.
- EpubSpineDocument: shared ID/index, linearity, language/direction, blocks, progression.
- EpubBlock: closed heading/paragraph/blockquote/list/list-item/image/scene-boundary union justified by fixtures.
- EpubInline: closed text/emphasis/strong/code/line-break/internal-link/inert-external-label union.
- EpubNavigationNode: label, resolved locator, children.
- EpubResourceDescriptor: opaque ID, validated local path, accepted type, sizes, role.
- LocatorResolution: exact/recovered plus safe reason.

Book/alternative text stays sensitive in memory and is not automatically serialized, persisted, logged, or included in errors.

### Anchor and resolution policy

- Traverse final addressable blocks in source order.
- Preserve a valid unique source ID; otherwise generate a deterministic ID from spine identity and anchor order, never text.
- Resolve collisions deterministically; never use randomness.
- anchorIndex is structural order; validate textOffsetCodePoints against Unicode code points.
- Progression is deterministic recovery/display metadata, never authority.
- Exact resolution checks book, spine ID/index, anchor ID/index, and offset.
- Recovery uses matching spine/nearest anchor/offset, then nearest supported spine, then book start; it returns a safe reason and never searches prose.

Task 5.1 must prove this before acceptance.

## Error-handling strategy

Expected failures return a discriminated result:

| EPUB family | OperationalErrorV1 |
| --- | --- |
| invalid ZIP/mimetype/container/package/nav/XHTML/relationship/signature | invalid-input |
| unsupported version/layout/content/encryption/media/fallback | unsupported-input |
| abort/deadline cancellation | operation-cancelled |
| any resource budget exceeded | resource-exhausted |
| unexpected invariant/dependency failure | internal-failure |

The EPUB detail enum should include safe codes such as invalid-container, unsafe-entry, malformed-package, broken-reference, unsupported-layout, unsupported-resource, locator-unresolved, resource-limit-exceeded, and cancelled. It must exclude filenames/paths, metadata, URLs, markup, text, bytes, dependency messages, stacks, and raw validation errors. The package performs no logging.

## Testing and fixture strategy

Fixture construction:

- Generate EPUBs in memory from repository-authored synthetic text.
- Fix entry order, timestamps/attributes, and compression; do not call an OS ZIP tool.
- Keep builders test-only and out of production exports.
- Prefer generated fixtures over committed opaque binaries.
- For impossible malformed writer states, use the smallest reviewed byte-level/base64/hex builder with the manipulated field documented.
- Reuse Milestone 2 concepts/fixed IDs when useful, but do not generate expected output through the parser under test.

Valid scenarios:

- Minimal EPUB; multi-spine metadata/nav/paragraph/dialogue/list/scene/image/internal-link EPUB.
- Missing and duplicate source IDs with stable generated anchors.
- Accepted nonlinear/fallback cases.
- Exact budget boundaries.
- Repeated identical bytes produce identical identity, order, anchors, locators, and failures.

Invalid/adversarial scenarios:

- Empty/non-ZIP/wrong magic; every invalid mimetype form.
- Spanning, unsupported compression, encryption, CRC failure, ambiguity, overlap, appended/prepended data, unsafe ZIP64.
- Absolute/drive/UNC/backslash/control/dot/encoded traversal, depth/length, UTF-8, collision, symlink/special entries.
- Every input/entry/aggregate/ratio/XML/node/text/image/block/time/cancellation maximum-plus-one.
- Nested archive.
- Missing/malformed/DTD/entity container and unsafe rootfile.
- Malformed OPF, duplicate IDs/paths, broken idrefs, fallback cycle/depth, missing spine, unsupported version/layout/media, required remote/protected resource.
- Malformed nav/targets/depth/count.
- Malformed XHTML, DTD/entity, scripts/handlers/dangerous schemes/remote images/active elements/SVG/styles/hidden/excessive markup.
- Image type/signature mismatch, oversize, unsupported, missing.
- Wrong-book/stale-spine/missing-anchor/mismatched-order/illegal-offset locators and recovery.
- Canary privacy checks against all public errors/diagnostics.

Test levels:

- Unit: paths/references, budgets, XML events, relationships, semantic projection, identity, anchors, resolver, errors.
- Integration: in-memory EPUB bytes through public output/resource/locator APIs.
- Security regression: adversarial ZIP/XML/XHTML and exact boundaries.
- Optional fuzzing must use fixed seeds and justify any dependency.
- No real time, filesystem, network, browser, UI, TTS, audio, GPU, or real book.

Security timing uses deterministic counters and injected monotonic time. Measurements may be recorded, but no user-facing performance claim belongs here.

## Expected affected areas

- packages/epub manifest, exports, implementation modules, tests, fixtures, and test configuration.
- pnpm-lock.yaml for accepted dependencies.
- one secure-ingestion ADR.
- architecture overview, dependency inventory, testing guide, and this plan.
- product/roadmap only if evidence changes an accepted requirement.

Shared schemas are not expected to change. Desktop, Tauri, Python/TTS, audio, and persistence areas remain unchanged.

## Existing validation commands

~~~powershell
git diff --check
pnpm.cmd install --frozen-lockfile
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd check
~~~

Do not claim a new script exists until it is added and executed.

## Implementation milestones and tasks

## Milestone 1: Resolve the security/dependency gate

### Task 1.1: Accept the support, security-budget, and model-boundary ADR

**Outcome:** One accepted ADR records versions/layouts, limits, identity, content matrix, model ownership, locators, errors, and unsupported cases.

**Dependencies:** PR #18 merge commit 86db4c4; updated local main; roadmap/ADR-0003/ADR-0006.

**Areas:** architecture decisions/overview and this plan.

**Acceptance:** Every unresolved choice is accepted/replaced/deferred with rationale; exact limits are centralized; no dependency or application code is added.

**Validation:** `git diff --check`; `pnpm.cmd format:check`.

**Status:** Complete. ADR-0007 accepts or explicitly defers every listed decision, centralizes all exact limits, and adds no dependency or application code. `git diff --check` and `pnpm.cmd format:check` passed on 2026-07-21.

### Task 1.2: Prove and select archive/XML dependencies

**Outcome:** Executable probes prove the selected ZIP/XML libraries and lock/document exact versions.

**Dependencies:** Task 1.1.

**Areas:** EPUB manifest/adapters/tests, lockfile, dependency docs.

**Acceptance:** ESM/build works; strict ZIP and no-DTD/entity behavior is tested; no DOM/renderer/filesystem/network/worker download; licenses/purpose/alternatives/transitives documented; failed candidate code removed.

**Validation:** `pnpm.cmd install --frozen-lockfile`; `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`; `git diff --check`.

**Status:** Complete. Exact production dependencies `@zip.js/zip.js@2.8.30` and `saxes@6.0.0` are locked and documented. Package-internal executable probes prove strict ESM/TypeScript integration, in-memory compressed ZIP reads with canonical archive, signature, and order-independent overlap checks, namespace-aware XML with every `DOCTYPE` and custom entity rejected, cancellation checkpoints, content-free error mapping, and no worker or network invocation. The selected zip.js core variant is pure JavaScript and no probe is part of the public package API. All listed validation commands passed on 2026-07-21; repository formatting and lint also passed.

## Milestone 2: Establish archive/XML trust boundaries

### Task 2.1: Validate virtual paths and OCF references

**Outcome:** Pure canonical path/reference logic rejects every traversal, special-file, collision, encoding, and ambiguity case without filesystem access.

**Dependencies:** Tasks 1.1-1.2.

**Areas:** path/reference modules/tests.

**Acceptance:** Entry paths and document references are distinct; resolution cannot produce host paths/URLs; paths stay case-sensitive; errors are fixed codes.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. Package-internal branded archive file, archive directory, and OCF reference types keep entry names separate from document references. Strict UTF-8 decoding, canonical directory keys, exact path/component limits, special-kind rejection, case/Unicode collision checks, and fixed content-free errors enforce the ADR boundary. Relative references resolve only against validated file bases, reject local escape and URL/host syntax before and after percent decoding, preserve case, and exclude fragments from lookup keys. No filesystem, network, or public package API was added.

### Task 2.2: Validate ZIP inventory and mimetype

**Outcome:** Invalid ZIP/OCF structure fails before package/content decompression.

**Dependencies:** Task 2.1.

**Areas:** archive inventory/media-type modules/tests.

**Acceptance:** First mimetype rules, ZIP features, ambiguity/overlap/signature, entry kinds, duplicates, sizes, and ZIP64 policy are tested; no disk extraction.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. A package-internal, bytes-only inventory validates the physical first-entry `mimetype` contract, strict central/local header agreement, signatures, overlaps, archive boundaries, supported compression and protection, regular-file/directory kinds, path collisions, declared sizes, and safe ZIP64 metadata before package or content decompression. It returns an immutable physical-order inventory with fixed content-free errors and performs no disk, network, worker, or public-API operation. Only the required 20-byte `mimetype` payload is read and CRC-checked here; Task 2.3 owns bounded reads, observed decompression accounting, ratios, and CRC validation for content entries.

### Task 2.3: Enforce budgets, cancellation, and deadline

**Outcome:** One immutable policy bounds every read/decompression and produces deterministic cancellation/exhaustion.

**Dependencies:** Task 2.2.

**Areas:** budget/policy modules/tests.

**Acceptance:** Declared and observed values counted; exact maximum/max+1 tests; only stricter overrides; AbortSignal and injected clock; discard partial output.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. One frozen package-internal policy now centralizes every ADR-0007 ingestion maximum and accepts only equal or stricter safe-integer overrides. A processing budget checks caller abort and injected monotonic time at deterministic boundaries; preflights input, entry count, declared compressed/uncompressed bytes, and declared per-entry/aggregate ratios; and counts observed per-entry/aggregate output plus successful compressed reads. Bounded in-memory entry reads reject overlap, enforce absolute and ratio limits before retaining each chunk, validate CRC, return bytes only after complete success, and discard partial output on malformed data, exhaustion, cancellation, or deadline. The policy is threaded through archive-path and OCF-reference validation, adds no dependency or public package export, and performs no disk, network, worker, logging, UI, or persistence operation.

### Task 2.4: Add bounded namespace-aware XML events

**Outcome:** Semantic parsers receive only namespace-aware events after XML security checks.

**Dependencies:** Tasks 1.2 and 2.3.

**Areas:** XML adapter/tests.

**Acceptance:** DTD/entities/external resources rejected; encoding/depth/attributes/nodes/text/abort/deadline deterministic; raw parser errors hidden.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. A package-internal XML event reader now strictly decodes bounded UTF-8 and UTF-16 XML 1.0 bytes, drives the pinned namespace-aware `saxes` adapter in fixed byte chunks, and emits immutable expanded-name start/end/text events without a DOM or raw dependency objects. It rejects every `DOCTYPE`, custom entity, XInclude element, mismatched/unsupported encoding declaration, and external-resource processing instruction; counts namespace declarations toward the per-element attribute maximum; bounds element depth, document nodes, and aggregate decoded UTF-8-equivalent text through the existing ingestion policy and lifetime budget; checks abort/deadline at deterministic decode, event, and text-counting boundaries; and maps parser/decoder/consumer failures to fixed content-free errors. The adapter adds no dependency, public export, filesystem/network/worker capability, logging, UI, TTS/audio, or persistence behavior.

## Milestone 3: Parse container/package/navigation

### Task 3.1: Resolve container.xml to a supported OPF

**Outcome:** Validated container.xml selects one local supported package entry.

**Dependencies:** Tasks 2.1-2.4.

**Areas:** container parser/resolver/tests.

**Acceptance:** Missing/malformed/oversized/unsafe/external/nonexistent/unsupported rootfiles and rendition policy tested.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. A package-internal resolver now reads the required `META-INF/container.xml` and candidate package documents through the existing bounded archive and namespace-aware XML boundaries. It validates the OCF structure and local IRI rootfile paths before selection, considers supported-media rootfiles in document order, defaults missing global `rendition:layout` to reflowable, skips only well-formed unsupported EPUB versions or fixed-layout renditions, and returns the first EPUB 3 reflowable OPF as a bounded internal byte/path result. Missing containers, malformed/oversized XML, unsafe/external/fragment-bearing or nonexistent references, malformed package profiles, unsupported media/version/layout, cancellation, and deadlines produce fixed content-free errors. The implementation adds no dependency, public export, filesystem/network/worker capability, logging, UI, TTS/audio, or persistence behavior.

### Task 3.2: Parse metadata, manifest, fallbacks, and spine

**Outcome:** Internal package model has accepted metadata/resources, finite fallback graph, and deterministic spine.

**Dependencies:** Task 3.1.

**Areas:** OPF model/parser/tests.

**Acceptance:** Required relationships, duplicates, broken idrefs, cycles/depth, unsupported media/protection/layout/remotes, and linearity tested.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. A package-internal OPF parser now produces an immutable metadata, manifest, fallback, navigation-resource, and deterministic spine model from the already-resolved EPUB 3 package bytes. It validates required package structure and metadata, globally unique IDs, local resource existence and uniqueness, fallback and media-overlay IDREFs, finite acyclic fallback chains, one safe local XHTML navigation document, unique spine references, supported linearity/progression values, and at least one linear reading-order item. Spine resources resolve through bounded fallbacks to safe local XHTML; scripted, remote-only, protected, unsupported fixed-layout, missing, malformed, cyclic, over-limit, cancelled, and expired inputs fail with fixed content-free errors. External descriptors retain no publisher URL, resource bytes are not read, media overlays are validated then ignored, and the implementation adds no dependency, public export, network/worker/filesystem capability, logging, UI, TTS/audio, or persistence behavior.

### Task 3.3: Compute identity and project BookV1

**Outcome:** Identical bytes yield SHA-256 identity and a shared-decoder-valid BookV1 projection.

**Dependencies:** Task 3.2.

**Areas:** identity/projection/tests.

**Acceptance:** No path/metadata/prose identity; byte change changes identity; resources/spine/navigation validate; no shared schema change.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`; `pnpm.cmd --filter @voxleaf/shared test`.

**Status:** Complete. A package-internal projection now computes the required lowercase SHA-256 identity from the exact supplied EPUB byte view with the platform Web Crypto implementation, selects the first accepted title and unique creators in source order, filters the validated manifest to safe local XHTML and raster resources, and maps every accepted spine item to a deterministic content-free `spine:<index>` identifier. It submits the complete candidate through the unchanged public `@voxleaf/shared` `decodeBookV1` boundary and publishes only that immutable validated result. Shared-contract rejection becomes a fixed content-free malformed-package error, cryptographic/runtime failure becomes a fixed internal error, and no path, publisher identifier, metadata, prose, URL, or dependency detail contributes to identity. Coarse navigation is an intentionally valid empty array until Task 3.4 parses labels and targets. The implementation adds no dependency, schema/generated-file change, public EPUB export, filesystem/network/worker capability, logging, UI, TTS/audio, or persistence behavior.

### Task 3.4: Parse hierarchical navigation

**Outcome:** Supported nav becomes ordered hierarchy with validated local targets and deterministic coarse BookV1 navigation.

**Dependencies:** Tasks 3.2-3.3.

**Areas:** EPUB 3 navigation modules/tests. EPUB 2/NCX remains deferred by ADR-0007.

**Acceptance:** Nested labels/fragments resolve; broken/remote/excessive/nonspine targets follow policy; detailed nav stays internal.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. A package-internal EPUB 3 navigation parser now reads the already-validated nav resource through the shared bounded archive/XML pipeline, recognizes the `toc` role by namespace URI, enforces the restricted `nav`/`ol`/`li`/`a|span` hierarchy, normalizes bounded text labels, and publishes an immutable ordered tree only after complete success. Local references use the established OCF resolver; their decoded fragments remain internal, supported XHTML targets outside the spine remain explicit non-spine targets, and malformed, remote, missing, undeclared, active, over-depth, and over-count inputs fail with fixed content-free errors. BookV1 projection now flattens spine-resolvable nodes in preorder to deterministic `spine:<index>` entries while omitting grouping and non-spine nodes and exposing neither fragments nor detailed hierarchy. EPUB 2/NCX, target-fragment element matching, public EPUB exports, DOM/browser parsing, filesystem/network/worker capability, logging, dependency/schema/generated-file changes, UI, TTS/audio, and persistence remain out of scope.

## Milestone 4: Build semantic content/resources

### Task 4.1: Define immutable document-model types

**Outcome:** Minimal closed document/block/inline/navigation/resource/opened-publication API exists.

**Dependencies:** Task 1.1 and evidence from Tasks 3.2-3.4.

**Areas:** EPUB domain/public index and compile-time tests.

**Acceptance:** No React/DOM/Tauri/Python/TTS/audio/persistence/filesystem; no trusted HTML; immutable sensitive-content/lifecycle rules; no speculative nodes.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. The public `@voxleaf/epub` root now exposes a type-only, framework-independent document-model boundary while retaining an empty runtime export until later ingestion tasks provide validated values. Closed recursive unions represent only the ADR-accepted semantic blocks and inlines; opaque content-document and raster-resource identities prevent paths and URLs from becoming application contracts; detailed link/group navigation references local semantic documents without activatable external URLs; and exact raster media types support later bounded reads. Sensitive publication text and source fragments are branded and documented as in-memory-only values. `OpenedPublication` separates immutable book/document/navigation/resource snapshots from its observable close state, cancellable lazy resource-read operation, and idempotent asynchronous close contract. Compile-time and runtime-shape tests prove readonly collections, distinct identifier families, nonempty navigation groups, spine/non-spine document locations, explicit lifecycle operations, and the absence of HTML, DOM, path, URL, and eager-byte fields. XHTML projection, factories, archive ownership, resource signature/byte validation, locator assignment, rendering, error-result mapping, and persistence remain unimplemented and owned by later tasks. No shared schema, generated file, dependency, native capability, logging, UI, TTS/audio, or runtime EPUB export changed.

### Task 4.2: Project XHTML into safe semantics

**Outcome:** One bounded content document becomes faithful semantic blocks/inlines without executable markup.

**Dependencies:** Tasks 2.4, 3.2, 4.1.

**Areas:** XHTML projector/tests.

**Acceptance:** Element/language/direction/whitespace/source order documented; active/remote/style/SVG/hidden rules tested; no narration normalization/logging/persistence; no partial result on failure.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. A package-internal transactional XHTML projector now reads one already-validated local content document through the shared bounded archive/XML pipeline and publishes only the existing immutable semantic model. It preserves supported headings, paragraphs, block quotes, lists, emphasis, strong text, code, line breaks, source order, inherited language/direction, internal links, and declared local raster references; direct inline runs become paragraphs and normal whitespace is collapsed while code character data remains exact. Validated manifest paths become deterministic opaque document/resource IDs, so no path or URL crosses the model boundary. Unknown inert XHTML containers are traversed, external links become inert descendants, and active elements, forms/media, styles, explicit hidden content, foreign namespaces including SVG/MathML, and remote images are omitted without network, worker, DOM, logging, persistence, narration normalization, or resource-byte reads. Malformed structure, invalid text context, broken local relationships, cancellation, XML limits, and publication-wide semantic-block excess fail with fixed content-free errors and no partial document. Adversarial in-memory EPUB tests cover the allowlist, context, whitespace, source order, opacity, omission matrix, exact/max+1 block accounting, cancellation, deep immutability, and external-capability absence. Resource signature/byte validation, public publication opening, navigation-model conversion, fragment matching, locators, rendering, and CSS-derived visibility remain owned by later tasks.

### Task 4.3: Add bounded local resource reads

**Outcome:** Opened publication exposes only validated supported local resources and releases archive state on close.

**Dependencies:** Tasks 2.3, 3.2, 4.1.

**Areas:** resource/image/lifecycle modules/tests.

**Acceptance:** Lazy reads; size/type/signature/locality/cancellation checks; safe closed behavior; no Blob URL/rendering/filesystem/cache.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Complete. A package-internal opened-publication implementation now derives immutable opaque descriptors only for supported, non-active local GIF/JPEG/PNG/WebP manifest resources and retains their validated archive paths privately. Resource bytes remain lazy: each call performs one CRC-checked bounded archive read, enforces the raster maximum and shared processing budget, validates the declared type against the leading byte signature, and returns that read's independent caller-owned allocation without caching or partial output. Read-scoped abort does not cancel the publication; close marks the handle closed immediately, cancels and awaits active work, releases the archive once, and is idempotent. Unknown, missing, oversized, mismatched, overlapping, cancelled, and post-close operations use fixed content-free failures. Synthetic in-memory ZIP tests cover all supported signatures, locality/active filtering, exact/max+1 size, missing/unknown resources, lazy accounting, independent reads, operation and close cancellation, one-read concurrency, immutable path-free descriptors, and absence of worker/network use. No Blob URL, decoder, renderer, filesystem, persistence, public opener, or runtime root export was added.

## Milestone 5: Create/resolve locators

### Task 5.1: Assign deterministic anchors and locators

**Outcome:** Every addressable block has stable anchor/order/start locator tied to byte identity and spine.

**Dependencies:** Tasks 3.3, 4.1-4.2.

**Areas:** anchor/locator constructor/tests.

**Acceptance:** Preserve valid unique IDs; deterministic text-free replacements; stable order; Unicode code-point offsets; shared decoder accepts all.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`; `pnpm.cmd --filter @voxleaf/shared test`.

**Status:** Not started.

### Task 5.2: Resolve exact and nearest-valid locators

**Outcome:** Exact locators resolve and invalid/stale ones recover through one structural fallback order.

**Dependencies:** Task 5.1 and complete spine/nav.

**Areas:** locator index/resolver/tests.

**Acceptance:** Full identity checks; wrong book never resolves; exact/recovered plus safe reason; no prose/page/layout search; immutable deterministic behavior.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Not started.

## Milestone 6: Complete errors/fixtures/integration

### Task 6.1: Expose privacy-safe result/error mapping

**Outcome:** Public API returns stable results and maps every expected stage to EPUB detail plus OperationalErrorV1.

**Dependencies:** Tasks 2.1-5.2.

**Areas:** public/result/error modules and privacy tests.

**Acceptance:** Deterministic malformed/unsupported/cancelled/exhausted/internal mapping; no sensitive fields/messages/stacks; canary tests; no raw exceptions/logging.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Not started.

### Task 6.2: Add deterministic EPUB fixture builder

**Outcome:** Test-only support creates byte-identical valid/malformed EPUBs for all accepted boundaries.

**Dependencies:** Task 1.2 and security policy.

**Areas:** EPUB test fixtures/config.

**Acceptance:** Fixed order/timestamps/attributes/compression; byte identity repeated; low-level mutations documented; synthetic/local/test-only; no OS ZIP/filesystem/network.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`.

**Status:** Not started.

### Task 6.3: Prove full ingestion matrix

**Outcome:** Integration/security tests drive synthetic EPUB bytes through public output/resources/locators.

**Dependencies:** Tasks 3.1-6.2.

**Areas:** EPUB integration/security tests.

**Acceptance:** Every required scenario tested or explicitly revised; valid shared/semantic results; invalid safe code/no partial publication; all max/max+1; no external systems.

**Validation:** `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/epub test`; `pnpm.cmd --filter @voxleaf/epub build`; `git diff --check`.

**Status:** Not started.

## Milestone 7: Document and close

### Task 7.1: Document implemented boundary/dependencies

**Outcome:** Architecture/dependency/testing/support docs match actual EPUB behavior and limitations.

**Dependencies:** Tasks 1.1-6.3.

**Areas:** ADR, architecture overview, dependency/testing docs, plan; roadmap/product only if evidence changes them.

**Acceptance:** Implemented versus deferred clear; versions/licenses/purpose/limits/content rules exact; unsupported cases explicit; no claim desktop renders books.

**Validation:** `git diff --check`; `pnpm.cmd format:check`.

**Status:** Not started.

### Task 7.2: Complete focused, root, CI, privacy, and scope validation

**Outcome:** Milestone behavior/docs pass local/remote validation and this plan records exact evidence.

**Dependencies:** Tasks 1.1-7.1.

**Areas:** only tests/docs/plan corrections.

**Acceptance:** Full EPUB/shared/root checks and both CI jobs pass; diff has no native permission/UI/TTS/audio/persistence/network/copyright/unrelated work; plan moves only when complete.

**Validation:**

~~~powershell
git diff --check
pnpm.cmd install --frozen-lockfile
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd check
~~~

After push, record the run URL and successful Windows native foundation and Ubuntu portable foundation jobs.

**Status:** Not started.

## Milestone acceptance criteria

- PR #18 merge commit 86db4c4 is present in the implementation branch history.
- Secure-ingestion ADR accepted and matches code.
- Bytes validated without trusting extension/MIME/filename/path.
- Archive traversal/ambiguity/overlap/encryption/method/bomb/size/count/ratio/depth/cancellation defenses pass.
- Container/package/manifest/spine/nav/supported XHTML parse under budgets.
- No entity/script/remote/active/SVG/CSS/media/DRM execution or fetch.
- Semantic model is immutable and framework-independent.
- SHA-256 identity and structural locators are deterministic.
- Exact/recovery locator behavior passes without page/prose search.
- Local image access is lazy, bounded, cancellable, releasable.
- Existing shared contracts reused without silent schema change.
- Errors/diagnostics are content-free.
- Synthetic fixtures cover valid/invalid/malformed/adversarial/boundary cases.
- No disk extraction or content persistence.
- Focused/root/build/CI pass.
- No Milestone 4+ implementation.

## Risks and mitigations

- **Untrusted ZIP metadata:** strict header/overlap/signature checks, safe integers, observed counters, virtual paths, byte-level tests.
- **Bombs/memory:** absolute and ratio budgets, one document/resource at a time, lazy images, immediate abort.
- **XML attacks:** no DTD/entities/external resolution; namespace-aware streaming; depth/node/text budgets.
- **Sanitization:** closed semantic projection, documented allowlist, no trusted HTML, representative fixtures.
- **Version/fallback complexity:** narrow support matrix, finite graph validation, explicit unsupported results.
- **Locator instability:** exact byte identity, source-order anchors, deterministic text-free IDs, repeated round-trip tests.
- **CSS-hidden content:** remove explicit hidden semantics, document lack of full cascade, resolve rendering in Milestone 4.
- **Dependency risk:** executable spike, pinned lock, license/transitive/bundle review, isolated adapters.
- **Error leakage:** fixed codes, no raw cause/message/stack, canary tests, no logging.
- **Timing flakiness:** counters primary; injected monotonic clock/checkpoints; no sleep.

Rollback is task-by-task. No user data exists to migrate. Published shared versions are never reinterpreted; any required change gets a new version and explicit plan update.

## Progress log

- 2026-07-21: Read repository instructions, roadmap, product/architecture/development docs, completed Milestones 1/2, older synchronized-reader plan, manifests, contracts/schemas, fixtures, EPUB package, root commands, and CI.
- 2026-07-21: Confirmed @voxleaf/epub remains empty production API with no parsing/security behavior.
- 2026-07-21: Confirmed Milestone 2 technical completion at 0672ed6, then verified PR #18 merged into main as 86db4c4; the local branch references remain stale.
- 2026-07-21: Reviewed current W3C EPUB 3.3/Reading Systems requirements and candidate ZIP/XML documentation to inform recommendations without accepting them silently.
- 2026-07-21: Created this ExecPlan; no implementation task started.
- 2026-07-21: Completed Task 1.1 on `docs/m3-secure-ingestion-adr` from `main` at `c8a1c77`. Accepted ADR-0007 for the EPUB 3 reflowable support profile, exact security budgets, content matrix, SHA-256 identity, shared/internal model ownership, locator and error policy, and deferred cases. Updated the architecture overview and centralized exact limits in the ADR; no dependency or application code was added. `git diff --check` and `pnpm.cmd format:check` passed.
- 2026-07-21: Completed Task 1.2 on `feat/m3-archive-xml-dependencies`. Selected and exactly pinned `@zip.js/zip.js@2.8.30` plus `saxes@6.0.0`; added package-internal executable probes for strict ZIP controls, DTD/custom-entity rejection, cancellation, safe error mapping, namespace behavior, and worker/network absence; and documented licenses, alternatives, transitive graph, release-age choice, and installed/bundle impact. The locked install, EPUB typecheck/test/build, formatting, lint, and diff checks passed.
- 2026-07-21: Completed Task 2.1 on `feat/m3-virtual-paths-ocf-references`, stacked on the clean Task 1.2 branch while its changes remain the required dependency. Added package-internal pure path/reference logic and adversarial tests for exact and over-limit values, malformed UTF-8, traversal and separator encodings, special entry kinds, Unicode/case collisions, schemes/hosts/queries/drives, root escape, case preservation, and fragment-free lookup keys. No dependency, filesystem/network capability, or public export was added.
- 2026-07-22: Completed Task 2.2 on `feat/m3-zip-inventory-mimetype` from merged `main`. Added a strict, immutable ZIP inventory and fixed archive-error boundary plus adversarial in-memory tests covering physical `mimetype` rules, archive/header ambiguity, split/prepended/appended/overlapping structures, encryption and compression policy, entry kinds and collisions, declared limits, safe and unsafe ZIP64 values, content-free errors, and worker/network absence. Inventory structural checks do not decompress non-`mimetype` content.
- 2026-07-22: Completed Task 2.3 on `feat/m3-budget-cancellation-deadline` from `main` at PR #23 merge commit `2be10e8`. Centralized every ADR limit in one immutable strict-only policy, replaced duplicate archive/path/reference constants, added one ingestion-lifetime processing budget, and added bounded archive entry reads with declared/observed absolute and ratio enforcement, CRC checks, deterministic abort/deadline checkpoints, and no partial output. Adversarial pure-counter and real ZIP tests cover exact/max+1 behavior, false metadata, retry resistance, cancellation, deadlines, clock rollback, strict overrides, CRC privacy, and worker/network absence.
- 2026-07-22: Completed Task 2.4 on `feat/m3-bounded-namespace-xml-events` from merged `main` at PR #24 merge commit `010c5be`. Added a package-internal namespace-aware XML event reader over `saxes@6.0.0`, strict UTF-8/UTF-16 XML 1.0 decoding, immutable expanded-name events, document/depth/attribute/node/text enforcement through the shared policy and processing budget, deterministic abort/deadline checkpoints, active/external XML rejection, and fixed content-free error mapping. Adversarial tests cover encoding signatures/declarations, namespace-prefix equivalence, exact/max+1 limits, aggregate decoded text, DTD/entities/XInclude/external processing instructions, malformed input, cancellation, deadlines, dependency isolation, and error canaries.
- 2026-07-22: Completed Task 3.1 on `feat/m3-resolve-container-opf` from merged `main` at PR #25 merge commit `8692659`. Added package-internal OCF container parsing and supported-package resolution with document-order selection, root-relative local IRI validation, supported OPF media/version/layout classification, strict fail-versus-fallback behavior, bounded reads, shared cancellation/deadline enforcement, and fixed content-free errors. Adversarial synthetic EPUB tests cover namespace prefixes/extensions, missing/malformed/oversized containers and packages, unsafe/external/nonexistent rootfiles, unsupported media/version/layout, malformed-first fallback prevention, exact limits, cancellation, deadlines, and worker/network absence.
- 2026-07-22: Completed Task 3.2 on `feat/m3-parse-opf-package` from merged `main` at PR #26 merge commit `a290dd8`. Added a package-internal immutable OPF model and transactional namespace-aware parser for required metadata, manifest resources, fallback/media-overlay relationships, the navigation resource, and deterministic spine. Adversarial synthetic tests cover package structure, duplicate and broken relationships, exact collection/depth limits, fallback cycles, active/foreign/remote fallback selection, unsupported layouts/media/remotes, linearity, cancellation, deadlines, protection carryover, content-free errors, and no network/worker use.
- 2026-07-22: Completed Task 3.3 on `feat/m3-project-book-v1` from merged `main` at PR #27 merge commit `6775abe`. Added package-internal exact-byte SHA-256 identity and deterministic BookV1 projection through the unchanged shared decoder. Synthetic tests cover the standard digest vector and exact byte views, identical and one-byte-different inputs, metadata/path/publisher-ID independence, accepted local resource filtering, fallback-resolved spine relationships, immutable contract round trips, fixed content-free failures, and no network/worker use.
- 2026-07-22: Completed Task 3.4 on `feat/m3-parse-navigation` from merged `main` at PR #28 merge commit `7e01866`. Added a transactional namespace-aware EPUB 3 TOC parser, immutable bounded hierarchy with decoded local fragment targets, explicit internal non-spine targets, and deterministic preorder BookV1 navigation projection. Adversarial synthetic archive tests cover nested linked/group nodes, prefix independence, inline/alternate labels, malformed restricted grammar, duplicate/missing TOCs, remote/unsafe/missing/query targets, exact and exceeded depth/node limits, cancellation, deadlines, content-free errors, and no network/worker use.
- 2026-07-22: Completed Task 4.1 on `feat/m3-document-model-types` from merged `main` at PR #29 merge commit `43f8640`. Added the type-only public semantic document model, opaque document/resource/fragment/text brands, closed block/inline/navigation/resource shapes, explicit spine/non-spine locations, and an opened-publication lifecycle contract. Public-boundary tests cover readonly recursive values, exact discriminants, identifier separation, nonempty groups, supported raster descriptors, explicit read/close operations, and absence of paths, URLs, HTML, DOM, or eager bytes. Focused EPUB typecheck, 15 test files with 282 tests, and build passed; repository TypeScript formatting and lint also passed.
- 2026-07-22: Completed Task 4.2 on `feat/m3-project-xhtml-semantics` from merged `main`. Added a transactional namespace-aware XHTML projector over the existing archive/XML boundary, deterministic opaque manifest-derived document/resource references, inherited language/direction, documented normal/code whitespace handling, closed semantic block/inline projection, and publication-lifetime semantic-block accounting. Synthetic in-memory EPUB tests cover source order, deep immutability, local links/images, inert external links, unknown containers, active/style/hidden/foreign/remote omission, malformed and broken inputs, exact/max+1 limits, cancellation, content-free errors, and no network/worker use.
- 2026-07-22: Completed Task 4.3 on `feat/m3-bounded-local-resource-reads` from merged `main`. Added a private raster catalog shared with XHTML identity projection, read-scoped archive cancellation, and an opened-publication handle with lazy bounded signature-checked reads, immutable path-free descriptors, independent caller-owned byte allocations, one-read concurrency, and idempotent close that cancels active work before archive release. Synthetic in-memory ZIP tests cover all accepted raster signatures, active/remote/unsupported omission, missing/unknown/mismatched/oversized resources, exact limits, lazy accounting, cancellation races, closed behavior, content-free errors, and no cache, worker, or network use.

## Decision log

- Filename is M003-secure-epub-ingestion-and-document-model.md because one plan covers roadmap Milestone 3; no second sequence is needed.
- Shared contract versions remain the expected boundary; internal document/nav/resource structures belong to @voxleaf/epub absent contrary evidence.
- ADR-0007 accepts a semantic allowlist instead of a renderer framework; Task 1.2 still owns low-level ZIP/XML selection and must prove it against the ADR.
- ADR-0007 accepts the bytes-only/no-native-permission scope.
- ADR-0007 accepts counters as primary defenses plus abort and an injected deadline.
- ADR-0007 accepts SHA-256 byte identity and deterministic text-free anchors; later tasks must prove their implementations.
- ADR-0007 accepts the EPUB 3 reflowable baseline and defers EPUB 2/NCX.
- Task 1.2 selects `@zip.js/zip.js@2.8.30` through the pure-JavaScript `lib/zip-core-native.js` subpath with strict archive interpretation enabled and workers, native compression streams, and stream transfer disabled. It is the first version with the required bounded canonical archive selection and had crossed the seven-day supply-chain gate; versions `2.8.31` through `2.8.33` had not.
- Task 1.2 selects `saxes@6.0.0` with namespace processing and forced XML 1.0. VoxLeaf registers no resolver and rejects every `DOCTYPE`; the only production transitive is `xmlchars@2.2.0`.
- Task 2.1 keeps archive file paths, canonical archive directory paths, and OCF references as distinct branded internal types. Directory input must carry one trailing marker, but the marker is removed from its collision key so a file and directory cannot claim the same virtual location.
- Task 2.1 preserves exact case for lookup while rejecting exact, NFC-normalized, and locale-independent compatibility case-fold collisions. Reference components are percent-decoded without URL construction; literal dot segments may resolve only inside the container, while encoded or multiply encoded traversal/separators always fail.
- Task 2.1 leaves these internal modules out of `@voxleaf/epub` exports. The later public document-model task owns any supported ingestion API rather than exposing security primitives prematurely.
- Task 2.2 derives physical archive order from validated local-header offsets rather than central-directory record order. The first physical entry must be the stored, unencrypted, non-ZIP64 `mimetype` file at byte zero, with no local extra field and exactly the required 20 ASCII bytes.
- Task 2.2 uses zip.js strict ambiguity checks and overlap-only entry checks to validate every local header and occupied range without reading or decompressing content payloads. It reads and CRC-checks only `mimetype`; Task 2.3 must CRC-check each other entry during its bounded observed read so inventory cannot materialize or decompress the archive.
- Task 2.2 preflights the ADR's compressed-input, entry-count, per-entry, aggregate-declared-size, safe-integer, and ZIP64 limits. Task 2.3 remains responsible for centralizing the immutable policy and enforcing observed byte, ratio, cancellation, and deadline limits.
- Task 2.3 represents every numeric ADR maximum, including limits consumed by later XML/package/model tasks, in one frozen `EpubIngestionPolicy`. The factory rejects unknown, non-safe, negative, fractional, or more-permissive overrides with a fixed content-free internal failure; later tasks must receive this same policy rather than introduce constants.
- Task 2.3 starts one processing budget when archive ingestion starts. Exactly 30,000 ms is permitted and the first greater observed monotonic time cancels; caller abort is checked first. Clock rollback, invalid clock output, or invalid internal accounting is a fixed internal failure, and tests use injected clocks without sleeps.
- Task 2.3 preflights both per-entry and aggregate declared compression ratios. During decompression it counts output before retention and applies the ratio after the exact 1 MiB grace boundary. Observed bytes remain charged after failed work, while compressed bytes are credited only after a complete declared-size/CRC-valid read, so retries cannot dilute aggregate ratio enforcement.
- Task 2.3 keeps at most one declared, policy-bounded entry output allocation per read and releases it on every failure. The opened archive handle and budget remain package-internal for later XML/resource consumers; `@voxleaf/epub` still exports no ingestion API.
- Task 2.4 accepts only the policy's `container-or-package` or `content` document profiles, detects UTF-8/UTF-16 byte order before strict streaming decode, requires any declaration to be XML 1.0 with a matching supported encoding, and rejects UTF-32. Namespace declaration attributes count toward the lexical attribute limit but are not forwarded as semantic attributes; element and attribute names are forwarded only as namespace URI plus local name so downstream parsers cannot depend on publisher-selected prefixes.
- Task 2.4 defines one XML node as an element, nonempty text/CDATA callback, comment, or processing instruction; end tags and attributes are not additional nodes because depth and per-element attributes have independent limits. All decoded text callbacks, including XML whitespace, are charged as UTF-8-equivalent bytes to the ingestion-lifetime publication-text counter before their immutable event is emitted. Harmless processing instructions and comments are counted then dropped; `xml-stylesheet`, `xml-model`, every `DOCTYPE`, and every XInclude-namespace element fail closed.
- Task 2.4 streams events synchronously instead of retaining an eager document or event list. A semantic consumer must keep its derived state private, discard it if the reader throws, and publish it only after the reader returns a successful summary; later package parsers must test this transactional handoff.
- Task 3.1 resolves each `container.xml` `full-path` as an OCF reference against the virtual archive root, rejects fragments and every unsafe or external form, and compares the resulting case-preserved branded path only with the validated ZIP inventory. Every rootfile path is validated before media-type filtering, so ignored declarations cannot conceal unsafe references.
- Task 3.1 considers rootfiles in XML document order and skips only a completely well-formed package with an unsupported version or fixed-layout global rendition. Malformed, unsafe, missing, cancelled, over-budget, or unknown-layout candidates fail immediately instead of falling through; if no package is selected, the first well-formed unsupported candidate determines the fixed unsupported-version/layout result.
- Task 3.1 recognizes only the unrefined global `rendition:layout` metadata needed for selection; absent means reflowable, `pre-paginated` is a skippable unsupported rendition, and any other EPUB 3 value is malformed. Task 3.2 remains responsible for the complete metadata, manifest, fallback, spine, and navigation relationship model.
- Task 3.2 keeps its immutable metadata/resource/fallback/spine model package-internal and exposes no mutable maps or publisher-authored external URL strings. Task 3.3 owns stable identity and BookV1 projection; Task 3.4 owns navigation-document content and hierarchy.
- Task 3.2 validates every declared fallback edge, rejects self-references, cycles, and over-depth chains, and resolves each spine item to the first safe local exact-XHTML resource. Active, foreign, or remote primary resources are accepted only when that bounded chain reaches such a resource; every spine item must resolve and at least one must be linear.
- Task 3.2 requires exactly one safe local XHTML manifest item with the `nav` property but does not read its bytes. Media-overlay references must resolve to declared SMIL resources and are then ignored. ZIP encryption remains rejected by the established archive gate; the exact OCF encryption-document entry is rejected from inventory without reading or decrypting it, covering EPUB resource protection and obfuscation fail closed.
- Task 3.3 uses the platform Web Crypto `SHA-256` implementation over the exact supplied `Uint8Array` view and encodes its 32-byte result as 64 lowercase hexadecimal characters. Digest unavailability, rejection, or an invalid result length maps to `internal-failure`; no cryptography dependency or Node-only API is added.
- Task 3.3 projects only non-active local `content-document` and `raster-image` manifest items, preserving manifest order and mapping them to the existing BookV1 roles. It preserves every accepted spine entry in order but derives `spine:<zero-based index>` IDs rather than exposing publisher IDs, paths, metadata, prose, or randomness. Duplicate creators are collapsed in source order, and the first accepted title is the coarse BookV1 title.
- Task 3.3 treats `decodeBookV1` as the final projection authority and maps its content-free contract rejection to `malformed-package`. BookV1 navigation remains empty and valid in this task because Task 3.4 owns navigation-document parsing, labels, target resolution, and coarse entries. All new APIs remain package-internal until the public document-model task.
- Task 3.4 accepts exactly one namespace-identified EPUB 3 `toc` nav and enforces its ordered restricted list grammar without constructing a DOM. Each `li` counts as one navigation node, the root `ol` is depth one, exact policy limits are accepted, and partial hierarchy state is discarded on XML, reference, budget, cancellation, or deadline failure.
- Task 3.4 normalizes label text by collapsing ASCII whitespace, incorporates descendant `alt` text and a label-level `title` fallback, and bounds the result to the unchanged BookV1 1,024-code-point limit. Script, style, template, and structural list content inside labels are rejected rather than interpreted.
- Task 3.4 requires every linked TOC target to be a scheme-less, query-free OCF reference to a declared safe local XHTML resource. Remote, unsafe, missing, active, and undeclared targets fail as `broken-reference`; decoded fragments are retained only in the package-internal target, and later semantic XHTML parsing owns matching them to actual element IDs.
- Task 3.4 distinguishes spine from non-spine local targets. Both remain in the detailed internal hierarchy, but BookV1 receives only spine targets, flattened in document preorder to the existing deterministic `spine:<index>` IDs; span groups, non-spine targets, fragments, paths, and hierarchy are omitted from the coarse contract. The first spine occurrence owns a duplicated resolved resource path.
- Task 4.1 publishes only TypeScript types from `@voxleaf/epub`; there is no public parser, constructor, resource reader implementation, or other runtime export until later tasks can create fully validated values. This makes the public contract reviewable without claiming ingestion completion or widening the shared serialized schemas.
- Task 4.1 uses closed semantic unions justified by ADR-0007: heading, paragraph, block quote, and list blocks; text, emphasis, strong, code, line break, internal-link, and raster-image inlines. Test-only dialogue and scene-boundary fixture concepts remain test support rather than production nodes.
- Task 4.1 represents content documents and raster resources with distinct opaque identities and never public in-container paths or URLs. Detailed navigation uses explicit link and nonempty group nodes; internal links and navigation reference opaque local document targets, while external links will be flattened to inert semantic descendants by Task 4.2.
- Task 4.1 separates immutable publication values from the stateful `OpenedPublication` handle. The handle exposes only observable closed state, a cancellable lazy resource-read operation, and idempotent asynchronous close; Task 4.3 owns archive retention, signature validation, caller-owned byte copies, and fixed closed-handle behavior.
- Task 4.2 projects one content document at a time directly from immutable namespace-aware XML events, retains mutable builders privately, and publishes only after XML and semantic completion. It accepts exactly one XHTML root/body, rejects invalid semantic block nesting and language/direction conflicts, turns direct inline runs in safe inert block containers into paragraphs, and omits empty semantic blocks.
- Task 4.2 inherits matching `xml:lang`/`lang` and closed `auto|ltr|rtl` direction context. It collapses ordinary ASCII XML whitespace across inline boundaries and trims block edges, while code retains exact XML character data and consumes redundant adjacent normal boundary whitespace. Publisher CSS, including `white-space` and computed visibility, is not evaluated.
- Task 4.2 derives content-document and raster-resource IDs from validated manifest order, never from publisher paths or prose. Local links must resolve to a supported declared XHTML document; external or unsafe links flatten to inert descendants. Local image references must resolve to supported declared raster metadata, while remote/unsafe images and all foreign markup are omitted without reading image bytes.
- Task 4.2 charges every nonempty heading, paragraph, block quote, and list against the existing publication-wide `maxSemanticBlocks` policy. Failed work exposes no document and retains no publisher text in errors, logs, metrics, persistence, or public runtime exports; the shared ingestion budget remains consumed to prevent retry-based limit bypass.
- Task 4.3 uses one manifest-index-derived raster identity helper for both semantic XHTML references and the private resource catalog. Only exact declared GIF, JPEG, PNG, and WebP media types that are local and non-active receive descriptors; archive paths remain private, and missing files or declared sizes above the raster maximum fail before any resource bytes are read.
- Task 4.3 extends the archive's existing bounded read with an operation-scoped abort signal without cancelling the ingestion-lifetime budget. The publication permits one resource read at a time, validates the leading byte signature only after a complete CRC-checked read, returns a new caller-owned allocation on every success, and retains no resource-byte cache.
- Task 4.3 makes publication close idempotent and immediately observable. Close aborts and awaits active resource work before releasing the archive once; unknown identities, concurrent reads, and reads after close fail through fixed content-free codes. Image decoding, dimensions, animation limits, Blob URLs, rendering, and the public opening pipeline remain later work.

## Discoveries and decisions

- BookV1 serialization maxima are not secure archive limits; ingestion needs stricter budgets.
- BookV1 navigation is coarse; anchor-targeted hierarchy can remain internal.
- ReadingLocatorV1 element-id anchors can represent generated sanitized-model IDs if round-trip tests pass.
- OperationalErrorV1 is coarse; @voxleaf/epub needs safe detail codes without free-form data.
- Synthetic document fixtures can define expected semantics but cannot prove ZIP/XML/sanitization.
- EPUB permits scripting/remote resources that VoxLeaf can explicitly decline for privacy/security.
- Library strict checks are not necessarily defaults and must be enabled/tested.
- Dropping CSS prevents full computed visibility; this limitation must remain explicit.
- zip.js' `native` entry name denotes its bundled pure-JavaScript codec, not a native addon. The default package entry configures optional WASM/worker support, so VoxLeaf imports the narrower native core and disables workers explicitly.
- The initially considered mature zip.js `2.8.26` pin was rejected after upstream history review showed that `2.8.28` fixed order-dependent overlap detection and `2.8.30` added strict canonical end-of-central-directory selection plus bounded ambiguity probes.
- saxes does not fetch or expand DTD-defined entities by default, but it exposes a `doctype` event and a mutable entity table. The adapter must reject the event and never add resolver/entity behavior.
- OCF scheme/drive checks must run after percent decoding the first reference component as well as before decoding; otherwise an encoded colon can disguise URL or Windows-drive syntax.
- ZIP directory markers and archive lookup keys need different representations. Validating the marker and then removing it from the canonical key makes file/directory collisions deterministic without creating a host path.
- Web Streams can wrap an exception raised by an output sink while zip.js unwinds. The bounded writer retains only the fixed `EpubArchiveError` code separately and rethrows that code after discarding bytes; dependency messages, causes, paths, and content never cross the boundary.

## Final validation requirements

1. Refresh local main to PR #18 merge commit 86db4c4, branch from it, and record the actual Milestone 3 base.
2. Complete tasks only after focused criteria/commands pass.
3. Record accepted ADR and exact limits/support/content policy.
4. Record dependency versions/licenses/purpose/alternatives/runtime impact.
5. Verify ZIP/OCF/path/budget/XML/package/content/resource defenses.
6. Verify no DTD/entity/script/remote/active content execution or fetch.
7. Verify identity, deterministic model/locators, exact resolution, fallback.
8. Verify public errors contain no path/metadata/URL/markup/prose/bytes/dependency data.
9. Verify deterministic synthetic full scenario matrix.
10. Verify no disk/filesystem/network/UI/Tauri/persistence/TTS/audio/later work.
11. Run focused and complete root validation on Windows.
12. Record successful final Windows/Ubuntu CI URL.
13. Review manifests, lock, exports, bundle, ignored/generated files, logs, permissions, full diff.
14. Update only evidence-backed documentation.
15. Move to docs/plans/completed only when nothing remains.

## Final validation results

Task 1.1 documentation validation passed on 2026-07-21 with `git diff --check` and `pnpm.cmd format:check`. No dependency or application code was added.

Task 1.2 validation passed on 2026-07-21 with `pnpm.cmd install --frozen-lockfile`, `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (3 files and 12 tests), `pnpm.cmd --filter @voxleaf/epub build`, `pnpm.cmd format:check`, `pnpm.cmd lint`, and `git diff --check`. Milestone-wide implementation and final validation have not run; Task 2.1 is next.

Task 2.1 validation passed on 2026-07-21 with `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (5 files and 80 tests), `pnpm.cmd --filter @voxleaf/epub build`, `pnpm.cmd format:check`, `pnpm.cmd lint`, and `git diff --check`. The implementation remains package-internal and adds no dependency, filesystem/network capability, or public export. Milestone-wide implementation and final validation have not run; Task 2.2 is next.

Task 2.2 validation passed on 2026-07-22 with `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (6 files and 112 tests), `pnpm.cmd --filter @voxleaf/epub build`, `pnpm.cmd format:check`, `pnpm.cmd lint`, and `git diff --check`. The implementation remains package-internal, performs no non-`mimetype` decompression, and adds no dependency, filesystem/network capability, worker use, or public export. Milestone-wide implementation and final validation have not run; Task 2.3 is next.

Task 2.3 validation passed on 2026-07-22 with `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (9 files and 144 tests), `pnpm.cmd --filter @voxleaf/epub build`, `pnpm.cmd format:check`, `pnpm.cmd lint`, and `git diff --check`. Tests prove immutable strict-only policy construction, declared and observed absolute/ratio limits, exact/max+1 boundaries, retry-resistant accounting, deterministic abort/deadline behavior with injected clocks, bounded non-overlapping reads, CRC validation, partial-output discard, content-free errors, and no worker/network access. The implementation adds no dependency, public export, filesystem/native permission, UI, TTS/audio, logging, or persistence behavior. Milestone-wide implementation and final validation have not run; Task 2.4 is next.

Task 2.4 validation passed on 2026-07-22 with `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (10 files and 171 tests), `pnpm.cmd --filter @voxleaf/epub build`, `pnpm.cmd format:check`, `pnpm.cmd lint`, and `git diff --check`. Tests prove immutable prefix-independent namespace events, strict UTF-8/UTF-16 XML 1.0 decoding, fixed document profiles, exact/max+1 depth/attribute/node/text limits, aggregate UTF-8-equivalent text accounting, deterministic abort/deadline behavior, DTD/entity/XInclude/external-resource rejection, content-free parser and consumer failures, and no DOM/network/worker use. The implementation adds no dependency, public export, filesystem/native permission, UI, TTS/audio, logging, or persistence behavior. Milestone-wide implementation and final validation have not run; Task 3.1 is next.

Task 3.1 validation passed on 2026-07-22 with `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (11 files and 199 tests), `pnpm.cmd --filter @voxleaf/epub build`, `pnpm.cmd format:check`, `pnpm.cmd lint`, and `git diff --check`. Tests prove namespace-aware OCF structure parsing, archive-root local IRI resolution, document-order selection, safe unsupported-version/layout fallback, fail-closed malformed/unsafe/missing behavior, exact container/package byte limits, shared cancellation/deadline enforcement, content-free errors, and no network/worker use. The implementation adds no dependency, public export, filesystem/native permission, UI, TTS/audio, logging, or persistence behavior. Milestone-wide implementation and final validation have not run; Task 3.2 is next.

Task 3.2 validation passed on 2026-07-22 with `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (12 files and 245 tests), `pnpm.cmd --filter @voxleaf/epub build`, `pnpm.cmd format:check`, `pnpm.cmd lint`, and `git diff --check`. Tests prove namespace-aware package structure and metadata parsing, immutable deterministic output, unique resource and spine relationships, finite fallback resolution, exact collection/depth limits, active/foreign/remote fallback behavior, supported layout/media/linearity policy, cancellation/deadline propagation, ZIP and EPUB resource-protection enforcement, content-free errors, and no network/worker use. The implementation adds no dependency, public export, filesystem/native permission, UI, TTS/audio, logging, or persistence behavior. Milestone-wide implementation and final validation have not run; Task 3.3 is next.

Task 3.3 validation passed on 2026-07-22 with `pnpm.cmd --filter @voxleaf/epub typecheck`, `pnpm.cmd --filter @voxleaf/epub test` (13 files and 253 tests), `pnpm.cmd --filter @voxleaf/epub build`, `pnpm.cmd --filter @voxleaf/shared test` (18 files and 175 tests, including generated-contract verification), `pnpm.cmd format:check`, `pnpm.cmd lint`, and `git diff --check`. Tests prove the standard SHA-256 vector over an exact byte view, stable identical-byte identity, one-byte mutation sensitivity, identity independence from package paths/metadata/publisher IDs, deterministic safe resource and spine projection, unchanged shared-decoder acceptance, immutable output, content-free crypto/contract failures, and no network/worker use. The implementation adds no dependency, schema/generated-file change, public EPUB export, filesystem/native permission, UI, TTS/audio, logging, or persistence behavior. Milestone-wide implementation and final validation have not run; Task 3.4 is next.

Task 4.3 validation passed on 2026-07-22 with `pnpm --filter @voxleaf/epub typecheck`, `pnpm --filter @voxleaf/epub test` (17 files and 308 tests), `pnpm --filter @voxleaf/epub build`, `pnpm run typecheck:typescript`, `pnpm run format:check:typescript`, `pnpm run lint:typescript`, and `git diff --check`. Tests prove lazy path-private descriptors and reads, exact/max+1 raster bounds, GIF/JPEG/PNG/WebP signature agreement, missing/unknown/active/remote rejection or omission, independent caller-owned allocations, read-scoped and close-triggered cancellation, one-read concurrency, idempotent release, content-free failures, and no cache, network, worker, filesystem, Blob URL, decoding, or rendering behavior. The implementation adds no dependency, schema/generated-file change, public runtime EPUB export, native permission, UI, TTS/audio, logging, or persistence behavior. Milestone-wide implementation and final validation have not run; Task 5.1 is next.
