# VoxLeaf initial scaffold

> **Historical record:** This manifest describes the original documentation-only bootstrap package. It is not a current repository inventory or setup guide; use [`README.md`](README.md) and [`docs/README.md`](docs/README.md) for current documentation.

Extract this package over the root of `mmjosedaniel/voxleaf`.

The existing `LICENSE` file is intentionally not included or replaced.

## Included files

- `.agents/PLANS.md`
- `.agents/skills/implement-feature/SKILL.md`
- `.agents/skills/investigate-bug/SKILL.md`
- `.editorconfig`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/pull_request_template.md`
- `.gitignore`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `docs/README.md`
- `docs/architecture/decisions/ADR-0001-local-first-desktop.md`
- `docs/architecture/decisions/ADR-0002-in-memory-audio.md`
- `docs/architecture/decisions/ADR-0003-stable-reading-locators.md`
- `docs/architecture/decisions/ADR-0004-start-after-audio-lead.md`
- `docs/architecture/decisions/README.md`
- `docs/architecture/overview.md`
- `docs/architecture/performance-budget.md`
- `docs/development/git-workflow.md`
- `docs/development/setup.md`
- `docs/development/testing.md`
- `docs/plans/active/README.md`
- `docs/plans/active/synchronized-reader-and-startup-buffer.md`
- `docs/plans/completed/README.md`
- `docs/plans/roadmap.md`
- `docs/product/glossary.md`
- `docs/product/mvp.md`
- `docs/product/project-brief.md`
- `docs/product/vision.md`

## Suggested commit

```bash
git checkout -b agent/initial-project-foundation
git add AGENTS.md README.md .editorconfig .gitignore CONTRIBUTING.md SECURITY.md docs .agents .github
git commit -m "docs: establish initial project foundation"
git push -u origin agent/initial-project-foundation
```
