# MVP support and release evidence authority v2

## Status

Accepted on 2026-08-03 through
[ADR-0049](decisions/ADR-0049-use-representative-compatible-host-evidence.md).
This authority supersedes only the independent-claim table and the exhaustive
clean-host interpretation in
[`mvp-release-authority-v1.md`](mvp-release-authority-v1.md). The v1 package,
trust, dependency, licence, integrity, privacy, cancellation, cleanup,
installation, and normal-user boundaries remain in force.

## Purpose

VoxLeaf supports a profile when all of the following are true:

- the implementation and packaged runtime exist;
- automated and interactive evidence exercises the behavior on representative
  compatible hardware;
- the application publishes and enforces the profile's operating-system,
  provider, memory, processor, storage, and runtime prerequisites; and
- the applicable licence, integrity, privacy, cancellation, lifecycle, and
  bounded-resource checks pass.

Support does not require testing every possible computer, GPU, driver, or
Windows configuration. No finite hardware matrix can provide that guarantee.
A machine that meets the published requirements is in the supported class;
individual driver, resource-contention, damaged-installation, or hardware
failures remain possible and are handled through compatibility checks,
fail-closed errors, repair, and troubleshooting.

Representative evidence must not be overstated. A result on one host supports
the compatible class defined by the published requirements, but it does not
promise identical latency or resource use on every member of that class.

## Accepted representative evidence

### Piper core

Piper Spanish and English are CPU profiles. Their executable registry requires
Windows x64 and does not require a discrete GPU. Repository, package, privacy,
cancellation, lifecycle, and bilingual narration evidence passes on the main
development computer. The maintainer also reports that VoxLeaf worked on an
independent older Windows computer with 16 GB RAM and a 4-GB-VRAM GPU. That
second result is valid representative functionality evidence; it is not an
assertion that the exact current installer hash or every lifecycle arm ran on
that computer.

### Chatterbox

Chatterbox Spanish and English pass the accepted bilingual runtime matrix and
the installed-package journeys on the current representative computer: Windows
11, an Intel Core Ultra 7 255HX with 20 logical processors, 33,752,997,888 bytes
of RAM, and an NVIDIA GeForce RTX 5060 Laptop GPU in the nominal 8-GB class.
Product admission remains conditional on the live gate already
published by the application and optional-package manifest:

- Windows x64 with CUDA bfloat16 support;
- at least 5,632 MiB total and 4,668 MiB currently available dedicated VRAM;
- at least 24,576 MiB total RAM and 4,096 MiB currently available RAM; and
- at least eight logical processors.

A nominal 8-GB GPU, represented as 7,680 MiB reported dedicated VRAM, remains
the evaluated and recommended class. Passing or failing this gate describes
compatibility of the current computer; it does not change the supported status
of the Chatterbox profile as a whole.

## Independent claims and current decision

| Claim | Decision | Scope |
| --- | --- | --- |
| `piper-core-portfolio-ready` | **GO** | The Windows x64 bilingual Piper core is implemented, packaged, locally validated, and backed by representative independent-computer use. It is an unsigned portfolio/local MVP, not a trusted public installer. |
| `chatterbox-runtime-support` | **GO when the published host gate passes** | Installed Spanish/English execution, offline use, privacy, cancellation, and bounded resources pass on the representative compatible computer. Incompatible computers must be rejected before acquisition or activation. |
| `chatterbox-optional-portfolio-ready` | **GO for local validation/portfolio use on a compatible host** | The separate validation build proves bounded acquisition, complete verification, explicit activation, installed bilingual use, and contained removal. This claim does not say that the ordinary build exposes Download or that every device has run an identical lifecycle matrix. |
| `chatterbox-download-available` | **WITHHELD in the current ordinary build** | The checked-in ordinary manifest still does not expose Download. This is a release-channel state, not a Chatterbox functionality failure. A later bounded manifest change may expose it without redefining hardware support, while retaining explicit consent and every v1/v2 integrity and lifecycle control. |
| `unsigned-local-portfolio-build` | **GO** | The exact `0.1.0` Windows x64/Piper candidate may be described as an unsigned local or portfolio MVP with its SHA-256 identity and limitations. |
| `signed-public-windows-installer` | **PENDING EXTERNAL AUTHORIZATION** | No product failure is recorded. General public publication waits for an authorized signing identity plus signature, checksum, and release-channel verification. |

The public signed state is not inferred from the local GO. Likewise, runtime
support does not imply that a particular build exposes an optional-package
download action.

## Evidence and change control

- Exact hashes continue to identify and verify artifacts. A new hash requires
  the applicable deterministic package and integrity checks, but not a claim
  that every possible computer has been retested.
- New operating systems, CPU architectures, providers, profile families,
  artifact origins, network operations, cleanup roots, or weaker security
  controls still require explicit authority before implementation.
- A support issue on one otherwise compatible computer is investigated as a
  defect or environment-specific limitation. It does not automatically revoke
  the profile for every compatible computer.
- Generated audio remains memory-only, book contents remain local, long-running
  work remains cancellable, and all acquisition and installation limits remain
  bounded.
