# ADR-0011: Keep bounded reader state in versioned Web Storage envelopes

## Status

Accepted.

## Context

VoxLeaf must restore the logical passage for an exact EPUB after the user reselects it, including after an application restart, without persisting book prose, rendered geometry, EPUB bytes, private paths, or publisher metadata. ADR-0003 makes `ReadingLocatorV1` the position authority, ADR-0006 requires strict versioned decoding at persistence boundaries, ADR-0007 defines exact EPUB bytes as book identity, and ADR-0008 assigns save scheduling and restoration coordination to the desktop application rather than leaf UI components or `@voxleaf/epub`.

The implemented shared `PersistedReadingStateV1` contract contains an exact book identity, authoritative locator, and optional voice/playback preferences. It deliberately selects no storage engine and contains no display settings. Milestone 4 therefore needs to decide:

1. which local backend owns the small content-free records;
2. how storage keys, values, count, and size remain bounded;
3. how display preferences are represented without silently changing shared v1;
4. when passive and explicit position changes are saved;
5. how failures, unsupported versions, and future migrations behave; and
6. which layer owns each part of persistence and restoration.

The credible backends are Web Storage, IndexedDB, an official Tauri store plugin, and a repository-owned native file store. The current product has no searchable library, synchronization, large persisted dataset, cross-process writer, or transaction spanning unrelated records. Adding a native backend would introduce permissions, IPC, packaging, dependency, and path/error ownership that these two small records do not require.

## Decision

### Use `window.localStorage` behind an asynchronous desktop repository

The initial desktop backend is the packaged WebView's `window.localStorage`, accessed only through an application-owned repository interface. Reader coordinators depend on that asynchronous interface; leaf React components, `@voxleaf/epub`, and `@voxleaf/shared` do not call Web Storage directly.

This choice is limited to small bounded state. Web Storage is synchronous, so the implementation must perform one bounded read or atomic single-key replacement at a time and must not place EPUB content or an unbounded collection behind it. The repository interface remains asynchronous and replaceable so a later proven requirement can move the backend without changing reader components or persistence-domain results.

The production Tauri origin and app identifier are part of this boundary. Development-origin storage is separate test/development state and is not migrated into a packaged build. A change to the Tauri identifier, production origin, WebView data-directory policy, or packaged WebView storage behavior requires persistence review and native restart evidence before release.

### Use exactly two fixed keys in one bounded namespace

The repository owns only these keys:

| Key | Value |
| --- | --- |
| `voxleaf.reader.positions` | One `ReadingPositionsEnvelopeV1` containing per-book logical reading state in most-recently-saved order. |
| `voxleaf.reader.preferences` | One global app-local `ReaderPreferencesV1` envelope. |

No dynamic key contains a title, author, filename, path, URL, publisher identifier, prose, markup, image data, or rendered geometry. Code outside the persistence module must not enumerate, clear, or mutate the `voxleaf.reader.` namespace.

`ReadingPositionsEnvelopeV1` has exactly:

```text
schemaVersion: 1
states: PersistedReadingStateV1[]
```

The `states` array:

- contains at most 128 entries;
- contains at most one entry for an exact `BookIdentityV1`;
- is ordered most recently saved first, so no timestamp is stored;
- moves an updated identity to the front;
- evicts from the end before admitting a 129th entry; and
- has a maximum serialized value length of 262,144 UTF-16 code units.

Before parsing, the repository rejects a positions value above that size. Before writing, it evicts oldest entries until both the count and serialized-size limits hold. If the newest validated state cannot fit by itself, the write fails without changing the stored envelope. The fixed key plus value limit bounds this record to approximately 512 KiB before implementation-specific overhead.

Every nested state is decoded with `decodePersistedReadingStateV1`. Its exhaustive shared-v1 fields remain `schemaVersion`, `bookIdentity`, `locator`, and `preferences`: identity contains only scheme/version/opaque value; locator contains only its version, repeated identity, opaque spine ID/index, structural anchor kind/version/value/index, code-point offset, and optional progression; preferences contain only an optional opaque non-path voice ID and positive playback rate. The repository then requires exact equality among the state's root identity, locator identity, lookup identity, and currently opened publication identity. For the implemented EPUB profile, the identity is SHA-256 over the exact selected bytes. A byte-modified EPUB is a different book and does not inherit state.

### Keep display preferences in a separate app-local v1 envelope

Display preferences are global for the application, not per book, and do not change `PersistedReadingStateV1`. `ReaderPreferencesV1` has exactly these required fields and closed values:

