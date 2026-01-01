import { spotifyAuthService } from '@/features/auth/services/spotifyAuthService';
import { supabase } from '@/lib/supabase';

export interface SpotifyData {
  topArtists: { name: string; genres: string[] }[];
  topTracks: { name: string; artist: string }[];
  recentlyPlayed: { track: string; playedAt: string }[];
  followedArtists: { name: string; genres: string[] }[];
  playlists: { name: string; trackCount: number }[];
}

// Detailed data interfaces for database storage
export interface DetailedSpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  image_url?: string;
  popularity?: number;
}

export interface DetailedSpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  artist_ids: string[];
  album: string;
  album_id: string;
  preview_url?: string;
  duration_ms?: number;
  popularity?: number;
}

export interface DetailedSpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  track_count: number;
  image_url?: string;
}

export interface DetailedSpotifyData {
  top_artists: DetailedSpotifyArtist[];
  top_tracks: DetailedSpotifyTrack[];
  playlists: DetailedSpotifyPlaylist[];
  followed_artists: DetailedSpotifyArtist[];
  recently_played: DetailedSpotifyTrack[];
}

export const spotifyDataService = {
  /**
   * Fetch all relevant Spotify data for personality analysis
   */
  async fetchUserData(): Promise<SpotifyData | null> {
    try {
      const accessToken = await spotifyAuthService.getAccessToken();

      if (!accessToken) {
        console.log('No Spotify access token available');
        return null;
      }

      const headers = { Authorization: `Bearer ${accessToken}` };

      console.log('Fetching Spotify data...');

      // Fetch all endpoints in parallel for performance
      const [
        topArtistsRes,
        topTracksRes,
        recentRes,
        followedRes,
        playlistsRes,
      ] = await Promise.all([
        fetch(
          'https://api.spotify.com/v1/me/top/artists?limit=20&time_range=medium_term',
          { headers }
        ),
        fetch(
          'https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=medium_term',
          { headers }
        ),
        fetch(
          'https://api.spotify.com/v1/me/player/recently-played?limit=50',
          { headers }
        ),
        fetch(
          'https://api.spotify.com/v1/me/following?type=artist&limit=50',
          { headers }
        ),
        fetch('https://api.spotify.com/v1/me/playlists?limit=20', { headers }),
      ]);

      // Parse all responses
      const [topArtists, topTracks, recent, followed, playlists] =
        await Promise.all([
          topArtistsRes.json(),
          topTracksRes.json(),
          recentRes.json(),
          followedRes.json(),
          playlistsRes.json(),
        ]);

      console.log('Spotify data fetched successfully');

      // Transform into simplified format for AI analysis
      const data: SpotifyData = {
        topArtists:
          topArtists.items?.map((artist: any) => ({
            name: artist.name,
            genres: artist.genres || [],
          })) || [],

        topTracks:
          topTracks.items?.map((track: any) => ({
            name: track.name,
            artist: track.artists?.[0]?.name || 'Unknown',
          })) || [],

        recentlyPlayed:
          recent.items?.map((item: any) => ({
            track: item.track?.name || 'Unknown',
            playedAt: item.played_at,
          })) || [],

        followedArtists:
          followed.artists?.items?.map((artist: any) => ({
            name: artist.name,
            genres: artist.genres || [],
          })) || [],

        playlists:
          playlists.items?.map((playlist: any) => ({
            name: playlist.name,
            trackCount: playlist.tracks?.total || 0,
          })) || [],
      };

      return data;
    } catch (error) {
      console.error('Failed to fetch Spotify data:', error);
      return null;
    }
  },

  /**
   * Extract unique genres from Spotify data
   */
  extractGenres(data: SpotifyData): string[] {
    const allGenres = new Set<string>();

    // Collect genres from top artists
    data.topArtists.forEach((artist) => {
      artist.genres.forEach((genre) => allGenres.add(genre));
    });

    // Collect genres from followed artists
    data.followedArtists.forEach((artist) => {
      artist.genres.forEach((genre) => allGenres.add(genre));
    });

    return Array.from(allGenres);
  },

  /**
   * Get summary statistics for logging/debugging
   */
  getSummary(data: SpotifyData): string {
    const genres = this.extractGenres(data);
    return `Top Artists: ${data.topArtists.length}, Top Tracks: ${data.topTracks.length}, Genres: ${genres.length}, Playlists: ${data.playlists.length}`;
  },

  /**
   * Fetch detailed Spotify data with IDs, images, and metadata
   * This data is stored in the database for specific match insights
   */
  async fetchDetailedData(): Promise<DetailedSpotifyData | null> {
    try {
      const accessToken = await spotifyAuthService.getAccessToken();

      if (!accessToken) {
        console.log('No Spotify access token available');
        return null;
      }

      const headers = { Authorization: `Bearer ${accessToken}` };

      console.log('Fetching detailed Spotify data...');

      // Fetch all endpoints in parallel
      const [
        topArtistsRes,
        topTracksRes,
        recentRes,
        followedRes,
        playlistsRes,
      ] = await Promise.all([
        fetch(
          'https://api.spotify.com/v1/me/top/artists?limit=20&time_range=medium_term',
          { headers }
        ),
        fetch(
          'https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=medium_term',
          { headers }
        ),
        fetch(
          'https://api.spotify.com/v1/me/player/recently-played?limit=50',
          { headers }
        ),
        fetch(
          'https://api.spotify.com/v1/me/following?type=artist&limit=50',
          { headers }
        ),
        fetch('https://api.spotify.com/v1/me/playlists?limit=20', { headers }),
      ]);

      // Parse all responses
      const [topArtists, topTracks, recent, followed, playlists] =
        await Promise.all([
          topArtistsRes.json(),
          topTracksRes.json(),
          recentRes.json(),
          followedRes.json(),
          playlistsRes.json(),
        ]);

      console.log('Detailed Spotify data fetched successfully');

      // Transform into detailed format for database storage
      const data: DetailedSpotifyData = {
        top_artists:
          topArtists.items?.map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            genres: artist.genres || [],
            image_url: artist.images?.[0]?.url,
            popularity: artist.popularity,
          })) || [],

        top_tracks:
          topTracks.items?.map((track: any) => ({
            id: track.id,
            name: track.name,
            artists: track.artists?.map((a: any) => a.name) || [],
            artist_ids: track.artists?.map((a: any) => a.id) || [],
            album: track.album?.name || '',
            album_id: track.album?.id || '',
            preview_url: track.preview_url,
            duration_ms: track.duration_ms,
            popularity: track.popularity,
          })) || [],

        playlists:
          playlists.items?.map((playlist: any) => ({
            id: playlist.id,
            name: playlist.name,
            description: playlist.description,
            track_count: playlist.tracks?.total || 0,
            image_url: playlist.images?.[0]?.url,
          })) || [],

        followed_artists:
          followed.artists?.items?.map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            genres: artist.genres || [],
            image_url: artist.images?.[0]?.url,
            popularity: artist.popularity,
          })) || [],

        recently_played:
          recent.items?.slice(0, 20).map((item: any) => ({
            id: item.track?.id || '',
            name: item.track?.name || 'Unknown',
            artists: item.track?.artists?.map((a: any) => a.name) || [],
            artist_ids: item.track?.artists?.map((a: any) => a.id) || [],
            album: item.track?.album?.name || '',
            album_id: item.track?.album?.id || '',
            preview_url: item.track?.preview_url,
            duration_ms: item.track?.duration_ms,
            popularity: item.track?.popularity,
          })) || [],
      };

      return data;
    } catch (error) {
      console.error('Failed to fetch detailed Spotify data:', error);
      return null;
    }
  },

  /**
   * Sync detailed Spotify data to the database
   * This data is used for showing specific match insights
   */
  async syncDetailedDataToDatabase(userId: string): Promise<boolean> {
    try {
      const detailedData = await this.fetchDetailedData();

      if (!detailedData) {
        console.error('No detailed Spotify data to sync');
        return false;
      }

      // Upsert to spotify_user_data table
      const { error } = await supabase
        .from('spotify_user_data')
        .upsert(
          {
            user_id: userId,
            top_artists: detailedData.top_artists,
            top_tracks: detailedData.top_tracks,
            playlists: detailedData.playlists,
            followed_artists: detailedData.followed_artists,
            recently_played: detailedData.recently_played,
            synced_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error('Error syncing detailed Spotify data:', error);
        return false;
      }

      console.log('Detailed Spotify data synced successfully');
      return true;
    } catch (error) {
      console.error('Failed to sync detailed Spotify data:', error);
      return false;
    }
  },
};
