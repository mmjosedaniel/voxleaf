# APPROVED WORK ORDER

Target ID: NRTL-SUP
Goal: Apply the explicitly selected private Rust child-test layout while preserving all production and test behavior.
Risk: low
Allowed files: apps/desktop/src-tauri/src/tts_service_supervisor.rs; apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs.
Required edits:
1. Replace wrapper with private #[cfg(test)] mod tests; move exact 299-line body dedented once, necessary rustfmt rewrapping only. Moved fixture_segment include ../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json gains one ../; resolved target same, SHA256 b57cf18ab2b6a922d9018f028a7b1002d2916b706f7b574299cb30f2f7600753. All production includes stay at existing paths/spellings: same synthesize fixture; Qwen candidate uv.lock SHA256 1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913; core uv.lock SHA256 27ea7e0701439689bbdbac8fc81867489b5ad0f0d1e0052e6cdeb938e505ff97; Chatterbox v4 candidate uv.lock SHA256 30f3ca3c27842d88e04256d357e79c291b90636d4f7e20fca18d20713021b1ab.
Behavior invariants:
1. All production declarations/statements/imports/constants/cfg intact: one child/one active/zero queue, identities before termination, timeouts/bounded channel/audio/framing/errors/environment scrubbing/release isolation/Job Objects/assignment-failure reap/Tauri response. Keep mod host_diagnostics, run_host reexport and all executable diagnostics/gates/exit cleanup outside cfg(test); host_diagnostics.rs SHA256 3ecfd77675db84bd9a1f98738a43bb095a9a54ad1dbd22ef928fbc12d2edea5d unchanged. Same twelve tests under tts_service_supervisor::tests: unconditional validates_segment_and_generates_native_owned_request_identity; rejects_text_and_identity_bounds_before_dispatch; fixed_failure_surface_contains_no_dynamic_input; profile_configuration_rejects_unknown_profile_identity; profile_configuration_rejects_wrong_language_bindings_before_runtime_lookup; exact_runtime_never_writes_bytecode_into_verified_packages; exact_runtime_uses_an_absolute_private_interpreter_and_scrubs_host_python_state; exact_chatterbox_runtime_redirects_numba_cache_outside_the_verified_package. Release-only release_locked_runtime_rejects_development_only_profiles_and_defaults. Windows-only exact_runtime_removes_verbatim_prefixes_at_the_child_process_boundary; supervised_children_use_the_windows_no_console_flag; failed_job_assignment_kills_and_reaps_the_spawned_child. Preserve all assertions/literals/cache cleanup/private imports/Windows AtomicU32/static/helper attributes/SeqCst/failure injection/OpenProcess/CloseHandle. No cfg/ignore/runtime/privacy/bounds/persistence or Qwen status changes.
Forbidden changes:
1. Production lifecycle/runtime/diagnostics/Tauri/callers/host_diagnostics.rs/runtime helpers/platform/features/visibility/tests/assertions/cfg/cleanup/failure injection/fixtures/locks/authorities; abstractions/hooks/lib.rs/integration crates/path overrides/dependencies/manifests/generated/frozen/historical/unrelated/Git mutations.
Diff ceiling: Two files, 650 aggregate changed lines (raw 601: parent -301/+1, child +299), 49-line necessary wrapping margin. Parent 1653 lines.
Baseline evidence: NRTL-SUP-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, exact allowlist identities in immutable report; live HEAD/SHA/ABSENT and empty index rechecked before freezing.
Worker validation: Read-only diff/scope inspection only. No validation tests or whole-repository formatting.
Acceptance commands: Same three; exact default/release identities/results, Windows cases and release-only case; no missing/duplicate/rename/ignore/cfg change; unchanged production/host diagnostic, moved assertions/helpers and fixture hashes. Campaign check/native-startup retained, no model-backed unit gate.
Completion output: Change Packet only; no staging, commit, push, branch, PR or publication.

Immutable order NRTL-SUP-order-01, issued by director only after accepting audit and fresh independent baseline. Source writer and validator idle at issuance.
Baseline allowlist identity record:

[
  {
    "path": "apps/desktop/src-tauri/src/tts_service_supervisor.rs",
    "status": [],
    "sha256": "e339de585a0439d15dd879afd41fe364a0a68e57569cc027cc144b98e925b87d",
    "blob": "71c9a4c069a816989b264dfe9148e33ac03ec497"
  },
  {
    "path": "apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  }
]
