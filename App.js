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
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [colors, setColors] = useState(defaultColors);
  const [theme, setTheme] = useState('Sunset Bloom');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(colors)

        const storedTodos = await AsyncStorage.getItem('todos');
        console.log(storedTodos);
        const storedColors = await AsyncStorage.getItem('colors');
        const storedResolvedTodos = await AsyncStorage.getItem('resolvedTodos');
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          const formattedTodos = parsedTodos.map(todo => ({
            id: todo.id,
            text: todo.text.text, // Adjust this if necessary
            priority: todo.text.priority,
            date: todo.text.date,
          }));
          setTodos(formattedTodos);
        }
        console.log(storedColors);
        if (storedColors) setColors(colors);
        if (storedResolvedTodos) setResolvedTodos(JSON.parse(storedResolvedTodos));
        if(storedTheme) setTheme(storedTheme);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const addTodo = async (text, priority) => {
    const newTodo = { id: Date.now(), text: text, priority: priority, date: new Date().toISOString() }; // Ensure all properties are correct
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
  };
    
  const updateThemeMode = async (theme, mode, lightTheme, darkTheme) => {
    const updatedColors = mode === 'light' ? lightTheme[theme] : darkTheme[theme];
    setColors(updatedColors);
    await AsyncStorage.setItem('colors', JSON.stringify(updatedColors));
    await AsyncStorage.setItem('theme', theme);
  }
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
    }, 2000); // Hide toast after 2 seconds
  };

  const textColor = getTextColor(colors.background); // Get text color based on background

  // Function to render tab icons
  const renderTabIcon = (routeName) => {
    let iconName;

    if (routeName === 'Pending') {
      iconName = 'md-list'; // Replace with the desired icon name
    } else if (routeName === 'Resolved') {
      iconName = 'md-checkmark-circle'; // Replace with the desired icon name
    } else if (routeName === 'Settings') {
      iconName = 'md-settings'; // Replace with the desired icon name
    }

    return <Ionicons name={iconName} size={24} color={textColor} />;
  };

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
          name="Settings" 
          children={() => (
            <SettingsScreen
              setTheme={setTheme}
              setColors={setColors}
              colors={colors}
              showToast={showToast}
              theme={theme}
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
