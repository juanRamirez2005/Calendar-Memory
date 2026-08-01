// src/features/tasks/data/mappers/taskMapper.ts
import type { Priority, Task, TaskStatus } from '../../domain/entities/Task';
import type { TaskRow } from '../dto/TaskRow';

export function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    description: row.description ?? undefined,
    dueDate: row.due_date ?? undefined,
    status: row.status as TaskStatus,
    priority: row.priority as Priority,
    createdAt: row.created_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}
