# Eight-finding execution ledger

Task: EFC, 2026-10-30. Branch `codex/eight-finding-minimal-corrections`;
base and HEAD `f4e3b585114a1fda0e3bd9e72b8c31a007121d5a`.
Entry worktree/index clean. No Git mutations are authorized or performed.

## Evidence and environment

All gates below run in normal local PowerShell 7.6.5 outside the managed
sandbox. Existing Node 24.18.0/Corepack pnpm 11.15.1, uv 0.11.29,
CPython 3.12.10, Rust/Cargo 1.97.1 and locked dependencies are used.
The initial PATH exposed Node 24.20.0/pnpm 11.25.0; the gate wrapper selects the
already installed pinned tools. No installation or environment upgrade.

Ignored original receipts are in `tmp/evidence/eight-finding-minimal-corrections/`:
each gate has `*-result.json`, `*-inputs.json` (all tracked/nonignored source
hashes and discovery membership) and `*-output.log`. The receipt records the
command, cwd, HEAD, timestamps, exit code, tool versions and input-manifest hash.
Failures are immutable and retained. Public records contain synthetic data only.

## Gate decisions

| Gate | Disposition | Scope |
| --- | --- | --- |
| G0 | EJECUTAR | Host identities, pinned tools, package prerequisites and local asset hashes. |
| G1 | EJECUTAR | Grouped new directed red cases before production edits. |
| G2 | EJECUTAR | Selected format, lint and type checks; native lint after final generated inputs. |
| G3 | EJECUTAR | Three EPUB files, 97 tests passed. |
| G4 | EJECUTAR | Eight desktop files; original 162 pass/3 fixture failures, corrected two files 40 pass. |
| G5 | EJECUTAR | Ten Python files including concrete threaded runtime; 151 passed. |
| G6 | EJECUTAR | One Piper generation including both offline voices, package check and inventory. |
| G7 | EJECUTAR | Host-profile and optional-profile modules in both Rust feature modes. |
| G8 | EJECUTAR | One selected browser invocation, three scenarios. |
| G9 | EJECUTAR | One wrapper-owned native build and model-free WebView2 smoke. |
| G10 | EJECUTAR | Evidence, whitespace, links, identity closure, independent exact-patch review. |

Historical runtime results: **NO APLICA** as current acceptance. No cross-task
PASS is reused. Unrelated full suites/aggregate checks, real dual-worker/Qwen
benchmarks, Chatterbox repackaging/inference, network acquisition, installer,
firewall and listening portfolios remain **NO APLICA**. No hosted CI result is
claimed. There is no pending model-quality or support-promotion claim.

**REUTILIZAR con prueba (assets only):** G0-verified-assets validates the four
Piper source/runtime downloads and six voice artifacts by exact size and SHA-256
against the unchanged source manifest. The generator also verifies these before
copying. The existing EdgeDriver 156.0.4314.50 matches WebView2 156.0.4314.50;
driver SHA-256 `dd728c934e491abe7e8a07fa366aad135ea15d934cbba99192ad872da59c39d3`.
`tauri-driver --version` is unsupported and returned usage; no version result is
claimed for that probe. Its existing binary is used by the native runner.

## Qwen completion mechanism

The inspected installed qwen-tts 0.1.1 files match their RECORD entries:

- `inference/qwen3_tts_model.py`: `e1da450732857c1f5fe3e36ebab85db2f6dc6a48caaff6973f463384e30275e4`.
- `core/models/modeling_qwen3_tts.py`: `25c42656bcf810f06ef6bc1839bd7083f3c8cfedac3a147c4060b4262b1c96a0`.
- Transformers 4.57.3 `generation/utils.py`: `a20024b1e82ed5361a524d238d2197be5407abc91297dd9888c57e8284d63fef`.

The pinned talker forward's prefill returns no codec IDs (lines 1664–1667).
Subsequent forwards encode the preceding sampled ID (1681); the outer model
stacks non-None codes and strips EOS (2280–2292). CustomVoice decodes that list
and returns only waveforms/rate (829–839). Transformers initializes an empty
ID sequence for inputs_embeds (780–781), appends each newly sampled token before
testing stopping criteria (2838–2842), and returns those sequences (2856).
Consequently a capped 250-step call can expose 249 codec frames/478080 samples
whether the final sample was EOS or exhaustion. Exact duration is insufficient.

