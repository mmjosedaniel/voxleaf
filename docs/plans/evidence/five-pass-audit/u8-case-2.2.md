# U8 case 2.2: reject busy removal before Stop

Status: unit APPROVE [FPA-U8-2.2-CR-R1-20261111](review-U8-2.2-R1.md);
combined acceptance pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty.
Scope: settings actions/test, App/test, optional native manager/test and the
existing MAF-04 fake in product coordinator test; product settings doc amended.
The review includes the cumulative 2.1 patch and relevant earlier tests/docs.

Renderer admission checks existing downloadPending and known busy states before
configuration containment or Stop. App's no-coordinator handoff is deferred until
that admission, while App still owns the removal promise before asynchronous
work. A busy rejection cannot leave the next book's narration admission blocked.
No public native worker-active field was added.

Native reserve_removal returns the entire prior Operation with its mutex released
before supervisor Stop. Failure restores that operation; success keeps the
existing supervisor admission guard through remove_reserved's runtime lock and
deletion. Direct test removal entrypoints still reserve. Tests retain all MAF-04
exclusion/containment/retry controls and add busy post-commit cleanup, competing
Select/Download/Remove and complete prior-state rollback. Installed bytes and the
existing commit point are unchanged. ADD-01 remains separate.

## Host evidence

Normal PowerShell outside sandbox; Node 24.18.0, pnpm 11.15.1, Vitest 5.0.5,
Rust/Cargo 1.97.1 on x86_64-pc-windows-msvc. Raw logs/manifests live in ignored
tmp/evidence/five-pass-audit.

Native RED01, 22:02:21.087–22:02:28.526 UTC, exit 101: actual synthetic promotion
held after commit proves Installed + worker_active + retained bytes; expected
Busy, received CleanupFailed from the unverified-termination supervisor. Its
controlled poisoned-termination diagnostic is not an infrastructure failure.
TS RED02, 22:02:56.470–22:02:59.140 UTC, exit 1: six intended cases, 144 skipped;
five action variants entered Stop and App's no-owner path blocked the next book.
The earlier action-only RED01 is retained separately.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml five_pass_2_2_post_commit_busy_removal_precedes_supervisor_stop
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/settings/narration-settings-actions.test.ts src/App.test.tsx -t 'five-pass 2.2'
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/optional-chatterbox-client.test.ts src/tts/OptionalChatterboxControls.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/App.test.tsx src/tts/product-narration-coordinator.test.ts
pnpm.cmd exec prettier --check apps/desktop/src/settings/narration-settings-actions.ts apps/desktop/src/settings/narration-settings-actions.test.ts apps/desktop/src/App.tsx apps/desktop/src/App.test.tsx apps/desktop/src/tts/product-narration-coordinator.test.ts
pnpm.cmd exec eslint apps/desktop/src/settings/narration-settings-actions.ts apps/desktop/src/settings/narration-settings-actions.test.ts apps/desktop/src/App.tsx apps/desktop/src/App.test.tsx apps/desktop/src/tts/product-narration-coordinator.test.ts
pnpm.cmd --filter @voxleaf/desktop run typecheck
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
```

G5 default 22:04:38.185–22:04:49.379 UTC and locked
22:05:14.736–22:05:23.734 UTC: each exit 0, 78 passed, three special ignored cases,
117/116 unrelated filtered. G1 GREEN02 22:05:58.209–22:06:04.270 UTC: 409/409,
exit 0. GREEN01's 406 PASS/three incomplete MAF-04 fake failures and static01's
missing fields/App fixture type error are preserved. Only required fake fields
and fixture typing changed before the unchanged command was rerun.

Final TS static02 22:06:00.107–22:06:07.760 UTC: all exit 0. Rust format
22:05:41.610–22:05:43.101 UTC and Clippy both modes
22:05:58.525–22:06:05.304 UTC: exit 0.
TS RED02 paired SHA-256 `001A810CFF7C2AB836F575165D375B334B7956674E84283DC9AB80DCB0C82A2B`.
Native RED paired SHA-256 `66EFFF09E25FC0BBF2106A9115D2E19F6E2C44A6921F8AFA8EB28E67E38B4B36`.
Final TS paired SHA-256 `858588D80BCEEF53EE7D600A334CCBBD5C3558523CE260B6AF3904C4BD9FE3F4`.
Final native paired SHA-256 `2DB9FB931F5927F1C164BC02B6D1B958914618F8C91B81A31D89A791F12A72A3`.

## Frozen review binding

`u8-2.2-review-inputs.txt` SHA-256
`203CB4DC8D64945C0FCB8BAF3D881FAB34CB03E8B73E6F460D045AB193726E53`.
Cumulative scoped `u8-2.2-review.diff` SHA-256
`E0260FD6E6771E54280CCA44E582E9C38842E9D3DB51D25F5939C5C6D6BCA36A`.
Native test executable identities are included. All 251 built package identities
match U6 G0; this verifies artifact reuse only. Coordinator production is unchanged;
relevant U1, U7 and 2.1 receive renewed assessment on the current dependencies.

No historical PASS reuse, real model acquisition or inference. Final browser,
G8, native/static/integrated gates remain pending. The App Play control is
synthetic domain integration, not physical audio evidence.
