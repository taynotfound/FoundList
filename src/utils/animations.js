import { Animated, Easing } from 'react-native';

export const createFadeInAnimation = (animatedValue, duration = 300, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  });
};

export const createSlideInAnimation = (animatedValue, fromValue = 50, duration = 400, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  });
};

export const createScaleAnimation = (animatedValue, toValue = 1, duration = 200) => {
  return Animated.spring(animatedValue, {
    toValue,
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  });
};

export const createPulseAnimation = (animatedValue, duration = 1000) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: duration / 2,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ])
  );
};

export const createShakeAnimation = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
};

export const createStaggeredAnimation = (animations, staggerDelay = 100) => {
  return Animated.stagger(
    staggerDelay,
    animations.map((animation, index) => 
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        delay: index * staggerDelay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      })
    )
  );
};

export const createFloatingAnimation = (animatedValue) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: -5,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(animatedValue, {
        toValue: 5,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ])
  );
};

export const createRotateAnimation = (animatedValue, duration = 2000) => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.linear,
    })
  );
};