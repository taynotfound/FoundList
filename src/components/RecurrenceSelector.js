import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const RECURRENCE_TYPES = {
  none: { label: 'No Repeat', icon: 'close' },
  daily: { label: 'Daily', icon: 'today' },
  weekly: { label: 'Weekly', icon: 'date-range' },
  monthly: { label: 'Monthly', icon: 'calendar-today' },
  yearly: { label: 'Yearly', icon: 'event' },
  custom: { label: 'Custom', icon: 'settings' },
};

const WEEKDAYS = [
  { key: 'sunday', label: 'Sun', index: 0 },
  { key: 'monday', label: 'Mon', index: 1 },
  { key: 'tuesday', label: 'Tue', index: 2 },
  { key: 'wednesday', label: 'Wed', index: 3 },
  { key: 'thursday', label: 'Thu', index: 4 },
  { key: 'friday', label: 'Fri', index: 5 },
  { key: 'saturday', label: 'Sat', index: 6 },
];

const INTERVALS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30];

const RecurrenceSelector = ({
  value = { type: 'none', interval: 1, weekdays: [], endDate: null },
  onChange,
  style,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [tempRecurrence, setTempRecurrence] = useState(value);

  const formatRecurrence = (recurrence) => {
    if (!recurrence || recurrence.type === 'none') {
      return 'No Repeat';
    }

    const { type, interval, weekdays, endDate } = recurrence;
    
    switch (type) {
      case 'daily':
        return interval === 1 ? 'Daily' : `Every ${interval} days`;
      
      case 'weekly':
        if (interval === 1 && weekdays && weekdays.length > 0) {
          if (weekdays.length === 7) {
            return 'Daily';
          }
          if (weekdays.length === 1) {
            const day = WEEKDAYS.find(d => d.index === weekdays[0]);
            return `Weekly on ${day?.label || 'Unknown'}`;
          }
          return `Weekly on ${weekdays.length} days`;
        }
        return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      
      case 'monthly':
        return interval === 1 ? 'Monthly' : `Every ${interval} months`;
      
      case 'yearly':
        return interval === 1 ? 'Yearly' : `Every ${interval} years`;
      
      case 'custom':
        return 'Custom';
      
      default:
        return 'No Repeat';
    }
  };

  const handleSave = () => {
    onChange && onChange(tempRecurrence);
    setShowModal(false);
  };

  const handleCancel = () => {
    setTempRecurrence(value);
    setShowModal(false);
  };

  const updateRecurrence = (updates) => {
    setTempRecurrence(prev => ({ ...prev, ...updates }));
  };

  const toggleWeekday = (dayIndex) => {
    const weekdays = tempRecurrence.weekdays || [];
    const newWeekdays = weekdays.includes(dayIndex)
      ? weekdays.filter(d => d !== dayIndex)
      : [...weekdays, dayIndex].sort();
    
    updateRecurrence({ weekdays: newWeekdays });
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          disabled && { opacity: 0.5 },
        ]}
        onPress={() => setShowModal(true)}
        disabled={disabled}
      >
        <Icon 
          name="repeat" 
          size={20} 
          color={value.type !== 'none' ? theme.colors.accent : theme.colors.textSecondary} 
        />
        <Text
          style={[
            styles.buttonText,
            {
              color: value.type !== 'none' ? theme.colors.textPrimary : theme.colors.textSecondary,
            },
          ]}
        >
          {formatRecurrence(value)}
        </Text>
        <Icon 
          name="arrow-drop-down" 
          size={20} 
          color={theme.colors.textSecondary} 
        />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={[styles.modalButton, { color: theme.colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Repeat
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={[styles.modalButton, { color: theme.colors.accent }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Recurrence Type */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                  Repeat Type
                </Text>
                {Object.entries(RECURRENCE_TYPES).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.option,
                      {
                        backgroundColor: tempRecurrence.type === key 
                          ? theme.colors.accent + '20' 
                          : 'transparent',
                      },
                    ]}
                    onPress={() => updateRecurrence({ type: key })}
                  >
                    <Icon 
                      name={config.icon} 
                      size={24} 
                      color={tempRecurrence.type === key ? theme.colors.accent : theme.colors.textSecondary} 
                    />
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: tempRecurrence.type === key 
                            ? theme.colors.accent 
                            : theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {config.label}
                    </Text>
                    {tempRecurrence.type === key && (
                      <Icon name="check" size={20} color={theme.colors.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Interval Selection */}
              {tempRecurrence.type !== 'none' && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    Every
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.intervalContainer}>
                      {INTERVALS.map(interval => (
                        <TouchableOpacity
                          key={interval}
                          style={[
                            styles.intervalButton,
                            {
                              backgroundColor: tempRecurrence.interval === interval
                                ? theme.colors.accent
                                : theme.colors.surface,
                              borderColor: theme.colors.border,
                            },
                          ]}
                          onPress={() => updateRecurrence({ interval })}
                        >
                          <Text
                            style={[
                              styles.intervalText,
                              {
                                color: tempRecurrence.interval === interval
                                  ? theme.colors.surface
                                  : theme.colors.textPrimary,
                              },
                            ]}
                          >
                            {interval}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                  <Text style={[styles.intervalLabel, { color: theme.colors.textSecondary }]}>
                    {tempRecurrence.type}
                    {tempRecurrence.interval > 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {/* Weekday Selection for Weekly */}
              {tempRecurrence.type === 'weekly' && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    Repeat on
                  </Text>
                  <View style={styles.weekdaysContainer}>
                    {WEEKDAYS.map(day => (
                      <TouchableOpacity
                        key={day.key}
                        style={[
                          styles.weekdayButton,
                          {
                            backgroundColor: (tempRecurrence.weekdays || []).includes(day.index)
                              ? theme.colors.accent
                              : theme.colors.surface,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        onPress={() => toggleWeekday(day.index)}
                      >
                        <Text
                          style={[
                            styles.weekdayText,
                            {
                              color: (tempRecurrence.weekdays || []).includes(day.index)
                                ? theme.colors.surface
                                : theme.colors.textPrimary,
                            },
                          ]}
                        >
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* End Date (Future Enhancement) */}
              {tempRecurrence.type !== 'none' && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    End Date
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      { backgroundColor: theme.colors.surface },
                    ]}
                    onPress={() => {
                      // TODO: Implement end date picker
                      console.log('End date picker - future enhancement');
                    }}
                  >
                    <Icon name="event" size={24} color={theme.colors.textSecondary} />
                    <Text style={[styles.optionText, { color: theme.colors.textSecondary }]}>
                      Never (coming soon)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 2,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  intervalContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  intervalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intervalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  intervalLabel: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  weekdayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RecurrenceSelector;