/**
 * Lifestyle Preferences Screen
 * Collects lifestyle preferences like kids, drinking, smoking, cannabis, religion, politics
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card, AnimatedBackground } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';
import { Ionicons } from '@expo/vector-icons';

type WantsKids = 'yes' | 'maybe' | 'no' | 'has_kids' | 'prefer_not_to_say';
type Drinking = 'never' | 'rarely' | 'socially' | 'regularly' | 'prefer_not_to_say';
type Smoking = 'never' | 'sometimes' | 'regularly' | 'prefer_not_to_say';
type MarijuanaUse = 'no' | 'sometimes' | 'yes' | 'prefer_not_to_say';

const KIDS_OPTIONS: { value: WantsKids; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe someday' },
  { value: 'no', label: 'No' },
  { value: 'has_kids', label: 'Already have kids' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const DRINKING_OPTIONS: { value: Drinking; label: string }[] = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'socially', label: 'Socially' },
  { value: 'regularly', label: 'Regularly' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const SMOKING_OPTIONS: { value: Smoking; label: string }[] = [
  { value: 'never', label: 'Never' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'regularly', label: 'Regularly' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const MARIJUANA_OPTIONS: { value: MarijuanaUse; label: string }[] = [
  { value: 'no', label: 'Never' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'yes', label: 'Regularly' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const POLITICS_OPTIONS = [
  'Liberal',
  'Moderate',
  'Conservative',
  'Other',
  'Prefer not to say',
];

const RELIGION_OPTIONS = [
  'None',
  'Christian',
  'Jewish',
  'Muslim',
  'Hindu',
  'Buddhist',
  'Spiritual',
  'Other',
  'Prefer not to say',
];

export default function LifestylePreferencesScreen() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    wantsKids: '' as WantsKids | '',
    wantsKidsVisible: true,
    drinking: '' as Drinking | '',
    drinkingVisible: true,
    smoking: '' as Smoking | '',
    smokingVisible: true,
    marijuana: '' as MarijuanaUse | '',
    marijuanaVisible: true,
    religion: '',
    religionVisible: true,
    politics: '',
    politicsVisible: true,
  });

  const handleContinue = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    setLoading(true);

    try {
      // Prepare personality_profiles data
      const personalityData: any = {};

      if (formData.wantsKids) {
        personalityData.wants_kids = formData.wantsKids;
        personalityData.wants_kids_visible = formData.wantsKidsVisible;
      }

      if (formData.drinking) {
        personalityData.drinking = formData.drinking;
        personalityData.drinking_visible = formData.drinkingVisible;
      }

      if (formData.smoking) {
        personalityData.smoking = formData.smoking;
        personalityData.smoking_visible = formData.smokingVisible;
      }

      if (formData.marijuana) {
        personalityData.marijuana_use = formData.marijuana;
        personalityData.marijuana_visible = formData.marijuanaVisible;
      }

      if (formData.religion) {
        personalityData.religion = formData.religion;
        personalityData.religion_visible = formData.religionVisible;
      }

      if (formData.politics) {
        personalityData.politics = formData.politics;
        personalityData.politics_visible = formData.politicsVisible;
      }

      // Only upsert if there's data to save
      if (Object.keys(personalityData).length > 0) {
        personalityData.user_id = user.id;

        const { error: profileError } = await supabase
          .from('personality_profiles')
          .upsert(personalityData);

        if (profileError) {
          console.error('Error updating personality profile:', profileError);
          Alert.alert('Error', `Failed to save preferences: ${profileError.message}`);
          return;
        }
      }

      // Update onboarding step in profiles table
      const { error: stepError } = await supabase
        .from('profiles')
        .update({
          onboarding_step: 2,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (stepError) {
        console.error('Error updating onboarding step:', stepError);
        Alert.alert('Error', `Failed to update progress: ${stepError.message}`);
        return;
      }

      // Refresh profile
      await refreshProfile();

      // Continue to photos screen
      router.push('/(onboarding)/photos');
    } catch (error) {
      console.error('Error in handleContinue:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip all preferences and move to next screen
    router.push('/(onboarding)/photos');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground opacity={0.2} speed={0.5} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Lifestyle & Values</Text>
            <Text style={styles.subtitle}>
              Help us find better matches by sharing your lifestyle preferences (all optional)
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Kids Preference */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Do you want kids?</Text>
              <View style={styles.optionsGrid}>
                {KIDS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      formData.wantsKids === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, wantsKids: option.value }))}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.wantsKids === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formData.wantsKids && formData.wantsKids !== 'prefer_not_to_say' && (
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setFormData(prev => ({ ...prev, wantsKidsVisible: !prev.wantsKidsVisible }))}
                >
                  <Ionicons
                    name={formData.wantsKidsVisible ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={formData.wantsKidsVisible ? Colors.interactive.primary : Colors.light.text.secondary}
                  />
                  <Text style={styles.visibilityText}>Visible on profile</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Drinking */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Drinking habits?</Text>
              <View style={styles.optionsGrid}>
                {DRINKING_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      formData.drinking === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, drinking: option.value }))}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.drinking === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formData.drinking && formData.drinking !== 'prefer_not_to_say' && (
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setFormData(prev => ({ ...prev, drinkingVisible: !prev.drinkingVisible }))}
                >
                  <Ionicons
                    name={formData.drinkingVisible ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={formData.drinkingVisible ? Colors.interactive.primary : Colors.light.text.secondary}
                  />
                  <Text style={styles.visibilityText}>Visible on profile</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Smoking */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Smoking?</Text>
              <View style={styles.optionsGrid}>
                {SMOKING_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      formData.smoking === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, smoking: option.value }))}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.smoking === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formData.smoking && formData.smoking !== 'prefer_not_to_say' && (
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setFormData(prev => ({ ...prev, smokingVisible: !prev.smokingVisible }))}
                >
                  <Ionicons
                    name={formData.smokingVisible ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={formData.smokingVisible ? Colors.interactive.primary : Colors.light.text.secondary}
                  />
                  <Text style={styles.visibilityText}>Visible on profile</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Cannabis */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Cannabis use?</Text>
              <View style={styles.optionsGrid}>
                {MARIJUANA_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      formData.marijuana === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, marijuana: option.value }))}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.marijuana === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formData.marijuana && formData.marijuana !== 'prefer_not_to_say' && (
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setFormData(prev => ({ ...prev, marijuanaVisible: !prev.marijuanaVisible }))}
                >
                  <Ionicons
                    name={formData.marijuanaVisible ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={formData.marijuanaVisible ? Colors.interactive.primary : Colors.light.text.secondary}
                  />
                  <Text style={styles.visibilityText}>Visible on profile</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Religion */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Religion</Text>
              <View style={styles.optionsGrid}>
                {RELIGION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.religion === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, religion: option }))}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.religion === option && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formData.religion && formData.religion !== 'Prefer not to say' && (
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setFormData(prev => ({ ...prev, religionVisible: !prev.religionVisible }))}
                >
                  <Ionicons
                    name={formData.religionVisible ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={formData.religionVisible ? Colors.interactive.primary : Colors.light.text.secondary}
                  />
                  <Text style={styles.visibilityText}>Visible on profile</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Politics */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Political views</Text>
              <View style={styles.optionsGrid}>
                {POLITICS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.politics === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, politics: option }))}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.politics === option && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formData.politics && formData.politics !== 'Prefer not to say' && (
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setFormData(prev => ({ ...prev, politicsVisible: !prev.politicsVisible }))}
                >
                  <Ionicons
                    name={formData.politicsVisible ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={formData.politicsVisible ? Colors.interactive.primary : Colors.light.text.secondary}
                  />
                  <Text style={styles.visibilityText}>Visible on profile</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={Colors.light.text.secondary} />
              <Text style={styles.infoText}>
                These preferences are optional but help us find more compatible matches. You can always change your visibility settings later.
              </Text>
            </View>
          </View>
        </View>
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View style={styles.footer}>
          <Button
            title="Skip for now"
            onPress={handleSkip}
            size="lg"
            fullWidth
            variant="secondary"
            style={styles.skipButton}
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            size="lg"
            fullWidth
            loading={loading}
          />
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
  },
  form: {
    gap: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.sans,
    fontWeight: Typography.weights.medium,
    color: Colors.light.text.primary,
    marginBottom: Spacing.xs,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  optionButtonSelected: {
    borderColor: Colors.interactive.primary,
    backgroundColor: Colors.interactive.primary,
  },
  optionText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.sans,
    fontWeight: Typography.weights.medium,
    color: Colors.light.text.primary,
  },
  optionTextSelected: {
    color: Colors.light.text.inverse,
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  visibilityText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.sans,
    color: Colors.light.text.secondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.sans,
    color: Colors.light.text.secondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.sm,
  },
  skipButton: {
    marginBottom: 0,
  },
});
