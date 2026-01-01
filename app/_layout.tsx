import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import {
  Cormorant_400Regular,
  Cormorant_700Bold,
} from '@expo-google-fonts/cormorant';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore, initializeAuthListener } from '@/stores/authStore';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Initialize dev menu (account deletion, etc.)
// Temporarily disabled - need to install expo-dev-menu package
// import '@/utils/devMenu';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Start with login, auth routing will handle redirects
  initialRouteName: 'login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Cormorant: Cormorant_700Bold,
    'Cormorant-Regular': Cormorant_400Regular,
    'Cormorant-Bold': Cormorant_700Bold,
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    ...FontAwesome.font,
  });
  const { initialize, isInitialized } = useAuthStore();

  // Initialize auth
  useEffect(() => {
    initializeAuthListener();
    initialize();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const { user, profile, isLoading, operationInProgress } = useAuthStore();

  useEffect(() => {
    // DEBUG: Log all state changes
    console.log('[navigation] State:', {
      isLoading,
      operationInProgress,
      hasUser: !!user,
      hasProfile: !!profile,
      onboardingCompleted: profile?.onboarding_completed,
      onboardingStep: profile?.onboarding_step,
      currentSegment: segments[0],
    });

    if (isLoading) return;

    // Don't redirect if operation in progress (e.g., form submission)
    if (operationInProgress) {
      console.log('[navigation] Skipping redirect - operation in progress');
      return;
    }

    const inAuth = segments[0] === 'login';
    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';

    // Not authenticated - redirect to login
    if (!user && !inAuth) {
      console.log('[navigation] Not authenticated → redirecting to login');
      router.replace('/login');
      return;
    }

    // Authenticated but no profile yet - redirect to onboarding (new user)
    if (user && !profile && !inOnboarding) {
      console.log('[navigation] New user detected → redirecting to onboarding');
      router.replace('/(onboarding)/welcome');
      return;
    }

    // Authenticated but hasn't completed onboarding - redirect to onboarding
    if (user && profile && !profile.onboarding_completed && !inOnboarding) {
      // Determine which onboarding step to start from
      const step = profile.onboarding_step || 0;
      const routes = [
        '/(onboarding)/welcome',
        '/(onboarding)/basic-info',
        '/(onboarding)/lifestyle-intro',
        '/(onboarding)/lifestyle/drinking',
        '/(onboarding)/lifestyle/smoking',
        '/(onboarding)/lifestyle/cannabis',
        '/(onboarding)/lifestyle/religion',
        '/(onboarding)/lifestyle/politics',
        '/(onboarding)/lifestyle/kids',
        '/(onboarding)/integrations',
        '/(onboarding)/analysis',
        '/(onboarding)/personality-results',
        '/(onboarding)/photos',
        '/(onboarding)/consent',
        '/(onboarding)/complete',
      ];
      router.replace(routes[step] || '/(onboarding)/welcome');
      return;
    }

    // Authenticated and completed onboarding - redirect to main app
    // BUT: Don't redirect if user is currently in onboarding (allows re-onboarding)
    if (user && profile && profile.onboarding_completed && !inTabs && !inOnboarding) {
      console.log('[navigation] Onboarding complete → redirecting to tabs');
      router.replace('/(tabs)');
      return;
    }
  }, [user, profile, segments, isLoading, operationInProgress]);

  // Show nothing while auth is initializing to prevent flash of wrong screen
  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
