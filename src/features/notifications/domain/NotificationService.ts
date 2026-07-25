// src/features/notifications/domain/NotificationService.ts
import type { PlannerInput } from './notificationPlanner';

/** Servicio de notificaciones locales de recordatorio de entregas. */
export interface NotificationService {
  /** Pide permiso y crea los canales. Idempotente. */
  init(): Promise<void>;
  /** (Re)programa los recordatorios diarios de una tarea. */
  scheduleForTask(input: PlannerInput): Promise<void>;
  /** Cancela todos los recordatorios de una tarea. */
  cancelForTask(taskId: string): Promise<void>;
}
