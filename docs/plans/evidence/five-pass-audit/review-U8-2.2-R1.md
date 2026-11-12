# Change Review Report

Review ID: **FPA-U8-2.2-CR-R1-20261111**  
Task ID: U8 case 2.2; dependent reassessment of 2.1, U7/3.3 and relevant U1 scope  
Verdict: **APPROVE**  
Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

**Reviewed paths and identities:** Incorporated closed 26-path manifest `tmp/evidence/five-pass-audit/u8-2.2-review-inputs.txt`, including path statuses, SHA-256 hashes, filter-aware blob identities and native executable identities.

- Manifest SHA-256: `203CB4DC8D64945C0FCB8BAF3D881FAB34CB03E8B73E6F460D045AB193726E53`
- Cumulative patch: `tmp/evidence/five-pass-audit/u8-2.2-review.diff`
- Patch SHA-256: `E0260FD6E6771E54280CCA44E582E9C38842E9D3DB51D25F5939C5C6D6BCA36A`

**Identity recheck: PASS.** Before and after review, all 26 path identities and HEAD matched; the index remained empty. The current scoped diff matches the supplied 1,250-line artifact. Both native executables match their manifested hashes. All 527 native and 613 desktop captured inputs match current files and their identical before/after manifests. All 251 U6 built artifacts remain unchanged; this establishes artifact equivalence, not historical test approval.

**Acceptance review:**

- **2.2: APPROVE within declared unit scope.** Renderer admission rejects pending acquisition and known busy states before configuration containment, Stop or native Remove. App owns the removal promise before asynchronous work, but starts its no-narrator replacement barrier only after admission. Existing R8-05 replacement controls remain intact.
- Native removal reserves ownership before supervisor Stop and releases the operation mutex before that call. Competing Select preserves Removing; Download and Remove cannot acquire it. Stop failure restores the whole previous operation, including cleanup metadata. Successful admission remains held through runtime locking and deletion. Installed bytes, retry behavior and the install commit point remain protected.
- **2.1: renewed APPROVE.** Confirmation-token preservation, pending client ownership, terminal results, remount and genuine supersession controls pass on current dependencies.
- **U7/3.3: renewed APPROVE for settings-action and consumer scope.** Reset still awaits fresh compatibility selection under its configuration barrier.
- **U1 cases 1.1/3.1/4.1: renewed APPROVE for coordinator/App scope.** Current coordinator tests retain delayed-navigation supersession, attempted-versus-heard recovery and visible-location protection. This does not renew unexecuted browser/Reader integration gates.

The required fake-field and fixture-type corrections preserve the original assertions. No actionable regression was found in public contracts, cancellation, lock ordering, bounded state or privacy.

**Test evidence reviewed:** Supplied normal-host PowerShell logs, not tests executed by this reviewer:

- Native RED: one intended Busy-versus-CleanupFailed failure; desktop RED: six intended failures.
- Both native package-suite commands: **78 passed, 3 explicitly ignored each**.
- Six-suite desktop GREEN02: **409 passed**.
- Scoped formatting/ESLint, desktop typecheck, native formatting and Clippy in both feature modes: **exit 0**.
- Failed GREEN01/static01 remain preserved and explained by incomplete test fixtures.

Native evidence binds to `2DB9FB931F5927F1C164BC02B6D1B958914618F8C91B81A31D89A791F12A72A3`; desktop evidence binds to `858588D80BCEEF53EE7D600A334CCBBD5C3558523CE260B6AF3904C4BD9FE3F4`.

**Findings:** None.

**Remaining uncertainty:** ADD-01 is outside this approval. Final browser, G8, native and integrated acceptance remain pending. Ignored checks do not satisfy G8; synthetic App Play coverage does not establish physical audio behavior.

**Required next action:** None for this scoped review. Complete outstanding plan gates before final acceptance. This report does not authorize Git mutations.
