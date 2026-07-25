// src/features/tasks/data/datasources/TaskDataSource.ts
import type { TaskRow } from '../dto/TaskRow';

export interface TaskDataSource {
  insert(row: TaskRow): Promise<void>;
  selectBySemester(semesterId: string): Promise<TaskRow[]>;
  selectBySubject(subjectId: string): Promise<TaskRow[]>;
  selectByDate(semesterId: string, dateKey: string): Promise<TaskRow[]>;
  selectById(id: string): Promise<TaskRow | null>;
  update(row: TaskRow): Promise<void>;
  updateStatus(id: string, status: string): Promise<void>;
  deleteById(id: string): Promise<void>;
}
