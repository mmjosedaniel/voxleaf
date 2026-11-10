# U14 / DCR-16 execution receipt

Receipt DCR-U14-EXEC-20261109-01. Base and HEAD
`d375ecc84261c404e855c055e0ecc8949a97caaf`, index empty.
Normal local PowerShell outside automation sandbox, uv 0.11.29, Python
3.12.10, pytest 9.1.1. Private logs and snapshots are in
`tmp/evidence/deep-chat-audit/U14/`.

- RED: `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_chatterbox_adapter.py -k dcr_16`,
  exit 1. Seven shape regressions on unchanged production failed. Scalar,
  multichannel, transposed, high-rank and synthetic oversized metadata
  flattened or passed. Empty shapes transferred before post-conversion
  rejection. Both valid mono controls passed.
- Same focused GREEN exit 0, nine passed, eight deselected. Invalid shapes
  never detach, transfer or flatten. Both admitted shapes produce the
  same little-endian finite mono bytes. The synthetic oversized case
  asserts pre-transfer shape admission without allocating an oversized tensor.
- Owner/provenance GREEN: `uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_chatterbox_adapter.py services/tts/tests/test_chatterbox_sources.py services/tts/tests/test_chatterbox_v7_preparation.py`,
  exit 0, 71 passed. Includes frozen historical Git source resolution,
  equivalence of v7's retained modules/models, and existing adapter finite,
  authority and cancellation controls. No engine was loaded.
- Scoped `uv run --project services/tts --locked ruff format` and
  `ruff check` over the first two full paths exited 0.
  `uv run --directory services/tts --locked mypy src/voxleaf_tts/adapters/chatterbox.py tests/test_chatterbox_adapter.py`
  exited 0. Final G4/G7 and exact independent integration review remain pending.
- Classification: defensive hardening in the mutable adapter. Installed v7
  source and package authorities were not changed or rebuilt; no installed
  runtime shape defect or new hardware result is claimed.

## Closed reviewed inputs

First three paths comprise the U14 patch. Testing-guide edits preserve the
other units' text. Remaining rows identify support inputs.

| Path | Status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| services/tts/src/voxleaf_tts/adapters/chatterbox.py | ` M` | a40e46dfefb7497bb9b1545e1da44f2b94ab0341e2525fc2e2a23cb1353df34b | 7c88c7ee1ccc7a1e13050865a4d69ddad14ff813 |
| services/tts/tests/test_chatterbox_adapter.py | ` M` | c74cbbaac92082643cb915ffc4cf0273630721924b34c81e9815360762db6152 | 6c7bb8420423cf9806b764f9d6a1ea2fadbd13a9 |
| docs/development/testing.md | ` M` | 62e88421f898d2e8549a0a66490792633bd76ef360265902052a25cebf1bb896 | 4fe8c6f998c10888e4f9150507a1078239e9bb9c |
| services/tts/src/voxleaf_tts/protocol.py | `clean` | 452dc2ac91ec463eae093af5bba49bae0034196f4755bde4e47416e2e3a9e3af | ecaab75f94eb71cc298101f713fe75baf8d28a58 |
| services/tts/src/voxleaf_tts/engine.py | `clean` | 29784f682d3d1201069b99abe757d286edf71ed3bcb55be4908aef7f4b63350b | 2e187534926ce5ae65d78062f7af69595c8b3fc2 |
| services/tts/src/voxleaf_tts/packaging/chatterbox_sources.py | `clean` | ffab51408afb8df3d7f9521e04d861ac77222e7262123be35b376dad6ee04229 | 4d12cf987e53a36ebf83815442bde3f1f588f444 |
| services/tts/tests/test_chatterbox_sources.py | `clean` | d768a5b6b0f02b8fcc06f3440d8544881a5a67c70cb14f5a5782ac91d650c0c6 | 15a306fb9d16711150a740036ffd5accc91f6fbb |
| services/tts/tests/test_chatterbox_v7_preparation.py | `clean` | 66787421a86124922aa54ce8e2605de1be0c1080d104d6bae69280e46dfc276f | a765665881f37fe0c68e748fc96b97508ea6cae4 |
| services/tts/release/optional/chatterbox/source-manifest-v7.json | `clean` | 8cc9c95c45abf26e5749a6a67d56536970dc4ce77c64d94656715c32b8cb4722 | 164aea440bb156d26a97ccc816b927fe49be089d |
| services/tts/release/optional/chatterbox/optional-package-manifest-v7.json | `clean` | b398ba1ab7144f920d9d6ddcece57afc1646280121104b7ddf509e66c2585dfd | 21dd0fc16005f10c20b8855e2cdbfba7340a758b |
| services/tts/src/voxleaf_tts/release_core.py | `clean` | 849b9080fcd4eba54271fcd0497296ae4e5fe6aa16ddc2029cd1e284c0e52e6f | 369b2710528125de2cbd1542836900bb48f72622 |
| services/tts/pyproject.toml | `clean` | f65ca556bd98ac9183c6ce95b05de1873689f22058820f1ff0b16d59fedf3c64 | 45ad2716bb5cbc50662b0f05e22b734fce0542b0 |
| services/tts/uv.lock | `clean` | 595916e51b3e3a4a0b1ae58cc7dc4c0a22f6104682be56d13e5d1f82c03259ed | bde23dd605da0accfd094b4feae9a3144a1b341d |
| package.json | ` M` | 79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6 | fd94e123a32a6b4a44d5ccb296cd89e25b319232 |
| .gitattributes | `clean` | d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4 | 5acf47068be3a84b4e38b502877083e99b5ce0f9 |
