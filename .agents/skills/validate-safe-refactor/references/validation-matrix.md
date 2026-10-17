# VoxLeaf refactor validation matrix

All acceptance commands run from the repository root in normal local
PowerShell outside the managed sandbox. Use commands exactly as defined by the
repository configuration. The [validation policy](validation-policy.md) owns
risk, gate timing, reuse, preparation and retry rules. Use its gate ledger to
select applicable checks before edits; this matrix is not a requirement to run
every language or model suite for every file.

## Always inspect

- `git status --short`
- the target diff and `git diff --check`
- an empty staged diff at unit start
- no pre-existing worktree change in any proposed allowlisted path
- changed paths against the approved allowlist
- test assertions against the work-order invariants
- prohibited books, audio, model weights, secrets, logs, private paths, and
  unrelated files

Git inspection is evidence review, not a substitute for tests.

At unit start, `git diff --cached --quiet` must exit zero and
`git status --short -- <exact allowlisted paths>` must produce no output. This
still permits unrelated unstaged user changes outside the closed allowlist.
Before and after the commands below, the validator records and rechecks HEAD
and path identities using the Validation Report contract. Its immutable Report
ID binds PASS to that exact state. Before staging, the Git executor verifies
that report against both the order and live files; identity drift returns
BLOCKED for revalidation, even if every prior command passed.
After a matching post-change `PASS`, the Git executor stages each exact path with
`git add -- <path>`. Before commit, inspect `git diff --cached --name-only`,
`git diff --cached`, and `git diff --cached --check`. A staged unrelated,
prohibited, or unreviewed path changes the verdict to `FAIL`. When a commit is authorized, return the index
to empty after the unit commit. Do not carry an unaccepted patch or staged
change into the next unit.

## Focused package commands

### `packages/shared`

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
```

When a contract generator or schema is legitimately changed, also run:

```powershell
pnpm.cmd --filter @voxleaf/shared generate:check
```

Generated TypeScript is never edited manually.

### `packages/epub`

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
```

Narration preparation, normalization, locator, archive, XML, or security work
must retain the specific invariants and corpus coverage documented by the
completed Milestone 5 plan.

### `apps/desktop`

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
```

Add the browser gate for rendered reader, Settings, highlighting, navigation,
focus, reflow, or playback-control changes:

```powershell
pnpm.cmd test:browser
```

Add the native startup gate for Tauri invocation, native-client lifecycle, or
packaged WebView2 behavior:

```powershell
pnpm.cmd test:native-startup
```

Use an existing exact-host TTS command only when the work order touches its
runtime path, scheduling, cancellation, buffering, playback, or profile
selection. Hardware absence is a blocker, not permission to replace that gate.

### Python: services/tts and maintainer tooling

Run the configured fast checks before any package/model preparation:

```powershell
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd test:python
```

The default Python suite is model-free. A documented focused pytest target may
narrow unit checks when its configuration and affected callers establish
coverage; retain the full Python suite for the combined affected package.
Pure corpus, report or deterministic maintainer helpers need their relevant
fixtures/CLI tests, not automatically a real-model benchmark. An extraction
from inference, transport, cancellation, profile selection, package integrity
or cleanup still needs that boundary's integration/runtime gates.

Use `pnpm.cmd build:python` when package/import layout or distribution changes.
For native release packaging, select the existing package/check commands from
package.json and testing.md for the exact payload version. Creating an archive
is preparation, not proof it installs, starts, cancels or restores host state.

### Rust: apps/desktop/src-tauri

```powershell
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
pnpm.cmd test:rust
```

The configured lint/test scripts cover default and release-locked-runtime
features. Preserve both variants and relevant platform-specific cases. A
documented cargo target/filter may narrow unit tests when it covers all affected
callers; do not use one filtered case as final crate acceptance.

Pure parsing/derivation helpers need deterministic cases. Process supervision,
Tauri invocation, runtime/package verification, containment, profile matching,
shutdown and cancellation require the corresponding native/integration gates.
Use existing synthetic/model-free diagnostics where they prove the invariant;
also run real-runtime/exact-host acceptance when the affected boundary requires
it. Do not substitute a browser test for packaged WebView2 or Windows behavior.

### Documentation and agent configuration

Select applicable Markdown link/consistency review, TOML/YAML parsing and skill
validation. Compare documented commands with current package/configuration
scripts. Include independent realistic workflow scenarios when changing
acceptance policy. Do not rebuild the application solely for contributor-policy
edits. Configurations consumed by application builds/tests follow their runtime
dependency rules rather than this documentation-only case.

## TypeScript-wide checks

For every accepted TypeScript batch, include:

```powershell
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
```

For a cross-package batch, use:

```powershell
pnpm.cmd typecheck:typescript
pnpm.cmd test:typescript
```

## Package and final gates

For a production package group, retain the applicable broader gate:

```powershell
pnpm.cmd check:portable
```

Before accepting the final production campaign or PR, retain the complete
applicable native gate:

```powershell
pnpm.cmd check
```

Use the canonical policy to schedule shared expensive gates and deduplicate
proven identical leaf commands. Record the full coverage mapping and exclusive
leaves; never claim an aggregate ran when only component commands ran. CI gates
remain unchanged. The director may narrow a baseline command when repository
configuration provides a smaller authoritative target. It may not invent a command, silently omit a
risk-triggered gate, or report an exploratory sandbox result as final evidence.
