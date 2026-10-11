# Correction Order 01

Order ID: TTS-ADAPTER-LAYOUT-01-CO-01. Correction loop: 1 of 2.
Parent order: TTS-ADAPTER-LAYOUT-01-WO-01; its unchanged scope, invariants,
forbidden actions, preparation ownership and ceilings continue to apply.
HEAD: `7bbad9d5bef3a83c913ea5d7b948213a05bb0362`.

Authority: immutable independent FAIL report
`TTS-ADAPTER-LAYOUT-01-POST-CHANGE-20261011-01`, raw SHA256
`a5f2d92a58744b642008abb7b2af47b995c87e7390ebf06559cd58c446a5565c`.
Read its complete findings and probes before editing. The validator is idle.
The same `clean_code_worker` is the only source writer; no delegation.

Correct only these existing allowlisted files as needed:

- `services/tts/tests/test_release_chatterbox.py`
- `services/tts/tests/test_adapter_layout.py`
- `services/tts/tests/test_chatterbox_sources.py`
- `services/tts/src/voxleaf_tts/release_chatterbox.py`
- `apps/desktop/scripts/tts-adapter-layout-host.mjs`
- `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`

Required corrections:

1. Resolve Ruff I001 and the five reported mypy errors by explicit imports and
   checked type narrowing. Retain all existing assertions, exact historical
   fixture bytes and fixed authority hashes; do not suppress diagnostics.
2. Restore `_copy_runtime_modules`' prior content-free I/O failure boundary:
   directory and write `OSError` become
   `ReleaseChatterboxError("chatterbox-package-staging-failed") from None`.
   Preserve complete historical resolution before mutation and no fallback.
   Add focused directory/write-failure regressions.
3. Correct the runner's verified Windows logical/canonical installed-v3 binding
   using the exact pair independently observed in the report. Record both roots
   and interpreter identities. Retain root/descendant link rejection and exact
   complete manifest/model verification; arbitrary escaping aliases remain
   rejected. Desktop process observation must bind to the verified pair and
   require exact canonical interpreter firewall coverage before inference.
   Add bounded regression cases for permitted Windows virtualization and
   rejected arbitrary root/descendant links. No change to native admission or
   installed user data. The director owns the additional exact firewall rule.

Do not run acceptance tests, regenerate packages opportunistically, or mutate
Git. Restricted formatting/syntax checks remain permitted outside the sandbox.
Determine whether these maintainer/test/runner edits alter any copied runtime
or generated authority identity; the current payloads exclude maintainer
tooling, but prove reuse from the actual manifests rather than assume it. If
regeneration is indispensable, report the precise affected output before any
writer so preparation stays separate from validation and recovery remains
verified. Preserve all prior receipts and frozen artifacts.

Return a new immutable Change Packet with the complete 35-path identity
manifest, correction diff and combined ceiling accounting, explicit artifact
reuse or new preparation evidence, and idle confirmation. The total ceiling
remains 3,000 additional rename-aware changed lines and 300 generated lines;
stop for re-audit before exceeding either. The next independent report must
run the required acceptance against the corrected identities; this FAIL and
its partial PASS results never become acceptance by refreshing hashes.
