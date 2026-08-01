# VoxLeaf Piper core third-party notices

This notice belongs to the Windows x64 `voxleaf-piper-core-v1` payload. The
payload contains a private application-local Python runtime, the VoxLeaf local
TTS service, Piper, ONNX Runtime and its locked Python dependencies, and the
exact davefx/Spanish and joe/English voice artifacts. It performs no runtime
download and does not install or modify a system Python environment.

## VoxLeaf

VoxLeaf is distributed under the MIT License. The payload includes the exact
repository `LICENSE` as `notices/VOXLEAF-MIT.txt`.

## CPython 3.12.10

The application-local interpreter is the official Python Software Foundation
Windows embeddable package for CPython 3.12.10. Its complete licence history is
included as `notices/PYTHON-3.12.10-LICENSE.txt` and remains present in the
runtime as `runtime/LICENSE.txt`.

Source: <https://www.python.org/downloads/release/python-31210/>

## Piper 1.4.2 and its embedded espeak-ng phonemizer

`piper-tts` 1.4.2 is GPL-3.0-or-later. Its wheel embeds a native phonemizer
built from espeak-ng revision `212928b394a96e8fd2096616bfd54e17845c48f6`.
The payload includes the GPL text and the complete exact Piper and espeak-ng
source archives under `sources/`; see `PIPER-SOURCE-FULFILLMENT.md` for the
identity and rebuild relationship.

Sources:

- <https://pypi.org/project/piper-tts/1.4.2/>
- <https://github.com/OHF-Voice/piper1-gpl/tree/v1.4.2>
- <https://github.com/espeak-ng/espeak-ng/tree/212928b394a96e8fd2096616bfd54e17845c48f6>

## Piper voices

The exact voice artifacts come from `rhasspy/piper-voices` revision
`0d907f158acc877ddeebcbf827659ee13bea8bcd`. The repository declares MIT in
its exact README metadata; that declaration and the MIT text are included in
`notices/`. Each bundled voice retains its exact `MODEL_CARD`. The davefx and
joe cards identify their training datasets as CC0 and preserve the dataset
source link. Dataset provenance is not a claim about a speaker's identity or
an endorsement.

Source: <https://huggingface.co/rhasspy/piper-voices/tree/0d907f158acc877ddeebcbf827659ee13bea8bcd>

## Other locked Python components

The payload retains installed distribution metadata and packaged licence files
for every component. `notices/CORE-COMPONENT-INVENTORY.json` records exact
names, versions, sources, licence expressions, hashes, release reachability,
and audit references. Those notices include the applicable terms for ONNX
Runtime, NumPy, jsonschema, referencing, and the remaining minimal transitive
dependencies.

VoxLeaf and these upstream projects are provided without warranty. The
application's use of their names does not imply endorsement.
