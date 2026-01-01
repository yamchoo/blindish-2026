/**
 * MatchModal Component
 * Celebration modal shown when a mutual match occurs
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/lib/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { MeshGradientOverlay } from '@/components/ui';
import type { MatchResult } from '@/features/matching/types/matching.types';

const { width, height } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  matchResult: MatchResult | null;
  currentUserPhoto?: string;
  matchedUserPhoto?: string;
  matchedUserName?: string;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export function MatchModal({
  visible,
  matchResult,
  currentUserPhoto,
  matchedUserPhoto,
  matchedUserName,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  if (!matchResult || !matchResult.matched) {
    return null;
  }

  const compatibilityScore = matchResult.compatibility?.overallScore || 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onKeepSwiping}
    >
      <BlurView intensity={90} style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header with celebration animation */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title}>It's a Match!</Text>
            <Text style={styles.subtitle}>
              You and {matchedUserName || 'this person'} both liked each other
            </Text>
          </View>

          {/* Photos */}
          <View style={styles.photosContainer}>
            {/* Current user photo */}
            {currentUserPhoto && (
              <View style={[styles.photoWrapper, styles.photoLeft]}>
                <Image source={{ uri: currentUserPhoto }} style={styles.photo} />
              </View>
            )}

            {/* Heart icon in center */}
            <View style={styles.heartContainer}>
              <LinearGradient
                colors={[Colors.gradient.from, Colors.gradient.to]}
                style={styles.heartGradient}
              >
                <Ionicons name="heart" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>

            {/* Matched user photo (blurred) */}
            {matchedUserPhoto && (
              <View style={[styles.photoWrapper, styles.photoRight]}>
                <Image
                  source={{ uri: matchedUserPhoto }}
                  style={styles.photo}
                  blurRadius={24}
                />
                {/* Mesh gradient overlay for mystery effect */}
                <MeshGradientOverlay
                  opacity={0.6}
                  speed={0.7}
                  circular={true}
                  size={100}
                />
                <View style={styles.blurOverlay}>
                  <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                  <Text style={styles.blurText}>Message to reveal</Text>
                </View>
              </View>
            )}
          </View>

          {/* Compatibility score */}
          <View style={styles.compatibilityContainer}>
            <Text style={styles.compatibilityLabel}>Compatibility</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{compatibilityScore}%</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryButton} onPress={onSendMessage}>
              <LinearGradient
                colors={[Colors.gradient.from, Colors.gradient.to]}
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons
                  name="chatbubble"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryButtonText}>Send Message</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onKeepSwiping}>
              <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  photoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  photoLeft: {
    zIndex: 2,
  },
  photoRight: {
    zIndex: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  heartContainer: {
    position: 'absolute',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  heartGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  compatibilityContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  compatibilityLabel: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.light.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
