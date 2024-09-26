import React, { useContext, useState } from 'react'; // Add useState here
import { View, Text, StyleSheet, TextInput, Button, Linking, TouchableOpacity, Alert } from 'react-native';
import { getTextColor } from './colorUtils'; // Import the utility function
import { ColorContext } from './ColorContext'; // Import the ColorContext


const SettingsScreen = ({ route }) => {
  const { colors, defaultColors } = route.params; // Get colors and defaultColors from params
  const { setPalette } = useContext(ColorContext); // Access setColors from context

  const [inputColors, setInputColors] = useState(colors); // Initialize state

  const handleColorChange = (colorKey, value) => {
    setInputColors((prevColors) => ({
      ...prevColors,
      [colorKey]: value,
    }));
  };

  const applyColors = () => {
    console.log("Button pressed, applying colors:", inputColors); // Log when the button is pressed
    setPalette(inputColors); // Set the new colors in the parent component
  };

  const resetToDefault = () => {
    console.log("Resetting to default colors");
    setInputColors(defaultColors); // Reset input colors to default
    setPalette(defaultColors); // Reset the colors in the parent component
  };

  const textColor = getTextColor(inputColors.background); // Get text color based on background

  

  return (
    <View style={[styles.container, { backgroundColor: inputColors.background }]}>
      <Text style={[styles.title, { color: textColor }]}>Customize Your Colors</Text>
      {Object.keys(inputColors).map((key) => (
        <View key={key} style={styles.colorInputContainer}>
          <Text style={[styles.label, { color: textColor }]}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#fff' }]}
            value={inputColors[key]}
            onChangeText={(value) => handleColorChange(key, value)}
            placeholder="Enter hex code"
          />
        </View>
      ))}
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonBackground }]} onPress={applyColors}>
        <Text style={[styles.buttonText, { color: textColor }]}>Apply Colors</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonBackground }]} onPress={resetToDefault}>
        <Text style={[styles.buttonText, { color: textColor }]}>Reset to Default</Text>
      </TouchableOpacity>

      <Text style={[styles.inspirationText, { color: textColor }]}>
        Need inspiration? Check out{' '}
        <Text style={styles.link} onPress={() => Linking.openURL('https://coolors.co')}>
          Coolors
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  colorInputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inspirationText: {
    marginTop: 20,
    fontSize: 16,
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});

export default SettingsScreen;