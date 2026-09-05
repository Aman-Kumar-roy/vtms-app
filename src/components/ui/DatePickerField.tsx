import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface DatePickerFieldProps {
  label?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  error?: string | null;
  required?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const formatDisplayDate = (ymd: string) => {
  if (!ymd || !ymd.includes('-')) return 'Select Date';
  const [year, month, day] = ymd.split('-');
  const monthIdx = parseInt(month, 10) - 1;
  const monthShort = MONTH_NAMES[monthIdx]?.substring(0, 3) || month;
  return `${day} ${monthShort} ${year}`;
};

const toYMD = (year: number, monthIndex: number, day: number) => {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label = 'TRANSACTION DATE',
  value,
  onChange,
  error,
  required = true,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Parse current value or fallback to today
  const initialDate = value && value.includes('-') ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(() =>
    isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth()
  );

  const openPicker = () => {
    if (value && value.includes('-')) {
      const [y, m] = value.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
    setModalVisible(true);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const selected = toYMD(viewYear, viewMonth, day);
    onChange(selected);
    setModalVisible(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const ymd = toYMD(today.getFullYear(), today.getMonth(), today.getDate());
    onChange(ymd);
    setModalVisible(false);
  };

  const handleSelectYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const ymd = toYMD(d.getFullYear(), d.getMonth(), d.getDate());
    onChange(ymd);
    setModalVisible(false);
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const todayStr = toYMD(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: colors.textMuted }]}>
          {label} {required ? <Text style={{ color: '#ef4444' }}>*</Text> : null}
        </Text>
      ) : null}

      {/* Trigger Button */}
      <TouchableOpacity
        style={[
          styles.triggerBtn,
          {
            backgroundColor: colors.bgCard,
            borderColor: error ? '#ef4444' : colors.borderSubtle,
          },
        ]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <View style={styles.triggerLeft}>
          <View style={[styles.calIconBox, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
            <Ionicons name="calendar-outline" size={16} color="#0284c7" />
          </View>
          <Text style={[styles.triggerText, { color: colors.textPrimary }]}>
            {formatDisplayDate(value)}
          </Text>
        </View>
        <View style={styles.triggerRight}>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </View>
      </TouchableOpacity>

      {error ? <Text style={styles.fieldError}>{error}</Text> : null}

      {/* Modern Calendar Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={[styles.calendarSheet, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
            {/* Header / Month Navigation */}
            <View style={[styles.calendarHeader, { borderBottomColor: colors.borderSubtle }]}>
              <View>
                <Text style={[styles.monthYearTitle, { color: colors.textPrimary }]}>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <Text style={[styles.monthYearSubtitle, { color: colors.textMuted }]}>
                  Pick transaction date
                </Text>
              </View>

              <View style={styles.navArrows}>
                <TouchableOpacity onPress={handlePrevMonth} style={[styles.arrowBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
                  <Ionicons name="chevron-back" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNextMonth} style={[styles.arrowBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
                  <Ionicons name="chevron-forward" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Select Chips */}
            <View style={styles.quickChipsRow}>
              <TouchableOpacity onPress={handleSelectToday} style={[styles.quickChip, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
                <Text style={[styles.quickChipText, { color: '#0284c7' }]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSelectYesterday} style={[styles.quickChip, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
                <Text style={[styles.quickChipText, { color: colors.textMuted }]}>Yesterday</Text>
              </TouchableOpacity>
            </View>

            {/* Weekday Row */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((w, idx) => (
                <Text key={idx} style={[styles.weekdayText, { color: colors.textMuted }]}>
                  {w}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {/* Previous Month Trail */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
                return (
                  <View key={`prev-${i}`} style={styles.dayCell}>
                    <Text style={[styles.dayTextInactive, { color: '#334155' }]}>
                      {dayNum}
                    </Text>
                  </View>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = toYMD(viewYear, viewMonth, dayNum);
                const isSelected = dateStr === value;
                const isToday = dateStr === todayStr;

                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    style={[
                      styles.dayCell,
                      isSelected ? styles.dayCellSelected : null,
                      !isSelected && isToday ? [styles.dayCellToday, { borderColor: '#0284c7' }] : null,
                    ]}
                    onPress={() => handleSelectDay(dayNum)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: colors.textPrimary },
                        isSelected ? styles.dayTextSelected : null,
                        !isSelected && isToday ? { color: '#0284c7', fontWeight: '800' } : null,
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Close Button */}
            <View style={[styles.footerRow, { borderTopColor: colors.borderSubtle }]}>
              <TouchableOpacity
                style={[styles.closeModalBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.closeModalBtnText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  triggerRight: {
    paddingLeft: 8,
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarSheet: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  monthYearTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  monthYearSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  navArrows: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#0284c7',
  },
  dayCellToday: {
    borderWidth: 1.5,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dayTextInactive: {
    fontSize: 12,
  },
  footerRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  closeModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  closeModalBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
