// src/features/semesters/presentation/store/semestersStore.ts
import { create } from 'zustand';
import { getContainer } from '@core/di/container';
import type {
  CreateSemesterInput,
  Semester,
  UpdateSemesterInput,
} from '../../domain/entities/Semester';

type SemestersState = {
  items: Semester[];
  activeSemester: Semester | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (input: CreateSemesterInput) => Promise<boolean>;
  update: (id: string, patch: UpdateSemesterInput) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  setActive: (id: string) => Promise<void>;
  archive: (id: string, archived: boolean) => Promise<void>;
};

export const useSemestersStore = create<SemestersState>((set, get) => ({
  items: [],
  activeSemester: null,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    const res = await getContainer().semesters.list.execute();
    if (res.ok) {
      set({
        items: res.value,
        activeSemester: res.value.find(s => s.isActive) ?? null,
        loading: false,
      });
    } else {
      set({ error: res.error.message, loading: false });
    }
  },

  create: async input => {
    const res = await getContainer().semesters.create.execute(input);
    if (!res.ok) {
      set({ error: res.error.message });
      return false;
    }
    await get().load();
    return true;
  },

  update: async (id, patch) => {
    const res = await getContainer().semesters.update.execute(id, patch);
    if (!res.ok) {
      set({ error: res.error.message });
      return false;
    }
    await get().load();
    return true;
  },

  remove: async id => {
    const res = await getContainer().semesters.remove.execute(id);
    if (!res.ok) {
      set({ error: res.error.message });
      return;
    }
    await get().load();
  },

  setActive: async id => {
    const res = await getContainer().semesters.setActive.execute(id);
    if (!res.ok) {
      set({ error: res.error.message });
      return;
    }
    await get().load();
  },

  archive: async (id, archived) => {
    const res = await getContainer().semesters.archive.execute(id, archived);
    if (!res.ok) {
      set({ error: res.error.message });
      return;
    }
    await get().load();
  },
}));
