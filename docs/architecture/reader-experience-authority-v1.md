# Reader experience stabilization authority v1

## Status

Frozen before M009.1 production implementation. Milestone 1 records the
result-blind interaction, layout, and proof rules below. Desktop, Chromium, and
packaged-WebView2 evidence pass against repository-authored synthetic content.
Milestones 2 through 6 remain responsible for changing and validating the
product UI.

## Purpose

This authority resolves an ambiguity exposed after M009: a browser may accept
a valid CSS Custom Highlight range without proving that a user had a rendering
opportunity to perceive it. It also freezes the reader-first shell and bounded
paragraph-leaf behavior before implementation results can influence those
choices.

The executable authority is
`apps/desktop/src/reader/reader-experience-authority.ts`.

## Highlight proof

“Range accepted” and “highlight visibly perceivable” are separate outcomes.

A range is accepted only when:

- the named registry contains the highlight;
- that highlight contains the exact range;
- the range remains connected; and
- the range is not collapsed.

Acceptance alone is not visible-highlight evidence. A perceivability proof
also requires:

- the same registration to survive at least two animation frames;
- nonzero client geometry within the reader viewport;
- explicit foreground and background decoration;
- at least `4.5:1` text contrast;
- an underline as a non-colour cue; and
- preserved focus, selection, publication DOM, and URL.

The proof cleans up the range afterward. It uses a repository-authored
synthetic EPUB, makes no external requests, and persists no publication text.
Forced-colour validation remains required when the production style is
implemented.

### Reproduced discrepancy boundary

The pre-M009.1 Chromium and packaged-WebView2 feasibility checks registered a
valid range, inspected the registry and stylesheet, and deleted the highlight
inside the same synchronous script. They therefore proved range acceptance but
provided no rendering opportunity and could not prove user-visible paint.

The stronger Chromium proof records acceptance before paint as true and
perceivability before paint as false. It then keeps the same highlight through
two animation frames and requires geometry, contrast, underline, focus,
selection, DOM, URL, storage-content, and zero-request evidence before
reporting it perceivable. The packaged-WebView2 proof uses the same distinction.

This bounded discrepancy explains why the old synthetic result and the later
manual observation were not logically contradictory. It does not yet establish
the production root cause for the private EPUB; Milestone 2 must trace and fix
the smallest reproduced production defect.

## Reader-experience state table

Narration detail may be closed or open in every phase. For a ready publication
it defaults closed, and collapsing is presentation-only.

| Phase | Default detail | Retained leaf states | Highlight |
| --- | --- | --- | --- |
| inactive | closed | preview, checkpoint | absent |
| preparing | closed | preview, preparing, checkpoint | absent |
| playing | closed | preview, audible, checkpoint | exact active segment |
| paused | closed | preview, checkpoint | retain latest heard segment |
| buffering | closed | preview, checkpoint | retain latest heard segment |
| failed | closed | preview, checkpoint | absent |

The compact surface remains available when detail is closed. As appropriate to
the phase, it exposes play/pause, stop, current phase, loaded playable duration,
buffering or low-water warning, active error and required recovery, and the
detail expansion action.

## One reader scroll owner

When a publication is ready, one dedicated reader viewport owns continuous
EPUB scrolling. Compact publication and narration controls remain outside that
viewport. Nested reader scroll owners are prohibited.

Empty, opening, loading, and error views may use the normal application page.
Stable locators, the 24-pixel reading line, follow sampling suppression, focus,
selection, reflow, restoration, incremental rendering, chapter navigation, and
cleanup remain governed by existing authorities. While narration owns
position, ordinary viewport movement is an independent inspection and only an
explicit leaf, passage, or chapter action may replace narration.

## Text-only loaded duration

Loaded audio uses text such as:

> Playable audio loaded: 12 seconds. Starts at 15 seconds.

The preparation `<progress>` element is prohibited. Loaded audio is neither
book progress nor current playback position. Target, estimate, low-water,
buffering, and complete-shorter-range information remain truthful and
available.

## Bounded paragraph leaf

The selected presentation is one retargeted contextual application-owned
control, not one permanent keyboard tab stop per paragraph. It targets a
canonical addressable block-start locator. Ordinary paragraph activation
remains inert.

At most one state of each kind may be retained:

| State | Visual treatment | Required non-colour cue |
| --- | --- | --- |
| preview | translucent | accessible action name |
| preparing | distinct pending treatment | preparing label/state |
| audible | solid | `aria-current` or equivalent |
| checkpoint | outlined, non-solid | checkpoint label |

Focus remains independently visible, and keyboard, pointer, and touch users
receive the same action. Leaf activation explicitly replaces obsolete work and
starts at the canonical target through the existing M009 invalidation order.
The leaf supplements, but never replaces, the exact segment highlight.

## Preserved boundaries

This authority requires no change to:

- M005 normalization, segmentation, source ranges, or prepared-text limits;
- M007 protocol, Python service, Rust supervision, or process topology;
- M008 thresholds, queue/buffer limits, or playback rate;
- shared schemas or public contracts;
- persisted reader-state schema or migrations;
- native capabilities or CSP; or
- production or development dependencies.

Any proof that later requires one of those changes must amend this authority
before implementation.
