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

/** Días completos entre dos fechas, ignorando la hora. */
function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Margen sobre `now` para el aviso inmediato: notifee rechaza timestamps ya pasados. */
const IMMEDIATE_DELAY_MS = 5000;

/**
 * Calcula los recordatorios (uno por día en la ventana previa) para una tarea.
 * Solo devuelve timestamps futuros; vacío si no hay fecha o ya está hecha.
 *
 * Si al momento de crear/editar la tarea el recordatorio que le tocaría por
 * urgencia actual ya pasó (p. ej. se crea a las 3 PM algo que vence mañana, y
 * el aviso de las 9 AM quedó atrás), se emite uno inmediato para no dejar al
 * usuario sin señal hasta el día de entrega.
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

  const subject = input.subjectName ? ` · ${input.subjectName}` : '';
  const build = (
    id: string,
    timestamp: number,
    urgency: Urgency,
    daysLeft: number,
  ): ReminderPlan => ({
    id,
    taskId: input.taskId,
    timestamp,
    urgency,
    title: `${EMOJI[urgency]} ${headline(urgency, daysLeft)}`,
    body: `${input.title}${subject}`,
  });

  const plans: ReminderPlan[] = [];
  for (let offset = REMINDER_WINDOW_DAYS; offset >= 0; offset--) {
    const when = new Date(due);
    when.setDate(when.getDate() - offset);
    if (when.getTime() <= now.getTime()) {
      continue; // no programar recordatorios en el pasado
    }
    plans.push(
      build(`${input.taskId}-${offset}`, when.getTime(), urgencyForDaysLeft(offset), offset),
    );
  }

  // ¿Ya se perdió el aviso que correspondía a la urgencia de hoy?
  const daysLeft = daysBetween(now, due);
  const missedToday =
    daysLeft <= REMINDER_WINDOW_DAYS &&
    !plans.some(p => p.id === `${input.taskId}-${Math.max(daysLeft, 0)}`);
  if (missedToday) {
    const urgency = urgencyForDaysLeft(daysLeft);
    plans.push(
      build(
        `${input.taskId}-now`,
        now.getTime() + IMMEDIATE_DELAY_MS,
        urgency,
        Math.max(daysLeft, 0),
      ),
    );
  }
  return plans;
}
