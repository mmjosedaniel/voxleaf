# Audit Packet

Target ID: APP-READABILITY-01

Decision: CHANGE

Risk: medium

Primary target: `apps/desktop/src/App.tsx`: `FAILURE_MESSAGE`, `statusMessage`,
`readyStatusMessage`, `restorationNotice`, `openBookControl`, publication
heading and restoration notice JSX.

Related context: `App.test.tsx`, reader lifecycle/summary, restore/save
coordinators, reader settlement, error boundary, persistence bridge, preference
types, StrictMode cleanup, Settings/actions and their tests, foundation and
reflow/restoration browser suites. Auditor: `clean_code_auditor`, GPT-6.1 Sol
high, no delegation, source edits, tests or Git mutation.

Concrete evidence: At HEAD `a1c2b467037e91c82aa0354d697704c967bfb5e6`,
`statusMessage` accepts resource-bearing lifecycle state but uses only status
and failure reason. Both restoration message helpers similarly consume only
status, settlement, position mode/book-start reason and preference status.
Their distant display-only consumers create neither resources nor subscriptions.
A narrow presentation boundary clarifies these actual dependencies.

Existing App tests cover successful reset, cancellation, pending/recovered
restoration and dismissal for one publication, but omit input node identity,
synchronous reset before opening, unavailable/superseded settlement,
unavailable book-start, unsupported/unavailable preference notice precedence,
later-publication notice after dismissal, and readable empty-author fallback.
Startup preference hydration calls `setPreferences`, which caches ready status;
preference-failure tests must control the startup read while the coordinator
reads the failure through the existing injected repository. Do not change
production coordination to simplify the fixture.

Behavior invariants:

1. Same mounted file input at the same header position through idle, opening,
   ready, replacement and failure. Preserve synchronous value reset,
   empty-selection early return and the exact selection/cleanup sequence.
2. Exact strings, classes, DOM nesting/order, IDs, accept, accessible names,
   descriptions, status/live region, hidden routine status and enablement.
3. Restoration status precedence: absent/loading/pending, unavailable,
   superseded, exact, recovered, then book-start missing/unavailable/other.
4. Notice precedence: unavailable settlement; no other non-settled notice;
   recovered; nonmissing book-start; preference failure; otherwise none.
5. App retains dismissal sequence and callback capture; later publications
   must not inherit dismissal.
6. Error boundary position/key, preparing branch, reader/narration mounts,
   every injected reader prop and optional-prop omission remain intact.
7. Metadata fallback/joining, Settings/ref/focus and private-path suppression
   remain intact.
8. No domain, persistence, cancellation, memory, privacy, synchronization or
   public-contract change. All plan section 6 constraints remain binding.

Allowed files:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx`
- `apps/desktop/src/AppPresentation.tsx` (new; initially ABSENT)

Proposed edits: Module-scope `OpenBookControl`, `PublicationHeading` and
`RestorationNotice`; four message symbols private. Export only components and
necessary types. Readonly lifecycle projection contains status and a reason
only for failure. Readonly restoration projection contains loading/ready,
settlement, position mode (book-start reason only) and preference status.
Heading accepts type-only `ReaderPublicationSummary`. No locator, publication,
preferences object, repository or coordinator crosses this boundary. App builds
projections after its existing identity filtering. Preserve existing selection
handler and zero-argument sequence-scoped dismissal callback. Replace only
corresponding JSX/helper sites; notice may return null at its original position.
Add observable App tests for the gaps above using existing injection seams.

Forbidden edits: Public App/reader props, hooks/effect dependencies, lifecycle,
StrictMode/microtask ordering, restoration/locator/persistence behavior,
Settings/actions, parser/native/TTS, CSS/DOM/copy redesign, dependencies,
configuration, generated sources, frozen/historical authority or unrelated code.
No Git mutation.

Diff ceiling: Three implementation paths, at most 650 added/deleted lines.
Stop before exceeding it; do not omit required coverage to fit.

Baseline commands (root, local PowerShell outside sandbox):

1. `pnpm.cmd run build:packages`
2. `pnpm.cmd --filter @voxleaf/desktop test`
3. `pnpm.cmd run format:check:typescript`
4. `pnpm.cmd run lint:typescript`
5. `pnpm.cmd run typecheck:typescript`
6. `pnpm.cmd test:browser`
7. `pnpm.cmd test:native-startup`

Post-change commands: all seven above, then `pnpm.cmd check:portable` and
`pnpm.cmd check`. No model benchmark is implicated by this bounded extraction.

Documentation impact: director updates active plan and Markdown receipts,
reviews diagram consistency; archival/index changes only after all acceptance.

Decision required: none; independent baseline PASS required before work order.

## Director acceptance and draft work-order terms

Accepted current audit on 2026-10-11. The allowlist, operations, invariant list,
forbidden changes, 650-line ceiling and commands above are the draft terms.
They are not worker authorization until a baseline report returns PASS.

Retained SKIPs: both preference handlers have distinct validation/persistence
policies; lifecycle/restoration/save/replacement/locator ownership stays in App;
no test relocation, generic messages utility, hooks, controllers or context.
Other repository inventory paths are excluded from this single-unit request.

Readiness inspection confirmed Node 24.20.0, Cargo 1.97.1 and uv 0.11.29.
The validator will prepend the existing Corepack shim directory per process
for pinned pnpm 11.15.1 and use the verified existing EdgeDriver
155.0.4283.45 matching installed WebView2. Inherited pnpm/driver selections
are unsuitable. No repository configuration change is required.

The initial audit observed clean source/index and absent new module. Subsequent
director plan/receipt changes are separate coordination work, not source drift.
