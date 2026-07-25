// src/features/tasks/presentation/screens/TaskFormScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, EmptyState, Screen, TextField } from '@shared/ui';
import { useActiveSemester } from '@shared/hooks/useActiveSemester';
import { useTheme } from '@theme/ThemeContext';
import { useSubjectsStore } from '@features/subjects/presentation/store/subjectsStore';
import type { RootScreenProps } from '@app/navigation/types';
import {
  PRIORITIES,
  TASK_STATUSES,
  type Priority,
  type TaskStatus,
} from '../../domain/entities/Task';
import { PRIORITY_LABEL, STATUS_LABEL } from '../taskLabels';
import { useTasksStore } from '../store/tasksStore';

export function TaskFormScreen() {
  const navigation = useNavigation<RootScreenProps<'TaskForm'>['navigation']>();
  const route = useRoute<RootScreenProps<'TaskForm'>['route']>();
  const { theme } = useTheme();
  const active = useActiveSemester();

  const subjects = useSubjectsStore(s => s.items);
  const loadSubjects = useSubjectsStore(s => s.load);
  const { items, create, update } = useTasksStore();

  const editing = useMemo(
    () => items.find(t => t.id === route.params?.taskId),
    [items, route.params?.taskId],
  );

  useEffect(() => {
    if (active) {
      void loadSubjects(active.id);
    }
  }, [active, loadSubjects]);

  const [subjectId, setSubjectId] = useState(
    editing?.subjectId ?? route.params?.subjectId ?? '',
  );

  // Auto-selecciona una materia si no hay ninguna elegida, para que el botón
  // no quede deshabilitado sin motivo visible al crear.
  useEffect(() => {
    if (!subjectId && subjects.length > 0) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [dueDate, setDueDate] = useState(
    editing?.dueDate ?? route.params?.dueDate ?? '',
  );
  const [priority, setPriority] = useState<Priority>(
    editing?.priority ?? 'medium',
  );
  const [status, setStatus] = useState<TaskStatus>(editing?.status ?? 'pending');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    setError(null);
    const base = {
      title,
      description: description.trim() || undefined,
      dueDate: dueDate.trim() || undefined,
      priority,
    };
    let ok = false;
    if (editing) {
      ok = await update(editing.id, { ...base, subjectId, status });
    } else {
      ok = await create({ ...base, subjectId });
    }
    if (ok) {
      navigation.goBack();
    } else {
      setError(useTasksStore.getState().error);
    }
  }, [
    title,
    description,
    dueDate,
    priority,
    status,
    subjectId,
    editing,
    update,
    create,
    navigation,
  ]);

  if (subjects.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Primero crea una materia"
          message="Las tareas se asignan a una materia. Crea una materia en la pestaña Materias."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {editing ? 'Editar tarea' : 'Nueva tarea'}
        </Text>

        <Text style={[styles.label, { color: theme.colors.textMuted }]}>
          Materia
        </Text>
        <View style={styles.chips}>
          {subjects.map(s => {
            const selected = s.id === subjectId;
            return (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                onPress={() => setSubjectId(s.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? s.color : theme.colors.surface,
                    borderColor: s.color,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? '#FFFFFF' : theme.colors.text,
                    fontWeight: '600',
                  }}>
                  {s.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextField
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="Entregar informe"
        />
        <TextField
          label="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextField
          label="Fecha de entrega (YYYY-MM-DD, opcional)"
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="2026-03-15"
        />

        <Text style={[styles.label, { color: theme.colors.textMuted }]}>
          Prioridad
        </Text>
        <Segmented
          options={PRIORITIES.map(p => ({ value: p, label: PRIORITY_LABEL[p] }))}
          value={priority}
          onChange={setPriority}
        />

        {editing ? (
          <>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>
              Estado
            </Text>
            <Segmented
              options={TASK_STATUSES.map(s => ({
                value: s,
                label: STATUS_LABEL[s],
              }))}
              value={status}
              onChange={setStatus}
            />
          </>
        ) : null}

        {error ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}

        <Button
          title={editing ? 'Guardar cambios' : 'Crear tarea'}
          onPress={onSubmit}
          disabled={!subjectId}
        />
      </ScrollView>
    </Screen>
  );
}

type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  const { theme } = useTheme();
  return (
    <View style={styles.segment}>
      {options.map(opt => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segmentItem,
              {
                backgroundColor: selected
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text
              style={{
                color: selected ? theme.colors.primaryText : theme.colors.text,
                fontWeight: '600',
              }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  segment: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  error: { fontSize: 13, marginBottom: 12 },
});
