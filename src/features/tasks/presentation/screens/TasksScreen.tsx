// src/features/tasks/presentation/screens/TasksScreen.tsx
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button, EmptyState, Screen } from '@shared/ui';
import { useActiveSemester } from '@shared/hooks/useActiveSemester';
import { useTheme } from '@theme/ThemeContext';
import { useSubjectsStore } from '@features/subjects/presentation/store/subjectsStore';
import type { TabScreenProps } from '@app/navigation/types';
import { useTasksStore } from '../store/tasksStore';
import { TaskListItem } from '../components/TaskListItem';
import type { Task } from '../../domain/entities/Task';

export function TasksScreen() {
  const navigation = useNavigation<TabScreenProps<'Tasks'>['navigation']>();
  const { theme } = useTheme();
  const active = useActiveSemester();
  const { items, loadBySemester, setStatus } = useTasksStore();
  const subjects = useSubjectsStore(s => s.items);
  const loadSubjects = useSubjectsStore(s => s.load);

  useFocusEffect(
    useCallback(() => {
      if (active) {
        void loadSubjects(active.id);
        void loadBySemester(active.id);
      }
    }, [active, loadBySemester, loadSubjects]),
  );

  const subjectMap = useMemo(
    () => new Map(subjects.map(s => [s.id, s])),
    [subjects],
  );

  if (!active) {
    return (
      <Screen>
        <EmptyState
          title="Sin semestre activo"
          message="Activa o crea un semestre en Ajustes → Semestres para registrar tareas."
        />
      </Screen>
    );
  }

  const renderItem = ({ item }: { item: Task }) => {
    const subject = subjectMap.get(item.subjectId);
    return (
      <TaskListItem
        task={item}
        subjectName={subject?.name}
        subjectColor={subject?.color}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
        onToggleDone={() =>
          void setStatus(item.id, item.status === 'done' ? 'pending' : 'done')
        }
      />
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Tareas</Text>
        <Button
          title="Nueva"
          onPress={() => navigation.navigate('TaskForm', {})}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            title="Sin tareas"
            message="Crea una tarea y asígnala a una materia con su fecha de entrega."
          />
        }
        contentContainerStyle={items.length === 0 ? styles.grow : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700' },
  grow: { flexGrow: 1 },
});
