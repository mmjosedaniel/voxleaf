# Contributing to VoxLeaf

VoxLeaf is a pre-alpha portfolio project. The [system architecture diagram](docs/architecture/system-diagram.md) and [roadmap](docs/plans/roadmap.md) record current implementation status and approved next work. Contributions should remain small, reviewable, and aligned with the local-first privacy constraints.

## Before starting

1. Read `AGENTS.md`.
2. Read `docs/README.md`.
3. Check the relevant product and architecture documents.
4. Search existing issues and plans before creating overlapping work.
5. Create an ExecPlan for changes that affect multiple components or introduce a TTS model.

## Change expectations

- Keep changes focused.
- Add or update tests for behavior changes.
- Do not commit books, generated audio, model weights, secrets, or logs containing book text.
- Do not add dependencies without explaining their purpose and alternatives.
- Update documentation when behavior, setup, architecture, or public contracts change.
- Use synthetic or public-domain text in fixtures.

## Commit style

Use concise imperative commit messages, for example:

```text
docs: define MVP performance budget
feat(epub): extract ordered chapter text
fix(audio): cancel stale playback session
test(tts): cover queue underrun recovery
```

## Pull requests

A pull request should explain:

- What changed.
- Why the change is needed.
- How it was validated.
- Privacy or performance implications.
- Remaining risks, assumptions, or follow-up work.

Use the repository pull request template.
