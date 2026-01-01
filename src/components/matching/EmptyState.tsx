/**
 * EmptyState Component
 * Displays when there are no more matches
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/lib/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function EmptyState({ onRefresh, isRefreshing = false }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="heart-outline" size={64} color={Colors.coral} />
      </View>

      <Text style={styles.title}>No More Matches</Text>
      <Text style={styles.subtitle}>
        Check back later for new potential matches, or expand your preferences.
      </Text>

      {onRefresh && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={isRefreshing}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={Colors.light.text.inverse}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: Colors.light.background,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.coral,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: Colors.light.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
