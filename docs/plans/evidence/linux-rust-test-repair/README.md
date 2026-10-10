# Linux Rust repair and comparative validation

Date: 2026-10-10. Comparative verdict: **PASS**.
[Independent comparison report](LINUX-RUST-REPAIR-COMPARE-02.md).
The CI addition has separate review evidence. At original closeout, remote CI execution had not yet been run; the later Ubuntu Rust foundation run passed on source HEAD `5401f899e3ffabfc8f3e79873bc0b5fa45b11155`.

## Archived raw captures

The Markdown receipts below retain their original outcomes. Raw captures,
logs and temporary scripts referenced by those receipts were retired from this
checkout after verifying all 276 entries in the local archive
`Documents/Codex/artifacts/voxleaf/pr-229-evidence-5401f899/original-evidence.zip`.
Archive SHA-256:
`80f9b59a9d38730f1046b01a5dac3cb5e8f3f0a599807759242a51a95ecc30fc`.
The adjacent `manifest.json` records every original path, size and entry hash.
Recover selected entries to ignored scratch and verify their manifest hashes;
do not overwrite unrelated work. The archive is local only. Original public
captures remain reviewable at the full commit link below. Local scratch paths
in unchanged receipts are historical provenance, not current checkout links.
See the [retention policy](../../../development/evidence-retention.md).

