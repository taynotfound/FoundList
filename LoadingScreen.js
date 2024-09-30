import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={[styles.container, { backgroundColor: '#153238' }]}>
      <ActivityIndicator size="large" color={'#b38a58'} />
      <Text style={[styles.text, { color: '#fff' }]}>Loading Components...</Text>
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
