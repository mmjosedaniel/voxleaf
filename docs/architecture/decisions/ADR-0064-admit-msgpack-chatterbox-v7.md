# ADR-0064: Admit the msgpack Chatterbox v7 refresh

## Status

Accepted design on 2026-10-27. The user authorized exact-asset prerelease
publication and V7 integration. Implementation acceptance and its limits are
recorded in the [refresh plan](../../plans/active/chatterbox-msgpack-security-refresh.md).

## Context

The production audit rejects immutable V6's msgpack 1.2.1 for
GHSA-j586-36cw-2gc2. A bounded real-library probe reproduces retained memory on
malformed map keys; this does not establish an EPUB exploit or cover every
upstream UAF variant. Overwriting V6 would break its published identity.

## Decision

Admit distinct `voxleaf-chatterbox-v7`, with msgpack 1.2.3. The other 78 pins
and permitted hash sets, frozen v3 service modules, Python/Torch/CUDA, six
models, profile identifier, languages, protocol and hardware gate are unchanged.
Preparation was approved by `CB-V7-PREPARATION-R2-ASTRA-20261027` and committed
as `a74fc85be0c93fe7abdecbfcaf633ecd6cf1a569`.

Release `425862980`, tag `chatterbox-runtime-v7`, publishes only the three
approved runtime parts as a non-latest prerelease. The independent V7 authority
requires actual public metadata with the exact commit, ID, tag, asset names,
sizes, digests, origins and uploaded state. Historical authorities remain intact.

Only `cb/7` can satisfy current discovery/execution. Retained `cb/6`, `cb/5`,
`cb/3`, `cb/2`, the legacy profile root and owned promotion residue remain
cleanup-only. Observation, cancellation and failed downloads preserve retained
data. Explicit removal uses existing busy, termination, containment and reparse
guards; it must not silently report dangling retained links as removed. NSIS
detection, consent, removal and residual-data checks cover the same exact roots.

Native admission, packaged resources, host harness, production audit,
monitoring, license inventory and disclosures select the same V7 authority.
Measured totals are 8,240,315,465 download bytes, 8,236,757,393 installed bytes
and 13,271,679,006 conservative staging bytes. Existing 20-GB preflight and
transfer/memory/concurrency/cancellation limits are unchanged.

## Consequences and alternatives

There is no automatic migration, execution fallback or new installation
architecture. Corrected use requires explicit verified acquisition. Existing
V6 installations are not repaired merely by publishing V7. Models remain
separate official-source downloads; no model or VoxLeaf installer is published.

Acceptance distinguishes exact local native admission and runtime execution
from complete live delivery. Earlier V6 HTTP read timeouts remain unresolved;
this dependency correction does not repair transport or claim a full new
download. Broad voice/GPU matrices are not rerun for this unchanged model/service
closure. Four advisory-service blind spots remain explicit. A future managed
on-device dependency installation design is deferred rather than introduced in
this security correction.
