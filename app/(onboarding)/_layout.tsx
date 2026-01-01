/**
 * Onboarding Layout
 * Manages the multi-step onboarding flow
 */

import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/lib/constants/colors';

export default function OnboardingLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Prevent back gestures during onboarding
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="basic-info" />
        <Stack.Screen name="lifestyle-preferences" />
        <Stack.Screen name="photos" />
        <Stack.Screen name="consent" />
        <Stack.Screen name="complete" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
