import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import TodoItem from '../components/TodoItem';
import TodoDetailModal from '../components/TodoDetailModal';

const CalendarScreen = () => {
  const { theme } = useTheme();
  const { todos } = useTodos();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showTodoDetail, setShowTodoDetail] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get previous month's trailing days
    const previousMonth = new Date(year, month - 1, 0);
    const daysInPreviousMonth = previousMonth.getDate();
    
    const days = [];
    
    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPreviousMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, daysInPreviousMonth - i),
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
      });
    }
    
    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day),
      });
    }
    
    return days;
  }, [currentDate]);

  // Get todos for a specific date
  const getTodosForDate = (date) => {
    if (!date) return [];
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const filteredTodos = todos.filter(todo => {
      if (!todo.dueDate) return false;
      
      try {
        const todoDate = new Date(todo.dueDate);
        todoDate.setHours(0, 0, 0, 0);
        return todoDate.getTime() === targetDate.getTime();
      } catch (error) {
        console.error('Invalid date in todo:', todo.dueDate);
        return false;
      }
    });
    
    return filteredTodos;
  };

  // Get todos for selected date
  const selectedDateTodos = selectedDate ? getTodosForDate(selectedDate) : [];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDatePress = (dateData) => {
    setSelectedDate(dateData.date);
    setShowDayModal(true);
  };

  const handleTodoPress = (todo) => {
    setSelectedTodo(todo);
    setShowTodoDetail(true);
  };

  const closeDayModal = () => {
    setShowDayModal(false);
    setSelectedDate(null);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateMonth(-1)}
        >
          <Icon name="chevron-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: theme.colors.textPrimary }]}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateMonth(1)}
        >
          <Icon name="chevron-right" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {dayNames.map((day) => (
            <Text
              key={day}
              style={[styles.dayHeader, { color: theme.colors.textSecondary }]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.daysGrid}>
          {calendarData.map((dateData, index) => {
            const todosForDate = getTodosForDate(dateData.date);
            const hasTodos = todosForDate.length > 0;
            const hasOverdue = todosForDate.some(todo => {
              if (todo.isCompleted) return false;
              
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              try {
                const dueDate = new Date(todo.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate.getTime() < today.getTime();
              } catch (error) {
                return false;
              }
            });

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !dateData.isCurrentMonth && styles.otherMonthDay,
                  isToday(dateData.date) && [styles.todayCell, { backgroundColor: theme.colors.accent }],
                  isSelected(dateData.date) && [styles.selectedCell, { borderColor: theme.colors.accent }],
                ]}
                onPress={() => handleDatePress(dateData)}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: dateData.isCurrentMonth
                        ? isToday(dateData.date)
                          ? theme.colors.surface
                          : theme.colors.textPrimary
                        : theme.colors.textSecondary,
                    },
                    !dateData.isCurrentMonth && { opacity: 0.5 },
                  ]}
                >
                  {dateData.day}
                </Text>
                
                {/* Todo indicators */}
                {hasTodos && (
                  <View style={styles.todosIndicator}>
                    {(() => {
                      // Get the highest priority todo for this date
                      const priorities = ['high', 'medium', 'low'];
                      const highestPriorityTodo = todosForDate.find(todo => 
                        priorities.includes(todo.priority)
                      );
                      
                      // Determine dot color based on priority and overdue status
                      let dotColor = theme.colors.accent; // default
                      
                      if (hasOverdue) {
                        dotColor = theme.colors.destructive; // red for overdue
                      } else if (highestPriorityTodo) {
                        switch (highestPriorityTodo.priority) {
                          case 'high':
                            dotColor = '#FF6B6B'; // bright red for high priority
                            break;
                          case 'medium':
                            dotColor = '#FFB84D'; // orange for medium priority  
                            break;
                          case 'low':
                            dotColor = '#51CF66'; // green for low priority
                            break;
                          default:
                            dotColor = theme.colors.accent;
                        }
                      }
                      
                      return <View style={[styles.todosDot, { backgroundColor: dotColor }]} />;
                    })()}
                    {todosForDate.length > 1 && (
                      <Text style={[styles.todosCount, { color: theme.colors.textSecondary }]}>
                        {todosForDate.length}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Day View Modal */}
      <Modal
        visible={showDayModal}
        transparent
        animationType="slide"
        onRequestClose={closeDayModal}
      >
        <View style={styles.dayModalOverlay}>
          <View style={[styles.dayModalContent, { backgroundColor: theme.colors.surface }]}>
            {/* Modal Header */}
            <View style={[styles.dayModalHeader, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.dayModalTitleContainer}>
                <Text style={[styles.dayModalTitle, { color: theme.colors.textPrimary }]}>
                  {selectedDate && selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={[styles.dayModalSubtitle, { color: theme.colors.textSecondary }]}>
                  {selectedDateTodos.length} {selectedDateTodos.length === 1 ? 'todo' : 'todos'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeDayModal}
                style={[styles.dayModalCloseButton, { backgroundColor: theme.colors.background }]}
              >
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Todos List */}
            <ScrollView 
              style={styles.dayModalTodosList} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dayModalTodosContent}
            >
              {selectedDateTodos.length > 0 ? (
                selectedDateTodos.map((todo) => (
                  <TouchableOpacity
                    key={todo.id}
                    style={[styles.dayModalTodoItem, { 
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    }]}
                    onPress={() => {
                      closeDayModal();
                      handleTodoPress(todo);
                    }}
                  >
                    <View style={styles.dayModalTodoContent}>
                      <Text style={[styles.dayModalTodoTitle, { color: theme.colors.textPrimary }]}>
                        {todo.title}
                      </Text>
                      {todo.shortDesc && (
                        <Text style={[styles.dayModalTodoDesc, { color: theme.colors.textSecondary }]}>
                          {todo.shortDesc}
                        </Text>
                      )}
                      <View style={styles.dayModalTodoMeta}>
                        {todo.priority && (
                          <View style={[styles.priorityBadge, { 
                            backgroundColor: todo.priority === 'high' ? theme.colors.destructive + '20' :
                                            todo.priority === 'medium' ? theme.colors.warning + '20' :
                                            theme.colors.accent + '20'
                          }]}>
                            <Text style={[styles.priorityText, { 
                              color: todo.priority === 'high' ? theme.colors.destructive :
                                     todo.priority === 'medium' ? theme.colors.warning :
                                     theme.colors.accent
                            }]}>
                              {todo.priority}
                            </Text>
                          </View>
                        )}
                        {todo.category && (
                          <View style={[styles.categoryBadge, { backgroundColor: theme.colors.accent + '20' }]}>
                            <Text style={[styles.categoryText, { color: theme.colors.accent }]}>
                              {todo.category}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.dayModalEmptyState}>
                  <Icon name="event-available" size={64} color={theme.colors.textSecondary} />
                  <Text style={[styles.dayModalEmptyTitle, { color: theme.colors.textPrimary }]}>
                    No todos for this date
                  </Text>
                  <Text style={[styles.dayModalEmptyDesc, { color: theme.colors.textSecondary }]}>
                    This day is free and clear!
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Todo Detail Modal */}
      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          visible={showTodoDetail}
          onClose={() => {
            setShowTodoDetail(false);
            setSelectedTodo(null);
          }}
        />
      )}
    </SafeAreaView>
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
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  calendar: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  todayCell: {
    borderRadius: 8,
  },
  selectedCell: {
    borderWidth: 2,
    borderRadius: 8,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  todosIndicator: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  todosDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  todosCount: {
    fontSize: 10,
    fontWeight: '600',
  },
  dayModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dayModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  dayModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dayModalTitleContainer: {
    flex: 1,
  },
  dayModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayModalSubtitle: {
    fontSize: 14,
  },
  dayModalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayModalTodosList: {
    flex: 1,
  },
  dayModalTodosContent: {
    padding: 16,
  },
  dayModalTodoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  dayModalTodoContent: {
    flex: 1,
  },
  dayModalTodoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayModalTodoDesc: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  dayModalTodoMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dayModalEmptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  dayModalEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  dayModalEmptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CalendarScreen;