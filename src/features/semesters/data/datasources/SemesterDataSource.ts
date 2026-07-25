// src/features/semesters/data/datasources/SemesterDataSource.ts
import type { SemesterRow } from '../dto/SemesterRow';

/** Boundary de acceso a datos de semestres (SQL en producción). */
export interface SemesterDataSource {
  insert(row: SemesterRow): Promise<void>;
  selectAll(): Promise<SemesterRow[]>;
  selectById(id: string): Promise<SemesterRow | null>;
  selectActive(): Promise<SemesterRow | null>;
  updateFields(
    id: string,
    name: string,
    startDate: string,
    endDate: string,
  ): Promise<void>;
  deleteById(id: string): Promise<void>;
  /** Desactiva todos y activa el indicado, en una transacción. */
  setActive(id: string): Promise<void>;
  setArchived(id: string, archived: boolean): Promise<void>;
}
