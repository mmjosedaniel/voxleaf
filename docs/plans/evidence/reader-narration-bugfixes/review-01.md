# Reader/narration independent review 01

Review ID: `RNB-review-01-20261020-Astra`. Task: `RNB`.
Verdict: **CHANGES_REQUESTED**. Immutable review of the first candidate.
Reviewer: independent `change_reviewer`, GPT-6 Astra high, read-only; no tests
or edits performed by the reviewer. Base and HEAD:
`8fd0c54e93705009e6070cb97105c8a1032002d6`.

All 26 task-owned paths (24 tracked modifications and two new files) matched
before and after review; the index remained empty. The bounded identity
manifest is retained locally in ignored
`tmp/evidence/reader-narration-bugfixes/review-01-identities.json`, SHA-256
`3212034d2a5dd482098f12a9ed597dbf20b8ef5fa383a42215fc8d52b9b7bac3`.
The tracked patch SHA-256 was
`f619a73041d55a230a2de8b2794884ece140e4ac8dc4f0eb24a46af4e4d2db6a`.
The review also checked 22 unchanged supporting authorities/callers; its
supplemental identity snapshot is preserved in the review conversation.
These local captures are provenance, not portable public attachments.

## Findings and bounded correction criteria

1. P2: Stop treated the typed client's completed-synthesis cancellation race
   as permanent cleanup failure after successful shutdown. Require validated
   containment, complete player cleanup, stale-byte rejection and explicit
   restart in a coordinator test using the real typed client.
2. P2: successive five-second waits renewed final cleanup. Use a shared
   monotonic deadline and test 5,000/5,001 ms with delayed operation/backend.
3. P2: a second concurrent coordinator close resolved before cleanup. All close
   callers must join one completion and dispose the backend once.
4. P2: stress coverage was prepared-only. Add quick generation-ahead across 64
   ranges and refill batches, asserting actual Next/Previous locators.
5. P2: resource deadline edges tested budget arithmetic but not archive wiring.
   Add actual lazy reads at deadline/max-plus-one and cumulative-byte edges.
6. P2: pending renderer invocation did not establish native loading/warming.
   Observe the native phase and matching service identity before Cancel start,
   then bounded containment/cleanup and explicit restart.

The reviewer found no additional confirmed privacy, PCM-bound, locator-schema,
narration-normalization or persistence regression. This is not acceptance.

## Evidence assessed

The coordinator supplied outside-sandbox local PowerShell results: focused
desktop 107 pass; subsequent navigation 39 pass; EPUB 657 pass; both Rust
modes pass; `pnpm.cmd check` pass; Chromium nine pass; native synthetic smoke
pass. Permanent pre-fix failures were treated only as reproduction evidence.
The real-model aggregate exited 1 before inference on profile selection; it
could not establish real-model cancellation or lifecycle acceptance.

All six corrections, fresh matching host evidence and a new exact-identity
review were required. This report grants no Git authorization. Later work is
recorded in the [active plan](../../completed/reader-narration-bugfixes.md).
