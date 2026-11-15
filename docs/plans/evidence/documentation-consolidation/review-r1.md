# Change Review Report

Review ID: **DCRC-CR-R1-20261115**
Task ID: `documentation-consolidation-and-review-closeout`
Verdict: **CHANGES_REQUESTED**
Base commit and reviewed HEAD: `dc49167487c7071948a341eb3dbc454a4b2841cb`

Identity recheck: **PASS**. The supplied 24-path manifest and the 18 supporting paths below remained unchanged during review. HEAD remained unchanged, the index remained empty, and the actual changed-file set matched the request. No files were edited and no tests, builds, formatters or Git mutations were performed.

Acceptance review:

- Reviewed the policy change under the incumbent `HEAD:docs/development/agentic-change-review.md`. The proposed wording does not waive its own approval.
- The eight workflow scenarios preserve independent review, required implementation-before-archival approval, current supporting-input evidence, staged-blob verification, substantive review of consequential documentation, refactor validation and broad-audit obligations.
- Native selection, configured commands, CLI dispatch/defaults, regression assertions, manifests, inventory and ADRs support the revised v7 guidance. The v2 packaging default, v5 smoke default and retained v6 probes remain explicit.
- Piper 1.8.0 / ONNX Runtime 1.31.0, frozen Chatterbox service identities, cleanup-only historical packages, C05 deferral and unverified complete v7 HTTP delivery remain distinguished.
- Git ancestry supports the changed incorporation summaries, including #316 and #276. Historical runtime and CI results are not presented as fresh validation of this checkout.
- Consolidation retains existing evidence routes and affected headings. No executable source, test, configuration, packaged guide, frozen authority or existing historical receipt changed.
- The actual archival candidate remains outside this implementation-stage assessment.

Test evidence reviewed: **attributed coordinator host evidence**, supplied for the matching R1 inputs:

| Command | Reported environment and outcome |
| --- | --- |
| `pnpm.cmd check:evidence` | Normal local PowerShell, pinned pnpm 11.15.1 through existing Corepack shims; exit 0 |
| `git diff --check` | Normal local PowerShell; exit 0 |
| `python tmp/evidence/documentation-consolidation/validate.py` | Normal local PowerShell; exit 0 after the recorded UTF-8/CP1252 inspector correction |

The inspector source and result were inspected. They report preserved headings, 75 baseline and 75 current static link candidates, zero introduced candidates, new-file whitespace inspection, an empty index and the complete changed-path allowlist. The initial decoding failure remains disclosed. These checks do not establish runtime acceptance or prove that every static candidate is a broken link.

**Finding DCRC-R1-F1 — P3, confirmed documentation-state inconsistency**

- **Location:** `docs/plans/active/documentation-consolidation-and-review-closeout.md:294`, **Final validation results**; related milestone 4 status at line 211.
- **Trigger:** A contributor reads the active plan to determine completed work and the next acceptance step.
- **Consequence:** The current results section says “Implementation: not started,” while the opening status, milestones 1–3 and preceding execution results describe implemented changes awaiting independent acceptance. Milestone 4 also says “implemented” although its implementation approval, archival candidate and final assessment remain pending. The plan cannot consistently communicate the current handoff without chat context.
- **Evidence:** Lines 143, 162 and 186 record implemented work; lines 285–291 record fresh execution checks; lines 294–296 retain the unqualified planning-stage status. The actual patch implements the documented consolidation.
- **Bounded correction criterion:** Label the original planning checkpoint explicitly historical or replace its current-state wording. State that implementation and initial document checks are complete, implementation review remains pending until approved, and archival/final acceptance remains pending. Keep historical planning results and the two-stage approval requirement intact.

Remaining uncertainty: No additional actionable issue identified within this documentation/workflow scope. Installed runtime versions, complete v7 HTTP delivery and C05 successor-runtime parity are not established by this review.

Required next action: Correct **DCRC-R1-F1**, preserve this report unchanged, rerun affected document checks and request a new implementation assessment with current identities. Prepare the archival candidate only after implementation approval. This report is neither a refactor Validation Report nor authorization for Git mutation or publication.

The original request record is `tmp/evidence/documentation-consolidation/review-input-r1.json`, SHA-256 `97f475626c996da5f7fb25691ff6613de6db581cbc210d204f03ac26a69ae540`. Its original identity rows are retained below. Supplementary identities are the unchanged supporting paths inspected by the reviewer.

Temporary inspector SHA-256: `39254b4ab138a9e12113d525a24be338764abba899b5c11d4ead828c2fad4f66`.
Original check-results SHA-256: `d0ce295e6f378b22f7d188164187c5e1057778821afb8913864370f31b0259b8`.
This report is outside its own manifest.

## Original supplementary identities

All statuses unchanged. Fields: path | SHA-256 | filter-aware blob.

