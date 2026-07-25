// src/core/storage/migrations/index.ts
import type { Database } from '../database';

/**
 * Migraciones ordenadas del esquema. El índice del array + 1 es la versión
 * (PRAGMA user_version) que deja aplicada cada migración.
 */
const migrations: Array<(db: Database) => Promise<void>> = [
  // v1 — esquema inicial: semesters → subjects → tasks
  async db => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS semesters (
        id          TEXT PRIMARY KEY NOT NULL,
        name        TEXT NOT NULL,
        start_date  TEXT NOT NULL,
        end_date    TEXT NOT NULL,
        is_active   INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id          TEXT PRIMARY KEY NOT NULL,
        semester_id TEXT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
        name        TEXT NOT NULL,
        code        TEXT,
        color       TEXT NOT NULL,
        professor   TEXT,
        credits     INTEGER
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          TEXT PRIMARY KEY NOT NULL,
        subject_id  TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        title       TEXT NOT NULL,
        description TEXT,
        due_date    TEXT,
        status      TEXT NOT NULL DEFAULT 'pending',
        priority    TEXT NOT NULL DEFAULT 'medium'
      );
    `);
    await db.execute(
      'CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester_id);',
    );
    await db.execute(
      'CREATE INDEX IF NOT EXISTS idx_tasks_subject ON tasks(subject_id);',
    );
    await db.execute(
      'CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);',
    );
  },
  // v2 — preferencias clave-valor (reemplaza a MMKV)
  async db => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS preferences (
        key   TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  },
];

/**
 * Habilita las FK y aplica las migraciones pendientes según PRAGMA user_version.
 * Debe llamarse una vez al arrancar, antes de usar cualquier repositorio.
 */
export async function runMigrations(db: Database): Promise<void> {
  await db.execute('PRAGMA foreign_keys = ON;');
  const res = await db.execute('PRAGMA user_version;');
  const current = Number(res.rows[0]?.user_version ?? 0);

  for (let version = current; version < migrations.length; version++) {
    await migrations[version](db);
    // PRAGMA no admite parámetros vinculados; la versión es un entero controlado.
    await db.execute(`PRAGMA user_version = ${version + 1};`);
  }
}
