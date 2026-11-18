# PR #325 unsafe lock preflight correction

<!-- Privacy redaction. Repository account links are recorded as their original reference IDs. -->

Base/HEAD `8edc35e12a8cbbb54574338f3ba92f7fb577cf23`, initially clean on
`codex/revalidated-findings-execplan`. This is a bounded owner correction with
its regression and maintained documentation; no new public contract or
multi-component implementation plan is needed. Acceptance is governed by
[review R04](ci-review-r04.md) and [closeout R04](ci-closeout-r04.md).

## Newly reached failure

Run 44001206035
passed browser, WebView2, TypeScript/Node and Rust before reaching Python.
Python finished with 1,233 passes and one failure. The existing-target native
link variant passed. The absent-target variant passed link identity and session
integrity, then found that its unrelated target had been created. The preceding
path-spelling failure had prevented this assertion from being reached.

This reopens the unsafe-entry subcase tracked under VF-0082 and RSQ-R01-01.
The owner tries `os.open(..., O_CREAT | O_EXCL)` before inspecting the entry;
that opening can follow the preexisting dangling link on this Windows runtime.
The later reparse/identity check rejects it, but the unrelated empty target
already exists. The existing-target result is not proof for the missing target.

The prior replacement model explicitly raised `FileExistsError` for exclusive
creation on a link. That assumption hid the observed Windows behavior. Both
native cases were unavailable locally, and the first privileged CI failure
stopped at a different assertion. These are demonstrated evidence gaps; the
earlier review reasoning beyond its written assumption remains unknown.
Historical reports and the accepted alternative-strategy record remain intact.

## Bounded correction and protections

Inspect the coordination entry with `lstat` before any potentially creating
open. A preexisting nonregular entry or reparse point fails with `session-lock`
without opening it. An absent path retains exclusive creation; an existing
regular path retains noncreating/nontruncating fallback. Existing descriptor/
path identity, hardlink, size and reparse validation still occurs after opening.
The same nonblocking OS lock and descriptor lifetime cover all five callers:
submission, correction, aggregation, cleanup and CPU-fallback derivation.

The regression now models link resolution instead of forcing the prior
exclusive-open outcome. Actual target I/O demonstrates the old owner creates
the absent referent. Both target variants require no unsafe open after the
correction, preserved session/entry/target bytes and absence where applicable.
The native fixture's safe-retry assertions remain unchanged. Ordinary first
creation, existing empty markers, contention, owner termination, cleanup,
derivation and sequential retry remain covered by the complete quality suite.

This preserves ADR-0077's local sequential operating boundary. It does not add
an atomic guarantee against an adversary swapping filesystem entries between
inspection and creation. Such hostile replacement remains outside the existing
contract. No model, new dependency, retry loop, persisted book/audio data,
process boundary, command, schema or installer input is added. The canonical
diagram's ownership/data flows remain unchanged. Frozen authorities are not
rewritten. The legitimate next action is removal of the unsafe fixture by its
owner, followed by an ordinary sequential retry; live coordination files must
not be removed while another command may own them.

## Current evidence

All commands below ran in normal local PowerShell outside the sandbox with
uv 0.11.29, Python 3.12.10, Node 24.18.0 and pnpm 11.15.1. Logs are retained as
`tmp/evidence/pr325-ci/lock-preflight-*.txt`; the full remote failure remains in
`windows-r03-failed.txt`.

- RUN, RED before owner edit — `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -k test_vf0082_modeled_lock_link_preserves_real_target_and_session -q -p no:cacheprovider`;
  exit 1, both variants fail. The absent-target assertion reproduces actual file
  creation; the existing-target control records two unsafe opens instead of none.
- RUN, GREEN — `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -q -rs -p no:cacheprovider`;
  exit 0, 66 pass, two native link fixtures skip under local WinError 1314. These
  skips are not native GREEN; updated controlled resolution performs real I/O.
- RUN — `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`,
  `pnpm.cmd typecheck:python`, `pnpm.cmd build:python`,
  `pnpm.cmd check:evidence`, `git diff --check`; exit 0. Built wheel inspection
  confirms the changed `benchmarks` owner is outside the installed runtime wheel.
- REUSE — none as current behavioral acceptance. Earlier review and package
  outcomes remain historical.
- NOT-APPLICABLE — new Windows installer/lifecycle, GPU, model, acoustic or live
  download campaigns. This owner belongs to maintainer benchmark operations,
  outside the application/runtime package. Build/package sources were inspected.

Native local execution is still privilege-blocked. After independent review and
authorized push, require both native variants to pass without skips in Windows
CI and all configured PR jobs to succeed. Until then the native acceptance and
overall CI task remain pending; a review of local evidence alone cannot close
them.
