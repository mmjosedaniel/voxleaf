# U13 generated outputs and downstream ordering

Read-only preparation, not executed acceptance. Recheck current definitions when
the work order opens. No generator, core build or installer has run for this plan.

## Target artifact selection

The inventory target is explicitly Windows x64 CPython3.12. Preserve source
distribution precedence as source provenance, and retain no-artifact identity
for the local path project. Registry packages without a source distribution
must select a compatible wheel or fail. Use URL-decoded wheel basenames and
compound interpreter/ABI/platform tags, with deterministic target preference
and rejection of equally preferred distinct rows. Never use host sys_tags or
the uv lock's first wheel as target identity.

Read-only dependency inspection found packaging only transitively through pytest
in the tooling environment and ONNX Runtime in core, with no existing direct
tool import or declaration. Prefer a bounded standard-library predicate for this
one fixed target; no dependency or lock change is authorized. Its explicit
compatibility order should cover cp312/cp312, cp312/abi3, cp312/none and older
CPython3 abi3 Windows tags, then compatible generic Python3 none tags and any
platform tags. Do not build a generic wheel resolver. Independent tests cover
compound tags, permutations, foreign/incorrect ABI, ambiguity, source precedence
and local provenance.

The core lock's expected ONNX Runtime1.31.0 artifact is
`onnxruntime-1.31.0-cp312-cp312-win_amd64.whl`, 14,888,841 bytes, SHA-256
`09d56445c1753e66e0912de69d3f0184016ad9a191dcd6925bf5dd570d2bfbe5`.
Its full existing lock URL must be asserted, not reconstructed from the filename.

## Generated output scheduling

The coordinator selects one final core generation after U14 source acceptance.
U13 first receives scoped code/inventory review with core gates explicitly
pending. Then generate/check the core once and review its generated output
before native/G9 acceptance. This avoids rebuilding the intermediate environment
twice; it does not waive downstream gates or claim unbuilt output is current.

The proposed generated tracked allowlist is exactly:

- `services/tts/release/component-inventory-v1.json`, written by
  `pnpm.cmd inventory:release`.
- `services/tts/release/core/runtime-manifest-v1.json` and
  `services/tts/release/core/core-package-evidence-v1.json`, published by
  `pnpm.cmd package:piper-core:write-manifest`.

The license evidence, source manifest, lockfiles and source notices remain
inputs. The separate license-capture command is outside this work order.
Generated core notices, runtime directory, ZIP, downloads and staging are ignored
outputs under `services/tts/release/core/dist`; the core `.venv` is refreshed by
the generator. Do not edit any generated file manually.

`write-manifest` already builds, verifies and runs both offline core language
smokes. Follow it with `package:piper-core:check`; do not add an identical second
core build or duplicate those smoke arms on unchanged inputs. The selected G7
reader/portfolio arms exercise a different product responsibility and remain
required.

Rust embeds the tracked runtime manifest through `tts_release_core.rs`.
Regeneration invalidates both default and locked native build identities.
Re-identify the refreshed core Python environment and rerun the selected G7
preflight; its firewall policy is path-specific and must still be checked.
G8's nine v7 input assets remain separately bound, but its native binary must
be rebuilt against the new manifest.

After U16, run default native startup, selected portfolio arms and native reader
resources before G9 replaces the shared release binary with the locked package.
An adjacent packaged core takes precedence over development configuration even
in default feature mode. If present, journal and temporarily rename only the
exact owned adjacent directory, then verify restoration. The historical
`tmp/evidence/deep-chat-audit/M2/retry-piper.ps1` illustrates this boundary;
its old identities must not be reused. The startup smoke supports an explicit
absolute executable, but portfolio uses its existing default binary path.

The verified-core Windows wrapper overwrites the tracked historical
`apps/desktop/src-tauri/release/windows-package-evidence-v3.json`. Preserve exact
original bytes in an ignored journal, capture new output there, and restore the
original on every exit. `package:windows:check` checks configuration/core and can
run after that restoration. The final installer/lifecycle evidence must bind
the new ignored artifact bytes and unique lifecycle receipt separately.

U14's later `voxleaf_tts/packaging/chatterbox_v7_authority.py` edit is excluded
from the staged Piper package by `_excluded_site_file`, as are RECORD and
uv_cache metadata. It is installed in the intermediate `.venv`, however.
Its scoped change does not invalidate checked packaged bytes; do not claim whole
intermediate-environment equivalence. At U13 choose one core generation point
and capture G7's actual environment after source freeze. Deferring generation
until U14 is an optional scheduling choice, with G9 core gates explicitly pending.
