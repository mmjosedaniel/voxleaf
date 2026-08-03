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
`git_steward`, a narrowly scoped `gpt-5.6-luna` Max agent. Luna is suitable for
this role because the operations are explicit, repeatable, and easy to verify.
Sol remains the authority that decides what may be staged, committed, pushed,
or proposed for review. Some Codex surfaces or accounts may not expose Luna to
subagents. In that case, record the unavailability and have Sol execute the
same Git Action Order directly; never silently substitute another model.

The steward may inspect repository state without changing it. Every mutation
requires a director-issued Git Action Order. It stages literal allowlisted
paths, verifies the expected HEAD plus exact worktree and staged identities,
checks the complete staged diff, and reports the resulting commit or remote
action. It never edits source and never uses broad staging commands.

The steward cannot independently reset, clean, restore, stash, rebase, merge,
cherry-pick, amend, force-push, delete branches or tags, or merge or close pull
requests. Push and pull-request creation additionally require explicit user
authorization in the current task. These boundaries keep a low-cost execution
agent from becoming the decision-maker for destructive or external actions.
