# ADR-0010: Preflight and lifecycle-bound raster image decoding

## Status

Accepted.

## Context

ADR-0007 permits an opened publication to expose caller-owned bytes for local GIF, JPEG, PNG, and WebP resources only after archive, declared media type, signature, locality, and a 32 MiB per-resource byte limit agree. That boundary deliberately does not decode images. A signature-valid compressed image can still declare extreme dimensions or animation and cause the WebView to allocate substantially more memory than the source bytes imply.

ADR-0008 therefore keeps semantic raster nodes as placeholders until Milestone 4 establishes predecode metadata limits, browser-decode behavior, concurrency, object-URL ownership, CSP, cancellation, and failure handling. Post-decode dimension checks alone are insufficient because the unsafe allocation may already have occurred.

## Decision

The desktop application owns a narrow predecode parser and a lifecycle-bound browser source manager. `@voxleaf/epub` remains responsible for archive/resource validation and caller-owned byte reads; it does not gain DOM, Blob, URL, image-decoder, React, or browser dependencies.

### Apply immutable limits before browser decode

The desktop accepts only candidates whose declared structure can be parsed consistently with the resource's already validated media type and whose complete metadata satisfies every limit below:

| Limit | Maximum |
| --- | ---: |
| Encoded local resource bytes | 32 MiB, retained from ADR-0007 |
| Source width | 8,192 pixels |
| Source height | 8,192 pixels |
| Width × height | 16,777,216 decoded pixels |
| Frames | 1 static frame |
| Concurrent browser decodes per manager | 1 |
| Live object-URL sources per manager | 8 |
| Aggregate live decoded pixels per manager | 16,777,216 |

The GIF parser counts image descriptors and validates frame rectangles against the logical screen. The PNG parser reads `IHDR` and detects APNG `acTL`. The JPEG parser reads an accepted start-of-frame segment. The WebP parser validates the RIFF chunk structure, reads VP8/VP8L/VP8X dimensions, and detects animation chunks and flags. Malformed or truncated metadata structure, zero-sized dimensions, media-type mismatch, oversize declarations, and animation are rejected before Blob or object-URL creation. Payload corruption outside the narrow metadata structure remains the browser decoder's responsibility and produces the same fixed local image failure with URL revocation.

Animation is unsupported in the initial reader. A one-frame static GIF is permitted; multi-frame GIF, APNG, and animated WebP candidates use the same accessible image placeholder as any other rejected image. The reader does not silently display only the first frame of an animated publication resource.

Production limits cannot be increased at runtime. Deterministic tests may construct equal-or-stricter frozen policies to exercise exact and maximum-plus-one boundaries without allocating production-sized fixtures.

### Decode only an application-created local source

After preflight succeeds, the desktop copies the bounded bytes into an application-created `Blob`, creates a `blob:` object URL, and invokes `HTMLImageElement.decode()`. The observed natural dimensions must exactly match the preflight metadata before a source handle becomes ready. A mismatch or decode failure rejects that candidate and revokes its URL.

The Tauri CSP adds only `img-src 'self' blob:`. It adds no HTTP or HTTPS image origin, script source, connection destination, native command, plugin, filesystem capability, or remote-resource path. Publisher values never become object URLs; the application creates every source from bytes returned by the opened publication.

### Bind every URL to an explicit owner

One `RasterImageSourceManager` owns active decode controllers, ready source handles, live-source count, and aggregate live pixels for its reader lifetime.

- It starts no queue: an operation above the one-decode limit receives a fixed `decode-busy` result.
- Capacity is checked before URL creation and again after decode.
- A successful handle remains valid only until its idempotent `release()` is called or the manager closes.
- Release removes the source from both live budgets and revokes its object URL exactly once.
- Close becomes observable immediately, aborts active decode work, releases every ready source, waits for active work to settle, and is idempotent.
- Task 3.3 must release a handle on image unmount, chapter replacement, publication replacement, and reader close. It must not create an independent URL cache.

