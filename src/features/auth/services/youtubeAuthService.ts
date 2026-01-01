import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

// Use iOS OAuth client for YouTube
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '';

// iOS OAuth uses reversed client ID as the scheme
// Format: com.googleusercontent.apps.[REVERSED_CLIENT_ID]
const clientIdPart = GOOGLE_CLIENT_ID.split('.apps.googleusercontent.com')[0];
const REDIRECT_URI = `com.googleusercontent.apps.${clientIdPart}:/oauth2redirect/youtube`;

const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

export const youtubeAuthService = {
  /**
   * Initiate YouTube OAuth flow (uses Google OAuth)
   */
  async connect(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Build Google OAuth URL with YouTube scope
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: YOUTUBE_SCOPE,
        access_type: 'offline',
        prompt: 'consent',
      })}`;

      console.log('Opening YouTube OAuth:', authUrl);

      // Open OAuth in native browser
      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

      if (result.type !== 'success') {
        return { success: false, error: 'Authorization cancelled' };
      }

      // Extract authorization code
      const url = new URL(result.url);
      const code = url.searchParams.get('code');

      if (!code) {
        return { success: false, error: 'No authorization code received' };
      }

      console.log('Exchanging code for tokens...');

      // Exchange code for tokens
      // Note: iOS OAuth clients don't require client_secret
      const tokenParams: Record<string, string> = {
        client_id: GOOGLE_CLIENT_ID,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      };

      // Only add client_secret if it exists (not needed for iOS clients)
      if (GOOGLE_CLIENT_SECRET) {
        tokenParams.client_secret = GOOGLE_CLIENT_SECRET;
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(tokenParams).toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        return { success: false, error: 'Failed to exchange authorization code' };
      }

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        return { success: false, error: 'Failed to get access token' };
      }

      console.log('Got tokens, fetching YouTube channel...');

      // Get YouTube channel ID
      const channelResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true',
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
      );

      if (!channelResponse.ok) {
        const errorText = await channelResponse.text();
        console.error('Failed to fetch YouTube channel:', errorText);
        return { success: false, error: `Failed to fetch channel information: ${channelResponse.status}` };
      }

      const channelData = await channelResponse.json();
      console.log('Channel data:', channelData);

      const channelId = channelData.items?.[0]?.id;

      if (!channelId) {
        // User might not have a YouTube channel - this is okay, store empty channel ID
        console.log('No YouTube channel found for user - this is okay');
        // We'll still connect, just with no channel ID
      }

      console.log('YouTube channel ID:', channelId);

      // Store tokens
      await SecureStore.setItemAsync('youtube_access_token', tokens.access_token);
      await SecureStore.setItemAsync('youtube_refresh_token', tokens.refresh_token);
      const expiresAt = Date.now() + tokens.expires_in * 1000;
      await SecureStore.setItemAsync('youtube_expires_at', String(expiresAt));

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          youtube_connected: true,
          youtube_channel_id: channelId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }

      console.log('YouTube connected successfully!');
      return { success: true };
    } catch (error) {
      console.error('YouTube OAuth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Disconnect YouTube account
   */
  async disconnect(userId: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('youtube_access_token');
      await SecureStore.deleteItemAsync('youtube_refresh_token');
      await SecureStore.deleteItemAsync('youtube_expires_at');

      await supabase
        .from('profiles')
        .update({
          youtube_connected: false,
          youtube_channel_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      console.log('YouTube disconnected');
    } catch (error) {
      console.error('Failed to disconnect YouTube:', error);
      throw error;
    }
  },

  /**
   * Get valid access token (refreshes if expired)
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync('youtube_access_token');
      const expiresAt = await SecureStore.getItemAsync('youtube_expires_at');

      if (!token || !expiresAt) {
        return null;
      }

      // Check if token expired
      if (Date.now() >= parseInt(expiresAt)) {
        console.log('YouTube token expired, refreshing...');

        const refreshToken = await SecureStore.getItemAsync('youtube_refresh_token');
        if (!refreshToken) {
          return null;
        }

        // Refresh token
        const refreshParams: Record<string, string> = {
          client_id: GOOGLE_CLIENT_ID,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        };

        // Only add client_secret if it exists (not needed for iOS clients)
        if (GOOGLE_CLIENT_SECRET) {
          refreshParams.client_secret = GOOGLE_CLIENT_SECRET;
        }

        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(refreshParams).toString(),
        });

        if (!response.ok) {
          return null;
        }

        const tokens = await response.json();

        await SecureStore.setItemAsync('youtube_access_token', tokens.access_token);
        const newExpiresAt = Date.now() + tokens.expires_in * 1000;
        await SecureStore.setItemAsync('youtube_expires_at', String(newExpiresAt));

        return tokens.access_token;
      }

      return token;
    } catch (error) {
      console.error('Failed to get YouTube token:', error);
      return null;
    }
  },
};
