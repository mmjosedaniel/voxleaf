# Change Review Report

Review ID: **CB-V6-PREPARATION-R1-ASTRA-20261024T022023Z**  
Task ID: **CB-V6-PREPARATION**  
Verdict: **APPROVE — preparation scope only**

Incremental base and reviewed HEAD: `4dab0baea2d462e1b7b84206f7a5f39517f4cdcc`  
Full PR base: `26ecd6cd6d678e541f6569d8d45661887942ad6b`  
Branch: `codex/confirmed-logic-bugfixes`

This independent review approves the exact local v6 preparation patch and candidate described below. It does not approve publication, production admission, installed/native acceptance, the overall security-refresh plan, or the global release audit. It grants no Git or publication permissions.

## Reviewed scope and identities

The closed source manifest contains **48 paths: 16 task paths and 32 unchanged supporting paths**. Appendix A records their repository-relative paths, roles, porcelain statuses, SHA-256 values and filter-aware Git blob identities. New files were inspected by full contents.

Reviewed source-manifest SHA-256:

`dfa0e5308ecf153bc3b4a3328cc035f0a376243f89e6c46ff8b8c4d71f21bd1d`

Complete candidate-diff SHA-256:

`bc9b0ae4fa27b8ef2439e05e5139c49df766c8fd88d7cb46c8405c7fb9abdfd1`

**Identity recheck: PASS.** Before and after inspection, all 48 source identities matched the frozen manifest. HEAD and branch matched the request, the index remained empty, and worktree changes matched the 16 task paths. No unrelated source changes were identified. This report is excluded from its own manifest.

The reviewer inspected source, tests, documentation, supplied host evidence and artifact identities. The reviewer did not edit files, execute tests or builds, mutate Git, or delegate.

## Acceptance review

The change provides an independent v6 lock and recipe while retaining existing version defaults and historical authority. Of 79 dependency entries, only filelock and setuptools change: `3.32.0 → 4.2.1` and `83.0.0 → 84.1.0`. The remaining dependency requirements and hashes are preserved apart from generated provenance comments. The frozen v3 service modules, Python identity, six model identities and Torch/CUDA requirements remain unchanged.

The builder applies v6 hash-required synchronization and rejects `--no-sync` before source or output access. Source resolution verifies historical Git blobs rather than falling back to current service code. Local receipt verification retains source, lock, runtime-tree, archive-member and ordered-part checks.

V6 acquisition and reconciliation commands fail explicitly before reaching historical acquisition authority. The patch does not switch production selection, rewrite v5 publication metadata, suppress advisories, migrate installed data, or admit v6. Documentation consistently identifies the package as unpublished and unadmitted.

The ten new preparation cases exercise versioned output isolation, the exact two-pin dependency change, required synchronization, frozen sources/models, recipe drift rejection and unpublished-command rejection. Existing invalid-version coverage moves its sentinel from 6 to 7 because version 6 now has explicit support; the rejection assertion remains intact.

The security probe exercises real setuptools wheel installation with synthetic inputs. The vulnerable baseline produces the outside-destination write; the candidate rejects the tested invalid namespace forms while retaining legitimate wheel and Windows locking controls. The evidence correctly distinguishes that Windows result from filelock’s advisory-specific POSIX path.

No actionable correctness, privacy, authority-selection or regression finding remains within this preparation scope.

## Host evidence reviewed

The following results are attributed to the coordinator’s normal local PowerShell execution outside the managed sandbox. They are not tests run by the reviewer.

