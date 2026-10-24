# ADR-0060: Select the first addressable primary publication start

## Status

Accepted for implementation on 2026-10-21; implemented and validated on
2026-10-22. Acceptance evidence is in the
[completed correction plan](../../plans/completed/confirmed-logic-bugfixes.md).

## Decision

Add an immutable `defaultStartLocator: ReadingLocatorV1 | undefined` to the
package-owned `OpenedPublication` API. Derive it from parsed spine linearity
and the existing complete locator index: the first addressable block of the
first linear spine item with addressable content. Omitted `linear` remains
primary. Empty primary items do not override the next addressable primary item.

When no primary content is addressable the value is undefined; the desktop
uses its existing content-free unreadable-publication outcome. Do not silently
substitute auxiliary content. Package admission still rejects no-linear spines.

Fresh reader initialization, missing/invalid saved-state fallback and genuine
`book-start` locator recovery share this authority. Exact saved auxiliary
positions, explicit auxiliary links, nearest-anchor/offset/spine recovery and
later traversal keep their existing semantics. Every spine and locator remains
in the same order with the same identity. No serialized BookV1, locator,
persisted-state or narration schema changes; no normalization change.

## Alternatives and consequences

Filtering or reordering non-linear items would break navigation and saved
positions. Teaching the UI about package XML would duplicate ingestion policy.
One package-owned result avoids both and keeps initial narration and saving
aligned with the reader. No full EPUB conformance claim is added.
