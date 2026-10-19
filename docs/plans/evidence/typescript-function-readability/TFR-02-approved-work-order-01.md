# APPROVED WORK ORDER

Order ID: TFR-02-WO-20261019-01. Target: TFR-02 / TFR-BATCH. Risk: high.

Goal: reuse the existing admission predicate in explicit profile selection while
preserving identity, state and persistence behavior.

Closed allowlist:

- `apps/desktop/src/tts/hardware-profile-compatibility.ts`
- `apps/desktop/src/tts/hardware-profile-compatibility.test.ts`

Replace only the repeated predicate following `profile.profileId === profileId`
in `selectProfile` with `admittedForLanguage(profile, this.#snapshot.language)`.
Do not change the existing helper. Tests remain unchanged. The complete coverage
map and pure-record evaluation-order analysis in `TFR-02-audit-01.md` apply.
No new behavior or concrete coverage gap requires another test.

Preserve the closed guard, exact requested identity first, language and supported/
development admission, persistence permission, one write of the requested ID,
the await, post-await closed/saved guards, snapshot fields and publication. Keep
recommendation/replacement, probing, future-version protection, native admission,
caller cleanup, privacy, local inference and resource bounds unchanged.

Forbidden: helper body or callers, registry/matcher/contracts/dependencies,
admission thresholds, persistence semantics, public test APIs, changed guard/
write/await/publication order, generated/frozen/historical files, unrelated
formatting or any Git mutation. Ceiling: two files, 60 added plus removed lines;
expected actual change is production only.

Independent baseline: TFR-02-BASELINE-20261019-01, PASS; immutable report SHA256
`C569686833E2538AAAA9ED5BF2CAF40C5294191A38EEB2995586E774F6C5B234`.
Shared pre-edit baseline: TFR-BATCH-BASELINE-20261019-03. Branch
`codex/typescript-function-readability`; HEAD
`2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`; empty index.

| Clean target | SHA256 | Blob |
| --- | --- | --- |
| `apps/desktop/src/tts/hardware-profile-compatibility.ts` | `005FE43F0D347524C4B97D1C8FA3D21EB6E742115160F0E77D4316637233E5A9` | `7caf34d725f9bbfe2f0a2fe0a12d198e10f3af6c` |
| `apps/desktop/src/tts/hardware-profile-compatibility.test.ts` | `7360D94C4526A9B5B76EFC0E9BF5C8ADB2E26316453A405F880B1531B8887BA8` | `774f4bb3144be1940393786e458da7f16b56ba60` |

Carry accepted, unstaged TFR-01 explicitly: report TFR-01-POST-20261019-01,
SHA256 `9AAE0BB230282FB16E430CDAAB8CD0C41CC0A71080BD1826EBC4330AF3FCD8C9`.
Preserve process-client.ts SHA256
`4E7C07870321BEC73994F1A494E77DEEF1A12DC0D7195759E620AB4BA00F6D9D`
and its test SHA256
`E0B65F08C683B0F3595743986BA2D414B8A170AF64608C3F7EEFA7F6AB4D2CB8`.
Director documentation/evidence is outside implementation scope. Stop on overlap.

Worker checks, ordered from repository root in normal local PowerShell outside
sandbox: `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`;
`pnpm.cmd build:packages`; `pnpm.cmd --filter @voxleaf/desktop typecheck`;
`pnpm.cmd --filter @voxleaf/desktop test`; `git diff --check`.
Use Node 24.18.0 and explicit Corepack shim
`C:/nvm4w/nodejs/node_modules/corepack/shims/pnpm.cmd` (11.15.1), with
`COREPACK_ENABLE_NETWORK=0`. Preserve global tool selection.
Capture complete source/discovery/transitive/config/lock/tool/environment and
artifact identities before and after commands, durations and outputs in unique
ignored `tmp/evidence/typescript-function-readability/TFR-02-worker-01/`.
Reuse existing capture patterns, including efficient equivalent byte hashing;
do not build a recurring framework. Stop on failed checks; preserve receipts.

Regeneration: existing `build:packages` only, ignored shared/EPUB dist,
tsbuildinfo, existing caches/results and unique receipts. No package/runtime
rebuild, model run or other source edit is assigned to worker.

Post-change acceptance covers the same fast gates, configured portfolio preflight,
three filtered preflights, `pnpm.cmd test:native-startup`, then sequential
`node apps/desktop/scripts/bilingual-portfolio-host.mjs` with:
`--lifecycle-only`;
`--profile=piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1 --language=es`;
`--profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --language=en`;
`--profile=chatterbox-multilingual-v3-cuda-bf16-default-v4`.
Configured preflight is
`pnpm.cmd --filter @voxleaf/desktop test:tts:bilingual-portfolio-exact-host:preflight`;
filtered readiness adds `--preflight-only` to each profile command.

Gate ledger: fast checks precede expensive preparation; current native executable
precedes host gates. Native/model checks use verified ordinary WMI PowerShell,
with exact source/frontend/packages/models, tool/driver/load/isolation proof.
Check at least 8192 MiB available RAM before model execution, per the documented
host-memory replan; do not lower product thresholds or close unrelated work.
Only validator may reuse an individual immutable gate with complete equivalence.
Browser/PiperES infrastructure retries and the changed-memory recovery are
consumed; do not reset budgets or retry blindly. Retain timeouts, failures and
per-run cleanup evidence. Qwen model deferral remains unchanged.

TFR-03/04 are independently accepted SKIPs. Later clean TFR-05 baseline and
post-change gates, combined browser/cross-TypeScript/portable/native final leaves,
documentation and final owned-firewall removal remain pending. Unit PASS cannot
replace final acceptance.

Return a frozen Change Packet and immutable receipts. You are not alone in the
repository; preserve all other work. Do not delegate. Exactly one implementation
writer; validator remains idle until handoff. No staging, commits, push or PR.
