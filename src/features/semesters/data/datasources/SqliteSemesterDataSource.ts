// src/features/semesters/data/datasources/SqliteSemesterDataSource.ts
import type { Database } from '@core/storage/database';
import type { SemesterRow } from '../dto/SemesterRow';
import type { SemesterDataSource } from './SemesterDataSource';

const COLUMNS = 'id, name, start_date, end_date, is_active, is_archived';

export class SqliteSemesterDataSource implements SemesterDataSource {
  constructor(private readonly db: Database) {}

  async insert(row: SemesterRow): Promise<void> {
    await this.db.execute(
      `INSERT INTO semesters (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.name,
        row.start_date,
        row.end_date,
        row.is_active,
        row.is_archived,
      ],
    );
  }

  async selectAll(): Promise<SemesterRow[]> {
    const res = await this.db.execute(
      `SELECT ${COLUMNS} FROM semesters ORDER BY start_date DESC`,
    );
    return res.rows as SemesterRow[];
  }

  async selectById(id: string): Promise<SemesterRow | null> {
    const res = await this.db.execute(
      `SELECT ${COLUMNS} FROM semesters WHERE id = ?`,
      [id],
    );
    return (res.rows[0] as SemesterRow) ?? null;
  }

  async selectActive(): Promise<SemesterRow | null> {
    const res = await this.db.execute(
      `SELECT ${COLUMNS} FROM semesters WHERE is_active = 1 LIMIT 1`,
    );
    return (res.rows[0] as SemesterRow) ?? null;
  }

  async updateFields(
    id: string,
    name: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    await this.db.execute(
      'UPDATE semesters SET name = ?, start_date = ?, end_date = ? WHERE id = ?',
      [name, startDate, endDate, id],
    );
  }

  async deleteById(id: string): Promise<void> {
    await this.db.execute('DELETE FROM semesters WHERE id = ?', [id]);
  }

  async setActive(id: string): Promise<void> {
    await this.db.transaction(async tx => {
      await tx.execute('UPDATE semesters SET is_active = 0');
      await tx.execute(
        'UPDATE semesters SET is_active = 1, is_archived = 0 WHERE id = ?',
        [id],
      );
    });
  }

  async setArchived(id: string, archived: boolean): Promise<void> {
    // Archivar implica desactivar; desarchivar deja el semestre inactivo.
    await this.db.execute(
      'UPDATE semesters SET is_archived = ?, is_active = 0 WHERE id = ?',
      [archived ? 1 : 0, id],
    );
  }
}
