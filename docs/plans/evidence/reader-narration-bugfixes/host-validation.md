# Reader/narration host validation

Updated 2026-10-20 UTC after host-context recovery and complete model validation. Task `RNB`. Base and current HEAD:
`8fd0c54e93705009e6070cb97105c8a1032002d6`, branch
`codex/reader-narration-bugfixes`. Initial index/worktree were clean. All code,
tests and documentation in the current diff belong to this task; none are staged.

## Environment and source provenance

Every reported command ran in normal local PowerShell outside the managed
automation sandbox, from the repository root, with the Corepack shim selecting
the pinned pnpm 11.15.1. No earlier planning or baseline pass is reused as
acceptance of modified code. The final input manifest covers 723 production,
test, fixture and configuration files; SHA-256:
`2625d3f76e31f62d5f01d77c6719226b1bc6099e6e3757b7fd70c7b01473db4b`.
Its after-run check found zero drift. The exact review manifest independently
binds all changed/new paths and supporting authorities to their identities.

Full output, manifests and diagnostic scripts remain in ignored
`tmp/evidence/reader-narration-bugfixes/`. Playwright screenshots/traces remain
in its configured ignored `apps/desktop/test-results/browser/` directory.
These local captures are not portable public artifacts. Fixtures contain only
repository-authored synthetic text; no private EPUB or generated audio is added.

## Current passing gates

