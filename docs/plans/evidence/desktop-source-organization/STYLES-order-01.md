# APPROVED WORK ORDER

Order ID: DESKTOP-STYLES-WORK-01
Target ID: DESKTOP-STYLES-01
Goal: Expose five existing contiguous stylesheet responsibilities while preserving
the exact cascade and existing accessibility test meaning.
Risk: medium

Allowed files:
- apps/desktop/src/styles.css
- apps/desktop/src/styles/shell-and-publication.css (new)
- apps/desktop/src/styles/reader.css (new)
- apps/desktop/src/styles/narration-and-publication-states.css (new)
- apps/desktop/src/styles/accessibility-and-responsive.css (new)
- apps/desktop/src/styles/reader-shell-and-settings.css (new)
- apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx

Required edits:
1. Replace entry with exactly five unconditional quoted local @import statements,
   using ./styles/<leaf>.css in the listed leaf order. No other entry rules.
2. Move exact complete body slices into leaves, verbatim: shell1-245,
   reader247-806, narration808-1061, accessibility1063-1242, shell/Settings1244-1659.
   Baseline has1659 lines. Blank246/807/1062/1243 are separators. Each leaf ends
   with exactly one newline; joining strings with one additional LF reconstructs
   original blank separators. Only CRLF-to-LF normalization permitted; preserve
   interior whitespace. Do not broadly trim, serialize or normalize rules.
3. Adapt only the existing CSS-reading test loading/assembly. Parse entry actual
   imports, assert every nonblank statement is bare quoted local CSS import with
   no qualifier. Assert exact five paths/order/uniqueness, then read parsed paths
   relative to entry and concatenate contents. Retain original reduced-motion,
   forced-color and focus assertions. Do not load an independent hardcoded list.

Behavior invariants:
1. main.tsx single styles.css import unchanged.
2. Every selector/declaration/value/specificity/important/custom property/vendor
   declaration/comment/duplicate and original rule order preserved.
3. Complete media blocks, nested order and theme/motion/colors/viewport conditions.
4. Late shell/Settings precedence, scrolling, focus/hidden/highlight/appearance
   and responsive behavior unchanged.
5. Exact five unique unconditional local imports in required order.
6. Exact reconstruction under only the stated newline/separator treatment.
7. Existing accessibility assertions and unrelated tests unchanged.
8. Product/privacy/cancellation/persistence/synchronization contracts unchanged.

Forbidden changes:
1. Any other path, prior Units1/2, SKIPs, markup/components, selector/declaration
   changes, deduplication/regrouping, media restructuring or behavioral fixes.
2. CSS Modules/layers/preprocessors/helpers/new test modules, dependencies/config/
   lockfiles, generated/frozen/historical sources or completed plans.
3. Assertion/timeout weakening, model/download/install/firewall/persistent changes.
4. Git mutations: no staging/commit/push/PR/branch/main actions.

Diff ceiling: maximum seven paths and3400 combined additions/deletions.
Stop/re-audit if any boundary or ceiling is insufficient.

Baseline evidence: DESKTOP-STYLES-01-BASELINE-01, independent BASELINE PASS,
all seven D/B commands exit0. Immutable [report](STYLES-baseline-01.md).
Accepted [audit](STYLES-audit-01.md) and [draft](STYLES-draft-01.md).
HEAD ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5, branch
codex/desktop-source-organization, empty index.
Entry clean SHA256 FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823,
blob b616c73157a4a490bbf038ab4a613690432fbd29.
Test clean SHA256 F96F90D241B9D188CDAFDF6CF09D49DE9FF07BB0288F0A532360CD16EFFEB2C5,
blob 0fff933a6d14d3071c981b1857c5f7e940d41b2e. Five leaves ABSENT.
Frozen source/built CSS in ignored baseline report directory. Their bytes remain
immutable; built JS/CSS/worklet match PCM POST-CHANGE-02. Preserve prior units.

Worker validation: none. Return exact changed-line tally and Change Packet.
Acceptance commands: independent validator, local PowerShell outside sandbox:
```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop build
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```
Use verified driver and existing model-free N environment policy. Require source
reconstruction equality, actual entry imports and built-CSS expansion/order/media
proof, plus before/after exact seven-path identities and empty index. Compare
built assets with frozen baseline and PCM report; no automatic H reuse claim.
No H for this unit. No next unit/final acceptance on rejected patch; maximum two
source correction cycles. Writers/docs/Git idle during independent validation.
Completion output: Change Packet only; no commit or push.
