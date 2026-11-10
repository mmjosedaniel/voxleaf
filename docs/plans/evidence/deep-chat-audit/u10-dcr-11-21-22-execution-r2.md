# U10 revision 2 execution evidence

- Receipt: `DCR-U10-EXEC-20261109-02`
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- [Initial execution](u10-dcr-11-21-22-execution.md) and [R1 review](review-U10-R1.md).
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U10/`.

Offline v2 validation now requires the recorded Git commit to contain the
exact pinned v2 profile and schema. The profile pins the inherited v1
schema as well, and verification binds its bytes and the predecessor
profile to the execution commit. The original v1 validator and evidence
remain unchanged. Tests reject a relabeled v1 result, a nonexistent
execution commit, and a real synthetic commit containing a different
schema. An isolated synthetic Git commit containing the correct authority
passes validation with four ordered acknowledgements.

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_service_handoff_cli.py services/tts/tests/test_service_handoff_authority.py services/tts/tests/test_service_handoff_v2_authority.py -k result_requires_exact_four
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_service_handoff_cli.py services/tts/tests/test_service_handoff_authority.py services/tts/tests/test_service_handoff_v2_authority.py
```

Local PowerShell correction RED exited 1 with one expected behavioral failure
and 37 deselected. An earlier selector typo returned exit 5 and selected no
tests. Final GREEN exited 0 with 38 passing tests. Both exact host snapshots
matched before and after their commands. Ruff applied scoped formatting.
Scoped Ruff lint, mypy and pinned Prettier passed. The Rust inputs did not
change in this correction. The first receipt preserves the actual six-test
native run and its one ignored fixture, which the passing parent invoked.
No new native test run or hardware result is claimed in this receipt.
Final integration remains pending.

## Closed reviewed inputs

