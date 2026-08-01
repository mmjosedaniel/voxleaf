# Piper corresponding-source fulfillment

The `voxleaf-piper-core-v1` binary payload derives its executable Piper runtime
from the `piper-tts` 1.4.2 Windows wheel identified by SHA-256
`9c4a3a11f5889ea9d0df4414dce2bd9bee5ce7d9cf604c8fd5e307441d4c031f`.
PyPI's provenance record binds that release to upstream commit
`d6975e21a440c0d8b6e5fb7c41027409af13d44d` and tag `v1.4.2`.
VoxLeaf omits dormant server, download, training, command-line, and Chinese-
phonemization helpers that its local adapter cannot reach. It does not modify
the retained upstream files.

Rather than relying on a later written offer, the same payload includes:

- `sources/piper1-gpl-d6975e21a440c0d8b6e5fb7c41027409af13d44d.tar.gz`,
  the exact full Piper source tree with its Python/C source, build scripts,
  `COPYING`, and CMake configuration; and
- `sources/espeak-ng-212928b394a96e8fd2096616bfd54e17845c48f6.tar.gz`,
  the exact source revision named by that Piper CMake configuration and used
  to build the statically linked phonemizer and packaged language data.

The hashes and sizes of both archives are frozen in
`source-manifest-v1.json` and repeated in the runtime manifest. The Piper tree
contains the build options and exact espeak-ng revision. Build prerequisites
such as CMake, a Windows C/C++ toolchain, Python development headers, and the
locked ONNX Runtime dependency are not installed by VoxLeaf; they are ordinary
tools used to rebuild the upstream wheel from these sources.

VoxLeaf does not modify espeak-ng or the retained Piper files in this payload.
The repository's own service and adapter source remains available under the
VoxLeaf MIT licence.
