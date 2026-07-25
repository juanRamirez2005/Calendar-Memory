// src/core/storage/SqliteKeyValueStore.ts
import type { Database } from './database';
import type { KeyValueStore } from './keyValue';

/**
 * Implementación de {@link KeyValueStore} sobre SQLite.
 *
 * Mantiene una caché en memoria (hidratada una vez al arrancar con {@link hydrate})
 * para poder exponer una API síncrona de lectura; las escrituras persisten en la
 * tabla `preferences` de forma asíncrona. Evita depender de módulos nativos extra.
 */
export class SqliteKeyValueStore implements KeyValueStore {
  private readonly cache = new Map<string, string>();

  constructor(private readonly db: Database) {}

  /** Carga todas las preferencias en la caché. Llamar una vez antes de usar. */
  async hydrate(): Promise<void> {
    const res = await this.db.execute('SELECT key, value FROM preferences');
    this.cache.clear();
    for (const row of res.rows) {
      this.cache.set(String(row.key), String(row.value));
    }
  }

  getString(key: string): string | undefined {
    return this.cache.get(key);
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.cache.get(key);
    return value === undefined ? undefined : value === 'true';
  }

  getNumber(key: string): number | undefined {
    const value = this.cache.get(key);
    return value === undefined ? undefined : Number(value);
  }

  set(key: string, value: string | number | boolean): void {
    const str = String(value);
    this.cache.set(key, str);
    void this.db.execute(
      `INSERT INTO preferences (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, str],
    );
  }

  remove(key: string): void {
    this.cache.delete(key);
    void this.db.execute('DELETE FROM preferences WHERE key = ?', [key]);
  }

  contains(key: string): boolean {
    return this.cache.has(key);
  }
}
