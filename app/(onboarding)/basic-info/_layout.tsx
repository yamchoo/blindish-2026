/**
 * Basic Info Layout
 * Stack navigator for the 7 basic info question screens
 */

import { Stack } from 'expo-router';

export default function BasicInfoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable back gestures during onboarding
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="name" />
      <Stack.Screen name="birthday" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="looking-for" />
      <Stack.Screen name="occupation" />
      <Stack.Screen name="height" />
      <Stack.Screen name="voice-greeting" />
    </Stack>
  );
}
