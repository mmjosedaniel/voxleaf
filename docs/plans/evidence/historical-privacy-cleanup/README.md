# Historical evidence publication copies

The maintainer authorized removal of personal information from nineteen
historical reports: four desktop-state-subscription-hooks reports, one Linux
Rust repair report, one native Rust test-layout report and thirteen TTS
adapter-layout reports. Each is explicitly marked as a sanitized publication
copy and records the SHA-256 of its immutable original.

The originals are preserved byte-for-byte, with repository-relative entry names,
in the ignored local archive
`tmp/evidence/historical-privacy-cleanup-20261013/original-reports.zip`.
The adjacent `manifest.json` records the closed nineteen-file inventory, byte
lengths and hashes. These recovery artifacts must remain local and out of Git.

- Archive SHA-256: `f31b031d52805efb467de4b96597624bc988f4830a6df6ae58ccccdefb48fe23`.
- Manifest SHA-256: `b7d82ef6c189fb1ec0557a399a11cbe750c2b948b7d51a38204414ef7803730a`.

Report IDs, dates, commands, outcomes, failure distinctions, test counts, source
and binary hashes and limitations retain their historical meaning. Any earlier
hash or byte-identity statement about a report refers to the archived original,
not its publication copy. Redaction is not a new runtime approval.

| Placeholder | Meaning |
| --- | --- |
| `<REPO_ROOT>` | The original local repository checkout root. |
| `<LOCAL_APP_DATA>` | The ordinary host user's Local AppData directory. |
| `<CODEX_PRIVATE_LOCAL_APP_DATA>` | The separate application-private Local AppData view. |
| `<LOCAL_VALIDATION_TOOLS>` | The original local documentation-check helper directory. |

Commands and embedded receipt paths using these placeholders are normalized
historical evidence, not directly executable commands. Exact local arguments
remain in the originals. The ordinary/private filesystem distinction is
preserved. The local-only review manifest is identified as provenance rather
than linked through a personal absolute path.

No source, tests, completed ExecPlans or previous validation outcomes were
changed. No reports were deleted. This cleanup changes the current publication
copies only; it does not erase personal paths from earlier Git commits.
