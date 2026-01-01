/**
 * Voice Recording Service
 * Handles voice greeting recording, playback, and upload using expo-av
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';

export interface RecordingStatus {
  isRecording: boolean;
  durationMillis: number;
  canRecord: boolean;
}

export interface PlaybackStatus {
  isPlaying: boolean;
  durationMillis: number;
  positionMillis: number;
}

class VoiceRecordingService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;

  /**
   * Request audio recording permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  /**
   * Check if recording permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   * @param maxDurationMillis - Maximum recording duration (default: 30 seconds)
   */
  async startRecording(maxDurationMillis: number = 30000): Promise<void> {
    try {
      // Check permissions first
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Audio recording permission not granted');
        }
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Create new recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        100 // Update interval for status
      );

      this.recording = recording;

      // Auto-stop after max duration
      setTimeout(() => {
        if (this.recording) {
          this.stopRecording();
        }
      }, maxDurationMillis);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return the audio file URI
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  /**
   * Pause recording
   */
  async pauseRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.pauseAsync();
      }
    } catch (error) {
      console.error('Error pausing recording:', error);
      throw error;
    }
  }

  /**
   * Resume recording
   */
  async resumeRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.startAsync();
      }
    } catch (error) {
      console.error('Error resuming recording:', error);
      throw error;
    }
  }

  /**
   * Get current recording status
   */
  async getRecordingStatus(): Promise<RecordingStatus | null> {
    try {
      if (!this.recording) {
        return null;
      }

      const status = await this.recording.getStatusAsync();
      return {
        isRecording: status.isRecording,
        durationMillis: status.durationMillis,
        canRecord: status.canRecord,
      };
    } catch (error) {
      console.error('Error getting recording status:', error);
      return null;
    }
  }

  /**
   * Cancel recording without saving
   */
  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }
    } catch (error) {
      console.error('Error canceling recording:', error);
      throw error;
    }
  }

  /**
   * Play audio from URI
   */
  async playAudio(uri: string): Promise<void> {
    try {
      // Unload any existing sound
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Load and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      this.sound = sound;

      // Auto-unload when finished
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          this.sound = null;
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  /**
   * Stop audio playback
   */
  async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
      throw error;
    }
  }

  /**
   * Pause audio playback
   */
  async pauseAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw error;
    }
  }

  /**
   * Resume audio playback
   */
  async resumeAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
      throw error;
    }
  }

  /**
   * Get current playback status
   */
  async getPlaybackStatus(): Promise<PlaybackStatus | null> {
    try {
      if (!this.sound) {
        return null;
      }

      const status = await this.sound.getStatusAsync();
      if (!status.isLoaded) {
        return null;
      }

      return {
        isPlaying: status.isPlaying,
        durationMillis: status.durationMillis || 0,
        positionMillis: status.positionMillis,
      };
    } catch (error) {
      console.error('Error getting playback status:', error);
      return null;
    }
  }

  /**
   * Upload voice greeting to Supabase storage
   * @param userId - User ID for file naming
   * @param audioUri - Local file URI
   * @returns Public URL of uploaded file
   */
  async uploadVoiceGreeting(userId: string, audioUri: string): Promise<string> {
    try {
      // Read file as base64 (using legacy API)
      const base64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to blob
      const response = await fetch(`data:audio/m4a;base64,${base64}`);
      const blob = await response.blob();

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}/voice-greeting-${timestamp}.m4a`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('voice-greetings')
        .upload(filename, blob, {
          contentType: 'audio/m4a',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('voice-greetings')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading voice greeting:', error);
      throw error;
    }
  }

  /**
   * Delete voice greeting from Supabase storage
   */
  async deleteVoiceGreeting(url: string): Promise<void> {
    try {
      // Extract path from URL
      const urlParts = url.split('/voice-greetings/');
      if (urlParts.length < 2) {
        throw new Error('Invalid voice greeting URL');
      }

      const path = urlParts[1];

      // Delete from storage
      const { error } = await supabase.storage
        .from('voice-greetings')
        .remove([path]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting voice greeting:', error);
      throw error;
    }
  }

  /**
   * Get audio duration from URI
   */
  async getAudioDuration(uri: string): Promise<number> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      const status = await sound.getStatusAsync();

      await sound.unloadAsync();

      if (status.isLoaded && status.durationMillis) {
        return Math.floor(status.durationMillis / 1000); // Convert to seconds
      }

      return 0;
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 0;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Error cleaning up voice recording service:', error);
    }
  }
}

// Export singleton instance
export const voiceRecordingService = new VoiceRecordingService();
