# M003.1 — Add bounded EPUB 2 and NCX compatibility

## Goal

Extend VoxLeaf's secure in-memory EPUB ingestion boundary with a deliberately
narrow reflowable EPUB 2.0.1 profile: OPF `version="2.0"`, local XHTML spine
documents, and NCX navigation selected by `spine@toc`. Preserve the current
EPUB 3 behavior, safe semantic model, stable locators, downstream narration,
privacy, cancellation, and resource ceilings.

This plan is an additive follow-up to completed Milestone 3. It must finish
before M011 Milestone 7 records the final MVP release decision.

## User-visible outcome

A user can open, navigate, restore, read, and narrate a supported reflowable
EPUB 2 book through the same VoxLeaf experience as an equivalent EPUB 3 book.
Unsupported EPUB 2 variants fail with the existing recoverable content-free
messages. Nothing is extracted to disk, no publication resource is fetched,
and no publisher markup or DTD becomes executable.

Until all milestones and final validation below pass, released and local
production builds remain EPUB 3-only. The existence of this plan and
ADR-0048 is not an implementation claim.

## Current state

- Milestones 1 and 2 of this plan are complete. Rootfile selection now admits
  exact OPF `version="2.0" | "3.0"`; the package parser applies their distinct
  metadata/navigation rules without exposing that discriminator publicly.
- The package parser requires EPUB 3 `dcterms:modified`, leaves it absent for
  EPUB 2, validates direct or deprecated-wrapper OPF 2 metadata, consumes
  `spine@toc`, and validates/ignores the bounded optional OPF 2 `guide`.
- The current navigation parser still implements only XHTML
  `<nav epub:type="toc">`. An admitted OPF 2 package stops at an explicit
  content-free `unsupported-resource` boundary before NCX bytes are read;
  Milestone 3 owns the NCX parser.
- The shared public opener already separates archive, package, navigation,
  XHTML projection, book projection, locators, resources, and explicit close.
  The existing internal `ParsedNavigationDocument` is suitable as the common
  projection target for EPUB 3 navigation and NCX.
- Completed M004 provides the reader, target navigation, reflow, and
  restoration. Completed M005 provides bounded locator-linked narration
  preparation from the safe semantic model. Neither boundary should need an
  EPUB-version branch.
- The deterministic test support now has separate EPUB 3 and OPF2/NCX
  builders. The public ingestion matrix proves OPF 2 package admission while
  intentionally withholding publication output until NCX support exists.
- M011 remains active. The user reports that VoxLeaf worked on an independent
  older Windows PC with 4 GB VRAM and 16 GB RAM; the report is retained in
  M011 as exploratory package evidence and does not affect this EPUB parser
  scope.

## Scope and non-goals

### In scope

- Accept exact OPF `version="2.0"` in addition to the unchanged EPUB 3
  profile.
- Apply version-specific metadata rules without synthesizing
  `dcterms:modified` or changing shared schemas.
- Accept either direct OPF 2 metadata or the deprecated, mutually exclusive
  `dc-metadata` plus optional `x-metadata` wrapper form defined by ADR-0048.
- Require and resolve `spine@toc` to one local NCX manifest item with exact
  media type `application/x-dtbncx+xml`.
- Parse a bounded NCX `navMap` directly into the existing internal navigation
  tree, preserving document order and local target resolution.
- Admit the exact inert canonical NCX and EPUB 2 XHTML 1.1 doctypes without
  resolving DTDs or custom entities.
- Validate and ignore a bounded local EPUB 2 `guide` and optional NCX
  `pageList`/`navList` under ADR-0048.
- Reuse the current archive, XML, path, fallback, XHTML semantic, raster,
  identity, locator, error, cancellation, and lifecycle owners.
- Add deterministic synthetic OPF2/NCX fixtures plus hostile and exact-boundary
  regressions.
- Prove the public package, desktop reader, restoration, target navigation,
  and narration-preparation behavior on supported EPUB 2 bytes.
- Reconcile product, architecture, testing, roadmap, and M011 release
  documentation only with measured implementation results.

### Non-goals

