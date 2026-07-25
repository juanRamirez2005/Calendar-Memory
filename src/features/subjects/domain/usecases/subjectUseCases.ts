// src/features/subjects/domain/usecases/subjectUseCases.ts
import { AppError } from '@core/errors/AppError';
import { err, tryCatch, type Result } from '@core/errors/result';
import type {
  CreateSubjectInput,
  Subject,
  UpdateSubjectInput,
} from '../entities/Subject';
import type { SubjectRepository } from '../repositories/SubjectRepository';

export class CreateSubject {
  constructor(private readonly repo: SubjectRepository) {}

  async execute(input: CreateSubjectInput): Promise<Result<Subject>> {
    if (!input.name.trim()) {
      return err(AppError.validation('El nombre de la materia es obligatorio.'));
    }
    if (!input.semesterId) {
      return err(AppError.validation('La materia debe pertenecer a un semestre.'));
    }
    if (!input.color) {
      return err(AppError.validation('Selecciona un color para la materia.'));
    }
    return tryCatch(() => this.repo.create({ ...input, name: input.name.trim() }));
  }
}

export class ListSubjectsBySemester {
  constructor(private readonly repo: SubjectRepository) {}

  execute(semesterId: string): Promise<Result<Subject[]>> {
    return tryCatch(() => this.repo.listBySemester(semesterId));
  }
}

export class GetSubject {
  constructor(private readonly repo: SubjectRepository) {}

  execute(id: string): Promise<Result<Subject | null>> {
    return tryCatch(() => this.repo.getById(id));
  }
}

export class UpdateSubject {
  constructor(private readonly repo: SubjectRepository) {}

  async execute(
    id: string,
    patch: UpdateSubjectInput,
  ): Promise<Result<Subject>> {
    if (patch.name !== undefined && !patch.name.trim()) {
      return err(AppError.validation('El nombre no puede quedar vacío.'));
    }
    return tryCatch(() => this.repo.update(id, patch));
  }
}

export class DeleteSubject {
  constructor(private readonly repo: SubjectRepository) {}

  execute(id: string): Promise<Result<void>> {
    return tryCatch(() => this.repo.delete(id));
  }
}

export type SubjectUseCases = {
  create: CreateSubject;
  listBySemester: ListSubjectsBySemester;
  get: GetSubject;
  update: UpdateSubject;
  remove: DeleteSubject;
};

export function buildSubjectUseCases(repo: SubjectRepository): SubjectUseCases {
  return {
    create: new CreateSubject(repo),
    listBySemester: new ListSubjectsBySemester(repo),
    get: new GetSubject(repo),
    update: new UpdateSubject(repo),
    remove: new DeleteSubject(repo),
  };
}
