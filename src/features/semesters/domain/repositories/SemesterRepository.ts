// src/features/semesters/domain/repositories/SemesterRepository.ts
import type {
  CreateSemesterInput,
  Semester,
  UpdateSemesterInput,
} from '../entities/Semester';

export interface SemesterRepository {
  create(input: CreateSemesterInput): Promise<Semester>;
  list(): Promise<Semester[]>;
  getById(id: string): Promise<Semester | null>;
  getActive(): Promise<Semester | null>;
  update(id: string, patch: UpdateSemesterInput): Promise<Semester>;
  delete(id: string): Promise<void>;
  /** Marca este semestre como activo y desactiva los demás (atómico). */
  setActive(id: string): Promise<void>;
  setArchived(id: string, archived: boolean): Promise<void>;
}
