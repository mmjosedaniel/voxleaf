# Four-unit final source acceptance

Report ID `DESKTOP-UI-LOGIC-READABILITY-FINAL-20261013-02`.
Target `desktop-ui-logic-readability`, FINAL, PASS. Starting/ending HEAD
`5be831c23135ca00f94b2b3374f0330de2b658ce`. This supersedes the closure status,
without changing the historical [three-unit BLOCKED report](final-source.md).

Environment: supervised WMI-created local PowerShell 7.6.5 outside sandbox,
PID 20088; Node 24.20.0; Corepack pnpm 11.15.1; signed Microsoft EdgeDriver
155.0.4283.45 matching WebView2. Generic validation used the model-free
environment. Actual package root/model final-path containment passed; package
identity result 15700 was only supplementary context evidence.

| Command | UTC interval on 2026-10-13 | Result |
| --- | --- | --- |
| `pnpm.cmd check:portable` | 15:37:55-15:39:14 | Exit 0 |
| `pnpm.cmd check` | 15:39:14-15:41:14 | Exit 0 |
| `pnpm.cmd test:native-startup` | 15:41:14-15:41:50 | Exit 0 |
| `git diff --check` | Final recheck | Exit 0 |
| `git diff --cached --quiet` | Final recheck | Exit 0 |

Both broad checks passed format, lint, types, tests and builds: shared 209
tests/20 files; EPUB 651/33; desktop 727 Vitest/59 files plus 70 Node; Python
485; mypy 171 source files. Full check additionally passed native formatting,
Clippy in both configurations, Rust 87 default and 88 release-locked tests,
and native release build. Each Rust configuration retains one intentionally
ignored subprocess fixture that is exercised through its parent test.

Native startup rebuilt and passed root mount, bounded binary protocol, fake
service cancellation/crash recovery, file ingress/replacement/boundaries,
keyboard/accessibility, synchronization, local images, restored positions and
preferences, and replacement cleanup. No errors or external requests.

Existing nonfatal warnings remain: pytest could not write its nodeids cache,
and Vite reported a minified chunk above 500 kB. No warning was suppressed or
unrelated repair made. No required gate was skipped or counted as passed while
blocked.

Scope, invariant, test-integrity, privacy/artifact and identity reviews PASS.
The complete diff, including the two untracked narration files, is 937 changed
lines: A 499/500, B 200/260, C 225/400, D 13/30. Nine source/test paths changed;
the supporting Settings test is unchanged. No native, dependency, policy,
generated-authority or unrelated source edit remains.

Messages/precedence/guards, handler ordering and receivers, comparator identity,
short-circuit/range behavior, and the exact Settings condition are preserved.
Privacy, cancellation, bounded resources and persistence ownership are intact.
The canonical architecture diagram remains applicable without an edit.

The accepted [reader benchmark](semantic-post.md) and current-source
[four-arm host matrix](hardware-post.md) remain applicable by matching
identities. No performance improvement or universal model guarantee is claimed.
Test limits remain explicit: hardware notification/rejection exceptions use
static equivalence, semantic public tests cannot isolate every outer memo/context
branch, and the Settings expression and valid-state-unreachable narration
fallback retain static proof plus their existing integration coverage.

The closed ten-path manifest below matched before/after every command and
the four immutable unit post reports. HEAD and empty index also matched.
No staging, commit, push or PR occurred. Separate documentation is outside
this source manifest and receives its own final review.

Raw evidence: ignored `tmp/evidence/desktop-ui-logic-readability/campaign-final-02.*`
(launch/script, context, before/after identities, results/summary, logs and exit).

## Validated identities

| Path | Exact porcelain | SHA-256 | Filtered blob |
| --- | --- | --- | --- |
| `apps/desktop/src/tts/HardwareCompatibilityControls.tsx` | ` M apps/desktop/src/tts/HardwareCompatibilityControls.tsx` | `556FCC93B73ADB855470A12DAB950E31FF09A77D03ACB20E54AADDCEFCAE8AFE` | `678159162bd003f851dc1dce9468c1f8c033da37` |
| `apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx` | ` M apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx` | `24761C1DB64D4A767EF6CFAC854785DA3C41ADE6FDF97E6B51259D363AC32FF3` | `70fdc5f17f9b7dc38a65788aa2a970c9250063a2` |
| `apps/desktop/src/tts/ProductNarrationControls.tsx` | ` M apps/desktop/src/tts/ProductNarrationControls.tsx` | `E567F27D105A355C51119BA8D243A9B6126750B12A0944859F5E4B297C1522CF` | `09c6542d41edcd26a03a4186c964882859f8a3bd` |
| `apps/desktop/src/tts/ProductNarrationControls.test.tsx` | ` M apps/desktop/src/tts/ProductNarrationControls.test.tsx` | `7A5C274620E08ABF26A7473DD70B80352AB94D8955D57D6C07FDEE815E5DE06A` | `94ada36669ec121af3f86b69d56daf27b57b0a41` |
| `apps/desktop/src/tts/product-narration-presentation.ts` | `?? apps/desktop/src/tts/product-narration-presentation.ts` | `3A0C1EE385AFEBF1CAFB05FF1D4F2D920DE60938C95EFE43B15EB31E92450D7F` | `c6b0a1c78014061bdff6c94ce181aba3fbd37bb3` |
| `apps/desktop/src/tts/product-narration-presentation.test.ts` | `?? apps/desktop/src/tts/product-narration-presentation.test.ts` | `51A7D9F4EBCBF1E68FCBBC10D22CF34FB8597AE3F1B6079B7BE1C0529AC7E04D` | `dee9a0b4dd975b7074f052b808bf01f03d299f71` |
| `apps/desktop/src/reader/SemanticDocument.tsx` | ` M apps/desktop/src/reader/SemanticDocument.tsx` | `38D475E1FCED233D0ED32A491DD7B2845F3232D83A490DAA52694300F19D1FF1` | `45f2f0639eb060270bfae00b9d64404a89d25cd6` |
| `apps/desktop/src/reader/SemanticDocument.test.tsx` | ` M apps/desktop/src/reader/SemanticDocument.test.tsx` | `85865E6A5EB9A9F50501279BBF3B8FA22D82FB5E5769D756F829BA03A8BA5A52` | `2e5ed39f157ef8fb5227e8a2afae24ddfa4eb473` |
| `apps/desktop/src/settings/ReaderSettingsDialog.tsx` | ` M apps/desktop/src/settings/ReaderSettingsDialog.tsx` | `22CB04629390061C5EEA0C8F5E72D58589D753A2BE3C4930682A35FB97EEC43D` | `423a72988e2b77b8d5c72e1e40c12ab91514f5fe` |
| `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx` | empty | `A2993C8BB0BF166993870F91824E262AA9004C378103FAD769B089D3894B3A28` | `9c416f4be7b5d208470da3d0523c977cef354f60` |
