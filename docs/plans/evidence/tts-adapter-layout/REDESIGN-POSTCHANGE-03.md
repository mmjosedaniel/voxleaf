# Validation Report

> **Sanitized publication copy.** Personal paths are redacted; report IDs,
> results and validation hashes retain their historical meaning.
> Original SHA-256: `96eeb727e82b4a83be71cb2553d41ffe2bf82fbd71dcf5c651538583b1c54176`.
> See [publication and original retention](../historical-privacy-cleanup/README.md).

Report ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-POSTCHANGE-20261011-03
Target ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-01
Mode: POST-CHANGE
Verdict: FAIL
Environment: normal local PowerShell outside sandbox, repository root, pinned pnpm11.15.1 Corepack shims and native WindowsPowerShell PSModulePath. Every acceptance and diagnostic execution used require_escalated. Signed Microsoft EdgeDriver155.0.4283.45 explicitly selected; exact v4 embedded Python with -I -B, sanitized offline/no-user-site environment and ignored cache for provider proof. No inherited model-selection variables.
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: complete closed35 migration paths, including deleted and added sides of all four adapter moves, enumerated in before.json/after.json. The redesign subset is the runner, its Node tests and service-map guide; correction01 only changes the test fixture.
Validated path identities: before.json/after.json record porcelain-v1 status, worktree SHA256 and filter-aware expected Git blob for all35 plus protected260. artifacts-before.json/artifacts-after.json bind25 preserved artifact files, complete2031 desktop02 and2037 preserved desktop01 resources, and11 authority/evidence files. The source35 equals frozen correction01 source manifest aa045b1f5f04d506cf987d73ae03daf11cbedff808de067f065d5118049a9151; raw Change Packet adcc238f945118c9faf5026ce50a40adf4cad3654626e29da28344e2450afb04.
Identity recheck: PASS. All captured identities, full HEAD and empty index remain unchanged; exact boolean comparisons retained in identity-before-comparison.json and identity-after-comparison.json. Issued earlier reports were not modified.

Commands and outcomes: all3 fresh baseline commands PASS and19/22 mandatory campaign commands PASS. Additional mandatory real-provider proof FAIL before any model load; commands14(candidate),15(frozen desktop02 model matrix),22(exact-v4 dependency-security) were deliberately not executed after that boundary failed, as directed. Exact commands, timestamps, exits and logs follow and are retained in baseline-commands.json, commands-safe.json, command-13.json and provider-import-command.json. No earlier command PASS accepts this patch.

Concrete failure: real torch and chatterbox.mtl_tts imported successfully from the copied v4 runtime under the unchanged production pythonAuditPolicy, then production AuditReader.admit(true) rejected tts-adapter-layout-host:filesystem-network-audit. Both interpreter exit and isolated/no-user-site assertions passed. The bounded Windows audit projection confirmed one subprocess.Popen with argumentCount4, executableNone, exactly lscpu, default cwd/env and provenance-bound NumPy check_support_sve/default Popen context. Counts at orderly exit: writes18, networkDenied1, processDenied0, optionalProbeDenied1, audioWritesDenied0, payloadWritesDenied0. Thus the prior optional-process issue is resolved, but zero network-denial acceptance is not satisfied.

Two additional read-only diagnostic runs retained the original failure and unchanged production policy, adding only bounded audit counters and then event/module/function names. The network event is socket.bind from urllib3.util.connection._has_ipv6 during urllib3 import. Read-only inspection of the exact copied urllib3 source shows HAS_IPV6 = _has_ipv6("::1"), a local capability bind whose PermissionError is caught by except Exception. The audit denies the bind before it occurs; this evidence does not show an external connection or data transmission. It nevertheless violates the approved strict zero-network-event invariant and cannot be silently classified as an optional process probe. Original attempt and both diagnostics remain preserved; neither was relabeled PASS. No import was moved ahead of the policy and no counter, environment or subprocess bypass was introduced.

Diff scope: PASS. Frozen correction remains four additions/four deletions in the test fixture, with production bytes unchanged. Independent accounting confirms504/520 incremental lines across3 files,3415/3500 full-unit additional lines including generated151/300, and1614 mechanically relocated engine lines. No unrelated source, dependencies, models, profiles, protocol, entrypoint, locks or historical-authority changes. Current v3 admission remains intact and v4 remains local, unpublished and unadmitted.

