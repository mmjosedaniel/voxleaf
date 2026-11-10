# U12 / DCR-04 integration correction receipt

Receipt DCR-U12-EXEC-20261109-02. Base and HEAD
`d375ecc84261c404e855c055e0ecc8949a97caaf`, index empty.
Original reproduction and approval remain in [R1](u12-dcr-04-execution.md)
and [its review](review-U12-R1.md).

The first M2 Clippy command exited 101 on items-after-test-module.
The sole change since R1 moves the identical `#[cfg(test)]` module to the
end of `windows_probe.rs`. Reversing just that relocation reconstructs the
exact R1 SHA-256
`bcf6ec452f4290fc9c6bc45edd774ec31a46b56829e25c5a79be282be42aaa43`.
No native runtime, test assertion, or policy changes.

- `pnpm.cmd format:check:rust`, exit 0.
- `pnpm.cmd test:rust`, exit 0. Default 187 passed, nine ignored.
  Release-locked 186 passed, nine ignored.
- `pnpm.cmd lint:rust`, exit 0. Clippy ran in both modes.
- All three reruns were in normal local PowerShell with current exact source
  and identical input snapshots. Initial Clippy and prior-input Rust test
  receipts remain separate under `tmp/evidence/deep-chat-audit/M2/`.
  No non-Rust test consumed the moved test module; those gates were not rerun.

## Closed reviewed inputs

| Path | Status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs | ` M` | d27974bed2f364d6dbf65788afa1f4cd9408331d0a51e15aafea74235366e64d | ef775946948973a3c53f5467aac945653725b705 |
| docs/architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md | ` M` | f800af4ea23b415f549d479e4ad17a520df57a38d892648bd37d903a0d63522e | d489a76eb8366a25543b129a45ce47acb205345c |
| apps/desktop/src-tauri/src/host_profile_detection.rs | `clean` | 60a3fd6db618e4b5849e3723af036838a782e976f33f8f2280d5f7a50007d0e4 | adfd57b58a35c0ef697af2d0940d9b52474aba18 |
| apps/desktop/src-tauri/src/host_profile_detection/tests.rs | `clean` | 3293953cd0f4ef5c2bc8814c246da6fb98c294c56eda2a5a232325f464188776 | 7543017e4518924a9af610fb83c7d4d4a64e7bec |
| apps/desktop/src-tauri/Cargo.toml | `clean` | f7589af14b344c827c746e5741a3a5f6d274e8b0643a829ec5a0b3d6971dde09 | 2d119b08ff5c815f3f4926cb2ae6892fddd5bf3b |
| apps/desktop/src-tauri/Cargo.lock | `clean` | 9336f463f36e88f35a81605348387deb063a396177c5369d3f5836b5a8790975 | ef3f7f1bbc9b1c93e3684e2877c09e89e1b8214e |
| package.json | ` M` | 79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6 | fd94e123a32a6b4a44d5ccb296cd89e25b319232 |
| .gitattributes | `clean` | d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4 | 5acf47068be3a84b4e38b502877083e99b5ce0f9 |
