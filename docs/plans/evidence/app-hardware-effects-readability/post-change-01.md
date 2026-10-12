# Validation Report

Report ID: APP-HARDWARE-READABILITY-01-POST-CHANGE-01.
Target ID: APP-HARDWARE-READABILITY-01.
Mode: POST-CHANGE (includes both final aggregate gates).
Verdict: **PASS**.
Validator: refactor_validator, GPT-6 Astra high, independent from the Sol worker.
Environment: local PowerShell outside sandbox, repository root, Node v24.20.0,
Corepack-selected pnpm 11.15.1. Every acceptance command used host escalation.
The existing Microsoft-signed EdgeDriver 155.0.4283.45 was selected with the
process-local `VOXLEAF_EDGE_DRIVER_PATH` override, matching WebView2 155.0.4283.45.

Starting HEAD SHA: `609ae1b290e1070586a9142cd0063fffd2476910`.
Ending HEAD SHA: `609ae1b290e1070586a9142cd0063fffd2476910`.

## Validated paths and identities

| Validated path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `3FD5D7A9D155F91112009BD971E731F73AB5E0949030AA464C8A74C7DD2A373D` | `eb5d6f3c31d4dd9a923d96402813c3405b8645c0` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `8F20A81599D84D987517E5FF44DE42A0EB1608C466FD3EDDF4D877D524F962FB` | `11ae4fdbb9f454f1b9d2e248f430a0c9f40ae585` |
| `apps/desktop/src/tts/hardware-compatibility-check-binding.ts` | `?? apps/desktop/src/tts/hardware-compatibility-check-binding.ts` | `46246A1F27957D08246ADD5B9E3044009DD75767D9826A7BC6DBB8588382EC8A` | `4ba5be927451d7466d71cd5d74918ae916c35c8f` |
| `apps/desktop/src/tts/hardware-compatibility-check-binding.test.ts` | `?? apps/desktop/src/tts/hardware-compatibility-check-binding.test.ts` | `A2B59CE68318FD2AD01917244B4AC70E5EED93400D604FDE203B217BF26C9FD0` | `b7e2950174f25300a454be0865cd6476c60ca116` |

Identity recheck: **PASS**. All before/after HEAD, per-path identities and
porcelain scope match. Index remained empty. Worker, director and Git writers
were idle throughout validation. Raw manifests and all logs are ignored under
`tmp/evidence/app-hardware-effects-readability/APP-HARDWARE-READABILITY-01-POST-CHANGE-01/`.

## Commands and outcomes

| Exact command | Exit | Outcome |
| --- | --- | --- |
| `pnpm.cmd run build:packages` | 0 | Shared and EPUB builds pass |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | 0 | Desktop TypeScript passes |
| `pnpm.cmd --filter @voxleaf/desktop test` | 0 | 55 Vitest files / 602 tests, plus 51 Node tests pass |
| `pnpm.cmd run format:check:typescript` | 0 | Prettier passes |
| `pnpm.cmd run lint:typescript` | 0 | ESLint passes |
| `pnpm.cmd test:browser` | 0 | Chromium 7/7 passes |
| `pnpm.cmd test:native-startup` | 0 | Release build and packaged WebView2 matrix pass; zero errors/external requests |
| `pnpm.cmd check:portable` | 0 | Evidence guard/tests, TypeScript/Python formatting/lint/types/tests and portable builds pass |
| `pnpm.cmd check` | 0 | Complete configured evidence, format/lint/types/tests and native/Python builds pass |

Aggregate evidence includes shared 20 files / 209 tests, EPUB 33 / 651,
desktop 55 / 602 plus 51 Node, Python 485, and native Rust 87 default / 88
release-locked tests. Native startup retains the existing model-free protocol,
file-boundary, reader, synchronization, image, restart/persistence and cleanup
matrix. These checks are not model-backed inference or performance benchmarks.

## Independent reviews

Diff scope: **PASS**, exact four-file source unit, 320 additions/deletions
including new files, within 350. Director-owned plan/receipts are separate
coordination documentation. No source drift or unrelated source changes.

Invariant review: **PASS**. Setup remains non-awaited ensure-check, visibility
read, then registration; receivers remain bound; flag is local and consumed
before check; disconnect is synchronous. App keeps coordinator ownership and
effect ordering/dependency. Preference readonly shapes/defaults and derived
boolean truth values are equivalent. Existing privacy, cancellation, bounded
resources, persistence, locator, inference and audio policies remain unchanged.

Test-integrity review: **PASS**. All old assertions retained; five new cases
cover pending initialization/order, receiver contexts, repeated/reentrant
events, initial hidden state and independent flags, synchronous removal,
actual-document StrictMode effective subscription, descriptor restoration and
unmount. No fragile total initialization-count requirement.

Privacy/artifact review: **PASS**. No prohibited data, generated source edits,
dependencies, runner changes or tracked raw captures. Non-failing warnings:
existing Vite bundle size, browser color environment, and pytest cache write
permission warning; all 485 Python tests passed.

Action required: none. No correction loops. This receipt is immutable and
binds only the listed source identities; later source edits require new
validation. It does not authorize staging, commit, push or publication.

Untested limits: no model-backed inference/performance, installer lifecycle,
real OS suspend/resume or new CI result is claimed. This binding observes
document visibility, not a native OS subscription. Late hydration stays deferred.
