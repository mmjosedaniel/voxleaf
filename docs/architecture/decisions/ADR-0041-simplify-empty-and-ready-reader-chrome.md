# ADR-0041: Simplify empty and ready reader chrome

## Status

Accepted on 2026-07-31.

## Context

The M010.2 reader-first shell retained too much development and lifecycle
detail in its fixed application bar. With no publication open, a localized
native file input, compatibility summary, Settings action, and manual raster
probe competed with the primary action and could overflow the bounded card.
With a publication open, Open/Replace wording, the native selected-file text,
routine lifecycle status, and an explicit Close EPUB action crowded the same
row.

The manual raster probe was not the authority for EPUB image safety. Packaged
native startup already opens a repository-authored synthetic EPUB, decodes a
real bounded raster through the production path, requires a local object URL,
and verifies release. Deterministic raster policy, source-manager, loader, and
semantic-image suites own the exact limits and failure cases.

## Decision

Use one stable, custom-styled **Open a book** file action in both empty and
ready states. Its native file input remains the capability-free operating-
system picker but is visually transparent inside the labelled action, so host
locale filename text does not become application chrome. Keep the same input
mounted across open and ready transitions to preserve keyboard focus.

When no readable publication is ready, show only compact VoxLeaf identity,
the Open a book action, privacy-oriented introductory copy, and any actionable
opening or failure status. Do not show Settings or compatibility summaries.

When a publication is ready, show compact VoxLeaf identity, Open a book, and
Settings. Remove Replace EPUB and Close EPUB from the product surface. A new
selection still performs identity-first replacement and bounded cleanup;
application exit still closes all owned publication, narration, object-URL,
and persistence resources. Routine ready/idle messages remain available to
assistive technology but do not occupy the visual bar.

Remove the manual synthetic raster-probe UI and its isolated application
adapter. Retain the production raster implementation and its deterministic,
Chromium, and packaged WebView2 validation.

This decision refines only the shell-presentation subset of the frozen
reader-settings authority. It does not alter EPUB ingestion, stable locators,
reader state, narration, compatibility decisions, buffering, playback,
persistence, privacy, or process boundaries.

## Consequences

- The empty and ready bars remain bounded at narrow and wide sizes.
- Users see one consistent book-opening verb and no host-localized selected-
  filename placeholder.
- Settings cannot be opened without a ready publication.
- Closing the window or opening another book replaces the removed explicit
  Close EPUB workflow without weakening cleanup ownership.
- Raster safety continues to be validated through the real publication path,
  without exposing a development probe in the portfolio interface.

## Alternatives considered

- **Keep the native file input visible.** Rejected because its label, selected-
  file placeholder, and intrinsic width vary with the operating-system locale
  and caused the reported overflow.
- **Keep Settings and compatibility visible when empty.** Rejected because
  those controls are meaningful only in the reading workflow and displaced
  the primary action.
- **Keep Close EPUB.** Rejected because book replacement and application exit
  already own cleanup, while the extra action crowded the ready bar.
- **Move the raster probe behind another development toggle.** Rejected
  because the packaged production-path proof is stronger and the isolated UI
  adapter had no remaining product or validation responsibility.
