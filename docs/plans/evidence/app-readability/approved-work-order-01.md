# APPROVED WORK ORDER

Target ID: APP-READABILITY-01

Order ID: APP-READABILITY-01-WO-01

Goal: Separate resource-free shell presentation/message policy from App's
publication coordination without changing observable behavior.

Risk: medium

Allowed files:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx`
- `apps/desktop/src/AppPresentation.tsx` (new)

Required edits:

1. Create module-scope `OpenBookControl`, `PublicationHeading` and
   `RestorationNotice` in `AppPresentation.tsx`. Move `FAILURE_MESSAGE`,
   `statusMessage`, `readyStatusMessage` and `restorationNotice` beside their
   consumers as private helpers. Export components and necessary types only.
2. Use narrow readonly projections. Lifecycle presentation: status union with
   failure reason only on failure. Restoration: loading/ready, ready settlement,
   exact/recovered/book-start mode (reason only for book-start), preference
   status. No locator, publication handle, coordinator, repository or whole App
   state. Heading uses type-only `ReaderPublicationSummary`. Selection callback
   retains its typed event; dismissal callback has no arguments.
3. App constructs projections after existing publication/sequence filtering.
   Replace only corresponding helper/markup sites. Keep picker at its stable
   header position without a key; do not add DOM wrappers. Keep busy calculation,
   all state/effects/handlers and dismissal sequence ownership in App. The notice
   component can return null for dismissed/no-message cases at its original site.
4. Add App integration assertions using existing synthetic/injected seams:
   same picker node through deferred opening/ready/replacement/failure;
   synchronous value reset and empty-selection preservation; unavailable versus
   superseded settlement; unavailable book-start; unsupported/unavailable
   preferences and notice precedence; dismissal then later-publication notice;
   readable empty-author fallback. Control startup preference-read timing to
   exercise current behavior. Preserve all existing tests/assertions.

Behavior invariants:

1. Plan section 6 and the eight invariants in accepted
   [current audit](audit-and-draft.md) are binding in full.
2. Exact strings, classes, nesting/order, IDs, accessible names/descriptions,
   live region, hidden idle/ready status, enablement and focus.
3. Same input DOM node; synchronous reset and cancellation; unchanged selection
   cleanup/replacement order.
4. Same error boundary placement and publicationSequence key, reader/narration
   mounts and every public/injected prop, including omission of optional props.
5. Exact restoration/notice precedence and App-owned identity filtering/dismissal.
6. Settings visibility/ref/dialog/focus, title/authors fallback and metadata privacy.
7. Unchanged hooks/dependencies, resources, microtasks, StrictMode tokens,
   persistence/locator routing and cancellation/memory/local-only boundaries.

Forbidden changes:

1. Preference-handler deduplication or lifecycle extraction; retain both SKIPs.
2. Public contracts, tests' injection seams, dependencies/config, CSS, copy,
   parser/native/TTS/settings-actions, hooks/context/controller abstractions,
   generated sources, frozen authority, historical evidence, unrelated cleanup.
3. No source edits by director/auditor/validator. One worker only; no recursive
   delegation. Worker does not write plan/receipts or run tests while validation
   is active. No staging, commits, push, PR, merge, rebase or other Git mutation.

Diff ceiling: At most three implementation files and 650 added/deleted lines,
including full new file. Stop and return to director before exceeding scope or
ceiling; do not trade required coverage for line count.

Baseline evidence: [APP-READABILITY-01-BASELINE-01](baseline-01.md), PASS with
identity recheck PASS at HEAD `a1c2b467037e91c82aa0354d697704c967bfb5e6`.
The three exact baseline path identities in that immutable report bind this order.

Worker validation: none required; return patch for independent validation.
Read-only diff/identity inspection is permitted. Any necessary formatting must
be path-scoped and run outside sandbox; no broad formatting command.

Acceptance commands (root, local PowerShell outside sandbox):

1. `pnpm.cmd run build:packages`
2. `pnpm.cmd --filter @voxleaf/desktop test`
3. `pnpm.cmd run format:check:typescript`
4. `pnpm.cmd run lint:typescript`
5. `pnpm.cmd run typecheck:typescript`
6. `pnpm.cmd test:browser`
7. `pnpm.cmd test:native-startup`
8. `pnpm.cmd check:portable`
9. `pnpm.cmd check`

Completion output: Change Packet only; no commit or push. Independent validator
reviews frozen patch while worker is idle; max two correction cycles before
replanning. Later source changes require a new report and full revalidation.

Frozen by director after receiving baseline PASS on 2026-10-11.
