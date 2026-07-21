# Define shared contracts and a deterministic test harness

## Goal

Complete roadmap Milestone 2 by establishing a framework-independent, versioned contract language for VoxLeaf and deterministic test support that later reader, EPUB, persistence, TTS, scheduling, and audio work can share without depending on copyrighted books, model weights, special hardware, real time, network services, or audible playback.

This milestone must make identity, location, session invalidation, serialization, audio-duration metadata, safe errors, capabilities, and fake-source behavior precise enough for later milestones to build against. It must not implement the later components that consume those contracts.

## User-visible outcome

There is no end-user feature in this milestone. Contributors gain stable types, versioned serialized examples, synthetic fixtures, and deterministic fakes that make later behavior implementable and testable. VoxLeaf remains a pre-alpha development shell and cannot yet open an EPUB, restore progress, generate speech, or play audio.

## Background and current repository state

Milestone 1 is complete and merged into `main` at merge commit `6d0b016`. Pull request [#4](https://github.com/mmjosedaniel/voxleaf/pull/4) merged the reproducible engineering foundation. The PR's `Windows native foundation` and `Ubuntu portable foundation` jobs passed, and the merged-main `Foundation checks` run [29839779965](https://github.com/mmjosedaniel/voxleaf/actions/runs/29839779965) also passed.

The completed Milestone 1 ExecPlan records successful locked installs, formatting, linting, type checking, TypeScript/Rust/Python smoke tests, package builds, the native Tauri build, and privacy/scope review. The current working tree was clean at this plan's creation.

The actual implementation state is:

- The pnpm workspace contains `apps/desktop`, `packages/shared`, and `packages/epub` with one committed JavaScript lockfile.
- `@voxleaf/shared` is a private composite TypeScript package. Its public entry point exports nothing, and its only test proves package resolution.
- `@voxleaf/epub` is a separate private composite TypeScript package. It exports nothing, has no dependency on `@voxleaf/shared`, and implements no archive, document, locator, or fixture behavior.
- `apps/desktop` is an accessible React development shell. It contains no reader, persistence, TTS client, scheduler, audio, or shared-contract consumer.
- `services/tts` is a dependency-free Python runtime package with only a version function and smoke test. It defines no protocol model, service transport, model adapter, or audio behavior.
- The Tauri shell has no registered command, plugin, frontend API dependency, or IPC capability.
- Vitest, pytest, mypy, ESLint, Prettier, Ruff, Cargo checks, root aggregate commands, and deterministic Windows/Ubuntu CI exist and are validated.
- No contract, schema, serialization decoder, deterministic clock, fake EPUB/document source, fake TTS source, fake audio source, or synthetic document fixture exists.

The active `synchronized-reader-and-startup-buffer.md` plan predates the implementation foundation and spans roadmap Milestones 2, 3, 4, 8, and 9. It remains useful requirement context but is not an executable substitute for this milestone-specific plan; its stale current-state statements must not be used as evidence.

## Relationship to the approved roadmap

The roadmap identifies Milestone 2 as the next implementation priority and requires:

- typed contracts for book identity, spine items, stable reading locators and ranges, reading sessions and generations, narration segments, audio-frame metadata, buffer state in playable seconds, errors, capabilities, and persisted reading state;
- explicit serialization and versioning across process and persistence boundaries;
- fake EPUB, TTS, clock, and audio sources;
- synthetic fixtures containing representative chapters, paragraphs, dialogue, images, malformed structures, and navigation.

This plan implements only those outcomes. It prepares Milestone 3's secure EPUB ingestion, Milestone 4's reader and persistence, Milestone 5's narration preparation, Milestone 6's benchmark contracts, Milestone 7's process protocol, and Milestone 8's audio pipeline without starting any of them.

## Readiness assessment

Milestone 2 is ready to begin because:

- Milestone 1 is merged and its local, pull-request, and merged-main validations passed.
- The intended shared and EPUB package boundaries exist and are independently buildable and testable.
- TypeScript and Python have deterministic test runners and strict type checks.
- The roadmap, product requirements, ADR-0002, ADR-0003, and ADR-0004 establish the privacy, locator, session, audio-retention, and startup-duration invariants that shape the contracts.
- No existing public contract or persisted data must be migrated.

There is no external blocker to starting Task 1.1. Downstream tasks are intentionally blocked until Task 1.1 resolves the canonical schema, code-generation or validation, and compatibility strategy. That unresolved decision is milestone work, not a reason to produce a misleading fixed contract layout now.

## Dependencies and prerequisites

### Completed prerequisites

- Merged and green Milestone 1 workspace and CI.
- Accepted ADR-0001 through ADR-0005.
- TypeScript `6.0.3`, Vitest `4.1.10`, Python `3.12.10`, pytest `9.1.1`, mypy `2.3.0`, Rust `1.97.1`, pnpm `11.15.1`, and uv `0.11.29` as recorded by repository declarations and locks.
- Existing root commands for locked installation, formatting, linting, typing, tests, builds, and aggregate checks.

### Task dependencies

- Tasks 1.2 and all later contract tasks depend on Task 1.1's accepted schema and versioning decision.
- Persisted reading state depends on book identity and locator contracts.
- Session and generation contracts depend on common identifier and version primitives.
- Narration segments depend on locator ranges and session/generation identity.
- Audio frame metadata and buffer state depend on explicit time-unit and numeric-validation conventions.
- Fake TTS and audio sources depend on the narration, session, generation, frame, and clock contracts.
- Cross-language conformance depends on stable serialized fixtures and the schema strategy selected in Task 1.1.
- A framework-independent EPUB consumer proof depends on the book, spine, and locator public surface.

No EPUB library, renderer, persistence library, TTS engine, process transport, audio player, hardware API, or installer is a prerequisite for this milestone.

## Scope

- Decide and document one canonical source of truth for serialized contracts and compatibility rules.
- Define strict JSON-compatible conventions, branded or opaque identifiers, explicit units, and validation behavior.
- Define minimal model-independent contracts for all categories named by roadmap Milestone 2.
- Define structural reading locators and ranges without implementing locator creation, CFI parsing, resolution, fallback, or reflow.
- Define a versioned persisted-reading-state shape without choosing or implementing a storage engine.
- Define session and generation invalidation semantics before asynchronous producers exist.
- Define narration segments with explicit sensitive-text boundaries and stable source locator ranges without implementing normalization or chunking.
- Define audio-frame metadata and buffer status sufficient for deterministic duration-based tests without selecting an audio payload encoding or player.
- Define privacy-safe errors, capabilities, and non-content measurement metadata needed by later components.
- Add deterministic manual-clock, fake document/EPUB, fake TTS, and fake audio support.
- Add small synthetic valid and invalid fixtures with documented synthetic provenance.
- Prove serialized conformance in TypeScript and Python without implementing a transport.
- Prove the framework-independent EPUB package can consume the shared public contract without depending on the desktop application.
- Update only documentation directly affected by durable decisions, dependencies, command behavior, or test strategy.

## Non-goals

- Reading, extracting, validating, unzipping, sanitizing, rendering, or navigating an actual EPUB archive.
- Selecting an EPUB, DOM, sanitizer, renderer, CFI, or archive dependency.
- Computing a real book fingerprint from EPUB bytes; this belongs with secure ingestion in Milestone 3.
- Parsing or resolving EPUB CFIs, generating stable element anchors, nearest-valid fallback, pagination, or reflow behavior.
- Writing reading state to disk, choosing a storage engine, implementing migrations beyond version recognition, or retaining real file paths.
- Normalizing book text, semantic chunking, language detection, pronunciation behavior, or Spanish narration rules.
- Selecting, loading, benchmarking, or invoking a TTS model.
- Choosing or implementing standard streams, IPC, sockets, WebSockets, sidecars, or any other process transport.
- Defining a complete request/response protocol envelope, service lifecycle, backpressure, or binary framing; Milestone 7 owns those decisions.
- Selecting PCM or another production audio encoding, carrying audio payload bytes, playing audio, using Web Audio, implementing a ring buffer, or opening the 15-second startup gate.
- Implementing the scheduler, reading-session coordinator, UI state, persisted storage, hardware detection, installer, updater, or telemetry.
- Adding Tauri commands, capabilities, permissions, plugins, network listeners, or file-system access.
- Creating integration or end-to-end tests for product behavior that does not exist.

## Relevant files and documentation

- `AGENTS.md`
- `.agents/PLANS.md`
- `README.md`
- `docs/README.md`
- `docs/plans/roadmap.md`
- `docs/plans/completed/M001-engineering-foundation.md`
- `docs/plans/active/synchronized-reader-and-startup-buffer.md`
- `docs/product/vision.md`
- `docs/product/project-brief.md`
- `docs/product/mvp.md`
- `docs/product/glossary.md`
- `docs/architecture/overview.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/decisions/ADR-0001-local-first-desktop.md`
- `docs/architecture/decisions/ADR-0002-in-memory-audio.md`
- `docs/architecture/decisions/ADR-0003-stable-reading-locators.md`
- `docs/architecture/decisions/ADR-0004-start-after-audio-lead.md`
- `docs/architecture/decisions/ADR-0005-engineering-workspace-and-quality-tooling.md`
- `docs/development/testing.md`
- `docs/development/dependencies.md`
- `docs/development/setup.md`
- `SECURITY.md`
- Root workspace and TypeScript configuration.
- Current source, manifests, exports, and tests under `packages/shared`, `packages/epub`, and `services/tts`.

## Architecture and constraints

- `packages/shared` owns framework-independent domain and serialized contract definitions. It must not depend on React, Tauri, EPUB parsing, Python, a TTS model, an audio API, or a persistence implementation.
- `packages/epub` may depend on `@voxleaf/shared` through pnpm's `workspace:` protocol, but `@voxleaf/shared` must never depend on `@voxleaf/epub` or `apps/desktop`.
- Cross-language data must have one canonical machine-readable definition or one explicitly enforced generation strategy. Independent handwritten TypeScript, Rust, and Python protocol models that can drift are not acceptable.
- Serialized contracts use JSON-compatible data only. They must not depend on JavaScript classes, `Date`, `BigInt`, platform paths, or implementation-specific object identity.
- Every serialized persistence or cross-process payload has an explicit version and deterministic handling for unsupported versions. Unknown versions cannot be silently accepted as the current version.
- Identifiers are opaque outside their owner. Tests must make it difficult to mix a book, spine item, session, generation, segment, or frame identifier accidentally.
- Reading position is a stable logical locator, never a rendered page number or text quotation. Locator structures and persisted state contain no book prose.
- Book identity must not rely only on a private absolute path and must not store book prose. The real fingerprint algorithm remains a Milestone 3 ingestion decision.
- Narration text is an explicitly sensitive payload. Error, metric, identity, locator, persistence, and diagnostic contracts must not copy it.
- Every asynchronous work item and fake audio frame carries enough session and generation identity to reject stale work before it affects buffer state.
- Audio duration uses an explicit unit derived from validated metadata such as sample count and sample rate; chunk count, text length, and elapsed wall-clock time are not audio duration.
- Fakes use explicit advancement and scripted outcomes. They cannot call the real clock, sleep, network, filesystem, audio device, model, or private user data.
- Fixtures are small, synthetic, and clearly documented as synthetic. No copyrighted book, generated narration, model weight, or private path is permitted.
- Contract code remains deterministic and side-effect free. UI, process, storage, and model adapters belong in later milestones.
- New dependencies require purpose, alternatives, production/development classification, a lockfile update, and documentation. Prefer development-only schema tooling; do not add a production dependency unless runtime validation in this milestone demonstrably requires it.

## Technical decisions already made

- Tauri 2 with React and TypeScript is the desktop direction; Python is the future local TTS process boundary.
- The shared package is the intended home for framework-independent contracts.
- The EPUB package remains framework-independent and must not depend on the desktop framework.
- Visual reading, narration, highlighting, and saved progress share one logical reading position.
- Stable locators, not rendered page numbers or text quotations, are the persisted position authority.
- Generated audio is bounded in memory and is never persisted by default.
- Initial playback is gated by valid playable audio duration, not a fixed timer.
- Session or generation changes must make stale work ineligible for playback even when underlying work cannot stop immediately.
- Windows is authoritative for native validation; the Ubuntu job covers portable TypeScript and Python behavior.
- Vitest and pytest are the existing deterministic test runners. Hardware and model benchmarks remain separate.
- JavaScript, Python, and Rust keep their existing manifest and lock ownership.

## Technical decisions that must still be resolved

Task 1.1 must resolve these before dependent implementation begins:

1. **Canonical contract source:** choose a language-neutral schema, generated bindings, or another single-source strategy that prevents TypeScript/Python/Rust drift. Compare at least JSON Schema with generated or inferred types, TypeScript-first schema generation, and manually synchronized DTOs with conformance fixtures. Independent unverified DTO copies are not acceptable.
2. **Runtime validation boundary:** decide which untrusted persistence and future process inputs require runtime decoding now, which validation belongs to later adapters, and whether validation libraries are development-only or shipped.
3. **Versioning and compatibility:** decide whether versioning is per contract family or one shared contract version, how unsupported versions fail, and when additive fields are backward compatible. Transport protocol versioning remains deferred.
4. **Generated-file policy:** if code generation is selected, identify the source files, deterministic generation command, committed versus ignored outputs, drift check, and prohibition on manual edits.
5. **Identifier and numeric conventions:** select UUID-like opaque strings or another deterministic representation for IDs; define integer/finite-number rules and explicit milliseconds, samples, hertz, byte counts, and progression units.
6. **Book identity boundary:** define the opaque serialized identity and its algorithm/version slot without choosing the Milestone 3 byte-fingerprinting implementation.
7. **Locator anchor extensibility:** define how CFI or an equivalent structural anchor is represented and versioned without claiming resolution support.
8. **Test-support publication:** decide whether fakes and fixtures use a dedicated `@voxleaf/shared/testing` subpath or remain internal test modules, ensuring production consumers cannot accidentally depend on mutable fake state.

Record durable decisions in a new ADR. If the spike cannot identify a credible single-source and deterministic conformance approach, mark this plan blocked before defining public contracts rather than proceeding with duplicative models.

## Expected files or architectural areas affected

Implementation is expected to affect only:

- `packages/shared` public contract modules, versioned serialization/validation support, focused tests, and test-support modules or subpath.
- `packages/shared/package.json` exports and development dependencies only when justified by the accepted strategy.
- `packages/epub` manifest and a contract-consumer smoke test; no EPUB implementation.
- `services/tts` development dependencies and contract-conformance tests only when required by the accepted cross-language strategy; no runtime model or server behavior.
- Canonical schema and synthetic fixture directories owned by the shared-contract boundary, with exact placement decided by Task 1.1.
- Root `pnpm-lock.yaml` and `services/tts/uv.lock` only when an accepted dependency change requires regeneration.
- One new ADR under `docs/architecture/decisions` for the durable schema/versioning strategy.
- `docs/development/testing.md`, `docs/development/dependencies.md`, architecture documentation, and this ExecPlan only where actual behavior or decisions change.

`apps/desktop`, Tauri Rust source/configuration, EPUB parsing code, and production Python source should remain unchanged unless an independently justified contract-consumer proof cannot be made elsewhere. Any such exception must be recorded before implementation.

## Validation-command policy

Use only commands already defined and validated by the repository. Tasks may add test files and package exports, but this plan does not invent new script names. Run focused commands for the smallest affected area and the root aggregate before milestone completion.

Existing commands used by this plan are:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
uv run --directory services/tts --locked mypy .
uv run --project services/tts --locked pytest services/tts
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd check
git diff --check
```

If Task 1.1 accepts a new dependency, update its owning manifest and lockfile through the documented package manager, then prove `pnpm.cmd install --frozen-lockfile` and/or `uv sync --project services/tts --locked` succeeds. Do not document a new command as working until it exists and has been executed.

## Implementation milestones and independently verifiable tasks

## Milestone 1: Resolve contract ownership and compatibility

### Task 1.1: Decide the canonical schema and versioning strategy

**Specific outcome:** An accepted ADR selects one source of truth, runtime-validation boundary, compatibility policy, generated-file policy, identifier/unit conventions, and test-support publication boundary.

**Dependencies:** Merged Milestone 1 and the accepted product/architecture requirements. No later Milestone 2 task may define a public serialized contract first.

**Acceptance criteria:**

- The ADR compares the alternatives listed under unresolved decisions and explains the selected tradeoffs.
- TypeScript, Python, and future Rust consumption cannot silently diverge into independently authoritative DTOs.
- Persistence schema versioning is distinguished from the later transport protocol version.
- Unsupported versions and malformed input have explicit fail-safe behavior.
- Any dependency is classified, justified, pinned through its ecosystem lock, and added to the dependency inventory.
- The decision does not choose process transport, EPUB parser, persistence engine, TTS engine, or production audio format.

**Validation commands:**

```powershell
git diff --check
pnpm.cmd format:check
```

**Status:** Not started.

### Task 1.2: Establish shared contract primitives and module boundaries

**Specific outcome:** `@voxleaf/shared` exposes the selected version primitives, opaque identifier types, explicit numeric/unit rules, and stable public/test-support boundaries without domain-specific behavior.

**Dependencies:** Task 1.1.

**Acceptance criteria:**

- Book, spine, session, generation, segment, and frame identifiers cannot be mixed accidentally by TypeScript consumers.
- Serialized primitives remain JSON-compatible and reject invalid empty identifiers, non-finite values, negative durations/counts, and unsupported versions where applicable.
- Time and size fields encode their units in names or types.
- Test-support exports, if public, are isolated from the production root export.
- Focused tests cover valid construction and invalid boundary values.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

## Milestone 2: Define book, location, and persisted-state contracts

### Task 2.1: Define privacy-safe book and spine contracts

**Specific outcome:** Shared contracts represent an opaque book identity, ordered spine items, minimal publication metadata, navigation entries, and local image/resource metadata without parsing an EPUB or storing a private absolute path as identity.

**Dependencies:** Tasks 1.1 and 1.2.

**Acceptance criteria:**

- Book identity is opaque, versionable, and contains no title, author, prose, or absolute path.
- Spine order and identifiers are explicit; navigation can reference a spine item without a rendered page number.
- Resource metadata can describe a local image without embedding binary data or allowing a remote URL.
- Structural validation rejects duplicate IDs, invalid indexes, remote resource references, and navigation targets outside the declared spine.
- Tests use only small synthetic metadata and text.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

### Task 2.2: Define reading locator and locator-range contracts

**Specific outcome:** Shared contracts represent a versioned logical position and ordered range tied to a book and spine item, with optional progression for recovery, without implementing CFI parsing or resolution.

**Dependencies:** Task 2.1 and the locator-anchor convention from Task 1.1.

**Acceptance criteria:**

- A locator identifies book, spine item, structural anchor kind/value, and intra-anchor position using explicit validated fields.
- A locator contains no rendered page number or text quotation.
- A range has well-defined start/end ordering rules and cannot cross books silently.
- Exact round-trip serialization is tested for supported versions.
- Malformed anchors, mismatched book/range identities, invalid progression, and unsupported versions fail deterministically.
- Tests do not claim the locator resolves against real EPUB content; that belongs to Milestone 3.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

### Task 2.3: Define persisted reading state version 1

**Specific outcome:** A versioned, content-free persisted-state DTO and decoder round-trip a book's authoritative locator and minimal preferences without choosing a storage implementation.

**Dependencies:** Task 2.2 and Task 1.1's compatibility policy.

**Acceptance criteria:**

- The persisted shape contains an explicit schema version, opaque book identity, authoritative locator, and only preferences already allowed by product documentation.
- It stores no book prose, generated audio, model weights, private absolute path, or rendered page number as position authority.
- Decoder tests accept valid version 1 input and reject malformed or unsupported versions without silent coercion.
- Serialization is deterministic for canonical fixtures.
- Migration infrastructure beyond recognizing version 1 and unsupported versions is not introduced prematurely.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

## Milestone 3: Define session, narration, error, and capability contracts

### Task 3.1: Define reading-session and generation invalidation contracts

**Specific outcome:** Shared contracts distinguish the active reading session from successive generations and expose a pure deterministic eligibility rule for accepting or rejecting asynchronous work.

**Dependencies:** Task 1.2 and book identity from Task 2.1.

**Acceptance criteria:**

- Session and generation identities are distinct and carried by every work envelope used in later tasks.
- A new book/session always invalidates previous work; a new generation within a session invalidates earlier generation work.
- The pure eligibility rule has tests for active, stale-session, stale-generation, and malformed identities.
- Cancellation intent and stale-result rejection are represented separately; the contract does not claim an inference call can stop instantly.
- No scheduler, queue, process, or UI state machine is implemented.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

### Task 3.2: Define locator-linked narration segment contracts

**Specific outcome:** A narration segment can carry explicitly sensitive synthetic text, stable source locator range, sequence, and session/generation identity without defining normalization or segmentation algorithms.

**Dependencies:** Tasks 2.2 and 3.1.

**Acceptance criteria:**

- Each segment has a stable segment ID, session ID, generation ID, ordered sequence, source locator range, and explicit text payload.
- Text is marked/documented as sensitive and is absent from error, metrics, persistence, and debug fixture snapshots.
- Empty text, invalid ordering, mismatched identities, and invalid locator ranges are rejected deterministically.
- Tests use original synthetic prose only.
- No production chunk-size, language, normalization, or prosody rule is selected.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

### Task 3.3: Define privacy-safe error and capability contracts

**Specific outcome:** Versioned error and capability DTOs express stable machine-readable categories, recoverability, and model-independent features without leaking content or making unsupported hardware claims.

**Dependencies:** Task 1.2 and Task 1.1's serialization strategy.

**Acceptance criteria:**

- Errors use stable codes/categories and explicit recoverable/fatal semantics.
- Serialized errors do not include book text, narration text, generated audio, stack traces, or unnecessary private paths.
- Capabilities are model-independent and distinguish supported, unsupported, and unknown values without selecting a TTS engine or hardware profile.
- Unknown error codes or capability fields follow the accepted compatibility policy.
- Valid and malformed serialized examples are tested.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

## Milestone 4: Define audio metadata and playable-buffer state

### Task 4.1: Define framed-audio metadata and duration calculation

**Specific outcome:** Shared metadata identifies frame order and ownership and computes playable duration from validated sample metadata without carrying payload bytes or selecting a production encoding.

**Dependencies:** Tasks 1.2, 3.1, and 3.2.

**Acceptance criteria:**

- Frame metadata includes frame ID or sequence, session, generation, segment, sample rate, sample count, channel count if required for interpretation, and an explicit end-of-segment marker.
- Duration is derived deterministically from validated sample metadata, not trusted text length, chunk count, or elapsed clock time.
- Zero/negative/non-finite rates or counts, sequence gaps where continuity is required, and mismatched identities fail deterministically.
- No audio payload, codec, Web Audio API, ring buffer, or playback behavior is implemented.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

### Task 4.2: Define bounded buffer-status contracts

**Specific outcome:** Shared contracts represent contiguous playable duration, configured low/target/maximum bounds, underrun counts, and high-level state without implementing a buffer or startup gate.

**Dependencies:** Task 4.1.

**Acceptance criteria:**

- Buffer depth uses an explicit playable-duration unit.
- Low, target, and maximum thresholds must be finite, nonnegative, and ordered.
- State distinguishes empty, buffering, ready, playing, paused, and exhausted/complete conditions only to the extent justified by current product requirements.
- Status is bound to the active session and generation.
- Tests cover below/exactly-at/above boundaries and reject impossible status combinations.
- The contract does not encode a fixed wall-clock wait or claim that the approximately 15-second production gate is implemented.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

## Milestone 5: Build deterministic fakes and synthetic fixtures

### Task 5.1: Add a manually advanced deterministic clock

**Specific outcome:** Test support exposes a clock with an explicit starting instant and manual advancement for deterministic ordering and latency scenarios.

**Dependencies:** Task 1.2's test-support boundary and numeric/time conventions.

**Acceptance criteria:**

- Tests control all advancement explicitly; no real sleep, timer, timezone, or current system time is used.
- Equal-time callback ordering is deterministic and documented.
- Negative advancement and invalid scheduling fail immediately.
- Pending work can be inspected and cleared so tests cannot leak tasks between cases.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

### Task 5.2: Add synthetic document fixtures and a fake EPUB/document source

**Specific outcome:** Test support returns scripted in-memory book, spine, navigation, paragraph, dialogue, and image metadata from clearly synthetic fixtures, including invalid structural cases.

**Dependencies:** Tasks 2.1, 2.2, and 5.1.

**Acceptance criteria:**

- At least one valid multi-spine fixture contains headings, paragraphs, dialogue, a scene boundary, navigation, and local image metadata.
- Invalid fixtures cover duplicate IDs, broken navigation, invalid locator references, remote-resource metadata, and malformed structure relevant to the contracts.
- Fixtures are explicitly labeled synthetic and contain no copyrighted or private content.
- The fake uses no archive, filesystem, network, DOM, sanitizer, or renderer.
- Scripted success and failure are deterministic and observable.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

### Task 5.3: Add a controllable fake TTS source

**Specific outcome:** Test support accepts synthetic narration segments and emits scripted frame metadata or errors under manual-clock control, with explicit cancellation and stale-generation behavior.

**Dependencies:** Tasks 3.1, 3.2, 3.3, 4.1, and 5.1.

**Acceptance criteria:**

- Tests can configure response delay, frame sequence/duration, recoverable error, fatal error, and non-immediately-interruptible completion.
- Cancellation is observable without relying on real inference.
- Results retain session, generation, and segment identity so stale output can be rejected.
- The fake loads no model, emits no audio payload, opens no process or network service, and uses no hardware.
- Tests cover success, cancellation acknowledgment, late stale result, and error scenarios deterministically.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

### Task 5.4: Add a controllable fake audio source and sink

**Specific outcome:** Test support supplies and consumes ordered frame metadata without an audio device, reporting accepted, stale, out-of-order, and exhausted outcomes.

**Dependencies:** Tasks 3.1, 4.1, 4.2, and 5.1.

**Acceptance criteria:**

- The fake never creates audible output or stores generated audio.
- Tests can control frame arrival and consumption through the manual clock.
- Stale-session/generation frames do not contribute to active playable duration.
- Out-of-order, duplicate, gap, and end-of-stream cases are observable.
- The fake does not implement the production buffer, startup gate, player, underrun policy, or playback speed.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

**Status:** Not started.

### Task 5.5: Prove cross-language serialized conformance

**Specific outcome:** The same canonical valid and invalid serialized fixtures are checked by TypeScript and Python using Task 1.1's source-of-truth strategy, without defining a process transport or duplicating authoritative models.

**Dependencies:** Tasks 1.1 through 4.2 and stable canonical fixtures from Task 5.2.

**Acceptance criteria:**

- TypeScript and Python agree on acceptance of supported versioned fixtures and rejection of malformed or unsupported versions.
- Canonicalization rules, optional-field behavior, unknown-field behavior, and numeric limits are tested.
- Persisted state, locators, errors, capabilities, and frame metadata are represented; narration text appears only in explicitly sensitive narration fixtures.
- Python conformance uses no model, server, audio, network, or runtime service dependency.
- Rust receives no handwritten duplicate contract in this milestone because the native shell has no protocol consumer. The ADR must require any future Rust binding to derive from or validate against the same canonical source before Milestone 7 integration.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared test
uv run --directory services/tts --locked mypy .
uv run --project services/tts --locked pytest services/tts
```

**Status:** Not started.

## Milestone 6: Prove package boundaries and complete milestone validation

### Task 6.1: Prove the EPUB package consumes the shared contract boundary

**Specific outcome:** `@voxleaf/epub` depends on `@voxleaf/shared` through the workspace protocol and has a deterministic type/test smoke proof using synthetic book/locator contracts, without EPUB parsing behavior.

**Dependencies:** Tasks 2.1 and 2.2; complete shared package public exports.

**Acceptance criteria:**

- `@voxleaf/epub` declares `@voxleaf/shared` explicitly with the `workspace:` protocol.
- The dependency direction is shared to EPUB only; no desktop or Python dependency is introduced.
- The smoke proof imports the public package API rather than source-relative internals.
- No archive, DOM, sanitizer, renderer, CFI parser, filesystem, book logging, or production parsing code is added.
- The lockfile remains reproducible.

**Validation commands:**

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
```

**Status:** Not started.

### Task 6.2: Complete contract, fixture, test, and documentation validation

**Specific outcome:** All Milestone 2 contracts, fakes, serialized fixtures, package boundaries, and affected documentation pass focused and root validation with no unrelated product implementation.

**Dependencies:** Tasks 1.1 through 6.1.

**Acceptance criteria:**

- Every roadmap Milestone 2 contract category exists in the accepted canonical strategy and public TypeScript surface.
- TypeScript and Python conformance tests pass on the same fixture corpus.
- Fakes are deterministic, bounded by scripted inputs, and independent of real time, network, files, models, hardware, and audio devices.
- Fixture provenance and sensitive-field boundaries are documented.
- Dependency and testing documentation matches actual additions.
- Windows authoritative and Ubuntu portable CI pass on the implementation branch.
- The diff contains no later-milestone behavior or broad native permission.

**Validation commands:**

```powershell
git diff --check
pnpm.cmd install --frozen-lockfile
uv sync --project services/tts --locked
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd check
```

After pushing the implementation branch, record the exact successful GitHub Actions job names and run URL in the progress log.

**Status:** Not started.

## Acceptance criteria for Milestone 2

Milestone 2 is complete only when:

- One documented canonical source-of-truth and compatibility strategy governs shared serialized contracts.
- All contract categories named by the roadmap exist with explicit validation, units, identity, and version semantics.
- Persisted state and non-content diagnostics contain no book prose, narration text, generated audio, private absolute path, or rendered page number as the position authority.
- Session/generation identity makes stale-work eligibility unambiguous before asynchronous production components exist.
- Audio metadata can express and calculate playable duration without selecting or storing a production audio payload.
- Manual clock and fake document, TTS, and audio components are deterministic and side-effect free.
- Synthetic valid and invalid fixtures cover chapters, paragraphs, dialogue, images, navigation, and malformed contract structures.
- TypeScript and Python agree on serialized conformance from the same canonical source and fixtures.
- The EPUB package consumes shared contracts through the intended workspace boundary without implementing ingestion.
- Focused checks, root checks, builds, and both CI jobs pass.
- No work from Milestones 3 through 11 is implemented accidentally.

## Testing and benchmark strategy

### Deterministic tests

- Unit tests for identifier branding/validation, numeric boundaries, version handling, JSON round trips, locator/range structural invariants, session/generation eligibility, frame-duration calculations, and buffer-status invariants.
- Fake behavior tests driven only by manual clock advancement and scripted outcomes.
- Contract fixture tests for valid and invalid book/spine/navigation/image metadata.
- Privacy tests proving content-free persistence, errors, capabilities, and measurement metadata do not acquire narration or book text.
- Cross-language conformance tests using the same committed canonical serialized fixtures in TypeScript and Python.
- Package-boundary tests importing public exports rather than internal source paths.

All deterministic tests must run in the existing pull-request CI without model weights, GPU hardware, private data, audible output, network services, real EPUBs, or real wall-clock sleeps.

### Benchmarks

No hardware or performance benchmark is required in this milestone because there is no production parser, model, process, buffer, or player. Test runtime may be observed to prevent accidental slow suites, but it is not evidence for product latency, real-time factor, cancellation latency, or memory claims.

### Fixture policy

- Use original synthetic text and metadata only.
- Keep fixtures small and human-reviewable.
- Label their provenance in the fixture area.
- Separate valid canonical examples from intentionally invalid cases.
- Narration fixtures may contain only the synthetic text required to test the sensitive payload; persistence, error, metric, and locator snapshots must remain content-free.
- Do not commit `.epub` archives in this milestone. Safe archive fixtures belong to Milestone 3 after archive-limit requirements are defined.

## Risks and mitigations

### Speculative over-modeling

**Risk:** Contracts could encode assumptions about EPUB libraries, transport, models, storage, or audio before prototypes exist.

**Mitigation:** Keep contracts minimal and model-independent, use opaque identifiers and extensible versioned shapes, and enforce the non-goals. Require a real later consumer before adding optional abstractions.

### Cross-language drift

**Risk:** Handwritten TypeScript, Python, and Rust DTOs may diverge silently.

**Mitigation:** Resolve one canonical source in Task 1.1, use shared canonical fixtures, test TypeScript/Python conformance, and prohibit a Rust binding until it derives from or validates against that source.

### Premature wire-protocol commitment

**Risk:** Serialization work could accidentally decide request/response framing or transport before Milestone 7.

**Mitigation:** Version payload schemas only. Exclude transport envelopes, streaming framing, service lifecycle, and exposure decisions from this milestone.

### Locator false confidence

**Risk:** Structurally valid locators may be mistaken for proven EPUB resolution.

**Mitigation:** Tests cover structural serialization only and state explicitly that CFI parsing, locator creation/resolution, round-trip against sanitized content, and fallback require Milestone 3 evidence.

### Book identity privacy or instability

**Risk:** Identity could leak a private path, include prose, or become unstable when ingestion changes.

**Mitigation:** Use an opaque versioned identity contract, forbid path/prose identity, and defer the actual byte-fingerprint algorithm to secure ingestion.

### Sensitive narration leakage

**Risk:** A generic serializer, error, snapshot, or fake could copy narration text into logs or persisted state.

**Mitigation:** Mark narration text as sensitive, keep it in one explicit contract, use synthetic input, add privacy assertions, and keep errors/metrics/persistence content-free.

### Nondeterministic test harness

**Risk:** Real timers, asynchronous races, filesystem order, or random IDs could make tests flaky.

**Mitigation:** Use a manual clock, deterministic ID factories or fixed test IDs, scripted ordering, in-memory fixtures, explicit cleanup, and no real sleeps or I/O.

### Fake behavior diverges from later adapters

**Risk:** Rich fakes may create an API that real EPUB, TTS, or audio adapters cannot implement.

**Mitigation:** Keep ports narrow, model observable behavior only, and revise them through versioned contract changes when the first real adapter supplies evidence.

### Dependency expansion

**Risk:** Schema/code-generation tools may add large or runtime dependency graphs.

**Mitigation:** Compare alternatives in the ADR, prefer development-only tooling, pin through existing locks, document purpose and alternatives, and reject tools that require network/runtime services or platform-specific generation.

### Rollback and compatibility

Before Milestone 2 merges, tasks should be committed independently and can be reverted by contract family. After version 1 serialized contracts merge, do not silently rewrite their meaning. Correct incompatible mistakes with an explicit version change and fixture updates rather than destructive reinterpretation, even if no end-user persisted state exists yet.

## Progress log

- 2026-07-21: Inspected merged `main`, the workspace configuration, relevant package manifests and shared/EPUB/Python source and tests, product requirements, architecture overview and performance budget, ADR-0001 through ADR-0005, the approved roadmap, the completed Milestone 1 ExecPlan, development/security guidance, and the older synchronized-reader plan.
- 2026-07-21: Verified PR #4 is merged; its Windows and Ubuntu jobs passed; merged-main `Foundation checks` run [29839779965](https://github.com/mmjosedaniel/voxleaf/actions/runs/29839779965) passed.
- 2026-07-21: Confirmed Milestone 2 is ready. No shared contract, schema, cross-language binding, deterministic fake, or synthetic document fixture currently exists.
- 2026-07-21: Created this ExecPlan. No implementation task has started.

## Discoveries and decisions

- The roadmap's Milestone 1 dependency is satisfied in merged `main`, not merely on a feature branch.
- The existing shared and EPUB packages are intentionally empty, so Milestone 2 introduces the first public domain contracts and must treat compatibility deliberately from the first serialized version.
- The Python service exists but has no protocol consumer. Cross-language conformance is appropriate now; a transport and service DTO layer are not.
- The Rust shell has no shared-data consumer or IPC permission. Adding handwritten Rust DTOs now would be speculative; future Rust consumption must use the canonical strategy selected here.
- The older synchronized-reader plan is broader than this roadmap milestone and has a stale implementation-state section. This plan is authoritative for Milestone 2 scope and sequencing.
- A synthetic document metadata fixture can cover contract shape, navigation, dialogue, and image references without creating a real EPUB archive or exercising sanitization.
- Audio-frame metadata can support deterministic playable-duration calculations without selecting a payload encoding or implementing playback.
- The schema/versioning decision is the only start-of-milestone gate. It is assigned to Task 1.1 rather than hidden as an implementation assumption.

## Final validation requirements

Before moving this plan to `docs/plans/completed/`:

1. Mark each task complete only after its focused acceptance criteria and exact existing commands pass.
2. Record the accepted schema/versioning ADR and all dependency changes with rationale and alternatives.
3. Replace any provisional names or paths introduced by Task 1.1 with the actual repository form.
4. Verify every roadmap contract category exists and is exported from the intended public boundary.
5. Verify serialized supported/unsupported-version behavior and TypeScript/Python conformance from the same canonical fixtures.
6. Verify content-free persistence, locator, identity, error, capability, and measurement fixtures contain no book or narration text.
7. Verify fake clock, document, TTS, and audio behavior is deterministic, uses no real sleep/I/O/hardware, and cleans up pending work.
8. Verify `@voxleaf/epub` consumes `@voxleaf/shared` only through its public workspace package boundary.
9. Run the focused shared, EPUB, and Python validation commands and record their results.
10. Run `git diff --check`, locked installations, all separate root checks, `pnpm.cmd check`, and builds in native Windows PowerShell.
11. Push the implementation branch, confirm `Windows native foundation` and `Ubuntu portable foundation` pass, and record the successful run URL.
12. Review manifests, locks, exports, schemas, fixtures, logs, generated files, native permissions, and the full diff for privacy, dependency, compatibility, and scope regressions.
13. Update testing, dependency, architecture, roadmap, and contributor documentation only to reflect implemented behavior and accepted decisions.
14. Confirm no EPUB ingestion, reader, persistence backend, narration normalization, model, process transport, production audio, scheduler, hardware, or packaging behavior was introduced.
15. Move this file to `docs/plans/completed/M002-shared-contracts-and-test-harness.md` only when no required work remains.

## Final validation results

Not run. This document is a plan only. Milestone 2 implementation has not started.
