# Change Review Report

Review ID: **FPA-U15-5.3-CR-R1-20261111**  
Task ID: U15 / case 5.3  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

**Reviewed paths and identities**

This report incorporates the complete 80-path closure and 17 evidence-artifact identities in:

- `tmp/evidence/five-pass-audit/u15-5.3-review-inputs.txt`  
  SHA-256: `3FA12E920871F2DD94770E58C159ADA113BBBA80FDE25AC485B86AFBE5040A31`
- `tmp/evidence/five-pass-audit/u15-5.3-review.diff`  
  SHA-256: `BD4FBEAAD907DF7B8264A357676FE6C9620787CAD96159DBFC984505401F3237`

The exact patch contains the lifecycle script, new installer helper, owning Node tests, and setup documentation.

**Identity recheck: PASS**

Initial inspection: `2026-11-12T01:08:23.5147178Z`. Final inspection: `2026-11-12T01:11:29.1672365Z`.

HEAD remained unchanged and the index remained empty. All closed path statuses, SHA-256 hashes, filter-aware blob identities, and evidence hashes matched. The current tracked diff plus complete new helper matched the supplied combined diff exactly.

**Acceptance review**

The installer starts suspended and hidden without inherited handles. Ownership remains attached to retained process, thread, and private Job handles; cleanup does not reopen a PID. The root identity is journaled before resume, and successful completion requires both zero active Job processes and a signalled root within the absolute execution deadline.

Timeout and launch/journal failures terminate and reap the owned process tree before uninstall or restoration can proceed. Unverified cleanup records failure, blocks those destructive follow-up steps, and retains the journal and backups. Primary failures remain visible alongside cleanup failures. Existing uninstaller and recovery controls remain intact.

The synthetic parent/child tests exercise the actual helper and distinguish parent exit from descendant completion. They also cover suspended-root journal failure, unassigned-root cleanup, unrelated-process survival, and conservative handling of unverified cleanup. Existing H13 assertions were preserved.

**Test evidence reviewed**

Attributed to the supplied normal-host PowerShell execution; I did not run checks:

- Preserved RED02 demonstrates the former unbounded wait reaching the child’s natural fallback and reporting the wrong primary failure. RED01’s infrastructure failure is disclosed.
- Fresh GREEN02: **26/26 passed**, using  
  `node --test --test-name-pattern 'five-pass 5\.3|VAF H13|CCF-C16|CAF-R1\.5|DCR-05' apps/desktop/scripts/windows-release.node-test.mjs`
- Scoped Prettier, ESLint, PowerShell AST parsing, and tracked whitespace checks passed. The new-file no-index comparison returned its expected difference status without whitespace diagnostics.
- All 90 runtime inputs and 29 static inputs matched their paired captures and current files. Their manifest hashes are respectively `B7A46982371890802A5ADA9E6F19F448454DBEE4855BF4246B7645D21DC3027E` and `F4E9F891D770F4047690041F411EE83E105C461E9844B6854FEEA76D760CF65B`.

Fresh evidence also renews the included U12 wrapper and validator controls within this manifested scope. Cumulative U14 documentation does not constitute renewed U14 runtime acceptance.

**Findings:** None.

**Remaining uncertainty:** No actual installation occurred in this unit. The real-installer G9 run, full G4, final JavaScript static checks, and integrated campaign acceptance remain pending.

**Required next action:** None for this scoped unit review. Complete the declared integration gates before final campaign acceptance. This approval grants no Git authorization.
