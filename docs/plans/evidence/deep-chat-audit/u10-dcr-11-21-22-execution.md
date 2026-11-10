# U10 execution evidence

- Receipt: `DCR-U10-EXEC-20261109-01`
- Plan: [Deep Chat Audit Minimal Corrections](../../active/deep-chat-audit-minimal-corrections.md)
- Findings: DCR-21, DCR-22 and the Python handoff caller of DCR-11
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U10/`.

## Cases and scope

- DCR-21: The unchanged Python runner outwaited the fixture watchdog and
  eventually reported only native process failure. V2 uses one absolute
  watchdog, a bounded output line reader and queue, a maximum record count,
  and bounded reap/join. Tests cover a silent child, trickle/flood/oversized
  output and a reader retained by an independently held pipe. The primary
  deadline survives incomplete reader cleanup. Existing setup-acquisition
  failure/reap controls pass.
- DCR-22: The unchanged native boundary advanced after 50 ms with no
  acknowledgement. V2 gates service launch on an exact version handshake.
  After minimum quiescence it emits an ordered cleanup-ready record and
  waits for its matching acknowledgement before restart or final result.
  The observer verifies fresh zero child, RAM and dedicated/shared VRAM
  samples. Tests exercise a real delayed native pipe, all four ordered
  boundaries, replay, wrong sequence/version, EOF, oversized input, timeout
  and withheld acknowledgement for unknown/nonzero cleanup observations.
- DCR-11: The handoff caller accepted a restricted TCP/443 rule. It now
  delegates to the existing effective-policy probe. Real PowerShell
  synthetic cmdlet tests verify canonical admission and restricted rejection
  without host firewall mutation.
- The frozen v1 result and authority remain unchanged. V2 has a separate
  pinned profile/schema and four closed cleanup receipts. Python and
  Rust tests exercise the private observer exchange with synthetic data.
  No hardware run was made and v2 remains unmeasured.

## Host commands

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_service_handoff_cli.py -k "dcr_21 or dcr_11"
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml dcr_22_native_holds_cleanup_boundary
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_service_handoff_cli.py services/tts/tests/test_service_handoff_authority.py services/tts/tests/test_service_handoff_v2_authority.py
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_handoff::tests
```

| Phase | Outcome |
| --- | --- |
| RED Python | Exit 1. Two intended failures, 12 deselected, on unchanged production. |
| RED Rust | Exit 101. Real disposable Rust fixture observed its successor before acknowledgement. |
| First candidate | Python 36 passed, one fixture assertion failed because pytest included the cleanup note in its exception regex. Native selection passed. This is retained separately. |
| Intermediate | Both behaviors passed, but scoped mypy rejected IO and test import annotations. A subsequent static-only run found one formatting issue. |
| Final GREEN Python | Exit 0. 38 passed, including real subprocess, retained reader and v1/v2 authority controls. |
| Final GREEN Rust | Exit 0. Six passed and one standalone fixture was ignored. The real-pipe test executed that fixture in a disposable test subprocess. |
| Scoped static | Ruff format/lint passed on four Python files, mypy passed on five sources. Scoped Rustfmt and pinned pnpm/Prettier passed on the unchanged native/JSON inputs. |

Normal local PowerShell on Windows. Host/tool versions and before/after
identities are retained in the raw receipts. RED and exact final GREEN
snapshots match within each run. No historical PASS was reused. G4/G5/G7 and
independent acceptance remain pending.

## Closed reviewed inputs

The first 12 paths comprise the unit patch. The remainder include unchanged
direct controls, frozen authorities, fixtures and configuration. The final
three support rows were captured at review handoff and match their HEAD blobs.
The staged index remains empty.

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `services/tts/benchmarks/service_handoff_cli.py` | ` M` | `15d97e5001456e0bace441aef5833e7e69d49b0d1578e98fe9050e6a5f64626a` | `b28a46aacd0f2663fcab02962aa1942ed6f6eb0f` |
| `services/tts/tests/test_service_handoff_cli.py` | ` M` | `f2b7adfa68c7c53161eb9cbc70f92bacb51a7f79f4ba6e6ca929b07aed6e7483` | `422b99bdc664224da5e378d6b6ad755aa25a871e` |
| `services/tts/benchmarks/service_handoff_v2_authority.py` | `??` | `7af845f6a861126c7a1063c9c7f846b1dde58a405a4742bc9b5d660835c2f683` | `dfd755ecd8fdd1df9714c6eb1bbf987d37dab217` |
| `services/tts/tests/test_service_handoff_v2_authority.py` | `??` | `dbeaf6fce52a15772e894f18a818eac08945bed7fe97cc07070cbeded2f6492a` | `a98d096f830617035f84aa53d695a289714ef692` |
| `apps/desktop/src-tauri/src/tts_service_handoff.rs` | ` M` | `34d9f5034ff12bd3f45fda228636e9d2253072cab460c5b241fe7b1a3b9574d8` | `dad5ab3d0f9b354d95467a38e88f76ac04a0ede6` |
| `apps/desktop/src-tauri/src/tts_service_handoff/tests.rs` | ` M` | `2b713d26ad882035f64e29182b4283648b565bc5677220993adfa20e5ff2d131` | `ee746525b63f459ef5753786358f55af5cafdf65` |
| `apps/desktop/src-tauri/src/diagnostics/cli.rs` | ` M` | `5543a1ae31c33ea920d8e65aa1b37ef18c3be041f2a83bd022036c7251f325c1` | `6e1d65bf20ada635776e1131c264f3d483b858b2` |
| `benchmarks/tts/service-handoff-profile-v2.json` | `??` | `f7b31605accc1cd2a7b8a730e15de05732178b4414ce1a1ba4fe307e20702393` | `f12a6a3061943ac8d0020fc7e216957882ac5b77` |
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

Host tools: uv 0.11.29 (901092ee1 2026-07-15 x86_64-pc-windows-msvc), Python 3.12.10, cargo 1.97.1 (c980f4866 2026-06-30), rustc 1.97.1 (8bab26f4f 2026-07-14), PowerShell 7.6.9, pytest 9.1.1.
