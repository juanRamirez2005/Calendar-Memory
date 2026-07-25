// src/features/tasks/presentation/screens/TaskDetailScreen.tsx
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { getContainer } from '@core/di/container';
import { Button, Pill, Screen } from '@shared/ui';
import { formatDate } from '@shared/utils/date';
import { useTheme } from '@theme/ThemeContext';
import type { RootScreenProps } from '@app/navigation/types';
import type { Task } from '../../domain/entities/Task';
import { PRIORITY_LABEL, STATUS_LABEL } from '../taskLabels';
import { useTasksStore } from '../store/tasksStore';

export function TaskDetailScreen() {
  const navigation = useNavigation<RootScreenProps<'TaskDetail'>['navigation']>();
  const route = useRoute<RootScreenProps<'TaskDetail'>['route']>();
  const { theme } = useTheme();
  const { taskId } = route.params;

  const [task, setTask] = useState<Task | null>(null);
  const [subjectName, setSubjectName] = useState<string>('');
  const [subjectColor, setSubjectColor] = useState<string>(theme.colors.primary);
  const { setStatus, remove } = useTasksStore();

  const fetch = useCallback(async () => {
    const res = await getContainer().tasks.get.execute(taskId);
    if (res.ok && res.value) {
      setTask(res.value);
      const subj = await getContainer().subjects.get.execute(res.value.subjectId);
      if (subj.ok && subj.value) {
        setSubjectName(subj.value.name);
        setSubjectColor(subj.value.color);
      }
    }
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      void fetch();
    }, [fetch]),
  );

  if (!task) {
    return (
      <Screen>
        <Text style={{ color: theme.colors.textMuted }}>Cargando…</Text>
      </Screen>
    );
  }

  const done = task.status === 'done';

  const confirmDelete = () => {
    Alert.alert('Eliminar tarea', `Se eliminará "${task.title}".`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await remove(task.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const toggleDone = async () => {
    await setStatus(task.id, done ? 'pending' : 'done');
    await fetch();
  };

  return (
    <Screen>
      <ScrollView>
        <Pill label={subjectName || 'Materia'} color={subjectColor} filled />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          <Pill
            label={STATUS_LABEL[task.status]}
            color={done ? theme.colors.success : theme.colors.textMuted}
          />
          <Pill
            label={`Prioridad ${PRIORITY_LABEL[task.priority]}`}
            color={theme.colors.primary}
          />
        </View>

        <Text style={[styles.dueLabel, { color: theme.colors.textMuted }]}>
          Fecha de entrega
        </Text>
        <Text style={[styles.due, { color: theme.colors.text }]}>
          {formatDate(task.dueDate)}
        </Text>

        {task.description ? (
          <>
            <Text style={[styles.dueLabel, { color: theme.colors.textMuted }]}>
              Descripción
            </Text>
            <Text style={[styles.description, { color: theme.colors.text }]}>
              {task.description}
            </Text>
          </>
        ) : null}

        <View style={styles.actions}>
          <Button
            title={done ? 'Marcar pendiente' : 'Marcar hecha'}
            onPress={toggleDone}
          />
          <Button
            title="Editar"
            variant="secondary"
            onPress={() =>
              navigation.navigate('TaskForm', { taskId: task.id })
            }
          />
          <Button title="Eliminar" variant="danger" onPress={confirmDelete} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', marginTop: 12 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  dueLabel: { fontSize: 13, fontWeight: '600', marginTop: 20 },
  due: { fontSize: 16, marginTop: 4 },
  description: { fontSize: 15, marginTop: 4, lineHeight: 22 },
  actions: { gap: 12, marginTop: 32 },
});
