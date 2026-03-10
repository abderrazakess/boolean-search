/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

export interface KeywordGroup {
  group: string;
  terms: string[];
}

export interface KeywordGroupsResponse {
  groups: KeywordGroup[];
}
