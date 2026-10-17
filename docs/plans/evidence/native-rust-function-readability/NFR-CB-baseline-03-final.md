# Validation Report

> **Sanitized publication copy.** Local identifiers and paths are redacted;
> report IDs, outcomes and validation hashes describe the original execution.
> Original SHA-256: `99f469c6be0ff9234e87bb0037326b0478e9569983ea6011e40b8a879328351b`.
> See [publication and original retention](README.md).

Report ID: **NFR-CB-BASELINE-20261013-03-FINAL-01**  
Target ID: NFR-CB  
Mode: BASELINE  
Verdict: **PASS**  
Environment: normal local PowerShell outside sandbox, launched through Explorer; no sandbox results used for acceptance.  
Starting HEAD SHA: `d5ad0427dc58d71bdb678df17454d9412c8488c8`  
Ending HEAD SHA: `d5ad0427dc58d71bdb678df17454d9412c8488c8`

This report completes [preparation03](NFR-CB-baseline-03-preparation.md). Its results remain immutable. The installed journey passed, restoration passed, and additional read-only evidence establishes the exact packaged executable identity. **Execute04’s original raw-executable comparison remains failed; this report does not relabel that guard as passed.**

Validated paths and identities, unchanged before/after:

| Path under `apps/desktop/src-tauri/src/` | Porcelain | SHA-256 | Filter-aware blob |
|---|---|---|---|
| `tts_optional_chatterbox.rs` | Empty | `e525734297ce7cf8b437e5fc50b75a9f6d680ca6fc56707ee36acae5caf45ecf` | `8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513` |
| `tts_optional_chatterbox/tests.rs` | Empty | `e0c1dad918fe95b11ed38d8739a16650ee27fefe3c7beaa6d0212b9e2059d8df` | `2cf45dc8c74b27a4a68b12dd2c0cc904045df7b2` |

