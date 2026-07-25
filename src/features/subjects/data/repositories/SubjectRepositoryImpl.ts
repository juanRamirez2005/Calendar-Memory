// src/features/subjects/data/repositories/SubjectRepositoryImpl.ts
import { AppError } from '@core/errors/AppError';
import { createId } from '@shared/utils/id';
import type {
  CreateSubjectInput,
  Subject,
  UpdateSubjectInput,
} from '../../domain/entities/Subject';
import type { SubjectRepository } from '../../domain/repositories/SubjectRepository';
import type { SubjectRow } from '../dto/SubjectRow';
import { rowToSubject } from '../mappers/subjectMapper';
import type { SubjectDataSource } from '../datasources/SubjectDataSource';

export class SubjectRepositoryImpl implements SubjectRepository {
  constructor(private readonly ds: SubjectDataSource) {}

  async create(input: CreateSubjectInput): Promise<Subject> {
    const row: SubjectRow = {
      id: createId(),
      semester_id: input.semesterId,
      name: input.name,
      code: input.code ?? null,
      color: input.color,
      professor: input.professor ?? null,
      credits: input.credits ?? null,
    };
    await this.ds.insert(row);
    return rowToSubject(row);
  }

  async listBySemester(semesterId: string): Promise<Subject[]> {
    return (await this.ds.selectBySemester(semesterId)).map(rowToSubject);
  }

  async getById(id: string): Promise<Subject | null> {
    const row = await this.ds.selectById(id);
    return row ? rowToSubject(row) : null;
  }

  async update(id: string, patch: UpdateSubjectInput): Promise<Subject> {
    const current = await this.ds.selectById(id);
    if (!current) {
      throw AppError.notFound('La materia no existe.');
    }
    const next: SubjectRow = {
      ...current,
      name: patch.name ?? current.name,
      code: patch.code !== undefined ? patch.code ?? null : current.code,
      color: patch.color ?? current.color,
      professor:
        patch.professor !== undefined
          ? patch.professor ?? null
          : current.professor,
      credits:
        patch.credits !== undefined ? patch.credits ?? null : current.credits,
    };
    await this.ds.update(next);
    return rowToSubject(next);
  }

  async delete(id: string): Promise<void> {
    await this.ds.deleteById(id);
  }
}
