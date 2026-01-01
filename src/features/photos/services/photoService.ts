/**
 * Photo Service
 * Handles photo uploads, compression, and management
 */

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { supabase, withRetryAndFallback, directInsert, directDelete, directSelect } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase/session-helper';
import { Config } from '@/lib/constants/config';
import { visionProvider } from '@/lib/ai/visionProvider';

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: Error;
}

/**
 * Request camera permissions
 */
export const requestCameraPermissions = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

/**
 * Pick image from camera
 */
export const pickImageFromCamera = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    const hasPermission = await requestCameraPermissions();

    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Error picking image from camera:', error);
    return null;
  }
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermissions();

    if (!hasPermission) {
      throw new Error('Media library permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    return null;
  }
};

/**
 * Compress and resize image
 */
const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: Config.features.photos.maxDimension,
          },
        },
      ],
      {
        compress: Config.features.photos.compressionQuality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

/**
 * Convert image URI to base64
 */
const imageUriToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Analyze photo using OpenAI Vision API (async, non-blocking)
 * Fetches user gender and triggers AI analysis
 */
const analyzePhotoAsync = async (photoUrl: string, userId: string) => {
  try {
    console.log('[PhotoService] Starting async photo analysis:', photoUrl);

    // Fetch user profile to get gender
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('[PhotoService] Failed to fetch user profile for photo analysis:', profileError);
      return;
    }

    // Call vision provider (this calls the Edge Function which handles the AI analysis and database storage)
    await visionProvider.analyzePhoto({
      imageUrl: photoUrl,
      userGender: profile.gender as 'male' | 'female' | 'non-binary' | 'other',
      userId,
    });

    console.log('[PhotoService] Photo analysis completed successfully');
  } catch (error) {
    console.error('[PhotoService] Error during async photo analysis:', error);
    // Don't throw - this is a non-blocking background operation
  }
};

/**
 * Upload photo to Supabase Storage
 */
export const uploadPhoto = async (
  userId: string,
  imageUri: string,
  position: number
): Promise<PhotoUploadResult> => {
  try {
    // Compress image
    const compressedUri = await compressImage(imageUri);

    // Convert to base64
    const base64Data = await imageUriToBase64(compressedUri);

    // Generate file name
    const fileName = `${userId}/photo_${position}_${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(fileName, decode(base64Data), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Trigger photo analysis in background (non-blocking)
    analyzePhotoAsync(publicUrl, userId).catch((err) => {
      console.error('[PhotoService] Photo analysis failed but upload succeeded:', err);
    });

    return {
      success: true,
      url: publicUrl,
      path: fileName,
    };
  } catch (error) {
    console.error('Error in uploadPhoto:', error);
    return {
      success: false,
      error: error as Error,
    };
  }
};

/**
 * Save photo metadata to database
 */
export const savePhotoToDatabase = async (
  userId: string,
  storageUrl: string,
  storagePath: string,
  position: number,
  isPrimary: boolean = false
) => {
  try {
    // Get auth token for fallback operations (from in-memory auth store, no network call)
    const authToken = getAuthToken();

    const photoData = {
      user_id: userId,
      storage_url: storageUrl,
      storage_path: storagePath,
      position,
      is_primary: isPrimary,
    };

    const { data, error } = await withRetryAndFallback(
      () => supabase.from('photos').insert(photoData).select().single(),
      (token) => directInsert('photos', photoData, { select: '*' }, token),
      undefined,
      authToken
    );

    if (error) {
      console.error('Error saving photo to database:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in savePhotoToDatabase:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Delete photo from storage and database
 */
export const deletePhoto = async (photoId: string, storagePath: string) => {
  try {
    // Get auth token for fallback operations (from in-memory auth store, no network call)
    const authToken = getAuthToken();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('photos')
      .remove([storagePath]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      throw storageError;
    }

    // Delete from database with retry/fallback pattern
    const { error: dbError } = await withRetryAndFallback(
      () => supabase.from('photos').delete().eq('id', photoId),
      (token) => directDelete('photos', [{ column: 'id', operator: 'eq', value: photoId }], token),
      undefined,
      authToken
    );

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      throw dbError;
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deletePhoto:', error);
    return { error: error as Error };
  }
};

/**
 * Get user photos
 */
export const getUserPhotos = async (userId: string) => {
  try {
    // Get auth token for fallback operations (from in-memory auth store, no network call)
    const authToken = getAuthToken();

    const { data, error } = await withRetryAndFallback(
      () =>
        supabase
          .from('photos')
          .select('*')
          .eq('user_id', userId)
          .order('position', { ascending: true }),
      (token) =>
        directSelect('photos', {
          select: '*',
          filters: [{ column: 'user_id', operator: 'eq', value: userId }],
        }, token),
      undefined,
      authToken
    );

    if (error) {
      console.error('Error getting user photos:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserPhotos:', error);
    return { data: null, error: error as Error };
  }
};
