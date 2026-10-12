# Validation Report

Report ID: APPS-PUBLICATION-02-POST-01. Mode: POST-CHANGE. Verdict: **PASS**.
Environment: local PowerShell outside sandbox; PowerShell 7.6.5, Node 24.20.0,
pnpm 11.15.1. Starting/ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.

| Closed path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/reader/reader-lifecycle.ts` | ` D apps/desktop/src/reader/reader-lifecycle.ts` | `DELETED` | `DELETED` |
| `apps/desktop/src/reader/reader-lifecycle.test.ts` | ` D apps/desktop/src/reader/reader-lifecycle.test.ts` | `DELETED` | `DELETED` |
| `apps/desktop/src/publication/reader-lifecycle.ts` | `?? apps/desktop/src/publication/reader-lifecycle.ts` | `D1E2BF072E4513303754EBEC3E83610AC397B39E598184A2E315484B645E2CE6` | `d3a46fd7b51c13e8b849dc1edb3ec3aa5c90f6cf` |
| `apps/desktop/src/publication/reader-lifecycle.test.ts` | `?? apps/desktop/src/publication/reader-lifecycle.test.ts` | `6E6B479FDE73D1E09D1C31A315F908DD2695DE004F22776B3F0DB203AFDC5B60` | `618eaef88cf2365f2f9b0530678d5673074cd379` |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `0ED155C4C60CA6DA33BF34E0385B555D9680ECA9B84AA63F2156E101BF4843D8` | `7f2c9aa65c5fed437ccc91967cca88a7f673228e` |
| `apps/desktop/src/AppPresentation.tsx` | ` M apps/desktop/src/AppPresentation.tsx` | `FACE9BCA664C89A75E4C8F48469F7F85EE43850759FAC0E79ABF00DDF93C550A` | `22114706304be032204167406d718f345d790cdc` |
| `apps/desktop/src/ReadyPublicationSection.tsx` | ` M apps/desktop/src/ReadyPublicationSection.tsx` | `65CE125FA765B1F8FF8796BF91D87F3B91291A27572BDD71C0B7194B22D28922` | `1a674ef9461f54c9c5cff74a6226a49b8d0eef20` |

Identity recheck PASS: before/after identical, index empty; all six native
identities equal POST-04. Raw manifests/logs ignored under this Report ID.

Fresh commands, 2026-10-12 20:46:22–20:49:40 UTC, all exit 0:

1. `pnpm.cmd build:packages`.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`.
3. `pnpm.cmd --filter @voxleaf/desktop test`: 57 files/661 Vitest, 70 Node.
4. `pnpm.cmd format:check:typescript`.
5. `pnpm.cmd lint:typescript`.
6. `pnpm.cmd test:browser`: seven Playwright checks.
7. `pnpm.cmd test:native-startup`: lifecycle/protocol/cancellation, ingress,
   accessibility, synchronization, images, restoration and replacement cleanup.
8. `git diff --check`.
9. Independent reverse-import proof: all five files reproduce baseline SHA-256
   by reversing only approved import substitutions; no obsolete source imports.

Scope/invariants/test integrity/privacy PASS. Seven paths, 1,082 relocation
lines and ten import-edit lines within 1,150/12. Complete source/test pair
moved; old paths absent and test discovered once. All bodies/fixtures/assertions,
states, ownership, stale results, close coalescing, containment and cleanup are
byte-preserved beyond imports. Native accepted files and outside work unchanged.
No external requests, prohibited artifacts or Git mutations.

Action: none for unit acceptance. Model-backed/performance acceptance remains
a separate final combined gate, not implied by this relocation report.
