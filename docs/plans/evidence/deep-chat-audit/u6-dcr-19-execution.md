# U6 / DCR-19 execution receipt

Receipt DCR-U6-EXEC-20261109-01. Base and HEAD
`d375ecc84261c404e855c055e0ecc8949a97caaf`, index empty.
Normal local PowerShell outside automation sandbox, cargo/rustc 1.97.1.
Raw logs and before/after input identities are in
`tmp/evidence/deep-chat-audit/U6/`.

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml dcr_19` RED
  exit 101, three intended failures against unchanged removal production.
  Real Windows junction to the in-root sibling removed its redirected leaf
  and the active package; the outside junction was rejected after the active
  package was already removed; the missing redirected leaf let removal
  succeed. All roots and links belonged to synthetic fixtures.
- Same selector GREEN exit 0, all three passed. Unsafe ancestors reject
  before deleting the active package or redirected sentinels. After removal
  of only the synthetic junction, retry succeeds while unrelated bytes
  remain intact.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests`
  final GREEN exit 0, 76 passed, three ignored. Existing root/leaf links,
  backup-tree checks, metadata denial, locked-path retry, cancellation, normal
  removal and release-admission controls pass. The earlier owner attempt
  failed the permission-control fixture because its supposedly denied leaf
  had a nonexistent parent. The fixture now creates its parent, preserving
  all denial assertions. That failed attempt remains separately retained;
  the final owner run also reran all three DCR-19 cases.
- `rustfmt --edition 2024 apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`
  and final `rustfmt --check --edition 2024 apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`
  exited 0. G5, G7 and G9 remain pending. The exact-v7 opt-in tests are
  ignored in the owner run; no new admission/inference outcome is claimed.

## Closed reviewed inputs

First three rows comprise the U6 patch. The testing guide retains prior
U10/U15 changes. Remaining paths are supporting inputs.

| Path | Status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| apps/desktop/src-tauri/src/tts_optional_chatterbox.rs | ` M` | 4947bece7e324b4264c5d94646735a7d7fe3fad2af60d9f9b2ca5619c37cc40d | 70787e743bc4273e7d1e2276bafcd86ddf086152 |
| apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs | ` M` | 3a7fb723bfa71936456d290cf2b4552245fd5feb1a232c6f2abc7584e288f408 | 2731efcef85aceb225670162963fe6a979ecb2e2 |
| docs/development/testing.md | ` M` | 672fb244548de3cb089a7dd5d9ace1e687d710a2a912029e6d4f057a4191c712 | f70a3f076c89bcd104d8c8d1726fa613374af61c |
| apps/desktop/src-tauri/src/tts_optional_chatterbox/tests/exact_local.rs | `clean` | a95fa48fd836ba04cf00f36e075b985501a7d2468c71dfca7fc6518e346f3622 | a711baecdcc8ae82d1bf554f980e374946deae1a |
| apps/desktop/src-tauri/src/tts_service_supervisor.rs | `clean` | ea58307c22d472a59126b8549b29cba6750be253a43b49ffb5b8069af39ce5b0 | 8f52e484c9c3effe0d03f7dc7fdf8cd58387eb60 |
| apps/desktop/src-tauri/Cargo.toml | `clean` | f7589af14b344c827c746e5741a3a5f6d274e8b0643a829ec5a0b3d6971dde09 | 2d119b08ff5c815f3f4926cb2ae6892fddd5bf3b |
| apps/desktop/src-tauri/Cargo.lock | `clean` | 9336f463f36e88f35a81605348387deb063a396177c5369d3f5836b5a8790975 | ef3f7f1bbc9b1c93e3684e2877c09e89e1b8214e |
| services/tts/release/optional/chatterbox/optional-package-manifest-v7.json | `clean` | b398ba1ab7144f920d9d6ddcece57afc1646280121104b7ddf509e66c2585dfd | 21dd0fc16005f10c20b8855e2cdbfba7340a758b |
| package.json | ` M` | 79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6 | fd94e123a32a6b4a44d5ccb296cd89e25b319232 |
| .gitattributes | `clean` | d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4 | 5acf47068be3a84b4e38b502877083e99b5ce0f9 |
