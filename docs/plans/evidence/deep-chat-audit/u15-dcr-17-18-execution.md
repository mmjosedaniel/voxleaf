# U15 execution evidence

- Receipt: `DCR-U15-EXEC-20261109-01`
- Plan: [Deep Chat Audit Minimal Corrections](../../active/deep-chat-audit-minimal-corrections.md)
- Findings: DCR-17 and DCR-18
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U15/`.

## Cases and scope

- DCR-17 RED: The unchanged legacy v4 runner returned despite measured
  candidate close throwing after its fake process exited, and zero residue.
  GREEN: v13 emits typed cleanup failure and stops subsequent trials after
  uncertain close, including when a primary timeout has already occurred.
  Incomplete runs have a failed non-derivable receipt. Complete records with
  cleanup failure fail both viability conclusions and the cleanup audit even
  when all other metrics pass.
- DCR-18 RED: Real model-free monitor thread remained unsignalled after either
  factory or load failure. The test finalizer signalled and joined it.
  GREEN: Candidate cleanup precedes monitor shutdown, whose bounded join is
  separate from metrics validation. Factory and load failure, partial start
  plus interruption, retained live monitor retry, bad metrics and the normal
  cancellation window are covered.
- Explicit v13 official execution rejects retired/unknown versions before
  acquisition. The candidate lock and v4 matrix stay unchanged. V13 has
  a byte-pinned profile and separate schemas and journal path. CPU admission
  checks a qualifying committed v13 GPU result and cannot use the v4 result.
  Legacy v4 derivation still accepts its original payload and removes only its
  own journal. The committed v4 results and v4 authority files were unchanged.

## Host commands

Normal local PowerShell on Windows NT 10.0.26200.0. RED and final GREEN input
snapshots matched before and after their commands. No historical result was
reused. The test changes after RED add v13 routing and successor controls;
the legacy RED called the real unchanged production path.

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_batch_official.py -k "dcr_17 or dcr_18"
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_benchmark_v13_authority.py
```

| Phase | Outcome |
| --- | --- |
| RED | Exit 1. Three expected behavioral failures, four deselected. |
| Intermediate GREEN | Exit 0. 33 passed on its recorded earlier patch. |
| Final GREEN | Exit 0. 34 passed in 3.17 seconds on the review patch. |
| Scoped static | Ruff formatting applied and lint passed on eight owned Python files, mypy passed on nine sources, pinned pnpm/Prettier passed on three new JSON files. The initial Ruff findings and their repair are retained separately. |

All executions were model-free and used synthetic evidence only. This work
leaves v13 unmeasured. G4 combined integration and G7 repository-wide static
gates remain pending. Independent review is pending.

## Closed reviewed inputs

