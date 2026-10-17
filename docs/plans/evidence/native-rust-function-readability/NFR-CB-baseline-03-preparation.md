# Validation Report

> **Sanitized publication copy.** Local identifiers and paths are redacted;
> report IDs, outcomes and validation hashes describe the original execution.
> Original SHA-256: `9c5563be1afc2716b831cdb03a52e2ef3c0988e297e52c390f4006b046c67228`.
> See [publication and original retention](README.md).

Report ID: NFR-CB-BASELINE-20261013-03-PREPARATION-01  
Target ID: NFR-CB  
Mode: BASELINE  
Verdict: BLOCKED — required installed journey awaits the concrete director
preservation/restoration order. This is an intermediate report, not unit
acceptance. The maintainer has already authorized the necessary uninstall.

Independent Astra validation in verified Explorer-parent normal PowerShell
5.1, outside sandbox; pnpm 11.15.1, Node 24.20.0, uv 0.11.29.
Starting/ending HEAD: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.
Index empty. Identity recheck PASS; before/after receipts are byte-identical.

| Validated path under `apps/desktop/src-tauri/src/` | Exact porcelain | SHA-256 before/after | Filter-aware blob |
| --- | --- | --- | --- |
| `tts_optional_chatterbox.rs` | no output | `e525734297ce7cf8b437e5fc50b75a9f6d680ca6fc56707ee36acae5caf45ecf` | `8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513` |
| `tts_optional_chatterbox/tests.rs` | no output | `e0c1dad918fe95b11ed38d8739a16650ee27fefe3c7beaa6d0212b9e2059d8df` | `2cf45dc8c74b27a4a68b12dd2c0cc904045df7b2` |

## Commands and results

| Working directory | Exact command | Result |
| --- | --- | --- |
| Original repository | `pnpm.cmd format:check:rust` | PASS/0 |
| Original repository | `pnpm.cmd lint:rust` | PASS/0, both configurations |
| Original repository | `pnpm.cmd test:rust` | PASS/0, default 93/locked 92, one intentional ignore each |
| Candidate | `pnpm.cmd install --frozen-lockfile` | PASS/0, independent dependencies |
| Candidate | `uv sync --project services/tts --locked` | PASS/0, independent base environment |
| Candidate | `pnpm.cmd build:packages` | PASS/0 |
| Candidate | `pnpm.cmd package:windows` | PASS/0 |
| Candidate | `pnpm.cmd package:windows:check` | PASS/0 |
| Candidate | `node apps/desktop/scripts/ordinary-chatterbox-release-host.mjs --mode preflight --installed-root "<BASELINE_CANDIDATE>\apps\desktop\src-tauri\target\release"` | PASS/0, ordinary and hostile sessions |
| Candidate | Required installed journey | NOT RUN |

Candidate: `<BASELINE_CANDIDATE>`, a fresh physical directory. This is a
dependency-snapshot build, not evidence of arbitrary-path clean-install
reproducibility. The 3,407 inputs (1,236 tracked files, six voices, four cached
download artifacts and 2,161 full core environment files) total 333,925,289
bytes. Every initial copy matched its source hash, with distinct file identity,
single link and no reparse entry. Base and embedded Python import isolation
checks passed. Copied launchers were not executed.

Full closure found zero original input drift. The candidate changed only its
generated package-evidence copy and VoxLeaf distribution RECORD/direct_url/
uv_cache metadata through the unchanged builder. All 13 third-party RECORDs
remained unchanged. Original historical evidence SHA-256 remains
`f83691f3cd208e69d2855b5b36f48020d0ca545d72abefe46e2dbda9bc56c6ad`;
new candidate evidence is
`9146f8519d64e4321eb674dbba985c2c4973f5e3e957b0069b9b24969ff0ef6f`.

Projected and actual longest NSIS resource paths are 229 characters, within
the preparation ceiling of 240; the generated installer script contains 2,031
absolute File entries and hashes to
`88958f05cd1972a5388ef93337caab029f8121ddf28c783f469270917bcfdc5a`.

| Artifact | SHA-256 |
| --- | --- |
| Release executable, 11,803,136 bytes | `4c782573b183bd8ba82465f8697afc1c03ed6472ad8a27378815680d0aa2e341` |
| Installer, 203,519,448 bytes | `f8b229fbe0037204c761e7882e45e1d40d630343427901d4cf18bd63bdee8da6` |
| Built and checked-in core manifests, identical | `3b03502031c188b5aef5c983859a93f506509648a2ddb35dcfec402877398062` |

Scope, invariants, test integrity and privacy review: PASS for unchanged CB
baseline; accepted SUP/DIAG preserved. Final bounded process inspection found
no VoxLeaf, tauri-driver, EdgeDriver or owned WebView remnants. No installation,
uninstallation, source change or Git mutation occurred.

Raw evidence: `tmp/evidence/native-rust-function-readability/NFR-CB-BASELINE-20261013-03/`.

| Receipt | SHA-256 |
| --- | --- |
| `identity-before.json`, `identity-after-preparation.json` | `3501066ba1c9d900519e1aeb13f3069a68b1e604251342b641ea7f1518304a3d` |
| `candidate-inputs-before.json` | `bfd905cb67aedc5af2ac49f37d5030ad3f3ef805cdde38f92cb9e7fed3fb8c2c` |
| `candidate-inputs-after.json` | `88a6546e264fe44d1e030d6f30e6b9fbe74b64b4d9f8e2164065c07aaa44d8a6` |
| `launcher-package.json` | `58c089850eaa10aceb6d09374298083b42544e33cc96673ae61533d9fc3b0790` |

Action: independently review the concrete preservation/restoration launcher,
then issue the sequential journey order. Keep this report immutable. A fresh
complete baseline PASS is required before authorizing the CB worker.
