import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const CustomThemeBuilder = ({ visible, onClose, onSave }) => {
  const { theme } = useTheme();
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorField, setActiveColorField] = useState(null);
  
  const [customColors, setCustomColors] = useState({
    primary: '#3B82F6',
    accent: '#60A5FA', 
    accent2: '#93C5FD',
    accentLight: '#EBF4FF',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceElevated: '#F1F5F9',
    border: '#E2E8F0',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    destructive: '#EF4444',
  });

  // Predefined color palette
  const colorPalette = [
    '#3B82F6', '#1E40AF', '#60A5FA', '#93C5FD', '#DBEAFE',
    '#10B981', '#047857', '#34D399', '#6EE7B7', '#D1FAE5',
    '#F59E0B', '#D97706', '#FBBF24', '#FCD34D', '#FEF3C7',
    '#EF4444', '#DC2626', '#F87171', '#FCA5A5', '#FEE2E2',
    '#8B5CF6', '#7C3AED', '#A78BFA', '#C4B5FD', '#EDE9FE',
    '#EC4899', '#DB2777', '#F472B6', '#F9A8D4', '#FCE7F3',
    '#06B6D4', '#0891B2', '#22D3EE', '#67E8F9', '#CFFAFE',
    '#84CC16', '#65A30D', '#A3E635', '#BEF264', '#ECFCCB',
    '#F97316', '#EA580C', '#FB923C', '#FDBA74', '#FED7AA',
    '#6B7280', '#4B5563', '#9CA3AF', '#D1D5DB', '#F3F4F6',
    '#1F2937', '#111827', '#374151', '#4B5563', '#6B7280',
    '#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB',
  ];

  const colorFieldLabels = {
    primary: 'Primary Color',
    accent: 'Accent Color',
    accent2: 'Secondary Accent',
    accentLight: 'Accent Light',
    background: 'Background',
    surface: 'Surface',
    surfaceElevated: 'Elevated Surface',
    border: 'Border',
    textPrimary: 'Primary Text',
    textSecondary: 'Secondary Text',
    success: 'Success Color',
    warning: 'Warning Color',
    destructive: 'Destructive Color',
  };

  const handleColorSelect = (color) => {
    if (activeColorField) {
      setCustomColors(prev => ({
        ...prev,
        [activeColorField]: color
      }));
    }
    setShowColorPicker(false);
    setActiveColorField(null);
  };

  const openColorPicker = (fieldName) => {
    setActiveColorField(fieldName);
    setShowColorPicker(true);
  };

  const handleSave = () => {
    if (!themeName.trim()) {
      Alert.alert('Error', 'Please enter a theme name');
      return;
    }

    const customTheme = {
      id: `custom_${Date.now()}`,
      name: themeName.trim(),
      description: themeDescription.trim() || 'Custom theme',
      isCustom: true,
      isDark: isDarkTheme,
      colors: customColors,
    };

    onSave(customTheme);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setThemeName('');
    setThemeDescription('');
    setIsDarkTheme(false);
    setCustomColors({
      primary: '#3B82F6',
      accent: '#60A5FA', 
      accent2: '#93C5FD',
      accentLight: '#EBF4FF',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceElevated: '#F1F5F9',
      border: '#E2E8F0',
      textPrimary: '#1E293B',
      textSecondary: '#64748B',
      success: '#10B981',
      warning: '#F59E0B',
      destructive: '#EF4444',
    });
  };

  const loadDarkPreset = () => {
    setCustomColors({
      primary: '#3B82F6',
      accent: '#60A5FA',
      accent2: '#93C5FD',
      accentLight: '#1E3A8A',
      background: '#0F172A',
      surface: '#1E293B',
      surfaceElevated: '#334155',
      border: '#334155',
      textPrimary: '#F1F5F9',
      textSecondary: '#94A3B8',
      success: '#10B981',
      warning: '#F59E0B',
      destructive: '#EF4444',
    });
    setIsDarkTheme(true);
  };

  const loadLightPreset = () => {
    setCustomColors({
      primary: '#3B82F6',
      accent: '#60A5FA', 
      accent2: '#93C5FD',
      accentLight: '#EBF4FF',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceElevated: '#F1F5F9',
      border: '#E2E8F0',
      textPrimary: '#1E293B',
      textSecondary: '#64748B',
      success: '#10B981',
      warning: '#F59E0B',
      destructive: '#EF4444',
    });
    setIsDarkTheme(false);
  };

  const ColorField = ({ label, fieldName, color }) => (
    <TouchableOpacity
      style={[styles.colorField, { borderColor: theme.colors.border }]}
      onPress={() => openColorPicker(fieldName)}
    >
      <View style={styles.colorFieldContent}>
        <Text style={[styles.colorFieldLabel, { color: theme.colors.textPrimary }]}>
          {label}
        </Text>
        <Text style={[styles.colorFieldValue, { color: theme.colors.textSecondary }]}>
          {color}
        </Text>
      </View>
      <View style={[styles.colorPreview, { backgroundColor: color }]} />
      <Icon name="edit" size={16} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const ColorPicker = () => (
    <Modal
      visible={showColorPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowColorPicker(false)}
    >
      <View style={styles.colorPickerOverlay}>
        <View style={[styles.colorPickerModal, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.colorPickerHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.colorPickerTitle, { color: theme.colors.textPrimary }]}>
              Select Color for {activeColorField ? colorFieldLabels[activeColorField] : ''}
            </Text>
            <TouchableOpacity
              onPress={() => setShowColorPicker(false)}
              style={styles.colorPickerClose}
            >
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.colorPickerContent}>
            <View style={styles.colorGrid}>
              {colorPalette.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    activeColorField && customColors[activeColorField] === color && styles.selectedColorOption,
                  ]}
                  onPress={() => handleColorSelect(color)}
                >
                  {activeColorField && customColors[activeColorField] === color && (
                    <Icon name="check" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Icon name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Custom Theme Builder
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.headerButton, styles.saveButton, { backgroundColor: theme.colors.accent }]}
          >
            <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Theme Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Theme Information
            </Text>
            
            <View style={[styles.inputGroup, { borderColor: theme.colors.border }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Theme Name
              </Text>
              <TextInput
                style={[styles.textInput, { 
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }]}
                value={themeName}
                onChangeText={setThemeName}
                placeholder="Enter theme name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={[styles.inputGroup, { borderColor: theme.colors.border }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Description (Optional)
              </Text>
              <TextInput
                style={[styles.textInput, { 
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }]}
                value={themeDescription}
                onChangeText={setThemeDescription}
                placeholder="Enter theme description"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[styles.themeTypeToggle, { 
                backgroundColor: isDarkTheme ? theme.colors.accent + '20' : theme.colors.surface,
                borderColor: isDarkTheme ? theme.colors.accent : theme.colors.border,
              }]}
              onPress={() => setIsDarkTheme(!isDarkTheme)}
            >
              <Icon 
                name={isDarkTheme ? "brightness-2" : "brightness-7"} 
                size={24} 
                color={isDarkTheme ? theme.colors.accent : theme.colors.textSecondary} 
              />
              <Text style={[styles.themeTypeText, { 
                color: isDarkTheme ? theme.colors.accent : theme.colors.textPrimary 
              }]}>
                {isDarkTheme ? 'Dark Theme' : 'Light Theme'}
              </Text>
              {isDarkTheme && (
                <Icon name="check" size={20} color={theme.colors.accent} />
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Presets */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Quick Start
            </Text>
            <View style={styles.presetButtons}>
              <TouchableOpacity
                style={[styles.presetButton, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }]}
                onPress={loadLightPreset}
              >
                <Icon name="brightness-7" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.presetButtonText, { color: theme.colors.textPrimary }]}>
                  Light Preset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetButton, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }]}
                onPress={loadDarkPreset}
              >
                <Icon name="brightness-2" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.presetButtonText, { color: theme.colors.textPrimary }]}>
                  Dark Preset
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Color Customization */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Color Customization
            </Text>
            
            {Object.entries(colorFieldLabels).map(([fieldName, label]) => (
              <ColorField
                key={fieldName}
                label={label}
                fieldName={fieldName}
                color={customColors[fieldName]}
              />
            ))}
          </View>

          {/* Theme Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Preview
            </Text>
            <View style={[styles.themePreview, { backgroundColor: customColors.background }]}>
              <View style={[styles.previewSurface, { backgroundColor: customColors.surface }]}>
                <Text style={[styles.previewTitle, { color: customColors.textPrimary }]}>
                  Sample Todo Item
                </Text>
                <Text style={[styles.previewSubtitle, { color: customColors.textSecondary }]}>
                  This is how text will look in your theme
                </Text>
                <View style={styles.previewButtons}>
                  <View style={[styles.previewButton, { backgroundColor: customColors.accent }]}>
                    <Text style={[styles.previewButtonText, { color: '#FFFFFF' }]}>Primary</Text>
                  </View>
                  <View style={[styles.previewButton, { backgroundColor: customColors.accent2 }]}>
                    <Text style={[styles.previewButtonText, { color: '#FFFFFF' }]}>Secondary</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <ColorPicker />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  themeTypeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  themeTypeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  colorFieldContent: {
    flex: 1,
  },
  colorFieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  colorFieldValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  themePreview: {
    borderRadius: 16,
    padding: 16,
  },
  previewSurface: {
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  colorPickerModal: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  colorPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  colorPickerClose: {
    padding: 4,
  },
  colorPickerContent: {
    padding: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default CustomThemeBuilder;