# Audit Packet: real copied-provider socket observation

Target ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-01. Decision: BLOCKED. Risk: high.
Configured clean_code_auditor, read-only; no tests or source edits.
Primary target: pythonAuditPolicy and AuditReader.admit in the candidate runner.
Authority: REDESIGN-WORK-ORDER-01 and REDESIGN-ADDENDUM-01, unchanged.

The real copied-provider diagnostic records completed torch/chatterbox imports
from the isolated runtime, optionalProbeDenied=1, processDenied=0 and
networkDenied=1. Its content-free stack identifies socket.bind in
urllib3.util.connection::_has_ipv6 during import. The copied code tries the
local IPv6 loopback address with an ephemeral port, catches the denied operation
and continues. This proves a denied local attempt, not external transmission or
candidate acceptance. The exact Windows lscpu projection matches the policy.

The work order explicitly requires "zero tolerance for unexpected processes,
socket events and forbidden writes, including caught exceptions". The policy
blocks/counts bind and rejects any nonzero networkDenied. The observed rejection
therefore complies with the current authority; it is not an exception-handling
regression that can be repaired within that order.

Allowed correction files: none. Correction diff ceiling: zero. Proposed edits:
none. Do not exclude the bind, add a socket budget, change socket.has_ipv6,
preimport before installing the audit policy, add an environment bypass, modify
dependencies/provider, permit process/network execution or borrow earlier PASSs.

Decision required: no demonstrated correction conforms to the current order.
Resolution needs an explicit scope decision that legitimately eliminates the
attempt under equivalent controls, or an explicit revision of acceptance
authority. This audit authorizes neither. The user's prohibition on weakening
controls to obtain PASS remains binding. Preserve the evidence and recoverable
patch; keep acceptance blocked and the plan active.

Independent result is retained in REDESIGN-POSTCHANGE-03.md. Raw diagnostics are
provider-import-diagnostic.json and provider-import-network-diagnostic.json under
tmp/evidence/tts-adapter-layout/validation/TTS-ADAPTER-LAYOUT-01-REDESIGN-POSTCHANGE-20261011-03/.
