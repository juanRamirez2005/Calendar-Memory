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
