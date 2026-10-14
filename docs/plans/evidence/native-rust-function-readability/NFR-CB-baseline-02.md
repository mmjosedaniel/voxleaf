# Validation Report

> **Sanitized publication copy.** Local identifiers and paths are redacted;
> report IDs, outcomes and validation hashes describe the original execution.
> Original SHA-256: `9aa192c9ee5138d6168edbfe17b85daa76369b475deffb2a4cba1856b498f0ab`.
> See [publication and original retention](README.md).

Report ID: NFR-CB-BASELINE-20261013-02  
Target ID: NFR-CB  
Mode: BASELINE  
Verdict: BASELINE-FAIL  
Environment: independent Astra validator, local PowerShell outside sandbox.

Starting and ending HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.

| Validated path under `apps/desktop/src-tauri/src/` | Exact porcelain | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `tts_optional_chatterbox.rs` | no output | `e525734297ce7cf8b437e5fc50b75a9f6d680ca6fc56707ee36acae5caf45ecf` | `8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513` |
| `tts_optional_chatterbox/tests.rs` | no output | `e0c1dad918fe95b11ed38d8739a16650ee27fefe3c7beaa6d0212b9e2059d8df` | `2cf45dc8c74b27a4a68b12dd2c0cc904045df7b2` |

Identity recheck: PASS. HEAD, source identities, overall porcelain and empty
index unchanged. All 3,407 original copied inputs remained unchanged. Candidate
tracked inputs remained unchanged. Original/candidate historical Windows package
evidence retained SHA-256 `f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`.

## Commands and results

| Working directory | Exact command | Result |
| --- | --- | --- |
| Original repository | `pnpm.cmd format:check:rust` | 0, PASS |
| Original repository | `pnpm.cmd lint:rust` | 0, default and release-locked-runtime PASS |
| Original repository | `pnpm.cmd test:rust` | 0, default 87/locked 88 pass, one intentional ignore each |
| Candidate | `pnpm.cmd install --frozen-lockfile` | 0, own dependencies, process-local import method copy |
| Candidate | `uv sync --project services/tts --locked` | 0, own base environment, process-local UV_LINK_MODE=copy |
| Candidate | `pnpm.cmd build:packages` | 0 |
| Candidate | `pnpm.cmd package:windows` | 1, NSIS bundling failed after core integrity/smoke and release executable build passed |
| Candidate | `pnpm.cmd package:windows:check` | NOT RUN after failure |
| Candidate | Ordinary artifact preflight and installed journey | NOT RUN after failure |
| Original repository | `git diff --check` | 0 |

Candidate: `<ATTEMPT_02_CANDIDATE>`.
This dependency-snapshot build does not establish clean-path reproducibility.
It physically copied 1,236 tracked inputs, six verified Piper assets, four
verified cache artifacts and 2,161 complete original core environment files.
Every initial copy matched its source hash and had a distinct file identity;
no reparse entries or shared hardlinks were admitted. The unchanged builder
rebound VoxLeaf to candidate-local imports. Only its distribution's
`direct_url.json`, `RECORD` and `uv_cache.json` changed through that reinstall;
all 13 third-party RECORDs remained unchanged. Copied launchers were not run.

NSIS failed opening the resource ending
`onnxruntime/tools/ort_format_model/ort_flatbuffers_py/fbs/RuntimeOptimizationRecordContainerEntry.py`
at generated `installer.nsi:2213`. The file exists, is 3,832 bytes, and hashes to
`3cceff47491b9c5dcadf6aa82ce20f5e67ae7507e3d29bda6cc40b07e163444c`.
Literal path length is 263, normalized length 231. This supports, but does not
prove, a path-length explanation. No installer was produced.

| Artifact | SHA-256 |
| --- | --- |
| Release executable, 11,795,456 bytes | `5f23c7a3b7d3e9f98970dfa06da6cda3ff300c9e26b5b3d801de95712b43eff6` |
| Built and checked-in core manifests, identical | `3b03502031c188b5aef5c983859a93f506509648a2ddb35dcfec402877398062` |
| Installer | ABSENT |

Scope, unchanged-source invariants, test integrity and privacy/artifact review:
PASS. Both hash policies remain unchanged. Existing accepted DIAG/director
documentation changes were preserved. No source, authority, RECORD or machine
configuration was edited. Original installation/data/models remain untouched.
Final inspection found no VoxLeaf, tauri-driver or EdgeDriver process.

Raw evidence: `tmp/evidence/native-rust-function-readability/NFR-CB-BASELINE-20261013-02/`.

| Receipt | SHA-256 |
| --- | --- |
| `identity-before.json`, `identity-after.json` | `6acfa355499c24de70e21c02c4457efc8927ca627070f945e3089fa354e9a5e8` |
| `candidate-inputs-before.json` | `c6e81bc060fc1e739b6ff27315102ee9cbbca96cabfdd8a60ea4558ec8e72d8a` |
| `candidate-inputs-after.json` | `a52cb31826d2fff0a97a48b534eed529451d07c0ac0bdead277f0c850504abaf` |
| `core-snapshot-rebind.json` | `c19ba52349a2c4f0b2ac9cc803155a258f438ffdda9f71b1c6039a1404bad0a9` |
| `07-package-windows.log` | `70dc24ef93e97caf1495eddd796099ef6addfc20d44c901c769c7641300fb327` |

Action: assess a shorter physical candidate root before a fresh attempt.
This immutable failure does not authorize an NFR-CB implementation order.
