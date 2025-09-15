import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import TodoItem from '../components/TodoItem';
import TodoDetailModal from '../components/TodoDetailModal';

const PastTodosScreen = () => {
  const { theme } = useTheme();
  const { completedTodos, clearCompletedTodos } = useTodos();
  const [selectedTodo, setSelectedTodo] = useState(null);

  const handleClearAll = () => {
    if (completedTodos.length === 0) return;

    Alert.alert(
      'Clear All Completed Todos',
      `Are you sure you want to permanently delete all ${completedTodos.length} completed todos? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearCompletedTodos,
        },
      ]
    );
  };

  const renderTodo = ({ item }) => (
    <TodoItem
      todo={item}
      onPress={() => setSelectedTodo(item)}
      isCompleted={true}
    />
  );

  const EmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
      <Icon 
        name="history" 
        size={80} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.textPrimary }]}>
        No completed todos
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
        Completed todos will appear here
      </Text>
    </View>
  );

  const ListHeader = () => {
    if (completedTodos.length === 0) return null;

    return (
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Completed Todos
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {completedTodos.length} {completedTodos.length === 1 ? 'todo' : 'todos'} completed
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: theme.colors.destructive }]}
          onPress={handleClearAll}
        >
          <Icon name="clear-all" size={18} color={theme.colors.destructive} />
          <Text style={[styles.clearButtonText, { color: theme.colors.destructive }]}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {completedTodos.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={completedTodos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
          indicatorStyle={theme.isDark ? 'white' : 'black'}
          scrollIndicatorInsets={{ right: 2 }}
        />
      )}

      {/* Todo Detail Modal */}
      <TodoDetailModal
        todo={selectedTodo}
        visible={!!selectedTodo}
        onClose={() => setSelectedTodo(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default PastTodosScreen;