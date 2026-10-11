# Audit Packet
Target ID: TTS-ADAPTER-LAYOUT-01
Decision: CHANGE
Risk: high
Primary target: Atomic Python concrete-engine ownership and runtime-package source binding: services/tts/src/voxleaf_tts/{piper_adapter.py:PiperCpuTtsEngine,chatterbox_adapter.py:ChatterboxMultilingualTtsEngine,qwen_adapter.py:QwenSerenaTtsEngine,fake_engine.py:FakeTtsEngine}; release_chatterbox.py:_copy_runtime_modules/build_package/main; packaging/chatterbox_authority.py:successor_acquisition_manifest; packaging/chatterbox_integrity.py:PackageLayout.
Related context: Six adapter/service/release suites below; engine.py:TtsEngine and protocol.py remain unchanged; stable service entrypoints; release_core.py:_excluded_site_file/_smoke_script/build_package; native RuntimeConfiguration::piper/chatterbox and packaged discovery; Windows builder; portfolio/native smoke runners. Read AGENTS.md, full plan, safe-refactor skills/contracts, relevant ADR-0016/0051/0052/0054, documentation and actual consumers. HEAD 7bbad9d5bef3a83c913ea5d7b948213a05bb0362, branch codex/tts-adapter-layout; source/index clean. Director's current active-plan edit is separate coordination work.

Concrete evidence:
1. OBSERVED ownership/package coupling: _copy_runtime_modules copies current checkout modules for historical v2/v3; successor_acquisition_manifest recalculates adapter/service hashes from mutable current files while retaining SUCCESSOR_ARCHIVE_SHA256/SUCCESSOR_PARTS. The admitted published identity depends on later source organization. Two real maintainership consumers justify a small closed historical-source resolver. This is a source/provenance maintenance obstacle, not an observed reader defect.
2. OBSERVED PackageLayout.dist maps every accepted non-v2 version to literal dist/v3; _synchronise_environment and _copy_notices apply hashed dependencies and Tokenizers licence only for v3. A new layout requires all three explicit branches; accepting literal 4 alone would collide or omit guarantees.
3. OBSERVED Piper _excluded_site_file names root dormant adapters; _smoke_script imports the root Piper adapter. Current exact runtime authority must be rebuilt with the new closure; a source move alone is incomplete.
4. OBSERVED prerequisite PASS: raw Git bytes at exact planned 814fd2f70bd3588d31022207eb976c0ff93712a3 (7 modules) and 998c7b24cda7e969e9ed0344f348506bf38af3b0 (9 modules) exist. Both adapter SHA-256 f7fd0e9f745954dbe5881a5428972793f619335a643a7d3b768368a6fdca707e and service SHA-256 feedf00f006699fea7fae2bed1d5192709be2e8b124ac48339bc99b44b284727 match frozen authority. Available v2 original manifest cb5055580a28a0c97e50535a8317ea506081230b70e0099d8fe0194591e1c635 matches all 7 modules; installed corrected v2 1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262 does too. Installed v3 manifest 470ec7e8a6fa1e91f9831e42de7988249220b51d4ecd4352452f3c70b2b6084a matches frozen v3 authority and all 9 modules. This proves source/manifest binding, not entire installed-tree/archive integrity. Verified outside sandbox; raw byte evidence is historical-source-bindings.json in this directory.
5. OBSERVED host testing obstacle: chatterbox_from_environment hardcodes the benchmark interpreter and injects checkout source. Existing admitted installed-v3 journeys cannot prove v4 copied closure. Native piper/chatterbox prefer verified packaged/installed runtime first. Non-installing native matrix plus standalone fresh-process candidate runner can cover the required separation. Installed app exists; install/uninstall lifecycle and ordinary acquisition journey are not selected. Full-tree, firewall/model availability and execution still require validator evidence.
6. SKIP engine.py/protocol.py relocation and adapter algorithm extraction: owners and state machines are already cohesive; no size-based defect. No generic registry or forwarding modules. All 268 tracked TS/TSX files inventoried/classified EXCLUDED from this Python unit in tracked-typescript-inventory.json. Historical benchmark function names containing adapter strings are not live imports. Both foundation jobs fetch full history; release-audit job is shallow but its audit/inventory routes do not invoke historical authority checks, so no workflow edit is justified.

