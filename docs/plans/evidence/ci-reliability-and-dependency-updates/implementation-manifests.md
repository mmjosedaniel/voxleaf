# Implementation review manifests

To reconstruct a hashed manifest from a block, encode its JSON as UTF-8 with Windows CRLF line endings through the closing brace and omit the terminal newline. Changed paths are relative to the indicated worktree. Git object IDs can be recovered from the reviewed commits after the temporary local worktrees are removed.

## m1

SHA-256 `d6a959868f9bab9588e7ad1c5a33c11295203d6a6553b3a41151c06b8710ff6c`.

```json
{
  "id": "m1",
  "base": "28e157cd2dc08ab974cf3478ea730e8cef801661",
  "head": "17c74f7b96ec4a2732aa6d1d3be8aa1c37c68f52",
  "worktree": ".",
  "changed": [
    ".github/workflows/foundation-checks.yml",
    ".github/workflows/release-audit.yml",
    "apps/desktop/scripts/windows-release.node-test.mjs",
    "docs/development/testing.md",
    "eslint.config.js",
    "package.json"
  ],
  "paths": [
    {
      "path": ".github/workflows/foundation-checks.yml",
      "blob": "0e3bdaadb6c2aeffd4e42512f94134c5bb0221ae",
      "sha256": "7e7d39b6d45afc8e8bb87440fc77ecada8f2af8573f76729aa8f3ea3481c0de2",
      "status": ""
    },
    {
      "path": ".github/workflows/release-audit.yml",
      "blob": "ca8f8f15507927c709dda24112cc89e0f0142e98",
      "sha256": "f5233cf2a1980a178a0383ea29a2faefbe822f94de2a19688b2d03b0d44b36d8",
      "status": ""
    },
    {
      "path": "AGENTS.md",
      "blob": "c2faaa2714c88b55928d2af3ffea48e1075256a8",
      "sha256": "ef8c9ac383060b28284a06deae61b8e4e7f2546c4e51284db06a702bf350e796",
      "status": ""
    },
    {
      "path": "apps/desktop/package.json",
      "blob": "46b13978c4094f004349ba762f31bddeb104cb9f",
      "sha256": "7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa",
      "status": ""
    },
    {
      "path": "apps/desktop/scripts/windows-release.node-test.mjs",
      "blob": "5220446adca8f6cc6faea3ef7e761fe4186aebac",
      "sha256": "1e93bacec01b070324e465bbaa2456cff74294fb78f14caf463b4f447b744950",
      "status": ""
    },
    {
      "path": "docs/development/agentic-change-review.md",
      "blob": "26b0d8519194ff3b2ccc7acff74a0171bab647c2",
      "sha256": "093026226d8dd9322081295ed25b6712fe11870740a50c35f793ece08593a494",
      "status": ""
    },
    {
      "path": "docs/development/testing.md",
      "blob": "b3a675483ab66d44e59bae7bcaad40db4e091eee",
      "sha256": "0712fdc76c9b4b0dff2b4ae7ae9192574de04c9001cc3b9cbc326ac808122e9e",
      "status": ""
    },
    {
      "path": "eslint.config.js",
      "blob": "2c348f57db352eeefacb14d0286fef379598871a",
      "sha256": "8706810eb89a7e02ed431424872a08c17c3369a31370323b8b0a996616f04faf",
      "status": ""
    },
    {
      "path": "package.json",
      "blob": "058a4a21874a17effb80ecbba01f243cd7d4dd05",
      "sha256": "9018096a6cbc0df0032138331b55e205003030654a99fb6b9983c7094f8e56a5",
      "status": ""
    }
  ]
}
```

## m3b

SHA-256 `5dc7fc1039a261155efdb2906346daff6f3d7bb33e685e55c8a71c608c71139a`.

