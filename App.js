import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SettingsScreen from './SettingsScreen';
import ResolvedScreen from './ResolvedScreen';
import PendingScreen from './PendingScreen';
import CustomToast from './CustomToast';
import { getTextColor } from './colorUtils';
import { lightTheme, darkTheme } from './themes';
import LoadingScreen from './LoadingScreen';

const Tab = createBottomTabNavigator();

const defaultColors = {
  background: '#153238',
  inputBackground: '#fff',
  buttonBackground: '#b38a58',
  todoBackground: '#264027',
  resolvedButtonBackground: '#6f732f',
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [resolvedTodos, setResolvedTodos] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [colors, setColors] = useState(defaultColors);
  const [theme, setTheme] = useState('Sunset Bloom');
  const [isLightMode, setIsLightMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedTodos = await AsyncStorage.getItem('todos');
        const storedResolvedTodos = await AsyncStorage.getItem('resolvedTodos');
        const storedColors = await AsyncStorage.getItem('colors');
        const storedTheme = await AsyncStorage.getItem('theme');
        const storedMode = await AsyncStorage.getItem('isLightMode');

        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          setTodos(parsedTodos);
        }

        if (storedResolvedTodos) {
          const parsedResolvedTodos = JSON.parse(storedResolvedTodos);
          setResolvedTodos(parsedResolvedTodos);
        }
        showToast("Loaded todos!");
        if (storedColors) {
          setColors(JSON.parse(storedColors));
        } else {
          const selectedColors = (storedMode === 'true')
            ? lightTheme[storedTheme || 'Sunset Bloom']
            : darkTheme[storedTheme || 'Sunset Bloom'];
          setColors(selectedColors);
        }

        if (storedTheme) setTheme(storedTheme);
        if (storedMode !== null) setIsLightMode(storedMode === 'true');
        showToast("Loaded colors!");
        setTimeout(() => {
          setIsLoading(false);
          showToast("Finished loading!");
          
        }, 300);
      
      } catch (error) {
        console.error('Failed to load data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const updateThemeMode = async (newTheme, mode) => {
    const updatedColors = mode === 'light' ? lightTheme[newTheme] : darkTheme[newTheme];
    setColors(updatedColors);
    setTheme(newTheme);
    setIsLightMode(mode === 'light');
    
    // Save the updated theme and mode to AsyncStorage
    await AsyncStorage.setItem('colors', JSON.stringify(updatedColors));
    await AsyncStorage.setItem('theme', newTheme);
    await AsyncStorage.setItem('isLightMode', mode === 'light' ? 'true' : 'false');
    showToast('Theme updated to ' + newTheme);
  };
  

  const openGuide = () => {
    setIsGuideVisible(true);
  };

  const closeGuide = () => {
    setIsGuideVisible(false);
  };

  const addTodo = async (text, priority) => {
    const newTodo = { id: Date.now(), text, priority, date: new Date().toISOString() };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  const resolveTodo = async (id) => {
    const todoToResolve = todos.find((todo) => todo.id === id);
    if (todoToResolve) {
      const updatedResolvedTodos = [...resolvedTodos, todoToResolve];
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setResolvedTodos(updatedResolvedTodos);
      setTodos(updatedTodos);
      await AsyncStorage.setItem('resolvedTodos', JSON.stringify(updatedResolvedTodos));
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
      showToast('Todo resolved!');
    }
  };

  const deleteTodo = async (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
    showToast('Todo deleted!');
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setToastMessage('');
    }, 2000);
  };

  const textColor = getTextColor(colors.background);

  if (isLoading) {
    return <LoadingScreen colors={colors} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: colors.background },
          tabBarActiveTintColor: textColor,
          tabBarInactiveTintColor: colors.resolvedButtonBackground,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.buttonBackground,
        }}
      >
        <Tab.Screen 
          name="Pending" 
          children={() => (
            <PendingScreen 
              todos={todos} 
              addTodo={addTodo} 
              resolveTodo={resolveTodo} 
              deleteTodo={deleteTodo} 
              showToast={showToast} 
              colors={colors} 
            />
          )}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="list" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Resolved" 
          children={() => (
            <ResolvedScreen
              resolvedTodos={resolvedTodos}
              deleteTodo={deleteTodo}
              showToast={showToast}
              colors={colors}
            />
          )}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="checkmark-done" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings & Info" 
          children={(props) => (
            <SettingsScreen
            {...props}
              setTheme={setTheme}
              setColors={setColors}
              colors={colors}
              showToast={showToast}
              theme={theme}
              isLightMode={isLightMode}
              openGuide={openGuide}
              updateThemeMode={updateThemeMode}
            />
          )}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      {toastVisible && <CustomToast message={toastMessage} />}
    </NavigationContainer>
  );
}
