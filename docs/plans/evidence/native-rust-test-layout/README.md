# Native Rust test-layout evidence

Execution started 2026-10-09 in local Windows PowerShell outside the managed
sandbox, at HEAD `f06c80e04da2025342b1002a548f03ca17e7cc0b` on the pre-existing
`codex/native-rust-test-layout` branch. The initial worktree and index were
clean. All resulting changes remain unstaged; no commits or remote operations
are authorized by these reports.

The director reused one GPT-6.1 Sol high auditor, one GPT-6.1 Sol high worker,
and one GPT-6 Astra high independent validator. Only the worker changed Rust
source, one unit at a time. Source writers were idle throughout validation.

## Immutable unit records

Every unit has a fresh audit, passing baseline, frozen work order and independent
post-change acceptance. Each baseline and post-change report records the exact
host commands `pnpm.cmd format:check:rust`, `pnpm.cmd lint:rust` and
`pnpm.cmd test:rust`, HEAD, closed allowlist, before/after status and file
identities, source review, and exact collected test identities/results.

| Unit | Audit | Work order | Fresh baseline | Acceptance |
| --- | --- | --- | --- | --- |
| NRTL-HASH | [Audit](NRTL-HASH-audit-01.md) | [Order](NRTL-HASH-order-01.md) | [Baseline](NRTL-HASH-BASELINE-01/report.md) | [Post-change](NRTL-HASH-POST-01/report.md) |
| NRTL-FRAMING | [Audit](NRTL-FRAMING-audit-01.md) | [Order](NRTL-FRAMING-order-01.md) | [Baseline](NRTL-FRAMING-BASELINE-01/report.md) | [Post-change](NRTL-FRAMING-POST-01/report.md) |
| NRTL-CORE | [Audit](NRTL-CORE-audit-01.md) | [Order](NRTL-CORE-order-01.md) | [Baseline](NRTL-CORE-BASELINE-01/report.md) | [Post-change](NRTL-CORE-POST-01/report.md) |
| NRTL-FAKE | [Audit](NRTL-FAKE-audit-01.md) | [Order](NRTL-FAKE-order-01.md) | [Baseline](NRTL-FAKE-BASELINE-01/report.md) | [Post-change](NRTL-FAKE-POST-01/report.md) |
| NRTL-HANDOFF | [Audit](NRTL-HANDOFF-audit-01.md) | [Order](NRTL-HANDOFF-order-01.md) | [Baseline](NRTL-HANDOFF-BASELINE-01/report.md) | [Post-change](NRTL-HANDOFF-POST-01/report.md) |
| NRTL-CB | [Audit](NRTL-CB-audit-01.md) | [Order](NRTL-CB-order-01.md) | [Baseline](NRTL-CB-BASELINE-01/report.md) | [Post-change](NRTL-CB-POST-01/report.md) |
| NRTL-SUP | [Audit](NRTL-SUP-audit-01.md) | [Order](NRTL-SUP-order-01.md) | [Baseline](NRTL-SUP-BASELINE-01/report.md) | [Post-change](NRTL-SUP-POST-01/report.md) |
| NRTL-CONTRACT | [Audit](NRTL-CONTRACT-audit-01.md) | [Order](NRTL-CONTRACT-order-01.md) | [Baseline](NRTL-CONTRACT-BASELINE-01/report.md) | [Post-change](NRTL-CONTRACT-POST-01/report.md) |
| NRTL-PROBE | [Audit](NRTL-PROBE-audit-01.md) | [Order](NRTL-PROBE-order-01.md) | [Baseline](NRTL-PROBE-BASELINE-01/report.md) | [Post-change](NRTL-PROBE-POST-01/report.md) |
| NRTL-HW | [Audit](NRTL-HW-audit-01.md) | [Order](NRTL-HW-order-01.md) | [Baseline](NRTL-HW-BASELINE-01/report.md) | [Post-change](NRTL-HW-POST-01/report.md) |

## Evidence format and boundaries

[Initial inventory](initial-inventory.json.txt) captures the original fifteen
Rust sources, ninety test functions and their compilation conditions, forty-one
literal includes, fixture hashes, and protected/excluded source identities.
The final layout has twenty-six Rust files. Forty-three includes retain all
original fixture targets/bytes; the increase of two is the privacy test replacing
one inline source include with all three resulting hardware source files.

Each report directory includes the report and its original structured JSON
evidence saved byte-for-byte with a `.json.txt` suffix. The suffix keeps
immutable evidence outside root code-formatting globs. Read these files as JSON.
SHA-256 identities describe bytes; filter-aware blob identities and exact Git
porcelain statuses describe the approved unstaged patch. Supplemental source
reviews and exact test-comparison records are included where produced.

Raw host command logs remain in the local task directory:
`C:/Users/mmjos/Documents/Codex/2026-10-09/copia-este-prompt-est-preparado-para/work/native-rust-test-layout/<Report ID>/`.
Repository reports retain command exit codes, results and structured inventories;
they do not depend on publishing local logs.

The default Windows configuration passes 87 tests and `release-locked-runtime`
passes 88. Exact names and results are compared separately, with only the four
documented `tts_protocol_contract::tests::` namespace additions. Two Unix-only
Chatterbox symlink tests remain present and unchanged but were not executed.
Windows validation does not establish non-Windows Rust execution or general
hardware/model support.

The complete `frozen_authority` block and the five excluded native sources remain
unchanged. Executable diagnostics remain outside `cfg(test)`. The existing
hardware privacy test retains its seventeen fragmented forbidden strings and
checks the parent, Windows child and test child on every platform.

## Aggregate and documentation acceptance

- [NRTL-PACKAGE-01](NRTL-PACKAGE-01/report.md): independent
  `pnpm.cmd check:portable` acceptance for the final source manifest.
- [NRTL-FINAL-01](NRTL-FINAL-01/report.md): independent `pnpm.cmd check` and
  `pnpm.cmd test:native-startup` acceptance, full source identity/invariant
  review and host prerequisite evidence.
- `NRTL-DOCS-FINAL-01/report.md`: separate documentation identity/link receipt
  recorded after plan archival. It does not rewrite source approvals.

See the [completed ExecPlan](../../completed/native-rust-test-layout.md),
[testing convention](../../../development/testing.md#native-rust-unit-test-layout)
and [native navigation](../../../development/agentic-refactoring.md#native-rust-navigation).
Source reports are never rewritten after acceptance. Later source drift
requires a new report; documentation uses a separate closeout manifest.