| Field | Values |
| --- | --- |
| `schemaVersion` | `1` |
| `textScale` | `small`, `standard`, `large`, `extra-large` |
| `lineSpacing` | `compact`, `comfortable`, `spacious` |
| `contentWidth` | `narrow`, `standard`, `wide` |
| `theme` | `system`, `light`, `dark` |

Its maximum serialized value length is 1,024 UTF-16 code units. The first-run defaults are `textScale: standard`, `lineSpacing: comfortable`, `contentWidth: standard`, and `theme: system`. Task 3.4 owns the deterministic visual mapping from these tokens to application CSS and accessible controls; it may not persist arbitrary CSS, font names, colors, pixel values, or publisher styles.

The desktop persistence domain owns a strict hand-written decoder for this app-local envelope. It does not add a shared schema because no package or process boundary consumes display preferences. Typeface selection, custom colors/fonts, margins, alignment, hyphenation, pagination, per-book style profiles, narration settings, and model settings are not part of `ReaderPreferencesV1`.

### Make save scheduling bounded and coordinator-owned

The reader coordinator may schedule only a locator already normalized by the active opened publication.

- Passive scroll-derived changes use a trailing 500 ms debounce.
- An unchanged canonical locator produces no write.
- A later locator for the active book supersedes an earlier pending locator.
- Table-of-contents, internal-link, previous/next, chapter, direct-locator, and settled preference-reflow navigation request one immediate coalesced save.
- Book replacement or explicit close attempts a final save of the latest validated locator, then closes the publication regardless of storage success.
- When the document becomes hidden and on `pagehide`, the owner attempts to flush the latest already validated state. It does not depend on an asynchronous `beforeunload` operation.
- Preference changes write the global preference envelope after validation; the corresponding logical locator is saved only after reflow restoration has settled.

The implementation must use deterministic fake-clock tests at 499 ms and 500 ms and prove supersession, immediate coalescing, lifecycle flush, and no write per scroll event. Storage failure never delays navigation, prevents book closure, or changes the in-memory active locator.

### Restore only decoded exact state, then use package recovery

On application start, reader preferences are decoded before reader layout is established. Missing, malformed, unsupported, or unavailable preferences use the fixed first-run defaults without exposing raw storage data.

After an EPUB opens successfully, the coordinator finds the state whose complete identity matches the publication. It accepts that state only after outer-envelope validation, shared-state decoding, and all identity checks. It then calls `OpenedPublication.resolveLocator`:

- exact and recovered results restore the returned canonical locator;
- an unresolved locator starts at the publication's first locator and shows a fixed content-free recovery notice;
- a missing state starts at the first locator without an error notice; and
- a publication with no locator shows the existing recoverable no-readable-content state.

A recovered canonical locator is saved only after the target document and layout settle. Reflow, viewport size, theme, text scale, line spacing, and content width do not change the persisted logical position. Restoration is required after component remount, book reopen, and packaged application restart when the user reselects the same exact EPUB bytes. Automatic reopening from a retained path remains deferred.

### Fail closed without making reading depend on storage

Repository operations return closed content-free outcomes for ready, missing, malformed, unsupported-version, over-limit, and unavailable storage. Raw JSON, stored values, browser exceptions, quota details, paths, book data, and rejected values do not enter UI errors, logs, metrics, or debug snapshots.

- Missing data is normal and uses defaults or book start.
- A malformed v1 value is ignored. A later validated user-generated save may atomically replace that malformed current-version value.
- An unsupported envelope version is ignored but never coerced, overwritten, evicted, or deleted by an older application. Writes to that key remain disabled for that application version, while reading continues from in-memory state.
- A denied, unavailable, over-quota, or failed storage operation leaves the last completed stored value unchanged when the platform can do so and produces a fixed nonfatal status.
- WebView/browser data is best-effort local application data and may be cleared by the user, operating system, WebView profile reset, or uninstall policy. Missing data after such clearing is handled as a first open.

### Give migration one explicit desktop owner

Version 1 has no predecessor migration. The desktop persistence module owns the two outer envelope versions, migration registry, and atomic replacement. `@voxleaf/shared` continues to own decoding for nested shared contract versions; the desktop must not reinterpret or copy unknown shared fields.

For a future supported version, the repository must:

1. inspect the outer version before strict decoding;
2. decode the complete known source version;
3. run a pure explicit migration;
4. validate the complete target version, including every nested shared contract;
5. serialize within the target count and size limits; and
6. replace the one key only after all prior steps succeed.

