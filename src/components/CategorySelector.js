import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

// Predefined categories with colors and emojis
export const DEFAULT_CATEGORIES = {
  work: {
    id: 'work',
    name: 'Work',
    color: '#3B82F6', // Blue
    emoji: '💼',
    isCustom: false,
  },
  personal: {
    id: 'personal',
    name: 'Personal',
    color: '#10B981', // Green
    emoji: '🏠',
    isCustom: false,
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    color: '#F59E0B', // Orange
    emoji: '🛒',
    isCustom: false,
  },
  health: {
    id: 'health',
    name: 'Health',
    color: '#EF4444', // Red
    emoji: '❤️',
    isCustom: false,
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    color: '#8B5CF6', // Purple
    emoji: '💰',
    isCustom: false,
  },
  education: {
    id: 'education',
    name: 'Education',
    color: '#06B6D4', // Cyan
    emoji: '📚',
    isCustom: false,
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    color: '#84CC16', // Lime
    emoji: '✈️',
    isCustom: false,
  },
  other: {
    id: 'other',
    name: 'Other',
    color: '#6B7280', // Gray
    emoji: '📝',
    isCustom: false,
  },
};

// Available colors for custom categories
const CATEGORY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#6B7280', '#EC4899', '#F97316',
  '#14B8A6', '#8B5A2B', '#DC2626', '#7C3AED', '#059669'
];

// Available emojis for custom categories
const CATEGORY_EMOJIS = [
  '📝', '⭐', '🎯', '🚀', '💡', '🔥', '⚡', '🏆', '💪', '🎨', 
  '🎵', '🎮', '📱', '💻', '🏠', '🚗', '🍕', '☕', '🌟', '⚽',
  '🌍', '🎭', '📊', '🔧', '🎪', '🎬', '📷', '🎤', '🏋️', '🧘',
  '🌱', '🔬', '💊', '🩺', '🎓', '📖', '✍️', '🗂️', '📅', '⏰',
  '💝', '🎁', '🛍️', '💳', '📈', '💎', '🏪', '🎊', '🎂', '🍎'
];

let CATEGORIES = { ...DEFAULT_CATEGORIES };

