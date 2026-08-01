import type { TaskRow } from '@features/tasks/data/dto/TaskRow';
import type { TaskDataSource } from '@features/tasks/data/datasources/TaskDataSource';
import { TaskRepositoryImpl } from '@features/tasks/data/repositories/TaskRepositoryImpl';
import { buildTaskUseCases } from '@features/tasks/domain/usecases/taskUseCases';

/**
 * Fake en memoria. Recibe el mapeo subject → semester para poder resolver
 * las consultas por semestre/fecha que en SQLite se hacen con JOIN.
 */
class InMemoryTaskDataSource implements TaskDataSource {
  rows: TaskRow[] = [];

  constructor(private readonly subjectSemester: Record<string, string> = {}) {}

  async insert(row: TaskRow) {
    this.rows.push({ ...row });
  }
  async selectBySemester(semesterId: string) {
    return this.rows
      .filter(r => this.subjectSemester[r.subject_id] === semesterId)
      .map(r => ({ ...r }));
  }
  async selectBySubject(subjectId: string) {
    return this.rows.filter(r => r.subject_id === subjectId).map(r => ({ ...r }));
  }
  async selectByDate(semesterId: string, dateKey: string) {
    return this.rows
      .filter(
        r =>
          this.subjectSemester[r.subject_id] === semesterId &&
          r.due_date === dateKey,
      )
      .map(r => ({ ...r }));
  }
  async selectById(id: string) {
    const r = this.rows.find(x => x.id === id);
    return r ? { ...r } : null;
  }
  async update(row: TaskRow) {
    const i = this.rows.findIndex(x => x.id === row.id);
    if (i >= 0) {
      this.rows[i] = { ...row };
    }
  }
  async updateStatus(id: string, status: string, completedAt: string | null) {
    const r = this.rows.find(x => x.id === id);
    if (r) {
      r.status = status;
      r.completed_at = completedAt;
    }
  }
  async deleteById(id: string) {
    this.rows = this.rows.filter(r => r.id !== id);
  }
}

/** Reloj controlable: el repo lo usa para sellar created_at/completed_at. */
function fakeClock(start = '2026-03-01T08:00:00.000Z') {
  const clock = { value: start };
  return { clock, now: () => clock.value };
}

function setup() {
  const ds = new InMemoryTaskDataSource({ 'subj-1': 'sem-1', 'subj-2': 'sem-1' });
  const { clock, now } = fakeClock();
  const repo = new TaskRepositoryImpl(ds, now);
  const uc = buildTaskUseCases(repo);
  return { ds, repo, uc, clock };
}

const input = {
  subjectId: 'subj-1',
  title: 'Entregar informe',
  dueDate: '2026-03-15',
};

describe('tasks', () => {
  it('crea una tarea con estado pendiente y prioridad media por defecto', async () => {
    const { uc } = setup();
    const res = await uc.create.execute(input);
    expect(res.ok).toBe(true);
    expect(res.ok && res.value.status).toBe('pending');
    expect(res.ok && res.value.priority).toBe('medium');
  });

  it('rechaza tarea sin título', async () => {
    const { uc } = setup();
    const res = await uc.create.execute({ ...input, title: '  ' });
    expect(res.ok).toBe(false);
  });

  it('lista tareas por materia y por semestre', async () => {
    const { uc } = setup();
    await uc.create.execute(input);
    await uc.create.execute({ ...input, subjectId: 'subj-2', title: 'Quiz' });

    const bySubject = await uc.listBySubject.execute('subj-1');
    expect(bySubject.ok && bySubject.value).toHaveLength(1);

    const bySemester = await uc.listBySemester.execute('sem-1');
    expect(bySemester.ok && bySemester.value).toHaveLength(2);
  });

  it('lista tareas por fecha de entrega', async () => {
    const { uc } = setup();
    await uc.create.execute(input);
    await uc.create.execute({ ...input, dueDate: '2026-04-01', title: 'Otra' });

    const res = await uc.listByDate.execute('sem-1', '2026-03-15');
    expect(res.ok && res.value).toHaveLength(1);
    expect(res.ok && res.value[0].title).toBe('Entregar informe');
  });

  it('cambia el estado de una tarea', async () => {
    const { uc, repo } = setup();
    const created = await repo.create(input);
    const res = await uc.updateStatus.execute(created.id, 'done');
    expect(res.ok && res.value.status).toBe('done');
  });

  it('sella created_at al crear y deja completed_at vacío', async () => {
    const { repo } = setup();
    const created = await repo.create(input);
    expect(created.createdAt).toBe('2026-03-01T08:00:00.000Z');
    expect(created.completedAt).toBeUndefined();
  });

  it('sella completed_at al marcar como hecha', async () => {
    const { uc, repo, clock } = setup();
    const created = await repo.create(input);

    clock.value = '2026-03-14T17:30:00.000Z';
    const done = await uc.updateStatus.execute(created.id, 'done');

    expect(done.ok && done.value.completedAt).toBe('2026-03-14T17:30:00.000Z');
    // La fecha de creación no se toca al completar.
    expect(done.ok && done.value.createdAt).toBe('2026-03-01T08:00:00.000Z');
  });

  it('borra completed_at al reabrir una tarea', async () => {
    const { uc, repo, clock } = setup();
    const created = await repo.create(input);
    clock.value = '2026-03-14T17:30:00.000Z';
    await uc.updateStatus.execute(created.id, 'done');

    const reopened = await uc.updateStatus.execute(created.id, 'pending');

    expect(reopened.ok && reopened.value.completedAt).toBeUndefined();
  });

  it('conserva la fecha de completado al editar una tarea ya hecha', async () => {
    const { uc, repo, clock } = setup();
    const created = await repo.create(input);
    clock.value = '2026-03-14T17:30:00.000Z';
    await uc.updateStatus.execute(created.id, 'done');

    clock.value = '2026-04-20T09:00:00.000Z';
    const edited = await uc.update.execute(created.id, { title: 'Informe v2' });

    // Completar ocurrió una vez; renombrarla después no lo cambia.
    expect(edited.ok && edited.value.completedAt).toBe('2026-03-14T17:30:00.000Z');
  });

  it('sella completed_at cuando el estado pasa a hecha vía update', async () => {
    const { uc, repo, clock } = setup();
    const created = await repo.create(input);

    clock.value = '2026-03-20T12:00:00.000Z';
    const edited = await uc.update.execute(created.id, { status: 'done' });

    expect(edited.ok && edited.value.completedAt).toBe('2026-03-20T12:00:00.000Z');
  });

  it('actualiza y elimina una tarea', async () => {
    const { uc, repo } = setup();
    const created = await repo.create(input);
    const updated = await uc.update.execute(created.id, {
      title: 'Informe final',
      priority: 'high',
    });
    expect(updated.ok && updated.value.title).toBe('Informe final');
    expect(updated.ok && updated.value.priority).toBe('high');

    await uc.remove.execute(created.id);
    expect(await repo.listBySubject('subj-1')).toHaveLength(0);
  });
});
