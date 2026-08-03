# ADR-0046: Repair Chatterbox runtime closure and Windows path

## Status

Accepted on 2026-08-02; clarified on 2026-08-02 after installed first-use
diagnostics.

## Context

The first installed-package Chatterbox activation completed the closed download,
size checks, SHA-256 checks, runtime promotion, hardware admission, CUDA probe,
and BF16 probe, but narration stopped before synthesis. Content-safe direct
inspection found two independent package defects:

- the published runtime omitted
  `voxleaf_tts.generated.__init__` and
  `voxleaf_tts.generated.protocol_schemas`, although the packaged service
  imports that generated contract module; and
- the historical versioned installation root made one required Transformers
  path 261 characters long. Windows could resolve the file through a verbatim
  long path, but embedded Python and Transformers used a conventional file API
  and reported the existing file as missing; and
- the failed model-load probe created six Numba `.nbi`/`.nbc` cache files inside
  the otherwise immutable runtime tree. `PYTHONDONTWRITEBYTECODE=1` prevents
  Python bytecode but does not redirect Numba's independent compilation cache.

The three published `chatterbox-runtime-v2` parts are immutable and their
download, part, archive, and legacy runtime-manifest hashes already passed.
Replacing them would require another multi-gigabyte release and download even
though the correction consists of two repository-owned modules totalling
37,101 bytes plus a shorter application-owned directory.

