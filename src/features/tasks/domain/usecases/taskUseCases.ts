// src/features/tasks/domain/usecases/taskUseCases.ts
import { AppError } from '@core/errors/AppError';
import { err, tryCatch, type Result } from '@core/errors/result';
import type {
  CreateTaskInput,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '../entities/Task';
import type { TaskRepository } from '../repositories/TaskRepository';

export class CreateTask {
  constructor(private readonly repo: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Result<Task>> {
    if (!input.title.trim()) {
      return err(AppError.validation('El título de la tarea es obligatorio.'));
    }
    if (!input.subjectId) {
      return err(AppError.validation('La tarea debe pertenecer a una materia.'));
    }
    return tryCatch(() => this.repo.create({ ...input, title: input.title.trim() }));
  }
}

export class ListTasksBySemester {
  constructor(private readonly repo: TaskRepository) {}

  execute(semesterId: string): Promise<Result<Task[]>> {
    return tryCatch(() => this.repo.listBySemester(semesterId));
  }
}

export class ListTasksBySubject {
  constructor(private readonly repo: TaskRepository) {}

  execute(subjectId: string): Promise<Result<Task[]>> {
    return tryCatch(() => this.repo.listBySubject(subjectId));
  }
}

export class ListTasksByDate {
  constructor(private readonly repo: TaskRepository) {}

  execute(semesterId: string, dateKey: string): Promise<Result<Task[]>> {
    return tryCatch(() => this.repo.listByDate(semesterId, dateKey));
  }
}

export class GetTask {
  constructor(private readonly repo: TaskRepository) {}

  execute(id: string): Promise<Result<Task | null>> {
    return tryCatch(() => this.repo.getById(id));
  }
}

export class UpdateTask {
  constructor(private readonly repo: TaskRepository) {}

  async execute(id: string, patch: UpdateTaskInput): Promise<Result<Task>> {
    if (patch.title !== undefined && !patch.title.trim()) {
      return err(AppError.validation('El título no puede quedar vacío.'));
    }
    return tryCatch(() => this.repo.update(id, patch));
  }
}

export class UpdateTaskStatus {
  constructor(private readonly repo: TaskRepository) {}

  execute(id: string, status: TaskStatus): Promise<Result<Task>> {
    return tryCatch(() => this.repo.updateStatus(id, status));
  }
}

export class DeleteTask {
  constructor(private readonly repo: TaskRepository) {}

  execute(id: string): Promise<Result<void>> {
    return tryCatch(() => this.repo.delete(id));
  }
}

export type TaskUseCases = {
  create: CreateTask;
  listBySemester: ListTasksBySemester;
  listBySubject: ListTasksBySubject;
  listByDate: ListTasksByDate;
  get: GetTask;
  update: UpdateTask;
  updateStatus: UpdateTaskStatus;
  remove: DeleteTask;
};

export function buildTaskUseCases(repo: TaskRepository): TaskUseCases {
  return {
    create: new CreateTask(repo),
    listBySemester: new ListTasksBySemester(repo),
    listBySubject: new ListTasksBySubject(repo),
    listByDate: new ListTasksByDate(repo),
    get: new GetTask(repo),
    update: new UpdateTask(repo),
    updateStatus: new UpdateTaskStatus(repo),
    remove: new DeleteTask(repo),
  };
}
