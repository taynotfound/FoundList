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
import LoadingScreen from './LoadingScreen'; // Import the LoadingScreen component

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
  const [isLoading, setIsLoading] = useState(true); // Manage loading state

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem('todos');
        const storedColors = await AsyncStorage.getItem('colors');
        const storedResolvedTodos = await AsyncStorage.getItem('resolvedTodos');
        const storedTheme = await AsyncStorage.getItem('theme');
        const storedMode = await AsyncStorage.getItem('isLightMode');

        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          const formattedTodos = parsedTodos.map(todo => ({
            id: todo.id,
            text: todo.text.text,
            priority: todo.text.priority,
            date: todo.text.date,
          }));
          setTodos(formattedTodos);
        }

        if (storedTheme) setTheme(storedTheme);
        if (storedMode !== null) setIsLightMode(storedMode === 'true');

        const selectedColors = (storedMode === 'true')
          ? lightTheme[storedTheme || 'Sunset Bloom']
          : darkTheme[storedTheme || 'Sunset Bloom'];

        setColors(storedColors ? JSON.parse(storedColors) : selectedColors);
        if (storedResolvedTodos) setResolvedTodos(JSON.parse(storedResolvedTodos));
        setTimeout(() => setIsLoading(false), 300); // Set loading to false after 1 second
      } catch (error) {
        console.error('Failed to load data:', error);
        setIsLoading(false); // Even if there’s an error, we need to stop loading
      }
    };

    loadData();
  }, []);

  const addTodo = async (text, priority) => {
    const newTodo = { id: Date.now(), text: text, priority: priority, date: new Date().toISOString() };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  const updateThemeMode = async (newTheme, mode) => {
    const updatedColors = mode === 'light' ? lightTheme[newTheme] : darkTheme[newTheme];
    setColors(updatedColors);
    setTheme(newTheme);
    setIsLightMode(mode === 'light');
    await AsyncStorage.setItem('colors', JSON.stringify(updatedColors));
    await AsyncStorage.setItem('theme', newTheme);
    await AsyncStorage.setItem('isLightMode', mode === 'light' ? 'true' : 'false');
  };

  const unresolveTodo = async (id) => {
    const todoToUnresolve = resolvedTodos.find((todo) => todo.id === id);
    if (todoToUnresolve) {
      // Remove from resolvedTodos and add back to todos
      const updatedResolvedTodos = resolvedTodos.filter((todo) => todo.id !== id);
      const updatedTodos = [...todos, todoToUnresolve];
      
      setResolvedTodos(updatedResolvedTodos);
      setTodos(updatedTodos);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('resolvedTodos', JSON.stringify(updatedResolvedTodos));
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
      
      showToast('Todo moved back to pending!');
    }
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
    return <LoadingScreen colors={colors} />; // Show loading screen while initializing
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
              unresolveTodo={unresolveTodo}
            />
          )}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="checkmark-done" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          children={() => (
            <SettingsScreen
              setTheme={setTheme}
              setColors={setColors}
              colors={colors}
              showToast={showToast}
              theme={theme}
              updateThemeMode={updateThemeMode}
              isLightMode={isLightMode}
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
