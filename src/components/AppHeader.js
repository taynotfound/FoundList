import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import { useGamification } from '../contexts/GamificationContext';
import { createFloatingAnimation, createFadeInAnimation } from '../utils/animations';

const AppHeader = ({ title, showStats = false, showLevel = false }) => {
  const { theme } = useTheme();
  const { todos, completedTodos } = useTodos();
  const { stats: gamificationStats, getCurrentLevel } = useGamification();
  
  // Animation refs
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start floating animation for stats icons
    createFloatingAnimation(floatAnim).start();
    
    // Fade in the header
    createFadeInAnimation(fadeAnim, 500).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayCompleted = completedTodos.filter(todo => {
      const completedDate = new Date(todo.completedAt).toDateString();
      return completedDate === today;
    }).length;

    const overdue = todos.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      const todayDate = new Date();
      dueDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);
      return dueDate < todayDate;
    }).length;

    return { todayCompleted, overdue, totalActive: todos.length };
  };

  const stats = getTodayStats();

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.leftSection}>
          <Animated.View 
            style={[
              styles.iconContainer, 
              { 
                backgroundColor: theme.colors.accent,
                transform: [{ translateY: floatAnim }],
              }
            ]}
          >
            <Icon name="check-circle" size={20} color="#FFFFFF" />
          </Animated.View>
          <View style={styles.titleContainer}>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {title}
            </Text>
          </View>
        </View>

        {(showStats || showLevel) && (
          <Animated.View 
            style={[
              styles.statsContainer,
              { transform: [{ translateY: floatAnim }] }
            ]}
          >
            {showLevel && gamificationStats && (
              <View style={[styles.levelBadge, { backgroundColor: getCurrentLevel(gamificationStats.totalPoints).color + '20' }]}>
                <Text style={[styles.levelNumber, { color: getCurrentLevel(gamificationStats.totalPoints).color }]}>
                  {gamificationStats.level}
                </Text>
                <Text style={[styles.levelLabel, { color: getCurrentLevel(gamificationStats.totalPoints).color }]}>
                  {getCurrentLevel(gamificationStats.totalPoints).title}
                </Text>
              </View>
            )}

            {showStats && (
              <>
                <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.statNumber, { color: theme.colors.accent }]}>
                    {stats.totalActive}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Active
                  </Text>
                </View>

                {stats.todayCompleted > 0 && (
                  <View style={[styles.statItem, { backgroundColor: theme.colors.success + '20' }]}>
                    <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                      {stats.todayCompleted}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.success }]}>
                      Done today
                    </Text>
                  </View>
                )}

                {stats.overdue > 0 && (
                  <Animated.View style={[styles.statItem, { backgroundColor: theme.colors.destructive + '20' }]}>
                    <Text style={[styles.statNumber, { color: theme.colors.destructive }]}>
                      {stats.overdue}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.destructive }]}>
                      Overdue
                    </Text>
                  </Animated.View>
                )}
              </>
            )}
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftSection: {
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
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 50,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: -2,
  },
});

export default AppHeader;