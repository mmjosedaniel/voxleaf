# Validation Report

Report ID: DRR-H-POST-01  
Target ID: H · adapter-layout scenario selection  
Mode: POST-CHANGE  
Verdict: PASS  
Environment: local PowerShell outside sandbox, repository root.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths: the two files below.  
Validated path identities: before and after manifest. Porcelain was ` M` for each path.

| Path under apps/desktop/scripts | Worktree SHA-256 | Filter-aware index blob |
| --- | --- | --- |
| tts-adapter-layout-host.mjs | 5a49947708b5114eada0f1d28b8ce5a5e539ec52d63c76990e397d88bc318759 | c79dc39b4a069438f8b4514139305dd5f61589cb |
| tts-adapter-layout-host.node-test.mjs | b92414a2ff3163a84eb785512dcf8d986e1687b1cb4d547a18536103e0cacdbf | e5149dc5c0d5065af93973f45a05fdc3581b288c |

Identity recheck: PASS. SHA, worktree content, index blobs and status matched throughout independent verification.  
Commands and outcomes: `git diff --check HEAD -- apps/desktop/scripts/tts-adapter-layout-host.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` exited 0. The index check also exited 0. Independent receipt `tmp/evidence/desktop-responsibility-refactors/DRR-H-POST-01/receipt.json`, SHA-256 `5b8ba5921d0a30b10c0807ea779642d07b9039cbb1faecfaa2a7f76dc666a505`.  
Reused gates: DRR-H-WORKER-01 / H-FMT, H-LINT, H-NODE, each exit 0 on the exact patch, `tmp/evidence/desktop-responsibility-refactors/H-worker-01/receipt.json`, SHA-256 `f3ff4c6792a602c9ae7596177cc063718ff7e482612e079750d84daebe6c7a74`. Independently recomputed source, scripts, configuration membership and contents, tool hashes and environment hashes. All matched. The worker ran the same three commands named in [H baseline](H-baseline-01.md). The Node filter ran four named assertions, including the new selector fixture. Data outside those explicitly named modules and discovered configs, including the planning records and prepared driver, do not participate in these JS checks.  
Acceptance boundary: UNIT.  
Pending batch gates: A, V, R, M, combined package and final foundation.  
Preparation/cleanup: scoped pinned pnpm shim. No host process, model or packaging preparation for H.  
Retries: none.  
Diff scope: PASS. Two files, 63 additions and nine deletions, within the 105-line ceiling.  
Invariant review: PASS. The real desktop loop calls the selector. It returns the four original portfolio objects in the declared order, retaining optional flags and environment bindings, and rejects missing/ambiguous pairs with the existing fixed error.  
Test-integrity review: PASS. Existing assertions are intact. A shuffled fixture includes Qwen first and independently checks literal identities, order, same-object references, missing and duplicate cases.  
Privacy/artifact review: PASS. H diff contains source and synthetic tests only.  
Action required: none for this unit.
