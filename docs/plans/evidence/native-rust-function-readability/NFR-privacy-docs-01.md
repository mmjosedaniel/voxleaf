# Validation Report

**Report ID:** NFR-PRIVACY-DOCS-20261013-01  
**Target ID:** NFR publication-copy privacy review  
**Mode:** FINAL  
**Verdict:** **PASS**  
**Environment:** Normal local PowerShell outside sandbox; Explorer parentage verified.  
**Starting HEAD SHA:** `d5ad0427dc58d71bdb678df17454d9412c8488c8`  
**Ending HEAD SHA:** `d5ad0427dc58d71bdb678df17454d9412c8488c8`

**Validated paths and identities:** Exact closed allowlist below, relative to `docs/plans/evidence/native-rust-function-readability/`. Every path has exact porcelain status `?? <full relative path>`. Before/after identities match.

| File | SHA256 | Filter-aware blob |
|---|---|---|
| NFR-CB-baseline-01.md | `f54587a0c80a19a5a512dc1451f09f3bac56b16a705107d3a63b7bff4b77fe7a` | `c5c51e12caf5086765dafd01c7ac8c55df131d08` |
| NFR-CB-baseline-02.md | `95a453b0a92abf4f44d4d5187d1bb1a4a1c009389c0d224df6cceb547f3bf4bd` | `f8f407c98f1f0dbc7c44079a6e154ab7fc0e1acd` |
| NFR-CB-baseline-03-final.md | `87156eddf5e23f8a11cc2a2ee797b10ed7c1f8dd6c43db4f144ef4610deb9e70` | `ce2e93d25db41e26e9334d4a302a8bfea8bcd932` |
| NFR-CB-baseline-03-preparation.md | `b4bebb51b10ff4277d37ece886ed7b6e02a70180d7601a4397bec8c0d90112f0` | `7709b3f085d7ca56f452ed66064d262b5f05a0cc` |
| NFR-CB-post-01.md | `6b1e8b5c3ab9d35265b2f5b5675b404b75412ed7c9c25b171c21e8ed42156b56` | `76ebd2432ffe5703e305ce3dbbde045889204a25` |
| NFR-CB-post-02.md | `03821acb7c7d3980ef2689dacb3781df7c470e8e4deb7552bbfb4ec988b8c874` | `1ef638af5d9cd2236dc38b2004336ec6a7d7a904` |
| NFR-final-docs-01.md | `7f8016c79b97779d752d43f667f15b02d012c8b99798573b5481f428b4c46969` | `6d3fa73b490d27eff5429365f87c31583b3bb11a` |
| NFR-host-view-diagnostic-01.md | `0889b7b7d36f599b36a990b8bdeab362b6fd049ac44bd52f6793f2ba0857fe2d` | `94e57576d2d13f9125c0276db450e738756e3df0` |
| NFR-SUP-baseline-02.md | `d1aee96c2926673d9694c8a7219842f19d3575099bae0390a9acf1bb378d6b5e` | `9dee80e775f4f000af6181285b61f7287d4addf9` |
| NFR-SUP-snapshot-diagnostic-01.md | `6a3e3da9b0c4536abc79aed5ee5fd398716e2db66306f7b6767322f712022b7e` | `022d37a7b660ebce11c672783a1e81c192ba30b4` |
| README.md | `57c13fe253fc1ea95f98aa7b605a5320eaf0a79641bc9a8f4026967b23d570c7` | `dcc55623bcded9fdea0d5f1fea7026fe45f8eaf0` |

**Identity recheck: PASS.** HEAD, empty index and all allowlisted identities remained unchanged. The five source paths and six documentary paths from NFR-FINAL-DOCS-20261013-01 also retain their exact identities.

**Commands and outcomes:**

- `pnpm.cmd check:evidence` → exit0, PASS.
- `git diff --check` → exit0, PASS.
- Local archive/manifest verification → PASS:28 unique entries, exact closed entry set, byte lengths and SHA256 values match.
- Remaining originals → PASS:18 files byte-identical to their archived originals.
- Publication-copy comparison → PASS: exactly10 modified copies, each correctly labeled and bound to its original hash.
- Local links → PASS:29 links checked, no missing targets or anchors.

Archive SHA256: `333c19b0d62ebef7df683e3c8a0331a9d4e911600199f43bdb323d4933a8f009`  
Manifest SHA256: `330dc22fd586013ac10729ee8b1cfd532a1dcbe0ad0433d9fdc00c7c25946a00`

Both archive and manifest are ignored and absent from the Git index.

**Diff scope: PASS.** Reviewed every publication-copy diff against its archived original. Changes are limited to personal/local identifier redaction, defined path placeholders, relative links and publication provenance notices. All original source, binary and validation hashes remain present; outcomes, counts, limitations and failure distinctions are preserved.

**Invariant review: PASS.** The README correctly distinguishes immutable originals from sanitized copies. Normalized historical commands are explicitly non-executable. Redaction neither renews an earlier approval nor converts a failed result into PASS.

**Test-integrity review: PASS.** Runtime acceptance is reused from NFR-CB-POST-CHANGE-20261013-02 on unchanged source identities. The13 recently passed evidence tests are reused because their scripts are unchanged. No runtime, model, package or evidence-test matrix was repeated.

**Privacy/artifact review: PASS.** Scanned38 complete changed/new files and reviewed detected matches. Four matches were existing public repository URLs, not private host information. No remaining personal host paths, unnecessary process/filesystem identifiers, private contacts or credential material were found in the publication changes. Private originals remain local.

Minimal execution receipt:

`tmp/evidence/native-rust-function-readability/NFR-PRIVACY-DOCS-20261013-01.json`

SHA256: `1cf7ecd2d76fb3398cb4add652410d8220ff9d82b4dc500446e291667498974c`

**Action required:** None. Publication copies pass the bounded privacy review. No Git mutation is authorized by this report.
