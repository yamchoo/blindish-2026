/**
 * Question Screen Component
 * Reusable layout for single-question-per-page onboarding flow
 * Enhanced with animations, keyboard handling, and celebrations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';
import {
  useOnboardingProgressStore,
  type OnboardingSection,
  getMilestoneMessage,
} from '@/stores/onboardingProgressStore';

interface QuestionScreenProps {
  title: string;
  description?: string;
  progress: number;           // 0-1 for progress bar
  totalQuestions: number;
  currentQuestion: number;
  children: React.ReactNode;  // Answer input component
  onContinue: () => void;
  onBack?: () => void;
  canContinue: boolean;       // Validation
  loading?: boolean;
  // Enhanced props
  emoji?: string;             // Optional emoji above title
  celebrationMessage?: string; // Optional success message
  showCelebration?: boolean;  // Trigger celebration
  titleSize?: 'lg' | 'xl' | '2xl';  // Title size variation
  keyboardAvoiding?: boolean; // Enable keyboard avoidance (default true)
  // Global progress tracking
  section?: OnboardingSection; // Section for global progress tracking
  showGlobalProgress?: boolean; // Show global progress indicator (default true)
  onMilestoneCelebration?: (message: string) => void; // Callback for milestone celebrations
}

export function QuestionScreen({
  title,
  description,
  progress,
  totalQuestions,
  currentQuestion,
  children,
  onContinue,
  onBack,
  canContinue,
  loading = false,
  emoji,
  celebrationMessage,
  showCelebration = false,
  titleSize = 'xl',
  keyboardAvoiding = true,
  section,
  showGlobalProgress = true,
  onMilestoneCelebration,
}: QuestionScreenProps) {
  // Global progress tracking
  const globalProgress = useOnboardingProgressStore((state) =>
    state.getPercentComplete()
  );
  const currentStep = useOnboardingProgressStore((state) => state.currentStep);
  const totalSteps = useOnboardingProgressStore((state) => 19); // 0-18 = 19 steps
  const shouldShowMilestone = useOnboardingProgressStore((state) =>
    state.shouldShowMilestone
  );
  const markMilestoneComplete = useOnboardingProgressStore((state) =>
    state.markMilestoneComplete
  );

  // Staggered entrance animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const descriptionAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Progress bar width animation
  const progressWidth = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    // Staggered fade-in sequence
    Animated.sequence([
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.delay(100),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in description (if exists)
    if (description) {
      Animated.timing(descriptionAnim, {
        toValue: 1,
        duration: 300,
        delay: 200,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start();
    }

    // Fade in content
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 300,
      delay: 300,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();

    // Fade in button
    Animated.timing(buttonAnim, {
      toValue: 1,
      duration: 300,
      delay: 400,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate progress bar changes with spring
  useEffect(() => {
    Animated.spring(progressWidth, {
      toValue: progress,
      useNativeDriver: false, // Width animation can't use native driver
      tension: 50,
      friction: 7,
    }).start();
  }, [progress]);

  // Check for milestone celebrations
  useEffect(() => {
    const milestone = shouldShowMilestone();
    if (milestone && onMilestoneCelebration) {
      const message = getMilestoneMessage(milestone);
      onMilestoneCelebration(message);
      markMilestoneComplete(milestone);
    }
  }, [globalProgress, shouldShowMilestone, onMilestoneCelebration, markMilestoneComplete]);

  const getTitleSize = () => {
    switch (titleSize) {
      case 'lg':
        return Typography.sizes['2xl'];
      case 'xl':
        return Typography.sizes['3xl'];
      case '2xl':
        return Typography.sizes['4xl'];
      default:
        return Typography.sizes['3xl'];
    }
  };

  const content = (
    <View style={styles.container}>
      <AnimatedBackground opacity={0.2} speed={0.5} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Progress Indicators */}
        <Animated.View style={[styles.progressContainer, { opacity: progressAnim }]}>
          {/* Global Progress (if enabled) */}
          {showGlobalProgress && (
            <>
              <View style={styles.globalProgressBar}>
                <View
                  style={[
                    styles.globalProgressFill,
                    { width: `${globalProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.globalProgressText}>
                {currentStep} of {totalSteps} • {globalProgress}% complete
              </Text>
            </>
          )}

          {/* Section Progress Bar */}
          <View style={[styles.progressBar, showGlobalProgress && styles.sectionProgressBar]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          {showGlobalProgress && (
            <Text style={styles.sectionProgressText}>
              Step {currentQuestion} of {totalQuestions}
            </Text>
          )}
        </Animated.View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Question */}
          <View style={styles.content}>
            {/* Optional Emoji */}
            {emoji && (
              <Animated.Text style={[styles.emoji, { opacity: titleAnim }]}>
                {emoji}
              </Animated.Text>
            )}

            {/* Animated Title */}
            <Animated.Text
              style={[
                styles.title,
                { fontSize: getTitleSize(), opacity: titleAnim },
              ]}
            >
              {title}
            </Animated.Text>

            {/* Animated Description */}
            {description && (
              <Animated.Text style={[styles.description, { opacity: descriptionAnim }]}>
                {description}
              </Animated.Text>
            )}

            {/* Animated Answer Component (passed as children) */}
            <Animated.View style={[styles.answerContainer, { opacity: contentAnim }]}>
              {children}
            </Animated.View>

            {/* Optional Celebration Message */}
            {celebrationMessage && showCelebration && (
              <Animated.View style={[styles.celebrationContainer, { opacity: contentAnim }]}>
                <Text style={styles.celebrationText}>{celebrationMessage}</Text>
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Animated Navigation Buttons */}
        <Animated.View style={[styles.footer, { opacity: buttonAnim }]}>
          {onBack ? (
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={Colors.interactive.primary}
                />
              </TouchableOpacity>
              <View style={styles.continueButton}>
                <Button
                  title="Continue"
                  onPress={onContinue}
                  disabled={!canContinue}
                  loading={loading}
                  size="md"
                  fullWidth
                />
              </View>
            </View>
          ) : (
            <Button
              title="Continue"
              onPress={onContinue}
              disabled={!canContinue}
              loading={loading}
              size="md"
              fullWidth
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );

  // Wrap with KeyboardAvoidingView if enabled
  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  // Global progress bar (primary, larger)
  globalProgressBar: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  globalProgressFill: {
    height: '100%',
    backgroundColor: Colors.interactive.primary,
    borderRadius: 3,
  },
  globalProgressText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: Typography.weights.medium,
  },
  // Section progress bar (secondary, smaller)
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sectionProgressBar: {
    height: 4, // Smaller when global progress is shown
    marginTop: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.interactive.primary,
  },
  sectionProgressText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    color: Colors.light.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: 40, // Increased breathing room
  },
  content: {
    flex: 1,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    marginBottom: Spacing.lg, // Increased from md
    lineHeight: Typography.sizes['3xl'] * Typography.lineHeights.tight,
    letterSpacing: -0.5, // Added for elegance
  },
  description: {
    fontFamily: Typography.fonts.sans,
    fontSize: 17, // Increased from 16px
    color: Colors.light.text.secondary,
    marginBottom: 40, // Increased from xl (32px)
    lineHeight: 17 * 1.6, // Better readability
  },
  answerContainer: {
    marginTop: Spacing.md,
  },
  celebrationContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  celebrationText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.interactive.primary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    width: 52, // Increased from 48px
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },
  continueButton: {
    flex: 1,
  },
});
