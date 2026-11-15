# Change Review Report

Review ID: **PORTFOLIO-READINESS-CR-R1-20261114**
Task ID: PORTFOLIO-READINESS
Verdict: **CHANGES_REQUESTED**
Base commit and reviewed HEAD: `97d36c213e16ea015c24b1589454d61dab4379ea`
Reviewer: `change_reviewer`, Astra high; independent read-only inspection. No edits, tests, builds, formatting or Git mutations performed.

Reviewed paths and identities: The closed scope incorporates **all 44 original identity records verbatim** from `tmp/evidence/portfolio-readiness/review-input-r1.json`, plus the ten supporting identities below. The original manifest SHA-256 is `98AA5CF4174616E1610464FD9635E13646B11162FB0C5D04705001AA676968F0`. Preserve those original records when persisting this report; do not regenerate them.

Identity recheck: **PASS**. Before/after HEAD, all 44 supplied identities, ten supplementary identities and worktree statuses match. The actual 20 changed paths match the supplied change list. The index remained empty.

Acceptance review:

- The Rust change fixes the demonstrated caller-admission race without changing production supervision. Synchronous `ControlWriter.enqueue` establishes ownership before the observation interval. Busy rejection, cancellation timing, watchdog and process/writer cleanup assertions remain. `Ok(Err(_))` strengthens acknowledgement coverage by rejecting timeout/disconnection. The adjacent real blocked-write test retains `CommandDeadline` dispatch/timeout and replacement-owner coverage.
- The authored sample uses the existing deterministic ZIP builder. Tests assert repeatable bytes, successful public EPUB admission and exact resolution of both navigation destinations, with publication cleanup. The standalone command and existing TypeScript/CI aggregates reach those tests.
- The actual screenshot contains the authored sample and visibly unavailable narration. Its caption correctly distinguishes browser rendering and navigation focus from native audio.
- Authorship, unsigned distribution, browser/native capabilities and runtime limitations are explicit. The maintainability report truthfully records no accepted implementation unit; no refactor acceptance or runtime validation is implied.
- One historical measurement attribution fails the truthful-evidence criterion, as detailed below.

Test evidence reviewed: Coordinator-supplied normal local PowerShell results, attributed to the reviewed patch; the reviewer inspected the retained logs rather than executing commands.

| Command | Attributed result |
| --- | --- |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml sac12_ -- --nocapture` | Baseline exit 0; 8 passed |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml sac12_cancel_interrupts_real_blocked_stdin_without_queuing_more_work -- --nocapture` | Temporary delayed-caller diagnostic exit 101; exact Busy assertion failed |
| `pnpm.cmd format:check:rust` | Exit 0 |
| `pnpm.cmd lint:rust` | Exit 0; default and release-locked configurations |
| `pnpm.cmd test:rust` | Exit 0; 191 default / 190 release-locked passed; 9 ignored each |
| `pnpm.cmd test:portfolio-sample` | Exit 0; 2 passed |
| `pnpm.cmd demo:sample` | Coordinator reports exit 0 |
| `pnpm.cmd format:check:typescript` | Exit 0 |
| `pnpm.cmd lint:typescript` | Exit 0 |
| `pnpm.cmd typecheck:typescript` | Exit 0; all three packages |
| `pnpm.cmd test:typescript` | Exit 0; 212 shared, 1,072 EPUB, 1,358 desktop Vitest, 248 desktop Node and 2 sample tests |
| `pnpm.cmd check:evidence`; `git diff --check` | Coordinator reports final exit 0 with source identities unchanged |
| Changed-Markdown target/whitespace inspection | Coordinator reports 446 local targets passing; subsequently added testing paragraph contains no new links |

Retained diagnostic patch and failure log agree with the claimed controlled injection. Final source excludes that injection. Reported environment: Corepack pnpm 11.15.1, Node 24.20.0 within declared engines, Cargo 1.97.1. No historical test PASS supplies current acceptance.

Findings:

**F1 — P2, confirmed: Chatterbox measurements attributed to Piper**

- **File:** `docs/portfolio/case-study.md:86–87`, historical measurements paragraph.
- **Trigger:** An evaluator reads “M011's Piper core journey” followed by Spanish `39.966 s` / English `33.905 s`.
- **Consequence:** The case study assigns latency evidence to the wrong engine, presenting a misleading CPU-path measurement and undermining the approved requirement for truthful, attributed engineering evidence.
- **Supporting evidence:** The cited `docs/plans/completed/M011-package-validate-and-release-mvp.md:1943–1954` explicitly describes these as installed **Chatterbox** arms. Its lines 1121–1126 place the same numbers among Chatterbox resource disclosures. `docs/user/windows-release.md:95–98` independently identifies approximately `40.0` / `33.9` seconds as Chatterbox results.
- **Bounded correction criterion:** Remove the purported Piper measurement or correctly identify it as the earlier Chatterbox journey. Add Piper numbers only if supported by an actual Piper receipt. Preserve the historical-version and non-comparability qualifications. No production change or runtime rerun is needed for this documentary correction.

