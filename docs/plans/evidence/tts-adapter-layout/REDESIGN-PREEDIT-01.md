# Validation Report

> **Sanitized publication copy.** Personal paths are redacted; report IDs,
> results and validation hashes retain their historical meaning.
> Original SHA-256: `3b1e028fbd1d93cf9b988271f8632c4d643f91d3a8dc69671c7c235b129ab9c9`.
> See [publication and original retention](../historical-privacy-cleanup/README.md).

Report ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-PREEDIT-20261011-01
Target ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-01
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Ending HEAD SHA: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362
Validated paths: original closed35 migration paths, enumerated in before.json and below; proposed redesigned edit subset is apps/desktop/scripts/tts-adapter-layout-host.mjs, apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs, docs/development/tts-service-organization.md.
Validated path identities: before.json captured independently before the three commands, using exact porcelain-v1 status, SHA256 and filter-aware git hash-object --path; after.json rechecks them. Source35 and protected260 identities equal immutable report03 after.json; artifact25/new2031/old2037 full trees equal its artifacts-after.json, independently rehashed before and after. Those exact retained manifests are integral references, not substituted test outcomes.
Identity recheck: PASS. HEAD/index, all35 source paths, protected260, artifacts25, frozen2031/preserved2037 and five draft/evidence authorities unchanged. Zero mismatches. Before UTC 2026-10-11T13:37:00.292290+00:00; after UTC 2026-10-11T13:39:29.278697+00:00.

Scope of PASS: the three specifically approved pre-edit deterministic commands and identity continuity only. This is a user-authorized redesign within the SAME unaccepted atomic migration, not a new clean unit. Current source paths contain the documented worker patch. The clean-unit original BASELINE-01 PASS remains historical authority; current source cleanliness is not claimed. POST-CHANGE-03 remains FAIL and the known copied-provider/candidate failure has not been repaired or reclassified. No candidate or end-to-end PASS follows from this report.

Commands and outcomes:
1. `pnpm.cmd format:check:typescript` -> exit0. All matched files use Prettier code style.
2. `pnpm.cmd lint:typescript` -> exit0. eslint . completed with no diagnostics.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit0. 54 Vitest files, 588 tests passed; 47 Node tests passed, zero failures/cancellations/skips.

Repository root <REPO_ROOT>. Process-local PATH prepended C:/nvm4w/nodejs/node_modules/corepack/shims; pnpm --version actually returned11.15.1. Process-local PSModulePath selected C:/Windows/System32/WindowsPowerShell/v1.0/Modules. All three commands used require_escalated normal local PowerShell; no sandbox acceptance evidence, modified harness, provider import, model load, native inference or host mutation occurred. commands.json records exact outcomes and underlying tool-output chunks. These tests produced no new source changes.

Diff scope: PASS. No delta in the closed35 versus the preserved report03 source manifest. Parent35 migration remains 2983/3000 additional lines at this pre-edit checkpoint; no new redesign source edits yet. Separate director coordination documents are preserved. Audit draft permits only the named3 paths, <=400 incremental lines and <=3400 whole-unit lines; this report does not accept any future patch.

Invariant review: PASS for pre-edit continuity only. Current protocol/service/adapters/package authority bytes are unchanged; existing lifecycle, exact identities, closure/link rejection and bounded PCM assertions pass. The actual bootstrap still groups subprocess.Popen/os.system with socket events and raises RuntimeError. Actual copied NumPy check_support_sve catches only OSError. Existing report03 proves the import failure. Redesign must preserve unconditional process denial while correcting classification, strict admission accounting and cancellation/shutdown evidence. Real copied imports, all four fresh candidate arms and new-policy guarantees are untested here.

Test-integrity review: PASS. Existing desktop/Node tests and their assertions were unchanged before/after. All588+47 passed. Current Node tests do not exercise the Python audit bootstrap; that missing boundary coverage is an explicit redesign requirement, not inferred coverage from this baseline.

