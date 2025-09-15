import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import { useGamification } from '../contexts/GamificationContext';
import AboutScreen from './AboutScreen';
import ThemeSelector from '../components/ThemeSelector';
import GamificationDashboard from '../components/GamificationDashboard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const SettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { todos, completedTodos, clearCompletedTodos, deleteTodo } = useTodos();
  const { stats } = useGamification();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleClearAllData = () => {
    const totalTodos = todos.length + completedTodos.length;
    
    if (totalTodos === 0) {
      Alert.alert('No Data', 'There are no todos to clear.');
      return;
    }

    Alert.alert(
      'Clear All Data',
      `Are you sure you want to delete all ${totalTodos} todos? This will permanently remove all current and completed todos. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCompletedTodos();
              // Clear current todos by deleting them one by one
              for (const todo of todos) {
                await deleteTodo(todo.id);
              }
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear all data.');
            }
          },
        },
      ]
    );
  };

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/taynotfound/FoundList');
  };

  const handleOpenAbout = () => {
    setShowAbout(true);
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, danger = false }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
          <Icon
            name={icon}
            size={20}
            color={danger ? theme.colors.destructive : theme.colors.accent}
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (
        onPress && (
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        )
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={true}
        indicatorStyle={theme.isDark ? 'white' : 'black'}
        scrollIndicatorInsets={{ right: 2 }}
      >
        {/* App Info */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.appInfo}>
            <View style={[styles.appIcon, { backgroundColor: theme.colors.accent }]}>
              <Icon name="check-circle" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.appDetails}>
              <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>
                FoundList
              </Text>
              <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
                Version 2.0.0
              </Text>
            </View>
          </View>
        </View>

        {/* Progress & Achievements */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            PROGRESS & ACHIEVEMENTS
          </Text>
          <SettingItem
            icon="emoji-events"
            title="View Dashboard"
            subtitle={`Level ${stats.level} • ${stats.totalPoints} points • ${stats.currentStreak} day streak`}
            onPress={() => setShowGamification(true)}
            rightElement={
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            }
          />
          <SettingItem
            icon="analytics"
            title="Analytics Dashboard"
            subtitle="View productivity insights and trends"
            onPress={() => setShowAnalytics(true)}
            rightElement={
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            }
          />
        </View>

        {/* Appearance */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            APPEARANCE
          </Text>
          <SettingItem
            icon="palette"
            title="Theme & Colors"
            subtitle="Customize app appearance"
            onPress={() => setShowThemeSelector(true)}
            rightElement={
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            }
          />
        </View>

        {/* Statistics */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            STATISTICS
          </Text>
          <SettingItem
            icon="assignment"
            title="Current Todos"
            subtitle={`${todos.length} active ${todos.length === 1 ? 'todo' : 'todos'}`}
          />
          <SettingItem
            icon="history"
            title="Completed Todos"
            subtitle={`${completedTodos.length} completed ${completedTodos.length === 1 ? 'todo' : 'todos'}`}
          />
          <SettingItem
            icon="bar-chart"
            title="Total Todos"
            subtitle={`${todos.length + completedTodos.length} ${todos.length + completedTodos.length === 1 ? 'todo' : 'todos'} created`}
          />
        </View>

        {/* Data Management */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            DATA MANAGEMENT
          </Text>
          <SettingItem
            icon="delete-sweep"
            title="Clear All Data"
            subtitle="Permanently delete all todos"
            onPress={handleClearAllData}
            danger={true}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            ABOUT
          </Text>
          <SettingItem
            icon="code"
            title="Source Code"
            subtitle="View on GitHub"
            onPress={handleOpenGitHub}
          />
          <SettingItem
            icon="info"
            title="About FoundList"
            subtitle="A beautiful and modern todo app"
            onPress={handleOpenAbout}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Made with ❤️ by taynotfound
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Built with React Native & Expo
          </Text>
        </View>
      </ScrollView>

      {/* Theme Selector Modal */}
      <ThemeSelector
        visible={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />

      {/* About Modal */}
      <Modal
        visible={showAbout}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAbout(false)}
      >
        <AboutScreen navigation={{ goBack: () => setShowAbout(false) }} />
      </Modal>

      {/* Gamification Dashboard Modal */}
      <GamificationDashboard
        visible={showGamification}
        onClose={() => setShowGamification(false)}
      />

      {/* Analytics Dashboard Modal */}
      <AnalyticsDashboard
        visible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
    marginBottom: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SettingsScreen;