Invariant review: FAIL. The strict provider audit invariant rejects the actual copied dependency import described above. Synthetic policy and bounded transport tests pass, but do not substitute for this real dependency graph. Fresh model inference, cancellation/restart/shutdown and frozen desktop model compatibility remain untested in this report. This is an acceptance-harness/dependency capability-probe incompatibility, not evidence of a changed engine algorithm or successful network escape.

Test-integrity review: PASS. No assertions removed or weakened. Fresh desktop588 Vitest+49 Node includes actual locked-Python policy execution, denied subprocess/os.system/socket/audio/payload events, caught denials, strict optional-probe identity/context/budget, forced-exit and bounded diagnostic-noise paths. Shared209, EPUB651, Python485 and Rust87 default/88 release-locked pass in fresh aggregates. Default native-startup was inspected as model-free and passed IPC, fake-service cancellation/crash recovery, bounded local file handling, reader/synchronization/privacy and restart/reselection assertions. It does not prove the withheld model matrix.

Privacy/artifact review: FAIL for incomplete mandatory candidate evidence and rejected zero-network-denial invariant; inspected source/artifact scope PASS. Diagnostics retain no book text, audio, addresses or arbitrary subprocess arguments. No prohibited payload entered source changes. Fresh actual trees core2024/v413085/frozen core2024 equal manifests and exclude all3 edited filenames; ZIP inventories and retained NSIS inputs exclude them, with no production reference to the host runner/test/guide. Frozen2031 resources equal configured resources and2031 NSIS directives exactly; old2037 failed resources remain preserved. All27 recovery copies rehash correctly. Fresh wheel isolated imports resolve exclusively inside the new extracted wheel without provider imports or checkout leakage. Historical v2 seven/v3 nine module bytes still match exact Git authorities. Current wheel3934251aff7e4bc8832dee49082c358a2bc85d9eb0c525ec4783147dcf915e7d.

Host prerequisite and cleanup: PASS. The director's prepared firewall receipt a3845ed10ab6190da665c2ccf9cb216064a0594271b683afbaa2e628cc2e06a9 was independently verified before provider imports:6 exact task rules plus8 unchanged originals, outbound/block/enabled/Any, all profiles enabled and MpsSvc running. Fresh preflight PASS validates installed logical/canonical v3 identity, complete copied closures and package bindings. Final host review confirms all14 rules/profiles/service unchanged,0 surviving relevant runtime/test processes and git diff --check exit0. Validator made no firewall, Git or installation mutation. The director may now perform separately authorized exact-six cleanup while preserving the8 originals; later cleanup is outside this immutable report interval.

Evidence: supplementary.json, tree-closure-diagnosis.json, preparation-review.json and reuse-exclusion.json contain fresh history, error-contract, wheel, complete-tree, recovery, installer-input and ceiling proofs. provider-import-command.log preserves original failure; provider-import-diagnostic.json and provider-import-network-diagnostic.json retain counters/projection/origins and bounded network caller. final-host-review.json and final-git-status.txt retain teardown and Git state. Exact receipt hashes are appended below.

Limitations: original preparation timing deviation remains historical, never retroactively compliant. The selected non-installing frozen desktop route preserves ordinary installation; unsigned local artifacts, antivirus and installer lifecycle are not newly certified. Python reports485 PASS with an existing pytest nodeids-cache write-permission warning. Vite reports chunk-size warning. Release audit passes its current policy with7 Rust informational/5 Windows-reachable findings and Chatterbox blind spots chatterbox-tts,resemble-perth,torch,torchaudio. No model/Qwen/performance acceptance or zero-blind-spot claim.

Action required: preserve the frozen patch and rejected evidence. The current order requires zero denied socket events, so no correction that admits this bind is authorized within it. Obtain a reviewed explicit decision/work order resolving the local IPv6 capability-probe conflict without permitting network execution, bypassing early auditing or weakening arbitrary socket rejection. Add the corresponding narrow regression evidence if a changed design is approved, then rerun fresh complete independent validation under a new Report ID with verified exact offline prerequisites. Do not archive the plan or claim completion. No staging, commits, push, PR or publication. Original BASELINE-01 PASS, prior failed candidates, redesign pre-edit PASS and report02 BLOCKED remain distinct immutable evidence. Validator idle after issuance.


