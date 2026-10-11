# Change Packet

Target ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-01, within the same unaccepted
TTS-ADAPTER-LAYOUT-01 atomic migration. Status: implemented and frozen for
independent validation; no acceptance PASS is claimed.

Writer: configured clean_code_worker, /root/worker_resume, GPT-6.1 Sol high.
Sole source writer. HEAD remains
`7bbad9d5bef3a83c913ea5d7b948213a05bb0362`, branch
`codex/tts-adapter-layout`, index empty. Source writing is now idle.

Authorities:

- REDESIGN-WORK-ORDER-01 SHA256
  `58dc8270167dff2c35915731472330df0218eb2995fef2824caa1e2fca455b23`.
- Accepted REDESIGN-AUDIT-01 SHA256
  `d28008d4ce560edde1d38642fa28a2b3e3729c0d5afad686cab9d5f3b0253e52`.
- Independent REDESIGN-PREEDIT-20261011-01 PASS, raw report SHA256
  `ee0d1b30b2ffcae3a9a69053ca62802da7bbd4f387939baa151db6a1e1a5b176`.
- REDESIGN-ADDENDUM-01 SHA256
  `199eab4b142f94c7b9a47910f455ce3e2445d34019345fcca1b701f3aece7abe`.

The original clean-unit BASELINE-01 remains historical authority. Existing
POST-CHANGE reports01-03, prior packets and CLOSEOUT-01 remain unchanged.
The retained migration is not a new clean unit, and report03 remains FAIL.

## Exact edits

1. `apps/desktop/scripts/tts-adapter-layout-host.mjs`: pythonAuditPolicy,
   AuditReader, bootstrap and startService, plus private audit constants and
   StringDecoder import. Every subprocess.Popen/os.system event raises
   PermissionError before execution. Classification binds the optional probe
   to manifest-hashed current NumPy source bytes, exact function/module/file
   provenance, platform-specific default executable/argv shapes, absent cwd/env
   and default Popen executable/shell context. Explicit executable override,
   shell wrapping, extra arguments and unrelated callers remain unexpected.
   No process receives execution permission.
2. The same runner separates socket, unexpected-process, optional-probe,
   audio-write and payload/model-root-write denials, retaining bounded write
   observations. Activation, each denial and orderly exit emit content-free
   snapshots with leading/trailing newline and immediate flush. AuditReader
   consumes incrementally with a512-character retained line bound, at most32
   records, exact fields, safe integer counters0..4096 and monotonic denial
   transitions. Noise truncation cannot erase an already received violation.
   Admission requires exactly zero optional probes for Piper and one for
   Chatterbox, including forced arms; other denial counters must be zero.
   Missing activation, malformed/incomplete records or missing clean-exit
   evidence reject admission. Both first cancellation and restart results now
   carry admitted audit evidence after bounded child close/stream drainage.
3. `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`: two added tests
   execute the production-generated policy with the canonical locked repository
   interpreter and exercise strict streaming admission. The model-free matrix
   covers actual subprocess/os.system/socket/open calls, caught PermissionError,
   exact NumPy-style OSError fallback, string/list command shapes, wrong command,
   extra arguments, shell/cwd/env/executable override, wrong hash/source/module,
   unexpected caller, independent denial counters, persistence sentinel absence
   and optional-probe excess. sys.executable is asserted against the canonical
   `.venv` interpreter; missing prerequisites fail without fallback or skips.
   A real no-atexit os._exit process combines unterminated50k diagnostic noise
   with a caught unexpected denial and must be rejected under forced admission.
   Consumer tests cover fragmented snapshots, forced/clean requirements,
   zero/missing/excess probe evidence, noisy stderr, malformed/missing/extra
   fields, invalid counter types/ranges and decreasing counters. Existing
   assertions and tests remain intact. These tests have NOT been executed by
   the writer; their outcomes belong to independent validation.
4. `docs/development/tts-service-organization.md`: audit-policy explanation only,
   including unconditional denial, exact probe count and evidence limits.

## Scope, bounds and preservation

Exactly the three editable paths changed relative to report03. The complete
35-path source manifest includes unchanged collaborators and approved deletions.
All other32 identities and all260 protected identities match their immutable
pre-edit/report03 authorities. Source identities were rechecked after the
artifact-reading preparation; no drift was found.

Incremental diff: **504/520 added+deleted lines**. Runner178added/35deleted,
tests279added/1deleted, guidance11added/0deleted. Full35 migration:
**3415/3500 additional lines**, plus1614 mechanical relocated lines;
generated151/300 unchanged. No code/test compression or assertion removal.

The initial formatter-expanded439/400 ceiling was reported and source writing
stopped. Resumption followed the accepted immutable520/3500 addendum; this is
the documented bound change, not a hidden extension or third correction loop.
No other deviation remains from the order and addendum.

Protocol framing/deadlines, bounded PCM/memory, exact work identities,
stale suppression, identity-first cancellation, tree cleanup and restart remain
with their unchanged owners. Bootstrap retains exact interpreter/root/service
assertions. Public profiles, protocol/service/adapters, local inference,
privacy, model/dependency bytes and ordinary memory-only audio behavior remain
unchanged. No new production files, CLI modes, dependency, runtime admission,
installation, package rebuild, Git mutation or publication occurred.

