# PR #325 browser follow-up

<!-- Privacy redaction. Repository account links are recorded as their original reference IDs. -->

Base/HEAD `3f1bd55d1dd022a9d2b185e849016987466d2923`, branch
`codex/revalidated-findings-execplan`, initially clean tree/index.
The [first CI correction](ci-follow-up.md) remains historical and unchanged.
This follow-up changes only BNC-01's browser input and its documentation.
Acceptance is governed by [review R02](ci-review-r02.md) and
[closeout R02](ci-closeout-r02.md).

## Trigger and scope

Foundation run 43994526958
passed Ubuntu portable and Rust. Windows passed pinned NSIS download/hash
verification, then failed BNC-01 with saved spine 0 rather than 1; 102 other
browser cases passed. The separate dependency audit also passed on that head.
Later native Windows steps had not executed. None of those results is a full
CI PASS for the forthcoming revision.

BNC-01 starts synthetic narration, defers compatibility refresh, rejects
narration navigation to the next chapter, and expects deliberate visual reading
to save there without automatically restarting speech. Its movement was
`scrollIntoView()` in page JavaScript, which produces automatic viewport motion,
not a measured manual gesture. VF-0074 intentionally rejects that automatic
sample while the prior heard checkpoint is protected.

Replace only this operation with viewport hover and Playwright's browser-level
mouse-wheel input. The existing assertions still require saved spine 1, a
noninitial paragraph anchor, no automatic speech restart while or after
compatibility settles, and a later explicit Play preparing that saved anchor.
No application callback, intent flag, save call or synthetic DOM scroll event is
injected. Synthetic TTS/compatibility controls remain unchanged. No production
or workflow file, timeout, retry budget or expected position is modified.

This is another test-call gap associated with VF-0074, not a reproduced loss of
product progress. The older selected browser command covered reflow/restoration
but not BNC-01. The first CI correction reproduced the reported Vitest failures;
the Windows 504 had prevented the browser suite from revealing this second
consumer. Full remote browser execution exposed it after the first push. The
reason it escaped the earlier review remains unknown.

## Local validation

All commands ran in normal local PowerShell 7.6.9 outside the sandbox, using
Node 24.18.0, pnpm 11.15.1 and the existing pinned Playwright Chromium.
Raw output is under ignored `tmp/evidence/pr325-ci/`; the RED trace/screenshot
were copied to `browser-red-artifacts` before the next Playwright invocation.

- RUN, RED then GREEN — `pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep BNC-01`.
  Before editing, exit 1 reproduces saved spine 0 versus expected 1. After the
  real-wheel input correction, exit 0 with the original downstream assertions.
- RUN — `pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep FSF-VF-0074`;
  exit 0, both mounted Stop/reopen controls pass, including delayed-image layout
  rejection and legitimate manual successor. These are current browser checks.
- RUN — `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`,
  `pnpm.cmd typecheck:typescript`, `pnpm.cmd check:evidence` and `git diff --check`;
  exit 0. Types include the changed browser file. Playwright builds its app
  through the existing configured web-server command.
- REUSE — none required for this one-test correction. Earlier passing units,
  Node suites and remote jobs are attributed history, not renewed acceptance.
- NOT-APPLICABLE — production package/lifecycle, model, live download, acoustic
  and GPU validation. Application and release inputs are unchanged; no artifact
  acceptance is extended.

After independent review and the authorized exact-path Git handoff, inspect all
replacement CI jobs before declaring the PR green. A new failure requires fresh
diagnosis. Historical reports and completed plans remain immutable.
