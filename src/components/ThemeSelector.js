import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_PRESETS, getAvailableThemes } from '../theme/themePresets';
import CustomThemeBuilder from './CustomThemeBuilder';

const { width } = Dimensions.get('window');

const ThemeSelector = ({ visible, onClose }) => {
  const { theme, isDark, setTheme, toggleTheme, currentThemeId, setCustomTheme } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId || 'oceanBlue');
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customThemes, setCustomThemes] = useState([]);
  
  const availableThemes = getAvailableThemes(isDark);

  useEffect(() => {
    loadCustomThemes();
  }, []);

  const loadCustomThemes = async () => {
    try {
      const savedCustomThemes = await AsyncStorage.getItem('customThemes');
      if (savedCustomThemes) {
        const themes = JSON.parse(savedCustomThemes);
        setCustomThemes(themes.filter(t => t.isDark === isDark));
      }
    } catch (error) {
      console.error('Failed to load custom themes:', error);
    }
  };

  const saveCustomTheme = async (themeData) => {
    try {
      const existingThemes = await AsyncStorage.getItem('customThemes');
      const themes = existingThemes ? JSON.parse(existingThemes) : [];
      
      // Check if theme name already exists
      const nameExists = themes.some(t => t.name.toLowerCase() === themeData.name.toLowerCase());
      if (nameExists) {
        Alert.alert('Error', 'A theme with this name already exists. Please choose a different name.');
        return;
      }
      
      const updatedThemes = [...themes, themeData];
      await AsyncStorage.setItem('customThemes', JSON.stringify(updatedThemes));
      setCustomThemes(updatedThemes.filter(t => t.isDark === isDark));
      
      // Auto-apply the new theme
      handleThemeSelect(themeData);
    } catch (error) {
      console.error('Failed to save custom theme:', error);
      Alert.alert('Error', 'Failed to save custom theme');
    }
  };

  const deleteCustomTheme = async (themeId) => {
    try {
      const existingThemes = await AsyncStorage.getItem('customThemes');
      const themes = existingThemes ? JSON.parse(existingThemes) : [];
      const updatedThemes = themes.filter(t => t.id !== themeId);
      await AsyncStorage.setItem('customThemes', JSON.stringify(updatedThemes));
      setCustomThemes(updatedThemes.filter(t => t.isDark === isDark));
      
      // If the deleted theme was selected, revert to default
      if (selectedThemeId === themeId) {
        const defaultTheme = availableThemes[0];
        handleThemeSelect(defaultTheme);
      }
    } catch (error) {
      console.error('Failed to delete custom theme:', error);
    }
  };

  const handleThemeSelect = (themeData) => {
    setSelectedThemeId(themeData.id);
    setCustomTheme(themeData.id, themeData.colors);
  };

  const handleSave = () => {
    onClose();
  };

  const handleDeleteTheme = (themeData) => {
    Alert.alert(
      'Delete Theme',
      `Are you sure you want to delete "${themeData.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCustomTheme(themeData.id),
        },
      ]
    );
  };

  const ThemePreview = ({ themeData, isSelected, isCustom = false }) => (
    <TouchableOpacity
      style={[
        styles.themeCard,
        {
          borderColor: isSelected ? theme.colors.accent : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
          backgroundColor: theme.colors.surface,
        },
      ]}
      onPress={() => handleThemeSelect(themeData)}
    >
      {/* Theme Preview Colors */}
      <View style={styles.colorPreview}>
        <View style={[styles.colorSwatch, { backgroundColor: themeData.colors.background }]} />
        <View style={[styles.colorSwatch, { backgroundColor: themeData.colors.surface }]} />
        <View style={[styles.colorSwatch, { backgroundColor: themeData.colors.accent }]} />
        <View style={[styles.colorSwatch, { backgroundColor: themeData.colors.accent2 || themeData.colors.primary }]} />
      </View>
      
      {/* Theme Info */}
      <View style={styles.themeInfo}>
        <View style={styles.themeNameRow}>
          <Text style={[styles.themeName, { color: theme.colors.textPrimary }]}>
            {themeData.name}
          </Text>
          {isCustom && (
            <TouchableOpacity
              onPress={() => handleDeleteTheme(themeData)}
              style={styles.deleteButton}
            >
              <Icon name="close" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.themeDescription, { color: theme.colors.textSecondary }]}>
          {themeData.description}
        </Text>
      </View>
      
      {/* Selection Indicator */}
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.accent }]}>
          <Icon name="check" size={16} color={theme.colors.surface} />
        </View>
      )}
    </TouchableOpacity>
  );

  const CreateThemeCard = () => (
    <TouchableOpacity
      style={[
        styles.themeCard,
        styles.createThemeCard,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
      onPress={() => setShowCustomBuilder(true)}
    >
      <View style={styles.createThemeContent}>
        <Icon name="add" size={32} color={theme.colors.accent} />
        <Text style={[styles.createThemeText, { color: theme.colors.textPrimary }]}>
          Create Custom Theme
        </Text>
        <Text style={[styles.createThemeDesc, { color: theme.colors.textSecondary }]}>
          Build your own color scheme
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Themes & Colors
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: theme.colors.accent }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* Theme Mode Toggle */}
          <View style={[styles.modeToggleContainer, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Appearance
            </Text>
            <TouchableOpacity
              style={[
                styles.modeToggle,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
              onPress={toggleTheme}
            >
              <Icon 
                name={isDark ? 'brightness-2' : 'brightness-7'} 
                size={20} 
                color={theme.colors.textPrimary} 
              />
              <Text style={[styles.modeToggleText, { color: theme.colors.textPrimary }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Icon name="toggle-on" size={24} color={theme.colors.accent} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Custom Themes Section */}
            {customThemes.length > 0 && (
              <View style={styles.themesSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                  Your Custom Themes
                </Text>
                <View style={styles.themesGrid}>
                  {customThemes.map((themeData) => (
                    <ThemePreview
                      key={themeData.id}
                      themeData={themeData}
                      isSelected={selectedThemeId === themeData.id}
                      isCustom={true}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Theme Builder */}
            <View style={styles.themesSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                Create Custom
              </Text>
              <View style={styles.themesGrid}>
                <CreateThemeCard />
              </View>
            </View>

            {/* Built-in Theme Presets */}
            <View style={styles.themesSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                {isDark ? 'Dark Themes' : 'Light Themes'} ({availableThemes.length})
              </Text>
              <View style={styles.themesGrid}>
                {availableThemes.map((themeData) => (
                  <ThemePreview
                    key={themeData.id}
                    themeData={themeData}
                    isSelected={selectedThemeId === themeData.id}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Custom Theme Builder Modal */}
      <CustomThemeBuilder
        visible={showCustomBuilder}
        onClose={() => setShowCustomBuilder(false)}
        onSave={saveCustomTheme}
      />
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
  modeToggleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  modeToggleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  themesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    borderWidth: 1,
  },
  createThemeCard: {
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  createThemeContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  createThemeText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  createThemeDesc: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  colorPreview: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  themeInfo: {
    marginBottom: 4,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  themeDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeSelector;