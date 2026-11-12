# U13 generated Piper core

Status: configured generation/check pass; generated-output [review R1](review-U13-CORE-R1.md)
is APPROVE (`FPA-U13-CORE-CR-R1-20261111`).
This follows U13 source/inventory approval and U14 writer approval. One final
core generation ran with pinned tools in normal local PowerShell outside the
sandbox. HEAD remains `a3241571944530d468e2f4f2d37a0a2394a8df84`; index empty.

```powershell
pnpm.cmd package:piper-core:write-manifest
pnpm.cmd package:piper-core:check
pnpm.cmd exec prettier --check services/tts/release/core/runtime-manifest-v1.json services/tts/release/core/core-package-evidence-v1.json
git diff --check -- services/tts/release/core/runtime-manifest-v1.json services/tts/release/core/core-package-evidence-v1.json
```

2026-11-12 UTC generation 00:47:43.561–00:48:35.606, exit0. It includes both
offline language smokes: Spanish240,744 and English225,140 payload bytes.
These are observed outputs, not a claim of deterministic generated audio.
The configured check at00:48:57.232–00:49:04.159 reports
`piper-core-release:current`, exit0. Static checks at00:50:44.616–00:50:46.132
both exit0. No duplicate build or smoke and no model download occurred.
uv rebuilt/reinstalled the local service into the core environment; its warning
about ignoring the outer VIRTUAL_ENV is retained in the log.

The archive is213,924,241 bytes, SHA-256
`23D0305D78A239E19547D0200F9D314293027D298F1274E68BB38565E461BB40`.
The installed package has2,024 files totaling306,744,427 bytes. Exactly two
packaged files changed: the embedded component inventory and runtime manifest.
The inventory binds the Windows CPython3.12 ONNX wheel already verified in U13;
packaged runtime/voice files are unchanged. Tracked outputs were written only by
the generator, with original bytes preserved in ignored evidence.

| Output | SHA-256 |
| --- | --- |
| Runtime manifest, identical to packaged copy | `BF6D05EE74313230481C5B3BA83378946E144EF4A76A7849E8831371CE449613` |
| Core package evidence | `D8EEE9879FC857F6366A35936DF4CF2D437C78232185B9CA9A1E3E2D64F2A801` |
| Unchanged source manifest | `E04B83230117A8DEF052053BC2A71DF91FAFA7A45DFE6180C184403FC1136044` |

The intermediate2,164-file environment changed three files: local-package RECORD,
Chatterbox adapter and v7 authority writer. All three are excluded from staged
Piper output. This is not whole-environment equivalence. Actual G7 must bind the
refreshed environment and recheck its path-specific firewall policy. Core Python
executable SHA-256 is
`0B471133E110CFB53A061CAD528CE8E517D7B9AC41A0A396C39AD795A487FC14`.

## Input and artifact bindings

Ignored evidence lives under `tmp/evidence/five-pass-audit/`.
The62 generator inputs, including ten lock-bound cached artifacts, match before
and after: `49E79E4E5D4EA7BB0714DE23C0B503DC60CD78EAD591C499BCA2D78145D0937C`.
All26 frozen optional authority paths match the U14 baseline; this capture's
size/hash row format hashes to
`4F39CA72D978036D82A2A77C948B146F293E3FA1C0AA8BA88D21D028F6485E97`.
The check's2,027 output rows and2,164 environment rows remain identical:

- Outputs: `116930B614C6927C3CDD810FD870EAC21D10EA3CCFC1B54A86BE11117B29DEDE`.
- Environment: `1745241CB6C9D0D4E1BDEC9565626CF90EC4A2AEF56A750464BF64D28119F534`.
- Static16 inputs: `AAE5B4764153A36424FB48B5E3360CBDF207F9BE3D276359C86B8F2D32CB33E8`.

`u13-core-generate-01.log` SHA-256:
`A5DCF8C08EBD4F5B2E86D2C5756FF0E5B0C5E29E87685770D95271D2B2D83B5B`.
`u13-core-check-01.log`:
`95834A69E2CBDF865B38B0AE440A682D98F4987EF86A82A99061BAF3515CFEBA`.
`u13-core-scope-static-01.log`:
`A7C25662E5C7D7F4411F42A941FBC44F44D0F8CE09DE78A4819E267BDF6AFD45`.
`u13-core-delta.txt`:
`8C34584E7E44D61CE8E1023AD7748AECAB266E22EBAFFC108DCF06937C86450E`.

Closed47-path review manifest `u13-core-review-inputs.txt`:
`797E0729C45E4EB4B81260D6E8D158C15A34E83E5EE1D747D85951A6CDE683FD`.
Exact two-output `u13-core-review.diff`:
`47349E515DBEF111C3ECF64A9AD0105C84B5EE0CCB98CCDB8770B257C7F8CB09`.
Native binaries embed the changed runtime manifest. Fresh native/G5 and the
final installer/lifecycle gates remain required; no old binary/installer result
is renewed by this receipt.
