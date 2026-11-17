# PR #325 unsafe lock correction closeout

[PR325-CI-CR-R04-20261116](ci-review-r04.md) issued **APPROVE** for the
six-path candidate on `8edc35e12a8cbbb54574338f3ba92f7fb577cf23`.
The authentic report was persisted unchanged with SHA-256
`80e5c5267f7b2b09e2c73fb333b616397fa557b51b2dd86be37846b6458a4fab`.

After persistence, normal local PowerShell outside the sandbox ran
`pnpm.cmd check:evidence`, `git diff --check` and
`python tmp/evidence/pr325-ci/freeze-r04.py verify r04`, all exit 0.
The 1,878 frozen identities, candidate membership, patch, HEAD and empty index
matched. Only the reserved report existed beyond the candidate; this is the
second reserved terminal output. The [owner follow-up](ci-lock-preflight-follow-up.md)
and report remain the scope and evidence authorities.

No acceptance is extended here. Both native link variants must still execute
successfully without skips on replacement Windows CI, and all configured PR
jobs must pass before the CI task is complete.
