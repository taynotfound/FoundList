import React from 'react';
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
import { useGamification } from '../contexts/GamificationContext';

const { width: screenWidth } = Dimensions.get('window');

const GamificationDashboard = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { stats, getCurrentLevel, getNextLevel, achievements } = useGamification();

  const currentLevel = getCurrentLevel(stats.totalPoints);
  const nextLevel = getNextLevel(stats.totalPoints);
  const progressPercent = nextLevel 
    ? ((stats.totalPoints - currentLevel.pointsRequired) / (nextLevel.pointsRequired - currentLevel.pointsRequired)) * 100
    : 100;

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
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
    </View>
  );

  const AchievementCard = ({ achievement, isLocked = false }) => (
    <View style={[
      styles.achievementCard, 
      { 
        backgroundColor: isLocked ? theme.colors.surface + '60' : theme.colors.surface,
        borderColor: isLocked ? theme.colors.border : '#FFD700'
      }
    ]}>
      <Text style={[styles.achievementIcon, { opacity: isLocked ? 0.4 : 1 }]}>
        {achievement.icon}
      </Text>
      <Text style={[
        styles.achievementTitle, 
        { 
          color: isLocked ? theme.colors.textSecondary : theme.colors.textPrimary,
          opacity: isLocked ? 0.6 : 1
        }
      ]}>
        {achievement.title}
      </Text>
      <Text style={[
        styles.achievementDesc, 
        { 
          color: theme.colors.textSecondary,
          opacity: isLocked ? 0.5 : 0.8
        }
      ]}>
        {achievement.description}
      </Text>
      <View style={[styles.achievementPoints, { backgroundColor: isLocked ? theme.colors.border : '#FFD700' + '20' }]}>
        <Text style={[styles.pointsText, { color: isLocked ? theme.colors.textSecondary : '#FFD700' }]}>
          {achievement.points}pt
        </Text>
      </View>
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
              Progress Dashboard
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Track your productivity journey
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
          {/* Level Progress */}
          <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.levelHeader}>
              <View style={[styles.levelBadge, { backgroundColor: currentLevel.color + '20' }]}>
                <Text style={[styles.levelNumber, { color: currentLevel.color }]}>
                  {currentLevel.level}
                </Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={[styles.levelTitle, { color: theme.colors.textPrimary }]}>
                  {currentLevel.title}
                </Text>
                <Text style={[styles.levelPoints, { color: theme.colors.textSecondary }]}>
                  {stats.totalPoints} points
                </Text>
              </View>
            </View>
            
            {nextLevel && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                    Progress to {nextLevel.title}
                  </Text>
                  <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                    {nextLevel.pointsRequired - stats.totalPoints} points to go
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: nextLevel.color,
                        width: `${Math.min(progressPercent, 100)}%`
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>

          {/* Stats Grid */}
          <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Statistics
            </Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Points"
                value={stats.totalPoints}
                icon="stars"
                color="#FFD700"
              />
              <StatCard
                title="Completed"
                value={stats.totalCompleted}
                icon="check-circle"
                color="#10B981"
              />
              <StatCard
                title="Current Streak"
                value={`${stats.currentStreak} days`}
                icon="local-fire-department"
                color="#F59E0B"
                subtitle={stats.longestStreak > stats.currentStreak ? `Best: ${stats.longestStreak}` : undefined}
              />
              <StatCard
                title="Achievements"
                value={`${unlockedAchievements.length}/${achievements.length}`}
                icon="emoji-events"
                color="#8B5CF6"
              />
            </View>
          </View>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                🏆 Unlocked Achievements ({unlockedAchievements.length})
              </Text>
              <View style={styles.achievementsGrid}>
                {unlockedAchievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </View>
            </View>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                🔒 Locked Achievements ({lockedAchievements.length})
              </Text>
              <View style={styles.achievementsGrid}>
                {lockedAchievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} isLocked />
                ))}
              </View>
            </View>
          )}
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
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  
  // Level Styles
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  levelPoints: {
    fontSize: 16,
    marginTop: 2,
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Stats Styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 64) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },

  // Achievement Styles
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (screenWidth - 64) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementPoints: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default GamificationDashboard;