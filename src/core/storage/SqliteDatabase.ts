// src/core/storage/SqliteDatabase.ts
import { open, type DB, type Scalar } from '@op-engineering/op-sqlite';
import type { Database, Queryable, QueryResult, Row, SqlValue } from './database';

function toResult(r: {
  rows?: Array<Record<string, Scalar>>;
  rowsAffected: number;
  insertId?: number;
}): QueryResult {
  return {
    rows: (r.rows ?? []) as unknown as Row[],
    rowsAffected: r.rowsAffected,
    insertId: r.insertId,
  };
}

/** Implementación de {@link Database} sobre op-sqlite. */
export class SqliteDatabase implements Database {
  private readonly db: DB;

  constructor(name: string) {
    this.db = open({ name });
  }

  async execute(sql: string, params?: SqlValue[]): Promise<QueryResult> {
    const r = await this.db.execute(sql, params as Scalar[] | undefined);
    return toResult(r);
  }

  async transaction(fn: (tx: Queryable) => Promise<void>): Promise<void> {
    await this.db.transaction(async tx => {
      const queryable: Queryable = {
        execute: async (sql, params) =>
          toResult(await tx.execute(sql, params as Scalar[] | undefined)),
      };
      await fn(queryable);
    });
  }
}
