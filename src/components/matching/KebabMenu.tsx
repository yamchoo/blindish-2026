/**
 * KebabMenu Component
 * Floating action menu above ProfileCard
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';

interface KebabMenuProps {
  canUndo: boolean;
  isSwipeLoading: boolean;
  isRefetching: boolean;
  hasMatches: boolean;
  onUndo: () => void;
  onPass: () => void;
  onLike: () => void;
  onRefresh: () => void;
}

export function KebabMenu({
  canUndo,
  isSwipeLoading,
  isRefetching,
  hasMatches,
  onUndo,
  onPass,
  onLike,
  onRefresh,
}: KebabMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={toggleMenu}
        activeOpacity={0.7}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={24}
          color={Colors.light.text.primary}
        />
      </TouchableOpacity>

      {/* Menu Items */}
      {menuOpen && (
        <View style={styles.menuContainer}>
          {/* Undo */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              !canUndo && styles.menuItemDisabled,
            ]}
            onPress={() => handleAction(onUndo)}
            disabled={!canUndo || isSwipeLoading}
          >
            <Ionicons
              name="arrow-undo"
              size={20}
              color={
                canUndo && !isSwipeLoading
                  ? Colors.light.text.primary
                  : Colors.light.text.tertiary
              }
            />
            <Text
              style={[
                styles.menuItemText,
                (!canUndo || isSwipeLoading) && styles.menuItemTextDisabled,
              ]}
            >
              Undo
            </Text>
          </TouchableOpacity>

          {/* Pass */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              (!hasMatches || isSwipeLoading) && styles.menuItemDisabled,
            ]}
            onPress={() => handleAction(onPass)}
            disabled={!hasMatches || isSwipeLoading}
          >
            <Ionicons
              name="close"
              size={20}
              color={
                hasMatches && !isSwipeLoading
                  ? Colors.light.error
                  : Colors.light.text.tertiary
              }
            />
            <Text
              style={[
                styles.menuItemText,
                (!hasMatches || isSwipeLoading) && styles.menuItemTextDisabled,
              ]}
            >
              Pass
            </Text>
          </TouchableOpacity>

          {/* Like */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              (!hasMatches || isSwipeLoading) && styles.menuItemDisabled,
            ]}
            onPress={() => handleAction(onLike)}
            disabled={!hasMatches || isSwipeLoading}
          >
            <Ionicons
              name="heart"
              size={20}
              color={
                hasMatches && !isSwipeLoading
                  ? Colors.coral
                  : Colors.light.text.tertiary
              }
            />
            <Text
              style={[
                styles.menuItemText,
                (!hasMatches || isSwipeLoading) && styles.menuItemTextDisabled,
              ]}
            >
              Like
            </Text>
          </TouchableOpacity>

          {/* Refresh */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              styles.menuItemLast,
              isRefetching && styles.menuItemDisabled,
            ]}
            onPress={() => handleAction(onRefresh)}
            disabled={isRefetching}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={
                !isRefetching
                  ? Colors.light.text.primary
                  : Colors.light.text.tertiary
              }
            />
            <Text
              style={[
                styles.menuItemText,
                isRefetching && styles.menuItemTextDisabled,
              ]}
            >
              Refresh
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuContainer: {
    position: 'absolute',
    top: 55,
    right: 0,
    minWidth: 150,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: Typography.sizes.base,
    color: Colors.light.text.primary,
    fontFamily: Typography.fonts.sans,
    fontWeight: Typography.weights.medium,
  },
  menuItemTextDisabled: {
    color: Colors.light.text.tertiary,
  },
});
