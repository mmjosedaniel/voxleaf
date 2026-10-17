# Validation Report

> **Sanitized publication copy.** Local identifiers and paths are redacted;
> report IDs, outcomes and validation hashes describe the original execution.
> Original SHA-256: `91f79e82808a8c5805fd7ff7261abb71a51be1e3df2269b1c16cac0137ae9f72`.
> See [publication and original retention](README.md).

Report ID: NFR-CB-BASELINE-20261013-01
Target ID: NFR-CB
Mode: BASELINE
Verdict: BASELINE-FAIL
Environment: local PowerShell outside sandbox; validation/preparation commands
used `require_escalated`. PowerShell 7.6.5, process-local Corepack pnpm 11.15.1,
Node 24.20.0, Cargo/rustc 1.97.1, Python 3.12.10, uv 0.11.29. Isolated
dependencies used copy mode.

Starting and ending HEAD SHA: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.

Validated paths and identities:

| Path | Exact porcelain before/after | Worktree SHA-256 before/after | Filter-aware expected blob before/after |
| --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` | empty output | `e525734297ce7cf8b437e5fc50b75a9f6d680ca6fc56707ee36acae5caf45ecf` | `8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513` |
| `apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs` | empty output | `e0c1dad918fe95b11ed38d8739a16650ee27fefe3c7beaa6d0212b9e2059d8df` | `2cf45dc8c74b27a4a68b12dd2c0cc904045df7b2` |

Identity recheck: PASS. HEAD/paths unchanged, index empty before/after and
`git diff --check` exit 0 before/after.

Candidate: `<ATTEMPT_01_CANDIDATE>`.
Its input manifest contains 1,236 tracked current files, six authority-declared
Piper voice assets and four verified download-cache artifacts. All 1,246
original/copied hashes matched after failure. No `.git`, original dependency
environment or build-output directory was linked into it. Python service import
resolved within the copy.

Evidence directory:
`tmp/evidence/native-rust-function-readability/NFR-CB-BASELINE-20261013-01/`.

- `candidate-inputs-before.json`: `c3b74d6221a283aed119008446f5ab84f06f1e1720caf5b8700622fe4ec41375`.
- `candidate-inputs-after.json`: `a3822beba8d5dc11671db44bcc1998e70304d0d91a6300e2ffbd825753d56dd2`.
- Original `windows-package-evidence-v3.json` unchanged: `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.

## Commands and outcomes

1. Original root: `pnpm.cmd format:check:rust` -> exit 0.
2. Original root: `pnpm.cmd lint:rust` -> exit 0, both default/release-locked all-target configurations.
3. Original root: `pnpm.cmd test:rust` -> exit 0, default 87 passed/0 failed/1 ignored; release-locked 88 passed/0 failed/1 ignored.
4. Candidate preparation: `pnpm.cmd install --frozen-lockfile` -> exit 0, own locked dependencies with copy import mode.
5. Candidate preparation: `uv sync --project services/tts --locked` -> exit 0, own environment with `UV_LINK_MODE=copy`.
6. Candidate preparation: `pnpm.cmd build:packages` -> exit 0.
7. Candidate preparation: `& services/tts/.venv/Scripts/python.exe -c 'import voxleaf_tts; print(voxleaf_tts.__file__)'` -> exit 0; candidate-local source import.
8. Candidate root: `pnpm.cmd package:windows` -> exit 1 during `package:piper-core`: `voxleaf_tts.release_core.ReleaseCoreError: piper-core-runtime-manifest-stale`. Own locked core environment was provisioned; generated runtime manifest rejected against copied existing authority. Tauri/installer build not reached.
9. `pnpm.cmd package:windows:check` -> NOT RUN after failure.
10. Ordinary artifact preflight -> NOT RUN, no new executable/installer.
11. Ordinary acquisition journey -> NOT RUN, preparation failed before installation authorization could be consumed.

Failure log `07-package-windows.log` SHA-256:
`b847534594acb8018d4cba49f69715fa7364ff882a2525d5d773e6423657249e`.
No authority regeneration, command substitution or repair was attempted.

## Reviews and disposition

Diff scope: PASS. Both CB paths pristine. Accepted DIAG extraction and director
documents are outside allowlist. No generated candidate output entered original
diff.

Invariant review: FAIL, required executable evidence incomplete. Static review
confirms identical identity predicates and distinct current-only versus
current-or-correction hash policies. Rust tests establish unchanged deterministic
baseline, not installed verification, cleanup, acquisition, narration, restart,
removal or reacquisition. Exact mismatch cause remains undiagnosed; failure
precedes any CB source change.

Test-integrity review: PASS. Assertions, fixtures, feature/platform conditions
and names unchanged; ignored fixture distinct from passing owning regression.

Privacy/artifact review: PASS. Original application, Local/Roaming data and
models were not backed up, moved, removed or modified by this phase. Install
and Local AppData roots remain present. Only isolated dependencies/build outputs
and ignored evidence were created; original tracked authority intact.

Action required: no CB implementation order or uninstall. Investigate mismatch
under a separately bounded action, preserve this report, then obtain a new full
baseline. Successful candidate preflight must precede protected host
backup/uninstall and the mandatory journey.
