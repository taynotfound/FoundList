import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';

const TodoItem = ({ todo, onPress, isCompleted = false }) => {
  const { theme } = useTheme();
  const { completeTodo, restoreTodo, deleteTodo } = useTodos();
  const due = todo.dueDate ? new Date(todo.dueDate) : null;
  const today = new Date();
  const dueDay = due ? new Date(due.getFullYear(), due.getMonth(), due.getDate()) : null;
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const overdue = !isCompleted && dueDay && dueDay < todayDay;
  const dueLabel = due && (dueDay.getTime() === todayDay.getTime()
    ? `Today, ${due.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : dueDay.getTime() === todayDay.getTime() + 86400000
      ? 'Tomorrow'
      : due.toLocaleDateString([], { month: 'short', day: 'numeric' }));
  const priorityColor = todo.priority === 'high' ? theme.colors.destructive : todo.priority === 'low' ? theme.colors.success : theme.colors.accent;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: overdue ? theme.colors.destructive : theme.colors.border }]}>
      <TouchableOpacity
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={`${isCompleted ? 'Restore' : 'Complete'} ${todo.title}`}
        onPress={() => (isCompleted ? restoreTodo(todo.id) : completeTodo(todo.id))}
        style={[styles.checkbox, { borderColor: isCompleted ? theme.colors.success : theme.colors.textTertiary, backgroundColor: isCompleted ? theme.colors.success : 'transparent' }]}
      >
        {isCompleted && <Icon name="check" size={16} color="#fff" />}
      </TouchableOpacity>
      <TouchableOpacity style={styles.body} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${todo.title}`}>
        <Text style={[styles.title, { color: isCompleted ? theme.colors.textSecondary : theme.colors.textPrimary, textDecorationLine: isCompleted ? 'line-through' : 'none' }]} numberOfLines={2}>{todo.title}</Text>
        {!!todo.shortDesc && <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={1}>{todo.shortDesc}</Text>}
        <View style={styles.meta}>
          {dueLabel && <View style={styles.metaItem}><Icon name="schedule" size={14} color={overdue ? theme.colors.destructive : theme.colors.textSecondary} /><Text style={[styles.metaText, { color: overdue ? theme.colors.destructive : theme.colors.textSecondary }]}>{overdue ? `Overdue - ${dueLabel}` : dueLabel}</Text></View>}
          <View style={styles.metaItem}><View style={[styles.dot, { backgroundColor: priorityColor }]} /><Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{todo.priority || 'medium'}</Text></View>
          {!!todo.category && <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{todo.category}</Text>}
        </View>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Delete ${todo.title}`} onPress={() => deleteTodo(todo.id, isCompleted)} style={styles.delete}>
        <Icon name="more-vert" size={22} color={theme.colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1, marginRight: 12 },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '600', lineHeight: 21 },
  description: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 9 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, textTransform: 'capitalize' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  delete: { padding: 2, marginLeft: 6 },
});

export default TodoItem;
