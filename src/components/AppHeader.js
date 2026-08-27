import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';

const AppHeader = ({ title }) => {
  const { theme } = useTheme();
  const { todos, completedTodos } = useTodos();
  const today = new Date().toDateString();
  const doneToday = completedTodos.filter(todo => new Date(todo.completedAt).toDateString() === today).length;
  const overdue = todos.filter(todo => todo.dueDate && new Date(todo.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)).length;

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.mark, { backgroundColor: theme.colors.accent }]}>
            <Icon name="check" size={20} color="#fff" />
          </View>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.textSecondary }]}>A calm place for</Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
          </View>
        </View>
        <View style={styles.stats} accessibilityLabel={`${todos.length} open, ${doneToday} done today${overdue ? `, ${overdue} overdue` : ''}`}>
          <Text style={[styles.stat, { color: theme.colors.textPrimary }]}>{todos.length}</Text>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>open</Text>
          {doneToday > 0 && <Text style={[styles.today, { color: theme.colors.success }]}>{doneToday} done</Text>}
          {overdue > 0 && <Text style={[styles.overdue, { color: theme.colors.destructive }]}>{overdue} overdue</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, borderBottomColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  mark: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  eyebrow: { fontSize: 12, marginBottom: 2 },
  title: { fontSize: 24, fontWeight: '700' },
  stats: { alignItems: 'flex-end' },
  stat: { fontSize: 20, fontWeight: '700' },
  label: { fontSize: 11, marginTop: -2 },
  today: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  overdue: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});

export default AppHeader;
