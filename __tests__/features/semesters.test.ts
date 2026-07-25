import type { SemesterRow } from '@features/semesters/data/dto/SemesterRow';
import type { SemesterDataSource } from '@features/semesters/data/datasources/SemesterDataSource';
import { SemesterRepositoryImpl } from '@features/semesters/data/repositories/SemesterRepositoryImpl';
import { buildSemesterUseCases } from '@features/semesters/domain/usecases/semesterUseCases';

class InMemorySemesterDataSource implements SemesterDataSource {
  rows: SemesterRow[] = [];

  async insert(row: SemesterRow) {
    this.rows.push({ ...row });
  }
  async selectAll() {
    return this.rows.map(r => ({ ...r }));
  }
  async selectById(id: string) {
    const r = this.rows.find(x => x.id === id);
    return r ? { ...r } : null;
  }
  async selectActive() {
    const r = this.rows.find(x => x.is_active === 1);
    return r ? { ...r } : null;
  }
  async updateFields(id: string, name: string, s: string, e: string) {
    const r = this.rows.find(x => x.id === id);
    if (r) {
      r.name = name;
      r.start_date = s;
      r.end_date = e;
    }
  }
  async deleteById(id: string) {
    this.rows = this.rows.filter(r => r.id !== id);
  }
  async setActive(id: string) {
    this.rows.forEach(r => (r.is_active = 0));
    const r = this.rows.find(x => x.id === id);
    if (r) {
      r.is_active = 1;
      r.is_archived = 0;
    }
  }
  async setArchived(id: string, archived: boolean) {
    const r = this.rows.find(x => x.id === id);
    if (r) {
      r.is_archived = archived ? 1 : 0;
      r.is_active = 0;
    }
  }
}

function setup() {
  const ds = new InMemorySemesterDataSource();
  const repo = new SemesterRepositoryImpl(ds);
  const uc = buildSemesterUseCases(repo);
  return { ds, repo, uc };
}

const validInput = {
  name: '2026-1',
  startDate: '2026-01-20',
  endDate: '2026-06-10',
};

describe('semesters', () => {
  it('crea y lista un semestre', async () => {
    const { uc } = setup();
    const created = await uc.create.execute(validInput);
    expect(created.ok).toBe(true);

    const list = await uc.list.execute();
    expect(list.ok && list.value).toHaveLength(1);
    expect(list.ok && list.value[0].name).toBe('2026-1');
  });

  it('rechaza nombre vacío', async () => {
    const { uc } = setup();
    const res = await uc.create.execute({ ...validInput, name: '   ' });
    expect(res.ok).toBe(false);
    expect(!res.ok && res.error.code).toBe('validation');
  });

  it('rechaza fin anterior al inicio', async () => {
    const { uc } = setup();
    const res = await uc.create.execute({
      ...validInput,
      startDate: '2026-06-10',
      endDate: '2026-01-20',
    });
    expect(res.ok).toBe(false);
  });

  it('activa un único semestre a la vez', async () => {
    const { uc, repo } = setup();
    const a = await repo.create(validInput);
    const b = await repo.create({ ...validInput, name: '2026-2' });

    await uc.setActive.execute(a.id);
    await uc.setActive.execute(b.id);

    const list = await repo.list();
    expect(list.filter(s => s.isActive)).toHaveLength(1);
    expect(list.find(s => s.isActive)?.id).toBe(b.id);
  });

  it('no permite activar un semestre archivado', async () => {
    const { uc, repo } = setup();
    const a = await repo.create(validInput);
    await uc.archive.execute(a.id, true);

    const res = await uc.setActive.execute(a.id);
    expect(res.ok).toBe(false);
    expect(!res.ok && res.error.code).toBe('conflict');
  });

  it('archivar desactiva el semestre', async () => {
    const { uc, repo } = setup();
    const a = await repo.create(validInput);
    await uc.setActive.execute(a.id);
    await uc.archive.execute(a.id, true);

    const active = await repo.getActive();
    expect(active).toBeNull();
  });

  it('elimina un semestre', async () => {
    const { uc, repo } = setup();
    const a = await repo.create(validInput);
    await uc.remove.execute(a.id);
    expect(await repo.list()).toHaveLength(0);
  });
});
