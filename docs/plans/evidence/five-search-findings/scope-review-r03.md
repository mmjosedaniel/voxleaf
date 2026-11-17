**Prospective scope assessment: FSF-SCOPE-R03-20261116**

The metadata approach fits the safe-document/reader boundary **in principle**. It can preserve the existing flattened structure while giving descendants one shared resolved direction. It is a materially different implementation decision and should be recorded in the active plan before proceeding.

Essential constraints:

- **Exact scope semantics:** Collect eligible safe text in source order, excluding nested explicit direction declarations—including fixed-direction subtrees. Explicit Auto with no eligible strong character must follow native Auto semantics; do not substitute inherited fallback without evidence. [HTML directionality rules](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute)
- **Structural transparency:** Preserve existing admission, implicit paragraphs, locator identities/order, fragment targets, whitespace, code text and narration offsets. Metadata must not change narration context or segmentation.
- **Bounded ownership:** Bound scope count, graph depth, retained metadata, scratch text, DOM probes and total scanning/measurement work. A bounded scratch buffer alone does not establish bounded processing. Preserve responsiveness and cancellation before rendering; do not synchronously scan an entire large document outside existing work limits.
- **Lifecycle isolation:** Replacement, closure or cancellation must retire the resolution and remove its probes. Stale results must never reach another document. Cache ownership must end with the document and must not retain additional publication text.
- **Safe browser use:** Probes must contain application-created elements and text only, remain inaccessible and unfocusable, avoid observable page layout effects, and release all sensitive scratch content. Keep this DOM-dependent operation entirely in the reader.
- **Browser proof:** Verify the actual hidden-probe technique and chunked scanning against native Auto behavior, including opposite directions, neutral-only scopes, strong characters beyond scratch boundaries, nested Auto/fixed exclusions and mixed flattened containers. Confirm unchanged reopen, progressive rendering and locator mapping.

This approach is not approved merely because it avoids structural wrappers. Its exact algorithm, resource accounting and lifecycle behavior require implementation evidence and a new full review. No tests, edits, delegation or Git mutations were performed.