Remaining uncertainty: The controlled delayed-caller failure does not prove the original remote CI scheduling sequence. The screenshot and reported visual session do not establish audible playback or newly validated restoration. Hosted CI on the base is not CI acceptance of this patch. These limits are appropriately disclosed.

Required next action: Correct F1, supply updated documentary identities and applicable document checks, and obtain a new review report. Subsequent archival/index changes also require their own current assessment. This report grants no commit, push, PR or release permission and is not a refactor Validation Report.

## Supplementary closed identities

All supplementary paths have unchanged status (`null` in the original report), identical before/after. Fields: path | SHA-256 | filter-aware blob.

```text
docs/architecture/overview.md | 3E8D30D369BE92ABA9855754777FD91B47176080F6F361D062621E4CD21E58D1 | a64e90d5b24f199fa5ba4e7e7cc4c50bdb7fc845
.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md | A5F2D805063BA8536CC046B361EA5BDA732F55D9166AFE137B08BC01175F49AE | 16ba1a7002366ad9312223d51dace7902d6ae751
docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md | EA3B9467CBAD1B97B89C19576A66821080313895338FDB6EC37EEAB4CF970166 | 779c6d0a1cebb28de26bd36a54c97ec0f6e121d4
docs/plans/completed/M011-package-validate-and-release-mvp.md | 229BF4D4C5EA46B39E5B6CFDB63236F1F2AC7F64C4C742FA72F71107986FB25F | 0e8af93c552dbed432553701b1c0933c0f8f178c
docs/plans/evidence/development-guidance-and-command-clarity/review-r1.md | 27C15A265EEA00BD2C5915DF914AB448CEFE52D8B166F3E1E00307536C1F3EA6 | a2ccf5e38654aba266ffa9c35bf9ad6a14a19ff6
docs/development/tts-service-organization.md | 017B33CC2A5E18A56B1994D9C5E6BB7ADAA9E4AE570A22564FEBD76851413EF0 | b063ee14bef59430b7aa17278e45f2e1f6d96825
docs/development/setup.md | 38E6D391AC37A8438F13AD9A804F2EACF1CE81372A035EB94CC0716D162E91A8 | e57d33640d9ee750966a1b5e5569a84eaa51204a
docs/plans/roadmap.md | 664A0323D2B20E055AC64B104479AA11E751EF45CE71ED8A607AB27584F34428 | 21f8bc4a2e4898f2ed6518b527e9e9c8cb50c6f5
docs/plans/completed/static-audit-corrections.md | 94F00B21BF59B6E26384DF97FF978E1421F2BE30F8314A6352EC20F3E12B1D23 | 9a94cc87347e1a633ac4fca24b6bb29460b1de6f
docs/plans/evidence/epub-budget-cancellation-reflow/ci-follow-up.md | 7C6685AF7A7B89F7804C262C32EE45863EA32115D9EE68FCBA8DC2791FD18C67 | eb30d46ad064a0bc81f416eb4a5e0434490e1f4d
```

## Original 44 incorporated identities

Copied from the original manifest, not regenerated. Fields: path | original porcelain status | SHA-256 | filter-aware blob. Empty status means unchanged.

