# Successor preparation host evidence

Evidence ID: CB-V3-HOST-01-20261006.
Base/HEAD: `30fd57b91817817dba62d81ee6494bf3f46d8464`.
Scope: additive v3 build preparation; no native admission or publication claim.
All commands ran in normal local PowerShell outside the automation sandbox.
The original published v2 graph still fails its production dependency audit.

## Reproduction and candidate selection

`pnpm.cmd audit:release` initially failed the exact Rust informational-warning
comparison on this PR and preceding main. RustSec's ten withdrawn GTK notices
were removed from the expected set, preserving all seven active notices and
the same five Windows-reachable notices. No Rust vulnerability was ignored.
The command then passed Node, Rust, base Python and Piper, and exited 1 on five
Chatterbox Python advisories: PYSEC-2026-3929/4174 (Transformers 5.5.0) and
PYSEC-2026-4175/4176/4177 (urllib3 2.7.0).

Candidate Transformers 5.10.4 was rejected despite zero registry findings: its
custom-generation code still fetched executable modules before checking trust.
Upstream commit `cbc1651a032b923da7f4b44b3d0e6f68e6ba6b55` repairs that order;
GitHub comparison confirmed v5.17.0 contains it. Its package metadata requires
Tokenizers >=0.23.1,<0.24.0, so the bounded successor changes exactly three pins:
Transformers 5.17.0, Tokenizers 0.23.1 and urllib3 2.8.0. The other 76 complete
lock blocks, including hashes, are unchanged.

