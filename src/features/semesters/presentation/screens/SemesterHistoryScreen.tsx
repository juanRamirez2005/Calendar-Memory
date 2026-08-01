// src/features/semesters/presentation/screens/SemesterHistoryScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { getContainer } from '@core/di/container';
import {
  Card,
  EmptyState,
  Pill,
  ProgressBar,
  Screen,
  STACK_SCREEN_EDGES,
} from '@shared/ui';
import { formatDate, todayKey } from '@shared/utils/date';
import { useTheme } from '@theme/ThemeContext';
import type { RootScreenProps } from '@app/navigation/types';
import type { Semester } from '../../domain/entities/Semester';
import {
  buildSemesterHistory,
  type SemesterHistory,
  type TaskOutcome,
} from '../../domain/semesterHistory';

type Loaded = { semester: Semester; history: SemesterHistory };

export function SemesterHistoryScreen() {
  const route = useRoute<RootScreenProps<'SemesterHistory'>['route']>();
  const { theme } = useTheme();
  const { semesterId } = route.params;
  const [data, setData] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const load = async () => {
        const c = getContainer();
        const [semester, subjects, tasks] = await Promise.all([
          c.semesters.get.execute(semesterId),
          c.subjects.listBySemester.execute(semesterId),
          c.tasks.listBySemester.execute(semesterId),
        ]);
        if (!mounted) {
          return;
        }
        if (!semester.ok || !semester.value || !subjects.ok || !tasks.ok) {
          setFailed(true);
          return;
        }
        setData({
          semester: semester.value,
          history: buildSemesterHistory(
            subjects.value,
            tasks.value,
            todayKey(),
          ),
        });
      };
      void load();
      return () => {
        mounted = false;
      };
    }, [semesterId]),
  );

  if (failed) {
    return (
      <Screen edges={STACK_SCREEN_EDGES}>
        <EmptyState
          emoji="⚠️"
          title="No se pudo cargar"
          message="No fue posible leer el historial de este semestre."
        />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen edges={STACK_SCREEN_EDGES}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  const { semester, history } = data;
  const { totals } = history;

  return (
    <Screen edges={STACK_SCREEN_EDGES}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {semester.name}
          </Text>
          {semester.isActive ? (
            <Pill label="Activo" color={theme.colors.success} filled />
          ) : semester.isArchived ? (
            <Pill label="Archivado" color={theme.colors.textMuted} />
          ) : null}
        </View>
        <Text style={[styles.dates, { color: theme.colors.textMuted }]}>
          {formatDate(semester.startDate)} — {formatDate(semester.endDate)}
        </Text>

        {totals.total === 0 ? (
          <EmptyState
            emoji="📭"
            title="Sin tareas registradas"
            message="Este semestre no tiene tareas, así que todavía no hay historial que mostrar."
          />
        ) : (
          <>
            <Card>
              <View style={styles.statRow}>
                <Stat label="tareas" value={totals.total} />
                <Stat
                  label="hechas"
                  value={totals.done}
                  color={theme.colors.success}
                />
                <Stat
                  label="pendientes"
                  value={totals.pending + totals.inProgress}
                  color={theme.colors.warning}
                />
                <Stat
                  label="vencidas"
                  value={totals.overdue}
                  color={theme.colors.danger}
                />
              </View>
              <View style={styles.progressBlock}>
                <ProgressBar
                  value={totals.completionRate}
                  color={theme.colors.success}
                  label={`Avance del semestre: ${totals.completionRate}%`}
                />
                <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                  {totals.completionRate}% completado
                  {totals.late > 0
                    ? ` · ${totals.late} ${totals.late === 1 ? 'entregada tarde' : 'entregadas tarde'}`
                    : ''}
                </Text>
              </View>
            </Card>

            <Text style={[styles.section, { color: theme.colors.text }]}>
              Por materia
            </Text>
            {history.bySubject.map(({ subject, totals: t }) => (
              <Card key={subject.id} accent={subject.color}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.subjectName, { color: theme.colors.text }]}>
                    {subject.name}
                  </Text>
                  <Text style={[styles.count, { color: theme.colors.textMuted }]}>
                    {t.done}/{t.total}
                  </Text>
                </View>
                <View style={styles.subjectProgress}>
                  <ProgressBar
                    value={t.completionRate}
                    color={subject.color}
                    label={`${subject.name}: ${t.completionRate}% completado`}
                  />
                </View>
                <Text style={[styles.subjectMeta, { color: theme.colors.textMuted }]}>
                  {describeSubject(t.pending + t.inProgress, t.overdue, t.late)}
                </Text>
              </Card>
            ))}

            <Text style={[styles.section, { color: theme.colors.text }]}>
              Cronología
            </Text>
            {history.timeline.length === 0 ? (
              <Card>
                <Text style={{ color: theme.colors.textMuted }}>
                  Aún no hay tareas completadas con fecha registrada. Las que
                  marques como hechas de ahora en adelante aparecerán aquí.
                </Text>
              </Card>
            ) : (
              history.timeline.map(entry => (
                <TimelineRow key={entry.task.id} entry={entry} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function describeSubject(open: number, overdue: number, late: number): string {
  const parts: string[] = [];
  if (open > 0) {
    parts.push(`${open} sin terminar`);
  }
  if (overdue > 0) {
    parts.push(`${overdue} vencida${overdue === 1 ? '' : 's'}`);
  }
  if (late > 0) {
    parts.push(`${late} entregada${late === 1 ? '' : 's'} tarde`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Todo al día';
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: color ?? theme.colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

function TimelineRow({ entry }: { entry: TaskOutcome }) {
  const { theme } = useTheme();
  const { task, punctuality, daysOff } = entry;
  const late = punctuality === 'late';

  return (
    <Card accent={entry.subjectColor}>
      <View style={styles.rowBetween}>
        <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
          {task.title}
        </Text>
        <Text style={[styles.when, { color: theme.colors.textMuted }]}>
          {formatDate(task.completedAt)}
        </Text>
      </View>
      <View style={styles.timelineMeta}>
        {entry.subjectName ? (
          <Text style={{ color: theme.colors.textMuted }}>
            {entry.subjectName}
          </Text>
        ) : null}
        <Pill
          label={punctualityLabel(punctuality, daysOff)}
          color={late ? theme.colors.danger : theme.colors.success}
          softColor={late ? theme.colors.dangerSoft : theme.colors.successSoft}
        />
      </View>
    </Card>
  );
}

function punctualityLabel(
  punctuality: TaskOutcome['punctuality'],
  daysOff?: number,
): string {
  if (punctuality === 'unknown' || daysOff === undefined) {
    return 'Entregada';
  }
  if (daysOff > 0) {
    return `${daysOff} día${daysOff === 1 ? '' : 's'} tarde`;
  }
  if (daysOff === 0) {
    return 'El mismo día';
  }
  const early = Math.abs(daysOff);
  return `${early} día${early === 1 ? '' : 's'} antes`;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: '700', flexShrink: 1 },
  dates: { fontSize: 13.5, marginTop: 4, marginBottom: 20 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11.5, marginTop: 2 },
  progressBlock: { marginTop: 18 },
  progressText: { fontSize: 12.5, marginTop: 8 },
  section: { fontSize: 18, fontWeight: '700', marginTop: 10, marginBottom: 10 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  subjectName: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  count: { fontSize: 14, fontWeight: '700' },
  subjectProgress: { marginTop: 10 },
  subjectMeta: { fontSize: 12.5, marginTop: 8 },
  taskTitle: { fontSize: 15.5, fontWeight: '600', flexShrink: 1 },
  when: { fontSize: 12.5 },
  timelineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
});
