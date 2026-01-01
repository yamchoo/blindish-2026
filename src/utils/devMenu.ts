/**
 * Dev Menu Utilities
 * Register custom development menu items
 */

import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

// Only register dev menu items in development mode
if (__DEV__) {
  // Dynamically import expo-dev-menu to avoid issues in production
  import('expo-dev-menu').then((DevMenu) => {
    DevMenu.registerDevMenuItems([
      {
        name: 'Delete My Account',
        callback: async () => {
          Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all data. This action cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const { data: { user } } = await supabase.auth.getUser();

                    if (!user) {
                      Alert.alert('Error', 'No user logged in');
                      return;
                    }

                    console.log('Deleting account for user:', user.id);

                    // Delete profile (cascades to personality_profiles via FK)
                    const { error: deleteError } = await supabase
                      .from('profiles')
                      .delete()
                      .eq('id', user.id);

                    if (deleteError) {
                      console.error('Delete profile error:', deleteError);
                      Alert.alert('Error', `Failed to delete profile: ${deleteError.message}`);
                      return;
                    }

                    // Sign out
                    const { error: signOutError } = await supabase.auth.signOut();

                    if (signOutError) {
                      console.error('Sign out error:', signOutError);
                      Alert.alert('Error', `Failed to sign out: ${signOutError.message}`);
                      return;
                    }

                    console.log('Account deleted successfully');
                    Alert.alert('Success', 'Account deleted. You can now test onboarding again.');
                  } catch (error) {
                    console.error('Delete account error:', error);
                    Alert.alert('Error', 'Failed to delete account');
                  }
                },
              },
            ]
          );
        },
      },
    ]);
  }).catch((error) => {
    console.warn('Failed to register dev menu items:', error);
  });
}
