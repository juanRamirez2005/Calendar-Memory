// src/features/tasks/domain/entities/Task.ts

export type TaskStatus = 'pending' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export const TASK_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'done'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export type Task = {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD, opcional
  status: TaskStatus;
  priority: Priority;
  /** ISO-8601 UTC. Ausente en tareas creadas antes de la migración v3. */
  createdAt?: string;
  /** ISO-8601 UTC del paso a 'done'. Ausente si está sin completar. */
  completedAt?: string;
};

export type CreateTaskInput = {
  subjectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
};

export type UpdateTaskInput = Partial<
  Pick<
    Task,
    'title' | 'description' | 'dueDate' | 'status' | 'priority' | 'subjectId'
  >
>;
