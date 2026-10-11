# CORRECTION ORDER

Target ID: APP-READABILITY-01

Order ID: APP-READABILITY-01-CORRECTION-01 (cycle 1 of maximum 2)

Failed criterion: required picker behavior test aborts during fixture preparation.

Evidence: [APP-READABILITY-01-POST-CHANGE-01](post-change-01.md), FAIL, unchanged
identities. App.test.tsx lines 372-373 pass nonempty target.value to fireEvent;
native file-input setter throws InvalidStateError. Desktop and both aggregates
reproduce it outside sandbox; browser/native and static gates pass.

Required correction: seed the simulated nonempty input value through its
existing synthetic own-property mechanism before dispatch, then fire change
with empty files and no nonempty target.value. Preserve all synchronous reset,
cancellation, DOM identity, replacement and failure assertions.

Allowed files: `apps/desktop/src/App.test.tsx` only.

Forbidden changes: production files, existing assertions, public/injected
contracts, lifecycle/preferences, unrelated tests, new dependencies/config,
director docs, Git mutations or recursive delegation. Retain original 650-line
three-file total ceiling. No tests required from worker; exact-path formatting
outside sandbox only if needed.

Revalidation: all nine exact commands in frozen approved-work-order-01.md,
outside sandbox, with a new immutable report and full source identities.

Validator is idle; director hands source writing exclusively to original worker.
Return a Change Packet, then remain idle.
