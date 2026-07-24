# Glossary

## Audio buffer

A bounded in-memory queue of generated audio waiting to be played.

## Initial audio lead

The duration of playable narration held in memory before playback begins. The MVP target is approximately 15 seconds of audio; it is not a 15-second wall-clock timer.

## Buffer underrun

A moment when playback needs audio but the buffer is empty.

## Chunk

A generic bounded work unit. Use the more precise terms **prepared narration segment**, **TTS request**, or **audio frame** when discussing those specific boundaries; they are not interchangeable.

## Displayed text

The immutable safe semantic publication text rendered by the visual reader. Narration preparation does not rewrite or replace it.

## EPUB spine

The ordered list of publication documents defining the book's default reading order.

## Generation queue

Future bounded TTS requests waiting for local inference. The queue is not implemented.

## Locator range

An ordered pair of logical reading locators identifying a source span without storing a rendered page, quotation, or DOM path.

## Narration source text

Sensitive text selected from the safe structured document model as input to narration-only normalization. It is derived independently of the visual DOM.

## Normalized narration text

A separate sensitive, ephemeral representation prepared for speech by deterministic normalization. It is not displayed text and must not be persisted or logged.

## Prepared narration segment

A bounded nonempty portion of normalized narration text paired with the stable locator range of its source. Milestone 5 prepares this package-local representation; later milestones attach session and generation identity for TTS.

## Reading session

The active combination of book, chapter, position, voice, speed, and generation state. Every session should have a unique identifier so stale work can be discarded.

## Reading locator

A durable logical position in an EPUB, represented by a spine item and a precise content anchor such as an EPUB CFI or an equivalent stable element and offset. It is independent of rendered page numbers, which change when the layout reflows.

## Rendered page

The currently visible portion of reflowable EPUB content for a particular viewport and typography configuration. It is reconstructed from a reading locator and is not persisted as the authoritative reading position.

## Real-time factor

Generation time divided by generated audio duration. A value below 1.0 means generation is faster than playback.

## Semantic segmentation

Dividing narration text at meaningful structural and lexical boundaries such as headings, paragraphs, dialogue turns, sentences, clauses, and safe token boundaries while enforcing explicit size limits.

## TTS request

A future session- and generation-bound request sent to the local TTS process. It is not the same as a prepared narration segment because process identity and model-specific requirements belong to later milestones.

## Audio frame

A bounded ordered unit of generated audio metadata and payload produced for a narration segment. Shared frame metadata exists; production audio generation and playback do not.

## Stale audio

Generated audio belonging to an earlier reading session or position that must not be played.
