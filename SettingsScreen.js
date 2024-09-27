import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { getTextColor } from './colorUtils'; // Import the utility function

const SettingsScreen = ({ setColors, colors }) => {
  const textColor = getTextColor(colors.background); // Get text color based on background

  const lightTheme = {
    background: '#b4fcfc', // Main background color
    inputBackground: '#e9fbeb', // Input fields background
    buttonBackground: '#90dab5', // Button color
    todoBackground: '#d1dff7', // Todo item background
    resolvedButtonBackground: '#c2b7f0', // Resolved button color
  };

  const darkTheme = {
    background: '#153238',
    inputBackground: '#fff',
    buttonBackground: '#b38a58',
    todoBackground: '#264027',
    resolvedButtonBackground: '#6f732f',
  };

  const toggleTheme = (isLightMode) => {
    setColors(isLightMode ? lightTheme : darkTheme);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: textColor }]}>Settings</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => toggleTheme(true)} style={styles.iconButton}>
          <Ionicons 
            name="sunny" 
            size={50} 
            color={colors.background === '#153238' ? '#FFD700' : '#000'} 
          />
          <Text style={[styles.iconLabel, { color: colors.background === lightTheme.background ? '#007AFF' : textColor }]}>
            Light Mode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleTheme(false)} style={styles.iconButton}>
          <Ionicons 
            name="moon" 
            size={50} 
            color={colors.background === '#ffffff' ? '#4B0082' : '#fff'} 
          />
          <Text style={[styles.iconLabel, { color: colors.background === darkTheme.background ? '#007AFF' : textColor }]}>
            Dark Mode
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30, // Space below icons
  },
  iconButton: {
    alignItems: 'center',
  },
  iconLabel: {
    marginTop: 5,
    fontSize: 16,
  },
});

export default SettingsScreen;