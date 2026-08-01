# MVP release authority v1

## Status

Frozen and accepted on 2026-08-01 by
[ADR-0042](decisions/ADR-0042-freeze-mvp-release-authority.md) before M011
dependency, packaging, acquisition, or clean-host results.

This authority defines what M011 may build and what evidence is required. It
does not claim that an installer, optional-profile package, or public release
already exists.

## Product and claim boundary

The first distributable VoxLeaf target is Windows x64. Its product boundary is
smaller than the development registry:

| Release surface          | Exact profile scope                                                                                                         | Initial disposition                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Core                     | Piper 1.4.2 with `es_ES-davefx-medium` and `en_US-joe-medium` on CPU                                                        | Included in the per-user package after M011 closes its production dependency and licence gates                           |
| Optional quality package | Chatterbox Multilingual V3, exact evaluated `chatterbox-multilingual-v3-cuda-bf16-default-v4` identity, Spanish and English | Absent by default; separately downloaded, verified, installed, activated, and removed only if its independent gates pass |
| Development only         | Qwen Serena/Spanish and Aiden/English                                                                                       | Not shipped, downloadable, or advertised as an end-user release profile                                                  |
| Not shipped              | MOSS and every other historical candidate                                                                                   | No release artifact or availability claim                                                                                |

Historical evaluation and implementation records remain unchanged. A profile
can be implemented in a developer checkout without being part of the release.

## Windows package topology

Windows Known Folder APIs, not renderer strings or unvalidated environment
variables, resolve all release-owned roots. The names below describe the
required topology; M011 packaging must fail closed if it cannot resolve or own
them.

### Core package

| Component                 | Required release topology and owner                                                                                                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Installer                 | A versioned per-user Windows x64 installer. It does not request an administrator firewall rule, modify system Python, or add a general-purpose runtime to `PATH`.                                                                                                                         |
| Install root              | One installer-owned per-user program root under Windows Local App Data. Only the installer and its repair/uninstall path mutate it.                                                                                                                                                       |
| Desktop                   | The versioned Tauri desktop binary, WebView assets, restrictive CSP, closed commands, and native supervisor. The renderer gains no filesystem, shell, arbitrary-process, arbitrary-download, or model-path capability.                                                                    |
| Local service             | The production-only VoxLeaf Python modules and their minimal locked dependencies. Benchmark CLIs, candidate harnesses, test fixtures, private paths, audio, and development environments are excluded.                                                                                    |
| Python runtime            | A private, version-pinned embedded Windows x64 runtime inside the install root. The supervisor starts its exact absolute interpreter and fixed module. No system Python, `pip`, virtual-environment mutation, or user-supplied executable is used.                                        |
| Piper runtime             | The minimal locked Piper 1.4.2/ONNX CPU graph, including its required phonemizer/runtime assets. It is private to VoxLeaf and cannot start a listener.                                                                                                                                    |
| Core voices               | The exact davefx/Spanish and joe/English model, configuration, and model-card artifacts. Their final release manifest pins revision, byte size, and SHA-256 before packaging.                                                                                                             |
| Core manifest and notices | A read-only manifest, release component inventory, root MIT notice, third-party notices, voice model cards/provenance, and GPL fulfillment instructions included with the installed product.                                                                                              |
| Application data          | One native-resolved Local App Data root named for VoxLeaf. It may contain bounded preferences, reading locators, release/profile manifests, and content-free recovery state. It never contains EPUB copies, extracted book text, narration text, generated PCM, or arbitrary model files. |
| Book ownership            | EPUBs remain at user-selected locations and are read through the existing capability-free picker. VoxLeaf does not copy them into an install, profile, cache, or staging root.                                                                                                            |

The core runtime and both Piper voices are bundled with the installer. M011 may
narrow the core only through a new ADR if production dependency or licence
evidence makes that topology impossible; it may not silently replace the
bundled core with a network prerequisite after packaging results are known.

### Optional Chatterbox package

