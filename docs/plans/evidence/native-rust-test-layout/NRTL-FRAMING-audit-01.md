# Audit Packet

Target ID: NRTL-FRAMING
Decision: CHANGE
Risk: low
Primary target: apps/desktop/src-tauri/src/tts_service_protocol.rs::tests.
Related context: Canonical control validator; fake-child write_control/run; supervisor spawn/write_control/receive_control/synthesize; handoff failure import; main module declaration. Read-only inspection by clean_code_auditor (GPT-6.1 Sol high).
Concrete evidence: Owner 355 lines; wrapper 300-355, former body 54 lines; absent destination. Explicit selected private-child navigation convention, no production redesign.
Behavior invariants: Every production import/statement/signature/visibility/constant/type/error mapping unchanged: VLTP v1 12-byte framing, kinds 1/2, reserved byte, big-endian lengths, pre-allocation limits 16384/1920000 bytes and 480000 samples, duplicate-key/trailing-input rejection/canonical validation, metadata/alignment/finite float32-le validation. Same private cfg(test), imports and framed helper. Preserve four tests under tts_service_protocol::tests: rejects_declared_over_limit_before_reading_payload; strict_control_decoder_rejects_duplicate_keys; validates_exact_audio_and_rejects_non_finite_values; frame_round_trip_keeps_kind_and_payload. Same ResourceLimit/ProtocolRejected, duplicate-schemaVersion bytes, 19200 zero bytes then NaN mutation, kind/payload assertions. No new cfg/ignore/name, same runtime/privacy/cancellation/ownership/bounds/locator/persistence behavior.
Allowed files: apps/desktop/src-tauri/src/tts_service_protocol.rs; apps/desktop/src-tauri/src/tts_service_protocol/tests.rs.
Proposed edits: Replace wrapper with private #[cfg(test)] mod tests; move exact former body dedented once. Only include change: ../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-audio-metadata.json becomes ../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-audio-metadata.json. Same resolved fixture path, SHA256 e87baae6dfcaa348223e184ce8f0dba13fa4509a17f736f57abe3321069bedcd.
Forbidden edits: Production/caller/contract/fixture/assertion/literal/name/cfg/visibility changes; new abstraction/hooks, lib.rs, integration crates, path overrides, dependencies/manifests, generated/frozen/historical artifacts, unrelated cleanup, Git mutations.
Diff ceiling: Two files, 120 aggregate added/deleted lines (expected 111: parent -56/+1, child +54). Parent 300 lines, child 54.
Baseline commands: pnpm.cmd format:check:rust; pnpm.cmd lint:rust; pnpm.cmd test:rust, root local PowerShell outside sandbox.
Post-change commands: Same three, exact names/results in both modes, unchanged production/assertions/fixture target and bytes; no rename/omission/duplication/ignore/cfg changes allowed.
Documentation impact: Campaign closeout testing/navigation docs, outside source allowlist; no architecture change.
Decision required: none. Fresh independent passing baseline and HASH acceptance required before implementation.
