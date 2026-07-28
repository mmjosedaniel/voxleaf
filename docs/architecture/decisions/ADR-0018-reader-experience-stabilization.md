# ADR-0018: Stabilize the reader-first narration experience

## Status

Accepted as M009.1 implementation authority. Milestones 1-2 freeze the
decision, strengthen paint-aware proof, repair active-range materialization,
and pass clean-host validation. Milestone 3 implements the fixed reader shell,
sole EPUB scroll root, compact/collapsible narration, and exact text-only
loaded status; clean-host packaged validation remains pending. Milestone 4
implements and validates the bounded paragraph leaf. Exact-host confirmation
and closeout remain for Milestones 5-6. Exact-host Milestone 5 validation
exposed and corrected passive-scroll narration retargeting; this ADR therefore
amends the passive-navigation portion of ADR-0017.

## Context

M009 implemented exact segment-level audible progress, CSS Custom Highlight
decoration, focus-safe following, synchronized navigation, and heard-position
persistence. Its synthetic Chromium and packaged-WebView2 checks passed. A
later manual local-publication run produced audible narration without a visible
active highlight.

Inspection showed that the old feasibility checks created and removed their
highlight synchronously. They proved registry and range acceptance but never
allowed a rendering frame, so they could not prove that the decoration became
perceivable. The same manual run also confirmed that application controls can
push the reader below the visible window, while narration detail and a growing
preparation bar occupy the primary surface.

Before changing product behavior, VoxLeaf needs result-blind authority for a
visible-highlight proof, scroll ownership, compact narration, truthful loaded
duration, and a bounded paragraph start control.

## Decision

The detailed authority is
[`../reader-experience-authority-v1.md`](../reader-experience-authority-v1.md)
and its executable state table is
`apps/desktop/src/reader/reader-experience-authority.ts`.

VoxLeaf distinguishes accepted highlight registration from visibly perceivable
highlight evidence. Perceivability additionally requires two rendering frames,
visible nonzero geometry, explicit foreground/background with at least `4.5:1`
contrast, and an underline. The proof must preserve focus, selection,
publication DOM, and URL and remain content-safe and offline.

A ready publication has one dedicated EPUB scroll viewport. Compact
application and narration controls remain outside it; nested reader scroll
owners are prohibited.

Narration detail defaults closed but may be expanded in every phase. Collapsing
is presentation-only. The compact surface retains applicable playback,
loaded-duration, warning, error, recovery, and expansion actions.

Loaded playable audio is presented as exact text with its active target. A
growing preparation `<progress>` element is prohibited because it can be
mistaken for playback or book progress.

Paragraph narration uses one retargeted contextual leaf control. It targets a
canonical block-start locator and keeps at most one preview, preparing,
audible, and checkpoint state. Ordinary paragraph clicks remain inert. Every
state has a non-colour cue, visible focus, and keyboard/touch parity.
The projected control defaults to the block at the active visual line.
Pointer hover over an eligible registered heading or paragraph temporarily
projects the same control beside that exact block and preserves it while the
pointer moves onto the leaf. It uses a retained preparing, audible, or
checkpoint treatment only when that state belongs to the projected block;
otherwise it presents the inspected block as an explicit selectable preview.

The existing M005 segmentation, M007 protocol, M008 thresholds and bounds,
explicit M009 identity-first invalidation, shared contracts, storage schema,
native capabilities, CSP, and dependency graph remain unchanged. Passive
viewport movement no longer invokes that invalidation: narration identity and
the exact highlight remain authoritative while the contextual leaf may
retarget as a visual-line or pointer-hover preview. Only an explicit leaf,
passage, or chapter action replaces narration.

## Consequences

- Future highlight tests cannot pass on registration alone.
- The manual observation and old synthetic pass are reconciled without using
  private EPUB content or claiming an unproven production root cause.
- Product implementation has one bounded state table and one scroll-owner
  target before layout results exist.
- Compact UI cannot hide failure, buffering, low-water, or required recovery.
- The paragraph leaf remains a location/action marker; it cannot imply word or
  whole-paragraph audible timing.
- A user may inspect another part of the chapter without cancelling or
  retargeting active narration.
- Production code still needs Milestones 5-6 before the stabilized
  user-visible outcome is complete.

## Alternatives considered

### Treat the old registry check as visible evidence

Rejected because registration can be removed before any rendering opportunity
and says nothing about visible geometry or contrast.

### Commit the private EPUB as a regression fixture

Rejected because it would expose copyrighted/private content. Repository-
authored synthetic structure is sufficient for the bounded proof.

### Make every paragraph a permanent leaf button

Rejected because long chapters would create visual clutter and an unbounded
number of keyboard tab stops.

### Use paragraph clicks as narration seeks

Rejected because selection and ordinary reading clicks could accidentally
replace active narration.

### Keep the outer application page as the reader scroll owner

Rejected because it allows branding and controls to displace the primary
reading surface and complicates focus-safe following.
