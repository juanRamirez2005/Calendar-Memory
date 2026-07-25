// src/features/semesters/data/repositories/SemesterRepositoryImpl.ts
import { AppError } from '@core/errors/AppError';
import { createId } from '@shared/utils/id';
import type {
  CreateSemesterInput,
  Semester,
  UpdateSemesterInput,
} from '../../domain/entities/Semester';
import type { SemesterRepository } from '../../domain/repositories/SemesterRepository';
import type { SemesterRow } from '../dto/SemesterRow';
import { rowToSemester } from '../mappers/semesterMapper';
import type { SemesterDataSource } from '../datasources/SemesterDataSource';

export class SemesterRepositoryImpl implements SemesterRepository {
  constructor(private readonly ds: SemesterDataSource) {}

  async create(input: CreateSemesterInput): Promise<Semester> {
    const row: SemesterRow = {
      id: createId(),
      name: input.name,
      start_date: input.startDate,
      end_date: input.endDate,
      is_active: 0,
      is_archived: 0,
    };
    await this.ds.insert(row);
    return rowToSemester(row);
  }

  async list(): Promise<Semester[]> {
    return (await this.ds.selectAll()).map(rowToSemester);
  }

  async getById(id: string): Promise<Semester | null> {
    const row = await this.ds.selectById(id);
    return row ? rowToSemester(row) : null;
  }

  async getActive(): Promise<Semester | null> {
    const row = await this.ds.selectActive();
    return row ? rowToSemester(row) : null;
  }

  async update(id: string, patch: UpdateSemesterInput): Promise<Semester> {
    const current = await this.ds.selectById(id);
    if (!current) {
      throw AppError.notFound('El semestre no existe.');
    }
    const name = patch.name ?? current.name;
    const startDate = patch.startDate ?? current.start_date;
    const endDate = patch.endDate ?? current.end_date;
    await this.ds.updateFields(id, name, startDate, endDate);
    return rowToSemester({
      ...current,
      name,
      start_date: startDate,
      end_date: endDate,
    });
  }

  async delete(id: string): Promise<void> {
    await this.ds.deleteById(id);
  }

  async setActive(id: string): Promise<void> {
    await this.ds.setActive(id);
  }

  async setArchived(id: string, archived: boolean): Promise<void> {
    await this.ds.setArchived(id, archived);
  }
}
