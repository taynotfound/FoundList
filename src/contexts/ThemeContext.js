import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { createTheme, accentColors } from '../theme/colors';
import { THEME_PRESETS, getThemeById } from '../theme/themePresets';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [accentColor, setAccentColor] = useState(accentColors.blue);
  const [themeMode, setThemeMode] = useState('auto'); // 'light', 'dark', 'auto'
  const [customThemeId, setCustomThemeId] = useState(null);
  const [customColors, setCustomColors] = useState(null);
  const [useDynamicColor, setUseDynamicColor] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // Material You wallpaper palette on Android 12+; library falls back to a
  // generated palette elsewhere. We only use it when the OS actually provides it.
  const { theme: m3Theme } = useMaterial3Theme({ fallbackSourceColor: accentColors.blue });

  // Determine current theme based on mode and system preference
  const getEffectiveTheme = () => {
    if (themeMode === 'auto') {
      const colorScheme = Appearance.getColorScheme();
      return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  };

  // Get the current theme - either custom or default
  const getCurrentTheme = () => {
    if (customColors) {
      return {
        colors: customColors,
        isDark: getEffectiveTheme() === 'dark',
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        }
      };
    }
    const mode = getEffectiveTheme();
    // Dynamic color: Android 12+ (API 31) exposes the wallpaper palette.
    // Android 10/11 keeps the calm static palette.
    const dynamicAvailable =
      Platform.OS === 'android' && Number(Platform.Version) >= 31 && m3Theme?.[mode]?.primary;
    const effectiveAccent = useDynamicColor && dynamicAvailable
      ? m3Theme[mode].primary
      : accentColor;
    return createTheme(effectiveAccent, mode);
  };

  const theme = getCurrentTheme();

  useEffect(() => {
    loadSettings();
    
    // Listen for system theme changes when in auto mode
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'auto') {
        // Force re-render when system theme changes
        setAccentColor(prev => prev); // Trigger re-render
      }
    });

    return () => subscription?.remove();
  }, [themeMode]);

  const loadSettings = async () => {
    try {
      const [savedAccentColor, savedThemeMode, savedCustomThemeId, savedCustomColors, savedDynamic] = await Promise.all([
        AsyncStorage.getItem('accentColor'),
        AsyncStorage.getItem('themeMode'),
        AsyncStorage.getItem('customThemeId'),
        AsyncStorage.getItem('customColors'),
        AsyncStorage.getItem('useDynamicColor'),
      ]);

      if (savedDynamic !== null) {
        setUseDynamicColor(savedDynamic === 'true');
      }
      
      if (savedAccentColor) {
        // Ensure the saved accent color is a valid hex color from our predefined set
        const validColor = Object.values(accentColors).includes(savedAccentColor) 
          ? savedAccentColor 
          : accentColors.blue;
        setAccentColor(validColor);
      }
      
      if (savedThemeMode) {
        setThemeMode(savedThemeMode);
      }

      if (savedCustomThemeId) {
        setCustomThemeId(savedCustomThemeId);
      }

      if (savedCustomColors) {
        try {
          const colors = JSON.parse(savedCustomColors);
          setCustomColors(colors);
        } catch (e) {
          console.warn('Failed to parse custom colors');
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccentColor = async (newColor) => {
    try {
      // Ensure we only save valid hex colors
      const validColor = typeof newColor === 'string' && Object.values(accentColors).includes(newColor)
        ? newColor
        : accentColors.blue;
      
      await AsyncStorage.setItem('accentColor', validColor);
      setAccentColor(validColor);
    } catch (error) {
      console.error('Failed to save accent color:', error);
    }
  };

  const updateThemeMode = async (newMode) => {
    try {
      await AsyncStorage.setItem('themeMode', newMode);
      setThemeMode(newMode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const setCustomTheme = async (themeId, colors) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('customThemeId', themeId),
        AsyncStorage.setItem('customColors', JSON.stringify(colors)),
      ]);
      setCustomThemeId(themeId);
      setCustomColors(colors);
    } catch (error) {
      console.error('Failed to save custom theme:', error);
    }
  };

  const resetToDefaultTheme = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('customThemeId'),
        AsyncStorage.removeItem('customColors'),
      ]);
      setCustomThemeId(null);
      setCustomColors(null);
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  };

  const toggleTheme = () => {
    const currentEffective = getEffectiveTheme();
    const newMode = currentEffective === 'dark' ? 'light' : 'dark';
    updateThemeMode(newMode);
  };

  const updateDynamicColor = async (enabled) => {
    try {
      await AsyncStorage.setItem('useDynamicColor', String(!!enabled));
      setUseDynamicColor(!!enabled);
    } catch (error) {
      console.error('Failed to save dynamic color setting:', error);
    }
  };

  const value = {
    theme,
    accentColor,
    themeMode,
    effectiveTheme: getEffectiveTheme(),
    isDark: getEffectiveTheme() === 'dark',
    currentThemeId: customThemeId,
    useDynamicColor,
    dynamicColorSupported: Platform.OS === 'android' && Number(Platform.Version) >= 31,
    updateDynamicColor,
    updateAccentColor,
    updateThemeMode,
    setCustomTheme,
    resetToDefaultTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};