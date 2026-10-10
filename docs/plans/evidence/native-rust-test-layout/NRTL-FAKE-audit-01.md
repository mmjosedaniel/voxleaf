# Audit Packet
Target ID: NRTL-FAKE
Decision: CHANGE
Risk: low
Primary target: apps/desktop/src-tauri/src/tts_service_fake_child.rs::tests::{command, normal_child_emits_canonical_ordered_complete_unit}.
Related context: diagnostics CLI dispatch, supervisor ServiceChild configured/command and host diagnostic, production framing, main module. Read-only clean_code_auditor GPT-6.1 Sol high inspection.
Concrete evidence: Owner408lines, wrapper337-408, body70lines, child absent. Requested private-child convention preserves runtime-callable synthetic child.
Behavior invariants: All production declarations/statements/scenario and argument constants/Scenario::from_argument/protocol order/identities/4800samples/19200bytes/float values/75msdelay/pending cancellation and shutdown/crash/descendant stdio and300slifetime unchanged. run_child, run_descendant, run_child_with and all production helpers remain executable outside cfg(test), same signatures/visibility/errors. Same private cfg(test), imports, command helper and one tts_service_fake_child::tests::normal_child_emits_canonical_ordered_complete_unit test: handshake/load/warm/synthesize/shutdown input order, Normal execution/frame decoding, consecutive audioMetadata/audio/completed window and final state assertion. Same fixture/assertion/name/cfg/ignore state and privacy/locality/audio/cancellation/ownership/bounds/locator/persistence behavior.
Allowed files: apps/desktop/src-tauri/src/tts_service_fake_child.rs; apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs.
Proposed edits: Replace wrapper with private #[cfg(test)] mod tests; move exact70-linebody dedented once. Only include_str ../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json becomes ../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json. Same resolved packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json, SHA256 b57cf18ab2b6a922d9018f028a7b1002d2916b706f7b574299cb30f2f7600753.
Forbidden edits: Production/helper/diagnostic/caller/cfg/scenario/protocol/identity/timing/cleanup/assertion/name/fixture/visibility changes; abstraction/hooks/lib.rs/integration crates/path overrides/dependencies/manifests/generated/frozen/historical artifacts/unrelated cleanup/Git mutations.
Diff ceiling: Two files155aggregate changed lines(expected143: parent-72/+1 child+70), parent337 child70 allowing necessary rustfmt wrapping.
Baseline commands: pnpm.cmd format:check:rust; pnpm.cmd lint:rust; pnpm.cmd test:rust, root local PowerShell outside sandbox.
Post-change commands: Same three, exact identities/results per config with no changes, production/test/assertion/fixture equivalence. Campaign check/native-startup cover executable diagnostics; no additional per-unit gate justified.
Documentation impact: Campaign testing/navigation closeout outside allowlist; no architecture change.
Decision required: none. Earlier units accepted and fresh passing baseline required before implementation.
