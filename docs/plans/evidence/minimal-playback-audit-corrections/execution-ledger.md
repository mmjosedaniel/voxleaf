# Minimal playback audit execution ledger

Task: MPA-20261030. Base and execution HEAD:
`f2936b76b181ad748c7096ef1184961e242b6487`.
Branch: `codex/minimal-playback-audit-plan`. Initial worktree and index empty.
All execution was in normal local PowerShell outside the managed sandbox.
Node 24.18.0, pnpm 11.15.1, Vitest 5.0.5, Playwright 1.64.1, Vite 8.3.4,
Cargo 1.97.1, uv 0.11.29. WebView2/EdgeDriver 156.0.4314.50;
Tauri-driver 2.0.6 from Cargo installed metadata (no --version option).
The run did not install or upgrade tools/dependencies.

## Commands and original receipts

Raw receipts/logs/input manifests are immutable local evidence under
`tmp/evidence/minimal-playback-audit-corrections/`. Every receipt records start,
end, command, host execution mode, HEAD and tool versions. Input manifests
capture all tracked/nonignored source/config/fixture membership plus installed
pnpm lock metadata. From G2 onward, separate exports manifests capture generated
shared/EPUB entry points. These files are ignored, not publication payloads.

| Receipt ID | Exact command | Exit | Seconds | Receipt SHA-256 |
| --- | --- | --- | --- | --- |
| G0-packages | `pnpm.cmd build:packages` | 0 | 1.33 | `b86b547f1c7a4dc8d596f6a815d192f6ab040822ae6e7e9d7db38c88a5d636ae` |
| G1-red | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts -t "MPA-"` | 1 | 23.66 | `66b7de3d3c298295b6b725ddebaae57d6bf7583a1ac3aa0984b8a9038b94eef9` |
| format-owned | `pnpm.cmd exec prettier --write apps/desktop/src/tts/playback-backends/incremental-wsola-v3.ts apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts apps/desktop/src/tts/pcm-playback.test.ts apps/desktop/src/tts/product-narration-coordinator.test.ts apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts` | 0 | 1.47 | `74494b1a169790bbbd6606da7383d84192fb0d40773597fe92e1ccbdf4f87b83` |
| G2-format | `pnpm.cmd format:check:typescript` | 0 | 13.62 | `2df4096a30daa13ebc788275ed6200ad442b72d14c995e572f37f02ee235b44e` |
| G2-lint | `pnpm.cmd lint:typescript` | 0 | 33.30 | `72a42c357b37c25315493b77960e222c1dbc4884b04122d63a350f483ff71b49` |
| G3-combined | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/playback-backends/incremental-wsola-v3-worklet.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx` | 0 | 5.98 | `31eb8d2458f5a1ed8929f1cfb5552dccbc57159e41a5c093c3911c6e0cb300fe` |
| G2-types | `pnpm.cmd --filter @voxleaf/desktop typecheck` | 0 | 10.90 | `4e72bd701dc8323aa190e634091d6ce2c6f15a0599a2b6e47a191b3aa0c3072d` |
| G4-browser | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "MPA-&#124;NLC real worklet&#124;CHAT-AUDIT real bundled worklet"` | 1 | 53.17 | `903e860cd6cb5d26f91bb9faf693f664491a88c3861ce58641c7e2812b82a8e7` |
| G4-error-diagnostic | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "MPA-02"` | 1 | 6.70 | `dd6a4362e171ec5dd88c8143f08f297909ec10373096644462654463c4c1dec2` |
| format-browser | `pnpm.cmd exec prettier --write apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts` | 0 | 0.75 | `7806f8575cbce232346d296773194a105c25e5fb74b6379d29a3e288347f4de8` |
| G4-error-corrected | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "MPA-02"` | 1 | 6.21 | `c313d5b85359b0fc8711912354cfb23adf40c32a42310a554acba3b4564a1c03` |
| format-browser-final | `pnpm.cmd exec prettier --write apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts` | 0 | 0.69 | `3f2983f1232a2c56e5f8c74a12bf66e93d82dbc0ce6806add3d651a6c9c329e4` |
| G2-lint-renewed | `pnpm.cmd lint:typescript` | 0 | 7.43 | `2700deb2577534d72ab3cbe1377521364677df7a082e600c4e991f45773f1b57` |
| G4-error-platform | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "MPA-02"` | 0 | 6.97 | `01b56ef08ff6504a95b6ec2a37200b4d7d9f769f4ea1b6ca6dbed019365b16ed` |
| G2-format-renewed | `pnpm.cmd format:check:typescript` | 0 | 8.40 | `ab42c6637a6974778e34ce7b401cf1c75446707a5ee8d82dbdd96eacf43dcacf` |
| G2-types-renewed | `pnpm.cmd --filter @voxleaf/desktop typecheck` | 0 | 4.68 | `cc817f3ffffa7ddae90541266fe07b194d8d07ab95023a82363c6570d984677a` |
| G5-core | `pnpm.cmd package:piper-core:check` | 0 | 19.29 | `6c1a3666cfbb04e626653be37aff7e19a6eedcb3c4eaf8a70f589d81090012b2` |
| G5-build | `pnpm.cmd build:desktop` | 0 | 38.87 | `f9534db815892bed036f208466f3ba10f75cc917be5772077d896e4d91f004eb` |
| G6-piper-en | `& ./tmp/evidence/minimal-playback-audit-corrections/piper-resources.ps1` | 0 | 136.33 | `f326a4bd153142118b7651a0c94870fa6920967f559a5509a39e5e4e794ef958` |

