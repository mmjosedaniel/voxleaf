# Audit Packet

Target ID: DESKTOP-STYLES-01
Decision: CHANGE
Risk: medium
Primary target: apps/desktop/src/styles.css, five contiguous presentation sections.
Related context: HardwareCompatibilityControls.test.tsx and component, main.tsx,
existing Vite config/browser suites. Independent clean_code_auditor Sol high,
read-only; no tests run.

Concrete evidence: foundation/publication, reader, narration, accessibility/media
and later shell/Settings responsibilities have complete contiguous boundaries.
Repeated reader-preference-grid (408/1435), reader-toc (447/1541) and
visually-hidden (756/1583) depend on original precedence. Existing CSS-reading
test492-506 would inspect only imports after extraction; its loading boundary
must follow actual imports while retaining accessibility assertions.

HEAD ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5, empty index.
styles.css clean, SHA256 FF3DEC8E9000AC8C547A37ED77AEFCDAD6C1B33705E94CC322B5FC726783D823,
blob b616c73157a4a490bbf038ab4a613690432fbd29.
HardwareCompatibilityControls.test.tsx clean, SHA256
F96F90D241B9D188CDAFDF6CF09D49DE9FF07BB0288F0A532360CD16EFFEB2C5,
blob 0fff933a6d14d3071c981b1857c5f7e940d41b2e. Five leaves ABSENT.
Accepted Units1/2 and director documentation remain outside this allowlist.

Behavior invariants:
1. main.tsx single styles.css import unchanged.
2. Every selector/declaration/value/specificity/important/custom property/vendor
   declaration/comment/duplicate and original order preserved.
3. Complete media blocks, nested order and theme/motion/colors/viewport conditions.
4. Late shell/Settings precedence, scroll ownership, focus/hidden/highlight,
   appearance and responsive behavior preserved.
5. Exact five unique local unconditional imports in prescribed order.
6. Exact source reconstruction using only stated newline/boundary treatment.
7. Every existing accessibility assertion and unrelated test unchanged.
8. Product/privacy/cancellation/persistence/synchronization contracts unchanged.

Allowed files:
- apps/desktop/src/styles.css
- apps/desktop/src/styles/shell-and-publication.css (new)
- apps/desktop/src/styles/reader.css (new)
- apps/desktop/src/styles/narration-and-publication-states.css (new)
- apps/desktop/src/styles/accessibility-and-responsive.css (new)
- apps/desktop/src/styles/reader-shell-and-settings.css (new)
- apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx

Proposed edits:
1. Replace entry with exactly five bare local quoted CSS imports in leaf order.
2. Relocate verbatim complete rule bodies from current1659-line stylesheet:
   shell1-245; reader247-806; narration808-1061; accessibility1063-1242;
   shell/Settings1244-1659. Original has zeroCRLF and one terminalLF.
3. Blank246/807/1062/1243 are separators. Each leaf ends with exactly one LF;
   concatenate normalized leaf strings with one additional LF between leaves.
   Only CRLF-to-LF normalization; no interior whitespace changes/broad trimming.
4. Adapt only existing CSS-reading test loading/assembly. Parse actual entry
   statements, require every nonblank statement bare quoted local CSS import
   without qualifiers; assert exact five paths/order/uniqueness; read parsed paths
   relative to entry. Retain motion/colors/focus assertions on assembled content.
   Do not load an independent hardcoded list; no production helper/new test module.
5. Original contains no url/import/charset/namespace/layer/font-face relocation issue.

Forbidden edits: all other paths, prior units, SKIPs, markup/components,
selector/declaration changes, deduplication/regrouping, media restructuring,
CSS Modules/layers/preprocessor, dependencies/config/lockfiles, generated/frozen
or historical/completed files, assertion/timeout weakening, host/model/firewall
changes, all Git mutations.

Diff ceiling: seven paths, maximum3400 combined additions/deletions; approximately
3319 relocation lines before bounded test adaptation. Stop/re-audit on excess.

Baseline commands: local PowerShell outside sandbox, D/B:
```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop build
pnpm.cmd test:browser
```
Freeze original stylesheet bytes/identity and built CSS referenced by dist/index.html
in ignored evidence. Capture all seven statuses/SHA256/blobs, ABSENT for leaves.

Post-change commands: same seven plus pnpm.cmd test:native-startup, using verified
driver and sanitized model-free N environment. H not required for this CSS unit.
Require exact reconstruction equality, actual import checks, built CSS expanded
ordered sections/media/overrides without unresolved local imports; source
equality supplements browser/native checks. Stable identities and empty index.

Documentation impact: director progress/evidence; diagram review, no architecture change.
Decision required: none; independent D/B baseline PASS and frozen capture before order.
