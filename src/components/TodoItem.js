import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createFadeInAnimation, createScaleAnimation, createShakeAnimation } from '../utils/animations';
import { PriorityBadge, PriorityIcon } from './PrioritySelector';
import { CategoryBadge } from './CategorySelector';
import { TagBadge } from './TagsInput';

import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120; // Increased threshold for more deliberate swipes

const TodoItem = ({ todo, onPress, isCompleted = false, index = 0 }) => {
  const { theme } = useTheme();
  const { completeTodo, deleteTodo, restoreTodo, updateTodo } = useTodos();
  const translateX = useRef(new Animated.Value(0)).current;
  const isActionTriggered = useRef(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  // Animation values for entrance and interactions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [pressScale] = useState(new Animated.Value(1));

  const isDueSoon = () => {
    if (!todo.dueDate || isCompleted) return false;
    const date = new Date(todo.dueDate);
    const now = new Date();
    const timeDiff = date - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Due soon if within 3 hours and in the future
    return hoursDiff > 0 && hoursDiff <= 3;
  };

  // Mount animation
  useEffect(() => {
    const fadeIn = createFadeInAnimation(fadeAnim, 300, index * 50);
    const scaleIn = createScaleAnimation(scaleAnim, 1, 400);
    
    Animated.parallel([fadeIn, scaleIn]).start();

    // Start pulsing animation for items due soon
    if (isDueSoon()) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [isDueSoon()]);

  // Press animation
  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

    // Start long press timer
    const timer = setTimeout(() => {
      if (!isCompleted) {
        setShowQuickActions(true);
        // Haptic feedback would go here if available
      }
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.BEGAN) {
      isActionTriggered.current = false;
    }
    
    if (nativeEvent.state === State.END || nativeEvent.state === State.CANCELLED) {
      const { translationX: finalTranslation, velocityX } = nativeEvent;

      // Only trigger action if swipe is significant AND has sufficient velocity
      const isSignificantSwipe = Math.abs(finalTranslation) > SWIPE_THRESHOLD;
      const hasSwipeVelocity = Math.abs(velocityX) > 500; // Minimum velocity requirement
      
      if (isSignificantSwipe && hasSwipeVelocity && !isActionTriggered.current) {
        isActionTriggered.current = true;
        
        if (finalTranslation > 0) {
          // Swipe right - complete/restore with animation
          Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            handleRightSwipe();
          });
        } else {
          // Swipe left - delete with animation
          Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            handleLeftSwipe();
          });
        }
      } else {
        // Return to original position with spring animation
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const handleRightSwipe = () => {
    Animated.timing(translateX, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      if (isCompleted) {
        restoreTodo(todo.id);
      } else {
        completeTodo(todo.id);
      }
      setTimeout(() => {
        resetPosition();
      }, 100);
    });
  };

  const handleLeftSwipe = () => {
    Animated.timing(translateX, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      deleteTodo(todo.id, isCompleted);
      setTimeout(() => {
        resetPosition();
      }, 100);
    });
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const getSwipeActions = () => {
    const leftAction = {
      color: theme.colors.destructive,
      icon: 'delete',
      label: 'Delete',
    };

    const rightAction = isCompleted
      ? {
          color: theme.colors.accent,
          icon: 'restore',
          label: 'Restore',
        }
      : {
          color: theme.colors.success,
          icon: 'check',
          label: 'Complete',
        };

    return { leftAction, rightAction };
  };

  const { leftAction, rightAction } = getSwipeActions();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = () => {
    if (!todo.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(todo.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return !isCompleted && dueDate < today;
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    
    // Compare dates only (ignore time) for day calculations
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = dateOnly - todayOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // For today's tasks, show more specific time information
    if (diffDays === 0) {
      const timeDiff = date - now;
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      
      if (timeDiff < 0) {
        // Past due today
        const absMinutes = Math.abs(minutesDiff);
        const absHours = Math.abs(hoursDiff);
        if (absHours >= 1) {
          return `Due ${absHours} hour${absHours !== 1 ? 's' : ''} ago`;
        } else {
          return `Due ${absMinutes} minute${absMinutes !== 1 ? 's' : ''} ago`;
        }
      } else {
        // Future due today
        if (hoursDiff >= 1) {
          return `Due today in ${hoursDiff} hour${hoursDiff !== 1 ? 's' : ''}`;
        } else if (minutesDiff > 0) {
          return `Due today in ${minutesDiff} minute${minutesDiff !== 1 ? 's' : ''}`;
        } else {
          return 'Due now';
        }
      }
    }
    
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays < 7) return `Due in ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Quick Actions handlers
  const handleQuickAction = (action) => {
    setShowQuickActions(false);
    
    switch (action) {
      case 'complete':
        completeTodo(todo.id);
        break;
      case 'delete':
        Alert.alert(
          'Delete Todo',
          'Are you sure you want to delete this todo?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(todo.id) },
          ]
        );
        break;
      case 'duplicate':
        const duplicatedTodo = {
          ...todo,
          id: Date.now().toString(),
          title: `${todo.title} (Copy)`,
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        // This would require adding a duplicateTodo function to TodoContext
        // For now, we'll use updateTodo to simulate duplication
        updateTodo(duplicatedTodo.id, duplicatedTodo);
        break;
      case 'reschedule':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        updateTodo(todo.id, { ...todo, dueDate: tomorrow.toISOString() });
        break;
      case 'priority':
        const priorities = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(todo.priority || 'medium');
        const nextPriority = priorities[(currentIndex + 1) % priorities.length];
        updateTodo(todo.id, { ...todo, priority: nextPriority });
        break;
      case 'edit':
        onPress?.();
        break;
    }
  };

  const QuickActionsModal = () => {
    const quickActions = [
      { id: 'complete', icon: 'check-circle', label: 'Complete', color: theme.colors.success },
      { id: 'edit', icon: 'edit', label: 'Edit', color: theme.colors.accent },
      { id: 'duplicate', icon: 'content-copy', label: 'Duplicate', color: theme.colors.textSecondary },
      { id: 'reschedule', icon: 'schedule', label: 'Reschedule', color: theme.colors.warning },
      { id: 'priority', icon: 'flag', label: 'Priority', color: theme.colors.accent },
      { id: 'delete', icon: 'delete', label: 'Delete', color: theme.colors.destructive },
    ];

    return (
      <Modal
        visible={showQuickActions}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowQuickActions(false)}
      >
        <TouchableOpacity
          style={styles.quickActionsOverlay}
          activeOpacity={1}
          onPress={() => setShowQuickActions(false)}
        >
          <View style={[styles.quickActionsModal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.quickActionsHeader}>
              <Text style={[styles.quickActionsTitle, { color: theme.colors.textPrimary }]}>
                Quick Actions
              </Text>
              <Text style={[styles.quickActionsTodoTitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {todo.title}
              </Text>
            </View>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionButton, { borderColor: theme.colors.border }]}
                  onPress={() => handleQuickAction(action.id)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                    <Icon name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: theme.colors.textPrimary }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.quickActionsCancelButton, { backgroundColor: theme.colors.background }]}
              onPress={() => setShowQuickActions(false)}
            >
              <Text style={[styles.quickActionsCancelText, { color: theme.colors.textPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <>
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateX: shakeAnim },
              { scale: pressScale },
            ],
          }
        ]}
      >
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-15, 15]} // Require more horizontal movement before activating
        failOffsetY={[-30, 30]} // More tolerance for vertical movement
        shouldCancelWhenOutside={true} // Cancel if gesture goes outside component
      >
        <Animated.View style={styles.swipeContainer}>
          {/* Left Action (Delete) */}
          <Animated.View
            style={[
              styles.leftAction,
              { backgroundColor: leftAction.color },
              {
                opacity: translateX.interpolate({
                  inputRange: [-150, -SWIPE_THRESHOLD, 0],
                  outputRange: [1, 0.8, 0],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <Icon name={leftAction.icon} size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>{leftAction.label}</Text>
          </Animated.View>

          {/* Right Action (Complete/Restore) */}
          <Animated.View
            style={[
              styles.rightAction,
              { backgroundColor: rightAction.color },
              {
                opacity: translateX.interpolate({
                  inputRange: [0, SWIPE_THRESHOLD, 150],
                  outputRange: [0, 0.8, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <Icon name={rightAction.icon} size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </Animated.View>

          {/* Main Todo Item */}
          <Animated.View
            style={[
              styles.todoItem,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isDueSoon() 
                  ? theme.colors.destructive 
                  : isOverdue() 
                    ? theme.colors.destructive 
                    : theme.colors.border,
                borderWidth: isDueSoon() || isOverdue() ? 2 : 1,
                transform: [{ translateX }, { scale: isDueSoon() ? pulseAnim : 1 }],
              },
            ]}
          >
            {/* Overdue Banner */}
            {isOverdue() && (
              <View style={[styles.overdueBanner, { backgroundColor: theme.colors.destructive }]}>
                <Icon name="warning" size={16} color="#FFFFFF" />
                <Text style={styles.overdueText}>OVERDUE</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.todoContent}
              onPress={isCompleted ? undefined : onPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={isCompleted ? 1 : 0.9}
            >
              <View style={styles.todoHeader}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.todoTitle,
                      {
                        color: theme.colors.textPrimary,
                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                        opacity: isCompleted ? 0.6 : 1,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {todo.title}
                  </Text>
                  {/* Priority Icon */}
                  {todo.priority && (
                    <PriorityIcon priority={todo.priority} size={16} />
                  )}
                </View>
                <Text
                  style={[
                    styles.todoDate,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {formatDate(isCompleted ? todo.completedAt : todo.createdAt)}
                </Text>
              </View>

              {todo.shortDesc ? (
                <Text
                  style={[
                    styles.todoDesc,
                    {
                      color: theme.colors.textSecondary,
                      opacity: isCompleted ? 0.5 : 1,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {todo.shortDesc}
                </Text>
              ) : null}

              {/* Image Preview */}
              {todo.images && todo.images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagePreviewContainer}
                  contentContainerStyle={styles.imagePreviewContent}
                >
                  {todo.images.slice(0, 3).map((image, index) => (
                    <View key={image.id || index} style={styles.imagePreview}>
                      <Image 
                        source={{ uri: image.uri }} 
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                  {todo.images.length > 3 && (
                    <View style={[styles.imagePreview, styles.moreImagesOverlay, { backgroundColor: theme.colors.background }]}>
                      <Text style={[styles.moreImagesText, { color: theme.colors.textPrimary }]}>
                        +{todo.images.length - 3}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}

              {/* Due Date */}
              {todo.dueDate && (
                <View style={styles.dueDateContainer}>
                  <Icon 
                    name="schedule" 
                    size={14} 
                    color={isOverdue() || isDueSoon() ? theme.colors.destructive : theme.colors.accent} 
                  />
                  <Text
                    style={[
                      styles.dueDateText,
                      { 
                        color: isOverdue() || isDueSoon() ? theme.colors.destructive : theme.colors.accent,
                        fontWeight: isOverdue() || isDueSoon() ? '600' : '500',
                      },
                    ]}
                  >
                    {formatDueDate(todo.dueDate)}
                  </Text>
                </View>
              )}

              <View style={styles.todoFooter}>
                <View style={styles.footerLeft}>
                  {/* Priority Badge */}
                  {todo.priority && (
                    <PriorityBadge priority={todo.priority} size="small" />
                  )}
                  {/* Category Badge */}
                  {todo.category && (
                    <CategoryBadge category={todo.category} size="small" showText={false} />
                  )}
                  {/* Tags */}
                  {todo.tags && todo.tags.length > 0 && (
                    <>
                      {todo.tags.slice(0, 2).map((tag, index) => (
                        <TagBadge key={`${tag}-${index}`} tag={tag} size="small" />
                      ))}
                      {todo.tags.length > 2 && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.background }]}>
                          <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                            +{todo.tags.length - 2}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                  {/* Details Badge */}
                  {todo.longDesc ? (
                    <View style={[styles.badge, { backgroundColor: theme.colors.accentLight }]}>
                      <Text style={[styles.badgeText, { color: theme.colors.accent }]}>
                        Details
                      </Text>
                    </View>
                  ) : null}
                </View>
                
                <Icon
                  name="chevron-right"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>

    {/* Quick Actions Modal */}
    <QuickActionsModal />
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    position: 'relative',
  },
  swipeContainer: {
    position: 'relative',
  },
  leftAction: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderRadius: 16,
    zIndex: -1,
  },
  rightAction: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 16,
    zIndex: -1,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  todoItem: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 2,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  overdueBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    zIndex: 1,
    gap: 4,
  },
  overdueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  todoContent: {
    padding: 16,
    paddingTop: 16,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
    gap: 8,
  },
  todoTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  todoDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  todoDesc: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  dueDateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  todoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  imagePreviewContent: {
    paddingRight: 16,
  },
  imagePreview: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 6,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  moreImagesOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  moreImagesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Quick Actions Modal Styles
  quickActionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quickActionsModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  quickActionsHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickActionsTodoTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionsCancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionsCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TodoItem;