| Component              | Required release topology and owner                                                                                                                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manifest               | A repository-owned, versioned manifest compiled or bundled into the trusted native release surface. It maps one closed profile ID to exact HTTPS sources, revisions, files, byte ceilings, SHA-256 digests, licence/provenance references, supported host facts, and required free space. |
| Acquisition            | A native-owned client used only after explicit confirmation. The renderer supplies the closed profile ID and user intent, never a URL, header, archive, executable, hash, version, or destination.                                                                                        |
| Staging                | A unique operation directory below the VoxLeaf Local App Data staging root. Download and extraction remain non-executable there, are size bounded, reject traversal/link escapes, and are removed on decline, cancellation, verification failure, process restart, or promotion.          |
| Versioned installation | A profile-ID and package-version directory below the VoxLeaf Local App Data profiles root. Verified staging is promoted atomically; partial state is never discoverable as installed.                                                                                                     |
| Runtime and model      | Only the minimal production Chatterbox graph, exact model/tokenizer/codec artifacts, official bundled default conditioning, and required PerTh watermark path. The current benchmark environment is not a package template.                                                               |
| Discovery              | The supervisor resolves only an installed manifest whose profile ID, version, file set, sizes, and hashes match native authority. Environment-variable developer discovery is unavailable in an end-user release.                                                                         |
| Activation             | Installation does not load a model, stop narration, or change selection. A separate explicit Activate action invokes the existing identity-first profile transition after cleanup.                                                                                                        |
| Removal                | Allowed only through the native profile manager. It first invalidates an active profile and verifies child/audio cleanup, then deletes only the exact installed version and manifest-recorded files. Piper and reader data remain usable.                                                 |

The final optional download size, installed size, peak staging use, and required
free-space allowance are unknown until the minimal production graph exists.
The approximately 8.02-GiB developer footprint is planning evidence only.

### Repair, replacement, and uninstall

- Repair/reinstall replaces exact core files and preserves bounded reader
  state unless the user requests a full data reset.
- A manual versioned upgrade stops the owned child tree before replacing core
  files. Automatic updating is absent from the MVP.
- Uninstall removes the installer-owned program root. It offers an explicit
  application-data removal choice for the exact VoxLeaf data root, including
  optional profiles and staging. No cleanup command searches for EPUBs or
  model-like filenames outside those roots.
- Failed cleanup reports a content-free exact owned path category, not a raw
  user path, and leaves unrelated files untouched.

## Trust and threat model

| Surface                           | Classification                          | Authority and mandatory control                                                                                                                                                                          |
| --------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EPUB bytes and embedded resources | Untrusted user input                    | Existing bounded archive/XML/raster/semantic validation; no publisher scripts, styles, remote resources, or raw markup enter the reader DOM.                                                             |
| Reader WebView                    | Untrusted for native authority          | Restrictive CSP and closed typed commands. It cannot choose an executable, model path, URL, destination, digest, or installer operation.                                                                 |
| Native Tauri commands             | Trusted validation boundary             | Validate closed enums, bounds, lifecycle identity, and state before touching a child, network, or owned storage. Errors remain content-free.                                                             |
| Service standard streams          | Untrusted framed process input/output   | Existing protocol-v1 framing, size/allocation limits, sequence validation, backpressure, and invalidation. Malformed output terminates the complete child tree.                                          |
| Python/model child                | Integrity-checked but not OS-sandboxed  | One ordinary-user process tree, exact interpreter/module/profile/artifacts, no listener, bounded lifetime, and job-owned termination. Its normal user filesystem/network authority must be disclosed.    |
| Core package artifacts            | Trusted only after release verification | Version/revision, byte size, SHA-256, source, licence, and inclusion reason are fixed in the release inventory; installer/package integrity is verified before a release claim.                          |
| Optional artifacts                | Untrusted until verified                | Fixed HTTPS origin plus byte ceiling and SHA-256; staged as non-executable; traversal-safe extraction; atomic promotion only after complete verification.                                                |
| Acquisition network               | External and untrusted                  | Used only for explicit optional acquisition. No EPUB bytes, book/prepared text, locators, PCM, preferences, raw host report, or user identity is added to requests. Normal reading/narration is offline. |
| Local application storage         | Trusted owner, privacy-sensitive        | Explicit app-owned roots, bounded content-free state, no generated audio or book content, atomic manifests, and exact cleanup.                                                                           |
| Installer/uninstaller             | High-impact trusted code                | Per-user scope, exact roots, no broad glob deletion, no firewall/security exclusions, and repeated clean-host lifecycle proof.                                                                           |
| Updater                           | Absent                                  | No background service, metadata endpoint, or update authority. A future updater requires new signed metadata/payload authority.                                                                          |
| Signing credential                | External high-trust authorization       | Never stored in Git, build artifacts, ordinary logs, or developer configuration. Only an authorized release environment may access it.                                                                   |