The first 12 rows are the unit patch. Later rows include unchanged fixture,
authority and tool configuration inputs. Four unchanged supporting rows were
captured at handoff and match HEAD. The staged index is empty.

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `services/tts/benchmarks/service_handoff_cli.py` | ` M` | `15d97e5001456e0bace441aef5833e7e69d49b0d1578e98fe9050e6a5f64626a` | `b28a46aacd0f2663fcab02962aa1942ed6f6eb0f` |
| `services/tts/tests/test_service_handoff_cli.py` | ` M` | `ac87c92603aa7d12453dfa1ca3ef6f30b190769495ba0b4fd62c10d9e0063df1` | `347ea6c5608144b027776ec3848202e7c0668466` |
| `services/tts/benchmarks/service_handoff_v2_authority.py` | `??` | `41fc685b91d3f041ce1d0d0afd933766eca0a0fb6cabfc706f0f7062bd784bc3` | `01fb8c40e7509f303696e4f398497439beaa3286` |
| `services/tts/tests/test_service_handoff_v2_authority.py` | `??` | `6627e5f3cc546e00a5fbf5d851201010cce425dfbbb96fd456e112768bf5bbc5` | `bcd485e20c4518a2aa60cf48414c9a8c1f1c2cec` |
| `apps/desktop/src-tauri/src/tts_service_handoff.rs` | ` M` | `34d9f5034ff12bd3f45fda228636e9d2253072cab460c5b241fe7b1a3b9574d8` | `dad5ab3d0f9b354d95467a38e88f76ac04a0ede6` |
| `apps/desktop/src-tauri/src/tts_service_handoff/tests.rs` | ` M` | `2b713d26ad882035f64e29182b4283648b565bc5677220993adfa20e5ff2d131` | `ee746525b63f459ef5753786358f55af5cafdf65` |
| `apps/desktop/src-tauri/src/diagnostics/cli.rs` | ` M` | `5543a1ae31c33ea920d8e65aa1b37ef18c3be041f2a83bd022036c7251f325c1` | `6e1d65bf20ada635776e1131c264f3d483b858b2` |
| `benchmarks/tts/service-handoff-profile-v2.json` | `??` | `13e9a7a30c35d3277d98d539075778a2e51ff14e89517f268a1a09da1336cc68` | `9eb963442385d8b2db22fc5d66452756134cbb65` |
| `benchmarks/tts/schemas/service-handoff-result-v2.schema.json` | `??` | `a205b0996e691ddf4a7c70ec1b20cf26321f0b6fb790d6165ea02d18534d53a0` | `bb5b266222054a1efa2ee11ffee9725973f77565` |
| `docs/development/testing.md` | ` M` | `a09de8aa31569680f7d259f97ec5c1456beb5bac1f1dd7387a1410aad46fa6b2` | `104212d335760c6189b997a42225860a700ac15d` |
| `docs/development/setup.md` | ` M` | `6aeef5ee152a2e2657ea2e5b4c0c0be9ce6105f688270beb10dd11532381689c` | `70b54416cfe47351b8e8e837b6e352768f057c0a` |
| `docs/architecture/system-diagram.md` | ` M` | `83d9721f6da42a9aded10077d3b0fa61c291977f58114b2e0e37c28809d2384d` | `c0d0a5262783798de1ec5a447f5a0447485aebb0` |
| `services/tts/benchmarks/service_handoff_authority.py` | `clean` | `f443d0e5421fa369f1f03653cf13a519800d554d3ed6651bb1b9e446412ccb56` | `71591a4df6be0c45c26ff5b03a87666b0731a072` |
| `services/tts/tests/test_service_handoff_authority.py` | `clean` | `29e5672ed12338203f0f2c43fb9f5b60afe1f88a1de93562a7343d9a0efa3d83` | `01de84b53d7bc4c4a999acf890f89c7ac42f5a93` |
| `services/tts/benchmarks/preflight.py` | `clean` | `4cc1751af484f4057934f1a152eeccc52133efd01cbb5a4e63974b07fce54a7a` | `611fc7974077eb9407dbe9e6cf4977819597ef76` |
| `services/tts/benchmarks/memory.py` | `clean` | `b9b408be966ec11e1f2835c53e8855617ba583cda3be467f16284f7a738e0141` | `52c3265a0bc948fddd6ad3a45f7f36da275d2a61` |
| `apps/desktop/src-tauri/src/tts_service_supervisor.rs` | `clean` | `ea58307c22d472a59126b8549b29cba6750be253a43b49ffb5b8069af39ce5b0` | `8f52e484c9c3effe0d03f7dc7fdf8cd58387eb60` |
| `apps/desktop/src-tauri/Cargo.toml` | `clean` | `f7589af14b344c827c746e5741a3a5f6d274e8b0643a829ec5a0b3d6971dde09` | `2d119b08ff5c815f3f4926cb2ae6892fddd5bf3b` |
| `apps/desktop/src-tauri/Cargo.lock` | `clean` | `9336f463f36e88f35a81605348387deb063a396177c5369d3f5836b5a8790975` | `ef3f7f1bbc9b1c93e3684e2877c09e89e1b8214e` |
| `benchmarks/tts/service-handoff-profile-v1.json` | `clean` | `1ec39e6bd45064bb8ddd65b43e5ffee76b5a546bb2766f11af2d9c0ee116a2d3` | `36f53e51f35609cb51b9638589c3d0ff43d5fab8` |
| `benchmarks/tts/schemas/service-handoff-result-v1.schema.json` | `clean` | `f8e88a350875b7249a9224809cfe1a250c9f5a1d3155c48e3a7e623047c0e251` | `5a1416db4f6ed2570041e7dbe38d40f2929c690c` |
| `services/tts/pyproject.toml` | `clean` | `f65ca556bd98ac9183c6ce95b05de1873689f22058820f1ff0b16d59fedf3c64` | `45ad2716bb5cbc50662b0f05e22b734fce0542b0` |
| `services/tts/uv.lock` | `clean` | `595916e51b3e3a4a0b1ae58cc7dc4c0a22f6104682be56d13e5d1f82c03259ed` | `bde23dd605da0accfd094b4feae9a3144a1b341d` |
| `package.json` | `clean` | `c034ad183d86e3366988ac7ab1e3d512738b18f1b0c714963fb9f1cbbdc17b36` | `29ff407c2ade383bb10764cd27c763d2689d8ee0` |
| `.gitattributes` | `clean` | `d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4` | `5acf47068be3a84b4e38b502877083e99b5ce0f9` |
| `benchmarks/tts/service-handoff-result-v1-exact-host.json` | `clean` | `e1821579d42e1bccf5c2a3ebaa604c8677960d0df2bdc41a96e6a8c5588c68fe` | `fd621e52b717686a7cf6cd142ba703ddb0746714` |
| `packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json` | `clean` | `b57cf18ab2b6a922d9018f028a7b1002d2916b706f7b574299cb30f2f7600753` | `50d42d674cb32d8a99c3e46589baf5af5123cca6` |
| `services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/uv.lock` | `clean` | `1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913` | `4efd029d7838114a474a326cd2a569340a513ba4` |
| `benchmarks/tts/profile-v3.json` | `clean` | `7d062a4f662ed95b1cb5ff0a21fc40864f4ac3858cea4314ee612b84c2e08dbe` | `639a0600f89d5dfa53e530608cf1236d9f1f4e2d` |
