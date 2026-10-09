# Piper corresponding-source fulfillment

The `voxleaf-piper-core-v1` binary payload derives its executable Piper runtime
from the `piper-tts` 1.8.0 Windows wheel identified by SHA-256
`5da9bfdb05dfe15da3536859d422e605483ffa6d2b3ec2c5b9593bae6b5aa6a4`.
PyPI's provenance record binds that release to upstream commit
`639388b6317fc4731e91d53da42aea68fd4166ff` and tag `v1.8.0`.
VoxLeaf omits dormant server, download, training, command-line, and unused-language
phonemization helpers that its local adapter cannot reach. It does not modify
the retained upstream files.

Rather than relying on a later written offer, the same payload includes:

- `sources/piper1-gpl-639388b6317fc4731e91d53da42aea68fd4166ff.tar.gz`,
  the exact full Piper source tree with its Python/C source, build scripts,
  `COPYING`, and CMake configuration; and
- `sources/espeak-ng-724808c5a83f9ef95fdd0db886ba7ba537ff224a.tar.gz`,
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
