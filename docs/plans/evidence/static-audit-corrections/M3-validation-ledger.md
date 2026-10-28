# SAC current validation ledger

All required execution gates passed. Independent implementation review
[`SAC-R3-20261028-01`](review-R3.md) returned APPROVE with no actionable findings
or blocking gaps. The [final report](review-final.md) records the separate exact
archive review and documentary checks. This ledger does not itself grant acceptance.
Base/HEAD: `7c00f2f633ffd0c79043ab694f29b7defb46941a`; branch
`codex/static-audit-corrections`. No pre-existing changes or Git mutations.

All executions below use normal local PowerShell outside the managed sandbox.
Raw commands, exit codes, UTC times, before/after source membership and SHA-256
identities are retained under ignored `tmp/evidence/static-audit-corrections/`.
Toolchain: PowerShell 7.6.5, Node 24.20.0, pnpm 11.15.1, Python 3.12.10,
uv 0.11.29, Rust/Cargo 1.97.1, Windows build 26200. No dependency installation,
model download or runtime rebuild has occurred.

## Executed cheap and browser gates

| Receipt | Exact command | Result |
| --- | --- | --- |
| Q-ts-format-04 | `pnpm.cmd format:check:typescript` | PASS, final browser selectors and native visibility correction included |
| Q-ts-lint-04 | `pnpm.cmd lint:typescript` | PASS |
| Q-ts-types-02 | `pnpm.cmd typecheck:typescript` | PASS, shared/EPUB/app and package builds |
| Q-desktop-types-03 | `pnpm.cmd --filter @voxleaf/desktop typecheck` | PASS, renewed app closure after browser selector correction |
| Q-ts-tests-01 | `pnpm.cmd test:typescript` | PASS: shared 210, EPUB 702, desktop 899, seven Node suites 102 |
| Q-python-format-01 | `pnpm.cmd format:check:python` | PASS, 183 files |
| Q-python-lint-01 | `pnpm.cmd lint:python` | PASS |
| Q-python-types-01 | `pnpm.cmd typecheck:python` | PASS, 180 files |
| Q-python-tests-01 | `pnpm.cmd test:python` | PASS, 678 tests; one cache-write permission warning, no failing test |
| Q-python-build-01 | `pnpm.cmd build:python` | PASS, wheel and sdist retained with artifact identities |
| Q-evidence-tests-01 | `pnpm.cmd test:evidence` | PASS, 31 tests |
| Q-rust-format-03 | `pnpm.cmd format:check:rust` | PASS, exact final Rust inputs |
| Q-rust-lint-02 | `pnpm.cmd lint:rust` | PASS, default and release-locked all-targets Clippy |
| Q-rust-tests-01 | `pnpm.cmd test:rust` | PASS, 139 default and 138 release-locked; seven explicit ignored diagnostics/fixtures per configuration |
| Q-desktop-build-01 | `pnpm.cmd build:desktop` | PASS, default Tauri and embedded Vite production build; existing chunk-size warning only |
| P-core-check-01 | `pnpm.cmd package:piper-core:check` | PASS, retained core verified without reconstruction |
| B1-browser-01 | `pnpm.cmd test:browser foundation.smoke.spec.ts reader-narration-bugfixes.smoke.spec.ts` | 16 PASS, one SAC-15 fixture setup failure; foundation's four cases passed |
| B1-reader-browser-02 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` | 12 PASS, one SAC-15 locator failure; stopped for diagnosis |
| B1-SAC15-repair-01 | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep SAC-15` | PASS, directed corrected case |
| B1-reader-browser-03 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` | PASS, all 13 cases, including final future-byte preservation |
| N1-native-02 | `node apps/desktop/scripts/native-startup-smoke.mjs` | PASS, complete WebView2 gate and oriented JPEG/release; same default executable, no rebuild |
| H-CPU-01 | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | PASS: 60-second stable playback, zero underruns/external requests, 349 ms cancellation, zero retained/discarded units and generated audio files at cleanup |
| H-GPU-01 | `pnpm.cmd test:chatterbox:v7:native-startup` | PASS, supervised V7 ES/EN, cancellation 262/236 ms, restart, zero network/audio writes; all 13,091 runtime payload files verified after execution |
| Q-rust-release-artifact-02 | `& apps/desktop/src-tauri/target/debug/deps/voxleaf_desktop-c20f75a3316dfdc8.exe` | PASS, 138 tests and seven ignored diagnostics on the exact H-GPU libtest bytes |
| P-config-check-01 | `pnpm.cmd package:windows:check` | PASS, current package configuration and resources |
| P-release-build-01 | `pnpm.cmd --filter @voxleaf/desktop tauri build --config src-tauri/tauri.release.conf.json --features release-locked-runtime` | PASS, one final NSIS bundle, unsigned local |
| L1-lifecycle-02 | `pnpm.cmd package:windows:lifecycle`, with the process-only module setup below | PASS, install/first start/repair, six silent-option scenarios, nine optional roots, unrelated sentinel/data preservation |
| P1-preflight-01 | `pnpm.cmd package:windows:ordinary-chatterbox:preflight` | PASS, installed ordinary and hostile-environment release boundaries and known CUDA 12.0 host gates |
| Q-final-evidence-02 | `pnpm.cmd check:evidence` | PASS, exact R3 privacy/retention guard; final archive renewal recorded in the final report |
| Q-final-links-02 | `python tmp/evidence/static-audit-corrections/check-links.py` | PASS, 98 local link targets in ten changed Markdown files; final archive renewal recorded in the final report |

Earlier failing red reproductions, fixture corrections and type/format failures
remain under distinct receipt IDs; see the ExecPlan progress log. B1 acceptance
is composed from four unchanged foundation cases and thirteen current reader
cases, not a claim that the original combined command passed.

## Reuse after the R1 correction

No historical PASS was reused. The current run's passing results above are
candidates for reuse only while their complete consumed inputs remain equal.
Independent read-only closure investigation found:

- Python source/configuration/locks, scripts, shared data, benchmarks and the
  architecture files consumed by tests have no drift against Q-python-tests-01.
  Python does not read supervisor Rust or browser specs. Git-sensitive tests
  use fixed probes, patched queries or immutable commit authorities; HEAD and
  history are unchanged. Current wheel/sdist identities still match their
  immediate post-build receipt.
- Desktop Vitest excludes `tests/browser/**`; shared/EPUB and their generators
  do not consume Rust/spec/report edits. The seven explicit Node suites consume
  package configuration, hooks and harness sources, not supervisor Rust or
  browser specs. Those actual consumed files remain unchanged.
- TypeScript types include browser specs, so desktop typecheck was renewed.
  Format/lint were renewed across their actual complete TypeScript input set.
- Foundation's source, synthetic fixtures, imports, configuration, browser,
  bundle inputs and environment are unchanged after its four passing cases.
  Only the separately executed reader spec needed renewal.
- Rust, native executables, model-host acceptance and packaging are invalidated
  by the new supervisor writer and must run fresh. Evidence Markdown checking
  must run after final documentation.
- N1's final correction affects only its top-level harness: scroll the known
  synthetic raster into view before asserting lazy decode. The native Node
  suite reads `native-smoke/tts-scenarios.mjs`, not this entrypoint; its consumed
  files remain equal. TS format/lint and N1 were renewed; product bundles,
  Rust, fixture bytes and browser results were not invalidated.

R3 confirmed membership, tools/environment, lockfiles, generated dist and
artifact equality. Only documentary gates require renewal for archive edits;
any uncertainty about a consumed input would renew its affected gate.

## R1 adjustments before native preparation

The real blocked-stdin regression initially failed during fixture setup:
R1-E-stdin-red-01 could not query a write-only handle, and red-02 could not
construct ChildStdin from a raw handle. Neither is a functional RED. The stage
stopped and was replanned: the existing real child fixture queries its own
readable stdin and reports only the numeric quota in owned scratch. Production
Session spawning stays unchanged. The intended blocked-write assertion must
fail before applying the writer correction.

R1-E-stdin-red-replanned-01 reached the intended failure: the original write
needed the captured-process rescue after three seconds. R1-E-stdin-green-01
then exposed a real Windows behavior: closing the reader can make WriteFile
return success after cancellation. The writer now rechecks closed/deadline
after I/O before acknowledging success. R1-E-supervisor-final-03 passed 32
supervisor tests (five explicit ignored fixtures/host diagnostics), including
the 65,536-byte real pipe: 100 ms dispatch timeout, 105 ms total cleanup and
5 ms cancellation containment, with no rescue in either case. A concurrent
extra request is rejected and a late old failure preserves its replacement.
Q-rust-lint-01 subsequently found one needless borrow in the new test. It was
removed without a lint suppression. Q-rust-lint-02 and the final Rust matrix
passed afterward.

The retained `build-windows-release.ps1` always writes the historical tracked
`windows-package-evidence-v3.json`. Preserve that accepted receipt. Execute its
existing equivalent leaves instead: verified core check, release configuration
check, Tauri release-locked NSIS build, signature/hash observations and the
existing `windows-release.mjs evidence` command without `--write`. Capture the
new output under this run's ignored evidence directory. Do not claim execution
of `package:windows:verified-core` itself. This routing adjustment changes no
build configuration, package resources, installer hook or release authority.

## Native visibility diagnosis

N1-native-01 timed out in the new oriented-image case after earlier native
assertions passed. A focused WebView2 diagnostic on the same executable and
the retained 320x640/extra-large preferences observed both lazy placeholders
below the viewport (tops approximately 940 and 1077); after scrolling, both
decoded to exactly 2x3. The harness now scrolls each known synthetic placeholder
into view before its unchanged dimension assertion. Product code is unchanged.
N1-native-02 then passed the complete gate in 11.7 seconds.

The diagnostic's first setup attempt omitted awaiting fixture construction;
its empty owned scratch was removed. Its second attempt captured the decisive
observations, then falsely treated Node's signal-terminated child (`exitCode`
null) as retained. Both nonzero receipts remain. A separate normal-host check
confirmed no driver/profile process remained and removed only its verified
owned scratch; N1-image-diagnosis-cleanup.json retains that private evidence.
Neither diagnostic command is reported as a passing acceptance gate.

## Model session and binary identity

H-GPU rebuilt its release-locked libtest. Its SHA differed from the preceding
full Rust matrix, while the default libtest remained identical. Therefore only
the new release-locked executable's fast complete test leaf was renewed, using
the exact executable directly to prevent another relink. This is an explicit
leaf execution, not a second `pnpm.cmd test:rust` aggregate claim.

H-model-cleanup-01 verified unchanged runtime membership (manifest plus 13,091
payload files), no surviving model/native/driver processes and no scratch audio
files. The three content-safe JSON observations were archived byte-for-byte
before removing only the journaled scratch root and its 49 files. No firewall
rule or drive alias was created. Original application-data verification was
deferred until after L1/P1 and passed as recorded below.

## Acceptance disposition

Exact-patch implementation approval is recorded in R3. The separate final
archive review is linked above. The existing V7 runtime and six official model
files passed complete H-artifact-preflight-01 verification; they are reusable
payloads, not acceptance evidence for a new executable.

## Installer environment diagnosis

L1-lifecycle-01 executed the registered command but stopped before data
ownership initialization: pnpm forwarded PowerShell 7 module directories to
Windows PowerShell 5.1, which selected incompatible Utility v7 and could not
autoload Get-FileHash. Direct Windows PowerShell selected its proper Utility
v3.1. A normal-host diagnostic under pnpm reproduced the mismatch and verified
the correction: prepend the installed Windows PowerShell module directory only
in the L1 child process. No global environment, module, dependency or repository
script change is required.

The wrapper's finally reinstalls the final package and verifies original data
even when L1 fails. Its one pre-try synthetic sentinel was identified by exact
creation interval, bounded path, sole expected file and contents, then removed;
no application-data backup had been created yet. Preserve this failed gate and
its restoration evidence. A single infrastructure retry is authorized after
that restoration finishes, with a new journal and the proven environment fix.

The first wrapper's final data comparison passed for every original file and
directory. Its installed-binary comparison used the unbundled build hash and
therefore reported a mismatch. P-nsis-stamp-02 established that the installed
file differs only in the three-byte `UNK` to `NSS` bundle marker: substituting
that single marker in memory reproduces every installed byte. The marker's
meaning was verified against local `tauri-utils` 2.9.3 `src/platform.rs`, itself
matched to the cached crate checksum fixed in Cargo.lock. No executable was
edited. Both identities remain separate; the retry expects the proven installed
identity. P-nsis-stamp-01's missing legacy cache-sidecar assumption is preserved
as a failed proof setup, not an accepted result. The final installer checksum
sidecar is generated by the same checksum leaf as the existing build wrapper
and was verified against the installer hash.

The successful L1 receipt's exact invocation includes only this local process
environment adjustment before the registered command:

```powershell
$env:PSModulePath = (Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\Modules') + ';' + $env:PSModulePath; pnpm.cmd package:windows:lifecycle
```

L1-lifecycle-02 passed all six removal-option scenarios, first start and repair,
then restored the original application-data directory. The wrapper reinstalled
the final NSIS package and verified the installed binary hash. P1-preflight-01
passed both ordinary and hostile-development-environment sessions. The wrapper
completed its final comparison after both gates: original application-data
membership and every file's bytes match the pre-test inventory. Final
installation and installed binary identity are verified.

## Frozen executable and installer identities

| Artifact | SHA-256 |
| --- | --- |
| Default app used by N1 and H-CPU | `001c428c2e5eceee5c2576d9abbdde82c12ff34e438addf5c199f65bc0f52038` |
| Default Rust libtest | `912099f696d74bcc5f37f242c028f9be7abd6261fa74dd7f8ee95acc07e9e50a` |
| Release-locked libtest used by H-GPU and renewed 138 tests | `887df12dc7f3713c966e552e2e318d1c7c7eff684f81fcc40c93088081a3e14a` |
| Release-locked unbundled app | `74e757258e3c70d87e23cb30e19dfaaaf86e59105c77a116ee1ba7410d879748` |
| NSIS-installed app | `59cb9415d1e79e51b4d1d40a023064c5d48fc185ec1be01dd35f348a2961fe1b` |
| Final NSIS installer | `445af623e2e1cade3ca62823e3ffabf7f98523ad5a6ad3dfd40b215f2172ee52` |

These artifacts have distinct acceptance roles. Default native/model results
are not presented as execution of the installed release-locked application.
The latter requires its own L1/P1 evidence. No signing, SmartScreen reputation,
interactive installer, clean-new-Windows or full online acquisition claim is
made by this bounded correction batch.

## Final reuse and graph correspondence

`final-reuse-proof.json` records equal conservative input membership and SHA-256
sets: 626 inputs for current TS tests, 676 for Python tests, 599 for foundation
browser cases and the four evidence-test script/config inputs. Python wheel and
sdist hashes still match their immediate build receipt. Toolchain/environment
versions match M0; no package or tool update occurred. Independent investigation
confirmed that closeout Markdown/index changes are outside Python/Vitest/Node
and evidence-test discovery; only `check:evidence` consumes those real documents.

The applicable `check`/`check:portable` graph is covered by the explicitly listed
leaves. Shared/EPUB builds and the 17-file generated-contract check ran inside
the actual type/test/browser commands. Vite's production build ran inside both
actual Tauri builds; its unchanged configuration consumes no differing Tauri
environment option. These cover the portable Vite leaf. The separate Python
wheel/sdist build passed. Neither aggregate command is claimed as executed.

Final source/fixture/lock/tool comparisons support retaining the passing current
TS/Python/evidence leaves and foundation cases. Earlier historical runtime
results remain invalidated; payload reuse is limited to currently verified
Piper core, V7 runtime and six model files. The new native executables received
their fresh required runtime checks, with roles and hashes kept distinct above.

The final host journal verifies reinstallation and original data equality after
L1/P1. No task-owned temporary root or native/driver/model process remains;
pre-existing unrelated roots were preserved. Raw inventory values and digests
are private. The canonical diagram and completed M005 boundary were reviewed
and remain accurate; no major component/process/contract/persistence change
requires rewriting them.
