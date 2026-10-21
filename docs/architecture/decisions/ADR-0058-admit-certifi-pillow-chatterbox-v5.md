# ADR-0058: Admit the certifi and Pillow Chatterbox v5 refresh

## Status

Accepted and implemented on 2026-10-21. Preparation and integration are
independently approved and the exact prerelease is published. Production audit,
installed B06/B07, bilingual reader/speed, integrity and installer policies pass,
with original user state and firewall restored. Repository/browser/native
checks and fresh PR CI also pass for integration commit `194846a`. Exact
evidence is recorded in the [completed security refresh plan](../../plans/completed/chatterbox-certifi-pillow-security-refresh.md).

## Context

PR #266's release audit found vulnerable certifi and Pillow in the published
Chatterbox v3 graph. Historical passing audits do not establish current safety.
The user authorized this bounded dependency update and publication of exactly
three reviewed runtime assets, preserving prior releases and excluding a new
public VoxLeaf installer. V4 already identifies a separate local adapter-layout
candidate and must remain unpublished and unadmitted.

## Decision

Use the additive `voxleaf-chatterbox-v5` runtime with certifi `2026.10.19` and
Pillow `13.0.0`. Preserve the other 77 package versions, frozen v3 runtime
modules, six model-data identities, Torch/CUDA, profile, languages and protocol.
V5 always synchronizes from its hashed lock; it rejects `--no-sync` before
reading source or changing output. A changed lock alone is not remediation.

Bind acquisition to preparation commit
`702f80b5b688193e10ef58f9a5cbebb3a42a4090`, preparation review
`CB-V5-PREP-R2-20261020-ASTRA-230616Z`, and the exact reviewed archive, runtime
manifest and three part digests. The generator requires actual published
GitHub metadata with the fixed release ID, commit, tag, asset names, sizes,
digests, HTTPS URLs and uploaded state. It rejects a draft or partial release
before writing any authority. Generated publication and runtime evidence retain
the actual publication timestamp and distinguish package measurements from
historical hardware observations. No cross-environment reproducibility claim
is made for this assembly.

Only `cb/5` is eligible for discovery and execution. `cb/3`, `cb/2` and
`profiles/chatterbox-multilingual-v3-cuda-bf16-default-v4/2` are cleanup-only.
Observation, cancellation and failed acquisition preserve them. Explicit
removal owns those exact roots and existing cache/staging roots under the
unchanged containment, reparse-point, busy, shutdown and runtime-lock guards.
Unrelated versions and reader data remain outside removal. Retained-only state
uses the existing unavailable failure and unknown installed byte count.

Audit, dependency monitoring, license evidence, component inventory, installer
resources, installed harness and Settings disclosures select the same v5
authority. Historical manifests, locks and completed plans remain unchanged.
Download is 8,240,055,749 bytes; installed footprint is 8,236,500,113 bytes;
the conservative staging bound is 13,271,159,574 bytes. The 20-GB preflight,
all transfer limits and the historical compatibility gate remain unchanged.

## Consequences and alternatives

Using v5 requires a fresh explicit acquisition; old data may coexist until
explicit removal. No automatic migration, repair or fallback may execute the
vulnerable runtime. Replacing published v3 bytes, relabeling an old environment,
using v4, advisory suppression and a broad dependency upgrade are rejected.

Local inference, memory-only audio and cancellation remain within their existing
components. Piper and Qwen scope are unchanged. Security probes and candidate
ES/EN evidence supplement the dependency audit; they do not replace installed
B06/B07, bilingual, lifecycle, preservation and independent acceptance gates.
