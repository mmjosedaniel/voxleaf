# Change Review Report

**Review ID** CI-M1-R01  
**Task ID** CI reliability M1 · VF-0177, VF-0178, VF-0179, VF-0180, VF-0185  
**Verdict** APPROVE  
**Base** `28e157cd2dc08ab974cf3478ea730e8cef801661`  
**Reviewed HEAD** `17c74f7b96ec4a2732aa6d1d3be8aa1c37c68f52`

**Reviewed identities and recheck** PASS. The closed nine-path `tmp/evidence/ci-implementation/m1.json` manifest, SHA-256 `d6a959868f9bab9588e7ad1c5a33c11295203d6a6553b3a41151c06b8710ff6c`, matched the six-path diff, current HEAD/base, worktree SHA-256s, filtered blobs and statuses before and after review. Additional clean supporting paths were `apps/desktop/scripts/windows-release.mjs` (`5a08f88868a4277d376a06df640ac3af2dea892d`, SHA-256 `5e14441132458788d6f4acc81df2bd0110901564bcb2ba2ebff63d7a234fbe1d`), `.gitignore` (`2afcbb78c8a55861916e5ccd14455c598c132beb`, `9e601c0421914252a949656b79092e3a1049c325c8d6218ba158801e37241392`), `packages/shared/src/index.ts` (`dc6b5f7fdc409f3a3b1022de540df5249c859a18`, `b04a954fdd570848d9c8f286e26d198b0e65f7833ad3caa15dc2790fbd1582b6`), and ADR-0005 (`d4627b7d967cba0647373e15a2503206301f3f72`, `31bf5a8f6d7ec3ee291745232dc4f13dd6c7f8b898286779b096160c333862da`). The separate untracked plan changed during review. Its five M1 criteria were re-read and matched the original request. The report covers the committed patch.

**Acceptance review** Both workflows use workflow/event/PR number or full ref. For example, the foundation groups end in `pull_request-334`, `pull_request-335`, `push-refs/heads/agent/example`, and `workflow_dispatch-refs/heads/agent/example`. A new revision of the same PR reuses its key; release uses its own workflow prefix. On both native runners `cargo tree --locked` precedes repository compilation, and both Clippy and test configurations require the lock. Global ESLint exclusions match package scratch. PowerShell setup propagates native failures. A fixed installer timestamp and independently changed pre-install start, reversed order, and future completion exercise the real validator. The reordered-key success case remains covered. All four job display names are preserved.

**Test evidence reviewed** The coordinator reported native Windows PowerShell, Node 24.18.0 and pnpm 11.15.1. `pnpm.cmd lint:typescript` initially exited 1 with 3,748 scratch errors. After the patch, `pnpm.cmd check`, `pnpm.cmd check:portable` and `pnpm.cmd test:browser` exited 0; Chromium passed 115 scenarios. The aggregate log includes the release receipt test, Rust results of 208 and 207 passed, and successful native and Python builds. The tracked-filename ESLint probe exited 1 with `@typescript-eslint/no-unused-vars`. A stale-manifest `cargo tree --locked --manifest-path <fixture>/Cargo.toml` exited 101 before creating a target and preserved lock SHA-256 `e6f4723cf45ae865af3f24e0695a6fcb20a8e314aa6f4151db805fd51baa7e51`. A PowerShell probe raised on native exit 19 and omitted its following sentinel. The initial local WebView driver mismatch was followed by a successful matching-driver smoke on the same executable. GitHub recorded success for all four PR #334 checks, including the packaged WebView2 smoke and final Windows aggregate. [Foundation jobs](https://github.com/mmjosedaniel/voxleaf/actions/runs/45696153759) · [Release audit](https://github.com/mmjosedaniel/voxleaf/actions/runs/45696153843)

**Findings** None.

**Remaining uncertainty** Same-named fork collisions and replacement of an in-flight run were evaluated from the expressions, without a paired hosted cancellation experiment. The historical failing timestamp operand remains unknown. M2 branch-rule enforcement is separate.

**Required next action** None for this M1 patch.