```text
docs/product/mvp.md | fc5fba770ed937bcef277c0ad4f9dbf4713563283f36ce38dc3efea784400e04 | 64a6fdcc385f920c2a801bc3918e773557aa87c9
.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md | a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae | 16ba1a7002366ad9312223d51dace7902d6ae751
.agents/skills/validate-safe-refactor/references/validation-policy.md | 7686223dafc5a5095f5e3a5d0a1f28604fa9260a2ed62b5c8de5ed3288a6faba | f7a1f5fbf5a2473a121e675e245110fcf4025aa4
docs/development/findings/README.md | f8b8ec90ae9aceb2694050bca158cc8374afc5ebd220b8f8df1075eb11bb83dc | d389da823a8d5d44a0d046919fe137c2466a365b
docs/plans/evidence/development-guidance-and-command-clarity/review-final.md | 307393a84ad60935a5acc62be344083b3adf07a9d196bb449e9858d1a9841bd3 | 9804ab6f80e5ab3ad0eb5dce8223ab2cea5a2914
docs/architecture/decisions/ADR-0064-admit-msgpack-chatterbox-v7.md | 954fb585edad28fabf9e6f211defe5dfc1d397912b0a038f873c7dc5cc0a5eb1 | c186181ffad8cf3ebd66f49a1532f31bcf1fe446
docs/architecture/decisions/ADR-0055-onnx-131-offline-runtime.md | 5cd89055d0df9fcde9b0512d7ab07f024b873dfee19d492f51f57357ec7ca174 | a29d85cf4060fbe74c06c271a0947a983e2ea5c9
docs/architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md | fcb60ff743e7d8500c13ad003e7b9a12ac90862f7be75827f6dc22d3665d4a68 | 0a6cc045930bc8973a73a91c088e21555fc23467
docs/architecture/decisions/ADR-0068-align-chatterbox-effective-ram-admission.md | c9edd9d764aec51e2ca53e88ca7b2474cab86fb878c90555cf46d908183a4364 | 881bdecd90303bbdbd5bd0eeacae8419a8114abe
services/tts/tests/test_chatterbox_v7_preparation.py | 66787421a86124922aa54ce8e2605de1be0c1080d104d6bae69280e46dfc276f | a765665881f37fe0c68e748fc96b97508ea6cae4
services/tts/tests/test_release_chatterbox_cli.py | c8c2d6df96abfeaccddd25f48d34aa06077ff7b28ebd7957bfdc1d0388399781 | 215647e47159079852fd7491e6b7235ab54572be
scripts/release_inventory.py | 3413ad5e68780efba27025ea64fb0294ecdf3dc054b8eb1e8ffdc5a8f9515d54 | 3f486c22c7df8f8ca601fde539d0048a3e462b91
scripts/check-evidence.mjs | a6e942d6a55262790d4e101d888562249a4ba3e8c0d9d0b64147ce62de1fae0d | 47e1e4ecdde2bda6cf15b50ce41ee45569819ae0
.github/workflows/foundation-checks.yml | dae116f90e7a703f0959680ee9fe5d2bd34b7fa62b68b43dd5060a3b82784f85 | 0ddef04e6390a01dbbc7290cbc446071b73a7925
scripts/test-chatterbox-v6-security.py | bfb86e3952f1d3fe623d20f5dfc65a8292e768db82819b84d682fb4397fa92ca | befb98cede083dfc233f13eb6319f3ef6252f3ba
scripts/test-chatterbox-v7-security.py | 1985fade546b2ac6df1d657d6f7410b1cfa10572d99db911d514c5e98a3e38e5 | a407a591e73e298f98c9d390416019e25e4a9a33
scripts/test-chatterbox-dependency-security.py | fa3f518c62e01ed05a40be411ab3f6382faf79ae4471e25008630896adb54663 | b197ffa5b6e648b3cbcac184bed975584330ba2a
docs/plans/completed/chatterbox-msgpack-security-refresh.md | 14ab0f9e4a420eb77c1b02996b545cf0b5c46f117d418124ba6092fe029ab396 | 8fb32d8a7a38ed107011ccad3df3b89a61a94fb8
```

## Original request identities

