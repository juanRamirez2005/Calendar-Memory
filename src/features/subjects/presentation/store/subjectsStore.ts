// src/features/subjects/presentation/store/subjectsStore.ts
import { create } from 'zustand';
import { getContainer } from '@core/di/container';
import type {
  CreateSubjectInput,
  Subject,
  UpdateSubjectInput,
} from '../../domain/entities/Subject';

type SubjectsState = {
  items: Subject[];
  semesterId: string | null;
  loading: boolean;
  error: string | null;
  load: (semesterId: string) => Promise<void>;
  create: (input: CreateSubjectInput) => Promise<boolean>;
  update: (id: string, patch: UpdateSubjectInput) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
};

async function reload(
  semesterId: string | null,
  set: (partial: Partial<SubjectsState>) => void,
) {
  if (!semesterId) {
    set({ items: [] });
    return;
  }
  const res = await getContainer().subjects.listBySemester.execute(semesterId);
  if (res.ok) {
    set({ items: res.value, loading: false });
  } else {
    set({ error: res.error.message, loading: false });
  }
}

export const useSubjectsStore = create<SubjectsState>((set, get) => ({
  items: [],
  semesterId: null,
  loading: false,
  error: null,

  load: async semesterId => {
    set({ loading: true, error: null, semesterId });
    await reload(semesterId, set);
  },

  create: async input => {
    const res = await getContainer().subjects.create.execute(input);
    if (!res.ok) {
      set({ error: res.error.message });
      return false;
    }
    await reload(get().semesterId, set);
    return true;
  },

  update: async (id, patch) => {
    const res = await getContainer().subjects.update.execute(id, patch);
    if (!res.ok) {
      set({ error: res.error.message });
      return false;
    }
    await reload(get().semesterId, set);
    return true;
  },

  remove: async id => {
    const res = await getContainer().subjects.remove.execute(id);
    if (!res.ok) {
      set({ error: res.error.message });
      return;
    }
    await reload(get().semesterId, set);
  },
}));
