# APPROVED WORK ORDER

Order ID: TTS-ADAPTER-LAYOUT-01-WO-01
Target ID: TTS-ADAPTER-LAYOUT-01
Goal: Group the four concrete engines under adapters while preserving runtime behavior and the exact historical/current package boundaries.
Risk: high
Expected branch: codex/tts-adapter-layout
Expected HEAD: 7bbad9d5bef3a83c913ea5d7b948213a05bb0362

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

Required edits:
1. Implement the small closed historical raw-Git source resolver shared by runtime copying and historical authority validation. Preserve both exact anchor commits, all frozen module identities, v2 defaults and v2 correction history. Resolve/verify before output mutation or environment sync. Missing/wrong history/path/bytes fails with no live-source fallback or automatic fetch.
2. Move piper_adapter.py, chatterbox_adapter.py, qwen_adapter.py and fake_engine.py to adapters/{piper,chatterbox,qwen,fake}.py, updating only relative imports and direct consumers. Keep empty adapters/__init__.py, existing contract/protocol/service/entrypoint paths and independent tests. No forwarding modules, engine algorithm changes or optional eager imports.
3. Extend maintainer packaging to isolated local v4 with exact ten-module closure, unchanged v3 requirements.lock and model revision, require-hashes, safe loader and exact Tokenizers/all notices. Implement/register the v4 build/write-source/check-source/check-local CLI routes specified in AUDIT-01. V4 receipts derive from actual outputs, remain unpublished/unadmitted and contain no invented runtime download URLs or inherited execution results. Do not overwrite any v2/v3 authorities, especially existing runtime-package-evidence-v4.json (which belongs to package v3).
4. Update Piper exact exclusions and smoke import; add closed provenance/import/payload/real behavior tests as specified in AUDIT-01. Inspect the actual isolated wheel/copied payload without source leakage. Preserve existing assertions; no dependency/contract/model changes.
5. Implement apps/desktop/scripts/tts-adapter-layout-host.mjs and its node tests with the exact three CLI modes and path arguments frozen in AUDIT-01. Register all commands and tests before execution. The candidate route must exercise fresh copied Piper ES/EN and Chatterbox v4 ES/EN with real framed lifecycle, bounded audio, cancellation/process cleanup/restart, exact payload identity and offline/filesystem observations. The non-installing desktop route exercises actual refreshed packaged Piper and admitted installed v3, never a dev fallback. Keep existing host assertions/deadlines and use synthetic/public text only. If this needs a broader framework or unlisted source change, stop for a revised order.
6. Worker-owned preparation only, after the source patch and tests are ready: preserve exact original tracked Piper outputs, Windows current evidence, verified current Piper runtime/archive and relevant native artifacts in ignored recovery storage outside replacement targets. Record recovery identities. Run the registered v4 source generator/build; run package:piper-core:write-manifest, package:piper-core and package:windows using the existing builders. The user's explicit generator authorization permits only these current generated outputs/new v4 recipe; never manual hash/generated-source edits. On partial Piper failure restore both captured tracked outputs and the original verified payload/archive from captured bytes, record and stop rather than accepting mixed authority. Freeze the fresh binary/resources and artifact identities before returning for independent validation. Do not overwrite pre-existing backup/candidate directories.
7. Update only the allowlisted implemented service map for actual changes, source-history prerequisite and local-only v4 commands/limitations. Director owns plan/index/evidence coordination separately. Return the Change Packet and freeze source/artifacts before independent validation; no Git mutation.

Behavior invariants:
All behavior invariants and exact runner contracts in accepted AUDIT-01 are adopted verbatim. Preserve profile/model/dependency/voice identities, protocol v1, error identities, stable service/release entrypoints, lazy imports, one active operation, bounded PCM/queues, cancellation/stale suppression, cleanup/local inference/memory-only audio, locators/narration/synchronization/persistence. Historical v2/v3 bytes and native v3 admission remain unchanged. Existing installation/user data must remain intact.

Forbidden changes:
Any unlisted source/config/test/generated-output path; manual generated hashes/schemas or frozen authority; completed plans, dependency upgrades, public-contract/engine-algorithm/UI/narration changes; development-source masking; weaker host checks; production v4 admission or download publication; removing existing user installation/data; staging, commits, push, PR or package publication. No delegation by the worker.

Diff ceiling: 35 exact source-unit paths; four mechanically equivalent moves (~1614 lines relocated) plus at most 3000 additional rename-aware changed lines; all generator-owned outputs at most 300 changed lines combined. Exceeding any bound requires stop/re-audit before expansion.

Baseline evidence: TTS-ADAPTER-LAYOUT-01-BASELINE-20261011-01 PASS, immutable raw report SHA256 8f31b3ba7ae976e3757c1ac677d483c0bd560a94d1b5ea55a51b2bc083307372. Host prerequisite report TTS-ADAPTER-LAYOUT-01-HOST-PREREQUISITES-20261011-03 PASS, SHA256 3a113758cd7a24e5a76cd6ce27febedabf2c4fda70d1be00ed76454ba3cbcdae. HEAD, all35 validated paths and260 protected identities rechecked unchanged. Prior host BLOCKED remains historical.

Worker validation: No acceptance testing. The worker may use the existing configured Python/TypeScript format commands only restricted to allowlisted files, a syntax parser and git diff --check from normal host PowerShell. Generator/build preparation commands above are explicitly writing preparation, not validation. The validator owns acceptance. Use the pinned Corepack shim via process-local PATH. Raw temporary scripts/logs/backups/receipts under ignored tmp/evidence/tts-adapter-layout are allowed preparation evidence, not additional production source paths.

Acceptance commands (independent validator, normal host PowerShell outside sandbox, after writing stops):
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
pnpm.cmd package:chatterbox-optional:v4:check-source
pnpm.cmd package:chatterbox-optional:v4:check-local
pnpm.cmd test:tts:adapter-layout:preflight
pnpm.cmd test:tts:adapter-layout:candidate
pnpm.cmd test:tts:adapter-layout:desktop
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:native-startup
pnpm.cmd package:windows:check
pnpm.cmd inventory:release:check
pnpm.cmd audit:release
pnpm.cmd test:chatterbox:dependency-security

Acceptance also consumes exact wheel/copied closure, artifact hashes and source/history identities specified in AUDIT-01. Frozen artifact paths/receipts must be explicit before commands; aggregate builds must not silently replace the desktop binary being exercised. Windows writing package preparation is not a validator repair. Do not run install/uninstall or ordinary acquisition journeys.

Firewall preparation: Three task-owned enabled exact-program outbound rules now exist: VoxLeaf-Adapter-Layout-Test-0 (core/dist Python), -1 (host installed cb/3 Python), -2 (dist/v4 Python). Preserve all pre-existing rules; clean up only task-owned names after host work. If using a frozen-copy desktop runtime at another path, report that exact path to the director for a separate narrowly scoped rule before its host gate. Resolve LOCALAPPDATA only in host context; the managed sandbox exposes a different value.

Completion output: Change Packet only; exact changed paths, edits/invariants, generator/artifact/recovery receipts and remaining acceptance commands; no staging, commit or push.

Supporting authority: docs/plans/evidence/tts-adapter-layout/AUDIT-01.md and docs/plans/active/tts-adapter-layout.md. Original immutable baseline and host reports remain under tmp/evidence/tts-adapter-layout/validation/<Report ID>/Validation-Report.md. The director accepts the audit and both PASS prerequisites and issues this order now. Do not broaden it implicitly.