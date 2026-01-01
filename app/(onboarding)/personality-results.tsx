import { View, Text, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { personalityService } from '@/features/personality/services/personalityService';

// Helper function to generate personality narrative
const generatePersonalityNarrative = (traits: any): string => {
  if (!traits) return '';

  // Identify dominant traits (>60)
  const dominant = [];
  if (traits.openness > 60) dominant.push('adventurous and creative');
  if (traits.conscientiousness > 60) dominant.push('organized and reliable');
  if (traits.extraversion > 60) dominant.push('outgoing and energetic');
  if (traits.agreeableness > 60) dominant.push('warm and compassionate');
  if (traits.neuroticism < 40) dominant.push('emotionally stable');

  // Build narrative
  if (dominant.length === 0) {
    return "You have a balanced personality with unique strengths. You value authentic connections and seek meaningful relationships built on mutual understanding.";
  }

  const traitText = dominant.slice(0, 2).join(' and ');
  return `You're ${traitText}. You value deep conversations and authentic connections. Your ideal match appreciates your genuine nature and shares your curiosity about life.`;
};

export default function PersonalityResultsScreen() {
  const { user } = useAuthStore();
  const [personality, setPersonality] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Animation refs for staggered entrance
  const fadeAnims = useRef(Array(5).fill(0).map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(Array(5).fill(0).map(() => new Animated.Value(30))).current;

  useEffect(() => {
    loadPersonality();
  }, []);

  const loadPersonality = async () => {
    if (!user) return;

    const data = await personalityService.getPersonalityProfile(user.id);
    setPersonality(data);
    setLoading(false);

    // Start staggered animations after data loads
    if (data) {
      setTimeout(() => {
        fadeAnims.forEach((anim, index) => {
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              delay: index * 100,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              useNativeDriver: true,
            }),
            Animated.timing(slideAnims[index], {
              toValue: 0,
              duration: 400,
              delay: index * 100,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              useNativeDriver: true,
            }),
          ]).start();
        });
      }, 200);
    }
  };

  const handleContinue = () => {
    router.push('/(onboarding)/photos');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading your personality profile...</Text>
      </View>
    );
  }

  if (!personality) {
    // Analysis failed or not configured - skip for now
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Personality Analysis Unavailable</Text>
          <Text style={styles.subtitle}>
            We couldn't analyze your personality at this time. This usually means the OpenAI API key isn't configured yet. You can continue with onboarding and we'll analyze your profile later.
          </Text>
          <Button onPress={handleContinue} style={{ marginTop: 24 }}>
            Continue
          </Button>
        </View>
      </View>
    );
  }

  const bigFiveTraits = [
    { label: 'Openness', score: personality.openness, emoji: '🌟' },
    { label: 'Conscientiousness', score: personality.conscientiousness, emoji: '📋' },
    { label: 'Extraversion', score: personality.extraversion, emoji: '🎉' },
    { label: 'Agreeableness', score: personality.agreeableness, emoji: '🤝' },
    { label: 'Neuroticism', score: personality.neuroticism, emoji: '😌' },
  ];

  // Generate narrative summary
  const narrative = generatePersonalityNarrative(personality);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Personality Profile</Text>
      </View>

      {/* Personality Snapshot Card */}
      <View style={styles.snapshotCard}>
        <Text style={styles.snapshotEmoji}>✨</Text>
        <Text style={styles.snapshotTitle}>Your Personality Snapshot</Text>
        <Text style={styles.snapshotText}>{narrative}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Big Five Personality Traits</Text>

        {bigFiveTraits.map((trait, index) => (
          <Animated.View
            key={trait.label}
            style={[
              styles.traitRow,
              {
                opacity: fadeAnims[index],
                transform: [{ translateX: slideAnims[index] }],
              },
            ]}
          >
            <View style={styles.traitLabel}>
              <Text style={styles.traitEmoji}>{trait.emoji}</Text>
              <Text style={styles.traitName}>{trait.label}</Text>
            </View>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreBarBackground}>
                <View
                  style={[
                    styles.scoreBar,
                    { width: `${trait.score}%` },
                  ]}
                />
              </View>
              <Text style={styles.scoreText}>{trait.score}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {personality.traits && personality.traits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality Traits</Text>
          <View style={styles.tagsContainer}>
            {personality.traits.map((trait: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {personality.interests && personality.interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tagsContainer}>
            {personality.interests.map((interest: string, index: number) => (
              <View key={index} style={[styles.tag, styles.tagSecondary]}>
                <Text style={[styles.tagText, styles.tagTextSecondary]}>
                  {interest}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {personality.values && personality.values.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Values</Text>
          <View style={styles.tagsContainer}>
            {personality.values.map((value: string, index: number) => (
              <View key={index} style={[styles.tag, styles.tagTertiary]}>
                <Text style={[styles.tagText, styles.tagTextTertiary]}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Matching Teaser */}
      <View style={styles.matchingTeaser}>
        <Text style={styles.teaserEmoji}>🎯</Text>
        <Text style={styles.teaserTitle}>Ready to meet your matches?</Text>
        <Text style={styles.teaserText}>
          We'll use these insights to find people who complement your personality
          and share your values. Just a couple more steps!
        </Text>
      </View>

      <View style={styles.footer}>
        <Button onPress={handleContinue}>Continue</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: 'Cormorant-Bold',
    fontSize: Typography.sizes['3xl'],
    color: Colors.light.text.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: Typography.sizes.lg,
    color: Colors.light.text.primary,
    marginBottom: Spacing.md,
  },
  traitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  traitLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  traitEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  traitName: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.base,
    color: Colors.light.text.primary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreBarBackground: {
    width: 100,
    height: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    backgroundColor: Colors.interactive.primary,
    borderRadius: 4,
  },
  scoreText: {
    fontFamily: 'Inter-Bold',
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    minWidth: 30,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  tagSecondary: {
    backgroundColor: 'rgba(255, 180, 162, 0.1)',
    borderColor: 'rgba(255, 180, 162, 0.2)',
  },
  tagTertiary: {
    backgroundColor: 'rgba(255, 139, 167, 0.1)',
    borderColor: 'rgba(255, 139, 167, 0.2)',
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.interactive.primary,
  },
  tagTextSecondary: {
    color: Colors.peach,
  },
  tagTextTertiary: {
    color: Colors.pink,
  },
  explainer: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  explainerText: {
    fontFamily: 'Inter',
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Personality Snapshot Card
  snapshotCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
  },
  snapshotEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  snapshotTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: Typography.sizes.lg,
    color: Colors.light.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  snapshotText: {
    fontFamily: 'Inter',
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.6,
  },
  // Matching Teaser
  matchingTeaser: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  teaserEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  teaserTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: Typography.sizes.xl,
    color: Colors.light.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  teaserText: {
    fontFamily: 'Inter',
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.6,
  },
  footer: {
    marginTop: Spacing.lg,
  },
});
