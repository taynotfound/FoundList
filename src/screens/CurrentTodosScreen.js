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
import DateTimePicker from '@react-native-community/datetimepicker';

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
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
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
      await addTodo(newTodo.title, newTodo.shortDesc, newTodo.longDesc, newTodo.dueDate, newTodo.priority, newTodo.category, newTodo.tags, newTodo.images);
      setNewTodo({ title: '', shortDesc: '', longDesc: '', dueDate: null, priority: 'medium', category: null, tags: [], images: [] });
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
              />
            </View>

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

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Long Description
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                  },
                ]}
                value={newTodo.longDesc}
                onChangeText={(text) => setNewTodo({ ...newTodo, longDesc: text })}
                placeholder="Detailed description"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Priority Selector */}
            <PrioritySelector
              selectedPriority={newTodo.priority}
              onPriorityChange={(priority) => setNewTodo({ ...newTodo, priority })}
            />

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

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Due Date (Optional)
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateInputContent}>
                  <Icon 
                    name="schedule" 
                    size={20} 
                    color={newTodo.dueDate ? theme.colors.accent : theme.colors.textSecondary} 
                  />
                  <Text
                    style={[
                      styles.dateInputText,
                      { 
                        color: newTodo.dueDate ? theme.colors.textPrimary : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {newTodo.dueDate 
                      ? new Date(newTodo.dueDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Set due date'
                    }
                  </Text>
                  {newTodo.dueDate && (
                    <TouchableOpacity
                      onPress={() => setNewTodo({ ...newTodo, dueDate: null })}
                      style={styles.clearDateButton}
                    >
                      <Icon name="close" size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Date Picker */}
          {showDatePicker && (
            <Modal
              transparent={true}
              animationType="fade"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.datePickerOverlay}>
                <TouchableOpacity
                  style={styles.datePickerBackground}
                  activeOpacity={1}
                  onPress={() => setShowDatePicker(false)}
                />
                <View style={[styles.datePickerContainer, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.datePickerHeader, { borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={[styles.datePickerButton, { color: theme.colors.textSecondary }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.datePickerTitle, { color: theme.colors.textPrimary }]}>
                      Set Due Date
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        const today = new Date();
                        today.setHours(23, 59, 59, 999);
                        setNewTodo({ ...newTodo, dueDate: today.toISOString() });
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={[styles.datePickerButton, { color: theme.colors.accent }]}>
                        Today
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.dateOptions}>
                    {[
                      { label: 'Tomorrow', days: 1 },
                      { label: 'This Weekend', days: 6 - new Date().getDay() },
                      { label: 'Next Week', days: 7 },
                      { label: 'Next Month', days: 30 },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.label}
                        style={[styles.dateOption, { borderBottomColor: theme.colors.border }]}
                        onPress={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + option.days);
                          date.setHours(23, 59, 59, 999);
                          setNewTodo({ ...newTodo, dueDate: date.toISOString() });
                          setShowDatePicker(false);
                        }}
                      >
                        <Text style={[styles.dateOptionText, { color: theme.colors.textPrimary }]}>
                          {option.label}
                        </Text>
                        <Text style={[styles.dateOptionDate, { color: theme.colors.textSecondary }]}>
                          {(() => {
                            const date = new Date();
                            date.setDate(date.getDate() + option.days);
                            return date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            });
                          })()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </Modal>
          )}
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
    paddingTop: 20,
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
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateInputText: {
    fontSize: 16,
    flex: 1,
  },
  clearDateButton: {
    padding: 4,
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  datePickerContainer: {
    margin: 16,
    borderRadius: 16,
    maxHeight: '70%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  datePickerButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateOptions: {
    padding: 8,
  },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dateOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateOptionDate: {
    fontSize: 14,
    fontWeight: '400',
  },
});

export default CurrentTodosScreen;