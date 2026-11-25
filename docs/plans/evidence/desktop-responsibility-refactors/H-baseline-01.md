# Validation Report

Report ID: DRR-H-BASELINE-01  
Target ID: H · adapter-layout scenario selection  
Mode: BASELINE  
Verdict: PASS  
Environment: local PowerShell outside sandbox, repository root, pinned pnpm 11.15.1, Node 22.23.5, Prettier 3.9.10 and ESLint 10.13.0.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths: the two files listed below.  
Validated path identities: both had empty porcelain status before and after.

| Path under apps/desktop/scripts | Worktree SHA-256 | Filter-aware index blob |
| --- | --- | --- |
| tts-adapter-layout-host.mjs | e34e6a29991adc405b1e9802e4f3bef276d3180a6f00a763fa405a2a9b080c35 | 0496114a1f7fd02100e71661c57fefe616b71a42 |
| tts-adapter-layout-host.node-test.mjs | f99e606e949cec7ace1642277ddf06cd700917aee70626b04c066a9596c446e8 | dc01509dd49938f7960f1f1b8a906a2e0f50a860 |

Identity recheck: PASS. Both manifests, HEAD and the 36 captured input digests matched. The index was empty.  
Commands and outcomes: the immutable receipt `tmp/evidence/desktop-responsibility-refactors/DRR-H-BASELINE-01/receipt.json` records exact arguments, timestamps, environment and inputs. SHA-256 `5855f26826b633e09606dfac8748566cb640f08e34fd4b092abe29d1e1801309`.

| Gate | Host command | Result |
| --- | --- | --- |
| H-FMT | `pnpm.cmd exec prettier --check apps/desktop/scripts/tts-adapter-layout-host.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | Exit 0, 0.77 s |
| H-LINT | `pnpm.cmd exec eslint apps/desktop/scripts/tts-adapter-layout-host.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | Exit 0, 16.56 s |
| H-NODE | `node --test --test-name-pattern="freezes the six exact bilingual portfolio arms|builds .*Piper runner arguments|adapter layout arm selection" apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | Exit 0, 0.11 s. Three named assertions passed. Node also counted the second file as a passing file with zero matching cases. |

Reused gates: none.  
Acceptance boundary: UNIT baseline.  
Pending batch gates: H post-change, other unit gates and combined acceptance.  
Preparation/cleanup: scoped PATH selected the repository-pinned pnpm shim for the host process. No package build, model run or persistent environment change.  
Retries: none.  
Diff scope: PASS, zero target changes.  
Invariant review: PASS for baseline. Current adapter code takes the first four portfolio arms. The six-pair assertion and both Piper argument checks passed. The reorder, missing and duplicate pair cases are assigned to the post-change test.  
Test-integrity review: PASS. No assertions changed during the baseline.  
Privacy/artifact review: PASS, tool output and hashes only.  
Action required: none for baseline. Freeze the two-path work order before the writer edits.