```json
{
  "id": "m3b",
  "base": "28e157cd2dc08ab974cf3478ea730e8cef801661",
  "head": "79789ae2109575277677963deedcde385953dbae",
  "worktree": "tmp/ci-next",
  "changed": [
    ".github/dependabot.yml",
    ".github/workflows/chatterbox-updates.yml",
    "docs/development/dependencies.md",
    "scripts/chatterbox-update-candidate.py"
  ],
  "paths": [
    {
      "path": ".github/dependabot.yml",
      "blob": "321b9f5eb0d144c2cd9e08e1cb2ad9c33a2baa6d",
      "sha256": "42a3a7787f4a3e18f7edfb43b855546b73ac13dd6bfb398c18846c81361993db",
      "status": ""
    },
    {
      "path": ".github/workflows/chatterbox-updates.yml",
      "blob": "78e54b01b91683bf6d690a7cc094a15899c4529c",
      "sha256": "8565ff9c891f1c0e2aad70f2184f344acdcfdc73d5f42f6ad14b6e0258428035",
      "status": ""
    },
    {
      "path": ".github/workflows/foundation-checks.yml",
      "blob": "0ddef04e6390a01dbbc7290cbc446071b73a7925",
      "sha256": "dae116f90e7a703f0959680ee9fe5d2bd34b7fa62b68b43dd5060a3b82784f85",
      "status": ""
    },
    {
      "path": ".github/workflows/release-audit.yml",
      "blob": "cbe5eea51b3f116754dd86aafe755690a0798755",
      "sha256": "9b9e55c1a128c7714cd85d07a603497f86172a4144e5f72adcfa131e3a9340c5",
      "status": ""
    },
    {
      "path": "AGENTS.md",
      "blob": "c2faaa2714c88b55928d2af3ffea48e1075256a8",
      "sha256": "ef8c9ac383060b28284a06deae61b8e4e7f2546c4e51284db06a702bf350e796",
      "status": ""
    },
    {
      "path": "apps/desktop/package.json",
      "blob": "46b13978c4094f004349ba762f31bddeb104cb9f",
      "sha256": "7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa",
      "status": ""
    },
    {
      "path": "docs/development/agentic-change-review.md",
      "blob": "26b0d8519194ff3b2ccc7acff74a0171bab647c2",
      "sha256": "093026226d8dd9322081295ed25b6712fe11870740a50c35f793ece08593a494",
      "status": ""
    },
    {
      "path": "docs/development/dependencies.md",
      "blob": "565f16f43ae56f322be1d057484098758bc5d6a5",
      "sha256": "8ddb5b1a1c14a46fb4ff06f87f9c8e42b857c6480d0333dc11ebc86fc0bd6f9e",
      "status": ""
    },
    {
      "path": "package.json",
      "blob": "d774369c5d3647d44d9e425a6f1e290675a55d9b",
      "sha256": "1b0b10a1e9641f9a2137b99cb7dbbd37302c51f07066eaafc69a0a26e1c01cec",
      "status": ""
    },
    {
      "path": "scripts/chatterbox-update-candidate.py",
      "blob": "8a4c3c5ff9075858aa07a2549a9a70a451ae3399",
      "sha256": "5a1f3b59dfb67e5ce8d204919e20b61989661e7db6807203dd79d1994b8d987a",
      "status": ""
    }
  ]
}
```

## m4

SHA-256 `718f0eb7727f0f6823435db477b29b47109c837d0c199376d11dcbfb064102f7`.

```json
{
  "id": "m4",
  "base": "28e157cd2dc08ab974cf3478ea730e8cef801661",
  "head": "96baaa5da1cfadd541a06bb43e63ba8f1a5221b1",
  "worktree": "tmp/ci-release",
  "changed": [
    ".github/workflows/release-audit.yml",
    "package.json",
    "scripts/release-audit-report.mjs",
    "scripts/release-audit-report.test.mjs",
    "scripts/release-audit.mjs",
    "scripts/release_inventory.py",
    "services/tts/release/component-inventory-v1.json"
  ],
  "paths": [
    {
      "path": ".github/workflows/foundation-checks.yml",
      "blob": "0ddef04e6390a01dbbc7290cbc446071b73a7925",
      "sha256": "dae116f90e7a703f0959680ee9fe5d2bd34b7fa62b68b43dd5060a3b82784f85",
      "status": ""
    },
    {
      "path": ".github/workflows/release-audit.yml",
      "blob": "9ca2038b592eed2dc6bd1354448c8d7db988e67d",
      "sha256": "1e1c99dada7c1a38f6361ee4b65d663b0b6661fac7946b10da158210d07d9754",
      "status": ""
    },
    {
      "path": "AGENTS.md",
      "blob": "c2faaa2714c88b55928d2af3ffea48e1075256a8",
      "sha256": "ef8c9ac383060b28284a06deae61b8e4e7f2546c4e51284db06a702bf350e796",
      "status": ""
    },
    {
      "path": "apps/desktop/package.json",
      "blob": "46b13978c4094f004349ba762f31bddeb104cb9f",
      "sha256": "7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa",
      "status": ""
    },
    {
      "path": "docs/development/agentic-change-review.md",
      "blob": "26b0d8519194ff3b2ccc7acff74a0171bab647c2",
      "sha256": "093026226d8dd9322081295ed25b6712fe11870740a50c35f793ece08593a494",
      "status": ""
    },
    {
      "path": "package.json",
      "blob": "8cfe7c5beed8b9f74d94a4abce11a918aefd3ee3",
      "sha256": "e5282530df5a9912a43f5559527682f5bdca012e5b533b7eee8a9895824e49e2",
      "status": ""
    },
    {
      "path": "scripts/release-audit-report.mjs",
      "blob": "2c4ebb940c988f5c197e203c69448272d3125824",
      "sha256": "2909f00c2004cf33c64578e27f439d169590a0220f9f616625fde5a74d00e6fd",
      "status": ""
    },
    {
      "path": "scripts/release-audit-report.test.mjs",
      "blob": "36580697f8cfd50855286ad3bfb63e01abe83c8c",
      "sha256": "6b54db4ba6d3b2db8bf4f760b0ec8cd4256f805903bceb7268c41e84fb4a9c27",
      "status": ""
    },
    {
      "path": "scripts/release-audit.mjs",
      "blob": "6121b39ca3b25cdee3833e9cbe7cfd54019db176",
      "sha256": "69be4ff8479b2e8735aaf812cf9c7e94aa93ec58d81a625a1992e08970d2c60a",
      "status": ""
    },
    {
      "path": "scripts/release_inventory.py",
      "blob": "9bd8e1483c313408320de44206b55679da97daa4",
      "sha256": "0d9035f70f3628fb8a605df6f584fb278905afbb80cd5215ceb1826459b494dc",
      "status": ""
    },
    {
      "path": "services/tts/release/component-inventory-v1.json",
      "blob": "92ac096dddb0fc7b3179fa9d3caa1bfbf3e649ee",
      "sha256": "821189a50a6750ee40c78a628268ac121448bc63eaa1d861bbdedc8dfdf81efb",
      "status": ""
    }
  ]
}
```

## m4b

SHA-256 `2d485f9dd0358d51a6b54c84eea89adc9d6c18e34435b3a6825946aff7eb2bca`.

```json
{
  "id": "m4b",
  "base": "28e157cd2dc08ab974cf3478ea730e8cef801661",
  "head": "6c98522f3d5a0ab9337182128308947d7db2c72e",
  "worktree": "tmp/ci-release",
  "changed": [
    ".github/workflows/release-audit.yml",
    "package.json",
    "scripts/release-audit-report.mjs",
    "scripts/release-audit-report.test.mjs",
    "scripts/release-audit.mjs",
    "scripts/release_inventory.py",
    "services/tts/release/component-inventory-v1.json"
  ],
  "paths": [
    {
      "path": ".github/workflows/foundation-checks.yml",
      "blob": "0ddef04e6390a01dbbc7290cbc446071b73a7925",
      "sha256": "dae116f90e7a703f0959680ee9fe5d2bd34b7fa62b68b43dd5060a3b82784f85",
      "status": ""
    },
    {
      "path": ".github/workflows/release-audit.yml",
      "blob": "a7db1c29a89926e8b9c5b1e51489fd5361a1c466",
      "sha256": "d1e673a3f6efd66aad6413d15e8d724f8b689e14923878e83aab8849eec6180d",
      "status": ""
    },
    {
      "path": "AGENTS.md",
      "blob": "c2faaa2714c88b55928d2af3ffea48e1075256a8",
      "sha256": "ef8c9ac383060b28284a06deae61b8e4e7f2546c4e51284db06a702bf350e796",
      "status": ""
    },
    {
      "path": "apps/desktop/package.json",
      "blob": "46b13978c4094f004349ba762f31bddeb104cb9f",
      "sha256": "7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa",
      "status": ""
    },
    {
      "path": "docs/development/agentic-change-review.md",
      "blob": "26b0d8519194ff3b2ccc7acff74a0171bab647c2",
      "sha256": "093026226d8dd9322081295ed25b6712fe11870740a50c35f793ece08593a494",
      "status": ""
    },
    {
      "path": "package.json",
      "blob": "8cfe7c5beed8b9f74d94a4abce11a918aefd3ee3",
      "sha256": "e5282530df5a9912a43f5559527682f5bdca012e5b533b7eee8a9895824e49e2",
      "status": ""
    },
    {
      "path": "scripts/release-audit-report.mjs",
      "blob": "9c624c2e983ed6666471574401e121e124d20f4c",
      "sha256": "5f4283c5f1c90a3703d165ae1b2427ace207c2eab4688238887e4fce69f175f6",
      "status": ""
    },
    {
      "path": "scripts/release-audit-report.test.mjs",
      "blob": "d65c5dacdc43cb6a90c42ec09d26723f4949ce7a",
      "sha256": "e7f965688bedf644a77200aacb857467dd7f9c56a0b8036171c83e347236bbe9",
      "status": ""
    },
    {
      "path": "scripts/release-audit.mjs",
      "blob": "fe3c1de79cf7b64fd7223ef14a7ce1e144322f1d",
      "sha256": "deea09cd3f37c827f6b2f0976f2531cd1b612ee1377572740a9ac6d0dd1ba927",
      "status": ""
    },
    {
      "path": "scripts/release_inventory.py",
      "blob": "9bd8e1483c313408320de44206b55679da97daa4",
      "sha256": "0d9035f70f3628fb8a605df6f584fb278905afbb80cd5215ceb1826459b494dc",
      "status": ""
    },
    {
      "path": "services/tts/release/component-inventory-v1.json",
      "blob": "92ac096dddb0fc7b3179fa9d3caa1bfbf3e649ee",
      "sha256": "821189a50a6750ee40c78a628268ac121448bc63eaa1d861bbdedc8dfdf81efb",
      "status": ""
    }
  ]
}
```