| Evidence | Reviewed result |
| --- | --- |
| `pnpm.cmd test:chatterbox:v6:preparation` | Initial expected red: 10 failed / 98 passed. Final green: 108 passed. |
| `pnpm.cmd check:portable` | Exit 0: shared 209, EPUB 674, desktop 818 Vitest + 97 Node, Python 629; formatting, linting, types, generated contracts and portable builds passed. |
| `pnpm.cmd audit:chatterbox:v6` | Exit 0: no known findings in 75 audited packages; four URL/CUDA dependencies explicitly skipped. |
| `pnpm.cmd test:chatterbox:v6:security:baseline --temporary-root <isolated-root>` | Expected exit 1 after reproducing an actual synthetic outside-destination write; legitimate control passed. |
| Configured builder invoked directly through `uv run --directory services/tts --locked python -m voxleaf_tts.release_chatterbox build --package-version 6 --output-root <extended-root>` | Exit 0; synchronized and assembled the exact candidate. Earlier alias/prefix failures remain documented. |
| Same configured builder with `check-local` after the runtime probes | Exit 0; reported current, unpublished and unadmitted package with matching receipt. |
| `pnpm.cmd test:chatterbox:v6:security --temporary-root <isolated-root>` using the assembled interpreter | Exit 0: five invalid namespaces rejected, four legitimate controls passed, zero intercepted network attempts. |
| Existing runtime-security and dependency-security probes using the assembled interpreter | Passed: three security cases plus two legitimate controls, and seven dependency-security cases. |
| `pnpm.cmd test:chatterbox:runtime-smoke --package-version 6 --models <verified-local-models> --language es` | Passed: finite, nonzero bounded PCM representing 4.12 seconds; cancellation 422 ms; zero intercepted socket attempts. |
| Same smoke command with `--language en` | Passed: finite, nonzero bounded PCM representing 3.64 seconds; cancellation 484 ms; zero intercepted socket attempts. |
| Final `pnpm.cmd check:evidence`, `format:check:typescript`, and `format:check:python` | Passed on the final frozen source. |

The pytest cache-write warning and Vite bundle-size warning did not conceal failing checks. Runtime logs retain their dependency deprecation and unavailable optional tokenizer-mapping warnings; the tested ES/EN arms nevertheless completed successfully.

The runtime probes exercise synthetic text and memory-held PCM. Their observations are not substituted for installed application telemetry, sustained playback acceptance or a complete filesystem/network monitor.

Historical CLB, installed-v5 and earlier native evidence is not reused as proof of v6 installed acceptance. Current unchanged source identities justify retaining historical authority; they do not establish execution of this new package through production acquisition or the desktop application.

## Exact local candidate

The reviewer independently recomputed the ZIP, part and runtime-manifest hashes below and found them consistent with the supplied local receipt and plan.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Combined runtime ZIP | 5,031,350,467 | `2567feb51cfe7816281b0eb936c4358dd980458def8ddd5508ee603930aecafb` |
| `voxleaf-chatterbox-runtime-v6.zip.part-001` | 1,900,000,000 | `3963d4091e1c5baeb7485589251330e69af0dd06ff9a4c0f0561fcde993ab73a` |
| `voxleaf-chatterbox-runtime-v6.zip.part-002` | 1,900,000,000 | `f99c82953ea5bce559b1e00efcee09d264ff2ce369eb0ee622b6595706cd3676` |
| `voxleaf-chatterbox-runtime-v6.zip.part-003` | 1,231,350,467 | `5312398ef84a43d4c0dd8eec30d878e52bbf4390108b13eb7a52e4de38aca56e` |

Runtime manifest SHA-256: `bb902682e366e119e3a7cdc992440b017bd6bd96cf328c3b0863a4eb1eb024e0`.

The receipt records 13,092 runtime files and 5,027,792,395 installed runtime bytes. Its source recipe and dependency-lock identities match Appendix A. These identify one exact assembly; they do not establish cross-environment reproducibility.

## Findings and remaining limits

**Findings: none.**

The following remain outside this approval:

- V5 remains admitted, and its reported dependency audit remains blocked. Candidate success does not remediate existing v5 installations or make `audit:release` pass.
- The candidate audit does not cover the four explicitly skipped URL/CUDA entries: chatterbox-tts, resemble-perth, torch and torchaudio.
- The advisory-specific POSIX filelock exploit was not executed on this Windows host.
- Publication, public asset readback, v6 acquisition/admission, installed/native behavior, final integration checks and CI acceptance remain pending.
- Release parts remain local temporary artifacts. Their existence and hashes must be checked again before any authorized publication.

**Required next action for preparation approval: none.** Record this result through the planned documentary follow-up and obtain a fresh exact-patch review for that changed documentation. Keep the overall ExecPlan active until its separately authorized publication and integration criteria are satisfied.

## Appendix A — Closed reviewed source identities

An `(empty)` porcelain status represents the empty string in the reviewed manifest.