The source manager returns only frozen closed results: ready, cancelled, or rejected with a fixed reason. It does not expose browser exceptions, parser details, paths, filenames, source bytes, publication text, or cancellation reasons. It performs no fetch, persistence, logging, worker construction, native call, or metric containing publication data.

### Failure remains local to the image

Preflight rejection, capacity pressure, cancellation, browser failure, and postdecode mismatch all produce the application-owned accessible placeholder required by ADR-0008. A raster failure does not fail the chapter or publication. Alternative text comes only from the safe semantic image node; when absent, presentation uses fixed application text and never a resource identity or path.

Task 1.3 establishes the reusable policy and prototype boundary. It does not render publication images in the application. Task 3.3 owns semantic-image component integration, lazy resource reads, alternative-text presentation, stale-session checks, and release on component/session lifecycle events.

### Evidence

Synthetic deterministic tests cover GIF, JPEG, PNG/APNG, and WebP metadata; exact and maximum-plus-one dimensions, decoded pixels, frame count, concurrent decode, live source, and aggregate-pixel capacity; malformed and media-type-mismatched input; postdecode mismatch; fixed-error redaction; cancellation; idempotent release/close; URL revocation; and absence of network calls.

The native Windows release shell decoded and released the fixed repository-authored 68-byte static PNG twice through WebView2 under the committed CSP and displayed only the fixed available status. The application retained zero Tauri commands, plugins, and capabilities. The temporary window capture and one-off automation harness were removed after validation.

The accepted implementation adds no production dependency, package/lockfile change, EPUB public contract, Tauri command/plugin/capability, persistence, or renderer integration. Native release validation must continue to exercise Blob URL decoding under the committed CSP after material Tauri/WebView2 or image-boundary changes.

## Consequences

- Browser decode never begins from dimensions or animation that have not passed an application-owned bound.
- The 16,777,216-pixel single/live ceiling bounds a nominal four-byte RGBA surface to approximately 64 MiB before browser-specific overhead; encoded input and transient copies remain separately bounded by ADR-0007.
- Static raster fidelity is narrower than EPUB/browser capability because all animation is replaced with a placeholder.
- Object URLs are allowed only for local images and must remain manager-owned. The CSP change is narrow but security-relevant and must be reviewed with future source-scheme changes.
- The metadata implementation is additional security-sensitive format code. New raster formats or animation support require a new decision, adversarial fixtures, exact limits, and native evidence.
- A caller that does not release a source cannot grow retention without bound: source count and aggregate decoded-pixel limits stop additional preparation. Correct lifecycle release remains required for usable chapter navigation.
- Task 1.6 still owns measured reader-wide latency and memory acceptance. These safety ceilings are hard guards, not performance claims.

## Alternatives considered

### Keep alternative-text placeholders for every raster image

Retained as the per-image failure fallback but rejected as the only Milestone 4 behavior. The narrow parser and bounded manager can reject unsafe candidates before decode without adding a dependency or native capability, allowing supported static local images to satisfy the approved MVP direction.

### Decode first and inspect natural dimensions afterward

Rejected. The browser may allocate the attacker-controlled decoded surface or animation state before the application can inspect it.

### Add a third-party image metadata or decoder dependency

Rejected for the initial boundary. The four accepted formats need only narrow bounded metadata inspection, and a dependency would add parser supply-chain, bundle, update, and capability review without removing browser decode. Reconsider only if format correctness or maintenance evidence demonstrates that the repository-owned parser is insufficient.

### Decode or transform images in Rust

Rejected. It would add native commands, a binary decoder surface, IPC copies, platform packaging, and capabilities while duplicating a WebView facility that remains safe behind the accepted preflight and lifecycle limits.

### Use `data:` URLs

Rejected. They create larger copied strings, broaden CSP to another source scheme, and lack the explicit revocation lifecycle provided by object URLs.
