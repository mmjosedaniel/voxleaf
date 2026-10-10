# Change Packet

Target ID: DESKTOP-SEMANTIC-DOCUMENT-01

Files changed:
- `apps/desktop/src/reader/SemanticDocument.tsx`: +7/-199.
- `apps/desktop/src/reader/semantic-document-render-plan.ts`: new, +206.
- `apps/desktop/src/reader/SemanticDocument.test.tsx`: +89.

Combined diff: 501 lines (+302/-199), within the 700-line ceiling.

Symbols changed: the six plan types, MutableBlockIndex and five planning
functions named in the order were relocated. Added a private exhaustive
unreachable helper with the existing exact error. Added one nested-yield test.

Required edit mapping: existing declarations/algorithms moved into the internal
module; only builder/four required types exported; renderer imports replace
declarations; one quote/list 502-block DOM test observes ordered paragraph
counts 248/498/500, pending resumes and busy/status completion.

Invariants preserved: original algorithms, WeakMap identities, ranges, empty-item
fallback, grouping/freezing and errors retained. JSX, hooks, memoization, capacity,
scheduler, keys, text context, raster and locator/ref lifecycle unchanged.

Tests changed: one additive DOM regression; existing assertions retained.

Deviations: none. Director inspected complete tracked diff and new module;
only planned movement/imports and regression found. Source writer is idle.

Remaining validation: all eight commands from SEMANTIC-order-01.md, independent
host execution plus identity/scope/privacy review. Worker ran no tests/formatters.
Index empty and HEAD unchanged; no Git mutations.
