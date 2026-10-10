# Validation Report

Report ID: NR-PACKAGE-01-20261009
Target ID: native-rust-module-organization
Mode: PACKAGE
Verdict: PASS
Environment: local PowerShell outside sandbox, repository root, require_escalated;
process-local Corepack pnpm 11.15.1 and signed EdgeDriver 155.0.4283.45 setup.
Starting HEAD SHA: 719dea00f824ef6e3bf92c531f0b04d9be14ceb9
Ending HEAD SHA: 719dea00f824ef6e3bf92c531f0b04d9be14ceb9
Validated paths and before-command identities: the fifteen explicit paths in
[NR-SOURCE-MANIFEST-01](NR-source-manifest-01.md), all porcelain statuses empty.
Identity recheck: PASS; independently captured package-before/package-after
manifests identical, HEAD unchanged, index empty before/after. Writers/Git idle.

Commands and outcomes:

1. `pnpm.cmd check:portable`: exit 0. Formats, linters, types, 17 generated
   contracts and mypy (159 source files) pass. Shared 209 tests/20 files, EPUB
   651/33, desktop 587/54, Node 38 and Python 406 pass. Shared/EPUB/frontend and
   Python distribution builds pass. Nonfatal pytest nodeids-cache permission
   warning and Vite chunk-size warning.
2. `git diff --check`: exit 0.

Diff scope: PASS; aggregate against execution base
`ed42154668bd71d500b5beab77485f9fd20ee2a2` changes five source paths, 229
insertions/207 deletions. Ten SKIPs unchanged; director docs outside manifest.
Invariant review: PASS; exact dispatch/Tauri tail, sixteen handlers/nine branches,
relocated model-free diagnostic statements, 41 includes/33 identical authority
targets. No production lifecycle/runtime/package/admission change. Model/package/
admission/installer gates N/A for these two relocations. Portable gate does not
establish Rust/Unix native/model/installer execution.
Test integrity: PASS, protected bodies/assertions unchanged.
Privacy/artifact review: PASS, no prohibited/generated-source artifacts, existing
installation/model/data untouched, normal ignored outputs only.
Action required: none. Immutable evidence; FINAL is a separate report with its
own capture and commands. Recorded by director from independent Astra report.
