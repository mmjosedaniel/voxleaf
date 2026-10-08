# Integration baseline report retention

Retained summary of the independent validator's report. No acceptance verdict
is inferred from a failing security baseline.

- Report ID: **CB-V3-INTEGRATION-01-BASELINE-01-20261006**.
- Target: CB-V3-INTEGRATION-01; mode BASELINE.
- Verdict: **BASELINE-FAIL**, solely for the five known production-v2 Python
  advisories which this authorized unit is intended to fix.
- Start/end HEAD: `998c7b24cda7e969e9ed0344f348506bf38af3b0`.
- Environment: normal local PowerShell, outside sandbox, login false, pinned
  Corepack/pnpm shim directory prepended to process PATH.
- Closed scope: the 21 implementation paths and two generated receipt paths
  listed in the active plan's frozen integration unit. All had empty porcelain
  status before/after; the four new authority/receipt paths were absent.
- Identity recheck: **PASS**, all 23 SHA-256/filter-aware blob/status identities
  unchanged. Index empty before/after. No pre-existing user changes in scope.

| Command | Result |
|---|---|
| `pnpm.cmd check` | Exit 0 |
| `pnpm.cmd package:chatterbox-optional:check-source` | Exit 0, historical v2 source current |
| `pnpm.cmd package:chatterbox-optional:check-acquisition` | Exit 0, historical v2 authority current |
| `pnpm.cmd package:chatterbox-optional:v3:check-source` | Exit 0 |
| `pnpm.cmd inventory:release:check` | Exit 0 |
| `pnpm.cmd audit:release` | Exit 1, expected five v2 advisories |
| `git diff --cached --quiet` | Exit 0 before and after |
| `git diff --check` | Exit 0 |

Full check passed format, lint, types, builds and all tests: shared 209, EPUB
653, desktop 581 Vitest plus 37 Node, Rust 79 normal plus 80 release-locked,
Python 399. Native release and Python distributions built successfully.
Nonfatal existing warnings concerned pytest cache permission, CSS highlight
minification and bundle size.

Audit passed Node, Rust, base Python and Piper. Rust reported seven notices,
five Windows-reachable. Chatterbox failed exactly on Transformers
PYSEC-2026-3929/4174 and urllib3 PYSEC-2026-4175/4176/4177. No unexpected failure.

Scope, baseline invariants, test integrity and privacy/artifact review passed.
Only director-owned plan/host-record documentation changed outside the closed
allowlist during validation. No source, Git index/history, installed package,
model or release asset was changed by the validator. Candidate assembly and GPU
checks were not repeated by the validator.

Director disposition: proceed with the authorized security remedy for this
specific expected failure. It must make the full production audit pass without
suppression and satisfy all native/package/lifecycle gates. Post-change
acceptance requires the independent `change_reviewer`; this baseline neither
accepts future v3 behavior nor grants Git/publication permissions.