Privacy/artifact review: PASS for unchanged identities and deterministic scope. All25 bound artifacts and both complete frozen resource trees were rehashed, with no drift. No book/audio/model/secret payload or unrelated source edit was introduced by validation. The proposed3 edit paths are runner/test/guidance; generated/package/model bytes stay frozen. Complete fresh-candidate privacy/cancellation acceptance remains unproved and blocked as previously reported.

Host prerequisite status: BLOCKED, separately from deterministic PASS. Director reports elevated offline preparation was cancelled and task rules are absent; no new firewall PASS is issued here. Original8 rules must remain. Fresh exact interpreter firewall prerequisites must be independently verified before any copied-provider/model/native inference. No such execution occurred during this baseline.

Original baseline: TTS-ADAPTER-LAYOUT-01-BASELINE-20261011-01 PASS, retained docs/plans/evidence/tts-adapter-layout/BASELINE-01.md SHA256 91318f776e2dd4258890b8e8746d786c3fac3f98bd42b61f31f0a8aff3680079. Its10 pre-implementation checks/clean-unit claim is historical and unchanged.
Known failure: TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-03 FAIL, rawSHA256 5816b64b3a2d9e83ba425e68788f415cc1aac79789f2eeaf3805bb882c0edef4;21/22 prior gates passed, candidate failed. No commands from that report were counted as fresh executions here.
Draft audit SHA256: d28008d4ce560edde1d38642fa28a2b3e3729c0d5afad686cab9d5f3b0253e52.
Parent WO-01 SHA256: bf7ce6019bfe47fe6ef41d195bb33cae1406b294487c185258b6199aec58b5fb.
Worker correction02 packet SHA256: a142b96b1f99f18141abada2b7335f6766bbdaa7e27041619945762979236b9b.

Action required: Director may freeze only the accepted bounded runner redesign under the preserved original baseline plus this fresh deterministic PASS; current owned patch is explicitly retained. Keep copied-provider/model/native execution blocked until fresh independently checked firewall prerequisites. After worker freezes changes, issue a new full post-change report running all22 commands plus actual-policy/provider/closure/history evidence against new identities. No staging/commit/publication authorized. Validator is idle after issuance.