## Actual artifact reuse evidence

`artifact-reuse.json` independently reads the retained physical bytes for the
writer's preparation receipt; it is not independent acceptance evidence.
All25 bound artifacts, the complete current frozen2031-resource tree and the
preserved prior2037-resource tree match report03 after.json/artifacts-after.json.
The old2037 tree remains preserved failure evidence; it is not the accepted
desktop input. The candidate continues to select desktop-02 explicitly.

Complete actual file inventories and every leaf's hash/size were inspected:

- Current core copied tree:2024 files, exactly manifest+manifest-file.
- Isolated current v4 copied tree:13085 files, exactly manifest+manifest-file.
- Frozen desktop-02 packaged core subtree:2024 files, exact same closure.

All three edited paths are absent from those actual complete closures, from
the retained ZIP member inventories and from fresh installer File inputs.
Tauri's explicit resource map excludes them; renderer/native/runtime sources
contain no references importing this host runner or the service-map document.
The unchanged frozen binary, installer/checksum and payload/archive/parts are
bound in the preserved25-file manifest. No manual evidence/hash refresh or
artifact regeneration was used. This proves reuse eligibility for the unchanged
package inputs only; it does not accept their execution under the new runner.

## Worker checks and recovery

Only the assigned restricted checks ran outside the sandbox in normal local
PowerShell, with process-local Corepack shim PATH and native PSModulePath.
Final syntax/format tool chunk `d12d6e`, exit0: exact statements are retained in
`syntax-command.ps1`, with outcomes/context in `worker-checks.json`.

- Restricted Prettier write for the two authorized `.mjs` files: exit0.
- `node --check` for each authorized `.mjs`: exit0.
- AST parsing only of generated null/probe Python policies: exit0.
- Restricted `git diff --check`: exit0.

No tests, copied-provider imports, model/native execution or acceptance gate
ran in this writer task. Offline preparation remains separately blocked until
the director restores and validator independently verifies exact firewall
prerequisites. No firewall or host configuration was changed by the writer.

Before snapshots preserve the exact three report03/pre-edit source byte sets
under `before/`. The first ignored capture helper encountered KeyError because
the fresh pre-edit report references report03 protected evidence rather than
embedding it. It failed before writing manifests; the helper was corrected
to follow that immutable reference. The completed retry only read source,
Git and artifacts. No source/artifact correction or rollback was involved.

## Frozen receipt identities

| File | SHA256 |
|---|---|
| source-identities.json | 57d35af0e36f05cc3b87bdbe6cf31934bc861240f459ed06166dda5995f237d7 |
| protected-identities.json | 157e2df4a2800a121803b6f2acc40041728950fd96742441cefd5aa9242afaeb |
| diff-accounting.json | 0166b78ecd4b4ad13a9fbaefba048928c1520a568962df027e27d3876faff529 |
| artifact-reuse.json | 2ad021d6810aabc853053c8f5638257b730fbd4a18547b191b37581dc1213292 |
| redesign.diff | 80e59d6a91df60f84a83277ee761f4a7c122a0e52eae88fe3f1470f28f2a7ee6 |
| worker-checks.json | 569934aa3495158b3b20a2c0ede6c0e2be85320ab1196fe79b6e676b0b8af201 |
| syntax-command.ps1 | f45af1dd27adae7ba613c0676969852a92e61bec6c43cc39f5a524941d75839f |

## Remaining independent validation

Run real-Python regressions first, then actual copied torch/chatterbox.mtl_tts
import proof under this generated policy and the exact embedded interpreter,
with independently verified firewall, sanitized environment, origin/hash
checks, exactly one denied optional probe and zero other forbidden attempts.
That proof loads no model; it does not replace the full candidate lifecycle.

All22 configured commands remain to run against this new frozen source manifest
with new receipts, supplemented by fresh wheel/history/closure/identity proof:

```powershell
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd test:python
pnpm.cmd build:python
pnpm.cmd package:piper-core:check
pnpm.cmd package:chatterbox-optional:check-source
pnpm.cmd package:chatterbox-optional:check-acquisition
pnpm.cmd package:chatterbox-optional:v3:check-source
pnpm.cmd package:chatterbox-optional:v3:check-acquisition
pnpm.cmd package:chatterbox-optional:v4:check-source
pnpm.cmd package:chatterbox-optional:v4:check-local
pnpm.cmd test:tts:adapter-layout:preflight
pnpm.cmd test:tts:adapter-layout:candidate
pnpm.cmd test:tts:adapter-layout:desktop --executable=C:/Users/mmjos/Desktop/workbeanch/voxleaf/tmp/tts-adapter-layout-desktop-02/voxleaf-desktop.exe
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:native-startup
pnpm.cmd package:windows:check
pnpm.cmd inventory:release:check
pnpm.cmd audit:release
pnpm.cmd test:chatterbox:dependency-security
```

Use the documented signed matching driver and exact embedded-v4 Python for
their respective host gates. Keep all model work sequential and all source
writers idle throughout validation. Missing prerequisites or any failure return
to the director; no self-repair, bypass, old-PASS reuse or hash-only acceptance.
