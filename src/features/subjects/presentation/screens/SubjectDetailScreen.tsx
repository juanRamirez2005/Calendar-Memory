// src/features/subjects/presentation/screens/SubjectDetailScreen.tsx
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { getContainer } from '@core/di/container';
import { Button, EmptyState, Pill, Screen } from '@shared/ui';
import { useTheme } from '@theme/ThemeContext';
import { useTasksStore } from '@features/tasks/presentation/store/tasksStore';
import { TaskListItem } from '@features/tasks/presentation/components/TaskListItem';
import type { Task } from '@features/tasks/domain/entities/Task';
import type { RootScreenProps } from '@app/navigation/types';
import { useSubjectsStore } from '../store/subjectsStore';
import type { Subject } from '../../domain/entities/Subject';

export function SubjectDetailScreen() {
  const navigation =
    useNavigation<RootScreenProps<'SubjectDetail'>['navigation']>();
  const route = useRoute<RootScreenProps<'SubjectDetail'>['route']>();
  const { theme } = useTheme();
  const { subjectId } = route.params;

  const [subject, setSubject] = useState<Subject | null>(null);
  const { items: tasks, loadBySubject, setStatus } = useTasksStore();
  const removeSubject = useSubjectsStore(s => s.remove);

  const fetch = useCallback(async () => {
    const res = await getContainer().subjects.get.execute(subjectId);
    if (res.ok) {
      setSubject(res.value);
    }
    await loadBySubject(subjectId);
  }, [subjectId, loadBySubject]);

  useFocusEffect(
    useCallback(() => {
      void fetch();
    }, [fetch]),
  );

  if (!subject) {
    return (
      <Screen>
        <Text style={{ color: theme.colors.textMuted }}>Cargando…</Text>
      </Screen>
    );
  }

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar materia',
      `Se eliminará "${subject.name}" con todas sus tareas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await removeSubject(subject.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TaskListItem
      task={item}
      subjectColor={subject.color}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      onToggleDone={() =>
        void setStatus(item.id, item.status === 'done' ? 'pending' : 'done')
      }
    />
  );

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={[styles.dot, { backgroundColor: subject.color }]} />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {subject.name}
        </Text>
      </View>
      <View style={styles.meta}>
        {subject.code ? <Pill label={subject.code} color={subject.color} /> : null}
        {subject.professor ? (
          <Text style={{ color: theme.colors.textMuted }}>
            {subject.professor}
          </Text>
        ) : null}
        {subject.credits != null ? (
          <Text style={{ color: theme.colors.textMuted }}>
            {subject.credits} créditos
          </Text>
        ) : null}
      </View>

      <View style={styles.subjectActions}>
        <Button
          title="Editar materia"
          variant="secondary"
          onPress={() =>
            navigation.navigate('SubjectForm', { subjectId: subject.id })
          }
          style={styles.flex}
        />
        <Button
          title="Eliminar"
          variant="danger"
          onPress={confirmDelete}
          style={styles.flex}
        />
      </View>

      <View style={styles.tasksHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Tareas
        </Text>
        <Button
          title="Nueva tarea"
          onPress={() =>
            navigation.navigate('TaskForm', { subjectId: subject.id })
          }
        />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState title="Sin tareas" message="Agrega la primera tarea de esta materia." />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  title: { fontSize: 24, fontWeight: '700', flexShrink: 1 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  subjectActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  flex: { flex: 1 },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
});
