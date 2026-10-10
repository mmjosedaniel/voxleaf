# Linux Rust comparison evidence

Date: 2026-10-10. Verdict: **BASELINE-FAIL**.
[Independent report](LINUX-RUST-COMPARE-01.md).
[Active follow-up](../../active/linux-rust-test-comparison.md).

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

[Original failed comparison captures](https://github.com/mmjosedaniel/voxleaf/tree/5401f899e3ffabfc8f3e79873bc0b5fa45b11155/docs/plans/evidence/linux-rust-test-comparison).

The pre-refactor baseline is HEAD
`f06c80e04da2025342b1002a548f03ca17e7cc0b`. A complete Git archive contains all
912 tracked files. The current snapshot overlays only the 26 accepted native
Rust files, for 923 input files. Hashes and final path sets are archived with the original captures.
No original source, fixture, Cargo/package lock or CI configuration changed.

Execution: normal local Windows PowerShell outside the automation sandbox,
invoking the existing Ubuntu 24.04.3 x86_64 WSL2 distribution. Rust 1.97.1,
Node 24.18.0 and pnpm 11.15.1 were pinned identically for both copies.
Tauri development prerequisites were installed from Ubuntu packages using the
[official Linux prerequisites](https://v2.tauri.app/start/prerequisites/#linux).
Toolchains and snapshots remain under
`/var/tmp/voxleaf-linux-rust-comparison-20261010/` for reproducible follow-up.

| Configured command | Baseline exit | Current exit |
| --- | ---: | ---: |
| `pnpm format:check:rust` | 0 | 0 |
| `pnpm lint:rust` | 101 | 101 |
| `pnpm test:rust` | 101 | 101 |

The last two scripts use `&&` and stop after the default-feature failure.
Their already-configured release commands were therefore executed separately
for each snapshot, also returning 101:

```text
cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets --features release-locked-runtime -- -D warnings
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime
```

Both versions and feature configurations report the same blockers:

- `tauri::generate_context!()` at `main.rs:54` cannot open the required
  `icons/icon.png`. Both repository snapshots contain only `icon.ico` and
  `icon.svg` at that location.
- `configure_supervised_child` at `tts_service_supervisor.rs:89` receives
  `command` but only uses it in the Windows branch. Linux Clippy rejects the
  unused variable under `-D warnings`; ordinary test compilation emits a warning.

Zero Rust tests execute because compilation fails. In particular, neither Unix
symlink assertion has passed or failed at runtime. No Linux regression from
the file moves is established, and Linux acceptance is not claimed.

The first partial archive attempt was discarded: it omitted compile-time
include targets and pnpm bootstrapped without the project lockfile. The complete
attempt above includes every HEAD file, resolves every source include and uses
`pnpm install --frozen-lockfile --ignore-scripts` before validation.
A first `/tmp` toolchain directory also disappeared on WSL restart; the retained
attempt uses `/var/tmp`. Neither exploratory attempt is acceptance evidence.

Structured/log/script files from this failed comparison are in the verified
archive and original commit, rather than the current checkout. Raw source
archives, caches and tools remain local execution provenance. The historical
BASELINE-FAIL is unchanged; the [subsequent repair](../linux-rust-test-repair/README.md)
records separate successful evidence. This comparison did not add CI or perform
staging, commits, branch changes, push or PR operations.
