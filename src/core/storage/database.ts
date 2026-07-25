// src/core/storage/database.ts

/** Valores admitidos como parámetros y celdas en SQL. */
export type SqlValue = string | number | null;

export type Row = Record<string, SqlValue>;

export interface QueryResult {
  rows: Row[];
  rowsAffected: number;
  insertId?: number;
}

/** Subconjunto de la base disponible dentro de una transacción. */
export interface Queryable {
  execute(sql: string, params?: SqlValue[]): Promise<QueryResult>;
}

/**
 * Adapter de base de datos. Aísla al resto de la app del motor concreto
 * (op-sqlite en producción, un doble en tests).
 */
export interface Database extends Queryable {
  transaction(fn: (tx: Queryable) => Promise<void>): Promise<void>;
}
