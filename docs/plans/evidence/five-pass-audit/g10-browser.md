# G10 Chromium reader resource gate

Status: current host command passes; final integrated review pending. Native
G10 remains pending until U16 and final native/core preparation. The Chromium
gate consumes the stable U3/U4 product code, independently of U16's native driver.
Competing task test runners were paused during measurement; Python source editing
continued. No product source, test or threshold changed for this run.

Normal local PowerShell 7.6.9 outside the sandbox, Node 24.18.0, pnpm 11.15.1,
Playwright 1.64.1 and Chromium 156.0.8078.4 revision1248:

```powershell
pnpm.cmd benchmark:reader
```

2026-11-11 23:40:51.718–23:41:38.859 UTC, exit0, **6/6 pass**. The configured
command builds EPUB/shared, builds the Vite application and runs the six cases
with one worker and no retries. All 640 before/after input identities and the
fresh tracked/untracked frontend/package membership match. This includes the
benchmark/helpers, sources, fixtures, built package exports, configuration,
locks, actual Node/PowerShell/browser executables and Playwright registry.

The accepted 10,000-block incremental synthetic case measured 11.4ms first
useful content, 654.5ms total rendering and 148.8ms preference reflow. The
production renderer measured 763.1ms target-ready and 66.5ms reflow. The full
application memory delta was 124,370,944 bytes. These are controlled synthetic
local measurements, not performance claims for arbitrary books or machines.

Across six production lifecycle cycles, first-to-last closed-state growth was
1,060,860 JS heap bytes and 5,091,328 working-set bytes, within the unchanged
8MiB/32MiB limits. Final active intersection observers, resize observers and
object URLs were all zero. Storage had two positions and no unexpected reader
keys. Existing image, combined capacity and exact boundary assertions also pass.

Ignored evidence under `tmp/evidence/five-pass-audit/`:

- `g10-browser-final-01.log`, SHA-256
  `4590A40DE23EAD6A92B91D61B634AE0C139B6B5F5DF810319BC4F33EEA3B7863`.
- Its `.inputs.before` and `.inputs.after`, identical SHA-256
  `E0CA1DFBCBC174A88F85C1A75CAD0863E60CAB3A711CEC2005C181D6D3F8070C`.
- `g10-browser-final-01.artifacts.txt`, four Vite outputs, SHA-256
  `919A04A8ADB5C2C1C55F4ACA8C7A18DA4DC363A7B2B989629D1354B3D7B9210E`.

A preparation capture initially assumed a root Playwright package path that
does not exist under pnpm's layout. No benchmark launched on that attempt.
Resolved the installed package through the real test CLI and recorded the
failure separately in `g10-browser-preparation-01.log`; the benchmark itself
ran once. Existing color-environment and bundle-size warnings are retained.
This result does not substitute for G7 native inference or G10 native resources.
