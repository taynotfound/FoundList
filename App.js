import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Ensure Ionicons is imported
import SettingsScreen from './SettingsScreen'; // Import the SettingsScreen
import ResolvedScreen from './ResolvedScreen'; // Import the ResolvedScreen
import PendingScreen from './PendingScreen'; // Import the PendingScreen
import CustomToast from './CustomToast'; // Ensure you import your CustomToast component
import { getTextColor } from './colorUtils'; // Import the utility function

const Tab = createBottomTabNavigator();

// Define default colors
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
  const [toastMessage, setToastMessage] = useState(''); // Ensure this is defined
  const [toastVisible, setToastVisible] = useState(false);
  const [colors, setColors] = useState(defaultColors);
  const [theme, setTheme] = useState('Sunset Bloom');

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem('todos');
        const storedColors = await AsyncStorage.getItem('colors');
        const storedResolvedTodos = await AsyncStorage.getItem('resolvedTodos');
        if (storedTodos) setTodos(JSON.parse(storedTodos));
        if (storedColors) setColors(JSON.parse(storedColors));
        if (storedResolvedTodos) setResolvedTodos(JSON.parse(storedResolvedTodos));
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const addTodo = async (text) => {
    const newTodo = { id: Date.now(), text };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  const unresolveTodo = async (id) => {
    const todoToUnresolve = resolvedTodos.find((todo) => todo.id === id);
    if (todoToUnresolve) {
      const updatedTodos = [...todos, todoToUnresolve];
      const updatedResolvedTodos = resolvedTodos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      setResolvedTodos(updatedResolvedTodos);
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
      await AsyncStorage.setItem('resolvedTodos', JSON.stringify(updatedResolvedTodos));
    }
  };

  const deleteResolvedTodo = async (id) => {
    const updatedResolvedTodos = resolvedTodos.filter((todo) => todo.id !== id);
    setResolvedTodos(updatedResolvedTodos);
    await AsyncStorage.setItem('resolvedTodos', JSON.stringify(updatedResolvedTodos));
  };

  const resolveTodo = async (id) => {
    const todoToResolve = todos.find((todo) => todo.id === id);
    if (todoToResolve) {
      const updatedResolvedTodos = [...resolvedTodos, todoToResolve];
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setResolvedTodos(updatedResolvedTodos);
      setTodos(updatedTodos);
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
      await AsyncStorage.setItem('resolvedTodos', JSON.stringify(updatedResolvedTodos));
    }
  };

  const deleteTodo = async (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2000); // Hide toast after 2 seconds
  };
  const textColor = getTextColor(colors.background); // Get text color based on background

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: colors.background },
          tabBarActiveTintColor: textColor,
          tabBarInactiveTintColor: colors.ResolvedButtonBackground,
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
              colors={colors} // Ensure colors are passed
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
          children={() => <ResolvedScreen resolvedTodos={resolvedTodos} colors={colors} deleteTodo={deleteResolvedTodo} unresolveTodo={unresolveTodo} />} 
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="checkmark-done" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          children={() => <SettingsScreen setColors={setColors} colors = {colors} setTheme={setTheme} theme={theme} />} 
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <CustomToast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </NavigationContainer>
  );
}