import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Easing, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import CurrentTodosScreen from '../screens/CurrentTodosScreen';
import CalendarScreen from '../screens/CalendarScreen';
import PastTodosScreen from '../screens/PastTodosScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom slide animation for tabs
const slideAnimation = (index, position, layout) => {
  const inputRange = Object.keys(position.routes).map((_, i) => i);
  const outputRange = inputRange.map(i => {
    if (i === index) {
      return 0;
    } else {
      return i < index ? -layout.width : layout.width;
    }
  });

  const translateX = position.interpolate({
    inputRange,
    outputRange,
  });

  return {
    cardStyle: {
      transform: [{ translateX }],
    },
  };
};

// Stack screen animation config
const stackAnimationConfig = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.in(Easing.poly(4)),
      },
    },
  },
};

const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Current') {
            iconName = 'check-circle-outline';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar-today';
          } else if (route.name === 'Past') {
            iconName = 'history';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: theme.spacing.xs,
          paddingBottom: 20,
          height: 85,
          paddingHorizontal: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: theme.spacing.xs,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: theme.colors.textPrimary,
          fontSize: 18,
          fontWeight: '600',
        },
        headerShadowVisible: false,
        // Add smooth tab transitions
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        // Enhanced animations
        animationEnabled: true,
        gestureEnabled: true,
        ...stackAnimationConfig,
      })}
    >
      <Tab.Screen 
        name="Current" 
        component={CurrentTodosScreen}
        options={{
          title: 'Current Todos',
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          title: 'Calendar View',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Past" 
        component={PastTodosScreen}
        options={{
          title: 'Completed Todos',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;