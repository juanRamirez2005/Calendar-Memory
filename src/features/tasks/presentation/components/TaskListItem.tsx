// src/features/tasks/presentation/components/TaskListItem.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Pill } from '@shared/ui';
import { formatDate } from '@shared/utils/date';
import { useTheme } from '@theme/ThemeContext';
import type { Task } from '../../domain/entities/Task';
import { PRIORITY_COLOR, PRIORITY_LABEL, STATUS_LABEL } from '../taskLabels';

type Props = {
  task: Task;
  subjectName?: string;
  subjectColor?: string;
  onPress: () => void;
  onToggleDone: () => void;
};

function TaskListItemBase({
  task,
  subjectName,
  subjectColor,
  onPress,
  onToggleDone,
}: Props) {
  const { theme } = useTheme();
  const done = task.status === 'done';

  return (
    <Card onPress={onPress} accent={subjectColor}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={done ? 'Marcar pendiente' : 'Marcar hecha'}
          onPress={onToggleDone}
          hitSlop={8}
          style={[
            styles.check,
            {
              borderColor: done ? theme.colors.success : theme.colors.border,
              backgroundColor: done ? theme.colors.success : 'transparent',
            },
          ]}>
          {done ? <Text style={styles.checkMark}>✓</Text> : null}
        </Pressable>

        <View style={styles.flex}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                textDecorationLine: done ? 'line-through' : 'none',
                opacity: done ? 0.6 : 1,
              },
            ]}>
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            {subjectName ? (
              <Pill
                label={subjectName}
                color={subjectColor ?? theme.colors.primary}
                filled
              />
            ) : null}
            <Text style={[styles.due, { color: theme.colors.textMuted }]}>
              {task.dueDate ? `🗓  ${formatDate(task.dueDate)}` : 'Sin fecha'}
            </Text>
          </View>
        </View>

        <Pill
          label={done ? STATUS_LABEL.done : PRIORITY_LABEL[task.priority]}
          color={done ? theme.colors.success : theme.colors[PRIORITY_COLOR[task.priority]]}
          softColor={
            done
              ? theme.colors.successSoft
              : theme.colors[`${PRIORITY_COLOR[task.priority]}Soft` as const]
          }
        />
      </View>
    </Card>
  );
}

export const TaskListItem = React.memo(TaskListItemBase);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkMark: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  flex: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  due: { fontSize: 12 },
});
