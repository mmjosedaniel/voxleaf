**Prospective scope assessment: FSF-SCOPE-R02-20261116**

**Yes—preserving existing admission and addressable order is essential for these previously admitted inert shapes.** ADR-0007 requires traversing safe descendants of unknown inert XHTML containers, preserving supported structure/text in source order, and inheriting closed direction context. It does not classify an unknown container as inline merely because it declares Auto.

The current default branch in `xhtml-projector.ts:1003` introduces an inline destination for that declaration. A subsequent supported paragraph then fails `requireBlockDestination()`. This is a concrete admission regression in the inspected source. Conversely, unconditionally creating a block boundary would change existing implicit-paragraph segmentation.

The bounded correctness criterion is:

- For previously admitted unknown inert containers, adding direction-scope representation must preserve admission, paragraph/heading boundaries, addressable-block order and identity, source-fragment targets, displayed text, whitespace and code-point offsets.
- Preserve one declaration’s direction across its inherited descendants, including mixed content. Scope entry/exit alone must not create a paragraph break.
- Retain existing rejection of malformed semantic nesting, existing known block-boundary behavior, privacy restrictions, resource bounds and progressive rendering.
- Add representative public regressions for inline-only, block-descendant and mixed unknown-container content, including surrounding text and nested inert containers. Compare locator/text structure with the pre-correction projection and verify computed direction for the inherited descendants.

If the proposed inline/block scope representations cannot express these cases without changing admission or logical segmentation, that representation remains incomplete for this correction. Silently narrowing supported inert-container shapes would exceed the approved behavior change.

This assessment adds a preservation constraint to **FSF-SCOPE-R01-20261116**; it does not approve the current implementation or renew prior evidence. No tests, edits, delegation or Git mutations were performed.