## m5b

SHA-256 `f976771d68d6205528bc4a4f513f0f50aec01c76a13f69e0adf0cbeede5cec0c`.

```json
{
  "id": "m5b",
  "base": "17c74f7b96ec4a2732aa6d1d3be8aa1c37c68f52",
  "head": "13e2d583bae2e1aae79e8c9315cfcfee8e6e00c1",
  "worktree": "tmp/ci-fast",
  "changed": [
    ".github/workflows/foundation-checks.yml",
    ".github/workflows/release-audit.yml",
    "docs/development/dependencies.md",
    "docs/development/testing.md",
    "scripts/install-ci-rust-audit.ps1"
  ],
  "paths": [
    {
      "path": ".github/workflows/foundation-checks.yml",
      "blob": "e36a3bf255af7b69b722d2448b5ce4778c1c2897",
      "sha256": "818ff7224813ef8ccc5a8b931f27b37b9b66627e47e9ac71d27b427474d15e9f",
      "status": ""
    },
    {
      "path": ".github/workflows/release-audit.yml",
      "blob": "95bf80293f10ba7af1032821fd7c6c2666743e77",
      "sha256": "4cc37dc2ec0c79ee843d569d9e9271fe7fef31eb9e478f1f8078e6031fc8e742",
      "status": ""
    },
    {
      "path": "AGENTS.md",
      "blob": "c2faaa2714c88b55928d2af3ffea48e1075256a8",
      "sha256": "ef8c9ac383060b28284a06deae61b8e4e7f2546c4e51284db06a702bf350e796",
      "status": ""
    },
    {
      "path": "apps/desktop/package.json",
      "blob": "46b13978c4094f004349ba762f31bddeb104cb9f",
      "sha256": "7f9dbeef3386d8f886c1428870759dbbcfb10fcb9cbe3dbfe5216cd3e8707afa",
      "status": ""
    },
    {
      "path": "docs/development/agentic-change-review.md",
      "blob": "26b0d8519194ff3b2ccc7acff74a0171bab647c2",
      "sha256": "093026226d8dd9322081295ed25b6712fe11870740a50c35f793ece08593a494",
      "status": ""
    },
    {
      "path": "docs/development/dependencies.md",
      "blob": "c047c91c9836c78b19d04390d4cf29a54909a20c",
      "sha256": "075e279db6c5e49741fd6eb7e3724ab16a18438e1617e10d21ecf632dc4eadbd",
      "status": ""
    },
    {
      "path": "docs/development/testing.md",
      "blob": "8f39752e8f9682d60f11479e87bce60535e7f136",
      "sha256": "c54390eacf757ffec10487762e4189ba5b3edc8271ca2022d25a2179120b0fca",
      "status": ""
    },
    {
      "path": "package.json",
      "blob": "058a4a21874a17effb80ecbba01f243cd7d4dd05",
      "sha256": "9018096a6cbc0df0032138331b55e205003030654a99fb6b9983c7094f8e56a5",
      "status": ""
    },
    {
      "path": "scripts/install-ci-rust-audit.ps1",
      "blob": "bf21c261a352d91a1d18996b085b9985ede92bce",
      "sha256": "a3a85b34ee1a591f78aa593a059498d23677b23942b0cba7daee9a045f3dc154",
      "status": ""
    }
  ]
}
```
