# Validation Report

> **Sanitized publication copy.** Local identifiers and paths are redacted;
> report IDs, outcomes and validation hashes describe the original execution.
> Original SHA-256: `848ee46dd6ffb3adbe9af519264323446434850f8b2cc8eb9589e89c8fc71194`.
> See [publication and original retention](README.md).

**Report ID:** NFR-CB-POST-CHANGE-20261013-02  
**Target ID:** NFR-CB; combined NFR-SUP/NFR-DIAG/NFR-CB runtime closure  
**Mode:** POST-CHANGE  
**Verdict:** **PASS**  
**Environment:** Local Windows PowerShell launched through Explorer, outside the managed sandbox. Correct process-local model configuration; no global environment changes.  
**Starting HEAD SHA:** `d5ad0427dc58d71bdb678df17454d9412c8488c8`  
**Ending HEAD SHA:** `d5ad0427dc58d71bdb678df17454d9412c8488c8`

**Validated paths:** The two CB work-order paths below, plus the three explicitly frozen SUP/DIAG paths binding combined acceptance.

**Validated path identities:** Each identity is identical before commands and after final restoration.

```text
 M apps/desktop/src-tauri/src/tts_optional_chatterbox.rs
SHA256 39a6e182344cfce02ab769150020beeba813e1c339398db2af71be2968a82679
Blob   f30966642923b6ce4eb9ea713e90ef3f8ad6114d

 M apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs
SHA256 1de23ac4ca227f4aa4e71018fab6cd5760c1917e1a154e6f56f3ca1a8ffe49f0
Blob   f1e3faf8a6daaac78ff701f88b3ae82fd33fe0ad

 M apps/desktop/src-tauri/src/tts_service_supervisor.rs
SHA256 47dbde54f8a0e064902f3ecb64fa23bddcdba4d266c5d9e809c2f26aafbc425c
Blob   ddba85b16e21babfb0305b86c3e876a25be4ffcf

 M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs
SHA256 77ccc590c40192f66da4a2b3e5bea60f7856aeb2de7352999c58ba819eb4c675
Blob   262f98b2e26c88066a75fc1afec85f01863c8dda

 M apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs
SHA256 39b2f11e510e64dfca20a1f6a2fcb0a57dfe6f29ea1ca01ce9bf0847a642da27
Blob   f30c5ebde8272b6d81715c580d92504148259f1f
```

**Identity recheck: PASS.** Final check completed `2026-10-14T00:09:23Z`, normal PowerShell with verified Explorer parentage. HEAD, five source identities, exact porcelain statuses, empty index and original historical package authority remained unchanged. The complete before/final identity files have the same SHA256:

`c8867aa722670684def07f2cf465885c5c6ceba711549dbfdc9487a443eaba8d`

Evidence root **R**: `tmp/evidence/native-rust-function-readability/NFR-CB-POST-CHANGE-20261013-02/`. Package evidence is `R/package/`.

**Commands and outcomes:**

| Exact command | Result |
|---|---|
| `pnpm.cmd format:check:rust` | 0 — PASS |
| `pnpm.cmd lint:rust` | 0 — default and release-locked PASS |
| `pnpm.cmd test:rust` | 0 — default 94 passed/1 ignored; release-locked 93 passed/1 ignored |
| `pnpm.cmd check:portable` | 0 — PASS |
| `pnpm.cmd check` | 0 — PASS |
| `pnpm.cmd test:native-startup` | 0 — PASS, including executable supervisor matrix |
| `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight` | 0 — PASS |
| `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --preflight-only` | 0 — PASS |
| `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --preflight-only` | 0 — PASS |
| `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --preflight-only` | 0 — PASS |
| `node apps/desktop/scripts/bilingual-portfolio-host.mjs --lifecycle-only` | 0 — PASS |
| `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1` | 0 — PASS |
| `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1` | 0 — PASS |
| `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4` | 0 — both Spanish and English PASS |
| `pnpm.cmd install --frozen-lockfile` | 0 — isolated candidate preparation |
| `uv sync --project services/tts --locked` | 0 — isolated candidate preparation |
| `pnpm.cmd build:packages` | 0 — isolated candidate preparation |
| `pnpm.cmd package:windows` | 0 — candidate package PASS |
| `pnpm.cmd package:windows:check` | 0 — candidate verification PASS |
| `node apps/desktop/scripts/ordinary-chatterbox-release-host.mjs --mode preflight --installed-root "<POST_CANDIDATE>\apps\desktop\src-tauri\target\release"` | 0 — PASS |
| `node apps/desktop/scripts/ordinary-chatterbox-release-host.mjs --mode journey --installed-root "<LOCAL_APP_DATA>\VoxLeaf" --installer "<POST_CANDIDATE>\apps\desktop\src-tauri\target\release\bundle\nsis\VoxLeaf_0.1.0_x64-setup.exe" --receipt "<POST_PRIVATE_RECEIPTS>\ordinary-journey.json"` | 0 — complete installed journey PASS |
| `git diff --check` | 0 — PASS, including final closure |

