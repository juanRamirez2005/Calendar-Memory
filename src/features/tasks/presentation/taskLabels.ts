// src/features/tasks/presentation/taskLabels.ts
import type { Priority, TaskStatus } from '../domain/entities/Task';

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Hecha',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

/** Color semántico por prioridad (usa tokens del tema desde el consumidor). */
export const PRIORITY_COLOR: Record<Priority, 'success' | 'warning' | 'danger'> =
  {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  };

export const STATUS_COLOR: Record<TaskStatus, 'textMuted' | 'primary' | 'success'> =
  {
    pending: 'textMuted',
    in_progress: 'primary',
    done: 'success',
  };
