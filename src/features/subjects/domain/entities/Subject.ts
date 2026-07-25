// src/features/subjects/domain/entities/Subject.ts

export type Subject = {
  id: string;
  semesterId: string;
  name: string;
  code?: string;
  color: string;
  professor?: string;
  credits?: number;
};

export type CreateSubjectInput = {
  semesterId: string;
  name: string;
  color: string;
  code?: string;
  professor?: string;
  credits?: number;
};

export type UpdateSubjectInput = Partial<
  Pick<Subject, 'name' | 'code' | 'color' | 'professor' | 'credits'>
>;
