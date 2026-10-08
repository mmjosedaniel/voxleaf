# Audit Packet and draft repair terms

Target ID: MOD-A-HARNESS-REPAIR-01  
Auditor: reused clean_code_auditor (GPT-6.1 Sol high).  
Decision: CHANGE. Risk: medium. Director accepts draft pending baseline.

## Evidence and redesigned scope

The instrumented full portfolio reproduced a lost alternate click: pending=true,
all present profile radios effectively disabled, Piper/es active before/after.
After approximately 90 seconds, pending cleared, Chatterbox was installed and
radios enabled, but the alternate-active condition remained false for 727 polls.
Requested-enabled/requested-active were never reached. This proves a harness
synchronization defect in that execution, not a product regression from MOD-A.

The existing language helper observes language/status before the awaited action
refresh necessarily finishes. HardwareCompatibilityControls correctly keeps its
fieldset disabled until completion. The alternate helper ignores that inherited
disabled state. Fix this measured test defect to complete required acceptance;
do not relax any acceptance criterion or declare the failing run passed.

## Closed repair allowlist

- `apps/desktop/scripts/native-startup-smoke.mjs`
- new `apps/desktop/scripts/adaptive-tts-profile-selection.mjs`
- `apps/desktop/scripts/native-webdriver-client.node-test.mjs`

Maximum three repair files, 325 added/deleted lines. All four MOD-A product paths
and their 568-line patch remain frozen and part of final validation context.
This is an explicit redesigned acceptance repair, not a third WORK02 correction
or the next modularization unit. No MOD-B work begins before MOD-A acceptance.

## Required change and invariants

Extract only the alternate-switch operation to a specific side-effect-free
`selectAdaptiveTtsAlternateProfile` helper. Inject existing driver, wait, assertion,
90-second timeout and clock. Select the same first nonrequested alternate and
wait for effective enablement (`!input.matches(':disabled')`) before one click.
Guard effective enablement in the click itself too. Preserve the original
alternate-result assertion, fixed message and active-profile assertion. Share
the original 90-second total deadline between readiness and activation; no new
180-second wait, timeout increase, retry, alternative profile, filter or skip.
An already-active alternate retains the no-click route. Rejection/timeout stops
later work and propagates. Target enable/activation, optional verification,
language, cleanup and other deadlines remain unchanged.

Add regressions to the existing configured Node test file using existing jsdom.
Execute actual helper DOM scripts against synthetic radios/disabled fieldset:
deferred enable causes zero clicks then exactly one same-alternate click;
inherited disable is respected; active completion required; already-active means
no click; missing/disabled/rejected paths stop; injected time shares the deadline.
No new dependency/configuration or source-string/regex-only regression tests.

Forbidden: product source/tests, language helper behavior, generic driver changes,
public/frozen authority, broader formatting, native installed-state/firewall/Git
changes, or MOD-B. No product/architecture decision is required.

## Baseline before edits

Independent validator records clean repair paths, new helper ABSENT, frozen
product/harness identities, HEAD and empty index. Run in local PowerShell:

- `pnpm.cmd --filter @voxleaf/desktop test:native-driver-client`
- `pnpm.cmd format:check:typescript`
- `pnpm.cmd lint:typescript`

Keep POST05 and the instrumented host failure as known failing bug evidence;
do not relabel them PASS. The focused baseline authorizes this explicitly scoped
test synchronization repair only, not product-refactor acceptance.

## Post-change acceptance

Repeat baseline, desktop tests, all original MOD-A commands, browser/portable/full
aggregates and git diff --check under a fresh manifest covering product plus
repair paths. Run `pnpm.cmd test:tts:bilingual-portfolio-exact-host` WITHOUT the
observer and with all six arms and original criteria. Its native lifecycle still
subsumes separate startup. Obtain independent PASS before MOD-B.

Documentation: keep diagnosis, baseline/order/results immutable and update the
active plan. No architecture/product behavior change is intended.
