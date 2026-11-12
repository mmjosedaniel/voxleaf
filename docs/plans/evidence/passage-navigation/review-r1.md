# Independent review PN-20261112-R1

Task PN-2026-11-12. Role: `change_reviewer` (GPT-6 Astra high), read-only;
the reviewer did not execute tests. Verdict: **BLOCKED**, with one confirmed
source defect and incomplete acceptance evidence. This immutable receipt is a
content-safe summary of the report, not approval of a later revision.

Base: `a8a61df1417e476daada7795809b5153965a4a54`.
Reviewed HEAD: `6dd694b815bf52b34e4644487067ec2ba3a8956d`.
Closed317-path manifest,19 task-owned paths, in ignored
`tmp/evidence/passage-navigation/review-r1.manifest.json`:
SHA-256 `A01BF919D3246F210EF3445D3E881542E24EF4D605E8061F70B68F6C32F7E696`.
Diff SHA-256 `FD46116929A705EA6B2B64B988A756E9E5CC76819414EFA1F7982FFB2170C672`.
Full new-file snapshot SHA-256
`CE799CA162BC82E78183DC38D4455C4B1E87587E0204F4341343505710971E9D`.
Independent before/after status, worktree SHA-256 and filter-aware blob recheck:
PASS for every path; HEAD unchanged, index empty.

PN-01 continuity, PN-02/03 request attribution and PN-04's measured-follow change
were supported by source and supplied controls, except the following finding.

**PN-R1-F1, P2:** after unavailable passage placement, the preference-restoration
callback in `ReaderPublication.tsx` discarded `placement: "unavailable"` and
synthesized a successful reflow settlement. The coordinator could consequently
enable Play at an unconfirmed location. Require an integrated appearance-change
control that preserves gating and admitted progress until measured recovery.
The finding was established statically; natural failure frequency was not claimed.

The full installed-JS snapshot bracketed only the EPUB run. Earlier reused
desktop/lint/format results lacked complete original dependency proof; later
checks needed a closing comparison. Native final receipts and documentation
closure were also pending when the reviewer inspected them. `run-host.ps1`
needed documentation identities for document gates.

Required action: reproduce/correct F1, renew affected checks with complete input
bindings, finish native restoration/documentation, and obtain a new review ID.
No acceptance or Git authorization was granted.
