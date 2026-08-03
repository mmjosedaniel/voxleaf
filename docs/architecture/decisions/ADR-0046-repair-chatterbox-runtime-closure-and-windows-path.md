# ADR-0046: Repair Chatterbox runtime closure and Windows path

## Status

Accepted on 2026-08-02.

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

The initial integrity pass and Chatterbox cold model load may still take tens
of seconds; this ADR fixes startup failure, not the disclosed cold-load cost.
Runtime libraries no longer mutate their verified installation with Numba
cache data. The cache contains compiled implementation data rather than book
text or generated audio and remains inside the application-owned removable
profile boundary.
The validation build remains unsigned and local-only, and this development-host
correction does not satisfy the independent clean-host, bilingual lifecycle,
removal/reinstall, signing, or public-release gates.

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