The adapter observes that existing talker call's returned single sequence,
requires a final configured EOS and bounded nonempty sequence, and restores the
callable in `finally`. Missing evidence fails closed. The cap/settings, public
EngineResult, SDK installation and model identities are unchanged. Tests include
short completion, EOS at the cap, same-length exhausted output, absent observation
and the actual service's content-free failure/cleanup with no successful segment.

## Current results and retained failures

- G1-epub: 2 expected red failures; G1-desktop: 3 expected red failures and
  4 unchanged renderer threshold passes; G1-python: 8 expected red failures and
  2 Qwen success controls. G1-rust-default/locked: one expected red each.
- G3-epub: 97 passed. G4-desktop: 162 passed, 3 test-assumption failures.
  G4-corrected-files: 40 passed after fixing the jsdom path and expectations
  for the now-required post-Recheck observation. Six other selected files are
  unchanged; their original passing results remain attributable to that run.
- G5-python: 151 passed. The existing pytest cache permissions warning is
  retained; no missing test or product failure was hidden by it.
- G2 first type checks identified only new-test annotations (required matcher
  flag and dict key type). Corrected desktop/Python type checks pass; EPUB types
  pass. First Python lint identified import ordering; corrected lint passes.
  Format checks identified two new-test formatting differences, subsequently
  formatted using the pinned tools. Final formatting/native gates pending.

All selected host gates pass and [EFC-R2-20261030](review-R2.md) independently
approves the corrected implementation. This ledger is not itself a review report.

## Final host outcomes

Exact commands, exit codes and immutable receipt digests are listed in
[host receipts](host-receipts.md). Each command's original input snapshot remains
alongside its receipt, rather than being replaced with current hashes.

- EPUB: 97 passing tests. Desktop: 165 selected tests pass across the original
  six unchanged files and corrected two-file run (40 tests). Python: 151 selected
  tests pass; the concrete-runtime file's five tests were rerun after its type/
  import/format correction. No production Python source changed after G5.
- Format checks: TypeScript, Python and Rust PASS. Type checks: EPUB, desktop
  and Python PASS. Lint: TypeScript, Python and both Rust modes PASS. The final
  browser-fixture correction is covered by its executed browser run and a
  final focused lint check.
- Native: host-profile 25 PASS and optional-profile 60 PASS/2 ignored in both
  feature modes. The ignored cases remain exact installed/local-host diagnostics,
  outside this admission arithmetic change; they are not counted as passes.
- Browser: EFC-01 and canonical restoration PASS in G8-browser. Recheck's
  original fixture timed out looking for Settings without an opened book;
  original trace/screenshot retained under `G8-failure-artifacts/`. Opened a
  synthetic book and reran only EFC-07: PASS in G8-recheck-corrected. No retry
  without diagnosis, and no product change resulted from this fixture repair.
- Piper: one write-manifest run, offline ES 245204 payload bytes and EN 224028
  payload bytes, no audio persisted; package/inventory check PASS. Archive
  SHA-256 `81dd4a376e2d4cb3117a2c56a9a3f94edf23cb542fa19a32af76fdcc79229336`,
  runtime-manifest SHA-256
  `526447762ae3eb26383dbc095cdc8350b50546ed4259497915cade936f85d324`.
  Only the protocol source entry and aggregate bytes changed in the generated
  runtime manifest. No Chatterbox rebuild or inventory rewrite.
- Native startup: one wrapper-owned final release build and complete model-free
  smoke PASS; binary SHA-256
  `27cb0659c3d1228844f0518a652749e01b3a96cdf0976e8581f3998f6edd8e34`.
  No runtime errors/external requests; zero newly retained owned processes or
  scratch roots. Pre-existing scratch remains untouched.

## Same-task evidence retention boundary

