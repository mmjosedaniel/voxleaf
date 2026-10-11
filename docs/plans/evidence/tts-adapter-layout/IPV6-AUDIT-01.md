# Accepted Audit Packet and draft work-order terms

Target ID: TTS-ADAPTER-LAYOUT-01-IPV6-REDESIGN-01. Decision: CHANGE. Risk: high.
Configured clean_code_auditor, read-only; director accepts this explicit policy
revision and bounds following the user's authorization of the described test.
It is the same retained35-path migration, not a newly clean unit. A fresh
independent pre-edit PASS is required before the immutable implementation order.

## Evidence and revised invariant

REDESIGN-POSTCHANGE-03 raw SHA256
`96eeb727e82b4a83be71cb2553d41ffe2bf82fbd71dcf5c651538583b1c54176`
establishes successful copied-provider imports but rejected strict audit:
NumPy probe1, unexpected processes0, networkDenied1. The copied urllib3 source
calls _has_ipv6("::1"), creates socket(AF_INET6), attempts bind((host,0)), catches
denial and closes the socket. The preceding BLOCKED audit remains immutable.

The newly authorized acceptance invariant separately recognizes exactly one
known provenance-bound DENIED IPv6 capability attempt in each fresh Chatterbox
process, and zero in Piper. Existing NumPy budgets remain Chatterbox1/Piper0.
This changes accounting/admission only. Every socket operation remains denied
before execution, including the recognized probe. No binding, listening,
connection, resolution or transmission receives permission. All other socket
attempts, including caught denials, retain networkDenied and reject acceptance.

The exact predicate requires socket.bind, verified packaged urllib3 source SHA,
module urllib3.util.connection, function _has_ipv6, exact code filename and
module __file__, real AF_INET6/SOCK_STREAM/protocol0 socket, and address tuple
exactly("::1",0). Independently confirm the copied interpreter's actual event
shape before implementation. Missing authority or any mismatch fails closed.

## Closed implementation scope

Only three editable paths:

- apps/desktop/scripts/tts-adapter-layout-host.mjs
- apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs
- docs/development/tts-service-organization.md (policy explanation only)

Primary symbols: pythonAuditPolicy, AuditReader, bootstrap and startService.
Add a narrow descriptor for the already verified v4 manifest record
runtime/Lib/site-packages/urllib3/util/connection.py, rehashing it independently
in the embedded process. Add a distinct optionalIpv6ProbeDenied counter or
equivalent explicit name. Classify only the exact predicate and always raise
the existing denial afterward. Extend exact bounded schema and service budgets;
require CPU/IPv6 counts at both forced and orderly admission, networkDenied0.
Preserve monotonic snapshots, caught violations, no-atexit evidence, cleanup,
framing/PCM/work identities, cancellation, bounded memory and audio non-persistence.
All other32 source paths, historical authority, v3 admission and runtime bytes
remain frozen. No new source file, CLI mode or production abstraction.

Real locked-Python coverage must preserve every existing case and add:

- Exact trusted probe denied/caught/classified once, socket still unbound;
  close every socket in success and failure paths.
- Wrong hash, source path, module, __file__ and caller; address/port variants;
  wrong socket family/type/protocol. Negative cases must reach the actual audit
  event; an earlier argument error is insufficient evidence.
- Ordinary bind outside the trusted caller, plus connect/getaddrinfo even from
  it; every such event remains rejected.
- Repetition, Piper0 budget, Chatterbox missing/zero/excess counter and malformed
  or missing schema; both forced and orderly admission with exact CPU/IPv6 counts.
- Unterminated diagnostic noise, caught unexpected socket denial and os._exit;
  forced admission rejects without atexit. Preserve owner cleanup coverage.

Forbid permitting socket/process execution, blanket loopback/caller exemptions,
counter suppression, preimport before policy, socket.has_ipv6 changes, environment
bypasses, provider/dependency/model/runtime/protocol changes, weakened assertions
or timeouts, package regeneration, generated/history edits and Git/publication.

Ceilings:450 incremental added/deleted lines against REDESIGN-POSTCHANGE-03;
3900 additional full-unit lines (current3415); three paths. Allocation roughly
110 policy/lifecycle,280 adversarial coverage,20 guidance,40 formatting margin.
Generated151/300 and mechanical1614 unchanged. Stop for re-audit if exceeded;
never compress code or remove coverage to meet limits.

## Independent pre-edit gate

Normal local PowerShell outside the sandbox, pinned toolchain:

```powershell
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop test
```

Bind original baseline/report authorities, HEAD7bbad9d5bef3a83c913ea5d7b948213a05bb0362,
branch codex/tts-adapter-layout, empty index,35 source,260 protected,25 artifacts
and2031/2037 frozen resources before/after. Current owned patch is not clean;
original BASELINE-01 is its initial clean-unit anchor. Preserve known strict
policy FAIL separately from deterministic baseline PASS. No unrelated baseline
failure may be ignored. Under independently verified offline rules, project only
content-free booleans/types from the real copied bind event/socket/address to
confirm the proposed predicate. No model loading; diagnostic is not acceptance.

## Independent post-change gate

Repeat the three commands and all22 campaign commands in REDESIGN-POSTCHANGE-03
with fresh receipts/identities: Python format/lint/type/test/build; Piper check;
default/v3 source/acquisition checks; v4 source/local checks; adapter-layout
preflight/candidate/desktop (explicit frozen desktop02); check:portable; check;
native startup; Windows package check; inventory; release audit; exact-v4
dependency-security. Independently retain wheel/history/closure/recovery proof.

Before model execution, import actual copied torch and chatterbox.mtl_tts under
the production-generated policy, exact embedded interpreter and verified
firewall: correct origins, CPU1/IPv6-probe1, unexpected process/network/audio/
payload0, unchanged runtime hashes. This focused proof loads no model and cannot
replace the full candidate inference/cancel/restart/shutdown matrix.

Reuse artifacts only after fresh proof that all three paths are absent from
actual Piper/v4/Windows copied/ZIP/installer inputs and frozen bytes are unchanged.
All tests belong to the independent validator, with exactly one source writer
idle during validation. Restore/verify exact task rules before provider/model
work; remove only those rules afterward. No old PASS accepts new source bytes.

Director owns additive evidence and active plan. Service-map policy is the only
implementation-document edit; no system-diagram change is warranted. Preserve
all previous reports. User authorization grants only this exact denied-probe
classification, not arbitrary exceptions, network execution or Git operations.
