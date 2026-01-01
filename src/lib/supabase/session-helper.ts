/**
 * Session Helper
 * Provides in-memory access to auth token without network calls
 *
 * This is a performance optimization to avoid calling supabase.auth.getSession()
 * which makes a network request. Since the auth store already has the session
 * in memory (kept up-to-date by the auth state listener), we can read from there directly.
 */

import { useAuthStore } from '@/stores/authStore';

/**
 * Get auth token from the auth store (in-memory, no network call)
 *
 * Use this instead of supabase.auth.getSession() when you already know
 * the user is authenticated. This is significantly faster and avoids
 * potential hangs on blocked networks.
 *
 * @returns The access token from the current session, or null if not authenticated
 *
 * @example
 * ```typescript
 * import { getAuthToken } from '@/lib/supabase/session-helper';
 *
 * const authToken = getAuthToken();
 * if (authToken) {
 *   // Use token for direct API calls or fallback operations
 * }
 * ```
 */
export function getAuthToken(): string | null {
  const session = useAuthStore.getState().session;
  return session?.access_token || null;
}