No earlier-task result is accepted. Original complete source inventories and
tool versions accompany each current-task receipt. The passing G3 files and all
their EPUB/shared source, fixtures and configuration remain unchanged after G3.
G4's rerun changes only two test files; the other six files and their transitive
production imports are identical. G5's only subsequent Python edit was the
concrete-runtime test annotation/import/format correction, which was rerun.
The release_core tests consume source-manifest/synthetic package trees, not the
generated current runtime-manifest/evidence. G6 changes only those generated
core identities, consumed freshly by G7/G9. G8's failed test belongs to the
other browser spec; the two passing restoration-spec cases and their imports
remain identical. Native code and generated artifacts are unchanged after G7/G9.

The same host/tool environment remains in use. No dependency installation,
lockfile change or tool update occurred; the only environment sync was the
existing generator's locked isolated `release/core/.venv` local-service reinstall,
which does not modify the test `.venv` or Node dependencies. Review must confirm
these closures against original snapshots. Missing proof remains a blocker,
not an invitation to relabel a historical PASS.

## Finding dispositions submitted for review

| Finding | Implemented invariant and current evidence |
| --- | --- |
| EFC-01 | Compact only when stale entries exist, before reinsertion; direct/mounted geometry bounds, browser churn and native reader smoke pass. |
| EFC-02 | Invalidate queued work, cancel futures, retain/drain started ownership, prohibit lazy batch reload, contain startup handoff and surface cleanup failure; benign-child tests pass. |
| EFC-03 | Worker-side success/failure finish metadata; delayed collection preserves actual timestamps and existing GPU tie-break; controller/result controls pass. |
| EFC-04 | Proven pinned EOS seam; reject exhaustion/ambiguous observation without successful service segment; deterministic adapter/service tests pass. |
| EFC-05 | Both internal validators reject terminal high surrogates and preserve valid pairs/public ingestion; 97 selected tests pass. |
| EFC-06 | Native admission/snapshot and fallback disclose derived 7042 MiB; renderer/native threshold and parity controls pass; ADR-0068, frozen floor and continuation preserved. |
| EFC-07 | Explicit successful probe refreshes optional state with action identity protection; mounted preflight failure, persistent incompatibility, superseding action and browser controls pass. |
| EFC-08 | JSON conversion ValueError maps to malformed-json; loaded service cleans up; source tests and regenerated Piper smokes pass. Frozen Chatterbox decoder excluded explicitly. |

## R1 correction and renewed review

[EFC-R1-20261030](review-R1.md) requested one P2 correction to EFC-03 and
accepted the other seven findings plus the stated unchanged evidence closures.
The controller reset its release time on each collected completion, undercounting
CPU wait when GPU priority returned a later finish first. R1-F01-red proves the
consumer defect with the real threaded runtime, controller and export serializer:
collection 0,2,1; finishes 300,200,1500; waits incorrectly 0,0,0.

The controller now retains a frontier advanced only by source-ordered releases.
The same regression proves waits 0,100,0, unchanged finishes, source order and
generation/RTF values. A later source collected before its predecessor cannot
advance that predecessor's release time. R1-F01-green passes 57 selected
controller/runtime/CLI/result/authority tests; Python lint, types and format pass.
The additional `test_benchmark_v5_authority.py` directly imports the affected
official consumer and is included for that dependency, not as a broad audit.

This correction changes only historical benchmark code/tests. Current service,
Piper payload, EPUB/desktop/native, package and browser inputs remain unchanged;
R1's accepted unaffected evidence is submitted for retention. R1's report and
identity manifest remain immutable. R2 fixes the manifest's status padding and
includes the reviewer-requested supplementary paths. R2 approves all eight
findings, with no remaining correction or blocking uncertainty.

## Documentary closeout

The plan was archived only after R2 approval. Incoming links and maintained
indexes now point to its completed location. No production, test, generated
artifact, dependency or configuration changed during closeout. R2's approved
runtime evidence remains applicable; only documentary checks are repeated.
Final archive review is identified as EFC-R3-20261030, whose immutable report is
stored separately from its reviewed manifest. The branch/HEAD and empty index
remain unchanged. No commit, push, PR, merge or publication was performed.
