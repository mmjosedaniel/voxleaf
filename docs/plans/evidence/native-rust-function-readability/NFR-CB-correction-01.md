# APPROVED WORK ORDER

Target ID: NFR-CB, correction loop 1. Risk: low, formatting only.
Parent: [approved order](NFR-CB-work-order-01.md).
Baseline PASS: [NFR-CB-BASELINE-20261013-03-FINAL-01](NFR-CB-baseline-03-final.md).
Correction evidence: [NFR-CB-POST-CHANGE-20261013-01](NFR-CB-post-01.md), FAIL.
HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`; empty index.
Only allowed path: `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`.
Expected SHA-256: `d51cfbd848be8ac4975a5be2d1f22edff6c29416def5c0f655d9d1d1a531c4aa`.
Expected blob: `f9b86c5c3975524b58ef2cfbac2d22c187f5966e`.
Expected porcelain: ` M apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`.

Apply only the exact rustfmt wrapping shown in the failure report. Preserve
all semantics, tests and other work. The original two-file ceiling remains
120 added-plus-removed lines. No other edits or Git mutations are authorized.
Worker runs no validation; return Change Packet and become idle.
Independent acceptance requires a fresh report and all parent-order gates,
plus the already authorized combined closure gates; none passed in post01
except whitespace/identity checks, so there is no runtime result to reuse.
