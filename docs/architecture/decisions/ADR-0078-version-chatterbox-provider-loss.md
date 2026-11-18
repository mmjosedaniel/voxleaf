# ADR-0078. Version the Chatterbox provider-loss signal

## Context

During Prepare, the installed v7 Chatterbox worker can return the same error when Torch cannot use CUDA and when the model load fails. A native Windows CUDA probe can still succeed in the first case. Choosing a recovery action requires evidence from the worker that actually attempted the load. The [v1 transport contract](../tts-service-protocol-v1.md#versioning) is closed.

## Decision

The successor worker uses protocol version 2 in both the frame header and the control message. The native supervisor selects the dialect and entry point from the verified runtime identity before spawning it. The handshake must match that selection. The application continues to use the existing profile and language choices.

V2 adds one closed load error. Its reason is `torch-cuda-unavailable`, its service instance is the active child, and its operational error is `internal-failure`, `internal`, `fatal`. It carries no work identity. The producer can send it after checking the runtime and model inputs and importing the expected Torch identity, when Torch explicitly reports that CUDA is unavailable. An import exception, an indeterminate probe, unsuitable BF16 support, an artifact error, model-load failure or warm-up failure uses its existing failure path. The ordinary control, payload, audio and timeout limits retain their existing values. [Canonical v2 control schema](../../../packages/shared/schemas/tts-protocol-control/v2.schema.json)

The supervisor accepts this reason only from the exact successor during the owning Load. It verifies containment before reporting a provider failure to the caller. The renderer ties the result to the current Prepare, profile and language. The user can explicitly recheck or select a narrator. A stale session, mismatched reply or uncertain cleanup cannot grant recovery or trigger a restart.

## Delivery and evidence

Local validation uses an independently identified successor artifact and matching native configuration. The ordinary distribution channel keeps its published v7 authority. Promoting a successor to that channel requires verified release metadata and matching packaged selectors under the existing distribution policy. [Implementation plan](../../plans/completed/november-17-findings-corrections.md) · [V7 package authority](ADR-0064-admit-msgpack-chatterbox-v7.md)

The candidate package is staged outside the reader. Its snapshots report `removalSupported: false` for installed, failed and absent packages. Settings uses that capability before it can stop playback for removal. Ordinary optional packages retain their existing selection, consent and removal rules.
