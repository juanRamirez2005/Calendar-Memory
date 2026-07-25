// src/core/storage/keyValue.ts

/** Adapter clave-valor para preferencias (implementado sobre SQLite). */
export interface KeyValueStore {
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  set(key: string, value: string | number | boolean): void;
  remove(key: string): void;
  contains(key: string): boolean;
}
