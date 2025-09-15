import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

// Achievement definitions
const ACHIEVEMENTS = {
  firstTodo: {
    id: 'firstTodo',
    title: 'Getting Started',
    description: 'Create your first todo',
    icon: '🎯',
    points: 10,
    unlocked: false,
  },
  streak3: {
    id: 'streak3',
    title: 'On Fire!',
    description: 'Complete todos for 3 days in a row',
    icon: '🔥',
    points: 25,
    unlocked: false,
  },
  streak7: {
    id: 'streak7',
    title: 'Weekly Warrior',
    description: 'Complete todos for 7 days in a row',
    icon: '⚡',
    points: 50,
    unlocked: false,
  },
  streak30: {
    id: 'streak30',
    title: 'Monthly Master',
    description: 'Complete todos for 30 days in a row',
    icon: '👑',
    points: 200,
    unlocked: false,
  },
  complete10: {
    id: 'complete10',
    title: 'Task Crusher',
    description: 'Complete 10 todos',
    icon: '💪',
    points: 30,
    unlocked: false,
  },
  complete50: {
    id: 'complete50',
    title: 'Productivity Pro',
    description: 'Complete 50 todos',
    icon: '🚀',
    points: 100,
    unlocked: false,
  },
  complete100: {
    id: 'complete100',
    title: 'Century Club',
    description: 'Complete 100 todos',
    icon: '🏆',
    points: 250,
    unlocked: false,
  },
  perfectDay: {
    id: 'perfectDay',
    title: 'Perfect Day',
    description: 'Complete all todos scheduled for a day',
    icon: '⭐',
    points: 20,
    unlocked: false,
  },
  earlyBird: {
    id: 'earlyBird',
    title: 'Early Bird',
    description: 'Complete a todo before 8 AM',
    icon: '🌅',
    points: 15,
    unlocked: false,
  },
  nightOwl: {
    id: 'nightOwl',
    title: 'Night Owl',
    description: 'Complete a todo after 10 PM',
    icon: '🦉',
    points: 15,
    unlocked: false,
  },
  categoryMaster: {
    id: 'categoryMaster',
    title: 'Category Master',
    description: 'Use all available categories',
    icon: '🎨',
    points: 40,
    unlocked: false,
  },
  speedDemon: {
    id: 'speedDemon',
    title: 'Speed Demon',
    description: 'Complete 5 todos in one day',
    icon: '💨',
    points: 35,
    unlocked: false,
  },
};

// Level thresholds and rewards
const LEVELS = [
  { level: 1, pointsRequired: 0, title: 'Beginner', color: '#94A3B8' },
  { level: 2, pointsRequired: 50, title: 'Novice', color: '#10B981' },
  { level: 3, pointsRequired: 150, title: 'Apprentice', color: '#3B82F6' },
  { level: 4, pointsRequired: 300, title: 'Skilled', color: '#8B5CF6' },
  { level: 5, pointsRequired: 500, title: 'Expert', color: '#F59E0B' },
  { level: 6, pointsRequired: 750, title: 'Master', color: '#EF4444' },
  { level: 7, pointsRequired: 1000, title: 'Legend', color: '#EC4899' },
  { level: 8, pointsRequired: 1500, title: 'Champion', color: '#F97316' },
  { level: 9, pointsRequired: 2000, title: 'Hero', color: '#84CC16' },
  { level: 10, pointsRequired: 3000, title: 'Grandmaster', color: '#FFD700' },
];

