# Validation Report

Report ID: NR-FINAL-01-20261009
Target ID: native-rust-module-organization
Mode: FINAL
Verdict: PASS
Environment: local PowerShell outside sandbox, repository root, require_escalated
for every acceptance command; process-local Corepack pnpm 11.15.1 and verified
Microsoft EdgeDriver 155.0.4283.45 under the ignored campaign tmp directory.
Starting HEAD SHA: 719dea00f824ef6e3bf92c531f0b04d9be14ceb9
Ending HEAD SHA: 719dea00f824ef6e3bf92c531f0b04d9be14ceb9
Validated paths and before-command identities: fifteen explicit paths in
[NR-SOURCE-MANIFEST-01](NR-source-manifest-01.md), all porcelain statuses empty.
Identity recheck: PASS; FINAL's separately captured before/after manifests exactly
match HEAD/statuses/SHA256/blobs; index empty. PACKAGE made its own captures.
Source writers and Git idle throughout.

Commands and outcomes:

1. `pnpm.cmd check`: exit 0. Repository formatting, lint, types, tests and builds
   pass; 17 generated contracts verified and mypy checked 159 source files.
   Shared 209 tests/20 files; EPUB 651/33; desktop 587/54; Node 38; Rust 87
   default plus 88 release-locked (no failures/ignored); Python 406 passed.
   Shared/EPUB/frontend/native release/Python distribution builds pass. Nonfatal
   warnings: existing pytest nodeids cache could not be written; Vite chunk >500 kB.
2. `pnpm.cmd test:native-startup`: exit 0. Fresh release build and complete
   WebView2/model-free smoke: binary delivery, cancellation/crash recovery,
   descendant containment, file ingress, keyboard/reader/synchronization,
   position/preferences restoration, cleanup, zero errors/external requests.
3. `git diff --check`: exit 0.

Diff scope: PASS; execution-base aggregate is exactly five source files, 229
insertions/207 deletions, ten SKIP files unchanged. Source worktree clean.
Director documentation/evidence is outside this source manifest and needs its
own closeout review.
Invariant review: PASS; exact nine-branch dispatch and Tauri Builder/shutdown
tail, sixteen handlers, parsing/exits/fallthrough; model-free diagnostic
statements/assertions/locks/timing/Windows condition intact. Only include depth
changed; 41 occurrences still resolve to the same 33 unchanged authority targets.
Production runtime configuration, process ownership, cancellation/bounds/release
restrictions, package verification/acquisition and hardware admission unchanged.
Test integrity: PASS, no weakened/removed/rewritten protected assertions; moved
executable assertions pass and Rust counts match both baselines. Existing Qwen
deterministic tests remain covered without claiming a deferred runtime fix.
Privacy/artifact review: PASS; no private/prohibited/generated/frozen/historical
or unrelated source changes; ignored build outputs only. Existing installation,
models and personal data untouched. Validator edited no files/Git state.
Action required: none for source campaign; documentation closure separate.

Model/packaging/admission/installer journeys N/A for these mechanical diagnostic
relocations. No model, Qwen runtime, installed-artifact, firewall, GPU-performance
or Unix-native execution claim. Browser-specific gate N/A because renderer
behavior is untouched; packaged WebView2 was exercised. Immutable report recorded
by director; later identities cannot renew it through hash replacement.
