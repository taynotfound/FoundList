import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';

const SORT_OPTIONS = [
  { 
    value: 'smart', 
    label: 'Smart Sort', 
    subtitle: 'Priority + Due Date',
    icon: 'auto-awesome' 
  },
  { 
    value: 'priority', 
    label: 'Priority', 
    subtitle: 'High to Low',
    icon: 'priority-high' 
  },
  { 
    value: 'dueDate', 
    label: 'Due Date', 
    subtitle: 'Earliest First',
    icon: 'schedule' 
  },
  { 
    value: 'createdAt', 
    label: 'Created Date', 
    subtitle: 'Newest First',
    icon: 'access-time' 
  },
  { 
    value: 'alphabetical', 
    label: 'Alphabetical', 
    subtitle: 'A to Z',
    icon: 'sort-by-alpha' 
  },
];

const SortMenu = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { sortBy, setSortBy } = useTodos();

  const handleSortSelect = (sortValue) => {
    setSortBy(sortValue);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Sort Options
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort Options */}
        <View style={styles.content}>
          {SORT_OPTIONS.map((option) => {
            const isSelected = sortBy === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSortSelect(option.value)}
                style={[
                  styles.option,
                  { 
                    backgroundColor: isSelected ? theme.colors.accent + '20' : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                  }
                ]}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <View 
                      style={[
                        styles.iconContainer,
                        { backgroundColor: isSelected ? theme.colors.accent : theme.colors.background }
                      ]}
                    >
                      <Icon 
                        name={option.icon} 
                        size={20} 
                        color={isSelected ? '#FFFFFF' : theme.colors.accent} 
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text 
                        style={[
                          styles.optionLabel, 
                          { color: theme.colors.textPrimary }
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text 
                        style={[
                          styles.optionSubtitle, 
                          { color: theme.colors.textSecondary }
                        ]}
                      >
                        {option.subtitle}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Icon 
                      name="check" 
                      size={20} 
                      color={theme.colors.accent} 
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info */}
        <View style={styles.footer}>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            💡 Smart Sort organizes by priority first, then due date for optimal task management
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Sort button component for triggering the menu
export const SortButton = ({ style }) => {
  const { theme } = useTheme();
  const { sortBy } = useTodos();
  const [showSortMenu, setShowSortMenu] = useState(false);

  const currentSort = SORT_OPTIONS.find(option => option.value === sortBy) || SORT_OPTIONS[0];

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowSortMenu(true)}
        style={[
          styles.sortButton,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          style
        ]}
      >
        <Icon name={currentSort.icon} size={16} color={theme.colors.accent} />
        <Text style={[styles.sortButtonText, { color: theme.colors.textPrimary }]}>
          {currentSort.label}
        </Text>
        <Icon name="expand-more" size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <SortMenu 
        visible={showSortMenu} 
        onClose={() => setShowSortMenu(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  option: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SortMenu;