```text
.agents/PLANS.md |  | 39BC9DA6577B867A4E70E81D7030AD836D4D1BCF789890877C5A526699ECD7BF | 56f8ff2a36a973725ad5d1698c26df765dad2434
.github/workflows/foundation-checks.yml |  | DAE116F90E7A703F0959680EE9FE5D2BD34B7FA62B68B43DD5060A3B82784F85 | 0ddef04e6390a01dbbc7290cbc446071b73a7925
.nvmrc |  | 55075B5EC4E8B31936CBBC282B8829116D1FD48F2F2F1856DEE592A6650700CE | ca5c350055ccb6dacb495a786f60c8232abed8f2
AGENTS.md |  | F96A54E1B4A058C5124A19860E413862AEF1724BD0F649162FFD904C411250A2 | ab4fa6afb798ae2766c03099c2be7c6ca9477c96
apps/desktop/package.json |  | 7F9DBEEF3386D8F886C1428870759DBBCFB10FCB9CBE3DBFE5216CD3E8707AFA | 46b13978c4094f004349ba762f31bddeb104cb9f
apps/desktop/src-tauri/build.rs |  | 6AEEAB41BC35EFDE4E3C2B644A6248F7FC06D24AE30B75C0D33491CBB0C1FA31 | 261851f6b60e0ae6f244b5469289870facc8c997
apps/desktop/src-tauri/Cargo.lock |  | 9336F463F36E88F35A81605348387DEB063A396177C5369D3F5836B5A8790975 | ef3f7f1bbc9b1c93e3684e2877c09e89e1b8214e
apps/desktop/src-tauri/Cargo.toml |  | F7589AF14B344C827C746E5741A3A5F6D274E8B0643A829EC5A0B3D6971DDE09 | 2d119b08ff5c815f3f4926cb2ae6892fddd5bf3b
apps/desktop/src-tauri/src/tts_service_supervisor.rs |  | EA58307C22D472A59126B8549B29CBA6750BE253A43B49FFB5B8069AF39CE5B0 | 8f52e484c9c3effe0d03f7dc7fdf8cd58387eb60
apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs |  M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs | 58340FD16CFD2BD0F31729A0A0A9D8A177B8DE2BD04BE3232B521B302231A246 | 338b0baa1f2729bc8c0421cfa796a33892e1b1e9
docs/architecture/system-diagram-compact.md |  | BADC941F7F5361386C797A8E809D0DB9DDFDDEE77451C2661D2E999132310BDA | f1958c7ae4007e60cb841013178c8febb0cf4540
docs/architecture/system-diagram.md |  | 83D9721F6DA42A9ADED10077D3B0FA61C291977F58114B2E0E37C28809D2384D | c0d0a5262783798de1ec5a447f5a0447485aebb0
docs/architecture/tts-support-matrix-v2.md |  | D8063A1C6F4A9D32F61F68C3772B89B9FA196E30DD98B124CD9F47A74026241E | b15e43aa8d3364f2e1245eb5e384db972ec035b8
docs/development/agentic-change-review.md |  | BDFCE6A7E9B9619B2683C218213E5610429F64DE898DEA4DBCFB7ADD90E3FADA | 52f2b415dce1634991c22a830b56bf928ad52ff8
docs/development/evidence-retention.md |  | 5B5C1AF58A90612736C9E195F1B12E9D6ADD01098BEFAE708CCB58AB7F29DB58 | 010a798e0f6d4237e9f0eaa98dd3079d1bbf1db2
docs/development/findings/history-import.md |  | 5566BA723E0CA057B5818D69A9F0FF9FEB501BF708998FA900CB57AB3F88DDD7 | 10b353bdab59faed4fb3dc89f698fa5389dd67ea
docs/development/findings/README.md |  | F8B8EC90AE9ACEB2694050BCA158CC8374AFC5EBD220B8F8DF1075EB11BB83DC | d389da823a8d5d44a0d046919fe137c2466a365b
docs/development/findings/registry.md |  M docs/development/findings/registry.md | 0D64674A9ADC2C767495EA89069C057B4A43347307B5A09F8CDA47D28C3082CA | 47d4a1d7799a6c966bc303054eed14f84775626c
docs/development/testing.md |  M docs/development/testing.md | E7246521B4F6083BB9B8E6425DDBF6B33DC5A80FD075F7F21125162765D45CD5 | b5521774842e47b3134ba0364c9e07a1a76c3fcb
docs/plans/active/portfolio-maintainability-review.md | ?? docs/plans/active/portfolio-maintainability-review.md | AF982FFBBD46D9EEEEF66185850CEADE15B7F9AE3B19C0BE8FDDF32F2D42BA06 | e33c48abb7ce2ea263e0a668b243bfad064e3fc3
docs/plans/active/portfolio-readiness-and-presentation.md | ?? docs/plans/active/portfolio-readiness-and-presentation.md | 59604202704629A979A53EFBDA37D75AD56B69F7618F20C1091CA42150A7E871 | c86711067c4f0a760ea044c304876c4a448afa42
docs/plans/active/README.md |  M docs/plans/active/README.md | 9E7005A1BBA37B520B02FCCC0F1E8D81AEB234191714D41B5ABCDE0AAD5046B9 | f6a87ffb425b72dadfe581b09a9227b40985da9f
docs/plans/evidence/portfolio-maintainability/audit-dispositions.md | ?? docs/plans/evidence/portfolio-maintainability/audit-dispositions.md | 777D83B6B86647EC14BB9EC8B1652CC674638E18E21B5F088E76EED94000A472 | 8f33c4f2a5ce170394f6d91df23f1441e8df9379
docs/plans/evidence/portfolio-readiness/ci-diagnosis.md | ?? docs/plans/evidence/portfolio-readiness/ci-diagnosis.md | 3FD997031C1E7A98E025504457E13AD672F09F02053D991DE52DF9FA410E837A | 94573eb89ca6db925d23109dd1c2b869c8b17772
docs/portfolio/assets/reader.jpg | ?? docs/portfolio/assets/reader.jpg | E0C23D144EF776727C8DE08A02A9BBD912D0437F05F41F3723DE5E5A45E78F4C | 077732fe1881293e4cfe1bd6734b510600219c26
docs/portfolio/case-study.md | ?? docs/portfolio/case-study.md | A32219BEDC0D5F5A36397B319CF7DCF76743A276619410E4219454AA43E0FD98 | 23a334a603eeae720495b707d179278b0d339a00
docs/portfolio/sample/chapter.xhtml | ?? docs/portfolio/sample/chapter.xhtml | 663A0A37F345FF835812DEE911E1272961C9DA557C1B6E553DF7ED5B16621B20 | ed18b90b1f66937afc2e6212daac1252b3d67090
docs/portfolio/sample/nav.xhtml | ?? docs/portfolio/sample/nav.xhtml | B2160B84E10FF8DCCDB6DCF88A83F6D624597E408210A380BC3ECDC592BD0FA4 | b17480275655daccbb0eac956d1bfa4c51cc8c43
docs/portfolio/sample/package.opf | ?? docs/portfolio/sample/package.opf | 5DDC17314B78D9B54C16672CC4C6CC68F701E3F5260C492CB69A33F27007E1D5 | 1b4ea5984a4e49e8aff29dfffe2672b579217128
docs/portfolio/try-voxleaf.md | ?? docs/portfolio/try-voxleaf.md | 22DFBAE33EA3D1B22D810F7C6EB29C6A9B5BBFF9DA5A37FD0408C207231611AA | a4250d9d8dc3f13eb8d71ba1eea6dfdfb35bc518
docs/product/mvp.md |  | FC5FBA770ED937BCEF277C0AD4F9DBF4713563283F36CE38DC3EFEA784400E04 | 64a6fdcc385f920c2a801bc3918e773557aa87c9
docs/product/project-brief.md |  M docs/product/project-brief.md | 6EF83ECDF305B6D86764470B3592ED7B460A1D2002899B3D0E84FE26F3554474 | bf8134bfda8fe928b8242668cd65a86d4da7e1f4
docs/README.md |  M docs/README.md | 501A5C01AB3BA37480EC10142A7C7F1EAE8DEEBEB983F6D433180A6EB43D63F2 | 96cda229388720e62a5c78b3014dd599bfd84fa0
docs/user/windows-release.md |  | 545DCE1ED89BA7A6EAEBA42F76D108517C44FD0A00E9B27B99F0A1257E2E550E | eab8e7231f218d8840c82b38aa97cdc16b0da529
eslint.config.js |  | FBC71764EC5A6D136B2B7181045C8A5BC218A2493822EB07CE7D4B146CED53F1 | 6e223e865761ec9cda99a39de5f7a9310817e92c
package.json |  M package.json | 281985A40E13157AD0BEB0D97A77069EE550DD01FB6A76982A0A72AAAD7E1802 | 456aa25d08d5b1ce39c76fd307216cabbf75fa15
packages/epub/package.json |  | C2AF38F62B794A205398D5FFD6634407DDB8FF0B6065A83DE337928B2AAED644 | a67b753fb528b9287620b12b6155a6a76f1d5eb7
packages/epub/src/public/open-epub-publication.ts |  | B74CD1EA09D0FD09CBF831E867F43DD5D73B092FC1EF49A48614102776DAD1F0 | 28d8d636527b74c01ff1176f3929468a4c8f3df7
packages/epub/test-support/epub-fixture.ts |  | 40913AD7819F2DA210C9D42E4613AF3ADCF9A300136136C3C6620A547A945B33 | 08bc02121283468b113ab16aa897bd5984661b72
pnpm-lock.yaml |  | E23E87936BFBE6DC82C51EF08FE9E4788AD9317D09DAC20D997FDB16D25C8426 | acf5034202c5933f5c1dff89beff28587c826088
README.md |  M README.md | D86C39AE83E3B041A2122BE774175ABE9DAC2AC1469B535097B4CEEDA1BDA086 | 10ed20cc967e98d439b456547d41fb312d60d56d
rust-toolchain.toml |  | DAFAE8F49387948AE1527C41C6B846ACC184B10205EB41719DC5835E38D0F9D1 | a791afad1d99f9b6411e2409008fa21ee8189034
scripts/portfolio-sample.mjs | ?? scripts/portfolio-sample.mjs | A93A160CDEF270F8683B1048D1F6782539D2D79067F92AF296C93E6D21D141F4 | e8ca0fff7bf9430fb15c0b5c3145b2a1abe952aa
scripts/portfolio-sample.test.mjs | ?? scripts/portfolio-sample.test.mjs | 433B42FE2F02AE0DC84BEDA13E340037A7EE5B6DE259D5783809958B8F86D036 | 9e0d82b656d0fc32ab70b9e1876e8f498d07d826
```
