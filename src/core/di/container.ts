// src/core/di/container.ts
import type { Database } from '@core/storage/database';
import type { KeyValueStore } from '@core/storage/keyValue';
import { SqliteDatabase } from '@core/storage/SqliteDatabase';
import { SqliteKeyValueStore } from '@core/storage/SqliteKeyValueStore';
import { runMigrations } from '@core/storage/migrations';
import { Preferences } from '@core/config/preferences';

import { SqliteSemesterDataSource } from '@features/semesters/data/datasources/SqliteSemesterDataSource';
import { SemesterRepositoryImpl } from '@features/semesters/data/repositories/SemesterRepositoryImpl';
import {
  buildSemesterUseCases,
  type SemesterUseCases,
} from '@features/semesters/domain/usecases/semesterUseCases';

import { SqliteSubjectDataSource } from '@features/subjects/data/datasources/SqliteSubjectDataSource';
import { SubjectRepositoryImpl } from '@features/subjects/data/repositories/SubjectRepositoryImpl';
import {
  buildSubjectUseCases,
  type SubjectUseCases,
} from '@features/subjects/domain/usecases/subjectUseCases';

import { SqliteTaskDataSource } from '@features/tasks/data/datasources/SqliteTaskDataSource';
import { TaskRepositoryImpl } from '@features/tasks/data/repositories/TaskRepositoryImpl';
import {
  buildTaskUseCases,
  type TaskUseCases,
} from '@features/tasks/domain/usecases/taskUseCases';

import type { NotificationService } from '@features/notifications/domain/NotificationService';
import { NotifeeNotificationService } from '@features/notifications/data/NotifeeNotificationService';

export type Container = {
  db: Database;
  prefs: KeyValueStore;
  preferences: Preferences;
  semesters: SemesterUseCases;
  subjects: SubjectUseCases;
  tasks: TaskUseCases;
  notifications: NotificationService;
};

let container: Container | null = null;

/** Cablea los adapters, repositorios y use cases a partir de la base y prefs. */
export function createContainer(db: Database, prefs: KeyValueStore): Container {
  const semesterRepo = new SemesterRepositoryImpl(
    new SqliteSemesterDataSource(db),
  );
  const subjectRepo = new SubjectRepositoryImpl(new SqliteSubjectDataSource(db));
  const taskRepo = new TaskRepositoryImpl(new SqliteTaskDataSource(db));

  return {
    db,
    prefs,
    preferences: new Preferences(prefs),
    semesters: buildSemesterUseCases(semesterRepo),
    subjects: buildSubjectUseCases(subjectRepo),
    tasks: buildTaskUseCases(taskRepo),
    notifications: new NotifeeNotificationService(),
  };
}

/**
 * Re-sincroniza los recordatorios del semestre activo. Best-effort: garantiza
 * que las notificaciones existan tras reinstalar la app o limpiar alarmas.
 */
async function syncNotifications(c: Container): Promise<void> {
  try {
    await c.notifications.init();
    const active = await c.semesters.getActive.execute();
    if (!active.ok || !active.value) {
      return;
    }
    const [tasks, subjects] = await Promise.all([
      c.tasks.listBySemester.execute(active.value.id),
      c.subjects.listBySemester.execute(active.value.id),
    ]);
    if (!tasks.ok) {
      return;
    }
    const nameById = new Map(
      (subjects.ok ? subjects.value : []).map(s => [s.id, s.name]),
    );
    for (const t of tasks.value) {
      await c.notifications.scheduleForTask({
        taskId: t.id,
        title: t.title,
        subjectName: nameById.get(t.subjectId),
        dueDate: t.dueDate,
        status: t.status,
      });
    }
  } catch {
    // best-effort
  }
}

/**
 * Inicializa el contenedor de la app: abre SQLite, corre migraciones y crea
 * el singleton. Debe llamarse una vez al arrancar, antes de renderizar pantallas.
 */
export async function initContainer(): Promise<Container> {
  if (container) {
    return container;
  }
  const db = new SqliteDatabase('calendar-memory.db');
  await runMigrations(db);
  const prefs = new SqliteKeyValueStore(db);
  await prefs.hydrate();
  container = createContainer(db, prefs);
  // No bloquear el arranque: la sincronización de recordatorios corre en background.
  void syncNotifications(container);
  return container;
}

/** Acceso al contenedor ya inicializado. Lanza si aún no se ha inicializado. */
export function getContainer(): Container {
  if (!container) {
    throw new Error(
      'El contenedor DI no está inicializado. Llama a initContainer() primero.',
    );
  }
  return container;
}

/** Solo para tests: inyecta un contenedor construido con dobles. */
export function setContainerForTests(value: Container | null): void {
  container = value;
}