- Full EPUB 2, EPUBCheck, OPS, OCF, XHTML 1.1, or reading-system conformance.
- DTBook, SVG spine documents, `text/x-oeb1-document`, XML islands, CSS
  fidelity, scripts, forms, media overlays, audio/video, fixed layout,
  protected/encrypted content, DRM, or obfuscated-font decoding.
- DTD loading, validation, external entity resolution, custom entity tables,
  or general public/system-identifier support.
- Using `guide`, `pageList`, or `navList` as primary reader navigation.
- Supporting missing-NCX recovery, NCX-to-HTML conversion, tours, CFI, or
  malformed-package repair heuristics.
- Changing rendered semantic text, BookV1/locator/error schemas, persistence,
  narration normalization/packing, TTS protocol, buffering, audio, installer
  topology, Chatterbox availability, or signing policy.
- Adding a production dependency unless implementation evidence proves the
  existing `saxes`/ZIP boundaries insufficient and a separate documented
  dependency decision is accepted first.
- Committing real commercial books, opaque EPUB binaries, book text, private
  paths, generated audio, model data, or content-bearing logs.

## Relevant files and documentation

Governing documentation:

- `AGENTS.md`
- `.agents/PLANS.md`
- `docs/README.md`
- `docs/product/mvp.md`
- `docs/product/project-brief.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/overview.md`
- `docs/architecture/decisions/ADR-0003-stable-reading-locators.md`
- `docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md`
- `docs/architecture/decisions/ADR-0012-bounded-narration-preparation.md`
- `docs/architecture/decisions/ADR-0048-admit-bounded-epub2-and-ncx-compatibility.md`
- `docs/plans/completed/M003-secure-epub-ingestion-and-document-model.md`
- `docs/plans/completed/M004-reflowable-visual-reader-and-position-restoration.md`
- `docs/plans/completed/M005-narration-text-preparation.md`
- `docs/plans/active/M011-package-validate-and-release-mvp.md`
- `docs/plans/roadmap.md`
- `docs/development/testing.md`
- `docs/development/dependencies.md`

Expected implementation and test owners:

- `packages/epub/src/container/container-resolver.ts`
- `packages/epub/src/container/container-resolver.test.ts`
- `packages/epub/src/package/package-document.ts`
- `packages/epub/src/package/package-document.test.ts`
- `packages/epub/src/navigation/navigation-document.ts`
- a focused package-internal NCX parser and tests under
  `packages/epub/src/navigation/`
- `packages/epub/src/xml/xml-event-reader.ts`
- `packages/epub/src/xml/xml-event-reader.test.ts`
- `packages/epub/src/public/open-epub-publication.ts`
- `packages/epub/src/public/open-epub-publication.test.ts`
- `packages/epub/src/integration/ingestion-matrix.test.ts`
- `packages/epub/src/integration/narration-preparation-matrix.test.ts`
- `packages/epub/test-support/epub-fixture.ts`
- `packages/epub/src/testing/epub-fixture.test.ts`
- existing desktop package-reader, browser, and native-startup suites if the
  public EPUB 2 journey needs a new fixture arm

## Architecture and constraints

`@voxleaf/epub` remains the sole owner of package-version interpretation. The
public entry point stays `openEpubPublication(bytes, { signal? })`; consumers
receive the same immutable `OpenedPublication` regardless of source version.

The implementation should use a small internal version discriminator rather
than duplicate the pipeline:

```text
bounded OCF bytes
    -> select supported OPF 2.0 or OPF 3.0 package
    -> apply version-specific metadata/navigation relationship rules
    -> parse NCX or EPUB 3 XHTML navigation into one internal tree
    -> reuse XHTML projection, BookV1 projection, locators, resources, reader,
       persistence, and narration preparation unchanged
```

The version discriminator and navigation source kind remain package-internal.
No renderer, shared-contract, persistence, or TTS branch may depend on them.
EPUB 2 missing `dcterms:modified` is represented internally as absence, not a
fabricated timestamp or identifier. Exact EPUB bytes remain book identity.
Consequently, equivalent EPUB 2 and EPUB 3 fixtures have different `bookId`
values. Downstream equivalence compares semantic structure and the relative
spine/anchor/offset parts of locators after substituting each fixture's known
identity; it never compares identity-bearing locator objects byte-for-byte.

