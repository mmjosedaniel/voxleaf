# U15 revision 2 execution evidence

- Receipt: `DCR-U15-EXEC-20261109-02`
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- [Initial execution](u15-dcr-17-18-execution.md) and [R1 findings](review-U15-R1.md).
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U15/`.

## Corrections and host results

- U15-F1: The new test exercised the real runner with an adapter
  `load-failed` followed by failed monitor shutdown. The unchanged R1 patch
  reported `internal`. The corrected runner preserves recognized adapter and
  batch failure codes and emits the independent cleanup code. The receipt
  remains ineligible for derivation.
- U15-F2: The test committed a synthetic GPU result without its required
  `coldLoads` field. The R1 implementation admitted that record. Admission
  now requires complete pinned v13 schema validation as well as a qualifying
  stop and clean audits. The candidate calls the base CLI with bounded
  `uv run --offline --no-sync --locked` execution before model acquisition.
  The base subprocess control ran for real. The synthetic committed, missing,
  invalid, uncommitted and digest-mismatch controls remain model-free.

```powershell
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_benchmark_v13_authority.py -k "preserves_adapter_primary or cpu_admission_requires_own"
uv run --project services/tts --locked pytest -p no:cacheprovider services/tts/tests/test_benchmark_batch_official.py services/tts/tests/test_benchmark_batch_cli.py services/tts/tests/test_benchmark_v4_authority.py services/tts/tests/test_benchmark_v13_authority.py
```

Local PowerShell correction RED exited 1 with both intended failures and 33
deselected. The first corrected selection passed 36 tests, and its scoped
mypy check rejected one inferred literal assignment. The final run on the
explicitly typed patch passed 36 tests in 3.48 seconds. Scoped Ruff format and
lint checks passed on eight Python files and mypy passed on nine sources.
Before and after host snapshots matched for each recorded test command. The
v13 JSON inputs are identical to the initial scoped Prettier run. Final G4/G7
integration remains pending. No hardware result was created.

## Closed reviewed inputs

The first 12 paths comprise the unit patch. Supporting inputs include U7's
locally reviewed implementation and unchanged v4 authorities and configuration.
The staged index remains empty.

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `services/tts/benchmarks/batch_official.py` | ` M` | `c551507fc85ee53670cad21db716c11bbf7e13f865c65fa0a18edb9f9e6fd579` | `ef2e2dea690089cd56b795fa228fc81240d94180` |
| `services/tts/benchmarks/batch_cli.py` | ` M` | `5d44273d7a7c275ed6994f35a2660f7fbda1eeaa265f4663c78bc01f3d765dd6` | `513df05523e26baef3963b9156f29052ea28a1d4` |
| `services/tts/benchmarks/batch_result.py` | ` M` | `6237a37cc6aac6e3ec340e7008ba496fcbeab62f538e9d51396d0e7fcc0ab3e0` | `06d63f349df625e0efd1ffbc1166b2d9144f893b` |
| `services/tts/benchmarks/batch_result_cli.py` | ` M` | `65152b7eaf38e85f5b22c7ad2bccb112289c3a649d15eb523b8fc25d595d9044` | `5e4995473975fc2fb00e103940d797a7ccc8f789` |
| `services/tts/benchmarks/v13_authority.py` | `??` | `11227cdccf3faf1c4e3b3f3ad8efb94bbdafd737a15850e4878018978609f80f` | `68b21e8114a283a511cb341f4e0c8223c6747c63` |
| `services/tts/tests/test_benchmark_batch_official.py` | ` M` | `c9d9716aae385ac52cae5163756f870611805b676f36e9ad21ab57770a5e044f` | `3611e314ea884dc8bee7c1ca9f5f4ac212152e71` |
| `services/tts/tests/test_benchmark_batch_cli.py` | ` M` | `92980e04d8375428d0d50fd02f636728a2cd0031dcc967e9068d5958fce22dd9` | `ef39a1f83d050606d5761887a835028ca8750f92` |
| `services/tts/tests/test_benchmark_v13_authority.py` | `??` | `bad1d8c407a646ff3da41e279c949873ed98e1e65570f0d44d9a3e497a6eafe3` | `f37d603cffcd5afe7c14a5ccb78106cc4d4ec248` |
| `benchmarks/tts/profile-v13.json` | `??` | `6eea5f2a688f0298f41a0cc0c48bad3852eca21a83c99ffd9e6bc37479cb3648` | `f35767072c4c14db0f4cdb9ba78cbd74e4346f7b` |
| `benchmarks/tts/schemas/short-segment-batch-raw-v13.schema.json` | `??` | `60ab2b6626fbad23075e54a7b20abf77969856d46e0c60d4047759f51937e6d8` | `d9b571b187e279083ae66b1d9a0a97745f3622e8` |
| `benchmarks/tts/schemas/short-segment-batch-summary-v13.schema.json` | `??` | `b7197252ecf43ad83c9895151d3e7bd7278de80366e244f7ba510453d0e5cd0b` | `a40b33c0123ac2b676f3eb98623c4bba8d61a422` |
| `docs/development/testing.md` | ` M` | `aca9526d771fc4a4be148fcf834a995b866b9a061c4d42614220c6fc56eb693f` | `dd87d87bc8b4e02e9b382ee68a9ffd7212b3646e` |
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