The first 12 paths comprise the unit patch. The U7 controller/isolation are
previously modified supporting inputs. The rest are unchanged authority,
configuration or test inputs. The staged index remains empty.

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `services/tts/benchmarks/batch_official.py` | ` M` | `59c423b4c6cdfc1009c5ce72c6a4035baa45df52d09ab483826a7fd048325e43` | `76e9f89f0cf959792e0340a4c148fce0cf70da77` |
| `services/tts/benchmarks/batch_cli.py` | ` M` | `8c8e1654226f1755c9af70d3a3437b87a106bf10947dd8e17ebcd0ecb500b2e6` | `8049689f4da5958492aef43d1757211b6c33411c` |
| `services/tts/benchmarks/batch_result.py` | ` M` | `6237a37cc6aac6e3ec340e7008ba496fcbeab62f538e9d51396d0e7fcc0ab3e0` | `06d63f349df625e0efd1ffbc1166b2d9144f893b` |
| `services/tts/benchmarks/batch_result_cli.py` | ` M` | `2576dbf8827f8b45172a08d12309bcb111dbf41a09bb593e86654889087e998e` | `70a7a4079a51acca9727d3e6a13e43e9a54b5e76` |
| `services/tts/benchmarks/v13_authority.py` | `??` | `cc1942110c63ed0906e054a88212f141f6d0662abc173528cbec67a3e4fb83fb` | `b3c9da37e7419f936b01846c479cc812adf36d4e` |
| `services/tts/tests/test_benchmark_batch_official.py` | ` M` | `db6128c9c6af68e203a416eb55f82a190457c15ca072384d7554609f28768069` | `b36ceb046ad05a9326cedf0e63ce704aade7002c` |
| `services/tts/tests/test_benchmark_batch_cli.py` | ` M` | `92980e04d8375428d0d50fd02f636728a2cd0031dcc967e9068d5958fce22dd9` | `ef39a1f83d050606d5761887a835028ca8750f92` |
| `services/tts/tests/test_benchmark_v13_authority.py` | `??` | `ca20675706c505f72bf9438b790ce694c68e04bbeca2c14db0fa1af95263297d` | `a9eeb7d5058f3b679af6a34932489514582ec17a` |
| `benchmarks/tts/profile-v13.json` | `??` | `6eea5f2a688f0298f41a0cc0c48bad3852eca21a83c99ffd9e6bc37479cb3648` | `f35767072c4c14db0f4cdb9ba78cbd74e4346f7b` |
| `benchmarks/tts/schemas/short-segment-batch-raw-v13.schema.json` | `??` | `60ab2b6626fbad23075e54a7b20abf77969856d46e0c60d4047759f51937e6d8` | `d9b571b187e279083ae66b1d9a0a97745f3622e8` |
| `benchmarks/tts/schemas/short-segment-batch-summary-v13.schema.json` | `??` | `b7197252ecf43ad83c9895151d3e7bd7278de80366e244f7ba510453d0e5cd0b` | `a40b33c0123ac2b676f3eb98623c4bba8d61a422` |
| `docs/development/testing.md` | ` M` | `2ad4ed501f2889b4cbb6b5115fc7bb2ba10a206da471dd130a856a144c14c8d4` | `2e7b0afd07cf7972122efce6e331786fa1c56fa1` |
| `services/tts/benchmarks/v4_authority.py` | `clean` | `51f84dd9a984d1b830a71756b6f7be354fb9aace85b0fa6409ea2a1e95e6f961` | `58776c61d12a819b16a622c0b290f4088abeb345` |
| `services/tts/benchmarks/batch_execution.py` | ` M` | `3a6737d8cc65615c9fd4a8176d754e98532890dac98a60e2c7fb8c66210bbb25` | `105cc9352420b04f0169194265097ba4aefe1400` |
| `services/tts/benchmarks/isolation.py` | ` M` | `e97fae4e9aa969b0e45f0524e86103c9b88d03a1aaa8031081523dd027a5d4ee` | `221b30cefa2d579e16ecccf5b7ebb4197828b089` |
| `services/tts/tests/test_benchmark_v4_authority.py` | `clean` | `da5350d4ffa0d8eb7755d013ee5d17f6eae727c29afc0e562f9f797649cb237d` | `c9e872cf84de5b12358b617db9c20c776b050b8b` |
| `benchmarks/tts/profile-v4.json` | `clean` | `836895786f4cc041ce1b3818a5f74635cbc1edcd1e2a57f3ebddf84bd1ed3b68` | `b628bf82499db10c2a2fa0a6621bdbd6bd868536` |
| `benchmarks/tts/corpus-v4.json` | `clean` | `3dcb30ab07bc5796175137f956ab7c910f306cd2f39fa6fe30d05deca1eccd8e` | `efdd67bf522767c4d0f128062217eb2cdbe9e677` |
| `benchmarks/tts/short-segment-batch-result-v4.json` | `clean` | `9ce8141fa5987878ab29bf472f6f16dc3a6370dd4ffcc1141b30964914c62e32` | `41ccae1c291d70f98dddab5f32aa870e5c9d17e3` |
| `benchmarks/tts/short-segment-batch-result-v4-cpu.json` | `clean` | `d3766ae87bdebc806210d04d974081b6f79f976bf9793a184c4d021273f85234` | `2afbeef2297b6022835d0f3b61d3c56444490745` |
| `benchmarks/tts/schemas/short-segment-batch-raw-v4.schema.json` | `clean` | `c793be6d97523f866ea263960f13c981a693fca8e819966ec1b867cac9507f82` | `5c83dfade49b2aeeffbce4a2c87425cd1d7d681c` |
| `benchmarks/tts/schemas/short-segment-batch-summary-v4.schema.json` | `clean` | `2abb279fad5bc9f65f85ce21a6e56c7e8ee61550b5a7c14592ad0826fc4f101a` | `3e2677c1f43b06a6dc328e38b0c87f4331c75433` |
| `services/tts/pyproject.toml` | `clean` | `f65ca556bd98ac9183c6ce95b05de1873689f22058820f1ff0b16d59fedf3c64` | `45ad2716bb5cbc50662b0f05e22b734fce0542b0` |
| `services/tts/uv.lock` | `clean` | `595916e51b3e3a4a0b1ae58cc7dc4c0a22f6104682be56d13e5d1f82c03259ed` | `bde23dd605da0accfd094b4feae9a3144a1b341d` |
| `services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/uv.lock` | `clean` | `1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913` | `4efd029d7838114a474a326cd2a569340a513ba4` |
| `package.json` | `clean` | `c034ad183d86e3366988ac7ab1e3d512738b18f1b0c714963fb9f1cbbdc17b36` | `29ff407c2ade383bb10764cd27c763d2689d8ee0` |
| `.gitattributes` | `clean` | `d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4` | `5acf47068be3a84b4e38b502877083e99b5ce0f9` |

Host tools: uv 0.11.29 (901092ee1 2026-07-15 x86_64-pc-windows-msvc), Python 3.12.10, PowerShell 7.6.9, pytest 9.1.1.
