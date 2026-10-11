# Audit Packet: candidate audit redesign

Target ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-01.
Decision: CHANGE. Risk: high. Auditor: configured clean_code_auditor, GPT-6.1
Sol high. Director accepts this packet as draft order terms, not implementation
authorization until independent pre-edit baseline and prerequisites pass.

This is the explicit user-authorized resumption after CLOSEOUT-01, preserving
its FAIL and both exhausted correction loops. It redesigns a demonstrated test
boundary within the same atomic migration; it does not claim a new clean unit.
HEAD remains `7bbad9d5bef3a83c913ea5d7b948213a05bb0362` on
`codex/tts-adapter-layout`, index empty, prior owned patch retained.

## Evidence and scope

The auditor inspected bootstrap/startService/candidateArm, independent Node
tests, report03, copied NumPy and unchanged runtime/packaging consumers.
`bootstrap` conflates subprocess.Popen/os.system and socket denial, raising
RuntimeError and incrementing networkDenied. NumPy check_support_sve calls
subprocess.run('lscpu', capture_output=True, text=True), catching OSError only.
Report03 reproduces provider import failure. Exception replacement alone cannot
fix the later counter rejection. Cancelled first arms currently lack admitted
audit results; payload-write denial has no separate counter. Existing tests
do not execute the Python audit policy. Successful copied-provider import under
a revised policy remains a hypothesis requiring execution.

Only these existing paths may be edited:

- `apps/desktop/scripts/tts-adapter-layout-host.mjs`
- `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`
- `docs/development/tts-service-organization.md` (audit-policy explanation only)

All other paths in the existing 35-path unit remain frozen context. Primary
symbols: bootstrap, startService, candidateArm, audit admission and ownership
through cancellation/shutdown. No production/runtime boundary changes.

## Required policy and implementation

1. Deny every subprocess.Popen/os.system launch before execution, including the
   optional probe, with an OSError-compatible PermissionError. No process,
   shell or command receives execution permission.
2. Separate socket denial, unexpected process denial, optional CPU-probe denial,
   audio-write denial and payload/model-root write denial. Caught unexpected,
   network or prohibited-write attempts still fail acceptance.
3. Admit only the denied exact trusted NumPy probe: hash-verified current
   runtime numpy/testing/_private/utils.py, check_support_sve, single lscpu
   command, default execution context. Reject wrong caller/path, extra args,
   shell wrapping, explicit environment/cwd changes. Command-name-only or
   blanket process-counter exemptions are forbidden. Capture argument-shape
   evidence only as content-free boolean/type projections, never arbitrary
   command arguments. Account for actual CPython Windows/POSIX audit shapes.
4. Exact bounded counter schema; missing, unexpected, malformed, negative,
   fractional or excessive values fail closed. Piper allows zero optional
   probe attempts. Current Chatterbox allows the independently reproduced
   single denied probe per fresh process; real copied import must verify it.
5. Expose the production-generated policy through a narrow helper in the same
   runner for real-Python tests. Preserve executable/root/service assertions in
   production bootstrap. Emit bounded, content-free activation and denial
   snapshots plus final orderly-exit evidence. Consume incrementally so bounded
   stderr truncation cannot erase a previously observed violation.
6. Admit audit evidence for both forced cancellation and orderly restart/
   shutdown after bounded exit/stream drainage. Missing atexit after taskkill
   must never imply zero counters. Preserve owner cleanup on every failure.
7. Real-Python tests use the synchronized locked repository interpreter at
   services/tts/.venv/Scripts/python.exe (Windows) or .venv/bin/python (POSIX).
   Missing prerequisites fail, without skip or PATH fallback. Existing CI
   prepares that environment. Execute actual subprocess/os.system/socket/open
   calls and caught exceptions; a synthetic execution-marker sentinel must
   remain absent. Cover exact probe fallback, wrong command/context/provenance,
   separate counters, caught writes, malformed/missing records, forced and clean
   admission. Fixture provenance does not replace copied-provider validation.
8. Independent post-change import proof must run actual copied torch and
   chatterbox.mtl_tts with production policy, exact embedded Python, sanitized
   environment and verified firewall. Verify origins/unchanged runtime hashes,
   one denied optional probe and zero unexpected/network/persistence denial.
   Load no model in this focused proof; the full candidate gate still follows.

Preserve framing, deadlines, bounded memory, identity/stale suppression,
cancellation/restart, profiles/models, local inference and memory-only PCM.
Keep historical authority, v3 admission and all package/installer bytes fixed.
Forbid engine/service/protocol/dependency/NumPy edits, new source files/CLI modes,
new dependencies, weaker assertions or timeouts, generated/historical edits,
Git mutations, installation and publication. No artifact rebuilding: prove
these paths are excluded from actual core/v4/Windows closures before reuse.

## Explicit bounds and validation

At most three edited paths, 400 incremental added/deleted lines versus report03,
and 3,400 total rename-aware additional lines for the full 35-path migration.
The earlier 2,983/3,000 leaves only 17 lines, insufficient for genuine Python
regressions and lifecycle admission. This accepted redesign explicitly allocates
approximately policy/lifecycle 180 + tests 200 + guidance 20; it does not permit
code compression or removal of assertions to meet the ceiling. Mechanical moves
1,614 and generated 151/300 remain unchanged. Exceeding bounds requires re-audit.

Pre-edit: bind original BASELINE-01 PASS, report03 and packet hashes; independently
rehash HEAD/index, 35 source, 260 protected, 25 artifacts, 2,031 new and 2,037 old
frozen resources. Preserve known provider failure separately; no candidate PASS
claim. Run outside sandbox with pinned pnpm:

```powershell
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop test
```

Obtain deterministic baseline PASS before final order; unrelated relevant
failures block. The original clean-unit baseline remains the historical anchor,
not a claim that today's owned patch is clean. Renew exact offline prerequisites
before copied-provider/model execution. Restore only task rules 0 through 5,
preserving the original eight, and clean the task rules after host work.

Post-change: all 22 commands listed in POST-CHANGE-03, against fresh identities
and new receipts, plus real-policy/copied-provider, wheel, closure and history
proofs. Use desktop-02 explicitly, verified matching driver, exact embedded v4
Python for dependency security, normal local PowerShell outside the sandbox.
Prior PASSs never accept new source bytes. No writer/validator overlap.

Director updates the active plan and additive evidence; preserve reports01-03,
CLOSEOUT-01 and previous packets. No system-diagram change is warranted.
