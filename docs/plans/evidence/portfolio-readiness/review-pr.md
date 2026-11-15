# Change Review Report

Review ID: **PORTFOLIO-READINESS-CR-PR-20261114**
Task ID: PORTFOLIO-READINESS
Verdict: **APPROVE**
Base commit and reviewed HEAD: `97d36c213e16ea015c24b1589454d61dab4379ea`
Reviewer: `change_reviewer`, Astra high; read-only inspection. No edits, tests, builds or Git mutations performed.

Reviewed paths and identities: Incorporates the **60 original identity records** from `tmp/evidence/portfolio-readiness/review-input-pr.json`, plus the eleven unchanged supporting identities below. Manifest SHA-256: `7A251D4933308AD529003504F30AD0C556D446BA82826FC446E4EA9BEDB56EE9`. Preserve these original records when persisting this report outside its own manifest.

Identity recheck: **PASS**. Before/after HEAD, all supplied and supplementary identities, statuses and deleted-path absence match. Actual changes match the 23-path manifest. The index remained empty.

Acceptance review:

- The revised guide matches Vite's loopback address, port 5173 and `strictPort` configuration, and correctly explains keeping the development server running.
- Node/pnpm prerequisites and desktop-build links match current repository configuration and documentation.
- Settings section names, English/Spanish Piper profile labels and playback controls match their owning components.
- Restoration instructions correctly require the same publication bytes and available browser storage, distinguish logical position from rendered coordinates, and acknowledge previous saved positions. App wiring, the storage repository and restoration assertions support those instructions.
- The saved FINAL report preserves its verdict, limitations and failed-check explanation. All 59 original identity rows match.
- Only the guide and persisted FINAL report changed after the previous review. The accepted Rust correction, sample, tests, configuration, screenshot and resolved R1-F1 remain unchanged.

Test evidence reviewed: Coordinator-supplied fresh normal local PowerShell results report:

- `pnpm.cmd test:portfolio-sample`: exit 0, two tests passed, including package preparation.
- `pnpm.cmd demo:sample`: exit 0.
- `pnpm.cmd check:evidence` and `git diff --check`: exit 0.
- Custom guide link/anchor and whitespace inspection: five local links passed.

Existing Rust and TypeScript format/lint/type/test evidence remains applicable through the explicitly verified unchanged implementation/configuration identities and coordinator-confirmed unchanged environment. These documentation changes do not alter those execution paths. This is attributed evidence reuse, not fresh reviewer execution.

The coordinator also reports a content/privacy inspection and JPEG metadata inspection. The image bytes match the previously visually inspected authored sample. Those reports do not establish audio playback or current availability of the video.

Findings: **None.**

Remaining uncertainty: The YouTube fetch failed with a cache miss; no new video/audio validation is claimed. Original remote CI scheduling remains unproven. Historical measurements, browser inspection and base-commit CI retain their previously stated limits.

Required next action: Persist this report and original identities at `docs/plans/evidence/portfolio-readiness/review-pr.md`, outside the manifest, then recheck identities before the separately authorized Git handoff. No correction is required. This report is not a refactor Validation Report and does not itself grant Git or release permission.

Supplementary closed identities: all status `null`, identical before/after. Fields are path, SHA-256 and filter-aware blob.

