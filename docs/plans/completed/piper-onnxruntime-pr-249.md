# Prepare ONNX Runtime 1.31 for PR #249

## Goal

Prepare the remaining dependency PR against current main, preserving the local
Piper execution boundary. Publication updates the existing PR; merging remains
the owner's action.

## User-visible outcome

Spanish and English Piper playback retain offline synthesis, cancellation,
bounded resources and in-memory audio with the updated inference runtime.

## Current state

PR #249 starts at 65e7ddf21a2a0170fd06ae7df273d82dc7f242d4. The isolated
checkout has a pending automatic merge of main
d397db27745de6e4df37447b4efdb3bf6c1a72f2. The original PR changes only the
dependency requirement; its lock, exact adapter and generated package still
describe 1.30.0. Main and existing installations remain untouched.

## Scope and non-goals

Update the ONNX-specific cutoff, core lock, exact adapter checks, relevant
tests, source recipe/native lock identity, generated core package and inventory,
and current dependency documentation. Preserve Piper 1.8, voice identities,
historical benchmark authorities and Chatterbox v2/v3/v4. No published installer,
new infrastructure, general refactor or unrelated dependency upgrades.

## Relevant files and documentation

- `services/tts/release/core/` and `services/tts/src/voxleaf_tts/adapters/piper.py`.
- Piper and release dependency/core tests; native `tts_release_core` and tests.
- `scripts/release_inventory.py`, dependencies documentation, ADR-0053/0054.
- Completed `piper-onnxruntime-pr-219.md` for existing runtime commands.
- `docs/development/agentic-change-review.md` for independent acceptance.

## Architecture and constraints

Preserve the CPU provider, Python 3.12, verified voices, error mapping and public
protocol. ONNX 1.31 defaults supported native builds to 1DS telemetry. Its
`ORT_DISABLE_TELEMETRY=1` suppression must be established before import: the
upstream initialization then skips the uploader, device identity and cache.
Calling the Python disable API after import alone is insufficient for that
initialization boundary. This remains process-local, with no user configuration
changes. Official source is pinned to the v1.31.0 tag.

The actual Windows wheel retains TraceLogging and ignores that environment
flag; the adapter additionally calls the public disable API before importing
Piper or creating sessions. No claim of suppressing pre-import Windows process
metadata is made. The flag protects 1DS builds; both ordering boundaries are
covered in the same two parameterized regression cases.

## Milestones

1. Establish resolution failure and inspect upstream privacy changes: complete.
2. Implement the bounded version/privacy change and run fast host checks: complete.
3. Generate package and run real ES/EN service/desktop gates: complete.
4. Independent local acceptance: complete, PR249-INTEGRATION-20261018-01 APPROVE.
5. Verified runtime/firewall cleanup and plan archival: complete.

Authorized commit/push and published-head CI are the subsequent PR handoff.
Integration readiness is not claimed until that CI passes; the PR records it.

## Testing and benchmark strategy

All acceptance commands run in local PowerShell outside the sandbox. Run focused
Piper/dependency/core pytest, Python lint/format/mypy and native core tests before
expensive preparation. Regenerate via existing inventory and core builders; check
the resulting manifests and lock. Use existing bilingual service and direct
adaptive native playback commands for both Piper profiles, including speed,
seek, cancellation, memory, privacy and teardown assertions. Build packages
before the release desktop. CI covers the final published head. Do not repeat
unaffected Node/UI checks locally or claim old runtime evidence covers 1.31.

## Risks and rollback

Telemetry initialization, CPU wheel compatibility and package/native identity
are acceptance risks. Retain verified original core archive and metadata in
ignored evidence. Verify six voice inputs against the recipe before use. Use
one task environment and short checkout path. Any firewall changes require
exact scoped rules and verified removal preserving originals. Record stage,
exception, process and exit status on failure; allow at most one justified
correction/retry per failed chain, then report the blocker. Never loosen gates.