The fresh candidate `<POST_CANDIDATE>` passed physical-copy identity, independent dependency/import and final input-closure checks. It used the approved complete core-environment dependency snapshot; this proves the snapshot build, **not clean-path reproducibility**. Actual maximum NSIS literal length was229. Original tracked package evidence remained unchanged at SHA256 `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.

**Binary and installed identity evidence:**

- Original rebuilt executable: `34b01b814ae00baa4f5b601290d91374dcb99ce5c0833f4db4ed2775349518d9`.
- Candidate raw executable, 11,813,376bytes: `2a076d56296ee55cf03d790fb1d81c830d6d84f4fe653cfeeb4e060c86809599`.
- Installed NSIS executable: `9634fd12d55465afe01c7c20b4351dcbabfb183da7cbdbcd8923626b575e5f8f`.
- Installer, 203,513,116bytes: `4752dab269770c12a74a5d42cb91792241e1659c232a612a2c064f4f0b7e6cfa`.
- Candidate input receipt SHA256: `fbcec7be1206ef4a38f59dac501605585fd392acb2f6db6e05e02d5a60c045c4`.

The approved installed-identity check verified CLI2.12.1, exactly one `__TAURI_BUNDLE_TYPE_VAR_UNK` token, and the three-byte `UNK→NSS` substitution at suffix offset9029586 **in memory only**. Its derived SHA exactly matched the installed journey receipt. Raw binary guards remained intact; no binary was written by this check.

**Installed journey and restoration: PASS.** The receipt confirms release/hostile-development-environment boundaries, consent, download cancellation and cleanup, retry/activation, offline Chatterbox Spanish/English, restart discovery, removal, offline Piper Spanish/English after removal, optional-package reinstall verification and uninstall. All four narration arms reported zero generated audio files and zero external requests.

Execute05 ran once. `13-verified.json`, issued `2026-10-14T00:08:27Z`, confirms:

- `journeyPassed=true`, `journeyExitCode=0`, `restorationVerified=true`.
- Original ordinary-program absence preserved after independently verified candidate absence.
- Original data, private Codex trees, registry and shortcut state verified.
- No restoration claim for pins/jump lists.

Essential private evidence directory:

`<POST_PRIVATE_RECEIPTS>`

Receipt SHA256 values:

- `ordinary-journey.json`: `f6198075f4dc56e82f0e98e545015f7c7bb607b18cb1497062f3d594a08ad40c`
- `13-verified.json`: `56cabc4e5aca0c051be728b4aaa1b88c0a62e20e5130f7bdd3f45fe34d4c2266`
- Private execution-summary receipt (location retained in the local original): `b7b614b2e87acaae4f1602878a5719587b8e9db97dfd3f5c5e5647b68957b243`

**Diff scope: PASS.** CB changes exactly its two authorized files,92 added-plus-removed lines, below120. Existing SUP/DIAG and director documentation changes were preserved. No unrelated source, dependency, manifest or generated-authority edits entered the patch.

**Invariant review: PASS.** The private helper retains all six original identity conditions at both original post-deserialization positions. Full verification remains current-hash-only; cleanup retains its distinct authorized-correction hash policy. Filesystem traversal, cleanup ordering, containment, locks, receipts and errors are unchanged. Combined execution covers the unchanged SUP lifecycle/timing and DIAG cancellation boundaries.

**Test-integrity review: PASS.** The additive six-case test uses valid serialized manifests with matching disposable authority hashes, independently rejects each wrong identity in verification and cleanup, and proves candidate `.pyc` bytes survive. Existing assertions were not weakened. The single formatting correction is covered by this fresh report.

**Privacy/artifact review: PASS.** No books, model weights, audio, secrets or private logs entered the source diff. Detailed preservation evidence remains private; original/private application data verified after restoration. Runtime evidence establishes the required supported-host scenarios, not general performance guarantees.

**Action required:** None for CB post-change or combined runtime acceptance. Director may proceed with the separate documentation closure; this report authorizes no Git mutation.
