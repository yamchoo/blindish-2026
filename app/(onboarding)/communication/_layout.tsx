/**
 * Communication Style Questions Layout
 * Wraps all communication style question screens
 */

import { Stack } from 'expo-router';

export default function CommunicationStyleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
