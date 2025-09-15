import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const SmartSuggestions = ({
  onSelectDateTime,
  onSelectRecurrence,
  style,
}) => {
  const { theme } = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchText, setSearchText] = useState('');

  const formatDateTime = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const generateSuggestions = () => {
    const now = new Date();
    const suggestions = [];

    // Quick time suggestions
    suggestions.push(
      {
        id: 'now',
        type: 'datetime',
        label: 'Right now',
        icon: 'schedule',
        value: now,
        description: formatDateTime(now),
      },
      {
        id: 'in-1-hour',
        type: 'datetime',
        label: 'In 1 hour',
        icon: 'schedule',
        value: new Date(now.getTime() + 60 * 60 * 1000),
        description: formatDateTime(new Date(now.getTime() + 60 * 60 * 1000)),
      },
      {
        id: 'in-2-hours',
        type: 'datetime',
        label: 'In 2 hours',
        icon: 'schedule',
        value: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        description: formatDateTime(new Date(now.getTime() + 2 * 60 * 60 * 1000)),
      },
    );

    // Tomorrow suggestions
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow

    suggestions.push(
      {
        id: 'tomorrow-morning',
        type: 'datetime',
        label: 'Tomorrow morning',
        icon: 'wb-sunny',
        value: tomorrow,
        description: formatDateTime(tomorrow),
      },
    );

    // Next week suggestions
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0);

    suggestions.push(
      {
        id: 'next-week',
        type: 'datetime',
        label: 'Next week',
        icon: 'date-range',
        value: nextWeek,
        description: formatDateTime(nextWeek),
      },
    );

    // Day-specific suggestions
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = now.getDay();
    
    for (let i = 1; i <= 7; i++) {
      const targetDay = (currentDay + i) % 7;
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + i);
      targetDate.setHours(9, 0, 0, 0);

      if (i <= 7) { // Only show next 7 days
        suggestions.push({
          id: `next-${weekdays[targetDay].toLowerCase()}`,
          type: 'datetime',
          label: i === 1 ? 'Tomorrow' : `Next ${weekdays[targetDay]}`,
          icon: 'today',
          value: targetDate,
          description: formatDateTime(targetDate),
        });
      }
    }

    // Time-specific suggestions for today
    const timeSlots = [
      { hour: 13, minute: 0, label: 'This afternoon (1 PM)' },
      { hour: 17, minute: 0, label: 'This evening (5 PM)' },
      { hour: 20, minute: 0, label: 'Tonight (8 PM)' },
    ];

    timeSlots.forEach(slot => {
      const slotTime = new Date(now);
      slotTime.setHours(slot.hour, slot.minute, 0, 0);
      
      if (slotTime > now) { // Only show future times
        suggestions.push({
          id: `today-${slot.hour}`,
          type: 'datetime',
          label: slot.label,
          icon: 'access-time',
          value: slotTime,
          description: formatDateTime(slotTime),
        });
      }
    });

    // Recurring task suggestions
    suggestions.push(
      {
        id: 'daily',
        type: 'recurrence',
        label: 'Every day',
        icon: 'repeat',
        value: { type: 'daily', interval: 1, weekdays: [], endDate: null },
        description: 'Daily recurring task',
      },
      {
        id: 'weekly',
        type: 'recurrence',
        label: 'Every week',
        icon: 'repeat',
        value: { type: 'weekly', interval: 1, weekdays: [], endDate: null },
        description: 'Weekly recurring task',
      },
      {
        id: 'weekdays',
        type: 'recurrence',
        label: 'Every weekday',
        icon: 'repeat',
        value: { type: 'weekly', interval: 1, weekdays: [1, 2, 3, 4, 5], endDate: null },
        description: 'Monday to Friday',
      },
      {
        id: 'monthly',
        type: 'recurrence',
        label: 'Every month',
        icon: 'repeat',
        value: { type: 'monthly', interval: 1, weekdays: [], endDate: null },
        description: 'Monthly recurring task',
      },
    );

    return suggestions;
  };

  const suggestions = useMemo(() => generateSuggestions(), []);

  const filteredSuggestions = useMemo(() => {
    if (!searchText.trim()) return suggestions;
    
    const search = searchText.toLowerCase().trim();
    return suggestions.filter(suggestion => 
      suggestion.label.toLowerCase().includes(search) ||
      suggestion.description.toLowerCase().includes(search)
    );
  }, [suggestions, searchText]);

  const handleSuggestionPress = (suggestion) => {
    if (suggestion.type === 'datetime') {
      onSelectDateTime && onSelectDateTime(suggestion.value);
    } else if (suggestion.type === 'recurrence') {
      onSelectRecurrence && onSelectRecurrence(suggestion.value);
    }
    setShowSuggestions(false);
    setSearchText('');
  };

  const parseNaturalLanguage = (text) => {
    const now = new Date();
    const lowerText = text.toLowerCase().trim();

    // Simple natural language parsing
    if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return { type: 'datetime', value: tomorrow };
    }

    if (lowerText.includes('next week')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(9, 0, 0, 0);
      return { type: 'datetime', value: nextWeek };
    }

    if (lowerText.includes('in') && lowerText.includes('hour')) {
      const hourMatch = lowerText.match(/in (\d+) hour/);
      if (hourMatch) {
        const hours = parseInt(hourMatch[1]);
        const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
        return { type: 'datetime', value: futureTime };
      }
    }

    if (lowerText.includes('daily') || lowerText.includes('every day')) {
      return { 
        type: 'recurrence', 
        value: { type: 'daily', interval: 1, weekdays: [], endDate: null } 
      };
    }

    if (lowerText.includes('weekly') || lowerText.includes('every week')) {
      return { 
        type: 'recurrence', 
        value: { type: 'weekly', interval: 1, weekdays: [], endDate: null } 
      };
    }

    return null;
  };

  const handleSearchSubmit = () => {
    const parsed = parseNaturalLanguage(searchText);
    if (parsed) {
      if (parsed.type === 'datetime') {
        onSelectDateTime && onSelectDateTime(parsed.value);
      } else if (parsed.type === 'recurrence') {
        onSelectRecurrence && onSelectRecurrence(parsed.value);
      }
      setShowSuggestions(false);
      setSearchText('');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.triggerButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => setShowSuggestions(true)}
      >
        <Icon name="lightbulb-outline" size={20} color={theme.colors.accent} />
        <Text style={[styles.triggerText, { color: theme.colors.accent }]}>
          Smart suggestions
        </Text>
      </TouchableOpacity>

      {showSuggestions && (
        <Modal
          visible={showSuggestions}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setShowSuggestions(false);
            setSearchText('');
          }}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity
                onPress={() => {
                  setShowSuggestions(false);
                  setSearchText('');
                }}
                style={styles.headerButton}
              >
                <Text style={[styles.headerButtonText, { color: theme.colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Smart Suggestions
              </Text>
              <View style={styles.headerButton} />
            </View>

            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                placeholder="Try 'tomorrow', 'in 2 hours', 'daily'..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearchSubmit}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={handleSearchSubmit}>
                  <Icon name="send" size={20} color={theme.colors.accent} />
                </TouchableOpacity>
              )}
            </View>

            {/* Suggestions List */}
            <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
              {filteredSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={[
                    styles.suggestionItem,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <View style={[
                    styles.suggestionIcon,
                    { backgroundColor: suggestion.type === 'recurrence' ? theme.colors.accent + '20' : theme.colors.background }
                  ]}>
                    <Icon 
                      name={suggestion.icon} 
                      size={20} 
                      color={suggestion.type === 'recurrence' ? theme.colors.accent : theme.colors.textSecondary} 
                    />
                  </View>
                  <View style={styles.suggestionContent}>
                    <Text style={[styles.suggestionLabel, { color: theme.colors.textPrimary }]}>
                      {suggestion.label}
                    </Text>
                    <Text style={[styles.suggestionDescription, { color: theme.colors.textSecondary }]}>
                      {suggestion.description}
                    </Text>
                  </View>
                  <Icon name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
              
              {filteredSuggestions.length === 0 && searchText.trim() && (
                <View style={styles.emptyState}>
                  <Icon name="search-off" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                    No suggestions found for "{searchText}"
                  </Text>
                  <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                    Try terms like "tomorrow", "daily", or "in 2 hours"
                  </Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  suggestionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionDescription: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SmartSuggestions;