# Audit Packet

Report ID: MOD-A-AUDIT-01
Target ID: MOD-A
Decision: CHANGE
Risk: medium
Primary target: `apps/desktop/src/App.tsx`: `handleHardwareProfileSelection`,
`handleChatterboxRemoval`, `handleChatterboxActivation`,
`handleNarrationLanguageSelection`, `handleNarrationSettingsReset`.
Related context: existing App reset-order integration test; ReaderSettingsDialog;
hardware compatibility, product narration and optional Chatterbox clients;
narration-start/playback preference repositories. All collaborators are read-only.
Auditor: configured `clean_code_auditor` (GPT-6.1 Sol high), read-only; no tests.
Observed HEAD: `c140d0f2971cd6498fff2728dfa009acd01126f1`; initially clean index/worktree.

## Concrete evidence

- App repeats the exact nullish configuration-stop expression in four handlers
  (original lines 779, 796, 807, 820).
- App mixes compatibility, containment, preference resets, presentation and
  refresh orchestration (original lines 767-859), despite separate resource owners.
- App.test.tsx's reset-order assertion requires a publication, open flow,
  compatibility snapshot, narration stand-in, settled reader and Settings mount.
  A direct stateless boundary permits focused deferred/rejection tests while
  keeping this integration assertion.
- OptionalChatterboxClient converts native failures to fulfilled failed snapshots.
  Removal currently refreshes after any fulfilled result, regardless of state.
- No runtime defect or performance improvement is claimed.

## Behavior invariants

1. Keep parameters, Promise results, method receivers, arguments and rejection
   propagation; retain each handler's React dependencies and captured lifetime.
2. Preserve `coordinator?.stopForConfigurationChange?.() ?? coordinator?.stop()`
   exactly. Await it before mutation; rejection prevents subsequent calls.
3. Packaged Chatterbox selection calls optional select first; noninstalled returns
   false before stop/profile mutation. Keep DEV bypass and ordinary-profile bypass.
4. Refresh only after true profile/language selection. Activation delegates to the
   same Chatterbox profile action; recovery reset stays with its current owner.
5. Removal is stop, remove, refresh after ANY fulfilled snapshot; rejection stops it.
6. Reset is stop, language, start, playback, successful-start presentation,
   language-success refresh, then boolean conjunction. False does not short-circuit
   later resets. Rejections stop subsequent work. Playback rejection prevents the
   presentation update; refresh rejection follows that update.
7. Absent coordinator uses existing start/playback repositories and only saved
   means success. A successful start reset notifies even if another reset is false.
8. App retains Quick/ready/canPersist presentation, resources, subscriptions,
   cleanup and unrelated reader callbacks. Keep all dialog/public/persistence
   contracts, defaults, privacy, cancellation, resource and locator invariants.

Allowed files:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx`
- `apps/desktop/src/settings/narration-settings-actions.ts` (new)
- `apps/desktop/src/settings/narration-settings-actions.test.ts` (new)

Proposed edits: one specifically named stateless `createNarrationSettingsActions`
factory with narrow typed collaborators, explicit DEV value and narrow successful
startup-reset presentation notification; extract five actions and consolidate only
the stop expression; retain each App binding's dependencies/lifetime. Keep existing
App integration test unchanged. Add direct deferred/rejection tests for all above
branches, using clear shared fixtures/parameterized cases.

Forbidden edits: outside allowlist; public/serialized contracts, dependencies,
defaults, errors, admission policy, native commands, coordinator state machine,
resource ownership, retry/failover/concurrency policy, general frameworks/hooks,
unrelated formatting, weakened tests, generated/frozen/historical authority.

Diff ceiling: four files, at most 550 total added/deleted lines, re-audited before
baseline. Estimated 100 removed handler lines, 120-150 action/type lines, 30-50 App
binding lines, 200-250 direct-test lines. Exceeding this requires re-audit.

Baseline commands (repository root, local PowerShell outside sandbox):

1. `pnpm.cmd build:packages`
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`
3. `pnpm.cmd --filter @voxleaf/desktop test`
4. `pnpm.cmd format:check:typescript`
5. `pnpm.cmd lint:typescript`

Post-change commands: same five, `pnpm.cmd test:browser`,
`pnpm.cmd test:tts:bilingual-portfolio-exact-host`, `git diff --check`;
native-startup unless coverage is explicitly subsumed; package `pnpm.cmd
check:portable`; final `pnpm.cmd check`.

Documentation impact: active ExecPlan and separate immutable evidence; diagram
review at closeout, no intended architecture change.
Decision required: none; director accepts the revised ceiling before freezing
the work order, and validator maps native coverage first.
