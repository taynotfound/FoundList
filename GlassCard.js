import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function GlassCard({ children, style }) {
  return (
    <View style={[styles.glass, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    // For web, fallback to backdropFilter
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
});
