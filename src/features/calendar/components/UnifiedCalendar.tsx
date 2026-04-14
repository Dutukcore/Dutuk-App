import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'react-native-feather';

interface MarkedDate {
  unavailable?: boolean;
  available?: boolean;
  hasEvent?: boolean;
  eventColor?: string;
  selected?: boolean;
}

interface UnifiedCalendarProps {
  initialDate?: Date;
  selectedDate?: number;
  onDayPress?: (day: number, dateString: string, isCurrentMonth: boolean) => void;
  markedDates?: { [date: string]: MarkedDate };
  minDate?: string; // Format: YYYY-MM-DD
  disabled?: boolean;
}

const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
  initialDate,
  selectedDate: propSelectedDate,
  onDayPress,
  markedDates = {},
  minDate,
  disabled = false
}) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const now = initialDate || new Date();
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || now.getDate());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(`${months[now.getMonth()]} ${now.getFullYear()}`);

  // Update selected date when prop changes
  useEffect(() => {
    if (propSelectedDate !== undefined) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonthIndex = currentMonthIndex;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
      if (currentMonthIndex === 0) newYear = currentYear - 1;
    } else {
      newMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;
      if (currentMonthIndex === 11) newYear = currentYear + 1;
    }

    setCurrentMonthIndex(newMonthIndex);
    setCurrentYear(newYear);
    setCurrentMonth(`${months[newMonthIndex]} ${newYear}`);
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentMonthIndex(today.getMonth());
    setCurrentYear(today.getFullYear());
    setCurrentMonth(`${months[today.getMonth()]} ${today.getFullYear()}`);
    setSelectedDate(today.getDate());
  };

  const isDateDisabled = (day: number, isCurrentMonth: boolean): boolean => {
    if (!minDate || !isCurrentMonth) return false;

    const dateString = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateString < minDate;
  };

  const getDateString = (day: number): string => {
    return `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const renderCalendar = () => {
    // Get the first day of the month and number of days
    const firstDay = new Date(currentYear, currentMonthIndex, 1);
    const lastDay = new Date(currentYear, currentMonthIndex + 1, 0);
    const daysInCurrentMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

    // Generate calendar grid
    const calendarDays = [];
    const numRows = Math.ceil((startingDayOfWeek + daysInCurrentMonth) / 7);
    const totalCells = numRows * 7;

    // Previous month's trailing days
    const prevMonth = new Date(currentYear, currentMonthIndex - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isNextMonth: false
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false
      });
    }

    // Next month's leading days
    const remainingCells = totalCells - calendarDays.length;
    for (let day = 1; day <= remainingCells; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true
      });
    }

    // Create weeks array
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    const isTodayInCurrentMonth = new Date().getMonth() === currentMonthIndex && new Date().getFullYear() === currentYear;

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
            disabled={disabled}
            activeOpacity={0.6}
          >
            <ChevronLeft width={20} height={20} stroke="#1c1917" />
          </TouchableOpacity>

          <View style={styles.monthTitleContainer}>
            <Text style={styles.monthText}>{currentMonth}</Text>
            {!isTodayInCurrentMonth && (
              <TouchableOpacity
                onPress={navigateToToday}
                style={styles.todayButton}
                activeOpacity={0.7}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
            disabled={disabled}
            activeOpacity={0.6}
          >
            <ChevronRight width={20} height={20} stroke="#1c1917" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
            <Text key={idx} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((dayObj, dayIndex) => {
              const { day, isCurrentMonth } = dayObj;
              const dateString = isCurrentMonth ? getDateString(day) : '';
              const markedDate = markedDates[dateString];

              const isUnavailable = markedDate?.unavailable || false;
              const isAvailable = markedDate?.available || false;
              const hasEvent = markedDate?.hasEvent || false;
              const isSelected = day === selectedDate && isCurrentMonth;
              const isDisabled = isDateDisabled(day, isCurrentMonth);
              const isRealToday = isTodayInCurrentMonth && day === new Date().getDate() && isCurrentMonth;

              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                    isAvailable && !isSelected && styles.availableDay,
                    isUnavailable && !isSelected && styles.unavailableDay,
                    (disabled || isDisabled) && styles.nonInteractiveDay,
                    isRealToday && !isSelected && !isAvailable && !isUnavailable && styles.todayCell
                  ]}
                  onPress={() => {
                    if (isCurrentMonth && !isDisabled && !disabled) {
                      setSelectedDate(day);
                      onDayPress?.(day, dateString, isCurrentMonth);
                    }
                  }}
                  disabled={disabled || isDisabled}
                  activeOpacity={disabled ? 1 : 0.6}
                >
                  <View style={styles.dayContent}>
                    <Text style={[
                      styles.dayText,
                      !isCurrentMonth && styles.otherMonthText,
                      isUnavailable && styles.unavailableText,
                      isAvailable && !isSelected && styles.availableText,
                      isSelected && styles.selectedDayText,
                      isDisabled && styles.disabledText,
                      isRealToday && !isSelected && styles.todayText
                    ]}>
                      {day}
                    </Text>
                    {hasEvent && isCurrentMonth && !isSelected && (
                      <View style={[
                        styles.eventDot,
                        { backgroundColor: markedDate?.eventColor || '#800000' }
                      ]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return renderCalendar();
};

const styles = StyleSheet.create({
  calendar: {
    width: "100%",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  navButton: {
    width: 42,
    height: 42,
    backgroundColor: "rgba(128, 0, 0, 0.05)",
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.03)',
  },
  monthTitleContainer: {
    alignItems: 'center',
    gap: 4,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1c1917",
    fontFamily: "Inter",
    letterSpacing: -0.5,
  },
  todayButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2,
  },
  todayButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#a8a29e",
    fontFamily: "Inter",
    width: 36,
    textAlign: "center",
    letterSpacing: 1,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: "#800000",
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  availableDay: {
    backgroundColor: "#1c1917",
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unavailableDay: {
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: '#800000',
    borderStyle: 'dashed',
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1c1917",
    fontFamily: "Inter",
  },
  otherMonthText: {
    color: "#e7e5e4",
  },
  unavailableText: {
    color: "#FF3B30",
    fontWeight: "800",
  },
  availableText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  todayText: {
    color: "#800000",
    fontWeight: "800",
  },
  disabledText: {
    color: "#e7e5e4",
  },
  nonInteractiveDay: {
    opacity: 0.3,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
});

export default UnifiedCalendar;
