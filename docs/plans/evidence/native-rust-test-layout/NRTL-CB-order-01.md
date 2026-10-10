# APPROVED WORK ORDER

Target ID: NRTL-CB
Goal: Apply the explicitly selected private Rust child-test layout while preserving all production and test behavior.
Risk: low
Allowed files: apps/desktop/src-tauri/src/tts_optional_chatterbox.rs; apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs.
Required edits:
1. Replace wrapper with private #[cfg(test)] mod tests; move entire 987-line body dedented once, rustfmt rewrapping only. Two child include_bytes paths ../../../../services/tts/release/optional/chatterbox/optional-package-manifest-v2.json become ../../../../../services/tts/release/optional/chatterbox/optional-package-manifest-v2.json. Same resolved services/tts/release/optional/chatterbox/optional-package-manifest-v2.json SHA256 8242bfd841a8aed01dc914c743df69b90a4ed8e13883ea03a6568b0d3e92d25d. Three parent includes remain untouched: generated __init__.py SHA256 17a64d50b529456f687df12500bd11c344b421ca33d87e3aedc21c1cdad14033; generated protocol_schemas.py SHA256 6a00feebccaf7584f8304bd796661790c90efaa30b641b96d20fcd858a5f8650; v3 manifest SHA256 c1d650b589d287974c008229dfd553700a83d87edaaae705a35fd13caffedf12, at current services/tts targets.
Behavior invariants:
1. Every production statement/declaration/import/constant/interface/platform/feature gate/include unchanged. Preserve v3 authority, six revision/hash/size-frozen files, split runtime, pre-network host admission/consent/bounds/redirects/cancellation/reassembly/extraction/atomic promotion/owned-root removal/receipts/tree checks/serialized installed access/content-free errors, v2 cleanup-only roots/unrelated roots/cache limits/default and release selection/stop before removal. All 30 test names/statements/assertions/bytes/cleanup unchanged. Preserve cfg(unix) on transient_numba_cache_rejects_a_symlink_outside_the_package and installed_package_root_rejects_a_symlink_outside_the_managed_root; other 28 unconditional. Same private cfg(test), imports, atomic nonce/counter, TestRoot::drop, two workers/three-party Barrier, joins and receipt invalidation. No new ignore/features or runtime/privacy/locality/ownership/bounds/persistence changes.
Forbidden changes:
1. Production/verifier/mutation/manager/runtime/helper/caller/fixture/generated-authority/assertion/test-name/cfg/cleanup/concurrency/lock/receipt/visibility changes; hooks/abstractions/lib.rs/integration crates/path overrides/dependencies/manifests/historical/frozen/unrelated/Git mutations.
Diff ceiling: Two files, 2150 aggregate added/deleted lines; raw move 1977 (parent -989/+1, child +987), 173-line margin only for necessary rustfmt/include wrapping. Parent 2139 lines.
Baseline evidence: NRTL-CB-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, exact allowlist identities in immutable report; live HEAD/SHA/ABSENT and empty index rechecked before freezing.
Worker validation: Read-only diff/scope inspection only. No validation tests or whole-repository formatting.
Acceptance commands: Same three; exact identities/results per configuration, two Unix-only tests explicitly unexecuted on Windows; no omission/rename/duplicate/ignore changes, unchanged production, equivalent moved tokens/assertions except include depth, same fixture targets/hashes and cleanup/locks. Campaign aggregate gates; no download/installed-model journey/performance claims.
Completion output: Change Packet only; no staging, commit, push, branch, PR or publication.

Immutable order NRTL-CB-order-01, issued by director only after accepting audit and fresh independent baseline. Source writer and validator idle at issuance.
Baseline allowlist identity record:

[
  {
    "path": "apps/desktop/src-tauri/src/tts_optional_chatterbox.rs",
    "status": [],
    "sha256": "8966b977a42213e3b0f374aa49fac57124bb4583568982cf138c12354bf329b7",
    "blob": "357b764ff987c0b368502fd3c56f7549dbc118ed"
  },
  {
    "path": "apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  }
]
