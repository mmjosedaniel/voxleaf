# Change Review Report

**Review ID:** `CB-V6-INTEGRATION-R1-ASTRA-20261024`
**Task ID:** PR #272 — Chatterbox v6 production integration
**Verdict:** **BLOCKED** — required acceptance evidence remains missing; one confirmed correction is also required.
**Base commit and reviewed HEAD:** `e46eb99c542b27a891aae6ee20d68c525d79f5f1`

**Reviewed paths and identities**

The closed scope is the supplied 73-path manifest plus the five unchanged supporting paths below: **78 paths total**, including all 40 task-owned changed paths.

Immutable references in the supplied `v6-integration` evidence collection:

| Artifact | SHA-256 |
|---|---|
| `integration-review-r1-inputs.json` | `a1fc9a8b54617387601ec5c83b988b074b1e6c1f9e17d29c7dae52249e3b6372` |
| `integration-review-r1.patch` | `7b7e3d82a9e0c2b6161e1db0c30cbc06b3da8cab27f8b1bc0de4df34cf08fc46` |
| `integration-review-r1-new-files.json` | `f85a79380899b9b542f7036d82efb5373478483e51db6a2d197e5f99f1e0c43d` |
| `foundation-inputs.json` | `1ae37ef04765bd34304d635b6c730e990c22f561cd4ca80758c4db2465cc47b0` |

Additional supporting identities, all `UNCHANGED`, matching before and after inspection:

```text
apps/desktop/src-tauri/src/main.rs
SHA256 c932cde5e72a0e5551b2f7e1b1627dcafb5765700e8e3600dc38c83f8b07bfeb
Blob   705cc1690da67546cf201805b27eb75a092c68a8

apps/desktop/src-tauri/src/tts_service_supervisor.rs
SHA256 984e930c222c8ae107022d5e7a44780feb3b892c1342213fa810ccf178616806
Blob   a8cdcfd4697bd016f992286226eb3dd740869ca4

.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md
SHA256 a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae
Blob   16ba1a7002366ad9312223d51dace7902d6ae751

docs/architecture/decisions/ADR-0061-owned-promotion-backup.md
SHA256 ba5b4fbedd38c4c067cfd56ca35d380e7fc9f169d31a37cf5fe98c94b190a2eb
Blob   e3e8dbc36d14249579978f4e6fa19803a00a840a

docs/architecture/decisions/ADR-0052-admit-security-refreshed-chatterbox-v3.md
SHA256 fb39fa35416260ff9a216a49e578cfcb7410c4af48f81a3cc10d1006e15421e7
Blob   9d395128e793c467447a3f4370231907ccbc8b78
```

**Identity recheck: PASS.** Base/HEAD, all recorded statuses, SHA-256 hashes and filter-aware blobs match. The actual changed-path set equals the supplied 40 paths; the index is empty. All 796 supplied foundation-input hashes also match current files.

**Acceptance review**

Source inspection confirms consistent v6 selection across native admission, installer resources, acquisition harnesses, dependency monitoring, inventory and audit. The new authority validates the fixed release/commit/tag and exact uploaded assets before writing; generated public fields match the supplied GitHub readback.

V5 is retained for cleanup and cannot satisfy release-locked discovery. Historical authorities and completed plans are unchanged. Transfer bounds, compatibility gates, runtime locking, cancellation ownership and `.previous` safeguards remain intact. Tests retain existing assertions and add publication rejection, v5 rejection and retained-data coverage. No additional privacy, audio-persistence, locator or synchronization regression was identified in this patch.

**Test evidence reviewed**

These are attributed host results, not commands executed by this reviewer:

- `pnpm.cmd check`: exit 0; shared 209, EPUB 674, desktop 818 Vitest plus 97 Node, Rust 117/116 with two ignored helpers per mode, Python 645; quality checks and builds pass.
- V6/v5/v3 `check-acquisition`: exit 0.
- `pnpm.cmd audit:release`: exit 0, retaining seven Rust notices and four explicit Python URL/CUDA blind spots.
- `pnpm.cmd test:browser`: exit 0, 10 passed.
- R3 `package:windows:verified-core` and `package:windows:check`: exit 0. R3 predates the final guide edit and does **not** establish final-artifact acceptance.
- `pnpm.cmd test:native-startup`: coordinator reports exit 0; the inspected log confirms model-free startup, lifecycle, cancellation and reader checks. Post-run user-data restoration verification was still pending at the latest supplied status.

**Findings**

**F1 — P2: Retained-v5 removal can falsely report absence.**

- **Location:** `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, new retained-v5 removal call at line 2185; `remove_contained_directory` at lines 783–788; `retained_package_exists` at lines 731–733.
- **Trigger:** `cb/5` is a dangling directory symlink/junction, with no active v6 package.
- **Consequence:** New `owned_path_present` detection exposes the entry as retained/unavailable. Explicit removal then calls `Path::exists()`, which follows the dangling link and returns false. The helper returns success without validating or removing it; `remove_with_manifest` reports `Absent`. The next snapshot reports `Failed` again because the retained entry still exists.
- **Evidence:** The contradictory detection/removal branches establish this source-level defect. The expanded symlink regression uses a live target, so it does not cover this trigger. No runtime reproduction was performed by this reviewer.
- **Bounded correction criterion:** For retained-v5 cleanup, only an explicit `symlink_metadata` `NotFound` may establish absence. Dangling/reparse or inaccessible entries must fail closed and remain discoverable. Add a focused regression asserting removal does not return successful `Absent` while the entry remains; preserve normal-directory removal and external-target safety.

**Remaining uncertainty / required next action**

Correct F1 and supply host regression evidence. Final approval additionally requires:

- Final R4 packaging/check evidence for the current bundled guide.
- V6 installed B06/B07, recovery and acquisition journeys.
- Required four bilingual native/installed reader and speed arms.
- Installed integrity and current-artifact lifecycle evidence.
- Required firewall-enforced offline validation and verified restoration of original user data.
- Fresh integrated-head hosted CI at the authorized publication stage.

Issue a new review request and immutable report after correction and evidence completion. Historical v5/CLB results cannot satisfy these v6 gates. This report grants no validation approval or Git authorization.
