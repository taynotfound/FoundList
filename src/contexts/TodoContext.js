import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const TodoContext = createContext();

// Priority weights for sorting (higher number = higher priority)
const PRIORITY_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1,
};

// Sorting utility functions
const sortTodos = (todos, sortBy) => {
  const sortedTodos = [...todos];
  
  switch (sortBy) {
    case 'smart':
      // Smart sorting: Priority first, then due date, then creation date
      return sortedTodos.sort((a, b) => {
        // First by priority (high to low)
        const priorityDiff = (PRIORITY_WEIGHTS[b.priority] || 2) - (PRIORITY_WEIGHTS[a.priority] || 2);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by due date (earliest first, null dates last)
        if (a.dueDate && b.dueDate) {
          const dueDateDiff = new Date(a.dueDate) - new Date(b.dueDate);
          if (dueDateDiff !== 0) return dueDateDiff;
        } else if (a.dueDate && !b.dueDate) {
          return -1;
        } else if (!a.dueDate && b.dueDate) {
          return 1;
        }
        
        // Finally by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
    case 'priority':
      return sortedTodos.sort((a, b) => {
        const priorityDiff = (PRIORITY_WEIGHTS[b.priority] || 2) - (PRIORITY_WEIGHTS[a.priority] || 2);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
    case 'dueDate':
      return sortedTodos.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (a.dueDate && !b.dueDate) {
          return -1;
        } else if (!a.dueDate && b.dueDate) {
          return 1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
    case 'createdAt':
      return sortedTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
    case 'alphabetical':
      return sortedTodos.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
      
    default:
      return sortedTodos;
  }
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('smart'); // 'smart', 'dueDate', 'createdAt', 'alphabetical', 'priority'

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const [savedTodos, savedCompletedTodos] = await Promise.all([
        AsyncStorage.getItem('todos'),
        AsyncStorage.getItem('completedTodos'),
      ]);

      let todosData = [];
      let completedTodosData = [];

      if (savedTodos) {
        todosData = JSON.parse(savedTodos);
        // Clean up invalid blob URIs from existing todos
        todosData = todosData.map(todo => ({
          ...todo,
          images: todo.images ? todo.images.filter(img => {
            const uri = typeof img === 'string' ? img : img.uri;
            return uri && (uri.startsWith('data:') || uri.startsWith('http') || uri.startsWith('file:'));
          }) : []
        }));
        setTodos(todosData);
      }
      
      if (savedCompletedTodos) {
        completedTodosData = JSON.parse(savedCompletedTodos);
        // Clean up invalid blob URIs from completed todos
        completedTodosData = completedTodosData.map(todo => ({
          ...todo,
          images: todo.images ? todo.images.filter(img => {
            const uri = typeof img === 'string' ? img : img.uri;
            return uri && (uri.startsWith('data:') || uri.startsWith('http') || uri.startsWith('file:'));
          }) : []
        }));
        setCompletedTodos(completedTodosData);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load todos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTodos = async (newTodos, newCompletedTodos) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('todos', JSON.stringify(newTodos || todos)),
        AsyncStorage.setItem('completedTodos', JSON.stringify(newCompletedTodos || completedTodos)),
      ]);
    } catch (error) {
      console.error('Failed to save todos:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save todos',
      });
    }
  };

  const addTodo = async (title, shortDesc = '', longDesc = '', dueDate = null, priority = 'medium', category = null, tags = [], images = []) => {
    const newTodo = {
      id: Date.now().toString(),
      title: title.trim(),
      shortDesc: shortDesc.trim(),
      longDesc: longDesc.trim(),
      dueDate: dueDate,
      priority: priority, // 'high', 'medium', 'low'
      category: category, // category id from CATEGORIES
      tags: Array.isArray(tags) ? tags : [], // array of tag strings
      images: Array.isArray(images) ? images : [], // array of image objects
      createdAt: new Date().toISOString(),
      notificationIds: [],
    };

    const newTodos = [newTodo, ...todos];
    setTodos(newTodos);
    await saveTodos(newTodos, completedTodos);

    Toast.show({
      type: 'success',
      text1: 'Todo Added',
      text2: title,
    });
  };

  const updateTodo = async (id, updates) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    );
    setTodos(newTodos);
    await saveTodos(newTodos, completedTodos);

    Toast.show({
      type: 'success',
      text1: 'Todo Updated',
    });
  };

  const completeTodo = async (id) => {
    const todoToComplete = todos.find(todo => todo.id === id);
    if (!todoToComplete) return;

    const completedTodo = {
      ...todoToComplete,
      completedAt: new Date().toISOString(),
    };

    const newTodos = todos.filter(todo => todo.id !== id);
    const newCompletedTodos = [completedTodo, ...completedTodos];

    setTodos(newTodos);
    setCompletedTodos(newCompletedTodos);
    await saveTodos(newTodos, newCompletedTodos);

    Toast.show({
      type: 'success',
      text1: 'Todo Completed',
      text2: todoToComplete.title,
    });
  };

  const deleteTodo = async (id, fromCompleted = false) => {
    console.log('deleteTodo called with:', { id, fromCompleted });
    try {
      if (fromCompleted) {
        console.log('Deleting from completed todos');
        const newCompletedTodos = completedTodos.filter(todo => todo.id !== id);
        setCompletedTodos(newCompletedTodos);
        await saveTodos(todos, newCompletedTodos);
      } else {
        console.log('Deleting from active todos');
        const todoToDelete = todos.find(todo => todo.id === id);
        console.log('Todo to delete:', todoToDelete);
        
        const newTodos = todos.filter(todo => todo.id !== id);
        console.log('New todos count:', newTodos.length);
        setTodos(newTodos);
        await saveTodos(newTodos, completedTodos);
      }

      Toast.show({
        type: 'info',
        text1: 'Todo Deleted',
      });
      console.log('Delete operation completed successfully');
    } catch (error) {
      console.error('Error in deleteTodo:', error);
      throw error;
    }
  };

  const restoreTodo = async (id) => {
    const todoToRestore = completedTodos.find(todo => todo.id === id);
    if (!todoToRestore) return;

    const { completedAt, ...restoredTodo } = todoToRestore;
    
    const newCompletedTodos = completedTodos.filter(todo => todo.id !== id);
    const newTodos = [restoredTodo, ...todos];

    setCompletedTodos(newCompletedTodos);
    setTodos(newTodos);
    await saveTodos(newTodos, newCompletedTodos);

    Toast.show({
      type: 'success',
      text1: 'Todo Restored',
      text2: todoToRestore.title,
    });
  };

  const clearCompletedTodos = async () => {
    setCompletedTodos([]);
    await saveTodos(todos, []);

    Toast.show({
      type: 'info',
      text1: 'Cleared completed todos',
    });
  };

  // Get sorted todos
  const sortedTodos = sortTodos(todos, sortBy);
  const sortedCompletedTodos = sortTodos(completedTodos, sortBy);

  const value = {
    todos: sortedTodos,
    completedTodos: sortedCompletedTodos,
    isLoading,
    sortBy,
    setSortBy,
    addTodo,
    updateTodo,
    completeTodo,
    deleteTodo,
    restoreTodo,
    clearCompletedTodos,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};