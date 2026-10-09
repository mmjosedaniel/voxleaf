# Change Review Report

Review ID: **CB-V3-PREP-REVIEW-01-20261006**

Task ID: Chatterbox security dependency refresh — additive v3 build preparation

Verdict: **APPROVE**

Base commit and reviewed HEAD: `30fd57b91817817dba62d81ee6494bf3f46d8464`

Approval applies only to the frozen preparation unit. It does not establish production remediation, native v3 admission, publication readiness, or installed-application acceptance.

**Reviewed paths and identities**

The closed scope comprises the 37 entries in `tmp/chatterbox-security-refresh/review-identities.json`, SHA-256 `a03ea65630bb0af2537275b79267ea82acdde168c140685287e947f8d8378623`, plus the 11 unchanged supporting paths below. The supplied manifest records exact porcelain status, SHA-256, filter-aware blob identity, and ownership. It covers all 15 task-owned changed/new files; no pre-existing user changes were included.

All supplemental paths have empty porcelain status.

| Supporting path | SHA-256 | Filter-aware blob |
|---|---|---|
| `docs/product/mvp.md` | `1e617120a6ed7705238d898976985d5e5dffb419adcb0b51f4fcf3258af57130` | `875ac0d1bf4cf23832e58fb9ab827f8a19f825c1` |
| `docs/architecture/overview.md` | `900e508867859c501dd162449cb5b7e771949cfe7520d1f55fbdcd8ffae7a78e` | `f6dc85026d2a18e8a915a36d96ed084963e2f8a4` |
| `docs/architecture/system-diagram.md` | `6e29e71cffb8ec3140161f89942e96438efbb1af64c64323aa1ec0b0a55376e6` | `39f218fde7f1668d94caa649084724e8ca09b42e` |
| `docs/architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md` | `740c2f45c112ee57f219f75bae6ebd896f9111e96588d40d6fbc54e57de3681d` | `8b0cdb7aefff089741641dc73889b50f17975039` |
| `docs/architecture/decisions/ADR-0050-promote-ordinary-chatterbox-acquisition-and-retire-validation-overlay.md` | `3253570eb17b690dfe48b531f4ff9081c95fbed160fa71c261befde157fa2c20` | `336a9ac220b3c3c6cd4050e60e9e9b46ba8a6a5d` |
| `docs/architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md` | `fcb60ff743e7d8500c13ad003e7b9a12ac90862f7be75827f6dc22d3665d4a68` | `0a6cc045930bc8973a73a91c088e21555fc23467` |
| `docs/development/release-security-and-distribution.md` | `c7b01338cdb511ff250da43ae2acaa2879a5da8678ae54a84f63ef88de434703` | `b84ce7dfc9d36356b451eb47a7dca4c543381da2` |
| `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` | `e02fd10202bad689364292789b207bc72b9cbef0401cd6b0c5d16183fd0619b2` | `a46135b67753fac68307cb5ff64bca8681c83bd5` |
| `services/tts/src/voxleaf_tts/release_core.py` | `498926f8fd11fe496e5acb9ffcaec3fff0758567dbc4f04947701ab03942ecf0` | `edf28d6f71ea43fdc88e1c10eb51a93c8af3fb07` |
| `services/tts/tests/test_release_core.py` | `8529da0826b6153bc7ac20d50b210667d106b581625f62863f56433711d09674` | `4c6470fe3941442794a3ccb773664561dd0dc0b1` |
| `LICENSE` | `84525c1977bb79a54c3b70677da4f29e9a5c92adfdc76d3a3f7d8f7d994adc64` | `4ad22e058cd420b950b3e0017169013af24e4112` |

**Identity recheck: PASS**

Starting and ending HEAD match the stated base. All 37 supplied identities matched on initial and final inspection; all 11 supplemental identities remained unchanged. The index is empty. Final status still contains exactly the 15 task-owned paths.

**Acceptance review**

