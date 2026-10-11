# Change Packet: IPv6 fixture correction01

Packet ID TTS-ADAPTER-LAYOUT-01-WORKER-IPV6-CO-01. First bounded correction;
sole writer now idle. Independent acceptance pending; no deviations or blocker.

Authorization: IPV6-CORRECTION-ORDER-01.md SHA256
91d5dd8687bca4755f6b2e6479b9674818739dd190d35966ed351a3496f7439f.
Bound independent FAIL IPV6-POSTCHANGE-20261011-01 SHA256
302bc8a498935afeeae4c52d2c5dd92abc50a8b9c2afad044a34920a8bf3e4c1;
after.json SHA256 56e405f6c46b1da5850eca38854cdd3fe0cd75e914828bf85d457cc7bf48331a.

Only apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs changed, in
the real locked-Python IPv6 test's case metadata/destructuring. Explicit
attempts defaults to1; the repeated-probe case explicitly specifies2. The
ambiguous text-based attempt inference was removed. All17 cases, actual-event
assertions, counters, rejection/admission assertions, forced-exit fixture and
socket cleanup remain intact. Production policy, budgets and guide are byte
identical. Exact pre-correction test bytes are retained under before/.

Before and after, HEAD7bbad9d5bef3a83c913ea5d7b948213a05bb0362 and branch
codex/tts-adapter-layout matched the authoritative report; index stayed empty.
Other34 source identities and260 protected identities match the failed report.

New immutable ignored evidence:

- source-identities.json:35 exact identities; SHA256 ded58e4af9d091ee9f3f2ba5b517cb642660df44a7eef9955f5c5dfc630ac57c.
- diff-accounting.json:7 added/3 deleted=10/16 correction lines;272/450 cumulative IPv6 increment,3669/3900 full-unit additional; generated151/300 and relocated1614 unchanged. SHA256 ca2f318f594d0192877c6864f17cc962db22dba0de08d3571021fac54079008c.
- correction.diff SHA256 23af06908689b7e917fc7c20f18334461ee4b821c0a70217825bfb96d13f835e.
- protected-identities.json SHA256 157e2df4a2800a121803b6f2acc40041728950fd96742441cefd5aa9242afaeb.
- artifact-reuse.json SHA256 e6515bf8a35804f986ff40714d05fbf6d35dfb2e7967c95f85b3115c1b29bbce: fresh byte/hash checks for25 artifacts,20 authorities and2031/2037 frozen resources; complete actual Piper/v4/desktop02-core closures2024/13085/2024 remain exact. Baseline artifact receipt SHA256 989729d5b132435846cd55382969f940813e9ef2483849d0cb7c95cc38621ea2.
- reuse-exclusion-reference.json SHA256 5c9099991c308702083e0be424fff68d5782b5e0becacabce520f56d03fd134e: all three runner/test/guide paths remain excluded from freshly enumerated complete trees, bound ZIP members, retained NSIS input and explicit Tauri resource inputs. The original full reuse receipt9195bed4a9d2b9fdb2224d98d9179831ef126698bb62b98e80c835f9dfad24c1 remains unchanged.

Restricted host checks (normal local PowerShell outside sandbox), chunk06ce1d:

```powershell
pnpm.cmd exec prettier --write apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs
node --check apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs
git diff --no-index --numstat -- tmp/evidence/tts-adapter-layout/worker-ipv6-correction-01/before/tts-adapter-layout-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs
```

Prettier and Node syntax each completed exit0; numstat returned expected exit1
for differences,7/3. restricted-checks.json SHA256
63527876e599cc52250a42c8a67f484a3b0c3e6e664d1a0236cc8fdd665250b4.
Read-only prepare/freeze/exclusion helpers completed exit0. These are writer
preparation checks, not independent test acceptance. Writer ran no tests,
provider/model imports or package rebuilds.

Required fresh independent gate: all three baseline commands, actual copied
provider proof and all22 registered campaign commands plus authority/history/
wheel/closure/recovery/identity evidence under the frozen order. Prior partial
provider PASS and all older reports remain immutable and do not accept this
test revision. Offline prerequisites and final process/firewall cleanup remain
owned by the independent validator/director.

Runtime, protocol, privacy, local inference, cancellation, bounded memory,
ordinary audio non-persistence, dependencies, CLI, timeouts, historical bytes
and application v3 admission are preserved. No staging, commit, push, PR,
installation or publication. Source writing is stopped for validation.
