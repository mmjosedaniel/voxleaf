# TTS service organization

The Python service, release builders and benchmark tools have different owners.
This map describes the implemented organization; product/runtime status remains
in the [system diagram](../architecture/system-diagram.md) and
[roadmap](../plans/roadmap.md).

## Runtime and maintainer tooling

`services/tts/src/voxleaf_tts` contains the local protocol service, engine,
adapters and their entrypoints. Concrete engines live in `adapters/piper.py`,
`adapters/chatterbox.py`, `adapters/qwen.py`, and `adapters/fake.py`.
`adapters/__init__.py` is empty; each entrypoint imports its selected engine
without loading other providers. The root `engine.py`, `protocol.py`, `service.py`
and three provider service entrypoints retain their paths and behavior.
Runtime inference remains local, cancellation stays with the existing
owners, and ordinary playback does not persist generated audio.

The two `release_*.py` entrypoints and `voxleaf_tts/packaging/` are maintainer
tools. The maintainer wheel includes the helpers. That wheel is distinct from
the filtered Piper runtime and explicitly assembled Chatterbox runtime.

| Module under `services/tts` | Responsibility |
| --- | --- |
| `src/voxleaf_tts/release_core.py` | Piper source loading, acquisition, environment synchronization, notices, staging/promotion/rollback, ZIP, offline smoke, evidence and CLI |
| `src/voxleaf_tts/packaging/core_integrity.py` | Piper hash/path/JSON primitives, canonical error, manifest construction/serialization and exact tree verification |
| `src/voxleaf_tts/release_chatterbox.py` | Optional-runtime acquisition/copying, licences, safe-loader AST admission, synchronization, staging, ZIP/splitting, measurements and CLI |
| `src/voxleaf_tts/packaging/chatterbox_integrity.py` | Versioned package layout, canonical error, root resolution, hash/path/JSON rules and runtime manifests/tree verification |
| `src/voxleaf_tts/packaging/chatterbox_authority.py` | Versioned source manifests and historical v2/v3 acquisition/publication/evidence validation and writers |
| `src/voxleaf_tts/packaging/chatterbox_security_authority.py` | Historical v5 publication readback, acquisition authority and runtime evidence validation/writing |
| `src/voxleaf_tts/packaging/chatterbox_v6_authority.py` | Additive exact v6 publication readback and acquisition/runtime authority |
| `src/voxleaf_tts/packaging/chatterbox_v7_authority.py` | Exact msgpack-corrected V7 publication readback and current acquisition/runtime authority |
| `src/voxleaf_tts/packaging/chatterbox_sources.py` | Closed raw-Git v2/v3 source provenance, including v5/v6/v7 reuse of frozen v3 modules; separate ten-module local v4 closure |
| `benchmarks/harness.py` | Adapter/clock/memory/observation ownership, request/chunk validation, cancellation and the four historical protocol runners |
| `benchmarks/harness_corpus.py` | Legacy and bilingual corpus loading, admission and ordered projection |
| `benchmarks/harness_errors.py` | One shared harness failure type and raising helper |
| `benchmarks/quality.py` | Disposable-session containment, opt-in audio, I/O, finalization, submission/correction, aggregate orchestration and cleanup |
| `benchmarks/quality_presentation.py` | Deterministic evaluator HTML with unchanged relative audio paths |
| `benchmarks/quality_scoring.py` | Shared dimensions/error/score validation and pure per-candidate medians, means and corrected-defect calculation |

Release facades explicitly preserve existing imported bindings. Moved exception
classes retain their original qualified identities; Chatterbox `PackageLayout`
does too. Helpers do not import their facades. `packaging/__init__.py` is empty.
Chatterbox's deeper integrity module resolves the same repository root.

## Distribution inclusion policies

Piper's installed site-package copier excludes the exact
`voxleaf_tts/packaging` directory and every descendant, in addition to its
existing release-builder and metadata exclusions. Similar names outside that
subtree and legitimate runtime siblings still copy.

