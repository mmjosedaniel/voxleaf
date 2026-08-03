# VoxLeaf refactor validation matrix

All acceptance commands run from the repository root in normal local
PowerShell outside the managed sandbox. Use commands exactly as defined by the
repository configuration.

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
After a post-change `PASS`, the director stages each exact allowlisted path with
`git add -- <path>`. Before commit, inspect `git diff --cached --name-only`,
`git diff --cached`, and `git diff --cached --check`. A staged unrelated,
prohibited, or unreviewed path changes the verdict to `FAIL`. Return the index
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

After a coherent package group, run:

```powershell
pnpm.cmd check:portable
```

Before accepting the final campaign or PR, run the complete applicable native
gate:

```powershell
pnpm.cmd check
```

The director may narrow a baseline command when a repository script provides a
smaller authoritative target. It may not invent a command, silently omit a
risk-triggered gate, or report an exploratory sandbox result as final evidence.
