/**
 * Input Component
 * Reusable text input with label, error, and various states
 * Enhanced with success state, clear button, and character counter
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
  required?: boolean;
  // Enhanced props
  success?: boolean;           // Success state (green border + checkmark)
  successMessage?: string;     // Success message below input
  characterLimit?: number;     // Show character count
  clearable?: boolean;         // Show clear (X) button
  autoFocus?: boolean;         // Auto-focus on mount
  returnKeyType?: 'done' | 'next';  // Keyboard return key
  onSubmitEditing?: () => void;     // On return key press
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  disabled = false,
  required = false,
  success = false,
  successMessage,
  characterLimit,
  clearable = false,
  autoFocus = false,
  returnKeyType = 'done',
  onSubmitEditing,
  value,
  onChangeText,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const borderAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    // Animate border on focus
    Animated.timing(borderAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const hasError = !!error;
  const currentValue = value !== undefined ? value : internalValue;

  const handleChangeText = (text: string) => {
    if (characterLimit && text.length > characterLimit) {
      return; // Don't allow input beyond limit
    }
    if (value === undefined) {
      setInternalValue(text);
    }
    if (onChangeText) {
      onChangeText(text);
    }
  };

  const handleClear = () => {
    handleChangeText('');
  };

  const getInputContainerStyle = (): ViewStyle => {
    let borderColor = Colors.light.border;

    if (hasError) {
      borderColor = Colors.light.error;
    } else if (success) {
      borderColor = '#10B981'; // Green for success
    } else if (isFocused) {
      borderColor = Colors.interactive.primary;
    } else if (disabled) {
      borderColor = Colors.light.border;
    }

    return {
      ...styles.inputContainer,
      borderColor,
      backgroundColor: disabled ? Colors.light.surface : Colors.light.background,
    };
  };

  const showClearButton = clearable && currentValue && currentValue.length > 0 && !disabled;
  const showSuccessIcon = success && !hasError;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {characterLimit && (
            <Text style={styles.characterCount}>
              {currentValue.length}/{characterLimit}
            </Text>
          )}
        </View>
      )}

      <View style={getInputContainerStyle()}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle, { fontSize: 18 }]} // Increased to 18px
          placeholderTextColor={Colors.light.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          value={currentValue}
          onChangeText={handleChangeText}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          {...textInputProps}
        />

        {showClearButton && (
          <TouchableOpacity onPress={handleClear} style={styles.rightIcon}>
            <Ionicons name="close-circle" size={20} color={Colors.light.text.tertiary} />
          </TouchableOpacity>
        )}

        {showSuccessIcon && !showClearButton && (
          <View style={styles.rightIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
        )}

        {rightIcon && !showClearButton && !showSuccessIcon && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {(error || hint || (success && successMessage)) && (
        <View style={styles.messageContainer}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : success && successMessage ? (
            <Text style={styles.success}>{successMessage}</Text>
          ) : hint ? (
            <Text style={styles.hint}>{hint}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.sans,
    fontWeight: Typography.weights.semibold, // Increased from medium
    color: Colors.light.text.primary,
  },
  required: {
    color: Colors.light.error,
  },
  characterCount: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.sans,
    color: Colors.light.text.tertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16, // Increased from 12px
    paddingHorizontal: Spacing.md,
    minHeight: 56, // Increased from 48px
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.sans,
    fontWeight: Typography.weights.normal,
    color: Colors.light.text.primary,
    paddingVertical: Spacing.md, // Increased from sm
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  messageContainer: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  error: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.sans,
    color: Colors.light.error,
  },
  hint: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.sans,
    color: Colors.light.text.secondary,
  },
  success: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.sans,
    color: '#10B981', // Green
  },
});