## Progress log

- 2026-10-18: host `uv lock --project services/tts/release/core --check` exits 1:
  package-specific cutoff 2026-09-11 excludes ONNX 1.31 released 2026-10-09.
  Command receipt 3b6552; no product execution involved.
- 2026-10-18: confirmed #242 merged into main; #249 is the only open PR.
  Upstream source inspection found pre-import telemetry suppression support.
  Two obsolete upstream source paths returned 404; corrected paths were read,
  and outputs from failed fetches are not evidence about those files.
- 2026-10-18: lock regeneration changed only ONNX among 15 entries; focused
  Python checks passed (47 adapter/core, seven dependency tests), Python
  lint/format/mypy passed, and seven native core integrity tests passed. Six
  voices, four cached sources and the existing recovery archive were verified.
- First package built and synthesized ES/EN; first release build compiled the
  executable but NSIS failed on a 262-character unnormalized resource path.
  The existing file has a 230-character canonical path. Independent assessment
  PR249-ENVIRONMENT-20261018-01 supports one local-config normalization retry.
  Original failure remains in ignored `tmp/evidence/pr249/release-build.log`.
- Binary inspection invalidated the assumption that this Windows wheel uses
  1DS: it contains WindowsTelemetry/TraceLogging and no suppression flag or
  1DS endpoint strings. Added the public disable API before Piper import;
  all 29 adapter tests, focused lint and mypy pass. This source change
  invalidates the first package's adapter bytes, requiring regeneration of
  that package. The native tests also require a rerun because they embed its
  regenerated manifest; unchanged dependency checks remain reusable.
- Release dependency audit passed all graphs; existing Rust informational
  notices and optional Chatterbox direct-source blind spots remain disclosed.
- Windows cancelled UAC before the firewall helper started; no temporary rule
  was created. User retry decision is pending. Original eight rules preserved.
- The single reviewed NSIS retry passed using an ignored equivalent release
  overlay with canonical source paths. All 2,031 resource file destinations
  and corresponding source identities match the original generated script.
  Tracked release configuration remains unchanged. The first comparison's
  pattern matched only SetOutPath and is explicitly superseded by the corrected
  file-mapping receipt; it is not acceptance evidence for resource destinations.
- Final package smoke: Spanish 229,600 PCM bytes, English 219,568 PCM bytes;
  2,024 files, 306,740,365 installed bytes, 213,923,103 archive bytes. Archive
  SHA-256 c6204d11d99ce395afece203bdc3f6fb804f394359a332f847b6ad3a48a65eba.
  Package check and exact adjacent resource-tree verification pass. Installer
  build passed; it was neither installed nor published. Final process inspection
  found no checkout-owned process and no PR249 firewall rules.
- The owner authorized the UAC retry. Both temporary exact-interpreter blocks
  were created and verified. Packaged ES/EN preflights, service lifecycle and
  direct adaptive desktop journeys each passed once. Spanish/English audible
  start: 4,878/5,122 ms; cancellation: 240/248 ms; warm prepared RTF: 0.11/0.11.
  Both journeys passed six rates, seek/chapter changes, pause/resume, bounded
  resources and synchronization, with zero underruns, external requests,
  persisted audio files and retained units after cleanup.
- UAC removal succeeded. Final verification confirms all eight original rules
  unchanged, neither temporary rule present, no retained checkout process,
  unchanged reviewed inputs and exact adjacent runtime file/hash integrity.
  Independent review subsequently approved local acceptance.
- PR249-INTEGRATION-20261018-01 APPROVE found no outstanding defects. Its
  evidence review required the seven native core tests to run against the final
  embedded manifest; that rerun passed. Both canonical Clippy configurations
  and the final focused Python format check passed. No runtime journey was
  repeated. Documentation closure records these results and archives this plan;
  a separate exact-patch closure review precedes Git publication.

## Discoveries and decisions

