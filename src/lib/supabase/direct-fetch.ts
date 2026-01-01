/**
 * Direct REST API fallback for Supabase operations
 * Used when the Supabase client hangs or times out on blocked networks
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// No longer using cached tokens - getting fresh session from Supabase each time

/**
 * Get Supabase configuration from environment
 */
function getSupabaseConfig() {
  const supabaseUrl =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Extract auth token from AsyncStorage
 * Reads directly from storage without using Supabase client to avoid auth state conflicts
 *
 * NOTE: This is only used as a fallback when no token is provided.
 * In most cases, the token should be passed from the calling context to avoid reading from storage.
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { supabaseUrl } = getSupabaseConfig();
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
    const sessionKey = `sb-${projectId}-auth-token`;

    const storedSession = await AsyncStorage.getItem(sessionKey);

    if (!storedSession) {
      console.warn('[direct-fetch] No session found in AsyncStorage');
      return null;
    }

    const sessionData = JSON.parse(storedSession);

    // Try multiple possible locations for the token
    let token = null;

    if (sessionData.access_token) {
      token = sessionData.access_token;
    } else if (sessionData.currentSession?.access_token) {
      token = sessionData.currentSession.access_token;
    } else if (sessionData.session?.access_token) {
      token = sessionData.session.access_token;
    }

    if (!token) {
      console.warn('[direct-fetch] No token found in session data');
    }

    return token;
  } catch (error) {
    console.error('[direct-fetch] Error reading auth token:', error);
    return null;
  }
}

/**
 * Clear cached token (no-op now, kept for backwards compatibility)
 */
export function clearTokenCache() {
  // No longer caching tokens, so nothing to clear
}

/**
 * Direct INSERT operation via REST API
 */
export async function directInsert(
  table: string,
  data: Record<string, any>,
  options?: {
    select?: string;
    prefer?: string;
  },
  providedToken?: string
): Promise<{ data: any; error: any }> {
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    const token = providedToken || await getAuthToken();

    if (!token) {
      return {
        data: null,
        error: { message: 'No authentication token found' },
      };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    };

    // Add Prefer header if specified (e.g., for upsert)
    if (options?.prefer) {
      headers['Prefer'] = options.prefer;
    }

    // Add select if specified
    let url = `${supabaseUrl}/rest/v1/${table}`;
    if (options?.select) {
      url += `?select=${options.select}`;
      headers['Prefer'] = headers['Prefer']
        ? `${headers['Prefer']},return=representation`
        : 'return=representation';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[direct-fetch] INSERT error:', errorData);
      return { data: null, error: errorData };
    }

    const responseData = options?.select ? await response.json() : null;
    return { data: responseData, error: null };
  } catch (error: any) {
    console.error('[direct-fetch] INSERT exception:', error);
    return { data: null, error: { message: error.message } };
  }
}

/**
 * Direct UPDATE operation via REST API
 */
export async function directUpdate(
  table: string,
  data: Record<string, any>,
  filters: { column: string; operator: string; value: any }[],
  providedToken?: string
): Promise<{ data: any; error: any }> {
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    const token = providedToken || await getAuthToken();

    if (!token) {
      return {
        data: null,
        error: { message: 'No authentication token found' },
      };
    }

    // Build filter query string
    const filterQuery = filters
      .map((f) => `${f.column}=${f.operator}.${f.value}`)
      .join('&');

    const response = await fetch(
      `${supabaseUrl}/rest/v1/${table}?${filterQuery}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[direct-fetch] UPDATE error:', errorData);
      return { data: null, error: errorData };
    }

    return { data: null, error: null };
  } catch (error: any) {
    console.error('[direct-fetch] UPDATE exception:', error);
    return { data: null, error: { message: error.message } };
  }
}

/**
 * Direct UPSERT operation via REST API
 */
export async function directUpsert(
  table: string,
  data: Record<string, any> | Record<string, any>[],
  options?: {
    onConflict?: string;
    select?: string;
  },
  providedToken?: string
): Promise<{ data: any; error: any }> {
  // Upsert is implemented as INSERT with Prefer header
  const prefer = options?.onConflict
    ? `resolution=merge-duplicates,on_conflict=${options.onConflict}`
    : 'resolution=merge-duplicates';

  return directInsert(table, data as Record<string, any>, {
    select: options?.select,
    prefer,
  }, providedToken);
}

/**
 * Direct DELETE operation via REST API
 */
export async function directDelete(
  table: string,
  filters: { column: string; operator: string; value: any }[],
  providedToken?: string
): Promise<{ data: any; error: any }> {
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    const token = providedToken || await getAuthToken();

    if (!token) {
      return {
        data: null,
        error: { message: 'No authentication token found' },
      };
    }

    // Build filter query string
    const filterQuery = filters
      .map((f) => `${f.column}=${f.operator}.${f.value}`)
      .join('&');

    const response = await fetch(
      `${supabaseUrl}/rest/v1/${table}?${filterQuery}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[direct-fetch] DELETE error:', errorData);
      return { data: null, error: errorData };
    }

    return { data: null, error: null };
  } catch (error: any) {
    console.error('[direct-fetch] DELETE exception:', error);
    return { data: null, error: { message: error.message } };
  }
}

/**
 * Direct SELECT operation via REST API
 */
export async function directSelect(
  table: string,
  options: {
    select?: string;
    filters?: { column: string; operator: string; value: any }[];
    single?: boolean;
  },
  providedToken?: string
): Promise<{ data: any; error: any }> {
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    const token = providedToken || await getAuthToken();

    if (!token) {
      return {
        data: null,
        error: { message: 'No authentication token found' },
      };
    }

    // Build URL with select and filters
    let url = `${supabaseUrl}/rest/v1/${table}`;
    const params = [];

    if (options.select) {
      params.push(`select=${options.select}`);
    }

    if (options.filters && options.filters.length > 0) {
      options.filters.forEach((f) => {
        params.push(`${f.column}=${f.operator}.${f.value}`);
      });
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    };

    // For .single() queries, use special Accept header
    if (options.single) {
      headers['Accept'] = 'application/vnd.pgrst.object+json';
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[direct-fetch] SELECT error:', errorData);
      return { data: null, error: errorData };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error('[direct-fetch] SELECT exception:', error);
    return { data: null, error: { message: error.message } };
  }
}
