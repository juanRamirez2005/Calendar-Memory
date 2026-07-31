// src/features/notifications/domain/NotificationService.ts
import type { PlannerInput } from './notificationPlanner';

/** Qué le permite el sistema a la app en materia de recordatorios. */
export type NotificationPermissionState = {
  /** Puede mostrar notificaciones (POST_NOTIFICATIONS). */
  notifications: boolean;
  /**
   * Puede programar alarmas exactas (SCHEDULE_EXACT_ALARM). Si es `false` los
   * recordatorios se programan igual, pero el sistema puede retrasarlos.
   */
  exactAlarms: boolean;
};

/** Servicio de notificaciones locales de recordatorio de entregas. */
export interface NotificationService {
  /** Pide permiso y crea los canales. Idempotente. */
  init(): Promise<void>;
  /** (Re)programa los recordatorios diarios de una tarea. */
  scheduleForTask(input: PlannerInput): Promise<void>;
  /** Cancela todos los recordatorios de una tarea. */
  cancelForTask(taskId: string): Promise<void>;
  /** Estado actual de los permisos, para que la UI pueda avisar. */
  getPermissionState(): Promise<NotificationPermissionState>;
  /**
   * Abre la pantalla de acceso especial a alarmas exactas. Android no ofrece
   * un diálogo para este permiso: hay que sacar al usuario a Ajustes.
   */
  openExactAlarmSettings(): Promise<void>;
}
