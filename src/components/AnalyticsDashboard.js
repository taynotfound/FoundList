import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import { CATEGORIES } from './CategorySelector';

const { width: screenWidth } = Dimensions.get('window');

const AnalyticsDashboard = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { todos, completedTodos } = useTodos();
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, year, all

  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    let startDate;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(0); // All time
    }

    const periodCompletedTodos = completedTodos.filter(todo => 
      new Date(todo.completedAt) >= startDate
    );

    // Basic stats
    const totalCompleted = periodCompletedTodos.length;
    const totalActive = todos.length;
    const completionRate = totalActive > 0 ? 
      (totalCompleted / (totalCompleted + totalActive)) * 100 : 0;

    // Category analysis
    const categoryStats = {};
    Object.keys(CATEGORIES).forEach(categoryId => {
      const categoryCompleted = periodCompletedTodos.filter(todo => todo.category === categoryId).length;
      const categoryActive = todos.filter(todo => todo.category === categoryId).length;
      const categoryTotal = categoryCompleted + categoryActive;
      
      categoryStats[categoryId] = {
        completed: categoryCompleted,
        active: categoryActive,
        total: categoryTotal,
        completionRate: categoryTotal > 0 ? (categoryCompleted / categoryTotal) * 100 : 0,
        category: CATEGORIES[categoryId],
      };
    });

    // Priority analysis
    const priorityStats = {
      high: { completed: 0, active: 0, total: 0, completionRate: 0 },
      medium: { completed: 0, active: 0, total: 0, completionRate: 0 },
      low: { completed: 0, active: 0, total: 0, completionRate: 0 },
    };

    ['high', 'medium', 'low'].forEach(priority => {
      const completed = periodCompletedTodos.filter(todo => todo.priority === priority).length;
      const active = todos.filter(todo => todo.priority === priority).length;
      const total = completed + active;
      
      priorityStats[priority] = {
        completed,
        active,
        total,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      };
    });

    // Time-based analysis
    const hourlyStats = Array(24).fill(0);
    const dailyStats = Array(7).fill(0);
    
    periodCompletedTodos.forEach(todo => {
      const date = new Date(todo.completedAt);
      const hour = date.getHours();
      const day = date.getDay();
      
      hourlyStats[hour]++;
      dailyStats[day]++;
    });

    // Find peak productivity times
    const peakHour = hourlyStats.indexOf(Math.max(...hourlyStats));
    const peakDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      dailyStats.indexOf(Math.max(...dailyStats))
    ];

    // Trend analysis
    const last7Days = Array(7).fill(0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    periodCompletedTodos.forEach(todo => {
      const date = new Date(todo.completedAt);
      if (date >= sevenDaysAgo) {
        const dayIndex = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
        if (dayIndex >= 0 && dayIndex < 7) {
          last7Days[6 - dayIndex]++;
        }
      }
    });

    const avgDaily = last7Days.reduce((a, b) => a + b, 0) / 7;
    const todayCompleted = last7Days[6] || 0;
    const trend = todayCompleted > avgDaily ? 'up' : todayCompleted < avgDaily ? 'down' : 'stable';

    return {
      totalCompleted,
      totalActive,
      completionRate,
      categoryStats,
      priorityStats,
      hourlyStats,
      dailyStats,
      peakHour,
      peakDay,
      last7Days,
      avgDaily,
      todayCompleted,
      trend,
    };
  }, [todos, completedTodos, selectedPeriod]);

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['week', 'month', 'year', 'all'].map(period => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            {
              backgroundColor: selectedPeriod === period ? theme.colors.accent : theme.colors.surface,
            }
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            {
              color: selectedPeriod === period ? '#FFFFFF' : theme.colors.textPrimary,
            }
          ]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        {trend && (
          <Icon 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat'} 
            size={16} 
            color={trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : theme.colors.textSecondary} 
          />
        )}
      </View>
      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
        {value}
      </Text>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const CategoryChart = () => (
    <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.chartTitle, { color: theme.colors.textPrimary }]}>
        Category Performance
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryChart}>
          {Object.values(analytics.categoryStats)
            .filter(stat => stat.total > 0)
            .sort((a, b) => b.completionRate - a.completionRate)
            .map((stat, index) => (
            <View key={stat.category.id} style={styles.categoryBar}>
              <View 
                style={[
                  styles.categoryBarFill,
                  { 
                    backgroundColor: stat.category.color,
                    height: `${Math.max(stat.completionRate, 5)}%`,
                  }
                ]} 
              />
              <Text style={[styles.categoryBarLabel, { color: theme.colors.textSecondary }]}>
                {stat.category.emoji}
              </Text>
              <Text style={[styles.categoryBarValue, { color: theme.colors.textSecondary }]}>
                {Math.round(stat.completionRate)}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const TimeChart = () => {
    const maxValue = Math.max(...analytics.hourlyStats);
    
    return (
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.textPrimary }]}>
          Hourly Productivity
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.timeChart}>
            {analytics.hourlyStats.map((count, hour) => (
              <View key={hour} style={styles.timeBar}>
                <View 
                  style={[
                    styles.timeBarFill,
                    { 
                      backgroundColor: hour === analytics.peakHour ? theme.colors.accent : theme.colors.border,
                      height: maxValue > 0 ? `${Math.max((count / maxValue) * 100, 2)}%` : '2%',
                    }
                  ]} 
                />
                <Text style={[styles.timeBarLabel, { color: theme.colors.textSecondary }]}>
                  {hour}h
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
          Peak hour: {analytics.peakHour}:00 • Best day: {analytics.peakDay}
        </Text>
      </View>
    );
  };

  const TrendChart = () => (
    <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.chartTitle, { color: theme.colors.textPrimary }]}>
        7-Day Trend
      </Text>
      <View style={styles.trendChart}>
        {analytics.last7Days.map((count, index) => (
          <View key={index} style={styles.trendBar}>
            <View 
              style={[
                styles.trendBarFill,
                { 
                  backgroundColor: index === 6 ? theme.colors.accent : theme.colors.border,
                  height: `${Math.max((count / Math.max(...analytics.last7Days, 1)) * 100, 5)}%`,
                }
              ]} 
            />
            <Text style={[styles.trendBarLabel, { color: theme.colors.textSecondary }]}>
              {index === 6 ? 'Today' : `${6-index}d`}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
        Daily average: {analytics.avgDaily.toFixed(1)} todos
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              Analytics Dashboard
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Your productivity insights
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
          >
            <Icon name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Period Selector */}
          <PeriodSelector />

          {/* Overview Stats */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Completion Rate"
              value={`${analytics.completionRate.toFixed(1)}%`}
              icon="analytics"
              color="#10B981"
              trend={analytics.trend}
            />
            <StatCard
              title="Completed"
              value={analytics.totalCompleted}
              subtitle={`${analytics.totalActive} active`}
              icon="check-circle"
              color="#3B82F6"
            />

          </View>

          {/* Priority Breakdown */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Priority Breakdown
            </Text>
            <View style={styles.priorityGrid}>
              {Object.entries(analytics.priorityStats).map(([priority, stat]) => (
                <View key={priority} style={[styles.priorityCard, { borderColor: theme.colors.border }]}>
                  <Text style={[styles.priorityTitle, { color: theme.colors.textPrimary }]}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                  <Text style={[styles.priorityValue, { 
                    color: priority === 'high' ? '#EF4444' : 
                           priority === 'medium' ? '#F59E0B' : '#10B981' 
                  }]}>
                    {stat.completed}/{stat.total}
                  </Text>
                  <Text style={[styles.priorityRate, { color: theme.colors.textSecondary }]}>
                    {stat.completionRate.toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Charts */}
          <CategoryChart />
          <TimeChart />
          <TrendChart />

          {/* Insights */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              📊 Insights
            </Text>
            <View style={styles.insightsList}>
              <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                • You're most productive at {analytics.peakHour}:00
              </Text>
              <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                • {analytics.peakDay} is your most productive day
              </Text>
              <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                • Your completion rate is {analytics.completionRate > 70 ? 'excellent' : analytics.completionRate > 50 ? 'good' : 'could improve'}
              </Text>
              {analytics.trend === 'up' && (
                <Text style={[styles.insightText, { color: '#10B981' }]}>
                  • You're on an upward trend! 📈
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 64) / 2,
    padding: 16,
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  priorityValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  priorityRate: {
    fontSize: 11,
  },
  chartContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  chartSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  categoryChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
    paddingHorizontal: 8,
  },
  categoryBar: {
    alignItems: 'center',
    width: 40,
  },
  categoryBarFill: {
    width: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBarLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  categoryBarValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 2,
    paddingHorizontal: 8,
  },
  timeBar: {
    alignItems: 'center',
    width: 24,
  },
  timeBarFill: {
    width: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  timeBarLabel: {
    fontSize: 9,
    transform: [{ rotate: '-45deg' }],
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 12,
    paddingHorizontal: 8,
  },
  trendBar: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  trendBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  insightsList: {
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AnalyticsDashboard;