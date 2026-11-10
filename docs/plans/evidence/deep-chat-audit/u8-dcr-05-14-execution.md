# U8 execution evidence

- Receipt: `DCR-U8-EXEC-20261109-01`
- Plan: [Deep Chat Audit Minimal Corrections](../../active/deep-chat-audit-minimal-corrections.md)
- Findings: DCR-05 and DCR-14
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U8/`.

## Cases and scope

- DCR-05 RED: The unchanged evidence generator accepted the legacy lifecycle
  PASS literal with a valid independent ordinary-journey receipt but without
  lifecycle evidence. GREEN: Only the closed, complete same-installer receipt
  can set lifecycle PASS. It records the installer name, size, SHA-256 and
  observed modification time, exact six-scenario matrix, required successful
  stages and verified cleanup. The producer emits it after restoration,
  removes stale output on a new attempt and rejects installer drift. The
  ordinary journey and signature remain separate gates.
- DCR-14 RED: Real disposable Node invocations of the unchanged journey
  exited from uncaught asynchronous EADDRINUSE at either reservation before
  restoration. GREEN: Error listeners precede listen, both held sockets
  settle and close, then the failure reaches the existing finalizer. Tests
  check both failure slots, one verified restoration and the backup retained
  when synthetic uninstall cleanup is uncertain. No driver or install ran.
- The lifecycle producer was exercised through real Windows PowerShell with
  synthetic install/start/uninstall operations and isolated application
  data. The successful producer output went through the actual JS consumer.
  A changed installer and uncertain cleanup leave no successful receipt.
- Initial roundtrip failed at the receipt validator. The deterministic NTFS
  fixture verifies the representation difference: PowerShell truncates
  sub-millisecond precision and Node's Stats Date rounds. The consumer now
  compares the same truncated instant. A fixture-only lint failure from an
  unconfigured global was replaced by an existing JSON clone pattern.

## Host commands

```powershell
node --test '--test-name-pattern=DCR-(05|14)' apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs
node --test apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs
node --test '--test-name-pattern=DCR-(05|14)|VAF H13|checked-in Windows release configuration|ordinary release requires|authority rejects broad uninstall' apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs
```

| Phase | Outcome |
| --- | --- |
| RED | Exit 1. Four intended failures on unchanged production. |
| First broad candidate | Exit 1. 73 passed and one producer/consumer roundtrip failed. This run is retained separately. |
| First affected rerun | Exit 0. 16 passed after the timestamp and lint repair. |
| Final exact affected rerun | Exit 0. 16 passed, including deterministic fractional timestamp and installer drift. |
| Scoped static | Pinned offline pnpm Prettier applied on the four JS files and package.json; ESLint passed on the four JS files. |

Normal local PowerShell 7.6.9 on Windows NT 10.0.26200.0, Node v24.20.0.
RED and final GREEN before/after snapshots matched. No historical PASS was
reused. G4/G7 and exact installer G10 remain pending. The standalone evidence
alias was not executed and historical generated release evidence was not
rewritten.

## Closed reviewed inputs

The first seven rows comprise the unit patch. Other paths are unchanged
installer/data helpers and configuration. Setup already contains locally
reviewed U10 documentation. The staged index is empty.

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/windows-release.mjs` | ` M` | `a35f56dec8df7019cd424e49c28df588968893859aa077ce244d01586cd415e4` | `6bef1ce0901c12b7c228342b7a39ba2432ce5f3b` |
| `apps/desktop/scripts/ordinary-chatterbox-release-host.mjs` | ` M` | `985829ef1e5291a23ffd543dc04bdf52277175b5f9c4813d67f83c22945c2526` | `efcd31a07c3e7561b572239ef43aafbf20e73355` |
| `apps/desktop/scripts/windows-release.node-test.mjs` | ` M` | `7292c5d58f0c3c56b372720a71c2ae7fd5214fd428471b099e1545d208eacf83` | `8884f41d4650889437fe6535c747907b388349d2` |
| `apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs` | ` M` | `57846a1b2bc27187fd47efca9165230f470f539408753749979d0480c5aa4bf9` | `feafcecddae76e55efa8cff0362672b6786ff091` |
| `scripts/test-windows-package-lifecycle.ps1` | ` M` | `cd13b7955c4a882753d79458822c7abc0229879c204a4eeb68cc452ce5a13099` | `2a8489cf90046fb4670e4a880b29b65af9a8dee8` |
| `docs/development/setup.md` | ` M` | `857340f1a98df3f6cb95b8c7468349fdef703743b08f910132e2c18b69f58b14` | `5d5451c74f1fc229ee9224673e24a0bf16ac9c92` |
| `package.json` | ` M` | `79134a72340811937f176832fc52f2848bfcfff5ac63bff6125041fbfea290d6` | `fd94e123a32a6b4a44d5ccb296cd89e25b319232` |
| `scripts/windows-package-lifecycle-data.ps1` | `clean` | `1bbd53e55b7e1a33da05ecb734b18aafa8dc71f1eb8071e227dd2242ba01a2a1` | `703cd3d249f0c8fd68b8e102531502db6315286d` |
| `scripts/build-windows-release.ps1` | `clean` | `620a6727632c6f87baf3c3387a722b22ff16eac8e75b3dcaa84555d3d37792ad` | `c437153a871f2c48385acd28394e8ce55d552b1c` |
| `pnpm-lock.yaml` | `clean` | `e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426` | `acf5034202c5933f5c1dff89beff28587c826088` |
| `eslint.config.js` | `clean` | `fbc71764ec5a6d136b2b7181045c8a5bc218a2493822eb07ce7d4b146ced53f1` | `6e223e865761ec9cda99a39de5f7a9310817e92c` |
| `.prettierrc.json` | `clean` | `447ee15ff4895d6432ff643961f1ca5ac7c16cf07c6957bc1aa759eb09f0cf6a` | `253098166fa1affee581b59878481b1745db0660` |
| `.gitattributes` | `clean` | `d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4` | `5acf47068be3a84b4e38b502877083e99b5ce0f9` |
