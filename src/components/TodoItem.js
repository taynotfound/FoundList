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
  const { completeTodo, deleteTodo, restoreTodo } = useTodos();
  const translateX = useRef(new Animated.Value(0)).current;
  const isActionTriggered = useRef(false);
  
  // Animation values for entrance and interactions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [pressScale] = useState(new Animated.Value(1));

  // Mount animation
  useEffect(() => {
    const fadeIn = createFadeInAnimation(fadeAnim, 300, index * 50);
    const scaleIn = createScaleAnimation(scaleAnim, 1, 400);
    
    Animated.parallel([fadeIn, scaleIn]).start();
  }, []);

  // Press animation
  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
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
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays < 7) return `Due in ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
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
                borderColor: theme.colors.border,
                transform: [{ translateX }],
              },
              isOverdue() && { borderColor: theme.colors.destructive, borderWidth: 2 },
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
              onPress={onPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.9}
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
                    color={isOverdue() ? theme.colors.destructive : theme.colors.accent} 
                  />
                  <Text
                    style={[
                      styles.dueDateText,
                      { 
                        color: isOverdue() ? theme.colors.destructive : theme.colors.accent,
                        fontWeight: isOverdue() ? '600' : '500',
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
});

export default TodoItem;