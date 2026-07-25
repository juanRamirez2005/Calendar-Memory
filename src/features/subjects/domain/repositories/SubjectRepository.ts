// src/features/subjects/domain/repositories/SubjectRepository.ts
import type {
  CreateSubjectInput,
  Subject,
  UpdateSubjectInput,
} from '../entities/Subject';

export interface SubjectRepository {
  create(input: CreateSubjectInput): Promise<Subject>;
  listBySemester(semesterId: string): Promise<Subject[]>;
  getById(id: string): Promise<Subject | null>;
  update(id: string, patch: UpdateSubjectInput): Promise<Subject>;
  delete(id: string): Promise<void>;
}
