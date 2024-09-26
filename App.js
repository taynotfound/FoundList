import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SettingsScreen from './SettingsScreen'; // Import the SettingsScreen
import ResolvedScreen from './ResolvedScreen'; // Import the ResolvedScreen
import PendingScreen from './PendingScreen'; // Import the PendingScreen
import CustomToast from './CustomToast'; // Ensure you import your CustomToast component
import { ColorProvider } from './ColorContext'; // Import the ColorProvider

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem('todos');
        const storedColors = await AsyncStorage.getItem('colors');
        if (storedTodos) setTodos(JSON.parse(storedTodos));
        if (storedColors) setColors(JSON.parse(storedColors));
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

  const resolveTodo = async (id) => {
    const todoToResolve = todos.find((todo) => todo.id === id);
    if (todoToResolve) {
      const updatedResolvedTodos = [...resolvedTodos, todoToResolve];
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setResolvedTodos(updatedResolvedTodos);
      setTodos(updatedTodos);
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
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

  return (
    <ColorProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: colors.background },
            tabBarActiveTintColor: '#b38a58',
            tabBarInactiveTintColor: '#A8C8B9',
            headerTitle: 'FoundList',
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: '#b38a58',
            tabBarLabelStyle: { paddingBottom: 5 },
          }}
        >
          <Tab.Screen 
            name="Pending" 
            options={{
              tabBarLabel: 'Pending',
              tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
            }}
          >
            {() => <PendingScreen todos={todos} addTodo={addTodo} resolveTodo={resolveTodo} deleteTodo={deleteTodo} showToast={showToast} colors={colors} />}
          </Tab.Screen>
          <Tab.Screen 
            name="Resolved" 
            options={{
              tabBarLabel: 'Resolved',
              tabBarIcon: ({ color }) => <Ionicons name="checkmark-done" size={24} color={color} />,
            }}
          >
            {() => <ResolvedScreen resolvedTodos={resolvedTodos} colors={colors} />}
          </Tab.Screen>
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            initialParams={{ colors, defaultColors }} // Remove setColors
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
            }}
          />
        </Tab.Navigator>
        <CustomToast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
      </NavigationContainer>
    </ColorProvider>
  );
}