# Validation Report
Report ID: TTS-ADAPTER-LAYOUT-01-IPV6-PREEDIT-20261011-01
Target ID: TTS-ADAPTER-LAYOUT-01-IPV6-REDESIGN-01
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: complete retained35 migration paths, including both sides of the four engine moves, enumerated in before.json and after.json. Proposed IPv6 editable subset: apps/desktop/scripts/tts-adapter-layout-host.mjs; apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs; docs/development/tts-service-organization.md. No new implementation has occurred.
Validated path identities: before.json and after.json contain exact porcelain-v1 status, raw worktree SHA256 and filter-aware expected Git blob identity for all35 plus260 protected paths. artifacts-before.json/artifacts-after.json bind25 artifacts, complete2031 desktop02 and2037 preserved desktop01 resource trees, and15 authority/evidence files. Original BASELINE-01, frozen REDESIGN-POSTCHANGE-03 and accepted IPV6-AUDIT-01 are included. Initial full source equals frozen report03 and correction01 packet, with no changed paths.
Identity recheck: PASS. Full HEAD, branch codex/tts-adapter-layout, empty index, all35/260 source/protected identities,25 artifacts,2031/2037 resources and15 authorities unchanged before/after. Prior11 report03 authority identities match exactly. No previous report/hash was replaced. Original clean-unit baseline remains BASELINE-01; this is an explicitly authorized continuation of the retained owned patch, not a newly clean unit.

Commands and outcomes:
- `pnpm.cmd format:check:typescript` -> exit0 PASS; baseline-1.log; 2026-10-11T15:23:21.4354120Z through 2026-10-11T15:23:30.3164801Z.
- `pnpm.cmd lint:typescript` -> exit0 PASS; baseline-2.log; 2026-10-11T15:23:30.3489705Z through 2026-10-11T15:23:42.8760432Z.
- `pnpm.cmd --filter @voxleaf/desktop test` -> exit0 PASS; baseline-3.log; 2026-10-11T15:23:42.8837428Z through 2026-10-11T15:23:52.6878142Z.

All three approved deterministic commands ran freshly via require_escalated at repository root with pinned pnpm11.15.1 Corepack shims and native WindowsPowerShell PSModulePath. Desktop588 Vitest+49 Node passed, including real locked-Python policy fixtures, with zero skips. The accepted Audit Packet narrowed this pre-edit gate to those three commands. These results do not accept the current candidate or replace required post-change22 gates.

Additional diagnostic command: `node tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-IPV6-PREEDIT-20261011-01/project-bind.mjs` -> exit0 for successfully verifying the EXPECTED STRICT POLICY FAILURE and the requested boolean projection; see project-bind-command.json/log and bind-projection.json. This is explicitly NOT a candidate acceptance PASS. It imported actual copied torch/chatterbox.mtl_tts, without loading models, using exact embedded v4 Python with -I -B, isolated/no-user-site assertions, copied-root origin assertions and the unchanged production pythonAuditPolicy/AuditReader. childEnvironment supplied offline/no-bytecode settings and a fresh ignored cache. The observation hook only recorded boolean predicates and did not catch or suppress the production PermissionError; the known provider code caught its own denied bind. Node subsequently asserted the existing AuditReader rejection rather than altering it.

Actual bind projection: exactly one socket.bind; two audit arguments; real socket object; AF_INET6, SOCK_STREAM, protocol0; address tuple length2 with string host and exact integer port; tuple exactly the approved local IPv6 loopback/port0 constant. Immediate module urllib3.util.connection, function _has_ipv6, code filename and module __file__ all match the manifest-bound copied source. Every projected boolean is true. No observed destination string, arbitrary argument or content was persisted. Source SHA2562633bbdb69731e5ccb5cf4e4afd65605d86c7979cc5633126f50c92d5ad74a74 was independently verified against the runtime-manifest record in Node and inside embedded Python, including the event callback. Manifest, embedded interpreter, NumPy source and urllib3 source hashes remain unchanged after the child closes.

Known current-policy result remains FAIL: networkDenied1, optionalProbeDenied1, processDenied0, audioWritesDenied0, payloadWritesDenied0, writes34, orderly exit. AuditReader.admit(true) still throws tts-adapter-layout-host:filesystem-network-audit. The probe was denied before binding and no model, listening, connection, resolution or transmission was permitted by this diagnostic. The helper's exit0 means only that this exact expected failure and event shape were proven. No existing FAIL is reclassified as candidate PASS.

