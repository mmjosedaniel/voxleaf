# Validation Report
Report ID: TTS-ADAPTER-LAYOUT-01-IPV6-POSTCHANGE-20261011-01
Target ID: TTS-ADAPTER-LAYOUT-01-IPV6-REDESIGN-01
Mode: POST-CHANGE
Verdict: FAIL
Environment: local PowerShell outside sandbox
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: full closed35 migration paths, including both sides of four moves, completely enumerated in before.json and after.json. Only runner, associated Node tests and service-map guidance differ from the immutable IPv6 pre-edit baseline.
Validated path identities: exact porcelain-v1 status, worktree SHA256 and filter-aware expected Git blob for35 source and260 protected paths;25 artifacts, complete2031/2037 frozen resource records and20 authority files in artifacts-before.json/artifacts-after.json. Before source35 matches frozen worker-ipv6-01 manifest83f7112e0a7547bf4b97f3535f8c491c9ff6148b31a1a97d3554cb0ffa2fcaa2. Change Packet68ef03caa991546a39a34e15b3be3aaedcaef0646e0e72463b56bb2448e84f75; IPV6-WO b6d8fd1e07700c53dd5c6cd3449cc026f3990893512c0cf5bfdeaaa729dd4449. Accepted order, audit and full actual diff inspected.
Identity recheck: PASS. HEAD7bbad9d5bef3a83c913ea5d7b948213a05bb0362, branch codex/tts-adapter-layout, empty index and every captured source/protected/artifact/authority identity unchanged. Prior15 authorities exactly retained. No existing report modified.

Commands and outcomes:
- `pnpm.cmd format:check:typescript` -> exit0; baseline-1.log; 2026-10-11T15:45:52.3364666Z through 2026-10-11T15:45:59.1980320Z.
- `pnpm.cmd lint:typescript` -> exit0; baseline-2.log; 2026-10-11T15:45:59.2285788Z through 2026-10-11T15:46:09.9126652Z.
- `pnpm.cmd --filter @voxleaf/desktop test` -> exit1; baseline-3.log; 2026-10-11T15:46:09.9205210Z through 2026-10-11T15:46:20.2814553Z.
- `node tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-IPV6-POSTCHANGE-20261011-01/provider-import-proof.mjs` -> exit0 PASS copied-provider proof; 2026-10-11T15:46:00.0982890Z through 2026-10-11T15:46:21.4374400Z; provider-import-command.log and bind-projection.json.
- `capture.py before`, `verify-prerequisites.ps1`, `reuse-exclusion.py`, `capture.py after`, `final-host-review.ps1` -> exit0; all independent host evidence retained in this directory.
- All22 mandatory campaign commands: NOT RUN after the focused desktop test failed. No candidate/desktop model matrix, dependency-security, package build, wheel/history/recovery rerun or inference attempted. Prepared helper scripts are not executed evidence. Earlier PASSs do not fill this gap.

Failure: desktop Vitest588 PASS, Node50 PASS/1 FAIL/0 skipped. The new test "real locked Python classifies only the denied provenance-bound IPv6 bind" fails at apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs:397, expected two socket.bind events but observed one. Line396 derives attempts from `operation.includes(";assert trusted()")`. This substring also matches single-call cases that reassign the trusted function or its metadata before one assertion. The first affected case is the alternate source-path case; the wrong-module, wrong-__file__ and renamed-caller cases share the same ambiguity. The actual repeated-probe case legitimately has two calls. The fixed expected count must distinguish these cases explicitly; production denial and assertions must not be relaxed. The new test aborts at its third case, so its remaining adversarial real-event/forced-exit matrix is not validated by this run. The separate both-budget/schema test passes.

Actual copied-provider proof: PASS separately, not overall acceptance. Exact isolated v4 embedded Python imported torch/chatterbox.mtl_tts under production pythonAuditPolicy(runtime,models,cpuDescriptor,ipv6Descriptor) and AuditReader(stream,1,1). Both module origins are inside the copied root. Real bind projection confirms exact AF_INET6/SOCK_STREAM/protocol0, approved loopback/zero-port tuple, module/function/code filename/__file__/source SHA; all boolean predicates true. Final counts: CPU probe1, IPv6 probe1, unexpected network0/process0/audio writes0/payload writes0; writes34, orderly exit. Manifest/interpreter/NumPy/urllib3 hashes unchanged. No model loaded. Import proof uses the new API explicitly; it does not suppress PermissionError or move provider imports ahead of auditing. Prior strict-policy FAIL remains immutable under its prior policy.

