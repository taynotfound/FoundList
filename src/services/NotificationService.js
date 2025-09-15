import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.locationWatching = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Request location permissions for location-based reminders
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        this.locationPermissionGranted = backgroundStatus === 'granted';
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Schedule smart notifications for a todo
  async scheduleSmartNotifications(todo) {
    if (!this.isInitialized) await this.initialize();

    const notifications = [];

    // 1. Due date notifications (escalating)
    if (todo.dueDate) {
      const dueDate = new Date(todo.dueDate);
      const now = new Date();

      // Calculate notification times
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Schedule escalating notifications
      if (hoursDiff > 24) {
        // 24 hours before
        notifications.push(await this.scheduleNotification({
          title: 'Upcoming Task',
          body: `"${todo.title}" is due tomorrow`,
          data: { todoId: todo.id, type: 'due_reminder' },
          trigger: { seconds: Math.max(1, (hoursDiff - 24) * 3600) },
        }));
      }

      if (hoursDiff > 2) {
        // 2 hours before
        notifications.push(await this.scheduleNotification({
          title: 'Task Due Soon',
          body: `"${todo.title}" is due in 2 hours`,
          data: { todoId: todo.id, type: 'due_warning' },
          trigger: { seconds: Math.max(1, (hoursDiff - 2) * 3600) },
        }));
      }

      if (hoursDiff > 0.25) {
        // 15 minutes before
        notifications.push(await this.scheduleNotification({
          title: '⚠️ Task Due Very Soon!',
          body: `"${todo.title}" is due in 15 minutes`,
          data: { todoId: todo.id, type: 'urgent_warning' },
          trigger: { seconds: Math.max(1, (hoursDiff - 0.25) * 3600) },
        }));
      }
    }

    // 2. Smart time-based suggestions (based on user patterns)
    const optimalTimes = await this.getOptimalNotificationTimes(todo);
    for (const time of optimalTimes) {
      notifications.push(await this.scheduleNotification({
        title: 'Perfect Time for This Task',
        body: `Based on your patterns, now might be a good time for "${todo.title}"`,
        data: { todoId: todo.id, type: 'smart_suggestion' },
        trigger: time,
      }));
    }

    // 3. Location-based reminders
    if (todo.location && this.locationPermissionGranted) {
      await this.setupLocationReminder(todo);
    }

    return notifications.filter(Boolean);
  }

  // Schedule a single notification
  async scheduleNotification({ title, body, data, trigger }) {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });
      return identifier;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  // Get optimal notification times based on user patterns
  async getOptimalNotificationTimes(todo) {
    try {
      const patterns = await AsyncStorage.getItem('userProductivityPatterns');
      if (!patterns) return [];

      const parsed = JSON.parse(patterns);
      const categoryPattern = parsed.byCategory?.[todo.category];
      const priorityPattern = parsed.byPriority?.[todo.priority];

      const times = [];
      const now = new Date();

      // Suggest based on category completion patterns
      if (categoryPattern?.peakHours) {
        for (const hour of categoryPattern.peakHours.slice(0, 2)) {
          const notificationTime = new Date();
          notificationTime.setHours(hour, 0, 0, 0);
          
          if (notificationTime > now) {
            times.push({
              seconds: Math.floor((notificationTime.getTime() - now.getTime()) / 1000)
            });
          }
        }
      }

      return times;
    } catch (error) {
      console.error('Failed to get optimal times:', error);
      return [];
    }
  }

  // Setup location-based reminders
  async setupLocationReminder(todo) {
    if (!this.locationPermissionGranted) return;

    try {
      // Define location trigger
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 100, // Update every 100 meters
        deferredUpdatesInterval: 300000, // 5 minutes
        showsBackgroundLocationIndicator: false,
      });

      // Store location reminder
      const reminders = await AsyncStorage.getItem('locationReminders') || '{}';
      const parsed = JSON.parse(reminders);
      parsed[todo.id] = {
        todoId: todo.id,
        title: todo.title,
        location: todo.location,
        radius: todo.locationRadius || 200, // Default 200m radius
      };
      await AsyncStorage.setItem('locationReminders', JSON.stringify(parsed));
    } catch (error) {
      console.error('Failed to setup location reminder:', error);
    }
  }

  // Daily planning notification
  async scheduleDailyPlanningNotification() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // 8 AM tomorrow

    return await this.scheduleNotification({
      title: 'Good Morning! 🌅',
      body: 'Ready to plan your productive day?',
      data: { type: 'daily_planning' },
      trigger: {
        seconds: Math.floor((tomorrow.getTime() - now.getTime()) / 1000)
      },
    });
  }

  // Evening reflection notification
  async scheduleEveningReflection() {
    const now = new Date();
    const today = new Date(now);
    today.setHours(20, 0, 0, 0); // 8 PM today

    if (today <= now) {
      today.setDate(today.getDate() + 1); // Tomorrow if past 8 PM
    }

    return await this.scheduleNotification({
      title: 'Day Reflection 🌙',
      body: 'How was your productivity today?',
      data: { type: 'evening_reflection' },
      trigger: {
        seconds: Math.floor((today.getTime() - now.getTime()) / 1000)
      },
    });
  }

  // Cancel all notifications for a todo
  async cancelTodoNotifications(todoId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const todoNotifications = scheduledNotifications.filter(
        notif => notif.content.data?.todoId === todoId
      );

      for (const notif of todoNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }

      // Remove location reminders
      const reminders = await AsyncStorage.getItem('locationReminders') || '{}';
      const parsed = JSON.parse(reminders);
      delete parsed[todoId];
      await AsyncStorage.setItem('locationReminders', JSON.stringify(parsed));
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  // Handle notification responses
  async handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    switch (data.type) {
      case 'due_reminder':
      case 'due_warning':
      case 'urgent_warning':
        // Open todo detail
        return { action: 'openTodo', todoId: data.todoId };
      
      case 'smart_suggestion':
        // Show quick actions
        return { action: 'quickActions', todoId: data.todoId };
      
      case 'daily_planning':
        // Open today's todos
        return { action: 'openToday' };
      
      case 'evening_reflection':
        // Open analytics
        return { action: 'openAnalytics' };
      
      default:
        return null;
    }
  }

  // Update user productivity patterns
  async updateProductivityPatterns(completionData) {
    try {
      const patterns = await AsyncStorage.getItem('userProductivityPatterns') || '{}';
      const parsed = JSON.parse(patterns);

      const hour = new Date(completionData.completedAt).getHours();
      const category = completionData.category;
      const priority = completionData.priority;

      // Update category patterns
      if (!parsed.byCategory) parsed.byCategory = {};
      if (!parsed.byCategory[category]) {
        parsed.byCategory[category] = { hourCounts: {}, peakHours: [] };
      }
      
      const categoryData = parsed.byCategory[category];
      categoryData.hourCounts[hour] = (categoryData.hourCounts[hour] || 0) + 1;
      
      // Update peak hours (top 3 hours for this category)
      const sortedHours = Object.entries(categoryData.hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));
      categoryData.peakHours = sortedHours;

      // Update priority patterns
      if (!parsed.byPriority) parsed.byPriority = {};
      if (!parsed.byPriority[priority]) {
        parsed.byPriority[priority] = { hourCounts: {}, peakHours: [] };
      }
      
      const priorityData = parsed.byPriority[priority];
      priorityData.hourCounts[hour] = (priorityData.hourCounts[hour] || 0) + 1;
      
      const sortedPriorityHours = Object.entries(priorityData.hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));
      priorityData.peakHours = sortedPriorityHours;

      await AsyncStorage.setItem('userProductivityPatterns', JSON.stringify(parsed));
    } catch (error) {
      console.error('Failed to update productivity patterns:', error);
    }
  }
}

// Background location task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      await checkLocationReminders(location);
    }
  }
});

// Check if user is near any location reminders
async function checkLocationReminders(currentLocation) {
  try {
    const reminders = await AsyncStorage.getItem('locationReminders') || '{}';
    const parsed = JSON.parse(reminders);

    for (const [todoId, reminder] of Object.entries(parsed)) {
      if (reminder.location) {
        const distance = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          reminder.location.latitude,
          reminder.location.longitude
        );

        if (distance <= reminder.radius) {
          // Trigger location-based notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Location Reminder 📍',
              body: `You're near the location for: "${reminder.title}"`,
              data: { todoId, type: 'location_reminder' },
              sound: 'default',
            },
            trigger: null, // Immediate
          });

          // Remove reminder to avoid spam
          delete parsed[todoId];
          await AsyncStorage.setItem('locationReminders', JSON.stringify(parsed));
        }
      }
    }
  } catch (error) {
    console.error('Failed to check location reminders:', error);
  }
}

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

export default new NotificationService();