Piper retains `adapters/piper.py`, `adapters/fake.py`, the empty package marker
and generated protocol modules. Its exclusions name the exact dormant
Chatterbox/Qwen implementations and service entrypoints; similar siblings copy.

Chatterbox retains explicit `runtimeModules` lists. Historical v2 copies seven
verified raw Git blobs at `814fd2f70bd3588d31022207eb976c0ff93712a3`; v3 copies
nine at `998c7b24cda7e969e9ed0344f348506bf38af3b0`, including the generated
modules. The resolver verifies every size and SHA-256 before synchronization or
output mutation. V5, v6 and v7 deliberately reuse those nine frozen v3 modules with the
independent versioned dependency locks. These builds and v3/v5/v6/v7 acquisition checks require
these commits in local full history. They do not fetch automatically or fall
back to current source. Packaged inference does not require Git. V2's original
archive and later generated-module correction remain separate authorities.

Local v4 uses ten current modules, the unchanged v3 hashed dependency lock and
model revision, the safe loader and exact licence closure. Its environment,
staging, runtime, archive and parts live under isolated `dist/v4`. Neither v4
nor maintainer helpers enter historical runtime lists. The local receipt binds
actual source, recipe, runtime, archive and part bytes and marks the result
unpublished and unadmitted. Current native acquisition and installed runtime
discovery select v7 at `cb/7` under
[ADR-0064](../architecture/decisions/ADR-0064-admit-msgpack-chatterbox-v7.md).
Retained v2/v3/v5/v6 installations are cleanup-only; they are not execution fallbacks.
Do not infer identical rollback behavior across builders.

## Benchmark and test boundaries

Corpus loading preserves existing ordering, permissive admission and unwrapped
file/Unicode/JSON errors. Tightening these rules is a behavior change requiring
separate work. Protocol runners retain their distinct counts, warmup and
cancellation semantics.

Quality scoring receives already-read ordered inputs. The session owner still
validates each candidate and reads its corpus separately at the original point;
do not hoist/cache those reads during a refactor. `_write_wave` and `_write_json`
remain with their existing callers and test seams. Opt-in disposable quality
WAVs are separate from ordinary memory-only playback.

Tests remain under `services/tts/tests`; no fixture-root or discovery migration
was performed. Relevant files are `test_release_core.py`,
`test_release_chatterbox.py`, `test_benchmark_harness.py`,
`test_benchmark_quality.py`, and the existing bilingual/CLI suites.

Generated schemas, dependency locks, historical release authority, frozen
`benchmarks/tts` records and completed plans remain protected. Current Piper
manifest/evidence and Windows current evidence are refreshed only by their
existing builders, with exact recovery copies captured first. A partial Piper
failure requires restoring both tracked outputs and the verified runtime/archive
together. Old package execution results never validate newly generated bytes.

## Commands and evidence limits

From repository root in normal local PowerShell outside the automation sandbox:

```powershell
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd test:python
pnpm.cmd build:python
pnpm.cmd package:piper-core:check
pnpm.cmd package:chatterbox-optional:v5:check-source
pnpm.cmd package:chatterbox-optional:v5:check-acquisition
pnpm.cmd package:chatterbox-optional:v7:check-source
pnpm.cmd package:chatterbox-optional:v7:check-acquisition
pnpm.cmd check:portable
pnpm.cmd check
```