Diff scope: PASS. No source/test/documentation/configuration/generated/runtime edits by validator, director or worker during this gate. Only fresh ignored validator evidence was written. Closed current patch equals report03 exactly. The accepted draft permits only the three named paths with450 incremental/3900 full-unit additional ceilings; no implementation order or changed-code acceptance is inferred here.
Invariant review: PASS for the bounded pre-edit prerequisite: deterministic tests pass; exact real event predicate is verifiable; strict socket denial remains enforced and its known acceptance failure is explicitly preserved. The proposed revised accounting invariant is unimplemented/unvalidated. No claims of fresh candidate inference, cancellation, restart, desktop model compatibility or performance.
Test-integrity review: PASS. No tests/assertions/fixtures modified; current real-Python tests and bounded audit schema/forced-exit coverage execute successfully. Future IPv6 negative predicates and new counter/budget tests still require the worker implementation and independent post-change validation.
Privacy/artifact review: PASS for this pre-edit scope. Complete preserved identities and strict runtime denial remain intact; projection retains only approved booleans and source hashes, no book/audio/model/private payload. The accepted revision grants denied-probe accounting only, not socket execution. No package regeneration, installation, Git mutation or publication occurred.

Host prerequisites: before imports, verify-prerequisites.ps1 independently proved six exact task firewall rules and eight original rules with outbound Block/Any/enabled bindings; all three profiles enabled, MpsSvc Running. Preparation receipt a3845ed10ab6190da665c2ccf9cb216064a0594271b683afbaa2e628cc2e06a9 matches. Signed Microsoft EdgeDriver155.0.4283.45 verified, though no native/model test ran. Final-host-review.ps1 exit0 confirms all14 rules/profiles/service unchanged,0 surviving relevant processes, git diff --check exit0. Firewall cleanup intentionally not performed. Source and Git writers remained idle.

Authority bindings: IPV6-AUDIT-01 b16892a44a94d29056ef2bb52c99f2f63ce80d8959384020fe407eff041b25f0; original frozen REDESIGN-POSTCHANGE-03 FAIL 96eeb727e82b4a83be71cb2553d41ffe2bf82fbd71dcf5c651538583b1c54176. Accepted Audit Packet fully read, with validate-safe-refactor matrix/contracts. Existing failed/blocked reports and cleanup checkpoints remain immutable.

Action required: director may freeze the bounded implementation order against this baseline and accepted Audit Packet. Preserve all strict denials and classify only the exact denied provenance-bound IPv6 probe, with required adversarial real-event tests, exact CPU/IPv6 budgets and no weakening/bypass. Worker must remain the sole source writer and obtain fresh independent full post-change validation after freezing its packet. This BASELINE PASS grants no final acceptance, staging, commit, publication or plan archive. Validator idle after issuance.

Evidence SHA256 bindings:
- before.json: 86b1fec52834cf02801302f871683720aa6cdac862c1719c2915d161af039fa9
- after.json: 57e01b3e1b34a4569aadbd74e5efb32c2452d95cf0900e2e4231ca5ff9cfb879
- artifacts-before.json: 76523c5928a8eda0a766a257527a4f779976de8e51a974bd0c471d0a9a0b1765
- artifacts-after.json: 76523c5928a8eda0a766a257527a4f779976de8e51a974bd0c471d0a9a0b1765
- identity-before-comparison.json: b6e2879d8db7708bc2b0be584ac2d46b24321db990ad4aafbd41b994b5d75b77
- identity-after-comparison.json: 799b2c4ba10c420c4f52cf3fb8d300cbc414922a1f5e922647b5b8bed3c7f5f4
- baseline-commands.json: eaa3f8fe54fc2f534cc38e4fe49f284859bbd458d8f5c7c2cc7246541d3466be
- firewall-before.json: 6252671117903b5c5fefb82f0ff3d14a478cbccce4b312d346e61a4f63e6b6d1
- final-host-review.json: 9d8069cbafb9e95cf6f7201e208cd3b8c14d92f7295bb26fc0840723e9d117af
- project-bind.mjs: 07b0a2efdf01325a41d3e3886415f5c29b398f499b5fc31d886f769715d3be7c
- project-bind-generated.py: 9dc2489c799e9babd502ffcf0d4ff4c5fdc98ba5ec548e689da9ce14cf5d6e89
- project-bind-command.json: 0b7c8616a663b7629bf924e76a0ed9ebebd518b8fd97eeb1cfede37ffa1d7e91
- bind-projection.json: d6789d06a105fa1fdc48ed571be39c60407efb7fbfef3c61742eff39e1e4083a
