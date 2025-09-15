import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useTodos } from '../contexts/TodoContext';
import LoadingSpinner from './LoadingSpinner';
import PrioritySelector, { PriorityBadge } from './PrioritySelector';
import CategorySelector, { CategoryBadge } from './CategorySelector';
import TagsInput, { TagBadge } from './TagsInput';
import ImageGalleryModal from './ImageGalleryModal';
import MarkdownEditorViewer from './MarkdownEditorViewer';
import CustomDateTimePicker from './DateTimePicker';
import RecurrenceSelector from './RecurrenceSelector';
import SmartSuggestions from './SmartSuggestions';
import { createFadeInAnimation, createSlideInAnimation } from '../utils/animations';

const TodoDetailModal = ({ todo, visible, onClose }) => {
  const { theme } = useTheme();
  const { updateTodo, completeTodo, deleteTodo, restoreTodo } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editedTodo, setEditedTodo] = useState({
    title: '',
    shortDesc: '',
    longDesc: '',
    dueDate: null,
    priority: 'medium',
    category: null,
    tags: [],
    recurrence: { type: 'none', interval: 1, weekdays: [], endDate: null },
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isCompleted = todo?.completedAt;

  useEffect(() => {
    if (visible && todo) {
      // Start entrance animations
      createFadeInAnimation(fadeAnim, 300).start();
      createSlideInAnimation(slideAnim, 50, 400).start();
      
      setEditedTodo({
        title: todo.title || '',
        shortDesc: todo.shortDesc || '',
        longDesc: todo.longDesc || '',
        dueDate: todo.dueDate,
        priority: todo.priority || 'medium',
        category: todo.category || null,
        tags: todo.tags || [],
        recurrence: todo.recurrence || { type: 'none', interval: 1, weekdays: [], endDate: null },
      });
    } else {
      // Reset animations when modal closes
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible, todo]);

  useEffect(() => {
    if (todo) {
      setEditedTodo({
        title: todo.title || '',
        shortDesc: todo.shortDesc || '',
        longDesc: todo.longDesc || '',
        dueDate: todo.dueDate || null,
        priority: todo.priority || 'medium',
        category: todo.category || null,
        tags: todo.tags || [],
        recurrence: todo.recurrence || { type: 'none', interval: 1, weekdays: [], endDate: null },
      });
    }
  }, [todo]);

  const handleSave = async () => {
    if (!editedTodo.title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      await updateTodo(todo.id, {
        title: editedTodo.title.trim(),
        shortDesc: editedTodo.shortDesc.trim(),
        longDesc: editedTodo.longDesc.trim(),
        dueDate: editedTodo.dueDate,
        priority: editedTodo.priority,
        recurrence: editedTodo.recurrence,
      });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedTodo({
      title: todo.title || '',
      shortDesc: todo.shortDesc || '',
      longDesc: todo.longDesc || '',
      dueDate: todo.dueDate || null,
      priority: todo.priority || 'medium',
      recurrence: todo.recurrence || { type: 'none', interval: 1, weekdays: [], endDate: null },
    });
    setIsEditing(false);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeTodo(todo.id);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      await restoreTodo(todo.id);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to restore todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('Deleting todo:', todo.id, 'isCompleted:', isCompleted);
              await deleteTodo(todo.id, isCompleted);
              console.log('Todo deleted successfully');
              onClose();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete todo. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!todo) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            flex: 1,
          }}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton} disabled={isLoading}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              {isCompleted ? 'Completed Todo' : 'Todo Details'}
            </Text>

            <View style={styles.headerActions}>
              {!isCompleted && (
                <>
                  {isEditing ? (
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={handleCancel} style={styles.headerButton} disabled={isLoading}>
                        <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isLoading || !editedTodo.title.trim()}>
                        {isLoading ? (
                          <LoadingSpinner size={16} color={theme.colors.accent} />
                        ) : (
                          <Text style={[styles.buttonText, { color: theme.colors.accent }]}>
                            Save
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                  <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
                    <Icon name="edit" size={24} color={theme.colors.accent} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={true}
          indicatorStyle={theme.isDark ? 'white' : 'black'}
          scrollIndicatorInsets={{ right: 2 }}
        >
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isCompleted ? theme.colors.success + '20' : theme.colors.accent + '20',
                },
              ]}
            >
              <Icon
                name={isCompleted ? 'check-circle' : 'radio-button-unchecked'}
                size={16}
                color={isCompleted ? theme.colors.success : theme.colors.accent}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isCompleted ? theme.colors.success : theme.colors.accent },
                ]}
              >
                {isCompleted ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Title
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                  },
                ]}
                value={editedTodo.title}
                onChangeText={(text) => setEditedTodo({ ...editedTodo, title: text })}
                placeholder="Enter title"
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={100}
              />
            ) : (
              <Text
                style={[
                  styles.titleText,
                  {
                    color: theme.colors.textPrimary,
                    textDecorationLine: isCompleted ? 'line-through' : 'none',
                  },
                ]}
              >
                {todo.title}
              </Text>
            )}
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Priority
            </Text>
            {isEditing ? (
              <PrioritySelector
                selectedPriority={editedTodo.priority}
                onPriorityChange={(priority) => setEditedTodo({ ...editedTodo, priority })}
                size="normal"
              />
            ) : (
              <View style={styles.priorityDisplayContainer}>
                <PriorityBadge priority={todo.priority || 'medium'} size="normal" />
              </View>
            )}
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Category
            </Text>
            {isEditing ? (
              <CategorySelector
                selectedCategory={editedTodo.category}
                onSelectCategory={(category) => setEditedTodo({ ...editedTodo, category })}
                placeholder="Select Category"
              />
            ) : (
              <View style={styles.categoryDisplayContainer}>
                {todo.category ? (
                  <CategoryBadge category={todo.category} size="medium" />
                ) : (
                  <Text style={[styles.noValueText, { color: theme.colors.textSecondary }]}>
                    No category
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Tags
            </Text>
            {isEditing ? (
              <TagsInput
                tags={editedTodo.tags}
                onTagsChange={(tags) => setEditedTodo({ ...editedTodo, tags })}
                placeholder="Add tags..."
              />
            ) : (
              <View style={styles.tagsDisplayContainer}>
                {todo.tags && todo.tags.length > 0 ? (
                  <View style={styles.tagsDisplay}>
                    {todo.tags.map((tag, index) => (
                      <TagBadge key={`${tag}-${index}`} tag={tag} size="medium" />
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.noValueText, { color: theme.colors.textSecondary }]}>
                    No tags
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Smart Suggestions */}
          {isEditing && (
            <SmartSuggestions
              onSelectDateTime={(date) => setEditedTodo({ ...editedTodo, dueDate: date.toISOString() })}
              onSelectRecurrence={(recurrence) => setEditedTodo({ ...editedTodo, recurrence })}
            />
          )}

          {/* Due Date & Time */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Due Date & Time
            </Text>
            {isEditing ? (
              <CustomDateTimePicker
                value={editedTodo.dueDate ? new Date(editedTodo.dueDate) : null}
                onChange={(date) => setEditedTodo({ ...editedTodo, dueDate: date ? date.toISOString() : null })}
                mode="datetime"
                placeholder="Select due date & time"
                minimumDate={new Date()}
              />
            ) : (
              <Text
                style={[
                  styles.descText,
                  { color: todo.dueDate ? theme.colors.textPrimary : theme.colors.textSecondary },
                ]}
              >
                {todo.dueDate 
                  ? new Date(todo.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : 'No due date set'
                }
              </Text>
            )}
          </View>

          {/* Recurrence */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Repeat
            </Text>
            {isEditing ? (
              <RecurrenceSelector
                value={editedTodo.recurrence}
                onChange={(recurrence) => setEditedTodo({ ...editedTodo, recurrence })}
                disabled={!editedTodo.dueDate}
              />
            ) : (
              <Text
                style={[
                  styles.descText,
                  { color: todo.recurrence && todo.recurrence.type !== 'none' ? theme.colors.textPrimary : theme.colors.textSecondary },
                ]}
              >
                {todo.recurrence && todo.recurrence.type !== 'none' 
                  ? (() => {
                      const { type, interval, weekdays } = todo.recurrence;
                      switch (type) {
                        case 'daily':
                          return interval === 1 ? 'Daily' : `Every ${interval} days`;
                        case 'weekly':
                          if (weekdays && weekdays.length > 0) {
                            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const selectedDays = weekdays.map(d => dayNames[d]).join(', ');
                            return `Weekly on ${selectedDays}`;
                          }
                          return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
                        case 'monthly':
                          return interval === 1 ? 'Monthly' : `Every ${interval} months`;
                        case 'yearly':
                          return interval === 1 ? 'Yearly' : `Every ${interval} years`;
                        default:
                          return 'Custom';
                      }
                    })()
                  : 'Does not repeat'
                }
              </Text>
            )}
          </View>

          {/* Images */}
          {todo.images && todo.images.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                Photos ({todo.images.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                indicatorStyle={theme.isDark ? 'white' : 'black'}
                style={styles.imagesContainer}
                contentContainerStyle={styles.imagesScrollContent}
              >
                {todo.images.map((image, index) => {
                  // Handle both blob URIs and base64 data URIs
                  const imageUri = typeof image === 'string' ? image : image.uri;
                  const isValidUri = imageUri && (imageUri.startsWith('data:') || imageUri.startsWith('http') || imageUri.startsWith('file:'));
                  
                  if (!isValidUri) {
                    console.warn('Invalid image URI:', imageUri);
                    return null;
                  }
                  
                  return (
                    <TouchableOpacity
                      key={image.id || index}
                      style={styles.imageWrapper}
                      onPress={() => {
                        setSelectedImageIndex(index);
                        setShowImageGallery(true);
                      }}
                    >
                      <Image 
                        source={{ uri: imageUri }} 
                        style={styles.detailImage}
                        resizeMode="cover"
                        onError={(error) => {
                          console.log('Image load error:', error.nativeEvent.error, 'URI:', imageUri);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', imageUri?.substring(0, 50) + '...');
                        }}
                      />
                      <View style={[styles.imageOverlay, { backgroundColor: theme.colors.surface + '40' }]}>
                        <Icon name="zoom-in" size={20} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  );
                }).filter(Boolean)}
              </ScrollView>
            </View>
          )}

          {/* Short Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Short Description
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                  },
                ]}
                value={editedTodo.shortDesc}
                onChangeText={(text) => setEditedTodo({ ...editedTodo, shortDesc: text })}
                placeholder="Brief description"
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={200}
              />
            ) : (
              <Text
                style={[
                  styles.descText,
                  { color: todo.shortDesc ? theme.colors.textPrimary : theme.colors.textSecondary },
                ]}
              >
                {todo.shortDesc || 'No short description'}
              </Text>
            )}
          </View>

          {/* Long Description */}
          <View style={styles.section}>
            <MarkdownEditorViewer
              value={editedTodo.longDesc}
              onChange={(text) => setEditedTodo({ ...editedTodo, longDesc: text })}
              placeholder="Add a detailed description... (Supports Markdown)"
              editable={!isCompleted}
              showToolbar={true}
              maxHeight={250}
              minHeight={120}
            />
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Created
            </Text>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {formatDate(todo.createdAt)}
            </Text>
          </View>

          {isCompleted && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                Completed
              </Text>
              <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                {formatDate(todo.completedAt)}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        {!isEditing && (
          <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
            {isCompleted ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
                onPress={handleRestore}
              >
                <Icon name="restore" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Restore</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                onPress={handleComplete}
              >
                <Icon name="check" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Complete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.destructive }]}
              onPress={handleDelete}
            >
              <Icon name="delete" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        </Animated.View>
      </SafeAreaView>

      {/* Image Gallery Modal */}
      {todo && todo.images && (
        <ImageGalleryModal
          visible={showImageGallery}
          images={todo.images
            .filter(img => {
              const uri = typeof img === 'string' ? img : img.uri;
              return uri && (uri.startsWith('data:') || uri.startsWith('http') || uri.startsWith('file:'));
            })
            .map(img => typeof img === 'string' ? img : img.uri)
          }
          initialIndex={selectedImageIndex}
          onClose={() => setShowImageGallery(false)}
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
    minWidth: 44,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  descText: {
    fontSize: 16,
    lineHeight: 22,
  },
  priorityDisplayContainer: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  categoryDisplayContainer: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  tagsDisplayContainer: {
    marginTop: 4,
  },
  tagsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagesContainer: {
    marginTop: 8,
  },
  imagesScrollContent: {
    paddingRight: 16,
  },
  imageWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  detailImage: {
    width: 120,
    height: 120,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  noValueText: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 15,
    lineHeight: 20,
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
    minHeight: 120,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TodoDetailModal;