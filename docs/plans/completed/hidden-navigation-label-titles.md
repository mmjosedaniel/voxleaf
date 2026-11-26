# Hidden navigation label titles

## Goal

Resolve VF-0145 under the approved EPUB 3 Contents policy.

## User-visible outcome

A hidden link or group with a usable title shows that title in Contents. When its title is unusable, the bounded label text supplies the name. Selecting a link reaches its original destination.

## Current state

The prior November 23 review deferred this decision. On its working patch at `d9a0a72db1f5dd8a5dc7553ea0e2358c9cfe497e`, a synthetic public-open test reproduced rejection of long hidden label text despite a valid title.

## Scope and non-goals

The owner is the EPUB 3 navigation parser. Visible labels, hidden descendants, nested list structure, target resolution and EPUB 2 NCX retain their existing rules.

## Relevant files and documentation

[Navigation parser](../../../packages/epub/src/navigation/navigation-document.ts) · [EPUB boundary](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md) · [Finding history](../../development/findings/registry.md#vf-0145)

## Architecture and constraints

Select the label locally while parsing. Preserve XML validation, cancellation, the shared byte budget and the 1,024-code-point label limit. Reuse the existing normalization and charge retained title bytes once.

## Milestones

Reproduce through public open, implement bounded title selection, verify destination resolution and neighboring controls, then obtain independent review.

## Testing and benchmark strategy

Use synthetic EPUBs through the public opener and the navigation parser. Select the existing normalization, length, hidden-descendant, target and byte-budget controls in the same host Vitest run. Check the affected package’s formatting, lint, build and types.

## Risks and rollback

An invalid preferred title could mask valid text or swallow an ingestion limit. Discard only an unusable title candidate and propagate cancellation and processing-budget failures. The title preference can be reverted independently of locator handling.

## Progress log

The previous descendant-only fix did not inspect the label element itself. The public opener rejected the reported input and passed the six adjacent VF-0145 controls before the correction.

## Discoveries and decisions

Title usability follows the existing label normalizer, including trimmed Unicode edges and the normalized code-point limit. A selected title replaces the text of the label element. Descendants still pass the existing structural checks.

## Final validation results

Testing ran in normal local Windows PowerShell with the repository-pinned pnpm on the process search path. Before the implementation, `pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts -t VF-0145` reproduced `malformed-package` on the valid-title case. The same command selecting `src/navigation/navigation-document.test.ts` failed at the exact expected byte ceiling.

- `pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts src/navigation/navigation-document.test.ts -t '"VF-0145|VF-0047|VF-0060|RCF-15|DCR-07|title fallback|namespace-aware nested labels|honors cancellation|honors the ingestion deadline"'` passed all 30 selected tests. They cover hidden links and groups, normalized titles at the limit, unusable titles, ordinary labels, forbidden structure, byte accounting and exact fragment targets.
- `pnpm.cmd --filter @voxleaf/epub run build` and `pnpm.cmd --filter @voxleaf/epub run typecheck` passed. After rebuilding the exports, `pnpm.cmd --filter @voxleaf/desktop exec playwright test tests/browser/reader-epub-corrections.smoke.spec.ts --grep VF-0145` passed. Contents opened chapter two using the preferred title and returned to chapter one using text from an entry with a blank title.
- `pnpm.cmd exec prettier --check` and `pnpm.cmd exec eslint` passed over the parser, the two EPUB test files and the Chromium spec. Historical installer, runtime and benchmark results remain scoped to their previous artifacts.

[Independent review](../evidence/vf0145-hidden-title/change-review-r01.md) · [Final identity check](../evidence/vf0145-hidden-title/closeout.md)