export const GamificationProvider = ({ children }) => {
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    lastCompletionDate: null,
    achievements: { ...ACHIEVEMENTS },
    streakDates: [], // Array of dates when todos were completed
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('gamificationStats');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setStats(prevStats => ({
          ...prevStats,
          ...parsed,
          achievements: { ...ACHIEVEMENTS, ...parsed.achievements },
        }));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading gamification stats:', error);
      setIsLoading(false);
    }
  };

  const saveStats = async (newStats) => {
    try {
      await AsyncStorage.setItem('gamificationStats', JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Error saving gamification stats:', error);
    }
  };

  const getCurrentLevel = (points) => {
    let currentLevel = LEVELS[0];
    for (const level of LEVELS) {
      if (points >= level.pointsRequired) {
        currentLevel = level;
      } else {
        break;
      }
    }
    return currentLevel;
  };

  const getNextLevel = (points) => {
    const currentLevel = getCurrentLevel(points);
    const currentIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
    return LEVELS[currentIndex + 1] || null;
  };

  const awardPoints = (points, reason) => {
    const newTotalPoints = stats.totalPoints + points;
    const oldLevel = getCurrentLevel(stats.totalPoints);
    const newLevel = getCurrentLevel(newTotalPoints);

    Toast.show({
      type: 'success',
      text1: `+${points} Points!`,
      text2: reason,
      position: 'top',
      visibilityTime: 2000,
    });

    // Check for level up
    if (newLevel.level > oldLevel.level) {
      setTimeout(() => {
        Toast.show({
          type: 'info',
          text1: '🎉 Level Up!',
          text2: `You reached ${newLevel.title} (Level ${newLevel.level})`,
          position: 'top',
          visibilityTime: 3000,
        });
      }, 2200);
    }

    return newTotalPoints;
  };

  const unlockAchievement = (achievementId) => {
    if (!stats.achievements[achievementId] || stats.achievements[achievementId].unlocked) {
      return false; // Already unlocked or doesn't exist
    }

    const achievement = ACHIEVEMENTS[achievementId];
    const newAchievements = {
      ...stats.achievements,
      [achievementId]: { ...achievement, unlocked: true },
    };

    Toast.show({
      type: 'info',
      text1: `🏆 Achievement Unlocked!`,
      text2: `${achievement.icon} ${achievement.title}`,
      position: 'top',
      visibilityTime: 3000,
    });

    return { newAchievements, points: achievement.points };
  };

  const updateStreak = (completionDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completion = new Date(completionDate);
    completion.setHours(0, 0, 0, 0);

    const lastDate = stats.lastCompletionDate ? new Date(stats.lastCompletionDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    let newCurrentStreak = stats.currentStreak;
    let newStreakDates = [...stats.streakDates];

    // If completing on the same day, don't update streak
    if (lastDate && completion.getTime() === lastDate.getTime()) {
      return { newCurrentStreak, newStreakDates };
    }

    // Add today to streak dates if not already there
    const dateString = completion.toISOString().split('T')[0];
    if (!newStreakDates.includes(dateString)) {
      newStreakDates.push(dateString);
    }

    // Check if this continues the streak
    if (lastDate) {
      const daysDiff = Math.floor((completion.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day - continue streak
        newCurrentStreak += 1;
      } else if (daysDiff > 1) {
        // Gap in streak - reset
        newCurrentStreak = 1;
      }
      // daysDiff === 0 means same day, streak unchanged
    } else {
      // First completion
      newCurrentStreak = 1;
    }

    return { newCurrentStreak, newStreakDates };
  };

  const onTodoCompleted = async (todo) => {
    const completionDate = new Date();
    const hour = completionDate.getHours();
    
    let newStats = { ...stats };
    let totalNewPoints = 0;

    // Base points for completion
    const basePoints = todo.priority === 'high' ? 15 : todo.priority === 'medium' ? 10 : 5;
    totalNewPoints += basePoints;

    // Update basic stats
    newStats.totalCompleted += 1;
    newStats.lastCompletionDate = completionDate.toISOString();

    // Update streak
    const { newCurrentStreak, newStreakDates } = updateStreak(completionDate);
    newStats.currentStreak = newCurrentStreak;
    newStats.streakDates = newStreakDates;
    newStats.longestStreak = Math.max(newStats.longestStreak, newCurrentStreak);

    // Check achievements
    const achievementsToCheck = [];

    // First todo
    if (newStats.totalCompleted === 1) {
      achievementsToCheck.push('firstTodo');
    }

    // Completion milestones
    if (newStats.totalCompleted === 10) achievementsToCheck.push('complete10');
    if (newStats.totalCompleted === 50) achievementsToCheck.push('complete50');
    if (newStats.totalCompleted === 100) achievementsToCheck.push('complete100');

    // Streak achievements
    if (newCurrentStreak === 3) achievementsToCheck.push('streak3');
    if (newCurrentStreak === 7) achievementsToCheck.push('streak7');
    if (newCurrentStreak === 30) achievementsToCheck.push('streak30');

    // Time-based achievements
    if (hour < 8) achievementsToCheck.push('earlyBird');
    if (hour >= 22) achievementsToCheck.push('nightOwl');

    // Process achievements
    for (const achievementId of achievementsToCheck) {
      const result = unlockAchievement(achievementId);
      if (result) {
        newStats.achievements = result.newAchievements;
        totalNewPoints += result.points;
      }
    }

    // Award all points
    newStats.totalPoints = awardPoints(totalNewPoints, `Completed: ${todo.title}`);
    newStats.level = getCurrentLevel(newStats.totalPoints).level;

    await saveStats(newStats);
  };

  const onTodoCreated = async () => {
    // Small reward for creating todos
    const newStats = { ...stats };
    const points = 2;
    newStats.totalPoints = awardPoints(points, 'Created new todo');
    newStats.level = getCurrentLevel(newStats.totalPoints).level;
    
    await saveStats(newStats);
  };

  const checkPerfectDay = async (todosForDate) => {
    const allCompleted = todosForDate.every(todo => todo.isCompleted);
    if (allCompleted && todosForDate.length > 0) {
      const result = unlockAchievement('perfectDay');
      if (result) {
        const newStats = { ...stats };
        newStats.achievements = result.newAchievements;
        newStats.totalPoints = awardPoints(result.points, 'Perfect day achieved!');
        newStats.level = getCurrentLevel(newStats.totalPoints).level;
        await saveStats(newStats);
      }
    }
  };

  const checkSpeedDemon = async (completionsToday) => {
    if (completionsToday >= 5) {
      const result = unlockAchievement('speedDemon');
      if (result) {
        const newStats = { ...stats };
        newStats.achievements = result.newAchievements;
        newStats.totalPoints = awardPoints(result.points, 'Speed demon unlocked!');
        newStats.level = getCurrentLevel(newStats.totalPoints).level;
        await saveStats(newStats);
      }
    }
  };

  const value = {
    stats,
    isLoading,
    getCurrentLevel,
    getNextLevel,
    onTodoCompleted,
    onTodoCreated,
    checkPerfectDay,
    checkSpeedDemon,
    achievements: Object.values(stats.achievements),
    levels: LEVELS,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export default GamificationProvider;