Security claims are proportional: these controls provide strong application
containment but do not make Python or a model an operating-system sandbox.

## Optional-profile state authority

The native profile manager owns one closed state machine. UI labels may explain
a state but cannot advance it without the matching native result.

| State         | Meaning and allowed transition                                                                                                                                                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `absent`      | No verified package exists. Selecting Chatterbox moves the UI to `selecting`; it performs no network or profile change.                                                                                                                                                           |
| `selecting`   | Compatibility and installed state are rechecked. An eligible absent profile moves to `confirming`; otherwise it returns to `absent` with a content-free reason.                                                                                                                   |
| `confirming`  | The accessible dialog discloses identity, languages, measured download/install/temporary/free-space needs, hardware, cold start, licences, and removal. Cancel returns to `absent` without network, narration, or preference mutation. Explicit Download may enter `downloading`. |
| `downloading` | Native bounded acquisition reports content-free byte progress. Cancel/failure removes partial state and enters `failed`; success enters `verifying`.                                                                                                                              |
| `verifying`   | Size, digest, manifest identity, archive safety, files, and free space are checked before atomic promotion. Success enters `installed`; failure enters `failed`.                                                                                                                  |
| `installed`   | One exact version is discoverable but inactive until a separate Activate action. Activation uses the existing identity-first transition. Remove may enter `removing`.                                                                                                             |
| `failed`      | No partial package is executable or selectable. Piper/current narration remains unchanged. Retry returns to `confirming`; dismiss returns to the derived `absent` or previously verified `installed` state.                                                                       |
| `removing`    | New activation is blocked; any active identity is invalidated and cleanup verified before exact package deletion. Success enters `absent`; failure returns to `installed` with a content-free recovery action.                                                                    |

Opening Settings, checking compatibility, restoring preferences, changing
language, or merely selecting an absent profile never enters `downloading`.
Only explicit Download after `confirming` does so. Installation and activation
are deliberately separate user actions.

## Dependency and vulnerability policy

Every executable core or downloadable graph is audited independently against
its exact lock and inventory:

- a known critical vulnerability in a shipped/downloadable executable graph
  blocks that graph;
- a known high vulnerability reachable through the retained product path
  blocks that graph;
- a high vulnerability proven unreachable may receive one written exception
  that identifies the package/advisory, evidence, owner, compensating control,
  and an expiry no later than 30 calendar days or the next release, whichever
  comes first;
- medium and low findings are inventoried with disposition and do not
  automatically block the MVP;
- an unrecognized package or unavailable advisory source is an audit blind
  spot, never a clean result, and requires manual source/version/licence review;
- dormant server, UI, benchmark, training, notebook, and download helpers are
  removed rather than excused when the product adapter does not import or use
  them; and
- Piper-core failure blocks the core claim. Chatterbox-graph failure withholds
  the manifest/download/availability claim without converting it into a core
  failure.

Automated update intake may propose dependency changes but receives no merge,
signing, or publication authority.

## Component and licence inventory authority

Each included, downloadable, or explicitly excluded release-relevant
component has one content-safe inventory record with:

