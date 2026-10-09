# Chatterbox successor preparation baselines

These immutable summaries retain the independent validator's pre-change reports.
They establish readiness only, not acceptance of the successor or a clean
production release audit.

## CHATTERBOX-V3-BASELINE-01-20261006

Role: `refactor_validator` (GPT-6 Astra high), read-only.
Mode: BASELINE. Verdict: PASS.
Starting and ending HEAD: `30fd57b91817817dba62d81ee6494bf3f46d8464`.
Execution: local PowerShell outside sandbox, `login:false`, pinned pnpm shims
prepended to process PATH. Index empty before/after, no writes or Git mutations.

| Allowed path | Before/after SHA-256 | Filter-aware blob |
| --- | --- | --- |
| `services/tts/src/voxleaf_tts/release_chatterbox.py` | `454e9f005dc4d3b54a5ef2706e078f3372235d4af4775222265d1678d884151b` | `3ce059e62dffdb529f7e2acefecdc79e82a6bfaa` |
| `services/tts/tests/test_release_chatterbox.py` | `6da7355a412e6ec0e4ae835edbb30c2637ed1334ce66786944a98d5beaae0971` | `55be59d6351f8194bd19d5510a97c13994066cdc` |
| `package.json` | `bde1cd1f6f55c3b30f83c5f1ff058da2ab5d5ee732e7f3d56ef79c6758b64478` | `a179e19c037775340b6d0fe1beb60b577291b866` |
| `scripts/test-chatterbox-dependency-security.py` | ABSENT | ABSENT |
| `services/tts/release/profiles/chatterbox-v3/requirements.in` | ABSENT | ABSENT |
| `services/tts/release/profiles/chatterbox-v3/requirements.lock` | ABSENT | ABSENT |
| `services/tts/release/optional/chatterbox/source-manifest-v3.json` | ABSENT | ABSENT |

All porcelain statuses were empty and identities unchanged across validation.

| Command | Exit | Result |
| --- | --- | --- |
| `pnpm.cmd test:python` | 0 | 386 passed, including 18 Chatterbox package tests; existing nonfatal pytest cache warning |
| `pnpm.cmd lint:python` | 0 | Passed |
| `pnpm.cmd typecheck:python` | 0 | 159 source files passed |
| `pnpm.cmd format:check:python` | 0 | 159 files formatted |
| `git diff --cached --quiet` | 0 | Empty before and after |
| `git diff --check` | 0 | Passed |

Historical profile/optional-package and native files were unchanged. Existing
director drafts in the audit policy, dependency documentation, active index and
new plan were excluded from the clean implementation paths. No models,
downloads, publication or installed-package mutation occurred. The standalone
probe is outside service pytest/lint/type targets and needs explicit validation.

## CHATTERBOX-V3-BASELINE-ADDENDUM-01-20261006

Role: same independent validator. Mode: BASELINE. Verdict: PASS.
Starting and ending HEAD: `30fd57b91817817dba62d81ee6494bf3f46d8464`.
Execution: local PowerShell outside sandbox. No tests rerun.

Additional allowed path:
`services/tts/release/optional/chatterbox/licenses/tokenizers-0.23.1-LICENSE.txt`.
Before and after: absent; porcelain empty; SHA-256 and blob ABSENT. `Test-Path`,
exact porcelain, HEAD and index checks were unchanged. Nine tracked historical
Chatterbox input/authority files were checked; none had changes. The other seven
paths were already under worker ownership and were not revalidated by this
addendum. Upstream provenance was director-supplied; actual added bytes require
post-change verification. No writes or Git mutations occurred.
