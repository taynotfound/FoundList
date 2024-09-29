import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTextColor, getLighterColor } from './colorUtils';
import { Button } from 'react-native';
const SettingsScreen = ({ setColors, colors, setTheme, theme, updateThemeMode, openGuide, navigation }) => {
  const [isLightMode, setIsLightMode] = useState(false);
  const textColor = getTextColor(colors.background);
  const guideBackgroundColor = getLighterColor(colors.background);
  const lightTheme = {
    sunsetBloom: {
      background: '#E8F1C0',
      inputBackground: '#d4e79e',
      buttonBackground: '#922d50',
      todoBackground: '#501537',
      resolvedButtonBackground: '#3c1b43',
    },
    grapeSoda: {
      background: '#D8BFD8',
      inputBackground: '#d4e79e',
      buttonBackground: '#800080',
      todoBackground: '#4B0082',
      resolvedButtonBackground: '#9932CC',
    },
    oceanBreeze: {
      background: '#ADD8E6',
      inputBackground: '#d4e79e',
      buttonBackground: '#0000FF',
      todoBackground: '#4682B4',
      resolvedButtonBackground: '#1E90FF',
    },
    nordyChill: {
      background: '#E5E9F0',
      inputBackground: '#ECEFF4',
      buttonBackground: '#81A1C1',
      todoBackground: '#D8DEE9',
      resolvedButtonBackground: '#88C0D0',
    },
    cattuccino: {
      background: '#F8E1D4',
      inputBackground: '#F5C3B3',
      buttonBackground: '#D6A07C',
      todoBackground: '#D5C4A1',
      resolvedButtonBackground: '#F3E2D5',
    },
    mintyFresh: {
      background: '#98FF98',
      inputBackground: '#B5FFB5',
      buttonBackground: '#7FFF7F',
      todoBackground: '#6EFF6E',
      resolvedButtonBackground: '#5EFF5E',
    },
  };

  const darkTheme = {
    sunsetBloom: {
      background: '#153238',
      inputBackground: '#fff',
      buttonBackground: '#b38a58',
      todoBackground: '#264027',
      resolvedButtonBackground: '#6f732f',
    },
    grapeSoda: {
      background: '#3b254e',
      inputBackground: '#fff',
      buttonBackground: '#6a0dad',
      todoBackground: '#5e3e76',
      resolvedButtonBackground: '#86608e',
    },
    oceanBreeze: {
      background: '#4682B4',
      inputBackground: '#fff',
      buttonBackground: '#0000FF',
      todoBackground: '#ADD8E6',
      resolvedButtonBackground: '#1E90FF',
    },
    nordyChill: {
      background: '#2E3440',
      inputBackground: '#3B4252',
      buttonBackground: '#5E81AC',
      todoBackground: '#4C566A',
      resolvedButtonBackground: '#88C0D0',
    },
    cattuccino: {
      background: '#504945',
      inputBackground: '#7C6F64',
      buttonBackground: '#D8A48F',
      todoBackground: '#665C54',
      resolvedButtonBackground: '#F3EACB',
    },
    mintyFresh: {
      background: '#007A59',
      inputBackground: '#228C68',
      buttonBackground: '#3BAF73',
      todoBackground: '#2B7D58',
      resolvedButtonBackground: '#4AD996',
    },
  };

  const themeOptions = isLightMode ? lightTheme : darkTheme;

  const toggleThemeMode = (lightMode) => {
    setIsLightMode(lightMode);
    const themeKey = theme || 'sunsetBloom'; // Preserve the selected theme
    const defaultTheme = lightMode ? lightTheme[themeKey] : darkTheme[themeKey]; // Use the selected theme
    setColors(defaultTheme);
    setTheme(themeKey);
    updateThemeMode(themeKey, lightMode ? 'light' : 'dark', lightTheme, darkTheme);
  };

  const selectTheme = (themeKey) => {
    setColors(themeOptions[themeKey]);
    setTheme(themeKey);
    updateThemeMode(themeKey, isLightMode ? 'light' : 'dark', lightTheme, darkTheme);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: textColor }]}>Display</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => toggleThemeMode(true)} style={styles.iconButton}>
            <Ionicons name="sunny" size={50} color={isLightMode ? '#FFD700' : '#000'} />
            <Text style={[styles.iconLabel, { color: textColor }]}>Light Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleThemeMode(false)} style={styles.iconButton}>
            <Ionicons name="moon" size={50} color={!isLightMode ? '#6a0dad' : '#fff'} />
            <Text style={[styles.iconLabel, { color: textColor }]}>Dark Mode</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.horizontalSeparator} />
        <View style={styles.themeButtonContainer}>
          {Object.keys(themeOptions).map((themeKey, index) => (
            <TouchableOpacity
              key={themeKey}
              onPress={() => selectTheme(themeKey)}
              style={styles.iconButton}
            >
              <Ionicons
                name={index % 2 === 0 ? 'color-palette' : 'water'}
                size={50}
                color={themeOptions[themeKey].buttonBackground}
              />
              <Text style={[styles.iconLabel, { color: textColor }]}>
                {themeKey === 'sunsetBloom'
                  ? 'Sunset Bloom'
                  : themeKey === 'grapeSoda'
                  ? 'Grape Soda'
                  : themeKey === 'oceanBreeze'
                  ? 'Ocean Breeze'
                  : themeKey === 'nordyChill'
                  ? 'Nordy Chill'
                  : themeKey === 'cattuccino'
                  ? 'Cattuccino'
                  : 'Minty Fresh'}
              </Text>
              {theme === themeKey && (
                <Ionicons name="checkmark-circle" size={20} color="green" />
              )}
            </TouchableOpacity>
          ))}
</View>
<View style={styles.horizontalSeparatorThicc} />
<Text style={[styles.title, { color: textColor }]}>Guide</Text>

<View style={[styles.guideContainer, {backgroundColor: colors.guideBackgroundColor}]}>
<Text style={[styles.iconLabel, { color: textColor }]}>Hello and Welcome to FoundList!</Text>
<Text style={[styles.iconLabel, { color: textColor }]}>This App is pretty straight forward.</Text>
<Text style={[styles.iconLabel, { color: textColor }]}>Add a To Do to the List by navigating to the Pending Tab and typing your To Do and then pressing "Add ToDo"</Text>
<Text style={[styles.iconLabel, { color: textColor }]}>Once you have completed a To Do, you can swipe right on the To Do to mark it as completed.</Text>
<Text style={[styles.iconLabel, { color: textColor }]}>If you have completed a To Do by mistake, you can swipe left on the To Do to unmark it as completed.</Text>
<Text style={[styles.iconLabel, { color: textColor }]}>If you would like to delete a To Do, you can swipe right on the To Do and then press the trash can icon.</Text>
</View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  guideContainer: {
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    elevation: 3, // Add shadow for elevation on Android
    shadowColor: '#000', // Shadow properties for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: '100%', // Full width for better visibility
  },
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
    marginBottom: 20,
  },
  horizontalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  horizontalSeparatorThicc: {
    width: '100%',
    height: 5,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  themeButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    width: '30%',
  },
  iconLabel: {
    marginTop: 5,
    fontSize: 15,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});

export default SettingsScreen;
