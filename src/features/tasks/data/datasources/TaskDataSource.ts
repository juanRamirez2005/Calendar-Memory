// src/features/tasks/data/datasources/TaskDataSource.ts
import type { TaskRow } from '../dto/TaskRow';

export interface TaskDataSource {
  insert(row: TaskRow): Promise<void>;
  selectBySemester(semesterId: string): Promise<TaskRow[]>;
  selectBySubject(subjectId: string): Promise<TaskRow[]>;
  selectByDate(semesterId: string, dateKey: string): Promise<TaskRow[]>;
  selectById(id: string): Promise<TaskRow | null>;
  update(row: TaskRow): Promise<void>;
  /** `completedAt` es la marca de completado, o null al revertir a pendiente. */
  updateStatus(
    id: string,
    status: string,
    completedAt: string | null,
  ): Promise<void>;
  deleteById(id: string): Promise<void>;
}
