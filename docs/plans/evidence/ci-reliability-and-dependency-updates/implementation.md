# CI implementation evidence

## Foundation

The baseline was `28e157cd2dc08ab974cf3478ea730e8cef801661`. On the [foundation candidate](https://github.com/mmjosedaniel/voxleaf/pull/334), normal Windows PowerShell ran `pnpm.cmd check`, `pnpm.cmd check:portable` and `pnpm.cmd test:browser` successfully, including 115 Chromium scenarios. The original lint gate reported 3,748 errors in ignored scratch. Piping a disposable copy of tracked `packages/shared/src/index.ts` with an unused constant into `pnpm.cmd exec eslint --stdin --stdin-filename packages/shared/src/index.ts` returned 1 at line 133 with `@typescript-eslint/no-unused-vars`.

On a mismatched temporary package, `cargo tree --locked --manifest-path <fixture>/Cargo.toml` returned 101 before creating a target directory. Its copy of the checked-in lock retained SHA-256 `e6f4723cf45ae865af3f24e0695a6fcb20a8e314aa6f4151db805fd51baa7e51`. A pwsh native-command probe with the workflow preferences raised on exit 19, omitted its subsequent output sentinel, and returned 1. The receipt test uses the read-back installer timestamp and checks pre-installer start, reversed chronology and future completion. The earlier failing time operand remains unknown.

In the foundation workflow, PRs 334 and 335 evaluate to `foundation-Foundation checks-pull_request-334` and `foundation-Foundation checks-pull_request-335` regardless of the fork's head name. A qualifying push evaluates to `foundation-Foundation checks-push-refs/heads/agent/example`, and manual dispatch to `foundation-Foundation checks-workflow_dispatch-refs/heads/agent/example`. The release workflow uses the same event identity with its own workflow prefix. Subsequent commits to one PR reuse that PR's group.

Local WebView2 initially rejected the installed EdgeDriver 155. Running the documented existing-executable harness with a signed driver matching runtime 158 passed on the same executable, SHA-256 `9d510f793363cdc84d4f43a55ec9b743960fb79e8e683b9165950b04ba96f2d6`.

## Dependency candidates

The [Windows candidate job](https://github.com/mmjosedaniel/voxleaf/actions/runs/45698537795/job/139502230946) on `79789ae2109575277677963deedcde385953dbae` resolved an exact candidate lock and dry-ran its installation for Windows x64/Python 3.12. Artifact 15060969569 expires 2026-12-02. Candidate changes include certifi and msgpack. The torch and torchaudio CUDA direct wheel pins were retained. The local positive path passed and a single current msgpack pin reported no update. Before adding the installation check, uv successfully compiled a real Linux-only CPython 3.12 msgpack wheel. Repeating with the exact same URL then failed in the installation planner with the incompatible Linux and Windows tags. The workflow verifies that candidate discovery leaves tracked inputs unchanged.

On temporary copies exported from this revision, `uv lock --project services/tts --upgrade-package ruff` updated 0.16.10 to 0.17.6 (19 added and 19 removed lock lines). `uv sync --locked` and `uv export --locked` passed. Both commands also passed on the unchanged release core with its local service dependency. Applying the manifest-only ONNX Runtime 1.32.0 pin from [#324](https://github.com/mmjosedaniel/voxleaf/pull/324) to core made the resolver reject its 2026-11-13 publication under the 2026-10-10 cutoff. The lock hash was unchanged. Hosted updater acceptance is recorded separately from these local resolver controls.

## Audit and runner costs

On the [release diagnostics candidate](https://github.com/mmjosedaniel/voxleaf/pull/336), `pnpm.cmd audit:release`, `pnpm.cmd inventory:release:check`, the registered Node report fixtures and `pnpm.cmd test:python` passed. Rust reported nine informational warnings, five Windows-reachable. Optional Python retained four blind spots. Regeneration changed the audit summary wording only. Redirecting the Windows Node audit launcher to a failing command produced exit 1 while Rust and each Python scan still reported results.

The audited [production graph job](https://github.com/mmjosedaniel/voxleaf/actions/runs/45646380329/job/139318383031) took 7m19s, including 5m50s for scanner installation. On an [optimized Windows runner](https://github.com/mmjosedaniel/voxleaf/actions/runs/45697444466), installation took 1s, scanning 40s, inventory verification 3s, and the job 1m44s. A cold local acquisition took 1.71s and a verified local archive 0.89s. A deliberately corrupt archive took the pinned locked-source fallback.
