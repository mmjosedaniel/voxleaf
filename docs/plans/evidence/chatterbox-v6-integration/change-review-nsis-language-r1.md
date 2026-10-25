# Independent NSIS language follow-up review

Review ID: `CB-V6-NSIS-LANGUAGE-R1-ASTRA-20261025`.
Reviewer: `change_reviewer`, GPT-6 Astra high.
Verdict: **APPROVE**, limited to the NSIS text correction, its regression and
follow-up documentation. No tests or edits were performed by the reviewer.

Base and HEAD: `e46eb99c542b27a891aae6ee20d68c525d79f5f1`.
Identity recheck: **PASS**. The closed 81-path input manifest has SHA-256
`0e16da2fb461215e70752792e7cb1b7c524468b67e2c68b885820ad33f721b80`;
the full integration diff and supplied new-file contents matched the worktree.
Inspection of the complete diff does not expand this scoped approval.

## Approved source identities

| Path | SHA-256 | Git blob |
| --- | --- | --- |
| `apps/desktop/src-tauri/windows/nsis-hooks.nsh` | `971e881bca7c3355957f0408b7554509e1762c25eef22b59743877bb7a0a48dc` | `00e24860dd1f4280d5a7f30eb82cf5f0ab7a9671` |
| `apps/desktop/scripts/windows-release.node-test.mjs` | `1e6128abcad7b3ba5ad2ab168300a52c14d8935d6c30100f58277714820fcf7e` | `9e4bd08713a3bd3be7f4a9b3737c43b4fa7e15fc` |
| `docs/plans/active/chatterbox-filelock-setuptools-security-refresh.md` | `cb3ada0f6d7dd8ce4ce3dde1b7ed1722f6ef99463c23db8776862f84c005142e` | `48719c4473b70302c3d97019a6c645d7d3f52c3b` |
| `docs/plans/evidence/chatterbox-v6-integration/nsis-language-follow-up.md` | `bf5b30e5841ae6c5da456b05353271432dd6053b8ca2f7c83914803d9a8ea7c5` | `584f2097ce590dc28041f33aeff0c0a3a8131b03` |

The generated installer source was inspected before and after review:
SHA-256 `6e04b85761f198fd3640a18595b99b634c0f969e45a605006deaa299cdcfdba9`,
blob `fe406179070286ce8b324725319becb166006c8b`. Generated sources were not edited.

## Acceptance and evidence

The generated script includes the hook before the language declarations.
Reverting only the eight explicit IDs and their comment in memory reproduces
the R4 hook exactly; removing only the new regression reproduces the R4 test
file. Detection, defaults, deletion policy and existing coverage are preserved.

The reviewer inspected the host red result (818 Vitest passed, 97 Node passed
and the new case failed), final green result (818 plus 98 passed), supplied
format/lint success and both passing package commands. Four actual R5 phases
have nonce/hash-bound process receipts, exit 0 and Computer Use observations
of readable Spanish/English text and correct defaults. Retention, removal and
external/unrelated markers passed. Final original data and installation
restoration passed without errors; the wrapper exited 0.

Installed executable SHA-256:
`dae5564bf76165facd121833f03127dab404a82685ec2d39258957eb6af101e1`.
R5 installer SHA-256:
`b9069e837ba8198f9ac016b3668589fc1c444f33edef1d8cc3ee2a6c945cb440`.

Findings: **none**. Required action for this reviewed scope: **none**.
No additional architecture, inference, privacy, persistence, memory or
cancellation change was identified.

Global gates remain separate: acquisition after the R9 response-read failure,
fresh PR CI and final integration review with evidence applicable to the
corresponding artifact. Native/installed R4 results are not converted into R5
results. This report does not authorize Git operations. Any subsequent plan
edit that records this verdict requires a new documentary review.
