import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface DatePickerFieldProps {
  label?: string;
  required?: boolean;
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label = 'Select Date',
  required = false,
  value,
  onChange,
  placeholder = 'Select date...',
  minDate = new Date(),
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Parse current selected or fallback date
  const parsedValueDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewDate, setViewDate] = useState<Date>(
    isNaN(parsedValueDate.getTime()) ? new Date() : parsedValueDate
  );

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // Calculate calendar grid for viewDate month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const formatDateStr = (year: number, monthIndex: number, day: number) => {
    const y = year;
    const m = String(monthIndex + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()].slice(0, 3);
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const isDateDisabled = (year: number, monthIndex: number, day: number) => {
    if (!minDate) return false;
    const target = new Date(year, monthIndex, day, 23, 59, 59);
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    return target < min;
  };

  const handleSelectDay = (day: number) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day);
    onChange(dateStr);
    setModalVisible(false);
  };

  // Quick Preset Handlers
  const handleApplyPreset = (daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    const dateStr = formatDateStr(target.getFullYear(), target.getMonth(), target.getDate());
    onChange(dateStr);
    setModalVisible(false);
  };

  const handleApplyEndOfMonth = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dateStr = formatDateStr(today.getFullYear(), today.getMonth(), lastDay);
    onChange(dateStr);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={styles.label}>
          {label} {required ? <Text style={{ color: COLORS.danger }}>*</Text> : null}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[styles.inputBox, value ? styles.inputBoxActive : null]}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <CalendarIcon size={18} color={value ? COLORS.primary : COLORS.slate400} style={styles.icon} />

        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value ? value : placeholder}
        </Text>

        {value ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            style={styles.clearBtn}
          >
            <X size={14} color={COLORS.slate400} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      {/* Date Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <CalendarIcon size={20} color={COLORS.primary} />
                    <Text style={styles.modalTitle}>Select Date</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X size={20} color={COLORS.slate500} />
                  </TouchableOpacity>
                </View>

                {/* Quick Presets */}
                <View style={styles.presetRow}>
                  <TouchableOpacity style={styles.presetChip} onPress={() => handleApplyPreset(7)}>
                    <Text style={styles.presetChipText}>+7 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.presetChip} onPress={() => handleApplyPreset(15)}>
                    <Text style={styles.presetChipText}>+15 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.presetChip} onPress={() => handleApplyPreset(30)}>
                    <Text style={styles.presetChipText}>+30 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.presetChip} onPress={handleApplyEndOfMonth}>
                    <Text style={styles.presetChipText}>End of Month</Text>
                  </TouchableOpacity>
                </View>

                {/* Month & Year Controls */}
                <View style={styles.monthHeader}>
                  <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
                    <ChevronLeft size={20} color={COLORS.slate700} />
                  </TouchableOpacity>
                  <Text style={styles.monthTitle}>
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </Text>
                  <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
                    <ChevronRight size={20} color={COLORS.slate700} />
                  </TouchableOpacity>
                </View>

                {/* Day of Week Header */}
                <View style={styles.weekHeader}>
                  {DAYS_OF_WEEK.map((d, i) => (
                    <Text key={i} style={styles.weekDayText}>
                      {d}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {/* Empty lead slots */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.daySlot} />
                  ))}

                  {/* Days 1..daysInMonth */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = formatDateStr(currentYear, currentMonth, day);
                    const isSelected = value === dateStr;
                    const disabled = isDateDisabled(currentYear, currentMonth, day);

                    return (
                      <TouchableOpacity
                        key={`day-${day}`}
                        style={[
                          styles.daySlot,
                          isSelected && styles.daySlotSelected,
                          disabled && styles.daySlotDisabled,
                        ]}
                        disabled={disabled}
                        onPress={() => handleSelectDay(day)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                            disabled && styles.dayTextDisabled,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected Footer Info */}
                <View style={styles.footerRow}>
                  <Text style={styles.footerSelectedText}>
                    Selected: {value ? formatDisplayDate(value) : 'None'}
                  </Text>

                  <TouchableOpacity
                    style={[styles.confirmBtn, !value && styles.confirmBtnDisabled]}
                    disabled={!value}
                    onPress={() => setModalVisible(false)}
                  >
                    <Check size={16} color="#FFFFFF" />
                    <Text style={styles.confirmBtnText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.slate800,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.slate300,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  inputBoxActive: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  icon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate900,
  },
  placeholderText: {
    color: COLORS.slate400,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  presetChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
  },
  presetChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.slate700,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  navBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.slate500,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  daySlot: {
    width: `${100 / 7}%`,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: RADIUS.md,
  },
  daySlotSelected: {
    backgroundColor: '#0F172A',
  },
  daySlotDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dayTextDisabled: {
    color: COLORS.slate400,
    textDecorationLine: 'line-through',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerSelectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate600,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.slate300,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
