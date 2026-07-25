// src/features/subjects/data/mappers/subjectMapper.ts
import type { Subject } from '../../domain/entities/Subject';
import type { SubjectRow } from '../dto/SubjectRow';

export function rowToSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    semesterId: row.semester_id,
    name: row.name,
    code: row.code ?? undefined,
    color: row.color,
    professor: row.professor ?? undefined,
    credits: row.credits ?? undefined,
  };
}
