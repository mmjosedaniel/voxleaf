# Validation Report
Report ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-POSTCHANGE-20261011-01
Target ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-01
Mode: POST-CHANGE
Verdict: FAIL
Environment: local PowerShell outside sandbox
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: exact closed35 original atomic migration paths, including both rename sides; before.json and after.json contain the complete list. Only the three redesign-allowlisted paths differ from report03.
Validated path identities: before.json captured before commands, every exact porcelain status, SHA256 and filter-aware expected Git blob; protected260 also included. artifacts-before.json captures all25 preserved artifact identities, complete2031 desktop02 and2037 old frozen records, plus seven redesign authorities.
Identity recheck: PASS. before/after full HEAD/index,35source,260protected,25artifacts,2031/2037 resources and seven authorities equal. See identity-before-comparison.json and identity-after-comparison.json. Empty index preserved.

Commands and outcomes:
1. pnpm.cmd format:check:typescript -> exit0. All matched files pass Prettier; baseline-1.log.
2. pnpm.cmd lint:typescript -> exit1. apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs line197 columns190/234: two no-useless-escape errors for escaped double quotes inside a JavaScript template literal; baseline-2.log.
3. pnpm.cmd --filter @voxleaf/desktop test -> exit1. All54 Vitest files/588 tests pass. Node48/49 pass, one failure, zero skips/cancellations. New real-Python policy test fails TypeError before completing its matrix; streaming admission test passes. baseline-3.log.
4. git diff --check -> exit0. git-diff-check.json.
5. Independent read-only firewall observation -> exit0, missing prerequisite confirmed. firewall-before.json contains original8 enabled outbound Block/Any rules, zero task rules, all three firewall profiles enabled and MpsSvc Running.

Exact command start/end timestamps and logs are in baseline-commands.json plus baseline-command-3.json. All executed acceptance commands ran from repository root using normal local PowerShell require_escalated, process-local pinned Corepack shim PATH and native WindowsPowerShell PSModulePath. No exploratory sandbox result is acceptance evidence.

Failure evidence and smallest correction:
- Lint regression is confined to unnecessary JavaScript escaping in the new forced-exit Python-source template. Preserve the generated Python statement while removing only the unnecessary JavaScript escapes.
- The real-Python fixture assigns probe_path to its synthetic file before concatenating pythonAuditPolicy. The policy declares probe_path in the SAME Python globals and sets it to None whenever authority is null. The test then unconditionally calls runpy.run_path(probe_path,...), which fails in os.fsdecode(None) with TypeError. This first occurs when the matrix reaches a null-authority case. Python exit1 is observed at test line169, from the test beginning line41. Preserve the production no-probe policy; give the fixture's caller-owned pathname a distinct name and bind fixture invocation to it, or conditionally invoke only where appropriate without deleting any operation/assertion. Do not alter production probe admission to make the fixture pass.
- Earlier iterations and the separate streaming consumer test do not certify the unexecuted later null-authority network/write scenarios, sentinel case, repeated-probe case or os._exit branch. Rerun the entire real-Python matrix after a frozen correction; no test string inspection or skip can replace execution.

Diff scope: PASS. Current source35 exactly matches the frozen worker packet. Only runner, associated Node tests and service-map guidance changed from report03. Independent explicit UTF-8 accounting verifies504 incremental lines (213runner,280tests,11guidance),3415 total additional lines under520/3500, generated151 unchanged. diff-accounting-utf8.json is authoritative. Initial diagnostic diff-accounting.json used host-default decoding and miscounted non-ASCII content as3431; it is retained and superseded explicitly by UTF-8 comparison, not a source change. No manual generated/authority/lock/dependency/runtime change. Complete scope is not newly accepted.

Invariant review: FAIL. Required actual-Python producer/consumer regression matrix is incomplete because its fixture crashes. Static inspection retains unconditional PermissionError process denial, separate denial counters, bounded512-character/32-record consumer, exact optional probe budgeting, root/service assertions and drain ownership; these do not prove copied-provider compatibility or candidate lifecycle. Those remain untested for this patch.

Test-integrity review: FAIL. Existing588 Vitest and prior Node assertions pass; the new real-Python test is defective and aborts remaining cases. No validator repaired assertions, source, fixtures, snapshots or generated outputs.

Privacy/artifact review: PASS for source cleanliness and unchanged artifact identities, incomplete for final runtime acceptance. No prohibited book/audio/model/secret files entered the diff, and all bounded test fixtures are synthetic. Full25/frozen2031/old2037 bytes held unchanged. No copied-provider/model/native inference occurred; no package builder or host configuration mutation occurred. Real candidate privacy, cancellation and artifact-reuse execution evidence remain outstanding.

Host prerequisite status: BLOCKED independently of the established source FAIL. No exact task rules0..5 exist; ordinary benchmark rules do not cover the required copied/frozen/installed interpreters. Director's recorded UAC cancellation remains unresolved. Copied-provider import proof, candidate and desktop model gates and exact-v4 dependency imports must not run until fresh exact rules are independently verified.

Stopped execution: director explicitly requested completing the three baseline commands and then returning this failed patch, without spending all22 gates on known failures. None of the22 full acceptance gates ran in this report. No previous PASSs were reused for new source. Supplemental fresh wheel/history/full actual copied closure/provider proof and native startup were not rerun. Default native startup is a separate model-free fake-service route by code inspection, but it remains unexecuted here. Dependency-security imports exact copied tokenizers/transformers; it remains subject to the offline prerequisite. Prior report03 FAIL and historical original/pre-edit baselinePASS reports remain immutable.

Authority bindings: raw Change Packet SHA256851dd4d4e60562635318bf47dacdfda045cb1de0011c347d859ddf73db105276; source35SHA57d35af0e36f05cc3b87bdbe6cf31934bc861240f459ed06166dda5995f237d7; artifact-reuseSHA2ad021d6810aabc853053c8f5638257b730fbd4a18547b191b37581dc1213292; redesignWO SHA58dc8270167dff2c35915731472330df0218eb2995fef2824caa1e2fca455b23; addendumSHA199eab4b142f94c7b9a47910f455ce3e2445d34019345fcca1b701f3aece7abe.

Action required: Issue a precise correction restricted to the existing Node test fixture and its JavaScript escaping. Preserve every matrix case/assertion and production policy. Freeze a new Change Packet; independent revalidation requires a new Report ID, new before/after identities and the three baseline commands followed by all applicable22 gates and supplementary proofs. Missing offline prerequisites remain BLOCKED; do not claim campaign PASS or archive. No staging/commit/push/PR/publication authorized. Validator is idle after issuance.
