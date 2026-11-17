# PR #325 native link test follow-up

Base/HEAD `7ae2c940faae245a632ca26329ec0e39fef44244`, branch
`codex/revalidated-findings-execplan`, initially clean tree/index.
This bounded patch changes one assertion's baseline in the existing Python
test and its documentation. See [review R03](ci-review-r03.md) and
[closeout R03](ci-closeout-r03.md). Earlier CI follow-ups remain immutable.

## Trigger and correction

[Foundation run 43996966830](https://github.com/mmjosedaniel/voxleaf/actions/runs/43996966830)
passed Ubuntu portable/Rust, Windows browser and packaged WebView2 startup.
Windows then reached Python tests: 1,232 passed and two VF-0082 native symlink
cases failed. The separate production dependency audit passed. This was not
a complete Windows or PR PASS.

Both cases reached the expected `session-lock` rejection, then compared
`marker.readlink()` directly with the originally supplied target path. The
runner returned a Windows extended-length path with the `\\?\` prefix, while
the supplied target used the ordinary spelling. Their literal Path comparison
failed before the remaining target/session/retry assertions.

Capture the actual `readlink()` value immediately after fixture creation and
compare the post-operation value with that baseline. This directly tests that
the link destination is unchanged, including its spelling. No resolution,
prefix stripping, weaker content comparison or production change is needed.
Existing checks still require the link to exist, the exact error, unchanged
session bytes, unchanged existing target or no newly created absent target,
and successful retry after the fixture owner removes its unsafe link.

The original local host lacks file-symlink privilege, so those two native tests
were explicitly skipped under the accepted alternative evidence strategy.
The configured GitHub Windows host can create them and exposed the assertion's
platform-specific spelling assumption. This is a test portability gap, not
evidence of lock admission or target modification. No machine privilege,
Developer Mode setting, runtime owner or historical acceptance is changed.

## Validation and remaining native gate

All current checks ran in normal local PowerShell 7.6.9 outside the sandbox
with uv 0.11.29, Python 3.12.10 and the existing locked environment. Logs are
retained under ignored `tmp/evidence/pr325-ci/symlink-*.txt`; the complete remote
failure is in `windows-foundation-failed.txt`.

- RUN before editing — `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -k test_vf0082_rejects_existing_lock_link_without_creating_or_changing_its_target -q -rs`;
  exit 0, both selected cases skipped on native setup privilege error 1314.
  This is neither RED nor native PASS. A pytest-cache permission warning is
  retained. The remote Windows execution supplies the actual failing assertion.
- RUN after editing — `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -q -rs -p no:cacheprovider`;
  exit 0, 66 pass and the same two native cases skip. Controlled link resolution
  with real target I/O, native hardlinks, ordinary ownership, finite subprocess
  overlap/recovery and sequential continuation still pass. These do not establish
  native symlink GREEN. Disabling the optional cache avoids the cache warning;
  no assertion or native skip condition changes.
- RUN — `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`,
  `pnpm.cmd typecheck:python`, `pnpm.cmd check:evidence`, `git diff --check`;
  exit 0. Ruff covers 199 files and mypy 195 source files.
- REUSE — none as current acceptance. Earlier artifact and runtime results
  remain attributed to their original inputs.
- NOT-APPLICABLE — new runtime package/lifecycle, model, live-download,
  acoustic and GPU runs for a test-only assertion correction.

Local native symlink execution remains BLOCKED by host privilege. Review may
accept the bounded test correction on its recorded evidence, but final PR
validation requires the replacement Windows CI to execute both native cases
and all other configured jobs successfully. Do not report those native cases
complete before observing that outcome. No request for broader privileges is
needed to test them on the already configured CI host.
