# Change Review Report

Review ID: APPS-SEEK-RACE-REVIEW-01. Task: APPS-SEEK-RACE-FIX-01.
Verdict: **APPROVE**. Independent change_reviewer, read-only; no tests run.
Base and reviewed HEAD: `520a8d074b7ddf7dc198fe99ecba38a47c6eeb40`.
Branch: `codex/apps-organization-follow-up`.

Scope: bounded observation repair, diagnostics and tests atop native extraction.
The refactor validator separately owns extraction/campaign acceptance.

| Reviewed path | Exact porcelain or clean | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `B03DAD1EEE757E190069C716382FC8B110449C29CE05B8737B21D23DF5354566` | `41d1e88909fe5f701058ac1abba2e47b8eb11f48` |
| `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `?? apps/desktop/scripts/native-smoke/resource-observation.mjs` | `105D556FAC20F4AA1C8CAE5AD99C519B39E6B03BD05FABBD3553FC04E18DD6B8` | `42f1d5d45b8e5b9a788f9fae88e1421ca2a638c8` |
| `apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/tts-scenarios.mjs` | `D2ED9AEEDE9DA8B6380BF9F8EED5C9DD954D6BE608B96CC268DAC4ED5CBE528F` | `5a34ac52db1d7d8f0a06b4ebc9f49f42544755b3` |
| `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `?? apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `E1594C5B9FCC36ABCA0399D82D9784F471390A0BBE05F6B030A64199DFAF8815` | `6d58be6af15cb48f106f89c59dac19da24fb8813` |
| `apps/desktop/scripts/native-smoke.node-test.mjs` | `?? apps/desktop/scripts/native-smoke.node-test.mjs` | `200401EDE116542BEA35752A3ED92D30FBEE318D7860D1BFAF66F685CBEA96AA` | `20ca00da5b3e3f138233a4228ec6dcfbac37cf6d` |
| `apps/desktop/package.json` | ` M apps/desktop/package.json` | `10154379F0DE51B6363F4ED5BBDB6ED98799877F4A5F96CCEE0A86DF33DB0B80` | `d5cdf23c57251449d50cdc5e56c9c324822745cc` |
| `apps/desktop/src/tts/product-narration-coordinator.ts` | `clean` | `1063D715A7DB4D96A94638CE1F00B3ABB38D2A02461F58F6B942D687ACF45E0B` | `60cab7f948a54a5a91edac6418ffc4fb6a0db66b` |
| `apps/desktop/src/tts/ProductNarrationControls.tsx` | `clean` | `8300AE18233B02C8366ABB8BCC81C97106B9F71D18B56F77383B2BFC8B0CF078` | `e37f48e95f5f6abd27d3eaf3ded1e810328a4d02` |
| `apps/desktop/src/reader/ReaderPublication.tsx` | `clean` | `FD8D4EA774ADE14EC57A66E851BEFB386629E02A79E898019A21DD037D450D73` | `aaf5193cd44bc5f5f0d51141847191ca1adf81a4` |
| `apps/desktop/src/App.tsx` | `clean` | `1B582393DDDEB16727E4A89D3034AD618C94C5A08B1E9E428FE4D32B8F04718C` | `741379a609a80b6ce47570a6c59b62e3e9073f32` |
| `apps/desktop/scripts/native-webdriver-client.mjs` | `clean` | `B898BB5C312C3099E2E43656A8FF27DBA2DD9137ECE26AAA73255DCEF7381051` | `bfdeae55313b5a4f3d249eb03709632aa0ee8540` |

Identity recheck PASS: eleven paths unchanged, branch/HEAD unchanged, empty
index. Six primary identities equal POST-04 before/after manifests. Saved
pre-diagnostic bytes equal immutable POST-03 identities.

Acceptance review PASS. Coordinator settlement has no minimum duration;
retaining an observed transition repairs transient-state sampling. Acceptance
requires active, armed, initially false observation with actual true evidence.
Queued pre-arm history is discarded and each marker resets earlier evidence.
One fixed owner is observed, count capped at 1,024; stop deactivates/disconnects
and replacement stops prior observation. Ninety-second deadline, 100-ms polling,
scenario order, highlight clearing, old-key rejection, fresh playback/highlight,
same-document and stale-audio checks remain. Diagnostics contain fixed labels
and scalar evidence; failed snapshots cannot replace the original error.

Actual-script regression tests cover brief transitions, absence, prior queued
history, earlier seeks, initial true and stopped observation. RED-01 records
the expected three failures; unchanged assertions all pass in POST-04.
No product contract, privacy, audio-persistence, cancellation, locator or
architectural change.

Test evidence reviewed: all eleven commands and exact outcomes in
[POST-04](APPS-NATIVE-01-post-04.md), supplied by the independent validator from
local PowerShell outside sandbox (7.6.5 / Node 24.20.0 / pnpm 11.15.1).
All exit 0, including 661 Vitest/70 Node, native startup, reader benchmark,
preflight, Piper ES/EN and Chatterbox ES/EN. Reviewer inspected both Chatterbox
matrices and final cleanup, not merely command exit codes.

Findings: none. Remaining uncertainty: historical POST-02/03 cause unknown;
this approval does not retrospectively assign it. Qwen deferred per ADR-0051.
No further action for this scoped gate. Subsequent reviewed-path changes need
new review/identities; this is neither a refactor Validation Report nor Git
authorization.
