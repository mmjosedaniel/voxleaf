# Change Review Report

Review ID: DCR-U6-R1-ASTRA-20261109-01
Task ID: U6 / DCR-19
Verdict: APPROVE — local unit review only
Base commit and reviewed HEAD: d375ecc84261c404e855c055e0ecc8949a97caaf

Reviewed paths and identities: Incorporate the complete ten-row manifest in [DCR-U6-EXEC-20261109-01](u6-dcr-19-execution.md), SHA-256 247d33c27e593fe74baa658990e2807ecd7ac2c374713e11df9e1ebbb9bd6853. The first three rows are the U6 patch. The testing guide's prior U10/U15 contributions remain present; this report assesses U6's removal documentation without renewing those earlier reports. Other campaign changes and root execution-status edits are excluded.

Identity recheck: PASS. All ten reviewed paths matched their recorded SHA-256, filter-aware blob and status on initial and final comparisons. HEAD remained the stated commit, index empty. review-patch.diff equals the current diff for the three owned paths. RED, focused GREEN, initial owner and final owner snapshots each match before/after execution. RED removal-production blob matches HEAD. Between the failed and final owner runs, only tests.rs changed; production remained identical. Final owner inputs match the reviewed current patch.

Acceptance review:

- DCR-19: APPROVE locally. Removal constructs the complete fixed list of nine managed destinations, validates their chains and the backup tree, and only then begins directory deletion. Each chain is inspected from the managed root through successive normal path components using symlink_metadata in production. Existing directories must be real directories without symlink/reparse attributes. An unsafe intermediate ancestor is rejected before a missing leaf can be treated as absent. Explicit NotFound remains absence; permission and other metadata errors fail verification. Existing canonical containment checks remain an additional guard.
- The preflight includes current, backup, retained and legacy packages, cache and staging. The new regressions place the unsafe staging ancestor late in that list and assert the current package still exists after rejection. They cover an in-root sibling, an outside-root sibling and an absent redirected leaf using real Windows junctions. Removing only the synthetic junction allows retry; redirected and unrelated sentinel bytes remain unchanged.
- Backup-tree validation still rejects nested reparse points and unsupported entries with its existing depth bound. The installed-runtime lock covers both preflight and deletion; the manager reserves Removing before that work. The service-removal caller retains its admission guard after verified stop, and existing tests exercise exclusion of configuration/spawn and rejection before deletion when termination is unverified.
- Verification failure preserves owned data and reports Failed, permitting retry after repair. Later filesystem deletion errors retain the existing partial-cleanup/retry behavior; this patch does not claim transactional rollback for sharing violations. Normal removal, locked cache/backup retry, dangling leaf links and unrelated sibling preservation remain covered.
- The denied-cache fixture correction creates the real parent before injecting a leaf PermissionDenied result. Without that parent, the new chain walker correctly observed an earlier NotFound and never reached the synthetic denied leaf. The correction preserves discovery, verification-failure and post-denial assertions; it does not weaken the failure contract.
- The change adds no destination, package-format, acquisition/promotion behavior, external-data flow or inference claim. The testing guide accurately describes preflight of all managed chains before deletion.

Test evidence reviewed: Supplied normal local PowerShell results, cargo/rustc 1.97.1. I ran no tests, formatter or build.

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml dcr_19`: RED exit 101, three intended real-junction failures against unchanged removal production. Focused GREEN exit 0, 3/3 passed at 21:43:21–21:43:26 UTC.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests`: first owner attempt exited 101 on the unrealistic denied-leaf fixture, with 75 passing and three ignored. Final exact-input run exited 0 at 21:44:29–21:44:37 UTC, 76 passed and three ignored, including all three DCR-19 cases. The failed receipt remains retained separately.
- `rustfmt --edition 2024 apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` and final `rustfmt --check --edition 2024 apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` both have supplied exit 0 receipts.

Findings: None.

Remaining uncertainty: Final G5, G7, mandatory exact-local G9 and integrated review remain pending. The three ignored exact-v7 opt-in cases were not executed by this owner run; no new installed-package admission or model inference result is established.

Required next action: No U6 correction required. Preserve this immutable report and receipt, complete the pending campaign gates and recheck identities before final acceptance. This approval is not a Validation Report and does not authorize staging, commit, push or PR creation.
