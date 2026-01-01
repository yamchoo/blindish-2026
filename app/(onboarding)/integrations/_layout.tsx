/**
 * Integrations Stack Layout
 * Navigation for Spotify and YouTube integration screens
 */

import { Stack } from 'expo-router';

export default function IntegrationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