A later installed-product attempt retained the selected Chatterbox identity but
returned contained recovery before audible narration. Content-safe direct
runtime and framed-service probes passed with conventional Windows paths, while
the same service failed model load with `engine-failure` when given the
canonical verbatim `\\?\` paths produced by Rust. Product review also found two
related first-use costs: generated Python/Numba cache entries could make a
previously correct installation appear invalid, and independent snapshot,
activation, availability, configuration, and start paths could each repeat
complete hashing of the same multi-gigabyte tree.

## Decision

Keep the published v2 runtime parts immutable and apply one native-owned,
fail-closed installation correction:

- the accepted legacy runtime manifest is identified by exact SHA-256
  `cb5055580a28a0c97e50535a8317ea506081230b70e0099d8fe0194591e1c635`;
- the two generated VoxLeaf modules, their installed paths, sizes, and SHA-256
  values are frozen in the v2 acquisition manifest and embedded in the native
  application;
- the corrected installed runtime manifest is identified by SHA-256
  `1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262`;
- the corrected installed package root is `app-local-data/tts/cb/2`;
- an existing exact legacy package is moved on the same volume to the short
  root, fully verified under the legacy authority, corrected, and then fully
  verified under the corrected authority;
- a fresh v2 download receives the same correction in staging before atomic
  promotion; and
- only `.nbi`/`.nbc` files under the exact Librosa Numba cache directory may be
  removed before legacy verification, future Numba cache writes are redirected
  to `app-local-data/tts/cb/cache`, and optional-package removal owns that
  transient cache; and
- removal owns both the corrected root and the exact historical root.

Generated interpreter caches are not package authority. A repair may remove
only allowlisted bytecode/compilation cache entries under exact
application-owned cache locations; it may never change, ignore, or replace an
authority-listed runtime or model file. Complete SHA-256 verification of the
corrected manifest remains mandatory after cache repair.

After complete size/SHA-256 verification succeeds, the native process may
retain one in-memory receipt keyed to the exact package authority. On reuse,
VoxLeaf recomputes a tree-metadata stamp covering contained paths, sizes, and
modification times. An observed authority or metadata mismatch forces complete
verification. The receipt:

- is never serialized or used across application processes;
- is invalidated before installation, repair, or removal, and is not reused
  when the authority key or observed tree-metadata stamp differs; and
- permits later snapshot/activation/start checks in that same process to avoid
  hashing the unchanged multi-gigabyte tree again.

Every application launch begins without a receipt and must complete package
verification again before using Chatterbox. A receipt is an optimization of
repeated checks, not an alternative trust authority.

This optimization is not continuous cryptographic verification. It protects
against stale, incomplete, corrupted, or observably changed package state. It
does not guarantee detection of a malicious process already running as the
same Windows user that preserves metadata or modifies files after the check.
Protection against a compromised same-user account is outside the portfolio
MVP threat model.

Package preparation, verification, promotion, and removal share one native
critical section. Renderer snapshot refreshes are deduplicated, and an older
asynchronous response cannot replace a newer selection result. This prevents
Settings polling, activation, and Play from racing over cache cleanup or
publishing stale optional-profile state; download and cancellation remain
concurrent outside the package-mutation critical section.

The critical section is process-local. The validation build therefore supports
one running VoxLeaf instance while optional-package installation, verification,
or removal is active. Cross-process package locking or enforced single-instance
startup remains an explicit Milestone 6 release-hardening item; the current
unsigned validation build is not promoted as a multi-instance public release.

Canonical paths remain the native trust and containment representation. At the
final child-process construction boundary only, convert `\\?\C:\...` to
`C:\...` and `\\?\UNC\server\share\...` to `\\server\share\...` for the
already-verified executable, working directory, `PYTHONPATH`, and cache path.
This conversion accepts no renderer-supplied path and does not alter discovery,
hashing, containment, or installed-package authority.

The correction performs no network request, accepts no renderer path or bytes,
does not modify model weights or third-party runtime files, does not activate a
profile, and never treats an unknown or partially matching package as eligible.
An interruption is recoverable only when already-written correction files have
their exact frozen hashes. Every other mismatch fails closed.

## Consequences

An already downloaded package can be repaired without downloading the
approximately 7.67-GiB optional payload again. The corrected installed total is
8,228,503,309 bytes, an increase of 37,504 bytes including the regenerated
manifest. The longest measured final runtime path falls from the failing 261
characters to 218 characters.

The first Chatterbox access in each application process still performs the full
integrity pass, and the first narration start still performs the model cold
load. Together they may take tens of seconds. Repeated compatibility, activation,
and start checks in the same process may reuse the verification receipt, but
activation remains explicit and does not load or start the model by itself.
The focused Windows path regression passes, and the exact installed supervisor
completes load, warmup, synthetic synthesis, and shutdown. Two unchanged cold
runs took `29.61` and `82.34` seconds, so cold initialization is variable rather
than a fixed `29.61`-second duration. The final unsigned validation
installer is `181,694,782` bytes with SHA-256
`289c93e63d07e0001b667d964396ea5a611a5bf38f411f9158e92e829d35f148`;
Defender reports no threats for that exact file. Its installed Spanish WebView2
matrix passes with `45.990`-second Quick command-to-audible, `1.23` warm
Prepared RTF, `3,808`-MiB peak VRAM, `4,865,605,632`-byte peak process-tree
working set, `469`-ms cancellation, `756`-ms cleanup, and zero generated files
or external requests. This proves only the development-host Spanish arm and
does not remove the disclosed cold-load cost.
Runtime libraries no longer mutate their verified installation with Numba
cache data. The cache contains compiled implementation data rather than book
text or generated audio and remains inside the application-owned removable
profile boundary.
The validation build remains unsigned and local-only. English narration,
application restart, removal/reinstall, Piper-after-removal, independent clean-
host evidence, multi-instance package coordination, signing, and public-release
gates remain open.

## Alternatives considered

- **Replace the published runtime-v2 assets.** Rejected because immutable
  release assets must not be silently replaced and the user would need another
  multi-gigabyte download.
- **Enable Windows long paths globally.** Rejected because VoxLeaf must not
  require administrator policy changes and third-party Python code may still
  use APIs that do not honor that policy.
- **Add only the missing modules at the historical path.** Rejected because the
  independent 261-character Transformers failure would remain.
- **Skip complete verification after repair.** Rejected because it would weaken
  the closed optional-package trust boundary.
- **Persist a verification stamp across application launches.** Rejected because
  filesystem state can change while VoxLeaf is not running. A process-lifetime
  receipt avoids repeated work within one run under the MVP assumption that no
  hostile same-user process mutates the application-owned package during that
  run. It creates no durable trust outside the frozen manifest and hashes.