- [ONNX 1.31 release](https://github.com/microsoft/onnxruntime/releases/tag/v1.31.0).
- [Suppression boundary](https://github.com/microsoft/onnxruntime/blob/v1.31.0/onnxruntime/core/platform/telemetry_1ds.cc)
  and [environment flag](https://github.com/microsoft/onnxruntime/blob/v1.31.0/onnxruntime/core/platform/telemetry_environment.h).
- Existing CI detection also suppresses telemetry upstream; CI alone cannot
  establish ordinary-host privacy. Test the pre-import application boundary.

## Final validation results

Local implementation, runtime validation and cleanup are complete, with
independent approval PR249-INTEGRATION-20261018-01. Published-head CI and Git
handoff follow this local closeout; neither merging nor publishing an installer
is authorized by this plan or its review.

Completed host commands (all exits zero unless stated):

- `uv lock --project services/tts/release/core --check`: initial exit 1 due to
  cutoff; after lock regeneration, exit 0. Only ONNX changed among 15 entries.
- `uv sync --project services/tts/release/core --locked`: 14 installed packages.
- `uv run --project services/tts --locked pytest services/tts/tests/test_piper_adapter.py services/tts/tests/test_release_core.py -q`:
  47 passed. After the API addition, reran only `test_piper_adapter.py`: 29 passed.
- `uv run --project services/tts --locked pytest services/tts/tests/test_release_dependency_graphs.py -q`:
  seven passed. Dependency inputs unchanged by the later telemetry call.
- `pnpm.cmd lint:python`, `pnpm.cmd format:check:python`,
  `pnpm.cmd typecheck:python`, `pnpm.cmd build:packages`: passed. After the API
  addition, focused Ruff and mypy passed again for affected inputs.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_release_core`:
  seven passed on the final regenerated manifest. The original run was not
  reused because the Rust module embeds that manifest.
- `pnpm.cmd inventory:release`, `pnpm.cmd inventory:release:check`,
  `pnpm.cmd audit:release`: passed; no later dependency/lock/inventory changes.
- `pnpm.cmd package:piper-core:write-manifest`: final package and real smoke pass.
  `pnpm.cmd package:piper-core:check`: final archive/manifest verification passes.
- `pnpm.cmd --filter @voxleaf/desktop tauri build --config src-tauri/tauri.release.conf.json --features release-locked-runtime`:
  exit 1 at NSIS after successful compilation (path-length diagnosis).
- `pnpm.cmd --filter @voxleaf/desktop tauri build --config ../../tmp/evidence/pr249/release-local.json --features release-locked-runtime`:
  exit 0, sole reviewed retry; local configuration and mapping receipts retained.
- `node apps/desktop/scripts/bilingual-portfolio-host.mjs --preflight-only --profile=<Piper profile>`:
  ES and EN pass with exact packaged interpreter outbound blocks.
- `node apps/desktop/scripts/bilingual-tts-profiles-host.mjs --profile=<Piper profile>`:
  ES and EN pass against the strict release executable and adjacent runtime.
- `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=<Piper profile> --tts-language=<es|en>`:
  both pass. Profile values are `piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1`
  and `piper-1-4-2-onnx-cpu-en-us-joe-medium-v1`, respectively. No Chatterbox
  profile switching or broader hardware/voice-quality acceptance is claimed.
- `cargo fmt --check --manifest-path apps/desktop/src-tauri/Cargo.toml` and
  focused Prettier checks for the generated JSON: pass.
- `pnpm.cmd lint:rust`: default and release all-target Clippy configurations
  pass with warnings denied. Final focused `ruff format --check` passes for
  the adapter and its test file.

Immutable command logs and local preparation receipts remain under ignored
`tmp/evidence/pr249/` in the isolated task checkout. No installer lifecycle or
published-head CI is claimed from these local results. The installer remains
uninstalled and unpublished. The existing PR records subsequent Git/CI status.
