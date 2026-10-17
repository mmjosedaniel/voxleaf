# Validation Report

> **Sanitized publication copy.** Local identifiers and paths are redacted;
> report IDs, outcomes and validation hashes describe the original execution.
> Original SHA-256: `cac63f1f51f854b242f2502cdbc822b55c744fb27f284b66dbc92d1b6a05cd2e`.
> See [publication and original retention](README.md).

Report ID: **NFR-CB-POST-CHANGE-20261013-01**  
Target ID: NFR-CB  
Mode: POST-CHANGE  
Verdict: **FAIL**  
Environment: local PowerShell 5.1.26100.9444 outside sandbox with verified Explorer parentage; pnpm 11.15.1, Node 24.20.0.  
Starting HEAD SHA: `d5ad0427dc58d71bdb678df17454d9412c8488c8`  
Ending HEAD SHA: `d5ad0427dc58d71bdb678df17454d9412c8488c8`

Validated paths: the two CB work-order files. The three accepted SUP/DIAG files were additionally bound for combined validation.

Validated path identities, identical before/after; each has exact porcelain `" M <path>"`:

| Path under `apps/desktop/src-tauri/src/` | SHA-256 | Filter-aware blob |
|---|---|---|
| `tts_optional_chatterbox.rs` | `d51cfbd848be8ac4975a5be2d1f22edff6c29416def5c0f655d9d1d1a531c4aa` | `f9b86c5c3975524b58ef2cfbac2d22c187f5966e` |
| `tts_optional_chatterbox/tests.rs` | `1de23ac4ca227f4aa4e71018fab6cd5760c1917e1a154e6f56f3ca1a8ffe49f0` | `f1e3faf8a6daaac78ff701f88b3ae82fd33fe0ad` |
| `tts_service_supervisor.rs` | `47dbde54f8a0e064902f3ecb64fa23bddcdba4d266c5d9e809c2f26aafbc425c` | `ddba85b16e21babfb0305b86c3e876a25be4ffcf` |
| `tts_service_supervisor/tests.rs` | `77ccc590c40192f66da4a2b3e5bea60f7856aeb2de7352999c58ba819eb4c675` | `262f98b2e26c88066a75fc1afec85f01863c8dda` |
| `tts_service_supervisor/host_diagnostics.rs` | `39b2f11e510e64dfca20a1f6a2fcb0a57dfe6f29ea1ca01ce9bf0847a642da27` | `f30c5ebde8272b6d81715c580d92504148259f1f` |

Identity recheck: **PASS.** HEAD, five source identities and empty index unchanged. Historical package evidence remains `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.

Commands and outcomes:

1. `git diff --check` → **0/PASS**.
2. `pnpm.cmd format:check:rust` → **1/FAIL**. Rustfmt requires this wrapping in the new helper:

   ```rust
   || runtime.package_id
       != format!("voxleaf-chatterbox-v{}", manifest.identity.package_version)
   ```

3. Remaining Rust, combined, model and packaging gates → **NOT RUN**, stopped after the first common gate failed. No candidate or installation operation started.

Diff scope: **PASS.** Exactly two CB files, 91 added-plus-removed lines, within the 120-line ceiling. Existing SUP/DIAG and director documentation preserved.

Invariant review: **PASS on static inspection; runtime validation incomplete.** The helper contains the original six conditions. Both calls follow their original deserialization; full-verification and cleanup hash policies remain distinct. No I/O, containment, cleanup, locking or public-contract changes.

Test-integrity review: **PASS on inspection; not executed.** Six invalid-identity cases use fresh valid fixtures and matching disposable manifest hashes. Each requires verification and cleanup rejection and preserves exact bytecode bytes. Existing assertions remain intact.

Privacy/artifact review: **PASS.** No prohibited artifacts entered the diff; no source, Git, installation or user-data mutation by the validator.

Evidence: `tmp/evidence/native-rust-function-readability/NFR-CB-POST-CHANGE-20261013-01/` (local raw receipts and log).

Action required: issue correction loop 1 for **only the rustfmt line wrapping at `tts_optional_chatterbox.rs:950`**, then validate the new identities under a fresh report.
