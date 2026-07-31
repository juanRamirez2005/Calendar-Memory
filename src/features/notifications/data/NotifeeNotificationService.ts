// src/features/notifications/data/NotifeeNotificationService.ts
import type { NotificationService } from '../domain/NotificationService';
import {
  planRemindersForTask,
  REMINDER_WINDOW_DAYS,
  type PlannerInput,
  type Urgency,
} from '../domain/notificationPlanner';

/**
 * Carga notifee de forma defensiva: si el módulo nativo aún no está enlazado
 * (p. ej. antes de recompilar), el servicio degrada a no-op en vez de crashear.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNotifee(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@notifee/react-native');
  } catch {
    return null;
  }
}

const CHANNELS = {
  high: 'reminders-high',
  default: 'reminders-default',
  low: 'reminders-low',
} as const;

function channelFor(urgency: Urgency): string {
  if (urgency === 'today' || urgency === 'tomorrow' || urgency === 'overdue') {
    return CHANNELS.high;
  }
  if (urgency === 'soon') {
    return CHANNELS.default;
  }
  return CHANNELS.low;
}

const COLORS: Record<Urgency, string> = {
  far: '#10B981',
  soon: '#F59E0B',
  tomorrow: '#F97316',
  today: '#EF4444',
  overdue: '#EF4444',
};

export class NotifeeNotificationService implements NotificationService {
  private initialized = false;

  async init(): Promise<void> {
    const m = getNotifee();
    if (!m || this.initialized) {
      return;
    }
    try {
      const notifee = m.default;
      const { AndroidImportance } = m;
      await notifee.requestPermission();
      await notifee.createChannel({
        id: CHANNELS.high,
        name: 'Entregas urgentes',
        importance: AndroidImportance.HIGH,
      });
      await notifee.createChannel({
        id: CHANNELS.default,
        name: 'Entregas próximas',
        importance: AndroidImportance.DEFAULT,
      });
      await notifee.createChannel({
        id: CHANNELS.low,
        name: 'Entregas lejanas',
        importance: AndroidImportance.LOW,
      });
      this.initialized = true;
    } catch {
      // Permisos denegados o módulo no disponible: se ignora.
    }
  }

  async scheduleForTask(input: PlannerInput): Promise<void> {
    const m = getNotifee();
    if (!m) {
      return;
    }
    try {
      await this.init();
      await this.cancelForTask(input.taskId);
      const notifee = m.default;
      const { TriggerType } = m;
      const plans = planRemindersForTask(input);
      for (const plan of plans) {
        await notifee.createTriggerNotification(
          {
            id: plan.id,
            title: plan.title,
            body: plan.body,
            android: {
              channelId: channelFor(plan.urgency),
              // Silueta blanca sobre transparente: Android recorta el icono de
              // statusbar a su alfa, por lo que ic_launcher saldria como un borron.
              smallIcon: 'ic_stat_notification',
              color: COLORS[plan.urgency],
              pressAction: { id: 'default' },
            },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: plan.timestamp,
            alarmManager: { allowWhileIdle: true },
          },
        );
      }
    } catch {
      // No romper el flujo de la app si falla la programación.
    }
  }

  async cancelForTask(taskId: string): Promise<void> {
    const m = getNotifee();
    if (!m) {
      return;
    }
    try {
      const notifee = m.default;
      for (let offset = 0; offset <= REMINDER_WINDOW_DAYS; offset++) {
        await notifee.cancelTriggerNotification(`${taskId}-${offset}`);
      }
    } catch {
      // ignorar
    }
  }
}
