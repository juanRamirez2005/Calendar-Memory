// src/features/notifications/data/NotifeeNotificationService.ts
import type {
  NotificationPermissionState,
  NotificationService,
} from '../domain/NotificationService';
import {
  planRemindersForTask,
  REMINDER_WINDOW_DAYS,
  type PlannerInput,
  type ReminderPlan,
  type Urgency,
} from '../domain/notificationPlanner';

/**
 * Carga notifee de forma defensiva: si el módulo nativo aún no está enlazado
 * (p. ej. antes de recompilar), el servicio degrada a no-op en vez de crashear.
 */
type Notifee = ReturnType<typeof require>;

function getNotifee(): Notifee | null {
  try {
    return require('@notifee/react-native');
  } catch {
    return null;
  }
}

const CHANNELS = {
  high: 'reminders-high',
  default: 'reminders-default',
} as const;

function channelFor(urgency: Urgency): string {
  if (urgency === 'today' || urgency === 'tomorrow' || urgency === 'overdue') {
    return CHANNELS.high;
  }
  return CHANNELS.default;
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
  /**
   * Volver a pedir POST_NOTIFICATIONS solo una vez por sesión: Android ignora
   * el diálogo tras dos negativas, y esto corre en cada guardado de tarea.
   */
  private permissionRetried = false;

  async init(): Promise<void> {
    try {
      await this.setup(false);
    } catch {
      // Permisos denegados o módulo no disponible: se ignora.
    }
  }

  async scheduleForTask(input: PlannerInput): Promise<void> {
    const m = getNotifee();
    if (!m) {
      return;
    }
    // Siempre se limpian los anteriores: si la tarea pasó a hecha o perdió la
    // fecha, `plans` viene vacío y lo único que toca es cancelar.
    await this.cancelForTask(input.taskId);
    const plans = planRemindersForTask(input);
    if (plans.length === 0) {
      return;
    }

    try {
      await this.setup(false);
      await this.publish(m, plans, true);
    } catch {
      await this.retry(m, plans);
    }
  }

  async cancelForTask(taskId: string): Promise<void> {
    const m = getNotifee();
    if (!m) {
      return;
    }
    try {
      for (let offset = 0; offset <= REMINDER_WINDOW_DAYS; offset++) {
        await m.default.cancelTriggerNotification(`${taskId}-${offset}`);
      }
      // El aviso inmediato no lleva offset numérico (ver planRemindersForTask).
      await m.default.cancelTriggerNotification(`${taskId}-now`);
    } catch {
      // ignorar
    }
  }

  async getPermissionState(): Promise<NotificationPermissionState> {
    const m = getNotifee();
    if (!m) {
      return { notifications: false, exactAlarms: false };
    }
    try {
      const settings = await m.default.getNotificationSettings();
      return {
        notifications:
          settings?.authorizationStatus >= m.AuthorizationStatus.AUTHORIZED,
        exactAlarms: this.allowsExactAlarms(m, settings),
      };
    } catch {
      return { notifications: false, exactAlarms: false };
    }
  }

  async openExactAlarmSettings(): Promise<void> {
    const m = getNotifee();
    if (!m) {
      return;
    }
    try {
      await m.default.openAlarmPermissionSettings();
    } catch {
      // ignorar: en Android < 12 es un no-op y no hay pantalla que abrir.
    }
  }

  /**
   * Segundo intento tras un fallo al programar. Vuelve a pedir el permiso de
   * notificaciones (una vez por sesión) y, si el sistema no concede alarmas
   * exactas, reprograma como alarma inexacta: mejor un recordatorio que puede
   * llegar tarde que ninguno.
   */
  private async retry(m: Notifee, plans: ReminderPlan[]): Promise<void> {
    try {
      if (!this.permissionRetried) {
        this.permissionRetried = true;
        this.initialized = false;
        await this.setup(true);
      }
      await this.publish(m, plans, await this.canScheduleExact(m));
    } catch {
      // Agotados los reintentos: la tarea se guarda igual, sin recordatorios.
    }
  }

  /** Pide permiso y crea los canales. `force` reintenta aunque ya se hiciera. */
  private async setup(force: boolean): Promise<void> {
    const m = getNotifee();
    if (!m || (this.initialized && !force)) {
      return;
    }
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
    // El canal 'reminders-low' (IMPORTANCE_LOW) hacía invisibles los avisos de
    // 4-7 días. Android no deja subir la importancia de un canal existente, así
    // que hay que borrarlo para que 'far' pase por el canal default.
    try {
      await notifee.deleteChannel('reminders-low');
    } catch {
      // No existía (instalación nueva): nada que borrar.
    }
    this.initialized = true;
  }

  private async canScheduleExact(m: Notifee): Promise<boolean> {
    try {
      return this.allowsExactAlarms(m, await m.default.getNotificationSettings());
    } catch {
      return false;
    }
  }

  /**
   * `alarm` es NOT_SUPPORTED (-1) en Android < 12, donde las alarmas exactas no
   * requieren permiso; solo DISABLED (0) significa que el sistema las bloquea.
   */
  private allowsExactAlarms(m: Notifee, settings: Notifee): boolean {
    return settings?.android?.alarm !== m.AndroidNotificationSetting.DISABLED;
  }

  private async publish(
    m: Notifee,
    plans: ReminderPlan[],
    exact: boolean,
  ): Promise<void> {
    const notifee = m.default;
    const { TriggerType } = m;
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
          // alarmManager exige SCHEDULE_EXACT_ALARM: sin el permiso, notifee
          // lanza y perderíamos el recordatorio entero.
          ...(exact ? { alarmManager: { allowWhileIdle: true } } : {}),
        },
      );
    }
  }
}
