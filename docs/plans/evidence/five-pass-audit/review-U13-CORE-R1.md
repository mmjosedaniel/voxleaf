# Change Review Report

Review ID: **FPA-U13-CORE-CR-R1-20261111**  
Task ID: Deferred U13 / 3.4 generated-core outputs  
Verdict: **APPROVE**  
Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

**Reviewed paths and identities**

The complete 47-path status/SHA-256/blob closure is incorporated from:

`tmp/evidence/five-pass-audit/u13-core-review-inputs.txt`

SHA-256: `797E0729C45E4EB4B81260D6E8D158C15A34E83E5EE1D747D85951A6CDE683FD`

Exact two-output, 58-line patch:

`tmp/evidence/five-pass-audit/u13-core-review.diff`

SHA-256: `47349E515DBEF111C3ECF64A9AD0105C84B5EE0CCB98CCDB8770B257C7F8CB09`

**Identity recheck: PASS**

Snapshots at `2026-11-12T00:53:06.0316441Z` and `00:53:57.1221789Z` matched all 47 paths and 28 evidence artifacts. HEAD remained unchanged, the index empty, and the saved patch matched the current scoped diff exactly.

Current size/hash inspection also matched all:

- 62 generator inputs;
- 26 frozen optional-authority files;
- 2,164 intermediate-environment files;
- 2,027 generated-output records;
- 16 static inputs.

**Acceptance review**

The corrected Windows CPython 3.12 ONNX artifact identity propagates into the packaged inventory. Exactly two packaged files changed: that inventory and its runtime manifest. Packaged runtime and voice files remain unchanged.

The three intermediate-environment changes—local-package RECORD, Chatterbox adapter and v7 authority writer—are excluded by the existing Piper staging rules. This establishes packaged-output equivalence outside the two documented changes, not whole-environment equivalence.

The tracked and packaged runtime manifests are byte-identical. Package totals and archive identity match the generated evidence:

- Installed: **2,024 files, 306,744,427 bytes**
- Archive: **213,924,241 bytes**
- Archive SHA-256: `23D0305D78A239E19547D0200F9D314293027D298F1274E68BB38565E461BB40`
- Runtime manifest SHA-256: `BF6D05EE74313230481C5B3BA83378946E144EF4A76A7849E8831371CE449613`
- Package evidence SHA-256: `D8EEE9879FC857F6366A35936DF4CF2D437C78232185B9CA9A1E3E2D64F2A801`

Source manifest, locks and accepted optional authorities remain unchanged.

**Evidence reviewed**

Attributed normal-host results; this reviewer ran no tests or generators:

- One configured `package:piper-core:write-manifest` completed successfully, including both offline language smokes.
- Spanish and English smoke payloads were **240,744** and **225,140 bytes**, respectively. These are observed outputs, not deterministic-audio claims.
- Configured `package:piper-core:check` reported `piper-core-release:current`.
- Scoped Prettier and diff checks exited **0**.

Fresh evidence supports the current generated outputs. Historical failure-matrix fields are not treated as newly executed regression tests.

**Findings:** None.

**Remaining uncertainty:** Fresh native/G5, G8, G9, G10 and integrated acceptance remain pending. G7 must bind the refreshed environment and its path-specific firewall policy. No previous native binary or installer approval is renewed.

**Required next action:** No generated-output correction required. Complete the remaining downstream gates. This report grants no Git authorization.
