# Chatterbox v3 integration host validation

Host Report ID: `CB-V3-INTEGRATION-HOST-01-20261007`.
Host execution is complete; independent combined review and updated-head CI
remain separate gates. Reviewed working HEAD:
`998c7b24cda7e969e9ed0344f348506bf38af3b0`.
All commands below run from local PowerShell outside the sandbox. No private
paths, book contents, model weights or generated audio are retained here.

## Preparation retention and publication

- `pnpm.cmd format:check:typescript`: exit 0 after retaining the immutable
  review identity JSON bytes as `review-identities-01.txt`. An earlier `.json`
  copy failed the formatter; no reviewed bytes or formatter rules were changed.
- `git diff --check`: exit 0. All 37 reviewed identities and 11 supplementary
  identities matched the approved preparation report before staging. Exactly
  17 paths were staged; staged blobs and worktree identities matched before
  commit. Commit `998c7b24cda7e969e9ed0344f348506bf38af3b0` was pushed to PR #226.
- `gh pr ready 226 --undo`: exit 0; the PR is draft during integration.
- The user explicitly authorized publishing the three reviewed parts as a
  prerelease, preserving v2 assets and publishing no new VoxLeaf installer.
- Local part sizes and SHA-256 values were rechecked against
  `CB-V3-HOST-01-20261006` before upload. `gh release create chatterbox-runtime-v3
  --target 998c7b24cda7e969e9ed0344f348506bf38af3b0 --title <candidate-title>
  --notes-file <task-owned-notes> --draft --prerelease --latest=false` and
  `gh release upload chatterbox-runtime-v3 <three-exact-part-paths>`: exit 0.
- GitHub's uploaded asset digests, sizes, names, count, state and target commit
  matched the accepted candidate. `gh release edit chatterbox-runtime-v3
  --draft=false --prerelease --latest=false`: exit 0.
