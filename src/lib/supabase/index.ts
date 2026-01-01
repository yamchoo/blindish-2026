/**
 * Supabase Module - Central Export Point
 *
 * This module provides:
 * - Supabase client instance
 * - Retry/fallback utilities for resilient database operations
 * - Direct REST API fallback for blocked networks
 * - Database type definitions
 */

// Export Supabase client and utilities
export { supabase, getCurrentUser, isAuthenticated, signOut } from './client';

// Export fetch utilities
export { createFetchWithTimeout } from './fetch-with-timeout';

// Export retry utilities
export { withRetry, withRetryAndFallback } from './retry';

// Export direct fetch utilities (for advanced use cases)
export {
  directInsert,
  directUpdate,
  directUpsert,
  directDelete,
  directSelect,
  clearTokenCache,
} from './direct-fetch';

// Export types
export type { RetryOptions } from './types';
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Message,
  MessageInsert,
  Match,
  MatchInsert,
  MatchUpdate,
  PersonalityProfile,
  PersonalityProfileInsert,
  Photo,
  PhotoInsert,
} from './client';
