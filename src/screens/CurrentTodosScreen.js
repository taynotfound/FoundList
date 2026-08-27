import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import TodoItem from '../components/TodoItem';
import TodoDetailModal from '../components/TodoDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PrioritySelector from '../components/PrioritySelector';
import CategorySelector from '../components/CategorySelector';
import TagsInput from '../components/TagsInput';
import CategoryStats from '../components/CategoryStats';
import { SortButton } from '../components/SortMenu';
import TodoImagePicker from '../components/ImagePicker';
import SearchBar from '../components/SearchBar';
import MarkdownEditorViewer from '../components/MarkdownEditorViewer';
import CustomDateTimePicker from '../components/DateTimePicker';
import RecurrenceSelector from '../components/RecurrenceSelector';
import SmartSuggestions from '../components/SmartSuggestions';
import AppHeader from '../components/AppHeader';

const CurrentTodosScreen = () => {
  const { theme } = useTheme();
  const { todos, addTodo } = useTodos();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTodo, setNewTodo] = useState({
    title: '',
    shortDesc: '',
    longDesc: '',
    dueDate: null,
    priority: 'medium',
    category: null,
    tags: [],
    images: [],
    recurrence: { type: 'none', interval: 1, weekdays: [], endDate: null },
  });
  const [isLoading, setIsLoading] = useState(false);

  // Filter todos based on search query
  const filteredTodos = todos.filter((todo) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      todo.title.toLowerCase().includes(query) ||
      todo.shortDesc?.toLowerCase().includes(query) ||
      todo.longDesc?.toLowerCase().includes(query) ||
      todo.category?.toLowerCase().includes(query) ||
      todo.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleAddPress = () => {
    setShowAddModal(true);
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your todo');
      return;
    }

    setIsLoading(true);
    try {
      await addTodo(
        newTodo.title, 
        newTodo.shortDesc, 
        newTodo.longDesc, 
        newTodo.dueDate, 
        newTodo.priority, 
        newTodo.category, 
        newTodo.tags, 
        newTodo.images, 
        newTodo.recurrence
      );
      setNewTodo({ 
        title: '', 
        shortDesc: '', 
        longDesc: '', 
        dueDate: null, 
        priority: 'medium', 
        category: null, 
        tags: [], 
        images: [],
        recurrence: { type: 'none', interval: 1, weekdays: [], endDate: null }
      });
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTodo = ({ item, index }) => (
    <TodoItem
      todo={item}
      index={index}
      onPress={() => setSelectedTodo(item)}
    />
  );

  const EmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
      <Icon 
        name="check-circle-outline" 
        size={80} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.textPrimary }]}>
        No todos yet
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
        Tap the + button to add your first todo
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title="Today" />
      {/* Search Bar */}
      <SearchBar
        onSearch={setSearchQuery}
        placeholder="Search todos by title, description, category, or tags..."
      />
      
      {/* Category Stats */}
      <View style={styles.statsContainer}>
        <CategoryStats />
      </View>
      
      {/* Sort Options */}
      {filteredTodos.length > 0 && (
        <View style={styles.sortContainer}>
          <SortButton />
        </View>
      )}
      
      <View style={styles.content}>
        {filteredTodos.length === 0 ? (
          searchQuery.trim() ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
              <Icon 
                name="search-off" 
                size={80} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.textPrimary }]}>
                No todos found
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                Try adjusting your search terms
              </Text>
            </View>
          ) : (
            <EmptyState />
          )
        ) : (
          <FlatList
            data={filteredTodos}
            renderItem={renderTodo}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={true}
            indicatorStyle={theme.isDark ? 'white' : 'black'}
            scrollIndicatorInsets={{ right: 2 }}
          />
        )}

        {/* Sticky Add Button */}
        <View style={[styles.addButtonContainer, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleAddPress}
            activeOpacity={0.8}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Todo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Todo Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalButton}
              disabled={isLoading}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              New Todo
            </Text>
            <TouchableOpacity
              onPress={handleAddTodo}
              style={styles.modalButton}
              disabled={isLoading || !newTodo.title.trim()}
            >
              {isLoading ? (
                <LoadingSpinner size={16} color={theme.colors.accent} />
              ) : (
                <Text style={[styles.modalButtonText, { color: theme.colors.accent }]}>
                  Add
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={true}
            indicatorStyle={theme.isDark ? 'white' : 'black'}
            scrollIndicatorInsets={{ right: 2 }}
            contentContainerStyle={styles.modalScrollContent}
          >
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Title *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                  },
                ]}
                value={newTodo.title}
                onChangeText={(text) => setNewTodo({ ...newTodo, title: text })}
                placeholder="Enter todo title"
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={100}
                autoFocus
              />
            </View>

            {/* Short Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Short Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                  },
                ]}
                value={newTodo.shortDesc}
                onChangeText={(text) => setNewTodo({ ...newTodo, shortDesc: text })}
                placeholder="Brief description"
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={200}
              />
            </View>

            {/* Long Description with Markdown */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Detailed Description
              </Text>
              <MarkdownEditorViewer
                value={newTodo.longDesc}
                onChange={(text) => setNewTodo({ ...newTodo, longDesc: text })}
                placeholder="Add detailed description... (Supports Markdown)"
                editable={true}
                showToolbar={true}
                maxHeight={200}
                minHeight={100}
              />
            </View>

            {/* Smart Suggestions */}
            <SmartSuggestions
              onSelectDateTime={(date) => setNewTodo({ ...newTodo, dueDate: date.toISOString() })}
              onSelectRecurrence={(recurrence) => setNewTodo({ ...newTodo, recurrence })}
            />

            {/* Due Date & Time */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Due Date & Time
              </Text>
              <CustomDateTimePicker
                value={newTodo.dueDate ? new Date(newTodo.dueDate) : null}
                onChange={(date) => setNewTodo({ ...newTodo, dueDate: date ? date.toISOString() : null })}
                mode="datetime"
                placeholder="Select due date & time"
                minimumDate={new Date()}
              />
              {newTodo.dueDate && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setNewTodo({ ...newTodo, dueDate: null })}
                >
                  <Icon name="close" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.clearButtonText, { color: theme.colors.textSecondary }]}>
                    Clear due date
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Recurrence */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Repeat
              </Text>
              <RecurrenceSelector
                value={newTodo.recurrence}
                onChange={(recurrence) => setNewTodo({ ...newTodo, recurrence })}
                disabled={!newTodo.dueDate}
              />
              {!newTodo.dueDate && (
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                  Set a due date to enable recurring tasks
                </Text>
              )}
            </View>

            {/* Priority Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Priority
              </Text>
              <PrioritySelector
                selectedPriority={newTodo.priority}
                onPriorityChange={(priority) => setNewTodo({ ...newTodo, priority })}
                size="normal"
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Category (Optional)
              </Text>
              <CategorySelector
                selectedCategory={newTodo.category}
                onSelectCategory={(category) => setNewTodo({ ...newTodo, category })}
                placeholder="Select Category"
              />
            </View>

            {/* Tags Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Tags (Optional)
              </Text>
              <TagsInput
                tags={newTodo.tags}
                onTagsChange={(tags) => setNewTodo({ ...newTodo, tags })}
                placeholder="Add tags..."
              />
            </View>

            {/* Image Attachments */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Photos (Optional)
              </Text>
              <TodoImagePicker
                images={newTodo.images}
                onImagesChange={(images) => setNewTodo({ ...newTodo, images })}
                maxImages={5}
              />
            </View>

            {/* Summary Card */}
            {(newTodo.dueDate || newTodo.recurrence.type !== 'none' || newTodo.priority !== 'medium') && (
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>
                  Summary
                </Text>
                
                {newTodo.dueDate && (
                  <View style={styles.summaryItem}>
                    <Icon name="schedule" size={16} color={theme.colors.accent} />
                    <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                      Due: {new Date(newTodo.dueDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
                
                {newTodo.recurrence.type !== 'none' && (
                  <View style={styles.summaryItem}>
                    <Icon name="repeat" size={16} color={theme.colors.accent} />
                    <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                      Repeats: {(() => {
                        const { type, interval, weekdays } = newTodo.recurrence;
                        switch (type) {
                          case 'daily':
                            return interval === 1 ? 'Daily' : `Every ${interval} days`;
                          case 'weekly':
                            if (weekdays && weekdays.length > 0) {
                              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                              return `Weekly on ${weekdays.map(d => dayNames[d]).join(', ')}`;
                            }
                            return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
                          case 'monthly':
                            return interval === 1 ? 'Monthly' : `Every ${interval} months`;
                          case 'yearly':
                            return interval === 1 ? 'Yearly' : `Every ${interval} years`;
                          default:
                            return 'Custom';
                        }
                      })()}
                    </Text>
                  </View>
                )}
                
                {newTodo.priority !== 'medium' && (
                  <View style={styles.summaryItem}>
                    <Icon 
                      name={newTodo.priority === 'high' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                      size={16} 
                      color={
                        newTodo.priority === 'high' ? '#FF6B6B' : 
                        newTodo.priority === 'low' ? '#4ECDC4' : theme.colors.accent
                      } 
                    />
                    <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                      {newTodo.priority.charAt(0).toUpperCase() + newTodo.priority.slice(1)} priority
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

        </SafeAreaView>
      </Modal>

      {/* Todo Detail Modal */}
      <TodoDetailModal
        todo={selectedTodo}
        visible={!!selectedTodo}
        onClose={() => setSelectedTodo(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 140, // Space for sticky add button
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Sticky Add Button
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32, // Reduced space above navigation bar
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalButton: {
    padding: 4,
    minWidth: 60,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 14,
  },
  helperText: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    flex: 1,
  },
});

export default CurrentTodosScreen;