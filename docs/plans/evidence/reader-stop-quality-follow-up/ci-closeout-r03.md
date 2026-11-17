# PR #325 link assertion correction closeout

[PR325-CI-CR-R03-20261116](ci-review-r03.md) issued **APPROVE** for the
four-path test/documentation candidate on
`7ae2c940faae245a632ca26329ec0e39fef44244`. The authentic report was saved
unchanged with SHA-256
`41c0632782211422e76d65d95f23c1f2736f44ab09fe07c16214bed491b5113e`.

After report persistence, normal local PowerShell outside the sandbox ran
`pnpm.cmd check:evidence`, `git diff --check` and
`python tmp/evidence/pr325-ci/freeze-r03.py verify r03`, all exit 0.
The 1,873 frozen identities, candidate paths, patch, HEAD and empty index
matched. Only the reserved report existed beyond the candidate; this is the
other reserved terminal output. The [follow-up](ci-symlink-follow-up.md) and
report retain their distinct local and remote evidence boundaries.

This record adds no acceptance. Both native symlink variants still require
successful execution without skips on replacement Windows CI; all PR jobs must
also pass before the CI task is complete.
