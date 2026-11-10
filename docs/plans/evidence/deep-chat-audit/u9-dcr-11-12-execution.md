# U9 execution evidence

- Receipt: `DCR-U9-EXEC-20261109-01`
- Plan: [Deep Chat Audit Minimal Corrections](../../active/deep-chat-audit-minimal-corrections.md)
- Findings: DCR-11 (two JS host callers) and DCR-12
- Base and tested HEAD: `d375ecc84261c404e855c055e0ecc8949a97caaf`
- Raw receipts: ignored `tmp/evidence/deep-chat-audit/U9/`.

## Cases and scope

- DCR-11: Both callers now use one narrow read-only PowerShell predicate
  aligned with the Python effective-policy contract. It requires the exact
  enabled profile set, running firewall service, a single healthy effective
  outbound block for the target program, and exactly one unrestricted filter
  per address, port/protocol, service and interface group. The real PowerShell
  command ran with synthetic cmdlet definitions for both JS callers. It
  admitted canonical policy and rejected partial, inactive, degraded,
  duplicate and unreadable policy. The host firewall was untouched.
- DCR-12: The successful shutdown path now requires the stopped frame,
  zero/no-signal process close and clean stdout EOF. Sticky parser errors,
  incomplete frame bytes and queued extra records each reject success.
  Disposable Node children emitted fragmented clean and malformed/partial/
  extra tails. A queued protocolRejected remained readable after EOF/exit 1.
- RED ran against unchanged production. A test-only loader exposed the
  private firewall functions and executed the verbatim shutdown decision
  with a shorter test timeout. The loader and extracted decision are
  preserved in `red-harness.diff`. GREEN tests call the real exported
  boundaries directly; no loader remains.

## Host commands

```powershell
node --test '--test-name-pattern=DCR-1[12]' apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs
node --test apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs
```

| Phase | Outcome |
| --- | --- |
| RED | Exit 1. 9 passed and 32 failed, including the two enclosing failed test nodes. Both canonical firewall controls and the clean stopped control passed. Both host predicates admitted disallowed policy cases and the unchanged shutdown decision accepted all three invalid tails. |
| GREEN | Exit 0. All 74 tests passed, including both JS callers, PowerShell query errors, the real child framing controls and existing owner suites. |
| Scoped static | Pinned pnpm 11.15.1 via offline Corepack. Prettier applied on four owned files; ESLint passed on the same files. |

RED and GREEN before/after snapshots matched. Normal local PowerShell 7.6.9
on Windows NT 10.0.26200.0 with Node v24.20.0. The spawned Windows PowerShell
executable and Node identities are retained in the raw snapshots. No historical
PASS was reused. U10's handoff caller of DCR-11 and G4/G7 integration remain
pending. No installer, model, benchmark, or firewall mutation ran.

## Closed reviewed inputs

The first four paths comprise the unit patch. The remaining rows are direct
supporting callers, policy and configuration inputs. The index is empty.

| Path | Status | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/bilingual-portfolio-host.mjs` | ` M` | `0101de77cd9719a72e1595088cd4ef01aa597e91e6a054b328ebcba9f94ae2dc` | `2d4a4f48f3e82f09383ca9e2efca12a63b476d93` |
| `apps/desktop/scripts/tts-adapter-layout-host.mjs` | ` M` | `e34e6a29991adc405b1e9802e4f3bef276d3180a6f00a763fa405a2a9b080c35` | `0496114a1f7fd02100e71661c57fefe616b71a42` |
| `apps/desktop/scripts/effective-firewall-block.mjs` | `??` | `26f8ee07a028ef640c437dfd201e46f098fbe2c71186895545a759cbd02bd974` | `5d3f8cfd87b5553750c14f923651823d21942fda` |
| `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` | ` M` | `f99e606e949cec7ace1642277ddf06cd700917aee70626b04c066a9596c446e8` | `dc01509dd49938f7960f1f1b8a906a2e0f50a860` |
| `apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs` | `clean` | `420c8130fd25c3460fc1b3686041f96176a036c4f6a0e3feb9f0df4fdf32618c` | `e7884955fe5ba4ac57dc416e550c591521e03efa` |
| `services/tts/benchmarks/preflight.py` | `clean` | `4cc1751af484f4057934f1a152eeccc52133efd01cbb5a4e63974b07fce54a7a` | `611fc7974077eb9407dbe9e6cf4977819597ef76` |
| `package.json` | `clean` | `c034ad183d86e3366988ac7ab1e3d512738b18f1b0c714963fb9f1cbbdc17b36` | `29ff407c2ade383bb10764cd27c763d2689d8ee0` |
| `pnpm-lock.yaml` | `clean` | `e23e87936bfbe6dc82c51ef08fe9e4788ad9317d09dac20d997fdb16d25c8426` | `acf5034202c5933f5c1dff89beff28587c826088` |
| `eslint.config.js` | `clean` | `fbc71764ec5a6d136b2b7181045c8a5bc218a2493822eb07ce7d4b146ced53f1` | `6e223e865761ec9cda99a39de5f7a9310817e92c` |
| `.prettierrc.json` | `clean` | `447ee15ff4895d6432ff643961f1ca5ac7c16cf07c6957bc1aa759eb09f0cf6a` | `253098166fa1affee581b59878481b1745db0660` |
| `.gitattributes` | `clean` | `d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4` | `5acf47068be3a84b4e38b502877083e99b5ce0f9` |
