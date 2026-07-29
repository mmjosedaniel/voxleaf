# ADR-0022: Separate Qwen development VRAM admission

## Status

Accepted before corrective matcher implementation.

## Context

M010 applies one conservative result-blind capacity formula to both total and
currently available dedicated VRAM. For the exact Qwen/Serena development
entry, the measured `5,996` MiB peak becomes a `7,196` MiB requirement on both
facts.

The total rule correctly rejects an undersized device. The identical
available-memory rule also rejects the already-proven exact 8-GB-class
development host whenever ordinary desktop applications leave less than
`7,196` MiB free, even though the measured workload plus a bounded reserve
fits. That UI result is a VoxLeaf admission decision, not proof that Qwen
cannot run.

Qwen/Serena remains development-only because its standard startup,
throughput, cancellation, and quality gates failed. The correction must not
become a production support claim or weaken supported-profile safety.

## Decision

The detailed rule is frozen in
[`../qwen-development-vram-admission-v1.md`](../qwen-development-vram-admission-v1.md).

VoxLeaf retains the generic `7,196` MiB total dedicated-VRAM requirement for
exact Qwen/Serena. When and only when an entry is both `development-demo` and
`development-only`, its currently available dedicated-VRAM requirement is the
measured peak plus a fixed `512` MiB engineering reserve. Exact Qwen therefore
requires `6,508` MiB currently available.

The fixed reserve reuses the predeclared v4 Qwen engineering reserve; it is not
derived from the current compatibility result. Supported and fallback
profiles retain the original generic available-VRAM formula.

The native development gate, exact runtime-configuration check, fail-closed
host facts, one-process-tree rule, identity-first recovery, no automatic
retry, offline boundary, and content-free diagnostics remain unchanged.

## Consequences

- The exact configured host can offer Qwen when it has enough total VRAM and
  measured-workload headroom, without claiming that every 8-GB GPU is safe.
- Piper remains the supported and automatically recommended CPU fallback.
- Qwen remains optional, development-only, slower than real time under the
  frozen standard evaluation, and subject to truthful buffering.
- Closing background GPU applications may still be required when available
  dedicated VRAM is below `6,508` MiB.
- A runtime allocation failure remains contained through the existing
  recovery policy rather than hidden by retry, offload, or shared-memory use.

## Alternatives considered

### Keep `7,196` MiB currently available

Rejected for the development-only path. It communicates a conservative
VoxLeaf margin as if the already-measured model were technically impossible
on the exact host.

### Remove available-VRAM admission

Rejected. Total device capacity alone does not account for memory already
owned by desktop applications.

### Require only the measured `5,996` MiB

Rejected. It leaves no bounded engineering reserve for measurement variance
or runtime allocation.

### Lower the generic margin for every profile

Rejected. No evidence supports weakening supported or fallback admission.
