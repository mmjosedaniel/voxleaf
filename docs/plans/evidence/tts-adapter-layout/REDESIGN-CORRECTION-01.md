# Redesign correction order 1

ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-CO-01. First correction of the explicitly
authorized redesign; prior campaign reports and two-loop stop remain intact.
Bound to independent FAIL report
`TTS-ADAPTER-LAYOUT-01-REDESIGN-POSTCHANGE-20261011-01`, raw SHA256
`b293b07d2c81e90c67a1eecacaff0745510370fa3efa3cbf7867728820d4fd25`.
Its before/after full identities PASS; HEAD and empty index remain unchanged.
Validator is idle. Parent work order and addendum retain all authority.

Exactly one source writer, the existing clean_code_worker, may edit only
`apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`:

- Remove the two unnecessary escaped double quotes reported by ESLint at line197.
- Give the fixture path a separate Python global name so pythonAuditPolicy's
  `probe_path=None` in null-authority cases cannot overwrite the fixture input
  to `runpy.run_path`. Preserve all cases, assertions, policy bytes and coverage.

Maximum 12 incremental added/deleted lines for this correction, within the
existing 520 redesign and 3500 complete-unit ceilings. No other source edits,
new abstractions, assertion removals, package changes, rebuilds or Git actions.
Worker runs restricted formatting/syntax checks only outside the sandbox and
returns a fresh immutable packet with full35 identities and diff accounting.
Preserve the prior packet and report. Then remain idle for new independent
validation; no PASS from previous source bytes substitutes for fresh results.

Offline prerequisite remains separately BLOCKED. No copied-provider/model
execution until exact firewall rules are independently verified. The next
validator reruns all three pre-edit commands and, if they pass, every required
unaffected gate; required offline-dependent gates remain blocked if unavailable.
