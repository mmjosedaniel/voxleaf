# ADR-0068: Align Chatterbox effective available-RAM admission

## Status

Accepted policy on 2026-10-30 by explicit maintainer direction. Implementation
and acceptance are recorded in the [completed eight-finding correction plan](../../plans/completed/eight-finding-minimal-corrections.md).

## Context

The renderer already requires 7,042 MiB of currently available RAM for a fresh
Chatterbox start. Its measured peak is 4,994 MiB and the existing capacity
authority reserves the greater of 2,048 MiB and 25% of that peak, rounded upward.
Native optional acquisition and its snapshot instead used the frozen v7
package's 4,096-MiB declared floor. This discrepancy could permit acquisition
while a subsequent fresh start remained inadmissible.

## Decision

Preserve the effective requirement:

`max(4096, 4994 + max(2048, ceil(4994 * 25 / 100))) = 7042 MiB`.

Native select/download preflight and snapshot disclosure apply this current
application policy. Renderer fallback disclosure derives it from the existing
registry and capacity function. Cross-layer tests bind the native peak/reserve
inputs to that renderer authority. The native calculation remains local to the
optional-profile owner; no new policy service or shared configuration is added.

The immutable v7 acquisition manifest remains unchanged. Its 4,096 MiB is the
package-declared floor, not the effective current application requirement.
Total RAM remains 24,576 MiB. CPU, default CUDA 12.0, BF16 capability, VRAM,
storage, exact package identities and explicit consent gates remain unchanged.

ADR-0065's same-profile, same-language healthy loaded-owner continuation is
unchanged. It does not grant admission to a download, replacement or fresh start.
Unknown or insufficient current resources still fail closed.

## Consequences and alternatives

Devices with 4,096–7,041 MiB available RAM are rejected consistently before
acquisition or a fresh start. Exactly 7,042 MiB passes this dimension, subject
to every other gate. This is policy parity, not a new hardware benchmark or a
claim of universal host support.

Lowering renderer admission would remove an existing measured safety reserve.
Editing the published manifest would falsely rewrite immutable release identity.
Both alternatives are rejected. Component, process and persistence boundaries
in the canonical diagram remain applicable.
