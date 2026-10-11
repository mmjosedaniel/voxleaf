# TTS service organization

The Python service, release builders and benchmark tools have different owners.
This map describes the implemented organization; product/runtime status remains
in the [system diagram](../architecture/system-diagram.md) and
[roadmap](../plans/roadmap.md).

## Runtime and maintainer tooling

`services/tts/src/voxleaf_tts` contains the local protocol service, engine,
adapters and their entrypoints. Those runtime modules retain their names and
behavior. Runtime inference remains local, cancellation stays with the existing
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
| `src/voxleaf_tts/packaging/chatterbox_authority.py` | Versioned source/acquisition/publication/evidence validation and explicit authority writers; historical v2 and current v3 remain distinct |
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

Chatterbox retains its explicit `runtimeModules` source lists. The historical
v2 list and v3 generated-module closure differ intentionally. Helpers are not
added to either list. Do not unify these policies or infer identical rollback
behavior across builders.

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

Generated schemas under `src/voxleaf_tts/generated`, release manifests/evidence/
locks, frozen `benchmarks/tts` authorities, candidate environments and completed
plans are protected. Do not regenerate them to accommodate an organizational
change. Runtime modules, protocol runners and test-directory reorganization
remain outside this campaign.

## Commands and evidence limits

From repository root in normal local PowerShell outside the automation sandbox:

```powershell
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
pnpm.cmd check:portable
pnpm.cmd check
```

Use the repository-pinned package manager. On the recorded host, an existing
Corepack shim was selected through a process-local PATH after the inherited
pnpm version failed the repository engine check; no dependency/config change
was needed. See the [baseline receipt](../plans/evidence/tts-service-organization/PY-CORE-baseline.md).

`build:python` builds the maintainer distribution. `package:piper-core:check`
verifies existing cached directory/archive bytes; the four Chatterbox checks
validate source/acquisition authority. None proves a newly assembled runtime.
Deterministic copied-tree and complete-manifest tests establish the extraction
boundaries; wheel inspection separately establishes helper inclusion/imports.
Full payload rebuilding, model performance and hardware claims require their
own evidence. See the [campaign receipts](../plans/evidence/tts-service-organization/README.md)
and [evidence retention policy](evidence-retention.md).
