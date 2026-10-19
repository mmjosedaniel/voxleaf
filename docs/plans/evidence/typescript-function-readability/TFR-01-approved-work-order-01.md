# APPROVED WORK ORDER

Order ID: TFR-01-WO-20261019-01.
Target ID: TFR-01 / TFR-BATCH. Risk: high.
Goal: name and centralize the five identical foreign-service identity checks
without changing operation-specific validation, state or containment behavior.

Allowed files (closed):

- `apps/desktop/src/tts/process-client.ts`
- `apps/desktop/src/tts/process-client.test.ts`

Required edits:

1. Introduce module-private pure `hasForeignServiceInstance`, accepting
   `readonly TtsProtocolControlV1[]` and `expectedServiceInstanceId: string | undefined`.
   Preserve the exact property-presence/strict-inequality predicate. Replace
   exactly five existing checks at their current expression positions in
   start, prepare, health, cancel and shutdown.
2. Add only the public-boundary characterization approved below. Preserve all
   existing assertions. No exported test API or private-helper suite.

Behavior invariants: unchanged operation-specific decode/kind/order/state checks;
startup compares against accepted handshake and others against client identity;
foreign response rejects before state commit with existing error; health retains
its explicit first-state identity check. Cancellation invalidates before await,
refuses restart without validated containment, preserves fallback rules and
zeroes late audio. Preserve every await, short circuit, error, scope comparison,
state write, resource/privacy bound and availability/profile/language behavior.

Coverage map: the full accepted map in `TFR-01-audit-and-draft-01.md` is part
of this order. Add foreign capability responses for prepare and health and
assert unchanged unloaded/ready observations. Add foreign cancelled acknowledgement
with otherwise valid scope/states; assert cancelling/original identity, no active
work/audio, refused restart without native invocation, no automatic shutdown,
late synthesis rejection and zeroed bytes; settle the deferred request. Extend
existing foreign-start case with stopped/no-identity observation if within ceiling.
Retain completion/cancel race, fallback failure, binary/busy/bounds and all other
assertions. No unrelated negative matrix.

Forbidden changes: public exports/contracts/dependencies, lifecycle restructuring,
native commands, retry/containment policy, audio/synthesis/sink logic, error/effect/
await order, generated/frozen/historical files, unrelated formatting or Git mutation.
Diff ceiling: two files, 180 added plus removed lines combined. Stop before excess.

Baseline evidence: TFR-BATCH-BASELINE-20261019-03, PASS, immutable report
`TFR-BATCH-BASELINE-20261019-03.md`, SHA-256
`BDAE7C6EAE73C3F646A370C33CB16DB15CB2854C29B9FCDC895AAAA2E28E38D2`.
Branch `codex/typescript-function-readability`, HEAD
`2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`, empty index.

| Path | Baseline status | SHA-256 | Blob |
| --- | --- | --- | --- |
| `apps/desktop/src/tts/process-client.ts` | clean | `0C15B34E2035AAAFA6816C070D6BE36042C2D577373AD4986FD6D8F8380CC493` | `8918e5e0ba238b814c1bdd254ed1af2947f3614e` |
| `apps/desktop/src/tts/process-client.test.ts` | clean | `E9C78E4038BECBE99706E8C7B42F919984C7D61474E2C2F43F4A19EA109E02D2` | `b1676bfc32aa80eb372bbe6d6b08805bffbc0fc9` |

Worker validation, in order from repository root, normal local PowerShell outside
sandbox: `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`;
`pnpm.cmd build:packages`; `pnpm.cmd --filter @voxleaf/desktop typecheck`;
`pnpm.cmd --filter @voxleaf/desktop test`; `git diff --check`.
Use Node 24.18.0 at the installed nvm path and the explicit Corepack shim
`C:/nvm4w/nodejs/node_modules/corepack/shims/pnpm.cmd` (11.15.1), with
`COREPACK_ENABLE_NETWORK=0`. Do not change global tool selection.
Capture full source/discovery/transitive/config/lock/tool/environment identities
before commands, durations, results and after identities under unique ignored
`tmp/evidence/typescript-function-readability/TFR-01-worker-01/`. Inspect existing
baseline capture patterns; do not invent a recurring orchestration framework.
Stop on failed checks and report, preserving receipts; validator decides reuse.

Regeneration: only existing `build:packages`; ignored shared/EPUB dist and
tsbuildinfo outputs plus existing test caches/results and unique receipts.
No versioned generated deliverables, package/runtime rebuild or model execution
assigned to worker. No edits outside the two source/test paths.

Acceptance commands: worker checks above plus configured portfolio preflight,
three filtered preflight commands, `pnpm.cmd test:native-startup`, and sequential
`node apps/desktop/scripts/bilingual-portfolio-host.mjs` with respectively:
`--lifecycle-only`;
`--profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`;
`--profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`;
`--profile=chatterbox-multilingual-v3-cuda-bf16-default-v4`.
Configured readiness command:
`pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight`.
Filtered readiness adds `--preflight-only` to the three profile commands above.

Gate ledger: G-FAST/G-BUILD/G-DESKTOP before expensive preparation; G-NATIVE
builds current executable before G-HOST. Native/model runs require verified
ordinary WMI PowerShell to avoid inherited MSIX path redirection. Full identities,
current executable/frontend, exact packages/models, host/load/driver and isolation
conditions bind receipts. Consumed input/environment drift invalidates affected
gates. Only validator may reuse complete unchanged evidence. Browser and PiperES
infrastructure retries are already consumed in this batch; no reset by renaming.
Preserve original timeouts, diagnostics, process identity and per-run cleanup.

Batch acceptance: shared pre-edit baseline03; TFR-03/04 independently accepted
SKIP. Later focused baselines and unit gates remain required; combined browser,
cross-TypeScript, portable/native final leaves and documentary gates remain
pending. The exact task-owned Chatterbox firewall rule remains journaled for
bounded campaign use, with final removal/preservation verification required.

Completion output: Change Packet only, retrievable immutable receipt references.
No staging, commit, push or PR. You are not alone: preserve director documentary
changes and other accepted work; stop on overlap. Do not delegate or start another
writer. Independent validator is idle throughout implementation.
