# Glossary

## Audio buffer

A bounded in-memory queue of generated audio waiting to be played.

## Initial audio lead

The duration of playable narration held in memory before playback begins. The MVP target is approximately 15 seconds of audio; it is not a 15-second wall-clock timer.

## Buffer underrun

A moment when playback needs audio but the buffer is empty.

## Chunk

A semantically selected portion of text submitted as one TTS generation unit.

## EPUB spine

The ordered list of publication documents defining the book's default reading order.

## Generation queue

Text chunks waiting for local TTS inference.

## Reading session

The active combination of book, chapter, position, voice, speed, and generation state. Every session should have a unique identifier so stale work can be discarded.

## Reading locator

A durable logical position in an EPUB, represented by a spine item and a precise content anchor such as an EPUB CFI or an equivalent stable element and offset. It is independent of rendered page numbers, which change when the layout reflows.

## Rendered page

The currently visible portion of reflowable EPUB content for a particular viewport and typography configuration. It is reconstructed from a reading locator and is not persisted as the authoritative reading position.

## Real-time factor

Generation time divided by generated audio duration. A value below 1.0 means generation is faster than playback.

## Semantic chunking

Splitting text at meaningful boundaries such as paragraphs, sentences, and dialogue instead of arbitrary character counts.

## Stale audio

Generated audio belonging to an earlier reading session or position that must not be played.