- Publication readback: `isDraft=false`, `isPrerelease=true`, published at
  `2026-10-07T03:24:00Z` (2026-10-06 local date). Exactly three runtime assets;
  no model or installer asset. The three v2 digests, sizes and timestamps remain
  unchanged. [Candidate prerelease](https://github.com/mmjosedaniel/voxleaf/releases/tag/chatterbox-runtime-v3).

| Asset | Bytes | SHA-256 |
|---|---:|---|
| `voxleaf-chatterbox-runtime-v3.zip.part-001` | 1900000000 | `b7d4939d4b862b8f4d5ebafcba3289716f27641b846598032b8426a3d7c44196` |
| `voxleaf-chatterbox-runtime-v3.zip.part-002` | 1900000000 | `a882c2e06b6de1dd690328fe7793aa99ef03ac53f510e06be1740dad4e839c3d` |
| `voxleaf-chatterbox-runtime-v3.zip.part-003` | 1230981677 | `11c2a048187cf501c6ccf6a8ae288d6a7c14fb7e1cc5aedf7a10b0da228f1606` |

Publication makes the candidate available for real acquisition validation. It
does not establish native admission, ordinary narration/lifecycle acceptance,
signed-installer readiness or a passing production dependency audit.

## Representative successor resource check

Both task-only probes ran sequentially with the final v3 embedded interpreter,
without PYTHONPATH, against the existing read-only six-model directory. Synthetic
text and PCM remain local; the probe never saves PCM. The existing socket guard
counts connection attempts. This is not an OS-wide network/filesystem audit or
active-inference cancellation test; the later ordinary journey remains required.

The task-only smoke adds `torch.cuda.max_memory_reserved()` to the previously
reviewed adapter probe. An external development-interpreter launcher reuses
`WindowsProcessResourceSampler` and `WindowsGpuProcessMemorySampler`, observing
its own child rather than incorrectly excluding the target root PID. RAM polling
is 50 ms and the existing WDDM counter is rate-limited to 1,000 ms. These helpers
are not copied into the runtime. SHA-256: resource smoke
`a3ef797e85f57ac6ad78096acd632467a461d33e69023852e30a56cfce636e50`;
launcher `a218ef697e63d0bf3b30b1df3becfcad096b9d589c738d5f9f050cbbb5dc6282`.

Exact invocation for each language (`es`, then `en`):

```powershell
& services/tts/.venv/Scripts/python.exe tmp/chatterbox-security-refresh/resource-smoke-launcher.py --python $embeddedPython --models $modelRoot --language es
& services/tts/.venv/Scripts/python.exe tmp/chatterbox-security-refresh/resource-smoke-launcher.py --python $embeddedPython --models $modelRoot --language en
```

`$embeddedPython` selects the unchanged final v3 `runtime/python.exe` in the
short build mirror; `$modelRoot` selects existing local v2 model data read-only.
Environment matches the frozen host validation: HF_HUB_OFFLINE=1,
TRANSFORMERS_OFFLINE=1, HF_HUB_DISABLE_TELEMETRY=1, PYTHONNOUSERSITE=1,
PYTHONDONTWRITEBYTECODE=1, PYTHONUTF8=1, separate task-owned HF/Numba caches.
`nvidia-smi.exe --query-gpu=name,driver_version,memory.total --format=csv,noheader`
reports RTX 5060 Laptop GPU, driver 577.05, 8,151 MiB. Both invocations exit 0.

| Observation | Spanish | English |
|---|---:|---:|
| Load and warm seconds | 72.563 | 22.281 |
| Finite nonzero PCM bytes | 395520 | 349440 |
| Audio seconds | 4.12 | 3.64 |
| Queued-work cancellation and cleanup ms | 359 | 312 |
| Process-tree RAM peak bytes | 5231345664 | 5220917248 |
| Process-attributed WDDM VRAM peak bytes | 3665342464 | 3633885184 |
| PyTorch reserved VRAM peak bytes | 3521118208 | 3489660928 |
| Samples | 1217 | 413 |
| Counted socket attempts | 0 | 0 |

For both languages, max(WDDM, PyTorch) plus the historical 1,024-MiB reserve
fits the existing 4,668-MiB available-memory gate. This representative check
supports retaining the gate; it is not a new universal minimum or quality
benchmark. The unchanged 3,644-MiB profile reference and 83-second cold-start
reference remain historical observations, with their original provenance. The
new load/warm results are reported separately and are not command-to-audible
timings or promises. The Spanish probe overlapped the native baseline build;
no isolated cold-start performance claim is made.

## Worker integration handoff

The sole worker returned the 21 allowed source paths and stopped writing. No
historical authority or frozen v3 runtime build input changed. All following
worker commands ran in local PowerShell outside sandbox and exited 0:

| Command | Result |
|---|---|
| `pnpm.cmd audit:release` | All graphs pass, including active Chatterbox v3; seven Rust notices/five Windows reachable, four unchanged advisory blind spots |
| `pnpm.cmd test:python` | 402 passed |
| `uv run --project services/tts --locked pytest services/tts/tests/test_release_chatterbox.py services/tts/tests/test_release_dependency_graphs.py` | 40 passed after final evidence change |
| `pnpm.cmd lint:python` and `pnpm.cmd typecheck:python` | Pass; mypy 159 files |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox` | 25 passed |
| Same Cargo test with `--features release-locked-runtime` | 25 passed |
| `cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings` | Pass |
| Same Clippy command with `--features release-locked-runtime` | Pass |
| `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/OptionalChatterboxControls.test.tsx` | Eight passed |
| `node --test apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs` | 16 passed, including final Spanish encoding correction |
| `pnpm.cmd format:check` | Pass |
| `pnpm.cmd package:chatterbox-optional:check-acquisition` | Historical authority passes |
| `pnpm.cmd package:chatterbox-optional:v3:check-acquisition` | Successor authority passes |
| `pnpm.cmd inventory:release:check` and `git diff --check` | Pass |

Exact generation commands:

```powershell
pnpm.cmd package:chatterbox-optional:v3:write-acquisition --publication ../../tmp/chatterbox-security-refresh/published-v3.json
uv run --project services/tts --locked python scripts/release_inventory.py --capture-python-licenses --python services/tts/release/core/.venv/Scripts/python.exe --python $embeddedPython
pnpm.cmd inventory:release
```

The v3 interpreter is the actual accepted embedded package, not a development
substitute. Repeated authority generation produced identical hashes. Audit date
advanced to 2026-10-06 only after full audit success; the final audit passed too.
The initial mixed edit/generator approval rejection was resolved with the direct
user's expanded integration authorization and a narrow generator invocation;
no approval or security check was bypassed.

Director inspection caught Windows-locale decoding damage in two Spanish NSIS
strings. The worker corrected their exact UTF-8 bytes, removed the stale fixed
retained-size claim in both languages, added regression assertions and reran
the 16 Node tests successfully. No other changed source had that encoding issue.
The existing Unix symlink branches now exercise both retained cleanup roots;
they did not run on Windows. Native Windows tests cover both roots independently
and together, available/withheld states, cancellation, busy guards, no migration,
exact removal and unrelated-root preservation.

## Director full checks and installer assembly

`pnpm.cmd check`: exit 0 against the final integration source. Results: 209
shared, 653 EPUB, 581 desktop, 38 Node harness, 82 normal Rust, 83 locked-runtime
Rust and 402 Python tests passed. Formatting, lint, types and builds passed.
Existing build size/CSS and Python cache warnings were nonfatal.

The first `pnpm.cmd package:windows` assembled the installer but exited 1 during
signature inspection: a Node-launched Windows PowerShell inherited PowerShell 7
module paths, causing `Microsoft.PowerShell.Security` type-data conflicts.
Direct native Windows PowerShell import passed; the same import through pnpm
reproduced the failure. No build or signature check was weakened. The repeat
used the native Windows PowerShell module directories in the command's process
environment only (user Documents, Program Files and System32 module directories).
The unchanged `pnpm.cmd package:windows` then exited 0, followed by
`pnpm.cmd package:windows:check`, exit 0. The new generated receipt still says
lifecycle and ordinary journey `not-run`; assembly is not installed acceptance.

An additional `pnpm.cmd package:windows:ordinary-chatterbox:preflight
--installed-root <repository-target-release>` exited 1 with
`validation-artifact-present`: the development build output still contains an
old validation overlay. That directory is not the installed artifact. Inspection
of the generated NSIS file confirms the installer selects the explicit ordinary
v3 resources and omits the overlay. The existing ordinary journey must validate
the actual fresh installed tree, and this exploratory failure is not a pass.

The pre-existing user installation requires reversible preservation before the
existing lifecycle and ordinary-journey commands can run. A task-only wrapper
records file hashes, exact Registry64 keys, Run value and shortcut presence,
backs up the existing installation, and restores these independently even after
a failed gate. It does not bypass either command's assertions or deadlines.
Its syntax-only host check passed. Independent read-only audit accepted helper
SHA-256 `df74c894a27958b88289edb80104b2b6981d06837380b401b8db7cad1ffad2d8`
after requiring confirmed teardown before restoring metadata: a timed-out NSIS
process must not later remove restored originals. If teardown cannot be
confirmed, all original backups remain available and restoration is reported
incomplete. The exact helper is now executing in native 64-bit Windows PowerShell
outside sandbox. The three existing commands retain their original assertions;
results remain pending.

First installed execution: `pnpm.cmd package:windows:lifecycle` exited 0.
Install, first start and repair passed, followed by all six uninstall modes:
default preserve, Chatterbox-only, preferences-only, both explicit, legacy both,
and invalid-values preserve. Unrelated synthetic data and pre-existing app data
were preserved. The ordinary journey passed actual installed-artifact preflight,
then failed before download with `webdriver-session-not-created`. Its cleanup and
the wrapper restored all 2,018 original installation files by hash, both registry
keys, the Run value's absence and both shortcuts' original states; the durable
recovery state reports no restoration errors. The composite command exited 1,
so neither journey nor final evidence is accepted by this attempt.

Host diagnosis found EdgeDriver 150.0.4078.83 against installed WebView2
154.0.4258.62. The existing `msedgedriver-tool.exe` follows the repository's CI
setup and downloaded matching 154.0.4258.62 from Microsoft's driver service.
Its invocation with `--help` still downloads; the task-owned output was moved
from the working directory into the ignored task driver directory. The user's
existing driver was not overwritten. `Get-AuthenticodeSignature` returned
`Valid` with Microsoft Corporation as signer. SHA-256:
`0f4600639201ccd2e84c72c3977ac33c67e19152e197c89eb16a6591d1fbe9f7`.
The rerun uses the existing `VOXLEAF_EDGE_DRIVER_PATH` override. The wrapper's
explicit `-LifecycleAlreadyPassed` option records that the unchanged passing
lifecycle gate is reused; ordinary journey and evidence still run unmodified.

The matching-driver retry passed ordinary/hostile startup, both compatibility
gates, cancellation cleanup and actual acquisition of the complete v3 runtime
and model set. The Spanish installed adaptive arm passed: Quick audible start
51,036 ms, Prepared 63,446 ms, 60,235 ms stable playback, zero underruns,
zero counted external requests and zero generated-audio files. Cancellation was
298 ms; synchronization, seek/chapter restart, bounded buffers and cleanup passed.
Peak process-tree working set was 4,877,475,840 bytes. Its existing five-second
`nvidia-smi` sampler reported 3,774 MiB **total-device** peak (41 MiB baseline).
This is a different instrument from the process-attributed WDDM/PyTorch probe
above and is retained separately, not substituted into that probe's result.
English and the remaining ordinary journey are pending at this checkpoint.

## Ordinary journey retry outcome: failed

The complete retry exited 1. Chatterbox English, restart discovery, explicit
removal and Piper Spanish subsequently passed. Piper English failed during
`adaptive exact-host active leaf replacement (attempt 1 of 2)` with
`webdriver-condition-timeout`. Its bounded diagnostic reported zero accepted
units, `tts-service-failed`, recovery code `protocol-failed`, stopped service
and inactive play intent. This does not identify a root cause by itself.
Reinstallation and the final receipt generator were not reached. No passing
ordinary-journey receipt was created.

| Completed arm | Quick audible ms | Prepared audible ms | Stable playback ms | Cancellation ms | Peak process-tree RAM bytes | Sampled total-device VRAM MiB |
|---|---:|---:|---:|---:|---:|---:|
| Chatterbox ES | 51036 | 63446 | 60235 | 298 | 4877475840 | 3774 |
| Chatterbox EN | 38458 | 67036 | 60006 | 300 | 5872381952 | 3698 |
| Piper ES after removal | 4423 | 6130 | 60246 | 244 | 1113870336 | 41 |

Each completed arm recorded zero underruns, external requests, generated-audio
files, stale playback and retained/discarded cleanup units. These passes do not
convert the composite failure or the incomplete Piper English arm into a pass.
An independent read-only audit confirmed that total-device VRAM is not the
workload-attributed metric used by ADR-0044; the global observation is retained
separately and establishes neither a new per-process maximum nor a guarantee
for every admitted host. No admission threshold or frozen authority changed.

The harness restored original application data. The preservation wrapper again
verified all 2,018 original installation files and restored registry, Run and
shortcut state without restoration errors. The next step is a focused Piper
English diagnosis before another complete acquisition journey; no additional
download is needed to isolate this failure.

## Isolated Piper English diagnosis

The task-only diagnostic uses the existing adaptive native harness, the same
release executable and matching EdgeDriver, and the ordinary journey's hostile
environment. It preserves the actual Windows known-folder application data;
changing an environment variable would not isolate that native location.
Independent read-only audit accepted the helpers before execution. Original
assertions and deadlines remain unchanged, and no Chatterbox acquisition occurs.

Two launcher attempts failed before application startup: PowerShell initially
returned two Node executable paths, and Node then rejected a raw Windows path
for `--import`. Both attempts restored all 13,011 original application-data
files by hash, with no restoration errors. The corrected launcher selects one
Node executable, converts the preload path to a file URL, captures complete
native stderr and preserves its exit code. Harmless host checks verified the
preload, syntax and stderr/exit handling before further application execution.
A subsequent preflight rejected the NVM directory symlink before moving data;
the next run used its verified physical Node directory through process-only PATH.
No production source changed during this diagnosis.

The observed isolated run exited 0: Quick start 4,487 ms, Prepared 5,455 ms,
60,370 ms stable playback, active-leaf replacement 4,919 ms, cancellation 677 ms,
zero underruns, external requests, generated-audio files and stale playback.
The wrapper verified restoration of all original application-data files.
Its optional content-free invoke observation was empty, so it provides no causal
explanation of the original failure. This diagnostic build-tree run is not a
substitute for acceptance of the complete ordinary installed journey. A plain
isolated comparison and the complete installed journey remain pending.

Reviewed diagnostic helper identities:

- `run-piper-en-diagnostic.ps1`: `d13f6ba8144ee9df5d71459ed9d8808c4d15fcda851b9f8835608691c27618c4`.
- `reproduce-piper-en.mjs`: `223b061b9a45d6dc5ae5a7e620087914131777dd857de7a33661ecbf9a07edb1`.
- `observe-tts-invoke.mjs`: `92052c6269d7f58b70d1fc330088695857c3b480ff03bd4c177b9f63bbe63614`.

Exact host invocation: native Windows PowerShell `-NoProfile -ExecutionPolicy
Bypass -File tmp/chatterbox-security-refresh/run-piper-en-diagnostic.ps1
-EdgeDriver <task-owned matching driver> -Observe`, with the physical Node
directory prepended to process PATH. The comparison omits `-Observe`.
Ignored log: `tmp/chatterbox-security-refresh/piper-en-observed-resolved-node.log`.

The plain comparison exited 1 at the chapter-transition stage; it did not emit
enough state to identify the failed predicate. The original 13,011 files were
restored with no errors. A corrected fetch-based observer then passed the same
matrix and recorded 108 real IPC requests, no transport failures and only an
expected cancelled synthesis. Neither observed pass establishes why the earlier
host attempts failed. The full read-only analysis and diagnostic measurements
are in [Piper transition diagnosis](piper-transition-diagnosis.md).

The deterministic real-client reproduction established a stranded cancelling
state at a simulated native completion/cancellation boundary. The bounded
two-file repair attempts validated shutdown for that exact native invalid-state
rejection and retains the original cancellation error. Independent initial and
post-change checks passed 45 and 51 focused tests respectively, plus typecheck;
source identities and complete commands appear in the immutable
[containment reports](piper-containment-validation.md). Four new assertions
failed before the repair because shutdown was missing. Other cancellation
errors, malformed/failed shutdown and late-audio disposal remain covered.

`pnpm.cmd check` on the containment source snapshot exited 0 outside sandbox:
209 shared, 653 EPUB, 587 desktop, 38 Node, 82 normal Rust, 83 release-locked
Rust and 402 Python tests passed, together with format, lint, type and build
gates. The existing Vite large-chunk warning is nonfatal. Log:
`tmp/chatterbox-security-refresh/integration-check-after-containment.log`.
A new installer build and fresh installed evidence are required; the prior
installer and diagnostic runs do not certify the changed frontend.

`pnpm.cmd package:windows` then exited 0 using the previously documented native
PowerShell module-path correction. The local installer is 181,602,965 bytes,
SHA-256 `8bc8d5a54e82a113b9ed2bb727c64742a2d7bd5ba9558d7aab1fd417bc77711d`;
the application is 11,837,440 bytes, SHA-256
`fb81330b856cae0d15b28da861409ffbe0e1cba6f8b376360c5cda5d137cdb06`.
The generated receipt remains pending current lifecycle/journey acceptance.
Log: `tmp/chatterbox-security-refresh/integration-package-after-containment.log`.
The local candidate is unsigned and has not been published. No Chatterbox
runtime/module/dependency or published asset changed for the frontend repair.

The plain isolated Piper English comparison on that rebuilt binary exited 0,
with no diagnostic preload: Quick start 4,508 ms, Prepared 5,405 ms, 60,100 ms
stable playback, leaf replacement 4,599 ms, chapter restart 4,876 ms and
cancellation 545 ms. Underruns, external requests, generated-audio files and
stale playback were zero. Original application data was restored and verified
without errors. Log: `tmp/chatterbox-security-refresh/piper-en-plain-after-containment.log`.
This is evidence for the corrected binary, not proof of the cause of every
earlier failure and not a replacement for installed acquisition acceptance.

The complete installed wrapper now reruns lifecycle as well as ordinary journey
and receipt generation, without `-LifecycleAlreadyPassed`: the rebuilt installer
has a new identity, so previous lifecycle evidence is not reused for it.

`pnpm.cmd package:windows:check` exited 0 (`windows-release:current`), followed
by a fresh `pnpm.cmd package:windows:lifecycle` exit 0 for the new installer.
The ordinary journey then passed installed-artifact preflight, ordinary and
hostile-environment release/host gates, and download cancellation cleanup. Its
actual acquisition retry is in progress; the complete journey and final receipt
are not yet accepted. Log:
`tmp/chatterbox-security-refresh/integration-installed-after-containment.log`.

All four narration arms of the rebuilt installed candidate subsequently passed:

| Arm | Quick audible ms | Prepared audible ms | Stable playback ms | Cancellation ms | Peak process-tree RAM bytes | Sampled total-device VRAM MiB |
|---|---:|---:|---:|---:|---:|---:|
| Chatterbox ES | 50851 | 65204 | 60036 | 299 | 5476708352 | 3768 |
| Chatterbox EN | 41137 | 67646 | 60103 | 298 | 5434642432 | 3708 |
| Piper ES after removal | 4179 | 5497 | 60105 | 698 | 1226592256 | 41 |
| Piper EN after removal | 4620 | 6134 | 60226 | 288 | 1154146304 | 41 |

Every arm reported zero underruns, external requests, generated-audio files,
stale playback and retained/discarded cleanup units. Restart discovery and
explicit removal also passed. The total-device samples remain distinct from
the process-attributed admission probe; no capacity threshold changed.
Reinstallation, final receipt generation and restoration are still pending at
this checkpoint, so these arm results do not yet establish the composite pass.

Fresh `pnpm.cmd audit:release` exited 0 after the repair and four narration arms:
Node and Rust pass (seven informational notices, five Windows reachable), base
Python and Piper have no advisory blind spots, and Chatterbox passes with the
same four explicit URL-package blind spots: `chatterbox-tts`, `resemble-perth`,
`torch`, `torchaudio`. No findings or package identities were suppressed.
Log: `tmp/chatterbox-security-refresh/integration-audit-final.log`.

## Final host outcome

The complete preservation wrapper exited 0. Fresh commands
`pnpm.cmd package:windows:lifecycle`, `pnpm.cmd package:windows:ordinary-chatterbox`
and `pnpm.cmd package:windows:ordinary-chatterbox:evidence` all passed. Actual
reacquisition/reinstallation, verification and uninstall completed, and both
new generated receipts exist. Original application data and all 2,018 original
installation files were restored by hash, with registry, Run and shortcut state
restored and no restoration errors.

Final unchanged-source checks all exited 0: `pnpm.cmd package:windows:check`,
`pnpm.cmd inventory:release:check`,
`pnpm.cmd package:chatterbox-optional:v3:check-acquisition`,
`pnpm.cmd format:check:typescript`, and `git diff --check`.
No generated receipt was edited by hand, and no historical receipt was replaced.

The installer remains SHA-256
`8bc8d5a54e82a113b9ed2bb727c64742a2d7bd5ba9558d7aab1fd417bc77711d`.
The installed executable is SHA-256
`b2c7b1e1729b2b7bf05ed6b4b9014a931c42aa5d2c3aad36cf5d1ad91b6e9b67`,
separate from the build-tree executable `fb81330b...`. Independent read-only
inspection explains the complete difference: Tauri's single same-length bundle
marker at byte offset 9,047,802 changes from `__TAURI_BUNDLE_TYPE_VAR_UNK` to
`__TAURI_BUNDLE_TYPE_VAR_NSS`. Replacing only that marker in memory reproduces
the installed hash. The existing receipt policy deliberately records both
identities and binds the journey to the exact installer; they are not claimed
byte-identical. Both executables are 11,837,440 bytes.

The canonical diagram was reviewed: the only major external-source change is
the explicitly documented v3 runtime origin. The client containment repair
changes no process boundary, persistence responsibility, contract or model.
Remaining release limits are the existing unsigned local/maintainer scope,
external public signing/publication authorization, four explicit Chatterbox
advisory blind spots, and Unix-only symlink branches not executed on Windows.
Qwen3 remains deferred. Earlier failures remain recorded and are not all
retrospectively attributed to the deterministic client defect.