Commands and outcomes:
- BASELINE `pnpm.cmd format:check:typescript` -> exit0; baseline-1.log; 2026-10-11T14:49:03.6608961Z through 2026-10-11T14:49:11.2549432Z.
- BASELINE `pnpm.cmd lint:typescript` -> exit0; baseline-2.log; 2026-10-11T14:49:11.2751493Z through 2026-10-11T14:49:30.8148909Z.
- BASELINE `pnpm.cmd --filter @voxleaf/desktop test` -> exit0; baseline-3.log; 2026-10-11T14:49:30.8222496Z through 2026-10-11T14:49:41.3501001Z.
- Gate1: `pnpm.cmd format:check:python` -> exit0 PASS; command-01.log; 2026-10-11T14:51:33.2802311Z through 2026-10-11T14:51:34.0443270Z.
- Gate2: `pnpm.cmd lint:python` -> exit0 PASS; command-02.log; 2026-10-11T14:51:34.0688543Z through 2026-10-11T14:51:34.4618675Z.
- Gate3: `pnpm.cmd typecheck:python` -> exit0 PASS; command-03.log; 2026-10-11T14:51:34.4660674Z through 2026-10-11T14:51:35.3324356Z.
- Gate4: `pnpm.cmd test:python` -> exit0 PASS; command-04.log; 2026-10-11T14:51:35.3395892Z through 2026-10-11T14:51:57.2510961Z.
- Gate5: `pnpm.cmd build:python` -> exit0 PASS; command-05.log; 2026-10-11T14:51:57.2588549Z through 2026-10-11T14:51:57.7440446Z.
- Gate6: `pnpm.cmd package:piper-core:check` -> exit0 PASS; command-06.log; 2026-10-11T14:51:57.7469374Z through 2026-10-11T14:52:07.2859868Z.
- Gate7: `pnpm.cmd package:chatterbox-optional:check-source` -> exit0 PASS; command-07.log; 2026-10-11T14:52:07.2926601Z through 2026-10-11T14:52:07.9179192Z.
- Gate8: `pnpm.cmd package:chatterbox-optional:check-acquisition` -> exit0 PASS; command-08.log; 2026-10-11T14:52:07.9261592Z through 2026-10-11T14:52:08.5230075Z.
- Gate9: `pnpm.cmd package:chatterbox-optional:v3:check-source` -> exit0 PASS; command-09.log; 2026-10-11T14:52:08.5296798Z through 2026-10-11T14:52:09.0994480Z.
- Gate10: `pnpm.cmd package:chatterbox-optional:v3:check-acquisition` -> exit0 PASS; command-10.log; 2026-10-11T14:52:09.1066379Z through 2026-10-11T14:52:10.1934384Z.
- Gate11: `pnpm.cmd package:chatterbox-optional:v4:check-source` -> exit0 PASS; command-11.log; 2026-10-11T14:52:10.2002021Z through 2026-10-11T14:52:10.7361333Z.
- Gate12: `pnpm.cmd package:chatterbox-optional:v4:check-local` -> exit0 PASS; command-12.log; 2026-10-11T14:52:10.7433243Z through 2026-10-11T14:55:08.5697848Z.
- Gate13: `pnpm.cmd test:tts:adapter-layout:preflight --receipt <REPO_ROOT>\tmp\evidence\tts-adapter-layout\validation\TTS-ADAPTER-LAYOUT-01-REDESIGN-POSTCHANGE-20261011-03\preflight-receipt.json` -> exit0 PASS; command-13.log; 2026-10-11T14:50:39.6588876Z through 2026-10-11T14:53:52.2501782Z.
- Gate16: `pnpm.cmd check:portable` -> exit0 PASS; command-16.log; 2026-10-11T14:55:08.5773241Z through 2026-10-11T14:56:58.0896242Z.
- Gate17: `pnpm.cmd check` -> exit0 PASS; command-17.log; 2026-10-11T14:56:58.0980946Z through 2026-10-11T14:59:02.4480192Z.
- Gate18: `pnpm.cmd test:native-startup` -> exit0 PASS; command-18.log; 2026-10-11T14:59:02.4564674Z through 2026-10-11T14:59:38.7936000Z.
- Gate19: `pnpm.cmd package:windows:check` -> exit0 PASS; command-19.log; 2026-10-11T14:59:38.7969059Z through 2026-10-11T14:59:39.1953229Z.
- Gate20: `pnpm.cmd inventory:release:check` -> exit0 PASS; command-20.log; 2026-10-11T14:59:39.2010053Z through 2026-10-11T14:59:40.3587264Z.
- Gate21: `pnpm.cmd audit:release` -> exit0 PASS; command-21.log; 2026-10-11T14:59:40.3651023Z through 2026-10-11T14:59:55.8151695Z.
- Gate14: `pnpm.cmd test:tts:adapter-layout:candidate` -> NOT RUN after required real-provider audit failure.
- Gate15: `pnpm.cmd test:tts:adapter-layout:desktop --executable=<REPO_ROOT>/tmp/tts-adapter-layout-desktop-02/voxleaf-desktop.exe` -> NOT RUN after required real-provider audit failure.
- Gate22: `pnpm.cmd test:chatterbox:dependency-security` -> NOT RUN after required real-provider audit failure.
- Required real-provider proof: `node tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-REDESIGN-POSTCHANGE-20261011-03/provider-import-proof.mjs` -> exit1 FAIL; provider-import-command.log; 2026-10-11T14:55:59.7887700Z through 2026-10-11T14:56:37.9706662Z.
- Additional diagnostic commands: `node <this-report>/provider-import-diagnostic.mjs` and `node <this-report>/provider-import-network-diagnostic.mjs`, both exit1 at the unchanged production admission check; bounded JSON evidence retained.
- Supplementary commands: `services/tts/.venv/Scripts/python.exe -B <this-report>/{supplementary.py,tree-closure-diagnosis.py,preparation-review.py,reuse-exclusion.py}` each exit0; `capture.py before` and `capture.py after` each exit0; `verify-prerequisites.ps1` and `final-host-review.ps1` each exit0.