| Path | Exact porcelain status | Worktree SHA256 | Expected index blob |
|---|---|---|---|
| services/tts/src/voxleaf_tts/piper_adapter.py | [" D services/tts/src/voxleaf_tts/piper_adapter.py"] | DELETED | DELETED |
| services/tts/src/voxleaf_tts/chatterbox_adapter.py | [" D services/tts/src/voxleaf_tts/chatterbox_adapter.py"] | DELETED | DELETED |
| services/tts/src/voxleaf_tts/qwen_adapter.py | [" D services/tts/src/voxleaf_tts/qwen_adapter.py"] | DELETED | DELETED |
| services/tts/src/voxleaf_tts/fake_engine.py | [" D services/tts/src/voxleaf_tts/fake_engine.py"] | DELETED | DELETED |
| services/tts/src/voxleaf_tts/adapters/__init__.py | ["?? services/tts/src/voxleaf_tts/adapters/__init__.py"] | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 | e69de29bb2d1d6434b8b29ae775ad8c2e48c5391 |
| services/tts/src/voxleaf_tts/adapters/piper.py | ["?? services/tts/src/voxleaf_tts/adapters/piper.py"] | 844d55f64992b620a2f1f708b26a699e6935eff9f8e7c6e9524f98ce45ed209c | 1ba3ffa3352e0a9afde4a23841050e81335f97e1 |
| services/tts/src/voxleaf_tts/adapters/chatterbox.py | ["?? services/tts/src/voxleaf_tts/adapters/chatterbox.py"] | 6896d06cdabcef5f774f9a251f6d5eeb4b2474a8c27b626aac2da43c9555d669 | 159b2b8dff183285efa901c149dd33d9cc5a28b0 |
| services/tts/src/voxleaf_tts/adapters/qwen.py | ["?? services/tts/src/voxleaf_tts/adapters/qwen.py"] | 2940be2d31beeeb78d2a718d767a86f48806bca39961795f5be82d47fc2c06d5 | 4f93451abbd7108ac5e225e48ba73ea87bf82785 |
| services/tts/src/voxleaf_tts/adapters/fake.py | ["?? services/tts/src/voxleaf_tts/adapters/fake.py"] | 1863c0e3e1617b71cd9ca9d647aed05e6384ec71f33ef6e47221983a6fbb8023 | 3c16e17b14792b9c823647541e072495601523bc |
| services/tts/src/voxleaf_tts/service.py | [" M services/tts/src/voxleaf_tts/service.py"] | 528992e393e225475280007f622bd764dd0dc7d89329ddc1ba897bb7c7c06bd0 | 77ed1f9bb7d084b82c7277e4743600233022af9d |
| services/tts/src/voxleaf_tts/piper_service.py | [" M services/tts/src/voxleaf_tts/piper_service.py"] | f5816615cc220661f217f1f5070ea6ff6d6d02d1661f88594de2b60c79949980 | 3e0a12c41f23c11aed4ba5db7eb67277f68f9ebf |
| services/tts/src/voxleaf_tts/chatterbox_service.py | [" M services/tts/src/voxleaf_tts/chatterbox_service.py"] | 81ec218ca9e786af43acae14310c8cf00ae33cd3e776e41958cfd456b6221777 | 02eaa22a6af1d8e043f8bc57794d4ab0d5fe9123 |
| services/tts/src/voxleaf_tts/qwen_service.py | [" M services/tts/src/voxleaf_tts/qwen_service.py"] | 64b1ed77e177c9267192154e8f47caae71f67a38cd3d05c854b5c9270e246531 | 4633a66738c1ea4d8a884fdfc012c4737436e542 |
| services/tts/src/voxleaf_tts/release_core.py | [" M services/tts/src/voxleaf_tts/release_core.py"] | 765fc7e288b103e006ee660085d86846f258fb77b82b87873b2e900feb688980 | d8c55e2fa7f187a8536e9c1aa9c5bab10e582832 |
| services/tts/src/voxleaf_tts/release_chatterbox.py | [" M services/tts/src/voxleaf_tts/release_chatterbox.py"] | 975f459e5295c16483aa9ede24d0fa684a202b3d2ee6e850e25c39f3781d9fea | 8c18de68bdd771ad63ecee079440bf4d789d24e9 |
| services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py | [" M services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py"] | 1b8b2b885762d0f6159662f96ec955b3f40a0b8c0c81bd027ef0676b38fe9ec0 | 09784d179ea7d7e30713622c5b54f7f063439e3a |
| services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py | [" M services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py"] | 10486a491fab9fa13f6776c8b2e9a8e5412aab69b76daad28821d0a353c43e55 | 4e50216b578a98b5d71ac39ebd13add8ef08de99 |
| services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py | ["?? services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py"] | 294d6a53af9af5da947f689c4eaae4e2d41caa036a20d6ac5a15bddab35cf4a6 | f8ddbf3c2a4c45ae3da785b8eafb8bfd77300fbe |
| services/tts/tests/test_piper_adapter.py | [" M services/tts/tests/test_piper_adapter.py"] | 128fdd5ba6f93b25b971344c6ba68574d4689ea1c72758bbfe64ff5e366cceef | f1421bde1dbe89be21564c8887d807ebe140bd05 |
| services/tts/tests/test_chatterbox_adapter.py | [" M services/tts/tests/test_chatterbox_adapter.py"] | b2524acb6634c291a76b86ef1fe9755eedb723f543ffccb065ca154e5fb8b029 | 5717875d6d8448609518d294004494e5cb79cce6 |
| services/tts/tests/test_qwen_adapter.py | [" M services/tts/tests/test_qwen_adapter.py"] | 3fa73106f377915e13baa3cfa3afe9d891c32db89a9408bf1c1882a3f246834e | debee220256d45897a3f52d055859952e23ce5d4 |
| services/tts/tests/test_service.py | [" M services/tts/tests/test_service.py"] | 63a818b727dafe05dc14d1e3b7a2f2670f4279f506bf5510c7f1a517f51bc993 | f7a00fbb36ba9910dc15a4a7f6557e5efb4120e0 |
| services/tts/tests/test_release_core.py | [" M services/tts/tests/test_release_core.py"] | 0dcec8a5eb182155e947ce0e4a021fda620d53b1abaad28cccba1b6174d839f0 | 898e5b8bcc6dbf49e994481e94ffadd62604e421 |
| services/tts/tests/test_release_chatterbox.py | [" M services/tts/tests/test_release_chatterbox.py"] | 207ac9831962ade69f0385b6d3bca2a56d7cebc22c440f71a38a0c7a8654bc81 | d5803ce1408f6e721dd428834c686a8ce9fca6ea |
| services/tts/tests/test_chatterbox_sources.py | ["?? services/tts/tests/test_chatterbox_sources.py"] | dd706bef238d6bea965d9c1f0d2de7125822613b59ec820a6b36bb07b1f601d6 | 0f98c442a0309896281c711e55c145857529850f |
| services/tts/tests/test_adapter_layout.py | ["?? services/tts/tests/test_adapter_layout.py"] | ff870f22736f5b625a3d503b3f957e8e594fb602505b9fcb7ac7ebf49a04d3c2 | 3c8d70f3c5c59c544453827622746850114b6935 |
| services/tts/release/core/runtime-manifest-v1.json | [" M services/tts/release/core/runtime-manifest-v1.json"] | 3b03502031c188b5aef5c983859a93f506509648a2ddb35dcfec402877398062 | 4d348f5a8aa01caea12afcbb1bbe2385ae534d1e |
| services/tts/release/core/core-package-evidence-v1.json | [" M services/tts/release/core/core-package-evidence-v1.json"] | e46ed9afe2ed06a6c2d847473a6cceb6cc631378289055a4a691357db11a6a8a | 58bab708db7ab389a87fff51534f6fd2abfa08a1 |
| services/tts/release/optional/chatterbox/source-manifest-v4.json | ["?? services/tts/release/optional/chatterbox/source-manifest-v4.json"] | 76741c983f4e7263ffe03ac728eb80cd4cc0bdc13eda4f4dab55aa4996cbb284 | c389c99b2af67e5a2b9f6835887286f1f9b4e1b7 |
| apps/desktop/src-tauri/release/windows-package-evidence-v3.json | [" M apps/desktop/src-tauri/release/windows-package-evidence-v3.json"] | f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad | 7ccede05fcac4f562720b03c2085fa2bad1084be |
| apps/desktop/scripts/tts-adapter-layout-host.mjs | ["?? apps/desktop/scripts/tts-adapter-layout-host.mjs"] | 45a995b38eb53a150ec7434d9bdea66fdc3204dc0f7b7c2486c0092cd8254de9 | 930f025649d667e4eec6a94a76bbe3d26bfa9e9c |
| apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs | ["?? apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs"] | 9c309841d7540ae2eb939c5c0ab73947f74caf9a6a9d1df6606620420ff14f34 | 7e14011a7bbee83caae14849be4109f6c467cf3d |
| apps/desktop/package.json | [" M apps/desktop/package.json"] | 52f30bf20748028ff3e9dd97a197c4193cbe6572aea3aea3d4a4bd86a123c3d7 | e0aad3012a5902bb274e0230e47998c43af8d541 |
| package.json | [" M package.json"] | d56217dc1693231f9bfbd422d30afe228d28564068d32fafe747e06d4fd792eb | fd9e98b5009c9b58386cf886e752c1ab0df775f8 |
| docs/development/tts-service-organization.md | [" M docs/development/tts-service-organization.md"] | 5d3f109ed597817db99a6e3b044dc01dd1281a5586da669a4e8b957369b8ec73 | fa6b9a7d707eaa959b6b3581f19526aab406e790 |
