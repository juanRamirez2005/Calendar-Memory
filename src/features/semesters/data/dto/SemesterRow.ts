// src/features/semesters/data/dto/SemesterRow.ts

/** Representación de una fila de la tabla `semesters`. */
export type SemesterRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: number;
  is_archived: number;
};
