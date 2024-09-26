import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { getTextColor } from './colorUtils'; // Import the utility function
import { Swipeable } from 'react-native-gesture-handler'; // Import Swipeable
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView

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
      <TouchableOpacity onPress={() => deleteTodo(item.id)}>
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    );

    const renderLeftActions = () => (
      <TouchableOpacity onPress={() => resolveTodo(item.id)}>
        <Text style={styles.buttonText}>Resolve</Text>
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
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  todoItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 5,
  },
  todoText: {
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  buttonText: {
    marginLeft: 10,
    color: '#007BFF',
  },
});

export default PendingScreen;