If any step fails, the original value remains untouched. A future change to a nested persisted-reading-state version requires a corresponding outer positions-envelope version. Preference-envelope migration is independent from reading-state migration. No migration maps one exact book identity to another or uses title, author, path, prose, progression, rendered geometry, or fuzzy metadata matching.

### Evidence

The current shared schema and decoder already reject additional fields, type coercion, malformed identities, root/locator identity mismatch, and unsupported versions. They expose only fixed contract-error codes.

[Tauri's configuration reference](https://v2.tauri.app/reference/config/#identifier) documents that the application identifier participates in the WebView data-directory path, while its [WebView API reference](https://v2.tauri.app/reference/javascript/api/namespacewebview/) identifies the data directory as storage for `localStorage`, cache, and related data. [Microsoft's WebView2 user-data-folder guidance](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/user-data-folder) identifies `LocalStorage` as application user-data-folder content and states that retaining that folder preserves data between repeat uses. The [Web Storage specification](https://www.w3.org/TR/2021/SPSD-webstorage-20210128/#the-storage-interface) requires `setItem()` to be atomic with respect to failure and to report quota/disabled-storage failure. [Web Storage remains synchronous](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API), and quota/failure handling is still mandatory, which is why this decision keeps values small and catches every operation.

The native Windows release probe built the current Tauri shell, wrote one fixed content-free marker through `localStorage`, closed the process, reopened the same release executable, observed the restored marker, and removed it. The two fixed statuses were “Persistence probe seeded.” followed by “Persistence probe restored and cleared.” The temporary source change and automation harness were removed afterward. The shell retained zero Tauri commands, plugins, capabilities, or storage dependencies.

## Consequences

- Task 4.4 can implement a small replaceable repository with no production dependency, native command, plugin, capability, path contract, or shared-schema change.
- The initial backend is appropriate only while records remain tiny and infrequently written. The 500 ms debounce, two fixed keys, 128-state limit, and serialized-size limits bound main-thread storage work and disk growth.
- A single-key positions envelope makes each position update atomic and avoids partial index/record transactions, but one malformed envelope can make all stored positions unreadable until a later valid save replaces current-version corruption.
- The most-recent ordering supplies deterministic bounded eviction without storing timestamps or book metadata.
- Exact-byte identity prevents accidental inheritance across modified EPUBs but means a corrected or re-exported book starts fresh unless a future explicitly approved migration maps versions.
- Unsupported future data is preserved at the cost of disabling writes for that key in an older application.
- Local WebView data is not cloud sync, backup, guaranteed archival storage, or proof that a file can be reopened automatically.
- IndexedDB or native storage remains available as a future replacement only after measured dataset, responsiveness, transaction, multi-process, durability, or packaging requirements exceed this boundary.
- Task 1.4 accepts ownership and policy only. No persistence repository, preference control, save coordinator, restoration behavior, application dependency, or shared contract is implemented by this ADR.

## Alternatives considered

### Use IndexedDB initially

Deferred. IndexedDB is asynchronous and better suited to larger or transactional datasets, but VoxLeaf currently has two small bounded records, one application writer, no library query, and no multi-record transaction. It adds schema/open/upgrade/transaction lifecycle complexity without satisfying a current requirement that Web Storage cannot meet.

### Add an official Tauri store plugin

Rejected for the initial boundary. It would add a production dependency, native command/capability surface, plugin configuration, packaging review, and another error boundary for data already proven to survive a packaged WebView restart.

### Add a repository-owned native file store

Rejected. A custom file format and Rust/IPC layer would own app-data paths, permissions, locking, atomic replacement, corruption, migration, and privacy-safe errors. No current product requirement justifies that surface.

### Add display settings to `PersistedReadingStateV1`

Rejected. Shared v1 is closed and already implemented for logical position plus narration-related preferences. Display choices are application-local, global, and independently versioned. Silently adding fields would violate ADR-0006 and make unrelated future processes consume desktop presentation policy.

### Use one storage key per book

Rejected for the initial implementation. Dynamic keys require a separate bounded index, reconciliation after partial multi-key updates, orphan cleanup, and more complicated migrations. One bounded positions envelope provides atomic replacement and deterministic eviction for the small approved dataset.

### Persist page numbers, pixels, percentages, DOM paths, or text quotations

Rejected by ADR-0003 and ADR-0008. Those values are unstable under reflow or contain content. Only the exact identity and shared structural locator are position authority.
