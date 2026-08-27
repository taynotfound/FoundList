import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, Text } from 'react-native';
import Toast from 'react-native-toast-message';

import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { TodoProvider, useTodos } from './src/contexts/TodoContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/components/LoadingScreen';

const ToastMessage = ({ text1, text2, bg }) => (
  <View style={{
    backgroundColor: bg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  }}>
    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: text2 ? 2 : 0 }}>
      {text1}
    </Text>
    {text2 && <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.9 }}>{text2}</Text>}
  </View>
);

const toastConfig = {
  success: (props) => <ToastMessage {...props} bg="#30D158" />,
  error:   (props) => <ToastMessage {...props} bg="#CF6679" />,
  info:    (props) => <ToastMessage {...props} bg="#6D5EF5" />,
};

const AppContent = () => {
  const { isLoading: themeLoading, isDark } = useTheme();
  const { isLoading: todoLoading } = useTodos();

  if (themeLoading || todoLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
      <Toast config={toastConfig} position="top" topOffset={60} />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TodoProvider>
            <AppContent />
          </TodoProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