Behavior invariants:
- Same profile IDs, model/artifact/dependency/voice revisions, provider gates, environment keys, exception/error identities, stable four service and two release entrypoints, protocol-v1 framing/order/limits.
- One active child/operation, no added queue or eager optional imports; memory-only bounded finite 24kHz mono PCM; identity-bound cancellation/stale suppression, cleanup and explicit restart; unchanged privacy and content-free failures.
- EPUB locators, narration preparation/synchronization, buffering/startup thresholds and persistence unchanged.
- Historical v2/v3 manifests/evidence/locks/notices/publication/archive identities unchanged; v2 generated correction stays distinct. Resolver reads verified closed raw Git blobs before sync/output mutation, no fallback/current source/automatic fetch, no Git requirement in packaged runtime.
- V4 lock equals unchanged chatterbox-v3 lock; isolated dist/v4, exact ten-module runtime set; no Piper/Qwen/maintainer payload. Unpublished/unadmitted, no URLs or inherited measurements.
- Piper exact closure includes adapters marker/Piper/fake/schema, excludes dormant adapters and maintainer subtree while similar siblings copy; current Piper outputs generated together with backup/recovery. Windows package evidence v3 is generator-only and resets unavailable lifecycle/journey claims rather than inheriting old results.
- Host runner proves each child/module/interpreter resolves inside named payload, no checkout/PYTHONPATH/user-site masking; preflight proves exact firewall/model/artifact prerequisites, bounded process-tree cleanup and no ordinary audio writes. Desktop matrix proves refreshed packaged Piper plus admitted installed v3, never development fallback.

Allowed files:
services/tts/src/voxleaf_tts/piper_adapter.py
services/tts/src/voxleaf_tts/chatterbox_adapter.py
services/tts/src/voxleaf_tts/qwen_adapter.py
services/tts/src/voxleaf_tts/fake_engine.py
services/tts/src/voxleaf_tts/adapters/__init__.py
services/tts/src/voxleaf_tts/adapters/piper.py
services/tts/src/voxleaf_tts/adapters/chatterbox.py
services/tts/src/voxleaf_tts/adapters/qwen.py
services/tts/src/voxleaf_tts/adapters/fake.py
services/tts/src/voxleaf_tts/service.py
services/tts/src/voxleaf_tts/piper_service.py
services/tts/src/voxleaf_tts/chatterbox_service.py
services/tts/src/voxleaf_tts/qwen_service.py
services/tts/src/voxleaf_tts/release_core.py
services/tts/src/voxleaf_tts/release_chatterbox.py
services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py
services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py
services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py
services/tts/tests/test_piper_adapter.py
services/tts/tests/test_chatterbox_adapter.py
services/tts/tests/test_qwen_adapter.py
services/tts/tests/test_service.py
services/tts/tests/test_release_core.py
services/tts/tests/test_release_chatterbox.py
services/tts/tests/test_chatterbox_sources.py
services/tts/tests/test_adapter_layout.py
services/tts/release/core/runtime-manifest-v1.json
services/tts/release/core/core-package-evidence-v1.json
services/tts/release/optional/chatterbox/source-manifest-v4.json
apps/desktop/src-tauri/release/windows-package-evidence-v3.json
apps/desktop/scripts/tts-adapter-layout-host.mjs
apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs
apps/desktop/package.json
package.json
docs/development/tts-service-organization.md

