# ADR-0006: Use versioned JSON Schema as the shared contract authority

## Status

Accepted.

## Context

VoxLeaf will exchange and persist JSON-compatible data across TypeScript packages, a future Python TTS process, and possibly the Rust native shell. The same contract families also need deterministic fixtures and runtime rejection of malformed or unsupported input. If each language owns a handwritten data-transfer model, those models can accept different data without a visible repository change.

The contract strategy must remain independent of React, Tauri, EPUB parsing, a persistence engine, the future process transport, the TTS model, and the production audio format. It must also preserve the privacy rule that structural contracts and validation errors do not copy book prose, narration text, generated audio, or private paths.

JSON Schema Draft 2020-12 is a language-neutral standard for describing and validating JSON data. The dialect is declared explicitly with `$schema`, and closed object shapes can reject undeclared properties. These behaviors fit VoxLeaf's need for deterministic cross-language validation without choosing a process transport.

## Decision

### Canonical source and ownership

Checked-in [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12) documents are the only authority for serialized VoxLeaf contract shapes.

- Canonical schemas live under `packages/shared/schemas/<family>/vN.schema.json`.
- Every schema declares `"$schema": "https://json-schema.org/draft/2020-12/schema"` and a stable offline-resolvable `$id` in the form `urn:voxleaf:schema:<family>:vN`.
- References resolve only through the checked-in schema set. Normal validation and generation must not fetch schemas or metadata from the network.
- Canonical schema files are edited directly and reviewed. Generated language bindings, validators, fixtures, and documentation never become an alternate source of truth.
- Schemas use JSON-compatible values only. They do not depend on classes, `Date`, `BigInt`, platform paths, or language-specific object identity.
- Object schemas are closed with `additionalProperties: false` or, when composition requires it, `unevaluatedProperties: false`. Unknown fields therefore fail validation instead of being silently retained or copied into persistence or diagnostics.

The schema-authoring subset must be supported consistently by the selected TypeScript generator and each runtime validator. A schema feature that cannot be represented accurately in a consumer must be replaced by a portable equivalent or isolated behind an explicit semantic check; it must not be approximated silently.

### Generated TypeScript wire types

TypeScript wire DTOs are generated from the canonical schemas with the exactly pinned, development-only `json-schema-to-typescript` tool. Generated DTOs describe serialized structure only. Handwritten domain types may add opaque branding and behavior after successful decoding, but they may not redefine the wire shape.

Task 1.2 will introduce these repository-owned entry points together with the first schema:

```powershell
pnpm.cmd --filter @voxleaf/shared generate
pnpm.cmd --filter @voxleaf/shared generate:check
```

- `packages/shared/scripts/generate-contracts.mjs` will enumerate canonical schemas in sorted path order and generate `packages/shared/src/generated/contracts/<family>-vN.ts`.
- `generate` will write deterministic output with LF line endings, no timestamps or machine-specific paths, and the standard do-not-edit banner.
- `generate:check` will produce the expected bytes in memory and fail when a committed generated file is missing, stale, or unexpected. It will not modify the working tree.
- Generated files are committed so changes are reviewable and normal builds do not require code generation. Manual edits are prohibited.
- The shared package's existing test or root check surface must invoke `generate:check` once generation exists, so CI detects drift.

No schema or generated DTO is introduced by this decision task; Task 1.2 owns the first implementation. The generator is pinned now because it is part of the accepted reproducibility strategy. Python and Rust bindings are not generated speculatively. A future consumer may generate bindings from the same canonical schemas, but generated output remains disposable and non-authoritative.

### Standalone TypeScript validator implementation

Milestone 4 Task 2.5 extends the same checked-in generation boundary to `packages/shared/src/generated/validators/`. Ajv remains an exactly pinned development dependency that compiles every registered Draft 2020-12 root schema offline during `generate`/`generate:check`; production decoders import typed generated predicates and perform no runtime schema compilation. The standalone artifact includes deterministic repository-generated equivalents of Ajv's deep-equality and Unicode-code-point-length helpers, so no Ajv module, dynamic `Function`, `eval`, network access, or second schema authority enters the desktop bundle.

The generated validator bytes remain disposable derived output with the same banner and drift policy as wire DTOs. Shared conformance tests compare every serialized fixture against both a freshly compiled canonical-schema validator and the generated predicate, while the desktop production build rejects any Ajv module or runtime code-generation expression. This implementation changes neither schema semantics nor the handwritten cross-field checks that follow structural validation.

### Runtime-validation boundary

All values entering from an untyped or durable boundary are treated as `unknown` and decoded before they can become domain values:

- locally persisted reading state;
- future desktop-to-TTS process payloads;
- future native IPC payloads if Rust consumes a shared contract;
- canonical serialized fixtures used for conformance tests.

Structural validation uses the canonical Draft 2020-12 schema. A second, small semantic-validation step enforces invariants that JSON Schema cannot express clearly, such as matching book identities across a locator range or validating relationships between sample counts and buffer bounds. Validation must not coerce types, insert defaults, partially apply input, or log the raw payload.

Invalid or unsupported persisted input is rejected as a whole and returned as a content-free recoverable error; the later persistence adapter may then use its documented safe fallback. Invalid future process input is rejected before it changes session, generation, queue, buffer, or playback state. The transport and its error envelope remain Milestone 7 decisions.

Trusted in-memory domain values are not repeatedly schema-validated. Raw EPUB archive and XHTML validation belongs to secure ingestion, not this contract boundary.

Runtime validators will be added and pinned only with the first real decoder in the owning ecosystem. They must explicitly support Draft 2020-12 and offline reference registration. This task does not add an unused production validator dependency.

### Contract-family versioning and compatibility

VoxLeaf versions serialized contract families independently rather than using one global contract version.

