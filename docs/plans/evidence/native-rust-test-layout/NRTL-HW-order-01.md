# APPROVED WORK ORDER

Target ID: NRTL-HW
Goal: Apply the explicitly selected private Rust child-test layout while preserving all production and test behavior.
Risk: medium
Allowed files: apps/desktop/src-tauri/src/host_profile_detection.rs; apps/desktop/src-tauri/src/host_profile_detection/tests.rs; apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs.
Required edits:
1. Replace Windows wrapper with private #[cfg(windows)] mod windows_probe; move unchanged407-linebody dedented once. Replace tests wrapper with private #[cfg(test)] mod tests; move584-linebody dedented once. In existing source-scan test replace single include_str!("host_profile_detection.rs") with unconditional array of include_str!("../host_profile_detection.rs"), include_str!("windows_probe.rs"), include_str!("tests.rs"), resolving exactly to the three allowlisted paths. Add only iteration applying unchanged forbidden-string assertions to each source; fragmented definitions remain verbatim. These source includes intentionally change, no immutable fixture includes move. Necessary rustfmt wrapping only.
Behavior invariants:
1. Every production statement/constant/signature/report serialization/normalization/ranking/ambiguity/unknown/permission mapping/admission threshold/non-Windows branch/atomic ordering/Tauri error unchanged. Parent retains report/port/normalization/admission/command ownership. Windows private module and WindowsHostProbe pub(super), imports/FFI calls/aliases/system32-only nvcuda/procedure mapping/RAII FreeLibrary/COM cleanup/64-adapter bound/CUDA and precision/fail-closed results unchanged. Same fifteen host_profile_detection::tests identities: optional_download_gate_accepts_every_exact_numeric_threshold; optional_download_gate_rejects_one_below_every_numeric_threshold; optional_download_gate_fails_closed_for_each_unknown_capacity; optional_download_gate_requires_the_closed_platform_cuda_and_bfloat16_facts; normalizes_complete_snapshot_without_identity_or_support_claims; distinguishes_partial_permission_denied_and_malformed_observations; selects_one_conservative_multi_adapter_candidate; discarded_unusable_adapter_does_not_poison_a_known_provider; selected_provider_with_unknown_memory_remains_partial; preserves_integrated_only_low_memory_and_no_provider_scenarios; fails_closed_for_unknown_provider_and_ambiguous_exact_tie; unsupported_platform_is_explicitly_unavailable; admits_only_one_concurrent_probe_and_releases_the_guard; implementation_has_no_process_network_model_or_persistence_surface (all unconditional); production_windows_probe_emits_only_the_bounded_report (Windows-only). Fixtures/helpers/assertions/conditions preserved except authorized extension of the same source-scan assertion to every resulting file. Keep all seventeen fragmented forbidden definitions verbatim; scan Windows source even on non-Windows. No ignore/condition/runtime/privacy/locality/bounds/persistence change or support promotion.
Forbidden changes:
1. Production logic/FFI/cleanup/import/visibility/gates/normalization/report/admission/guard/callers changes; test identities/conditions/helpers/assertions except scan extension; forbidden-definition changes or parent-only/platform-conditioned scan; hooks/abstractions/lib.rs/integration crates/path overrides/dependencies/manifests/generated/frozen/historical/unrelated/Git mutations.
Diff ceiling: Three files,2150aggregate changed lines; raw1988 before scan extension (parent -409/-586/+2; children407+584);162line margin for scan and rustfmt. Expected parent685.
Baseline evidence: NRTL-HW-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, exact allowlist identities in immutable report; live HEAD/SHA/ABSENT and empty index rechecked before freezing.
Worker validation: Read-only diff/scope inspection only. No validation tests or whole-repository formatting.
Acceptance commands: Same three, exact default/release identities/results and live Windows test required. Compare production/Windows tokens/FFI/cleanup/visibility, unchanged fixtures/assertions, unconditional three-source scan and seventeen definitions. Non-Windows compile cannot establish Windows acceptance. Campaign final gates retained; no model/download/performance gate.
Completion output: Change Packet only; no staging, commit, push, branch, PR or publication.

Immutable order NRTL-HW-order-01, issued by director only after accepting audit and fresh independent baseline. Source writer and validator idle at issuance.
Baseline allowlist identity record:

[
  {
    "path": "apps/desktop/src-tauri/src/host_profile_detection.rs",
    "status": [],
    "sha256": "ae456cd4b1cbc4f2a606b533e4da23e580863119af376ea3d8ed263586f3e3c3",
    "blob": "64d383f801e5ffeba6fb426786efc7f22a8f86d4"
  },
  {
    "path": "apps/desktop/src-tauri/src/host_profile_detection/tests.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  },
  {
    "path": "apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  }
]
