/**
 * Custom fetch wrapper with timeout
 * Wraps native fetch to prevent indefinite hangs on blocked networks
 *
 * This is used by the Supabase client to add timeout protection to ALL SDK operations:
 * - Database operations (SELECT, INSERT, UPDATE, DELETE)
 * - Auth operations (getSession, signIn, signOut, setSession)
 * - Storage operations (upload, download, delete)
 * - Realtime subscriptions
 */
export function createFetchWithTimeout(timeoutMs: number = 8000) {
  return async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Convert AbortError to timeout error for better error messages
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw error;
    }
  };
}
