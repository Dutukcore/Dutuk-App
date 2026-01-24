import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    const totalCells = 42; // 6 rows × 7 days

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

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigateMonth('prev')}
            disabled={disabled}
          >
            <ChevronLeft width={18} height={18} stroke="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentMonth}</Text>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigateMonth('next')}
            disabled={disabled}
          >
            <ChevronRight width={18} height={18} stroke="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
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

              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                    isAvailable && !isSelected && styles.availableDay,
                  ]}
                  onPress={() => {
                    if (isCurrentMonth && !isDisabled && !disabled) {
                      setSelectedDate(day);
                      onDayPress?.(day, dateString, isCurrentMonth);
                    }
                  }}
                  disabled={disabled || isDisabled}
                >
                  <View style={styles.dayContent}>
                    <Text style={[
                      styles.dayText,
                      !isCurrentMonth && styles.otherMonthText,
                      isUnavailable && styles.unavailableText,
                      isAvailable && !isSelected && styles.availableText,
                      isSelected && styles.selectedDayText,
                      isDisabled && styles.disabledText,
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
    marginBottom: 24,
  },
  navButton: {
    width: 36,
    height: 36,
    backgroundColor: "#800000",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  monthText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1c1917",
    fontFamily: "Inter",
    letterSpacing: -0.2,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#57534e",
    fontFamily: "Inter",
    width: 30,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayCell: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDay: {
    backgroundColor: "#800000",
    borderRadius: 15,
  },
  availableDay: {
    backgroundColor: "#000000",
    borderRadius: 15,
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1c1917",
    fontFamily: "Inter",
  },
  otherMonthText: {
    color: "#d6d3d1",
  },
  unavailableText: {
    color: "#FF3B30",
    fontWeight: "700",
  },
  availableText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  disabledText: {
    color: "#d6d3d1",
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});

export default UnifiedCalendar;
