// src/features/semesters/domain/usecases/semesterUseCases.ts
import { AppError } from '@core/errors/AppError';
import { err, tryCatch, type Result } from '@core/errors/result';
import type {
  CreateSemesterInput,
  Semester,
  UpdateSemesterInput,
} from '../entities/Semester';
import type { SemesterRepository } from '../repositories/SemesterRepository';

function validateInput(input: CreateSemesterInput): AppError | null {
  if (!input.name.trim()) {
    return AppError.validation('El nombre del semestre es obligatorio.');
  }
  if (!input.startDate || !input.endDate) {
    return AppError.validation('Las fechas de inicio y fin son obligatorias.');
  }
  if (new Date(input.endDate) < new Date(input.startDate)) {
    return AppError.validation('La fecha de fin no puede ser anterior al inicio.');
  }
  return null;
}

export class CreateSemester {
  constructor(private readonly repo: SemesterRepository) {}

  async execute(input: CreateSemesterInput): Promise<Result<Semester>> {
    const invalid = validateInput(input);
    if (invalid) {
      return err(invalid);
    }
    return tryCatch(() =>
      this.repo.create({ ...input, name: input.name.trim() }),
    );
  }
}

export class ListSemesters {
  constructor(private readonly repo: SemesterRepository) {}

  execute(): Promise<Result<Semester[]>> {
    return tryCatch(() => this.repo.list());
  }
}

export class GetSemester {
  constructor(private readonly repo: SemesterRepository) {}

  execute(id: string): Promise<Result<Semester | null>> {
    return tryCatch(() => this.repo.getById(id));
  }
}

export class GetActiveSemester {
  constructor(private readonly repo: SemesterRepository) {}

  execute(): Promise<Result<Semester | null>> {
    return tryCatch(() => this.repo.getActive());
  }
}

export class UpdateSemester {
  constructor(private readonly repo: SemesterRepository) {}

  async execute(
    id: string,
    patch: UpdateSemesterInput,
  ): Promise<Result<Semester>> {
    if (patch.name !== undefined && !patch.name.trim()) {
      return err(AppError.validation('El nombre no puede quedar vacío.'));
    }
    if (
      patch.startDate &&
      patch.endDate &&
      new Date(patch.endDate) < new Date(patch.startDate)
    ) {
      return err(
        AppError.validation('La fecha de fin no puede ser anterior al inicio.'),
      );
    }
    return tryCatch(() => this.repo.update(id, patch));
  }
}

export class DeleteSemester {
  constructor(private readonly repo: SemesterRepository) {}

  execute(id: string): Promise<Result<void>> {
    return tryCatch(() => this.repo.delete(id));
  }
}

export class SetActiveSemester {
  constructor(private readonly repo: SemesterRepository) {}

  async execute(id: string): Promise<Result<void>> {
    const current = await this.repo.getById(id);
    if (!current) {
      return err(AppError.notFound('El semestre no existe.'));
    }
    if (current.isArchived) {
      return err(
        AppError.conflict('No se puede activar un semestre archivado.'),
      );
    }
    return tryCatch(() => this.repo.setActive(id));
  }
}

export class ArchiveSemester {
  constructor(private readonly repo: SemesterRepository) {}

  /** Archiva o desarchiva un semestre. Al archivar, lo desactiva. */
  async execute(id: string, archived: boolean): Promise<Result<void>> {
    return tryCatch(() => this.repo.setArchived(id, archived));
  }
}

export type SemesterUseCases = {
  create: CreateSemester;
  list: ListSemesters;
  get: GetSemester;
  getActive: GetActiveSemester;
  update: UpdateSemester;
  remove: DeleteSemester;
  setActive: SetActiveSemester;
  archive: ArchiveSemester;
};

export function buildSemesterUseCases(
  repo: SemesterRepository,
): SemesterUseCases {
  return {
    create: new CreateSemester(repo),
    list: new ListSemesters(repo),
    get: new GetSemester(repo),
    getActive: new GetActiveSemester(repo),
    update: new UpdateSemester(repo),
    remove: new DeleteSemester(repo),
    setActive: new SetActiveSemester(repo),
    archive: new ArchiveSemester(repo),
  };
}
