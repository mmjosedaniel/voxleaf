# Chatterbox official acquisition authority v2

## Status and scope

This authority is accepted before M011 Milestone 4B implementation or result
collection. It additively supersedes only the single-archive Chatterbox
acquisition shape in
[`mvp-release-authority-v1`](mvp-release-authority-v1.md). The Piper core,
evaluated Chatterbox profile, supported languages, hardware admission,
supervised-process boundary, narration lifecycle, and independent release
claims remain unchanged.

Milestone 4A and its withheld schema-v1 archive manifest remain historical
evidence. The v2 package identity is `voxleaf-chatterbox-v2`, package version
`2`, installed beneath
`app-local-data/tts/profiles/chatterbox-multilingual-v3-cuda-bf16-default-v4/2`.
No v1 payload is accepted as v2.

## Closed acquisition set

The package is complete only when one reviewed runtime archive and all six
model-data files below are verified together. Download order is runtime first,
then the six model files in this order. Concurrency is exactly one transfer.

The model authority is the public repository `ResembleAI/chatterbox` at full
revision `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18`. Each initial request is
`https://huggingface.co/ResembleAI/chatterbox/resolve/<revision>/<filename>`.

| Filename | Bytes | SHA-256 |
| --- | ---: | --- |
| `t3_mtl23ls_v3.safetensors` | 2,143,989,928 | `5abca8321ede76f8e61f1cc0d19aea6c946b28871017ce8726f8a69203f05953` |
| `s3gen.pt` | 1,057,165,844 | `9b9ff07e60b20c136e2b1b3d7563a24604e8d2c4c267888d1ee929dd0151d2a3` |
| `ve.pt` | 5,698,626 | `4b16d836bc598509860f6fa068165a8bb5e9ac84f05582dfcf278a5a372879f1` |
| `conds.pt` | 107,374 | `6552d70568833628ba019c6b03459e77fe71ca197d5c560cef9411bee9d87f4e` |
| `grapheme_mtl_merged_expanded_v1.json` | 69,989 | `69632f47220a788a52ce2661d096453c5655e9bf25289d89a8d832c46ee07dbf` |
| `Cangjie5_TC.json` | 1,920,163 | `7073fd9de919443ae88e0bd2449917a65fe54898a4413ed1edcc4b67f28bce8c` |

The frozen model total is 3,208,951,924 bytes. Repository snapshots, mutable
revisions, tokens, arbitrary filenames, configuration scripts, Python modules,
plugins, renderer-provided source data, and any seventh file are forbidden.

## Runtime delivery

The runtime is built by the repository release builder from the exact Windows
Python 3.12 lock and reviewed component inventory already accepted by M011
Milestone 2. It contains CPython, the 79-item reviewed runtime/component graph,
the frozen VoxLeaf service and adapter, Chatterbox, PerTh, CUDA/PyTorch inputs,
notices, and a complete runtime manifest. It contains no model weights.

The deterministic archive is divided without transformation into consecutively
numbered parts no larger than 1,900,000,000 bytes. Parts are published only as
assets of the VoxLeaf GitHub Release tag `chatterbox-runtime-v2`. The closed v2
manifest freezes every exact asset URL, filename, byte size, and SHA-256, plus
the reassembled archive SHA-256 and runtime-manifest SHA-256. The manifest may
contain at most four parts, at most 5,500,000,000 runtime download bytes, and at
most 5,500,000,000 extracted runtime bytes. A missing, unpublished, mutable, or
unmeasured runtime keeps the product manifest `withheld`.

The end user does not need system Python, `pip`, Git, a developer shell,
administrator rights, a Hugging Face token, or a manually created firewall
rule. Building and publishing the runtime are maintainer release actions;
installing it is a native VoxLeaf operation.

## Trust and redirects

Initial URLs are compiled into the native application from the checked-in
manifest. The renderer sends only the closed profile identifier.

Every request uses HTTPS without credentials, cookies, referrers, EPUB text,
narration text, audio, local paths, or host identity. At most two redirects are
accepted for one artifact. Runtime redirects may remain on `github.com` or move
to GitHub-owned release-asset hosts. Model redirects may remain on
`huggingface.co` or move to Hugging Face-owned cache, CDN, or Xet delivery
hosts. Every redirect must remain HTTPS, contain no user information or
fragment, and pass the native host allowlist. A redirect is transport only: the
frozen filename, exact byte count, and SHA-256 remain the acceptance authority.
Redirect URLs and signed query strings are never persisted or logged.

Hugging Face metadata, ETags, malware scans, and pickle scans are
defense-in-depth only. They never replace local verification.

## Bounded staging, cancellation, and promotion

One operation owns
`app-local-data/tts/staging/chatterbox-multilingual-v3-cuda-bf16-default-v4`.
The application checks free space before network access. Manifest measurements
must remain within these absolute ceilings:

- total transfer: 9,000,000,000 bytes;
- installed runtime plus model data: 9,000,000,000 bytes;
- peak acquisition staging/cache: 15,000,000,000 bytes; and
- disclosed minimum free space: 20,000,000,000 bytes.

The exact disclosure is derived from the final runtime measurements and the
frozen model total, not invented from the ceilings. No transfer may exceed its
per-file limit by one byte. Verified completed files may be reused only inside
the active operation after their size and hash are rechecked. Partial files use
a non-eligible suffix.

Cancellation is checked before and during every transfer, between every file,
during archive reassembly, hashing, extraction, model verification, runtime
verification, and before promotion. Cancellation, failure, application restart,
or a new attempt removes the complete operation staging tree. It never mutates
an installed version or the active narration profile.

Only after the complete runtime and six-file model set pass verification is the
staged directory renamed atomically to the versioned installed root. Activation
is a later explicit identity-first action. Removal first stops owned narration,
then removes only the exact versioned profile and acquisition staging/cache.
Piper remains usable after every absent, declined, partial, corrupt,
interrupted, stale, removed, or incompatible Chatterbox outcome.

## Deserialization and execution

The runtime manifest closes the complete executable file tree. The principal
T3 checkpoint is opened through `safetensors`. The three approved `.pt` files
are loaded only by reviewed call sites that pass `weights_only=True`. No model
repository code, arbitrary pickle, plugin, path, or executable is imported.
Downloaded bytes cannot execute or deserialize from staging.

## Result lineage and release gates

The v2 manifest remains `withheld` until all of the following are true:

1. deterministic source, redirect, integrity, limit, cancellation, restart,
   atomicity, safe-loading, activation, and removal tests pass outside the
   automation sandbox;
2. exact runtime parts are built, audited, measured, published by an authorized
   maintainer, and frozen into the manifest;
3. a compatible normal-user clean Windows GPU host completes acquisition,
   offline restart, Spanish and English narration, performance/resource,
   removal, and reinstall validation; and
4. the exact licences, provenance, notices, component inventory, and reachable
   vulnerability evidence pass M011 policy.

Evidence records the authority commit, execution commit, manifest SHA-256, and
content-free measurements. Network-backed evidence created before the authority
commit is invalid. If any gate remains unavailable, Chatterbox stays withheld
and the independently passing Piper MVP continues.
