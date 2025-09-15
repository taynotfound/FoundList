import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import { accentColors } from '../theme/colors';
import AboutScreen from './AboutScreen';

const SettingsScreen = () => {
  const { theme, accentColor, themeMode, updateAccentColor, updateThemeMode } = useTheme();
  const { todos, completedTodos, clearCompletedTodos, deleteTodo } = useTodos();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const colorOptions = Object.entries(accentColors).map(([name, color]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    color,
    key: name,
  }));

  const handleColorSelect = (color) => {
    updateAccentColor(color);
    setShowColorPicker(false);
  };

  const handleClearAllData = () => {
    const totalTodos = todos.length + completedTodos.length;
    
    if (totalTodos === 0) {
      Alert.alert('No Data', 'There are no todos to clear.');
      return;
    }

    Alert.alert(
      'Clear All Data',
      `Are you sure you want to delete all ${totalTodos} todos? This will permanently remove all current and completed todos. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCompletedTodos();
              // Clear current todos by deleting them one by one
              for (const todo of todos) {
                await deleteTodo(todo.id);
              }
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear all data.');
            }
          },
        },
      ]
    );
  };

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/taynotfound/FoundList');
  };

  const handleOpenAbout = () => {
    setShowAbout(true);
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, danger = false }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
          <Icon
            name={icon}
            size={20}
            color={danger ? theme.colors.destructive : theme.colors.accent}
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (
        onPress && (
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        )
      )}
    </TouchableOpacity>
  );

  const ColorPicker = () => (
    <View style={[styles.colorPicker, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.colorPickerTitle, { color: theme.colors.textPrimary }]}>
        Choose Accent Color
      </Text>
      <View style={styles.colorGrid}>
        {colorOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.colorOption,
              { backgroundColor: option.color },
              accentColor === option.color && styles.selectedColor,
            ]}
            onPress={() => handleColorSelect(option.color)}
          >
            {accentColor === option.color && (
              <Icon name="check" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.colorPickerCancel, { borderTopColor: theme.colors.border }]}
        onPress={() => setShowColorPicker(false)}
      >
        <Text style={[styles.colorPickerCancelText, { color: theme.colors.textSecondary }]}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ThemePicker = () => {
    const themeOptions = [
      { key: 'light', label: 'Light', icon: 'brightness-7', description: 'Light theme' },
      { key: 'dark', label: 'Dark', icon: 'brightness-2', description: 'Dark theme' },
      { key: 'auto', label: 'Auto', icon: 'brightness-auto', description: 'Follow system' },
    ];

    return (
      <View style={[styles.colorPicker, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.colorPickerTitle, { color: theme.colors.textPrimary }]}>
          Choose Theme
        </Text>
        <View style={styles.themeOptions}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.themeOption,
                { 
                  backgroundColor: themeMode === option.key ? theme.colors.accent + '20' : 'transparent',
                  borderColor: themeMode === option.key ? theme.colors.accent : theme.colors.border,
                },
              ]}
              onPress={() => {
                updateThemeMode(option.key);
                setShowThemePicker(false);
              }}
            >
              <Icon 
                name={option.icon} 
                size={24} 
                color={themeMode === option.key ? theme.colors.accent : theme.colors.textSecondary} 
              />
              <View style={styles.themeOptionText}>
                <Text style={[
                  styles.themeOptionLabel, 
                  { color: themeMode === option.key ? theme.colors.accent : theme.colors.textPrimary }
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.themeOptionDesc, 
                  { color: theme.colors.textSecondary }
                ]}>
                  {option.description}
                </Text>
              </View>
              {themeMode === option.key && (
                <Icon name="check" size={20} color={theme.colors.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.colorPickerCancel, { borderTopColor: theme.colors.border }]}
          onPress={() => setShowThemePicker(false)}
        >
          <Text style={[styles.colorPickerCancelText, { color: theme.colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getCurrentColorName = () => {
    const colorEntry = Object.entries(accentColors).find(([, color]) => color === accentColor);
    return colorEntry ? colorEntry[0].charAt(0).toUpperCase() + colorEntry[0].slice(1) : 'Custom';
  };

  const getCurrentThemeModeName = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
      default:
        return 'Auto';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={true}
        indicatorStyle={theme.isDark ? 'white' : 'black'}
        scrollIndicatorInsets={{ right: 2 }}
      >
        {/* App Info */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.appInfo}>
            <View style={[styles.appIcon, { backgroundColor: theme.colors.accent }]}>
              <Icon name="check-circle" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.appDetails}>
              <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>
                FoundList
              </Text>
              <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
                Version 1.0.0
              </Text>
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            APPEARANCE
          </Text>
          <SettingItem
            icon="brightness-6"
            title="Theme"
            subtitle={getCurrentThemeModeName()}
            onPress={() => setShowThemePicker(true)}
            rightElement={
              <Icon 
                name={themeMode === 'auto' ? 'brightness-auto' : themeMode === 'light' ? 'brightness-7' : 'brightness-2'} 
                size={20} 
                color={theme.colors.accent} 
              />
            }
          />
          <SettingItem
            icon="palette"
            title="Accent Color"
            subtitle={getCurrentColorName()}
            onPress={() => setShowColorPicker(true)}
            rightElement={
              <View style={[styles.colorPreview, { backgroundColor: accentColor }]} />
            }
          />
        </View>

        {/* Statistics */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            STATISTICS
          </Text>
          <SettingItem
            icon="assignment"
            title="Current Todos"
            subtitle={`${todos.length} active ${todos.length === 1 ? 'todo' : 'todos'}`}
          />
          <SettingItem
            icon="history"
            title="Completed Todos"
            subtitle={`${completedTodos.length} completed ${completedTodos.length === 1 ? 'todo' : 'todos'}`}
          />
          <SettingItem
            icon="bar-chart"
            title="Total Todos"
            subtitle={`${todos.length + completedTodos.length} ${todos.length + completedTodos.length === 1 ? 'todo' : 'todos'} created`}
          />
        </View>

        {/* Data Management */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            DATA MANAGEMENT
          </Text>
          <SettingItem
            icon="delete-sweep"
            title="Clear All Data"
            subtitle="Permanently delete all todos"
            onPress={handleClearAllData}
            danger={true}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            ABOUT
          </Text>
          <SettingItem
            icon="code"
            title="Source Code"
            subtitle="View on GitHub"
            onPress={handleOpenGitHub}
          />
          <SettingItem
            icon="info"
            title="About FoundList"
            subtitle="A beautiful and modern todo app"
            onPress={handleOpenAbout}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Made with ❤️ by taynotfound
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            Built with React Native & Expo
          </Text>
        </View>
      </ScrollView>

      {/* Color Picker Overlay */}
      {showColorPicker && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={() => setShowColorPicker(false)}
          />
          <ColorPicker />
        </View>
      )}

      {/* Theme Picker Overlay */}
      {showThemePicker && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={() => setShowThemePicker(false)}
          />
          <ThemePicker />
        </View>
      )}

      {/* About Modal */}
      <Modal
        visible={showAbout}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAbout(false)}
      >
        <AboutScreen navigation={{ goBack: () => setShowAbout(false) }} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
    marginBottom: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorPicker: {
    margin: 16,
    borderRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    transform: [{ scale: 1.1 }],
  },
  colorPickerCancel: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingBottom: 16,
  },
  colorPickerCancelText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  themeOptions: {
    gap: 8,
    marginBottom: 24,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  themeOptionText: {
    flex: 1,
    marginLeft: 16,
  },
  themeOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeOptionDesc: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SettingsScreen;