The existing immutable ingestion policy is the only maxima authority. NCX and
guide work consumes the current XML node/text/depth/time budget and the same
navigation node/depth maxima. Every `navPoint`, `pageTarget`, and `navTarget`
counts toward the single 10,000-node maximum, every NCX label retains the
1,024-code-point maximum, and ignored NCX/metadata/guide structures still
consume all applicable budgets. Only internal policy construction and tests
may supply equal or stricter limits; `openEpubPublication` and UI callers gain
no policy selector, and no caller can raise a maximum. Cancellation
checkpoints, deadline behavior, partial-output discard, archive close, and
content-free errors apply to every new loop and parse stage.

The XML adapter may add narrowly named profiles for NCX and EPUB 2 XHTML, but
only the exact declarations accepted by ADR-0048 may pass. It must never load
an external subset, mutate the entity table, or expose parser text/errors.
Near-miss identifiers, internal subsets, custom entities, and external
processing instructions remain rejection cases.

NCX path and target resolution must reuse `parseOcfReference` and
`resolveOcfReference`. It must not call URL, filesystem, fetch, worker, DOM,
or browser APIs. Labels, fragments, metadata, paths, and bytes remain
sensitive and must not appear in errors, metrics, snapshots, or logs.

M005's normalized narration text and stable half-open locator ranges are
downstream invariants. A supported EPUB 2 and equivalent EPUB 3 fixture must
produce equivalent safe semantics, navigation destinations, locator behavior,
and prepared narration without changing M005 policy or implementation claims.

## Milestones

### Milestone 1: Establish the green baseline and fixture authority

#### Work

1. Run the unchanged focused EPUB baseline outside the sandbox and record the
   exact file/test counts.
2. Extend the deterministic fixture builder with explicit EPUB 2 package,
   NCX, guide, and doctype inputs while retaining EPUB 3 defaults.
3. Characterize the current public boundary with a passing test that an exact
   `version="2.0"` fixture returns `unsupported-version`, plus passing fixture
   determinism and privacy checks. Replace that expectation atomically with
   acceptance coverage as implementation lands; no checkpoint ends red.
4. Prove the fixture output is deterministic, synthetic, test-only, and does
   not add a production dependency or opaque binary.

#### Validation

```powershell
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
git diff --check
```

Expected result: the unchanged baseline and new characterization tests pass;
the repository remains green while the future acceptance boundary is captured
explicitly and existing EPUB 3 behavior is unchanged.

Baseline actual result on 2026-08-03, before fixture or production edits:

- `pnpm.cmd --filter @voxleaf/epub typecheck` passed.
- `pnpm.cmd --filter @voxleaf/epub test` passed with 34 files and 580 tests.
- `pnpm.cmd --filter @voxleaf/epub build` passed.
- `git diff --check` passed.

Milestone 1 actual result on 2026-08-03:

- Added test-only `buildMinimalEpub2Fixture`, explicit raw package/NCX
  overrides, direct and deprecated-wrapper metadata generation, optional
  `guide`, and raw NCX/XHTML doctype inputs. The existing EPUB 3 builder and
  production parser are unchanged.
- Added focused deterministic ZIP/content coverage and a public privacy-safe
  characterization. Two new tests pass; exact OPF `version="2.0"` still returns
  `unsupported-version` with no publication, input mutation, network, Worker,
  path, guide metadata, or other sensitive result.
- No dependency, opaque binary, committed EPUB, shared contract, production
  source, renderer, persistence, narration, TTS, audio, or installer behavior
  changed.
- `pnpm.cmd --filter @voxleaf/epub typecheck` passed.
- `pnpm.cmd --filter @voxleaf/epub test` passed with 34 files and 582 tests.
- `pnpm.cmd --filter @voxleaf/epub build` passed.
- `pnpm.cmd format:check:typescript` and `pnpm.cmd lint:typescript` passed.
- `git diff --check` passed after the result documentation update.

#### Status

Complete.

### Milestone 2: Admit the bounded OPF 2 package profile

