# ADR-0003: Persist stable EPUB reading locators

## Status

Accepted

## Context

VoxLeaf must behave as a visual ereader, reopen a book at the passage the user was reading, and keep the visible passage synchronized with narration.

An EPUB does not have durable screen page numbers. The visible page changes when the window, font, line spacing, theme, renderer, or device changes. Persisting a number such as "page 31" can therefore reopen at the wrong text.

The visual renderer, narration chunks, highlighting, and saved progress need a shared position that survives reflow without persisting book prose.

## Decision

Use a logical reading locator as the authoritative position. It must identify:

- The opened book without embedding book text.
- The spine item or equivalent ordered document.
- A precise content anchor, preferably an EPUB CFI when supported, or an equivalent stable element and intra-element offset.
- Optional progression data for recovery and progress display.

The renderer derives the current visible page from this locator and the active layout. User navigation updates the locator. Narration chunks carry source locator ranges so starting playback, highlighting, automatic page following, and saved progress refer to the same logical passage.

Persist the locator locally whenever reading progress is durably saved. Validate a restored locator against the currently opened EPUB. If the exact target no longer resolves, fall back to the nearest valid location and expose a recoverable state without logging book text.

## Consequences

- Reopening a book can restore the same passage even if pagination has changed.
- Font, spacing, and window changes do not redefine reading progress.
- Displayed page numbers remain useful UI information but are not stable identifiers.
- EPUB parsing and rendering must maintain a mapping between sanitized content, narration segments, and locators.
- Position serialization, migration, fallback, and synchronization require explicit contracts and tests.
- Saved state contains structural location data but not book prose.

## Alternatives considered

- Persist rendered page number: rejected because reflow changes the mapping.
- Persist only chapter and paragraph indexes: simple, but fragile when EPUB structure is irregular or content handling evolves.
- Persist a text quotation: useful for recovery but rejected as the primary representation because it stores book content and weakens the privacy boundary.
- Keep separate visual and narration positions: rejected because the reader could show a passage different from the one being narrated.
