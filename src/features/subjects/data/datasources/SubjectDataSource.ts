// src/features/subjects/data/datasources/SubjectDataSource.ts
import type { SubjectRow } from '../dto/SubjectRow';

export interface SubjectDataSource {
  insert(row: SubjectRow): Promise<void>;
  selectBySemester(semesterId: string): Promise<SubjectRow[]>;
  selectById(id: string): Promise<SubjectRow | null>;
  update(row: SubjectRow): Promise<void>;
  deleteById(id: string): Promise<void>;
}
