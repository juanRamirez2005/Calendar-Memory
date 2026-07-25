// src/features/calendar/presentation/components/MonthCalendar.tsx
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { toDateKey } from '@shared/utils/date';
import { useTheme } from '@theme/ThemeContext';
import type { WeekStart } from '@core/config/preferences';

type Cell = { key: string; day: number } | null;

type Props = {
  year: number;
  month: number; // 0-11
  weekStart: WeekStart;
  marks: Map<string, string[]>;
  selectedDate: string | null;
  onSelectDay: (dateKey: string) => void;
};

const WEEKDAYS_SUN = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function buildCells(year: number, month: number, weekStart: WeekStart): Cell[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=domingo
  const offset = (firstDay - weekStart + 7) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Cell[] = [];
  for (let i = 0; i < offset; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ key: toDateKey(new Date(year, month, day)), day });
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function MonthCalendarBase({
  year,
  month,
  weekStart,
  marks,
  selectedDate,
  onSelectDay,
}: Props) {
  const { theme } = useTheme();
  const cells = useMemo(
    () => buildCells(year, month, weekStart),
    [year, month, weekStart],
  );

  const weekdays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => WEEKDAYS_SUN[(i + weekStart) % 7]);
  }, [weekStart]);

  const todayKey = toDateKey(new Date());

  return (
    <View>
      <View style={styles.weekRow}>
        {weekdays.map((label, i) => (
          <Text
            key={i}
            style={[styles.weekday, { color: theme.colors.textMuted }]}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (!cell) {
            return <View key={`blank-${index}`} style={styles.cell} />;
          }
          const colors = marks.get(cell.key) ?? [];
          const isSelected = cell.key === selectedDate;
          const isToday = cell.key === todayKey;
          return (
            <Pressable
              key={cell.key}
              accessibilityRole="button"
              accessibilityLabel={cell.key}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectDay(cell.key)}
              style={[
                styles.cell,
                isSelected && {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.sm,
                },
              ]}>
              <Text
                style={[
                  styles.dayText,
                  {
                    color: isSelected
                      ? theme.colors.primaryText
                      : isToday
                        ? theme.colors.primary
                        : theme.colors.text,
                    fontWeight: isToday || isSelected ? '700' : '400',
                  },
                ]}>
                {cell.day}
              </Text>
              <View style={styles.dots}>
                {colors.slice(0, 3).map((c, i) => (
                  <View
                    key={i}
                    style={[styles.dot, { backgroundColor: c }]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const MonthCalendar = React.memo(MonthCalendarBase);

const styles = StyleSheet.create({
  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  dayText: { fontSize: 15 },
  dots: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    marginTop: 2,
    alignItems: 'center',
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