#### Work

1. Extend rootfile selection and internal package version types to exact
   `"2.0" | "3.0"` without changing the public opener.
2. Apply version-specific metadata rules. Retain exact EPUB 3 requirements;
   require OPF 2 title/language/identifier/unique-identifier, keep internal
   modified absent, and validate/ignore OPF 2 `dc:date` rather than treating it
   as `dcterms:modified`.
3. Admit either direct OPF 2 metadata or exactly one deprecated `dc-metadata`
   plus optional `x-metadata` form. Reject mixed/duplicate wrappers, preserve
   duplicate-ID checks, project only existing supported fields, and validate
   and ignore supplemental values under the shared budgets.
4. Parse and validate `spine@toc`, enforce its one local exact-NCX manifest
   relationship, and retain the existing spine/fallback/layout/resource
   restrictions.
5. Validate and ignore the exact optional EPUB 2 guide. Require nonempty
   `type`/`href`, allow a bounded optional `title`, and reject tours and guide
   fallback behavior.
6. Add exact/max-plus-one, cancellation, malformed-order, duplicate-ID,
   missing/wrong TOC, wrong media type, remote NCX, guide-target, and
   EPUB 3 non-regression tests.

#### Validation

Run the focused commands from Milestone 1 outside the sandbox.

Expected result: supported OPF 2 reaches the not-yet-implemented NCX parser;
all invalid/unsupported relationships fail through fixed content-free codes;
EPUB 3 output is unchanged.

Milestone 2 baseline actual result on 2026-08-03, before production edits:

- `pnpm.cmd --filter @voxleaf/epub typecheck` passed.
- `pnpm.cmd --filter @voxleaf/epub test` passed with 34 files and 582 tests.
- `pnpm.cmd --filter @voxleaf/epub build` passed.

Milestone 2 actual result on 2026-08-03:

- Rootfile selection and package-internal models now admit only exact OPF
  `"2.0" | "3.0"`, with an internal `ncx | xhtml` navigation-source kind.
  Neither discriminator enters the public package exports, shared contracts,
  renderer, persistence, narration, TTS, or audio boundaries.
- OPF 2 requires nonempty title/language/identifier and a valid
  `unique-identifier` relation, leaves `modified` absent, and validates then
  discards `dc:date`, supported supplemental Dublin Core values, legacy
  `meta name/content`, and foreign supplemental metadata.
- Direct metadata and exactly one deprecated `dc-metadata` plus optional
  `x-metadata` are admitted as mutually exclusive forms. Mixed/duplicate
  wrappers, misplaced metadata, malformed supplementals, and duplicate IDs
  fail transactionally with content-free errors.
- Required `spine@toc` now resolves one local, exact-media-type NCX manifest
  item with no fallback. Existing local XHTML spine, fallback, layout,
  protection, manifest, and cancellation restrictions remain active.
- One optional post-spine OPF 2 `guide` is path/manifest/media-type validated
  and discarded. It cannot replace a missing NCX relation; remote,
  undeclared, non-XHTML targets, duplicate guides, and deprecated `tours` are
  rejected.
- The public OPF2 fixture now reaches the explicit pending-NCX branch and
  returns `unsupported-resource` without reading NCX bytes or returning a
  publication. EPUB 3 output and the public result schema are unchanged.
- Focused coverage grew from 582 to 618 tests and includes direct/wrapped
  metadata, required fields, duplicate IDs, malformed order, exact/max-plus-one
  manifest/spine limits, cancellation, missing/wrong TOC, exact NCX media type,
  remote/fallback NCX, guide validation/fallback exclusion, public privacy,
  and EPUB 3 regressions.
