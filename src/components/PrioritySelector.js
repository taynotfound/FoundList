import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', emoji: '🔴', color: '#FF4444' },
  { value: 'medium', label: 'Medium', emoji: '🟡', color: '#FFB84D' },
  { value: 'low', label: 'Low', emoji: '🟢', color: '#4CAF50' },
];

const PrioritySelector = ({ 
  selectedPriority = 'medium', 
  onPriorityChange, 
  style,
  showLabel = true,
  size = 'normal' // 'normal', 'small', 'large'
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    small: { fontSize: 12, padding: 6, emojiSize: 14 },
    normal: { fontSize: 14, padding: 8, emojiSize: 16 },
    large: { fontSize: 16, padding: 12, emojiSize: 20 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.textPrimary, fontSize: currentSize.fontSize }]}>
          Priority
        </Text>
      )}
      <View style={styles.optionsContainer}>
        {PRIORITY_OPTIONS.map((option) => {
          const isSelected = selectedPriority === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                  padding: currentSize.padding,
                },
              ]}
              onPress={() => onPriorityChange(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.emoji, { fontSize: currentSize.emojiSize }]}>
                {option.emoji}
              </Text>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                    fontSize: currentSize.fontSize,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Badge component for displaying priority in todo items
export const PriorityBadge = ({ priority, size = 'small' }) => {
  const { theme } = useTheme();
  
  const priorityData = PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
  
  const sizeStyles = {
    small: { fontSize: 10, padding: 4, borderRadius: 8 },
    normal: { fontSize: 12, padding: 6, borderRadius: 10 },
    large: { fontSize: 14, padding: 8, borderRadius: 12 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: priorityData.color + '20', // 20% opacity
          borderColor: priorityData.color,
          padding: currentSize.padding,
          borderRadius: currentSize.borderRadius,
        },
      ]}
    >
      <Text style={[styles.badgeEmoji, { fontSize: currentSize.fontSize }]}>
        {priorityData.emoji}
      </Text>
      <Text
        style={[
          styles.badgeText,
          {
            color: priorityData.color,
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {priorityData.label}
      </Text>
    </View>
  );
};

// Simple priority icon for compact display
export const PriorityIcon = ({ priority, size = 16 }) => {
  const priorityData = PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
  
  return (
    <Text style={{ fontSize: size, lineHeight: size }}>
      {priorityData.emoji}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    gap: 6,
  },
  emoji: {
    lineHeight: 16,
  },
  optionText: {
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeEmoji: {
    lineHeight: 12,
  },
  badgeText: {
    fontWeight: '600',
  },
});

export default PrioritySelector;