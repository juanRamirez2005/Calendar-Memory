// src/features/subjects/data/dto/SubjectRow.ts

export type SubjectRow = {
  id: string;
  semester_id: string;
  name: string;
  code: string | null;
  color: string;
  professor: string | null;
  credits: number | null;
};
