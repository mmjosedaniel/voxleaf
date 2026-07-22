# ADR-0009: Use capability-free WebView file selection for local EPUB ingress

## Status

Accepted.

## Context

VoxLeaf needs to let a user select one local EPUB and transfer only its bounded bytes into the framework-independent `@voxleaf/epub` opener. ADR-0007 limits compressed input to 100 MiB and prohibits host paths, filesystem access, extraction, persistence, and network access inside the EPUB package. ADR-0001 requires evidence before the desktop adds a Tauri command, plugin, or capability.

The desktop foundation initially had no file control or file-reading behavior. The Milestone 4 plan therefore required a native Windows prototype to compare:

1. an application-owned HTML file input and browser memory read;
2. official Tauri dialog/filesystem plugins with narrow capabilities; and
3. repository-owned Rust dialog/read commands.

The boundary also needs cancellation and stale-result protection. `File.arrayBuffer()` creates suitable in-memory bytes but does not expose an operation that can abort an active browser read. The browser `FileReader` API provides the same local in-memory result with an explicit `abort()` operation.

## Decision

Use an application-owned `<input type="file" accept=".epub,application/epub+zip">` in the Tauri WebView and read the selected `File` through `FileReader.readAsArrayBuffer`.

This is a browser-platform boundary and requires no Tauri frontend API, command, plugin, capability, Rust change, production dependency, host-path contract, or CSP change. The `accept` value is only a picker hint; it is not trusted as validation.

The desktop boundary must:

- reject a non-safe, negative, or greater-than-100-MiB reported size before constructing a reader;
- permit exactly 100 MiB and reject the next byte;
- keep at most one application-owned active read, abort it when a replacement selection starts or the owning UI unmounts, and reject every stale completion by request identity;
- verify after the read that the returned `ArrayBuffer` length exactly matches the preflighted `File.size` and remains within the 100-MiB ceiling;
- expose only a caller-owned `Uint8Array` or a closed `cancelled`/fixed-reason rejected result;
- clear the input value after capturing the `File` so selecting the same file again produces a new selection;
- treat picker cancellation as a normal content-free state; and
- never return, display, persist, or log the `File`, filename, host path, MIME claim, raw browser error, bytes, or rejected value.

The current Task 1.2 probe stops after proving that bounded bytes are ready. It deliberately does not add a desktop dependency on `@voxleaf/epub`, open a publication, retain bytes, or claim that a user can read a book. Task 2.2 owns publication-session cancellation/replacement, and Task 2.3 will pass the successful bytes to `openEpubPublication` and map its safe result.

### Evidence

Deterministic desktop tests cover the file-input accept hint, small reads, exact/max-plus-one size preflight, invalid sizes, byte-length mismatch, fixed failure mapping, active-read abort, picker cancellation, same-owner cleanup, stale-completion rejection, cleared input state, and absence of a private filename from rendered UI.

The native Windows release probe built and launched the Tauri executable in WebView2 with the capability list still empty. Using disposable synthetic files outside the repository, it exercised a small selection, same-file reselection, exactly 104,857,600 bytes, 104,857,601 bytes, and cancellation. The release UI accepted the first three valid-size selections, rejected maximum plus one before reading, cleared the input, and contained none of the temporary filenames. The disposable files and one-off probe harness were removed after validation.

The accepted focused validation was:

```powershell
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd --filter @voxleaf/desktop build
pnpm.cmd --filter @voxleaf/desktop tauri build
pnpm.cmd run lint:typescript
```

## Consequences

- Local selection remains inside the packaged WebView and does not widen the native IPC or filesystem permission surface.
- Browser file bytes are transient and bounded to one 100-MiB read owned by the probe. Successful probe bytes are released rather than retained.
- The desktop repeats ADR-0007's compressed-input ceiling as an early resource guard; `@voxleaf/epub` remains the security authority and must validate the bytes again after Task 2.3 integrates it.
- Filename extension and MIME type remain untrusted. A renamed or malformed file reaches EPUB validation only after the size gate.
- An automatically updated WebView2 runtime remains part of the platform matrix. The native selection probe must be repeated after material WebView/Tauri changes or if file selection regresses.
- A future requirement such as retained file handles, automatic reopening, or a demonstrated WebView limitation would require a new decision before adding native file capabilities.

## Alternatives considered

### Use `File.arrayBuffer()`

Rejected for the cancellable boundary. It is smaller syntactically but offers no handle for aborting an in-flight read. `FileReader` preserves the capability-free browser design while bounding active work through `abort()`.

### Add official Tauri dialog and filesystem plugins

Rejected because the native release probe satisfied selection, cancellation, reselection, and size-boundary behavior without a plugin, path contract, dependency, or capability. Plugins remain a fallback only if a future demonstrated requirement cannot be met by the WebView boundary.

### Add repository-owned Rust commands

Rejected because they would create a new IPC/path/error/permission boundary and duplicate browser behavior that already works. A custom command requires separate evidence that official narrowly scoped capabilities cannot satisfy a future requirement.

### Stream the selected file incrementally

Deferred. The accepted EPUB opener currently requires one complete `Uint8Array`, and the 100-MiB absolute limit bounds the browser read. A streaming ingress would not remove the package's complete-input requirement without a separately planned public contract and ingestion redesign.