```text
apps/desktop/vite.config.ts | CF32693193B978E9D290F7CDDF99538C7973622BA408005BFCEEC857E1EC9F31 | 1df2541f9aa8a463a0d076c8059dc07855762f0d
apps/desktop/src/settings/ReaderSettingsDialog.tsx | AF0C2E64FACC8A1F6F43FD731DA4304D883B05002857B8C2B10FC8BB6C392872 | b61b39db5c0e0e19cda2f31f612ad61100fd2ba4
apps/desktop/src/tts/HardwareCompatibilityControls.tsx | BE272AC0EDC3FE5BCBB861F699165C517329E5A383EB97FC3A7F3EB4109EAA49 | 1e730c4484ac6307a30173ca8b09f140919696db
apps/desktop/src/persistence/reader-position-repository.ts | 87EB0962D1287E9992E20F2FDD65F27BC91D1D85B50621A3CED05A8E403AB5EF | a0d5fa9a61ca3fad63d5087b16087c7a515c231e
apps/desktop/src/persistence/reader-position-save-coordinator.ts | CE0736945FBF8DF24630B8D27D79E46BD37FF3A444163CB98AA5C7A1EA7635CC | f9f27bcb2f0b1cde4696c3060042587baa75ec7f
apps/desktop/src/persistence/reader-position-restore-coordinator.ts | 2758FD107D5ED7FCA5C7747A85FB6B82AFF4672A9B0E91039E46602BC825363A | 0f9e65f4c22e5e74257bdc37138b8f62f4ef015c
apps/desktop/src/App.tsx | 39C81878D1B16917ECBA6E035836834293CDCF386BF1AE16CD2E4290831795B8 | 60a3f2747c7abccbb0bcead1f5626bc8094a5f26
apps/desktop/src/tts/ProductNarrationControls.tsx | 03CC9C22AD68BD6199DE4F5C1E834C161576290D1E210117C014B29E9C8EB9B7 | b811ac9b0072819e3d93129ad7bca87de9f0dc2a
apps/desktop/src/vite-config.test.ts | 3CC4924B09E7A9E199A609375B1F7294B3F443FDE8E8164476D082222BDE438B | f5f5cde2a584f26ffd806ad88681e4f7be94f8ea
apps/desktop/src/persistence/reader-position-repository.test.ts | 10F2605C633868E4613C707ED209040F025A7C074847804A071A9F4FB13C5771 | 38870121d47af1fefe7ae8c236babe6b4c18394e
apps/desktop/src/persistence/reader-position-restore-coordinator.test.ts | 98A486172F3AD1540F3F57093B29F776FE424E74B466EC480F1DD64EB42B7514 | 765ad60e86e7302d480d148a5e07f1d14d6f77fc
```

## Original 60 incorporated identities

Copied unchanged from the reviewed manifest. Fields: path | porcelain status | SHA-256 | filter-aware blob.