These are current development and authority checks. For intentional runtime
assembly, use the explicit v7 maintainer workflow in
[dependency guidance](dependencies.md#m011-release-dependency-boundary).
V5, v6 and v7 always synchronize their respective hashed locks and reject `--no-sync`.

### Historical v2/v3 checks and local v4 campaign tooling

The unversioned aliases intentionally select v2; explicit v3 aliases retain
that historical authority. Neither selects the v7 integration. The v4
builder and adapter-layout runner belong to the completed
[adapter-layout campaign](../plans/completed/tts-adapter-layout.md):

```powershell
pnpm.cmd package:chatterbox-optional:check-source
pnpm.cmd package:chatterbox-optional:check-acquisition
pnpm.cmd package:chatterbox-optional:v3:check-source
pnpm.cmd package:chatterbox-optional:v3:check-acquisition
pnpm.cmd package:chatterbox-optional:v4:write-source
pnpm.cmd package:chatterbox-optional:v4
pnpm.cmd package:chatterbox-optional:v4:check-source
pnpm.cmd package:chatterbox-optional:v4:check-local
pnpm.cmd test:tts:adapter-layout:preflight
pnpm.cmd test:tts:adapter-layout:candidate
pnpm.cmd test:tts:adapter-layout:desktop
```

Use the repository-pinned package manager. On the recorded host, an existing
Corepack shim was selected through a process-local PATH after the inherited
pnpm version failed the repository engine check; no dependency/config change
was needed. See the [baseline receipt](../plans/evidence/tts-service-organization/PY-CORE-baseline.md).

`build:python` builds the maintainer distribution. `package:piper-core:check`
verifies existing cached directory/archive bytes; the Chatterbox source and
acquisition checks validate only their selected version's authority. None
proves a newly assembled runtime or installed desktop acceptance.
Deterministic copied-tree and complete-manifest tests establish the extraction
boundaries; wheel inspection separately establishes helper inclusion/imports.
Full payload rebuilding, model performance and hardware claims require their
own evidence. See the [campaign receipts](../plans/evidence/tts-service-organization/README.md)
and [evidence retention policy](evidence-retention.md).

`tts-adapter-layout-host.mjs` accepts `--mode preflight|candidate|desktop` and
absolute contained overrides `--piper-root`, `--chatterbox-root`,
`--chatterbox-model-root`, `--executable`, and `--receipt`. Defaults select the
copied core, isolated local v4, installed v3 models, current release executable
and ignored task receipts. These historical defaults are not a v5 acceptance
route; the current desktop will not execute retained v3. Reproduction requires
the campaign's matching executable and authorities, not just current HEAD.
Preflight binds exact trees, model bytes, isolated
imports and enabled exact-interpreter outbound firewall blocks. On Windows,
candidate and desktop children select the native Windows PowerShell module
directory through their own environment for host observations and smoke runs.
Candidate executes real bilingual framed services in embedded `-I -B` interpreters,
bounded PCM, malformed-input rejection, cancellation by identity invalidation
and tree termination, fresh restart/shutdown and filesystem/network observations.
Only synthetic text is used; audio stays in memory. Desktop reuses the existing
four selected portfolio arms and native smoke assertions with an explicit
verified campaign executable, refreshed packaged Piper and then-admitted installed v3. It
does not install or uninstall. Use a frozen executable/resources copy through
`--executable` during acceptance, since aggregate builds can replace `target`.
These commands produce evidence only when actually run against their recorded
bytes; a v4 build is neither release publication nor native admission.

The candidate audit policy denies every process launch with `PermissionError`.
Only the hash-bound NumPy `check_support_sve` default-context single `lscpu`
probe is classified separately; it remains denied. Piper permits zero such
attempts and Chatterbox exactly one per fresh process. Unexpected process,
socket, audio-write and payload/model-write attempts reject acceptance even
when caught. Bounded activation/denial/exit snapshots are consumed incrementally
for both forced cancellation and orderly shutdown; absent audit evidence fails
closed. Synthetic tests execute this same policy with the locked repository
Python. Actual copied-provider imports and complete candidate execution require
their own fresh independent evidence under verified offline firewall blocks.

Chatterbox also requires exactly one denied IPv6 capability probe per fresh
process; Piper permits zero. This separate counter accepts only the verified
packaged urllib3 `_has_ipv6` bind event, exact function/module/file provenance,
AF_INET6/SOCK_STREAM/protocol0 socket and tuple `("::1", 0)`. The policy still
raises `PermissionError` before binding. Other bind, connect and getaddrinfo
events retain the unexpected-network counter and reject admission, even when
caught. Both probe budgets apply to forced and orderly exits. These are CPython
audit-event observations; they do not assert interception of APIs without such
events. Exact interpreter firewall blocks remain an independent prerequisite.