- Independently compared the actual patch, new source/configuration files, dependency blocks, existing and added tests, direct builder callers, runtime imports, and supplied evidence.
- The 79-package successor lock changes exactly Tokenizers to `0.23.1`, Transformers to `5.17.0`, and urllib3 to `2.8.0`. The other 76 requirement/hash blocks are unchanged, excluding generated provenance comments.
- Default commands retain v2 behavior. Explicit v3 selection uses separate source, lock, environment, staging, runtime-manifest, archive, and part identities. V3 acquisition checking and historical-evidence reconciliation are rejected.
- The generated source derives unchanged Python, six-model, profile, platform, and provenance authority from v2 and binds the successor lock hash. Its nine-module closure includes both generated protocol modules required by the service.
- The exact Tokenizers licence is included only in v3. Missing, altered, or mismatched-wheel licence closure fails before notice copying. The existing Piper packaging exclusion continues to omit release builders.
- Existing historical test assertions remain intact. The 13 added cases cover output isolation, bounded pin changes, deterministic source generation, provenance/module/lock drift, archive identity, runtime tampering, licence failures, and v2 licence independence.
- The Rust policy patch removes only the ten withdrawn informational notices; seven active entries, five Windows-reachable entries, vulnerability rejection, and four Python audit blind spots remain. RustSec independently confirms the GTK advisory withdrawal. [RustSec record](https://rustsec.org/advisories/RUSTSEC-2024-0415.html).
- Inspection of the assembled Transformers implementation confirms trust checking precedes custom-module download/import, consistent with the referenced upstream repair and retained negative/control probes. [Upstream repair](https://github.com/huggingface/transformers/commit/cbc1651a032b923da7f4b44b3d0e6f68e6ba6b55).
- No native admission, protocol, reader locator, synchronization, persistence, model, or production-v2 authority changes occur in this preparation unit. The existing system diagram remains applicable.

**Test evidence reviewed**

Evidence is attributed to the implementation worker, director, and independent baseline validator. I did not execute tests, builds, formatters, generators, or model inference.

The frozen `CB-V3-HOST-01-20261006` record supplies exact commands, execution conditions, outcomes, and artifact identities for the reviewed patch:

| Supplied host check | Outcome |
|---|---|
| `pnpm.cmd test:python` | Exit 0; 399 passed, including all 18 historical builder cases and 13 additions |
| `pnpm.cmd lint:python` | Exit 0 |
| `pnpm.cmd typecheck:python` | Exit 0; 159 files |
| `pnpm.cmd format:check:python` | Exit 0; 159 files |
| `pnpm.cmd format:check:typescript` | Exit 0 |
| V2 source/acquisition and v3 source commands | Exit 0 |
| Standalone security-probe Ruff check and format check | Exit 0 |
| `pnpm.cmd inventory:release:check` | Exit 0; existing production inventory retained |
| `git diff --check` | Exit 0 |
| Exact successor `pip-audit` command | Exit 0; 79 entries, zero known findings, four disclosed URL-package blind spots |
| Embedded successor security probe | Exit 0; seven cases, exact dependency versions, zero counted socket attempts |
| Embedded Spanish/English adapter probes | Exit 0; finite nonzero bounded PCM, queued-work cancellation and cleanup |
| Two successor staging/archive assemblies | Exit 0; matching archive, runtime-manifest, part hashes and measurements |
| Post-inference complete-tree verification | Passed; 13,084 files intact |

I independently inspected the stored candidate audit result, artifact names/sizes, runtime manifest identity, module closure, and licence record. The manifest SHA-256 is `470ec7e8a6fa1e91f9831e42de7988249220b51d4ecd4352452f3c70b2b6084a`. Supplied build evidence binds the 5,030,981,677-byte archive to SHA-256 `87bfb2baae44cf13daae15328f8287cbee60e6782f04735d814d2ed849e8c45c`.

**Findings: none.**

**Remaining uncertainty**

The helper’s 406-ms Spanish and 359-ms English cancellation measurements cover cancellation of queued adapter work before `settle()` and model cleanup. They do **not** establish interruption during active inference or native framed-service cancellation.

The evidence does not establish OS-wide network/filesystem isolation, listening approval, sustained resource/performance behavior, ordinary acquisition/lifecycle, native v3 admission, or publication readiness. Those remain explicit later gates. The production release audit still fails on the five disclosed v2 Python advisories; this approval does not change that result.

**Required next action**

None for acceptance of this exact preparation patch. Preserve this report and its referenced identity manifest unchanged. Any subsequent reviewed content or HEAD change requires a new review identity.

This approval is neither a refactor Validation Report nor authorization to commit, push, publish assets, or create a pull request.
