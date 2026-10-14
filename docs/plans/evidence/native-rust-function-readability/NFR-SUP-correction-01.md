# CORRECTION ORDER

Target ID: NFR-SUP. Correction loop: 1 of at most 2.
Failed criterion: Rust format gate.
Evidence: [NFR-SUP-POST-CHANGE-20261013-01](NFR-SUP-post-01.md), FAIL;
`01-gate.log` contains the two exact rustfmt changes.

Allowed file: `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs` only.
Required change: apply only the requested multiline return tuple for
`channel_session` and multiline seeded-state `set_state("loading").expect(...)`
chain. No behavior, assertions, fixture, production or other-file edits.
Preserve the original SUP work order, its 320-line ceiling and all other work.
No tests/validation, documentation or Git operations by worker.

Revalidation: all twelve exact baseline-03 commands, normal host Explorer
PowerShell and correctly scoped model variables, under a fresh Report ID.
Return a precise Change Packet; independent validator is idle during edits.
