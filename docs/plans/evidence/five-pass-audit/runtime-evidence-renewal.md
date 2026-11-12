# Final Python and Rust evidence renewal

Status: all selected commands pass; integrated review pending. These receipts
supersede the earlier G3/G5 and corresponding Python/Rust static results for
final acceptance. No product source changed and no broader test suite was added.

Read-only preparation found that the earlier Python capture bound the service
environment and interpreter binaries but omitted the base installation's
standard-library files. The earlier Rust capture bound source, tools and executed
test binaries but omitted Cargo registry sources and reused dependency artifacts.
No actual drift was observed. The same selected gates were rerun with expanded
captures instead of inferring missing original provenance.

## Executed checks

Normal local PowerShell outside the sandbox, pinned Node24.18.0, pnpm11.15.1,
uv0.11.29, Python3.12.10 and Rust/Cargo1.97.1;2026-11-12 UTC. HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty. Native execution
was paused and G9 had not started.

| Exact selection | Start–end UTC | Result |
| --- | --- | --- |
| [Same18-suite G3 pytest command](final-gates-preparation.md#g3-python-union) | 02:27:40.810–02:28:23.108 | Exit0,333 passed; existing pytest cache permission warning retained |
| `pnpm.cmd format:check:python` | 02:28:53.226–02:28:53.918 | Exit0,192 files |
| `pnpm.cmd lint:python` | 02:28:55.868–02:28:56.249 | Exit0 |
| `pnpm.cmd typecheck:python` | 02:28:58.168–02:28:58.896 | Exit0,188 source files |
| Root inventory Ruff format/check and mypy commands below | 02:29:03.528–02:29:07.644 | All exit0,two files each |
| `pnpm.cmd format:check:rust` | 02:29:37.557–02:29:38.252 | Exit0 |
| `cargo.exe test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests` | 02:29:39.062–02:29:47.709 | Exit0,78 passed,3 ignored,117 filtered |
| `cargo.exe test --manifest-path apps/desktop/src-tauri/Cargo.toml --features release-locked-runtime tts_optional_chatterbox::tests` | 02:29:48.566–02:29:56.397 | Exit0,78 passed,3 ignored,116 filtered |
| `pnpm.cmd lint:rust` | 02:29:57.223–02:30:03.634 | Exit0,both configured feature modes |

```powershell
uv.exe run --project services/tts --locked ruff format --check scripts/release_inventory.py services/tts/tests/test_release_dependency_graphs.py
uv.exe run --project services/tts --locked ruff check --target-version py312 scripts/release_inventory.py services/tts/tests/test_release_dependency_graphs.py
uv.exe run --project services/tts --locked mypy --config-file services/tts/pyproject.toml scripts/release_inventory.py services/tts/tests/test_release_dependency_graphs.py
```

## Source, runtime and cached-artifact identities

Every command's paired source/environment capture matches. Python has2,645 rows,
including the complete installed service environment and a hash-bound expanded
runtime manifest. Each Python group also has4,896 unchanged base-runtime/config
rows, with actual standard library, interpreter files, discovered Git configs
and relevant process-local environment. Derived Python cache files are excluded.
The three groups use distinct immutable environment/root/output receipts.

Rust has868 unchanged source/tool/emitted-input rows plus12,675 unchanged rows
for Windows-filtered locked/offline Cargo metadata and registry sources, actual
toolchain bin/lib trees, ancestor/user configuration presence or absence, MSVC
tools and Git/environment inputs. The separate4,407-row capture of reused
dependency artifacts, build outputs and fingerprints also matches exactly before
and after the whole group; no cached row changed. Each actual test executable
was hashed immediately after its command, before the next feature-mode command.

| Group | Command input SHA-256 | Expanded runtime SHA-256 |
| --- | --- | --- |
| G3 | `43CC633213DC42E660A1123B5744B5B56CA902BC479446B5B0D3DB98A90FB5C7` | `D1A65F5DB88FCFB21C4221FDFFEE04B20B39236FF29BFA03A2060D9377AB86AD` |
| Python static | `B8E95676F2B046D818B8B3225FF3FBFA3530B26E4E78C4402F08C65562FFFB6F` | `094353987E7E02CDB5DA056812545B883B87222181BA60A4B3016EB1EFA74E16` |
| Inventory static | `D536E66653165747830D100AB2E58D2B9D0331AFF786D670C25048CB3D5C589C` | `058FF6C06355F4D504ECD54DEA3B179B353B09A6D72900C18F83E8C8C3E7B68C` |
| Rust tests/static | `3F7B933F57E3710B3A2462A1AFAFE73D4CD7356E3BFA09ECA44A4A50F7962C4D` | `DBE890CA98A7DCE09C30891A0CF446AD89C1B06EE826C2ACC851D2CE56DF603A` |

Rust cached-dependency manifest SHA-256:
`4D643518CA0AFD56028F9027074757EDD457FE9C5832DD8F149FC51765E43147`.
The executed default test binary is11,948,544bytes, SHA-256
`4A536109E0F5B392949D5C54EE9D6F03386C4C35154F458E4CCE79018DE728FB`;
release-locked test binary is11,650,048bytes, SHA-256
`A58ED90E6F14AC0F786C8E373CB7A7B561E750DECBEB669E4F9CE3AE10D4F67F`.
Ignored `final-runtime-closure-02.json` SHA-256:
`F244901EEFC71B551884C4DB9F6D62458E586C51F250F0AAD0DA3A9D055CEC86`.

## Logs

All basenames below are under ignored `tmp/evidence/five-pass-audit/`; each has
its own result JSON and paired input manifests.

| Log basename | SHA-256 |
| --- | --- |
| `g3-final-02.log` | `4BE256B531D08189A8377C94424119FDA1A86B558848B9C653DB7466D7B76E82` |
| `g11-python-format-final-02.log` | `6F63BCD13DBAC2F9B4F58704D0104D07518C9B58E9566581FBED328B25A606A4` |
| `g11-python-lint-final-02.log` | `F96C78E2151A13DEF2352FB3664BCC427F97BA61D14BECB9757835EB81DE7BA0` |
| `g11-python-types-final-02.log` | `A239F33917F7D4F509015F31428DDC7F9399CC66CA0A822E1F15E9ACF68285EF` |
| `g11-inventory-format-final-02.log` | `97D85B4B6C185A05396E2D09A3C304FF0F7CC77F8B7B7BB7989EC6CD875B3898` |
| `g11-inventory-lint-final-02.log` | `A4443AFDCFB6D7363ADB285762515CCF7CF50473B1A05C20C1A50F6BED4D26B0` |
| `g11-inventory-types-final-02.log` | `0C37C4158C91EF55C724BA017BF6465F26018199BADB08E3FF13F98ACDF056C2` |
| `g11-rust-format-final-02.log` | `709F090C04253BE00FFD67ED8B3772DDB8589DA29932B204033FEECC01EA3B8F` |
| `g5-default-final-02.log` | `CF58C6C461D05DB6E7FC7437249B2C335290DB0FAE2ACC5F881C62811D0020F3` |
| `g5-locked-final-02.log` | `557034089872037A97EDBB4F0D7AB21643FFB068FA33AE705E4513EB357355E0` |
| `g11-rust-lint-final-02.log` | `9F8A10D69DFDEE1B523A4D3A16506BF41A3E44B3A821635FB0877ACF2010057D` |
