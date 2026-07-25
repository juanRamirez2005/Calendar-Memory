// src/features/semesters/data/mappers/semesterMapper.ts
import type { Semester } from '../../domain/entities/Semester';
import type { SemesterRow } from '../dto/SemesterRow';

export function rowToSemester(row: SemesterRow): Semester {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active === 1,
    isArchived: row.is_archived === 1,
  };
}

export function semesterToRow(semester: Semester): SemesterRow {
  return {
    id: semester.id,
    name: semester.name,
    start_date: semester.startDate,
    end_date: semester.endDate,
    is_active: semester.isActive ? 1 : 0,
    is_archived: semester.isArchived ? 1 : 0,
  };
}
