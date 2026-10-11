# Change Packet: denied IPv6 capability accounting

Packet ID: TTS-ADAPTER-LAYOUT-01-WORKER-IPV6-01. Sole configured writer;
implementation frozen, independent acceptance pending. No deviations or blocker.

## Immutable authorization and baseline

- IPV6-WORK-ORDER-01.md SHA256 b6d8fd1e07700c53dd5c6cd3449cc026f3990893512c0cf5bfdeaaa729dd4449.
- Accepted IPV6-AUDIT-01.md SHA256 b16892a44a94d29056ef2bb52c99f2f63ce80d8959384020fe407eff041b25f0.
- Independent IPV6-PREEDIT-20261011-01 PASS report SHA256 2284035b5b95541326e767b6ef083bae038f4e473d9acdf7eb25e8277c9df3fa; after.json SHA256 57e01b3e1b34a4569aadbd74e5efb32c2452d95cf0900e2e4231ca5ff9cfb879.
- Copied-interpreter bind projection SHA256 d6789d06a105fa1fdc48ed571be39c60407efb7fbfef3c61742eff39e1e4083a. Packaged urllib3 source SHA256 2633bbdb69731e5ccb5cf4e4afd65605d86c7979cc5633126f50c92d5ad74a74.
- HEAD 7bbad9d5bef3a83c913ea5d7b948213a05bb0362; branch codex/tts-adapter-layout; index empty. Exact three pre-edit byte copies retained under before/. Other32 implementation paths and260 protected paths match the independent baseline.

## Exact edits and required purpose

| Path | Symbols / purpose |
| --- | --- |
| apps/desktop/scripts/tts-adapter-layout-host.mjs | AUDIT_KEYS, pythonAuditPolicy/optional_ipv6_probe, AuditReader, bootstrap, startService: independently rehash the narrow manifest-bound urllib3 descriptor, classify only its exact denied bind, and require both exact probe budgets. |
| apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs | Extend existing schema/counter assertions and add two readable test blocks exercising the generated policy in locked Python and both admission arms. |
| docs/development/tts-service-organization.md | Explain denied IPv6 accounting, exact budgets and the CPython audit-event boundary. |

The IPv6 predicate requires socket.bind with exactly two arguments, a real
AF_INET6/SOCK_STREAM/protocol0 socket, tuple exactly ("::1",0) with an integer
port (excluding bool), immediate _has_ipv6 caller, exact urllib3 module,
code filename and module __file__, and verified source bytes. Classification
always reaches the existing denial and raises PermissionError before bind.
Chatterbox requires CPU1/IPv6-probe1; Piper CPU0/IPv6-probe0. Unexpected
process/network/audio/payload attempts remain rejecting, even when caught.

The retained network boundary intercepts socket.bind, socket.connect and
socket.getaddrinfo audit events. No wrapper or interception outside this
boundary was added. This packet does not claim coverage of APIs without such
events; exact-interpreter firewall blocks remain an independent prerequisite.

## Coverage retained and added (execution belongs to validator)

- Seventeen real locked-Python cases: exact denied/caught/unbound probe; wrong hash, source path, module, __file__, caller; host, port, bool-port and four-part address; family, type, protocol; ordinary bind; trusted connect/getaddrinfo; repeated probe.
- A content-free observer installed before the production audit hook asserts each actual event sequence without suppressing denial. Family/type/protocol negatives use valid socket arguments and must reach socket.bind. All fixture sockets close through context managers, including exceptional paths. The interpreter identity and unchanged fixture bytes are asserted.
- Real 50,000-character unterminated noise plus caught unexpected bind and os._exit: evidence remains rejecting without atexit. Existing CPU/process/noise/cleanup cases and assertions remain intact.
- Forced and clean arms require exact CPU1/IPv6-probe1 and reject missing/zero/excess budgets; Piper0 rejects the recognized attempt. Missing/malformed IPv6 schema and invalid constructor budget reject. Existing strict bounded streaming, monotonic snapshots and owner cleanup remain intact.

These describe test assertions, not executed test outcomes. Writer ran no
tests, provider imports or model execution.

## Frozen evidence and budget

All evidence here is new and ignored; earlier frozen packets remain intact.

- source-identities.json:35 identities, SHA256 83f7112e0a7547bf4b97f3535f8c491c9ff6148b31a1a97d3554cb0ffa2fcaa2.
- protected-identities.json:260 unchanged identities, SHA256 157e2df4a2800a121803b6f2acc40041728950fd96742441cefd5aa9242afaeb.
- diff-accounting.json:268/450 incremental added/deleted lines (runner43+9, tests206+0, guide10+0);3665/3900 full-unit additional lines; generated151/300 and mechanical1614 unchanged. SHA256 fb59bdc577184833f1f50010c13d514b679fe0077ab77abafffcef2ba6ebcd2f.
- ipv6.diff SHA256 bd9c6f88f99c134e92fbc8c8ac9b8d41f5a72a43e1e475ee2fd37bc43235e48e.
- artifact-reuse.json SHA256 9195bed4a9d2b9fdb2224d98d9179831ef126698bb62b98e80c835f9dfad24c1: fresh read/hash equality for25 artifacts,15 authorities,2031 new and2037 preserved resources, bound to baseline artifacts-after.json SHA256 76523c5928a8eda0a766a257527a4f779976de8e51a974bd0c471d0a9a0b1765.

Artifact proof enumerated and hashed complete actual closures: Piper2024,
isolated v4 13085, frozen desktop02 core2024 files, each exactly matching its
manifest closure. All three edited basenames are absent from those actual
trees, bound ZIP members, retained fresh NSIS input and explicit Tauri resource
inputs. Source/protected identities, HEAD and empty index were rechecked at
the end. No package was regenerated; this proves preparation/reuse eligibility,
not independent acceptance under the revised runner.

## Restricted checks and remaining independent gate

restricted-checks.json SHA256 c9e6ace89bda3af0d42dcb5340fd234f3a77b973bc003bd97820d78fb9b890be
records normal local PowerShell outside the sandbox, tool chunk6caab4 exit0:
Prettier for both scripts, node --check for each, and locked-Python AST parsing
of the generated policy specimen (generated-policy-syntax:PASS). The specimen
was not executed. git diff --no-index --numstat returned expected status1 for
differences. Read-only freeze.py finished exit0, tool chunk aa9139.

Independent validator must run pnpm.cmd format:check:typescript,
pnpm.cmd lint:typescript and pnpm.cmd --filter @voxleaf/desktop test; all22
registered campaign commands bound by IPV6-WORK-ORDER-01/REDESIGN-POSTCHANGE-03;
and fresh actual copied-provider proof under this generated policy before full
model gates. AuditReader now accepts its explicit third IPv6 budget parameter.
Fresh firewall/prerequisite, identity, wheel/history/closure/recovery and cleanup
evidence remain mandatory. Previous PASS/FAIL results accept no new source bytes.

Runtime/provider/model/authority/generated bytes, application v3 admission,
protocol, profiles, privacy, local inference, cancellation, queue/buffer limits,
ordinary audio non-persistence, dependencies, CLI and timeouts are preserved.
No staging, commit, push, PR, installation or publication occurred. Source writer
is idle after this packet; no source writing may overlap independent validation.
