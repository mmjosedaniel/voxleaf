# U8 ADD-01: observe cleanup after committed cancellation

Status: unit APPROVE [FPA-U8-ADD-01-CR-R1-20261111](review-U8-ADD-01-R1.md);
integrated acceptance pending. HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty.
Scope: optional Chatterbox client/controls and their tests, with product settings
documentation. No native production change for ADD-01.

The client retains the actual paired Download promise and a bounded current
Cancel generation. A Cancel response of Installed waits for that acquisition,
then starts one fresh read-only snapshot, replacing stale coalesced poll
ownership. Generation fences suppress results after a newer admitted action.
This does not republish the obsolete Download result or retry cleanup.
Precommit cancellation keeps its existing result. The controls subscribe to
client-owned pending cancellation across remount, disabling duplicate and
conflicting actions. Paired acquisition remains pending during native cleanup,
preserving case 2.2's rejection before Stop.

## Normal-host evidence

All commands ran outside the managed sandbox in local PowerShell with Node
24.18.0, pnpm 11.15.1, Vitest 5.0.5 and Rust/Cargo 1.97.1.
Raw logs and paired manifests are in ignored `tmp/evidence/five-pass-audit/`.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/optional-chatterbox-client.test.ts src/tts/OptionalChatterboxControls.test.tsx -t 'five-pass ADD-01'
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/optional-chatterbox-client.test.ts src/tts/OptionalChatterboxControls.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/App.test.tsx src/tts/product-narration-coordinator.test.ts
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
pnpm.cmd exec prettier --check apps/desktop/src/tts/optional-chatterbox-client.ts apps/desktop/src/tts/optional-chatterbox-client.test.ts apps/desktop/src/tts/OptionalChatterboxControls.tsx apps/desktop/src/tts/OptionalChatterboxControls.test.tsx
pnpm.cmd exec eslint apps/desktop/src/tts/optional-chatterbox-client.ts apps/desktop/src/tts/optional-chatterbox-client.test.ts apps/desktop/src/tts/OptionalChatterboxControls.tsx apps/desktop/src/tts/OptionalChatterboxControls.test.tsx
pnpm.cmd --filter @voxleaf/desktop run typecheck
```

RED01, 22:15:16.490–22:15:18.966 UTC, exit 1: four intended failures.
Both completion orders omit the fresh observation; Cancel-first loses pending
acquisition while cleanup runs; remount permits duplicate Cancel and conflicting
actions. GREEN01, 22:17:35.493–22:17:41.563 UTC, exit 0: 415/415 tests in six
suites. Controls cover both completion orders, cleanup failure/success, a stale
held poll, newer removal during pairing or fresh read, precommit cancellation
and remount. Earlier 2.1/2.2, Reset, App and coordinator controls also pass.

G5 default 22:17:11.641–22:17:19.036 UTC and locked
22:17:36.512–22:17:45.629 UTC each exit 0: 78 passed, three explicitly ignored,
117/116 filtered. Existing native promotion/cleanup tests verify committed
bytes survive failed cleanup; these are fresh model-free runs, not G8 admission.
Scoped static checks 22:17:37.181–22:17:45.184 UTC all exit 0.

RED paired input SHA-256:
`D1D84E838593448CBA61B7B1676773142CF5908DF9665D21D2889B2971DB8B61`.
GREEN paired input SHA-256:
`E5946E312B65D874049D35E109716009AD15E788E7A69A8029CA4EF4288211BC`.
Native paired input SHA-256:
`2DB9FB931F5927F1C164BC02B6D1B958914618F8C91B81A31D89A791F12A72A3`.

## Review binding and limits

`u8-add-01-review-inputs.txt` SHA-256
`9582EA208AA74622305BBF7B6F47952E3A9080190619FDF79DF2A133523BDF34`;
closed 26-path cumulative scope and both native executable identities.
`u8-add-01-review.diff` SHA-256
`5C79BFC973D890D2A01561EEFCD9AF1EAD3F9391FC51BDBA1A2290DBB5D2BBFF`.
All 251 U6 package build artifacts remain byte-identical: asset equivalence,
not historical PASS reuse. Final G8, browser, native and integrated acceptance
remain pending. Synthetic controls do not establish physical audio behavior.

The reviewer explicitly accepted reuse of U8/2.2 Rust formatting and both Clippy
results after matching the complete 527-row inputs and recorded toolchain and
environment. Behavioral desktop and native checks above are fresh runs.
