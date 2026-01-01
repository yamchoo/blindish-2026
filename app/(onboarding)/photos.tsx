/**
 * Photos Upload Screen
 * Upload 1-6 photos during onboarding
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, AnimatedBackground } from '@/components/ui';
import { BlurRevealDemo } from '@/components/onboarding';
import { useAuth } from '@/features/auth';
import { useAuthStore } from '@/stores/authStore';
import {
  pickImageFromCamera,
  pickImageFromGallery,
  uploadPhoto,
  savePhotoToDatabase,
  getUserPhotos,
  deletePhoto,
} from '@/features/photos/services/photoService';
import { supabase, withRetryAndFallback, directUpdate } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase/session-helper';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';
import { Config } from '@/lib/constants/config';
import type { Photo } from '@/lib/supabase';

export default function PhotosScreen() {
  const { user, refreshProfile } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadPhotos();
    }
  }, [user]);

  const loadPhotos = async () => {
    if (!user) return;

    const { data } = await getUserPhotos(user.id);
    if (data) {
      setPhotos(data);
    }
  };

  const handleAddPhoto = async (sourceType: 'camera' | 'gallery') => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (photos.length >= Config.features.photos.maxCount) {
      Alert.alert('Maximum photos reached', `You can only upload ${Config.features.photos.maxCount} photos.`);
      return;
    }

    try {
      const position = photos.length;
      setUploadingIndex(position);

      // Pick image
      const image = sourceType === 'camera'
        ? await pickImageFromCamera()
        : await pickImageFromGallery();

      if (!image) {
        setUploadingIndex(null);
        return;
      }

      // Upload to storage
      const uploadResult = await uploadPhoto(user.id, image.uri, position);

      if (!uploadResult.success || !uploadResult.url || !uploadResult.path) {
        Alert.alert('Upload failed', 'Failed to upload photo. Please try again.');
        setUploadingIndex(null);
        return;
      }

      // Save to database
      const { error } = await savePhotoToDatabase(
        user.id,
        uploadResult.url,
        uploadResult.path,
        position,
        position === 0 // First photo is primary
      );

      if (error) {
        Alert.alert('Error', 'Failed to save photo. Please try again.');
        setUploadingIndex(null);
        return;
      }

      // Reload photos
      await loadPhotos();
      setUploadingIndex(null);
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setUploadingIndex(null);
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deletePhoto(photo.id, photo.storage_path);
            if (error) {
              Alert.alert('Error', 'Failed to delete photo. Please try again.');
              return;
            }
            await loadPhotos();
          },
        },
      ]
    );
  };

  const handleContinue = async () => {
    if (photos.length === 0) {
      Alert.alert('Add at least one photo', 'Please add at least one photo to continue.');
      return;
    }

    if (!user) return;

    setLoading(true);

    // Set operation in progress to prevent navigation redirects
    useAuthStore.getState().setOperationInProgress(true);

    try {
      // Update onboarding step with retry/fallback pattern
      // Get auth token for fallback operations (from in-memory auth store, no network call)
      const authToken = getAuthToken();

      const updateData = {
        onboarding_step: 3,
        updated_at: new Date().toISOString(),
      };

      const { error } = await withRetryAndFallback(
        () => supabase.from('profiles').update(updateData).eq('id', user.id),
        (token) =>
          directUpdate('profiles', updateData, [
            { column: 'id', operator: 'eq', value: user.id },
          ], token),
        undefined,
        authToken
      );

      if (error) {
        console.error('Error updating onboarding step:', error);
        Alert.alert('Error', 'Failed to save progress. Please try again.');
        return;
      }

      await refreshProfile();
      router.push('/(onboarding)/consent');
    } catch (error) {
      console.error('Error in handleContinue:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      // Clear operation in progress flag
      useAuthStore.getState().setOperationInProgress(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Photos?',
      'You can add photos later, but having photos greatly improves your matches.',
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Skip',
          onPress: handleContinue,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground opacity={0.2} speed={0.5} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Your Photos</Text>
            <Text style={styles.subtitle}>
              Your photos reveal gradually as you connect with matches
            </Text>
          </View>

          {/* Blur Demo Section */}
          <View style={styles.blurDemoSection}>
            <Text style={styles.demoTitle}>How Blindish Works</Text>

            <View style={styles.demoContainer}>
              {/* Blurred state */}
              <View style={styles.demoItem}>
                <View style={styles.demoCircleContainer}>
                  <BlurRevealDemo size={120} autoPlay={false} />
                  <View style={styles.staticBlurOverlay} />
                </View>
                <Text style={styles.demoLabel}>First match</Text>
                <Text style={styles.demoCaption}>Photos start blurred</Text>
              </View>

              {/* Arrow */}
              <Ionicons
                name="arrow-forward"
                size={32}
                color={Colors.interactive.primary}
                style={styles.arrowIcon}
              />

              {/* Clear state */}
              <View style={styles.demoItem}>
                <View style={styles.demoCircleContainer}>
                  <BlurRevealDemo size={120} autoPlay={true} speed={1.5} />
                </View>
                <Text style={styles.demoLabel}>Great conversation</Text>
                <Text style={styles.demoCaption}>Photos gradually reveal</Text>
              </View>
            </View>

            <View style={styles.demoExplainer}>
              <Ionicons name="heart-circle" size={20} color={Colors.interactive.primary} />
              <Text style={styles.demoExplainerText}>
                Connect through personality first, looks reveal as you bond
              </Text>
            </View>
          </View>

          {/* Photo Grid */}
          <View style={styles.photoGrid}>
            {Array.from({ length: Config.features.photos.maxCount }).map((_, index) => {
              const photo = photos.find(p => p.position === index);
              const isUploading = uploadingIndex === index;

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.photoSlot}
                  onPress={() => {
                    if (photo) {
                      handleDeletePhoto(photo);
                    } else if (index === photos.length) {
                      // Only allow adding to the next available slot
                      Alert.alert(
                        'Add Photo',
                        'Choose a source',
                        [
                          { text: 'Camera', onPress: () => handleAddPhoto('camera') },
                          { text: 'Gallery', onPress: () => handleAddPhoto('gallery') },
                          { text: 'Cancel', style: 'cancel' },
                        ]
                      );
                    }
                  }}
                  disabled={!photo && index !== photos.length}
                >
                  {photo ? (
                    <>
                      <Image source={{ uri: photo.storage_url }} style={styles.photoImage} />
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoNumber}>{index + 1}</Text>
                      </View>
                    </>
                  ) : isUploading ? (
                    <View style={styles.uploadingContainer}>
                      <ActivityIndicator size="large" color={Colors.interactive.primary} />
                    </View>
                  ) : (
                    <View style={styles.emptySlot}>
                      <Text style={styles.plusIcon}>+</Text>
                      <Text style={styles.emptyText}>
                        {index === 0 ? 'Add Photo' : ''}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tips */}
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Photo Tips</Text>
            <Text style={styles.tip}>• Show your face clearly in at least one photo</Text>
            <Text style={styles.tip}>• Include photos of your hobbies and interests</Text>
            <Text style={styles.tip}>• Avoid group photos where you're hard to identify</Text>
            <Text style={styles.tip}>• Be yourself – authenticity attracts the right people</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          size="lg"
          fullWidth
          loading={loading}
          disabled={photos.length === 0}
        />
        {photos.length === 0 && (
          <Button
            title="Skip for Now"
            onPress={handleSkip}
            size="md"
            variant="ghost"
            fullWidth
          />
        )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  // Blur Demo Section
  blurDemoSection: {
    backgroundColor: 'rgba(255, 107, 107, 0.03)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.1)',
  },
  demoTitle: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  demoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  demoItem: {
    alignItems: 'center',
    flex: 1,
  },
  demoCircleContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  staticBlurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 60,
    margin: 4,
  },
  demoLabel: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs / 2,
  },
  demoCaption: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    color: Colors.light.text.secondary,
    textAlign: 'center',
  },
  arrowIcon: {
    marginHorizontal: Spacing.xs,
    marginTop: 45,
  },
  demoExplainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 107, 0.1)',
  },
  demoExplainerText: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  // Photo Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  photoSlot: {
    width: '47%',
    aspectRatio: 4 / 5,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.interactive.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoNumber: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.inverse,
  },
  uploadingContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: Typography.sizes['4xl'],
    color: Colors.light.text.tertiary,
  },
  emptyText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.tertiary,
    marginTop: Spacing.xs,
  },
  tips: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tipsTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.primary,
    marginBottom: Spacing.xs,
  },
  tip: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.sm,
  },
});
