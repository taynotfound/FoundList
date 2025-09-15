import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

// Predefined common tags for autocomplete
const COMMON_TAGS = [
  'urgent',
  'meeting',
  'errands',
  'important',
  'deadline',
  'follow-up',
  'research',
  'call',
  'email',
  'review',
  'planning',
  'creative',
  'documentation',
  'maintenance',
  'project',
  'client',
  'team',
  'personal',
  'health',
  'finance',
  'home',
  'travel',
  'learning',
  'exercise',
  'family',
  'friends',
  'hobby',
  'reading',
  'writing',
  'coding',
  'design',
];

// Tag display component
export const TagBadge = ({ tag, onRemove, size = 'medium', removable = false }) => {
  const { theme } = useTheme();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.tagBadge,
        {
          backgroundColor: theme.colors.accent + '15',
          borderColor: theme.colors.accent,
        },
        isSmall && styles.tagBadgeSmall,
      ]}
    >
      <Text style={styles.tagHash}>#</Text>
      <Text
        style={[
          styles.tagText,
          { color: theme.colors.accent },
          isSmall && styles.tagTextSmall,
        ]}
      >
        {tag}
      </Text>
      {removable && onRemove && (
        <TouchableOpacity
          onPress={() => onRemove(tag)}
          style={styles.removeButton}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Icon name="close" size={14} color={theme.colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Tags input component with autocomplete
const TagsInput = ({ tags = [], onTagsChange, placeholder = "Add tags..." }) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = COMMON_TAGS.filter(tag => 
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(tag)
      ).slice(0, 6); // Show max 6 suggestions
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [inputValue, tags]);

  const addTag = (tagText) => {
    const trimmedTag = tagText.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      onTagsChange(newTags);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onTagsChange(newTags);
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  const handleInputChange = (text) => {
    // Remove # if user types it
    const cleanText = text.replace(/^#/, '');
    setInputValue(cleanText);
  };

  return (
    <View style={styles.container}>
      {/* Tags Display */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsScrollContent}
          >
            {tags.map((tag, index) => (
              <TagBadge
                key={`${tag}-${index}`}
                tag={tag}
                onRemove={removeTag}
                removable
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.surface,
              borderColor: showSuggestions ? theme.colors.accent : theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.hashSymbol, { color: theme.colors.textSecondary }]}>#</Text>
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              { color: theme.colors.textPrimary },
            ]}
            value={inputValue}
            onChangeText={handleInputChange}
            onSubmitEditing={handleInputSubmit}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {inputValue.length > 0 && (
            <TouchableOpacity
              onPress={handleInputSubmit}
              style={[styles.addButton, { backgroundColor: theme.colors.accent }]}
            >
              <Icon name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions */}
        {showSuggestions && (
          <View
            style={[
              styles.suggestionsContainer,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScrollContent}
            >
              {filteredSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={[
                    styles.suggestionItem,
                    { backgroundColor: theme.colors.background },
                  ]}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionHash}>#</Text>
                  <Text
                    style={[
                      styles.suggestionText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  // Tags Display
  tagsContainer: {
    marginBottom: 12,
  },
  tagsScrollContent: {
    gap: 8,
    paddingHorizontal: 2,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  tagBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagHash: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagTextSmall: {
    fontSize: 10,
  },
  removeButton: {
    marginLeft: 2,
    padding: 2,
  },

  // Input
  inputContainer: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  hashSymbol: {
    fontSize: 16,
    fontWeight: '700',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 4,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Suggestions
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsScrollContent: {
    gap: 8,
    paddingHorizontal: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  suggestionHash: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TagsInput;