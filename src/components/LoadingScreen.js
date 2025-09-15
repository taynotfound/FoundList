import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const LoadingScreen = () => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => startRotation());
    };

    startRotation();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.iconBackground, { backgroundColor: theme.colors.accent }]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Icon name="check-circle" size={64} color="#FFFFFF" />
            </Animated.View>
          </View>
          
          <Animated.Text
            style={[
              styles.appName,
              {
                color: theme.colors.textPrimary,
                opacity: fadeAnim,
              },
            ]}
          >
            FoundList
          </Animated.Text>
          
          <Animated.Text
            style={[
              styles.tagline,
              {
                color: theme.colors.textSecondary,
                opacity: fadeAnim,
              },
            ]}
          >
            Your beautiful todo companion
          </Animated.Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.loadingIndicator,
            { opacity: fadeAnim },
          ]}
        >
          <View style={[styles.progressBar, { backgroundColor: theme.colors.surface }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.accent,
                  transform: [{ scaleX: fadeAnim }],
                },
              ]}
            />
          </View>
          
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading your todos...
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingIndicator: {
    width: width * 0.6,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    transformOrigin: 'left',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoadingScreen;