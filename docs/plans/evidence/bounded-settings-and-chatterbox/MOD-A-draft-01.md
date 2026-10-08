# Draft work-order terms

Target ID: MOD-A
Status: draft for baseline; not authorization to write source.
Accepted audit: [MOD-A-AUDIT-01](MOD-A-audit-01.md).
Goal, risk, allowlist, transformations, invariants and 550-line ceiling: exactly
the accepted audit, including unchanged App integration assertion and per-handler
React binding lifetime. No source edits until BASELINE PASS and a frozen order.
User prohibits commit, push and PR; stay on current branch with an empty index.

Baseline: the five exact commands in the audit, executed outside sandbox.
Post-change: repeat all five; `pnpm.cmd test:browser`;
`pnpm.cmd test:tts:bilingual-portfolio-exact-host`; `git diff --check`.
Package/final: `pnpm.cmd check:portable`, `pnpm.cmd check`.

## Independent gate mapping before freeze

The configured Astra refactor validator inspected the current scripts. The
portfolio script performs tauri build, then `bilingual-portfolio-host.mjs
--lifecycle-only`, which invokes `native-startup-smoke.mjs` with no flags and
model-enablement groups removed. This covers the same native lifecycle route as
`pnpm.cmd test:native-startup`; the portfolio run explicitly subsumes that separate
command. Native smoke covers real WebView mounting, Settings, keyboard/preferences,
Tauri protocol and fake-service cancellation/crash/restart/cleanup. The full
portfolio adds language/profile selection, installed Chatterbox preconditions,
six exact model arms, quick/prepared playback, navigation, stop and resource cleanup.

Neither route proves reset/removal action sequencing, false result aggregation,
rejection order, absent-coordinator behavior or DEV bypass. Direct action tests
and the existing App integration assertion must establish these.

Fresh WebView storage does not isolate native optional-package data. Discovery can
repair/migrate the installed runtime and clean staging/cache. The validator is
checking current host prerequisites and a safe authorized test-resource route.
Do not mutate user installations or download models to satisfy a missing gate.
A blocked host gate prevents acceptance and MOD-B; model-free baseline may proceed.
