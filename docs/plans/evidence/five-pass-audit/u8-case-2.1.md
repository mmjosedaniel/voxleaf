# U8 case 2.1: preserve acquisition across reselection

Status: unit APPROVE FPA-U8-2.1-CR-R1-20261111; final integration pending.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty.
Scope: optional-chatterbox-client.ts/test, OptionalChatterboxControls.test.tsx,
tts_optional_chatterbox.rs/tests.rs and MVP documentation. No control/settings
production edits, public IPC change or cross-process support added.

Native Select retains Confirming in both snapshot and locked admission checks,
preserving the exact token bound before host preflight. A synthetic transfer
hook proves the original token can reach admission after ordinary reselection;
the existing canceled-token replacement rejection remains. The client returns
its current snapshot for Select while Download is pending, without competing
IPC or replacing action identity. Terminal success/failure and Settings remount
tests retain pending state, Cancel, polling and eventual result.

The old newer-action table's Select entry is replaced with explicit same-
acquisition tests because that expectation encoded the defect. Cancel, Remove
and replacement Download continue to supersede obsolete work. Cases2.2/ADD-01
remain separate and untouched at this checkpoint.

## Host RED/GREEN

Normal PowerShell outside sandbox; Node24.18.0/pnpm11.15.1/Vitest5.0.5,
rustc/Cargo1.97.1 x86_64-pc-windows-msvc. Raw logs and paired manifests under
ignored tmp/evidence/five-pass-audit. Synthetic fixtures use no model download
or real optional artifact admission.

Native RED01, 21:52:11.452–21:52:34.486 UTC, exit101: one expected failure,
ordinary reselection replaced the admitted token and returned Cancelled.
TS RED01, 21:52:42.638–21:52:44.936 UTC, exit1: three intended failures,37 skipped.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml five_pass_2_1_reselection_preserves_preflight_confirmation
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/optional-chatterbox-client.test.ts src/tts/OptionalChatterboxControls.test.tsx -t 'five-pass 2.1'
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/optional-chatterbox-client.test.ts src/tts/OptionalChatterboxControls.test.tsx src/settings/ReaderSettingsDialog.test.tsx src/settings/narration-settings-actions.test.ts src/App.test.tsx
pnpm.cmd exec prettier --check apps/desktop/src/tts/optional-chatterbox-client.ts apps/desktop/src/tts/optional-chatterbox-client.test.ts apps/desktop/src/tts/OptionalChatterboxControls.test.tsx
pnpm.cmd exec eslint apps/desktop/src/tts/optional-chatterbox-client.ts apps/desktop/src/tts/optional-chatterbox-client.test.ts apps/desktop/src/tts/OptionalChatterboxControls.test.tsx
pnpm.cmd --filter @voxleaf/desktop run typecheck
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
```

G5 default01 21:53:28.386–21:53:37.317 UTC and locked01
21:53:46.130–21:53:56.401 UTC: each exit0,77 passed,three explicitly ignored
local-artifact/admission/integrity cases (117/116 unrelated filtered tests).
G1 ts-green01 21:54:10.268–21:54:15.640 UTC:209/209,exit0.
TS static01 21:54:12.007–21:54:17.992 UTC: all exit0. Native fmt01
21:54:17.391–21:54:18.951 UTC and clippy01 21:54:32.825–21:54:41.985 UTC:
exit0, Clippy includes both configured feature modes.

TS RED paired SHA-256 `5CB13E993102A414365F81D796F8DCEC68F2DE20A8F2ED1CF69AE02606913A84`.
Native RED paired SHA-256 `E3996EA2AE0156BF0947B2186C27D1021BD580565510D6F365140F3483360E80`.
Native GREEN/fmt/Clippy source/lock/registry archives/tool/config paired SHA-256
`F8823C96D3F7E8D1E9BBD769068AC908F9A745CB79F116EC47FF008D0A42E412`.
G1/static paired SHA-256
`03435F4556FE642362E9AF32E968687C658C4A7BD786064915A71969780BB097`.

## Frozen review binding

`u8-2.1-review-inputs.txt` SHA-256
`20FBEAF60522A42767C6248EC4B999705D8A110D2FB81E8F38CE59D018A283EB`.
Exact six-file `u8-2.1-review.diff` SHA-256
`30555CA2BCBA91CD32170E6160616299AA79287BA05281C7EE9050384A244914`.
Actual root Vitest identities are captured; all251 emitted EPUB/shared files
still match the verified U6 G0 bytes. This is artifact reuse, not reused test PASS.

G8 exact local admission, final product/native/static/integrated gates remain
pending. Ignored tests above do not satisfy G8, and native unit evidence does
not establish installed-package inference or lifecycle acceptance.
