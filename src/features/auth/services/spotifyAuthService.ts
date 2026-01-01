import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';
import { supabase } from '@/lib/supabase';

// Complete the auth session when user returns from OAuth
WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET!;
// Explicitly use custom scheme (not Expo proxy)
const REDIRECT_URI = 'blindish://spotify-callback';

const SPOTIFY_SCOPES = [
  'user-top-read', // Top artists and tracks
  'user-read-recently-played', // Recent listening history
  'user-follow-read', // Followed artists
  'playlist-read-private', // User's playlists
].join(' ');

export const spotifyAuthService = {
  /**
   * Initiate Spotify OAuth flow
   */
  async connect(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Build Spotify OAuth authorization URL
      const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SPOTIFY_SCOPES,
        show_dialog: 'true', // Always show auth dialog
      })}`;

      console.log('Opening Spotify OAuth:', authUrl);
      console.log('Redirect URI:', REDIRECT_URI);

      // 2. Open OAuth flow in native browser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        REDIRECT_URI
      );

      if (result.type !== 'success') {
        console.log('OAuth cancelled or failed:', result.type);
        return { success: false, error: 'Authorization cancelled' };
      }

      // 3. Extract authorization code from redirect URL
      const url = new URL(result.url);
      const code = url.searchParams.get('code');

      if (!code) {
        console.error('No authorization code in redirect URL');
        return { success: false, error: 'No authorization code received' };
      }

      console.log('Got authorization code, exchanging for tokens...');

      // 4. Exchange authorization code for access/refresh tokens
      const credentials = Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString('base64');

      const tokenResponse = await fetch(
        'https://accounts.spotify.com/api/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
          }).toString(),
        }
      );

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        return { success: false, error: 'Failed to exchange authorization code' };
      }

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        console.error('No access token in response:', tokens);
        return { success: false, error: 'Failed to get access token' };
      }

      console.log('Got tokens, fetching Spotify user info...');

      // 5. Get Spotify user ID
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userResponse.ok) {
        console.error('Failed to fetch Spotify user');
        return { success: false, error: 'Failed to fetch user information' };
      }

      const spotifyUser = await userResponse.json();
      console.log('Spotify user ID:', spotifyUser.id);

      // 6. Store tokens securely
      await SecureStore.setItemAsync(
        'spotify_access_token',
        tokens.access_token
      );
      await SecureStore.setItemAsync(
        'spotify_refresh_token',
        tokens.refresh_token
      );
      const expiresAt = Date.now() + tokens.expires_in * 1000;
      await SecureStore.setItemAsync(
        'spotify_expires_at',
        String(expiresAt)
      );

      console.log('Tokens stored, updating database...');

      // 7. Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          spotify_connected: true,
          spotify_user_id: spotifyUser.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }

      console.log('Spotify connected successfully!');
      return { success: true };
    } catch (error) {
      console.error('Spotify OAuth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Disconnect Spotify account
   */
  async disconnect(userId: string): Promise<void> {
    try {
      // Clear tokens from secure storage
      await SecureStore.deleteItemAsync('spotify_access_token');
      await SecureStore.deleteItemAsync('spotify_refresh_token');
      await SecureStore.deleteItemAsync('spotify_expires_at');

      // Update profile in database
      await supabase
        .from('profiles')
        .update({
          spotify_connected: false,
          spotify_user_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      console.log('Spotify disconnected');
    } catch (error) {
      console.error('Failed to disconnect Spotify:', error);
      throw error;
    }
  },

  /**
   * Get valid access token (refreshes if expired)
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync('spotify_access_token');
      const expiresAt = await SecureStore.getItemAsync('spotify_expires_at');

      if (!token || !expiresAt) {
        console.log('No Spotify token found');
        return null;
      }

      // Check if token is expired
      if (Date.now() >= parseInt(expiresAt)) {
        console.log('Spotify token expired, refreshing...');

        const refreshToken = await SecureStore.getItemAsync(
          'spotify_refresh_token'
        );

        if (!refreshToken) {
          console.error('No refresh token available');
          return null;
        }

        // Refresh the access token
        const credentials = Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64');

        const response = await fetch(
          'https://accounts.spotify.com/api/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${credentials}`,
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
            }).toString(),
          }
        );

        if (!response.ok) {
          console.error('Token refresh failed');
          return null;
        }

        const tokens = await response.json();

        // Store new tokens
        await SecureStore.setItemAsync(
          'spotify_access_token',
          tokens.access_token
        );
        const newExpiresAt = Date.now() + tokens.expires_in * 1000;
        await SecureStore.setItemAsync(
          'spotify_expires_at',
          String(newExpiresAt)
        );

        // Update refresh token if provided
        if (tokens.refresh_token) {
          await SecureStore.setItemAsync(
            'spotify_refresh_token',
            tokens.refresh_token
          );
        }

        console.log('Spotify token refreshed');
        return tokens.access_token;
      }

      return token;
    } catch (error) {
      console.error('Failed to get Spotify token:', error);
      return null;
    }
  },
};