G6's temporary resource wrapper invokes exactly:

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en
```

G7 uses `pnpm.cmd check:evidence` and `git diff --check`; its current immutable
receipts are supplied with the review snapshot after this ledger is frozen.
Relative Markdown targets are checked against the repository filesystem.
The initial G7-diff found an extra blank line at the active-index EOF; it was
removed, preserving the failed receipt and renewing documentation checks only.

## Results and retained failures

- G1: 14 assertion failures, 2 passing Stop/end controls, 184 skipped. All three
  findings reproduced against unchanged production; no fixture failures.
- G2: initial and renewed format/lint/types passed. Only browser-test edits
  invalidated the initial static checks; no full repository test sweep ran.
- G3: 214/214 pass across the four planned files, one combined invocation.
- G4 initial: MPA-01/03, NLC completion and FIFO race pass. MPA-02 did not deliver
  an event to the handler. The isolated diagnostic confirmed handler presence
  and absence of disposal. An ErrorEvent with the specification name also
  failed. Chromium source identified the exact mismatch: this implementation
  maps onprocessorerror to `error`, not `processorerror`. Correcting only that
  event name passed (`G4-error-platform`, 1/1), including explicit recovery,
  zero ownership and stale-node isolation. All three failures and artifacts
  remain preserved; no assertion was weakened or passing case rerun.
- G5: current package integrity check and one current renderer/native build pass.
- G6: single Piper EN arm passes, all six rates exercised. Latest selection wins;
  first activation 300 ms; cancellation 245 ms; zero underruns in the existing
  minute observation; five contexts created/closed. These are this run's
  observations, not new general performance or support claims.

[Web Audio's event contract](https://www.w3.org/TR/webaudio-1.1/#dom-audioworkletnode-onprocessorerror)
and [Chromium's handler mapping](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/modules/webaudio/audio_worklet_node.h)
explain why browser injection uses the platform's actual event route. Injection
proves handling, not a naturally occurring DSP crash.

## Reuse and independence

No historical runtime PASS is accepted. SFA G5R-playback and R7 R1-G4 original
receipts/manifests were read, and NLC real-processor/paired-port/browser fixtures
were extended. G0 built workspace exports once because original generated-input
proof was incomplete; configured browser hooks still perform their own build.

Current-task G3 is retained: its seven changed source/unit-test files, unchanged
controls consumer, all transitive source/fixture/config/lock membership, tools
and installed pnpm metadata are unchanged. The browser spec is explicitly
excluded by Vite's Vitest discovery and is not imported by these four files.
Documentation is not a runtime/test input. Current-task G2 renewed/G5/G6 retain
identical consumed inputs after documentation-only edits. No installed tooling,
configuration, host driver or runtime was changed between these gates.

G4 retains only the three originally passing cases. The complete source embedded
in the original failed-case trace matches its execution-time SHA-256:
`97f776dd9fa6b1630cb1c71f2a78a3a6eca8cf41b1b5365c20b381b02a26ac89`.
Removing only the MPA-02 test from original/final text leaves exact identical
content (including all shared helpers and the other cases), recorded in
`G4-case-equivalence.json` and `G4-error-case-only.diff`. Runtime source, generated
workspace exports, Vite/Playwright configuration, locks and installed metadata
are unchanged. The trace records Playwright 1.64.1 and isolated Chromium settings;
the observed renderer URL is the same current `index-BCohe5sC.js`. Exact source
manifest comparisons are supplied for independent assessment; no aggregate G4
invocation is relabelled as a full PASS.

## Native preparation and restoration

The existing verified core was reused, not regenerated. Current runtime manifest:
`526447762ae3eb26383dbc095cdc8350b50546ed4259497915cade936f85d324`.
The current executable is 12,452,864 bytes, SHA-256
`1c6adae31c5743ba880cb5cef3e0b2b3be9726ed025bd3037845422860e8ba06`.
The native wrapper requires that exact binary before and after execution.

The adjacent old resource directory was preserved as an exact sibling; the
verified package was copied temporarily and all 2,023 manifest entries were
size/hash checked before native execution. Finally removed only the task-owned
copy and restored the complete original tree, with exact before/after file
membership/size/SHA-256 equality. The journal and private inventory stay ignored.
No new owned process or scratch root remained; pre-existing scratch was preserved.
The harness reported zero retained/discarded audio units, generated audio files,
external requests or stale playback. No personal installation or model cache
was changed. The restored old adjacent resources are still old; the temporary
setup is not a claim of permanent local readiness.

## Review and limits

Independent MPA-R1-20261030 APPROVE accepted the frozen implementation and
individual evidence retention without findings. The separate final archival
assessment is retained in [review reports](review-reports.md).
System diagram reviewed: existing processes, components, trust, local inference
and persistence boundaries remain unchanged. No DSP/window/hop/rate arithmetic,
public schema, queue, scheduler, Python, native source, dependency or lock changes.
No heap/CPU retention measurement, new listening campaign, full-suite result,
additional language/profile arm, commit, push, PR or merge is claimed.
