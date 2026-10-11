# App readability execution evidence

Executed on 2026-10-11 as one atomic unit, APP-READABILITY-01, on existing branch
`codex/app-readability` at `a1c2b467037e91c82aa0354d697704c967bfb5e6`.

Accepted source result: [APP-READABILITY-01-POST-CHANGE-02](post-change-02.md),
independent GPT-6 Astra high PASS for all nine required host commands with exact
path identity recheck. The three-file patch contains 646 added/deleted lines
and nine additional integration cases. No staging or commits were performed.

## Receipts

- [Execution setup](execution-setup.md): clean index/source, existing branch,
  role configuration and explicit authorization limits.
- [Current audit and draft terms](audit-and-draft.md): CHANGE presentation;
  SKIP preference deduplication, publication lifecycle extraction, test relocation
  and generic abstractions.
- [Independent baseline](baseline-01.md): seven commands PASS before writing.
- [Frozen work order](approved-work-order-01.md): three paths, all invariants,
  650-line ceiling and nine acceptance commands.
- [First Change Packet](change-packet-01.md): bounded extraction plus tests.
- [First post-change report](post-change-01.md): FAIL from new picker-test fixture;
  static/browser/native gates passed, aggregates stopped at that fixture.
- [Correction order](correction-order-01.md) and
  [corrected Change Packet](change-packet-02.md): only test preparation changed;
  every assertion and both production hashes preserved. One correction cycle used.
- [Accepted post-change report](post-change-02.md): complete source acceptance,
  both aggregates, exact hashes, counts and limitations.

## Retained boundaries

`AppPresentation.tsx` owns three stateless module-scope components and private
messages. App owns publication/restoration identity, state, effects, resources,
selection, dismissal and both distinct preference handlers. Public props/test
injection seams and DOM/copy/accessibility remain intact.

Director reviewed the canonical system diagram: picker/session/reader, Settings,
persistence, inference and trust-boundary edges are unchanged. This internal TSX
extraction requires no diagram edit or architectural/performance claim.

Raw logs/scripts/identity dumps are local ignored evidence under
`tmp/evidence/app-readability/{baseline-01,post-change-01,post-change-02}/`.
They are not permanent public artifacts. No model benchmark was required;
late startup preference-read completion is not covered by the new fixtures.
Non-failing tool warnings are recorded in the accepted report.