| Path | Role | Porcelain status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- | --- |
| `.agents/PLANS.md` | support | `(empty)` | `f54345a6ee7dd2eeccd56a2c05a854da9178758b7e4adbf21f025122676fa00c` | `960ef8eb5000901a8a945c69ea6386179add517c` |
| `AGENTS.md` | support | `(empty)` | `b2c6b7baca13b2345265410fe3947b4c20f2fc3064ba00e83e10c64895b0b424` | `c06bfb24454caf9e9a7af6820425f627d9ff3b4e` |
| `docs/architecture/decisions/ADR-0058-admit-certifi-pillow-chatterbox-v5.md` | support | `(empty)` | `948676c090549045f26d0583fc9a2cce067ff9af15474535bd12e8f8dffa6241` | `dbe6649400c5b7c24a67baee79e6e0d108b420aa` |
| `docs/architecture/overview.md` | support | `(empty)` | `39806607f89e157b6767d2f8def40a7eb15ff918e6aeaa1105e0e0109801081f` | `e994bc6385e3e33e5679ec586dcd642cd2dd4dc9` |
| `docs/architecture/system-diagram.md` | support | `(empty)` | `e12b79b8beb6b12d948d7e9795dbd92f23ad73793d52e76502525f3e7ef4f537` | `0a918fc1719ebf85877c1d4494d8f4c0fd383dd1` |
| `docs/development/agentic-change-review.md` | support | `(empty)` | `de4c430a5de120d9c900d6bad0bebbfeec81673614b30f242f3154efbedcfc39` | `373443e17547185e2294d906bdc9cb489daca67c` |
| `docs/development/dependencies.md` | task | ` M docs/development/dependencies.md` | `4488f4a3476919e4f2509c25f0678f2d059c3b979d50825ce3cabd4b1b60723e` | `4fdcc5ff1ae24469d9eac812f262331507633603` |
| `docs/development/testing.md` | task | ` M docs/development/testing.md` | `755a15cc9ba7059162cba5571d80a4d8abeaa578948b4430b0586653c9a8eaed` | `f9f96d8cdae32465f4d24389ea9be0a7091046e6` |
| `docs/plans/active/chatterbox-filelock-setuptools-security-refresh.md` | task | `?? docs/plans/active/chatterbox-filelock-setuptools-security-refresh.md` | `8f87aa780ec7afe61622e1f9f7328517b5696e351ca1f57c10203be251936a1a` | `c32483bb55db733968e29b6c1a172e8cc4836f03` |
| `docs/plans/active/README.md` | task | ` M docs/plans/active/README.md` | `a6be179ed682dc6f7d9968288d8e0f9e21e33640fe6464c7a35d5fd423f66842` | `2cb23208dafe36741a9174b92224a0dc34f78497` |
| `package.json` | task | ` M package.json` | `e6ed76471f9c6b983ea1284bdd2716acaeef66fa79ed79b4dce6f5cc92b580fa` | `a1d821c0a7c744a796ff80c9bbd7e9a04416ff7d` |
| `scripts/release_inventory.py` | support | `(empty)` | `13602d68a819ea3c83816f8446996bdc434eba7cfe3cca5fa2f4c7015260cf7e` | `9cd6c281451856f74f944b6a2236866fe0a474bc` |
| `scripts/release-audit.mjs` | support | `(empty)` | `2b366e734f12fae0cdee25e103eb020490979d415dedca1a50ad5b24648dc8f0` | `247bf8db7b87d271f0c8be3e44b8aa0840d18ca7` |
| `scripts/test-chatterbox-dependency-security.py` | support | `(empty)` | `fa3f518c62e01ed05a40be411ab3f6382faf79ae4471e25008630896adb54663` | `b197ffa5b6e648b3cbcac184bed975584330ba2a` |
| `scripts/test-chatterbox-runtime-security.py` | support | `(empty)` | `eaf28a1eb816abc072e10d444e8d5c467beb6821390258a61f9b22e8a4140a0c` | `5a1422ddc6e24f53e67d49c3ff59bb9dbe86cea3` |
| `scripts/test-chatterbox-runtime-smoke.py` | task | ` M scripts/test-chatterbox-runtime-smoke.py` | `274d9d26d64140ea6b35d29182fe458e9ef34a1cab526286208f2cb63c5fa4de` | `9aa13a57fb2f185865b74f45e2611cd0e0a52de7` |
| `scripts/test-chatterbox-v6-security.py` | task | `?? scripts/test-chatterbox-v6-security.py` | `bfb86e3952f1d3fe623d20f5dfc65a8292e768db82819b84d682fb4397fa92ca` | `befb98cede083dfc233f13eb6319f3ef6252f3ba` |
| `services/tts/pyproject.toml` | support | `(empty)` | `f65ca556bd98ac9183c6ce95b05de1873689f22058820f1ff0b16d59fedf3c64` | `45ad2716bb5cbc50662b0f05e22b734fce0542b0` |
| `services/tts/release/audit-policy.json` | support | `(empty)` | `367e8a3e0c33138c23f2fb89e85a467e6675f672fe5273a1b3b76efe958e11d1` | `a6a65cfefa233fd3da8507245d803e0b1cffb9a6` |
| `services/tts/release/optional/chatterbox/optional-package-manifest-v5.json` | support | `(empty)` | `52eb229074b35dd597e1b8568ca4c046bdf999cab2272d8400458dd3280b6761` | `7a05354fc40f5a4804347abe5d8aa21dd8158830` |
| `services/tts/release/optional/chatterbox/publication-v5.json` | support | `(empty)` | `d0469283a7b5ae26b8730badb846ac9bac3cbf042e8b5b7107a9fa11869e8556` | `88d93e690c8e1d582feb8dc703bced45f28897e1` |
| `services/tts/release/optional/chatterbox/runtime-package-evidence-v5.json` | support | `(empty)` | `a232b5edf4e5a505884dd95e1eb3716cbad7144c106d0d5f9d1bd476959d2982` | `a4e15a2b51065b48d89ad17b391b540d3c279a70` |
| `services/tts/release/optional/chatterbox/source-manifest-v1.json` | support | `(empty)` | `a0ef1d005cd1ea0811968f796a23bad362124c3175e90398d6c552f2cb177702` | `6d30cceeb80b75d1b8bcf42891fd418b5a45543b` |
| `services/tts/release/optional/chatterbox/source-manifest-v2.json` | support | `(empty)` | `c1f728efd631f8f09798de5df6a9097cb8239bf5db5d95ecbe451c3394e3c6fe` | `d012c9fe43a6132a06532365f8efc0f7dd5b7360` |
| `services/tts/release/optional/chatterbox/source-manifest-v3.json` | support | `(empty)` | `f1eae833b75625f290a94f06abcb2cd70a39ffe23603d9fec523999b8f0eb6d6` | `92286f79ec4455dbb6d8dd1150164fcf6d20ab55` |
| `services/tts/release/optional/chatterbox/source-manifest-v4.json` | support | `(empty)` | `76741c983f4e7263ffe03ac728eb80cd4cc0bdc13eda4f4dab55aa4996cbb284` | `c389c99b2af67e5a2b9f6835887286f1f9b4e1b7` |
| `services/tts/release/optional/chatterbox/source-manifest-v5.json` | support | `(empty)` | `b0891559238fbbbf65d22123ef9cdc9a1825ac3aacab3383d766b93c4ad77254` | `393242a59a5f3c99c1ed63fe9b74707471e1c611` |
| `services/tts/release/optional/chatterbox/source-manifest-v6.json` | task | `?? services/tts/release/optional/chatterbox/source-manifest-v6.json` | `ebc26b77617350b504e2b9691cf54f0a7c32d0148d0c3e19dcbf8a7677ea9864` | `6c9836d8ee0fc5b4bfb826cd80d077a60fcddb72` |
| `services/tts/release/profiles/chatterbox-v3/requirements.in` | support | `(empty)` | `c54940fd1df4150820b75c016cc7128d33add2b86a9f59ab380333945b5692db` | `7c8f40a9498b39b494dbd734caf98fc969d00586` |
| `services/tts/release/profiles/chatterbox-v3/requirements.lock` | support | `(empty)` | `9d580af2c1655cc4e971cd4db2a17e6364eea7ee429b207cf0ee52f291e1fcef` | `6f70c153a1842408eb101acb79f6a1abc953bd32` |
| `services/tts/release/profiles/chatterbox-v5/requirements.in` | support | `(empty)` | `99f7043c04e7b5ec6e021514df8c38cedbbbf233a3027c0e69aaae4bc4694bf7` | `72284c812699eeae01134652d7cfddb347a66092` |
| `services/tts/release/profiles/chatterbox-v5/requirements.lock` | support | `(empty)` | `b46f7291150378ee5f3b12812174ddabe34be03558e57b49b516629159df0217` | `086f5622d2b785c3d9f03cd723620dad0d017c5e` |
| `services/tts/release/profiles/chatterbox-v6/requirements.in` | task | `?? services/tts/release/profiles/chatterbox-v6/requirements.in` | `832a3d71a3a6e1a3f6e1f9ed48faadaba49d34c370c3477f4ee271e92d9adc95` | `5156b17f34d00f0cee7794eae23b52b3a8885c67` |
| `services/tts/release/profiles/chatterbox-v6/requirements.lock` | task | `?? services/tts/release/profiles/chatterbox-v6/requirements.lock` | `2b0b51a5f8374aec007e3f3b9a758dff4e46611ba1f19169c96da179c8f086b8` | `17a2d791037b808194900063ce54cdbfc2fd8460` |
| `services/tts/release/profiles/chatterbox/requirements.in` | support | `(empty)` | `631568ed3159a71e4650c9e616f44d44db66bbe649310fa478fe533e59cabd27` | `476f0620d66f934b24faa1667cebb4ab6029e320` |
| `services/tts/release/profiles/chatterbox/requirements.lock` | support | `(empty)` | `a0dedaff6d4a0548d59dc5b1a7d0c1940f9f9bb4afeb556deba90eee481a393a` | `20e60a218db9c652fd1cede7b9f752e623337556` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` | task | ` M services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` | `d98dc53d01b66104cc62d3a99102365ebdffb96099684d9f7d9a2f47170f1e36` | `b2c3db6b397ccc0ce24c131c4b9a701bd319e67c` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` | task | ` M services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` | `631534c87270f0245eff187002dbae87ba2b9d837b4b7b53a00cf8ff0e4b97c0` | `b2d4d8bef8f14029b772c9903ca93eb07dc9cee3` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_security_authority.py` | support | `(empty)` | `40e683e9d7bbd24414b2cf99417792142b896215059be0a0eb45b31eb6d3a58c` | `bb147bac59116512fd6c412b59e656047f1e2f52` |
| `services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py` | task | ` M services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py` | `8728a5c7848467b7f80d9c92d936d703cf0f04dad1ec8c2ea39fda4864107d20` | `c2602827c3c7ab668732da5dd39b9420c089305c` |
| `services/tts/src/voxleaf_tts/release_chatterbox.py` | task | ` M services/tts/src/voxleaf_tts/release_chatterbox.py` | `2b0c6ae2cd64ee73aa1c7ed398410647b7600985b4212ba620a142d3d55a0aa9` | `f5eed8878b27afddb401e47bd5f300ae912e009f` |
| `services/tts/tests/test_chatterbox_security_authority.py` | support | `(empty)` | `ec01bdefb42099788a3e4553d72f8fbd29daa374e3f145e7c4eb4a5ddc654e39` | `b6fa2ae2c0f3d391f2dac754ea5a1a4e7aa2afec` |
| `services/tts/tests/test_chatterbox_security_refresh.py` | support | `(empty)` | `de59da26e0136a35e1e735dc490b7da3714c7dca206b0958ac794fd78e57a8dc` | `058def0661d8df2bcc3553e8a990131194ba0402` |
| `services/tts/tests/test_chatterbox_sources.py` | support | `(empty)` | `d768a5b6b0f02b8fcc06f3440d8544881a5a67c70cb14f5a5782ac91d650c0c6` | `15a306fb9d16711150a740036ffd5accc91f6fbb` |
| `services/tts/tests/test_chatterbox_v6_preparation.py` | task | `?? services/tts/tests/test_chatterbox_v6_preparation.py` | `8cc9ce9efc9ac740857661ba5b7058b94962399cb4a48856ff73986526491fc6` | `45cb304a00f29eb66d8eef686f781ec5ebf7705f` |
| `services/tts/tests/test_release_chatterbox.py` | task | ` M services/tts/tests/test_release_chatterbox.py` | `3c63756e6c26491e2ff1f063355ba608486c22ba44a290b4bcea262c89167c85` | `b71d498f50ddafe833fc7832aba9938026ee2a29` |
| `services/tts/tests/test_release_dependency_graphs.py` | support | `(empty)` | `10ab76df7fd6cee6b10581bdc2f0da4e56f508b5a839498d7cfbc373050dc420` | `4ecedf31f2afde5d9f65dec17f82a59229c3d424` |
| `services/tts/uv.lock` | support | `(empty)` | `595916e51b3e3a4a0b1ae58cc7dc4c0a22f6104682be56d13e5d1f82c03259ed` | `bde23dd605da0accfd094b4feae9a3144a1b341d` |
