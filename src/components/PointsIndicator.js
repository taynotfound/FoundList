import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const PointsIndicator = ({ points, visible, onComplete, position = { x: screenWidth / 2, y: 200 } }) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Fade out after delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete && onComplete();
        });
      }, 1000);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { left: position.x - 30, top: position.y }]}>
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: '#FFD700',
            opacity: fadeAnim,
            transform: [
              { translateY },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Text style={styles.pointsText}>+{points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  indicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pointsText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  pointsLabel: {
    color: '#000',
    fontSize: 10,
    fontWeight: '500',
    marginTop: -2,
  },
});

export default PointsIndicator;