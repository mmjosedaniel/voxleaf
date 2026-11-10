# U1 / DCR-01, 06, 10, 20 and 24 execution receipt

Receipt DCR-U1-EXEC-20261109-01. Base and HEAD
`d375ecc84261c404e855c055e0ecc8949a97caaf`, index empty.
Normal local PowerShell outside automation sandbox. Node v24.20.0,
pinned offline Corepack pnpm 11.15.1, Vitest 5.0.5. Private command results,
input snapshots, logs and Chromium failure artifacts are under
`tmp/evidence/deep-chat-audit/U1/`.

## Per-case evidence

- DCR-01: The mounted coordinator reached warming during explicit recovery,
  but Cancel start was absent on RED. GREEN cancels through owned containment,
  leaves intent inactive and does not offer a new recovery. Chromium executes
  the real controls and a deferred synthetic native prepare boundary.
- DCR-06: Old player never confirms delayed positive paused output. GREEN
  confirms once for the current unit/activation, with zero and stale controls,
  subsequent natural end and paused scheduler clock held. Chromium delays
  actual worklet delivery, releases the current positive paused record and
  checks the confirmation/Stop surface. This is device output evidence.
- DCR-10: Actual Chromium `AudioContext.createBuffer` rejection after accepted
  PCM produced an escaped `AdaptiveBufferSchedulerError` on RED even though a
  later tick showed the correct diagnostic. GREEN shows playback failure,
  no page error and verified cleanup. The direct Web Audio unit control
  exercises successor allocation failure from the device end callback and
  asserts exact release of both units and one context close.
- DCR-20: RED App rejected contained prior TTS failure and admitted failed
  backend with empty counts. Real coordinator RED returned no verified close
  result in either branch. Chromium RED timed out waiting for C's Play after
  held A shutdown completed. GREEN joins the same close and reports verified
  success or failure independently of the original diagnostic, admits only C
  after verification and requires explicit Play at its observed passage.
- DCR-24: All three exact Quick/prepared/refill duration boundaries failed on
  RED. GREEN checks all exact and +/- one-frame neighbors. Existing mixed-rate
  and positive sub-millisecond tail controls pass. Scheduler intermediates are
  bounded exact integers, with one floor after combining rates.

## Commands

- `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/tts/ProductNarrationControls.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/pcm-playback.test.ts src/tts/adaptive-buffer-scheduler.test.ts -t DCR-`: RED exit 1, nine intended failures and nine controls passed. Current focused GREEN exit 0, 19 passed and 382 skipped.
- The same owner command without selector passed all 401 tests. The final
  focused run followed a fixture-only TypeScript correction. The prior owner
  result is retained separately and does not replace final G3.
- `pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep DCR-01/06/10` and the same with `--grep DCR-20`: each RED exited 1; each GREEN exited 0, one passed. Subsequent type-only test fixture and Markdown changes are outside the browser inputs. Prior U3/U5 assertions remain in the same browser file. Final G6 pending.
- Scoped `pnpm.cmd exec prettier --write` and `pnpm.cmd exec eslint` passed on the first 12 paths; following successor and fixture-only edits, affected-file formatter/linter checks also passed. `pnpm.cmd --filter @voxleaf/desktop run typecheck` initially rejected two fixture-only types, then exited 0 after correcting them. Final G7 pending.

## Closed reviewed inputs

First 13 paths comprise the U1 patch. Earlier U2/U3/U5 changes on shared paths
are visible in the tracked diff; prior approvals stay bound to their original
snapshots. Remaining paths are support inputs. The final Controls test support
row matched HEAD at handoff.

| Path | Status | SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | ` M` | b9377b282c58948bd11f3f9852292c24a49139023304bea5c3fc35d043ad6237 | 597a228c4f00f02504cc17b154d5e7a6138f8f97 |
| apps/desktop/src/tts/ProductNarrationControls.tsx | ` M` | b22b3ba0f64aa8e13be1f0d45f2f2f58a5ef7cef84d7472de8ea4521a9b74e00 | 2c7e48aab295413a278d5a6fa9a51e4db5ce2a72 |
| apps/desktop/src/tts/product-narration-coordinator.ts | ` M` | b111678a407947d973a4a709b9062bce3786e0545db34eda8ad159e35c61b252 | 9e9fa365a2803ff7df8967be9cb4191c55be05e9 |
| apps/desktop/src/tts/pcm-playback.ts | ` M` | a45e9e4b308c81f013bf1b666a4b658ffe9b53060603257b961d62bb38ebaab7 | 0696831c7217322e5740ce8710e7603b8cfd58cf |
| apps/desktop/src/tts/adaptive-buffer-scheduler.ts | ` M` | 21d17efd6b24d4cb433cc4374cfba707ac9d6720a543d8f1b2a01a469cfc16a4 | 6b44b19e8a5bdbf5fc5914376f812692dc206e67 |
| apps/desktop/src/tts/playback-backends/web-audio-pcm-playback.ts | ` M` | f9f0ed333c5d245f765074877953fd083ddfe746d4b98909618db8eee3f52d43 | 6e939e189fcef7b7cf3eba5931a52081505cf43b |
| apps/desktop/src/strict-mode-resource-cleanup.ts | ` M` | 100ad5ccc463296a7d16233efd0bfd5c09a3fc1d61de8f7c35bda108916bc71d | 875677a31ed32ae373d5bb9bd1ce6ef048e400f2 |
| apps/desktop/src/App.test.tsx | ` M` | 582b4e1d74daedb4f2af52645ccb7efd1a6ff0e5acb8d43c580bcf1da2126a03 | d250f651a6407356ff53b005ca63a109e2d2fd88 |
| apps/desktop/src/tts/product-narration-coordinator.test.ts | ` M` | f51cb6c75e2f99373cbf23b3bcb0aaf4b960deee3a3783a18c654a3ef993f886 | cc94da383e6b1173f6380cf40088474dddbbc7c4 |
| apps/desktop/src/tts/pcm-playback.test.ts | ` M` | dabf464c33692b08e1b7c5e8cceb7e1e64bde33b97f3b788e968a3656f574494 | dcd0e041f8da58f1d3ae57cebc4aaf84ea0407bf |
| apps/desktop/src/tts/adaptive-buffer-scheduler.test.ts | ` M` | 6159261b9ebf683a7178390e2bcaf2dd8d5cee62dc03ec14a8a65e6f27c6f2ea | 3e106882c8b58d70866a7657e85617cbaf52a10c |
| apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts | ` M` | d0fead1e5fbe6f926d44c1e2ea4a3bf7051d74e0f8e30232c6a32b7662f8c347 | a53fc00c3adb4ee0b723662162c336aac5241464 |
| docs/product/reader-settings-and-playback-controls.md | ` M` | e46897865dc122a5169d8a408f9ee7536db07ae4221bbbf626667983bd4072f3 | 1a248e51c77441df845c87df65a5d603b6e9dd5d |
| apps/desktop/src/tts/adaptive-buffer-authority.ts | `clean` | a2818086acee2a86c690baa2c03d2ea21dc756c59aa34b1ff0d5080553037ca2 | 669e9122406b6fdda2f1f39c3833072a5a1339f8 |
| apps/desktop/src/tts/reader-settings-playback-authority-v3.ts | `clean` | 199882997b0b5cce4b0e2a184e4f26dd5411ddc76f5d5e230db4c3dae8c7a91a | 9ab37c996809ee76070bbf0e6fafb0f0129c0aff |
| apps/desktop/src/tts/pcm-playback-contracts.ts | `clean` | ba89fe0d1e30ec2f3d4cb5e1b2ee9ce316ce8fc6998a452e1404728e09510a59 | 53f3b42f5a3575ce7e5e90a9c5efdf45461519d3 |
| apps/desktop/src/tts/process-client.ts | `clean` | 540cd61afdd30bf5421ddcf3fd8e4efc6cbac7074646a0311f78b1c6923e47e6 | 05354109da53ac078a64d239cef778aa89ed4e1f |
| apps/desktop/src/reader/ReaderPublication.tsx | ` M` | 086208cb9e6465fae489c6b540a3b8a90f8dee2ec659f67068db760a18224ca4 | 706a3e7f0634c545ab1fd96b3a3d2c71d176a109 |
| apps/desktop/src/settings/narration-settings-actions.ts | ` M` | b762eaa9f3b36355a96893ca76e9b88101ed7ac95666efa4466c2147f78fbf3b | 354f446606df46f3200da85a73f4d3ca949592a3 |
| apps/desktop/package.json | `clean` | 7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa | 46b13978c4094f004349ba762f31bddeb104cb9f |
| apps/desktop/vite.config.ts | `clean` | cf32693193b978e9d290f7cddf99538c7973622ba408005bfceec857e1ec9f31 | 1df2541f9aa8a463a0d076c8059dc07855762f0d |
| apps/desktop/playwright.config.ts | `clean` | 8b6b8a163b02a949a4e6cd91fcbeff71cb6053e5a646a87552f75b58be8011b1 | e14e28a44dcc92215549dcc1042fa0e26cf422a7 |
| package.json | ` M` | 79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6 | fd94e123a32a6b4a44d5ccb296cd89e25b319232 |
| pnpm-lock.yaml | `clean` | e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426 | acf5034202c5933f5c1dff89beff28587c826088 |
| pnpm-workspace.yaml | `clean` | efb8ff9911192e80897352cbacccc0cb1d53ef130b64bb98f813c973694f5363 | b6615e1277536c992be3a14cdaa04235a1117330 |
| .gitattributes | `clean` | d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4 | 5acf47068be3a84b4e38b502877083e99b5ce0f9 |
| packages/epub/dist/index.js | `ignored export` | 3f5c07c947cf141c0e0630d1615db8bcab24cf29fef860be2f8bc692907a70dc | fb2836bcc35df29a554310fed3735cb5f59d7a7e |
| apps/desktop/src/tts/ProductNarrationControls.test.tsx | `clean` | a376475a1df165091ac38691b03b47b04af25015fa5d3fed2f353520be681905 | 1ed9054c5d0df406dac20d17012c3b0ec013d683 |
