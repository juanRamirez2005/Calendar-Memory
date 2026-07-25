// src/features/notifications/domain/notificationPlanner.ts

/** Nivel de advertencia según cuánto falta para la entrega. */
export type Urgency = 'far' | 'soon' | 'tomorrow' | 'today' | 'overdue';

export type ReminderPlan = {
  /** Id determinista por tarea + día, para poder cancelar/re-programar. */
  id: string;
  taskId: string;
  timestamp: number; // epoch ms
  urgency: Urgency;
  title: string;
  body: string;
};

export type PlannerInput = {
  taskId: string;
  title: string;
  subjectName?: string;
  dueDate?: string; // YYYY-MM-DD
  status: string; // 'pending' | 'in_progress' | 'done'
};

/** Hora del día (local) a la que se disparan los recordatorios. */
export const REMINDER_HOUR = 9;
/** Nº de días previos a la entrega en los que se recuerda, día a día. */
export const REMINDER_WINDOW_DAYS = 7;

const EMOJI: Record<Urgency, string> = {
  far: '🟢',
  soon: '🟡',
  tomorrow: '🟠',
  today: '🔴',
  overdue: '⚠️',
};

export function urgencyForDaysLeft(daysLeft: number): Urgency {
  if (daysLeft < 0) return 'overdue';
  if (daysLeft === 0) return 'today';
  if (daysLeft === 1) return 'tomorrow';
  if (daysLeft <= 3) return 'soon';
  return 'far';
}

export function urgencyEmoji(urgency: Urgency): string {
  return EMOJI[urgency];
}

function dueDateAtHour(dateKey: string, hour: number): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, hour, 0, 0, 0);
}

function headline(urgency: Urgency, daysLeft: number): string {
  switch (urgency) {
    case 'today':
      return '¡Hoy vence!';
    case 'tomorrow':
      return '¡Mañana se entrega!';
    case 'soon':
    case 'far':
      return `Faltan ${daysLeft} días`;
    case 'overdue':
      return 'Tarea vencida';
  }
}

/**
 * Calcula los recordatorios (uno por día en la ventana previa) para una tarea.
 * Solo devuelve timestamps futuros; vacío si no hay fecha, ya está hecha, o
 * la ventana quedó en el pasado.
 */
export function planRemindersForTask(
  input: PlannerInput,
  now: Date = new Date(),
): ReminderPlan[] {
  if (!input.dueDate || input.status === 'done') {
    return [];
  }
  const due = dueDateAtHour(input.dueDate, REMINDER_HOUR);
  if (Number.isNaN(due.getTime())) {
    return [];
  }

  const plans: ReminderPlan[] = [];
  for (let offset = REMINDER_WINDOW_DAYS; offset >= 0; offset--) {
    const when = new Date(due);
    when.setDate(when.getDate() - offset);
    if (when.getTime() <= now.getTime()) {
      continue; // no programar recordatorios en el pasado
    }
    const urgency = urgencyForDaysLeft(offset);
    const subject = input.subjectName ? ` · ${input.subjectName}` : '';
    plans.push({
      id: `${input.taskId}-${offset}`,
      taskId: input.taskId,
      timestamp: when.getTime(),
      urgency,
      title: `${EMOJI[urgency]} ${headline(urgency, offset)}`,
      body: `${input.title}${subject}`,
    });
  }
  return plans;
}