- Every serialized root contains a required positive integer `schemaVersion` constrained to the literal version described by that schema.
- The schema `$id` and file path carry the same family version. JSON Schema's `$schema` dialect identifier is separate from VoxLeaf's `schemaVersion`.
- Published schema versions are immutable. Renaming, removing, retyping, or adding a field—including an optional field—creates a new family version.
- Decoders explicitly list the family versions they support. An unknown version is never interpreted as the newest known version.
- Supporting an older version requires an explicit decoder or pure migration into a newer validated version. Migration cannot recover data by copying unknown fields.
- Malformed and unsupported-version results are distinct, stable, content-free failures.
- Strict closed objects mean additive fields are not backward compatible for an already published version. Compatibility is achieved by retaining explicit support for the old version, not by silently weakening validation.

The persisted-reading-state `schemaVersion` governs stored content only. A future process transport will have its own protocol or envelope version and compatibility policy; payload schema versions do not choose or imply that transport.

### Identifier, numeric, identity, and locator conventions

- Serialized identifiers are bounded, non-empty strings with no control characters. They are opaque and are never accepted as another identifier family merely because both are strings.
- TypeScript domain APIs expose separately branded book, spine-item, session, generation, segment, and frame identifiers after validation. Test fixtures use fixed deterministic values; production ID-generation algorithms belong to their owning later milestone.
- Book identity is a versioned opaque value with slots for an identity scheme, scheme version, and value. It cannot contain title, author, book prose, or an absolute path. Milestone 3 chooses the byte-fingerprint algorithm.
- Counts, schema versions, sample counts, sample rates, byte counts, indexes, and millisecond durations are non-negative JSON safe integers unless a stricter positive bound is required. Field names encode units with suffixes such as `Ms`, `Samples`, `Hz`, and `Bytes`.
- Progression is the only planned fractional primitive in this milestone and is a finite JSON number in the inclusive range `0` through `1`. `NaN`, infinities, numeric strings, and implicit unit conversion are rejected.
- Exact playable frame duration is derived from validated sample count and sample rate. Serialized millisecond summaries are measurements, not wall-clock startup timers.
- Locator anchors are a closed discriminated union carrying an anchor `kind` and anchor-format version. Adding an anchor kind or changing its representation requires a new locator-family schema version. This decision does not claim EPUB CFI parsing or resolution support.

Exact property names and domain shapes remain Tasks 1.2 through 4.2 work; those tasks must follow these representation rules.

### Test-support publication

Reusable deterministic fakes, fixed ID factories, the manual clock, and fixture loaders will be exposed only through `@voxleaf/shared/testing`. The production root export will not re-export them, and production source must not import that subpath. Cross-language serialized fixtures live under `packages/shared/fixtures/contracts/<family>/vN/` and are synthetic, content-free where required, and consumed directly by TypeScript and Python tests.

The testing subpath is not a serialized production contract and may evolve with tests. Canonical schemas and serialized fixtures remain the conformance authority for data shared across languages.

### Dependency impact

`json-schema-to-typescript` `15.0.4` is a root development dependency, pinned in `package.json` and `pnpm-lock.yaml`. It runs during development and CI generation checks and is not shipped with the desktop application. No Python, Rust, runtime validator, process, persistence, EPUB, TTS, or audio dependency is added by this decision.

## Consequences

- TypeScript, Python, and future Rust consumers have one language-neutral definition of accepted serialized data.
- TypeScript wire types cannot be edited independently from the schemas, and CI will detect stale generated output once the first schema is introduced.
- Strict per-family versions make compatibility explicit and fail safely, at the cost of new schema files and migration code when shapes evolve.
- Runtime validation occurs at trust boundaries rather than throughout domain logic.
- Cross-field semantic checks remain handwritten and tested, because JSON Schema alone is not the domain model.
- The development dependency graph grows by one pinned generator and its locked transitive packages; production runtime output is unchanged.
- Supporting Draft 2020-12 consistently becomes a requirement for future validators and generators. Validator changes require conformance tests against the same valid and invalid fixtures.

## Alternatives considered

### TypeScript-first runtime schemas

Libraries such as Zod or TypeBox could infer TypeScript types directly and emit JSON Schema for Python or Rust. This is convenient for the first TypeScript consumer, but it makes a language-specific executable representation authoritative and makes cross-language behavior depend on the fidelity of a second conversion step. Rejected in favor of directly reviewed, language-neutral JSON Schema.

### Generate TypeScript-first schemas from handwritten interfaces

Generating JSON Schema from TypeScript interfaces would keep TypeScript authoring familiar. TypeScript types cannot express several runtime constraints, such as numeric bounds and string patterns, without custom metadata. The generated schema could therefore be weaker than the intended validation contract. Rejected.

### Independently handwritten DTOs with shared fixtures

TypeScript and Python DTOs could be maintained manually and tested against the same examples. Fixtures sample behavior but cannot prove that two independent validators accept the same complete input space. A field or constraint could drift silently between languages. Rejected as an authoritative strategy; shared fixtures remain an additional conformance check.

### Protocol Buffers, TypeSpec, or an IDL-first transport schema

An interface-definition language could generate multi-language bindings and stronger compatibility tooling. VoxLeaf has not selected a process transport, does not need binary serialization in this milestone, and needs human-readable local persistence. Adopting an IDL now would prematurely constrain Milestone 7. Rejected for the current contracts; a future transport may use an IDL only if it maps explicitly to these payload schemas or supersedes this ADR.

### Generate Python and Rust models immediately

Python has no transport DTO consumer yet, and Rust has no shared-contract consumer or IPC permission. Generating unused models would add tooling and public surfaces without evidence. Rejected until a real consumer exists.
