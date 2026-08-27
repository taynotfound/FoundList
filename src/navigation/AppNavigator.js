import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import CurrentTodosScreen from '../screens/CurrentTodosScreen';
import CalendarScreen from '../screens/CalendarScreen';
import PastTodosScreen from '../screens/PastTodosScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Current', component: CurrentTodosScreen, icon: 'check-circle-outline', label: 'Tasks' },
  { name: 'Calendar', component: CalendarScreen,     icon: 'calendar-today',       label: 'Calendar' },
  { name: 'Past',     component: PastTodosScreen,    icon: 'history',              label: 'Done' },
  { name: 'Settings', component: SettingsScreen,     icon: 'settings',             label: 'Settings' },
];

const AppNavigator = () => {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius, shadows } = theme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 32,
              borderRadius: borderRadius.round,
              backgroundColor: focused ? colors.primaryContainer : 'transparent',
            }}>
              <Icon name={tab?.icon} size={22} color={color} />
            </View>
          ),
          tabBarLabel: tab?.label ?? route.name,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            backgroundColor: colors.elevation1 ?? colors.surface,
            borderTopColor: colors.separator,
            borderTopWidth: 0.5,
            paddingTop: spacing.xs,
            paddingBottom: 20,
            height: 80,
            ...shadows.small,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: 2,
          },
          headerShown: false,
          tabBarHideOnKeyboard: true,
        };
      }}
    >
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
        />
      ))}
    </Tab.Navigator>
  );
};

export default AppNavigator;