```text
.agents/PLANS.md |  | 39bc9da6577b867a4e70e81d7030ad836d4d1bcf789890877c5a526699ecd7bf | 56f8ff2a36a973725ad5d1698c26df765dad2434
AGENTS.md |  | f96a54e1b4a058c5124a19860e413862aef1724bd0f649162ffd904c411250a2 | ab4fa6afb798ae2766c03099c2be7c6ca9477c96
apps/desktop/scripts/windows-release.mjs |  | 9669068ea7e8ae14a3b2eeabb088b8c4ca51c4dc63f4937a2f0a394025fded9b | 4641f52538027ad948e1da7f3bdb67529dd5d253
apps/desktop/src-tauri/src/tts_optional_chatterbox.rs |  | 69028596e118ee59c3504a4b3190138a8d33667c583f2b4fe3009e6b99d6daeb | 365dc67a9000ae09060ffa17b10bd0fc6ca320eb
apps/desktop/src-tauri/src/tts_service_supervisor.rs |  | ea58307c22d472a59126b8549b29cba6750be253a43b49ffb5b8069af39ce5b0 | 8f52e484c9c3effe0d03f7dc7fdf8cd58387eb60
docs/README.md | M docs/README.md | 8b01021bacb9915700695901c12ecd566ff465541f50ea685fd45f40e6c55839 | 00ff843500927aa68a5c193259ff8b1f4d670c7a
docs/architecture/overview.md | M docs/architecture/overview.md | 35b5efea4122bb0969e42c76009d1d8b656eee0f10f8855bb3e555126df12c56 | fe50c6e18848bbb1fa9be965abbb51ee4f1ab6a8
docs/architecture/system-diagram.md | M docs/architecture/system-diagram.md | 2b1e5371a00f4d2262140fb5baf0e58fb31dd81a843080e5adee53c66e0a89b8 | 3a26f23c23cc77a99af93f53d66e644443ca8c40
docs/architecture/tts-support-matrix-v2.md |  | d8063a1c6f4a9d32f61f68c3772b89b9fa196e30dd98b124cd9f47a74026241e | b15e43aa8d3364f2e1245eb5e384db972ec035b8
docs/development/agentic-change-review.md | M docs/development/agentic-change-review.md | cc55b4f71d3e16e0085582416402bf25e337e059099d399b890b3e9e44ee8012 | 0b494c89a2dd4afa04f24281b724572002c7d0e5
docs/development/dependencies.md | M docs/development/dependencies.md | 6ff4fa73ca47269b2a221aeab1e1b8454279462eb0c828d749145c4ba0b5dff0 | 3bb415625024cc08104ebe351bea062145f9d9f0
docs/development/evidence-retention.md |  | 5b5c1af58a90612736c9e195f1b12e9d6add01098befae708ccb58ab7f29db58 | 010a798e0f6d4237e9f0eaa98dd3079d1bbf1db2
docs/development/setup.md | M docs/development/setup.md | a7e7a59e6495a90c83f78388e1f8f42b21af179d117b26a3ae9282189960fd51 | 0aaa2879f5a666215dbaa0579ca173204e62da96
docs/development/testing.md | M docs/development/testing.md | 1e1f71c61eb71689612f52e3306f9cfbe628d5eceac5f5049581ab848bccca84 | 3afb3e78cb8956a2eb2c3a497901eecd5f547ec8
docs/plans/active/README.md | M docs/plans/active/README.md | 6031db5128c0a14f02a3c268f75d99e82b3fa7183d32897039bf58d2e5c5ce2d | 7ae7bf46e99e0f23c1c245241724d7594bcfe210
docs/plans/active/documentation-consolidation-and-review-closeout.md | ?? docs/plans/active/documentation-consolidation-and-review-closeout.md | b8a144e7eb28775347490dff06a47e48d35f4f92ce210e6a8363b09345b219dc | 94647273b05c3b6be428001c26675901667ae0bc
docs/plans/completed/README.md | M docs/plans/completed/README.md | 9060f5c52b1b962e509c20302f60bf1d636c84cb44acd3df8757271f89699143 | 2f19af509a011c04e528fc60878038a56aa29e09
docs/plans/evidence/documentation-consolidation/acceptance.md | ?? docs/plans/evidence/documentation-consolidation/acceptance.md | 09005e2c5cd77a2694dcbe88960fcb89338a7c5ab2c120f42e72f4f8073f72d8 | 338da88a65b9581b799e7d0903d304a497c54d8c
package.json |  | 281985a40e13157ad0beb0d97a77069ee550dd01fb6a76982a0a72aaad7e1802 | 456aa25d08d5b1ce39c76fd307216cabbf75fa15
scripts/test-chatterbox-runtime-smoke.py |  | a1a4cd41d0aeab8ad63080846731e1441ce6fd609383810b581645032ffbaf25 | 3c871b593b50f43f735ff9e36f768adacd4ef53f
services/tts/release/audit-policy.json |  | cce618c11cbebcb1249ee5f6e555d132f55964a4782e42cac1af636b725cd164 | 1a1ace837f0e1d70bfa410d872c9ce45f5033298
services/tts/release/core/source-manifest-v1.json |  | e04b83230117a8def052053bc2a71df91fafa7a45dfe6180c184403fc1136044 | e64b863e7961dc95cc9f49b7ee5807b6a953a8e5
services/tts/release/optional/chatterbox/optional-package-manifest-v7.json |  | b398ba1ab7144f920d9d6ddcece57afc1646280121104b7ddf509e66c2585dfd | 21dd0fc16005f10c20b8855e2cdbfba7340a758b
services/tts/src/voxleaf_tts/release_chatterbox.py |  | 4de3f9df71d16625607a8080d28dd7be293da372c0291a484412c3fef4b7d11b | 6fe1879d823881c398b76d30bae112d15d6588cc
```
