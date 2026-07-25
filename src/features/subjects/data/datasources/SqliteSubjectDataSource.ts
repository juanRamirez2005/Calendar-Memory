// src/features/subjects/data/datasources/SqliteSubjectDataSource.ts
import type { Database } from '@core/storage/database';
import type { SubjectRow } from '../dto/SubjectRow';
import type { SubjectDataSource } from './SubjectDataSource';

const COLUMNS = 'id, semester_id, name, code, color, professor, credits';

export class SqliteSubjectDataSource implements SubjectDataSource {
  constructor(private readonly db: Database) {}

  async insert(row: SubjectRow): Promise<void> {
    await this.db.execute(
      `INSERT INTO subjects (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.semester_id,
        row.name,
        row.code,
        row.color,
        row.professor,
        row.credits,
      ],
    );
  }

  async selectBySemester(semesterId: string): Promise<SubjectRow[]> {
    const res = await this.db.execute(
      `SELECT ${COLUMNS} FROM subjects WHERE semester_id = ? ORDER BY name COLLATE NOCASE`,
      [semesterId],
    );
    return res.rows as SubjectRow[];
  }

  async selectById(id: string): Promise<SubjectRow | null> {
    const res = await this.db.execute(
      `SELECT ${COLUMNS} FROM subjects WHERE id = ?`,
      [id],
    );
    return (res.rows[0] as SubjectRow) ?? null;
  }

  async update(row: SubjectRow): Promise<void> {
    await this.db.execute(
      'UPDATE subjects SET name = ?, code = ?, color = ?, professor = ?, credits = ? WHERE id = ?',
      [row.name, row.code, row.color, row.professor, row.credits, row.id],
    );
  }

  async deleteById(id: string): Promise<void> {
    await this.db.execute('DELETE FROM subjects WHERE id = ?', [id]);
  }
}