Identity recheck: **PASS.** Index empty; original input manifest unchanged; candidate runner and WebDriver client matched their bound inputs. Original historical package evidence remains `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.

Commands and outcomes:

1. `pnpm.cmd format:check:rust` → **0/PASS**, preparation03.
2. `pnpm.cmd lint:rust` → **0/PASS**, default and release-locked configurations.
3. `pnpm.cmd test:rust` → **0/PASS**, default 93 passed/1 ignored; release-locked 92 passed/1 ignored.
4. `pnpm.cmd package:windows` → **0/PASS**, isolated candidate `<BASELINE_CANDIDATE>`.
5. `pnpm.cmd package:windows:check` → **0/PASS**, same candidate.
6. `node apps/desktop/scripts/ordinary-chatterbox-release-host.mjs --mode preflight --installed-root "<BASELINE_CANDIDATE>\apps\desktop\src-tauri\target\release"` → **0/PASS**, ordinary and hostile environments.
7. From `<BASELINE_CANDIDATE>`:

   ```powershell
   node apps/desktop/scripts/ordinary-chatterbox-release-host.mjs --mode journey --installed-root "<LOCAL_APP_DATA>\VoxLeaf" --installer "<BASELINE_CANDIDATE>\apps\desktop\src-tauri\target\release\bundle\nsis\VoxLeaf_0.1.0_x64-setup.exe" --receipt "<BASELINE_PRIVATE_RECEIPTS>\ordinary-journey.json"
   ```

   → **0/PASS**. All 17 required steps completed: installation, compatibility/consent, download cancellation and cleanup, retry, Chatterbox Spanish/English narration, restart discovery, removal, Piper Spanish/English fallback, optional-package reinstall/verification, and uninstall.

The first six results are retained from preparation03 under unchanged identities, not rerun or substituted. Its dependency provisioning and isolation evidence remain applicable. This is a **dependency-snapshot build**, not arbitrary-path clean-build reproducibility evidence.

**Executable identity reconciliation**

| Artifact | SHA-256 |
|---|---|
| Raw release executable, 11,803,136 bytes | `4c782573b183bd8ba82465f8697afc1c03ed6472ad8a27378815680d0aa2e341` |
| Installed NSIS executable, same size | `6ed59adab48ca963b6d6213f37b75bc928c52ac4875f0b3c7e98cb487cabf984` |
| Installer, 203,519,448 bytes | `f8b229fbe0037204c761e7882e45e1d40d630343427901d4cf18bd63bdee8da6` |

Execute04 rejected the raw/installed executable difference with `journey-receipt-artifact-identity`. The additional authorized normal-host probe found exactly one `__TAURI_BUNDLE_TYPE_VAR_UNK` token. Replacing only its three-byte suffix with `NSS` **in memory**, at offset 9,020,290, produced exactly the installed receipt hash above. No binary was written; raw executable and installer hashes remained unchanged.

The probe independently checked the complete journey receipt schema, exact steps, outcomes, artifact sizes and identities. It passed in PowerShell with verified Explorer parentage. This explains the complete byte difference without changing a repository assertion or repeating the journey.

**Restoration: PASS**

Execute04 ran once under `NFR-CB-INSTALLED-BASELINE-20261013-01`, normal PowerShell with verified Explorer parentage. Final restoration receipt was issued at **21:50:35Z**:

- Candidate uninstall and independent stable absence/process-quiescence checks passed.
- Original ordinary program absence was preserved; no original uninstaller was run.
- Ordinary LocalAppData returned and passed full identity verification; original Roaming absence was preserved.
- Captured registry/shortcut state and original absences were restored and verified.
- Codex-private application data, program and shortcut remained unchanged.
- Final original-input and candidate-artifact checks passed.

The private backup remains at `<BASELINE_PRIVATE_BACKUP>`. No cleanup is authorized by this report. Pins and jump lists are not claimed restored.

**Evidence**

Private execution evidence resides in:

`<BASELINE_PRIVATE_RECEIPTS>`

| Receipt | SHA-256 |
|---|---|
| `ordinary-journey.json` | `d8e4b78717eb5dcaff215ea42a6e867bb2b2a9da947069ffc986a53f708a6928` |
| `ordinary-journey.log` | `28051717d3c084b68f38f3bf7e5647e668bd2fd10ed1cc5e8b961e7c3f162c6f` |
| `06-journeyFinished.json` — original failed comparison | `e2f33204601a5a1415fe504e17bd33d8262057247eb2e8b2079e9fe87cc948ae` |
| `07-candidateAbsent.json` | `d6c6ee151f0070f7ae89ed31fecc59dccdcbd6778a021b697b5d36924c0afeaf` |
| `13-verified.json` — restoration PASS | `30c14b49df9e3c08d00f4818c17f6b30309e7938b52db65c3b8482545b59d845` |

Additional diagnostic: `tmp/evidence/native-rust-function-readability/NFR-CB-BUNDLE-IDENTITY-20261013-01/result.json` (local only), SHA-256 `806eee7cb349fe0c83d3e2d8ccfef617020b8a3f3ec644deb9a003da1c579546`.

Diff scope: **PASS.** Both CB paths remain pristine. Previously accepted SUP/DIAG changes are preserved; no validator source or Git mutations occurred.

Invariant review: **PASS for baseline.** Current hash-admission distinctions, installed verification and cleanup boundaries remain unchanged. Required installed lifecycle, cancellation, bilingual narration, removal and fallback behavior executed successfully. The proposed CB extraction and regression test still require their own post-change validation.

Test-integrity review: **PASS.** Repository commands, assertions, selectors and timeouts were unchanged. The additional probe reconciles artifact identity; it does not replace a functional gate.

Privacy/artifact review: **PASS.** No private artifacts entered the diff. Journey receipt reports no private book text logged; observed narration arms reported no generated audio files or external requests. Detailed preservation evidence remains private.

Action required: **None for baseline validation.** Director may issue the bounded CB work order against these exact identities.
