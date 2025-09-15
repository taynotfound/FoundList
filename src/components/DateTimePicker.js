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

const CustomDateTimePicker = ({
  value,
  onChange,
  mode = 'datetime', // 'date', 'time', 'datetime'
  minimumDate,
  maximumDate,
  placeholder = 'Select date & time',
  style,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());
  const [currentMode, setCurrentMode] = useState('date');

  // Generate arrays for date/time selection
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatDateTime = (date) => {
    if (!date) return placeholder;
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (mode === 'datetime' || mode === 'time') {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const handlePress = () => {
    if (disabled) return;
    setTempDate(value || new Date());
    setCurrentMode(mode === 'datetime' ? 'date' : mode);
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (mode === 'datetime' && currentMode === 'date') {
      setCurrentMode('time');
    } else {
      onChange && onChange(tempDate);
      setShowModal(false);
    }
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setCurrentMode(mode === 'datetime' ? 'date' : mode);
    setShowModal(false);
  };

  const updateDate = (field, newValue) => {
    const newDate = new Date(tempDate);
    switch (field) {
      case 'year':
        newDate.setFullYear(newValue);
        break;
      case 'month':
        newDate.setMonth(newValue);
        break;
      case 'day':
        newDate.setDate(newValue);
        break;
      case 'hour':
        newDate.setHours(newValue);
        break;
      case 'minute':
        newDate.setMinutes(newValue);
        break;
    }
    setTempDate(newDate);
  };

  const getIcon = () => {
    switch (mode) {
      case 'time':
        return 'access-time';
      case 'date':
        return 'event';
      default:
        return 'schedule';
    }
  };

  const getModalTitle = () => {
    if (mode === 'datetime') {
      return currentMode === 'date' ? 'Select Date' : 'Select Time';
    }
    return mode === 'time' ? 'Select Time' : 'Select Date';
  };

  const renderDatePicker = () => (
    <View style={styles.pickerContainer}>
      <View style={styles.pickerRow}>
        <View style={styles.pickerColumn}>
          <Text style={[styles.pickerLabel, { color: theme.colors.textPrimary }]}>Month</Text>
          <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pickerItem,
                  tempDate.getMonth() === index && {
                    backgroundColor: theme.colors.accent,
                  },
                ]}
                onPress={() => updateDate('month', index)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    {
                      color: tempDate.getMonth() === index
                        ? theme.colors.surface
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={[styles.pickerLabel, { color: theme.colors.textPrimary }]}>Day</Text>
          <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.pickerItem,
                  tempDate.getDate() === day && {
                    backgroundColor: theme.colors.accent,
                  },
                ]}
                onPress={() => updateDate('day', day)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    {
                      color: tempDate.getDate() === day
                        ? theme.colors.surface
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={[styles.pickerLabel, { color: theme.colors.textPrimary }]}>Year</Text>
          <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.pickerItem,
                  tempDate.getFullYear() === year && {
                    backgroundColor: theme.colors.accent,
                  },
                ]}
                onPress={() => updateDate('year', year)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    {
                      color: tempDate.getFullYear() === year
                        ? theme.colors.surface
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  const renderTimePicker = () => (
    <View style={styles.pickerContainer}>
      <View style={styles.pickerRow}>
        <View style={styles.pickerColumn}>
          <Text style={[styles.pickerLabel, { color: theme.colors.textPrimary }]}>Hour</Text>
          <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
            {hours.map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.pickerItem,
                  tempDate.getHours() === hour && {
                    backgroundColor: theme.colors.accent,
                  },
                ]}
                onPress={() => updateDate('hour', hour)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    {
                      color: tempDate.getHours() === hour
                        ? theme.colors.surface
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {hour.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={[styles.pickerLabel, { color: theme.colors.textPrimary }]}>Minute</Text>
          <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
            {minutes.filter(m => m % 5 === 0).map((minute) => (
              <TouchableOpacity
                key={minute}
                style={[
                  styles.pickerItem,
                  tempDate.getMinutes() === minute && {
                    backgroundColor: theme.colors.accent,
                  },
                ]}
                onPress={() => updateDate('minute', minute)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    {
                      color: tempDate.getMinutes() === minute
                        ? theme.colors.surface
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {minute.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );

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
        onPress={handlePress}
        disabled={disabled}
      >
        <Icon 
          name={getIcon()} 
          size={20} 
          color={value ? theme.colors.textPrimary : theme.colors.textSecondary} 
        />
        <Text
          style={[
            styles.buttonText,
            {
              color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
            },
          ]}
        >
          {formatDateTime(value)}
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
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Text style={[styles.headerButtonText, { color: theme.colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                {getModalTitle()}
              </Text>
              <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
                <Text style={[styles.headerButtonText, { color: theme.colors.accent }]}>
                  {mode === 'datetime' && currentMode === 'date' ? 'Next' : 'Done'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {(currentMode === 'date' || mode === 'date') && renderDatePicker()}
            {(currentMode === 'time' || mode === 'time') && renderTimePicker()}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
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
  pickerContainer: {
    padding: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerScrollView: {
    height: 200,
    borderRadius: 8,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 1,
    borderRadius: 6,
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomDateTimePicker;