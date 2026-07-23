# Native WebDriver startup smoke

## Goal

Replace the hosted-Windows native startup smoke's unsupported direct WebView2
debug-port attachment with Tauri's supported WebDriver bridge while preserving
the existing packaged-application security and privacy assertions.

## User-visible outcome

Pull requests receive reliable Windows evidence that the packaged VoxLeaf
application starts, mounts, opens and closes the repository-authored synthetic
EPUB, decodes its local raster image, emits no observed runtime error, and loads
no external resource. The production application and reader behavior do not
change.

## Current state

`apps/desktop/scripts/native-startup-smoke.mjs` launches the release executable
with WebView2 remote-debugging flags, polls `/json/version`, and attaches
Playwright over CDP. This passes locally but GitHub's `windows-2025` runner never
exposes that endpoint, even with an installed runtime, explicit loopback binding,
the automation feature flag, and a 90-second deadline. The application process
remains alive, so increasing the timeout cannot repair the transport mismatch.

## Scope and non-goals

In scope:

- launch the packaged executable through exact-version `tauri-driver`;
- use the WebView2-matched Microsoft Edge Driver selected by the pinned
  `msedgedriver-tool`;
- retain fixed, content-free failure reporting and disposable synthetic inputs;
- preserve mount, local-open, image-decode, cleanup, error, and network checks;
- add deterministic tests for the repository-owned WebDriver client;
- update CI and developer documentation.

Out of scope:

- production Tauri plugins, commands, capabilities, or dependencies;
- application, EPUB, reader, CSP, or public-contract changes;
- private EPUBs, persisted artifacts, screenshots, traces, or page-content logs;
- Linux WebDriver coverage or reader performance benchmarking.

## Relevant files and documentation

- `.github/workflows/foundation-checks.yml`
- `apps/desktop/package.json`
- `apps/desktop/scripts/native-startup-smoke.mjs`
- `apps/desktop/scripts/native-webdriver-client.mjs`
- `apps/desktop/scripts/native-webdriver-client.node-test.mjs`
- `docs/development/dependencies.md`
- `docs/development/testing.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/overview.md`

## Architecture and constraints

The test remains outside the production process boundary. `tauri-driver` maps
the repository-owned `tauri:options.application` capability to EdgeDriver's
WebView2 launch capability and proxies standard WebDriver plus vendor CDP
commands. The harness communicates only over two ephemeral loopback ports.
EdgeDriver launches the release executable with a disposable WebView profile.

No publisher content, local path, URL, console value, raw driver response, image
bytes, or private input may be logged. Temporary EPUB/profile data must be
removed on success and failure. Test queues and observations stay bounded.
Cancellation, TTS, and audio behavior are unaffected.

## Milestones

### Milestone 1: Establish the transport failure and supported replacement

#### Work

- Confirm the hosted runner has WebView2 and the native process remains alive.
- Confirm longer waits and documented debug flags do not expose `/json/version`.
- Inspect exact `tauri-driver` behavior and Tauri's Windows CI guidance.

#### Validation

- Command: `gh run view <run-id> --log-failed`
- Expected result: fixed `debug-endpoint-timeout` after a live process.
- Actual result: confirmed in runs `30030963068`, `30032230911`, and
  `30033275958`.

#### Status

Complete

### Milestone 2: Implement the WebDriver harness

#### Work

- Add a small repository-owned W3C WebDriver client with bounded requests.
- Launch `tauri-driver` with explicit loopback ports and EdgeDriver path.
- Port every existing security/privacy assertion to WebDriver/CDP.
- Add deterministic protocol-client regression tests.

#### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop test:native-driver-client`
- Expected result: all client tests pass without launching WebView2.
- Actual result: pending.
- Command: `pnpm.cmd test:native-startup`
- Expected result: packaged WebView2 smoke passes on native Windows.
- Actual result: pending.

#### Status

Complete

### Milestone 3: Integrate and validate hosted Windows

#### Work

- Install exact `tauri-driver` and pinned-revision `msedgedriver-tool` in CI.
- Download the driver matching the installed Evergreen WebView2 runtime.
- Run focused and aggregate repository checks.
- Push the branch and verify the authoritative pull-request workflow.

#### Validation

- Command: `pnpm.cmd check`
- Expected result: all repository checks pass.
- Actual result: pending.
- Command: `gh pr checks 62 --watch`
- Expected result: Windows native and Ubuntu portable checks pass.
- Actual result: pending.

#### Status

In progress

## Testing and benchmark strategy

Node's built-in test runner will cover capability construction, W3C response
handling, timeout/transport containment, element operations, and CDP command
forwarding against a local fake server. The native smoke is the integration test
for the actual Tauri release executable, `tauri-driver`, matching EdgeDriver,
WebView2, Blob image decode, and packaged CSP. Existing Vitest, Playwright,
Rust, Python, type, lint, formatting, and build checks remain authoritative.
No benchmark changes are required because runtime performance is unchanged.

## Risks and rollback

- A mismatched EdgeDriver cannot create a WebView2 session. CI mitigates this by
  downloading the exact installed runtime version after verifying the runtime.
