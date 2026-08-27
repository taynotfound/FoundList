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

const AppContent = () => {
  const { isLoading: themeLoading } = useTheme();
  const { isLoading: todoLoading } = useTodos();

  if (themeLoading || todoLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
      <Toast 
        config={{
          success: (props) => (
            <View style={{
              backgroundColor: '#4CAF50',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              marginHorizontal: 20,
              marginTop: 60,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
                {props.text1}
              </Text>
              {props.text2 && (
                <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.9 }}>
                  {props.text2}
                </Text>
              )}
            </View>
          ),
          info: (props) => (
            <View style={{
              backgroundColor: '#2196F3',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              marginHorizontal: 20,
              marginTop: 60,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
                {props.text1}
              </Text>
              {props.text2 && (
                <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.9 }}>
                  {props.text2}
                </Text>
              )}
            </View>
          ),
        }}
        position="top"
        topOffset={60}
      />
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
  container: {
    flex: 1,
  },
});