```text
.agents/PLANS.md |  | 39BC9DA6577B867A4E70E81D7030AD836D4D1BCF789890877C5A526699ECD7BF | 56f8ff2a36a973725ad5d1698c26df765dad2434
.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md |  | A5F2D805063BA8536CC046B361EA5BDA732F55D9166AFE137B08BC01175F49AE | 16ba1a7002366ad9312223d51dace7902d6ae751
.github/workflows/foundation-checks.yml |  | DAE116F90E7A703F0959680EE9FE5D2BD34B7FA62B68B43DD5060A3B82784F85 | 0ddef04e6390a01dbbc7290cbc446071b73a7925
.nvmrc |  | 55075B5EC4E8B31936CBBC282B8829116D1FD48F2F2F1856DEE592A6650700CE | ca5c350055ccb6dacb495a786f60c8232abed8f2
AGENTS.md |  | F96A54E1B4A058C5124A19860E413862AEF1724BD0F649162FFD904C411250A2 | ab4fa6afb798ae2766c03099c2be7c6ca9477c96
apps/desktop/package.json |  | 7F9DBEEF3386D8F886C1428870759DBBCFB10FCB9CBE3DBFE5216CD3E8707AFA | 46b13978c4094f004349ba762f31bddeb104cb9f
apps/desktop/src-tauri/build.rs |  | 6AEEAB41BC35EFDE4E3C2B644A6248F7FC06D24AE30B75C0D33491CBB0C1FA31 | 261851f6b60e0ae6f244b5469289870facc8c997
apps/desktop/src-tauri/Cargo.lock |  | 9336F463F36E88F35A81605348387DEB063A396177C5369D3F5836B5A8790975 | ef3f7f1bbc9b1c93e3684e2877c09e89e1b8214e
apps/desktop/src-tauri/Cargo.toml |  | F7589AF14B344C827C746E5741A3A5F6D274E8B0643A829EC5A0B3D6971DDE09 | 2d119b08ff5c815f3f4926cb2ae6892fddd5bf3b
apps/desktop/src-tauri/src/tts_service_supervisor.rs |  | EA58307C22D472A59126B8549B29CBA6750BE253A43B49FFB5B8069AF39CE5B0 | 8f52e484c9c3effe0d03f7dc7fdf8cd58387eb60
apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs |  M apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs | 58340FD16CFD2BD0F31729A0A0A9D8A177B8DE2BD04BE3232B521B302231A246 | 338b0baa1f2729bc8c0421cfa796a33892e1b1e9
docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md |  | EA3B9467CBAD1B97B89C19576A66821080313895338FDB6EC37EEAB4CF970166 | 779c6d0a1cebb28de26bd36a54c97ec0f6e121d4
docs/architecture/overview.md |  | 3E8D30D369BE92ABA9855754777FD91B47176080F6F361D062621E4CD21E58D1 | a64e90d5b24f199fa5ba4e7e7cc4c50bdb7fc845
docs/architecture/system-diagram-compact.md |  | BADC941F7F5361386C797A8E809D0DB9DDFDDEE77451C2661D2E999132310BDA | f1958c7ae4007e60cb841013178c8febb0cf4540
docs/architecture/system-diagram.md |  | 83D9721F6DA42A9ADED10077D3B0FA61C291977F58114B2E0E37C28809D2384D | c0d0a5262783798de1ec5a447f5a0447485aebb0
docs/architecture/tts-support-matrix-v2.md |  | D8063A1C6F4A9D32F61F68C3772B89B9FA196E30DD98B124CD9F47A74026241E | b15e43aa8d3364f2e1245eb5e384db972ec035b8
docs/development/agentic-change-review.md |  | BDFCE6A7E9B9619B2683C218213E5610429F64DE898DEA4DBCFB7ADD90E3FADA | 52f2b415dce1634991c22a830b56bf928ad52ff8
docs/development/evidence-retention.md |  | 5B5C1AF58A90612736C9E195F1B12E9D6ADD01098BEFAE708CCB58AB7F29DB58 | 010a798e0f6d4237e9f0eaa98dd3079d1bbf1db2
docs/development/findings/history-import.md |  | 5566BA723E0CA057B5818D69A9F0FF9FEB501BF708998FA900CB57AB3F88DDD7 | 10b353bdab59faed4fb3dc89f698fa5389dd67ea
docs/development/findings/README.md |  | F8B8EC90AE9ACEB2694050BCA158CC8374AFC5EBD220B8F8DF1075EB11BB83DC | d389da823a8d5d44a0d046919fe137c2466a365b
docs/development/findings/registry.md |  M docs/development/findings/registry.md | 150F064FB2864AA20E7833F4BD6E15F49D37899D20F387DFE5065AE05685727E | 52dc16128d28bc2fb8d441bd8b8e30c374aa5ed1
docs/development/setup.md |  | 38E6D391AC37A8438F13AD9A804F2EACF1CE81372A035EB94CC0716D162E91A8 | e57d33640d9ee750966a1b5e5569a84eaa51204a
docs/development/testing.md |  M docs/development/testing.md | E7246521B4F6083BB9B8E6425DDBF6B33DC5A80FD075F7F21125162765D45CD5 | b5521774842e47b3134ba0364c9e07a1a76c3fcb
docs/development/tts-service-organization.md |  | 017B33CC2A5E18A56B1994D9C5E6BB7ADAA9E4AE570A22564FEBD76851413EF0 | b063ee14bef59430b7aa17278e45f2e1f6d96825
docs/plans/active/portfolio-maintainability-review.md |  | DELETED | DELETED
docs/plans/active/portfolio-readiness-and-presentation.md |  | DELETED | DELETED
docs/plans/active/README.md |  | 6330B2D064F82FB2AC3D33194A2C65D735587E6C220A4844CC16660F820DE9A5 | bc78a4597cb95b3567067979290749e7da58852d
docs/plans/completed/M011-package-validate-and-release-mvp.md |  | 229BF4D4C5EA46B39E5B6CFDB63236F1F2AC7F64C4C742FA72F71107986FB25F | 0e8af93c552dbed432553701b1c0933c0f8f178c
docs/plans/completed/portfolio-maintainability-review.md | ?? docs/plans/completed/portfolio-maintainability-review.md | AF5268ED6B1333B07C7DC8C58A5E1F00B94C2DF74EFAC71F8FFC81E2FBCE9284 | 3a58688bd7ea552c4b1c9473f6de81356a024c5c
docs/plans/completed/portfolio-readiness-and-presentation.md | ?? docs/plans/completed/portfolio-readiness-and-presentation.md | EBD0F4ED06A94F9FFF70BC13A4075E2617D47748559CB87B483CD7E6C3BDCB78 | 57cb67b22ef48e86c34bab6a2d6a24bd4a32bbe9
docs/plans/completed/README.md |  M docs/plans/completed/README.md | D545948EEA486428F7A138D1B20D041ABA1AD58ED6DBD990647B6165D29B3B6B | d5ee677e370981d36c1b04f2172eb7ac6b6dad44
docs/plans/completed/static-audit-corrections.md |  | 94F00B21BF59B6E26384DF97FF978E1421F2BE30F8314A6352EC20F3E12B1D23 | 9a94cc87347e1a633ac4fca24b6bb29460b1de6f
docs/plans/evidence/development-guidance-and-command-clarity/review-r1.md |  | 27C15A265EEA00BD2C5915DF914AB448CEFE52D8B166F3E1E00307536C1F3EA6 | a2ccf5e38654aba266ffa9c35bf9ad6a14a19ff6
docs/plans/evidence/epub-budget-cancellation-reflow/ci-follow-up.md |  | 7C6685AF7A7B89F7804C262C32EE45863EA32115D9EE68FCBA8DC2791FD18C67 | eb30d46ad064a0bc81f416eb4a5e0434490e1f4d
docs/plans/evidence/portfolio-maintainability/audit-dispositions.md | ?? docs/plans/evidence/portfolio-maintainability/audit-dispositions.md | 777D83B6B86647EC14BB9EC8B1652CC674638E18E21B5F088E76EED94000A472 | 8f33c4f2a5ce170394f6d91df23f1441e8df9379
docs/plans/evidence/portfolio-readiness/ci-diagnosis.md | ?? docs/plans/evidence/portfolio-readiness/ci-diagnosis.md | 3FD997031C1E7A98E025504457E13AD672F09F02053D991DE52DF9FA410E837A | 94573eb89ca6db925d23109dd1c2b869c8b17772
docs/plans/evidence/portfolio-readiness/review-final.md | ?? docs/plans/evidence/portfolio-readiness/review-final.md | 28AB8CA362904064C19CB63F8C6479BC8AAAF251E11C1E402E179BCAA847FEEC | 25746c124fbac3d455ab1a1e7543e2454674e548
docs/plans/evidence/portfolio-readiness/review-r1.md | ?? docs/plans/evidence/portfolio-readiness/review-r1.md | A199F4759BFBC6ADE8BF94431989613AB5D3AA66B13B32CC6459B78E96FDB091 | 844b5d8d1a9a9c83b056942595315042ad412d95
docs/plans/evidence/portfolio-readiness/review-r2.md | ?? docs/plans/evidence/portfolio-readiness/review-r2.md | D125BC9F1D9632FD7744D8AC08CCC95441F437B295FC4C382EA72682FCA364E6 | c71f73a651acbb344fe65baefa7d7f5efbad18e8
docs/plans/roadmap.md |  | 664A0323D2B20E055AC64B104479AA11E751EF45CE71ED8A607AB27584F34428 | 21f8bc4a2e4898f2ed6518b527e9e9c8cb50c6f5
docs/portfolio/assets/reader.jpg | ?? docs/portfolio/assets/reader.jpg | E0C23D144EF776727C8DE08A02A9BBD912D0437F05F41F3723DE5E5A45E78F4C | 077732fe1881293e4cfe1bd6734b510600219c26
docs/portfolio/case-study.md | ?? docs/portfolio/case-study.md | D7F04B780E92481811B24F9F868E6EFB7C126482693D44980A06A6CF776A863D | c3362e70659be9dae5297ba8928c06b4e58c4471
docs/portfolio/sample/chapter.xhtml | ?? docs/portfolio/sample/chapter.xhtml | 663A0A37F345FF835812DEE911E1272961C9DA557C1B6E553DF7ED5B16621B20 | ed18b90b1f66937afc2e6212daac1252b3d67090
docs/portfolio/sample/nav.xhtml | ?? docs/portfolio/sample/nav.xhtml | B2160B84E10FF8DCCDB6DCF88A83F6D624597E408210A380BC3ECDC592BD0FA4 | b17480275655daccbb0eac956d1bfa4c51cc8c43
docs/portfolio/sample/package.opf | ?? docs/portfolio/sample/package.opf | 5DDC17314B78D9B54C16672CC4C6CC68F701E3F5260C492CB69A33F27007E1D5 | 1b4ea5984a4e49e8aff29dfffe2672b579217128
docs/portfolio/try-voxleaf.md | ?? docs/portfolio/try-voxleaf.md | CD967FD7370C654820EB0ED3E9BB74AC671F5CD09A9E34105013941F0851C5B8 | 388a4c89c4c42dcdced15a195afd1cc53638f50f
docs/product/mvp.md |  | FC5FBA770ED937BCEF277C0AD4F9DBF4713563283F36CE38DC3EFEA784400E04 | 64a6fdcc385f920c2a801bc3918e773557aa87c9
docs/product/project-brief.md |  M docs/product/project-brief.md | 6EF83ECDF305B6D86764470B3592ED7B460A1D2002899B3D0E84FE26F3554474 | bf8134bfda8fe928b8242668cd65a86d4da7e1f4
docs/README.md |  M docs/README.md | 3D1307A31CF246C5B5F24ABF7DAFD441569EB408019C11195CD7A53E6E6CC64B | 8df71a5f96b0cc7ee68e5c2cdf4feb2f9a4a56fd
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
