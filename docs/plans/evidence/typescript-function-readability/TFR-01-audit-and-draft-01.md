# TFR-01 audit and draft terms

Record ID: TFR-01-AUDIT-DRAFT-20261019-01

This is the director's accepted audit and draft baseline order, not an approved
implementation order. Source edits require an independent passing baseline.
Starting HEAD: `2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`.
Branch: `codex/typescript-function-readability`.

## Audit Packet

- Target ID: TFR-01 / TFR-BATCH.
- Decision: CHANGE. Risk: high (protocol and process lifecycle).
- Auditor: configured `clean_code_auditor`, GPT-6.1 Sol high, read-only.
- Primary target: `apps/desktop/src/tts/process-client.ts`, methods `start`,
  `prepare`, `health`, `cancel`, and `shutdown`.
- Related context: `process-client.test.ts`, canonical
  `TtsProtocolControlV1` decoding/freezing, `service-lifecycle-probe.ts`, and
  coordinator containment callers.
- Concrete evidence: five copies of `controls.some` test property presence
  and strict service-identity inequality. Startup compares against the accepted
  handshake; the other operations compare against the client's identity.
  This is duplicated admission logic, not evidence of an existing runtime bug.
- Allowed files (closed): `apps/desktop/src/tts/process-client.ts` and
  `apps/desktop/src/tts/process-client.test.ts`.
- Proposed edits: one module-private pure `hasForeignServiceInstance` accepting
  `readonly TtsProtocolControlV1[]` and `expectedServiceInstanceId: string |
  undefined`; replace exactly five predicates at their current expression
  positions; add only the concrete public-boundary coverage below.
- Forbidden edits: public contracts/exports, dependencies, native commands,
  lifecycle restructuring, error/effect/await ordering, retry/containment rules,
  audio/synthesis/sink logic, scope comparison, cancellation fallback, unrelated
  formatting, generated files, frozen authority, historical evidence or plans.
- Diff ceiling: two files, 180 added plus removed lines combined.
- Documentation impact: execution evidence/plan only; no product/architecture
  change and no diagram amendment expected.
- Decision required: none; missing baseline or host prerequisites blocks edits.

## Behavior invariants and coverage map

| Invariant | Existing assertion coverage | Approved gap decision |
| --- | --- | --- |
| Decode, length, kind, order and state checks remain operation-specific | Exact lifecycle success; reordered startup; malformed shutdown fallback | Keep all checks in place, including health's explicit first-state identity check. No exhaustive unrelated negative matrix. |
| Foreign service responses reject with `tts-service-invalid-response` before state commit | Startup foreign capability; shutdown fallback foreign terminal state | Add foreign capability prepare/health tests with unchanged unloaded/ready observation respectively. Add stopped/no identity observation to existing startup rejection if within ceiling. |
| Ordinary cancellation invalidates before await and refuses restart on unconfirmed containment | Valid cancellation and late-byte zeroing; fallback shutdown pending/rejected/malformed/mismatched | Add foreign `cancelled` acknowledgement with valid scope and surrounding states; assert cancelling/original identity, no active work/audio, restart refusal without invoke, no automatic shutdown, late synthesis rejected and bytes zeroed. Settle the deferred request. |
| Completion/cancel race retains original error and allows restart only after validated shutdown | `contains completed native work before restart and discards late audio`; failure table | Preserve unchanged. |
| Other cancel errors/invalid scopes do not trigger fallback | Timeout/unavailable/invalid-scope cases | Preserve unchanged. |
| One active/no queued synthesis; one retained unit; binary, finite, size and zeroing rules | Busy/buffered cases; invalid binary table; lifecycle/shutdown release | No new tests for untouched logic. |
| Content-free errors, availability, exact profile/language arguments, malformed narration | Existing configuration, safe-error and invalid-input tests | Preserve unchanged. |
| Packaged lifecycle and model synchronization/cancellation | Native lifecycle probe and filtered portfolio | Mandatory current G-NATIVE/G-HOST evidence; static inspection is not PASS. |

