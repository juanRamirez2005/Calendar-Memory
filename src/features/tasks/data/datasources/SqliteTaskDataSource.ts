// src/features/tasks/data/datasources/SqliteTaskDataSource.ts
import type { Database } from '@core/storage/database';
import type { TaskRow } from '../dto/TaskRow';
import type { TaskDataSource } from './TaskDataSource';

const COLUMNS =
  'id, subject_id, title, description, due_date, status, priority, created_at, completed_at';
const T_COLUMNS =
  't.id, t.subject_id, t.title, t.description, t.due_date, t.status, t.priority, t.created_at, t.completed_at';

export class SqliteTaskDataSource implements TaskDataSource {
  constructor(private readonly db: Database) {}

  async insert(row: TaskRow): Promise<void> {
    await this.db.execute(
      `INSERT INTO tasks (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.subject_id,
        row.title,
        row.description,
        row.due_date,
        row.status,
        row.priority,
        row.created_at,
        row.completed_at,
      ],
    );
  }

  async selectBySemester(semesterId: string): Promise<TaskRow[]> {
    const res = await this.db.execute(
      `SELECT ${T_COLUMNS} FROM tasks t
       JOIN subjects s ON s.id = t.subject_id
       WHERE s.semester_id = ?
       ORDER BY t.due_date IS NULL, t.due_date ASC`,
      [semesterId],
    );
    return res.rows as TaskRow[];
  }

  async selectBySubject(subjectId: string): Promise<TaskRow[]> {
    const res = await this.db.execute(
      `SELECT ${COLUMNS} FROM tasks WHERE subject_id = ?
       ORDER BY due_date IS NULL, due_date ASC`,
      [subjectId],
    );
    return res.rows as TaskRow[];
  }

  async selectByDate(semesterId: string, dateKey: string): Promise<TaskRow[]> {
    const res = await this.db.execute(
      `SELECT ${T_COLUMNS} FROM tasks t
       JOIN subjects s ON s.id = t.subject_id
       WHERE s.semester_id = ? AND t.due_date = ?
       ORDER BY t.priority DESC`,
      [semesterId, dateKey],
    );
    return res.rows as TaskRow[];
  }

  async selectById(id: string): Promise<TaskRow | null> {
    const res = await this.db.execute(
      `SELECT ${COLUMNS} FROM tasks WHERE id = ?`,
      [id],
    );
    return (res.rows[0] as TaskRow) ?? null;
  }

  async update(row: TaskRow): Promise<void> {
    await this.db.execute(
      `UPDATE tasks SET subject_id = ?, title = ?, description = ?, due_date = ?, status = ?, priority = ?, completed_at = ?
       WHERE id = ?`,
      [
        row.subject_id,
        row.title,
        row.description,
        row.due_date,
        row.status,
        row.priority,
        row.completed_at,
        row.id,
      ],
    );
  }

  async updateStatus(
    id: string,
    status: string,
    completedAt: string | null,
  ): Promise<void> {
    await this.db.execute(
      'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?',
      [status, completedAt, id],
    );
  }

  async deleteById(id: string): Promise<void> {
    await this.db.execute('DELETE FROM tasks WHERE id = ?', [id]);
  }
}
