import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { getTextColor } from './colorUtils'; // Import the utility function
import { Swipeable } from 'react-native-gesture-handler'; // Import Swipeable
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import { Picker } from '@react-native-picker/picker';

const PendingScreen = ({ todos, addTodo, resolveTodo, deleteTodo, showToast, colors }) => {
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState('Medium'); // State to store selected priority

  useEffect(() => {
    // Sort todos by priority: High, Medium, Low
    todos.sort((a, b) => {
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      return priorityOrder[a.priority || 'Low'] - priorityOrder[b.priority || 'Low'];
    });
  }, [todos]);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo, priority); // Pass the priority along with the task
      setNewTodo('');
      setPriority('Medium'); // Reset priority to default
      showToast('Todo added!');
    }
  };

  const textColor = getTextColor(colors.background); // Get text color based on background

  const renderItem = ({ item }) => {
    const renderRightActions = () => (
      <TouchableOpacity onPress={() => deleteTodo(item.id)} style={[styles.actionButton, { marginVertical: 5 }]}>
        <View style={[styles.swipeButton, { backgroundColor: '#FF3B30' }]}>
          <Icon name="trash" size={26} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  
    const renderLeftActions = () => (
      <TouchableOpacity onPress={() => resolveTodo(item.id)} style={[styles.actionButton, { marginVertical: 5 }]}>
        <View style={[styles.swipeButton, { backgroundColor: '#4CD964' }]}>
          <Icon name="checkmark-circle" size={26} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  
    return (
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
      >
        <View style={[styles.todoItem, { backgroundColor: colors.todoBackground }]}>
          <Text style={[styles.todoText, { color: textColor }]}>
            {item.text}
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {' '}({item.priority || 'Low'})
            </Text>
          </Text>
          {item.date && ( // Render date if it exists
            <Text style={[styles.dateText, { color: textColor }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Swipeable>
    );
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#FF3B30'; // Red for high priority
      case 'Medium':
        return '#FF9500'; // Orange for medium priority
      case 'Low':
      default:
        return '#4CD964'; // Green for low priority or undefined
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground }]}
          placeholder="Add a new todo"
          value={newTodo}
          onChangeText={setNewTodo}
        />

        <Picker
          selectedValue={priority}
          style={[styles.picker, { color: textColor }]}
          onValueChange={(itemValue) => setPriority(itemValue)}
        >
          <Picker.Item label="High" value="High" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="Low" value="Low" />
        </Picker>

        <Button title="Add Todo" onPress={handleAddTodo} color={colors.buttonBackground} />

        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  todoItem: {
    marginVertical: 20,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: 5,
    marginBottom: 5,
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#999', // Gray for date text
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: '100%',
  },
  swipeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    width: 50,
    height: 50,
    borderRadius: 5,
  },
});

export default PendingScreen;
