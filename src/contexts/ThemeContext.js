import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { createTheme, accentColors } from '../theme/colors';

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
  const [isLoading, setIsLoading] = useState(true);

  // Determine current theme based on mode and system preference
  const getEffectiveTheme = () => {
    if (themeMode === 'auto') {
      const colorScheme = Appearance.getColorScheme();
      return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  };

  const theme = createTheme(accentColor, getEffectiveTheme());

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
      const [savedAccentColor, savedThemeMode] = await Promise.all([
        AsyncStorage.getItem('accentColor'),
        AsyncStorage.getItem('themeMode'),
      ]);
      
      if (savedAccentColor) {
        setAccentColor(savedAccentColor);
      }
      
      if (savedThemeMode) {
        setThemeMode(savedThemeMode);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccentColor = async (newColor) => {
    try {
      await AsyncStorage.setItem('accentColor', newColor);
      setAccentColor(newColor);
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

  const value = {
    theme,
    accentColor,
    themeMode,
    effectiveTheme: getEffectiveTheme(),
    updateAccentColor,
    updateThemeMode,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};