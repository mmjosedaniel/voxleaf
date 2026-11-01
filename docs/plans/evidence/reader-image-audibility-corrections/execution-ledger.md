# RIA-20261101 execution ledger

Base/HEAD: `35b3d373e24d285e21825562a5744280dcb2e9d6`.
Branch: `codex/reader-image-audibility-plan`; initial worktree/index clean.
Implementation, host validation and independent review authorized. No commit,
push, PR, merge or publication authorized or performed.

Local immutable receipts: `tmp/evidence/reader-image-audibility-corrections/run-01/`.
The [ExecPlan](../../completed/reader-image-audibility-minimal-corrections.md) owns
the exact commands and selected gate scope. All executions use normal local
PowerShell outside the managed sandbox, Node 24.20.0 and pnpm 11.15.1.

| Gate | Classification | Current result |
| --- | --- | --- |
| G0 existing exports | REUTILIZAR CON PRUEBA | 251 output files, complete membership and 203 package/config/build inputs match; installed 24,009 entries match original VUC snapshot. Configured browser/Tauri build hooks retained. |
| G1 targeted red | EJECUTAR | Six intended unit failures plus one invalid-clock fixture; two real-browser product failures, with JPEG decoder preconditions passing. |
| G2 combined desktop | EJECUTAR | G2-desktop-final: exit 0, 439/439 in eleven suites. |
| G3 selected Chromium | EJECUTAR | G3-browser-final: exit 0, 11/11 on final spec bytes, with package/renderer artifacts captured. |
| G4 TypeScript static | EJECUTAR separately | G4-format-final, G4-lint-final, G4-types-final: exit 0. |
| G5 native harness leaf | EJECUTAR | G5-harness-r2: exit 0, 50/50 after native observation correction. |
| G6 current core integrity and one native build | EJECUTAR | G6-core and G6-build: exit 0. One executable built. |
| G7 image and Piper EN six-rate native modes | EJECUTAR | G7-images-r2, G7-Piper-r2 and G7-resource-cycle-r2: exit 0; same G6 binary, full restoration verified. |
| G8 documents, evidence, independent review | EJECUTAR | G8-docs-r2: exit 0, evidence guard, whitespace and 130 relative links. Independent RIA-R1-20261101: APPROVE, no findings. Final archival checks and exact-patch assessment are recorded in the linked review reports. |
| Unchanged full matrices, Rust/Python suites, other models, DSP/listening, installer | NO APLICA | No affected responsibility; no historical runtime PASS claimed. |

## Reproductions and retained failures

- `G1-unit-red`: exit 1, seven selected failures. Two late-placement cases
  receive no availability callback, and three JPEG density/orientation cases
  reject the expected decoder dimensions. RIA-C1 observes 9,000 source frames
  after advancing the context by 0.5 s without any worklet processing. The
  direct-start unit case instead fails its uninitialized manual clock; it is
  not reproduction evidence. RIA-03 has independent real-browser reproduction.
- `G1-browser-red`: exit 1, two cases. Both endian/orientation combinations,
  rounding and inconsistent/zero-denominator fallback pass actual Chromium
  decoding first. The reader then renders the fixed unavailable placeholder
  for the density JPEG. Pending device resume reports command-to-audible 160 ms
  and playback accumulation before confirmation. Traces/screenshots are retained.
- `G2-desktop`: exit 1, 435 pass/3 fail. Two new tests omitted the manual
  clock's required initial value; the new App handoff fake omitted the existing
  stopped-service observation needed for cleanup acceptance. Corrected those
  fixtures, added the short-unit metric control, and reran the combined group.
  No green subtest is extracted from this failed aggregate as acceptance.
- `G3-browser`: exit 1, 10 pass/1 fail. The JPEG test attempted to scroll a
  placeholder while successful decoding replaced it. The retry scrolls its
  stable parent and keeps exact natural-dimension assertions. G3-browser-r2
  passes all eleven. Its later spec-format change requires a fresh final receipt.
- `G4-format`: exit 1. Prettier required a second pass for the new nested
  file-input expression. The retained before/after differs only in formatting;
  final static checks pass. No assertion or product behavior was weakened.
- `G8-docs`: evidence guard passed, then whitespace check rejected one extra
  EOF blank line in the active plan. Removed that line; `G8-docs-r2` renews the
  documentation gate only. The failed receipt is retained.
- `G7-Piper` and `G7-resource-cycle`: exit 1 after six rates and cancellation,
  at the prepared startup assertion. Its generic `application-root-not-mounted`
  code actually combines four prepared-observation predicates; the original
  receipt does not identify the false conjunct. Inspection shows it requires
  positive command-to-audible immediately after scheduler `playing`, before
  rendering is guaranteed. This is the same distinction proved by RIA-03.
  The bounded harness correction preserves the initial >=60,000-ms lead proof,
  then waits for confirmed rendering before measuring latency and checking the
  audible leaf. G5/format/lint renewed; one native retry, no new build. Both
  native modes renewed because their imported harness input changed. Original
  failure, six-rate observations and zero-new-process/scratch/full-resource
  restoration are retained; partial product results are not acceptance.

## Implementation and evidence boundaries

Availability replay uses the existing navigation-settlement callback only when
the narration source attaches; it never invokes the position-save callback.
JPEG intrinsic dimensions are separate from SOF pixel ceilings and live charges.
One bounded APP1 reader handles the required optional fields; no second decode,
network, cache, dependency or URL owner was added.

The existing backend handle exposes current confirmed rendering. Direct source
start follows successful context resume and requires clock advance; WSOLA start
and resume acknowledgements originate in processing and carry activation identity.
The existing nominal clock anchors to those acknowledgements and pause frames,
correcting the reproduced RIA-C1 delay without touching DSP or scheduler policy.
Player events, progress and coordinator metrics use this authority. Exact ended
delivery still owns completion; short units publish start before end. Recovery
and the existing persistence bridge retain the prior checkpoint before new start.

No historical behavioral result establishes acceptance. Reused preparation is
hash/membership-checked input reuse; all changed behavior has current tests.
Current G2/G5 receipts remain valid through changes only to browser formatting
and documentation, which those selected tests do not import. Final installed,
artifact and source comparisons remain required before independent acceptance.

Canonical system diagram reviewed: existing component/process/data-flow and
persistence boundaries remain accurate. No M005 narration preparation change.
Physical speaker latency and general hardware performance remain unmeasured.

## Final host results and bounded reuse

Exact commands for G2 and G3 are the unchanged combined selectors in the ExecPlan.
The remaining final commands and outcomes are:

| Receipt | Command | Result |
| --- | --- | --- |
| G4-format-final | `pnpm.cmd format:check:typescript` | exit 0 |
| G4-lint-final | `pnpm.cmd lint:typescript` | exit 0 |
| G4-types-final | `pnpm.cmd --filter @voxleaf/desktop typecheck` | exit 0 |
| G5-harness-r2 | `node --test apps/desktop/scripts/native-smoke.node-test.mjs` | exit 0, 50 tests |
| G6-core | `pnpm.cmd package:piper-core:check` | exit 0, current existing payload |
| G6-build | `pnpm.cmd build:desktop` | exit 0, one current executable |
| G7-images-r2 | `node apps/desktop/scripts/native-startup-smoke.mjs` | exit 0 |
| G7-Piper-r2 | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en --exercise-playback-speeds` | exit 0 |

Executable SHA-256:
`291928f82722baf7b3579e373791934d52f38dc727723190995f13e43707b2cb`.
Both native cycles retain the same binary. R2 verifies all six speed values,
same-boundary pause/resume, identity-safe seeks, visible highlighting, prepared
startup and cancellation. Its quick observation lasts 60,303 ms with zero
underruns; command-to-render is 5,968 ms quick and 6,750 ms prepared. These are
single-host observations, not physical-speaker timing, speedup claims or a new
model-performance baseline. Startup cancellation is not exercised by this mode;
the required ordinary active cancellation passes at 719 ms.

The native result records zero retained/discarded units, zero generated-audio
files, six created/six closed contexts and zero external requests. Full original
resource membership/hashes match after `finally`, the task backup is absent,
and PID/creation-time/executable plus scratch-root comparisons show no new
processes or roots. Pre-existing scratch is preserved. Original failed-cycle
restoration evidence remains separate from R2.

A final review of rejection coverage added assertions for a *current* rejected
resume alongside obsolete rejection in the existing two-backend unit case.
G2 and static checks were renewed. G3, G5, G6 and G7 do not consume that unit-test
body; their production/fixture/runner/artifact inputs remain unchanged.

`Environment-after` preserves a strict-comparison exit 1: Chromium appended to
its pre-existing `chromium_headless_shell-1248/.../debug.log`. The separate
`installed-equivalence.json` verifies all 24,008 consumed/other entries and all
roots, tool versions, environment and cache exclusions identical; the only
changed entry is that generated diagnostic output, not an executable, dependency,
configuration or test input. Both captures and the failure remain immutable.
No library, browser, tool, model or package installation/update occurred.

`Evidence-comparison` verifies every final receipt's original input-manifest
digest and lists every broad-snapshot change. G3 does not import unit tests or
native scripts; G5 does not import the PCM unit suite; native build/core and
native modes do not consume unit-test source. Documentation and local capture
wrappers are outside those behavior graphs. Native tools, complete WebView
membership and browser/native renderer plus package artifacts still match.
The strict installed-output difference above is explicit, not hidden by a
renewed old identity. Independent RIA-R1-20261101 accepts implementation and
evidence without findings or missing acceptance evidence. It independently
attributed the later active-index documentation delta omitted from the comparison
summary; that path is included in the review manifest and outside consumed test
graphs. The completed-plan move and maintained-index changes are likewise
documentation-only; original runtime receipts and their inputs remain immutable.

The [review reports](review-reports.md) retain implementation approval and the
separate exact-patch archival assessment, including manifest identities and
final documentation checks. Report files remain outside their own manifests.
