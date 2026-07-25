// src/features/tasks/domain/repositories/TaskRepository.ts
import type {
  CreateTaskInput,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '../entities/Task';

export interface TaskRepository {
  create(input: CreateTaskInput): Promise<Task>;
  listBySemester(semesterId: string): Promise<Task[]>;
  listBySubject(subjectId: string): Promise<Task[]>;
  /** Tareas de un semestre que vencen en una fecha (YYYY-MM-DD). */
  listByDate(semesterId: string, dateKey: string): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  update(id: string, patch: UpdateTaskInput): Promise<Task>;
  updateStatus(id: string, status: TaskStatus): Promise<Task>;
  delete(id: string): Promise<void>;
}
