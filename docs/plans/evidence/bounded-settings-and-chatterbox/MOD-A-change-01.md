# Change Packet

Target ID: MOD-A
Work Order: MOD-A-WORK-01
Worker: configured clean_code_worker (GPT-6.1 Sol high), sole source writer.

Files changed:

- apps/desktop/src/App.tsx
- apps/desktop/src/settings/narration-settings-actions.ts
- apps/desktop/src/settings/narration-settings-actions.test.ts

Symbols changed: App's five named settings handlers; new
`createNarrationSettingsActions`, `selectProfile`, `activateChatterbox`,
`removeChatterbox`, `selectLanguage`, `reset`, private `stopForConfigurationChange`.

Required edit mapping: module-level stateless factory captures only fixed DEV;
action-specific collaborators are injected at invocation to preserve every App
callback's dependency list and captured lifetime. Private synchronous stop helper
returns the original nullish expression without an extra async layer. App retains
the successful-start Quick/ready/canPersist presentation notification.

Invariants preserved: parameters, Promise results, method receivers and rejection
propagation; stop-before-mutation; packaged installed-state/DEV gates; activation
delegation; conditional selection refresh; every fulfilled removal refreshes;
sequential reset without false short-circuit; notification after playback reset
and before refresh; absent-coordinator repository fallback accepts only saved.
Resource/cleanup, privacy, persistence, defaults and locator ownership unchanged.

Tests changed: new direct deferred/rejection, receiver, DEV/package, fulfilled/
rejected removal, reset and repository-status cases. App.test.tsx unchanged with
baseline SHA-256 retained; existing integration assertion preserved.
Diff ceiling: 540 total added/deleted lines across three files (worker count).
Deviations: none reported. No validation commands or Git mutations performed.
Remaining validation: all ten commands in MOD-A-WORK-01. Model-backed portfolio
has a separately discovered host prerequisite blocker; no source acceptance yet.
