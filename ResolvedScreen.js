import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getTextColor } from './colorUtils'; // Import the utility function

const ResolvedScreen = ({ resolvedTodos, colors }) => {
  const textColor = getTextColor(colors.background); // Get text color based on background

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={resolvedTodos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Text style={[styles.todoText, { color: textColor }]}>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  todoItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#6f732f',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 5,
  },
  todoText: {
    fontSize: 16,
  },
});

export default ResolvedScreen;