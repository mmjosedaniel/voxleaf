# U12 / DCR-04 execution receipt

Receipt DCR-U12-EXEC-20261109-01. Base and HEAD
`d375ecc84261c404e855c055e0ecc8949a97caaf`, index empty.
Normal local PowerShell outside automation sandbox. cargo/rustc 1.97.1.
Raw commands, output, before/after snapshots and baseline source are in
`tmp/evidence/deep-chat-audit/U12/`.

- The System32 CUDA loader was never redirected. For the focused RED, the
  original enumeration was moved into a small call seam and invoked with
  synthetic driver calls. Compare `production-head.rs` with the exact
  `behavior-preserving-seam.diff`: unchanged count checks, loop over all
  ordinals, short-circuit query order, result mapping and ordinal-0-only
  free-memory calls. Only ownership of the call parameters and the test
  module changed at RED. RED probe bytes therefore differ from HEAD, while
  its enumeration and validation behavior remain the baseline.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml dcr_04` RED
  exit 101. One intended failure saw calls [0, 1] instead of [0]; invalid
  default with a healthy synthetic secondary and count/memory controls passed.
- Same selection GREEN exit 0, 3 passed. Valid ordinal 0 retains compute
  capability, LUID and free-memory facts despite a secondary that would fail;
  invalid ordinal 0 never tries a healthy secondary. Count and unknown-memory
  controls are preserved.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml host_profile_detection`
  exit 0, 28 passed, including the actual production Windows probe smoke,
  partial/unknown, LUID/default and DirectML ranking controls. This host
  smoke does not establish physical multi-GPU evidence.
- `rustfmt --edition 2024 apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs`
  exited 0 before GREEN. G5 in both feature modes and G7 remain pending.

## Closed reviewed inputs

First two rows comprise the U12 patch. ADR-0063 also retains U4's prior Celsius
text. Remaining inputs are support paths.

| Path | Status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs | ` M` | bcf6ec452f4290fc9c6bc45edd774ec31a46b56829e25c5a79be282be42aaa43 | 4e9b8e3d571d13a48150073f9d2058bd25e5d016 |
| docs/architecture/decisions/ADR-0063-default-cuda-and-celsius-boundaries.md | ` M` | f800af4ea23b415f549d479e4ad17a520df57a38d892648bd37d903a0d63522e | d489a76eb8366a25543b129a45ce47acb205345c |
| apps/desktop/src-tauri/src/host_profile_detection.rs | `clean` | 60a3fd6db618e4b5849e3723af036838a782e976f33f8f2280d5f7a50007d0e4 | adfd57b58a35c0ef697af2d0940d9b52474aba18 |
| apps/desktop/src-tauri/src/host_profile_detection/tests.rs | `clean` | 3293953cd0f4ef5c2bc8814c246da6fb98c294c56eda2a5a232325f464188776 | 7543017e4518924a9af610fb83c7d4d4a64e7bec |
| apps/desktop/src-tauri/Cargo.toml | `clean` | f7589af14b344c827c746e5741a3a5f6d274e8b0643a829ec5a0b3d6971dde09 | 2d119b08ff5c815f3f4926cb2ae6892fddd5bf3b |
| apps/desktop/src-tauri/Cargo.lock | `clean` | 9336f463f36e88f35a81605348387deb063a396177c5369d3f5836b5a8790975 | ef3f7f1bbc9b1c93e3684e2877c09e89e1b8214e |
| package.json | ` M` | 79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6 | fd94e123a32a6b4a44d5ccb296cd89e25b319232 |
| .gitattributes | `clean` | d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4 | 5acf47068be3a84b4e38b502877083e99b5ce0f9 |