- From normal local PowerShell outside the sandbox,
  `pnpm.cmd --filter @voxleaf/epub typecheck`, `test` (34 files/618 tests),
  `build`, `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, and
  `git diff --check` passed.

#### Status

Complete.

### Milestone 3: Parse NCX into the common navigation model

#### Work

1. Add the exact inert NCX and EPUB 2 XHTML doctype profiles to the bounded XML
   adapter with no resolver/entity behavior.
2. Implement one package-internal NCX event parser for the ADR-0048 grammar.
3. Reuse or extract the current local navigation-target resolver so EPUB 3 and
   NCX share path, manifest, spine/non-spine, fragment, and error rules.
4. Dispatch navigation parsing only from the package-internal source kind and
   return the existing `ParsedNavigationDocument` shape.
5. Cover nested navMap order/labels/targets, optional ignored page/nav lists,
   the aggregate node budget across `navPoint`/`pageTarget`/`navTarget`, exact
   depth and 1,024-code-point label limits, malformed grammar,
   remote/query/undeclared/non-content targets, doctype near misses, entity
   attempts, cancellation, cleanup, immutability, and privacy canaries.

#### Validation

Run the focused commands from Milestone 1 outside the sandbox.

Expected result: a supported OPF2/NCX fixture opens through the public package
API; all hostile or over-budget cases fail without partial publication,
external access, or sensitive diagnostics.

#### Status

Not started.

### Milestone 4: Prove reader, locator, restoration, and narration equivalence

#### Work

1. Extend the public ingestion matrix with equivalent EPUB 2 and EPUB 3
   synthetic books and compare safe semantics, navigation, resources, stable
   locator resolution, and lifecycle after remapping each fixture's distinct
   exact-byte book identity.
2. Exercise nested NCX targets through the existing target resolver and
   desktop reader navigation.
3. Prove close/reopen and exact/nearest-valid restoration for EPUB 2 bytes
   without persisting version, path, metadata, or prose.
4. Run the public narration-preparation matrix from the same EPUB 2 semantics
   and prove stable source ranges, continuation, cancellation, and output
   equivalence without changing M005 normalization or packing.
5. Add the smallest browser and packaged native journey needed to prove a real
   user can select and open the synthetic EPUB 2 fixture. Reuse existing
   harnesses rather than create another product path.

#### Validation

```powershell
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd test:browser
pnpm.cmd test:native-startup
git diff --check
```

Expected result: the complete EPUB 2 user path passes through the same public
schema and downstream behavior as EPUB 3 while preserving its distinct
exact-byte identity; no external request, persisted book content, generated
audio, or new capability is observed.

#### Status

Not started.

### Milestone 5: Reconcile authority and close validation

#### Work

1. Amend ADR-0007's implemented-support wording only after the new profile
   passes; retain its historical EPUB 3 evidence and link ADR-0048 as the
   additive authority.
2. Update product, architecture, testing, roadmap, M011, and documentation
   indexes with actual supported/unsupported cases and test counts.
3. Review the canonical system diagram. Update its status/evidence text, not
   its component topology, unless implementation actually changes an owner or
   runtime edge.
4. Run focused, portable, native Windows, privacy, capability, dependency,
   artifact, and diff validation outside the sandbox.
5. Move this plan to `docs/plans/completed/` only after every required result
   and pull-request check is recorded.

#### Validation

```powershell
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd check:portable
pnpm.cmd check
git diff --check
```

Expected result: every applicable command passes from a normal local
PowerShell session, the final diff contains no unrelated/generated/private
artifact, and documentation distinguishes the bounded profile from full EPUB
2 conformance.

#### Status

Not started.

## Testing and benchmark strategy

All acceptance commands run in normal local PowerShell outside the managed
automation sandbox. Sandbox output may be exploratory only.

Deterministic tests use repository-authored in-memory fixtures. At minimum the
matrix covers:

- one minimal and one nested-navigation OPF2/NCX success;
- semantically equivalent EPUB 2/EPUB 3 navigation, locator, reader, and
  narration outcomes after replacing each expected `bookId`; archive bytes
  and identity-bearing locator objects are deliberately unequal;
- direct and deprecated `dc-metadata`/`x-metadata` forms, their mutual
  exclusivity, and required metadata/unique-identifier relationships;
- `spine@toc`, manifest media type/locality/fallback, NCX version/namespace,
  navMap/navPoint/navLabel/content, guide, pageList, and navList rules;
- NCX and XHTML doctype exact positives plus public/system near misses,
  internal subsets, custom entities, external-resource processing attempts,
  and undefined entity references;
- remote, queried, unsafe, undeclared, non-manifest, non-content, non-spine,
  missing-fragment, duplicate-ID, and malformed targets;
- exact/max-plus-one input, XML, path, manifest, spine, aggregate NCX
  navigation depth/node, 1,024-code-point label, semantic-block, work, and
  time/cancellation boundaries at their injectable owners;
- no partial publication after any failure; deterministic retry and close;
- no filesystem, network, worker, DOM, storage, log, TTS, or audio capability
  inside package ingestion; and
- unchanged EPUB 3 legacy-meta and inert-HTML-doctype compatibility.

No model or hardware benchmark is required. The relevant measurements are
deterministic counts, bounded elapsed processing under the existing deadline,
and browser/native open behavior. Any performance regression must be reported
without book text, metadata, paths, URLs, fragments, or raw dependency errors.

## Risks and rollback

- **XML compatibility weakens the DTD boundary.** Keep exact declaration
  allowlists, no resolver/entity mutation, and near-miss/XXE regressions. If
  that cannot be proven, keep the affected doctype unsupported rather than
  broadening identifiers.
- **Version branches duplicate the package pipeline.** Limit branching to
  package metadata/relationship parsing and navigation dispatch; reuse the
  common semantic projection and public model.
- **Common EPUB 2 files use features outside the profile.** Document each
  explicit exclusion and return a recoverable unsupported outcome. Do not add
  ad hoc recovery during implementation.
- **NCX targets and guide references escape the container.** Reuse the exact
  OCF reference and manifest authorities; no URL or filesystem fallback.
- **EPUB 3 behavior regresses.** Preserve current fixtures byte-for-byte and
  run the full EPUB 3 matrix after every parser milestone.
- **Locators or narration drift by package version.** Compare equivalent
  fixtures through public locator and preparation APIs after remapping their
  necessarily different book identities; do not add version to
  persisted/shared contracts or weaken exact-book locator matching.
- **Scope grows into full conformance.** Stop at ADR-0048. Additional formats,
  DTD vocabularies, CSS fidelity, or recovery rules require a later ADR and
  ExecPlan.

Rollback is additive: remove the internal OPF2/NCX admission and its new
fixtures while retaining the unchanged EPUB 3 parser and public contracts.
No persisted migration or shared-schema rollback should be necessary. If only
one EPUB 2 subfeature fails security validation, keep `version="2.0"`
unsupported rather than ship a partially navigable profile.

## Progress log

- **2026-08-03:** Created this active ExecPlan after reviewing the completed
  M003 and M005 boundaries, current package/navigation/XML code, product and
  architecture documentation, the M011 release sequence, and the historical
  OPF 2.0.1/NCX requirements. Accepted ADR-0048 before any result-bearing
  implementation. No production source, test fixture, dependency, schema,
  generated artifact, capability, reader behavior, persistence, narration,
  TTS, audio, installer, or release claim changed in this planning step.
- **2026-08-03:** Created implementation branch
  `codex/m003-1-green-baseline` from the uncommitted approved planning state.
  Ran the unchanged focused EPUB baseline from normal local PowerShell outside
  the sandbox: typecheck passed; 34 test files and 580 tests passed; build and
  `git diff --check` passed. Milestone 1 is now in progress; EPUB 2 remains
  unsupported and no fixture or production source had changed at this point.
- **2026-08-03:** Completed Milestone 1 with one additive test-support builder
  and two tests. The builder covers direct and deprecated-wrapper metadata,
  explicit package/NCX inputs, optional guide markup, and raw doctype prefixes
  without changing EPUB 3 defaults. The public characterization remains green
  at `unsupported-version`, redacts the synthetic privacy canary, mutates no
  caller bytes, and constructs no Worker or network request. The first
  post-change typecheck exposed a test-only ZIP `Entry` union guard and one
  missing import; both were corrected before any checkpoint. Final external
  typecheck, 34-file/582-test suite, build, Prettier check, ESLint, and diff
  check pass. No production support is claimed.
- **2026-08-03:** Created `codex/m003-2-opf2-package-profile` from updated
  `main` at the merged Milestone 1 result. The unchanged external baseline
  passed typecheck, 34 files/582 tests, and build before production edits.
  Completed Milestone 2 in checkpoint `20f14d0`: exact OPF 2 package
  selection, version-specific metadata, `spine@toc`/NCX relation validation,
  optional guide validation, internal navigation-source dispatch, and 36 new
  regressions. Final external typecheck, 34 files/618 tests, build, Prettier,
  ESLint, and diff check pass. The public opener deliberately returns no
  publication at the pending NCX parser, so end-user EPUB 2 support is not yet
  claimed.

## Discoveries and decisions

- **Decision:** This work is Milestone 3.1 and uses its own ExecPlan. It is not
  M011 Milestone 6B because it changes EPUB parsing/security rather than
  Chatterbox packaging or clean-host validation.
- **Decision:** M011 Milestone 7 waits for M003.1 and the affected packaged
  EPUB journey, while the remaining M011 Milestone 6 hardware/signing gates
  stay independent.
- **Decision:** EPUB 2 projects into the existing public publication and
  navigation model. No shared contract, renderer fork, or narration fork is
  authorized.
- **Decision:** NCX is mandatory; `guide` is validated and ignored rather than
  used as a missing-NCX fallback.
- **Decision:** Both OPF 2 metadata forms are supported. The deprecated
  `dc-metadata` plus optional `x-metadata` form is mutually exclusive with
  direct metadata, and supplemental values are bounded and ignored.
- **Decision:** Exact inert NCX and XHTML 1.1 doctypes may be admitted, but no
  DTD or custom entity processing is authorized.
- **Decision:** `dcterms:modified` remains an EPUB 3 rule. VoxLeaf does not
  fabricate it for EPUB 2.
- **Discovery:** The current container resolver, package parser, navigation
  parser, and fixture matrix all encode EPUB 3 as a literal, so compatibility
  needs coordinated package-internal changes even though the downstream
  public model can remain unchanged.
- **Discovery:** A separate OPF2/NCX builder preserves the existing EPUB 3
  fixture API and byte-generation path while giving later milestones explicit
  package, NCX, guide, metadata-form, doctype, omission, additional-entry, and
  mutation controls. ZIP entry inspection must narrow directory entries before
  test extraction; no production abstraction is needed.
- **Decision:** The package-internal navigation source is a closed
  `ncx | xhtml` discriminator. Until Milestone 3 implements NCX parsing, the
  NCX dispatch branch fails as content-free `unsupported-resource` before
  reading navigation bytes; it does not pretend the admitted OPF 2 package is
  an unsupported version.
- **Decision:** OPF 2 guide and supplemental metadata bounds reuse the existing
  package byte, XML node/attribute/depth/text, path, cancellation, and deadline
  authorities. No caller-selectable maximum or new production dependency is
  needed.
- **Discovery:** The first exploratory post-change suite correctly exposed two
  frozen assumptions that used OPF 2 as the generic unsupported-version case.
  Those cases now use exact unsupported `version="1.0"`, while the dedicated
  OPF2 public characterization asserts the pending-NCX boundary.

## Final validation results

Milestone 1 passed on 2026-08-03 from normal local PowerShell outside the
managed sandbox: focused typecheck, 34 files/582 tests, build, TypeScript
Prettier, ESLint, and `git diff --check` are green. The diff contains only
test-support, two focused/public tests, and actual-result documentation; no
dependency or opaque artifact was added. Full-plan browser/native, supported
EPUB 2, privacy/hostile-input, and pull-request validation remain not started.
Do not move this plan to `completed/` or describe EPUB 2 as supported before
every later milestone and applicable gate passes.

Milestone 2 passed on 2026-08-03 from normal local PowerShell outside the
managed sandbox: focused typecheck, 34 files/618 tests, build, TypeScript
Prettier, ESLint, and `git diff --check` are green. The implementation remains
package-internal and introduces no dependency, public schema, renderer,
persistence, narration, TTS, audio, or installer change. NCX parsing,
EPUB2-XHTML doctype admission, end-to-end opening, downstream equivalence, and
full-plan validation remain assigned to Milestones 3 through 5.
