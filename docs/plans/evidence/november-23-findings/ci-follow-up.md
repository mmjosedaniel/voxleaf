# PR #332 CI follow-up

Foundation run `45267693894` and dependency audit run `45267693887` failed on PR head `8e9a4fa48d8ddf8145f25da968b674ead4c3ed3f`. Both foundation platforms reached the same Prettier failure in the coordinator test. The Windows browser and packaged WebView2 startup steps had already passed on that revision. The Ubuntu Rust job reached a separate assertion in the B07 confirmation-cancellation regression.

## Dependency audit

The release audit reported RUSTSEC-2026-0594 for `cookie` 0.18.1 and RUSTSEC-2026-0592 for `url` 2.5.8. The lockfile now resolves `cookie` 0.18.3, `url` 2.5.9 and its dependency `form_urlencoded` 1.2.3. Regenerating the release inventory updated the same three entries and the Cargo lock digest. The installed-package evidence from the original plan applies to its recorded installer digest.

With pinned pnpm 11.15.1 in local Windows PowerShell, `pnpm.cmd audit:release` passed the Node, Rust, base service, Piper and optional Chatterbox graphs. `pnpm.cmd inventory:release:check` passed. `uv run --directory services/tts --locked pytest tests/test_release_dependency_graphs.py` passed 30 tests.

## Formatting

`pnpm.cmd exec prettier --check apps/desktop/src/tts/product-narration-coordinator.test.ts` reproduced the failure locally. The pinned formatter rewrapped two expressions. `corepack.cmd pnpm run format:check:typescript` then passed the repository-wide gate.

## Cancellation during cleanup

The B07 test constructed a `Confirming` state directly and expected `Invalid` from a Download attempted during cancellation. VF-0133 binds the command to the confirmation ID issued by selection. Once Cancel retires that ID, the command returns `Cancelled` before probing the host. The obsolete assertion panicked while the test held the shared installed-runtime mutex, poisoning it for other tests. The focused reproduction on Windows observed `Cancelled` versus `Invalid`.

The regression now retains the ID returned by selection, submits it through the command's admission function during cleanup, and checks the response after releasing the shared lock. It also verifies the busy Remove response, completion of cancellation, and a distinct ID on the next selection. The B07 case was outside the earlier filtered VF-0133 test selection.

The full local Rust suite also found transfer and disk-probe fixtures that synthesized confirmation state without its ID. They now obtain consent through selection before exercising their original transport, cleanup and disk assertions. The competing removal case expects the same retired-command result. `corepack pnpm test:rust` passed both Windows configurations (208 passed and nine ignored with default features, 207 passed and ten ignored with the locked runtime). `corepack pnpm format:check:rust` passed.

## Desktop regression coverage

After formatting passed, the full Windows TypeScript run exposed two older expectations. The presentation matrix expected preparation copy while the service was stopping. Its updated expectation matches the cancellation status in the mounted VF-0093 flow. In the preference ordering test, the `edit-first` case expected a late initial read to overwrite a newer local edit. For both orderings, the mounted App test invokes the Settings callback, inspects the props passed to Settings and the reader, checks the retained initial restoration input, and verifies a subsequent edit and write to the mocked repository. Both fixes are in test code.

`corepack.cmd pnpm --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/tts/product-narration-presentation.test.ts src/tts/product-narration-coordinator.test.ts -t '"keeps the reader edit after hydration|App preference connection characterization|product narration presentation|VF-0093"'` passed 104 tests. The repository typecheck passed, as did scoped ESLint and Prettier, Python formatting and lint, and both Rust Clippy configurations. The full Windows Python run passed 1,298 tests with two skipped.

## Independent review

[Initial CI change review](ci-review-r01.md) · [Revised CI change review](ci-review-r02.md) · [Post-review verification](ci-closeout.md)
