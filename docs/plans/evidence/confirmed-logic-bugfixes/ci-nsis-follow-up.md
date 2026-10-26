# PR #272: NSIS prerequisite and publication privacy follow-up

Recorded 2026-10-23. This record supplements the completed CLB plan without
replacing its historical behavioral acceptance.

## CI failure and correction

The initial Windows foundation job failed the existing CLB-01 compiled NSIS
regression: the compiler process returned no exit status because its expected
Tauri cache executable was unavailable. Ubuntu portable, Ubuntu Rust and the
production dependency audit passed. Native startup does not build an installer
and therefore does not provision this compiler.

The workflow now downloads the official Tauri `nsis-3.13.zip`, checks SHA-256
`ba63dffc4410ee89193e1cb5a41989991bd77c61068da17e3156d136b7b0b3d8`
before extraction, prepares the existing test's compiler path and checks that
the executable starts. It refuses an existing target instead of overwriting a
cache. No runtime code, test assertion, skip condition or release artifact changed.

## Local PowerShell evidence

All commands ran outside the managed sandbox. A process-local `LOCALAPPDATA`
pointed at a new ignored synthetic directory; the user's application data and
normal compiler cache were not changed. The setup was executed directly from
the exact new workflow step, with `RUNNER_TEMP` also pointing into ignored scratch.

| Command or operation | Result |
| --- | --- |
| `pnpm.cmd --filter @voxleaf/desktop test`, empty compiler cache | Exit 1; 818 Vitest passed; Node 96 passed / 1 failed, exclusively the existing CLB-01 compiler invocation. |
| Execute the exact NSIS workflow setup | Archive hash matched; compiler reported `v3.13`. |
| `pnpm.cmd --filter @voxleaf/desktop test`, prepared synthetic cache | Exit 0; 818 Vitest and 97 Node tests passed, including compiled NSIS behavior. |
| `pnpm.cmd format:check:typescript` | Exit 0. |
| `pnpm.cmd check:evidence` | Exit 0. |
| `git diff --check` | Exit 0 for this follow-up delta. Historical Markdown hard breaks remain unchanged. |

No full host/model/installer acceptance was rerun for this CI setup correction.
The existing runtime source and behavior evidence retain their original scope.
The GitHub rerun remains pending at this local review checkpoint.

## Publication privacy

Review of the complete PR's changed paths and added text found no credentials,
personal home-directory paths, private book text, generated audio, model weights,
raw logs, screenshots or data files in the patch. Synthetic fixture text and
markers are distinct from user content.

The review did find unnecessary assistant-memory references, internal session and
capture identifiers, retained local-package inventory details and host-capture
digests in historical documentation. The user explicitly authorized redaction
and a lease-protected rewrite of this PR branch. Five originals were copied into
ignored local storage and verified byte-for-byte before editing. Public copies
are marked as redacted; technical verdicts, outcomes, source identities and
distributable-artifact identities are retained. Historical hashes continue to
describe their original snapshots, not the redacted copies.

Rewriting branch ancestry removes the superseded commit from the branch's
reachable history. It cannot guarantee deletion of GitHub caches, old commit
references or external copies. No credential rotation was indicated by this
inspection. This is a scoped privacy review, not a claim of exhaustive secret
discovery in the entire repository.
