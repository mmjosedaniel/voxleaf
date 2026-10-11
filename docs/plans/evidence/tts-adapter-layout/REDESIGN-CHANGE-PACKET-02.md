# Change Packet

Target: TTS-ADAPTER-LAYOUT-01-REDESIGN-01; correction01. Sole configured
clean_code_worker, /root/worker_resume. Source writer now idle.

Order REDESIGN-CORRECTION-01 SHA256
`1c995061755465332c6d7f3d0595d045e8c1d020d5bba04acf59c285477dacc3`,
bound to independent FAIL raw report
`b293b07d2c81e90c67a1eecacaff0745510370fa3efa3cbf7867728820d4fd25`.
Parent redesigned order/addendum and prior packets remain immutable.

Only file changed: `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`.
In the real-Python policy test, fixture_path now supplies the fixture's runpy
input independently from the policy's nullable probe_path. All existing cases,
assertions, sentinel behavior and coverage are preserved. Two unnecessary
double-quote escapes were removed from the forced-exit template literal without
changing its generated Python bytes. No production policy or collaborator edit.

Diff:4 additions+4 deletions=8/12 correction lines; redesigned diff remains
504/520 incremental and3415/3500 full-unit additional lines. Mechanical1614 and
generated151/300 remain unchanged. No deviations, assertion removal or scope
expansion. All other34 source identities match the previous immutable packet.

HEAD `7bbad9d5bef3a83c913ea5d7b948213a05bb0362`, branch
`codex/tts-adapter-layout`, empty index; no staging, commits, push or publication.
No copied-provider/model execution, package changes or rebuild occurred.

Restricted normal local PowerShell checks:

- `pnpm.cmd exec prettier --write apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`: exit0, unchanged by formatter.
- `node --check apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`: exit0.
- `git diff --no-index --check -- tmp/evidence/tts-adapter-layout/worker-redesign-correction-01/before/tts-adapter-layout-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs`: expected differences status1, no whitespace diagnostics (tool chunk8d395e).

Tool chunk b3fb06 additionally ran `git diff --no-index --numstat`, returning
the expected differences status1 and4/4 counts; this is not a syntax failure.
No tests or acceptance gate ran in this writer task.

Frozen evidence:

| File | SHA256 |
|---|---|
| source-identities.json (full35) | aa045b1f5f04d506cf987d73ae03daf11cbedff808de067f065d5118049a9151 |
| diff-accounting.json | 32404a47a9d81040774cd615db30f20b59414216aa7a72a295432186ada5e73e |
| correction.diff | 8947f60a646827e55af8b457f3732f37bfe525a150b530110b1496d965559490 |
| artifact-reuse-reference.json | 834d0dfe1b48d86e44184fc174f78cb504d20038a8a947a6557c98ef1dc55076 |

Artifact reuse refers to unchanged `../worker-redesign-01/artifact-reuse.json`,
SHA256 `2ad021d6810aabc853053c8f5638257b730fbd4a18547b191b37581dc1213292`.
This model-free fixture is excluded from the previously inventoried complete
copied/package/Windows inputs; production-policy bytes are unchanged. As ordered,
the worker did not rehash complete runtime trees for this fixture correction.
Fresh identities/artifact checks and acceptance belong to the validator.

Remaining validation: fresh format:check:typescript, lint:typescript and desktop
tests, including actual locked-Python regressions; then all22 gates and required
policy/provider/history/wheel/closure evidence from the parent packet. Offline
prerequisites remain separately blocked, and provider/model/native gates require
independently verified exact firewall rules. Previous PASSs cannot accept the
new test bytes. Return any new failure to the director; no worker self-repair.
