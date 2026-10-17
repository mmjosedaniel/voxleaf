# CORRECTION ORDER

Target ID: NFR-SUP. Correction loop: 2 of at most 2.
Failed criterion: default Clippy unused-variable errors.
Evidence: [NFR-SUP-POST-CHANGE-20261013-02](NFR-SUP-post-02.md), FAIL.
Allowed file: `apps/desktop/src-tauri/src/tts_service_supervisor.rs` only.

In `synthesize_measured`, remove only the unused `generating` and `ready`
bindings. Keep the two `receive_expected_state(...)?` calls as statements in
exactly their current positions, with identical arguments and propagation.
No warning suppression, underscore bindings, assertion, test, timing, guard,
production-neighbor, documentation or Git changes. Preserve all other work.

Revalidation: all twelve baseline-03 commands in verified normal host PowerShell
with correctly scoped environment and a fresh immutable Report ID.
Worker runs no validation commands. Any further failure requires the director
to reassess/redesign the bounded order rather than append another correction.
