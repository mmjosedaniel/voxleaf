# Change Review Report

Review ID: DCR-U12-R1-ASTRA-20261109-01
Task ID: U12 / DCR-04
Verdict: APPROVE — local unit review only
Base commit and reviewed HEAD: d375ecc84261c404e855c055e0ecc8949a97caaf

Reviewed paths and identities: Incorporate the complete eight-row manifest in [DCR-U12-EXEC-20261109-01](u12-dcr-04-execution.md), SHA-256 ddfe2f19ee60beccdf227a4a5c0be10d3d18217b6cd08f8618ad32f275bbc52f. The first two paths are the U12 patch: windows_probe.rs and ADR-0063. The ADR retains U4's prior Celsius amendment; this review assesses the CUDA amendment and does not renew U4's prior identity. Other unit changes and root execution-status documentation are excluded.

Identity recheck: PASS. All eight paths matched their recorded status, SHA-256 and filter-aware blob on initial and final comparisons. HEAD remained the stated commit and the staged index was empty. review-patch.diff matches the current diff for both owned paths. RED, focused GREEN and owner GREEN before/after snapshots each match internally; the two GREEN input snapshots are identical and match current reviewed inputs. The saved production-head.rs has filter-aware blob 268c865e3066d565c1f1627f7dd3a764efef7e84, equal to HEAD's Windows probe.

Acceptance review:

- DCR-04: APPROVE locally. The real CUDA caller still loads System32 nvcuda.dll, resolves required procedures, initializes CUDA and checks the device-count call before entering the small seam. Zero count remains unavailable; negative or over-limit count remains malformed. For a valid positive count, the seam now queries only ordinal 0. A failing secondary can neither discard valid default facts nor rescue an unknown default.
- Default-device failure remains closed. Device lookup, capability query and LUID query retain their short-circuit failure behavior; invalid capability retains malformed classification. The regression checks that a failed ordinal 0 never calls a healthy secondary. Existing normalization continues to require an unambiguous usable DXGI LUID match, and insufficient/unknown/default capacity cannot fall through to another GPU.
- Free CUDA memory still comes from the default device's context query. The existing retain/push/query/pop/release logic and its validity requirements are unchanged, as is library release. Unknown free memory remains unknown, rejecting CUDA allocations that require it without invalidating otherwise complete CPU facts. Other partial/unknown report conditions are not promoted to complete by this patch.
- DirectML enumeration and ranking, report shape, private identity boundaries, profile admission thresholds and GPU selection behavior outside this correction are unchanged. ADR-0063 now documents the default-only probe and preserves the distinction between synthetic ordering evidence and physical multi-GPU proof.

RED-seam assessment: The RED source is explicitly not byte-identical to HEAD. I inspected behavior-preserving-seam.diff against the saved HEAD source: it moves the original count checks and full ordinal loop into the helper, forwards device lookup/free-memory through closures, retains the capability/LUID function pointers, keeps query short-circuit order and result mapping, and queries free memory only for ordinal 0. The RED snapshot records blob 3cf03f6c0d19b0fb01dc85545708a22295161443, matching the seam revision identified by the diff. Its observed [0, 1] calls are a reproduction through the preserved original enumeration behavior, not a claim that an unmodified production binary failed on physical hardware.

Test evidence reviewed: Supplied normal local PowerShell results with cargo/rustc 1.97.1; I ran no tests, formatter or build.

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml dcr_04`: RED exit 101, one intended secondary-enumeration failure and two passing controls. Exact-current GREEN exit 0, 3/3 passed.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml host_profile_detection`: exit 0, 28/28 passed, including current production Windows probe smoke, capability, unknown/partial facts, default/LUID, optional-admission and DirectML controls.
- `rustfmt --edition 2024 apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs`: supplied exit 0 before both GREEN runs. This is a formatter run, not a separate check-mode claim.

Findings: None.

Remaining uncertainty: Final G5 in both feature modes, G7 and integrated review remain pending. The actual host probe smoke does not certify physical multi-GPU behavior. No new model run, report-schema authority or hardware certification is claimed.

Required next action: No U12 correction required. Preserve this immutable report and receipt, complete the remaining campaign gates and recheck identities before final acceptance. This approval is not a Validation Report or authorization for Git mutations.
