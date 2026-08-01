// src/features/tasks/data/dto/TaskRow.ts

export type TaskRow = {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  priority: string;
  /** ISO-8601 UTC. Null en tareas anteriores a la migración v3. */
  created_at: string | null;
  /** ISO-8601 UTC del paso a 'done'. Null si nunca se completó. */
  completed_at: string | null;
};
