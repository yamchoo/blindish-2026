/**
 * Discover Screen
 * Main matching/swiping screen with card stack
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';
import { useAuthStore } from '@/stores/authStore';
import { useDiscoverFeed } from '@/features/matching/hooks/useDiscoverFeed';
import { useSwipeActions } from '@/features/matching/hooks/useSwipeActions';
import { CardStack } from '@/components/matching/CardStack';
import { MatchModal } from '@/components/matching/MatchModal';
import { KebabMenu } from '@/components/matching/KebabMenu';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import type { MatchResult, PotentialMatch } from '@/features/matching/types/matching.types';

export default function DiscoverScreen() {
  const { user, profile } = useAuthStore();
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | undefined>();
  const [matchedUserPhoto, setMatchedUserPhoto] = useState<string | undefined>();
  const [matchedUserName, setMatchedUserName] = useState<string | undefined>();
  const [currentMatch, setCurrentMatch] = useState<PotentialMatch | null>(null);

  // Fetch discover feed
  const {
    matches,
    isLoading,
    isError,
    error,
    refresh,
    isRefetching,
    removeFromFeed,
  } = useDiscoverFeed(user?.id || null);

  // Swipe actions
  const { handleLike, handlePass, handleUndo, canUndo, isLoading: isSwipeLoading } =
    useSwipeActions({
      userId: user?.id || null,
      onMatch: (result) => {
        // Handle match
        setMatchResult(result);
        setShowMatchModal(true);

        // TODO: Fetch photos for match modal
        // For now, use placeholder or fetch from current match
        if (currentMatch) {
          setMatchedUserPhoto(currentMatch.primaryPhoto.url);
          setMatchedUserName(currentMatch.name);
        }
      },
      onError: (err, action) => {
        console.error(`Error during ${action}:`, err);
        Alert.alert('Error', `Failed to ${action}. Please try again.`);
      },
    });

  // Handle swipe left (pass)
  const onSwipeLeft = (match: PotentialMatch) => {
    setCurrentMatch(match);
    removeFromFeed(match.userId);
    handlePass(match.userId, match);
  };

  // Handle swipe right (like)
  const onSwipeRight = (match: PotentialMatch) => {
    setCurrentMatch(match);
    removeFromFeed(match.userId);
    handleLike(match.userId, match);
  };

  // Handle match modal actions
  const handleSendMessage = () => {
    setShowMatchModal(false);
    // Navigate to chat with the matched user
    if (matchResult?.matchId) {
      router.push(`/chat/${matchResult.matchId}`);
    }
  };

  const handleKeepSwiping = () => {
    setShowMatchModal(false);
    setMatchResult(null);
    setCurrentMatch(null);
  };

  // Show onboarding if not completed
  if (profile && !profile.onboarding_completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="heart-outline" size={64} color={Colors.coral} />
          <Text style={styles.message}>
            Complete your profile to start discovering matches
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.coral} />
          <Text style={styles.loadingText}>Finding your matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
          <Text style={styles.errorText}>Failed to load matches</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refresh()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground opacity={0.2} speed={0.5} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>blindish</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={28} color={Colors.light.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <CardStack
          matches={matches}
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
          onRefresh={refresh}
          isRefreshing={isRefetching}
        />

        {/* Floating Kebab Menu */}
        {matches.length > 0 && (
          <View style={styles.menuOverlay}>
            <KebabMenu
              canUndo={canUndo}
              isSwipeLoading={isSwipeLoading}
              isRefetching={isRefetching}
              hasMatches={matches.length > 0}
              onUndo={handleUndo}
              onPass={() => {
                const topMatch = matches[0];
                if (topMatch) onSwipeLeft(topMatch);
              }}
              onLike={() => {
                const topMatch = matches[0];
                if (topMatch) onSwipeRight(topMatch);
              }}
              onRefresh={refresh}
            />
          </View>
        )}
      </View>

      {/* Match Modal */}
      <MatchModal
        visible={showMatchModal}
        matchResult={matchResult}
        currentUserPhoto={currentUserPhoto}
        matchedUserPhoto={matchedUserPhoto}
        matchedUserName={matchedUserName}
        onSendMessage={handleSendMessage}
        onKeepSwiping={handleKeepSwiping}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    marginRight: 'auto',
    justifyContent: 'flex-start',
  },
  logoText: {
    fontSize: 36,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fonts.serif,
    color: Colors.coral,
  },
  cardContainer: {
    flex: 1,
    position: 'relative',
  },
  menuOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 50,
  },
  message: {
    fontSize: 16,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.text.secondary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text.primary,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.coral,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
