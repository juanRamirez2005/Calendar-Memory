// src/features/tasks/presentation/store/tasksStore.ts
import { create } from 'zustand';
import { getContainer } from '@core/di/container';
import type {
  CreateTaskInput,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '../../domain/entities/Task';

type Scope =
  | { type: 'semester'; id: string }
  | { type: 'subject'; id: string }
  | null;

type TasksState = {
  items: Task[];
  scope: Scope;
  loading: boolean;
  error: string | null;
  loadBySemester: (semesterId: string) => Promise<void>;
  loadBySubject: (subjectId: string) => Promise<void>;
  create: (input: CreateTaskInput) => Promise<boolean>;
  update: (id: string, patch: UpdateTaskInput) => Promise<boolean>;
  setStatus: (id: string, status: TaskStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

async function reload(
  scope: Scope,
  set: (partial: Partial<TasksState>) => void,
) {
  if (!scope) {
    set({ items: [], loading: false });
    return;
  }
  const tasks = getContainer().tasks;
  const res =
    scope.type === 'semester'
      ? await tasks.listBySemester.execute(scope.id)
      : await tasks.listBySubject.execute(scope.id);
  if (res.ok) {
    set({ items: res.value, loading: false });
  } else {
    set({ error: res.error.message, loading: false });
  }
}

export const useTasksStore = create<TasksState>((set, get) => ({
  items: [],
  scope: null,
  loading: false,
  error: null,

  loadBySemester: async semesterId => {
    const scope: Scope = { type: 'semester', id: semesterId };
    set({ loading: true, error: null, scope });
    await reload(scope, set);
  },

  loadBySubject: async subjectId => {
    const scope: Scope = { type: 'subject', id: subjectId };
    set({ loading: true, error: null, scope });
    await reload(scope, set);
  },

  create: async input => {
    const res = await getContainer().tasks.create.execute(input);
    if (!res.ok) {
      set({ error: res.error.message });
      return false;
    }
    await reload(get().scope, set);
    return true;
  },

  update: async (id, patch) => {
    const res = await getContainer().tasks.update.execute(id, patch);
    if (!res.ok) {
      set({ error: res.error.message });
      return false;
    }
    await reload(get().scope, set);
    return true;
  },

  setStatus: async (id, status) => {
    const res = await getContainer().tasks.updateStatus.execute(id, status);
    if (!res.ok) {
      set({ error: res.error.message });
      return;
    }
    await reload(get().scope, set);
  },

  remove: async id => {
    const res = await getContainer().tasks.remove.execute(id);
    if (!res.ok) {
      set({ error: res.error.message });
      return;
    }
    await reload(get().scope, set);
  },
}));
