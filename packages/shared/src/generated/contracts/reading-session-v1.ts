/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

export type SchemaVersionWire = number;
export type SessionIdWire = string;
export type BookIdWire = string;
/**
 * The currently active generation within this session.
 */
export type GenerationIdWire = string;

/**
 * The active book-reading session and generation used to reject stale asynchronous work.
 */
export interface ReadingSessionV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  sessionId: SessionIdWire;
  bookIdentity: BookIdentityV1Wire;
  generationId: GenerationIdWire;
}
export interface BookIdentityV1Wire {
  scheme: string;
  schemeVersion: SchemaVersionWire;
  value: BookIdWire;
}
