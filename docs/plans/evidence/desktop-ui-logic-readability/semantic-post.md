# Semantic comparison independent acceptance

Report ID: `SRC-SEMANTIC-COMPARISON-03-POST-CHANGE-20261013-01`.
Target `SRC-SEMANTIC-COMPARISON-03`, POST-CHANGE, PASS. Starting/ending HEAD:
`5be831c23135ca00f94b2b3374f0330de2b658ce`. Local PowerShell outside sandbox
(`require_escalated`), existing process-local Corepack/pnpm 11.15.1.

The eight exact commands in [the frozen order](semantic-order.md) all exited 0:
package build, desktop types, desktop tests (723 Vitest / 70 Node), TypeScript
format/lint, Vite build, seven browser cases and six benchmark cases (45.2 s).
`git diff --check` and empty-index checks passed before/after. No source writing
occurred during acceptance. HEAD and full path identities matched after checks.

| Closed validated path under `apps/desktop/src/reader/` | Porcelain prefix | SHA-256 | Filtered blob |
| --- | --- | --- | --- |
| `SemanticDocument.tsx` | ` M` | `38D475E1FCED233D0ED32A491DD7B2845F3232D83A490DAA52694300F19D1FF1` | `45f2f0639eb060270bfae00b9d64404a89d25cd6` |
| `SemanticDocument.test.tsx` | ` M` | `85865E6A5EB9A9F50501279BBF3B8FA22D82FB5E5769D756F829BA03A8BA5A52` | `2e5ed39f157ef8fb5227e8a2afae24ddfa4eb473` |

Exact porcelain is prefix, one space, full path. Scope, invariants, test
integrity and privacy/artifact review PASS. Director accepted without Git
mutation. Diff 225/400 lines: production +8/-30, tests +186/-1.

Worker first ran `pnpm.cmd --filter @voxleaf/desktop test` outside the sandbox
after adding characterization but before the production edit: 723 Vitest and
70 Node passed while production retained baseline SHA-256
`9FB1BAD6818DB66007A63785C4320332F4042982DBDCC8EF506127599377EAD6`.
Then one unchanged body replaced the duplicate with a private props union and
two direct memo uses. No correction loop was needed.

| Production 10,000-block observation | Baseline | Post-change |
| --- | --- | --- |
| First content | 150.1 ms | 159.8 ms |
| Maximum scheduler callback | 7.9 ms | 8.4 ms |
| Maximum batch script | 7.7 ms | 8.4 ms |
| Target ready | 670.8 ms | 697 ms |
| Append | 717.7 ms | 741 ms |
| Reflow | 105.5 ms | 109.3 ms |
| Full-app DOM delta | 50,116 | 50,116 |
| Full-app working-set delta | 165,625,856 bytes | 164,356,096 bytes |

All existing thresholds passed; no performance improvement is claimed. Six
lifecycle cycles passed, closed growth was zero DOM nodes, 1,084,740 heap bytes
and 5,935,104 working-set bytes. Final observer/object-URL ownership was zero
and storage bounded. Existing chunk/color warnings remained nonfatal.

Exact reference/value, range, undefined, count and short-circuit rules are
unchanged, without allocation/traversal/cache. Four new public-seam cases
cover descendant reuse, partial progress/order, services, destinations and
document/context replacement. They cannot independently isolate outer list
memoization or the inherited-context branch; static equivalence supplies that
review. Keys, refs, scheduling, limits, privacy and domain ownership remain.
No native/model claim is made; the hardware baseline remains failed.
