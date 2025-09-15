import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

// Predefined categories with colors and icons
export const CATEGORIES = {
  work: {
    id: 'work',
    name: 'Work',
    color: '#3B82F6', // Blue
    icon: 'work',
    emoji: '💼',
  },
  personal: {
    id: 'personal',
    name: 'Personal',
    color: '#10B981', // Green
    icon: 'person',
    emoji: '🏠',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    color: '#F59E0B', // Orange
    icon: 'shopping-cart',
    emoji: '🛒',
  },
  health: {
    id: 'health',
    name: 'Health',
    color: '#EF4444', // Red
    icon: 'favorite',
    emoji: '❤️',
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    color: '#8B5CF6', // Purple
    icon: 'account-balance-wallet',
    emoji: '💰',
  },
  education: {
    id: 'education',
    name: 'Education',
    color: '#06B6D4', // Cyan
    icon: 'school',
    emoji: '📚',
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    color: '#84CC16', // Lime
    icon: 'flight',
    emoji: '✈️',
  },
  other: {
    id: 'other',
    name: 'Other',
    color: '#6B7280', // Gray
    icon: 'category',
    emoji: '📝',
  },
};

// CategoryBadge component for displaying category
export const CategoryBadge = ({ category, size = 'medium', showIcon = true, showText = true }) => {
  if (!category || !CATEGORIES[category]) return null;

  const categoryData = CATEGORIES[category];
  const isSmall = size === 'small';
  const isMedium = size === 'medium';

  return (
    <View
      style={[
        styles.categoryBadge,
        { backgroundColor: `${categoryData.color}15` },
        { borderColor: categoryData.color },
        isSmall && styles.categoryBadgeSmall,
      ]}
    >
      {showIcon && (
        <Text style={[styles.categoryEmoji, isSmall && styles.categoryEmojiSmall]}>
          {categoryData.emoji}
        </Text>
      )}
      {showText && (
        <Text
          style={[
            styles.categoryText,
            { color: categoryData.color },
            isSmall && styles.categoryTextSmall,
          ]}
        >
          {categoryData.name}
        </Text>
      )}
    </View>
  );
};

// CategorySelector component for choosing category
const CategorySelector = ({ selectedCategory, onSelectCategory, placeholder = "Select Category" }) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectCategory = (categoryId) => {
    onSelectCategory(categoryId);
    setModalVisible(false);
  };

  const selectedCategoryData = selectedCategory ? CATEGORIES[selectedCategory] : null;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: selectedCategoryData?.color || theme.colors.border,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          {selectedCategoryData ? (
            <>
              <Text style={styles.selectedEmoji}>{selectedCategoryData.emoji}</Text>
              <Text
                style={[
                  styles.selectedText,
                  { color: selectedCategoryData.color },
                ]}
              >
                {selectedCategoryData.name}
              </Text>
            </>
          ) : (
            <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
              {placeholder}
            </Text>
          )}
        </View>
        <Icon name="keyboard-arrow-down" size={24} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Select Category
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoriesContainer}>
              {/* None option */}
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  { backgroundColor: theme.colors.background },
                  !selectedCategory && [styles.selectedOption, { borderColor: theme.colors.accent }],
                ]}
                onPress={() => handleSelectCategory(null)}
              >
                <View style={styles.categoryOptionContent}>
                  <Text style={styles.noneEmoji}>⚪</Text>
                  <Text style={[styles.categoryOptionText, { color: theme.colors.textPrimary }]}>
                    No Category
                  </Text>
                </View>
                {!selectedCategory && (
                  <Icon name="check" size={20} color={theme.colors.accent} />
                )}
              </TouchableOpacity>

              {/* Category options */}
              {Object.values(CATEGORIES).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    { backgroundColor: `${category.color}08` },
                    selectedCategory === category.id && [
                      styles.selectedOption,
                      { borderColor: category.color },
                    ],
                  ]}
                  onPress={() => handleSelectCategory(category.id)}
                >
                  <View style={styles.categoryOptionContent}>
                    <Text style={styles.categoryOptionEmoji}>{category.emoji}</Text>
                    <Text
                      style={[
                        styles.categoryOptionText,
                        { color: category.color },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </View>
                  {selectedCategory === category.id && (
                    <Icon name="check" size={20} color={category.color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Category Badge Styles
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  categoryBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryEmojiSmall: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextSmall: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Selector Styles
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedEmoji: {
    fontSize: 16,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: screenWidth - 40,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderWidth: 2,
  },
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryOptionEmoji: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  noneEmoji: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CategorySelector;