## Draft work-order terms and baseline gate ledger

The operation above, closed allowlist, invariants, coverage decisions and ceiling
are the draft terms. All five plan scopes are disjoint; TFR-03's proposed files
are absent. The integration batch is TFR-BATCH. No source/test/versioned-output
overlap is approved. Carry the director's active-plan progress edit separately.
No staging, commit, push or PR is authorized.

All commands run at repository root in local PowerShell outside the sandbox,
with verified repository-compatible tool versions. The validator approves the
ledger and exact bounded ignored outputs before execution. Capture source,
discovery, transitive dependency, lock/config/tool, artifact and environment
identities at execution time, not retrospectively.

1. G-FAST, baseline/worker/post: `pnpm.cmd format:check:typescript`;
   `pnpm.cmd lint:typescript`.
2. G-BUILD, after fast checks and before dependent gates:
   `pnpm.cmd build:packages`. Capture shared/EPUB output identities.
3. G-DESKTOP, baseline/worker/post:
   `pnpm.cmd --filter @voxleaf/desktop typecheck`;
   `pnpm.cmd --filter @voxleaf/desktop test`.
4. G-HOST readiness, before native preparation:
   `pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight`;
   `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es --preflight-only`;
   `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en --preflight-only`;
   `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4 --preflight-only`.
5. G-NATIVE, baseline/post before unit acceptance:
   `pnpm.cmd test:native-startup`. Record native preparation separately from
   execution and bind executable/frontend bytes plus Windows/WebView2/driver.
6. G-HOST, sequential baseline/post before unit acceptance:
   `node apps/desktop/scripts/bilingual-portfolio-host.mjs --lifecycle-only`;
   `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`;
   `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`;
   `node apps/desktop/scripts/bilingual-portfolio-host.mjs --profile=chatterbox-multilingual-v3-cuda-bf16-default-v4`.
   Chatterbox covers both languages; Qwen inference remains deferred.

A shared pre-edit baseline may additionally run G-EPUB
(`pnpm.cmd --filter @voxleaf/epub typecheck` and
`pnpm.cmd --filter @voxleaf/epub test`) and G-BROWSER
(`pnpm.cmd test:browser`) across all five declared closed scopes before the first
edit. Each later unit still requires its focused baseline. Reuse only by the
validator with complete immutable input/artifact/environment proof.

Pending combined gates: G-BROWSER, G-CROSS (`pnpm.cmd typecheck:typescript`,
`pnpm.cmd test:typescript`), G-FINAL (`pnpm.cmd check:portable`,
`pnpm.cmd check`), and G-DOCS (`pnpm.cmd check:evidence`, `git diff --check`,
manual current link/status/command review after documentary freeze). Expand
aggregate graphs; deduplicate only proven identical leaves, reporting actual
commands. Unit PASS cannot substitute for batch/final acceptance.

Consumed source, tests, harness, discovery membership, tools, build bytes or
relevant host/environment changes invalidate affected receipts. Capture HEAD,
porcelain status, SHA-256 and filter-aware blob for both allowed files before
and after commands; baseline requires clean unit paths and empty index. No
writer or Git mutation may run during validation. Retain immutable reports in
this directory and raw receipts under ignored
`tmp/evidence/typescript-function-readability/`.

Use configured builders only, no tracked generated changes. Declare package
`dist`/`tsbuildinfo`, desktop `dist`, Rust `target`, test results, native
disposable profiles and evidence outputs before launching. Preserve unrelated
host resources; journal owned PID/creation/executable and firewall state before
mutation and verify cleanup after every outcome. The existing portfolio timeout
is 30 minutes per arm and cleanup timeout 15 seconds. Record progress/diagnostic
checkpoints; never duplicate RUNNING work. One infrastructure retry per failed
stage requires a specific hypothesis and changed condition; two source
correction loops maximum. Unresolved mandatory gates block acceptance.
