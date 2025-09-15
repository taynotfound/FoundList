import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import { CATEGORIES } from './CategorySelector';

const { width: screenWidth } = Dimensions.get('window');

const CategoryStats = () => {
  const { theme } = useTheme();
  const { todos, completedTodos } = useTodos();
  const [modalVisible, setModalVisible] = useState(false);

  // Calculate category statistics
  const getCategoryStats = () => {
    const stats = {};
    
    // Initialize with all categories
    Object.keys(CATEGORIES).forEach(categoryId => {
      stats[categoryId] = {
        active: 0,
        completed: 0,
        total: 0,
        percentage: 0,
      };
    });
    
    // Add "no category" option
    stats.none = {
      active: 0,
      completed: 0,
      total: 0,
      percentage: 0,
    };

    // Count active todos by category
    todos.forEach(todo => {
      const categoryId = todo.category || 'none';
      if (stats[categoryId]) {
        stats[categoryId].active++;
        stats[categoryId].total++;
      }
    });

    // Count completed todos by category
    completedTodos.forEach(todo => {
      const categoryId = todo.category || 'none';
      if (stats[categoryId]) {
        stats[categoryId].completed++;
        stats[categoryId].total++;
      }
    });

    // Calculate percentages
    Object.keys(stats).forEach(categoryId => {
      const stat = stats[categoryId];
      if (stat.total > 0) {
        stat.percentage = Math.round((stat.completed / stat.total) * 100);
      }
    });

    return stats;
  };

  const stats = getCategoryStats();
  
  // Get categories with todos (excluding empty categories)
  const categoriesWithTodos = Object.entries(stats)
    .filter(([_, stat]) => stat.total > 0)
    .sort((a, b) => b[1].total - a[1].total); // Sort by total todos descending

  // Calculate overall stats
  const totalTodos = todos.length + completedTodos.length;
  const totalCompleted = completedTodos.length;
  const overallPercentage = totalTodos > 0 ? Math.round((totalCompleted / totalTodos) * 100) : 0;

  const getCategoryInfo = (categoryId) => {
    if (categoryId === 'none') {
      return {
        name: 'No Category',
        color: '#6B7280',
        emoji: '⚪',
      };
    }
    return CATEGORIES[categoryId] || { name: 'Unknown', color: '#6B7280', emoji: '❓' };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#F59E0B'; // Orange
    if (percentage >= 40) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.statsButton,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.statsContent}>
          <View style={styles.statsIcon}>
            <Icon name="analytics" size={16} color={theme.colors.accent} />
          </View>
          <View style={styles.statsText}>
            <Text style={[styles.statsTitle, { color: theme.colors.textPrimary }]}>
              Progress
            </Text>
            <Text style={[styles.statsSubtitle, { color: theme.colors.textSecondary }]}>
              {overallPercentage}% • {categoriesWithTodos.length} categories
            </Text>
          </View>
          <Icon name="keyboard-arrow-right" size={16} color={theme.colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Category Progress
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Overall Stats */}
            <View style={[styles.overallStats, { backgroundColor: theme.colors.background }]}>
              <View style={styles.overallStatsContent}>
                <View style={styles.overallStatsLeft}>
                  <Text style={[styles.overallTitle, { color: theme.colors.textPrimary }]}>
                    Overall Progress
                  </Text>
                  <Text style={[styles.overallSubtitle, { color: theme.colors.textSecondary }]}>
                    {totalCompleted} of {totalTodos} todos completed
                  </Text>
                </View>
                <View style={styles.overallPercentage}>
                  <Text
                    style={[
                      styles.overallPercentageText,
                      { color: getProgressColor(overallPercentage) },
                    ]}
                  >
                    {overallPercentage}%
                  </Text>
                </View>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: getProgressColor(overallPercentage),
                      width: `${overallPercentage}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Category Stats */}
            <ScrollView style={styles.categoryStatsList}>
              {categoriesWithTodos.length > 0 ? (
                categoriesWithTodos.map(([categoryId, stat]) => {
                  const categoryInfo = getCategoryInfo(categoryId);
                  return (
                    <View
                      key={categoryId}
                      style={[
                        styles.categoryStatItem,
                        { backgroundColor: `${categoryInfo.color}08` },
                      ]}
                    >
                      <View style={styles.categoryStatHeader}>
                        <View style={styles.categoryStatLeft}>
                          <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
                          <View style={styles.categoryStatInfo}>
                            <Text
                              style={[
                                styles.categoryStatName,
                                { color: categoryInfo.color },
                              ]}
                            >
                              {categoryInfo.name}
                            </Text>
                            <Text
                              style={[
                                styles.categoryStatDetails,
                                { color: theme.colors.textSecondary },
                              ]}
                            >
                              {stat.completed} of {stat.total} completed
                            </Text>
                          </View>
                        </View>
                        <View style={styles.categoryStatRight}>
                          <Text
                            style={[
                              styles.categoryStatPercentage,
                              { color: getProgressColor(stat.percentage) },
                            ]}
                          >
                            {stat.percentage}%
                          </Text>
                          <View style={styles.categoryStatCounts}>
                            <Text style={[styles.activeCount, { color: theme.colors.textPrimary }]}>
                              {stat.active} active
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: getProgressColor(stat.percentage),
                              width: `${stat.percentage}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="category" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                    No Categories Yet
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                    Add categories to your todos to see progress stats
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Stats Button
  statsButton: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  statsIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsText: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  statsSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },

  // Overall Stats
  overallStats: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
  },
  overallStatsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  overallStatsLeft: {
    flex: 1,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  overallSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  overallPercentage: {
    alignItems: 'center',
  },
  overallPercentageText: {
    fontSize: 24,
    fontWeight: '800',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Category Stats List
  categoryStatsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  categoryStatItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  categoryStatInfo: {
    flex: 1,
  },
  categoryStatName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryStatDetails: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryStatRight: {
    alignItems: 'flex-end',
  },
  categoryStatPercentage: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  categoryStatCounts: {
    alignItems: 'flex-end',
  },
  activeCount: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CategoryStats;