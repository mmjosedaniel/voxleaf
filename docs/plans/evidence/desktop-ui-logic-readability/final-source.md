# Combined source validation

Report ID `DESKTOP-UI-LOGIC-READABILITY-FINAL-20261013-01`.
Target `DESKTOP-UI-LOGIC-READABILITY`. Mode FINAL. Verdict **BLOCKED** for the
four-unit campaign; all combined commands passed for the delivered subset.
Starting/ending HEAD `5be831c23135ca00f94b2b3374f0330de2b658ce`.
Environment: normal local PowerShell outside sandbox (`require_escalated`),
existing process-local Corepack/pnpm 11.15.1, signed EdgeDriver 155.0.4283.45
matching WebView2. No source writer or Git mutation during validation.

## Closed source identity manifest

Status is the exact porcelain prefix followed by a space and the listed path;
`empty` means no output. HEAD and every identity matched before/after commands.

| Path | Status | SHA-256 | Filter-aware expected blob |
| --- | --- | --- | --- |
| `apps/desktop/src/tts/ProductNarrationControls.tsx` | ` M` | `E567F27D105A355C51119BA8D243A9B6126750B12A0944859F5E4B297C1522CF` | `09c6542d41edcd26a03a4186c964882859f8a3bd` |
| `apps/desktop/src/tts/ProductNarrationControls.test.tsx` | ` M` | `7A5C274620E08ABF26A7473DD70B80352AB94D8955D57D6C07FDEE815E5DE06A` | `94ada36669ec121af3f86b69d56daf27b57b0a41` |
| `apps/desktop/src/tts/product-narration-presentation.ts` | `??` | `3A0C1EE385AFEBF1CAFB05FF1D4F2D920DE60938C95EFE43B15EB31E92450D7F` | `c6b0a1c78014061bdff6c94ce181aba3fbd37bb3` |
| `apps/desktop/src/tts/product-narration-presentation.test.ts` | `??` | `51A7D9F4EBCBF1E68FCBBC10D22CF34FB8597AE3F1B6079B7BE1C0529AC7E04D` | `dee9a0b4dd975b7074f052b808bf01f03d299f71` |
| `apps/desktop/src/tts/HardwareCompatibilityControls.tsx` | empty | `A28EC3D1369A9AD21DFF24CAFB820605F8157018D53EE1862189E4F931482B92` | `1c17a85f3133dd0b1bfee1a0c58ebd99c6000864` |
| `apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx` | empty | `147F5E7CD8D1A39A8788691181120CB6CF48103DFE763D26C533A3A79BD0343C` | `8576768643fd172a393062ee64b0ca3aade761a4` |
| `apps/desktop/src/reader/SemanticDocument.tsx` | ` M` | `38D475E1FCED233D0ED32A491DD7B2845F3232D83A490DAA52694300F19D1FF1` | `45f2f0639eb060270bfae00b9d64404a89d25cd6` |
| `apps/desktop/src/reader/SemanticDocument.test.tsx` | ` M` | `85865E6A5EB9A9F50501279BBF3B8FA22D82FB5E5769D756F829BA03A8BA5A52` | `2e5ed39f157ef8fb5227e8a2afae24ddfa4eb473` |
| `apps/desktop/src/settings/ReaderSettingsDialog.tsx` | ` M` | `22CB04629390061C5EEA0C8F5E72D58589D753A2BE3C4930682A35FB97EEC43D` | `423a72988e2b77b8d5c72e1e40c12ab91514f5fe` |
| `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx` | empty | `A2993C8BB0BF166993870F91824E262AA9004C378103FAD769B089D3894B3A28` | `9c416f4be7b5d208470da3d0523c977cef354f60` |

Identity recheck PASS. Accepted A/C/D identities match their immutable POST
reports; B matches its failed baseline. Index empty before/after.

## Commands and outcomes

1. `pnpm.cmd check:portable` — exit 0. Evidence guard/13 tests; format, lint,
   type checks; shared 209, EPUB 651, desktop 723 Vitest plus 70 Node, Python
   485 tests; package/Vite/Python builds passed.
2. `pnpm.cmd check` — exit 0. Full required gate, including Rust formatting,
   Clippy in both configurations, Rust 87 default and 88 release-locked tests,
   Tauri/Python builds and the preceding suites. Each Rust configuration has
   one intentionally ignored subprocess fixture; its parent assignment-failure
   test passed. No test was newly skipped or weakened.
3. `pnpm.cmd test:native-startup` — exit 0. Fresh combined-source build and
   packaged WebView2 startup; synthetic protocol/service lifecycle, binary
   delivery/cancellation/crash recovery, ingress, accessibility, synchronization,
   image decoding, restart restoration and cleanup, no errors/external requests.
4. `git diff --check` and `git diff --cached --quiet` — exit 0 before/after.

Existing Vite chunk-size warnings remained. Both aggregate Python runs reported
an inability to write the existing `.pytest_cache/v/cache/nodeids` cache while
all 485 tests passed; no unrelated cache/permissions repair was performed.

## Review and limits

Scope, delivered-subset invariants, test integrity and privacy/artifacts PASS.
Seven source/test paths changed, 737 added plus removed lines (499 narration,
225 semantic, 13 Settings). No source/configuration/dependency/frozen/generated
or prohibited artifact outside those allowlists. Authorized documentation is
verified separately. All earlier assertions remain, with 42 direct message
cases and four semantic public-seam cases added. The six-case before/after
reader benchmark remains applicable to unchanged comparator identities.

Message precedence/guards/actions, exact comparator body and memo wiring, and
the Settings condition/two consumers are preserved. Public-seam tests do not
isolate outer list/context branches; static equivalence supplies those reviews.
The retained `Narration ready.` fallback is unreachable with currently valid
availability values. No redundant Settings truth table was added.

The canonical diagram remains applicable: no package/process, persistence,
trust, lifecycle or resource owner changed. These gates do not prove ordinary
installation/acquisition or successful model-backed inference.

**Blocker:** [hardware baseline](hardware-baseline.md) failed Piper ES and EN
profile switching and Chatterbox ES optional-profile readiness; Chatterbox EN
was not reached. The handlers remain unimplemented and unchanged. Combined
checks neither repair nor supersede that missing acceptance. Keep the plan
active; investigate readiness under an authorized bounded scope, obtain a new
complete passing baseline, then implement and independently validate B.
All staging, commits, push and PR creation remain prohibited.