Proposed edits:
- Move four implementations, only adjusting parent-relative imports; empty marker; update direct service/test imports without assertion weakening.
- Small shared closed source resolver and explicit v4 layout/recipe/local verifier. V2/v3 copy and successor hashes use verified historical blobs, preserving bytes/default/error semantics. Add missing/wrong commit/path/byte/collision fixture tests; retain original frozen fixture expected hashes.
- Update only Piper adapter-path exclusions/smoke and new payload/import tests. Refresh two current Piper outputs and Windows evidence through builders in worker preparation, backed up first; validator never repairs them.
- New host runner at apps/desktop/scripts/tts-adapter-layout-host.mjs with CLI modes --mode preflight|candidate|desktop; exact --piper-root, --chatterbox-root, --chatterbox-model-root, --executable, --receipt optional overrides must be absolute/contained and validated. Defaults derive repo-root core/dist/voxleaf-piper-core-v1; optional/chatterbox/dist/v4/voxleaf-chatterbox-v4; LOCALAPPDATA/com.voxleaf.desktop/tts/cb/3/models (read-only); target/release/voxleaf-desktop.exe; ignored tmp/evidence/tts-adapter-layout/candidate/{preflight,candidate,desktop}.json. Mode candidate runs Piper ES/EN and v4 ES/EN in their own -I/-B embedded interpreters with no source injection: real framed handshake/load/warm/generate, bounded PCM/identity checks, malformed-input rejection, cancellation/termination, fresh restart/shutdown, filesystem/network/process observations. Model-free runner node tests cover artifact binding, invalid closures/frame bounds, timeout cleanup and mode admission. Mode desktop imports existing portfolio arm/argument helpers, uses its selected preflight and existing native-startup-smoke --executable=<absolute verified current binary> for exactly Piper ES, Piper EN, Chatterbox ES/EN sequentially; capture cleanup and actual runtime binding. No existing host gate is weakened.
- Register proposed package v4 build/write-source/check-source/check-local routes as plan names, using existing release_chatterbox CLI with --package-version 4. Register root test:tts:adapter-layout:preflight, test:tts:adapter-layout:candidate, test:tts:adapter-layout:desktop as node apps/desktop/scripts/tts-adapter-layout-host.mjs --mode <mode>; include new node suite in existing desktop test script. These are deliverables, not currently executable commands.

Forbidden edits: Any path outside closed source allowlist; manual generated-output/hash changes; all historical Chatterbox authority/evidence and completed plans; generated schemas; dependency locks/versions, model data, public contracts, production/native v4 admission, runtime algorithms, existing gate thresholds, UI/narration/persistence, workflow changes, user installation/data, audio persistence, Git mutations/publication.
Diff ceiling: 35 exact paths; four mechanically equivalent moves (~1,614 production lines relocated; deletion/addition representation excluded from edit count), at most 3,000 additional rename-aware changed lines, including tests, runner and generated outputs; generator-owned outputs at most 300 changed lines total. Stop/re-audit for another path, broader runner/framework, or exceeded ceiling. Director active plan/index/evidence coordination is separately reviewed and outside source identity manifest.
Baseline commands:
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd test:python
pnpm.cmd build:python
pnpm.cmd package:piper-core:check
pnpm.cmd package:chatterbox-optional:check-source
pnpm.cmd package:chatterbox-optional:check-acquisition
pnpm.cmd package:chatterbox-optional:v3:check-source
pnpm.cmd package:chatterbox-optional:v3:check-acquisition
Post-change commands: Same ten; then pnpm.cmd package:chatterbox-optional:v4:check-source; pnpm.cmd package:chatterbox-optional:v4:check-local; pnpm.cmd test:tts:adapter-layout:preflight; pnpm.cmd test:tts:adapter-layout:candidate; pnpm.cmd test:tts:adapter-layout:desktop; pnpm.cmd check:portable; pnpm.cmd check; pnpm.cmd test:native-startup; pnpm.cmd package:windows:check; pnpm.cmd inventory:release:check; pnpm.cmd audit:release; pnpm.cmd test:chatterbox:dependency-security. All outside sandbox with pinned tools and immutable source/artifact identity receipts. Preparation commands (worker only, before identities freeze): package:piper-core:write-manifest, package:piper-core, package:chatterbox-optional:v4:write-source, package:chatterbox-optional:v4, package:windows. Do not rerun writing package:windows in validator mode. Since aggregate/native builds can replace ignored binary/resources, freeze/copy the verified release executable/resources after preparation; runner must bind its --executable to that frozen copy and evidence and never silently use a later overwrite. Existing core/manifest/archive/parts real byte checks, wheel inspection, generated-source binding verification supplement commands without inventing passed results.
Documentation impact: docs/development/tts-service-organization.md module map, historical full-history prerequisite, new commands/local-candidate limits; director-owned active plan/index/evidence receipts updated separately. Review system diagram; no runtime process/topology change or v4 admission claim, so no diagram edit is currently justified.
Decision required: none for draft CHANGE scope; accepted work order still requires independent passing host baseline and verified host/firewall/model/full-tree prerequisites. Missing prerequisite is BLOCKED before moves, not permission to weaken validation or change provenance. No installation lifecycle/ordinary acquisition journey is selected; existing user install remains intact and no new installer lifecycle claim is made.