1. stable component ID and `core`, `optional`, or `not-shipped` scope;
2. ecosystem/type, exact version or source/model revision, and supported
   platform;
3. canonical source and artifact origin;
4. filename/role, byte size, and SHA-256 for every distributed artifact;
5. SPDX licence identifier where available, licence text/evidence location,
   copyright/notice owner, and redistribution obligations;
6. voice/model/default-conditioning provenance and whether a human identity is
   declared;
7. exact inclusion purpose, import/runtime reachability, and process boundary;
8. dependency lock identity and audit tool/date/result/blind spots;
9. install/staging owner and removal owner; and
10. corresponding-source/build-information fulfillment when copyleft terms
    require it.

Current intake evidence identifies the VoxLeaf repository as MIT, Piper and
its bundled phonemizer as GPL-3.0-or-later, both selected voice datasets as
CC0, and the evaluated Chatterbox code/model/default-conditioning as MIT with
PerTh watermarking retained. These are inputs, not complete release clearance.
M011 must pin the exact davefx/joe model cards and satisfy GPL corresponding-
source and notice mechanics. Chatterbox stays unavailable for end-user
acquisition until every production dependency and exact model, tokenizer,
codec, conditioning, and watermark artifact has matching evidence. VoxLeaf
makes no human-voice identity claim for the bundled Chatterbox conditioning.

## Integrity, disk, and privilege authority

- SHA-256 is mandatory for every bundled or acquired non-generated artifact;
  HTTPS alone is insufficient for optional acquisition.
- The trusted manifest fixes exact bytes and has no wildcard, mutable `latest`,
  or renderer-provided field.
- Acquisition checks declared download bytes and available staging plus final
  install space before network use. The confirmation displays measured
  compressed download, installed bytes, peak temporary bytes, and minimum free
  bytes from the exact release candidate.
- The installer, application, child, acquisition, repair, and uninstaller run
  as the normal user. Administrator elevation is not a product prerequisite.
- No user creates a firewall rule or antivirus exclusion. Normal installed
  inference makes zero external request; explicit optional acquisition is the
  only M011 product network operation.

## Independent release claims and gates

| Claim                                 | Required gate                                                                                                                                                                                                                                 | Effect of failure                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `piper-core-portfolio-ready`          | Exact core inventory/licences/integrity pass; versioned per-user package installs without developer tools; clean-host English/Spanish reader journey, offline narration, privacy, lifecycle, performance, repair, and uninstall pass          | VoxLeaf is not a distributable portfolio MVP                                                     |
| `chatterbox-optional-portfolio-ready` | Core remains usable; minimal optional graph, advisories, licences/provenance, manifest, disclosure, acquisition/cancel/failure/verification/install/activation/removal, offline bilingual narration, GPU resources, and clean-host proof pass | Omit the manifest, download action, and end-user Chatterbox claim; the Piper core may still pass |
| `unsigned-local-portfolio-build`      | Applicable portfolio claim passes and artifact is labelled local/unsigned/maintainer-operated; demo content is synthetic, self-authored, or public domain                                                                                     | Do not share it as a trusted general-public installer                                            |
| `signed-public-windows-installer`     | Piper core passes; external signing authorization exists; package signature and checksum are verified/published; antivirus/SmartScreen observations and limitations are documented                                                            | Public installer publication is blocked; local portfolio evidence may remain valid               |

Chatterbox is not required for the public Piper installer unless the release
explicitly advertises its download. Lack of a certificate is an external
authorization blocker only for public publication, not for honest local
portfolio validation.

## Evidence ordering and change control

This document and ADR-0042 precede release implementation and measurements.
M011 results may select pass, withhold, or block only within these rules. They
must not edit this authority to convert a failed graph or package into a pass.

Changing the core profile family, adding a network operation, widening native
or renderer capability, adding an updater, accepting new artifact origins,
changing cleanup roots, weakening vulnerability/licence/integrity gates, or
making a new public claim requires a superseding ADR and authority before new
result-bearing work.
