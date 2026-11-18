# Change Review Report

**Review ID** `NOV17-PLAN-CR-R01-20261117`  
**Task ID** `NOV17-PLAN`  
**Verdict** `CHANGES_REQUESTED`  
**Base commit and reviewed HEAD** `50f3b9ec76022efae72c239015bb47080920d7a0`

**Reviewed paths and identities.** All 206 entries in `tmp/evidence/november-17-findings-plan/manifest-r01.json`, ID `NOV17-PLAN-INPUTS-R01`, SHA-256 `18c80726a2df39c6d4230263094aa5cd32dedd2faf46a6c55f27d5683548f267`. The only task changes were the new ExecPlan and its active index entry. The supplemental M010.1 authority, `docs/plans/completed/M010-001-bilingual-narration-and-candidate-screening.md`, matched its HEAD blob `9a40c79094f977940e3df0c5e7dba8ac33402003`, SHA-256 `328f0d0c5e4df2fb495d310bae6b456b2fc1b0fea961769c435f754e0c3819d6`.

**Identity recheck.** PASS. Base, HEAD, manifest identities and worktree scope were stable across inspection. The index was empty and both reserved records were absent.

**Acceptance review.** The plan accounts for 39 source-supported cases and keeps VF-0121 conditional on the installed WebView2 keyboard sequence. It preserves failed historical attempts and individual step outcomes, limits CI reuse to the matching pre-edit tree, and groups future checks by affected owner and runner. One planned assertion conflicts with the existing Stop contract.

**Test evidence reviewed.** The coordinator reported exit 0 in normal host PowerShell for `node scripts/check-evidence.mjs`, `git diff --check` and `python tmp/evidence/november-17-findings-plan/check-plan.py r01 freeze`. The freeze check covered 12 sections, 40 distinct finding links and 36 side-file hashes from nine receipts. The coordinator’s GitHub lookup returned CI tree `2691438375405547b54957ae49d7934e42be6789`, which matched the locally inspected planning and PR-head trees. The reported Windows 34/34 evidence-guard result applies to that historical run. No product tests ran for this planning patch.

**Finding — P2, VF-0124 checkpoint acceptance.** At `docs/plans/active/november-17-findings-corrections.md:84`, the plan says a changed checkpoint must fail. The requested passage can become audible after the runner observes generation and before Stop reaches the application. In that sequence the heard checkpoint may legitimately advance. The proposed assertion would reject correct cleanup and reintroduce a timing-dependent failure. The native runner explicitly accepts a safe preview or a valid heard checkpoint at `apps/desktop/scripts/native-smoke/tts-scenarios.mjs:1985`. The reconciliation documents the same distinction at `docs/development/findings/audits/2026-11-17-findings-reconciliation.md:303`.

**Required next action.** Correct the VF-0124 row to accept both legitimate post-Stop states, reject checkpoint advancement unsupported by heard audio, and credit active-cancellation timing only for a terminal native cancellation tied to the same request and Stop. Natural completion first should produce cleanup evidence only. Submit the corrected planning documents under a fresh review ID and include M010.1 in the manifest.

**Remaining uncertainty.** Historical active-arm runs do not establish which terminal event won. The correction requires document checks and fresh review. Runtime verification remains scheduled for implementation.