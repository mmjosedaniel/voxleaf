# Change Review Report

Review ID: **RNB-review-03-20261020-Astra**. Task: reader-narration-bugfixes.
Verdict: **BLOCKED**. Reviewer: independent `change_reviewer`, GPT-6 Astra high.
Base and HEAD: `8fd0c54e93705009e6070cb97105c8a1032002d6`.
Branch: `codex/reader-narration-bugfixes`. Index empty; no Git authorization.

## Reviewed identities

Closed 36-path manifest: ignored `review-03-preflight-identities.json`, SHA-256
`817a50b29e5912b8d48b5f7e726055713df3ecb7d9188b5ad6964e2b65a320be`.
Tracked patch: `review-03-preflight.patch`, SHA-256
`d0c433ddbe92e4c43aa9aba4ad0c961fbfb65cc78eaf5b061e308fbf0c0aa0c6`.
New-file contents were reviewed. Execution inputs: 723 entries in
`final-code-inputs-03.json`, SHA-256
`2625d3f76e31f62d5f01d77c6719226b1bc6099e6e3757b7fd70c7b01473db4b`.
Supporting scope includes the unchanged 20-path snapshot `c03535` and caller
snapshot `e7ec72` for `apps/desktop/scripts/native-startup-smoke.mjs` (SHA-256
`b03dad1eee757e190069c716382fc8b110449c29ce05b8737b21d23df5354566`,
filter-aware/base blob `41d1e88909fe5f701058ac1abba2e47b8eb11f48`).

Identity recheck: **PASS**, reviewer snapshot `34cb39`; all 36 task paths,
723 execution inputs and supporting paths match before/after. HEAD, branch
and empty index are unchanged. This report is outside its own manifest.

## Assessment and evidence

Production implementation is unchanged from review02. The harness correction
addresses the demonstrated non-writable Tauri `invoke`: it directly observes
native lifecycle, requires the same non-null loading/warming instance before
cancellation, and verifies native stopped/no-owner within two seconds and UI
cleanup within five seconds from the same cancellation start. AudioContext
accounting remains independent. The permanent read-only-port regression reaches
the actual helper and distinguishes the old observation failure.

Host recovery supports retaining package containment. Ordinary local PowerShell
verified the installed package without changing production guards or package
contents. The reviewer ran no tests; evidence was attributed to the implementer:

- Harness regression: intended `Native observation missed: loading` red with
  19 controls passing; corrected run 20 pass.
- `pnpm.cmd check`: exit 0, `check-04.log`, current 723-input manifest.
- Ordinary-host package diagnostic: exit 0, 209.78 seconds.
- Prior browser/native results apply to unchanged production code; they do not
  replace real-model acceptance.
- Full model matrix04 was still running at review time.

Findings: **none**. Stages 1–5 retain their reviewed implementation and automated
evidence. Stage 6 remains incomplete: final real-model loading/warming
cancellation, containment, cleanup, restart and all six arms remain unverified
for this harness until matrix04 completes. Required next action: completed
matrix evidence, reconciled documentation and a fresh closed identity snapshot.
This immutable report is not APPROVE or authorization to stage, commit or push.
