/**
 * Lifestyle Questions Layout
 * Stack navigator for lifestyle questions with slide animations
 */

import { Stack } from 'expo-router';

export default function LifestyleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right', // Built-in Expo Router animation
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="kids" />
      <Stack.Screen name="drinking" />
      <Stack.Screen name="smoking" />
      <Stack.Screen name="cannabis" />
      <Stack.Screen name="religion" />
      <Stack.Screen name="politics" />
    </Stack>
  );
}
