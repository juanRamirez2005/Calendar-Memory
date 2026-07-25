// src/features/semesters/domain/entities/Semester.ts

export type Semester = {
  id: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
  isActive: boolean;
  isArchived: boolean;
};

export type CreateSemesterInput = {
  name: string;
  startDate: string;
  endDate: string;
};

export type UpdateSemesterInput = Partial<
  Pick<Semester, 'name' | 'startDate' | 'endDate'>
>;
