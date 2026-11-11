# PR #311 diagnostic patch identities

Base and reviewed HEAD: 90a2d137db4a8440976c398fa465a090c86f0022.

The request, this manifest and its review report are metadata outside their own identity closure. The ignored temporary browser configuration is inspection evidence only and is not staged.

| Status | Path | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| M | `apps/desktop/scripts/native-smoke/reader-scenarios.mjs` | `e6d852fecb84303d3170616615759d280484f7b781a7efed18cffef5cf2ed763` | `7cf520a64f8717c7985446a0f54539bcf41484fa` |
| M | `apps/desktop/scripts/native-smoke.node-test.mjs` | `b2d9fe454f4003254d0b1c6ed694724e8f94acadcf5455eee941031aa17b00d1` | `ddb0a75cef4176b718ad2fcb00b479c0e0cf7993` |
| M | `apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts` | `8610c5561a0bb3239ec38050c60ec38210d44bae0ae9a1be8879a053abb74c88` | `a6a5cc00c0d2c806515ac068211181b7d213077f` |
| CLEAN | `apps/desktop/scripts/native-startup-smoke.mjs` | `046a92bfb6635263d2529a9e7a95936aa5851998a8e308bbabcaca5c3221d9d7` | `ab5662c16e7e372a05abe2bfa6a9f7870ce7cbdf` |
| CLEAN | `apps/desktop/scripts/native-webdriver-client.mjs` | `1e5bb9d331902a09df3540cf5a58ac70c474c2aaf5985fe57d2d4ca0f7beacad` | `128398a1cd241b3473eb7348fd75112d83355d13` |
| CLEAN | `apps/desktop/scripts/native-smoke/resource-observation.mjs` | `ca9bf8c9dc06b3879e14bb74d81e811262158d77e1d5bb5e3babb02d4a6ed692` | `77ec2f890a62d7127fa6b7d4778fb7da41873486` |
| CLEAN | `apps/desktop/src/reader/active-visual-locator.ts` | `4b76de1bd254e10fe5485e6b858f76651335db4f035d85a873daa7786d8e34a8` | `7ea2bcedbf92632cf46bf49196167bee05734ab1` |
| CLEAN | `apps/desktop/src/reader/active-visual-locator.test.ts` | `f2007de98895cf20e3604291535341eef35270eedf21c91d1f87eb2ce1d1e202` | `2b81b3da2d9d09f1e2b372858006b7a779c8b772` |
| CLEAN | `apps/desktop/src/reader/reader-navigation.ts` | `4a35482455d2843fce2fa7f2eec37ed5bc889137775e9d7ae2a7044063c72638` | `21f81ff61d806c34306db73fac0054e573414e4a` |
| CLEAN | `apps/desktop/src/reader/ReaderPublication.tsx` | `086208cb9e6465fae489c6b540a3b8a90f8dee2ec659f67068db760a18224ca4` | `706a3e7f0634c545ab1fd96b3a3d2c71d176a109` |
| CLEAN | `apps/desktop/src/App.tsx` | `580f0c8651ad40c5737626698b487a5d978a5cc1dd7cbe8c878b37723554d159` | `ca66daa57a614c4edd016c9d4fd967a3f3e721bd` |
| CLEAN | `apps/desktop/tests/fixtures/reader-image-lifecycle-fixture.mjs` | `fccd0d57f4593d7a747ede261605340fd9406c91df9b60a62b43e74882c066d4` | `7d108899f8a90b6eceec21501176c5e4e1419e86` |
| CLEAN | `apps/desktop/tests/fixtures/reader-image-lifecycle-fixture.d.mts` | `f1b1d22ea9053b20ece94ea2c4a1e55f6971e782afee44bc6cb5610e1a434996` | `044b7085344b9656e3ff142b72efb32b8fe28966` |
| CLEAN | `apps/desktop/playwright.config.ts` | `8b6b8a163b02a949a4e6cd91fcbeff71cb6053e5a646a87552f75b58be8011b1` | `e14e28a44dcc92215549dcc1042fa0e26cf422a7` |
| CLEAN | `apps/desktop/package.json` | `7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa` | `46b13978c4094f004349ba762f31bddeb104cb9f` |
| CLEAN | `package.json` | `79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6` | `fd94e123a32a6b4a44d5ccb296cd89e25b319232` |
| CLEAN | `pnpm-lock.yaml` | `e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426` | `acf5034202c5933f5c1dff89beff28587c826088` |
| CLEAN | `.github/workflows/foundation-checks.yml` | `dae116f90e7a703f0959680ee9fe5d2bd34b7fa62b68b43dd5060a3b82784f85` | `0ddef04e6390a01dbbc7290cbc446071b73a7925` |
| CLEAN | `docs/plans/completed/M004-reflowable-visual-reader-and-position-restoration.md` | `ae80e6e07f30577296d76c78f11bb492c02d20bf2816861ead3c3d7606d3fff5` | `1d2f23acea106ce3148cd02e7080d6b192a81682` |
| CLEAN | `docs/plans/completed/reader-position-and-image-lifecycle.md` | `33a41b4966f7cba8c796eed6394658ced5987f847e6f93ceac03034e10c25efb` | `9ae29b86c9f76196e42e67a163be7fb527281be6` |
| CLEAN | `docs/architecture/decisions/ADR-0071-reader-checkpoint-and-image-lifetime.md` | `0cf0a970c877fa4d872d33032540acf4ce7b136f8d554ac6b46038b9f812f8cd` | `99d531d75d2625cb40a868ff3ddcc56447c424f5` |
| CLEAN | `docs/development/agentic-change-review.md` | `de4c430a5de120d9c900d6bad0bebbfeec81673614b30f242f3154efbedcfc39` | `373443e17547185e2294d906bdc9cb489daca67c` |
| ?? | `docs/plans/evidence/reader-position-and-image-lifecycle/ci-diagnostic-follow-up.md` | `b68f8e42f9a52a3a6e7bebcfac1ab9fe6a7a1c6b42c1b0e24780cf0079ae6f8b` | `cd8632b48ccdd1688d8c54cf2b3b89c6c23ad25d` |
| IGNORED | `tmp/evidence/rpi-ci/playwright-131.config.ts` | `a00a36ae520f1d9cc93195b459b893a525fadd21d3fc4adbfe6cd66ae02719c2` | `d8c539489b082b52e9e26e4e6b83dc4380b0df07` |
