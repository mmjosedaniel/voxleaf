# Change Review Report

Review ID: **FPA-U8-2.1-CR-R1-20261111**  
Task ID: U8 case 2.1  
Verdict: **APPROVE**  
Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

**Reviewed paths and identities:** Incorporated closed 21-path manifest `tmp/evidence/five-pass-audit/u8-2.1-review-inputs.txt`, including each path’s status, SHA-256, and filter-aware blob identity.

- Manifest SHA-256: `20FBEAF60522A42767C6248EC4B999705D8A110D2FB81E8F38CE59D018A283EB`
- Exact six-file patch: `tmp/evidence/five-pass-audit/u8-2.1-review.diff`
- Patch SHA-256: `30555CA2BCBA91CD32170E6160616299AA79287BA05281C7EE9050384A244914`

**Identity recheck: PASS.** Before and after review, HEAD and all 21 manifested path identities matched; the index remained empty. Current six-file diff matches the supplied 235-line artifact. Both manifested native test executable hashes match. All 527 native and 613 desktop captured input rows match current files, with identical before/after manifests. The 251 built artifacts match the U6 manifest `A37841A04AA3C673316D43E03276DE7539B58FC0AAC67D1AE99564A306330466`; this establishes artifact equivalence, not reuse of historical test approval.

**Acceptance review:** Case 2.1 satisfies its declared unit scope.

- Native Select preserves the existing Confirming operation and exact cancellation token at both the initial snapshot and locked recheck. Download admission still rejects an explicitly cancelled token after replacement confirmation.
- Client Select during pending acquisition returns the current snapshot without issuing another IPC, incrementing action ownership, or detaching the pending download. Terminal success/failure retain authority over stale polls.
- Remount coverage preserves pending state, disabled duplicate download, polling, terminal settlement, and timer cleanup.
- Cancel, Remove, and replacement Download retain their separate supersession controls. Replacing the old Select expectation with explicit same-acquisition assertions implements the approved behavior rather than weakening unrelated protections.
- No new public IPC contract, unbounded storage, model download, inference, or EPUB-content handling is introduced.

**Test evidence reviewed:** Supplied normal-host PowerShell receipts, not commands run by this reviewer:

- Native RED: one intended cancellation-token failure; desktop RED: three intended ownership/remount failures.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests`, and the corresponding `--features release-locked-runtime` command: **77 passed, 3 ignored each**.
- Recorded desktop Vitest command covering client, controls, ReaderSettingsDialog, settings actions, and App: **209 passed**.
- Scoped Prettier/ESLint, desktop typecheck, native formatting, and Clippy in both feature modes: **exit 0**.

Native evidence binds to manifest `F8823C96D3F7E8D1E9BBD769068AC908F9A745CB79F116EC47FF008D0A42E412`; desktop evidence binds to `03435F4556FE642362E9AF32E968687C658C4A7BD786064915A71969780BB097`.

**Findings:** None.

**Remaining uncertainty:** G8 and final product/native/integrated acceptance remain pending. The ignored native checks do not satisfy G8. Cases 2.2 and ADD-01 are outside this approval.

**Required next action:** None for this scoped review. Complete the plan’s outstanding gates before final acceptance. This report does not authorize Git mutations.
