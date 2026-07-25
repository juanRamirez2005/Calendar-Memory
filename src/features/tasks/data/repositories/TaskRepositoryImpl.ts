// src/features/tasks/data/repositories/TaskRepositoryImpl.ts
import { AppError } from '@core/errors/AppError';
import { createId } from '@shared/utils/id';
import type {
  CreateTaskInput,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '../../domain/entities/Task';
import type { TaskRepository } from '../../domain/repositories/TaskRepository';
import type { TaskRow } from '../dto/TaskRow';
import { rowToTask } from '../mappers/taskMapper';
import type { TaskDataSource } from '../datasources/TaskDataSource';

export class TaskRepositoryImpl implements TaskRepository {
  constructor(private readonly ds: TaskDataSource) {}

  async create(input: CreateTaskInput): Promise<Task> {
    const row: TaskRow = {
      id: createId(),
      subject_id: input.subjectId,
      title: input.title,
      description: input.description ?? null,
      due_date: input.dueDate ?? null,
      status: 'pending',
      priority: input.priority ?? 'medium',
    };
    await this.ds.insert(row);
    return rowToTask(row);
  }

  async listBySemester(semesterId: string): Promise<Task[]> {
    return (await this.ds.selectBySemester(semesterId)).map(rowToTask);
  }

  async listBySubject(subjectId: string): Promise<Task[]> {
    return (await this.ds.selectBySubject(subjectId)).map(rowToTask);
  }

  async listByDate(semesterId: string, dateKey: string): Promise<Task[]> {
    return (await this.ds.selectByDate(semesterId, dateKey)).map(rowToTask);
  }

  async getById(id: string): Promise<Task | null> {
    const row = await this.ds.selectById(id);
    return row ? rowToTask(row) : null;
  }

  async update(id: string, patch: UpdateTaskInput): Promise<Task> {
    const current = await this.ds.selectById(id);
    if (!current) {
      throw AppError.notFound('La tarea no existe.');
    }
    const next: TaskRow = {
      ...current,
      subject_id: patch.subjectId ?? current.subject_id,
      title: patch.title ?? current.title,
      description:
        patch.description !== undefined
          ? patch.description ?? null
          : current.description,
      due_date:
        patch.dueDate !== undefined ? patch.dueDate ?? null : current.due_date,
      status: patch.status ?? current.status,
      priority: patch.priority ?? current.priority,
    };
    await this.ds.update(next);
    return rowToTask(next);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const current = await this.ds.selectById(id);
    if (!current) {
      throw AppError.notFound('La tarea no existe.');
    }
    await this.ds.updateStatus(id, status);
    return rowToTask({ ...current, status });
  }

  async delete(id: string): Promise<void> {
    await this.ds.deleteById(id);
  }
}
