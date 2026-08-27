import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import AboutScreen from './AboutScreen';
import ThemeSelector from '../components/ThemeSelector';

const SettingsScreen = () => {
  const { theme } = useTheme();
  const { todos, completedTodos, clearCompletedTodos, deleteTodo } = useTodos();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const clearAll = () => {
    const total = todos.length + completedTodos.length;
    if (!total) return;
    Alert.alert('Clear all todos?', `This permanently removes ${total} ${total === 1 ? 'todo' : 'todos'}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: async () => {
        await clearCompletedTodos();
        await Promise.all(todos.map(todo => deleteTodo(todo.id)));
      } },
    ]);
  };

  const Row = ({ icon, title, subtitle, onPress, danger = false }) => (
    <TouchableOpacity
      accessibilityRole={onPress ? 'button' : 'text'}
      style={[styles.row, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.icon, { backgroundColor: danger ? `${theme.colors.destructive}18` : theme.colors.accentLight }]}>
        <Icon name={icon} size={20} color={danger ? theme.colors.destructive : theme.colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {onPress && <Icon name="chevron-right" size={22} color={theme.colors.textTertiary} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>Settings</Text>
      <Text style={[styles.intro, { color: theme.colors.textSecondary }]}>Make FoundList fit the way your brain works.</Text>

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>APPEARANCE</Text>
      <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Row icon="palette" title="Theme and colors" subtitle="Choose a calm visual mode" onPress={() => setShowThemeSelector(true)} />
      </View>

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>YOUR LIST</Text>
      <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Row icon="assignment" title="Open todos" subtitle={`${todos.length} ${todos.length === 1 ? 'todo' : 'todos'} waiting`} />
        <Row icon="check-circle" title="Completed" subtitle={`${completedTodos.length} finished`} />
      </View>

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>DATA</Text>
      <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Row icon="delete-sweep" title="Clear all todos" subtitle="There is no undo for this" onPress={clearAll} danger />
      </View>

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>ABOUT</Text>
      <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Row icon="code" title="Source code" subtitle="FoundList on GitHub" onPress={() => Linking.openURL('https://github.com/taynotfound/FoundList')} />
        <Row icon="info-outline" title="About FoundList" subtitle="Simple tools for remembering" onPress={() => setShowAbout(true)} />
      </View>

      <Text style={[styles.footer, { color: theme.colors.textTertiary }]}>FoundList - useful first, playful when you want it.</Text>

      <ThemeSelector visible={showThemeSelector} onClose={() => setShowThemeSelector(false)} />
      <Modal visible={showAbout} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAbout(false)}>
        <AboutScreen navigation={{ goBack: () => setShowAbout(false) }} />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  heading: { fontSize: 30, fontWeight: '700', marginTop: 12 },
  intro: { fontSize: 16, lineHeight: 23, marginTop: 6, marginBottom: 28 },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 18 },
  group: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  row: { minHeight: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  copy: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  footer: { textAlign: 'center', fontSize: 13, marginTop: 34 },
});

export default SettingsScreen;
