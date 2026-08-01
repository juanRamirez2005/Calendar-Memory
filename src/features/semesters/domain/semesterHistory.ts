// src/features/semesters/domain/semesterHistory.ts
import type { Subject } from '@features/subjects/domain/entities/Subject';
import type { Task } from '@features/tasks/domain/entities/Task';

/** Cómo terminó una tarea respecto a su fecha de entrega. */
export type Punctuality = 'on_time' | 'late' | 'unknown';

export type TaskOutcome = {
  task: Task;
  subjectName?: string;
  subjectColor?: string;
  punctuality: Punctuality;
  /** Días de diferencia entre completado y entrega. Negativo = con antelación. */
  daysOff?: number;
};

export type TaskTotals = {
  total: number;
  done: number;
  pending: number;
  inProgress: number;
  /** Sin completar y con fecha de entrega ya pasada. */
  overdue: number;
  /** Completadas después de su fecha de entrega. */
  late: number;
  /** Porcentaje completado, 0-100 y redondeado. */
  completionRate: number;
};

export type SubjectBreakdown = {
  subject: Subject;
  totals: TaskTotals;
};

export type SemesterHistory = {
  totals: TaskTotals;
  bySubject: SubjectBreakdown[];
  /** Tareas completadas, de la más reciente a la más antigua. */
  timeline: TaskOutcome[];
};

const MS_PER_DAY = 86_400_000;

/** Medianoche local del día de una clave YYYY-MM-DD. */
function startOfDay(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

/**
 * Puntualidad de una tarea completada. Se compara por día, no por instante:
 * entregar a las 23:50 del día de vencimiento es a tiempo, no "casi tarde".
 * Sin `completedAt` (tareas previas a la migración v3) o sin `dueDate` no hay
 * nada que comparar, y decir "a tiempo" sería inventarse el dato.
 */
export function punctualityOf(task: Task): {
  punctuality: Punctuality;
  daysOff?: number;
} {
  if (task.status !== 'done' || !task.completedAt || !task.dueDate) {
    return { punctuality: 'unknown' };
  }
  const completed = new Date(task.completedAt);
  if (Number.isNaN(completed.getTime())) {
    return { punctuality: 'unknown' };
  }
  const completedDay = startOfDay(
    `${completed.getFullYear()}-${String(completed.getMonth() + 1).padStart(2, '0')}-${String(completed.getDate()).padStart(2, '0')}`,
  );
  const daysOff = Math.round((completedDay - startOfDay(task.dueDate)) / MS_PER_DAY);
  return { punctuality: daysOff > 0 ? 'late' : 'on_time', daysOff };
}

export function summarize(tasks: Task[], today: string): TaskTotals {
  const todayStart = startOfDay(today);
  let done = 0;
  let pending = 0;
  let inProgress = 0;
  let overdue = 0;
  let late = 0;

  for (const task of tasks) {
    if (task.status === 'done') {
      done++;
      if (punctualityOf(task).punctuality === 'late') {
        late++;
      }
      continue;
    }
    if (task.status === 'in_progress') {
      inProgress++;
    } else {
      pending++;
    }
    if (task.dueDate && startOfDay(task.dueDate) < todayStart) {
      overdue++;
    }
  }

  return {
    total: tasks.length,
    done,
    pending,
    inProgress,
    overdue,
    late,
    completionRate: tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100),
  };
}

/**
 * Construye el historial de un semestre a partir de sus materias y tareas.
 * Función pura: la pantalla solo la consume, y así se puede probar sin device.
 */
export function buildSemesterHistory(
  subjects: Subject[],
  tasks: Task[],
  today: string,
): SemesterHistory {
  const subjectById = new Map(subjects.map(s => [s.id, s]));

  const bySubject = subjects
    .map(subject => ({
      subject,
      totals: summarize(
        tasks.filter(t => t.subjectId === subject.id),
        today,
      ),
    }))
    // Las materias sin tareas no aportan nada al historial.
    .filter(entry => entry.totals.total > 0)
    .sort((a, b) => b.totals.total - a.totals.total);

  const timeline = tasks
    .filter(t => t.status === 'done' && t.completedAt)
    .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1))
    .map(task => {
      const subject = subjectById.get(task.subjectId);
      return {
        task,
        subjectName: subject?.name,
        subjectColor: subject?.color,
        ...punctualityOf(task),
      };
    });

  return { totals: summarize(tasks, today), bySubject, timeline };
}
