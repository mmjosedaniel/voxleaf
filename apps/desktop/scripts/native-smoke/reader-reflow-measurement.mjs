// Serialized into the reader by both the Chromium and WebView2 runners.
export async function measureReaderReflowAtPassage({
  readingLineInset,
  limitMs,
  prepare = false,
}) {
  const { document, HTMLElement, HTMLSelectElement, Node, Event, performance } =
    globalThis;
  const viewport = document.querySelector('[data-reader-scroll-owner="true"]');
  const select = document.querySelector('select[name="textScale"]');
  const reader = document.querySelector(".semantic-reader");
  const passage = () => document.querySelector(".semantic-document h2 + p");
  if (!(viewport instanceof HTMLElement) || !(reader instanceof HTMLElement)) {
    throw new Error("reader-reflow-controls-unavailable");
  }

  function targetRect(offset) {
    const paragraph = passage();
    const node = paragraph?.firstChild;
    if (node?.nodeType !== Node.TEXT_NODE || offset >= node.length) return null;
    const range = document.createRange();
    range.setStart(node, offset);
    range.setEnd(node, offset + 1);
    return range.getBoundingClientRect();
  }

  const readingLine = () =>
    viewport.getBoundingClientRect().top + readingLineInset;
  if (prepare) {
    const initialRect = targetRect(200);
    if (initialRect === null)
      throw new Error("reader-reflow-target-unavailable");
    viewport.scrollTop +=
      initialRect.top + initialRect.height / 2 - readingLine();
    const nextFrame = () =>
      new Promise((resolve) => globalThis.requestAnimationFrame(resolve));
    await nextFrame();
    await nextFrame();
    await nextFrame();
    const paragraph = passage();
    const x =
      Math.max(
        paragraph.getBoundingClientRect().left,
        viewport.getBoundingClientRect().left,
      ) + 1;
    const caret = document.caretPositionFromPoint?.(x, readingLine());
    const range =
      caret == null
        ? document.caretRangeFromPoint?.(x, readingLine())
        : undefined;
    const offset = caret?.offset ?? range?.startOffset;
    if (
      (caret?.offsetNode ?? range?.startContainer) !== paragraph.firstChild ||
      !Number.isSafeInteger(offset) ||
      offset <= 0
    ) {
      throw new Error("reader-reflow-interior-offset-unavailable");
    }
    globalThis.__voxleafReaderBenchmarkOffset = offset;
    return 0;
  }
  const offset = globalThis.__voxleafReaderBenchmarkOffset;
  delete globalThis.__voxleafReaderBenchmarkOffset;
  if (!Number.isSafeInteger(offset) || offset <= 0)
    throw new Error("reader-reflow-interior-offset-unavailable");
  const positioned = targetRect(offset);
  const beforeFontSize = globalThis.getComputedStyle(passage()).fontSize;
  if (
    positioned === null ||
    positioned.top > readingLine() ||
    positioned.bottom < readingLine() ||
    viewport.scrollTop <= 0 ||
    viewport.scrollTop >= viewport.scrollHeight - viewport.clientHeight ||
    !(select instanceof HTMLSelectElement) ||
    select.value === "large"
  ) {
    throw new Error("reader-reflow-target-not-positioned");
  }

  return new Promise((resolve, reject) => {
    let frame;
    let alignedFrames = 0;
    const startedAt = performance.now();
    const timer = globalThis.setTimeout(() => {
      globalThis.cancelAnimationFrame(frame);
      reject(
        new Error(
          `reader-reflow-alignment-timeout: scale=${reader.dataset.readerTextScale} distance=${(targetRect(offset)?.top ?? 0) - readingLine()}`,
        ),
      );
    }, limitMs);
    const sample = () => {
      const paragraph = passage();
      const rect = targetRect(offset);
      if (
        reader.dataset.readerTextScale === "large" &&
        paragraph !== null &&
        globalThis.getComputedStyle(paragraph).fontSize !== beforeFontSize &&
        rect !== null &&
        Math.abs(rect.top - readingLine()) <= 1
      ) {
        alignedFrames += 1;
        if (alignedFrames === 2 && performance.now() - startedAt <= limitMs) {
          globalThis.clearTimeout(timer);
          resolve(performance.now() - startedAt);
          return;
        }
      } else {
        alignedFrames = 0;
      }
      frame = globalThis.requestAnimationFrame(sample);
    };
    select.value = "large";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    frame = globalThis.requestAnimationFrame(sample);
  });
}
