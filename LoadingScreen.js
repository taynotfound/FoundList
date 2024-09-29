import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = ({ colors }) => {
  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#153238' }]}>
      <ActivityIndicator size="large" color={colors.buttonBackground || '#b38a58'} />
      <Text style={[styles.text, { color: colors.inputBackground || '#fff' }]}>Loading Components...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default LoadingScreen;
