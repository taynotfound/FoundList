import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

// Available Material Icons for categories
const CATEGORY_ICONS = [
  // Work & Business
  'work', 'business-center', 'laptop', 'assignment', 'folder', 'description',
  'schedule', 'event', 'today', 'calendar-today', 'access-time', 'timer',
  
  // Personal & Life
  'home', 'family-restroom', 'child-care', 'pets', 'favorite', 'mood',
  'local-dining', 'local-grocery-store', 'shopping-cart', 'local-pharmacy',
  
  // Health & Fitness
  'fitness-center', 'sports', 'directions-run', 'pool', 'spa', 'healing',
  'medical-services', 'local-hospital', 'monitor-heart', 'psychology',
  
  // Education & Learning
  'school', 'book', 'library-books', 'class', 'quiz', 'science',
  'calculate', 'functions', 'language', 'translate',
  
  // Entertainment & Hobbies
  'movie', 'music-note', 'games', 'sports-esports', 'photo-camera', 'brush',
  'palette', 'theater-comedy', 'local-movies', 'headphones',
  
  // Travel & Transportation
  'flight', 'directions-car', 'train', 'directions-bike', 'map', 'luggage',
  'hotel', 'restaurant', 'local-cafe', 'explore',
  
  // Technology & Digital
  'computer', 'phone', 'smartphone', 'tablet', 'wifi', 'cloud',
  'code', 'developer-mode', 'storage', 'security',
  
  // Finance & Money
  'attach-money', 'account-balance', 'credit-card', 'payment', 'savings',
  'trending-up', 'pie-chart', 'receipt', 'local-atm', 'euro',
  
  // Social & Communication
  'people', 'group', 'person', 'chat', 'email', 'phone',
  'video-call', 'forum', 'thumb-up', 'share',
  
  // Utilities & Tools
  'build', 'settings', 'power', 'flash-on', 'hardware', 'construction',
  'handyman', 'plumbing', 'electrical-services', 'cleaning-services',
  
  // Nature & Environment
  'park', 'nature', 'eco', 'energy-savings-leaf', 'local-florist', 'agriculture',
  'wb-sunny', 'cloud', 'water-drop', 'recycling',
  
  // Food & Cooking
  'restaurant-menu', 'kitchen', 'local-pizza', 'cake', 'coffee', 'wine-bar',
  'lunch-dining', 'dinner-dining', 'breakfast-dining', 'ramen-dining',
  
  // General & Miscellaneous
  'star', 'bookmark', 'label', 'local-offer', 'new-releases', 'priority-high',
  'flag', 'location-on', 'push-pin', 'place', 'room', 'near-me',
];

const IconPicker = ({ visible, onClose, onIconSelect, currentIcon }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(currentIcon || '');

  // Filter icons based on search query
  const filteredIcons = CATEGORY_ICONS.filter(icon =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
  };

  const handleSave = () => {
    if (selectedIcon && onIconSelect) {
      onIconSelect(selectedIcon);
    }
    onClose();
  };

  const handleCancel = () => {
    setSelectedIcon(currentIcon || '');
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Choose Icon
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: theme.colors.accent }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { borderBottomColor: theme.colors.border }]}>
            <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                placeholder="Search icons..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="clear" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Selected Icon Preview */}
          {selectedIcon && (
            <View style={[styles.previewContainer, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                Selected Icon:
              </Text>
              <View style={[styles.previewIcon, { backgroundColor: theme.colors.accent }]}>
                <Icon name={selectedIcon} size={24} color={theme.colors.surface} />
              </View>
              <Text style={[styles.previewName, { color: theme.colors.textPrimary }]}>
                {selectedIcon}
              </Text>
            </View>
          )}

          {/* Icons Grid */}
          <ScrollView 
            style={styles.iconsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.iconsContent}
          >
            <View style={styles.iconsGrid}>
              {filteredIcons.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconItem,
                    {
                      backgroundColor: selectedIcon === iconName 
                        ? theme.colors.accent + '20' 
                        : theme.colors.surface,
                      borderColor: selectedIcon === iconName 
                        ? theme.colors.accent 
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleIconSelect(iconName)}
                >
                  <Icon 
                    name={iconName} 
                    size={24} 
                    color={selectedIcon === iconName 
                      ? theme.colors.accent 
                      : theme.colors.textPrimary
                    } 
                  />
                  <Text
                    style={[
                      styles.iconName,
                      {
                        color: selectedIcon === iconName 
                          ? theme.colors.accent 
                          : theme.colors.textSecondary,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {iconName.replace(/-/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredIcons.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                  No icons found
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                  Try searching with different keywords
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Instructions */}
          <View style={[styles.instructionsContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
              Choose an icon to represent your category. You can search by name or browse the collection.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  iconsContainer: {
    flex: 1,
  },
  iconsContent: {
    padding: 20,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  iconItem: {
    width: '22%', // 4 columns with gaps
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
  },
  iconName: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  instructionsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default IconPicker;