- Vendor CDP commands may vary by EdgeDriver version. The client will use the
  Microsoft endpoint exposed by EdgeDriver and fail with a fixed code if it is
  unavailable.
- Driver output could contain sensitive application details. Child output and
  raw protocol errors remain suppressed; only fixed stage/code pairs are shown.
- Cleanup failure could leave processes or files. Session deletion precedes
  driver termination, and Tauri's Windows driver job owns its child processes.

Rollback is one focused revert of this harness/workflow/documentation change.
It does not require production migration or data conversion.

## Progress log

- 2026-07-23: Confirmed three hosted-Windows failures after 30 seconds,
  90 seconds with loopback binding, and 90 seconds with the WebView automation
  feature flag. The release process stayed alive and WebView2 `150.0.4078.65`
  was installed.
- 2026-07-23: Selected direct `tauri-driver` instead of the embedded WebdriverIO
  provider so VoxLeaf retains zero production plugins, commands, capabilities,
  and test hooks.
- 2026-07-23: Pinned `tauri-driver` `2.0.6` and
  `msedgedriver-tool` revision
  `8c4b34f51b45f5cf08013366d703de464ab871d1` for implementation.
- 2026-07-23: Added the bounded repository-owned WebDriver client, moved the
  native smoke to a Tauri-launched WebView2 session, preserved Browser/CDP error
  and external-request observation, and added three fake-server protocol tests.
- 2026-07-23: The first aggregate desktop run showed that Vitest also discovers
  `*.test.mjs`; renamed the Node test to `*.node-test.mjs` so each test runner
  owns a disjoint file set.
- 2026-07-23: Verified the downloaded local EdgeDriver has a valid Microsoft
  signature. The focused native command, post-cleanup native rerun, and complete
  authoritative repository check passed. Hosted PR validation remains pending.
- 2026-07-23: Hosted run `30036278090` installed both pinned drivers but failed
  after 60 seconds during session creation. Microsoft documents
  `webviewOptions.userDataFolder` as the WebView2 automation profile contract.
  Replaced the independent `WEBVIEW2_USER_DATA_FOLDER` override with that
  capability so EdgeDriver and the application observe the same disposable
  profile and automation marker.
- 2026-07-23: Rerun attempt 2 of `30037544251` reached the corrected native
  session and still returned the generic command failure after EdgeDriver's
  60-second internal deadline. Added a closed classifier for documented launch,
  profile, automation-marker, WebView-environment, timeout, and resource failure
  families without exposing the driver's message.
- 2026-07-23: Classified run `30038826480` identified
  `webdriver-automation-marker-missing`: the Server 2025 host never created
  EdgeDriver's `DevToolsActivePort`. Selected the explicit supported
  `windows-2022` image for the authoritative native-GUI job and retained the
  same exact toolchains, drivers, checks, and Ubuntu portable coverage.

## Discoveries and decisions

- The failure is not a cold-start timeout or absent runtime. The custom CDP
  endpoint is the incompatible boundary on GitHub-hosted Windows.
- `tauri-driver` sets Tauri's automation environment, launches EdgeDriver, maps
  `browserName: "wry"` plus `tauri:options`, and proxies subsequent WebDriver
  routes. This is sufficient without modifying application Rust code.
- A small built-in Node HTTP client is preferred over adding Selenium or
  WebdriverIO packages because the smoke needs a narrow protocol subset and the
  repository already owns its assertion flow.
- EdgeDriver, rather than an independent environment override, owns the
  disposable WebView2 user-data folder through
  `tauri:options.webviewOptions.userDataFolder`. This keeps its startup marker
  and the application's actual profile synchronized.
- Hosted native-GUI evidence requires a runner image on which WebView2 can
  create EdgeDriver's automation marker. `windows-2022` is pinned for that role;
  `windows-2025` remains unsuitable after direct CDP and supported WebDriver
  both failed at the same marker boundary.
- `docs/architecture/system-diagram.md` and `docs/architecture/overview.md` were
  reviewed. No diagram change is required because the WebDriver bridge is
  test-only and does not change the production component or runtime data flow.

## Final validation results

- `pnpm.cmd --filter @voxleaf/desktop test:native-driver-client` passed three
  protocol tests.
- `pnpm.cmd --filter @voxleaf/desktop test` passed 13 Vitest files/116 tests
  plus the three Node protocol tests.
- `pnpm.cmd test:native-startup` rebuilt the release executable and passed the
  packaged WebView2 open/decode/close/error/network assertions.
- A direct post-cleanup `node apps/desktop/scripts/native-startup-smoke.mjs`
  rerun passed with the exact pinned local drivers.
- `pnpm.cmd check` passed formatting, lint, type checks, 18 shared files/175
  tests, 23 EPUB files/376 tests, 13 desktop files/116 tests, three Node protocol
  tests, Rust/Python tests, and all production builds.
- `git diff --check` passed.
- Hosted run `30036278090` passed runtime/tool installation and failed during
  session creation before the profile-ownership correction. Rerun attempt 2 of
  `30037544251` passed every prerequisite and failed at the same session boundary
  after the correction. Run `30038826480` classified the failure as a missing
  automation marker. Windows Server 2022 replacement validation remains
  pending.
