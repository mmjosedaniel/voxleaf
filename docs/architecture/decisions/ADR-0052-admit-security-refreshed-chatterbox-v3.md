# ADR-0052: Admit security-refreshed Chatterbox v3

## Status

Accepted for the bounded security refresh. The rebuilt installed journey passes
on the representative compatible host; exact identities and independent review
are tracked separately in the Chatterbox security dependency refresh plan.

## Context

The production release audit exposed five advisories in the published v2
runtime's Transformers 5.5.0 and urllib3 2.7.0 graph. The refactor did not cause
them. Replacing a lock alone cannot repair already published runtime bytes.
The user authorized a bounded dependency/package refresh and publication of
exact reviewed successor assets as a prerelease, preserving v2 assets and
excluding a new public VoxLeaf installer.

## Decision

Admit `voxleaf-chatterbox-v3` from the immutable three-part
`chatterbox-runtime-v3` prerelease. Select Transformers 5.17.0, Tokenizers 0.23.1
(required by Transformers), and urllib3 2.8.0; preserve the other 76 pins, Torch,
profile identity, six revision-pinned official model files and Spanish/English.
The upstream custom-generation trust-order repair and real-library security
probes supplement the advisory audit; candidate 5.10.4 was rejected despite its
empty advisory result. Include the exact upstream Tokenizers Apache-2.0 text.

Use acquisition schema 2/package version 3 with a fresh complete runtime
manifest. V3 has no historical runtime correction. Preserve all old manifests,
evidence and release assets. The preparation commit and reproducible artifact
identities are bound by generated runtime evidence v4, independently reviewed
preparation evidence and verified publication metadata.

Only `cb/3` is eligible for discovery and execution. `cb/2` and
`profiles/chatterbox-multilingual-v3-cuda-bf16-default-v4/2` remain cleanup-only;
never migrate, repair or execute them through the active v3 path. Retained-only
data produces the existing unavailable failure with unknown installed bytes,
so the existing Remove control remains usable. Observation, cancellation and
failed acquisition preserve it. Explicit removal owns only active/retained
roots and the existing cache/staging roots, with unchanged containment, busy,
shutdown and runtime-lock guards, including when acquisition is withheld.

Retain existing hardware gates. The 3,644-MiB benchmark-v12 reference and
83-second historical cold-start observation retain their original provenance;
they are not new v3 measurements. New representative ES/EN process-attributed
WDDM/PyTorch observations fit the 4,668-MiB available gate including its
1,024-MiB reserve. The ordinary installed journey supplies current product
timing, resource, privacy and lifecycle evidence separately. No universal
latency or hardware support guarantee is added.

The active dependency audit, licence evidence, inventory and dependency-update
monitoring select the same v3 lock as native admission. Preserve the four
explicit URL-package advisory blind spots. Advance the audit date only after
the complete production audit passes; never suppress a vulnerability.

## Consequences

V3 requires a fresh explicit download and activation. Retained v2 can coexist
on disk until explicit removal; this is not automatic failover or reuse.
Download is 8,239,933,601 bytes, installed footprint 8,236,377,725 bytes, and the
derived conservative staging bound 13,270,915,278 bytes. The 20-GB preflight
remains unchanged. Settings and package checks use these exact values.

Generated audio remains memory-only and inference local. Piper's bundled runtime
and model payload are unchanged. The shared process client's separately
reproduced cancellation/completion race is contained by validated shutdown while
preserving the original cancellation error; it changes no protocol or model.
Qwen3 remains deferred by ADR-0051. Coordinators, historical normalizers,
protocols, model data and frozen evaluation authorities are unchanged. Public
installer signing/publication remains a separate authorization and gate.

## Alternatives considered

- Advisory suppression: rejected because it leaves the vulnerable graph active.
- Updating only the old lock or replacing v2 assets: rejected because it breaks
  immutable package identity and does not establish real installed remediation.
- Reusing v2 repair/migration for v3: rejected because it could execute or
  misidentify the old dependency tree.
- Broad dependency/model refresh: rejected; only three necessary pins change.
