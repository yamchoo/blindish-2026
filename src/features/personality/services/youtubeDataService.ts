import { youtubeAuthService } from '@/features/auth/services/youtubeAuthService';
import { supabase } from '@/lib/supabase';

export interface YouTubeData {
  subscriptions: { title: string; description: string }[];
  likedVideos: { title: string; description: string }[];
  playlists: { title: string; videoCount: number }[];
}

// Detailed data interfaces for database storage
export interface DetailedYouTubeSubscription {
  channel_id: string;
  channel_title: string;
  description?: string;
  thumbnail?: string;
  subscriber_count?: string;
}

export interface DetailedYouTubeVideo {
  video_id: string;
  title: string;
  channel_title: string;
  channel_id: string;
  description?: string;
  thumbnail?: string;
  published_at?: string;
  duration?: string;
}

export interface DetailedYouTubePlaylist {
  playlist_id: string;
  title: string;
  description?: string;
  item_count: number;
  thumbnail?: string;
}

export interface DetailedYouTubeData {
  subscriptions: DetailedYouTubeSubscription[];
  liked_videos: DetailedYouTubeVideo[];
  playlists: DetailedYouTubePlaylist[];
}

export const youtubeDataService = {
  /**
   * Fetch all relevant YouTube data for personality analysis
   */
  async fetchUserData(): Promise<YouTubeData | null> {
    try {
      const accessToken = await youtubeAuthService.getAccessToken();

      if (!accessToken) {
        console.log('No YouTube access token available');
        return null;
      }

      const baseUrl = 'https://www.googleapis.com/youtube/v3';
      const headers = { Authorization: `Bearer ${accessToken}` };

      console.log('Fetching YouTube data...');

      // Fetch subscriptions, liked videos, and playlists in parallel
      const [subscriptionsRes, likedVideosRes, playlistsRes] = await Promise.all([
        fetch(`${baseUrl}/subscriptions?part=snippet&mine=true&maxResults=50`, {
          headers,
        }),
        fetch(`${baseUrl}/videos?part=snippet&myRating=like&maxResults=50`, {
          headers,
        }),
        fetch(`${baseUrl}/playlists?part=snippet,contentDetails&mine=true&maxResults=20`, {
          headers,
        }),
      ]);

      const [subscriptions, likedVideos, playlists] = await Promise.all([
        subscriptionsRes.json(),
        likedVideosRes.json(),
        playlistsRes.json(),
      ]);

      console.log('YouTube data fetched successfully');

      const data: YouTubeData = {
        subscriptions:
          subscriptions.items?.map((item: any) => ({
            title: item.snippet?.title || 'Unknown',
            description: item.snippet?.description || '',
          })) || [],

        likedVideos:
          likedVideos.items?.map((item: any) => ({
            title: item.snippet?.title || 'Unknown',
            description: item.snippet?.description || '',
          })) || [],

        playlists:
          playlists.items?.map((item: any) => ({
            title: item.snippet?.title || 'Unknown',
            videoCount: item.contentDetails?.itemCount || 0,
          })) || [],
      };

      return data;
    } catch (error) {
      console.error('Failed to fetch YouTube data:', error);
      return null;
    }
  },

  /**
   * Get summary for logging
   */
  getSummary(data: YouTubeData): string {
    return `Subscriptions: ${data.subscriptions.length}, Liked Videos: ${data.likedVideos.length}, Playlists: ${data.playlists.length}`;
  },

  /**
   * Fetch detailed YouTube data with IDs, thumbnails, and metadata
   * This data is stored in the database for specific match insights
   */
  async fetchDetailedData(): Promise<DetailedYouTubeData | null> {
    try {
      const accessToken = await youtubeAuthService.getAccessToken();

      if (!accessToken) {
        console.log('No YouTube access token available');
        return null;
      }

      const baseUrl = 'https://www.googleapis.com/youtube/v3';
      const headers = { Authorization: `Bearer ${accessToken}` };

      console.log('Fetching detailed YouTube data...');

      // Fetch subscriptions, liked videos, and playlists in parallel
      const [subscriptionsRes, likedVideosRes, playlistsRes] = await Promise.all([
        fetch(`${baseUrl}/subscriptions?part=snippet&mine=true&maxResults=50`, {
          headers,
        }),
        fetch(`${baseUrl}/videos?part=snippet,contentDetails&myRating=like&maxResults=50`, {
          headers,
        }),
        fetch(`${baseUrl}/playlists?part=snippet,contentDetails&mine=true&maxResults=20`, {
          headers,
        }),
      ]);

      const [subscriptions, likedVideos, playlists] = await Promise.all([
        subscriptionsRes.json(),
        likedVideosRes.json(),
        playlistsRes.json(),
      ]);

      console.log('Detailed YouTube data fetched successfully');

      // Transform into detailed format for database storage
      const data: DetailedYouTubeData = {
        subscriptions:
          subscriptions.items?.map((item: any) => ({
            channel_id: item.snippet?.resourceId?.channelId || '',
            channel_title: item.snippet?.title || 'Unknown',
            description: item.snippet?.description || '',
            thumbnail: item.snippet?.thumbnails?.default?.url,
            subscriber_count: item.subscriberCount,
          })) || [],

        liked_videos:
          likedVideos.items?.map((item: any) => ({
            video_id: item.id || '',
            title: item.snippet?.title || 'Unknown',
            channel_title: item.snippet?.channelTitle || '',
            channel_id: item.snippet?.channelId || '',
            description: item.snippet?.description || '',
            thumbnail: item.snippet?.thumbnails?.default?.url,
            published_at: item.snippet?.publishedAt,
            duration: item.contentDetails?.duration,
          })) || [],

        playlists:
          playlists.items?.map((item: any) => ({
            playlist_id: item.id || '',
            title: item.snippet?.title || 'Unknown',
            description: item.snippet?.description || '',
            item_count: item.contentDetails?.itemCount || 0,
            thumbnail: item.snippet?.thumbnails?.default?.url,
          })) || [],
      };

      return data;
    } catch (error) {
      console.error('Failed to fetch detailed YouTube data:', error);
      return null;
    }
  },

  /**
   * Sync detailed YouTube data to the database
   * This data is used for showing specific match insights
   */
  async syncDetailedDataToDatabase(userId: string): Promise<boolean> {
    try {
      const detailedData = await this.fetchDetailedData();

      if (!detailedData) {
        console.error('No detailed YouTube data to sync');
        return false;
      }

      // Upsert to youtube_user_data table
      const { error } = await supabase
        .from('youtube_user_data')
        .upsert(
          {
            user_id: userId,
            subscriptions: detailedData.subscriptions,
            liked_videos: detailedData.liked_videos,
            playlists: detailedData.playlists,
            synced_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error('Error syncing detailed YouTube data:', error);
        return false;
      }

      console.log('Detailed YouTube data synced successfully');
      return true;
    } catch (error) {
      console.error('Failed to sync detailed YouTube data:', error);
      return false;
    }
  },
};
