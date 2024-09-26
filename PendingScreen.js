import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { getTextColor } from './colorUtils'; // Import the utility function
import { Swipeable } from 'react-native-gesture-handler'; // Import Swipeable
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons

const PendingScreen = ({ todos, addTodo, resolveTodo, deleteTodo, showToast, colors }) => {
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
      showToast('Todo added!');
    }
  };

  const textColor = getTextColor(colors.background); // Get text color based on background

  const renderItem = ({ item }) => {
    const renderRightActions = () => (
      <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.actionButton}>
        <Icon name="trash" size={24} color="#FF3B30" />
      </TouchableOpacity>
    );

    const renderLeftActions = () => (
      <TouchableOpacity onPress={() => resolveTodo(item.id)} style={styles.actionButton}>
        <Icon name="checkmark-circle" size={24} color="#4CD964" />
      </TouchableOpacity>
    );

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
      >
        <View style={styles.todoItem}>
          <Text style={[styles.todoText, { color: textColor }]}>{item.text}</Text>
        </View>
      </Swipeable>
    );
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
  todoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: '#f9f9f9',
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default PendingScreen;