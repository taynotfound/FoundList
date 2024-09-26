import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';

const CustomToast = ({ message, visible, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(onHide);
    }
  }, [visible, opacity, onHide]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 50,
    left: '50%',
    transform: [{ translateX: -150 }],
    backgroundColor: '#b38a58',
    padding: 10,
    borderRadius: 5,
    width: 300,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CustomToast;