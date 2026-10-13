# Publication audit, baseline and approved order

Fresh auditor: CHANGE, low risk. Cohesive publication lifecycle (248 source/
290 test lines) has no reader DOM ownership; relocation groups it with its
existing local-publication-open collaborator. Exactly three App consumers.
No behavior defect or new abstraction is proposed.

## Baseline Validation Report

Report ID: APPS-PUBLICATION-02-BASELINE-01. Mode: BASELINE. Verdict: **PASS**.
Environment: local PowerShell outside sandbox; 7.6.5 / Node 24.20.0 / pnpm 11.15.1.
Starting/ending HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`. Index empty.
Exact porcelain output empty for every allowlisted path; two destinations absent.

| Closed path | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| `apps/desktop/src/reader/reader-lifecycle.ts` | `26997B963FE15F719CB3D5F5CD5BB9A7C322FEDB1CCBEBCAE88D26969BD3BCC8` | `bfadd932aa1dd6ff43e5b3143fcf7ca40a9fcf9f` |
| `apps/desktop/src/reader/reader-lifecycle.test.ts` | `B6A6CAE73B111CF3CC58857F6FDF9E22B13DC5E9EFBD9791946CEF62D5251F79` | `f276c6539b33d06fcc94206848fb74a2aa6d3f97` |
| `apps/desktop/src/publication/reader-lifecycle.ts` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/publication/reader-lifecycle.test.ts` | `ABSENT` | `ABSENT` |
| `apps/desktop/src/App.tsx` | `1B582393DDDEB16727E4A89D3034AD618C94C5A08B1E9E428FE4D32B8F04718C` | `741379a609a80b6ce47570a6c59b62e3e9073f32` |
| `apps/desktop/src/AppPresentation.tsx` | `9F51DF7F5DF75CA7D6FB308A960EAA2AE4D04B64E33711DDF29408FB289AB90D` | `9cb08635cb07375caa068533a784f0a21f638034` |
| `apps/desktop/src/ReadyPublicationSection.tsx` | `5CBD1D20A8BD30FBEC20511351AD5AB8EEEBF8C08EFB22D6F48EB54247A75776` | `f83466e5e89171209e750a58cdb979dab06f9aca` |

Identity recheck PASS; all seven paths unchanged and six accepted native
identities equal POST-04 before/after. Raw manifests remain ignored under this
Report ID. Scope, baseline invariants, test integrity and privacy PASS.

Fresh commands, 2026-10-12 20:40:26–20:42:24 UTC, all exit 0:

1. `pnpm.cmd build:packages`.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`.
3. `pnpm.cmd --filter @voxleaf/desktop test`: 57 files/661 Vitest, 70 Node.
4. `pnpm.cmd format:check:typescript`.
5. `pnpm.cmd lint:typescript`.
6. `pnpm.cmd test:browser`: seven Playwright checks.
7. `pnpm.cmd test:native-startup`: lifecycle, ingress, accessibility,
   synchronization, images, restoration and replacement cleanup.
8. `git diff --check`.

## APPROVED WORK ORDER

Order ID: APPS-PUBLICATION-02-ORDER-01. Target: APPS-PUBLICATION-02.
Baseline evidence above: PASS. Risk low; exact seven-path allowlist above.
One reused clean_code_worker, no concurrent source writer.

Move both complete lifecycle files from reader to publication. In both moved
files replace `../publication/local-publication-open` with
`./local-publication-open`. In App, AppPresentation and ReadyPublicationSection
replace `./reader/reader-lifecycle` with `./publication/reader-lifecycle`.
Five import replacements only; preserve every other byte/body, symbol, fixture,
assertion and lifecycle rule. Old files absent, new files discovered once.

Ceiling: 1,150 total added-plus-removed lines including relocation, at most
12 import-edit lines. Preserve all six immutable states, single owner,
sequence/stale-result/close-coalescing rules, clearing, renderer failure
containment, cancellation, privacy, locators, synchronization and resource
cleanup. No facade, barrel, dependency, new test, other source or formatting.
Preserve accepted native and documentation work outside scope.

Worker runs no tests or mutations beyond exact allowed edits; returns Change
Packet then idle. Independent post-change acceptance repeats the seven commands
above, rename-aware body/import proof, identities and accepted-native guard.
No staging, commits, push, PR or branch/base changes.