[Original repair captures](https://github.com/mmjosedaniel/voxleaf/tree/5401f899e3ffabfc8f3e79873bc0b5fa45b11155/docs/plans/evidence/linux-rust-test-repair).

## Scope and provenance

HEAD remains `f06c80e04da2025342b1002a548f03ca17e7cc0b`. The preceding unstaged
native test-layout refactor is preserved. Three paths repair Linux compatibility:

- `tts_service_supervisor.rs`: two underscore insertions for the parameter and
  Windows use of `configure_supervised_child`; Windows behavior is unchanged.
- `host_profile_detection.rs`: five variant-level `cfg_attr`/`expect(dead_code)`
  declarations, four only for non-Windows non-test builds and `Malformed` for
  non-Windows builds. Variants, matches and test conditions stay unchanged;
  unfulfilled expectations and all other warnings remain errors.
- `icons/icon.png`: the exact existing ICO entry 5 payload, offset 4554, length
  4292 bytes; 256x256 RGBA8. SHA256
  `008b8ae27d726ce284bc2edd9217c927fb4254fcde8aa4f79ee1804b5b648db8`.
  [apply-two-file-repair.ps1.txt](https://github.com/mmjosedaniel/voxleaf/blob/5401f899e3ffabfc8f3e79873bc0b5fa45b11155/docs/plans/evidence/linux-rust-test-repair/apply-two-file-repair.ps1.txt) records extraction and signature/chunk CRC checks.
  No image regeneration, dependency, ICO/SVG or Tauri configuration change.

Fresh Ubuntu snapshots compare **HEAD plus the repair** against **the accepted
layout plus the identical repair**. The original failed baseline is retained in
[LINUX-RUST-COMPARE-01](../linux-rust-test-comparison/LINUX-RUST-COMPARE-01.md).
The complete HEAD archive and exact-match edits preserve all other inputs.
The 913/924 input files, 41/43 literal includes, 40 immutable fixture occurrences,
frozen authority and test assertions were independently checked. Only the four
approved `tts_protocol_contract::tests::` namespace additions differ.

## Commands and results

Commands originate in normal local PowerShell outside the automation sandbox.
Linux execution uses Ubuntu 24.04.3 x86_64 under WSL2, Rust 1.97.1, Node 24.18.0,
pnpm 11.15.1, isolated toolchains/dependencies/build outputs and
`pnpm install --frozen-lockfile --ignore-scripts`. Both configurations run through
the existing root scripts; no test filtering, assertion changes or ignored tests.

| Command | HEAD + repair (Linux) | Layout + repair (Linux) | Current Windows |
| --- | --- | --- | --- |
| `pnpm format:check:rust` | 0 | 0 | 0 (`pnpm.cmd`) |
| `pnpm lint:rust` | 0, default and release | 0, default and release | 0, default and release |
| `pnpm test:rust` | 0, 85/86 passed | 0, 85/86 passed | 0, 87/88 passed |
| `pnpm.cmd test:native-startup` | Not applicable | Not applicable | 0 on corrected-driver retry |

Both Unix symlink tests explicitly report `ok` in both Linux arms and both
feature configurations. Linux counts differ from Windows because existing
platform conditions are preserved. No Linux desktop, model, hardware or
Windows-link equivalence claim follows from these tests.

## Retained failed attempts

The initial unmodified Linux reproduction again returned 101 for lint/tests.
After the icon/parameter fix, `attempt-01-evidence` records passing 85/86 tests
but Clippy failures on the five Windows-only constructed variants. The final
`attempt-02-evidence` records all six configured script executions returning 0.
A preliminary format check identified four multiline attribute formatting fixes;
[detector-format-packet.json.txt](https://github.com/mmjosedaniel/voxleaf/blob/5401f899e3ffabfc8f3e79873bc0b5fa45b11155/docs/plans/evidence/linux-rust-test-repair/detector-format-packet.json.txt) records the corrected 32-line annotation delta.

The first Windows invocation encountered pnpm 11.25.0 from the injected fallback
PATH and stopped at the engine guard. The authoritative retry uses process-local
Node 24.18.0/Corepack pnpm 11.15.1, without global installation changes.
Windows Rust checks passed; the initial native smoke then failed to create its
WebView session with driver 150.0.4078.83 against installed WebView2 155.0.4283.45.
The existing CI acquisition tool obtained driver 155.0.4283.45; its Microsoft
Authenticode signature was verified. The unchanged command passed with that
isolated driver selected only for the test process. The old driver and browser
installation were not modified. [windows-results.json.txt](https://github.com/mmjosedaniel/voxleaf/blob/5401f899e3ffabfc8f3e79873bc0b5fa45b11155/docs/plans/evidence/linux-rust-test-repair/windows-results.json.txt) retains the first
smoke failure; [windows-native-retry-result.json.txt](https://github.com/mmjosedaniel/voxleaf/blob/5401f899e3ffabfc8f3e79873bc0b5fa45b11155/docs/plans/evidence/linux-rust-test-repair/windows-native-retry-result.json.txt) records its successful retry.

## Evidence layout

Markdown reports and the exact CI review-input manifest remain in this checkout.
Structured command captures, logs and scripts are in the verified archive and
original commit. Historical scratch references in unchanged reports describe
the original run. Before/after identities bind its validated source; the
comparison excludes the later CI workflow, which has independent change review.
The architecture review found unchanged topology.

## Final CI review and closeout

[LINUX-RUST-REPAIR-CI-01](LINUX-RUST-REPAIR-CI-01.md) returns **APPROVE**, with
no findings. The role returned the report read-only; the director persisted its
text and byte-copied the exact 41-path manifest to `review-input.json.txt`.
Manifest SHA256: `e49b7446e23eb9ef3891994ffb93a365d5acb558767a036f23c83d0a89bdf303`.
The [retained CI source identities](review-input.json.txt) have identical bytes; the report's original absolute scratch link is historical.

The new `ubuntu-native` job is configured, with root workflow settings and both
existing jobs preserved. `pnpm.cmd format:check:typescript` exits 0; semantic
YAML comparison and syntax checks for all seven Bash steps pass. The job's three
Rust commands match the successful Ubuntu comparison. At original closeout, no remote job had been run; the subsequent Ubuntu Rust foundation run passed on source HEAD `5401f899e3ffabfc8f3e79873bc0b5fa45b11155`.
CI check logs and the bounded worker packet are archived; the Markdown approval remains alongside this index.

The [completed ExecPlan](../../completed/linux-rust-test-comparison.md) records
all decisions and results. Its former active path is a navigation-only redirect
so historical evidence links remain valid without editing old receipts.