Evidence SHA256 bindings:
- before.json: f919535572898ce0f69c7bb4e423ddbca90ff48c5b5d4300140c8551336a4376
- after.json: 1c234f272e9e588f0b7bc9d2aa53a5894f7744b8afea6f26473725ba1d5f6248
- artifacts-before.json: d76d7681d88b95bd9e63605ff6e4773f84681c1f6aa7aa5f139bc669db59b79d
- artifacts-after.json: d76d7681d88b95bd9e63605ff6e4773f84681c1f6aa7aa5f139bc669db59b79d
- identity-before-comparison.json: 178a41c43efcd5f330e72a653b7b6d955b546151be920abbcdc9217bce4381d7
- identity-after-comparison.json: ef9ad170f70f840f54f462249b1e933cc803fe4ff54b1ed93c0b64d58b04534c
- baseline-commands.json: 97ef56a8e921188d6b08d5e370140767f50123a19716b6f94bb6b10190ce672c
- commands-safe.json: 44ecf410363e974b7e3ec657996ccd02e72b6eb0eb5ec304ed783e1c735654e5
- command-13.json: 141db0584a975c38823333ce3af9da0d6757661889c84293400bd9526c815a46
- preflight-receipt.json: 7887504cf9c9c10579be648e5e93cfdfa6ed4437c1dc0bfd2f3043e6510d10af
- firewall-before.json: 565594f144e0431cf82178304760f84de145492a6935ae29184f2f3a13799090
- final-host-review.json: 269746e1df9c216b6f03f88ca2c993814049ae261c4134a40f62750f1034b338
- supplementary.json: b83d3a5a8777403befe0178c6a5e3856e9e08c484e2441391dac19d82386a52d
- tree-closure-diagnosis.json: 0479b95138b42c499fb6dbfbb45245bc5fca4b27126bc17b3a16d2e66a8a97b4
- preparation-review.json: ca9d415eeda842622e7f54c72a8a42c2243076668dbd3b30716ec09d9290a145
- reuse-exclusion.json: 8d95acfcec2f686b6d976dd7784ae83e7401fffc7af30516d6e3fd112a24ba75
- provider-import-command.json: cc458082d11c5bbb0b865c14773ccae3fa0bcccce3f71bff28dc479e23a9cad7
- provider-import-proof.mjs: 87965c7b0f5513340051983877ef8967c1685411c85eed338e54f81ee8bfb430
- provider-import-generated.py: 24956719950f1ee2d7b0826d5c04d51ce2a68cae76a800131226298d868c58f1
- provider-import-command.log: 2d68b6b1fc3156f01090639063a0f949ba9c2908f558d55579b22b36d3469017
- provider-import-diagnostic.json: f4b89a6d197927baf7e11373c0ad8a5f0221298fb2b9d16bd3507b5449b15e01
- provider-import-network-diagnostic.json: 74df8ba47b4e998688c19453bdee664ce4464094536776417fcc0fcd8ccdffd5
