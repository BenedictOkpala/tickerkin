/**
 * Core provider contract boundary.
 *
 * NOTE: Data models, endpoint signatures, and response schemas are intentionally
 * omitted here pending provider discovery to prevent fictitious schema definitions.
 */
export interface RWAProvider {
  readonly id: string;
  readonly name: string;
  readonly chain: string;
}