Primary references: [custom-generation advisory](https://github.com/advisories/GHSA-x9r9-c232-4q39),
[template advisory](https://github.com/advisories/GHSA-xrqw-3rrv-vx5w),
[upstream ordering repair](https://github.com/huggingface/transformers/commit/cbc1651a032b923da7f4b44b3d0e6f68e6ba6b55),
and [urllib3 bounded chunk-line repair](https://github.com/urllib3/urllib3/security/advisories/GHSA-vxq7-64xx-v4gw).

The pre-change 5.5.0 environment fails the local template-containment probe
with `unsafe-template-name-accepted` (exit 1). The retained successor probe
exercises three unsafe template names, a legitimate named-template control,
remote/local untrusted custom generation before fetch/import, and an explicit
trusted control. It does not execute remote source or use real book content.

## Deterministic checks

The implementation worker reports these commands on the final eight-path source
patch. Director additionally ran the full TypeScript format and inventory checks.
All exits below are 0 unless stated otherwise.

| Command | Result |
| --- | --- |
| `uv pip compile services/tts/release/profiles/chatterbox-v3/requirements.in --python-version 3.12 --python-platform windows --no-deps --generate-hashes --exclude-newer 2026-10-07T00:00:00Z --output-file services/tts/release/profiles/chatterbox-v3/requirements.lock --quiet` | Generated exact 79-package lock |
| `pnpm.cmd package:chatterbox-optional:v3:write-source` | Generated successor source manifest |
| `pnpm.cmd test:python` | 399 passed; 13 added regressions; all 18 historical release tests retained |
| `pnpm.cmd lint:python` | Passed |
| `pnpm.cmd typecheck:python` | 159 files passed |
| `pnpm.cmd format:check:python` | 159 files passed |
| `pnpm.cmd format:check:typescript` | Passed |
| `pnpm.cmd package:chatterbox-optional:check-source` | Historical v2 source passed |
| `pnpm.cmd package:chatterbox-optional:check-acquisition` | Historical v2 acquisition/evidence passed |
| `pnpm.cmd package:chatterbox-optional:v3:check-source` | Successor source passed |
| `pnpm.cmd inventory:release:check` | Existing published inventory unchanged/current |
| `git diff --check` | Passed |

`uv run --project services/tts --locked ruff check --config services/tts/pyproject.toml scripts/test-chatterbox-dependency-security.py`
and
`uv run --project services/tts --locked ruff format --config services/tts/pyproject.toml --check scripts/test-chatterbox-dependency-security.py`
also exited 0. The standalone script is outside normal service check targets.
Pytest emitted the existing
nonfatal cache-write permission warning. No test or scanner was disabled.

`uvx --from pip-audit==2.10.1 pip-audit --disable-pip --no-deps --requirement services/tts/release/profiles/chatterbox-v3/requirements.lock --format json --output tmp/chatterbox-security-refresh/v3-audit.json`
exited 0: 79 entries, zero known findings, and four explicit URL-package blind
spots (`chatterbox-tts`, `resemble-perth`, `torch`, `torchaudio`). Cache entries
that failed deserialization were ignored by the tool; the command completed
normally. This is a candidate audit, not a pass for the still-admitted v2 graph.

## Exact successor artifact

The reviewed builder and source inputs were copied to a task-owned short-path
mirror because conventional Windows paths otherwise exceeded 260 characters.
The ignored local pointer is `tmp/chatterbox-security-refresh/mirror-path.txt`.
Its private absolute path is deliberately omitted here. No live installation,
model data or historical authority was changed. The source mirror contains the
same reviewed files; it is not an independent code fork.
Host SHA-256 comparison confirmed all 17 builder, manifest, lock, notice,
licence and runtime-module inputs match the repository.

With `PYTHONPATH` set only to that mirror's `services/tts/src` and
`PYTHONDONTWRITEBYTECODE=1`, the repository development interpreter ran:

```text
python -m voxleaf_tts.release_chatterbox build --package-version 3
```

This initial build created a separate environment and synchronized all 79
packages with `uv pip sync --require-hashes`, verified the complete assembled
tree, and generated the archive plus bounded parts. Exit 0.

| Artifact property | Measured value |
| --- | --- |
| Runtime files | 13,084 |
| Runtime installed bytes | 5,027,425,801 |
| Runtime archive bytes | 5,030,981,677 |
| Archive SHA-256 | `87bfb2baae44cf13daae15328f8287cbee60e6782f04735d814d2ed849e8c45c` |
| Runtime-manifest SHA-256 | `470ec7e8a6fa1e91f9831e42de7988249220b51d4ecd4352452f3c70b2b6084a` |
| Part 001 bytes / SHA-256 | 1,900,000,000 / `b7d4939d4b862b8f4d5ebafcba3289716f27641b846598032b8426a3d7c44196` |
| Part 002 bytes / SHA-256 | 1,900,000,000 / `a882c2e06b6de1dd690328fe7793aa99ef03ac53f510e06be1740dad4e839c3d` |
| Part 003 bytes / SHA-256 | 1,230,981,677 / `11c2a048187cf501c6ccf6a8ae288d6a7c14fb7e1cc5aedf7a10b0da228f1606` |

Part filenames are `voxleaf-chatterbox-runtime-v3.zip.part-001` through `003`.
The package has its own schema-2/version-3 runtime manifest and includes both
generated VoxLeaf protocol modules plus the exact Tokenizers licence. These
are new candidate identities and do not replace any published v2 asset.

## Embedded execution

The exact assembled `voxleaf-chatterbox-v3/runtime/python.exe` ran each probe
with `-s`, no `PYTHONPATH`, `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`,
`HF_HUB_DISABLE_TELEMETRY=1`, `PYTHONNOUSERSITE=1`,
`PYTHONDONTWRITEBYTECODE=1` and `PYTHONUTF8=1`. Numba/Hugging Face caches were
redirected into task-owned directories outside the verified runtime tree.

`scripts/test-chatterbox-dependency-security.py` exited 0: seven passed,
zero counted socket attempts, and exact 5.17.0/0.23.1/2.8.0 version assertions.

The ignored synthetic adapter helper
`tmp/chatterbox-security-refresh/smoke.py` (SHA-256
`4406e5ddb1afa0489c9fb70aa449f3384f6c7a337ea5406c9d913ce2a3d9a4ac`)
ran with `--language es` and then `--language en`, using the existing verified
six model files read-only via its `--models` argument. Both exited 0.

| Language | Load + warm seconds | Finite, nonzero mono 24-kHz f32 PCM | Cancel ms | Socket attempts |
| --- | --- | --- | --- | --- |
| Spanish | 44.203 | 410,880 bytes / 4.28 seconds | 406 | 0 |
| English | 22.766 | 326,400 bytes / 3.4 seconds | 359 | 0 |

The helper verifies the protocol payload bound, releases the result, then
cancels a second operation and verifies no active/settleable operation remains.
It never saves PCM. Its socket guard and direct-adapter checks are not an
OS-wide network/filesystem observation, framed-service test, listening approval,
general performance claim or ordinary installed-application journey.
Nonfatal existing Diffusers/Torch deprecation warnings and an offline Cangjie
cache warning occurred; Spanish and English synthesis completed successfully.

## Remaining gates

Post-inference full-tree verification passed with the same runtime manifest
and all 13,084 files intact. A second independent staging/archive assembly with
`python -m voxleaf_tts.release_chatterbox build --package-version 3 --no-sync`
exited 0 using the already hash-synchronized environment. Its archive, manifest,
all three part hashes, sizes, file count and installed size exactly match build
1 above. This proves repeatable assembly on this host; it does not claim an
independent-host or fresh-resolution reproducibility result.

Independent change review, publication of new immutable assets,
native v3 admission, inventory/licence refresh, normal acquisition/lifecycle,
Piper-after-removal validation and final production audit/CI remain open.
The original refactor remains accepted; this evidence does not close its newly
exposed release-security follow-up. Qwen3 remains deferred.