// CategoryBadge component for displaying category
export const CategoryBadge = ({ category, size = 'medium', showText = true }) => {
  if (!category || !CATEGORIES[category]) return null;

  const categoryData = CATEGORIES[category];
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.categoryBadge,
        { backgroundColor: `${categoryData.color}15` },
        { borderColor: categoryData.color },
        isSmall && styles.categoryBadgeSmall,
      ]}
    >
      <Text style={[styles.categoryEmoji, isSmall && styles.categoryEmojiSmall]}>
        {categoryData.emoji}
      </Text>
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customCategories, setCustomCategories] = useState({});
  
  // Create category form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);
  const [newCategoryEmoji, setNewCategoryEmoji] = useState(CATEGORY_EMOJIS[0]);

  // Load custom categories on component mount
  useEffect(() => {
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const saved = await AsyncStorage.getItem('customCategories');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomCategories(parsed);
        CATEGORIES = { ...DEFAULT_CATEGORIES, ...parsed };
      }
    } catch (error) {
      console.error('Error loading custom categories:', error);
    }
  };

  const saveCustomCategories = async (newCustomCategories) => {
    try {
      await AsyncStorage.setItem('customCategories', JSON.stringify(newCustomCategories));
      setCustomCategories(newCustomCategories);
      CATEGORIES = { ...DEFAULT_CATEGORIES, ...newCustomCategories };
    } catch (error) {
      console.error('Error saving custom categories:', error);
    }
  };

  const createCustomCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const categoryId = newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (CATEGORIES[categoryId]) {
      Alert.alert('Error', 'A category with this name already exists');
      return;
    }

    const newCategory = {
      id: categoryId,
      name: newCategoryName,
      color: newCategoryColor,
      emoji: newCategoryEmoji,
      isCustom: true,
    };

    const updatedCustomCategories = {
      ...customCategories,
      [categoryId]: newCategory,
    };

    saveCustomCategories(updatedCustomCategories);
    
    // Reset form
    setNewCategoryName('');
    setNewCategoryColor(CATEGORY_COLORS[0]);
    setNewCategoryEmoji(CATEGORY_EMOJIS[0]);
    setShowCreateForm(false);
  };

  const deleteCustomCategory = (categoryId) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete the "${CATEGORIES[categoryId]?.name}" category?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedCustomCategories = { ...customCategories };
            delete updatedCustomCategories[categoryId];
            saveCustomCategories(updatedCustomCategories);
            
            // If this was the selected category, clear selection
            if (selectedCategory === categoryId) {
              onSelectCategory(null);
            }
          },
        },
      ]
    );
  };

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
              {/* Add Category Button */}
              <TouchableOpacity
                style={[
                  styles.addCategoryOption,
                  { backgroundColor: theme.colors.accent + '15', borderColor: theme.colors.accent }
                ]}
                onPress={() => setShowCreateForm(!showCreateForm)}
              >
                <Icon name="add" size={24} color={theme.colors.accent} />
                <Text style={[styles.addCategoryText, { color: theme.colors.accent }]}>
                  Add Custom Category
                </Text>
              </TouchableOpacity>

              {/* Create Category Form */}
              {showCreateForm && (
                <View style={[styles.createForm, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Text style={[styles.createFormTitle, { color: theme.colors.textPrimary }]}>
                    Create New Category
                  </Text>
                  
                  <TextInput
                    style={[styles.nameInput, { 
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.textPrimary
                    }]}
                    placeholder="Category name"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                  />

                  <View style={styles.formRow}>
                    <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>Color:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
                      {CATEGORY_COLORS.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            newCategoryColor === color && styles.selectedColorOption
                          ]}
                          onPress={() => setNewCategoryColor(color)}
                        />
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.formRow}>
                    <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>Emoji:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiPicker}>
                      {CATEGORY_EMOJIS.map((emoji) => (
                        <TouchableOpacity
                          key={emoji}
                          style={[
                            styles.emojiOption,
                            newCategoryEmoji === emoji && [styles.selectedEmojiOption, { backgroundColor: theme.colors.accent + '20' }]
                          ]}
                          onPress={() => setNewCategoryEmoji(emoji)}
                        >
                          <Text style={styles.emojiText}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={[styles.formButton, styles.cancelButton, { backgroundColor: theme.colors.surface }]}
                      onPress={() => setShowCreateForm(false)}
                    >
                      <Text style={[styles.formButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.formButton, styles.createButton, { backgroundColor: theme.colors.accent }]}
                      onPress={createCustomCategory}
                    >
                      <Text style={[styles.formButtonText, { color: '#FFFFFF' }]}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

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
                <View key={category.id}>
                  <TouchableOpacity
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
                    <View style={styles.categoryActions}>
                      {category.isCustom && (
                        <TouchableOpacity
                          onPress={() => deleteCustomCategory(category.id)}
                          style={[styles.deleteButton, { backgroundColor: `${theme.colors.destructive}20` }]}
                        >
                          <Icon name="delete" size={16} color={theme.colors.destructive} />
                        </TouchableOpacity>
                      )}
                      {selectedCategory === category.id && (
                        <Icon name="check" size={20} color={category.color} />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
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
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

  // Add Category Styles
  addCategoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
  },
  addCategoryText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Create Form Styles
  createForm: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  createFormTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  formRow: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorPicker: {
    flexDirection: 'row',
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emojiPicker: {
    flexDirection: 'row',
  },
  emojiOption: {
    padding: 8,
    marginRight: 4,
    borderRadius: 8,
  },
  selectedEmojiOption: {
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 20,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    // styles defined inline
  },
  createButton: {
    // styles defined inline
  },
  formButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
  },
});

export default CategorySelector;
export { CATEGORIES };