// src/shared/hooks/useActiveSemester.ts
import { useSemestersStore } from '@features/semesters/presentation/store/semestersStore';

/** Semestre activo actual (o null si no hay ninguno). */
export function useActiveSemester() {
  return useSemestersStore(state => state.activeSemester);
}