Diff scope: PASS. Exactly three authorized paths; independent incremental count268/450 (runner52, tests206, guide10). Worker pre-edit copies independently hash-match the validator pre-edit source identities. Full-unit3665/3900 follows unchanged prior3415 and net250 lines in these three paths; generated151/300 and relocated1614 unchanged. No dependency/runtime/model/protocol/CLI/timeout/authority/generated edit, package regeneration, Git or host mutation. No pre-existing unrelated work reverted.
Invariant review: FAIL for incomplete required validation due the test expectation defect. Inspected production predicate retains unconditional PermissionError and exact descriptor/caller/socket/address classification, separate budgets and unexpected-event rejection. Actual provider proof passes; full real-Python negative matrix and required model/lifecycle gates remain unproven. No inference/performance/complete cancellation acceptance claim.
Test-integrity review: FAIL. Newly added event-count heuristic incorrectly treats several single-call operations as repeated attempts. Existing assertions were preserved, but the new coverage cannot complete. Smallest correction is an explicit correct per-case attempt count, preserving all17 cases and their actual-event assertions, repetition rejection, cleanup and forced-exit coverage. Validator did not edit tests or policy.
Privacy/artifact review: PASS for executed import/scope evidence only. Strict denials remain active; evidence contains boolean projections and hashes, no book/audio/destination payload. Fresh actual-tree inventories core2024/v413085/frozen-core2024 and ZIP inventories exclude all three edited filenames; retained installer inputs and production reference search also exclude them. The25 artifact bytes and full frozen resources remain unchanged. This partial PASS does not replace withheld model privacy/cancellation gates.

Host prerequisites/cleanup: independent14-rule check passed before imports:6 exact task rules plus8 original rules, all enabled outbound Block/Any, all profiles enabled, MpsSvc Running. Native signed EdgeDriver155.0.4283.45 verified but unused. Final host review confirms14 rules unchanged,0 surviving relevant processes, git diff --check exit0. No firewall cleanup performed; director owns it. All checks used require_escalated normal host PowerShell with pinned pnpm11.15.1/native PSModulePath; provider process used exact embedded interpreter, offline/no-user-site/no-bytecode environment and fresh ignored cache.

Action required: freeze a bounded correction order confined to the new Node test's attempt-count metadata/detection, preserving every case and assertion. Production policy and guide need no correction on this evidence. Then require a new immutable report with fresh three baseline commands, complete actual-provider proof and all22 required gates plus full supplementary evidence. Do not reuse this partial proof to accept changed source bytes, archive the plan, stage, commit, push or publish. Original BASELINE-01 and IPv6 pre-edit PASS remain distinct from this regression FAIL. Validator idle after issuance.

Evidence SHA256 bindings:
- before.json: dbb2e5a0ad352efd5bc62dc849d3246a79453577fa28e2460db96aeafe7de4c3
- after.json: 56e405f6c46b1da5850eca38854cdd3fe0cd75e914828bf85d457cc7bf48331a
- artifacts-before.json: 989729d5b132435846cd55382969f940813e9ef2483849d0cb7c95cc38621ea2
- artifacts-after.json: 989729d5b132435846cd55382969f940813e9ef2483849d0cb7c95cc38621ea2
- identity-before-comparison.json: 56fc7ddc815d7094668d677706b38a1ccaa89bd19ada55f030a5ddf56fccdcfa
- identity-after-comparison.json: 799b2c4ba10c420c4f52cf3fb8d300cbc414922a1f5e922647b5b8bed3c7f5f4
- baseline-commands.json: 01575cd888af13fd629786b45e0516cf272c23df9ca8c846abecd1cdac9a46f3
- baseline-3.log: 5dbdbd814c12c8144653a769c8eda78e7e326afb47f72dfec63d670da58eaad3
- provider-import-command.json: 2ba017b7743c9a8336f959ff1059adc2b39e198f5462357fa7e1fa2c198cb35e
- provider-import-proof.mjs: b61001d7c55c87fd75ffba61389c289fd5b88f3fac2f91a87b26030981a8278c
- project-bind-generated.py: 44d4547de2a2853efe2cab6607a91836ee47c06d8265ae6f4d905f721a2706f3
- bind-projection.json: 02ac49c4de2ff9b6699864c114577ba19b7c1e8758b4535e43b152b3902e99b8
- firewall-before.json: d1df540d993a9ac86b6328064dbf78ffe912ed6a863e0fa2ab1053e0622d02d3
- final-host-review.json: 409ef2014c32a59ee0466331afbef2c393bb43c1c6bb9790235bc2c4ba8cdcbb
- reuse-exclusion.json: 6cd231f12da20aec25e258d6187ce5a30ef56ab82aa94c8643aa05615a054976
