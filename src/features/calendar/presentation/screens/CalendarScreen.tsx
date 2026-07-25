// src/features/calendar/presentation/screens/CalendarScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getContainer } from '@core/di/container';
import type { WeekStart } from '@core/config/preferences';
import { Button, Card, EmptyState, Screen } from '@shared/ui';
import { useActiveSemester } from '@shared/hooks/useActiveSemester';
import { formatDate } from '@shared/utils/date';
import { useTheme } from '@theme/ThemeContext';
import { useSubjectsStore } from '@features/subjects/presentation/store/subjectsStore';
import { useTasksStore } from '@features/tasks/presentation/store/tasksStore';
import { TaskListItem } from '@features/tasks/presentation/components/TaskListItem';
import type { TabScreenProps } from '@app/navigation/types';
import { MonthCalendar } from '../components/MonthCalendar';

export function CalendarScreen() {
  const navigation = useNavigation<TabScreenProps<'Calendar'>['navigation']>();
  const { theme } = useTheme();
  const active = useActiveSemester();

  const tasks = useTasksStore(s => s.items);
  const loadTasks = useTasksStore(s => s.loadBySemester);
  const setStatus = useTasksStore(s => s.setStatus);
  const subjects = useSubjectsStore(s => s.items);
  const loadSubjects = useSubjectsStore(s => s.load);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weekStart] = useState<WeekStart>(() =>
    getContainer().preferences.getWeekStart(),
  );

  useFocusEffect(
    useCallback(() => {
      if (active) {
        void loadSubjects(active.id);
        void loadTasks(active.id);
      }
    }, [active, loadSubjects, loadTasks]),
  );

  const subjectMap = useMemo(
    () => new Map(subjects.map(s => [s.id, s])),
    [subjects],
  );

  const marks = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const task of tasks) {
      if (!task.dueDate) {
        continue;
      }
      const color = subjectMap.get(task.subjectId)?.color ?? theme.colors.primary;
      const list = map.get(task.dueDate) ?? [];
      list.push(color);
      map.set(task.dueDate, list);
    }
    return map;
  }, [tasks, subjectMap, theme.colors.primary]);

  const dayTasks = useMemo(
    () => tasks.filter(t => t.dueDate === selectedDate),
    [tasks, selectedDate],
  );

  const changeMonth = (delta: number) => {
    const date = new Date(year, month + delta, 1);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
  };

  const monthLabel = new Date(year, month, 1).toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
  });

  if (!active) {
    return (
      <Screen>
        <EmptyState
          title="Sin semestre activo"
          message="Activa o crea un semestre en Ajustes → Semestres para ver el calendario."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView>
        <View style={styles.monthHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes anterior"
            onPress={() => changeMonth(-1)}
            hitSlop={12}>
            <Text style={[styles.nav, { color: theme.colors.primary }]}>‹</Text>
          </Pressable>
          <Text style={[styles.month, { color: theme.colors.text }]}>
            {monthLabel}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes siguiente"
            onPress={() => changeMonth(1)}
            hitSlop={12}>
            <Text style={[styles.nav, { color: theme.colors.primary }]}>›</Text>
          </Pressable>
        </View>

        <Card>
          <MonthCalendar
            year={year}
            month={month}
            weekStart={weekStart}
            marks={marks}
            selectedDate={selectedDate}
            onSelectDay={setSelectedDate}
          />
        </Card>

        {selectedDate ? (
          <View style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayTitle, { color: theme.colors.text }]}>
                {formatDate(selectedDate)}
              </Text>
              <Button
                title="Nueva tarea"
                onPress={() =>
                  navigation.navigate('TaskForm', { dueDate: selectedDate })
                }
              />
            </View>
            {dayTasks.length === 0 ? (
              <Text style={{ color: theme.colors.textMuted }}>
                Sin entregas este día.
              </Text>
            ) : (
              dayTasks.map(task => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  subjectName={subjectMap.get(task.subjectId)?.name}
                  subjectColor={subjectMap.get(task.subjectId)?.color}
                  onPress={() =>
                    navigation.navigate('TaskDetail', { taskId: task.id })
                  }
                  onToggleDone={() =>
                    void setStatus(
                      task.id,
                      task.status === 'done' ? 'pending' : 'done',
                    )
                  }
                />
              ))
            )}
          </View>
        ) : (
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            Toca un día para ver sus entregas.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  month: { fontSize: 20, fontWeight: '700', textTransform: 'capitalize' },
  nav: { fontSize: 32, fontWeight: '700', paddingHorizontal: 12 },
  daySection: { marginTop: 20 },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayTitle: { fontSize: 17, fontWeight: '700' },
  hint: { textAlign: 'center', marginTop: 20 },
});