| Exact command                                                                                      | Result and local capture                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm.cmd check`                                                                                   | Exit 0, `check-04.log`: formatting, lint, TypeScript/Python typing, evidence checks/tests and builds pass. Shared 209, EPUB 661, desktop 749, Rust default 98/release-locked 97, Python 586. One Rust subprocess helper intentionally ignored in each mode.      |
| `pnpm.cmd test:browser`                                                                            | Exit 0, `browser-07.log`: nine pass. Includes a real 30,150-ms idle interval before first viewport image access, actual highlighted Next target, and four created/closed Chromium AudioContexts across direct/WSOLA navigation and Stop. Inference is synthetic. |
| `pnpm.cmd test:native-startup`                                                                     | Exit 0, `native-03.log`: native process supervisor, deliberately blocked loading/warming, bounded interruption, explicit restart and existing reader/ingress/privacy checks pass. Service is synthetic.                                                          |
| `pnpm.cmd --filter @voxleaf/epub test`                                                             | Exit 0, `epub-edges.log`: 661 pass, including lazy archive-path exact/max-plus-one deadline and cumulative byte edges. Repeated by final `check`.                                                                                                                |
| `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts` | Exit 0, `review-regressions-green-02.log`: 47 pass, including quick/prepared 63/64/65/112, refill after 70 passages, paused Next/Previous, typed-client completion race, concurrent close and 5,000/5,001-ms cleanup. Repeated by final `check`.                 |

Earlier focused five-file desktop validation also passed 107 tests; final
`check` repeats those files with the additional cases. `pnpm.cmd test:rust`,
`pnpm.cmd build:packages`, `pnpm.cmd format:check`, `pnpm.cmd lint` and
`pnpm.cmd typecheck` are executed by the final configured aggregate as well as
the recorded focused runs. Non-fatal output includes Vite's existing chunk-size
warning and pytest's cache-write permission warning; neither changed the result.

## Reproduction and failed attempts

- Permanent pre-fix desktop tests produced six intended assertion failures
  with 56 controls passing (`desktop-red.log`); EPUB produced one intended idle
  deadline failure with 655 controls passing (`epub-red.log`); native default
  tests produced busy-shutdown and stale-state failures with 95 passing and
  one helper ignored (`rust-red.log`). The failing default arm stopped the
  aggregate before release-locked red execution. Both modes pass after repair.
- Review corrections added three red assertions: premature second close,
  successful cleanup beyond its shared deadline, and restart refused after a
  successfully contained native completion race (`review-regressions-red-02.log`).
  A prior race fixture lacked availability setup and is not defect evidence.
- Intermediate fixture/contract/type failures were corrected, not counted as
  acceptance. These include native-client expectation changes, synchronous
  cleanup preconditions, a clock helper, a JSON import attribute, a collapsed
  detail panel and a DOM HighlightRegistry type assertion.
- `browser-05.log` exposed fractional `performance.now()` values violating the
  scheduler's integer clock contract. The default monotonic clock now floors
  to whole milliseconds; final browser and repository gates were rerun.
- Observation controls asserting the original bugs remain historical
  reproduction evidence only. They are not repair tests.

## Historical real-model failures, subsequently resolved

`pnpm.cmd test:tts:bilingual-portfolio-exact-host` exited **1** on both
`models-01.log` and final-source `models-02.log`. Six-arm environment and
interpreter-bound outbound firewall preflight, build and synthetic native
lifecycle passed. The first packaged arm then failed during profile selection
with `webdriver-condition-timeout`, before inference. Those failed attempts did not accept any model. The later complete matrix is
recorded separately below.

The narrower existing-runner diagnostic command was:

```powershell
pnpm.cmd test:tts:bilingual-portfolio-exact-host --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --language=es
```

It exited **1** on the final source (`chatterbox-diagnostic-02.log`). The
content-free native result is `state: failed`, `failure: installed-package-invalid`;
selection fails before model preparation. Existing configured runtimes/model
roots, drivers and offline flags were used. The initial preflight failure from
an unconfigured terminal was resolved with those existing settings, without
downloads or firewall changes; it is distinct from this package-verification
blocker.

Read-only host inspection found the current optional v3 and retained v2 roots,
all 13,090 expected files (including the manifest), no extras/missing files,
no runtime size mismatches and no reparse points. The installed manifest hash
matches authority, and all 13,089 runtime/model file hashes match. Its referenced
interpreter, model directory and site-packages directory exist. Those initial checks did not explain the rejection. The subsequent
[host-context investigation](host-context-recovery.md) isolated inherited MSIX
path redirection; ordinary PowerShell passed the unchanged native verifier.
No corrupted bytes, reinstall, integrity bypass or retained-v2 fallback is claimed.

The corrected harness requires a native loading/warming observation matching
the started service instance before Cancel start, then stopped/no-instance,
worker containment within two seconds and total cleanup within five seconds,
followed by explicit restart. The blocked run never reaches those assertions.
Pending renderer invocation, synthetic native tests and Chromium mocks cannot
substitute for them. Context counts establish closure, not long-term RAM change.

## Current real-model acceptance

The unchanged prescribed full command exited **0** in ordinary local PowerShell
on the corrected harness (`models-04.log`): six arms, preflight, build and
synthetic native lifecycle all passed. See the concise
[real-model receipt](real-model-validation.md) for exact timings and provenance.
Both Chatterbox arms observed native warming before Cancel start: shutdown
183/204 ms and final cleanup 201/219 ms (Spanish/English), followed by explicit
restart and playback. Across all six arms, 32 contexts were created and closed;
final retained/discarded units, audio files and external requests were all zero.
The two Qwen arms remain development-only; these results are host-specific.

A second obstacle after context recovery was in the new harness: Tauri's
non-writable invoke property silently rejected interception. The permanent
read-only-port regression failed for the intended native-loading observation,
then all 20 harness tests passed after switching to direct native observation.
The full repository aggregate was repeated after that correction. Production
code, installed package and security guards were unchanged by this follow-up.

## Acceptance and continuation

The six original review findings and the later harness defect are corrected.
Reviews 02 and 03 found no remaining code findings but withheld acceptance while
model evidence was missing. Review04 assessed the complete evidence and returned **APPROVE**, no findings
or missing gates. All six stages are accepted and the plan moved to completed.
The closing documentary snapshot is assessed separately as review05. No staging,
commit, push or PR is authorized or performed.
