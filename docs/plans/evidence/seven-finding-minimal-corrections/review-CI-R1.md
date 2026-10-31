# Change Review Report

Review ID: **R7-CI-R1-20261031**

Task ID: historical v6 CI correction — PR #289

Verdict: **APPROVE**

Base commit and reviewed HEAD: `68d8667e7421732bba5a8d6b16c621760f49c7fb`

Reviewer: independent `change_reviewer`, GPT-6 Astra high; read only, no tests.

## Reviewed identities

Closed [36-path manifest and original receipt digests](review-CI-R1-identities.md),
including eight modified/new paths. Originals remain under ignored
`tmp/evidence/seven-finding-minimal-corrections/`:

- `R7-CI-R1-20261031-manifest.json`: SHA-256 `47434549453f1e7345e4274d114eb54069d443df699aae65785ae499a4f61d8e`.
- `R7-CI-R1-20261031-patch.txt`: SHA-256 `09f0b0cf0c17a0a6842a2faa5e49c2de4bdabd521f00d5610fd675d23c797972`.
- `R7-CI-R1-20261031-receipts.json`: SHA-256 `1bb5d1b3adcfe607718d55d02b6543b1c06f1ffa5a4077cc56e69469959ac9a4`.

**Identity recheck: PASS.** All 36 SHA-256/blob identities, HEAD, branch,
changed-path membership and empty index matched before and after review.
This report and its identity transcription are outside their own manifest.

## Acceptance review

The fixture legitimately supplies historical data to the real loader, which
retains the profile check and all ten authority checks. The archived normalizer
matches authority commit `9a2f74845853e84635b419a4e65170c9a2c207ee`:
41,860 bytes, SHA-256 `8bee1b480a81a96b105df32cf85eaf65f6e42bae382e152e89adbaa02353db74`,
Git blob `278557be4d74f9a303933b5ae5d9f940b2d7bfb2`.

Existing configuration, adapter, audio-chunking, session-preservation and
classification-correction assertions remain intact. Three new controls require
rejection of current, tampered and missing normalizer bytes. The fixture is
never executed and needs no Git, network or model at test runtime. Existing LF
policy preserves its bytes across platforms.

Production, frozen hashes and historical results remain unchanged. The correction
does not admit the current normalizer to historical v6 evaluation.

## Evidence reviewed

Original host PowerShell receipts establish:

- CI01-before: exact focused pytest command in the [follow-up](ci-follow-up.md),
  exit 1, five failures and 37 passes.
- CI02-focused: same command after correction, exit 0, 45 passes.
- CI03-static: `pnpm.cmd format:check:python && pnpm.cmd lint:python && pnpm.cmd typecheck:python`,
  exit 0, 186 files formatted, clean lint, 182 files type-checked.
- CI04-python: `pnpm.cmd test:python`, exit 0, 825 passes.
- CI05-docs: `pnpm.cmd check:evidence && git diff --check`, exit 0.

The reviewer verified all five receipt/input/log digests and 336 relevant
post-correction inputs, including the new conftest and fixture. The documented
pytest cache-write warning remains. The original Ubuntu log confirms the same
five failures and serves only as reproduction evidence.

Findings: **none**.

Remaining uncertainty: fresh hosted results on the follow-up commit are not yet
available; this does not block local acceptance. Model, browser and native gates
were not repeated for this test/documentation-only change.

Required next action: no correction required. Check new CI results after the
already authorized publication. This report is not a Validation Report and grants
no additional Git or publication authority.
