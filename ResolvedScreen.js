import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getTextColor } from './colorUtils'; // Import the utility function
import { Swipeable } from 'react-native-gesture-handler'; // Import Swipeable for swipe gestures
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons for icons

const ResolvedScreen = ({ resolvedTodos, unresolveTodo, deleteTodo, colors, showToast }) => {
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
      <TouchableOpacity onPress={() => unresolveTodo(item.id)} style={[styles.actionButton, { marginVertical: 5 }]}>
        <View style={[styles.swipeButton, { backgroundColor: '#FF9500' }]}>
          <Icon name="arrow-undo" size={26} color="#fff" />
        </View>
      </TouchableOpacity>
    );

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
      >
        <View style={[styles.todoItem, { backgroundColor: colors.todoBackground }]}>
          <Text style={[styles.todoText, { color: textColor }]}>{item.text}</Text>
        </View>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={resolvedTodos}
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
  todoItem: {
    marginVertical: 20,
    padding: 15,
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

export default ResolvedScreen;
