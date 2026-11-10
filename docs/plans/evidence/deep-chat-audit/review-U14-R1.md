# Change Review Report

Review ID: DCR-U14-R1-ASTRA-20261109-01
Task ID: U14 / DCR-16
Verdict: APPROVE — local defensive-hardening review only
Base commit and reviewed HEAD: d375ecc84261c404e855c055e0ecc8949a97caaf

Reviewed paths and identities: Incorporate the complete 15-row manifest in [DCR-U14-EXEC-20261109-01](u14-dcr-16-execution.md), SHA-256 bb6abebbac91caf217e919b7877a74accabf4edbde3066f14820f020cf3814d5. The first three rows are the U14 patch. The testing guide retains earlier units' text; this report accepts the U14 addition without renewing their earlier identities. Other campaign changes and root execution-status edits are excluded.

Identity recheck: PASS. All 15 paths matched recorded status, SHA-256 and filter-aware blob on initial and final inspection. HEAD remained the stated commit and the staged index was empty. review-patch.diff matches the current three-path diff. RED, focused GREEN and owner/provenance GREEN before/after snapshots are internally unchanged. RED adapter production matches HEAD; current inputs match the successful receipts.

Acceptance review:

- DCR-16: APPROVE locally as defensive hardening. _generate inspects tensor shape before numpy resolution, detach, CPU transfer or reshape. It accepts a nonempty one-dimensional waveform or a single leading channel dimension, with an integer N no larger than the existing 480,000-sample bound. Scalar, empty, multichannel, transposed-channel, higher-rank and oversized shapes fail through the existing content-free EngineFailure boundary before transfer. The oversized test uses synthetic metadata and does not claim an oversized allocation was performed.
- Post-conversion checks remain: one dimension, size equal to admitted N, positive bounded count, finite samples, exact four-byte-per-sample payload and the existing 1,920,000-byte ceiling. Both valid shapes produce the same asserted little-endian float32 mono bytes at 24 kHz. Failure settlement clears the active operation and does not publish a result. Cancellation and runtime/provider admission behavior are unchanged. Negative finite/payload guards were inspected in production; this review does not invent separate new NaN or malformed-payload test executions.
- Deployment boundary: resolve_runtime_sources still routes package versions 2/3/5/6/7 through closed historical identities and fixed raw Git commits, with byte/hash validation and no fallback to current source. The v7 preservation test actually resolves v7 and v6 sources and compares their retained modules, models and Python authority. The changed mutable adapters/chatterbox.py is therefore not substituted into installed v7.
- Piper coupling: the unchanged release_core builder excludes voxleaf_tts/adapters/chatterbox.py, its legacy name and Chatterbox service from copied site-packages. This patch changes neither that copied closure nor Piper's shared engine/protocol files. No Piper rebuild or packaged-result claim follows from this local adapter change.
- Documentation accurately labels the mutable boundary and separates this preventive guard from an installed-v7 defect or new hardware measurement. No package authority, dependency, persistence or network behavior changes were introduced.

Test evidence reviewed: Supplied normal local PowerShell execution using uv 0.11.29, Python 3.12.10 and pytest 9.1.1. I ran no tests, formatter or build.

- `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_chatterbox_adapter.py -k dcr_16`: RED exit 1, seven intended shape failures and two valid controls passed on unchanged adapter production. Exact-current GREEN exit 0, nine passed and eight deselected, 21:48:45–21:48:46 UTC.
- `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_chatterbox_adapter.py services/tts/tests/test_chatterbox_sources.py services/tts/tests/test_chatterbox_v7_preparation.py`: exit 0, 71 passed, 21:48:07–21:48:28 UTC. No engine/model was loaded.
- Scoped `uv run --project services/tts --locked ruff format` and `ruff check` over the first two paths exited 0. `uv run --directory services/tts --locked mypy src/voxleaf_tts/adapters/chatterbox.py tests/test_chatterbox_adapter.py` exited 0. Formatting evidence is a formatter run, not a separately claimed check-mode run.

Findings: None.

Remaining uncertainty: Final G4/G7 and integrated review remain pending. The evidence establishes mutable-adapter behavior and retained source provenance, not an installed-runtime shape defect, newly built package, real-model execution or hardware result.

Required next action: No U14 correction required. Preserve this immutable report and receipt, complete the remaining campaign gates and recheck identities before final acceptance. This approval is not a Validation Report or Git authorization.
