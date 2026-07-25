// src/features/tasks/data/dto/TaskRow.ts

export type TaskRow = {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  priority: string;
};
