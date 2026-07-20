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
