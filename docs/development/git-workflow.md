# Git workflow

## Branches

Create focused branches from `main`.

Suggested names:

```text
feat/epub-import
feat/local-tts-prototype
fix/stale-audio-after-seek
docs/performance-budget
chore/initialize-tooling
```

## Commits

Use concise imperative messages with an optional scope:

```text
feat(epub): extract spine documents
fix(audio): discard cancelled session frames
docs: record local protocol decision
test(reader): cover chapter navigation
```

## Pull requests

Open pull requests as drafts while implementation is incomplete.

Before requesting review:

- Review the complete diff.
- Run every relevant available check.
- Update tests.
- Update documentation.
- Record architectural decisions.
- Report performance effects when relevant.
- Confirm no books, audio, weights, secrets, or private paths were added.

## Codex Git steward

Systematic refactor campaigns prefer to delegate routine Git operations to
`git_steward`, a narrowly scoped `gpt-6.1-sol` agent with `medium` reasoning.
The Sol or Astra director remains the authority that decides what may be
staged, committed, pushed, or proposed for review. If the steward role cannot
be spawned, record the unavailability and have the director execute the same
Git Action Order directly; never silently substitute another role model.

The steward may inspect repository state without changing it. Every mutation
requires a director-issued Git Action Order. It stages literal allowlisted
paths, verifies the expected HEAD plus exact worktree and staged identities,
checks the complete staged diff, and reports the resulting commit or remote
action. It never edits source and never uses broad staging commands.

For an ACCEPTED-CHANGE order, the immutable POST-CHANGE Validation Report is
the authority for the allowed paths, HEAD, and file identities. The steward
retrieves that exact Report ID and compares the report, order, and current
files before staging, then rechecks worktree and staged content before commit.
A missing report or any mismatch returns BLOCKED for a new validation run and
report; recomputing hashes alone cannot renew approval. If drift is detected
after staging, preserve the index and stop without committing or discarding
user work. SETUP orders remain exempt from validation evidence.

The steward cannot independently reset, clean, restore, stash, rebase, merge,
cherry-pick, amend, force-push, delete branches or tags, or merge or close pull
requests. Push and pull-request creation additionally require explicit user
authorization in the current task. Authorization persists across turns within
the same task unless revoked or the requested scope changes. These boundaries
keep an execution agent from becoming the decision-maker for destructive or
external actions.
