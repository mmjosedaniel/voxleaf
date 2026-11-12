# U15 case5.3: bounded owned installer tree

Status: focused host tests/static checks pass; independent [review R1](review-U15-5.3-R1.md)
is APPROVE (`FPA-U15-5.3-CR-R1-20261111`).
HEAD remains `a3241571944530d468e2f4f2d37a0a2394a8df84`, index empty.
Scope is lifecycle script, new installer helper, owning Node tests and setup
documentation. Earlier U12 tests and U12/U14 setup paragraphs are cumulative
context. No actual VoxLeaf installer or real user profile was exercised here.

The helper creates a hidden suspended process without inherited handles, keeps
the exact process/thread handles and assigns a private kill-on-close Windows Job.
The lifecycle journal records root identity before resume. A monotonic two-minute
budget waits for both Job ActiveProcesses zero and root signal; a parent exit
alone cannot complete installation. Timeout terminates only the owned Job and
boundedly verifies reaping. An unassigned suspended root uses its retained handle.

Journal/assignment failures enter the same containment path. Unverified reaping
or handle cleanup marks the lifecycle cleanup failure, retains recovery material
and prevents uninstall/restoration and a passing receipt. Primary and cleanup
errors remain visible. Existing uninstall deadlines and public parameters stay
unchanged. The root owner is separate from the existing uninstaller owner.

## Normal-host reproduction and controls

Pinned Node24.18.0/pnpm11.15.1; Windows PowerShell5.1.26100.9711 children,
all commands outside the sandbox.2026-11-12 UTC:

```powershell
node --test --test-name-pattern 'five-pass 5\.3' apps/desktop/scripts/windows-release.node-test.mjs
node --test --test-name-pattern 'five-pass 5\.3|VAF H13|CCF-C16|CAF-R1\.5|DCR-05' apps/desktop/scripts/windows-release.node-test.mjs
pnpm.cmd exec prettier --check apps/desktop/scripts/windows-release.node-test.mjs
pnpm.cmd exec eslint apps/desktop/scripts/windows-release.node-test.mjs
```

RED02 at00:58:45.236–00:58:51.813, exit1: one intended failure. A benign real
parent starts a descendant then exits. The old wait lets that child reach its
4.2-second natural fallback, then reports installed-file-missing instead of the
required installer-timeout. Child readiness, natural exit and uninstall count
are recorded. RED01 was solely an inherited PSModulePath failure before this
reproduction; the Windows PowerShell fixture environment was corrected and the
failed attempt retained separately.

Final GREEN02 at01:04:30.549–01:04:54.081, exit0:26/26 pass. Actual process
controls cover timeout with a live descendant, normal descendant completion,
unverified containment blocking restore/uninstall, suspended-root reaping after
journal failure and direct unassigned-handle cleanup. At uninstall, owned root
and child are gone, an independent sentinel remains alive, and original backup
and journal still exist. Existing H13/U12 controls retain their assertions;
only a temporary copied helper supplies narrow test seams.

Static checks01:05:24.916–01:05:28.191: Prettier, ESLint, Windows PowerShell AST
parsing for both scripts and tracked scoped diff check exit0. The new helper's
no-index whitespace check returns the expected difference exit1 with zero
findings; aggregate static result is0. GREEN01 also passed before additional
positive controls were added; final GREEN02 is the accepted candidate.

## Exact bindings

Ignored prefix `tmp/evidence/five-pass-audit/u15-5.3-`:

| Gate | Input rows | Input SHA-256 | Log SHA-256 |
| --- | ---: | --- | --- |
| RED02 | 89 | `CED1BC19FEF8142D0127AD9C0029DB7E131DDBF5BADFB40C8B73626721848ED9` | `DEF3585ABDE0553493ADEA5A0BDD94D559078F348A8D0858A43273DE4339FFE7` |
| GREEN02 | 90 | `B7A46982371890802A5ADA9E6F19F448454DBEE4855BF4246B7645D21DC3027E` | `428E643EB1CF986FB8B180E686EA83CDCEC3C7A9A3ACF6BDDEFFE87873D723AF` |
| Static01 | 29 | `F4E9F891D770F4047690041F411EE83E105C461E9844B6854FEEA76D760CF65B` | `53D3CC7A71A16C2B27677B00E5F26F00ABDA6FE03153F861FE5D4463C72F15BB` |

Each before/after pair is identical. Closed80-path `u15-5.3-review-inputs.txt`:
`3FA12E920871F2DD94770E58C159ADA113BBBA80FDE25AC485B86AFBE5040A31`.
Combined tracked plus full new-helper `u15-5.3-review.diff`:
`BD4FBEAAD907DF7B8264A357676FE6C9620787CAD96159DBFC984505401F3237`.

Full G4, final installer G9, outer restoration and integrated review remain
pending. Synthetic descendant proof does not replace the canonical lifecycle run.
